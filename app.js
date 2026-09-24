import {
  REPRESENTATIONS, REPRESENTATION_META, PROFILE_META, skillsFor, defaultState, ensureSkillState,
  masteryPercent, evidenceCoverage, generateQuestion, generateLearningQuestion, createConceptInstance, applyAnswer, consumeReview,
  profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan, evaluatePracticeCheckpoint, classifyFractionPaint, currentCurriculumSkill, curriculumSkillUnlocked, ensureLearningArchitectureState, curriculumUnitsFor, lessonProgressSnapshot, lessonAccessState, lessonContractFor, recordPracticeSectionAttempt, resetPracticeSectionCycle, generateLessonPracticeQuestion, practiceSectionCompletionAllowed, runPedagogyStateAudit, patternContinuationRule
} from './engine.mjs';

const STORAGE_KEY='saymera.math.v2';
const INSPECTOR_ENABLED=new URLSearchParams(location.search).get('inspect')==='1';
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
  numberPattern1000:{headline:'Örüntüde aynı miktar değişimini gör.',lead:'1, 10 ve 100 daha/az; bir birlik, bir onluk veya bir yüzlük kadar değişimi anlatır. Basamak sınırında yeniden gruplama olabilir.',takeaway:'Önce kuralı söyle; sonra aynı miktar değişimini sürdür.'},
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
const LESSON_FIRST_SKILLS=new Set(['nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns','nelRoteCount20','nelReliableCount10','nelSubitise5','number1000','compareOrder1000','numberPattern1000','oddEven1000']);
const NUMBER1000_LESSON_VERSION=6;
const NUMBER1000_SECTIONS=['GRUPLA','SAY','KUR','BASAMAK','OKU / YAZ'];
const NUMBER1000_LESSON_STEPS=[
  {id:'ten-bundle',section:'GRUPLA',moe:'1.1',kind:'bundle',unit:'one',title:'10 birlik, 1 onluk olur.',body:'10 tek birlik bir araya geldiğinde 1 onluk oluşturur.',equation:'10 birlik = 1 onluk',resultValue:'1',resultLabel:'onluk'},
  {id:'count-tens',section:'SAY',moe:'1.1',kind:'count',unit:'ten',title:'Onar onar 100’e kadar sayalım.',body:'Her çubuk 1 onluktur. Dokundukça kaç onluk olduğunu ve toplam sayıyı birlikte büyütelim.',equation:'10 onluk = 1 yüzlük = 100',stepValue:10,unitName:'onluk'},
  {id:'count-hundreds',section:'SAY',moe:'1.1',kind:'count',unit:'hundred',title:'Yüzer yüzer 1000’e kadar sayalım.',body:'Her kare 1 yüzlüktür. Dokundukça yüzlük sayısı ve toplam birlikte büyüyecek.',equation:'10 yüzlük = 1000 = bin',stepValue:100,unitName:'yüzlük'},
  {id:'hundred-sense',section:'SAY',moe:'1.1',kind:'hundred-sense',title:'100 ne kadar büyük bir miktardır?',body:'Önce bütün noktaları gör. Sonra satırlara bakarak 100’ün nasıl oluştuğunu açalım.',equation:'10 sıra × 10 nokta = 100 nokta'},
  {id:'model-build',section:'KUR',moe:'1.2',kind:'model-build',title:'Modelden sayıya geçelim.',body:'Yüzlük, onluk ve birlik gruplarını açtıkça sayının rakamları sırayla oluşacak.',number:'347',groups:[['Yüzlük',3,'3'],['Onluk',4,'4'],['Birlik',7,'7']],equation:'3 yüzlük + 4 onluk + 7 birlik = 347'},
  {id:'place-value',section:'BASAMAK',moe:'1.2',kind:'place-model',title:'347’nin her rakamı neyi gösteriyor?',body:'Rakamın altında o miktarı gerçekten görelim: yüzlükler, onluklar ve birlikler.',number:'347',values:[['3','Yüzlük','300',3],['4','Onluk','40',4],['7','Birlik','7',7]],equation:'347 = 300 + 40 + 7'},
  {id:'same-digit',section:'BASAMAK',moe:'1.2',kind:'place-model',title:'Aynı rakam, farklı yerde farklı değer taşır.',body:'444 sayısındaki her 4’ün altında farklı miktar modeli vardır.',number:'444',values:[['4','Yüzlük','400',4],['4','Onluk','40',4],['4','Birlik','4',4]],equation:'444 = 400 + 40 + 4'},
  {id:'zero-place',section:'BASAMAK',moe:'1.2',kind:'zero-place',title:'Bir basamakta hiç parça yoksa 0 yazarız.',body:'304 ve 470 modellerinde boş kalan basamağı gör. 0, o basamakta hiç parça olmadığını gösterir.',equation:'304 = 3 yüzlük + 0 onluk + 4 birlik   •   470 = 4 yüzlük + 7 onluk + 0 birlik'},
  {id:'read-write',section:'OKU / YAZ',moe:'1.3',kind:'read-write',title:'347’yi sözcüklerle okuyalım.',body:'Rakamların gösterdiği parçaları aç; sonra sözcükleri bir araya getir.',number:'347',wordParts:['üç yüz','kırk','yedi'],equation:'347 ↔ üç yüz kırk yedi'},
  {id:'word-build',section:'OKU / YAZ',moe:'1.3',kind:'word-build',title:'526’nın yazılışını sen kur.',body:'Sözcük kartlarını doğru yerlere sürükleyip bırak. İstersen karta ve sonra yuvaya dokunarak da yerleştirebilirsin.',number:'526',wordParts:['beş yüz','yirmi','altı'],equation:'526 = beş yüz yirmi altı'}
];

function lessonSectionTrack(step){
  return '<div class="lesson-section-track" aria-label="Ders bölümleri">'+NUMBER1000_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>';
}
function lessonInsightMarkup(step){
  return '<div class="lesson-insight" id="lessonInsight" aria-live="polite"><span>ŞUNU GÖRDÜK</span><strong>'+esc(step.equation)+'</strong></div>';
}
function baseTenToken(unit){
  const cls=unit==='ten'?'lesson-unit-ten':unit==='hundred'?'lesson-unit-hundred':'lesson-unit-one';
  return '<i class="'+cls+'" aria-hidden="true"></i>';
}
function amountModel(unit,count){
  return '<span class="lesson-amount-model '+esc(unit)+'">'+Array.from({length:count},()=>baseTenToken(unit)).join('')+'</span>';
}
function number1000LessonStepVisual(step){
  if(step.kind==='bundle'){
    const tokens=Array.from({length:10},()=>baseTenToken(step.unit)).join('');
    return '<div class="lesson-visual-core"><div class="lesson-bundle-demo" data-unit="'+esc(step.unit)+'"><div class="lesson-bundle-source">'+tokens+'</div><div class="lesson-bundle-arrow" aria-hidden="true">→</div><button type="button" class="lesson-bundle-result lesson-reveal-card" id="lessonBundleResult"><span class="lesson-reveal-question">?</span><b>'+esc(step.resultLabel)+'</b><small>dokun</small></button></div>'+lessonInsightMarkup(step)+'</div>';
  }
  if(step.kind==='count'){
    const tokens=Array.from({length:10},(_,i)=>'<button type="button" class="lesson-count-token" data-count-index="'+i+'">'+baseTenToken(step.unit)+'<span>1 '+esc(step.unitName)+'</span></button>').join('');
    return '<div class="lesson-visual-core"><div class="lesson-count-demo"><div class="lesson-count-readout"><div><small>KAÇ '+esc(step.unitName.toUpperCase())+'?</small><strong id="lessonCountGroups">0 '+esc(step.unitName)+'</strong></div><div class="lesson-count-arrow">→</div><div><small>TOPLAM</small><strong id="lessonCountTotal">0</strong></div></div><div class="lesson-count-grid">'+tokens+'</div><p id="lessonCountExplain">Her kutu aynı şeyi gösteriyor: 1 '+esc(step.unitName)+'.</p></div>'+lessonInsightMarkup(step)+'</div>';
  }
  if(step.kind==='hundred-sense'){
    const dots=Array.from({length:100},(_,i)=>'<i data-dot="'+i+'"></i>').join('');
    return '<div class="lesson-visual-core"><div class="lesson-hundred-sense" id="lessonHundredSense"><div class="lesson-hundred-question" id="lessonHundredQuestion">Yaklaşık kaç nokta görüyorsun?</div><button type="button" class="lesson-hundred-grid" id="lessonHundredGrid" aria-label="Nokta düzenini incele">'+dots+'</button><div class="lesson-hundred-stage" id="lessonHundredStage">Tabloya dokun.</div></div>'+lessonInsightMarkup(step)+'</div>';
  }
  if(step.kind==='model-build'){
    const groups=step.groups.map(([label,count,digit],i)=>{
      const unit=i===0?'hundred':i===1?'ten':'one';
      return '<button type="button" class="lesson-model-group" data-model-index="'+i+'">'+amountModel(unit,count)+'<strong>? '+esc(label.toLocaleLowerCase('tr-TR'))+'</strong><small>dokun</small></button>';
    }).join('');
    return '<div class="lesson-visual-core"><div class="lesson-model-build"><div class="lesson-model-groups">'+groups+'</div><div class="lesson-digit-slots" id="lessonDigitSlots"><span>_</span><span>_</span><span>_</span></div><p id="lessonModelExplain">Gruplara dokundukça sayı oluşacak.</p></div>'+lessonInsightMarkup(step)+'</div>';
  }
  if(step.kind==='place-model'){
    const cols=step.values.map(([digit,label,value,count],i)=>{
      const unit=i===0?'hundred':i===1?'ten':'one';
      return '<button type="button" class="lesson-place-column" data-place-index="'+i+'" data-place-value="'+esc(value)+'"><span class="lesson-place-digit">'+esc(digit)+'</span><i class="lesson-place-arrow">↓</i>'+amountModel(unit,count)+'<strong>'+esc(digit)+' '+esc(label.toLocaleLowerCase('tr-TR'))+'</strong><b>?</b><small>değerini aç</small></button>';
    }).join('');
    return '<div class="lesson-visual-core"><div class="lesson-place-model"><div class="lesson-place-columns">'+cols+'</div><p id="lessonPlaceExplain">Her rakamın altında gösterdiği miktar var. Değerlerini sırayla aç.</p></div>'+lessonInsightMarkup(step)+'</div>';
  }
  if(step.kind==='zero-place'){
    const row304='<div class="lesson-zero-model-row"><strong>304</strong>'+amountModel('hundred',3)+'<span class="lesson-zero-gap" data-zero-name="onluk">0 onluk</span>'+amountModel('one',4)+'</div>';
    const row470='<div class="lesson-zero-model-row"><strong>470</strong>'+amountModel('hundred',4)+amountModel('ten',7)+'<span class="lesson-zero-gap" data-zero-name="birlik">0 birlik</span></div>';
    return '<div class="lesson-visual-core"><div class="lesson-zero-demo">'+row304+row470+'<p id="lessonZeroExplain">Boş görünen basamaklara dokun.</p></div>'+lessonInsightMarkup(step)+'</div>';
  }
  if(step.kind==='read-write'){
    const parts=step.wordParts.map((part,i)=>'<button type="button" class="lesson-word-reveal" data-word-index="'+i+'" data-word="'+esc(part)+'"><span>?</span><small>'+(i===0?'yüzlük':i===1?'onluk':'birlik')+'</small></button>').join('');
    return '<div class="lesson-visual-core"><div class="lesson-read-demo"><strong>'+esc(step.number)+'</strong><div class="lesson-read-arrow">↓</div><div class="lesson-word-parts">'+parts+'</div><div class="lesson-read-combined" id="lessonReadCombined"></div></div>'+lessonInsightMarkup(step)+'</div>';
  }
  const chips=['yirmi','altı','beş yüz'];
  return '<div class="lesson-visual-core"><div class="lesson-word-build"><strong>'+esc(step.number)+'</strong><p>Kartları sürükleyip doğru sıradaki yuvalara bırak.</p><div class="lesson-word-slots" id="lessonWordSlots">'+step.wordParts.map((word,i)=>'<button type="button" class="lesson-word-slot" data-slot-index="'+i+'" data-expected="'+esc(word)+'">?</button>').join('')+'</div><div class="lesson-word-bank" id="lessonWordBank">'+chips.map((word,i)=>'<button type="button" class="lesson-word-chip" data-word="'+esc(word)+'" data-chip-index="'+i+'">'+esc(word)+'</button>').join('')+'</div><button type="button" class="lesson-word-clear" id="lessonWordClear">Baştan kur</button><p class="lesson-drag-help" id="lessonDragHelp">Sürükle-bırak • veya karta, sonra yuvaya dokun</p></div>'+lessonInsightMarkup(step)+'</div>';
}
function completeNumber1000LessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id), lc=ss.learningCycle, next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);
  lc.lessonVersion=NUMBER1000_LESSON_VERSION;
  if(next>=NUMBER1000_LESSON_STEPS.length){ lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now(); saveState(); session.planIndex++; loadPlanItem(); return; }
  saveState(); session.lessonStepIndex=next; renderNumber1000LessonStep(skill,next);
}
function revealLessonInsight(){ $('#lessonInsight')?.classList.add('revealed'); }
function renderNumber1000LessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(NUMBER1000_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(NUMBER1000_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index, step=NUMBER1000_LESSON_STEPS[at];
  session.lessonStepIndex=at; currentQuestion=null; renderPracticeHeader(skill);
  $('#practiceMode').textContent='KONU ANLATIMI'; $('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+NUMBER1000_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/NUMBER1000_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="lesson-step-stage" data-lesson-step="'+esc(step.id)+'">'+lessonSectionTrack(step)+'<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · ADIM '+(at+1)+' / '+NUMBER1000_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="lesson-step-visual">'+number1000LessonStepVisual(step)+'</div><div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="lessonStepNext" disabled>'+(at===NUMBER1000_LESSON_STEPS.length-1?'Birlikte uygulamaya geç':'Sonraki adım')+' <b>→</b></button></div></div>';
  const next=$('#lessonStepNext');

  if(step.kind==='bundle'){
    $('#lessonBundleResult')?.addEventListener('click',ev=>{
      const card=ev.currentTarget; if(card.classList.contains('revealed')) return;
      card.classList.add('revealed'); $('.lesson-bundle-demo')?.classList.add('bundled');
      card.querySelector('.lesson-reveal-question').textContent=step.resultValue;
      card.querySelector('small').textContent=step.equation;
      revealLessonInsight(); next.disabled=false;
    });
  }else if(step.kind==='count'){
    let count=0;
    $$('.lesson-count-token').forEach(btn=>btn.addEventListener('click',()=>{
      if(btn.classList.contains('counted')) return;
      count++; btn.classList.add('counted');
      const value=count*step.stepValue;
      $('#lessonCountGroups').textContent=count+' '+step.unitName;
      $('#lessonCountTotal').textContent=value;
      $('#lessonCountExplain').textContent=count<10?count+' '+step.unitName+' = '+value+'. Bir tane daha ekle.':'10 '+step.unitName+' saydın.';
      if(count===10){ $('.lesson-count-demo')?.classList.add('complete'); revealLessonInsight(); next.disabled=false; }
    }));
  }else if(step.kind==='hundred-sense'){
    let stage=0;
    $('#lessonHundredGrid')?.addEventListener('click',()=>{
      const card=$('#lessonHundredSense');
      if(stage===0){
        stage=1; card?.classList.add('row-stage');
        $('#lessonHundredQuestion').textContent='Bir sırada 10 nokta var.';
        $('#lessonHundredStage').textContent='İlk sırayı gördün. Bir kez daha dokun.';
      }else if(stage===1){
        stage=2; card?.classList.add('full-stage');
        $('#lessonHundredQuestion').textContent='10 sıra var ve her sırada 10 nokta var.';
        $('#lessonHundredStage').textContent='10 × 10 = 100';
        revealLessonInsight(); next.disabled=false;
      }
    });
  }else if(step.kind==='model-build'){
    const seen=new Set(), slots=$$('#lessonDigitSlots span');
    $$('.lesson-model-group').forEach(btn=>btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.modelIndex); if(seen.has(i)) return;
      seen.add(i); btn.classList.add('revealed');
      const [label,count,digit]=step.groups[i];
      btn.querySelector('strong').textContent=count+' '+label.toLocaleLowerCase('tr-TR');
      btn.querySelector('small').textContent=String(i===0?count*100:i===1?count*10:count);
      slots[i].textContent=digit; slots[i].classList.add('filled');
      $('#lessonModelExplain').textContent=seen.size<3?'Sayı oluşuyor: '+slots.map(x=>x.textContent).join(' '):'3 yüzlük, 4 onluk ve 7 birlik birlikte 347’yi oluşturdu.';
      if(seen.size===3){ $('#lessonDigitSlots')?.classList.add('complete'); revealLessonInsight(); next.disabled=false; }
    }));
  }else if(step.kind==='place-model'){
    const seen=new Set();
    $$('.lesson-place-column').forEach(btn=>btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.placeIndex); if(seen.has(i)) return;
      seen.add(i); btn.classList.add('revealed'); btn.querySelector('b').textContent=btn.dataset.placeValue; btn.querySelector('small').textContent='değeri';
      const [digit,label,value]=step.values[i], left=step.values.length-seen.size;
      $('#lessonPlaceExplain').textContent=left?digit+' rakamı burada '+step.values[i][3]+' '+label.toLocaleLowerCase('tr-TR')+' gösteriyor; değeri '+value+'.':'Rakam, gösterdiği miktar ve değeri artık aynı yerde.';
      if(seen.size===step.values.length){ revealLessonInsight(); next.disabled=false; }
    }));
  }else if(step.kind==='zero-place'){
    const seen=new Set();
    $$('.lesson-zero-gap').forEach(gap=>gap.addEventListener('click',()=>{
      if(seen.has(gap)) return;
      seen.add(gap); gap.classList.add('revealed');
      $('#lessonZeroExplain').textContent=seen.size===1?'Bu basamakta hiç '+gap.dataset.zeroName+' yok. Diğer boş basamağı da bul.':'0, o basamakta hiç parça olmadığını gösteriyor.';
      if(seen.size===2){ revealLessonInsight(); next.disabled=false; }
    }));
  }else if(step.kind==='read-write'){
    const seen=new Set();
    $$('.lesson-word-reveal').forEach(btn=>btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.wordIndex); if(seen.has(i)) return;
      seen.add(i); btn.classList.add('revealed'); btn.querySelector('span').textContent=btn.dataset.word;
      if(seen.size===step.wordParts.length){ $('#lessonReadCombined').textContent=step.wordParts.join(' '); $('#lessonReadCombined')?.classList.add('revealed'); revealLessonInsight(); next.disabled=false; }
    }));
  }else{
    let selectedChip=null, dragChip=null, dragStartX=0, dragStartY=0;
    const chips=$$('.lesson-word-chip'), slots=$$('.lesson-word-slot');
    const allPlaced=()=>slots.every(slot=>slot.classList.contains('filled'));
    const finishIfReady=()=>{ if(allPlaced()){ revealLessonInsight(); next.disabled=false; $('#lessonDragHelp').textContent='526 = beş yüz yirmi altı.'; } };
    const resetChipVisual=chip=>{ chip.style.transform=''; chip.style.zIndex=''; chip.classList.remove('dragging'); };
    const placeChip=(chip,slot)=>{
      if(!chip||!slot||slot.classList.contains('filled')) return false;
      if(chip.dataset.word!==slot.dataset.expected){
        slot.classList.add('wrong'); setTimeout(()=>slot.classList.remove('wrong'),320);
        const roles=['yüzlük','onluk','birlik']; $('#lessonDragHelp').textContent='Bu yuva '+roles[Number(slot.dataset.slotIndex)]+' kısmı. “'+slot.dataset.expected+'” buraya gelir.';
        return false;
      }
      slot.textContent=chip.dataset.word; slot.classList.add('filled'); chip.disabled=true; chip.classList.add('placed'); selectedChip=null;
      const roles=['yüzlük kısmına','onluk kısmına','birlik kısmına']; $('#lessonDragHelp').textContent='“'+chip.dataset.word+'” '+roles[Number(slot.dataset.slotIndex)]+' yerleşti.'; finishIfReady(); return true;
    };
    chips.forEach(chip=>{
      chip.addEventListener('click',()=>{
        if(chip.disabled||consumeDraggedClick(chip)) return;
        selectedChip=selectedChip===chip?null:chip;
        chips.forEach(x=>x.classList.toggle('selected',x===selectedChip));
        $('#lessonDragHelp').textContent=selectedChip?'Şimdi doğru yuvaya dokun.':'Kart seçimi kaldırıldı.';
      });
      chip.addEventListener('pointerdown',ev=>{
        if(chip.disabled) return;
        dragChip=chip; dragStartX=ev.clientX; dragStartY=ev.clientY;
        chip.setPointerCapture?.(ev.pointerId); chip.classList.add('dragging'); chip.style.zIndex='20';
      });
      chip.addEventListener('pointermove',ev=>{
        if(dragChip!==chip) return;
        markDragMovement(chip,dragStartX,dragStartY,ev.clientX,ev.clientY);
        chip.style.transform='translate('+(ev.clientX-dragStartX)+'px,'+(ev.clientY-dragStartY)+'px) scale(1.04)';
      });
      const endDrag=ev=>{
        if(dragChip!==chip) return;
        const target=dropTargetAtPoint('.lesson-word-slot',ev.clientX,ev.clientY);
        resetChipVisual(chip); if(target) placeChip(chip,target); dragChip=null;
      };
      chip.addEventListener('pointerup',endDrag); chip.addEventListener('pointercancel',()=>{ if(dragChip===chip){ resetChipVisual(chip); dragChip=null; } });
    });
    slots.forEach(slot=>slot.addEventListener('click',()=>{ if(selectedChip) placeChip(selectedChip,slot); }));
    $('#lessonWordClear')?.addEventListener('click',()=>{
      slots.forEach((slot,i)=>{ slot.textContent='?'; slot.className='lesson-word-slot'; });
      chips.forEach(chip=>{ chip.disabled=false; chip.classList.remove('placed','selected'); resetChipVisual(chip); });
      selectedChip=null; dragChip=null; $('#lessonInsight')?.classList.remove('revealed'); next.disabled=true; $('#lessonDragHelp').textContent='Sürükle-bırak • veya karta, sonra yuvaya dokun';
    });
  }
  next?.addEventListener('click',()=>completeNumber1000LessonStep(skill,at));
}
function dropTargetAtPoint(selector,x,y){
  return [...document.querySelectorAll(selector)].find(node=>{
    const r=node.getBoundingClientRect();
    return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
  })||null;
}
function markDragMovement(chip,startX,startY,x,y){
  const moved=Math.hypot(x-startX,y-startY)>7;
  if(moved) chip.dataset.justDragged='1';
  return moved;
}
function consumeDraggedClick(chip){
  if(chip.dataset.justDragged!=='1') return false;
  chip.dataset.justDragged=''; return true;
}

const COMPARE_ORDER_LESSON_VERSION=2;
const COMPARE_ORDER_SECTIONS=['KARŞILAŞTIR','SEMBOL','SIRALA'];
const COMPARE_ORDER_LESSON_STEPS=[
  {id:'compare-hundreds',section:'KARŞILAŞTIR',kind:'place-compare',title:'Önce yüzlüklere bak.',body:'Soldan başlarız. Yüzlükler farklıysa hangi sayının daha büyük olduğunu hemen anlayabiliriz.',a:426,b:581,stopAt:0,result:'581, 426’dan büyüktür. 426, 581’den küçüktür.'},
  {id:'compare-tens',section:'KARŞILAŞTIR',kind:'place-compare',title:'Yüzlükler aynıysa onluklara geç.',body:'Yüzlükler karar vermiyorsa bir sonraki basamağı karşılaştırırız.',a:917,b:971,stopAt:1,result:'1 onluk, 7 onluktan küçüktür. Bu yüzden 917, 971’den küçüktür.'},
  {id:'compare-ones',section:'KARŞILAŞTIR',kind:'place-compare',title:'Onluklar da aynıysa birliklere bak.',body:'İlk iki basamak aynıysa kararı birlikler verir.',a:420,b:421,stopAt:2,result:'0 birlik, 1 birlikten küçüktür. Bu yüzden 420, 421’den küçüktür.'},
  {id:'compare-equal',section:'KARŞILAŞTIR',kind:'place-compare',title:'Bütün basamaklar aynıysa sayılar aynıdır.',body:'Yüzlük, onluk ve birliklerin üçü de aynıysa iki sayı aynı değerdedir.',a:535,b:535,stopAt:2,equal:true,result:'535 ve 535 aynı değerdedir.'},
  {id:'symbol-meaning-match',section:'SEMBOL',kind:'symbol-match',title:'İşaretleri anlamlarıyla eşleştir.',body:'Henüz sayı kullanmadan işaretlerin ne anlattığını kuralım. <, > ve = kartlarını doğru tanımın üzerine sürükle.'},
  {id:'symbol-bridge',section:'SEMBOL',kind:'symbol-bridge',title:'Sözü işarete bağlayalım.',body:'917, 971’den küçüktür. Bu cümleyi şimdi matematik işaretiyle yazalım.',a:917,b:971,result:'917 < 971'},
  {id:'order-three',section:'SIRALA',kind:'order-three',title:'Karşılaştırmayı sıralamaya taşı.',body:'Üç sayıyı küçükten büyüğe yerleştir. Yine soldan başlayarak basamakları karşılaştır.',values:[421,419,420],ordered:[419,420,421],result:'419 < 420 < 421. En küçük 419, en büyük 421.'}
];

function compareOrderSectionTrack(step){
  return '<div class="compare-section-track">'+COMPARE_ORDER_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>';
}
function compareDigits(n){ return [Math.floor(n/100),Math.floor((n%100)/10),n%10]; }
function comparePlaceTable(step){
  const labels=['Yüzlük','Onluk','Birlik'], a=compareDigits(step.a), b=compareDigits(step.b);
  return '<div class="compare-place-table">'+labels.map((label,i)=>'<button type="button" class="compare-place-column '+(i===0?'ready':'')+'" data-compare-col="'+i+'"><span>'+label+'</span><div><strong>'+a[i]+'</strong><i>ve</i><strong>'+b[i]+'</strong></div><small>dokun</small></button>').join('')+'</div><div class="compare-place-note" id="comparePlaceNote">Önce yüzlüklere dokun.</div>';
}
function compareOrderStepVisual(step){
  if(step.kind==='place-compare') return '<div class="compare-lesson-core"><div class="compare-number-pair"><strong>'+step.a+'</strong><span>ile</span><strong>'+step.b+'</strong></div>'+comparePlaceTable(step)+'<div class="compare-lesson-result" id="compareLessonResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='symbol-match'){
    const defs=[
      ['<','küçüktür','Soldaki değer sağdakinden daha küçüktür.'],
      ['>','büyüktür','Soldaki değer sağdakinden daha büyüktür.'],
      ['=','eşittir','İki taraf aynı değerdedir.']
    ];
    const bank=['=','<','>'];
    return '<div class="compare-lesson-core"><div class="compare-symbol-definitions">'+defs.map(([symbol,name,definition])=>'<button type="button" class="compare-symbol-slot" data-symbol-slot="'+esc(symbol)+'"><span>'+esc(name)+'</span><p>'+esc(definition)+'</p><strong>?</strong></button>').join('')+'</div><div class="compare-symbol-bank">'+bank.map(symbol=>'<button type="button" class="compare-symbol-drag" data-symbol-value="'+esc(symbol)+'">'+esc(symbol)+'</button>').join('')+'</div><button type="button" class="compare-order-reset" id="compareSymbolReset">Baştan eşleştir</button><div class="compare-symbol-note" id="compareSymbolNote">İşareti sürükleyip doğru tanımın üzerine bırak.</div></div>';
  }
  if(step.kind==='symbol-bridge') return '<div class="compare-lesson-core"><div class="compare-verbal-bridge"><p><strong>'+step.a+'</strong>, <strong>'+step.b+'</strong>’den <b>küçüktür</b>.</p><div class="compare-symbol-equation"><strong>'+step.a+'</strong><button type="button" class="compare-bridge-slot" id="compareBridgeSymbol" data-symbol-slot="<">?</button><strong>'+step.b+'</strong></div><div class="compare-symbol-bank compare-symbol-bank-small"><button type="button" class="compare-symbol-drag compare-bridge-chip" data-symbol-value="=">=</button><button type="button" class="compare-symbol-drag compare-bridge-chip" data-symbol-value=">">&gt;</button><button type="button" class="compare-symbol-drag compare-bridge-chip" data-symbol-value="<">&lt;</button></div><small id="compareBridgeHelp">“küçüktür” cümlesini anlatan işareti boşluğa sürükle.</small></div><div class="compare-lesson-result" id="compareLessonResult">'+esc(step.result)+'</div></div>';
  const chips=step.values.map(n=>'<button type="button" class="compare-order-chip" data-order-value="'+n+'">'+n+'</button>').join('');
  return '<div class="compare-lesson-core"><div class="compare-order-builder"><div class="compare-order-slots" id="compareOrderSlots">'+step.ordered.map((_,i)=>'<button type="button" class="compare-order-slot" data-order-slot="'+i+'">?</button>').join('')+'</div><div class="compare-order-bank">'+chips+'</div><button type="button" class="compare-order-reset" id="compareOrderReset">Baştan sırala</button><p id="compareOrderHelp">Kartları sürükle-bırak • veya karta, sonra yuvaya dokun</p></div><div class="compare-lesson-result" id="compareLessonResult">'+esc(step.result)+'</div></div>';
}
function completeCompareOrderLessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id), lc=ss.learningCycle, next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);
  lc.lessonVersion=COMPARE_ORDER_LESSON_VERSION;
  if(next>=COMPARE_ORDER_LESSON_STEPS.length){ lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now(); saveState(); session.planIndex++; loadPlanItem(); return; }
  saveState(); session.lessonStepIndex=next; renderCompareOrderLessonStep(skill,next);
}
function revealCompareResult(){ $('#compareLessonResult')?.classList.add('revealed'); }
function renderCompareOrderLessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(COMPARE_ORDER_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(COMPARE_ORDER_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index, step=COMPARE_ORDER_LESSON_STEPS[at];
  session.lessonStepIndex=at; currentQuestion=null; renderPracticeHeader(skill);
  $('#practiceMode').textContent='KONU ANLATIMI'; $('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+COMPARE_ORDER_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/COMPARE_ORDER_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="compare-lesson-stage" data-compare-step="'+esc(step.id)+'">'+compareOrderSectionTrack(step)+'<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · ADIM '+(at+1)+' / '+COMPARE_ORDER_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="compare-lesson-visual">'+compareOrderStepVisual(step)+'</div><div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="compareLessonNext" disabled>'+(at===COMPARE_ORDER_LESSON_STEPS.length-1?'Birlikte uygulamaya geç':'Sonraki adım')+' <b>→</b></button></div></div>';
  const next=$('#compareLessonNext');

  if(step.kind==='place-compare'){
    const a=compareDigits(step.a), b=compareDigits(step.b), seen=new Set();
    $$('.compare-place-column').forEach(btn=>btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.compareCol);
      if(seen.has(i)||!btn.classList.contains('ready')) return;
      seen.add(i); btn.classList.add('revealed'); btn.querySelector('small').textContent='karşılaştırıldı';
      const label=['yüzlük','onluk','birlik'][i];
      const same=a[i]===b[i];
      if(same){
        $('#comparePlaceNote').textContent=a[i]+' '+label+' ile '+b[i]+' '+label+' aynı. '+(i<2?'Bir sonraki basamağa geç.':'Bütün basamaklar aynı.');
        const nxt=$('.compare-place-column[data-compare-col="'+(i+1)+'"]'); if(nxt) nxt.classList.add('ready');
        if(i===2){ revealCompareResult(); next.disabled=false; }
      }else{
        const relation=a[i]<b[i]?'küçüktür':'büyüktür';
        $('#comparePlaceNote').textContent=a[i]+' '+label+', '+b[i]+' '+label+'dan '+relation+'. Burada karar verildi.';
        revealCompareResult(); next.disabled=false;
      }
    }));
  }else if(step.kind==='symbol-match'){
    let selected=null,drag=null,sx=0,sy=0;
    const chips=$$('.compare-symbol-drag'), slots=$$('.compare-symbol-slot');
    const place=(chip,slot)=>{
      if(!chip||!slot||slot.classList.contains('filled')) return false;
      const expected=slot.dataset.symbolSlot, value=chip.dataset.symbolValue;
      if(value!==expected){
        slot.classList.add('wrong'); setTimeout(()=>slot.classList.remove('wrong'),320);
        $('#compareSymbolNote').textContent='Bu tanım “'+(expected==='<'?'küçüktür':expected==='>'?'büyüktür':'eşittir')+'” anlamındadır.';
        return false;
      }
      slot.querySelector('strong').textContent=value; slot.classList.add('filled'); chip.disabled=true; chip.classList.add('placed'); selected=null; chips.forEach(x=>x.classList.remove('selected'));
      $('#compareSymbolNote').textContent=value==='='?'= işareti iki tarafın aynı değerde olduğunu gösterir.':'Sivri uç küçük tarafı, açık taraf büyük tarafı gösterir.';
      if(slots.every(x=>x.classList.contains('filled'))) next.disabled=false;
      return true;
    };
    chips.forEach(chip=>{
      chip.addEventListener('click',()=>{ if(chip.disabled||consumeDraggedClick(chip))return; selected=selected===chip?null:chip; chips.forEach(x=>x.classList.toggle('selected',x===selected)); $('#compareSymbolNote').textContent=selected?'Şimdi doğru tanıma dokun.':'İşaret seçimi kaldırıldı.'; });
      chip.addEventListener('pointerdown',ev=>{ if(chip.disabled)return; drag=chip;sx=ev.clientX;sy=ev.clientY;chip.setPointerCapture?.(ev.pointerId);chip.classList.add('dragging');});
      chip.addEventListener('pointermove',ev=>{ if(drag!==chip)return; markDragMovement(chip,sx,sy,ev.clientX,ev.clientY); chip.style.transform='translate('+(ev.clientX-sx)+'px,'+(ev.clientY-sy)+'px) scale(1.08)';});
      chip.addEventListener('pointerup',ev=>{ if(drag!==chip)return; const target=dropTargetAtPoint('.compare-symbol-slot',ev.clientX,ev.clientY); chip.style.transform='';chip.classList.remove('dragging');if(target)place(chip,target);drag=null;});
      chip.addEventListener('pointercancel',()=>{ if(drag===chip){chip.style.transform='';chip.classList.remove('dragging');drag=null;} });
    });
    slots.forEach(slot=>slot.addEventListener('click',()=>{ if(selected)place(selected,slot); }));
    $('#compareSymbolReset')?.addEventListener('click',()=>{ slots.forEach(slot=>{slot.classList.remove('filled','wrong');slot.querySelector('strong').textContent='?';}); chips.forEach(chip=>{chip.disabled=false;chip.classList.remove('placed','selected','dragging');chip.style.transform='';chip.dataset.justDragged='';}); selected=null;drag=null;next.disabled=true;$('#compareSymbolNote').textContent='İşareti sürükleyip doğru tanımın üzerine bırak.'; });
  }else if(step.kind==='symbol-bridge'){
    let selected=null,drag=null,sx=0,sy=0;
    const slot=$('#compareBridgeSymbol'), chips=$$('.compare-bridge-chip');
    const place=chip=>{
      if(!chip||slot.classList.contains('revealed'))return false;
      if(chip.dataset.symbolValue!==slot.dataset.symbolSlot){ $('#compareBridgeHelp').textContent='Cümlede “küçüktür” deniyor. O anlamı taşıyan işareti seç.'; slot.classList.add('wrong');setTimeout(()=>slot.classList.remove('wrong'),320);return false; }
      slot.textContent='<';slot.classList.add('revealed');chips.forEach(x=>{x.disabled=true;x.classList.toggle('placed',x===chip);});$('#compareBridgeHelp').textContent='917, 971’den küçüktür: 917 < 971.';revealCompareResult();next.disabled=false;return true;
    };
    chips.forEach(chip=>{
      chip.addEventListener('click',()=>{if(chip.disabled||consumeDraggedClick(chip))return;selected=chip;chips.forEach(x=>x.classList.toggle('selected',x===chip));$('#compareBridgeHelp').textContent='Şimdi işareti boşluğa bırak veya boşluğa dokun.';});
      chip.addEventListener('pointerdown',ev=>{if(chip.disabled)return;drag=chip;sx=ev.clientX;sy=ev.clientY;chip.setPointerCapture?.(ev.pointerId);chip.classList.add('dragging');});
      chip.addEventListener('pointermove',ev=>{if(drag!==chip)return;markDragMovement(chip,sx,sy,ev.clientX,ev.clientY);chip.style.transform='translate('+(ev.clientX-sx)+'px,'+(ev.clientY-sy)+'px) scale(1.08)';});
      chip.addEventListener('pointerup',ev=>{if(drag!==chip)return;const target=dropTargetAtPoint('.compare-bridge-slot',ev.clientX,ev.clientY);chip.style.transform='';chip.classList.remove('dragging');if(target)place(chip);drag=null;});
      chip.addEventListener('pointercancel',()=>{if(drag===chip){chip.style.transform='';chip.classList.remove('dragging');drag=null;}});
    });
    slot?.addEventListener('click',()=>{if(selected)place(selected);});
  }else{
    let selected=null,drag=null,sx=0,sy=0;
    const chips=$$('.compare-order-chip'), slots=$$('.compare-order-slot');
    const place=(chip,slot)=>{
      if(!chip||!slot||slot.classList.contains('filled')) return false;
      const idx=Number(slot.dataset.orderSlot), expected=step.ordered[idx], value=Number(chip.dataset.orderValue);
      if(value!==expected){ slot.classList.add('wrong'); setTimeout(()=>slot.classList.remove('wrong'),300); $('#compareOrderHelp').textContent='Bu yuvada '+expected+' olmalı. Sayıları yeniden soldan karşılaştır.'; return false; }
      slot.textContent=value; slot.classList.add('filled'); chip.disabled=true; chip.classList.add('placed'); selected=null;
      chips.forEach(x=>x.classList.remove('selected'));
      if(slots.every(x=>x.classList.contains('filled'))){ $('#compareOrderHelp').textContent='419, 420 ve 421 küçükten büyüğe sıralandı.'; revealCompareResult(); next.disabled=false; }
      else $('#compareOrderHelp').textContent='Bu sayı yerine yerleşti. Sıradaki sayıyı yerleştir.';
      return true;
    };
    chips.forEach(chip=>{
      chip.addEventListener('click',()=>{ if(chip.disabled||consumeDraggedClick(chip))return; selected=selected===chip?null:chip; chips.forEach(x=>x.classList.toggle('selected',x===selected)); $('#compareOrderHelp').textContent=selected?'Şimdi doğru yuvaya dokun.':'Kart seçimi kaldırıldı.'; });
      chip.addEventListener('pointerdown',ev=>{ if(chip.disabled)return; drag=chip;sx=ev.clientX;sy=ev.clientY;chip.setPointerCapture?.(ev.pointerId);chip.classList.add('dragging');});
      chip.addEventListener('pointermove',ev=>{ if(drag!==chip)return; markDragMovement(chip,sx,sy,ev.clientX,ev.clientY); chip.style.transform='translate('+(ev.clientX-sx)+'px,'+(ev.clientY-sy)+'px) scale(1.04)';});
      chip.addEventListener('pointerup',ev=>{ if(drag!==chip)return; const target=dropTargetAtPoint('.compare-order-slot',ev.clientX,ev.clientY); chip.style.transform='';chip.classList.remove('dragging');if(target)place(chip,target);drag=null;});
      chip.addEventListener('pointercancel',()=>{ if(drag===chip){chip.style.transform='';chip.classList.remove('dragging');drag=null;} });
    });
    slots.forEach(slot=>slot.addEventListener('click',()=>{ if(selected) place(selected,slot); }));
    $('#compareOrderReset')?.addEventListener('click',()=>{ slots.forEach(x=>{x.textContent='?';x.className='compare-order-slot';}); chips.forEach(x=>{x.disabled=false;x.classList.remove('placed','selected');x.style.transform='';}); selected=null;drag=null;$('#compareLessonResult')?.classList.remove('revealed');next.disabled=true;$('#compareOrderHelp').textContent='Kartları sürükle-bırak • veya karta, sonra yuvaya dokun';});
  }
  next?.addEventListener('click',()=>completeCompareOrderLessonStep(skill,at));
}

