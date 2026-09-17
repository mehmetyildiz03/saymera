from pathlib import Path
import json

root=Path('.')

def read(p): return (root/p).read_text(encoding='utf-8')
def write(p,s): (root/p).write_text(s,encoding='utf-8')
def replace_once(text, old, new, label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1 occurrence, got {n}')
    return text.replace(old,new,1)

# app: session-local exact-task repeat guard for fresh concepts
p=Path('app.js'); s=read(p)
s=replace_once(s,
"questionIndex:0, correct:0, wrong:0, hints:0, effortUsed:0, recentSkillIds:[], learningEvents:[], newStable:0, bridgeAdds:0",
"questionIndex:0, correct:0, wrong:0, hints:0, effortUsed:0, recentSkillIds:[], recentQuestionSignatures:[], learningEvents:[], newStable:0, bridgeAdds:0",
'session signature storage')

anchor="function loadPlanItem(){\n"
helper="""function questionRepeatSignature(q){
  const visual=q?.visual?JSON.stringify(q.visual):'';
  const options=q?.response?.options?JSON.stringify(q.response.options.map(o=>({value:o.value,visual:o.visual||null}))):'';
  return [q?.skillId||'',q?.representation||'',q?.prompt||'',String(q?.answer??''),q?.taskKind||'',q?.response?.kind||'',visual,options].join('¦');
}
function rememberQuestionSignature(q){
  if(!session||!q) return;
  session.recentQuestionSignatures ||= [];
  session.recentQuestionSignatures.push(questionRepeatSignature(q));
  if(session.recentQuestionSignatures.length>14) session.recentQuestionSignatures=session.recentQuestionSignatures.slice(-14);
}
function loadPlanItem(){
"""
s=replace_once(s,anchor,helper,'loadPlanItem helper insertion')

s=replace_once(s,
"  const concept=reuseFocusConcept?session.focusConcept:createConceptInstance(skill.id,ss.difficulty||1,Math.random);\n",
"  let concept=reuseFocusConcept?session.focusConcept:createConceptInstance(skill.id,ss.difficulty||1,Math.random);\n",
'concept let')

old="""    currentQuestion=generateLearningQuestion(
      skill.id,currentSelection.phase,currentSelection.representation,
      ss.difficulty||1,Math.random,concept,learningOptions
    );
"""
new="""    const makeLearningQuestion=()=>generateLearningQuestion(
      skill.id,currentSelection.phase,currentSelection.representation,
      ss.difficulty||1,Math.random,concept,learningOptions
    );
    currentQuestion=makeLearningQuestion();
    if(!reuseFocusConcept){
      let signature=questionRepeatSignature(currentQuestion), retries=0;
      while(session.recentQuestionSignatures?.includes(signature) && retries<8){
        concept=createConceptInstance(skill.id,ss.difficulty||1,Math.random);
        currentQuestion=makeLearningQuestion();
        signature=questionRepeatSignature(currentQuestion);
        retries++;
      }
    }
    rememberQuestionSignature(currentQuestion);
"""
s=replace_once(s,old,new,'learning question no-repeat generation')

# Non-learning legacy/review path also records its signature where currentQuestion is assigned directly.
old2="""    currentQuestion=generateQuestion(skill.id,currentSelection.representation,ss.difficulty||1,Math.random,concept);
"""
if old2 in s:
    s=replace_once(s,old2,old2+"    rememberQuestionSignature(currentQuestion);\n",'legacy signature record')
write(p,s)

# Add a dedicated P2 pedagogy audit.
audit=r'''import assert from 'node:assert/strict';
import {
  skillsFor, supportsLearningCycle, readinessSourcesFor, buildLearningCyclePlan,
  ensureSkillState, defaultState, createConceptInstance, generateLearningQuestion,
  REPRESENTATIONS
} from '../engine.mjs';

const makeRng=(seed)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const p2=skillsFor('grade2').filter(s=>supportsLearningCycle(s.id));
assert.equal(p2.length,24,'all current Singapore P2 skills must be on the learning-cycle contract');

const expectedKinds={build:'manipulative-build',see:'visual-discrimination',symbol:'symbol-entry',explain:'reasoning-choice',transfer:'context-transfer'};
const forbidden=/(kanıt profili|temsil genişliği|puanlanan şey|öğrenme döngüsü|practicecheckpoint|conceptkey|taskkind|readiness)/i;
const signature=q=>JSON.stringify({prompt:q.prompt,answer:String(q.answer),taskKind:q.taskKind,response:q.response?.kind,visual:q.visual||null,options:q.response?.options||null});

for(const [i,skill] of p2.entries()){
  const sources=readinessSourcesFor(skill.id);
  assert.ok(sources.length>0,`${skill.id}: readiness source missing`);
  assert.ok(sources.every(x=>x!==skill.id),`${skill.id}: readiness may not test the target itself`);

  const plan=buildLearningCyclePlan(ensureSkillState(defaultState(),skill.id));
  assert.deepEqual(plan.map(x=>x.phase),['readiness','model','representation','symbol','reasoning','context','practice','practice'],`${skill.id}: first-cycle phase order drifted`);

  const rng=makeRng(51000+i*97);
  const focus=createConceptInstance(skill.id,2,rng);
  assert.ok(focus,`${skill.id}: concept instance missing`);
  const qs=[];
  qs.push(generateLearningQuestion(skill.id,'readiness','see',2,rng,null));
  qs.push(generateLearningQuestion(skill.id,'model','build',2,rng,focus));
  qs.push(generateLearningQuestion(skill.id,'representation','see',2,rng,focus));
  qs.push(generateLearningQuestion(skill.id,'symbol','symbol',2,rng,focus));
  qs.push(generateLearningQuestion(skill.id,'reasoning','explain',2,rng,focus));
  qs.push(generateLearningQuestion(skill.id,'context','transfer',2,rng,createConceptInstance(skill.id,2,rng)));
  qs.push(generateLearningQuestion(skill.id,'practice','symbol',2,rng,createConceptInstance(skill.id,2,rng)));
  qs.push(generateLearningQuestion(skill.id,'practice','transfer',2,rng,createConceptInstance(skill.id,2,rng)));

  assert.equal(qs[0].countsTowardEvidence,false,`${skill.id}: readiness must not inflate mastery`);
  assert.notEqual(qs[0].readinessSourceSkillId,skill.id,`${skill.id}: readiness provenance is target skill`);
  for(const q of qs){
    const childCopy=[q.prompt,q.hint,q.explain,q.teachingNote].filter(Boolean).join(' ');
    assert.ok(!forbidden.test(childCopy),`${skill.id}: internal product language leaked to child copy: ${childCopy}`);
  }
  const evidenceQs=qs.slice(1,6);
  for(const q of evidenceQs) assert.equal(q.taskKind,expectedKinds[q.representation],`${skill.id}/${q.representation}: cognitive task family mismatch`);
  assert.equal(new Set(evidenceQs.map(q=>q.taskKind)).size,5,`${skill.id}: five windows collapsed into repeated cognitive action`);
  assert.equal(new Set(evidenceQs.map(signature)).size,5,`${skill.id}: exact task repeated inside model→context core`);
}

// Symbols that are new at P2 must be taught before they are assessed.
{
  const rng=makeRng(9123), c=createConceptInstance('fractionNotation2',2,rng);
  const teach=generateLearningQuestion('fractionNotation2','representation','see',2,rng,c);
  const assess=generateLearningQuestion('fractionNotation2','symbol','symbol',2,rng,c);
  assert.match(String(teach.teachingNote||''),/\d+\/\d+/,'fraction notation must be explicitly taught in representation phase');
  assert.match(String(assess.prompt),/kesir|yazar|yaz/i,'fraction symbol phase must assess notation after teaching');
}
{
  const rng=makeRng(9124), c=createConceptInstance('divisionTables2',2,rng);
  const model=generateLearningQuestion('divisionTables2','model','build',2,rng,c);
  const teach=generateLearningQuestion('divisionTables2','representation','see',2,rng,c);
  const assess=generateLearningQuestion('divisionTables2','symbol','symbol',2,rng,c);
  assert.ok(!String(model.prompt).includes('÷'),'division sign must not be assumed in the concrete model phase');
  assert.match(`${teach.prompt} ${teach.teachingNote||''} ${teach.explain||''}`,/÷/,'division sign must be introduced before symbolic assessment');
  assert.match(String(assess.prompt),/÷/,'division symbol phase must assess ÷ after introduction');
}

// App-level guard: “fresh” means no exact recent task repetition within a session.
const app=await (await import('node:fs/promises')).readFile(new URL('../app.js',import.meta.url),'utf8');
assert.match(app,/recentQuestionSignatures:\[\]/,'session must keep recent task signatures');
assert.match(app,/retries<8/,'fresh-task generation must retry exact duplicates');
assert.match(app,/questionRepeatSignature/,'fresh-task repeat guard missing');

console.log(`p2 pedagogy audit: PASS (${p2.length} P2 skills; phase order, task diversity, child-copy, teaching-before-testing, no-repeat guard)`);
'''
(root/'tests/p2-pedagogy-audit.test.mjs').write_text(audit,encoding='utf-8')

# package: include audit and bump version
p=Path('package.json'); data=json.loads(read(p)); data['version']='1.5.2';
data['scripts']['test']='node build-standalone.mjs && node tests/engine.test.mjs && node tests/learning-cycle.test.mjs && node tests/p2-pedagogy-audit.test.mjs && node tests/ui-static.test.mjs'
write(p,json.dumps(data,ensure_ascii=False,indent=2)+'\n')

# cache bump
p=Path('sw.js'); s=read(p); s=s.replace("saymera-v1-5-1-p2-geometry-complete","saymera-v1-5-2-p2-pedagogy-audit"); write(p,s)

# audit documentation
(root/'P2_PEDAGOGY_AUDIT.md').write_text('''# SAYMERA — Singapore P2 Pedagogy Audit (v1.5.2)\n\nBu kalite kapısı 24 P2-REFERENCE becerinin yalnız kapsamını değil, öğrenme davranışını da denetler.\n\n- Hazırbulunuşluk hedef becerinin kolay kopyası olamaz.\n- İlk döngü: ön bilgi → model → temsil → sembol → gerekçe → bağlam → en az iki pekiştirme.\n- Kur/Gör/Yaz/Anlat/Taşı beş farklı bilişsel görev ailesi olmalıdır.\n- Aynı tam görev çekirdek döngü içinde tekrar edemez.\n- Yeni semboller anlam kurulmadan sınanamaz (özellikle kesir gösterimi ve ÷).\n- Çocuk metninde ürün motoru/kanıt/puanlama jargonu bulunamaz.\n- `conceptScope: fresh` görevleri, oturumdaki yakın geçmişte aynı tam görevi üretirse en fazla 8 kez yeniden örneklenir.\n\nBu audit Singapore MOE Primary Mathematics P2 kapsam denetiminin üstünde bir SAYMERA ürün kalite katmanıdır; MOE'nin resmî sekiz aşamalı modeli olduğu iddia edilmez.\n''',encoding='utf-8')

print('v1.5.2 pedagogy audit staged')
