from pathlib import Path
import json, re

ROOT=Path('.')

def read(path): return (ROOT/path).read_text(encoding='utf-8')
def write(path,text): (ROOT/path).write_text(text,encoding='utf-8')
def must_replace(text, old, new, label):
    if old not in text:
        raise SystemExit(f'{label} anchor missing')
    return text.replace(old,new,1)

# ---------------- engine ----------------
engine=read('engine.mjs')

engine=must_replace(engine,
"""const LEARNING_CYCLE_READY_SKILLS = new Set([
  'number20','numberBonds10','make10','add20','addMany1','sub20','equality','word1',
  'number100','compareOrder100','ordinal10','numberPattern1','addSub100','multiply40',
  'divide20g1','money1','lengthCompare1','lengthMeasure1','time1','shapes1','shapePattern1','data1'
]);""",
"""const LEARNING_CYCLE_READY_SKILLS = new Set([
  'number20','numberBonds10','make10','add20','addMany1','sub20','equality','word1',
  'number100','compareOrder100','ordinal10','numberPattern1','addSub100','multiply40',
  'divide20g1','money1','lengthCompare1','lengthMeasure1','time1','shapes1','shapePattern1','data1',
  'number1000','compareOrder1000','numberPattern1000','addSub1000'
]);""",'learning-cycle set')

old_grade2="""  skill('place100','grade2','Onluk–birlik','Sayı sistemi','amber'),
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
  skill('data2','grade2','Sütun grafiğini yorumlama','Veri','amber',['place100']),"""
new_grade2="""  // Primary 2 migration is deliberate: reference-quality skills use new ids so legacy
  // evidence cannot silently carry over to materially harder Singapore P2 content.
  skill('number1000','grade2','1000’e kadar sayı ve basamak','Sayılar','amber'),
  skill('compareOrder1000','grade2','1000’e kadar karşılaştırma ve sıralama','Sayılar','blue',['number1000']),
  skill('numberPattern1000','grade2','1, 10 ve 100 ile sayı örüntüleri','Örüntü','navy',['number1000']),
  skill('addSub1000','grade2','1000 içinde toplama ve çıkarma','İşlemler','violet',['number1000']),
  skill('multiply5','grade2','Gruplarla çarpma','Çarpma','green',['addSub1000']),
  skill('divide20','grade2','Paylaştırarak bölme','Bölme','teal',['multiply5']),
  skill('fraction','grade2','Yarım ve çeyrek','Kesir','rose'),
  skill('word2','grade2','İki ilişkiyi birleştiren problem','Problem çözme','navy',['addSub1000']),
  skill('shapes2','grade2','Şekil ve cisim ilişkileri','Geometri','rose'),
  skill('lengthCm','grade2','Santimetre ile ölçme','Ölçme','green'),
  skill('time2','grade2','Saat ve yarım saat','Zaman','violet'),
  skill('moneyTL','grade2','Lira ile para problemleri','Para','teal',['addSub1000']),
  skill('data2','grade2','Sütun grafiğini yorumlama','Veri','amber',['number1000']),"""
engine=must_replace(engine,old_grade2,new_grade2,'grade2 skill graph')

# Extend Turkish number words through 1000.
pat=r"function trNumberWord\(n\)\{[\s\S]*?\n\}"
m=re.search(pat,engine)
if not m: raise SystemExit('trNumberWord anchor missing')
new_tr="""function trNumberWord(n){
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
}"""
engine=engine[:m.start()]+new_tr+engine[m.end():]

p2_cases="""
function number1000Cases(){
  const nums=[103,118,140,205,267,304,359,402,478,506,571,620,684,703,748,815,862,907,945,999,1000];
  return nums.map(n=>({n,hundreds:Math.floor(n/100),tens:Math.floor((n%100)/10),ones:n%10}));
}
function compare1000Cases(){
  return [[342,349],[509,490],[675,625],[808,880],[999,909],[420,421],[731,701],[1000,999],[456,546],[603,630],[288,208],[917,971]]
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
"""
engine=must_replace(engine,"function shapes2Cases(){",p2_cases+"\nfunction shapes2Cases(){",'P2 case insertion')

concept_anchor="""  if(skillId==='data1') return make('pictograph-data',data1Cases());
  if(skillId==='shapes2') return make('solid-properties-and-invariance',shapes2Cases());"""
