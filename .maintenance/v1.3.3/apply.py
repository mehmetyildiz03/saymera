from pathlib import Path
import re, json

ROOT=Path('.')
engine_path=ROOT/'engine.mjs'
app_path=ROOT/'app.js'
test_path=ROOT/'tests/learning-cycle.test.mjs'
ui_test_path=ROOT/'tests/ui-static.test.mjs'
package_path=ROOT/'package.json'
sw_path=ROOT/'sw.js'
build_path=ROOT/'build-standalone.mjs'
readme_path=ROOT/'README.md'
doc_path=ROOT/'LEARNING_CYCLE_V1_3.md'
index_path=ROOT/'index.html'

engine=engine_path.read_text(encoding='utf-8')
app=app_path.read_text(encoding='utf-8')

# 1) Plans have a practice checkpoint rather than a predetermined completion question.
old="""export function buildLearningCyclePlan(skillState){
  const lc=ensureLearningCycleState(skillState);
  if(!lc.firstCycleCompletedAt){
    return [
      {phase:'readiness',representation:'see',kind:'readiness',conceptScope:'fresh',countsTowardEvidence:false},
      {phase:'model',representation:'build',kind:'focus'},
      {phase:'representation',representation:'see',kind:'focus'},
      {phase:'symbol',representation:'symbol',kind:'focus'},
      {phase:'reasoning',representation:'explain',kind:'focus'},
      {phase:'context',representation:'transfer',kind:'focus',conceptScope:'fresh'},
      {phase:'practice',representation:'symbol',kind:'practice',conceptScope:'fresh',practiceIndex:0},
      {phase:'practice',representation:'transfer',kind:'practice',conceptScope:'fresh',practiceIndex:1,cycleFinal:true}
    ];
  }
  const ranked=[...REPRESENTATIONS].sort((a,b)=>{
    const ea=skillState.evidence[a], eb=skillState.evidence[b];
    const unseenA=(ea?.attempts||0)===0?0:1, unseenB=(eb?.attempts||0)===0?0:1;
    return unseenA-unseenB || (ea?.score||0)-(eb?.score||0);
  });
  const reps=[];
  for(const r of [...ranked,'symbol','transfer',...REPRESENTATIONS]) if(!reps.includes(r) && reps.length<4) reps.push(r);
  return reps.map((representation,index)=>({
    phase:'practice',
    representation,
    kind:'practice',
    conceptScope:'fresh',
    practiceIndex:index,
    cycleFinal:index===reps.length-1
  }));
}
"""
new="""export function buildLearningCyclePlan(skillState){
  const lc=ensureLearningCycleState(skillState);
  if(!lc.firstCycleCompletedAt){
    return [
      {phase:'readiness',representation:'see',kind:'readiness',conceptScope:'fresh',countsTowardEvidence:false},
      {phase:'model',representation:'build',kind:'focus'},
      {phase:'representation',representation:'see',kind:'focus'},
      {phase:'symbol',representation:'symbol',kind:'focus'},
      {phase:'reasoning',representation:'explain',kind:'focus'},
      {phase:'context',representation:'transfer',kind:'focus',conceptScope:'fresh'},
      {phase:'practice',representation:'symbol',kind:'practice',conceptScope:'fresh',practiceIndex:0},
      {phase:'practice',representation:'transfer',kind:'practice',conceptScope:'fresh',practiceIndex:1,practiceCheckpoint:true}
    ];
  }
  const ranked=[...REPRESENTATIONS].sort((a,b)=>{
    const ea=skillState.evidence[a], eb=skillState.evidence[b];
    const unseenA=(ea?.attempts||0)===0?0:1, unseenB=(eb?.attempts||0)===0?0:1;
    return unseenA-unseenB || (ea?.score||0)-(eb?.score||0);
  });
  const reps=[];
  for(const r of [...ranked,'symbol','transfer',...REPRESENTATIONS]) if(!reps.includes(r) && reps.length<2) reps.push(r);
  return reps.map((representation,index)=>({
    phase:'practice',
    representation,
    kind:'practice',
    conceptScope:'fresh',
    practiceIndex:index,
    practiceCheckpoint:index===reps.length-1
  }));
}

export function evaluatePracticeCheckpoint(previousEvents,currentEvent){
  const events=[...(previousEvents||[]),currentEvent].filter(Boolean);
  const scheduledPractice=events.filter(e=>e.phase==='practice'&&e.kind==='practice');
  const meaningful=events.filter(e=>e.kind!=='bridge'&&e.phase);
  const friction=meaningful.filter(e=>e.correct===false||e.usedHint===true).length;
  const target=Math.min(4,2+(friction>=1?1:0)+(friction>=2?1:0));
  const practiceCount=scheduledPractice.length;
  const atCap=practiceCount>=4;
  return {
    target,
    practiceCount,
    friction,
    atCap,
    complete:currentEvent?.correct===true&&practiceCount>=target
  };
}
"""
if old not in engine: raise SystemExit('learning plan anchor missing')
engine=engine.replace(old,new,1)

