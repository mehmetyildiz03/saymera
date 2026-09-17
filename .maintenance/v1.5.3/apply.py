from pathlib import Path
import json
root=Path('.')
def read(p): return (root/p).read_text(encoding='utf-8')
def write(p,s): (root/p).write_text(s,encoding='utf-8')
def rep(s,old,new,label):
    n=s.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1, got {n}')
    return s.replace(old,new,1)

p=Path('engine.mjs'); s=read(p)
s=rep(s,"taskKind:'reasoning-choice',taskLabel:'Algoritmanın nedenini açıkla',visual:{type:'column-operation',a:x.a,b:x.b,op:x.op},hint:'Standart algoritma basamak değerinin görsel bir kısaltmasıdır.',explain:answer+'.'","taskKind:'reasoning-choice',taskLabel:'İşlemin nedenini açıkla',visual:{type:'column-operation',a:x.a,b:x.b,op:x.op},hint:'Birlikleri birliklerle, onlukları onluklarla düşün.',explain:answer+'.'",'P1 add/sub child copy')
s=rep(s,"taskKind:'reasoning-choice',taskLabel:'Grafik sonucunu kanıtla gerekçelendir',visual:{type:'pictograph',cats:x.cats,vals:x.vals,orientation:'horizontal'},hint:'Kategori adından değil sembol sayısından kanıt bul.',explain:`${x.cats[x.maxIndex]} için ${x.max} sembol var ve bu en yüksek frekans.`","taskKind:'reasoning-choice',taskLabel:'Grafik sonucunu açıkla',visual:{type:'pictograph',cats:x.cats,vals:x.vals,orientation:'horizontal'},hint:'Kategori adından çok sembolleri say.',explain:`${x.cats[x.maxIndex]} için ${x.max} sembol var; en çok sembol bu kategoride.`",'P1 data child copy')
write(p,s)

# Permanent child-copy regression across all reference skills.
test=r'''import assert from 'node:assert/strict';
import {skillsFor,supportsLearningCycle,REPRESENTATIONS,createConceptInstance,generateQuestion} from '../engine.mjs';
const makeRng=(seed)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const refs=[...skillsFor('grade1'),...skillsFor('grade2')].filter(s=>supportsLearningCycle(s.id));
const forbidden=[/kanıt profili/i,/temsil genişliği/i,/puanlanan şey/i,/öğrenme döngüsü/i,/practicecheckpoint/i,/conceptkey/i,/taskkind/i,/mastery/i,/remediation/i,/evidence/i,/standart algoritma/i];
for(const [si,skill] of refs.entries()){
  for(const rep of REPRESENTATIONS){
    for(let i=0;i<12;i++){
      const rng=makeRng(700000+si*1000+REPRESENTATIONS.indexOf(rep)*50+i);
      const c=createConceptInstance(skill.id,1+(i%4),rng);
      const q=generateQuestion(skill.id,rep,1+(i%4),rng,c);
      const child=[q.prompt,q.hint,q.explain,q.teachingNote,q.feedbackTitle].filter(Boolean).join(' | ');
      for(const rx of forbidden) assert.ok(!rx.test(child),`${skill.id}/${rep}: child copy leaked ${rx}: ${child}`);
    }
  }
}
console.log(`child-copy tests: PASS (${refs.length} reference skills; no internal/adult engine jargon)`);
'''
write(Path('tests/child-copy.test.mjs'),test)

p=Path('package.json'); data=json.loads(read(p)); data['version']='1.5.3';
base=data['scripts']['test']
if 'child-copy.test.mjs' not in base:
    data['scripts']['test']=base.replace('node tests/ui-static.test.mjs','node tests/child-copy.test.mjs && node tests/ui-static.test.mjs')
write(p,json.dumps(data,ensure_ascii=False,indent=2)+'\n')

p=Path('sw.js'); s=read(p); s=s.replace('saymera-v1-5-2-p2-pedagogy-audit','saymera-v1-5-3-child-copy-polish'); write(p,s)
print('v1.5.3 child-copy polish staged')
