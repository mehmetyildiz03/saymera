import {
  REPRESENTATIONS, REPRESENTATION_META, PROFILE_META, skillsFor, defaultState, ensureSkillState,
  masteryPercent, evidenceCoverage, generateQuestion, generateLearningQuestion, createConceptInstance, applyAnswer, consumeReview,
  profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan, evaluatePracticeCheckpoint, classifyFractionPaint, currentCurriculumSkill, curriculumSkillUnlocked
} from './engine.mjs';

const STORAGE_KEY='saymera.math.v2';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

const repDescriptions={
  build:'Bir model kur.',
  see:'Doğru olanı bul.',
  symbol:'Sayı ve işaretleri kullan.',
  explain:'Nedenini seç.',
  transfer:'Yeni soruda kullan.'
};
const repReasons={
  build:'Somut yapı henüz yeterince görünür değil.',
  see:'Görsel temsil bağlantısı güçlendirilebilir.',
  symbol:'Sembol ile anlam arasındaki bağ güçlendirilebilir.',
  explain:'Doğru işlemin nedenini açıklama kanıtı eksik.',
  transfer:'Kavramı yeni bir duruma taşıma kanıtı eksik.'
};
const P2_LESSON_BLUEPRINTS={
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
const NUMBER1000_LESSON_STEPS=[
  {id:'ten-bundle',moe:'1.1',kind:'bundle',unit:'one',title:'10 birlik, 1 onluk olur.',body:'Birlikleri tek tek sayabiliriz. 10 birlik olduğunda onları bir araya getirip 1 onluk olarak düşünürüz.',equation:'10 birlik = 1 onluk',resultValue:'10',resultLabel:'1 onluk'},
  {id:'hundred-bundle',moe:'1.1',kind:'bundle',unit:'ten',title:'10 onluk, 1 yüzlük olur.',body:'Onlukları da gruplarız. 10 tane onluk bir araya geldiğinde 100 eder; yani 1 yüzlük oluşur.',equation:'10 onluk = 1 yüzlük',resultValue:'100',resultLabel:'1 yüzlük'},
  {id:'thousand-bundle',moe:'1.1',kind:'bundle',unit:'hundred',title:'10 yüzlük, 1000 eder.',body:'Aynı yapı bir kez daha büyür. 10 yüzlük bir araya geldiğinde 1000 olur.',equation:'10 yüzlük = 1000',resultValue:'1000',resultLabel:'1000'},
  {id:'place-value',moe:'1.2',kind:'place',title:'Yüzlük, onluk ve birliği aynı sayıda görelim.',body:'347 sayısındaki her rakam bulunduğu basamağa göre farklı bir değer taşır.',number:'347',values:[['3','Yüzlük','300'],['4','Onluk','40'],['7','Birlik','7']],equation:'347 = 300 + 40 + 7'},
  {id:'same-digit',moe:'1.2',kind:'place',title:'Aynı rakam, farklı yerde farklı değer taşır.',body:'444 sayısında üç tane 4 görürüz; ama üçü aynı değerde değildir.',number:'444',values:[['4','Yüzlük','400'],['4','Onluk','40'],['4','Birlik','4']],equation:'444 = 400 + 40 + 4'},
  {id:'read-write',moe:'1.3',kind:'read-write',title:'Sayıyı hem rakamla hem sözcükle okuyabiliriz.',body:'Basamakları soldan sağa okuyunca sayı sözcükleri oluşur.',number:'347',words:'üç yüz kırk yedi',equation:'347 ↔ üç yüz kırk yedi'}
];
function number1000LessonStepVisual(step){
  if(step.kind==='bundle'){
    const cls=step.unit==='one'?'lesson-unit-one':step.unit==='ten'?'lesson-unit-ten':'lesson-unit-hundred';
    const tokens=Array.from({length:10},()=>'<i class="'+cls+'" aria-hidden="true"></i>').join('');
    return '<div class="lesson-bundle-demo" data-unit="'+esc(step.unit)+'"><div class="lesson-bundle-source">'+tokens+'</div><div class="lesson-bundle-arrow" aria-hidden="true">→</div><div class="lesson-bundle-result" id="lessonBundleResult"><span>?</span><b>'+esc(step.resultLabel)+'</b></div></div>';
  }
  if(step.kind==='place') return '<div class="lesson-place-demo"><div class="lesson-big-number">'+esc(step.number)+'</div><div class="lesson-place-grid">'+step.values.map(([digit,label,value],i)=>'<button type="button" class="lesson-place-card" data-place-index="'+i+'" data-place-value="'+esc(value)+'"><strong>'+esc(digit)+'</strong><span>'+esc(label)+'</span><b>dokun</b></button>').join('')+'</div><div class="lesson-place-explain" id="lessonPlaceExplain">Her rakama dokunup değerini gör.</div></div>';
  return '<div class="lesson-read-demo"><strong>'+esc(step.number)+'</strong><div class="lesson-read-arrow" aria-hidden="true">↔</div><span id="lessonWords">?</span></div>';
}
function completeNumber1000LessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id), lc=ss.learningCycle, next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);
  if(next>=NUMBER1000_LESSON_STEPS.length){ lc.lessonTaughtAt=Date.now(); saveState(); session.planIndex++; loadPlanItem(); return; }
  saveState(); session.lessonStepIndex=next; renderNumber1000LessonStep(skill,next);
}
function renderNumber1000LessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(NUMBER1000_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?saved:index, step=NUMBER1000_LESSON_STEPS[at];
  session.lessonStepIndex=at; currentQuestion=null; renderPracticeHeader(skill);
  $('#practiceMode').textContent='KONU ANLATIMI'; $('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=(at+1)+' / '+NUMBER1000_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/NUMBER1000_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="lesson-step-stage" data-lesson-step="'+esc(step.id)+'"><div class="lesson-step-copy"><span class="lesson-kicker">SINGAPUR P2 · '+esc(step.moe)+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="lesson-step-visual">'+number1000LessonStepVisual(step)+'</div><div class="lesson-step-takeaway"><span>BAĞLANTI</span><strong>'+esc(step.equation)+'</strong></div><div class="lesson-step-actions"><button type="button" class="soft-button lesson-action-button" id="lessonStepAction">'+(step.kind==='bundle'?'Birleştir':step.kind==='read-write'?'Okunuşunu göster':'Değerleri keşfet')+'</button><button type="button" class="response-submit lesson-next-button" id="lessonStepNext" disabled>'+(at===NUMBER1000_LESSON_STEPS.length-1?'Birlikte deneyelim':'Sonraki adım')+' <b>→</b></button></div></div>';
  const next=$('#lessonStepNext'), action=$('#lessonStepAction');
  if(step.kind==='bundle') action?.addEventListener('click',()=>{ $('.lesson-bundle-demo')?.classList.add('bundled'); $('#lessonBundleResult span').textContent=step.resultValue; action.disabled=true; action.textContent='Birleştirildi ✓'; next.disabled=false; });
  else if(step.kind==='place'){
    const seen=new Set();
    $('.lesson-place-card').forEach(btn=>btn.addEventListener('click',()=>{ const i=Number(btn.dataset.placeIndex); seen.add(i); btn.classList.add('revealed'); btn.querySelector('b').textContent=btn.dataset.placeValue; const [digit,label,value]=step.values[i]; $('#lessonPlaceExplain').textContent=digit+', '+label.toLocaleLowerCase('tr-TR')+' basamağında '+value+' değerindedir.'; action.disabled=true; action.textContent='Kartlara dokun'; if(seen.size===step.values.length) next.disabled=false; }));
    action?.addEventListener('click',()=>showToast('Üç rakamın da üzerine dokun'));
  } else action?.addEventListener('click',()=>{ $('#lessonWords').textContent=step.words; $('.lesson-read-demo')?.classList.add('revealed'); action.disabled=true; action.textContent='Gösterildi ✓'; next.disabled=false; });
  next?.addEventListener('click',()=>completeNumber1000LessonStep(skill,at));
}
function lessonBlueprintFor(skill){
  return P2_LESSON_BLUEPRINTS[skill.id]||{
    headline:`${skill.label} konusunu birlikte keşfedelim.`,
    lead:'Önce modeli inceleyecek, sonra birlikte deneyecek ve en son kendi başına uygulayacaksın.',
    takeaway:'Amaç yalnız doğru cevabı bulmak değil, nedenini görebilmek.'
  };
}

const accentTint={amber:'#fff2c9',blue:'#e6f2fa',violet:'#eee9fa',green:'#e6f4ef',rose:'#fbe9e5',teal:'#e2f3ef',navy:'#e6edf1'};
const accentRing={amber:'#d9a12f',blue:'#4e8cc8',violet:'#8270ca',green:'#2f9987',rose:'#df7564',teal:'#2f9987',navy:'#19364b'};

let state=loadState();
let activeScreen='home';
let activeDomain='Tümü';
let session=null;
let currentQuestion=null;
let currentSelection=null;
let answered=false;
let usedHint=false;
let cooldownTimer=null;
let holdTimer=null;
let holdStartedAt=0;
let toastTimer=null;
let selectedOnboardingProfile=state.profile;

init();

function init(){
  bindNavigation();
  bindControls();
  normalizeState();
  renderAll();
  applyMotionSetting();
  registerSW();
  if(!state.onboarded) openOnboarding();
  if(state.cooldownUntil && state.cooldownUntil>Date.now()) showCooldown(false);
}

function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed=JSON.parse(raw);
    const base=defaultState();
    return {
      ...base,...parsed,
      settings:{...base.settings,...(parsed.settings||{})},
      totals:{...base.totals,...(parsed.totals||{})},
      skills:parsed.skills||{}, reviewQueue:parsed.reviewQueue||[], history:parsed.history||[], sessions:parsed.sessions||[]
    };
  }catch(err){ console.warn('SAYMERA state reset',err); return defaultState(); }
}
function normalizeState(){
  if(!PROFILE_META[state.profile]) state.profile='grade1';
  state.version=2;
  state.settings ||= defaultState().settings;
  state.reviewQueue ||= [];
  state.history ||= [];
  state.sessions ||= [];
  state.totals ||= defaultState().totals;
  skillsFor(state.profile).forEach(s=>ensureSkillState(state,s.id));
  saveState();
}
function saveState(){ try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }catch(err){ console.warn('SAYMERA save failed',err); } }
function showToast(message){
  const node=$('#toast'); if(!node) return;
  node.textContent=message; node.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove('show'),2200);
}

