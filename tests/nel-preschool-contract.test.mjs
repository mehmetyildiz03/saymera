import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  skillsFor,PRESCHOOL_NEL_PATHS,PRESCHOOL_NEL_KSD_MAP,PRESCHOOL_NEL_CROSS_CUTTING_KSDS,
  PRESCHOOL_NEL_OFFICIAL_KSD_CODES,PRESCHOOL_NEL_CURRICULUM,PRESCHOOL_NEL_SUPPORTING_CONCEPTS,
  PRESCHOOL_NEL_PEDAGOGY,PRESCHOOL_NEL_SOURCE_AUTHORITY,PRESCHOOL_TO_P1_BRIDGES,
  PRESCHOOL_NEL_LESSON_CONTRACTS,generateLessonPracticeQuestion,generateQuestion,createConceptInstance,partWholeCaseFor,
  defaultState,runPedagogyStateAudit
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const contract=fs.readFileSync(new URL('../PRESCHOOL_NEL_RESEARCH_CONTRACT.md',import.meta.url),'utf8');

assert.equal(PRESCHOOL_NEL_PATHS.length,3,'NEL v2 must expose three parallel development paths');
assert.deepEqual(PRESCHOOL_NEL_PATHS.map(p=>p.id),['relationships-patterns','counting-number-sense','shapes-space']);

const expectedOfficialKsd=['1.1','1.2','2.1','2.2','2.3','2.4','3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8','4.1','4.2','4.3','4.4'];
assert.deepEqual(PRESCHOOL_NEL_OFFICIAL_KSD_CODES,expectedOfficialKsd,'master curriculum must preserve all 18 official NEL Numeracy KSD codes in order');
assert.deepEqual(Object.keys(PRESCHOOL_NEL_CROSS_CUTTING_KSDS),['1.1','1.2'],'daily-life numeracy KSDs must be explicit cross-cutting requirements');
for(const code of expectedOfficialKsd.filter(code=>!code.startsWith('1.'))) assert.ok(PRESCHOOL_NEL_KSD_MAP[code]?.length,'missing NEL KSD product mapping '+code);
assert.equal(Object.values(PRESCHOOL_NEL_KSD_MAP).flat().includes('nelSubitise5'),false,'subitising is a supporting Number Sense product skill, not a standalone NEL KSD mapping');
assert.equal(PRESCHOOL_NEL_SUPPORTING_CONCEPTS.length,1,'subitising should be tracked separately from numbered KSDs');
assert.equal(PRESCHOOL_NEL_SUPPORTING_CONCEPTS[0].skillId,'nelSubitise5');
assert.equal(PRESCHOOL_NEL_SUPPORTING_CONCEPTS[0].officialNumberedKsd,false);

assert.equal(PRESCHOOL_NEL_SOURCE_AUTHORITY.framework,'Singapore MOE Nurturing Early Learners Framework 2022');
assert.equal(PRESCHOOL_NEL_SOURCE_AUTHORITY.learningArea,'Numeracy');
assert.equal(PRESCHOOL_NEL_SOURCE_AUTHORITY.ageBand,'4–6');
assert.equal(PRESCHOOL_NEL_SOURCE_AUTHORITY.countingPageUpdated,'2025-12-31');
assert.equal(PRESCHOOL_NEL_SOURCE_AUTHORITY.verifiedAt,'2026-09-25');
assert.equal(PRESCHOOL_NEL_SOURCE_AUTHORITY.shapesVerifiedAt,'2026-09-26');
assert.equal(PRESCHOOL_NEL_CURRICULUM.length,4,'Numeracy must preserve the four official learning goals');
assert.deepEqual(PRESCHOOL_NEL_CURRICULUM.map(goal=>goal.goalId),['1','2','3','4']);
assert.equal(PRESCHOOL_NEL_CURRICULUM[0].mode,'cross-cutting','Learning Goal 1 is not a separate mastery path');

const reliableKsd=PRESCHOOL_NEL_CURRICULUM.flatMap(goal=>goal.ksd).find(item=>item.code==='3.2');
assert.deepEqual(reliableKsd.subskills.map(item=>item.code),['3.2.1','3.2.2','3.2.3','3.2.4'],'reliable counting must preserve all four Educators Guide principles');
assert.deepEqual(reliableKsd.subskills.map(item=>item.evidenceSectionId),['one-to-one-count','stable-order-count','cardinality-count','order-irrelevance']);

assert.deepEqual(PRESCHOOL_NEL_PEDAGOGY.approaches,[
  'concrete-pictorial-abstract',
  'manipulatives-and-games',
  'stories-songs-and-rhymes',
  'prompting-questions',
  'problem-solving-opportunities',
  'daily-routines-and-transitions'
]);
assert.equal(PRESCHOOL_NEL_PEDAGOGY.assessment.worksheetFirst,false,'preschool assessment must not become worksheet-first');
assert.equal(PRESCHOOL_NEL_PEDAGOGY.digitalRole,'complement-physical-play-and-real-objects');

for(const id of ['nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20','nelReliableCount10','nelSubitise5','nelConservation10','nelNumberRepresentations10','nelNumeralFormation10','nelCompareQuantities10','nelPartWhole10']) assert.equal(skillsFor('preschool').some(s=>s.id===id),false,'unfinished NEL v2 skill must stay hidden from the live preschool map: '+id);
for(const id of ['nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20','nelReliableCount10','nelSubitise5','nelConservation10','nelNumberRepresentations10','nelNumeralFormation10','nelCompareQuantities10','nelPartWhole10']) assert.equal(skillsFor('preschool',{includeHidden:true}).some(s=>s.id===id),true,'Inspector must reach hidden NEL reference skill: '+id);
assert.equal(skillsFor('preschool',{includeHidden:true}).some(s=>s.id==='nelPartWhole10'),true,'part-whole enters the hidden runnable registry only after its generator exists');

