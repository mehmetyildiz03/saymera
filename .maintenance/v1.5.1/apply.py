from pathlib import Path
import json

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
"  'shapePatterns2','solids2','pictureGraphScale2'\n]);",
"  'shapes2D2','shapePatterns2','solids2','solidPatterns2','pictureGraphScale2'\n]);",'learning-cycle geometry ids')
engine=rep(engine,
"  skill('shapePatterns2','grade2','2B şekillerle örüntüler','Geometri','rose'),\n  skill('solids2','grade2','3B cisimleri tanıma ve sınıflandırma','Geometri','violet'),\n  skill('pictureGraphScale2','grade2','Ölçekli resimli grafikleri okuma','Veri','amber'),",
"  skill('shapes2D2','grade2','2B şekilleri oluşturma ve ızgarada kopyalama','Geometri','teal'),\n  skill('shapePatterns2','grade2','2B şekillerle örüntüler','Geometri','rose',['shapes2D2']),\n  skill('solids2','grade2','3B cisimleri tanıma ve sınıflandırma','Geometri','violet'),\n  skill('solidPatterns2','grade2','3B cisimlerle örüntüler','Geometri','blue',['solids2']),\n  skill('pictureGraphScale2','grade2','Ölçekli resimli grafikleri okuma','Veri','amber'),",'P2 geometry skill graph')

helpers=r'''
function p2GridCellsForFigure(figure){
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
function p2SolidPatternCases(){
  const T=(kind,size='medium',colour='teal',orientation=0)=>`${kind}|${size}|${colour}|${orientation}`;
  return [
    {items:[T('cube'),T('cylinder'),T('cube'),T('cylinder')],next:T('cube'),code:'ABAB',attrs:['shape'],rule:'Küp ve silindir sırayla tekrar ediyor'},
    {items:[T('cone','small'),T('cone','large'),T('cone','small'),T('cone','large')],next:T('cone','small'),code:'ABAB',attrs:['size'],rule:'Koni küçük ve büyük olarak sırayla değişiyor'},
    {items:[T('cuboid','medium','amber'),T('cuboid','medium','blue'),T('cuboid','medium','amber'),T('cuboid','medium','blue')],next:T('cuboid','medium','amber'),code:'ABAB',attrs:['colour'],rule:'Dikdörtgen prizmanın rengi iki renk arasında sırayla değişiyor'},
    {items:[T('cone','medium','teal',0),T('cone','medium','teal',180),T('cone','medium','teal',0),T('cone','medium','teal',180)],next:T('cone','medium','teal',0),code:'ABAB',attrs:['orientation'],rule:'Koninin yönü yukarı ve aşağı olarak sırayla değişiyor'},
    {items:[T('cube','medium','teal'),T('cylinder','medium','amber'),T('cube','medium','teal'),T('cylinder','medium','amber')],next:T('cube','medium','teal'),code:'ABAB',attrs:['shape','colour'],rule:'Cisim türü ve renk birlikte iki durum arasında değişiyor'},
    {items:[T('cuboid','small','blue',0),T('cuboid','large','blue',90),T('cuboid','small','blue',0),T('cuboid','large','blue',90)],next:T('cuboid','small','blue',0),code:'ABAB',attrs:['size','orientation'],rule:'Boyut ve yön birlikte sırayla değişiyor'},
    {items:[T('cone','small','rose'),T('cube','large','rose'),T('cone','small','rose'),T('cube','large','rose')],next:T('cone','small','rose'),code:'ABAB',attrs:['shape','size'],rule:'Cisim türü ve boyut birlikte iki durum arasında değişiyor'},
    {items:[T('cube','medium','teal'),T('cone','medium','amber'),T('cylinder','medium','blue'),T('cube','medium','teal'),T('cone','medium','amber')],next:T('cylinder','medium','blue'),code:'ABCABC',attrs:['shape','colour'],rule:'Üç farklı cisim-renk çifti aynı sırayla tekrar ediyor'}
  ];
}
'''
engine=insert_before(engine,'function p2ShapePatternCases(){',helpers,'P2 geometry helpers')

engine=rep(engine,
"  if(skillId==='moneyP2') return make('money-decimal-cents-conversion',moneyP2Cases());\n  if(skillId==='shapePatterns2') return make('p2-shape-pattern-attributes',p2ShapePatternCases());\n  if(skillId==='solids2') return make('p2-solid-identify-classify',p2SolidCases());\n  if(skillId==='pictureGraphScale2') return make('p2-scaled-picture-graphs',scaledPictureGraphCases());",
"  if(skillId==='moneyP2') return make('money-decimal-cents-conversion',moneyP2Cases());\n  if(skillId==='shapes2D2') return make('p2-2d-compose-copy',shapePatternCases());\n  if(skillId==='shapePatterns2') return make('p2-shape-pattern-attributes',p2ShapePatternCases());\n  if(skillId==='solids2') return make('p2-solid-identify-classify',p2SolidCases());\n  if(skillId==='solidPatterns2') return make('p2-solid-pattern-attributes',p2SolidPatternCases());\n  if(skillId==='pictureGraphScale2') return make('p2-scaled-picture-graphs',scaledPictureGraphCases());",'P2 geometry concept routes')

