from pathlib import Path
import re, json

ROOT=Path('.')
engine_path=ROOT/'engine.mjs'
app_path=ROOT/'app.js'
test_path=ROOT/'tests/learning-cycle.test.mjs'
package_path=ROOT/'package.json'
sw_path=ROOT/'sw.js'
doc_path=ROOT/'LEARNING_CYCLE_V1_3.md'

engine=engine_path.read_text(encoding='utf-8')
app=app_path.read_text(encoding='utf-8')

# Learning-cycle state remembers that a readiness scaffold was needed.
engine=engine.replace(
"    readinessNeedsSupport:false,\n    phases:Object.fromEntries(LEARNING_PHASES.map(p=>[p,{attempts:0,correct:0,lastSeen:0}]))",
"    readinessNeedsSupport:false,\n    readinessSupportUsed:false,\n    phases:Object.fromEntries(LEARNING_PHASES.map(p=>[p,{attempts:0,correct:0,lastSeen:0}]))",
1)
engine=engine.replace(
"  lc.readinessNeedsSupport=!!lc.readinessNeedsSupport;\n  lc.phases ||= {};",
"  lc.readinessNeedsSupport=!!lc.readinessNeedsSupport;\n  lc.readinessSupportUsed=!!lc.readinessSupportUsed;\n  lc.phases ||= {};",
1)

# Replace generic target-skill readiness with prerequisite/foundation-grounded readiness.
pattern=r"function generateReadinessQuestion\(skillId,difficulty=1,rng=Math\.random\)\{[\s\S]*?\n\}\n\nexport function generateLearningQuestion\(skillId,phase,representation,difficulty=1,rng=Math\.random,conceptInstance=null\)\{[\s\S]*?\n\}\n\nexport function selectNextSkill"
replacement=r'''const READINESS_SOURCE_OVERRIDES={
  number20:['count10'],
  lengthCompare1:['compare10'],
  time1:['time-foundation'],
  shapes1:['shapesBasic']
};

export function readinessSourcesFor(skillId){
  const skillObj=SKILLS.find(s=>s.id===skillId);
  if(!skillObj) return [];
  if(skillObj.prerequisite?.length) return [...skillObj.prerequisite];
  return [...(READINESS_SOURCE_OVERRIDES[skillId]||[])];
}

export function readinessSourceFor(skillId,rng=Math.random){
  const sources=readinessSourcesFor(skillId);
  if(!sources.length) return null;
  return sources[Math.floor(rng()*sources.length)];
}

function relabelReadinessQuestion(q,targetSkillId,sourceSkillId,{support=false,rng=Math.random}={}){
  q.skillId=targetSkillId;
  q.taskKind=support?'readiness-support':'readiness-check';
  q.countsTowardEvidence=false;
  q.readinessSourceSkillId=sourceSkillId;
  q.conceptKey=`readiness:${sourceSkillId}`;
  q.feedbackTitle=support?'Birlikte temelini kurduk.':(q.feedbackTitle||'Başlangıç sorusunu tamamladın.');
  q.id=`${targetSkillId}:readiness:${sourceSkillId}:${Date.now()}:${Math.floor(rng()*1e6)}`;
  return q;
}

function generateTimeReadinessQuestion(difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){
  const source=sourceSkillId||'time-foundation';
  if(!support && rng()<.5){
    const starts=[0,5,10,15,20,25,30,35];
    const start=choice(starts,rng);
    const seq=[start,start+5,start+10], answer=start+15;
    const q=qBase('time1','see',`${seq.join(', ')}, … sıradaki sayı kaç?`,answer,numericChoices(answer,5,rng),{
      taskKind:'readiness-check',
      visual:{type:'sequence',items:seq.concat('?')},
      hint:'Saatte dakikaları okurken 5’er saymak işine yarar.',
      explain:`5’er sayınca sıradaki sayı ${answer}.`,
      feedbackTitle:'5’er saymayı kullandın.',
      countsTowardEvidence:false
    });
    return relabelReadinessQuestion(q,'time1',source,{support:false,rng});
  }
  const hour=randInt(1,12,rng), answer=`${hour}:00`;
  const q=qBase('time1','see',support?'Yelkovan 12’de. Akrebin gösterdiği tam saati bul.':'Yelkovan 12’deyken bu saat kaç?',answer,semanticChoices(answer,[`${hour}:30`,`${(hour%12)+1}:00`,`${hour}:15`],rng),{
    taskKind:support?'readiness-support':'readiness-check',
    visual:{type:'clock',hour,minute:0},
    hint:'Yelkovan 12’deyse dakika 00’dır. Sonra akrebin gösterdiği sayıyı oku.',
    explain:`Yelkovan 12’de ve akrep ${hour} üzerinde: saat ${answer}.`,
    feedbackTitle:support?'Tam saati birlikte ayırdık.':'Tam saati doğru okudun.',
    countsTowardEvidence:false
  });
  return relabelReadinessQuestion(q,'time1',source,{support,rng});
}

function generateReadinessQuestion(skillId,difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){
  if(skillId==='time1') return generateTimeReadinessQuestion(difficulty,rng,{support,sourceSkillId});

  const source=sourceSkillId||readinessSourceFor(skillId,rng);
  if(!source) throw new Error(`No authentic readiness source for ${skillId}`);
  if(!GENERATORS[source]) throw new Error(`No generator for readiness source ${source} of ${skillId}`);

  const rep=support?'build':'see';
  const concept=supportsLearningCycle(source)?createConceptInstance(source,1,rng):null;
  let q;
  try{
    q=generateQuestion(source,rep,1,rng,concept);
  }catch{
    q=generateQuestion(source,'see',1,rng,concept);
  }
  return relabelReadinessQuestion(q,skillId,source,{support,rng});
}

export function generateLearningQuestion(skillId,phase,representation,difficulty=1,rng=Math.random,conceptInstance=null,options={}){
  let q;
  if(phase==='readiness') q=generateReadinessQuestion(skillId,difficulty,rng,options);
  else q=generateQuestion(skillId,representation,difficulty,rng,conceptInstance);
  q.learningPhase=phase||null;
  if(phase==='readiness') q.countsTowardEvidence=false;
  if(phase==='retrieval') q.retentionProbe=true;
  q.id ||= `${skillId}:${phase||representation}:${Date.now()}:${Math.floor(rng()*1e6)}`;
  return q;
}

export function selectNextSkill'''
engine_new,n=re.subn(pattern,replacement,engine,count=1)
if n!=1:
    raise SystemExit(f'readiness block replacement count={n}')
