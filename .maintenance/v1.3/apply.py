from pathlib import Path
import re, json

ROOT=Path('.')

def sub_once(text, pattern, repl, label, flags=re.S):
    new, n = re.subn(pattern, repl, text, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f"{label}: expected 1 replacement, got {n}")
    return new

engine_path=ROOT/'engine.mjs'
engine=engine_path.read_text(encoding='utf-8')

# 1) Learning-cycle public model and managed-skill gate.
anchor = """export const REPRESENTATION_META = {
  build: { label: 'Kur', icon: '◫', short: 'Nesneyle kur' },
  see: { label: 'Gör', icon: '◉', short: 'Görselde gör' },
  symbol: { label: 'Yaz', icon: '＝', short: 'Sembolleştir' },
  explain: { label: 'Anlat', icon: '◌', short: 'Düşünceni seç' },
  transfer: { label: 'Taşı', icon: '↗', short: 'Yeni durumda kullan' },
};
"""
addition = anchor + """
export const LEARNING_PHASES = ['readiness','model','representation','symbol','reasoning','context','practice','retrieval'];
export const LEARNING_PHASE_META = {
  readiness: { label:'Ön bilgiyi yokla', representation:'see' },
  model: { label:'Nesne/modelle çalış', representation:'build' },
  representation: { label:'Farklı temsilini gör', representation:'see' },
  symbol: { label:'Sembolleştir', representation:'symbol' },
  reasoning: { label:'Nedenini düşün', representation:'explain' },
  context: { label:'Gündelik durumda kullan', representation:'transfer' },
  practice: { label:'Farklı örneklerle pekiştir', representation:null },
  retrieval: { label:'Daha sonra geri çağır', representation:null },
};

const LEARNING_CYCLE_READY_SKILLS = new Set([
  'number20','numberBonds10','make10','add20','addMany1','sub20','equality','word1',
  'number100','compareOrder100','ordinal10','numberPattern1','addSub100','multiply40',
  'divide20g1','money1','lengthCompare1','lengthMeasure1','time1','shapes1','shapePattern1','data1'
]);
export function supportsLearningCycle(skillId){ return LEARNING_CYCLE_READY_SKILLS.has(skillId); }
"""
if anchor not in engine:
    raise SystemExit("representation meta anchor not found")
engine = engine.replace(anchor, addition, 1)

# 2) Skill-state learning cycle state + migration.
old_state = """function defaultEvidence(){
  return Object.fromEntries(REPRESENTATIONS.map(r => [r,{score:0, attempts:0, correct:0, lastSeen:0}]));
}
export function makeSkillState(){
  return { evidence: defaultEvidence(), totalAttempts:0, totalCorrect:0, difficulty:1, lastDifficultyChangeAttempt:0, delayedSuccesses:0, delayedAttempts:0, lastSeen:0, stable:false };
}
"""
new_state = """function defaultEvidence(){
  return Object.fromEntries(REPRESENTATIONS.map(r => [r,{score:0, attempts:0, correct:0, lastSeen:0}]));
}
function defaultLearningCycle(){
  return {
    version:1,
    status:'new',
    firstCycleCompletedAt:0,
    lastCycleAt:0,
    retrievalDueAt:0,
    retrievalAttempts:0,
    retrievalSuccesses:0,
    practiceAttempts:0,
    practiceCorrect:0,
    readinessNeedsSupport:false,
    phases:Object.fromEntries(LEARNING_PHASES.map(p=>[p,{attempts:0,correct:0,lastSeen:0}]))
  };
}
export function ensureLearningCycleState(skillState){
  skillState.learningCycle ||= defaultLearningCycle();
  const lc=skillState.learningCycle;
  lc.version ||= 1;
  lc.status ||= 'new';
  lc.firstCycleCompletedAt ||= 0;
  lc.lastCycleAt ||= 0;
  lc.retrievalDueAt ||= 0;
  lc.retrievalAttempts ||= 0;
  lc.retrievalSuccesses ||= 0;
  lc.practiceAttempts ||= 0;
  lc.practiceCorrect ||= 0;
  lc.readinessNeedsSupport=!!lc.readinessNeedsSupport;
  lc.phases ||= {};
  for(const p of LEARNING_PHASES) lc.phases[p] ||= {attempts:0,correct:0,lastSeen:0};
  return lc;
}
export function learningCycleStatus(skillState, now=Date.now()){
  const lc=ensureLearningCycleState(skillState);
  if(skillState.stable && lc.retrievalSuccesses>=1) return 'secure';
  if(lc.firstCycleCompletedAt && lc.retrievalDueAt && lc.retrievalDueAt<=now) return 'retrieval-due';
  if(lc.firstCycleCompletedAt) return 'consolidating';
  if(LEARNING_PHASES.some(p=>(lc.phases[p]?.attempts||0)>0)) return 'learning';
  return 'new';
}
export function makeSkillState(){
  return { evidence: defaultEvidence(), learningCycle:defaultLearningCycle(), totalAttempts:0, totalCorrect:0, difficulty:1, lastDifficultyChangeAttempt:0, delayedSuccesses:0, delayedAttempts:0, lastSeen:0, stable:false };
}
"""
if old_state not in engine:
    raise SystemExit("skill state anchor not found")