gens=r'''
function genShapes2D2(rep,d,rng,concept){
  const c=concept?.skillId==='shapes2D2'?concept:createConceptInstance('shapes2D2',d,rng), x=c.anchor;
  const key=z=>[...z.pieces].sort().join('+');
  const names={square:'Kare',triangle:'Üçgen',rect:'Dikdörtgen',halfCircle:'Yarım daire',quarterCircle:'Çeyrek daire',circle:'Daire'};
  if(rep==='build') return qTask('shapes2D2',rep,'Hedef figürü oluşturan temel şekillerin hepsini seç.',key(x),{kind:'manipulative',interaction:'shape-compose',expectedValue:key(x),checkLabel:'Parçaları kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'Temel 2B şekillerden birleşik figür oluştur',visual:{type:'shape-compose-interactive',figure:x.figure,pieces:x.pieces},hint:'Figürün sınırlarına bak; hangi temel parçaların birleştiğini tek tek bul.',explain:`Bu figür ${x.pieces.map(p=>names[p]||p).join(', ')} parçalarından oluşuyor.`
  });
  if(rep==='see'){
    const all=shapePatternCases(), wrong=shuffled(all.filter(z=>key(z)!==key(x)),rng).slice(0,2);
    const opts=shuffled([x,...wrong].map((z,i)=>({value:z===x?'correct':`wrong-${i}`,visual:{type:'shape-piece-list',pieces:z.pieces},ariaLabel:'temel şekil parçaları'})),rng);
    return qTask('shapes2D2',rep,'Gösterilen birleşik figürü oluşturan temel şekiller hangi seçenekte?','correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Birleşik figürdeki temel şekilleri ayırt et',visual:{type:'composite-figure',figure:x.figure},hint:'Bütünü zihninde parçalara ayır ve düz/eğri sınırları izle.',explain:`Doğru parça kümesi ${x.pieces.map(p=>names[p]||p).join(', ')}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol, focus=choice(y.pieces,rng), answer=names[focus]||focus;
    return qBase('shapes2D2',rep,'Gösterilen temel 2B şeklin matematiksel adı nedir?',answer,semanticChoices(answer,Object.values(names).filter(n=>n!==answer),rng),{
      taskKind:'symbol-entry',taskLabel:'2B şekli matematiksel adıyla ifade et',visual:{type:'shape-piece-list',pieces:[focus]},hint:'Düz kenar ve eğri sınır sayısını düşün.',explain:`Bu şeklin adı ${answer.toLowerCase()}.`
    });
  }
  if(rep==='explain'){
    const answer='Birleşik figürü oluşturan temel şekilleri ortak sınırlarından ayırarak incelerim';
    return qBase('shapes2D2',rep,'Birleşik bir figürün hangi temel şekillerden oluştuğunu nasıl anlarsın?',answer,semanticChoices(answer,['Yalnız figürün rengine bakarım','Parçaları saymadan rastgele adlandırırım','Figür büyüdükçe şekil adları değişir'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Bileşik şekli parçalara ayırma düşüncesini açıkla',visual:{type:'composite-figure',figure:x.figure},hint:'Bütün figürdeki iç sınırlar sana parçaları gösterebilir.',explain:answer+'.'
    });
  }
  const y=c.transfer, cells=p2GridCellsForFigure(y.figure), expected=[...cells].sort().join('|');
  return qTask('shapes2D2',rep,'Mozaikteki şekli boş kareli alana aynen kopyala.',expected,{kind:'manipulative',interaction:'square-grid-copy',expectedValue:expected,checkLabel:'Kopyamı kontrol et'},{
    taskKind:'context-transfer',taskLabel:'2B figürü kareli alana kopyala',visual:{type:'square-grid-copy-interactive',size:5,cells,figure:y.figure},hint:'Satır satır ilerle; hedefte dolu olan hücreleri aynı konuma taşı.',explain:'Kopyada her dolu hücre hedeftekiyle aynı satır ve sütunda olmalı.'
  });
}

function solidPatternOptionPool(x,rng=Math.random){
  const pool=[x.next];
  for(const z of shuffled(p2SolidPatternCases(),rng)){ if(!pool.includes(z.next)) pool.push(z.next); if(pool.length>=4)break; }
  return pool;
}
function genSolidPatterns2(rep,d,rng,concept){
  const c=concept?.skillId==='solidPatterns2'?concept:createConceptInstance('solidPatterns2',d,rng), x=c.anchor;
  if(rep==='build') return qTask('solidPatterns2',rep,'3B cisim örüntüsünü incele ve sıradaki cismi seç.',x.next,{kind:'manipulative',interaction:'p2-solid-pattern',expectedValue:x.next,checkLabel:'Örüntüyü kontrol et'},{
    taskKind:'manipulative-build',taskLabel:'3B cisim örüntüsünü kur',visual:{type:'p2-solid-pattern-builder',items:x.items,options:solidPatternOptionPool(x,rng)},hint:'Cisim türü, boyut, renk ve yön özelliklerinden hangilerinin düzenli değiştiğini izle.',explain:`Kural: ${x.rule}.`
  });
  if(rep==='see'){
    const wrong=shuffled(p2SolidPatternCases().filter(z=>z.next!==x.next),rng).slice(0,2);
    const opts=shuffled([x,...wrong].map((z,i)=>({value:z===x?'correct':`wrong-${i}`,visual:{type:'p2-solid-pattern',items:[...x.items,z.next]},ariaLabel:'tamamlanmış 3B cisim örüntüsü'})),rng);
    return qTask('solidPatterns2',rep,'Aynı kuralı sürdüren tamamlanmış 3B örüntü hangisi?','correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'3B örüntü kuralını görselde ayırt et',visual:{type:'p2-solid-pattern',items:[...x.items,'?']},hint:'Her adımda değişen bir ya da iki özelliği karşılaştır.',explain:`Doğru seçenek: ${x.rule}.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qBase('solidPatterns2',rep,'Bu 3B örüntünün tekrar yapısını harflerle nasıl gösterebiliriz?',y.code,semanticChoices(y.code,['ABAB','ABCABC','AABB','ABBA'].filter(z=>z!==y.code),rng),{
      taskKind:'symbol-entry',taskLabel:'3B örüntüyü kısa tekrar koduyla ifade et',visual:{type:'p2-solid-pattern',items:y.items},hint:'Aynı özellik birleşimine aynı harfi ver ve tekrar sırasını izle.',explain:`Tekrar kodu ${y.code}.`
    });
  }
  if(rep==='explain'){
    const answer=x.rule;
    return qBase('solidPatterns2',rep,'Bu 3B cisim örüntüsünün kuralını hangi açıklama doğru anlatır?',answer,semanticChoices(answer,['Cisimler rastgele yerleştirilmiş','Küre her örüntüde olmak zorundadır','Yalnız cisimlerin sayısı önemlidir'],rng),{
      taskKind:'reasoning-choice',taskLabel:'3B örüntünün değişen özelliklerini gerekçelendir',visual:{type:'p2-solid-pattern',items:[...x.items,x.next]},hint:'Şekil, boyut, renk ve yönü ayrı ayrı kontrol et.',explain:answer+'.'
    });
  }
  const y=c.transfer, correct=y.next, alternatives=solidPatternOptionPool(y,rng).filter(z=>z!==correct).slice(0,3);
  const opts=shuffled([{value:'correct',visual:{type:'p2-solid-token',token:correct},ariaLabel:'doğru sıradaki cisim'},...alternatives.map((token,i)=>({value:`wrong-${i}`,visual:{type:'p2-solid-token',token},ariaLabel:'başka cisim'}))],rng);
  return qTask('solidPatterns2',rep,'Bir paketleme bandındaki kutular aynı örüntüyle diziliyor. Sıradaki paket hangisi olmalı?','correct',{kind:'visual-choice',options:opts},{
    taskKind:'context-transfer',taskLabel:'3B cisim örüntüsünü günlük düzene taşı',visual:{type:'p2-solid-border',items:y.items},hint:'Paketlerde de aynı özellik sırası devam eder.',explain:`Sıradaki paket aynı kuralı sürdürür: ${y.rule}.`
  });
}
'''
engine=insert_before(engine,'function patternOptionPool(x,rng=Math.random){',gens,'new P2 geometry generators')
engine=rep(engine,
"  shapePatterns2:genShapePatterns2,solids2:genSolids2,pictureGraphScale2:genPictureGraphScale2,",
"  shapes2D2:genShapes2D2,shapePatterns2:genShapePatterns2,solids2:genSolids2,solidPatterns2:genSolidPatterns2,pictureGraphScale2:genPictureGraphScale2,",'generator map geometry')
engine=rep(engine,
"  moneyP2:['money1'],\n  shapePatterns2:['shapes1'],\n  solids2:['shapes1'],\n  pictureGraphScale2:['data1'],",
"  moneyP2:['money1'],\n  shapes2D2:['shapes1'],\n  shapePatterns2:['shapes2D2'],\n  solids2:['shapes1'],\n  solidPatterns2:['solids2'],\n  pictureGraphScale2:['data1'],",'geometry readiness sources')
engine=rep(engine,
"  shapePatterns2:'p2-shape-pattern-attributes',solids2:'p2-solid-identify-classify',pictureGraphScale2:'p2-scaled-picture-graphs',",
"  shapes2D2:'p2-2d-compose-copy',shapePatterns2:'p2-shape-pattern-attributes',solids2:'p2-solid-identify-classify',solidPatterns2:'p2-solid-pattern-attributes',pictureGraphScale2:'p2-scaled-picture-graphs',",'geometry concept keys')
write('engine.mjs',engine)