function bindNavigation(){
  $$('[data-nav]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.nav)));
  $('#profileChip').addEventListener('click',()=>openOnboarding(true));
  $('#bottomStart').addEventListener('click',startSession);
}
function navigate(name){
  const target=name==='map'?'atlas':name;
  activeScreen=target;
  $$('.screen').forEach(x=>x.classList.remove('active'));
  $(`#${target}Screen`)?.classList.add('active');
  $$('.bottom-nav [data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===target));
  if(target==='parent') renderParent();
  if(target==='atlas') renderAtlas();
  window.scrollTo({top:0,behavior:state.settings.calmMotion?'auto':'smooth'});
}

function bindControls(){
  $('#startSessionButton').addEventListener('click',startSession);
  $('#closePractice').addEventListener('click',()=>closePractice(true));
  $('#speakButton').addEventListener('click',speakCurrent);
  $('#onboardingContinue').addEventListener('click',completeOnboarding);
  $$('#onboardingLevels [data-profile]').forEach(btn=>btn.addEventListener('click',()=>selectOnboardingLevel(btn.dataset.profile)));
  $('#onboardingOverlay').addEventListener('click',e=>{ if(e.target===e.currentTarget && state.onboarded) closeOnboarding(); });
  $('#restHomeButton').addEventListener('click',()=>{ hideCooldown(); navigate('home'); });
  $('#parentSkipCooldown').addEventListener('click',()=>{ state.cooldownUntil=0; saveState(); hideCooldown(); renderAll(); showToast('Mola ebeveyn tarafından sonlandırıldı'); });
  $('#saveSettingsButton').addEventListener('click',saveSettingsFromUI);
  $('#resetButton').addEventListener('click',resetProgress);

  const adult=$('#adultButton');
  const beginHold=e=>{
    e.preventDefault(); holdStartedAt=Date.now(); adult.classList.add('holding');
    holdTimer=setTimeout(()=>{ adult.classList.remove('holding'); navigate('parent'); showToast('Ebeveyn alanı açıldı'); },1250);
  };
  const endHold=()=>{
    clearTimeout(holdTimer); adult.classList.remove('holding');
    if(Date.now()-holdStartedAt<1150) showToast('Ebeveyn alanı için biraz basılı tut');
  };
  adult.addEventListener('pointerdown',beginHold);
  adult.addEventListener('pointerup',endHold);
  adult.addEventListener('pointercancel',endHold);
  adult.addEventListener('pointerleave',()=>{ clearTimeout(holdTimer); adult.classList.remove('holding'); });
  adult.addEventListener('contextmenu',e=>e.preventDefault());
}

function openOnboarding(asSelector=false){
  selectedOnboardingProfile=state.profile;
  selectOnboardingLevel(selectedOnboardingProfile,false);
  const overlay=$('#onboardingOverlay');
  overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  const title=$('#onboardingTitle');
  if(asSelector && state.onboarded) title.textContent='Başlangıç içerik haritasını değiştir.';
  else title.textContent='Önce doğru başlangıç noktasını seçelim.';
}
function closeOnboarding(){
  if(!state.onboarded) return;
  const overlay=$('#onboardingOverlay'); overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow='';
}
function selectOnboardingLevel(profile,announce=true){
  if(!PROFILE_META[profile]) return;
  selectedOnboardingProfile=profile;
  $$('#onboardingLevels [data-profile]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.profile===profile));
  if(announce) showToast(`${PROFILE_META[profile].label} başlangıç haritası seçildi`);
}
function completeOnboarding(){
  state.profile=selectedOnboardingProfile;
  state.onboarded=true;
  skillsFor(state.profile).forEach(s=>ensureSkillState(state,s.id));
  saveState(); closeOnboarding(); renderAll();
  showToast('Laboratuvar hazır');
}

function renderAll(){
  renderHeader(); renderHome(); renderAtlas(); renderParent();
}
function renderHeader(){
  const chip=$('#profileChip');
  chip.innerHTML=`<span class="level-dot"></span><span>${esc(PROFILE_META[state.profile].label)}</span><b>⌄</b>`;
}

function pickFocus(){
  const curriculumCurrent=currentCurriculumSkill(state);
  if(curriculumCurrent) return {skill:curriculumCurrent,state:ensureSkillState(state,curriculumCurrent.id)};
  const all=skillsFor(state.profile).map(skill=>({skill,state:ensureSkillState(state,skill.id)}));
  const ready=all.filter(x=>prerequisitesReady(state,x.skill));
  const scored=(ready.length?ready:all).map((x,index)=>{
    const mastery=masteryPercent(x.state);
    const novelty=x.state.totalAttempts===0?18:0;
    const gap=representationGap(x.state);
    const gapNeed=(1-gap.score)*22;
    const recency=x.state.lastSeen?Math.min(12,(Date.now()-x.state.lastSeen)/(1000*60*60*24)*4):12;
    return {...x,priority:(100-mastery)*.55+novelty+gapNeed+recency-index*.02};
  });
  return scored.sort((a,b)=>b.priority-a.priority)[0] || null;
}
function focusDescription(focus){
  if(!focus) return 'Bugünkü konu hazırlanıyor.';
  const ss=focus.state;
  if(!ss.totalAttempts) return 'Bu konuya ilk kez başlıyorsun. Hazırsan keşfe geç.';
  if(ss.stable) return 'Bu konuyu daha önce tamamladın. Kısa bir tekrar yapabilirsin.';
  return 'Bugün bu konuyla biraz daha çalışacağız.';
}
function renderHome(){
  const focus=pickFocus();
  const summary=profileSummary(state);
  const ss=focus?.state;
  const pct=ss?masteryPercent(ss):0;
  const gap=ss?representationGap(ss):{rep:'build',score:0};

  $('#focusCard').innerHTML=focus?`
    <div class="focus-top"><span class="focus-label">BUGÜNKÜ KONU</span></div>
    <div class="focus-copy"><h2>${esc(focus.skill.label)}</h2><p>${esc(focusDescription(focus))}</p></div>
    <div class="prism-visual" aria-label="Bugünkü konu hazır">
      <div class="prism-ring"></div>
      <div class="prism-core"><span><strong>▶</strong><small>hazır</small></span></div>
    </div>
  `:'<p>Başlangıç seviyesi seçildiğinde bugünkü konu burada görünür.</p>';

  if($('#lensGrid')) $('#lensGrid').innerHTML='';

  const due=dueReviewItems().length;
  const worked=skillsFor(state.profile).filter(s=>ensureSkillState(state,s.id).totalAttempts>0).length;
  $('#homeInsightGrid').innerHTML=`
    <article class="insight-card main"><div><span class="mini-kicker">BUGÜN</span><h3>${focus?esc(focus.skill.label):'İlk keşif'}</h3><p>${focus?'Hazırsan başlayabilirsin.':'İlk konu hazırlanacak.'}</p></div><div class="micro-ring" style="--pct:${pct}%"><b>▶</b></div></article>
    <article class="insight-card"><span class="mini-kicker">KISA TEKRAR</span><div class="insight-number">${due}<small>hazır</small></div><p>${due?'Tekrar etmek için hazır.':'Şimdilik tekrar yok.'}</p></article>
    <article class="insight-card"><span class="mini-kicker">TAMAMLANAN</span><div class="insight-number">${summary.stable}<small>/ ${summary.total}</small></div><p>${worked} konuyla çalıştın.</p></article>`;

  const preview=skillsFor(state.profile).map(skill=>({skill,ss:ensureSkillState(state,skill.id),ready:prerequisitesReady(state,skill)&&curriculumSkillUnlocked(state,skill.id)})).sort((a,b)=>Number(b.ready)-Number(a.ready)||masteryPercent(a.ss)-masteryPercent(b.ss)).slice(0,4);
  $('#conceptPreviewRow').innerHTML=preview.map(({skill,ss,ready})=>`
    <article class="concept-mini" style="--tint:${accentTint[skill.accent]||'#eef0ef'}">
      <span>${esc(skill.family.toUpperCase())}</span><h3>${esc(skill.label)}</h3>
      <small>${ready?(ss.stable?'Tamamlandı':ss.totalAttempts?'Devam ediyor':'Başlamadı'):'Daha sonra'}</small>
    </article>`).join('');

  const locked=state.cooldownUntil && state.cooldownUntil>Date.now();
  const main=$('#startSessionButton');
  main.disabled=!!locked;
  $('#startMainText').textContent=locked?'Mola sürüyor':'Keşfi başlat';
  const firstCycle=!!(focus&&supportsLearningCycle(focus.skill.id)&&!ss?.learningCycle?.firstCycleCompletedAt);
  $('#startMetaText').textContent=locked?'ekran dışı ara':`yaklaşık ${firstCycle?'7–10':state.profile==='grade2'?'6–8':'5–7'} dk`;
  $('#bottomStart').disabled=!!locked;
}

function renderAtlas(){
  const summary=profileSummary(state);
  const list=skillsFor(state.profile);
  const inProgress=list.filter(s=>{const ss=ensureSkillState(state,s.id); return ss.totalAttempts>0&&!ss.stable;}).length;
  const due=dueReviewItems().length;
  $('#atlasSummary').innerHTML=`
    <div class="summary-card"><span>ÇALIŞILAN</span><strong>${list.filter(s=>ensureSkillState(state,s.id).totalAttempts>0).length}</strong><p>Başladığın konu sayısı.</p></div>
    <div class="summary-card"><span>TAMAMLANAN</span><strong>${summary.stable}</strong><p>Tamamladığın konular.</p></div>
    <div class="summary-card"><span>DEVAM EDEN</span><strong>${inProgress}</strong><p>Biraz daha çalışacağın konular.</p></div>
    <div class="summary-card"><span>KISA TEKRAR</span><strong>${due}</strong><p>Tekrar için hazır olanlar.</p></div>`;

  const domains=['Tümü',...new Set(list.map(s=>s.family))];
  if(!domains.includes(activeDomain)) activeDomain='Tümü';
  $('#domainTabs').innerHTML=domains.map(d=>`<button class="domain-tab ${d===activeDomain?'active':''}" data-domain="${esc(d)}" role="tab">${esc(d)}</button>`).join('');
  $$('#domainTabs [data-domain]').forEach(btn=>btn.addEventListener('click',()=>{activeDomain=btn.dataset.domain;renderAtlas();}));

  const filtered=activeDomain==='Tümü'?list:list.filter(s=>s.family===activeDomain);
  $('#skillMap').innerHTML=filtered.map(skill=>{
    const ss=ensureSkillState(state,skill.id), pct=masteryPercent(ss), ready=prerequisitesReady(state,skill)&&curriculumSkillUnlocked(state,skill.id);
    const status=!ready?'Daha sonra':ss.stable?'Tamamlandı':ss.totalAttempts?'Devam ediyor':'Başlamadı';
    const mark=ss.stable?'✓':ss.totalAttempts?'→':'○';
    return `<article class="skill-card ${ready?'':'locked'}">
      <div class="skill-head"><div><span class="skill-family">${esc(skill.family)}</span><h3>${esc(skill.label)}</h3></div><div class="mini-ring" style="--mastery:${pct}%;--ring:${accentRing[skill.accent]||'#2f9987'}"><b>${mark}</b></div></div>
      <div class="skill-status"><span>${status}</span><span>${ss.totalAttempts?'Daha önce çalışıldı':'Henüz başlanmadı'}</span></div>
    </article>`;
  }).join('');
}

function renderParent(){
  const focus=pickFocus(); const summary=profileSummary(state); const list=skillsFor(state.profile);
  const averages=Object.fromEntries(REPRESENTATIONS.map(r=>{
    const vals=list.map(s=>ensureSkillState(state,s.id).evidence[r]?.score||0);
    return [r, vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*100):0];
  }));
  const focusGap=focus?representationGap(focus.state):null;
  $('#parentInsight').innerHTML=`
    <div class="panel-title"><div><span>ÖĞRENME RESMİ</span><h3>${esc(PROFILE_META[state.profile].label)}</h3></div><small>${summary.avg}% genel</small></div>
    <div class="parent-hero"><span>ÖNCELİKLİ DESTEK</span><h2>${focus?esc(focus.skill.label):'Henüz veri yok'}</h2><p>${focusGap?esc(repReasons[focusGap.rep]):'İlk oturumdan sonra temsil profili oluşacak.'}</p></div>
    <div class="parent-evidence">${REPRESENTATIONS.map(r=>`<div class="parent-evidence-row"><b>${REPRESENTATION_META[r].label}</b><div class="bar"><i style="width:${averages[r]}%"></i></div><span>${averages[r]}%</span></div>`).join('')}</div>
    <div class="parent-note"><b>Bu yüzde bir not değildir.</b><p>Skor, görülen temsil sayısı, temsil içi kanıt ve gecikmeli geri çağırmanın birlikte oluşturduğu ürün içi bir ilerleme göstergesidir.</p></div>`;

  $('#profileSelect').value=state.profile;
  $('#voiceToggle').checked=!!state.settings.voice;
  $('#motionToggle').checked=!!state.settings.calmMotion;
  $('#cooldownSelect').value=state.settings.cooldownMinutes==null?'auto':String(state.settings.cooldownMinutes);
}
function saveSettingsFromUI(){
  const profile=$('#profileSelect').value;
  if(PROFILE_META[profile]) state.profile=profile;
  state.settings.voice=$('#voiceToggle').checked;
  state.settings.calmMotion=$('#motionToggle').checked;
  const cool=$('#cooldownSelect').value;
  state.settings.cooldownMinutes=cool==='auto'?null:Number(cool);
  skillsFor(state.profile).forEach(s=>ensureSkillState(state,s.id));
  applyMotionSetting(); saveState(); renderAll(); showToast('Ayarlar kaydedildi'); navigate('home');
}
function applyMotionSetting(){ document.body.classList.toggle('calm',!!state.settings.calmMotion); }
function resetProgress(){
  if(!confirm('Bu cihazdaki SAYMERA ilerlemesi sıfırlansın mı? SayıYolu veya başka bir uygulamanın verisi etkilenmez.')) return;
  state=defaultState(); activeDomain='Tümü'; saveState(); renderAll(); openOnboarding(); showToast('SAYMERA ilerlemesi sıfırlandı');
}

function dueReviewItems(){
  const allowed=new Set(skillsFor(state.profile).map(s=>s.id));
  const now=Date.now();
  return state.reviewQueue.filter(x=>allowed.has(x.skillId) && x.dueAt<=now && x.stage==='next-day').sort((a,b)=>a.dueAt-b.dueAt);
}
function dueSameSessionReview(includeFuture=false){
  if(!session) return null;
  const allowed=new Set(skillsFor(state.profile).map(s=>s.id));
  return state.reviewQueue
    .filter(x=>allowed.has(x.skillId)&&x.stage==='same-session'&&x.dueQuestion!=null&&(includeFuture||x.dueQuestion<=session.questionIndex))
    .sort((a,b)=>a.dueQuestion-b.dueQuestion)[0]||null;
}
function focusRepresentations(skillState){
  // İlk keşif tüm kanıt pencerelerini tanıtır. Sonraki oturumlar beşli bir checklist değildir;
  // görülmeyen ve en zayıf pencereler önceliklenir.
  if((skillState.totalAttempts||0)===0) return [...REPRESENTATIONS];
  const unseen=REPRESENTATIONS.filter(r=>(skillState.evidence[r]?.attempts||0)===0);
  const seen=REPRESENTATIONS.filter(r=>!unseen.includes(r)).sort((a,b)=>(skillState.evidence[a]?.score||0)-(skillState.evidence[b]?.score||0));
  if(unseen.length){
    const chosen=[...unseen.slice(0,3),...seen.slice(0,Math.max(0,4-unseen.slice(0,3).length))];
    return REPRESENTATIONS.filter(r=>chosen.includes(r));
  }
  const weakest=[...REPRESENTATIONS].sort((a,b)=>(skillState.evidence[a]?.score||0)-(skillState.evidence[b]?.score||0)).slice(0,3);
  return REPRESENTATIONS.filter(r=>weakest.includes(r));
}
function buildSessionPlan(focus){
  const plan=[];
  const due=dueReviewItems()[0];
  if(due){
    const s=skillsFor(state.profile).find(x=>x.id===due.skillId);
    if(s) plan.push({
      skillId:s.id,
      representation:due.representation,
      phase:due.phase||'retrieval',
      reviewItem:due,
      kind:'retention',
      conceptScope:'fresh'
    });
  }

  if(supportsLearningCycle(focus.skill.id)){
    const learningPlan=buildLearningCyclePlan(focus.state);
    if(!focus.state.learningCycle?.firstCycleCompletedAt){
      const readiness=learningPlan.find(item=>item.phase==='readiness');
      if(readiness) plan.push({skillId:focus.skill.id,reviewItem:null,...readiness});
      if(!focus.state.learningCycle?.lessonTaughtAt) plan.push({skillId:focus.skill.id,representation:null,phase:null,reviewItem:null,kind:'lesson-intro',activityMode:'teach',conceptScope:'fresh',countsTowardEvidence:false});
      learningPlan.filter(item=>item.phase!=='readiness').forEach(item=>plan.push({skillId:focus.skill.id,reviewItem:null,...item}));
    }else learningPlan.forEach(item=>plan.push({skillId:focus.skill.id,reviewItem:null,...item}));
    return plan;
  }

  const reps=focusRepresentations(focus.state);
  reps.forEach(rep=>plan.push({skillId:focus.skill.id,representation:rep,reviewItem:null,kind:'focus'}));
  return plan;
}
function startSession(){
  $('#toast')?.classList.remove('show'); clearTimeout(toastTimer);
  if(state.cooldownUntil && state.cooldownUntil>Date.now()){ showCooldown(false); return; }
  if(!state.onboarded){ openOnboarding(); return; }
  const focus=pickFocus(); if(!focus){ showToast('Bu seviye için içerik bulunamadı'); return; }
  const focusDifficulty=focus.state.difficulty||1;
  const focusConcept=createConceptInstance(focus.skill.id,focusDifficulty,Math.random);
  const plan=buildSessionPlan(focus);
  session={
    startedAt:Date.now(), focusSkillId:focus.skill.id, focusConcept, plan, planIndex:0,
    focusRepresentations:plan.filter(x=>x.kind==='focus').map(x=>x.representation),
    requiresLearningCompletion:!!(supportsLearningCycle(focus.skill.id)&&!focus.state.learningCycle?.firstCycleCompletedAt),
    lessonStepIndex:focus.state.learningCycle?.lessonStepIndex||0,
    questionIndex:0, correct:0, wrong:0, hints:0, effortUsed:0, recentSkillIds:[], recentQuestionSignatures:[], learningEvents:[], newStable:0, bridgeAdds:0
  };
  $('#practiceOverlay').classList.add('open'); $('#practiceOverlay').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  loadPlanItem();
}
function maybeInjectBridgeReview(force=false){
  if(!session) return;
  const review=dueSameSessionReview(force); if(!review) return;
  const critical=review.support===true||review.completeCycleOnSuccess===true;
  // General remediation is bounded, but prerequisite support and the final
  // completion recovery are hard gates and may never be dropped by that bound.
  if(session.bridgeAdds>=4&&!critical) return;
  const skill=skillsFor(state.profile).find(s=>s.id===review.skillId); if(!skill) return;
  const already=session.plan.slice(session.planIndex).some(x=>x.reviewItem?.id===review.id);
  if(!already){
    session.plan.splice(session.planIndex,0,{
      skillId:skill.id,
      representation:review.representation||'see',
      phase:review.phase||null,
      reviewItem:review,
      kind:'bridge',
      conceptScope:'fresh',
      countsTowardEvidence:review.phase==='readiness'?false:undefined
    });
    if(!critical) session.bridgeAdds++;
  }
}
function questionRepeatSignature(q){
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
  if(!session) return;
  const atPlanEnd=session.planIndex>=session.plan.length;
  maybeInjectBridgeReview(atPlanEnd);
  if(session.planIndex>=session.plan.length){ finishSession(); return; }
  currentSelection=session.plan[session.planIndex];
  const skill=skillsFor(state.profile).find(s=>s.id===currentSelection.skillId);
  if(!skill){ session.planIndex++; loadPlanItem(); return; }
  const ss=ensureSkillState(state,skill.id);
  currentSelection.skill=skill;
  if(currentSelection.kind==='lesson-intro'){
    answered=false; usedHint=false;
    renderLessonIntro(skill);
    return;
  }
  const fresh=currentSelection.conceptScope==='fresh';
  const reuseFocusConcept=skill.id===session.focusSkillId && !fresh && (currentSelection.kind==='focus'||currentSelection.kind==='bridge');
  let concept=reuseFocusConcept?session.focusConcept:createConceptInstance(skill.id,ss.difficulty||1,Math.random);

  if(currentSelection.phase && supportsLearningCycle(skill.id)){
    const learningOptions=currentSelection.phase==='readiness'?{
      support:currentSelection.kind==='bridge'||currentSelection.reviewItem?.support===true,
      sourceSkillId:currentSelection.reviewItem?.readinessSourceSkillId||null
    }:currentSelection.phase==='practice'?{
      practiceIndex:currentSelection.practiceIndex??0
    }:{};
    const makeLearningQuestion=()=>generateLearningQuestion(
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
  } else {
    currentQuestion=generateQuestion(skill.id,currentSelection.representation,ss.difficulty||1,Math.random,concept);
    rememberQuestionSignature(currentQuestion);
    if(currentSelection.phase) currentQuestion.learningPhase=currentSelection.phase;
  }
  if(currentSelection.countsTowardEvidence===false) currentQuestion.countsTowardEvidence=false;
  currentQuestion.completionRecovery=!!currentSelection.completionRecovery||!!currentSelection.reviewItem?.completeCycleOnSuccess;
  currentQuestion.cycleFinal=!!currentSelection.cycleFinal||currentQuestion.completionRecovery;

  session.questionIndex++;
  session.recentSkillIds.push(skill.id);
  answered=false; usedHint=false;
  renderQuestion();
}
function practiceActivityMeta(selection=currentSelection){
  if(selection?.kind==='lesson-intro') return {label:'KONU ANLATIMI',mode:'teach'};
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
  if(skill.id==='number1000'){ renderNumber1000LessonStep(skill); return; }
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
    const ss=ensureSkillState(state,skill.id); ss.learningCycle.lessonTaughtAt=Date.now(); ss.learningCycle.lessonStepIndex=Math.max(1,ss.learningCycle.lessonStepIndex||0); saveState();
    session.planIndex++; loadPlanItem();
  });
}
function renderQuestion(){
  const q=currentQuestion, s=currentSelection.skill, rep=q.representation;
  renderPracticeHeader(s);
  $('#practiceContent').innerHTML=`
    <div class="question-stage">
      <h2>${esc(q.prompt)}</h2>
      ${q.teachingNote?`<div class="teaching-note">${esc(q.teachingNote)}</div>`:''}
      <div class="visual-stage ${q.response?.kind==='visual-choice'?'reference-stage':''}" id="visualStage">${renderVisual(q.visual,q)}</div>
      ${renderResponse(q)}
      <div class="question-tools"><button class="tool-button" id="hintButton">İpucu göster</button>${state.settings.voice?'<button class="tool-button" id="inlineSpeak">Sesli oku</button>':''}</div>
    </div>`;
  wireResponse(q);
  $('#hintButton').addEventListener('click',showHint);
  $('#inlineSpeak')?.addEventListener('click',speakCurrent);
  wireManipulator(q);
  if(state.settings.voice && state.profile==='preschool') setTimeout(speakCurrent,260);
}
function renderResponse(q){
  const response=q.response||{kind:'choice',options:(q.choices||[]).map(value=>({value,label:value}))};
  if(response.kind==='choice'){
    const options=response.options?.length?response.options:(q.choices||[]).map(value=>({value,label:value}));
    return `<div class="answers-grid response-choice">${options.map(opt=>`<button class="answer-button" data-answer="${esc(opt.value)}">${esc(opt.label??opt.value)}</button>`).join('')}</div>`;
  }
  if(response.kind==='visual-choice'){
    return `<div class="visual-choice-grid">${(response.options||[]).map((opt,i)=>`<button class="visual-answer" data-answer="${esc(opt.value)}" aria-label="${esc(opt.ariaLabel||`Görsel seçenek ${i+1}`)}"><span class="visual-option-index">${i+1}</span><div class="visual-option-body">${renderVisual(opt.visual,q)}</div></button>`).join('')}</div>`;
  }
  if(response.kind==='number-input'){
    return `<div class="number-response">
      <label class="number-entry"><span>Cevabın</span><input id="numberAnswer" inputmode="numeric" pattern="[0-9]*" maxlength="${Number(response.maxLength||3)}" placeholder="${esc(response.placeholder||'?')}" autocomplete="off" aria-label="Sayısal cevap"></label>
      <div class="number-keypad" aria-label="Sayı tuşları">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-digit="${n}">${n}</button>`).join('')}<button type="button" data-key="back" aria-label="Sil">⌫</button><button type="button" data-digit="0">0</button><button type="button" data-key="clear" aria-label="Temizle">C</button></div>
      <button class="response-submit" id="submitNumber">${esc(response.checkLabel||'Cevabı kontrol et')}</button>
    </div>`;
  }
  if(response.kind==='manipulative'){
    return `<div class="manipulative-response"><div class="manipulator-status" id="manipulatorStatus">Modeli oluştur, sonra kontrol et.</div><button class="response-submit" id="checkManipulator">${esc(response.checkLabel||'Modeli kontrol et')}</button></div>`;
  }
  return `<div class="answers-grid">${(q.choices||[]).map(choice=>`<button class="answer-button" data-answer="${esc(choice)}">${esc(choice)}</button>`).join('')}</div>`;
}
function wireResponse(q){
  $$('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>answerQuestion(btn.dataset.answer,btn)));
  if(q.response?.kind==='number-input'){
    const input=$('#numberAnswer');
    const max=Number(q.response.maxLength||3);
    const clean=()=>{ input.value=input.value.replace(/\D/g,'').slice(0,max); };
    input.addEventListener('input',clean);
    input.addEventListener('keydown',ev=>{ if(ev.key==='Enter'&&input.value) answerQuestion(input.value,$('#submitNumber')); });
    $$('[data-digit]').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; input.value=(input.value+btn.dataset.digit).slice(0,max); input.focus(); }));
    $('[data-key="back"]')?.addEventListener('click',()=>{input.value=input.value.slice(0,-1);input.focus();});
    $('[data-key="clear"]')?.addEventListener('click',()=>{input.value='';input.focus();});
    $('#submitNumber')?.addEventListener('click',()=>{ if(!input.value){ showToast('Önce cevabını yaz'); input.focus(); return; } answerQuestion(input.value,$('#submitNumber')); });
    setTimeout(()=>input.focus(),60);
  }
  if(q.response?.kind==='manipulative'){
    $('#checkManipulator')?.addEventListener('click',()=>{
      const value=readManipulatorValue(q);
      if(value==null){ showToast('Önce modeli oluştur'); return; }
      answerQuestion(String(value),$('#checkManipulator'));
    });
  }
}
function wireManipulator(q){
  const interaction=q.response?.interaction;
  if(!interaction) return;
  if(interaction==='twentyframe-build'){
    const root=$('.interactive-twentyframe');
    root?.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; btn.classList.toggle('added'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='tenframe-complete'){
    const root=$('.complete-tenframe-builder');
    root?.querySelectorAll('.complete-token').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      const max=10-Number(root.dataset.base||0);
      const moved=root.querySelectorAll('.complete-token.moved').length;
      if(!btn.classList.contains('moved')&&moved>=max){ root.classList.add('full-pulse'); setTimeout(()=>root.classList.remove('full-pulse'),260); return; }
      btn.classList.toggle('moved');
      const count=root.querySelectorAll('.complete-token.moved').length;
      root.querySelectorAll('.complete-cell:not(.base)').forEach((cell,i)=>cell.classList.toggle('added',i<count));
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='add-to-ten'){
    const root=$('.add-to-ten-builder');
    root?.querySelectorAll('.move-token').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      const max=10-Number(root.dataset.base||0);
      const moved=root.querySelectorAll('.move-token.moved').length;
      if(!btn.classList.contains('moved')&&moved>=max){ root.classList.add('full-pulse'); setTimeout(()=>root.classList.remove('full-pulse'),260); return; }
      btn.classList.toggle('moved');
      const count=root.querySelectorAll('.move-token.moved').length;
      root.querySelectorAll('.target-cell:not(.base)').forEach((cell,i)=>cell.classList.toggle('added',i<count));
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='balance-fill'){
    const root=$('.balance-fill-builder');
    root?.querySelectorAll('.balance-token').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; btn.classList.toggle('moved');
      const count=root.querySelectorAll('.balance-token.moved').length;
      const preview=root.querySelector('.balance-preview-count'); if(preview) preview.textContent=String(Number(root.dataset.rightBase||0)+count);
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='story-add'){
    const root=$('.story-add-builder');
    root?.querySelectorAll('.story-add-token').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; btn.classList.toggle('moved');
      const count=root.querySelectorAll('.story-add-token.moved').length;
      root?.querySelectorAll('.story-added-slot').forEach((slot,i)=>slot.classList.toggle('filled',i<count));
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='pattern-step'){
    const root=$('.pattern-step-builder');
    root?.querySelectorAll('.pattern-step-button').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; root.querySelectorAll('.pattern-step-button').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected');
      const preview=root.querySelector('.pattern-preview'); if(preview) preview.textContent=String(Number(root.dataset.last||0)+Number(btn.dataset.step||0));
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='shape-properties'){
    const root=$('.shape-property-builder');
    root?.querySelectorAll('.property-chip').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; const group=btn.dataset.group; root.querySelectorAll(`.property-chip[data-group="${group}"]`).forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='solid-properties'){
    const root=$('.solid-property-builder');
    root?.querySelectorAll('.solid-property-chip').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      const group=btn.dataset.group;
      root.querySelectorAll(`.solid-property-chip[data-group="${group}"]`).forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected');
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='length-align'){
    const root=$('.length-align-builder');
    root?.querySelector('.align-lengths')?.addEventListener('click',()=>{ if(answered)return; root.classList.add('aligned'); updateManipulatorStatus(q); });
    root?.querySelectorAll('.length-choice').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; root.querySelectorAll('.length-choice').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='pictograph-row'){
    const root=$('.pictograph-row-builder');
    root?.querySelectorAll('.pic-build-cell').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('filled'); updateManipulatorStatus(q); }));
  }
  if(interaction==='remove-counters'){
    const root=$('.remove-counter-builder');
    root?.querySelectorAll('.remove-token').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('removed'); updateManipulatorStatus(q); }));
  }
  if(interaction==='bond-fill'){
    const root=$('.sg-bond-builder');
    root?.querySelectorAll('.sg-bond-token').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='base10-build'){
    const root=$('.sg-base10-builder');
    root?.querySelectorAll('.sg-base10-ten,.sg-base10-one').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='base1000-build'){
    const root=$('.sg-base1000-builder');
    root?.querySelectorAll('.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='fraction-shade'){
    bindFractionPaint($('.sg-fraction-shade-builder'),q);
  }
  if(interaction==='fraction-pair-build'||interaction==='fraction-operation-build'){
    const root=$(interaction==='fraction-pair-build'?'.sg-fraction-pair-builder':'.sg-fraction-operation-builder');
    root?.querySelectorAll('.sg-fraction-cell').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='parity-pair'){
    const root=$('.sg-parity-builder');
    root?.querySelector('.sg-pair-action')?.addEventListener('click',()=>{
      if(answered)return;
      const free=[...root.querySelectorAll('.sg-pair-token:not(.paired)')];
      if(free.length>=2){ free[0].classList.add('paired'); free[1].classList.add('paired'); }
      updateManipulatorStatus(q);
    });
  }
  if(interaction==='two-step-plan'){
    const root=$('.sg-two-step-plan');
    root?.querySelectorAll('.sg-plan-op').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      const step=btn.dataset.step;
      root.querySelectorAll(`.sg-plan-op[data-step="${step}"]`).forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='order-pair'){
    const root=$('.sg-order-builder');
    root?.querySelectorAll('.sg-order-card').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      if(btn.dataset.order){ root.querySelectorAll('.sg-order-card').forEach(x=>{delete x.dataset.order;x.classList.remove('selected')}); }
      const picked=[...root.querySelectorAll('.sg-order-card[data-order]')];
      if(picked.length>=2) root.querySelectorAll('.sg-order-card').forEach(x=>{delete x.dataset.order;x.classList.remove('selected')});
      btn.dataset.order=String(root.querySelectorAll('.sg-order-card[data-order]').length+1); btn.classList.add('selected'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='ordinal-position'){
    const root=$('.sg-ordinal-builder');
    root?.querySelectorAll('.sg-ordinal-slot').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; root.querySelectorAll('.sg-ordinal-slot').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='equal-groups'||interaction==='share-equally'){
    const root=$(interaction==='equal-groups'?'.sg-equal-groups-builder':'.sg-share-builder');
    const used=()=>[...root.querySelectorAll('.sg-group-count')].reduce((sum,n)=>sum+Number(n.textContent||0),0);
    root?.querySelectorAll('.sg-group-add').forEach(btn=>btn.addEventListener('click',()=>{ if(answered||used()>=Number(root.dataset.total||0))return; const count=root.querySelector(`.sg-group-count[data-index="${btn.dataset.index}"]`); count.textContent=String(Number(count.textContent||0)+1); updateManipulatorStatus(q); }));
    root?.querySelectorAll('.sg-group-remove').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; const count=root.querySelector(`.sg-group-count[data-index="${btn.dataset.index}"]`); count.textContent=String(Math.max(0,Number(count.textContent||0)-1)); updateManipulatorStatus(q); }));
  }
  if(interaction==='money-make'){
    const root=$('.sg-money-builder'); root?.querySelectorAll('.sg-money-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='measure-make'){
    const root=$('.sg-measure-builder'); root?.querySelectorAll('.sg-measure-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='duration-compose'){
    const root=$('.sg-duration-builder'); root?.querySelectorAll('.sg-duration-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='clock-minute-set'){
    const root=$('.sg-clock-minute-set');
    const redraw=()=>{ const h=Number(root?.querySelector('.sg-hour-choice.selected')?.dataset.value||12), m=Number(root?.dataset.minute||0); const label=root?.querySelector('.sg-minute-live'); if(label)label.textContent=`:${String(m).padStart(2,'0')}`; const preview=root?.querySelector('.sg-clock-minute-preview'); if(preview)preview.innerHTML=renderClock(h,m); updateManipulatorStatus(q); };
    root?.querySelectorAll('.sg-hour-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-hour-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');redraw()}));
    root?.querySelectorAll('.sg-minute-adjust').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.dataset.minute=String((Number(root.dataset.minute||0)+Number(btn.dataset.delta||0)+60)%60);redraw()}));
  }
  if(interaction==='cm-ruler'){
    const root=$('.sg-cm-ruler-builder');
    root?.querySelectorAll('.sg-ruler-tick-button').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      root.querySelectorAll('.sg-ruler-tick-button').forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected');
      const line=root.querySelector('.sg-cm-ruler-line');
      if(line){ line.style.width=`${Number(btn.dataset.value||0)*40}px`; line.style.marginLeft='0px'; }
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='shape-compose'){
    const root=$('.sg-shape-compose-builder');
    root?.querySelectorAll('.sg-compose-piece').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='square-grid-copy'){
    const root=$('.sg-square-grid-copy');
    root?.querySelectorAll('.sg-grid-copy-cell').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='unit-measure'){
    const root=$('.sg-unit-builder'); root?.querySelectorAll('.sg-unit-cell').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='clock-set'){
    const root=$('.sg-clock-set');
    root?.querySelectorAll('.sg-hour-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-hour-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));
    root?.querySelectorAll('.sg-minute-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-minute-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='shape-pattern'){
    const root=$('.sg-shape-pattern-builder'); root?.querySelectorAll('.sg-shape-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-shape-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='p2-shape-pattern'){
    const root=$('.p2-shape-pattern-builder'); root?.querySelectorAll('.p2-shape-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.p2-shape-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='solid-classify'){
    const root=$('.p2-solid-classify-builder'); root?.querySelectorAll('.p2-solid-bin').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.p2-solid-bin').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='scaled-pictograph-row'){
    const root=$('.p2-scaled-graph-builder'); root?.querySelectorAll('.p2-graph-icon-button').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='three-add'){
    const root=$('.sg-three-add-builder'); root?.querySelectorAll('.sg-three-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));
  }
  updateManipulatorStatus(q);
}

function syncFractionPaintSelection(root){
  if(!root) return {count:0,selected:[]};
  const cells=[...root.querySelectorAll('.sg-fraction-cell')];
  const result=classifyFractionPaint(cells.map(cell=>Number(cell.dataset.ink)||0));
  const selectedSet=new Set(result.selected);
  cells.forEach((cell,index)=>{
    const selected=selectedSet.has(index);
    cell.classList.toggle('selected',selected);
    cell.setAttribute('aria-pressed',String(selected));
  });
  root.dataset.paintCount=String(result.count);
  return result;
}
function clearFractionPaint(root){
  if(!root) return;
  root.querySelectorAll('.sg-fraction-cell').forEach(cell=>{
    cell.dataset.ink='0';
    cell.classList.remove('selected');
    cell.setAttribute('aria-pressed','false');
    cell.querySelectorAll('.sg-fraction-ink-dot').forEach(dot=>dot.remove());
  });
  root.dataset.paintCount='0';
}
function bindFractionPaint(root,q){
  if(!root) return;
  const board=root.querySelector('.sg-fraction-strip.paintable');
  const cells=[...root.querySelectorAll('.sg-fraction-cell')];
  if(!board || !cells.length) return;
  const stroke={active:false,pointerId:null,lastX:null,lastY:null};
  const paintAt=e=>{
    const rect=board.getBoundingClientRect();
    if(rect.width<=0 || rect.height<=0) return;
    if(e.clientX<rect.left || e.clientX>rect.right || e.clientY<rect.top || e.clientY>rect.bottom) return;
    const normalizedX=Math.max(0,Math.min(.999999,(e.clientX-rect.left)/rect.width));
    const index=Math.min(cells.length-1,Math.floor(normalizedX*cells.length));
    const cell=cells[index], cellRect=cell.getBoundingClientRect();
    const localX=Math.max(0,Math.min(100,((e.clientX-cellRect.left)/Math.max(1,cellRect.width))*100));
    const localY=Math.max(0,Math.min(100,((e.clientY-cellRect.top)/Math.max(1,cellRect.height))*100));
    const distance=stroke.lastX==null?0:Math.hypot(e.clientX-stroke.lastX,e.clientY-stroke.lastY);
    const weight=stroke.lastX==null?1.35:Math.min(3,Math.max(.55,distance/8));
    cell.dataset.ink=String((Number(cell.dataset.ink)||0)+weight);
    const mark=document.createElement('span');
    mark.className='sg-fraction-ink-dot';
    mark.style.left=`${localX}%`; mark.style.top=`${localY}%`;
    cell.append(mark);
    const marks=root.querySelectorAll('.sg-fraction-ink-dot');
    if(marks.length>180) marks[0].remove();
    stroke.lastX=e.clientX; stroke.lastY=e.clientY;
    syncFractionPaintSelection(root);
    updateManipulatorStatus(q);
  };
  board.addEventListener('pointerdown',e=>{
    if(answered) return;
    e.preventDefault();
    stroke.active=true; stroke.pointerId=e.pointerId; stroke.lastX=null; stroke.lastY=null;
    try{ board.setPointerCapture(e.pointerId); }catch{}
    paintAt(e);
  });
  board.addEventListener('pointermove',e=>{
    if(!stroke.active || stroke.pointerId!==e.pointerId || answered) return;
    e.preventDefault(); paintAt(e);
  });
  const endStroke=e=>{
    if(!stroke.active || (e.pointerId!=null && stroke.pointerId!==e.pointerId)) return;
    stroke.active=false; stroke.pointerId=null; stroke.lastX=null; stroke.lastY=null;
    syncFractionPaintSelection(root); updateManipulatorStatus(q);
  };
  board.addEventListener('pointerup',endStroke);
  board.addEventListener('pointercancel',endStroke);
  cells.forEach(cell=>cell.addEventListener('keydown',e=>{
    if(answered || (e.key!=='Enter' && e.key!==' ')) return;
    e.preventDefault();
    const selected=cell.classList.contains('selected');
    cell.dataset.ink=selected?'0':'12';
    cell.querySelectorAll('.sg-fraction-ink-dot').forEach(dot=>dot.remove());
    syncFractionPaintSelection(root); updateManipulatorStatus(q);
  }));
  root.querySelector('.sg-fraction-clear')?.addEventListener('click',()=>{
    if(answered) return;
    clearFractionPaint(root); updateManipulatorStatus(q);
  });
  syncFractionPaintSelection(root);
}

function readManipulatorValue(q){
  const interaction=q.response?.interaction;
  if(interaction==='twentyframe-build') return $$('.interactive-twentyframe .added').length;
  if(interaction==='tenframe-complete') return $$('.complete-tenframe-builder .complete-token.moved').length;
  if(interaction==='add-to-ten') return $$('.add-to-ten-builder .move-token.moved').length;
  if(interaction==='balance-fill') return $$('.balance-fill-builder .balance-token.moved').length;
  if(interaction==='story-add') return $$('.story-add-builder .story-add-token.moved').length;
  if(interaction==='pattern-step') return $('.pattern-step-builder .pattern-step-button.selected')?.dataset.step ?? null;
  if(interaction==='shape-properties'){
    const root=$('.shape-property-builder'); if(!root)return null; const selected=['straight','curves','structure'].map(group=>root.querySelector(`.property-chip.selected[data-group="${group}"]`)?.dataset.value); return selected.every(v=>v!=null)?selected.join('|'):null;
  }
  if(interaction==='solid-properties'){
    const root=$('.solid-property-builder'); if(!root)return null;
    const selected=['flat','curved','face'].map(group=>root.querySelector(`.solid-property-chip.selected[data-group="${group}"]`)?.dataset.value);
    return selected.every(v=>v!=null)?selected.join('|'):null;
  }
  if(interaction==='length-align'){
    const root=$('.length-align-builder'); if(!root?.classList.contains('aligned'))return null; const selected=root.querySelector('.length-choice.selected')?.dataset.value; return selected?`aligned|${selected}`:null;
  }
  if(interaction==='pictograph-row') return $$('.pictograph-row-builder .pic-build-cell.filled').length;
  if(interaction==='remove-counters') return $$('.remove-counter-builder .remove-token.removed').length;
  if(interaction==='bond-fill') return $$('.sg-bond-builder .sg-bond-token.selected').length;
  if(interaction==='base10-build') return `${$$('.sg-base10-builder .sg-base10-ten.selected').length}|${$$('.sg-base10-builder .sg-base10-one.selected').length}`;
  if(interaction==='base1000-build') return `${$$('.sg-base1000-builder .sg-base1000-hundred.selected').length}|${$$('.sg-base1000-builder .sg-base1000-ten.selected').length}|${$$('.sg-base1000-builder .sg-base1000-one.selected').length}`;
  if(interaction==='fraction-shade'){ const root=$('.sg-fraction-shade-builder'); return syncFractionPaintSelection(root).count; }
  if(interaction==='fraction-pair-build') return `${$$('.sg-fraction-pair-builder [data-side="left"] .sg-fraction-cell.selected').length}|${$$('.sg-fraction-pair-builder [data-side="right"] .sg-fraction-cell.selected').length}`;
  if(interaction==='fraction-operation-build') return $$('.sg-fraction-operation-builder .sg-fraction-result .sg-fraction-cell.selected').length;
  if(interaction==='parity-pair') return $$('.sg-parity-builder .sg-pair-token:not(.paired)').length;
  if(interaction==='two-step-plan'){
    const a=$('.sg-two-step-plan .sg-plan-op.selected[data-step="1"]')?.dataset.value, b=$('.sg-two-step-plan .sg-plan-op.selected[data-step="2"]')?.dataset.value;
    return a&&b?`${a}|${b}`:null;
  }
  if(interaction==='order-pair'){
    const cards=[...$$('.sg-order-builder .sg-order-card[data-order]')].sort((a,b)=>Number(a.dataset.order)-Number(b.dataset.order)); return cards.length===2?cards.map(x=>x.dataset.value).join('|'):null;
  }
  if(interaction==='ordinal-position') return $('.sg-ordinal-builder .sg-ordinal-slot.selected')?.dataset.value ?? null;
  if(interaction==='equal-groups'||interaction==='share-equally'){
    const root=$(interaction==='equal-groups'?'.sg-equal-groups-builder':'.sg-share-builder'); if(!root)return null;
    const counts=[...root.querySelectorAll('.sg-group-count')].map(n=>Number(n.textContent||0)); const total=counts.reduce((a,b)=>a+b,0);
    if(total!==Number(root.dataset.total||0)||!counts.length||!counts.every(v=>v===counts[0])) return null;
    return interaction==='equal-groups'?total:counts[0];
  }
  if(interaction==='money-make') return [...$$('.sg-money-builder .sg-money-token.selected')].reduce((sum,b)=>sum+Number(b.dataset.value||0),0);
  if(interaction==='measure-make') return [...$$('.sg-measure-builder .sg-measure-token.selected')].reduce((sum,b)=>sum+Number(b.dataset.value||0),0);
  if(interaction==='duration-compose') return [...$$('.sg-duration-builder .sg-duration-token.selected')].reduce((sum,b)=>sum+Number(b.dataset.value||0),0);
  if(interaction==='clock-minute-set'){ const root=$('.sg-clock-minute-set'); const h=root?.querySelector('.sg-hour-choice.selected')?.dataset.value; return h!=null?`${h}|${Number(root.dataset.minute||0)}`:null; }
  if(interaction==='cm-ruler') return $('.sg-cm-ruler-builder .sg-ruler-tick-button.selected')?.dataset.value ?? null;
  if(interaction==='shape-compose'){
    const values=[...$$('.sg-shape-compose-builder .sg-compose-piece.selected')].map(b=>b.dataset.value).sort();
    return values.length?values.join('+'):null;
  }
  if(interaction==='square-grid-copy'){ const cells=[...$$('.sg-square-grid-copy .sg-grid-copy-cell.selected')].map(b=>b.dataset.cell).sort(); return cells.length?cells.join('|'):null; }
  if(interaction==='unit-measure') return $$('.sg-unit-builder .sg-unit-cell.selected').length;
  if(interaction==='clock-set'){
    const h=$('.sg-clock-set .sg-hour-choice.selected')?.dataset.value, m=$('.sg-clock-set .sg-minute-choice.selected')?.dataset.value; return h!=null&&m!=null?`${h}|${m}`:null;
  }
  if(interaction==='shape-pattern') return $('.sg-shape-pattern-builder .sg-shape-choice.selected')?.dataset.value ?? null;
  if(interaction==='p2-shape-pattern') return $('.p2-shape-pattern-builder .p2-shape-choice.selected')?.dataset.value ?? null;
  if(interaction==='solid-classify') return $('.p2-solid-classify-builder .p2-solid-bin.selected')?.dataset.value ?? null;
  if(interaction==='scaled-pictograph-row') return $$('.p2-scaled-graph-builder .p2-graph-icon-button.selected').length;
  if(interaction==='three-add') return $$('.sg-three-add-builder .sg-three-token.selected').length;
  return null;
}
function updateManipulatorStatus(q){
  const node=$('#manipulatorStatus'); if(!node)return;
  const value=readManipulatorValue(q)??0;
  if(q.response?.interaction==='twentyframe-build') node.textContent=`Kurduğun miktar: ${value}`;
  else if(q.response?.interaction==='tenframe-complete') node.textContent=`Yerleştirdiğin taş: ${value}`;
  else if(q.response?.interaction==='add-to-ten') node.textContent=`İlk çerçeveye taşıdığın: ${value}`;
  else if(q.response?.interaction==='balance-fill') node.textContent=`Sağ tarafa eklediğin: ${value}`;
  else if(q.response?.interaction==='story-add') node.textContent=`Hikâyeye eklediğin: ${value}`;
  else if(q.response?.interaction==='pattern-step') node.textContent=value?`Seçtiğin adım: ${Number(value)>0?'+':''}${value}`:'Örüntü adımını seç';
  else if(q.response?.interaction==='shape-properties') node.textContent=value?'Üç özellik seçildi':'Her satırdan bir özellik seç';
  else if(q.response?.interaction==='solid-properties') node.textContent=value?'Özellik modeli hazır':'Her satırdan bir özellik seç';
  else if(q.response?.interaction==='length-align') node.textContent=value?'Hizalama ve karşılaştırma hazır':'Önce hizala, sonra karşılaştır';
  else if(q.response?.interaction==='pictograph-row') node.textContent=`Grafiğe koyduğun sembol: ${value}`;
  else if(q.response?.interaction==='remove-counters') node.textContent=`Ayırdığın taş: ${value}`;
  else if(q.response?.interaction==='bond-fill') node.textContent=`Eksik parçaya koyduğun taş: ${value}`;
  else if(q.response?.interaction==='base10-build') { const [t='0',o='0']=String(value).split('|'); node.textContent=`Modelin: ${t} onluk · ${o} birlik`; }
  else if(q.response?.interaction==='base1000-build') { const [h='0',t='0',o='0']=String(value).split('|'); node.textContent=`Modelin: ${h} yüzlük · ${t} onluk · ${o} birlik`; }
  else if(q.response?.interaction==='fraction-shade') node.textContent=`Boyadığın eş parça: ${value}`;
  else if(q.response?.interaction==='fraction-pair-build') node.textContent=value?`Modellerin: ${String(value).replace('|',' ve ')}`:'İki modeli de kur';
  else if(q.response?.interaction==='fraction-operation-build') node.textContent=`Sonuçta boyadığın parça: ${value}`;
  else if(q.response?.interaction==='parity-pair') node.textContent=`Eşsiz kalan birlik: ${value}`;
  else if(q.response?.interaction==='two-step-plan') node.textContent=value?`Planın: ${String(value).replace('|',' → ')}`:'1. ve 2. işlem kartlarını seç';
  else if(q.response?.interaction==='order-pair') node.textContent=value?`Sıran: ${String(value).replace('|',' → ')}`:'Önce küçük, sonra büyük karta dokun';
  else if(q.response?.interaction==='ordinal-position') node.textContent=value?`Seçtiğin sıra: ${value}.`:'Bir sıra konumu seç';
  else if(q.response?.interaction==='equal-groups') node.textContent=value!=null?`Eşit gruplar hazır · toplam ${value}`:'Taşları bütün gruplara eşit dağıt';
  else if(q.response?.interaction==='share-equally') node.textContent=value!=null?`Eşit paylaşım hazır · grupta ${value}`:'Bütün taşları eşit paylaş';
  else if(q.response?.interaction==='money-make') node.textContent=`Seçtiğin toplam: ${value} ${q.response?.unit==='kr'?'kuruş':'TL'}`;
  else if(q.response?.interaction==='measure-make') node.textContent=`Kurduğun ölçü: ${value} ${q.response?.unit||''}`;
  else if(q.response?.interaction==='duration-compose') { const total=Number(value)||0; node.textContent=`Kurduğun süre: ${Math.floor(total/60)} sa ${total%60} dk`; }
  else if(q.response?.interaction==='clock-minute-set') node.textContent=value?`Ayarladığın: ${String(value).replace('|',':').replace(/:(\d)$/,':0$1')}`:'Önce saati seç, sonra dakikayı ayarla';
  else if(q.response?.interaction==='cm-ruler') node.textContent=value?`Seçtiğin bitiş: ${value} cm`:'Cetvelde bitiş çizgisini seç';
  else if(q.response?.interaction==='shape-compose') node.textContent=value?`Seçtiğin parçalar: ${String(value).split('+').length}`:'Figürü oluşturan bütün parçaları seç';
  else if(q.response?.interaction==='square-grid-copy') node.textContent=value?`Kopyanda ${String(value).split('|').length} dolu hücre var`:'Hedefteki dolu hücreleri aynı konuma kopyala';
  else if(q.response?.interaction==='unit-measure') node.textContent=`Kullandığın birim: ${value}`;
  else if(q.response?.interaction==='clock-set') node.textContent=value?`Ayarladığın: ${String(value).replace('|',':').replace(/:0$/,':00')}`:'Önce saati ve dakikayı seç';
  else if(q.response?.interaction==='shape-pattern') node.textContent=value?'Sıradaki şekli seçtin':'Örüntüyü tamamlayacak şekli seç';
  else if(q.response?.interaction==='p2-shape-pattern') node.textContent=value?'Örüntüyü tamamlayacak parçayı seçtin':'Boyut, şekil, renk ve yön düzenini izle';
  else if(q.response?.interaction==='solid-classify') node.textContent=value?'Sınıflandırma grubunu seçtin':'Cismin düz ve eğri yüzeylerini düşün';
  else if(q.response?.interaction==='scaled-pictograph-row') node.textContent=`Grafiğe koyduğun resim: ${value}`;
  else if(q.response?.interaction==='three-add') node.textContent=`Toplam alana taşıdığın taş: ${value}`;
}
function showHint(){
  if(!currentQuestion||answered) return;
  usedHint=true; session.hints++;
  const btn=$('#hintButton'); btn.disabled=true; btn.textContent='İpucu açık';
  const stage=$('.question-stage');
  stage.insertAdjacentHTML('beforeend',`<div class="explain-box" id="liveHint"><strong>İpucu:</strong> ${esc(currentQuestion.hint)}</div>`);
  if(state.settings.voice) speak(currentQuestion.hint);
}
const ADAPTIVE_PRACTICE_REPRESENTATIONS=['symbol','transfer','see','explain'];
function appendAdaptivePractice(decision){
  if(!session||decision.practiceCount>=4) return;
  const index=decision.practiceCount;
  const representation=ADAPTIVE_PRACTICE_REPRESENTATIONS[index]||'transfer';
  session.plan.splice(session.planIndex+1,0,{
    skillId:session.focusSkillId,
    representation,
    phase:'practice',
    reviewItem:null,
    kind:'practice',
    conceptScope:'fresh',
    practiceIndex:index,
    practiceCheckpoint:true
  });
}
function currentLearningEvent(q,correct,hint){
  return {
    skillId:q.skillId,
    phase:q.learningPhase||null,
    kind:currentSelection?.kind||null,
    taskKind:q.taskKind||null,
    representation:q.representation,
    correct:!!correct,
    usedHint:!!hint
  };
}
function answerQuestion(value,button){
  if(answered||!currentQuestion) return;
  answered=true;
  const q=currentQuestion; const correct=String(value)===String(q.answer);
  $$('[data-answer]').forEach(b=>{
    b.disabled=true;
    b.classList.toggle('correct',b.dataset.answer===String(q.answer));
    if(b!==button&&b.dataset.answer!==String(q.answer)) b.classList.add('dimmed');
  });
  $$('.number-keypad button,#submitNumber,#checkManipulator,.interactive-twentyframe button,.complete-token,.move-token,.remove-token,.balance-token,.story-add-token,.pattern-step-button,.property-chip,.align-lengths,.length-choice,.pic-build-cell,.sg-bond-token,.sg-base10-ten,.sg-base10-one,.sg-order-card,.sg-ordinal-slot,.sg-group-add,.sg-group-remove,.sg-money-token,.sg-ruler-tick-button,.sg-compose-piece,.sg-grid-copy-cell,.sg-unit-cell,.sg-hour-choice,.sg-minute-choice,.sg-shape-choice,.solid-property-chip,.sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op,.sg-fraction-cell,.sg-measure-token,.sg-duration-token,.sg-minute-adjust,.p2-shape-choice,.p2-solid-bin,.p2-graph-icon-button').forEach(b=>b.disabled=true);
  $('#numberAnswer')?.setAttribute('disabled','');
  if(button){ if(!correct) button.classList.add('wrong'); else button.classList.add('correct'); }
  const before=ensureSkillState(state,q.skillId).stable;
  const event=currentLearningEvent(q,correct,usedHint);
  let practiceDecision=null;
  if(currentSelection?.practiceCheckpoint&&q.learningPhase==='practice'&&currentSelection.kind==='practice'){
    practiceDecision=evaluatePracticeCheckpoint(session.learningEvents,event);
    // Correct + enough varied practice closes the cycle. If four scheduled practice
    // attempts are exhausted on an error, the immediate recovery becomes the gate.
    if(practiceDecision.complete||(practiceDecision.atCap&&!correct)) q.cycleFinal=true;
  }
  const delayed=currentSelection.reviewItem?.stage==='next-day';
  applyAnswer(state,q,{correct,usedHint,isDelayedReview:!!delayed,now:Date.now(),sessionQuestionIndex:session.questionIndex});
  session.learningEvents.push(event);
  if(practiceDecision&&!q.cycleFinal) appendAdaptivePractice(practiceDecision);
  if(currentSelection.reviewItem) consumeReview(state,currentSelection.reviewItem);
  const after=ensureSkillState(state,q.skillId).stable;
  if(!before&&after) session.newStable++;
  session.effortUsed+=(q.effort||1)*(usedHint?1.12:1);
  if(correct) session.correct++; else session.wrong++;
  saveState();
  setTimeout(()=>correct?renderCorrectFeedback():renderBridgeFeedback(),360);
}
function renderCorrectFeedback(){
  const q=currentQuestion;
  const lead=q.feedbackTitle||'Harika, doğru cevabı buldun.';
  $('#practiceContent').innerHTML=`<section class="feedback-card">
    <div class="feedback-mark">✓</div><span class="section-kicker">DOĞRU</span><h2>${esc(lead)}</h2>
    <div class="explain-box">${esc(q.explain)}</div>
    <button class="primary-cta" id="continueButton"><span class="cta-icon">→</span><span><b>Sonraki göreve geç</b><small>${nextTaskLabel()}</small></span><i>→</i></button>
  </section>`;
  $('#continueButton').addEventListener('click',nextQuestion);
  if(state.settings.voice) speak(`${lead} ${q.explain}`);
}
function renderBridgeFeedback(){
  const q=currentQuestion;
  $('#practiceContent').innerHTML=`<section class="bridge-card">
    <div class="bridge-mark"><i></i><i></i><i></i></div><span class="section-kicker">BİRLİKTE BAKALIM</span><h2>Bu kez olmadı; ipucuyla devam edelim.</h2>
    <div class="bridge-visual">${renderVisual(q.visual,q)}</div>
    <div class="explain-box"><strong>İpucu:</strong> ${esc(q.hint)}<br><span>${esc(q.explain)}</span></div>
    <button class="primary-cta" id="bridgeContinue"><span class="cta-icon">↗</span><span><b>Devam et</b><small>${nextTaskLabel()}</small></span><i>→</i></button>
  </section>`;
  $('#bridgeContinue').addEventListener('click',nextQuestion);
  if(state.settings.voice) speak(`İpucuna bakalım. ${q.hint}`);
}
function nextTaskLabel(){
  const next=session?.plan[session.planIndex+1];
  return next?'sıradaki soru':'oturumu tamamla';
}
function nextQuestion(){
  if(!session) return;
  session.planIndex++;
  loadPlanItem();
}
function finishSession(){
  if(!session) return;

  // Hard invariant: a first learning cycle cannot be presented as completed
  // until a successful consolidation/recovery has actually closed the cycle.
  if(session.requiresLearningCompletion){
    const gateSkill=skillsFor(state.profile).find(s=>s.id===session.focusSkillId);
    const gateState=gateSkill?ensureSkillState(state,gateSkill.id):null;
    if(gateState&&!gateState.learningCycle?.firstCycleCompletedAt){
      maybeInjectBridgeReview(true);
      if(session.planIndex<session.plan.length){ loadPlanItem(); return; }
      const bridgeMap={build:'see',see:'build',symbol:'see',explain:'see',transfer:'build'};
      session.plan.splice(session.planIndex,0,{
        skillId:session.focusSkillId,
        representation:bridgeMap[currentQuestion?.representation]||'see',
        phase:'practice',
        reviewItem:null,
        kind:'bridge',
        conceptScope:'fresh',
        completionRecovery:true
      });
      loadPlanItem();
      return;
    }
  }

  const ended=session;
  const duration=Math.max(1,Math.round((Date.now()-ended.startedAt)/1000));
  state.totals.activeSeconds=(state.totals.activeSeconds||0)+duration;
  state.sessions.push({at:Date.now(),profile:state.profile,focusSkillId:ended.focusSkillId,correct:ended.correct,wrong:ended.wrong,hints:ended.hints,questions:ended.questionIndex,duration,newStable:ended.newStable});
  if(state.sessions.length>80) state.sessions=state.sessions.slice(-80);
  saveState();
  const attempts=ended.correct+ended.wrong; const rate=attempts?Math.round(ended.correct/attempts*100):0;
  const focusSkill=skillsFor(state.profile).find(s=>s.id===ended.focusSkillId); const focusState=focusSkill?ensureSkillState(state,focusSkill.id):null;
  $('#practiceProgress').style.width='100%';
  $('#practiceCounter').textContent=`${ended.questionIndex} / ${ended.questionIndex}`;
  $('#practiceContent').innerHTML=`<section class="session-end">
    <div class="end-mark">✓</div><span class="section-kicker">TAMAMLANDI</span><h2>Bugünkü çalışmayı bitirdin.</h2>
    <p>${focusSkill?`“${esc(focusSkill.label)}” ile güzel bir çalışma yaptın.`:'Güzel bir çalışma yaptın.'} Şimdi kısa bir mola zamanı.</p>
    <div class="end-stats"><div><strong>${ended.questionIndex}</strong><span>görev tamamlandı</span></div><div><strong>✓</strong><span>çalışma bitti</span></div></div>
    <button class="primary-cta" id="finishToRest"><span class="cta-icon">☼</span><span><b>Mola ver</b><small>ekrandan biraz uzaklaş</small></span><i>→</i></button>
  </section>`;
  $('#finishToRest').addEventListener('click',()=>{
    $('#practiceOverlay').classList.remove('open'); $('#practiceOverlay').setAttribute('aria-hidden','true'); document.body.style.overflow='';
    session=null; currentQuestion=null; currentSelection=null; renderAll(); startCooldown();
  });
}
function closePractice(confirmClose=false){
  if(confirmClose&&session&&session.questionIndex>0&&!confirm('Çalışmayı şimdi kapatmak ister misin? Daha sonra yeniden başlayabilirsin.')) return;
  $('#practiceOverlay').classList.remove('open'); $('#practiceOverlay').setAttribute('aria-hidden','true'); document.body.style.overflow='';
  session=null; currentQuestion=null; currentSelection=null; renderAll();
}

function startCooldown(){
  const meta=PROFILE_META[state.profile];
  let minutes=state.settings.cooldownMinutes??meta.cooldownMinutes;
  if(state.settings.cooldownMinutes==null){
    const today=new Date().toDateString();
    const count=state.sessions.filter(s=>new Date(s.at).toDateString()===today).length;
    if(count>=2) minutes=Math.max(minutes,10);
  }
  state.cooldownUntil=Date.now()+minutes*60*1000; saveState(); showCooldown(true);
}
function showCooldown(newBreak){
  const overlay=$('#cooldownOverlay'); overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  if(newBreak){
    const prompts=['Ayağa kalk, birkaç yavaş adım at ve odanın uzak bir noktasına bak.','Biraz su iç, omuzlarını çevir ve ekrandan uzağa bak.','Ellerini açıp kapat, kısa bir tur at ve gözlerini dinlendir.'];
    $('#cooldownPrompt').textContent=prompts[Math.floor(Math.random()*prompts.length)];
  }
  clearInterval(cooldownTimer); updateCooldown(); cooldownTimer=setInterval(updateCooldown,1000);
}
function updateCooldown(){
  const remaining=Math.max(0,(state.cooldownUntil||0)-Date.now());
  if(remaining<=0){ state.cooldownUntil=0; saveState(); hideCooldown(); renderAll(); showToast('Mola tamamlandı'); return; }
  const sec=Math.ceil(remaining/1000); const m=Math.floor(sec/60), s=sec%60;
  $('#cooldownTime').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function hideCooldown(){ clearInterval(cooldownTimer); $('#cooldownOverlay').classList.remove('open'); $('#cooldownOverlay').setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

function speakCurrent(){
  if(!currentQuestion) return;
  const q=currentQuestion, kind=q.response?.kind||'choice';
  let tail='';
  if(kind==='choice') tail=` Seçenekler: ${(q.response?.options||[]).map(x=>x.label??x.value).join(', ')}.`;
  else if(kind==='visual-choice') tail=' Görsel modellerden doğru olanı seç.';
  else if(kind==='number-input') tail=' Cevabını sayı olarak yaz.';
  else if(kind==='manipulative') tail=' Modeli dokunarak oluştur ve sonra kontrol et.';
  speak(`${q.prompt}.${tail}`);
}
function speak(text){
  if(!text||!('speechSynthesis' in window)) return;
  speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='tr-TR'; u.rate=.91; u.pitch=1.02; speechSynthesis.speak(u);
}

function renderVisual(v,q){
  if(!v) return `<div style="position:relative;z-index:1;text-align:center;color:var(--muted);font-size:11px;max-width:360px">Bu pencerede görsel model yerine dil ve akıl yürütme kullanılıyor.</div>`;
  switch(v.type){
    case 'dots': return `<div class="visual-dots">${Array.from({length:v.n},()=>'<i class="dot"></i>').join('')}</div>`;
    case 'objects': return `<div class="visual-objects">${Array.from({length:v.n},(_,i)=>`<i class="object-token" style="--r:${(i%3-1)*5}deg"></i>`).join('')}</div>`;
    case 'buttons': return `<div class="visual-objects">${Array.from({length:v.n},()=>'<i class="object-token"></i>').join('')}<span style="font-size:26px;color:var(--muted)">…</span></div>`;
    case 'compare': return `<div class="compare-wrap"><div class="compare-group"><span class="compare-label">SOL</span>${Array.from({length:v.a},()=>'<i class="dot"></i>').join('')}</div><div class="compare-group"><span class="compare-label">SAĞ</span>${Array.from({length:v.b},()=>'<i class="dot" style="background:var(--blue)"></i>').join('')}</div></div>`;
    case 'partwhole': return `<div class="partwhole"><div class="whole">${v.whole}</div><div class="part">${v.part}</div><div class="part">${v.missing==null?'?':v.missing}</div></div>`;
    case 'pattern': return `<div class="pattern-row">${v.items.map(x=>`<span>${esc(x)}</span>`).join('')}<span style="color:var(--muted)">?</span></div>`;
    case 'tenframe': return q?.representation==='build'&&q?.skillId==='make10'?interactiveTenFrame(v.n):tenFrame(v.n,'');
    case 'twentyframe-build-interactive': return interactiveTwentyFrame(v.target);
    case 'twentyframe-model': return twentyFrameModel(v.n);
    case 'bead-bundle-story': return beadBundleStory(v.rest);
    case 'two-color-bead-story': return twoColorBeadStory(v.first,v.second);
    case 'tenframe-complete-interactive': return interactiveCompleteTenFrame(v.initial,v.pool);
    case 'tenframe-completion-model': return tenFrameCompletionModel(v.base,v.added);
    case 'add-to-ten-interactive': return addToTenBuilder(v.a,v.b);
    case 'make10-split-model': return make10SplitModel(v.a,v.b,v.move,v.rest);
    case 'remove-counters-interactive': return removeCountersBuilder(v.total);
    case 'sub-numberline-model': return subtractionNumberLineModel(v.start,v.steps,v.end);
    case 'sub-decomposition': return subtractionDecomposition(v);
    case 'seat-row': return seatRow(v.occupied,v.total);
    case 'sticker-story': return stickerStory(v.a,v.b,v.op);
    case 'numbercard': return `<div style="font-size:82px;font-weight:950;letter-spacing:-.06em;position:relative;z-index:1">${v.n}</div>`;
    case 'dots-add': return `<div style="display:grid;gap:14px;position:relative;z-index:1"><div class="visual-dots">${Array.from({length:v.a},()=>'<i class="dot"></i>').join('')}</div><div style="text-align:center;font-size:24px">＋</div><div class="visual-dots">${Array.from({length:v.b},()=>'<i class="dot" style="background:var(--blue)"></i>').join('')}</div></div>`;
    case 'tenframe-add': return `<div class="tenframe-wrap">${tenFrame(v.a,'')}${tenFrame(v.b,'second')}</div>`;
    case 'equation': return `<div class="equation-visual">${esc(v.text)}</div>`;
    case 'numberline-sub': return numberLine(v.a,v.b,20);
    case 'numberline100': return numberLine(v.a,v.b,100);
    case 'balance': return `<div class="balance"><div class="balance-side">${v.left.map(esc).join(' + ')}</div><div class="balance-eq">=</div><div class="balance-side">${v.right.map(esc).join(' + ')}</div></div>`;
    case 'balance-fill-interactive': return balanceFillBuilder(v.left,v.rightBase,v.pool);
    case 'equal-shelves-story': return equalShelvesStory(v.left,v.rightBase);
    case 'story-add-interactive': return storyAddBuilder(v.initial,v.pool,v.targetAdd);
    case 'story-operation-model': return storyOperationModel(v.a,v.b,v.op);
    case 'context-change-story': return contextChangeStory(v.a,v.b,v.op);
    case 'pattern-step-interactive': return patternStepBuilder(v.seq,v.candidates);
    case 'elevator-pattern': return elevatorPattern(v.start,v.step,v.moves);
    case 'shape-property-builder': return shapePropertyBuilder(v.shape,v.name);
    case 'length-align-interactive': return lengthAlignBuilder(v.a,v.b);
    case 'ribbon-compare-story': return ribbonCompareStory(v.a,v.b);
    case 'pictograph-row-interactive': return pictographRowBuilder(v.cats,v.vals,v.targetIndex);
    case 'raw-data-list': return rawDataList(v.cats,v.vals);
    case 'bar': { const total=v.op==='+'?v.a+v.b:v.a; const w1=Math.max(22,Math.round(v.a/Math.max(1,total)*100)), w2=Math.max(18,100-w1); return `<div class="bar-model"><span style="width:${w1}%">${v.a}</span><span style="width:${w2}%">${v.op==='+'?v.b:'− '+v.b}</span></div>`; }
    case 'story': return `<div class="story-visual"><div class="bag">${v.a}</div><span class="story-arrow">${v.kind==='gain'?'＋':'−'}</span><div class="bag" style="background:var(--blue-soft);border-color:#9fb3c4">${v.b}</div></div>`;
    case 'base10': return `<div class="base10"><div class="tens">${Array.from({length:v.tens},()=>'<i class="ten-rod"></i>').join('')}</div><div class="ones">${Array.from({length:v.ones},()=>'<i class="one-cube"></i>').join('')}</div></div>`;
    case 'pairing-small': return pairingSmallVisual(v.n,v.leftover);
    case 'parity-pair-builder': return parityPairBuilder(v.n,v.ones);
    case 'parity-card': return parityCardVisual(v.n,v.ones,v.leftover);
    case 'two-step-plan-builder': return twoStepPlanBuilder(v.a,v.b,v.c);
    case 'two-step-model': return twoStepModelVisual(v.a,v.b,v.c,v.op1,v.op2);
    case 'base1000': return base1000Visual(v.hundreds,v.tens,v.ones);
    case 'base1000-build-interactive': return base1000BuildBuilder(v.target,v.maxHundreds,v.maxTens,v.maxOnes);
    case 'base1000-operation-build': return base1000OperationBuilder(v);
    case 'compare-base1000': return compareBase1000Visual(v.a,v.b,v.relation);
    case 'bar-add': return `<div class="bar-model"><span style="width:58%">${v.a}</span><span style="width:42%">+ ${v.b}</span></div>`;
    case 'groups': return `<div class="group-wrap">${Array.from({length:v.groups},()=>`<div class="group">${Array.from({length:v.each},()=>'<i></i>').join('')}</div>`).join('')}</div>`;
    case 'share': { const each=v.total/v.divisor; return `<div class="share-wrap">${Array.from({length:v.divisor},()=>`<div class="share-person">${Array.from({length:each},()=>'<i></i>').join('')}</div>`).join('')}</div>`; }
    case 'measure-compose-interactive': return measureComposeBuilder(v.target,v.unit,v.denoms||[1]);
    case 'measure-amount': return measureAmountVisual(v.kind,v.amount,v.unit,v.denoms||[1],v.showLabel!==false);
    case 'measure-compare': return measureCompareVisual(v.kind,v.left,v.right,v.unit);
    case 'measure-triple': return measureTripleVisual(v.kind,v.values,v.unit);
    case 'unit-context-card': return unitContextCard(v.object,v.unit);
    case 'mass-foundation': return massFoundationVisual(v.left,v.right);
    case 'volume-foundation': return volumeFoundationVisual(v.left,v.right);
    case 'volume-compare': return measureCompareVisual('volume',v.left,v.right,'L');
    case 'clock-minute-set-interactive': return clockMinuteSetBuilder(v.targetHour,v.targetMinute);
    case 'duration-compose-interactive': return durationComposeBuilder(v.target);
    case 'duration-card': return durationCard(v);
    case 'money-decimal-card': return moneyDecimalCard(v.cents,v.label);
    case 'money-compare-decimal': return moneyCompareDecimal(v.values);
    case 'p2-shape-pattern-builder': return p2ShapePatternBuilder(v.items,v.options);
    case 'p2-shape-pattern': return p2ShapePatternVisual(v.items);
    case 'p2-tile-border': return `<div class="p2-tile-border">${p2ShapePatternVisual(v.items)}</div>`;
    case 'p2-solid': return p2SolidVisual(v.kind);
    case 'p2-solid-classify-builder': return p2SolidClassifyBuilder(v.kind,v.name);
    case 'p2-solid-property-card': return p2SolidPropertyCard(v.kind,v.property);
    case 'p2-solid-scene': return p2SolidScene(v.kind);
    case 'scaled-picture-graph': return scaledPictureGraph(v.cats,v.icons,v.scale,v.highlight);
    case 'scaled-pictograph-builder': return scaledPictographBuilder(v.category,v.target,v.scale,v.maxIcons);
    case 'scaled-graph-answer-card': return `<div class="p2-graph-answer-card"><small>${esc(v.category)}</small><b>${v.value}</b></div>`;
    case 'fraction-strip': return fractionStrip(v.numerator,v.denom);
    case 'fraction-shade-builder': return fractionShadeBuilder(v.denom,v.target);
    case 'fraction-pair-builder': return fractionPairBuilder(v.left,v.right);
    case 'fraction-pair': return fractionPairVisual(v.left,v.right);
    case 'fraction-operation-builder': return fractionOperationBuilder(v);
    case 'fraction-operation': return fractionOperationVisual(v);
    case 'fraction-notation-card': return fractionNotationCard(v.numerator,v.denom);
    case 'equal-parts-guide': return equalPartsGuide(v.denom);
    case 'chocolate-parts': return chocolateParts(v.denom);
    case 'pizza-fraction': return pizzaFraction(v.numerator,v.denom);
    case 'fraction': return fractionSvg(v.denom);
    case 'story2': return `<div style="display:grid;gap:14px;text-align:center;position:relative;z-index:1"><div class="group-wrap">${Array.from({length:v.boxes},()=>`<div class="group">${Array.from({length:v.each},()=>'<i></i>').join('')}</div>`).join('')}</div><div style="color:var(--muted);font-weight:800">sonra ${v.give} kalem veriliyor</div></div>`;
    case 'shape': return `<div class="shape-visual ${esc(v.shape)}" style="--rot:${Number(v.rotate||0)}deg"></div>`;
    case 'shape-scene': return shapeScene(v.shape);
    case 'sort': return renderSort(v.mode);
    case 'position': return renderPosition(v.relation);
    case 'sequence': return `<div class="sequence-row">${v.items.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
    case 'length-bars': return renderLengthBars(v);
    case 'pictograph': return `<div class="pictograph">${v.cats.map((cat,i)=>`<div class="pic-row"><b>${esc(cat)}</b><div>${Array.from({length:v.vals[i]},()=>'<i></i>').join('')}</div></div>`).join('')}</div>`;
    case 'ruler': return renderRuler(v.n);
    case 'clock': return renderClock(v.hour,v.minute);
    case 'money': { const unit=v.unit==='kr'?'kr':'TL'; return `<div class="money-wrap">${v.values.map(n=>`<div class="money-note">${n}<small>${unit}</small></div>`).join('')}${v.price!=null?`<div class="price-tag">Fiyat ${v.price} ${unit}</div>`:''}</div>`; }
    case 'bar-chart': { const max=Math.max(...v.vals,1); return `<div class="bar-chart">${v.cats.map((cat,i)=>`<div class="bar-col ${v.highlight===i?'highlight':''}" style="height:${Math.max(12,Math.round(v.vals[i]/max*100))}%"><b>${esc(cat)}</b></div>`).join('')}</div>`; }
    case 'solid': return solidSvg(v.kind,Number(v.rotate||0));
    case 'solid-pair': return `<div class="solid-pair">${solidSvg(v.kind,0)}${solidSvg(v.kind,Number(v.rotate||28))}</div>`;
    case 'solid-scene': return solidScene(v.kind);
    case 'solid-property-builder': return solidPropertyBuilder(v.name,v.options||{});
    case 'addition-strategy': return additionStrategyVisual(v);
    case 'subtraction-strategy': return subtractionStrategyVisual(v);
    case 'fact-family': return factFamilyVisual(v);
    case 'problem-structure': return problemStructureVisual(v.case);
    case 'story-question': return problemStructureVisual(v.case,true);
    case 'bond-fill-interactive': return bondFillBuilder(v.whole,v.part,v.pool);
    case 'two-part-story': return twoPartStory(v.whole,v.part);
    case 'base10-build-interactive': return base10BuildBuilder(v.target,v.maxTens,v.maxOnes);
    case 'bundle-story': return bundleStory(v.tens,v.ones);
    case 'order-pair-interactive': return orderPairBuilder(v.a,v.b);
    case 'compare-base10': return compareBase10Visual(v.a,v.b,v.relation);
    case 'shelf-counts': return shelfCountsVisual(v.a,v.b);
    case 'ordinal-line-interactive': return ordinalLineBuilder(v.count);
    case 'ordinal-line': return ordinalLineVisual(v.count,v.marked);
    case 'ordinal-symbol': return `<div class="sg-symbol-card">${v.position}.</div>`;
    case 'race-line': return ordinalLineVisual(v.count,v.position,'YARIŞ');
    case 'base10-operation-build': return base10OperationBuilder(v);
    case 'column-operation': return columnOperationVisual(v.a,v.b,v.op);
    case 'shelf-operation': return shelfOperationVisual(v.a,v.b,v.op);
    case 'equal-groups-interactive': return equalGroupsBuilder(v.groups,v.each);
    case 'share-equally-interactive': return shareEquallyBuilder(v.total,v.groups);
    case 'share-model': return shareModelVisual(v.groups,v.each);
    case 'money-make-interactive': return moneyMakeBuilder(v.target,v.denoms,v.unit);
    case 'price-tag': return `<div class="sg-price-tag"><small>FİYAT</small><b>${v.price} ${v.unit==='kr'?'kr':'TL'}</b></div>`;
    case 'money-compare': return moneyCompareVisual(v.left,v.right,v.unit);
    case 'money-shopping': { const unit=v.unit==='kr'?'kr':'TL'; return `<div class="sg-shopping"><div><small>FİYAT</small><b>${v.price} ${unit}</b></div><span>←</span><div><small>VERİLEN</small><b>${v.pay} ${unit}</b></div></div>`; }
    case 'cm-ruler-interactive': return cmRulerBuilder(v.target,v.max);
    case 'cm-ruler-model': return cmRulerModel(v.cm,v.start,v.max);
    case 'cm-badge': return `<div class="sg-symbol-card"><b>${v.cm}</b><small> cm</small></div>`;
    case 'unit-measure-interactive': return unitMeasureBuilder(v.units,v.max);
    case 'unit-measure-model': return unitMeasureModel(v.units,v.target);
    case 'measurement-rule': return measurementRuleVisual();
    case 'paperclip-measure': return paperclipMeasure(v.units);
    case 'clock-set-interactive': return clockSetBuilder();
    case 'time-label': return `<div class="sg-symbol-card time">${esc(v.label)}</div>`;
    case 'schedule-event': return `<div class="sg-schedule"><small>GÜNLÜK PROGRAM</small><b>${esc(v.label)}</b><span>${esc(v.event||'etkinlik')}</span></div>`;
    case 'shape-compose-interactive': return shapeComposeBuilder(v.figure,v.pieces);
    case 'square-grid-copy-interactive': return squareGridCopyBuilder(v.size||5,v.cells||[],v.figure);
    case 'composite-figure': return compositeFigure(v.figure);
    case 'shape-piece-list': return shapePieceList(v.pieces);
    case 'dot-grid-figure': return dotGridFigure(v.figure);
    case 'shape-pattern-interactive': return shapePatternBuilder(v.items,v.options);
    case 'shape-pattern-option': return shapePatternVisual([...v.items,v.next]);
    case 'shape-pattern': return shapePatternVisual(v.items);
    case 'tile-border': return `<div class="sg-tile-border">${shapePatternVisual(v.items)}</div>`;
    case 'three-add-interactive': return threeAddBuilder(v.values);
    case 'three-add-strategy': return threeAddStrategy(v.values,v.pair,v.total);
    case 'three-box-story': return threeBoxStory(v.values);
    default: return `<div style="position:relative;z-index:1;color:var(--muted)">Model hazırlanıyor.</div>`;
  }
}
function threeAddBuilder(values){
  return `<div class="sg-three-add-builder"><div class="sg-three-groups">${values.map((n,g)=>`<div><small>GRUP ${g+1} · ${n}</small>${Array.from({length:n},(_,i)=>`<button type="button" class="sg-three-token" aria-label="${g+1}. grup ${i+1}. taş"></button>`).join('')}</div>`).join('')}</div><small class="pool-caption">Üç gruptaki bütün taşları toplam alanına taşı.</small></div>`;
}
function threeAddStrategy(values,pair,total){
  return `<div class="sg-strategy"><b>ÜÇ TOPLANAN</b><div class="sg-equation-flow"><span>${values.join(' + ')}</span>${pair!=null?`<i>→</i><span>${pair} + ${values[2]}</span>`:''}${total!=null?`<i>→</i><strong>${total}</strong>`:''}</div></div>`;
}
function threeBoxStory(values){ return `<div class="sg-three-boxes">${values.map((n,i)=>`<div><small>KUTU ${i+1}</small><b>${n}</b></div>`).join('')}</div>`; }
function sgShape(token){
  const [id='circle',size='medium',orientation='0']=String(token).split('|');
  const cls={triangle:'triangle',square:'square',rect:'rect',circle:'circle'}[id]||'circle';
  const sizeCls=size==='small'?'small':size==='large'?'large':'medium';
  const angle=Number(orientation)||0;
  return `<i class="sg-mini-shape ${cls} ${sizeCls}" style="--sg-rot:${angle}deg"></i>`;
}
function additionStrategyVisual(v){
  if(v.strategy==='makeTen'){
    const move=Math.max(0,10-v.a), rest=Math.max(0,v.b-move);
    return `<div class="sg-strategy"><b>10 YAP</b><div class="sg-equation-flow"><span>${v.a}+${v.b}</span><i>→</i><span>${v.a}+${move}+${rest}</span><i>→</i><strong>10+${rest}</strong></div></div>`;
  }
  if(v.strategy==='countOn'){
    return `<div class="sg-strategy"><b>İLERİ SAY</b><div class="sg-hop-row">${Array.from({length:v.b+1},(_,i)=>`<span>${v.a+i}</span>`).join('<i>→</i>')}</div></div>`;
  }
  const base=Math.min(v.a,v.b), adjust=Math.abs(v.a-v.b);
  return `<div class="sg-strategy"><b>${v.strategy==='double'?'ÇİFT':'YAKIN ÇİFT'}</b><div class="sg-double-model"><span>${base}</span><span>${base}</span>${adjust?'<i>+1</i>':''}</div></div>`;
}
function subtractionStrategyVisual(v){
  if(v.strategy==='subtractFrom10'){
    const to10=Math.max(0,v.a-10), after=Math.max(0,v.b-to10);
    return `<div class="sg-strategy"><b>10'DAN GEÇ</b><div class="sg-equation-flow"><span>${v.a}−${v.b}</span><i>→</i><span>${v.a}−${to10}</span><i>→</i><strong>10−${after}</strong></div></div>`;
  }
  if(v.strategy==='inverse') return `<div class="sg-strategy"><b>TERS İLİŞKİ</b><div class="sg-equation-flow"><span>${v.a}−${v.b}=?</span><i>↔</i><strong>?+${v.b}=${v.a}</strong></div></div>`;
  return `<div class="sg-strategy"><b>GERİ SAY</b><div class="sg-hop-row">${Array.from({length:v.b+1},(_,i)=>`<span>${v.a-i}</span>`).join('<i>←</i>')}</div></div>`;
}
function factFamilyVisual(v){
  return `<div class="sg-fact-family"><strong>${v.total}</strong><div><span>${v.a}</span><span>${v.b}</span></div><small>${v.a}+${v.b}=${v.total} · ${v.total}−${v.a}=${v.b}</small></div>`;
}
function problemStructureVisual(c={},question=false){
  const type=c.type||'join-result';
  if(type==='join-result') return `<div class="sg-problem-model"><span>${c.start??'?'}</span><i>＋</i><span>${c.change??'?'}</span><i>→</i><strong>${question?'?':c.result??'?'}</strong></div>`;
  if(type==='join-change') return `<div class="sg-problem-model"><span>${c.start??'?'}</span><i>＋</i><span class="unknown">?</span><i>→</i><strong>${c.result??'?'}</strong></div>`;
  if(type==='separate-result') return `<div class="sg-problem-model"><span>${c.start??'?'}</span><i>−</i><span>${c.change??'?'}</span><i>→</i><strong>?</strong></div>`;
  if(type==='part-missing') return `<div class="sg-partbar"><strong>${c.whole??'?'}</strong><div><span>${c.known??'?'}</span><span>?</span></div></div>`;
  return `<div class="sg-compare-bars"><div style="--n:${c.larger||10}"><b>${c.larger??'?'}</b></div><div style="--n:${c.smaller||6}"><b>${c.smaller??'?'}</b></div><span>fark ?</span></div>`;
}
function bondFillBuilder(whole,part,pool){
  return `<div class="sg-bond-builder"><div class="sg-bond-diagram"><strong>${whole}</strong><div><span>${part}</span><span class="sg-bond-empty">?</span></div></div><div class="sg-token-pool">${Array.from({length:pool},(_,i)=>`<button class="sg-bond-token" type="button" aria-label="${i+1}. eksik parça taşı"></button>`).join('')}</div></div>`;
}
function twoPartStory(whole,part){ return `<div class="sg-partbar"><strong>TOPLAM ${whole}</strong><div><span>Mavi ${part}</span><span>Kırmızı ?</span></div></div>`; }
function base10BuildControls(maxTens=9,maxOnes=9){
  return `<div class="sg-base10-bank"><div><small>ONLUK</small>${Array.from({length:maxTens},(_,i)=>`<button class="sg-base10-ten" type="button" aria-label="${i+1}. onluk"></button>`).join('')}</div><div><small>BİRLİK</small>${Array.from({length:maxOnes},(_,i)=>`<button class="sg-base10-one" type="button" aria-label="${i+1}. birlik"></button>`).join('')}</div></div>`;
}
function base10BuildBuilder(target,maxTens,maxOnes){ return `<div class="sg-base10-builder"><div class="sg-target-pill">HEDEF <b>${target}</b></div>${base10BuildControls(maxTens,maxOnes)}</div>`; }
function pairingSmallVisual(n,leftover){
  const pairs=Math.floor(n/2);
  return `<div class="sg-pairing-small">${Array.from({length:pairs},()=>'<span><i></i><i></i></span>').join('')}${leftover?'<b></b>':''}</div>`;
}
function parityPairBuilder(n,ones){
  return `<div class="sg-parity-builder"><div class="sg-target-pill">SAYI <b>${n}</b></div><small>Birlikleri ikişerli eşleştir</small><div class="sg-pair-token-row">${Array.from({length:ones},()=>'<i class="sg-pair-token"></i>').join('')}</div><button type="button" class="sg-pair-action">Bir çift oluştur</button></div>`;
}
function parityCardVisual(n,ones,leftover){
  const paired=Math.max(0,ones-Number(leftover||0));
  return `<div class="sg-parity-card"><b>${n}</b><div>${Array.from({length:paired},(_,i)=>`<i class="${i%2?'pair-end':'pair-start'}"></i>`).join('')}${Array.from({length:Number(leftover)||0},()=>'<em></em>').join('')}</div></div>`;
}
function twoStepPlanBuilder(a,b,c){
  const row=step=>`<div><small>${step}. ADIM</small><button type="button" class="sg-plan-op" data-step="${step}" data-value="+">＋</button><button type="button" class="sg-plan-op" data-step="${step}" data-value="−">−</button></div>`;
  return `<div class="sg-two-step-plan"><div class="sg-plan-facts"><span>${a}</span><span>${b}</span><span>${c}</span></div>${row(1)}${row(2)}</div>`;
}
function twoStepModelVisual(a,b,c,op1,op2){
  return `<div class="sg-two-step-model"><div><span>${a}</span><strong>${esc(op1)}</strong><span>${b}</span><i>→</i><b>?</b></div><div><b>?</b><strong>${esc(op2)}</strong><span>${c}</span><i>→</i><b>?</b></div></div>`;
}
function base1000BuildControls(maxHundreds=10,maxTens=9,maxOnes=9){
  return `<div class="sg-base1000-bank"><div><small>YÜZLÜK</small>${Array.from({length:maxHundreds},(_,i)=>`<button class="sg-base1000-hundred" type="button" aria-label="${i+1}. yüzlük"></button>`).join('')}</div><div><small>ONLUK</small>${Array.from({length:maxTens},(_,i)=>`<button class="sg-base1000-ten" type="button" aria-label="${i+1}. onluk"></button>`).join('')}</div><div><small>BİRLİK</small>${Array.from({length:maxOnes},(_,i)=>`<button class="sg-base1000-one" type="button" aria-label="${i+1}. birlik"></button>`).join('')}</div></div>`;
}
function base1000BuildBuilder(target,maxHundreds,maxTens,maxOnes){ return `<div class="sg-base1000-builder"><div class="sg-target-pill">HEDEF <b>${target}</b></div>${base1000BuildControls(maxHundreds,maxTens,maxOnes)}</div>`; }
function base1000OperationBuilder(v){ return `<div class="sg-base1000-builder"><div class="sg-operation-header">${v.a} ${esc(v.op)} ${v.b} = ?</div>${base1000BuildControls(v.maxHundreds,v.maxTens,v.maxOnes)}</div>`; }
function base1000Visual(hundreds=0,tens=0,ones=0){
  return `<div class="sg-base1000"><div class="sg-place-column hundreds"><small>YÜZLÜK</small><div>${Array.from({length:Number(hundreds)||0},()=>'<i class="sg-hundred-block"></i>').join('')||'<em>0</em>'}</div><b>${hundreds}</b></div><div class="sg-place-column tens"><small>ONLUK</small><div>${Array.from({length:Number(tens)||0},()=>'<i class="sg-ten-block"></i>').join('')||'<em>0</em>'}</div><b>${tens}</b></div><div class="sg-place-column ones"><small>BİRLİK</small><div>${Array.from({length:Number(ones)||0},()=>'<i class="sg-one-block"></i>').join('')||'<em>0</em>'}</div><b>${ones}</b></div></div>`;
}
function compareBase1000Visual(a,b,relation){
  const mini=n=>{ const h=Math.floor(n/100), t=Math.floor((n%100)/10), o=n%10; return `<div class="sg-mini-base1000"><b>${n}</b><span>${h}Y · ${t}O · ${o}B</span></div>`; };
  return `<div class="sg-compare-base1000">${mini(a)}<strong>${esc(relation)}</strong>${mini(b)}</div>`;
}
function bundleStory(tens,ones){ return `<div class="sg-bundle-story"><div>${Array.from({length:tens},()=>'<span class="bundle">10</span>').join('')}</div><div>${Array.from({length:ones},()=>'<i></i>').join('')||'<em>0 birlik</em>'}</div></div>`; }
function orderPairBuilder(a,b){ return `<div class="sg-order-builder"><small>KÜÇÜKTEN BÜYÜĞE DOKUN</small><div><button type="button" class="sg-order-card" data-value="${a}">${a}</button><button type="button" class="sg-order-card" data-value="${b}">${b}</button></div></div>`; }
function compareBase10Visual(a,b,relation){
  const mini=n=>`<div class="sg-mini-base10"><span>${Math.floor(n/10)} onluk</span><i>${n%10} birlik</i><b>${n}</b></div>`;
  return `<div class="sg-compare-base10">${mini(a)}<strong>${esc(relation)}</strong>${mini(b)}</div>`;
}
function shelfCountsVisual(a,b){ return `<div class="sg-shelf-counts"><div><small>1. RAF</small><b>${a}</b></div><div><small>2. RAF</small><b>${b}</b></div></div>`; }
function ordinalLineBuilder(count){ return `<div class="sg-ordinal-builder"><small>SOLDAN SAY</small><div>${Array.from({length:count},(_,i)=>`<button type="button" class="sg-ordinal-slot" data-value="${i+1}"><i></i><span>${i+1}.</span></button>`).join('')}</div></div>`; }
function ordinalLineVisual(count,marked,label='SIRA'){ return `<div class="sg-ordinal-line"><small>${label}</small><div>${Array.from({length:count},(_,i)=>`<span class="${i+1===Number(marked)?'marked':''}"><i></i><b>${i+1}.</b></span>`).join('')}</div></div>`; }
function base10OperationBuilder(v){ return `<div class="sg-base10-builder"><div class="sg-operation-header">${v.a} ${esc(v.op)} ${v.b} = ?</div>${base10BuildControls(v.maxTens,v.maxOnes)}</div>`; }
function columnOperationVisual(a,b,op){ return `<div class="sg-column-op"><span>${a}</span><span>${esc(op)} ${b}</span><i></i><strong>?</strong></div>`; }
function shelfOperationVisual(a,b,op){ return `<div class="sg-shopping"><div><small>BAŞLANGIÇ</small><b>${a}</b></div><span>${esc(op)}</span><div><small>DEĞİŞİM</small><b>${b}</b></div></div>`; }
function equalGroupsBuilder(groups,each){
  const total=groups*each;
  const boxes=Array.from({length:groups},(_,i)=>`<div class="sg-build-group"><b>Grup ${i+1}</b><strong class="sg-group-count" data-index="${i}">0</strong><div><button type="button" class="sg-group-remove" data-index="${i}">−</button><button type="button" class="sg-group-add" data-index="${i}">＋</button></div></div>`).join('');
  return `<div class="sg-equal-groups-builder" data-total="${total}" data-each="${each}"><small>${total} taşı ${groups} eşit gruba yerleştir</small><div class="sg-group-grid">${boxes}</div></div>`;
}
function shareEquallyBuilder(total,groups){
  const boxes=Array.from({length:groups},(_,i)=>`<div class="sg-build-group"><b>Çocuk ${i+1}</b><strong class="sg-group-count" data-index="${i}">0</strong><div><button type="button" class="sg-group-remove" data-index="${i}">−</button><button type="button" class="sg-group-add" data-index="${i}">＋</button></div></div>`).join('');
  return `<div class="sg-share-builder" data-total="${total}"><small>Dağıtılacak ${total} taş</small><div class="sg-group-grid">${boxes}</div></div>`;
}
function shareModelVisual(groups,each){ return `<div class="sg-group-grid">${Array.from({length:groups},(_,i)=>`<div class="sg-static-group"><small>Grup ${i+1}</small><div>${Array.from({length:each},()=>'<i></i>').join('')}</div></div>`).join('')}</div>`; }
function moneyMakeBuilder(target,denoms,unit='TL'){
  const label=unit==='kr'?'kr':'TL';
  return `<div class="sg-money-builder"><div class="sg-target-pill">HEDEF <b>${target} ${label}</b></div><div class="sg-money-bank">${denoms.flatMap(v=>Array.from({length:v===1?5:4},(_,i)=>`<button type="button" class="sg-money-token" data-value="${v}" aria-label="${v} ${label} para ${i+1}">${v}<small>${label}</small></button>`)).join('')}</div></div>`;
}
function moneyCompareVisual(left,right,unit='TL'){ const label=unit==='kr'?'kr':'TL'; const box=arr=>`<div>${arr.map(n=>`<span class="money-note">${n}<small>${label}</small></span>`).join('')}<b>${arr.reduce((a,b)=>a+b,0)} ${label}</b></div>`; return `<div class="sg-money-compare">${box(left)}<strong>?</strong>${box(right)}</div>`; }
function unitMeasureBuilder(units,max){ return `<div class="sg-unit-builder"><div class="sg-measure-object" style="--u:${units}"></div><div>${Array.from({length:max},(_,i)=>`<button type="button" class="sg-unit-cell" aria-label="${i+1}. ölçü birimi"></button>`).join('')}</div><small>Aynı birimleri uç uca yerleştir.</small></div>`; }
function unitMeasureModel(units,target){ return `<div class="sg-unit-model"><div class="sg-measure-object" style="--u:${target}"></div><div>${Array.from({length:units},()=>'<i></i>').join('')}</div></div>`; }
function measurementRuleVisual(){ return `<div class="sg-measure-rule"><span>başlangıç</span><div>${Array.from({length:6},()=>'<i></i>').join('')}</div><b>boşluk yok · üst üste yok</b></div>`; }
function paperclipMeasure(units){ return `<div class="sg-paperclips"><div class="sg-measure-object" style="--u:${units}"></div><div>${Array.from({length:units},()=>'<span>⌇</span>').join('')}</div></div>`; }
function clockSetBuilder(){
  const minutes=Array.from({length:12},(_,i)=>i*5);
  return `<div class="sg-clock-set"><div class="sg-clock-controls"><small>SAAT</small><div>${Array.from({length:12},(_,i)=>`<button type="button" class="sg-hour-choice" data-value="${i+1}">${i+1}</button>`).join('')}</div><small>DAKİKA · 5'er dakika</small><div>${minutes.map(m=>`<button type="button" class="sg-minute-choice" data-value="${m}">:${String(m).padStart(2,'0')}</button>`).join('')}</div></div></div>`;
}
function cmRulerBuilder(target,max=15){
  const ticks=Array.from({length:max+1},(_,i)=>`<button type="button" class="sg-ruler-tick-button" data-value="${i}" aria-label="${i} santimetre işareti"><i></i><b>${i}</b></button>`).join('');
  return `<div class="sg-cm-ruler-builder" data-target="${target}"><div class="sg-target-pill">HEDEF <b>${target} cm</b></div><div class="sg-cm-ruler-scroll"><div class="sg-cm-ruler-track" style="--max:${max}"><div class="sg-cm-ruler-line" style="--end:0"></div>${ticks}</div></div><small>Çizginin başlangıcı 0'da. Bitiş noktasını seç.</small></div>`;
}


