import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  skillsFor,PRESCHOOL_NEL_PATHS,PRESCHOOL_NEL_KSD_MAP,PRESCHOOL_TO_P1_BRIDGES,
  PRESCHOOL_NEL_LESSON_CONTRACTS,generateLessonPracticeQuestion,generateQuestion,createConceptInstance,
  defaultState,runPedagogyStateAudit
} from '../engine.mjs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const contract=fs.readFileSync(new URL('../PRESCHOOL_NEL_RESEARCH_CONTRACT.md',import.meta.url),'utf8');

assert.equal(PRESCHOOL_NEL_PATHS.length,3,'NEL v2 must expose three parallel development paths');
assert.deepEqual(PRESCHOOL_NEL_PATHS.map(p=>p.id),['relationships-patterns','counting-number-sense','shapes-space']);

const expectedKsd=['2.1','2.2','2.3','2.4','3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8','4.1','4.2','4.3','4.4'];
for(const code of expectedKsd) assert.ok(PRESCHOOL_NEL_KSD_MAP[code]?.length,'missing NEL KSD mapping '+code);
assert.equal(Object.values(PRESCHOOL_NEL_KSD_MAP).flat().includes('nelSubitise5'),false,'subitising is a supporting Number Sense product skill, not a standalone NEL KSD mapping');

for(const id of ['nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20','nelReliableCount10','nelSubitise5','nelConservation10']) assert.equal(skillsFor('preschool').some(s=>s.id===id),false,'unfinished NEL v2 skill must stay hidden from the live preschool map: '+id);
for(const id of ['nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20','nelReliableCount10','nelSubitise5','nelConservation10']) assert.equal(skillsFor('preschool',{includeHidden:true}).some(s=>s.id===id),true,'Inspector must reach hidden NEL reference skill: '+id);

const preschoolIds=new Set(skillsFor('preschool',{includeHidden:true}).map(s=>s.id));
assert.equal(preschoolIds.has('nelConservation10'),true,'conservation enters the hidden runnable registry only after its generator exists');
assert.ok(PRESCHOOL_NEL_PATHS.find(p=>p.id==='counting-number-sense')?.skillIds.includes('nelConservation10'),'Path B metadata must reserve the conservation skill');
assert.equal(app.includes("if(skill.id==='nelConservation10'){ renderNelConservationLessonStep(skill); return; }"),true,'conservation must teach before checking once Learn UI exists');
const conservationLessonIds=['same-five','spread-five','array-six','circle-seven','random-eight','rearrange-nine','why-same','real-world'];
for(const id of conservationLessonIds) assert.ok(app.includes("id:'"+id+"'"),'missing NEL conservation Learn step '+id);
for(const layout of ["'line'","'array'","'circle'","'random'"]) assert.ok(app.includes(layout),'NEL conservation Learn flow must include official-style varied arrangements: '+layout);
assert.ok(app.includes('data-conservation-move')&&app.includes('bindNelConservationRearrange'),'conservation Learn UI must include active same-object rearrangement evidence');
assert.ok(app.includes("case 'nel-conservation-before-after'"),'conservation before/after renderer must be wired');
assert.ok(app.includes("case 'nel-conservation-rearrange'"),'conservation rearrange renderer must be wired');
assert.ok(app.includes("case 'nel-conservation-relation-choice'"),'conservation relation-choice renderer must be wired');
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
assert.ok(app.includes("'nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20','nelReliableCount10','nelSubitise5','number1000'"),'NEL reference skills must teach before checking');

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
for(const id of ['nel-ksd-coverage','p1-no-preschool-hard-gate','nel-match-reference-contract','nel-sort-reference-contract','nel-compare-reference-contract','nel-order-reference-contract','nel-pattern-reference-contract','nel-rote-count-reference-contract','nel-reliable-count-reference-contract','nel-subitise-reference-contract','nel-conservation-reference-contract']){
  assert.equal(audit.checks.find(c=>c.id===id)?.pass,true,'preschool audit failed: '+id);
}

assert.ok(contract.includes('Kur · Gör · Göster · Anlat · Taşı'));
assert.ok(contract.includes('**NEL KSD 3.3**'),'research contract must explicitly anchor conservation to KSD 3.3');
assert.ok(contract.includes('discrete quantity/cardinality'),'conservation scope must stay on discrete quantity rather than unrelated conservation tasks');
assert.ok(contract.includes('Distinguish this from KSD 3.2 order irrelevance.'),'research contract must distinguish spatial conservation from counting-order irrelevance');
assert.ok(contract.includes('Preschool is foundational but is **not a hard prerequisite for P1**.'));

console.log('NEL preschool contract: PASS (3 paths; 16 official KSD groups; hidden Path A + rote/reliable/subitising/conservation contracts; no P1 hard gate)');
