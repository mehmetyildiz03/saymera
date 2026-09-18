import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  defaultState,ensureLearningArchitectureState,ensureSkillState,lessonProgressSnapshot,
  practiceSectionCompletionAllowed,runPedagogyStateAudit
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.equal(practiceSectionCompletionAllowed(4,3,false),false,'last wrong must never complete practice');
assert.equal(practiceSectionCompletionAllowed(4,3,true),true);
assert.equal(practiceSectionCompletionAllowed(3,3,true),false);

const clean=defaultState(); clean.profile='grade2'; ensureLearningArchitectureState(clean);
let report=runPedagogyStateAudit(clean,1000);
assert.equal(report.failed,0,'clean P2 architecture should pass runtime pedagogy audit');

const outOfOrder=defaultState(); outOfOrder.profile='grade2'; ensureLearningArchitectureState(outOfOrder);
ensureSkillState(outOfOrder,'numberPattern1000').learningCycle.firstCycleCompletedAt=100;
report=runPedagogyStateAudit(outOfOrder,1000);
assert.equal(report.checks.find(x=>x.id==='curriculum-continuity').pass,false,'out-of-order future completion must be flagged');

const badPractice=defaultState(); badPractice.profile='grade2'; ensureLearningArchitectureState(badPractice);
const ss=ensureSkillState(badPractice,'number1000');
ss.learningCycle.lessonTaughtAt=100;
lessonProgressSnapshot(badPractice,'number1000',1000);
ss.lessonJourney.practice.sections['place-value'].completedAt=200;
report=runPedagogyStateAudit(badPractice,1000);
assert.equal(report.checks.find(x=>x.id==='practice-order').pass,false,'skipped practice section must be flagged');

const earlyReview=defaultState(); earlyReview.profile='grade2'; ensureLearningArchitectureState(earlyReview);
ensureSkillState(earlyReview,'number1000').lessonJourney.review.dueAt=500;
report=runPedagogyStateAudit(earlyReview,1000);
assert.equal(report.checks.find(x=>x.id==='review-after-cycle').pass,false,'review before first cycle must be flagged');

assert.match(html,/id="inspectorScreen"/);
assert.match(html,/id="inspectorLauncher"[^>]*hidden/,'inspector entry must be hidden by default');
assert.ok(app.includes("new URLSearchParams(location.search).get('inspect')==='1'"),'inspector must require explicit URL gate');
assert.ok(app.includes('function enterInspectorSandbox()'),'sandbox entry missing');
assert.ok(app.includes('function exitInspectorSandbox()'),'sandbox exit missing');
assert.ok(app.includes('if(inspectorSandbox) return; try{ localStorage.setItem'),'sandbox must block persistent writes');
assert.ok(app.includes('inspectorRealState=state'),'real state must be retained outside sandbox');
assert.ok(app.includes('state=cloneState(state)'),'inspector must mutate a clone');
assert.ok(app.includes('state=inspectorRealState'),'exit must restore real state');
assert.ok(app.includes('lessonReplayStep:lessonLaunch?.lessonStep??null'),'inspector needs direct teaching-step launch');
assert.ok(app.includes('inspectorPreparePractice'),'inspector needs direct practice-section launch');
assert.ok(app.includes('inspectorPrepareReview'),'inspector needs due-review simulation');
assert.ok(app.includes('runPedagogyStateAudit(state)'),'runtime pedagogy audit must render in the inspector');
assert.ok(app.includes('function inspectorUiAudit()'),'UI contracts must be checked separately from state contracts');
assert.match(css,/\.inspector-grid/);
assert.match(css,/\.inspector-checks/);

console.log('dev inspector: PASS (sandbox + direct lesson launch + runtime pedagogy QA)');

assert.ok(app.includes("if(skillId==='numberPattern1000') return PATTERN1000_LESSON_STEPS.map"),'inspector must jump to pattern teaching steps');
assert.ok(app.includes("'pattern-teaching-order'"),'inspector must audit describe-before-continue order');
assert.ok(app.includes("'pattern-no-multiplication'"),'inspector must guard pattern scope from multiplication');
