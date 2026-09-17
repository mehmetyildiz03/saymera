from pathlib import Path
import re, json

ROOT=Path('.')
engine_path=ROOT/'engine.mjs'
app_path=ROOT/'app.js'
test_path=ROOT/'tests/learning-cycle.test.mjs'
ui_test_path=ROOT/'tests/ui-static.test.mjs'
package_path=ROOT/'package.json'
sw_path=ROOT/'sw.js'
doc_path=ROOT/'LEARNING_CYCLE_V1_3.md'

engine=engine_path.read_text(encoding='utf-8')
app=app_path.read_text(encoding='utf-8')

# Clock cases carry a real day period; helper handles noon/midnight rollover.
old="""function time1Cases(){
  const out=[];
  const minutes=[0,5,10,15,20,25,30,35,40,45,50,55];
  for(let hour=1;hour<=12;hour++){
    for(const minute of minutes){
      const period=((hour+minute/5)%2===0)?'ÖÖ':'ÖS';
      const intl=period==='ÖÖ'?'a.m.':'p.m.';
      const duration=((hour+minute/5)%3===0)?60:30;
      out.push({hour,minute,label:`${hour}:${String(minute).padStart(2,'0')}`,period,intl,duration});
    }
  }
  return out;
}
"""
new="""function time1Cases(){
  const out=[];
  const minutes=[0,5,10,15,20,25,30,35,40,45,50,55];
  for(let hour=1;hour<=12;hour++){
    for(const minute of minutes){
      for(const period of ['ÖÖ','ÖS']){
        const intl=period==='ÖÖ'?'a.m.':'p.m.';
        const duration=((hour+minute/5)%3===0)?60:30;
        out.push({hour,minute,label:`${hour}:${String(minute).padStart(2,'0')}`,period,intl,duration});
      }
    }
  }
  return out;
}
export function addClockMinutes(z,delta){
  let hour24=z.hour%12;
  if(z.period==='ÖS') hour24+=12;
  const start=hour24*60+z.minute;
  const total=((start+delta)%(24*60)+(24*60))%(24*60);
  const h24=Math.floor(total/60), minute=total%60;
  const period=h24<12?'ÖÖ':'ÖS';
  const intl=period==='ÖÖ'?'a.m.':'p.m.';
  const hour=h24%12||12;
  return {hour,minute,label:`${hour}:${String(minute).padStart(2,'0')}`,period,intl};
}
"""
if old not in engine: raise SystemExit('time1Cases anchor missing')
engine=engine.replace(old,new,1)

old="""  const x=c.anchor;
  const addMinutes=(z,delta)=>{
    const total=((z.hour%12)*60+z.minute+delta)%(12*60);
    const hour=(Math.floor(total/60)||12), minute=total%60;
    return {hour,minute,label:`${hour}:${String(minute).padStart(2,'0')}`};
  };
"""
if old not in engine: raise SystemExit('local addMinutes anchor missing')
engine=engine.replace(old,"  const x=c.anchor;\n",1)

