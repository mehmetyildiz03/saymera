import assert from 'node:assert/strict';
import {
  LEARNING_PHASES, defaultState, ensureSkillState, supportsLearningCycle,
  buildLearningCyclePlan, createConceptInstance, generateLearningQuestion, applyAnswer
} from '../engine.mjs';

const seeded=(()=>{let x=246813579;return ()=>((x=(x*1664525+1013904223)>>>0)/2**32);})();

assert.deepEqual(LEARNING_PHASES,[
  'readiness','model','representation','symbol','reasoning','context','practice','retrieval'
]);
assert.equal(supportsLearningCycle('time1'),true);
assert.equal(supportsLearningCycle('time2'),false,'legacy P2 time stays outside the new contract until migrated');

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

console.log('learning-cycle tests: PASS');
