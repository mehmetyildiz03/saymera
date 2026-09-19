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
const P2_A1_SKILLS=['number1000','compareOrder1000','numberPattern1000','addSub1000'];
const P2_A2_SKILLS=['oddEven1000','wordAddSub2'];
const P2_MULT_DIV_SKILLS=['times23510','divisionTables2','multDivFamilies2'];
const P2_FRACTION_SKILLS=['fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'];
const P2_MEASURE_TIME_MONEY_SKILLS=['moneyP2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2'];
const P2_GEOMETRY_DATA_SKILLS=['shapePatterns2','solids2','pictureGraphScale2'];
const P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS,...P2_MULT_DIV_SKILLS,...P2_FRACTION_SKILLS,...P2_MEASURE_TIME_MONEY_SKILLS,...P2_GEOMETRY_DATA_SKILLS];
assert.deepEqual(skillsFor('grade2').filter(s=>P2_REFERENCE_SKILLS.includes(s.id)).map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2','moneyP2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','shapePatterns2','solids2','pictureGraphScale2'],'Primary 2 reference graph changed unexpectedly');
for(const legacy of ['place100','add100','sub100','numberPattern2','word2','multiply5','divide20','fraction','lengthCm','time2','moneyTL','shapes2','data2']) assert.ok(!skillsFor('grade2').some(s=>s.id===legacy),`legacy P2 skill still visible: ${legacy}`);


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
    const expectedChoices=skillId==='oddEven1000'&&rep==='symbol'?2:4;
    assert.equal(q.choices.length,expectedChoices,`${skillId}/${rep} choice tasks must have ${expectedChoices} choices`);
    assert.equal(new Set(q.choices).size,expectedChoices,`${skillId}/${rep} choices must be unique`);
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

// Singapore P2-A1 quality gate: new foundational skills use the same five genuine cognitive actions.
for(const skillId of P2_REFERENCE_SKILLS){
  const concept=createConceptInstance(skillId,2,seeded);
  assert.equal(concept.skillId,skillId);
  const tasks=REPRESENTATIONS.map(rep=>generateQuestion(skillId,rep,2,seeded,concept));
  assert.equal(new Set(tasks.map(q=>q.taskKind)).size,5,`${skillId} must use five distinct cognitive task families`);
  assert.ok(new Set(tasks.map(q=>q.response.kind)).size>=3,`${skillId} must use at least three response families`);
  for(const q of tasks) assert.equal(q.taskKind,expectedKinds[q.representation],`${skillId}/${q.representation} P2 task family mismatch`);
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
assert.equal(shapeTransfer.response.kind,'manipulative');
assert.equal(shapeTransfer.response.interaction,'square-grid-copy');
assert.equal(shapeTransfer.visual.type,'square-grid-copy-interactive');
assert.match(String(shapeTransfer.answer),/\d,\d\|/,'P1 grid-copy target must contain multiple cells');

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

// Singapore P2-A1 scope guards.
const seen1000=new Set(), seenP2Steps=new Set(), seenP2Modes=new Set();
for(let i=0;i<1200;i++){
  const n=createConceptInstance('number1000',2,seeded); seen1000.add(n.anchor.n); seen1000.add(n.symbol.n); seen1000.add(n.transfer.n);
  const p=createConceptInstance('numberPattern1000',2,seeded); seenP2Steps.add(p.anchor.step);
  const a1=createConceptInstance('addSub1000',1,seeded); seenP2Modes.add(a1.anchor.mode);
  const a4=createConceptInstance('addSub1000',4,seeded); seenP2Modes.add(a4.anchor.mode);
}
assert.ok(seen1000.has(1000),'P2 whole numbers must include endpoint 1000');
for(const step of [1,-1,10,-10,100,-100]) assert.ok(seenP2Steps.has(step),`P2 number pattern missing step ${step}`);
assert.ok(seenP2Modes.has('mental')&&seenP2Modes.has('regroup'),'P2 add/sub must cover mental place-value work and regrouping');
const seenParity=new Set(), seenWordPlans=new Set();
for(let i=0;i<400;i++){
  const o=createConceptInstance('oddEven1000',2,seeded); seenParity.add(o.anchor.parity);
  const w=createConceptInstance('wordAddSub2',2,seeded); seenWordPlans.add(`${w.anchor.op1}|${w.anchor.op2}`);
}
assert.deepEqual([...seenParity].sort(),['Tek','Çift'].sort(),'P2 odd/even must cover both classes');
for(const plan of ['+|−','−|+','+|+','−|−']) assert.ok(seenWordPlans.has(plan),`P2 two-step problem plan missing ${plan}`);
const oddBuild=generateQuestion('oddEven1000','build',2,seeded,createConceptInstance('oddEven1000',2,seeded));
assert.equal(oddBuild.response.interaction,'parity-pair');
const wordBuild=generateQuestion('wordAddSub2','build',2,seeded,createConceptInstance('wordAddSub2',2,seeded));
assert.equal(wordBuild.response.interaction,'two-step-plan');

const p2NumberBuild=generateQuestion('number1000','build',2,seeded,createConceptInstance('number1000',2,seeded));
assert.equal(p2NumberBuild.response.interaction,'base1000-build');
assert.equal(p2NumberBuild.visual.type,'base1000-build-interactive');
const p2AddBuild=generateQuestion('addSub1000','build',4,seeded,createConceptInstance('addSub1000',4,seeded));
assert.equal(p2AddBuild.response.interaction,'base1000-build');
assert.equal(p2AddBuild.visual.type,'base1000-operation-build');




// Singapore P2 multiplication/division progression: table structure precedes ÷ notation, then inverse fact families.
const seenP2TableFactors=new Set();
for(let i=0;i<700;i++){
  const t=createConceptInstance('times23510',4,seeded);
  seenP2TableFactors.add(t.anchor.factor); seenP2TableFactors.add(t.symbol.factor); seenP2TableFactors.add(t.transfer.factor);
}
assert.deepEqual([...seenP2TableFactors].sort((a,b)=>a-b),[2,3,4,5,10],'P2 multiplication must cover tables 2,3,4,5,10');
const tableConcept=createConceptInstance('times23510',3,seeded);
const tableBuild=generateQuestion('times23510','build',3,seeded,tableConcept);
assert.equal(tableBuild.response.interaction,'pattern-step','P2 table construction should build the skip-count pattern without excessive tapping');
const divisionConcept=createConceptInstance('divisionTables2',3,seeded);
const divisionBuild=generateQuestion('divisionTables2','build',3,seeded,divisionConcept);
assert.ok(!divisionBuild.prompt.includes('÷'),'division model must be built before ÷ notation is assumed');
const divisionSee=generateQuestion('divisionTables2','see',3,seeded,divisionConcept);
assert.match(divisionSee.teachingNote,/÷/,'÷ notation must be explicitly taught in the representation phase');
const divisionSymbol=generateQuestion('divisionTables2','symbol',3,seeded,divisionConcept);
assert.match(divisionSymbol.prompt,/÷/,'symbol phase should assess ÷ only after it has been taught');
const familyConcept=createConceptInstance('multDivFamilies2',3,seeded);
const familySee=generateQuestion('multDivFamilies2','see',3,seeded,familyConcept);
assert.equal(familySee.response.kind,'visual-choice');
assert.match(familySee.explain,/×/); assert.match(familySee.explain,/÷/);
const familyTransfer=generateQuestion('multDivFamilies2','transfer',3,seeded,familyConcept);
assert.match(familyTransfer.prompt,/eşit dağıtırsan/);


// Singapore P2 fraction progression: meaning precedes notation; notation precedes comparison and like-fraction operations.
const meaningConcept=createConceptInstance('fractionMeaning2',2,seeded);
const meaningSymbol=generateQuestion('fractionMeaning2','symbol',2,seeded,meaningConcept);
assert.equal(meaningSymbol.response.kind,'number-input');
assert.ok(!meaningSymbol.prompt.includes('/'),'fraction meaning must not assume symbolic notation before it is taught');
const notationConcept=createConceptInstance('fractionNotation2',2,seeded);
const notationSee=generateQuestion('fractionNotation2','see',2,seeded,notationConcept);
assert.match(notationSee.teachingNote,/\d+\/\d+/,'fraction notation must be explicitly taught before symbolic assessment');
const notationSymbol=generateQuestion('fractionNotation2','symbol',2,seeded,notationConcept);
assert.match(notationSymbol.answer,/^\d+\/\d+$/);
const seenFractionDenoms=new Set(), seenCompareKinds=new Set();
for(let i=0;i<1200;i++){
  const n=createConceptInstance('fractionNotation2',4,seeded); seenFractionDenoms.add(n.anchor.denom);
  const c=createConceptInstance('fractionCompare2',4,seeded); seenCompareKinds.add(c.anchor.kind); assert.ok(c.anchor.left.denom<=12&&c.anchor.right.denom<=12);
  const a=createConceptInstance('fractionAddSub2',4,seeded); assert.ok(a.anchor.denom<=12); assert.ok(a.anchor.result<=a.anchor.denom); assert.equal(a.anchor.denom,a.anchor.denom);
}
assert.ok(seenFractionDenoms.has(12),'P2 fraction notation must reach denominators up to 12');
assert.deepEqual([...seenCompareKinds].sort(),['like','unit'],'P2 comparison must include unit and like fractions');
const fracBuild=generateQuestion('fractionNotation2','build',2,seeded,notationConcept);
assert.equal(fracBuild.response.interaction,'fraction-shade');
const compareBuild=generateQuestion('fractionCompare2','build',2,seeded,createConceptInstance('fractionCompare2',2,seeded));
assert.equal(compareBuild.response.interaction,'fraction-pair-build');
const addSubBuild=generateQuestion('fractionAddSub2','build',2,seeded,createConceptInstance('fractionAddSub2',2,seeded));
assert.equal(addSubBuild.response.interaction,'fraction-operation-build');


// Singapore P2 current (Oct 2025) measurement/time/money guards.
const lengthBuild2=generateQuestion('lengthMetre2','build',2,seeded,createConceptInstance('lengthMetre2',2,seeded));
assert.equal(lengthBuild2.response.interaction,'measure-make');
assert.equal(lengthBuild2.response.unit,'m');
const massUnits=new Set();
for(let i=0;i<300;i++) massUnits.add(createConceptInstance('massMetric2',2,seeded).anchor.unit);
assert.deepEqual([...massUnits].sort(),['g','kg'],'P2 mass must cover grams and kilograms without forcing conversion between them');
const massBuild2=generateQuestion('massMetric2','build',2,seeded,createConceptInstance('massMetric2',2,seeded));
assert.equal(massBuild2.response.interaction,'measure-make');
const volumeBuild2=generateQuestion('volumeLitre2','build',2,seeded,createConceptInstance('volumeLitre2',2,seeded));
assert.equal(volumeBuild2.response.unit,'L');
assert.equal(volumeBuild2.response.interaction,'measure-make');

const seenP2Minutes=new Set();
for(let i=0;i<500;i++) seenP2Minutes.add(createConceptInstance('timeMinute2',2,seeded).anchor.minute);
assert.ok([...seenP2Minutes].some(m=>m%5!==0),'P2 current syllabus must progress from P1 five-minute time to telling time to the minute');
const minuteConcept=createConceptInstance('timeMinute2',2,seeded);
const minuteBuild=generateQuestion('timeMinute2','build',2,seeded,minuteConcept);
assert.equal(minuteBuild.response.interaction,'clock-minute-set');
const minuteSee=generateQuestion('timeMinute2','see',2,seeded,minuteConcept);
assert.match(minuteSee.teachingNote,/1 dakikalık/);
const durationConcept=createConceptInstance('timeDuration2',2,seeded);
const durationSee=generateQuestion('timeDuration2','see',2,seeded,durationConcept);
assert.match(durationSee.teachingNote,/1 saat = 60 dakika/);
const durationSymbol=generateQuestion('timeDuration2','symbol',2,seeded,durationConcept);
assert.equal(durationSymbol.response.kind,'number-input');
assert.equal(Number(durationSymbol.answer),durationConcept.symbol.totalMinutes);
const durationTransfer=generateQuestion('timeDuration2','transfer',2,seeded,durationConcept);
assert.match(durationTransfer.answer,/sa .*dk/,'P2 duration transfer must convert minutes back to hours+minutes');

const moneyConcept2=createConceptInstance('moneyP2',2,seeded);
const moneyBuild2=generateQuestion('moneyP2','build',2,seeded,moneyConcept2);
assert.equal(moneyBuild2.response.interaction,'money-make');
assert.equal(moneyBuild2.response.unit,'kr');
assert.ok(!moneyBuild2.prompt.includes(','),'money model phase must not assume decimal TL notation before it is introduced');
const moneySee2=generateQuestion('moneyP2','see',2,seeded,moneyConcept2);
assert.match(moneySee2.teachingNote,/100 kuruş = 1,00 TL/);
const moneySymbol2=generateQuestion('moneyP2','symbol',2,seeded,moneyConcept2);
assert.equal(Number(moneySymbol2.answer),moneyConcept2.symbol.cents);
const moneyTransfer2=generateQuestion('moneyP2','transfer',2,seeded,moneyConcept2);
assert.match(moneyTransfer2.answer,/^\d+,\d{2} TL$/,'Turkish localisation must use TL/kuruş decimal comma while preserving Singapore money structure');



// Singapore P2-D current geometry/data guards.
const patternAttrs=new Set(), patternAttrCounts=new Set();
for(let i=0;i<500;i++){
  const p=createConceptInstance('shapePatterns2',2,seeded); p.anchor.attrs.forEach(a=>patternAttrs.add(a)); patternAttrCounts.add(p.anchor.attrs.length);
}
for(const attr of ['size','shape','colour','orientation']) assert.ok(patternAttrs.has(attr),`P2 shape patterns missing ${attr}`);
assert.ok(patternAttrCounts.has(1)&&patternAttrCounts.has(2),'P2 shape patterns must use one or two attributes');
const p2Pattern=createConceptInstance('shapePatterns2',2,seeded);
assert.equal(generateQuestion('shapePatterns2','build',2,seeded,p2Pattern).response.interaction,'p2-shape-pattern');
assert.match(generateQuestion('shapePatterns2','explain',2,seeded,p2Pattern).explain,/değiş|tekrar/i);

const seenSolids=new Set();
for(let i=0;i<500;i++){
  const s=createConceptInstance('solids2',2,seeded); seenSolids.add(s.anchor.id); seenSolids.add(s.symbol.id); seenSolids.add(s.transfer.id);
}
assert.deepEqual([...seenSolids].sort(),['cone','cube','cuboid','cylinder','sphere'].sort(),'P2 solids must cover cube/cuboid/cone/cylinder/sphere');
const coneConcept={version:2,skillId:'solids2',conceptKey:'p2-solid-identify-classify',difficulty:2,anchor:{id:'cone',name:'Koni',kind:'cone',classKey:'flat-curved',property:'1 dairesel düz yüzü, 1 eğri yüzeyi ve 1 köşesi vardır',scene:'cone',roll:'Eğri yüzeyi üzerinde yuvarlanabilir'},symbol:{id:'cube',name:'Küp',kind:'cube',classKey:'flat-only',property:'6 kare düz yüzü, 12 kenarı ve 8 köşesi vardır',scene:'dice',roll:'Kolay yuvarlanmaz'},transfer:{id:'sphere',name:'Küre',kind:'sphere',classKey:'curved-only',property:'Düz yüzü, kenarı ve köşesi yoktur; eğri yüzeyi vardır',scene:'ball',roll:'Her yönde yuvarlanabilir'}};
const coneBuild=generateQuestion('solids2','build',2,seeded,coneConcept);
assert.equal(coneBuild.response.interaction,'solid-classify');
assert.equal(coneBuild.answer,'flat-curved');
const coneSee=generateQuestion('solids2','see',2,seeded,coneConcept);
assert.equal(coneSee.response.kind,'visual-choice');

const graphScales=new Set();
for(let i=0;i<400;i++) graphScales.add(createConceptInstance('pictureGraphScale2',2,seeded).anchor.scale);
assert.ok(graphScales.has(2)&&graphScales.has(5),'P2 scaled picture graphs should exercise non-1 scales');
const graphConcept=createConceptInstance('pictureGraphScale2',2,seeded);
const graphBuild=generateQuestion('pictureGraphScale2','build',2,seeded,graphConcept);
assert.equal(graphBuild.response.interaction,'scaled-pictograph-row');
assert.ok(graphBuild.visual.scale>1,'P2 graph build must genuinely use a scale');
const graphSymbol=generateQuestion('pictureGraphScale2','symbol',2,seeded,graphConcept);
assert.equal(Number(graphSymbol.answer),graphConcept.symbol.icons[2]*graphConcept.symbol.scale);
const graphTransfer=generateQuestion('pictureGraphScale2','transfer',2,seeded,graphConcept);
assert.equal(graphTransfer.response.kind,'number-input');
assert.ok(!JSON.stringify([graphBuild,graphSymbol,graphTransfer]).includes('bar-chart'),'P2 data core must not silently regress to bar charts');



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
