from pathlib import Path
import json

root=Path('.')

def read(p): return (root/p).read_text(encoding='utf-8')
def write(p,s): (root/p).write_text(s,encoding='utf-8')
def rep(s,old,new,label):
    c=s.count(old)
    if c!=1: raise SystemExit(f'{label}: expected 1 anchor, found {c}')
    return s.replace(old,new,1)

engine=read('engine.mjs')
engine=rep(engine,
"  'number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2'\n]);",
"  'number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2',\n  'fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'\n]);",'learning-cycle fraction ids')
engine=rep(engine,
"  skill('fraction','grade2','Yarım ve çeyrek','Kesir','rose'),",
"  skill('fractionMeaning2','grade2','Eş parçalar ve bütün','Kesir','rose'),\n  skill('fractionNotation2','grade2','Kesirleri okuma ve yazma','Kesir','rose',['fractionMeaning2']),\n  skill('fractionCompare2','grade2','Kesirleri karşılaştırma ve sıralama','Kesir','violet',['fractionNotation2']),\n  skill('fractionAddSub2','grade2','Eş paydalı kesirlerde toplama ve çıkarma','Kesir','teal',['fractionCompare2']),",'fraction skill graph')

fraction_cases=r'''
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
'''
engine=rep(engine,'export function createConceptInstance(skillId,difficulty=1,rng=Math.random){',fraction_cases+'\nexport function createConceptInstance(skillId,difficulty=1,rng=Math.random){','fraction cases')
engine=rep(engine,
"  if(skillId==='wordAddSub2') return make('one-two-step-add-sub-problems',wordAddSub2Cases());\n  if(skillId==='shapes2')",
"  if(skillId==='wordAddSub2') return make('one-two-step-add-sub-problems',wordAddSub2Cases());\n  if(skillId==='fractionMeaning2') return make('fraction-equal-parts-whole',fractionPoolForDifficulty('meaning',d));\n  if(skillId==='fractionNotation2') return make('fraction-notation-representation',fractionPoolForDifficulty('notation',d));\n  if(skillId==='fractionCompare2') return make('fraction-compare-unit-like',fractionPoolForDifficulty('compare',d));\n  if(skillId==='fractionAddSub2') return make('fraction-like-add-sub',fractionPoolForDifficulty('addsub',d));\n  if(skillId==='shapes2')",'fraction concept routes')

