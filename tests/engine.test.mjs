import assert from 'node:assert/strict';
import {
  defaultState, ensureSkillState, generateQuestion, createConceptInstance, applyAnswer,
  masteryPercent, computeStable, selectNextSkill, consumeReview,
  profileSummary, skillsFor, REPRESENTATIONS, SKILLS, prerequisitesReady
} from '../engine.mjs';

const seeded = (()=>{let x=123456789; return ()=>((x=(x*1664525+1013904223)>>>0)/2**32);})();
const state=defaultState();
assert.equal(state.profile,'grade1');

const P1_SKILLS=[
  'number20','numberBonds10','make10','add20','addMany1','sub20','equality','word1','number100','compareOrder100','ordinal10',
  'numberPattern1','addSub100','multiply40','divide20g1','money1','lengthCompare1','lengthMeasure1','time1','shapes1','shapePattern1','data1'
];
assert.deepEqual(skillsFor('grade1').map(s=>s.id),P1_SKILLS,'Primary 1 coverage graph changed unexpectedly');

const fresh=defaultState();
const freshPick=selectNextSkill(fresh,{questionIndex:0,recentSkillIds:[]},Date.now(),()=>0.5);
assert.equal(freshPick.skill.id,'number20','fresh grade1 profile should begin with foundational number sense');

function assertQuestionContract(q,skillId,rep){
  assert.equal(q.skillId,skillId);
  assert.equal(q.representation,rep);
  assert.ok(q.prompt && q.hint!==undefined && q.explain!==undefined);
  assert.ok(q.effort>0);
  assert.ok(q.response?.kind,`${skillId}/${rep} must declare a response kind`);
  if(q.response.kind==='choice'){
    assert.equal(q.choices.length,4,`${skillId}/${rep} choice tasks must have 4 choices`);
    assert.equal(new Set(q.choices).size,4,`${skillId}/${rep} choices must be unique`);
    assert.ok(q.choices.includes(String(q.answer)),`${skillId}/${rep} answer must be a choice`);
  } else if(q.response.kind==='visual-choice'){
    assert.ok(q.response.options.length>=3,`${skillId}/${rep} visual choice needs at least 3 models`);
    const vals=q.response.options.map(x=>String(x.value));
    assert.equal(new Set(vals).size,vals.length,`${skillId}/${rep} visual option values must be unique`);
    assert.ok(vals.includes(String(q.answer)),`${skillId}/${rep} correct visual model must be present`);
  } else if(q.response.kind==='number-input'){
    assert.match(String(q.answer),/^\d+$/,`${skillId}/${rep} numeric entry must have numeric answer`);
  } else if(q.response.kind==='manipulative'){
    assert.equal(String(q.response.expectedValue),String(q.answer),`${skillId}/${rep} manipulative expected value must match answer`);
    assert.ok(q.response.interaction,`${skillId}/${rep} manipulative must name an interaction`);
  } else assert.fail(`unsupported response kind ${q.response.kind}`);
}

// Global contract: every skill still renders every evidence window.
for(const skill of SKILLS){
  for(const rep of REPRESENTATIONS){
    for(let i=0;i<40;i++) assertQuestionContract(generateQuestion(skill.id,rep,1+(i%4),seeded),skill.id,rep);
  }
}

// P1 quality gate: the five windows are five different cognitive actions, not relabelled quizzes.
const expectedKinds={build:'manipulative-build',see:'visual-discrimination',symbol:'symbol-entry',explain:'reasoning-choice',transfer:'context-transfer'};
for(const skillId of P1_SKILLS){
  const concept=createConceptInstance(skillId,2,seeded);
  assert.equal(concept.skillId,skillId);
  assert.notDeepEqual(concept.anchor,concept.symbol,`${skillId}: symbolic evidence must use a fresh instance`);
  assert.notDeepEqual(concept.anchor,concept.transfer,`${skillId}: transfer must use a fresh instance`);
  const tasks=REPRESENTATIONS.map(rep=>generateQuestion(skillId,rep,2,seeded,concept));
  assert.equal(new Set(tasks.map(q=>q.taskKind)).size,5,`${skillId} must use five distinct cognitive task families`);
  assert.ok(new Set(tasks.map(q=>q.response.kind)).size>=3,`${skillId} must use at least three response families`);
  for(const q of tasks) assert.equal(q.taskKind,expectedKinds[q.representation],`${skillId}/${q.representation} task family mismatch`);
}