engine=engine.replace(old_state,new_state,1)

old_ensure = """export function ensureSkillState(state, skillId){
  if(!state.skills[skillId]) state.skills[skillId] = makeSkillState();
  const ss = state.skills[skillId];
  ss.evidence ||= defaultEvidence();
  for(const r of REPRESENTATIONS){ ss.evidence[r] ||= {score:0,attempts:0,correct:0,lastSeen:0}; }
  return ss;
}
"""
new_ensure = """export function ensureSkillState(state, skillId){
  if(!state.skills[skillId]) state.skills[skillId] = makeSkillState();
  const ss = state.skills[skillId];
  ss.evidence ||= defaultEvidence();
  for(const r of REPRESENTATIONS){ ss.evidence[r] ||= {score:0,attempts:0,correct:0,lastSeen:0}; }
  ensureLearningCycleState(ss);
  return ss;
}
"""
if old_ensure not in engine:
    raise SystemExit("ensureSkillState anchor not found")
engine=engine.replace(old_ensure,new_ensure,1)

# 3) Insert cycle planner + phase-aware question generator before selectNextSkill.
planner = r"""
export function buildLearningCyclePlan(skillState){
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

export function generateLearningQuestion(skillId,phase,representation,difficulty=1,rng=Math.random,conceptInstance=null){
  let q;
  if(phase==='readiness') q=generateReadinessQuestion(skillId,difficulty,rng);
  else q=generateQuestion(skillId,representation,difficulty,rng,conceptInstance);
  q.learningPhase=phase||null;
  if(phase==='readiness') q.countsTowardEvidence=false;
  if(phase==='retrieval') q.retentionProbe=true;
  return q;
}

"""
marker = "export function selectNextSkill(state, session, now=Date.now(), rng=Math.random){"
if marker not in engine:
    raise SystemExit("selectNextSkill marker not found")
engine=engine.replace(marker,planner+marker,1)

