import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  defaultState,ensureLearningArchitectureState,ensureSkillState,
  lessonProgressSnapshot,recordPracticeSectionAttempt,practiceSectionCompletionAllowed,
  generateQuestion,applyAnswer
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.match(html,/id="lessonCenterScreen"/);
assert.match(html,/id="lessonCenterBody"/);
assert.ok(app.includes('function renderLessonCenter()'),'Lesson Center renderer missing');
assert.ok(app.includes("function startLessonChannel(skillId,channel,sectionId=null,options={})"),'Lesson Center channel launcher missing');
assert.ok(app.includes("channel==='learn'"),'Learn channel missing');
assert.ok(app.includes("channel==='practice'"),'Practice channel missing');
assert.ok(app.includes("channel==='review'"),'Review channel missing');
assert.ok(app.includes('PRACTICE_SECTION_BASE_TASKS=4'),'practice section base task contract missing');
assert.ok(app.includes('PRACTICE_SECTION_MAX_TASKS=6'),'practice recovery cap missing');
assert.ok(app.includes('practiceSectionCompletionAllowed(projectedAttempts,projectedCorrect,correct)'),'app must delegate completion to the engine-owned gate');
assert.equal(practiceSectionCompletionAllowed(4,3,true),true,'practice section needs at least 3 correct');
assert.equal(practiceSectionCompletionAllowed(4,3,false),false,'final response must be correct for section completion');
assert.ok(app.includes('appendPracticeSectionRecovery()'),'incomplete section must receive short recovery work');
assert.ok(app.includes('recordPracticeSectionAttempt'),'native practice progress must persist');
assert.ok(app.includes("practiceSectionState(snapshot,index)"),'practice sections need sequential access');
assert.ok(app.includes("snapshot.review.status==='due'"),'Review must only become an active task when due');
assert.ok(app.includes('lessonCenterReturn:!!lessonLaunch'),'Lesson Center work must return to the center');
assert.ok(app.includes("session?.lessonReplayStep!=null")&&app.includes("session?.lessonReplay?0:saved"),'completed reference lessons must replay from the beginning and inspector may target a step');
assert.ok(app.includes('lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now()'),'replay must preserve original lesson completion time');
assert.match(css,/\.lesson-channel-grid/);
assert.match(css,/\.lesson-practice-row\.current/);
assert.match(css,/\.lesson-channel-card\.review\.due/);

const state=defaultState(); state.profile='grade2'; ensureLearningArchitectureState(state);
let snap=lessonProgressSnapshot(state,'number1000',1000);
assert.equal(snap.practice.status,'locked');
ensureSkillState(state,'number1000').learningCycle.lessonTaughtAt=100;
snap=lessonProgressSnapshot(state,'number1000',1000);
assert.equal(snap.learn.status,'complete');
assert.equal(snap.practice.status,'ready');

recordPracticeSectionAttempt(state,'number1000','build-number',{correct:true,complete:false,now:110});
recordPracticeSectionAttempt(state,'number1000','build-number',{correct:true,complete:false,now:120});
recordPracticeSectionAttempt(state,'number1000','build-number',{correct:false,complete:false,now:130});
recordPracticeSectionAttempt(state,'number1000','build-number',{correct:true,complete:true,now:140});
snap=lessonProgressSnapshot(state,'number1000',1000);
assert.equal(snap.practice.sections[0].nativeAttempts,4);
assert.equal(snap.practice.sections[0].nativeCorrect,3);
assert.ok(snap.practice.sections[0].completedAt);

console.log('lesson center: PASS (Learn / sectioned Practice / due Review + real progress)');

assert.ok(app.includes("section.cycleAttempts||0"),'practice resume must use current section cycle');
assert.ok(app.includes("PRACTICE_SECTION_BASE_TASKS-cycle"),'unfinished section must schedule only remaining base tasks');
assert.ok(app.includes("resetPracticeSectionCycle"),'exhausted incomplete cycle must be retryable without erasing lifetime evidence');
assert.ok(app.includes("generateLessonPracticeQuestion("),'section labels must control real question generation');

