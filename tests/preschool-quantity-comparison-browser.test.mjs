import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {createServer} from 'node:http';
import {mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {extname,resolve,sep} from 'node:path';
import {defaultState} from '../engine.mjs';

const externalBase=process.env.SAYMERA_TEST_URL||null;
let activeBase=externalBase||'http://127.0.0.1:48190';
const repoRoot=resolve(fileURLToPath(new URL('..',import.meta.url)));
await mkdir('preschool-quantity-comparison-test-results',{recursive:true});
const mimeTypes={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
async function startServerFor(index){
  if(externalBase){activeBase=externalBase;return null;}
  const port=48190+index;
  activeBase='http://127.0.0.1:'+port;
  const server=createServer(async(req,res)=>{
    try{
      const pathname=decodeURIComponent(new URL(req.url||'/','http://127.0.0.1').pathname);
      const relative=pathname==='/'?'index.html':pathname.split('/').filter(Boolean).join('/');
      const filePath=resolve(repoRoot,relative);
      if(filePath!==repoRoot&&!filePath.startsWith(repoRoot+sep)){res.writeHead(403);res.end('Forbidden');return;}
      const data=await readFile(filePath);
      res.writeHead(200,{'Content-Type':mimeTypes[extname(filePath)]||'application/octet-stream','Cache-Control':'no-store'});
      res.end(data);
    }catch{
      res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
      res.end('Not found');
    }
  });
  await new Promise((resolveReady,reject)=>{
    const onError=error=>reject(error);
    server.once('error',onError);
    server.listen(port,'127.0.0.1',()=>{server.off('error',onError);resolveReady();});
  });
  return server;
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
  await page.goto(activeBase+'/?inspect=1',{waitUntil:'commit',timeout:20000});
  await page.locator('#inspectorProfile').waitFor({state:'visible',timeout:24000});
  await page.locator('#inspectorProfile').selectOption('preschool');
  await page.locator('#inspectorSkill').selectOption('nelCompareQuantities10');
}
async function noOverflow(page){
  assert.equal(await page.locator('#practiceContent').evaluate(el=>el.scrollWidth>el.clientWidth+2),false,'NEL quantity-comparison content must fit viewport width');
}
async function setCounts(root){
  const left=await root.locator('[data-quantity-set="left"] [data-quantity-item]').count();
  const right=await root.locator('[data-quantity-set="right"] [data-quantity-item]').count();
  return {left,right};
}
function sideAnswer(left,right){
  if(left===right)return 'İki küme aynı sayıda.';
  return left>right?'Sol kümede daha çok nesne var.':'Sağ kümede daha çok nesne var.';
}
function leftRelation(left,right){
  if(left===right)return 'Sol küme sağ kümeyle aynı sayıda.';
  return left>right?'Sol kümede daha çok nesne var.':'Sol kümede daha az sayıda nesne var.';
}
function explainAnswer(left,right){
  if(left===right)return 'Bire bir eşleştirince her nesnenin bir eşi var; eşsiz nesne kalmıyor.';
  if(left>right)return 'Bire bir eşleştirince sol kümede eşsiz nesne kalıyor; sol kümede daha çok nesne var.';
  return 'Bire bir eşleştirince sağ kümede eşsiz nesne kalıyor; sol kümede daha az sayıda nesne var.';
}
async function pairAll(page,root){
  const left=root.locator('[data-quantity-side="left"]');
  const right=root.locator('[data-quantity-side="right"]');
  const leftN=await left.count(),rightN=await right.count(),target=Math.min(leftN,rightN);
  assert.ok(target>=1);
  for(let i=0;i<target;i++){
    await left.nth(i).tap();
    await right.nth(i).tap();
  }
  assert.equal(await root.getAttribute('data-pair-complete'),'true','smaller set must be completely one-to-one paired');
  assert.equal(Number(await root.getAttribute('data-paired-count')),target);
  const unmatched=await root.locator('[data-quantity-item].unmatched').count();
  assert.equal(unmatched,Math.abs(leftN-rightN),'only genuine cardinal leftovers should remain unmatched');
  return {left:leftN,right:rightN};
}
async function chooseRelation(root,value){
  const button=root.locator('[data-quantity-relation-choice="'+value.replaceAll('"','\\"')+'"]');
  assert.equal(await button.count(),1,'expected comparison-language option must exist: '+value);
  await button.tap();
}
async function completeLearnStep(page,id){
  const core=page.locator('.nel-quantity-lesson-core');
  const next=page.locator('#nelQuantityLessonNext');
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,id+' must not use numeric-entry evidence');
  const childText=(await page.locator('#practiceContent').textContent())||'';
  assert.equal(/[<>]/.test(childText),false,id+' must not pull formal comparison signs into Preschool');

  if(id==='pair-same-four'||id==='pair-more-five-three'){
    const root=core.locator('.nel-quantity-pair-builder');
    const before=await setCounts(root);
    if(before.left!==before.right){
      const allTokens=root.locator('[data-quantity-item]');
      const sizes=await allTokens.evaluateAll(nodes=>nodes.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));
      assert.ok(sizes.every(x=>x.w>=30&&x.h>=30),'pairing tokens must remain touchable');
    }
    const min=Math.min(before.left,before.right);
    if(min>1){
      await root.locator('[data-quantity-side="left"]').nth(0).tap();
      await root.locator('[data-quantity-side="right"]').nth(0).tap();
      assert.equal(await next.isDisabled(),true,'partial pairing cannot advance');
      for(let i=1;i<min;i++){
        await root.locator('[data-quantity-side="left"]').nth(i).tap();
        await root.locator('[data-quantity-side="right"]').nth(i).tap();
      }
    }else await pairAll(page,root);
    assert.equal(await root.getAttribute('data-pair-complete'),'true');
    assert.equal(await next.isEnabled(),true);
    assert.equal(await root.locator('[data-quantity-item].unmatched').count(),Math.abs(before.left-before.right));
    return;
  }

  if(['see-right-more','resist-size-spacing'].includes(id)){
    const root=core.locator('.nel-quantity-relation-choice');
    const counts=await setCounts(root);
    const sets=root.locator('[data-quantity-set]');
    assert.equal(await sets.count(),2);
    if(id==='resist-size-spacing'){
      const leftStyle=await sets.nth(0).getAttribute('style'),rightStyle=await sets.nth(1).getAttribute('style');
      assert.notEqual(leftStyle,rightStyle,'misleading visual scale must vary while cardinality decides the answer');
    }
    await chooseRelation(root,sideAnswer(counts.left,counts.right));
    assert.equal(await next.isEnabled(),true);
    return;
  }

  if(['fewer-language','same-ten','reverse-relation'].includes(id)){
    const root=core.locator('.nel-quantity-relation-choice');
    const counts=await setCounts(root);
    await chooseRelation(root,leftRelation(counts.left,counts.right));
    assert.equal(await next.isEnabled(),true);
    return;
  }

  if(id==='less-language'){
    const buttons=core.locator('[data-quantity-language]');
    assert.equal(await buttons.count(),2);
    await buttons.nth(0).tap();
    assert.equal(await next.isDisabled(),true,'one localisation phrase alone must not complete the teaching step');
    await buttons.nth(1).tap();
    assert.equal(await next.isEnabled(),true);
    return;
  }

  if(id==='explain-leftover'){
    const proof=core.locator('.nel-quantity-proof');
    assert.equal(await proof.count(),1);
    assert.ok(await proof.locator('.unmatched').count()>=1,'explanation must visibly ground more/fewer in unmatched objects');
    assert.equal(/\b\d+\s+nesne\s+(?:artıyor|kalıyor)/i.test((await proof.textContent())||''),false,'core explanation must not require counting the difference');
    await page.locator('#nelQuantityConfirm').tap();
    assert.equal(await next.isEnabled(),true);
    return;
  }

  if(id==='object-graph'){
    const graph=core.locator('.nel-quantity-object-graph');
    assert.equal(await graph.getAttribute('data-quantity-context'),'real-object-graph');
    const rows=graph.locator('.nel-quantity-graph-row>div');
    assert.equal(await rows.count(),2);
    for(let i=0;i<2;i++){
      const tops=await rows.nth(i).locator('.nel-quantity-graph-object').evaluateAll(nodes=>nodes.map(n=>Math.round(n.getBoundingClientRect().top)));
      assert.ok(tops.length>=1&&Math.max(...tops)-Math.min(...tops)<=4,'real-object graph must keep each compared set in one aligned row');
    }
    const left=await rows.nth(0).locator('.nel-quantity-graph-object').count();
    const right=await rows.nth(1).locator('.nel-quantity-graph-object').count();
    await chooseRelation(graph,sideAnswer(left,right));
    assert.equal(await next.isEnabled(),true);
    return;
  }
  throw new Error('Unhandled quantity Learn step '+id);
}