# 4) Replace applyAnswer with phase-aware evidence + scheduling.
apply_repl = r"""export function applyAnswer(state, question, {correct, usedHint=false, isDelayedReview=false, now=Date.now(), sessionQuestionIndex=0}){
  const ss=ensureSkillState(state,question.skillId);
  const lc=ensureLearningCycleState(ss);
  const phase=question.learningPhase||null;
  const countsTowardEvidence=question.countsTowardEvidence!==false;
  const ev=countsTowardEvidence?ss.evidence[question.representation]:null;

  if(phase && lc.phases[phase]){
    const pe=lc.phases[phase];
    pe.attempts=(pe.attempts||0)+1;
    if(correct) pe.correct=(pe.correct||0)+1;
    pe.lastSeen=now;
    if(phase==='readiness') lc.readinessNeedsSupport=!correct;
    if(phase==='practice'){
      lc.practiceAttempts=(lc.practiceAttempts||0)+1;
      if(correct) lc.practiceCorrect=(lc.practiceCorrect||0)+1;
    }
    if(phase==='retrieval'){
      lc.retrievalAttempts=(lc.retrievalAttempts||0)+1;
      if(correct) lc.retrievalSuccesses=(lc.retrievalSuccesses||0)+1;
      lc.retrievalDueAt=0;
    }
  }

  if(countsTowardEvidence){
    const gain=correct ? (usedHint?.08:.14) : -.10;
    ev.score=clamp((ev.score || 0)+gain,0,1);
    ev.attempts=(ev.attempts||0)+1;
    if(correct) ev.correct=(ev.correct||0)+1;
    ev.lastSeen=now;
    ss.totalAttempts=(ss.totalAttempts||0)+1;
    if(correct) ss.totalCorrect=(ss.totalCorrect||0)+1;
    ss.lastSeen=now;
    if(isDelayedReview){
      ss.delayedAttempts=(ss.delayedAttempts||0)+1;
      if(correct) ss.delayedSuccesses=(ss.delayedSuccesses||0)+1;
    }

    // Difficulty changes slowly. A young learner should not jump levels after a short lucky streak.
    const skillHistory=state.history.filter(h=>h.skillId===question.skillId && h.countsTowardEvidence!==false).slice(-5);
    const window=[...skillHistory.map(h=>h.correct), correct];
    const recentAccuracy=window.filter(Boolean).length / window.length;
    const sinceChange=ss.totalAttempts-(ss.lastDifficultyChangeAttempt||0);
    if(window.length>=6 && sinceChange>=5){
      if(recentAccuracy>=.83 && (ss.difficulty||1)<4){ ss.difficulty+=1; ss.lastDifficultyChangeAttempt=ss.totalAttempts; }
      else if(recentAccuracy<=.45 && (ss.difficulty||1)>1){ ss.difficulty-=1; ss.lastDifficultyChangeAttempt=ss.totalAttempts; }
    }
    ss.stable=computeStable(ss);
  }

  if(phase){
    if(question.cycleFinal){
      lc.firstCycleCompletedAt ||= now;
      lc.lastCycleAt=now;
      lc.status='consolidating';
      lc.retrievalDueAt=now+1000*60*60*20;
    } else if(!lc.firstCycleCompletedAt){
      lc.status='learning';
    }
    if(phase==='retrieval'){
      lc.status=(ss.stable && correct)?'secure':'consolidating';
    }
  }

  state.totals.attempts=(state.totals.attempts||0)+1;
  if(correct) state.totals.correct=(state.totals.correct||0)+1;
  state.history.push({
    at:now,skillId:question.skillId,representation:question.representation,
    learningPhase:phase,taskKind:question.taskKind||null,conceptKey:question.conceptKey||null,
    responseKind:question.response?.kind||null,correct,usedHint,delayed:isDelayedReview,
    countsTowardEvidence
  });
  if(state.history.length>250) state.history=state.history.slice(-250);

  if(!correct){
    const bridgeMap={build:'see',see:'build',symbol:'see',explain:'see',transfer:'build'};
    const readiness=phase==='readiness';
    const alternative=readiness?'see':(bridgeMap[question.representation]||'see');
    state.reviewQueue.push({
      id:`review:${question.id}`,
      skillId:question.skillId,
      representation:alternative,
      phase:readiness?'readiness':'practice',
      dueQuestion:sessionQuestionIndex+(readiness?1:3),
      dueAt:now+(readiness?1000*20:1000*60*3),
      stage:'same-session'
    });
  }

  if(question.cycleFinal){
    const existing=state.reviewQueue.some(x=>x.skillId===question.skillId && x.stage==='next-day');
    if(!existing) state.reviewQueue.push({
      id:`retention:${question.skillId}:${now}`,
      skillId:question.skillId,
      representation:question.representation==='symbol'?'transfer':'symbol',
      phase:'retrieval',
      dueAt:lc.retrievalDueAt,
      stage:'next-day'
    });
  } else if(!phase && countsTowardEvidence && correct && ev.attempts>=2 && ev.score>=.55){
    // Legacy skills keep the old retention rule until they are migrated to the learning-cycle contract.
    const existing=state.reviewQueue.some(x=>x.skillId===question.skillId && x.stage==='next-day');
    if(!existing) state.reviewQueue.push({
      id:`retention:${question.skillId}:${now}`,
      skillId:question.skillId,
      representation:question.representation==='symbol'?'transfer':'symbol',
      dueAt:now+1000*60*60*20,
      stage:'next-day'
    });
  }
  return ss;
}
"""
engine = sub_once(engine, r"export function applyAnswer\(state, question, \{correct, usedHint=false, isDelayedReview=false, now=Date\.now\(\), sessionQuestionIndex=0\}\)\{[\s\S]*?\n\}\n\n(?=export function consumeReview)", apply_repl+"\n\n", "applyAnswer")

