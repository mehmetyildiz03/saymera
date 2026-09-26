import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {defaultState} from '../engine.mjs';

const base=process.env.SAYMERA_TEST_URL||'http://127.0.0.1:4192';
const server=process.env.SAYMERA_TEST_URL?null:spawn('python3',['-m','http.server','4192'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
await mkdir('preschool-shape-attributes-test-results',{recursive:true});
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
const summaries={
  circle:'Düz kenarı ve köşesi yok; sınırı eğridir.',
  triangle:'3 düz kenarı ve 3 köşesi vardır.',
  square:'4 düz kenarı ve 4 köşesi vardır; 4 kenarı da eşit uzunluktadır.',
  rectangle:'4 düz kenarı ve 4 köşesi vardır; bu örnekte bütün kenarlar aynı uzunlukta değildir.'
};

async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelShapeAttributes');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL shape-attributes content must fit viewport width');
}
async function visibleShape(root){
  const node=root.locator('[data-basic-shape]').first();
  const shape=await node.getAttribute('data-basic-shape');
  assert.ok(['circle','square','rectangle','triangle'].includes(shape),'shape-attribute screen must use one of four basic shapes');
  return shape;
}
async function completeInspect(root,next=null){
  const buttons=root.locator('[data-attribute-check]');
  const count=await buttons.count();
  assert.ok(count>=1,'attribute inspection needs at least one observable checkpoint');
  if(count>1){
    await buttons.first().tap();
    assert.equal(await root.getAttribute('data-attribute-ready'),'false','partial attribute inspection must not count as complete');
    if(next) assert.equal(await next.isDisabled(),true,'partial inspection cannot advance Learn');
    for(let i=1;i<count;i++) await buttons.nth(i).tap();
  }else await buttons.first().tap();
  assert.equal(await root.getAttribute('data-attribute-ready'),'true','all required attribute checkpoints must complete inspection evidence');
}
async function completeLearn(page,id){
  const stage=page.locator('.nel-shape-attribute-lesson-stage');
  const core=stage.locator('.nel-shape-attribute-lesson-core');
  const next=page.locator('#nelShapeAttributeLessonNext');

  if(['triangle-three-sides','square-four-equal','circle-curved-boundary','rectangle-four-corners'].includes(id)){
    const root=core.locator('.nel-shape-attribute-inspect');
    await completeInspect(root,next);
    if(id==='triangle-three-sides') assert.equal(await root.locator('[data-attribute-check^="side-"]').count(),3);
    if(id==='square-four-equal'){
      assert.equal(await root.locator('[data-attribute-check^="side-"]').count(),4);
      assert.equal(await root.locator('[data-attribute-check="equal-sides"]').count(),1,'square Learn must explicitly compare four equal sides');
    }
    if(id==='circle-curved-boundary'){
      assert.equal(await root.locator('[data-attribute-check="curved-boundary"]').count(),1);
      assert.equal(await root.locator('[data-attribute-check^="corner-"]').count(),0);
    }
    if(id==='rectangle-four-corners'){
      assert.equal(await root.locator('[data-attribute-check^="side-"]').count(),4);
      assert.equal(await root.locator('[data-attribute-check="equal-sides"]').count(),0,'non-square rectangle inspection must not require square equal-side evidence');
    }
    return;
  }

  if(['triangle-rotation-attributes','square-rotation-attributes'].includes(id)){
    const pair=core.locator('.nel-shape-attribute-pair');
    assert.equal(await pair.locator('[data-basic-shape]').count(),2);
    const shapes=await pair.locator('[data-basic-shape]').evaluateAll(xs=>xs.map(x=>x.dataset.basicShape));
    assert.equal(new Set(shapes).size,1,'invariance Learn must compare the same shape in two appearances');
    const rotations=await pair.locator('[data-shape-rotation]').evaluateAll(xs=>xs.map(x=>x.dataset.shapeRotation));
    assert.ok(new Set(rotations).size>=2,'invariance Learn must actually change orientation');
    await core.locator('[data-shape-attribute-explain="colour"]').tap();
    assert.equal(await next.isDisabled(),true,'colour misconception cannot advance attribute Learn');
    await core.locator('[data-shape-attribute-explain="same"]').tap();
    return;
  }

  if(['triangle-clue','rectangle-safe-clue'].includes(id)){
    const root=core.locator('.nel-shape-attribute-clue-match');
    const target=await root.getAttribute('data-attribute-target');
    const labels=await root.locator('[data-shape-attribute-clue] span').allTextContents();
    assert.ok(labels.every(x=>x.trim()==='Dinle'),'attribute clues must not require reading');
    if(id==='rectangle-safe-clue'){
      const speech=await root.locator('[data-shape-attribute-clue="rectangle"]').getAttribute('data-rote-speech');
      assert.match(speech||'',/bütün kenarları aynı uzunlukta olmayan/i,'rectangle clue must disambiguate this non-square exemplar');
      await root.locator('[data-shape-attribute-clue="square"]').tap();
      assert.equal(await next.isDisabled(),true,'ambiguous/wrong square clue cannot advance rectangle Learn');
    }
    await root.locator('[data-shape-attribute-clue="'+target+'"]').tap();
    return;
  }

  if(id==='explain-not-colour'){
    await core.locator('[data-shape-attribute-explain="colour"]').tap();
    assert.equal(await next.isDisabled(),true,'colour cannot be accepted as a defining attribute');
    await core.locator('[data-shape-attribute-explain="attributes"]').tap();
    return;
  }

  if(id==='environment-attributes'){
    const root=core.locator('.nel-shape-attribute-environment');
    const shape=await visibleShape(root);
    const context=(await root.getAttribute('data-attribute-context')||'').toLocaleLowerCase('tr-TR');
    assert.ok(context.length>0);
    assert.equal(/daire|kare|dikdörtgen|üçgen/.test(context),false,'environment label must not reveal the basic-shape answer');
    await root.locator('[data-shape-attribute-clue="'+shape+'"]').tap();
    return;
  }

  throw new Error('Unhandled shape-attribute Learn step '+id);
}

