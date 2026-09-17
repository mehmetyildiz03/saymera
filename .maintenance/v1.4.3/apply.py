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

engine=read('engine.mjs')
engine=rep(engine,
"  'fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'\n]);",
"  'times23510','divisionTables2','multDivFamilies2',\n  'fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'\n]);",'learning-cycle mult-div ids')
engine=rep(engine,
"  skill('multiply5','grade2','Gruplarla çarpma','Çarpma','green',['addSub1000']),\n  skill('divide20','grade2','Paylaştırarak bölme','Bölme','teal',['multiply5']),",
"  skill('times23510','grade2','2, 3, 4, 5 ve 10 çarpım tabloları','Çarpma','green'),\n  skill('divisionTables2','grade2','Bölme ve ÷ gösterimi','Bölme','teal',['times23510']),\n  skill('multDivFamilies2','grade2','Çarpma–bölme işlem aileleri','İşlem ilişkileri','violet',['divisionTables2']),",'visible P2 mult-div graph')

cases=r'''
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
'''
engine=insert_before(engine,'function fractionMeaning2Cases(maxDenom=12){',cases,'mult-div cases')
engine=rep(engine,
"  if(skillId==='wordAddSub2') return make('one-two-step-add-sub-problems',wordAddSub2Cases());\n  if(skillId==='fractionMeaning2')",
"  if(skillId==='wordAddSub2') return make('one-two-step-add-sub-problems',wordAddSub2Cases());\n  if(skillId==='times23510') return make('tables-2-3-4-5-10',times23510Cases(d));\n  if(skillId==='divisionTables2'){ const all=divisionTables2Cases(d); return makeP2Concept(skillId,'division-symbol-within-tables',d,rng,all,z=>z.total<=24&&z.groups<=6); }\n  if(skillId==='multDivFamilies2'){ const all=multDivFamily2Cases(d); return makeP2Concept(skillId,'multiplication-division-fact-families',d,rng,all,z=>z.total<=30&&z.multiplier<=6); }\n  if(skillId==='fractionMeaning2')",'mult-div concept routes')

generators=r'''
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
'''
engine=insert_before(engine,'function genFractionMeaning2(rep,d,rng,concept){',generators,'mult-div generators')
engine=rep(engine,
"  number1000:genNumber1000,compareOrder1000:genCompareOrder1000,numberPattern1000:genNumberPattern1000,oddEven1000:genOddEven1000,addSub1000:genAddSub1000,wordAddSub2:genWordAddSub2,\n  fractionMeaning2:genFractionMeaning2",
"  number1000:genNumber1000,compareOrder1000:genCompareOrder1000,numberPattern1000:genNumberPattern1000,oddEven1000:genOddEven1000,addSub1000:genAddSub1000,wordAddSub2:genWordAddSub2,\n  times23510:genTimes23510,divisionTables2:genDivisionTables2,multDivFamilies2:genMultDivFamilies2,\n  fractionMeaning2:genFractionMeaning2",'generator map mult-div')
engine=rep(engine,
"  wordAddSub2:['word1'],\n  fractionMeaning2:['partwhole5']",
"  wordAddSub2:['word1'],\n  times23510:['multiply40'],\n  divisionTables2:['divide20g1'],\n  fractionMeaning2:['partwhole5']",'readiness mult-div sources')
engine=rep(engine,
"  number1000:'numbers-to-1000-place-value',compareOrder1000:'compare-order-to-1000',numberPattern1000:'one-ten-hundred-patterns-to-1000',oddEven1000:'odd-even-pairing-to-1000',addSub1000:'addition-subtraction-within-1000',wordAddSub2:'one-two-step-add-sub-problems',\n  fractionMeaning2:",
"  number1000:'numbers-to-1000-place-value',compareOrder1000:'compare-order-to-1000',numberPattern1000:'one-ten-hundred-patterns-to-1000',oddEven1000:'odd-even-pairing-to-1000',addSub1000:'addition-subtraction-within-1000',wordAddSub2:'one-two-step-add-sub-problems',\n  times23510:'tables-2-3-4-5-10',divisionTables2:'division-symbol-within-tables',multDivFamilies2:'multiplication-division-fact-families',\n  fractionMeaning2:",'concept keys mult-div')
write('engine.mjs',engine)

