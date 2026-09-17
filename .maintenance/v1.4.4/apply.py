from pathlib import Path
import json, re

root=Path('.')
def read(p): return (root/p).read_text(encoding='utf-8')
def write(p,s): (root/p).write_text(s,encoding='utf-8')
def rep(s,old,new,label):
    c=s.count(old)
    if c!=1: raise SystemExit(f'{label}: expected 1 anchor, found {c}')
    return s.replace(old,new,1)
def insert_before(s,anchor,block,label):
    c=s.count(anchor)
    if c!=1: raise SystemExit(f'{label}: expected 1 anchor, found {c}')
    return s.replace(anchor,block+'\n'+anchor,1)

# ---------- engine ----------
engine=read('engine.mjs')
engine=rep(engine,
"  'times23510','divisionTables2','multDivFamilies2',\n  'fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'\n]);",
"  'times23510','divisionTables2','multDivFamilies2',\n  'fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2',\n  'lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2'\n]);",'P2-C learning-cycle ids')
engine=rep(engine,
"  skill('shapes2','grade2','Şekil ve cisim ilişkileri','Geometri','rose'),\n  skill('lengthCm','grade2','Santimetre ile ölçme','Ölçme','green'),\n  skill('time2','grade2','Saat ve yarım saat','Zaman','violet'),\n  skill('moneyTL','grade2','Lira ile para problemleri','Para','teal',['addSub1000']),\n  skill('data2','grade2','Sütun grafiğini yorumlama','Veri','amber',['number1000']),",
"  skill('lengthMetre2','grade2','Metre ile uzunluk','Ölçme','green'),\n  skill('massMetric2','grade2','Gram ve kilogram ile kütle','Ölçme','amber'),\n  skill('volumeLitre2','grade2','Litre ile sıvı hacmi','Ölçme','blue'),\n  skill('timeMinute2','grade2','Dakikaya kadar saat okuma','Zaman','violet'),\n  skill('timeDuration2','grade2','Saat ve dakika cinsinden süre','Zaman','violet',['timeMinute2']),\n  skill('moneyP2','grade2','TL, kuruş ve ondalık para gösterimi','Para','teal'),\n  skill('shapes2','grade2','Şekil ve cisim ilişkileri','Geometri','rose'),\n  skill('data2','grade2','Sütun grafiğini yorumlama','Veri','amber',['number1000']),",'replace P2-C legacy graph')

cases=r'''
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
'''
engine=insert_before(engine,'function fractionMeaning2Cases(maxDenom=12){',cases,'P2-C cases')
engine=rep(engine,
"  if(skillId==='fractionAddSub2') return make('fraction-like-add-sub',fractionPoolForDifficulty('addsub',d));\n  if(skillId==='shapes2')",
"  if(skillId==='fractionAddSub2') return make('fraction-like-add-sub',fractionPoolForDifficulty('addsub',d));\n  if(skillId==='lengthMetre2') return make('length-in-metres',lengthMetre2Cases());\n  if(skillId==='massMetric2') return make('mass-grams-kilograms',massMetric2Cases());\n  if(skillId==='volumeLitre2') return make('liquid-volume-litres',volumeLitre2Cases());\n  if(skillId==='timeMinute2') return make('time-to-the-minute',timeMinute2Cases());\n  if(skillId==='timeDuration2') return make('hours-minutes-duration-conversion',timeDuration2Cases());\n  if(skillId==='moneyP2') return make('money-decimal-cents-conversion',moneyP2Cases());\n  if(skillId==='shapes2')",'P2-C concept routes')

