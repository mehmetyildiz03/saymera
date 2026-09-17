import {
  REPRESENTATIONS, REPRESENTATION_META, PROFILE_META, skillsFor, defaultState, ensureSkillState,
  masteryPercent, evidenceCoverage, generateQuestion, generateLearningQuestion, createConceptInstance, applyAnswer, consumeReview,
  profileSummary, representationGap, prerequisitesReady, supportsLearningCycle, buildLearningCyclePlan
} from './engine.mjs';

const STORAGE_KEY='saymera.math.v2';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

const repDescriptions={
  build:'Bir model kur.',
  see:'Doğru olanı bul.',
  symbol:'Sayı ve işaretleri kullan.',
  explain:'Nedenini seç.',
  transfer:'Yeni soruda kullan.'
};
const repReasons={
  build:'Somut yapı henüz yeterince görünür değil.',
  see:'Görsel temsil bağlantısı güçlendirilebilir.',
  symbol:'Sembol ile anlam arasındaki bağ güçlendirilebilir.',
  explain:'Doğru işlemin nedenini açıklama kanıtı eksik.',
  transfer:'Kavramı yeni bir duruma taşıma kanıtı eksik.'
};
const accentTint={amber:'#fff2c9',blue:'#e6f2fa',violet:'#eee9fa',green:'#e6f4ef',rose:'#fbe9e5',teal:'#e2f3ef',navy:'#e6edf1'};
const accentRing={amber:'#d9a12f',blue:'#4e8cc8',violet:'#8270ca',green:'#2f9987',rose:'#df7564',teal:'#2f9987',navy:'#19364b'};

let state=loadState();
let activeScreen='home';
let activeDomain='Tümü';
let session=null;
let currentQuestion=null;
let currentSelection=null;
let answered=false;
let usedHint=false;
let cooldownTimer=null;
let holdTimer=null;
let holdStartedAt=0;
let toastTimer=null;
let selectedOnboardingProfile=state.profile;

init();

function init(){
  bindNavigation();
  bindControls();
  normalizeState();
  renderAll();
  applyMotionSetting();
  registerSW();
  if(!state.onboarded) openOnboarding();
  if(state.cooldownUntil && state.cooldownUntil>Date.now()) showCooldown(false);
}

