import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4188';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4188'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-order-test-results',{recursive:true});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const initial=defaultState();initial.profile='preschool';initial.onboarded=true;initial.settings.voice=false;
const saved=JSON.stringify(initial);
const cases=[
  {type:chromium,name:'chromium-phone',viewport:{width:390,height:844}},
  {type:webkit,name:'webkit-phone',viewport:{width:390,height:844}},
  {type:chromium,name:'chromium-tablet',viewport:{width:1024,height:768}},
  {type:webkit,name:'webkit-tablet',viewport:{width:820,height:1180}}
];
const expectedByStep={
  'order-size':['lesson-order-size-small','lesson-order-size-medium','lesson-order-size-large'],
  'reverse-size':['lesson-order-size-large','lesson-order-size-medium','lesson-order-size-small'],
  'order-length':['lesson-order-length-short','lesson-order-length-medium','lesson-order-length-long'],
  'order-height':['lesson-order-height-low','lesson-order-height-mid','lesson-order-height-tall'],
  'event-order':['lesson-event-wet','lesson-event-soap','lesson-event-rinse']
};
async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelOrderAttributes');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL ordering content must fit viewport width');
}
async function tapOrder(page,ids){
  for(const id of ids) await page.locator('[data-nel-order-item="'+id+'"]').tap();
}
async function completeLearnStep(page,id){
  const next=page.locator('#nelOrderLessonNext');
  if(expectedByStep[id]){
    const source=await page.locator('[data-nel-order-item]').evaluateAll(xs=>xs.map(x=>x.dataset.nelOrderItem));
    await tapOrder(page,source);
    assert.equal(await next.isDisabled(),true,id+' wrong order cannot advance');
    assert.ok((await page.locator('#nelOrderHelp').textContent()||'').trim().length>0,id+' wrong order must explain what to reconsider');
    await page.locator('.nel-order-reset').tap();
    assert.equal(await page.locator('[data-nel-order-item][data-order-index]').count(),0,id+' reset must clear placed order');
    await tapOrder(page,expectedByStep[id]);
    return;
  }
  if(id==='choose-order'){
    await page.locator('.nel-order-option[data-correct="false"]').first().tap();
    assert.equal(await next.isDisabled(),true,'wrong order preview cannot advance');
    await page.locator('.nel-order-option[data-correct="true"]').tap();
    return;
  }
  if(id==='explain-order'){
    await page.locator('.nel-order-reason[data-correct="false"]').first().tap();
    assert.equal(await next.isDisabled(),true,'wrong order rule cannot advance');
    await page.locator('.nel-order-reason[data-correct="true"]').tap();
    return;
  }
  if(id==='real-world-order'){
    await page.locator('#nelOrderDone').tap();
    return;
  }
  throw new Error('Unhandled order Learn step '+id);
}
async function completePracticeQuestion(page){
  const builder=page.locator('.nel-order-builder');
  if(await builder.count()){
    const items=await builder.locator('[data-nel-order-item]').evaluateAll(xs=>xs.map(x=>x.dataset.nelOrderItem));
    await tapOrder(page,items);
    assert.equal(await builder.locator('[data-nel-order-item][data-order-index]').count(),items.length,'all order cards must be placeable by touch');
    await page.locator('#checkManipulator').tap();
    return;
  }
  const visual=page.locator('.visual-answer').first();
  if(await visual.count()){await visual.tap();return;}
  const answer=page.locator('.answer-button').first();
  assert.ok(await answer.count(),'order practice must expose a child response');
  await answer.tap();
}
try{
  for(const config of cases){
    const browser=await config.type.launch({headless:true});
    const context=await browser.newContext({viewport:config.viewport,isMobile:true,hasTouch:true,serviceWorkers:'block'});
    await context.addInitScript(value=>{if(!localStorage.getItem('saymera.math.v2'))localStorage.setItem('saymera.math.v2',value)},saved);
    const page=await context.newPage();page.setDefaultTimeout(12000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{
      await openInspector(page);
      const steps=await page.locator('#inspectorLessonStep option').evaluateAll(xs=>xs.map(x=>({index:x.value,label:x.textContent})));
      assert.equal(steps.length,8);
      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-order-lesson-stage');await stage.waitFor();
        const id=await stage.getAttribute('data-nel-order-step');
        const next=page.locator('#nelOrderLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        await completeLearnStep(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['order-size','order-length','event-order','real-world-order'].includes(id)) await page.screenshot({path:'preschool-order-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
      }

      const sections=['order-size','order-length-height','reverse-order','explain-order','transfer-event-sequence'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);
        const visible=await page.locator('#practiceContent').innerText();
        for(const symbol of ['<','>','+','=','−']) assert.equal(visible.includes(symbol),false,section+' must stay out of formal Primary notation');
        await completePracticeQuestion(page);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (8 Order Learn steps; 5 Practice sections; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-order-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
