from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]

def replace_once(path, old, new):
    p = ROOT / path
    text = p.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Expected pattern not found in {path}: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")

def append_once(path, marker, block):
    p = ROOT / path
    text = p.read_text(encoding="utf-8")
    if marker in text:
        return
    p.write_text(text.rstrip() + "\n\n" + block.strip() + "\n", encoding="utf-8")

replace_once(
    "engine.mjs",
    "export function supportsLearningCycle(skillId){ return LEARNING_CYCLE_READY_SKILLS.has(skillId); }\n\nexport const PROFILE_META",
    '''export function supportsLearningCycle(skillId){ return LEARNING_CYCLE_READY_SKILLS.has(skillId); }

const CURRICULUM_SEQUENCED_PROFILES = new Set(['grade1','grade2']);
export function curriculumSequenceFor(profile){
  if(!CURRICULUM_SEQUENCED_PROFILES.has(profile)) return [];
  return skillsFor(profile).filter(s=>supportsLearningCycle(s.id));
}
export function currentCurriculumSkill(state){
  const sequence=curriculumSequenceFor(state?.profile);
  for(const skillObj of sequence){
    const ss=ensureSkillState(state,skillObj.id);
    if(!(ss.learningCycle?.firstCycleCompletedAt||0)) return skillObj;
  }
  return null;
}
export function curriculumSkillUnlocked(state,skillId){
  const sequence=curriculumSequenceFor(state?.profile);
  if(!sequence.length) return true;
  const targetIndex=sequence.findIndex(s=>s.id===skillId);
  if(targetIndex<0) return true;
  const current=currentCurriculumSkill(state);
  if(!current) return true;
  const currentIndex=sequence.findIndex(s=>s.id===current.id);
  return targetIndex<=currentIndex;
}

export const PROFILE_META'''
)

replace_once(
    "engine.mjs",
    '''  if(due){
    const s=candidates.find(x=>x.id===due.skillId);
    if(s) return {skill:s, representation:due.representation || recommendedRepresentation(ensureSkillState(state,s.id)), reviewItem:due};
  }
  const ready=candidates.filter(s=>prerequisitesReady(state,s));''',
    '''  if(due){
    const s=candidates.find(x=>x.id===due.skillId);
    if(s && curriculumSkillUnlocked(state,s.id)) return {skill:s, representation:due.representation || recommendedRepresentation(ensureSkillState(state,s.id)), reviewItem:due};
  }
  const curriculumCurrent=currentCurriculumSkill(state);
  if(curriculumCurrent){
    const ss=ensureSkillState(state,curriculumCurrent.id);
    return {skill:curriculumCurrent,representation:recommendedRepresentation(ss),reviewItem:null};
  }
  const ready=candidates.filter(s=>prerequisitesReady(state,s));'''
)

replace_once(
    "app.js",
    "profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan, evaluatePracticeCheckpoint, classifyFractionPaint",
    "profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan, evaluatePracticeCheckpoint, classifyFractionPaint, currentCurriculumSkill, curriculumSkillUnlocked"
)

