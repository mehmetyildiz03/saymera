import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4188';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4188'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-number-representations-test-results',{recursive:true});
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

async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelNumberRepresentations10');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL number-representation content must fit viewport width');
}
async function assertQuantityReadable(page,root=page.locator('#practiceContent')){
  const models=root.locator('[data-number-model]');
  const count=await models.count();
  assert.ok(count>=1,'quantity representation must render at least one model');
  for(let i=0;i<count;i++){
    const box=await models.nth(i).boundingBox();
    assert.ok(box&&box.width>=120&&box.height>=70,'quantity model must remain visibly readable');
  }
}
async function clickSpeech(root){
  const listen=root.locator('[data-rote-speech]').first();
  assert.equal(await listen.count(),1,'spoken number-name control must exist');
  await listen.tap();
}
async function completeLearnStep(page,id){
  const stage=page.locator('.nel-number-lesson-stage');
  const core=stage.locator('.nel-number-lesson-core');
  const next=page.locator('#nelNumberLessonNext');

  if(id==='quantity-name-four'){
    await assertQuantityReadable(page,core);
    const confirm=page.locator('#nelNumberConfirm');
    assert.equal(await confirm.isDisabled(),true,'spoken-name step cannot be acknowledged before listening');
    await clickSpeech(core);
    assert.equal(await confirm.isEnabled(),true,'listening must unlock the quantity/name acknowledgement');
    await confirm.tap();
    return;
  }
  if(id==='quantity-numeral-four'){
    await assertQuantityReadable(page,core);
    assert.equal((await core.locator('.nel-number-form-card.numeral.hero').textContent()||'').trim(),'4');
    await page.locator('#nelNumberConfirm').tap();
    return;
  }
  if(id==='same-five-models'){
    const seen=[];
    for(let i=0;i<4;i++){
      const model=core.locator('[data-number-model]').first();
      seen.push(await model.getAttribute('data-number-model'));
      const box=await model.boundingBox();
      assert.ok(box&&box.width>=120&&box.height>=70,'model '+seen.at(-1)+' must be readable');
      await page.locator('#nelNumberNextModel').tap();
    }
    assert.deepEqual(seen,['objects','fingers','ten-frame','tally'],'Learn must expose the four NEL-aligned quantity representations');
    return;
  }
  if(id==='numeral-name-six'){
    const confirm=page.locator('#nelNumberConfirm');
    assert.equal(await confirm.isDisabled(),true,'numeral/name link requires listening to the spoken name');
    await clickSpeech(core);
    assert.equal(await confirm.isEnabled(),true);
    await confirm.tap();
    return;
  }
  if(id==='words-one-five'||id==='words-six-ten'){
    const cards=core.locator('[data-number-word-card]');
    assert.equal(await cards.count(),5,'word-deck step must teach five number words');
    for(let i=0;i<5;i++){
      const card=cards.nth(i);
      const ack=card.locator('[data-number-word-open]');
      assert.equal(await ack.isDisabled(),true,'written word card must stay gated until its spoken name is heard');
      await card.locator('[data-number-word-listen]').tap();
      assert.equal(await ack.isEnabled(),true,'listening unlocks the written-word acknowledgement');
      await ack.tap();
      assert.ok((await card.locator('b').textContent()||'').trim().length>0,'written number word must be visible');
    }
    return;
  }
  if(id==='word-quantity-eight'){
    await core.locator('[data-number-lesson-quantity="7"]').tap();
    assert.equal(await next.isDisabled(),true,'wrong word-to-quantity link cannot advance');
    await core.locator('[data-number-lesson-quantity="8"]').tap();
    return;
  }
  if(id==='four-way-nine'){
    for(const part of ['numeral','word','quantity']) await core.locator('[data-number-four-part="'+part+'"]').tap();
    assert.equal(await next.isDisabled(),true,'visible forms alone are insufficient; spoken number name must also be heard');
    await clickSpeech(core);
    return;
  }
  if(id==='mixed-seven'){
    const options=core.locator('[data-number-mixed]');
    for(let i=0;i<await options.count();i++) assert.equal(await options.nth(i).isDisabled(),true,'mixed matching stays locked until target number name is heard');
    await clickSpeech(core);
    for(let i=0;i<await options.count();i++) assert.equal(await options.nth(i).isEnabled(),true);
    await core.locator('[data-number-mixed="6"]').tap();
    assert.equal(await next.isDisabled(),true,'wrong mixed representation cannot advance');
    await core.locator('[data-number-mixed="7"]').tap();
    return;
  }
  if(id==='real-world-ten'){
    assert.equal(await core.locator('.nel-number-real-world').count(),1,'transfer step must leave the screen and use a daily-life number context');
    await page.locator('#nelNumberConfirm').tap();
    return;
  }
  throw new Error('Unhandled number representation Learn step '+id);
}