// Singapore P1 mental-strategy coverage: no single 'make ten for everything' shortcut.
const addStrategies=new Set(), subStrategies=new Set(), problemTypes=new Set(), patternSteps=new Set();
for(let i=0;i<700;i++){
  const add=createConceptInstance('add20',2,seeded); addStrategies.add(add.anchor.strategy);
  const sub=createConceptInstance('sub20',2,seeded); subStrategies.add(sub.anchor.strategy);
  const word=createConceptInstance('word1',2,seeded); problemTypes.add(word.anchor.type);
  const pat=createConceptInstance('numberPattern1',2,seeded); patternSteps.add(pat.anchor.step);
}
for(const strategy of ['countOn','makeTen','double','nearDouble']) assert.ok(addStrategies.has(strategy),`addition strategy missing: ${strategy}`);
for(const strategy of ['countBack','subtractFrom10','inverse']) assert.ok(subStrategies.has(strategy),`subtraction strategy missing: ${strategy}`);
for(const type of ['join-result','join-change','separate-result','part-missing','compare-difference']) assert.ok(problemTypes.has(type),`word-problem structure missing: ${type}`);
for(const step of [1,-1,2,-2,5,-5,10,-10]) assert.ok(patternSteps.has(step),`number-sequence pattern step missing: ${step}`);
const multi=createConceptInstance('addMany1',2,seeded); const mq=generateQuestion('addMany1','symbol',2,seeded,multi); assert.match(mq.prompt,/\+.*\+/,'P1 must include addition of more than two one-digit numbers');


// Current Singapore P1 coverage guards added in v1.2.
const seenNumber100=new Set(), seenMoneyUnits=new Set(), seenMinutes=new Set(), seenDurations=new Set(), seenShapePieces=new Set();
for(let i=0;i<1200;i++){
  const n=createConceptInstance('number100',2,seeded); seenNumber100.add(n.anchor.n); seenNumber100.add(n.symbol.n); seenNumber100.add(n.transfer.n);
  const m=createConceptInstance('money1',2,seeded); seenMoneyUnits.add(m.anchor.unit); seenMoneyUnits.add(m.symbol.unit); seenMoneyUnits.add(m.transfer.unit);
  const t=createConceptInstance('time1',2,seeded); seenMinutes.add(t.anchor.minute); seenDurations.add(t.transfer.duration);
  const sh=createConceptInstance('shapePattern1',2,seeded); sh.anchor.pieces.forEach(x=>seenShapePieces.add(x));
}
assert.ok(seenNumber100.has(100),'numbers up to 100 must include the endpoint 100');
assert.deepEqual([...seenMoneyUnits].sort(),['TL','kr'],'money localisation must exercise both lira and kuruş without mixing units inside a task');
for(const minute of [0,5,10,15,20,25,30,35,40,45,50,55]) assert.ok(seenMinutes.has(minute),`5-minute clock coverage missing :${String(minute).padStart(2,'0')}`);
assert.ok(seenDurations.has(30) && seenDurations.has(60),'time transfer must include half-hour and one-hour durations');
for(const piece of ['square','rect','triangle','halfCircle','quarterCircle']) assert.ok(seenShapePieces.has(piece),`shape composition missing ${piece}`);