function p2ShapeParts(token){
  const [shape='circle',size='medium',colour='teal',orientation='0']=String(token).split('|');
  return {shape,size,colour,orientation:Number(orientation)||0};
}
function p2ShapeToken(token){
  if(token==='?') return `<span class="p2-shape-gap">?</span>`;
  const x=p2ShapeParts(token), cls=['triangle','square','rect','circle'].includes(x.shape)?x.shape:'circle';
  return `<span class="p2-shape-token ${esc(cls)} ${esc(x.size)} tone-${esc(x.colour)}" style="--turn:${x.orientation}deg" aria-label="${esc(x.size)} ${esc(x.colour)} ${esc(x.shape)}"></span>`;
}
function p2ShapePatternVisual(items){ return `<div class="p2-shape-seq">${(items||[]).map(p2ShapeToken).join('')}</div>`; }
function p2ShapePatternBuilder(items,options){ return `<div class="p2-shape-pattern-builder"><div class="p2-shape-seq">${(items||[]).map(p2ShapeToken).join('')}<span class="p2-shape-gap">?</span></div><div class="p2-shape-bank">${(options||[]).map(token=>`<button type="button" class="p2-shape-choice" data-value="${esc(token)}">${p2ShapeToken(token)}</button>`).join('')}</div></div>`; }

