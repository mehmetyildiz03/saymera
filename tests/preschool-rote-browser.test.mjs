import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4188';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4188'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-rote-test-results',{recursive:true});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const initial=defaultState();initial.profile='preschool';initial.onboarded=true;initial.settings.voice=false;
const saved=JSON.stringify(initial);
const cases=[
  {type:chromium,name:'chromium-phone',viewport:{width:390,height:844}},
  {type:webkit,name:'webkit-phone',viewport:{width:390,height:844}},
  {type:chromium,name:'chromium-tablet',viewport:{width:1024,height:768}},
  {type:webkit,name:'webkit-tablet',viewport:{width:820,height:1180}}
];
const expectedSequence={
  'build-2-5':['rote-2','rote-3','rote-4','rote-5'],
  'count-back':['rote-10','rote-9','rote-8','rote-7']
};
const expectedChoice={
  'continue-7-10':'rote-10',
  'continue-to-20':'rote-20',
  'start-middle':'rote-13',
  'stable-order':'stable'
};
async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelRoteCount20');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL rote-count content must fit viewport width');
}
async function placeSequence(page,ids){
  for(const id of ids) await page.locator('[data-rote-item="'+id+'"] [data-rote-place]').tap();
}
async function completeLearnStep(page,id){
  const next=page.locator('#nelRoteLessonNext');
  if(id.startsWith('chant-')||id==='real-world-rote'){
    await page.locator('#nelRoteDone').tap();return;
  }
  if(expectedSequence[id]){
    const all=await page.locator('[data-rote-item]').evaluateAll(xs=>xs.map(x=>x.dataset.roteItem));
    await placeSequence(page,all);
    if(all.join('|')!==expectedSequence[id].join('|')){
      assert.equal(await next.isDisabled(),true,id+' wrong sequence cannot advance');
      assert.ok((await page.locator('#nelRoteHelp').textContent()||'').trim().length>0,id+' wrong order needs useful feedback');
      await page.locator('.nel-rote-reset').tap();
    }else{
      await page.locator('.nel-rote-reset').tap();
    }
    await placeSequence(page,expectedSequence[id]);
    return;
  }
  if(expectedChoice[id]){
    const root=id==='stable-order'?page.locator('.nel-rote-phrase-choice'):page.locator('.nel-rote-audio-choice');
    const candidates=root.locator('[data-rote-choice]');
    const count=await candidates.count();
    for(let i=0;i<count;i++){
      const btn=candidates.nth(i);
      if(await btn.getAttribute('data-rote-choice')!==expectedChoice[id]){await btn.tap();break;}
    }
    assert.equal(await next.isDisabled(),true,id+' wrong audio choice cannot advance');
    await root.locator('[data-rote-choice="'+expectedChoice[id]+'"]').tap();
    return;
  }
  throw new Error('Unhandled rote Learn step '+id);
}
async function exercisePractice(page){
  const seq=page.locator('.nel-rote-sequence-builder');
  if(await seq.count()){
    const ids=await seq.locator('[data-rote-item]').evaluateAll(xs=>xs.map(x=>x.dataset.roteItem));
    await placeSequence(page,ids);
    assert.equal(await seq.locator('[data-rote-item][data-order-index]').count(),ids.length,'all spoken-number cards must be placeable by touch');
    await page.locator('#checkManipulator').tap();return;
  }
  const root=(await page.locator('.nel-rote-phrase-choice').count())?page.locator('.nel-rote-phrase-choice'):page.locator('.nel-rote-audio-choice');
  assert.ok(await root.count(),'rote practice must expose an audio-first response');
  await root.locator('[data-rote-choice]').first().tap();
  await page.locator('#checkManipulator').tap();
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
        const stage=page.locator('.nel-rote-lesson-stage');await stage.waitFor();
        const id=await stage.getAttribute('data-nel-rote-step');
        const next=page.locator('#nelRoteLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        assert.ok(await page.locator('[data-rote-speech]').count()||id==='real-world-rote',id+' should be audio-first or a real-world transfer');
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,id+' must not require numeral entry');
        await completeLearnStep(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['chant-11-20','continue-to-20','count-back','real-world-rote'].includes(id)) await page.screenshot({path:'preschool-rote-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
      }

      const sections=['recite-forward-10','recite-forward-20','continue-from-middle','explain-stable-order','transfer-rhyme-game'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);
        assert.ok(await page.locator('[data-rote-speech]').count(),section+' practice must provide audio controls');
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not test numeral writing/reading');
        assert.equal(await page.locator('.visual-dots,.visual-objects,.partwhole').count(),0,section+' must not become rational/object counting');
        await exercisePractice(page);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (10 Rote Learn steps; 5 Practice sections; audio-first; no numeral/quantity contamination; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-rote-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