engine_path.write_text(engine,encoding='utf-8')

# 5) app.js: import cycle functions, hide internal mechanics from child, cycle-aware planner.
app_path=ROOT/'app.js'
app=app_path.read_text(encoding='utf-8')
old_import="""  REPRESENTATIONS, REPRESENTATION_META, PROFILE_META, skillsFor, defaultState, ensureSkillState,
  masteryPercent, evidenceCoverage, generateQuestion, createConceptInstance, applyAnswer, consumeReview,
  profileSummary, representationGap, prerequisitesReady
"""
new_import="""  REPRESENTATIONS, REPRESENTATION_META, PROFILE_META, skillsFor, defaultState, ensureSkillState,
  masteryPercent, evidenceCoverage, generateQuestion, generateLearningQuestion, createConceptInstance, applyAnswer, consumeReview,
  profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan
"""
if old_import not in app:
    raise SystemExit("app import anchor not found")
app=app.replace(old_import,new_import,1)

# Simplify focus card: no internal five-window labels/count.
app=app.replace(
"""    <div class="prism-visual" aria-label="Bugünkü görev adımları">
      <div class="prism-ring"></div>
      ${REPRESENTATIONS.map(r=>{ const ev=ss.evidence[r]; return `<div class="facet ${ev.score>=.72?'done':''}"><div><b>${REPRESENTATION_META[r].icon}</b><small>${REPRESENTATION_META[r].label}</small></div></div>`; }).join('')}
      <div class="prism-core"><span><strong>5</strong><small>adım</small></span></div>
    </div>
""",
"""    <div class="prism-visual" aria-label="Bugünkü konu hazır">
      <div class="prism-ring"></div>
      <div class="prism-core"><span><strong>▶</strong><small>hazır</small></span></div>
    </div>
""",1)

# lensGrid may not exist after index cleanup.
app=app.replace(
"""  $('#lensGrid').innerHTML=REPRESENTATIONS.map((r,i)=>`<article class="lens-card"><span class="lens-step">0${i+1}</span><div class="lens-icon">${REPRESENTATION_META[r].icon}</div><div><b>${REPRESENTATION_META[r].label}</b><p>${repDescriptions[r]}</p></div></article>`).join('');
""",
"""  if($('#lensGrid')) $('#lensGrid').innerHTML='';
""",1)

# Hide representation evidence strip from child topic previews.
app=app.replace(
"""      <div class="facet-strip">${REPRESENTATIONS.map(r=>`<i class="${ss.evidence[r].score>=.72?'strong':ss.evidence[r].attempts?'seen':''}"></i>`).join('')}</div>
""","",1)

build_plan_repl=r"""function buildSessionPlan(focus){
  const plan=[];
  const due=dueReviewItems()[0];
  if(due){
    const s=skillsFor(state.profile).find(x=>x.id===due.skillId);
    if(s) plan.push({
      skillId:s.id,
      representation:due.representation,
      phase:due.phase||'retrieval',
      reviewItem:due,
      kind:'retention',
      conceptScope:'fresh'
    });
  }

  if(supportsLearningCycle(focus.skill.id)){
    buildLearningCyclePlan(focus.state).forEach(item=>plan.push({
      skillId:focus.skill.id,
      reviewItem:null,
      ...item
    }));
    return plan;
  }

  const reps=focusRepresentations(focus.state);
  reps.forEach(rep=>plan.push({skillId:focus.skill.id,representation:rep,reviewItem:null,kind:'focus'}));
  return plan;
}
"""
app=sub_once(app,r"function buildSessionPlan\(focus\)\{[\s\S]*?\n\}\n(?=function startSession)",build_plan_repl,"buildSessionPlan")