replace_once(
    "app.js",
    "const accentTint={amber:'#fff2c9',blue:'#e6f2fa',violet:'#eee9fa',green:'#e6f4ef',rose:'#fbe9e5',teal:'#e2f3ef',navy:'#e6edf1'};",
    '''const P2_LESSON_BLUEPRINTS={
  number1000:{headline:'Sayıları basamaklarına ayıralım.',lead:'Bir rakamın değeri bulunduğu yere göre değişir. Yüzlük, onluk ve birlikleri birlikte kuracağız.',model:[['3','yüzlük','300'],['4','onluk','40'],['7','birlik','7']],takeaway:'347 = 300 + 40 + 7'},
  compareOrder1000:{headline:'Büyük sayıları soldan karşılaştır.',lead:'Önce yüzlüklere bak. Eşitse onlukları, onlar da eşitse birlikleri karşılaştır.',takeaway:'En büyük basamak farkı kararı verir.'},
  numberPattern1000:{headline:'Değişimin hangi basamakta olduğunu gör.',lead:'1 eklemek birlikleri, 10 eklemek onlukları, 100 eklemek yüzlükleri değiştirir.',takeaway:'Örüntünün adımını bul, sonra aynı değişimi sürdür.'},
  oddEven1000:{headline:'İkişerli eşleştir ve son basamağa bak.',lead:'Bir sayı ikişerli gruplara artıksız ayrılıyorsa çifttir. Bunu birlikler basamağından anlayabiliriz.',takeaway:'0, 2, 4, 6, 8 ile biten sayılar çifttir.'},
  addSub1000:{headline:'Basamak değerini koruyarak işlem yap.',lead:'Birlikleri birliklerle, onlukları onluklarla, yüzlükleri yüzlüklerle birleştirir veya ayırırız.',takeaway:'10 birlik 1 onluk; 10 onluk 1 yüzlük olarak yeniden gruplanabilir.'},
  wordAddSub2:{headline:'Önce hikâyeyi modele dönüştür.',lead:'Problemde neyin başlangıç, değişim ve sonuç olduğunu ayır. Sonra hangi işlemlerin gerektiğini sırala.',takeaway:'İşlemi metindeki kelimeye değil, miktarlar arasındaki ilişkiye göre seç.'},
  times23510:{headline:'Çarpma eşit grupları hızlı sayar.',lead:'Aynı büyüklükte grupları tekrar tekrar toplamak yerine çarpma kullanabiliriz.',takeaway:'4 grup 3 nesne = 3 + 3 + 3 + 3 = 4 × 3.'},
  divisionTables2:{headline:'Bölme eşit paylaşma veya eşit gruplamadır.',lead:'Bir miktarı eşit paylaştırabilir ya da kaç eşit grup oluştuğunu bulabiliriz.',takeaway:'÷ işareti eşit paylaşma ve gruplama düşüncesini sembolleştirir.'},
  multDivFamilies2:{headline:'Çarpma ve bölme birbirini geri alır.',lead:'Aynı üç sayı iki çarpma ve iki bölme cümlesi oluşturabilir.',takeaway:'3 × 4 = 12 ise 12 ÷ 4 = 3 ve 12 ÷ 3 = 4.'},
  fractionMeaning2:{headline:'Kesirden önce eş parçayı kur.',lead:'Bir bütün ancak eş büyüklükte parçalara ayrıldığında bu parçaları kesir olarak anlamlandırabiliriz.',takeaway:'Önce bütün ve eş parçalar; sembol daha sonra.'},
  fractionNotation2:{headline:'Kesir sembolündeki iki sayı farklı şey anlatır.',lead:'Alttaki sayı bütünün kaç eş parçaya ayrıldığını, üstteki sayı kaç parçanın seçildiğini gösterir.',takeaway:'4 eş parçadan 2’si = 2/4.'},
  fractionCompare2:{headline:'Aynı büyüklükteki parçaları karşılaştır.',lead:'Paydalar aynıysa parçaların büyüklüğü aynıdır; daha çok parça seçilen kesir daha büyüktür. Birim kesirlerde bütün daha çok parçaya ayrıldıkça tek parça küçülür.',takeaway:'Önce parçaların gerçekten karşılaştırılabilir olduğundan emin ol.'},
  fractionAddSub2:{headline:'Eş büyüklükte parçaları birleştir veya ayır.',lead:'Paydalar aynıysa parça büyüklüğü değişmez; seçilen parça sayısı değişir.',takeaway:'2/7 + 3/7 = 5/7.'},
  lengthMetre2:{headline:'Uzun mesafeler için metreyi kullan.',lead:'Nesnenin veya mesafenin büyüklüğüne uygun ölçü birimini seçmek ölçmenin bir parçasıdır.',takeaway:'Önce uygun birimi seç, sonra ölçüleri karşılaştır.'},
  massMetric2:{headline:'Kütleyi gram ve kilogramla düşün.',lead:'Hafif nesnelerde gram, daha ağır nesnelerde kilogram uygun olabilir.',takeaway:'Sayı kadar kullanılan birim de anlam taşır.'},
  volumeLitre2:{headline:'Kabın ne kadar sıvı alabileceğini düşün.',lead:'Sıvı hacmini litre ile ölçebilir, miktarları karşılaştırıp sıralayabiliriz.',takeaway:'Karşılaştırırken aynı tür ölçüye ve birime bak.'},
  timeMinute2:{headline:'Saatte iki ibre iki farklı işi yapar.',lead:'Kısa ibre saati, uzun ibre dakikayı gösterir. Dakikayı tam olarak okumayı öğreneceğiz.',takeaway:'Dakika ibresinin her küçük adımı 1 dakikadır.'},
  timeDuration2:{headline:'Saat kaç ile ne kadar sürdü farklı sorulardır.',lead:'Başlangıç ve bitiş arasındaki süreyi saat ve dakika olarak bulabiliriz.',takeaway:'1 saat = 60 dakika ilişkisi süreyi dönüştürmemize yardım eder.'},
  moneyP2:{headline:'Para miktarını TL ve kuruşla kur.',lead:'Aynı para miktarı TL–kuruş biçiminde veya ondalık gösterimle ifade edilebilir.',takeaway:'1 TL = 100 kuruş.'},
  shapePatterns2:{headline:'Örüntüde değişen özelliği bul.',lead:'Şekil, renk, boyut veya yön belli bir kurala göre tekrar edebilir.',takeaway:'Kuralı söyleyebiliyorsan sıradaki şekli de kurabilirsin.'},
  solids2:{headline:'3B cisimleri özelliklerine göre ayır.',lead:'Küp, dikdörtgen prizma, koni, silindir ve küreyi yüzeyleri ve biçimleriyle tanıyacağız.',takeaway:'Adından önce cismin hangi özelliklere sahip olduğuna bak.'},
  pictureGraphScale2:{headline:'Bir resim her zaman bir tane demek değildir.',lead:'Ölçekli resimli grafikte önce anahtarı oku; bir simgenin kaç nesneyi temsil ettiğini bul.',takeaway:'Grafiği okumadan önce ölçeği oku.'}
};
function lessonBlueprintFor(skill){
  return P2_LESSON_BLUEPRINTS[skill.id]||{
    headline:`${skill.label} konusunu birlikte keşfedelim.`,
    lead:'Önce modeli inceleyecek, sonra birlikte deneyecek ve en son kendi başına uygulayacaksın.',
    takeaway:'Amaç yalnız doğru cevabı bulmak değil, nedenini görebilmek.'
  };
}

const accentTint={amber:'#fff2c9',blue:'#e6f2fa',violet:'#eee9fa',green:'#e6f4ef',rose:'#fbe9e5',teal:'#e2f3ef',navy:'#e6edf1'};'''
)

