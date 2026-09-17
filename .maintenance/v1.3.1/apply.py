from pathlib import Path
import re, json

ROOT=Path('.')

def sub_once(text, pattern, repl, label, flags=re.S):
    new,n=re.subn(pattern,repl,text,count=1,flags=flags)
    if n!=1: raise SystemExit(f'{label}: expected 1 replacement, got {n}')
    return new

engine_path=ROOT/'engine.mjs'
engine=engine_path.read_text(encoding='utf-8')

old=r'''function generateReadinessQuestion(skillId,difficulty=1,rng=Math.random){
  if(skillId==='time1'){
    if(rng()<.5){
      const starts=[0,5,10,15,20,25,30,35];
      const start=choice(starts,rng);
      const seq=[start,start+5,start+10], answer=start+15;
      return qBase('time1','see',`${seq.join(', ')}, … sıradaki sayı kaç?`,answer,numericChoices(answer,5,rng),{
        taskKind:'readiness-check',
        visual:{type:'sequence',items:seq.concat('?')},
        hint:'Saatte dakikaları okurken 5’er saymak işine yarar.',
        explain:`5’er sayınca sıradaki sayı ${answer}.`,
        feedbackTitle:'5’er saymayı kullandın.',
        countsTowardEvidence:false
      });
    }
    const hour=randInt(1,12,rng), answer=`${hour}:00`;
    return qBase('time1','see','Yelkovan 12’deyken bu saat kaç?',answer,semanticChoices(answer,[`${hour}:30`,`${(hour%12)+1}:00`,`${hour}:15`],rng),{
      taskKind:'readiness-check',
      visual:{type:'clock',hour,minute:0},
      hint:'Yelkovan 12’deyse tam saattir; akrebin gösterdiği sayıyı oku.',
      explain:`Yelkovan 12’de ve akrep ${hour} üzerinde: saat ${answer}.`,
      feedbackTitle:'Tam saati doğru okudun.',
      countsTowardEvidence:false
    });
  }
  const q=generateQuestion(skillId,'see',difficulty,rng,createConceptInstance(skillId,difficulty,rng));
  q.taskKind='readiness-check';
  q.countsTowardEvidence=false;
  q.feedbackTitle ||= 'Başlangıç sorusunu tamamladın.';
  return q;
}
'''
new=r'''const READINESS_SOURCE_SKILL={
  number20:'count10',
  numberBonds10:'number20',
  make10:'numberBonds10',
  add20:'numberBonds10',
  addMany1:'add20',
  sub20:'numberBonds10',
  equality:'add20',
  word1:'add20',
  number100:'number20',
  compareOrder100:'number100',
  ordinal10:'number20',
  numberPattern1:'number100',
  addSub100:'number100',
  multiply40:'add20',
  divide20g1:'multiply40',
  money1:'number100',
  lengthMeasure1:'lengthCompare1',
  shapes1:'shapesBasic',
  shapePattern1:'shapes1',
  data1:'number20'
};

function readinessFromSource(skillId,sourceSkillId,difficulty,rng){
  const sourceDifficulty=Math.min(2,Math.max(1,difficulty));
  const concept=createConceptInstance(sourceSkillId,sourceDifficulty,rng);
  const q=generateQuestion(sourceSkillId,'see',sourceDifficulty,rng,concept);
  q.skillId=skillId;
  q.id=`${skillId}:readiness:${sourceSkillId}:${Date.now()}:${Math.floor(rng()*1e6)}`;
  q.taskKind='readiness-check';
  q.countsTowardEvidence=false;
  q.readinessSourceSkillId=sourceSkillId;
  q.conceptKey=`readiness:${sourceSkillId}`;
  q.feedbackTitle ||= 'Başlangıç bağlantısını kullandın.';
  return q;
}

function generateReadinessQuestion(skillId,difficulty=1,rng=Math.random){
  if(skillId==='time1'){
    if(rng()<.5){
      const starts=[0,5,10,15,20,25,30,35];
      const start=choice(starts,rng);
      const seq=[start,start+5,start+10], answer=start+15;
      return qBase('time1','see',`${seq.join(', ')}, … sıradaki sayı kaç?`,answer,numericChoices(answer,5,rng),{
        taskKind:'readiness-check',
        visual:{type:'sequence',items:seq.concat('?')},
        hint:'Saatte dakikaları okurken 5’er saymak işine yarar.',
        explain:`5’er sayınca sıradaki sayı ${answer}.`,
        feedbackTitle:'5’er saymayı kullandın.',
        countsTowardEvidence:false,
        readinessSourceSkillId:'count-by-5-or-full-hour'
      });
    }
    const hour=randInt(1,12,rng), answer=`${hour}:00`;
    return qBase('time1','see','Yelkovan 12’deyken bu saat kaç?',answer,semanticChoices(answer,[`${hour}:30`,`${(hour%12)+1}:00`,`${hour}:15`],rng),{
      taskKind:'readiness-check',
      visual:{type:'clock',hour,minute:0},
      hint:'Yelkovan 12’deyse tam saattir; akrebin gösterdiği sayıyı oku.',
      explain:`Yelkovan 12’de ve akrep ${hour} üzerinde: saat ${answer}.`,
      feedbackTitle:'Tam saati doğru okudun.',
      countsTowardEvidence:false,
      readinessSourceSkillId:'count-by-5-or-full-hour'
    });
  }
  if(skillId==='lengthCompare1'){
    let a=randInt(3,8,rng), b=randInt(3,8,rng); if(a===b) b=b===8?7:b+1;
    const answer=a>b?'Mavi':'Turuncu';
    return qBase('lengthCompare1','see','Aynı çizgiden başlayan iki çubuktan hangisi daha uzun?',answer,semanticChoices(answer,[answer==='Mavi'?'Turuncu':'Mavi','Eşit','Belli değil'],rng),{
      taskKind:'readiness-check',
      visual:{type:'length-bars',a,b,misaligned:false},
      hint:'İki çubuk aynı yerden başlıyorsa hangi ucun daha ileri gittiğine bak.',
      explain:`${answer} çubuk daha ileri uzanıyor.`,
      feedbackTitle:'Uzunlukları doğrudan karşılaştırdın.',
      countsTowardEvidence:false,
      readinessSourceSkillId:'direct-length-comparison'
    });
  }
  const source=READINESS_SOURCE_SKILL[skillId];
  if(!source) throw new Error(`No authentic readiness source for ${skillId}`);
  return readinessFromSource(skillId,source,difficulty,rng);
}
'''
if old not in engine: raise SystemExit('readiness generator anchor not found')
engine=engine.replace(old,new,1)

