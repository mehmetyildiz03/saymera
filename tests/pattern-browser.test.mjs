import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4182';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4182'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('test-results',{recursive:true});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const initial=defaultState();initial.profile='grade2';initial.onboarded=true;initial.settings.voice=false;
const saved=JSON.stringify(initial);
const cases=[
  {type:chromium,name:'chromium-phone',viewport:{width:390,height:844}},
  {type:webkit,name:'webkit-phone',viewport:{width:390,height:844}},
  {type:chromium,name:'chromium-tablet',viewport:{width:1024,height:768}},
  {type:webkit,name:'webkit-tablet',viewport:{width:820,height:1180}}
];
async function tap(page,selector){await page.locator(selector).tap();}
async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorSkill').selectOption('numberPattern1000');
}
async function layout(page){
  const overflow=await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2);
  assert.equal(overflow,false,'practice content must fit viewport width');
}
async function place(page,chip,slot,drag,type){
  await chip.scrollIntoViewIfNeeded();
  if(!drag){await chip.tap();await slot.tap();return;}
  // Keep both targets in view before acquiring pointer coordinates.
  await slot.scrollIntoViewIfNeeded();
  const a=await chip.boundingBox(),b=await slot.boundingBox();
  assert.ok(a&&b);
  const start={x:a.x+a.width/2,y:a.y+a.height/2},end={x:b.x+b.width/2,y:b.y+b.height/2};
  if(type===chromium){
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
    for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/12,y:start.y+(end.y-start.y)*i/12}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  }else{
    await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:12});await page.mouse.up();
  }
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
      assert.equal(steps.length,13);
      for(const step of steps){
        await openInspector(page);await page.locator('#inspectorLessonStep').selectOption(step.index);await tap(page,'#inspectorLaunchLearn');
        const stage=page.locator('.pattern-lesson-stage');await stage.waitFor();
        const id=await stage.getAttribute('data-pattern-step');
        assert.equal(await page.locator('#patternLessonNext').isDisabled(),true);
        if(id==='place-change-track'){
          await tap(page,'[data-place-choice="0"]');assert.equal(await page.locator('#patternLessonNext').isDisabled(),true);
          await tap(page,'[data-place-choice="1"]');
        }else{
          for(let phase=0;phase<(id==='continue-after-rule'||id==='missing-middle'?2:1);phase++){
            const slot=page.locator('.pattern-action-target:not([data-pattern-value^="yanlış"]),.pattern-regroup-slot,.pattern-rule-slot,.pattern-number-slot').first();
            const value=await slot.getAttribute('data-pattern-value');
            const bank=page.locator('.pattern-drag-chip,.pattern-rule-chip,.pattern-number-chip');
            const wrongIndex=await bank.evaluateAll((xs,v)=>xs.findIndex(x=>x.dataset.patternValue!==v),value);
            if(wrongIndex>=0){await bank.nth(wrongIndex).tap();await slot.tap();assert.equal(await page.locator('#patternLessonNext').isDisabled(),true);}
            const chip=bank.filter({hasText:value}).first();
            await place(page,chip,slot,Number(step.index)%2===0,config.type);
            if(phase===0&&(id==='continue-after-rule'||id==='missing-middle')){
              assert.equal(await page.locator('#patternLessonNext').isDisabled(),true);
              await page.locator('.pattern-number-slot').waitFor();
            }
          }
        }
        assert.equal(await page.locator('#patternLessonNext').isEnabled(),true,id+' completion');
        await layout(page);
        if(['one-more-model','ten-regroup-boundary','missing-middle'].includes(id))await page.screenshot({path:'test-results/'+config.name+'-'+id+'.png',fullPage:true});
      }
      for(const section of ['continue-sequence','missing-number','transfer-pattern']){
        await openInspector(page);await page.locator('#inspectorPracticeSection').selectOption(section);await tap(page,'#inspectorLaunchPractice');
        await page.locator('[data-rule-choice]').first().waitFor();
        assert.equal(await page.locator('#numberAnswer,[data-answer]').count(),0,'numeric answer must not precede rule');
        const values=await page.locator('#visualStage').innerText();
        const tokens=values.match(/\d+|\?/g);
        const known=tokens.map((n,i)=>({n,i})).filter(x=>x.n!=='?');
        const delta=(Number(known[1].n)-Number(known[0].n))/(known[1].i-known[0].i);
        const rule='Her adımda '+Math.abs(delta)+' '+(delta>0?'daha.':'daha az.');
        await page.locator('[data-rule-choice]').filter({hasText:delta>0?'Her adımda 100 daha az.':'Her adımda 100 daha.'}).tap();
        assert.equal(await page.locator('#numberAnswer,[data-answer]').count(),0);
        await page.locator('[data-rule-choice]').filter({hasText:rule}).tap();
        await page.locator('#numberAnswer').waitFor();await layout(page);
        await page.screenshot({path:'test-results/'+config.name+'-'+section+'.png',fullPage:true});
      }
      await openInspector(page);await page.locator('#inspectorPracticeSection').selectOption('model-change');await tap(page,'#inspectorLaunchPractice');
      await page.locator('.pattern-model-comparison').waitFor();
      assert.ok(await page.locator('.pattern-quantity-model .lesson-unit-hundred').count());await layout(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'inspector must not write real progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (13 learn steps; rule gates; touch/tap; width; isolated progress)');
    }catch(error){await page.screenshot({path:'test-results/'+config.name+'-failure.png',fullPage:true});throw error;}
    finally{await browser.close();}
  }
}finally{server?.kill();}