async function completePractice(page,section){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,section+' must compare sets rather than typed numerals');
  const allText=(await page.locator('#practiceContent').textContent())||'';
  assert.equal(/[<>]/.test(allText),false,section+' must not use formal comparison symbols');
  assert.equal(/kaç tane daha (?:çok|az)/i.test(allText),false,section+' must keep the optional difference extension outside core mastery');

  if(section==='pair-sets-one-to-one'){
    const root=page.locator('.nel-quantity-pair-builder');
    await pairAll(page,root);
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(section==='see-same-or-more'){
    const root=page.locator('#visualStage .nel-quantity-set-pair');
    const counts=await setCounts(root);
    await page.locator('[data-answer="'+sideAnswer(counts.left,counts.right).replaceAll('"','\\"')+'"]').tap();
    return;
  }
  if(section==='use-fewer-less-language'){
    const root=page.locator('.nel-quantity-relation-choice');
    const counts=await setCounts(root);
    assert.ok(counts.left<counts.right,'fewer/less practice must genuinely present a smaller left set');
    await chooseRelation(root,leftRelation(counts.left,counts.right));
    await page.locator('#checkManipulator').tap();
    return;
  }
  if(section==='explain-leftover-relation'){
    const proof=page.locator('.nel-quantity-proof');
    const rows=proof.locator('.nel-quantity-proof-row');
    assert.ok(await rows.count()>=1,'paired proof must contain comparison rows');
    const visual=page.locator('#visualStage');
    const leftTokens=await visual.locator('.nel-quantity-proof-row > .nel-quantity-token:nth-child(1)').count();
    const rightTokens=await visual.locator('.nel-quantity-proof-row > .nel-quantity-token:nth-child(3)').count();
    const answer=explainAnswer(leftTokens,rightTokens);
    assert.equal(/\b\d+\s+nesne\s+(?:artıyor|kalıyor)/i.test((await page.locator('#practiceContent').textContent())||''),false);
    await page.locator('[data-answer="'+answer.replaceAll('"','\\"')+'"]').tap();
    return;
  }
  if(section==='transfer-real-object-graph'){
    const graph=page.locator('.nel-quantity-object-graph');
    assert.equal(await graph.getAttribute('data-quantity-context'),'real-object-graph');
    const rows=graph.locator('.nel-quantity-graph-row>div');
    const left=await rows.nth(0).locator('.nel-quantity-graph-object').count();
    const right=await rows.nth(1).locator('.nel-quantity-graph-object').count();
    await chooseRelation(graph,sideAnswer(left,right));
    await page.locator('#checkManipulator').tap();
    return;
  }
  throw new Error('Unhandled quantity Practice section '+section);
}

