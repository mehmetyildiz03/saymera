from pathlib import Path
import json

root = Path('.')

def replace_once(path, old, new):
    p = root / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'expected block not found in {path}: {old[:90]!r}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')

def append_once(path, marker, addition):
    p = root / path
    text = p.read_text(encoding='utf-8')
    if marker in text:
        return
    p.write_text(text.rstrip() + '\n\n' + addition.strip() + '\n', encoding='utf-8')

# 1) Pure recognition rule in engine so it can be regression-tested.
replace_once('engine.mjs',
"function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }",
"""export function classifyFractionPaint(scores,{minSignal=2.5,dominanceRatio=.25}={}){
  const clean=Array.isArray(scores)?scores.map(v=>Math.max(0,Number(v)||0)):[];
  const peak=clean.length?Math.max(...clean):0;
  if(!clean.length || peak<minSignal) return {selected:[],count:0,peak,threshold:minSignal};
  const threshold=Math.max(minSignal,peak*dominanceRatio);
  const selected=[];
  clean.forEach((score,index)=>{ if(score>=threshold) selected.push(index); });
  return {selected,count:selected.length,peak,threshold};
}

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }""")

# Child copy: painting precision is not the concept being assessed.
replace_once('engine.mjs','Bütün ${x.denom} eş parçaya ayrıldı. Tam bir eş parçayı boya.','Bütün ${x.denom} eş parçaya ayrıldı. Bir eş parçayı boya.')
replace_once('engine.mjs',"hint:'Yalnızca bir eş parçayı seç.'","hint:'Bir eş parçayı boyaman yeterli.'")
replace_once('engine.mjs',"hint:`Toplam ${x.denom} eş parça var; ${x.numerator} tanesini seç.`","hint:`Toplam ${x.denom} eş parça var; ${x.numerator} tanesini boya.`")

# 2) App imports the recognition rule.
replace_once('app.js',
"  profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan, evaluatePracticeCheckpoint\n} from './engine.mjs';",
"  profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan, evaluatePracticeCheckpoint, classifyFractionPaint\n} from './engine.mjs';")

# Replace tap-to-toggle for the simple fraction shade board with freehand paint.
replace_once('app.js',
"""  if(interaction==='fraction-shade'||interaction==='fraction-pair-build'||interaction==='fraction-operation-build'){
    const root=$(interaction==='fraction-shade'?'.sg-fraction-shade-builder':interaction==='fraction-pair-build'?'.sg-fraction-pair-builder':'.sg-fraction-operation-builder');
    root?.querySelectorAll('.sg-fraction-cell').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }""",
"""  if(interaction==='fraction-shade'){
    bindFractionPaint($('.sg-fraction-shade-builder'),q);
  }
  if(interaction==='fraction-pair-build'||interaction==='fraction-operation-build'){
    const root=$(interaction==='fraction-pair-build'?'.sg-fraction-pair-builder':'.sg-fraction-operation-builder');
    root?.querySelectorAll('.sg-fraction-cell').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }""")

paint_helpers = r"""
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
"""
replace_once('app.js','function readManipulatorValue(q){',paint_helpers+'\nfunction readManipulatorValue(q){')

replace_once('app.js',
"  if(interaction==='fraction-shade') return $$('.sg-fraction-shade-builder .sg-fraction-cell.selected').length;",
"  if(interaction==='fraction-shade'){ const root=$('.sg-fraction-shade-builder'); return syncFractionPaintSelection(root).count; }")

replace_once('app.js',
"""function fractionShadeBuilder(denom,target){
  const d=Math.max(2,Number(denom)||2);
  return `<div class=\"sg-fraction-shade-builder\"><small>${d} EŞ PARÇA</small><div class=\"sg-fraction-strip interactive\" style=\"--den:${d}\">${Array.from({length:d},(_,i)=>`<button type=\"button\" class=\"sg-fraction-cell\" aria-label=\"${i+1}. eş parça\"></button>`).join('')}</div><em>${target} parçayı boya</em></div>`;
}""",
"""function fractionShadeBuilder(denom,target){
  const d=Math.max(2,Number(denom)||2), t=Math.max(1,Math.min(d,Number(target)||1));
  return `<div class=\"sg-fraction-shade-builder\" data-target=\"${t}\" data-paint-count=\"0\"><small>${d} EŞ PARÇA</small><div class=\"sg-fraction-strip interactive paintable\" style=\"--den:${d}\" role=\"group\" aria-label=\"${d} eş parçadan ${t} tanesini boya\">${Array.from({length:d},(_,i)=>`<button type=\"button\" class=\"sg-fraction-cell\" data-ink=\"0\" aria-pressed=\"false\" aria-label=\"${i+1}. eş parça\"></button>`).join('')}</div><div class=\"sg-fraction-paint-tools\"><em>Parmağınla veya kalemle ${t} parçayı boya</em><button type=\"button\" class=\"sg-fraction-clear\">Temizle</button></div></div>`;
}""")

