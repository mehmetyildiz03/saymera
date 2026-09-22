import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  defaultState,ensureLearningArchitectureState,ensureSkillState,currentCurriculumSkill,
  P2_LESSON_CONTRACTS,generateLessonPracticeQuestion,generateQuestion
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.ok(app.includes("const LESSON_FIRST_SKILLS=new Set(['nelMatchAttributes','number1000','compareOrder1000','numberPattern1000','oddEven1000'])"),'oddEven1000 must teach before checking');
assert.ok(app.includes('const ODD_EVEN1000_LESSON_VERSION=1'),'odd/even lesson must be versioned');
assert.ok(app.includes("if(skill.id==='oddEven1000'){ renderOddEven1000LessonStep(skill); return; }"),'odd/even must use a dedicated lesson renderer');
assert.deepEqual(P2_LESSON_CONTRACTS.oddEven1000.practice.sections.map(x=>x.id),[
  'pair-model','see-leftover','classify-parity','ones-rule','explain-parity','transfer-parity'
]);

const ids=['pair-six','pair-seven','pair-contrast','ten-is-pairable','hundred-is-pairable','ones-decide','zero-one-boundary','even-endings','odd-endings','classify-three-digit','consecutive-switch','pairing-transfer'];
for(const id of ids) assert.ok(app.includes("id:'"+id+"'"),'missing odd/even teaching step '+id);
assert.ok(app.indexOf("id:'pair-six'")<app.indexOf("id:'ones-decide'"),'pairing meaning must precede the ones-place shortcut');
assert.ok(app.indexOf("id:'ones-decide'")<app.indexOf("id:'even-endings'"),'ones-place reasoning must precede memorised ending sets');
assert.ok(app.indexOf("id:'even-endings'")<app.indexOf("id:'classify-three-digit'"),'ending rule must be built before broad classification');
assert.ok(app.includes("n:1000,parity:'Çift'"),'Learn must explicitly classify 1000 as even');
assert.match(css,/\.odd-even-digit-grid/);
assert.match(css,/\.odd-even-classify-row/);
assert.match(css,/\.odd-even-section-track/);

const lessonSlice=app.slice(app.indexOf('const ODD_EVEN1000_LESSON_VERSION'),app.indexOf('function lessonBlueprintFor'));
assert.ok(!/[×÷]/.test(lessonSlice),'odd/even teaching must not introduce multiplication/division notation');
assert.ok(!/asal|bölünebilir|çarpım|çarpma|katına|faktör/i.test(lessonSlice),'odd/even teaching must not preteach later number-theory or multiplication language');

let seed=773; const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const endings=new Set(); let thousand=false;
for(let i=0;i<1000;i++){
  const q=generateLessonPracticeQuestion('oddEven1000','classify-parity',i%4,2,rng);
  assert.ok(['Tek','Çift'].includes(String(q.answer)));
  assert.ok([0,1].includes(Number(q.parityLeftover)),'parity model metadata must leave only 0 or 1');
  if(Number.isFinite(Number(q.parityNumber))) endings.add(Number(q.parityNumber)%10);
  if(Number(q.parityNumber)===1000){ thousand=true; assert.equal(q.answer,'Çift'); }
  const text=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
  assert.doesNotMatch(text,/asal|bölünebilir|çarpım|çarpma|katına|faktör/i);
}
assert.deepEqual([...endings].sort((a,b)=>a-b),[0,1,2,3,4,5,6,7,8,9]);
assert.ok(thousand,'generated classification coverage must include 1000');

for(const section of P2_LESSON_CONTRACTS.oddEven1000.practice.sections){
  const qs=Array.from({length:12},(_,i)=>generateLessonPracticeQuestion('oddEven1000',section.id,i,2,rng));
  assert.ok(qs.every(q=>q.skillId==='oddEven1000'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
}
const pairQ=generateLessonPracticeQuestion('oddEven1000','pair-model',0,2,rng);
assert.equal(pairQ.response.interaction,'parity-pair');
assert.ok([0,1].includes(Number(pairQ.answer)));
const genericSymbol=generateQuestion('oddEven1000','symbol',2,rng);
assert.deepEqual(new Set(genericSymbol.response.options.map(o=>o.value)),new Set(['Tek','Çift']));

const state=defaultState();state.profile='grade2';ensureLearningArchitectureState(state);
for(const id of ['number1000','compareOrder1000']) ensureSkillState(state,id).learningCycle.firstCycleCompletedAt=100;
assert.equal(currentCurriculumSkill(state).id,'numberPattern1000');
ensureSkillState(state,'numberPattern1000').learningCycle.firstCycleCompletedAt=200;
assert.equal(currentCurriculumSkill(state).id,'oddEven1000','odd/even must open only after number-pattern completion');

console.log('MOE P2 odd/even teaching: PASS (pairing → ones place → ending rule → classification → transfer)');