old="""  const y=c.transfer, end=addMinutes(y,y.duration);
  return qBase('time1',rep,`Bir etkinlik ${y.label} ${y.period} (${y.intl}) başlıyor ve ${y.duration===60?'1 saat (1 h)':'yarım saat (30 min)'} sürüyor. Bitiş saati hangisidir?`,end.label,semanticChoices(end.label,[addMinutes(y,y.duration-5).label,addMinutes(y,y.duration+5).label,addMinutes(y,y.duration===60?30:60).label],rng), {
    taskKind:'context-transfer',taskLabel:'Saati süre ve günlük programa taşı',visual:{type:'schedule-event',label:`${y.label} ${y.period}`,event:y.duration===60?'1 saatlik etkinlik':'yarım saatlik etkinlik'},hint:`Başlangıç zamanına ${y.duration} dakika ekle.`,explain:`${y.label} + ${y.duration} dakika = ${end.label}. ${y.period}, ${y.intl} anlamına gelir.`
  });
"""
new="""  const y=c.transfer, end=addClockMinutes(y,y.duration);
  const fmt=z=>`${z.label} ${z.period}`;
  const answer=fmt(end);
  const distractors=[
    addClockMinutes(y,y.duration-5),
    addClockMinutes(y,y.duration+5),
    addClockMinutes(y,y.duration===60?30:60)
  ].map(fmt);
  return qBase('time1',rep,`Bir etkinlik ${y.label} ${y.period} (${y.intl}) başlıyor ve ${y.duration===60?'1 saat (1 h)':'yarım saat (30 min)'} sürüyor. Bitiş zamanı hangisidir?`,answer,semanticChoices(answer,distractors,rng), {
    taskKind:'context-transfer',taskLabel:'Saati süre ve günlük programa taşı',visual:{type:'schedule-event',label:`${y.label} ${y.period}`,event:y.duration===60?'1 saatlik etkinlik':'yarım saatlik etkinlik'},hint:`Başlangıç zamanına ${y.duration} dakika ekle; 12 sınırını geçersen ÖÖ/ÖS değişimini de kontrol et.`,explain:`${y.label} ${y.period} + ${y.duration} dakika = ${answer}.`
  });
"""
if old not in engine: raise SystemExit('time transfer anchor missing')
engine=engine.replace(old,new,1)

# The learning cycle only closes on a successful final practice/recovery.
old="""  if(phase){
    if(question.cycleFinal){
      lc.firstCycleCompletedAt ||= now;
      lc.lastCycleAt=now;
      lc.status='consolidating';
      lc.retrievalDueAt=now+1000*60*60*20;
    } else if(!lc.firstCycleCompletedAt){
      lc.status='learning';
    }
"""
new="""  if(phase){
    if(question.cycleFinal && correct){
      lc.firstCycleCompletedAt ||= now;
      lc.lastCycleAt=now;
      lc.status='consolidating';
      lc.retrievalDueAt=now+1000*60*60*20;
    } else if(!lc.firstCycleCompletedAt){
      lc.status='learning';
    }
"""
if old not in engine: raise SystemExit('cycle completion anchor missing')
engine=engine.replace(old,new,1)

old="""    const alreadySupport=readiness && question.taskKind==='readiness-support';
    if(!alreadySupport){
      const alternative=readiness?'build':(bridgeMap[question.representation]||'see');
      state.reviewQueue.push({
        id:`review:${question.id}`,
        skillId:question.skillId,
        representation:alternative,
        phase:readiness?'readiness':'practice',
        readinessSourceSkillId:readiness?(question.readinessSourceSkillId||null):null,
        support:readiness,
        dueQuestion:readiness?sessionQuestionIndex:sessionQuestionIndex+3,
        dueAt:readiness?now:now+1000*60*3,
        stage:'same-session'
      });
    }
"""
new="""    const alreadySupport=readiness && question.taskKind==='readiness-support';
    const alreadyCompletionRecovery=!!question.completionRecovery;
    if(!alreadySupport && !alreadyCompletionRecovery){
      const completionRecovery=!!question.cycleFinal;
      const immediate=readiness||completionRecovery;
      const alternative=readiness?'build':(bridgeMap[question.representation]||'see');
      state.reviewQueue.push({
        id:`review:${question.id}`,
        skillId:question.skillId,
        representation:alternative,
        phase:readiness?'readiness':'practice',
        readinessSourceSkillId:readiness?(question.readinessSourceSkillId||null):null,
        support:readiness,
        completeCycleOnSuccess:completionRecovery,
        dueQuestion:immediate?sessionQuestionIndex:sessionQuestionIndex+3,
        dueAt:immediate?now:now+1000*60*3,
        stage:'same-session'
      });
    }
"""
if old not in engine: raise SystemExit('bridge scheduling anchor missing')
engine=engine.replace(old,new,1)

old="""  if(question.cycleFinal){
    const existing=state.reviewQueue.some(x=>x.skillId===question.skillId && x.stage==='next-day');
"""
new="""  if(question.cycleFinal && correct){
    const existing=state.reviewQueue.some(x=>x.skillId===question.skillId && x.stage==='next-day');
"""
if old not in engine: raise SystemExit('retention gate anchor missing')
engine=engine.replace(old,new,1)
engine_path.write_text(engine,encoding='utf-8')

