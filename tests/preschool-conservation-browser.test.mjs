import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4188';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4188'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-conservation-test-results',{recursive:true});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}

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

const layoutExpectations={
  'same-five':['array','line'],
  'spread-five':['array','line'],
  'array-six':['line','array'],
  'circle-seven':['array','circle'],
  'random-eight':['line','random']
};

async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelConservation10');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL conservation content must fit viewport width');
}
async function tokenIds(board){
  return (await board.locator('[data-conservation-id]').evaluateAll(xs=>xs.map(x=>x.dataset.conservationId).sort()));
}
async function assertSameIdentityBeforeAfter(root){
  const boards=root.locator('.nel-conservation-pair .nel-conservation-board');
  assert.equal(await boards.count(),2,'before/after conservation evidence must show two arrangements');
  const beforeIds=await tokenIds(boards.nth(0));
  const afterIds=await tokenIds(boards.nth(1));
  assert.ok(beforeIds.length>=1,'conservation board must contain objects');
  assert.deepEqual(beforeIds,afterIds,'before and after must contain the exact same object identities');
}
async function completeLearnStep(page,id){
  const next=page.locator('#nelConservationLessonNext');
  const stage=page.locator('.nel-conservation-lesson-stage');

  if(id==='same-five'){
    await assertSameIdentityBeforeAfter(stage);
    const boards=stage.locator('.nel-conservation-pair .nel-conservation-board');
    assert.equal(await boards.nth(0).getAttribute('data-layout'),'array');
    assert.equal(await boards.nth(1).getAttribute('data-layout'),'line');
    await page.locator('#nelConservationConfirm').tap();
    return;
  }

  if(['spread-five','array-six','circle-seven','random-eight'].includes(id)){
    const expected=layoutExpectations[id];
    const box=page.locator('#nelConservationToggle');
    const beforeBoard=box.locator('.nel-conservation-board');
    const beforeIds=await tokenIds(beforeBoard);
    assert.equal(await beforeBoard.getAttribute('data-layout'),expected[0],id+' must start in the intended arrangement');
    await page.locator('#nelConservationToggleButton').tap();
    const afterBoard=box.locator('.nel-conservation-board');
    await afterBoard.waitFor();
    const afterIds=await tokenIds(afterBoard);
    assert.equal(await afterBoard.getAttribute('data-layout'),expected[1],id+' must change to the intended arrangement');
    assert.deepEqual(beforeIds,afterIds,id+' must preserve the same object identities while rearranging');
    const boardBox=await afterBoard.boundingBox();
    assert.ok(boardBox?.width>240,id+' arrangement board must remain visibly wide on phone/tablet');
    const tokenBoxes=await afterBoard.locator('[data-conservation-id]').evaluateAll(xs=>xs.map(x=>{const r=x.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height};}));
    assert.ok(tokenBoxes.every(r=>r.w>=30&&r.h>=30),id+' objects must remain visibly tappable/readable');
    const xs=tokenBoxes.map(r=>r.x),ys=tokenBoxes.map(r=>r.y);
    const xSpan=Math.max(...xs)-Math.min(...xs),ySpan=Math.max(...ys)-Math.min(...ys);
    assert.ok(xSpan>80||ySpan>70,id+' arrangement must visibly redistribute the objects in space');
    return;
  }

  if(id==='rearrange-nine'){
    const root=page.locator('.nel-conservation-rearrange');
    const buttons=root.locator('[data-conservation-move]');
    const total=await buttons.count();
    assert.equal(total,9,'active rearrangement Learn step must use nine objects');
    const ids=await buttons.evaluateAll(xs=>xs.map(x=>x.dataset.conservationMove).sort());
    assert.equal(new Set(ids).size,total,'every rearranged object must keep a unique identity');
    await buttons.first().tap();
    assert.equal(await next.isDisabled(),true,'partial rearrangement cannot advance');
    for(let i=1;i<total;i++) await buttons.nth(i).tap();
    assert.equal(await root.locator('[data-conservation-move].moved').count(),total,'every object must be actively moved');
    return;
  }

  if(id==='why-same'){
    await assertSameIdentityBeforeAfter(stage);
    const wrong=page.locator('[data-conservation-lesson-choice="space"]');
    await wrong.tap();
    assert.equal(await next.isDisabled(),true,'spacing misconception must not advance the lesson');
    assert.match((await page.locator('#nelConservationHelp').textContent())||'',/eklenip çıkar/i,'wrong spacing response must redirect attention to add/remove');
    await page.locator('[data-conservation-lesson-choice="same"]').tap();
    return;
  }

  if(id==='real-world'){
    assert.equal(await page.locator('.nel-conservation-real-world').count(),1,'transfer step must explicitly move conservation to real objects');
    await page.locator('#nelConservationConfirm').tap();
    return;
  }
  throw new Error('Unhandled conservation Learn step '+id);
}