function coneSolidSvg(){
  return `<div class="solid-visual clear-solid"><svg viewBox="0 0 216 176" role="img" aria-label="koni"><ellipse cx="108" cy="132" rx="55" ry="17" class="solid-bottom"/><path d="M53 132 L108 24 L163 132" class="solid-cone-body"/><ellipse cx="108" cy="132" rx="55" ry="17" class="solid-guide"/></svg></div>`;
}
function p2SolidVisual(kind){ return kind==='cone'?coneSolidSvg():solidSvg(kind,0); }
function p2SolidClassifyBuilder(kind,name){
  return `<div class="p2-solid-classify-builder"><div class="p2-solid-target">${p2SolidVisual(kind)}<b>${esc(name)}</b></div><div class="p2-solid-bins"><button type="button" class="p2-solid-bin" data-value="flat-only">Yalnız düz yüzler</button><button type="button" class="p2-solid-bin" data-value="flat-curved">Düz + eğri yüzey</button><button type="button" class="p2-solid-bin" data-value="curved-only">Yalnız eğri yüzey</button></div></div>`;
}
function p2SolidPropertyCard(kind,property){ return `<div class="p2-solid-property-card">${p2SolidVisual(kind)}<small>${esc(property)}</small></div>`; }
function p2SolidScene(kind){
  if(kind==='cone') return `<div class="p2-solid-scene"><svg viewBox="0 0 216 176" role="img" aria-label="trafik konisi"><path d="M108 25 L65 132 H151 Z" class="scene-cone"/><rect x="48" y="130" width="120" height="20" rx="7" class="scene-cone-base"/><rect x="82" y="86" width="52" height="12" class="scene-cone-stripe"/></svg><small>trafik konisi</small></div>`;
  return solidScene(kind);
}