engine=engine.replace("dueQuestion:sessionQuestionIndex+(readiness?1:3),","dueQuestion:sessionQuestionIndex+(readiness?0:3),",1)
engine=engine.replace("dueAt:now+(readiness?1000*20:1000*60*3),","dueAt:now+(readiness?0:1000*60*3),",1)
engine_path.write_text(engine,encoding='utf-8')

# App: use realistic first-cycle duration without exposing internal phase names.
app_path=ROOT/'app.js'
app=app_path.read_text(encoding='utf-8')
old_time="""  $('#startMetaText').textContent=locked?'ekran dışı ara':`yaklaşık ${state.profile==='grade2'?'6–8':'5–7'} dk`;
"""
new_time="""  const firstLearningCycle=!!(focus && supportsLearningCycle(focus.skill.id) && !ss?.learningCycle?.firstCycleCompletedAt);
  $('#startMetaText').textContent=locked?'ekran dışı ara':`yaklaşık ${firstLearningCycle?'7–10':state.profile==='grade2'?'6–8':'5–7'} dk`;
"""
if old_time not in app: raise SystemExit('duration anchor not found')
app=app.replace(old_time,new_time,1)
app_path.write_text(app,encoding='utf-8')

# Standalone: current v1.3 filename + keep legacy alias so old links do not break.
build_path=ROOT/'build-standalone.mjs'
build=build_path.read_text(encoding='utf-8')
old_build="""fs.writeFileSync(path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html'),html);
console.log('standalone built:',path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html'));
"""
new_build="""const currentStandalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');
const legacyStandalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');
fs.writeFileSync(currentStandalone,html);
fs.writeFileSync(legacyStandalone,html); // backward-compatible alias
console.log('standalone built:',currentStandalone);
"""
if old_build not in build: raise SystemExit('build standalone anchor not found')
build=build.replace(old_build,new_build,1)
build_path.write_text(build,encoding='utf-8')

# Static test checks the current artifact and still confirms alias exists.
ui_path=ROOT/'tests/ui-static.test.mjs'
ui=ui_path.read_text(encoding='utf-8')
ui=ui.replace("const standalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');\nassert.ok(fs.existsSync(standalone),'v1.2 standalone build missing');",
              "const standalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');\nassert.ok(fs.existsSync(standalone),'v1.3 standalone build missing');\nassert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html')),'legacy standalone alias missing');",1)
ui=ui.replace("filename:'SAYMERA_v1_2_TEK_DOSYA.inline.js'","filename:'SAYMERA_v1_3_TEK_DOSYA.inline.js'",1)
ui_path.write_text(ui,encoding='utf-8')

