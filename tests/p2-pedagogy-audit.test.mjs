import assert from 'node:assert/strict';
import {
  skillsFor, supportsLearningCycle, readinessSourcesFor, buildLearningCyclePlan,
  ensureSkillState, defaultState, createConceptInstance, generateLearningQuestion
} from '../engine.mjs';

const makeRng=(seed)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const p2=skillsFor('grade2').filter(s=>supportsLearningCycle(s.id));
assert.equal(p2.length,22,'exact current Singapore P2 graph must contain 22 learning-cycle skills');
assert.ok(!p2.some(s=>['shapes2D2','solidPatterns2'].includes(s.id)),'P1/complementary geometry must not be mislabeled as P2 core');

const expectedKinds={build:'manipulative-build',see:'visual-discrimination',symbol:'symbol-entry',explain:'reasoning-choice',transfer:'context-transfer'};
const forbidden=/(kanıt profili|temsil genişliği|puanlanan şey|öğrenme döngüsü|practicecheckpoint|conceptkey|taskkind|readiness)/i;
const signature=q=>JSON.stringify({prompt:q.prompt,answer:String(q.answer),taskKind:q.taskKind,response:q.response?.kind,visual:q.visual||null,options:q.response?.options||null});

for(const [i,skill] of p2.entries()){
  const sources=readinessSourcesFor(skill.id);
  assert.ok(sources.length>0,`${skill.id}: readiness source missing`);
  assert.ok(sources.every(x=>x!==skill.id),`${skill.id}: readiness may not test the target itself`);

  const plan=buildLearningCyclePlan(ensureSkillState(defaultState(),skill.id));
  assert.deepEqual(plan.map(x=>x.phase),['readiness','model','representation','symbol','reasoning','context','practice','practice'],`${skill.id}: first-cycle phase order drifted`);

  const rng=makeRng(51000+i*97);
  const focus=createConceptInstance(skill.id,2,rng);
  assert.ok(focus,`${skill.id}: concept instance missing`);
  const qs=[];
  qs.push(generateLearningQuestion(skill.id,'readiness','see',2,rng,null));
  qs.push(generateLearningQuestion(skill.id,'model','build',2,rng,focus));
  qs.push(generateLearningQuestion(skill.id,'representation','see',2,rng,focus));
  qs.push(generateLearningQuestion(skill.id,'symbol','symbol',2,rng,focus));
  qs.push(generateLearningQuestion(skill.id,'reasoning','explain',2,rng,focus));
  qs.push(generateLearningQuestion(skill.id,'context','transfer',2,rng,createConceptInstance(skill.id,2,rng)));
  qs.push(generateLearningQuestion(skill.id,'practice','symbol',2,rng,createConceptInstance(skill.id,2,rng)));
  qs.push(generateLearningQuestion(skill.id,'practice','transfer',2,rng,createConceptInstance(skill.id,2,rng)));

  assert.equal(qs[0].countsTowardEvidence,false,`${skill.id}: readiness must not inflate mastery`);
  assert.notEqual(qs[0].readinessSourceSkillId,skill.id,`${skill.id}: readiness provenance is target skill`);
  for(const q of qs){
    const childCopy=[q.prompt,q.hint,q.explain,q.teachingNote].filter(Boolean).join(' ');
    assert.ok(!forbidden.test(childCopy),`${skill.id}: internal product language leaked to child copy: ${childCopy}`);
  }
  const evidenceQs=qs.slice(1,6);
  for(const q of evidenceQs) assert.equal(q.taskKind,expectedKinds[q.representation],`${skill.id}/${q.representation}: cognitive task family mismatch`);
  assert.equal(new Set(evidenceQs.map(q=>q.taskKind)).size,5,`${skill.id}: five windows collapsed into repeated cognitive action`);
  assert.equal(new Set(evidenceQs.map(signature)).size,5,`${skill.id}: exact task repeated inside model→context core`);
}

// Symbols that are new at P2 must be taught before they are assessed.
{
  const rng=makeRng(9123), c=createConceptInstance('fractionNotation2',2,rng);
  const teach=generateLearningQuestion('fractionNotation2','representation','see',2,rng,c);
  const assess=generateLearningQuestion('fractionNotation2','symbol','symbol',2,rng,c);
  assert.match(String(teach.teachingNote||''),/\d+\/\d+/,'fraction notation must be explicitly taught in representation phase');
  assert.match(String(assess.prompt),/kesir|yazar|yaz/i,'fraction symbol phase must assess notation after teaching');
}
{
  const rng=makeRng(9124), c=createConceptInstance('divisionTables2',2,rng);
  const model=generateLearningQuestion('divisionTables2','model','build',2,rng,c);
  const teach=generateLearningQuestion('divisionTables2','representation','see',2,rng,c);
  const assess=generateLearningQuestion('divisionTables2','symbol','symbol',2,rng,c);
  assert.ok(!String(model.prompt).includes('÷'),'division sign must not be assumed in the concrete model phase');
  assert.match(`${teach.prompt} ${teach.teachingNote||''} ${teach.explain||''}`,/÷/,'division sign must be introduced before symbolic assessment');
  assert.match(String(assess.prompt),/÷/,'division symbol phase must assess ÷ after introduction');
}

const app=await (await import('node:fs/promises')).readFile(new URL('../app.js',import.meta.url),'utf8');
assert.match(app,/recentQuestionSignatures:\[\]/,'session must keep recent task signatures');
assert.match(app,/retries<8/,'fresh-task generation must retry exact duplicates');
assert.match(app,/questionRepeatSignature/,'fresh-task repeat guard missing');

console.log(`p2 pedagogy audit: PASS (${p2.length} exact P2 skills; phase order, task diversity, child-copy, teaching-before-testing, no-repeat guard)`);
