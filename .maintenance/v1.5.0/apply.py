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
"  'lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2'\n]);",
"  'lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2',\n  'shapePatterns2','solids2','pictureGraphScale2'\n]);",'P2-D learning-cycle ids')
engine=rep(engine,
"  skill('moneyP2','grade2','TL, kuruş ve ondalık para gösterimi','Para','teal'),\n  skill('shapes2','grade2','Şekil ve cisim ilişkileri','Geometri','rose'),\n  skill('data2','grade2','Sütun grafiğini yorumlama','Veri','amber',['number1000']),",
"  skill('moneyP2','grade2','TL, kuruş ve ondalık para gösterimi','Para','teal'),\n  skill('shapePatterns2','grade2','2B şekillerle örüntüler','Geometri','rose'),\n  skill('solids2','grade2','3B cisimleri tanıma ve sınıflandırma','Geometri','violet'),\n  skill('pictureGraphScale2','grade2','Ölçekli resimli grafikleri okuma','Veri','amber'),",'replace P2-D visible skills')

cases=r'''
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
'''
engine=insert_before(engine,'function fractionMeaning2Cases(maxDenom=12){',cases,'P2-D cases')
engine=rep(engine,
"  if(skillId==='moneyP2') return make('money-decimal-cents-conversion',moneyP2Cases());\n  if(skillId==='shapes2') return make('solid-properties-and-invariance',shapes2Cases());",
"  if(skillId==='moneyP2') return make('money-decimal-cents-conversion',moneyP2Cases());\n  if(skillId==='shapePatterns2') return make('p2-shape-pattern-attributes',p2ShapePatternCases());\n  if(skillId==='solids2') return make('p2-solid-identify-classify',p2SolidCases());\n  if(skillId==='pictureGraphScale2') return make('p2-scaled-picture-graphs',scaledPictureGraphCases());\n  if(skillId==='shapes2') return make('solid-properties-and-invariance',shapes2Cases());",'P2-D concept routes')

gens=r'''
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
'''
engine=insert_before(engine,'function genFractionMeaning2(rep,d,rng,concept){',gens,'P2-D generators')
engine=rep(engine,
"  lengthMetre2:genLengthMetre2,massMetric2:genMassMetric2,volumeLitre2:genVolumeLitre2,timeMinute2:genTimeMinute2,timeDuration2:genTimeDuration2,moneyP2:genMoneyP2,\n  place100:",
"  lengthMetre2:genLengthMetre2,massMetric2:genMassMetric2,volumeLitre2:genVolumeLitre2,timeMinute2:genTimeMinute2,timeDuration2:genTimeDuration2,moneyP2:genMoneyP2,\n  shapePatterns2:genShapePatterns2,solids2:genSolids2,pictureGraphScale2:genPictureGraphScale2,\n  place100:",'P2-D generator map')
engine=rep(engine,
"  moneyP2:['money1'],\n  fractionMeaning2:['partwhole5']",
"  moneyP2:['money1'],\n  shapePatterns2:['shapes1'],\n  solids2:['shapes1'],\n  pictureGraphScale2:['data1'],\n  fractionMeaning2:['partwhole5']",'P2-D readiness sources')
engine=rep(engine,
"  lengthMetre2:'length-in-metres',massMetric2:'mass-grams-kilograms',volumeLitre2:'liquid-volume-litres',timeMinute2:'time-to-the-minute',timeDuration2:'hours-minutes-duration-conversion',moneyP2:'money-decimal-cents-conversion',\n  fractionMeaning2:",
"  lengthMetre2:'length-in-metres',massMetric2:'mass-grams-kilograms',volumeLitre2:'liquid-volume-litres',timeMinute2:'time-to-the-minute',timeDuration2:'hours-minutes-duration-conversion',moneyP2:'money-decimal-cents-conversion',\n  shapePatterns2:'p2-shape-pattern-attributes',solids2:'p2-solid-identify-classify',pictureGraphScale2:'p2-scaled-picture-graphs',\n  fractionMeaning2:",'P2-D concept keys')
write('engine.mjs',engine)