bridge_repl=r"""function maybeInjectBridgeReview(){
  if(!session || session.bridgeAdds>=2) return;
  const review=dueSameSessionReview(); if(!review) return;
  const skill=skillsFor(state.profile).find(s=>s.id===review.skillId); if(!skill) return;
  const already=session.plan.slice(session.planIndex).some(x=>x.reviewItem?.id===review.id);
  if(!already){
    session.plan.splice(session.planIndex,0,{
      skillId:skill.id,
      representation:review.representation||'see',
      phase:review.phase||null,
      reviewItem:review,
      kind:'bridge',
      conceptScope:'fresh',
      countsTowardEvidence:review.phase==='readiness'?false:undefined
    });
    session.bridgeAdds++;
  }
}
"""
app=sub_once(app,r"function maybeInjectBridgeReview\(\)\{[\s\S]*?\n\}\n(?=function loadPlanItem)",bridge_repl,"maybeInjectBridgeReview")

load_repl=r"""function loadPlanItem(){
  if(!session) return;
  maybeInjectBridgeReview();
  if(session.planIndex>=session.plan.length){ finishSession(); return; }
  currentSelection=session.plan[session.planIndex];
  const skill=skillsFor(state.profile).find(s=>s.id===currentSelection.skillId);
  if(!skill){ session.planIndex++; loadPlanItem(); return; }
  const ss=ensureSkillState(state,skill.id);
  currentSelection.skill=skill;
  const fresh=currentSelection.conceptScope==='fresh';
  const reuseFocusConcept=skill.id===session.focusSkillId && !fresh && (currentSelection.kind==='focus'||currentSelection.kind==='bridge');
  const concept=reuseFocusConcept?session.focusConcept:createConceptInstance(skill.id,ss.difficulty||1,Math.random);

  if(currentSelection.phase && supportsLearningCycle(skill.id)){
    currentQuestion=generateLearningQuestion(
      skill.id,currentSelection.phase,currentSelection.representation,
      ss.difficulty||1,Math.random,concept
    );
  } else {
    currentQuestion=generateQuestion(skill.id,currentSelection.representation,ss.difficulty||1,Math.random,concept);
    if(currentSelection.phase) currentQuestion.learningPhase=currentSelection.phase;
  }
  if(currentSelection.countsTowardEvidence===false) currentQuestion.countsTowardEvidence=false;
  currentQuestion.cycleFinal=!!currentSelection.cycleFinal;

  session.questionIndex++;
  session.recentSkillIds.push(skill.id);
  answered=false; usedHint=false;
  renderQuestion();
}
"""
app=sub_once(app,r"function loadPlanItem\(\)\{[\s\S]*?\n\}\n(?=function renderQuestion)",load_repl,"loadPlanItem")

# Child header shows curriculum domain, never internal phase/representation.
app=app.replace("  $('#practiceLens').textContent=REPRESENTATION_META[rep].label.toUpperCase();",
                "  $('#practiceLens').textContent=s.family.toUpperCase();",1)

app_path.write_text(app,encoding='utf-8')

# 6) index.html: remove child-facing internal mechanism section and explain cycle only in parent area.
index_path=ROOT/'index.html'
index=index_path.read_text(encoding='utf-8')
index=sub_once(index,
    r'\n\s*<section class="today-lab" aria-labelledby="labTitle">[\s\S]*?</section>\n',
    "\n",
    "remove child today-lab")
