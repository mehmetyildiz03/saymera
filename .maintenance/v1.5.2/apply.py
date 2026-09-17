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

# A no-commit revert of 31e7073 restores the exact v1.5.0 curriculum tree but also
# restores the temporary v1.5.1 maintenance files. Remove those staging artifacts.
for p in [Path('.maintenance/v1.5.1/apply.py'),Path('.github/workflows/apply-v1-5-1.yml')]:
    if p.exists(): p.unlink()
if Path('.maintenance/v1.5.1').exists():
    try: Path('.maintenance/v1.5.1').rmdir()
    except OSError: pass

# ---------- P1: make the official grid-copying experience genuinely interactive ----------
engine=read('engine.mjs')
grid_helper=r'''
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
'''
engine=insert_before(engine,'function shapePatternCases(){',grid_helper,'P1 grid helper')
old_transfer="""  const y=c.transfer;
  const cases=shapePatternCases(), distractors=shuffled(cases.filter(z=>z.copy!==y.copy),rng).slice(0,2);
  const opts=shuffled([y,...distractors].map(z=>({value:z.copy,visual:{type:'dot-grid-figure',figure:z.copy},ariaLabel:`nokta ızgarada ${z.name}`})),rng);
  return qTask('shapePattern1',rep,'Örnekteki figürü nokta ızgarada aynı düzenle kopyalayan çalışma hangisi?',y.copy,{kind:'visual-choice',options:opts}, {
    taskKind:'context-transfer',taskLabel:'Şekil düzenini ızgaraya kopyala',visual:{type:'composite-figure',figure:y.id,pieces:y.pieces},hint:'Parçaların yalnız adını değil, göreli konumlarını ve yönlerini de koru.',explain:`Doğru kopya ${y.name} figürünün parça düzenini korur.`
  });"""
new_transfer="""  const y=c.transfer, cells=p1GridCellsForFigure(y.copy), expected=[...cells].sort().join('|');
  return qTask('shapePattern1',rep,`Örnekteki ${y.name} figürünü kareli alana aynı düzenle kopyala.`,expected,{kind:'manipulative',interaction:'square-grid-copy',expectedValue:expected,checkLabel:'Kopyamı kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'Şekil düzenini kareli alana gerçekten kopyala',visual:{type:'square-grid-copy-interactive',size:5,cells,figure:y.copy},hint:'Hedefi satır satır incele; dolu hücreleri boş alanda aynı konuma getir.',explain:`Kopyada ${y.name} figürünün dolu hücreleri hedefle aynı satır ve sütunlarda olmalı.`
  });"""
engine=rep(engine,old_transfer,new_transfer,'P1 grid-copy transfer')
write('engine.mjs',engine)