# ---------- app ----------
app=read('app.js')
app=rep(app,
"  if(interaction==='shape-pattern'){\n    const root=$('.sg-shape-pattern-builder'); root?.querySelectorAll('.sg-shape-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-shape-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));\n  }",
"  if(interaction==='shape-pattern'){\n    const root=$('.sg-shape-pattern-builder'); root?.querySelectorAll('.sg-shape-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-shape-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='p2-shape-pattern'){\n    const root=$('.p2-shape-pattern-builder'); root?.querySelectorAll('.p2-shape-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.p2-shape-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='solid-classify'){\n    const root=$('.p2-solid-classify-builder'); root?.querySelectorAll('.p2-solid-bin').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.p2-solid-bin').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='scaled-pictograph-row'){\n    const root=$('.p2-scaled-graph-builder'); root?.querySelectorAll('.p2-graph-icon-button').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));\n  }",'P2-D interaction handlers')
app=rep(app,
"  if(interaction==='shape-pattern') return $('.sg-shape-pattern-builder .sg-shape-choice.selected')?.dataset.value ?? null;\n  if(interaction==='three-add')",
"  if(interaction==='shape-pattern') return $('.sg-shape-pattern-builder .sg-shape-choice.selected')?.dataset.value ?? null;\n  if(interaction==='p2-shape-pattern') return $('.p2-shape-pattern-builder .p2-shape-choice.selected')?.dataset.value ?? null;\n  if(interaction==='solid-classify') return $('.p2-solid-classify-builder .p2-solid-bin.selected')?.dataset.value ?? null;\n  if(interaction==='scaled-pictograph-row') return $$('.p2-scaled-graph-builder .p2-graph-icon-button.selected').length;\n  if(interaction==='three-add')",'P2-D manipulator reads')
app=rep(app,
"  else if(q.response?.interaction==='shape-pattern') node.textContent=value?'Sıradaki şekli seçtin':'Örüntüyü tamamlayacak şekli seç';\n  else if(q.response?.interaction==='three-add')",
"  else if(q.response?.interaction==='shape-pattern') node.textContent=value?'Sıradaki şekli seçtin':'Örüntüyü tamamlayacak şekli seç';\n  else if(q.response?.interaction==='p2-shape-pattern') node.textContent=value?'Örüntüyü tamamlayacak parçayı seçtin':'Boyut, şekil, renk ve yön düzenini izle';\n  else if(q.response?.interaction==='solid-classify') node.textContent=value?'Sınıflandırma grubunu seçtin':'Cismin düz ve eğri yüzeylerini düşün';\n  else if(q.response?.interaction==='scaled-pictograph-row') node.textContent=`Grafiğe koyduğun resim: ${value}`;\n  else if(q.response?.interaction==='three-add')",'P2-D manipulator status')
# Disable new controls: anchor current v1.4.4 selector added by previous migration.
app=rep(app,
".sg-plan-op,.sg-fraction-cell,.sg-measure-token,.sg-duration-token,.sg-minute-adjust').forEach(b=>b.disabled=true);",
".sg-plan-op,.sg-fraction-cell,.sg-measure-token,.sg-duration-token,.sg-minute-adjust,.p2-shape-choice,.p2-solid-bin,.p2-graph-icon-button').forEach(b=>b.disabled=true);",'P2-D disable controls')
app=rep(app,
"    case 'fraction-strip': return fractionStrip(v.numerator,v.denom);",
"    case 'p2-shape-pattern-builder': return p2ShapePatternBuilder(v.items,v.options);\n    case 'p2-shape-pattern': return p2ShapePatternVisual(v.items);\n    case 'p2-tile-border': return `<div class=\"p2-tile-border\">${p2ShapePatternVisual(v.items)}</div>`;\n    case 'p2-solid': return p2SolidVisual(v.kind);\n    case 'p2-solid-classify-builder': return p2SolidClassifyBuilder(v.kind,v.name);\n    case 'p2-solid-property-card': return p2SolidPropertyCard(v.kind,v.property);\n    case 'p2-solid-scene': return p2SolidScene(v.kind);\n    case 'scaled-picture-graph': return scaledPictureGraph(v.cats,v.icons,v.scale,v.highlight);\n    case 'scaled-pictograph-builder': return scaledPictographBuilder(v.category,v.target,v.scale,v.maxIcons);\n    case 'scaled-graph-answer-card': return `<div class=\"p2-graph-answer-card\"><small>${esc(v.category)}</small><b>${v.value}</b></div>`;\n    case 'fraction-strip': return fractionStrip(v.numerator,v.denom);",'P2-D render cases')