// Current P1 2D-shape set must directly exercise circle fractions, not only use them as composition pieces.
const seenDirectShapes=new Set();
for(let i=0;i<900;i++){
  const s=createConceptInstance('shapes1',2,seeded);
  for(const z of [s.anchor,s.symbol,s.transfer]) seenDirectShapes.add(z.id);
}
for(const id of ['triangle','square','rect','circle','halfCircle','quarterCircle'])
  assert.ok(seenDirectShapes.has(id),`direct P1 shape recognition missing ${id}`);
for(const id of ['halfCircle','quarterCircle']){
  let concept=null;
  for(let i=0;i<2000 && !concept;i++){
    const candidate=createConceptInstance('shapes1',2,seeded);
    if(candidate.anchor.id===id) concept=candidate;
  }
  assert.ok(concept,`could not generate ${id} for direct shape property audit`);
  const build=generateQuestion('shapes1','build',2,seeded,concept);
  assert.equal(build.response.interaction,'shape-properties');
  assert.match(build.explain,/eğri sınır/);
}

const lengthConcept=createConceptInstance('lengthMeasure1',2,seeded);
const lengthBuild=generateQuestion('lengthMeasure1','build',2,seeded,lengthConcept);
assert.equal(lengthBuild.response.interaction,'cm-ruler');
assert.equal(lengthBuild.visual.type,'cm-ruler-interactive');
assert.match(lengthBuild.prompt,/cm/);

const timeConcept=createConceptInstance('time1',2,seeded);
const timeBuild=generateQuestion('time1','build',2,seeded,timeConcept);
assert.equal(timeBuild.response.interaction,'clock-set');
assert.equal(Number(timeBuild.answer.split('|')[1])%5,0,'clock manipulative must use five-minute increments');
const timeTransfer=generateQuestion('time1','transfer',2,seeded,timeConcept);
assert.match(timeTransfer.prompt,/ÖÖ|ÖS/,'time transfer must contextualise a.m./p.m. period');

const shapeConcept=createConceptInstance('shapePattern1',2,seeded);
const shapeBuild=generateQuestion('shapePattern1','build',2,seeded,shapeConcept);
assert.equal(shapeBuild.response.interaction,'shape-compose');
assert.equal(shapeBuild.visual.type,'shape-compose-interactive');
const shapeTransfer=generateQuestion('shapePattern1','transfer',2,seeded,shapeConcept);
assert.equal(shapeTransfer.response.kind,'visual-choice');
assert.ok(shapeTransfer.response.options.every(x=>x.visual?.type==='dot-grid-figure'),'shape transfer must copy a composed figure on a grid');

const divConcept=createConceptInstance('divide20g1',2,seeded);
const divSymbol=generateQuestion('divide20g1','symbol',2,seeded,divConcept);
assert.ok(!divSymbol.prompt.includes('÷'),'P1 division concept should be symbolised via missing-factor multiplication, not a forced division sign');
assert.match(divSymbol.prompt,/×/);

// Number bonds should explicitly support addition/subtraction fact-family reasoning.
const bond=createConceptInstance('numberBonds10',2,seeded);
const bq=generateQuestion('numberBonds10','symbol',2,seeded,bond);
assert.match(bq.prompt,/\+ □ =/);
const family=createConceptInstance('equality',2,seeded);
const fq=generateQuestion('equality','transfer',2,seeded,family);
assert.match(fq.prompt,/−/);
assert.equal(fq.conceptKey,'equality-and-fact-family');

// 2-digit algorithms keep the actual regrouping property; difficulty flags must never falsify the numbers.
for(let i=0;i<100;i++){
  const c=createConceptInstance('addSub100',4,seeded);
  const q=generateQuestion('addSub100','explain',4,seeded,c);
  if(c.anchor.renaming) assert.match(q.explain,/yeniden grupl/i);
}