function scaledPictureGraph(cats,icons,scale,highlight=-1){
  return `<div class="p2-scaled-picture-graph"><div class="p2-graph-legend">★ = <b>${scale}</b></div>${(cats||[]).map((cat,i)=>`<div class="p2-graph-row ${Number(highlight)===i?'highlight':''}"><b>${esc(cat)}</b><span>${Array.from({length:Number(icons[i])||0},()=>'<i>★</i>').join('')}</span></div>`).join('')}</div>`;
}
function scaledPictographBuilder(category,target,scale,maxIcons=6){
  return `<div class="p2-scaled-graph-builder"><div class="p2-graph-legend">★ = <b>${scale}</b></div><div class="p2-build-target"><b>${esc(category)}</b><small>HEDEF ${target}</small><div>${Array.from({length:Number(maxIcons)||6},(_,i)=>`<button type="button" class="p2-graph-icon-button" aria-label="${i+1}. resim">★</button>`).join('')}</div></div></div>`;
}

function measureTokenLabel(value,unit){ return `${value} ${unit}`; }
function measureComposeBuilder(target,unit,denoms=[1]){
  const buttons=[];
  for(const value of denoms){
    const copies=value===1?Math.min(12,Math.max(4,Math.ceil(Number(target)/value))):Math.min(5,Math.max(3,Math.ceil(Number(target)/value)+1));
    for(let i=0;i<copies;i++) buttons.push(`<button type="button" class="sg-money-token sg-measure-token" data-value="${value}" aria-label="${measureTokenLabel(value,unit)} ölçü parçası">${value}<small>${esc(unit)}</small></button>`);
  }
  return `<div class="sg-money-builder sg-measure-builder"><div class="sg-target-pill">HEDEF <b>${target} ${esc(unit)}</b></div><div class="sg-money-bank">${buttons.join('')}</div><small class="pool-caption">Standart parçaları seçerek hedef ölçüyü oluştur.</small></div>`;
}
function measureAmountVisual(kind,amount,unit,denoms=[1],showLabel=true){
  let remain=Number(amount)||0, pieces=[];
  for(const d of [...denoms].sort((a,b)=>b-a)) while(remain>=d && pieces.length<14){ pieces.push(d); remain-=d; }
  if(remain>0) pieces.push(remain);
  const icon=kind==='length'?'▭':kind==='mass'?'◆':'▰';
  return `<div class="sg-money-builder"><div class="sg-money-bank">${pieces.map(v=>`<span class="sg-money-token selected" aria-hidden="true">${icon}<small>${v} ${esc(unit)}</small></span>`).join('')}</div>${showLabel?`<div class="sg-target-pill"><b>${amount} ${esc(unit)}</b></div>`:''}</div>`;
}
function measureCompareVisual(kind,left,right,unit){
  return `<div class="sg-shopping"><div><small>SOL</small><b>${left} ${esc(unit)}</b></div><span>↔</span><div><small>SAĞ</small><b>${right} ${esc(unit)}</b></div></div>`;
}
function measureTripleVisual(kind,values,unit){ return `<div class="sg-money-compare">${values.map(v=>`<div><span class="money-note">${v}<small>${esc(unit)}</small></span></div>`).join('')}</div>`; }
function unitContextCard(object,unit){ return `<div class="sg-symbol-card"><small>${esc(object)}</small><b>${esc(unit)}</b></div>`; }
function massFoundationVisual(left,right){ return `<div class="sg-shopping"><div><small>SOL YÜK</small><b>${'●'.repeat(Number(left)||0)}</b></div><span>⚖</span><div><small>SAĞ YÜK</small><b>${'●'.repeat(Number(right)||0)}</b></div></div>`; }
function volumeFoundationVisual(left,right){
  const cup=(level,label)=>`<div style="display:grid;gap:8px;justify-items:center"><div style="width:72px;height:100px;border:3px solid var(--line);border-radius:8px;display:flex;align-items:flex-end;overflow:hidden"><i style="display:block;width:100%;height:${Math.min(90,20+Number(level)*14)}%;background:var(--blue-soft)"></i></div><b>${label}</b></div>`;
  return `<div style="display:flex;justify-content:center;gap:48px;align-items:end">${cup(left,'SOL')}${cup(right,'SAĞ')}</div>`;
}
function clockMinuteSetBuilder(targetHour,targetMinute){
  const hours=Array.from({length:12},(_,i)=>`<button type="button" class="sg-hour-choice" data-value="${i+1}">${i+1}</button>`).join('');
  return `<div class="sg-clock-set sg-clock-minute-set" data-minute="0"><div class="sg-clock-minute-preview">${renderClock(12,0)}</div><div class="sg-clock-controls"><small>SAAT</small><div>${hours}</div><small>DAKİKA · 1 dakikaya kadar</small><div><button type="button" class="sg-minute-choice sg-minute-adjust" data-delta="-5">−5</button><button type="button" class="sg-minute-choice sg-minute-adjust" data-delta="-1">−1</button><b class="sg-minute-live">:00</b><button type="button" class="sg-minute-choice sg-minute-adjust" data-delta="1">+1</button><button type="button" class="sg-minute-choice sg-minute-adjust" data-delta="5">+5</button></div></div></div>`;
}
function durationComposeBuilder(target){
  const spec=[[60,'1 sa',2],[30,'30 dk',2],[10,'10 dk',4],[5,'5 dk',2],[1,'1 dk',5]], buttons=[];
  for(const [value,label,count] of spec) for(let i=0;i<count;i++) buttons.push(`<button type="button" class="sg-money-token sg-duration-token" data-value="${value}">${label}</button>`);
  return `<div class="sg-money-builder sg-duration-builder"><div class="sg-target-pill">HEDEF SÜRE <b>${Math.floor(target/60)} sa ${target%60} dk</b></div><div class="sg-money-bank">${buttons.join('')}</div><small class="pool-caption">Saat ve dakika parçalarını seçerek aynı süreyi kur.</small></div>`;
}
function durationCard(v){
  const left=v.hours!=null||v.minutes!=null?`${Number(v.hours)||0} sa ${Number(v.minutes)||0} dk`:'';
  const right=v.total!=null?`${v.total} dk`:'';
  return `<div class="sg-shopping"><div><small>SAAT + DAKİKA</small><b>${left||'?'}</b></div><span>=</span><div><small>TOPLAM DAKİKA</small><b>${right||'?'}</b></div></div>`;
}
function moneyDecimalCard(cents,label){ return `<div class="sg-shopping"><div><small>KURUŞ</small><b>${cents==null?'?':cents+' kr'}</b></div><span>=</span><div><small>TL GÖSTERİMİ</small><b>${esc(label||'?')}</b></div></div>`; }
function moneyCompareDecimal(values){ return `<div class="sg-money-compare">${(values||[]).map(v=>`<div><span class="money-note">${esc(v)}</span></div>`).join('')}</div>`; }

