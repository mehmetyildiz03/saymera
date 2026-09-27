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

const attrByShape={
  circle:'Düz kenarı ve köşesi yoktur.',
  square:'Dört kenarı ve dört köşesi vardır; dört kenarı da eşit uzunluktadır.',
  rectangle:'Dört kenarı ve dört köşesi vardır.',
  triangle:'Üç kenarı ve üç köşesi vardır.'
};
const countByShape={
  circle:'0 düz kenar, 0 köşe',
  square:'4 düz kenar, 4 köşe',
  rectangle:'4 düz kenar, 4 köşe',
  triangle:'3 düz kenar, 3 köşe'
};

async function openInspector(page){
  await page.goto(base+'/?inspect=1');
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelShapeAttributes');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL shape-attributes content must fit viewport width');
}
async function shapeIn(root){
  const node=root.locator('[data-basic-shape]').first();
  const shape=await node.getAttribute('data-basic-shape');
  assert.ok(Object.hasOwn(attrByShape,shape),'shape attributes must stay on the four official shapes');
  return shape;
}
async function tapChoiceWithText(page,text){
  const choices=page.locator('[data-answer]');
  const count=await choices.count();
  for(let i=0;i<count;i++){
    const node=choices.nth(i);
    if((await node.innerText()).trim()===text){await node.tap();return;}
  }
  throw new Error('Missing choice: '+text);
}
async function completeLearn(page,id){
  const stage=page.locator('.nel-shape-attribute-lesson-stage');
  const core=stage.locator('.nel-shape-attribute-lesson-core');
  if(['triangle-three-sides','triangle-three-corners','square-four-sides','square-four-equal-sides','rectangle-four-corners'].includes(id)){
    const expected={
      'triangle-three-sides':3,
      'triangle-three-corners':3,
      'square-four-sides':4,
      'square-four-equal-sides':4,
      'rectangle-four-corners':4
    }[id];
    const markers=core.locator('[data-attribute-marker]');
    assert.equal(await markers.count(),expected,id+' must expose one touch target per target attribute');
    for(let i=0;i<expected;i++) await markers.nth(i).tap();
    assert.equal(Number(await core.locator('[data-attribute-seen]').textContent()),expected,id+' marker count');
    return;
  }
  if(id==='circle-no-straight-sides'){
    assert.equal(await core.locator('[data-shape-attribute-choice="side-none"]').count(),1);
    await core.locator('[data-shape-attribute-choice="side-none"]').tap();return;
  }
  if(id==='circle-no-corners'){
    assert.equal(await core.locator('[data-shape-attribute-choice="corner-none"]').count(),1);
    await core.locator('[data-shape-attribute-choice="corner-none"]').tap();return;
  }
  if(id==='rotate-square-attributes'||id==='resize-triangle-attributes'){
    assert.equal(await core.locator('.nel-basic-shape-pair [data-basic-shape]').count(),2);
    await core.locator('[data-shape-attribute-choice="same"]').tap();return;
  }
  if(id==='environment-rectangle-attributes'){
    assert.equal(await core.locator('.nel-basic-shape-context [data-basic-shape="rectangle"]').count(),1);
    await core.locator('[data-shape-attribute-choice="rectangle-attributes"]').tap();return;
  }
  throw new Error('Unhandled shape-attribute Learn step '+id);
}
async function completePractice(page,section){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must not use numeric input');
  const visual=page.locator('#visualStage');
  if(section==='notice-equal-sides'){
    await tapChoiceWithText(page,'Dört kenarın hepsi eşit uzunluktadır.');return;
  }
  if(section==='explain-attribute-invariance'){
    await tapChoiceWithText(page,'Döndürmek veya boyutunu değiştirmek kenar ve köşe yapısını değiştirmez.');return;
  }
  const shape=await shapeIn(visual);
  if(section==='count-sides-corners'){
    await tapChoiceWithText(page,countByShape[shape]);return;
  }
  if(section==='recognise-shape-attribute'||section==='transfer-environment-attributes'){
    await tapChoiceWithText(page,attrByShape[shape]);return;
  }
  throw new Error('Unhandled shape-attribute Practice section '+section);
}
async function completeReview(page){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,'shape-attribute Review must not use numeric input');
  const prompt=(await page.locator('.question-stage h2').innerText()).trim();
  if(prompt.includes('Karenin kenarlarıyla ilgili')){
    await tapChoiceWithText(page,'Dört kenarın hepsi eşit uzunluktadır.');return;
  }
  if(prompt.includes('neden aynı kaldı')){
    await tapChoiceWithText(page,'Döndürmek veya boyutunu değiştirmek kenar ve köşe yapısını değiştirmez.');return;
  }
  const shape=await shapeIn(page.locator('#visualStage'));
  if(prompt.includes('düz kenarlarını ve köşelerini')){
    await tapChoiceWithText(page,countByShape[shape]);return;
  }
  await tapChoiceWithText(page,attrByShape[shape]);
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
        assert.equal(await stage.locator('[data-shape-attribute-choice]').count()>0 ? await stage.locator('[data-shape-attribute-choice][data-rote-speech]').count()===await stage.locator('[data-shape-attribute-choice]').count() : true,true,id+' text choices must remain audio-addressable');
        await completeLearn(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['square-four-equal-sides','rotate-square-attributes','environment-rectangle-attributes'].includes(id)){
          await page.screenshot({path:'preschool-shape-attributes-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      for(const section of ['count-sides-corners','recognise-shape-attribute','notice-equal-sides','explain-attribute-invariance','transfer-environment-attributes']){
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
      console.log(config.name+': PASS (10 Learn; side/corner/equal-side evidence; rotation/size invariance; environment transfer; 5 Practice; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-shape-attributes-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }finally{await browser.close();}
  }
}finally{server?.kill();}
