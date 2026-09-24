import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4188';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4188'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-subitise-test-results',{recursive:true});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}

const initial=defaultState();
initial.profile='preschool';
initial.onboarded=true;
initial.settings.voice=false;
const saved=JSON.stringify(initial);

const cases=[
  {type:chromium,name:'chromium-phone',viewport:{width:390,height:844}},
  {type:webkit,name:'webkit-phone',viewport:{width:390,height:844}},
  {type:chromium,name:'chromium-tablet',viewport:{width:1024,height:768}},
  {type:webkit,name:'webkit-tablet',viewport:{width:820,height:1180}}
];

const learnAnswers={
  'glance-two':'rote-2',
  'build-three':'3',
  'dice-four':'rote-4',
  'dice-five':'rote-5',
  'varied-three':'rote-3',
  'varied-four':'qty-4',
  'varied-five':'rote-5',
  'same-quantity-layout':'qty-4',
  'instant-meaning':'instant',
  'game-transfer':'rote-5'
};

async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelSubitise5');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL subitising content must fit viewport width');
}
async function assertFlashGate(page,root){
  const frame=root.locator('.nel-subitise-flash-frame');
  const pattern=root.locator('.nel-subitise-flash-pattern');
  const show=root.locator('.nel-subitise-show');
  assert.equal(await frame.getAttribute('data-flash-state'),'idle','flash must begin closed');
  assert.equal(await pattern.isHidden(),true,'target pattern must be hidden before child starts');
  const responseButtons=root.locator('.nel-subitise-response button');
  const beforeCount=await responseButtons.count();
  assert.ok(beforeCount>0,'post-flash response controls must exist');
  for(let i=0;i<beforeCount;i++) assert.equal(await responseButtons.nth(i).isDisabled(),true,'all response controls must stay locked before flash');
  await show.tap();
  await page.waitForFunction(el=>el?.dataset.flashState==='showing',await frame.elementHandle());
  assert.equal(await pattern.isVisible(),true,'target pattern must be visible during the brief flash');
  assert.equal(await show.isDisabled(),true,'show control must lock immediately so a double tap cannot restart the flash');
  const duringButtons=root.locator('.nel-subitise-response button');
  for(let i=0;i<await duringButtons.count();i++) assert.equal(await duringButtons.nth(i).isDisabled(),true,'response controls must remain locked while target is visible');
  await show.evaluate(el=>el.click());
  assert.equal(await frame.getAttribute('data-flash-state'),'showing','a second activation must not restart or cancel the active flash');
  await page.waitForTimeout(180);
  assert.equal(await frame.getAttribute('data-flash-state'),'showing','brief exposure must not collapse immediately after activation');
  assert.equal(await pattern.isVisible(),true,'target must remain visible during the exposure window');
  await frame.waitFor({state:'attached'});
  await page.waitForFunction(el=>el?.dataset.flashState==='ready',await frame.elementHandle(),{timeout:3000});
  assert.equal(await pattern.isHidden(),true,'target pattern must be hidden again before answering');
  assert.equal(await root.getAttribute('data-flash-ready'),'true');
  assert.equal(await show.isHidden(),true,'flash must be one-shot after exposure');
  const afterButtons=root.locator('.nel-subitise-response button');
  for(let i=0;i<await afterButtons.count();i++) assert.equal(await afterButtons.nth(i).isEnabled(),true,'response controls unlock only after flash closes');
}

async function chooseWrongThenCorrect(page,root,attr,correct,next){
  const buttons=root.locator('['+attr+']');
  const count=await buttons.count();
  for(let i=0;i<count;i++){
    const b=buttons.nth(i);
    if(await b.getAttribute(attr)!==correct){await b.tap();break;}
  }
  assert.equal(await next.isDisabled(),true,'wrong post-flash response cannot advance');
  await root.locator('['+attr+'="'+correct+'"]').tap();
}

async function completeLearnStep(page,id){
  const root=page.locator('.nel-subitise-root');
  const next=page.locator('#nelSubitiseLessonNext');
  await assertFlashGate(page,root);
  const answer=learnAnswers[id];
  if(id==='build-three'){
    const tokens=root.locator('[data-subitise-build]');
    await tokens.nth(0).tap();
    assert.equal(await next.isDisabled(),true,'wrong remembered quantity cannot advance');
    await tokens.nth(1).tap();
    await tokens.nth(2).tap();
    return;
  }
  if(['varied-four','same-quantity-layout'].includes(id)){
    await chooseWrongThenCorrect(page,root,'data-subitise-match',answer,next);
    return;
  }
  if(id==='instant-meaning'){
    await chooseWrongThenCorrect(page,root,'data-subitise-explain-choice',answer,next);
    return;
  }
  await chooseWrongThenCorrect(page,root,'data-subitise-audio-choice',answer,next);
}

async function exercisePractice(page){
  const root=page.locator('.nel-subitise-root');
  await assertFlashGate(page,root);
  const kind=await root.getAttribute('data-subitise-kind');
  if(kind==='build'){
    await root.locator('[data-subitise-build]').first().tap();
  }else if(kind==='match'){
    await root.locator('[data-subitise-match]').first().tap();
  }else if(kind==='explain'){
    await root.locator('[data-subitise-explain-choice]').first().tap();
  }else{
    await root.locator('[data-subitise-audio-choice]').first().tap();
  }
  await page.locator('#checkManipulator').tap();
}

try{
  for(const config of cases){
    const browser=await config.type.launch({headless:true});
    const context=await browser.newContext({viewport:config.viewport,isMobile:true,hasTouch:true,serviceWorkers:'block'});
    await context.addInitScript(value=>{if(!localStorage.getItem('saymera.math.v2'))localStorage.setItem('saymera.math.v2',value)},saved);
    const page=await context.newPage();
    page.setDefaultTimeout(12000);
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try{
      await openInspector(page);
      const steps=await page.locator('#inspectorLessonStep option').evaluateAll(xs=>xs.map(x=>({index:x.value,label:x.textContent})));
      assert.equal(steps.length,10);
      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-subitise-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-subitise-step');
        const next=page.locator('#nelSubitiseLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require a post-flash child response');
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,id+' must not require numeral entry');
        await completeLearnStep(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['dice-five','varied-five','same-quantity-layout','game-transfer'].includes(id)){
          await page.screenshot({path:'preschool-subitise-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      const sections=['flash-build','flash-structured','flash-varied','explain-instant','transfer-game'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not require numeral entry');
        assert.equal(await page.locator('.nel-subitise-root').count(),1,section+' must use timed subitising interaction');
        await exercisePractice(page);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      assert.equal(await page.locator('.nel-subitise-root').count(),1,'subitising Review must preserve the timed interaction');
      await noOverflow(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (10 Subitise Learn steps; one-shot 650ms flash gate; 5 Practice sections; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-subitise-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{
      await browser.close();
    }
  }
}finally{
  server?.kill();
}