fraction_generators=r'''
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
function genFractionMeaning2(rep,d,rng,concept){
  const c=concept?.skillId==='fractionMeaning2'?concept:createConceptInstance('fractionMeaning2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('fractionMeaning2',rep,`Bütün ${x.denom} eş parçaya ayrıldı. Tam bir eş parçayı boya.`,1,{kind:'manipulative',interaction:'fraction-shade',expectedValue:'1',checkLabel:'Modeli kontrol et'},{taskKind:'manipulative-build',taskLabel:'Bir eş parçayı modelle',visual:{type:'fraction-shade-builder',denom:x.denom,target:1},hint:'Yalnızca bir eş parçayı seç.',explain:`Bütün ${x.denom} eş parçaya ayrıldı ve bunlardan biri seçildi.`});
  if(rep==='see'){
    const wrong=[{numerator:1,denom:Math.max(2,x.denom-1)},{numerator:1,denom:x.denom+1},{numerator:Math.min(2,x.denom-1),denom:x.denom}];
    return qTask('fractionMeaning2',rep,`Hangisi ${x.denom} eş parçadan yalnız birini gösteriyor?`,'correct',{kind:'visual-choice',options:fractionVisualOptions(x,wrong,rng)},{taskKind:'visual-discrimination',taskLabel:'Eş parça modelini ayırt et',visual:{type:'equal-parts-guide',denom:x.denom},hint:'Önce bütünün kaç eş parçaya ayrıldığına bak.',explain:`Doğru model ${x.denom} eş parçaya ayrılmış ve yalnız bir parçası boyalı.`});
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
  if(rep==='build') return qTask('fractionNotation2',rep,`Bütünü ${x.denom} eş parça olarak düşün. ${x.numerator} parçayı boya.`,x.numerator,{kind:'manipulative',interaction:'fraction-shade',expectedValue:String(x.numerator),checkLabel:'Modeli kontrol et'},{taskKind:'manipulative-build',taskLabel:'Sözel kesri modelle',visual:{type:'fraction-shade-builder',denom:x.denom,target:x.numerator},hint:`Toplam ${x.denom} eş parça var; ${x.numerator} tanesini seç.`,explain:`${x.denom} eş parçadan ${x.numerator} tanesi seçildi.`});
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
'''
engine=rep(engine,'function genFraction(rep,d,rng){',fraction_generators+'\nfunction genFraction(rep,d,rng){','fraction generators')
engine=rep(engine,
"  number1000:genNumber1000,compareOrder1000:genCompareOrder1000,numberPattern1000:genNumberPattern1000,oddEven1000:genOddEven1000,addSub1000:genAddSub1000,wordAddSub2:genWordAddSub2,",
"  number1000:genNumber1000,compareOrder1000:genCompareOrder1000,numberPattern1000:genNumberPattern1000,oddEven1000:genOddEven1000,addSub1000:genAddSub1000,wordAddSub2:genWordAddSub2,\n  fractionMeaning2:genFractionMeaning2,fractionNotation2:genFractionNotation2,fractionCompare2:genFractionCompare2,fractionAddSub2:genFractionAddSub2,",'fraction generators registry')
engine=rep(engine,"  wordAddSub2:['word1']\n};","  wordAddSub2:['word1'],\n  fractionMeaning2:['partwhole5']\n};",'fraction readiness fallback')
engine=rep(engine,
"  number1000:'numbers-to-1000-place-value',compareOrder1000:'compare-order-to-1000',numberPattern1000:'one-ten-hundred-patterns-to-1000',oddEven1000:'odd-even-pairing-to-1000',addSub1000:'addition-subtraction-within-1000',wordAddSub2:'one-two-step-add-sub-problems',",
"  number1000:'numbers-to-1000-place-value',compareOrder1000:'compare-order-to-1000',numberPattern1000:'one-ten-hundred-patterns-to-1000',oddEven1000:'odd-even-pairing-to-1000',addSub1000:'addition-subtraction-within-1000',wordAddSub2:'one-two-step-add-sub-problems',\n  fractionMeaning2:'fraction-equal-parts-whole',fractionNotation2:'fraction-notation-representation',fractionCompare2:'fraction-compare-unit-like',fractionAddSub2:'fraction-like-add-sub',",'fraction concept keys')
write('engine.mjs',engine)