concept_new="""  if(skillId==='data1') return make('pictograph-data',data1Cases());
  if(skillId==='number1000') return make('numbers-to-1000-place-value',number1000Cases());
  if(skillId==='compareOrder1000') return make('compare-order-to-1000',compare1000Cases());
  if(skillId==='numberPattern1000') return make('one-ten-hundred-patterns-to-1000',pattern1000Cases());
  if(skillId==='addSub1000'){
    const all=addSub1000Cases();
    const cases=d===1?all.filter(z=>z.mode==='mental'):d===2?all.filter(z=>z.mode!=='regroup'):d===3?all.filter(z=>z.mode!=='mental'):all.filter(z=>z.mode==='regroup');
    return make('addition-subtraction-within-1000',cases);
  }
  if(skillId==='shapes2') return make('solid-properties-and-invariance',shapes2Cases());"""
engine=must_replace(engine,concept_anchor,concept_new,'P2 concepts')

p2_generators=r'''
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

function genCompareOrder1000(rep,d,rng,concept){
  const c=concept?.skillId==='compareOrder1000'?concept:createConceptInstance('compareOrder1000',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('compareOrder1000',rep,`${x.a} ve ${x.b} sayı kartlarını küçükten büyüğe sırala.`,`${x.smaller}|${x.larger}`,{kind:'manipulative',interaction:'order-pair',expectedValue:`${x.smaller}|${x.larger}`,checkLabel:'Sıramı kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Üç basamaklı sayıları sırala',visual:{type:'order-pair-interactive',a:x.a,b:x.b},hint:'Önce yüzlükleri; eşitse onlukları, sonra birlikleri karşılaştır.',explain:`${x.smaller} < ${x.larger}.`
  });
  if(rep==='see'){
    const rels=[x.relation,x.relation==='>'?'<':'>','='];
    const opts=shuffled(rels.map((relation,i)=>({value:relation===x.relation?'correct':`wrong-${i}`,visual:{type:'compare-base1000',a:x.a,b:x.b,relation},ariaLabel:`${x.a} ${relation} ${x.b}`})),rng);
    return qTask('compareOrder1000',rep,'Yüzlük–onluk–birlik bilgisine göre doğru karşılaştırma hangisi?','correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Karşılaştırmayı basamak modelinde gör',visual:{type:'compare-base1000',a:x.a,b:x.b,relation:'?'},hint:'Soldaki en büyük basamaktan karşılaştırmaya başla.',explain:`${x.a} ${x.relation} ${x.b}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qBase('compareOrder1000',rep,`${y.a} __ ${y.b} boşluğuna hangi işaret gelir?`,y.relation,semanticChoices(y.relation,[y.relation==='>'?'<':'>','=','+'],rng),{
      taskKind:'symbol-entry',taskLabel:'Karşılaştırmayı sembolleştir',visual:{type:'equation',text:`${y.a} __ ${y.b}`},hint:'Önce yüzlükleri karşılaştır.',explain:`${y.a} ${y.relation} ${y.b}.`
    });
  }
  if(rep==='explain'){
    const ah=Math.floor(x.a/100), bh=Math.floor(x.b/100), at=Math.floor((x.a%100)/10), bt=Math.floor((x.b%100)/10);
    const answer=ah!==bh?'Önce yüzlük basamağını karşılaştırırım':at!==bt?'Yüzlükler eşit; onluk basamağını karşılaştırırım':'Yüzlük ve onluklar eşit; birlikleri karşılaştırırım';
    return qBase('compareOrder1000',rep,`${x.a} ile ${x.b} karşılaştırılırken hangi düşünce doğrudur?`,answer,semanticChoices(answer,['Yalnız son rakama bakarım','Rakam sayıları eşitse sayılar da eşittir','Basamakların yerini önemsemem'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Basamak sırasını gerekçelendir',visual:{type:'compare-base1000',a:x.a,b:x.b,relation:x.relation},hint:'Basamak değeri soldan sağa azalır.',explain:`${answer}; sonuç ${x.a} ${x.relation} ${x.b}.`
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
    return qBase('numberPattern1000',rep,`${x.seq.join(', ')}, … dizisinin kuralı nedir?`,answer,semanticChoices(answer,[`Her adımda ${Math.abs(x.step)} ${x.step>0?'çıkarılıyor':'ekleniyor'}`,'Her sayı rastgele seçiliyor','Her adımda sayı iki katına çıkıyor'],rng),{
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
'''
engine=must_replace(engine,"function genPlace100(rep,d,rng){",p2_generators+"\nfunction genPlace100(rep,d,rng){",'P2 generators')

