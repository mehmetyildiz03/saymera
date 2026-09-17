import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {generateQuestion, skillsFor, REPRESENTATIONS} from '../engine.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const html=read('index.html'), app=read('app.js'), css=read('styles.css'), sw=read('sw.js');
const manifest=JSON.parse(read('manifest.webmanifest'));

for(const id of ['homeScreen','atlasScreen','parentScreen','focusCard','lensGrid','homeInsightGrid','conceptPreviewRow','atlasSummary','domainTabs','skillMap','parentInsight','practiceOverlay','practiceContent','onboardingOverlay','cooldownOverlay','toast'])
  assert.match(html,new RegExp(`id=["']${id}["']`),`missing static DOM id ${id}`);

for(const cls of ['prism-card','question-stage','visual-choice-grid','number-keypad','interactive-twentyframe','sg-bond-builder','sg-base10-builder','sg-order-builder','sg-ordinal-builder','sg-equal-groups-builder','sg-share-builder','sg-money-builder','sg-cm-ruler-builder','sg-shape-compose-builder','sg-unit-builder','sg-clock-set','sg-shape-pattern-builder','solid-property-builder','solid-property-chip','clear-solid'])
  assert.ok(css.includes(`.${cls}`),`missing CSS class .${cls}`);

assert.match(app,/const STORAGE_KEY='saymera\.math\.v2'/,'SAYMERA must preserve its isolated storage namespace');

// Child surfaces must not explain internal scoring/evidence/remediation mechanics.
for(const phrase of [
  'adaptif tempo','Aynı fikir, beş kanıt.','Tek doğru cevap “öğrendi” demek için yeterli değil.',
  'Her kavramın beş kanıt penceresi ayrı izlenir','KAVRAM ATLASI'
]) assert.ok(!html.includes(phrase),`child HTML exposes internal product language: ${phrase}`);
for(const phrase of [
  'Burada puanlanan şey hız değil','HATA DEĞİL · KANIT','motor birkaç adım sonra',
  'Hız puanlanmadı','kanıt profili kaydedildi','tamamlanmayan pencereler daha sonra yeniden gelir'
]) assert.ok(!app.includes(phrase),`child runtime exposes internal product language: ${phrase}`);
assert.ok(!app.includes('task-intent'),'practice screen must not repeat representation-engine instructions to the child');

assert.match(app,/focusRepresentations/);
assert.match(app,/createConceptInstance/);
assert.match(app,/renderResponse/);
for(const marker of ['bond-fill','base10-build','order-pair','ordinal-position','equal-groups','share-equally','money-make','cm-ruler','shape-compose','unit-measure','clock-set','shape-pattern','solid-properties','three-add'])
  assert.ok(app.includes(`interaction==='${marker}'`),`app missing interaction ${marker}`);
for(const visual of ['addition-strategy','subtraction-strategy','fact-family','problem-structure','compare-base10','column-operation','money-shopping','cm-ruler-interactive','cm-ruler-model','shape-compose-interactive','composite-figure','dot-grid-figure','schedule-event','three-add-strategy','solid-property-builder','solid-pair','solid-scene','symbol-card'])
  assert.ok(app.includes(`case '${visual}'`),`app missing visual ${visual}`);

// Render-contract audit: all P1 reference tasks plus the upgraded Grade 2 solids task may not reference unsupported UI.
const generatedVisuals=new Set(), generatedInteractions=new Set();
let seedValue=987654321;
const rng=()=>((seedValue=(seedValue*1664525+1013904223)>>>0)/2**32);
const auditedSkills=[...skillsFor('grade1'),...skillsFor('grade2').filter(s=>s.id==='shapes2')];
for(const skill of auditedSkills){
  for(const rep of REPRESENTATIONS){
    for(let i=0;i<12;i++){
      const q=generateQuestion(skill.id,rep,1+(i%4),rng);
      if(q.visual?.type) generatedVisuals.add(q.visual.type);
      if(q.response?.interaction) generatedInteractions.add(q.response.interaction);
      for(const opt of q.response?.options||[]) if(opt.visual?.type) generatedVisuals.add(opt.visual.type);
    }
  }
}
for(const type of generatedVisuals) assert.ok(app.includes(`case '${type}'`),`generated audited visual has no renderer: ${type}`);
for(const interaction of generatedInteractions) assert.ok(app.includes(`interaction==='${interaction}'`),`generated audited manipulative has no interaction handler: ${interaction}`);

assert.equal(manifest.short_name,'SAYMERA');
for(const asset of ['./','./index.html','./styles.css','./app.js','./engine.mjs','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png']) assert.ok(sw.includes(`'${asset}'`),`service worker missing ${asset}`);
for(const f of ['assets/icon-192.png','assets/icon-512.png']) assert.ok(fs.existsSync(path.join(root,f)),`missing ${f}`);

const standalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');
assert.ok(fs.existsSync(standalone),'v1.2 standalone build missing');
const one=fs.readFileSync(standalone,'utf8');
assert.ok(one.includes('<style>') && one.includes('<script>'),'standalone must inline CSS and JS');
assert.ok(!one.includes('src="app.js"') && !one.includes('href="styles.css"'),'standalone must not depend on neighboring JS/CSS');
assert.ok(one.includes('sg-base10-builder') && one.includes('createConceptInstance'),'standalone must include P1 representation engine');
// Parse the inlined script without executing it. This permanently guards the black-screen packaging regression.
const scripts=[...one.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.ok(scripts.length>=1,'standalone inline script missing');
for(const script of scripts) new vm.Script(script,{filename:'SAYMERA_v1_2_TEK_DOSYA.inline.js'});

console.log('ui/static tests: PASS (child-copy guard; P1 + Grade 2 solids render contract; PWA assets; standalone parse guard)');
