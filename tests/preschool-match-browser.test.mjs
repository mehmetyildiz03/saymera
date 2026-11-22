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
      assert.equal(steps.length,10);

      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();

        const stage=page.locator('.nel-match-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-match-step');
        const next=page.locator('#nelMatchLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        const title=await stage.locator('.lesson-step-copy h2').innerText();
        const audioReady=await page.evaluate(()=>{
          window.__matchSpoken=[];
          if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window))return false;
          // Browser-native speech synthesis may replace instance methods during navigation;
          // test our spoken text deterministically, not an OS voice engine.
          Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
            cancel(){},
            speak(utterance){window.__matchSpoken.push(utterance.text);}
          }});
          Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{
            constructor(text){this.text=text;}
          }});
          return true;
        });
        assert.equal(audioReady,true,'manual Turkish speech should be available on supported browser');
        await page.locator('#nelMatchListen').tap();
        await page.locator('#speakButton').tap();
        const spoken=await page.evaluate(()=>window.__matchSpoken);
        assert.equal(spoken.length,2,id+' must speak through both lesson and header controls');
        assert.ok(spoken.every(phrase=>phrase.includes(title)),id+' must speak the current lesson, not a stale question');
        assert.equal(await next.isDisabled(),true,id+' listening does not count as matching');
        const instructionSize=await stage.locator('.lesson-step-copy p').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
        assert.ok(instructionSize>=15,id+' mobile instructions need child-readable text');
        if(config.name==='chromium-phone'||config.name==='webkit-phone'){
          await page.screenshot({path:'preschool-test-results/'+config.name+'-'+id+'-initial.png',fullPage:false,animations:'disabled'});
        }

        if(await page.locator('#nelMatchDone').count()){
          await page.locator('#nelMatchDone').tap();
        }else if(await page.locator('.nel-match-pair-board').count()){
          assert.ok(['same-colour','same-shape'].includes(id),'only colour and shape reference steps use the two-target board');
          const bank=page.locator('[data-nel-pair-index]'),slots=page.locator('[data-nel-pair-slot]');
          assert.equal(await bank.count(),4,'both new matching boards need four distinct examples');
          assert.equal(await slots.count(),2,'each board has two matching destinations');
          await slots.nth(0).tap();
          assert.equal(await next.isDisabled(),true,'slot alone cannot finish the matching task');
          await bank.nth(1).tap();
          await slots.nth(0).tap();
          assert.equal(await page.locator('.nel-match-pair-board').getAttribute('data-nel-match-placed'),'0','incorrect attribute cannot place a match');
          await bank.nth(0).tap();
          await slots.nth(1).tap();
          assert.equal(await page.locator('.nel-match-pair-board').getAttribute('data-nel-match-placed'),'0','a correct object may not be placed into the wrong target');
          await bank.nth(0).tap();
          assert.equal(await next.isDisabled(),true,'selecting an object is not the same as placing it');
          await slots.nth(0).tap();
          assert.equal(await page.locator('.nel-match-pair-board').getAttribute('data-nel-match-placed'),'1','first object must be genuinely placed');
          assert.equal(await next.isDisabled(),true,'first object must not unlock the second-object match');
          assert.equal(await bank.nth(0).isDisabled(),true,'already matched objects cannot be used twice');
          await bank.nth(2).tap();
          await slots.nth(1).tap();
          assert.equal(await next.isDisabled(),true,'distractor cannot finish the board');
          await bank.nth(1).tap();
          await slots.nth(1).tap();
          assert.equal(await page.locator('.nel-match-pair-board').getAttribute('data-nel-match-placed'),'2');
          assert.equal(await page.locator('.nel-match-pair-board').getAttribute('data-nel-match-complete'),'true','both independently matched objects are required');
        }else if(await page.locator('#nelMatchPlaceSlot').count()){
          if(id==='toy-shelf-match'){
            const toys=await stage.locator('.nel-match-object').evaluateAll(xs=>xs.map(el=>[...el.classList].find(name=>name.startsWith('toy-'))));
            assert.deepEqual(toys,['toy-car','toy-ball','toy-car','toy-kite'],'a real toy context needs recognisable silhouettes, not renamed geometric tokens');
            const labels=await stage.locator('.nel-match-place-option').evaluateAll(xs=>xs.map(el=>el.getAttribute('aria-label')));
            assert.ok(labels.some(label=>label.includes('top'))&&labels.some(label=>label.includes('araba'))&&labels.some(label=>label.includes('uçurtma')),'toy names must also be available to assistive technology');
          }
          const slot=page.locator('#nelMatchPlaceSlot');
          const options=page.locator('[data-nel-place-index]');
          await slot.tap();
          assert.equal(await next.isDisabled(),true,id+' cannot place before selecting an object');
          await options.nth(1).tap();
          await slot.tap();
          assert.equal(await next.isDisabled(),true,id+' wrong placement cannot unlock');
          await options.nth(0).tap();
          assert.equal(await next.isDisabled(),true,id+' selecting alone does not count as placement');
          await slot.tap();
          if(id==='switch-match-rule'){
            assert.equal(await next.isDisabled(),true,'first rule does not complete two-rule activity');
            assert.equal(await page.locator('.nel-match-place-core').getAttribute('data-nel-match-phase'),'1');
            await page.locator('#nelMatchListen').tap();
            const spokenForSecondRule=await page.evaluate(()=>window.__matchSpoken.at(-1));
            assert.ok(spokenForSecondRule.includes('Şimdi aynı şekli bul.'),'changed rule must be voiced after the colour match; actual: '+JSON.stringify(spokenForSecondRule));
            await options.nth(0).tap();
            await slot.tap();
            assert.equal(await next.isDisabled(),true,'first colour match does not satisfy shape rule');
            await options.nth(1).tap();
            await slot.tap();
          }
          assert.equal(await page.locator('.nel-match-place-core').getAttribute('data-nel-match-complete'),'true',id+' must finish active placement');
        }else if(await page.locator('.nel-match-reason').count()){
          const audioChoices=page.locator('.nel-match-reason-audio');
          assert.equal(await audioChoices.count(),3,'every matching explanation needs independent audio');
          const firstExplanation=await page.locator('.nel-match-reason').first().innerText();
          await audioChoices.first().tap();
          const explained=await page.evaluate(()=>window.__matchSpoken.at(-1));
          assert.ok(explained.includes(firstExplanation),'the audible choice must match its visible explanation');
          assert.equal(await next.isDisabled(),true,'listening to an explanation is not evidence of choosing it');
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
        if(['same-object','same-colour','same-shape','switch-match-rule','toy-shelf-match','real-world-match'].includes(id)){
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
      console.log(config.name+': PASS (10 Learn steps; two-target colour/shape matching; audible guidance; rule switch; context transfer; 5 Practice sections; Review; width; sandbox)');
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