// Grade 2 geometry reference gate: each evidence window must require a distinct cognitive action.
const shapes2Concept=createConceptInstance('shapes2',2,seeded);
assert.equal(shapes2Concept.skillId,'shapes2');
const shapes2Tasks=REPRESENTATIONS.map(rep=>generateQuestion('shapes2',rep,2,seeded,shapes2Concept));
assert.deepEqual(shapes2Tasks.map(q=>q.taskKind),['manipulative-build','visual-discrimination','symbol-entry','reasoning-choice','context-transfer']);
assert.equal(shapes2Tasks[0].response.interaction,'solid-properties');
assert.equal(shapes2Tasks[0].visual.type,'solid-property-builder');
assert.equal(shapes2Tasks[1].response.kind,'visual-choice');
assert.equal(shapes2Tasks[3].visual.type,'solid-pair');
assert.match(shapes2Tasks[3].answer,/Yönü değişse de biçimsel özellikleri değişmez/);
assert.equal(shapes2Tasks[4].visual.type,'solid-scene');
assert.equal(new Set(shapes2Tasks.map(q=>q.taskKind)).size,5);

let ss=ensureSkillState(state,'add20');
const q=generateQuestion('add20','symbol',1,seeded);
applyAnswer(state,q,{correct:true,sessionQuestionIndex:1,now:1000});
assert.equal(ss.totalAttempts,1);
assert.equal(ss.totalCorrect,1);
assert.ok(ss.evidence.symbol.score>0);
assert.equal(state.history.at(-1).taskKind,'symbol-entry');
assert.equal(state.history.at(-1).responseKind,'number-input');
assert.equal(state.history.at(-1).conceptKey,'addition-strategy-within-20');
assert.ok(masteryPercent(ss)>0);

const wrong=generateQuestion('add20','symbol',1,seeded);
applyAnswer(state,wrong,{correct:false,sessionQuestionIndex:2,now:2000});
assert.ok(state.reviewQueue.some(x=>x.skillId==='add20' && x.dueQuestion===5));
assert.ok(state.reviewQueue.some(x=>x.skillId==='add20' && x.representation==='see'),'symbol errors should bridge to visual evidence');
const session={questionIndex:5,recentSkillIds:[]};
const next=selectNextSkill(state,session,2500,seeded);
assert.equal(next.skill.id,'add20');
assert.ok(next.reviewItem);
consumeReview(state,next.reviewItem);

ss=ensureSkillState(state,'equality');
for(const rep of ['build','see','symbol']) ss.evidence[rep]={score:.9,attempts:3,correct:3,lastSeen:1};
ss.delayedSuccesses=1;
assert.equal(computeStable(ss),true);

// Prerequisite breadth: make-ten should wait for number bonds, not a single lucky modality.
const preState=defaultState();
const bonds=ensureSkillState(preState,'numberBonds10');
bonds.evidence.build={score:1,attempts:8,correct:8,lastSeen:1};
assert.equal(prerequisitesReady(preState,SKILLS.find(s=>s.id==='make10')),false);
bonds.evidence.see={score:.8,attempts:4,correct:4,lastSeen:1};
assert.equal(prerequisitesReady(preState,SKILLS.find(s=>s.id==='make10')),true);

// Difficulty needs a sustained window.
const diffState=defaultState();
let ds=ensureSkillState(diffState,'number20');
for(let i=0;i<4;i++) applyAnswer(diffState,generateQuestion('number20','symbol',1,seeded),{correct:true,sessionQuestionIndex:i,now:5000+i});
assert.equal(ds.difficulty,1);
for(let i=4;i<7;i++) applyAnswer(diffState,generateQuestion('number20','symbol',1,seeded),{correct:true,sessionQuestionIndex:i,now:5000+i});
assert.equal(ds.difficulty,2);
assert.ok(ds.difficulty<=2);

const summary=profileSummary(state);
assert.equal(summary.total,P1_SKILLS.length);
assert.ok(summary.avg>=0 && summary.avg<=100);

console.log(`engine tests: PASS (${SKILLS.length*REPRESENTATIONS.length*40} generated-task cases; ${P1_SKILLS.length} P1 five-window quality gates; strategy/problem coverage)`);
