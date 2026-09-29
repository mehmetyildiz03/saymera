import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4194';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4194'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-spatial-relations-test-results',{recursive:true});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}

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
const relationLabel={
  top:'üstünde',bottom:'altında','in-front-of':'önünde',behind:'arkasında',
  up:'yukarı',down:'aşağı',left:'sola',right:'sağa',far:'uzakta',near:'yakında'
};
const expectedRelations=Object.keys(relationLabel);

async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelSpatialRelations');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL spatial-relations content must fit viewport width');
}
async function center(locator){
  const b=await locator.boundingBox();assert.ok(b);return {x:b.x+b.width/2,y:b.y+b.height/2,w:b.width,h:b.height};
}
async function verifyMovedGeometry(stage,relation){
  const board=stage.locator('.nel-spatial-action-board');
  const mover=stage.locator('#nelSpatialMover');
  const ref=stage.locator('.nel-spatial-lesson-ref');
  const b=await center(board),m=await center(mover);
  if(relation==='left') assert.ok(m.x<b.x,'left movement must finish left of board centre');
  if(relation==='right') assert.ok(m.x>b.x,'right movement must finish right of board centre');
  if(relation==='up') assert.ok(m.y<b.y,'up movement must finish above board centre');
  if(relation==='down') assert.ok(m.y>b.y,'down movement must finish below board centre');
  if(relation==='top') assert.ok(m.y<(await center(ref)).y,'top placement must finish above reference');
  if(relation==='bottom') assert.ok(m.y>(await center(ref)).y,'bottom placement must finish below reference');
  if(relation==='near'||relation==='far'){
    const r=await center(ref),distance=Math.hypot(m.x-r.x,m.y-r.y);
    if(relation==='near') assert.ok(distance<120,'near placement must remain near the reference');
    else assert.ok(distance>130,'far placement must be clearly farther from the reference');
  }
  if(relation==='in-front-of'||relation==='behind'){
    const moverZ=Number(await mover.evaluate(el=>getComputedStyle(el).zIndex));
    const refZ=Number(await ref.evaluate(el=>getComputedStyle(el).zIndex));
    if(relation==='in-front-of') assert.ok(moverZ>refZ,'front placement must render in front of reference');
    else assert.ok(moverZ<refZ,'behind placement must render behind reference');
  }
}
async function completeLearn(page,relation){
  const stage=page.locator('.nel-spatial-lesson-stage');
  const next=page.locator('#nelSpatialLessonNext');
  const core=stage.locator('.nel-spatial-lesson-core');
  const targets=stage.locator('[data-spatial-lesson-target]');
  const wrong=targets.filter({hasNot:page.locator('[data-never-used]')});
  const count=await targets.count();
  let wrongTarget=null;
  for(let i=0;i<count;i++){
    const t=targets.nth(i);
    if((await t.getAttribute('data-spatial-lesson-target'))!==relation){wrongTarget=t;break;}
  }
  if(wrongTarget){
    await wrongTarget.tap();
    assert.equal(await next.isDisabled(),true,relation+' wrong target must not unlock Learn');
    assert.equal(await wrongTarget.evaluate(el=>el.classList.contains('wrong')),true,relation+' wrong target feedback');
  }
  const target=stage.locator('[data-spatial-lesson-target="'+relation+'"]');
  assert.equal(await target.count(),1,relation+' must expose exactly one correct action target');
  await target.tap();
  await page.waitForTimeout(340);
  assert.equal(await core.getAttribute('data-spatial-complete'),'true',relation+' completion marker');
  assert.equal(await core.getAttribute('data-spatial-selected'),relation);
  assert.equal(await stage.locator('#nelSpatialMover').getAttribute('data-spatial-relation'),relation);
  assert.equal(await next.isEnabled(),true,relation+' correct target must unlock Learn');
  assert.equal(await stage.locator('#nelSpatialLessonResult').evaluate(el=>el.classList.contains('revealed')),true);
  await verifyMovedGeometry(stage,relation);
}
async function assertPracticeLayersDoNotOverlap(page,section){
  if(!(await page.locator('.visual-choice-grid').count())) return;
  const reference=await page.locator('#visualStage').boundingBox();
  const answers=await page.locator('.visual-choice-grid').boundingBox();
  assert.ok(reference&&answers,section+' must expose measurable reference and answer regions');
  assert.ok(answers.y>=reference.y+reference.height-1,section+' answer grid must begin after reference visual');
}
async function tapChoiceText(page,text){
  const buttons=page.locator('[data-answer]');
  for(let i=0;i<await buttons.count();i++){
    const button=buttons.nth(i);
    if((await button.innerText()).trim()===text){await button.tap();return;}
  }
  throw new Error('Missing spatial answer choice: '+text);
}
async function completePracticeQuestion(page){
  const builder=page.locator('.nel-spatial-practice-builder');
  if(await builder.count()){
    const expected=await builder.getAttribute('data-spatial-practice-expected');
    const target=builder.locator('[data-spatial-practice-target="'+expected+'"]');
    assert.equal(await target.count(),1,'active Practice must expose expected spatial target');
    await target.tap();
    assert.equal(await builder.getAttribute('data-spatial-practice-selected'),expected);
    assert.equal(await builder.locator('[data-spatial-practice-mover]').getAttribute('data-spatial-relation'),expected);
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(await page.locator('[data-answer="correct"]').count()){
    await page.locator('[data-answer="correct"]').first().tap();return;
  }
  const explain='Konumu anlatırken bir nesnenin başka bir nesneye ya da bulunduğum yere göre nerede olduğunu söylerim.';
  if(await page.locator('[data-answer]').filter({hasText:explain}).count()){
    await page.locator('[data-answer]').filter({hasText:explain}).first().tap();return;
  }
  const scene=page.locator('#visualStage [data-spatial-relation]').first();
  if(await scene.count()){
    const relation=await scene.getAttribute('data-spatial-relation');
    if(['up','down','left','right'].includes(relation)){
      const track=scene.locator('.nel-spatial-direction-track'),end=scene.locator('.nel-spatial-end');
      const tc=await center(track),ec=await center(end);
      if(relation==='up') assert.ok(ec.y<tc.y,'up Practice endpoint must be above centre');
      if(relation==='down') assert.ok(ec.y>tc.y,'down Practice endpoint must be below centre');
      if(relation==='left') assert.ok(ec.x<tc.x,'left Practice endpoint must be left of centre');
      if(relation==='right') assert.ok(ec.x>tc.x,'right Practice endpoint must be right of centre');
    }
    await tapChoiceText(page,relationLabel[relation]);return;
  }
  throw new Error('Unhandled KSD 4.4 Practice/Review interaction');
}

try{
  for(const config of configs){
    const browser=await config.type.launch({headless:true});
    const context=await browser.newContext({viewport:config.viewport,isMobile:true,hasTouch:true,serviceWorkers:'block'});
    await context.addInitScript(value=>{if(!localStorage.getItem('saymera.math.v2'))localStorage.setItem('saymera.math.v2',value)},saved);
    const page=await context.newPage();page.setDefaultTimeout(14000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    try{
      await openInspector(page);
      const steps=await page.locator('#inspectorLessonStep option').evaluateAll(xs=>xs.map(x=>({index:x.value,label:x.textContent})));
      assert.equal(steps.length,10,'KSD 4.4 must expose ten active Learn steps');

      const seen=[];
      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-spatial-lesson-stage');await stage.waitFor();
        const relation=await stage.getAttribute('data-spatial-relation');
        seen.push(relation);
        assert.equal(await page.locator('#nelSpatialLessonNext').isDisabled(),true,relation+' must require child action');
        await completeLearn(page,relation);
        await noOverflow(page);
        if(['in-front-of','right','far'].includes(relation)){
          await page.screenshot({path:'preschool-spatial-relations-test-results/'+config.name+'-'+relation+'.png',fullPage:false,animations:'disabled'});
        }
      }
      assert.deepEqual([...seen].sort(),[...expectedRelations].sort(),'Learn must explicitly teach all ten official relation concepts');

      for(const section of ['place-relative-position','recognise-position-direction-distance','show-spatial-language','explain-reference-relation','transfer-block-movement']){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not become a numeric worksheet');
        await noOverflow(page);
        await assertPracticeLayersDoNotOverlap(page,section);
        await completePracticeQuestion(page);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);
      await completePracticeQuestion(page);

      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (10 official Learn relations; active placement/movement; right-left response; 5 Practice; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-spatial-relations-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