const PATTERN1000_LESSON_VERSION=3;
const PATTERN1000_SECTIONS=['DEĞİŞİM','BASAMAK','KURAL','SÜRDÜR','EKSİK SAYI'];
const PATTERN1000_LESSON_STEPS=[
  {id:'one-more-model',section:'DEĞİŞİM',kind:'place-action',from:243,to:244,placeIndex:2,action:'1 birlik ekle',title:'1 daha = 1 birlik daha.',body:'243’ten 244’e geçerken miktara bir birlik eklenir. Bu örnekte değişimi birlikler basamağında görürüz.',result:'243’ten 244’e: 1 birlik daha.'},
  {id:'ten-more-model',section:'DEĞİŞİM',kind:'place-action',from:243,to:253,placeIndex:1,action:'1 onluk ekle',title:'10 daha = 1 onluk daha.',body:'243’e bir onluk eklemek sayıyı 10 büyütür. Bu örnekte yüzlük ve birlik miktarı aynı kalır.',result:'243’ten 253’e: 1 onluk, yani 10 daha.'},
  {id:'hundred-more-model',section:'DEĞİŞİM',kind:'place-action',from:243,to:343,placeIndex:0,action:'1 yüzlük ekle',title:'100 daha = 1 yüzlük daha.',body:'243’e bir yüzlük eklemek sayıyı 100 büyütür. Bu örnekte onluk ve birlik miktarı aynı kalır.',result:'243’ten 343’e: 1 yüzlük, yani 100 daha.'},
  {id:'ten-less-model',section:'DEĞİŞİM',kind:'place-action',from:654,to:644,placeIndex:1,action:'1 onluk çıkar',title:'10 daha az = 1 onluk daha az.',body:'654’ten 644’e inerken miktardan bir onluk çıkarılır. Bu örnekte değişimi onluklar basamağında görürüz.',result:'654’ten 644’e: 1 onluk, yani 10 daha az.'},
  {id:'one-less-model',section:'DEĞİŞİM',kind:'place-action',from:654,to:653,placeIndex:2,action:'1 birlik çıkar',title:'1 daha az = 1 birlik daha az.',body:'654’ten bir birlik çıkar. 4 birlikten 3 birlik kalır; sayı 653 olur.',result:'654’ten 653’e: 1 birlik daha az.'},
  {id:'hundred-less-model',section:'DEĞİŞİM',kind:'place-action',from:654,to:554,placeIndex:0,action:'1 yüzlük çıkar',title:'100 daha az = 1 yüzlük daha az.',body:'654’ten bir yüzlük çıkar. 6 yüzlükten 5 yüzlük kalır; sayı 554 olur.',result:'654’ten 554’e: 1 yüzlük, yani 100 daha az.'},
  {id:'place-change-track',section:'BASAMAK',kind:'place-track',seq:[324,334,344,354],placeIndex:1,title:'Bu örnekte değişimi basamaklarda izle.',body:'Dört sayıyı basamak basamak karşılaştır. Bu dizide düzenli değişimi hangi sütunda gördüğünü seç.',result:'Bu örnekte onluk basamağı her adımda 1 artıyor; sayı 10 büyüyor.'},
  {id:'ten-regroup-boundary',section:'BASAMAK',kind:'regroup-boundary',from:290,to:300,action:'1 onluk ekle',title:'Adım aynı kalır; rakamlar bazen yeniden gruplanır.',body:'290’a 10 daha eklediğimizde 9 onluğa 1 onluk daha gelir. 10 onluk, 1 yüzlük olur; bu yüzden birden fazla rakam değişebilir.',result:'10 daha = 1 onluk daha. 9 onluk + 1 onluk = 10 onluk = 1 yüzlük.'},
  {id:'describe-up-rule',section:'KURAL',kind:'rule-match',seq:[230,330,430,530],rule:'Her adımda 100 daha.',options:['Her adımda 100 daha.','Her adımda 10 daha.','Her adımda 100 daha az.'],title:'Devam ettirmeden önce kuralı söyle.',body:'Sayıları henüz devam ettirme. Önce her geçişte aynı kalan değişimi sözcükle tarif et.',result:'230 → 330 → 430 → 530: her adımda 100 daha.'},
  {id:'describe-down-rule',section:'KURAL',kind:'rule-match',seq:[900,800,700,600],rule:'Her adımda 100 daha az.',options:['Her adımda 10 daha az.','Her adımda 100 daha.','Her adımda 100 daha az.'],title:'Azalan örüntünün kuralını da tarif et.',body:'Bu kez sayılar küçülüyor. Devam etmeden önce değişimin yönünü ve miktarını söyle.',result:'900 → 800 → 700 → 600: her adımda 100 daha az.'},
  {id:'continue-after-rule',section:'SÜRDÜR',kind:'number-slot',rule:'Her adımda 10 daha.',ruleOptions:['Her adımda 10 daha.','Her adımda 1 daha.','Her adımda 10 daha az.'],seq:[412,422,432,'?'],answer:442,options:[442,433,532],title:'Kuralı söyledikten sonra örüntüyü sürdür.',body:'Önce komşu sayılar arasındaki değişimi sözcükle tarif et. Sonra aynı değişimi bir kez daha uygula.',result:'412 → 422 → 432 → 442.'},
  {id:'missing-middle',section:'EKSİK SAYI',kind:'number-slot',rule:'Her adımda 10 daha az.',ruleOptions:['Her adımda 10 daha.','Her adımda 100 daha az.','Her adımda 10 daha az.'],seq:[675,665,'?',645],answer:655,options:[655,654,665],title:'Eksik sayı dizinin ortasında da olabilir.',body:'Önce kuralı iki taraftan kontrol et. Sonra eksik sayıyı doğru yere yerleştir.',result:'675 → 665 → 655 → 645: her adımda 10 daha az.'},
  {id:'same-rule-transfer',section:'SÜRDÜR',kind:'same-rule',seqA:[245,255,265],seqB:[610,620,630],rule:'Her adımda 10 daha.',options:['Her adımda 10 daha.','Her adımda 100 daha.','Her adımda 10 daha az.'],title:'Başlangıç değişse de kural aynı kalabilir.',body:'İki farklı diziyi karşılaştır. Başlangıç sayıları başka olsa da aynı değişim kullanılabilir.',result:'İki dizide de her adımda 10 daha.'}
];

function pattern1000SectionTrack(step){
  return '<div class="pattern-section-track">'+PATTERN1000_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>';
}
function patternDigits(n){
  return [Math.floor(n/100)%10,Math.floor(n/10)%10,n%10];
}
function patternPlaceBoard(n,highlight=-1){
  const labels=['Yüzlük','Onluk','Birlik'], digits=patternDigits(n);
  return '<div class="pattern-place-board" aria-label="'+n+' basamakları">'+digits.map((digit,i)=>'<div class="pattern-place-cell '+(i===highlight?'changed':'')+'" data-pattern-place="'+i+'"><small>'+labels[i]+'</small><strong>'+digit+'</strong></div>').join('')+'</div>';
}
function patternQuantityModel(n){
  const parts=[Math.floor(n/100),Math.floor(n/10)%10,n%10];
  return '<div class="pattern-quantity-model" aria-label="'+n+' sayısının basamak modeli">'+parts.map((count,i)=>'<div><small>'+count+' '+['yüzlük','onluk','birlik'][i]+'</small>'+amountModel(['hundred','ten','one'][i],count)+'</div>').join('')+'</div>';
}
function patternActionVisual(step){
  const targets=['Yüzlük','Onluk','Birlik'].map((label,i)=>'<button type="button" class="pattern-action-target" data-pattern-value="'+(i===step.placeIndex?esc(step.action):'yanlış-'+i)+'"><span>'+label+'</span><b>?</b></button>').join('');
  return '<div class="pattern-lesson-core"><div class="pattern-transition"><div>'+patternPlaceBoard(step.from)+patternQuantityModel(step.from)+'</div><span class="pattern-transition-arrow">→</span><div class="pattern-after-number" id="patternAfterNumber"><strong>?</strong><small>sonraki sayı</small></div></div><div class="pattern-action-zone"><div class="pattern-action-targets">'+targets+'</div><button type="button" class="pattern-drag-chip" data-pattern-value="'+esc(step.action)+'">'+esc(step.action)+'</button><p id="patternLessonHelp">Değişim kartını doğru basamağa sürükle • veya karta, sonra basamağa dokun.</p></div><div class="pattern-lesson-result" id="patternLessonResult">'+esc(step.result)+'</div></div>';
}
function patternTrackVisual(step){
  const rows=step.seq.map(n=>'<div class="pattern-track-number" data-pattern-number="'+n+'"><strong class="pattern-track-value">'+n+'</strong>'+patternPlaceBoard(n)+'</div>').join('');
  const choices=['Yüzlük','Onluk','Birlik'].map((label,i)=>'<button type="button" class="pattern-place-choice" data-place-choice="'+i+'">'+label+'</button>').join('');
  return '<div class="pattern-lesson-core"><div class="pattern-track-sequence">'+rows+'</div><div class="pattern-place-choices">'+choices+'</div><p id="patternLessonHelp">Her sayıda aynı sütuna bak. Düzenli değişen basamağı seç.</p><div class="pattern-lesson-result" id="patternLessonResult">'+esc(step.result)+'</div></div>';
}
function patternRuleVisual(step){
  const bank=[...step.options].map(rule=>'<button type="button" class="pattern-rule-chip" data-pattern-value="'+esc(rule)+'">'+esc(rule)+'</button>').join('');
  return '<div class="pattern-lesson-core"><div class="pattern-sequence-strip">'+step.seq.map(n=>'<span>'+n+'</span>').join('<i>→</i>')+'</div><button type="button" class="pattern-rule-slot" data-pattern-value="'+esc(step.rule)+'"><small>KURAL</small><strong>?</strong></button><div class="pattern-rule-bank">'+bank+'</div><p id="patternLessonHelp">Kural kartını boşluğa sürükle • veya karta, sonra KURAL alanına dokun.</p><div class="pattern-lesson-result" id="patternLessonResult">'+esc(step.result)+'</div></div>';
}
function patternNumberSlotVisual(step,ruleConfirmed=false){
  if(!ruleConfirmed) return patternRuleVisual({...step,options:step.ruleOptions});
  const bank=[...step.options].map(value=>'<button type="button" class="pattern-number-chip" data-pattern-value="'+value+'">'+value+'</button>').join('');
  const seq=step.seq.map(value=>value==='?'
    ?'<button type="button" class="pattern-number-slot" data-pattern-value="'+step.answer+'">?</button>'
    :'<span>'+value+'</span>').join('<i>→</i>');
  return '<div class="pattern-lesson-core"><div class="pattern-sequence-strip pattern-sequence-build">'+seq+'</div><div class="pattern-number-bank">'+bank+'</div><p id="patternLessonHelp">Sayı kartını “?” yerine sürükle • veya karta, sonra boşluğa dokun.</p><div class="pattern-lesson-result" id="patternLessonResult">'+esc(step.result)+'</div></div>';
}
function patternSameRuleVisual(step){
  const bank=[...step.options].map(rule=>'<button type="button" class="pattern-rule-chip" data-pattern-value="'+esc(rule)+'">'+esc(rule)+'</button>').join('');
  const row=seq=>'<div class="pattern-sequence-strip compact">'+seq.map(n=>'<span>'+n+'</span>').join('<i>→</i>')+'</div>';
  return '<div class="pattern-lesson-core"><div class="pattern-double-sequence">'+row(step.seqA)+row(step.seqB)+'</div><button type="button" class="pattern-rule-slot" data-pattern-value="'+esc(step.rule)+'"><small>İKİSİNİN KURALI</small><strong>?</strong></button><div class="pattern-rule-bank">'+bank+'</div><p id="patternLessonHelp">İki diziyi de açıklayan aynı kuralı yerleştir.</p><div class="pattern-lesson-result" id="patternLessonResult">'+esc(step.result)+'</div></div>';
}