# 2) In a managed learning cycle, a wrong answer gets its representation bridge immediately.
old="const immediate=readiness||completionRecovery;"
new="const immediate=readiness||completionRecovery||!!phase;"
if old not in engine: raise SystemExit('immediate bridge anchor missing')
engine=engine.replace(old,new,1)
engine_path.write_text(engine,encoding='utf-8')

# 3) App imports the pure adaptive decision helper.
old="  profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan\n"
new="  profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan, evaluatePracticeCheckpoint\n"
if old not in app: raise SystemExit('app import anchor missing')
app=app.replace(old,new,1)

# Session tracks only this session's learning events; persistent history remains in engine state.
old="""    focusRepresentations:plan.filter(x=>x.kind==='focus').map(x=>x.representation),
    questionIndex:0, correct:0, wrong:0, hints:0, effortUsed:0, recentSkillIds:[], newStable:0, bridgeAdds:0
"""
new="""    focusRepresentations:plan.filter(x=>x.kind==='focus').map(x=>x.representation),
    questionIndex:0, correct:0, wrong:0, hints:0, effortUsed:0, recentSkillIds:[], learningEvents:[], newStable:0, bridgeAdds:0
"""
if old not in app: raise SystemExit('session state anchor missing')
app=app.replace(old,new,1)
app=app.replace("if(!session || session.bridgeAdds>=2) return;","if(!session || session.bridgeAdds>=4) return;",1)

# A fresh adaptive practice task is inserted one at a time, preserving variety.
insert_before="function answerQuestion(value,button){"
adaptive_helpers=r'''const ADAPTIVE_PRACTICE_REPRESENTATIONS=['symbol','transfer','see','explain'];
function appendAdaptivePractice(decision){
  if(!session||decision.practiceCount>=4) return;
  const index=decision.practiceCount;
  const representation=ADAPTIVE_PRACTICE_REPRESENTATIONS[index]||'transfer';
  session.plan.splice(session.planIndex+1,0,{
    skillId:session.focusSkillId,
    representation,
    phase:'practice',
    reviewItem:null,
    kind:'practice',
    conceptScope:'fresh',
    practiceIndex:index,
    practiceCheckpoint:true
  });
}
function currentLearningEvent(q,correct,hint){
  return {
    skillId:q.skillId,
    phase:q.learningPhase||null,
    kind:currentSelection?.kind||null,
    taskKind:q.taskKind||null,
    representation:q.representation,
    correct:!!correct,
    usedHint:!!hint
  };
}
'''
if insert_before not in app: raise SystemExit('answerQuestion marker missing')
app=app.replace(insert_before,adaptive_helpers+insert_before,1)

# Checkpoint decision occurs before engine applyAnswer so cycleFinal has semantic meaning.
old="""  const before=ensureSkillState(state,q.skillId).stable;
  const delayed=currentSelection.reviewItem?.stage==='next-day';
  applyAnswer(state,q,{correct,usedHint,isDelayedReview:!!delayed,now:Date.now(),sessionQuestionIndex:session.questionIndex});
  if(currentSelection.reviewItem) consumeReview(state,currentSelection.reviewItem);
"""
new="""  const before=ensureSkillState(state,q.skillId).stable;
  const event=currentLearningEvent(q,correct,usedHint);
  let practiceDecision=null;
  if(currentSelection?.practiceCheckpoint&&q.learningPhase==='practice'&&currentSelection.kind==='practice'){
    practiceDecision=evaluatePracticeCheckpoint(session.learningEvents,event);
    // Correct + enough varied practice closes the cycle. If four scheduled practice
    // attempts are exhausted on an error, the immediate recovery becomes the gate.
    if(practiceDecision.complete||(practiceDecision.atCap&&!correct)) q.cycleFinal=true;
  }
  const delayed=currentSelection.reviewItem?.stage==='next-day';
  applyAnswer(state,q,{correct,usedHint,isDelayedReview:!!delayed,now:Date.now(),sessionQuestionIndex:session.questionIndex});
  session.learningEvents.push(event);
  if(practiceDecision&&!q.cycleFinal) appendAdaptivePractice(practiceDecision);
  if(currentSelection.reviewItem) consumeReview(state,currentSelection.reviewItem);
"""
if old not in app: raise SystemExit('answer apply anchor missing')
app=app.replace(old,new,1)
app_path.write_text(app,encoding='utf-8')