generators=r'''
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
  const y=c.transfer, other=Math.max(1,y.litres-1), answer=`${y.litres} L`;
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
'''
engine=insert_before(engine,'function genFractionMeaning2(rep,d,rng,concept){',generators,'P2-C generators')
engine=rep(engine,
"  times23510:genTimes23510,divisionTables2:genDivisionTables2,multDivFamilies2:genMultDivFamilies2,\n  fractionMeaning2:genFractionMeaning2,fractionNotation2:genFractionNotation2,fractionCompare2:genFractionCompare2,fractionAddSub2:genFractionAddSub2,\n  place100:genPlace100,add100:genAdd100,sub100:genSub100,multiply5:genMultiply5,divide20:genDivide20,fraction:genFraction,word2:genWord2,numberPattern2:genNumberPattern2,shapes2:genShapes2,lengthCm:genLengthCm,time2:genTime2,moneyTL:genMoneyTL,data2:genData2",
"  times23510:genTimes23510,divisionTables2:genDivisionTables2,multDivFamilies2:genMultDivFamilies2,\n  fractionMeaning2:genFractionMeaning2,fractionNotation2:genFractionNotation2,fractionCompare2:genFractionCompare2,fractionAddSub2:genFractionAddSub2,\n  lengthMetre2:genLengthMetre2,massMetric2:genMassMetric2,volumeLitre2:genVolumeLitre2,timeMinute2:genTimeMinute2,timeDuration2:genTimeDuration2,moneyP2:genMoneyP2,\n  place100:genPlace100,add100:genAdd100,sub100:genSub100,multiply5:genMultiply5,divide20:genDivide20,fraction:genFraction,word2:genWord2,numberPattern2:genNumberPattern2,shapes2:genShapes2,lengthCm:genLengthCm,time2:genTime2,moneyTL:genMoneyTL,data2:genData2",'P2-C generator map')
engine=rep(engine,
"  divisionTables2:['divide20g1'],\n  fractionMeaning2:['partwhole5']",
"  divisionTables2:['divide20g1'],\n  lengthMetre2:['lengthMeasure1'],\n  massMetric2:['mass-foundation'],\n  volumeLitre2:['volume-foundation'],\n  timeMinute2:['time1'],\n  moneyP2:['money1'],\n  fractionMeaning2:['partwhole5']",'P2-C readiness sources')

readiness=r'''
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
'''
engine=insert_before(engine,'function generateReadinessQuestion(skillId,difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){',readiness,'P2-C readiness helpers')
engine=rep(engine,
"  if(skillId==='time1') return generateTimeReadinessQuestion(difficulty,rng,{support,sourceSkillId});\n  if(skillId==='oddEven1000') return generateParityReadinessQuestion(difficulty,rng,{support,sourceSkillId});",
"  if(skillId==='time1') return generateTimeReadinessQuestion(difficulty,rng,{support,sourceSkillId});\n  if(skillId==='oddEven1000') return generateParityReadinessQuestion(difficulty,rng,{support,sourceSkillId});\n  if(skillId==='massMetric2') return generateMassReadinessQuestion(difficulty,rng,{support,sourceSkillId});\n  if(skillId==='volumeLitre2') return generateVolumeReadinessQuestion(difficulty,rng,{support,sourceSkillId});",'P2-C readiness routing')
engine=rep(engine,
"  times23510:'tables-2-3-4-5-10',divisionTables2:'division-symbol-within-tables',multDivFamilies2:'multiplication-division-fact-families',\n  fractionMeaning2:'fraction-equal-parts-whole'",
"  times23510:'tables-2-3-4-5-10',divisionTables2:'division-symbol-within-tables',multDivFamilies2:'multiplication-division-fact-families',\n  lengthMetre2:'length-in-metres',massMetric2:'mass-grams-kilograms',volumeLitre2:'liquid-volume-litres',timeMinute2:'time-to-the-minute',timeDuration2:'hours-minutes-duration-conversion',moneyP2:'money-decimal-cents-conversion',\n  fractionMeaning2:'fraction-equal-parts-whole'",'P2-C concept keys')
write('engine.mjs',engine)