# ---------- app ----------
app=read('app.js')
app=rep(app,
"    case 'p2-shape-pattern-builder': return p2ShapePatternBuilder(v.items,v.options);\n    case 'p2-shape-pattern': return p2ShapePatternVisual(v.items);\n    case 'p2-tile-border': return `<div class=\"p2-tile-border\">${p2ShapePatternVisual(v.items)}</div>`;\n    case 'p2-solid': return p2SolidVisual(v.kind);",
"    case 'square-grid-copy-interactive': return squareGridCopyBuilder(v.size||5,v.cells||[],v.figure);\n    case 'p2-shape-pattern-builder': return p2ShapePatternBuilder(v.items,v.options);\n    case 'p2-shape-pattern': return p2ShapePatternVisual(v.items);\n    case 'p2-tile-border': return `<div class=\"p2-tile-border\">${p2ShapePatternVisual(v.items)}</div>`;\n    case 'p2-solid-pattern-builder': return p2SolidPatternBuilder(v.items,v.options);\n    case 'p2-solid-pattern': return p2SolidPatternVisual(v.items);\n    case 'p2-solid-token': return p2SolidPatternToken(v.token);\n    case 'p2-solid-border': return `<div class=\"p2-solid-border\">${p2SolidPatternVisual(v.items)}</div>`;\n    case 'p2-solid': return p2SolidVisual(v.kind);",'render geometry visuals')