# Strengthen cycle tests: every P1 readiness probe comes from a prerequisite/foundation and stays out of mastery evidence.
test_path=ROOT/'tests/learning-cycle.test.mjs'
test=test_path.read_text(encoding='utf-8')
test=test.replace("  LEARNING_PHASES, defaultState, ensureSkillState, supportsLearningCycle,\n  buildLearningCyclePlan, createConceptInstance, generateLearningQuestion, applyAnswer\n",
                  "  LEARNING_PHASES, defaultState, ensureSkillState, supportsLearningCycle, skillsFor,\n  buildLearningCyclePlan, createConceptInstance, generateLearningQuestion, applyAnswer\n",1)
insert="""
const p1Skills=skillsFor('grade1');
assert.equal(p1Skills.length,22);
for(const skill of p1Skills){
  assert.equal(supportsLearningCycle(skill.id),true,`${skill.id} must use the learning-cycle contract`);
  const rq=generateLearningQuestion(skill.id,'readiness','see',1,seeded,null);
  assert.equal(rq.taskKind,'readiness-check',`${skill.id} readiness must be diagnostic`);
  assert.equal(rq.countsTowardEvidence,false,`${skill.id} readiness must not inflate mastery`);
  assert.ok(rq.readinessSourceSkillId,`${skill.id} must declare what prerequisite/foundation it probes`);
  assert.notEqual(rq.readinessSourceSkillId,skill.id,`${skill.id} must not disguise target content as prerequisite evidence`);
}

const failing=defaultState();
const failingReadiness=generateLearningQuestion('time1','readiness','see',1,seeded,null);
applyAnswer(failing,failingReadiness,{correct:false,now:500,sessionQuestionIndex:1});
const immediateBridge=failing.reviewQueue.find(x=>x.skillId==='time1'&&x.stage==='same-session');
assert.ok(immediateBridge);
assert.equal(immediateBridge.dueQuestion,1,'failed readiness support should be available before the next core task');
"""
marker="assert.equal(supportsLearningCycle('time2'),false,'legacy P2 time stays outside the new contract until migrated');\n"
if marker not in test: raise SystemExit('learning cycle test marker not found')
test=test.replace(marker,marker+insert,1)
test_path.write_text(test,encoding='utf-8')

# Version/cache bump.
pkg_path=ROOT/'package.json'
pkg=json.loads(pkg_path.read_text(encoding='utf-8'))
pkg['version']='1.3.1'
pkg_path.write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sw_path=ROOT/'sw.js'
sw=sw_path.read_text(encoding='utf-8')
sw=re.sub(r"const CACHE='[^']+';","const CACHE='saymera-v1-3-1-readiness';",sw,count=1)
sw_path.write_text(sw,encoding='utf-8')

# README current standalone name.
readme_path=ROOT/'README.md'
readme=readme_path.read_text(encoding='utf-8')
readme=readme.replace('`SAYMERA_v1_2_TEK_DOSYA.html`','`SAYMERA_v1_3_TEK_DOSYA.html`')
readme_path.write_text(readme,encoding='utf-8')

# P2 target is documented before code migration so legacy content is not silently relabelled.
p2=r'''# Singapore Primary 2 → SAYMERA migration target

SAYMERA is now Singapore-first. Primary 2 will be migrated deliberately; current Grade 2 legacy skills are not treated as Singapore P2-complete.

Primary source: Singapore Ministry of Education, **Primary Mathematics Syllabus P1–P6** (2021 syllabus; official MOE updates through 2025):
https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-october-2025.pdf

## Target P2 skill map

1. Numbers to 1000: count by tens/hundreds; hundreds-tens-ones; numerals/words; compare/order; number patterns; odd/even.
2. Addition and subtraction up to 3 digits: concrete base-ten model → algorithm; mental ± ones/tens/hundreds; up to 2-step word problems with part-whole/comparison models.
3. Multiplication/division: tables 2, 3, 4, 5, 10; ÷ notation; inverse relationship; mental calculation within tables.
4. Fractions: part-whole; notation/representation; unit and like-fraction compare/order (denominators ≤12); add/subtract like fractions within one whole.
5. Money: dollar/cent structure adapted to Turkish lira/kuruş while preserving mathematical structure; decimal notation, comparison and unit conversion.
6. Measurement: metres; kilograms/grams; litres; appropriate units and comparison/order.
7. Time: tell time to the minute; duration in hours/minutes; hours+minutes ↔ minutes conversion.
8. Geometry: 2D patterning by size/shape/colour/orientation; cube/cuboid/cone/cylinder/sphere.
9. Data: picture graphs with scales.

## Migration rule

A P2 skill is not marked learning-cycle ready until it has authentic tasks for model, representation, symbol, reasoning, context and varied practice, plus a real prerequisite/readiness probe and delayed retrieval. Legacy generators stay outside this contract until migrated.
'''
(ROOT/'SINGAPORE_P2_MIGRATION_TARGET.md').write_text(p2,encoding='utf-8')

print('v1.3.1 readiness hardening staged')
