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

for(const id of ['homeScreen','atlasScreen','parentScreen','focusCard','homeInsightGrid','conceptPreviewRow','atlasSummary','domainTabs','skillMap','parentInsight','practiceOverlay','practiceContent','onboardingOverlay','cooldownOverlay','toast'])
  assert.match(html,new RegExp(`id=["']${id}["']`),`missing static DOM id ${id}`);

for(const cls of ['prism-card','question-stage','visual-choice-grid','number-keypad','interactive-twentyframe','sg-bond-builder','sg-base10-builder','sg-base1000-builder','sg-parity-builder','sg-two-step-plan','sg-measure-builder','sg-duration-builder','sg-clock-minute-set','p2-shape-pattern-builder','p2-solid-classify-builder','p2-scaled-graph-builder','sg-order-builder','sg-ordinal-builder','sg-equal-groups-builder','sg-share-builder','sg-money-builder','sg-cm-ruler-builder','sg-shape-compose-builder','sg-unit-builder','sg-clock-set','sg-shape-pattern-builder','solid-property-builder','solid-property-chip','clear-solid'])
  assert.ok(css.includes(`.${cls}`),`missing CSS class .${cls}`);

assert.match(app,/const STORAGE_KEY='saymera\.math\.v2'/,'SAYMERA must preserve its isolated storage namespace');
assert.ok(!app.includes('Burada puanlanan şey hız değil'),'child feedback must not expose product scoring logic');
assert.ok(!app.includes('HATA DEĞİL · KANIT'),'child feedback must not expose evidence-engine terminology');
assert.ok(!app.includes('motor birkaç adım sonra'),'child feedback must not explain internal remediation logic');
assert.ok(!app.includes('task-intent'),'practice screen must not repeat representation-engine instructions to the child');
assert.ok(!app.includes('Neden bu kavram?'),'child home must not expose adaptive-selection reasoning');
assert.ok(!app.includes('Temsil genişliği ve hatırlama dahil.'),'child atlas must not explain internal scoring inputs');
assert.ok(!app.includes('Çoklu kanıt + gecikmeli başarı.'),'child atlas must not explain mastery internals');
assert.ok(!app.includes('farklı görev türünde çalıştın'),'session end must use child-facing completion copy');
assert.ok(!app.includes('kanıt profili kaydedildi'),'session end must not expose evidence-profile internals');
assert.ok(!app.includes('Hız puanlanmadı'),'session end must not explain scoring rules');
assert.ok(!app.includes('tamamlanmayan pencereler'),'close confirmation must not expose representation scheduling');
assert.ok(!html.includes('Bir kavramı nesneyle kur'),'child home must not explain the representation engine');
assert.ok(!html.includes('Aynı fikir, beş kanıt'),'child home must not expose evidence-model language');
assert.ok(!html.includes('Her kavramın beş kanıt penceresi'),'child atlas must not expose evidence windows');
assert.ok(!html.includes('SAYMERA sınıfı bir etiket olarak değil'),'onboarding must avoid product-model explanations');
assert.match(app,/focusRepresentations/);
assert.match(app,/createConceptInstance/);
assert.match(app,/renderResponse/);
for(const marker of ['bond-fill','base10-build','base1000-build','parity-pair','two-step-plan','order-pair','ordinal-position','equal-groups','share-equally','money-make','cm-ruler','shape-compose','unit-measure','clock-set','shape-pattern','solid-properties','three-add'])
  assert.ok(app.includes(`interaction==='${marker}'`),`app missing interaction ${marker}`);
for(const visual of ['addition-strategy','subtraction-strategy','fact-family','problem-structure','compare-base10','base1000','base1000-build-interactive','base1000-operation-build','compare-base1000','pairing-small','parity-pair-builder','parity-card','two-step-plan-builder','two-step-model','column-operation','money-shopping','cm-ruler-interactive','cm-ruler-model','shape-compose-interactive','composite-figure','dot-grid-figure','schedule-event','three-add-strategy','solid-property-builder','solid-pair','solid-scene'])
  assert.ok(app.includes(`case '${visual}'`),`app missing visual ${visual}`);