app_helpers=r'''
function squareGridCopyBuilder(size,cells,figure){
  const target=new Set((cells||[]).map(String));
  const tile=(r,c,interactive=false)=>{
    const key=`${c},${r}`, on=target.has(key);
    return interactive?`<button type="button" class="p2-grid-cell" data-cell="${key}" aria-label="${r+1}. satır ${c+1}. sütun"></button>`:`<i class="p2-grid-target-cell ${on?'filled':''}"></i>`;
  };
  const targetCells=Array.from({length:size*size},(_,i)=>tile(Math.floor(i/size),i%size,false)).join('');
  const copyCells=Array.from({length:size*size},(_,i)=>tile(Math.floor(i/size),i%size,true)).join('');
  return `<div class="p2-square-grid-copy" style="--grid-size:${size}"><div><small>HEDEF</small><div class="p2-grid target">${targetCells}</div></div><span>→</span><div><small>KOPYAN</small><div class="p2-grid copy">${copyCells}</div></div></div>`;
}
function p2MiniSolidSvg(kind){
  if(kind==='cube') return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 20 31 11 50 20 50 43 31 53 14 43Z" fill="currentColor" opacity=".82"/><path d="M14 20 31 30 50 20M31 30V53" fill="none" stroke="currentColor" stroke-width="3"/></svg>`;
  if(kind==='cuboid') return `<svg viewBox="0 0 72 64" aria-hidden="true"><path d="M10 22 27 13 61 18 61 43 44 52 10 46Z" fill="currentColor" opacity=".82"/><path d="M10 22 44 27 61 18M44 27V52" fill="none" stroke="currentColor" stroke-width="3"/></svg>`;
  if(kind==='cone') return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8 12 48H52Z" fill="currentColor" opacity=".82"/><ellipse cx="32" cy="48" rx="20" ry="6" fill="currentColor"/></svg>`;
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="15" width="36" height="34" fill="currentColor" opacity=".82"/><ellipse cx="32" cy="15" rx="18" ry="6" fill="currentColor"/><ellipse cx="32" cy="49" rx="18" ry="6" fill="currentColor"/></svg>`;
}
function p2SolidPatternToken(token){
  if(token==='?') return `<span class="p2-solid-pattern-gap">?</span>`;
  const [kind='cube',size='medium',colour='teal',orientation='0']=String(token).split('|');
  const palette={teal:'#2f9987',amber:'#d69b2d',blue:'#4e8cc8',rose:'#d96f64',violet:'#8270ca'};
  const scale=size==='small'?.78:size==='large'?1.16:1;
  const angle=Number(orientation)||0;
  return `<span class="p2-solid-pattern-token" style="--solid-token-color:${palette[colour]||palette.teal};--solid-token-scale:${scale};--solid-token-rot:${angle}deg">${p2MiniSolidSvg(kind)}</span>`;
}
function p2SolidPatternVisual(items){ return `<div class="p2-solid-pattern-seq">${(items||[]).map(p2SolidPatternToken).join('')}</div>`; }
function p2SolidPatternBuilder(items,options){ return `<div class="p2-solid-pattern-builder">${p2SolidPatternVisual([...(items||[]),'?'])}<div class="p2-solid-pattern-bank">${(options||[]).map(token=>`<button type="button" class="p2-solid-pattern-choice" data-value="${esc(token)}">${p2SolidPatternToken(token)}</button>`).join('')}</div></div>`; }
'''
app=insert_before(app,'function coneSolidSvg(){',app_helpers,'geometry UI helpers')
app=rep(app,
"  if(interaction==='p2-shape-pattern'){\n    const root=$('.p2-shape-pattern-builder'); root?.querySelectorAll('.p2-shape-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.p2-shape-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='solid-classify')",
"  if(interaction==='p2-shape-pattern'){\n    const root=$('.p2-shape-pattern-builder'); root?.querySelectorAll('.p2-shape-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.p2-shape-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='square-grid-copy'){\n    const root=$('.p2-square-grid-copy'); root?.querySelectorAll('.p2-grid-cell').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='p2-solid-pattern'){\n    const root=$('.p2-solid-pattern-builder'); root?.querySelectorAll('.p2-solid-pattern-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.p2-solid-pattern-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));\n  }\n  if(interaction==='solid-classify')",'wire new geometry interactions')
app=rep(app,
"  if(interaction==='p2-shape-pattern') return $('.p2-shape-pattern-builder .p2-shape-choice.selected')?.dataset.value ?? null;\n  if(interaction==='solid-classify')",
"  if(interaction==='p2-shape-pattern') return $('.p2-shape-pattern-builder .p2-shape-choice.selected')?.dataset.value ?? null;\n  if(interaction==='square-grid-copy'){ const cells=[...$$('.p2-square-grid-copy .p2-grid-cell.selected')].map(b=>b.dataset.cell).sort(); return cells.length?cells.join('|'):null; }\n  if(interaction==='p2-solid-pattern') return $('.p2-solid-pattern-builder .p2-solid-pattern-choice.selected')?.dataset.value ?? null;\n  if(interaction==='solid-classify')",'read new geometry manipulatives')
app=rep(app,
"  else if(q.response?.interaction==='p2-shape-pattern') node.textContent=value?'Örüntüyü tamamlayacak parçayı seçtin':'Boyut, şekil, renk ve yön düzenini izle';\n  else if(q.response?.interaction==='solid-classify')",
"  else if(q.response?.interaction==='p2-shape-pattern') node.textContent=value?'Örüntüyü tamamlayacak parçayı seçtin':'Boyut, şekil, renk ve yön düzenini izle';\n  else if(q.response?.interaction==='square-grid-copy') node.textContent=value?`Kopyanda ${String(value).split('|').length} dolu hücre var`:'Hedefteki dolu hücreleri aynı konuma kopyala';\n  else if(q.response?.interaction==='p2-solid-pattern') node.textContent=value?'Sıradaki 3B cismi seçtin':'Cisim türü, boyut, renk ve yön düzenini izle';\n  else if(q.response?.interaction==='solid-classify')",'status for new geometry interactions')
app=rep(app,
".p2-shape-choice,.p2-solid-bin,.p2-graph-icon-button'",
".p2-shape-choice,.p2-grid-cell,.p2-solid-pattern-choice,.p2-solid-bin,.p2-graph-icon-button'",'disable new geometry controls')
write('app.js',app)