helpers=r'''
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
'''
app=insert_before(app,'function measureTokenLabel(value,unit){',helpers,'P2-D app helpers')
write('app.js',app)

# ---------- CSS ----------
css=read('styles.css')
css += r'''

/* SAYMERA v1.5.0 · Singapore P2 geometry + scaled picture graphs */
.p2-shape-pattern-builder,.p2-scaled-graph-builder,.p2-solid-classify-builder{width:100%;min-width:0}
.p2-shape-seq,.p2-shape-bank{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
.p2-shape-bank{margin-top:18px}.p2-shape-choice{display:grid;place-items:center;min-width:76px;min-height:76px;border:1px solid var(--line);border-radius:18px;background:var(--surface)}
.p2-shape-choice.selected,.p2-solid-bin.selected,.p2-graph-icon-button.selected{outline:3px solid var(--teal);outline-offset:2px}
.p2-shape-token{display:inline-block;width:48px;height:48px;background:var(--teal);transform:rotate(var(--turn,0deg));transform-origin:center}
.p2-shape-token.small{width:34px;height:34px}.p2-shape-token.large{width:60px;height:60px}.p2-shape-token.circle{border-radius:50%}.p2-shape-token.rect{width:64px;height:40px;border-radius:7px}.p2-shape-token.triangle{width:0;height:0;background:transparent;border-left:25px solid transparent;border-right:25px solid transparent;border-bottom:46px solid var(--teal)}
.p2-shape-token.tone-amber{background:var(--amber)}.p2-shape-token.tone-blue{background:var(--blue)}.p2-shape-token.tone-rose{background:var(--rose)}
.p2-shape-token.triangle.tone-amber{background:transparent;border-bottom-color:var(--amber)}.p2-shape-token.triangle.tone-blue{background:transparent;border-bottom-color:var(--blue)}.p2-shape-token.triangle.tone-rose{background:transparent;border-bottom-color:var(--rose)}
.p2-shape-gap{display:grid;place-items:center;width:54px;height:54px;border:2px dashed var(--line);border-radius:14px;font-size:26px;font-weight:900}.p2-tile-border{padding:18px;border-radius:20px;background:var(--surface)}
.p2-solid-target,.p2-solid-property-card{display:grid;justify-items:center;gap:10px}.p2-solid-bins{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}.p2-solid-bin{min-height:62px;padding:10px;border:1px solid var(--line);border-radius:16px;background:var(--surface);font-weight:800}.solid-cone-body{fill:var(--blue-soft);stroke:var(--navy);stroke-width:3}.scene-cone{fill:var(--amber);stroke:var(--navy);stroke-width:3}.scene-cone-base{fill:var(--navy)}.scene-cone-stripe{fill:var(--surface)}.p2-solid-scene{display:grid;justify-items:center;gap:6px}.p2-solid-scene svg{width:min(260px,100%)}
.p2-scaled-picture-graph{display:grid;gap:10px;width:min(560px,100%);margin:auto}.p2-graph-legend{justify-self:end;padding:7px 11px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-weight:800}.p2-graph-row{display:grid;grid-template-columns:minmax(80px,1fr) 3fr;gap:12px;align-items:center;padding:10px 12px;border-radius:14px}.p2-graph-row.highlight{background:var(--teal-soft)}.p2-graph-row span{display:flex;gap:6px;flex-wrap:wrap}.p2-graph-row i{font-style:normal;font-size:25px}.p2-build-target{display:grid;gap:10px}.p2-build-target>div{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.p2-graph-icon-button{width:52px;height:52px;border:1px solid var(--line);border-radius:14px;background:var(--surface);font-size:25px}.p2-graph-answer-card{display:grid;gap:5px;text-align:center}.p2-graph-answer-card b{font-size:30px}
@media(max-width:560px){.p2-solid-bins{grid-template-columns:1fr}.p2-shape-token{width:42px;height:42px}.p2-shape-token.large{width:52px;height:52px}.p2-shape-token.rect{width:54px;height:36px}}
'''
write('styles.css',css)

