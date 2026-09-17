import assert from 'node:assert/strict';
import {skillsFor,supportsLearningCycle,REPRESENTATIONS,createConceptInstance,generateQuestion} from '../engine.mjs';
const makeRng=(seed)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const refs=[...skillsFor('grade1'),...skillsFor('grade2')].filter(s=>supportsLearningCycle(s.id));
const forbidden=[/kanıt profili/i,/temsil genişliği/i,/puanlanan şey/i,/öğrenme döngüsü/i,/practicecheckpoint/i,/conceptkey/i,/taskkind/i,/mastery/i,/remediation/i,/evidence/i,/standart algoritma/i];
for(const [si,skill] of refs.entries()){
  for(const rep of REPRESENTATIONS){
    for(let i=0;i<12;i++){
      const rng=makeRng(700000+si*1000+REPRESENTATIONS.indexOf(rep)*50+i);
      const c=createConceptInstance(skill.id,1+(i%4),rng);
      const q=generateQuestion(skill.id,rep,1+(i%4),rng,c);
      const child=[q.prompt,q.hint,q.explain,q.teachingNote,q.feedbackTitle].filter(Boolean).join(' | ');
      for(const rx of forbidden) assert.ok(!rx.test(child),`${skill.id}/${rep}: child copy leaked ${rx}: ${child}`);
    }
  }
}
console.log(`child-copy tests: PASS (${refs.length} reference skills; no internal/adult engine jargon)`);
