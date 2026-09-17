import {
  skillsFor, supportsLearningCycle, ensureSkillState, defaultState, buildLearningCyclePlan,
  createConceptInstance, generateLearningQuestion, REPRESENTATIONS
} from '../engine.mjs';

const makeRng=(seed=1)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const refs=[...skillsFor('grade1'),...skillsFor('grade2')].filter(s=>supportsLearningCycle(s.id));
const stable=o=>JSON.stringify(o??null,Object.keys(o??{}).sort());
const signature=q=>JSON.stringify({prompt:q.prompt,answer:String(q.answer),visual:q.visual??null,responseKind:q.response?.kind,interaction:q.response?.interaction??null});
const childText=q=>[q.prompt,q.hint,q.explain,q.teachingNote,q.feedbackTitle].filter(Boolean).join(' | ');
const adultish=[/kanıt/i,/mastery/i,/remediation/i,/motor/i,/puanlan/i,/pencere/i,/öğrenme döng/i,/taskkind/i,/representation/i,/evidence/i,/algoritma/i];

let totalSessions=0,totalCollisions=0;
const collisionBySkill=new Map();
const languageHits=[];
for(const [si,skill] of refs.entries()){
  let collisions=0;
  for(let trial=0;trial<250;trial++){
    totalSessions++;
    const rng=makeRng(100000+si*1000+trial);
    const state=defaultState();
    const ss=ensureSkillState(state,skill.id);
    const plan=buildLearningCyclePlan(ss);
    const focus=createConceptInstance(skill.id,2,rng);
    const seen=new Set();
    for(const item of plan){
      let concept=null;
      if(item.phase!=='readiness'){
        const fresh=item.conceptScope==='fresh';
        concept=fresh?createConceptInstance(skill.id,2,rng):focus;
      }
      const q=generateLearningQuestion(skill.id,item.phase,item.representation,2,rng,concept);
      if(item.phase!=='readiness'){
        const sig=signature(q);
        if(seen.has(sig)){collisions++;totalCollisions++;}
        seen.add(sig);
      }
      const text=childText(q);
      for(const rx of adultish) if(rx.test(text)) languageHits.push({skill:skill.id,phase:item.phase,pattern:String(rx),text});
    }
  }
  if(collisions) collisionBySkill.set(skill.id,collisions);
}

// Separate template diversity scan: exact generated tasks over many fresh concept instances.
const lowDiversity=[];
for(const [si,skill] of refs.entries()) for(const rep of REPRESENTATIONS){
  const rng=makeRng(800000+si*100+REPRESENTATIONS.indexOf(rep));
  const set=new Set();
  for(let i=0;i<120;i++){
    const c=createConceptInstance(skill.id,2,rng);
    set.add(signature(generateLearningQuestion(skill.id,'practice',rep,2,rng,c)));
  }
  if(set.size<4) lowDiversity.push({skill:skill.id,rep,unique:set.size});
}

console.log('REFERENCE_SKILLS',refs.length);
console.log('SIMULATED_FIRST_CYCLES',totalSessions);
console.log('EXACT_WITHIN_SESSION_COLLISIONS',totalCollisions);
console.log('COLLISIONS_BY_SKILL',JSON.stringify([...collisionBySkill.entries()]));
console.log('LOW_EXACT_DIVERSITY',JSON.stringify(lowDiversity));
const dedupLang=[]; const keys=new Set();
for(const h of languageHits){const k=h.skill+'|'+h.phase+'|'+h.pattern+'|'+h.text;if(!keys.has(k)){keys.add(k);dedupLang.push(h);}}
console.log('CHILD_LANGUAGE_HITS',JSON.stringify(dedupLang.slice(0,200)));
if(totalCollisions>0) process.exitCode=2;
