import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4188';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4188'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-reliable-test-results',{recursive:true});
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
  await page.locator('#inspectorSkill').selectOption('nelReliableCount10');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL reliable-count content must fit viewport width');
}
async function countAll(page,rootSelector='.nel-reliable-count-set'){
  const root=page.locator(rootSelector);
  const buttons=root.locator('[data-reliable-item]');
  const total=await buttons.count();
  assert.ok(total>=1&&total<=10,'reliable count must use 1..10 objects');
  for(let i=0;i<total;i++){
    const b=buttons.nth(i);
    if(!(await b.isDisabled())) await b.tap();
  }
  assert.equal(await root.locator('[data-reliable-item].counted').count(),total,'every object must be counted exactly once');
  assert.equal(await root.locator('[data-reliable-item].counted').first().isDisabled(),true,'a counted object must not be countable again');
}
async function completeOrderProof(page){
  const root=page.locator('.nel-reliable-order-proof');
  for(const side of ['left','right']){
    const pane=root.locator('[data-reliable-pass="'+side+'"]');
    const buttons=pane.locator('[data-reliable-order-item]');
    const total=await buttons.count();
    for(let i=0;i<total;i++){
      const enabled=buttons.filter({has:page.locator(':scope')});
      const b=buttons.nth(i);
      await b.tap();
    }
    assert.equal(await pane.getAttribute('data-complete'),'true',side+' counting pass must complete');
  }
  assert.ok(await root.locator('[data-reliable-order-choice]:not([disabled])').count(),'explanation choices unlock only after two complete counts');
}
async function completeLearnStep(page,id){
  const next=page.locator('#nelReliableLessonNext');
  if(['one-word-one-object','move-count-five','fixed-count-six','count-to-ten'].includes(id)){
    await countAll(page);
    return;
  }
  if(id==='stable-order-next'){
    const root=page.locator('.nel-reliable-next-word');
    const buttons=root.locator('[data-reliable-next-choice]');
    const count=await buttons.count();
    for(let i=0;i<count;i++){
      const b=buttons.nth(i);
      if(await b.getAttribute('data-reliable-next-choice')!=='rote-4'){await b.tap();break;}
    }
    assert.equal(await next.isDisabled(),true,'wrong stable-order word cannot advance');
    await root.locator('[data-reliable-next-choice="rote-4"]').tap();
    return;
  }
  if(id==='cardinality-seven'){
    const root=page.locator('.nel-reliable-cardinality');
    assert.equal(await root.locator('[data-reliable-card-choice]:not([disabled])').count(),0,'cardinality answer stays locked before counting');
    await countAll(page,'.nel-reliable-cardinality .nel-reliable-count-set');
    assert.ok(await root.locator('[data-reliable-card-choice]:not([disabled])').count(),'cardinality answers unlock after every object is counted');
    const buttons=root.locator('[data-reliable-card-choice]');
    const count=await buttons.count();
    for(let i=0;i<count;i++){
      const b=buttons.nth(i);if(await b.getAttribute('data-reliable-card-choice')!=='rote-7'){await b.tap();break;}
    }
    assert.equal(await next.isDisabled(),true,'wrong cardinality answer cannot advance');
    await root.locator('[data-reliable-card-choice="rote-7"]').tap();
    return;
  }
  if(['order-left-right','order-eight'].includes(id)){
    const root=page.locator('.nel-reliable-order-proof');
    assert.equal(await root.locator('[data-reliable-order-choice]:not([disabled])').count(),0,'order explanation stays locked before both counts');
    await completeOrderProof(page);
    await root.locator('[data-reliable-order-choice]:not([data-reliable-order-choice="same"])').first().tap();
    assert.equal(await next.isDisabled(),true,'wrong order-irrelevance explanation cannot advance');
    await root.locator('[data-reliable-order-choice="same"]').tap();
    return;
  }
  if(id==='four-principles'||id==='real-world-reliable'){await page.locator('#nelReliableDone').tap();return;}
  throw new Error('Unhandled reliable Learn step '+id);
}
async function exercisePractice(page){
  if(await page.locator('.nel-reliable-count-set').count()){
    if(await page.locator('.nel-reliable-cardinality').count()){
      await countAll(page,'.nel-reliable-cardinality .nel-reliable-count-set');
      await page.locator('[data-reliable-card-choice]:not([disabled])').first().tap();
    }else await countAll(page);
    await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-reliable-next-word').count()){
    await page.locator('[data-reliable-next-choice]').first().tap();await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-reliable-order-proof').count()){
    await completeOrderProof(page);await page.locator('[data-reliable-order-choice]:not([disabled])').first().tap();await page.locator('#checkManipulator').tap();return;
  }
  throw new Error('Reliable-count Practice response missing');
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
        const stage=page.locator('.nel-reliable-lesson-stage');await stage.waitFor();
        const id=await stage.getAttribute('data-nel-reliable-step');
        const next=page.locator('#nelReliableLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,id+' must not require numeral entry');
        await completeLearnStep(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['count-to-ten','cardinality-seven','order-eight','real-world-reliable'].includes(id)) await page.screenshot({path:'preschool-reliable-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
      }

      const sections=['one-to-one-count','stable-order-count','cardinality-count','order-irrelevance','transfer-daily-count'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not require numeral entry');
        assert.ok(await page.locator('[data-reliable-item],[data-reliable-next-choice],[data-reliable-order-item]').count(),section+' must expose observable counting action');
        await exercisePractice(page);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (10 Reliable Learn steps; four counting principles; 5 Practice sections; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-reliable-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
