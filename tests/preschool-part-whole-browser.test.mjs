import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

let base=process.env.SAYMERA_TEST_URL||'';
await mkdir('preschool-part-whole-test-results',{recursive:true});

async function startLocalServer(port){
  if(process.env.SAYMERA_TEST_URL){base=process.env.SAYMERA_TEST_URL;return null;}
  base='http://127.0.0.1:'+port;
  const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
  for(let i=0;i<80;i++){
    try{if((await fetch(base,{cache:'no-store'})).ok)return server;}catch{}
    await new Promise(r=>setTimeout(r,100));
  }
  server.kill();
  throw new Error('Local SAYMERA test server did not become ready on port '+port);
}

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

async function openInspector(page){
  let lastError=null;
  for(let attempt=0;attempt<3;attempt++){
    try{
      await page.goto(base+'/?inspect=1',{waitUntil:'commit',timeout:15000});
      await page.locator('#inspectorProfile').waitFor({state:'visible',timeout:15000});
      lastError=null;
      break;
    }catch(error){
      lastError=error;
      await page.evaluate(()=>window.stop()).catch(()=>{});
      if(await page.locator('#inspectorProfile').count()){ lastError=null; break; }
      await page.waitForTimeout(250*(attempt+1));
    }
  }
  if(lastError) throw lastError;
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelPartWhole10');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL part-whole content must fit viewport width');
}
async function assertNoFormalNotation(root,label){
  const text=(await root.textContent())||'';
  assert.equal(/[+=<>]/.test(text),false,label+' must remain pre-formal and equation-free');
  assert.equal(/number.?bond|sayı bağı/i.test(text),false,label+' must not expose Primary number-bond terminology');
}
async function fillSplit(root){
  const targetLeft=Number(await root.getAttribute('data-target-left'));
  const targetRight=Number(await root.getAttribute('data-target-right'));
  const whole=Number(await root.getAttribute('data-part-whole-whole'));
  assert.ok(targetLeft>=1&&targetRight>=1&&targetLeft+targetRight===whole,'split target must preserve whole with two non-empty parts');

  for(let i=0;i<targetLeft;i++){
    const item=root.locator('[data-part-whole-source] [data-part-whole-item]').first();
    await item.tap();
    await root.locator('[data-part-whole-bin="left"]').tap({position:{x:20,y:20}});
  }
  for(let i=0;i<targetRight;i++){
    const item=root.locator('[data-part-whole-source] [data-part-whole-item]').first();
    await item.tap();
    await root.locator('[data-part-whole-bin="right"]').tap({position:{x:20,y:20}});
  }
  assert.equal(await root.locator('[data-part-whole-source] [data-part-whole-item]').count(),0,'all original whole objects must be assigned exactly once');
  assert.equal(await root.locator('[data-part-whole-bin-items="left"] [data-part-whole-item]').count(),targetLeft);
  assert.equal(await root.locator('[data-part-whole-bin-items="right"] [data-part-whole-item]').count(),targetRight);
  assert.equal(await root.getAttribute('data-part-whole-ready'),'true','target split must become ready');
}
async function completeLearn(page,id){
  const stage=page.locator('.nel-part-whole-lesson-stage');
  const next=page.locator('#nelPartWholeLessonNext');
  if(id==='whole-five'||id==='fingers-ten'){
    await page.locator('#nelPartWholeConfirm').tap();
    return;
  }
  if(['split-five-2-3','split-five-1-4','swap-five-4-1','bracelet-nine'].includes(id)){
    await fillSplit(stage.locator('.nel-part-whole-split-builder'));
    return;
  }
  if(id==='many-splits-six'){
    const cards=stage.locator('[data-part-gallery]');
    assert.equal(await cards.count(),3);
    const seen=[];
    for(let i=0;i<3;i++){
      const preview=cards.nth(i).locator('.nel-part-whole-split-preview');
      const left=Number(await preview.getAttribute('data-preview-left')),right=Number(await preview.getAttribute('data-preview-right'));
      assert.equal(left+right,6,'every gallery decomposition must preserve the same whole');
      seen.push(left+'|'+right);
      await cards.nth(i).tap();
    }
    assert.equal(new Set(seen).size,3,'gallery must show three genuinely different decompositions');
    return;
  }
  if(id==='three-parts-six'){
    const parts=stage.locator('[data-three-part]');
    assert.equal(await parts.count(),3,'Learn must explicitly preserve the two-or-more-parts concept');
    for(let i=0;i<3;i++) await parts.nth(i).tap();
    return;
  }
  if(id==='name-seven-3-4'){
    const root=stage.locator('.nel-part-whole-name-builder');
    await root.locator('[data-part-whole-name="left"][data-part-whole-number="3"]').tap();
    assert.equal(await next.isDisabled(),true,'one named part is insufficient');
    await root.locator('[data-part-whole-name="right"][data-part-whole-number="4"]').tap();
    return;
  }
  if(id==='explain-eight'){
    await stage.locator('[data-part-explain="wrong"]').tap();
    assert.equal(await next.isDisabled(),true,'incorrect explanation cannot advance');
    await stage.locator('[data-part-explain="correct"]').tap();
    return;
  }
  throw new Error('Unhandled Learn step '+id);
}
async function completePractice(page,section){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not use numeric keypad evidence');
  if(section==='split-whole-objects'||section==='transfer-fingers-bracelet'){
    const root=page.locator('.nel-part-whole-split-builder');
    await fillSplit(root);
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(section==='see-multiple-decompositions'){
    const options=page.locator('[data-answer]');
    const count=await options.count();
    let picked=false;
    for(let i=0;i<count;i++){
      const preview=options.nth(i).locator('.nel-part-whole-split-preview');
      if(!await preview.count())continue;
      const whole=Number(await preview.getAttribute('data-preview-whole'));
      const left=Number(await preview.getAttribute('data-preview-left'));
      const right=Number(await preview.getAttribute('data-preview-right'));
      if(left+right===whole){await options.nth(i).tap();picked=true;break;}
    }
    assert.equal(picked,true,'visual-choice Practice must contain one valid same-whole decomposition');
    return;
  }
  if(section==='name-parts-forming-whole'){
    const root=page.locator('.nel-part-whole-name-builder');
    const fixed=root.locator('.nel-part-whole-fixed-part');
    const left=await fixed.nth(0).locator('[data-part-whole-item]').count();
    const right=await fixed.nth(1).locator('[data-part-whole-item]').count();
    assert.ok(left>=1&&right>=1);
    await root.locator('[data-part-whole-name="left"][data-part-whole-number="'+left+'"]').tap();
    await root.locator('[data-part-whole-name="right"][data-part-whole-number="'+right+'"]').tap();
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(section==='explain-same-whole-different-parts'){
    const answers=page.locator('[data-answer]');
    const count=await answers.count();
    let picked=false;
    for(let i=0;i<count;i++){
      const text=(await answers.nth(i).textContent())||'';
      if(text.includes('hiçbir nesne eklenmedi')||text.includes('hepsi iki parçadan birinde kaldı')){await answers.nth(i).tap();picked=true;break;}
    }
    assert.equal(picked,true,'reasoning Practice must expose the object-preservation explanation');
    return;
  }
  throw new Error('Unhandled Practice section '+section);
}
async function completeReview(page){
  if(await page.locator('.nel-part-whole-split-builder').count()){
    await fillSplit(page.locator('.nel-part-whole-split-builder'));await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-part-whole-name-builder').count()){
    const root=page.locator('.nel-part-whole-name-builder'),fixed=root.locator('.nel-part-whole-fixed-part');
    const left=await fixed.nth(0).locator('[data-part-whole-item]').count(),right=await fixed.nth(1).locator('[data-part-whole-item]').count();
    await root.locator('[data-part-whole-name="left"][data-part-whole-number="'+left+'"]').tap();
    await root.locator('[data-part-whole-name="right"][data-part-whole-number="'+right+'"]').tap();
    await page.locator('#checkManipulator').tap();return;
  }
  const options=page.locator('[data-answer]');
  if(await options.count()){
    for(let i=0;i<await options.count();i++){
      const preview=options.nth(i).locator('.nel-part-whole-split-preview');
      if(await preview.count()){
        const whole=Number(await preview.getAttribute('data-preview-whole')),left=Number(await preview.getAttribute('data-preview-left')),right=Number(await preview.getAttribute('data-preview-right'));
        if(left+right===whole){await options.nth(i).tap();return;}
      }
      const text=(await options.nth(i).textContent())||'';
      if(text.includes('hiçbir nesne eklenmedi')||text.includes('hepsi iki parçadan birinde kaldı')){await options.nth(i).tap();return;}
    }
  }
  throw new Error('Part-whole Review response missing');
}

for(let configIndex=0;configIndex<configs.length;configIndex++){
  const config=configs[configIndex];
  const localServer=await startLocalServer(4190+configIndex);
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
      assert.equal(steps.length,10,'part-whole must expose ten Learn steps');

      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-part-whole-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-part-whole-step');
        const next=page.locator('#nelPartWholeLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        await assertNoFormalNotation(stage,id);
        await completeLearn(page,id);
        assert.equal(await next.isEnabled(),true,id+' must unlock after meaningful evidence');
        await noOverflow(page);
        if(['split-five-2-3','many-splits-six','three-parts-six','bracelet-nine','fingers-ten'].includes(id)){
          await page.screenshot({path:'preschool-part-whole-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      const sections=['split-whole-objects','see-multiple-decompositions','name-parts-forming-whole','explain-same-whole-different-parts','transfer-fingers-bracelet'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await assertNoFormalNotation(page.locator('.question-stage'),section);
        await noOverflow(page);
        await completePractice(page,section);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await assertNoFormalNotation(page.locator('.question-stage'),'Review');
      await noOverflow(page);
      await completeReview(page);

      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (10 Learn steps; multiple/swapped/3-part decompositions; 5 Practice sections; Review; no equations; width; sandbox)');
  }catch(error){
    await page.screenshot({path:'preschool-part-whole-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
    throw error;
  }finally{
    await browser.close();
    localServer?.kill();
    if(localServer) await new Promise(r=>setTimeout(r,150));
  }
}
