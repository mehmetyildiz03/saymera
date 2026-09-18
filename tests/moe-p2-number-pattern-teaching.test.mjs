import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  P2_LESSON_CONTRACTS,generateLessonPracticeQuestion
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.ok(app.includes("const LESSON_FIRST_SKILLS=new Set(['number1000','compareOrder1000','numberPattern1000'])"),'numberPattern1000 must teach before checking');
assert.ok(app.includes('const PATTERN1000_LESSON_VERSION=2'),'number-pattern lesson must be versioned');
assert.ok(app.includes("if(skill.id==='numberPattern1000'){ renderPattern1000LessonStep(skill); return; }"),'number-pattern must use dedicated lesson renderer');
for(const id of ['one-more-model','ten-more-model','hundred-more-model','ten-less-model','place-change-track','ten-regroup-boundary','describe-up-rule','describe-down-rule','continue-after-rule','missing-middle','same-rule-transfer']){
  assert.ok(app.includes("id:'"+id+"'"),'missing number-pattern teaching step '+id);
}
assert.ok(app.indexOf("id:'place-change-track'")<app.indexOf("id:'describe-up-rule'"),'place-value change must be seen before rule naming');
assert.ok(app.indexOf("id:'describe-up-rule'")<app.indexOf("id:'continue-after-rule'"),'the rule must be described before continuation');
assert.ok(app.indexOf("id:'continue-after-rule'")<app.indexOf("id:'missing-middle'"),'continuation should precede missing-middle work');
assert.ok(app.includes("title:'Devam ettirmeden önce kuralı söyle.'"),'MOE describe-before-continue intent must be explicit');
assert.ok(app.includes("action:'1 birlik ekle'"));
assert.ok(app.includes("action:'1 onluk ekle'"));
assert.ok(app.includes("action:'1 yüzlük ekle'"));
assert.ok(app.includes("action:'1 onluk çıkar'"));
assert.ok(app.includes("dropTargetAtPoint(slotSelector"),'pattern cards need touch-safe drag target geometry');
assert.match(css,/\.pattern-place-board/);
assert.match(css,/\.pattern-rule-slot/);
assert.match(css,/\.pattern-number-slot/);
assert.match(css,/\.pattern-track-sequence/);

const lessonSlice=app.slice(app.indexOf('const PATTERN1000_LESSON_VERSION'),app.indexOf('function lessonBlueprintFor'));
assert.ok(!/[×]/.test(lessonSlice),'number-pattern teaching must not introduce multiplication notation');
assert.ok(!/katına|çarpım tablosu/i.test(lessonSlice),'number-pattern teaching must not preteach multiplication');

assert.deepEqual(P2_LESSON_CONTRACTS.numberPattern1000.practice.sections.map(x=>x.id),[
  'model-change','describe-rule','continue-sequence','missing-number','explain-pattern','transfer-pattern'
]);
for(const section of P2_LESSON_CONTRACTS.numberPattern1000.practice.sections){
  const qs=Array.from({length:4},(_,i)=>generateLessonPracticeQuestion('numberPattern1000',section.id,i,2,()=>0.37));
  assert.ok(qs.every(q=>[1,10,100].includes(Math.abs(Number(q.patternStep)))),'section '+section.id+' escaped ±1/±10/±100 scope');
}
console.log('MOE P2 number-pattern teaching: PASS (place value → describe rule → continue → missing number)');

assert.ok(app.includes("title:'Adım aynı kalır; rakamlar bazen yeniden gruplanır.'"),'boundary regrouping must be taught explicitly');
assert.ok(app.includes('9 onluk + 1 onluk = 10 onluk = 1 yüzlük'),'290→300 regrouping relation missing');
assert.ok(!app.includes("title:'10 daha olduğunda onluklar değişir.'"),'do not overgeneralize +10 as only a tens-digit change');
assert.match(css,/\.pattern-regroup-flow/);