async function completeReview(page){
  assert.equal(await page.locator('input[inputmode="numeric"]').count(),0,'quantity-comparison Review must not use keypad input');
  if(await page.locator('.nel-quantity-pair-builder').count()){
    await pairAll(page,page.locator('.nel-quantity-pair-builder'));
    await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-quantity-relation-choice').count()){
    const root=page.locator('.nel-quantity-relation-choice'),counts=await setCounts(root);
    const values=await root.locator('[data-quantity-relation-choice]').evaluateAll(xs=>xs.map(x=>x.getAttribute('data-quantity-relation-choice')));
    const side=sideAnswer(counts.left,counts.right),left=leftRelation(counts.left,counts.right);
    const answer=values.includes(side)?side:left;
    await chooseRelation(root,answer);await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-quantity-object-graph').count()){
    const graph=page.locator('.nel-quantity-object-graph'),rows=graph.locator('.nel-quantity-graph-row>div');
    const left=await rows.nth(0).locator('.nel-quantity-graph-object').count(),right=await rows.nth(1).locator('.nel-quantity-graph-object').count();
    await chooseRelation(graph,sideAnswer(left,right));await page.locator('#checkManipulator').tap();return;
  }
  if(await page.locator('.nel-quantity-proof').count()){
    const visual=page.locator('#visualStage');
    const left=await visual.locator('.nel-quantity-proof-row > .nel-quantity-token:nth-child(1)').count();
    const right=await visual.locator('.nel-quantity-proof-row > .nel-quantity-token:nth-child(3)').count();
    await page.locator('[data-answer="'+explainAnswer(left,right).replaceAll('"','\\"')+'"]').tap();return;
  }
  if(await page.locator('#visualStage .nel-quantity-set-pair').count()){
    const root=page.locator('#visualStage .nel-quantity-set-pair'),counts=await setCounts(root);
    await page.locator('[data-answer="'+sideAnswer(counts.left,counts.right).replaceAll('"','\\"')+'"]').tap();return;
  }
  throw new Error('Quantity-comparison Review response missing');
}

