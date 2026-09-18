import assert from 'node:assert/strict';
import {
  P2_MOE_SKILL_SEQUENCE,P2_CURRICULUM_UNITS,P2_LESSON_CONTRACTS,
  curriculumUnitsFor,curriculumUnitForSkill,lessonContractFor,
  defaultState,ensureSkillState,ensureLearningArchitectureState,
  prerequisiteStatus,curriculumGateStatus,lessonAccessState,
  ensureLessonJourneyState,lessonProgressSnapshot,lessonChannelAccess,
  recordPracticeSectionAttempt,markLessonLearnProgress
} from '../engine.mjs';

const flattened=P2_CURRICULUM_UNITS.flatMap(unit=>unit.lessons);
assert.deepEqual(flattened,P2_MOE_SKILL_SEQUENCE,'Atlas units must preserve the canonical MOE lesson order');
assert.deepEqual(curriculumUnitsFor('grade2').flatMap(unit=>unit.lessons.map(skill=>skill.id)),P2_MOE_SKILL_SEQUENCE);
assert.equal(curriculumUnitsFor('grade1').length,0);
assert.equal(curriculumUnitForSkill('compareOrder1000')?.id,'whole-numbers');

assert.equal(P2_LESSON_CONTRACTS.number1000.practice.sections.length,6);
assert.deepEqual(P2_LESSON_CONTRACTS.compareOrder1000.practice.sections.map(x=>x.id),[
  'compare-places','verbal-relation','comparison-symbols','order-numbers','explain-order','transfer-order'
]);
assert.equal(lessonContractFor('numberPattern1000').provisional,true,'future lessons must stay explicitly provisional until designed');
assert.equal(lessonContractFor('numberPattern1000').practice.sections.length,0,'do not invent future practice sections');

const state=defaultState();
state.profile='grade2';
ensureLearningArchitectureState(state);
assert.equal(state.version,3);
assert.equal(state.learningArchitecture.version,1);
assert.ok(ensureSkillState(state,'number1000').lessonJourney,'every normalized skill needs a separate lesson journey');

let snap=lessonProgressSnapshot(state,'number1000',1000);
assert.equal(snap.access.status,'current');
assert.equal(snap.learn.status,'not-started');
assert.equal(snap.practice.status,'locked');
assert.equal(snap.review.status,'locked');
assert.deepEqual(lessonChannelAccess(state,'number1000',1000),{learn:true,practice:false,review:false});

markLessonLearnProgress(state,'number1000',{stepIndex:3,startedAt:100});
snap=lessonProgressSnapshot(state,'number1000',1000);
assert.equal(snap.learn.status,'in-progress');
assert.equal(snap.practice.status,'locked');

markLessonLearnProgress(state,'number1000',{stepIndex:10,completedAt:200});
snap=lessonProgressSnapshot(state,'number1000',1000);
assert.equal(snap.learn.status,'complete');
assert.equal(snap.practice.status,'ready');
assert.equal(lessonChannelAccess(state,'number1000',1000).practice,true);

recordPracticeSectionAttempt(state,'number1000','build-number',{correct:true,complete:true,now:300});
recordPracticeSectionAttempt(state,'number1000','place-value',{correct:false,complete:false,now:310});
snap=lessonProgressSnapshot(state,'number1000',1000);
assert.equal(snap.practice.status,'in-progress');
assert.equal(snap.practice.completedSections,1);
assert.equal(snap.practice.sections.find(x=>x.id==='build-number').nativeCorrect,1);

const prereqBefore=prerequisiteStatus(state,'numberPattern1000');
assert.equal(prereqBefore.met,false);
ensureSkillState(state,'number1000').learningCycle.firstCycleCompletedAt=400;
assert.equal(prerequisiteStatus(state,'numberPattern1000').met,true,'explicit prerequisite is separate from curriculum order');
assert.equal(curriculumGateStatus(state,'numberPattern1000').unlocked,false,'compare/order still blocks the next new lesson');
assert.equal(lessonAccessState(state,'numberPattern1000').lockReason.type,'curriculum');

const legacy=defaultState();
legacy.profile='grade2';
const legacySkill=ensureSkillState(legacy,'number1000');
legacySkill.learningCycle.lessonTaughtAt=500;
legacySkill.learningCycle.firstCycleCompletedAt=700;
legacySkill.learningCycle.phases.model={attempts:2,correct:2,lastSeen:520};
legacySkill.learningCycle.retrievalDueAt=2000;
const journey=ensureLessonJourneyState(legacy,'number1000');
assert.equal(journey.learn.completedAt,500,'legacy teaching completion must migrate');
assert.equal(journey.practice.legacyCompletedAt,700,'legacy cycle completion must be preserved without fabricating section ticks');
assert.equal(journey.practice.sections['build-number'].completedAt,0,'legacy phase evidence must not become a fake completed section');
assert.equal(journey.practice.sections['build-number'].legacyAttempts,2);
snap=lessonProgressSnapshot(legacy,'number1000',1000);
assert.equal(snap.practice.status,'legacy-complete');
assert.equal(snap.practice.completedSections,0);
assert.equal(snap.review.status,'scheduled');
snap=lessonProgressSnapshot(legacy,'number1000',2500);
assert.equal(snap.review.status,'due');

console.log('learning architecture: PASS (curriculum order + prerequisites + learn/practice/review + lossless migration)');
