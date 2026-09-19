import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4183';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4183'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('odd-even-test-results',{recursive:true});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const initial=defaultState();initial.profile='grade2';initial.onboarded=true;initial.settings.voice=false;
const saved=JSON.stringify(initial);
const cases=[
  {type:chromium,name:'chromium-phone',viewport:{width:390,height:844}},
  {type:webkit,name:'webkit-phone',viewport:{width:390,height:844}},
  {type:chromium,name:'chromium-tablet',viewport:{width:1024,height:768}},
  {type:webkit,name:'webkit-tablet',viewport:{width:820,height:1180}}
];
async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorSkill').selectOption('oddEven1000');
}
async function layout(page){
  const overflow=await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2);
  assert.equal(overflow,false,'odd/even practice content must fit viewport width');
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
      assert.equal(steps.length,12);
      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.odd-even-lesson-stage');await stage.waitFor();
        const id=await stage.getAttribute('data-odd-even-step');
        const next=page.locator('#oddEvenLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require interaction');
        const pair=page.locator('.sg-pair-action');
        if(await pair.count()){
          for(let i=0;i<6 && await next.isDisabled();i++) await pair.tap();
        }else if(await page.locator('#oddEvenSetCheck').count()){
          for(const button of await page.locator('[data-odd-digit][data-correct="true"]').all()) await button.tap();
          await page.locator('#oddEvenSetCheck').tap();
        }else if(await page.locator('.odd-even-classify-row').count()){
          for(const row of await page.locator('.odd-even-classify-row').all()) await row.locator('button[data-correct="true"]').tap();
        }else{
          const wrong=page.locator('.odd-even-choice[data-correct="false"]').first();
          if(await wrong.count()){await wrong.tap();assert.equal(await next.isDisabled(),true,id+' wrong choice cannot advance');}
          await page.locator('.odd-even-choice[data-correct="true"]').tap();
        }
        assert.equal(await next.isEnabled(),true,id+' completion');
        await layout(page);
        assert.equal((await page.locator('#oddEvenResult').textContent()||'').trim().length>0,true);
        if(['pair-seven','ones-decide','classify-three-digit'].includes(id)) await page.screenshot({path:'odd-even-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
      }

      const sections=['pair-model','see-leftover','classify-parity','ones-rule','explain-parity','transfer-parity'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await layout(page);
        const text=(await page.locator('#practiceContent').innerText()).toLowerCase();
        assert.equal(/asal|bölünebilir|çarpım|çarpma|faktör/.test(text),false,section+' must not leak future-topic language');
        if(section==='pair-model'){
          const action=page.locator('.sg-pair-action');assert.ok(await action.count());
          await action.tap();
          assert.ok((await page.locator('.sg-pair-token.paired').count())>=2);
        }
        if(['pair-model','classify-parity','ones-rule'].includes(section)) await page.screenshot({path:'odd-even-test-results/'+config.name+'-practice-'+section+'.png',fullPage:false,animations:'disabled'});
      }

      await openInspector(page);
      await page.locator('#inspectorPrepareReview,#inspectorLaunchReview').count();
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await layout(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'inspector must not write real progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (12 Learn steps; 6 Practice sections; Review; width; isolated progress)');
    }catch(error){await page.screenshot({path:'odd-even-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});throw error;}
    finally{await browser.close();}
  }
}finally{server?.kill();}