# ---------- tests ----------
t=read('tests/engine.test.mjs')
t=rep(t,
"const P2_MEASURE_TIME_MONEY_SKILLS=['lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2'];\nconst P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS,...P2_MULT_DIV_SKILLS,...P2_FRACTION_SKILLS,...P2_MEASURE_TIME_MONEY_SKILLS];",
"const P2_MEASURE_TIME_MONEY_SKILLS=['lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2'];\nconst P2_GEOMETRY_DATA_SKILLS=['shapePatterns2','solids2','pictureGraphScale2'];\nconst P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS,...P2_MULT_DIV_SKILLS,...P2_FRACTION_SKILLS,...P2_MEASURE_TIME_MONEY_SKILLS,...P2_GEOMETRY_DATA_SKILLS];",'P2-D test list')
t=rep(t,
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2']",
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2','shapePatterns2','solids2','pictureGraphScale2']",'P2-D expected order')
t=rep(t,
"for(const legacy of ['place100','add100','sub100','numberPattern2','word2','multiply5','divide20','fraction','lengthCm','time2','moneyTL'])",
"for(const legacy of ['place100','add100','sub100','numberPattern2','word2','multiply5','divide20','fraction','lengthCm','time2','moneyTL','shapes2','data2'])",'hide P2-D legacy')
qtests=r'''
// Singapore P2-D current geometry/data guards.
const patternAttrs=new Set(), patternAttrCounts=new Set();
for(let i=0;i<500;i++){
  const p=createConceptInstance('shapePatterns2',2,seeded); p.anchor.attrs.forEach(a=>patternAttrs.add(a)); patternAttrCounts.add(p.anchor.attrs.length);
}
for(const attr of ['size','shape','colour','orientation']) assert.ok(patternAttrs.has(attr),`P2 shape patterns missing ${attr}`);
assert.ok(patternAttrCounts.has(1)&&patternAttrCounts.has(2),'P2 shape patterns must use one or two attributes');
const p2Pattern=createConceptInstance('shapePatterns2',2,seeded);
assert.equal(generateQuestion('shapePatterns2','build',2,seeded,p2Pattern).response.interaction,'p2-shape-pattern');
assert.match(generateQuestion('shapePatterns2','explain',2,seeded,p2Pattern).explain,/değiş|tekrar/i);

const seenSolids=new Set();
for(let i=0;i<500;i++){
  const s=createConceptInstance('solids2',2,seeded); seenSolids.add(s.anchor.id); seenSolids.add(s.symbol.id); seenSolids.add(s.transfer.id);
}
assert.deepEqual([...seenSolids].sort(),['cone','cube','cuboid','cylinder','sphere'].sort(),'P2 solids must cover cube/cuboid/cone/cylinder/sphere');
const coneConcept={version:2,skillId:'solids2',conceptKey:'p2-solid-identify-classify',difficulty:2,anchor:{id:'cone',name:'Koni',kind:'cone',classKey:'flat-curved',property:'1 dairesel düz yüzü, 1 eğri yüzeyi ve 1 köşesi vardır',scene:'cone',roll:'Eğri yüzeyi üzerinde yuvarlanabilir'},symbol:{id:'cube',name:'Küp',kind:'cube',classKey:'flat-only',property:'6 kare düz yüzü, 12 kenarı ve 8 köşesi vardır',scene:'dice',roll:'Kolay yuvarlanmaz'},transfer:{id:'sphere',name:'Küre',kind:'sphere',classKey:'curved-only',property:'Düz yüzü, kenarı ve köşesi yoktur; eğri yüzeyi vardır',scene:'ball',roll:'Her yönde yuvarlanabilir'}};
const coneBuild=generateQuestion('solids2','build',2,seeded,coneConcept);
assert.equal(coneBuild.response.interaction,'solid-classify');
assert.equal(coneBuild.answer,'flat-curved');
const coneSee=generateQuestion('solids2','see',2,seeded,coneConcept);
assert.equal(coneSee.response.kind,'visual-choice');

const graphScales=new Set();
for(let i=0;i<400;i++) graphScales.add(createConceptInstance('pictureGraphScale2',2,seeded).anchor.scale);
assert.ok(graphScales.has(2)&&graphScales.has(5),'P2 scaled picture graphs should exercise non-1 scales');
const graphConcept=createConceptInstance('pictureGraphScale2',2,seeded);
const graphBuild=generateQuestion('pictureGraphScale2','build',2,seeded,graphConcept);
assert.equal(graphBuild.response.interaction,'scaled-pictograph-row');
assert.ok(graphBuild.visual.scale>1,'P2 graph build must genuinely use a scale');
const graphSymbol=generateQuestion('pictureGraphScale2','symbol',2,seeded,graphConcept);
assert.equal(Number(graphSymbol.answer),graphConcept.symbol.icons[2]*graphConcept.symbol.scale);
const graphTransfer=generateQuestion('pictureGraphScale2','transfer',2,seeded,graphConcept);
assert.equal(graphTransfer.response.kind,'number-input');
assert.ok(!JSON.stringify([graphBuild,graphSymbol,graphTransfer]).includes('bar-chart'),'P2 data core must not silently regress to bar charts');

'''
t=insert_before(t,'// Grade 2 geometry reference gate:',qtests,'P2-D tests')
# old shapes2 reference gate should be removed since skill hidden; delete from marker to next stable section if present.
t=re.sub(r"// Grade 2 geometry reference gate:.*?(?=\n//|\nconst [A-Za-z])","",t,flags=re.S)
write('tests/engine.test.mjs',t)

lc=read('tests/learning-cycle.test.mjs')
lc=rep(lc,
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2']",
"['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2','times23510','divisionTables2','multDivFamilies2','fractionMeaning2','fractionNotation2','fractionCompare2','fractionAddSub2','lengthMetre2','massMetric2','volumeLitre2','timeMinute2','timeDuration2','moneyP2','shapePatterns2','solids2','pictureGraphScale2']",'P2-D learning-cycle order')
lc=rep(lc,
"assert.deepEqual(readinessSourcesFor('moneyP2'),['money1']);",
"assert.deepEqual(readinessSourcesFor('moneyP2'),['money1']);\nassert.deepEqual(readinessSourcesFor('shapePatterns2'),['shapes1']);\nassert.deepEqual(readinessSourcesFor('solids2'),['shapes1']);\nassert.deepEqual(readinessSourcesFor('pictureGraphScale2'),['data1']);",'P2-D readiness tests')
write('tests/learning-cycle.test.mjs',lc)

ui=read('tests/ui-static.test.mjs')
ui=rep(ui,
"'sg-measure-builder','sg-duration-builder','sg-clock-minute-set'",
"'sg-measure-builder','sg-duration-builder','sg-clock-minute-set','p2-shape-pattern-builder','p2-solid-classify-builder','p2-scaled-graph-builder'",'P2-D UI classes')
write('tests/ui-static.test.mjs',ui)

# ---------- version/docs ----------
pkg=json.loads(read('package.json')); pkg['version']='1.5.0'; write('package.json',json.dumps(pkg,ensure_ascii=False,indent=2)+'\n')
sw=read('sw.js'); sw=re.sub(r"^const CACHE='[^']+';", "const CACHE='saymera-v1-5-0-singapore-p2-complete';",sw,count=1); write('sw.js',sw)

matrix=read('TASK_MIGRATION_MATRIX.md')
matrix=matrix.replace("| 2. sınıf | `shapes2` | Şekil/cisim ilişkileri | **REFERENCE** |\n| 2. sınıf | `data2` | Sütun grafiği | LEGACY |",
"| 2. sınıf | `shapePatterns2` | 2B şekillerle bir/iki özellikli örüntüler | **P2-REFERENCE** |\n| 2. sınıf | `solids2` | Küp/dikdörtgen prizma/koni/silindir/küre | **P2-REFERENCE** |\n| 2. sınıf | `pictureGraphScale2` | Ölçekli resimli grafik | **P2-REFERENCE** |")
matrix=matrix.replace("Toplam: **51 beceri**. Bunun **22'si P1-REFERENCE**, **19'u P2-REFERENCE**, **1'i Grade 2 REFERENCE** ve **9'u LEGACY** durumundadır.",
"Toplam: **52 beceri**. Bunun **22'si P1-REFERENCE**, **22'si P2-REFERENCE** ve **8'i okul öncesi LEGACY** durumundadır. Singapore P1 ve P2 çekirdek kapsamı artık referans kalite kapısından geçmektedir.")
write('TASK_MIGRATION_MATRIX.md',matrix)

cov=read('SINGAPORE_P2_COVERAGE.md')
cov=cov.replace("| `shapes2` | 3B cisim ilişkileri | **Kısmi referans** — koni ve daha geniş P2 özellik seti eklenecek |\n| `data2` | sütun grafiği | **Yanlış çekirdek** — P2 çekirdeği ölçekli resimli grafiktir |",
"| `shapePatterns2` | 2B şekillerde bir/iki özellikli örüntü | **P2-REFERENCE** |\n| `solids2` | küp/dikdörtgen prizma/koni/silindir/küre | **P2-REFERENCE** |\n| `pictureGraphScale2` | ölçekli resimli grafik okuma/yorumlama | **P2-REFERENCE** |")
progress="""

## Uygulama ilerlemesi — v1.5.0 / P2-D Geometri ve Veri

Güncel P2 geometri/veri çekirdeği tamamlandı:
- `shapePatterns2`: boyut, şekil, renk ve yön özelliklerinden bir veya ikisini kullanarak örüntü kurma/tamamlama/açıklama
- `solids2`: küp, dikdörtgen prizma, koni, silindir ve küreyi tanıma, adlandırma, betimleme ve sınıflandırma
- `pictureGraphScale2`: ölçekli resimli grafikleri okuma/yorumlama ve grafikten tek adımlı problem çözme

Legacy `shapes2` ve yanlış P2 çekirdeği olan `data2` görünür haritadan çıkarıldı. Böylece Singapore Primary 2 çekirdek kapsamındaki 22 atomik becerinin tamamı SAYMERA öğrenme döngüsü ve beş gerçek bilişsel görev ailesiyle P2-REFERENCE durumuna geldi.
"""
if '## Uygulama ilerlemesi — v1.5.0 / P2-D Geometri ve Veri' not in cov: cov+=progress
write('SINGAPORE_P2_COVERAGE.md',cov)

write('P2_GEOMETRY_DATA_REFERENCE.md',"""# Singapore P2 Geometry & Data — SAYMERA v1.5.0

Kaynak: Singapore MOE Primary Mathematics Syllabus P1–P6, current Primary Two scope.

## P2 geometry
- make/complete 2D shape patterns using one or two attributes: size, shape, colour, orientation
- identify, name, describe and classify: cube, cuboid, cone, cylinder, sphere

## P2 statistics
- read and interpret picture graphs with scales
- solve one-step questions from the graph as a learning experience

## SAYMERA reference skills
- `shapePatterns2`
- `solids2`
- `pictureGraphScale2`

All three use readiness → model → representation → symbol → reasoning → context → adaptive practice → delayed retrieval. Old `data2` bar-chart content is not treated as P2 core.

Official source: https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf
""")
print('v1.5.0 P2-D migration staged')