# Engine tests
p=read('tests/engine.test.mjs')
p=rep(p,
"const P2_FRACTION_SKILLS=['fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'];\nconst P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS,...P2_FRACTION_SKILLS];",
"const P2_MULT_DIV_SKILLS=['times23510','divisionTables2','multDivFamilies2'];\nconst P2_FRACTION_SKILLS=['fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'];\nconst P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS,...P2_MULT_DIV_SKILLS,...P2_FRACTION_SKILLS];",'engine test P2 list')
p=rep(p,
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2']",
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2']",'engine test P2 order')
p=rep(p,
"for(const legacy of ['place100','add100','sub100','numberPattern2','word2','fraction'])",
"for(const legacy of ['place100','add100','sub100','numberPattern2','word2','multiply5','divide20','fraction'])",'legacy P2 hidden guard')
mult_tests=r'''
// Singapore P2 multiplication/division progression: table structure precedes ÷ notation, then inverse fact families.
const seenP2TableFactors=new Set();
for(let i=0;i<700;i++){
  const t=createConceptInstance('times23510',4,seeded);
  seenP2TableFactors.add(t.anchor.factor); seenP2TableFactors.add(t.symbol.factor); seenP2TableFactors.add(t.transfer.factor);
}
assert.deepEqual([...seenP2TableFactors].sort((a,b)=>a-b),[2,3,4,5,10],'P2 multiplication must cover tables 2,3,4,5,10');
const tableConcept=createConceptInstance('times23510',3,seeded);
const tableBuild=generateQuestion('times23510','build',3,seeded,tableConcept);
assert.equal(tableBuild.response.interaction,'pattern-step','P2 table construction should build the skip-count pattern without excessive tapping');
const divisionConcept=createConceptInstance('divisionTables2',3,seeded);
const divisionBuild=generateQuestion('divisionTables2','build',3,seeded,divisionConcept);
assert.ok(!divisionBuild.prompt.includes('÷'),'division model must be built before ÷ notation is assumed');
const divisionSee=generateQuestion('divisionTables2','see',3,seeded,divisionConcept);
assert.match(divisionSee.teachingNote,/÷/,'÷ notation must be explicitly taught in the representation phase');
const divisionSymbol=generateQuestion('divisionTables2','symbol',3,seeded,divisionConcept);
assert.match(divisionSymbol.prompt,/÷/,'symbol phase should assess ÷ only after it has been taught');
const familyConcept=createConceptInstance('multDivFamilies2',3,seeded);
const familySee=generateQuestion('multDivFamilies2','see',3,seeded,familyConcept);
assert.equal(familySee.response.kind,'visual-choice');
assert.match(familySee.explain,/×/); assert.match(familySee.explain,/÷/);
const familyTransfer=generateQuestion('multDivFamilies2','transfer',3,seeded,familyConcept);
assert.match(familyTransfer.prompt,/eşit dağıtırsan/);

'''
p=insert_before(p,'// Singapore P2 fraction progression:',mult_tests,'P2 mult-div tests')
write('tests/engine.test.mjs',p)

# Learning-cycle tests
p=read('tests/learning-cycle.test.mjs')
p=rep(p,
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2']",
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2']",'learning cycle P2 order')
p=rep(p,
"assert.deepEqual(readinessSourcesFor('wordAddSub2'),['word1']);\nassert.deepEqual(readinessSourcesFor('fractionMeaning2'),['partwhole5']);",
"assert.deepEqual(readinessSourcesFor('wordAddSub2'),['word1']);\nassert.deepEqual(readinessSourcesFor('times23510'),['multiply40']);\nassert.deepEqual(readinessSourcesFor('divisionTables2'),['divide20g1']);\nassert.deepEqual(readinessSourcesFor('multDivFamilies2'),['divisionTables2']);\nassert.deepEqual(readinessSourcesFor('fractionMeaning2'),['partwhole5']);",'learning cycle readiness mult-div')
write('tests/learning-cycle.test.mjs',p)

# Version and cache
pkg=json.loads(read('package.json')); pkg['version']='1.4.3'; write('package.json',json.dumps(pkg,ensure_ascii=False,indent=2)+'\n')
sw=read('sw.js'); sw=re.sub(r"^const CACHE='[^']+';", "const CACHE='saymera-v1-4-3-p2-mult-div';", sw, count=1); write('sw.js',sw)

# Coverage document: current plan and migration status.
cov=read('SINGAPORE_P2_COVERAGE.md')
cov=re.sub(r"### P2-B — Multiplication/Division \+ Fractions\n.*?\n### P2-C — Measurement \+ Time \+ Money",
"""### P2-B — Multiplication/Division + Fractions
7. `times23510` — 2/3/4/5/10 tabloları ve tablo örüntüleri
8. `divisionTables2` — eşit paylaşma/gruplama ve `÷` gösterimi
9. `multDivFamilies2` — çarpma–bölme ters ilişkisi ve dört temel işlem ailesi
10. `fractionMeaning2` — eş parçalar ve bütün
11. `fractionNotation2` — kesirleri okuma/yazma
12. `fractionCompare2` — birim ve eş paydalı kesirleri karşılaştırma/sıralama
13. `fractionAddSub2` — eş paydalı kesirlerde toplama/çıkarma

### P2-C — Measurement + Time + Money""",cov,flags=re.S)
cov=re.sub(r"### P2-C — Measurement \+ Time \+ Money\n11\.","### P2-C — Measurement + Time + Money\n14.",cov)
cov=cov.replace("12. `massMetric2`","15. `massMetric2`").replace("13. `volumeLitre2`","16. `volumeLitre2`").replace("14. `timeP2`","17. `timeP2`").replace("15. `moneyP2`","18. `moneyP2`")
cov=cov.replace("16. `shapes2D2`","19. `shapes2D2`").replace("17. `solids2`","20. `solids2`").replace("18. `shapePatterns2`","21. `shapePatterns2`").replace("19. `pictureGraphScale2`","22. `pictureGraphScale2`")
cov=cov.replace("| `multiply5` | küçük eşit gruplar | **Yetersiz** — 2/3/4/5/10 tabloları gerekli |\n| `divide20` | 20 içinde paylaşma | **Yetersiz** — tablo ilişkisi ve ÷ gerekli |\n| `fraction` | yalnız yarım/çeyrek | **Yetersiz** — daha geniş kesir yapısı gerekli |",
"| `times23510` | 2/3/4/5/10 tabloları ve örüntüler | **P2-REFERENCE** |\n| `divisionTables2` | paylaşma/gruplama, `÷`, tablo içi bölme | **P2-REFERENCE** |\n| `multDivFamilies2` | çarpma–bölme ters ilişkisi | **P2-REFERENCE** |\n| `fractionMeaning2`–`fractionAddSub2` | anlam → gösterim → karşılaştırma → eş paydalı işlemler | **P2-REFERENCE** |")
progress="""

## Uygulama ilerlemesi — v1.4.2 / P2-B Kesirler

Kesir katmanı tek bir legacy beceriden dört aşamalı P2-REFERENCE zincirine ayrıldı: eş parça/bütün → gösterim → karşılaştırma/sıralama → eş paydalı toplama/çıkarma. Kesir sembolü anlam kurulmadan sınanmıyor.

## Uygulama ilerlemesi — v1.4.3 / P2-B Çarpma ve Bölme

Legacy `multiply5` ve `divide20` görünür haritadan çıkarıldı. Yerlerine:

- `times23510` — 2, 3, 4, 5 ve 10 tabloları; sabit-adım örüntüsü, zihinsel fact ve tek adımlı problem
- `divisionTables2` — önce eşit paylaşma/gruplama modeli, ardından `÷` gösteriminin açık öğretimi ve tablo içi bölme
- `multDivFamilies2` — iki çarpma + iki bölme cümlesinden oluşan fact family ve ters işlem düşüncesi

eklendi. Üçü de gerçek ön-bilgi kaynağı, beş farklı görev ailesi, adaptif pekiştirme ve gecikmeli geri çağırma sözleşmesine dahildir.

Sıradaki katman: P2-C — ölçme (m/cm, kg/g, litre), zaman ve para.
"""
if '## Uygulama ilerlemesi — v1.4.3 / P2-B Çarpma ve Bölme' not in cov: cov+=progress
write('SINGAPORE_P2_COVERAGE.md',cov)

# Migration matrix
m=read('TASK_MIGRATION_MATRIX.md')
m=m.replace("| 2. sınıf | `multiply5` | Gruplarla çarpma | LEGACY |\n| 2. sınıf | `divide20` | Paylaştırarak bölme | LEGACY |",
"| 2. sınıf | `times23510` | 2/3/4/5/10 çarpım tabloları | **P2-REFERENCE** |\n| 2. sınıf | `divisionTables2` | Bölme ve ÷ gösterimi | **P2-REFERENCE** |\n| 2. sınıf | `multDivFamilies2` | Çarpma–bölme işlem aileleri | **P2-REFERENCE** |")
m=m.replace("Toplam: **47 beceri**. Bunun **22'si P1-REFERENCE**, **10'u P2-REFERENCE**, **1'i Grade 2 REFERENCE** ve **14'ü LEGACY** durumundadır.",
"Toplam: **48 beceri**. Bunun **22'si P1-REFERENCE**, **13'ü P2-REFERENCE**, **1'i Grade 2 REFERENCE** ve **12'si LEGACY** durumundadır.")
write('TASK_MIGRATION_MATRIX.md',m)

# Reference note
write('P2_MULT_DIV_REFERENCE.md',"""# Singapore P2 Multiplication & Division — SAYMERA v1.4.3

Kaynak: Singapore MOE Primary Mathematics Syllabus P1–P6, Updated Oct 2025, Primary Two — Multiplication and Division.

Resmî P2 sıra:

1. multiplication tables of 2, 3, 4, 5 and 10
2. use of `÷`
3. relationship between multiplication and division
4. multiplying and dividing within those tables
5. one-step multiplication/division problems
6. mental calculation within those tables

SAYMERA karşılığı:

- `times23510`: tablo örüntülerini kur, gör, sembolleştir, gerekçelendir ve günlük probleme taşı.
- `divisionTables2`: `÷` sembolünü önceden biliniyor sayma; önce eşit paylaşma/gruplama modelini kur, temsil aşamasında `÷` gösterimini açıkça öğret, sonra sembolik bölmeyi ölç.
- `multDivFamilies2`: aynı üç sayıdan iki çarpma ve iki bölme cümlesi üret; çarpma–bölme ters ilişkisini kullan.

Pedagojik invariant: **modelden önce sembol yok; sembol öğretildikten sonra ölçüm var.** İlk öğrenme, SAYMERA'nın 8 aşamalı döngüsünü izler ve başarılı ilk döngüden sonra gecikmeli geri çağırma planlanır.

Official source: https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf
""")

print('v1.4.3 P2 multiplication/division migration staged')