app=read('app.js')
app=rep(app,
"      <h2>${esc(q.prompt)}</h2>\n      <div class=\"visual-stage ${q.response?.kind==='visual-choice'?'reference-stage':''}\" id=\"visualStage\">${renderVisual(q.visual,q)}</div>",
"      <h2>${esc(q.prompt)}</h2>\n      ${q.teachingNote?`<div class=\"teaching-note\">${esc(q.teachingNote)}</div>`:''}\n      <div class=\"visual-stage ${q.response?.kind==='visual-choice'?'reference-stage':''}\" id=\"visualStage\">${renderVisual(q.visual,q)}</div>",'teaching note render')
app=rep(app,
"  if(interaction==='base1000-build'){\n    const root=$('.sg-base1000-builder');\n    root?.querySelectorAll('.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));\n  }",
"  if(interaction==='base1000-build'){\n    const root=$('.sg-base1000-builder');\n    root?.querySelectorAll('.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));\n  }\n  if(interaction==='fraction-shade'||interaction==='fraction-pair-build'||interaction==='fraction-operation-build'){\n    const root=$(interaction==='fraction-shade'?'.sg-fraction-shade-builder':interaction==='fraction-pair-build'?'.sg-fraction-pair-builder':'.sg-fraction-operation-builder');\n    root?.querySelectorAll('.sg-fraction-cell').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));\n  }",'fraction interaction wire')
app=rep(app,
"  if(interaction==='base1000-build') return `${$$('.sg-base1000-builder .sg-base1000-hundred.selected').length}|${$$('.sg-base1000-builder .sg-base1000-ten.selected').length}|${$$('.sg-base1000-builder .sg-base1000-one.selected').length}`;",
"  if(interaction==='base1000-build') return `${$$('.sg-base1000-builder .sg-base1000-hundred.selected').length}|${$$('.sg-base1000-builder .sg-base1000-ten.selected').length}|${$$('.sg-base1000-builder .sg-base1000-one.selected').length}`;\n  if(interaction==='fraction-shade') return $$('.sg-fraction-shade-builder .sg-fraction-cell.selected').length;\n  if(interaction==='fraction-pair-build') return `${$$('.sg-fraction-pair-builder [data-side=\"left\"] .sg-fraction-cell.selected').length}|${$$('.sg-fraction-pair-builder [data-side=\"right\"] .sg-fraction-cell.selected').length}`;\n  if(interaction==='fraction-operation-build') return $$('.sg-fraction-operation-builder .sg-fraction-result .sg-fraction-cell.selected').length;",'fraction manipulator readers')
app=rep(app,
"  else if(q.response?.interaction==='base1000-build') { const [h='0',t='0',o='0']=String(value).split('|'); node.textContent=`Modelin: ${h} yüzlük · ${t} onluk · ${o} birlik`; }",
"  else if(q.response?.interaction==='base1000-build') { const [h='0',t='0',o='0']=String(value).split('|'); node.textContent=`Modelin: ${h} yüzlük · ${t} onluk · ${o} birlik`; }\n  else if(q.response?.interaction==='fraction-shade') node.textContent=`Boyadığın eş parça: ${value}`;\n  else if(q.response?.interaction==='fraction-pair-build') node.textContent=value?`Modellerin: ${String(value).replace('|',' ve ')}`:'İki modeli de kur';\n  else if(q.response?.interaction==='fraction-operation-build') node.textContent=`Sonuçta boyadığın parça: ${value}`;",'fraction status')
app=rep(app,
".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach",
".sg-three-token,.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-fraction-cell').forEach",'disable fraction cells')
app=rep(app,
"    case 'fraction': return fractionSvg(v.denom);",
"    case 'fraction-strip': return fractionStrip(v.numerator,v.denom);\n    case 'fraction-shade-builder': return fractionShadeBuilder(v.denom,v.target);\n    case 'fraction-pair-builder': return fractionPairBuilder(v.left,v.right);\n    case 'fraction-pair': return fractionPairVisual(v.left,v.right);\n    case 'fraction-operation-builder': return fractionOperationBuilder(v);\n    case 'fraction-operation': return fractionOperationVisual(v);\n    case 'fraction-notation-card': return fractionNotationCard(v.numerator,v.denom);\n    case 'equal-parts-guide': return equalPartsGuide(v.denom);\n    case 'chocolate-parts': return chocolateParts(v.denom);\n    case 'pizza-fraction': return pizzaFraction(v.numerator,v.denom);\n    case 'fraction': return fractionSvg(v.denom);",'fraction render cases')
helpers=r'''
function fractionStrip(numerator=0,denom=2){
  const d=Math.max(2,Number(denom)||2), n=Math.max(0,Math.min(d,Number(numerator)||0));
  return `<div class="sg-fraction-strip" style="--den:${d}" aria-label="${d} eş parçadan ${n} boyalı">${Array.from({length:d},(_,i)=>`<i class="${i<n?'filled':''}"></i>`).join('')}</div>`;
}
function fractionShadeBuilder(denom,target){
  const d=Math.max(2,Number(denom)||2);
  return `<div class="sg-fraction-shade-builder"><small>${d} EŞ PARÇA</small><div class="sg-fraction-strip interactive" style="--den:${d}">${Array.from({length:d},(_,i)=>`<button type="button" class="sg-fraction-cell" aria-label="${i+1}. eş parça"></button>`).join('')}</div><em>${target} parçayı boya</em></div>`;
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
'''
app=rep(app,'function fractionSvg(denom){',helpers+'\nfunction fractionSvg(denom){','fraction helpers')
write('app.js',app)