# ---------- app UI for square-grid copying ----------
app=read('app.js')
app=rep(app,
"    case 'shape-compose-interactive': return shapeComposeBuilder(v.figure,v.pieces);",
"    case 'shape-compose-interactive': return shapeComposeBuilder(v.figure,v.pieces);\n    case 'square-grid-copy-interactive': return squareGridCopyBuilder(v.size||5,v.cells||[],v.figure);",'grid visual route')
helper=r'''
function squareGridCopyBuilder(size,cells,figure){
  const target=new Set((cells||[]).map(String));
  const staticCell=(r,c)=>`<i class="sg-grid-target-cell ${target.has(`${c},${r}`)?'filled':''}"></i>`;
  const copyCell=(r,c)=>`<button type="button" class="sg-grid-copy-cell" data-cell="${c},${r}" aria-label="${r+1}. satır ${c+1}. sütun"></button>`;
  const targetCells=Array.from({length:size*size},(_,i)=>staticCell(Math.floor(i/size),i%size)).join('');
  const copyCells=Array.from({length:size*size},(_,i)=>copyCell(Math.floor(i/size),i%size)).join('');
  return `<div class="sg-square-grid-copy" style="--grid-size:${size}"><div><small>HEDEF</small><div class="sg-copy-grid target">${targetCells}</div></div><span>→</span><div><small>KOPYAN</small><div class="sg-copy-grid copy">${copyCells}</div></div></div>`;
}
'''
app=insert_before(app,'function shapePieceSvg(id){',helper,'grid UI helper')
app=rep(app,
"  if(interaction==='shape-compose'){\n    const root=$('.sg-shape-compose-builder');\n    root?.querySelectorAll('.sg-compose-piece').forEach(btn=>btn.addEventListener('click',()=>{\n      if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q);\n    }));\n  }",
"  if(interaction==='shape-compose'){\n    const root=$('.sg-shape-compose-builder');\n    root?.querySelectorAll('.sg-compose-piece').forEach(btn=>btn.addEventListener('click',()=>{\n      if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q);\n    }));\n  }\n  if(interaction==='square-grid-copy'){\n    const root=$('.sg-square-grid-copy');\n    root?.querySelectorAll('.sg-grid-copy-cell').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));\n  }",'wire grid copy')
app=rep(app,
"  if(interaction==='shape-compose'){\n    const values=[...$$('.sg-shape-compose-builder .sg-compose-piece.selected')].map(b=>b.dataset.value).sort();\n    return values.length?values.join('+'):null;\n  }",
"  if(interaction==='shape-compose'){\n    const values=[...$$('.sg-shape-compose-builder .sg-compose-piece.selected')].map(b=>b.dataset.value).sort();\n    return values.length?values.join('+'):null;\n  }\n  if(interaction==='square-grid-copy'){ const cells=[...$$('.sg-square-grid-copy .sg-grid-copy-cell.selected')].map(b=>b.dataset.cell).sort(); return cells.length?cells.join('|'):null; }",'read grid copy')
app=rep(app,
"  else if(q.response?.interaction==='shape-compose') node.textContent=value?`Seçtiğin parçalar: ${String(value).split('+').length}`:'Figürü oluşturan bütün parçaları seç';",
"  else if(q.response?.interaction==='shape-compose') node.textContent=value?`Seçtiğin parçalar: ${String(value).split('+').length}`:'Figürü oluşturan bütün parçaları seç';\n  else if(q.response?.interaction==='square-grid-copy') node.textContent=value?`Kopyanda ${String(value).split('|').length} dolu hücre var`:'Hedefteki dolu hücreleri aynı konuma kopyala';",'grid status')
app=rep(app,
".sg-compose-piece,.sg-unit-cell",
".sg-compose-piece,.sg-grid-copy-cell,.sg-unit-cell",'disable grid controls')
write('app.js',app)

css=read('styles.css')
css += r'''

/* v1.5.2 — real P1 square-grid copying */
.sg-square-grid-copy{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:14px;width:min(100%,620px);margin:0 auto}.sg-square-grid-copy>div{display:grid;gap:7px;justify-items:center}.sg-square-grid-copy>span{font-size:28px;color:var(--muted)}.sg-copy-grid{display:grid;grid-template-columns:repeat(var(--grid-size),42px);grid-template-rows:repeat(var(--grid-size),42px);gap:3px;padding:9px;border-radius:18px;background:rgba(25,54,75,.06)}.sg-grid-target-cell,.sg-grid-copy-cell{width:42px;height:42px;border:1px solid rgba(25,54,75,.18);border-radius:7px;background:#fff}.sg-grid-target-cell.filled{background:rgba(47,153,135,.72);border-color:rgba(47,153,135,.95)}.sg-grid-copy-cell{cursor:pointer}.sg-grid-copy-cell.selected{background:rgba(78,140,200,.72);border-color:#4e8cc8;box-shadow:inset 0 0 0 2px rgba(255,255,255,.7)}
@media(max-width:620px){.sg-copy-grid{grid-template-columns:repeat(var(--grid-size),32px);grid-template-rows:repeat(var(--grid-size),32px)}.sg-grid-target-cell,.sg-grid-copy-cell{width:32px;height:32px}.sg-square-grid-copy{gap:8px}}
'''
write('styles.css',css)

