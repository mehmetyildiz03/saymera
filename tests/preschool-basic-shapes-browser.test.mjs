import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4191';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4191'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-basic-shapes-test-results',{recursive:true});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}

const initial=defaultState();
initial.profile='preschool';
initial.onboarded=true;
initial.settings.voice=false;
const saved=JSON.stringify(initial);

const configs=[
  {type:chromium,name:'chromium-phone',viewport:{width:390,height:844}},
  {type:webkit,name:'webkit-phone',viewport:{width:390,height:844}},
  {type:chromium,name:'chromium-tablet',viewport:{width:1024,height:768}},
  {type:webkit,name:'webkit-tablet',viewport:{width:820,height:1180}}
];
const officialShapes=['circle','square','rectangle','triangle'];

async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelBasicShapes');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL basic-shapes content must fit viewport width');
}
async function targetShape(root){
  const target=root.locator('.nel-basic-shape-target [data-basic-shape], .nel-basic-shape-card [data-basic-shape]').first();
  const shape=await target.getAttribute('data-basic-shape');
  assert.ok(officialShapes.includes(shape),'target must be one of four official shapes');
  return shape;
}
async function completeLearn(page,id){
  const stage=page.locator('.nel-basic-shape-lesson-stage');
  const core=stage.locator('.nel-basic-shape-lesson-core');
  const next=page.locator('#nelBasicShapeLessonNext');

  if(['circle-match','square-rotate','triangle-turn','rectangle-turn','size-change','mixed-invariance'].includes(id)){
    const shape=await targetShape(core);
    const choices=core.locator('[data-basic-shape-choice]');
    assert.equal(await choices.count(),4,'match Learn must show exactly four basic-shape options');
    await core.locator('[data-basic-shape-choice="'+shape+'"]').tap();
    return;
  }
  if(id==='name-circle-square'||id==='name-triangle-rectangle'){
    const shape=await targetShape(core);
    assert.equal(await core.locator('[data-basic-shape-name]').count(),4,'audio naming must offer four spoken shape names');
    const labels=await core.locator('[data-basic-shape-name] span').allTextContents();
    assert.ok(labels.every(x=>x.trim()==='Dinle'),'shape-name buttons must not reveal the written answer');
    await core.locator('[data-basic-shape-name="'+shape+'"]').tap();
    return;
  }
  if(id==='explain-invariance'){
    assert.equal(await core.locator('.nel-basic-shape-pair [data-basic-shape="rectangle"]').count(),2,'invariance example must compare two rectangles');
    await core.locator('[data-shape-explain="same"]').tap();
    return;
  }
  if(id==='environment-hunt'){
    const shape=await targetShape(core);
    const contextText=(await core.locator('.nel-basic-shape-environment-grid').innerText()).toLocaleLowerCase('tr-TR');
    assert.equal(/\b(daire|kare|dikdörtgen|üçgen)\b/.test(contextText),false,'environment labels must not spell out the target shape name');
    await core.locator('[data-shape-environment="'+shape+'"]').tap();
    return;
  }
  throw new Error('Unhandled basic-shape Learn step '+id);
}
async function completePractice(page,section){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not use numeric input');
  const visual=page.locator('#visualStage');
  if(section==='match-basic-shape'){
    const root=page.locator('.nel-basic-shape-match'),shape=await targetShape(root);
    await root.locator('[data-basic-shape-choice="'+shape+'"]').tap();
    await page.locator('#checkManipulator').tap();return;
  }
  if(section==='recognise-varied-shape'){
    const shape=await targetShape(visual);
    await page.locator('[data-answer="shape-'+shape+'"]').tap();return;
  }
  if(section==='name-basic-shape'){
    const root=page.locator('.nel-basic-shape-name');
    const shape=await targetShape(root);
    const labels=await root.locator('[data-basic-shape-name] span').allTextContents();
    assert.ok(labels.every(x=>x.trim()==='Dinle'));
    await root.locator('[data-basic-shape-name="'+shape+'"]').tap();
    await page.locator('#checkManipulator').tap();return;
  }
  if(section==='explain-shape-identity'){
    await page.locator('[data-answer="Döndürmek veya boyutunu değiştirmek şeklin adını değiştirmez."]').tap();return;
  }
  if(section==='transfer-environment-shape'){
    const shape=await targetShape(visual);
    const text=(await page.locator('.visual-choice-grid').innerText()).toLocaleLowerCase('tr-TR');
    assert.equal(/\b(daire|kare|dikdörtgen|üçgen)\b/.test(text),false,'Practice environment choices must not reveal shape names as text');
    await page.locator('[data-answer="shape-'+shape+'"]').tap();return;
  }
  throw new Error('Unhandled basic-shape Practice section '+section);
}
async function completeReview(page){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,'basic-shape Review must not use numeric input');
  if(await page.locator('.nel-basic-shape-match').count()){
    const root=page.locator('.nel-basic-shape-match'),shape=await targetShape(root);
    await root.locator('[data-basic-shape-choice="'+shape+'"]').tap();await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-basic-shape-name').count()){
    const root=page.locator('.nel-basic-shape-name'),shape=await targetShape(root);
    await root.locator('[data-basic-shape-name="'+shape+'"]').tap();await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-basic-shape-pair').count()){
    await page.locator('[data-answer="Döndürmek veya boyutunu değiştirmek şeklin adını değiştirmez."]').tap();return;
  }
  if(await page.locator('#visualStage [data-basic-shape]').count()){
    const shape=await targetShape(page.locator('#visualStage'));
    await page.locator('[data-answer="shape-'+shape+'"]').tap();return;
  }
  throw new Error('Basic-shape Review response missing');
}

try{
  for(const config of configs){
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
      assert.equal(steps.length,10,'basic shapes must expose ten Learn steps');

      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-basic-shape-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-basic-shape-step');
        const next=page.locator('#nelBasicShapeLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        const childText=(await stage.innerText()).toLocaleLowerCase('tr-TR');
        assert.equal(/üç kenar|dört kenar|eşit kenar|köşe say/.test(childText),false,id+' must not teach KSD 4.2 attributes');
        await completeLearn(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);

        if(id==='square-rotate'){
          assert.ok(await stage.locator('[data-basic-shape="square"][data-shape-rotation="45"]').count()>=1,'Learn must show a rotated square, not only the upright prototype');
        }
        if(id==='triangle-turn'){
          assert.ok(await stage.locator('[data-basic-shape="triangle"][data-shape-rotation="180"]').count()>=1,'Learn must show a non-upright triangle');
        }
        if(['square-rotate','triangle-turn','environment-hunt'].includes(id)){
          await page.screenshot({path:'preschool-basic-shapes-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      for(const section of ['match-basic-shape','recognise-varied-shape','name-basic-shape','explain-shape-identity','transfer-environment-shape']){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);
        await completePractice(page,section);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);
      await completeReview(page);

      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (10 Learn; rotation/size invariance; audio naming; environment transfer; 5 Practice; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-basic-shapes-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
