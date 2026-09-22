import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  P2_LESSON_CONTRACTS,generateLessonPracticeQuestion
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.ok(app.includes("const LESSON_FIRST_SKILLS=new Set(['nelMatchAttributes','number1000','compareOrder1000','numberPattern1000','oddEven1000'])"),'numberPattern1000 must teach before checking');
assert.ok(app.includes('const PATTERN1000_LESSON_VERSION=3'),'number-pattern lesson must be versioned');
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
assert.ok(app.includes('class="pattern-track-value"'),'place-change tracking must label each whole number as a distinct group');
assert.match(css,/\.pattern-track-number\{[^}]*border:1px solid var\(--line\)/,'place-change numbers must have visible group boundaries');
assert.ok(!app.includes("$('#patternLessonHelp').textContent=step.result"),'successful pattern steps must not duplicate the result in helper text');
assert.ok(!app.includes("body:'Bu dizide her adımda 10 daha. Aynı değişimi bir kez daha uygula.'"),'continue teaching must not reveal the rule before the child identifies it');
assert.ok(app.includes("body:'Önce komşu sayılar arasındaki değişimi sözcükle tarif et. Sonra aynı değişimi bir kez daha uygula.'"),'continue teaching should prompt rule noticing before continuation');

// The rule must match the actual displayed sequence, not an unrelated anchor.
const {patternContinuationRule,generateQuestion}=await import('../engine.mjs');
let seed=192; const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const seen=new Set();
for(let i=0;i<200;i++){
  for(const section of ['continue-sequence','missing-number','transfer-pattern']){
    const q=generateLessonPracticeQuestion('numberPattern1000',section,i%4,2,rng);
    const known=q.visual.items.map((n,index)=>({n,index})).filter(x=>typeof x.n==='number');
    const step=(known[1].n-known[0].n)/(known[1].index-known[0].index);
    seen.add(step);
    assert.equal(q.patternStep,step,'metadata must describe this task, not its anchor');
    assert.equal(q.patternRule,patternContinuationRule(q));
    assert.equal(patternContinuationRule(q),'Her adımda '+Math.abs(step)+' '+(step>0?'daha.':'daha az.'));
  }
  for(const rep of ['build','see','symbol','transfer']){
    assert.ok(patternContinuationRule(generateQuestion('numberPattern1000',rep,2,rng)),'learn/review continuation also needs its own rule');
  }
}
assert.deepEqual([...seen].sort((a,b)=>a-b),[-100,-10,-1,1,10,100]);
assert.equal(patternContinuationRule(generateQuestion('number1000','symbol',2,rng)),null);
const modelTask=generateLessonPracticeQuestion('numberPattern1000','model-change',2,2,rng);
assert.equal(modelTask.response.interaction,'base1000-build');
assert.equal(modelTask.visual.type,'base1000-operation-build');
assert.equal(modelTask.answer.split('|').map(Number).reduce((sum,n,i)=>sum+n*[100,10,1][i],0),modelTask.visual.a+(modelTask.visual.op==='+'?1:-1)*modelTask.visual.b);
console.log('Pattern rule gates: PASS (all six signed steps, gaps, practice and review; model production)');