# ---------- CSS ----------
css=read('styles.css')
css += r'''

/* v1.5.1 — Singapore P2 geometry completion */
.p2-square-grid-copy{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:14px;width:min(100%,620px);margin:0 auto}.p2-square-grid-copy>div{display:grid;gap:7px;justify-items:center}.p2-square-grid-copy>span{font-size:28px;color:var(--muted)}.p2-grid{display:grid;grid-template-columns:repeat(var(--grid-size),42px);grid-template-rows:repeat(var(--grid-size),42px);gap:3px;padding:9px;border-radius:18px;background:rgba(25,54,75,.06)}.p2-grid-target-cell,.p2-grid-cell{width:42px;height:42px;border:1px solid rgba(25,54,75,.18);border-radius:7px;background:#fff}.p2-grid-target-cell.filled{background:rgba(47,153,135,.72);border-color:rgba(47,153,135,.95)}.p2-grid-cell{cursor:pointer}.p2-grid-cell.selected{background:rgba(78,140,200,.72);border-color:#4e8cc8;box-shadow:inset 0 0 0 2px rgba(255,255,255,.7)}
.p2-solid-pattern-seq{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;min-height:86px}.p2-solid-pattern-token{display:inline-grid;place-items:center;width:72px;height:72px;color:var(--solid-token-color);transform:rotate(var(--solid-token-rot)) scale(var(--solid-token-scale));transform-origin:center}.p2-solid-pattern-token svg{width:64px;height:64px;overflow:visible}.p2-solid-pattern-gap{display:grid;place-items:center;width:64px;height:64px;border:2px dashed rgba(25,54,75,.24);border-radius:16px;font-weight:800;font-size:24px;color:var(--muted)}.p2-solid-pattern-builder{display:grid;gap:18px;width:min(100%,650px);margin:0 auto}.p2-solid-pattern-bank{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.p2-solid-pattern-choice{border:1px solid rgba(25,54,75,.14);border-radius:18px;background:#fff;padding:5px;cursor:pointer}.p2-solid-pattern-choice.selected{outline:3px solid rgba(47,153,135,.55);background:rgba(47,153,135,.08)}.p2-solid-border{padding:14px;border-radius:18px;background:rgba(78,140,200,.07)}
@media(max-width:620px){.p2-grid{grid-template-columns:repeat(var(--grid-size),32px);grid-template-rows:repeat(var(--grid-size),32px)}.p2-grid-target-cell,.p2-grid-cell{width:32px;height:32px}.p2-square-grid-copy{gap:8px}.p2-solid-pattern-token{width:58px;height:58px}.p2-solid-pattern-token svg{width:52px;height:52px}}
'''
write('styles.css',css)

