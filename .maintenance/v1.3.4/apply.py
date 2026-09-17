from pathlib import Path
import json, re

ROOT=Path('.')
app_path=ROOT/'app.js'
ui_path=ROOT/'tests/ui-static.test.mjs'
pkg_path=ROOT/'package.json'
sw_path=ROOT/'sw.js'
doc_path=ROOT/'LEARNING_CYCLE_V1_3.md'

app=app_path.read_text(encoding='utf-8')

old="""  session={
    startedAt:Date.now(), focusSkillId:focus.skill.id, focusConcept, plan, planIndex:0,
    focusRepresentations:plan.filter(x=>x.kind==='focus').map(x=>x.representation),
    questionIndex:0, correct:0, wrong:0, hints:0, effortUsed:0, recentSkillIds:[], newStable:0, bridgeAdds:0, learningEvents:[]
  };"""
new="""  session={
    startedAt:Date.now(), focusSkillId:focus.skill.id, focusConcept, plan, planIndex:0,
    focusRepresentations:plan.filter(x=>x.kind==='focus').map(x=>x.representation),
    requiresLearningCompletion:!!(supportsLearningCycle(focus.skill.id)&&!focus.state.learningCycle?.firstCycleCompletedAt),
    questionIndex:0, correct:0, wrong:0, hints:0, effortUsed:0, recentSkillIds:[], newStable:0, bridgeAdds:0, learningEvents:[]
  };"""
if old not in app: raise SystemExit('session init anchor missing')
app=app.replace(old,new,1)

old="""function maybeInjectBridgeReview(force=false){
  if(!session || session.bridgeAdds>=4) return;
  const review=dueSameSessionReview(force); if(!review) return;
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
}"""
new="""function maybeInjectBridgeReview(force=false){
  if(!session) return;
  const review=dueSameSessionReview(force); if(!review) return;
  const critical=review.support===true||review.completeCycleOnSuccess===true;
  // General remediation is bounded, but prerequisite support and the final
  // completion recovery are hard gates and may never be dropped by that bound.
  if(session.bridgeAdds>=4&&!critical) return;
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
    if(!critical) session.bridgeAdds++;
  }
}"""
if old not in app: raise SystemExit('bridge injector anchor missing')
app=app.replace(old,new,1)

old="""  currentQuestion.completionRecovery=!!currentSelection.reviewItem?.completeCycleOnSuccess;
  currentQuestion.cycleFinal=!!currentSelection.cycleFinal||currentQuestion.completionRecovery;"""
new="""  currentQuestion.completionRecovery=!!currentSelection.completionRecovery||!!currentSelection.reviewItem?.completeCycleOnSuccess;
  currentQuestion.cycleFinal=!!currentSelection.cycleFinal||currentQuestion.completionRecovery;"""
if old not in app: raise SystemExit('completion recovery anchor missing')
app=app.replace(old,new,1)

old="""function finishSession(){
  if(!session) return;
  const ended=session;"""
new="""function finishSession(){
  if(!session) return;

  // Hard invariant: a first learning cycle cannot be presented as completed
  // until a successful consolidation/recovery has actually closed the cycle.
  if(session.requiresLearningCompletion){
    const gateSkill=skillsFor(state.profile).find(s=>s.id===session.focusSkillId);
    const gateState=gateSkill?ensureSkillState(state,gateSkill.id):null;
    if(gateState&&!gateState.learningCycle?.firstCycleCompletedAt){
      maybeInjectBridgeReview(true);
      if(session.planIndex<session.plan.length){ loadPlanItem(); return; }
      const bridgeMap={build:'see',see:'build',symbol:'see',explain:'see',transfer:'build'};
      session.plan.splice(session.planIndex,0,{
        skillId:session.focusSkillId,
        representation:bridgeMap[currentQuestion?.representation]||'see',
        phase:'practice',
        reviewItem:null,
        kind:'bridge',
        conceptScope:'fresh',
        completionRecovery:true
      });
      loadPlanItem();
      return;
    }
  }

  const ended=session;"""
if old not in app: raise SystemExit('finishSession anchor missing')
app=app.replace(old,new,1)
app_path.write_text(app,encoding='utf-8')

ui=ui_path.read_text(encoding='utf-8')
extra="""
assert.ok(app.includes('requiresLearningCompletion'),'first-cycle session completion gate missing');
assert.ok(app.includes("const critical=review.support===true||review.completeCycleOnSuccess===true"),'critical recovery must bypass general bridge cap');
assert.ok(app.includes('if(session.bridgeAdds>=4&&!critical) return;'),'general bridge cap must not block critical recovery');
assert.ok(app.includes('completionRecovery:true'),'finishSession fallback recovery missing');
assert.ok(app.includes('if(gateState&&!gateState.learningCycle?.firstCycleCompletedAt)'),'finishSession must refuse false completion');
"""
if "first-cycle session completion gate missing" not in ui:
    ui += extra
ui_path.write_text(ui,encoding='utf-8')

pkg=json.loads(pkg_path.read_text(encoding='utf-8'))
pkg['version']='1.3.4'
pkg_path.write_text(json.dumps(pkg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

sw=sw_path.read_text(encoding='utf-8')
sw=re.sub(r"const CACHE='[^']+';","const CACHE='saymera-v1-3-4-completion-gate';",sw,count=1)
sw_path.write_text(sw,encoding='utf-8')

if doc_path.exists():
    doc=doc_path.read_text(encoding='utf-8')
    note="""

## v1.3.4 — Completion gate invariant

A first-cycle session may not enter the completed/rest state while `firstCycleCompletedAt` is still empty. Critical prerequisite support and final completion recovery bypass the general same-session bridge cap. If queue state is unexpectedly missing, `finishSession()` creates a fresh recovery task rather than falsely marking the session complete. The learner can always close the session manually; closing is not recorded as mastery.
"""
    if 'v1.3.4 — Completion gate invariant' not in doc:
        doc += note
    doc_path.write_text(doc,encoding='utf-8')

print('v1.3.4 completion gate fix staged')