engine=engine_new

old="    if(phase==='readiness') lc.readinessNeedsSupport=!correct;"
new="""    if(phase==='readiness'){
      if(question.taskKind==='readiness-support') lc.readinessSupportUsed=true;
      if(!correct) lc.readinessNeedsSupport=true;
      else if(question.taskKind==='readiness-support' || !lc.readinessSupportUsed) lc.readinessNeedsSupport=false;
    }"""
if old not in engine:
    raise SystemExit('readiness state anchor missing')
engine=engine.replace(old,new,1)

old="""    learningPhase:phase,taskKind:question.taskKind||null,conceptKey:question.conceptKey||null,
    responseKind:question.response?.kind||null,correct,usedHint,delayed:isDelayedReview,
    countsTowardEvidence"""
new="""    learningPhase:phase,taskKind:question.taskKind||null,conceptKey:question.conceptKey||null,
    readinessSourceSkillId:question.readinessSourceSkillId||null,
    responseKind:question.response?.kind||null,correct,usedHint,delayed:isDelayedReview,
    countsTowardEvidence"""
if old not in engine:
    raise SystemExit('history anchor missing')
engine=engine.replace(old,new,1)

pattern=r"  if\(!correct\)\{\n    const bridgeMap=\{build:'see',see:'build',symbol:'see',explain:'see',transfer:'build'\};\n    const readiness=phase==='readiness';\n    const alternative=readiness\?'see':\(bridgeMap\[question\.representation\]\|\|'see'\);\n    state\.reviewQueue\.push\(\{[\s\S]*?\n    \}\);\n  \}"
replacement="""  if(!correct){
    const bridgeMap={build:'see',see:'build',symbol:'see',explain:'see',transfer:'build'};
    const readiness=phase==='readiness';
    const alreadySupport=readiness && question.taskKind==='readiness-support';
    if(!alreadySupport){
      const alternative=readiness?'build':(bridgeMap[question.representation]||'see');
      state.reviewQueue.push({
        id:`review:${question.id}`,
        skillId:question.skillId,
        representation:alternative,
        phase:readiness?'readiness':'practice',
        readinessSourceSkillId:readiness?(question.readinessSourceSkillId||null):null,
        support:readiness,
        dueQuestion:readiness?sessionQuestionIndex:sessionQuestionIndex+3,
        dueAt:readiness?now:now+1000*60*3,
        stage:'same-session'
      });
    }
  }"""