function cmRulerModel(end,start=0,max=15){
  const safeStart=Math.max(0,Math.min(max,Number(start)||0)), safeEnd=Math.max(safeStart,Math.min(max,Number(end)||0));
  const ticks=Array.from({length:max+1},(_,i)=>`<span class="sg-ruler-static-tick ${i===safeStart?'start':''} ${i===safeEnd?'end':''}"><i></i><b>${i}</b></span>`).join('');
  return `<div class="sg-cm-ruler-model"><div class="sg-cm-ruler-scroll"><div class="sg-cm-ruler-track static" style="--max:${max};--start:${safeStart};--end:${safeEnd}"><div class="sg-cm-ruler-line" style="width:${(safeEnd-safeStart)*40}px;margin-left:${safeStart*40}px"></div>${ticks}</div></div><small>cm</small></div>`;
}

function squareGridCopyBuilder(size,cells,figure){
  const target=new Set((cells||[]).map(String));
  const staticCell=(r,c)=>`<i class="sg-grid-target-cell ${target.has(`${c},${r}`)?'filled':''}"></i>`;
  const copyCell=(r,c)=>`<button type="button" class="sg-grid-copy-cell" data-cell="${c},${r}" aria-label="${r+1}. satır ${c+1}. sütun"></button>`;
  const targetCells=Array.from({length:size*size},(_,i)=>staticCell(Math.floor(i/size),i%size)).join('');
  const copyCells=Array.from({length:size*size},(_,i)=>copyCell(Math.floor(i/size),i%size)).join('');
  return `<div class="sg-square-grid-copy" style="--grid-size:${size}"><div><small>HEDEF</small><div class="sg-copy-grid target">${targetCells}</div></div><span>→</span><div><small>KOPYAN</small><div class="sg-copy-grid copy">${copyCells}</div></div></div>`;
}