replace_once(
    "app.js",
    '''function pickFocus(){
  const all=skillsFor(state.profile).map(skill=>({skill,state:ensureSkillState(state,skill.id)}));''',
    '''function pickFocus(){
  const curriculumCurrent=currentCurriculumSkill(state);
  if(curriculumCurrent) return {skill:curriculumCurrent,state:ensureSkillState(state,curriculumCurrent.id)};
  const all=skillsFor(state.profile).map(skill=>({skill,state:ensureSkillState(state,skill.id)}));'''
)

replace_once(
    "app.js",
    "const preview=skillsFor(state.profile).map(skill=>({skill,ss:ensureSkillState(state,skill.id),ready:prerequisitesReady(state,skill)}))",
    "const preview=skillsFor(state.profile).map(skill=>({skill,ss:ensureSkillState(state,skill.id),ready:prerequisitesReady(state,skill)&&curriculumSkillUnlocked(state,skill.id)}))"
)

replace_once(
    "app.js",
    "const ss=ensureSkillState(state,skill.id), pct=masteryPercent(ss), ready=prerequisitesReady(state,skill);",
    "const ss=ensureSkillState(state,skill.id), pct=masteryPercent(ss), ready=prerequisitesReady(state,skill)&&curriculumSkillUnlocked(state,skill.id);"
)