# ---------- tests ----------
t=read('tests/engine.test.mjs')
t=rep(t,
"const P2_GEOMETRY_DATA_SKILLS=['shapePatterns2','solids2','pictureGraphScale2'];",
"const P2_GEOMETRY_DATA_SKILLS=['shapes2D2','shapePatterns2','solids2','solidPatterns2','pictureGraphScale2'];",'engine geometry skill list')
t=rep(t,
"'moneyP2','shapePatterns2','solids2','pictureGraphScale2']",
"'moneyP2','shapes2D2','shapePatterns2','solids2','solidPatterns2','pictureGraphScale2']",'engine expected P2 graph')
geometry_tests=r'''

// P2 2D composition/copying remains explicit at the P2 evidence layer even though related ideas start in P1.
const p2Pieces=new Set();
for(let i=0;i<700;i++){
  const c=createConceptInstance('shapes2D2',2,seeded);
  for(const z of [c.anchor,c.symbol,c.transfer]) for(const p of z.pieces) p2Pieces.add(p);
}
for(const piece of ['square','rect','triangle','halfCircle','quarterCircle']) assert.ok(p2Pieces.has(piece),`P2 2D composition missing ${piece}`);
const p2Shape2D=createConceptInstance('shapes2D2',2,seeded);
const p2ShapeBuild=generateQuestion('shapes2D2','build',2,seeded,p2Shape2D);
assert.equal(p2ShapeBuild.response.interaction,'shape-compose');
const p2ShapeTransfer=generateQuestion('shapes2D2','transfer',2,seeded,p2Shape2D);
assert.equal(p2ShapeTransfer.response.interaction,'square-grid-copy');
assert.equal(p2ShapeTransfer.visual.type,'square-grid-copy-interactive');
assert.match(String(p2ShapeTransfer.answer),/\d,\d\|/,'P2 grid copy must encode multiple target cells');

const solidPatternAttrs=new Set(), solidPatternAttrCounts=new Set(), solidPatternKinds=new Set();
for(let i=0;i<700;i++){
  const p=createConceptInstance('solidPatterns2',2,seeded);
  p.anchor.attrs.forEach(a=>solidPatternAttrs.add(a)); solidPatternAttrCounts.add(p.anchor.attrs.length);
  for(const token of [...p.anchor.items,p.anchor.next]) solidPatternKinds.add(String(token).split('|')[0]);
}
for(const attr of ['size','shape','colour','orientation']) assert.ok(solidPatternAttrs.has(attr),`P2 3D patterns missing ${attr}`);
assert.ok(solidPatternAttrCounts.has(1)&&solidPatternAttrCounts.has(2),'P2 3D patterns must use one or two attributes');
assert.ok(!solidPatternKinds.has('sphere'),'Singapore P2 3D pattern activity excludes sphere');
for(const kind of ['cube','cuboid','cone','cylinder']) assert.ok(solidPatternKinds.has(kind),`P2 3D patterns missing ${kind}`);
const solidPatternConcept=createConceptInstance('solidPatterns2',2,seeded);
assert.equal(generateQuestion('solidPatterns2','build',2,seeded,solidPatternConcept).response.interaction,'p2-solid-pattern');
assert.equal(generateQuestion('solidPatterns2','transfer',2,seeded,solidPatternConcept).response.kind,'visual-choice');
'''
t=insert_before(t,'const shapes2Concept=createConceptInstance',geometry_tests,'P2 missing geometry coverage tests')
write('tests/engine.test.mjs',t)