async function completePractice(page,section){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not use numeric input');
  if(section==='trace-shape-boundary'){
    const root=page.locator('.nel-shape-attribute-inspect');
    await completeInspect(root);
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(section==='see-shape-attributes'||section==='explain-shape-by-attributes'){
    const root=page.locator(section==='see-shape-attributes'?'.nel-shape-attribute-pair':'.nel-shape-attribute-card');
    const shape=await visibleShape(root);
    await page.locator('[data-answer="'+summaries[shape]+'"]').tap();
    return;
  }
  if(section==='match-shape-attribute-clues'){
    const root=page.locator('.nel-shape-attribute-clue-match');
    const shape=await root.getAttribute('data-attribute-target');
    const labels=await root.locator('[data-shape-attribute-clue] span').allTextContents();
    assert.ok(labels.every(x=>x.trim()==='Dinle'));
    if(shape==='rectangle'){
      const speech=await root.locator('[data-shape-attribute-clue="rectangle"]').getAttribute('data-rote-speech');
      assert.match(speech||'',/bütün kenarları aynı uzunlukta olmayan/i);
    }
    await root.locator('[data-shape-attribute-clue="'+shape+'"]').tap();
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(section==='transfer-environment-attributes'){
    const root=page.locator('.nel-shape-attribute-environment');
    const shape=await visibleShape(root);
    const context=(await root.getAttribute('data-attribute-context')||'').toLocaleLowerCase('tr-TR');
    assert.equal(/daire|kare|dikdörtgen|üçgen/.test(context),false);
    await root.locator('[data-shape-attribute-clue="'+shape+'"]').tap();
    await page.locator('#checkManipulator').tap();
    return;
  }
  throw new Error('Unhandled shape-attribute Practice section '+section);
}

async function completeReview(page){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,'shape-attribute Review must not use numeric input');
  if(await page.locator('.nel-shape-attribute-inspect').count()){
    await completeInspect(page.locator('.nel-shape-attribute-inspect'));
    await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-shape-attribute-clue-match').count()){
    const root=page.locator('.nel-shape-attribute-clue-match'),shape=await root.getAttribute('data-attribute-target');
    await root.locator('[data-shape-attribute-clue="'+shape+'"]').tap();await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-shape-attribute-environment').count()){
    const root=page.locator('.nel-shape-attribute-environment'),shape=await visibleShape(root);
    await root.locator('[data-shape-attribute-clue="'+shape+'"]').tap();await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-shape-attribute-pair').count()){
    const shape=await visibleShape(page.locator('.nel-shape-attribute-pair'));
    await page.locator('[data-answer="'+summaries[shape]+'"]').tap();return;
  }
  if(await page.locator('.nel-shape-attribute-card').count()){
    const shape=await visibleShape(page.locator('.nel-shape-attribute-card'));
    await page.locator('[data-answer="'+summaries[shape]+'"]').tap();return;
  }
  throw new Error('Shape-attribute Review response missing');
}

try{
  for(const config of configs){
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
      assert.equal(steps.length,10,'shape attributes must expose ten Learn steps');

      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-shape-attribute-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-shape-attribute-step');
        const next=page.locator('#nelShapeAttributeLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require child action');
        const childText=(await stage.innerText()).toLocaleLowerCase('tr-TR');
        assert.equal(/non-square|paralel|perpendicular|açı ölç|derece/.test(childText),false,id+' must stay child-appropriate and inside KSD 4.2 boundary');
        await completeLearn(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);

        if(['square-four-equal','triangle-rotation-attributes','rectangle-safe-clue','environment-attributes'].includes(id)){
          await page.screenshot({path:'preschool-shape-attributes-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      for(const section of ['trace-shape-boundary','see-shape-attributes','match-shape-attribute-clues','explain-shape-by-attributes','transfer-environment-attributes']){
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
      console.log(config.name+': PASS (10 Learn; complete attribute inspection; rotation invariance; audio clues; rectangle ambiguity guard; 5 Practice; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-shape-attributes-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