replace_once(
    "app.js",
    '''  if(supportsLearningCycle(focus.skill.id)){
    buildLearningCyclePlan(focus.state).forEach(item=>plan.push({''',
    '''  if(supportsLearningCycle(focus.skill.id)){
    if(!focus.state.learningCycle?.firstCycleCompletedAt){
      plan.push({
        skillId:focus.skill.id,
        representation:null,
        phase:null,
        reviewItem:null,
        kind:'lesson-intro',
        activityMode:'teach',
        conceptScope:'fresh',
        countsTowardEvidence:false
      });
    }
    buildLearningCyclePlan(focus.state).forEach(item=>plan.push({'''
)

replace_once(
    "app.js",
    '''  currentSelection.skill=skill;
  const fresh=currentSelection.conceptScope==='fresh';''',
    '''  currentSelection.skill=skill;
  if(currentSelection.kind==='lesson-intro'){
    answered=false; usedHint=false;
    renderLessonIntro(skill);
    return;
  }
  const fresh=currentSelection.conceptScope==='fresh';'''
)

replace_once(
    "app.js",
    '''function renderQuestion(){
  const q=currentQuestion, s=currentSelection.skill, rep=q.representation;
  const total=session.plan.length;
  $('#practiceLens').textContent=s.family.toUpperCase();
  $('#practiceTitle').textContent=s.label;
  $('#practiceCounter').textContent=`${Math.min(session.planIndex+1,total)} / ${total}`;
  $('#practiceProgress').style.width=`${Math.round(session.planIndex/Math.max(1,total)*100)}%`;
  $('#practiceContent').innerHTML=`''',
    '''function practiceActivityMeta(selection=currentSelection){
  if(selection?.kind==='lesson-intro') return {label:'KONUYA GİRİŞ',mode:'teach'};
  if(selection?.phase==='readiness') return {label:'ÖN BİLGİ',mode:'check'};
  if(['model','representation','symbol','reasoning'].includes(selection?.phase)) return {label:'BİRLİKTE DENE',mode:'guided'};
  if(selection?.phase==='retrieval'||selection?.kind==='retention') return {label:'KISA TEKRAR',mode:'review'};
  return {label:'KENDİN DENE',mode:'check'};
}
function renderPracticeHeader(skill){
  const total=session?.plan?.length||1;
  const activity=practiceActivityMeta();
  $('#practiceLens').textContent=`${PROFILE_META[state.profile].label.toUpperCase()} • ${skill.family.toUpperCase()}`;
  $('#practiceTitle').textContent=skill.label;
  $('#practiceMode').textContent=activity.label;
  $('#practiceMode').dataset.mode=activity.mode;
  $('#practiceCounter').textContent=`${Math.min(session.planIndex+1,total)} / ${total}`;
  $('#practiceProgress').style.width=`${Math.round(session.planIndex/Math.max(1,total)*100)}%`;
}
function renderLessonIntro(skill){
  currentQuestion=null;
  renderPracticeHeader(skill);
  const bp=lessonBlueprintFor(skill);
  const model=bp.model?.length?`<div class="lesson-model-row">${bp.model.map(([n,label,value])=>`<div class="lesson-model-card"><strong>${esc(n)}</strong><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join('')}</div>`:'';
  $('#practiceContent').innerHTML=`
    <div class="lesson-intro-stage">
      <span class="lesson-kicker">BUGÜNKÜ FİKİR</span>
      <h2>${esc(bp.headline)}</h2>
      <p>${esc(bp.lead)}</p>
      ${model}
      <div class="lesson-takeaway"><span>AKLINDA KALSIN</span><strong>${esc(bp.takeaway)}</strong></div>
      <button class="response-submit lesson-start-button" id="beginLessonActivity">Birlikte deneyelim <b>→</b></button>
    </div>`;
  $('#beginLessonActivity')?.addEventListener('click',()=>{
    session.planIndex++;
    loadPlanItem();
  });
}
function renderQuestion(){
  const q=currentQuestion, s=currentSelection.skill, rep=q.representation;
  renderPracticeHeader(s);
  $('#practiceContent').innerHTML=`'''
)

