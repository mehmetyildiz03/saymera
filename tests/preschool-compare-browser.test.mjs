import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4187';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4187'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-compare-test-results',{recursive:true});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const initial=defaultState();initial.profile='preschool';initial.onboarded=true;initial.settings.voice=false;
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
  await page.locator('#inspectorSkill').selectOption('nelCompareAttributes');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL comparing content must fit viewport width');
}
async function completeLearnStep(page,id){
  const next=page.locator('#nelCompareLessonNext');
  if(await page.locator('#nelCompareDone').count()){
    await page.locator('#nelCompareDone').tap();
    return;
  }
  const align=page.locator('#nelCompareAlign');
  if(await align.count()){
    assert.equal(await page.locator('.nel-compare-choice:enabled').count(),0,id+' choices must wait for alignment');
    const tracks=page.locator('.nel-compare-length-track');
    assert.equal(await tracks.count(),2,id+' must show both lengths on one comparison board');
    const before=await tracks.evaluateAll(xs=>xs.map(x=>x.getBoundingClientRect().left));
    assert.ok(Math.abs(before[0]-before[1])>8,id+' must begin visibly misaligned');
    await align.tap();
    assert.equal(await next.isDisabled(),true,id+' alignment alone cannot advance');
    const after=await tracks.evaluateAll(xs=>xs.map(x=>x.getBoundingClientRect().left));
    assert.ok(Math.abs(after[0]-after[1])<=1.5,id+' must share the same start line after alignment');
  }
  const wrong=page.locator('.nel-compare-choice[data-correct="false"]').first();
  if(await wrong.count()){
    await wrong.tap();
    assert.equal(await next.isDisabled(),true,id+' wrong comparison cannot advance');
  }
  const correct=page.locator('.nel-compare-choice[data-correct="true"]');
  assert.equal(await correct.count(),1,id+' must expose one correct child action');
  await correct.tap();
}
async function completePracticeQuestion(page){
  const builder=page.locator('.nel-compare-builder');
  if(await builder.count()){
    const align=builder.locator('.nel-compare-align');
    if(await align.count()) await align.tap();
    const choice=builder.locator('[data-nel-compare-value]').first();
    assert.ok(await choice.count(),'compare builder must offer relation choices');
    await choice.tap();
    await page.locator('#checkManipulator').tap();
    return;
  }
  const answer=page.locator('.answer-button').first();
  assert.ok(await answer.count(),'compare practice must offer a child response');
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
        const stage=page.locator('.nel-compare-lesson-stage');await stage.waitFor();
        const id=await stage.getAttribute('data-nel-compare-step');
        const next=page.locator('#nelCompareLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        await completeLearnStep(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['compare-size','compare-length-align','real-world-compare'].includes(id)) await page.screenshot({path:'preschool-compare-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
      }

      const sections=['compare-size','compare-length','compare-height','explain-compare','transfer-compare'];
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
      console.log(config.name+': PASS (8 Compare Learn steps; 5 Practice sections; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-compare-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