# Register generators, retaining old legacy generators as dead compatibility helpers only.
engine=must_replace(engine,
"""  lengthCompare1:genLengthCompare1,lengthMeasure1:genLengthMeasure1,time1:genTime1,shapes1:genShapes1,shapePattern1:genShapePattern1,data1:genData1,
  place100:genPlace100,add100:genAdd100,sub100:genSub100,multiply5:genMultiply5,divide20:genDivide20,fraction:genFraction,word2:genWord2,numberPattern2:genNumberPattern2,shapes2:genShapes2,lengthCm:genLengthCm,time2:genTime2,moneyTL:genMoneyTL,data2:genData2""",
"""  lengthCompare1:genLengthCompare1,lengthMeasure1:genLengthMeasure1,time1:genTime1,shapes1:genShapes1,shapePattern1:genShapePattern1,data1:genData1,
  number1000:genNumber1000,compareOrder1000:genCompareOrder1000,numberPattern1000:genNumberPattern1000,addSub1000:genAddSub1000,
  place100:genPlace100,add100:genAdd100,sub100:genSub100,multiply5:genMultiply5,divide20:genDivide20,fraction:genFraction,word2:genWord2,numberPattern2:genNumberPattern2,shapes2:genShapes2,lengthCm:genLengthCm,time2:genTime2,moneyTL:genMoneyTL,data2:genData2""",'generator registry')

engine=must_replace(engine,
"""  lengthCompare1:'centimetre-length-comparison',lengthMeasure1:'centimetre-length-measurement',time1:'time-five-minutes-period-duration',shapes1:'shape-properties',shapePattern1:'shape-composition-and-copying',data1:'pictograph-data',
  shapes2:'solid-properties-and-invariance'""",
"""  lengthCompare1:'centimetre-length-comparison',lengthMeasure1:'centimetre-length-measurement',time1:'time-five-minutes-period-duration',shapes1:'shape-properties',shapePattern1:'shape-composition-and-copying',data1:'pictograph-data',
  number1000:'numbers-to-1000-place-value',compareOrder1000:'compare-order-to-1000',numberPattern1000:'one-ten-hundred-patterns-to-1000',addSub1000:'addition-subtraction-within-1000',
  shapes2:'solid-properties-and-invariance'""",'concept keys')

engine=must_replace(engine,
"""const READINESS_SOURCE_OVERRIDES={
  number20:['count10'],
  lengthCompare1:['compare10'],
  time1:['time-foundation'],
  shapes1:['shapesBasic']
};""",
"""const READINESS_SOURCE_OVERRIDES={
  number20:['count10'],
  lengthCompare1:['compare10'],
  time1:['time-foundation'],
  shapes1:['shapesBasic'],
  number1000:['number100'],
  addSub1000:['addSub100']
};""",'readiness overrides')

engine=must_replace(engine,
"""export function readinessSourcesFor(skillId){
  const skillObj=SKILLS.find(s=>s.id===skillId);
  if(!skillObj) return [];
  if(skillObj.prerequisite?.length) return [...skillObj.prerequisite];
  return [...(READINESS_SOURCE_OVERRIDES[skillId]||[])];
}""",
"""export function readinessSourcesFor(skillId){
  const skillObj=SKILLS.find(s=>s.id===skillId);
  if(!skillObj) return [];
  const override=READINESS_SOURCE_OVERRIDES[skillId];
  if(override?.length) return [...override];
  if(skillObj.prerequisite?.length) return [...skillObj.prerequisite];
  return [];
}""",'readiness source precedence')

write('engine.mjs',engine)

# ---------------- app rendering + interactions ----------------
app=read('app.js')
app=must_replace(app,
".sg-minute-choice,.sg-shape-choice,.solid-property-chip,.sg-three-token').forEach",
".sg-minute-choice,.sg-shape-choice,.solid-property-chip,.sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach",'disable controls')

wire_anchor="""  if(interaction==='order-pair'){
    const root=$('.sg-order-builder');"""
wire_new="""  if(interaction==='base1000-build'){
    const root=$('.sg-base1000-builder');
    root?.querySelectorAll('.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='order-pair'){
    const root=$('.sg-order-builder');"""
