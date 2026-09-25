import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4189';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4189'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-numeral-formation-test-results',{recursive:true});
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

const words={1:'bir',2:'iki',3:'üç',4:'dört',5:'beş',6:'altı',7:'yedi',8:'sekiz',9:'dokuz',10:'on'};

async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelNumeralFormation10');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL numeral-formation content must fit viewport width');
}
async function readGuides(root){
  const encoded=await root.getAttribute('data-numeral-guides');
  assert.ok(encoded,'drawing board must carry canonical geometric guides');
  const guides=JSON.parse(decodeURIComponent(encoded));
  assert.ok(guides.length>=1&&guides.length<=2,'numeral board must have one or two digit guides');
  return guides;
}
async function drawGuide(page,root,{reverse=false}={}){
  const svg=root.locator('.nel-numeral-svg');
  const box=await svg.boundingBox();
  assert.ok(box&&box.width>=260&&box.height>=260,'drawing board must remain large enough for touch/stylus use');
  const guides=await readGuides(root);
  for(const guide of guides){
    const points=reverse?[...guide.points].reverse():guide.points;
    const xy=([x,y])=>({x:box.x+box.width*Number(x)/100,y:box.y+box.height*Number(y)/100});
    const first=xy(points[0]);
    await page.mouse.move(first.x,first.y);
    await page.mouse.down();
    for(const point of points.slice(1)){
      const p=xy(point);
      await page.mouse.move(p.x,p.y,{steps:10});
    }
    await page.mouse.up();
  }
  await page.waitForTimeout(30);
}
async function scribbleOffPath(page,root){
  const svg=root.locator('.nel-numeral-svg'),box=await svg.boundingBox();
  const y=box.y+box.height*.97;
  await page.mouse.move(box.x+box.width*.08,y);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.92,y,{steps:18});
  await page.mouse.up();
}
async function assertReady(root){
  assert.equal(await root.getAttribute('data-numeral-ready'),'true','canonical drawing must satisfy recognisable numeral geometry');
  assert.ok(Number(await root.getAttribute('data-numeral-coverage'))>=70,'completed numeral needs strong core-guide coverage');
}
async function completePractice(page,section){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not use keypad/numeric-entry evidence');
  if(section==='explain-written-record'){
    const numeral=Number((await page.locator('.nel-numeral-record-symbol').textContent()||'').trim());
    assert.ok(words[numeral]);
    await page.locator('[data-answer="Bu yazı '+words[numeral]+' sayısını kaydediyor."]').tap();
    return;
  }
  const root=page.locator('.nel-numeral-board');
  assert.equal(await root.count(),1,section+' must expose a real formation board');
  if(section==='write-known-numeral'||section==='record-meaningful-number'){
    assert.equal(await root.locator('.nel-numeral-guide').count(),0,section+' must keep the acceptance guide visually hidden');
  }else{
    assert.ok(await root.locator('.nel-numeral-guide').count()>=1,section+' must show supported formation guidance');
  }
  if(section==='record-meaningful-number') assert.equal(await root.locator('.nel-numeral-context-banner').count(),1,'transfer must use a meaningful score-recording context');
  await drawGuide(page,root,{reverse:section==='follow-numeral-path'});
  await assertReady(root);
  await page.locator('#checkManipulator').tap();
}
async function completeReview(page){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,'numeral-formation Review must not fall back to keypad input');
  if(await page.locator('.nel-numeral-board').count()){
    const root=page.locator('.nel-numeral-board');
    await drawGuide(page,root,{reverse:true});
    await assertReady(root);
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(await page.locator('.nel-numeral-written-record').count()){
    const numeral=Number((await page.locator('.nel-numeral-record-symbol').textContent()||'').trim());
    await page.locator('[data-answer="Bu yazı '+words[numeral]+' sayısını kaydediyor."]').tap();
    return;
  }
  throw new Error('Numeral-formation Review response missing');
}

try{
  for(const config of configs){
    const browser=await config.type.launch({headless:true});
    const context=await browser.newContext({viewport:config.viewport,isMobile:true,hasTouch:true,serviceWorkers:'block'});
    await context.addInitScript(value=>{if(!localStorage.getItem('saymera.math.v2'))localStorage.setItem('saymera.math.v2',value)},saved);
    const page=await context.newPage();
    page.setDefaultTimeout(12000);
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try{
      await openInspector(page);
      const steps=await page.locator('#inspectorLessonStep option').evaluateAll(xs=>xs.map(x=>({index:x.value,label:x.textContent})));
      assert.equal(steps.length,10,'numeral formation must expose 10 Learn steps covering 1..10');

      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-numeral-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-numeral-step');
        const root=stage.locator('.nel-numeral-board');
        const next=page.locator('#nelNumeralLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child formation action');
        assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,id+' must never substitute keypad entry for writing');

        const numeral=Number(await root.getAttribute('data-numeral'));
        assert.equal(numeral,Number(step.index)+1,'Learn sequence must cover numerals 1 through 10 without gaps');
        const guides=await readGuides(root);
        assert.equal(guides.length,numeral===10?2:1,'10 must require both written digit components');

        if(id==='trace-two'){
          await scribbleOffPath(page,root);
          assert.equal(await root.getAttribute('data-numeral-ready'),'false','off-path scribble must not pass formation evidence');
          assert.equal(await next.isDisabled(),true,'off-path scribble cannot advance Learn');
          await root.locator('[data-numeral-clear]').tap();
        }

        await drawGuide(page,root,{reverse:id==='trace-seven'});
        await assertReady(root);
        assert.equal(await next.isEnabled(),true,id+' must accept recognisable geometry independent of stroke direction');
        await noOverflow(page);

        if(['playdough-five','trace-eight','write-ten'].includes(id)){
          await page.screenshot({path:'preschool-numeral-formation-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      const sections=['form-numeral-material','follow-numeral-path','write-known-numeral','explain-written-record','record-meaningful-number'];
      for(const section of sections){
        await openInspector(page);
        await page.locator('#inspectorPracticeSection').selectOption(section);
        await page.locator('#inspectorLaunchPractice').tap();
        await page.locator('.question-stage').waitFor();
        await noOverflow(page);
        await completePractice(page,section);
      }

      await openInspector(page);
      await page.locator('#inspectorLaunchReview').tap();
      await page.locator('.question-stage').waitFor();
      assert.equal((await page.locator('#practiceMode').textContent()||'').trim(),'KISA TEKRAR');
      await noOverflow(page);
      await completeReview(page);

      assert.equal(await page.evaluate(()=>localStorage.getItem('saymera.math.v2')),saved,'Inspector must not write real preschool progress');
      assert.deepEqual(errors,[]);
      console.log(config.name+': PASS (10 Learn numerals; scribble rejection; reverse-direction tolerance; 5 Practice sections; Review; touch size; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-numeral-formation-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{
      await browser.close();
    }
  }
}finally{
  server?.kill();
}