async function exercisePractice(page,section){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not require numeral entry');

  if(section==='rearrange-same-set'){
    const root=page.locator('.nel-conservation-rearrange');
    const buttons=root.locator('[data-conservation-move]');
    const total=await buttons.count();
    assert.ok(total>=4&&total<=10,'rearrangement practice must stay within 10 objects');
    const ids=await buttons.evaluateAll(xs=>xs.map(x=>x.dataset.conservationMove));
    assert.equal(new Set(ids).size,total,'practice rearrangement must preserve unique object identities');
    await buttons.first().tap();
    assert.equal(await page.locator('#checkManipulator').isEnabled(),true);
    for(let i=1;i<total;i++) await buttons.nth(i).tap();
    await page.locator('#checkManipulator').tap();
    return;
  }

  if(section==='resist-spacing-cue'){
    const root=page.locator('.nel-conservation-relation');
    await assertSameIdentityBeforeAfter(root);
    const boards=root.locator('.nel-conservation-pair .nel-conservation-board');
    assert.equal(await boards.nth(1).getAttribute('data-layout'),'spread-line','spacing-cue practice must visibly spread the second arrangement');
    await root.locator('[data-conservation-choice="more"]').tap();
    await page.locator('#checkManipulator').tap();
    assert.equal(await page.locator('.question-stage').count(),1,'wrong spacing response must remain on the current question');
    return;
  }

  const pair=page.locator('.nel-conservation-pair');
  if(await pair.count()) await assertSameIdentityBeforeAfter(page.locator('#visualStage'));

  const correct=page.locator('[data-answer="Aynı miktar"]');
  if(await correct.count()){
    await correct.tap();
    return;
  }
  const explanation=page.locator('[data-answer]').filter({hasText:'Hiç nesne eklenmedi veya çıkarılmadı'});
  if(await explanation.count()){
    await explanation.first().tap();
    return;
  }
  throw new Error('Conservation Practice response missing for '+section);
}

async function exerciseReview(page){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,'conservation Review must not require numeral entry');
  if(await page.locator('.nel-conservation-rearrange').count()){
    const buttons=page.locator('.nel-conservation-rearrange [data-conservation-move]');
    for(let i=0;i<await buttons.count();i++) await buttons.nth(i).tap();
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(await page.locator('.nel-conservation-relation').count()){
    await page.locator('[data-conservation-choice="same"]').tap();
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(await page.locator('[data-answer="Aynı miktar"]').count()){
    await page.locator('[data-answer="Aynı miktar"]').first().tap();
    return;
  }
  const explanation=page.locator('[data-answer]').filter({hasText:'Hiç nesne eklenmedi veya çıkarılmadı'});
  if(await explanation.count()){await explanation.first().tap();return;}
  throw new Error('Conservation Review response missing');
}

try{
  for(const config of cases){
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
      assert.equal(steps.length,8,'conservation Learn must expose all eight NEL-aligned steps');
      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-conservation-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-conservation-step');
        const next=page.locator('#nelConservationLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,id+' must not require numeral entry');
        await completeLearnStep(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['spread-five','circle-seven','random-eight','rearrange-nine','why-same','real-world'].includes(id)){
          await page.screenshot({path:'preschool-conservation-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      const sections=['rearrange-same-set','see-same-quantity','resist-spacing-cue','explain-no-add-remove','transfer-real-objects'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);
        await exercisePractice(page,section);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);
      await exerciseReview(page);
      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (8 Conservation Learn steps; same-object identity; varied arrangements; 5 Practice sections; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-conservation-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{
      await browser.close();
    }
  }
}finally{
  server?.kill();
}
