import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  skillsFor,PRESCHOOL_NEL_PATHS,PRESCHOOL_NEL_KSD_MAP,PRESCHOOL_TO_P1_BRIDGES,
  PRESCHOOL_NEL_LESSON_CONTRACTS,generateLessonPracticeQuestion,generateQuestion,
  defaultState,runPedagogyStateAudit
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const contract=fs.readFileSync(new URL('../PRESCHOOL_NEL_RESEARCH_CONTRACT.md',import.meta.url),'utf8');

assert.equal(PRESCHOOL_NEL_PATHS.length,3,'NEL v2 must expose three parallel development paths');
assert.deepEqual(PRESCHOOL_NEL_PATHS.map(p=>p.id),['relationships-patterns','counting-number-sense','shapes-space']);

const expectedKsd=['2.1','2.2','2.3','2.4','3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8','4.1','4.2','4.3','4.4'];
for(const code of expectedKsd) assert.ok(PRESCHOOL_NEL_KSD_MAP[code]?.length,'missing NEL KSD mapping '+code);

assert.equal(skillsFor('preschool').some(s=>s.id==='nelMatchAttributes'),false,'unfinished NEL v2 skills must stay hidden from the live preschool map');
assert.equal(skillsFor('preschool',{includeHidden:true}).some(s=>s.id==='nelMatchAttributes'),true,'Inspector must reach the hidden NEL reference skill');

const preschoolIds=new Set(skillsFor('preschool',{includeHidden:true}).map(s=>s.id));
assert.equal(skillsFor('grade1',{includeHidden:true}).some(skill=>(skill.prerequisite||[]).some(id=>preschoolIds.has(id))),false,'P1 must not hard-require preschool completion');

assert.ok(PRESCHOOL_TO_P1_BRIDGES.number20.includes('nelReliableCount10'));
assert.ok(PRESCHOOL_TO_P1_BRIDGES.numberBonds10.includes('nelPartWhole10'));

const matchContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelMatchAttributes;
assert.equal(matchContract.practice.sections.length,5);
assert.deepEqual(matchContract.practice.sections.map(s=>s.id),['match-exact','match-colour-shape','match-size-measure','explain-match','transfer-match']);
assert.deepEqual(matchContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const lessonIds=['same-object','same-colour','same-shape','same-size','same-length','same-height','explain-match','real-world-match'];
for(const id of lessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL matching Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelMatchAttributes'){ renderNelMatchLessonStep(skill); return; }"));
assert.ok(app.includes("const LESSON_FIRST_SKILLS=new Set(['nelMatchAttributes'"),'NEL matching must teach before checking');

let seed=711;
const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const forbiddenSymbols=['<','>','+','=','−'];
for(const section of matchContract.practice.sections){
  const qs=Array.from({length:8},(_,i)=>generateLessonPracticeQuestion('nelMatchAttributes',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelMatchAttributes'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL matching must not pull formal Primary notation forward: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'feedback must describe mathematics');
  }
}

const build=generateQuestion('nelMatchAttributes','build',1,rng);
assert.equal(build.response.interaction,'nel-match-pair');
assert.equal(build.response.kind,'manipulative');
const see=generateQuestion('nelMatchAttributes','see',1,rng);
assert.equal(see.response.kind,'visual-choice');

const auditState=defaultState();
auditState.profile='preschool';
const audit=runPedagogyStateAudit(auditState);
for(const id of ['nel-ksd-coverage','p1-no-preschool-hard-gate','nel-match-reference-contract']){
  assert.equal(audit.checks.find(c=>c.id===id)?.pass,true,'preschool audit failed: '+id);
}

assert.ok(contract.includes('Kur · Gör · Göster · Anlat · Taşı'));
assert.ok(contract.includes('Preschool is foundational but is **not a hard prerequisite for P1**.'));

console.log('NEL preschool contract: PASS (3 paths; 16 KSD groups; hidden matching reference; no P1 hard gate)');
