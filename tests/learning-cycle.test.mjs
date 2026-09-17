import assert from 'node:assert/strict';
import {
  LEARNING_PHASES, defaultState, ensureSkillState, supportsLearningCycle, skillsFor,
  buildLearningCyclePlan, createConceptInstance, generateLearningQuestion, applyAnswer,
  readinessSourcesFor
} from '../engine.mjs';

const makeSeeded=(seed=246813579)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const seeded=makeSeeded();

assert.deepEqual(LEARNING_PHASES,[
  'readiness','model','representation','symbol','reasoning','context','practice','retrieval'
]);
assert.equal(supportsLearningCycle('time1'),true);
assert.equal(supportsLearningCycle('time2'),false,'legacy P2 time stays outside the new contract until migrated');

const p1=skillsFor('grade1').filter(s=>supportsLearningCycle(s.id));
assert.equal(p1.length,22);
for(const [i,skill] of p1.entries()){
  const sources=readinessSourcesFor(skill.id);
  assert.ok(sources.length>=1,`${skill.id} must declare a readiness source`);
  assert.ok(sources.every(id=>id!==skill.id),`${skill.id} readiness must not test the target itself`);
  if(skill.prerequisite?.length){
    assert.ok(sources.every(id=>skill.prerequisite.includes(id)),`${skill.id} readiness should derive from declared prerequisites`);
  }
  const q=generateLearningQuestion(skill.id,'readiness','see',1,makeSeeded(1000+i),null);
  assert.equal(q.skillId,skill.id);
  assert.equal(q.learningPhase,'readiness');
  assert.equal(q.countsTowardEvidence,false);
  assert.equal(q.taskKind,'readiness-check');
  assert.ok(q.readinessSourceSkillId,`${skill.id} readiness provenance missing`);
  assert.notEqual(q.readinessSourceSkillId,skill.id,`${skill.id} must not use target content as readiness`);
  assert.ok(q.id,`${skill.id} readiness id missing`);
}

const state=defaultState();
const ss=ensureSkillState(state,'time1');
const plan=buildLearningCyclePlan(ss);
assert.equal(plan.length,8);
assert.deepEqual(plan.map(x=>x.phase),[
  'readiness','model','representation','symbol','reasoning','context','practice','practice'
]);
assert.equal(plan[0].countsTowardEvidence,false);
assert.equal(plan.at(-1).cycleFinal,true);

const readiness=generateLearningQuestion('time1','readiness','see',1,seeded,null);
assert.equal(readiness.learningPhase,'readiness');
assert.equal(readiness.countsTowardEvidence,false);
applyAnswer(state,readiness,{correct:true,now:1000,sessionQuestionIndex:1});
assert.equal(ss.totalAttempts,0,'readiness must not inflate target-skill mastery evidence');
assert.equal(ss.learningCycle.phases.readiness.attempts,1);

const bridgeState=defaultState();
const bridgeSS=ensureSkillState(bridgeState,'numberBonds10');
const first=generateLearningQuestion('numberBonds10','readiness','see',1,makeSeeded(77),null);
assert.equal(first.readinessSourceSkillId,'number20');
applyAnswer(bridgeState,first,{correct:false,now:5000,sessionQuestionIndex:1});
assert.equal(bridgeSS.totalAttempts,0,'failed readiness still must not alter target mastery');
const bridge=bridgeState.reviewQueue.find(x=>x.skillId==='numberBonds10'&&x.stage==='same-session');
assert.ok(bridge,'failed readiness must schedule support');
assert.equal(bridge.support,true);
assert.equal(bridge.dueQuestion,1,'readiness support must be eligible immediately on the next screen');
assert.equal(bridge.representation,'build','readiness support should prefer a concrete representation');
assert.equal(bridge.readinessSourceSkillId,'number20');
const support=generateLearningQuestion('numberBonds10','readiness',bridge.representation,1,makeSeeded(78),null,{
  support:true,sourceSkillId:bridge.readinessSourceSkillId
});
assert.equal(support.taskKind,'readiness-support');
assert.equal(support.countsTowardEvidence,false);
assert.equal(support.readinessSourceSkillId,'number20');
assert.equal(support.response.kind,'manipulative','P1 prerequisite support should use the concrete build task when available');
const queueBefore=bridgeState.reviewQueue.length;
applyAnswer(bridgeState,support,{correct:false,now:6000,sessionQuestionIndex:2});
assert.equal(bridgeState.reviewQueue.length,queueBefore,'a failed readiness scaffold must not recurse indefinitely');
assert.equal(bridgeSS.learningCycle.readinessSupportUsed,true);

let now=2000;
for(const item of plan.slice(1)){
  const concept=createConceptInstance('time1',1,seeded);
  const q=generateLearningQuestion('time1',item.phase,item.representation,1,seeded,concept);
  q.cycleFinal=!!item.cycleFinal;
  applyAnswer(state,q,{correct:true,now:now+=1000,sessionQuestionIndex:2});
}
assert.ok(ss.learningCycle.firstCycleCompletedAt>0);
assert.equal(ss.learningCycle.status,'consolidating');
const retention=state.reviewQueue.find(x=>x.skillId==='time1'&&x.stage==='next-day');
assert.ok(retention,'full learning cycle must schedule delayed retrieval');
assert.equal(retention.phase,'retrieval');
assert.ok(retention.dueAt>ss.learningCycle.firstCycleCompletedAt);

const rq=generateLearningQuestion('time1','retrieval',retention.representation,1,seeded,createConceptInstance('time1',1,seeded));
applyAnswer(state,rq,{correct:true,isDelayedReview:true,now:retention.dueAt+1,sessionQuestionIndex:1});
assert.equal(ss.learningCycle.retrievalAttempts,1);
assert.equal(ss.learningCycle.retrievalSuccesses,1);
assert.equal(ss.delayedSuccesses,1);

const reinforcement=buildLearningCyclePlan(ss);
assert.equal(reinforcement.length,4);
assert.ok(reinforcement.every(x=>x.phase==='practice'));
assert.equal(reinforcement.at(-1).cycleFinal,true);

console.log('learning-cycle tests: PASS (22 P1 prerequisite readiness contracts + immediate support)');