# 4) Tests: plan semantics + adaptive thresholds.
test=test_path.read_text(encoding='utf-8')
test=test.replace("  readinessSourcesFor, addClockMinutes\n} from '../engine.mjs';",
                  "  readinessSourcesFor, addClockMinutes, evaluatePracticeCheckpoint\n} from '../engine.mjs';",1)
test=test.replace("assert.equal(plan.at(-1).cycleFinal,true);","assert.equal(plan.at(-1).practiceCheckpoint,true);\nassert.equal(!!plan.at(-1).cycleFinal,false);",1)
# Existing successful cycle simulation must explicitly turn the checkpoint into completion.
old_loop="""  const q=generateLearningQuestion('time1',item.phase,item.representation,1,seeded,concept);
  q.cycleFinal=!!item.cycleFinal;
  applyAnswer(state,q,{correct:true,now:now+=1000,sessionQuestionIndex:2});
"""
new_loop="""  const q=generateLearningQuestion('time1',item.phase,item.representation,1,seeded,concept);
  if(item.practiceCheckpoint) q.cycleFinal=true; // perfect-path adaptive checkpoint
  applyAnswer(state,q,{correct:true,now:now+=1000,sessionQuestionIndex:2});
"""
if old_loop not in test: raise SystemExit('test cycle loop anchor missing')
test=test.replace(old_loop,new_loop,1)
test=test.replace("assert.equal(reinforcement.length,4);\nassert.ok(reinforcement.every(x=>x.phase==='practice'));\nassert.equal(reinforcement.at(-1).cycleFinal,true);",
                  "assert.equal(reinforcement.length,2);\nassert.ok(reinforcement.every(x=>x.phase==='practice'));\nassert.equal(reinforcement.at(-1).practiceCheckpoint,true);",1)

adaptive_tests=r'''
// Adaptive practice: two clean varied tasks are enough; friction extends, never beyond four.
const clean1={phase:'practice',kind:'practice',correct:true,usedHint:false};
const clean2={phase:'practice',kind:'practice',correct:true,usedHint:false};
let decision=evaluatePracticeCheckpoint([clean1],clean2);
assert.deepEqual({target:decision.target,count:decision.practiceCount,complete:decision.complete},{target:2,count:2,complete:true});
const hinted={phase:'practice',kind:'practice',correct:true,usedHint:true};
decision=evaluatePracticeCheckpoint([clean1],hinted);
assert.equal(decision.target,3);
assert.equal(decision.complete,false);
decision=evaluatePracticeCheckpoint([clean1,hinted],clean2);
assert.equal(decision.target,3);
assert.equal(decision.practiceCount,3);
assert.equal(decision.complete,true);
const coreMiss={phase:'reasoning',kind:'focus',correct:false,usedHint:false};
const secondMiss={phase:'context',kind:'focus',correct:false,usedHint:false};
decision=evaluatePracticeCheckpoint([coreMiss,secondMiss,clean1,clean2],{phase:'practice',kind:'practice',correct:true,usedHint:false});
assert.equal(decision.target,4);
assert.equal(decision.complete,false);
decision=evaluatePracticeCheckpoint([coreMiss,secondMiss,clean1,clean2,{phase:'practice',kind:'practice',correct:true,usedHint:false}],{phase:'practice',kind:'practice',correct:true,usedHint:false});
assert.equal(decision.target,4);
assert.equal(decision.practiceCount,4);
assert.equal(decision.complete,true);
const cappedWrong=evaluatePracticeCheckpoint([clean1,clean2,{phase:'practice',kind:'practice',correct:true,usedHint:false}],{phase:'practice',kind:'practice',correct:false,usedHint:false});
assert.equal(cappedWrong.atCap,true);
assert.equal(cappedWrong.complete,false);
'''
marker="// Clock arithmetic preserves the day period across noon and midnight."
if marker not in test: raise SystemExit('adaptive test insertion marker missing')
test=test.replace(marker,adaptive_tests+'\n'+marker,1)
test_path.write_text(test,encoding='utf-8')

