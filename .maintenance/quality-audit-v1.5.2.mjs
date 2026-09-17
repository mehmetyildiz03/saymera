import {
  skillsFor, supportsLearningCycle, ensureSkillState, defaultState, buildLearningCyclePlan,
  createConceptInstance, generateLearningQuestion, REPRESENTATIONS
} from '../engine.mjs';

const makeRng=(seed=1)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const refs=[...skillsFor('grade1'),...skillsFor('grade2')].filter(s=>supportsLearningCycle(s.id));
const exactSignature=q=>JSON.stringify({
  skillId:q.skillId,representation:q.representation,taskKind:q.taskKind,
  prompt:q.prompt,answer:String(q.answer),visual:q.visual??null,choices:q.choices??null,
  response:q.response?{kind:q.response.kind,interaction:q.response.interaction??null,expectedValue:q.response.expectedValue??null,options:q.response.options??null}:null,
  teachingNote:q.teachingNote??null
});
const promptPattern=q=>String(q.prompt||'').toLocaleLowerCase('tr-TR').replace(/\d+/g,'#').replace(/\s+/g,' ').trim();
const childText=q=>[q.prompt,q.hint,q.explain,q.teachingNote,q.feedbackTitle].filter(Boolean).join(' | ');
const adultish=[/kanıt/i,/mastery/i,/remediation/i,/motor/i,/puanlan/i,/öğrenme döng/i,/taskkind/i,/representation/i,/evidence/i,/algoritma/i];

let totalSessions=0,totalExactCollisions=0,totalPatternRepeats=0;
const exactBySkill=new Map(), patternBySkill=new Map();
const languageHits=[];
for(const [si,skill] of refs.entries()){
  let exactCollisions=0,patternRepeats=0;
  for(let trial=0;trial<250;trial++){
    totalSessions++;
    const rng=makeRng(100000+si*1000+trial);
    const state=defaultState();
    const ss=ensureSkillState(state,skill.id);
    const plan=buildLearningCyclePlan(ss);
    const focus=createConceptInstance(skill.id,2,rng);
    const seenExact=new Set(), seenPattern=new Set();
    for(const item of plan){
      let concept=null;
      if(item.phase!=='readiness'){
        const fresh=item.conceptScope==='fresh';
        concept=fresh?createConceptInstance(skill.id,2,rng):focus;
      }
      const q=generateLearningQuestion(skill.id,item.phase,item.representation,2,rng,concept);
      if(item.phase!=='readiness'){
        const sig=exactSignature(q), pat=`${q.representation}|${promptPattern(q)}`;
        if(seenExact.has(sig)){exactCollisions++;totalExactCollisions++;}
        if(seenPattern.has(pat)){patternRepeats++;totalPatternRepeats++;}
        seenExact.add(sig); seenPattern.add(pat);
      }
      const text=childText(q);
      for(const rx of adultish) if(rx.test(text)) languageHits.push({skill:skill.id,phase:item.phase,pattern:String(rx),text});
    }
  }
  if(exactCollisions) exactBySkill.set(skill.id,exactCollisions);
  if(patternRepeats) patternBySkill.set(skill.id,patternRepeats);
}

const lowExactDiversity=[];
for(const [si,skill] of refs.entries()) for(const rep of REPRESENTATIONS){
  const rng=makeRng(800000+si*100+REPRESENTATIONS.indexOf(rep));
  const set=new Set();
  for(let i=0;i<120;i++){
    const c=createConceptInstance(skill.id,2,rng);
    set.add(exactSignature(generateLearningQuestion(skill.id,'practice',rep,2,rng,c)));
  }
  if(set.size<4) lowExactDiversity.push({skill:skill.id,rep,unique:set.size});
}

console.log('REFERENCE_SKILLS',refs.length);
console.log('SIMULATED_FIRST_CYCLES',totalSessions);
console.log('EXACT_WITHIN_SESSION_COLLISIONS',totalExactCollisions);
console.log('EXACT_COLLISIONS_BY_SKILL',JSON.stringify([...exactBySkill.entries()]));
console.log('SAME_PROMPT_PATTERN_REPEATS',totalPatternRepeats);
console.log('PROMPT_PATTERN_REPEATS_BY_SKILL',JSON.stringify([...patternBySkill.entries()]));
console.log('LOW_EXACT_DIVERSITY',JSON.stringify(lowExactDiversity));
const dedupLang=[]; const keys=new Set();
for(const h of languageHits){const k=h.skill+'|'+h.phase+'|'+h.pattern+'|'+h.text;if(!keys.has(k)){keys.add(k);dedupLang.push(h);}}
console.log('CHILD_LANGUAGE_HITS',JSON.stringify(dedupLang.slice(0,200)));
if(totalExactCollisions>0) process.exitCode=2;