# ---------- strengthen tests without inflating P2 skill count ----------
t=read('tests/engine.test.mjs')
t=rep(t,
"const shapeTransfer=generateQuestion('shapePattern1','transfer',2,seeded,shapeConcept);\nassert.equal(shapeTransfer.response.kind,'visual-choice');\nassert.ok(shapeTransfer.response.options.every(x=>x.visual?.type==='dot-grid-figure'),'shape transfer must copy a composed figure on a grid');",
"const shapeTransfer=generateQuestion('shapePattern1','transfer',2,seeded,shapeConcept);\nassert.equal(shapeTransfer.response.kind,'manipulative');\nassert.equal(shapeTransfer.response.interaction,'square-grid-copy');\nassert.equal(shapeTransfer.visual.type,'square-grid-copy-interactive');\nassert.match(String(shapeTransfer.answer),/\\d,\\d\\|/,'P1 grid-copy target must contain multiple cells');",'P1 grid-copy test')
write('tests/engine.test.mjs',t)

ui=read('tests/ui-static.test.mjs')
ui=rep(ui,
"'sg-shape-compose-builder','sg-unit-builder'",
"'sg-shape-compose-builder','sg-square-grid-copy','sg-unit-builder'",'UI grid class')
ui=rep(ui,
"'cm-ruler','shape-compose','unit-measure'",
"'cm-ruler','shape-compose','square-grid-copy','unit-measure'",'UI grid interaction')
ui=rep(ui,
"const renderAuditSkills=[...skillsFor('grade1'),...skillsFor('grade2').filter(s=>['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2'].includes(s.id))];",
"const renderAuditSkills=[...skillsFor('grade1'),...skillsFor('grade2')];",'all P2 render audit')
ui=rep(ui,
"const standalone=path.join(root,'SAYMERA_v1_4_TEK_DOSYA.html');\nassert.ok(fs.existsSync(standalone),'v1.3 standalone build missing');\nassert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html')),'v1.3 standalone alias missing');\nassert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html')),'legacy standalone alias missing');",
"const standalone=path.join(root,'SAYMERA_v1_5_TEK_DOSYA.html');\nassert.ok(fs.existsSync(standalone),'v1.5 standalone build missing');",'standalone test path')
ui=ui.replace("filename:'SAYMERA_v1_4_TEK_DOSYA.inline.js'","filename:'SAYMERA_v1_5_TEK_DOSYA.inline.js'")
ui=ui.replace("console.log('ui/static tests: PASS (P1 task UI, cm ruler/shape composition/5-minute clock coverage, PWA assets, standalone parse guard)');","console.log('ui/static tests: PASS (P1/P2 task UI, all-skill render audit, PWA assets, v1.5 standalone parse guard)');")
write('tests/ui-static.test.mjs',ui)

# ---------- release plumbing ----------
build=read('build-standalone.mjs')
old="""const currentStandalone=path.join(root,'SAYMERA_v1_4_TEK_DOSYA.html');\nconst v13Standalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');\nconst legacyStandalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');\nfs.writeFileSync(currentStandalone,html);\nfs.writeFileSync(v13Standalone,html);\nfs.writeFileSync(legacyStandalone,html);\nconsole.log('standalone built:',currentStandalone);"""
new="""const currentStandalone=path.join(root,'SAYMERA_v1_5_TEK_DOSYA.html');\nfs.writeFileSync(currentStandalone,html);\nconsole.log('standalone built:',currentStandalone);"""
build=rep(build,old,new,'standalone build output')
write('build-standalone.mjs',build)

pkg=json.loads(read('package.json')); pkg['version']='1.5.2'; write('package.json',json.dumps(pkg,ensure_ascii=False,indent=2)+'\n')
sw=read('sw.js').replace("saymera-v1-5-0-singapore-p2-complete","saymera-v1-5-2-curriculum-exact"); write('sw.js',sw)