css=read('styles.css')
css_add=r'''

/* v1.4.2 — Singapore P2 fraction learning sequence */
.teaching-note{width:min(720px,100%);margin:0 auto 16px;padding:14px 16px;border:1px solid #cfe5df;border-radius:18px;background:var(--teal-soft);color:var(--ink-2);font-size:13px;line-height:1.55;font-weight:760;text-align:left}
.sg-fraction-strip{display:grid;grid-template-columns:repeat(var(--den),minmax(16px,48px));gap:3px;justify-content:center;align-items:stretch;position:relative;z-index:1}.sg-fraction-strip>i,.sg-fraction-strip>.sg-fraction-cell{height:54px;border:2px solid #66716c;background:#fff;display:block}.sg-fraction-strip>i:first-child,.sg-fraction-strip>.sg-fraction-cell:first-child{border-radius:12px 0 0 12px}.sg-fraction-strip>i:last-child,.sg-fraction-strip>.sg-fraction-cell:last-child{border-radius:0 12px 12px 0}.sg-fraction-strip>i.filled,.sg-fraction-strip>.sg-fraction-cell.selected{background:var(--teal)}.sg-fraction-strip.interactive>.sg-fraction-cell{min-width:0;padding:0;transition:background .15s ease,transform .15s ease}.sg-fraction-strip.interactive>.sg-fraction-cell:active{transform:scale(.95)}
.sg-fraction-shade-builder,.sg-equal-parts-guide,.sg-pizza-fraction{display:grid;gap:12px;justify-items:center;position:relative;z-index:1}.sg-fraction-shade-builder small,.sg-equal-parts-guide small{font-size:10px;font-weight:950;color:var(--muted);letter-spacing:.08em}.sg-fraction-shade-builder em{font-style:normal;font-size:11px;font-weight:850;color:var(--muted)}
.sg-fraction-pair-builder,.sg-fraction-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;width:min(680px,100%);align-items:center;position:relative;z-index:1}.sg-fraction-pair-builder>div,.sg-fraction-pair>div{display:grid;gap:9px;justify-items:center}.sg-fraction-pair>strong{display:none}.sg-fraction-pair b,.sg-fraction-pair-builder b{font-size:15px}.sg-fraction-operation-builder{display:grid;gap:14px;justify-items:center;width:min(760px,100%);position:relative;z-index:1}.sg-fraction-operation-builder>span{font-size:10px;font-weight:950;color:var(--muted)}.sg-fraction-operation-row{display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}.sg-fraction-operation-row>div{display:grid;gap:7px;justify-items:center}.sg-fraction-operation-row>strong{font-size:25px}.sg-fraction-question{width:70px;height:54px;border-radius:12px;border:2px dashed var(--line-strong);display:grid;place-items:center;font-size:25px;font-weight:950}.sg-fraction-notation-card{display:grid;gap:12px;justify-items:center;position:relative;z-index:1}.sg-fraction-notation-card>div:nth-child(2){display:grid;grid-template-rows:auto 2px auto;gap:3px;justify-items:center;font-size:23px}.sg-fraction-notation-card>div:nth-child(2) i{width:34px;height:2px;background:var(--ink)}.sg-fraction-notation-card small{font-size:11px;color:var(--muted);font-weight:800}.sg-chocolate-parts{display:grid;grid-template-columns:repeat(var(--den),minmax(28px,50px));gap:4px;position:relative;z-index:1}.sg-chocolate-parts i{height:54px;border-radius:8px;background:#9c673f;color:#f8e6d0;display:grid;place-items:center;font-style:normal;font-size:9px;font-weight:900;box-shadow:inset 0 0 0 2px rgba(80,44,23,.2)}.sg-pizza-fraction>span{font-size:58px}.sg-pizza-fraction>b{font-size:12px}
@media(max-width:600px){.sg-fraction-strip{grid-template-columns:repeat(var(--den),minmax(10px,32px));gap:2px}.sg-fraction-strip>i,.sg-fraction-strip>.sg-fraction-cell{height:46px}.sg-fraction-pair-builder,.sg-fraction-pair{grid-template-columns:1fr;gap:13px}.sg-fraction-operation-row{gap:8px}.sg-fraction-operation-row>strong{font-size:20px}.sg-chocolate-parts{grid-template-columns:repeat(var(--den),minmax(18px,32px))}.sg-chocolate-parts i{height:42px}}
'''
if 'Singapore P2 fraction learning sequence' not in css: css+=css_add
write('styles.css',css)