# ---------- app interaction/rendering ----------
app=read('app.js')
app=rep(app,
"  if(interaction==='money-make'){\n    const root=$('.sg-money-builder'); root?.querySelectorAll('.sg-money-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='cm-ruler')",
"  if(interaction==='money-make'){\n    const root=$('.sg-money-builder'); root?.querySelectorAll('.sg-money-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='measure-make'){\n    const root=$('.sg-measure-builder'); root?.querySelectorAll('.sg-measure-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='duration-compose'){\n    const root=$('.sg-duration-builder'); root?.querySelectorAll('.sg-duration-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='clock-minute-set'){\n    const root=$('.sg-clock-minute-set');\n    const redraw=()=>{ const h=Number(root?.querySelector('.sg-hour-choice.selected')?.dataset.value||12), m=Number(root?.dataset.minute||0); const label=root?.querySelector('.sg-minute-live'); if(label)label.textContent=`:${String(m).padStart(2,'0')}`; const preview=root?.querySelector('.sg-clock-minute-preview'); if(preview)preview.innerHTML=renderClock(h,m); updateManipulatorStatus(q); };\n    root?.querySelectorAll('.sg-hour-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-hour-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');redraw()}));\n    root?.querySelectorAll('.sg-minute-adjust').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.dataset.minute=String((Number(root.dataset.minute||0)+Number(btn.dataset.delta||0)+60)%60);redraw()}));\n  }\n  if(interaction==='cm-ruler')",'P2-C interaction handlers')
app=rep(app,
"  if(interaction==='money-make') return [...$$('.sg-money-builder .sg-money-token.selected')].reduce((sum,b)=>sum+Number(b.dataset.value||0),0);\n  if(interaction==='cm-ruler')",
"  if(interaction==='money-make') return [...$$('.sg-money-builder .sg-money-token.selected')].reduce((sum,b)=>sum+Number(b.dataset.value||0),0);\n  if(interaction==='measure-make') return [...$$('.sg-measure-builder .sg-measure-token.selected')].reduce((sum,b)=>sum+Number(b.dataset.value||0),0);\n  if(interaction==='duration-compose') return [...$$('.sg-duration-builder .sg-duration-token.selected')].reduce((sum,b)=>sum+Number(b.dataset.value||0),0);\n  if(interaction==='clock-minute-set'){ const root=$('.sg-clock-minute-set'); const h=root?.querySelector('.sg-hour-choice.selected')?.dataset.value; return h!=null?`${h}|${Number(root.dataset.minute||0)}`:null; }\n  if(interaction==='cm-ruler')",'P2-C manipulator reads')
app=rep(app,
"  else if(q.response?.interaction==='money-make') node.textContent=`Seçtiğin toplam: ${value} ${q.response?.unit==='kr'?'kuruş':'TL'}`;\n  else if(q.response?.interaction==='cm-ruler')",
"  else if(q.response?.interaction==='money-make') node.textContent=`Seçtiğin toplam: ${value} ${q.response?.unit==='kr'?'kuruş':'TL'}`;\n  else if(q.response?.interaction==='measure-make') node.textContent=`Kurduğun ölçü: ${value} ${q.response?.unit||''}`;\n  else if(q.response?.interaction==='duration-compose') { const total=Number(value)||0; node.textContent=`Kurduğun süre: ${Math.floor(total/60)} sa ${total%60} dk`; }\n  else if(q.response?.interaction==='clock-minute-set') node.textContent=value?`Ayarladığın: ${String(value).replace('|',':').replace(/:(\\d)$/,':0$1')}`:'Önce saati seç, sonra dakikayı ayarla';\n  else if(q.response?.interaction==='cm-ruler')",'P2-C manipulator status')
app=rep(app,
".sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op').forEach(b=>b.disabled=true);",
".sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op,.sg-measure-token,.sg-duration-token,.sg-minute-adjust').forEach(b=>b.disabled=true);",'P2-C disable controls')
app=rep(app,
"    case 'fraction-strip': return fractionStrip(v.numerator,v.denom);",
"    case 'measure-compose-interactive': return measureComposeBuilder(v.target,v.unit,v.denoms||[1]);\n    case 'measure-amount': return measureAmountVisual(v.kind,v.amount,v.unit,v.denoms||[1],v.showLabel!==false);\n    case 'measure-compare': return measureCompareVisual(v.kind,v.left,v.right,v.unit);\n    case 'measure-triple': return measureTripleVisual(v.kind,v.values,v.unit);\n    case 'unit-context-card': return unitContextCard(v.object,v.unit);\n    case 'mass-foundation': return massFoundationVisual(v.left,v.right);\n    case 'volume-foundation': return volumeFoundationVisual(v.left,v.right);\n    case 'volume-compare': return measureCompareVisual('volume',v.left,v.right,'L');\n    case 'clock-minute-set-interactive': return clockMinuteSetBuilder(v.targetHour,v.targetMinute);\n    case 'duration-compose-interactive': return durationComposeBuilder(v.target);\n    case 'duration-card': return durationCard(v);\n    case 'money-decimal-card': return moneyDecimalCard(v.cents,v.label);\n    case 'money-compare-decimal': return moneyCompareDecimal(v.values);\n    case 'fraction-strip': return fractionStrip(v.numerator,v.denom);",'P2-C render cases')

