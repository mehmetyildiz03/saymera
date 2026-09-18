import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  defaultState,ensureSkillState,skillsFor,
  curriculumSequenceFor,currentCurriculumSkill,curriculumSkillUnlocked
} from '../engine.mjs';

const expectedP2=[
  'number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2',
  'times23510','divisionTables2','multDivFamilies2',
  'fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2',
  'moneyP2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2',
  'shapePatterns2','solids2','pictureGraphScale2'
];
assert.deepEqual(curriculumSequenceFor('grade2').map(s=>s.id),expectedP2);
assert.ok(expectedP2.indexOf('moneyP2')<expectedP2.indexOf('lengthMetre2'),'MOE Money must precede Measurement & Geometry');
assert.equal(curriculumSequenceFor('preschool').length,0);

const state=defaultState();
state.profile='grade2';
skillsFor('grade2').forEach(s=>ensureSkillState(state,s.id));
assert.equal(currentCurriculumSkill(state)?.id,'number1000','P2 must start with number1000');
assert.equal(curriculumSkillUnlocked(state,'number1000'),true);
assert.equal(curriculumSkillUnlocked(state,'times23510'),false,'later no-prerequisite topic must still be curriculum-locked');
assert.equal(curriculumSkillUnlocked(state,'fractionMeaning2'),false,'fractions cannot jump ahead');

ensureSkillState(state,'number1000').learningCycle.firstCycleCompletedAt=1;
assert.equal(currentCurriculumSkill(state)?.id,'compareOrder1000');
assert.equal(curriculumSkillUnlocked(state,'number1000'),true,'completed earlier topic remains available for review');
assert.equal(curriculumSkillUnlocked(state,'compareOrder1000'),true);
assert.equal(curriculumSkillUnlocked(state,'numberPattern1000'),false);

for(const id of expectedP2.slice(0,9)) ensureSkillState(state,id).learningCycle.firstCycleCompletedAt=1;
assert.equal(currentCurriculumSkill(state)?.id,'fractionMeaning2','fractions open only after preceding P2 sequence');

for(const id of expectedP2) ensureSkillState(state,id).learningCycle.firstCycleCompletedAt=1;
assert.equal(currentCurriculumSkill(state),null,'after first-pass curriculum completion there is no locked new topic');
assert.equal(curriculumSkillUnlocked(state,'pictureGraphScale2'),true);

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.match(app,/kind:'lesson-intro'/,'first-cycle plan must contain a non-question lesson introduction');
assert.match(app,/P2_LESSON_BLUEPRINTS/,'P2 lesson teaching blueprints must exist');
assert.match(app,/renderLessonIntro/,'lesson introduction must render separately from question rendering');
assert.match(app,/currentCurriculumSkill\(state\)/,'UI focus must use curriculum sequencer');
assert.match(html,/id="practiceMode"/,'practice header must show activity mode');
assert.match(html,/class="practice-topic-copy"/,'practice header must expose a clear topic title');
assert.match(css,/\.practice-shell\{height:100dvh;max-height:100dvh;overflow:hidden\}/,'tablet practice shell must be viewport-bound');
assert.match(css,/@media \(min-width:700px\) and \(max-height:1024px\)/,'tablet-specific compact layout is required');
assert.match(css,/\.practice-content\{min-height:0;overflow:hidden/,'tablet lesson content must not vertically scroll by default');

console.log('curriculum lesson shell tests: PASS (ordered new learning + lesson intro + tablet viewport contract)');
