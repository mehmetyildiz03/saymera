export const REPRESENTATIONS = ['build','see','symbol','explain','transfer'];
export const REPRESENTATION_META = {
  build: { label: 'Kur', icon: '◫', short: 'Nesneyle kur' },
  see: { label: 'Gör', icon: '◉', short: 'Görselde gör' },
  symbol: { label: 'Yaz', icon: '＝', short: 'Sembolleştir' },
  explain: { label: 'Anlat', icon: '◌', short: 'Düşünceni seç' },
  transfer: { label: 'Taşı', icon: '↗', short: 'Yeni durumda kullan' },
};

export const PROFILE_META = {
  preschool: { label: 'Okul öncesi', age: '4–6 yaş', effortBudget: 5.5, cooldownMinutes: 5 },
  grade1: { label: '1. sınıf', age: '6–7 yaş', effortBudget: 6.5, cooldownMinutes: 5 },
  grade2: { label: '2. sınıf', age: '7–8 yaş', effortBudget: 7.5, cooldownMinutes: 7 },
};

const skill = (id, profile, label, family, accent, prerequisite = []) => ({ id, profile, label, family, accent, prerequisite });
export const SKILLS = [
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

  skill('place100','grade2','Onluk–birlik','Sayı sistemi','amber'),
  skill('add100','grade2','100 içinde toplama','İşlemler','blue',['place100']),
  skill('sub100','grade2','100 içinde çıkarma','İşlemler','violet',['place100']),
  skill('multiply5','grade2','Gruplarla çarpma','Çarpma','green',['add100']),
  skill('divide20','grade2','Paylaştırarak bölme','Bölme','teal',['multiply5']),
  skill('fraction','grade2','Yarım ve çeyrek','Kesir','rose'),
  skill('word2','grade2','İki ilişkiyi birleştiren problem','Problem çözme','navy',['add100','sub100']),
  skill('numberPattern2','grade2','Sayı örüntülerini sürdürme','Örüntü','navy',['place100']),
  skill('shapes2','grade2','Şekil ve cisim ilişkileri','Geometri','rose'),
  skill('lengthCm','grade2','Santimetre ile ölçme','Ölçme','green'),
  skill('time2','grade2','Saat ve yarım saat','Zaman','violet'),
  skill('moneyTL','grade2','Lira ile para problemleri','Para','teal',['add100']),
  skill('data2','grade2','Sütun grafiğini yorumlama','Veri','amber',['place100']),
];

export function skillsFor(profile){ return SKILLS.filter(s => s.profile === profile); }

function defaultEvidence(){
  return Object.fromEntries(REPRESENTATIONS.map(r => [r,{score:0, attempts:0, correct:0, lastSeen:0}]));
}
export function makeSkillState(){
  return { evidence: defaultEvidence(), totalAttempts:0, totalCorrect:0, difficulty:1, lastDifficultyChangeAttempt:0, delayedSuccesses:0, delayedAttempts:0, lastSeen:0, stable:false };
}
export function defaultState(){
  return {
    version: 2,
    profile: 'grade1',
    childName: '',
    onboarded: false,
    settings: { voice:true, calmMotion:false, cooldownMinutes:null, dailyMinutes:20 },
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
      const period=((hour+minute/5)%2===0)?'ÖÖ':'ÖS';
      const intl=period==='ÖÖ'?'a.m.':'p.m.';
      const duration=((hour+minute/5)%3===0)?60:30;
      out.push({hour,minute,label:`${hour}:${String(minute).padStart(2,'0')}`,period,intl,duration});
    }
  }
  return out;
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
  n=Number(n); if(n<10) return ones[n]; if(n===100) return 'yüz';
  const t=Math.floor(n/10), o=n%10; return `${tens[t]}${o?' '+ones[o]:''}`;
}