engine_new,n=re.subn(pattern,replacement,engine,count=1)
if n!=1:
    raise SystemExit(f'review block replacement count={n}')
engine=engine_new
engine_path.write_text(engine,encoding='utf-8')

old="""  if(currentSelection.phase && supportsLearningCycle(skill.id)){
    currentQuestion=generateLearningQuestion(
      skill.id,currentSelection.phase,currentSelection.representation,
      ss.difficulty||1,Math.random,concept
    );
  } else {"""
new="""  if(currentSelection.phase && supportsLearningCycle(skill.id)){
    const learningOptions=currentSelection.phase==='readiness'?{
      support:currentSelection.kind==='bridge'||currentSelection.reviewItem?.support===true,
      sourceSkillId:currentSelection.reviewItem?.readinessSourceSkillId||null
    }:{};
    currentQuestion=generateLearningQuestion(
      skill.id,currentSelection.phase,currentSelection.representation,
      ss.difficulty||1,Math.random,concept,learningOptions
    );
  } else {"""
if old not in app:
    raise SystemExit('app learning question anchor missing')
app=app.replace(old,new,1)
app_path.write_text(app,encoding='utf-8')

test_path.write_text(r'''import assert from 'node:assert/strict';
import {
  LEARNING_PHASES, defaultState, ensureSkillState, supportsLearningCycle, skillsFor,
  buildLearningCyclePlan, createConceptInstance, generateLearningQuestion, applyAnswer,
  readinessSourcesFor
} from '../engine.mjs';

const makeSeeded=(seed=246813579)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const seeded=makeSeeded();

assert.deepEqual(LEARNING_PHASES,[
  'readiness','model','representation','symbol','reasoning','context','practice','retrieval'
]);
assert.equal(supportsLearningCycle('time1'),true);
assert.equal(supportsLearningCycle('time2'),false,'legacy P2 time stays outside the new contract until migrated');

const p1=skillsFor('grade1').filter(s=>supportsLearningCycle(s.id));
assert.equal(p1.length,22);
for(const [i,skill] of p1.entries()){
  const sources=readinessSourcesFor(skill.id);
  assert.ok(sources.length>=1,`${skill.id} must declare a readiness source`);
  assert.ok(sources.every(id=>id!==skill.id),`${skill.id} readiness must not test the target itself`);
  if(skill.prerequisite?.length){
    assert.ok(sources.every(id=>skill.prerequisite.includes(id)),`${skill.id} readiness should derive from declared prerequisites`);
  }
  const q=generateLearningQuestion(skill.id,'readiness','see',1,makeSeeded(1000+i),null);
  assert.equal(q.skillId,skill.id);
  assert.equal(q.learningPhase,'readiness');
  assert.equal(q.countsTowardEvidence,false);
  assert.equal(q.taskKind,'readiness-check');
  assert.ok(q.readinessSourceSkillId,`${skill.id} readiness provenance missing`);
  assert.notEqual(q.readinessSourceSkillId,skill.id,`${skill.id} must not use target content as readiness`);
  assert.ok(q.id,`${skill.id} readiness id missing`);
}

const state=defaultState();
const ss=ensureSkillState(state,'time1');
const plan=buildLearningCyclePlan(ss);
assert.equal(plan.length,8);
assert.deepEqual(plan.map(x=>x.phase),[
  'readiness','model','representation','symbol','reasoning','context','practice','practice'
]);
assert.equal(plan[0].countsTowardEvidence,false);
assert.equal(plan.at(-1).cycleFinal,true);

const readiness=generateLearningQuestion('time1','readiness','see',1,seeded,null);
assert.equal(readiness.learningPhase,'readiness');
assert.equal(readiness.countsTowardEvidence,false);
applyAnswer(state,readiness,{correct:true,now:1000,sessionQuestionIndex:1});
assert.equal(ss.totalAttempts,0,'readiness must not inflate target-skill mastery evidence');
assert.equal(ss.learningCycle.phases.readiness.attempts,1);

const bridgeState=defaultState();
const bridgeSS=ensureSkillState(bridgeState,'numberBonds10');
const first=generateLearningQuestion('numberBonds10','readiness','see',1,makeSeeded(77),null);
assert.equal(first.readinessSourceSkillId,'number20');
applyAnswer(bridgeState,first,{correct:false,now:5000,sessionQuestionIndex:1});
assert.equal(bridgeSS.totalAttempts,0,'failed readiness still must not alter target mastery');
const bridge=bridgeState.reviewQueue.find(x=>x.skillId==='numberBonds10'&&x.stage==='same-session');
assert.ok(bridge,'failed readiness must schedule support');
assert.equal(bridge.support,true);
assert.equal(bridge.dueQuestion,1,'readiness support must be eligible immediately on the next screen');
assert.equal(bridge.representation,'build','readiness support should prefer a concrete representation');
assert.equal(bridge.readinessSourceSkillId,'number20');
const support=generateLearningQuestion('numberBonds10','readiness',bridge.representation,1,makeSeeded(78),null,{
  support:true,sourceSkillId:bridge.readinessSourceSkillId
});
assert.equal(support.taskKind,'readiness-support');
assert.equal(support.countsTowardEvidence,false);
assert.equal(support.readinessSourceSkillId,'number20');
assert.equal(support.response.kind,'manipulative','P1 prerequisite support should use the concrete build task when available');
const queueBefore=bridgeState.reviewQueue.length;
applyAnswer(bridgeState,support,{correct:false,now:6000,sessionQuestionIndex:2});
assert.equal(bridgeState.reviewQueue.length,queueBefore,'a failed readiness scaffold must not recurse indefinitely');
assert.equal(bridgeSS.learningCycle.readinessSupportUsed,true);

let now=2000;
for(const item of plan.slice(1)){
  const concept=createConceptInstance('time1',1,seeded);
  const q=generateLearningQuestion('time1',item.phase,item.representation,1,seeded,concept);
  q.cycleFinal=!!item.cycleFinal;
  applyAnswer(state,q,{correct:true,now:now+=1000,sessionQuestionIndex:2});
}
assert.ok(ss.learningCycle.firstCycleCompletedAt>0);
assert.equal(ss.learningCycle.status,'consolidating');
const retention=state.reviewQueue.find(x=>x.skillId==='time1'&&x.stage==='next-day');
assert.ok(retention,'full learning cycle must schedule delayed retrieval');
assert.equal(retention.phase,'retrieval');
assert.ok(retention.dueAt>ss.learningCycle.firstCycleCompletedAt);

const rq=generateLearningQuestion('time1','retrieval',retention.representation,1,seeded,createConceptInstance('time1',1,seeded));
applyAnswer(state,rq,{correct:true,isDelayedReview:true,now:retention.dueAt+1,sessionQuestionIndex:1});
assert.equal(ss.learningCycle.retrievalAttempts,1);
assert.equal(ss.learningCycle.retrievalSuccesses,1);
assert.equal(ss.delayedSuccesses,1);

const reinforcement=buildLearningCyclePlan(ss);
assert.equal(reinforcement.length,4);
assert.ok(reinforcement.every(x=>x.phase==='practice'));
assert.equal(reinforcement.at(-1).cycleFinal,true);

console.log('learning-cycle tests: PASS (22 P1 prerequisite readiness contracts + immediate support)');
''',encoding='utf-8')

