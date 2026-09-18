import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  defaultState,ensureLearningArchitectureState,ensureSkillState,
  curriculumUnitsFor,currentCurriculumSkill,lessonProgressSnapshot
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.ok(app.includes('function renderGrade2Atlas()'),'P2 Atlas needs a curriculum-roadmap renderer');
assert.ok(app.includes("curriculumUnitsFor('grade2')"),'Atlas must render architecture units rather than regroup skills ad hoc');
assert.ok(app.includes('lessonProgressSnapshot(state,skill.id)'),'Atlas lesson states must come from the new lesson journey');
assert.ok(app.includes("snapshot.access.status==='completed'"),'Atlas completion must use lesson completion, not stable/mastery');
assert.ok(app.includes("snapshot.access.status==='current'"),'Atlas must show the current new-learning lesson');
assert.ok(app.includes("snapshot.access.status==='locked'"),'future new learning must be visibly locked');
assert.ok(app.includes('data-atlas-unit-toggle'),'unit sections must be expandable');
assert.ok(app.includes('data-atlas-lesson'),'lesson rows must be selectable');
assert.ok(app.includes('function openLessonCenter(skillId)'),'unlocked Atlas lessons must open the Lesson Center');
assert.ok(app.includes("navigate('lessonCenter')"),'Atlas lesson selection must route through the Lesson Center');
assert.ok(app.includes("showToast(blocker?'Önce “'+atlasSkillLabel(blocker)+'” dersini tamamla."),'locked lessons must explain the gate');
assert.ok(!app.slice(app.indexOf('function renderGrade2Atlas'),app.indexOf('function renderLegacyAtlas')).includes('masteryPercent'),'P2 Atlas must not display a fabricated mastery percentage');
assert.match(html,/Matematik yolun burada\./);
assert.match(css,/\.atlas-roadmap/);
assert.match(css,/\.atlas-unit-head/);
assert.match(css,/\.atlas-lesson-row\.current/);
assert.match(css,/\.atlas-lesson-row\.locked/);
assert.match(css,/\.atlas-review-badge/);

const state=defaultState(); state.profile='grade2'; ensureLearningArchitectureState(state);
const units=curriculumUnitsFor('grade2');
assert.equal(units[0].id,'whole-numbers');
assert.equal(currentCurriculumSkill(state)?.id,'number1000');
let first=lessonProgressSnapshot(state,'number1000');
let second=lessonProgressSnapshot(state,'compareOrder1000');
assert.equal(first.access.status,'current');
assert.equal(second.access.status,'locked');

ensureSkillState(state,'number1000').learningCycle.firstCycleCompletedAt=100;
first=lessonProgressSnapshot(state,'number1000');
second=lessonProgressSnapshot(state,'compareOrder1000');
assert.equal(first.access.status,'completed','earlier lesson stays accessible after completion');
assert.equal(second.access.status,'current','next canonical lesson opens');
assert.equal(currentCurriculumSkill(state)?.id,'compareOrder1000');

console.log('atlas roadmap: PASS (units + ordered lesson states + revisit + targeted launch)');