function patternRegroupVisual(step){
  const before='<div class="pattern-regroup-model"><strong>290</strong><div class="pattern-regroup-material">'+amountModel('hundred',2)+amountModel('ten',9)+'</div><small>2 yüzlük + 9 onluk</small></div>';
  const slot='<button type="button" class="pattern-regroup-slot" data-pattern-value="'+esc(step.action)+'"><strong>?</strong><small>9 onluğun yanına ekle</small></button>';
  const after='<div class="pattern-regroup-after" id="patternRegroupAfter"><strong>?</strong><small>yeniden grupla</small></div>';
  return '<div class="pattern-lesson-core"><div class="pattern-regroup-flow">'+before+'<span class="pattern-transition-arrow">+</span>'+slot+'<span class="pattern-transition-arrow">→</span>'+after+'</div><button type="button" class="pattern-drag-chip" data-pattern-value="'+esc(step.action)+'">'+esc(step.action)+'</button><p id="patternLessonHelp">Bir onluğu 9 onluğun yanına sürükle.</p><div class="pattern-lesson-result" id="patternLessonResult">'+esc(step.result)+'</div></div>';
}
function pattern1000StepVisual(step){
  if(step.kind==='place-action') return patternActionVisual(step);
  if(step.kind==='place-track') return patternTrackVisual(step);
  if(step.kind==='regroup-boundary') return patternRegroupVisual(step);
  if(step.kind==='rule-match') return patternRuleVisual(step);
  if(step.kind==='number-slot') return patternNumberSlotVisual(step);
  return patternSameRuleVisual(step);
}
function revealPatternLessonResult(){
  $('#patternLessonResult')?.classList.add('revealed');
}
function wirePatternSingleDrop({chipSelector,slotSelector,onSuccess}){
  let selected=null,drag=null,sx=0,sy=0;
  const chips=$$(chipSelector), slots=$$(slotSelector);
  const place=(chip,slot)=>{
    if(!chip||!slot||slot.classList.contains('filled')) return false;
    const value=chip.dataset.patternValue, expected=slot.dataset.patternValue;
    if(value!==expected){
      slot.classList.add('wrong'); setTimeout(()=>slot.classList.remove('wrong'),320);
      $('#patternLessonHelp').textContent=slot.classList.contains('pattern-action-target')?'Birlik 1, onluk 10, yüzlük 100 değerindedir. Kartın miktarını bu basamaklarla eşleştir.':'Her geçişte aynı miktar artmalı veya azalmalı. Komşu sayıları yeniden karşılaştır.';
      return false;
    }
    slot.classList.add('filled');
    if(slot.querySelector('strong')) slot.querySelector('strong').textContent=value;
    if(slot.classList.contains('pattern-number-slot')) slot.textContent=value;
    chip.disabled=true; chip.classList.add('placed'); chips.forEach(x=>x.classList.remove('selected')); selected=null;
    onSuccess?.(chip,slot); return true;
  };
  chips.forEach(chip=>{
    chip.addEventListener('click',()=>{
      if(chip.disabled||consumeDraggedClick(chip)) return;
      selected=selected===chip?null:chip; chips.forEach(x=>x.classList.toggle('selected',x===selected));
      $('#patternLessonHelp').textContent=selected?'Şimdi doğru hedefe dokun.':'Kart seçimi kaldırıldı.';
    });
    chip.addEventListener('pointerdown',ev=>{
      if(chip.disabled) return; drag=chip;sx=ev.clientX;sy=ev.clientY;chip.setPointerCapture?.(ev.pointerId);chip.classList.add('dragging');
    });
    chip.addEventListener('pointermove',ev=>{
      if(drag!==chip) return; markDragMovement(chip,sx,sy,ev.clientX,ev.clientY);
      chip.style.transform='translate('+(ev.clientX-sx)+'px,'+(ev.clientY-sy)+'px) scale(1.04)';
    });
    chip.addEventListener('pointerup',ev=>{
      if(drag!==chip) return;
      const target=dropTargetAtPoint(slotSelector,ev.clientX,ev.clientY);
      chip.style.transform='';chip.classList.remove('dragging');if(target)place(chip,target);drag=null;
    });
    chip.addEventListener('pointercancel',()=>{if(drag===chip){chip.style.transform='';chip.classList.remove('dragging');drag=null;}});
  });
  slots.forEach(slot=>slot.addEventListener('click',()=>{if(selected)place(selected,slot);}));
}
function completePattern1000LessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id), lc=ss.learningCycle, next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);
  lc.lessonVersion=PATTERN1000_LESSON_VERSION;
  if(next>=PATTERN1000_LESSON_STEPS.length){
    lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now(); saveState(); session.planIndex++; loadPlanItem(); return;
  }
  saveState(); session.lessonStepIndex=next; renderPattern1000LessonStep(skill,next);
}
function renderPattern1000LessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(PATTERN1000_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(PATTERN1000_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=PATTERN1000_LESSON_STEPS[at];
  session.lessonStepIndex=at; currentQuestion=null; renderPracticeHeader(skill);
  $('#practiceMode').textContent='KONU ANLATIMI'; $('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+PATTERN1000_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/PATTERN1000_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="pattern-lesson-stage" data-pattern-step="'+esc(step.id)+'">'+pattern1000SectionTrack(step)+'<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · ADIM '+(at+1)+' / '+PATTERN1000_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="pattern-lesson-visual">'+pattern1000StepVisual(step)+'</div><div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="patternLessonNext" disabled>'+(at===PATTERN1000_LESSON_STEPS.length-1?'Birlikte uygulamaya geç':'Sonraki adım')+' <b>→</b></button></div></div>';
  const next=$('#patternLessonNext');

  if(step.kind==='place-action'){
    wirePatternSingleDrop({
      chipSelector:'.pattern-drag-chip',
      slotSelector:'.pattern-action-target',
      onSuccess:(_,slot)=>{
        slot.querySelector('b').textContent=step.action;
        $('#patternAfterNumber').innerHTML=patternPlaceBoard(step.to,step.placeIndex)+patternQuantityModel(step.to);
        $('#patternLessonHelp').textContent='';
        revealPatternLessonResult(); next.disabled=false;
      }
    });
  }else if(step.kind==='regroup-boundary'){
    wirePatternSingleDrop({
      chipSelector:'.pattern-drag-chip',
      slotSelector:'.pattern-regroup-slot',
      onSuccess:()=>{
        $('#patternRegroupAfter').innerHTML='<div class="pattern-regroup-material">'+amountModel('hundred',3)+'</div><strong>300</strong><small>3 yüzlük + 0 onluk</small>';
        $('#patternLessonHelp').textContent='';
        revealPatternLessonResult(); next.disabled=false;
      }
    });
  }else if(step.kind==='place-track'){
    $$('.pattern-place-choice').forEach(btn=>btn.addEventListener('click',()=>{
      const index=Number(btn.dataset.placeChoice);
      if(index!==step.placeIndex){
        btn.classList.add('wrong');setTimeout(()=>btn.classList.remove('wrong'),320);
        $('#patternLessonHelp').textContent='Bu sütundaki rakamları dört sayıda da karşılaştır.';
        return;
      }
      btn.classList.add('selected'); $$('.pattern-place-choice').forEach(x=>x.disabled=true);
      $$('.pattern-place-board').forEach(board=>board.children[index]?.classList.add('changed'));
      $('#patternLessonHelp').textContent=''; revealPatternLessonResult(); next.disabled=false;
    }));
  }else if(step.kind==='rule-match'||step.kind==='same-rule'){
    wirePatternSingleDrop({
      chipSelector:'.pattern-rule-chip',
      slotSelector:'.pattern-rule-slot',
      onSuccess:()=>{
        $('#patternLessonHelp').textContent=''; revealPatternLessonResult(); next.disabled=false;
      }
    });
  }else if(step.kind==='number-slot'){
    wirePatternSingleDrop({chipSelector:'.pattern-rule-chip',slotSelector:'.pattern-rule-slot',onSuccess:()=>{
      $('.pattern-lesson-visual').innerHTML=patternNumberSlotVisual(step,true);
      $('#patternLessonHelp').textContent=step.rule+' Şimdi eksik sayıyı yerleştir.';
      wirePatternSingleDrop({chipSelector:'.pattern-number-chip',slotSelector:'.pattern-number-slot',onSuccess:()=>{
        $('#patternLessonHelp').textContent=''; revealPatternLessonResult(); next.disabled=false;
      }});
    }});
  }
  next?.addEventListener('click',()=>completePattern1000LessonStep(skill,at));
}

const ODD_EVEN1000_LESSON_VERSION=1;
const ODD_EVEN1000_SECTIONS=['EŞLEŞTİR','ARTANI GÖR','BİRLİK','KURAL','SINIFLANDIR','TAŞI'];
const ODD_EVEN1000_LESSON_STEPS=[
  {id:'pair-six',section:'EŞLEŞTİR',kind:'pair',n:6,title:'6 nesneyi ikişerli eşleştir.',body:'Her seferinde iki nesneyi bir çift yap. Sonunda eşsiz nesne kalıp kalmadığını gör.',result:'6 nesne ikişerli eşleşti; artan kalmadı. 6 çifttir.'},
  {id:'pair-seven',section:'EŞLEŞTİR',kind:'pair',n:7,title:'7 nesneyi aynı şekilde eşleştir.',body:'Yine ikişerli çiftler oluştur. Bu kez bütün nesnelerin eşleşip eşleşmediğini kontrol et.',result:'7 nesne ikişerli eşleşti; 1 nesne arttı. 7 tektir.'},
  {id:'pair-contrast',section:'ARTANI GÖR',kind:'choice',correct:'9',options:['8','9'],title:'Aynı eşleştirme, farklı sonuç.',body:'8 ve 9’u karşılaştır. Hangisinde ikişerli eşleştirmeden sonra 1 nesne artar?',result:'8’de artan kalmaz; 9’da 1 nesne artar.'},
  {id:'ten-is-pairable',section:'BİRLİK',kind:'pair',n:10,title:'Bir onluk da tamamen eşleşir.',body:'10 birliği ikişerli eşleştir. Bir onluk oluşturacak 10 birlik artan bırakır mı?',result:'10 birlik tamamen ikişerli eşleşir; artan kalmaz.'},
  {id:'hundred-is-pairable',section:'BİRLİK',kind:'choice',correct:'Artan kalmaz',options:['Artan kalmaz','1 onluk artar'],title:'Bir yüzlük de tam onluklardan oluşur.',body:'1 yüzlükte 10 onluk vardır. Bu 10 onluğu ikişerli eşleştirdiğimizde ne olur?',result:'10 onluk tamamen eşleşir. Yüzlükler tek–çift kararında artan birlik oluşturmaz.'},
  {id:'ones-decide',section:'BİRLİK',kind:'choice',correct:'Birlik',options:['Yüzlük','Onluk','Birlik'],n:243,title:'Kararı birlik basamağı verir.',body:'243’te yüzlük ve onluk grupları tam çiftler oluşturabilir. Eşsiz kalan olup olmadığını hangi basamak belirler?',result:'243’ün birlik rakamı 3’tür. 3 birlik ikişerli eşleşince 1 birlik artar; 243 tektir.'},
  {id:'zero-one-boundary',section:'BİRLİK',kind:'multi-classify',numbers:[{n:430,parity:'Çift'},{n:431,parity:'Tek'}],title:'0 birlik ile 1 birlik arasındaki farkı gör.',body:'Yüzlük ve onluklar aynı. Yalnız birlik değiştiğinde tek–çift durumu nasıl değişiyor?',result:'430’da birlik 0: artan yok, çift. 431’de birlik 1: 1 artan var, tek.'},
  {id:'even-endings',section:'KURAL',kind:'digit-set',digits:[0,2,4,6,8],title:'Artan bırakmayan birlik rakamlarını topla.',body:'0’dan 9’a kadar birlik rakamlarını düşün. İkişerli eşleşince artan bırakmayanların hepsini seç.',result:'0, 2, 4, 6 ve 8 birlik tam eşleşir. Bu rakamlarla biten sayılar çifttir.'},
  {id:'odd-endings',section:'KURAL',kind:'digit-set',digits:[1,3,5,7,9],title:'1 artan bırakan birlik rakamlarını topla.',body:'Bu kez ikişerli eşleşince 1 birlik artıran rakamların hepsini seç.',result:'1, 3, 5, 7 ve 9 birlikten 1 birlik artar. Bu rakamlarla biten sayılar tektir.'},
  {id:'classify-three-digit',section:'SINIFLANDIR',kind:'multi-classify',numbers:[{n:248,parity:'Çift'},{n:431,parity:'Tek'},{n:1000,parity:'Çift'}],title:'Şimdi büyük sayılarda yalnız birliklere bak.',body:'Her sayının birlik rakamını kullanarak Tek ya da Çift sınıfını seç.',result:'248 çift, 431 tek, 1000 çifttir. Sayının büyüklüğü değil, birliklerin eşleşmesi belirleyicidir.'},
  {id:'consecutive-switch',section:'SINIFLANDIR',kind:'choice',correct:'249 tektir',options:['249 tektir','249 çifttir'],title:'Bir birlik eklemek tek–çift durumunu değiştirir.',body:'248 çifttir. Bir birlik ekleyip 249 yaptığımızda eşleşmede ne değişir?',result:'248’de artan yoktur. 249’da 1 birlik artar; 249 tektir.'},
  {id:'pairing-transfer',section:'TAŞI',kind:'choice',correct:'Evet',options:['Evet','Hayır'],title:'Aynı fikri günlük bir duruma taşı.',body:'527 öğrenci ikişerli sıraya geçiyor. Bir öğrenci eşsiz kalır mı?',result:'527’nin birlik rakamı 7’dir. 7 birlik ikişerli eşleşince 1 artar; bir öğrenci eşsiz kalır.'}
];
function oddEven1000SectionTrack(step){
  return '<div class="odd-even-section-track">'+ODD_EVEN1000_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>';
}
function oddEvenChoiceButtons(step){
  return '<div class="odd-even-choice-grid">'+step.options.map(value=>'<button type="button" class="odd-even-choice" data-odd-value="'+esc(value)+'" data-correct="'+(String(value)===String(step.correct)?'true':'false')+'">'+esc(value)+'</button>').join('')+'</div>';
}
function oddEvenMultiClassify(step){
  return '<div class="odd-even-classify-list">'+step.numbers.map((item,index)=>'<div class="odd-even-classify-row" data-parity-row="'+index+'"><strong>'+item.n+'</strong><div><button type="button" data-odd-parity="Çift" data-correct="'+(item.parity==='Çift'?'true':'false')+'">Çift</button><button type="button" data-odd-parity="Tek" data-correct="'+(item.parity==='Tek'?'true':'false')+'">Tek</button></div></div>').join('')+'</div>';
}
function oddEvenLessonVisual(step){
  if(step.kind==='pair') return '<div class="odd-even-lesson-core">'+parityPairBuilder(step.n,step.n)+'<p class="odd-even-help" id="oddEvenHelp">“Bir çift oluştur” ile ikişerli eşleştir.</p><div class="odd-even-result" id="oddEvenResult">'+esc(step.result)+'</div></div>';
  if(step.id==='pair-contrast') return '<div class="odd-even-lesson-core"><div class="odd-even-card-pair">'+parityCardVisual(8,8,0)+parityCardVisual(9,9,1)+'</div>'+oddEvenChoiceButtons(step)+'<p class="odd-even-help" id="oddEvenHelp">Eşsiz kalan turuncu birliği karşılaştır.</p><div class="odd-even-result" id="oddEvenResult">'+esc(step.result)+'</div></div>';
  if(step.id==='hundred-is-pairable') return '<div class="odd-even-lesson-core"><div class="odd-even-hundred-safe"><strong>1 yüzlük</strong><small>10 onluk</small><div>'+amountModel('ten',10)+'</div></div>'+oddEvenChoiceButtons(step)+'<p class="odd-even-help" id="oddEvenHelp">10 onluğu ikişerli düşün.</p><div class="odd-even-result" id="oddEvenResult">'+esc(step.result)+'</div></div>';
  if(step.id==='ones-decide') return '<div class="odd-even-lesson-core"><div class="odd-even-place-focus">'+patternPlaceBoard(step.n,2)+parityCardVisual(step.n,3,1)+'</div>'+oddEvenChoiceButtons(step)+'<p class="odd-even-help" id="oddEvenHelp">Tam onluklar eşleşir; artanı hangi basamak bırakabilir?</p><div class="odd-even-result" id="oddEvenResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='multi-classify') return '<div class="odd-even-lesson-core">'+oddEvenMultiClassify(step)+'<p class="odd-even-help" id="oddEvenHelp">Her sayıda birlik rakamını kullan.</p><div class="odd-even-result" id="oddEvenResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='digit-set') return '<div class="odd-even-lesson-core"><div class="odd-even-digit-grid">'+Array.from({length:10},(_,digit)=>'<button type="button" data-odd-digit="'+digit+'" data-correct="'+(step.digits.includes(digit)?'true':'false')+'">'+digit+'</button>').join('')+'</div><button type="button" class="odd-even-set-check" id="oddEvenSetCheck">Seçimimi kontrol et</button><p class="odd-even-help" id="oddEvenHelp">Beş rakam seç.</p><div class="odd-even-result" id="oddEvenResult">'+esc(step.result)+'</div></div>';
  if(step.id==='consecutive-switch') return '<div class="odd-even-lesson-core"><div class="odd-even-card-pair">'+parityCardVisual(248,8,0)+parityCardVisual(249,9,1)+'</div>'+oddEvenChoiceButtons(step)+'<p class="odd-even-help" id="oddEvenHelp">Bir birlik eklenince eşsiz kalan değişiyor mu?</p><div class="odd-even-result" id="oddEvenResult">'+esc(step.result)+'</div></div>';
  if(step.id==='pairing-transfer') return '<div class="odd-even-lesson-core"><div class="odd-even-context-card"><strong>527 öğrenci</strong><span>👤👤 · 👤👤 · …</span><small>ikişerli sıra</small></div>'+oddEvenChoiceButtons(step)+'<p class="odd-even-help" id="oddEvenHelp">527’nin birlik rakamını eşleştir.</p><div class="odd-even-result" id="oddEvenResult">'+esc(step.result)+'</div></div>';
  return '<div class="odd-even-lesson-core">'+oddEvenChoiceButtons(step)+'<div class="odd-even-result" id="oddEvenResult">'+esc(step.result)+'</div></div>';
}
function revealOddEvenResult(){ $('#oddEvenResult')?.classList.add('revealed'); }
function wireOddEvenChoiceStep(step,next){
  $$('.odd-even-choice').forEach(button=>button.addEventListener('click',()=>{
    if(button.disabled) return;
    if(button.dataset.correct!=='true'){
      button.classList.add('wrong'); setTimeout(()=>button.classList.remove('wrong'),320);
      $('#oddEvenHelp').textContent='Birlikleri ikişerli eşleştirip artan olup olmadığına yeniden bak.';
      return;
    }
    button.classList.add('selected'); $$('.odd-even-choice').forEach(x=>x.disabled=true);
    $('#oddEvenHelp').textContent=''; revealOddEvenResult(); next.disabled=false;
  }));
}
function wireOddEvenLessonStep(step,next){
  if(step.kind==='pair'){
    const root=$('.sg-parity-builder'), action=root?.querySelector('.sg-pair-action');
    action?.addEventListener('click',()=>{
      const free=[...root.querySelectorAll('.sg-pair-token:not(.paired)')];
      if(free.length>=2){ free[0].classList.add('paired'); free[1].classList.add('paired'); }
      const left=root.querySelectorAll('.sg-pair-token:not(.paired)').length;
      $('#oddEvenHelp').textContent=left>=2?left+' birlik henüz eşleşmedi.':(left===1?'1 birlik eşsiz kaldı.':'Artan birlik kalmadı.');
      if(left<2){ action.disabled=true; revealOddEvenResult(); next.disabled=false; }
    });
    return;
  }
  if(step.kind==='choice'){ wireOddEvenChoiceStep(step,next); return; }
  if(step.kind==='multi-classify'){
    $$('.odd-even-classify-row').forEach(row=>row.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
      if(button.disabled) return;
      if(button.dataset.correct!=='true'){
        button.classList.add('wrong'); setTimeout(()=>button.classList.remove('wrong'),320);
        $('#oddEvenHelp').textContent='Bu sayının birlik rakamını ikişerli eşleştir.';
        return;
      }
      row.classList.add('complete'); button.classList.add('selected'); row.querySelectorAll('button').forEach(x=>x.disabled=true);
      if($$('.odd-even-classify-row:not(.complete)').length===0){ $('#oddEvenHelp').textContent=''; revealOddEvenResult(); next.disabled=false; }
    })));
    return;
  }
  if(step.kind==='digit-set'){
    $$('[data-odd-digit]').forEach(button=>button.addEventListener('click',()=>button.classList.toggle('selected')));
    $('#oddEvenSetCheck')?.addEventListener('click',()=>{
      const picked=$$('[data-odd-digit].selected').map(button=>Number(button.dataset.oddDigit)).sort((a,b)=>a-b);
      const expected=[...step.digits].sort((a,b)=>a-b);
      const correct=picked.length===expected.length&&picked.every((value,index)=>value===expected[index]);
      if(!correct){ $('#oddEvenHelp').textContent='Tam beş rakam seç. Her rakamı ikişerli eşleştirince artan kalıp kalmadığını düşün.'; return; }
      $$('[data-odd-digit]').forEach(button=>button.disabled=true); $('#oddEvenSetCheck').disabled=true;
      $('#oddEvenHelp').textContent=''; revealOddEvenResult(); next.disabled=false;
    });
  }
}
function completeOddEven1000LessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id), lc=ss.learningCycle, next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);
  lc.lessonVersion=ODD_EVEN1000_LESSON_VERSION;
  if(next>=ODD_EVEN1000_LESSON_STEPS.length){
    lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now(); saveState(); session.planIndex++; loadPlanItem(); return;
  }
  saveState(); session.lessonStepIndex=next; renderOddEven1000LessonStep(skill,next);
}
function renderOddEven1000LessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(ODD_EVEN1000_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(ODD_EVEN1000_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=ODD_EVEN1000_LESSON_STEPS[at];
  session.lessonStepIndex=at; currentQuestion=null; renderPracticeHeader(skill);
  $('#practiceMode').textContent='KONU ANLATIMI'; $('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+ODD_EVEN1000_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/ODD_EVEN1000_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="odd-even-lesson-stage" data-odd-even-step="'+esc(step.id)+'">'+oddEven1000SectionTrack(step)+'<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · ADIM '+(at+1)+' / '+ODD_EVEN1000_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="odd-even-lesson-visual">'+oddEvenLessonVisual(step)+'</div><div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="oddEvenLessonNext" disabled>'+(at===ODD_EVEN1000_LESSON_STEPS.length-1?'Birlikte uygulamaya geç':'Sonraki adım')+' <b>→</b></button></div></div>';
  const next=$('#oddEvenLessonNext'); wireOddEvenLessonStep(step,next);
  next?.addEventListener('click',()=>completeOddEven1000LessonStep(skill,at));
}


const NEL_MATCH_LESSON_VERSION=1;
const NEL_MATCH_SECTIONS=['EŞLEŞTİR','ÖZELLİĞE BAK','ANLAT','TAŞI'];
const NEL_MATCH_LESSON_STEPS=[
  {
    id:'same-object',section:'EŞLEŞTİR',kind:'choice',attribute:'exact',
    target:{shape:'circle',tone:'blue',size:'small'},
    options:[
      {shape:'circle',tone:'blue',size:'small',correct:true},
      {shape:'circle',tone:'blue',size:'large'},
      {shape:'square',tone:'red',size:'small'}
    ],
    title:'Aynısını bul.',body:'Hedefin rengine, şekline ve büyüklüğüne birlikte bak.',
    result:'İki nesnenin rengi, şekli ve büyüklüğü aynı.'
  },
  {
    id:'same-colour',section:'ÖZELLİĞE BAK',kind:'choice',attribute:'tone',
    target:{shape:'circle',tone:'blue',size:'small'},
    options:[
      {shape:'square',tone:'blue',size:'large',correct:true},
      {shape:'circle',tone:'red',size:'small'},
      {shape:'triangle',tone:'yellow',size:'small'}
    ],
    title:'Bu kez yalnız renge bak.',body:'Şekli ve büyüklüğü farklı olabilir. Hedefle aynı renkte olanı seç.',
    result:'Şekilleri farklı olsa da ikisinin rengi aynı.'
  },
  {
    id:'same-shape',section:'ÖZELLİĞE BAK',kind:'choice',attribute:'shape',
    target:{shape:'circle',tone:'red',size:'large'},
    options:[
      {shape:'circle',tone:'blue',size:'small',correct:true},
      {shape:'square',tone:'red',size:'large'},
      {shape:'triangle',tone:'green',size:'large'}
    ],
    title:'Renk değişse de şekil aynı kalabilir.',body:'Hedefle aynı şekle sahip olanı bul.',
    result:'Renkleri ve büyüklükleri farklı; ama ikisi de daire.'
  },
  {
    id:'same-size',section:'ÖZELLİĞE BAK',kind:'choice',attribute:'size',
    target:{shape:'circle',tone:'blue',size:'large'},
    options:[
      {shape:'triangle',tone:'green',size:'large',correct:true},
      {shape:'square',tone:'red',size:'small'},
      {shape:'circle',tone:'yellow',size:'small'}
    ],
    title:'Şimdi büyüklüğü karşılaştır.',body:'Şekli ve rengi görmezden gel. Hedefle aynı büyüklükte olanı seç.',
    result:'Şekilleri farklı olsa da iki nesne aynı büyüklükte.'
  },
  {
    id:'same-length',section:'ÖZELLİĞE BAK',kind:'choice',attribute:'length',
    target:{shape:'bar',tone:'red',size:'medium',length:'long',height:'medium'},
    options:[
      {shape:'bar',tone:'blue',size:'medium',length:'long',height:'medium',correct:true},
      {shape:'bar',tone:'blue',size:'medium',length:'short',height:'medium'},
      {shape:'tower',tone:'yellow',size:'medium',length:'medium',height:'tall'}
    ],
    title:'Uzunluk da bir eşleştirme özelliğidir.',body:'Renkler farklı. Yatay uzunlukları karşılaştır.',
    result:'İki çubuğun rengi farklı; uzunlukları aynı.'
  },
  {
    id:'same-height',section:'ÖZELLİĞE BAK',kind:'choice',attribute:'height',
    target:{shape:'tower',tone:'yellow',size:'medium',length:'medium',height:'tall'},
    options:[
      {shape:'tower',tone:'blue',size:'medium',length:'medium',height:'tall',correct:true},
      {shape:'tower',tone:'green',size:'medium',length:'medium',height:'short'},
      {shape:'bar',tone:'blue',size:'medium',length:'long',height:'medium'}
    ],
    title:'Yüksekliği karşılaştır.',body:'Hedefle aynı yüksekliğe sahip olanı seç.',
    result:'İki nesnenin yüksekliği aynı.'
  },
  {
    id:'explain-match',section:'ANLAT',kind:'reason',
    left:{shape:'circle',tone:'red',size:'large'},right:{shape:'circle',tone:'blue',size:'small'},
    correct:'Şekilleri aynı.',options:['Renkleri aynı.','Şekilleri aynı.','Büyüklükleri aynı.'],
    title:'Neden eş olduklarını söyle.',body:'İki nesnenin ortak özelliğini bul.',
    result:'İkisinin de şekli daire. Ortak özellikleri şekilleri.'
  },
  {
    id:'real-world-match',section:'TAŞI',kind:'real-world',
    title:'Şimdi eşleştirmeyi ekrandan çıkar.',body:'Yakınında iki nesne bul. Renk, şekil, büyüklük, uzunluk veya yükseklikten bir ortak özellik seç ve neden eş olduklarını söyle.',
    result:'Eşleştirme, nesnelerin ortak bir özelliğini fark etmektir.'
  }
];

function nelMatchObjectMarkup(item={},label=''){
  const shape=item.shape||'circle', tone=item.tone||'blue', size=item.size||'medium';
  const length=item.length||'medium', height=item.height||'medium';
  const aria=label||[tone,shape,size,length,height].join(' ');
  return '<span class="nel-match-object '+esc(shape)+' '+esc(tone)+' '+esc(size)+' length-'+esc(length)+' height-'+esc(height)+'" role="img" aria-label="'+esc(aria)+'"><i></i></span>';
}
function nelMatchSectionTrack(step){
  return '<div class="nel-match-section-track">'+NEL_MATCH_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>';
}
function nelMatchChoiceVisual(step){
  return '<div class="nel-match-core">'+
    '<div class="nel-match-target-card"><small>HEDEF</small>'+nelMatchObjectMarkup(step.target,'hedef nesne')+'</div>'+
    '<div class="nel-match-option-row">'+step.options.map((item,index)=>'<button type="button" class="nel-match-choice" data-nel-correct="'+(item.correct?'true':'false')+'" aria-label="'+(index+1)+'. seçenek">'+nelMatchObjectMarkup(item,'eşleştirme seçeneği')+'</button>').join('')+'</div>'+
    '<p class="nel-match-help" id="nelMatchHelp"></p>'+
    '<div class="nel-match-result" id="nelMatchResult">'+esc(step.result)+'</div>'+
  '</div>';
}
function nelMatchReasonVisual(step){
  return '<div class="nel-match-core">'+
    '<div class="nel-match-pair-card">'+nelMatchObjectMarkup(step.left,'sol nesne')+'<span>↔</span>'+nelMatchObjectMarkup(step.right,'sağ nesne')+'</div>'+
    '<div class="nel-match-reason-grid">'+step.options.map(value=>'<button type="button" class="nel-match-reason" data-nel-reason="'+esc(value)+'" data-correct="'+(value===step.correct?'true':'false')+'">'+esc(value)+'</button>').join('')+'</div>'+
    '<p class="nel-match-help" id="nelMatchHelp"></p>'+
    '<div class="nel-match-result" id="nelMatchResult">'+esc(step.result)+'</div>'+
  '</div>';
}
function nelMatchRealWorldVisual(step){
  return '<div class="nel-match-core">'+
    '<div class="nel-match-real-world">'+
      '<span>1</span><p>İki nesne seç.</p>'+
      '<span>2</span><p>Ortak bir özellik bul.</p>'+
      '<span>3</span><p>“Bunlar eş çünkü…” diye anlat.</p>'+
    '</div>'+
    '<button type="button" class="nel-match-done" id="nelMatchDone">Eşimi buldum</button>'+
    '<div class="nel-match-result" id="nelMatchResult">'+esc(step.result)+'</div>'+
  '</div>';
}
function nelMatchLessonVisual(step){
  if(step.kind==='reason') return nelMatchReasonVisual(step);
  if(step.kind==='real-world') return nelMatchRealWorldVisual(step);
  return nelMatchChoiceVisual(step);
}
function revealNelMatchResult(){ $('#nelMatchResult')?.classList.add('revealed'); }
function wireNelMatchLessonStep(step,next){
  if(step.kind==='choice'){
    $$('.nel-match-choice').forEach(button=>button.addEventListener('click',()=>{
      if(button.disabled) return;
      if(button.dataset.nelCorrect!=='true'){
        button.classList.add('wrong'); setTimeout(()=>button.classList.remove('wrong'),320);
        const copy={
          exact:'Hedefteki üç özelliği birlikte karşılaştır: renk, şekil ve büyüklük.',
          tone:'Bu görevde yalnız renge bak.',
          shape:'Bu görevde yalnız şekle bak.',
          size:'Bu görevde yalnız büyüklüğe bak.',
          length:'Çubukların yatay uzunluğunu karşılaştır.',
          height:'Nesnelerin yüksekliğini karşılaştır.'
        };
        $('#nelMatchHelp').textContent=copy[step.attribute]||'Ortak özelliğe yeniden bak.';
        return;
      }
      button.classList.add('selected');
      $$('.nel-match-choice').forEach(x=>x.disabled=true);
      $('#nelMatchHelp').textContent='';
      revealNelMatchResult(); next.disabled=false;
    }));
    return;
  }
  if(step.kind==='reason'){
    $$('.nel-match-reason').forEach(button=>button.addEventListener('click',()=>{
      if(button.disabled) return;
      if(button.dataset.correct!=='true'){
        button.classList.add('wrong'); setTimeout(()=>button.classList.remove('wrong'),320);
        $('#nelMatchHelp').textContent='İki nesnede değişmeyen özelliği bul.';
        return;
      }
      button.classList.add('selected'); $$('.nel-match-reason').forEach(x=>x.disabled=true);
      $('#nelMatchHelp').textContent=''; revealNelMatchResult(); next.disabled=false;
    }));
    return;
  }
  $('#nelMatchDone')?.addEventListener('click',()=>{
    $('#nelMatchDone').disabled=true; revealNelMatchResult(); next.disabled=false;
  });
}
function completeNelMatchLessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id), lc=ss.learningCycle, next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);
  lc.lessonVersion=NEL_MATCH_LESSON_VERSION;
  if(next>=NEL_MATCH_LESSON_STEPS.length){
    lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now(); saveState(); session.planIndex++; loadPlanItem(); return;
  }
  saveState(); session.lessonStepIndex=next; renderNelMatchLessonStep(skill,next);
}
function renderNelMatchLessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(NEL_MATCH_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(NEL_MATCH_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=NEL_MATCH_LESSON_STEPS[at];
  session.lessonStepIndex=at; currentQuestion=null; renderPracticeHeader(skill);
  $('#practiceMode').textContent='KEŞFET'; $('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+NEL_MATCH_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/NEL_MATCH_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="nel-match-lesson-stage" data-nel-match-step="'+esc(step.id)+'">'+
    nelMatchSectionTrack(step)+
    '<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · '+(at+1)+' / '+NEL_MATCH_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div>'+
    '<div class="nel-match-lesson-visual">'+nelMatchLessonVisual(step)+'</div>'+
    '<div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="nelMatchLessonNext" disabled>'+(at===NEL_MATCH_LESSON_STEPS.length-1?'Eşleştirme oyunlarına geç':'Sonraki keşif')+' <b>→</b></button></div>'+
  '</div>';
  const next=$('#nelMatchLessonNext'); wireNelMatchLessonStep(step,next);
  next?.addEventListener('click',()=>completeNelMatchLessonStep(skill,at));
}


const NEL_SORT_LESSON_VERSION=1;
const NEL_SORT_SECTIONS=['SINIFLA','KURALI DEĞİŞTİR','ANLAT','TAŞI'];
const NEL_SORT_SHARED_ITEMS=[
  {id:'lesson-blue-circle',shape:'circle',tone:'blue',size:'small',length:'medium',height:'medium'},
  {id:'lesson-blue-square',shape:'square',tone:'blue',size:'large',length:'medium',height:'medium'},
  {id:'lesson-red-circle',shape:'circle',tone:'red',size:'large',length:'medium',height:'medium'},
  {id:'lesson-red-square',shape:'square',tone:'red',size:'small',length:'medium',height:'medium'}
];
const NEL_SORT_LENGTH_ITEMS=[
  {id:'lesson-short-blue',shape:'bar',tone:'blue',size:'medium',length:'short',height:'medium'},
  {id:'lesson-short-red',shape:'bar',tone:'red',size:'medium',length:'short',height:'medium'},
  {id:'lesson-long-blue',shape:'bar',tone:'blue',size:'medium',length:'long',height:'medium'},
  {id:'lesson-long-green',shape:'bar',tone:'green',size:'medium',length:'long',height:'medium'}
];
const NEL_SORT_HEIGHT_ITEMS=[
  {id:'lesson-low-blue',shape:'tower',tone:'blue',size:'medium',length:'medium',height:'short'},
  {id:'lesson-low-red',shape:'tower',tone:'red',size:'medium',length:'medium',height:'short'},
  {id:'lesson-tall-yellow',shape:'tower',tone:'yellow',size:'medium',length:'medium',height:'tall'},
  {id:'lesson-tall-green',shape:'tower',tone:'green',size:'medium',length:'medium',height:'tall'}
];
const NEL_SORT_LESSON_STEPS=[
  {
    id:'sort-colour',section:'SINIFLA',kind:'sort',attribute:'tone',attributeLabel:'renk',
    bins:[{value:'blue',label:'Mavi'},{value:'red',label:'Kırmızı'}],items:NEL_SORT_SHARED_ITEMS,
    title:'Aynı renkte olanları bir araya getir.',body:'Her nesneye bak ve yalnız rengini kullanarak iki grup oluştur.',
    result:'Nesneler renklerine göre iki gruba ayrıldı.'
  },
  {
    id:'resort-shape',section:'KURALI DEĞİŞTİR',kind:'sort',attribute:'shape',attributeLabel:'şekil',
    bins:[{value:'circle',label:'Daire'},{value:'square',label:'Kare'}],items:NEL_SORT_SHARED_ITEMS,
    title:'Aynı nesneler, yeni bir kural.',body:'Az önce renge göre ayırdığın aynı nesneleri şimdi şekillerine göre yeniden sınıfla.',
    result:'Aynı nesneler bu kez şekillerine göre yeniden gruplandı.'
  },
  {
    id:'resort-size',section:'KURALI DEĞİŞTİR',kind:'sort',attribute:'size',attributeLabel:'büyüklük',
    bins:[{value:'small',label:'Küçük'},{value:'large',label:'Büyük'}],items:NEL_SORT_SHARED_ITEMS,
    title:'Bir üçüncü özellik daha var.',body:'Aynı dört nesneyi bu kez büyüklüklerine göre iki gruba ayır.',
    result:'Bir nesnenin rengi, şekli ve büyüklüğü aynı anda olabilir; kural değişince grubu da değişebilir.'
  },
  {
    id:'sort-length',section:'SINIFLA',kind:'sort',attribute:'length',attributeLabel:'uzunluk',
    bins:[{value:'short',label:'Kısa'},{value:'long',label:'Uzun'}],items:NEL_SORT_LENGTH_ITEMS,
    title:'Uzunluğa göre sınıfla.',body:'Çubukların renkleri farklı olabilir. Bu kez yalnız yatay uzunluğa bak.',
    result:'Kısa olanlar bir grupta, uzun olanlar başka grupta.'
  },
  {
    id:'sort-height',section:'SINIFLA',kind:'sort',attribute:'height',attributeLabel:'yükseklik',
    bins:[{value:'short',label:'Alçak'},{value:'tall',label:'Yüksek'}],items:NEL_SORT_HEIGHT_ITEMS,
    title:'Yüksekliğe göre sınıfla.',body:'Kulelerin yalnız yüksekliğini karşılaştır.',
    result:'Alçak ve yüksek nesneler ayrı gruplarda.'
  },
  {
    id:'discover-rule',section:'ANLAT',kind:'rule',attribute:'shape',attributeLabel:'şekil',
    bins:[{value:'circle',label:'Daire'},{value:'square',label:'Kare'}],items:NEL_SORT_SHARED_ITEMS,
    correct:'Şekle göre',options:['Renge göre','Şekle göre','Büyüklüğe göre'],
    title:'Kuralı sen bul.',body:'Gruplara bak. Bu nesneler hangi ortak özelliğe göre ayrılmış?',
    result:'Bir sınıflamayı anlamak için aynı gruptaki ortak özelliği ararız.'
  },
  {
    id:'explain-resort',section:'ANLAT',kind:'reason',
    correct:'Aynı nesnenin birden fazla özelliği vardır.',
    options:['Aynı nesnenin birden fazla özelliği vardır.','Her nesnenin yalnız bir özelliği vardır.','Gruplama kuralı önemli değildir.'],
    title:'Neden yeniden sınıflayabildik?',body:'Aynı dört nesneyi renk, şekil ve büyüklüğe göre farklı biçimlerde ayırdık.',
    result:'Bir nesnenin birden fazla özelliği vardır; hangi özelliği seçtiğimiz sınıflama kuralını belirler.'
  },
  {
    id:'real-world-sort',section:'TAŞI',kind:'real-world',
    title:'Şimdi kendi çevrende sınıfla.',body:'Yakınında en az dört nesne bul. Tek bir özellik seç: renk, şekil, büyüklük, uzunluk veya yükseklik. Nesneleri o kurala göre iki gruba ayır ve kuralını söyle.',
    result:'Sınıflama, nesneleri seçtiğin ortak bir özelliğe göre düzenlemektir.'
  }
];

function nelSortSectionTrack(step){
  return '<div class="nel-sort-section-track">'+NEL_SORT_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>';
}
function nelSortLessonCore(step){
  if(step.kind==='sort'){
    return '<div class="nel-sort-lesson-core">'+
      nelSortBuilderVisual({attribute:step.attribute,attributeLabel:step.attributeLabel,bins:step.bins,items:step.items,lesson:true})+
      '<p class="nel-sort-help" id="nelSortHelp">Önce bir nesneye, sonra gideceği kutuya dokun.</p>'+
      '<div class="nel-sort-result" id="nelSortResult">'+esc(step.result)+'</div>'+
    '</div>';
  }
  if(step.kind==='rule'){
    return '<div class="nel-sort-lesson-core">'+
      nelSortDisplayVisual({attribute:step.attribute,bins:step.bins,items:step.items})+
      '<div class="nel-sort-rule-grid">'+step.options.map(value=>'<button type="button" class="nel-sort-rule-choice" data-nel-sort-rule="'+esc(value)+'" data-correct="'+(value===step.correct?'true':'false')+'">'+esc(value)+'</button>').join('')+'</div>'+
      '<p class="nel-sort-help" id="nelSortHelp"></p>'+
      '<div class="nel-sort-result" id="nelSortResult">'+esc(step.result)+'</div>'+
    '</div>';
  }
  if(step.kind==='reason'){
    const tone={attribute:'tone',bins:[{value:'blue',label:'Mavi'},{value:'red',label:'Kırmızı'}],items:NEL_SORT_SHARED_ITEMS};
    const shape={attribute:'shape',bins:[{value:'circle',label:'Daire'},{value:'square',label:'Kare'}],items:NEL_SORT_SHARED_ITEMS};
    return '<div class="nel-sort-lesson-core">'+
      nelSortTwoRulesVisual({first:tone,second:shape})+
      '<div class="nel-sort-rule-grid">'+step.options.map(value=>'<button type="button" class="nel-sort-rule-choice" data-nel-sort-rule="'+esc(value)+'" data-correct="'+(value===step.correct?'true':'false')+'">'+esc(value)+'</button>').join('')+'</div>'+
      '<p class="nel-sort-help" id="nelSortHelp"></p>'+
      '<div class="nel-sort-result" id="nelSortResult">'+esc(step.result)+'</div>'+
    '</div>';
  }
  return '<div class="nel-sort-lesson-core">'+
    '<div class="nel-sort-real-world"><span>1</span><p>Dört veya daha çok nesne seç.</p><span>2</span><p>Tek bir ortak özellik seç.</p><span>3</span><p>İki grup oluştur ve kuralını söyle.</p></div>'+
    '<button type="button" class="nel-sort-done" id="nelSortDone">Sınıflamamı yaptım</button>'+
    '<div class="nel-sort-result" id="nelSortResult">'+esc(step.result)+'</div>'+
  '</div>';
}
function revealNelSortResult(){ $('#nelSortResult')?.classList.add('revealed'); }
function wireNelSortLessonStep(step,next){
  if(step.kind==='sort'){
    const root=$('.nel-sort-builder');
    let selected=null;
    root?.querySelectorAll('[data-nel-sort-item]').forEach(item=>item.addEventListener('click',()=>{
      if(item.classList.contains('placed')) return;
      root.querySelectorAll('[data-nel-sort-item]').forEach(x=>x.classList.remove('selected'));
      item.classList.add('selected'); selected=item;
      $('#nelSortHelp').textContent='Şimdi bu nesnenin gideceği kutuya dokun.';
    }));
    root?.querySelectorAll('[data-nel-sort-bin]').forEach(bin=>bin.addEventListener('click',()=>{
      if(!selected){ $('#nelSortHelp').textContent='Önce bir nesne seç.'; return; }
      if(selected.dataset.nelSortCorrect!==bin.dataset.nelSortBin){
        bin.classList.add('wrong'); setTimeout(()=>bin.classList.remove('wrong'),300);
        $('#nelSortHelp').textContent='Bu kutunun kuralıyla nesnenin '+step.attributeLabel+' özelliğini yeniden karşılaştır.';
        return;
      }
      const target=root.querySelector('[data-nel-sort-bin-items="'+CSS.escape(bin.dataset.nelSortBin)+'"]');
      selected.classList.remove('selected'); selected.classList.add('placed'); selected.disabled=true;
      target?.appendChild(selected); selected=null;
      const remaining=root.querySelectorAll('[data-nel-sort-item]:not(.placed)').length;
      $('#nelSortHelp').textContent=remaining?remaining+' nesne daha var.':'Bütün nesneler seçilen kurala göre gruplandı.';
      if(!remaining){ root.classList.add('complete'); revealNelSortResult(); next.disabled=false; }
    }));
    return;
  }
  if(step.kind==='rule'||step.kind==='reason'){
    $$('.nel-sort-rule-choice').forEach(button=>button.addEventListener('click',()=>{
      if(button.dataset.correct!=='true'){
        button.classList.add('wrong'); setTimeout(()=>button.classList.remove('wrong'),300);
        $('#nelSortHelp').textContent=step.kind==='rule'?'Aynı kutudaki nesnelerin ortak özelliğine bak.':'Bir nesnenin aynı anda kaç farklı özelliği olabilir?';
        return;
      }
      button.classList.add('selected'); $$('.nel-sort-rule-choice').forEach(x=>x.disabled=true);
      $('#nelSortHelp').textContent=''; revealNelSortResult(); next.disabled=false;
    }));
    return;
  }
  $('#nelSortDone')?.addEventListener('click',()=>{
    $('#nelSortDone').disabled=true; revealNelSortResult(); next.disabled=false;
  });
}
function completeNelSortLessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id), lc=ss.learningCycle, next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);
  lc.lessonVersion=NEL_SORT_LESSON_VERSION;
  if(next>=NEL_SORT_LESSON_STEPS.length){
    lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now(); saveState(); session.planIndex++; loadPlanItem(); return;
  }
  saveState(); session.lessonStepIndex=next; renderNelSortLessonStep(skill,next);
}
function renderNelSortLessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(NEL_SORT_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(NEL_SORT_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=NEL_SORT_LESSON_STEPS[at];
  session.lessonStepIndex=at; currentQuestion=null; renderPracticeHeader(skill);
  $('#practiceMode').textContent='KEŞFET'; $('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+NEL_SORT_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/NEL_SORT_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="nel-sort-lesson-stage" data-nel-sort-step="'+esc(step.id)+'">'+
    nelSortSectionTrack(step)+
    '<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · '+(at+1)+' / '+NEL_SORT_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div>'+
    '<div class="nel-sort-lesson-visual">'+nelSortLessonCore(step)+'</div>'+
    '<div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="nelSortLessonNext" disabled>'+(at===NEL_SORT_LESSON_STEPS.length-1?'Sınıflama oyunlarına geç':'Sonraki keşif')+' <b>→</b></button></div>'+
  '</div>';
  const next=$('#nelSortLessonNext'); wireNelSortLessonStep(step,next);
  next?.addEventListener('click',()=>completeNelSortLessonStep(skill,at));
}

const NEL_COMPARE_LESSON_VERSION=1;
const NEL_COMPARE_SECTIONS=['KARŞILAŞTIR','HİZALA','ANLAT','TAŞI'];
const NEL_COMPARE_LESSON_STEPS=[
  {
    id:'compare-size',section:'KARŞILAŞTIR',kind:'choice',attribute:'size',attributeLabel:'büyüklük',
    left:{shape:'circle',tone:'red',size:'large',length:'medium',height:'medium'},
    right:{shape:'circle',tone:'blue',size:'small',length:'medium',height:'medium'},
    correct:'left',options:[['left','Soldaki daha büyük'],['right','Sağdaki daha büyük'],['equal','Aynı büyüklükte']],
    title:'Hangisi daha büyük?',body:'Renkleri farklı olabilir. Bu kez yalnız büyüklüklerine bak.',
    result:'Soldaki nesne daha büyük.'
  },
  {
    id:'compare-small',section:'KARŞILAŞTIR',kind:'choice',attribute:'size',attributeLabel:'büyüklük',
    left:{shape:'square',tone:'green',size:'large',length:'medium',height:'medium'},
    right:{shape:'square',tone:'yellow',size:'small',length:'medium',height:'medium'},
    correct:'right',options:[['left','Soldaki daha küçük'],['right','Sağdaki daha küçük'],['equal','Aynı büyüklükte']],
    title:'Şimdi daha küçük olanı bul.',body:'İki karenin büyüklüğünü karşılaştır ve daha küçük olanı seç.',
    result:'Sağdaki nesne daha küçük.'
  },
  {
    id:'compare-length-align',section:'HİZALA',kind:'align-choice',attribute:'length',attributeLabel:'uzunluk',requiresAlign:true,
    left:{shape:'bar',tone:'blue',size:'medium',length:'short',height:'medium'},
    right:{shape:'bar',tone:'red',size:'medium',length:'long',height:'medium'},
    correct:'right',options:[['left','Soldaki daha uzun'],['right','Sağdaki daha uzun'],['equal','Aynı uzunlukta']],
    title:'Önce başlangıçları hizala.',body:'Uzunlukları adil karşılaştırmak için iki çubuğu aynı başlangıç çizgisine getir.',
    result:'Başlangıçlar aynı hizadayken sağdaki çubuk daha uzun.'
  },
  {
    id:'compare-length-same',section:'KARŞILAŞTIR',kind:'choice',attribute:'length',attributeLabel:'uzunluk',
    left:{shape:'bar',tone:'green',size:'medium',length:'long',height:'medium'},
    right:{shape:'bar',tone:'yellow',size:'medium',length:'long',height:'medium'},
    correct:'equal',options:[['left','Soldaki daha uzun'],['right','Sağdaki daha uzun'],['equal','Aynı uzunlukta']],
    title:'Her karşılaştırmada biri daha uzun olmak zorunda değil.',body:'Çubukların renklerini yok say ve uzunluklarına bak.',
    result:'İki çubuk aynı uzunlukta.'
  },
  {
    id:'compare-height',section:'KARŞILAŞTIR',kind:'choice',attribute:'height',attributeLabel:'yükseklik',
    left:{shape:'tower',tone:'green',size:'medium',length:'medium',height:'short'},
    right:{shape:'tower',tone:'yellow',size:'medium',length:'medium',height:'tall'},
    correct:'right',options:[['left','Soldaki daha yüksek'],['right','Sağdaki daha yüksek'],['equal','Aynı yükseklikte']],
    title:'Hangisi daha yüksek?',body:'Kulelerin tabanlarını aynı çizgide düşün ve tepe noktalarını karşılaştır.',
    result:'Sağdaki kule daha yüksek.'
  },
  {
    id:'name-attribute',section:'ANLAT',kind:'reason',attribute:'length',attributeLabel:'uzunluk',
    left:{shape:'bar',tone:'blue',size:'medium',length:'short',height:'medium'},
    right:{shape:'bar',tone:'red',size:'medium',length:'long',height:'medium'},
    correct:'length',options:[['size','Büyüklüklerine göre'],['length','Uzunluklarına göre'],['height','Yüksekliklerine göre']],
    title:'Neye göre karşılaştırdığını söyle.',body:'Bu iki çubuk için baktığımız ortak özelliği seç.',
    result:'Burada uzunluklarını karşılaştırıyoruz.'
  },
  {
    id:'fair-compare',section:'ANLAT',kind:'reason',attribute:'length',attributeLabel:'uzunluk',misaligned:true,
    left:{shape:'bar',tone:'blue',size:'medium',length:'short',height:'medium'},
    right:{shape:'bar',tone:'red',size:'medium',length:'long',height:'medium'},
    correct:'align',options:[['align','Başlangıçlarını aynı hizaya getiririm'],['colour','Renklerini aynı yaparım'],['move','Birini daha yakına getiririm']],
    title:'Adil bir uzunluk karşılaştırması nasıl yapılır?',body:'Başlangıç noktaları farklıysa gözümüz yanılabilir.',
    result:'Uzunlukları karşılaştırmadan önce başlangıç noktalarını aynı hizaya getiririz.'
  },
  {
    id:'real-world-compare',section:'TAŞI',kind:'real-world',
    title:'Karşılaştırmayı çevrene taşı.',body:'Yakınında iki nesne bul. Büyüklük, uzunluk veya yükseklikten birini seç. Nesneleri o özelliğe göre karşılaştır ve “daha …” ya da “aynı …” diye anlat.',
    result:'Karşılaştırırken önce hangi özelliğe baktığını seçmek gerekir.'
  }
];

function nelCompareSectionTrack(step){
  return '<div class="nel-compare-section-track">'+NEL_COMPARE_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>';
}
function nelComparePairMarkup(step,aligned=true,question=false){
  if(step.attribute==='length'){
    const classes=['nel-compare-pair','compare-length','nel-compare-length-board'];
    if(aligned) classes.push('aligned');
    if(question) classes.push('question-pair');
    return '<div class="'+classes.join(' ')+'">'+
      '<span class="nel-compare-origin-label">BAŞLANGIÇ</span>'+
      '<div class="nel-compare-length-row left"><small>SOL</small><div class="nel-compare-length-track">'+nelMatchObjectMarkup(step.left,'soldaki çubuk')+'</div></div>'+
      '<div class="nel-compare-length-row right"><small>SAĞ</small><div class="nel-compare-length-track">'+nelMatchObjectMarkup(step.right,'sağdaki çubuk')+'</div></div>'+
    '</div>';
  }
  const classes=['nel-compare-pair'];
  if(aligned) classes.push('aligned');
  if(step.attribute==='height') classes.push('compare-height');
  if(question) classes.push('question-pair');
  return '<div class="'+classes.join(' ')+'">'+
    '<div class="nel-compare-card left"><small>SOL</small>'+nelMatchObjectMarkup(step.left,'soldaki nesne')+'</div>'+
    '<div class="nel-compare-divider">ve</div>'+
    '<div class="nel-compare-card right"><small>SAĞ</small>'+nelMatchObjectMarkup(step.right,'sağdaki nesne')+'</div>'+
  '</div>';
}
function nelCompareLessonCore(step){
  if(step.kind==='real-world'){
    return '<div class="nel-compare-lesson-core">'+
      '<div class="nel-compare-real-world"><span>1</span><p>İki nesne seç.</p><span>2</span><p>Tek bir özellik seç.</p><span>3</span><p>“Daha…” veya “aynı…” diye karşılaştır.</p></div>'+
      '<button type="button" class="nel-compare-done" id="nelCompareDone">Karşılaştırmamı yaptım</button>'+
      '<div class="nel-compare-result" id="nelCompareResult">'+esc(step.result)+'</div>'+
    '</div>';
  }
  const needAlign=step.kind==='align-choice';
  const aligned=!needAlign && !step.misaligned;
  return '<div class="nel-compare-lesson-core">'+
    nelComparePairMarkup(step,aligned)+
    (needAlign?'<button type="button" class="nel-compare-align" id="nelCompareAlign">Başlangıçları hizala</button>':'')+
    '<div class="nel-compare-choice-row">'+step.options.map(([value,label])=>'<button type="button" class="nel-compare-choice" data-nel-compare-choice="'+esc(value)+'" data-correct="'+(value===step.correct?'true':'false')+'" '+(needAlign?'disabled':'')+'>'+esc(label)+'</button>').join('')+'</div>'+
    '<p class="nel-compare-help" id="nelCompareHelp">'+(needAlign?'Önce başlangıçları hizala.':'')+'</p>'+
    '<div class="nel-compare-result" id="nelCompareResult">'+esc(step.result)+'</div>'+
  '</div>';
}
function revealNelCompareResult(){ $('#nelCompareResult')?.classList.add('revealed'); }
function wireNelCompareLessonStep(step,next){
  if(step.kind==='real-world'){
    $('#nelCompareDone')?.addEventListener('click',()=>{
      $('#nelCompareDone').disabled=true; revealNelCompareResult(); next.disabled=false;
    });
    return;
  }
  if(step.kind==='align-choice'){
    $('#nelCompareAlign')?.addEventListener('click',()=>{
      const pair=$('.nel-compare-pair'); pair?.classList.add('aligned');
      $('#nelCompareAlign').disabled=true;
      $$('.nel-compare-choice').forEach(button=>button.disabled=false);
      $('#nelCompareHelp').textContent='Şimdi uçları karşılaştır.';
    });
  }
  $$('.nel-compare-choice').forEach(button=>button.addEventListener('click',()=>{
    if(button.disabled) return;
    if(button.dataset.correct!=='true'){
      button.classList.add('wrong'); setTimeout(()=>button.classList.remove('wrong'),300);
      $('#nelCompareHelp').textContent=step.attribute==='length'?'Başlangıç ve bitiş noktalarına birlikte bak.':'Yalnız seçilen özelliği karşılaştır.';
      return;
    }
    button.classList.add('selected'); $$('.nel-compare-choice').forEach(x=>{x.disabled=true;x.classList.remove('wrong');});
    $('#nelCompareHelp').textContent=''; revealNelCompareResult(); next.disabled=false;
  }));
}
function completeNelCompareLessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id), lc=ss.learningCycle, next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);
  lc.lessonVersion=NEL_COMPARE_LESSON_VERSION;
  if(next>=NEL_COMPARE_LESSON_STEPS.length){
    lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now(); saveState(); session.planIndex++; loadPlanItem(); return;
  }
  saveState(); session.lessonStepIndex=next; renderNelCompareLessonStep(skill,next);
}
function renderNelCompareLessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(NEL_COMPARE_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(NEL_COMPARE_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=NEL_COMPARE_LESSON_STEPS[at];
  session.lessonStepIndex=at; currentQuestion=null; renderPracticeHeader(skill);
  $('#practiceMode').textContent='KEŞFET'; $('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+NEL_COMPARE_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/NEL_COMPARE_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="nel-compare-lesson-stage" data-nel-compare-step="'+esc(step.id)+'">'+
    nelCompareSectionTrack(step)+
    '<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · '+(at+1)+' / '+NEL_COMPARE_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div>'+
    '<div class="nel-compare-lesson-visual">'+nelCompareLessonCore(step)+'</div>'+
    '<div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="nelCompareLessonNext" disabled>'+(at===NEL_COMPARE_LESSON_STEPS.length-1?'Karşılaştırma oyunlarına geç':'Sonraki keşif')+' <b>→</b></button></div>'+
  '</div>';
  const next=$('#nelCompareLessonNext'); wireNelCompareLessonStep(step,next);
  next?.addEventListener('click',()=>completeNelCompareLessonStep(skill,at));
}

const NEL_ORDER_LESSON_VERSION=1;
const NEL_ORDER_SECTIONS=['SIRALA','YÖNÜ DEĞİŞTİR','ANLAT','OLAY SIRASI','TAŞI'];
const NEL_ORDER_SIZE_ITEMS=[
  {id:'lesson-order-size-small',shape:'circle',tone:'blue',size:'small',length:'medium',height:'medium'},
  {id:'lesson-order-size-medium',shape:'circle',tone:'yellow',size:'medium',length:'medium',height:'medium'},
  {id:'lesson-order-size-large',shape:'circle',tone:'red',size:'large',length:'medium',height:'medium'}
];
const NEL_ORDER_LENGTH_ITEMS=[
  {id:'lesson-order-length-short',shape:'bar',tone:'green',size:'medium',length:'short',height:'medium'},
  {id:'lesson-order-length-medium',shape:'bar',tone:'yellow',size:'medium',length:'medium',height:'medium'},
  {id:'lesson-order-length-long',shape:'bar',tone:'blue',size:'medium',length:'long',height:'medium'}
];
const NEL_ORDER_HEIGHT_ITEMS=[
  {id:'lesson-order-height-low',shape:'tower',tone:'red',size:'medium',length:'medium',height:'short'},
  {id:'lesson-order-height-mid',shape:'tower',tone:'blue',size:'medium',length:'medium',height:'medium'},
  {id:'lesson-order-height-tall',shape:'tower',tone:'green',size:'medium',length:'medium',height:'tall'}
];
const NEL_ORDER_EVENT_ITEMS=[
  {id:'lesson-event-wet',kind:'event',label:'Ellerini ıslat'},
  {id:'lesson-event-soap',kind:'event',label:'Sabunla'},
  {id:'lesson-event-rinse',kind:'event',label:'Durula'}
];
const NEL_ORDER_LESSON_STEPS=[
  {
    id:'order-size',section:'SIRALA',kind:'order',attribute:'size',attributeLabel:'büyüklük',directionLabel:'küçükten büyüğe',
    items:[NEL_ORDER_SIZE_ITEMS[2],NEL_ORDER_SIZE_ITEMS[0],NEL_ORDER_SIZE_ITEMS[1]],
    expected:NEL_ORDER_SIZE_ITEMS.map(x=>x.id).join('|'),
    title:'Üç nesneyi küçükten büyüğe sırala.',body:'Tek tek karşılaştır ve en küçükten başlayarak üç yeri doldur.',
    result:'Büyüklük arttıkça sıra küçük, orta ve büyük olarak ilerledi.'
  },
  {
    id:'reverse-size',section:'YÖNÜ DEĞİŞTİR',kind:'order',attribute:'size',attributeLabel:'büyüklük',directionLabel:'büyükten küçüğe',
    items:[NEL_ORDER_SIZE_ITEMS[0],NEL_ORDER_SIZE_ITEMS[2],NEL_ORDER_SIZE_ITEMS[1]],
    expected:[...NEL_ORDER_SIZE_ITEMS].reverse().map(x=>x.id).join('|'),
    title:'Aynı nesneleri bu kez ters yönde sırala.',body:'Nesneler değişmedi. Yalnız sıralama yönünü büyükten küçüğe çevir.',
    result:'Aynı üç nesne seçilen yöne göre ters sıraya konabilir.'
  },
  {
    id:'order-length',section:'SIRALA',kind:'order',attribute:'length',attributeLabel:'uzunluk',directionLabel:'kısadan uzuna',
    items:[NEL_ORDER_LENGTH_ITEMS[1],NEL_ORDER_LENGTH_ITEMS[2],NEL_ORDER_LENGTH_ITEMS[0]],
    expected:NEL_ORDER_LENGTH_ITEMS.map(x=>x.id).join('|'),
    title:'Çubukları kısadan uzuna sırala.',body:'Renkleri yok say. Yalnız yatay uzunluklarını karşılaştır.',
    result:'Çubuklar kısa, orta ve uzun olarak sıralandı.'
  },
  {
    id:'order-height',section:'SIRALA',kind:'order',attribute:'height',attributeLabel:'yükseklik',directionLabel:'alçaktan yükseğe',
    items:[NEL_ORDER_HEIGHT_ITEMS[2],NEL_ORDER_HEIGHT_ITEMS[0],NEL_ORDER_HEIGHT_ITEMS[1]],
    expected:NEL_ORDER_HEIGHT_ITEMS.map(x=>x.id).join('|'),
    title:'Kuleleri alçaktan yükseğe sırala.',body:'Tabanları aynı çizgide düşün ve tepelerinin yüksekliğine bak.',
    result:'Kuleler alçak, orta ve yüksek olarak sıralandı.'
  },
  {
    id:'choose-order',section:'ANLAT',kind:'choose',
    title:'Hangi sıra gerçekten küçükten büyüğe gidiyor?',body:'Her satıra baştan sona bak. Büyüklüğün düzenli arttığı sırayı seç.',
    options:[
      {id:'correct',correct:true,items:NEL_ORDER_SIZE_ITEMS},
      {id:'reverse',items:[...NEL_ORDER_SIZE_ITEMS].reverse()},
      {id:'swap',items:[NEL_ORDER_SIZE_ITEMS[0],NEL_ORDER_SIZE_ITEMS[2],NEL_ORDER_SIZE_ITEMS[1]]}
    ],
    result:'Doğru sırada büyüklük küçükten büyüğe doğru ilerler.'
  },
  {
    id:'explain-order',section:'ANLAT',kind:'reason',
    title:'Bu sırayı hangi özelliğe göre kurduk?',body:'Üç çubuğu kısadan uzuna sıraladık. Kuralı adlandır.',
    items:NEL_ORDER_LENGTH_ITEMS,correct:'Uzunluklarına göre',
    options:['Uzunluklarına göre','Renklerine göre','Şekillerinin adına göre'],
    result:'Sıralama kuralı uzunluktu; renk sıralamayı belirlemedi.'
  },
  {
    id:'event-order',section:'OLAY SIRASI',kind:'order',attribute:'event',attributeLabel:'olay sırası',directionLabel:'önce-sonra sırasına',
    items:[NEL_ORDER_EVENT_ITEMS[1],NEL_ORDER_EVENT_ITEMS[2],NEL_ORDER_EVENT_ITEMS[0]],
    expected:NEL_ORDER_EVENT_ITEMS.map(x=>x.id).join('|'),
    title:'Olayları önce-sonra sırasına koy.',body:'Ellerini yıkarken ilk ne olur, sonra ne olur, en son ne olur?',
    result:'Bir olay dizisi de nesneler gibi anlamlı bir sıraya konabilir.'
  },
  {
    id:'real-world-order',section:'TAŞI',kind:'real-world',
    title:'Şimdi sıralamayı ekrandan çıkar.',body:'Yakınında üç nesne bul. Büyüklük, uzunluk veya yükseklikten birini seç; nesneleri bir uçtan öbür uca sırala ve hangi yönde sıraladığını söyle.',
    result:'Sıralama, üç veya daha fazla şeyi seçilen bir özelliğe ya da olayların önce-sonra ilişkisine göre düzenlemektir.'
  }
];

function nelOrderItemMarkup(item={},label=''){
  if(item.kind==='event') return '<span class="nel-order-event-card" role="img" aria-label="'+esc(label||item.label||'olay kartı')+'"><b>'+esc(item.label||'Olay')+'</b></span>';
  return nelMatchObjectMarkup(item,label||'sıralama nesnesi');
}
function nelOrderSectionTrack(step){
  return '<div class="nel-order-section-track">'+NEL_ORDER_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>';
}
function nelOrderReadRoot(root){
  if(!root) return null;
  const items=[...root.querySelectorAll('[data-nel-order-item][data-order-index]')].sort((a,b)=>Number(a.dataset.orderIndex)-Number(b.dataset.orderIndex));
  const total=root.querySelectorAll('[data-nel-order-item]').length;
  if(!total||items.length!==total) return null;
  return items.map(item=>item.dataset.nelOrderItem).join('|');
}
function nelOrderResetRoot(root){
  if(!root) return;
  const pool=root.querySelector('.nel-order-pool');
  const items=[...root.querySelectorAll('[data-nel-order-item]')].sort((a,b)=>Number(a.dataset.sourceIndex)-Number(b.dataset.sourceIndex));
  items.forEach(item=>{delete item.dataset.orderIndex;item.classList.remove('placed','selected');item.disabled=false;pool?.appendChild(item);});
  root.querySelectorAll('.nel-order-slot').forEach(slot=>slot.classList.remove('filled'));
  root.classList.remove('complete','wrong');
}
function bindNelOrderRoot(root,onChange,blocked=()=>false){
  if(!root) return;
  root.querySelectorAll('[data-nel-order-item]').forEach(item=>item.addEventListener('click',()=>{
    if(blocked()||item.dataset.orderIndex) return;
    const placed=root.querySelectorAll('[data-nel-order-item][data-order-index]').length;
    const slot=root.querySelector('.nel-order-slot[data-slot-index="'+(placed+1)+'"]');
    if(!slot) return;
    item.dataset.orderIndex=String(placed+1);item.classList.add('placed');slot.classList.add('filled');slot.appendChild(item);onChange?.();
  }));
  root.querySelector('.nel-order-reset')?.addEventListener('click',()=>{if(blocked())return;nelOrderResetRoot(root);onChange?.();});
}
function nelOrderBuilderVisual(v={}){
  const items=v.items||[];
  return '<div class="nel-order-builder" data-order-kind="'+esc(v.kind||'attribute')+'">'+
    (v.context?'<span class="nel-order-context">'+esc(v.context==='daily'?'GÜNLÜK OLAY SIRASI':'SIRALAMA')+'</span>':'')+
    '<div class="nel-order-direction">'+esc((v.directionLabel||'sıraya').toUpperCase())+'</div>'+
    '<div class="nel-order-pool">'+items.map((item,index)=>'<button type="button" class="nel-order-item" data-nel-order-item="'+esc(item.id||'')+'" data-source-index="'+index+'" aria-label="'+esc(item.label||'sıralanacak nesne')+'">'+nelOrderItemMarkup(item,item.label||'sıralanacak nesne')+'</button>').join('')+'</div>'+
    '<div class="nel-order-sequence">'+items.map((_,index)=>'<div class="nel-order-slot" data-slot-index="'+(index+1)+'"><span>'+(index+1)+'</span></div>').join('')+'</div>'+
    '<button type="button" class="nel-order-reset">Sırayı temizle</button>'+
  '</div>';
}
function nelOrderPreviewVisual(v={}){
  const items=v.items||[];
  return '<div class="nel-order-preview '+(v.kind==='event'?'event':'')+'">'+items.map((item,index)=>'<div><small>'+(index+1)+'</small>'+nelOrderItemMarkup(item,item.label||((index+1)+'. nesne'))+'</div>').join('')+'</div>';
}
function nelOrderRuleCardVisual(v={}){
  return '<div class="nel-order-rule-card"><small>SIRALAMA KURALI</small><strong>'+esc(v.directionLabel||'Sıraya koy')+'</strong><span>'+esc(v.attributeLabel||'özellik')+'</span></div>';
}
function nelOrderLessonCore(step){
  if(step.kind==='order') return '<div class="nel-order-lesson-core">'+nelOrderBuilderVisual({kind:step.attribute==='event'?'event':'attribute',attribute:step.attribute,attributeLabel:step.attributeLabel,directionLabel:step.directionLabel,items:step.items})+'<p class="nel-order-help" id="nelOrderHelp">Kartlara sırayla dokun.</p><div class="nel-order-result" id="nelOrderResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='choose') return '<div class="nel-order-lesson-core"><div class="nel-order-option-grid">'+step.options.map(opt=>'<button type="button" class="nel-order-option" data-correct="'+(opt.correct?'true':'false')+'">'+nelOrderPreviewVisual({kind:'attribute',items:opt.items})+'</button>').join('')+'</div><p class="nel-order-help" id="nelOrderHelp"></p><div class="nel-order-result" id="nelOrderResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='reason') return '<div class="nel-order-lesson-core">'+nelOrderPreviewVisual({kind:'attribute',items:step.items})+'<div class="nel-order-reason-grid">'+step.options.map(value=>'<button type="button" class="nel-order-reason" data-correct="'+(value===step.correct?'true':'false')+'">'+esc(value)+'</button>').join('')+'</div><p class="nel-order-help" id="nelOrderHelp"></p><div class="nel-order-result" id="nelOrderResult">'+esc(step.result)+'</div></div>';
  return '<div class="nel-order-lesson-core"><div class="nel-order-real-world"><span>1</span><p>Üç nesne seç.</p><span>2</span><p>Tek bir özellik seç.</p><span>3</span><p>Bir yönde sırala ve kuralını söyle.</p></div><button type="button" class="nel-order-done" id="nelOrderDone">Sıralamamı yaptım</button><div class="nel-order-result" id="nelOrderResult">'+esc(step.result)+'</div></div>';
}
function revealNelOrderResult(){ $('#nelOrderResult')?.classList.add('revealed'); }
function wireNelOrderLessonStep(step,next){
  if(step.kind==='order'){
    const root=$('.nel-order-builder');
    bindNelOrderRoot(root,()=>{
      const value=nelOrderReadRoot(root);
      if(!value){$('#nelOrderHelp').textContent='Kartlara seçtiğin sırayla dokun.';return;}
      if(value!==step.expected){
        root.classList.add('wrong');
        $('#nelOrderHelp').textContent=step.attribute==='event'?'İlk, sonra ve en son olanı yeniden düşün.':'Sıranın yönünü ve yalnız '+step.attributeLabel+' özelliğini yeniden kontrol et.';
        return;
      }
      root.classList.remove('wrong');root.classList.add('complete');
      root.querySelectorAll('[data-nel-order-item],.nel-order-reset').forEach(x=>x.disabled=true);
      $('#nelOrderHelp').textContent='';revealNelOrderResult();next.disabled=false;
    });
    return;
  }
  if(step.kind==='choose'){
    $$('.nel-order-option').forEach(button=>button.addEventListener('click',()=>{
      if(button.dataset.correct!=='true'){button.classList.add('wrong');setTimeout(()=>button.classList.remove('wrong'),300);$('#nelOrderHelp').textContent='Baştan sona büyüklük düzenli artıyor mu?';return;}
      button.classList.add('selected');$$('.nel-order-option').forEach(x=>x.disabled=true);$('#nelOrderHelp').textContent='';revealNelOrderResult();next.disabled=false;
    }));
    return;
  }
  if(step.kind==='reason'){
    $$('.nel-order-reason').forEach(button=>button.addEventListener('click',()=>{
      if(button.dataset.correct!=='true'){button.classList.add('wrong');setTimeout(()=>button.classList.remove('wrong'),300);$('#nelOrderHelp').textContent='Nesnelerin renklerini değil, sırada değişen ölçüyü düşün.';return;}
      button.classList.add('selected');$$('.nel-order-reason').forEach(x=>x.disabled=true);$('#nelOrderHelp').textContent='';revealNelOrderResult();next.disabled=false;
    }));
    return;
  }
  $('#nelOrderDone')?.addEventListener('click',()=>{$('#nelOrderDone').disabled=true;revealNelOrderResult();next.disabled=false;});
}
function completeNelOrderLessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id),lc=ss.learningCycle,next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);lc.lessonVersion=NEL_ORDER_LESSON_VERSION;
  if(next>=NEL_ORDER_LESSON_STEPS.length){lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now();saveState();session.planIndex++;loadPlanItem();return;}
  saveState();session.lessonStepIndex=next;renderNelOrderLessonStep(skill,next);
}
function renderNelOrderLessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(NEL_ORDER_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(NEL_ORDER_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=NEL_ORDER_LESSON_STEPS[at];
  session.lessonStepIndex=at;currentQuestion=null;renderPracticeHeader(skill);
  $('#practiceMode').textContent='KEŞFET';$('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+NEL_ORDER_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/NEL_ORDER_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="nel-order-lesson-stage" data-nel-order-step="'+esc(step.id)+'">'+nelOrderSectionTrack(step)+'<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · '+(at+1)+' / '+NEL_ORDER_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="nel-order-lesson-visual">'+nelOrderLessonCore(step)+'</div><div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="nelOrderLessonNext" disabled>'+(at===NEL_ORDER_LESSON_STEPS.length-1?'Sıralama oyunlarına geç':'Sonraki keşif')+' <b>→</b></button></div></div>';
  const next=$('#nelOrderLessonNext');wireNelOrderLessonStep(step,next);next?.addEventListener('click',()=>completeNelOrderLessonStep(skill,at));
}


const NEL_PATTERN_LESSON_VERSION=1;
const NEL_PATTERN_SECTIONS=['FARK ET','KOPYALA / UZAT','KUR','ANLAT','TAŞI'];
const NEL_PATTERN_PALETTE={
  A:{id:'lesson-pattern-blue-circle',shape:'circle',tone:'blue',size:'medium',length:'medium',height:'medium',name:'mavi daire'},
  B:{id:'lesson-pattern-yellow-triangle',shape:'triangle',tone:'yellow',size:'medium',length:'medium',height:'medium',name:'sarı üçgen'},
  C:{id:'lesson-pattern-green-square',shape:'square',tone:'green',size:'medium',length:'medium',height:'medium',name:'yeşil kare'}
};
const NEL_PATTERN_ALT_PALETTE={
  A:{id:'lesson-pattern-red-square',shape:'square',tone:'red',size:'medium',length:'medium',height:'medium',name:'kırmızı kare'},
  B:{id:'lesson-pattern-blue-circle-2',shape:'circle',tone:'blue',size:'medium',length:'medium',height:'medium',name:'mavi daire'},
  C:{id:'lesson-pattern-yellow-triangle-2',shape:'triangle',tone:'yellow',size:'medium',length:'medium',height:'medium',name:'sarı üçgen'}
};
function nelPatternLessonItems(code,repetitions,palette=NEL_PATTERN_PALETTE){
  return Array.from({length:repetitions},()=>code.split('')).flat().map(key=>({...palette[key],patternKey:key}));
}
function nelPatternLessonExpected(items){ return items.map(item=>item.id).join('|'); }
function nelPatternLessonExtend(code,palette=NEL_PATTERN_PALETTE){
  const full=nelPatternLessonItems(code,2,palette);
  return {items:full.slice(0,-1),answer:full.at(-1),palette:Object.values(palette)};
}
const NEL_PATTERN_AB=nelPatternLessonItems('AB',3);
const NEL_PATTERN_ABB=nelPatternLessonExtend('ABB',NEL_PATTERN_ALT_PALETTE);
const NEL_PATTERN_AAB=nelPatternLessonExtend('AAB');
const NEL_PATTERN_AABB=nelPatternLessonExtend('AABB',NEL_PATTERN_ALT_PALETTE);
const NEL_PATTERN_ABC=nelPatternLessonExtend('ABC');
const NEL_PATTERN_CREATE_SIMPLE=nelPatternLessonItems('ABB',2,NEL_PATTERN_ALT_PALETTE);
const NEL_PATTERN_CREATE_COMPLEX=nelPatternLessonItems('AABB',2);
const NEL_PATTERN_LESSON_STEPS=[
  {
    id:'recognise-ab',section:'FARK ET',kind:'describe',items:NEL_PATTERN_AB,
    title:'Tekrar eden küçük parçayı fark et.',body:'Baştan sona bak. Örüntünün yeniden başlayan en küçük parçasını sözcüklerle seç.',
    correct:'Mavi daire, sarı üçgen tekrar ediyor.',
    options:['Mavi daire, sarı üçgen tekrar ediyor.','Üç mavi daire sonra üç sarı üçgen geliyor.','Renkler ve şekiller rastgele değişiyor.'],
    result:'Tekrar birimi mavi daire ve sarı üçgen. Aynı küçük parça yeniden başlıyor.'
  },
  {
    id:'copy-ab',section:'KOPYALA / UZAT',kind:'copy',targetItems:NEL_PATTERN_AB,palette:Object.values(NEL_PATTERN_PALETTE),slots:NEL_PATTERN_AB.length,expected:nelPatternLessonExpected(NEL_PATTERN_AB),
    title:'Örüntüyü aynı sırayla kopyala.',body:'Paletten parçalara dokunarak üstteki örüntünün aynısını alttaki boş yerlere kur.',
    result:'Kopyada hem parçalar hem de tekrar sırası aynı kaldı.'
  },
  {
    id:'extend-abb',section:'KOPYALA / UZAT',kind:'extend',items:NEL_PATTERN_ABB.items,answer:NEL_PATTERN_ABB.answer,palette:NEL_PATTERN_ABB.palette,
    title:'ABB örüntüsünü devam ettir.',body:'Tekrar eden küçük parçayı bul; boşluğa gelecek parçayı seç.',
    result:'Bir kırmızı kare ve iki mavi daireden oluşan parça yeniden tekrar ediyor.'
  },
  {
    id:'extend-aab',section:'KOPYALA / UZAT',kind:'extend',items:NEL_PATTERN_AAB.items,answer:NEL_PATTERN_AAB.answer,palette:NEL_PATTERN_AAB.palette,
    title:'AAB örüntüsünü devam ettir.',body:'Bu kez aynı parçadan iki tane geliyor, sonra üçüncü parça değişiyor. Tekrarın nereye döndüğünü izle.',
    result:'İki mavi daire ve bir sarı üçgen birlikte tekrar birimini oluşturuyor.'
  },
  {
    id:'create-simple',section:'KUR',kind:'create',unitItems:NEL_PATTERN_CREATE_SIMPLE.slice(0,3),palette:Object.values(NEL_PATTERN_ALT_PALETTE),slots:NEL_PATTERN_CREATE_SIMPLE.length,expected:nelPatternLessonExpected(NEL_PATTERN_CREATE_SIMPLE),
    title:'Basit bir örüntüyü sen kur.',body:'Gösterilen tekrar birimini iki kez kur. Hazır diziyi seçmiyorsun; parçaları sırayla sen yerleştiriyorsun.',
    result:'Aynı tekrar birimini iki kez kullanarak örüntüyü kendin oluşturdun.'
  },
  {
    id:'extend-aabb',section:'KOPYALA / UZAT',kind:'extend',items:NEL_PATTERN_AABB.items,answer:NEL_PATTERN_AABB.answer,palette:NEL_PATTERN_AABB.palette,
    title:'Daha uzun tekrar birimini fark et.',body:'İki aynı parça, ardından iki başka parça geliyor. Tekrarın tamamını görmeden karar verme.',
    result:'AABB yapısında dört parçalık birim yeniden başlıyor.'
  },
  {
    id:'extend-abc',section:'KOPYALA / UZAT',kind:'extend',items:NEL_PATTERN_ABC.items,answer:NEL_PATTERN_ABC.answer,palette:NEL_PATTERN_ABC.palette,
    title:'Üç farklı parçalı örüntüyü uzat.',body:'Üç farklı parça aynı sırayla yeniden geliyor. Boşluğa gelecek olanı seç.',
    result:'ABC yapısında üç farklı parça aynı sırayla tekrar ediyor.'
  },
  {
    id:'create-complex',section:'KUR',kind:'create',unitItems:NEL_PATTERN_CREATE_COMPLEX.slice(0,4),palette:Object.values(NEL_PATTERN_PALETTE),slots:NEL_PATTERN_CREATE_COMPLEX.length,expected:nelPatternLessonExpected(NEL_PATTERN_CREATE_COMPLEX),
    title:'Daha karmaşık örüntüyü sen oluştur.',body:'Dört parçalık tekrar birimini iki kez kur. Her parçayı paletten kendin seç.',
    result:'Daha uzun bir tekrar birimini koruyarak karmaşık örüntü oluşturdun.'
  },
  {
    id:'describe-pattern',section:'ANLAT',kind:'describe',items:nelPatternLessonItems('ABC',2),
    title:'Örüntünün kuralını anlat.',body:'Sıradaki parçayı tahmin etmek yerine, hangi küçük parçanın tekrar ettiğini söyle.',
    correct:'Mavi daire, sarı üçgen, yeşil kare tekrar ediyor.',
    options:['Mavi daire, sarı üçgen, yeşil kare tekrar ediyor.','Mavi daire ve sarı üçgen birlikte kalıyor; kare rastgele geliyor.','Her turda yalnız renk değişiyor.'],
    result:'Kuralı söylemek, örüntünün tekrar eden birimini açıkça anlatmaktır.'
  },
  {
    id:'real-world-pattern',section:'TAŞI',kind:'real-world',
    title:'Örüntüyü ekrandan çıkar.',body:'Yakınında iki ya da üç farklı nesne bul veya alkış–dize dokun gibi hareketler seç. Bir tekrar birimi oluştur, en az iki kez tekrar et ve kuralını söyle.',
    result:'Aynı örüntü yapısı farklı nesne, ses ve hareketlerle yeniden kurulabilir.'
  }
];

function nelPatternSectionTrack(step){
  return '<div class="nel-pattern-section-track">'+NEL_PATTERN_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>';
}
function nelPatternTokenVisual(item={},label=''){
  return '<div class="nel-pattern-token">'+nelMatchObjectMarkup(item,label||item.name||'örüntü parçası')+'<small>'+esc(item.name||'parça')+'</small></div>';
}
function nelPatternStripVisual(v={}){
  const items=v.items||[];
  return '<div class="nel-pattern-strip '+(v.gap?'has-gap':'')+'">'+items.map((item,index)=>
    '<div class="nel-pattern-strip-item '+(v.markUnit&&index<v.markUnit?'unit':'')+'">'+nelPatternTokenVisual(item,item.name||'örüntü parçası')+'</div>'
  ).join('')+(v.gap?'<div class="nel-pattern-gap" aria-label="sıradaki parça">?</div>':'')+'</div>';
}
function nelPatternBuilderVisual(v={}){
  const palette=v.palette||[], slots=Math.max(1,Number(v.slots)||0);
  const reference=v.targetItems?.length?'<div class="nel-pattern-builder-reference"><small>KOPYALANACAK ÖRÜNTÜ</small>'+nelPatternStripVisual({items:v.targetItems})+'</div>':
    v.unitItems?.length?'<div class="nel-pattern-builder-reference"><small>TEKRAR BİRİMİ</small>'+nelPatternStripVisual({items:v.unitItems})+(v.rule?'<p>'+esc(v.rule)+'</p>':'')+'</div>':'';
  return '<div class="nel-pattern-builder">'+reference+
    '<div class="nel-pattern-palette" aria-label="örüntü parçaları">'+palette.map(item=>'<button type="button" class="nel-pattern-palette-item" data-nel-pattern-value="'+esc(item.id||'')+'">'+nelPatternTokenVisual(item,item.name||'örüntü parçası')+'</button>').join('')+'</div>'+
    '<div class="nel-pattern-slots">'+Array.from({length:slots},(_,index)=>'<div class="nel-pattern-slot" data-pattern-slot="'+index+'"><span>'+(index+1)+'</span><div class="nel-pattern-slot-content"></div></div>').join('')+'</div>'+
    '<button type="button" class="nel-pattern-reset">Temizle</button>'+
  '</div>';
}
function nelPatternActionsVisual(v={}){
  return '<div class="nel-pattern-actions">'+(v.items||[]).map((item,index)=>'<span><b>'+(index+1)+'</b>'+esc(item)+'</span>').join('')+'<span class="gap"><b>?</b>Sıradaki</span></div>';
}
function nelPatternReadRoot(root){
  if(!root)return null;
  const slots=[...root.querySelectorAll('[data-pattern-slot]')];
  if(!slots.length||slots.some(slot=>!slot.dataset.patternValue)) return null;
  return slots.map(slot=>slot.dataset.patternValue).join('|');
}
function nelPatternResetRoot(root){
  if(!root)return;
  root.querySelectorAll('[data-pattern-slot]').forEach(slot=>{delete slot.dataset.patternValue;slot.classList.remove('filled');const content=slot.querySelector('.nel-pattern-slot-content');if(content)content.innerHTML='';});
  root.classList.remove('complete','wrong');
}
function bindNelPatternRoot(root,onChange,blocked=()=>false){
  if(!root)return;
  root.querySelectorAll('[data-nel-pattern-value]').forEach(button=>button.addEventListener('click',()=>{
    if(blocked())return;
    const slot=[...root.querySelectorAll('[data-pattern-slot]')].find(x=>!x.dataset.patternValue);
    if(!slot)return;
    slot.dataset.patternValue=button.dataset.nelPatternValue;
    slot.classList.add('filled');
    const content=slot.querySelector('.nel-pattern-slot-content');
    const token=button.querySelector('.nel-pattern-token');
    if(content&&token) content.innerHTML=token.outerHTML;
    onChange?.();
  }));
  root.querySelector('.nel-pattern-reset')?.addEventListener('click',()=>{if(blocked())return;nelPatternResetRoot(root);onChange?.();});
}
function nelPatternLessonCore(step){
  if(step.kind==='copy'||step.kind==='create'){
    return '<div class="nel-pattern-lesson-core">'+nelPatternBuilderVisual({targetItems:step.targetItems,unitItems:step.unitItems,palette:step.palette,slots:step.slots})+'<p class="nel-pattern-help" id="nelPatternHelp">'+(step.kind==='copy'?'Üstteki sırayı aynen kur.':'Tekrar birimini iki kez kur.')+'</p><div class="nel-pattern-result" id="nelPatternResult">'+esc(step.result)+'</div></div>';
  }
  if(step.kind==='extend'){
    return '<div class="nel-pattern-lesson-core">'+nelPatternStripVisual({items:step.items,gap:true})+'<div class="nel-pattern-choice-row">'+step.palette.map(item=>'<button type="button" class="nel-pattern-choice" data-correct="'+(item.id===step.answer.id?'true':'false')+'">'+nelPatternTokenVisual(item,item.name)+'</button>').join('')+'</div><p class="nel-pattern-help" id="nelPatternHelp"></p><div class="nel-pattern-result" id="nelPatternResult">'+esc(step.result)+'</div></div>';
  }
  if(step.kind==='describe'){
    return '<div class="nel-pattern-lesson-core">'+nelPatternStripVisual({items:step.items})+'<div class="nel-pattern-reason-grid">'+step.options.map(value=>'<button type="button" class="nel-pattern-reason" data-correct="'+(value===step.correct?'true':'false')+'">'+esc(value)+'</button>').join('')+'</div><p class="nel-pattern-help" id="nelPatternHelp"></p><div class="nel-pattern-result" id="nelPatternResult">'+esc(step.result)+'</div></div>';
  }
  return '<div class="nel-pattern-lesson-core"><div class="nel-pattern-real-world"><span>1</span><p>İki ya da üç farklı nesne veya hareket seç.</p><span>2</span><p>Küçük bir tekrar birimi oluştur.</p><span>3</span><p>Birimi en az iki kez tekrar et ve kuralını söyle.</p></div><button type="button" class="nel-pattern-done" id="nelPatternDone">Örüntümü kurdum</button><div class="nel-pattern-result" id="nelPatternResult">'+esc(step.result)+'</div></div>';
}
function revealNelPatternResult(){ $('#nelPatternResult')?.classList.add('revealed'); }
function wireNelPatternLessonStep(step,next){
  if(step.kind==='copy'||step.kind==='create'){
    const root=$('.nel-pattern-builder');
    bindNelPatternRoot(root,()=>{
      const value=nelPatternReadRoot(root);
      if(!value){$('#nelPatternHelp').textContent='Boş yerleri sırayla doldur.';return;}
      if(value!==step.expected){root.classList.add('wrong');$('#nelPatternHelp').textContent='Tekrar eden küçük parçayı ve sırasını yeniden kontrol et. Temizleyip tekrar kurabilirsin.';return;}
      root.classList.remove('wrong');root.classList.add('complete');root.querySelectorAll('button').forEach(x=>x.disabled=true);$('#nelPatternHelp').textContent='';revealNelPatternResult();next.disabled=false;
    });
    return;
  }
  if(step.kind==='extend'){
    $$('.nel-pattern-choice').forEach(button=>button.addEventListener('click',()=>{
      if(button.dataset.correct!=='true'){button.classList.add('wrong');setTimeout(()=>button.classList.remove('wrong'),300);$('#nelPatternHelp').textContent='Tek tek son parçaya değil, baştan tekrar eden küçük birime bak.';return;}
      button.classList.add('selected');$$('.nel-pattern-choice').forEach(x=>x.disabled=true);$('#nelPatternHelp').textContent='';revealNelPatternResult();next.disabled=false;
    }));
    return;
  }
  if(step.kind==='describe'){
    $$('.nel-pattern-reason').forEach(button=>button.addEventListener('click',()=>{
      if(button.dataset.correct!=='true'){button.classList.add('wrong');setTimeout(()=>button.classList.remove('wrong'),300);$('#nelPatternHelp').textContent='Örüntünün nerede yeniden başladığını bul; o küçük parçayı sırayla anlat.';return;}
      button.classList.add('selected');$$('.nel-pattern-reason').forEach(x=>x.disabled=true);$('#nelPatternHelp').textContent='';revealNelPatternResult();next.disabled=false;
    }));
    return;
  }
  $('#nelPatternDone')?.addEventListener('click',()=>{$('#nelPatternDone').disabled=true;revealNelPatternResult();next.disabled=false;});
}
function completeNelPatternLessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id),lc=ss.learningCycle,next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);lc.lessonVersion=NEL_PATTERN_LESSON_VERSION;
  if(next>=NEL_PATTERN_LESSON_STEPS.length){lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now();saveState();session.planIndex++;loadPlanItem();return;}
  saveState();session.lessonStepIndex=next;renderNelPatternLessonStep(skill,next);
}
function renderNelPatternLessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(NEL_PATTERN_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(NEL_PATTERN_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=NEL_PATTERN_LESSON_STEPS[at];
  session.lessonStepIndex=at;currentQuestion=null;renderPracticeHeader(skill);
  $('#practiceMode').textContent='KEŞFET';$('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+NEL_PATTERN_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/NEL_PATTERN_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="nel-pattern-lesson-stage" data-nel-pattern-step="'+esc(step.id)+'">'+nelPatternSectionTrack(step)+'<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · '+(at+1)+' / '+NEL_PATTERN_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="nel-pattern-lesson-visual">'+nelPatternLessonCore(step)+'</div><div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="nelPatternLessonNext" disabled>'+(at===NEL_PATTERN_LESSON_STEPS.length-1?'Örüntü oyunlarına geç':'Sonraki keşif')+' <b>→</b></button></div></div>';
  const next=$('#nelPatternLessonNext');wireNelPatternLessonStep(step,next);next?.addEventListener('click',()=>completeNelPatternLessonStep(skill,at));
}


const NEL_ROTE_LESSON_VERSION=1;
const NEL_ROTE_SECTIONS=['DİNLE','SIRALA','DEVAM ET','ANLAT / GERİ SAY','TAŞI'];
const nelRoteItem=n=>({n:Number(n),id:'rote-'+Number(n),name:['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on','on bir','on iki','on üç','on dört','on beş','on altı','on yedi','on sekiz','on dokuz','yirmi'][Number(n)]||String(n)});
const nelRoteRange=(start,end,step=start<=end?1:-1)=>{const out=[];if(step>0){for(let n=start;n<=end;n+=step)out.push(nelRoteItem(n));}else{for(let n=start;n>=end;n+=step)out.push(nelRoteItem(n));}return out;};
const nelRoteLessonExpected=items=>(items||[]).map(x=>x.id).join('|');
const nelRoteOptions=answer=>[answer,answer-1,answer+1,answer+2].filter((n,i,a)=>n>=1&&n<=20&&a.indexOf(n)===i).concat([1,5,10,15,20]).filter((n,i,a)=>a.indexOf(n)===i).slice(0,4).map(nelRoteItem);
const NEL_ROTE_PHRASES=[
  {id:'stable',speech:'Sayı adlarını her seferinde aynı sırayla söylüyoruz.'},
  {id:'random',speech:'Sayı adlarının yerlerini istediğimiz gibi değiştirebiliriz.'},
  {id:'objects',speech:'Ezbere saymak için mutlaka nesnelere dokunmamız gerekir.'},
  {id:'shape',speech:'Sayı adlarının sırası nesnelerin şekline göre değişir.'}
];
const NEL_ROTE_LESSON_STEPS=[
  {id:'chant-1-5',section:'DİNLE',kind:'chant',items:nelRoteRange(1,5),title:'Sayı adlarının ilk sırasını birlikte söyle.',body:'Dinle; sonra aynı sayı adlarını aynı sırayla sen de söyle.',result:'Bir, iki, üç, dört, beş: sayı adları sabit bir konuşma sırası izliyor.'},
  {id:'build-2-5',section:'SIRALA',kind:'sequence',items:[nelRoteItem(4),nelRoteItem(2),nelRoteItem(5),nelRoteItem(3)],expected:nelRoteLessonExpected(nelRoteRange(2,5)),title:'Duyduğun sayı adlarını sıraya koy.',body:'Her kartı dinle. İki ile başlayan konuşma sırasını kendin kur.',result:'İki, üç, dört, beş sırası değişmeden devam eder.'},
  {id:'chant-6-10',section:'DİNLE',kind:'chant',items:nelRoteRange(6,10),title:'Şimdi on’a doğru devam et.',body:'Altıdan ona kadar dinle ve aynı sırayla söyle.',result:'Altı, yedi, sekiz, dokuz, on aynı sayı adı zincirinin devamıdır.'},
  {id:'continue-7-10',section:'DEVAM ET',kind:'choice',promptItems:nelRoteRange(7,9),options:nelRoteOptions(10),answer:'rote-10',title:'Sıradaki sayı adını bul.',body:'Yedi, sekiz, dokuz sırasını dinle. Sonra gelen sayı adını seç.',result:'Dokuzdan sonra on gelir.'},
  {id:'chant-11-20',section:'DİNLE',kind:'chant',items:nelRoteRange(11,20),title:'Sayı adlarını yirmiye kadar götür.',body:'On birden yirmiye kadar sırayı dinle. İstersen ritim tutarak birlikte söyle.',result:'Sayı adı zinciri on birden yirmiye kadar aynı düzenle sürer.'},
  {id:'continue-to-20',section:'DEVAM ET',kind:'choice',promptItems:nelRoteRange(17,19),options:nelRoteOptions(20),answer:'rote-20',title:'Yirmiye ulaşan sırayı tamamla.',body:'On yedi, on sekiz, on dokuz sırasından sonra gelen sayı adını dinleyerek seç.',result:'On dokuzdan sonra yirmi gelir.'},
  {id:'start-middle',section:'DEVAM ET',kind:'choice',promptItems:[nelRoteItem(12)],options:nelRoteOptions(13),answer:'rote-13',title:'Birden başlamadan devam et.',body:'Başlangıç sayı adı on iki. Sırada hangi sayı adı gelir?',result:'Sıra birden başlamasa da on ikiden sonra on üç gelir.'},
  {id:'stable-order',section:'ANLAT / GERİ SAY',kind:'phrase',options:NEL_ROTE_PHRASES,answer:'stable',title:'Ezbere saymanın kuralını söyle.',body:'Açıklamaları dinle. Sayı adlarının sırasını doğru anlatanı seç.',result:'Ezbere saymada sayı adlarının sırası sabittir; nesne saymak ayrı bir beceridir.'},
  {id:'count-back',section:'ANLAT / GERİ SAY',kind:'sequence',items:[nelRoteItem(8),nelRoteItem(10),nelRoteItem(7),nelRoteItem(9)],expected:nelRoteLessonExpected(nelRoteRange(10,7,-1)),title:'Sayı adlarını geriye doğru da sırala.',body:'Kartları dinle ve ondan yediye doğru geriye sayma sırasını kur.',result:'Geriye sayarken de sayı adları düzenli bir sıra izler: on, dokuz, sekiz, yedi.'},
  {id:'real-world-rote',section:'TAŞI',kind:'real-world',title:'Sayma sırasını hareket oyununa taşı.',body:'Her alkışta veya adımda bir sonraki sayı adını söyle. Birden yirmiye kadar git; sonra kısa bir bölümü geriye doğru dene.',result:'Tekerleme ve hareket, sayı adlarının sabit sırasını günlük oyuna taşır.'}
];
function nelRoteSectionTrack(step){ return '<div class="nel-rote-section-track">'+NEL_ROTE_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>'; }
function nelRoteSpeakText(items){ return (items||[]).map(x=>x.name||x.speech||'').filter(Boolean).join(', '); }
function nelRoteAudioCard(item={},actions=true){
  return '<div class="nel-rote-audio-card" data-rote-card="'+esc(item.id||'')+'">'+
    '<button type="button" class="nel-rote-listen" data-rote-speech="'+esc(item.name||item.speech||'')+'" aria-label="Sayı adını dinle"><span>🔊</span><b>Dinle</b></button>'+
    '<small>'+esc(item.name||item.speech||'')+'</small>'+
    (actions?'<button type="button" class="nel-rote-place" data-rote-place="'+esc(item.id||'')+'">Sıraya ekle</button>':'')+
  '</div>';
}
function nelRoteChantVisual(items,label='SAYI ADI ZİNCİRİ'){
  return '<div class="nel-rote-chant"><span>'+esc(label)+'</span><button type="button" class="nel-rote-play-chain" data-rote-speech="'+esc(nelRoteSpeakText(items))+'">🔊 Sırayı dinle</button><div class="nel-rote-chain-words">'+items.map(x=>'<small>'+esc(x.name)+'</small>').join('<i>→</i>')+'</div></div>';
}
function nelRoteSequenceBuilderVisual(v={}){
  const items=v.items||[];
  return '<div class="nel-rote-sequence-builder" data-direction="'+esc(v.direction||'forward')+'">'+
    '<div class="nel-rote-pool">'+items.map((item,index)=>'<div class="nel-rote-pool-card" data-rote-item="'+esc(item.id)+'" data-original-index="'+index+'">'+nelRoteAudioCard(item,true)+'</div>').join('')+'</div>'+
    '<div class="nel-rote-slots">'+items.map((_,index)=>'<div class="nel-rote-slot" data-rote-slot="'+index+'"><span>'+(index+1)+'</span></div>').join('')+'</div>'+
    '<button type="button" class="nel-rote-reset">Baştan kur</button>'+
  '</div>';
}
function nelRoteAudioChoiceVisual(v={}){
  const prompt=v.promptItems?.length?nelRoteChantVisual(v.promptItems,v.promptLabel||'ÖNCE DİNLE'):'';
  return '<div class="nel-rote-audio-choice">'+prompt+'<div class="nel-rote-option-grid">'+(v.options||[]).map(item=>
    '<div class="nel-rote-option" data-rote-option="'+esc(item.id||'')+'">'+nelRoteAudioCard(item,false)+'<button type="button" class="nel-rote-select" data-rote-choice="'+esc(item.id||'')+'">Bunu seç</button></div>'
  ).join('')+'</div></div>';
}
function nelRotePhraseChoiceVisual(v={}){
  return '<div class="nel-rote-phrase-choice"><div class="nel-rote-phrase-grid">'+(v.options||[]).map(item=>
    '<div class="nel-rote-phrase" data-rote-option="'+esc(item.id)+'"><button type="button" class="nel-rote-listen" data-rote-speech="'+esc(item.speech)+'">🔊 Açıklamayı dinle</button><p>'+esc(item.speech)+'</p><button type="button" class="nel-rote-select" data-rote-choice="'+esc(item.id)+'">Bu açıklama</button></div>'
  ).join('')+'</div></div>';
}
function nelRoteReadSequenceRoot(root){
  if(!root)return null;
  const cards=[...root.querySelectorAll('[data-rote-item][data-order-index]')].sort((a,b)=>Number(a.dataset.orderIndex)-Number(b.dataset.orderIndex));
  const total=root.querySelectorAll('[data-rote-item]').length;
  return cards.length===total&&total?cards.map(x=>x.dataset.roteItem).join('|'):null;
}
function nelRoteResetSequenceRoot(root){
  if(!root)return;
  const pool=root.querySelector('.nel-rote-pool');
  [...root.querySelectorAll('[data-rote-item]')].sort((a,b)=>Number(a.dataset.originalIndex)-Number(b.dataset.originalIndex)).forEach(card=>{
    delete card.dataset.orderIndex;card.classList.remove('placed');card.querySelector('.nel-rote-place')?.removeAttribute('disabled');pool?.appendChild(card);
  });
  root.querySelectorAll('.nel-rote-slot').forEach(slot=>{slot.classList.remove('filled');slot.querySelector('[data-rote-item]')?.remove();});
  root.classList.remove('wrong','complete');
}
function bindNelRoteSpeech(root=document){
  root?.querySelectorAll('[data-rote-speech]').forEach(button=>button.addEventListener('click',event=>{
    event.preventDefault();event.stopPropagation();speak(button.dataset.roteSpeech||'');
  }));
}
function bindNelRoteSequenceRoot(root,onChange,blocked=()=>false){
  if(!root)return;
  bindNelRoteSpeech(root);
  root.querySelectorAll('[data-rote-place]').forEach(button=>button.addEventListener('click',()=>{
    if(blocked())return;
    const card=button.closest('[data-rote-item]');if(!card||card.dataset.orderIndex!=null)return;
    const slot=[...root.querySelectorAll('.nel-rote-slot')].find(x=>!x.classList.contains('filled'));if(!slot)return;
    const index=Number(slot.dataset.roteSlot);card.dataset.orderIndex=String(index);card.classList.add('placed');button.disabled=true;slot.classList.add('filled');slot.appendChild(card);onChange?.();
  }));
  root.querySelector('.nel-rote-reset')?.addEventListener('click',()=>{if(blocked())return;nelRoteResetSequenceRoot(root);onChange?.();});
}
function bindNelRoteChoiceRoot(root,onChange,blocked=()=>false){
  if(!root)return;bindNelRoteSpeech(root);
  root.querySelectorAll('[data-rote-choice]').forEach(button=>button.addEventListener('click',()=>{
    if(blocked())return;root.querySelectorAll('[data-rote-option]').forEach(x=>x.classList.remove('selected'));button.closest('[data-rote-option]')?.classList.add('selected');root.dataset.roteSelected=button.dataset.roteChoice;onChange?.();
  }));
}
function nelRoteLessonCore(step){
  if(step.kind==='chant') return '<div class="nel-rote-lesson-core">'+nelRoteChantVisual(step.items)+'<button type="button" class="nel-rote-done" id="nelRoteDone">Ben de sırayla söyledim</button><div class="nel-rote-result" id="nelRoteResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='sequence') return '<div class="nel-rote-lesson-core">'+nelRoteSequenceBuilderVisual({items:step.items,direction:step.id==='count-back'?'backward':'forward'})+'<p class="nel-rote-help" id="nelRoteHelp">Önce kartları dinle, sonra sıraya ekle.</p><div class="nel-rote-result" id="nelRoteResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='choice') return '<div class="nel-rote-lesson-core">'+nelRoteAudioChoiceVisual({promptItems:step.promptItems,options:step.options,promptLabel:'ÖNCE SIRAYI DİNLE'})+'<p class="nel-rote-help" id="nelRoteHelp"></p><div class="nel-rote-result" id="nelRoteResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='phrase') return '<div class="nel-rote-lesson-core">'+nelRotePhraseChoiceVisual({options:step.options})+'<p class="nel-rote-help" id="nelRoteHelp"></p><div class="nel-rote-result" id="nelRoteResult">'+esc(step.result)+'</div></div>';
  return '<div class="nel-rote-lesson-core"><div class="nel-rote-real-world"><span>1</span><p>Bir hareket seç: alkış, adım veya dizine dokun.</p><span>2</span><p>Her harekette sıradaki sayı adını söyle ve yirmiye kadar ilerle.</p><span>3</span><p>Sonra kısa bir bölümü geriye doğru söyle.</p></div><button type="button" class="nel-rote-done" id="nelRoteDone">Hareket oyununu yaptım</button><div class="nel-rote-result" id="nelRoteResult">'+esc(step.result)+'</div></div>';
}
function revealNelRoteResult(){ $('#nelRoteResult')?.classList.add('revealed'); }
function wireNelRoteLessonStep(step,next){
  const good=()=>{revealNelRoteResult();next.disabled=false;};
  if(step.kind==='chant'||step.kind==='real-world'){bindNelRoteSpeech($('.nel-rote-lesson-core'));$('#nelRoteDone')?.addEventListener('click',()=>{$('#nelRoteDone').disabled=true;good();});return;}
  if(step.kind==='sequence'){
    const root=$('.nel-rote-sequence-builder');
    bindNelRoteSequenceRoot(root,()=>{
      const value=nelRoteReadSequenceRoot(root);if(!value)return;
      if(value!==step.expected){root.classList.add('wrong');$('#nelRoteHelp').textContent='Sayı adlarını yeniden dinle. Sıra değişmez; “Baştan kur” ile tekrar dene.';return;}
      root.classList.remove('wrong');root.classList.add('complete');root.querySelectorAll('button').forEach(x=>x.disabled=true);$('#nelRoteHelp').textContent='';good();
    });
    return;
  }
  const root=step.kind==='phrase'?$('.nel-rote-phrase-choice'):$('.nel-rote-audio-choice');
  bindNelRoteChoiceRoot(root,()=>{
    if(root.dataset.roteSelected!==step.answer){$('#nelRoteHelp').textContent=step.kind==='phrase'?'Ezbere saymada nesne miktarını değil sayı adlarının sabit sırasını düşün.':'Sırayı bir kez daha dinle ve son sayı adından sonra geleni düşün.';return;}
    root.querySelectorAll('button').forEach(x=>x.disabled=true);$('#nelRoteHelp').textContent='';good();
  });
}
function completeNelRoteLessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id),lc=ss.learningCycle,next=index+1;
  lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);lc.lessonVersion=NEL_ROTE_LESSON_VERSION;
  if(next>=NEL_ROTE_LESSON_STEPS.length){lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now();saveState();session.planIndex++;loadPlanItem();return;}
  saveState();session.lessonStepIndex=next;renderNelRoteLessonStep(skill,next);
}
function renderNelRoteLessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id);
  const saved=Math.min(NEL_ROTE_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(NEL_ROTE_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=NEL_ROTE_LESSON_STEPS[at];session.lessonStepIndex=at;currentQuestion=null;renderPracticeHeader(skill);
  $('#practiceMode').textContent='KEŞFET';$('#practiceMode').dataset.mode='teach';
  $('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+NEL_ROTE_LESSON_STEPS.length;
  $('#practiceProgress').style.width=Math.round((at+1)/NEL_ROTE_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="nel-rote-lesson-stage" data-nel-rote-step="'+esc(step.id)+'">'+nelRoteSectionTrack(step)+'<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · '+(at+1)+' / '+NEL_ROTE_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="nel-rote-lesson-visual">'+nelRoteLessonCore(step)+'</div><div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="nelRoteLessonNext" disabled>'+(at===NEL_ROTE_LESSON_STEPS.length-1?'Sayma oyunlarına geç':'Sonraki keşif')+' <b>→</b></button></div></div>';
  const next=$('#nelRoteLessonNext');wireNelRoteLessonStep(step,next);next?.addEventListener('click',()=>completeNelRoteLessonStep(skill,at));
}


const NEL_RELIABLE_LESSON_VERSION=1;
const NEL_RELIABLE_SECTIONS=['BİR KEZ SAY','SIRAYI KORU','TOPLAMI BUL','FARKLI YÖNDEN SAY','TAŞI'];
const nelReliableLessonNames=['','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on'];
function nelReliableLessonItem(n,index,prefix='lesson-counter',kind='counter'){
  return {id:prefix+'-'+n+'-'+index,index,kind,symbol:{counter:'●',apple:'🍎',block:'■',star:'★',biscuit:'●'}[kind]||'●',tone:['blue','green','yellow','red'][(index-1)%4]};
}
function nelReliableLessonSet(n,prefix='lesson-counter',kind='counter'){ return Array.from({length:n},(_,i)=>nelReliableLessonItem(n,i+1,prefix,kind)); }
function nelReliableLessonAudioOptions(answer){
  return [answer,answer-1,answer+1,answer+2,1,5,10].filter((n,i,a)=>n>=1&&n<=10&&a.indexOf(n)===i).slice(0,4).map(n=>({id:'rote-'+n,n,name:nelReliableLessonNames[n]}));
}
const NEL_RELIABLE_ORDER_PHRASES=[
  {id:'same',speech:'Nereden başlarsak başlayalım, her nesneyi bir kez sayarsak toplam aynı kalır.'},
  {id:'more',speech:'Sağdan başlayınca nesne sayısı artar.'},
  {id:'less',speech:'Soldan başlayınca nesne sayısı azalır.'},
  {id:'random',speech:'Saymaya başladığımız yer toplamı değiştirir.'}
];
const NEL_RELIABLE_LESSON_STEPS=[
  {id:'one-word-one-object',section:'BİR KEZ SAY',kind:'count',items:nelReliableLessonSet(4,'lesson-one','counter'),title:'Her nesneye bir sayı adı ver.',body:'Bir nesneye dokunduğunda o nesne sayılmış olur. Aynı nesneyi ikinci kez saymadan bütün nesneleri tamamla.',result:'Her nesne tam bir kez sayıldı: bir nesne ↔ bir sayı adı.'},
  {id:'move-count-five',section:'BİR KEZ SAY',kind:'count',items:nelReliableLessonSet(5,'lesson-move','block'),title:'Saydığını ayırarak takip et.',body:'Her bloğa bir kez dokun. Sayılan bloklar ayrı görünür; böylece atlanan veya iki kez sayılan nesne kalmaz.',result:'Sayılmış ve sayılmamış nesneleri ayırmak bire bir eşlemeyi görünür kılar.'},
  {id:'stable-order-next',section:'SIRAYI KORU',kind:'next-word',items:nelReliableLessonSet(5,'lesson-stable','star'),counted:3,answer:'rote-4',options:nelReliableLessonAudioOptions(4),title:'Sıradaki nesne hangi sayı adını alır?',body:'İlk üç nesne bir, iki, üç diye sayıldı. Dördüncü nesneye verilecek sayı adını dinleyerek seç.',result:'Sayı adları sayarken de sabit sırada ilerler: üçten sonra dört gelir.'},
  {id:'fixed-count-six',section:'BİR KEZ SAY',kind:'count',items:nelReliableLessonSet(6,'lesson-fixed','apple'),title:'Yerinden oynamayan nesneleri de güvenilir say.',body:'Elmalara birer kez dokun. İşaretlenen nesneye yeniden dokunmadan bütün kümeyi tamamla.',result:'Nesneler yer değiştirmese de her birini bir kez işaretleyerek güvenilir sayabiliriz.'},
  {id:'count-to-ten',section:'BİR KEZ SAY',kind:'count',items:nelReliableLessonSet(10,'lesson-ten','counter'),title:'Güvenilir saymayı ona kadar götür.',body:'On nesnenin her birine yalnız bir kez dokun ve sayı adı zincirini sürdür.',result:'On nesnenin tamamı, her biri bir kez sayılarak izlendi.'},
  {id:'cardinality-seven',section:'TOPLAMI BUL',kind:'cardinality',items:nelReliableLessonSet(7,'lesson-cardinality','star'),answer:'7|rote-7',options:nelReliableLessonAudioOptions(7),title:'Son sayı adı toplamı söyler.',body:'Önce bütün yıldızları birer kez say. Sonra en son söylediğin sayı adını toplam olarak seç.',result:'Son söylediğin sayı adı, kümede kaç nesne olduğunu gösterir.'},
  {id:'order-left-right',section:'FARKLI YÖNDEN SAY',kind:'order-proof',items:nelReliableLessonSet(6,'lesson-order-a','block'),answer:'6|6|same',options:NEL_RELIABLE_ORDER_PHRASES,title:'Aynı kümeyi iki yönden say.',body:'İlk turda soldan sağa, ikinci turda sağdan sola say. Sonra iki sonucun ilişkisini açıkla.',result:'Başlangıç ve yön değişti; aynı altı nesne sayıldığı için toplam değişmedi.'},
  {id:'order-eight',section:'FARKLI YÖNDEN SAY',kind:'order-proof',items:nelReliableLessonSet(8,'lesson-order-b','counter'),answer:'8|8|same',options:NEL_RELIABLE_ORDER_PHRASES,title:'Daha büyük bir kümeyle yeniden dene.',body:'Sekiz nesneyi iki farklı yönden say ve toplamın aynı kaldığını göster.',result:'Nesnelerin sayılma sırası toplam miktarı değiştirmez.'},
  {id:'four-principles',section:'TOPLAMI BUL',kind:'principles',title:'Güvenilir saymanın dört fikrini bir araya getir.',body:'Her nesne bir kez sayılır; sayı adları sabit sıradadır; son sayı adı toplamı söyler; sayma yönü toplamı değiştirmez.',result:'Bu dört fikir birlikte güvenilir saymayı oluşturur.'},
  {id:'real-world-reliable',section:'TAŞI',kind:'real-world',title:'Güvenilir saymayı günlük hayata taşı.',body:'Yakınında 6–10 küçük nesne bul. Bir nesneyi sayınca başka bir yere taşı veya işaretle; her birini bir kez say ve son sayı adını toplam olarak söyle.',result:'Gerçek nesneleri ayırarak saymak, hangi nesnenin sayıldığını takip etmeyi kolaylaştırır.'}
];
function nelReliableSectionTrack(step){ return '<div class="nel-reliable-section-track">'+NEL_RELIABLE_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>'; }
function nelReliableObjectMarkup(item={},label='sayılacak nesne'){
  return '<span class="nel-reliable-object-visual '+esc(item.kind||'counter')+' '+esc(item.tone||'blue')+'" role="img" aria-label="'+esc(label)+'">'+esc(item.symbol||'●')+'</span>';
}
function nelReliableCountSetVisual(v={}){
  const context={'counter-tray':'SAYMA TEPSİSİ','move-to-mat':'SAYMA ALANI','snack-plate':'ATIŞTIRMALIK TABAĞI','daily-give':'GÜNLÜK SAYMA'}[v.context]||'NESNELERİ SAY';
  return '<div class="nel-reliable-count-set" data-context="'+esc(v.context||'')+'"><span class="nel-reliable-context">'+esc(context)+'</span>'+
    '<div class="nel-reliable-object-grid">'+(v.items||[]).map(item=>'<button type="button" class="nel-reliable-object" data-reliable-item="'+esc(item.id)+'">'+nelReliableObjectMarkup(item)+'</button>').join('')+'</div>'+
    '<div class="nel-reliable-count-rail"><small>SÖYLENEN SAYI ADLARI</small><div data-reliable-rail></div></div>'+
    '<button type="button" class="nel-reliable-reset">Baştan say</button></div>';
}
function nelReliableNextWordVisual(v={}){
  const counted=Math.max(0,Number(v.counted)||0),items=v.items||[];
  return '<div class="nel-reliable-next-word" data-counted="'+counted+'">'+
    '<div class="nel-reliable-preview-grid">'+items.map((item,index)=>'<div class="'+(index<counted?'counted':index===counted?'next':'')+'">'+nelReliableObjectMarkup(item,index<counted?'sayılmış nesne':index===counted?'sıradaki nesne':'henüz sayılmamış nesne')+'</div>').join('')+'</div>'+
    '<div class="nel-reliable-spoken-preview">'+Array.from({length:counted},(_,i)=>'<span>'+esc(nelReliableLessonNames[i+1])+'</span>').join('<i>→</i>')+'<i>→</i><b>?</b></div>'+
    '<div class="nel-reliable-audio-options">'+(v.options||[]).map(item=>'<div data-reliable-option="'+esc(item.id)+'">'+nelRoteAudioCard(item,false)+'<button type="button" class="nel-reliable-select" data-reliable-next-choice="'+esc(item.id)+'">Bunu seç</button></div>').join('')+'</div></div>';
}
function nelReliableCardinalityVisual(v={}){
  return '<div class="nel-reliable-cardinality" data-total="'+(v.items||[]).length+'">'+
    nelReliableCountSetVisual({items:v.items,context:'counter-tray'})+
    '<div class="nel-reliable-cardinality-question"><strong>Toplam kaç nesne?</strong><small>Son söylediğin sayı adını seç.</small><div class="nel-reliable-audio-options">'+(v.options||[]).map(item=>'<div data-reliable-card-option="'+esc(item.id)+'">'+nelRoteAudioCard(item,false)+'<button type="button" class="nel-reliable-select" data-reliable-card-choice="'+esc(item.id)+'" disabled>Bu toplam</button></div>').join('')+'</div></div>'+
  '</div>';
}
function nelReliableOrderProofVisual(v={}){
  const items=v.items||[],reverse=[...items].reverse();
  const pane=(side,list,label)=>'<section class="nel-reliable-order-pane" data-reliable-pass="'+side+'"><strong>'+esc(label)+'</strong><div class="nel-reliable-order-items">'+list.map((item,index)=>'<button type="button" class="nel-reliable-order-object" data-reliable-order-item="'+esc(item.id)+'" data-seq="'+index+'" disabled>'+nelReliableObjectMarkup(item)+'</button>').join('')+'</div><div class="nel-reliable-pass-rail" data-pass-rail></div></section>';
  return '<div class="nel-reliable-order-proof" data-total="'+items.length+'">'+pane('left',items,'1. TUR · SOLDAN SAĞA')+pane('right',reverse,'2. TUR · SAĞDAN SOLA')+
    '<div class="nel-reliable-order-explain"><small>İKİ TURDAN SONRA</small>'+(v.options||[]).map(item=>'<div data-reliable-order-option="'+esc(item.id)+'"><button type="button" class="nel-reliable-listen-phrase" data-rote-speech="'+esc(item.speech)+'">🔊 Dinle</button><p>'+esc(item.speech)+'</p><button type="button" class="nel-reliable-select" data-reliable-order-choice="'+esc(item.id)+'" disabled>Bu açıklama</button></div>').join('')+'</div></div>';
}
function nelReliablePrinciplesVisual(){
  const rows=[['1','Bir nesne','bir sayı adı'],['2','Sayı adları','sabit sıra'],['3','Son sayı adı','toplam'],['4','Farklı sayma yönü','aynı toplam']];
  return '<div class="nel-reliable-principles">'+rows.map(row=>'<div><b>'+row[0]+'</b><span>'+esc(row[1])+'</span><i>→</i><strong>'+esc(row[2])+'</strong></div>').join('')+'</div>';
}
function nelReliableReadCountSet(root){
  if(!root)return null;const all=root.querySelectorAll('[data-reliable-item]').length,counted=root.querySelectorAll('[data-reliable-item].counted').length;return all&&all===counted?String(counted):null;
}
function nelReliableResetCountSet(root){
  if(!root)return;root.querySelectorAll('[data-reliable-item]').forEach(x=>{x.classList.remove('counted');x.disabled=false;delete x.dataset.countIndex;});const rail=root.querySelector('[data-reliable-rail]');if(rail)rail.innerHTML='';
}
function bindNelReliableCountSet(root,onChange,blocked=()=>false){
  if(!root)return;
  root.querySelectorAll('[data-reliable-item]').forEach(button=>button.addEventListener('click',()=>{
    if(blocked()||button.classList.contains('counted'))return;
    const count=root.querySelectorAll('[data-reliable-item].counted').length+1;
    button.classList.add('counted');button.dataset.countIndex=String(count);button.disabled=true;
    const rail=root.querySelector('[data-reliable-rail]');if(rail)rail.insertAdjacentHTML('beforeend','<span>'+esc(nelReliableLessonNames[count])+'</span>');
    speak(nelReliableLessonNames[count]);onChange?.();
  }));
  root.querySelector('.nel-reliable-reset')?.addEventListener('click',()=>{if(blocked())return;nelReliableResetCountSet(root);onChange?.();});
}
function bindNelReliableNextWord(root,onChange,blocked=()=>false){
  if(!root)return;bindNelRoteSpeech(root);
  root.querySelectorAll('[data-reliable-next-choice]').forEach(button=>button.addEventListener('click',()=>{if(blocked())return;root.querySelectorAll('[data-reliable-option]').forEach(x=>x.classList.remove('selected'));button.closest('[data-reliable-option]')?.classList.add('selected');root.dataset.reliableSelected=button.dataset.reliableNextChoice;onChange?.();}));
}
function bindNelReliableCardinality(root,onChange,blocked=()=>false){
  if(!root)return;const set=root.querySelector('.nel-reliable-count-set');
  bindNelReliableCountSet(set,()=>{
    const done=nelReliableReadCountSet(set)!=null;root.querySelectorAll('[data-reliable-card-choice]').forEach(x=>x.disabled=!done);onChange?.();
  },blocked);
  bindNelRoteSpeech(root);
  root.querySelectorAll('[data-reliable-card-choice]').forEach(button=>button.addEventListener('click',()=>{if(blocked()||button.disabled)return;root.querySelectorAll('[data-reliable-card-option]').forEach(x=>x.classList.remove('selected'));button.closest('[data-reliable-card-option]')?.classList.add('selected');root.dataset.reliableSelected=button.dataset.reliableCardChoice;onChange?.();}));
}
function bindNelReliableOrderProof(root,onChange,blocked=()=>false){
  if(!root)return;bindNelRoteSpeech(root);
  const left=root.querySelector('[data-reliable-pass="left"]'),right=root.querySelector('[data-reliable-pass="right"]');
  const setupPane=(pane,onComplete)=>{
    const buttons=[...pane.querySelectorAll('[data-reliable-order-item]')];buttons.forEach(x=>x.disabled=true);if(buttons[0])buttons[0].disabled=false;
    buttons.forEach((button,index)=>button.addEventListener('click',()=>{
      if(blocked()||button.classList.contains('counted'))return;
      button.classList.add('counted');button.disabled=true;const count=index+1;pane.querySelector('[data-pass-rail]')?.insertAdjacentHTML('beforeend','<span>'+esc(nelReliableLessonNames[count])+'</span>');speak(nelReliableLessonNames[count]);
      if(buttons[index+1])buttons[index+1].disabled=false;else{pane.dataset.complete='true';onComplete?.();}onChange?.();
    }));
  };
  setupPane(left,()=>{const first=right?.querySelector('[data-reliable-order-item]');if(first)first.disabled=false;});
  const rightButtons=[...right.querySelectorAll('[data-reliable-order-item]')];rightButtons.forEach(x=>x.disabled=true);
  rightButtons.forEach((button,index)=>button.addEventListener('click',()=>{
    if(blocked()||button.classList.contains('counted')||button.disabled)return;
    button.classList.add('counted');button.disabled=true;const count=index+1;right.querySelector('[data-pass-rail]')?.insertAdjacentHTML('beforeend','<span>'+esc(nelReliableLessonNames[count])+'</span>');speak(nelReliableLessonNames[count]);
    if(rightButtons[index+1])rightButtons[index+1].disabled=false;else{right.dataset.complete='true';root.querySelectorAll('[data-reliable-order-choice]').forEach(x=>x.disabled=false);}onChange?.();
  }));
  root.querySelectorAll('[data-reliable-order-choice]').forEach(button=>button.addEventListener('click',()=>{if(blocked()||button.disabled)return;root.querySelectorAll('[data-reliable-order-option]').forEach(x=>x.classList.remove('selected'));button.closest('[data-reliable-order-option]')?.classList.add('selected');root.dataset.reliableSelected=button.dataset.reliableOrderChoice;onChange?.();}));
}
function nelReliableReadCardinality(root){const set=root?.querySelector('.nel-reliable-count-set'),count=nelReliableReadCountSet(set),choice=root?.dataset.reliableSelected;return count&&choice?count+'|'+choice:null;}
function nelReliableReadOrderProof(root){if(!root)return null;const left=root.querySelector('[data-reliable-pass="left"]')?.dataset.complete==='true',right=root.querySelector('[data-reliable-pass="right"]')?.dataset.complete==='true',choice=root.dataset.reliableSelected,total=root.dataset.total;return left&&right&&choice?total+'|'+total+'|'+choice:null;}
function nelReliableLessonCore(step){
  if(step.kind==='count')return '<div class="nel-reliable-lesson-core">'+nelReliableCountSetVisual({items:step.items,context:step.id==='move-count-five'?'move-to-mat':'counter-tray'})+'<p class="nel-reliable-help" id="nelReliableHelp">Her nesneye yalnız bir kez dokun.</p><div class="nel-reliable-result" id="nelReliableResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='next-word')return '<div class="nel-reliable-lesson-core">'+nelReliableNextWordVisual(step)+'<p class="nel-reliable-help" id="nelReliableHelp"></p><div class="nel-reliable-result" id="nelReliableResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='cardinality')return '<div class="nel-reliable-lesson-core">'+nelReliableCardinalityVisual(step)+'<p class="nel-reliable-help" id="nelReliableHelp">Önce bütün nesneleri say.</p><div class="nel-reliable-result" id="nelReliableResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='order-proof')return '<div class="nel-reliable-lesson-core">'+nelReliableOrderProofVisual(step)+'<p class="nel-reliable-help" id="nelReliableHelp">İki turu da tamamla.</p><div class="nel-reliable-result" id="nelReliableResult">'+esc(step.result)+'</div></div>';
  if(step.kind==='principles')return '<div class="nel-reliable-lesson-core">'+nelReliablePrinciplesVisual()+'<button type="button" class="nel-reliable-done" id="nelReliableDone">Dört fikri gördüm</button><div class="nel-reliable-result" id="nelReliableResult">'+esc(step.result)+'</div></div>';
  return '<div class="nel-reliable-lesson-core"><div class="nel-reliable-real-world"><span>1</span><p>6–10 küçük nesne bul.</p><span>2</span><p>Bir nesneyi sayınca başka bir yere taşı veya işaretle.</p><span>3</span><p>Son söylediğin sayı adını toplam olarak söyle.</p></div><button type="button" class="nel-reliable-done" id="nelReliableDone">Günlük saymamı yaptım</button><div class="nel-reliable-result" id="nelReliableResult">'+esc(step.result)+'</div></div>';
}
function revealNelReliableResult(){ $('#nelReliableResult')?.classList.add('revealed'); }
function wireNelReliableLessonStep(step,next){
  const good=()=>{revealNelReliableResult();next.disabled=false;};
  if(step.kind==='count'){const root=$('.nel-reliable-count-set');bindNelReliableCountSet(root,()=>{if(nelReliableReadCountSet(root)!=null){root.classList.add('complete');$('#nelReliableHelp').textContent='';good();}});return;}
  if(step.kind==='next-word'){const root=$('.nel-reliable-next-word');bindNelReliableNextWord(root,()=>{if(root.dataset.reliableSelected!==step.answer){$('#nelReliableHelp').textContent='Sayı adlarının sabit sırasını yeniden dinle.';return;}root.querySelectorAll('button').forEach(x=>x.disabled=true);$('#nelReliableHelp').textContent='';good();});return;}
  if(step.kind==='cardinality'){const root=$('.nel-reliable-cardinality');bindNelReliableCardinality(root,()=>{const value=nelReliableReadCardinality(root);if(!value)return;if(value!==step.answer){$('#nelReliableHelp').textContent='Son söylediğin sayı adını toplam olarak seç.';return;}root.querySelectorAll('button').forEach(x=>x.disabled=true);$('#nelReliableHelp').textContent='';good();});return;}
  if(step.kind==='order-proof'){const root=$('.nel-reliable-order-proof');bindNelReliableOrderProof(root,()=>{const value=nelReliableReadOrderProof(root);if(!value)return;if(value!==step.answer){$('#nelReliableHelp').textContent='Aynı nesneler iki turda da birer kez sayıldı. Toplam ilişkisini yeniden düşün.';return;}root.querySelectorAll('button').forEach(x=>x.disabled=true);$('#nelReliableHelp').textContent='';good();});return;}
  $('#nelReliableDone')?.addEventListener('click',()=>{$('#nelReliableDone').disabled=true;good();});
}
function completeNelReliableLessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id),lc=ss.learningCycle,next=index+1;lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);lc.lessonVersion=NEL_RELIABLE_LESSON_VERSION;
  if(next>=NEL_RELIABLE_LESSON_STEPS.length){lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now();saveState();session.planIndex++;loadPlanItem();return;}saveState();session.lessonStepIndex=next;renderNelReliableLessonStep(skill,next);
}
function renderNelReliableLessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id),saved=Math.min(NEL_RELIABLE_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(NEL_RELIABLE_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=NEL_RELIABLE_LESSON_STEPS[at];session.lessonStepIndex=at;currentQuestion=null;renderPracticeHeader(skill);$('#practiceMode').textContent='KEŞFET';$('#practiceMode').dataset.mode='teach';$('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+NEL_RELIABLE_LESSON_STEPS.length;$('#practiceProgress').style.width=Math.round((at+1)/NEL_RELIABLE_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="nel-reliable-lesson-stage" data-nel-reliable-step="'+esc(step.id)+'">'+nelReliableSectionTrack(step)+'<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · '+(at+1)+' / '+NEL_RELIABLE_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="nel-reliable-lesson-visual">'+nelReliableLessonCore(step)+'</div><div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="nelReliableLessonNext" disabled>'+(at===NEL_RELIABLE_LESSON_STEPS.length-1?'Sayı hissi yoluna devam':'Sonraki keşif')+' <b>→</b></button></div></div>';
  const next=$('#nelReliableLessonNext');wireNelReliableLessonStep(step,next);next?.addEventListener('click',()=>completeNelReliableLessonStep(skill,at));
}


const NEL_SUBITISE_LESSON_VERSION=1;
const NEL_SUBITISE_FLASH_MS=650;
const NEL_SUBITISE_SECTIONS=['BİR BAKIŞ','KUR','FARKLI DÜZEN','ANLAT','OYUNA TAŞI'];
const nelSubPattern=(id,n,slots,family='structured',context='dots')=>({id,n,slots,family,context});
const nelSubAudioOptions=answer=>[answer,answer-1,answer+1,answer+2,1,5].filter((n,i,a)=>n>=1&&n<=5&&a.indexOf(n)===i).slice(0,4).map(nelRoteItem);
const nelSubMatchOptions=answer=>[answer,...[1,2,3,4,5].filter(n=>n!==answer).slice(0,3)].map(n=>({
  value:'qty-'+n,n,pattern:n===1?nelSubPattern('match-1',1,[4]):n===2?nelSubPattern('match-2',2,[0,8]):n===3?nelSubPattern('match-3',3,[0,4,8]):n===4?nelSubPattern('match-4',4,[0,2,6,8]):nelSubPattern('match-5',5,[0,2,4,6,8])
}));
const NEL_SUBITISE_PHRASES=[
  {id:'instant',speech:'Küçük miktarı tek tek saymadan, bir bakışta fark ettim.'},
  {id:'counted',speech:'Noktaları birer birer sayarak miktarı buldum.'},
  {id:'colour',speech:'Yalnız rengine baktım; miktarı düşünmedim.'},
  {id:'guess',speech:'Miktarı görmeden rastgele bir sayı adı seçtim.'}
];
const NEL_SUBITISE_LESSON_STEPS=[
  {id:'glance-two',section:'BİR BAKIŞ',kind:'audio',pattern:nelSubPattern('lesson-two',2,[0,8]),answer:'rote-2',options:nelSubAudioOptions(2),title:'İkiyi tek tek saymadan gör.',body:'Hazır olduğunda kısa görüntüyü aç. Noktalar kapanınca kaç tane gördüğünü dinleyerek seç.',result:'İki küçük miktarı bir bakışta fark ettin.'},
  {id:'build-three',section:'KUR',kind:'build',pattern:nelSubPattern('lesson-three-build',3,[0,4,8]),answer:'3',title:'Gördüğün miktarı hafızadan kur.',body:'Üç nokta kısa süre görünecek. Kapandıktan sonra gördüğün kadar taşı seç.',result:'Kısa görünümdeki üç miktarını hafızadan yeniden kurdun.'},
  {id:'dice-four',section:'BİR BAKIŞ',kind:'audio',pattern:nelSubPattern('lesson-dice-four',4,[0,2,6,8],'structured','dice'),answer:'rote-4',options:nelSubAudioOptions(4),title:'Zar düzenindeki dördü bir bakışta fark et.',body:'Görüntü kısa süre açık kalacak; tek tek saymak yerine düzenin tamamını gör.',result:'Zarın dört noktasını tek tek saymadan tanıdın.'},
  {id:'dice-five',section:'BİR BAKIŞ',kind:'audio',pattern:nelSubPattern('lesson-dice-five',5,[0,2,4,6,8],'structured','dice'),answer:'rote-5',options:nelSubAudioOptions(5),title:'Beşi de bütün olarak gör.',body:'Beş nokta kısa süre açılacak. Kapanınca miktarı seç.',result:'Beş noktanın bütün düzenini bir bakışta fark ettin.'},
  {id:'varied-three',section:'FARKLI DÜZEN',kind:'audio',pattern:nelSubPattern('lesson-varied-three',3,[0,2,7],'varied'),answer:'rote-3',options:nelSubAudioOptions(3),title:'Üç her zaman aynı şekilde durmaz.',body:'Noktalar farklı yerlere dağıldı. Kısa görüntüde miktarı yine bir bakışta bul.',result:'Noktaların yeri değişse de üç miktarını tanıdın.'},
  {id:'varied-four',section:'FARKLI DÜZEN',kind:'match',pattern:nelSubPattern('lesson-varied-four',4,[1,3,5,7],'varied'),answer:'qty-4',options:nelSubMatchOptions(4),title:'Gördüğün dörtle aynı miktarı bul.',body:'Kısa görüntü kapandıktan sonra aynı miktarı gösteren başka düzeni seç.',result:'Farklı düzenler aynı küçük miktarı gösterebilir.'},
  {id:'varied-five',section:'FARKLI DÜZEN',kind:'audio',pattern:nelSubPattern('lesson-varied-five',5,[0,1,4,7,8],'varied'),answer:'rote-5',options:nelSubAudioOptions(5),title:'Düzensiz beşi de bir bakışta tanı.',body:'Noktalar zar gibi dizili değil. Yine de tek tek saymadan küçük grubu bütün olarak gör.',result:'Düzensiz görünümde de beş miktarını fark ettin.'},
  {id:'same-quantity-layout',section:'FARKLI DÜZEN',kind:'match',pattern:nelSubPattern('lesson-same-four',4,[0,2,4,8],'varied'),answer:'qty-4',options:nelSubMatchOptions(4),title:'Miktarı görünüşünden ayır.',body:'Gördüğün kısa düzeni değil, aynı miktarı taşıyan kartı bul.',result:'Miktarı, noktaların tam yerleşiminden bağımsız olarak tanıdın.'},
  {id:'instant-meaning',section:'ANLAT',kind:'explain',pattern:nelSubPattern('lesson-explain-three',3,[2,4,6]),answer:'instant',options:NEL_SUBITISE_PHRASES,title:'Bir bakışta görmek ne demek?',body:'Kısa görüntüden sonra açıklamaları dinle. Subitising fikrini doğru anlatanı seç.',result:'Bir bakışta miktarı fark etmek, küçük grubu tek tek saymadan kaç tane olduğunu görmektir.'},
  {id:'game-transfer',section:'OYUNA TAŞI',kind:'audio',pattern:nelSubPattern('lesson-domino-five',5,[0,2,4,6,8],'structured','domino'),answer:'rote-5',options:nelSubAudioOptions(5),title:'Bir bakışta görmeyi oyuna taşı.',body:'Domino benzeri nokta düzeni kısa süre açılacak. Kapanınca miktarı seç.',result:'Zar ve domino oyunlarında küçük miktarı bir bakışta tanıyabilirsin.'}
];
function nelSubitiseSectionTrack(step){ return '<div class="nel-subitise-section-track">'+NEL_SUBITISE_SECTIONS.map(name=>'<span class="'+(name===step.section?'active':'')+'">'+esc(name)+'</span>').join('')+'</div>'; }
function nelSubitisePatternVisual(pattern={},compact=false){
  const active=new Set(pattern.slots||[]);
  return '<div class="nel-subitise-pattern '+esc(pattern.context||'dots')+' '+(compact?'compact':'')+'" aria-label="'+esc((pattern.n||0)+' noktalı küçük miktar')+'">'+Array.from({length:9},(_,i)=>'<i class="'+(active.has(i)?'filled':'')+'"></i>').join('')+'</div>';
}
function nelSubitiseFlashFrame(pattern={},flashMs=NEL_SUBITISE_FLASH_MS){
  return '<div class="nel-subitise-flash-frame" data-subitise-flash-ms="'+Number(flashMs||NEL_SUBITISE_FLASH_MS)+'" data-flash-state="idle">'+
    '<div class="nel-subitise-flash-pattern">'+nelSubitisePatternVisual(pattern)+'</div>'+
    '<div class="nel-subitise-cover"><button type="button" class="nel-subitise-show">👀 Hazırım, göster</button><span>Kısa görüntü açılacak.</span></div>'+
  '</div>';
}
function nelSubitiseAudioChoices(options=[]){
  return '<div class="nel-subitise-audio-grid nel-subitise-response">'+options.map(item=>'<div data-subitise-option="'+esc(item.id)+'">'+nelRoteAudioCard(item,false)+'<button type="button" class="nel-subitise-select" data-subitise-audio-choice="'+esc(item.id)+'" disabled>Bunu seç</button></div>').join('')+'</div>';
}
function nelSubitiseBuildResponse(pool=5){
  return '<div class="nel-subitise-build-response nel-subitise-response"><small>GÖRDÜĞÜN KADAR TAŞ SEÇ</small><div>'+Array.from({length:Number(pool)||5},(_,i)=>'<button type="button" class="nel-subitise-build-token" data-subitise-build="'+(i+1)+'" disabled aria-label="Taş '+(i+1)+'"></button>').join('')+'</div><button type="button" class="nel-subitise-clear" disabled>Baştan kur</button></div>';
}
function nelSubitiseMatchChoices(options=[]){
  return '<div class="nel-subitise-match-grid nel-subitise-response">'+options.map(opt=>'<button type="button" class="nel-subitise-match-card" data-subitise-match="'+esc(opt.value)+'" disabled>'+nelSubitisePatternVisual(opt.pattern,true)+'<span>Bu miktar</span></button>').join('')+'</div>';
}
function nelSubitiseExplainChoices(options=[]){
  return '<div class="nel-subitise-explain-grid nel-subitise-response">'+options.map(item=>'<div data-subitise-option="'+esc(item.id)+'"><button type="button" class="nel-subitise-listen" data-rote-speech="'+esc(item.speech)+'" disabled>🔊 Dinle</button><p>'+esc(item.speech)+'</p><button type="button" class="nel-subitise-select" data-subitise-explain-choice="'+esc(item.id)+'" disabled>Bu açıklama</button></div>').join('')+'</div>';
}
function nelSubitiseRootVisual(v={},kind='audio'){
  const response=kind==='build'?nelSubitiseBuildResponse(v.pool||5):kind==='match'?nelSubitiseMatchChoices(v.options||[]):kind==='explain'?nelSubitiseExplainChoices(v.options||[]):nelSubitiseAudioChoices(v.options||[]);
  return '<div class="nel-subitise-root" data-subitise-kind="'+esc(kind)+'">'+nelSubitiseFlashFrame(v.pattern,v.flashMs)+response+'</div>';
}
function nelSubitiseFlashBuildVisual(v={}){ return nelSubitiseRootVisual(v,'build'); }
function nelSubitiseFlashAudioVisual(v={}){ return nelSubitiseRootVisual(v,'audio'); }
function nelSubitiseFlashMatchVisual(v={}){ return nelSubitiseRootVisual(v,'match'); }
function nelSubitiseFlashExplainVisual(v={}){ return nelSubitiseRootVisual(v,'explain'); }
function nelSubitiseUnlock(root){
  root?.querySelectorAll('.nel-subitise-response button').forEach(button=>button.disabled=false);
  bindNelRoteSpeech(root);
}
function nelSubitiseStartFlash(root,onReady,blocked=()=>false){
  const frame=root?.querySelector('.nel-subitise-flash-frame'),button=frame?.querySelector('.nel-subitise-show');if(!frame||!button)return;
  button.addEventListener('click',()=>{
    if(blocked()||frame.dataset.flashState!=='idle')return;
    frame.dataset.flashState='showing';frame.classList.add('showing');button.disabled=true;
    const ms=Math.max(250,Number(frame.dataset.subitiseFlashMs)||NEL_SUBITISE_FLASH_MS);
    setTimeout(()=>{
      if(!frame.isConnected)return;
      frame.dataset.flashState='ready';frame.classList.remove('showing');frame.classList.add('ready');root.dataset.flashReady='true';nelSubitiseUnlock(root);onReady?.();
    },ms);
  });
}
function nelSubitiseRead(root){
  if(!root||root.dataset.flashReady!=='true')return null;
  const kind=root.dataset.subitiseKind;
  if(kind==='build'){
    const count=root.querySelectorAll('.nel-subitise-build-token.selected').length;
    return count?String(count):null;
  }
  return root.dataset.subitiseSelected||null;
}
function bindNelSubitiseRoot(root,onChange,blocked=()=>false){
  if(!root)return;
  nelSubitiseStartFlash(root,onChange,blocked);
  root.querySelectorAll('[data-subitise-build]').forEach(button=>button.addEventListener('click',()=>{if(blocked()||button.disabled)return;button.classList.toggle('selected');onChange?.();}));
  root.querySelector('.nel-subitise-clear')?.addEventListener('click',()=>{if(blocked())return;root.querySelectorAll('[data-subitise-build]').forEach(x=>x.classList.remove('selected'));onChange?.();});
  root.querySelectorAll('[data-subitise-audio-choice]').forEach(button=>button.addEventListener('click',()=>{if(blocked()||button.disabled)return;root.querySelectorAll('[data-subitise-option]').forEach(x=>x.classList.remove('selected'));button.closest('[data-subitise-option]')?.classList.add('selected');root.dataset.subitiseSelected=button.dataset.subitiseAudioChoice;onChange?.();}));
  root.querySelectorAll('[data-subitise-match]').forEach(button=>button.addEventListener('click',()=>{if(blocked()||button.disabled)return;root.querySelectorAll('[data-subitise-match]').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');root.dataset.subitiseSelected=button.dataset.subitiseMatch;onChange?.();}));
  root.querySelectorAll('[data-subitise-explain-choice]').forEach(button=>button.addEventListener('click',()=>{if(blocked()||button.disabled)return;root.querySelectorAll('[data-subitise-option]').forEach(x=>x.classList.remove('selected'));button.closest('[data-subitise-option]')?.classList.add('selected');root.dataset.subitiseSelected=button.dataset.subitiseExplainChoice;onChange?.();}));
}
function nelSubitiseLessonCore(step){
  const v={pattern:step.pattern,options:step.options||[],pool:5,flashMs:NEL_SUBITISE_FLASH_MS};
  const visual=step.kind==='build'?nelSubitiseFlashBuildVisual(v):step.kind==='match'?nelSubitiseFlashMatchVisual(v):step.kind==='explain'?nelSubitiseFlashExplainVisual(v):nelSubitiseFlashAudioVisual(v);
  return '<div class="nel-subitise-lesson-core">'+visual+'<p class="nel-subitise-help" id="nelSubitiseHelp">Hazır olduğunda kısa görüntüyü aç.</p><div class="nel-subitise-result" id="nelSubitiseResult">'+esc(step.result)+'</div></div>';
}
function wireNelSubitiseLessonStep(step,next){
  const root=$('.nel-subitise-root');
  bindNelSubitiseRoot(root,()=>{
    if(root.dataset.flashReady!=='true'){$('#nelSubitiseHelp').textContent='Görüntü çok kısa açık kalacak; hazır olduğunda bak.';return;}
    const value=nelSubitiseRead(root);if(value==null){$('#nelSubitiseHelp').textContent=step.kind==='build'?'Gördüğün kadar taşı seç.':'Bir cevap seç.';return;}
    if(value!==step.answer){$('#nelSubitiseHelp').textContent='Tek tek saymaya dönmeden kısa görüntüde fark ettiğin miktarı yeniden düşün.';return;}
    root.querySelectorAll('button').forEach(x=>x.disabled=true);$('#nelSubitiseHelp').textContent='';$('#nelSubitiseResult')?.classList.add('revealed');next.disabled=false;
  });
}
function completeNelSubitiseLessonStep(skill,index){
  const ss=ensureSkillState(state,skill.id),lc=ss.learningCycle,next=index+1;lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,next);lc.lessonVersion=NEL_SUBITISE_LESSON_VERSION;
  if(next>=NEL_SUBITISE_LESSON_STEPS.length){lc.lessonTaughtAt=lc.lessonTaughtAt||Date.now();saveState();session.planIndex++;loadPlanItem();return;}saveState();session.lessonStepIndex=next;renderNelSubitiseLessonStep(skill,next);
}
function renderNelSubitiseLessonStep(skill,index=null){
  const ss=ensureSkillState(state,skill.id),saved=Math.min(NEL_SUBITISE_LESSON_STEPS.length-1,Math.max(0,ss.learningCycle?.lessonStepIndex||0));
  const at=index==null?(session?.lessonReplayStep!=null?Math.min(NEL_SUBITISE_LESSON_STEPS.length-1,Math.max(0,Number(session.lessonReplayStep)||0)):(session?.lessonReplay?0:saved)):index;
  const step=NEL_SUBITISE_LESSON_STEPS[at];session.lessonStepIndex=at;currentQuestion=null;renderPracticeHeader(skill);$('#practiceMode').textContent='KEŞFET';$('#practiceMode').dataset.mode='teach';$('#practiceCounter').textContent=step.section+' • '+(at+1)+' / '+NEL_SUBITISE_LESSON_STEPS.length;$('#practiceProgress').style.width=Math.round((at+1)/NEL_SUBITISE_LESSON_STEPS.length*100)+'%';
  $('#practiceContent').innerHTML='<div class="nel-subitise-lesson-stage" data-nel-subitise-step="'+esc(step.id)+'">'+nelSubitiseSectionTrack(step)+'<div class="lesson-step-copy"><span class="lesson-kicker">'+esc(step.section)+' · '+(at+1)+' / '+NEL_SUBITISE_LESSON_STEPS.length+'</span><h2>'+esc(step.title)+'</h2><p>'+esc(step.body)+'</p></div><div class="nel-subitise-lesson-visual">'+nelSubitiseLessonCore(step)+'</div><div class="lesson-step-actions"><button type="button" class="response-submit lesson-next-button" id="nelSubitiseLessonNext" disabled>'+(at===NEL_SUBITISE_LESSON_STEPS.length-1?'Sayı hissi yoluna devam':'Sonraki keşif')+' <b>→</b></button></div></div>';
  const next=$('#nelSubitiseLessonNext');wireNelSubitiseLessonStep(step,next);next?.addEventListener('click',()=>completeNelSubitiseLessonStep(skill,at));
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
let activeAtlasUnitId=null;
let activeLessonSkillId=null;
let inspectorSandbox=false;
let inspectorRealState=null;
let inspectorSelectedSkillId=null;
let pendingAtlasSkillId=null;
let pendingLessonLaunch=null;
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

function runtimeSkillsForProfile(profile=state.profile){
  return skillsFor(profile,{includeHidden:!!inspectorSandbox});
}

init();

function init(){
  bindNavigation();
  bindControls();
  // Isolate inspection before normalization can save a migration.
  if(INSPECTOR_ENABLED) enterInspectorSandbox();
  normalizeState();
  renderAll();
  applyMotionSetting();
  registerSW();
  if(INSPECTOR_ENABLED){
    const launcher=$('#inspectorLauncher'); if(launcher) launcher.hidden=false;
    enterInspectorSandbox();
    navigate('inspector');
    return;
  }
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
  state.version=3;
  state.settings ||= defaultState().settings;
  state.learningArchitecture ||= {version:1};
  state.reviewQueue ||= [];
  state.history ||= [];
  state.sessions ||= [];
  state.totals ||= defaultState().totals;
  skillsFor(state.profile).forEach(s=>ensureSkillState(state,s.id));
  ensureLearningArchitectureState(state);
  saveState();
}
function saveState(){ if(inspectorSandbox) return; try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }catch(err){ console.warn('SAYMERA save failed',err); } }
function showToast(message){
  const node=$('#toast'); if(!node) return;
  node.textContent=message; node.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove('show'),2200);
}

function startPrimaryJourney(){
  if(state.profile==='grade2'){
    const current=currentCurriculumSkill(state);
    if(current){ openLessonCenter(current.id); return; }
  }
  startSession();
}
function bindNavigation(){
  $$('[data-nav]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.nav)));
  $('#profileChip').addEventListener('click',()=>openOnboarding(true));
  $('#bottomStart').addEventListener('click',startPrimaryJourney);
}
function navigate(name){
  const target=name==='map'?'atlas':name;
  activeScreen=target;
  $$('.screen').forEach(x=>x.classList.remove('active'));
  $(`#${target}Screen`)?.classList.add('active');
  $$('.bottom-nav [data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===target));
  if(target==='parent') renderParent();
  if(target==='atlas') renderAtlas();
  if(target==='lessonCenter') renderLessonCenter();
  if(target==='inspector') renderInspector();
  window.scrollTo({top:0,behavior:state.settings.calmMotion?'auto':'smooth'});
}

function bindControls(){
  $('#startSessionButton').addEventListener('click',startPrimaryJourney);
  $('#closePractice').addEventListener('click',()=>closePractice(true));
  $('#speakButton').addEventListener('click',speakCurrent);
  $('#onboardingContinue').addEventListener('click',completeOnboarding);
  $$('#onboardingLevels [data-profile]').forEach(btn=>btn.addEventListener('click',()=>selectOnboardingLevel(btn.dataset.profile)));
  $('#onboardingOverlay').addEventListener('click',e=>{ if(e.target===e.currentTarget && state.onboarded) closeOnboarding(); });
  $('#restHomeButton').addEventListener('click',()=>{ hideCooldown(); navigate('home'); });
  $('#parentSkipCooldown').addEventListener('click',()=>{ state.cooldownUntil=0; saveState(); hideCooldown(); renderAll(); showToast('Mola ebeveyn tarafından sonlandırıldı'); });
  $('#saveSettingsButton').addEventListener('click',saveSettingsFromUI);
  $('#resetButton').addEventListener('click',resetProgress);
  $('#inspectorLauncher')?.addEventListener('click',()=>{ if(!INSPECTOR_ENABLED) return; if(!inspectorSandbox) enterInspectorSandbox(); navigate('inspector'); });
  $('#inspectorExit')?.addEventListener('click',exitInspectorSandbox);

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
  renderHeader(); renderHome(); renderAtlas(); renderParent(); if(activeLessonSkillId) renderLessonCenter(); if(inspectorSandbox) renderInspector();
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
  $('#startMainText').textContent=locked?'Mola sürüyor':state.profile==='grade2'?'Derse devam et':'Keşfi başlat';
  const firstCycle=!!(focus&&supportsLearningCycle(focus.skill.id)&&!ss?.learningCycle?.firstCycleCompletedAt);
  $('#startMetaText').textContent=locked?'ekran dışı ara':state.profile==='grade2'?'Öğren · Uygula · Tekrar':`yaklaşık ${firstCycle?'7–10':'5–7'} dk`;
  $('#bottomStart').disabled=!!locked;
}

function atlasSkillLabel(skillId){
  return runtimeSkillsForProfile(state.profile).find(skill=>skill.id===skillId)?.label||'önceki ders';
}
function atlasLessonStatusCopy(snapshot){
  if(snapshot.access.status==='completed'){
    if(snapshot.review.status==='due') return {label:'Tekrar hazır',detail:'Dersi yeniden açabilirsin.',mark:'↻'};
    return {label:'Tamamlandı',detail:'İstediğin zaman yeniden açabilirsin.',mark:'✓'};
  }
  if(snapshot.access.status==='current') return {label:'Sıradaki ders',detail:'Yeni öğrenme burada devam ediyor.',mark:'→'};
  if(snapshot.access.status==='locked'){
    const blocker=snapshot.access.lockReason?.skillId;
    return {label:'Henüz açılmadı',detail:blocker?'Önce '+atlasSkillLabel(blocker)+' tamamlanmalı.':'Önce önceki ders tamamlanmalı.',mark:'⌁'};
  }
  return {label:'Açık',detail:'Bu derse geçebilirsin.',mark:'○'};
}
function openLessonCenter(skillId){
  const skill=runtimeSkillsForProfile(state.profile).find(item=>item.id===skillId);
  if(!skill) return;
  const access=lessonAccessState(state,skillId);
  if(access.status==='locked'){
    const blocker=access.lockReason?.skillId;
    showToast(blocker?'Önce “'+atlasSkillLabel(blocker)+'” dersini tamamla.':'Bu ders henüz açılmadı.');
    return;
  }
  activeLessonSkillId=skillId;
  navigate('lessonCenter');
}
function renderGrade2Atlas(){
  const units=curriculumUnitsFor('grade2');
  const current=currentCurriculumSkill(state);
  const currentUnit=units.find(unit=>unit.lessons.some(skill=>skill.id===current?.id))||units.find(unit=>unit.lessons.some(skill=>lessonAccessState(state,skill.id).status!=='completed'))||units.at(-1);
  if(!activeAtlasUnitId||!units.some(unit=>unit.id===activeAtlasUnitId)) activeAtlasUnitId=currentUnit?.id||units[0]?.id||null;

  const snapshots=new Map();
  units.forEach(unit=>unit.lessons.forEach(skill=>snapshots.set(skill.id,lessonProgressSnapshot(state,skill.id))));
  const allLessons=units.flatMap(unit=>unit.lessons);
  const completed=allLessons.filter(skill=>snapshots.get(skill.id)?.access.status==='completed').length;
  const due=allLessons.filter(skill=>snapshots.get(skill.id)?.review.status==='due').length;
  const currentIndex=current?allLessons.findIndex(skill=>skill.id===current.id)+1:allLessons.length;

  $('#atlasSummary').innerHTML=`
    <div class="summary-card"><span>TAMAMLANAN DERS</span><strong>${completed} / ${allLessons.length}</strong><p>Müfredat yolunda tamamlanan yeni öğrenmeler.</p></div>
    <div class="summary-card text"><span>ŞİMDİKİ ÜNİTE</span><strong>${esc(currentUnit?.label||'Yol tamamlandı')}</strong><p>${currentUnit?'Bu ünitenin dersleri sırayla açılır.':'Bütün yeni dersler açıldı.'}</p></div>
    <div class="summary-card"><span>YOLDAKİ DERS</span><strong>${currentIndex}</strong><p>${current?esc(current.label):'Yeni öğrenme yolu tamamlandı.'}</p></div>
    <div class="summary-card"><span>TEKRAR HAZIR</span><strong>${due}</strong><p>Zamanı gelen kısa geri çağırmalar.</p></div>`;

  $('#domainTabs').innerHTML=units.map((unit,index)=>`<button class="domain-tab ${unit.id===activeAtlasUnitId?'active':''}" data-atlas-unit-tab="${esc(unit.id)}" role="tab"><span>${index+1}</span>${esc(unit.label)}</button>`).join('');
  $$('#domainTabs [data-atlas-unit-tab]').forEach(btn=>btn.addEventListener('click',()=>{
    activeAtlasUnitId=btn.dataset.atlasUnitTab;
    renderAtlas();
    requestAnimationFrame(()=>document.querySelector('[data-atlas-unit="'+CSS.escape(activeAtlasUnitId)+'"]')?.scrollIntoView({behavior:state.settings.calmMotion?'auto':'smooth',block:'start'}));
  }));

  $('#skillMap').innerHTML='<div class="atlas-roadmap">'+units.map((unit,unitIndex)=>{
    const lessonSnapshots=unit.lessons.map(skill=>({skill,snapshot:snapshots.get(skill.id)}));
    const done=lessonSnapshots.filter(item=>item.snapshot.access.status==='completed').length;
    const hasCurrent=lessonSnapshots.some(item=>item.snapshot.access.status==='current');
    const allDone=done===unit.lessons.length;
    const expanded=unit.id===activeAtlasUnitId;
    const unitState=allDone?'completed':hasCurrent?'current':'locked';
    const unitLabel=allDone?'Tamamlandı':hasCurrent?'Şimdi buradasın':'Daha sonra';
    return `<section class="atlas-unit ${unitState} ${expanded?'expanded':''}" data-atlas-unit="${esc(unit.id)}">
      <button class="atlas-unit-head" type="button" data-atlas-unit-toggle="${esc(unit.id)}" aria-expanded="${expanded?'true':'false'}">
        <span class="atlas-unit-index">${String(unitIndex+1).padStart(2,'0')}</span>
        <span class="atlas-unit-copy"><small>${esc(unit.strand)}</small><strong>${esc(unit.label)}</strong><em>${done} / ${unit.lessons.length} ders</em></span>
        <span class="atlas-unit-state ${unitState}">${unitLabel}</span>
        <i aria-hidden="true">${expanded?'−':'+'}</i>
      </button>
      <div class="atlas-unit-lessons" ${expanded?'':'hidden'}>${lessonSnapshots.map(({skill,snapshot},lessonIndex)=>{
        const status=atlasLessonStatusCopy(snapshot);
        const rowClass=snapshot.access.status;
        const reviewBadge=snapshot.review.status==='due'?'<span class="atlas-review-badge">Tekrar hazır</span>':'';
        return `<button type="button" class="atlas-lesson-row ${rowClass}" data-atlas-lesson="${esc(skill.id)}" aria-disabled="${snapshot.access.status==='locked'?'true':'false'}">
          <span class="atlas-lesson-order">${unitIndex+1}.${lessonIndex+1}</span>
          <span class="atlas-lesson-marker">${status.mark}</span>
          <span class="atlas-lesson-copy"><strong>${esc(skill.label)}</strong><small>${esc(status.detail)}</small></span>
          <span class="atlas-lesson-status">${reviewBadge}<b>${status.label}</b></span>
        </button>`;
      }).join('')}</div>
    </section>`;
  }).join('')+'</div>';

  $$('[data-atlas-unit-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
    activeAtlasUnitId=btn.dataset.atlasUnitToggle;
    renderAtlas();
  }));
  $$('[data-atlas-lesson]').forEach(btn=>btn.addEventListener('click',()=>openLessonCenter(btn.dataset.atlasLesson)));
}
function renderLegacyAtlas(){
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
function renderAtlas(){
  if(state.profile==='grade2') renderGrade2Atlas();
  else renderLegacyAtlas();
}


const PRACTICE_SECTION_BASE_TASKS=4;
const PRACTICE_SECTION_MAX_TASKS=6;

function lessonSkill(){
  return activeLessonSkillId?runtimeSkillsForProfile(state.profile).find(skill=>skill.id===activeLessonSkillId)||null:null;
}
function reviewTimingCopy(review){
  if(review.status==='due') return 'Hazır';
  if(review.status==='caught-up') return 'Şimdilik tamam';
  if(review.status==='ready') return 'Takvim bekleniyor';
  if(review.status==='scheduled'&&review.dueAt){
    const days=Math.max(1,Math.ceil((review.dueAt-Date.now())/(1000*60*60*24)));
    return days===1?'Yarın':days+' gün sonra';
  }
  return 'Öğrenme tamamlanınca açılır';
}
function practiceSectionState(snapshot,index){
  const sections=snapshot.practice.sections||[];
  const firstIncomplete=sections.findIndex(section=>!section.completedAt);
  if(snapshot.practice.status==='locked'||snapshot.practice.status==='pending-design') return 'locked';
  if(sections[index]?.completedAt) return 'completed';
  if(firstIncomplete<0) return 'available';
  return index===firstIncomplete?'current':'locked';
}
function practiceSectionProgressCopy(section){
  if(section.completedAt) return 'Tamamlandı';
  const cycle=section.cycleAttempts||0;
  if(cycle>=PRACTICE_SECTION_MAX_TASKS) return 'Yeni deneme hazır';
  if(cycle>=PRACTICE_SECTION_BASE_TASKS) return 'Düzeltme '+(cycle-PRACTICE_SECTION_BASE_TASKS)+' / '+(PRACTICE_SECTION_MAX_TASKS-PRACTICE_SECTION_BASE_TASKS);
  if(cycle>0) return cycle+' / '+PRACTICE_SECTION_BASE_TASKS+' görev';
  if(section.legacyAttempts>0) return 'Önceki çalışma var';
  return 'Başlamadı';
}
function renderLessonCenter(){
  const skill=lessonSkill();
  const root=$('#lessonCenterBody');
  if(!root) return;
  if(!skill){
    root.innerHTML='<div class="lesson-center-empty"><strong>Ders seçilmedi.</strong><button type="button" data-nav="atlas">Atlas’a dön</button></div>';
    root.querySelector('[data-nav="atlas"]')?.addEventListener('click',()=>navigate('atlas'));
    return;
  }
  const snapshot=lessonProgressSnapshot(state,skill.id);
  const contract=lessonContractFor(skill.id);
  const unit=curriculumUnitsFor(state.profile).find(item=>item.id===snapshot.unitId);
  const learnComplete=snapshot.learn.status==='complete';
  const learnLabel=learnComplete?'Tamamlandı':snapshot.learn.status==='in-progress'?'Devam ediyor':'Başlamadı';
  const practiceDesigned=!snapshot.provisional&&snapshot.practice.totalSections>0;
  const practiceLabel=!learnComplete?'Önce Öğren':!practiceDesigned?'Henüz hazırlanıyor':snapshot.practice.status==='complete'?'Tamamlandı':snapshot.practice.completedSections+' / '+snapshot.practice.totalSections+' bölüm';
  const reviewLabel=reviewTimingCopy(snapshot.review);
  const reviewReady=snapshot.review.status==='due';

  $('#lessonCenterKicker').textContent=(unit?.strand||skill.family).toUpperCase();
  $('#lessonCenterTitle').textContent=skill.label;
  $('#lessonCenterLead').textContent=unit?unit.label+' ünitesindeki ders yolun.':'Bu dersin öğrenme, uygulama ve tekrar alanları.';
  $('#lessonCenterStatus').textContent=snapshot.access.status==='completed'?'Ders tamamlandı':snapshot.access.status==='current'?'Sıradaki ders':'Ders açık';

  const sectionRows=practiceDesigned?snapshot.practice.sections.map((section,index)=>{
    const status=practiceSectionState(snapshot,index);
    const locked=status==='locked';
    const mark=status==='completed'?'✓':status==='current'?'→':'○';
    return '<button type="button" class="lesson-practice-row '+status+'" data-practice-section="'+esc(section.id)+'" '+(locked?'disabled aria-disabled="true"':'')+'>'+
      '<span class="lesson-practice-mark">'+mark+'</span>'+
      '<span class="lesson-practice-copy"><strong>'+esc(section.label)+'</strong><small>'+esc(practiceSectionProgressCopy(section))+'</small></span>'+
      '<span class="lesson-practice-arrow">'+(locked?'⌁':'→')+'</span>'+
    '</button>';
  }).join(''):'<div class="lesson-practice-pending"><strong>Uygulama bölümleri henüz tasarlanmadı.</strong><p>Bu ders referans kaliteyle hazırlanırken burada bölüm bölüm çalışmalar açılacak.</p></div>';

  root.innerHTML=
    '<div class="lesson-channel-grid">'+
      '<article class="lesson-channel-card learn '+(learnComplete?'completed':'')+'">'+
        '<div class="lesson-channel-head"><span>01</span><div><small>ÖĞREN</small><h2>Konu anlatımı</h2></div><b>'+esc(learnLabel)+'</b></div>'+
        '<p>Kavramı model, görsel ve açıklamayla adım adım kur.</p>'+
        '<button type="button" class="lesson-channel-action" id="lessonLearnAction">'+(learnComplete?'Yeniden aç':'Öğrenmeye başla')+' <span>→</span></button>'+
      '</article>'+
      '<article class="lesson-channel-card practice '+(!learnComplete?'locked':'')+'">'+
        '<div class="lesson-channel-head"><span>02</span><div><small>UYGULA</small><h2>Bölüm bölüm çalış</h2></div><b>'+esc(practiceLabel)+'</b></div>'+
        '<p>Her beceriyi ayrı çalış. Bölümler sırayla açılır; tamamlanan bölüme geri dönebilirsin.</p>'+
        '<div class="lesson-practice-list">'+sectionRows+'</div>'+
      '</article>'+
      '<article class="lesson-channel-card review '+(reviewReady?'due':'')+'">'+
        '<div class="lesson-channel-head"><span>03</span><div><small>TEKRAR</small><h2>Geri çağır</h2></div><b>'+esc(reviewLabel)+'</b></div>'+
        '<p>Öğrendiklerini daha sonra kısa bir çalışmayla yeniden hatırla.</p>'+
        '<button type="button" class="lesson-channel-action '+(reviewReady?'':'muted')+'" id="lessonReviewAction" '+(reviewReady?'':'disabled')+'>'+(reviewReady?'Tekrarı başlat':esc(reviewLabel))+' <span>→</span></button>'+
      '</article>'+
    '</div>';

  $('#lessonLearnAction')?.addEventListener('click',()=>startLessonChannel(skill.id,'learn'));
  $$('[data-practice-section]').forEach(btn=>btn.addEventListener('click',()=>{
    if(btn.disabled) return;
    startLessonChannel(skill.id,'practice',btn.dataset.practiceSection);
  }));
  $('#lessonReviewAction')?.addEventListener('click',()=>{ if(reviewReady) startLessonChannel(skill.id,'review'); });
}
function practiceSectionPlan(skillId,section,{revisit=false}={}){
  const cycle=Number(section.cycleAttempts)||0;
  let startIndex=0, count=PRACTICE_SECTION_BASE_TASKS;
  if(!revisit){
    if(cycle<PRACTICE_SECTION_BASE_TASKS){ startIndex=cycle; count=PRACTICE_SECTION_BASE_TASKS-cycle; }
    else { startIndex=cycle; count=1; }
  }
  return Array.from({length:count},(_,offset)=>({
    skillId,
    representation:null,
    phase:'practice',
    reviewItem:null,
    kind:'lesson-practice-section',
    conceptScope:'fresh',
    practiceIndex:startIndex+offset,
    practiceSectionId:section.id
  }));
}
function dueReviewPlanForSkill(skillId){
  return dueReviewItems().filter(item=>item.skillId===skillId).slice(0,3).map(item=>({
    skillId,
    representation:item.representation,
    phase:item.phase||'retrieval',
    reviewItem:item,
    kind:'retention',
    conceptScope:'fresh'
  }));
}
function startLessonChannel(skillId,channel,sectionId=null,options={}){
  const skill=runtimeSkillsForProfile(state.profile).find(item=>item.id===skillId);
  if(!skill) return;
  const snapshot=lessonProgressSnapshot(state,skillId);
  if(snapshot.access.status==='locked'){ showToast('Bu ders henüz açılmadı.'); return; }

  let plan=[];
  let section=null;
  if(channel==='learn'){
    plan=[{skillId,representation:null,phase:null,reviewItem:null,kind:'lesson-intro',activityMode:'teach',conceptScope:'fresh',countsTowardEvidence:false}];
  }else if(channel==='practice'){
    section=snapshot.practice.sections.find(item=>item.id===sectionId)||null;
    const index=snapshot.practice.sections.findIndex(item=>item.id===sectionId);
    if(!section||practiceSectionState(snapshot,index)==='locked'){ showToast('Önce sıradaki uygulama bölümünü tamamla.'); return; }
    const revisit=!!section.completedAt;
    if(!revisit&&(section.cycleAttempts||0)>=PRACTICE_SECTION_MAX_TASKS){
      resetPracticeSectionCycle(state,skillId,section.id,{now:Date.now()});
      saveState();
      const refreshed=lessonProgressSnapshot(state,skillId);
      section=refreshed.practice.sections.find(item=>item.id===sectionId);
    }
    plan=practiceSectionPlan(skillId,section,{revisit});
  }else if(channel==='review'){
    plan=dueReviewPlanForSkill(skillId);
    if(!plan.length){ showToast('Bu ders için zamanı gelmiş bir tekrar yok.'); return; }
  }
  if(!plan.length) return;

  pendingLessonLaunch={skillId,channel,sectionId,plan,sectionLabel:section?.label||null,lessonStep:options.lessonStep??null,inspector:!!options.inspector||inspectorSandbox};
  pendingAtlasSkillId=skillId;
  startSession();
}
function appendPracticeSectionRecovery(){
  if(!session?.practiceSectionId) return;
  const snapshot=lessonProgressSnapshot(state,session.focusSkillId);
  const section=snapshot.practice.sections.find(item=>item.id===session.practiceSectionId);
  if(!section||section.completedAt||(section.cycleAttempts||0)>=PRACTICE_SECTION_MAX_TASKS) return;
  session.plan.push({
    skillId:session.focusSkillId,
    representation:null,
    phase:'practice',
    reviewItem:null,
    kind:'lesson-practice-section',
    conceptScope:'fresh',
    practiceIndex:section.cycleAttempts||0,
    practiceSectionId:section.id
  });
}

function cloneState(value){
  if(typeof structuredClone==='function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
function enterInspectorSandbox(){
  if(inspectorSandbox) return;
  inspectorRealState=state;
  state=cloneState(state);
  inspectorSandbox=true;
  inspectorSelectedSkillId=skillsFor(state.profile)[0]?.id||null;
  ensureLearningArchitectureState(state);
  const launcher=$('#inspectorLauncher'); if(launcher) launcher.hidden=false;
  showToast('Test sandboxı açıldı · gerçek ilerleme korunuyor');
}
function exitInspectorSandbox(){
  $('#practiceOverlay')?.classList.remove('open');
  $('#practiceOverlay')?.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  session=null; currentQuestion=null; currentSelection=null; answered=false;
  if(inspectorRealState) state=inspectorRealState;
  inspectorRealState=null; inspectorSandbox=false; inspectorSelectedSkillId=null; activeLessonSkillId=null;
  renderAll(); navigate('home');
  showToast('Test sandboxı kapandı · gerçek ilerleme değişmedi');
}
function inspectorSkillList(){
  return skillsFor(state.profile,{includeHidden:true});
}
function inspectorLessonSteps(skillId){
  if(skillId==='number1000') return NUMBER1000_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='compareOrder1000') return COMPARE_ORDER_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='numberPattern1000') return PATTERN1000_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='oddEven1000') return ODD_EVEN1000_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='nelMatchAttributes') return NEL_MATCH_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='nelSortAttributes') return NEL_SORT_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='nelCompareAttributes') return NEL_COMPARE_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='nelOrderAttributes') return NEL_ORDER_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='nelPatterns') return NEL_PATTERN_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='nelRoteCount20') return NEL_ROTE_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='nelReliableCount10') return NEL_RELIABLE_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  if(skillId==='nelSubitise5') return NEL_SUBITISE_LESSON_STEPS.map((step,index)=>({index,id:step.id,label:(index+1)+'. '+step.title}));
  return [];
}
function inspectorCompletePriorPath(skillId){
  if(state.profile!=='grade2') return;
  const sequence=curriculumUnitsFor('grade2').flatMap(unit=>unit.lessons.map(skill=>skill.id));
  const target=sequence.indexOf(skillId);
  if(target<0) return;
  const base=Date.now()-1000*60*60*24;
  sequence.slice(0,target).forEach((id,index)=>{
    const ss=ensureSkillState(state,id), lc=ss.learningCycle;
    const at=base+index*1000;
    lc.lessonTaughtAt=lc.lessonTaughtAt||at;
    lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,1);
    lc.firstCycleCompletedAt=lc.firstCycleCompletedAt||at;
    lc.lastCycleAt=lc.lastCycleAt||at;
    lessonProgressSnapshot(state,id);
  });
}
function inspectorSetPreset(skillId,preset){
  inspectorCompletePriorPath(skillId);
  if(preset==='fresh'){
    delete state.skills[skillId];
    state.reviewQueue=state.reviewQueue.filter(item=>item.skillId!==skillId);
    ensureSkillState(state,skillId);
  }
  const ss=ensureSkillState(state,skillId), lc=ss.learningCycle;
  const now=Date.now();
  if(preset==='learned'||preset==='practice-ready'){
    lc.lessonTaughtAt=lc.lessonTaughtAt||now-60000;
    lc.lessonStepIndex=Math.max(lc.lessonStepIndex||0,1);
    lc.firstCycleCompletedAt=0;
    lc.retrievalDueAt=0;
    lessonProgressSnapshot(state,skillId);
  }
  if(preset==='completed'||preset==='review-due'){
    lc.lessonTaughtAt=lc.lessonTaughtAt||now-1000*60*60*24;
    lc.firstCycleCompletedAt=lc.firstCycleCompletedAt||now-1000*60*60*20;
    lc.lastCycleAt=lc.lastCycleAt||lc.firstCycleCompletedAt;
    lc.retrievalDueAt=preset==='review-due'?now-1000:now+1000*60*60*20;
    const journey=lessonProgressSnapshot(state,skillId);
    if(preset==='completed'){
      const raw=ensureSkillState(state,skillId).lessonJourney;
      for(const section of Object.values(raw.practice?.sections||{})) section.completedAt=section.completedAt||now-1000*60*60;
    }
    if(preset==='review-due'){
      state.reviewQueue=state.reviewQueue.filter(item=>!(item.skillId===skillId&&item.stage==='next-day'));
      state.reviewQueue.push({
        id:'inspector-review:'+skillId,
        skillId,
        representation:'symbol',
        phase:'retrieval',
        dueAt:now-1000,
        stage:'next-day'
      });
    }
    lessonProgressSnapshot(state,skillId);
  }
  renderInspector();
}
function inspectorPreparePractice(skillId,sectionId){
  inspectorSetPreset(skillId,'practice-ready');
  const snapshot=lessonProgressSnapshot(state,skillId);
  const index=snapshot.practice.sections.findIndex(section=>section.id===sectionId);
  const journey=ensureSkillState(state,skillId).lessonJourney;
  snapshot.practice.sections.forEach((section,i)=>{
    const raw=journey.practice.sections[section.id];
    if(i<index) raw.completedAt=raw.completedAt||Date.now()-10000-i*1000;
    else if(i===index){ raw.completedAt=0; raw.cycleAttempts=0; raw.cycleCorrect=0; }
  });
}
function inspectorPrepareReview(skillId){
  inspectorSetPreset(skillId,'review-due');
}
function appTextIncludesPatternRegrouping(){ return PATTERN1000_LESSON_STEPS.some(step=>step.id==='ten-regroup-boundary'&&String(step.result).includes('10 onluk = 1 yüzlük')); }
function inspectorUiAudit(){
  const checks=[];
  const add=(id,label,pass,detail='')=>checks.push({id,label,pass:!!pass,detail});
  const compareIds=COMPARE_ORDER_LESSON_STEPS.map(step=>step.id);
  add(
    'symbol-teaching-order',
    'Karşılaştırma anlamı sembolden önce öğretiliyor',
    compareIds.indexOf('compare-equal')<compareIds.indexOf('symbol-meaning-match') &&
      compareIds.indexOf('symbol-meaning-match')<compareIds.indexOf('symbol-bridge'),
    compareIds.join(' → ')
  );
  const numberIds=NUMBER1000_LESSON_STEPS.map(step=>step.id);
  add(
    'number-reference-steps',
    '1000’e kadar sayı referans öğretim adımları korunuyor',
    ['ten-bundle','count-tens','count-hundreds','hundred-sense','model-build','place-value','same-digit','zero-place','read-write','word-build'].every(id=>numberIds.includes(id)),
    numberIds.join(' → ')
  );

  const patternIds=PATTERN1000_LESSON_STEPS.map(step=>step.id);
  add(
    'pattern-teaching-order',
    'Örüntüde model → kuralı tarif et → sürdür → eksik sayıyı bul sırası korunuyor',
    patternIds.indexOf('place-change-track')<patternIds.indexOf('describe-up-rule') &&
      patternIds.indexOf('describe-up-rule')<patternIds.indexOf('continue-after-rule') &&
      patternIds.indexOf('continue-after-rule')<patternIds.indexOf('missing-middle'),
    patternIds.join(' → ')
  );
  add(
    'pattern-regroup-boundary',
    'Örüntü öğretimi 10 daha sınırında yeniden gruplamayı gösteriyor',
    patternIds.includes('ten-regroup-boundary') && appTextIncludesPatternRegrouping(),
    '290 → 300: 9 onluk + 1 onluk = 10 onluk = 1 yüzlük.'
  );
  add(
    'pattern-no-multiplication',
    'P2 örüntü öğretimi çarpma/ritmik sayma konusuna taşmıyor',
    !PATTERN1000_LESSON_STEPS.some(step=>/[×x]|katına|çarp/i.test([step.title,step.body,step.result].join(' '))),
    'Bu ders ±1, ±10 ve ±100 basamak değişiminde kalır.'
  );
  const oddIds=ODD_EVEN1000_LESSON_STEPS.map(step=>step.id);
  add(
    'odd-even-teaching-order',
    'Tek–çift öğretiminde eşleştirme anlamı birlik-rakamı kuralından önce geliyor',
    oddIds.indexOf('pair-six')<oddIds.indexOf('ones-decide') &&
      oddIds.indexOf('ones-decide')<oddIds.indexOf('even-endings') &&
      oddIds.indexOf('even-endings')<oddIds.indexOf('classify-three-digit'),
    oddIds.join(' → ')
  );
  add(
    'odd-even-no-future-topics',
    'Tek–çift öğretimi çarpma/bölme/asal diline taşmıyor',
    !ODD_EVEN1000_LESSON_STEPS.some(step=>/[×÷]|asal|bölünebilir|çarpım|çarpma|katına|faktör/i.test([step.title,step.body,step.result].join(' '))),
    'Pairing → birlik basamağı → Tek/Çift sınıflandırması.'
  );
  const probe=document.createElement('div');
  probe.style.cssText='position:fixed;left:-9999px;top:-9999px;visibility:hidden';
  probe.innerHTML='<i class="lesson-unit-hundred"></i><i class="lesson-unit-ten"></i>';
  document.body.append(probe);
  const hundred=getComputedStyle(probe.children[0]).backgroundSize.replace(/\s+/g,' ');
  const ten=getComputedStyle(probe.children[1]).backgroundSize.replace(/\s+/g,' ');
  add('hundred-grid','Yüzlük model 10×10 ızgara sözleşmesini taşıyor',hundred.includes('10% 100%')&&hundred.includes('100% 10%'),hundred);
  add('ten-grid','Onluk model 10 eş bölme sözleşmesini taşıyor',ten.includes('100% 10%'),ten);
  probe.remove();
  add('touch-drop','Sürükle-bırak hedefi pointer-capture’dan bağımsız çözülüyor',typeof dropTargetAtPoint==='function','getBoundingClientRect tabanlı hedefleme');
  if(state.profile==='preschool'){
    const nelText=[...NEL_MATCH_LESSON_STEPS,...NEL_SORT_LESSON_STEPS].map(step=>[step.title,step.body,step.result].join(' ')).join(' ');
    add('nel-no-primary-symbols','NEL eşleştirme/sınıflama dersleri formal < > + − = öğretimine taşmıyor',!/[<>+−=]/.test(nelText),'Okul öncesi ortak özellik ve sınıflama dilinde kalır.');
  }
  return checks;
}
function inspectorStateSummary(skillId){
  const snapshot=lessonProgressSnapshot(state,skillId);
  return {
    access:snapshot.access.status,
    learn:snapshot.learn.status,
    practice:snapshot.practice.status,
    practiceProgress:snapshot.practice.completedSections+' / '+snapshot.practice.totalSections,
    review:snapshot.review.status,
    firstCycle:!!ensureSkillState(state,skillId).learningCycle?.firstCycleCompletedAt,
    provisional:snapshot.provisional
  };
}
function renderInspector(){
  const body=$('#inspectorBody');
  if(!body||!inspectorSandbox) return;
  const list=inspectorSkillList();
  if(!list.some(skill=>skill.id===inspectorSelectedSkillId)) inspectorSelectedSkillId=list[0]?.id||null;
  const skill=list.find(item=>item.id===inspectorSelectedSkillId)||null;
  if(!skill){ body.innerHTML='<p>Bu profilde incelenecek ders yok.</p>'; return; }
  const snapshot=lessonProgressSnapshot(state,skill.id);
  const steps=inspectorLessonSteps(skill.id);
  const audit=runPedagogyStateAudit(state);
  const uiChecks=inspectorUiAudit();
  const allChecks=[...audit.checks,...uiChecks];
  const pass=allChecks.filter(check=>check.pass).length;
  const fail=allChecks.length-pass;
  const summary=inspectorStateSummary(skill.id);
  const contract=lessonContractFor(skill.id);

  $('#inspectorProfileLabel').textContent=PROFILE_META[state.profile]?.label||state.profile;
  $('#inspectorAuditBadge').textContent=fail?fail+' sorun':pass+' kontrol temiz';
  $('#inspectorAuditBadge').classList.toggle('fail',!!fail);

  body.innerHTML=
    '<div class="inspector-grid">'+
      '<section class="inspector-panel inspector-controls">'+
        '<div class="inspector-panel-title"><span>SANDBOX</span><h2>Dersi doğrudan aç</h2><small>Gerçek local state yazılmaz.</small></div>'+
        '<label><span>Sınıf / profil</span><select id="inspectorProfile">'+
          Object.entries(PROFILE_META).map(([id,meta])=>'<option value="'+esc(id)+'" '+(id===state.profile?'selected':'')+'>'+esc(meta.label)+'</option>').join('')+
        '</select></label>'+
        '<label><span>Ders</span><select id="inspectorSkill">'+
          list.map(item=>'<option value="'+esc(item.id)+'" '+(item.id===skill.id?'selected':'')+'>'+esc(item.label)+'</option>').join('')+
        '</select></label>'+
        '<label><span>Durum simülasyonu</span><select id="inspectorPreset">'+
          '<option value="fresh">Bu dersi sıfırla / sıradaki yap</option>'+
          '<option value="practice-ready">Öğren tamam · Uygula hazır</option>'+
          '<option value="completed">Ders tamamlandı</option>'+
          '<option value="review-due">Tekrar zamanı geldi</option>'+
        '</select></label>'+
        '<button class="inspector-action" id="inspectorApplyPreset">Durumu uygula</button>'+
        '<div class="inspector-summary">'+Object.entries(summary).map(([key,value])=>'<span><small>'+esc(key)+'</small><b>'+esc(value)+'</b></span>').join('')+'</div>'+
      '</section>'+
      '<section class="inspector-panel">'+
        '<div class="inspector-panel-title"><span>ÖĞREN</span><h2>Öğretim adımına atla</h2><small>'+esc(skill.label)+'</small></div>'+
        (steps.length
          ? '<label><span>Adım</span><select id="inspectorLessonStep">'+steps.map(step=>'<option value="'+step.index+'">'+esc(step.label)+'</option>').join('')+'</select></label><button class="inspector-action" id="inspectorLaunchLearn">Bu adımdan aç</button>'
          : '<div class="inspector-note">Bu ders için henüz özel referans Öğren adımları tanımlanmadı.</div>')+
        '<button class="inspector-secondary" id="inspectorOpenCenter">Ders Merkezi’ni aç</button>'+
      '</section>'+
      '<section class="inspector-panel">'+
        '<div class="inspector-panel-title"><span>UYGULA</span><h2>Bölüme doğrudan git</h2><small>'+snapshot.practice.completedSections+' / '+snapshot.practice.totalSections+' bölüm</small></div>'+
        (contract.practice?.sections?.length
          ? '<label><span>Uygulama bölümü</span><select id="inspectorPracticeSection">'+contract.practice.sections.map(section=>'<option value="'+esc(section.id)+'">'+esc(section.label)+'</option>').join('')+'</select></label><button class="inspector-action" id="inspectorLaunchPractice">Bölümü test et</button>'
          : '<div class="inspector-note">Bu dersin bölüm sözleşmesi henüz provisional.</div>')+
        '<button class="inspector-secondary" id="inspectorLaunchReview">Tekrarı zamanı gelmiş gibi aç</button>'+
      '</section>'+
      '<section class="inspector-panel inspector-audit">'+
        '<div class="inspector-panel-title"><span>QA</span><h2>Pedagojik sözleşmeler</h2><small>'+pass+' geçti · '+fail+' sorun</small></div>'+
        '<div class="inspector-checks">'+allChecks.map(check=>'<article class="'+(check.pass?'pass':'fail')+'"><b>'+(check.pass?'✓':'!')+'</b><div><strong>'+esc(check.label)+'</strong><small>'+esc(check.detail)+'</small></div></article>').join('')+'</div>'+
      '</section>'+
    '</div>';

  $('#inspectorProfile')?.addEventListener('change',e=>{
    state.profile=e.target.value;
    ensureLearningArchitectureState(state);
    inspectorSelectedSkillId=skillsFor(state.profile)[0]?.id||null;
    renderAll(); renderInspector();
  });
  $('#inspectorSkill')?.addEventListener('change',e=>{ inspectorSelectedSkillId=e.target.value; renderInspector(); });
  $('#inspectorApplyPreset')?.addEventListener('click',()=>inspectorSetPreset(skill.id,$('#inspectorPreset').value));
  $('#inspectorOpenCenter')?.addEventListener('click',()=>{
    inspectorCompletePriorPath(skill.id);
    activeLessonSkillId=skill.id;
    navigate('lessonCenter');
  });
  $('#inspectorLaunchLearn')?.addEventListener('click',()=>{
    inspectorCompletePriorPath(skill.id);
    const lessonStep=Number($('#inspectorLessonStep')?.value||0);
    startLessonChannel(skill.id,'learn',null,{lessonStep});
  });
  $('#inspectorLaunchPractice')?.addEventListener('click',()=>{
    const sectionId=$('#inspectorPracticeSection')?.value;
    if(!sectionId) return;
    inspectorPreparePractice(skill.id,sectionId);
    startLessonChannel(skill.id,'practice',sectionId,{inspector:true});
  });
  $('#inspectorLaunchReview')?.addEventListener('click',()=>{
    inspectorPrepareReview(skill.id);
    startLessonChannel(skill.id,'review',null,{inspector:true});
  });
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
  const allowed=new Set(runtimeSkillsForProfile(state.profile).map(s=>s.id));
  const now=Date.now();
  return state.reviewQueue.filter(x=>allowed.has(x.skillId) && x.dueAt<=now && x.stage==='next-day').sort((a,b)=>a.dueAt-b.dueAt);
}
function dueSameSessionReview(includeFuture=false){
  if(!session) return null;
  const allowed=new Set(runtimeSkillsForProfile(state.profile).map(s=>s.id));
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
function buildSessionPlan(focus,{includeDueReview=true}={}){
  const plan=[];
  const due=includeDueReview?dueReviewItems()[0]:null;
  if(due){
    const s=runtimeSkillsForProfile(state.profile).find(x=>x.id===due.skillId);
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
      const lessonFirst=LESSON_FIRST_SKILLS.has(focus.skill.id);
      const readiness=learningPlan.find(item=>item.phase==='readiness');
      if(!focus.state.learningCycle?.lessonTaughtAt) plan.push({skillId:focus.skill.id,representation:null,phase:null,reviewItem:null,kind:'lesson-intro',activityMode:'teach',conceptScope:'fresh',countsTowardEvidence:false});
      if(!lessonFirst&&readiness) plan.push({skillId:focus.skill.id,reviewItem:null,...readiness});
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
  const lessonLaunch=pendingLessonLaunch; pendingLessonLaunch=null;
  const requestedSkillId=lessonLaunch?.skillId||pendingAtlasSkillId; pendingAtlasSkillId=null;
  const requestedSkill=requestedSkillId?runtimeSkillsForProfile(state.profile).find(s=>s.id===requestedSkillId):null;
  const requestedFocus=requestedSkill?{skill:requestedSkill,state:ensureSkillState(state,requestedSkill.id)}:null;
  const compareSkill=state.profile==='grade2'?runtimeSkillsForProfile(state.profile).find(s=>s.id==='compareOrder1000'):null;
  const compareState=compareSkill?ensureSkillState(state,'compareOrder1000'):null;
  const replayCompareRevision=!!(compareSkill&&compareState?.learningCycle?.firstCycleCompletedAt&&compareState.learningCycle.lessonVersion!==COMPARE_ORDER_LESSON_VERSION&&(!requestedSkillId||requestedSkillId==='compareOrder1000'));
  const focus=requestedFocus||(replayCompareRevision?{skill:compareSkill,state:compareState}:pickFocus()); if(!focus){ showToast('Bu seviye için içerik bulunamadı'); return; }
  if(focus.skill.id==='nelMatchAttributes'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==NEL_MATCH_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    focus.state.learningCycle.lessonVersion=NEL_MATCH_LESSON_VERSION;
    saveState();
  }
  if(focus.skill.id==='nelSortAttributes'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==NEL_SORT_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    focus.state.learningCycle.lessonVersion=NEL_SORT_LESSON_VERSION;
    saveState();
  }
  if(focus.skill.id==='nelCompareAttributes'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==NEL_COMPARE_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    focus.state.learningCycle.lessonVersion=NEL_COMPARE_LESSON_VERSION;
    saveState();
  }
  if(focus.skill.id==='nelOrderAttributes'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==NEL_ORDER_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    focus.state.learningCycle.lessonVersion=NEL_ORDER_LESSON_VERSION;
    saveState();
  }
  if(focus.skill.id==='nelPatterns'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==NEL_PATTERN_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    focus.state.learningCycle.lessonVersion=NEL_PATTERN_LESSON_VERSION;
    saveState();
  }
  if(focus.skill.id==='nelRoteCount20'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==NEL_ROTE_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    focus.state.learningCycle.lessonVersion=NEL_ROTE_LESSON_VERSION;
    saveState();
  }
  if(focus.skill.id==='nelReliableCount10'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==NEL_RELIABLE_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;focus.state.learningCycle.lessonTaughtAt=0;focus.state.learningCycle.lessonVersion=NEL_RELIABLE_LESSON_VERSION;saveState();
  }
  if(focus.skill.id==='nelSubitise5'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==NEL_SUBITISE_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;focus.state.learningCycle.lessonTaughtAt=0;focus.state.learningCycle.lessonVersion=NEL_SUBITISE_LESSON_VERSION;saveState();
  }
  if(focus.skill.id==='number1000'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==NUMBER1000_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    focus.state.learningCycle.lessonVersion=NUMBER1000_LESSON_VERSION;
    saveState();
  }
  if(focus.skill.id==='compareOrder1000'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==COMPARE_ORDER_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    focus.state.learningCycle.lessonVersion=COMPARE_ORDER_LESSON_VERSION;
    saveState();
  }
  if(focus.skill.id==='numberPattern1000'&&!focus.state.learningCycle?.firstCycleCompletedAt&&focus.state.learningCycle?.lessonVersion!==PATTERN1000_LESSON_VERSION){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    focus.state.learningCycle.lessonVersion=PATTERN1000_LESSON_VERSION;
    saveState();
  }
  const focusDifficulty=focus.state.difficulty||1;
  const focusConcept=createConceptInstance(focus.skill.id,focusDifficulty,Math.random);
  if(replayCompareRevision){
    focus.state.learningCycle.lessonStepIndex=0;
    focus.state.learningCycle.lessonTaughtAt=0;
    saveState();
  }
  const plan=lessonLaunch?.plan||(replayCompareRevision?[{skillId:'compareOrder1000',representation:null,phase:null,reviewItem:null,kind:'lesson-intro',activityMode:'teach',conceptScope:'fresh',countsTowardEvidence:false}]:buildSessionPlan(focus,{includeDueReview:!requestedFocus}));
  session={
    startedAt:Date.now(), focusSkillId:focus.skill.id, focusConcept, plan, planIndex:0,
    focusRepresentations:plan.filter(x=>x.kind==='focus').map(x=>x.representation),
    requiresLearningCompletion:lessonLaunch?false:!!(supportsLearningCycle(focus.skill.id)&&!focus.state.learningCycle?.firstCycleCompletedAt),
    lessonStepIndex:focus.state.learningCycle?.lessonStepIndex||0,
    lessonReplay:lessonLaunch?.channel==='learn',
    lessonReplayStep:lessonLaunch?.lessonStep??null,
    inspectorLaunch:!!lessonLaunch?.inspector,
    lessonCenterReturn:!!lessonLaunch,
    lessonChannel:lessonLaunch?.channel||null,
    practiceSectionId:lessonLaunch?.sectionId||null,
    practiceSectionLabel:lessonLaunch?.sectionLabel||null,
    practiceSectionAttempts:0,
    practiceSectionCorrect:0,
    practiceSectionCompleted:false,
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
  const skill=runtimeSkillsForProfile(state.profile).find(s=>s.id===review.skillId); if(!skill) return;
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
  const skill=runtimeSkillsForProfile(state.profile).find(s=>s.id===currentSelection.skillId);
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

  if(currentSelection.kind==='lesson-practice-section'){
    currentQuestion=generateLessonPracticeQuestion(
      skill.id,
      currentSelection.practiceSectionId,
      currentSelection.practiceIndex??0,
      ss.difficulty||1,
      Math.random
    );
    rememberQuestionSignature(currentQuestion);
  } else if(currentSelection.phase && supportsLearningCycle(skill.id)){
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
  if(['model','representation','symbol','reasoning'].includes(selection?.phase)) return {label:'BİRLİKTE UYGULA',mode:'guided'};
  if(selection?.phase==='retrieval'||selection?.kind==='retention') return {label:'KISA TEKRAR',mode:'review'};
  return {label:'KENDİN DENE',mode:'check'};
}
function renderPracticeHeader(skill){
  $('#practiceContent')?.classList.remove('reliable-count-practice','subitise-practice');
  const total=session?.plan?.length||1;
  const activity=practiceActivityMeta();
  $('#practiceLens').textContent=`${PROFILE_META[state.profile].label.toUpperCase()} • ${skill.family.toUpperCase()}`;
  $('#practiceTitle').textContent=skill.label;
  $('#practiceMode').textContent=activity.label;
  $('#practiceMode').dataset.mode=activity.mode;

  if(skill.id==='number1000'&&currentSelection?.kind!=='retention'){
    const guidedPhases=['model','representation','symbol','reasoning'];
    const independentPhases=['context','practice'];
    if(currentSelection?.kind==='lesson-intro'){
      $('#practiceCounter').textContent='KONU ANLATIMI';
      $('#practiceProgress').style.width='8%';
      return;
    }
    if(guidedPhases.includes(currentSelection?.phase)){
      const guided=session.plan.filter(x=>guidedPhases.includes(x.phase)&&x.skillId===skill.id);
      const at=Math.max(0,guided.indexOf(currentSelection));
      $('#practiceCounter').textContent=`BİRLİKTE ${at+1} / ${Math.max(1,guided.length)}`;
      $('#practiceProgress').style.width=`${35+Math.round((at+1)/Math.max(1,guided.length)*30)}%`;
      return;
    }
    if(independentPhases.includes(currentSelection?.phase)){
      const independent=session.plan.filter(x=>independentPhases.includes(x.phase)&&x.skillId===skill.id);
      const at=Math.max(0,independent.indexOf(currentSelection));
      $('#practiceCounter').textContent=`KENDİN DENE ${at+1} / ${Math.max(1,independent.length)}`;
      $('#practiceProgress').style.width=`${66+Math.round((at+1)/Math.max(1,independent.length)*30)}%`;
      return;
    }
  }

  $('#practiceCounter').textContent=`${Math.min(session.planIndex+1,total)} / ${total}`;
  $('#practiceProgress').style.width=`${Math.round(session.planIndex/Math.max(1,total)*100)}%`;
}
function renderLessonIntro(skill){
  if(skill.id==='nelMatchAttributes'){ renderNelMatchLessonStep(skill); return; }
  if(skill.id==='nelSortAttributes'){ renderNelSortLessonStep(skill); return; }
  if(skill.id==='nelCompareAttributes'){ renderNelCompareLessonStep(skill); return; }
  if(skill.id==='nelOrderAttributes'){ renderNelOrderLessonStep(skill); return; }
  if(skill.id==='nelPatterns'){ renderNelPatternLessonStep(skill); return; }
  if(skill.id==='nelRoteCount20'){ renderNelRoteLessonStep(skill); return; }
  if(skill.id==='nelReliableCount10'){ renderNelReliableLessonStep(skill); return; }
  if(skill.id==='nelSubitise5'){ renderNelSubitiseLessonStep(skill); return; }
  if(skill.id==='number1000'){ renderNumber1000LessonStep(skill); return; }
  if(skill.id==='compareOrder1000'){ renderCompareOrderLessonStep(skill); return; }
  if(skill.id==='numberPattern1000'){ renderPattern1000LessonStep(skill); return; }
  if(skill.id==='oddEven1000'){ renderOddEven1000LessonStep(skill); return; }
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
function renderPatternRuleGate(q,rule){
  const options=[1,-1,10,-10,100,-100].map(step=>'Her adımda '+Math.abs(step)+' '+(step>0?'daha.':'daha az.'));
  $('#patternResponseGate').innerHTML='<p>Önce dizinin kuralını sözcükle söyle.</p><div class="pattern-rule-bank">'+options.map(value=>'<button type="button" class="pattern-rule-chip" data-rule-choice="'+esc(value)+'">'+esc(value)+'</button>').join('')+'</div><p id="patternRuleFeedback" aria-live="polite"></p>';
  $$('[data-rule-choice]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.ruleChoice!==rule){
      if(!usedHint){usedHint=true;session.hints++;}
      $('#patternRuleFeedback').textContent='İki komşu sayıyı karşılaştır: miktar artıyor mu, azalıyor mu? Değişim 1, 10 veya 100 mü?';
      return;
    }
    $('#visualStage').innerHTML=renderVisual(q.visual,q);
    $('#patternResponseGate').innerHTML='<p class="teaching-note">'+esc(rule)+'</p>'+renderResponse(q);
    wireResponse(q); wireManipulator(q);
  }));
}
function renderQuestion(){
  const q=currentQuestion, s=currentSelection.skill, rep=q.representation;
  renderPracticeHeader(s);
  const patternRule=patternContinuationRule(q);
  const initialVisual=patternRule&&q.visual.type==='pattern-step-interactive'?{type:'sequence',items:q.visual.seq}:q.visual;
  const reliableCount=q.skillId==='nelReliableCount10',subitise=q.skillId==='nelSubitise5';
  $('#practiceContent').classList.toggle('reliable-count-practice',reliableCount);
  $('#practiceContent').classList.toggle('subitise-practice',subitise);
  $('#practiceContent').innerHTML=`
    <div class="question-stage ${reliableCount?'reliable-count-question-stage':''} ${subitise?'subitise-question-stage':''}">
      <h2>${esc(q.prompt)}</h2>
      ${q.teachingNote?`<div class="teaching-note">${esc(q.teachingNote)}</div>`:''}
      <div class="visual-stage ${q.response?.kind==='visual-choice'?'reference-stage':''} ${reliableCount?'reliable-count-stage':''} ${subitise?'subitise-stage':''}" id="visualStage">${renderVisual(initialVisual,q)}</div>
      <div id="patternResponseGate">${patternRule?'':renderResponse(q)}</div>
      <div class="question-tools"><button class="tool-button" id="hintButton">İpucu göster</button>${state.settings.voice?'<button class="tool-button" id="inlineSpeak">Sesli oku</button>':''}</div>
    </div>`;
  if(patternRule) renderPatternRuleGate(q,patternRule); else wireResponse(q);
  $('#hintButton').addEventListener('click',showHint);
  $('#inlineSpeak')?.addEventListener('click',speakCurrent);
  if(!patternRule) wireManipulator(q);
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
  if(['nel-subitise-flash-build','nel-subitise-flash-audio','nel-subitise-flash-match','nel-subitise-flash-explain'].includes(interaction)) bindNelSubitiseRoot($('.nel-subitise-root'),()=>updateManipulatorStatus(q),()=>answered);
  if(interaction==='nel-reliable-count-set') bindNelReliableCountSet($('.nel-reliable-count-set'),()=>updateManipulatorStatus(q),()=>answered);
  if(interaction==='nel-reliable-next-word') bindNelReliableNextWord($('.nel-reliable-next-word'),()=>updateManipulatorStatus(q),()=>answered);
  if(interaction==='nel-reliable-cardinality') bindNelReliableCardinality($('.nel-reliable-cardinality'),()=>updateManipulatorStatus(q),()=>answered);
  if(interaction==='nel-reliable-order-proof') bindNelReliableOrderProof($('.nel-reliable-order-proof'),()=>updateManipulatorStatus(q),()=>answered);
  if(interaction==='nel-rote-sequence'){
    const root=$('.nel-rote-sequence-builder');
    bindNelRoteSequenceRoot(root,()=>updateManipulatorStatus(q),()=>answered);
  }
  if(interaction==='nel-rote-audio-choice'||interaction==='nel-rote-phrase-choice'){
    const root=$(interaction==='nel-rote-phrase-choice'?'.nel-rote-phrase-choice':'.nel-rote-audio-choice');
    bindNelRoteChoiceRoot(root,()=>updateManipulatorStatus(q),()=>answered);
  }
  if(interaction==='nel-pattern-build'){
    const root=$('.nel-pattern-builder');
    bindNelPatternRoot(root,()=>updateManipulatorStatus(q),()=>answered);
  }
  if(interaction==='nel-order-sequence'){
    const root=$('.nel-order-builder');
    bindNelOrderRoot(root,()=>updateManipulatorStatus(q),()=>answered);
  }
  if(interaction==='nel-sort-bin'){
    const root=$('.nel-sort-builder');
    let selected=null;
    root?.querySelectorAll('[data-nel-sort-item]').forEach(item=>item.addEventListener('click',()=>{
      if(answered) return;
      root.querySelectorAll('[data-nel-sort-item]').forEach(x=>x.classList.remove('selected'));
      item.classList.add('selected'); selected=item;
      updateManipulatorStatus(q);
    }));
    root?.querySelectorAll('[data-nel-sort-bin]').forEach(bin=>bin.addEventListener('click',()=>{
      if(answered||!selected) return;
      const target=root.querySelector('[data-nel-sort-bin-items="'+CSS.escape(bin.dataset.nelSortBin)+'"]');
      selected.dataset.assigned=bin.dataset.nelSortBin;
      selected.classList.remove('selected'); selected.classList.add('placed');
      target?.appendChild(selected); selected=null;
      if(root.querySelectorAll('[data-nel-sort-item]:not([data-assigned])').length===0) root.classList.add('complete');
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='nel-compare-pair'){
    const root=$('.nel-compare-builder');
    root?.querySelector('.nel-compare-align')?.addEventListener('click',()=>{
      if(answered)return;
      root.classList.add('aligned');
      root.querySelectorAll('[data-nel-compare-value]').forEach(button=>button.disabled=false);
      updateManipulatorStatus(q);
    });
    root?.querySelectorAll('[data-nel-compare-value]').forEach(button=>button.addEventListener('click',()=>{
      if(answered||button.disabled)return;
      root.querySelectorAll('[data-nel-compare-value]').forEach(x=>x.classList.remove('selected'));
      button.classList.add('selected'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='nel-match-pair'){
    const root=$('.nel-match-builder');
    root?.querySelectorAll('[data-nel-match-value]').forEach(button=>button.addEventListener('click',()=>{
      if(answered) return;
      root.querySelectorAll('[data-nel-match-value]').forEach(x=>x.classList.remove('selected'));
      button.classList.add('selected'); updateManipulatorStatus(q);
    }));
  }
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
  if(['nel-subitise-flash-build','nel-subitise-flash-audio','nel-subitise-flash-match','nel-subitise-flash-explain'].includes(interaction)) return nelSubitiseRead($('.nel-subitise-root'));
  if(interaction==='nel-reliable-count-set') return nelReliableReadCountSet($('.nel-reliable-count-set'));
  if(interaction==='nel-reliable-next-word') return $('.nel-reliable-next-word')?.dataset.reliableSelected ?? null;
  if(interaction==='nel-reliable-cardinality') return nelReliableReadCardinality($('.nel-reliable-cardinality'));
  if(interaction==='nel-reliable-order-proof') return nelReliableReadOrderProof($('.nel-reliable-order-proof'));
  if(interaction==='nel-rote-sequence') return nelRoteReadSequenceRoot($('.nel-rote-sequence-builder'));
  if(interaction==='nel-rote-audio-choice') return $('.nel-rote-audio-choice')?.dataset.roteSelected ?? null;
  if(interaction==='nel-rote-phrase-choice') return $('.nel-rote-phrase-choice')?.dataset.roteSelected ?? null;
  if(interaction==='nel-pattern-build') return nelPatternReadRoot($('.nel-pattern-builder'));
  if(interaction==='nel-order-sequence') return nelOrderReadRoot($('.nel-order-builder'));
  if(interaction==='nel-sort-bin'){
    const root=$('.nel-sort-builder'); if(!root) return null;
    const items=[...root.querySelectorAll('[data-nel-sort-item]')];
    if(!items.length||items.some(item=>!item.dataset.assigned)) return null;
    return items.map(item=>item.dataset.nelSortItem+':'+item.dataset.assigned).sort().join('|');
  }
  if(interaction==='nel-compare-pair'){
    const root=$('.nel-compare-builder'); if(!root) return null;
    const requiresAlign=root.dataset.requiresAlign==='true';
    if(requiresAlign&&!root.classList.contains('aligned')) return null;
    const value=root.querySelector('[data-nel-compare-value].selected')?.dataset.nelCompareValue;
    if(value==null) return null;
    return (requiresAlign?'aligned|':'')+value;
  }
  if(interaction==='nel-match-pair') return $('.nel-match-builder [data-nel-match-value].selected')?.dataset.nelMatchValue ?? null;
  if(interaction==='twentyframe-build') return $('.interactive-twentyframe .added').length;
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
  if(['nel-subitise-flash-build','nel-subitise-flash-audio','nel-subitise-flash-match','nel-subitise-flash-explain'].includes(q.response?.interaction)){
    const root=$('.nel-subitise-root'),ready=root?.dataset.flashReady==='true';
    if(!ready) node.textContent='Önce kısa görüntüyü aç.';
    else if(q.response?.interaction==='nel-subitise-flash-build'){const count=root?.querySelectorAll('.nel-subitise-build-token.selected').length||0;node.textContent=count?count+' taş seçtin. Şimdi kontrol et.':'Gördüğün kadar taşı seç.';}
    else node.textContent=value?'Bir cevap seçtin. Şimdi kontrol et.':'Kısa görüntüde fark ettiğin miktarı seç.';
  }
  else if(q.response?.interaction==='nel-reliable-count-set'){
    const root=$('.nel-reliable-count-set'),all=root?.querySelectorAll('[data-reliable-item]').length||0,counted=root?.querySelectorAll('[data-reliable-item].counted').length||0;node.textContent=counted===all&&all?'Bütün nesneler bir kez sayıldı. Şimdi kontrol et.':counted+' / '+all+' nesne sayıldı.';
  }
  else if(q.response?.interaction==='nel-reliable-next-word') node.textContent=value?'Bir sayı adı seçtin. Şimdi kontrol et.':'Sıradaki sayı adını dinle ve seç.';
  else if(q.response?.interaction==='nel-reliable-cardinality') node.textContent=value?'Sayma ve toplam seçimi hazır. Şimdi kontrol et.':'Önce bütün nesneleri say, sonra son sayı adını toplam olarak seç.';
  else if(q.response?.interaction==='nel-reliable-order-proof') node.textContent=value?'İki sayma turu ve açıklama hazır. Şimdi kontrol et.':'Aynı kümeyi iki yönden say ve açıklamayı seç.';
  else if(q.response?.interaction==='nel-rote-sequence'){
    const root=$('.nel-rote-sequence-builder'),total=root?.querySelectorAll('[data-rote-item]').length||0,placed=root?.querySelectorAll('[data-rote-item][data-order-index]').length||0;
    node.textContent=placed===total&&total?'Sayı adı sırası hazır. Şimdi kontrol et.':placed+' / '+total+' sayı adı sıraya yerleştirildi.';
  }
  else if(q.response?.interaction==='nel-rote-audio-choice'||q.response?.interaction==='nel-rote-phrase-choice') node.textContent=value?'Bir sesli seçenek seçtin. Şimdi kontrol et.':'Seçenekleri dinle ve birini seç.';
  else if(q.response?.interaction==='nel-pattern-build'){
    const root=$('.nel-pattern-builder'),total=root?.querySelectorAll('[data-pattern-slot]').length||0,placed=root?.querySelectorAll('[data-pattern-slot][data-pattern-value]').length||0;
    node.textContent=placed===total&&total?'Örüntü hazır. Şimdi kontrol et.':placed+' / '+total+' parça yerleştirildi.';
  }
  else if(q.response?.interaction==='nel-order-sequence'){
    const root=$('.nel-order-builder'),total=root?.querySelectorAll('[data-nel-order-item]').length||0,placed=root?.querySelectorAll('[data-nel-order-item][data-order-index]').length||0;
    node.textContent=placed===total&&total?'Sıra hazır. Şimdi kontrol et.':placed+' / '+total+' kart sıraya yerleştirildi.';
  }
  else if(q.response?.interaction==='nel-sort-bin'){
    const root=$('.nel-sort-builder'), total=root?.querySelectorAll('[data-nel-sort-item]').length||0, placed=root?.querySelectorAll('[data-nel-sort-item][data-assigned]').length||0;
    node.textContent=placed===total&&total?'Bütün nesneler kutularda. Şimdi kontrol et.':placed+' / '+total+' nesne sınıflandı.';
  }
  else if(q.response?.interaction==='nel-compare-pair'){
    const root=$('.nel-compare-builder'), requiresAlign=root?.dataset.requiresAlign==='true';
    if(requiresAlign&&!root?.classList.contains('aligned')) node.textContent='Önce başlangıçları hizala.';
    else node.textContent=value?'Bir karşılaştırma seçtin. Şimdi kontrol et.':'Doğru karşılaştırma cümlesini seç.';
  }
  else if(q.response?.interaction==='nel-match-pair') node.textContent=value?'Bir eş seçtin. Şimdi kontrol et.':'Hedefe uygun eşi seç.';
  else if(q.response?.interaction==='twentyframe-build') node.textContent=`Kurduğun miktar: ${value}`;
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
  let lessonSectionDecision=null;
  if(session?.practiceSectionId&&currentSelection?.kind==='lesson-practice-section'){
    const snapshot=lessonProgressSnapshot(state,q.skillId);
    const sectionIndex=snapshot.practice.sections.findIndex(item=>item.id===session.practiceSectionId);
    const sectionState=sectionIndex>=0?snapshot.practice.sections[sectionIndex]:null;
    const projectedAttempts=(sectionState?.cycleAttempts||0)+1;
    const projectedCorrect=(sectionState?.cycleCorrect||0)+(correct?1:0);
    const completeNow=practiceSectionCompletionAllowed(projectedAttempts,projectedCorrect,correct);
    const priorComplete=sectionIndex>0?snapshot.practice.sections.slice(0,sectionIndex).every(item=>item.completedAt):true;
    const finalSection=sectionIndex===snapshot.practice.sections.length-1;
    if(completeNow&&priorComplete&&finalSection&&!ensureSkillState(state,q.skillId).learningCycle?.firstCycleCompletedAt) q.cycleFinal=true;
    lessonSectionDecision={completeNow,projectedAttempts,projectedCorrect};
  }
  const delayed=currentSelection.reviewItem?.stage==='next-day';
  applyAnswer(state,q,{correct,usedHint,isDelayedReview:!!delayed,now:Date.now(),sessionQuestionIndex:session.questionIndex});
  session.learningEvents.push(event);
  if(lessonSectionDecision){
    recordPracticeSectionAttempt(state,q.skillId,session.practiceSectionId,{correct,complete:lessonSectionDecision.completeNow,now:Date.now()});
    session.practiceSectionAttempts++;
    if(correct) session.practiceSectionCorrect++;
    if(lessonSectionDecision.completeNow) session.practiceSectionCompleted=true;
    else if(lessonSectionDecision.projectedAttempts>=PRACTICE_SECTION_BASE_TASKS&&lessonSectionDecision.projectedAttempts<PRACTICE_SECTION_MAX_TASKS) appendPracticeSectionRecovery();
  }
  if(practiceDecision&&!q.cycleFinal) appendAdaptivePractice(practiceDecision);
  if(currentSelection.reviewItem) consumeReview(state,currentSelection.reviewItem);
  const after=ensureSkillState(state,q.skillId).stable;
  if(!before&&after) session.newStable++;
  session.effortUsed+=(q.effort||1)*(usedHint?1.12:1);
  if(correct) session.correct++; else session.wrong++;
  saveState();
  const lessonFlow=['number1000','compareOrder1000'].includes(q.skillId)&&currentSelection?.kind!=='retention';
  setTimeout(()=>lessonFlow?renderLessonFlowFeedback(correct):(correct?renderCorrectFeedback():renderBridgeFeedback()),260);
}
function feedbackMathStatement(q){
  return String(q?.explain||q?.feedbackTitle||'').trim();
}
function renderLessonFlowFeedback(correct){
  const q=currentQuestion;
  const tools=$('.question-tools');
  if(!tools){ correct?renderCorrectFeedback():renderBridgeFeedback(); return; }
  const detail=correct?feedbackMathStatement(q):String(q.hint||'').trim();
  const relation=!correct&&q.explain?'<small>'+esc(q.explain)+'</small>':'';
  tools.outerHTML='<div class="lesson-flow-feedback '+(correct?'is-correct':'is-support')+'" id="lessonFlowFeedback"><div><span>'+(correct?'SONUÇ':'BURAYA BAK')+'</span><strong>'+esc(detail)+'</strong>'+relation+'</div><button type="button" id="lessonFlowContinue">Devam et <b>→</b></button></div>';
  $('#lessonFlowContinue')?.addEventListener('click',nextQuestion);
  if(state.settings.voice) speak(detail);
}
function renderCorrectFeedback(){
  const q=currentQuestion;
  const statement=feedbackMathStatement(q);
  $('#practiceContent').innerHTML=`<section class="feedback-card">
    <div class="feedback-mark">✓</div><span class="section-kicker">SONUÇ</span><h2>${esc(statement)}</h2>
    <button class="primary-cta" id="continueButton"><span class="cta-icon">→</span><span><b>Devam et</b><small>${nextTaskLabel()}</small></span><i>→</i></button>
  </section>`;
  $('#continueButton').addEventListener('click',nextQuestion);
  if(state.settings.voice) speak(statement);
}
function renderBridgeFeedback(){
  const q=currentQuestion;
  const hint=String(q.hint||'').trim();
  $('#practiceContent').innerHTML=`<section class="bridge-card">
    <div class="bridge-mark"><i></i><i></i><i></i></div><span class="section-kicker">BURAYA BAK</span><h2>${esc(hint)}</h2>
    <div class="bridge-visual">${renderVisual(q.visual,q)}</div>
    ${q.explain?`<div class="explain-box">${esc(q.explain)}</div>`:''}
    <button class="primary-cta" id="bridgeContinue"><span class="cta-icon">↗</span><span><b>Devam et</b><small>${nextTaskLabel()}</small></span><i>→</i></button>
  </section>`;
  $('#bridgeContinue').addEventListener('click',nextQuestion);
  if(state.settings.voice) speak(hint);
}
function nextTaskLabel(){
  const next=session?.plan[session.planIndex+1];
  return next?'sonraki adım':'oturumu tamamla';
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
    const gateSkill=runtimeSkillsForProfile(state.profile).find(s=>s.id===session.focusSkillId);
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

  if(ended.lessonCenterReturn){
    const focusSkill=runtimeSkillsForProfile(state.profile).find(s=>s.id===ended.focusSkillId);
    const channel=ended.lessonChannel;
    const heading=channel==='learn'?'Konu anlatımı':channel==='practice'?(ended.practiceSectionLabel||'Uygulama bölümü'):'Tekrar';
    let detail='';
    if(channel==='learn') detail='Konu anlatımı tamamlandı. İstersen Ders Merkezi’nden yeniden açabilir veya Uygula bölümlerine geçebilirsin.';
    else if(channel==='practice') detail=ended.practiceSectionCompleted
      ? ended.practiceSectionAttempts+' görevle bu uygulama bölümü tamamlandı.'
      : ended.practiceSectionAttempts+' görev kaydedildi. Bölüm tamamlanmadı; daha sonra buradan devam edebilirsin.';
    else detail=ended.questionIndex+' tekrar görevi tamamlandı.';
    $('#practiceProgress').style.width='100%';
    $('#practiceCounter').textContent=ended.questionIndex?ended.questionIndex+' görev':'Öğren';
    $('#practiceContent').innerHTML='<section class="session-end lesson-center-end"><div class="end-mark">✓</div><span class="section-kicker">DERS MERKEZİ</span><h2>'+esc(heading)+'</h2><p>'+esc(detail)+'</p><button class="primary-cta" id="finishToLessonCenter"><span class="cta-icon">←</span><span><b>Ders merkezine dön</b><small>'+esc(focusSkill?.label||'ders')+'</small></span><i>→</i></button></section>';
    $('#finishToLessonCenter').addEventListener('click',()=>{
      $('#practiceOverlay').classList.remove('open'); $('#practiceOverlay').setAttribute('aria-hidden','true'); document.body.style.overflow='';
      activeLessonSkillId=ended.focusSkillId;
      session=null; currentQuestion=null; currentSelection=null; renderAll(); navigate('lessonCenter');
    });
    return;
  }

  const attempts=ended.correct+ended.wrong; const rate=attempts?Math.round(ended.correct/attempts*100):0;
  const focusSkill=runtimeSkillsForProfile(state.profile).find(s=>s.id===ended.focusSkillId); const focusState=focusSkill?ensureSkillState(state,focusSkill.id):null;
  $('#practiceProgress').style.width='100%';
  $('#practiceCounter').textContent=`${ended.questionIndex} / ${ended.questionIndex}`;
  $('#practiceContent').innerHTML=`<section class="session-end">
    <div class="end-mark">✓</div><span class="section-kicker">TAMAMLANDI</span><h2>Bugünkü çalışmayı bitirdin.</h2>
    <p>${focusSkill?`“${esc(focusSkill.label)}” üzerinde ${ended.questionIndex} görev tamamlandı.`:`${ended.questionIndex} görev tamamlandı.`} Şimdi kısa bir mola zamanı.</p>
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


function nelMatchTokenVisual(item={}){ return '<div class="nel-match-visual-token">'+nelMatchObjectMarkup(item,'eşleştirme nesnesi')+'</div>'; }
function nelMatchTargetVisual(target={},attributeLabel='özelliği'){
  return '<div class="nel-match-question-target"><small>HEDEF · '+esc(attributeLabel.toUpperCase())+'</small>'+nelMatchObjectMarkup(target,'hedef nesne')+'</div>';
}
function nelMatchPairCardVisual(left={},right={}){
  return '<div class="nel-match-question-pair">'+nelMatchObjectMarkup(left,'birinci nesne')+'<span>↔</span>'+nelMatchObjectMarkup(right,'ikinci nesne')+'</div>';
}
function nelMatchBuilderVisual(v={}){
  return '<div class="nel-match-builder" data-attribute="'+esc(v.attribute||'exact')+'">'+
    '<div class="nel-match-question-target"><small>HEDEF</small>'+nelMatchObjectMarkup(v.target,'hedef nesne')+'</div>'+
    '<div class="nel-match-builder-options">'+(v.options||[]).map(item=>'<button type="button" data-nel-match-value="'+esc(item.id||'')+'">'+nelMatchObjectMarkup(item,'eşleştirme seçeneği')+'</button>').join('')+'</div>'+
  '</div>';
}
function nelMatchContextVisual(v={}){
  return '<div class="nel-match-context-visual"><span>OYUNCAK KUTUSU</span>'+nelMatchTargetVisual(v.target,v.attributeLabel||'özellik')+'</div>';
}


function nelSortGroupedItems(v={},binValue){
  return (v.items||[]).filter(item=>String(item?.[v.attribute])===String(binValue));
}
function nelSortDisplayVisual(v={}){
  return '<div class="nel-sort-display">'+(v.bins||[]).map(bin=>
    '<div class="nel-sort-static-bin"><strong>'+esc(bin.label)+'</strong><div>'+
      nelSortGroupedItems(v,bin.value).map(item=>nelMatchObjectMarkup(item,'sınıflanmış nesne')).join('')+
    '</div></div>'
  ).join('')+'</div>';
}
function nelSortBuilderVisual(v={}){
  const context=v.context?'<span class="nel-sort-context-label">'+esc(v.context==='toy-box'?'OYUNCAK KUTUSU':'TOPARLAMA ZAMANI')+'</span>':'';
  return '<div class="nel-sort-builder" data-sort-attribute="'+esc(v.attribute||'')+'">'+context+
    '<div class="nel-sort-tray">'+(v.items||[]).map(item=>
      '<button type="button" class="nel-sort-item" data-nel-sort-item="'+esc(item.id||'')+'" data-nel-sort-correct="'+esc(item?.[v.attribute]??'')+'" aria-label="sınıflanacak nesne">'+nelMatchObjectMarkup(item,'sınıflanacak nesne')+'</button>'
    ).join('')+'</div>'+
    '<div class="nel-sort-bins">'+(v.bins||[]).map(bin=>
      '<div class="nel-sort-bin"><button type="button" class="nel-sort-bin-head" data-nel-sort-bin="'+esc(bin.value)+'">'+esc(bin.label)+'</button><div class="nel-sort-bin-items" data-nel-sort-bin-items="'+esc(bin.value)+'"></div></div>'
    ).join('')+'</div>'+
  '</div>';
}
function nelSortTargetVisual(v={}){
  const others=(v.items||[]).filter(item=>item.id!==v.target?.id);
  return '<div class="nel-sort-target-visual"><div class="nel-sort-target-card"><small>HEDEF</small>'+nelMatchObjectMarkup(v.target||{},'hedef nesne')+'</div>'+
    nelSortDisplayVisual({attribute:v.attribute,bins:v.bins,items:others})+'</div>';
}
function nelSortTwoRulesVisual(v={}){
  return '<div class="nel-sort-two-rules"><div><small>1. KURAL</small>'+nelSortDisplayVisual(v.first||{})+'</div><div><small>2. KURAL</small>'+nelSortDisplayVisual(v.second||{})+'</div></div>';
}

function nelComparePairVisual(v={}){
  return nelComparePairMarkup(v,v.aligned!==false,true);
}
function nelCompareBuilderVisual(v={}){
  const needs=!!v.requiresAlign;
  return '<div class="nel-compare-builder '+(needs?'requires-align':'aligned')+'" data-requires-align="'+(needs?'true':'false')+'">'+
    nelComparePairVisual({...v,aligned:!needs})+
    (needs?'<button type="button" class="nel-compare-align">Başlangıçları hizala</button>':'')+
    '<div class="nel-compare-choice-row">'+['left','right','equal'].map(value=>'<button type="button" class="nel-compare-choice" data-nel-compare-value="'+value+'" '+(needs?'disabled':'')+'>'+esc(v.labels?.[value]||value)+'</button>').join('')+'</div>'+
  '</div>';
}
function nelCompareContextVisual(v={}){
  return '<div class="nel-compare-context"><span>GÜNLÜK KARŞILAŞTIRMA · '+esc((v.attributeLabel||'özellik').toUpperCase())+'</span>'+nelComparePairVisual({...v,aligned:true})+'</div>';
}

function renderVisual(v,q){
  if(!v) return `<div style="position:relative;z-index:1;text-align:center;color:var(--muted);font-size:11px;max-width:360px">Bu pencerede görsel model yerine dil ve akıl yürütme kullanılıyor.</div>`;
  switch(v.type){
    case 'nel-subitise-flash-build': return nelSubitiseFlashBuildVisual(v);
    case 'nel-subitise-flash-audio': return nelSubitiseFlashAudioVisual(v);
    case 'nel-subitise-flash-match': return nelSubitiseFlashMatchVisual(v);
    case 'nel-subitise-flash-explain': return nelSubitiseFlashExplainVisual(v);
    case 'nel-reliable-count-set': return nelReliableCountSetVisual(v);
    case 'nel-reliable-next-word': return nelReliableNextWordVisual(v);
    case 'nel-reliable-cardinality': return nelReliableCardinalityVisual(v);
    case 'nel-reliable-order-proof': return nelReliableOrderProofVisual(v);
    case 'nel-rote-sequence-builder': return nelRoteSequenceBuilderVisual(v);
    case 'nel-rote-audio-choice': return nelRoteAudioChoiceVisual(v);
    case 'nel-rote-phrase-choice': return nelRotePhraseChoiceVisual(v);
    case 'nel-pattern-token': return nelPatternTokenVisual(v.item||{},v.item?.name||'örüntü parçası');
    case 'nel-pattern-strip': return nelPatternStripVisual(v);
    case 'nel-pattern-builder': return nelPatternBuilderVisual(v);
    case 'nel-pattern-actions': return nelPatternActionsVisual(v);
    case 'nel-order-builder': return nelOrderBuilderVisual(v);
    case 'nel-order-preview': return nelOrderPreviewVisual(v);
    case 'nel-order-rule-card': return nelOrderRuleCardVisual(v);
    case 'nel-compare-builder': return nelCompareBuilderVisual(v);
    case 'nel-compare-pair': return nelComparePairVisual(v);
    case 'nel-compare-context': return nelCompareContextVisual(v);
    case 'nel-sort-builder': return nelSortBuilderVisual(v);
    case 'nel-sort-display': return nelSortDisplayVisual(v);
    case 'nel-sort-target': return nelSortTargetVisual(v);
    case 'nel-sort-two-rules': return nelSortTwoRulesVisual(v);
    case 'nel-match-token': return nelMatchTokenVisual(v.item);
    case 'nel-match-target': return nelMatchTargetVisual(v.target,v.attributeLabel);
    case 'nel-match-pair-card': return nelMatchPairCardVisual(v.left,v.right);
    case 'nel-match-builder': return nelMatchBuilderVisual(v);
    case 'nel-match-context': return nelMatchContextVisual(v);
    case 'dots': return `<div class="visual-dots">${Array.from({length:v.n},()=>'<i class="dot"></i>').join('')}</div>`;
    case 'objects': return `<div class="visual-objects">${Array.from({length:v.n},(_,i)=>`<i class="object-token" style="--r:${(i%3-1)*5}deg"></i>`).join('')}</div>`;
    case 'buttons': return `<div class="visual-objects">${Array.from({length:v.n},()=>'<i class="object-token"></i>').join('')}<span style="font-size:26px;color:var(--muted)">…</span></div>`;
    case 'compare': return `<div class="compare-wrap"><div class="compare-group"><span class="compare-label">SOL</span>${Array.from({length:v.a},()=>'<i class="dot"></i>').join('')}</div><div class="compare-group"><span class="compare-label">SAĞ</span>${Array.from({length:v.b},()=>'<i class="dot" style="background:var(--blue)"></i>').join('')}</div></div>`;
    case 'partwhole': return `<div class="partwhole"><div class="whole">${v.whole}</div><div class="part">${v.part}</div><div class="part">${v.missing==null?'?':v.missing}</div></div>`;
    case 'pattern-model-transition': return '<div class="pattern-model-comparison">'+v.items.map(n=>'<div><strong>'+n+'</strong>'+patternQuantityModel(n)+'</div>').join('<span aria-hidden="true">→</span>')+'</div>';
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
  const mini=n=>{ const h=Math.floor(n/100), t=Math.floor((n%100)/10), o=n%10; return `<div class="sg-mini-base1000"><b>${n}</b><div class="sg-mini-place-row"><span><small>Yüzlük</small><strong>${h}</strong></span><span><small>Onluk</small><strong>${t}</strong></span><span><small>Birlik</small><strong>${o}</strong></span></div></div>`; };
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
