import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4193';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4193'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-shape-compose-test-results',{recursive:true});
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

async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelShapeCompose');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL shape-composition content must fit viewport width');
}
async function place(page,chip,slot,useDrag,browserType){
  await chip.scrollIntoViewIfNeeded();
  await slot.scrollIntoViewIfNeeded();
  if(!useDrag){await chip.tap();await slot.tap();return;}
  const a=await chip.boundingBox(),b=await slot.boundingBox();assert.ok(a&&b);
  const start={x:a.x+a.width/2,y:a.y+a.height/2},end={x:b.x+b.width/2,y:b.y+b.height/2};
  if(browserType===chromium){
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
    for(let i=1;i<=12;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/12,y:start.y+(end.y-start.y)*i/12}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await cdp.detach();
  }else{
    await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:12});await page.mouse.up();
  }
}
async function completeAssembly(page,browserType,useDragFirst=false){
  const stage=page.locator('.nel-shape-compose-lesson-stage');
  const slots=stage.locator('.nel-shape-compose-slot');
  const slotCount=await slots.count();
  assert.ok(slotCount>=2,'composition Learn must require at least two spatial pieces');
  for(let i=0;i<slotCount;i++){
    const slot=slots.nth(i);
    const value=await slot.getAttribute('data-compose-value');
    const chips=stage.locator('.nel-shape-compose-chip[data-compose-value="'+value+'"]:not(:disabled)');
    assert.ok(await chips.count(), 'missing usable '+value+' piece for spatial slot');
    await place(page,chips.first(),slot,useDragFirst&&i===0,browserType);
    await page.waitForTimeout(30);
    assert.equal(await slot.evaluate(el=>el.classList.contains('filled')),true,'slot '+i+' must become spatially filled');
  }
  assert.equal(await stage.locator('.nel-shape-compose-core').getAttribute('data-compose-complete'),'true');
}
async function targetPieceValues(page){
  return await page.locator('.sg-compose-target .sg-composite-svg').evaluate(svg=>[...svg.children].map(node=>{
    const tag=node.tagName.toLowerCase();
    if(tag==='circle') return 'circle';
    if(tag==='polygon') return 'triangle';
    if(tag==='rect'){
      const w=Number(node.getAttribute('width')),h=Number(node.getAttribute('height'));
      return Math.abs(w-h)<0.01?'square':'rect';
    }
    return 'unknown';
  }));
}
async function solveSelectionBuilder(page){
  const expected=await targetPieceValues(page);
  assert.ok(expected.length>=2&&expected.every(x=>x!=='unknown'),'Practice target must decompose to Preschool basic shapes');
  for(const value of expected){
    const candidates=page.locator('.sg-compose-piece[data-value="'+value+'"]:not(.selected)');
    assert.ok(await candidates.count(),'missing Practice piece '+value);
    await candidates.first().tap();
  }
  await page.locator('#checkManipulator').tap();
}
async function completePracticeQuestion(page){
  if(await page.locator('.sg-shape-compose-builder').count()){await solveSelectionBuilder(page);return;}
  if(await page.locator('[data-answer="correct"]').count()){await page.locator('[data-answer="correct"]').first().tap();return;}
  const explanation='Temel şekil parçaları bir araya getirilerek yeni bir şekil ya da figür oluşturulabilir.';
  const candidate=page.locator('[data-answer]').filter({hasText:explanation});
  if(await candidate.count()){await candidate.first().tap();return;}
  throw new Error('Unhandled KSD 4.3 Practice/Review interaction');
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
      assert.equal(steps.length,7,'shape composition must expose seven spatial Learn steps');

      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-shape-compose-lesson-stage');await stage.waitFor();
        const id=await stage.getAttribute('data-nel-shape-compose-step');
        const next=page.locator('#nelShapeComposeLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require actual assembly');

        if(id==='official-boat'){
          const values=await stage.locator('.nel-shape-compose-slot').evaluateAll(xs=>xs.map(x=>x.dataset.composeValue).sort());
          assert.deepEqual(values,['square','square','triangle'],'official boat Learn must remain exactly 2 squares + 1 triangle');
        }
        if(id==='rectangle-circles-car'){
          const values=await stage.locator('.nel-shape-compose-slot').evaluateAll(xs=>xs.map(x=>x.dataset.composeValue).sort());
          assert.deepEqual(values,['circle','circle','rect']);
        }
        if(id==='circle-rectangle-tree'){
          const values=await stage.locator('.nel-shape-compose-slot').evaluateAll(xs=>xs.map(x=>x.dataset.composeValue).sort());
          assert.deepEqual(values,['circle','rect']);
        }

        await completeAssembly(page,config.type,Number(step.index)%2===0);
        assert.equal(await next.isEnabled(),true,id+' completion');
        assert.equal(await stage.locator('#nelShapeComposeResult').evaluate(el=>el.classList.contains('revealed')),true);
        await noOverflow(page);
        if(['official-boat','rectangle-circles-car','circle-rectangle-tree'].includes(id)){
          await page.screenshot({path:'preschool-shape-compose-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      for(const section of ['select-pieces-for-figure','match-pieces-to-figure','show-composition-parts','explain-shapes-form-figure','transfer-block-play-compose']){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not become a numeric worksheet');
        await noOverflow(page);
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
      console.log(config.name+': PASS (7 spatial Learn; drag/tap; official boat; all four shape types; 5 Practice; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-shape-compose-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