replace_once(
    "index.html",
    '''        <div class="practice-head-center">
          <div class="practice-title-line"><span id="practiceLens">MATEMATİK</span><b id="practiceTitle">Kavram keşfi</b><em id="practiceCounter">1 / 1</em></div>
          <div class="progress-track"><i id="practiceProgress"></i></div>
        </div>''',
    '''        <div class="practice-head-center">
          <div class="practice-topic-line">
            <div class="practice-topic-copy"><span id="practiceLens">2. SINIF • MATEMATİK</span><h1 id="practiceTitle">Kavram keşfi</h1></div>
            <div class="practice-session-meta"><span class="practice-mode" id="practiceMode" data-mode="teach">KONUYA GİRİŞ</span><em id="practiceCounter">1 / 1</em></div>
          </div>
          <div class="progress-track"><i id="practiceProgress"></i></div>
        </div>'''
)
replace_once(
    "index.html",
    '<button data-profile="grade2"><span>7–8</span><b>2. sınıf</b><small>100 içinde sayı · çarpma · ölçme · zaman</small></button>',
    '<button data-profile="grade2"><span>7–8</span><b>2. sınıf</b><small>1000’e kadar sayı · işlemler · kesir · ölçme</small></button>'
)

css_block = r'''
/* v1.6.0 — curriculum-led lesson shell + tablet viewport contract */
.practice-shell{height:100dvh;max-height:100dvh;overflow:hidden}
.practice-header{min-height:78px;grid-template-columns:52px minmax(0,760px) 52px;padding:9px 20px}
.practice-topic-line{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;margin-bottom:7px}
.practice-topic-copy{min-width:0;display:grid;gap:2px}
.practice-topic-copy>span{font-size:8px;font-weight:950;letter-spacing:.13em;color:var(--teal);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.practice-topic-copy h1{font-size:16px;line-height:1.12;letter-spacing:-.025em;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.practice-session-meta{display:flex;align-items:center;gap:9px}.practice-session-meta em{font-style:normal;font-size:9px;color:var(--muted);font-weight:850;white-space:nowrap}
.practice-mode{height:28px;display:inline-flex;align-items:center;padding:0 9px;border-radius:999px;font-size:8px;font-weight:950;letter-spacing:.08em;white-space:nowrap;background:var(--navy-soft);color:var(--navy)}
.practice-mode[data-mode="teach"]{background:var(--sun-soft);color:#7d5f18}.practice-mode[data-mode="guided"]{background:var(--teal-soft);color:#237b6c}.practice-mode[data-mode="review"]{background:var(--violet-soft);color:#6253ad}
.practice-content{min-height:0;overflow:hidden;padding:clamp(10px,2vh,22px) 20px clamp(10px,2vh,22px);display:grid}
.question-stage{height:100%;min-height:0;max-height:100%;gap:clamp(7px,1.2vh,13px);grid-template-rows:auto minmax(0,1fr) auto auto;align-content:stretch}
.question-stage h2{font-size:clamp(24px,3.7vh,36px);line-height:1.08}
.visual-stage{min-height:0;height:100%;max-height:34vh;padding:clamp(12px,2vh,24px)}
.question-tools{min-height:38px}.tool-button{min-height:38px}
.lesson-intro-stage{width:min(860px,100%);height:100%;min-height:0;margin:0 auto;display:grid;grid-template-rows:auto auto auto minmax(0,1fr) auto auto;align-content:center;justify-items:center;gap:clamp(8px,1.7vh,18px);text-align:center;padding:clamp(8px,1.6vh,18px)}
.lesson-kicker{font-size:9px;font-weight:950;letter-spacing:.16em;color:var(--teal)}
.lesson-intro-stage h2{font-size:clamp(30px,5vh,50px);line-height:1.02;letter-spacing:-.045em;margin:0;max-width:760px}
.lesson-intro-stage>p{font-size:clamp(12px,1.8vh,16px);line-height:1.5;color:var(--muted);max-width:720px;margin:0}
.lesson-model-row{align-self:center;display:grid;grid-template-columns:repeat(3,minmax(120px,170px));gap:12px;max-width:560px;width:100%}
.lesson-model-card{min-height:112px;border-radius:24px;background:var(--paper);border:1px solid var(--line);box-shadow:var(--shadow-soft);display:grid;place-items:center;align-content:center;gap:2px;padding:12px}
.lesson-model-card strong{font-size:34px;line-height:1;color:var(--navy)}.lesson-model-card span{font-size:10px;color:var(--muted);font-weight:850}.lesson-model-card b{font-size:16px;margin-top:5px}
.lesson-takeaway{width:min(650px,100%);display:grid;gap:4px;padding:13px 16px;border-radius:18px;background:var(--sun-soft);border:1px solid #ead79e}.lesson-takeaway span{font-size:8px;font-weight:950;letter-spacing:.13em;color:#8a6c28}.lesson-takeaway strong{font-size:13px;line-height:1.35}
.lesson-start-button{min-width:240px;min-height:52px}.lesson-start-button b{margin-left:8px}
@media (min-width:700px) and (max-height:1024px){
  .practice-content{padding:10px 18px 12px}
  .question-stage{width:min(900px,100%);gap:8px}
  .question-stage h2{font-size:clamp(23px,3.5vh,34px)}
  .visual-stage{max-height:32vh;border-radius:26px}
  .answer-button{min-height:58px;padding:10px 16px}
  .visual-answer{min-height:132px;padding:9px}.visual-option-body{min-height:104px}
  .number-response{width:min(760px,100%);grid-template-columns:minmax(220px,.9fr) minmax(300px,1.1fr);grid-template-rows:auto auto;gap:8px}
  .number-entry{grid-column:1;grid-row:1;height:68px;padding:0 14px}.number-entry input{height:46px;font-size:25px}
  .number-keypad{grid-column:2;grid-row:1/3;gap:6px}.number-keypad button{height:38px}
  .number-response>.response-submit{grid-column:1;grid-row:2;min-height:46px}
  .manipulative-response{min-height:50px}.manipulator-status{min-height:50px}.manipulative-response .response-submit{min-height:50px}
}
@media (max-width:699px){
  .practice-shell{min-height:100dvh}
  .practice-content{overflow:auto;display:block}
  .question-stage{height:auto}
  .practice-topic-line{gap:7px}.practice-topic-copy h1{font-size:13px}.practice-mode{display:none}
  .lesson-intro-stage{height:auto;min-height:calc(100dvh - 110px);display:flex;flex-direction:column;justify-content:center}
  .lesson-model-row{grid-template-columns:repeat(3,1fr);gap:7px}.lesson-model-card{min-height:88px;border-radius:18px}.lesson-model-card strong{font-size:28px}
}
'''
append_once("styles.css", "v1.6.0 — curriculum-led lesson shell", css_block)

