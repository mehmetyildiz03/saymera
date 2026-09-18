import assert from 'node:assert/strict';
import {
  P2_LESSON_CONTRACTS,generateLessonPracticeQuestion,
  defaultState,ensureLearningArchitectureState,lessonProgressSnapshot,
  recordPracticeSectionAttempt,resetPracticeSectionCycle
} from '../engine.mjs';

function seeded(seed){ let s=seed>>>0; return()=>((s=(s*1664525+1013904223)>>>0)/2**32); }

for(const [skillId,contract] of Object.entries(P2_LESSON_CONTRACTS)){
  const rng=seeded(skillId==='number1000'?1803:1804);
  for(const section of contract.practice.sections){
    const qs=Array.from({length:4},(_,i)=>generateLessonPracticeQuestion(skillId,section.id,i,2,rng));
    assert.ok(qs.every(q=>q.skillId===skillId));
    assert.ok(qs.every(q=>q.learningPhase==='practice'));
    assert.ok(qs.every(q=>q.lessonPracticeSectionId===section.id));
    assert.deepEqual(qs.map(q=>q.lessonPracticeTaskIndex),[0,1,2,3]);
    assert.ok(new Set(qs.map(q=>q.prompt)).size>=3,skillId+'/'+section.id+' needs prompt variety');
    assert.ok(qs.every(q=>q.hint&&q.explain),skillId+'/'+section.id+' needs semantic hint/explanation');
  }
}

const symbolRng=seeded(44);
const symbolQs=Array.from({length:4},(_,i)=>generateLessonPracticeQuestion('compareOrder1000','comparison-symbols',i,2,symbolRng));
assert.ok(symbolQs.every(q=>q.response.kind==='visual-choice'));
assert.ok(symbolQs.every(q=>new Set(q.response.options.map(o=>String(o.value))).size===3));
assert.ok(symbolQs.every(q=>new Set(q.response.options.map(o=>String(o.value))).has('<')&&new Set(q.response.options.map(o=>String(o.value))).has('>')&&new Set(q.response.options.map(o=>String(o.value))).has('=')));
assert.ok(symbolQs.some(q=>q.answer==='='),'symbol practice must explicitly include equality');

const orderRng=seeded(55);
const orderKinds=Array.from({length:4},(_,i)=>generateLessonPracticeQuestion('compareOrder1000','order-numbers',i,2,orderRng).taskKind);
assert.equal(new Set(orderKinds).size,4,'ordering section must use four different task families');

const placeRng=seeded(66);
const placeKinds=Array.from({length:4},(_,i)=>generateLessonPracticeQuestion('number1000','place-value',i,2,placeRng).taskKind);
assert.equal(new Set(placeKinds).size,4,'place-value practice must not collapse into one question form');

const state=defaultState(); state.profile='grade2'; ensureLearningArchitectureState(state);
recordPracticeSectionAttempt(state,'number1000','build-number',{correct:true,now:10});
recordPracticeSectionAttempt(state,'number1000','build-number',{correct:false,now:20});
let snap=lessonProgressSnapshot(state,'number1000',100);
let section=snap.practice.sections.find(x=>x.id==='build-number');
assert.equal(section.nativeAttempts,2);
assert.equal(section.cycleAttempts,2);
assert.equal(section.cycleCorrect,1);
resetPracticeSectionCycle(state,'number1000','build-number',{now:30});
snap=lessonProgressSnapshot(state,'number1000',100);
section=snap.practice.sections.find(x=>x.id==='build-number');
assert.equal(section.nativeAttempts,2,'retry reset must keep lifetime evidence');
assert.equal(section.nativeCorrect,1);
assert.equal(section.cycleAttempts,0);
assert.equal(section.cycleCorrect,0);

console.log('reference practice sections: PASS (content-specific task families + resumable cycles)');

const patternRng=seeded(77);
for(const section of P2_LESSON_CONTRACTS.numberPattern1000.practice.sections){
  const qs=Array.from({length:4},(_,i)=>generateLessonPracticeQuestion('numberPattern1000',section.id,i,2,patternRng));
  assert.ok(qs.every(q=>[1,10,100].includes(Math.abs(Number(q.patternStep)))),'numberPattern1000 must stay within ±1/±10/±100');
  assert.ok(qs.every(q=>!String(q.prompt).includes('katına')),'numberPattern1000 must not teach multiplicative patterns before multiplication');
}
const missingQs=Array.from({length:4},(_,i)=>generateLessonPracticeQuestion('numberPattern1000','missing-number',i,2,seeded(88+i)));
assert.ok(missingQs.every(q=>q.visual?.items?.includes('?')),'missing-number section must place a gap inside the sequence');
assert.ok(missingQs.every(q=>q.response.kind==='number-input'),'missing-number work should require student production');