pkg=json.loads(package_path.read_text(encoding='utf-8'))
pkg['version']='1.3.1'
package_path.write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sw=sw_path.read_text(encoding='utf-8')
sw=re.sub(r"const CACHE='[^']+';","const CACHE='saymera-v1-3-1-readiness';",sw,count=1)
sw_path.write_text(sw,encoding='utf-8')

doc=doc_path.read_text(encoding='utf-8')
section='''\n\n## v1.3.1 — Gerçek ön-bilgi kontratı\n\n`readiness`, hedef becerinin kolaylaştırılmış bir kopyası değildir. Her P1 becerisi için kaynak beceri açıkça belirlenir: varsa skill graph üzerindeki prerequisite; kök becerilerde daha temel bir önkoşul. Readiness sonucu hedef becerinin mastery/evidence skoruna yazılmaz.\n\nÖn-bilgi yanlışı olduğunda SAYMERA normal öğrenme akışına hemen geçmez. Aynı önkoşulun daha somut `build` görevi bir sonraki ekrana adaptif destek olarak eklenir. Bu destek de hedef mastery skoruna yazılmaz ve başarısız olursa sonsuz destek döngüsü oluşturmaz.\n\nP1 kök eşlemeleri: `number20 ← count10`, `lengthCompare1 ← compare10`, `shapes1 ← shapesBasic`, `time1 ← 5’er sayma / tam saat temeli`. Diğer P1 becerilerinin readiness kaynakları kendi prerequisite alanlarından türetilir.\n'''
if '## v1.3.1 — Gerçek ön-bilgi kontratı' not in doc:
    doc+=section
doc_path.write_text(doc,encoding='utf-8')

print('v1.3.1 readiness migration staged')
