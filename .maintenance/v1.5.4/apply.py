from pathlib import Path
import json

root=Path('.')
def read(p): return (root/p).read_text(encoding='utf-8')
def write(p,s): (root/p).write_text(s,encoding='utf-8')
def rep(s,old,new,label):
    n=s.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1 match, got {n}')
    return s.replace(old,new,1)

# 1) Make practice visibly/newly framed while preserving the underlying cognitive task.
p=Path('engine.mjs'); s=read(p)
old="""export function generateLearningQuestion(skillId,phase,representation,difficulty=1,rng=Math.random,conceptInstance=null,options={}){
  let q;
  if(phase==='readiness') q=generateReadinessQuestion(skillId,difficulty,rng,options);
  else q=generateQuestion(skillId,representation,difficulty,rng,conceptInstance);
  q.learningPhase=phase||null;
  if(phase==='readiness') q.countsTowardEvidence=false;
  if(phase==='retrieval') q.retentionProbe=true;
  q.id ||= `${skillId}:${phase||representation}:${Date.now()}:${Math.floor(rng()*1e6)}`;
  return q;
}
"""
new="""const PRACTICE_PROMPT_PREFIXES={
  build:['Yeni model:','Bu kez modeli sen kur:','Başka bir model:'],
  see:['Yeni görsel:','Bu kez doğru olanı bul:','Başka bir örnek:'],
  symbol:['Yeni örnek:','Bu kez sayı ve işaretlerle çöz:','Başka bir örnek:'],
  explain:['Bu kez nedenini düşün:','Yeni örneği açıkla:','Başka bir örnekte düşün:'],
  transfer:['Yeni durum:','Bu kez başka bir durumda kullan:','Başka bir günlük durum:']
};
function varyPracticePrompt(q,skillId,representation,index=0){
  const i=Math.max(0,Number(index)||0);
  // Fractions get genuinely different practice wording, not merely a cosmetic prefix.
  // This is where the original child-facing repetition was most visible.
  if(skillId==='fractionMeaning2'&&representation==='symbol'){
    q.prompt='Yeni modelde toplam kaç eş parça var?';
  }else if(skillId==='fractionMeaning2'&&representation==='transfer'){
    const denom=q.visual?.denom;
    q.prompt=denom?`${denom} eş parçaya ayrılmış yeni bir bütün düşün. Yalnız bir parçayı gösteren modeli bul.`:'Yeni bir bütün düşün. Yalnız bir eş parçayı gösteren modeli bul.';
  }else if(skillId==='fractionNotation2'&&representation==='symbol'){
    q.prompt='Bu yeni modelin kesir gösterimini seç.';
  }else if(skillId==='fractionNotation2'&&representation==='transfer'){
    q.prompt='Pizza modelindeki yenilen kısmı kesirle yaz.';
  }else if(skillId==='fractionCompare2'&&representation==='symbol'){
    q.prompt='İki kesri karşılaştır. Araya uygun işareti seç.';
  }else if(skillId==='fractionCompare2'&&representation==='transfer'){
    q.prompt='İki eş bütünün yenilen kısımlarını karşılaştır. Daha çok yenilen tarafı seç.';
  }else if(skillId==='fractionAddSub2'&&representation==='symbol'){
    q.prompt='Modeldeki kesir işleminin sonucunu seç.';
  }else if(skillId==='fractionAddSub2'&&representation==='transfer'){
    q.prompt='Günlük durumdaki kesir işlemini çöz ve sonucu seç.';
  }else{
    const prefixes=PRACTICE_PROMPT_PREFIXES[representation]||['Yeni örnek:'];
    q.prompt=`${prefixes[i%prefixes.length]} ${q.prompt}`;
  }
  q.practiceVariant=i+1;
  return q;
}

export function generateLearningQuestion(skillId,phase,representation,difficulty=1,rng=Math.random,conceptInstance=null,options={}){
  let q;
  if(phase==='readiness') q=generateReadinessQuestion(skillId,difficulty,rng,options);
  else q=generateQuestion(skillId,representation,difficulty,rng,conceptInstance);
  if(phase==='practice') q=varyPracticePrompt(q,skillId,representation,options.practiceIndex??0);
  q.learningPhase=phase||null;
  if(phase==='readiness') q.countsTowardEvidence=false;
  if(phase==='retrieval') q.retentionProbe=true;
  q.id ||= `${skillId}:${phase||representation}:${Date.now()}:${Math.floor(rng()*1e6)}`;
  return q;
}
"""
s=rep(s,old,new,'engine practice prompt variation')
write(p,s)