function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed=JSON.parse(raw);
    const base=defaultState();
    return {
      ...base,...parsed,
      settings:{...base.settings,...(parsed.settings||{})},
      totals:{...base.totals,...(parsed.totals||{})},
      skills:parsed.skills||{}, reviewQueue:parsed.reviewQueue||[], history:parsed.history||[], sessions:parsed.sessions||[]
    };
  }catch(err){ console.warn('SAYMERA state reset',err); return defaultState(); }
}
function normalizeState(){
  if(!PROFILE_META[state.profile]) state.profile='grade1';
  state.version=2;
  state.settings ||= defaultState().settings;
  state.reviewQueue ||= [];
  state.history ||= [];
  state.sessions ||= [];
  state.totals ||= defaultState().totals;
  skillsFor(state.profile).forEach(s=>ensureSkillState(state,s.id));
  saveState();
}
function saveState(){ try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }catch(err){ console.warn('SAYMERA save failed',err); } }
function showToast(message){
  const node=$('#toast'); if(!node) return;
  node.textContent=message; node.classList.add('show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove('show'),2200);
}

function bindNavigation(){
  $$('[data-nav]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.nav)));
  $('#profileChip').addEventListener('click',()=>openOnboarding(true));
  $('#bottomStart').addEventListener('click',startSession);
}
function navigate(name){
  const target=name==='map'?'atlas':name;
  activeScreen=target;
  $$('.screen').forEach(x=>x.classList.remove('active'));
  $(`#${target}Screen`)?.classList.add('active');
  $$('.bottom-nav [data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===target));
  if(target==='parent') renderParent();
  if(target==='atlas') renderAtlas();
  window.scrollTo({top:0,behavior:state.settings.calmMotion?'auto':'smooth'});
}

function bindControls(){
  $('#startSessionButton').addEventListener('click',startSession);
  $('#closePractice').addEventListener('click',()=>closePractice(true));
  $('#speakButton').addEventListener('click',speakCurrent);
  $('#onboardingContinue').addEventListener('click',completeOnboarding);
  $$('#onboardingLevels [data-profile]').forEach(btn=>btn.addEventListener('click',()=>selectOnboardingLevel(btn.dataset.profile)));
  $('#onboardingOverlay').addEventListener('click',e=>{ if(e.target===e.currentTarget && state.onboarded) closeOnboarding(); });
  $('#restHomeButton').addEventListener('click',()=>{ hideCooldown(); navigate('home'); });
  $('#parentSkipCooldown').addEventListener('click',()=>{ state.cooldownUntil=0; saveState(); hideCooldown(); renderAll(); showToast('Mola ebeveyn tarafından sonlandırıldı'); });
  $('#saveSettingsButton').addEventListener('click',saveSettingsFromUI);
  $('#resetButton').addEventListener('click',resetProgress);

  const adult=$('#adultButton');
  const beginHold=e=>{
    e.preventDefault(); holdStartedAt=Date.now(); adult.classList.add('holding');
    holdTimer=setTimeout(()=>{ adult.classList.remove('holding'); navigate('parent'); showToast('Ebeveyn alanı açıldı'); },1250);
  };
  const endHold=()=>{
    clearTimeout(holdTimer); adult.classList.remove('holding');
    if(Date.now()-holdStartedAt<1150) showToast('Ebeveyn alanı için biraz basılı tut');
  };
  adult.addEventListener('pointerdown',beginHold);
  adult.addEventListener('pointerup',endHold);
  adult.addEventListener('pointercancel',endHold);
  adult.addEventListener('pointerleave',()=>{ clearTimeout(holdTimer); adult.classList.remove('holding'); });
  adult.addEventListener('contextmenu',e=>e.preventDefault());
}

function openOnboarding(asSelector=false){
  selectedOnboardingProfile=state.profile;
  selectOnboardingLevel(selectedOnboardingProfile,false);
  const overlay=$('#onboardingOverlay');
  overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  const title=$('#onboardingTitle');
  if(asSelector && state.onboarded) title.textContent='Başlangıç içerik haritasını değiştir.';
  else title.textContent='Önce doğru başlangıç noktasını seçelim.';
}
function closeOnboarding(){
  if(!state.onboarded) return;
  const overlay=$('#onboardingOverlay'); overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow='';
}
function selectOnboardingLevel(profile,announce=true){
  if(!PROFILE_META[profile]) return;
  selectedOnboardingProfile=profile;
  $$('#onboardingLevels [data-profile]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.profile===profile));
  if(announce) showToast(`${PROFILE_META[profile].label} başlangıç haritası seçildi`);
}
function completeOnboarding(){
  state.profile=selectedOnboardingProfile;
  state.onboarded=true;
  skillsFor(state.profile).forEach(s=>ensureSkillState(state,s.id));
  saveState(); closeOnboarding(); renderAll();
  showToast('Laboratuvar hazır');
}

function renderAll(){
  renderHeader(); renderHome(); renderAtlas(); renderParent();
}
function renderHeader(){
  const chip=$('#profileChip');
  chip.innerHTML=`<span class="level-dot"></span><span>${esc(PROFILE_META[state.profile].label)}</span><b>⌄</b>`;
}

function pickFocus(){
  const all=skillsFor(state.profile).map(skill=>({skill,state:ensureSkillState(state,skill.id)}));
  const ready=all.filter(x=>prerequisitesReady(state,x.skill));
  const scored=(ready.length?ready:all).map((x,index)=>{
    const mastery=masteryPercent(x.state);
    const novelty=x.state.totalAttempts===0?18:0;
    const gap=representationGap(x.state);
    const gapNeed=(1-gap.score)*22;
    const recency=x.state.lastSeen?Math.min(12,(Date.now()-x.state.lastSeen)/(1000*60*60*24)*4):12;
    return {...x,priority:(100-mastery)*.55+novelty+gapNeed+recency-index*.02};
  });
  return scored.sort((a,b)=>b.priority-a.priority)[0] || null;
}
function focusDescription(focus){
  if(!focus) return 'Bugünkü konu hazırlanıyor.';
  const ss=focus.state;
  if(!ss.totalAttempts) return 'Bu konuya ilk kez başlıyorsun. Hazırsan keşfe geç.';
  if(ss.stable) return 'Bu konuyu daha önce tamamladın. Kısa bir tekrar yapabilirsin.';
  return 'Bugün bu konuyla biraz daha çalışacağız.';
}
function renderHome(){
  const focus=pickFocus();
  const summary=profileSummary(state);
  const ss=focus?.state;
  const pct=ss?masteryPercent(ss):0;
  const gap=ss?representationGap(ss):{rep:'build',score:0};

  $('#focusCard').innerHTML=focus?`
    <div class="focus-top"><span class="focus-label">BUGÜNKÜ KONU</span></div>
    <div class="focus-copy"><h2>${esc(focus.skill.label)}</h2><p>${esc(focusDescription(focus))}</p></div>
    <div class="prism-visual" aria-label="Bugünkü konu hazır">
      <div class="prism-ring"></div>
      <div class="prism-core"><span><strong>▶</strong><small>hazır</small></span></div>
    </div>
  `:'<p>Başlangıç seviyesi seçildiğinde bugünkü konu burada görünür.</p>';

  if($('#lensGrid')) $('#lensGrid').innerHTML='';

  const due=dueReviewItems().length;
  const worked=skillsFor(state.profile).filter(s=>ensureSkillState(state,s.id).totalAttempts>0).length;
  $('#homeInsightGrid').innerHTML=`
    <article class="insight-card main"><div><span class="mini-kicker">BUGÜN</span><h3>${focus?esc(focus.skill.label):'İlk keşif'}</h3><p>${focus?'Hazırsan başlayabilirsin.':'İlk konu hazırlanacak.'}</p></div><div class="micro-ring" style="--pct:${pct}%"><b>▶</b></div></article>
    <article class="insight-card"><span class="mini-kicker">KISA TEKRAR</span><div class="insight-number">${due}<small>hazır</small></div><p>${due?'Tekrar etmek için hazır.':'Şimdilik tekrar yok.'}</p></article>
    <article class="insight-card"><span class="mini-kicker">TAMAMLANAN</span><div class="insight-number">${summary.stable}<small>/ ${summary.total}</small></div><p>${worked} konuyla çalıştın.</p></article>`;

  const preview=skillsFor(state.profile).map(skill=>({skill,ss:ensureSkillState(state,skill.id),ready:prerequisitesReady(state,skill)})).sort((a,b)=>Number(b.ready)-Number(a.ready)||masteryPercent(a.ss)-masteryPercent(b.ss)).slice(0,4);
  $('#conceptPreviewRow').innerHTML=preview.map(({skill,ss,ready})=>`
    <article class="concept-mini" style="--tint:${accentTint[skill.accent]||'#eef0ef'}">
      <span>${esc(skill.family.toUpperCase())}</span><h3>${esc(skill.label)}</h3>
      <small>${ready?(ss.stable?'Tamamlandı':ss.totalAttempts?'Devam ediyor':'Başlamadı'):'Daha sonra'}</small>
    </article>`).join('');

  const locked=state.cooldownUntil && state.cooldownUntil>Date.now();
  const main=$('#startSessionButton');
  main.disabled=!!locked;
  $('#startMainText').textContent=locked?'Mola sürüyor':'Keşfi başlat';
  const firstCycle=!!(focus&&supportsLearningCycle(focus.skill.id)&&!ss?.learningCycle?.firstCycleCompletedAt);
  $('#startMetaText').textContent=locked?'ekran dışı ara':`yaklaşık ${firstCycle?'7–10':state.profile==='grade2'?'6–8':'5–7'} dk`;
  $('#bottomStart').disabled=!!locked;
}

function renderAtlas(){
  const summary=profileSummary(state);
  const list=skillsFor(state.profile);
  const inProgress=list.filter(s=>{const ss=ensureSkillState(state,s.id); return ss.totalAttempts>0&&!ss.stable;}).length;
  const due=dueReviewItems().length;
  $('#atlasSummary').innerHTML=`
    <div class="summary-card"><span>ÇALIŞILAN</span><strong>${list.filter(s=>ensureSkillState(state,s.id).totalAttempts>0).length}</strong><p>Başladığın konu sayısı.</p></div>
    <div class="summary-card"><span>TAMAMLANAN</span><strong>${summary.stable}</strong><p>Tamamladığın konular.</p></div>
    <div class="summary-card"><span>DEVAM EDEN</span><strong>${inProgress}</strong><p>Biraz daha çalışacağın konular.</p></div>
    <div class="summary-card"><span>KISA TEKRAR</span><strong>${due}</strong><p>Tekrar için hazır olanlar.</p></div>`;

  const domains=['Tümü',...new Set(list.map(s=>s.family))];
  if(!domains.includes(activeDomain)) activeDomain='Tümü';
  $('#domainTabs').innerHTML=domains.map(d=>`<button class="domain-tab ${d===activeDomain?'active':''}" data-domain="${esc(d)}" role="tab">${esc(d)}</button>`).join('');
  $$('#domainTabs [data-domain]').forEach(btn=>btn.addEventListener('click',()=>{activeDomain=btn.dataset.domain;renderAtlas();}));

  const filtered=activeDomain==='Tümü'?list:list.filter(s=>s.family===activeDomain);
  $('#skillMap').innerHTML=filtered.map(skill=>{
    const ss=ensureSkillState(state,skill.id), pct=masteryPercent(ss), ready=prerequisitesReady(state,skill);
    const status=!ready?'Daha sonra':ss.stable?'Tamamlandı':ss.totalAttempts?'Devam ediyor':'Başlamadı';
    const mark=ss.stable?'✓':ss.totalAttempts?'→':'○';
    return `<article class="skill-card ${ready?'':'locked'}">
      <div class="skill-head"><div><span class="skill-family">${esc(skill.family)}</span><h3>${esc(skill.label)}</h3></div><div class="mini-ring" style="--mastery:${pct}%;--ring:${accentRing[skill.accent]||'#2f9987'}"><b>${mark}</b></div></div>
      <div class="skill-status"><span>${status}</span><span>${ss.totalAttempts?'Daha önce çalışıldı':'Henüz başlanmadı'}</span></div>
    </article>`;
  }).join('');
}

function renderParent(){
  const focus=pickFocus(); const summary=profileSummary(state); const list=skillsFor(state.profile);
  const averages=Object.fromEntries(REPRESENTATIONS.map(r=>{
    const vals=list.map(s=>ensureSkillState(state,s.id).evidence[r]?.score||0);
    return [r, vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*100):0];
  }));
  const focusGap=focus?representationGap(focus.state):null;
  $('#parentInsight').innerHTML=`
    <div class="panel-title"><div><span>ÖĞRENME RESMİ</span><h3>${esc(PROFILE_META[state.profile].label)}</h3></div><small>${summary.avg}% genel</small></div>
    <div class="parent-hero"><span>ÖNCELİKLİ DESTEK</span><h2>${focus?esc(focus.skill.label):'Henüz veri yok'}</h2><p>${focusGap?esc(repReasons[focusGap.rep]):'İlk oturumdan sonra temsil profili oluşacak.'}</p></div>
    <div class="parent-evidence">${REPRESENTATIONS.map(r=>`<div class="parent-evidence-row"><b>${REPRESENTATION_META[r].label}</b><div class="bar"><i style="width:${averages[r]}%"></i></div><span>${averages[r]}%</span></div>`).join('')}</div>
    <div class="parent-note"><b>Bu yüzde bir not değildir.</b><p>Skor, görülen temsil sayısı, temsil içi kanıt ve gecikmeli geri çağırmanın birlikte oluşturduğu ürün içi bir ilerleme göstergesidir.</p></div>`;

  $('#profileSelect').value=state.profile;
  $('#voiceToggle').checked=!!state.settings.voice;
  $('#motionToggle').checked=!!state.settings.calmMotion;
  $('#cooldownSelect').value=state.settings.cooldownMinutes==null?'auto':String(state.settings.cooldownMinutes);
}
function saveSettingsFromUI(){
  const profile=$('#profileSelect').value;
  if(PROFILE_META[profile]) state.profile=profile;
  state.settings.voice=$('#voiceToggle').checked;
  state.settings.calmMotion=$('#motionToggle').checked;
  const cool=$('#cooldownSelect').value;
  state.settings.cooldownMinutes=cool==='auto'?null:Number(cool);
  skillsFor(state.profile).forEach(s=>ensureSkillState(state,s.id));
  applyMotionSetting(); saveState(); renderAll(); showToast('Ayarlar kaydedildi'); navigate('home');
}
function applyMotionSetting(){ document.body.classList.toggle('calm',!!state.settings.calmMotion); }
function resetProgress(){
  if(!confirm('Bu cihazdaki SAYMERA ilerlemesi sıfırlansın mı? SayıYolu veya başka bir uygulamanın verisi etkilenmez.')) return;
  state=defaultState(); activeDomain='Tümü'; saveState(); renderAll(); openOnboarding(); showToast('SAYMERA ilerlemesi sıfırlandı');
}

function dueReviewItems(){
  const allowed=new Set(skillsFor(state.profile).map(s=>s.id));
  const now=Date.now();
  return state.reviewQueue.filter(x=>allowed.has(x.skillId) && x.dueAt<=now && x.stage==='next-day').sort((a,b)=>a.dueAt-b.dueAt);
}
function dueSameSessionReview(includeFuture=false){
  if(!session) return null;
  const allowed=new Set(skillsFor(state.profile).map(s=>s.id));
  return state.reviewQueue
    .filter(x=>allowed.has(x.skillId)&&x.stage==='same-session'&&x.dueQuestion!=null&&(includeFuture||x.dueQuestion<=session.questionIndex))
    .sort((a,b)=>a.dueQuestion-b.dueQuestion)[0]||null;
}
function focusRepresentations(skillState){
  // İlk keşif tüm kanıt pencerelerini tanıtır. Sonraki oturumlar beşli bir checklist değildir;
  // görülmeyen ve en zayıf pencereler önceliklenir.
  if((skillState.totalAttempts||0)===0) return [...REPRESENTATIONS];
  const unseen=REPRESENTATIONS.filter(r=>(skillState.evidence[r]?.attempts||0)===0);
  const seen=REPRESENTATIONS.filter(r=>!unseen.includes(r)).sort((a,b)=>(skillState.evidence[a]?.score||0)-(skillState.evidence[b]?.score||0));
  if(unseen.length){
    const chosen=[...unseen.slice(0,3),...seen.slice(0,Math.max(0,4-unseen.slice(0,3).length))];
    return REPRESENTATIONS.filter(r=>chosen.includes(r));
  }
  const weakest=[...REPRESENTATIONS].sort((a,b)=>(skillState.evidence[a]?.score||0)-(skillState.evidence[b]?.score||0)).slice(0,3);
  return REPRESENTATIONS.filter(r=>weakest.includes(r));
}
function buildSessionPlan(focus){
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
function startSession(){
  $('#toast')?.classList.remove('show'); clearTimeout(toastTimer);
  if(state.cooldownUntil && state.cooldownUntil>Date.now()){ showCooldown(false); return; }
  if(!state.onboarded){ openOnboarding(); return; }
  const focus=pickFocus(); if(!focus){ showToast('Bu seviye için içerik bulunamadı'); return; }
  const focusDifficulty=focus.state.difficulty||1;
  const focusConcept=createConceptInstance(focus.skill.id,focusDifficulty,Math.random);
  const plan=buildSessionPlan(focus);
  session={
    startedAt:Date.now(), focusSkillId:focus.skill.id, focusConcept, plan, planIndex:0,
    focusRepresentations:plan.filter(x=>x.kind==='focus').map(x=>x.representation),
    questionIndex:0, correct:0, wrong:0, hints:0, effortUsed:0, recentSkillIds:[], newStable:0, bridgeAdds:0
  };
  $('#practiceOverlay').classList.add('open'); $('#practiceOverlay').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  loadPlanItem();
}
function maybeInjectBridgeReview(force=false){
  if(!session || session.bridgeAdds>=2) return;
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
}
function loadPlanItem(){
  if(!session) return;
  const atPlanEnd=session.planIndex>=session.plan.length;
  maybeInjectBridgeReview(atPlanEnd);
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
    const learningOptions=currentSelection.phase==='readiness'?{
      support:currentSelection.kind==='bridge'||currentSelection.reviewItem?.support===true,
      sourceSkillId:currentSelection.reviewItem?.readinessSourceSkillId||null
    }:{};
    currentQuestion=generateLearningQuestion(
      skill.id,currentSelection.phase,currentSelection.representation,
      ss.difficulty||1,Math.random,concept,learningOptions
    );
  } else {
    currentQuestion=generateQuestion(skill.id,currentSelection.representation,ss.difficulty||1,Math.random,concept);
    if(currentSelection.phase) currentQuestion.learningPhase=currentSelection.phase;
  }
  if(currentSelection.countsTowardEvidence===false) currentQuestion.countsTowardEvidence=false;
  currentQuestion.completionRecovery=!!currentSelection.reviewItem?.completeCycleOnSuccess;
  currentQuestion.cycleFinal=!!currentSelection.cycleFinal||currentQuestion.completionRecovery;

  session.questionIndex++;
  session.recentSkillIds.push(skill.id);
  answered=false; usedHint=false;
  renderQuestion();
}
function renderQuestion(){
  const q=currentQuestion, s=currentSelection.skill, rep=q.representation;
  const total=session.plan.length;
  $('#practiceLens').textContent=s.family.toUpperCase();
  $('#practiceTitle').textContent=s.label;
  $('#practiceCounter').textContent=`${Math.min(session.planIndex+1,total)} / ${total}`;
  $('#practiceProgress').style.width=`${Math.round(session.planIndex/Math.max(1,total)*100)}%`;
  $('#practiceContent').innerHTML=`
    <div class="question-stage">
      <h2>${esc(q.prompt)}</h2>
      <div class="visual-stage ${q.response?.kind==='visual-choice'?'reference-stage':''}" id="visualStage">${renderVisual(q.visual,q)}</div>
      ${renderResponse(q)}
      <div class="question-tools"><button class="tool-button" id="hintButton">İpucu göster</button>${state.settings.voice?'<button class="tool-button" id="inlineSpeak">Sesli oku</button>':''}</div>
    </div>`;
  wireResponse(q);
  $('#hintButton').addEventListener('click',showHint);
  $('#inlineSpeak')?.addEventListener('click',speakCurrent);
  wireManipulator(q);
  if(state.settings.voice && state.profile==='preschool') setTimeout(speakCurrent,260);
}
function renderResponse(q){
  const response=q.response||{kind:'choice',options:(q.choices||[]).map(value=>({value,label:value}))};
  if(response.kind==='choice'){
    const options=response.options?.length?response.options:(q.choices||[]).map(value=>({value,label:value}));
    return `<div class="answers-grid response-choice">${options.map(opt=>`<button class="answer-button" data-answer="${esc(opt.value)}">${esc(opt.label??opt.value)}</button>`).join('')}</div>`;
  }
  if(response.kind==='visual-choice'){
    return `<div class="visual-choice-grid">${(response.options||[]).map((opt,i)=>`<button class="visual-answer" data-answer="${esc(opt.value)}" aria-label="${esc(opt.ariaLabel||`Görsel seçenek ${i+1}`)}"><span class="visual-option-index">${i+1}</span><div class="visual-option-body">${renderVisual(opt.visual,q)}</div></button>`).join('')}</div>`;
  }
  if(response.kind==='number-input'){
    return `<div class="number-response">
      <label class="number-entry"><span>Cevabın</span><input id="numberAnswer" inputmode="numeric" pattern="[0-9]*" maxlength="${Number(response.maxLength||3)}" placeholder="${esc(response.placeholder||'?')}" autocomplete="off" aria-label="Sayısal cevap"></label>
      <div class="number-keypad" aria-label="Sayı tuşları">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-digit="${n}">${n}</button>`).join('')}<button type="button" data-key="back" aria-label="Sil">⌫</button><button type="button" data-digit="0">0</button><button type="button" data-key="clear" aria-label="Temizle">C</button></div>
      <button class="response-submit" id="submitNumber">${esc(response.checkLabel||'Cevabı kontrol et')}</button>
    </div>`;
  }
  if(response.kind==='manipulative'){
    return `<div class="manipulative-response"><div class="manipulator-status" id="manipulatorStatus">Modeli oluştur, sonra kontrol et.</div><button class="response-submit" id="checkManipulator">${esc(response.checkLabel||'Modeli kontrol et')}</button></div>`;
  }
  return `<div class="answers-grid">${(q.choices||[]).map(choice=>`<button class="answer-button" data-answer="${esc(choice)}">${esc(choice)}</button>`).join('')}</div>`;
}
function wireResponse(q){
  $$('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>answerQuestion(btn.dataset.answer,btn)));
  if(q.response?.kind==='number-input'){
    const input=$('#numberAnswer');
    const max=Number(q.response.maxLength||3);
    const clean=()=>{ input.value=input.value.replace(/\D/g,'').slice(0,max); };
    input.addEventListener('input',clean);
    input.addEventListener('keydown',ev=>{ if(ev.key==='Enter'&&input.value) answerQuestion(input.value,$('#submitNumber')); });
    $$('[data-digit]').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; input.value=(input.value+btn.dataset.digit).slice(0,max); input.focus(); }));
    $('[data-key="back"]')?.addEventListener('click',()=>{input.value=input.value.slice(0,-1);input.focus();});
    $('[data-key="clear"]')?.addEventListener('click',()=>{input.value='';input.focus();});
    $('#submitNumber')?.addEventListener('click',()=>{ if(!input.value){ showToast('Önce cevabını yaz'); input.focus(); return; } answerQuestion(input.value,$('#submitNumber')); });
    setTimeout(()=>input.focus(),60);
  }
  if(q.response?.kind==='manipulative'){
    $('#checkManipulator')?.addEventListener('click',()=>{
      const value=readManipulatorValue(q);
      if(value==null){ showToast('Önce modeli oluştur'); return; }
      answerQuestion(String(value),$('#checkManipulator'));
    });
  }
}
function wireManipulator(q){
  const interaction=q.response?.interaction;
  if(!interaction) return;
  if(interaction==='twentyframe-build'){
    const root=$('.interactive-twentyframe');
    root?.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; btn.classList.toggle('added'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='tenframe-complete'){
    const root=$('.complete-tenframe-builder');
    root?.querySelectorAll('.complete-token').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      const max=10-Number(root.dataset.base||0);
      const moved=root.querySelectorAll('.complete-token.moved').length;
      if(!btn.classList.contains('moved')&&moved>=max){ root.classList.add('full-pulse'); setTimeout(()=>root.classList.remove('full-pulse'),260); return; }
      btn.classList.toggle('moved');
      const count=root.querySelectorAll('.complete-token.moved').length;
      root.querySelectorAll('.complete-cell:not(.base)').forEach((cell,i)=>cell.classList.toggle('added',i<count));
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='add-to-ten'){
    const root=$('.add-to-ten-builder');
    root?.querySelectorAll('.move-token').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      const max=10-Number(root.dataset.base||0);
      const moved=root.querySelectorAll('.move-token.moved').length;
      if(!btn.classList.contains('moved')&&moved>=max){ root.classList.add('full-pulse'); setTimeout(()=>root.classList.remove('full-pulse'),260); return; }
      btn.classList.toggle('moved');
      const count=root.querySelectorAll('.move-token.moved').length;
      root.querySelectorAll('.target-cell:not(.base)').forEach((cell,i)=>cell.classList.toggle('added',i<count));
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='balance-fill'){
    const root=$('.balance-fill-builder');
    root?.querySelectorAll('.balance-token').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; btn.classList.toggle('moved');
      const count=root.querySelectorAll('.balance-token.moved').length;
      const preview=root.querySelector('.balance-preview-count'); if(preview) preview.textContent=String(Number(root.dataset.rightBase||0)+count);
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='story-add'){
    const root=$('.story-add-builder');
    root?.querySelectorAll('.story-add-token').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; btn.classList.toggle('moved');
      const count=root.querySelectorAll('.story-add-token.moved').length;
      root?.querySelectorAll('.story-added-slot').forEach((slot,i)=>slot.classList.toggle('filled',i<count));
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='pattern-step'){
    const root=$('.pattern-step-builder');
    root?.querySelectorAll('.pattern-step-button').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; root.querySelectorAll('.pattern-step-button').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected');
      const preview=root.querySelector('.pattern-preview'); if(preview) preview.textContent=String(Number(root.dataset.last||0)+Number(btn.dataset.step||0));
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='shape-properties'){
    const root=$('.shape-property-builder');
    root?.querySelectorAll('.property-chip').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; const group=btn.dataset.group; root.querySelectorAll(`.property-chip[data-group="${group}"]`).forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='solid-properties'){
    const root=$('.solid-property-builder');
    root?.querySelectorAll('.solid-property-chip').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      const group=btn.dataset.group;
      root.querySelectorAll(`.solid-property-chip[data-group="${group}"]`).forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected');
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='length-align'){
    const root=$('.length-align-builder');
    root?.querySelector('.align-lengths')?.addEventListener('click',()=>{ if(answered)return; root.classList.add('aligned'); updateManipulatorStatus(q); });
    root?.querySelectorAll('.length-choice').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; root.querySelectorAll('.length-choice').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='pictograph-row'){
    const root=$('.pictograph-row-builder');
    root?.querySelectorAll('.pic-build-cell').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('filled'); updateManipulatorStatus(q); }));
  }
  if(interaction==='remove-counters'){
    const root=$('.remove-counter-builder');
    root?.querySelectorAll('.remove-token').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('removed'); updateManipulatorStatus(q); }));
  }
  if(interaction==='bond-fill'){
    const root=$('.sg-bond-builder');
    root?.querySelectorAll('.sg-bond-token').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='base10-build'){
    const root=$('.sg-base10-builder');
    root?.querySelectorAll('.sg-base10-ten,.sg-base10-one').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='order-pair'){
    const root=$('.sg-order-builder');
    root?.querySelectorAll('.sg-order-card').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      if(btn.dataset.order){ root.querySelectorAll('.sg-order-card').forEach(x=>{delete x.dataset.order;x.classList.remove('selected')}); }
      const picked=[...root.querySelectorAll('.sg-order-card[data-order]')];
      if(picked.length>=2) root.querySelectorAll('.sg-order-card').forEach(x=>{delete x.dataset.order;x.classList.remove('selected')});
      btn.dataset.order=String(root.querySelectorAll('.sg-order-card[data-order]').length+1); btn.classList.add('selected'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='ordinal-position'){
    const root=$('.sg-ordinal-builder');
    root?.querySelectorAll('.sg-ordinal-slot').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; root.querySelectorAll('.sg-ordinal-slot').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); updateManipulatorStatus(q); }));
  }
  if(interaction==='equal-groups'||interaction==='share-equally'){
    const root=$(interaction==='equal-groups'?'.sg-equal-groups-builder':'.sg-share-builder');
    const used=()=>[...root.querySelectorAll('.sg-group-count')].reduce((sum,n)=>sum+Number(n.textContent||0),0);
    root?.querySelectorAll('.sg-group-add').forEach(btn=>btn.addEventListener('click',()=>{ if(answered||used()>=Number(root.dataset.total||0))return; const count=root.querySelector(`.sg-group-count[data-index="${btn.dataset.index}"]`); count.textContent=String(Number(count.textContent||0)+1); updateManipulatorStatus(q); }));
    root?.querySelectorAll('.sg-group-remove').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; const count=root.querySelector(`.sg-group-count[data-index="${btn.dataset.index}"]`); count.textContent=String(Math.max(0,Number(count.textContent||0)-1)); updateManipulatorStatus(q); }));
  }
  if(interaction==='money-make'){
    const root=$('.sg-money-builder'); root?.querySelectorAll('.sg-money-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='cm-ruler'){
    const root=$('.sg-cm-ruler-builder');
    root?.querySelectorAll('.sg-ruler-tick-button').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      root.querySelectorAll('.sg-ruler-tick-button').forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected');
      const line=root.querySelector('.sg-cm-ruler-line');
      if(line){ line.style.width=`${Number(btn.dataset.value||0)*40}px`; line.style.marginLeft='0px'; }
      updateManipulatorStatus(q);
    }));
  }
  if(interaction==='shape-compose'){
    const root=$('.sg-shape-compose-builder');
    root?.querySelectorAll('.sg-compose-piece').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q);
    }));
  }
  if(interaction==='unit-measure'){
    const root=$('.sg-unit-builder'); root?.querySelectorAll('.sg-unit-cell').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='clock-set'){
    const root=$('.sg-clock-set');
    root?.querySelectorAll('.sg-hour-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-hour-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));
    root?.querySelectorAll('.sg-minute-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-minute-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='shape-pattern'){
    const root=$('.sg-shape-pattern-builder'); root?.querySelectorAll('.sg-shape-choice').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;root.querySelectorAll('.sg-shape-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');updateManipulatorStatus(q)}));
  }
  if(interaction==='three-add'){
    const root=$('.sg-three-add-builder'); root?.querySelectorAll('.sg-three-token').forEach(btn=>btn.addEventListener('click',()=>{if(answered)return;btn.classList.toggle('selected');updateManipulatorStatus(q)}));
  }
  updateManipulatorStatus(q);
}
function readManipulatorValue(q){
  const interaction=q.response?.interaction;
  if(interaction==='twentyframe-build') return $$('.interactive-twentyframe .added').length;
  if(interaction==='tenframe-complete') return $$('.complete-tenframe-builder .complete-token.moved').length;
  if(interaction==='add-to-ten') return $$('.add-to-ten-builder .move-token.moved').length;
  if(interaction==='balance-fill') return $$('.balance-fill-builder .balance-token.moved').length;
  if(interaction==='story-add') return $$('.story-add-builder .story-add-token.moved').length;
  if(interaction==='pattern-step') return $('.pattern-step-builder .pattern-step-button.selected')?.dataset.step ?? null;
  if(interaction==='shape-properties'){
    const root=$('.shape-property-builder'); if(!root)return null; const selected=['straight','curves','structure'].map(group=>root.querySelector(`.property-chip.selected[data-group="${group}"]`)?.dataset.value); return selected.every(v=>v!=null)?selected.join('|'):null;
  }
  if(interaction==='solid-properties'){
    const root=$('.solid-property-builder'); if(!root)return null;
    const selected=['flat','curved','face'].map(group=>root.querySelector(`.solid-property-chip.selected[data-group="${group}"]`)?.dataset.value);
    return selected.every(v=>v!=null)?selected.join('|'):null;
  }
  if(interaction==='length-align'){
    const root=$('.length-align-builder'); if(!root?.classList.contains('aligned'))return null; const selected=root.querySelector('.length-choice.selected')?.dataset.value; return selected?`aligned|${selected}`:null;
  }
  if(interaction==='pictograph-row') return $$('.pictograph-row-builder .pic-build-cell.filled').length;
  if(interaction==='remove-counters') return $$('.remove-counter-builder .remove-token.removed').length;
  if(interaction==='bond-fill') return $$('.sg-bond-builder .sg-bond-token.selected').length;
  if(interaction==='base10-build') return `${$$('.sg-base10-builder .sg-base10-ten.selected').length}|${$$('.sg-base10-builder .sg-base10-one.selected').length}`;
  if(interaction==='order-pair'){
    const cards=[...$$('.sg-order-builder .sg-order-card[data-order]')].sort((a,b)=>Number(a.dataset.order)-Number(b.dataset.order)); return cards.length===2?cards.map(x=>x.dataset.value).join('|'):null;
  }
  if(interaction==='ordinal-position') return $('.sg-ordinal-builder .sg-ordinal-slot.selected')?.dataset.value ?? null;
  if(interaction==='equal-groups'||interaction==='share-equally'){
    const root=$(interaction==='equal-groups'?'.sg-equal-groups-builder':'.sg-share-builder'); if(!root)return null;
    const counts=[...root.querySelectorAll('.sg-group-count')].map(n=>Number(n.textContent||0)); const total=counts.reduce((a,b)=>a+b,0);
    if(total!==Number(root.dataset.total||0)||!counts.length||!counts.every(v=>v===counts[0])) return null;
    return interaction==='equal-groups'?total:counts[0];
  }
  if(interaction==='money-make') return [...$$('.sg-money-builder .sg-money-token.selected')].reduce((sum,b)=>sum+Number(b.dataset.value||0),0);
  if(interaction==='cm-ruler') return $('.sg-cm-ruler-builder .sg-ruler-tick-button.selected')?.dataset.value ?? null;
  if(interaction==='shape-compose'){
    const values=[...$$('.sg-shape-compose-builder .sg-compose-piece.selected')].map(b=>b.dataset.value).sort();
    return values.length?values.join('+'):null;
  }
  if(interaction==='unit-measure') return $$('.sg-unit-builder .sg-unit-cell.selected').length;
  if(interaction==='clock-set'){
    const h=$('.sg-clock-set .sg-hour-choice.selected')?.dataset.value, m=$('.sg-clock-set .sg-minute-choice.selected')?.dataset.value; return h!=null&&m!=null?`${h}|${m}`:null;
  }
  if(interaction==='shape-pattern') return $('.sg-shape-pattern-builder .sg-shape-choice.selected')?.dataset.value ?? null;
  if(interaction==='three-add') return $$('.sg-three-add-builder .sg-three-token.selected').length;
  return null;
}
function updateManipulatorStatus(q){
  const node=$('#manipulatorStatus'); if(!node)return;
  const value=readManipulatorValue(q)??0;
  if(q.response?.interaction==='twentyframe-build') node.textContent=`Kurduğun miktar: ${value}`;
  else if(q.response?.interaction==='tenframe-complete') node.textContent=`Yerleştirdiğin taş: ${value}`;
  else if(q.response?.interaction==='add-to-ten') node.textContent=`İlk çerçeveye taşıdığın: ${value}`;
  else if(q.response?.interaction==='balance-fill') node.textContent=`Sağ tarafa eklediğin: ${value}`;
  else if(q.response?.interaction==='story-add') node.textContent=`Hikâyeye eklediğin: ${value}`;
  else if(q.response?.interaction==='pattern-step') node.textContent=value?`Seçtiğin adım: ${Number(value)>0?'+':''}${value}`:'Örüntü adımını seç';
  else if(q.response?.interaction==='shape-properties') node.textContent=value?'Üç özellik seçildi':'Her satırdan bir özellik seç';
  else if(q.response?.interaction==='solid-properties') node.textContent=value?'Özellik modeli hazır':'Her satırdan bir özellik seç';
  else if(q.response?.interaction==='length-align') node.textContent=value?'Hizalama ve karşılaştırma hazır':'Önce hizala, sonra karşılaştır';
  else if(q.response?.interaction==='pictograph-row') node.textContent=`Grafiğe koyduğun sembol: ${value}`;
  else if(q.response?.interaction==='remove-counters') node.textContent=`Ayırdığın taş: ${value}`;
  else if(q.response?.interaction==='bond-fill') node.textContent=`Eksik parçaya koyduğun taş: ${value}`;
  else if(q.response?.interaction==='base10-build') { const [t='0',o='0']=String(value).split('|'); node.textContent=`Modelin: ${t} onluk · ${o} birlik`; }
  else if(q.response?.interaction==='order-pair') node.textContent=value?`Sıran: ${String(value).replace('|',' → ')}`:'Önce küçük, sonra büyük karta dokun';
  else if(q.response?.interaction==='ordinal-position') node.textContent=value?`Seçtiğin sıra: ${value}.`:'Bir sıra konumu seç';
  else if(q.response?.interaction==='equal-groups') node.textContent=value!=null?`Eşit gruplar hazır · toplam ${value}`:'Taşları bütün gruplara eşit dağıt';
  else if(q.response?.interaction==='share-equally') node.textContent=value!=null?`Eşit paylaşım hazır · grupta ${value}`:'Bütün taşları eşit paylaş';
  else if(q.response?.interaction==='money-make') node.textContent=`Seçtiğin toplam: ${value} ${q.response?.unit==='kr'?'kuruş':'TL'}`;
  else if(q.response?.interaction==='cm-ruler') node.textContent=value?`Seçtiğin bitiş: ${value} cm`:'Cetvelde bitiş çizgisini seç';
  else if(q.response?.interaction==='shape-compose') node.textContent=value?`Seçtiğin parçalar: ${String(value).split('+').length}`:'Figürü oluşturan bütün parçaları seç';
  else if(q.response?.interaction==='unit-measure') node.textContent=`Kullandığın birim: ${value}`;
  else if(q.response?.interaction==='clock-set') node.textContent=value?`Ayarladığın: ${String(value).replace('|',':').replace(/:0$/,':00')}`:'Önce saati ve dakikayı seç';
  else if(q.response?.interaction==='shape-pattern') node.textContent=value?'Sıradaki şekli seçtin':'Örüntüyü tamamlayacak şekli seç';
  else if(q.response?.interaction==='three-add') node.textContent=`Toplam alana taşıdığın taş: ${value}`;
}
function showHint(){
  if(!currentQuestion||answered) return;
  usedHint=true; session.hints++;
  const btn=$('#hintButton'); btn.disabled=true; btn.textContent='İpucu açık';
  const stage=$('.question-stage');
  stage.insertAdjacentHTML('beforeend',`<div class="explain-box" id="liveHint"><strong>İpucu:</strong> ${esc(currentQuestion.hint)}</div>`);
  if(state.settings.voice) speak(currentQuestion.hint);
}
function answerQuestion(value,button){
  if(answered||!currentQuestion) return;
  answered=true;
  const q=currentQuestion; const correct=String(value)===String(q.answer);
  $$('[data-answer]').forEach(b=>{
    b.disabled=true;
    b.classList.toggle('correct',b.dataset.answer===String(q.answer));
    if(b!==button&&b.dataset.answer!==String(q.answer)) b.classList.add('dimmed');
  });
  $$('.number-keypad button,#submitNumber,#checkManipulator,.interactive-twentyframe button,.complete-token,.move-token,.remove-token,.balance-token,.story-add-token,.pattern-step-button,.property-chip,.align-lengths,.length-choice,.pic-build-cell,.sg-bond-token,.sg-base10-ten,.sg-base10-one,.sg-order-card,.sg-ordinal-slot,.sg-group-add,.sg-group-remove,.sg-money-token,.sg-ruler-tick-button,.sg-compose-piece,.sg-unit-cell,.sg-hour-choice,.sg-minute-choice,.sg-shape-choice,.solid-property-chip,.sg-three-token').forEach(b=>b.disabled=true);
  $('#numberAnswer')?.setAttribute('disabled','');
  if(button){ if(!correct) button.classList.add('wrong'); else button.classList.add('correct'); }
  const before=ensureSkillState(state,q.skillId).stable;
  const delayed=currentSelection.reviewItem?.stage==='next-day';
  applyAnswer(state,q,{correct,usedHint,isDelayedReview:!!delayed,now:Date.now(),sessionQuestionIndex:session.questionIndex});
  if(currentSelection.reviewItem) consumeReview(state,currentSelection.reviewItem);
  const after=ensureSkillState(state,q.skillId).stable;
  if(!before&&after) session.newStable++;
  session.effortUsed+=(q.effort||1)*(usedHint?1.12:1);
  if(correct) session.correct++; else session.wrong++;
  saveState();
  setTimeout(()=>correct?renderCorrectFeedback():renderBridgeFeedback(),360);
}
function renderCorrectFeedback(){
  const q=currentQuestion;
  const lead=q.feedbackTitle||'Harika, doğru cevabı buldun.';
  $('#practiceContent').innerHTML=`<section class="feedback-card">
    <div class="feedback-mark">✓</div><span class="section-kicker">DOĞRU</span><h2>${esc(lead)}</h2>
    <div class="explain-box">${esc(q.explain)}</div>
    <button class="primary-cta" id="continueButton"><span class="cta-icon">→</span><span><b>Sonraki göreve geç</b><small>${nextTaskLabel()}</small></span><i>→</i></button>
  </section>`;
  $('#continueButton').addEventListener('click',nextQuestion);
  if(state.settings.voice) speak(`${lead} ${q.explain}`);
}
function renderBridgeFeedback(){
  const q=currentQuestion;
  $('#practiceContent').innerHTML=`<section class="bridge-card">
    <div class="bridge-mark"><i></i><i></i><i></i></div><span class="section-kicker">BİRLİKTE BAKALIM</span><h2>Bu kez olmadı; ipucuyla devam edelim.</h2>
    <div class="bridge-visual">${renderVisual(q.visual,q)}</div>
    <div class="explain-box"><strong>İpucu:</strong> ${esc(q.hint)}<br><span>${esc(q.explain)}</span></div>
    <button class="primary-cta" id="bridgeContinue"><span class="cta-icon">↗</span><span><b>Devam et</b><small>${nextTaskLabel()}</small></span><i>→</i></button>
  </section>`;
  $('#bridgeContinue').addEventListener('click',nextQuestion);
  if(state.settings.voice) speak(`İpucuna bakalım. ${q.hint}`);
}
function nextTaskLabel(){
  const next=session?.plan[session.planIndex+1];
  return next?'sıradaki soru':'oturumu tamamla';
}
function nextQuestion(){
  if(!session) return;
  session.planIndex++;
  loadPlanItem();
}
function finishSession(){
  if(!session) return;
  const ended=session;
  const duration=Math.max(1,Math.round((Date.now()-ended.startedAt)/1000));
  state.totals.activeSeconds=(state.totals.activeSeconds||0)+duration;
  state.sessions.push({at:Date.now(),profile:state.profile,focusSkillId:ended.focusSkillId,correct:ended.correct,wrong:ended.wrong,hints:ended.hints,questions:ended.questionIndex,duration,newStable:ended.newStable});
  if(state.sessions.length>80) state.sessions=state.sessions.slice(-80);
  saveState();
  const attempts=ended.correct+ended.wrong; const rate=attempts?Math.round(ended.correct/attempts*100):0;
  const focusSkill=skillsFor(state.profile).find(s=>s.id===ended.focusSkillId); const focusState=focusSkill?ensureSkillState(state,focusSkill.id):null;
  $('#practiceProgress').style.width='100%';
  $('#practiceCounter').textContent=`${ended.questionIndex} / ${ended.questionIndex}`;
  $('#practiceContent').innerHTML=`<section class="session-end">
    <div class="end-mark">✓</div><span class="section-kicker">TAMAMLANDI</span><h2>Bugünkü çalışmayı bitirdin.</h2>
    <p>${focusSkill?`“${esc(focusSkill.label)}” ile güzel bir çalışma yaptın.`:'Güzel bir çalışma yaptın.'} Şimdi kısa bir mola zamanı.</p>
    <div class="end-stats"><div><strong>${ended.questionIndex}</strong><span>görev tamamlandı</span></div><div><strong>✓</strong><span>çalışma bitti</span></div></div>
    <button class="primary-cta" id="finishToRest"><span class="cta-icon">☼</span><span><b>Mola ver</b><small>ekrandan biraz uzaklaş</small></span><i>→</i></button>
  </section>`;
  $('#finishToRest').addEventListener('click',()=>{
    $('#practiceOverlay').classList.remove('open'); $('#practiceOverlay').setAttribute('aria-hidden','true'); document.body.style.overflow='';
    session=null; currentQuestion=null; currentSelection=null; renderAll(); startCooldown();
  });
}
function closePractice(confirmClose=false){
  if(confirmClose&&session&&session.questionIndex>0&&!confirm('Çalışmayı şimdi kapatmak ister misin? Daha sonra yeniden başlayabilirsin.')) return;
  $('#practiceOverlay').classList.remove('open'); $('#practiceOverlay').setAttribute('aria-hidden','true'); document.body.style.overflow='';
  session=null; currentQuestion=null; currentSelection=null; renderAll();
}

function startCooldown(){
  const meta=PROFILE_META[state.profile];
  let minutes=state.settings.cooldownMinutes??meta.cooldownMinutes;
  if(state.settings.cooldownMinutes==null){
    const today=new Date().toDateString();
    const count=state.sessions.filter(s=>new Date(s.at).toDateString()===today).length;
    if(count>=2) minutes=Math.max(minutes,10);
  }
  state.cooldownUntil=Date.now()+minutes*60*1000; saveState(); showCooldown(true);
}
function showCooldown(newBreak){
  const overlay=$('#cooldownOverlay'); overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  if(newBreak){
    const prompts=['Ayağa kalk, birkaç yavaş adım at ve odanın uzak bir noktasına bak.','Biraz su iç, omuzlarını çevir ve ekrandan uzağa bak.','Ellerini açıp kapat, kısa bir tur at ve gözlerini dinlendir.'];
    $('#cooldownPrompt').textContent=prompts[Math.floor(Math.random()*prompts.length)];
  }
  clearInterval(cooldownTimer); updateCooldown(); cooldownTimer=setInterval(updateCooldown,1000);
}
function updateCooldown(){
  const remaining=Math.max(0,(state.cooldownUntil||0)-Date.now());
  if(remaining<=0){ state.cooldownUntil=0; saveState(); hideCooldown(); renderAll(); showToast('Mola tamamlandı'); return; }
  const sec=Math.ceil(remaining/1000); const m=Math.floor(sec/60), s=sec%60;
  $('#cooldownTime').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function hideCooldown(){ clearInterval(cooldownTimer); $('#cooldownOverlay').classList.remove('open'); $('#cooldownOverlay').setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

function speakCurrent(){
  if(!currentQuestion) return;
  const q=currentQuestion, kind=q.response?.kind||'choice';
  let tail='';
  if(kind==='choice') tail=` Seçenekler: ${(q.response?.options||[]).map(x=>x.label??x.value).join(', ')}.`;
  else if(kind==='visual-choice') tail=' Görsel modellerden doğru olanı seç.';
  else if(kind==='number-input') tail=' Cevabını sayı olarak yaz.';
  else if(kind==='manipulative') tail=' Modeli dokunarak oluştur ve sonra kontrol et.';
  speak(`${q.prompt}.${tail}`);
}
function speak(text){
  if(!text||!('speechSynthesis' in window)) return;
  speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='tr-TR'; u.rate=.91; u.pitch=1.02; speechSynthesis.speak(u);
}

function renderVisual(v,q){
  if(!v) return `<div style="position:relative;z-index:1;text-align:center;color:var(--muted);font-size:11px;max-width:360px">Bu pencerede görsel model yerine dil ve akıl yürütme kullanılıyor.</div>`;
  switch(v.type){
    case 'dots': return `<div class="visual-dots">${Array.from({length:v.n},()=>'<i class="dot"></i>').join('')}</div>`;
    case 'objects': return `<div class="visual-objects">${Array.from({length:v.n},(_,i)=>`<i class="object-token" style="--r:${(i%3-1)*5}deg"></i>`).join('')}</div>`;
    case 'buttons': return `<div class="visual-objects">${Array.from({length:v.n},()=>'<i class="object-token"></i>').join('')}<span style="font-size:26px;color:var(--muted)">…</span></div>`;
    case 'compare': return `<div class="compare-wrap"><div class="compare-group"><span class="compare-label">SOL</span>${Array.from({length:v.a},()=>'<i class="dot"></i>').join('')}</div><div class="compare-group"><span class="compare-label">SAĞ</span>${Array.from({length:v.b},()=>'<i class="dot" style="background:var(--blue)"></i>').join('')}</div></div>`;
    case 'partwhole': return `<div class="partwhole"><div class="whole">${v.whole}</div><div class="part">${v.part}</div><div class="part">${v.missing==null?'?':v.missing}</div></div>`;
    case 'pattern': return `<div class="pattern-row">${v.items.map(x=>`<span>${esc(x)}</span>`).join('')}<span style="color:var(--muted)">?</span></div>`;
    case 'tenframe': return q?.representation==='build'&&q?.skillId==='make10'?interactiveTenFrame(v.n):tenFrame(v.n,'');
    case 'twentyframe-build-interactive': return interactiveTwentyFrame(v.target);
    case 'twentyframe-model': return twentyFrameModel(v.n);
    case 'bead-bundle-story': return beadBundleStory(v.rest);
    case 'two-color-bead-story': return twoColorBeadStory(v.first,v.second);
    case 'tenframe-complete-interactive': return interactiveCompleteTenFrame(v.initial,v.pool);
    case 'tenframe-completion-model': return tenFrameCompletionModel(v.base,v.added);
    case 'add-to-ten-interactive': return addToTenBuilder(v.a,v.b);
    case 'make10-split-model': return make10SplitModel(v.a,v.b,v.move,v.rest);
    case 'remove-counters-interactive': return removeCountersBuilder(v.total);
    case 'sub-numberline-model': return subtractionNumberLineModel(v.start,v.steps,v.end);
    case 'sub-decomposition': return subtractionDecomposition(v);
    case 'seat-row': return seatRow(v.occupied,v.total);
    case 'sticker-story': return stickerStory(v.a,v.b,v.op);
    case 'numbercard': return `<div style="font-size:82px;font-weight:950;letter-spacing:-.06em;position:relative;z-index:1">${v.n}</div>`;
    case 'dots-add': return `<div style="display:grid;gap:14px;position:relative;z-index:1"><div class="visual-dots">${Array.from({length:v.a},()=>'<i class="dot"></i>').join('')}</div><div style="text-align:center;font-size:24px">＋</div><div class="visual-dots">${Array.from({length:v.b},()=>'<i class="dot" style="background:var(--blue)"></i>').join('')}</div></div>`;
    case 'tenframe-add': return `<div class="tenframe-wrap">${tenFrame(v.a,'')}${tenFrame(v.b,'second')}</div>`;
    case 'equation': return `<div class="equation-visual">${esc(v.text)}</div>`;
    case 'numberline-sub': return numberLine(v.a,v.b,20);
    case 'numberline100': return numberLine(v.a,v.b,100);
    case 'balance': return `<div class="balance"><div class="balance-side">${v.left.map(esc).join(' + ')}</div><div class="balance-eq">=</div><div class="balance-side">${v.right.map(esc).join(' + ')}</div></div>`;
    case 'balance-fill-interactive': return balanceFillBuilder(v.left,v.rightBase,v.pool);
    case 'equal-shelves-story': return equalShelvesStory(v.left,v.rightBase);
    case 'story-add-interactive': return storyAddBuilder(v.initial,v.pool,v.targetAdd);
    case 'story-operation-model': return storyOperationModel(v.a,v.b,v.op);
    case 'context-change-story': return contextChangeStory(v.a,v.b,v.op);
    case 'pattern-step-interactive': return patternStepBuilder(v.seq,v.candidates);
    case 'elevator-pattern': return elevatorPattern(v.start,v.step,v.moves);
    case 'shape-property-builder': return shapePropertyBuilder(v.shape,v.name);
    case 'length-align-interactive': return lengthAlignBuilder(v.a,v.b);
    case 'ribbon-compare-story': return ribbonCompareStory(v.a,v.b);
    case 'pictograph-row-interactive': return pictographRowBuilder(v.cats,v.vals,v.targetIndex);
    case 'raw-data-list': return rawDataList(v.cats,v.vals);
    case 'bar': { const total=v.op==='+'?v.a+v.b:v.a; const w1=Math.max(22,Math.round(v.a/Math.max(1,total)*100)), w2=Math.max(18,100-w1); return `<div class="bar-model"><span style="width:${w1}%">${v.a}</span><span style="width:${w2}%">${v.op==='+'?v.b:'− '+v.b}</span></div>`; }
    case 'story': return `<div class="story-visual"><div class="bag">${v.a}</div><span class="story-arrow">${v.kind==='gain'?'＋':'−'}</span><div class="bag" style="background:var(--blue-soft);border-color:#9fb3c4">${v.b}</div></div>`;
    case 'base10': return `<div class="base10"><div class="tens">${Array.from({length:v.tens},()=>'<i class="ten-rod"></i>').join('')}</div><div class="ones">${Array.from({length:v.ones},()=>'<i class="one-cube"></i>').join('')}</div></div>`;
    case 'bar-add': return `<div class="bar-model"><span style="width:58%">${v.a}</span><span style="width:42%">+ ${v.b}</span></div>`;
    case 'groups': return `<div class="group-wrap">${Array.from({length:v.groups},()=>`<div class="group">${Array.from({length:v.each},()=>'<i></i>').join('')}</div>`).join('')}</div>`;
    case 'share': { const each=v.total/v.divisor; return `<div class="share-wrap">${Array.from({length:v.divisor},()=>`<div class="share-person">${Array.from({length:each},()=>'<i></i>').join('')}</div>`).join('')}</div>`; }
    case 'fraction': return fractionSvg(v.denom);
    case 'story2': return `<div style="display:grid;gap:14px;text-align:center;position:relative;z-index:1"><div class="group-wrap">${Array.from({length:v.boxes},()=>`<div class="group">${Array.from({length:v.each},()=>'<i></i>').join('')}</div>`).join('')}</div><div style="color:var(--muted);font-weight:800">sonra ${v.give} kalem veriliyor</div></div>`;
    case 'shape': return `<div class="shape-visual ${esc(v.shape)}" style="--rot:${Number(v.rotate||0)}deg"></div>`;
    case 'shape-scene': return shapeScene(v.shape);
    case 'sort': return renderSort(v.mode);
    case 'position': return renderPosition(v.relation);
    case 'sequence': return `<div class="sequence-row">${v.items.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
    case 'length-bars': return renderLengthBars(v);
    case 'pictograph': return `<div class="pictograph">${v.cats.map((cat,i)=>`<div class="pic-row"><b>${esc(cat)}</b><div>${Array.from({length:v.vals[i]},()=>'<i></i>').join('')}</div></div>`).join('')}</div>`;
    case 'ruler': return renderRuler(v.n);
    case 'clock': return renderClock(v.hour,v.minute);
    case 'money': { const unit=v.unit==='kr'?'kr':'TL'; return `<div class="money-wrap">${v.values.map(n=>`<div class="money-note">${n}<small>${unit}</small></div>`).join('')}${v.price!=null?`<div class="price-tag">Fiyat ${v.price} ${unit}</div>`:''}</div>`; }
    case 'bar-chart': { const max=Math.max(...v.vals,1); return `<div class="bar-chart">${v.cats.map((cat,i)=>`<div class="bar-col ${v.highlight===i?'highlight':''}" style="height:${Math.max(12,Math.round(v.vals[i]/max*100))}%"><b>${esc(cat)}</b></div>`).join('')}</div>`; }
    case 'solid': return solidSvg(v.kind,Number(v.rotate||0));
    case 'solid-pair': return `<div class="solid-pair">${solidSvg(v.kind,0)}${solidSvg(v.kind,Number(v.rotate||28))}</div>`;
    case 'solid-scene': return solidScene(v.kind);
    case 'solid-property-builder': return solidPropertyBuilder(v.name,v.options||{});
    case 'addition-strategy': return additionStrategyVisual(v);
    case 'subtraction-strategy': return subtractionStrategyVisual(v);
    case 'fact-family': return factFamilyVisual(v);
    case 'problem-structure': return problemStructureVisual(v.case);
    case 'story-question': return problemStructureVisual(v.case,true);
    case 'bond-fill-interactive': return bondFillBuilder(v.whole,v.part,v.pool);
    case 'two-part-story': return twoPartStory(v.whole,v.part);
    case 'base10-build-interactive': return base10BuildBuilder(v.target,v.maxTens,v.maxOnes);
    case 'bundle-story': return bundleStory(v.tens,v.ones);
    case 'order-pair-interactive': return orderPairBuilder(v.a,v.b);
    case 'compare-base10': return compareBase10Visual(v.a,v.b,v.relation);
    case 'shelf-counts': return shelfCountsVisual(v.a,v.b);
    case 'ordinal-line-interactive': return ordinalLineBuilder(v.count);
    case 'ordinal-line': return ordinalLineVisual(v.count,v.marked);
    case 'ordinal-symbol': return `<div class="sg-symbol-card">${v.position}.</div>`;
    case 'race-line': return ordinalLineVisual(v.count,v.position,'YARIŞ');
    case 'base10-operation-build': return base10OperationBuilder(v);
    case 'column-operation': return columnOperationVisual(v.a,v.b,v.op);
    case 'shelf-operation': return shelfOperationVisual(v.a,v.b,v.op);
    case 'equal-groups-interactive': return equalGroupsBuilder(v.groups,v.each);
    case 'share-equally-interactive': return shareEquallyBuilder(v.total,v.groups);
    case 'share-model': return shareModelVisual(v.groups,v.each);
    case 'money-make-interactive': return moneyMakeBuilder(v.target,v.denoms,v.unit);
    case 'price-tag': return `<div class="sg-price-tag"><small>FİYAT</small><b>${v.price} ${v.unit==='kr'?'kr':'TL'}</b></div>`;
    case 'money-compare': return moneyCompareVisual(v.left,v.right,v.unit);
    case 'money-shopping': { const unit=v.unit==='kr'?'kr':'TL'; return `<div class="sg-shopping"><div><small>FİYAT</small><b>${v.price} ${unit}</b></div><span>←</span><div><small>VERİLEN</small><b>${v.pay} ${unit}</b></div></div>`; }
    case 'cm-ruler-interactive': return cmRulerBuilder(v.target,v.max);
    case 'cm-ruler-model': return cmRulerModel(v.cm,v.start,v.max);
    case 'cm-badge': return `<div class="sg-symbol-card"><b>${v.cm}</b><small> cm</small></div>`;
    case 'unit-measure-interactive': return unitMeasureBuilder(v.units,v.max);
    case 'unit-measure-model': return unitMeasureModel(v.units,v.target);
    case 'measurement-rule': return measurementRuleVisual();
    case 'paperclip-measure': return paperclipMeasure(v.units);
    case 'clock-set-interactive': return clockSetBuilder();
    case 'time-label': return `<div class="sg-symbol-card time">${esc(v.label)}</div>`;
    case 'schedule-event': return `<div class="sg-schedule"><small>GÜNLÜK PROGRAM</small><b>${esc(v.label)}</b><span>${esc(v.event||'etkinlik')}</span></div>`;
    case 'shape-compose-interactive': return shapeComposeBuilder(v.figure,v.pieces);
    case 'composite-figure': return compositeFigure(v.figure);
    case 'shape-piece-list': return shapePieceList(v.pieces);
    case 'dot-grid-figure': return dotGridFigure(v.figure);
    case 'shape-pattern-interactive': return shapePatternBuilder(v.items,v.options);
    case 'shape-pattern-option': return shapePatternVisual([...v.items,v.next]);
    case 'shape-pattern': return shapePatternVisual(v.items);
    case 'tile-border': return `<div class="sg-tile-border">${shapePatternVisual(v.items)}</div>`;
    case 'three-add-interactive': return threeAddBuilder(v.values);
    case 'three-add-strategy': return threeAddStrategy(v.values,v.pair,v.total);
    case 'three-box-story': return threeBoxStory(v.values);
    default: return `<div style="position:relative;z-index:1;color:var(--muted)">Model hazırlanıyor.</div>`;
  }
}
function threeAddBuilder(values){
  return `<div class="sg-three-add-builder"><div class="sg-three-groups">${values.map((n,g)=>`<div><small>GRUP ${g+1} · ${n}</small>${Array.from({length:n},(_,i)=>`<button type="button" class="sg-three-token" aria-label="${g+1}. grup ${i+1}. taş"></button>`).join('')}</div>`).join('')}</div><small class="pool-caption">Üç gruptaki bütün taşları toplam alanına taşı.</small></div>`;
}
function threeAddStrategy(values,pair,total){
  return `<div class="sg-strategy"><b>ÜÇ TOPLANAN</b><div class="sg-equation-flow"><span>${values.join(' + ')}</span>${pair!=null?`<i>→</i><span>${pair} + ${values[2]}</span>`:''}${total!=null?`<i>→</i><strong>${total}</strong>`:''}</div></div>`;
}
function threeBoxStory(values){ return `<div class="sg-three-boxes">${values.map((n,i)=>`<div><small>KUTU ${i+1}</small><b>${n}</b></div>`).join('')}</div>`; }
function sgShape(token){
  const [id='circle',size='medium',orientation='0']=String(token).split('|');
  const cls={triangle:'triangle',square:'square',rect:'rect',circle:'circle'}[id]||'circle';
  const sizeCls=size==='small'?'small':size==='large'?'large':'medium';
  const angle=Number(orientation)||0;
  return `<i class="sg-mini-shape ${cls} ${sizeCls}" style="--sg-rot:${angle}deg"></i>`;
}
function additionStrategyVisual(v){
  if(v.strategy==='makeTen'){
    const move=Math.max(0,10-v.a), rest=Math.max(0,v.b-move);
    return `<div class="sg-strategy"><b>10 YAP</b><div class="sg-equation-flow"><span>${v.a}+${v.b}</span><i>→</i><span>${v.a}+${move}+${rest}</span><i>→</i><strong>10+${rest}</strong></div></div>`;
  }
  if(v.strategy==='countOn'){
    return `<div class="sg-strategy"><b>İLERİ SAY</b><div class="sg-hop-row">${Array.from({length:v.b+1},(_,i)=>`<span>${v.a+i}</span>`).join('<i>→</i>')}</div></div>`;
  }
  const base=Math.min(v.a,v.b), adjust=Math.abs(v.a-v.b);
  return `<div class="sg-strategy"><b>${v.strategy==='double'?'ÇİFT':'YAKIN ÇİFT'}</b><div class="sg-double-model"><span>${base}</span><span>${base}</span>${adjust?'<i>+1</i>':''}</div></div>`;
}
function subtractionStrategyVisual(v){
  if(v.strategy==='subtractFrom10'){
    const to10=Math.max(0,v.a-10), after=Math.max(0,v.b-to10);
    return `<div class="sg-strategy"><b>10'DAN GEÇ</b><div class="sg-equation-flow"><span>${v.a}−${v.b}</span><i>→</i><span>${v.a}−${to10}</span><i>→</i><strong>10−${after}</strong></div></div>`;
  }
  if(v.strategy==='inverse') return `<div class="sg-strategy"><b>TERS İLİŞKİ</b><div class="sg-equation-flow"><span>${v.a}−${v.b}=?</span><i>↔</i><strong>?+${v.b}=${v.a}</strong></div></div>`;
  return `<div class="sg-strategy"><b>GERİ SAY</b><div class="sg-hop-row">${Array.from({length:v.b+1},(_,i)=>`<span>${v.a-i}</span>`).join('<i>←</i>')}</div></div>`;
}
function factFamilyVisual(v){
  return `<div class="sg-fact-family"><strong>${v.total}</strong><div><span>${v.a}</span><span>${v.b}</span></div><small>${v.a}+${v.b}=${v.total} · ${v.total}−${v.a}=${v.b}</small></div>`;
}
function problemStructureVisual(c={},question=false){
  const type=c.type||'join-result';
  if(type==='join-result') return `<div class="sg-problem-model"><span>${c.start??'?'}</span><i>＋</i><span>${c.change??'?'}</span><i>→</i><strong>${question?'?':c.result??'?'}</strong></div>`;
  if(type==='join-change') return `<div class="sg-problem-model"><span>${c.start??'?'}</span><i>＋</i><span class="unknown">?</span><i>→</i><strong>${c.result??'?'}</strong></div>`;
  if(type==='separate-result') return `<div class="sg-problem-model"><span>${c.start??'?'}</span><i>−</i><span>${c.change??'?'}</span><i>→</i><strong>?</strong></div>`;
  if(type==='part-missing') return `<div class="sg-partbar"><strong>${c.whole??'?'}</strong><div><span>${c.known??'?'}</span><span>?</span></div></div>`;
  return `<div class="sg-compare-bars"><div style="--n:${c.larger||10}"><b>${c.larger??'?'}</b></div><div style="--n:${c.smaller||6}"><b>${c.smaller??'?'}</b></div><span>fark ?</span></div>`;
}
function bondFillBuilder(whole,part,pool){
  return `<div class="sg-bond-builder"><div class="sg-bond-diagram"><strong>${whole}</strong><div><span>${part}</span><span class="sg-bond-empty">?</span></div></div><div class="sg-token-pool">${Array.from({length:pool},(_,i)=>`<button class="sg-bond-token" type="button" aria-label="${i+1}. eksik parça taşı"></button>`).join('')}</div></div>`;
}
function twoPartStory(whole,part){ return `<div class="sg-partbar"><strong>TOPLAM ${whole}</strong><div><span>Mavi ${part}</span><span>Kırmızı ?</span></div></div>`; }
function base10BuildControls(maxTens=9,maxOnes=9){
  return `<div class="sg-base10-bank"><div><small>ONLUK</small>${Array.from({length:maxTens},(_,i)=>`<button class="sg-base10-ten" type="button" aria-label="${i+1}. onluk"></button>`).join('')}</div><div><small>BİRLİK</small>${Array.from({length:maxOnes},(_,i)=>`<button class="sg-base10-one" type="button" aria-label="${i+1}. birlik"></button>`).join('')}</div></div>`;
}
function base10BuildBuilder(target,maxTens,maxOnes){ return `<div class="sg-base10-builder"><div class="sg-target-pill">HEDEF <b>${target}</b></div>${base10BuildControls(maxTens,maxOnes)}</div>`; }
function bundleStory(tens,ones){ return `<div class="sg-bundle-story"><div>${Array.from({length:tens},()=>'<span class="bundle">10</span>').join('')}</div><div>${Array.from({length:ones},()=>'<i></i>').join('')||'<em>0 birlik</em>'}</div></div>`; }
function orderPairBuilder(a,b){ return `<div class="sg-order-builder"><small>KÜÇÜKTEN BÜYÜĞE DOKUN</small><div><button type="button" class="sg-order-card" data-value="${a}">${a}</button><button type="button" class="sg-order-card" data-value="${b}">${b}</button></div></div>`; }
function compareBase10Visual(a,b,relation){
  const mini=n=>`<div class="sg-mini-base10"><span>${Math.floor(n/10)} onluk</span><i>${n%10} birlik</i><b>${n}</b></div>`;
  return `<div class="sg-compare-base10">${mini(a)}<strong>${esc(relation)}</strong>${mini(b)}</div>`;
}
function shelfCountsVisual(a,b){ return `<div class="sg-shelf-counts"><div><small>1. RAF</small><b>${a}</b></div><div><small>2. RAF</small><b>${b}</b></div></div>`; }
function ordinalLineBuilder(count){ return `<div class="sg-ordinal-builder"><small>SOLDAN SAY</small><div>${Array.from({length:count},(_,i)=>`<button type="button" class="sg-ordinal-slot" data-value="${i+1}"><i></i><span>${i+1}.</span></button>`).join('')}</div></div>`; }
function ordinalLineVisual(count,marked,label='SIRA'){ return `<div class="sg-ordinal-line"><small>${label}</small><div>${Array.from({length:count},(_,i)=>`<span class="${i+1===Number(marked)?'marked':''}"><i></i><b>${i+1}.</b></span>`).join('')}</div></div>`; }
function base10OperationBuilder(v){ return `<div class="sg-base10-builder"><div class="sg-operation-header">${v.a} ${esc(v.op)} ${v.b} = ?</div>${base10BuildControls(v.maxTens,v.maxOnes)}</div>`; }
function columnOperationVisual(a,b,op){ return `<div class="sg-column-op"><span>${a}</span><span>${esc(op)} ${b}</span><i></i><strong>?</strong></div>`; }
function shelfOperationVisual(a,b,op){ return `<div class="sg-shopping"><div><small>BAŞLANGIÇ</small><b>${a}</b></div><span>${esc(op)}</span><div><small>DEĞİŞİM</small><b>${b}</b></div></div>`; }
function equalGroupsBuilder(groups,each){
  const total=groups*each;
  const boxes=Array.from({length:groups},(_,i)=>`<div class="sg-build-group"><b>Grup ${i+1}</b><strong class="sg-group-count" data-index="${i}">0</strong><div><button type="button" class="sg-group-remove" data-index="${i}">−</button><button type="button" class="sg-group-add" data-index="${i}">＋</button></div></div>`).join('');
  return `<div class="sg-equal-groups-builder" data-total="${total}" data-each="${each}"><small>${total} taşı ${groups} eşit gruba yerleştir</small><div class="sg-group-grid">${boxes}</div></div>`;
}
function shareEquallyBuilder(total,groups){
  const boxes=Array.from({length:groups},(_,i)=>`<div class="sg-build-group"><b>Çocuk ${i+1}</b><strong class="sg-group-count" data-index="${i}">0</strong><div><button type="button" class="sg-group-remove" data-index="${i}">−</button><button type="button" class="sg-group-add" data-index="${i}">＋</button></div></div>`).join('');
  return `<div class="sg-share-builder" data-total="${total}"><small>Dağıtılacak ${total} taş</small><div class="sg-group-grid">${boxes}</div></div>`;
}
function shareModelVisual(groups,each){ return `<div class="sg-group-grid">${Array.from({length:groups},(_,i)=>`<div class="sg-static-group"><small>Grup ${i+1}</small><div>${Array.from({length:each},()=>'<i></i>').join('')}</div></div>`).join('')}</div>`; }
function moneyMakeBuilder(target,denoms,unit='TL'){
  const label=unit==='kr'?'kr':'TL';
  return `<div class="sg-money-builder"><div class="sg-target-pill">HEDEF <b>${target} ${label}</b></div><div class="sg-money-bank">${denoms.flatMap(v=>Array.from({length:v===1?5:4},(_,i)=>`<button type="button" class="sg-money-token" data-value="${v}" aria-label="${v} ${label} para ${i+1}">${v}<small>${label}</small></button>`)).join('')}</div></div>`;
}
function moneyCompareVisual(left,right,unit='TL'){ const label=unit==='kr'?'kr':'TL'; const box=arr=>`<div>${arr.map(n=>`<span class="money-note">${n}<small>${label}</small></span>`).join('')}<b>${arr.reduce((a,b)=>a+b,0)} ${label}</b></div>`; return `<div class="sg-money-compare">${box(left)}<strong>?</strong>${box(right)}</div>`; }
function unitMeasureBuilder(units,max){ return `<div class="sg-unit-builder"><div class="sg-measure-object" style="--u:${units}"></div><div>${Array.from({length:max},(_,i)=>`<button type="button" class="sg-unit-cell" aria-label="${i+1}. ölçü birimi"></button>`).join('')}</div><small>Aynı birimleri uç uca yerleştir.</small></div>`; }
function unitMeasureModel(units,target){ return `<div class="sg-unit-model"><div class="sg-measure-object" style="--u:${target}"></div><div>${Array.from({length:units},()=>'<i></i>').join('')}</div></div>`; }
function measurementRuleVisual(){ return `<div class="sg-measure-rule"><span>başlangıç</span><div>${Array.from({length:6},()=>'<i></i>').join('')}</div><b>boşluk yok · üst üste yok</b></div>`; }
function paperclipMeasure(units){ return `<div class="sg-paperclips"><div class="sg-measure-object" style="--u:${units}"></div><div>${Array.from({length:units},()=>'<span>⌇</span>').join('')}</div></div>`; }
function clockSetBuilder(){
  const minutes=Array.from({length:12},(_,i)=>i*5);
  return `<div class="sg-clock-set"><div class="sg-clock-controls"><small>SAAT</small><div>${Array.from({length:12},(_,i)=>`<button type="button" class="sg-hour-choice" data-value="${i+1}">${i+1}</button>`).join('')}</div><small>DAKİKA · 5'er dakika</small><div>${minutes.map(m=>`<button type="button" class="sg-minute-choice" data-value="${m}">:${String(m).padStart(2,'0')}</button>`).join('')}</div></div></div>`;
}
function cmRulerBuilder(target,max=15){
  const ticks=Array.from({length:max+1},(_,i)=>`<button type="button" class="sg-ruler-tick-button" data-value="${i}" aria-label="${i} santimetre işareti"><i></i><b>${i}</b></button>`).join('');
  return `<div class="sg-cm-ruler-builder" data-target="${target}"><div class="sg-target-pill">HEDEF <b>${target} cm</b></div><div class="sg-cm-ruler-scroll"><div class="sg-cm-ruler-track" style="--max:${max}"><div class="sg-cm-ruler-line" style="--end:0"></div>${ticks}</div></div><small>Çizginin başlangıcı 0'da. Bitiş noktasını seç.</small></div>`;
}
function cmRulerModel(end,start=0,max=15){
  const safeStart=Math.max(0,Math.min(max,Number(start)||0)), safeEnd=Math.max(safeStart,Math.min(max,Number(end)||0));
  const ticks=Array.from({length:max+1},(_,i)=>`<span class="sg-ruler-static-tick ${i===safeStart?'start':''} ${i===safeEnd?'end':''}"><i></i><b>${i}</b></span>`).join('');
  return `<div class="sg-cm-ruler-model"><div class="sg-cm-ruler-scroll"><div class="sg-cm-ruler-track static" style="--max:${max};--start:${safeStart};--end:${safeEnd}"><div class="sg-cm-ruler-line" style="width:${(safeEnd-safeStart)*40}px;margin-left:${safeStart*40}px"></div>${ticks}</div></div><small>cm</small></div>`;
}
function shapePieceSvg(id){
  const shapes={
    square:'<rect x="18" y="18" width="64" height="64" rx="5"/>',
    rect:'<rect x="12" y="28" width="76" height="44" rx="5"/>',
    triangle:'<polygon points="50,12 90,84 10,84"/>',
    circle:'<circle cx="50" cy="50" r="34"/>',
    halfCircle:'<path d="M12 70 A38 38 0 0 1 88 70 L12 70 Z"/>',
    quarterCircle:'<path d="M16 84 L16 16 A68 68 0 0 1 84 84 Z"/>'
  };
  return `<svg class="sg-piece-svg" viewBox="0 0 100 100" aria-hidden="true">${shapes[id]||shapes.square}</svg>`;
}
function compositeFigureSvg(figure){
  const body={
    house:'<polygon points="50,8 88,42 12,42"/><rect x="22" y="42" width="56" height="48" rx="3"/>',
    mushroom:'<path d="M12 48 A38 34 0 0 1 88 48 L12 48 Z"/><rect x="38" y="48" width="24" height="42" rx="3"/>',
    kite:'<polygon points="50,8 86,50 14,50"/><polygon points="14,50 86,50 50,92"/>',
    arch:'<rect x="28" y="42" width="44" height="48" rx="2"/><path d="M12 42 L12 12 A30 30 0 0 1 42 42 Z"/><path d="M88 42 L88 12 A30 30 0 0 0 58 42 Z"/>',
    boat:'<path d="M12 62 A38 30 0 0 0 88 62 L12 62 Z"/><rect x="48" y="18" width="5" height="44"/><polygon points="53,20 82,45 53,45"/>',
    window:'<rect x="12" y="12" width="34" height="34"/><rect x="54" y="12" width="34" height="34"/><rect x="12" y="54" width="34" height="34"/><rect x="54" y="54" width="34" height="34"/>'
  };
  return `<svg class="sg-composite-svg" viewBox="0 0 100 100" role="img" aria-label="birleşik şekil">${body[figure]||body.house}</svg>`;
}
function compositeFigure(figure){ return `<div class="sg-composite-figure">${compositeFigureSvg(figure)}</div>`; }
function dotGridFigure(figure){ return `<div class="sg-composite-figure sg-dot-grid">${compositeFigureSvg(figure)}</div>`; }
function shapePieceList(pieces){ return `<div class="sg-shape-piece-list">${pieces.map((id,i)=>`<div class="sg-piece-chip">${shapePieceSvg(id)}<b>${i+1}</b></div>`).join('')}</div>`; }
function shapeComposeBuilder(figure,pieces){
  const all=['square','triangle','rect','halfCircle','quarterCircle','circle'];
  const bank=[...pieces];
  for(const id of all){ if(bank.length>=pieces.length+2) break; if(!pieces.includes(id)) bank.push(id); }
  return `<div class="sg-shape-compose-builder"><div class="sg-compose-target"><small>HEDEF FİGÜR</small>${compositeFigureSvg(figure)}</div><div class="sg-compose-bank">${bank.map((id,i)=>`<button type="button" class="sg-compose-piece" data-value="${esc(id)}" aria-label="${esc(id)} parçası ${i+1}">${shapePieceSvg(id)}</button>`).join('')}</div><small>Hedef figürü oluşturan parçaların hepsini seç; fazlalıkları dışarıda bırak.</small></div>`;
}
function shapePatternBuilder(items,options){ return `<div class="sg-shape-pattern-builder"><div class="sg-shape-seq">${items.map(sgShape).join('')}<span class="sg-shape-gap">?</span></div><div class="sg-shape-bank">${options.map(id=>`<button type="button" class="sg-shape-choice" data-value="${esc(id)}">${sgShape(id)}</button>`).join('')}</div></div>`; }
function shapePatternVisual(items){ return `<div class="sg-shape-seq">${items.map(sgShape).join('')}</div>`; }
function balanceFillBuilder(left,rightBase,pool){
  const leftTotal=left.reduce((a,b)=>a+Number(b),0), tokenCount=Math.max(1,Number(pool||0));
  return `<div class="balance-fill-builder" data-right-base="${rightBase}"><div class="builder-balance"><div class="balance-card"><small>SOL</small><b>${left.join(' + ')}</b><em>${leftTotal}</em></div><span>=</span><div class="balance-card"><small>SAĞ</small><b>${rightBase} + <span class="balance-missing">?</span></b><em class="balance-preview-count">${rightBase}</em></div></div><div class="balance-token-pool">${Array.from({length:tokenCount},(_,i)=>`<button type="button" class="balance-token" aria-label="${i+1}. taşı sağ tarafa ekle"></button>`).join('')}</div><small class="pool-caption">Gereken taşları seç; fazla taşları dışarıda bırak.</small></div>`;
}
function equalShelvesStory(left,rightBase){
  const total=left.reduce((a,b)=>a+Number(b),0);
  return `<div class="equal-shelves"><div class="shelf"><span>1. RAF</span><div>${Array.from({length:Math.min(total,14)},()=>'<i></i>').join('')}</div><b>${left.join(' + ')}</b></div><div class="shelf"><span>2. RAF</span><div>${Array.from({length:Math.min(rightBase,14)},()=>'<i class="other"></i>').join('')}</div><b>${rightBase} + ?</b></div></div>`;
}
function storyAddBuilder(initial,pool,targetAdd){
  const slots=Math.max(Number(targetAdd||0)+2,Number(pool||0));
  return `<div class="story-add-builder"><div class="story-start"><span>BAŞLANGIÇ · ${initial}</span><div>${Array.from({length:initial},()=>'<i></i>').join('')}${Array.from({length:slots},()=>'<i class="story-added-slot"></i>').join('')}</div></div><div class="story-add-pool">${Array.from({length:pool},(_,i)=>`<button type="button" class="story-add-token" aria-label="${i+1}. yeni taşı ekle"></button>`).join('')}</div><small class="pool-caption">Hikâyede eklenen kadar taşı seç.</small></div>`;
}
function storyOperationModel(a,b,op){
  return `<div class="story-operation-model"><div class="story-group">${Array.from({length:a},()=>'<i></i>').join('')}<b>${a}</b></div><span>${op}</span><div class="story-group change">${Array.from({length:b},()=>'<i></i>').join('')}<b>${b}</b></div></div>`;
}
function contextChangeStory(a,b,op){
  return `<div class="context-change-story"><div class="context-badge">${a}</div><span>${op}</span><div class="context-badge alt">${b}</div><div class="context-question">?</div></div>`;
}
function patternStepBuilder(seq,candidates){
  const last=seq.at(-1);
  return `<div class="pattern-step-builder" data-last="${last}"><div class="sequence-row">${seq.map(x=>`<span>${x}</span>`).join('')}<span class="pattern-preview">?</span></div><div class="pattern-step-controls">${candidates.map(step=>`<button type="button" class="pattern-step-button" data-step="${step}">${step>0?'+':''}${step}</button>`).join('')}</div><small class="pool-caption">Bir adım seç; son sayı bu adımla ilerleyecek.</small></div>`;
}
function elevatorPattern(start,step,moves){
  const floors=Array.from({length:moves+1},(_,i)=>start+i*step);
  return `<div class="elevator-pattern"><div class="elevator-shaft">${floors.slice().reverse().map((f,i)=>`<div class="floor ${i===0?'target':''}"><span>${f}</span></div>`).join('')}</div><div class="elevator-note">Her hareket <b>${step>0?'+':''}${step}</b></div></div>`;
}
function shapePropertyBuilder(shape,name){
  const straightOptions=[['0','0 düz'],['1','1 düz'],['2','2 düz'],['3','3 düz'],['4','4 düz']];
  const curveOptions=[['0','0 eğri'],['1','1 eğri']];
  const structureOptions=[
    ['3 düz kenar','3 düz kenar'],['4 eşit düz kenar','4 eşit'],['karşılıklı eşit düz kenarlar','karşılıklı eşit'],
    ['yalnız eğri sınır','yalnız eğri'],['1 düz kenar + 1 eğri sınır','1 düz + 1 eğri'],['2 düz kenar + 1 eğri sınır','2 düz + 1 eğri']
  ];
  const row=(group,label,arr)=>`<div class="property-row"><span>${label}</span><div class="property-chip-wrap">${arr.map(([v,l])=>`<button type="button" class="property-chip" data-group="${group}" data-value="${esc(v)}">${esc(l)}</button>`).join('')}</div></div>`;
  return `<div class="shape-property-builder"><div class="shape-builder-target"><div class="shape-visual ${esc(shape)}"></div><b>${esc(name)}</b></div><div class="property-bank">${row('straight','DÜZ',straightOptions)}${row('curves','EĞRİ',curveOptions)}${row('structure','YAPI',structureOptions)}</div></div>`;
}

function solidSvg(kind,rotate=0){
  const label={cube:'küp',cuboid:'dikdörtgen prizma',sphere:'küre',cylinder:'silindir'}[kind]||'geometrik cisim';
  let body='';
  if(kind==='cube'){
    body=`<polygon points="54,42 112,16 166,48 108,76" class="solid-top"/><polygon points="54,42 108,76 108,142 54,108" class="solid-left"/><polygon points="108,76 166,48 166,114 108,142" class="solid-right"/>`;
  }else if(kind==='cuboid'){
    body=`<polygon points="32,54 114,20 184,56 102,90" class="solid-top"/><polygon points="32,54 102,90 102,140 32,104" class="solid-left"/><polygon points="102,90 184,56 184,106 102,140" class="solid-right"/>`;
  }else if(kind==='cylinder'){
    body=`<ellipse cx="108" cy="39" rx="51" ry="18" class="solid-top"/><path d="M57 39v88c0 10 23 18 51 18s51-8 51-18V39" class="solid-cylinder-body"/><ellipse cx="108" cy="127" rx="51" ry="18" class="solid-bottom"/><ellipse cx="108" cy="39" rx="51" ry="18" class="solid-top"/>`;
  }else{
    body=`<circle cx="108" cy="88" r="61" class="solid-sphere-body"/><ellipse cx="108" cy="88" rx="61" ry="20" class="solid-guide"/><path d="M108 27c-22 16-34 37-34 61s12 45 34 61M108 27c22 16 34 37 34 61s-12 45-34 61" class="solid-guide"/>`;
  }
  return `<div class="solid-visual clear-solid" style="--solid-rot:${Number(rotate)||0}deg"><svg viewBox="0 0 216 176" role="img" aria-label="${esc(label)}">${body}</svg></div>`;
}
function solidScene(kind){
  const label={can:'konserve kutusu',ball:'top',dice:'zar',box:'kutu'}[kind]||'günlük nesne';
  let body='';
  if(kind==='can'){
    body=`<ellipse cx="108" cy="35" rx="48" ry="15" class="scene-metal"/><path d="M60 35v94c0 9 22 17 48 17s48-8 48-17V35" class="scene-can"/><ellipse cx="108" cy="129" rx="48" ry="17" class="scene-metal"/><rect x="68" y="66" width="80" height="42" rx="7" class="scene-label"/>`;
  }else if(kind==='ball'){
    body=`<circle cx="108" cy="88" r="61" class="scene-ball"/><path d="M52 88h112M108 27c-18 18-28 39-28 61s10 43 28 61M108 27c18 18 28 39 28 61s-10 43-28 61" class="scene-line"/>`;
  }else if(kind==='dice'){
    body=`<polygon points="54,42 112,16 166,48 108,76" class="scene-dice-top"/><polygon points="54,42 108,76 108,142 54,108" class="scene-dice-left"/><polygon points="108,76 166,48 166,114 108,142" class="scene-dice-right"/><circle cx="83" cy="71" r="5" class="scene-dot"/><circle cx="137" cy="74" r="5" class="scene-dot"/><circle cx="137" cy="102" r="5" class="scene-dot"/><circle cx="80" cy="96" r="5" class="scene-dot"/>`;
  }else{
    body=`<polygon points="28,58 112,22 188,60 104,96" class="scene-box-top"/><polygon points="28,58 104,96 104,145 28,107" class="scene-box-left"/><polygon points="104,96 188,60 188,109 104,145" class="scene-box-right"/><rect x="120" y="83" width="48" height="25" rx="4" class="scene-box-label"/>`;
  }
  return `<div class="solid-scene-visual"><svg viewBox="0 0 216 176" role="img" aria-label="${esc(label)}">${body}</svg></div>`;
}
function solidPropertyBuilder(name,options){
  const rows=[
    ['flat','DÜZ YÜZ',options.flat||[['0','0'],['2','2'],['6','6']],'Düz yüz sayısı'],
    ['curved','EĞRİ YÜZEY',options.curved||[['0','Yok'],['1','1']],'Eğri yüzey'],
    ['face','YÜZ BİÇİMİ',options.face||[['square','Kare'],['rectangle','Dikdörtgen'],['circle','Daire'],['none','Düz yüz yok']],'Düz yüzlerin biçimi']
  ];
  return `<div class="solid-property-builder"><div class="solid-builder-name"><small>HEDEF CİSİM</small><b>${esc(name)}</b></div><div class="solid-property-bank">${rows.map(([group,label,items,aria])=>`<div class="solid-property-row"><span>${label}</span><div>${items.map(([value,text])=>`<button type="button" class="solid-property-chip" data-group="${group}" data-value="${esc(value)}" aria-label="${esc(aria)}: ${esc(text)}">${esc(text)}</button>`).join('')}</div></div>`).join('')}</div></div>`;
}

function lengthAlignBuilder(a,b){
  return `<div class="length-align-builder"><div class="align-canvas"><div class="align-bar blue" style="--len:${a}"></div><div class="align-bar orange" style="--len:${b}"></div><div class="align-origin"></div></div><button type="button" class="align-lengths">Başlangıçları hizala</button><div class="length-choice-row"><button type="button" class="length-choice" data-value="Mavi">Mavi daha uzun</button><button type="button" class="length-choice" data-value="Turuncu">Turuncu daha uzun</button><button type="button" class="length-choice" data-value="Eşit">Eşit</button></div></div>`;
}
function ribbonCompareStory(a,b){
  return `<div class="ribbon-story"><div class="ribbon blue" style="--len:${a}"><span>Mavi</span></div><div class="ribbon orange" style="--len:${b}"><span>Turuncu</span></div><div class="ribbon-start"></div></div>`;
}
function rawDataList(cats,vals){
  return `<div class="raw-data-list">${cats.map((cat,i)=>`<div><b>${esc(cat)}</b><span>${Array.from({length:vals[i]},()=>'<i></i>').join('')}</span></div>`).join('')}</div>`;
}
function pictographRowBuilder(cats,vals,targetIndex){
  const target=cats[targetIndex], max=Math.max(6,...vals);
  return `<div class="pictograph-row-builder"><div class="raw-data-list">${cats.map((cat,i)=>`<div class="${i===targetIndex?'target':''}"><b>${esc(cat)}</b><span>${Array.from({length:vals[i]},()=>'<i></i>').join('')}</span></div>`).join('')}</div><div class="pic-build-target"><b>${esc(target)} grafiği</b><div>${Array.from({length:max},(_,i)=>`<button type="button" class="pic-build-cell" aria-label="${i+1}. grafik sembolü"></button>`).join('')}</div></div></div>`;
}
function interactiveTwentyFrame(target){
  return `<div class="twentyframe-board"><span class="manipulator-note">${target} miktarını kur</span><div class="interactive-twentyframe">${Array.from({length:20},(_,i)=>`<button type="button" aria-label="${i+1}. hücre"></button>`).join('')}</div><div class="target-number-badge">HEDEF <b>${target}</b></div></div>`;
}
function twentyFrameModel(n){
  return `<div class="twentyframe-model">${[0,1].map(frame=>`<div class="model-tenframe">${Array.from({length:10},(_,i)=>`<i class="${frame*10+i<n?'base':''}"></i>`).join('')}</div>`).join('')}</div>`;
}
function beadBundleStory(rest){
  return `<div class="bead-story"><div class="bead-box"><b>10</b><small>boncuk</small></div><span>＋</span><div class="loose-beads">${Array.from({length:rest},()=>'<i></i>').join('')}${rest===0?'<em>0</em>':''}</div></div>`;
}
function twoColorBeadStory(first,second){
  return `<div class="two-color-beads"><div class="bead-group first">${Array.from({length:first},()=>'<i></i>').join('')}<b>${first}</b></div><span>＋</span><div class="bead-group second">${Array.from({length:second},()=>'<i></i>').join('')}<b>${second}</b></div></div>`;
}
function interactiveCompleteTenFrame(initial,pool){
  const tokenCount=Math.max(10-initial,Number(pool||0));
  return `<div class="complete-tenframe-builder" data-base="${initial}"><span class="manipulator-note">Aşağıdaki taşlardan gerekenleri çerçeveye taşı</span><div class="interactive-tenframe">${Array.from({length:10},(_,i)=>`<i class="complete-cell ${i<initial?'base':''}" aria-label="${i<initial?'önceden dolu':'boş'} hücre"></i>`).join('')}</div><div class="complete-token-pool">${Array.from({length:tokenCount},(_,i)=>`<button type="button" class="complete-token" aria-label="${i+1}. taşı yerleştir"></button>`).join('')}</div><small class="pool-caption">Gerekmeyen taşları dışarıda bırakabilirsin.</small></div>`;
}
function tenFrameCompletionModel(base,added){
  const total=base+added, insideAdded=Math.max(0,Math.min(10-base,added)), overflow=Math.max(0,total-10);
  return `<div class="model-tenframe-wrap"><div class="model-tenframe">${Array.from({length:10},(_,i)=>`<i class="${i<base?'base':i<base+insideAdded?'added':''}"></i>`).join('')}</div>${overflow?`<div class="overflow-dots">${Array.from({length:overflow},()=>'<i></i>').join('')}</div>`:''}<div class="model-caption">${base} + ${added}</div></div>`;
}
function addToTenBuilder(a,b){
  return `<div class="add-to-ten-builder" data-base="${a}"><div class="builder-column"><span>İLK GRUP</span><div class="builder-tenframe">${Array.from({length:10},(_,i)=>`<i class="target-cell ${i<a?'base':''}"></i>`).join('')}</div></div><div class="builder-arrow">←</div><div class="builder-column"><span>TAŞIYABİLECEĞİN GRUP · ${b}</span><div class="move-token-pool">${Array.from({length:b},(_,i)=>`<button type="button" class="move-token" aria-label="${i+1}. taşı taşı"></button>`).join('')}</div></div></div>`;
}
function make10SplitModel(a,b,move,rest){
  const total=Math.min(10,a+move);
  return `<div class="split-model"><div class="split-equation">${b} = <b>${move}</b> + ${rest}</div><div class="model-tenframe">${Array.from({length:10},(_,i)=>`<i class="${i<a?'base':i<total?'added':''}"></i>`).join('')}</div><div class="split-rest">kalan <b>${rest}</b></div></div>`;
}
function removeCountersBuilder(total){
  return `<div class="remove-counter-builder"><span class="manipulator-note">Çıkarmak istediğin taşlara dokun</span><div class="remove-token-grid">${Array.from({length:total},(_,i)=>`<button type="button" class="remove-token" aria-label="${i+1}. taş"></button>`).join('')}</div></div>`;
}
function subtractionNumberLineModel(start,steps,end){
  const min=Math.max(0,Math.min(end,start)-1), max=Math.min(20,Math.max(end,start)+1), span=Math.max(1,max-min);
  const pos=n=>((n-min)/span*100);
  return `<div class="mini-numberline"><div class="mini-line"></div><i class="start-dot" style="left:${pos(start)}%"></i><i class="end-dot" style="left:${pos(end)}%"></i><div class="mini-jump" style="left:${Math.min(pos(start),pos(end))}%;width:${Math.abs(pos(start)-pos(end))}%"></div><div class="mini-number-label start" style="left:${pos(start)}%">${start}</div><div class="mini-number-label end" style="left:${pos(end)}%">${end}</div><span>${steps} adım geri</span></div>`;
}
function subtractionDecomposition(v){
  return `<div class="decomposition-card"><div>${v.a}</div><span>− ${v.to10}</span><strong>10</strong><span>− ${v.after10}</span><div>${v.result}</div></div>`;
}
function seatRow(occupied,total){
  return `<div class="seat-row">${Array.from({length:total},(_,i)=>`<i class="${i<occupied?'occupied':''}">${i<occupied?'●':'○'}</i>`).join('')}</div>`;
}
function stickerStory(a,b,op){
  return `<div class="sticker-story"><div class="sticker-pack">${a}<small>başlangıç</small></div><div class="story-op">${esc(op)}</div><div class="sticker-pack second">${b}<small>${op==='+'?'eklenen':'ayrılan'}</small></div></div>`;
}
function interactiveTenFrame(n){
  return `<div style="position:relative;z-index:1;text-align:center"><span class="manipulator-note">Boş hücrelere dokunabilirsin</span><div class="tap-tenframe">${Array.from({length:10},(_,i)=>`<button type="button" class="${i<n?'filled':''}" ${i<n?'disabled':''} aria-label="${i<n?'dolu':'boş'} hücre"></button>`).join('')}</div><div class="manipulator-count">Şu an <b id="manipulatorCount">${n}</b> nokta görünüyor.</div></div>`;
}
function tenFrame(n,cls=''){
  const frames=Math.max(1,Math.ceil(n/10)); let html='';
  for(let f=0;f<frames;f++){ const fill=Math.max(0,Math.min(10,n-f*10)); html+=`<div class="tenframe ${cls}">${Array.from({length:10},(_,i)=>`<i class="${i<fill?'filled':''}"></i>`).join('')}</div>`; }
  return `<div class="tenframe-wrap">${html}</div>`;
}
function numberLine(a,b,max){
  const endValue=a, result=a-b; const start=Math.max(0,result-2), end=Math.min(max,endValue+2), span=Math.max(1,end-start);
  const left=(result-start)/span*100, right=(endValue-start)/span*100;
  return `<div class="numberline"><div class="jump" style="left:${left}%;width:${Math.max(10,right-left)}%"></div><div class="line"></div><div class="ticks">${Array.from({length:11},()=>'<i></i>').join('')}</div><div class="labels"><span>${start}</span><span>${Math.round((start+end)/2)}</span><span>${end}</span></div></div>`;
}
function fractionSvg(denom){
  if(denom===2) return `<svg class="fraction-svg" viewBox="0 0 100 100" aria-label="yarım model"><path d="M50 50 L50 5 A45 45 0 0 1 50 95 Z" fill="#2f9987"/><path d="M50 50 L50 95 A45 45 0 0 1 50 5 Z" fill="#fff"/><circle cx="50" cy="50" r="45" fill="none" stroke="#66716c" stroke-width="2"/><line x1="50" y1="5" x2="50" y2="95" stroke="#66716c" stroke-width="2"/></svg>`;
  return `<svg class="fraction-svg" viewBox="0 0 100 100" aria-label="çeyrek model"><circle cx="50" cy="50" r="45" fill="#fff"/><path d="M50 50 L50 5 A45 45 0 0 1 95 50 Z" fill="#2f9987"/><circle cx="50" cy="50" r="45" fill="none" stroke="#66716c" stroke-width="2"/><line x1="50" y1="5" x2="50" y2="95" stroke="#66716c" stroke-width="2"/><line x1="5" y1="50" x2="95" y2="50" stroke="#66716c" stroke-width="2"/></svg>`;
}
function shapeScene(shape){
  // Reuse the canonical shape renderer so daily-life transfer options preserve
  // half/quarter-circle geometry instead of approximating it with clip paths.
  const safe=['circle','triangle','square','rect','halfCircle','quarterCircle'].includes(shape)?shape:'circle';
  return `<div class="shape-scene has-shape"><div class="shape-visual ${safe}" aria-hidden="true"></div></div>`;
}
function renderSort(mode){
  if(mode==='size') return `<div class="sort-visual"><div class="sort-bin"><i class="sort-item big"></i><i class="sort-item square big"></i></div><div class="sort-bin"><i class="sort-item"></i><i class="sort-item square"></i></div></div>`;
  return `<div class="sort-visual"><div class="sort-bin"><i class="sort-item"></i><i class="sort-item big"></i></div><div class="sort-bin"><i class="sort-item square"></i><i class="sort-item square big"></i></div></div>`;
}
function renderPosition(relation){
  const styles={üstünde:'left:128px;top:5px',altında:'left:128px;top:160px',solunda:'left:28px;top:82px',sağında:'left:228px;top:82px'};
  return `<div class="position-visual"><div class="position-ref"></div><div class="position-dot" style="${styles[relation]||styles.üstünde}"></div></div>`;
}
function renderLengthBars(v){
  const max=Math.max(v.a,v.b,1); const wA=Math.round(v.a/max*94), wB=Math.round(v.b/max*94);
  const shiftBlue=v.misaligned&&v.shift==='blue'?'margin-left:13%;':'';
  const shiftOrange=v.misaligned&&v.shift!=='blue'?'margin-left:13%;':'';
  return `<div class="length-visual"><div class="length-row blue" style="width:${wA}%;${shiftBlue}"></div><div class="length-row orange" style="width:${wB}%;${shiftOrange}"></div></div>`;
}
function renderRuler(n){
  const max=15; const ticks=Array.from({length:max+1},(_,i)=>`<i class="ruler-tick ${i%5===0?'major':''}"><span>${i}</span></i>`).join('');
  return `<div class="ruler"><div class="ruler-object" style="width:${Math.max(10,n/max*96)}%"></div><div class="ruler-track">${ticks}</div></div>`;
}
function renderClock(hour,minute){
  const minuteAngle=minute*6; const hourAngle=(hour%12)*30+minute*.5;
  const hand=(angle,length)=>{ const rad=(angle-90)*Math.PI/180; return [50+Math.cos(rad)*length,50+Math.sin(rad)*length]; };
  const [hx,hy]=hand(hourAngle,25), [mx,my]=hand(minuteAngle,34);
  const nums=Array.from({length:12},(_,i)=>{const n=i+1,rad=(n*30-90)*Math.PI/180,x=50+Math.cos(rad)*40,y=50+Math.sin(rad)*40+1.5;return `<text x="${x}" y="${y}" text-anchor="middle" font-size="6" font-weight="800" fill="#53636b">${n}</text>`;}).join('');
  return `<svg class="clock-svg" viewBox="0 0 100 100" aria-label="analog saat"><circle cx="50" cy="50" r="47" fill="#fffdf8" stroke="#d9d2c3" stroke-width="2"/>${nums}<line x1="50" y1="50" x2="${hx}" y2="${hy}" stroke="#19364b" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="50" x2="${mx}" y2="${my}" stroke="#df7564" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="50" r="3.5" fill="#2f9987"/></svg>`;
}

function registerSW(){ if('serviceWorker' in navigator && (location.protocol==='http:'||location.protocol==='https:')) navigator.serviceWorker.register('./sw.js').catch(()=>{}); }