old_method="""            <div class="method-list">
              <div><b>01</b><p><strong>Tek kavramı derinleştirir.</strong> Oturumun çoğu aynı fikri farklı temsillerde işler.</p></div>
              <div><b>02</b><p><strong>Yanlışı teşhis sinyali sayar.</strong> Aynı soruyu tekrarlatmak yerine temsili değiştirir.</p></div>
              <div><b>03</b><p><strong>Hatırlamayı ayrı kanıt sayar.</strong> Şimdi yapabilmek ile sonra hatırlamak aynı şey değildir.</p></div>
              <div><b>04</b><p><strong>İçeriği geniş tutar.</strong> Sayı ve işlemlerin yanında geometri, ölçme, örüntü ve veri de yer alır.</p></div>
"""
new_method="""            <div class="method-list">
              <div><b>01</b><p><strong>Ön bilgiyi yoklar.</strong> Yeni kavrama geçmeden önce gerekli temel bağlantıları kısa bir görevle kontrol eder.</p></div>
              <div><b>02</b><p><strong>Anlamı farklı biçimlerde kurar.</strong> Nesne/model → temsil → sembol → gerekçe → gündelik bağlam sırasını kullanır.</p></div>
              <div><b>03</b><p><strong>Pekiştirmeyi kopya sorularla yapmaz.</strong> Aynı ilişkiyi yeni örnek ve görev türlerinde yeniden kullandırır.</p></div>
              <div><b>04</b><p><strong>Hatırlamayı ayrı kanıt sayar.</strong> Öğrenme döngüsü daha sonra gelen kısa geri çağırmayla tamamlanır.</p></div>
"""
if old_method not in index:
    raise SystemExit("parent method anchor not found")
index=index.replace(old_method,new_method,1)
index_path.write_text(index,encoding='utf-8')

# 7) tests: remove child lensGrid requirement and add cycle test.
ui_path=ROOT/'tests/ui-static.test.mjs'
ui=ui_path.read_text(encoding='utf-8')
ui=ui.replace("'focusCard','lensGrid','homeInsightGrid'","'focusCard','homeInsightGrid'",1)
ui_path.write_text(ui,encoding='utf-8')

cycle_test = r"""import assert from 'node:assert/strict';
import {
  LEARNING_PHASES, defaultState, ensureSkillState, supportsLearningCycle,
  buildLearningCyclePlan, createConceptInstance, generateLearningQuestion, applyAnswer
} from '../engine.mjs';

const seeded=(()=>{let x=246813579;return ()=>((x=(x*1664525+1013904223)>>>0)/2**32);})();

assert.deepEqual(LEARNING_PHASES,[
  'readiness','model','representation','symbol','reasoning','context','practice','retrieval'
]);
assert.equal(supportsLearningCycle('time1'),true);
assert.equal(supportsLearningCycle('time2'),false,'legacy P2 time stays outside the new contract until migrated');

const state=defaultState();
const ss=ensureSkillState(state,'time1');
const plan=buildLearningCyclePlan(ss);
assert.equal(plan.length,8);
assert.deepEqual(plan.map(x=>x.phase),[
  'readiness','model','representation','symbol','reasoning','context','practice','practice'
]);
assert.equal(plan[0].countsTowardEvidence,false);
assert.equal(plan.at(-1).cycleFinal,true);

const readiness=generateLearningQuestion('time1','readiness','see',1,seeded,null);
assert.equal(readiness.learningPhase,'readiness');
assert.equal(readiness.countsTowardEvidence,false);
applyAnswer(state,readiness,{correct:true,now:1000,sessionQuestionIndex:1});
assert.equal(ss.totalAttempts,0,'readiness must not inflate target-skill mastery evidence');
assert.equal(ss.learningCycle.phases.readiness.attempts,1);

let now=2000;
for(const item of plan.slice(1)){
  const concept=createConceptInstance('time1',1,seeded);
  const q=generateLearningQuestion('time1',item.phase,item.representation,1,seeded,concept);
  q.cycleFinal=!!item.cycleFinal;
  applyAnswer(state,q,{correct:true,now:now+=1000,sessionQuestionIndex:2});
}
assert.ok(ss.learningCycle.firstCycleCompletedAt>0);
assert.equal(ss.learningCycle.status,'consolidating');
const retention=state.reviewQueue.find(x=>x.skillId==='time1'&&x.stage==='next-day');
assert.ok(retention,'full learning cycle must schedule delayed retrieval');
assert.equal(retention.phase,'retrieval');
assert.ok(retention.dueAt>ss.learningCycle.firstCycleCompletedAt);

const rq=generateLearningQuestion('time1','retrieval',retention.representation,1,seeded,createConceptInstance('time1',1,seeded));
applyAnswer(state,rq,{correct:true,isDelayedReview:true,now:retention.dueAt+1,sessionQuestionIndex:1});
assert.equal(ss.learningCycle.retrievalAttempts,1);
assert.equal(ss.learningCycle.retrievalSuccesses,1);
assert.equal(ss.delayedSuccesses,1);

const reinforcement=buildLearningCyclePlan(ss);
assert.equal(reinforcement.length,4);
assert.ok(reinforcement.every(x=>x.phase==='practice'));
assert.equal(reinforcement.at(-1).cycleFinal,true);

console.log('learning-cycle tests: PASS');
"""
(ROOT/'tests/learning-cycle.test.mjs').write_text(cycle_test,encoding='utf-8')

