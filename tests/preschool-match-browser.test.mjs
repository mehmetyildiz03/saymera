import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4185';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4185'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-test-results',{recursive:true});
for(let i=0;i<50;i++){
  try{if((await fetch(base)).ok)break;}catch{}
  await new Promise(r=>setTimeout(r,100));
}

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
  await page.locator('#inspectorSkill').selectOption('nelMatchAttributes');
}

async function noOverflow(page){
  const overflow=await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2);
  assert.equal(overflow,false,'NEL matching content must fit viewport width');
}

try{
  for(const config of cases){
    const browser=await config.type.launch({headless:true});
    const context=await browser.newContext({viewport:config.viewport,isMobile:true,hasTouch:true,serviceWorkers:'block'});
    await context.addInitScript(value=>{
      if(!localStorage.getItem('saymera.math.v2')) localStorage.setItem('saymera.math.v2',value);
    },saved);
    const page=await context.newPage();
    page.setDefaultTimeout(12000);
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));

    try{
      await openInspector(page);
      const steps=await page.locator('#inspectorLessonStep option').evaluateAll(xs=>xs.map(x=>({index:x.value,label:x.textContent})));
      assert.equal(steps.length,8);

      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();

        const stage=page.locator('.nel-match-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-match-step');
        const next=page.locator('#nelMatchLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');

        if(await page.locator('#nelMatchDone').count()){
          await page.locator('#nelMatchDone').tap();
        }else if(await page.locator('.nel-match-reason').count()){
          const wrong=page.locator('.nel-match-reason[data-correct="false"]').first();
          if(await wrong.count()){
            await wrong.tap();
            assert.equal(await next.isDisabled(),true,id+' wrong reason cannot advance');
          }
          await page.locator('.nel-match-reason[data-correct="true"]').tap();
        }else{
          const wrong=page.locator('.nel-match-choice[data-nel-correct="false"]').first();
          if(await wrong.count()){
            await wrong.tap();
            assert.equal(await next.isDisabled(),true,id+' wrong match cannot advance');
          }
          await page.locator('.nel-match-choice[data-nel-correct="true"]').tap();
        }

        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['same-object','same-shape','real-world-match'].includes(id)){
          await page.screenshot({path:'preschool-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      const sections=['match-exact','match-colour-shape','match-size-measure','explain-match','transfer-match'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);

        const visible=(await page.locator('#practiceContent').innerText());
        for(const symbol of ['<','>','+','=','−']) assert.equal(visible.includes(symbol),false,section+' must stay out of formal Primary notation');

        if(section==='match-exact'){
          await page.locator('.nel-match-builder [data-nel-match-value]').first().tap();
          await page.locator('#checkManipulator').tap();
        }else{
          const correct=page.locator('[data-answer="correct"]').first();
          if(await correct.count()) await correct.tap();
          else await page.locator('.answer-button').first().tap();
        }
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);

      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (8 Learn steps; 5 Practice sections; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{
      await browser.close();
    }
  }
}finally{
  server?.kill();
}