for(let configIndex=0;configIndex<configs.length;configIndex++){
  const config=configs[configIndex];
  const localServer=await startServerFor(configIndex);
  const browser=await config.type.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:config.viewport,isMobile:true,hasTouch:true,serviceWorkers:'block'});
    await context.addInitScript(value=>{if(!localStorage.getItem('saymera.math.v2'))localStorage.setItem('saymera.math.v2',value)},saved);
    const page=await context.newPage();
    page.setDefaultTimeout(16000);
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try{
      await openInspector(page);
      const steps=await page.locator('#inspectorLessonStep option').evaluateAll(xs=>xs.map(x=>({index:x.value,label:x.textContent})));
      assert.equal(steps.length,10,'quantity comparison must expose ten Learn steps');

      for(const step of steps){
        await openInspector(page);
        await page.locator('#inspectorLessonStep').selectOption(step.index);
        await page.locator('#inspectorLaunchLearn').tap();
        const stage=page.locator('.nel-quantity-lesson-stage');
        await stage.waitFor();
        const id=await stage.getAttribute('data-nel-quantity-step');
        const next=page.locator('#nelQuantityLessonNext');
        assert.equal(await next.isDisabled(),true,id+' must require a child action');
        await completeLearnStep(page,id);
        assert.equal(await next.isEnabled(),true,id+' completion');
        await noOverflow(page);
        if(['pair-more-five-three','resist-size-spacing','less-language','same-ten','object-graph'].includes(id)){
          await page.screenshot({path:'preschool-quantity-comparison-test-results/'+config.name+'-'+id+'.png',fullPage:false,animations:'disabled'});
        }
      }

      const sections=['pair-sets-one-to-one','see-same-or-more','use-fewer-less-language','explain-leftover-relation','transfer-real-object-graph'];
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
      console.log(config.name+': PASS (10 Learn steps; one-to-one pairing; same/more/fewer language; misleading visual cues; object graph; 5 Practice sections; Review; width; sandbox)');
    }catch(error){
      await page.screenshot({path:'preschool-quantity-comparison-test-results/'+config.name+'-failure.png',fullPage:false,animations:'disabled'});
      throw error;
    }
  }finally{
    await browser.close();
    if(localServer) await new Promise((resolveClose,reject)=>localServer.close(error=>error?reject(error):resolveClose()));
  }
}