# 3) Paint surface visuals. Selected means "dominantly painted", not "fill the whole cell".
append_once('styles.css','/* v1.5.5 fraction freehand paint */',r"""
/* v1.5.5 fraction freehand paint */
.sg-fraction-shade-builder .sg-fraction-strip.paintable{min-height:112px;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden;cursor:crosshair}
.sg-fraction-shade-builder .sg-fraction-strip.paintable .sg-fraction-cell{position:relative;overflow:hidden;touch-action:none;background:rgba(255,255,255,.45)}
.sg-fraction-shade-builder .sg-fraction-strip.paintable .sg-fraction-cell.selected{background:rgba(200,111,138,.07)!important;box-shadow:inset 0 0 0 2px rgba(200,111,138,.20)}
.sg-fraction-ink-dot{position:absolute;width:27px;height:27px;border-radius:48% 52% 45% 55%;background:rgba(200,111,138,.58);transform:translate(-50%,-50%) rotate(12deg);pointer-events:none;box-shadow:0 1px 2px rgba(115,54,74,.08)}
.sg-fraction-paint-tools{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:10px}
.sg-fraction-paint-tools em{margin:0!important}
.sg-fraction-clear{min-height:36px;padding:0 12px;border:1px solid var(--line);border-radius:12px;background:var(--paper);color:var(--muted);font-size:11px;font-weight:850}
.sg-fraction-clear:hover{background:var(--paper-2);color:var(--ink)}
@media (pointer:coarse){.sg-fraction-shade-builder .sg-fraction-strip.paintable{min-height:132px}.sg-fraction-ink-dot{width:34px;height:34px}}
""")

# 4) Version/cache + test command.
p = root/'package.json'
pkg=json.loads(p.read_text(encoding='utf-8'))
pkg['version']='1.5.5'
old_test=pkg['scripts']['test']
if 'fraction-paint.test.mjs' not in old_test:
    pkg['scripts']['test']=old_test.replace('node tests/practice-variation.test.mjs','node tests/practice-variation.test.mjs && node tests/fraction-paint.test.mjs')
p.write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

replace_once('sw.js',"const CACHE='saymera-v1-5-2-curriculum-exact';","const CACHE='saymera-v1-5-5-fraction-paint';")

# 5) Update reference documentation.
append_once('P2_FRACTIONS_REFERENCE.md','## Serbest boyama etkileşimi (v1.5.5)',r"""
## Serbest boyama etkileşimi (v1.5.5)

Singapore yaklaşımıyla uyumlu olarak kesir, önce eş parçalara ayrılmış bütün üzerinde kurulabilir. SAYMERA'nın dijital uygulamasında çocuk boş eş bölmeleri parmak veya kalemle doğrudan boyar.

- Değerlendirilen şey kusursuz boyama değildir; hangi eş parçaların bilinçli biçimde boyandığıdır.
- Bölmenin tamamen doldurulması gerekmez.
- Sistem her bölmedeki boya sinyalini ayrı izler; güçlü/dominant boyanan bölmeleri sayar, sınırdan taşan küçük izleri yok sayabilir.
- Örneğin hedef 2/4 ise iki bölmenin belirgin biçimde boyanması doğru kabul edilir; üç bölme belirgin boyanmışsa yanlış kabul edilir.
- `fractionMeaning2` aşamasında sembol önceden bilinmiş sayılmaz; ilk görevler "4 eş parçadan 2'sini boya" gibi sözel/model dilinde kalır. `2/4` gösterimi ancak notation öğretiminden sonra beklenir.

Bu tanıma kuralı, çocuğun motor becerisini değil kesir anlayışını ölçmek için özellikle toleranslıdır.
""")

# 6) Regression test for paint intent recognition and the model contract.
test = root/'tests/fraction-paint.test.mjs'
test.write_text(r"""import assert from 'node:assert/strict';
import {classifyFractionPaint,generateQuestion} from '../engine.mjs';

const twoOfFour=classifyFractionPaint([9,7,1.2,0]);
assert.deepEqual(twoOfFour.selected,[0,1]);
assert.equal(twoOfFour.count,2,'two clearly shaded cells should count as 2 even when not fully filled');

const accidentalCrossing=classifyFractionPaint([8,6.5,2.2,0]);
assert.equal(accidentalCrossing.count,2,'a small boundary-crossing mark should not create a third painted part');

const threeIntentional=classifyFractionPaint([8,7,6,0]);
assert.equal(threeIntentional.count,3,'three materially shaded cells must remain three; classifier must not force the requested numerator');

const tooLittle=classifyFractionPaint([1.4,1.1,0,0]);
assert.equal(tooLittle.count,0,'tiny marks should not be mistaken for intentional shading');

const unevenButIntentional=classifyFractionPaint([12,3.2,0,0]);
assert.equal(unevenButIntentional.count,2,'a partially shaded second part still counts when the intent is clear');

let foundMultiPart=false;
for(let i=0;i<250;i++){
  let n=(i%97)+1;
  const rng=()=>{ n=(n*48271)%2147483647; return n/2147483647; };
  const q=generateQuestion('fractionNotation2','build',2,rng);
  assert.equal(q.response?.interaction,'fraction-shade');
  assert.equal(q.visual?.type,'fraction-shade-builder');
  assert.equal(Number(q.response?.expectedValue),Number(q.visual?.target));
  if(Number(q.visual?.target)>1) foundMultiPart=true;
}
assert.ok(foundMultiPart,'fractionNotation2 build must include multi-part shading, not only unit fractions');

const app=await import('node:fs').then(fs=>fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'));
assert.match(app,/bindFractionPaint\(/);
assert.match(app,/sg-fraction-ink-dot/);
assert.match(app,/classifyFractionPaint/);
assert.match(app,/Parmağınla veya kalemle/);

console.log('fraction-paint tests: PASS (dominant-region intent + multi-part fraction builder)');
""",encoding='utf-8')

print('SAYMERA v1.5.5 freehand fraction painting staged')