lc=read('tests/learning-cycle.test.mjs')
lc=rep(lc,
"'moneyP2','shapePatterns2','solids2','pictureGraphScale2']);",
"'moneyP2','shapes2D2','shapePatterns2','solids2','solidPatterns2','pictureGraphScale2']);",'learning-cycle P2 list')
lc=rep(lc,
"assert.deepEqual(readinessSourcesFor('moneyP2'),['money1']);\nassert.deepEqual(readinessSourcesFor('shapePatterns2'),['shapes1']);\nassert.deepEqual(readinessSourcesFor('solids2'),['shapes1']);\nassert.deepEqual(readinessSourcesFor('pictureGraphScale2'),['data1']);",
"assert.deepEqual(readinessSourcesFor('moneyP2'),['money1']);\nassert.deepEqual(readinessSourcesFor('shapes2D2'),['shapes1']);\nassert.deepEqual(readinessSourcesFor('shapePatterns2'),['shapes2D2']);\nassert.deepEqual(readinessSourcesFor('solids2'),['shapes1']);\nassert.deepEqual(readinessSourcesFor('solidPatterns2'),['solids2']);\nassert.deepEqual(readinessSourcesFor('pictureGraphScale2'),['data1']);",'learning-cycle geometry readiness assertions')
write('tests/learning-cycle.test.mjs',lc)

ui=read('tests/ui-static.test.mjs')
ui=rep(ui,
"'p2-shape-pattern-builder','p2-solid-classify-builder','p2-scaled-graph-builder'",
"'p2-shape-pattern-builder','p2-square-grid-copy','p2-solid-pattern-builder','p2-solid-classify-builder','p2-scaled-graph-builder'",'UI classes')
ui=rep(ui,
"for(const marker of ['bond-fill','base10-build','base1000-build','parity-pair','two-step-plan','order-pair','ordinal-position','equal-groups','share-equally','money-make','cm-ruler','shape-compose','unit-measure','clock-set','shape-pattern','solid-properties','three-add'])",
"for(const marker of ['bond-fill','base10-build','base1000-build','parity-pair','two-step-plan','order-pair','ordinal-position','equal-groups','share-equally','money-make','cm-ruler','shape-compose','unit-measure','clock-set','shape-pattern','solid-properties','three-add','p2-shape-pattern','square-grid-copy','p2-solid-pattern','solid-classify','scaled-pictograph-row'])",'UI interaction audit')
ui=rep(ui,
"const renderAuditSkills=[...skillsFor('grade1'),...skillsFor('grade2').filter(s=>['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2'].includes(s.id))];",
"const renderAuditSkills=[...skillsFor('grade1'),...skillsFor('grade2')];",'render audit all P2')
ui=rep(ui,
"const standalone=path.join(root,'SAYMERA_v1_4_TEK_DOSYA.html');\nassert.ok(fs.existsSync(standalone),'v1.3 standalone build missing');\nassert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html')),'v1.3 standalone alias missing');\nassert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html')),'legacy standalone alias missing');",
"const standalone=path.join(root,'SAYMERA_v1_5_TEK_DOSYA.html');\nassert.ok(fs.existsSync(standalone),'v1.5 standalone build missing');",'standalone path')
ui=ui.replace("filename:'SAYMERA_v1_4_TEK_DOSYA.inline.js'","filename:'SAYMERA_v1_5_TEK_DOSYA.inline.js'")
ui=ui.replace("console.log('ui/static tests: PASS (P1 task UI, cm ruler/shape composition/5-minute clock coverage, PWA assets, standalone parse guard)');","console.log('ui/static tests: PASS (P1/P2 task UI, complete render/interaction audit, PWA assets, v1.5 standalone parse guard)');")
write('tests/ui-static.test.mjs',ui)

# ---------- build/release plumbing ----------
build=read('build-standalone.mjs')
old="""const currentStandalone=path.join(root,'SAYMERA_v1_4_TEK_DOSYA.html');\nconst v13Standalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');\nconst legacyStandalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');\nfs.writeFileSync(currentStandalone,html);\nfs.writeFileSync(v13Standalone,html);\nfs.writeFileSync(legacyStandalone,html);\nconsole.log('standalone built:',currentStandalone);"""
new="""const currentStandalone=path.join(root,'SAYMERA_v1_5_TEK_DOSYA.html');\nfs.writeFileSync(currentStandalone,html);\nconsole.log('standalone built:',currentStandalone);"""
build=rep(build,old,new,'standalone build name')
write('build-standalone.mjs',build)

pkg=json.loads(read('package.json')); pkg['version']='1.5.1'; write('package.json',json.dumps(pkg,ensure_ascii=False,indent=2)+'\n')
sw=read('sw.js').replace("saymera-v1-5-0-singapore-p2-complete","saymera-v1-5-1-p2-geometry-complete"); write('sw.js',sw)