ui=ui_test_path.read_text(encoding='utf-8')
ui += "\nassert.ok(app.includes('appendAdaptivePractice'),'adaptive practice insertion missing');\nassert.ok(app.includes('evaluatePracticeCheckpoint'),'adaptive practice decision missing');\n"
ui_test_path.write_text(ui,encoding='utf-8')

# 5) Standalone file gets a current name while keeping the v1.2 alias for existing links.
build=build_path.read_text(encoding='utf-8')
old="""fs.writeFileSync(path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html'),html);
console.log('standalone built:',path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html'));
"""
new="""const currentStandalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');
const legacyStandalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');
fs.writeFileSync(currentStandalone,html);
fs.writeFileSync(legacyStandalone,html);
console.log('standalone built:',currentStandalone);
"""
if old not in build: raise SystemExit('standalone writer anchor missing')
build=build.replace(old,new,1)
build_path.write_text(build,encoding='utf-8')

# Static standalone test follows current file but confirms compatibility alias.
ui=ui_test_path.read_text(encoding='utf-8')
ui=ui.replace("const standalone=path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html');\nassert.ok(fs.existsSync(standalone),'v1.2 standalone build missing');",
              "const standalone=path.join(root,'SAYMERA_v1_3_TEK_DOSYA.html');\nassert.ok(fs.existsSync(standalone),'v1.3 standalone build missing');\nassert.ok(fs.existsSync(path.join(root,'SAYMERA_v1_2_TEK_DOSYA.html')),'legacy standalone alias missing');",1)
ui=ui.replace("filename:'SAYMERA_v1_2_TEK_DOSYA.inline.js'","filename:'SAYMERA_v1_3_TEK_DOSYA.inline.js'",1)
ui_test_path.write_text(ui,encoding='utf-8')

readme=readme_path.read_text(encoding='utf-8').replace('`SAYMERA_v1_2_TEK_DOSYA.html`','`SAYMERA_v1_3_TEK_DOSYA.html`')
readme_path.write_text(readme,encoding='utf-8')

# Hidden HTML defaults no longer mention an internal window label/count before JS paints real content.
index=index_path.read_text(encoding='utf-8')
index=index.replace('<span id="practiceLens">KUR</span><b id="practiceTitle">Kavram keşfi</b><em id="practiceCounter">1 / 5</em>',
                    '<span id="practiceLens">MATEMATİK</span><b id="practiceTitle">Kavram keşfi</b><em id="practiceCounter">1 / 1</em>',1)
index_path.write_text(index,encoding='utf-8')

pkg=json.loads(package_path.read_text(encoding='utf-8'))
pkg['version']='1.3.3'
package_path.write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sw=sw_path.read_text(encoding='utf-8')
sw=re.sub(r"const CACHE='[^']+';","const CACHE='saymera-v1-3-3-adaptive-practice';",sw,count=1)
sw_path.write_text(sw,encoding='utf-8')

doc=doc_path.read_text(encoding='utf-8')
section='''\n\n## v1.3.3 — Adaptif pekiştirme\n\nİlk öğrenme artık “8 soru ve bitti” kuralı değildir. Readiness + model + temsil + sembol + gerekçe + bağlam sonrasında en az iki farklı yeni örnek gelir. Oturum içindeki hata/ipucu sinyallerine göre plan 2, 3 veya en fazla 4 planlı pekiştirme örneğine uzar. Böylece temiz ilk öğrenme 8 temel görevde tamamlanabilir; zorlanma varsa 9–10 planlı göreve uzar. Temsil köprüleri bu sayıya dahil değildir ve gerektiğinde hemen araya girer.\n\nPekiştirme hedefi: sürtünme yoksa 2; bir hata/ipucu sinyali varsa 3; iki veya daha fazla sinyal varsa 4. Dördüncü planlı pekiştirme de yanlışsa, döngüyü tamamlayan kapı doğrudan temsil değiştiren recovery görevidir. Çocuk bu karar mantığını görmez.\n'''
if '## v1.3.3 — Adaptif pekiştirme' not in doc: doc+=section
doc_path.write_text(doc,encoding='utf-8')

print('v1.3.3 adaptive practice migration staged')