function shapePieceSvg(id){
  const shapes={
    square:'<rect x="18" y="18" width="64" height="64" rx="5"/>',
    rect:'<rect x="12" y="28" width="76" height="44" rx="5"/>',
    triangle:'<polygon points="50,12 90,84 10,84"/>',
    circle:'<circle cx="50" cy="50" r="34"/>',
    halfCircle:'<path d="M12 70 A38 38 0 0 1 88 70 L12 70 Z"/>',
    quarterCircle:'<path d="M16 84 L16 16 A68 68 0 0 1 84 84 Z"/>'
  };
  return `<svg class="sg-piece-svg" viewBox="0 0 100 100" aria-hidden="true">${shapes[id]||shapes.square}</svg>`;
}
function compositeFigureSvg(figure){
  const body={
    house:'<polygon points="50,8 88,42 12,42"/><rect x="22" y="42" width="56" height="48" rx="3"/>',
    mushroom:'<path d="M12 48 A38 34 0 0 1 88 48 L12 48 Z"/><rect x="38" y="48" width="24" height="42" rx="3"/>',
    kite:'<polygon points="50,8 86,50 14,50"/><polygon points="14,50 86,50 50,92"/>',
    arch:'<rect x="28" y="42" width="44" height="48" rx="2"/><path d="M12 42 L12 12 A30 30 0 0 1 42 42 Z"/><path d="M88 42 L88 12 A30 30 0 0 0 58 42 Z"/>',
    boat:'<path d="M12 62 A38 30 0 0 0 88 62 L12 62 Z"/><rect x="48" y="18" width="5" height="44"/><polygon points="53,20 82,45 53,45"/>',
    window:'<rect x="12" y="12" width="34" height="34"/><rect x="54" y="12" width="34" height="34"/><rect x="12" y="54" width="34" height="34"/><rect x="54" y="54" width="34" height="34"/>'
  };
  return `<svg class="sg-composite-svg" viewBox="0 0 100 100" role="img" aria-label="birleşik şekil">${body[figure]||body.house}</svg>`;
}
function compositeFigure(figure){ return `<div class="sg-composite-figure">${compositeFigureSvg(figure)}</div>`; }
function dotGridFigure(figure){ return `<div class="sg-composite-figure sg-dot-grid">${compositeFigureSvg(figure)}</div>`; }
function shapePieceList(pieces){ return `<div class="sg-shape-piece-list">${pieces.map((id,i)=>`<div class="sg-piece-chip">${shapePieceSvg(id)}<b>${i+1}</b></div>`).join('')}</div>`; }
function shapeComposeBuilder(figure,pieces){
  const all=['square','triangle','rect','halfCircle','quarterCircle','circle'];
  const bank=[...pieces];
  for(const id of all){ if(bank.length>=pieces.length+2) break; if(!pieces.includes(id)) bank.push(id); }
  return `<div class="sg-shape-compose-builder"><div class="sg-compose-target"><small>HEDEF FİGÜR</small>${compositeFigureSvg(figure)}</div><div class="sg-compose-bank">${bank.map((id,i)=>`<button type="button" class="sg-compose-piece" data-value="${esc(id)}" aria-label="${esc(id)} parçası ${i+1}">${shapePieceSvg(id)}</button>`).join('')}</div><small>Hedef figürü oluşturan parçaların hepsini seç; fazlalıkları dışarıda bırak.</small></div>`;
}
function shapePatternBuilder(items,options){ return `<div class="sg-shape-pattern-builder"><div class="sg-shape-seq">${items.map(sgShape).join('')}<span class="sg-shape-gap">?</span></div><div class="sg-shape-bank">${options.map(id=>`<button type="button" class="sg-shape-choice" data-value="${esc(id)}">${sgShape(id)}</button>`).join('')}</div></div>`; }
function shapePatternVisual(items){ return `<div class="sg-shape-seq">${items.map(sgShape).join('')}</div>`; }
function balanceFillBuilder(left,rightBase,pool){
  const leftTotal=left.reduce((a,b)=>a+Number(b),0), tokenCount=Math.max(1,Number(pool||0));
  return `<div class="balance-fill-builder" data-right-base="${rightBase}"><div class="builder-balance"><div class="balance-card"><small>SOL</small><b>${left.join(' + ')}</b><em>${leftTotal}</em></div><span>=</span><div class="balance-card"><small>SAĞ</small><b>${rightBase} + <span class="balance-missing">?</span></b><em class="balance-preview-count">${rightBase}</em></div></div><div class="balance-token-pool">${Array.from({length:tokenCount},(_,i)=>`<button type="button" class="balance-token" aria-label="${i+1}. taşı sağ tarafa ekle"></button>`).join('')}</div><small class="pool-caption">Gereken taşları seç; fazla taşları dışarıda bırak.</small></div>`;
}
function equalShelvesStory(left,rightBase){
  const total=left.reduce((a,b)=>a+Number(b),0);
  return `<div class="equal-shelves"><div class="shelf"><span>1. RAF</span><div>${Array.from({length:Math.min(total,14)},()=>'<i></i>').join('')}</div><b>${left.join(' + ')}</b></div><div class="shelf"><span>2. RAF</span><div>${Array.from({length:Math.min(rightBase,14)},()=>'<i class="other"></i>').join('')}</div><b>${rightBase} + ?</b></div></div>`;
}
function storyAddBuilder(initial,pool,targetAdd){
  const slots=Math.max(Number(targetAdd||0)+2,Number(pool||0));
  return `<div class="story-add-builder"><div class="story-start"><span>BAŞLANGIÇ · ${initial}</span><div>${Array.from({length:initial},()=>'<i></i>').join('')}${Array.from({length:slots},()=>'<i class="story-added-slot"></i>').join('')}</div></div><div class="story-add-pool">${Array.from({length:pool},(_,i)=>`<button type="button" class="story-add-token" aria-label="${i+1}. yeni taşı ekle"></button>`).join('')}</div><small class="pool-caption">Hikâyede eklenen kadar taşı seç.</small></div>`;
}
function storyOperationModel(a,b,op){
  return `<div class="story-operation-model"><div class="story-group">${Array.from({length:a},()=>'<i></i>').join('')}<b>${a}</b></div><span>${op}</span><div class="story-group change">${Array.from({length:b},()=>'<i></i>').join('')}<b>${b}</b></div></div>`;
}
function contextChangeStory(a,b,op){
  return `<div class="context-change-story"><div class="context-badge">${a}</div><span>${op}</span><div class="context-badge alt">${b}</div><div class="context-question">?</div></div>`;
}
function patternStepBuilder(seq,candidates){
  const last=seq.at(-1);
  return `<div class="pattern-step-builder" data-last="${last}"><div class="sequence-row">${seq.map(x=>`<span>${x}</span>`).join('')}<span class="pattern-preview">?</span></div><div class="pattern-step-controls">${candidates.map(step=>`<button type="button" class="pattern-step-button" data-step="${step}">${step>0?'+':''}${step}</button>`).join('')}</div><small class="pool-caption">Bir adım seç; son sayı bu adımla ilerleyecek.</small></div>`;
}
function elevatorPattern(start,step,moves){
  const floors=Array.from({length:moves+1},(_,i)=>start+i*step);
  return `<div class="elevator-pattern"><div class="elevator-shaft">${floors.slice().reverse().map((f,i)=>`<div class="floor ${i===0?'target':''}"><span>${f}</span></div>`).join('')}</div><div class="elevator-note">Her hareket <b>${step>0?'+':''}${step}</b></div></div>`;
}
function shapePropertyBuilder(shape,name){
  const straightOptions=[['0','0 düz'],['1','1 düz'],['2','2 düz'],['3','3 düz'],['4','4 düz']];
  const curveOptions=[['0','0 eğri'],['1','1 eğri']];
  const structureOptions=[
    ['3 düz kenar','3 düz kenar'],['4 eşit düz kenar','4 eşit'],['karşılıklı eşit düz kenarlar','karşılıklı eşit'],
    ['yalnız eğri sınır','yalnız eğri'],['1 düz kenar + 1 eğri sınır','1 düz + 1 eğri'],['2 düz kenar + 1 eğri sınır','2 düz + 1 eğri']
  ];
  const row=(group,label,arr)=>`<div class="property-row"><span>${label}</span><div class="property-chip-wrap">${arr.map(([v,l])=>`<button type="button" class="property-chip" data-group="${group}" data-value="${esc(v)}">${esc(l)}</button>`).join('')}</div></div>`;
  return `<div class="shape-property-builder"><div class="shape-builder-target"><div class="shape-visual ${esc(shape)}"></div><b>${esc(name)}</b></div><div class="property-bank">${row('straight','DÜZ',straightOptions)}${row('curves','EĞRİ',curveOptions)}${row('structure','YAPI',structureOptions)}</div></div>`;
}

function solidSvg(kind,rotate=0){
  const label={cube:'küp',cuboid:'dikdörtgen prizma',sphere:'küre',cylinder:'silindir'}[kind]||'geometrik cisim';
  let body='';
  if(kind==='cube'){
    body=`<polygon points="54,42 112,16 166,48 108,76" class="solid-top"/><polygon points="54,42 108,76 108,142 54,108" class="solid-left"/><polygon points="108,76 166,48 166,114 108,142" class="solid-right"/>`;
  }else if(kind==='cuboid'){
    body=`<polygon points="32,54 114,20 184,56 102,90" class="solid-top"/><polygon points="32,54 102,90 102,140 32,104" class="solid-left"/><polygon points="102,90 184,56 184,106 102,140" class="solid-right"/>`;
  }else if(kind==='cylinder'){
    body=`<ellipse cx="108" cy="39" rx="51" ry="18" class="solid-top"/><path d="M57 39v88c0 10 23 18 51 18s51-8 51-18V39" class="solid-cylinder-body"/><ellipse cx="108" cy="127" rx="51" ry="18" class="solid-bottom"/><ellipse cx="108" cy="39" rx="51" ry="18" class="solid-top"/>`;
  }else{
    body=`<circle cx="108" cy="88" r="61" class="solid-sphere-body"/><ellipse cx="108" cy="88" rx="61" ry="20" class="solid-guide"/><path d="M108 27c-22 16-34 37-34 61s12 45 34 61M108 27c22 16 34 37 34 61s-12 45-34 61" class="solid-guide"/>`;
  }
  return `<div class="solid-visual clear-solid" style="--solid-rot:${Number(rotate)||0}deg"><svg viewBox="0 0 216 176" role="img" aria-label="${esc(label)}">${body}</svg></div>`;
}
function solidScene(kind){
  const label={can:'konserve kutusu',ball:'top',dice:'zar',box:'kutu'}[kind]||'günlük nesne';
  let body='';
  if(kind==='can'){
    body=`<ellipse cx="108" cy="35" rx="48" ry="15" class="scene-metal"/><path d="M60 35v94c0 9 22 17 48 17s48-8 48-17V35" class="scene-can"/><ellipse cx="108" cy="129" rx="48" ry="17" class="scene-metal"/><rect x="68" y="66" width="80" height="42" rx="7" class="scene-label"/>`;
  }else if(kind==='ball'){
    body=`<circle cx="108" cy="88" r="61" class="scene-ball"/><path d="M52 88h112M108 27c-18 18-28 39-28 61s10 43 28 61M108 27c18 18 28 39 28 61s-10 43-28 61" class="scene-line"/>`;
  }else if(kind==='dice'){
    body=`<polygon points="54,42 112,16 166,48 108,76" class="scene-dice-top"/><polygon points="54,42 108,76 108,142 54,108" class="scene-dice-left"/><polygon points="108,76 166,48 166,114 108,142" class="scene-dice-right"/><circle cx="83" cy="71" r="5" class="scene-dot"/><circle cx="137" cy="74" r="5" class="scene-dot"/><circle cx="137" cy="102" r="5" class="scene-dot"/><circle cx="80" cy="96" r="5" class="scene-dot"/>`;
  }else{
    body=`<polygon points="28,58 112,22 188,60 104,96" class="scene-box-top"/><polygon points="28,58 104,96 104,145 28,107" class="scene-box-left"/><polygon points="104,96 188,60 188,109 104,145" class="scene-box-right"/><rect x="120" y="83" width="48" height="25" rx="4" class="scene-box-label"/>`;
  }
  return `<div class="solid-scene-visual"><svg viewBox="0 0 216 176" role="img" aria-label="${esc(label)}">${body}</svg></div>`;
}
function solidPropertyBuilder(name,options){
  const rows=[
    ['flat','DÜZ YÜZ',options.flat||[['0','0'],['2','2'],['6','6']],'Düz yüz sayısı'],
    ['curved','EĞRİ YÜZEY',options.curved||[['0','Yok'],['1','1']],'Eğri yüzey'],
    ['face','YÜZ BİÇİMİ',options.face||[['square','Kare'],['rectangle','Dikdörtgen'],['circle','Daire'],['none','Düz yüz yok']],'Düz yüzlerin biçimi']
  ];
  return `<div class="solid-property-builder"><div class="solid-builder-name"><small>HEDEF CİSİM</small><b>${esc(name)}</b></div><div class="solid-property-bank">${rows.map(([group,label,items,aria])=>`<div class="solid-property-row"><span>${label}</span><div>${items.map(([value,text])=>`<button type="button" class="solid-property-chip" data-group="${group}" data-value="${esc(value)}" aria-label="${esc(aria)}: ${esc(text)}">${esc(text)}</button>`).join('')}</div></div>`).join('')}</div></div>`;
}