et=read('tests/engine.test.mjs')
et=rep(et,
"const P2_A2_SKILLS=['oddEven1000','wordAddSub2'];\nconst P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS];\nassert.deepEqual(skillsFor('grade2').filter(s=>P2_REFERENCE_SKILLS.includes(s.id)).map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2'],'Primary 2 reference graph changed unexpectedly');\nfor(const legacy of ['place100','add100','sub100','numberPattern2','word2'])",
"const P2_A2_SKILLS=['oddEven1000','wordAddSub2'];\nconst P2_FRACTION_SKILLS=['fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'];\nconst P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS,...P2_FRACTION_SKILLS];\nassert.deepEqual(skillsFor('grade2').filter(s=>P2_REFERENCE_SKILLS.includes(s.id)).map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2'],'Primary 2 reference graph changed unexpectedly');\nfor(const legacy of ['place100','add100','sub100','numberPattern2','word2','fraction'])",'engine P2 reference list')
fraction_tests=r'''

// Singapore P2 fraction progression: meaning precedes notation; notation precedes comparison and like-fraction operations.
const meaningConcept=createConceptInstance('fractionMeaning2',2,seeded);
const meaningSymbol=generateQuestion('fractionMeaning2','symbol',2,seeded,meaningConcept);
assert.equal(meaningSymbol.response.kind,'number-input');
assert.ok(!meaningSymbol.prompt.includes('/'),'fraction meaning must not assume symbolic notation before it is taught');
const notationConcept=createConceptInstance('fractionNotation2',2,seeded);
const notationSee=generateQuestion('fractionNotation2','see',2,seeded,notationConcept);
assert.match(notationSee.teachingNote,/\d+\/\d+/,'fraction notation must be explicitly taught before symbolic assessment');
const notationSymbol=generateQuestion('fractionNotation2','symbol',2,seeded,notationConcept);
assert.match(notationSymbol.answer,/^\d+\/\d+$/);
const seenFractionDenoms=new Set(), seenCompareKinds=new Set();
for(let i=0;i<1200;i++){
  const n=createConceptInstance('fractionNotation2',4,seeded); seenFractionDenoms.add(n.anchor.denom);
  const c=createConceptInstance('fractionCompare2',4,seeded); seenCompareKinds.add(c.anchor.kind); assert.ok(c.anchor.left.denom<=12&&c.anchor.right.denom<=12);
  const a=createConceptInstance('fractionAddSub2',4,seeded); assert.ok(a.anchor.denom<=12); assert.ok(a.anchor.result<=a.anchor.denom); assert.equal(a.anchor.denom,a.anchor.denom);
}
assert.ok(seenFractionDenoms.has(12),'P2 fraction notation must reach denominators up to 12');
assert.deepEqual([...seenCompareKinds].sort(),['like','unit'],'P2 comparison must include unit and like fractions');
const fracBuild=generateQuestion('fractionNotation2','build',2,seeded,notationConcept);
assert.equal(fracBuild.response.interaction,'fraction-shade');
const compareBuild=generateQuestion('fractionCompare2','build',2,seeded,createConceptInstance('fractionCompare2',2,seeded));
assert.equal(compareBuild.response.interaction,'fraction-pair-build');
const addSubBuild=generateQuestion('fractionAddSub2','build',2,seeded,createConceptInstance('fractionAddSub2',2,seeded));
assert.equal(addSubBuild.response.interaction,'fraction-operation-build');
'''
et=rep(et,'// Grade 2 geometry reference gate:',fraction_tests+'\n// Grade 2 geometry reference gate:','fraction tests')
write('tests/engine.test.mjs',et)