test_content = r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  defaultState,ensureSkillState,skillsFor,
  curriculumSequenceFor,currentCurriculumSkill,curriculumSkillUnlocked
} from '../engine.mjs';

const expectedP2=[
  'number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2',
  'times23510','divisionTables2','multDivFamilies2',
  'fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2',
  'lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2',
  'shapePatterns2','solids2','pictureGraphScale2'
];
assert.deepEqual(curriculumSequenceFor('grade2').map(s=>s.id),expectedP2);
assert.equal(curriculumSequenceFor('preschool').length,0);

const state=defaultState();
state.profile='grade2';
skillsFor('grade2').forEach(s=>ensureSkillState(state,s.id));
assert.equal(currentCurriculumSkill(state)?.id,'number1000','P2 must start with number1000');
assert.equal(curriculumSkillUnlocked(state,'number1000'),true);
assert.equal(curriculumSkillUnlocked(state,'times23510'),false,'later no-prerequisite topic must still be curriculum-locked');
assert.equal(curriculumSkillUnlocked(state,'fractionMeaning2'),false,'fractions cannot jump ahead');

ensureSkillState(state,'number1000').learningCycle.firstCycleCompletedAt=1;
assert.equal(currentCurriculumSkill(state)?.id,'compareOrder1000');
assert.equal(curriculumSkillUnlocked(state,'number1000'),true,'completed earlier topic remains available for review');
assert.equal(curriculumSkillUnlocked(state,'compareOrder1000'),true);
assert.equal(curriculumSkillUnlocked(state,'numberPattern1000'),false);

