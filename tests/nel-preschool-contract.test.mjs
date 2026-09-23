import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  skillsFor,PRESCHOOL_NEL_PATHS,PRESCHOOL_NEL_KSD_MAP,PRESCHOOL_TO_P1_BRIDGES,
  PRESCHOOL_NEL_LESSON_CONTRACTS,generateLessonPracticeQuestion,generateQuestion,
  defaultState,runPedagogyStateAudit
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const contract=fs.readFileSync(new URL('../PRESCHOOL_NEL_RESEARCH_CONTRACT.md',import.meta.url),'utf8');

assert.equal(PRESCHOOL_NEL_PATHS.length,3,'NEL v2 must expose three parallel development paths');
assert.deepEqual(PRESCHOOL_NEL_PATHS.map(p=>p.id),['relationships-patterns','counting-number-sense','shapes-space']);

const expectedKsd=['2.1','2.2','2.3','2.4','3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8','4.1','4.2','4.3','4.4'];
for(const code of expectedKsd) assert.ok(PRESCHOOL_NEL_KSD_MAP[code]?.length,'missing NEL KSD mapping '+code);

for(const id of ['nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20']) assert.equal(skillsFor('preschool').some(s=>s.id===id),false,'unfinished NEL v2 skill must stay hidden from the live preschool map: '+id);
for(const id of ['nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20']) assert.equal(skillsFor('preschool',{includeHidden:true}).some(s=>s.id===id),true,'Inspector must reach hidden NEL reference skill: '+id);

const preschoolIds=new Set(skillsFor('preschool',{includeHidden:true}).map(s=>s.id));
assert.equal(skillsFor('grade1',{includeHidden:true}).some(skill=>(skill.prerequisite||[]).some(id=>preschoolIds.has(id))),false,'P1 must not hard-require preschool completion');

assert.ok(PRESCHOOL_TO_P1_BRIDGES.number20.includes('nelReliableCount10'));
assert.ok(PRESCHOOL_TO_P1_BRIDGES.numberBonds10.includes('nelPartWhole10'));

const matchContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelMatchAttributes;
assert.equal(matchContract.practice.sections.length,5);
assert.deepEqual(matchContract.practice.sections.map(s=>s.id),['match-exact','match-colour-shape','match-size-measure','explain-match','transfer-match']);
assert.deepEqual(matchContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const sortContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelSortAttributes;
assert.equal(sortContract.practice.sections.length,5);
assert.deepEqual(sortContract.practice.sections.map(s=>s.id),['sort-colour-shape','sort-size-measure','resort-new-rule','explain-sort-rule','transfer-sort']);
assert.deepEqual(sortContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const compareContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelCompareAttributes;
assert.equal(compareContract.practice.sections.length,5);
assert.deepEqual(compareContract.practice.sections.map(s=>s.id),['compare-size','compare-length','compare-height','explain-compare','transfer-compare']);
assert.deepEqual(compareContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const orderContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelOrderAttributes;
assert.equal(orderContract.practice.sections.length,5);
assert.deepEqual(orderContract.practice.sections.map(s=>s.id),['order-size','order-length-height','reverse-order','explain-order','transfer-event-sequence']);
assert.deepEqual(orderContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const patternContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelPatterns;
assert.equal(patternContract.practice.sections.length,5);
assert.deepEqual(patternContract.practice.sections.map(s=>s.id),['recognise-copy','extend-pattern','create-pattern','describe-pattern','transfer-pattern']);
assert.deepEqual(patternContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const roteContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelRoteCount20;
assert.equal(roteContract.practice.sections.length,5);
assert.deepEqual(roteContract.practice.sections.map(s=>s.id),['recite-forward-10','recite-forward-20','continue-from-middle','explain-stable-order','transfer-rhyme-game']);
assert.deepEqual(roteContract.evidenceLabels,{build:'Kur',see:'Dinle',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const lessonIds=['same-object','same-colour','same-shape','same-size','same-length','same-height','explain-match','real-world-match'];
for(const id of lessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL matching Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelMatchAttributes'){ renderNelMatchLessonStep(skill); return; }"));
assert.ok(app.includes("const LESSON_FIRST_SKILLS=new Set(['nelMatchAttributes'"),'NEL matching must teach before checking');

const sortLessonIds=['sort-colour','resort-shape','resort-size','sort-length','sort-height','discover-rule','explain-resort','real-world-sort'];
for(const id of sortLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL sorting Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelSortAttributes'){ renderNelSortLessonStep(skill); return; }"));
assert.ok(app.includes("'nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20','number1000'"),'NEL reference skills must teach before checking');

const compareLessonIds=['compare-size','compare-small','compare-length-align','compare-length-same','compare-height','name-attribute','fair-compare','real-world-compare'];
for(const id of compareLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL comparing Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelCompareAttributes'){ renderNelCompareLessonStep(skill); return; }"));

const orderLessonIds=['order-size','reverse-size','order-length','order-height','choose-order','explain-order','event-order','real-world-order'];
for(const id of orderLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL ordering Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelOrderAttributes'){ renderNelOrderLessonStep(skill); return; }"));

const patternLessonIds=['recognise-ab','copy-ab','extend-abb','extend-aab','create-simple','extend-aabb','extend-abc','create-complex','describe-pattern','real-world-pattern'];
for(const id of patternLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL patterning Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelPatterns'){ renderNelPatternLessonStep(skill); return; }"));

const roteLessonIds=['chant-1-5','build-2-5','chant-6-10','continue-7-10','chant-11-20','continue-to-20','start-middle','stable-order','count-back','real-world-rote'];
for(const id of roteLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL rote-count Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelRoteCount20'){ renderNelRoteLessonStep(skill); return; }"));
assert.ok(app.includes("data-rote-speech"),'rote counting must expose audio-first controls instead of requiring number-word reading');

let seed=711;
const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const forbiddenSymbols=['<','>','+','=','−'];
for(const section of matchContract.practice.sections){
  const qs=Array.from({length:8},(_,i)=>generateLessonPracticeQuestion('nelMatchAttributes',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelMatchAttributes'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL matching must not pull formal Primary notation forward: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'feedback must describe mathematics');
  }
}

for(const section of sortContract.practice.sections){
  const qs=Array.from({length:8},(_,i)=>generateLessonPracticeQuestion('nelSortAttributes',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelSortAttributes'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL sorting must not pull formal Primary notation forward: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'sorting feedback must describe mathematics');
  }
}

for(const section of compareContract.practice.sections){
  const qs=Array.from({length:9},(_,i)=>generateLessonPracticeQuestion('nelCompareAttributes',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelCompareAttributes'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL comparing must stay verbal and concrete in preschool: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'comparing feedback must describe mathematics');
  }
}

for(const section of orderContract.practice.sections){
  const qs=Array.from({length:9},(_,i)=>generateLessonPracticeQuestion('nelOrderAttributes',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelOrderAttributes'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL ordering must stay concrete in preschool: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'ordering feedback must describe mathematics');
  }
}

for(const section of patternContract.practice.sections){
  const qs=Array.from({length:9},(_,i)=>generateLessonPracticeQuestion('nelPatterns',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelPatterns'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL patterning must stay concrete in preschool: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'patterning feedback must describe mathematics');
  }
}

for(const section of roteContract.practice.sections){
  const qs=Array.from({length:10},(_,i)=>generateLessonPracticeQuestion('nelRoteCount20',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelRoteCount20'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL rote counting must not pull formal Primary notation forward: '+childText);
    assert.equal(q.response.kind,'manipulative','rote counting evidence must be audio/manipulation based, not numeral entry or literacy-only choice');
    assert.ok(['nel-rote-sequence','nel-rote-audio-choice','nel-rote-phrase-choice'].includes(q.response.interaction),'unexpected rote counting interaction: '+q.response.interaction);
    assert.equal(['dots','objects','numbercard'].includes(q.visual?.type),false,'rote counting must not silently become quantity or numeral recognition');
  }
}

const orderSize=generateLessonPracticeQuestion('nelOrderAttributes','order-size',0,1,rng);
const orderReverse=generateLessonPracticeQuestion('nelOrderAttributes','reverse-order',0,1,rng);
const orderEvent=generateLessonPracticeQuestion('nelOrderAttributes','transfer-event-sequence',0,1,rng);
assert.equal(orderSize.response.interaction,'nel-order-sequence');
assert.equal(orderReverse.response.interaction,'nel-order-sequence');
assert.equal(orderEvent.response.interaction,'nel-order-sequence');
assert.notEqual(orderSize.response.expectedValue,orderReverse.response.expectedValue,'reversing direction must genuinely reverse the expected order');
assert.equal(String(orderEvent.response.expectedValue).split('|').length,3,'event sequencing must order three events');

const patternCopy=generateLessonPracticeQuestion('nelPatterns','recognise-copy',0,1,rng);
const patternExtend=generateLessonPracticeQuestion('nelPatterns','extend-pattern',1,1,rng);
const patternCreateSimple=generateLessonPracticeQuestion('nelPatterns','create-pattern',0,1,rng);
const patternCreateComplex=generateLessonPracticeQuestion('nelPatterns','create-pattern',1,1,rng);
const patternDescribe=generateLessonPracticeQuestion('nelPatterns','describe-pattern',0,1,rng);
const patternTransfer=generateLessonPracticeQuestion('nelPatterns','transfer-pattern',0,1,rng);
assert.equal(patternCopy.response.interaction,'nel-pattern-build');
assert.equal(patternCreateSimple.response.interaction,'nel-pattern-build');
assert.equal(patternExtend.response.kind,'visual-choice');
assert.equal(patternDescribe.response.kind,'choice');
assert.equal(patternTransfer.response.kind,'choice');
assert.ok(String(patternCreateComplex.response.expectedValue).split('|').length>=8,'complex pattern creation must require a multi-part repeating unit, not a next-item guess');

const roteBuild=generateLessonPracticeQuestion('nelRoteCount20','recite-forward-10',0,1,rng);
const roteTo20=generateLessonPracticeQuestion('nelRoteCount20','recite-forward-20',1,1,rng);
const roteMiddle=generateLessonPracticeQuestion('nelRoteCount20','continue-from-middle',2,1,rng);
const roteExplain=generateLessonPracticeQuestion('nelRoteCount20','explain-stable-order',0,1,rng);
const roteTransfer=generateLessonPracticeQuestion('nelRoteCount20','transfer-rhyme-game',0,1,rng);
assert.equal(roteBuild.response.interaction,'nel-rote-sequence');
assert.equal(roteTo20.response.interaction,'nel-rote-audio-choice');
assert.equal(roteMiddle.response.interaction,'nel-rote-audio-choice');
assert.equal(roteExplain.response.interaction,'nel-rote-phrase-choice');
assert.equal(roteTransfer.response.interaction,'nel-rote-audio-choice');
assert.equal(String(roteTo20.answer),'rote-20','forward-to-20 practice must explicitly reach the NEL endpoint 20');

const sizeQuestion=generateLessonPracticeQuestion('nelCompareAttributes','compare-size',0,1,rng);
const lengthQuestion=generateLessonPracticeQuestion('nelCompareAttributes','compare-length',0,1,rng);
const heightQuestion=generateLessonPracticeQuestion('nelCompareAttributes','compare-height',0,1,rng);
assert.equal(sizeQuestion.response.interaction,'nel-compare-pair');
assert.equal(lengthQuestion.response.interaction,'nel-compare-pair');
assert.ok(String(lengthQuestion.response.expectedValue).startsWith('aligned|'),'length comparison must require common-start alignment');
assert.equal(heightQuestion.response.kind,'choice');

const colourResort=generateLessonPracticeQuestion('nelSortAttributes','resort-new-rule',1,1,rng);
const shapeResort=generateLessonPracticeQuestion('nelSortAttributes','resort-new-rule',0,1,rng);
assert.deepEqual(colourResort.visual.items.map(x=>x.id).sort(),shapeResort.visual.items.map(x=>x.id).sort(),'re-sorting must use the same object set under a new rule');
assert.notEqual(colourResort.response.expectedValue,shapeResort.response.expectedValue,'changing the rule must genuinely change group assignments');

const sortBuild=generateQuestion('nelSortAttributes','build',1,rng);
assert.equal(sortBuild.response.interaction,'nel-sort-bin');
assert.equal(sortBuild.response.kind,'manipulative');

const build=generateQuestion('nelMatchAttributes','build',1,rng);
assert.equal(build.response.interaction,'nel-match-pair');
assert.equal(build.response.kind,'manipulative');
const see=generateQuestion('nelMatchAttributes','see',1,rng);
assert.equal(see.response.kind,'visual-choice');

const auditState=defaultState();
auditState.profile='preschool';
const audit=runPedagogyStateAudit(auditState);
for(const id of ['nel-ksd-coverage','p1-no-preschool-hard-gate','nel-match-reference-contract','nel-sort-reference-contract','nel-compare-reference-contract','nel-order-reference-contract','nel-pattern-reference-contract','nel-rote-count-reference-contract']){
  assert.equal(audit.checks.find(c=>c.id===id)?.pass,true,'preschool audit failed: '+id);
}

assert.ok(contract.includes('Kur · Gör · Göster · Anlat · Taşı'));
assert.ok(contract.includes('Preschool is foundational but is **not a hard prerequisite for P1**.'));

console.log('NEL preschool contract: PASS (3 paths; 16 KSD groups; hidden Path A + first Path B rote-count reference; no P1 hard gate)');