// Render-contract audit: generated P1 tasks may not reference an unsupported visual or interaction.
const generatedVisuals=new Set(), generatedInteractions=new Set();
let seedValue=987654321;
const rng=()=>((seedValue=(seedValue*1664525+1013904223)>>>0)/2**32);
const renderAuditSkills=[...skillsFor('grade1'),...skillsFor('grade2').filter(s=>['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2'].includes(s.id))];
for(const skill of renderAuditSkills){
  for(const rep of REPRESENTATIONS){
    for(let i=0;i<12;i++){
      const q=generateQuestion(skill.id,rep,1+(i%4),rng);
      if(q.visual?.type) generatedVisuals.add(q.visual.type);
      if(q.response?.interaction) generatedInteractions.add(q.response.interaction);
      for(const opt of q.response?.options||[]) if(opt.visual?.type) generatedVisuals.add(opt.visual.type);
    }
  }
}
for(const type of generatedVisuals) assert.ok(app.includes(`case '${type}'`),`generated P1 visual has no renderer: ${type}`);
for(const interaction of generatedInteractions) assert.ok(app.includes(`interaction==='${interaction}'`),`generated P1 manipulative has no interaction handler: ${interaction}`);

assert.equal(manifest.short_name,'SAYMERA');
for(const asset of ['./','./index.html','./styles.css','./app.js','./engine.mjs','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png']) assert.ok(sw.includes(`'${asset}'`),`service worker missing ${asset}`);
for(const f of ['assets/icon-192.png','assets/icon-512.png']) assert.ok(fs.existsSync(path.join(root,f)),`missing ${f}`);

const standalone=path.join(root,'SAYMERA_v1_4_TEK_DOSYA.html');
assert.ok(fs.existsSync(standalone),'v1.3 standalone build missing');
assert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html')),'v1.3 standalone alias missing');
assert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html')),'legacy standalone alias missing');
const one=fs.readFileSync(standalone,'utf8');
assert.ok(one.includes('<style>') && one.includes('<script>'),'standalone must inline CSS and JS');
assert.ok(!one.includes('src="app.js"') && !one.includes('href="styles.css"'),'standalone must not depend on neighboring JS/CSS');
assert.ok(one.includes('sg-base10-builder') && one.includes('createConceptInstance'),'standalone must include P1 representation engine');
// Parse the inlined script without executing it. This permanently guards the black-screen packaging regression.
const scripts=[...one.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.ok(scripts.length>=1,'standalone inline script missing');
for(const script of scripts) new vm.Script(script,{filename:'SAYMERA_v1_4_TEK_DOSYA.inline.js'});

console.log('ui/static tests: PASS (P1 task UI, cm ruler/shape composition/5-minute clock coverage, PWA assets, standalone parse guard)');

assert.ok(app.includes('dueSameSessionReview(includeFuture=false)'));
assert.ok(app.includes('completeCycleOnSuccess'));

assert.ok(app.includes('appendAdaptivePractice'),'adaptive practice insertion missing');
assert.ok(app.includes('evaluatePracticeCheckpoint'),'adaptive practice decision missing');

assert.ok(app.includes('requiresLearningCompletion'),'first-cycle session completion gate missing');
assert.ok(app.includes("const critical=review.support===true||review.completeCycleOnSuccess===true"),'critical recovery must bypass general bridge cap');
assert.ok(app.includes('if(session.bridgeAdds>=4&&!critical) return;'),'general bridge cap must not block critical recovery');
assert.ok(app.includes('completionRecovery:true'),'finishSession fallback recovery missing');
assert.ok(app.includes('if(gateState&&!gateState.learningCycle?.firstCycleCompletedAt)'),'finishSession must refuse false completion');