app=must_replace(app,wire_anchor,wire_new,'base1000 wire')

app=must_replace(app,
"""  if(interaction==='order-pair'){
    const cards=[...$$('.sg-order-builder .sg-order-card[data-order]')].sort((a,b)=>Number(a.dataset.order)-Number(b.dataset.order)); return cards.length===2?cards.map(x=>x.dataset.value).join('|'):null;
  }""",
"""  if(interaction==='base1000-build') return `${$$('.sg-base1000-builder .sg-base1000-hundred.selected').length}|${$$('.sg-base1000-builder .sg-base1000-ten.selected').length}|${$$('.sg-base1000-builder .sg-base1000-one.selected').length}`;
  if(interaction==='order-pair'){
    const cards=[...$$('.sg-order-builder .sg-order-card[data-order]')].sort((a,b)=>Number(a.dataset.order)-Number(b.dataset.order)); return cards.length===2?cards.map(x=>x.dataset.value).join('|'):null;
  }""",'base1000 reader')

app=must_replace(app,
"""  else if(q.response?.interaction==='order-pair') node.textContent=value?`Sıran: ${String(value).replace('|',' → ')}`:'Önce küçük, sonra büyük karta dokun';""",
"""  else if(q.response?.interaction==='base1000-build') { const [h='0',t='0',o='0']=String(value).split('|'); node.textContent=`Modelin: ${h} yüzlük · ${t} onluk · ${o} birlik`; }
  else if(q.response?.interaction==='order-pair') node.textContent=value?`Sıran: ${String(value).replace('|',' → ')}`:'Önce küçük, sonra büyük karta dokun';""",'base1000 status')

visual_insert="""    case 'base1000': return base1000Visual(v.hundreds,v.tens,v.ones);
    case 'base1000-build-interactive': return base1000BuildBuilder(v.target,v.maxHundreds,v.maxTens,v.maxOnes);
    case 'base1000-operation-build': return base1000OperationBuilder(v);
    case 'compare-base1000': return compareBase1000Visual(v.a,v.b,v.relation);
"""
app=must_replace(app,"    case 'bar-add': return",visual_insert+"    case 'bar-add': return",'base1000 render cases')

helper_anchor="""function base10BuildBuilder(target,maxTens,maxOnes){ return `<div class=\"sg-base10-builder\"><div class=\"sg-target-pill\">HEDEF <b>${target}</b></div>${base10BuildControls(maxTens,maxOnes)}</div>`; }
"""
helper_new=helper_anchor+"""function base1000BuildControls(maxHundreds=10,maxTens=9,maxOnes=9){
  return `<div class=\"sg-base1000-bank\"><div><small>YÜZLÜK</small>${Array.from({length:maxHundreds},(_,i)=>`<button class=\"sg-base1000-hundred\" type=\"button\" aria-label=\"${i+1}. yüzlük\"></button>`).join('')}</div><div><small>ONLUK</small>${Array.from({length:maxTens},(_,i)=>`<button class=\"sg-base1000-ten\" type=\"button\" aria-label=\"${i+1}. onluk\"></button>`).join('')}</div><div><small>BİRLİK</small>${Array.from({length:maxOnes},(_,i)=>`<button class=\"sg-base1000-one\" type=\"button\" aria-label=\"${i+1}. birlik\"></button>`).join('')}</div></div>`;
}
function base1000BuildBuilder(target,maxHundreds,maxTens,maxOnes){ return `<div class=\"sg-base1000-builder\"><div class=\"sg-target-pill\">HEDEF <b>${target}</b></div>${base1000BuildControls(maxHundreds,maxTens,maxOnes)}</div>`; }
function base1000OperationBuilder(v){ return `<div class=\"sg-base1000-builder\"><div class=\"sg-operation-header\">${v.a} ${esc(v.op)} ${v.b} = ?</div>${base1000BuildControls(v.maxHundreds,v.maxTens,v.maxOnes)}</div>`; }
function base1000Visual(hundreds=0,tens=0,ones=0){
  return `<div class=\"sg-base1000\"><div class=\"sg-place-column hundreds\"><small>YÜZLÜK</small><div>${Array.from({length:Number(hundreds)||0},()=>'<i class=\"sg-hundred-block\"></i>').join('')||'<em>0</em>'}</div><b>${hundreds}</b></div><div class=\"sg-place-column tens\"><small>ONLUK</small><div>${Array.from({length:Number(tens)||0},()=>'<i class=\"sg-ten-block\"></i>').join('')||'<em>0</em>'}</div><b>${tens}</b></div><div class=\"sg-place-column ones\"><small>BİRLİK</small><div>${Array.from({length:Number(ones)||0},()=>'<i class=\"sg-one-block\"></i>').join('')||'<em>0</em>'}</div><b>${ones}</b></div></div>`;
}
function compareBase1000Visual(a,b,relation){
  const mini=n=>{ const h=Math.floor(n/100), t=Math.floor((n%100)/10), o=n%10; return `<div class=\"sg-mini-base1000\"><b>${n}</b><span>${h}Y · ${t}O · ${o}B</span></div>`; };
  return `<div class=\"sg-compare-base1000\">${mini(a)}<strong>${esc(relation)}</strong>${mini(b)}</div>`;
}
"""
app=must_replace(app,helper_anchor,helper_new,'base1000 helpers')
write('app.js',app)