const preschoolIds=new Set(skillsFor('preschool',{includeHidden:true}).map(s=>s.id));
assert.equal(preschoolIds.has('nelConservation10'),true,'conservation enters the hidden runnable registry only after its generator exists');
assert.ok(PRESCHOOL_NEL_PATHS.find(p=>p.id==='counting-number-sense')?.skillIds.includes('nelConservation10'),'Path B metadata must reserve the conservation skill');
assert.equal(preschoolIds.has('nelNumberRepresentations10'),true,'number representations enters the hidden runnable registry only after its generator exists');
assert.ok(PRESCHOOL_NEL_PATHS.find(p=>p.id==='counting-number-sense')?.skillIds.includes('nelNumberRepresentations10'),'Path B metadata must reserve number representations');
assert.equal(preschoolIds.has('nelNumeralFormation10'),true,'numeral formation enters the hidden runnable registry only after its generator exists');
assert.ok(PRESCHOOL_NEL_PATHS.find(p=>p.id==='counting-number-sense')?.skillIds.includes('nelNumeralFormation10'),'Path B metadata must reserve numeral formation');
assert.equal(preschoolIds.has('nelCompareQuantities10'),true,'quantity comparison enters the hidden runnable registry only after its generator exists');
assert.ok(PRESCHOOL_NEL_PATHS.find(p=>p.id==='counting-number-sense')?.skillIds.includes('nelCompareQuantities10'),'Path B metadata must reserve quantity comparison');
assert.ok(PRESCHOOL_TO_P1_BRIDGES.compareOrder100.includes('nelCompareQuantities10'),'quantity comparison should bridge to later numerical comparison without becoming a hard prerequisite');
assert.ok(PRESCHOOL_NEL_PATHS.find(p=>p.id==='counting-number-sense')?.skillIds.includes('nelPartWhole10'),'Path B metadata must reserve part-whole');
assert.ok(PRESCHOOL_TO_P1_BRIDGES.numberBonds10.includes('nelPartWhole10'),'part-whole should bridge to later P1 number bonds without becoming a hard prerequisite');
assert.ok(PRESCHOOL_NEL_PATHS.find(p=>p.id==='shapes-space')?.skillIds.includes('nelBasicShapes'),'Path C metadata must reserve basic-shape recognition');
assert.ok(PRESCHOOL_TO_P1_BRIDGES.shapes1.includes('nelBasicShapes'),'basic-shape recognition should bridge to P1 geometry without becoming a hard prerequisite');
assert.equal(preschoolIds.has('nelBasicShapes'),false,'basic shapes must remain contract-only until its generator exists');
assert.equal(app.includes('renderNelBasicShapesLessonStep'),false,'contract slice must not add basic-shape Learn UI yet');
assert.equal(app.includes("if(skill.id==='nelPartWhole10'){ renderNelPartWholeLessonStep(skill); return; }"),true,'part-whole must teach before checking once Learn UI exists');
const partWholeLessonIds=['whole-five','split-five-2-3','split-five-1-4','swap-five-4-1','many-splits-six','three-parts-six','name-seven-3-4','explain-eight','bracelet-nine','fingers-ten'];
for(const id of partWholeLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL part-whole Learn step '+id);
assert.ok(app.includes("if(skillId==='nelPartWhole10') return NEL_PART_WHOLE_LESSON_STEPS.map"),'Inspector must expose part-whole Learn steps for browser QA');
for(const type of ['nel-part-whole-whole-set','nel-part-whole-split-builder','nel-part-whole-split-preview','nel-part-whole-name-builder','nel-part-whole-multiple-splits','nel-part-whole-context-split']) assert.ok(app.includes("case '"+type+"'"),'missing part-whole renderer '+type);
for(const interaction of ['nel-part-whole-split','nel-part-whole-name-parts','nel-part-whole-context-split']) assert.ok(app.includes("'"+interaction+"'"),'missing part-whole runtime interaction '+interaction);
assert.ok(app.includes('bindNelPartWholeSplit')&&app.includes('nelPartWholeReadSplit'),'part-whole split must be an active child interaction');
assert.ok(app.includes("data-part-whole-mode="),'split/context runtime must preserve evidence mode');
assert.ok(app.includes("role=\"button\" tabindex=\"0\" data-part-whole-bin"),'part-whole bins must avoid nested buttons and remain keyboard/touch targets');
assert.ok(app.includes("id:'three-parts-six'")&&app.includes("parts:[1,2,3]"),'Learn flow must preserve the official broader two-or-more-parts concept');
assert.ok(styles.includes('.nel-part-whole-bins')&&styles.includes('.nel-part-whole-token.selected'),'part-whole UI must expose large split targets and visible selected-object state');
assert.ok(styles.includes('@media(max-width:699px)')&&styles.includes('.nel-part-whole-gallery{grid-template-columns:1fr}'),'part-whole flow must have a mobile-specific layout');
assert.equal(app.includes("if(skill.id==='nelCompareQuantities10'){ renderNelCompareQuantitiesLessonStep(skill); return; }"),true,'quantity comparison must teach before checking once Learn UI exists');
const quantityLessonIds=['pair-same-four','pair-more-five-three','see-right-more','resist-size-spacing','fewer-language','less-language','same-ten','reverse-relation','explain-leftover','object-graph'];
for(const id of quantityLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL quantity-comparison Learn step '+id);
assert.ok(app.includes("if(skillId==='nelCompareQuantities10') return NEL_QUANTITY_COMPARE_LESSON_STEPS.map"),'Inspector must expose quantity-comparison Learn steps');
for(const type of ['nel-quantity-pair-builder','nel-quantity-set-pair','nel-quantity-relation-choice','nel-quantity-paired-proof','nel-quantity-object-graph']) assert.ok(app.includes("case '"+type+"'"),'missing quantity-comparison renderer '+type);
for(const interaction of ['nel-quantity-pair-sets','nel-quantity-relation-choice']) assert.ok(app.includes("'"+interaction+"'"),'missing quantity-comparison runtime interaction '+interaction);
assert.ok(app.includes('bindNelQuantityPairBuilder')&&app.includes('nelQuantityPairRead'),'one-to-one set comparison must be an active child interaction');
assert.ok(app.includes("root.dataset.pairComplete='true'"),'pairing must complete only after the smaller set is fully one-to-one matched');
assert.ok(app.includes("classList.add('unmatched')"),'unmatched objects must be made visible as comparison evidence');
assert.ok(app.includes("data-quantity-context="),'real-object graph transfer must carry semantic context metadata');
assert.ok(styles.includes('.nel-quantity-set.spread-row')&&styles.includes('.nel-quantity-set.compact-row'),'quantity UI must vary spacing without changing cardinality');
assert.ok(styles.includes('.nel-quantity-token.unmatched'),'quantity UI must visibly surface unmatched objects');
assert.ok(styles.includes('.nel-quantity-graph-row'),'real-object graph transfer must have a dedicated visual row model');
assert.ok(PRESCHOOL_TO_P1_BRIDGES.number20.includes('nelNumeralFormation10'),'numeral production should bridge to P1 number representation/writing without becoming a hard prerequisite');
assert.equal(app.includes("if(skill.id==='nelNumeralFormation10'){ renderNelNumeralFormationLessonStep(skill); return; }"),true,'numeral formation must teach before checking once Learn UI exists');
const numeralLessonIds=['form-one','trace-two','trace-three','trace-four','playdough-five','trace-six','trace-seven','trace-eight','trace-nine','write-ten'];
for(const id of numeralLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL numeral-formation Learn step '+id);
assert.ok(app.includes("if(skillId==='nelNumeralFormation10') return NEL_NUMERAL_FORMATION_LESSON_STEPS.map"),'Inspector must expose numeral-formation Learn steps for browser QA');
for(const type of ['nel-numeral-material-form','nel-numeral-draw-board','nel-numeral-written-record']) assert.ok(app.includes("case '"+type+"'"),'missing numeral-formation renderer '+type);
for(const interaction of ['nel-numeral-material-form','nel-numeral-guided-trace','nel-numeral-free-write','nel-numeral-context-record']) assert.ok(app.includes("'"+interaction+"'"),'missing numeral-formation runtime interaction '+interaction);
assert.ok(app.includes('pointerdown')&&app.includes('pointermove')&&app.includes('pointerup'),'numeral formation must support pointer/touch/stylus drawing rather than keypad entry');
assert.ok(app.includes("root.dataset.numeralReady=pass?'true':'false'"),'drawing completion must come from geometric formation evidence');
assert.ok(app.includes('guideRatios')&&app.includes('onPathRatio>=.5'),'formation acceptance must combine core-guide coverage with on-path evidence');
assert.ok(app.includes("exactStrokeOrderRequired")===false,'child runtime must not introduce an exact stroke-order gate');
assert.ok(app.includes("nelNumeralReadBoard($('.nel-numeral-board'))"),'Practice must read actual drawn numeral evidence');
assert.ok(styles.includes('.nel-numeral-svg')&&styles.includes('touch-action:none'),'numeral formation board must suppress browser pan/zoom while drawing with touch or stylus');
assert.ok(styles.includes('.nel-numeral-paper{width:min(390px,86vw);aspect-ratio:1/1'),'formation canvas must remain a large square interaction area without horizontal overflow');
assert.ok(styles.includes('.nel-numeral-board.material-mode .nel-numeral-user-stroke'),'material formation must be visually distinct from pencil/stylus formation');
assert.ok(app.includes("'nelNumberRepresentations10','nelNumeralFormation10','nelCompareQuantities10','nelPartWhole10','number1000'"),'numeral formation and quantity comparison must be lesson-first');
assert.equal(app.includes("if(skill.id==='nelNumberRepresentations10'){ renderNelNumberRepresentationsLessonStep(skill); return; }"),true,'number representations must teach before checking');
const numberRepLessonIds=['quantity-name-four','quantity-numeral-four','same-five-models','numeral-name-six','words-one-five','words-six-ten','word-quantity-eight','four-way-nine','mixed-seven','real-world-ten'];
for(const id of numberRepLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL number-representation Learn step '+id);
assert.ok(app.includes("range:[1,5]")&&app.includes("range:[6,10]"),'all written number words 1..10 must be introduced before mixed word evidence');
assert.ok(app.indexOf("id:'words-six-ten'")<app.indexOf("id:'word-quantity-eight'"),'written number words must be taught before word-to-quantity checking');
assert.ok(app.includes('data-number-word-listen')&&app.includes('data-number-word-open')&&app.includes('disabled>Bu kartı gördüm'),'number-word cards must require spoken-name exposure before acknowledgement');
assert.ok(app.includes("if(skillId==='nelNumberRepresentations10') return NEL_NUMBER_REP_LESSON_STEPS.map"),'Inspector must expose number-representation Learn steps');
for(const type of ['nel-number-quantity','nel-number-link-builder','nel-number-quantity-focus','nel-number-form-match','nel-number-equivalent-set','nel-number-context-tag']) assert.ok(app.includes("case '"+type+"'"),'missing number-representation renderer '+type);
assert.ok(app.includes("interaction==='nel-number-link-builder'")&&app.includes("interaction==='nel-number-form-match'"),'number-representation manipulatives must be wired for read/status/bind');
assert.ok(app.includes("'nelConservation10','nelNumberRepresentations10','nelNumeralFormation10','nelCompareQuantities10','nelPartWhole10','number1000'"),'number representations, numeral formation and quantity comparison must stay lesson-first');
assert.equal(/(^|[^$])\$\('\[data-number-(?:four-part|mixed|lesson-quantity)\]'\)\.forEach/m.test(app),false,'multi-option number Learn interactions must not use single-element selector semantics');
assert.equal(app.includes("if(skill.id==='nelConservation10'){ renderNelConservationLessonStep(skill); return; }"),true,'conservation must teach before checking once Learn UI exists');
const conservationLessonIds=['same-five','spread-five','array-six','circle-seven','random-eight','rearrange-nine','why-same','real-world'];
for(const id of conservationLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL conservation Learn step '+id);
for(const layout of ["'line'","'array'","'circle'","'random'"]) assert.ok(app.includes(layout),'NEL conservation Learn flow must include official-style varied arrangements: '+layout);
assert.ok(app.includes('data-conservation-move')&&app.includes('bindNelConservationRearrange'),'conservation Learn UI must include active same-object rearrangement evidence');
assert.ok(app.includes("case 'nel-conservation-before-after'"),'conservation before/after renderer must be wired');
assert.ok(app.includes("case 'nel-conservation-rearrange'"),'conservation rearrange renderer must be wired');
assert.ok(app.includes("case 'nel-conservation-relation-choice'"),'conservation relation-choice renderer must be wired');
assert.ok(app.includes("if(skillId==='nelConservation10') return NEL_CONSERVATION_LESSON_STEPS.map"),'Inspector must expose conservation Learn steps for browser QA');
assert.equal(skillsFor('grade1',{includeHidden:true}).some(skill=>(skill.prerequisite||[]).some(id=>preschoolIds.has(id))),false,'P1 must not hard-require preschool completion');

assert.ok(PRESCHOOL_TO_P1_BRIDGES.number20.includes('nelReliableCount10'));
assert.ok(PRESCHOOL_TO_P1_BRIDGES.number20.includes('nelSubitise5'));
assert.ok(PRESCHOOL_TO_P1_BRIDGES.number20.includes('nelConservation10'));
assert.deepEqual(PRESCHOOL_NEL_KSD_MAP['3.3'],['nelConservation10'],'KSD 3.3 must map directly to conservation of quantity');
assert.ok(PRESCHOOL_TO_P1_BRIDGES.numberBonds10.includes('nelPartWhole10'));

const matchContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelMatchAttributes;
assert.equal(matchContract.practice.sections.length,5);
assert.deepEqual(matchContract.practice.sections.map(s=>s.id),['match-exact','match-colour-shape','match-size-measure','explain-match','transfer-match']);
assert.deepEqual(matchContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const sortContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelSortAttributes;
assert.equal(sortContract.practice.sections.length,5);
assert.deepEqual(sortContract.practice.sections.map(s=>s.id),['sort-colour-shape','sort-size-measure','resort-new-rule','explain-sort-rule','transfer-sort']);
assert.deepEqual(sortContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const compareContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelCompareAttributes;
assert.equal(compareContract.practice.sections.length,5);
assert.deepEqual(compareContract.practice.sections.map(s=>s.id),['compare-size','compare-length','compare-height','explain-compare','transfer-compare']);
assert.deepEqual(compareContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const orderContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelOrderAttributes;
assert.equal(orderContract.practice.sections.length,5);
assert.deepEqual(orderContract.practice.sections.map(s=>s.id),['order-size','order-length-height','reverse-order','explain-order','transfer-event-sequence']);
assert.deepEqual(orderContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const patternContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelPatterns;
assert.equal(patternContract.practice.sections.length,5);
assert.deepEqual(patternContract.practice.sections.map(s=>s.id),['recognise-copy','extend-pattern','create-pattern','describe-pattern','transfer-pattern']);
assert.deepEqual(patternContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const roteContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelRoteCount20;
assert.equal(roteContract.practice.sections.length,5);
assert.deepEqual(roteContract.practice.sections.map(s=>s.id),['recite-forward-10','recite-forward-20','continue-from-middle','explain-stable-order','transfer-rhyme-game']);
assert.deepEqual(roteContract.evidenceLabels,{build:'Kur',see:'Dinle',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const reliableContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelReliableCount10;
assert.equal(reliableContract.practice.sections.length,5);
assert.deepEqual(reliableContract.practice.sections.map(s=>s.id),['one-to-one-count','stable-order-count','cardinality-count','order-irrelevance','transfer-daily-count']);
assert.deepEqual(reliableContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const subitiseContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelSubitise5;
assert.equal(subitiseContract.practice.sections.length,5);
assert.deepEqual(subitiseContract.practice.sections.map(s=>s.id),['flash-build','flash-structured','flash-varied','explain-instant','transfer-game']);
assert.deepEqual(subitiseContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

for(const [skillId,lessonContract] of Object.entries(PRESCHOOL_NEL_LESSON_CONTRACTS)){
  const sections=lessonContract.practice?.sections||[];
  assert.ok(sections.some(section=>section.phase==='context'&&section.representation==='transfer'),skillId+' must implement NEL KSD 1.1 through authentic daily-life/context transfer');
  assert.ok(sections.some(section=>section.phase==='reasoning'&&section.representation==='explain'),skillId+' must implement NEL KSD 1.2 through child-appropriate mathematical language/explanation');
}

const allPlannedProductSkills=new Set(PRESCHOOL_NEL_PATHS.flatMap(path=>path.skillIds));
for(const [code,ids] of Object.entries(PRESCHOOL_NEL_KSD_MAP)){
  for(const id of ids) assert.ok(allPlannedProductSkills.has(id),'KSD '+code+' references a skill outside the canonical preschool paths: '+id);
}
for(const concept of PRESCHOOL_NEL_SUPPORTING_CONCEPTS) assert.ok(allPlannedProductSkills.has(concept.skillId),'supporting concept must belong to a canonical preschool path: '+concept.skillId);

const formationContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelNumeralFormation10;
assert.equal(formationContract.status,'implemented');
assert.deepEqual(formationContract.officialKsd,['3.6']);
assert.deepEqual(PRESCHOOL_NEL_KSD_MAP['3.6'],['nelNumeralFormation10']);
assert.deepEqual(formationContract.productNumeralRange,[1,10]);
assert.equal(formationContract.productBoundaryNotOfficialCeiling,true,'1..10 must remain an explicit SAYMERA product boundary rather than an invented official KSD ceiling');
assert.equal(formationContract.dependsOnRepresentationSkill,'nelNumberRepresentations10','numeral production must build on already-understood number representation');
assert.deepEqual(formationContract.productionModes,['material-form','guided-trace','free-form-copy','meaningful-record']);
assert.deepEqual(formationContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Yaz',explain:'Anlat',transfer:'Taşı'});
assert.deepEqual(formationContract.practice.sections.map(s=>s.id),['form-numeral-material','follow-numeral-path','write-known-numeral','explain-written-record','record-meaningful-number']);
assert.deepEqual(formationContract.practice.sections.map(s=>s.phase),['model','representation','symbol','reasoning','context']);
assert.equal(formationContract.scoringBoundary.intentionalNumeralProduction,true);
assert.equal(formationContract.scoringBoundary.recognisableNumeralIdentity,true);
assert.equal(formationContract.scoringBoundary.exactStrokeOrderRequired,false,'stroke order must not become an unsupported mathematics mastery gate');
assert.equal(formationContract.scoringBoundary.penmanshipAestheticsScored,false,'penmanship aesthetics must not contaminate mathematics evidence');
assert.equal(formationContract.scoringBoundary.speedScored,false,'motor speed must not contaminate mathematics evidence');
assert.equal(formationContract.sourceGrounding.playdoughFormationExample,true,'contract must preserve the official playdough numeral-formation example');
assert.equal(formationContract.sourceGrounding.meaningfulWritingContextExample,'recording-game-score','contract must preserve the official meaningful game-score writing example');
assert.equal(formationContract.sourceGrounding.cpaBridge,true);
assert.equal(formationContract.numeralTen.twoDigitNumeral,true);
assert.deepEqual(formationContract.numeralTen.digitComponents,['1','0']);
assert.equal(formationContract.numeralTen.zeroQuantityTarget,false,'0 inside 10 is a written component here, not a separate zero-quantity target');

const basicShapesContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelBasicShapes;
assert.equal(basicShapesContract.status,'contract-only');
assert.deepEqual(basicShapesContract.officialKsd,['4.1']);
assert.deepEqual(PRESCHOOL_NEL_KSD_MAP['4.1'],['nelBasicShapes']);
assert.deepEqual(basicShapesContract.officialShapes,['circle','square','rectangle','triangle']);
assert.deepEqual(basicShapesContract.childLanguageTr,{circle:'daire',square:'kare',rectangle:'dikdörtgen',triangle:'üçgen'});
assert.equal(basicShapesContract.recognitionBoundary.recogniseAndName,true);
assert.equal(basicShapesContract.recognitionBoundary.variedSizes,true);
assert.equal(basicShapesContract.recognitionBoundary.variedOrientations,true);
assert.equal(basicShapesContract.recognitionBoundary.classroomAndImmediateEnvironment,true);
assert.equal(basicShapesContract.recognitionBoundary.colourIsDefiningCue,false);
assert.equal(basicShapesContract.recognitionBoundary.sizeIsDefiningCue,false);
assert.equal(basicShapesContract.recognitionBoundary.orientationIsDefiningCue,false);
assert.equal(basicShapesContract.recognitionBoundary.readingRequiredForNaming,false,'shape naming must not become a reading test');
assert.equal(basicShapesContract.separationFromLaterKsd.shapeAttributesKsd,'4.2');
assert.equal(basicShapesContract.separationFromLaterKsd.requireSideCountingForMastery,false,'side counting belongs to KSD 4.2, not KSD 4.1 mastery');
assert.equal(basicShapesContract.separationFromLaterKsd.requireEqualSideReasoningForMastery,false,'equal-side reasoning belongs to KSD 4.2');
assert.equal(basicShapesContract.separationFromLaterKsd.shapeCompositionKsd,'4.3');
assert.equal(basicShapesContract.separationFromLaterKsd.spatialRelationsKsd,'4.4');
assert.deepEqual(basicShapesContract.practice.sections.map(s=>s.id),['match-basic-shape','recognise-varied-shape','name-basic-shape','explain-shape-identity','transfer-environment-shape']);
assert.deepEqual(basicShapesContract.practice.sections.map(s=>s.phase),['model','representation','symbol','reasoning','context']);
assert.deepEqual(basicShapesContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

const partWholeContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelPartWhole10;
assert.equal(partWholeContract.status,'implemented');
assert.deepEqual(partWholeContract.officialKsd,['3.8']);
assert.deepEqual(PRESCHOOL_NEL_KSD_MAP['3.8'],['nelPartWhole10']);
assert.equal(partWholeContract.officialMaximumWhole,10);
assert.deepEqual(partWholeContract.productWholeRange,[2,10]);
assert.equal(partWholeContract.productMinimumNotOfficialFloor,true,'2..10 reference range must be identified as a SAYMERA product choice');
assert.equal(partWholeContract.concept,'parts-form-a-whole');
assert.equal(partWholeContract.decompositionBoundary.minimumParts,2);
assert.equal(partWholeContract.decompositionBoundary.referenceCoreParts,2);
assert.equal(partWholeContract.decompositionBoundary.supportsMoreThanTwoParts,true,'contract must preserve the official broader two-or-more-parts idea');
assert.equal(partWholeContract.decompositionBoundary.positivePartsInCore,true);
assert.equal(partWholeContract.decompositionBoundary.zeroPartCore,false,'zero-part decompositions must not be invented as a core NEL 3.8 target');
assert.equal(partWholeContract.decompositionBoundary.swappedPartsRemainValid,true);
assert.equal(partWholeContract.decompositionBoundary.multipleDecompositionsOfSameWhole,true);
assert.equal(partWholeContract.symbolicBoundary.numeralsMayLabelQuantities,true);
assert.equal(partWholeContract.symbolicBoundary.formalAdditionEquationRequired,false,'formal addition equations must not define preschool part-whole mastery');
assert.equal(partWholeContract.symbolicBoundary.numberBondDiagramRequired,false,'P1-style number-bond diagrams must not be back-ported as a preschool requirement');
assert.equal(partWholeContract.symbolicBoundary.symbolicEquationAsPrimaryDefinition,false);
assert.equal(partWholeContract.sourceGrounding.colouredBlockTowerExample,true);
assert.equal(partWholeContract.sourceGrounding.braceletBeadsSplitExample,true);
assert.equal(partWholeContract.sourceGrounding.fingerPlayExample,true);
assert.equal(partWholeContract.sourceGrounding.dailyRoutineReinforcement,true);
assert.equal(partWholeContract.sourceGrounding.futureAdditionSubtractionFoundation,true);
assert.deepEqual(partWholeContract.practice.sections.map(s=>s.id),['split-whole-objects','see-multiple-decompositions','name-parts-forming-whole','explain-same-whole-different-parts','transfer-fingers-bracelet']);
assert.deepEqual(partWholeContract.practice.sections.map(s=>s.phase),['model','representation','symbol','reasoning','context']);
assert.deepEqual(partWholeContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});

let partWholeSeed=3808;
const partWholeRng=()=>((partWholeSeed=(partWholeSeed*1664525+1013904223)>>>0)/2**32);
const partWholeConcept=createConceptInstance('nelPartWhole10',1,partWholeRng);
assert.equal(partWholeConcept.skillId,'nelPartWhole10');
for(const sample of [partWholeConcept.anchor,partWholeConcept.symbol,partWholeConcept.transfer]){
  assert.ok(sample.whole>=2&&sample.whole<=10,'part-whole case must stay inside product range 2..10');
  assert.ok(sample.split.left>=1&&sample.split.right>=1,'core part-whole split must keep both parts non-empty');
  assert.equal(sample.split.left+sample.split.right,sample.whole,'part quantities must reconstruct the whole internally');
  assert.equal(sample.partition.left.count+sample.partition.right.count,sample.whole);
  const sourceIds=sample.items.map(x=>x.id).sort();
  const splitIds=[...sample.partition.left.itemIds,...sample.partition.right.itemIds].sort();
  assert.deepEqual(splitIds,sourceIds,'partition must preserve every original object exactly once');
  assert.equal(new Set(splitIds).size,splitIds.length,'no original object may be duplicated across parts');
  assert.ok(sample.decompositions.every(d=>d.left>=1&&d.right>=1&&d.left+d.right===sample.whole),'all core decompositions must use positive parts forming the same whole');
  if(sample.whole>=3) assert.ok(sample.decompositions.length>=2,'whole >=3 must expose multiple decompositions');
}

const fiveCases=Array.from({length:4},(_,i)=>partWholeCaseFor(5,i+1));
assert.deepEqual(fiveCases.map(x=>[x.split.left,x.split.right]),[[1,4],[2,3],[3,2],[4,1]],'whole 5 must preserve official multiple and swapped decompositions');

const partBuild=generateQuestion('nelPartWhole10','build',1,partWholeRng,partWholeConcept);
const partSee=generateQuestion('nelPartWhole10','see',1,partWholeRng,partWholeConcept);
const partShow=generateQuestion('nelPartWhole10','symbol',1,partWholeRng,partWholeConcept);
const partExplain=generateQuestion('nelPartWhole10','explain',1,partWholeRng,partWholeConcept);
const partTransfer=generateQuestion('nelPartWhole10','transfer',1,partWholeRng,partWholeConcept);
assert.equal(partBuild.response.interaction,'nel-part-whole-split');
assert.equal(partSee.response.kind,'visual-choice');
assert.equal(partShow.response.interaction,'nel-part-whole-name-parts');
assert.equal(partExplain.response.kind,'choice');
assert.equal(partTransfer.response.interaction,'nel-part-whole-context-split');

for(const q of [partBuild,partSee,partShow,partExplain,partTransfer]){
  assert.notEqual(q.response.kind,'number-input','KSD 3.8 must collect part-whole evidence rather than keyboard arithmetic');
  const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label??o.value??'')].join(' ');
  assert.equal(/[+=>]/.test(childText),false,'formal operation/comparison notation must not define child-facing preschool part-whole evidence: '+childText);
  assert.equal(/number.?bond|sayı bağı/i.test(childText),false,'Primary number-bond terminology must not be back-ported into preschool evidence');
}
assert.equal(partBuild.visual.items.length,partWholeConcept.anchor.whole,'build visual must start from the complete whole set');
assert.equal(partTransfer.visual.context,'bracelet','transfer must preserve an official-style real-object context');

for(const section of partWholeContract.practice.sections){
  const qs=Array.from({length:14},(_,i)=>generateLessonPracticeQuestion('nelPartWhole10',section.id,i,1,partWholeRng));
  assert.ok(qs.every(q=>q.skillId==='nelPartWhole10'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    assert.notEqual(q.response.kind,'number-input',section.id+' must not become missing-addend keypad work');
    const text=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label??o.value??'')].join(' ');
    assert.equal(/[+=>]/.test(text),false,section.id+' must remain pre-formal and equation-free in child-facing copy');
    assert.equal(/0\s*(?:ve|ile)|(?:ve|ile)\s*0/.test(text),false,section.id+' must not introduce zero-part decompositions');
  }
}

const quantityCompareContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelCompareQuantities10;
assert.equal(quantityCompareContract.status,'implemented');
assert.deepEqual(quantityCompareContract.officialKsd,['3.7']);
assert.deepEqual(PRESCHOOL_NEL_KSD_MAP['3.7'],['nelCompareQuantities10']);
assert.equal(quantityCompareContract.maximumSetSize,10);
assert.equal(quantityCompareContract.compares,'quantity-of-two-sets');
assert.equal(quantityCompareContract.distinctFromAttributeComparison,true);
assert.deepEqual(quantityCompareContract.officialLanguage,['same-as','more-than','fewer-than','less-than']);
assert.deepEqual(quantityCompareContract.childLanguageTr,{sameAs:'aynı sayıda',moreThan:'daha çok',fewerThan:'daha az sayıda',lessThan:'daha az'});
assert.equal(quantityCompareContract.localisationBoundary.preserveOfficialSourceTermsInMetadata,true);
assert.equal(quantityCompareContract.localisationBoundary.forceEnglishFewerLessDistinctionInTurkish,false);
assert.deepEqual(quantityCompareContract.teachingProgression.first,['same-as','more-than']);
assert.deepEqual(quantityCompareContract.teachingProgression.then,['fewer-than','less-than']);
assert.equal(quantityCompareContract.comparisonEvidence.oneToOnePairing,true);
assert.equal(quantityCompareContract.comparisonEvidence.unmatchedItems,true);
assert.equal(quantityCompareContract.comparisonEvidence.occupiedAreaIsQuantityCue,false);
assert.equal(quantityCompareContract.comparisonEvidence.itemSizeIsQuantityCue,false);
assert.equal(quantityCompareContract.comparisonEvidence.spacingIsQuantityCue,false);
assert.equal(quantityCompareContract.comparisonEvidence.formalComparisonSymbolsRequired,false);
assert.equal(quantityCompareContract.supportedExtension.id,'how-many-more-fewer');
assert.equal(quantityCompareContract.supportedExtension.afterCoreRelation,true);
assert.equal(quantityCompareContract.supportedExtension.masteryRequiredForKsd37,false);
assert.equal(quantityCompareContract.sourceGrounding.realObjectGraphExample,true);
assert.deepEqual(quantityCompareContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});
assert.deepEqual(quantityCompareContract.practice.sections.map(s=>s.id),['pair-sets-one-to-one','see-same-or-more','use-fewer-less-language','explain-leftover-relation','transfer-real-object-graph']);
assert.deepEqual(quantityCompareContract.practice.sections.map(s=>s.phase),['model','representation','symbol','reasoning','context']);

const representationContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelNumberRepresentations10;
assert.equal(representationContract.practice.sections.length,5);
assert.deepEqual(representationContract.practice.sections.map(s=>s.id),['build-quantity-link','see-same-number','match-name-numeral-word','explain-equivalent-forms','transfer-number-context']);
assert.deepEqual(representationContract.practice.sections.map(s=>s.phase),['model','representation','symbol','reasoning','context']);
assert.deepEqual(representationContract.officialKsd,['3.4','3.5']);
assert.deepEqual(representationContract.productQuantityRange,[1,10]);
assert.deepEqual(representationContract.representationKinds,['number-name','numeral','number-word','quantity']);
assert.ok(['objects','fingers','ten-frame','tally'].every(kind=>representationContract.quantityModels.includes(kind)));
assert.deepEqual(PRESCHOOL_NEL_KSD_MAP['3.4'],['nelNumberRepresentations10']);
assert.deepEqual(PRESCHOOL_NEL_KSD_MAP['3.5'],['nelNumberRepresentations10']);
assert.equal(representationContract.practice.sections.some(s=>/(^|-)write($|-)|numeral-formation|handwriting/i.test(s.id)),false,'KSD 3.4–3.5 must not absorb KSD 3.6 numeral formation');

const conservationContract=PRESCHOOL_NEL_LESSON_CONTRACTS.nelConservation10;
assert.equal(conservationContract.practice.sections.length,5);
assert.deepEqual(conservationContract.practice.sections.map(s=>s.id),['rearrange-same-set','see-same-quantity','resist-spacing-cue','explain-no-add-remove','transfer-real-objects']);
assert.deepEqual(conservationContract.practice.sections.map(s=>s.phase),['model','representation','symbol','reasoning','context']);
assert.deepEqual(conservationContract.evidenceLabels,{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'});
assert.equal(conservationContract.pathId,'counting-number-sense');
assert.equal(conservationContract.practice.sections.some(s=>s.id==='order-irrelevance'),false,'conservation must remain distinct from reliable-counting order irrelevance');

const lessonIds=['same-object','same-colour','same-shape','same-size','same-length','same-height','explain-match','real-world-match'];
for(const id of lessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL matching Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelMatchAttributes'){ renderNelMatchLessonStep(skill); return; }"));
assert.ok(app.includes("const LESSON_FIRST_SKILLS=new Set(['nelMatchAttributes'"),'NEL matching must teach before checking');

const sortLessonIds=['sort-colour','resort-shape','resort-size','sort-length','sort-height','discover-rule','explain-resort','real-world-sort'];
for(const id of sortLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL sorting Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelSortAttributes'){ renderNelSortLessonStep(skill); return; }"));
assert.ok(app.includes("'nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20','nelReliableCount10','nelSubitise5','nelConservation10','nelNumberRepresentations10','nelNumeralFormation10','nelCompareQuantities10','nelPartWhole10','number1000'"),'NEL reference skills must teach before checking');

const compareLessonIds=['compare-size','compare-small','compare-length-align','compare-length-same','compare-height','name-attribute','fair-compare','real-world-compare'];
for(const id of compareLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL comparing Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelCompareAttributes'){ renderNelCompareLessonStep(skill); return; }"));

const orderLessonIds=['order-size','reverse-size','order-length','order-height','choose-order','explain-order','event-order','real-world-order'];
for(const id of orderLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL ordering Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelOrderAttributes'){ renderNelOrderLessonStep(skill); return; }"));

const patternLessonIds=['recognise-ab','copy-ab','extend-abb','extend-aab','create-simple','extend-aabb','extend-abc','create-complex','describe-pattern','real-world-pattern'];
for(const id of patternLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL patterning Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelPatterns'){ renderNelPatternLessonStep(skill); return; }"));

const roteLessonIds=['chant-1-5','build-2-5','chant-6-10','continue-7-10','chant-11-20','continue-to-20','start-middle','stable-order','count-back','real-world-rote'];
for(const id of roteLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL rote-count Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelRoteCount20'){ renderNelRoteLessonStep(skill); return; }"));
assert.ok(app.includes("data-rote-speech"),'rote counting must expose audio-first controls instead of requiring number-word reading');

const reliableLessonIds=['one-word-one-object','move-count-five','stable-order-next','fixed-count-six','count-to-ten','cardinality-seven','order-left-right','order-eight','four-principles','real-world-reliable'];
for(const id of reliableLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL reliable-count Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelReliableCount10'){ renderNelReliableLessonStep(skill); return; }"));
assert.ok(app.includes("nelReliableReadOrderProof"),'order-irrelevance must be proven by two counting passes, not explained only in copy');

const subitiseLessonIds=['glance-two','build-three','dice-four','dice-five','varied-three','varied-four','varied-five','same-quantity-layout','instant-meaning','game-transfer'];
for(const id of subitiseLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL subitising Learn step '+id);
assert.ok(app.includes("if(skill.id==='nelSubitise5'){ renderNelSubitiseLessonStep(skill); return; }"));
assert.ok(app.includes("const NEL_SUBITISE_FLASH_MS=650;"),'subitising must use a genuinely short visual exposure');
assert.ok(app.includes('data-flash-state="idle"'),'subitising must start with the target hidden');
assert.ok(app.includes("root.dataset.flashReady='true'"),'subitising response must unlock only after the flash has ended');
assert.ok(app.includes("frame.dataset.flashState='ready'"),'subitising target must transition to a closed/ready state');

assert.ok(app.includes("const NEL_NUMBER_WORDS=['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on'];"),'Turkish localisation must provide written number words 1..10');
assert.ok(app.includes("model==='fingers'")&&app.includes("model==='ten-frame'")&&app.includes("model==='tally'"),'number representation UI must render varied quantity models');
assert.ok(app.includes("data-rote-speech")&&app.includes("Hedef sayı adını dinle"),'spoken number-name evidence must stay audio-addressable');
assert.ok(app.includes("data-number-mixed=\"'+x.n+'\" disabled"),'mixed representation choice must stay locked until the spoken number name is heard');
assert.ok(app.includes("toLocaleUpperCase('tr-TR')")&&app.includes('data-number-context'),'Turkish number-context labels must preserve locale-aware casing and semantic context');
assert.ok(app.includes('data-name-listened="false"')&&app.includes("root.dataset.nameListened='true'"),'Practice form matching must record actual spoken-number listening');
assert.ok(app.includes("root.dataset.nameListened!=='true'"),'Practice form matching must refuse completion before the spoken number name is heard');
for(const context of ['alışveriş listesi','tarif kartı','oyun kartı','malzeme etiketi']) assert.ok(app.includes(context)||fs.readFileSync(new URL('../engine.mjs',import.meta.url),'utf8').includes(context),'cardinal daily-life context missing: '+context);

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

for(const section of sortContract.practice.sections){
  const qs=Array.from({length:8},(_,i)=>generateLessonPracticeQuestion('nelSortAttributes',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelSortAttributes'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL sorting must not pull formal Primary notation forward: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'sorting feedback must describe mathematics');
  }
}

for(const section of compareContract.practice.sections){
  const qs=Array.from({length:9},(_,i)=>generateLessonPracticeQuestion('nelCompareAttributes',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelCompareAttributes'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL comparing must stay verbal and concrete in preschool: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'comparing feedback must describe mathematics');
  }
}

for(const section of orderContract.practice.sections){
  const qs=Array.from({length:9},(_,i)=>generateLessonPracticeQuestion('nelOrderAttributes',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelOrderAttributes'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL ordering must stay concrete in preschool: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'ordering feedback must describe mathematics');
  }
}

for(const section of patternContract.practice.sections){
  const qs=Array.from({length:9},(_,i)=>generateLessonPracticeQuestion('nelPatterns',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelPatterns'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL patterning must stay concrete in preschool: '+childText);
    assert.equal(['aferin','harika','doğru yaptın'].some(phrase=>childText.toLocaleLowerCase('tr-TR').includes(phrase)),false,'patterning feedback must describe mathematics');
  }
}

for(const section of roteContract.practice.sections){
  const qs=Array.from({length:10},(_,i)=>generateLessonPracticeQuestion('nelRoteCount20',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelRoteCount20'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL rote counting must not pull formal Primary notation forward: '+childText);
    assert.equal(q.response.kind,'manipulative','rote counting evidence must be audio/manipulation based, not numeral entry or literacy-only choice');
    assert.ok(['nel-rote-sequence','nel-rote-audio-choice','nel-rote-phrase-choice'].includes(q.response.interaction),'unexpected rote counting interaction: '+q.response.interaction);
    assert.equal(['dots','objects','numbercard'].includes(q.visual?.type),false,'rote counting must not silently become quantity or numeral recognition');
  }
}

for(const section of reliableContract.practice.sections){
  const qs=Array.from({length:10},(_,i)=>generateLessonPracticeQuestion('nelReliableCount10',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelReliableCount10'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL reliable counting must stay concrete and verbal: '+childText);
    assert.equal(q.response.kind,'manipulative','reliable counting must require observable child action');
    assert.ok(['nel-reliable-count-set','nel-reliable-next-word','nel-reliable-cardinality','nel-reliable-order-proof'].includes(q.response.interaction),'unexpected reliable-count interaction: '+q.response.interaction);
    assert.equal((q.visual?.items?.length||0)>10,false,'reliable counting must never exceed 10 objects');
    for(const option of q.visual?.options||[]){
      const spokenNumber=String(option.id||'').startsWith('rote-')?Number(String(option.id).replace('rote-','')):Number(option.n);
      if(Number.isFinite(spokenNumber)) assert.ok(spokenNumber<=10,'reliable-count audio choices must stay within 10');
    }
  }
}

for(const section of subitiseContract.practice.sections){
  const qs=Array.from({length:12},(_,i)=>generateLessonPracticeQuestion('nelSubitise5',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelSubitise5'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL subitising must stay concrete and verbal: '+childText);
    assert.equal(q.response.kind,'manipulative','subitising evidence must require an observable post-flash child response');
    assert.ok(['nel-subitise-flash-build','nel-subitise-flash-audio','nel-subitise-flash-match','nel-subitise-flash-explain'].includes(q.response.interaction),'unexpected subitising interaction: '+q.response.interaction);
    assert.ok((q.visual?.pattern?.n||0)>=1&&(q.visual?.pattern?.n||0)<=5,'subitising product scope must remain within 1..5');
    assert.ok(Number(q.visual?.flashMs)>=250&&Number(q.visual?.flashMs)<=800,'subitising target must be shown only briefly');
    if(q.visual?.pool!=null) assert.ok(Number(q.visual.pool)<=5,'subitising build pool must stay within 5');
    for(const option of q.visual?.options||[]){
      const spokenNumber=String(option.id||'').startsWith('rote-')?Number(String(option.id).replace('rote-','')):Number(option.n);
      if(Number.isFinite(spokenNumber)) assert.ok(spokenNumber>=1&&spokenNumber<=5,'subitising numeric options must stay within 1..5');
    }
    if(section==='transfer-game') assert.ok(['dice','domino'].includes(q.visual.pattern.context),'subitising transfer must use a real game-like dice/domino arrangement');
  }
}

function placementIds(layout){ return (layout?.placements||[]).map(p=>p.itemId).sort(); }
for(const section of conservationContract.practice.sections){
  const qs=Array.from({length:14},(_,i)=>generateLessonPracticeQuestion('nelConservation10',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelConservation10'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(forbiddenSymbols.some(symbol=>childText.includes(symbol)),false,'NEL conservation must stay concrete and verbal: '+childText);
    assert.notEqual(q.response.kind,'number-input','conservation must not require numeral entry');
    assert.ok((q.visual?.n||0)>=4&&(q.visual?.n||0)<=10,'conservation practice must stay within the explicit 10-object endpoint');
    const before=q.visual?.before;
    const after=q.visual?.after||q.visual?.target;
    if(before&&after){
      assert.deepEqual(placementIds(before),placementIds(after),'conservation must rearrange the same object identities without add/remove');
      assert.notDeepEqual(before.placements,after.placements,'conservation evidence must actually change spatial arrangement');
    }
    if(section==='resist-spacing-cue') assert.equal(q.visual?.after?.layout,'spread-line','spacing misconception practice must include a visibly spread layout');
  }
}

const orderSize=generateLessonPracticeQuestion('nelOrderAttributes','order-size',0,1,rng);
const orderReverse=generateLessonPracticeQuestion('nelOrderAttributes','reverse-order',0,1,rng);
const orderEvent=generateLessonPracticeQuestion('nelOrderAttributes','transfer-event-sequence',0,1,rng);
assert.equal(orderSize.response.interaction,'nel-order-sequence');
assert.equal(orderReverse.response.interaction,'nel-order-sequence');
assert.equal(orderEvent.response.interaction,'nel-order-sequence');
assert.notEqual(orderSize.response.expectedValue,orderReverse.response.expectedValue,'reversing direction must genuinely reverse the expected order');
assert.equal(String(orderEvent.response.expectedValue).split('|').length,3,'event sequencing must order three events');

const patternCopy=generateLessonPracticeQuestion('nelPatterns','recognise-copy',0,1,rng);
const patternExtend=generateLessonPracticeQuestion('nelPatterns','extend-pattern',1,1,rng);
const patternCreateSimple=generateLessonPracticeQuestion('nelPatterns','create-pattern',0,1,rng);
const patternCreateComplex=generateLessonPracticeQuestion('nelPatterns','create-pattern',1,1,rng);
const patternDescribe=generateLessonPracticeQuestion('nelPatterns','describe-pattern',0,1,rng);
const patternTransfer=generateLessonPracticeQuestion('nelPatterns','transfer-pattern',0,1,rng);
assert.equal(patternCopy.response.interaction,'nel-pattern-build');
assert.equal(patternCreateSimple.response.interaction,'nel-pattern-build');
assert.equal(patternExtend.response.kind,'visual-choice');
assert.equal(patternDescribe.response.kind,'choice');
assert.equal(patternTransfer.response.kind,'choice');
assert.ok(String(patternCreateComplex.response.expectedValue).split('|').length>=8,'complex pattern creation must require a multi-part repeating unit, not a next-item guess');

const roteBuild=generateLessonPracticeQuestion('nelRoteCount20','recite-forward-10',0,1,rng);
const roteTo20=generateLessonPracticeQuestion('nelRoteCount20','recite-forward-20',1,1,rng);
const roteMiddle=generateLessonPracticeQuestion('nelRoteCount20','continue-from-middle',2,1,rng);
const roteExplain=generateLessonPracticeQuestion('nelRoteCount20','explain-stable-order',0,1,rng);
const roteTransfer=generateLessonPracticeQuestion('nelRoteCount20','transfer-rhyme-game',0,1,rng);
assert.equal(roteBuild.response.interaction,'nel-rote-sequence');
assert.equal(roteTo20.response.interaction,'nel-rote-audio-choice');
assert.equal(roteMiddle.response.interaction,'nel-rote-audio-choice');
assert.equal(roteExplain.response.interaction,'nel-rote-phrase-choice');
assert.equal(roteTransfer.response.interaction,'nel-rote-audio-choice');
assert.equal(String(roteTo20.answer),'rote-20','forward-to-20 practice must explicitly reach the NEL endpoint 20');

const reliableOne=generateLessonPracticeQuestion('nelReliableCount10','one-to-one-count',0,1,rng);
const reliableStable=generateLessonPracticeQuestion('nelReliableCount10','stable-order-count',0,1,rng);
const reliableCard=generateLessonPracticeQuestion('nelReliableCount10','cardinality-count',0,1,rng);
const reliableOrder=generateLessonPracticeQuestion('nelReliableCount10','order-irrelevance',0,1,rng);
const reliableTransfer=generateLessonPracticeQuestion('nelReliableCount10','transfer-daily-count',0,1,rng);
assert.equal(reliableOne.response.interaction,'nel-reliable-count-set');
assert.equal(reliableStable.response.interaction,'nel-reliable-next-word');
assert.equal(reliableCard.response.interaction,'nel-reliable-cardinality');
assert.equal(reliableOrder.response.interaction,'nel-reliable-order-proof');
assert.equal(reliableTransfer.response.interaction,'nel-reliable-count-set');
assert.match(String(reliableCard.response.expectedValue),/^\d+\|rote-\d+$/,'cardinality must connect the completed count to the final spoken number name');
assert.match(String(reliableOrder.response.expectedValue),/^(\d+)\|\1\|same$/,'order irrelevance must preserve the same total across both directions');

const subBuild=generateLessonPracticeQuestion('nelSubitise5','flash-build',0,1,rng);
const subStructured=generateLessonPracticeQuestion('nelSubitise5','flash-structured',0,1,rng);
const subVaried=generateLessonPracticeQuestion('nelSubitise5','flash-varied',0,1,rng);
const subExplain=generateLessonPracticeQuestion('nelSubitise5','explain-instant',0,1,rng);
const subTransfer=generateLessonPracticeQuestion('nelSubitise5','transfer-game',0,1,rng);
assert.equal(subBuild.response.interaction,'nel-subitise-flash-build');
assert.equal(subStructured.response.interaction,'nel-subitise-flash-audio');
assert.equal(subVaried.response.interaction,'nel-subitise-flash-match');
assert.equal(subExplain.response.interaction,'nel-subitise-flash-explain');
assert.equal(subTransfer.response.interaction,'nel-subitise-flash-audio');
assert.ok(['dice','domino'].includes(subTransfer.visual.pattern.context),'subitising transfer must use dice/domino structure');
assert.ok(subStructured.visual.flashMs<=800&&subStructured.visual.flashMs>=250,'subitising flash duration must stay short');

const formationConcept=createConceptInstance('nelNumeralFormation10',1,rng);
assert.equal(formationConcept.skillId,'nelNumeralFormation10');
for(const sample of [formationConcept.anchor,formationConcept.symbol,formationConcept.transfer]){
  assert.ok(sample.n>=1&&sample.n<=10,'numeral formation concept must stay within SAYMERA scope 1..10');
  assert.equal(sample.numeral,String(sample.n));
  assert.equal(sample.zeroQuantityTarget,false);
  assert.equal(sample.guides.length,sample.n===10?2:1,'10 must use two digit guides; single-digit numerals one guide');
  if(sample.n===10) assert.deepEqual(sample.digits,['1','0']);
  else assert.equal(sample.digits.includes('0'),false,'zero glyph must not appear as an independent target in the 1..9 cases');
  for(const guide of sample.guides){
    assert.equal(guide.exactStrokeOrderRequired,false);
    assert.ok(guide.minimumHitRatio>=.7&&guide.minimumHitRatio<=.9,'formation tolerance must require recognisable coverage without pixel-perfect tracing');
    assert.ok(guide.tolerance>=10,'young-child formation must use a broad spatial tolerance');
    assert.ok(guide.points.length>=4,'each digit guide needs enough geometric checkpoints to reject a single tap');
    for(const [x,y] of guide.points) assert.ok(x>=0&&x<=100&&y>=0&&y<=100,'guide coordinates must stay normalized');
  }
}

const formationBuild=generateQuestion('nelNumeralFormation10','build',1,rng,formationConcept);
const formationSee=generateQuestion('nelNumeralFormation10','see',1,rng,formationConcept);
const formationWrite=generateQuestion('nelNumeralFormation10','symbol',1,rng,formationConcept);
const formationExplain=generateQuestion('nelNumeralFormation10','explain',1,rng,formationConcept);
const formationTransfer=generateQuestion('nelNumeralFormation10','transfer',1,rng,formationConcept);
assert.equal(formationBuild.response.interaction,'nel-numeral-material-form');
assert.equal(formationSee.response.interaction,'nel-numeral-guided-trace');
assert.equal(formationWrite.response.interaction,'nel-numeral-free-write');
assert.equal(formationExplain.response.kind,'choice');
assert.equal(formationTransfer.response.interaction,'nel-numeral-context-record');
assert.equal(formationSee.visual.guideVisible,true);
assert.equal(formationWrite.visual.guideVisible,false,'independent numeral writing must not reveal the hidden acceptance guide');
assert.equal(formationTransfer.visual.context.kind,'game-score','meaningful transfer must preserve the official game-score style example');
for(const q of [formationBuild,formationSee,formationWrite,formationExplain,formationTransfer]){
  assert.notEqual(q.response.kind,'number-input','KSD 3.6 must collect actual formation/writing evidence rather than keyboard numeral entry');
  assert.equal(/güzel yaz|hızlı yaz|tek.*sıra|doğru.*stroke/i.test([q.prompt,q.hint,q.explain].join(' ')),false,'penmanship aesthetics, speed or exact stroke order must not become mathematics feedback');
}

for(const section of formationContract.practice.sections){
  const qs=Array.from({length:12},(_,i)=>generateLessonPracticeQuestion('nelNumeralFormation10',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelNumeralFormation10'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    assert.notEqual(q.response.kind,'number-input',section.id+' must require formation/meaning evidence rather than numeric keypad entry');
    if(q.visual?.guides){
      assert.ok(q.visual.guides.every(g=>g.exactStrokeOrderRequired===false),'practice guides must remain stroke-order independent');
      assert.ok(q.visual.guides.flatMap(g=>g.points).length>=4,'practice formation visuals need real geometric evidence');
    }
    if(section==='write-known-numeral') assert.equal(q.visual?.guideVisible,false,'independent write practice must keep acceptance guides hidden');
    if(section==='record-meaningful-number') assert.equal(q.visual?.context?.kind,'game-score','transfer must be meaningful numeral recording, not decontextualized worksheet copying');
  }
}

const quantityCompareConcept=createConceptInstance('nelCompareQuantities10',1,rng);
assert.equal(quantityCompareConcept.skillId,'nelCompareQuantities10');
for(const sample of [quantityCompareConcept.anchor,quantityCompareConcept.symbol,quantityCompareConcept.transfer]){
  assert.ok(sample.leftN>=1&&sample.leftN<=10&&sample.rightN>=1&&sample.rightN<=10,'both KSD 3.7 sets must stay within 1..10');
  assert.equal(sample.left.items.length,sample.leftN);
  assert.equal(sample.right.items.length,sample.rightN);
  const expected=sample.leftN===sample.rightN?'same-as':sample.leftN>sample.rightN?'more-than':'fewer-than';
  assert.equal(sample.relation,expected,'quantity relation must derive from cardinality rather than layout or object size');
  assert.equal(sample.difference,Math.abs(sample.leftN-sample.rightN));
  if(sample.relation==='fewer-than') assert.deepEqual(sample.language.sourceTerms,['fewer-than','less-than'],'official less/fewer language roles must remain represented in metadata');
  assert.ok(sample.left.tokenScale!==sample.right.tokenScale||sample.left.layout!==sample.right.layout,'comparison cases should vary irrelevant visual cues so area/spacing cannot be memorised');
}

const quantityBuild=generateQuestion('nelCompareQuantities10','build',1,rng,quantityCompareConcept);
const quantitySee=generateQuestion('nelCompareQuantities10','see',1,rng,quantityCompareConcept);
const quantityShow=generateQuestion('nelCompareQuantities10','symbol',1,rng,quantityCompareConcept);
const quantityExplain=generateQuestion('nelCompareQuantities10','explain',1,rng,quantityCompareConcept);
const quantityTransfer=generateQuestion('nelCompareQuantities10','transfer',1,rng,quantityCompareConcept);
assert.equal(quantityBuild.response.interaction,'nel-quantity-pair-sets');
assert.equal(quantitySee.response.kind,'choice');
assert.equal(quantityShow.response.interaction,'nel-quantity-relation-choice');
assert.equal(quantityExplain.response.kind,'choice');
assert.equal(/\b\d+\s+nesne\s+(?:artıyor|kalıyor)/i.test([quantityExplain.prompt,quantityExplain.hint,quantityExplain.explain,...(quantityExplain.response?.options||[]).map(o=>o.label||o.value)].join(' ')),false,'core KSD 3.7 explanation must use unmatched-object relation without requiring a numerical difference');
assert.equal(quantityTransfer.response.interaction,'nel-quantity-relation-choice');
assert.equal(quantityTransfer.visual.context,'real-object-graph');
for(const q of [quantityBuild,quantitySee,quantityShow,quantityExplain,quantityTransfer]){
  assert.notEqual(q.response.kind,'number-input','KSD 3.7 must compare concrete sets and language rather than typed numerals');
  const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
  assert.equal(/[<>]/.test(childText),false,'KSD 3.7 child tasks must not pull formal comparison symbols forward: '+childText);
  assert.equal(/kaç tane daha (?:çok|az)/i.test(childText),false,'how-many-more/fewer is a supported extension, not core KSD 3.7 mastery evidence');
}

const quantityRelations=new Set();
for(const section of quantityCompareContract.practice.sections){
  const qs=Array.from({length:14},(_,i)=>generateLessonPracticeQuestion('nelCompareQuantities10',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelCompareQuantities10'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    assert.notEqual(q.response.kind,'number-input',section.id+' must not reduce set comparison to numeral entry');
    const childText=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
    assert.equal(/[<>]/.test(childText),false,section.id+' must remain verbal/concrete rather than formal-symbol based');
    assert.equal(/kaç tane daha (?:çok|az)/i.test(childText),false,section.id+' must not turn the optional difference extension into a core mastery gate');
    const visual=q.visual||{};
    if(visual.left?.count!=null&&visual.right?.count!=null){
      assert.ok(visual.left.count<=10&&visual.right.count<=10,'practice sets must stay within official maximum 10 each');
      quantityRelations.add(visual.left.count===visual.right.count?'same':visual.left.count>visual.right.count?'left-more':'right-more');
      assert.ok(visual.left.items?.length===visual.left.count&&visual.right.items?.length===visual.right.count);
    }
    if(section==='pair-sets-one-to-one') assert.equal(q.response.interaction,'nel-quantity-pair-sets');
    if(section==='use-fewer-less-language') assert.equal(q.response.interaction,'nel-quantity-relation-choice');
    if(section==='transfer-real-object-graph') assert.equal(q.visual?.context,'real-object-graph');
  }
}
assert.ok(quantityRelations.has('same')&&quantityRelations.has('left-more')&&quantityRelations.has('right-more'),'practice must cover equal and both unequal directions across varied cases');

const representationConcept=createConceptInstance('nelNumberRepresentations10',1,rng);
assert.equal(representationConcept.skillId,'nelNumberRepresentations10');
assert.ok(representationConcept.anchor.n>=1&&representationConcept.anchor.n<=10,'number representation concept must stay within product scope 1..10');
assert.equal(representationConcept.anchor.numberName.kind,'number-name');
assert.equal(representationConcept.anchor.numeral.kind,'numeral');
assert.equal(representationConcept.anchor.numberWord.kind,'number-word');
assert.equal(typeof representationConcept.anchor.numberName.speech,'string','spoken number name must carry audio/speech content');
assert.equal(representationConcept.anchor.numberWord.value,representationConcept.anchor.numberName.speech,'localised written word and spoken name may share language text but must remain different representation kinds');
assert.deepEqual(representationConcept.anchor.quantities.map(q=>q.model),['objects','fingers','ten-frame','tally']);

const repBuild=generateQuestion('nelNumberRepresentations10','build',1,rng,representationConcept);
const repSee=generateQuestion('nelNumberRepresentations10','see',1,rng,representationConcept);
const repShow=generateQuestion('nelNumberRepresentations10','symbol',1,rng,representationConcept);
const repExplain=generateQuestion('nelNumberRepresentations10','explain',1,rng,representationConcept);
const repTransfer=generateQuestion('nelNumberRepresentations10','transfer',1,rng,representationConcept);
assert.equal(repBuild.response.interaction,'nel-number-link-builder');
assert.equal(repSee.response.kind,'visual-choice');
assert.equal(repShow.response.interaction,'nel-number-form-match');
assert.equal(repExplain.response.kind,'choice');
assert.equal(repTransfer.response.kind,'visual-choice');
for(const q of [repBuild,repSee,repShow,repExplain,repTransfer]){
  assert.notEqual(q.response.kind,'number-input','KSD 3.4–3.5 must not require numeral writing');
  assert.ok(!/(rakamı?\s+yaz|rakam\s+yaz|rakamı?\s+çiz|rakam.*oluştur)/i.test([q.prompt,q.hint,q.explain].join(' ')),'KSD 3.6 formation language must not leak into representation evidence');
}

const representationModels=new Set();
for(const section of representationContract.practice.sections){
  const qs=Array.from({length:12},(_,i)=>generateLessonPracticeQuestion('nelNumberRepresentations10',section.id,i,1,rng));
  assert.ok(qs.every(q=>q.skillId==='nelNumberRepresentations10'));
  assert.ok(qs.every(q=>q.learningPhase==='practice'));
  for(const q of qs){
    assert.notEqual(q.response.kind,'number-input',section.id+' must not require numeral entry');
    const visual=q.visual||{};
    const collect=model=>{if(model)representationModels.add(model);};
    collect(visual.quantity?.model);
    for(const option of q.response?.options||[]) collect(option.visual?.model);
    for(const option of visual.options||[]) collect(option.visual?.model);
    if(visual.numberName) assert.ok(visual.numberName.speech,'spoken number name must preserve speech metadata');
    if(visual.numberWord) assert.equal(visual.numberWord.kind,'number-word');
  }
}
for(const model of ['objects','fingers','ten-frame','tally']) assert.ok(representationModels.has(model),'number representation practice must use varied quantity model '+model);

const conservationConcept=createConceptInstance('nelConservation10',1,rng);
assert.equal(conservationConcept.skillId,'nelConservation10');
assert.ok(conservationConcept.anchor.n>=4&&conservationConcept.anchor.n<=10,'conservation concept must stay within sets up to 10');
assert.deepEqual(placementIds(conservationConcept.anchor.before),placementIds(conservationConcept.anchor.after),'concept case must preserve exact object identity');
assert.notDeepEqual(conservationConcept.anchor.before.placements,conservationConcept.anchor.after.placements,'concept case must rearrange positions');
const conservationBuild=generateQuestion('nelConservation10','build',1,rng,conservationConcept);
const conservationSee=generateQuestion('nelConservation10','see',1,rng,conservationConcept);
const conservationShow=generateQuestion('nelConservation10','symbol',1,rng,conservationConcept);
const conservationExplain=generateQuestion('nelConservation10','explain',1,rng,conservationConcept);
const conservationTransfer=generateQuestion('nelConservation10','transfer',1,rng,conservationConcept);
assert.equal(conservationBuild.response.interaction,'nel-conservation-rearrange');
assert.equal(conservationBuild.response.kind,'manipulative');
assert.equal(conservationSee.response.kind,'choice');
assert.equal(conservationShow.response.interaction,'nel-conservation-relation-choice');
assert.equal(conservationExplain.response.kind,'choice');
assert.equal(conservationTransfer.response.kind,'choice');
for(const q of [conservationBuild,conservationSee,conservationShow,conservationExplain,conservationTransfer]){
  assert.notEqual(q.response.kind,'number-input','conservation evidence must not depend on numeral reading/writing');
}

const sizeQuestion=generateLessonPracticeQuestion('nelCompareAttributes','compare-size',0,1,rng);
const lengthQuestion=generateLessonPracticeQuestion('nelCompareAttributes','compare-length',0,1,rng);
const heightQuestion=generateLessonPracticeQuestion('nelCompareAttributes','compare-height',0,1,rng);
assert.equal(sizeQuestion.response.interaction,'nel-compare-pair');
assert.equal(lengthQuestion.response.interaction,'nel-compare-pair');
assert.ok(String(lengthQuestion.response.expectedValue).startsWith('aligned|'),'length comparison must require common-start alignment');
assert.equal(heightQuestion.response.kind,'choice');

const colourResort=generateLessonPracticeQuestion('nelSortAttributes','resort-new-rule',1,1,rng);
const shapeResort=generateLessonPracticeQuestion('nelSortAttributes','resort-new-rule',0,1,rng);
assert.deepEqual(colourResort.visual.items.map(x=>x.id).sort(),shapeResort.visual.items.map(x=>x.id).sort(),'re-sorting must use the same object set under a new rule');
assert.notEqual(colourResort.response.expectedValue,shapeResort.response.expectedValue,'changing the rule must genuinely change group assignments');

const sortBuild=generateQuestion('nelSortAttributes','build',1,rng);
assert.equal(sortBuild.response.interaction,'nel-sort-bin');
assert.equal(sortBuild.response.kind,'manipulative');

const build=generateQuestion('nelMatchAttributes','build',1,rng);
assert.equal(build.response.interaction,'nel-match-pair');
assert.equal(build.response.kind,'manipulative');
const see=generateQuestion('nelMatchAttributes','see',1,rng);
assert.equal(see.response.kind,'visual-choice');

const auditState=defaultState();
auditState.profile='preschool';
const audit=runPedagogyStateAudit(auditState);
for(const id of ['nel-ksd-coverage','nel-daily-life-cross-cutting','nel-supporting-concepts','p1-no-preschool-hard-gate','nel-match-reference-contract','nel-sort-reference-contract','nel-compare-reference-contract','nel-order-reference-contract','nel-pattern-reference-contract','nel-rote-count-reference-contract','nel-reliable-count-reference-contract','nel-subitise-reference-contract','nel-conservation-reference-contract','nel-number-representations-contract','nel-numeral-formation-contract','nel-compare-quantities-contract','nel-part-whole-contract','nel-basic-shapes-contract']){
  assert.equal(audit.checks.find(c=>c.id===id)?.pass,true,'preschool audit failed: '+id);
}

assert.ok(contract.includes('18 official Numeracy KSDs'),'research contract must state the complete canonical KSD count');
assert.ok(contract.includes('**1.1**')&&contract.includes('**1.2**'),'daily-life Numeracy KSDs must be explicit, not implied only');
assert.ok(contract.includes('**3.2.1**')&&contract.includes('**3.2.4**'),'reliable-counting subskills must be documented');
assert.ok(contract.includes('nelNumberRepresentations10')&&contract.includes('✅ implemented + browser QA'),'implementation snapshot must mark number representations complete');
assert.ok(contract.includes('nelNumeralFormation10')&&contract.includes('✅ implemented + browser QA'),'implementation snapshot must mark numeral formation complete');
assert.ok(contract.includes('nelCompareQuantities10')&&contract.includes('✅ implemented + browser QA'),'implementation snapshot must mark quantity comparison complete');
assert.ok(contract.includes('nelPartWhole10')&&contract.includes('✅ implemented + browser QA'),'implementation snapshot must mark part-whole complete');
assert.ok(contract.includes('nelBasicShapes')&&contract.includes('**NEXT**'),'implementation snapshot must preserve basic shapes as the next Preschool v2 skill');
assert.ok(contract.includes('Status after SAYMERA v1.23.0'),'research contract status must match the implemented release boundary');
assert.ok(contract.includes('**Official role:** implements **NEL KSD 4.1'),'Path C research contract must anchor basic shapes to official KSD 4.1');
assert.ok(contract.includes('classrooms and immediate environment'),'KSD 4.1 research boundary must preserve the official environmental recognition example');
assert.ok(contract.includes('size and orientation'),'KSD 4.1 must explicitly generalise across size and orientation');
assert.ok(contract.includes('side counting or equal-side explanations are not required for 4.1 mastery'),'KSD 4.1 must stay separate from KSD 4.2 shape attributes');
assert.ok(contract.includes('spoken/audio shape names remain available'),'shape naming evidence must not silently become a literacy gate');
assert.ok(contract.includes('v1.21.0 reference implementation'),'research contract must document the numeral-formation implementation slice');
assert.ok(contract.includes('visibly off-path scribbling is rejected'),'implementation notes must preserve scribble-rejection evidence');
assert.ok(contract.includes('same numeral path drawn in reverse direction is accepted'),'implementation notes must preserve stroke-direction independence');
assert.ok(contract.includes('**NEL KSD 3.7**'),'quantity-comparison research boundary must anchor official KSD 3.7');
assert.ok(contract.includes('two sets of up to 10 things each'),'KSD 3.7 boundary must preserve the official two-set and 10-each limit');
assert.ok(contract.includes('same as')&&contract.includes('more than')&&contract.includes('fewer than')&&contract.includes('less than'),'official KSD 3.7 relation language must stay explicit');
assert.ok(contract.includes('real-object graph'),'research boundary must preserve the official real-object-graph style example');
assert.ok(contract.includes('KSD 2.1 / `nelCompareAttributes`'),'quantity comparison must be explicitly distinguished from attribute comparison');
assert.ok(contract.includes('`<` and `>` are not KSD 3.7 mastery targets'),'preschool quantity comparison must not be converted to formal symbol mastery');
assert.ok(contract.includes('aynı sayıda')&&contract.includes('daha çok')&&contract.includes('daha az sayıda'),'Turkish child-facing relation language must be documented');
assert.ok(contract.includes('Supported extension, not an extra KSD 3.7 mastery gate'),'how-many-more/fewer must remain an Educators Guide extension rather than an invented KSD endpoint');
assert.ok(contract.includes('v1.22.0 reference implementation'),'research contract must document the quantity-comparison implementation slice');
assert.ok(contract.includes('v1.23.0 reference implementation'),'research contract must document the part-whole implementation slice');
assert.ok(contract.includes('**NEL KSD 3.8**'),'part-whole research boundary must anchor official KSD 3.8');
assert.ok(contract.includes('quantity of up to 10'),'part-whole boundary must preserve the official maximum whole of 10');
assert.ok(contract.includes('tower of five blocks')&&contract.includes('bracelet/bead activity'),'research contract must preserve official concrete part-whole examples');
assert.ok(contract.includes('2 and 3, 3 and 2, 1 and 4, and 4 and 1'),'research contract must preserve multiple and swapped decompositions of 5');
assert.ok(contract.includes('two or more parts'),'part-whole contract must not narrow the official concept to exactly two parts');
assert.ok(contract.includes('wholes **2–10**'),'lower reference bound must be documented as a product choice');
assert.ok(contract.includes('zero-part decompositions are **not** a core target'),'zero must not be silently invented into KSD 3.8');
assert.ok(contract.includes('formal addition equation')&&contract.includes('not required'),'part-whole meaning must precede formal operation equations');
assert.ok(contract.includes('P1 number-bond completion must not be back-ported'),'preschool part-whole must remain foundational rather than a copied Primary number-bond lesson');
assert.ok(contract.includes('one-to-one pairing exposes unmatched objects'),'implementation notes must preserve pairing/unmatched proof as the concrete comparison model');
assert.ok(contract.includes('formal `<` and `>` symbols are excluded'),'implementation notes must preserve the no-formal-symbol boundary');
assert.ok(contract.includes('Re-verified on **2026-09-25**'),'research contract must record the latest official-source verification');
assert.ok(contract.includes('**KSD 3.4**')&&contract.includes('**KSD 3.5**'),'number-representation research boundary must anchor both official KSDs');
assert.ok(contract.includes('**number name**')&&contract.includes('**numeral**')&&contract.includes('**number word**')&&contract.includes('**quantity**'),'representation contract must distinguish spoken name, numeral, written word and quantity');
assert.ok(contract.includes('not a claim that KSD 3.4/3.5 explicitly state a 10-only ceiling'),'product limit must not be misrepresented as an official NEL ceiling');
assert.ok(contract.includes('do **not** score handwriting/formation here'),'number representation must stay separate from KSD 3.6 numeral formation');
assert.ok(contract.includes('**NEL KSD 3.6 — “Write numbers in numeral.”**'),'numeral-formation research boundary must anchor the official KSD wording');
assert.ok(contract.includes('form the numeral 5 using playdough'),'research contract must preserve the official material-formation example');
assert.ok(contract.includes('recording scores for a game'),'research contract must preserve the official meaningful-writing example');
assert.ok(contract.includes('not an official KSD ceiling'),'1..10 formation scope must be identified as a product boundary');
assert.ok(contract.includes('exact stroke order is **not** a mathematics mastery requirement'),'unsupported stroke-order grading must remain outside mastery');
assert.ok(contract.includes('handwriting beauty, neatness and speed are **not** mathematics scores'),'fine-motor aesthetics/speed must not contaminate mathematics mastery');
assert.ok(contract.includes('the `0` in `10` is a glyph component'),'the two-digit numeral 10 boundary must distinguish glyph formation from zero-quantity mastery');
assert.ok(contract.includes('**Yaz:** intentionally produce the numeral'),'KSD 3.6 is the deliberate preschool exception where the symbol evidence is child-facing writing');
assert.ok(contract.includes('Kur · Gör · Göster · Anlat · Taşı'));
assert.ok(contract.includes('**NEL KSD 3.3**'),'research contract must explicitly anchor conservation to KSD 3.3');
assert.ok(contract.includes('discrete quantity/cardinality'),'conservation scope must stay on discrete quantity rather than unrelated conservation tasks');
assert.ok(contract.includes('Distinguish this from KSD 3.2 order irrelevance.'),'research contract must distinguish spatial conservation from counting-order irrelevance');
assert.ok(contract.includes('Preschool is foundational but is **not a hard prerequisite for P1**.'));

console.log('NEL preschool contract: PASS (4 learning goals; 18 official KSDs; 3 product paths; explicit LG1 cross-cutting pedagogy; no P1 hard gate)');