async function exercisePractice(page,section){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not require numeral writing/input');
  if(section==='build-quantity-link'){
    const root=page.locator('.nel-number-link-builder');
    const n=await root.locator('[data-number-quantity]').first().getAttribute('data-number-quantity');
    await root.locator('[data-nel-number-link="numeral-'+n+'"]').tap();
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(section==='see-same-number'){
    const n=await page.locator('#visualStage [data-number-quantity]').first().getAttribute('data-number-quantity');
    await page.locator('[data-answer="quantity-'+n+'"]').tap();
    return;
  }
  if(section==='match-name-numeral-word'){
    const root=page.locator('.nel-number-form-match');
    const name=await root.getAttribute('data-number-name');
    assert.match(name||'',/^name-\d+$/);
    const n=(name||'').replace('name-','');
    await root.locator('[data-nel-number-numeral="numeral-'+n+'"]').tap();
    await root.locator('[data-nel-number-word="word-'+n+'"]').tap();
    assert.match((await page.locator('#manipulatorStatus').textContent())||'',/Önce sayı adını dinle/i,'visual forms alone must not complete spoken-number evidence');
    await page.locator('#checkManipulator').tap();
    assert.equal(await page.locator('.feedback-card').count(),0,'Practice must not submit before the spoken number name is heard');
    await root.locator('[data-rote-speech]').tap();
    assert.match((await page.locator('#manipulatorStatus').textContent())||'',/hazır/i);
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(section==='explain-equivalent-forms'){
    assert.equal(await page.locator('.nel-number-equivalent-set').count(),1);
    await page.locator('[data-answer="Hepsi aynı miktarı farklı biçimde gösteriyor."]').tap();
    return;
  }
  if(section==='transfer-number-context'){
    const tag=page.locator('.nel-number-context-tag');
    const n=(await tag.locator('strong').textContent()||'').trim();
    const context=(await tag.getAttribute('data-number-context')||'').toLocaleLowerCase('tr-TR');
    assert.match(n,/^(10|[1-9])$/);
    assert.ok(['alışveriş listesi','tarif kartı','oyun kartı','malzeme etiketi'].some(x=>context===x),'transfer must use a quantity-bearing daily-life context');
    assert.equal(/kapı|otobüs|takvim|dolap/.test(context),false,'nominal/date/location number contexts must not stand in for quantity evidence');
    await page.locator('[data-answer="quantity-'+n+'"]').tap();
    return;
  }
  throw new Error('Unhandled number-representation Practice section '+section);
}

async function exerciseReview(page){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,'number-representation Review must not require numeral writing');
  if(await page.locator('.nel-number-link-builder').count()){
    const root=page.locator('.nel-number-link-builder');
    const n=await root.locator('[data-number-quantity]').first().getAttribute('data-number-quantity');
    await root.locator('[data-nel-number-link="numeral-'+n+'"]').tap();
    await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-number-form-match').count()){
    const root=page.locator('.nel-number-form-match'),name=await root.getAttribute('data-number-name'),n=(name||'').replace('name-','');
    await root.locator('[data-rote-speech]').tap();
    await root.locator('[data-nel-number-numeral="numeral-'+n+'"]').tap();
    await root.locator('[data-nel-number-word="word-'+n+'"]').tap();
    await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-number-context-tag').count()){
    const n=(await page.locator('.nel-number-context-tag strong').textContent()||'').trim();
    await page.locator('[data-answer="quantity-'+n+'"]').tap();return;
  }
  if(await page.locator('.nel-number-equivalent-set').count()){
    await page.locator('[data-answer="Hepsi aynı miktarı farklı biçimde gösteriyor."]').tap();return;
  }
  if(await page.locator('#visualStage [data-number-quantity]').count()){
    const n=await page.locator('#visualStage [data-number-quantity]').first().getAttribute('data-number-quantity');
    await page.locator('[data-answer="quantity-'+n+'"]').tap();return;
  }
  throw new Error('Number-representation Review response missing');
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
      assert.equal(steps.length,10,'number representations must expose all ten Learn steps');
      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-number-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-number-step');
        const next=page.locator('#nelNumberLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,id+' must not require numeral writing');
        await completeLearnStep(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['same-five-models','words-six-ten','word-quantity-eight','four-way-nine','mixed-seven','real-world-ten'].includes(id)){
          await page.screenshot({path:'preschool-number-representations-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      const sections=['build-quantity-link','see-same-number','match-name-numeral-word','explain-equivalent-forms','transfer-number-context'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);
        await exercisePractice(page,section);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);
      await exerciseReview(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (10 Learn steps; spoken/written distinction; four quantity models; 5 Practice sections; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-number-representations-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