ui_funcs=r'''
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
'''
app=insert_before(app,'function cmRulerModel(end,start=0,max=15){',ui_funcs,'P2-C UI helpers')
write('app.js',app)

# ---------- tests ----------
t=read('tests/engine.test.mjs')
t=rep(t,
"const P2_FRACTION_SKILLS=['fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'];\nconst P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS,...P2_MULT_DIV_SKILLS,...P2_FRACTION_SKILLS];",
"const P2_FRACTION_SKILLS=['fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'];\nconst P2_MEASURE_TIME_MONEY_SKILLS=['lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2'];\nconst P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS,...P2_MULT_DIV_SKILLS,...P2_FRACTION_SKILLS,...P2_MEASURE_TIME_MONEY_SKILLS];",'engine P2-C list')
t=rep(t,
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2']",
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2']",'engine P2-C expected order')
t=rep(t,
"for(const legacy of ['place100','add100','sub100','numberPattern2','word2','multiply5','divide20','fraction'])",
"for(const legacy of ['place100','add100','sub100','numberPattern2','word2','multiply5','divide20','fraction','lengthCm','time2','moneyTL'])",'hide P2-C legacy')
quality=r'''
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

'''
t=insert_before(t,'// Grade 2 geometry reference gate:',quality,'P2-C quality tests')
write('tests/engine.test.mjs',t)

lc=read('tests/learning-cycle.test.mjs')
lc=rep(lc,
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2']",
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2']",'learning-cycle P2-C order')
lc=rep(lc,
"assert.deepEqual(readinessSourcesFor('fractionAddSub2'),['fractionCompare2']);",
"assert.deepEqual(readinessSourcesFor('fractionAddSub2'),['fractionCompare2']);\nassert.deepEqual(readinessSourcesFor('lengthMetre2'),['lengthMeasure1']);\nassert.deepEqual(readinessSourcesFor('massMetric2'),['mass-foundation']);\nassert.deepEqual(readinessSourcesFor('volumeLitre2'),['volume-foundation']);\nassert.deepEqual(readinessSourcesFor('timeMinute2'),['time1']);\nassert.deepEqual(readinessSourcesFor('timeDuration2'),['timeMinute2']);\nassert.deepEqual(readinessSourcesFor('moneyP2'),['money1']);",'P2-C readiness tests')
write('tests/learning-cycle.test.mjs',lc)

ui=read('tests/ui-static.test.mjs')
ui=rep(ui,
"'sg-base1000-builder','sg-parity-builder','sg-two-step-plan'",
"'sg-base1000-builder','sg-parity-builder','sg-two-step-plan','sg-measure-builder','sg-duration-builder','sg-clock-minute-set'",'UI P2-C class guards')
write('tests/ui-static.test.mjs',ui)

# ---------- version/cache ----------
pkg=json.loads(read('package.json')); pkg['version']='1.4.4'; write('package.json',json.dumps(pkg,ensure_ascii=False,indent=2)+'\n')
sw=read('sw.js'); sw=re.sub(r"^const CACHE='[^']+';", "const CACHE='saymera-v1-4-4-p2-measure-time-money';", sw, count=1); write('sw.js',sw)

# ---------- audit docs ----------
cov=read('SINGAPORE_P2_COVERAGE.md')
cov=re.sub(r"### Measurement\n.*?\n### Time\n.*?\n### Money\n.*?\n### Geometry\n.*?\n### Data\n.*?\n## Mevcut SAYMERA P2 denetimi",
"""### Measurement
- uzunluk: metre (m)
- kütle: gram (g) ve kilogram (kg)
- sıvı hacmi: litre (L)
- uygun standart birimi seçme
- aynı tür ölçüleri karşılaştırma ve sıralama
- **P2'de m↔cm, kg↔g veya L↔mL dönüşümü çekirdek hedef değildir; bileşik birim dönüşümleri P3'e bırakılır.** P1'de santimetre zaten öğrenilmiştir.

### Time
- analog/dijital zamanı **dakikaya kadar** okuma
- süreyi saat ve dakika cinsinden ölçme/ifade etme
- `saat + dakika ↔ yalnız dakika` dönüşümü
- P1'deki 5 dakikalık saat ve ÖÖ/ÖS bilgisi ön bilgidir; P2'nin yeni hedefi dakikaya hassasiyet ve süre dönüşümüdür.

### Money
- lira/kuruş miktarını sayma ve oluşturma
- para miktarını ondalık gösterimle okuma/yazma
- iki veya üç para miktarını karşılaştırma
- `ondalık TL ↔ yalnız kuruş` dönüşümü
- Türkiye yerelleştirmesi: TL/kuruş ve ondalık virgül; Singapore'daki dollar/cent matematiksel yapısı korunur

### Geometry
- 2B şekillerle boyut, şekil, renk ve yön özelliklerinden bir veya ikisine göre örüntü kurma/tamamlama
- küp, dikdörtgen prizma (cuboid), koni, silindir ve küreyi tanıma, adlandırma, betimleme ve sınıflandırma
- yarım/çeyrek daire, bileşik 2B figür ve ızgarada kopyalama P1 kapsamıdır; P2'ye tekrar çekirdek hedef olarak yazılmaz

### Data
- **ölçekli resimli grafikleri** okuma ve yorumlama
- P2 çekirdeği sütun grafiği değildir; sütun grafiği P3'e aittir

## Mevcut SAYMERA P2 denetimi""",cov,flags=re.S)
cov=cov.replace("| `lengthCm` | yalnız cm | **Yetersiz** — m/cm + g/kg + l gerekli |\n| `time2` | tam/yarım saat | **Yetersiz** — 5 dakika, ÖÖ/ÖS, süre gerekli |\n| `moneyTL` | yalnız tam TL | **Yetersiz** — TL/kuruş ve ondalık gösterim gerekli |",
"| `lengthMetre2` | metre ile ölçme/karşılaştırma | **P2-REFERENCE** |\n| `massMetric2` | gram/kilogram ve uygun birim | **P2-REFERENCE** |\n| `volumeLitre2` | litre ve sıvı hacmi | **P2-REFERENCE** |\n| `timeMinute2` | dakikaya kadar saat okuma | **P2-REFERENCE** |\n| `timeDuration2` | saat+dakika ↔ dakika dönüşümü | **P2-REFERENCE** |\n| `moneyP2` | TL/kuruş ve ondalık gösterim | **P2-REFERENCE** |")
cov=re.sub(r"### P2-C — Measurement \+ Time \+ Money\n.*?\n### P2-D — Geometry \+ Data",
"""### P2-C — Measurement + Time + Money
14. `lengthMetre2` — metre ile ölçme, karşılaştırma ve uygun uzunluk birimi
15. `massMetric2` — g/kg ile kütle, uygun birim, karşılaştırma/sıralama
16. `volumeLitre2` — litre ile sıvı hacmi, karşılaştırma/sıralama
17. `timeMinute2` — dakikaya kadar analog/dijital saat
18. `timeDuration2` — saat+dakika ↔ yalnız dakika
19. `moneyP2` — TL/kuruş, ondalık gösterim ve karşılaştırma

### P2-D — Geometry + Data""",cov,flags=re.S)
cov=re.sub(r"### P2-D — Geometry \+ Data\n.*?\n## Kalite kapısı",
"""### P2-D — Geometry + Data
20. `shapePatterns2` — 2B şekillerde boyut/şekil/renk/yön ile örüntü
21. `solids2` — küp/dikdörtgen prizma/koni/silindir/küre ve sınıflandırma
22. `pictureGraphScale2` — ölçekli resimli grafik okuma/yorumlama

## Kalite kapısı""",cov,flags=re.S)
progress="""

## Uygulama ilerlemesi — v1.4.4 / P2-C Ölçme, Zaman ve Para

Güncel **Oct 2025** P2 kapsamı yeniden doğrulandı ve önceki audit'teki iki eski varsayım düzeltildi:
- P2 zamanı 5 dakikalık aralık değil, **dakikaya kadar** okumadır; ayrıca saat+dakika ↔ dakika dönüşümü vardır.
- P2 ölçme çekirdeğinde yeni uzunluk birimi **metre**, kütle **g/kg**, sıvı hacmi **litre**dir. Bileşik birim dönüşümleri P3'e bırakılır; cm zaten P1'de vardır.

Legacy `lengthCm`, `time2`, `moneyTL` görünür haritadan çıkarıldı. Yerlerine altı P2-REFERENCE beceri geldi: `lengthMetre2`, `massMetric2`, `volumeLitre2`, `timeMinute2`, `timeDuration2`, `moneyP2`.

Sıradaki katman P2-D: 2B şekil örüntüleri, beş P2 3B cismi ve ölçekli resimli grafik.
"""
if '## Uygulama ilerlemesi — v1.4.4 / P2-C Ölçme, Zaman ve Para' not in cov: cov+=progress
write('SINGAPORE_P2_COVERAGE.md',cov)

matrix=read('TASK_MIGRATION_MATRIX.md')
matrix=matrix.replace("| 2. sınıf | `shapes2` | Şekil/cisim ilişkileri | **REFERENCE** |\n| 2. sınıf | `lengthCm` | Santimetre | LEGACY |\n| 2. sınıf | `time2` | Saat | LEGACY |\n| 2. sınıf | `moneyTL` | Para | LEGACY |\n| 2. sınıf | `data2` | Sütun grafiği | LEGACY |",
"| 2. sınıf | `lengthMetre2` | Metre ile uzunluk | **P2-REFERENCE** |\n| 2. sınıf | `massMetric2` | Gram/kilogram ile kütle | **P2-REFERENCE** |\n| 2. sınıf | `volumeLitre2` | Litre ile sıvı hacmi | **P2-REFERENCE** |\n| 2. sınıf | `timeMinute2` | Dakikaya kadar saat okuma | **P2-REFERENCE** |\n| 2. sınıf | `timeDuration2` | Saat ve dakika cinsinden süre | **P2-REFERENCE** |\n| 2. sınıf | `moneyP2` | TL/kuruş ve ondalık para gösterimi | **P2-REFERENCE** |\n| 2. sınıf | `shapes2` | Şekil/cisim ilişkileri | **REFERENCE** |\n| 2. sınıf | `data2` | Sütun grafiği | LEGACY |")
matrix=matrix.replace("Toplam: **48 beceri**. Bunun **22'si P1-REFERENCE**, **13'ü P2-REFERENCE**, **1'i Grade 2 REFERENCE** ve **12'si LEGACY** durumundadır.",
"Toplam: **51 beceri**. Bunun **22'si P1-REFERENCE**, **19'u P2-REFERENCE**, **1'i Grade 2 REFERENCE** ve **9'u LEGACY** durumundadır.")
write('TASK_MIGRATION_MATRIX.md',matrix)

write('P2_MEASUREMENT_TIME_MONEY_REFERENCE.md',"""# Singapore P2 Measurement, Time & Money — SAYMERA v1.4.4

Kaynak: Singapore MOE **Primary Mathematics Syllabus P1–P6, Updated Oct 2025**, Primary Two.

## Current P2 scope

### Measurement
- length in metres
- mass in kilograms/grams
- liquid volume in litres
- appropriate units and abbreviations `m`, `g`, `kg`, `L`
- compare and order lengths, masses and volumes

P1 centimetre knowledge remains useful readiness. Compound-unit conversions (`m↔cm`, `kg↔g`, `L↔mL`) are not introduced here; these belong to later curriculum work.

### Time
- tell time **to the minute**
- measure/express duration in hours and minutes
- convert hours+minutes to minutes only, and vice versa

This deliberately advances beyond P1's 5-minute clock.

### Money
- count money in main/sub-units
- read/write decimal money notation
- compare two or three amounts
- convert decimal notation to sub-unit only and vice versa

Turkish localisation uses `TL/kuruş` and the decimal comma, e.g. `3,45 TL = 345 kuruş`, preserving the same place-value structure.

## SAYMERA skills
- `lengthMetre2`
- `massMetric2`
- `volumeLitre2`
- `timeMinute2`
- `timeDuration2`
- `moneyP2`

All six use the canonical learning cycle: readiness → model → representation → symbol → reasoning → context → adaptive practice → delayed retrieval.

Official source: https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf
""")

print('v1.4.4 P2 measurement/time/money migration staged')