for(const id of expectedP2.slice(0,9)) ensureSkillState(state,id).learningCycle.firstCycleCompletedAt=1;
assert.equal(currentCurriculumSkill(state)?.id,'fractionMeaning2','fractions open only after preceding P2 sequence');

for(const id of expectedP2) ensureSkillState(state,id).learningCycle.firstCycleCompletedAt=1;
assert.equal(currentCurriculumSkill(state),null,'after first-pass curriculum completion there is no locked new topic');
assert.equal(curriculumSkillUnlocked(state,'pictureGraphScale2'),true);

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');

assert.match(app,/kind:'lesson-intro'/,'first-cycle plan must contain a non-question lesson introduction');
assert.match(app,/P2_LESSON_BLUEPRINTS/,'P2 lesson teaching blueprints must exist');
assert.match(app,/renderLessonIntro/,'lesson introduction must render separately from question rendering');
assert.match(app,/currentCurriculumSkill\(state\)/,'UI focus must use curriculum sequencer');
assert.match(html,/id="practiceMode"/,'practice header must show activity mode');
assert.match(html,/class="practice-topic-copy"/,'practice header must expose a clear topic title');
assert.match(css,/\.practice-shell\{height:100dvh;max-height:100dvh;overflow:hidden\}/,'tablet practice shell must be viewport-bound');
assert.match(css,/@media \(min-width:700px\) and \(max-height:1024px\)/,'tablet-specific compact layout is required');
assert.match(css,/\.practice-content\{min-height:0;overflow:hidden/,'tablet lesson content must not vertically scroll by default');

console.log('curriculum lesson shell tests: PASS (ordered new learning + lesson intro + tablet viewport contract)');
'''
(ROOT/"tests"/"curriculum-lesson-shell.test.mjs").write_text(test_content,encoding="utf-8")

doc = r'''# SAYMERA v1.6 — Curriculum-led Lesson Mode

## Product rule

For Primary 1 and Primary 2, **new learning follows the curriculum sequence**. Adaptation may change support, representation, difficulty and review timing, but it may not jump to a later new topic.

A previously learned topic may reappear as a delayed review. This does not unlock a later topic early.

## Topic gate

A topic becomes the current new-learning topic when every earlier topic in the ordered reference sequence has completed its first learning cycle (`firstCycleCompletedAt`).

This is intentionally different from "mastery": delayed retrieval and later consolidation can continue after the next curriculum topic opens.

## Lesson, not quiz

The first cycle begins with a non-graded `lesson-intro` activity. The practice header labels the current activity as:

- `KONUYA GİRİŞ`
- `ÖN BİLGİ`
- `BİRLİKTE DENE`
- `KENDİN DENE`
- `KISA TEKRAR`

P2 topics have short teaching blueprints. `number1000` is the first reference lesson and explicitly introduces hundreds, tens and ones before independent checking.

## Child orientation

The practice header always exposes:

**class + domain → current topic → current activity → progress**

The child should never need to infer what topic is being learned from the question alone.

## Tablet viewport contract

At tablet widths (`>=700px`) the active lesson shell is bound to `100dvh` and does not use vertical page scrolling. The central visual/task area flexes to the remaining height; dense number-input controls use a compact two-column layout.

Phones may scroll when necessary. Browser/device runtime verification remains separate from the static contract.
'''
(ROOT/"CURRICULUM_LESSON_MODE_V1_6.md").write_text(doc,encoding="utf-8")

pkg_path=ROOT/"package.json"
pkg=json.loads(pkg_path.read_text(encoding="utf-8"))
pkg["version"]="1.6.0"
test_cmd=pkg["scripts"]["test"]
needle="node tests/fraction-paint.test.mjs"
if "curriculum-lesson-shell.test.mjs" not in test_cmd:
    test_cmd=test_cmd.replace(needle,needle+" && node tests/curriculum-lesson-shell.test.mjs")
pkg["scripts"]["test"]=test_cmd
pkg_path.write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

replace_once("sw.js","saymera-v1-5-5-fraction-paint","saymera-v1-6-0-curriculum-lessons")

for rel in [".maintenance/v1.6.0/apply.py",".github/workflows/apply-v1-6-0.yml"]:
    p=ROOT/rel
    if p.exists():
        p.unlink()
