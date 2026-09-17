import assert from 'node:assert/strict';
import {
  LEARNING_PHASES, defaultState, ensureSkillState, supportsLearningCycle, skillsFor,
  buildLearningCyclePlan, createConceptInstance, generateLearningQuestion, applyAnswer,
  readinessSourcesFor, addClockMinutes, evaluatePracticeCheckpoint
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

const p2Reference=skillsFor('grade2').filter(s=>supportsLearningCycle(s.id));
assert.deepEqual(p2Reference.map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2']);
for(const [i,skill] of p2Reference.entries()){
  const sources=readinessSourcesFor(skill.id);
  assert.ok(sources.length>=1,`${skill.id} must have authentic P2 readiness provenance`);
  assert.ok(sources.every(id=>id!==skill.id));
  const q=generateLearningQuestion(skill.id,'readiness','see',1,makeSeeded(4000+i),null);
  assert.equal(q.learningPhase,'readiness');
  assert.equal(q.countsTowardEvidence,false);
  assert.ok(q.readinessSourceSkillId);
  const p=buildLearningCyclePlan(ensureSkillState(defaultState(),skill.id));
  assert.deepEqual(p.map(x=>x.phase),['readiness','model','representation','symbol','reasoning','context','practice','practice']);
}
assert.deepEqual(readinessSourcesFor('number1000'),['number100']);
assert.deepEqual(readinessSourcesFor('addSub1000'),['addSub100']);
assert.deepEqual(readinessSourcesFor('oddEven1000'),['pairing-foundation']);
assert.deepEqual(readinessSourcesFor('wordAddSub2'),['word1']);
assert.deepEqual(readinessSourcesFor('times23510'),['multiply40']);
assert.deepEqual(readinessSourcesFor('divisionTables2'),['divide20g1']);
assert.deepEqual(readinessSourcesFor('multDivFamilies2'),['divisionTables2']);
assert.deepEqual(readinessSourcesFor('fractionMeaning2'),['partwhole5']);
assert.deepEqual(readinessSourcesFor('fractionNotation2'),['fractionMeaning2']);
assert.deepEqual(readinessSourcesFor('fractionCompare2'),['fractionNotation2']);
assert.deepEqual(readinessSourcesFor('fractionAddSub2'),['fractionCompare2']);
assert.deepEqual(readinessSourcesFor('lengthMetre2'),['lengthMeasure1']);
assert.deepEqual(readinessSourcesFor('massMetric2'),['mass-foundation']);
assert.deepEqual(readinessSourcesFor('volumeLitre2'),['volume-foundation']);
assert.deepEqual(readinessSourcesFor('timeMinute2'),['time1']);
assert.deepEqual(readinessSourcesFor('timeDuration2'),['timeMinute2']);
assert.deepEqual(readinessSourcesFor('moneyP2'),['money1']);

const state=defaultState();
const ss=ensureSkillState(state,'time1');
const plan=buildLearningCyclePlan(ss);
assert.equal(plan.length,8);
assert.deepEqual(plan.map(x=>x.phase),[
  'readiness','model','representation','symbol','reasoning','context','practice','practice'
]);
assert.equal(plan[0].countsTowardEvidence,false);
assert.equal(plan.at(-1).practiceCheckpoint,true);
assert.equal(!!plan.at(-1).cycleFinal,false);

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


// Adaptive practice: two clean varied tasks are enough; friction extends, never beyond four.
const clean1={phase:'practice',kind:'practice',correct:true,usedHint:false};
const clean2={phase:'practice',kind:'practice',correct:true,usedHint:false};
let decision=evaluatePracticeCheckpoint([clean1],clean2);
assert.deepEqual({target:decision.target,count:decision.practiceCount,complete:decision.complete},{target:2,count:2,complete:true});
const hinted={phase:'practice',kind:'practice',correct:true,usedHint:true};
decision=evaluatePracticeCheckpoint([clean1],hinted);
assert.equal(decision.target,3);
assert.equal(decision.complete,false);
decision=evaluatePracticeCheckpoint([clean1,hinted],clean2);
assert.equal(decision.target,3);
assert.equal(decision.practiceCount,3);
assert.equal(decision.complete,true);
const coreMiss={phase:'reasoning',kind:'focus',correct:false,usedHint:false};
const secondMiss={phase:'context',kind:'focus',correct:false,usedHint:false};
decision=evaluatePracticeCheckpoint([coreMiss,secondMiss,clean1,clean2],{phase:'practice',kind:'practice',correct:true,usedHint:false});
assert.equal(decision.target,4);
assert.equal(decision.complete,false);
decision=evaluatePracticeCheckpoint([coreMiss,secondMiss,clean1,clean2,{phase:'practice',kind:'practice',correct:true,usedHint:false}],{phase:'practice',kind:'practice',correct:true,usedHint:false});
assert.equal(decision.target,4);
assert.equal(decision.practiceCount,4);
assert.equal(decision.complete,true);
const cappedWrong=evaluatePracticeCheckpoint([clean1,clean2,{phase:'practice',kind:'practice',correct:true,usedHint:false}],{phase:'practice',kind:'practice',correct:false,usedHint:false});
assert.equal(cappedWrong.atCap,true);
assert.equal(cappedWrong.complete,false);

// Clock arithmetic preserves the day period across noon and midnight.
assert.deepEqual(addClockMinutes({hour:11,minute:30,period:'ÖÖ'},60),{hour:12,minute:30,label:'12:30',period:'ÖS',intl:'p.m.'});
assert.deepEqual(addClockMinutes({hour:11,minute:45,period:'ÖS'},30),{hour:12,minute:15,label:'12:15',period:'ÖÖ',intl:'a.m.'});
assert.deepEqual(addClockMinutes({hour:12,minute:30,period:'ÖS'},60),{hour:1,minute:30,label:'1:30',period:'ÖS',intl:'p.m.'});

// A failed final practice does not close the learning cycle or schedule retention.
const finalFailState=defaultState();
const finalFailSS=ensureSkillState(finalFailState,'time1');
const finalFailQ=generateLearningQuestion('time1','practice','transfer',1,makeSeeded(9001),createConceptInstance('time1',1,makeSeeded(9002)));
finalFailQ.cycleFinal=true;
applyAnswer(finalFailState,finalFailQ,{correct:false,now:7000,sessionQuestionIndex:8});
assert.equal(finalFailSS.learningCycle.firstCycleCompletedAt,0);
assert.equal(finalFailState.reviewQueue.some(x=>x.stage==='next-day'),false);
const completionBridge=finalFailState.reviewQueue.find(x=>x.completeCycleOnSuccess);
assert.ok(completionBridge,'failed final practice must schedule immediate completion recovery');
assert.equal(completionBridge.dueQuestion,8);
const recoveryQ=generateLearningQuestion('time1','practice',completionBridge.representation,1,makeSeeded(9003),createConceptInstance('time1',1,makeSeeded(9004)));
recoveryQ.completionRecovery=true;
recoveryQ.cycleFinal=true;
applyAnswer(finalFailState,recoveryQ,{correct:true,now:8000,sessionQuestionIndex:9});
assert.ok(finalFailSS.learningCycle.firstCycleCompletedAt>0);
assert.ok(finalFailState.reviewQueue.some(x=>x.stage==='next-day'&&x.phase==='retrieval'));

let now=2000;
for(const item of plan.slice(1)){
  const concept=createConceptInstance('time1',1,seeded);
  const q=generateLearningQuestion('time1',item.phase,item.representation,1,seeded,concept);
  if(item.practiceCheckpoint) q.cycleFinal=true; // perfect-path adaptive checkpoint
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
assert.equal(reinforcement.length,2);
assert.ok(reinforcement.every(x=>x.phase==='practice'));
assert.equal(reinforcement.at(-1).practiceCheckpoint,true);

console.log('learning-cycle tests: PASS (22 P1 prerequisite readiness contracts + immediate support)');
