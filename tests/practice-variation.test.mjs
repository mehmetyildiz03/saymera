import assert from 'node:assert/strict';
import {
  skillsFor,supportsLearningCycle,defaultState,ensureSkillState,buildLearningCyclePlan,
  createConceptInstance,generateLearningQuestion
} from '../engine.mjs';

const makeRng=(seed)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const pattern=prompt=>String(prompt||'')
  .toLocaleLowerCase('tr-TR')
  .replace(/\d+/g,'#')
  .replace(/\s+/g,' ')
  .trim();

const refs=[...skillsFor('grade1'),...skillsFor('grade2')].filter(s=>supportsLearningCycle(s.id));
let cycles=0;
for(const [si,skill] of refs.entries()){
  for(let trial=0;trial<100;trial++){
    cycles++;
    const rng=makeRng(910000+si*1000+trial);
    const state=defaultState();
    const ss=ensureSkillState(state,skill.id);
    const plan=buildLearningCyclePlan(ss);
    const focus=createConceptInstance(skill.id,2,rng);
    const seen=new Set();
    for(const item of plan){
      if(item.phase==='readiness') continue;
      const concept=item.conceptScope==='fresh'?createConceptInstance(skill.id,2,rng):focus;
      const q=generateLearningQuestion(
        skill.id,item.phase,item.representation,2,rng,concept,
        item.phase==='practice'?{practiceIndex:item.practiceIndex??0}:{}
      );
      const key=`${q.representation}|${pattern(q.prompt)}`;
      assert.ok(!seen.has(key),`${skill.id}: repeated first-cycle prompt template: ${key}`);
      seen.add(key);
      if(item.phase==='practice') assert.ok(q.practiceVariant>=1,`${skill.id}: practice variant marker missing`);
    }
  }
}

// Fractions need more than a generic prefix because the original UX made them feel like
// the same question repeated with another denominator/numerator.
for(const skillId of ['fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2']){
  const rng=makeRng(990000+skillId.length);
  const c=createConceptInstance(skillId,2,rng);
  const symbol=generateLearningQuestion(skillId,'practice','symbol',2,rng,c,{practiceIndex:0});
  const transfer=generateLearningQuestion(skillId,'practice','transfer',2,rng,createConceptInstance(skillId,2,rng),{practiceIndex:1});
  assert.ok(symbol.practiceVariant&&transfer.practiceVariant,`${skillId}: fraction practice variant not applied`);
  assert.ok(!/^Yeni örnek:/i.test(symbol.prompt),`${skillId}: fraction symbol practice fell back to cosmetic prefix`);
  assert.ok(!/^Yeni durum:/i.test(transfer.prompt),`${skillId}: fraction transfer practice fell back to cosmetic prefix`);
}

console.log(`practice-variation tests: PASS (${refs.length} reference skills; ${cycles} simulated first cycles)`);