function lengthAlignBuilder(a,b){
  return `<div class="length-align-builder"><div class="align-canvas"><div class="align-bar blue" style="--len:${a}"></div><div class="align-bar orange" style="--len:${b}"></div><div class="align-origin"></div></div><button type="button" class="align-lengths">Başlangıçları hizala</button><div class="length-choice-row"><button type="button" class="length-choice" data-value="Mavi">Mavi daha uzun</button><button type="button" class="length-choice" data-value="Turuncu">Turuncu daha uzun</button><button type="button" class="length-choice" data-value="Eşit">Eşit</button></div></div>`;
}
function ribbonCompareStory(a,b){
  return `<div class="ribbon-story"><div class="ribbon blue" style="--len:${a}"><span>Mavi</span></div><div class="ribbon orange" style="--len:${b}"><span>Turuncu</span></div><div class="ribbon-start"></div></div>`;
}
function rawDataList(cats,vals){
  return `<div class="raw-data-list">${cats.map((cat,i)=>`<div><b>${esc(cat)}</b><span>${Array.from({length:vals[i]},()=>'<i></i>').join('')}</span></div>`).join('')}</div>`;
}
function pictographRowBuilder(cats,vals,targetIndex){
  const target=cats[targetIndex], max=Math.max(6,...vals);
  return `<div class="pictograph-row-builder"><div class="raw-data-list">${cats.map((cat,i)=>`<div class="${i===targetIndex?'target':''}"><b>${esc(cat)}</b><span>${Array.from({length:vals[i]},()=>'<i></i>').join('')}</span></div>`).join('')}</div><div class="pic-build-target"><b>${esc(target)} grafiği</b><div>${Array.from({length:max},(_,i)=>`<button type="button" class="pic-build-cell" aria-label="${i+1}. grafik sembolü"></button>`).join('')}</div></div></div>`;
}
function interactiveTwentyFrame(target){
  return `<div class="twentyframe-board"><span class="manipulator-note">${target} miktarını kur</span><div class="interactive-twentyframe">${Array.from({length:20},(_,i)=>`<button type="button" aria-label="${i+1}. hücre"></button>`).join('')}</div><div class="target-number-badge">HEDEF <b>${target}</b></div></div>`;
}
function twentyFrameModel(n){
  return `<div class="twentyframe-model">${[0,1].map(frame=>`<div class="model-tenframe">${Array.from({length:10},(_,i)=>`<i class="${frame*10+i<n?'base':''}"></i>`).join('')}</div>`).join('')}</div>`;
}
function beadBundleStory(rest){
  return `<div class="bead-story"><div class="bead-box"><b>10</b><small>boncuk</small></div><span>＋</span><div class="loose-beads">${Array.from({length:rest},()=>'<i></i>').join('')}${rest===0?'<em>0</em>':''}</div></div>`;
}
function twoColorBeadStory(first,second){
  return `<div class="two-color-beads"><div class="bead-group first">${Array.from({length:first},()=>'<i></i>').join('')}<b>${first}</b></div><span>＋</span><div class="bead-group second">${Array.from({length:second},()=>'<i></i>').join('')}<b>${second}</b></div></div>`;
}
function interactiveCompleteTenFrame(initial,pool){
  const tokenCount=Math.max(10-initial,Number(pool||0));
  return `<div class="complete-tenframe-builder" data-base="${initial}"><span class="manipulator-note">Aşağıdaki taşlardan gerekenleri çerçeveye taşı</span><div class="interactive-tenframe">${Array.from({length:10},(_,i)=>`<i class="complete-cell ${i<initial?'base':''}" aria-label="${i<initial?'önceden dolu':'boş'} hücre"></i>`).join('')}</div><div class="complete-token-pool">${Array.from({length:tokenCount},(_,i)=>`<button type="button" class="complete-token" aria-label="${i+1}. taşı yerleştir"></button>`).join('')}</div><small class="pool-caption">Gerekmeyen taşları dışarıda bırakabilirsin.</small></div>`;
}
function tenFrameCompletionModel(base,added){
  const total=base+added, insideAdded=Math.max(0,Math.min(10-base,added)), overflow=Math.max(0,total-10);
  return `<div class="model-tenframe-wrap"><div class="model-tenframe">${Array.from({length:10},(_,i)=>`<i class="${i<base?'base':i<base+insideAdded?'added':''}"></i>`).join('')}</div>${overflow?`<div class="overflow-dots">${Array.from({length:overflow},()=>'<i></i>').join('')}</div>`:''}<div class="model-caption">${base} + ${added}</div></div>`;
}
function addToTenBuilder(a,b){
  return `<div class="add-to-ten-builder" data-base="${a}"><div class="builder-column"><span>İLK GRUP</span><div class="builder-tenframe">${Array.from({length:10},(_,i)=>`<i class="target-cell ${i<a?'base':''}"></i>`).join('')}</div></div><div class="builder-arrow">←</div><div class="builder-column"><span>TAŞIYABİLECEĞİN GRUP · ${b}</span><div class="move-token-pool">${Array.from({length:b},(_,i)=>`<button type="button" class="move-token" aria-label="${i+1}. taşı taşı"></button>`).join('')}</div></div></div>`;
}
function make10SplitModel(a,b,move,rest){
  const total=Math.min(10,a+move);
  return `<div class="split-model"><div class="split-equation">${b} = <b>${move}</b> + ${rest}</div><div class="model-tenframe">${Array.from({length:10},(_,i)=>`<i class="${i<a?'base':i<total?'added':''}"></i>`).join('')}</div><div class="split-rest">kalan <b>${rest}</b></div></div>`;
}
function removeCountersBuilder(total){
  return `<div class="remove-counter-builder"><span class="manipulator-note">Çıkarmak istediğin taşlara dokun</span><div class="remove-token-grid">${Array.from({length:total},(_,i)=>`<button type="button" class="remove-token" aria-label="${i+1}. taş"></button>`).join('')}</div></div>`;
}
function subtractionNumberLineModel(start,steps,end){
  const min=Math.max(0,Math.min(end,start)-1), max=Math.min(20,Math.max(end,start)+1), span=Math.max(1,max-min);
  const pos=n=>((n-min)/span*100);
  return `<div class="mini-numberline"><div class="mini-line"></div><i class="start-dot" style="left:${pos(start)}%"></i><i class="end-dot" style="left:${pos(end)}%"></i><div class="mini-jump" style="left:${Math.min(pos(start),pos(end))}%;width:${Math.abs(pos(start)-pos(end))}%"></div><div class="mini-number-label start" style="left:${pos(start)}%">${start}</div><div class="mini-number-label end" style="left:${pos(end)}%">${end}</div><span>${steps} adım geri</span></div>`;
}
function subtractionDecomposition(v){
  return `<div class="decomposition-card"><div>${v.a}</div><span>− ${v.to10}</span><strong>10</strong><span>− ${v.after10}</span><div>${v.result}</div></div>`;
}
function seatRow(occupied,total){
  return `<div class="seat-row">${Array.from({length:total},(_,i)=>`<i class="${i<occupied?'occupied':''}">${i<occupied?'●':'○'}</i>`).join('')}</div>`;
}
function stickerStory(a,b,op){
  return `<div class="sticker-story"><div class="sticker-pack">${a}<small>başlangıç</small></div><div class="story-op">${esc(op)}</div><div class="sticker-pack second">${b}<small>${op==='+'?'eklenen':'ayrılan'}</small></div></div>`;
}
function interactiveTenFrame(n){
  return `<div style="position:relative;z-index:1;text-align:center"><span class="manipulator-note">Boş hücrelere dokunabilirsin</span><div class="tap-tenframe">${Array.from({length:10},(_,i)=>`<button type="button" class="${i<n?'filled':''}" ${i<n?'disabled':''} aria-label="${i<n?'dolu':'boş'} hücre"></button>`).join('')}</div><div class="manipulator-count">Şu an <b id="manipulatorCount">${n}</b> nokta görünüyor.</div></div>`;
}
function tenFrame(n,cls=''){
  const frames=Math.max(1,Math.ceil(n/10)); let html='';
  for(let f=0;f<frames;f++){ const fill=Math.max(0,Math.min(10,n-f*10)); html+=`<div class="tenframe ${cls}">${Array.from({length:10},(_,i)=>`<i class="${i<fill?'filled':''}"></i>`).join('')}</div>`; }
  return `<div class="tenframe-wrap">${html}</div>`;
}
function numberLine(a,b,max){
  const endValue=a, result=a-b; const start=Math.max(0,result-2), end=Math.min(max,endValue+2), span=Math.max(1,end-start);
  const left=(result-start)/span*100, right=(endValue-start)/span*100;
  return `<div class="numberline"><div class="jump" style="left:${left}%;width:${Math.max(10,right-left)}%"></div><div class="line"></div><div class="ticks">${Array.from({length:11},()=>'<i></i>').join('')}</div><div class="labels"><span>${start}</span><span>${Math.round((start+end)/2)}</span><span>${end}</span></div></div>`;
}

function fractionStrip(numerator=0,denom=2){
  const d=Math.max(2,Number(denom)||2), n=Math.max(0,Math.min(d,Number(numerator)||0));
  return `<div class="sg-fraction-strip" style="--den:${d}" aria-label="${d} eş parçadan ${n} boyalı">${Array.from({length:d},(_,i)=>`<i class="${i<n?'filled':''}"></i>`).join('')}</div>`;
}
function fractionShadeBuilder(denom,target){
  const d=Math.max(2,Number(denom)||2), t=Math.max(1,Math.min(d,Number(target)||1));
  return `<div class="sg-fraction-shade-builder" data-target="${t}" data-paint-count="0"><small>${d} EŞ PARÇA</small><div class="sg-fraction-strip interactive paintable" style="--den:${d}" role="group" aria-label="${d} eş parçadan ${t} tanesini boya">${Array.from({length:d},(_,i)=>`<button type="button" class="sg-fraction-cell" data-ink="0" aria-pressed="false" aria-label="${i+1}. eş parça"></button>`).join('')}</div><div class="sg-fraction-paint-tools"><em>Parmağınla veya kalemle ${t} parçayı boya</em><button type="button" class="sg-fraction-clear">Temizle</button></div></div>`;
}
function fractionPairBuilder(left,right){
  const row=(side,f)=>`<div data-side="${side}"><b>${f.numerator}/${f.denom}</b><div class="sg-fraction-strip interactive" style="--den:${f.denom}">${Array.from({length:f.denom},(_,i)=>`<button type="button" class="sg-fraction-cell" aria-label="${side} ${i+1}. parça"></button>`).join('')}</div></div>`;
  return `<div class="sg-fraction-pair-builder">${row('left',left)}${row('right',right)}</div>`;
}
function fractionPairVisual(left,right){ return `<div class="sg-fraction-pair"><div>${fractionStrip(left.numerator,left.denom)}<b>${left.numerator}/${left.denom}</b></div><strong>↔</strong><div>${fractionStrip(right.numerator,right.denom)}<b>${right.numerator}/${right.denom}</b></div></div>`; }
function fractionOperationBuilder(v){
  const resultCells=Array.from({length:v.denom},(_,i)=>`<button type="button" class="sg-fraction-cell" aria-label="sonuç ${i+1}. parça"></button>`).join('');
  return `<div class="sg-fraction-operation-builder"><div class="sg-fraction-operation-row"><div>${fractionStrip(v.a,v.denom)}<b>${v.a}/${v.denom}</b></div><strong>${esc(v.op)}</strong><div>${fractionStrip(v.b,v.denom)}<b>${v.b}/${v.denom}</b></div></div><span>↓ SONUÇ</span><div class="sg-fraction-result sg-fraction-strip interactive" style="--den:${v.denom}">${resultCells}</div></div>`;
}
function fractionOperationVisual(v){
  const result=v.result==null?'?':`${v.result}/${v.denom}`;
  return `<div class="sg-fraction-operation-row"><div>${fractionStrip(v.a,v.denom)}<b>${v.a}/${v.denom}</b></div><strong>${esc(v.op)}</strong><div>${fractionStrip(v.b,v.denom)}<b>${v.b}/${v.denom}</b></div><strong>=</strong><div>${v.result==null?'<span class="sg-fraction-question">?</span>':fractionStrip(v.result,v.denom)}<b>${result}</b></div></div>`;
}
function fractionNotationCard(n,d){ return `<div class="sg-fraction-notation-card">${fractionStrip(n,d)}<div><b>${n}</b><i></i><b>${d}</b></div><small>${d} eş parçadan ${n}’ü</small></div>`; }
function equalPartsGuide(denom){ return `<div class="sg-equal-parts-guide">${fractionStrip(0,denom)}<small>Bütün ${denom} eş parçaya ayrılmış.</small></div>`; }
function chocolateParts(denom){ return `<div class="sg-chocolate-parts" style="--den:${denom}">${Array.from({length:denom},(_,i)=>`<i>${i+1}</i>`).join('')}</div>`; }
function pizzaFraction(n,d){ return `<div class="sg-pizza-fraction"><span>🍕</span>${fractionStrip(n,d)}<b>${d} dilimden ${n}’ü</b></div>`; }

function fractionSvg(denom){
  if(denom===2) return `<svg class="fraction-svg" viewBox="0 0 100 100" aria-label="yarım model"><path d="M50 50 L50 5 A45 45 0 0 1 50 95 Z" fill="#2f9987"/><path d="M50 50 L50 95 A45 45 0 0 1 50 5 Z" fill="#fff"/><circle cx="50" cy="50" r="45" fill="none" stroke="#66716c" stroke-width="2"/><line x1="50" y1="5" x2="50" y2="95" stroke="#66716c" stroke-width="2"/></svg>`;
  return `<svg class="fraction-svg" viewBox="0 0 100 100" aria-label="çeyrek model"><circle cx="50" cy="50" r="45" fill="#fff"/><path d="M50 50 L50 5 A45 45 0 0 1 95 50 Z" fill="#2f9987"/><circle cx="50" cy="50" r="45" fill="none" stroke="#66716c" stroke-width="2"/><line x1="50" y1="5" x2="50" y2="95" stroke="#66716c" stroke-width="2"/><line x1="5" y1="50" x2="95" y2="50" stroke="#66716c" stroke-width="2"/></svg>`;
}
function shapeScene(shape){
  // Reuse the canonical shape renderer so daily-life transfer options preserve
  // half/quarter-circle geometry instead of approximating it with clip paths.
  const safe=['circle','triangle','square','rect','halfCircle','quarterCircle'].includes(shape)?shape:'circle';
  return `<div class="shape-scene has-shape"><div class="shape-visual ${safe}" aria-hidden="true"></div></div>`;
}
function renderSort(mode){
  if(mode==='size') return `<div class="sort-visual"><div class="sort-bin"><i class="sort-item big"></i><i class="sort-item square big"></i></div><div class="sort-bin"><i class="sort-item"></i><i class="sort-item square"></i></div></div>`;
  return `<div class="sort-visual"><div class="sort-bin"><i class="sort-item"></i><i class="sort-item big"></i></div><div class="sort-bin"><i class="sort-item square"></i><i class="sort-item square big"></i></div></div>`;
}
function renderPosition(relation){
  const styles={üstünde:'left:128px;top:5px',altında:'left:128px;top:160px',solunda:'left:28px;top:82px',sağında:'left:228px;top:82px'};
  return `<div class="position-visual"><div class="position-ref"></div><div class="position-dot" style="${styles[relation]||styles.üstünde}"></div></div>`;
}
function renderLengthBars(v){
  const max=Math.max(v.a,v.b,1); const wA=Math.round(v.a/max*94), wB=Math.round(v.b/max*94);
  const shiftBlue=v.misaligned&&v.shift==='blue'?'margin-left:13%;':'';
  const shiftOrange=v.misaligned&&v.shift!=='blue'?'margin-left:13%;':'';
  return `<div class="length-visual"><div class="length-row blue" style="width:${wA}%;${shiftBlue}"></div><div class="length-row orange" style="width:${wB}%;${shiftOrange}"></div></div>`;
}
function renderRuler(n){
  const max=15; const ticks=Array.from({length:max+1},(_,i)=>`<i class="ruler-tick ${i%5===0?'major':''}"><span>${i}</span></i>`).join('');
  return `<div class="ruler"><div class="ruler-object" style="width:${Math.max(10,n/max*96)}%"></div><div class="ruler-track">${ticks}</div></div>`;
}
function renderClock(hour,minute){
  const minuteAngle=minute*6; const hourAngle=(hour%12)*30+minute*.5;
  const hand=(angle,length)=>{ const rad=(angle-90)*Math.PI/180; return [50+Math.cos(rad)*length,50+Math.sin(rad)*length]; };
  const [hx,hy]=hand(hourAngle,25), [mx,my]=hand(minuteAngle,34);
  const nums=Array.from({length:12},(_,i)=>{const n=i+1,rad=(n*30-90)*Math.PI/180,x=50+Math.cos(rad)*40,y=50+Math.sin(rad)*40+1.5;return `<text x="${x}" y="${y}" text-anchor="middle" font-size="6" font-weight="800" fill="#53636b">${n}</text>`;}).join('');
  return `<svg class="clock-svg" viewBox="0 0 100 100" aria-label="analog saat"><circle cx="50" cy="50" r="47" fill="#fffdf8" stroke="#d9d2c3" stroke-width="2"/>${nums}<line x1="50" y1="50" x2="${hx}" y2="${hy}" stroke="#19364b" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="50" x2="${mx}" y2="${my}" stroke="#df7564" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="50" r="3.5" fill="#2f9987"/></svg>`;
}

function registerSW(){ if('serviceWorker' in navigator && (location.protocol==='http:'||location.protocol==='https:')) navigator.serviceWorker.register('./sw.js').catch(()=>{}); }
