export const REPRESENTATIONS = ['build','see','symbol','explain','transfer'];
export const REPRESENTATION_META = {
  build: { label: 'Kur', icon: '◫', short: 'Nesneyle kur' },
  see: { label: 'Gör', icon: '◉', short: 'Görselde gör' },
  symbol: { label: 'Yaz', icon: '＝', short: 'Sembolleştir' },
  explain: { label: 'Anlat', icon: '◌', short: 'Düşünceni seç' },
  transfer: { label: 'Taşı', icon: '↗', short: 'Yeni durumda kullan' },
};

export const LEARNING_PHASES = ['readiness','model','representation','symbol','reasoning','context','practice','retrieval'];
export const LEARNING_PHASE_META = {
  readiness: { label:'Ön bilgiyi yokla', representation:'see' },
  model: { label:'Nesne/modelle çalış', representation:'build' },
  representation: { label:'Farklı temsilini gör', representation:'see' },
  symbol: { label:'Sembolleştir', representation:'symbol' },
  reasoning: { label:'Nedenini düşün', representation:'explain' },
  context: { label:'Gündelik durumda kullan', representation:'transfer' },
  practice: { label:'Farklı örneklerle pekiştir', representation:null },
  retrieval: { label:'Daha sonra geri çağır', representation:null },
};

const LEARNING_CYCLE_READY_SKILLS = new Set([
  'number20','numberBonds10','make10','add20','addMany1','sub20','equality','word1',
  'number100','compareOrder100','ordinal10','numberPattern1','addSub100','multiply40',
  'divide20g1','money1','lengthCompare1','lengthMeasure1','time1','shapes1','shapePattern1','data1',
  'nelMatchAttributes','nelSortAttributes','nelCompareAttributes',
  'number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2',
  'times23510','divisionTables2','multDivFamilies2',
  'fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2',
  'lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2',
  'shapePatterns2','solids2','pictureGraphScale2'
]);
export function supportsLearningCycle(skillId){ return LEARNING_CYCLE_READY_SKILLS.has(skillId); }

const CURRICULUM_SEQUENCED_PROFILES = new Set(['grade2']);

// Canonical new-learning order from Singapore MOE Primary 2.
// Adaptation may revisit earlier learning, but it must not open a later new topic.
export const P2_MOE_SKILL_SEQUENCE = [
  'number1000','compareOrder1000','numberPattern1000','oddEven1000',
  'addSub1000','wordAddSub2',
  'times23510','divisionTables2','multDivFamilies2',
  'fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2',
  'moneyP2',
  'lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2',
  'shapePatterns2','solids2','pictureGraphScale2'
];

export const P2_MOE_NUMBER1000_OBJECTIVES = [
  {code:'1.1',label:'Onluklar ve yüzlükler hâlinde sayma'},
  {code:'1.2',label:'Sayı gösterimi, temsilleri ve basamak değeri'},
  {code:'1.3',label:'Sayıları rakamla ve sözcükle okuma-yazma'},
  {code:'1.4',label:'Sayıları karşılaştırma ve sıralama',skillId:'compareOrder1000'},
  {code:'1.5',label:'Sayı dizilerinde örüntüler',skillId:'numberPattern1000'},
  {code:'1.6',label:'Tek ve çift sayılar',skillId:'oddEven1000'}
];


export const LEARNING_ARCHITECTURE_VERSION = 1;
export const LESSON_CHANNELS = ['learn','practice','review'];

export const P2_CURRICULUM_UNITS = [
  {id:'whole-numbers',label:'1000’e kadar sayılar',strand:'Sayılar',lessons:['number1000','compareOrder1000','numberPattern1000','oddEven1000']},
  {id:'addition-subtraction',label:'Toplama ve çıkarma',strand:'İşlemler',lessons:['addSub1000','wordAddSub2']},
  {id:'multiplication-division',label:'Çarpma ve bölme',strand:'İşlemler',lessons:['times23510','divisionTables2','multDivFamilies2']},
  {id:'fractions',label:'Kesirler',strand:'Kesir',lessons:['fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2']},
  {id:'money',label:'Para',strand:'Para',lessons:['moneyP2']},
  {id:'measurement',label:'Ölçme ve zaman',strand:'Ölçme',lessons:['lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2']},
  {id:'geometry',label:'Şekiller ve cisimler',strand:'Geometri',lessons:['shapePatterns2','solids2']},
  {id:'data',label:'Veri',strand:'Veri',lessons:['pictureGraphScale2']}
];

export const P2_LESSON_CONTRACTS = {
  number1000:{
    version:1,
    unitId:'whole-numbers',
    practice:{
      sections:[
        {id:'build-number',label:'Modelle kur',phase:'model',representation:'build'},
        {id:'place-value',label:'Basamak değerini gör',phase:'representation',representation:'see'},
        {id:'read-write',label:'Oku ve yaz',phase:'symbol',representation:'symbol'},
        {id:'explain-place',label:'Nedenini açıkla',phase:'reasoning',representation:'explain'},
        {id:'transfer-number',label:'Yeni durumda kullan',phase:'context',representation:'transfer'},
        {id:'varied-practice',label:'Farklı örneklerle pekiştir',phase:'practice',representation:null}
      ]
    },
    review:{enabled:true}
  },
  compareOrder1000:{
    version:1,
    unitId:'whole-numbers',
    practice:{
      sections:[
        {id:'compare-places',label:'Basamakları karşılaştır',phase:'model',representation:'build'},
        {id:'verbal-relation',label:'Sözcükle karşılaştır',phase:'representation',representation:'see'},
        {id:'comparison-symbols',label:'İşaretleri kullan',phase:'symbol',representation:'symbol'},
        {id:'order-numbers',label:'Sırala',phase:'practice',representation:'build'},
        {id:'explain-order',label:'Nedenini açıkla',phase:'reasoning',representation:'explain'},
        {id:'transfer-order',label:'Yeni durumda kullan',phase:'context',representation:'transfer'}
      ]
    },
    review:{enabled:true}
  },
  numberPattern1000:{
    version:1,
    unitId:'whole-numbers',
    practice:{
      sections:[
        {id:'model-change',label:'Değişimi modelde gör',phase:'model',representation:'build'},
        {id:'describe-rule',label:'Kuralı sözcükle söyle',phase:'representation',representation:'see'},
        {id:'continue-sequence',label:'Örüntüyü sürdür',phase:'symbol',representation:'symbol'},
        {id:'missing-number',label:'Eksik sayıyı bul',phase:'practice',representation:'symbol'},
        {id:'explain-pattern',label:'Basamak değişimini açıkla',phase:'reasoning',representation:'explain'},
        {id:'transfer-pattern',label:'Aynı kuralı yeni durumda kullan',phase:'context',representation:'transfer'}
      ]
    },
    review:{enabled:true}
  },
  oddEven1000:{
    version:1,
    unitId:'whole-numbers',
    practice:{
      sections:[
        {id:'pair-model',label:'İkişerli eşleştir',phase:'model',representation:'build'},
        {id:'see-leftover',label:'Artanı gör',phase:'representation',representation:'see'},
        {id:'classify-parity',label:'Tek / çift sınıflandır',phase:'symbol',representation:'symbol'},
        {id:'ones-rule',label:'Birlik basamağını kullan',phase:'practice',representation:'symbol'},
        {id:'explain-parity',label:'Nedenini açıkla',phase:'reasoning',representation:'explain'},
        {id:'transfer-parity',label:'Yeni durumda kullan',phase:'context',representation:'transfer'}
      ]
    },
    review:{enabled:true}
  }
};


export const PRESCHOOL_NEL_PATHS = [
  {
    id:'relationships-patterns',
    label:'İlişkiler & Örüntüler',
    skillIds:['nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns']
  },
  {
    id:'counting-number-sense',
    label:'Sayma & Sayı Hissi',
    skillIds:['nelRoteCount20','nelReliableCount10','nelSubitise5','nelConservation10','nelNumberRepresentations10','nelNumeralFormation10','nelCompareQuantities10','nelPartWhole10']
  },
  {
    id:'shapes-space',
    label:'Şekil & Uzam',
    skillIds:['nelBasicShapes','nelShapeAttributes','nelShapeCompose','nelSpatialRelations']
  }
];

export const PRESCHOOL_NEL_KSD_MAP = {
  '2.1':['nelMatchAttributes','nelSortAttributes','nelCompareAttributes'],
  '2.2':['nelOrderAttributes'],
  '2.3':['nelPatterns'],
  '2.4':['nelMatchAttributes','nelSortAttributes','nelCompareAttributes','nelOrderAttributes','nelPatterns'],
  '3.1':['nelRoteCount20'],
  '3.2':['nelReliableCount10'],
  '3.3':['nelConservation10'],
  '3.4':['nelNumberRepresentations10'],
  '3.5':['nelNumberRepresentations10'],
  '3.6':['nelNumeralFormation10'],
  '3.7':['nelCompareQuantities10'],
  '3.8':['nelPartWhole10'],
  '4.1':['nelBasicShapes'],
  '4.2':['nelShapeAttributes'],
  '4.3':['nelShapeCompose'],
  '4.4':['nelSpatialRelations']
};

export const PRESCHOOL_TO_P1_BRIDGES = {
  number20:['nelRoteCount20','nelReliableCount10','nelSubitise5','nelConservation10','nelNumberRepresentations10'],
  numberBonds10:['nelPartWhole10'],
  compareOrder100:['nelCompareQuantities10'],
  numberPattern1:['nelPatterns'],
  shapes1:['nelBasicShapes','nelShapeAttributes','nelShapeCompose','nelSpatialRelations']
};

export const PRESCHOOL_NEL_LESSON_CONTRACTS = {
  nelMatchAttributes:{
    version:1,
    unitId:'nel-relationships-patterns',
    pathId:'relationships-patterns',
    evidenceLabels:{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'},
    practice:{
      sections:[
        {id:'match-exact',label:'Aynısını bul',phase:'model',representation:'build'},
        {id:'match-colour-shape',label:'Renk ve şekle bak',phase:'representation',representation:'see'},
        {id:'match-size-measure',label:'Büyüklük ve ölçüyü karşılaştır',phase:'symbol',representation:'symbol'},
        {id:'explain-match',label:'Neden eş olduğunu söyle',phase:'reasoning',representation:'explain'},
        {id:'transfer-match',label:'Günlük hayatta eşleştir',phase:'context',representation:'transfer'}
      ]
    },
    review:{enabled:true}
  },
  nelSortAttributes:{
    version:1,
    unitId:'nel-relationships-patterns',
    pathId:'relationships-patterns',
    evidenceLabels:{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'},
    practice:{
      sections:[
        {id:'sort-colour-shape',label:'Renk ve şekle göre sınıfla',phase:'model',representation:'build'},
        {id:'sort-size-measure',label:'Büyüklük ve ölçüye göre sınıfla',phase:'representation',representation:'see'},
        {id:'resort-new-rule',label:'Aynı nesneleri başka kuralla yeniden sınıfla',phase:'symbol',representation:'symbol'},
        {id:'explain-sort-rule',label:'Sınıflama kuralını söyle',phase:'reasoning',representation:'explain'},
        {id:'transfer-sort',label:'Günlük hayatta sınıfla',phase:'context',representation:'transfer'}
      ]
    },
    review:{enabled:true}
  },
  nelCompareAttributes:{
    version:1,
    unitId:'nel-relationships-patterns',
    pathId:'relationships-patterns',
    evidenceLabels:{build:'Kur',see:'Gör',symbol:'Göster',explain:'Anlat',transfer:'Taşı'},
    practice:{
      sections:[
        {id:'compare-size',label:'Büyük ve küçük karşılaştır',phase:'model',representation:'build'},
        {id:'compare-length',label:'Uzun ve kısa karşılaştır',phase:'representation',representation:'see'},
        {id:'compare-height',label:'Yüksek ve alçak karşılaştır',phase:'symbol',representation:'symbol'},
        {id:'explain-compare',label:'Neye göre karşılaştırdığını söyle',phase:'reasoning',representation:'explain'},
        {id:'transfer-compare',label:'Günlük hayatta karşılaştır',phase:'context',representation:'transfer'}
      ]
    },
    review:{enabled:true}
  }
};

export function curriculumSequenceFor(profile){
  if(!CURRICULUM_SEQUENCED_PROFILES.has(profile)) return [];
  const byId=new Map(skillsFor(profile).map(s=>[s.id,s]));
  return P2_MOE_SKILL_SEQUENCE.map(id=>byId.get(id)).filter(Boolean);
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

export const PROFILE_META = {
  preschool: { label: 'Okul öncesi', age: '4–6 yaş', effortBudget: 5.5, cooldownMinutes: 5 },
  grade1: { label: '1. sınıf', age: '6–7 yaş', effortBudget: 6.5, cooldownMinutes: 5 },
  grade2: { label: '2. sınıf', age: '7–8 yaş', effortBudget: 7.5, cooldownMinutes: 7 },
};

const skill = (id, profile, label, family, accent, prerequisite = [], options = {}) => ({ id, profile, label, family, accent, prerequisite, ...options });
export const SKILLS = [
  // NEL v2 reference skills stay hidden until the complete preschool path is ready.
  skill('nelMatchAttributes','preschool','Aynı özelliği eşleştir','İlişkiler & Örüntüler','rose',[],{hidden:true,curriculum:'NEL2022-v2',pathId:'relationships-patterns'}),
  skill('nelSortAttributes','preschool','Özelliğe göre sınıfla','İlişkiler & Örüntüler','navy',[],{hidden:true,curriculum:'NEL2022-v2',pathId:'relationships-patterns'}),
  skill('nelCompareAttributes','preschool','Özelliğe göre karşılaştır','İlişkiler & Örüntüler','teal',[],{hidden:true,curriculum:'NEL2022-v2',pathId:'relationships-patterns'}),
  skill('subitize5','preschool','Bir bakışta miktar','Sayı hissi','amber'),
  skill('count10','preschool','10’a kadar sayma','Sayı hissi','blue',['subitize5']),
  skill('compare10','preschool','Miktar karşılaştırma','İlişkiler','violet',['count10']),
  skill('partwhole5','preschool','Parça–bütün','Sayı ilişkileri','green',['subitize5']),
  skill('patternAB','preschool','Örüntü kurma','Örüntü','rose'),
  skill('shapesBasic','preschool','Şekilleri fark etme','Geometri','teal'),
  skill('sortAttribute','preschool','Özelliğe göre sınıflama','Matematiksel düşünme','navy'),
  skill('positionWords','preschool','Konum ve yön','Uzamsal düşünme','blue'),

  // Primary 1: Singapore MOE 2021/2025 content coverage, localised for Turkish learners.
  // The graph is deliberately atomic: curriculum topics are split into concepts that can collect
  // independent Kur · Gör · Yaz · Anlat · Taşı evidence instead of becoming one giant chapter score.
  skill('number20','grade1','20 içinde sayı ve miktar','Sayılar','amber'),
  skill('numberBonds10','grade1','10’a kadar sayı bağları','Sayı ilişkileri','green',['number20']),
  skill('make10','grade1','10’u tamamlama','Zihinsel stratejiler','green',['numberBonds10']),
  skill('add20','grade1','20 içinde toplama stratejileri','İşlemler','blue',['numberBonds10']),
  skill('addMany1','grade1','Üç veya daha çok tek basamaklı sayıyı toplama','İşlemler','blue',['add20']),
  skill('sub20','grade1','20 içinde çıkarma stratejileri','İşlemler','violet',['numberBonds10']),
  skill('equality','grade1','Eşitlik ve işlem aileleri','İşlem ilişkileri','rose',['add20','sub20']),
  skill('word1','grade1','Toplama–çıkarma problem yapıları','Problem çözme','teal',['add20','sub20']),
  skill('number100','grade1','100’e kadar sayı ve basamak','Sayılar','amber',['number20']),
  skill('compareOrder100','grade1','100’e kadar karşılaştırma ve sıralama','Sayılar','blue',['number100']),
  skill('ordinal10','grade1','Sıra sayıları 1–10','Sayılar','violet',['number20']),
  skill('numberPattern1','grade1','Sayı dizilerinde örüntü ve sabit adım','Örüntü','navy',['number100']),
  skill('addSub100','grade1','100 içinde toplama ve çıkarma','İşlemler','blue',['number100','add20','sub20']),
  skill('multiply40','grade1','Eşit gruplarla çarpma','Çarpma','green',['add20']),
  skill('divide20g1','grade1','Paylaşma ve gruplama ile bölme','Bölme','teal',['multiply40']),
  skill('money1','grade1','Para değeri, eşdeğerlik ve alışveriş','Para','teal',['number100']),
  skill('lengthCompare1','grade1','Santimetre ile uzunluk karşılaştırma','Ölçme','green'),
  skill('lengthMeasure1','grade1','Santimetre ile ölçme ve çizgi uzunluğu','Ölçme','green',['lengthCompare1']),
  skill('time1','grade1','5 dakikalık saat, ÖÖ/ÖS ve süre','Zaman','violet'),
  skill('shapes1','grade1','2B şekilleri tanı, adlandır ve sınıflandır','Geometri','rose'),
  skill('shapePattern1','grade1','2B şekillerden figür oluşturma ve çözümleme','Geometri','rose',['shapes1']),
  skill('data1','grade1','Resimli grafik okuma ve yorumlama','Veri','amber',['number20']),

  // Primary 2 migration is deliberate: reference-quality skills use new ids so legacy
  // evidence cannot silently carry over to materially harder Singapore P2 content.
  skill('number1000','grade2','1000’e kadar sayı ve basamak','Sayılar','amber'),
  skill('compareOrder1000','grade2','1000’e kadar karşılaştırma ve sıralama','Sayılar','blue',['number1000']),
  skill('numberPattern1000','grade2','1, 10 ve 100 ile sayı örüntüleri','Örüntü','navy',['number1000']),
  skill('oddEven1000','grade2','1000’e kadar tek ve çift sayılar','Sayılar','green',['number1000']),
  skill('addSub1000','grade2','1000 içinde toplama ve çıkarma','İşlemler','violet',['number1000']),
  skill('wordAddSub2','grade2','1–2 adımlı toplama ve çıkarma problemleri','Problem çözme','teal',['addSub1000']),
  skill('times23510','grade2','2, 3, 4, 5 ve 10 çarpım tabloları','Çarpma','green'),
  skill('divisionTables2','grade2','Bölme ve ÷ gösterimi','Bölme','teal',['times23510']),
  skill('multDivFamilies2','grade2','Çarpma–bölme işlem aileleri','İşlem ilişkileri','violet',['divisionTables2']),
  skill('fractionMeaning2','grade2','Eş parçalar ve bütün','Kesir','rose'),
  skill('fractionNotation2','grade2','Kesirleri okuma ve yazma','Kesir','rose',['fractionMeaning2']),
  skill('fractionCompare2','grade2','Kesirleri karşılaştırma ve sıralama','Kesir','violet',['fractionNotation2']),
  skill('fractionAddSub2','grade2','Eş paydalı kesirlerde toplama ve çıkarma','Kesir','teal',['fractionCompare2']),
  skill('moneyP2','grade2','TL, kuruş ve ondalık para gösterimi','Para','teal'),
  skill('lengthMetre2','grade2','Metre ile uzunluk','Ölçme','green'),
  skill('massMetric2','grade2','Gram ve kilogram ile kütle','Ölçme','amber'),
  skill('volumeLitre2','grade2','Litre ile sıvı hacmi','Ölçme','blue'),
  skill('timeMinute2','grade2','Dakikaya kadar saat okuma','Zaman','violet'),
  skill('timeDuration2','grade2','Saat ve dakika cinsinden süre','Zaman','violet',['timeMinute2']),
  skill('shapePatterns2','grade2','2B şekillerle örüntüler','Geometri','rose'),
  skill('solids2','grade2','3B cisimleri tanıma ve sınıflandırma','Geometri','violet'),
  skill('pictureGraphScale2','grade2','Ölçekli resimli grafikleri okuma','Veri','amber'),
];

export function skillsFor(profile,{includeHidden=false}={}){
  return SKILLS.filter(s => s.profile === profile && (includeHidden || !s.hidden));
}


export function curriculumUnitsFor(profile){
  if(profile!=='grade2') return [];
  const byId=new Map(skillsFor(profile).map(s=>[s.id,s]));
  return P2_CURRICULUM_UNITS.map(unit=>({
    ...unit,
    lessons:unit.lessons.map(id=>byId.get(id)).filter(Boolean)
  }));
}
export function curriculumUnitForSkill(skillId){
  return P2_CURRICULUM_UNITS.find(unit=>unit.lessons.includes(skillId))||null;
}
export function lessonContractFor(skillId){
  const explicit=P2_LESSON_CONTRACTS[skillId]||PRESCHOOL_NEL_LESSON_CONTRACTS[skillId];
  if(explicit) return {skillId,...explicit,provisional:false};
  const unit=curriculumUnitForSkill(skillId);
  return {
    skillId,
    version:1,
    unitId:unit?.id||null,
    practice:{sections:[]},
    review:{enabled:true},
    provisional:true
  };
}
export function prerequisiteStatus(state,skillId){
  const skillObj=SKILLS.find(s=>s.id===skillId);
  const required=[...(skillObj?.prerequisite||[])];
  const missing=required.filter(id=>!(ensureSkillState(state,id).learningCycle?.firstCycleCompletedAt||0));
  return {met:missing.length===0,required,missing};
}
export function curriculumGateStatus(state,skillId){
  const sequence=curriculumSequenceFor(state?.profile);
  if(!sequence.length) return {unlocked:true,blockedBy:null,currentSkillId:null};
  const targetIndex=sequence.findIndex(s=>s.id===skillId);
  if(targetIndex<0) return {unlocked:true,blockedBy:null,currentSkillId:null};
  const current=currentCurriculumSkill(state);
  if(!current) return {unlocked:true,blockedBy:null,currentSkillId:null};
  const currentIndex=sequence.findIndex(s=>s.id===current.id);
  return {
    unlocked:targetIndex<=currentIndex,
    blockedBy:targetIndex<=currentIndex?null:current.id,
    currentSkillId:current.id
  };
}
export function lessonAccessState(state,skillId){
  const ss=ensureSkillState(state,skillId);
  const completed=!!(ss.learningCycle?.firstCycleCompletedAt||0);
  if(completed) return {status:'completed',lockReason:null};
  const curriculum=curriculumGateStatus(state,skillId);
  if(!curriculum.unlocked) return {status:'locked',lockReason:{type:'curriculum',skillId:curriculum.blockedBy}};
  const prereq=prerequisiteStatus(state,skillId);
  if(!prereq.met) return {status:'locked',lockReason:{type:'prerequisite',skillId:prereq.missing[0],missing:prereq.missing}};
  const current=currentCurriculumSkill(state);
  return {status:current?.id===skillId?'current':'available',lockReason:null};
}

function emptyPracticeSectionState(){
  return {nativeAttempts:0,nativeCorrect:0,completedAt:0,lastSeen:0,cycleAttempts:0,cycleCorrect:0,cycleStartedAt:0,legacyAttempts:0,legacyCorrect:0,legacyLastSeen:0};
}
function defaultLessonJourney(skillId){
  const contract=lessonContractFor(skillId);
  return {
    version:LEARNING_ARCHITECTURE_VERSION,
    contractVersion:contract.version,
    learn:{startedAt:0,completedAt:0,stepIndex:0,lessonVersion:0,completionSource:null},
    practice:{
      legacyCompletedAt:0,
      sections:Object.fromEntries((contract.practice?.sections||[]).map(section=>[section.id,emptyPracticeSectionState()]))
    },
    review:{dueAt:0,lastCompletedAt:0,attempts:0,successes:0}
  };
}
function ensureLessonJourneyOnSkillState(skillState,skillId){
  const contract=lessonContractFor(skillId);
  skillState.lessonJourney ||= defaultLessonJourney(skillId);
  const journey=skillState.lessonJourney;
  journey.version=LEARNING_ARCHITECTURE_VERSION;
  journey.contractVersion=Math.max(Number(journey.contractVersion)||0,contract.version||1);
  journey.learn ||= {startedAt:0,completedAt:0,stepIndex:0,lessonVersion:0,completionSource:null};
  journey.practice ||= {legacyCompletedAt:0,sections:{}};
  journey.practice.sections ||= {};
  journey.review ||= {dueAt:0,lastCompletedAt:0,attempts:0,successes:0};
  for(const section of contract.practice?.sections||[]){
    journey.practice.sections[section.id] ||= emptyPracticeSectionState();
    const target=journey.practice.sections[section.id];
    target.nativeAttempts=Math.max(0,Number(target.nativeAttempts)||0);
    target.nativeCorrect=Math.max(0,Number(target.nativeCorrect)||0);
    target.completedAt=Number(target.completedAt)||0;
    target.lastSeen=Number(target.lastSeen)||0;
    target.cycleAttempts=Math.max(0,Number(target.cycleAttempts)||0);
    target.cycleCorrect=Math.max(0,Number(target.cycleCorrect)||0);
    target.cycleStartedAt=Number(target.cycleStartedAt)||0;
    target.legacyAttempts=Math.max(0,Number(target.legacyAttempts)||0);
    target.legacyCorrect=Math.max(0,Number(target.legacyCorrect)||0);
    target.legacyLastSeen=Number(target.legacyLastSeen)||0;
  }

  const lc=ensureLearningCycleState(skillState);
  const phaseSeen=LEARNING_PHASES.some(phase=>(lc.phases?.[phase]?.attempts||0)>0);
  if(!journey.learn.startedAt&&(lc.lessonStepIndex>0||lc.lessonTaughtAt||phaseSeen||lc.firstCycleCompletedAt)){
    journey.learn.startedAt=lc.lessonTaughtAt||lc.lastCycleAt||lc.firstCycleCompletedAt||skillState.lastSeen||0;
  }
  journey.learn.stepIndex=Math.max(Number(journey.learn.stepIndex)||0,Number(lc.lessonStepIndex)||0);
  journey.learn.lessonVersion=Math.max(Number(journey.learn.lessonVersion)||0,Number(lc.lessonVersion)||0);
  if(lc.lessonTaughtAt){
    journey.learn.completedAt=Math.max(Number(journey.learn.completedAt)||0,Number(lc.lessonTaughtAt)||0);
    journey.learn.completionSource=journey.learn.completionSource||'lesson';
  }else if(lc.firstCycleCompletedAt&&!journey.learn.completedAt){
    journey.learn.completedAt=Number(lc.firstCycleCompletedAt)||0;
    journey.learn.completionSource='legacy-cycle';
  }

  if(lc.firstCycleCompletedAt) journey.practice.legacyCompletedAt=Math.max(Number(journey.practice.legacyCompletedAt)||0,Number(lc.firstCycleCompletedAt)||0);
  for(const section of contract.practice?.sections||[]){
    const phase=lc.phases?.[section.phase];
    if(!phase) continue;
    const target=journey.practice.sections[section.id];
    target.legacyAttempts=Math.max(Number(target.legacyAttempts)||0,Number(phase.attempts)||0);
    target.legacyCorrect=Math.max(Number(target.legacyCorrect)||0,Number(phase.correct)||0);
    target.legacyLastSeen=Math.max(Number(target.legacyLastSeen)||0,Number(phase.lastSeen)||0);
  }

  const retrievalAttempts=Number(lc.retrievalAttempts)||0;
  journey.review.dueAt=retrievalAttempts>0
    ? (Number(lc.retrievalDueAt)||0)
    : Math.max(Number(journey.review.dueAt)||0,Number(lc.retrievalDueAt)||0);
  journey.review.attempts=Math.max(Number(journey.review.attempts)||0,retrievalAttempts);
  journey.review.successes=Math.max(Number(journey.review.successes)||0,Number(lc.retrievalSuccesses)||0);
  if(lc.retrievalSuccesses>0&&!journey.review.lastCompletedAt) journey.review.lastCompletedAt=Number(lc.lastCycleAt)||Number(skillState.lastSeen)||0;
  return journey;
}
export function ensureLessonJourneyState(state,skillId){
  if(!state.skills[skillId]) state.skills[skillId]=makeSkillState();
  const ss=state.skills[skillId];
  ss.evidence ||= defaultEvidence();
  for(const r of REPRESENTATIONS){ ss.evidence[r] ||= {score:0,attempts:0,correct:0,lastSeen:0}; }
  ensureLearningCycleState(ss);
  return ensureLessonJourneyOnSkillState(ss,skillId);
}
export function ensureLearningArchitectureState(state){
  state.version=Math.max(3,Number(state.version)||0);
  state.learningArchitecture ||= {version:LEARNING_ARCHITECTURE_VERSION};
  state.learningArchitecture.version=LEARNING_ARCHITECTURE_VERSION;
  for(const skillObj of skillsFor(state.profile)) ensureSkillState(state,skillObj.id);
  return state;
}
export function markLessonLearnProgress(state,skillId,{stepIndex=null,completedAt=0,startedAt=0,lessonVersion=null}={}){
  const journey=ensureLessonJourneyState(state,skillId);
  const now=Date.now();
  journey.learn.startedAt=journey.learn.startedAt||Number(startedAt)||now;
  if(stepIndex!=null) journey.learn.stepIndex=Math.max(journey.learn.stepIndex,Number(stepIndex)||0);
  if(lessonVersion!=null) journey.learn.lessonVersion=Math.max(journey.learn.lessonVersion,Number(lessonVersion)||0);
  if(completedAt){
    journey.learn.completedAt=Math.max(journey.learn.completedAt,Number(completedAt)||now);
    journey.learn.completionSource='native';
  }
  return journey.learn;
}
export function recordPracticeSectionAttempt(state,skillId,sectionId,{correct=false,complete=false,now=Date.now()}={}){
  const contract=lessonContractFor(skillId);
  const section=contract.practice?.sections?.find(item=>item.id===sectionId);
  if(!section) throw new Error('Unknown practice section: '+skillId+'/'+sectionId);
  const journey=ensureLessonJourneyState(state,skillId);
  const target=journey.practice.sections[sectionId] ||= emptyPracticeSectionState();
  target.nativeAttempts+=1;
  if(correct) target.nativeCorrect+=1;
  target.cycleAttempts=(target.cycleAttempts||0)+1;
  if(correct) target.cycleCorrect=(target.cycleCorrect||0)+1;
  target.cycleStartedAt=target.cycleStartedAt||now;
  target.lastSeen=now;
  if(complete) target.completedAt=target.completedAt||now;
  return target;
}
export function resetPracticeSectionCycle(state,skillId,sectionId,{now=Date.now()}={}){
  const journey=ensureLessonJourneyState(state,skillId);
  const target=journey.practice.sections?.[sectionId];
  if(!target) throw new Error('Unknown practice section: '+skillId+'/'+sectionId);
  target.cycleAttempts=0;
  target.cycleCorrect=0;
  target.cycleStartedAt=now;
  return target;
}
export function practiceSectionCompletionAllowed(attempts,correctCount,lastCorrect){
  return !!lastCorrect && Number(attempts)>=4 && Number(correctCount)>=3;
}

export function runPedagogyStateAudit(state,now=Date.now()){
  ensureLearningArchitectureState(state);
  const checks=[];
  const add=(id,label,pass,detail='')=>checks.push({id,label,pass:!!pass,detail:String(detail||'')});

  add(
    'practice-final-correct',
    'Uygulama son yanlış cevapla tamamlanamaz',
    !practiceSectionCompletionAllowed(4,3,false) &&
      practiceSectionCompletionAllowed(4,3,true) &&
      !practiceSectionCompletionAllowed(3,3,true),
    'Tamamlama: en az 4 görev, en az 3 doğru ve son cevap doğru.'
  );

  if(state.profile==='preschool'){
    const expectedKsd=['2.1','2.2','2.3','2.4','3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8','4.1','4.2','4.3','4.4'];
    const missingKsd=expectedKsd.filter(code=>!(PRESCHOOL_NEL_KSD_MAP[code]?.length));
    add(
      'nel-ksd-coverage',
      'NEL Numeracy KSD 2.1–2.4, 3.1–3.8 ve 4.1–4.4 ürün becerilerine eşlenmiş',
      missingKsd.length===0,
      missingKsd.length?'Eksik KSD: '+missingKsd.join(', '):'16 resmi KSD grubu eşlenmiş.'
    );
    const p1WithPreschoolPrereq=SKILLS.filter(skill=>skill.profile==='grade1'&&(skill.prerequisite||[]).some(id=>SKILLS.find(s=>s.id===id)?.profile==='preschool'));
    add(
      'p1-no-preschool-hard-gate',
      'P1, okul öncesi tamamlanmasına hard prerequisite ile bağlanmıyor',
      p1WithPreschoolPrereq.length===0,
      p1WithPreschoolPrereq.length?'Bağlı: '+p1WithPreschoolPrereq.map(s=>s.id).join(', '):'P1 kendi başlangıcını koruyor.'
    );
    const contract=lessonContractFor('nelMatchAttributes');
    add(
      'nel-match-reference-contract',
      'İlk NEL v2 referans becerinin Öğren/Uygula sözleşmesi açık',
      !contract.provisional && contract.practice.sections.length===5,
      contract.practice.sections.map(section=>section.id).join(' → ')
    );
    const sortContract=lessonContractFor('nelSortAttributes');
    add(
      'nel-sort-reference-contract',
      'NEL v2 sınıflama becerisinin Öğren/Uygula sözleşmesi açık',
      !sortContract.provisional && sortContract.practice.sections.length===5,
      sortContract.practice.sections.map(section=>section.id).join(' → ')
    );
    const compareContract=lessonContractFor('nelCompareAttributes');
    add(
      'nel-compare-reference-contract',
      'NEL v2 karşılaştırma becerisinin Öğren/Uygula sözleşmesi açık',
      !compareContract.provisional && compareContract.practice.sections.length===5,
      compareContract.practice.sections.map(section=>section.id).join(' → ')
    );
  }

  if(state.profile==='grade2'){
    const flattened=P2_CURRICULUM_UNITS.flatMap(unit=>unit.lessons);
    add(
      'canonical-order',
      'P2 ünite yolu canonical müfredat sırasını koruyor',
      flattened.length===P2_MOE_SKILL_SEQUENCE.length &&
        flattened.every((id,index)=>id===P2_MOE_SKILL_SEQUENCE[index]),
      flattened.join(' → ')
    );

    let seenIncomplete=false;
    const outOfOrder=[];
    for(const id of P2_MOE_SKILL_SEQUENCE){
      const completed=!!ensureSkillState(state,id).learningCycle?.firstCycleCompletedAt;
      if(!completed) seenIncomplete=true;
      else if(seenIncomplete) outOfOrder.push(id);
    }
    add(
      'curriculum-continuity',
      'Gelecek yeni ders daha erken tamamlanmış görünmüyor',
      outOfOrder.length===0,
      outOfOrder.length?'Sıra dışı: '+outOfOrder.join(', '):'Yeni öğrenme sırası tutarlı.'
    );

    const current=currentCurriculumSkill(state);
    const currentIndex=current?P2_MOE_SKILL_SEQUENCE.indexOf(current.id):P2_MOE_SKILL_SEQUENCE.length;
    const prematurelyOpen=P2_MOE_SKILL_SEQUENCE.slice(Math.max(0,currentIndex+1)).filter(id=>{
      const completed=!!ensureSkillState(state,id).learningCycle?.firstCycleCompletedAt;
      return !completed && lessonAccessState(state,id).status!=='locked';
    });
    add(
      'future-locks',
      'Gelecek yeni dersler kilitli kalıyor',
      prematurelyOpen.length===0,
      prematurelyOpen.length?'Erken açık: '+prematurelyOpen.join(', '):'Gelecek ders kapıları doğru.'
    );

    const practiceOrderErrors=[];
    for(const skillId of Object.keys(P2_LESSON_CONTRACTS)){
      const snap=lessonProgressSnapshot(state,skillId,now);
      let gap=false;
      for(const section of snap.practice.sections){
        if(!section.completedAt) gap=true;
        else if(gap) practiceOrderErrors.push(skillId+'/'+section.id);
      }
    }
    add(
      'practice-order',
      'Uygula bölümleri sırayı atlamıyor',
      practiceOrderErrors.length===0,
      practiceOrderErrors.length?'Sıra dışı tamamlanan: '+practiceOrderErrors.join(', '):'Bölüm sırası tutarlı.'
    );

    const reviewBeforeCompletion=P2_MOE_SKILL_SEQUENCE.filter(id=>{
      const ss=ensureSkillState(state,id);
      const journey=ensureLessonJourneyState(state,id);
      return !ss.learningCycle?.firstCycleCompletedAt && !!journey.review?.dueAt;
    });
    add(
      'review-after-cycle',
      'Tekrar yalnız ilk öğrenme döngüsünden sonra planlanıyor',
      reviewBeforeCompletion.length===0,
      reviewBeforeCompletion.length?'Erken tekrar: '+reviewBeforeCompletion.join(', '):'Tekrar kapıları doğru.'
    );

    const referenceContracts=['number1000','compareOrder1000','numberPattern1000','oddEven1000'];
    const incompleteContracts=referenceContracts.filter(id=>{
      const contract=lessonContractFor(id);
      return contract.provisional || (contract.practice?.sections?.length||0)<5;
    });
    add(
      'reference-contracts',
      'Referans derslerin Öğren/Uygula sözleşmeleri tanımlı',
      incompleteContracts.length===0,
      incompleteContracts.length?'Eksik sözleşme: '+incompleteContracts.join(', '):'Dört referans ders açık sözleşmeye sahip.'
    );


    let patternScopeClean=true;
    const patternRng=(()=>{let s=1901;return()=>((s=(s*1664525+1013904223)>>>0)/2**32)})();
    for(const section of P2_LESSON_CONTRACTS.numberPattern1000.practice.sections){
      for(let i=0;i<4;i++){
        const q=generateLessonPracticeQuestion('numberPattern1000',section.id,i,2,patternRng);
        const step=Math.abs(Number(q.patternStep||0));
        if(![1,10,100].includes(step)) patternScopeClean=false;
      }
    }
    add(
      'pattern-step-scope',
      'P2 sayı örüntüsü yalnız 1, 10 ve 100 adımlarını kullanıyor',
      patternScopeClean,
      patternScopeClean?'Çarpımsal/ileri konu adımı yok.':'Örüntü kapsamı ±1/±10/±100 dışına çıktı.'
    );

    const oddRng=(()=>{let s=2609;return()=>((s=(s*1664525+1013904223)>>>0)/2**32)})();
    const oddEndings=new Set();
    let oddScopeClean=true, thousandEven=false;
    for(let i=0;i<240;i++){
      const q=generateLessonPracticeQuestion('oddEven1000','classify-parity',i%4,2,oddRng);
      const n=Number(q.parityNumber);
      if(Number.isFinite(n)) oddEndings.add(n%10);
      if(n===1000&&q.answer==='Çift') thousandEven=true;
      const text=[q.prompt,q.hint,q.explain,...(q.response?.options||[]).map(o=>o.label||o.value)].join(' ');
      if(/asal|bölünebilir|çarpım|çarpma|katı|katına|faktör/i.test(text)) oddScopeClean=false;
    }
    add(
      'odd-even-ending-coverage',
      'P2 tek–çift uygulaması bütün birlik rakamlarını kapsıyor ve 1000’i çift sınıflandırıyor',
      oddEndings.size===10&&thousandEven,
      'Birlik rakamları: '+[...oddEndings].sort((a,b)=>a-b).join(', ')+' · 1000 çift: '+thousandEven
    );
    add(
      'odd-even-future-topic-guard',
      'P2 tek–çift akışı ilerideki çarpma/bölme/asal diline taşmıyor',
      oddScopeClean,
      oddScopeClean?'Eşleştirme ve birlik basamağı kapsamında.':'Tek–çift akışına ileri konu dili sızdı.'
    );

    let symbolGuard=true;
    let equalitySeen=false;
    const rng=(()=>{let s=1844;return()=>((s=(s*1664525+1013904223)>>>0)/2**32)})();
    for(let i=0;i<4;i++){
      const q=generateLessonPracticeQuestion('compareOrder1000','comparison-symbols',i,2,rng);
      const values=(q.response?.options||[]).map(opt=>String(opt.value));
      if(values.length!==3 || values.some(value=>!['<','>','='].includes(value))) symbolGuard=false;
      if(q.answer==='=') equalitySeen=true;
    }
    add(
      'comparison-symbol-set',
      'Karşılaştırma uygulaması yalnız < > = kullanıyor ve eşitliği içeriyor',
      symbolGuard&&equalitySeen,
      symbolGuard&&equalitySeen?'Sembol kümesi temiz.':'Karşılaştırma sembol sözleşmesi bozuldu.'
    );
  }

  return {
    passed:checks.filter(check=>check.pass).length,
    failed:checks.filter(check=>!check.pass).length,
    checks
  };
}

export function lessonProgressSnapshot(state,skillId,now=Date.now()){
  const ss=ensureSkillState(state,skillId);
  const journey=ensureLessonJourneyState(state,skillId);
  const contract=lessonContractFor(skillId);
  const access=lessonAccessState(state,skillId);
  const phaseSeen=LEARNING_PHASES.some(phase=>(ss.learningCycle?.phases?.[phase]?.attempts||0)>0);
  const learnStatus=journey.learn.completedAt?'complete':(journey.learn.stepIndex>0||phaseSeen?'in-progress':'not-started');
  const sectionDefs=contract.practice?.sections||[];
  const sectionStates=sectionDefs.map(def=>({def,state:journey.practice.sections[def.id]}));
  const completedSections=sectionStates.filter(item=>item.state?.completedAt).length;
  const nativeAttempts=sectionStates.reduce((sum,item)=>sum+(item.state?.nativeAttempts||0),0);
  let practiceStatus='ready';
  if(access.status==='locked'||learnStatus!=='complete') practiceStatus='locked';
  else if(!sectionDefs.length) practiceStatus='pending-design';
  else if(completedSections===sectionDefs.length) practiceStatus='complete';
  else if(nativeAttempts>0) practiceStatus='in-progress';
  else if(journey.practice.legacyCompletedAt) practiceStatus='legacy-complete';

  let reviewStatus='locked';
  if(ss.learningCycle?.firstCycleCompletedAt){
    if(journey.review.dueAt&&journey.review.dueAt<=now) reviewStatus='due';
    else if(journey.review.dueAt>now) reviewStatus='scheduled';
    else if(journey.review.successes>0) reviewStatus='caught-up';
    else reviewStatus='ready';
  }

  return {
    skillId,
    unitId:contract.unitId,
    provisional:contract.provisional,
    access,
    learn:{status:learnStatus,...journey.learn},
    practice:{
      status:practiceStatus,
      completedSections,
      totalSections:sectionDefs.length,
      legacyCompletedAt:journey.practice.legacyCompletedAt,
      sections:sectionStates.map(({def,state:sectionState})=>({id:def.id,label:def.label,phase:def.phase,representation:def.representation,...sectionState}))
    },
    review:{status:reviewStatus,...journey.review}
  };
}
export function lessonChannelAccess(state,skillId,now=Date.now()){
  const snapshot=lessonProgressSnapshot(state,skillId,now);
  return {
    learn:snapshot.access.status!=='locked',
    practice:snapshot.practice.status!=='locked'&&snapshot.practice.status!=='pending-design',
    review:snapshot.review.status!=='locked'
  };
}

function defaultEvidence(){
  return Object.fromEntries(REPRESENTATIONS.map(r => [r,{score:0, attempts:0, correct:0, lastSeen:0}]));
}
function defaultLearningCycle(){
  return {
    version:1,
    status:'new',
    firstCycleCompletedAt:0,
    lastCycleAt:0,
    retrievalDueAt:0,
    retrievalAttempts:0,
    retrievalSuccesses:0,
    practiceAttempts:0,
    practiceCorrect:0,
    readinessNeedsSupport:false,
    readinessSupportUsed:false,
    lessonStepIndex:0,
    lessonTaughtAt:0,
    lessonVersion:0,
    phases:Object.fromEntries(LEARNING_PHASES.map(p=>[p,{attempts:0,correct:0,lastSeen:0}]))
  };
}
export function ensureLearningCycleState(skillState){
  skillState.learningCycle ||= defaultLearningCycle();
  const lc=skillState.learningCycle;
  lc.version ||= 1;
  lc.status ||= 'new';
  lc.firstCycleCompletedAt ||= 0;
  lc.lastCycleAt ||= 0;
  lc.retrievalDueAt ||= 0;
  lc.retrievalAttempts ||= 0;
  lc.retrievalSuccesses ||= 0;
  lc.practiceAttempts ||= 0;
  lc.practiceCorrect ||= 0;
  lc.readinessNeedsSupport=!!lc.readinessNeedsSupport;
  lc.readinessSupportUsed=!!lc.readinessSupportUsed;
  lc.lessonStepIndex=Math.max(0,Number(lc.lessonStepIndex)||0);
  lc.lessonTaughtAt=Number(lc.lessonTaughtAt)||0;
  lc.lessonVersion=Math.max(0,Number(lc.lessonVersion)||0);
  lc.phases ||= {};
  for(const p of LEARNING_PHASES) lc.phases[p] ||= {attempts:0,correct:0,lastSeen:0};
  return lc;
}
export function learningCycleStatus(skillState, now=Date.now()){
  const lc=ensureLearningCycleState(skillState);
  if(skillState.stable && lc.retrievalSuccesses>=1) return 'secure';
  if(lc.firstCycleCompletedAt && lc.retrievalDueAt && lc.retrievalDueAt<=now) return 'retrieval-due';
  if(lc.firstCycleCompletedAt) return 'consolidating';
  if(LEARNING_PHASES.some(p=>(lc.phases[p]?.attempts||0)>0)) return 'learning';
  return 'new';
}
export function makeSkillState(){
  return { evidence: defaultEvidence(), learningCycle:defaultLearningCycle(), totalAttempts:0, totalCorrect:0, difficulty:1, lastDifficultyChangeAttempt:0, delayedSuccesses:0, delayedAttempts:0, lastSeen:0, stable:false };
}
export function defaultState(){
  return {
    version: 3,
    profile: 'grade1',
    childName: '',
    onboarded: false,
    settings: { voice:true, calmMotion:false, cooldownMinutes:null, dailyMinutes:20 },
    learningArchitecture: { version:LEARNING_ARCHITECTURE_VERSION },
    skills: {},
    reviewQueue: [],
    history: [],
    sessions: [],
    totals: { attempts:0, correct:0, activeSeconds:0 },
  };
}
export function ensureSkillState(state, skillId){
  if(!state.skills[skillId]) state.skills[skillId] = makeSkillState();
  const ss = state.skills[skillId];
  ss.evidence ||= defaultEvidence();
  for(const r of REPRESENTATIONS){ ss.evidence[r] ||= {score:0,attempts:0,correct:0,lastSeen:0}; }
  ensureLearningCycleState(ss);
  ensureLessonJourneyOnSkillState(ss,skillId);
  return ss;
}

export function evidenceScore(skillState){
  const scores = REPRESENTATIONS.map(r => skillState.evidence?.[r]?.score || 0);
  const observed = scores.filter(v => v > 0);
  if(!observed.length) return 0;
  return observed.reduce((a,b)=>a+b,0) / observed.length;
}
export function evidenceCoverage(skillState){
  return REPRESENTATIONS.filter(r => (skillState.evidence?.[r]?.attempts || 0) > 0).length;
}
export function strongModalities(skillState, threshold=.72){
  return REPRESENTATIONS.filter(r => (skillState.evidence?.[r]?.score || 0) >= threshold).length;
}
export function computeStable(skillState){
  return strongModalities(skillState) >= 3 && skillState.delayedSuccesses >= 1 && evidenceScore(skillState) >= .72;
}
export function masteryPercent(skillState){
  const modal = evidenceScore(skillState) * .72;
  const breadth = Math.min(1, evidenceCoverage(skillState)/4) * .18;
  const retention = Math.min(1, (skillState.delayedSuccesses || 0)/2) * .10;
  return Math.round(Math.min(1,modal+breadth+retention)*100);
}

export function classifyFractionPaint(scores,{minSignal=2.5,dominanceRatio=.25}={}){
  const clean=Array.isArray(scores)?scores.map(v=>Math.max(0,Number(v)||0)):[];
  const peak=clean.length?Math.max(...clean):0;
  if(!clean.length || peak<minSignal) return {selected:[],count:0,peak,threshold:minSignal};
  const threshold=Math.max(minSignal,peak*dominanceRatio);
  const selected=[];
  clean.forEach((score,index)=>{ if(score>=threshold) selected.push(index); });
  return {selected,count:selected.length,peak,threshold};
}

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function randInt(min,max,rng=Math.random){ return Math.floor(rng()*(max-min+1))+min; }
function choice(arr,rng=Math.random){ return arr[Math.floor(rng()*arr.length)]; }
function shuffled(arr,rng=Math.random){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function numericChoices(answer, spread=4, rng=Math.random){
  const set = new Set([answer]);
  let guard=0;
  while(set.size<4 && guard++<50){
    const delta=randInt(1,spread,rng)*(rng()<.5?-1:1);
    set.add(Math.max(0,answer+delta));
  }
  let fallbackOffset=Math.max(2,spread+1);
  while(set.size<4){ set.add(Math.max(0,answer+fallbackOffset)); fallbackOffset+=1; }
  return shuffled([...set],rng).map(String);
}
function semanticChoices(answer, distractors, rng=Math.random){ const unique=[...new Set([answer,...distractors])]; return shuffled(unique.slice(0,4),rng); }

function qBase(skillId, representation, prompt, answer, choices, extra={}){
  const normalizedChoices=Array.isArray(choices)?choices.map(String):[];
  const response=extra.response || {kind:'choice',options:normalizedChoices.map(value=>({value,label:value}))};
  const taskKind=extra.taskKind || (response.kind==='choice'?'choice':'response');
  const rest={...extra}; delete rest.response; delete rest.taskKind;
  return { skillId, representation, prompt, answer:String(answer), choices:normalizedChoices, response, taskKind, hint:'', explain:'', effort:1, ...rest };
}
function qTask(skillId,representation,prompt,answer,response,extra={}){
  return qBase(skillId,representation,prompt,answer,[],{...extra,response,taskKind:extra.taskKind||response.kind});
}

function pickDifferent(cases,count,rng=Math.random){
  const pool=shuffled(cases,rng);
  if(pool.length<count) throw new Error('Not enough concept cases');
  return pool.slice(0,count);
}
function number20Cases(){ return Array.from({length:15},(_,i)=>({n:i+6,tens:Math.floor((i+6)/10),ones:(i+6)%10})); }
function make10Cases(){ return Array.from({length:8},(_,i)=>({a:i+2,missing:8-i})); }
function add20Cases(){
  const out=[];
  // Strategy family 1: count on. Small addends are intentionally chosen so counting-on is efficient.
  for(let a=4;a<=16;a++) for(let b=1;b<=3;b++) if(a+b<=20){
    out.push({a,b,ans:a+b,strategy:'countOn',steps:b,to10:Math.max(0,10-a),rest:Math.max(0,a+b-10)});
  }
  // Strategy family 2: make ten. These are the cases where bridging through ten has real structural value.
  for(let a=6;a<=9;a++) for(let b=Math.max(2,11-a);b<=Math.min(9,20-a);b++){
    const to10=10-a, rest=b-to10;
    if(rest>0) out.push({a,b,ans:a+b,strategy:'makeTen',to10,rest});
  }
  // Strategy family 3: doubles / near doubles. This prevents make-ten becoming the only "smart" method.
  for(let a=3;a<=9;a++){
    if(a+a<=20) out.push({a,b:a,ans:a+a,strategy:'double',double:a,adjust:0,to10:Math.max(0,10-a),rest:Math.max(0,a+a-10)});
    if(a+(a+1)<=20) out.push({a,b:a+1,ans:a+a+1,strategy:'nearDouble',double:a,adjust:1,to10:Math.max(0,10-a),rest:Math.max(0,a+a+1-10)});
  }
  return out;
}

function addMany1Cases(){
  const triples=[];
  for(let a=1;a<=7;a++) for(let b=1;b<=7;b++) for(let c=1;c<=7;c++){
    const total=a+b+c;
    if(total<=20 && (a+b===10 || b+c===10 || a===b || b===c || a+c===10)) triples.push({a,b,c,total});
  }
  return triples;
}

function equalityCases(){
  const out=[];
  for(let a=3;a<=8;a++) for(let b=1;b<=5;b++){
    const total=a+b;
    const c=Math.max(1,Math.min(total-1,((a+2*b)%Math.max(2,total-1))+1));
    if(c<total) out.push({a,b,total,c,missing:total-c});
  }
  return out;
}
function word1Cases(){
  return [
    {type:'join-result',start:5,change:3,result:8,answer:8,op:'+'},
    {type:'join-result',start:7,change:5,result:12,answer:12,op:'+'},
    {type:'join-change',start:6,change:4,result:10,answer:4,op:'+'},
    {type:'join-change',start:9,change:6,result:15,answer:6,op:'+'},
    {type:'separate-result',start:12,change:5,result:7,answer:7,op:'−'},
    {type:'separate-result',start:16,change:7,result:9,answer:9,op:'−'},
    {type:'part-missing',whole:14,known:8,missing:6,answer:6,op:'−'},
    {type:'part-missing',whole:17,known:9,missing:8,answer:8,op:'−'},
    {type:'compare-difference',larger:13,smaller:8,diff:5,answer:5,op:'−'},
    {type:'compare-difference',larger:16,smaller:9,diff:7,answer:7,op:'−'}
  ];
}
function pattern1Cases(){
  const out=[];
  for(const step of [1,2,5,10]){
    for(const direction of [1,-1]){
      const signed=step*direction;
      for(const start of [12,23,34,45,56,67,78,89]){
        const seq=Array.from({length:4},(_,i)=>start+i*signed);
        const next=seq.at(-1)+signed;
        if(seq.every(n=>n>=0&&n<=100) && next>=0&&next<=100) out.push({start,step:signed,seq,next});
      }
    }
  }
  return out;
}
function shapes1Cases(){
  return [
    {id:'triangle',name:'Üçgen',icon:'triangle',straight:3,curves:0,structure:'3 düz kenar'},
    {id:'square',name:'Kare',icon:'square',straight:4,curves:0,structure:'4 eşit düz kenar'},
    {id:'rect',name:'Dikdörtgen',icon:'rect',straight:4,curves:0,structure:'karşılıklı eşit düz kenarlar'},
    {id:'circle',name:'Daire',icon:'circle',straight:0,curves:1,structure:'yalnız eğri sınır'},
    {id:'halfCircle',name:'Yarım daire',icon:'halfCircle',straight:1,curves:1,structure:'1 düz kenar + 1 eğri sınır'},
    {id:'quarterCircle',name:'Çeyrek daire',icon:'quarterCircle',straight:2,curves:1,structure:'2 düz kenar + 1 eğri sınır'}
  ];
}
function length1Cases(){
  return [
    {a:7,b:4,longer:'Mavi'},{a:4,b:8,longer:'Turuncu'},{a:6,b:6,longer:'Eşit'},
    {a:9,b:5,longer:'Mavi'},{a:5,b:7,longer:'Turuncu'},{a:8,b:8,longer:'Eşit'},
    {a:6,b:3,longer:'Mavi'},{a:3,b:6,longer:'Turuncu'}
  ];
}
function data1Cases(){
  return [
    {cats:['Elma','Armut','Muz'],vals:[4,2,3]},
    {cats:['Elma','Armut','Muz'],vals:[2,5,3]},
    {cats:['Elma','Armut','Muz'],vals:[3,2,5]},
    {cats:['Kedi','Köpek','Kuş'],vals:[5,3,2]},
    {cats:['Kedi','Köpek','Kuş'],vals:[2,4,3]},
    {cats:['Kırmızı','Mavi','Sarı'],vals:[3,5,2]},
    {cats:['Kırmızı','Mavi','Sarı'],vals:[2,3,4]}
  ].map(x=>({...x,max:Math.max(...x.vals),maxIndex:x.vals.indexOf(Math.max(...x.vals))}));
}
function sub20Cases(){
  const out=[];
  // Count back: efficient for small subtrahends.
  for(let a=6;a<=20;a++) for(let b=1;b<=3;b++) if(a-b>=0){
    out.push({a,b,ans:a-b,strategy:'countBack',steps:b,to10:Math.max(0,a-10),after10:Math.max(0,b-Math.max(0,a-10))});
  }
  // Subtract from 10: bridge through ten for teen numbers.
  for(let a=12;a<=18;a++){
    const to10=a-10;
    for(let after10=1;after10<=Math.min(4,9-to10);after10++){
      const b=to10+after10;
      out.push({a,b,ans:a-b,strategy:'subtractFrom10',to10,after10});
    }
  }
  // Inverse / missing-addend reasoning.
  for(let ans=4;ans<=10;ans++) for(let b=2;b<=6;b++) if(ans+b<=20){
    out.push({a:ans+b,b,ans,strategy:'inverse',to10:Math.max(0,ans+b-10),after10:0});
  }
  return out;
}

function numberBondCases(){
  const out=[];
  for(let whole=4;whole<=10;whole++) for(let part=1;part<whole;part++) out.push({whole,part,missing:whole-part});
  return out;
}
function number100Cases(){
  const out=[];
  for(let n=21;n<=99;n+=3) out.push({n,tens:Math.floor(n/10),ones:n%10});
  out.push({n:100,tens:10,ones:0});
  return out;
}
function compare100Cases(){
  const out=[];
  for(const a of [24,37,42,58,63,76,81,95]){
    for(const delta of [1,4,10,-3,-10]){
      const b=a+delta;
      if(b>=0&&b<=100&&a!==b) out.push({a,b,relation:a>b?'>':'<',larger:Math.max(a,b),smaller:Math.min(a,b)});
    }
  }
  return out;
}
function ordinalCases(){ return Array.from({length:10},(_,i)=>({position:i+1,label:`${i+1}.`})); }
function addSub100Cases(){
  const out=[];
  // Mental calculation explicitly named in Singapore P1: 2-digit ± ones without renaming, and ± tens.
  for(const [a,b,op] of [[24,3,'+'],[35,4,'+'],[58,1,'+'],[47,5,'−'],[69,6,'−'],[82,2,'−']]) out.push({a,b,op,ans:op==='+'?a+b:a-b,renaming:false,mode:'mentalOnes'});
  for(const [a,b,op] of [[23,20,'+'],[46,30,'+'],[51,40,'+'],[78,20,'−'],[94,30,'−'],[65,40,'−']]) out.push({a,b,op,ans:op==='+'?a+b:a-b,renaming:false,mode:'mentalTens'});
  // Standard 2-digit algorithms, first without and later with regrouping.
  for(const [a,b] of [[23,14],[42,25],[51,18],[64,23],[35,42]]) out.push({a,b,op:'+',ans:a+b,renaming:false,mode:'algorithm'});
  for(const [a,b] of [[58,24],[76,35],[93,41],[67,22],[84,53]]) out.push({a,b,op:'−',ans:a-b,renaming:false,mode:'algorithm'});
  for(const [a,b] of [[28,17],[36,29],[47,18],[58,26],[67,15]]) out.push({a,b,op:'+',ans:a+b,renaming:true,mode:'algorithm'});
  for(const [a,b] of [[42,18],[53,27],[61,36],[72,45],[80,26]]) out.push({a,b,op:'−',ans:a-b,renaming:true,mode:'algorithm'});
  return out;
}

function multiply40Cases(){
  const out=[];
  for(let groups=2;groups<=8;groups++) for(let each=2;each<=10;each++) if(groups*each<=40) out.push({groups,each,total:groups*each});
  return out;
}
function divide20CasesG1(){
  const out=[];
  for(let groups=2;groups<=5;groups++) for(let each=2;each<=6;each++) if(groups*each<=20){
    const total=groups*each;
    out.push({groups,each,total,mode:'sharing'});
    out.push({groups,each,total,mode:'grouping'});
  }
  return out;
}
function money1Cases(){
  // The official P1 structure counts money within one unit at a time.  SAYMERA
  // localises dollars/cents to TL/kuruş but preserves the same-unit constraint.
  return [
    {unit:'TL',target:10,values:[5,5],denoms:[1,5,10,20,50]},
    {unit:'TL',target:15,values:[10,5],denoms:[1,5,10,20,50]},
    {unit:'TL',target:20,values:[10,5,5],denoms:[1,5,10,20,50]},
    {unit:'TL',target:25,values:[20,5],denoms:[1,5,10,20,50]},
    {unit:'TL',target:30,values:[20,10],denoms:[1,5,10,20,50]},
    {unit:'TL',target:40,values:[20,20],denoms:[1,5,10,20,50]},
    {unit:'TL',target:50,values:[20,20,10],denoms:[1,5,10,20,50]},
    {unit:'TL',target:60,values:[50,10],denoms:[1,5,10,20,50]},
    {unit:'TL',target:75,values:[50,20,5],denoms:[1,5,10,20,50]},
    {unit:'TL',target:90,values:[50,20,20],denoms:[1,5,10,20,50]},
    {unit:'kr',target:25,values:[10,10,5],denoms:[5,10,25,50]},
    {unit:'kr',target:40,values:[25,10,5],denoms:[5,10,25,50]},
    {unit:'kr',target:50,values:[25,25],denoms:[5,10,25,50]},
    {unit:'kr',target:60,values:[50,10],denoms:[5,10,25,50]},
    {unit:'kr',target:75,values:[50,25],denoms:[5,10,25,50]},
    {unit:'kr',target:100,values:[50,25,25],denoms:[5,10,25,50]}
  ];
}
function lengthMeasureCases(){
  return Array.from({length:11},(_,i)=>({cm:i+2,start:0,end:i+2}));
}
function time1Cases(){
  const out=[];
  const minutes=[0,5,10,15,20,25,30,35,40,45,50,55];
  for(let hour=1;hour<=12;hour++){
    for(const minute of minutes){
      for(const period of ['ÖÖ','ÖS']){
        const intl=period==='ÖÖ'?'a.m.':'p.m.';
        const duration=((hour+minute/5)%3===0)?60:30;
        out.push({hour,minute,label:`${hour}:${String(minute).padStart(2,'0')}`,period,intl,duration});
      }
    }
  }
  return out;
}
export function addClockMinutes(z,delta){
  let hour24=z.hour%12;
  if(z.period==='ÖS') hour24+=12;
  const start=hour24*60+z.minute;
  const total=((start+delta)%(24*60)+(24*60))%(24*60);
  const h24=Math.floor(total/60), minute=total%60;
  const period=h24<12?'ÖÖ':'ÖS';
  const intl=period==='ÖÖ'?'a.m.':'p.m.';
  const hour=h24%12||12;
  return {hour,minute,label:`${hour}:${String(minute).padStart(2,'0')}`,period,intl};
}

function p1GridCellsForFigure(figure){
  const maps={
    house:['2,0','1,1','2,1','3,1','1,2','2,2','3,2','1,3','2,3','3,3'],
    mushroom:['1,0','2,0','3,0','0,1','1,1','2,1','3,1','4,1','2,2','2,3'],
    kite:['2,0','1,1','2,1','3,1','2,2','2,3','1,4','3,4'],
    arch:['1,0','2,0','3,0','0,1','1,1','3,1','4,1','0,2','1,2','3,2','4,2','0,3','1,3','3,3','4,3'],
    boat:['2,0','2,1','3,1','1,2','2,2','3,2','0,3','1,3','2,3','3,3','4,3'],
    window:['0,0','1,0','3,0','4,0','0,1','1,1','3,1','4,1','0,3','1,3','3,3','4,3','0,4','1,4','3,4','4,4']
  };
  return maps[figure]||maps.house;
}

function shapePatternCases(){
  // Internal skill id retained for storage compatibility; content now covers the
  // official P1 forming / decomposing / copying of 2D figures.
  return [
    {id:'house',name:'ev',pieces:['square','triangle'],copy:'house',description:'bir kare ve bir üçgen'},
    {id:'mushroom',name:'mantar',pieces:['rect','halfCircle'],copy:'mushroom',description:'bir dikdörtgen ve bir yarım daire'},
    {id:'kite',name:'uçurtma',pieces:['triangle','triangle'],copy:'kite',description:'iki üçgen'},
    {id:'arch',name:'kemer',pieces:['quarterCircle','quarterCircle','rect'],copy:'arch',description:'iki çeyrek daire ve bir dikdörtgen'},
    {id:'boat',name:'yelkenli',pieces:['halfCircle','triangle','rect'],copy:'boat',description:'bir yarım daire, bir üçgen ve bir dikdörtgen'},
    {id:'window',name:'pencere',pieces:['square','square','square','square'],copy:'window',description:'dört kare'}
  ];
}


function oddEven1000Cases(){
  // Cover every possible ones digit, zero endings and the upper endpoint 1000.
  const nums=[110,121,232,343,454,565,676,787,898,909,240,351,462,573,684,795,806,917,528,639,1000];
  return nums.map(n=>({n,ones:n%10,parity:n%2===0?'Çift':'Tek',leftover:n%2}));
}
function wordAddSub2Cases(){
  const raw=[
    [245,120,85,'+','−','Kütüphanede 245 kitap vardı. 120 yeni kitap geldi, sonra 85 kitap ödünç verildi.'],
    [630,145,90,'−','+','Depoda 630 kutu vardı. 145 kutu gönderildi, sonra 90 kutu geldi.'],
    [175,230,140,'+','+','Bir etkinliğe önce 175, sonra 230, ardından 140 kişi katıldı.'],
    [820,135,210,'−','−','Bir depoda 820 ürün vardı. Önce 135, sonra 210 ürün gönderildi.'],
    [318,126,74,'+','−','Okulda 318 kitap vardı. 126 kitap alındı, ardından 74 kitap başka sınıfa verildi.'],
    [704,208,95,'−','+','Bir mağazada 704 ürün vardı. 208 ürün satıldı, sonra 95 ürün geldi.'],
    [260,115,205,'+','+','Bir koleksiyonda 260 parça vardı. Önce 115, sonra 205 parça eklendi.'],
    [910,240,125,'−','−','Bir kütüphanede 910 kitap vardı. 240 ve ardından 125 kitap ödünç verildi.']
  ];
  return raw.map(([a,b,c,op1,op2,story])=>{
    const first=op1==='+'?a+b:a-b;
    const ans=op2==='+'?first+c:first-c;
    return {a,b,c,op1,op2,first,ans,story};
  });
}


function nelMatchItems(){
  return {
    blueCircleSmall:{id:'blue-circle-small',shape:'circle',tone:'blue',size:'small'},
    blueCircleLarge:{id:'blue-circle-large',shape:'circle',tone:'blue',size:'large'},
    redCircleLarge:{id:'red-circle-large',shape:'circle',tone:'red',size:'large'},
    redSquareSmall:{id:'red-square-small',shape:'square',tone:'red',size:'small'},
    blueSquareLarge:{id:'blue-square-large',shape:'square',tone:'blue',size:'large'},
    yellowTriangleSmall:{id:'yellow-triangle-small',shape:'triangle',tone:'yellow',size:'small'},
    greenTriangleLarge:{id:'green-triangle-large',shape:'triangle',tone:'green',size:'large'},
    shortBlueBar:{id:'short-blue-bar',shape:'bar',tone:'blue',size:'medium',length:'short',height:'medium'},
    longRedBar:{id:'long-red-bar',shape:'bar',tone:'red',size:'medium',length:'long',height:'medium'},
    longBlueBar:{id:'long-blue-bar',shape:'bar',tone:'blue',size:'medium',length:'long',height:'medium'},
    lowGreenBar:{id:'low-green-bar',shape:'tower',tone:'green',size:'medium',length:'medium',height:'short'},
    tallYellowBar:{id:'tall-yellow-bar',shape:'tower',tone:'yellow',size:'medium',length:'medium',height:'tall'},
    tallBlueBar:{id:'tall-blue-bar',shape:'tower',tone:'blue',size:'medium',length:'medium',height:'tall'}
  };
}
function nelMatchCases(){
  const i=nelMatchItems();
  return [
    {id:'exact-1',attribute:'exact',attributeLabel:'her özelliği',target:i.blueCircleSmall,answer:i.blueCircleSmall,options:[i.blueCircleSmall,i.redSquareSmall,i.blueCircleLarge]},
    {id:'colour-1',attribute:'tone',attributeLabel:'rengi',target:i.blueCircleSmall,answer:i.blueSquareLarge,options:[i.blueSquareLarge,i.redCircleLarge,i.yellowTriangleSmall]},
    {id:'shape-1',attribute:'shape',attributeLabel:'şekli',target:i.redCircleLarge,answer:i.blueCircleSmall,options:[i.blueCircleSmall,i.redSquareSmall,i.greenTriangleLarge]},
    {id:'size-1',attribute:'size',attributeLabel:'büyüklüğü',target:i.blueCircleLarge,answer:i.greenTriangleLarge,options:[i.greenTriangleLarge,i.redSquareSmall,i.yellowTriangleSmall]},
    {id:'length-1',attribute:'length',attributeLabel:'uzunluğu',target:i.longRedBar,answer:i.longBlueBar,options:[i.longBlueBar,i.shortBlueBar,i.tallBlueBar]},
    {id:'height-1',attribute:'height',attributeLabel:'yüksekliği',target:i.tallYellowBar,answer:i.tallBlueBar,options:[i.tallBlueBar,i.lowGreenBar,i.longBlueBar]}
  ];
}
function nelMatchReason(attribute){
  return {
    exact:'Aynı nesnenin bütün özellikleri uyuşuyor.',
    tone:'Renkleri aynı.',
    shape:'Şekilleri aynı.',
    size:'Büyüklükleri aynı.',
    length:'Uzunlukları aynı.',
    height:'Yükseklikleri aynı.'
  }[attribute]||'Ortak bir özellikleri var.';
}

function nelSortItems(){
  return {
    blueCircleSmall:{id:'sort-blue-circle-small',shape:'circle',tone:'blue',size:'small',length:'medium',height:'medium'},
    blueSquareLarge:{id:'sort-blue-square-large',shape:'square',tone:'blue',size:'large',length:'medium',height:'medium'},
    blueTriangleSmall:{id:'sort-blue-triangle-small',shape:'triangle',tone:'blue',size:'small',length:'medium',height:'medium'},
    blueCircleLarge2:{id:'sort-blue-circle-large-2',shape:'circle',tone:'blue',size:'large',length:'medium',height:'medium'},
    redCircleLarge:{id:'sort-red-circle-large',shape:'circle',tone:'red',size:'large',length:'medium',height:'medium'},
    redSquareSmall:{id:'sort-red-square-small',shape:'square',tone:'red',size:'small',length:'medium',height:'medium'},
    redTriangleLarge:{id:'sort-red-triangle-large',shape:'triangle',tone:'red',size:'large',length:'medium',height:'medium'},
    redSquareLarge2:{id:'sort-red-square-large-2',shape:'square',tone:'red',size:'large',length:'medium',height:'medium'},
    shortBlueBar:{id:'sort-short-blue-bar',shape:'bar',tone:'blue',size:'medium',length:'short',height:'medium'},
    shortRedBar:{id:'sort-short-red-bar',shape:'bar',tone:'red',size:'medium',length:'short',height:'medium'},
    shortYellowBar:{id:'sort-short-yellow-bar',shape:'bar',tone:'yellow',size:'medium',length:'short',height:'medium'},
    longBlueBar:{id:'sort-long-blue-bar',shape:'bar',tone:'blue',size:'medium',length:'long',height:'medium'},
    longRedBar:{id:'sort-long-red-bar',shape:'bar',tone:'red',size:'medium',length:'long',height:'medium'},
    longGreenBar:{id:'sort-long-green-bar',shape:'bar',tone:'green',size:'medium',length:'long',height:'medium'},
    lowBlueTower:{id:'sort-low-blue-tower',shape:'tower',tone:'blue',size:'medium',length:'medium',height:'short'},
    lowRedTower:{id:'sort-low-red-tower',shape:'tower',tone:'red',size:'medium',length:'medium',height:'short'},
    lowGreenTower:{id:'sort-low-green-tower',shape:'tower',tone:'green',size:'medium',length:'medium',height:'short'},
    tallBlueTower:{id:'sort-tall-blue-tower',shape:'tower',tone:'blue',size:'medium',length:'medium',height:'tall'},
    tallYellowTower:{id:'sort-tall-yellow-tower',shape:'tower',tone:'yellow',size:'medium',length:'medium',height:'tall'},
    tallGreenTower:{id:'sort-tall-green-tower',shape:'tower',tone:'green',size:'medium',length:'medium',height:'tall'}
  };
}
function nelSortCases(){
  const i=nelSortItems();
  const sharedColourShape=[i.blueCircleSmall,i.blueSquareLarge,i.blueCircleLarge2,i.redCircleLarge,i.redSquareSmall,i.redSquareLarge2];
  return [
    {
      id:'sort-tone',attribute:'tone',attributeLabel:'renk',ruleLabel:'Renge göre',
      bins:[{value:'blue',label:'Mavi'},{value:'red',label:'Kırmızı'}],
      items:sharedColourShape
    },
    {
      id:'sort-shape',attribute:'shape',attributeLabel:'şekil',ruleLabel:'Şekle göre',
      bins:[{value:'circle',label:'Daire'},{value:'square',label:'Kare'}],
      items:sharedColourShape
    },
    {
      id:'sort-size',attribute:'size',attributeLabel:'büyüklük',ruleLabel:'Büyüklüğe göre',
      bins:[{value:'small',label:'Küçük'},{value:'large',label:'Büyük'}],
      items:[i.blueCircleSmall,i.redSquareSmall,i.blueTriangleSmall,i.blueSquareLarge,i.redCircleLarge,i.redTriangleLarge]
    },
    {
      id:'sort-length',attribute:'length',attributeLabel:'uzunluk',ruleLabel:'Uzunluğa göre',
      bins:[{value:'short',label:'Kısa'},{value:'long',label:'Uzun'}],
      items:[i.shortBlueBar,i.shortRedBar,i.shortYellowBar,i.longBlueBar,i.longRedBar,i.longGreenBar]
    },
    {
      id:'sort-height',attribute:'height',attributeLabel:'yükseklik',ruleLabel:'Yüksekliğe göre',
      bins:[{value:'short',label:'Alçak'},{value:'tall',label:'Yüksek'}],
      items:[i.lowBlueTower,i.lowRedTower,i.lowGreenTower,i.tallBlueTower,i.tallYellowTower,i.tallGreenTower]
    }
  ];
}
function nelSortExpected(sortCase){
  return sortCase.items
    .map(item=>item.id+':'+String(item[sortCase.attribute]))
    .sort()
    .join('|');
}
function nelSortCaseForAttribute(attribute){
  return nelSortCases().find(c=>c.attribute===attribute)||nelSortCases()[0];
}
function nelSortRuleDistractors(correct){
  return ['Renge göre','Şekle göre','Büyüklüğe göre','Uzunluğa göre','Yüksekliğe göre'].filter(x=>x!==correct);
}

function nelCompareCases(){
  const sizeLabels={left:'Soldaki daha büyük',right:'Sağdaki daha büyük',equal:'Aynı büyüklükte'};
  const lengthLabels={left:'Soldaki daha uzun',right:'Sağdaki daha uzun',equal:'Aynı uzunlukta'};
  const heightLabels={left:'Soldaki daha yüksek',right:'Sağdaki daha yüksek',equal:'Aynı yükseklikte'};
  const size=(id,leftSize,rightSize,answer,leftTone='blue',rightTone='red')=>({
    id,attribute:'size',attributeLabel:'büyüklük',attributeAnswer:'Büyüklüklerine göre',
    left:{id:id+'-left',shape:'circle',tone:leftTone,size:leftSize,length:'medium',height:'medium'},
    right:{id:id+'-right',shape:'circle',tone:rightTone,size:rightSize,length:'medium',height:'medium'},
    answer,labels:sizeLabels,requiresAlign:false
  });
  const length=(id,leftLength,rightLength,answer,leftTone='blue',rightTone='red')=>({
    id,attribute:'length',attributeLabel:'uzunluk',attributeAnswer:'Uzunluklarına göre',
    left:{id:id+'-left',shape:'bar',tone:leftTone,size:'medium',length:leftLength,height:'medium'},
    right:{id:id+'-right',shape:'bar',tone:rightTone,size:'medium',length:rightLength,height:'medium'},
    answer,labels:lengthLabels,requiresAlign:true
  });
  const height=(id,leftHeight,rightHeight,answer,leftTone='green',rightTone='yellow')=>({
    id,attribute:'height',attributeLabel:'yükseklik',attributeAnswer:'Yüksekliklerine göre',
    left:{id:id+'-left',shape:'tower',tone:leftTone,size:'medium',length:'medium',height:leftHeight},
    right:{id:id+'-right',shape:'tower',tone:rightTone,size:'medium',length:'medium',height:rightHeight},
    answer,labels:heightLabels,requiresAlign:false
  });
  return [
    size('compare-size-right','small','large','right'),
    size('compare-size-left','large','small','left','red','blue'),
    size('compare-size-equal','large','large','equal','green','yellow'),
    length('compare-length-right','short','long','right'),
    length('compare-length-left','long','short','left','red','blue'),
    length('compare-length-equal','long','long','equal','green','yellow'),
    height('compare-height-right','short','tall','right'),
    height('compare-height-left','tall','short','left','blue','green'),
    height('compare-height-equal','tall','tall','equal','red','yellow')
  ];
}
function nelCompareCasesFor(attribute){
  return nelCompareCases().filter(c=>c.attribute===attribute);
}
function nelCompareAnswerLabel(compareCase){
  return compareCase.labels[compareCase.answer];
}
function nelCompareChoiceLabels(compareCase){
  return ['left','right','equal'].map(key=>compareCase.labels[key]);
}
function nelCompareExpected(compareCase){
  return (compareCase.requiresAlign?'aligned|':'')+compareCase.answer;
}
function nelCompareExplain(compareCase){
  if(compareCase.answer==='equal') return compareCase.labels.equal+'.';
  return nelCompareAnswerLabel(compareCase)+'.';
}

function number1000Cases(){
  const nums=[103,118,140,205,267,304,359,402,478,506,571,620,684,703,748,815,862,907,945,999,1000];
  return nums.map(n=>({n,hundreds:Math.floor(n/100),tens:Math.floor((n%100)/10),ones:n%10}));
}
function compare1000Cases(){
  return [[342,349],[509,490],[675,625],[808,880],[999,909],[420,421],[731,701],[1000,999],[456,546],[603,630],[288,208],[917,971],[535,535],[420,420]]
    .map(([a,b])=>({a,b,relation:a>b?'>':'<',larger:Math.max(a,b),smaller:Math.min(a,b)}));
}
function pattern1000Cases(){
  const specs=[
    [214,1],[376,1],[645,1],[980,1],
    [120,10],[245,10],[530,10],[760,10],
    [100,100],[230,100],[405,100],[600,100],
    [615,-1],[904,-1],[870,-10],[655,-10],[900,-100],[780,-100],[650,-100]
  ];
  return specs.map(([start,step])=>{
    const seq=Array.from({length:4},(_,i)=>start+i*step);
    return {start,step,seq,next:start+4*step};
  }).filter(x=>x.seq.every(n=>n>=0&&n<=1000)&&x.next>=0&&x.next<=1000);
}
function addSub1000Cases(){
  const raw=[
    [342,5,'+','mental'],[618,20,'+','mental'],[427,100,'+','mental'],[853,3,'−','mental'],[764,40,'−','mental'],[925,200,'−','mental'],
    [243,315,'+','standard'],[421,356,'+','standard'],[132,446,'+','standard'],[786,243,'−','standard'],[954,321,'−','standard'],[875,452,'−','standard'],
    [268,157,'+','regroup'],[347,286,'+','regroup'],[486,378,'+','regroup'],[562,178,'−','regroup'],[734,268,'−','regroup'],[900,457,'−','regroup']
  ];
  return raw.map(([a,b,op,mode])=>{
    const ans=op==='+'?a+b:a-b;
    const renaming=mode==='regroup';
    return {a,b,op,ans,mode,renaming};
  });
}
function hto(n){ return {hundreds:Math.floor(n/100),tens:Math.floor((n%100)/10),ones:n%10}; }

function shapes2Cases(){
  return [
    {id:'cube',name:'Küp',kind:'cube',flat:'6',curved:'0',face:'square',fact:'6 düz yüzünün tamamı karedir',scene:'dice'},
    {id:'cuboid',name:'Dikdörtgen prizma',kind:'cuboid',flat:'6',curved:'0',face:'rectangle',fact:'6 düz yüzü vardır; yüzleri dikdörtgen biçimindedir',scene:'box'},
    {id:'cylinder',name:'Silindir',kind:'cylinder',flat:'2',curved:'1',face:'circle',fact:'2 dairesel düz yüzü ve 1 eğri yüzeyi vardır',scene:'can'},
    {id:'sphere',name:'Küre',kind:'sphere',flat:'0',curved:'1',face:'none',fact:'düz yüzü yoktur; tek parça eğri yüzeyi vardır',scene:'ball'}
  ];
}
function solidSignature(x){ return `${x.flat}|${x.curved}|${x.face}`; }

function shapeTokenParts(token){
  const [shape='circle',size='medium',orientation='0']=String(token).split('|');
  return {shape,size,orientation:Number(orientation)||0};
}
function shapeTokenLabel(token){
  const {shape,size,orientation}=shapeTokenParts(token);
  const name={triangle:'üçgen',square:'kare',rect:'dikdörtgen',circle:'daire'}[shape]||shape;
  const sizeLabel=size==='small'?'küçük':size==='large'?'büyük':'';
  const orientationLabel=orientation===180?'aşağı dönük':orientation===90?'yana dönük':'';
  return [sizeLabel,orientationLabel,name].filter(Boolean).join(' ');
}
function trNumberWord(n){
  const ones=['sıfır','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz'];
  const tens=['','on','yirmi','otuz','kırk','elli','altmış','yetmiş','seksen','doksan'];
  n=Number(n);
  if(n<10) return ones[n];
  if(n===1000) return 'bin';
  const h=Math.floor(n/100), rest=n%100, t=Math.floor(rest/10), o=rest%10;
  const parts=[];
  if(h) parts.push(h===1?'yüz':`${ones[h]} yüz`);
  if(t) parts.push(tens[t]);
  if(o) parts.push(ones[o]);
  return parts.join(' ');
}



function p2TableFactorsForDifficulty(d){ return d<=1?[2,5,10]:[2,3,4,5,10]; }
function times23510Cases(d=4){
  const factors=p2TableFactorsForDifficulty(d), maxMultiplier=d===1?5:d===2?7:10, rows=[];
  for(const factor of factors) for(let multiplier=1;multiplier<=maxMultiplier;multiplier++) rows.push({factor,multiplier,total:factor*multiplier});
  return rows;
}
function divisionTables2Cases(d=4){
  const rows=[];
  for(const z of times23510Cases(d)){
    rows.push({...z,mode:'sharing',groups:z.multiplier,each:z.factor,divisor:z.multiplier,quotient:z.factor});
    rows.push({...z,mode:'grouping',groups:z.multiplier,each:z.factor,divisor:z.factor,quotient:z.multiplier});
  }
  return rows;
}
function multDivFamily2Cases(d=4){ return times23510Cases(d).filter(z=>z.multiplier!==z.factor); }
function makeP2Concept(skillId,conceptKey,d,rng,all,anchorFilter=()=>true){
  const anchors=all.filter(anchorFilter), anchor=choice(anchors.length?anchors:all,rng);
  const rest=all.filter(z=>JSON.stringify(z)!==JSON.stringify(anchor));
  const [symbol,transfer]=pickDifferent(rest.length>=2?rest:all,2,rng);
  return {version:2,skillId,conceptKey,difficulty:d,anchor,symbol,transfer};
}


function lengthMetre2Cases(){ return [2,3,4,5,6,7,8,9,10,11,12].map(m=>({m})); }
function massMetric2Cases(){
  return [
    {amount:50,unit:'g',object:'silgi'},{amount:100,unit:'g',object:'elma'},{amount:200,unit:'g',object:'küçük kitap'},
    {amount:300,unit:'g',object:'kalem kutusu'},{amount:500,unit:'g',object:'küçük paket'},{amount:700,unit:'g',object:'paket'},
    {amount:1,unit:'kg',object:'pirinç paketi'},{amount:2,unit:'kg',object:'karpuz'},{amount:3,unit:'kg',object:'sırt çantası'},
    {amount:4,unit:'kg',object:'alışveriş torbası'},{amount:5,unit:'kg',object:'un paketi'},{amount:6,unit:'kg',object:'kutu'}
  ];
}
function volumeLitre2Cases(){ return [1,2,3,4,5,6,7,8].map(litres=>({litres})); }
function timeMinute2Cases(){
  const minutes=[2,7,13,18,23,29,34,41,47,52,58], out=[];
  for(let i=0;i<minutes.length;i++) out.push({hour:(i%11)+1,minute:minutes[i],label:`${(i%11)+1}:${String(minutes[i]).padStart(2,'0')}`});
  out.push({hour:12,minute:1,label:'12:01'},{hour:6,minute:36,label:'6:36'},{hour:9,minute:54,label:'9:54'});
  return out;
}
function timeDuration2Cases(){
  return [65,73,85,95,110,125,140,155,167].map(totalMinutes=>({totalMinutes,hours:Math.floor(totalMinutes/60),minutes:totalMinutes%60}));
}
function moneyP2Cases(){
  return [125,145,175,220,245,275,300,345,375,425,550,675].map(cents=>({
    cents,lira:Math.floor(cents/100),kurus:cents%100,decimal:`${Math.floor(cents/100)},${String(cents%100).padStart(2,'0')} TL`
  }));
}
function measurementDenoms(unit){
  if(unit==='g') return [500,200,100,50];
  if(unit==='kg') return [5,2,1];
  return [1];
}


function p2ShapePatternCases(){
  const T=(shape,size='medium',colour='teal',orientation=0)=>`${shape}|${size}|${colour}|${orientation}`;
  return [
    {items:[T('triangle'),T('square'),T('triangle'),T('square')],next:T('triangle'),code:'ABAB',attrs:['shape'],rule:'Şekil üçgen ve kare olarak sırayla değişiyor'},
    {items:[T('circle','small'),T('circle','large'),T('circle','small'),T('circle','large')],next:T('circle','small'),code:'ABAB',attrs:['size'],rule:'Boyut küçük ve büyük olarak sırayla değişiyor'},
    {items:[T('square','medium','teal'),T('square','medium','amber'),T('square','medium','teal'),T('square','medium','amber')],next:T('square','medium','teal'),code:'ABAB',attrs:['colour'],rule:'Renk iki seçenek arasında sırayla değişiyor'},
    {items:[T('triangle','medium','teal',0),T('triangle','medium','teal',180),T('triangle','medium','teal',0),T('triangle','medium','teal',180)],next:T('triangle','medium','teal',0),code:'ABAB',attrs:['orientation'],rule:'Yön yukarı ve aşağı olarak sırayla değişiyor'},
    {items:[T('triangle','medium','teal'),T('square','medium','amber'),T('triangle','medium','teal'),T('square','medium','amber')],next:T('triangle','medium','teal'),code:'ABAB',attrs:['shape','colour'],rule:'Hem şekil hem renk iki durum arasında birlikte değişiyor'},
    {items:[T('triangle','small','teal',0),T('triangle','large','teal',180),T('triangle','small','teal',0),T('triangle','large','teal',180)],next:T('triangle','small','teal',0),code:'ABAB',attrs:['size','orientation'],rule:'Boyut ve yön birlikte sırayla değişiyor'},
    {items:[T('circle','small','blue'),T('square','large','blue'),T('circle','small','blue'),T('square','large','blue')],next:T('circle','small','blue'),code:'ABAB',attrs:['shape','size'],rule:'Şekil ve boyut birlikte iki durum arasında değişiyor'},
    {items:[T('rect','medium','rose',0),T('rect','medium','blue',90),T('rect','medium','rose',0),T('rect','medium','blue',90)],next:T('rect','medium','rose',0),code:'ABAB',attrs:['colour','orientation'],rule:'Renk ve yön birlikte sırayla değişiyor'},
    {items:[T('circle','medium','amber'),T('triangle','medium','teal'),T('square','medium','blue'),T('circle','medium','amber'),T('triangle','medium','teal')],next:T('square','medium','blue'),code:'ABCABC',attrs:['shape','colour'],rule:'Üç farklı şekil-renk çifti aynı sırayla tekrar ediyor'},
    {items:[T('square','small','teal'),T('square','medium','teal'),T('square','large','teal'),T('square','small','teal'),T('square','medium','teal')],next:T('square','large','teal'),code:'ABCABC',attrs:['size'],rule:'Boyut küçük, orta, büyük sırasıyla tekrar ediyor'}
  ];
}
function p2SolidCases(){
  return [
    {id:'cube',name:'Küp',kind:'cube',classKey:'flat-only',property:'6 kare düz yüzü, 12 kenarı ve 8 köşesi vardır',scene:'dice',roll:'Kolay yuvarlanmaz'},
    {id:'cuboid',name:'Dikdörtgen prizma',kind:'cuboid',classKey:'flat-only',property:'6 dikdörtgensel düz yüzü, 12 kenarı ve 8 köşesi vardır',scene:'box',roll:'Kolay yuvarlanmaz'},
    {id:'cone',name:'Koni',kind:'cone',classKey:'flat-curved',property:'1 dairesel düz yüzü, 1 eğri yüzeyi ve 1 köşesi vardır',scene:'cone',roll:'Eğri yüzeyi üzerinde yuvarlanabilir'},
    {id:'cylinder',name:'Silindir',kind:'cylinder',classKey:'flat-curved',property:'2 dairesel düz yüzü ve 1 eğri yüzeyi vardır; köşesi yoktur',scene:'can',roll:'Eğri yüzeyi üzerinde yuvarlanabilir'},
    {id:'sphere',name:'Küre',kind:'sphere',classKey:'curved-only',property:'Düz yüzü, kenarı ve köşesi yoktur; eğri yüzeyi vardır',scene:'ball',roll:'Her yönde yuvarlanabilir'}
  ];
}
function scaledPictureGraphCases(){
  return [
    {cats:['Elma','Armut','Muz'],icons:[3,5,2],scale:2},
    {cats:['Mavi','Yeşil','Sarı'],icons:[4,2,5],scale:2},
    {cats:['Kitap','Top','Kalem'],icons:[2,4,3],scale:5},
    {cats:['Kedi','Köpek','Kuş'],icons:[5,3,2],scale:2},
    {cats:['Pzt','Sal','Çar'],icons:[3,5,4],scale:5},
    {cats:['A','B','C'],icons:[2,5,3],scale:10},
    {cats:['Çilek','Kiraz','Üzüm'],icons:[4,3,5],scale:2},
    {cats:['Kırmızı','Mavi','Mor'],icons:[5,2,4],scale:5}
  ].map(x=>({...x,vals:x.icons.map(n=>n*x.scale)}));
}

function fractionMeaning2Cases(maxDenom=12){
  return Array.from({length:Math.max(1,maxDenom-1)},(_,i)=>({denom:i+2,numerator:1}));
}
function fractionNotation2Cases(maxDenom=12){
  const rows=[];
  for(let denom=2;denom<=maxDenom;denom++) for(let numerator=1;numerator<denom;numerator++) rows.push({denom,numerator});
  return rows;
}
function fractionCompare2Cases(maxDenom=12){
  const rows=[];
  for(let a=2;a<=maxDenom;a++) for(let b=a+1;b<=maxDenom;b++){
    rows.push({kind:'unit',left:{numerator:1,denom:a},right:{numerator:1,denom:b},relation:'>',larger:'left'});
    rows.push({kind:'unit',left:{numerator:1,denom:b},right:{numerator:1,denom:a},relation:'<',larger:'right'});
  }
  for(let denom=3;denom<=maxDenom;denom++){
    for(let a=1;a<denom;a++) for(let b=a+1;b<denom;b++){
      rows.push({kind:'like',left:{numerator:a,denom},right:{numerator:b,denom},relation:'<',larger:'right'});
      rows.push({kind:'like',left:{numerator:b,denom},right:{numerator:a,denom},relation:'>',larger:'left'});
    }
  }
  return rows;
}
function fractionAddSub2Cases(maxDenom=12){
  const rows=[];
  for(let denom=3;denom<=maxDenom;denom++){
    for(let a=1;a<denom;a++) for(let b=1;b<denom;b++){
      if(a+b<=denom) rows.push({op:'+',denom,a,b,result:a+b});
      if(a>b) rows.push({op:'−',denom,a,b,result:a-b});
    }
  }
  return rows;
}
function fractionPoolForDifficulty(kind,d){
  const max=d===1?4:d===2?6:d===3?8:12;
  if(kind==='meaning') return fractionMeaning2Cases(max);
  if(kind==='notation') return fractionNotation2Cases(max);
  if(kind==='compare') return fractionCompare2Cases(max);
  return fractionAddSub2Cases(max);
}

export function createConceptInstance(skillId,difficulty=1,rng=Math.random){
  const d=clamp(difficulty,1,4);
  const make=(conceptKey,cases)=>{
    const [anchor,symbol,transfer]=pickDifferent(cases,3,rng);
    return {version:2,skillId,conceptKey,difficulty:d,anchor,symbol,transfer};
  };
  if(skillId==='nelMatchAttributes') return make('nel-matching-by-attribute',nelMatchCases());
  if(skillId==='nelSortAttributes') return make('nel-sorting-by-attribute',nelSortCases());
  if(skillId==='nelCompareAttributes') return make('nel-comparing-by-attribute',nelCompareCases());
  if(skillId==='number20') return make('number-to-20',number20Cases());
  if(skillId==='numberBonds10') return make('number-bonds-to-10',numberBondCases());
  if(skillId==='make10') return make('make-ten',make10Cases());
  if(skillId==='add20') return make('addition-strategy-within-20',add20Cases());
  if(skillId==='addMany1') return make('multi-addend-within-20',addMany1Cases());
  if(skillId==='sub20') return make('subtraction-strategy-within-20',sub20Cases());
  if(skillId==='equality') return make('equality-and-fact-family',equalityCases());
  if(skillId==='word1') return make('one-step-problem-structures',word1Cases());
  if(skillId==='number100') return make('numbers-to-100-place-value',number100Cases());
  if(skillId==='compareOrder100') return make('compare-order-to-100',compare100Cases());
  if(skillId==='ordinal10') return make('ordinal-position-to-10',ordinalCases());
  if(skillId==='numberPattern1') return make('one-ten-more-less-patterns',pattern1Cases());
  if(skillId==='addSub100'){ const all=addSub100Cases(); const cases=d<=1?all.filter(z=>z.mode!=='algorithm'):d===2?all.filter(z=>!z.renaming):d===3?all.filter(z=>z.mode==='algorithm'&&!z.renaming):all.filter(z=>z.mode==='algorithm'); return make('addition-subtraction-within-100',cases); }
  if(skillId==='multiply40') return make('equal-groups-multiplication',multiply40Cases());
  if(skillId==='divide20g1') return make('sharing-grouping-division',divide20CasesG1());
  if(skillId==='money1') return make('money-value-and-exchange',money1Cases());
  if(skillId==='lengthCompare1') return make('centimetre-length-comparison',length1Cases());
  if(skillId==='lengthMeasure1') return make('centimetre-length-measurement',lengthMeasureCases());
  if(skillId==='time1') return make('time-five-minutes-period-duration',time1Cases());
  if(skillId==='shapes1') return make('shape-properties',shapes1Cases());
  if(skillId==='shapePattern1') return make('shape-composition-and-copying',shapePatternCases());
  if(skillId==='data1') return make('pictograph-data',data1Cases());
  if(skillId==='number1000') return make('numbers-to-1000-place-value',number1000Cases());
  if(skillId==='compareOrder1000') return make('compare-order-to-1000',compare1000Cases());
  if(skillId==='numberPattern1000') return make('one-ten-hundred-patterns-to-1000',pattern1000Cases());
  if(skillId==='oddEven1000') return make('odd-even-pairing-to-1000',oddEven1000Cases());
  if(skillId==='addSub1000'){
    const all=addSub1000Cases();
    const cases=d===1?all.filter(z=>z.mode==='mental'):d===2?all.filter(z=>z.mode!=='regroup'):d===3?all.filter(z=>z.mode!=='mental'):all.filter(z=>z.mode==='regroup');
    return make('addition-subtraction-within-1000',cases);
  }
  if(skillId==='wordAddSub2') return make('one-two-step-add-sub-problems',wordAddSub2Cases());
  if(skillId==='times23510') return make('tables-2-3-4-5-10',times23510Cases(d));
  if(skillId==='divisionTables2'){ const all=divisionTables2Cases(d); return makeP2Concept(skillId,'division-symbol-within-tables',d,rng,all,z=>z.total<=24&&z.groups<=6); }
  if(skillId==='multDivFamilies2'){ const all=multDivFamily2Cases(d); return makeP2Concept(skillId,'multiplication-division-fact-families',d,rng,all,z=>z.total<=30&&z.multiplier<=6); }
  if(skillId==='fractionMeaning2') return make('fraction-equal-parts-whole',fractionPoolForDifficulty('meaning',d));
  if(skillId==='fractionNotation2') return make('fraction-notation-representation',fractionPoolForDifficulty('notation',d));
  if(skillId==='fractionCompare2') return make('fraction-compare-unit-like',fractionPoolForDifficulty('compare',d));
  if(skillId==='fractionAddSub2') return make('fraction-like-add-sub',fractionPoolForDifficulty('addsub',d));
  if(skillId==='lengthMetre2') return make('length-in-metres',lengthMetre2Cases());
  if(skillId==='massMetric2') return make('mass-grams-kilograms',massMetric2Cases());
  if(skillId==='volumeLitre2') return make('liquid-volume-litres',volumeLitre2Cases());
  if(skillId==='timeMinute2') return make('time-to-the-minute',timeMinute2Cases());
  if(skillId==='timeDuration2') return make('hours-minutes-duration-conversion',timeDuration2Cases());
  if(skillId==='moneyP2') return make('money-decimal-cents-conversion',moneyP2Cases());
  if(skillId==='shapePatterns2') return make('p2-shape-pattern-attributes',p2ShapePatternCases());
  if(skillId==='solids2') return make('p2-solid-identify-classify',p2SolidCases());
  if(skillId==='pictureGraphScale2') return make('p2-scaled-picture-graphs',scaledPictureGraphCases());
  if(skillId==='shapes2') return make('solid-properties-and-invariance',shapes2Cases());
  return null;
}


function genNelMatchAttributes(rep,d,rng,concept){
  const c=concept?.skillId==='nelMatchAttributes'?concept:createConceptInstance('nelMatchAttributes',d,rng);
  const x=c.anchor;
  const distractors=nelMatchCases().filter(z=>z.attribute!==x.attribute).map(z=>nelMatchReason(z.attribute));
  if(rep==='build'){
    return qTask('nelMatchAttributes','build','Hedefteki nesnenin aynısını eşleştir.',x.answer.id,{kind:'manipulative',interaction:'nel-match-pair',expectedValue:x.answer.id,checkLabel:'Eşimi kontrol et'},{
      taskKind:'nel-match-build',taskLabel:'Aynı nesneyi eşleştir',visual:{type:'nel-match-builder',target:x.target,options:x.options,attribute:x.attribute},
      hint:'Renk, şekil ve büyüklüğün hepsine bak.',explain:nelMatchReason('exact')
    });
  }
  if(rep==='see'){
    return qTask('nelMatchAttributes','see','Hedefle aynı '+x.attributeLabel+' olan nesneyi bul.','correct',{kind:'visual-choice',options:x.options.map(item=>({value:item.id===x.answer.id?'correct':item.id,visual:{type:'nel-match-token',item},ariaLabel:'eşleştirme seçeneği'}))},{
      taskKind:'nel-match-see',taskLabel:'Ortak özelliği görselde ayırt et',visual:{type:'nel-match-target',target:x.target,attributeLabel:x.attributeLabel},
      hint:'Yalnız '+x.attributeLabel+' karşılaştır.',explain:nelMatchReason(x.attribute)
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('nelMatchAttributes','symbol','Aynı '+y.attributeLabel+' olanı göster.','correct',{kind:'visual-choice',options:y.options.map(item=>({value:item.id===y.answer.id?'correct':item.id,visual:{type:'nel-match-token',item},ariaLabel:'gösterme seçeneği'}))},{
      taskKind:'nel-match-show',taskLabel:'Eş olan nesneyi göster',visual:{type:'nel-match-target',target:y.target,attributeLabel:y.attributeLabel},
      hint:'Hedefteki '+y.attributeLabel+' aklında tut.',explain:nelMatchReason(y.attribute)
    });
  }
  if(rep==='explain'){
    const answer=nelMatchReason(x.attribute);
    return qBase('nelMatchAttributes','explain','Bu iki nesne neden eş olabilir?',answer,semanticChoices(answer,distractors,rng),{
      taskKind:'nel-match-explain',taskLabel:'Eşleştirme nedenini açıkla',visual:{type:'nel-match-pair-card',left:x.target,right:x.answer},
      hint:'İkisinde ortak olan özelliği söyle.',explain:answer
    });
  }
  const y=c.transfer;
  return qTask('nelMatchAttributes','transfer','Oyuncak kutusunda hedef oyuncağa aynı '+y.attributeLabel+' sahip olanı seç.','correct',{kind:'visual-choice',options:y.options.map(item=>({value:item.id===y.answer.id?'correct':item.id,visual:{type:'nel-match-token',item},ariaLabel:'oyuncak eşleştirme seçeneği'}))},{
    taskKind:'nel-match-transfer',taskLabel:'Eşleştirmeyi günlük duruma taşı',visual:{type:'nel-match-context',target:y.target,attributeLabel:y.attributeLabel},
    hint:'Oyuncakların '+y.attributeLabel+' karşılaştır.',explain:nelMatchReason(y.attribute)
  });
}


function genNelSortAttributes(rep,d,rng,concept){
  const c=concept?.skillId==='nelSortAttributes'?concept:createConceptInstance('nelSortAttributes',d,rng);
  const x=c.anchor;
  const expected=nelSortExpected(x);

  if(rep==='build'){
    return qTask('nelSortAttributes','build','Nesneleri '+x.attributeLabel+' özelliğine göre iki gruba ayır.',expected,{kind:'manipulative',interaction:'nel-sort-bin',expectedValue:expected,checkLabel:'Gruplarımı kontrol et'},{
      taskKind:'nel-sort-build',taskLabel:'Nesneleri bir özelliğe göre sınıfla',
      visual:{type:'nel-sort-builder',attribute:x.attribute,attributeLabel:x.attributeLabel,bins:x.bins,items:x.items},
      hint:'Her nesne için yalnız '+x.attributeLabel+' özelliğine bak.',explain:'Nesneler '+x.ruleLabel.toLowerCase()+' iki gruba ayrıldı.'
    });
  }

  if(rep==='see'){
    return qBase('nelSortAttributes','see','Bu iki grup hangi kurala göre oluşturulmuş?',x.ruleLabel,semanticChoices(x.ruleLabel,nelSortRuleDistractors(x.ruleLabel),rng),{
      taskKind:'nel-sort-see',taskLabel:'Sınıflama kuralını görselden fark et',
      visual:{type:'nel-sort-display',attribute:x.attribute,bins:x.bins,items:x.items},
      hint:'Aynı kutudaki nesnelerin ortak özelliğini ara.',explain:'Gruplama '+x.ruleLabel.toLowerCase()+' yapılmış.'
    });
  }

  if(rep==='symbol'){
    const y=c.symbol;
    const target=y.items[0];
    const targetBin=String(target[y.attribute]);
    const answer=y.bins.find(bin=>bin.value===targetBin)?.label||targetBin;
    return qBase('nelSortAttributes','symbol','Hedef nesne hangi gruba konmalı?',answer,semanticChoices(answer,y.bins.map(bin=>bin.label).filter(label=>label!==answer),rng),{
      taskKind:'nel-sort-show',taskLabel:'Nesnenin ait olduğu grubu göster',
      visual:{type:'nel-sort-target',attribute:y.attribute,attributeLabel:y.attributeLabel,bins:y.bins,items:y.items,target},
      hint:'Bu görevde '+y.attributeLabel+' özelliğine bak.',explain:'Hedef nesne '+answer.toLowerCase()+' grubuna gider.'
    });
  }

  if(rep==='explain'){
    const tone=nelSortCaseForAttribute('tone'), shape=nelSortCaseForAttribute('shape');
    const answer='Aynı nesnelerin birden fazla özelliği vardır.';
    return qBase('nelSortAttributes','explain','Aynı nesneler neden farklı iki kuralla yeniden sınıflanabilir?',answer,semanticChoices(answer,['Nesneler sınıflanınca özelliklerini kaybeder.','Her nesnenin yalnız bir özelliği vardır.','Grupların kuralı önemli değildir.'],rng),{
      taskKind:'nel-sort-explain',taskLabel:'Yeniden sınıflamanın nedenini açıkla',
      visual:{type:'nel-sort-two-rules',first:{attribute:tone.attribute,bins:tone.bins,items:tone.items.slice(0,4)},second:{attribute:shape.attribute,bins:shape.bins,items:shape.items.slice(0,4)}},
      hint:'Bir nesnenin hem rengi hem şekli olabilir.',explain:answer
    });
  }

  const y=c.transfer;
  const transferExpected=nelSortExpected(y);
  return qTask('nelSortAttributes','transfer','Oyuncakları '+y.attributeLabel+' özelliğine göre kutulara ayır.',transferExpected,{kind:'manipulative',interaction:'nel-sort-bin',expectedValue:transferExpected,checkLabel:'Kutularımı kontrol et'},{
    taskKind:'nel-sort-transfer',taskLabel:'Sınıflamayı günlük bir duruma taşı',
    visual:{type:'nel-sort-builder',context:'toy-box',attribute:y.attribute,attributeLabel:y.attributeLabel,bins:y.bins,items:y.items},
    hint:'Kutulara koyarken yalnız '+y.attributeLabel+' özelliğini kullan.',explain:'Aynı sınıflama fikri oyuncakları düzenlerken de kullanılabilir.'
  });
}

function genNelCompareAttributes(rep,d,rng,concept){
  const c=concept?.skillId==='nelCompareAttributes'?concept:createConceptInstance('nelCompareAttributes',d,rng);
  const x=c.anchor;
  const label=nelCompareAnswerLabel(x);
  const choices=nelCompareChoiceLabels(x);
  if(rep==='build'){
    const expected=nelCompareExpected(x);
    return qTask('nelCompareAttributes','build','İki nesneyi '+x.attributeLabel+' özelliğine göre karşılaştır.',expected,{kind:'manipulative',interaction:'nel-compare-pair',expectedValue:expected,checkLabel:'Karşılaştırmamı kontrol et'},{
      taskKind:'nel-compare-build',taskLabel:'İki nesneyi doğrudan karşılaştır',
      visual:{type:'nel-compare-builder',left:x.left,right:x.right,attribute:x.attribute,attributeLabel:x.attributeLabel,labels:x.labels,requiresAlign:x.requiresAlign},
      hint:x.requiresAlign?'Başlangıç noktalarını aynı hizaya getir; sonra uçlara bak.':'Yalnız '+x.attributeLabel+' özelliğine bak.',
      explain:nelCompareExplain(x)
    });
  }
  if(rep==='see'){
    return qBase('nelCompareAttributes','see','Bu iki nesne için doğru karşılaştırma hangisi?',label,semanticChoices(label,[...choices.filter(v=>v!==label),'Karşılaştırmak için bilgi eksik'],rng),{
      taskKind:'nel-compare-see',taskLabel:'Karşılaştırma ilişkisini gör',
      visual:{type:'nel-compare-pair',left:x.left,right:x.right,attribute:x.attribute,attributeLabel:x.attributeLabel,aligned:true},
      hint:'İki nesnenin yalnız '+x.attributeLabel+' özelliğini karşılaştır.',explain:nelCompareExplain(x)
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, answer=nelCompareAnswerLabel(y);
    return qBase('nelCompareAttributes','symbol','Doğru karşılaştırma cümlesini göster.',answer,semanticChoices(answer,[...nelCompareChoiceLabels(y).filter(v=>v!==answer),'Karşılaştırmak için bilgi eksik'],rng),{
      taskKind:'nel-compare-show',taskLabel:'Karşılaştırma cümlesini göster',
      visual:{type:'nel-compare-pair',left:y.left,right:y.right,attribute:y.attribute,attributeLabel:y.attributeLabel,aligned:true},
      hint:'İlişkiyi bir karşılaştırma cümlesiyle göster.',explain:nelCompareExplain(y)
    });
  }
  if(rep==='explain'){
    const answer=x.attributeAnswer;
    const wrong=[...['Büyüklüklerine göre','Uzunluklarına göre','Yüksekliklerine göre'].filter(v=>v!==answer),'Renklerine göre'];
    return qBase('nelCompareAttributes','explain','Bu karşılaştırmada hangi özelliğe bakıyoruz?',answer,semanticChoices(answer,wrong,rng),{
      taskKind:'nel-compare-explain',taskLabel:'Karşılaştırma özelliğini açıkla',
      visual:{type:'nel-compare-pair',left:x.left,right:x.right,attribute:x.attribute,attributeLabel:x.attributeLabel,aligned:true},
      hint:'Renk ve şekil değişse bile hangi ölçüye baktığını söyle.',explain:answer+' karşılaştırıyoruz.'
    });
  }
  const y=c.transfer, answer=nelCompareAnswerLabel(y);
  return qBase('nelCompareAttributes','transfer','Günlük nesnelerde aynı '+y.attributeLabel+' özelliğini karşılaştırırsan hangisini söylersin?',answer,semanticChoices(answer,[...nelCompareChoiceLabels(y).filter(v=>v!==answer),'Karşılaştırmak için bilgi eksik'],rng),{
    taskKind:'nel-compare-transfer',taskLabel:'Karşılaştırmayı günlük bir duruma taşı',
    visual:{type:'nel-compare-context',left:y.left,right:y.right,attribute:y.attribute,attributeLabel:y.attributeLabel,aligned:true},
    hint:'Nesnelerin türü değil, seçtiğin '+y.attributeLabel+' özelliği önemli.',explain:nelCompareExplain(y)
  });
}

function genSubitize(rep,d,rng){
  const n=randInt(2,Math.min(5,3+d),rng);
  if(rep==='explain') return qBase('subitize5',rep,'Noktaları tek tek saymadan nasıl daha hızlı görebilirsin?','Küçük grupları birleştiririm',semanticChoices('Küçük grupları birleştiririm',['Rastgele seçerim','Rengine bakarım','Ekranı kapatırım'],rng),{visual:{type:'dots',n},hint:'Örneğin 2 ve 2’yi birlikte fark edebilirsin.',explain:`${n} noktayı küçük gruplar olarak görmek saymadan miktarı fark etmeyi kolaylaştırır.`});
  return qBase('subitize5',rep,'Bir bakışta kaç nokta var?',n,numericChoices(n,2,rng),{visual:{type:'dots',n},hint:'Noktaları 2+2 gibi küçük gruplar halinde gör.',explain:`Burada ${n} nokta var. Miktarı tek tek saymadan da görebilirsin.`});
}
function genCount10(rep,d,rng){
  const n=randInt(4,Math.min(10,6+d*2),rng);
  if(rep==='transfer') return qBase('count10',rep,`Masaya ${n} düğme koymak istiyorsun. Kaç düğme seçmelisin?`,n,numericChoices(n,3,rng),{visual:{type:'buttons',n:Math.max(1,n-2)},hint:'İstenen son sayıya kadar her nesneyi bir kez say.',explain:`Hedef ${n}; sayarken her nesne yalnız bir sayı sözcüğüyle eşleşir.`});
  return qBase('count10',rep,'Nesneleri say. Kaç tane?',n,numericChoices(n,3,rng),{visual:{type:'objects',n},hint:'Her nesneye bir kez dokunuyormuş gibi sırayla say.',explain:`Son söylediğin sayı, toplam nesne sayısını gösterir: ${n}.`});
}
function genCompare10(rep,d,rng){
  let a=randInt(2,8,rng), b=randInt(2,8,rng); if(a===b) b=Math.min(10,b+1);
  const answer=a>b?'Sol':'Sağ';
  if(rep==='symbol') return qBase('compare10',rep,`${a} __ ${b} boşluğuna hangi işaret gelir?`,a>b?'>':'<',semanticChoices(a>b?'>':'<',[a>b?'<':'>','=','+'],rng),{hint:'Ağzı büyük sayıya açılan işareti seç.',explain:`${Math.max(a,b)} daha büyük olduğu için doğru karşılaştırma ${a} ${a>b?'>':'<'} ${b}.`});
  return qBase('compare10',rep,'Hangi tarafta daha çok var?',answer,semanticChoices(answer,[answer==='Sol'?'Sağ':'Sol','Eşit','Belli değil'],rng),{visual:{type:'compare',a,b},hint:'İki grubu eşleştir; artan taraf daha çoktur.',explain:`${a} ile ${b} karşılaştırıldığında ${answer.toLowerCase()} tarafta daha çok var.`});
}
function genPartWhole5(rep,d,rng){
  const whole=randInt(3,5,rng), part=randInt(1,whole-1,rng), missing=whole-part;
  return qBase('partwhole5',rep,`${whole}’yi ${part} ve kaç olarak ayırabiliriz?`,missing,numericChoices(missing,2,rng),{visual:{type:'partwhole',whole,part,missing:rep==='build'?null:missing},hint:`Bütünü ${whole} yapacak eksik parçayı bul.`,explain:`${part} + ${missing} = ${whole}; parçalar bütünü oluşturur.`});
}
function genPattern(rep,d,rng){
  const sets=[['●','▲'],['■','●'],['★','●']]; const [a,b]=choice(sets,rng); const seq=[a,b,a,b,a];
  return qBase('patternAB',rep,'Örüntüde sıradaki şekil hangisi?',b,semanticChoices(b,[a,'◆','■','●','▲','★'].filter(x=>x!==b),rng),{visual:{type:'pattern',items:seq},hint:'Tekrar eden en küçük parçayı bul.',explain:`Örüntü ${a}, ${b} diye tekrar ediyor; sıradaki ${b}.`});
}
function genNumber20(rep,d,rng,concept){
  const c=concept?.skillId==='number20'?concept:createConceptInstance('number20',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('number20',rep,`${x.n} sayısını hücrelere dokunarak kur.`,x.n,{kind:'manipulative',interaction:'twentyframe-build',expectedValue:String(x.n),checkLabel:'Modelimi kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Miktarı sen oluştur',visual:{type:'twentyframe-build-interactive',target:x.n},hint:'Önce bir onluğu tamamlayabilir, sonra kalan hücrelere geçebilirsin.',explain:`${x.n}, ${x.n>=10?`10 + ${x.n-10}`:x.n} olarak kurulabilir.`
  });
  if(rep==='see'){
    const vals=[x.n,Math.max(1,x.n-1),Math.min(20,x.n+1)];
    if(new Set(vals).size<3) vals[2]=Math.max(1,x.n-2);
    const opts=shuffled(vals.map((n,i)=>({value:n===x.n?'correct':`wrong-${i}`,visual:{type:'twentyframe-model',n},ariaLabel:`${n} miktarını gösteren model`})),rng);
    return qTask('number20',rep,`${x.n} sayısını gösteren model hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Sayıyı modelde bul',visual:{type:'numbercard',n:x.n},hint:'Bir tam onluğu ve kalanları ayrı ayrı fark et.',explain:`Doğru model ${x.n>=10?`10 + ${x.n-10}`:x.n} miktarını gösterir.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('number20',rep,'Bu model hangi sayıyı gösteriyor?',y.n,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Sayımı kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Modeli sayıyla yaz',visual:{type:'twentyframe-model',n:y.n},hint:'Dolu onluğu 10 kabul et, sonra kalanları ekle.',explain:`Model ${y.n>=10?`10 + ${y.n-10}`:y.n} = ${y.n} gösteriyor.`
    });
  }
  if(rep==='explain'){
    const rest=x.n-10;
    const answer=x.n>=10?`${x.n} sayısı bir onluk ve ${rest} birliktir`:`${x.n} sayısı ${x.n} birliktir`;
    return qBase('number20',rep,`${x.n} sayısını düşünürken hangi açıklama doğrudur?`,answer,semanticChoices(answer,x.n>=10?[`${x.n} sayısı ${x.n} onluktur`,`${x.n} sayısı yalnız ${rest} birliktir`,'Onluk ve birlik arasında ilişki yoktur']:[`${x.n} sayısı bir onluktur`,'Sayı yalnız rakamın şeklini anlatır','Her sayı 10 birliktir'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Sayı yapısını açıkla',visual:{type:'twentyframe-model',n:x.n},hint:'10 dolu hücre bir onluk gibi düşünülebilir.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  if(y.n>=10){
    const rest=y.n-10;
    return qTask('number20',rep,`Bir kutuda 10 boncuk var. Yanına ${rest} boncuk daha kondu. Toplam kaç boncuk oldu?`,y.n,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'},{
      taskKind:'context-transfer',taskLabel:'Sayıyı günlük duruma taşı',visual:{type:'bead-bundle-story',rest},hint:'Bir tam kutu 10 boncuk. Yanındaki boncukları buna ekle.',explain:`10 + ${rest} = ${y.n}. Aynı sayı farklı bir günlük durumda da aynı miktarı temsil eder.`
    });
  }
  const first=Math.max(1,Math.floor(y.n/2)), second=y.n-first;
  return qTask('number20',rep,`Bir kutuda ${first} kırmızı ve ${second} mavi boncuk var. Kutuda toplam kaç boncuk var?`,y.n,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Sayıyı günlük duruma taşı',visual:{type:'two-color-bead-story',first,second},hint:'İki renkteki boncuklar aynı toplam miktarın parçalarıdır.',explain:`${first} + ${second} = ${y.n}. Aynı sayı farklı bir günlük durumda da aynı miktarı temsil eder.`
  });
}
function genMake10(rep,d,rng,concept){
  const c=concept?.skillId==='make10'?concept:createConceptInstance('make10',d,rng);
  const {a,missing}=c.anchor;
  if(rep==='build') return qTask('make10',rep,'Onluk çerçevesini 10 yap. Boş yerlere gereken kadar taşı yerleştir.',missing,{kind:'manipulative',interaction:'tenframe-complete',expectedValue:String(missing),checkLabel:'Kurduğumu kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Modeli sen kur',visual:{type:'tenframe-complete-interactive',initial:a,pool:Math.min(9,missing+2)},hint:'Dolu ve boş hücreleri birlikte düşün. Çerçeve tam dolduğunda 10 olur.',explain:`${a} dolu yer vardı. ${missing} yer daha doldurunca 10 oldu: ${a}+${missing}=10.`
  });
  if(rep==='see'){
    const low=Math.max(0,missing-1), high=missing+1;
    const opts=shuffled([
      {value:'correct',visual:{type:'tenframe-completion-model',base:a,added:missing},ariaLabel:`${a} üzerine ${missing} eklenmiş model`},
      {value:'low',visual:{type:'tenframe-completion-model',base:a,added:low},ariaLabel:`${a} üzerine ${low} eklenmiş model`},
      {value:'high',visual:{type:'tenframe-completion-model',base:a,added:high},ariaLabel:`${a} üzerine ${high} eklenmiş model`},
    ],rng);
    return qTask('make10',rep,`${a} sayısını 10'a tamamlayan model hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Doğru modeli bul',visual:{type:'numbercard',n:a},hint:'Doğru modelde çerçevenin toplamı tam 10 olmalı.',explain:`${a} için eksik parça ${missing}. Doğru model ${a}+${missing}=10 ilişkisini gösterir.`
    });
  }
  if(rep==='symbol'){
    const x=c.symbol;
    return qTask('make10',rep,`${x.a} + □ = 10`,x.missing,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Cevabı kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Sembolle yaz',visual:{type:'equation',text:`${x.a} + □ = 10`},hint:'10 ile verilen sayı arasındaki eksik parçayı düşün.',explain:`${x.a}+${x.missing}=10.`
    });
  }
  if(rep==='explain'){
    const answer=`${a} ile ${missing} birlikte 10 yaptığı için`;
    return qBase('make10',rep,`${a} sayısını 10'a tamamlarken neden ${missing} eklemek işe yarar?`,answer,semanticChoices(answer,[`${missing} her zaman en büyük sayı olduğu için`,'Toplama işaretini değiştirdiği için',`${a} sayısını küçülttüğü için`],rng),{
      taskKind:'reasoning-choice',taskLabel:'Nedenini seç',visual:{type:'partwhole',whole:10,part:a,missing},hint:'Parça–bütün ilişkisini düşün.',explain:`10 bütündür; ${a} ve ${missing} onun iki parçasıdır.`
    });
  }
  const x=c.transfer;
  return qTask('make10',rep,`Bir sırada 10 koltuk var. ${x.a} koltuk dolu. Sıranın tamamen dolması için kaç kişi daha oturmalı?`,x.missing,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Çözümümü kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Yeni durumda kullan',visual:{type:'seat-row',occupied:x.a,total:10},hint:'Dolu koltuklarla boş koltukların toplamı 10 olmalı.',explain:`${x.a} dolu + ${x.missing} boş = 10 koltuk.`
  });
}
function genAdd20(rep,d,rng,concept){
  const c=concept?.skillId==='add20'?concept:createConceptInstance('add20',d,rng);
  const x=c.anchor;
  const strategyLabel=v=>({countOn:'İleri say',makeTen:'10 yap',double:'Çifti kullan',nearDouble:'Yakın çifti kullan'}[v.strategy]||'Parça–bütün kullan');
  const strategyWhy=v=>{
    if(v.strategy==='countOn') return `${v.a}'dan başlayıp yalnız ${v.b} küçük adım ileri saymak kısa bir yoldur`;
    if(v.strategy==='makeTen') return `${v.a}'yı önce 10 yapmak kalan ${v.rest} sayısını eklemeyi kolaylaştırır`;
    if(v.strategy==='double') return `${v.a}+${v.a} bir çift olduğu için bilinen çift toplamı doğrudan kullanılabilir`;
    return `${v.a}+${v.a} çiftini kullanıp yalnız 1 daha eklemek işlemi sadeleştirir`;
  };
  if(rep==='build'){
    if(x.strategy==='makeTen') return qTask('add20',rep,`${x.a} + ${x.b} için önce 10'u kur. İkinci gruptan kaç taşı ilk çerçeveye taşımalısın?`,x.to10,{kind:'manipulative',interaction:'add-to-ten',expectedValue:String(x.to10),checkLabel:'Taşıdığımı kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'10’a köprü kur',visual:{type:'add-to-ten-interactive',a:x.a,b:x.b},hint:`İlk çerçevede ${10-x.a} boş yer var.`,explain:`${x.b} sayısı ${x.to10}+${x.rest} diye ayrılır. ${x.a}+${x.to10}=10; sonra ${x.rest} eklenir.`,effort:1.15,strategy:x.strategy
    });
    return qTask('add20',rep,`${x.a} taşın yanına ${x.b} taş daha ekle. Tam ${x.b} yeni taşı seç.`,x.b,{kind:'manipulative',interaction:'story-add',expectedValue:String(x.b),checkLabel:'Modelimi kontrol et'},{
      taskKind:'manipulative-build',taskLabel:x.strategy==='countOn'?'İleri saymayı nesneyle kur':'Çift yapısını nesneyle kur',visual:{type:'story-add-interactive',initial:x.a,pool:x.b+2,targetAdd:x.b},hint:x.strategy==='countOn'?`${x.a}'dan başla; her yeni taş bir ileri sayma adımıdır.`:`İki grubu yan yana düşün; ${x.a} ile ${x.b} arasındaki yakınlığı fark et.`,explain:`${x.a} + ${x.b} = ${x.ans}. ${strategyWhy(x)}.`,effort:1.1,strategy:x.strategy
    });
  }
  if(rep==='see'){
    let opts;
    if(x.strategy==='makeTen'){
      const moves=[x.to10,Math.max(0,x.to10-1),Math.min(x.b,x.to10+1)];
      opts=shuffled([...new Set(moves)].slice(0,3).map((move,i)=>({value:move===x.to10?'correct':`wrong-${i}`,visual:{type:'make10-split-model',a:x.a,b:x.b,move,rest:x.b-move},ariaLabel:`${x.b} sayısını ${move} ve ${x.b-move} olarak ayıran model`})),rng);
    }else{
      const good={value:'correct',visual:{type:'addition-strategy',a:x.a,b:x.b,strategy:x.strategy},ariaLabel:`${strategyLabel(x)} stratejisi`};
      const alternatives=['countOn','makeTen','double'].filter(v=>v!==x.strategy).slice(0,2).map((st,i)=>({value:`wrong-${i}`,visual:{type:'addition-strategy',a:x.a,b:x.b,strategy:st},ariaLabel:`Alternatif strateji ${st}`}));
      opts=shuffled([good,...alternatives],rng);
    }
    return qTask('add20',rep,`${x.a} + ${x.b} için sayılara uygun ve doğru modeli seç.`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Stratejiyi modelde ayırt et',visual:{type:'equation',text:`${x.a} + ${x.b}`},hint:`Bu sayılarda “${strategyLabel(x)}” yolunun neden kısa olduğunu düşün.`,explain:`Bu örnekte uygun yol: ${strategyLabel(x)}. ${strategyWhy(x)}.`,effort:1.1,strategy:x.strategy
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('add20',rep,`${y.a} + ${y.b} = □`,y.ans,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Sonucu kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Stratejiyi sembole çevir',visual:{type:'addition-strategy',a:y.a,b:y.b,strategy:y.strategy},hint:`${strategyLabel(y)} stratejisini kullan.`,explain:`${y.a}+${y.b}=${y.ans}. ${strategyWhy(y)}.`,effort:1.15,strategy:y.strategy
    });
  }
  if(rep==='explain'){
    const answer=`${strategyLabel(x)} — ${strategyWhy(x)}`;
    const distractors=[
      `Her zaman 10 yap — sayıların yapısına bakmadan tek yöntemi kullan`,
      `Rastgele say — hangi sayıdan başladığın önemli değil`,
      `İşareti değiştir — toplama yerine çıkarma yap`
    ];
    return qBase('add20',rep,`${x.a} + ${x.b} için hangi strateji bu sayılara özellikle uygundur?`,answer,semanticChoices(answer,distractors,rng),{
      taskKind:'reasoning-choice',taskLabel:'Strateji seçimini gerekçelendir',visual:{type:'addition-strategy',a:x.a,b:x.b,strategy:x.strategy},hint:'İyi strateji her soruda aynı olmak zorunda değildir.',explain:`${answer}.`,effort:1.2,strategy:x.strategy
    });
  }
  const y=c.transfer;
  return qTask('add20',rep,`Bir rafta ${y.a} kitap vardı. ${y.b} kitap daha kondu. Rafta şimdi kaç kitap var?`,y.ans,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Stratejiyi yeni bağlama taşı',visual:{type:'sticker-story',a:y.a,b:y.b,op:'+'},hint:`İşlemi çözmeden önce bu sayılara uygun yolu seç: ${strategyLabel(y)}.`,explain:`${y.a}+${y.b}=${y.ans}. Aynı strateji sayıların yapısı değişmediği için hikâyede de kullanılabilir.`,effort:1.2,strategy:y.strategy
  });
}
function genAddMany1(rep,d,rng,concept){
  const c=concept?.skillId==='addMany1'?concept:createConceptInstance('addMany1',d,rng);
  const x=c.anchor;
  const smartPair=z=> z.a+z.b===10?[z.a,z.b,z.c]:z.b+z.c===10?[z.b,z.c,z.a]:z.a+z.c===10?[z.a,z.c,z.b]:z.a===z.b?[z.a,z.b,z.c]:z.b===z.c?[z.b,z.c,z.a]:[z.a,z.b,z.c];
  if(rep==='build') return qTask('addMany1',rep,`${x.a}, ${x.b} ve ${x.c} taşlık üç grubu tek toplamda birleştir.`,x.total,{kind:'manipulative',interaction:'three-add',expectedValue:String(x.total),checkLabel:'Toplam grubumu kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Üç grubu fiziksel olarak birleştir',visual:{type:'three-add-interactive',values:[x.a,x.b,x.c]},hint:'Her gruptaki bütün taşları toplam alanına taşı.',explain:`${x.a}+${x.b}+${x.c}=${x.total}. Toplama sırasında grupları farklı sırayla birleştirebilirsin.`
  });
  if(rep==='see'){
    const [p,q,r]=smartPair(x), pair=p+q;
    const options=shuffled([
      {value:'correct',visual:{type:'three-add-strategy',values:[p,q,r],pair,total:x.total},ariaLabel:`Önce ${p}+${q}`},
      {value:'wrong-1',visual:{type:'three-add-strategy',values:[x.a,x.b,x.c],pair:Math.max(0,pair-1),total:x.total-1},ariaLabel:'yanlış ara toplam'},
      {value:'wrong-2',visual:{type:'three-add-strategy',values:[x.a,x.b,x.c],pair:pair+1,total:x.total+1},ariaLabel:'yanlış toplam'}
    ],rng);
    return qTask('addMany1',rep,`${x.a}+${x.b}+${x.c} için doğru ara toplamı ve sonucu gösteren model hangisi?`,'correct',{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',taskLabel:'Kolay bir eşleştirmeyi gör',visual:{type:'equation',text:`${x.a}+${x.b}+${x.c}`},hint:'Önce 10 yapan ya da çift oluşturan iki sayıyı aramak işi kolaylaştırabilir.',explain:`Sayıların gruplanması toplamı değiştirmez; doğru sonuç ${x.total}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol; return qTask('addMany1',rep,`${y.a} + ${y.b} + ${y.c} = □`,y.total,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Toplamı kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Birden çok toplananı sembolle çöz',visual:{type:'three-add-strategy',values:[y.a,y.b,y.c],pair:null,total:null},hint:'Önce kolay bir ikili oluştur, sonra üçüncü sayıyı ekle.',explain:`${y.a}+${y.b}+${y.c}=${y.total}.`
    });
  }
  if(rep==='explain'){
    const [p,q,r]=smartPair(x); const answer=`Önce ${p}+${q}'yi toplarım, sonra ${r}'yi eklerim; gruplama toplamı değiştirmez`;
    return qBase('addMany1',rep,`${x.a}+${x.b}+${x.c} işlemini neden uygun iki sayıyı önce gruplayarak çözebilirsin?`,answer,semanticChoices(answer,['Toplananların sırasını değiştirince sonuç mutlaka değişir','Üç sayı varsa yalnız soldan sağa saymak zorundayım','Bir sayıyı yok saymak toplamı kolaylaştırır'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Toplamada gruplama fikrini açıkla',visual:{type:'three-add-strategy',values:[p,q,r],pair:p+q,total:x.total},hint:'Aynı üç sayı hâlâ toplamda; yalnız çözme sırası değişiyor.',explain:answer+'.'
    });
  }
  const y=c.transfer; return qTask('addMany1',rep,`Üç kutuda sırasıyla ${y.a}, ${y.b} ve ${y.c} kalem var. Toplam kaç kalem var?`,y.total,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Çoklu toplamayı yeni bağlama taşı',visual:{type:'three-box-story',values:[y.a,y.b,y.c]},hint:'Üç grubun hepsi aynı toplamın parçalarıdır.',explain:`${y.a}+${y.b}+${y.c}=${y.total}.`
  });
}

function genSub20(rep,d,rng,concept){
  const c=concept?.skillId==='sub20'?concept:createConceptInstance('sub20',d,rng);
  const x=c.anchor;
  const strategyLabel=v=>({countBack:'Geri say',subtractFrom10:'10’dan geçerek çıkar',inverse:'Eksik toplananı düşün'}[v.strategy]||'Parça–bütün kullan');
  const strategyWhy=v=>{
    if(v.strategy==='countBack') return `${v.b} küçük olduğu için ${v.a}'dan yalnız ${v.b} adım geri saymak kısa bir yoldur`;
    if(v.strategy==='subtractFrom10') return `önce ${v.to10} çıkarıp 10'a gelmek, sonra ${v.after10} daha çıkarmak sayıları sadeleştirir`;
    return `${v.ans}+${v.b}=${v.a} ilişkisini kullanmak çıkarmayı eksik toplanan olarak görmeyi sağlar`;
  };
  if(rep==='build') return qTask('sub20',rep,`${x.a} taştan ${x.b} tanesini ayır.`,x.b,{kind:'manipulative',interaction:'remove-counters',expectedValue:String(x.b),checkLabel:'Ayırdıklarımı kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Azalmayı nesneyle kur',visual:{type:'remove-counters-interactive',total:x.a},hint:`Tam ${x.b} taşı gruptan ayır.`,explain:`${x.a}−${x.b}=${x.ans}. ${strategyWhy(x)}.`,effort:1.1,strategy:x.strategy
  });
  if(rep==='see'){
    const good={value:'correct',visual:{type:'subtraction-strategy',a:x.a,b:x.b,result:x.ans,strategy:x.strategy},ariaLabel:`${strategyLabel(x)} modeli`};
    const alts=['countBack','subtractFrom10','inverse'].filter(st=>st!==x.strategy).slice(0,2).map((st,i)=>({value:`wrong-${i}`,visual:{type:'subtraction-strategy',a:x.a,b:x.b,result:x.ans,strategy:st},ariaLabel:`Alternatif çıkarma modeli`}));
    return qTask('sub20',rep,`${x.a} − ${x.b} için sayılara uygun modeli seç.`,'correct',{kind:'visual-choice',options:shuffled([good,...alts],rng)},{
      taskKind:'visual-discrimination',taskLabel:'Çıkarma stratejisini gör',visual:{type:'equation',text:`${x.a} − ${x.b}`},hint:`Bu sayılar için “${strategyLabel(x)}” yolunu düşün.`,explain:`Uygun yol: ${strategyLabel(x)}; ${strategyWhy(x)}.`,effort:1.15,strategy:x.strategy
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('sub20',rep,`${y.a} − ${y.b} = □`,y.ans,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'İşlemi kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Stratejiyi sembolle çöz',visual:{type:'subtraction-strategy',a:y.a,b:y.b,result:y.ans,strategy:y.strategy},hint:`${strategyLabel(y)} yolunu kullan.`,explain:`${y.a}−${y.b}=${y.ans}. ${strategyWhy(y)}.`,effort:1.15,strategy:y.strategy
    });
  }
  if(rep==='explain'){
    const answer=`${strategyLabel(x)} — ${strategyWhy(x)}`;
    return qBase('sub20',rep,`${x.a} − ${x.b} için hangi düşünme yolu bu sayılara özellikle uygundur?`,answer,semanticChoices(answer,['Her zaman yalnız 10’a gitmek','Çıkan sayıyı eksilene eklemek ve durmak','Sadece son rakamlara bakmak'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Stratejiyi gerekçelendir',visual:{type:'subtraction-strategy',a:x.a,b:x.b,result:x.ans,strategy:x.strategy},hint:'Küçük çıkanlarda geri saymak, 10’u geçenlerde 10’dan geçmek gibi farklı yollar olabilir.',explain:`${answer}.`,effort:1.2,strategy:x.strategy
    });
  }
  const y=c.transfer;
  return qTask('sub20',rep,`Kutuda ${y.a} kalem vardı. ${y.b} kalem alındı. Kutuda kaç kalem kaldı?`,y.ans,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Çıkarma fikrini yeni duruma taşı',visual:{type:'sticker-story',a:y.a,b:y.b,op:'−'},hint:`Önce sayılara uygun stratejiyi seç: ${strategyLabel(y)}.`,explain:`${y.a}−${y.b}=${y.ans}. Strateji bağlamdan değil sayıların yapısından seçildi.`,effort:1.2,strategy:y.strategy
  });
}
function genEquality(rep,d,rng,concept){
  const c=concept?.skillId==='equality'?concept:createConceptInstance('equality',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('equality',rep,`${x.a} + ${x.b} ile aynı değeri oluştur. Sağ tarafta ${x.c} hazır; eksik parçayı taşlarla tamamla.`,x.missing,{kind:'manipulative',interaction:'balance-fill',expectedValue:String(x.missing),checkLabel:'Dengeyi kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Eşitliği dengeleyerek kur',visual:{type:'balance-fill-interactive',left:[x.a,x.b],rightBase:x.c,pool:Math.min(9,x.missing+2)},hint:`Sol tarafın toplamı ${x.total}. Sağ tarafın da aynı değere gelmesi gerekir.`,explain:`${x.a}+${x.b}=${x.total} ve ${x.c}+${x.missing}=${x.total}. Eşittir iki tarafın aynı değerde olduğunu söyler.`
  });
  if(rep==='see'){
    const candidates=[x.missing,Math.max(0,x.missing-1),x.missing+1];
    const opts=shuffled(candidates.map((m,i)=>({value:i===0?'correct':`wrong-${i}`,visual:{type:'balance',left:[x.a,x.b],right:[x.c,m]},ariaLabel:`Sol ${x.a}+${x.b}, sağ ${x.c}+${m}`})),rng);
    return qTask('equality',rep,'Hangi terazi iki tarafta da aynı değeri gösteriyor?','correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Dengeyi modelde ayırt et',visual:{type:'equation',text:'eşitlik = aynı değer'},hint:'İki taraftaki toplamları ayrı ayrı düşün.',explain:`Dengeli modelde iki taraf da ${x.total} eder.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('equality',rep,`${y.a} + ${y.b} = ${y.c} + □`,y.missing,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Eşitliği kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Dengeyi sembolle tamamla',visual:{type:'balance',left:[y.a,y.b],right:[y.c,'□']},hint:`Sol tarafın değeri ${y.total}.`,explain:`${y.c}+${y.missing}=${y.total}; böylece iki taraf eşittir.`
    });
  }
  if(rep==='explain'){
    const answer='İki tarafın aynı değeri göstermesi';
    return qBase('equality',rep,`“${x.a}+${x.b} = ${x.c}+${x.missing}” ifadesinde = işaretinin görevi nedir?`,answer,semanticChoices(answer,['Cevabın her zaman sağda olduğunu söylemesi','Yalnız toplama yapılacağını göstermesi','Soldaki tarafın daha büyük olduğunu göstermesi'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Eşittirin anlamını açıkla',visual:{type:'balance',left:[x.a,x.b],right:[x.c,x.missing]},hint:'Terazinin iki kefesi gibi düşün.',explain:'Eşittir işareti “cevap geliyor” işareti değil, iki ifadenin aynı değerde olduğunu anlatır.'
    });
  }
  const y=c.transfer;
  return qTask('equality',rep,`${y.a} + ${y.b} = ${y.total} bilgisini kullan. Aynı sayı ailesindeki ${y.total} − ${y.a} işleminin sonucu kaçtır?`,y.b,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'İşlem ailesini kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Toplama–çıkarma ilişkisine taşı',visual:{type:'fact-family',a:y.a,b:y.b,total:y.total},hint:'Aynı üç sayı iki toplama ve iki çıkarma gerçeği oluşturabilir.',explain:`${y.a}+${y.b}=${y.total} ise ${y.total}−${y.a}=${y.b}. Toplama ve çıkarma ters ilişkili işlemlerdir.`
  });
}
function genWord1(rep,d,rng,concept){
  const c=concept?.skillId==='word1'?concept:createConceptInstance('word1',d,rng);
  const x=c.anchor;
  const story=z=>{
    if(z.type==='join-result') return `Deniz'in ${z.start} taşı vardı. ${z.change} taş daha buldu. Şimdi kaç taşı var?`;
    if(z.type==='join-change') return `Deniz'in ${z.start} taşı vardı. Birkaç taş daha bulunca ${z.result} taşı oldu. Kaç taş buldu?`;
    if(z.type==='separate-result') return `Deniz'in ${z.start} taşı vardı. ${z.change} tanesini verdi. Kaç taşı kaldı?`;
    if(z.type==='part-missing') return `Kutuda toplam ${z.whole} boncuk var. ${z.known} tanesi kırmızı, kalanlar mavi. Kaç mavi boncuk var?`;
    return `Ece'nin ${z.larger}, Ali'nin ${z.smaller} çıkartması var. Ece'nin kaç fazla çıkartması var?`;
  };
  const equation=z=>{
    if(z.type==='join-result') return `${z.start} + ${z.change} = □`;
    if(z.type==='join-change') return `${z.start} + □ = ${z.result}`;
    if(z.type==='separate-result') return `${z.start} − ${z.change} = □`;
    if(z.type==='part-missing') return `${z.known} + □ = ${z.whole}`;
    return `${z.larger} − ${z.smaller} = □`;
  };
  const structureLabel=z=>({
    'join-result':'Birleştirme · sonuç bilinmiyor',
    'join-change':'Birleştirme · değişim bilinmiyor',
    'separate-result':'Ayırma · sonuç bilinmiyor',
    'part-missing':'Parça–bütün · eksik parça',
    'compare-difference':'Karşılaştırma · fark bilinmiyor'
  }[z.type]);
  if(rep==='build'){
    if(x.type==='join-result'||x.type==='join-change') return qTask('word1',rep,`${story(x)} Hikâyedeki eklenen parçayı taşlarla kur.`,x.change,{kind:'manipulative',interaction:'story-add',expectedValue:String(x.change),checkLabel:'Hikâyeyi kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'Hikâyeyi canlandır',visual:{type:'story-add-interactive',initial:x.start,pool:x.change+2,targetAdd:x.change},hint:'Başlangıç grubunu değiştirme; yalnız hikâyede eklenen taşları seç.',explain:`Model ${x.start}+${x.change}=${x.result} ilişkisini kuruyor.`,problemType:x.type
    });
    if(x.type==='separate-result') return qTask('word1',rep,`${story(x)} Verilen taşları gruptan ayır.`,x.change,{kind:'manipulative',interaction:'remove-counters',expectedValue:String(x.change),checkLabel:'Hikâyeyi kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'Azalmayı canlandır',visual:{type:'remove-counters-interactive',total:x.start},hint:`Tam ${x.change} taşı ayır.`,explain:`${x.start} taşın ${x.change} tanesi ayrılınca ${x.result} kalır.`,problemType:x.type
    });
    if(x.type==='part-missing') return qTask('word1',rep,`${story(x)} Bilinen ${x.known} kırmızı boncuğun yanına eksik mavi parçayı ekleyip bütünü kur.`,x.missing,{kind:'manipulative',interaction:'story-add',expectedValue:String(x.missing),checkLabel:'Bütünü kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'Parça–bütünü kur',visual:{type:'story-add-interactive',initial:x.known,pool:x.missing+2,targetAdd:x.missing},hint:`Toplamın ${x.whole} olması gerekiyor.`,explain:`${x.known}+${x.missing}=${x.whole}; eksik parça ${x.missing}.`,problemType:x.type
    });
    return qTask('word1',rep,`${story(x)} Ali'nin miktarı kadar taşı Ece'nin grubundan ayır; artan taşlar farkı gösterecek.`,x.smaller,{kind:'manipulative',interaction:'remove-counters',expectedValue:String(x.smaller),checkLabel:'Karşılaştırmayı kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'Farkı eşleştirerek kur',visual:{type:'remove-counters-interactive',total:x.larger},hint:`Önce ${x.smaller} taşı eşleştir. Eşleşmeyenler farktır.`,explain:`${x.larger}−${x.smaller}=${x.diff}; eşleşmeyen ${x.diff} taş farkı gösterir.`,problemType:x.type
    });
  }
  if(rep==='see'){
    const otherTypes=['join-result','join-change','separate-result','part-missing','compare-difference'].filter(t=>t!==x.type).slice(0,2);
    const opts=shuffled([
      {value:'correct',visual:{type:'problem-structure',case:x},ariaLabel:structureLabel(x)},
      ...otherTypes.map((type,i)=>({value:`wrong-${i}`,visual:{type:'problem-structure',case:{...x,type}},ariaLabel:`Alternatif problem modeli ${type}`}))
    ],rng);
    return qTask('word1',rep,`${story(x)} Hikâyenin matematiksel yapısını doğru gösteren model hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Problem yapısını modelde gör',visual:{type:'story-question',case:x},hint:'Sadece “geldi/gitti” kelimelerine değil, hangi miktarın bilinmediğine bak.',explain:`Bu problem yapısı: ${structureLabel(x)}.`,problemType:x.type
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('word1',rep,`${story(y)} Bilinmeyeni bul.`,y.answer,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Çözümümü kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Hikâyeyi matematik cümlesine çevir',visual:{type:'equation',text:equation(y)},hint:`Bilinmeyen her zaman sonuç olmak zorunda değil. Model: ${equation(y)}`,explain:`${equation(y).replace('□',String(y.answer))}.`,problemType:y.type
    });
  }
  if(rep==='explain'){
    const answer=structureLabel(x);
    return qBase('word1',rep,`${story(x)} Bu problemin yapısını en iyi hangi açıklama tanımlar?`,answer,semanticChoices(answer,[
      'İki eşit grup · çarpma','Sadece sayıları gördüğümüz sırayla toplama','İşlem yapısı bilinmeyenin yerinden bağımsızdır'
    ],rng),{
      taskKind:'reasoning-choice',taskLabel:'Problem yapısını açıkla',visual:{type:'problem-structure',case:x},hint:'Ne biliniyor, ne değişiyor ve ne soruluyor?',explain:`Doğru yapı: ${answer}. İşlem seçimi anahtar kelimeden değil ilişkiden gelir.`,problemType:x.type
    });
  }
  const y=c.transfer;
  let prompt;
  if(y.type==='join-result') prompt=`Otobüste ${y.start} yolcu vardı. ${y.change} yolcu daha bindi. Şimdi kaç yolcu var?`;
  else if(y.type==='join-change') prompt=`Otobüste ${y.start} yolcu vardı. Bir durakta yolcular binince sayı ${y.result} oldu. Kaç yolcu bindi?`;
  else if(y.type==='separate-result') prompt=`Sepette ${y.start} elma vardı. ${y.change} elma kullanıldı. Kaç elma kaldı?`;
  else if(y.type==='part-missing') prompt=`Toplam ${y.whole} kalemin ${y.known} tanesi mavi. Kalanlar kırmızı. Kaç kırmızı kalem var?`;
  else prompt=`Mert ${y.larger}, Eylül ${y.smaller} sayfa okudu. Mert kaç sayfa fazla okudu?`;
  return qTask('word1',rep,prompt,y.answer,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Aynı problem yapısını yeni bağlama taşı',visual:{type:'problem-structure',case:y},hint:'Nesneler değişti; matematiksel ilişki değişmedi.',explain:`Bu da ${structureLabel(y).toLowerCase()} yapısında bir problemdir. Cevap ${y.answer}.`,problemType:y.type
  });
}


function genNumberBonds10(rep,d,rng,concept){
  const c=concept?.skillId==='numberBonds10'?concept:createConceptInstance('numberBonds10',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('numberBonds10',rep,`${x.whole} bütününü oluştur. ${x.part} parçası hazır; eksik parçayı taşlarla tamamla.`,x.missing,{kind:'manipulative',interaction:'bond-fill',expectedValue:String(x.missing),checkLabel:'Sayı bağını kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Parçaları bütüne bağla',visual:{type:'bond-fill-interactive',whole:x.whole,part:x.part,pool:x.missing+2},hint:`İki parçanın toplamı ${x.whole} olmalı.`,explain:`${x.part}+${x.missing}=${x.whole}. Aynı bütün farklı parçalara ayrılabilir.`
  });
  if(rep==='see'){
    const ms=[x.missing,Math.max(0,x.missing-1),Math.min(x.whole,x.missing+1)];
    const uniq=[...new Set(ms)]; while(uniq.length<3) uniq.push((uniq.at(-1)+2)%x.whole);
    const opts=shuffled(uniq.slice(0,3).map((m,i)=>({value:m===x.missing?'correct':`wrong-${i}`,visual:{type:'partwhole',whole:x.whole,part:x.part,missing:m},ariaLabel:`${x.whole} bütünü ${x.part} ve ${m} parçaları`})),rng);
    return qTask('numberBonds10',rep,`${x.whole} sayısını ${x.part} ve eksik parça olarak doğru gösteren sayı bağı hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Sayı bağını görselde tanı',visual:{type:'numbercard',n:x.whole},hint:'Parçaları zihninde birleştir; bütün değişmemeli.',explain:`Doğru sayı bağı ${x.part}+${x.missing}=${x.whole}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('numberBonds10',rep,`${y.part} + □ = ${y.whole}`,y.missing,{kind:'number-input',placeholder:'?',maxLength:1,checkLabel:'Bağı kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Sayı bağını sembolle yaz',visual:{type:'partwhole',whole:y.whole,part:y.part,missing:'?'},hint:'Eksik parça ile verilen parça birlikte bütünü oluşturmalı.',explain:`${y.part}+${y.missing}=${y.whole}.`
    });
  }
  if(rep==='explain'){
    const answer=`${x.part} ve ${x.missing}, ${x.whole} bütününün iki parçasıdır`;
    return qBase('numberBonds10',rep,`${x.whole} için ${x.part} ve ${x.missing} sayılarını neden aynı sayı bağında gösterebiliriz?`,answer,semanticChoices(answer,[`${x.part} her zaman ${x.missing}'den büyüktür`,'Parçaların sırası sayının değerini değiştirir','Sayı bağı yalnız çıkarma içindir'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Parça–bütün ilişkisini açıkla',visual:{type:'partwhole',whole:x.whole,part:x.part,missing:x.missing},hint:'Parçaları birleştirince hangi sayı oluşuyor?',explain:`${x.part}+${x.missing}=${x.whole}; iki parça aynı bütünü oluşturur.`
    });
  }
  const y=c.transfer;
  return qTask('numberBonds10',rep,`Kutuda toplam ${y.whole} kalem var. ${y.part} tanesi mavi, kalanlar kırmızı. Kaç kırmızı kalem var?`,y.missing,{kind:'number-input',placeholder:'?',maxLength:1,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Sayı bağını hikâyeye taşı',visual:{type:'two-part-story',whole:y.whole,part:y.part},hint:'Toplam bütündür; mavi ve kırmızı kalemler iki parçadır.',explain:`${y.whole}=${y.part}+${y.missing}; eksik parça ${y.missing}.`
  });
}

function genNumber100(rep,d,rng,concept){
  const c=concept?.skillId==='number100'?concept:createConceptInstance('number100',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('number100',rep,`${x.n} sayısını onluk çubukları ve birlik küpleriyle kur.`,`${x.tens}|${x.ones}`,{kind:'manipulative',interaction:'base10-build',expectedValue:`${x.tens}|${x.ones}`,checkLabel:'Sayımı kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Basamak değerini elle kur',visual:{type:'base10-build-interactive',target:x.n,maxTens:x.tens===10?10:9,maxOnes:9},hint:`${x.n} sayısında ${x.tens} onluk ve ${x.ones} birlik var.`,explain:`${x.n} = ${x.tens} onluk + ${x.ones} birlik = ${x.tens*10}+${x.ones}.`
  });
  if(rep==='see'){
    const variants=[x.n,Math.max(10,x.n-10),Math.min(100,x.n+10)];
    const uniq=[...new Set(variants)]; while(uniq.length<3) uniq.push(Math.max(10,x.n-1));
    const opts=shuffled(uniq.slice(0,3).map((n,i)=>({value:n===x.n?'correct':`wrong-${i}`,visual:{type:'base10',tens:Math.floor(n/10),ones:n%10},ariaLabel:`${n} sayısının onluk birlik modeli`})),rng);
    return qTask('number100',rep,`${x.n} sayısını gösteren onluk–birlik modeli hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Basamak modelini ayırt et',visual:{type:'numbercard',n:x.n},hint:'Önce onluk çubuklarını, sonra birlikleri say.',explain:`${x.n}, ${x.tens} onluk ve ${x.ones} birlikten oluşur.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('number100',rep,`“${trNumberWord(y.n)}” sayısını rakamla yaz.`,y.n,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Yazdığımı kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Sayı sözcüğünü rakama çevir',visual:{type:'base10',tens:y.tens,ones:y.ones},hint:`${trNumberWord(y.tens*10)} ${y.ones?trNumberWord(y.ones):''}`.trim(),explain:`“${trNumberWord(y.n)}” = ${y.n}.`
    });
  }
  if(rep==='explain'){
    const answer=`${x.tens} rakamı ${x.tens*10} değerini, ${x.ones} rakamı ${x.ones} değerini gösterir`;
    return qBase('number100',rep,`${x.n} sayısının basamaklarını nasıl açıklarsın?`,answer,semanticChoices(answer,[`${x.tens} ve ${x.ones} aynı değerdedir`,'Soldaki rakam yalnız şekildir','Birlik rakamı her zaman onluklardan büyüktür'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Basamak değerini açıkla',visual:{type:'base10',tens:x.tens,ones:x.ones},hint:'Rakamın değeri bulunduğu basamağa bağlıdır.',explain:`${x.n}=${x.tens*10}+${x.ones}.`
    });
  }
  const y=c.transfer;
  return qTask('number100',rep,`Bir sınıfta ${y.tens} paket kalem var; her pakette 10 kalem. Ayrıca ${y.ones} tek kalem var. Toplam kaç kalem var?`,y.n,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Onluk–birliği günlük duruma taşı',visual:{type:'bundle-story',tens:y.tens,ones:y.ones},hint:'Her paket bir onluk, tek kalemler birliktir.',explain:`${y.tens}×10+${y.ones}=${y.n}.`
  });
}

function genCompareOrder100(rep,d,rng,concept){
  const c=concept?.skillId==='compareOrder100'?concept:createConceptInstance('compareOrder100',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('compareOrder100',rep,`${x.a} ve ${x.b} sayı kartlarını küçükten büyüğe sırala.`,`${x.smaller}|${x.larger}`,{kind:'manipulative',interaction:'order-pair',expectedValue:`${x.smaller}|${x.larger}`,checkLabel:'Sıramı kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Sayıları sıralayarak karşılaştır',visual:{type:'order-pair-interactive',a:x.a,b:x.b},hint:'Önce onlukları karşılaştır; onluklar eşitse birliklere bak.',explain:`${x.smaller} < ${x.larger}.`
  });
  if(rep==='see'){
    const correct={value:'correct',visual:{type:'compare-base10',a:x.a,b:x.b,relation:x.relation},ariaLabel:`${x.a} ${x.relation} ${x.b}`};
    const wrong1={value:'wrong-1',visual:{type:'compare-base10',a:x.a,b:x.b,relation:x.relation==='>'?'<':'>'},ariaLabel:'ters karşılaştırma'};
    const wrong2={value:'wrong-2',visual:{type:'compare-base10',a:x.a,b:x.b,relation:'='},ariaLabel:'eşitlik karşılaştırması'};
    return qTask('compareOrder100',rep,'Onluk–birlik modellerine göre doğru karşılaştırmayı seç.','correct',{kind:'visual-choice',options:shuffled([correct,wrong1,wrong2],rng)},{
      taskKind:'visual-discrimination',taskLabel:'Karşılaştırmayı modelde gör',visual:{type:'compare-base10',a:x.a,b:x.b,relation:'?'},hint:'Daha fazla onluk olan sayı daha büyüktür; onluklar eşitse birlikleri karşılaştır.',explain:`${x.a} ${x.relation} ${x.b}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qBase('compareOrder100',rep,`${y.a} __ ${y.b} boşluğuna hangi işaret gelir?`,y.relation,semanticChoices(y.relation,[y.relation==='>'?'<':'>','=','+'],rng),{
      taskKind:'symbol-entry',taskLabel:'Karşılaştırmayı sembolle yaz',visual:{type:'equation',text:`${y.a} __ ${y.b}`},hint:'Onluklardan başlayarak karşılaştır.',explain:`${y.a} ${y.relation} ${y.b}.`
    });
  }
  if(rep==='explain'){
    const answer=Math.floor(x.a/10)!==Math.floor(x.b/10)?'Önce onlukları karşılaştırırım':'Onluklar eşit olduğu için birlikleri karşılaştırırım';
    return qBase('compareOrder100',rep,`${x.a} ile ${x.b} sayılarını karşılaştırırken ilk hangi bilgiye bakmalısın?`,answer,semanticChoices(answer,['Rakamların rengine bakarım','Sayıları rastgele dizerim','Yalnız son rakama bakarım'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Karşılaştırma yöntemini açıkla',visual:{type:'compare-base10',a:x.a,b:x.b,relation:x.relation},hint:'Basamak değeri soldan sağa karşılaştırılır.',explain:`${answer}; sonuç ${x.a} ${x.relation} ${x.b}.`
    });
  }
  const y=c.transfer;
  const answer=y.larger;
  return qBase('compareOrder100',rep,`İki rafta sırasıyla ${y.a} ve ${y.b} kitap var. Hangi raftaki sayı daha büyüktür?`,answer,numericChoices(answer,10,rng),{
    taskKind:'context-transfer',taskLabel:'Karşılaştırmayı günlük duruma taşı',visual:{type:'shelf-counts',a:y.a,b:y.b},hint:'Kitapların kendisinden önce sayıları karşılaştır.',explain:`${y.larger}, ${y.smaller}'dan büyüktür.`
  });
}

function genOrdinal10(rep,d,rng,concept){
  const c=concept?.skillId==='ordinal10'?concept:createConceptInstance('ordinal10',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('ordinal10',rep,`Soldan ${x.position}. sırayı işaretle.`,x.position,{kind:'manipulative',interaction:'ordinal-position',expectedValue:String(x.position),checkLabel:'Yerimi kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Konumu sırada kur',visual:{type:'ordinal-line-interactive',count:10},hint:'İlk nesneden başlayıp konumları sırayla say.',explain:`Seçilen konum ${x.position}. sıradır.`
  });
  if(rep==='see'){
    const ps=[x.position,Math.max(1,x.position-1),Math.min(10,x.position+1)];
    const uniq=[...new Set(ps)]; while(uniq.length<3) uniq.push(((uniq.at(-1)+2-1)%10)+1);
    const opts=shuffled(uniq.slice(0,3).map((pos,i)=>({value:pos===x.position?'correct':`wrong-${i}`,visual:{type:'ordinal-line',count:10,marked:pos},ariaLabel:`${pos}. konum işaretli`})),rng);
    return qTask('ordinal10',rep,`${x.position}. sıradaki nesneyi gösteren görsel hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Sıra konumunu görselde bul',visual:{type:'ordinal-symbol',position:x.position},hint:'Sıra sayısı kaç nesne olduğunu değil, konumu anlatır.',explain:`${x.position}. ifadesi ${x.position}. konumu gösterir.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    const answer=`${y.position}.`;
    return qBase('ordinal10',rep,`“${y.position}. sırada” ifadesini hangi sembol gösterir?`,answer,semanticChoices(answer,[...ordinalCases().filter(z=>z.position!==y.position).slice(0,3).map(z=>`${z.position}.`)],rng),{
      taskKind:'symbol-entry',taskLabel:'Sıra sayısını sembolleştir',visual:{type:'ordinal-line',count:10,marked:y.position},hint:'Sıra sayısında nokta konumu belirtir.',explain:`${answer} = ${y.position}. sıra.`
    });
  }
  if(rep==='explain'){
    const answer='Sıra sayısı miktarı değil, bir nesnenin konumunu gösterir';
    return qBase('ordinal10',rep,'“5 oyuncak” ile “5. oyuncak” arasındaki fark nedir?',answer,semanticChoices(answer,['İkisi her zaman aynı şeyi anlatır','5. oyuncak beş tane oyuncak demektir','Sıra sayıları yalnız renkleri anlatır'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Miktar ile konumu ayır',visual:{type:'ordinal-line',count:8,marked:5},hint:'“Kaç tane?” ve “kaçıncı?” farklı sorulardır.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  return qBase('ordinal10',rep,`Bir yarışta Elif ${y.position}. oldu. Elif'in konumunu seç.`,`${y.position}.`,semanticChoices(`${y.position}.`,[...ordinalCases().filter(z=>z.position!==y.position).slice(-3).map(z=>`${z.position}.`)],rng),{
    taskKind:'context-transfer',taskLabel:'Sıra sayısını yarış bağlamına taşı',visual:{type:'race-line',position:y.position,count:10},hint:'Yarış sonucu bir miktar değil, sıralama konumudur.',explain:`Elif ${y.position}. sıradadır.`
  });
}

function genAddSub100(rep,d,rng,concept){
  const c=concept?.skillId==='addSub100'?concept:createConceptInstance('addSub100',d,rng);
  const x=c.anchor;
  const resultParts=z=>({tens:Math.floor(z.ans/10),ones:z.ans%10});
  if(rep==='build'){
    const r=resultParts(x);
    return qTask('addSub100',rep,`${x.a} ${x.op} ${x.b} işleminin sonucunu onluk ve birliklerle kur.`,`${r.tens}|${r.ones}`,{kind:'manipulative',interaction:'base10-build',expectedValue:`${r.tens}|${r.ones}`,checkLabel:'Sonuç modelini kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'İşlemi onluk–birlikle kur',visual:{type:'base10-operation-build',a:x.a,b:x.b,op:x.op,maxTens:9,maxOnes:9},hint:x.renaming?'10 birlik ile 1 onluk arasındaki değişimi düşün.':'Onlukları ve birlikleri kendi basamaklarında işle.',explain:`${x.a} ${x.op} ${x.b} = ${x.ans}. ${x.renaming?'Bu örnekte yeniden gruplama gerekir.':'Basamaklar yeniden gruplamadan işlenebilir.'}`
    });
  }
  if(rep==='see'){
    const r=resultParts(x); const vals=[x.ans,Math.max(0,x.ans-10),Math.min(99,x.ans+10)];
    const opts=shuffled([...new Set(vals)].slice(0,3).map((n,i)=>({value:n===x.ans?'correct':`wrong-${i}`,visual:{type:'base10',tens:Math.floor(n/10),ones:n%10},ariaLabel:`${n} sonucu`})),rng);
    return qTask('addSub100',rep,`${x.a} ${x.op} ${x.b} işleminin sonucunu gösteren model hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'İşlem sonucunu modelde gör',visual:{type:'column-operation',a:x.a,b:x.b,op:x.op},hint:'Birlikleri birliklerle, onlukları onluklarla ilişkilendir.',explain:`Doğru model ${r.tens} onluk ve ${r.ones} birlik, yani ${x.ans}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('addSub100',rep,`${y.a} ${y.op} ${y.b} = □`,y.ans,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'İşlemi kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'İşlemi sayı dilinde çöz',visual:{type:'column-operation',a:y.a,b:y.b,op:y.op},hint:y.renaming?'Gerekirse 10 birlik ↔ 1 onluk dönüşümünü kullan.':'Basamak değerlerini koru.',explain:`${y.a} ${y.op} ${y.b} = ${y.ans}.`
    });
  }
  if(rep==='explain'){
    const answer=x.renaming?(x.op==='+'?'10 birlik oluştuğunda onları 1 onluk olarak yeniden gruplarım':'Birlik yetmediğinde 1 onluğu 10 birlik olarak yeniden gruplarım'):'Onlukları ve birlikleri kendi basamaklarında birleştirir veya azaltırım';
    return qBase('addSub100',rep,`${x.a} ${x.op} ${x.b} işleminde hangi düşünce doğrudur?`,answer,semanticChoices(answer,['Onluk ve birlik basamaklarını karıştırırım','Yalnız en soldaki rakamı işlerim','Basamak değerini önemsemem'],rng),{
      taskKind:'reasoning-choice',taskLabel:'İşlemin nedenini açıkla',visual:{type:'column-operation',a:x.a,b:x.b,op:x.op},hint:'Birlikleri birliklerle, onlukları onluklarla düşün.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  const prompt=y.op==='+'?`Kütüphanede ${y.a} kitap vardı, ${y.b} kitap daha geldi. Toplam kaç kitap oldu?`:`Kütüphanede ${y.a} kitap vardı, ${y.b} kitap ödünç verildi. Kaç kitap kaldı?`;
  return qTask('addSub100',rep,prompt,y.ans,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'100 içindeki işlemi bağlama taşı',visual:{type:'shelf-operation',a:y.a,b:y.b,op:y.op},hint:'Problemin ilişkisini işlem sembolüne çevir, sonra basamak değerini kullan.',explain:`${y.a} ${y.op} ${y.b} = ${y.ans}.`
  });
}

function genMultiply40(rep,d,rng,concept){
  const c=concept?.skillId==='multiply40'?concept:createConceptInstance('multiply40',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('multiply40',rep,`${x.groups} eşit grup oluştur; her gruba ${x.each} taş yerleştir.`,x.total,{kind:'manipulative',interaction:'equal-groups',expectedValue:String(x.total),checkLabel:'Grupları kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Eşit grupları kur',visual:{type:'equal-groups-interactive',groups:x.groups,each:x.each},hint:`Her grup aynı sayıda, yani ${x.each} taş içermeli.`,explain:`${x.groups} grup × ${x.each} = ${x.total}. Aynı yapı ${Array.from({length:x.groups},()=>x.each).join(' + ')} olarak da görülebilir.`
  });
  if(rep==='see'){
    const variants=[x.each,Math.max(1,x.each-1),x.each+1];
    const opts=shuffled([...new Set(variants)].slice(0,3).map((each,i)=>({value:each===x.each?'correct':`wrong-${i}`,visual:{type:'groups',groups:x.groups,each},ariaLabel:`${x.groups} grupta ${each} nesne`})),rng);
    return qTask('multiply40',rep,`${x.groups} grup ve her grupta ${x.each} nesne olan model hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Eşit grup yapısını gör',visual:{type:'equation',text:`${x.groups} × ${x.each}`},hint:'Grup sayısı ve her grubun büyüklüğü ayrı bilgilerdir.',explain:`Doğru model ${x.groups} eşit grup ve her grupta ${x.each} nesne gösterir.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('multiply40',rep,`${y.groups} × ${y.each} = □`,y.total,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Çarpımı kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Eşit grupları çarpma sembolüne çevir',visual:{type:'groups',groups:y.groups,each:y.each},hint:`${y.each} sayısını ${y.groups} kez toplayabilirsin.`,explain:`${y.groups}×${y.each}=${y.total}.`
    });
  }
  if(rep==='explain'){
    const repeated=Array.from({length:x.groups},()=>String(x.each)).join(' + ');
    const answer=`${x.groups} eşit grubun her birinde ${x.each} olduğu için ${repeated}`;
    return qBase('multiply40',rep,`${x.groups} × ${x.each} işlemi neden tekrarlı toplama ile ilişkilidir?`,answer,semanticChoices(answer,['Çarpma her zaman sayıları küçültür','Grupların eşit olması önemli değildir','Yalnız × işaretinin şekli nedeniyle'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Çarpmanın grup anlamını açıkla',visual:{type:'groups',groups:x.groups,each:x.each},hint:'Her grupta aynı miktarın tekrarlandığını düşün.',explain:`${repeated}=${x.total}.`
    });
  }
  const y=c.transfer;
  return qTask('multiply40',rep,`${y.groups} tabak var. Her tabakta ${y.each} kurabiye var. Toplam kaç kurabiye var?`,y.total,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Eşit grupları hikâyeye taşı',visual:{type:'groups',groups:y.groups,each:y.each},hint:'Eşit grup sayısı × her gruptaki miktar.',explain:`${y.groups}×${y.each}=${y.total}.`
  });
}

function genDivide20G1(rep,d,rng,concept){
  const c=concept?.skillId==='divide20g1'?concept:createConceptInstance('divide20g1',d,rng);
  const x=c.anchor;
  const quotient=z=>z.mode==='sharing'?z.each:z.groups;
  const modeLabel=z=>z.mode==='sharing'?'eşit paylaşma':'eşit gruplama';
  if(rep==='build'){
    if(x.mode==='sharing') return qTask('divide20g1',rep,`${x.total} taşı ${x.groups} çocuğa eşit paylaştır.`,x.each,{kind:'manipulative',interaction:'share-equally',expectedValue:String(x.each),checkLabel:'Paylaşımı kontrol et'}, {
      taskKind:'manipulative-build',taskLabel:'Eşit paylaşmayı gerçekleştir',visual:{type:'share-equally-interactive',total:x.total,groups:x.groups},hint:'Her turda her gruba birer taş ver; bütün taşlar kullanılmalı.',explain:`${x.total} nesne ${x.groups} eşit paya ayrılınca her payda ${x.each} nesne olur.`,divisionMode:x.mode
    });
    return qTask('divide20g1',rep,`${x.total} taşı ${x.each}'erli eşit gruplar halinde düzenle.`,x.total,{kind:'manipulative',interaction:'equal-groups',expectedValue:String(x.total),checkLabel:'Grupları kontrol et'}, {
      taskKind:'manipulative-build',taskLabel:'Eşit büyüklükte gruplar oluştur',visual:{type:'equal-groups-interactive',groups:x.groups,each:x.each},hint:`Her grupta tam ${x.each} taş olmalı ve bütün ${x.total} taş kullanılmalı.`,explain:`${x.total} nesne, ${x.each}'erli ${x.groups} eşit grup oluşturur.`,divisionMode:x.mode
    });
  }
  if(rep==='see'){
    const good={value:'correct',visual:{type:'share-model',groups:x.groups,each:x.each},ariaLabel:`${x.groups} grupta ${x.each} nesne`};
    const wrong1={value:'wrong-1',visual:{type:'share-model',groups:x.groups,each:Math.max(1,x.each-1)},ariaLabel:'eşit ama toplamı yanlış model'};
    const wrong2={value:'wrong-2',visual:{type:'share-model',groups:Math.max(1,x.groups-1),each:x.each},ariaLabel:'grup sayısı yanlış model'};
    const prompt=x.mode==='sharing'?`${x.total} nesneyi ${x.groups} eşit paya ayıran model hangisi?`:`${x.total} nesneyi ${x.each}'erli gruplara ayıran model hangisi?`;
    return qTask('divide20g1',rep,prompt,'correct',{kind:'visual-choice',options:shuffled([good,wrong1,wrong2],rng)}, {
      taskKind:'visual-discrimination',taskLabel:`Bölmeyi ${modeLabel(x)} modeliyle gör`,visual:{type:'share-model',groups:x.groups,each:x.each},hint:'Bütün nesneler kullanılmalı ve gruplar eşit olmalı.',explain:`Doğru model ${x.groups} eşit grup × ${x.each} nesne = ${x.total} ilişkisini gösterir.`,divisionMode:x.mode
    });
  }
  if(rep==='symbol'){
    const y=c.symbol; const ans=quotient(y);
    const prompt=y.mode==='sharing'?`${y.groups} × □ = ${y.total}`:`□ × ${y.each} = ${y.total}`;
    return qTask('divide20g1',rep,prompt,ans,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'İlişkiyi kontrol et'}, {
      taskKind:'symbol-entry',taskLabel:'Bölme durumunu eksik çarpanla sembolleştir',visual:{type:'share-model',groups:y.groups,each:y.each},hint:y.mode==='sharing'?`${y.groups} eşit grubun her birinde kaç nesne olursa toplam ${y.total} olur?`:`Kaç tane ${y.each}'li grup toplam ${y.total} eder?`,explain:`${y.groups} × ${y.each} = ${y.total}. Eşit paylaşma/gruplama, bu çarpma ilişkisini ters yönden düşünür.`,divisionMode:y.mode
    });
  }
  if(rep==='explain'){
    const answer=x.mode==='sharing'?`${x.total} nesneyi ${x.groups} eşit paya ayırınca her payda ${x.each} olur`:`${x.total} nesnenin içinde ${x.each}'erli ${x.groups} eşit grup vardır`;
    return qBase('divide20g1',rep,`${x.total} nesne için ${modeLabel(x)} düşüncesini hangi cümle doğru açıklar?`,answer,semanticChoices(answer,['Grupların eşit olması gerekmez','Paylaştırınca nesnelerin toplam sayısı artar','Kaç nesnenin kullanıldığı önemli değildir'],rng), {
      taskKind:'reasoning-choice',taskLabel:'Paylaşma ile gruplama anlamını ayırt et',visual:{type:'share-model',groups:x.groups,each:x.each},hint:'Bölmede bütün korunur; değişen, bütünün eşit paylara nasıl ayrıldığıdır.',explain:`${answer}. Bunun çarpma cümlesi ${x.groups} × ${x.each} = ${x.total}.`,divisionMode:x.mode
    });
  }
  const y=c.transfer;
  if(y.mode==='sharing') return qTask('divide20g1',rep,`${y.total} kalem ${y.groups} çocuğa eşit paylaştırılıyor. Her çocuk kaç kalem alır?`,y.each,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Eşit paylaşmayı günlük duruma taşı',visual:{type:'share-model',groups:y.groups,each:y.each},hint:'Her çocuk aynı miktarı almalı ve bütün kalemler kullanılmalı.',explain:`${y.groups} × ${y.each} = ${y.total}; her çocuk ${y.each} kalem alır.`,divisionMode:y.mode
  });
  return qTask('divide20g1',rep,`${y.total} kurabiye, her tabağa ${y.each} kurabiye konarak eşit gruplandırılıyor. Kaç tabak gerekir?`,y.groups,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Eşit gruplamayı günlük duruma taşı',visual:{type:'share-model',groups:y.groups,each:y.each},hint:`Kaç tane ${y.each}'li eşit grup toplam ${y.total} eder?`,explain:`${y.groups} × ${y.each} = ${y.total}; ${y.groups} tabak gerekir.`,divisionMode:y.mode
  });
}
function genMoney1(rep,d,rng,concept){
  const c=concept?.skillId==='money1'?concept:createConceptInstance('money1',d,rng);
  const x=c.anchor;
  const unitLabel=z=>z.unit==='kr'?'kuruş':'TL';
  const fmt=(n,z)=>`${n} ${unitLabel(z)}`;
  if(rep==='build') return qTask('money1',rep,`${fmt(x.target,x)} değerini para parçalarını seçerek oluştur.`,x.target,{kind:'manipulative',interaction:'money-make',expectedValue:String(x.target),unit:x.unit,checkLabel:'Paramı kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Aynı değeri farklı parçalarla kur',visual:{type:'money-make-interactive',target:x.target,denoms:x.denoms,unit:x.unit},hint:'Parça sayısını değil, her parçanın üzerindeki değeri topla.',explain:`Seçtiğin parçaların toplam değeri ${fmt(x.target,x)} olmalı.`
  });
  if(rep==='see'){
    const wrongA=[...x.values,Math.min(...x.denoms)];
    const wrongB=x.values.length>1?x.values.slice(1):[Math.max(...x.denoms.filter(v=>v<x.target))||x.denoms[0]];
    const sets=[x.values,wrongA,wrongB];
    const opts=shuffled(sets.map((vals,i)=>({value:vals.reduce((a,b)=>a+b,0)===x.target?'correct':`wrong-${i}`,visual:{type:'money',values:vals,unit:x.unit},ariaLabel:`Toplam ${vals.reduce((a,b)=>a+b,0)} ${unitLabel(x)}`})),rng);
    return qTask('money1',rep,`${fmt(x.target,x)} ile aynı değeri gösteren para grubu hangisi?`,'correct',{kind:'visual-choice',options:opts}, {
      taskKind:'visual-discrimination',taskLabel:'Eşdeğer para gruplarını ayırt et',visual:{type:'price-tag',price:x.target,unit:x.unit},hint:'Farklı parça kombinasyonları aynı toplam değeri gösterebilir.',explain:`Doğru grubun toplam değeri ${fmt(x.target,x)}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('money1',rep,`Bu paraların toplam değeri kaç ${unitLabel(y)}?`,y.target,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Toplamı kontrol et'}, {
      taskKind:'symbol-entry',taskLabel:'Para modelini sayı ve birimle ifade et',visual:{type:'money',values:y.values,unit:y.unit},hint:'Aynı birimdeki değerleri topla.',explain:`${y.values.join(' + ')} = ${fmt(y.target,y)}.`
    });
  }
  if(rep==='explain'){
    const denom=x.unit==='kr'?25:10; const pieces=x.unit==='kr'?[10,10,5]:[5,5];
    const answer=`${pieces.join(' + ')} ile ${denom}, aynı toplam değeri gösterir`;
    return qBase('money1',rep,`${pieces.map(v=>fmt(v,x)).join(' + ')} ile ${fmt(denom,x)} arasındaki ilişki nedir?`,answer,semanticChoices(answer,['Parça sayısı fazla olan her zaman daha değerlidir','Farklı para parçaları hiçbir zaman eşdeğer olamaz','Yalnız en büyük parçayı saymak yeterlidir'],rng), {
      taskKind:'reasoning-choice',taskLabel:'Para eşdeğerliğini açıkla',visual:{type:'money-compare',left:pieces,right:[denom],unit:x.unit},hint:'İki taraftaki toplam değeri ayrı ayrı hesapla.',explain:`Her iki taraf da ${fmt(denom,x)} eder; para değeri parça sayısından bağımsızdır.`
    });
  }
  const y=c.transfer;
  const bump=y.unit==='kr'?(y.target<=75?25:0):(y.target<=90?10:0);
  if(bump>0){
    const pay=y.target+bump, change=bump;
    return qTask('money1',rep,`Bir ürün ${fmt(y.target,y)}. ${fmt(pay,y)} verirsen kaç ${unitLabel(y)} para üstü alırsın?`,change,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Alışverişi kontrol et'}, {
      taskKind:'context-transfer',taskLabel:'Para bilgisini alışverişe taşı',visual:{type:'money-shopping',price:y.target,pay,unit:y.unit},hint:'Verilen para ile fiyat aynı birimde; aradaki farkı bul.',explain:`${pay}−${y.target}=${fmt(change,y)} para üstü.`
    });
  }
  const spend=y.unit==='kr'?25:10, left=y.target-spend;
  return qTask('money1',rep,`${fmt(y.target,y)} paran var. ${fmt(spend,y)} harcarsan kaç ${unitLabel(y)} kalır?`,left,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Alışverişi kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Aynı birimde para çıkarma yap',visual:{type:'money-shopping',price:spend,pay:y.target,unit:y.unit},hint:'Başlangıç parasından harcananı çıkar.',explain:`${y.target}−${spend}=${fmt(left,y)}.`
  });
}
function genLengthMeasure1(rep,d,rng,concept){
  const c=concept?.skillId==='lengthMeasure1'?concept:createConceptInstance('lengthMeasure1',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('lengthMeasure1',rep,`Çizgi parçasının sonunu cetvelde ${x.cm} cm işaretine getir.`,x.cm,{kind:'manipulative',interaction:'cm-ruler',expectedValue:String(x.cm),checkLabel:'Ölçümü kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Cetvelle santimetre ölç',visual:{type:'cm-ruler-interactive',target:x.cm,max:15},hint:'Çizginin başlangıcı 0 işaretinde olmalı; bitiş noktasını santimetre çizgisinde seç.',explain:`0 ile ${x.cm} arasındaki uzaklık ${x.cm} cm'dir.`
  });
  if(rep==='see'){
    const options=shuffled([
      {value:'correct',visual:{type:'cm-ruler-model',cm:x.cm,start:0,max:15},ariaLabel:`0'dan ${x.cm} santimetreye hizalı çizgi`},
      {value:'wrong-start',visual:{type:'cm-ruler-model',cm:x.cm,start:1,max:15},ariaLabel:'başlangıcı sıfırda olmayan çizgi'},
      {value:'wrong-end',visual:{type:'cm-ruler-model',cm:Math.min(14,x.cm+1),start:0,max:15},ariaLabel:'bitiş işareti yanlış çizgi'}
    ],rng);
    return qTask('lengthMeasure1',rep,`${x.cm} cm uzunluğunu doğru gösteren cetvel modeli hangisi?`,'correct',{kind:'visual-choice',options}, {
      taskKind:'visual-discrimination',taskLabel:'Sıfır başlangıcını ve cm aralıklarını ayırt et',visual:{type:'cm-badge',cm:x.cm},hint:'Başlangıç 0’da olmalı ve çizgi doğru cm işaretinde bitmeli.',explain:`Doğru model 0'dan ${x.cm}'ye kadar ${x.cm} eşit santimetre aralığı gösterir.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('lengthMeasure1',rep,'Cetvelde gösterilen çizgi kaç santimetredir?',y.cm,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Ölçümü kontrol et'}, {
      taskKind:'symbol-entry',taskLabel:'Cetvel modelini cm sayısına çevir',visual:{type:'cm-ruler-model',cm:y.cm,start:0,max:15},hint:'Başlangıç 0 ise bitiş işareti uzunluğu doğrudan verir.',explain:`Çizgi ${y.cm} cm uzunluğunda.`
    });
  }
  if(rep==='explain'){
    const answer='Çizginin bir ucu 0 işaretinde olmalı ve eşit santimetre aralıkları sayılmalı';
    return qBase('lengthMeasure1',rep,'Cetvelle doğru uzunluk ölçmenin temel kuralı hangisidir?',answer,semanticChoices(answer,['Çizgiyi cetvelin herhangi bir yerinden başlatıp bitiş sayısını uzunluk sayarım','Cetveldeki rakamların büyüklüğüne bakarım','Santimetre çizgileri arasındaki aralıkların eşit olması gerekmez'],rng), {
      taskKind:'reasoning-choice',taskLabel:'Cetvelle ölçmenin nedenini açıkla',visual:{type:'cm-ruler-model',cm:x.cm,start:0,max:15},hint:'Uzunluk, iki nokta arasındaki eşit birim sayısıdır.',explain:'Sıfır başlangıcı ve eşit cm aralıkları, ölçümün gerçek uzunluğu göstermesini sağlar.'
    });
  }
  const y=c.transfer;
  return qTask('lengthMeasure1',rep,`Bir kurdelenin bir ucu cetvelde 0'a, diğer ucu ${y.cm} cm çizgisine geliyor. Kurdele kaç santimetredir?`,y.cm,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Cevabı kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Santimetre ölçmeyi günlük nesneye taşı',visual:{type:'cm-ruler-model',cm:y.cm,start:0,max:15},hint:'0’dan bitiş işaretine kadar olan cm aralıklarını düşün.',explain:`Kurdele ${y.cm} cm uzunluğundadır.`
  });
}
function genTime1(rep,d,rng,concept){
  const c=concept?.skillId==='time1'?concept:createConceptInstance('time1',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('time1',rep,`Saati ${x.label} gösterecek şekilde ayarla.`,`${x.hour}|${x.minute}`,{kind:'manipulative',interaction:'clock-set',expectedValue:`${x.hour}|${x.minute}`,checkLabel:'Saati kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Akrep ve yelkovanı 5 dakikalık aralıklarla ayarla',visual:{type:'clock-set-interactive',hour:x.hour,minute:x.minute},hint:`Yelkovanda her sayı aralığı 5 dakikadır. ${x.minute} dakika için ${x.minute/5} aralık ilerle.`,explain:`Saat ${x.label}. Yelkovan ${x.minute===0?'12':x.minute/5}. sayı konumundadır.`
  });
  if(rep==='see'){
    const wrongMinute=(x.minute+5)%60, wrongHour=wrongMinute===0?((x.hour%12)+1):x.hour;
    const opts=shuffled([
      {value:'correct',visual:{type:'clock',hour:x.hour,minute:x.minute},ariaLabel:`Saat ${x.label}`},
      {value:'wrong-1',visual:{type:'clock',hour:wrongHour,minute:wrongMinute},ariaLabel:'beş dakika farklı saat'},
      {value:'wrong-2',visual:{type:'clock',hour:(x.hour%12)+1,minute:x.minute},ariaLabel:'bir saat farklı'}
    ],rng);
    return qTask('time1',rep,`${x.label} zamanını gösteren saat hangisi?`,'correct',{kind:'visual-choice',options:opts}, {
      taskKind:'visual-discrimination',taskLabel:'Saat yüzünü 5 dakikalık zamanla eşleştir',visual:{type:'time-label',label:x.label},hint:'Önce yelkovanın dakikasını, sonra akrebin bulunduğu saat aralığını oku.',explain:`Doğru saat ${x.label}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    const distractors=time1Cases().filter(z=>z.label!==y.label && (z.hour===y.hour || z.minute===y.minute)).map(z=>z.label);
    return qBase('time1',rep,'Gösterilen saatin sayısal yazımı hangisidir?',y.label,semanticChoices(y.label,distractors,rng), {
      taskKind:'symbol-entry',taskLabel:'Saat yüzünü saat:dakika yazımına çevir',visual:{type:'clock',hour:y.hour,minute:y.minute},hint:'Yelkovanın gösterdiği dakika 5’in katıdır.',explain:`Saat ${y.label}.`
    });
  }
  if(rep==='explain'){
    const answer=`Yelkovan her sayı aralığında 5 dakika ilerler; ${x.minute/5} aralık ${x.minute} dakikadır`;
    return qBase('time1',rep,`${x.label} saatinde ${x.minute} dakikayı nasıl okursun?`,answer,semanticChoices(answer,['Yelkovandaki sayıyı dakika olarak aynen okurum','Yalnız akrebe bakarım; yelkovan önemli değildir','Her sayı aralığı 10 dakika kabul edilir'],rng), {
      taskKind:'reasoning-choice',taskLabel:'5 dakikalık saat okuma kuralını gerekçelendir',visual:{type:'clock',hour:x.hour,minute:x.minute},hint:'Analog saatte bir tam tur 60 dakika ve 12 eşit sayı aralığı vardır.',explain:`60 ÷ 12 = 5; bu yüzden her sayı aralığı 5 dakikadır. Süre yazımında h saat, min dakika kısaltmasıdır. ${x.period}, uluslararası gösterimde ${x.intl} dönemine karşılık gelir.`
    });
  }
  const y=c.transfer, end=addClockMinutes(y,y.duration);
  const fmt=z=>`${z.label} ${z.period}`;
  const answer=fmt(end);
  const distractors=[
    addClockMinutes(y,y.duration-5),
    addClockMinutes(y,y.duration+5),
    addClockMinutes(y,y.duration===60?30:60)
  ].map(fmt);
  return qBase('time1',rep,`Bir etkinlik ${y.label} ${y.period} (${y.intl}) başlıyor ve ${y.duration===60?'1 saat (1 h)':'yarım saat (30 min)'} sürüyor. Bitiş zamanı hangisidir?`,answer,semanticChoices(answer,distractors,rng), {
    taskKind:'context-transfer',taskLabel:'Saati süre ve günlük programa taşı',visual:{type:'schedule-event',label:`${y.label} ${y.period}`,event:y.duration===60?'1 saatlik etkinlik':'yarım saatlik etkinlik'},hint:`Başlangıç zamanına ${y.duration} dakika ekle; 12 sınırını geçersen ÖÖ/ÖS değişimini de kontrol et.`,explain:`${y.label} ${y.period} + ${y.duration} dakika = ${answer}.`
  });
}
function genShapePattern1(rep,d,rng,concept){
  const c=concept?.skillId==='shapePattern1'?concept:createConceptInstance('shapePattern1',d,rng);
  const x=c.anchor;
  const key=z=>[...z.pieces].sort().join('+');
  const label=id=>({square:'kare',triangle:'üçgen',rect:'dikdörtgen',halfCircle:'yarım daire',quarterCircle:'çeyrek daire',circle:'daire'}[id]||id);
  if(rep==='build') return qTask('shapePattern1',rep,`${x.name[0].toUpperCase()+x.name.slice(1)} figürünü oluşturmak için gereken şekil parçalarını seç.`,key(x),{kind:'manipulative',interaction:'shape-compose',expectedValue:key(x),checkLabel:'Figürümü kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Basit şekilleri birleştirerek figür oluştur',visual:{type:'shape-compose-interactive',figure:x.id,pieces:x.pieces},hint:`Hedef figürde ${x.description} kullanılıyor. Gerekli parçaları bankadan seç.`,explain:`${x.name[0].toUpperCase()+x.name.slice(1)} figürü ${x.description} ile kurulabilir.`
  });
  if(rep==='see'){
    const cases=shapePatternCases(), distractors=shuffled(cases.filter(z=>z.id!==x.id),rng).slice(0,2);
    const opts=shuffled([x,...distractors].map(z=>({value:z.id,visual:{type:'composite-figure',figure:z.id,pieces:z.pieces},ariaLabel:`${z.name} figürü`})),rng);
    return qTask('shapePattern1',rep,`${x.description} kullanılarak oluşturulmuş figür hangisi?`,x.id,{kind:'visual-choice',options:opts}, {
      taskKind:'visual-discrimination',taskLabel:'Bütünü oluşturan şekil parçalarını gör',visual:{type:'shape-piece-list',pieces:x.pieces},hint:'Figürün dış görünüşünden çok hangi basit şekillerden oluştuğuna bak.',explain:`Doğru figür ${x.name}; içinde ${x.description} bulunur.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, answer=y.pieces.map(label).join(' + ');
    const wrong=shuffled(shapePatternCases().filter(z=>key(z)!==key(y)).map(z=>z.pieces.map(label).join(' + ')),rng);
    return qBase('shapePattern1',rep,'Gösterilen figürü oluşturan temel şekilleri matematiksel adlarıyla seç.',answer,semanticChoices(answer,wrong,rng), {
      taskKind:'symbol-entry',taskLabel:'Bileşen şekilleri adlandır',visual:{type:'composite-figure',figure:y.id,pieces:y.pieces},hint:'Bütünü zihninde parçalara ayır; yarım daire ve çeyrek daireyi de ayrı şekil olarak tanı.',explain:`Bu figür ${answer} parçalarından oluşur.`
    });
  }
  if(rep==='explain'){
    const answer='Aynı bütün, daha basit 2B şekillere ayrılarak incelenebilir ve bu parçalar tekrar birleştirilebilir';
    return qBase('shapePattern1',rep,'Bir figürü neden kare, üçgen, yarım daire veya çeyrek daire gibi parçalara ayırırız?',answer,semanticChoices(answer,['Şekiller yalnız renklerine göre sınıflandırılır','Bir figür yalnız tek bir şekilden oluşabilir','Parçaların yönü ve birleşmesi bütünü hiç etkilemez'],rng), {
      taskKind:'reasoning-choice',taskLabel:'Bütün–parça geometri ilişkisini açıkla',visual:{type:'composite-figure',figure:x.id,pieces:x.pieces},hint:'Bir figürü oluşturan parçaları görmek, aynı figürü yeniden kurmayı kolaylaştırır.',explain:answer+'.'
    });
  }
  const y=c.transfer, cells=p1GridCellsForFigure(y.copy), expected=[...cells].sort().join('|');
  return qTask('shapePattern1',rep,`Örnekteki ${y.name} figürünü kareli alana aynı düzenle kopyala.`,expected,{kind:'manipulative',interaction:'square-grid-copy',expectedValue:expected,checkLabel:'Kopyamı kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Şekil düzenini kareli alana gerçekten kopyala',visual:{type:'square-grid-copy-interactive',size:5,cells,figure:y.copy},hint:'Hedefi satır satır incele; dolu hücreleri boş alanda aynı konuma getir.',explain:`Kopyada ${y.name} figürünün dolu hücreleri hedefle aynı satır ve sütunlarda olmalı.`
  });
}


function parityPairingStatement(z){
  return z.leftover
    ? String(z.n)+' sayısının birlikleri ikişerli eşleşince 1 birlik artar; '+z.n+' tektir.'
    : String(z.n)+' sayısının birlikleri ikişerli eşleşince artan kalmaz; '+z.n+' çifttir.';
}
function genOddEven1000(rep,d,rng,concept){
  const c=concept?.skillId==='oddEven1000'?concept:createConceptInstance('oddEven1000',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('oddEven1000',rep,x.n+' sayısının birliklerini ikişerli eşleştir. Kaç birlik eşsiz kalır?',x.leftover,{kind:'manipulative',interaction:'parity-pair',expectedValue:String(x.leftover),checkLabel:'Eşleştirmeyi kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Birlikleri ikişerli eşleştir',visual:{type:'parity-pair-builder',n:x.n,ones:x.ones},hint:'Birlikleri ikişerli eşleştir; sonunda 0 ya da 1 birlik artabilir.',explain:parityPairingStatement(x)
  });
  if(rep==='see'){
    const opposite=shuffled(oddEven1000Cases().filter(z=>z.leftover!==x.leftover&&z.n!==x.n),rng).slice(0,2);
    const opts=shuffled([
      {value:'correct',visual:{type:'parity-card',n:x.n,ones:x.ones,leftover:x.leftover},ariaLabel:x.n+' için eşleştirme modeli'},
      ...opposite.map((z,i)=>({value:'wrong-'+i,visual:{type:'parity-card',n:z.n,ones:z.ones,leftover:z.leftover},ariaLabel:z.n+' için eşleştirme modeli'}))
    ],rng);
    return qTask('oddEven1000',rep,x.leftover?'Hangi modelde ikişerli eşleştirmeden sonra 1 birlik artıyor?':'Hangi modelde ikişerli eşleştirmeden sonra artan kalmıyor?','correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Eşleşmede artanı görselde ayırt et',visual:{type:'numbercard',n:x.n},hint:'Her modelde ikişerli eşleşmenin sonunda turuncu artan birlik olup olmadığına bak.',explain:parityPairingStatement(x)
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qBase('oddEven1000',rep,y.n+' sayısını tek veya çift olarak sınıflandır.',y.parity,semanticChoices(y.parity,[y.parity==='Çift'?'Tek':'Çift'],rng),{
      taskKind:'symbol-entry',taskLabel:'Tek–çift sınıfını matematik diliyle yaz',visual:{type:'equation',text:String(y.n)},hint:'Birlik rakamını ikişerli eşleşme açısından düşün.',explain:parityPairingStatement(y)
    });
  }
  if(rep==='explain'){
    const answer='Her onluk 10 birliktir ve 10 birlik tamamen ikişerli eşleşir; yüzlükler de tam onluklardan oluşur; bu yüzden kararı birlik basamağı verir';
    return qBase('oddEven1000',rep,x.n+' sayısının tek mi çift mi olduğunu neden birlik basamağından anlayabiliriz?',answer,semanticChoices(answer,['Yalnız en büyük rakama bakmak yeterlidir','Bütün rakamların tek ya da çift olması gerekir','Yüzlük basamağı tekse bütün sayı da tektir'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Tek–çift kuralını gerekçelendir',visual:{type:'parity-card',n:x.n,ones:x.ones,leftover:x.leftover},hint:'Bir onluğun 10 birliğini ikişerli eşleştirince artan kalıp kalmadığını düşün.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  return qTask('oddEven1000',rep,y.n+' öğrenci ikişerli sıraya geçiyor. Kaç öğrenci eşsiz kalır?',y.leftover,{kind:'number-input',placeholder:'0 ya da 1',maxLength:1,checkLabel:'Eşleşmeyi kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Tek–çifti eşli sıra bağlamına taşı',visual:{type:'parity-card',n:y.n,ones:y.ones,leftover:y.leftover},hint:'Bütün miktarı çizmek yerine birlik rakamını ikişerli eşleştir.',explain:y.leftover?'1 öğrenci eşsiz kalır; sayı tektir.':'Eşsiz öğrenci kalmaz; sayı çifttir.'
  });
}

function genWordAddSub2(rep,d,rng,concept){
  const c=concept?.skillId==='wordAddSub2'?concept:createConceptInstance('wordAddSub2',d,rng);
  const x=c.anchor, plan=`${x.op1}|${x.op2}`;
  if(rep==='build') return qTask('wordAddSub2',rep,`${x.story} Çözüm için iki işlem kartını doğru sıraya yerleştir.`,plan,{kind:'manipulative',interaction:'two-step-plan',expectedValue:plan,checkLabel:'Planımı kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'İki adımlı çözüm planını kur',visual:{type:'two-step-plan-builder',a:x.a,b:x.b,c:x.c},hint:'Önce ilk değişimin miktarı artırıp azaltmasına, sonra ikinci değişime bak.',explain:`Plan: önce ${x.a} ${x.op1} ${x.b} = ${x.first}; sonra ${x.first} ${x.op2} ${x.c} = ${x.ans}.`
  });
  if(rep==='see'){
    const variants=[[x.op1,x.op2],[x.op1==='+'?'−':'+',x.op2],[x.op1,x.op2==='+'?'−':'+']];
    const opts=shuffled(variants.map(([op1,op2],i)=>({value:op1===x.op1&&op2===x.op2?'correct':`wrong-${i}`,visual:{type:'two-step-model',a:x.a,b:x.b,c:x.c,op1,op2},ariaLabel:`önce ${op1}, sonra ${op2}`})),rng);
    return qTask('wordAddSub2',rep,`${x.story} Hikâyeye uyan iki adımlı model hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Hikâye ile iki adımlı modeli eşleştir',visual:{type:'two-step-model',a:x.a,b:x.b,c:x.c,op1:'?',op2:'?'},hint:'“Geldi/eklendi” artış; “gitti/verildi/satıldı” azalıştır.',explain:`Doğru model önce ${x.op1}, sonra ${x.op2} işlemini kullanır.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('wordAddSub2',rep,`${y.story} Sonuç kaçtır?`,y.ans,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Çözümümü kontrol et'}, {
      taskKind:'symbol-entry',taskLabel:'İki adımlı problemi sayısal çöz',visual:{type:'two-step-model',a:y.a,b:y.b,c:y.c,op1:y.op1,op2:y.op2},hint:'İlk işlemin sonucunu ikinci işlemde kullan.',explain:`${y.a} ${y.op1} ${y.b} = ${y.first}; ${y.first} ${y.op2} ${y.c} = ${y.ans}.`
    });
  }
  if(rep==='explain'){
    const answer='İkinci adım, birinci işlemin sonucunu başlangıç miktarı olarak kullanır';
    return qBase('wordAddSub2',rep,'İki adımlı bir problemde neden ilk işlemin sonucunu bulmadan ikinci adıma geçemeyiz?',answer,semanticChoices(answer,['İkinci işlem her zaman toplama olduğu için','Sorudaki en büyük sayıyı kullanmak gerektiği için','İşlem sırası matematikte hiç önemli olmadığı için'],rng),{
      taskKind:'reasoning-choice',taskLabel:'İki adımlı bağımlılığı açıkla',visual:{type:'two-step-model',a:x.a,b:x.b,c:x.c,op1:x.op1,op2:x.op2},hint:'İkinci işlem hangi miktardan başlıyor?',explain:`İlk sonuç ${x.first}; ikinci adım bu yeni miktarı kullanır.`
    });
  }
  const y=c.transfer;
  return qTask('wordAddSub2',rep,`${y.story} Son durumda kaç tane vardır?`,y.ans,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Problemi kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'İki adımlı yapıyı yeni hikâyede kullan',visual:{type:'two-step-model',a:y.a,b:y.b,c:y.c,op1:y.op1,op2:y.op2},hint:'Hikâyeyi iki değişime ayır ve sırayla işle.',explain:`${y.a} ${y.op1} ${y.b} = ${y.first}; ${y.first} ${y.op2} ${y.c} = ${y.ans}.`
  });
}

function genNumber1000(rep,d,rng,concept){
  const c=concept?.skillId==='number1000'?concept:createConceptInstance('number1000',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('number1000',rep,`${x.n} sayısını yüzlük, onluk ve birlik bloklarıyla kur.`,`${x.hundreds}|${x.tens}|${x.ones}`,{kind:'manipulative',interaction:'base1000-build',expectedValue:`${x.hundreds}|${x.tens}|${x.ones}`,checkLabel:'Modelimi kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Yüzlük–onluk–birlik yapısını kur',visual:{type:'base1000-build-interactive',target:x.n,maxHundreds:10,maxTens:9,maxOnes:9},hint:'Önce yüzlükleri, sonra onlukları ve birlikleri yerleştir.',explain:`${x.n} = ${x.hundreds} yüzlük + ${x.tens} onluk + ${x.ones} birlik.`
  });
  if(rep==='see'){
    const candidates=[x.n,Math.max(100,x.n-10),Math.min(1000,x.n+100)];
    const uniq=[...new Set(candidates)]; while(uniq.length<3) uniq.push(Math.max(100,x.n-1-uniq.length));
    const opts=shuffled(uniq.slice(0,3).map((n,i)=>{const z=hto(n); return {value:n===x.n?'correct':`wrong-${i}`,visual:{type:'base1000',...z},ariaLabel:`${n} sayısının yüzlük onluk birlik modeli`};}),rng);
    return qTask('number1000',rep,`${x.n} sayısını gösteren model hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Basamak modelini görselde ayırt et',visual:{type:'numbercard',n:x.n},hint:'Yüzlük, onluk ve birlik bloklarını ayrı ayrı say.',explain:`${x.n}, ${x.hundreds} yüzlük, ${x.tens} onluk ve ${x.ones} birlikten oluşur.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('number1000',rep,`“${trNumberWord(y.n)}” sayısını rakamla yaz.`,y.n,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Yazdığımı kontrol et'}, {
      taskKind:'symbol-entry',taskLabel:'Sayı sözcüğünü rakama çevir',visual:{type:'base1000',...hto(y.n)},hint:'Yüzlük, onluk ve birlik basamaklarını sırayla düşün.',explain:`“${trNumberWord(y.n)}” = ${y.n}.`
    });
  }
  if(rep==='explain'){
    const answer=x.n===1000?'10 yüzlük, 1000 değerini oluşturur':`${x.hundreds} yüzlük, ${x.hundreds*100} değerini gösterir`;
    return qBase('number1000',rep,`${x.n} sayısında yüzlük basamağını nasıl açıklarsın?`,answer,semanticChoices(answer,['Yüzlük basamağı yalnız rakamın şeklini gösterir','Onluk ve yüzlük aynı değerdedir','Birlik basamağı bütün sayının değerini tek başına belirler'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Basamak değerini gerekçelendir',visual:{type:'base1000',...hto(x.n)},hint:'Bir yüzlük 100 birimdir.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  return qTask('number1000',rep,`Depoda ${y.hundreds} kutu 100’lük, ${y.tens} paket 10’luk ve ${y.ones} tek parça var. Toplam kaç parça vardır?`,y.n,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Problemi kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Basamak değerini paketleme bağlamına taşı',visual:{type:'base1000',...hto(y.n)},hint:'Yüzlük kutuları 100, onluk paketleri 10 olarak düşün.',explain:`${y.hundreds*100}+${y.tens*10}+${y.ones}=${y.n}.`
  });
}

function compareOrderReason(a,b){
  const ad=[Math.floor(a/100),Math.floor((a%100)/10),a%10], bd=[Math.floor(b/100),Math.floor((b%100)/10),b%10];
  const names=['yüzlük','onluk','birlik'];
  for(let i=0;i<3;i++){
    if(ad[i]!==bd[i]){
      const relation=ad[i]<bd[i]?'küçüktür':'büyüktür';
      return `${ad[i]} ${names[i]}, ${bd[i]} ${names[i]}dan ${relation}; bu yüzden ${a}, ${b}'den ${a<b?'küçüktür':'büyüktür'}.`;
    }
  }
  return `${a} ve ${b}'nin yüzlük, onluk ve birlikleri aynıdır; sayılar eşittir.`;
}
function genCompareOrder1000(rep,d,rng,concept){
  const c=concept?.skillId==='compareOrder1000'?concept:createConceptInstance('compareOrder1000',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('compareOrder1000',rep,`${x.a} ve ${x.b} sayı kartlarını küçükten büyüğe sırala.`,`${x.smaller}|${x.larger}`,{kind:'manipulative',interaction:'order-pair',expectedValue:`${x.smaller}|${x.larger}`,checkLabel:'Sıramı kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Üç basamaklı sayıları sırala',visual:{type:'order-pair-interactive',a:x.a,b:x.b},hint:'Yüzlüklerden başla. Aynıysa onluklara, sonra birliklere geç.',explain:compareOrderReason(x.a,x.b)
  });
  if(rep==='see'){
    const answer=x.a===x.b?'aynıdır':x.a<x.b?'daha küçüktür':'daha büyüktür';
    return qBase('compareOrder1000',rep,`${x.a}, ${x.b}'ye göre nasıldır?`,answer,semanticChoices(answer,['daha küçüktür','daha büyüktür','aynıdır','karşılaştırılamaz'].filter(v=>v!==answer),rng),{
      taskKind:'visual-discrimination',taskLabel:'Karşılaştırmayı basamak modelinde gör',visual:{type:'compare-base1000',a:x.a,b:x.b,relation:'?'},hint:'Soldan başla: yüzlük, onluk, birlik.',explain:compareOrderReason(x.a,x.b)
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    const opts=shuffled(['<','>','='].map(relation=>({value:relation,visual:{type:'equation',text:relation},ariaLabel:relation==='<'?'küçüktür':relation==='>'?'büyüktür':'eşittir'})),rng);
    return qTask('compareOrder1000',rep,`${y.a} __ ${y.b} boşluğuna hangi karşılaştırma işareti gelir?`,y.relation,{kind:'visual-choice',options:opts},{
      taskKind:'symbol-entry',taskLabel:'Karşılaştırmayı sembolleştir',visual:{type:'equation',text:`${y.a} __ ${y.b}`},hint:'Önce sayıları sözcükle karşılaştır; sonra aynı ilişkiyi <, > veya = ile yaz.',explain:`${compareOrderReason(y.a,y.b)} Sembolle: ${y.a} ${y.relation} ${y.b}.`
    });
  }
  if(rep==='explain'){
    const ah=Math.floor(x.a/100), bh=Math.floor(x.b/100), at=Math.floor((x.a%100)/10), bt=Math.floor((x.b%100)/10);
    const answer=ah!==bh?'Önce yüzlük basamağını karşılaştırırım':at!==bt?'Yüzlükler eşit; onluk basamağını karşılaştırırım':'Yüzlük ve onluklar eşit; birlikleri karşılaştırırım';
    return qBase('compareOrder1000',rep,`${x.a} ile ${x.b} karşılaştırılırken hangi düşünce doğrudur?`,answer,semanticChoices(answer,['Yalnız son rakama bakarım','Rakam sayıları eşitse sayılar da eşittir','Basamakların yerini önemsemem'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Basamak sırasını gerekçelendir',visual:{type:'compare-base1000',a:x.a,b:x.b,relation:'?'},hint:'Soldan sağa ilerle ve ilk farklı basamakta dur.',explain:compareOrderReason(x.a,x.b)
    });
  }
  const y=c.transfer;
  return qTask('compareOrder1000',rep,`İki depoda ${y.a} ve ${y.b} ürün var. Daha çok ürünü olan depoda kaç ürün vardır?`,y.larger,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Karşılaştırmayı kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Karşılaştırmayı gerçek miktara taşı',visual:{type:'shelf-counts',a:y.a,b:y.b},hint:'İki sayıyı yüzlüklerden başlayarak karşılaştır.',explain:`${y.larger}, ${y.smaller}'dan büyüktür.`
  });
}
function genNumberPattern1000(rep,d,rng,concept){
  const c=concept?.skillId==='numberPattern1000'?concept:createConceptInstance('numberPattern1000',d,rng);
  const x=c.anchor;
  const rule=step=>`Her adımda ${Math.abs(step)} ${step>0?'ekleniyor':'çıkarılıyor'}`;
  if(rep==='build'){
    const candidates=shuffled([...new Set([x.step,-x.step,x.step>0?10: -10,x.step>0?100:-100])],rng).slice(0,4);
    if(!candidates.includes(x.step)) candidates[0]=x.step;
    return qTask('numberPattern1000',rep,'Örüntünün sonraki adımını oluşturacak kuralı seç.',x.step,{kind:'manipulative',interaction:'pattern-step',expectedValue:String(x.step),checkLabel:'Kuralımı kontrol et'}, {
      taskKind:'manipulative-build',taskLabel:'Sabit adımı uygulayarak örüntüyü kur',visual:{type:'pattern-step-interactive',seq:x.seq,candidates:shuffled([...new Set(candidates)],rng)},hint:'Ardışık iki sayı arasındaki farkı bul.',explain:`${rule(x.step)}; sonraki sayı ${x.next}.`
    });
  }
  if(rep==='see'){
    const options=[x.next,x.next+x.step,x.next-x.step].filter((v,i,a)=>v>=0&&v<=1000&&a.indexOf(v)===i);
    while(options.length<3) options.push(x.next+options.length+1);
    const opts=shuffled(options.slice(0,3).map((next,i)=>({value:next===x.next?'correct':`wrong-${i}`,visual:{type:'sequence',items:[...x.seq,next]},ariaLabel:`örüntü ${next} ile devam ediyor`})),rng);
    return qTask('numberPattern1000',rep,'Aynı kuralı doğru sürdüren dizi hangisi?','correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Doğru devamı görselde ayırt et',visual:{type:'sequence',items:[...x.seq,'?']},hint:'Her geçişte aynı miktar değişmeli.',explain:`${rule(x.step)}; doğru devam ${x.next}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('numberPattern1000',rep,`${y.seq.join(', ')}, … sıradaki sayıyı yaz.`,y.next,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Sayımı kontrol et'}, {
      taskKind:'symbol-entry',taskLabel:'Örüntüyü sayıyla sürdür',visual:{type:'sequence',items:[...y.seq,'?']},hint:'Sabit adımı bir kez daha uygula.',explain:`${rule(y.step)}; sıradaki sayı ${y.next}.`
    });
  }
  if(rep==='explain'){
    const answer=rule(x.step);
    return qBase('numberPattern1000',rep,`${x.seq.join(', ')}, … dizisinin kuralı nedir?`,answer,semanticChoices(answer,[`Her adımda ${Math.abs(x.step)} ${x.step>0?'çıkarılıyor':'ekleniyor'}`,'Her sayı rastgele seçiliyor','Her adımda değişen miktar farklı'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Sabit değişimi gerekçelendir',visual:{type:'sequence',items:[...x.seq,'?']},hint:'İki komşu sayı arasındaki farkı karşılaştır.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  const context=y.step>0?'Bir depoya her gün aynı sayıda ürün ekleniyor':'Bir depodan her gün aynı sayıda ürün çıkıyor';
  return qTask('numberPattern1000',rep,`${context}. Sayımlar ${y.seq.join(', ')} oldu. Bir sonraki sayım kaç olur?`,y.next,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Tahminimi kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Sabit değişimi günlük duruma taşı',visual:{type:'sequence',items:[...y.seq,'?']},hint:'Günler arasında değişen miktar hep aynı.',explain:`${rule(y.step)}; yeni sayım ${y.next}.`
  });
}

function genAddSub1000(rep,d,rng,concept){
  const c=concept?.skillId==='addSub1000'?concept:createConceptInstance('addSub1000',d,rng);
  const x=c.anchor, result=hto(x.ans);
  if(rep==='build') return qTask('addSub1000',rep,`${x.a} ${x.op} ${x.b} işleminin sonucunu yüzlük, onluk ve birlik bloklarıyla kur.`,`${result.hundreds}|${result.tens}|${result.ones}`,{kind:'manipulative',interaction:'base1000-build',expectedValue:`${result.hundreds}|${result.tens}|${result.ones}`,checkLabel:'Sonuç modelini kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Üç basamaklı işlemin sonucunu modelle',visual:{type:'base1000-operation-build',a:x.a,b:x.b,op:x.op,maxHundreds:10,maxTens:9,maxOnes:9},hint:x.renaming?'10 birlik = 1 onluk ve 10 onluk = 1 yüzlük ilişkisini kullan.':'Aynı basamakları kendi aralarında işle.',explain:`${x.a} ${x.op} ${x.b} = ${x.ans}.`
  });
  if(rep==='see'){
    const vals=[x.ans,Math.max(0,x.ans-10),Math.min(1000,x.ans+100)];
    const uniq=[...new Set(vals)]; while(uniq.length<3) uniq.push(Math.min(1000,x.ans+uniq.length+1));
    const opts=shuffled(uniq.slice(0,3).map((n,i)=>({value:n===x.ans?'correct':`wrong-${i}`,visual:{type:'base1000',...hto(n)},ariaLabel:`${n} sonuç modeli`})),rng);
    return qTask('addSub1000',rep,`${x.a} ${x.op} ${x.b} işleminin doğru sonuç modeli hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'İşlem sonucunu modelde ayırt et',visual:{type:'equation',text:`${x.a} ${x.op} ${x.b} = ?`},hint:'Yüzlük, onluk ve birlikleri ayrı kontrol et.',explain:`Doğru model ${x.ans} sayısını gösterir.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('addSub1000',rep,`${y.a} ${y.op} ${y.b} = ?`,y.ans,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'İşlemimi kontrol et'}, {
      taskKind:'symbol-entry',taskLabel:'Üç basamaklı işlemi sembolle çöz',visual:{type:'equation',text:`${y.a} ${y.op} ${y.b}`},hint:y.renaming?'Gerekirse 10 birlik ile 1 onluk, 10 onluk ile 1 yüzlük arasında yeniden grupla.':'Basamakları hizala.',explain:`${y.a} ${y.op} ${y.b} = ${y.ans}.`
    });
  }
  if(rep==='explain'){
    const answer=x.renaming?'Yeniden gruplama sayının değerini değiştirmez; 10 birlik 1 onluk, 10 onluk 1 yüzlüktür':'Aynı basamakları işlerim; bu örnekte yeniden gruplama gerekmez';
    return qBase('addSub1000',rep,`${x.a} ${x.op} ${x.b} işlemini yaparken hangi açıklama doğrudur?`,answer,semanticChoices(answer,['Yüzlükleri birlik gibi sayarım','Basamakların yerini değiştirsem sonuç aynı kalır','Yalnız en soldaki rakamı işlerim'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Basamak ve yeniden gruplamayı açıkla',visual:{type:'compare-base1000',a:x.a,b:x.b,relation:x.op},hint:'10 birlik ile 1 onluk aynı değeri temsil eder.',explain:`${answer}. Sonuç ${x.ans}.`
    });
  }
  const y=c.transfer;
  const prompt=y.op==='+'?`Kütüphanede ${y.a} kitap vardı, ${y.b} kitap daha geldi. Şimdi kaç kitap var?`:`Kütüphanede ${y.a} kitap vardı, ${y.b} kitap ödünç verildi. Kaç kitap kaldı?`;
  return qTask('addSub1000',rep,prompt,y.ans,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Problemi kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Üç basamaklı işlemi günlük probleme taşı',visual:{type:'story',a:y.a,b:y.b,kind:y.op==='+'?'gain':'loss'},hint:`Hikâyedeki değişim ${y.op==='+'?'artış':'azalış'} gösteriyor.`,explain:`${y.a} ${y.op} ${y.b} = ${y.ans}.`
  });
}

function genPlace100(rep,d,rng){
  const tens=randInt(1,8,rng), ones=randInt(0,9,rng), n=tens*10+ones;
  if(rep==='explain'){ const otherTens=ones===tens?((tens%8)+1):ones; return qBase('place100',rep,`${n} sayısındaki ${tens} neyi gösterir?`,`${tens} onluğu`,semanticChoices(`${tens} onluğu`,[`${tens} birliği`,`${otherTens} onluğu`,'Sadece rakamın şeklini'],rng),{visual:{type:'base10',tens,ones},hint:'Soldaki basamak onlukları gösterir.',explain:`${n} = ${tens} onluk + ${ones} birlik.`}); }
  return qBase('place100',rep,`${tens} onluk ve ${ones} birlik hangi sayıdır?`,n,numericChoices(n,10,rng),{visual:{type:'base10',tens,ones},hint:`${tens} onluk = ${tens*10}. Birlikleri ekle.`,explain:`${tens*10}+${ones}=${n}.`});
}
function genAdd100(rep,d,rng){
  const a=randInt(12,58,rng), b=randInt(5,Math.min(31,99-a),rng), ans=a+b;
  const visual=rep==='see'||rep==='build'?{type:'bar-add',a,b}:{type:'equation',text:`${a} + ${b}`};
  return qBase('add100',rep,`${a} + ${b} kaç eder?`,ans,numericChoices(ans,10,rng),{visual,hint:'Onlukları ve birlikleri ayrı düşün.',explain:`${a} + ${b} = ${ans}. Onluk-birlik yapısını koruyarak birleştirebilirsin.`,effort:1.25});
}
function genSub100(rep,d,rng){
  const a=randInt(35,95,rng), b=randInt(5,Math.min(34,a-1),rng), ans=a-b;
  return qBase('sub100',rep,`${a} − ${b} kaç eder?`,ans,numericChoices(ans,10,rng),{visual:{type:rep==='see'?'numberline100':'equation',a,b,text:`${a} − ${b}`},hint:'Önce onlukları, sonra birlikleri azaltmayı düşün.',explain:`${a} − ${b} = ${ans}.`,effort:1.25});
}
function genMultiply5(rep,d,rng){
  const groups=randInt(2,5,rng), each=randInt(2,5,rng), ans=groups*each;
  if(rep==='explain') return qBase('multiply5',rep,`${groups} grupta ${each} nesne var. Hangi ifade aynı yapıyı gösterir?`,`${groups} × ${each}`,semanticChoices(`${groups} × ${each}`,[`${groups} + ${each}`,`${groups} − ${each}`,`${groups} ÷ ${each}`],rng),{visual:{type:'groups',groups,each},hint:'Eşit büyüklükte kaç grup var?',explain:`${groups} grup × her grupta ${each} = ${ans}.`});
  return qBase('multiply5',rep,`${groups} eşit grupta ${each}’er tane var. Toplam kaç?`,ans,numericChoices(ans,5,rng),{visual:{type:'groups',groups,each},hint:`${each} sayısını ${groups} kez topla.`,explain:`${groups} × ${each} = ${ans}.`});
}
function genDivide20(rep,d,rng){
  const divisor=randInt(2,5,rng), quotient=randInt(2,4,rng), total=divisor*quotient;
  const prompt=`${total} nesneyi ${divisor} çocuğa eşit paylaştırırsak kişi başına kaç düşer?`;
  return qBase('divide20',rep,prompt,quotient,numericChoices(quotient,3,rng),{visual:{type:'share',total,divisor},hint:'Her gruba sırayla birer tane dağıt.',explain:`${total} ÷ ${divisor} = ${quotient}.`,effort:1.25});
}

function fractionSymbol(n,d){ return `${n}/${d}`; }
function fractionSymbolChoices(n,d,rng=Math.random){
  const answer=fractionSymbol(n,d), set=new Set([answer]);
  const candidates=[fractionSymbol(d,n),fractionSymbol(Math.max(1,n-1),d),fractionSymbol(Math.min(d,n+1),d),fractionSymbol(n,d+1),fractionSymbol(n+1,d+1),fractionSymbol(1,d)];
  for(const x of candidates){ if(set.size>=4) break; set.add(x); }
  let k=2; while(set.size<4){ set.add(fractionSymbol(Math.min(d,Math.max(1,n+k)),d+k)); k++; }
  return shuffled([...set],rng);
}
function fractionVisualOptions(correct,wrongCases,rng=Math.random){
  const opts=[{value:'correct',visual:{type:'fraction-strip',numerator:correct.numerator,denom:correct.denom},ariaLabel:`${correct.denom} eş parçadan ${correct.numerator} boyalı`}];
  wrongCases.slice(0,3).forEach((x,i)=>opts.push({value:`wrong-${i}`,visual:{type:'fraction-strip',numerator:x.numerator,denom:x.denom},ariaLabel:`${x.denom} eş parçadan ${x.numerator} boyalı`}));
  return shuffled(opts,rng);
}

function genTimes23510(rep,d,rng,concept){
  const c=concept?.skillId==='times23510'?concept:createConceptInstance('times23510',d,rng), x=c.anchor;
  if(rep==='build'){
    const seq=[x.factor,x.factor*2,x.factor*3];
    const other=[2,3,4,5,10].filter(n=>n!==x.factor);
    const candidates=shuffled([x.factor,...other.slice(0,2)],rng);
    return qTask('times23510',rep,`${x.factor}’er ritmik saymayı doğru adımla sürdür.`,x.factor,{kind:'manipulative',interaction:'pattern-step',expectedValue:String(x.factor),checkLabel:'Adımı kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'Çarpım tablosunun sabit adımını kur',visual:{type:'pattern-step-interactive',seq,candidates},hint:`${x.factor} tablosunda her yeni sayı öncekinin ${x.factor} fazlasıdır.`,explain:`${seq.join(', ')} dizisi her adımda ${x.factor} artar; bu ${x.factor} çarpım tablosunun örüntüsüdür.`
    });
  }
  if(rep==='see'){
    const correct=[1,2,3,4].map(k=>k*x.factor);
    const alt=choice([2,3,4,5,10].filter(n=>n!==x.factor),rng);
    const wrongA=[1,2,3,4].map(k=>k*alt);
    const wrongB=[x.factor,x.factor*2,x.factor*3,x.factor*4+1];
    const options=shuffled([
      {value:'correct',visual:{type:'sequence',items:correct},ariaLabel:`${x.factor} tablosunun katları`},
      {value:'wrong-table',visual:{type:'sequence',items:wrongA},ariaLabel:'başka tablonun katları'},
      {value:'wrong-step',visual:{type:'sequence',items:wrongB},ariaLabel:'son adımı bozuk dizi'}
    ],rng);
    return qTask('times23510',rep,`Hangi dizi ${x.factor} çarpım tablosunun örüntüsünü doğru gösteriyor?`,'correct',{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',taskLabel:'Tablo örüntüsünü görselde ayırt et',visual:{type:'equation',text:`${x.factor}, ${x.factor*2}, ${x.factor*3}, …`},hint:`Her adımda ${x.factor} eklenmeli.`,explain:`${correct.join(', ')} sayıları ${x.factor}'in ardışık katlarıdır.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('times23510',rep,`${y.factor} × ${y.multiplier} = □`,y.total,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Çarpımı kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Tablo bilgisini çarpma cümlesiyle yaz',visual:{type:'equation',text:`${y.factor} × ${y.multiplier}`},hint:`${y.factor}'er ${y.multiplier} kez ilerlemeyi düşün.`,explain:`${y.factor} × ${y.multiplier} = ${y.total}.`
    });
  }
  if(rep==='explain'){
    const answer=`${x.factor} × ${x.multiplier}’dan bir sonraki çarpıma geçerken bir ${x.factor} daha eklenir`;
    return qBase('times23510',rep,`${x.factor} çarpım tablosunda ardışık sonuçlar neden ${x.factor} artar?`,answer,semanticChoices(answer,['Çarpma işareti sayıyı rastgele büyüttüğü için','Her sonuç bir öncekinin iki katı olduğu için','Tablolarda sayıların sırası önemli olmadığı için'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Çarpım tablosu örüntüsünü gerekçelendir',visual:{type:'sequence',items:[x.factor,x.factor*2,x.factor*3,x.factor*4]},hint:'Her yeni adımda bir eş grup daha eklendiğini düşün.',explain:`Bir grup daha eklemek ${x.factor} tane daha eklemek demektir.`
    });
  }
  const y=c.transfer;
  return qTask('times23510',rep,`${y.multiplier} kutunun her birinde ${y.factor} kalem var. Toplam kaç kalem var?`,y.total,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Çarpım tablosunu günlük probleme taşı',visual:{type:'equation',text:`${y.multiplier} eşit grup · her grupta ${y.factor}`},hint:`${y.factor} sayısını ${y.multiplier} kez düşün.`,explain:`${y.multiplier} × ${y.factor} = ${y.total}.`
  });
}

function genDivisionTables2(rep,d,rng,concept){
  const c=concept?.skillId==='divisionTables2'?concept:createConceptInstance('divisionTables2',d,rng), x=c.anchor;
  const equation=z=>`${z.total} ÷ ${z.divisor} = ${z.quotient}`;
  if(rep==='build'){
    if(x.mode==='sharing') return qTask('divisionTables2',rep,`${x.total} taşı ${x.groups} kişiye eşit paylaştır.`,x.each,{kind:'manipulative',interaction:'share-equally',expectedValue:String(x.each),checkLabel:'Paylaşımı kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'Bölmeyi eşit paylaşma olarak kur',visual:{type:'share-equally-interactive',total:x.total,groups:x.groups},hint:'Her turda herkese birer taş ver ve bütün taşları kullan.',explain:`${x.total} nesne ${x.groups} eşit paya ayrıldığında her payda ${x.each} nesne olur.`
    });
    return qTask('divisionTables2',rep,`${x.total} taşı her grupta ${x.each} taş olacak biçimde eşit gruplara yerleştir.`,x.total,{kind:'manipulative',interaction:'equal-groups',expectedValue:String(x.total),checkLabel:'Grupları kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'Bölmeyi eşit gruplama olarak kur',visual:{type:'equal-groups-interactive',groups:x.groups,each:x.each},hint:`Her grupta ${x.each} taş olmalı ve bütün taşlar kullanılmalı.`,explain:`${x.total} nesnenin içinde ${x.groups} tane ${x.each}'li eşit grup vardır.`
    });
  }
  if(rep==='see'){
    const good={value:'correct',visual:{type:'share-model',groups:x.groups,each:x.each},ariaLabel:`${x.groups} eşit grupta ${x.each} nesne`};
    const wrong1={value:'wrong-each',visual:{type:'share-model',groups:x.groups,each:Math.max(1,x.each-1)},ariaLabel:'grup büyüklüğü yanlış model'};
    const wrong2={value:'wrong-groups',visual:{type:'share-model',groups:Math.max(1,x.groups-1),each:x.each},ariaLabel:'grup sayısı yanlış model'};
    const prompt=x.mode==='sharing'?`${x.total} nesneyi ${x.groups} eşit paya ayıran model hangisi?`:`${x.total} nesneyi ${x.each}'erli eşit gruplara ayıran model hangisi?`;
    return qTask('divisionTables2',rep,prompt,'correct',{kind:'visual-choice',options:shuffled([good,wrong1,wrong2],rng)},{
      taskKind:'visual-discrimination',taskLabel:'Bölme modelini gör ve ÷ gösterimiyle bağla',teachingNote:`Bu eşit ayırma işlemi matematikte ${equation(x)} diye yazılır. “÷” işareti bölmeyi gösterir.`,visual:{type:'share-model',groups:x.groups,each:x.each},hint:'Bütün nesneler kullanılmalı ve gruplar eşit olmalı.',explain:`Model ${equation(x)} ilişkisini gösterir.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('divisionTables2',rep,`${y.total} ÷ ${y.divisor} = □`,y.quotient,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Bölmeyi kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Eşit ayırmayı ÷ ile yaz ve çöz',visual:{type:'equation',text:`${y.total} ÷ ${y.divisor}`},hint:`${y.divisor} × hangi sayı ${y.total} eder?`,explain:`${equation(y)}.`
    });
  }
  if(rep==='explain'){
    const answer=`${x.divisor} × ${x.quotient} = ${x.total} olduğu için ${equation(x)}`;
    return qBase('divisionTables2',rep,`${equation(x)} sonucunu hangi düşünce doğrular?`,answer,semanticChoices(answer,['Bölmede grupların eşit olması gerekmediği için','Bölme her zaman toplamı büyüttüğü için','Yalnız ÷ işaretinin şekline bakıldığı için'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Bölme sonucunu çarpma bilgisiyle doğrula',visual:{type:'share-model',groups:x.groups,each:x.each},hint:'Aynı eşit grup yapısını çarpma yönünden düşün.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  const prompt=y.mode==='sharing'?`${y.total} çıkartma ${y.groups} çocuğa eşit paylaştırılıyor. Her çocuk kaç çıkartma alır?`:`${y.total} boncuk ${y.each}'erli paketlere konuyor. Kaç paket gerekir?`;
  return qTask('divisionTables2',rep,prompt,y.quotient,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Bölmeyi günlük paylaşma/gruplama problemine taşı',visual:{type:'equation',text:y.mode==='sharing'?`${y.total} nesne → ${y.groups} eşit pay`:`${y.total} nesne → ${y.each}'erli gruplar`},hint:y.mode==='sharing'?'Bütünü eşit paylara ayır.':'Bütünün içinde kaç eşit grup olduğunu bul.',explain:`${equation(y)}.`
  });
}

function multDivFamilyText(z){ return `${z.factor} × ${z.multiplier} = ${z.total} · ${z.multiplier} × ${z.factor} = ${z.total} · ${z.total} ÷ ${z.factor} = ${z.multiplier} · ${z.total} ÷ ${z.multiplier} = ${z.factor}`; }
function genMultDivFamilies2(rep,d,rng,concept){
  const c=concept?.skillId==='multDivFamilies2'?concept:createConceptInstance('multDivFamilies2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('multDivFamilies2',rep,`${x.multiplier} eşit grup kur; her grupta ${x.factor} taş olsun. Bu yapı daha sonra hem çarpma hem bölme cümlelerini açıklayacak.`,x.total,{kind:'manipulative',interaction:'equal-groups',expectedValue:String(x.total),checkLabel:'Yapıyı kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'İşlem ailesinin ortak eş-grup modelini kur',visual:{type:'equal-groups-interactive',groups:x.multiplier,each:x.factor},hint:`${x.multiplier} grubun her birinde ${x.factor} taş olmalı.`,explain:`Bu tek modelde ${x.factor}, ${x.multiplier} ve ${x.total} sayıları birlikte yer alır.`
  });
  if(rep==='see'){
    const correct=multDivFamilyText(x);
    const wrong1=`${x.factor} × ${x.multiplier} = ${x.total} · ${x.total} ÷ ${x.factor} = ${x.multiplier+1}`;
    const wrong2=`${x.factor} + ${x.multiplier} = ${x.total} · ${x.total} − ${x.factor} = ${x.multiplier}`;
    const options=shuffled([
      {value:'correct',visual:{type:'equation',text:correct},ariaLabel:'doğru çarpma bölme işlem ailesi'},
      {value:'wrong-quotient',visual:{type:'equation',text:wrong1},ariaLabel:'bölme sonucu yanlış aile'},
      {value:'wrong-ops',visual:{type:'equation',text:wrong2},ariaLabel:'toplama çıkarma ile karışmış aile'}
    ],rng);
    return qTask('multDivFamilies2',rep,'Aynı üç sayıdan oluşan doğru çarpma–bölme işlem ailesi hangisi?','correct',{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',taskLabel:'Dört temel işlemi aynı eş-grup yapısında gör',visual:{type:'share-model',groups:x.multiplier,each:x.factor},hint:'İki çarpma cümlesi aynı bütünü kurmalı; iki bölme cümlesi bu bütünü ters yönden ayırmalı.',explain:correct
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, answer=`${y.total} ÷ ${y.multiplier} = ${y.factor}`;
    const distractors=[`${y.total} ÷ ${y.factor} = ${y.factor}`,`${y.multiplier} ÷ ${y.total} = ${y.factor}`,`${y.total} − ${y.multiplier} = ${y.factor}`];
    return qBase('multDivFamilies2',rep,`${y.factor} × ${y.multiplier} = ${y.total}, ${y.multiplier} × ${y.factor} = ${y.total} ve ${y.total} ÷ ${y.factor} = ${y.multiplier}. Ailenin eksik cümlesi hangisi?`,answer,semanticChoices(answer,distractors,rng),{
      taskKind:'symbol-entry',taskLabel:'İşlem ailesindeki eksik bölme cümlesini tamamla',visual:{type:'equation',text:`${y.factor}, ${y.multiplier}, ${y.total}`},hint:'Bütünü grup sayısına bölersen her gruptaki miktarı bulursun.',explain:`Eksik cümle ${answer}.`
    });
  }
  if(rep==='explain'){
    const answer='Çarpma eşit gruplardan bütünü kurar; bölme aynı bütünü eşit gruplara ters yönden ayırır';
    return qBase('multDivFamilies2',rep,'Çarpma ve bölme neden aynı işlem ailesinde yer alabilir?',answer,semanticChoices(answer,['İki işlem de her zaman sayıyı büyütür','× ve ÷ işaretleri birbirine benzediği için','Bölmede eşit grup düşüncesi gerekmediği için'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Çarpma–bölme ters ilişkisini açıkla',visual:{type:'equation',text:multDivFamilyText(x)},hint:'Aynı grup modeline bir kez bütünü kurma, bir kez bütünü ayırma yönünden bak.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  return qTask('multDivFamilies2',rep,`${y.multiplier} kutuda ${y.factor}’er boya kalemi var; toplam ${y.total}. ${y.total} kalemi yine ${y.multiplier} kutuya eşit dağıtırsan her kutuda kaç kalem olur?`,y.factor,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Ters ilişkiyi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Çarpma–bölme ters ilişkisini yeni bağlama taşı',visual:{type:'equation',text:`${y.multiplier} × ${y.factor} = ${y.total} → ${y.total} ÷ ${y.multiplier} = ?`},hint:'İlk cümledeki eşit grup yapısını ters yönden oku.',explain:`${y.total} ÷ ${y.multiplier} = ${y.factor}.`
  });
}


function genLengthMetre2(rep,d,rng,concept){
  const c=concept?.skillId==='lengthMetre2'?concept:createConceptInstance('lengthMetre2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('lengthMetre2',rep,`${x.m} metre uzunluğu 1 metrelik parçalarla kur.`,x.m,{kind:'manipulative',interaction:'measure-make',expectedValue:String(x.m),unit:'m',checkLabel:'Uzunluğu kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Metreyi standart birimlerle kur',visual:{type:'measure-compose-interactive',target:x.m,unit:'m',denoms:[1]},hint:`Her parça 1 m. Toplam ${x.m} m olana kadar seç.`,explain:`${x.m} tane 1 metrelik parça toplam ${x.m} m eder.`
  });
  if(rep==='see'){
    const vals=[x.m,Math.max(1,x.m-1),x.m+1];
    const options=shuffled(vals.map((v,i)=>({value:i===0?'correct':`wrong-${i}`,visual:{type:'measure-amount',kind:'length',amount:v,unit:'m',denoms:[1],showLabel:false},ariaLabel:`${v} adet bir metrelik parça`})),rng);
    return qTask('lengthMetre2',rep,`Hangi model ${x.m} m uzunluğu gösteriyor?`,'correct',{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',taskLabel:'Metre modelini görselde ayırt et',visual:{type:'unit-context-card',object:'uzun bir koridor',unit:'m'},hint:'Her küçük çubuk 1 metreyi temsil ediyor.',explain:`Doğru modelde ${x.m} tane 1 m birimi var.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('lengthMetre2',rep,'1 metrelik parçaları say. Toplam uzunluk kaç metredir?',y.m,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Ölçümü kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Metre modelini sayısal ölçüme çevir',visual:{type:'measure-amount',kind:'length',amount:y.m,unit:'m',denoms:[1],showLabel:false},hint:'Her parça 1 m; parçaları say.',explain:`Toplam uzunluk ${y.m} m.`
    });
  }
  if(rep==='explain'){
    const answer='Koridor gibi uzun bir nesne için metre daha uygun bir birimdir';
    return qBase('lengthMetre2',rep,'Bir sınıf koridorunun uzunluğunu neden metreyle ölçmek uygundur?',answer,semanticChoices(answer,['Metre yalnız küçük nesnelerde kullanılır','Uzunluk birimi seçmek önemli değildir','Metre bir kütle birimidir'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Uygun uzunluk birimini gerekçelendir',visual:{type:'unit-context-card',object:'sınıf koridoru',unit:'m'},hint:'Nesnenin büyüklüğüne uygun standart birim seç.',explain:answer+'.'
    });
  }
  const y=c.transfer, other=Math.max(1,y.m-2), answer=`${y.m} m`;
  return qBase('lengthMetre2',rep,`Bir ip ${y.m} m, başka bir ip ${other} m. Hangisi daha uzundur?`,answer,semanticChoices(answer,[`${other} m`,'İkisi eşit','Metreyle karşılaştırılamaz'],rng),{
    taskKind:'context-transfer',taskLabel:'Metre ölçüsünü karşılaştırma bağlamına taşı',visual:{type:'measure-compare',kind:'length',left:y.m,right:other,unit:'m'},hint:'Birimler aynıysa sayısal değerleri karşılaştır.',explain:`${y.m} > ${other}; ${y.m} m olan ip daha uzundur.`
  });
}

function genMassMetric2(rep,d,rng,concept){
  const c=concept?.skillId==='massMetric2'?concept:createConceptInstance('massMetric2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('massMetric2',rep,`${x.amount} ${x.unit} kütleyi standart ağırlık parçalarıyla oluştur.`,x.amount,{kind:'manipulative',interaction:'measure-make',expectedValue:String(x.amount),unit:x.unit,checkLabel:'Kütleyi kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Kütleyi standart birim parçalarıyla kur',visual:{type:'measure-compose-interactive',target:x.amount,unit:x.unit,denoms:measurementDenoms(x.unit)},hint:`Seçtiğin parçaların toplamı ${x.amount} ${x.unit} olmalı.`,explain:`Parçaların toplam kütlesi ${x.amount} ${x.unit}.`
  });
  if(rep==='see'){
    const answer=x.unit, options=shuffled(['g','kg','m','L'].map((unit,i)=>({value:unit===answer?'correct':`wrong-${i}`,visual:{type:'unit-context-card',object:x.object,unit},ariaLabel:`${x.object} için ${unit} birimi`})),rng);
    return qTask('massMetric2',rep,`${x.object} gibi bir nesnenin kütlesini yazmak için hangi birim daha uygundur?`,'correct',{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',taskLabel:'Kütle için uygun birimi ayırt et',visual:{type:'mass-foundation',left:1,right:3},hint:'Kütle için gram (g) veya kilogram (kg) kullanılır; nesnenin büyüklüğünü düşün.',explain:`Bu örnek için ${answer} uygun birimdir.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('massMetric2',rep,`Ağırlık parçalarının toplamı kaç ${y.unit}?`,y.amount,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Kütleyi kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Kütle modelini sayı ve birimle ifade et',visual:{type:'measure-amount',kind:'mass',amount:y.amount,unit:y.unit,denoms:measurementDenoms(y.unit),showLabel:false},hint:'Parçaların üzerindeki aynı birimli değerleri topla.',explain:`Toplam ${y.amount} ${y.unit}.`
    });
  }
  if(rep==='explain'){
    const delta=x.unit==='g'?50:1, bigger=x.amount+delta;
    const answer=`${bigger} ${x.unit} daha büyüktür çünkü iki ölçüm de aynı birimdedir`;
    return qBase('massMetric2',rep,`${x.amount} ${x.unit} ile ${bigger} ${x.unit} kütleyi nasıl karşılaştırırsın?`,answer,semanticChoices(answer,[`${x.amount} ${x.unit} daha büyüktür çünkü ilk yazılmıştır`,'Birimler aynı olsa da karşılaştırılamaz','Kütlede sayısal değer önemli değildir'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Aynı birimli kütleleri gerekçeli karşılaştır',visual:{type:'measure-compare',kind:'mass',left:x.amount,right:bigger,unit:x.unit},hint:'Aynı birimde oldukları için sayılara bakabilirsin.',explain:answer+'.'
    });
  }
  const y=c.transfer, delta=y.unit==='g'?100:1, values=[y.amount,y.amount+delta,y.amount+2*delta], answer=values.map(v=>`${v} ${y.unit}`).join(' < ');
  return qBase('massMetric2',rep,'Üç paketi en hafiften en ağıra sırala.',answer,semanticChoices(answer,[values.slice().reverse().map(v=>`${v} ${y.unit}`).join(' < '),`${values[1]} ${y.unit} < ${values[0]} ${y.unit} < ${values[2]} ${y.unit}`,'Birimler aynı olsa da sıralanamaz'],rng),{
    taskKind:'context-transfer',taskLabel:'Kütleyi sıralama bağlamına taşı',visual:{type:'measure-triple',kind:'mass',values,unit:y.unit},hint:'Birimler aynı; küçük sayı daha hafiftir.',explain:`Doğru sıra ${answer}.`
  });
}

function genVolumeLitre2(rep,d,rng,concept){
  const c=concept?.skillId==='volumeLitre2'?concept:createConceptInstance('volumeLitre2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('volumeLitre2',rep,`${x.litres} L sıvı hacmini 1 litrelik kaplarla oluştur.`,x.litres,{kind:'manipulative',interaction:'measure-make',expectedValue:String(x.litres),unit:'L',checkLabel:'Hacmi kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Litreyi standart kaplarla kur',visual:{type:'measure-compose-interactive',target:x.litres,unit:'L',denoms:[1]},hint:`Her kap 1 L; toplam ${x.litres} L olmalı.`,explain:`${x.litres} tane 1 L kap toplam ${x.litres} L sıvı hacmini gösterir.`
  });
  if(rep==='see'){
    const options=shuffled(['L','kg','g','m'].map((unit,i)=>({value:unit==='L'?'correct':`wrong-${i}`,visual:{type:'unit-context-card',object:'sürahideki sıvı',unit},ariaLabel:`sıvı için ${unit} birimi`})),rng);
    return qTask('volumeLitre2',rep,'Bir sürahideki sıvı miktarını yazmak için hangi birim uygundur?','correct',{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',taskLabel:'Sıvı hacmi için litreyi ayırt et',visual:{type:'volume-foundation',left:2,right:4},hint:'Bu sınıf düzeyinde sıvı hacmini litre (L) ile ölçüyoruz.',explain:'Sıvı hacmi için uygun birim litredir (L).'
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('volumeLitre2',rep,'1 litrelik kapları say. Toplam sıvı hacmi kaç litredir?',y.litres,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Hacmi kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Litre modelini sayı ile ifade et',visual:{type:'measure-amount',kind:'volume',amount:y.litres,unit:'L',denoms:[1],showLabel:false},hint:'Her kap 1 L.',explain:`Toplam ${y.litres} L.`
    });
  }
  if(rep==='explain'){
    const other=x.litres+2, answer=`${other} L daha fazladır çünkü iki hacim de litre cinsindedir`;
    return qBase('volumeLitre2',rep,`${x.litres} L ile ${other} L sıvıyı nasıl karşılaştırırsın?`,answer,semanticChoices(answer,[`${x.litres} L daha fazladır`,'Litre değerleri karşılaştırılamaz','Kabın şekli büyük görünüyorsa sayı önemli değildir'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Litre ölçülerini gerekçeli karşılaştır',visual:{type:'measure-compare',kind:'volume',left:x.litres,right:other,unit:'L'},hint:'Aynı birimdeki sayıları karşılaştır.',explain:answer+'.'
    });
  }
  const y=c.transfer, other=Math.max(0,y.litres-1), answer=`${y.litres} L`;
  return qBase('volumeLitre2',rep,`Bir sulama kabında ${y.litres} L, diğerinde ${other} L su var. Hangisinde daha çok su vardır?`,answer,semanticChoices(answer,[`${other} L`,'İkisinde eşit','Litreyle karar verilemez'],rng),{
    taskKind:'context-transfer',taskLabel:'Litreyi günlük karşılaştırmaya taşı',visual:{type:'volume-compare',left:y.litres,right:other},hint:'İki ölçüm de litre cinsinde.',explain:`${y.litres} > ${other}; ${y.litres} L olan kapta daha çok sıvı vardır.`
  });
}

function genTimeMinute2(rep,d,rng,concept){
  const c=concept?.skillId==='timeMinute2'?concept:createConceptInstance('timeMinute2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('timeMinute2',rep,`Saati ${x.label} olacak biçimde ayarla.`,`${x.hour}|${x.minute}`,{kind:'manipulative',interaction:'clock-minute-set',expectedValue:`${x.hour}|${x.minute}`,checkLabel:'Saati kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Analog saati dakikaya kadar ayarla',visual:{type:'clock-minute-set-interactive',targetHour:x.hour,targetMinute:x.minute},hint:'Önce saati seç; sonra dakikayı 1 ve 5 dakikalık adımlarla ayarla.',explain:`Ayarlanan zaman ${x.label}.`
  });
  if(rep==='see'){
    const mk=(hour,minute,value)=>({value,visual:{type:'clock',hour,minute},ariaLabel:`${hour}:${String(minute).padStart(2,'0')} analog saat`});
    const options=shuffled([mk(x.hour,x.minute,'correct'),mk(x.hour,(x.minute+5)%60,'wrong-5'),mk(x.hour,(x.minute+1)%60,'wrong-1')],rng);
    return qTask('timeMinute2',rep,`${x.label} zamanını gösteren analog saat hangisi?`,'correct',{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',taskLabel:'Dakika çizgilerini analog saatte ayırt et',teachingNote:'Yelkovanın tam turu 60 dakikadır. Saat çevresindeki küçük dakika çizgileri 1 dakikalık ilerlemeyi gösterir.',visual:{type:'time-label',label:x.label},hint:'Yelkovanın küçük dakika çizgilerine dikkat et.',explain:`Doğru saat ${x.label} zamanını gösterir.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, distractors=timeMinute2Cases().filter(z=>z.label!==y.label).slice(0,3).map(z=>z.label);
    return qBase('timeMinute2',rep,'Analog saatin sayısal yazımı hangisidir?',y.label,semanticChoices(y.label,distractors,rng),{
      taskKind:'symbol-entry',taskLabel:'Analog saati saat:dakika biçiminde yaz',visual:{type:'clock',hour:y.hour,minute:y.minute},hint:'Akrepten saati, yelkovandan dakikayı oku.',explain:`Saat ${y.label}.`
    });
  }
  if(rep==='explain'){
    const answer='Dakikalar ilerledikçe akrep de bir sonraki saate doğru yavaşça ilerler';
    return qBase('timeMinute2',rep,`${x.label} zamanında akrep neden iki saat sayısı arasında olabilir?`,answer,semanticChoices(answer,['Akrep yalnız tam saatlerde görünür','Yelkovan akrebi rastgele iter','Dakikalar akrebin konumunu hiç etkilemez'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Analog saat kollarının ilişkisini açıkla',visual:{type:'clock',hour:x.hour,minute:x.minute},hint:'Bir saat boyunca akrep sabit kalmaz.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  return qBase('timeMinute2',rep,`Günlük programda etkinlik bu analog saatte başlıyor. Başlangıç zamanı hangisidir?`,y.label,semanticChoices(y.label,[`${y.hour}:${String((y.minute+1)%60).padStart(2,'0')}`,`${y.hour}:${String((y.minute+5)%60).padStart(2,'0')}`,`${(y.hour%12)+1}:${String(y.minute).padStart(2,'0')}`],rng),{
    taskKind:'context-transfer',taskLabel:'Dakikaya kadar saati günlük programa taşı',visual:{type:'clock',hour:y.hour,minute:y.minute},hint:'Saat ve dakika kollarını ayrı ayrı oku.',explain:`Etkinlik ${y.label} zamanında başlar.`
  });
}

function durationLabel(hours,minutes){ return `${hours} sa ${minutes} dk`; }
function genTimeDuration2(rep,d,rng,concept){
  const c=concept?.skillId==='timeDuration2'?concept:createConceptInstance('timeDuration2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('timeDuration2',rep,`${durationLabel(x.hours,x.minutes)} süreyi zaman parçalarıyla oluştur.`,x.totalMinutes,{kind:'manipulative',interaction:'duration-compose',expectedValue:String(x.totalMinutes),checkLabel:'Süreyi kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Saat ve dakikayı aynı süre modelinde kur',visual:{type:'duration-compose-interactive',target:x.totalMinutes},hint:'1 saatlik parça 60 dakika eder; kalan dakikaları ekle.',explain:`${durationLabel(x.hours,x.minutes)} toplam ${x.totalMinutes} dakikadır.`
  });
  if(rep==='see'){
    const options=shuffled([
      {value:'correct',visual:{type:'duration-card',hours:x.hours,minutes:x.minutes,total:x.totalMinutes},ariaLabel:`${durationLabel(x.hours,x.minutes)} eşittir ${x.totalMinutes} dakika`},
      {value:'wrong-60',visual:{type:'duration-card',hours:x.hours,minutes:x.minutes,total:x.totalMinutes-60},ariaLabel:'bir saat eksik dönüşüm'},
      {value:'wrong-min',visual:{type:'duration-card',hours:x.hours,minutes:x.minutes,total:x.totalMinutes+10},ariaLabel:'dakika toplamı yanlış dönüşüm'}
    ],rng);
    return qTask('timeDuration2',rep,'Hangi kart aynı süreyi iki farklı biçimde doğru gösteriyor?','correct',{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',taskLabel:'Saat+dakika ile toplam dakikayı eşleştir',teachingNote:'1 saat = 60 dakikadır. Saatleri önce 60’ar dakikaya çevirip kalan dakikaları ekleyebilirsin.',visual:{type:'duration-card',hours:1,minutes:0,total:60},hint:'Her saat için 60 dakika say.',explain:`${durationLabel(x.hours,x.minutes)} = ${x.totalMinutes} dk.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('timeDuration2',rep,`${durationLabel(y.hours,y.minutes)} toplam kaç dakikadır?`,y.totalMinutes,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Dönüşümü kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Saat ve dakikayı yalnız dakikaya çevir',visual:{type:'duration-card',hours:y.hours,minutes:y.minutes},hint:`${y.hours} saat = ${y.hours*60} dakika; sonra ${y.minutes} dakikayı ekle.`,explain:`${y.hours*60} + ${y.minutes} = ${y.totalMinutes} dakika.`
    });
  }
  if(rep==='explain'){
    const answer=`${x.hours} saat ${x.hours*60} dakika ettiği için kalan ${x.minutes} dakika buna eklenir`;
    return qBase('timeDuration2',rep,`${durationLabel(x.hours,x.minutes)} neden ${x.totalMinutes} dakikadır?`,answer,semanticChoices(answer,['Bir saat 100 dakika olduğu için','Saat ve dakika sayıları yan yana yazıldığı için','Dakikaları toplamak yerine yalnız saat sayılır'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Süre dönüşümünü gerekçelendir',visual:{type:'duration-card',hours:x.hours,minutes:x.minutes,total:x.totalMinutes},hint:'1 saat = 60 dakika bilgisini kullan.',explain:answer+'.'
    });
  }
  const y=c.transfer, answer=durationLabel(y.hours,y.minutes);
  return qBase('timeDuration2',rep,`Bir etkinlik ${y.totalMinutes} dakika sürüyor. Bu süre saat ve dakika olarak hangisidir?`,answer,semanticChoices(answer,[durationLabel(Math.max(0,y.hours-1),y.minutes),durationLabel(y.hours,Math.min(59,y.minutes+10)),`${y.totalMinutes} sa 0 dk`],rng),{
    taskKind:'context-transfer',taskLabel:'Dakikayı saat+dakika biçimine geri taşı',visual:{type:'duration-card',total:y.totalMinutes},hint:'60 dakikalık grupları saat olarak ayır; kalanı dakika bırak.',explain:`${y.totalMinutes} dk = ${answer}.`
  });
}

function moneyDecimalLabel(cents){ return `${Math.floor(cents/100)},${String(cents%100).padStart(2,'0')} TL`; }
function genMoneyP2(rep,d,rng,concept){
  const c=concept?.skillId==='moneyP2'?concept:createConceptInstance('moneyP2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('moneyP2',rep,`${x.cents} kuruş değerini oyun paralarıyla oluştur.`,x.cents,{kind:'manipulative',interaction:'money-make',expectedValue:String(x.cents),unit:'kr',checkLabel:'Parayı kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Kuruş miktarını para parçalarıyla kur',visual:{type:'money-make-interactive',target:x.cents,denoms:[100,50,25,10,5],unit:'kr'},hint:'Seçtiğin para parçalarının kuruş değerlerini topla.',explain:`Seçilen paraların toplamı ${x.cents} kuruş.`
  });
  if(rep==='see'){
    const wrongA=moneyDecimalLabel(x.cents+10), wrongB=moneyDecimalLabel(Math.max(0,x.cents-5));
    const options=shuffled([
      {value:'correct',visual:{type:'money-decimal-card',cents:x.cents,label:x.decimal},ariaLabel:`${x.cents} kuruş eşittir ${x.decimal}`},
      {value:'wrong-a',visual:{type:'money-decimal-card',cents:x.cents,label:wrongA},ariaLabel:'ondalık para etiketi yanlış'},
      {value:'wrong-b',visual:{type:'money-decimal-card',cents:x.cents,label:wrongB},ariaLabel:'ondalık para etiketi yanlış'}
    ],rng);
    return qTask('moneyP2',rep,`${x.cents} kuruşu doğru TL ondalık gösterimiyle eşleştiren kart hangisi?`,'correct',{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',taskLabel:'Kuruş ile ondalık TL gösterimini eşleştir',teachingNote:'100 kuruş = 1,00 TL. Virgülün solu lirayı, iki basamaklı sağı kuruşu gösterir.',visual:{type:'money-decimal-card',cents:100,label:'1,00 TL'},hint:'Her 100 kuruş 1 liradır; kalan kuruş iki basamakla yazılır.',explain:`${x.cents} kuruş = ${x.decimal}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('moneyP2',rep,`${y.decimal} kaç kuruştur?`,y.cents,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Dönüşümü kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Ondalık TL gösterimini yalnız kuruşa çevir',visual:{type:'money-decimal-card',cents:null,label:y.decimal},hint:'Her 1 TL = 100 kuruş; virgülden sonraki iki basamak kuruştur.',explain:`${y.decimal} = ${y.cents} kuruş.`
    });
  }
  if(rep==='explain'){
    const vals=[x.cents,x.cents+25,x.cents+50], labels=vals.map(moneyDecimalLabel), answer=labels[2];
    return qBase('moneyP2',rep,`${labels.join(', ')} miktarlarından hangisi en büyüktür ve neden?`,answer,semanticChoices(answer,[labels[0],labels[1],'Virgüllü para miktarları karşılaştırılamaz'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Ondalık para miktarlarını karşılaştır',visual:{type:'money-compare-decimal',values:labels},hint:'Önce lira kısmını, eşitse kuruş kısmını karşılaştır.',explain:`En büyük miktar ${answer}.`
    });
  }
  const y=c.transfer, answer=y.decimal;
  return qBase('moneyP2',rep,`Bir ürünün etiketi ${y.cents} kuruş. Aynı fiyat TL ile nasıl yazılır?`,answer,semanticChoices(answer,[moneyDecimalLabel(y.cents+10),moneyDecimalLabel(Math.max(0,y.cents-10)),`${y.cents},00 TL`],rng),{
    taskKind:'context-transfer',taskLabel:'Kuruş fiyatını ondalık TL etiketine taşı',visual:{type:'price-tag',price:y.cents,unit:'kr'},hint:'100 kuruşu 1 TL olarak ayır; kalan kuruşu virgülden sonra iki basamakla yaz.',explain:`${y.cents} kuruş = ${answer}.`
  });
}


function patternOptionPool(x,rng=Math.random){
  const all=p2ShapePatternCases(), pool=[x.next];
  for(const z of shuffled(all,rng)){ if(!pool.includes(z.next)) pool.push(z.next); if(pool.length>=4)break; }
  return pool;
}
function genShapePatterns2(rep,d,rng,concept){
  const c=concept?.skillId==='shapePatterns2'?concept:createConceptInstance('shapePatterns2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('shapePatterns2',rep,'Örüntüyü incele ve sıradaki şekli seçerek devam ettir.',x.next,{kind:'manipulative',interaction:'p2-shape-pattern',expectedValue:x.next,checkLabel:'Örüntüyü kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Bir veya iki özelliği izleyerek örüntüyü kur',visual:{type:'p2-shape-pattern-builder',items:x.items,options:patternOptionPool(x,rng)},hint:'Şekil, boyut, renk ve yön özelliklerinden hangilerinin düzenli değiştiğini izle.',explain:`Kural: ${x.rule}.`
  });
  if(rep==='see'){
    const wrong=shuffled(p2ShapePatternCases().filter(z=>z.next!==x.next),rng).slice(0,2);
    const opts=shuffled([x,...wrong].map((z,i)=>({value:z===x?'correct':`wrong-${i}`,visual:{type:'p2-shape-pattern',items:[...x.items,z.next]},ariaLabel:'tamamlanmış şekil örüntüsü'})),rng);
    return qTask('shapePatterns2',rep,'Örüntüyü aynı kuralla doğru tamamlayan seçenek hangisi?','correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Örüntü kuralını tamamlanmış dizide ayırt et',visual:{type:'p2-shape-pattern',items:[...x.items,'?']},hint:'Her adımda hangi özelliklerin tekrar ettiğini karşılaştır.',explain:`Doğru tamamlamada ${x.rule.toLowerCase()}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, choices=['ABAB','ABCABC','AABB','ABBA'];
    return qBase('shapePatterns2',rep,'Bu örüntünün tekrar yapısını harflerle nasıl gösterebiliriz?',y.code,semanticChoices(y.code,choices.filter(z=>z!==y.code),rng),{
      taskKind:'symbol-entry',taskLabel:'Şekil örüntüsünü kısa bir tekrar koduyla göster',visual:{type:'p2-shape-pattern',items:y.items},hint:'Aynı özellik birleşimine aynı harfi ver; tekrar eden sırayı izle.',explain:`Örüntünün tekrar kodu ${y.code}.`
    });
  }
  if(rep==='explain'){
    const answer=x.rule;
    return qBase('shapePatterns2',rep,'Örüntünün kuralını en iyi hangi açıklama anlatır?',answer,semanticChoices(answer,['Şekiller rastgele geliyor','Yalnız dizideki parça sayısı önemlidir','Her adımda bütün özellikler aynı kalır'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Bir veya iki özellikli örüntüyü gerekçelendir',visual:{type:'p2-shape-pattern',items:[...x.items,x.next]},hint:'Boyut, şekil, renk ve yönü tek tek kontrol et.',explain:`${answer}.`
    });
  }
  const y=c.transfer;
  return qBase('shapePatterns2',rep,'Bir sınıf panosundaki süs şeridi aynı kuralla devam ediyor. Sıradaki parça hangisi olmalı?',y.next,semanticChoices(y.next,patternOptionPool(y,rng).filter(z=>z!==y.next),rng),{
    taskKind:'context-transfer',taskLabel:'Şekil örüntüsünü süsleme bağlamına taşı',visual:{type:'p2-tile-border',items:y.items},hint:'Süs şeridinde de aynı özellik sırası tekrar eder.',explain:`Sıradaki parça aynı kuralı sürdürür: ${y.rule}.`
  });
}

function genSolids2(rep,d,rng,concept){
  const c=concept?.skillId==='solids2'?concept:createConceptInstance('solids2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('solids2',rep,`${x.name} cismini yüzey türüne göre doğru gruba yerleştir.`,x.classKey,{kind:'manipulative',interaction:'solid-classify',expectedValue:x.classKey,checkLabel:'Sınıflandırmayı kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'3B cismi yüzeylerine göre sınıflandır',visual:{type:'p2-solid-classify-builder',kind:x.kind,name:x.name},hint:'Düz yüz ve eğri yüzey olup olmadığına bak.',explain:`${x.name}: ${x.property}.`
  });
  if(rep==='see'){
    const others=shuffled(p2SolidCases().filter(z=>z.id!==x.id),rng).slice(0,2);
    const opts=shuffled([x,...others].map((z,i)=>({value:z.id===x.id?'correct':`wrong-${i}`,visual:{type:'p2-solid',kind:z.kind},ariaLabel:z.name})),rng);
    return qTask('solids2',rep,`${x.name} hangisidir?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'3B cismi görünüşünden ayırt et',visual:{type:'p2-solid-property-card',kind:x.kind,property:x.property},hint:'Düz yüzlerin sayısına, eğri yüzeye ve köşelere dikkat et.',explain:`Doğru cisim ${x.name}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, distractors=p2SolidCases().filter(z=>z.id!==y.id).map(z=>z.name);
    return qBase('solids2',rep,'Gösterilen 3B cismin matematiksel adı nedir?',y.name,semanticChoices(y.name,distractors,rng),{
      taskKind:'symbol-entry',taskLabel:'3B cismin matematiksel adını seç',visual:{type:'p2-solid',kind:y.kind},hint:'Cismin düz/eğri yüzeylerini ve köşelerini düşün.',explain:`Bu cisim ${y.name.toLowerCase()}dır.`
    });
  }
  if(rep==='explain'){
    const answer=x.property;
    return qBase('solids2',rep,`${x.name} için hangi açıklama doğrudur?`,answer,semanticChoices(answer,p2SolidCases().filter(z=>z.id!==x.id).map(z=>z.property),rng),{
      taskKind:'reasoning-choice',taskLabel:'3B cismin özelliklerini kullanarak açıkla',visual:{type:'p2-solid',kind:x.kind},hint:'Yüz, kenar, köşe ve eğri yüzey özelliklerini kontrol et.',explain:`${x.name}: ${x.property}. ${x.roll}.`
    });
  }
  const y=c.transfer, distractors=p2SolidCases().filter(z=>z.id!==y.id).map(z=>z.name);
  return qBase('solids2',rep,'Günlük nesnenin temel biçimine en yakın 3B cisim hangisidir?',y.name,semanticChoices(y.name,distractors,rng),{
    taskKind:'context-transfer',taskLabel:'3B cismi günlük nesnede tanı',visual:{type:'p2-solid-scene',kind:y.scene},hint:'Nesnenin ayrıntılarını değil temel geometrik biçimini düşün.',explain:`Bu nesnenin temel biçimi ${y.name.toLowerCase()} modeline yakındır.`
  });
}

function graphRowValue(g,idx){ return g.icons[idx]*g.scale; }
function genPictureGraphScale2(rep,d,rng,concept){
  const c=concept?.skillId==='pictureGraphScale2'?concept:createConceptInstance('pictureGraphScale2',d,rng), x=c.anchor, idx=1;
  if(rep==='build'){
    const target=x.vals[idx], icons=x.icons[idx];
    return qTask('pictureGraphScale2',rep,`Her resim ${x.scale} kişiyi gösteriyor. ${x.cats[idx]} için ${target} kişiyi gösterecek satırı kur.`,icons,{kind:'manipulative',interaction:'scaled-pictograph-row',expectedValue:String(icons),checkLabel:'Grafiği kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'Ölçeği kullanarak resimli grafik satırı kur',visual:{type:'scaled-pictograph-builder',category:x.cats[idx],target,scale:x.scale,maxIcons:6},hint:`Bir resim ${x.scale} kişiyse ${target} kişiyi göstermek için kaç resim gerekir?`,explain:`${icons} resim × ${x.scale} = ${target}.`
    });
  }
  if(rep==='see'){
    const actual=graphRowValue(x,idx), wrong=[actual-x.scale,actual+x.scale,actual+x.scale*2].filter(v=>v>=0);
    const opts=shuffled([actual,...wrong].slice(0,3).map((v,i)=>({value:v===actual?'correct':`wrong-${i}`,visual:{type:'scaled-graph-answer-card',value:v,category:x.cats[idx]},ariaLabel:`${x.cats[idx]} için ${v}`})),rng);
    return qTask('pictureGraphScale2',rep,`${x.cats[idx]} satırındaki ${x.icons[idx]} resim gerçekte kaç kişiyi gösterir?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Grafik ölçeğini kullanarak gerçek değeri gör',visual:{type:'scaled-picture-graph',cats:x.cats,icons:x.icons,scale:x.scale,highlight:idx},hint:`Her resim ${x.scale} kişiyi temsil ediyor.`,explain:`${x.icons[idx]} × ${x.scale} = ${actual}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, j=2, answer=graphRowValue(y,j);
    return qTask('pictureGraphScale2',rep,`Grafiğe göre ${y.cats[j]} kaçtır?`,answer,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Grafiği kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Ölçekli grafikten sayısal değeri yaz',visual:{type:'scaled-picture-graph',cats:y.cats,icons:y.icons,scale:y.scale,highlight:j},hint:`Resim sayısını ölçek olan ${y.scale} ile çarp.`,explain:`${y.icons[j]} resim × ${y.scale} = ${answer}.`
    });
  }
  if(rep==='explain'){
    const answer='Bir resim birden fazla kişiyi temsil ettiği için daha büyük veriyi daha az sembolle gösterebiliriz';
    return qBase('pictureGraphScale2',rep,`Bu grafikte neden “1 resim = ${x.scale} kişi” ölçeği kullanılmış olabilir?`,answer,semanticChoices(answer,['Her resim mutlaka yalnız 1 kişiyi göstermelidir','Ölçek kullanınca kategorilerin adı değişir','Resim sayısı ile gerçek sayı arasında ilişki kalmaz'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Resimli grafikte ölçeğin nedenini açıkla',visual:{type:'scaled-picture-graph',cats:x.cats,icons:x.icons,scale:x.scale},hint:'Veri büyüdükçe her kişi için tek resim çizmek zorlaşır.',explain:answer+'.'
    });
  }
  const y=c.transfer, a=0,b=1, va=graphRowValue(y,a),vb=graphRowValue(y,b), answer=Math.abs(va-vb);
  return qTask('pictureGraphScale2',rep,`${y.cats[a]} ile ${y.cats[b]} arasında kaç fark vardır?`,answer,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Problemi kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Ölçekli grafikten tek adımlı problem çöz',visual:{type:'scaled-picture-graph',cats:y.cats,icons:y.icons,scale:y.scale,highlight:-1},hint:'Önce iki kategorinin gerçek değerlerini ölçekle bul, sonra farkını hesapla.',explain:`${va} ile ${vb} arasındaki fark ${answer}.`
  });
}

function genFractionMeaning2(rep,d,rng,concept){
  const c=concept?.skillId==='fractionMeaning2'?concept:createConceptInstance('fractionMeaning2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('fractionMeaning2',rep,`Bütün ${x.denom} eş parçaya ayrıldı. Bir eş parçayı boya.`,1,{kind:'manipulative',interaction:'fraction-shade',expectedValue:'1',checkLabel:'Modeli kontrol et'},{taskKind:'manipulative-build',taskLabel:'Bir eş parçayı modelle',visual:{type:'fraction-shade-builder',denom:x.denom,target:1},hint:'Bir eş parçayı boyaman yeterli.',explain:`Bütün ${x.denom} eş parçaya ayrıldı ve bunlardan biri seçildi.`});
  if(rep==='see'){
    const wrong=[{numerator:1,denom:Math.max(2,x.denom-1)},{numerator:1,denom:x.denom+1},{numerator:Math.min(2,x.denom-1),denom:x.denom}];
    return qTask('fractionMeaning2',rep,`Hangisi ${x.denom} eş parçadan yalnız birini gösteriyor?`,'correct',{kind:'visual-choice',options:fractionVisualOptions(x,wrong,rng)},{taskKind:'visual-discrimination',taskLabel:'Eş parça modelini ayırt et',visual:{type:'equal-parts-guide',denom:x.denom},hint:'Önce bütünün kaç eş parçaya ayrıldığına bak.',explain:`Doğru model ${x.denom} eş parçaya ayrılmış ve yalnız bir parçası boyalı.`});
  }
  if(rep==='symbol') return qTask('fractionMeaning2',rep,'Bu modelde bütün kaç eş parçaya ayrılmış?',x.denom,{kind:'number-input',placeholder:'?'},{taskKind:'symbol-entry',taskLabel:'Eş parça sayısını sayı ile yaz',visual:{type:'fraction-strip',numerator:1,denom:x.denom},hint:'Boyalı ve boyasız bütün parçaları say.',explain:`Bütün ${x.denom} eş parçadan oluşuyor.`});
  if(rep==='explain'){
    const answer=`Parçaların hepsi eş büyüklükte ve bütün ${x.denom} parçaya ayrılmış`;
    return qBase('fractionMeaning2',rep,'Bu modelde “eş parça” diyebilmemizin nedeni nedir?',answer,semanticChoices(answer,['Parçaların renkleri aynı olduğu için','Yalnız boyalı parça önemli olduğu için','Bütün iki kat büyüdüğü için'],rng),{taskKind:'reasoning-choice',taskLabel:'Eş parçayı gerekçelendir',visual:{type:'fraction-strip',numerator:1,denom:x.denom},hint:'Parçaların büyüklüklerini düşün.',explain:answer+'.'});
  }
  const y=c.transfer;
  const wrong=[{numerator:1,denom:Math.max(2,y.denom-1)},{numerator:Math.min(2,y.denom-1),denom:y.denom},{numerator:1,denom:y.denom+1}];
  return qTask('fractionMeaning2',rep,`Bir çikolata ${y.denom} eş parçaya bölündü ve bir parçası alındı. Hangi model bunu gösterir?`,'correct',{kind:'visual-choice',options:fractionVisualOptions(y,wrong,rng)},{taskKind:'context-transfer',taskLabel:'Eş parça fikrini günlük duruma taşı',visual:{type:'chocolate-parts',denom:y.denom},hint:`${y.denom} eş parçadan yalnız biri seçilmeli.`,explain:`Bir bütün ${y.denom} eş parçaya bölünmüş ve bir parçası alınmıştır.`});
}
function genFractionNotation2(rep,d,rng,concept){
  const c=concept?.skillId==='fractionNotation2'?concept:createConceptInstance('fractionNotation2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('fractionNotation2',rep,`Bütünü ${x.denom} eş parça olarak düşün. ${x.numerator} parçayı boya.`,x.numerator,{kind:'manipulative',interaction:'fraction-shade',expectedValue:String(x.numerator),checkLabel:'Modeli kontrol et'},{taskKind:'manipulative-build',taskLabel:'Sözel kesri modelle',visual:{type:'fraction-shade-builder',denom:x.denom,target:x.numerator},hint:`Toplam ${x.denom} eş parça var; ${x.numerator} tanesini boya.`,explain:`${x.denom} eş parçadan ${x.numerator} tanesi seçildi.`});
  if(rep==='see'){
    const wrong=[{numerator:Math.max(1,x.numerator-1),denom:x.denom},{numerator:Math.min(x.denom-1,x.numerator+1),denom:x.denom},{numerator:x.numerator,denom:x.denom===2?3:x.denom-1}];
    return qTask('fractionNotation2',rep,`“${x.denom} eş parçadan ${x.numerator}’ü” ifadesini gösteren model hangisi?`,'correct',{kind:'visual-choice',options:fractionVisualOptions(x,wrong,rng)},{taskKind:'visual-discrimination',taskLabel:'Söz ile modeli eşleştir',teachingNote:`${x.denom} eş parçadan ${x.numerator}’ü, kesirle ${fractionSymbol(x.numerator,x.denom)} diye yazılır.`,visual:{type:'fraction-notation-card',numerator:x.numerator,denom:x.denom},hint:'Alt sayı bütünün kaç eş parçaya ayrıldığını, üst sayı seçilen parça sayısını anlatır.',explain:`${fractionSymbol(x.numerator,x.denom)} = ${x.denom} eş parçadan ${x.numerator}’ü.`});
  }
  if(rep==='symbol') return qBase('fractionNotation2',rep,'Boyalı kısmı kesirle nasıl yazarız?',fractionSymbol(x.numerator,x.denom),fractionSymbolChoices(x.numerator,x.denom,rng),{taskKind:'symbol-entry',taskLabel:'Modeli kesir sembolüyle yaz',teachingNote:'Kesir çizgisinin altındaki sayı bütünün kaç eş parçaya ayrıldığını; üstteki sayı kaç parçanın seçildiğini gösterir.',visual:{type:'fraction-strip',numerator:x.numerator,denom:x.denom},hint:`Bütün ${x.denom} eş parça; boyalı parça sayısını üst tarafa yaz.`,explain:`${x.numerator} parça seçildi, bütün ${x.denom} eş parçaya ayrıldı: ${fractionSymbol(x.numerator,x.denom)}.`});
  if(rep==='explain'){
    const answer=`Bütün ${x.denom} eş parçaya ayrılmış ve ${x.numerator} parça seçilmiş`;
    return qBase('fractionNotation2',rep,`${fractionSymbol(x.numerator,x.denom)} ne anlatır?`,answer,semanticChoices(answer,[`Bütün ${x.numerator} eş parçaya ayrılmış ve ${x.denom} parça seçilmiş`,'Yalnız parçaların rengini anlatır','Bütünün kaç kat büyüdüğünü anlatır'],rng),{taskKind:'reasoning-choice',taskLabel:'Kesir sembolünün anlamını açıkla',visual:{type:'fraction-notation-card',numerator:x.numerator,denom:x.denom},hint:'Alt ve üst sayının görevlerini düşün.',explain:answer+'.'});
  }
  const y=c.transfer, answer=fractionSymbol(y.numerator,y.denom);
  return qBase('fractionNotation2',rep,`Bir pizza ${y.denom} eş dilime ayrıldı; ${y.numerator} dilim yenildi. Yenilen kısmı hangi kesir gösterir?`,answer,fractionSymbolChoices(y.numerator,y.denom,rng),{taskKind:'context-transfer',taskLabel:'Kesir gösterimini günlük duruma taşı',visual:{type:'pizza-fraction',numerator:y.numerator,denom:y.denom},hint:`Toplam dilim sayısı alta, yenilen dilim sayısı üste gelir.`,explain:`${y.denom} eş dilimden ${y.numerator}’ü yenildi: ${answer}.`});
}
function genFractionCompare2(rep,d,rng,concept){
  const c=concept?.skillId==='fractionCompare2'?concept:createConceptInstance('fractionCompare2',d,rng), x=c.anchor;
  const L=fractionSymbol(x.left.numerator,x.left.denom), R=fractionSymbol(x.right.numerator,x.right.denom);
  if(rep==='build') return qTask('fractionCompare2',rep,`Solda ${L}, sağda ${R} modelini kur.`,`${x.left.numerator}|${x.right.numerator}`,{kind:'manipulative',interaction:'fraction-pair-build',expectedValue:`${x.left.numerator}|${x.right.numerator}`,checkLabel:'İki modeli kontrol et'},{taskKind:'manipulative-build',taskLabel:'İki kesri modelle ve karşılaştırmaya hazırla',visual:{type:'fraction-pair-builder',left:x.left,right:x.right},hint:'Her çubukta belirtilen sayıda eş parçayı boya.',explain:`Modeller ${L} ve ${R} kesirlerini gösteriyor.`});
  if(rep==='see'){
    const larger=x.larger==='left'?x.left:x.right, smaller=x.larger==='left'?x.right:x.left;
    const opts=shuffled([{value:'correct',visual:{type:'fraction-strip',...larger},ariaLabel:'daha büyük kesir modeli'},{value:'wrong-0',visual:{type:'fraction-strip',...smaller},ariaLabel:'daha küçük kesir modeli'},{value:'wrong-1',visual:{type:'fraction-strip',numerator:1,denom:12},ariaLabel:'başka kesir modeli'}],rng);
    return qTask('fractionCompare2',rep,`${L} ile ${R} arasında daha büyük olanın modeli hangisi?`,'correct',{kind:'visual-choice',options:opts},{taskKind:'visual-discrimination',taskLabel:'Büyüklüğü görselden ayırt et',visual:{type:'fraction-pair',left:x.left,right:x.right},hint:x.kind==='unit'?'Birim kesirlerde daha az eş parçaya bölünen bütünün bir parçası daha büyüktür.':'Paydalar aynıysa daha çok parça alan kesir daha büyüktür.',explain:`${L} ${x.relation} ${R}.`});
  }
  if(rep==='symbol') return qBase('fractionCompare2',rep,`${L} □ ${R} boşluğuna hangi işaret gelir?`,x.relation,semanticChoices(x.relation,['<','>','='].filter(z=>z!==x.relation).concat(['?']),rng),{taskKind:'symbol-entry',taskLabel:'Kesirleri karşılaştırma işaretiyle yaz',visual:{type:'fraction-pair',left:x.left,right:x.right},hint:x.kind==='unit'?'Paylar 1 ise paydası küçük olan birim kesir daha büyüktür.':'Paydalar aynıysa payı büyük olan kesir daha büyüktür.',explain:`${L} ${x.relation} ${R}.`});
  if(rep==='explain'){
    const answer=x.kind==='unit'?'Bütün daha az eş parçaya bölünürse her bir parça daha büyük olur':'Paydalar aynıysa parçaların büyüklüğü aynıdır; daha çok parça alan kesir daha büyüktür';
    return qBase('fractionCompare2',rep,`${L} ile ${R} karşılaştırmasını hangi düşünce açıklar?`,answer,semanticChoices(answer,['Paydası büyük olan her zaman daha büyüktür','Kesirlerde yalnız üstteki sayıya bakılır','Parçaların eş olması önemli değildir'],rng),{taskKind:'reasoning-choice',taskLabel:'Kesir karşılaştırmasını gerekçelendir',visual:{type:'fraction-pair',left:x.left,right:x.right},hint:'Parça büyüklüğü ile parça sayısını ayır.',explain:answer+'.'});
  }
  const y=c.transfer, yL=fractionSymbol(y.left.numerator,y.left.denom), yR=fractionSymbol(y.right.numerator,y.right.denom), answer=y.larger==='left'?'Sol':'Sağ';
  return qBase('fractionCompare2',rep,`İki aynı büyüklükte çikolatanın biri ${yL}, diğeri ${yR} oranında yenmiş. Hangisinden daha çok yenmiştir?`,answer,semanticChoices(answer,[answer==='Sol'?'Sağ':'Sol','Aynı','Bilinemez'],rng),{taskKind:'context-transfer',taskLabel:'Kesir karşılaştırmasını günlük duruma taşı',visual:{type:'fraction-pair',left:y.left,right:y.right},hint:'Aynı büyüklükte iki bütünü karşılaştırıyorsun.',explain:`${yL} ${y.relation} ${yR}; bu yüzden ${answer.toLowerCase()} taraftan daha çok yenmiştir.`});
}
function genFractionAddSub2(rep,d,rng,concept){
  const c=concept?.skillId==='fractionAddSub2'?concept:createConceptInstance('fractionAddSub2',d,rng), x=c.anchor;
  const A=fractionSymbol(x.a,x.denom), B=fractionSymbol(x.b,x.denom), RES=fractionSymbol(x.result,x.denom);
  if(rep==='build') return qTask('fractionAddSub2',rep,`${A} ${x.op} ${B} işleminin sonucunu modelde boya.`,x.result,{kind:'manipulative',interaction:'fraction-operation-build',expectedValue:String(x.result),checkLabel:'Sonuç modelini kontrol et'},{taskKind:'manipulative-build',taskLabel:'Eş paydalı işlemi modelle',visual:{type:'fraction-operation-builder',denom:x.denom,a:x.a,b:x.b,op:x.op},hint:'Parçaların büyüklüğü değişmiyor; aynı büyüklükteki parçaları ekle ya da çıkar.',explain:`${A} ${x.op} ${B} = ${RES}.`});
  if(rep==='see'){
    const wrong=[{numerator:Math.max(0,x.result-1),denom:x.denom},{numerator:Math.min(x.denom,x.result+1),denom:x.denom},{numerator:x.result,denom:Math.min(12,x.denom+1)}];
    return qTask('fractionAddSub2',rep,`${A} ${x.op} ${B} işleminin sonucunu gösteren model hangisi?`,'correct',{kind:'visual-choice',options:fractionVisualOptions({numerator:x.result,denom:x.denom},wrong,rng)},{taskKind:'visual-discrimination',taskLabel:'İşlem sonucunu modelden ayırt et',visual:{type:'fraction-operation',denom:x.denom,a:x.a,b:x.b,op:x.op,result:x.result},hint:'Paydalar aynı; aynı büyüklükteki parçaları say.',explain:`Sonuç ${RES}.`});
  }
  if(rep==='symbol') return qBase('fractionAddSub2',rep,`${A} ${x.op} ${B} = ?`,RES,fractionSymbolChoices(x.result,x.denom,rng),{taskKind:'symbol-entry',taskLabel:'Eş paydalı işlemi kesirle yaz',visual:{type:'fraction-operation',denom:x.denom,a:x.a,b:x.b,op:x.op,result:null},hint:'Payda aynı kalır; paylarda toplama ya da çıkarma yap.',explain:`${A} ${x.op} ${B} = ${RES}.`});
  if(rep==='explain'){
    const answer='Parçalar aynı büyüklükte olduğu için payda değişmez; kaç parça olduğunu gösteren paylar işleme girer';
    return qBase('fractionAddSub2',rep,`${A} ${x.op} ${B} işleminde neden payda ${x.denom} olarak kalır?`,answer,semanticChoices(answer,['Paydalar her işlemde toplanır','Pay her zaman 1 olmalıdır','Kesir çizgisi işlemi değiştirdiği için'],rng),{taskKind:'reasoning-choice',taskLabel:'Eş paydalı işlem kuralını gerekçelendir',visual:{type:'fraction-operation',denom:x.denom,a:x.a,b:x.b,op:x.op,result:x.result},hint:'İşlem boyunca parçaların büyüklüğü değişiyor mu?',explain:answer+'.'});
  }
  const y=c.transfer, yA=fractionSymbol(y.a,y.denom), yB=fractionSymbol(y.b,y.denom), yRes=fractionSymbol(y.result,y.denom);
  const prompt=y.op==='+'?`Bir şişenin ${yA}’i sabah, ${yB}’i öğleden sonra içildi. Toplam ne kadarı içildi?`:`Bir şişenin ${yA}’i doluydu; ${yB}’i kadar içildi. Ne kadarı kaldı?`;
  return qBase('fractionAddSub2',rep,prompt,yRes,fractionSymbolChoices(y.result,y.denom,rng),{taskKind:'context-transfer',taskLabel:'Eş paydalı işlemi günlük duruma taşı',visual:{type:'fraction-operation',denom:y.denom,a:y.a,b:y.b,op:y.op,result:y.result},hint:'Aynı büyüklükteki parçaların sayısını ekle ya da çıkar.',explain:`${yA} ${y.op} ${yB} = ${yRes}.`});
}

function genFraction(rep,d,rng){
  const quarter=d>=2 && rng()<.5, denom=quarter?4:2, shaded=1, answer=quarter?'Çeyrek':'Yarım';
  if(rep==='symbol') return qBase('fraction',rep,`${answer} hangi kesirle gösterilir?`,quarter?'1/4':'1/2',semanticChoices(quarter?'1/4':'1/2',quarter?['1/2','2/4','1/3']:['1/4','2/2','1/3'],rng),{visual:{type:'fraction',denom,shaded},hint:`Bütün ${denom} eş parçaya ayrılmış.`,explain:`Bir bütün ${denom} eş parçaya ayrılıp 1 parça seçilirse ${quarter?'çeyrek':'yarım'} olur.`});
  return qBase('fraction',rep,'Boyalı parça bütünü nasıl gösteriyor?',answer,semanticChoices(answer,[quarter?'Yarım':'Çeyrek','Bütün','İki kat'],rng),{visual:{type:'fraction',denom,shaded},hint:'Bütün kaç eş parçaya ayrılmış?',explain:`Bütün ${denom} eş parçaya ayrılmış ve biri boyalı: ${answer.toLowerCase()}.`});
}
function genWord2(rep,d,rng){
  const boxes=randInt(2,4,rng), each=randInt(3,5,rng), give=randInt(1,Math.min(4,boxes*each-1),rng), ans=boxes*each-give;
  const prompt=`${boxes} kutunun her birinde ${each} kalem var. ${give} kalem verildi. Kaç kalem kaldı?`;
  if(rep==='explain') return qBase('word2',rep,prompt+' Önce neyi bulmalısın?','Kutulardaki toplam kalemi',semanticChoices('Kutulardaki toplam kalemi',['Verilen kalemi ikiye bölmeyi','Kutu sayısından kalem sayısını çıkarmayı','Sadece son sayıya bakmayı'],rng),{visual:{type:'groups',groups:boxes,each},hint:'İki adım var: önce bütün, sonra değişim.',explain:`Önce ${boxes}×${each}=${boxes*each}, sonra ${give} çıkarılır.`,effort:1.5});
  return qBase('word2',rep,prompt,ans,numericChoices(ans,6,rng),{visual:{type:'story2',boxes,each,give},hint:`Önce ${boxes} kutudaki toplamı bul, sonra ${give} çıkar.`,explain:`${boxes}×${each}=${boxes*each}; ${boxes*each}−${give}=${ans}.`,effort:1.5});
}


function genShapesBasic(rep,d,rng){
  const shapes=[
    {name:'Daire',sides:0,icon:'circle'},
    {name:'Üçgen',sides:3,icon:'triangle'},
    {name:'Kare',sides:4,icon:'square'},
    {name:'Dikdörtgen',sides:4,icon:'rect'}
  ];
  const target=choice(shapes,rng);
  if(rep==='explain') return qBase('shapesBasic',rep,`${target.name} için hangi ipucu en yararlı?`,target.sides===0?'Köşesi yok':`${target.sides} kenarı var`,semanticChoices(target.sides===0?'Köşesi yok':`${target.sides} kenarı var`,['Sadece rengine bakarım','Her zaman yuvarlanır','Boyutu adını değiştirir'],rng),{visual:{type:'shape',shape:target.icon},hint:'Şeklin rengi değil, biçimi önemlidir.',explain:`${target.name}, yönü veya boyutu değişse de aynı şekildir.`});
  if(rep==='transfer') return qBase('shapesBasic',rep,`Bir trafik levhasında ${target.name.toLowerCase()} biçimi görsen hangi şekli seçersin?`,target.name,semanticChoices(target.name,shapes.filter(x=>x.name!==target.name).map(x=>x.name),rng),{visual:{type:'shape-scene',shape:target.icon},hint:'Günlük nesnenin dış çizgisine bak.',explain:`Nesnenin dış çizgisi ${target.name.toLowerCase()} biçimindedir.`});
  return qBase('shapesBasic',rep,'Gösterilen şeklin adı nedir?',target.name,semanticChoices(target.name,shapes.filter(x=>x.name!==target.name).map(x=>x.name),rng),{visual:{type:'shape',shape:target.icon,rotate:rep==='see'?randInt(-35,35,rng):0},hint:'Kenar ve köşelere bak.',explain:`Bu şekil ${target.name.toLowerCase()}.`});
}

function genSortAttribute(rep,d,rng){
  const byShape=rng()<.5;
  const answer=byShape?'Şekline göre':'Büyüklüğüne göre';
  if(rep==='explain') return qBase('sortAttribute',rep,'İki nesneyi aynı gruba koyarken en iyi matematiksel soru hangisidir?','Hangi ortak özellikleri var?',semanticChoices('Hangi ortak özellikleri var?',['Hangisi daha güzel?','Hangisini daha çok seviyorum?','Hangisi ekrana daha yakın?'],rng),{visual:{type:'sort',mode:byShape?'shape':'size'},hint:'Sınıflama ortak bir özelliğe dayanır.',explain:'Matematikte sınıflama, nesneleri ortak bir özelliğe göre gruplar.'});
  return qBase('sortAttribute',rep,'Bu nesneler hangi kurala göre iki gruba ayrılmış?',answer,semanticChoices(answer,[byShape?'Büyüklüğüne göre':'Şekline göre','Rastgele','Sayı sırasına göre'],rng),{visual:{type:'sort',mode:byShape?'shape':'size'},hint:'Her grupta ortak olan özelliği ara.',explain:`Gruplar ${answer.toLowerCase()} oluşturulmuş.`});
}

function genPositionWords(rep,d,rng){
  const items=[['üstünde','Üstünde'],['altında','Altında'],['solunda','Solunda'],['sağında','Sağında']];
  const [rel,ans]=choice(items,rng);
  if(rep==='explain') return qBase('positionWords',rep,'Bir nesnenin konumunu anlatmak için neye ihtiyaç vardır?','Başka bir nesneyi referans almaya',semanticChoices('Başka bir nesneyi referans almaya',['Rengine bakmaya','Sadece saymaya','Nesnenin adını değiştirmeye'],rng),{visual:{type:'position',relation:rel},hint:'“Neye göre?” sorusunu düşün.',explain:'Konum sözleri bir nesnenin başka bir şeye göre yerini anlatır.'});
  return qBase('positionWords',rep,`Mavi nokta turuncu karenin neresinde?`,ans,semanticChoices(ans,items.filter(x=>x[1]!==ans).map(x=>x[1]),rng),{visual:{type:'position',relation:rel},hint:'Turuncu kareyi referans al.',explain:`Mavi nokta karenin ${rel}.`});
}

function genNumberPattern1(rep,d,rng,concept){
  const c=concept?.skillId==='numberPattern1'?concept:createConceptInstance('numberPattern1',d,rng);
  const x=c.anchor;
  const describe=step=>`${Math.abs(step)} ${step>0?'artıyor':'azalıyor'}`;
  const stepText=step=>`${step>0?'+':'−'}${Math.abs(step)}`;
  if(rep==='build'){
    const candidates=shuffled([1,-1,10,-10],rng);
    return qTask('numberPattern1',rep,`${x.seq.join(', ')} örüntüsünü aynı adımla devam ettir. Hangi değişimi tekrar tekrar kullanmalısın?`,x.step,{kind:'manipulative',interaction:'pattern-step',expectedValue:String(x.step),checkLabel:'Adımı kontrol et'},{
      taskKind:'manipulative-build',taskLabel:'1 veya 10 daha fazla/az kuralını kur',visual:{type:'pattern-step-interactive',seq:x.seq,candidates},hint:'Yan yana iki sayı arasındaki farkı incele.',explain:`Her adımda ${describe(x.step)}; sıradaki sayı ${x.next}.`
    });
  }
  if(rep==='see'){
    const alternatives=[x.next,x.next+(x.step>0?Math.abs(x.step):Math.abs(x.step)),x.next-(x.step>0?Math.abs(x.step):Math.abs(x.step))]
      .filter(n=>n>=0&&n<=100);
    const vals=[...new Set(alternatives)];
    let bump=1; while(vals.length<3){ const n=Math.max(0,Math.min(100,x.next+bump++)); if(!vals.includes(n)) vals.push(n); }
    const opts=shuffled(vals.slice(0,3).map((n,i)=>({value:n===x.next?'correct':`wrong-${i}`,visual:{type:'sequence',items:x.seq.concat(n)},ariaLabel:`örüntü ${n} ile devam ediyor`})),rng);
    return qTask('numberPattern1',rep,'Hangi görsel dizide örüntü aynı kuralla doğru devam ediyor?','correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Sabit adımlı sayı örüntüsünü gör',visual:{type:'sequence',items:x.seq.concat('?')},hint:'Her komşu sayı arasında aynı değişim olmalı.',explain:`Doğru dizide her adım ${stepText(x.step)} değişiyor.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('numberPattern1',rep,`${y.seq.join(', ')}, □`,y.next,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Örüntüyü kontrol et'},{
      taskKind:'symbol-entry',taskLabel:'Kuralı sayı dizisinde sürdür',visual:{type:'sequence',items:y.seq.concat('?')},hint:`Bir önceki sayıya ${stepText(y.step)} uygula.`,explain:`Kural ${describe(y.step)}; sıradaki sayı ${y.next}.`
    });
  }
  if(rep==='explain'){
    const answer=`Her adımda ${describe(x.step)}`;
    const distract=[`Her adımda ${Math.abs(x.step)} ${x.step>0?'azalıyor':'artıyor'}`,'Sayılar rastgele değişiyor',`Her adımda ${Math.abs(x.step)===1?10:1} ${x.step>0?'artıyor':'azalıyor'}`];
    return qBase('numberPattern1',rep,`${x.seq.join(', ')}, … dizisinin kuralını hangi cümle açıklar?`,answer,semanticChoices(answer,distract,rng),{
      taskKind:'reasoning-choice',taskLabel:'Sayı örüntüsünün değişimini açıkla',visual:{type:'sequence',items:x.seq.concat('?')},hint:'Hem değişimin büyüklüğünü hem yönünü söyle.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  const moves=2;
  const answer=y.start+moves*y.step;
  const direction=y.step>0?'ilerliyor':'geri geliyor';
  return qTask('numberPattern1',rep,`Bir sayı robotu ${y.start}'dan başlıyor ve her harekette ${Math.abs(y.step)} ${direction}. İki hareket sonra hangi sayıda olur?`,answer,{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Yolu kontrol et'},{
    taskKind:'context-transfer',taskLabel:'Sayı örüntüsü kuralını harekete taşı',visual:{type:'elevator-pattern',start:y.start,step:y.step,moves},hint:`Her harekette ${stepText(y.step)} uygula.`,explain:`${y.start} → ${y.start+y.step} → ${answer}.`
  });
}

function genShapes1(rep,d,rng,concept){
  const c=concept?.skillId==='shapes1'?concept:createConceptInstance('shapes1',d,rng);
  const x=c.anchor;
  const signature=z=>`${z.straight}|${z.curves}|${z.structure}`;
  const describe=z=>`${z.straight} düz kenar parçası, ${z.curves} eğri sınır; ${z.structure}`;
  if(rep==='build') return qTask('shapes1',rep,`${x.name} için doğru sınır özelliklerini bir araya getir.`,signature(x),{kind:'manipulative',interaction:'shape-properties',expectedValue:signature(x),checkLabel:'Özellikleri kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Şekli düz ve eğri sınırlarıyla kur',visual:{type:'shape-property-builder',shape:x.icon,name:x.name},hint:'Kaç düz kenar parçası ve kaç eğri sınır gördüğünü ayrı ayrı düşün.',explain:`${x.name}: ${describe(x)}.`
  });
  if(rep==='see'){
    const all=shapes1Cases();
    const distractors=shuffled(all.filter(z=>z.id!==x.id),rng).slice(0,2);
    const opts=shuffled([x,...distractors].map(z=>({value:z.id,visual:{type:'shape',shape:z.icon,rotate:randInt(-45,45,rng)},ariaLabel:z.name})),rng);
    return qTask('shapes1',rep,`Döndürülmüş olsa da ${x.name.toLowerCase()} olan model hangisi?`,x.id,{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Şekli yönünden bağımsız tanı',visual:{type:'shape',shape:x.icon,rotate:-27},hint:'Yönüne değil; düz ve eğri sınırlarına bak.',explain:`Döndürmek ${x.name.toLowerCase()} şeklinin temel sınır yapısını değiştirmez.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, all=shapes1Cases();
    return qBase('shapes1',rep,'Gösterilen 2B şeklin matematiksel adı hangisi?',y.name,semanticChoices(y.name,all.filter(z=>z.id!==y.id).map(z=>z.name),rng),{
      taskKind:'symbol-entry',taskLabel:'Görseli matematik dilinde adlandır',visual:{type:'shape',shape:y.icon,rotate:18},hint:'Yarım ve çeyrek daireyi de bağımsız şekil adı olarak düşün.',explain:`Bu şeklin adı ${y.name.toLowerCase()}.`
    });
  }
  if(rep==='explain'){
    const answer=`${x.straight} düz kenar parçası ve ${x.curves} eğri sınırı vardır`;
    return qBase('shapes1',rep,`${x.name} için hangi gerekçe sınır yapısına dayanır?`,answer,semanticChoices(answer,['Rengi değişirse adı değişir','Büyük çizilirse başka şekil olur','Ekranın üstünde olduğu için bu adı alır'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Şekli biçimsel özelliğiyle gerekçelendir',visual:{type:'shape',shape:x.icon,rotate:31},hint:'Renk, büyüklük ve yön yerine düz çizgi ve eğri sınırları karşılaştır.',explain:`${answer}; ${x.structure}.`
    });
  }
  const y=c.transfer, all=shapes1Cases(), distractors=shuffled(all.filter(z=>z.id!==y.id),rng).slice(0,2);
  const opts=shuffled([y,...distractors].map(z=>({value:z.id,visual:{type:'shape-scene',shape:z.icon},ariaLabel:`${z.name} biçimli günlük nesne`})),rng);
  return qTask('shapes1',rep,`Hangi günlük nesnenin dış çizgisi ${y.name.toLowerCase()} biçimini örnekliyor?`,y.id,{kind:'visual-choice',options:opts},{
    taskKind:'context-transfer',taskLabel:'Şekli günlük nesnede bul',visual:{type:'shape',shape:y.icon},hint:'Nesnenin ne olduğuna değil dış çizgisindeki düz/eğri parçalara bak.',explain:`Doğru nesnenin dış çizgisi ${y.name.toLowerCase()} biçimindedir.`
  });
}
function genLengthCompare1(rep,d,rng,concept){
  const c=concept?.skillId==='lengthCompare1'?concept:createConceptInstance('lengthCompare1',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('lengthCompare1',rep,`${x.a} cm ve ${x.b} cm çubukları aynı başlangıçtan hizala; daha uzun olanı seç.`,`aligned|${x.longer}`,{kind:'manipulative',interaction:'length-align',expectedValue:`aligned|${x.longer}`,checkLabel:'Karşılaştırmayı kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Santimetre uzunluklarını karşılaştır',visual:{type:'length-align-interactive',a:x.a,b:x.b},hint:'Başlangıç noktaları aynı değilse uzunluk gözünü yanıltabilir.',explain:x.longer==='Eşit'?'Hizalandığında iki çubuğun uçları aynı noktada biter.':`Hizalandığında ${x.longer.toLowerCase()} çubuk daha ileri uzanır.`
  });
  if(rep==='see'){
    const opts=shuffled([
      {value:'fair',visual:{type:'length-bars',a:x.a,b:x.b,misaligned:false},ariaLabel:'başlangıçları hizalı karşılaştırma'},
      {value:'offset-a',visual:{type:'length-bars',a:x.a,b:x.b,misaligned:true,shift:'orange'},ariaLabel:'turuncu başlangıcı kaymış karşılaştırma'},
      {value:'offset-b',visual:{type:'length-bars',a:x.a,b:x.b,misaligned:true,shift:'blue'},ariaLabel:'mavi başlangıcı kaymış karşılaştırma'}
    ],rng);
    return qTask('lengthCompare1',rep,'Hangi model santimetre uzunluklarını adil karşılaştırmaya hazır?','fair',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Adil karşılaştırma modelini ayırt et',visual:{type:'length-bars',a:x.a,b:x.b,misaligned:true},hint:'İki nesnenin bir ucu aynı hizada olmalı.',explain:'Doğrudan karşılaştırmada başlangıç noktalarını hizalamak gerekir.'
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qBase('lengthCompare1',rep,'Santimetre değerleri verilen çubuklar için doğru karşılaştırma hangisi?',y.longer,semanticChoices(y.longer,['Mavi','Turuncu','Eşit'].filter(v=>v!==y.longer).concat('Karşılaştırılamaz'),rng),{
      taskKind:'symbol-entry',taskLabel:'Görsel ilişkiyi karşılaştırma diline çevir',visual:{type:'length-bars',a:y.a,b:y.b},hint:'Aynı noktadan başlayan uçlardan hangisi daha ileri gidiyor?',explain:y.longer==='Eşit'?'Uzunluklar eşit.':`${y.longer} daha uzun.`
    });
  }
  if(rep==='explain'){
    const answer='Aynı santimetre birimi kullanılmalı ve başlangıç noktaları aynı hizada olmalı';
    return qBase('lengthCompare1',rep,'İki uzunluğu santimetreyle karşılaştırırken aynı birim ve aynı başlangıç neden önemlidir?',answer,semanticChoices(answer,['Renkleri aynı görünsün diye','Birini olduğundan kısa göstermek için','Yalnız cetvel kullanılabildiği için'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Karşılaştırma yöntemini gerekçelendir',visual:{type:'length-bars',a:x.a,b:x.b,misaligned:true},hint:'Hizasız başlangıçta uç noktaları tek başına yorumlamak yanıltır.',explain:'Hizalama, başlangıç farkını ortadan kaldırır ve gerçek uzunluk farkını görünür yapar.'
    });
  }
  const y=c.transfer;
  const answer=y.longer==='Mavi'?'Mavi kurdele':y.longer==='Turuncu'?'Turuncu kurdele':'İkisi eşit';
  return qBase('lengthCompare1',rep,`İki kurdele aynı çizgiden başlatıldı: mavi ${y.a} cm, turuncu ${y.b} cm. Hangisi daha uzun?`,answer,semanticChoices(answer,['Mavi kurdele','Turuncu kurdele','İkisi eşit'].filter(v=>v!==answer).concat('Başlangıca bakmadan karar verilir'),rng),{
    taskKind:'context-transfer',taskLabel:'Karşılaştırmayı günlük nesneye taşı',visual:{type:'ribbon-compare-story',a:y.a,b:y.b},hint:'Kurdeleler aynı başlangıçtan çıktığı için uçlarını karşılaştırabilirsin.',explain:answer==='İkisi eşit'?'İki kurdele aynı uzunlukta.':`${answer} daha ileri uzanıyor.`
  });
}

function genData1(rep,d,rng,concept){
  const c=concept?.skillId==='data1'?concept:createConceptInstance('data1',d,rng);
  const x=c.anchor, targetIndex=1, target=x.cats[targetIndex], targetValue=x.vals[targetIndex];
  if(rep==='build') return qTask('data1',rep,`Ham veriye bak ve ${target} satırını resimli grafikte kur.`,targetValue,{kind:'manipulative',interaction:'pictograph-row',expectedValue:String(targetValue),checkLabel:'Grafik satırını kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Ham veriyi grafiğe dönüştür',visual:{type:'pictograph-row-interactive',cats:x.cats,vals:x.vals,targetIndex},hint:`Ham listedeki ${target.toLowerCase()} işaretlerini say ve o kadar hücre doldur.`,explain:`${target} için ${targetValue} gözlem var; grafik satırında ${targetValue} sembol olmalı.`
  });
  if(rep==='see'){
    const wrong1=[...x.vals]; wrong1[targetIndex]=Math.max(0,targetValue-1);
    const wrong2=[...x.vals]; wrong2[targetIndex]=targetValue+1;
    const opts=shuffled([
      {value:'correct',visual:{type:'pictograph',cats:x.cats,vals:x.vals,orientation:'horizontal'},ariaLabel:'ham veriye uyan grafik'},
      {value:'low',visual:{type:'pictograph',cats:x.cats,vals:wrong1,orientation:'horizontal'},ariaLabel:'bir sembol eksik grafik'},
      {value:'high',visual:{type:'pictograph',cats:x.cats,vals:wrong2,orientation:'horizontal'},ariaLabel:'bir sembol fazla grafik'}
    ],rng);
    return qTask('data1',rep,'Ham veriyi doğru temsil eden resimli grafik hangisi?','correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Veri ile grafiği eşleştir',visual:{type:'raw-data-list',cats:x.cats,vals:x.vals},hint:'Her kategori için ham işaret sayısı grafik sembol sayısıyla aynı olmalı.',explain:'Doğru grafikte her kategori ham verideki frekansıyla aynı sayıda sembol taşır.'
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, idx=2, cat=y.cats[idx], value=y.vals[idx];
    return qTask('data1',rep,`Dikey resimli grafikte ${cat} kaç kez görülmüş?`,value,{kind:'number-input',placeholder:'?',maxLength:1,checkLabel:'Okumayı kontrol et'}, {
      taskKind:'symbol-entry',taskLabel:'Dikey grafiği sayıyla ifade et',visual:{type:'pictograph',cats:y.cats,vals:y.vals,orientation:'vertical'},hint:`${cat} sütunundaki sembolleri say.`,explain:`${cat} sütununda ${value} sembol var; frekans ${value}.`
    });
  }
  if(rep==='explain'){
    const answer=`${x.cats[x.maxIndex]} için en fazla sembol bulunduğu için`;
    return qBase('data1',rep,`${x.cats[x.maxIndex]} veride neden “en çok” kategorisidir?`,answer,semanticChoices(answer,['Soldaki ilk kategori olduğu için','Rengi daha belirgin olduğu için','Kategori adı daha uzun olduğu için'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Grafik sonucunu açıkla',visual:{type:'pictograph',cats:x.cats,vals:x.vals,orientation:'horizontal'},hint:'Kategori adından çok sembolleri say.',explain:`${x.cats[x.maxIndex]} için ${x.max} sembol var; en çok sembol bu kategoride.`
    });
  }
  const y=c.transfer;
  const maxIndex=y.vals.indexOf(Math.max(...y.vals));
  const minIndex=y.vals.indexOf(Math.min(...y.vals));
  const correct=`${y.cats[maxIndex]} en çok, ${y.cats[minIndex]} en az seçildi`;
  const distractors=[
    `${y.cats[minIndex]} en çok, ${y.cats[maxIndex]} en az seçildi`,
    `${y.cats[0]} ile ${y.cats[1]} kesinlikle eşit seçildi`,
    'Grafikten kategorilerin sıklığı hakkında hiçbir şey söylenemez'
  ];
  return qBase('data1',rep,'Bu yeni anket grafiğini anlatan doğru cümle hangisidir?',correct,semanticChoices(correct,distractors,rng),{
    taskKind:'context-transfer',taskLabel:'Dikey grafikten veri hikâyesi kur',visual:{type:'pictograph',cats:y.cats,vals:y.vals,orientation:'vertical'},hint:'Önce en yüksek ve en düşük sütunları karşılaştır.',explain:`Grafik bir hikâye anlatır: ${correct.toLowerCase()}.`
  });
}

function genNumberPattern2(rep,d,rng){
  const step=choice([2,5,10],rng), start=randInt(1,6,rng)*step, up=rng()<.7; const seq=Array.from({length:4},(_,i)=>start+(up?1:-1)*i*step).filter(x=>x>=0); while(seq.length<4) seq.push(seq.at(-1)+step); const delta=seq[1]-seq[0], ans=seq[3]+delta;
  if(rep==='explain') return qBase('numberPattern2',rep,`${seq.join(', ')}, … örüntüsünün kuralı nedir?`,`${Math.abs(delta)} ${delta>0?'artıyor':'azalıyor'}`,semanticChoices(`${Math.abs(delta)} ${delta>0?'artıyor':'azalıyor'}`,[`${Math.abs(delta)} ${delta>0?'azalıyor':'artıyor'}`,'Her adım iki katı','Kural yok'],rng),{visual:{type:'sequence',items:seq.concat('?')},hint:'Ardışık iki sayı arasındaki farkı hesapla.',explain:`Her adımda ${Math.abs(delta)} ${delta>0?'ekleniyor':'çıkarılıyor'}.`});
  return qBase('numberPattern2',rep,`${seq.join(', ')}, ?  Sıradaki sayı?`,ans,numericChoices(ans,Math.max(4,step),rng),{visual:{type:'sequence',items:seq.concat('?')},hint:'Kuralı bul ve bir kez daha uygula.',explain:`Sıradaki sayı ${ans}.`});
}

function genShapes2(rep,d,rng,concept){
  const c=concept?.skillId==='shapes2'?concept:createConceptInstance('shapes2',d,rng);
  const x=c.anchor;
  const all=shapes2Cases();
  if(rep==='build'){
    const flat=[['0','0'],['2','2'],['6','6']];
    const curved=[['0','Yok'],['1','1']];
    const face=[['square','Kare'],['rectangle','Dikdörtgen'],['circle','Daire'],['none','Düz yüz yok']];
    return qTask('shapes2',rep,`${x.name} için özellik modelini kur. Her satırdan doğru kartı seç.`,solidSignature(x),{
      kind:'manipulative',interaction:'solid-properties',expectedValue:solidSignature(x),checkLabel:'Modeli kontrol et'
    },{
      taskKind:'manipulative-build',
      visual:{type:'solid-property-builder',name:x.name,options:{flat,curved,face}},
      hint:'Düz yüz sayısını, eğri yüzeyi ve düz yüzlerin biçimini ayrı ayrı düşün.',
      explain:`${x.name}: ${x.fact}.`,
      feedbackTitle:'Özellikleri doğru bir araya getirdin.'
    });
  }
  if(rep==='see'){
    const distractors=shuffled(all.filter(z=>z.id!==x.id),rng).slice(0,2);
    const options=shuffled([x,...distractors].map(z=>({value:z.id,visual:{type:'solid',kind:z.kind,rotate:randInt(-18,18,rng)},ariaLabel:z.name})),rng);
    return qTask('shapes2',rep,`${x.name} hangisidir?`,x.id,{kind:'visual-choice',options},{
      taskKind:'visual-discrimination',
      hint:'Cismin yönüne değil, düz ve eğri yüzlerine bak.',
      explain:`Doğru cisim ${x.name.toLowerCase()}.`,
      feedbackTitle:'Cismi doğru tanıdın.'
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    const answer=y.name;
    const distractors=all.filter(z=>z.id!==y.id).map(z=>z.name);
    return qBase('shapes2',rep,`${y.fact[0].toUpperCase()+y.fact.slice(1)}. Bu cismin matematiksel adı nedir?`,answer,semanticChoices(answer,distractors,rng),{
      taskKind:'symbol-entry',
      visual:{type:'symbol-card',text:'?'},
      hint:'İpucundaki düz yüz ve eğri yüzey özelliklerini kullan.',
      explain:`Bu özellikler ${y.name.toLowerCase()} cismini tanımlar.`,
      feedbackTitle:'Doğru matematiksel adı seçtin.'
    });
  }
  if(rep==='explain'){
    const answer='Yönü değişse de biçimsel özellikleri değişmez';
    return qBase('shapes2',rep,`${x.name} çevrilip başka yönde gösterildiğinde neden yine ${x.name.toLowerCase()} olarak kalır?`,answer,semanticChoices(answer,[
      'Rengi aynı kaldığı için',
      'Ekranda aynı yerde durduğu için',
      'Sadece daha büyük göründüğü için'
    ],rng),{
      taskKind:'reasoning-choice',
      visual:{type:'solid-pair',kind:x.kind,rotate:32},
      hint:'Cismin yönü değiştiğinde düz ve eğri yüzlerinin yapısı değişiyor mu?',
      explain:`${x.name} döndürülse de onu tanımlayan biçimsel özellikler aynı kalır.`,
      feedbackTitle:'Nedenini doğru açıkladın.'
    });
  }
  const y=c.transfer;
  return qBase('shapes2',rep,'Bu günlük nesne hangi geometrik cisme en çok benziyor?',y.name,semanticChoices(y.name,all.filter(z=>z.id!==y.id).map(z=>z.name),rng),{
    taskKind:'context-transfer',
    visual:{type:'solid-scene',kind:y.scene},
    hint:'Nesnenin rengine değil, genel biçimine ve yüzlerine bak.',
    explain:`Bu nesnenin biçimi ${y.name.toLowerCase()} ile eşleşir.`,
    feedbackTitle:'Günlük nesne ile geometrik cismi eşleştirdin.'
  });
}

function genLengthCm(rep,d,rng){
  const n=randInt(3,Math.min(15,7+d*2),rng);
  if(rep==='explain') return qBase('lengthCm',rep,'Bir kalemin uzunluğunu cetvelle ölçerken nereden başlamalısın?','0 çizgisinden',semanticChoices('0 çizgisinden',['Cetvelin rastgele bir yerinden','10 çizgisinden','Kalemin ortasından'],rng),{visual:{type:'ruler',n},hint:'Ölçüm başlangıç noktası önemlidir.',explain:'Standart ölçmede nesnenin bir ucu cetvelin 0 çizgisine hizalanır.'});
  return qBase('lengthCm',rep,'Çubuğun uzunluğu kaç santimetre?',n,numericChoices(n,3,rng),{visual:{type:'ruler',n},hint:'Çubuk 0’dan başlıyor; bittiği sayıyı oku.',explain:`Çubuk ${n} cm uzunluğunda.`});
}

function genTime2(rep,d,rng){
  const hour=randInt(1,12,rng), half=rng()<.5; const answer=half?`${hour}:30`:`${hour}:00`;
  if(rep==='explain') return qBase('time2',rep,'Yelkovan 6’yı gösterdiğinde ne anlarız?','Saatin yarımı geçiyor',semanticChoices('Saatin yarımı geçiyor',['Tam saat olduğunu','Bir dakika geçtiğini','Saatin bittiğini'],rng),{visual:{type:'clock',hour,minute:30},hint:'Yelkovanın 12’den 6’ya gelmesi yarım turdur.',explain:'Yelkovan 6’dayken 30 dakika, yani yarım saat geçmiştir.'});
  return qBase('time2',rep,'Saat kaç?',answer,semanticChoices(answer,[`${hour}:15`,`${hour}:45`,`${(hour%12)+1}:00`],rng),{visual:{type:'clock',hour,minute:half?30:0},hint:'Önce yelkovana, sonra akrebe bak.',explain:`Saat ${answer}.`});
}

function genMoneyTL(rep,d,rng){
  const a=choice([1,5,10,20],rng), b=choice([1,5,10],rng), ans=a+b;
  if(rep==='explain') return qBase('moneyTL',rep,`${a} TL ile ${b} TL’yi birlikte kullanırsan toplam değeri nasıl bulursun?`,'Değerleri toplarım',semanticChoices('Değerleri toplarım',['Küçük olanı yok sayarım','Sadece banknot sayısını sayarım','Rengine göre karar veririm'],rng),{visual:{type:'money',values:[a,b]},hint:'Para parçalarının sayısı değil, üzerindeki değer önemlidir.',explain:`${a}+${b}=${ans} TL.`});
  if(rep==='transfer') return qBase('moneyTL',rep,`${ans} TL olan bir oyuncak için elinde ${a} TL ve ${b} TL varsa paran yeter mi?`,'Evet',semanticChoices('Evet',['Hayır','Sadece yarısı yeter','Bilinemaz'],rng),{visual:{type:'money',values:[a,b],price:ans},hint:'Paranın toplamını fiyatla karşılaştır.',explain:`Toplam ${ans} TL; fiyat da ${ans} TL, yani yeter.`});
  return qBase('moneyTL',rep,`Bu paraların toplam değeri kaç TL?`,ans,numericChoices(ans,5,rng),{visual:{type:'money',values:[a,b]},hint:'Üzerlerindeki değerleri topla.',explain:`${a}+${b}=${ans} TL.`});
}

function genData2(rep,d,rng){
  const cats=['Pzt','Sal','Çar','Per']; const vals=cats.map(()=>randInt(1,8,rng)); const idx=randInt(0,3,rng); const ans=vals[idx];
  if(rep==='explain') return qBase('data2',rep,'Sütun grafiğinde bir sütun daha yüksekse ne anlatır?','O kategorideki miktar daha fazladır',semanticChoices('O kategorideki miktar daha fazladır',['Kategori daha önemlidir','Sütun daha güzeldir','Sayı değişmez'],rng),{visual:{type:'bar-chart',cats,vals},hint:'Yükseklik miktarı temsil eder.',explain:'Sütunun yüksekliği o kategorinin sayısal değerini gösterir.'});
  return qBase('data2',rep,`${cats[idx]} günü grafikte kaç birim gösterilmiş?`,ans,numericChoices(ans,3,rng),{visual:{type:'bar-chart',cats,vals,highlight:idx},hint:'İlgili sütunun yüksekliğini sayı çizgisiyle eşleştir.',explain:`${cats[idx]} sütunu ${ans} birim yüksekliğinde.`});
}
const GENERATORS={
  nelMatchAttributes:genNelMatchAttributes,
  nelSortAttributes:genNelSortAttributes,
  nelCompareAttributes:genNelCompareAttributes,
  subitize5:genSubitize,count10:genCount10,compare10:genCompare10,partwhole5:genPartWhole5,patternAB:genPattern,shapesBasic:genShapesBasic,sortAttribute:genSortAttribute,positionWords:genPositionWords,
  number20:genNumber20,numberBonds10:genNumberBonds10,make10:genMake10,add20:genAdd20,addMany1:genAddMany1,sub20:genSub20,equality:genEquality,word1:genWord1,
  number100:genNumber100,compareOrder100:genCompareOrder100,ordinal10:genOrdinal10,numberPattern1:genNumberPattern1,addSub100:genAddSub100,multiply40:genMultiply40,divide20g1:genDivide20G1,money1:genMoney1,
  lengthCompare1:genLengthCompare1,lengthMeasure1:genLengthMeasure1,time1:genTime1,shapes1:genShapes1,shapePattern1:genShapePattern1,data1:genData1,
  number1000:genNumber1000,compareOrder1000:genCompareOrder1000,numberPattern1000:genNumberPattern1000,oddEven1000:genOddEven1000,addSub1000:genAddSub1000,wordAddSub2:genWordAddSub2,
  times23510:genTimes23510,divisionTables2:genDivisionTables2,multDivFamilies2:genMultDivFamilies2,
  fractionMeaning2:genFractionMeaning2,fractionNotation2:genFractionNotation2,fractionCompare2:genFractionCompare2,fractionAddSub2:genFractionAddSub2,
  lengthMetre2:genLengthMetre2,massMetric2:genMassMetric2,volumeLitre2:genVolumeLitre2,timeMinute2:genTimeMinute2,timeDuration2:genTimeDuration2,moneyP2:genMoneyP2,
  shapePatterns2:genShapePatterns2,solids2:genSolids2,pictureGraphScale2:genPictureGraphScale2,
  place100:genPlace100,add100:genAdd100,sub100:genSub100,multiply5:genMultiply5,divide20:genDivide20,fraction:genFraction,word2:genWord2,numberPattern2:genNumberPattern2,shapes2:genShapes2,lengthCm:genLengthCm,time2:genTime2,moneyTL:genMoneyTL,data2:genData2
};

export function recommendedRepresentation(skillState){
  const unseen = REPRESENTATIONS.filter(r => (skillState.evidence[r]?.attempts || 0) === 0);
  if(unseen.length) return unseen[0];
  return [...REPRESENTATIONS].sort((a,b)=>(skillState.evidence[a]?.score||0)-(skillState.evidence[b]?.score||0))[0];
}

export function prerequisitesReady(state, skillObj){
  return !skillObj.prerequisite?.length || skillObj.prerequisite.every(id => { const ss=ensureSkillState(state,id); return masteryPercent(ss) >= 35 && evidenceCoverage(ss) >= 2; });
}


export function buildLearningCyclePlan(skillState){
  const lc=ensureLearningCycleState(skillState);
  if(!lc.firstCycleCompletedAt){
    return [
      {phase:'readiness',representation:'see',kind:'readiness',conceptScope:'fresh',countsTowardEvidence:false},
      {phase:'model',representation:'build',kind:'focus'},
      {phase:'representation',representation:'see',kind:'focus'},
      {phase:'symbol',representation:'symbol',kind:'focus'},
      {phase:'reasoning',representation:'explain',kind:'focus'},
      {phase:'context',representation:'transfer',kind:'focus',conceptScope:'fresh'},
      {phase:'practice',representation:'symbol',kind:'practice',conceptScope:'fresh',practiceIndex:0},
      {phase:'practice',representation:'transfer',kind:'practice',conceptScope:'fresh',practiceIndex:1,practiceCheckpoint:true}
    ];
  }
  const ranked=[...REPRESENTATIONS].sort((a,b)=>{
    const ea=skillState.evidence[a], eb=skillState.evidence[b];
    const unseenA=(ea?.attempts||0)===0?0:1, unseenB=(eb?.attempts||0)===0?0:1;
    return unseenA-unseenB || (ea?.score||0)-(eb?.score||0);
  });
  const reps=[];
  for(const r of [...ranked,'symbol','transfer',...REPRESENTATIONS]) if(!reps.includes(r) && reps.length<2) reps.push(r);
  return reps.map((representation,index)=>({
    phase:'practice',
    representation,
    kind:'practice',
    conceptScope:'fresh',
    practiceIndex:index,
    practiceCheckpoint:index===reps.length-1
  }));
}

export function evaluatePracticeCheckpoint(previousEvents,currentEvent){
  const events=[...(previousEvents||[]),currentEvent].filter(Boolean);
  const scheduledPractice=events.filter(e=>e.phase==='practice'&&e.kind==='practice');
  const meaningful=events.filter(e=>e.kind!=='bridge'&&e.phase);
  const friction=meaningful.filter(e=>e.correct===false||e.usedHint===true).length;
  const target=Math.min(4,2+(friction>=1?1:0)+(friction>=2?1:0));
  const practiceCount=scheduledPractice.length;
  const atCap=practiceCount>=4;
  return {
    target,
    practiceCount,
    friction,
    atCap,
    complete:currentEvent?.correct===true&&practiceCount>=target
  };
}

const READINESS_SOURCE_OVERRIDES={
  number20:['count10'],
  lengthCompare1:['compare10'],
  time1:['time-foundation'],
  shapes1:['shapesBasic'],
  number1000:['number100'],
  oddEven1000:['pairing-foundation'],
  addSub1000:['addSub100'],
  wordAddSub2:['word1'],
  times23510:['multiply40'],
  divisionTables2:['divide20g1'],
  lengthMetre2:['lengthMeasure1'],
  massMetric2:['mass-foundation'],
  volumeLitre2:['volume-foundation'],
  timeMinute2:['time1'],
  moneyP2:['money1'],
  shapePatterns2:['shapes1'],
  solids2:['shapes1'],
  pictureGraphScale2:['data1'],
  fractionMeaning2:['partwhole5']
};

export function readinessSourcesFor(skillId){
  const skillObj=SKILLS.find(s=>s.id===skillId);
  if(!skillObj) return [];
  const override=READINESS_SOURCE_OVERRIDES[skillId];
  if(override?.length) return [...override];
  if(skillObj.prerequisite?.length) return [...skillObj.prerequisite];
  return [];
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


function generateParityReadinessQuestion(difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){
  const source=sourceSkillId||'pairing-foundation';
  const n=randInt(4,9,rng), leftover=n%2, answer=leftover?'Kalır':'Kalmaz';
  const q=qBase('oddEven1000','see',support?'Nesneleri ikişerli eşleşmiş halde incele. Eşsiz nesne kalır mı?':'Bu nesneleri ikişerli eşleştirirsen eşsiz nesne kalır mı?',answer,semanticChoices(answer,[answer==='Kalır'?'Kalmaz':'Kalır','İki tane kalır','Bilinemez'],rng),{
    taskKind:support?'readiness-support':'readiness-check',
    visual:support?{type:'pairing-small',n,leftover}:{type:'objects',n},
    hint:'Nesneleri iki iki düşün.',
    explain:leftover?'Bir nesne eşsiz kalır.':'Bütün nesneler ikişerli eşleşir.',
    countsTowardEvidence:false
  });
  return relabelReadinessQuestion(q,'oddEven1000',source,{support,rng});
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


function generateMassReadinessQuestion(difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){
  const source=sourceSkillId||'mass-foundation', left=support?1:randInt(1,3,rng), right=left+randInt(1,2,rng), answer='Sağ';
  const q=qBase('massMetric2','see',support?'Daha çok aynı ağırlık parçası olan taraf daha ağırdır. Hangi taraf daha ağır?':'Aynı tür parçalardan oluşan iki yükten hangisi daha ağır?',answer,semanticChoices(answer,['Sol','Eşit','Bilinemez'],rng),{
    taskKind:support?'readiness-support':'readiness-check',visual:{type:'mass-foundation',left,right},hint:'Parçalar aynı türde; daha çok parça olan tarafın kütlesi daha büyüktür.',explain:'Sağ tarafta daha çok aynı ağırlık parçası var.',countsTowardEvidence:false
  });
  return relabelReadinessQuestion(q,'massMetric2',source,{support,rng});
}
function generateVolumeReadinessQuestion(difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){
  const source=sourceSkillId||'volume-foundation', left=support?2:randInt(2,4,rng), right=left+randInt(1,2,rng), answer='Sağ';
  const q=qBase('volumeLitre2','see',support?'Aynı kaplarda sıvı seviyesi daha yüksek olan tarafta daha çok sıvı vardır. Hangisi?':'Aynı büyüklükteki kaplardan hangisinde daha çok sıvı var?',answer,semanticChoices(answer,['Sol','Eşit','Bilinemez'],rng),{
    taskKind:support?'readiness-support':'readiness-check',visual:{type:'volume-foundation',left,right},hint:'Kaplar aynı; sıvı seviyelerini karşılaştır.',explain:'Sağ kaptaki sıvı seviyesi daha yüksektir.',countsTowardEvidence:false
  });
  return relabelReadinessQuestion(q,'volumeLitre2',source,{support,rng});
}

function generateReadinessQuestion(skillId,difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){
  if(skillId==='time1') return generateTimeReadinessQuestion(difficulty,rng,{support,sourceSkillId});
  if(skillId==='oddEven1000') return generateParityReadinessQuestion(difficulty,rng,{support,sourceSkillId});
  if(skillId==='massMetric2') return generateMassReadinessQuestion(difficulty,rng,{support,sourceSkillId});
  if(skillId==='volumeLitre2') return generateVolumeReadinessQuestion(difficulty,rng,{support,sourceSkillId});

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

const PRACTICE_PROMPT_PREFIXES={
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

function generateNumber1000LearningQuestion(phase,representation,difficulty=1,rng=Math.random,conceptInstance=null,options={}){
  const c=conceptInstance?.skillId==='number1000'?conceptInstance:createConceptInstance('number1000',difficulty,rng);
  const x=c?.anchor||number1000Cases()[0];

  if(phase==='model') return genNumber1000('build',difficulty,rng,c);

  if(phase==='representation'){
    return qTask('number1000','see','Modelin gösterdiği sayıyı rakamla yaz.',x.n,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Sayımı kontrol et'},{
      taskKind:'model-to-number-production',taskLabel:'Modelden sayıyı kendin üret',visual:{type:'base1000',...hto(x.n)},
      hint:'Yüzlükleri, onlukları ve birlikleri ayrı ayrı say.',
      explain:x.hundreds+' yüzlük + '+x.tens+' onluk + '+x.ones+' birlik = '+x.n+'.'
    });
  }

  if(phase==='symbol'){
    const y=c?.symbol||x;
    return qTask('number1000','symbol','“'+trNumberWord(y.n)+'” sayısını rakamla yaz.',y.n,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Yazdığımı kontrol et'},{
      taskKind:'word-to-numeral-production',taskLabel:'Sözcükten rakamı kendin üret',
      hint:'Yüzlük, onluk ve birlik parçalarını sırayla düşün.',explain:'“'+trNumberWord(y.n)+'” = '+y.n+'.'
    });
  }

  if(phase==='reasoning'){
    if(x.n===1000){
      return qTask('number1000','explain','1000 sayısı kaç yüzlükten oluşur?',10,{kind:'number-input',placeholder:'?',maxLength:2,checkLabel:'Düşüncemi kontrol et'},{
        taskKind:'place-value-production',taskLabel:'Basamak ilişkisini kendin açıkla',visual:{type:'base1000',...hto(1000)},
        hint:'Bir yüzlük 100’dür. 1000’e ulaşmak için kaç tane gerekir?',explain:'10 yüzlük = 1000.'
      });
    }
    const places=[
      {name:'yüzlük',digit:x.hundreds,value:x.hundreds*100},
      {name:'onluk',digit:x.tens,value:x.tens*10},
      {name:'birlik',digit:x.ones,value:x.ones}
    ].filter(p=>p.digit>0);
    const p=choice(places.length?places:[{name:'yüzlük',digit:x.hundreds,value:x.hundreds*100}],rng);
    return qTask('number1000','explain',x.n+' sayısında '+p.name+' basamağındaki '+p.digit+' rakamının değeri kaçtır?',p.value,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Değerimi kontrol et'},{
      taskKind:'place-value-production',taskLabel:'Basamak değerini kendin üret',visual:{type:'numbercard',n:x.n},
      hint:p.digit+' tane '+p.name+' düşün.',explain:p.digit+' '+p.name+' = '+p.value+'.'
    });
  }

  if(phase==='context'){
    const y=c?.transfer||x;
    return qTask('number1000','transfer','Bir kutuda '+y.hundreds+' yüzlük deste, '+y.tens+' onluk paket ve '+y.ones+' tek kart var. Toplam kaç kart vardır?',y.n,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Toplamımı kontrol et'},{
      taskKind:'context-number-production',taskLabel:'Basamak değerini gerçek miktarda kullan',
      hint:'Yüzlükleri 100, onlukları 10 olarak düşün.',explain:(y.hundreds*100)+'+'+(y.tens*10)+'+'+y.ones+'='+y.n+'.'
    });
  }

  if(phase==='practice' && (options.practiceIndex??0)===0){
    const zeros=number1000Cases().filter(z=>z.n!==1000&&(z.tens===0||z.ones===0));
    const z=choice(zeros.length?zeros:number1000Cases(),rng);
    return qTask('number1000','symbol','Modelde boş kalan basamağı da düşün. Bu model hangi sayıyı gösteriyor?',z.n,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Sayımı kontrol et'},{
      taskKind:'zero-place-production',taskLabel:'Sıfırlı basamağı modelden kendin üret',visual:{type:'base1000',...hto(z.n)},
      hint:'Bir basamakta hiç parça yoksa o yere 0 yazılır.',explain:z.n+' = '+z.hundreds+' yüzlük + '+z.tens+' onluk + '+z.ones+' birlik.'
    });
  }

  if(phase==='practice'){
    const y=c?.transfer||x;
    return qTask('number1000','transfer','Kütüphanede '+y.hundreds+' yüzlük grup, '+y.tens+' onluk grup ve '+y.ones+' tek kitap var. Toplam kitap sayısını yaz.',y.n,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Cevabımı kontrol et'},{
      taskKind:'independent-context-production',taskLabel:'Yeni bağlamda sayıyı kendin üret',
      hint:'Yüzlük + onluk + birlik değerlerini topla.',explain:(y.hundreds*100)+'+'+(y.tens*10)+'+'+y.ones+'='+y.n+'.'
    });
  }

  return generateQuestion('number1000',representation,difficulty,rng,c);
}

function lessonPracticeFinalize(q,sectionId,taskIndex){
  q.learningPhase='practice';
  q.lessonPracticeSectionId=sectionId;
  q.lessonPracticeTaskIndex=taskIndex;
  q.id=q.skillId+':section:'+sectionId+':'+taskIndex+':'+Date.now()+':'+Math.floor(Math.random()*1e6);
  return q;
}
function number1000PracticeQuestion(sectionId,taskIndex,difficulty,rng){
  const d=clamp(difficulty,1,4);
  const concept=createConceptInstance('number1000',d,rng);
  const x=concept.anchor;
  const zeros=number1000Cases().filter(z=>z.n!==1000&&(z.tens===0||z.ones===0));
  const zeroCase=choice(zeros,rng);

  if(sectionId==='build-number'){
    if(taskIndex%4===2){
      return qTask('number1000','build',zeroCase.n+' sayısını modelde kur. Boş basamağı özellikle koru.',zeroCase.hundreds+'|'+zeroCase.tens+'|'+zeroCase.ones,{kind:'manipulative',interaction:'base1000-build',expectedValue:zeroCase.hundreds+'|'+zeroCase.tens+'|'+zeroCase.ones,checkLabel:'Modelimi kontrol et'},{
        taskKind:'section-build-zero',taskLabel:'Sıfırlı sayıyı modelde kur',visual:{type:'base1000-build-interactive',target:zeroCase.n,maxHundreds:10,maxTens:9,maxOnes:9},
        hint:'Olmayan basamak için blok ekleme.',explain:zeroCase.n+' = '+zeroCase.hundreds+' yüzlük + '+zeroCase.tens+' onluk + '+zeroCase.ones+' birlik.'
      });
    }
    if(taskIndex%4===3){
      return qTask('number1000','build','1000 sayısını yalnız yüzlük bloklarla kur.','10|0|0',{kind:'manipulative',interaction:'base1000-build',expectedValue:'10|0|0',checkLabel:'Modelimi kontrol et'},{
        taskKind:'section-build-thousand',taskLabel:'10 yüzlüğü 1000 olarak kur',visual:{type:'base1000-build-interactive',target:1000,maxHundreds:10,maxTens:0,maxOnes:0},
        hint:'Bir yüzlük 100 eder.',explain:'10 yüzlük = 1000.'
      });
    }
    const q=genNumber1000('build',d,rng,concept);
    q.taskKind=taskIndex%4===0?'section-build-number':'section-build-number-alt';
    if(taskIndex%4===1) q.prompt='Sayı kartı '+x.n+'. Aynı değeri yüzlük, onluk ve birlik bloklarıyla oluştur.';
    return q;
  }

  if(sectionId==='place-value'){
    if(taskIndex%4===0) return generateNumber1000LearningQuestion('representation','see',d,rng,concept);
    if(taskIndex%4===1) return generateNumber1000LearningQuestion('reasoning','explain',d,rng,concept);
    if(taskIndex%4===2){
      const choices=[
        x.hundreds*100+' + '+x.tens*10+' + '+x.ones,
        x.hundreds+' + '+x.tens+' + '+x.ones,
        x.hundreds*10+' + '+x.tens*100+' + '+x.ones,
        x.n+' + 10'
      ];
      const answer=choices[0];
      return qBase('number1000','see',x.n+' sayısının basamak değerlerine ayrılmış biçimi hangisidir?',answer,semanticChoices(answer,choices.slice(1),rng),{
        taskKind:'section-expanded-form',taskLabel:'Sayıyı basamak değerlerine ayır',visual:{type:'numbercard',n:x.n},
        hint:'Yüzlük rakamını 100 ile, onluk rakamını 10 ile düşün.',explain:x.n+' = '+answer+'.'
      });
    }
    const missing=zeroCase.tens===0?'onluk':'birlik';
    return qBase('number1000','explain',zeroCase.n+' sayısında 0 neden yazılmıştır?','O basamakta hiç '+missing+' olmadığını gösterir',semanticChoices('O basamakta hiç '+missing+' olmadığını gösterir',['Sayının daha büyük olduğunu gösterir','0 her zaman birlik demektir','Yüzlük basamağını siler'],rng),{
      taskKind:'section-zero-role',taskLabel:'0’ın basamaktaki rolünü açıkla',visual:{type:'base1000',...hto(zeroCase.n)},
      hint:'Modelde hangi tür blok hiç yok?',explain:'0, '+missing+' basamağında hiç '+missing+' olmadığını gösterir.'
    });
  }

  if(sectionId==='read-write'){
    if(taskIndex%4===0) return generateNumber1000LearningQuestion('symbol','symbol',d,rng,concept);
    if(taskIndex%4===1){
      const answer=trNumberWord(x.n);
      const distractors=[
        trNumberWord(Math.max(100,x.n-10)),
        trNumberWord(Math.min(1000,x.n+10)),
        trNumberWord(Math.max(100,x.n-100))
      ];
      return qBase('number1000','symbol',x.n+' sayısının sözcüklerle yazılışı hangisidir?',answer,semanticChoices(answer,distractors,rng),{
        taskKind:'section-numeral-to-word',taskLabel:'Rakamdan sayı sözcüğünü seç',visual:{type:'numbercard',n:x.n},
        hint:'Önce yüzlük kısmını, sonra onluk ve birlik kısmını oku.',explain:x.n+' = '+answer+'.'
      });
    }
    if(taskIndex%4===2){
      const z=zeroCase;
      const answer=trNumberWord(z.n);
      return qBase('number1000','symbol',z.n+' sayısını doğru okuyan seçenek hangisidir?',answer,semanticChoices(answer,[answer+' sıfır','sıfır '+answer,trNumberWord(Math.max(100,z.n+10))],rng),{
        taskKind:'section-zero-reading',taskLabel:'0 bulunan sayıyı doğru oku',visual:{type:'numbercard',n:z.n},
        hint:'Boş basamak okunurken ayrıca “sıfır” sözcüğü eklenmez.',explain:z.n+' = '+answer+'.'
      });
    }
    const y=concept.symbol;
    return qTask('number1000','symbol','“'+trNumberWord(y.n)+'” ifadesini rakamlarla yaz.',y.n,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Yazdığımı kontrol et'},{
      taskKind:'section-word-production',taskLabel:'Sayı sözcüğünü rakama dönüştür',hint:'Yüzlük, onluk ve birlik parçalarını sırayla yerleştir.',explain:'“'+trNumberWord(y.n)+'” = '+y.n+'.'
    });
  }

  if(sectionId==='explain-place'){
    if(taskIndex%4===0){
      return qBase('number1000','explain','444 sayısındaki üç tane 4 neden aynı değerde değildir?','Bulundukları basamaklar farklıdır',semanticChoices('Bulundukları basamaklar farklıdır',['Rakamların şekilleri farklıdır','Her 4 her zaman 4 eder','Sayı soldan sağa küçülür'],rng),{
        taskKind:'section-same-digit-reason',taskLabel:'Aynı rakamın farklı değerini açıkla',visual:{type:'numbercard',n:444},
        hint:'400, 40 ve 4’ün hangi basamaklarda olduğunu düşün.',explain:'444 = 400 + 40 + 4; rakam aynı, basamak farklıdır.'
      });
    }
    if(taskIndex%4===1){
      return qBase('number1000','explain','304 sayısında onluk basamağında neden 0 vardır?','Hiç onluk yoktur',semanticChoices('Hiç onluk yoktur',['3 onluk vardır','4 onluk vardır','0 yüzlük vardır'],rng),{
        taskKind:'section-zero-explanation',taskLabel:'Boş basamağı açıkla',visual:{type:'base1000',...hto(304)},hint:'Modelde onluk çubuğu var mı?',explain:'304 = 3 yüzlük + 0 onluk + 4 birlik.'
      });
    }
    if(taskIndex%4===2){
      return qBase('number1000','explain','10 onluk bir araya geldiğinde ne oluşur?','1 yüzlük',semanticChoices('1 yüzlük',['1 birlik','10 yüzlük','1000'],rng),{
        taskKind:'section-ten-to-hundred',taskLabel:'Onluk-yüzlük ilişkisini açıkla',hint:'10 tane 10, 100 eder.',explain:'10 onluk = 1 yüzlük = 100.'
      });
    }
    return generateNumber1000LearningQuestion('reasoning','explain',d,rng,concept);
  }

  if(sectionId==='transfer-number'){
    const y=concept.transfer;
    const contexts=[
      ['Bir depoda ',' yüzlük kutu, ',' onluk paket ve ',' tek parça var. Toplam kaç parça vardır?'],
      ['Bir okulda ',' yüzlük deste, ',' onluk deste ve ',' tek kart var. Toplam kaç kart vardır?'],
      ['Bir arşivde ',' yüzlük klasör grubu, ',' onluk grup ve ',' tek klasör var. Toplam kaç klasör vardır?'],
      ['Bir oyunda ',' yüzlük puan, ',' onluk puan ve ',' birlik puan toplandı. Toplam puan kaçtır?']
    ];
    const t=contexts[taskIndex%contexts.length];
    return qTask('number1000','transfer',t[0]+y.hundreds+t[1]+y.tens+t[2]+y.ones+t[3],y.n,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Toplamımı kontrol et'},{
      taskKind:'section-number-transfer',taskLabel:'Basamak değerini yeni bağlama taşı',hint:'Yüzlükleri 100, onlukları 10 olarak düşün.',explain:(y.hundreds*100)+' + '+(y.tens*10)+' + '+y.ones+' = '+y.n+'.'
    });
  }

  const mixed=[
    ()=>generateNumber1000LearningQuestion('practice','symbol',d,rng,concept,{practiceIndex:0}),
    ()=>generateNumber1000LearningQuestion('representation','see',d,rng,concept),
    ()=>generateNumber1000LearningQuestion('reasoning','explain',d,rng,concept),
    ()=>generateNumber1000LearningQuestion('context','transfer',d,rng,concept)
  ];
  const q=mixed[taskIndex%mixed.length]();
  q.taskKind='section-varied-'+q.taskKind;
  return q;
}

function compareDecisionPlace(a,b){
  const ad=[Math.floor(a/100),Math.floor((a%100)/10),a%10], bd=[Math.floor(b/100),Math.floor((b%100)/10),b%10];
  const labels=['Yüzlük','Onluk','Birlik'];
  for(let i=0;i<3;i++) if(ad[i]!==bd[i]) return {index:i,label:labels[i],aDigit:ad[i],bDigit:bd[i]};
  return {index:-1,label:'Hepsi aynı',aDigit:null,bDigit:null};
}
function compareTriple(rng){
  const pool=[...new Set(compare1000Cases().flatMap(z=>[z.a,z.b]))];
  const vals=shuffled(pool,rng).filter((v,i,a)=>a.indexOf(v)===i).slice(0,3);
  return {values:vals,ordered:[...vals].sort((a,b)=>a-b)};
}
function comparisonSymbolQuestion(a,b,rng,taskKind='section-symbol'){
  const relation=a===b?'=':a>b?'>':'<';
  const opts=shuffled(['<','>','='].map(symbol=>({value:symbol,visual:{type:'equation',text:symbol},ariaLabel:symbol==='<'?'küçüktür':symbol==='>'?'büyüktür':'eşittir'})),rng);
  return qTask('compareOrder1000','symbol',a+' __ '+b+' boşluğuna hangi karşılaştırma işareti gelir?',relation,{kind:'visual-choice',options:opts},{
    taskKind,taskLabel:'Karşılaştırma işaretini kullan',visual:{type:'equation',text:a+' __ '+b},
    hint:'Önce cümleyi “küçüktür, büyüktür veya eşittir” diye söyle.',explain:compareOrderReason(a,b)+' Sembolle: '+a+' '+relation+' '+b+'.'
  });
}
function compareOrderPracticeQuestion(sectionId,taskIndex,difficulty,rng){
  const d=clamp(difficulty,1,4);
  const concept=createConceptInstance('compareOrder1000',d,rng);
  const x=concept.anchor;
  const equalCases=compare1000Cases().filter(z=>z.a===z.b);
  const equalCase=choice(equalCases,rng);

  if(sectionId==='compare-places'){
    if(taskIndex%4===0){
      const place=compareDecisionPlace(x.a,x.b);
      const answer=place.label;
      return qBase('compareOrder1000','see',x.a+' ile '+x.b+' karşılaştırılırken ilk hangi basamak karar verir?',answer,semanticChoices(answer,['Yüzlük','Onluk','Birlik','Hepsi aynı'].filter(v=>v!==answer),rng),{
        taskKind:'section-decision-place',taskLabel:'Karar veren basamağı bul',visual:{type:'compare-base1000',a:x.a,b:x.b,relation:'?'},
        hint:'Soldan başla ve ilk farklı basamakta dur.',explain:place.index<0?'Bütün basamaklar aynıdır.':place.label+' basamağı ilk farklı basamaktır.'
      });
    }
    if(taskIndex%4===1){
      const place=compareDecisionPlace(x.a,x.b);
      if(place.index<0) return qBase('compareOrder1000','see',x.a+' ile '+x.b+' karşılaştırıldığında sonuç nedir?','aynıdır',semanticChoices('aynıdır',['daha küçüktür','daha büyüktür','karşılaştırılamaz'],rng),{taskKind:'section-place-equal',taskLabel:'Eşit basamakları fark et',visual:{type:'compare-base1000',a:x.a,b:x.b,relation:'?'},hint:'Üç basamağı da sırayla karşılaştır.',explain:compareOrderReason(x.a,x.b)});
      const answer=place.aDigit>place.bDigit?String(place.aDigit):String(place.bDigit);
      const other=place.aDigit>place.bDigit?String(place.bDigit):String(place.aDigit);
      return qBase('compareOrder1000','see',place.label+' basamağında hangi rakam daha büyüktür?',answer,semanticChoices(answer,[other,'0','9'].filter(v=>v!==answer),rng),{
        taskKind:'section-decision-digit',taskLabel:'Karar veren rakamı karşılaştır',visual:{type:'compare-base1000',a:x.a,b:x.b,relation:'?'},
        hint:'Yalnız '+place.label.toLocaleLowerCase('tr-TR')+' basamağına bak.',explain:place.aDigit+' ve '+place.bDigit+' karşılaştırılır.'
      });
    }
    if(taskIndex%4===2) return genCompareOrder1000('see',d,rng,concept);
    return genCompareOrder1000('build',d,rng,concept);
  }

  if(sectionId==='verbal-relation'){
    if(taskIndex%4===2){
      return qBase('compareOrder1000','see',equalCase.a+', '+equalCase.b+' sayısına göre nasıldır?','aynıdır',semanticChoices('aynıdır',['daha küçüktür','daha büyüktür','karşılaştırılamaz'],rng),{
        taskKind:'section-verbal-equality',taskLabel:'Eşitliği sözcükle ifade et',visual:{type:'compare-base1000',a:equalCase.a,b:equalCase.b,relation:'?'},
        hint:'Yüzlük, onluk ve birlikler aynı mı?',explain:equalCase.a+' ve '+equalCase.b+' aynı değerdedir.'
      });
    }
    const a=taskIndex%4===1?x.b:x.a, b=taskIndex%4===1?x.a:x.b;
    const answer=a===b?'aynıdır':a<b?'daha küçüktür':'daha büyüktür';
    return qBase('compareOrder1000','see',a+', '+b+' sayısına göre nasıldır?',answer,semanticChoices(answer,['daha küçüktür','daha büyüktür','aynıdır','karşılaştırılamaz'].filter(v=>v!==answer),rng),{
      taskKind:'section-verbal-relation',taskLabel:'Karşılaştırmayı sözcükle söyle',visual:{type:'compare-base1000',a,b,relation:'?'},
      hint:'Yüzlüklerden başlayarak ilk farklı basamağı bul.',explain:compareOrderReason(a,b)
    });
  }

  if(sectionId==='comparison-symbols'){
    if(taskIndex%4===2) return comparisonSymbolQuestion(equalCase.a,equalCase.b,rng,'section-symbol-equality');
    const a=taskIndex%4===1?x.b:x.a, b=taskIndex%4===1?x.a:x.b;
    return comparisonSymbolQuestion(a,b,rng,taskIndex%4===3?'section-symbol-mixed':'section-symbol');
  }

  if(sectionId==='order-numbers'){
    if(taskIndex%4===0) return genCompareOrder1000('build',d,rng,concept);
    const triple=compareTriple(rng), [small,mid,large]=triple.ordered;
    if(taskIndex%4===1){
      const answer=small+' < '+mid+' < '+large;
      const distractors=[large+' < '+mid+' < '+small,mid+' < '+small+' < '+large,small+' < '+large+' < '+mid];
      return qBase('compareOrder1000','build','Sayıları küçükten büyüğe doğru sıralayan seçenek hangisidir?',answer,semanticChoices(answer,distractors,rng),{
        taskKind:'section-order-three',taskLabel:'Üç sayıyı sırala',hint:'Önce en küçük sayıyı bul, sonra kalan ikisini karşılaştır.',explain:answer+'.'
      });
    }
    if(taskIndex%4===2){
      return qBase('compareOrder1000','see',triple.values.join(', ')+' sayıları içinde en küçük olan hangisidir?',small,semanticChoices(small,triple.values.filter(v=>v!==small),rng),{
        taskKind:'section-smallest',taskLabel:'En küçük sayıyı bul',hint:'Yüzlüklerden başlayarak karşılaştır.',explain:'En küçük sayı '+small+'.'
      });
    }
    return qBase('compareOrder1000','see',triple.values.join(', ')+' sayıları içinde en büyük olan hangisidir?',large,semanticChoices(large,triple.values.filter(v=>v!==large),rng),{
      taskKind:'section-largest',taskLabel:'En büyük sayıyı bul',hint:'Yüzlüklerden başlayarak karşılaştır.',explain:'En büyük sayı '+large+'.'
    });
  }

  if(sectionId==='explain-order'){
    if(taskIndex%4===0) return genCompareOrder1000('explain',d,rng,concept);
    if(taskIndex%4===1){
      return qBase('compareOrder1000','explain','917 ile 971 karşılaştırılırken neden onluk basamağına bakılır?','Yüzlük basamakları aynıdır',semanticChoices('Yüzlük basamakları aynıdır',['Birlik basamakları aynıdır','971 üç basamaklıdır','9 her zaman en büyük rakamdır'],rng),{
        taskKind:'section-why-tens',taskLabel:'Neden sonraki basamağa geçildiğini açıkla',visual:{type:'compare-base1000',a:917,b:971,relation:'?'},
        hint:'İlk basamakta 9 ve 9’u karşılaştır.',explain:'Yüzlükler aynı olduğu için karar onluklara geçer.'
      });
    }
    if(taskIndex%4===2){
      return qBase('compareOrder1000','explain','420 ile 421 karşılaştırılırken kararı hangi düşünce verir?','Yüzlük ve onluklar aynı; birlikleri karşılaştırırım',semanticChoices('Yüzlük ve onluklar aynı; birlikleri karşılaştırırım',['Yalnız yüzlüklere bakarım','Sayıların rakam sayısı farklıdır','İşlemi toplama ile yaparım'],rng),{
        taskKind:'section-why-ones',taskLabel:'Birliklere neden geçildiğini açıkla',visual:{type:'compare-base1000',a:420,b:421,relation:'?'},
        hint:'4 yüzlük ile 4 yüzlük, sonra 2 onluk ile 2 onluğu karşılaştır.',explain:'İlk iki basamak aynı olduğu için birlikler karar verir.'
      });
    }
    return qBase('compareOrder1000','explain','535 ile 535 neden eşittir?','Yüzlük, onluk ve birliklerin hepsi aynıdır',semanticChoices('Yüzlük, onluk ve birliklerin hepsi aynıdır',['Sadece ilk rakam aynıdır','İki sayı da üç basamaklıdır','Son rakamları 5’tir'],rng),{
      taskKind:'section-why-equal',taskLabel:'Eşitliği gerekçelendir',visual:{type:'compare-base1000',a:535,b:535,relation:'?'},
      hint:'Üç basamağı da karşılaştır.',explain:'Her basamak aynı olduğu için iki sayı aynı değerdedir.'
    });
  }

  const y=concept.transfer;
  const contexts=[
    ['İki depoda ',' ve ',' ürün var. Daha çok ürünü olan depoda kaç ürün vardır?','larger'],
    ['İki sınıf ',' ve ',' puan aldı. Daha yüksek puan kaçtır?','larger'],
    ['İki rafta ',' ve ',' kitap var. Daha az kitap bulunan rafta kaç kitap vardır?','smaller'],
    ['İki parkur ',' ve ',' metre. Daha kısa parkur kaç metredir?','smaller']
  ];
  const t=contexts[taskIndex%contexts.length];
  const answer=t[3]==='larger'?y.larger:y.smaller;
  return qTask('compareOrder1000','transfer',t[0]+y.a+t[1]+y.b+t[2],answer,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Karşılaştırmayı kontrol et'},{
    taskKind:'section-order-transfer',taskLabel:'Karşılaştırmayı yeni bağlama taşı',hint:'Sayıları soldan sağa karşılaştır.',explain:(t[3]==='larger'?y.larger+' daha büyüktür.':y.smaller+' daha küçüktür.')
  });
}

// Derive the rule from the displayed sequence, including internal gaps. The
// symbol/transfer concept may have a different step from its anchor.
export function patternContinuationRule(q){
  if(q.skillId!=='numberPattern1000') return null;
  const needsRule=q.response?.interaction==='pattern-step'||q.response?.kind==='visual-choice'||
    /^pattern-(continue|missing|transfer)/.test(q.taskKind||'')||
    ['symbol-entry','context-transfer'].includes(q.taskKind);
  if(!needsRule) return null;
  const values=q.visual?.seq||q.visual?.items||[];
  const known=values.map((value,index)=>({value,index})).filter(x=>typeof x.value==='number');
  if(known.length<2) return null;
  const step=(known[1].value-known[0].value)/(known[1].index-known[0].index);
  if(![1,10,100].includes(Math.abs(step))) return null;
  return patternRulePhrase(step);
}

function patternRulePhrase(step){
  return 'Her adımda '+Math.abs(step)+' '+(step>0?'daha':'daha az')+'.';
}
function patternStepUnit(step){
  const amount=Math.abs(step);
  return amount===100?'yüzlük':amount===10?'onluk':'birlik';
}
function patternDirectionWord(step){ return step>0?'artıyor':'azalıyor'; }
function patternSequenceWithGap(x,gapIndex){
  const full=[...x.seq,x.next];
  return {full,answer:full[gapIndex],items:full.map((n,i)=>i===gapIndex?'?':n)};
}
function numberPattern1000PracticeQuestion(sectionId,taskIndex,difficulty,rng){
  const d=clamp(difficulty,1,4);
  const concept=createConceptInstance('numberPattern1000',d,rng);
  const x=concept.anchor;
  const task=taskIndex%4;
  const rule=patternRulePhrase(x.step);
  const unit=patternStepUnit(x.step);
  let q, appliedStep=x.step;

  if(sectionId==='model-change'){
    if(task===0){
      const a=x.seq[0], b=x.seq[1];
      const answer=unit;
      q=qBase('numberPattern1000','build',a+' ile '+b+' arasındaki '+Math.abs(x.step)+' büyüklüğündeki adım hangi basamak birimine eşittir?',answer,semanticChoices(answer,['yüzlük','onluk','birlik'].filter(v=>v!==answer),rng),{
        taskKind:'pattern-unit-size',taskLabel:'Adımı basamak birimiyle eşleştir',visual:{type:'pattern-model-transition',items:[a,b]},
        hint:'1, 10 ve 100 miktarlarının birlik, onluk ve yüzlük karşılıklarını düşün.',explain:Math.abs(x.step)+' büyüklüğündeki adım = 1 '+unit+'. Sınırda rakamlar yeniden gruplanabilir.'
      });
    }else if(task===1){
      const answer=x.step>0?'bir '+unit+' ekleniyor':'bir '+unit+' çıkarılıyor';
      const others=['bir yüzlük ekleniyor','bir onluk ekleniyor','bir birlik ekleniyor','bir yüzlük çıkarılıyor','bir onluk çıkarılıyor','bir birlik çıkarılıyor'].filter(v=>v!==answer);
      q=qBase('numberPattern1000','build',x.seq[1]+' sayısı '+x.seq[0]+' sayısından nasıl elde edildi?',answer,semanticChoices(answer,others,rng),{
        taskKind:'pattern-unit-change',taskLabel:'Bir sonraki sayının model değişimini söyle',visual:{type:'pattern-model-transition',items:x.seq.slice(0,2)},
        hint:'Adım '+Math.abs(x.step)+' ise bunun kaç birlik, onluk veya yüzlük olduğunu düşün.',explain:rule
      });
    }else if(task===2){
      const target=x.seq[1], model=hto(target);
      q=qTask('numberPattern1000','build',x.seq[0]+' sayısından başla. '+rule+' Sonraki sayıyı bloklarla kur.',`${model.hundreds}|${model.tens}|${model.ones}`,{kind:'manipulative',interaction:'base1000-build',expectedValue:`${model.hundreds}|${model.tens}|${model.ones}`,checkLabel:'Modeli kontrol et'},{
        taskKind:'pattern-model-build',taskLabel:'Değişimden sonraki miktarı modelle kur',visual:{type:'base1000-operation-build',a:x.seq[0],b:Math.abs(x.step),op:x.step>0?'+':'−',maxHundreds:10,maxTens:9,maxOnes:9},
        teachingNote:x.seq[0]+' → ? · '+rule,hint:'Başlangıç miktarına 1 '+unit+' '+(x.step>0?'ekle.':'çıkar.'),explain:rule+' '+x.seq[0]+' → '+target+'.'
      });
    }else{
      const y=concept.symbol, a=y.seq[0],b=y.seq[1]; appliedStep=y.step;
      q=qTask('numberPattern1000','build',a+' ile '+b+' arasındaki değişimin büyüklüğü kaçtır?',Math.abs(y.step),{kind:'number-input',placeholder:'?',maxLength:3,checkLabel:'Değişimi kontrol et'},{
        taskKind:'pattern-change-amount',taskLabel:'Değişim miktarını bul',visual:{type:'pattern-model-transition',items:[a,b]},
        hint:'Büyük sayı ile küçük sayı arasındaki farkı düşün.',explain:'Değişim miktarı '+Math.abs(y.step)+'; dizi '+patternDirectionWord(y.step)+'.'
      });
    }
  }else if(sectionId==='describe-rule'){
    const answer=rule;
    const distractors=[
      'Her adımda '+Math.abs(x.step)+' '+(x.step>0?'daha az.':'daha.'),
      'Her adımda '+(Math.abs(x.step)===1?10:1)+' daha.',
      'Sayılar arasında sabit bir kural yok.'
    ];
    const prompts=[
      x.seq.join(', ')+' dizisini devam ettirmeden önce kuralını söyle.',
      'Bu sayı dizisinde her adımda ne oluyor?',
      x.seq.slice(0,3).join(' → ')+' geçişlerini tek cümleyle nasıl tarif edersin?',
      'Aşağıdaki örüntünün değişmeyen kuralı hangisidir?'
    ];
    q=qBase('numberPattern1000','see',prompts[task],answer,semanticChoices(answer,distractors,rng),{
      taskKind:'pattern-rule-language-'+task,taskLabel:'Örüntü kuralını sözcükle ifade et',visual:{type:'sequence',items:[...x.seq,'?']},
      hint:'Önce iki komşu sayı arasındaki değişimi söyle; sonra diğer geçişte de aynı olup olmadığını kontrol et.',explain:answer
    });
  }else if(sectionId==='continue-sequence'){
    if(task===0||task===2){
      const y=task===0?x:concept.symbol; appliedStep=y.step;
      q=qTask('numberPattern1000','symbol',y.seq.join(', ')+', … dizisinde sıradaki sayı kaçtır?',y.next,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Sayımı kontrol et'},{
        taskKind:'pattern-continue-entry-'+task,taskLabel:'Tarif edilen kuralı bir adım sürdür',visual:{type:'sequence',items:[...y.seq,'?']},
        hint:'Kuralı bir kez daha uygula: '+patternRulePhrase(y.step),explain:'Sıradaki sayı '+y.next+'.'
      });
    }else{
      const answer=String(x.next);
      const options=[x.next];
      const distractorDeltas=[x.step,-x.step,1,-1,10,-10,100,-100];
      for(const delta of distractorDeltas){
        const candidate=x.next+delta;
        if(candidate>=0&&candidate<=1000&&!options.includes(candidate)) options.push(candidate);
        if(options.length===3) break;
      }
      if(options.length<3) throw new Error('Unable to build bounded pattern continuation options');
      q=qBase('numberPattern1000','symbol','Kuralı bozmadan diziyi hangi sayı devam ettirir?',answer,semanticChoices(answer,options.filter(v=>String(v)!==answer).map(String),rng),{
        taskKind:'pattern-continue-choice-'+task,taskLabel:'Doğru devamı seç',visual:{type:'sequence',items:[...x.seq,'?']},
        hint:rule,explain:'Kural aynı kaldığı için sonraki sayı '+x.next+'.'
      });
    }
  }else if(sectionId==='missing-number'){
    const gapIndex=[1,2,3,2][task];
    const gap=patternSequenceWithGap(x,gapIndex);
    const prompts=[
      gap.items.join(', ')+' dizisindeki eksik sayıyı yaz.',
      'Örüntünün ortasındaki boşluğa hangi sayı gelmeli? '+gap.items.join(', '),
      'Kuralı iki taraftan kontrol et ve eksik sayıyı bul: '+gap.items.join(', '),
      'Bu sayı dizisinde “?” yerine ne gelmelidir? '+gap.items.join(', ')
    ];
    q=qTask('numberPattern1000','symbol',prompts[task],gap.answer,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Eksik sayıyı kontrol et'},{
      taskKind:'pattern-missing-'+task,taskLabel:'Dizinin içindeki eksik sayıyı bul',visual:{type:'sequence',items:gap.items},
      hint:'Boşluğun hem solundaki hem sağındaki geçiş aynı kuralı sağlamalı.',explain:rule+' Eksik sayı '+gap.answer+'.'
    });
  }else if(sectionId==='explain-pattern'){
    if(task===0){
      const answer='1 '+unit;
      q=qBase('numberPattern1000','explain',x.seq.join(', ')+' dizisinin her adımı hangi basamak birimi büyüklüğündedir?',answer,semanticChoices(answer,['1 yüzlük','1 onluk','1 birlik'].filter(v=>v!==answer),rng),{
        taskKind:'pattern-explain-unit',taskLabel:'Adımın basamak birimini açıkla',visual:{type:'sequence',items:x.seq},
        hint:'Adımın büyüklüğü 1 mi, 10 mu, 100 mü?',explain:Math.abs(x.step)+' büyüklüğündeki adım = 1 '+unit+'. Bu, her geçişte yalnız o rakamın değişeceği anlamına gelmez.'
      });
    }else if(task===1){
      appliedStep=10;
      const answer='9 onluk + 1 onluk = 10 onluk = 1 yüzlük olur';
      q=qBase('numberPattern1000','explain','290 → 300 geçişi 10 daha olmasına rağmen neden yüzlük rakamı da değişir?',answer,semanticChoices(answer,['10 daha aslında 100 daha demektir','Onluk basamağı her zaman 0 olmalıdır','300 sayısında birlik olmadığı için'],rng),{
        taskKind:'pattern-explain-regroup',taskLabel:'Sınır geçişinde yeniden gruplamayı açıkla',visual:{type:'sequence',items:[290,300]},
        hint:'290’da 9 onluk var. Bir onluk daha eklenince kaç onluk olur?',explain:'9 onluk + 1 onluk = 10 onluk = 1 yüzlük. Adım yine 10 daha olarak kalır.'
      });
    }else if(task===2){
      const answer=x.step>0?'Sayılar aynı miktarda artıyor':'Sayılar aynı miktarda azalıyor';
      q=qBase('numberPattern1000','explain','Bu dizinin neden bir sayı örüntüsü olduğunu en iyi hangi cümle açıklar?',answer,semanticChoices(answer,['Rakamların hepsi aynıdır','Her sayı rastgele seçilmiştir','Her adımda farklı miktar değişir'].filter(v=>v!==answer),rng),{
        taskKind:'pattern-explain-constant',taskLabel:'Sabit değişim fikrini açıkla',visual:{type:'sequence',items:x.seq},
        hint:'Her geçişte değişen miktarın aynı olup olmadığına bak.',explain:rule
      });
    }else{
      const answer='Önce kuralı söyler, sonra aynı değişimi uygularım';
      q=qBase('numberPattern1000','explain','Bir örüntüde eksik sayıyı bulurken en sağlam yol hangisidir?',answer,semanticChoices(answer,['Yalnız son rakama bakarım','En büyük sayıyı seçerim','Rastgele bir sayı denerim'],rng),{
        taskKind:'pattern-explain-method',taskLabel:'Örüntü çözme yöntemini açıkla',visual:{type:'sequence',items:[x.seq[0],x.seq[1],'?',x.seq[3]]},
        hint:'Eksik sayıyı seçmeden önce dizinin değişmeyen kuralını belirle.',explain:'Önce kuralı tarif etmek, sonra boşluğu aynı kuralla kontrol etmek gerekir.'
      });
    }
  }else if(sectionId==='transfer-pattern'){
    const y=concept.transfer; appliedStep=y.step;
    const amount=Math.abs(y.step);
    const contexts=[
      y.step>0?'Bir oyunda her tur aynı miktarda puan ekleniyor.':'Bir oyunda her tur aynı miktarda puan azalıyor.',
      y.step>0?'Bir depoya her sevkiyatta aynı sayıda kutu geliyor.':'Bir depodan her sevkiyatta aynı sayıda kutu çıkıyor.',
      y.step>0?'Bir sayaç her ölçümde aynı miktarda yükseliyor.':'Bir sayaç her ölçümde aynı miktarda düşüyor.',
      y.step>0?'Bir koleksiyona her gün aynı sayıda parça ekleniyor.':'Bir koleksiyondan her gün aynı sayıda parça ayrılıyor.'
    ];
    q=qTask('numberPattern1000','transfer',contexts[task]+' Sayımlar '+y.seq.join(', ')+' oldu. Bir sonraki sayı kaç olur?',y.next,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Sonraki sayıyı kontrol et'},{
      taskKind:'pattern-transfer-'+task,taskLabel:'Sabit değişimi yeni bağlama taşı',visual:{type:'sequence',items:[...y.seq,'?']},
      hint:'Her geçişte '+amount+' '+(y.step>0?'ekleniyor.':'azalıyor.'),explain:patternRulePhrase(y.step)+' Sonraki sayı '+y.next+'.'
    });
  }else{
    throw new Error('Unknown numberPattern1000 practice section: '+sectionId);
  }
  q.patternStep=appliedStep;
  q.patternRule=patternRulePhrase(appliedStep);
  return q;
}
function oddEvenPracticeQuestion(sectionId,taskIndex,difficulty,rng){
  const d=clamp(difficulty,1,4);
  const all=oddEven1000Cases();
  const concept=createConceptInstance('oddEven1000',d,rng);
  const x=concept.anchor;
  const task=taskIndex%4;
  let q, chosen=x;

  if(sectionId==='pair-model'){
    const pairable=all.filter(z=>z.ones>=2&&z.ones<=9);
    chosen=choice(pairable,rng);
    q=qTask('oddEven1000','build',chosen.n+' sayısının birliklerini ikişerli eşleştir. Kaç birlik eşsiz kalır?',chosen.leftover,{kind:'manipulative',interaction:'parity-pair',expectedValue:String(chosen.leftover),checkLabel:'Eşleştirmeyi kontrol et'}, {
      taskKind:'parity-pair-model-'+task,taskLabel:'Birlikleri gerçekten ikişerli eşleştir',visual:{type:'parity-pair-builder',n:chosen.n,ones:chosen.ones},hint:'Her adımda iki birliği bir çift yap. Sonunda 0 ya da 1 birlik kalabilir.',explain:parityPairingStatement(chosen)
    });
  }else if(sectionId==='see-leftover'){
    chosen=task===0?all.find(z=>z.ones===0):task===1?all.find(z=>z.ones===1):x;
    const answer=chosen.leftover?'1 birlik artar':'Artan kalmaz';
    q=qBase('oddEven1000','see',chosen.n+' için ikişerli eşleşmede ne görürüz?',answer,semanticChoices(answer,[chosen.leftover?'Artan kalmaz':'1 birlik artar'],rng),{
      taskKind:'parity-see-leftover-'+task,taskLabel:'Eşleşmede artan olup olmadığını gör',visual:{type:'parity-card',n:chosen.n,ones:chosen.ones,leftover:chosen.leftover},hint:'Turuncu artan birlik var mı diye bak.',explain:parityPairingStatement(chosen)
    });
  }else if(sectionId==='classify-parity'){
    chosen=task===3?all.find(z=>z.n===1000):x;
    q=qBase('oddEven1000','symbol',chosen.n+' sayısı tek mi çifttir?',chosen.parity,semanticChoices(chosen.parity,[chosen.parity==='Çift'?'Tek':'Çift'],rng),{
      taskKind:'parity-classify-'+task,taskLabel:'Sayıyı Tek / Çift olarak sınıflandır',visual:{type:'numbercard',n:chosen.n},hint:'Birlik rakamını ikişerli eşleşme açısından düşün.',explain:parityPairingStatement(chosen)
    });
  }else if(sectionId==='ones-rule'){
    if(task===0){
      chosen=all.find(z=>z.n===573);
      q=qBase('oddEven1000','symbol',chosen.n+' sayısının tek mi çift mi olduğuna karar verirken hangi basamağa bakmak yeterlidir?','Birlik',semanticChoices('Birlik',['Onluk','Yüzlük'],rng),{
        taskKind:'parity-ones-place',taskLabel:'Tek–çift kararını birlik basamağına bağla',visual:{type:'base1000',...hto(chosen.n)},hint:'Yüzlük ve onlukların birlikleri tam çiftlere ayrılır.',explain:'Kararı birlik basamağı verir. '+parityPairingStatement(chosen)
      });
    }else if(task===1){
      chosen=all.find(z=>z.n===240);
      q=qBase('oddEven1000','symbol','240 sayısının birlik rakamı 0. Bu sayı nasıl sınıflandırılır?','Çift',semanticChoices('Çift',['Tek'],rng),{
        taskKind:'parity-zero-ending',taskLabel:'0 ile biten sayıyı eşleşmeyle sınıflandır',visual:{type:'parity-card',n:240,ones:0,leftover:0},hint:'Birlik kalmadığında eşsiz birlik de kalmaz.',explain:'240’ın birlik rakamı 0; eşsiz birlik kalmaz. 240 çifttir.'
      });
    }else if(task===2){
      chosen={n:249,ones:9,parity:'Tek',leftover:1};
      q=qBase('oddEven1000','symbol','248 ve 249 sayılarından hangisi tektir?','249',semanticChoices('249',['248'],rng),{
        taskKind:'parity-same-prefix',taskLabel:'Aynı yüzlük ve onlukta birlik farkını kullan',visual:{type:'sequence',items:[248,249]},hint:'Yüzlük ve onluk aynı; yalnız birlikleri karşılaştır.',explain:'248’in birlik rakamı 8 tam eşleşir; 249’un birlik rakamı 9 olduğunda 1 birlik artar. 249 tektir.'
      });
    }else{
      chosen=all.find(z=>z.n===1000);
      q=qBase('oddEven1000','symbol','1000 sayısı tek mi çifttir?','Çift',semanticChoices('Çift',['Tek'],rng),{
        taskKind:'parity-thousand',taskLabel:'1000’i tek / çift olarak sınıflandır',visual:{type:'numbercard',n:1000},hint:'1000’in birlik rakamı 0’dır.',explain:'1000’in birlik rakamı 0; eşsiz birlik kalmaz. 1000 çifttir.'
      });
    }
  }else if(sectionId==='explain-parity'){
    if(task===0){
      const answer='Onluklar ve yüzlükler tam ikişerli eşleşir; artanı birlikler belirler';
      q=qBase('oddEven1000','explain','Üç basamaklı bir sayıda tek–çift kararını neden birlik basamağı verir?',answer,semanticChoices(answer,['En büyük rakam her zaman kararı verir','Yüzlük rakamı tekse sayı mutlaka tektir','Bütün rakamlar aynı olmalıdır'],rng),{
        taskKind:'parity-explain-ones',taskLabel:'Birlik basamağı kuralını gerekçelendir',visual:{type:'base1000',...hto(573)},hint:'10 birlik tamamen ikişerli eşleşebilir.',explain:answer+'.'
      });
    }else if(task===1){
      const answer='0 birlik varsa eşsiz birlik kalmaz';
      q=qBase('oddEven1000','explain','430 neden çifttir?',answer,semanticChoices(answer,['3 tek rakam olduğu için sayı tektir','4 yüzlük olduğu için başka basamağa bakılmaz','0 sayısı hiçbir şey anlatmaz'],rng),{
        taskKind:'parity-explain-zero',taskLabel:'0 ile biten sayının neden çift olduğunu açıkla',visual:{type:'parity-card',n:430,ones:0,leftover:0},hint:'Birlik basamağında eşleştirilecek artan nesne var mı?',explain:'430’da birlik sayısı 0. Eşsiz birlik kalmaz; 430 çifttir.'
      });
    }else if(task===2){
      const answer='Bir birlik eklenince tam bir çift ya tamamlanır ya da yeni bir eşsiz birlik oluşur';
      q=qBase('oddEven1000','explain','248 çiftken 249 neden tektir?',answer,semanticChoices(answer,['Yüzlük basamağı değiştiği için','Onluk basamağı 4 olduğu için','Bütün tek sayılar 9 ile biter'],rng),{
        taskKind:'parity-explain-consecutive',taskLabel:'Ardışık sayılarda tek–çift değişimini açıkla',visual:{type:'sequence',items:[248,249]},hint:'248’in sonundaki eşleşmeye bir birlik daha ekle.',explain:answer+'.'
      });
    }else{
      const answer='İkişerli eşleştirmede artan kalmıyorsa çift, 1 artıyorsa tektir';
      q=qBase('oddEven1000','explain','Tek ve çift sayıların temel eşleştirme farkı nedir?',answer,semanticChoices(answer,['Çift sayılarda her zaman 0 rakamı vardır','Tek sayılarda yüzlük bulunmaz','Tek ve çift yalnız sayının büyüklüğünü anlatır'],rng),{
        taskKind:'parity-explain-definition',taskLabel:'Tek–çift anlamını eşleştirmeyle açıkla',visual:{type:'parity-card',n:9,ones:9,leftover:1},hint:'İkişerli eşleşmenin sonunda ne kaldığına bak.',explain:answer+'.'
      });
    }
  }else if(sectionId==='transfer-parity'){
    chosen=concept.transfer;
    const contexts=[
      chosen.n+' öğrenci ikişerli sıraya geçiyor.',
      chosen.n+' kart ikişerli zarflara yerleştiriliyor.',
      chosen.n+' çorap ikişerli çiftler hâlinde düzenleniyor.',
      chosen.n+' koltuk ikişerli yan yana gruplara ayrılıyor.'
    ];
    const answer=chosen.leftover?'Evet':'Hayır';
    q=qBase('oddEven1000','transfer',contexts[task]+' Bir tane eşsiz kalır mı?',answer,semanticChoices(answer,[answer==='Evet'?'Hayır':'Evet'],rng),{
      taskKind:'parity-transfer-'+task,taskLabel:'İkişerli eşleşmeyi yeni bağlama taşı',visual:{type:'parity-card',n:chosen.n,ones:chosen.ones,leftover:chosen.leftover},hint:'Bütün miktarı çizmek yerine birlik rakamının eşleşmesini düşün.',explain:chosen.leftover?'1 tane eşsiz kalır; sayı tektir.':'Eşsiz kalan olmaz; sayı çifttir.'
    });
  }else{
    throw new Error('Unknown oddEven1000 practice section: '+sectionId);
  }
  q.parityNumber=chosen?.n??null;
  q.parityValue=chosen?.parity??null;
  q.parityLeftover=chosen?.leftover??null;
  return q;
}



function nelComparePracticeQuestion(sectionId,taskIndex,difficulty,rng){
  const by=attribute=>nelCompareCasesFor(attribute);
  let x;
  if(sectionId==='compare-size'){
    x=by('size')[taskIndex%by('size').length];
    const expected=nelCompareExpected(x);
    return qTask('nelCompareAttributes','build','Hangisi daha büyük, yoksa aynı büyüklükte mi?',expected,{kind:'manipulative',interaction:'nel-compare-pair',expectedValue:expected,checkLabel:'Karşılaştırmamı kontrol et'},{
      taskKind:'nel-practice-compare-size-'+taskIndex,taskLabel:'Büyüklük karşılaştır',
      visual:{type:'nel-compare-builder',left:x.left,right:x.right,attribute:x.attribute,attributeLabel:x.attributeLabel,labels:x.labels,requiresAlign:false},
      hint:'Renge değil, iki nesnenin kapladığı büyüklüğe bak.',explain:nelCompareExplain(x)
    });
  }
  if(sectionId==='compare-length'){
    x=by('length')[taskIndex%by('length').length];
    const expected=nelCompareExpected(x);
    return qTask('nelCompareAttributes','see','Çubukları aynı başlangıçtan hizala ve uzunluklarını karşılaştır.',expected,{kind:'manipulative',interaction:'nel-compare-pair',expectedValue:expected,checkLabel:'Uzunlukları kontrol et'},{
      taskKind:'nel-practice-compare-length-'+taskIndex,taskLabel:'Uzunluğu hizalayarak karşılaştır',
      visual:{type:'nel-compare-builder',left:x.left,right:x.right,attribute:x.attribute,attributeLabel:x.attributeLabel,labels:x.labels,requiresAlign:true},
      hint:'Önce başlangıçları hizala; sonra hangi ucun daha ileri gittiğine bak.',explain:nelCompareExplain(x)
    });
  }
  if(sectionId==='compare-height'){
    x=by('height')[taskIndex%by('height').length];
    const answer=nelCompareAnswerLabel(x);
    return qBase('nelCompareAttributes','symbol','Kulelerin yüksekliği için doğru cümleyi göster.',answer,semanticChoices(answer,[...nelCompareChoiceLabels(x).filter(v=>v!==answer),'Karşılaştırmak için bilgi eksik'],rng),{
      taskKind:'nel-practice-compare-height-'+taskIndex,taskLabel:'Yükseklik ilişkisini göster',
      visual:{type:'nel-compare-pair',left:x.left,right:x.right,attribute:x.attribute,attributeLabel:x.attributeLabel,aligned:true},
      hint:'Tabanları aynı çizgide düşün ve tepelere bak.',explain:nelCompareExplain(x)
    });
  }
  if(sectionId==='explain-compare'){
    const attrs=['size','length','height'];
    x=by(attrs[taskIndex%attrs.length])[taskIndex%3];
    if(taskIndex%2===0){
      const answer=x.attributeAnswer;
      const wrong=[...['Büyüklüklerine göre','Uzunluklarına göre','Yüksekliklerine göre'].filter(v=>v!==answer),'Renklerine göre'];
      return qBase('nelCompareAttributes','explain','Bu iki nesneyi hangi özelliklerine göre karşılaştırıyoruz?',answer,semanticChoices(answer,wrong,rng),{
        taskKind:'nel-practice-explain-attribute-'+taskIndex,taskLabel:'Karşılaştırma özelliğini adlandır',
        visual:{type:'nel-compare-pair',left:x.left,right:x.right,attribute:x.attribute,attributeLabel:x.attributeLabel,aligned:true},
        hint:'Renk veya nesne türü yerine ölçülen ortak özelliği söyle.',explain:answer+' karşılaştırıyoruz.'
      });
    }
    const lengthCase=by('length')[taskIndex%by('length').length];
    const answer='Başlangıçlarını aynı hizaya getirmek gerekir.';
    return qBase('nelCompareAttributes','explain','İki uzunluğu adil karşılaştırmadan önce ne yapmalıyız?',answer,semanticChoices(answer,['Renklerini aynı yapmak gerekir.','Birini daha yakına getirmek gerekir.','Nesnelerin adını değiştirmek gerekir.'],rng),{
      taskKind:'nel-practice-explain-fair-'+taskIndex,taskLabel:'Adil uzunluk karşılaştırmasını açıkla',
      visual:{type:'nel-compare-pair',left:lengthCase.left,right:lengthCase.right,attribute:'length',attributeLabel:'uzunluk',aligned:false},
      hint:'Başlangıç noktaları farklıysa gözün yanıltılabilir.',explain:answer
    });
  }
  if(sectionId==='transfer-compare'){
    const attrs=['size','length','height'];
    x=by(attrs[taskIndex%attrs.length])[(taskIndex+1)%3];
    const answer=nelCompareAnswerLabel(x);
    const context=x.attribute==='length'?'İki kurdele':x.attribute==='height'?'İki kule':'İki oyuncak';
    return qBase('nelCompareAttributes','transfer',context+' için '+x.attributeLabel+' özelliğini karşılaştır. Hangisini söylersin?',answer,semanticChoices(answer,[...nelCompareChoiceLabels(x).filter(v=>v!==answer),'Karşılaştırmak için bilgi eksik'],rng),{
      taskKind:'nel-practice-transfer-compare-'+taskIndex,taskLabel:'Karşılaştırmayı günlük nesnelere taşı',
      visual:{type:'nel-compare-context',left:x.left,right:x.right,attribute:x.attribute,attributeLabel:x.attributeLabel,aligned:true},
      hint:'Yalnız seçilen '+x.attributeLabel+' özelliğine bak.',explain:nelCompareExplain(x)
    });
  }
  throw new Error('Unknown nelCompareAttributes practice section: '+sectionId);
}

function nelSortPracticeQuestion(sectionId,taskIndex,difficulty,rng){
  const cases=nelSortCases();
  const caseFor=attribute=>cases.find(c=>c.attribute===attribute)||cases[0];
  let x;

  if(sectionId==='sort-colour-shape'){
    x=taskIndex%2===0?caseFor('tone'):caseFor('shape');
    const expected=nelSortExpected(x);
    return qTask('nelSortAttributes','build','Nesneleri '+x.attributeLabel+' özelliğine göre sınıfla.',expected,{kind:'manipulative',interaction:'nel-sort-bin',expectedValue:expected,checkLabel:'Sınıflamamı kontrol et'},{
      taskKind:'nel-practice-sort-colour-shape-'+taskIndex,taskLabel:'Renk veya şekle göre sınıfla',
      visual:{type:'nel-sort-builder',attribute:x.attribute,attributeLabel:x.attributeLabel,bins:x.bins,items:x.items},
      hint:'Bu görevde yalnız '+x.attributeLabel+' özelliğini kullan.',explain:'Gruplar '+x.ruleLabel.toLowerCase()+' oluşturuldu.'
    });
  }

  if(sectionId==='sort-size-measure'){
    const attrs=['size','length','height'];
    x=caseFor(attrs[taskIndex%attrs.length]);
    if(taskIndex%2===0){
      const expected=nelSortExpected(x);
      return qTask('nelSortAttributes','see','Nesneleri '+x.attributeLabel+' özelliğine göre iki gruba ayır.',expected,{kind:'manipulative',interaction:'nel-sort-bin',expectedValue:expected,checkLabel:'Gruplarımı kontrol et'},{
        taskKind:'nel-practice-sort-size-measure-'+taskIndex,taskLabel:'Büyüklük veya ölçü özelliğine göre sınıfla',
        visual:{type:'nel-sort-builder',attribute:x.attribute,attributeLabel:x.attributeLabel,bins:x.bins,items:x.items},
        hint:'Nesnelerin '+x.attributeLabel+' özelliğini karşılaştır.',explain:'Gruplama '+x.ruleLabel.toLowerCase()+' yapıldı.'
      });
    }
    return qBase('nelSortAttributes','see','Bu gruplama hangi özelliğe göre yapılmış?',x.ruleLabel,semanticChoices(x.ruleLabel,nelSortRuleDistractors(x.ruleLabel),rng),{
      taskKind:'nel-practice-see-rule-'+taskIndex,taskLabel:'Sınıflama kuralını gör',
      visual:{type:'nel-sort-display',attribute:x.attribute,bins:x.bins,items:x.items},
      hint:'Aynı kutudaki nesnelerin ortak yönünü ara.',explain:'Kural '+x.ruleLabel.toLowerCase()+'.'
    });
  }

  if(sectionId==='resort-new-rule'){
    const first=caseFor('tone'), second=caseFor('shape');
    const useSecond=taskIndex%2===0;
    x=useSecond?second:first;
    const expected=nelSortExpected(x);
    return qTask('nelSortAttributes','symbol','Aynı nesneleri bu kez '+x.attributeLabel+' özelliğine göre yeniden sınıfla.',expected,{kind:'manipulative',interaction:'nel-sort-bin',expectedValue:expected,checkLabel:'Yeni gruplarımı kontrol et'},{
      taskKind:'nel-practice-resort-'+taskIndex,taskLabel:'Aynı nesneleri yeni kuralla yeniden sınıfla',
      visual:{type:'nel-sort-builder',attribute:x.attribute,attributeLabel:x.attributeLabel,bins:x.bins,items:x.items},
      hint:'Eski kuralı bırak; şimdi yalnız '+x.attributeLabel+' özelliğine bak.',explain:'Aynı nesneler başka bir ortak özelliğe göre yeniden sınıflanabilir.'
    });
  }

  if(sectionId==='explain-sort-rule'){
    if(taskIndex%2===0){
      x=cases[taskIndex%cases.length];
      return qBase('nelSortAttributes','explain','Bu gruplamanın kuralını nasıl anlatırsın?',x.ruleLabel,semanticChoices(x.ruleLabel,nelSortRuleDistractors(x.ruleLabel),rng),{
        taskKind:'nel-practice-explain-rule-'+taskIndex,taskLabel:'Sınıflama kuralını söyle',
        visual:{type:'nel-sort-display',attribute:x.attribute,bins:x.bins,items:x.items},
        hint:'Kutuların içindeki ortak özelliği adlandır.',explain:'Bu gruplama '+x.ruleLabel.toLowerCase()+' yapılmış.'
      });
    }
    const answer='Aynı nesnelerin birden fazla özelliği vardır.';
    return qBase('nelSortAttributes','explain','Aynı nesneleri renklerine göre de şekillerine göre de sınıflayabilmemizin nedeni nedir?',answer,semanticChoices(answer,['Her nesne yalnız bir gruba girebilir.','Sınıflama kuralı rastgele seçilir.','Renk ile şekil aynı özelliktir.'],rng),{
      taskKind:'nel-practice-explain-flexibility-'+taskIndex,taskLabel:'Farklı sınıflama kurallarını açıkla',
      visual:{type:'nel-sort-two-rules',first:caseFor('tone'),second:caseFor('shape')},
      hint:'Bir nesnenin aynı anda hem rengi hem şekli vardır.',explain:answer
    });
  }

  if(sectionId==='transfer-sort'){
    x=cases[(taskIndex+2)%cases.length];
    const expected=nelSortExpected(x);
    return qTask('nelSortAttributes','transfer','Oyun sonrası nesneleri '+x.attributeLabel+' özelliğine göre kutulara yerleştir.',expected,{kind:'manipulative',interaction:'nel-sort-bin',expectedValue:expected,checkLabel:'Düzenimi kontrol et'},{
      taskKind:'nel-practice-transfer-sort-'+taskIndex,taskLabel:'Sınıflamayı günlük düzenlemeye taşı',
      visual:{type:'nel-sort-builder',context:'cleanup',attribute:x.attribute,attributeLabel:x.attributeLabel,bins:x.bins,items:x.items},
      hint:'Her kutu için tek bir ortak özellik kullan.',explain:'Sınıflama günlük eşyaları düzenlemek için de kullanılabilir.'
    });
  }

  throw new Error('Unknown nelSortAttributes practice section: '+sectionId);
}

function nelMatchPracticeQuestion(sectionId,taskIndex,difficulty,rng){
  const cases=nelMatchCases();
  const by=attribute=>cases.filter(c=>c.attribute===attribute);
  let x;
  if(sectionId==='match-exact'){
    x=by('exact')[0];
    return qTask('nelMatchAttributes','build','Aynı nesneyi bulup eşleştir.',x.answer.id,{kind:'manipulative',interaction:'nel-match-pair',expectedValue:x.answer.id,checkLabel:'Eşimi kontrol et'},{
      taskKind:'nel-practice-exact-'+taskIndex,taskLabel:'Aynı nesneyi eşleştir',visual:{type:'nel-match-builder',target:x.target,options:x.options,attribute:'exact'},
      hint:'Renk, şekil ve büyüklüğün hepsi aynı olmalı.',explain:nelMatchReason('exact')
    });
  }
  if(sectionId==='match-colour-shape'){
    x=taskIndex%2===0?by('tone')[0]:by('shape')[0];
    return qTask('nelMatchAttributes','see','Aynı '+x.attributeLabel+' olanı bul.','correct',{kind:'visual-choice',options:x.options.map(item=>({value:item.id===x.answer.id?'correct':item.id,visual:{type:'nel-match-token',item}}))},{
      taskKind:'nel-practice-colour-shape-'+taskIndex,taskLabel:'Renk veya şekil eşini bul',visual:{type:'nel-match-target',target:x.target,attributeLabel:x.attributeLabel},
      hint:'Bu görevde yalnız '+x.attributeLabel+' önemli.',explain:nelMatchReason(x.attribute)
    });
  }
  if(sectionId==='match-size-measure'){
    const attrs=['size','length','height'];
    const attr=attrs[taskIndex%attrs.length];
    x=by(attr)[0];
    return qTask('nelMatchAttributes','symbol','Aynı '+x.attributeLabel+' olanı göster.','correct',{kind:'visual-choice',options:x.options.map(item=>({value:item.id===x.answer.id?'correct':item.id,visual:{type:'nel-match-token',item}}))},{
      taskKind:'nel-practice-size-measure-'+taskIndex,taskLabel:'Büyüklük, uzunluk veya yükseklik eşini göster',visual:{type:'nel-match-target',target:x.target,attributeLabel:x.attributeLabel},
      hint:'Hedefin '+x.attributeLabel+' ile seçenekleri karşılaştır.',explain:nelMatchReason(x.attribute)
    });
  }
  if(sectionId==='explain-match'){
    x=cases[taskIndex%cases.length];
    const answer=nelMatchReason(x.attribute);
    const wrong=cases.filter(z=>z.attribute!==x.attribute).map(z=>nelMatchReason(z.attribute));
    return qBase('nelMatchAttributes','explain','Bu eşleştirmeyi hangi ortak özellik açıklar?',answer,semanticChoices(answer,wrong,rng),{
      taskKind:'nel-practice-explain-'+taskIndex,taskLabel:'Ortak özelliği söyle',visual:{type:'nel-match-pair-card',left:x.target,right:x.answer},
      hint:'Renk, şekil, büyüklük, uzunluk veya yüksekliği karşılaştır.',explain:answer
    });
  }
  if(sectionId==='transfer-match'){
    x=cases[(taskIndex+1)%cases.length];
    return qTask('nelMatchAttributes','transfer','Günlük bir kutuda hedefle aynı '+x.attributeLabel+' olan eşi seç.','correct',{kind:'visual-choice',options:x.options.map(item=>({value:item.id===x.answer.id?'correct':item.id,visual:{type:'nel-match-token',item}}))},{
      taskKind:'nel-practice-transfer-'+taskIndex,taskLabel:'Eşleştirmeyi yeni nesnelere taşı',visual:{type:'nel-match-context',target:x.target,attributeLabel:x.attributeLabel},
      hint:'Nesne değişse de ortak özellik aynı kalabilir.',explain:nelMatchReason(x.attribute)
    });
  }
  throw new Error('Unknown nelMatchAttributes practice section: '+sectionId);
}

export function generateLessonPracticeQuestion(skillId,sectionId,taskIndex,difficulty=1,rng=Math.random){
  let q;
  if(skillId==='nelCompareAttributes') q=nelComparePracticeQuestion(sectionId,taskIndex,difficulty,rng);
  else if(skillId==='nelSortAttributes') q=nelSortPracticeQuestion(sectionId,taskIndex,difficulty,rng);
  else if(skillId==='nelMatchAttributes') q=nelMatchPracticeQuestion(sectionId,taskIndex,difficulty,rng);
  else if(skillId==='number1000') q=number1000PracticeQuestion(sectionId,taskIndex,difficulty,rng);
  else if(skillId==='compareOrder1000') q=compareOrderPracticeQuestion(sectionId,taskIndex,difficulty,rng);
  else if(skillId==='numberPattern1000') q=numberPattern1000PracticeQuestion(sectionId,taskIndex,difficulty,rng);
  else if(skillId==='oddEven1000') q=oddEvenPracticeQuestion(sectionId,taskIndex,difficulty,rng);
  else throw new Error('No section practice generator for '+skillId+'/'+sectionId);
  return lessonPracticeFinalize(q,sectionId,taskIndex);
}
export function generateLearningQuestion(skillId,phase,representation,difficulty=1,rng=Math.random,conceptInstance=null,options={}){
  let q;
  if(phase==='readiness') q=generateReadinessQuestion(skillId,difficulty,rng,options);
  else if(skillId==='number1000') q=generateNumber1000LearningQuestion(phase,representation,difficulty,rng,conceptInstance,options);
  else q=generateQuestion(skillId,representation,difficulty,rng,conceptInstance);
  if(phase==='practice') q=varyPracticePrompt(q,skillId,representation,options.practiceIndex??0);
  q.learningPhase=phase||null;
  if(phase==='readiness') q.countsTowardEvidence=false;
  if(phase==='retrieval') q.retentionProbe=true;
  q.id ||= `${skillId}:${phase||representation}:${Date.now()}:${Math.floor(rng()*1e6)}`;
  return q;
}

export function selectNextSkill(state, session, now=Date.now(), rng=Math.random){
  const candidates=skillsFor(state.profile);
  const due=state.reviewQueue
    .filter(item => item.dueAt <= now || (item.dueQuestion!=null && item.dueQuestion <= session.questionIndex))
    .sort((a,b)=>(a.dueAt||0)-(b.dueAt||0))[0];
  if(due){
    const s=candidates.find(x=>x.id===due.skillId);
    if(s && curriculumSkillUnlocked(state,s.id)) return {skill:s, representation:due.representation || recommendedRepresentation(ensureSkillState(state,s.id)), reviewItem:due};
  }
  const curriculumCurrent=currentCurriculumSkill(state);
  if(curriculumCurrent){
    const ss=ensureSkillState(state,curriculumCurrent.id);
    return {skill:curriculumCurrent,representation:recommendedRepresentation(ss),reviewItem:null};
  }
  const ready=candidates.filter(s=>prerequisitesReady(state,s));
  const ranked=ready.map(s=>{
    const ss=ensureSkillState(state,s.id);
    const mastery=masteryPercent(ss);
    const recency=ss.lastSeen ? Math.min(1,(now-ss.lastSeen)/(1000*60*60*24*3)) : 1;
    const novelty=ss.totalAttempts===0?1:0;
    const fatiguePenalty=session.recentSkillIds?.slice(-2).filter(x=>x===s.id).length || 0;
    const dependents=candidates.filter(x=>x.prerequisite?.includes(s.id)).length;
    // Yeni profilde önce başka becerilerin de önünü açan temel kavramları öne al.
    // Bu, rastgele ilk oturum yerine gelişimsel bir giriş sağlar; oturumlar ilerledikçe ağırlığı kaybolur.
    const foundationBonus=ss.totalAttempts===0?dependents*3.5:0;
    const score=(100-mastery)*0.55 + recency*18 + novelty*20 + foundationBonus - fatiguePenalty*18 + rng()*4;
    return {s,score,rep:recommendedRepresentation(ss)};
  }).sort((a,b)=>b.score-a.score);
  const chosen=ranked[0] || {s:candidates[0],rep:'build'};
  return {skill:chosen.s, representation:chosen.rep, reviewItem:null};
}

const CONCEPT_KEYS={
  nelMatchAttributes:'nel-matching-by-attribute',
  nelSortAttributes:'nel-sorting-by-attribute',
  nelCompareAttributes:'nel-comparing-by-attribute',
  number20:'number-to-20',numberBonds10:'number-bonds-to-10',make10:'make-ten',add20:'addition-strategy-within-20',addMany1:'multi-addend-within-20',sub20:'subtraction-strategy-within-20',
  equality:'equality-and-fact-family',word1:'one-step-problem-structures',number100:'numbers-to-100-place-value',compareOrder100:'compare-order-to-100',ordinal10:'ordinal-position-to-10',
  numberPattern1:'one-ten-more-less-patterns',addSub100:'addition-subtraction-within-100',multiply40:'equal-groups-multiplication',divide20g1:'sharing-grouping-division',money1:'money-value-and-exchange',
  lengthCompare1:'centimetre-length-comparison',lengthMeasure1:'centimetre-length-measurement',time1:'time-five-minutes-period-duration',shapes1:'shape-properties',shapePattern1:'shape-composition-and-copying',data1:'pictograph-data',
  number1000:'numbers-to-1000-place-value',compareOrder1000:'compare-order-to-1000',numberPattern1000:'one-ten-hundred-patterns-to-1000',oddEven1000:'odd-even-pairing-to-1000',addSub1000:'addition-subtraction-within-1000',wordAddSub2:'one-two-step-add-sub-problems',
  times23510:'tables-2-3-4-5-10',divisionTables2:'division-symbol-within-tables',multDivFamilies2:'multiplication-division-fact-families',
  lengthMetre2:'length-in-metres',massMetric2:'mass-grams-kilograms',volumeLitre2:'liquid-volume-litres',timeMinute2:'time-to-the-minute',timeDuration2:'hours-minutes-duration-conversion',moneyP2:'money-decimal-cents-conversion',
  shapePatterns2:'p2-shape-pattern-attributes',solids2:'p2-solid-identify-classify',pictureGraphScale2:'p2-scaled-picture-graphs',
  fractionMeaning2:'fraction-equal-parts-whole',fractionNotation2:'fraction-notation-representation',fractionCompare2:'fraction-compare-unit-like',fractionAddSub2:'fraction-like-add-sub',
  shapes2:'solid-properties-and-invariance'
};

export function generateQuestion(skillId, representation, difficulty=1, rng=Math.random, conceptInstance=null){
  const gen=GENERATORS[skillId];
  if(!gen) throw new Error(`No generator for ${skillId}`);
  const q=gen(representation,clamp(difficulty,1,4),rng,conceptInstance);
  q.response ||= {kind:'choice',options:(q.choices||[]).map(value=>({value:String(value),label:String(value)}))};
  q.taskKind ||= q.response.kind;
  q.conceptKey ||= conceptInstance?.conceptKey || CONCEPT_KEYS[skillId] || null;
  q.id=`${skillId}:${representation}:${Date.now()}:${Math.floor(rng()*1e6)}`;
  return q;
}

export function applyAnswer(state, question, {correct, usedHint=false, isDelayedReview=false, now=Date.now(), sessionQuestionIndex=0}){
  const ss=ensureSkillState(state,question.skillId);
  const lc=ensureLearningCycleState(ss);
  const phase=question.learningPhase||null;
  const countsTowardEvidence=question.countsTowardEvidence!==false;
  const ev=countsTowardEvidence?ss.evidence[question.representation]:null;

  if(phase && lc.phases[phase]){
    const pe=lc.phases[phase];
    pe.attempts=(pe.attempts||0)+1;
    if(correct) pe.correct=(pe.correct||0)+1;
    pe.lastSeen=now;
    if(phase==='readiness'){
      if(question.taskKind==='readiness-support') lc.readinessSupportUsed=true;
      if(!correct) lc.readinessNeedsSupport=true;
      else if(question.taskKind==='readiness-support' || !lc.readinessSupportUsed) lc.readinessNeedsSupport=false;
    }
    if(phase==='practice'){
      lc.practiceAttempts=(lc.practiceAttempts||0)+1;
      if(correct) lc.practiceCorrect=(lc.practiceCorrect||0)+1;
    }
    if(phase==='retrieval'){
      lc.retrievalAttempts=(lc.retrievalAttempts||0)+1;
      if(correct){
        lc.retrievalSuccesses=(lc.retrievalSuccesses||0)+1;
        lc.retrievalDueAt=0;
      }else{
        lc.retrievalDueAt=now+1000*60*60*20;
        const existingRetry=state.reviewQueue.some(item=>item.skillId===question.skillId&&item.stage==='next-day'&&item.dueAt>now);
        if(!existingRetry) state.reviewQueue.push({
          id:`retention-retry:${question.skillId}:${now}`,
          skillId:question.skillId,
          representation:question.representation==='symbol'?'transfer':'symbol',
          phase:'retrieval',
          dueAt:lc.retrievalDueAt,
          stage:'next-day'
        });
      }
    }
  }

  if(countsTowardEvidence){
    const gain=correct ? (usedHint?.08:.14) : -.10;
    ev.score=clamp((ev.score || 0)+gain,0,1);
    ev.attempts=(ev.attempts||0)+1;
    if(correct) ev.correct=(ev.correct||0)+1;
    ev.lastSeen=now;
    ss.totalAttempts=(ss.totalAttempts||0)+1;
    if(correct) ss.totalCorrect=(ss.totalCorrect||0)+1;
    ss.lastSeen=now;
    if(isDelayedReview){
      ss.delayedAttempts=(ss.delayedAttempts||0)+1;
      if(correct) ss.delayedSuccesses=(ss.delayedSuccesses||0)+1;
    }

    // Difficulty changes slowly. A young learner should not jump levels after a short lucky streak.
    const skillHistory=state.history.filter(h=>h.skillId===question.skillId && h.countsTowardEvidence!==false).slice(-5);
    const window=[...skillHistory.map(h=>h.correct), correct];
    const recentAccuracy=window.filter(Boolean).length / window.length;
    const sinceChange=ss.totalAttempts-(ss.lastDifficultyChangeAttempt||0);
    if(window.length>=6 && sinceChange>=5){
      if(recentAccuracy>=.83 && (ss.difficulty||1)<4){ ss.difficulty+=1; ss.lastDifficultyChangeAttempt=ss.totalAttempts; }
      else if(recentAccuracy<=.45 && (ss.difficulty||1)>1){ ss.difficulty-=1; ss.lastDifficultyChangeAttempt=ss.totalAttempts; }
    }
    ss.stable=computeStable(ss);
  }

  if(phase){
    if(question.cycleFinal && correct){
      lc.firstCycleCompletedAt ||= now;
      lc.lastCycleAt=now;
      lc.status='consolidating';
      lc.retrievalDueAt=now+1000*60*60*20;
    } else if(!lc.firstCycleCompletedAt){
      lc.status='learning';
    }
    if(phase==='retrieval'){
      lc.status=(ss.stable && correct)?'secure':'consolidating';
    }
  }

  state.totals.attempts=(state.totals.attempts||0)+1;
  if(correct) state.totals.correct=(state.totals.correct||0)+1;
  state.history.push({
    at:now,skillId:question.skillId,representation:question.representation,
    learningPhase:phase,taskKind:question.taskKind||null,conceptKey:question.conceptKey||null,
    readinessSourceSkillId:question.readinessSourceSkillId||null,
    responseKind:question.response?.kind||null,correct,usedHint,delayed:isDelayedReview,
    countsTowardEvidence
  });
  if(state.history.length>250) state.history=state.history.slice(-250);

  if(!correct){
    const bridgeMap={build:'see',see:'build',symbol:'see',explain:'see',transfer:'build'};
    const readiness=phase==='readiness';
    const alreadySupport=readiness && question.taskKind==='readiness-support';
    const alreadyCompletionRecovery=!!question.completionRecovery;
    if(!alreadySupport && !alreadyCompletionRecovery){
      const completionRecovery=!!question.cycleFinal;
      const immediate=readiness||completionRecovery||!!phase;
      const alternative=readiness?'build':(bridgeMap[question.representation]||'see');
      state.reviewQueue.push({
        id:`review:${question.id}`,
        skillId:question.skillId,
        representation:alternative,
        phase:readiness?'readiness':'practice',
        readinessSourceSkillId:readiness?(question.readinessSourceSkillId||null):null,
        support:readiness,
        completeCycleOnSuccess:completionRecovery,
        dueQuestion:immediate?sessionQuestionIndex:sessionQuestionIndex+3,
        dueAt:immediate?now:now+1000*60*3,
        stage:'same-session'
      });
    }
  }

  if(question.cycleFinal && correct){
    const existing=state.reviewQueue.some(x=>x.skillId===question.skillId && x.stage==='next-day');
    if(!existing) state.reviewQueue.push({
      id:`retention:${question.skillId}:${now}`,
      skillId:question.skillId,
      representation:question.representation==='symbol'?'transfer':'symbol',
      phase:'retrieval',
      dueAt:lc.retrievalDueAt,
      stage:'next-day'
    });
  } else if(!phase && countsTowardEvidence && correct && ev.attempts>=2 && ev.score>=.55){
    // Legacy skills keep the old retention rule until they are migrated to the learning-cycle contract.
    const existing=state.reviewQueue.some(x=>x.skillId===question.skillId && x.stage==='next-day');
    if(!existing) state.reviewQueue.push({
      id:`retention:${question.skillId}:${now}`,
      skillId:question.skillId,
      representation:question.representation==='symbol'?'transfer':'symbol',
      dueAt:now+1000*60*60*20,
      stage:'next-day'
    });
  }
  return ss;
}


export function consumeReview(state, reviewItem){
  if(!reviewItem) return;
  state.reviewQueue=state.reviewQueue.filter(x=>x.id!==reviewItem.id);
}

export function profileSummary(state){
  const skills=skillsFor(state.profile).map(s=>({skill:s,state:ensureSkillState(state,s.id)}));
  const avg=skills.length?skills.reduce((sum,x)=>sum+masteryPercent(x.state),0)/skills.length:0;
  const stable=skills.filter(x=>x.state.stable).length;
  const strongest=[...skills].sort((a,b)=>masteryPercent(b.state)-masteryPercent(a.state))[0];
  const focus=[...skills].sort((a,b)=>masteryPercent(a.state)-masteryPercent(b.state))[0];
  return {avg:Math.round(avg),stable,total:skills.length,strongest,focus};
}

export function representationGap(skillState){
  const rows=REPRESENTATIONS.map(r=>({rep:r,score:skillState.evidence[r]?.score||0,attempts:skillState.evidence[r]?.attempts||0}));
  rows.sort((a,b)=>a.score-b.score || a.attempts-b.attempts);
  return rows[0];
}