# ---------------- styles ----------------
css=read('styles.css')
css_add=r'''

/* v1.4 — Singapore P2 base-1000 manipulatives */
.sg-base1000{display:grid;grid-template-columns:repeat(3,minmax(88px,1fr));gap:12px;width:min(560px,100%);position:relative;z-index:1}
.sg-place-column{background:var(--paper);border:1px solid var(--line);border-radius:20px;padding:12px;display:grid;gap:8px;text-align:center;min-height:132px;align-content:start}.sg-place-column small,.sg-base1000-bank small{font-size:9px;letter-spacing:.12em;font-weight:950;color:var(--muted)}.sg-place-column>div{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;align-items:center;min-height:62px}.sg-place-column>b{font-size:18px}.sg-place-column em{font-style:normal;color:var(--muted);font-weight:850}
.sg-hundred-block{width:26px;height:26px;border-radius:5px;background:repeating-linear-gradient(0deg,rgba(255,255,255,.28) 0 1px,transparent 1px 5px),repeating-linear-gradient(90deg,rgba(255,255,255,.28) 0 1px,transparent 1px 5px),var(--sun)}.sg-ten-block{width:9px;height:42px;border-radius:4px;background:var(--blue)}.sg-one-block{width:12px;height:12px;border-radius:3px;background:var(--teal)}
.sg-base1000-builder{display:grid;gap:14px;width:min(620px,100%);position:relative;z-index:1}.sg-base1000-bank{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.sg-base1000-bank>div{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:12px;display:flex;gap:7px;flex-wrap:wrap;align-content:flex-start}.sg-base1000-bank small{width:100%;margin-bottom:3px}.sg-base1000-bank button{border:2px solid transparent;transition:transform .12s ease,border-color .12s ease,opacity .12s ease}.sg-base1000-hundred{width:30px;height:30px;border-radius:6px;background:repeating-linear-gradient(0deg,rgba(255,255,255,.3) 0 1px,transparent 1px 6px),repeating-linear-gradient(90deg,rgba(255,255,255,.3) 0 1px,transparent 1px 6px),var(--sun)}.sg-base1000-ten{width:12px;height:42px;border-radius:5px;background:var(--blue)}.sg-base1000-one{width:18px;height:18px;border-radius:4px;background:var(--teal)}.sg-base1000-bank button.selected{border-color:var(--navy);transform:translateY(-2px);box-shadow:0 5px 0 rgba(25,54,75,.1)}.sg-base1000-bank button:not(.selected){opacity:.48}
.sg-compare-base1000{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;width:min(520px,100%);position:relative;z-index:1}.sg-compare-base1000>strong{font-size:30px}.sg-mini-base1000{border:1px solid var(--line);border-radius:20px;background:var(--paper);padding:18px;display:grid;text-align:center;gap:5px}.sg-mini-base1000 b{font-size:28px}.sg-mini-base1000 span{font-size:11px;color:var(--muted);font-weight:850}
@media(max-width:640px){.sg-base1000,.sg-base1000-bank{grid-template-columns:1fr}.sg-place-column{min-height:auto}.sg-compare-base1000{gap:8px}.sg-mini-base1000{padding:12px}.sg-mini-base1000 b{font-size:22px}}
'''
if 'Singapore P2 base-1000 manipulatives' not in css: css+=css_add
write('styles.css',css)