# App must never finish an active plan while a same-session bridge is waiting.
old="""function dueSameSessionReview(){
  if(!session) return null;
  const allowed=new Set(skillsFor(state.profile).map(s=>s.id));
  return state.reviewQueue.filter(x=>allowed.has(x.skillId)&&x.stage==='same-session'&&x.dueQuestion!=null&&x.dueQuestion<=session.questionIndex).sort((a,b)=>a.dueQuestion-b.dueQuestion)[0]||null;
}
"""
new="""function dueSameSessionReview(includeFuture=false){
  if(!session) return null;
  const allowed=new Set(skillsFor(state.profile).map(s=>s.id));
  return state.reviewQueue
    .filter(x=>allowed.has(x.skillId)&&x.stage==='same-session'&&x.dueQuestion!=null&&(includeFuture||x.dueQuestion<=session.questionIndex))
    .sort((a,b)=>a.dueQuestion-b.dueQuestion)[0]||null;
}
"""
if old not in app: raise SystemExit('dueSameSessionReview anchor missing')
app=app.replace(old,new,1)

app=app.replace("function maybeInjectBridgeReview(){\n  if(!session || session.bridgeAdds>=2) return;\n  const review=dueSameSessionReview();",
                "function maybeInjectBridgeReview(force=false){\n  if(!session || session.bridgeAdds>=2) return;\n  const review=dueSameSessionReview(force);",1)
app=app.replace("function loadPlanItem(){\n  if(!session) return;\n  maybeInjectBridgeReview();\n  if(session.planIndex>=session.plan.length){ finishSession(); return; }",
                "function loadPlanItem(){\n  if(!session) return;\n  const atPlanEnd=session.planIndex>=session.plan.length;\n  maybeInjectBridgeReview(atPlanEnd);\n  if(session.planIndex>=session.plan.length){ finishSession(); return; }",1)

old="""  if(currentSelection.countsTowardEvidence===false) currentQuestion.countsTowardEvidence=false;
  currentQuestion.cycleFinal=!!currentSelection.cycleFinal;
"""
new="""  if(currentSelection.countsTowardEvidence===false) currentQuestion.countsTowardEvidence=false;
  currentQuestion.completionRecovery=!!currentSelection.reviewItem?.completeCycleOnSuccess;
  currentQuestion.cycleFinal=!!currentSelection.cycleFinal||currentQuestion.completionRecovery;
"""
if old not in app: raise SystemExit('currentQuestion cycleFinal anchor missing')
app=app.replace(old,new,1)

# Eight meaningful first-cycle tasks need a more honest duration estimate; no phase mechanics are shown to the child.
old="""  $('#startMetaText').textContent=locked?'ekran dışı ara':`yaklaşık ${state.profile==='grade2'?'6–8':'5–7'} dk`;
"""
new="""  const firstCycle=!!(focus&&supportsLearningCycle(focus.skill.id)&&!ss?.learningCycle?.firstCycleCompletedAt);
  $('#startMetaText').textContent=locked?'ekran dışı ara':`yaklaşık ${firstCycle?'7–10':state.profile==='grade2'?'6–8':'5–7'} dk`;
"""
if old not in app: raise SystemExit('duration meta anchor missing')
app=app.replace(old,new,1)
app_path.write_text(app,encoding='utf-8')

# Extend learning-cycle tests.
test=test_path.read_text(encoding='utf-8')
test=test.replace("  readinessSourcesFor\n} from '../engine.mjs';",
                  "  readinessSourcesFor, addClockMinutes\n} from '../engine.mjs';",1)