# ---------- docs ----------
matrix=read('TASK_MIGRATION_MATRIX.md')
matrix=rep(matrix,
"| 2. sınıf | `shapePatterns2` | 2B şekillerle bir/iki özellikli örüntüler | **P2-REFERENCE** |\n| 2. sınıf | `solids2` | Küp/dikdörtgen prizma/koni/silindir/küre | **P2-REFERENCE** |\n| 2. sınıf | `pictureGraphScale2` | Ölçekli resimli grafik | **P2-REFERENCE** |",
"| 2. sınıf | `shapes2D2` | Bileşik 2B figür, temel parçalar ve kareli alanda kopyalama | **P2-REFERENCE** |\n| 2. sınıf | `shapePatterns2` | 2B şekillerle bir/iki özellikli örüntüler | **P2-REFERENCE** |\n| 2. sınıf | `solids2` | Küp/dikdörtgen prizma/koni/silindir/küre | **P2-REFERENCE** |\n| 2. sınıf | `solidPatterns2` | 3B cisimlerle bir/iki özellikli örüntüler | **P2-REFERENCE** |\n| 2. sınıf | `pictureGraphScale2` | Ölçekli resimli grafik | **P2-REFERENCE** |",'matrix geometry rows')
matrix=matrix.replace("Toplam: **52 beceri**. Bunun **22'si P1-REFERENCE**, **22'si P2-REFERENCE** ve **8'i okul öncesi LEGACY** durumundadır. Singapore P1 ve P2 çekirdek kapsamı artık referans kalite kapısından geçmektedir.","Toplam: **54 beceri**. Bunun **22'si P1-REFERENCE**, **24'ü P2-REFERENCE** ve **8'i okul öncesi LEGACY** durumundadır. Singapore P1 ve P2 çekirdek kapsamı, geometri öğrenme deneyimleri dahil, referans kalite kapısından geçmektedir.")
write('TASK_MIGRATION_MATRIX.md',matrix)

geo=read('P2_GEOMETRY_DATA_REFERENCE.md')
geo="""# Singapore P2 Geometry & Data — SAYMERA v1.5.1\n\nKaynak: Singapore MOE Primary Mathematics Syllabus P1–P6, current Primary Two scope.\n\n## P2 geometry\n- P1'de başlayan yarım/çeyrek daire, birleşik 2B figür ve ızgarada kopyalama deneyimleri P2'de de daha geniş sınıflandırma/oluşturma bağlamında kullanılır.\n- make/complete 2D shape patterns using one or two attributes: size, shape, colour, orientation\n- identify, name, describe and classify: cube, cuboid, cone, cylinder, sphere\n- make/complete patterns with 3D shapes (except sphere) using one or two attributes\n\n## P2 statistics\n- read and interpret picture graphs with scales\n- solve one-step questions from the graph\n\n## SAYMERA reference skills\n- `shapes2D2` — birleşik 2B figür ve gerçek kareli-alan kopyalama\n- `shapePatterns2` — 2B örüntüler\n- `solids2` — 3B cisimleri tanıma/sınıflandırma\n- `solidPatterns2` — 3B cisim örüntüleri; sphere örüntü havuzuna alınmaz\n- `pictureGraphScale2` — ölçekli resimli grafik\n\nTüm beceriler readiness → model → representation → symbol → reasoning → context → adaptive practice → delayed retrieval döngüsünü kullanır. Çocuk ekranı bu motor adlarını açıklamaz.\n\nOfficial source: https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf\n"""
write('P2_GEOMETRY_DATA_REFERENCE.md',geo)

coverage=read('SINGAPORE_P2_COVERAGE.md')
coverage=coverage.replace("- yarım/çeyrek daire, bileşik 2B figür ve ızgarada kopyalama P1 kapsamıdır; P2'ye tekrar çekirdek hedef olarak yazılmaz","- yarım/çeyrek daire, bileşik 2B figür ve ızgarada kopyalama P1'de başlar; P2 geometri öğrenme deneyimlerinde de temel şekilleri bileşik figürde ayırt etme/oluşturma ve kopyalama bağlantısı korunur\n- 3B cisimlerle (küre hariç) bir veya iki özellikli örüntü kurma/tamamlama P2 öğrenme deneyimine dahildir")
coverage=coverage.replace("20. `shapePatterns2` — 2B şekillerde boyut/şekil/renk/yön ile örüntü\n21. `solids2` — küp/dikdörtgen prizma/koni/silindir/küre ve sınıflandırma\n22. `pictureGraphScale2` — ölçekli resimli grafik okuma/yorumlama","20. `shapes2D2` — temel 2B parçaları birleşik figürde ayırt etme/oluşturma ve kareli alanda kopyalama\n21. `shapePatterns2` — 2B şekillerde boyut/şekil/renk/yön ile örüntü\n22. `solids2` — küp/dikdörtgen prizma/koni/silindir/küre ve sınıflandırma\n23. `solidPatterns2` — küre hariç 3B cisimlerde bir/iki özellikli örüntü\n24. `pictureGraphScale2` — ölçekli resimli grafik okuma/yorumlama")
coverage += "\n\n## Uygulama ilerlemesi — v1.5.1 / P2 geometri tamamlama\n\nP2 geometri auditi derinleştirildi. `shapes2D2` ile bileşik 2B figür ve gerçek kareli-alan kopyalama, `solidPatterns2` ile küre hariç 3B cisim örüntüleri eklendi. P2 render auditi artık yalnız ilk sayı becerilerini değil bütün P2 becerilerini kapsar.\n"
write('SINGAPORE_P2_COVERAGE.md',coverage)

print('v1.5.1 P2 geometry completeness patch staged')