lt=read('tests/learning-cycle.test.mjs')
lt=rep(lt,
"assert.deepEqual(p2Reference.map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2']);",
"assert.deepEqual(p2Reference.map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2']);",'learning P2 list')
lt=rep(lt,
"assert.deepEqual(readinessSourcesFor('wordAddSub2'),['word1']);",
"assert.deepEqual(readinessSourcesFor('wordAddSub2'),['word1']);\nassert.deepEqual(readinessSourcesFor('fractionMeaning2'),['partwhole5']);\nassert.deepEqual(readinessSourcesFor('fractionNotation2'),['fractionMeaning2']);\nassert.deepEqual(readinessSourcesFor('fractionCompare2'),['fractionNotation2']);\nassert.deepEqual(readinessSourcesFor('fractionAddSub2'),['fractionCompare2']);",'fraction readiness tests')
write('tests/learning-cycle.test.mjs',lt)

matrix=read('TASK_MIGRATION_MATRIX.md')
matrix=matrix.replace('# SAYMERA v1.4.1','# SAYMERA v1.4.2')
matrix=rep(matrix,"| 2. sınıf | `fraction` | Yarım ve çeyrek | LEGACY |","| 2. sınıf | `fractionMeaning2` | Eş parçalar ve bütün | **P2-REFERENCE** |\n| 2. sınıf | `fractionNotation2` | Kesirleri okuma ve yazma | **P2-REFERENCE** |\n| 2. sınıf | `fractionCompare2` | Kesirleri karşılaştırma/sıralama | **P2-REFERENCE** |\n| 2. sınıf | `fractionAddSub2` | Eş paydalı kesirlerde toplama/çıkarma | **P2-REFERENCE** |",'matrix fraction rows')
matrix=matrix.replace('Toplam: **44 beceri**. Bunun **22\'si P1-REFERENCE**, **6\'sı P2-REFERENCE**, **1\'i Grade 2 REFERENCE** ve **15\'i LEGACY** durumundadır.','Toplam: **47 beceri**. Bunun **22\'si P1-REFERENCE**, **10\'u P2-REFERENCE**, **1\'i Grade 2 REFERENCE** ve **14\'ü LEGACY** durumundadır.')
write('TASK_MIGRATION_MATRIX.md',matrix)

pkg=json.loads(read('package.json')); pkg['version']='1.4.2'; write('package.json',json.dumps(pkg,ensure_ascii=False,indent=2)+'\n')
sw=read('sw.js'); sw=sw.replace("saymera-v1-4-1","saymera-v1-4-2-fractions"); write('sw.js',sw)

doc='''# Singapore P2 Fractions — SAYMERA v1.4.2\n\nResmî Singapore MOE Primary 2 kapsamına göre kesir katmanı dört ayrı beceriye bölünür:\n\n1. Fraction as part of a whole → `fractionMeaning2`\n2. Notation and representations of fractions → `fractionNotation2`\n3. Comparing and ordering unit/like fractions, denominators ≤ 12 → `fractionCompare2`\n4. Adding/subtracting like fractions within one whole, denominators ≤ 12 → `fractionAddSub2`\n\nPedagojik invariant: kesir sembolü anlam kurulmadan sınanmaz. İlk beceri eş parça/bütün ilişkisini sembolik kesir yazımı varsaymadan kurar. İkinci becerinin temsil aşamasında `a/b` gösterimi açıkça öğretilir; daha sonraki sembol görevleri bunu ölçer.\n\nKaynak: Singapore Ministry of Education, Primary Mathematics Syllabus P1–P6, Primary Two, Fractions (Updated Dec 2024 / current syllabus family).\nhttps://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-dec-2024.pdf\n'''
write('P2_FRACTIONS_REFERENCE.md',doc)
print('v1.4.2 P2 fractions migration staged')