assert.ok(app.includes('function startPrimaryJourney()'),'P2 needs a single curriculum-aware home entry');
assert.ok(app.includes("if(state.profile==='grade2')"),'home entry must preserve P1 behavior and special-case P2 architecture');
assert.ok(app.includes("if(current){ openLessonCenter(current.id); return; }"),'P2 home entry must route through Lesson Center');
assert.ok(app.includes("$('#startSessionButton').addEventListener('click',startPrimaryJourney)"),'main CTA must use curriculum-aware entry');
assert.ok(app.includes("$('#bottomStart').addEventListener('click',startPrimaryJourney)"),'bottom CTA must use curriculum-aware entry');
assert.ok(!app.includes('Konu anlatımı kapandı'),'completed Learn copy must not imply the lesson is permanently closed');
assert.ok(app.includes('Konu anlatımı tamamlandı. İstersen Ders Merkezi’nden yeniden açabilir veya Uygula bölümlerine geçebilirsin.'),'completed Learn copy must explain replay and next action');

const reviewSuccessState=defaultState(); reviewSuccessState.profile='grade2'; ensureLearningArchitectureState(reviewSuccessState);
const reviewSuccessSkill=ensureSkillState(reviewSuccessState,'numberPattern1000');
reviewSuccessSkill.learningCycle.firstCycleCompletedAt=100;
reviewSuccessSkill.learningCycle.retrievalDueAt=200;
let reviewSnap=lessonProgressSnapshot(reviewSuccessState,'numberPattern1000',250);
assert.equal(reviewSnap.review.status,'due','completed pattern lesson should expose a due review at the scheduled time');
let reviewQuestion=generateQuestion('numberPattern1000','symbol',2,()=>0.42);
reviewQuestion.learningPhase='retrieval';
applyAnswer(reviewSuccessState,reviewQuestion,{correct:true,isDelayedReview:true,now:250,sessionQuestionIndex:1});
reviewSnap=lessonProgressSnapshot(reviewSuccessState,'numberPattern1000',250);
assert.equal(reviewSnap.review.dueAt,0,'successful delayed review must clear the Lesson Center due time');
assert.equal(reviewSnap.review.status,'caught-up','successful delayed review must leave Review caught up');

const reviewFailState=defaultState(); reviewFailState.profile='grade2'; ensureLearningArchitectureState(reviewFailState);
const reviewFailSkill=ensureSkillState(reviewFailState,'numberPattern1000');
reviewFailSkill.learningCycle.firstCycleCompletedAt=100;
reviewFailSkill.learningCycle.retrievalDueAt=200;
reviewFailState.reviewQueue.push({id:'retention:numberPattern1000:100',skillId:'numberPattern1000',representation:'symbol',phase:'retrieval',dueAt:200,stage:'next-day'});
lessonProgressSnapshot(reviewFailState,'numberPattern1000',250);
reviewQuestion=generateQuestion('numberPattern1000','symbol',2,()=>0.42);
reviewQuestion.learningPhase='retrieval';
applyAnswer(reviewFailState,reviewQuestion,{correct:false,isDelayedReview:true,now:250,sessionQuestionIndex:1});
reviewSnap=lessonProgressSnapshot(reviewFailState,'numberPattern1000',250);
assert.equal(reviewSnap.review.status,'scheduled','failed delayed review must schedule another delayed retrieval instead of disappearing');
assert.ok(reviewSnap.review.dueAt>250,'failed delayed review must move the next due time into the future');
assert.ok(reviewFailState.reviewQueue.some(item=>item.skillId==='numberPattern1000'&&item.stage==='same-session'),'failed delayed review must create immediate support');
assert.ok(reviewFailState.reviewQueue.some(item=>item.skillId==='numberPattern1000'&&item.stage==='next-day'&&item.dueAt>250),'failed delayed review must retain a future retrieval check');

