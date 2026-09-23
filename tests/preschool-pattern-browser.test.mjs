import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4188';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4188'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-pattern-test-results',{recursive:true});
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
  'copy-ab':['lesson-pattern-blue-circle','lesson-pattern-yellow-triangle','lesson-pattern-blue-circle','lesson-pattern-yellow-triangle','lesson-pattern-blue-circle','lesson-pattern-yellow-triangle'],
  'create-simple':['lesson-pattern-red-square','lesson-pattern-blue-circle-2','lesson-pattern-blue-circle-2','lesson-pattern-red-square','lesson-pattern-blue-circle-2','lesson-pattern-blue-circle-2'],
  'create-complex':['lesson-pattern-blue-circle','lesson-pattern-blue-circle','lesson-pattern-yellow-triangle','lesson-pattern-yellow-triangle','lesson-pattern-blue-circle','lesson-pattern-blue-circle','lesson-pattern-yellow-triangle','lesson-pattern-yellow-triangle']
};
async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelPatterns');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL patterning content must fit viewport width');
}
async function tapPattern(page,values){
  for(const value of values) await page.locator('[data-nel-pattern-value="'+value+'"]').first().tap();
}
async function completeLearnStep(page,id){
  const next=page.locator('#nelPatternLessonNext');
  if(expectedByStep[id]){
    const first=await page.locator('[data-nel-pattern-value]').first().getAttribute('data-nel-pattern-value');
    const slots=await page.locator('[data-pattern-slot]').count();
    await tapPattern(page,Array.from({length:slots},()=>first));
    assert.equal(await next.isDisabled(),true,id+' wrong pattern cannot advance');
    assert.ok((await page.locator('#nelPatternHelp').textContent()||'').trim().length>0,id+' wrong pattern must point back to the repeat');
    await page.locator('.nel-pattern-reset').tap();
    assert.equal(await page.locator('[data-pattern-slot][data-pattern-value]').count(),0,id+' reset must clear the pattern');
    await tapPattern(page,expectedByStep[id]);
    return;
  }
  if(id.startsWith('extend-')){
    await page.locator('.nel-pattern-choice[data-correct="false"]').first().tap();
    assert.equal(await next.isDisabled(),true,id+' wrong extension cannot advance');
    await page.locator('.nel-pattern-choice[data-correct="true"]').tap();
    return;
  }
  if(id==='recognise-ab'||id==='describe-pattern'){
    await page.locator('.nel-pattern-reason[data-correct="false"]').first().tap();
    assert.equal(await next.isDisabled(),true,id+' wrong rule cannot advance');
    await page.locator('.nel-pattern-reason[data-correct="true"]').tap();
    return;
  }
  if(id==='real-world-pattern'){
    await page.locator('#nelPatternDone').tap();
    return;
  }
  throw new Error('Unhandled pattern Learn step '+id);
}
async function exercisePracticeQuestion(page){
  const builder=page.locator('.nel-pattern-builder');
  if(await builder.count()){
    const first=await builder.locator('[data-nel-pattern-value]').first().getAttribute('data-nel-pattern-value');
    const slots=await builder.locator('[data-pattern-slot]').count();
    await tapPattern(page,Array.from({length:slots},()=>first));
    assert.equal(await builder.locator('[data-pattern-slot][data-pattern-value]').count(),slots,'all pattern slots must be fillable by touch');
    await page.locator('#checkManipulator').tap();
    return;
  }
  const visual=page.locator('.visual-answer').first();
  if(await visual.count()){await visual.tap();return;}
  const answer=page.locator('.answer-button').first();
  assert.ok(await answer.count(),'pattern practice must expose a child response');
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
      assert.equal(steps.length,10);
      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-pattern-lesson-stage');await stage.waitFor();
        const id=await stage.getAttribute('data-nel-pattern-step');
        const next=page.locator('#nelPatternLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        await completeLearnStep(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['copy-ab','extend-aabb','create-complex','real-world-pattern'].includes(id)) await page.screenshot({path:'preschool-pattern-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
      }

      const sections=['recognise-copy','extend-pattern','create-pattern','describe-pattern','transfer-pattern'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);
        const visible=await page.locator('#practiceContent').innerText();
        for(const symbol of ['<','>','+','=','−']) assert.equal(visible.includes(symbol),false,section+' must stay out of formal Primary notation');
        await exercisePracticeQuestion(page);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (10 Pattern Learn steps; 5 Practice sections; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-pattern-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