export function createConceptInstance(skillId,difficulty=1,rng=Math.random){
  const d=clamp(difficulty,1,4);
  const make=(conceptKey,cases)=>{
    const [anchor,symbol,transfer]=pickDifferent(cases,3,rng);
    return {version:2,skillId,conceptKey,difficulty:d,anchor,symbol,transfer};
  };
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
  if(skillId==='shapes2') return make('solid-properties-and-invariance',shapes2Cases());
  return null;
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
      taskKind:'reasoning-choice',taskLabel:'Algoritmanın nedenini açıkla',visual:{type:'column-operation',a:x.a,b:x.b,op:x.op},hint:'Standart algoritma basamak değerinin görsel bir kısaltmasıdır.',explain:answer+'.'
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
  const addMinutes=(z,delta)=>{
    const total=((z.hour%12)*60+z.minute+delta)%(12*60);
    const hour=(Math.floor(total/60)||12), minute=total%60;
    return {hour,minute,label:`${hour}:${String(minute).padStart(2,'0')}`};
  };
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
  const y=c.transfer, end=addMinutes(y,y.duration);
  return qBase('time1',rep,`Bir etkinlik ${y.label} ${y.period} (${y.intl}) başlıyor ve ${y.duration===60?'1 saat (1 h)':'yarım saat (30 min)'} sürüyor. Bitiş saati hangisidir?`,end.label,semanticChoices(end.label,[addMinutes(y,y.duration-5).label,addMinutes(y,y.duration+5).label,addMinutes(y,y.duration===60?30:60).label],rng), {
    taskKind:'context-transfer',taskLabel:'Saati süre ve günlük programa taşı',visual:{type:'schedule-event',label:`${y.label} ${y.period}`,event:y.duration===60?'1 saatlik etkinlik':'yarım saatlik etkinlik'},hint:`Başlangıç zamanına ${y.duration} dakika ekle.`,explain:`${y.label} + ${y.duration} dakika = ${end.label}. ${y.period}, ${y.intl} anlamına gelir.`
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
  const y=c.transfer;
  const cases=shapePatternCases(), distractors=shuffled(cases.filter(z=>z.copy!==y.copy),rng).slice(0,2);
  const opts=shuffled([y,...distractors].map(z=>({value:z.copy,visual:{type:'dot-grid-figure',figure:z.copy},ariaLabel:`nokta ızgarada ${z.name}`})),rng);
  return qTask('shapePattern1',rep,'Örnekteki figürü nokta ızgarada aynı düzenle kopyalayan çalışma hangisi?',y.copy,{kind:'visual-choice',options:opts}, {
    taskKind:'context-transfer',taskLabel:'Şekil düzenini ızgaraya kopyala',visual:{type:'composite-figure',figure:y.id,pieces:y.pieces},hint:'Parçaların yalnız adını değil, göreli konumlarını ve yönlerini de koru.',explain:`Doğru kopya ${y.name} figürünün parça düzenini korur.`
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
      taskKind:'reasoning-choice',taskLabel:'Grafik sonucunu kanıtla gerekçelendir',visual:{type:'pictograph',cats:x.cats,vals:x.vals,orientation:'horizontal'},hint:'Kategori adından değil sembol sayısından kanıt bul.',explain:`${x.cats[x.maxIndex]} için ${x.max} sembol var ve bu en yüksek frekans.`
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
  subitize5:genSubitize,count10:genCount10,compare10:genCompare10,partwhole5:genPartWhole5,patternAB:genPattern,shapesBasic:genShapesBasic,sortAttribute:genSortAttribute,positionWords:genPositionWords,
  number20:genNumber20,numberBonds10:genNumberBonds10,make10:genMake10,add20:genAdd20,addMany1:genAddMany1,sub20:genSub20,equality:genEquality,word1:genWord1,
  number100:genNumber100,compareOrder100:genCompareOrder100,ordinal10:genOrdinal10,numberPattern1:genNumberPattern1,addSub100:genAddSub100,multiply40:genMultiply40,divide20g1:genDivide20G1,money1:genMoney1,
  lengthCompare1:genLengthCompare1,lengthMeasure1:genLengthMeasure1,time1:genTime1,shapes1:genShapes1,shapePattern1:genShapePattern1,data1:genData1,
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

export function selectNextSkill(state, session, now=Date.now(), rng=Math.random){
  const candidates=skillsFor(state.profile);
  const due=state.reviewQueue
    .filter(item => item.dueAt <= now || (item.dueQuestion!=null && item.dueQuestion <= session.questionIndex))
    .sort((a,b)=>(a.dueAt||0)-(b.dueAt||0))[0];
  if(due){
    const s=candidates.find(x=>x.id===due.skillId);
    if(s) return {skill:s, representation:due.representation || recommendedRepresentation(ensureSkillState(state,s.id)), reviewItem:due};
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
  number20:'number-to-20',numberBonds10:'number-bonds-to-10',make10:'make-ten',add20:'addition-strategy-within-20',addMany1:'multi-addend-within-20',sub20:'subtraction-strategy-within-20',
  equality:'equality-and-fact-family',word1:'one-step-problem-structures',number100:'numbers-to-100-place-value',compareOrder100:'compare-order-to-100',ordinal10:'ordinal-position-to-10',
  numberPattern1:'one-ten-more-less-patterns',addSub100:'addition-subtraction-within-100',multiply40:'equal-groups-multiplication',divide20g1:'sharing-grouping-division',money1:'money-value-and-exchange',
  lengthCompare1:'centimetre-length-comparison',lengthMeasure1:'centimetre-length-measurement',time1:'time-five-minutes-period-duration',shapes1:'shape-properties',shapePattern1:'shape-composition-and-copying',data1:'pictograph-data',
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
  const ev=ss.evidence[question.representation];
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
  const skillHistory=state.history.filter(h=>h.skillId===question.skillId).slice(-5);
  const window=[...skillHistory.map(h=>h.correct), correct];
  const recentAccuracy=window.filter(Boolean).length / window.length;
  const sinceChange=ss.totalAttempts-(ss.lastDifficultyChangeAttempt||0);
  if(window.length>=6 && sinceChange>=5){
    if(recentAccuracy>=.83 && (ss.difficulty||1)<4){ ss.difficulty+=1; ss.lastDifficultyChangeAttempt=ss.totalAttempts; }
    else if(recentAccuracy<=.45 && (ss.difficulty||1)>1){ ss.difficulty-=1; ss.lastDifficultyChangeAttempt=ss.totalAttempts; }
  }
  ss.stable=computeStable(ss);
  state.totals.attempts=(state.totals.attempts||0)+1;
  if(correct) state.totals.correct=(state.totals.correct||0)+1;
  state.history.push({at:now,skillId:question.skillId,representation:question.representation,taskKind:question.taskKind||null,conceptKey:question.conceptKey||null,responseKind:question.response?.kind||null,correct,usedHint,delayed:isDelayedReview});
  if(state.history.length>250) state.history=state.history.slice(-250);

  if(!correct){
    const bridgeMap={build:'see',see:'build',symbol:'see',explain:'see',transfer:'build'};
    const alternative=bridgeMap[question.representation]||'see';
    state.reviewQueue.push({
      id:`review:${question.id}`,
      skillId:question.skillId,
      representation:alternative,
      dueQuestion:sessionQuestionIndex+3,
      dueAt:now+1000*60*3,
      stage:'same-session'
    });
  } else {
    // Schedule retention checks only after evidence begins to form.
    if(ev.attempts>=2 && ev.score>=.55){
      const existing=state.reviewQueue.some(x=>x.skillId===question.skillId && x.stage==='next-day');
      if(!existing) state.reviewQueue.push({
        id:`retention:${question.skillId}:${now}`,
        skillId:question.skillId,
        representation:question.representation==='symbol'?'transfer':'symbol',
        dueAt:now+1000*60*60*20,
        stage:'next-day'
      });
    }
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