# ---------- scope documentation ----------
geo=read('P2_GEOMETRY_DATA_REFERENCE.md')
geo="""# Singapore P2 Geometry & Data — SAYMERA v1.5.2\n\nKaynak: Singapore MOE Primary Mathematics Syllabus P1–P6, **Updated Oct 2025**, Primary Two content summary.\n\n## P2 resmî çekirdek hedefler\n- `shapePatterns2`: 2B şekillerle bir veya iki özellik (size, shape, colour, orientation) üzerinden örüntü kurma/tamamlama\n- `solids2`: cube, cuboid, cone, cylinder, sphere — tanıma, adlandırma, açıklama ve sınıflandırma\n- `pictureGraphScale2`: ölçekli resimli grafik okuma ve yorumlama\n\nBileşik 2B figür oluşturma/çözümleme ve dot/square grid üzerinde kopyalama P1'de başlar; bu nedenle P2'de ayrı bir çekirdek beceri kartı olarak çoğaltılmaz. SAYMERA v1.5.2'de P1 `shapePattern1` içindeki grid-copy görevi artık yalnız doğru görseli seçmek değil, kareli alana gerçekten kopyalamaktır.\n\nMOE ayrımı: resmî **content objective** beceri haritasını belirler; önerilen **learning experiences** ise görev tasarımını zenginleştirir ve tek başına yeni bir mastery skill oluşturmaz.\n\nOfficial source: https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf\n"""
write('P2_GEOMETRY_DATA_REFERENCE.md',geo)

policy="""# SAYMERA Curriculum Scope Policy\n\n## Singapore-first kaynak kuralı\nSAYMERA'da seviye/beceri haritasını Singapore MOE Primary Mathematics Syllabus'taki açık **content objectives** belirler. Öğretmen etkinliği veya **learning experience** olarak önerilen bir uygulama, içerik hedefi değilse otomatik olarak ayrı bir beceri kartına dönüştürülmez.\n\n## Dijital öğretim kuralı\nHer resmi beceri SAYMERA'nın görünmeyen öğrenme döngüsünden geçer:\n\n**ön bilgiyi yokla → nesne/modelle çalış → farklı temsilini gör → sembolleştir → nedenini düşün → gündelik durumda kullan → farklı örneklerle pekiştir → daha sonra geri çağır**\n\nLearning experiences bu sekiz aşamadaki görevleri zenginleştirebilir. Örneğin 3B cisimlerle örüntü kurma bir sınıf etkinliği olarak kullanılabilir; fakat resmi P2 çekirdeğinde ayrı içerik hedefi değilse ayrı mastery skill sayılmaz.\n\n## Sembol kuralı\nYeni bir sembol, anlam/model bağlantısı kurulmadan sınanmaz. Kesir gösterimi ve bölme işareti gibi semboller önce açıkça öğretilir, sonra ölçülür.\n\n## Çocuk arayüzü\nBu motor ve kapsam kararları çocuk ekranında açıklanmaz. Çocuk yalnız yaşına uygun görev, geri bildirim ve gerekirse somutlaştırılmış destek görür.\n"""
write('CURRICULUM_SCOPE_POLICY.md',policy)

coverage=read('SINGAPORE_P2_COVERAGE.md')
coverage += "\n\n## Kapsam doğruluğu notu — v1.5.2\n\nP2 beceri kartları yalnız Updated Oct 2025 resmî content objectives üzerinden sayılır. 2B bileşik figür ve grid-copy P1 hedefi olarak kalır; P1 grid-copy artık gerçek etkileşimli kopyalamadır. Learning experiences, ayrı content objective olmadıkça yeni P2 mastery kartına dönüştürülmez.\n"
write('SINGAPORE_P2_COVERAGE.md',coverage)

print('v1.5.2 curriculum-exact patch staged')