# 8) package + cache bump
package_path=ROOT/'package.json'
pkg=json.loads(package_path.read_text(encoding='utf-8'))
pkg['version']='1.3.0'
pkg['scripts']['test']="node build-standalone.mjs && node tests/engine.test.mjs && node tests/learning-cycle.test.mjs && node tests/ui-static.test.mjs"
package_path.write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+"\n",encoding='utf-8')

sw_path=ROOT/'sw.js'
sw=sw_path.read_text(encoding='utf-8')
sw=re.sub(r"const CACHE='[^']+';", "const CACHE='saymera-v1-3-learning-cycle';", sw, count=1)
sw_path.write_text(sw,encoding='utf-8')

# 9) Architecture note.
doc=r"""# SAYMERA v1.3 — Learning Cycle

SAYMERA'nın temel öğrenme döngüsü:

**Ön bilgiyi yokla → nesne/modelle çalış → farklı temsilini gör → sembolleştir → nedenini düşün → gündelik durumda kullan → farklı örneklerle pekiştir → daha sonra geri çağır.**

Bu sekiz adım çocuk arayüzünde süreç etiketi olarak gösterilmez. Çocuk yalnız görevi görür; döngü motor ve ebeveyn/eğitmen alanında yaşar.

## Motor sözleşmesi

- `readiness`: hedef kavram puanını yükseltmeyen kısa ön-bilgi kontrolü.
- `model`: somut/manipülatif görev.
- `representation`: görsel ayırt etme/temsil okuma.
- `symbol`: matematiksel sembol ve sayı dili.
- `reasoning`: gerekçe/strateji.
- `context`: gündelik veya yeni bağlama transfer.
- `practice`: yeni örneklerle karışık pekiştirme; kopya soru zorunlu değildir.
- `retrieval`: ilk döngüden yaklaşık 20 saat sonra kısa geri çağırma.

İlk tam döngü şu an 8 görevdir: 1 readiness + 5 çekirdek görev + 2 pekiştirme. Yanlışlarda aynı-oturum köprü görevi eklenebilir. Sonraki pekiştirme oturumları dört zayıf/önemli temsil görevine daralır. Sabit sekiz soru bir pedagojik hedef değildir; sekiz, ilk döngünün mevcut ürün sözleşmesidir.

## Kapsam

v1.3'te sözleşme P1 referans kalitesine taşınmış 22 beceride aktiftir. Legacy P2 becerileri yanlış bir “sekiz aşama varmış” izlenimi yaratmamak için eski planlayıcıda kalır ve tek tek migrate edilecektir.

`time1` ilk özel readiness referansıdır: 5'er ritmik sayma veya tam saat okuma ön bilgisi hedef beceri puanını şişirmeden kontrol edilir.

## Çocuk / ebeveyn ayrımı

Çocuk ekranında Kur–Gör–Yaz–Anlat–Taşı veya sekiz aşamalı motorun açıklaması gösterilmez. Çocuk konu, soru, ipucu, geri bildirim ve mola görür. Ayrıntılı pedagojik mantık ebeveyn/eğitmen alanındadır.
"""
(ROOT/'LEARNING_CYCLE_V1_3.md').write_text(doc,encoding='utf-8')

print("v1.3 migration staged")
