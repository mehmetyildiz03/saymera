import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  defaultState,ensureLearningArchitectureState,ensureSkillState,
  lessonProgressSnapshot,recordPracticeSectionAttempt
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.match(html,/id="lessonCenterScreen"/);
assert.match(html,/id="lessonCenterBody"/);
assert.ok(app.includes('function renderLessonCenter()'),'Lesson Center renderer missing');
assert.ok(app.includes("function startLessonChannel(skillId,channel,sectionId=null)"),'Lesson Center channel launcher missing');
assert.ok(app.includes("channel==='learn'"),'Learn channel missing');
assert.ok(app.includes("channel==='practice'"),'Practice channel missing');
assert.ok(app.includes("channel==='review'"),'Review channel missing');
assert.ok(app.includes('PRACTICE_SECTION_BASE_TASKS=4'),'practice section base task contract missing');
assert.ok(app.includes('PRACTICE_SECTION_MAX_TASKS=6'),'practice recovery cap missing');
assert.ok(app.includes('projectedCorrect>=3'),'practice section needs at least 3 correct');
assert.ok(app.includes('correct&&projectedAttempts>=PRACTICE_SECTION_BASE_TASKS'),'final response must be correct for section completion');
assert.ok(app.includes('appendPracticeSectionRecovery()'),'incomplete section must receive short recovery work');
assert.ok(app.includes('recordPracticeSectionAttempt'),'native practice progress must persist');
assert.ok(app.includes("practiceSectionState(snapshot,index)"),'practice sections need sequential access');
assert.ok(app.includes("snapshot.review.status==='due'"),'Review must only become an active task when due');
assert.ok(app.includes('lessonCenterReturn:!!lessonLaunch'),'Lesson Center work must return to the center');
assert.ok(app.includes("session?.lessonReplay?0:saved"),'completed reference lessons must replay from the beginning without clearing progress');
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