# ---------------- engine tests ----------------
test=read('tests/engine.test.mjs')
anchor="""assert.deepEqual(skillsFor('grade1').map(s=>s.id),P1_SKILLS,'Primary 1 coverage graph changed unexpectedly');"""
insert="""const P2_A1_SKILLS=['number1000','compareOrder1000','numberPattern1000','addSub1000'];
assert.deepEqual(skillsFor('grade2').slice(0,4).map(s=>s.id),P2_A1_SKILLS,'Primary 2 A1 foundation graph changed unexpectedly');
for(const legacy of ['place100','add100','sub100','numberPattern2']) assert.ok(!skillsFor('grade2').some(s=>s.id===legacy),`legacy P2 skill still visible: ${legacy}`);
"""
test=must_replace(test,anchor,anchor+'\n'+insert,'P2 test ids')

quality_anchor="""// Singapore P1 mental-strategy coverage: no single 'make ten for everything' shortcut."""
quality_insert="""// Singapore P2-A1 quality gate: new foundational skills use the same five genuine cognitive actions.
for(const skillId of P2_A1_SKILLS){
  const concept=createConceptInstance(skillId,2,seeded);
  assert.equal(concept.skillId,skillId);
  const tasks=REPRESENTATIONS.map(rep=>generateQuestion(skillId,rep,2,seeded,concept));
  assert.equal(new Set(tasks.map(q=>q.taskKind)).size,5,`${skillId} must use five distinct cognitive task families`);
  assert.ok(new Set(tasks.map(q=>q.response.kind)).size>=3,`${skillId} must use at least three response families`);
  for(const q of tasks) assert.equal(q.taskKind,expectedKinds[q.representation],`${skillId}/${q.representation} P2 task family mismatch`);
}

"""
test=must_replace(test,quality_anchor,quality_insert+quality_anchor,'P2 quality gate')

coverage_anchor="""// Grade 2 geometry reference gate: each evidence window must require a distinct cognitive action."""
coverage_insert="""// Singapore P2-A1 scope guards.
const seen1000=new Set(), seenP2Steps=new Set(), seenP2Modes=new Set();
for(let i=0;i<1200;i++){
  const n=createConceptInstance('number1000',2,seeded); seen1000.add(n.anchor.n); seen1000.add(n.symbol.n); seen1000.add(n.transfer.n);
  const p=createConceptInstance('numberPattern1000',2,seeded); seenP2Steps.add(p.anchor.step);
  const a1=createConceptInstance('addSub1000',1,seeded); seenP2Modes.add(a1.anchor.mode);
  const a4=createConceptInstance('addSub1000',4,seeded); seenP2Modes.add(a4.anchor.mode);
}
assert.ok(seen1000.has(1000),'P2 whole numbers must include endpoint 1000');
for(const step of [1,-1,10,-10,100,-100]) assert.ok(seenP2Steps.has(step),`P2 number pattern missing step ${step}`);
assert.ok(seenP2Modes.has('mental')&&seenP2Modes.has('regroup'),'P2 add/sub must cover mental place-value work and regrouping');
const p2NumberBuild=generateQuestion('number1000','build',2,seeded,createConceptInstance('number1000',2,seeded));
assert.equal(p2NumberBuild.response.interaction,'base1000-build');
assert.equal(p2NumberBuild.visual.type,'base1000-build-interactive');
const p2AddBuild=generateQuestion('addSub1000','build',4,seeded,createConceptInstance('addSub1000',4,seeded));
assert.equal(p2AddBuild.response.interaction,'base1000-build');
assert.equal(p2AddBuild.visual.type,'base1000-operation-build');

"""
test=must_replace(test,coverage_anchor,coverage_insert+coverage_anchor,'P2 coverage tests')
write('tests/engine.test.mjs',test)