# 2) Pass practiceIndex from the session plan so adaptive practice can rotate child-facing variants.
p=Path('app.js'); s=read(p)
old="""    const learningOptions=currentSelection.phase==='readiness'?{
      support:currentSelection.kind==='bridge'||currentSelection.reviewItem?.support===true,
      sourceSkillId:currentSelection.reviewItem?.readinessSourceSkillId||null
    }:{};
"""
new="""    const learningOptions=currentSelection.phase==='readiness'?{
      support:currentSelection.kind==='bridge'||currentSelection.reviewItem?.support===true,
      sourceSkillId:currentSelection.reviewItem?.readinessSourceSkillId||null
    }:currentSelection.phase==='practice'?{
      practiceIndex:currentSelection.practiceIndex??0
    }:{};
"""
s=rep(s,old,new,'app practiceIndex wiring')
write(p,s)

# 3) Permanent regression: in the planned first cycle, a child must not receive the same
# representation + normalized prompt template twice. Practice still tests the same concept,
# but it must arrive as a clearly new example.
test=r'''import assert from 'node:assert/strict';
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
'''
write(Path('tests/practice-variation.test.mjs'),test)

# 4) Version/test/cache/docs.
p=Path('package.json'); data=json.loads(read(p)); data['version']='1.5.4'
base=data['scripts']['test']
if 'practice-variation.test.mjs' not in base:
    data['scripts']['test']=base.replace('node tests/child-copy.test.mjs','node tests/practice-variation.test.mjs && node tests/child-copy.test.mjs')
write(p,json.dumps(data,ensure_ascii=False,indent=2)+'\n')

p=Path('sw.js'); s=read(p); s=s.replace('saymera-v1-5-3-child-copy-polish','saymera-v1-5-4-practice-variation'); write(p,s)

p=Path('TASK_MIGRATION_MATRIX.md'); s=read(p); s=s.replace('# SAYMERA v1.5.2 — Görev Motoru Geçiş Matrisi','# SAYMERA v1.5.4 — Görev Motoru Geçiş Matrisi'); write(p,s)
p=Path('P2_PEDAGOGY_AUDIT.md'); s=read(p); s=s.replace('# SAYMERA — Singapore P2 Pedagogy Audit (v1.5.2)','# SAYMERA — Singapore P2 Pedagogy Audit (v1.5.4)')
needle='- Aynı tam görev çekirdek döngü içinde tekrar edemez.\n'
addition='- Aynı tam görev çekirdek döngü içinde tekrar edemez.\n- İlk döngüde aynı temsilin pekiştirmesi gerektiğinde, çocuk aynı normalize edilmiş soru kalıbını yeniden görmez; yeni örnek açıkça farklı yüzey diliyle sunulur.\n'
if needle not in s: raise SystemExit('P2_PEDAGOGY_AUDIT repeat invariant anchor missing')
s=s.replace(needle,addition,1); write(p,s)

practice_doc='''# SAYMERA v1.5.4 — Practice Variation Reference\n\nAmaç: pekiştirmeyi kaldırmadan çocuğun aynı soruyu tekrar tekrar görüyormuş gibi hissetmesini engellemek.\n\n## Karar\n\nİlk öğrenme döngüsünde model → temsil → sembol → gerekçe → bağlam akışı korunur. Pekiştirme hâlâ yeni kavram örnekleriyle `symbol` ve `transfer` başta olmak üzere gerektiğinde 2–4 göreve uzayabilir. Bu pedagojik tekrar kasıtlıdır; aynı *tam görev* veya aynı *çocuk yüzeyi soru kalıbı* değildir.\n\n- Fresh concept üretimi korunur.\n- Uygulamadaki exact-repeat guard korunur.\n- Practice görevleri `practiceIndex` ile çocuk dilinde yeni örnek olarak varyantlanır.\n- Kesirlerde yalnız ön ek eklemekle yetinilmez; `fractionMeaning2`, `fractionNotation2`, `fractionCompare2` ve `fractionAddSub2` için sembol ve transfer pekiştirmelerinde ayrı soru cümleleri kullanılır.\n- Kalıcı `practice-variation.test.mjs`, 44 P1/P2 referans becerinin ilk döngüsünde aynı temsil + normalize edilmiş prompt kalıbının ikinci kez görünmesini engeller.\n\n## Kesir gösteriminin öğretildiği yer\n\n`fractionMeaning2` yalnız bütün ve eş parça anlamını kurar; çocuk `1/2` gibi gösterimleri biliyor kabul edilmez. `fractionNotation2` içinde önce **Gör / representation** aşamasında `n/d` gösterimi açıkça öğretilir (alt sayı = toplam eş parça, üst sayı = seçilen parça). Bunun ardından **Yaz / symbol** aşamasında çocuk modelden kesir gösterimini üretir/seçer.\n\nBu sıra regressions testleriyle korunur.\n'''
write(Path('PRACTICE_VARIATION_REFERENCE.md'),practice_doc)

print('SAYMERA v1.5.4 practice variation staged')