insert=r'''
// Clock arithmetic preserves the day period across noon and midnight.
assert.deepEqual(addClockMinutes({hour:11,minute:30,period:'ÖÖ'},60),{hour:12,minute:30,label:'12:30',period:'ÖS',intl:'p.m.'});
assert.deepEqual(addClockMinutes({hour:11,minute:45,period:'ÖS'},30),{hour:12,minute:15,label:'12:15',period:'ÖÖ',intl:'a.m.'});
assert.deepEqual(addClockMinutes({hour:12,minute:30,period:'ÖS'},60),{hour:1,minute:30,label:'1:30',period:'ÖS',intl:'p.m.'});

// A failed final practice does not close the learning cycle or schedule retention.
const finalFailState=defaultState();
const finalFailSS=ensureSkillState(finalFailState,'time1');
const finalFailQ=generateLearningQuestion('time1','practice','transfer',1,makeSeeded(9001),createConceptInstance('time1',1,makeSeeded(9002)));
finalFailQ.cycleFinal=true;
applyAnswer(finalFailState,finalFailQ,{correct:false,now:7000,sessionQuestionIndex:8});
assert.equal(finalFailSS.learningCycle.firstCycleCompletedAt,0);
assert.equal(finalFailState.reviewQueue.some(x=>x.stage==='next-day'),false);
const completionBridge=finalFailState.reviewQueue.find(x=>x.completeCycleOnSuccess);
assert.ok(completionBridge,'failed final practice must schedule immediate completion recovery');
assert.equal(completionBridge.dueQuestion,8);
const recoveryQ=generateLearningQuestion('time1','practice',completionBridge.representation,1,makeSeeded(9003),createConceptInstance('time1',1,makeSeeded(9004)));
recoveryQ.completionRecovery=true;
recoveryQ.cycleFinal=true;
applyAnswer(finalFailState,recoveryQ,{correct:true,now:8000,sessionQuestionIndex:9});
assert.ok(finalFailSS.learningCycle.firstCycleCompletedAt>0);
assert.ok(finalFailState.reviewQueue.some(x=>x.stage==='next-day'&&x.phase==='retrieval'));
'''
marker="assert.equal(bridgeSS.learningCycle.readinessSupportUsed,true);\n"
if marker not in test: raise SystemExit('test insertion marker missing')
test=test.replace(marker,marker+insert,1)
test_path.write_text(test,encoding='utf-8')

ui=ui_test_path.read_text(encoding='utf-8')
anchor="assert.ok(app.includes('generateLearningQuestion'))"
if anchor in ui:
    ui=ui.replace(anchor,anchor+";\nassert.ok(app.includes('dueSameSessionReview(includeFuture=false)'),'session must be able to force pending bridge work before finish');\nassert.ok(app.includes('completeCycleOnSuccess'),'completion recovery must propagate into the UI plan')",1)
else:
    ui += "\nassert.ok(app.includes('dueSameSessionReview(includeFuture=false)'));\nassert.ok(app.includes('completeCycleOnSuccess'));\n"
ui_test_path.write_text(ui,encoding='utf-8')

pkg=json.loads(package_path.read_text(encoding='utf-8'))
pkg['version']='1.3.2'
package_path.write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sw=sw_path.read_text(encoding='utf-8')
sw=re.sub(r"const CACHE='[^']+';","const CACHE='saymera-v1-3-2-completion';",sw,count=1)
sw_path.write_text(sw,encoding='utf-8')

doc=doc_path.read_text(encoding='utf-8')
section='''\n\n## v1.3.2 — Başarılı pekiştirme kapısı\n\nÖğrenme döngüsü yalnızca son pekiştirme (veya onun doğrudan düzeltme görevi) başarılı olduğunda tamamlanır. Son pekiştirme yanlışsa gecikmeli geri çağırma planlanmaz; önce aynı oturumda temsil değiştiren bir düzeltme görevi çözülür. Oturumun sonunda sırada bekleyen aynı-oturum köprüsü varsa süre dolmuş olsa bile sessizce atlanmaz.\n\nSaat referans becerisinde ÖÖ/ÖS artık 24 saatlik iç hesap üzerinden taşınır; öğlen/gece 12 sınırları doğru çevrilir.\n'''
if '## v1.3.2 — Başarılı pekiştirme kapısı' not in doc: doc+=section
doc_path.write_text(doc,encoding='utf-8')

print('v1.3.2 completion/time migration staged')