# ---------------- learning-cycle tests ----------------
lc=read('tests/learning-cycle.test.mjs')
lc_anchor="""const state=defaultState();"""
lc_insert="""const p2A1=skillsFor('grade2').filter(s=>supportsLearningCycle(s.id));
assert.deepEqual(p2A1.map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','addSub1000']);
for(const [i,skill] of p2A1.entries()){
  const sources=readinessSourcesFor(skill.id);
  assert.ok(sources.length>=1,`${skill.id} must have authentic P2 readiness provenance`);
  assert.ok(sources.every(id=>id!==skill.id));
  const q=generateLearningQuestion(skill.id,'readiness','see',1,makeSeeded(4000+i),null);
  assert.equal(q.learningPhase,'readiness');
  assert.equal(q.countsTowardEvidence,false);
  assert.ok(q.readinessSourceSkillId);
  const p=buildLearningCyclePlan(ensureSkillState(defaultState(),skill.id));
  assert.deepEqual(p.map(x=>x.phase),['readiness','model','representation','symbol','reasoning','context','practice','practice']);
}
assert.deepEqual(readinessSourcesFor('number1000'),['number100']);
assert.deepEqual(readinessSourcesFor('addSub1000'),['addSub100']);

"""
lc=must_replace(lc,lc_anchor,lc_insert+lc_anchor,'P2 learning cycle tests')
write('tests/learning-cycle.test.mjs',lc)

# ---------------- UI/static tests ----------------
ui=read('tests/ui-static.test.mjs')
ui=must_replace(ui,"'sg-base10-builder','sg-order-builder'","'sg-base10-builder','sg-base1000-builder','sg-order-builder'",'P2 CSS class test')
ui=must_replace(ui,"'bond-fill','base10-build','order-pair'","'bond-fill','base10-build','base1000-build','order-pair'",'P2 interaction marker test')
ui=must_replace(ui,"'problem-structure','compare-base10','column-operation'","'problem-structure','compare-base10','base1000','base1000-build-interactive','base1000-operation-build','compare-base1000','column-operation'",'P2 visual marker test')
old_loop="""for(const skill of skillsFor('grade1')){
  for(const rep of REPRESENTATIONS){"""
new_loop="""const renderAuditSkills=[...skillsFor('grade1'),...skillsFor('grade2').filter(s=>['number1000','compareOrder1000','numberPattern1000','addSub1000'].includes(s.id))];
for(const skill of renderAuditSkills){
  for(const rep of REPRESENTATIONS){"""
ui=must_replace(ui,old_loop,new_loop,'render audit skill set')
ui=must_replace(ui,"const standalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');","const standalone=path.join(root,'SAYMERA_v1_4_TEK_DOSYA.html');",'standalone v1.4 test')
ui=must_replace(ui,"assert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html')),'legacy standalone alias missing');","assert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html')),'v1.3 standalone alias missing');\nassert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html')),'legacy standalone alias missing');",'standalone aliases')
ui=ui.replace("SAYMERA_v1_3_TEK_DOSYA.inline.js","SAYMERA_v1_4_TEK_DOSYA.inline.js")
write('tests/ui-static.test.mjs',ui)

# ---------------- build/package/cache ----------------
build=read('build-standalone.mjs')
build=must_replace(build,
"""const currentStandalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');
const legacyStandalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');
fs.writeFileSync(currentStandalone,html);
fs.writeFileSync(legacyStandalone,html);""",
"""const currentStandalone=path.join(root,'SAYMERA_v1_4_TEK_DOSYA.html');
const v13Standalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');
const legacyStandalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');
fs.writeFileSync(currentStandalone,html);
fs.writeFileSync(v13Standalone,html);
fs.writeFileSync(legacyStandalone,html);""",'standalone builder version')
write('build-standalone.mjs',build)

pkg=json.loads(read('package.json')); pkg['version']='1.4.0'; write('package.json',json.dumps(pkg,ensure_ascii=False,indent=2)+'\n')
sw=read('sw.js'); sw=re.sub(r"const CACHE='[^']+';","const CACHE='saymera-v1-4-0-p2-a1';",sw,count=1); write('sw.js',sw)

# ---------------- migration docs ----------------
matrix=read('TASK_MIGRATION_MATRIX.md')
matrix=matrix.replace('# SAYMERA v1.2.1 — Görev Motoru Geçiş Matrisi','# SAYMERA v1.4.0 — Görev Motoru Geçiş Matrisi')
matrix=matrix.replace('- **P1-REFERENCE:** Singapur P1 coverage matrix\'ine bağlı, beş ayrı task family ve otomatik kalite kapısı var.','- **P1-REFERENCE:** Singapur P1 coverage matrix\'ine bağlı, beş ayrı task family ve otomatik kalite kapısı var.\n- **P2-REFERENCE:** Singapur P2 kapsamına bağlı, aynı beş görev ailesi + 8 aşamalı öğrenme döngüsü + adaptif pekiştirme + gecikmeli geri çağırma kalite kapısı var.')
old_rows="""| 2. sınıf | `place100` | Onluk–birlik | LEGACY |
| 2. sınıf | `add100` | 100 içinde toplama | LEGACY |
| 2. sınıf | `sub100` | 100 içinde çıkarma | LEGACY |
| 2. sınıf | `multiply5` | Gruplarla çarpma | LEGACY |
| 2. sınıf | `divide20` | Paylaştırarak bölme | LEGACY |
| 2. sınıf | `fraction` | Yarım ve çeyrek | LEGACY |
| 2. sınıf | `word2` | İki ilişkili problem | LEGACY |
| 2. sınıf | `numberPattern2` | Sayı örüntüsü | LEGACY |
| 2. sınıf | `shapes2` | Şekil/cisim ilişkileri | **REFERENCE** |
| 2. sınıf | `lengthCm` | Santimetre | LEGACY |
| 2. sınıf | `time2` | Saat | LEGACY |
| 2. sınıf | `moneyTL` | Para | LEGACY |
| 2. sınıf | `data2` | Sütun grafiği | LEGACY |"""
new_rows="""| 2. sınıf | `number1000` | 1000’e kadar sayı ve basamak | **P2-REFERENCE** |
| 2. sınıf | `compareOrder1000` | 1000’e kadar karşılaştırma/sıralama | **P2-REFERENCE** |
| 2. sınıf | `numberPattern1000` | 1/10/100 ile sayı örüntüleri | **P2-REFERENCE** |
| 2. sınıf | `addSub1000` | 1000 içinde toplama/çıkarma | **P2-REFERENCE** |
| 2. sınıf | `multiply5` | Gruplarla çarpma | LEGACY |
| 2. sınıf | `divide20` | Paylaştırarak bölme | LEGACY |
| 2. sınıf | `fraction` | Yarım ve çeyrek | LEGACY |
| 2. sınıf | `word2` | İki ilişkili problem | LEGACY |
| 2. sınıf | `shapes2` | Şekil/cisim ilişkileri | **REFERENCE** |
| 2. sınıf | `lengthCm` | Santimetre | LEGACY |
| 2. sınıf | `time2` | Saat | LEGACY |
| 2. sınıf | `moneyTL` | Para | LEGACY |
| 2. sınıf | `data2` | Sütun grafiği | LEGACY |"""
if old_rows not in matrix: raise SystemExit('migration matrix grade2 rows missing')
matrix=matrix.replace(old_rows,new_rows)
matrix=re.sub(r"Toplam: \*\*43 beceri\*\*\.[^\n]*","Toplam: **43 beceri**. Bunun **22'si P1-REFERENCE**, **4'ü P2-REFERENCE**, **1'i Grade 2 REFERENCE** ve **16'sı LEGACY** durumundadır.",matrix)
write('TASK_MIGRATION_MATRIX.md',matrix)

p2=read('SINGAPORE_P2_COVERAGE.md')
progress="""

## Uygulama ilerlemesi — v1.4.0 / P2-A1

İlk temel katman **P2-REFERENCE** seviyesine taşındı:

- `number1000` — 1000'e kadar sayı ve yüzlük–onluk–birlik
- `compareOrder1000` — 1000'e kadar karşılaştırma ve sıralama
- `numberPattern1000` — ±1, ±10, ±100 sabit değişim örüntüleri
- `addSub1000` — zihinsel basamak işlemleri, 3 basamaklı standart işlemler ve yeniden gruplama

Eski `place100`, `add100`, `sub100` ve `numberPattern2` becerileri görünür P2 haritasından çıkarıldı. Yeni beceriler yeni kimliklerle oluşturuldu; böylece eski, daha kolay içeriğe ait yerel ilerleme yeni Singapore P2 içeriğine yanlışlıkla taşınmaz.

Sıradaki P2-A2: tek/çift sayılar + 1–2 adımlı toplama/çıkarma problem yapıları.
"""
if 'Uygulama ilerlemesi — v1.4.0 / P2-A1' not in p2: p2+=progress
write('SINGAPORE_P2_COVERAGE.md',p2)

print('v1.4.0 Singapore P2-A1 migration staged')
