from pathlib import Path
import json,re
ROOT=Path('.')
def read(p): return (ROOT/p).read_text(encoding='utf-8')
def write(p,s): (ROOT/p).write_text(s,encoding='utf-8')
def rep(s,a,b,label):
    if a not in s: raise SystemExit(f'{label} anchor missing')
    return s.replace(a,b,1)

engine=read('engine.mjs')
engine=rep(engine,
"""  'number1000','compareOrder1000','numberPattern1000','addSub1000'
]);""",
"""  'number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2'
]);""",'learning set')
engine=rep(engine,
"""  skill('numberPattern1000','grade2','1, 10 ve 100 ile sayı örüntüleri','Örüntü','navy',['number1000']),
  skill('addSub1000','grade2','1000 içinde toplama ve çıkarma','İşlemler','violet',['number1000']),""",
"""  skill('numberPattern1000','grade2','1, 10 ve 100 ile sayı örüntüleri','Örüntü','navy',['number1000']),
  skill('oddEven1000','grade2','1000’e kadar tek ve çift sayılar','Sayılar','green',['number1000']),
  skill('addSub1000','grade2','1000 içinde toplama ve çıkarma','İşlemler','violet',['number1000']),
  skill('wordAddSub2','grade2','1–2 adımlı toplama ve çıkarma problemleri','Problem çözme','teal',['addSub1000']),""",'P2 A2 skills')
engine=rep(engine,
"""  skill('fraction','grade2','Yarım ve çeyrek','Kesir','rose'),
  skill('word2','grade2','İki ilişkiyi birleştiren problem','Problem çözme','navy',['addSub1000']),
  skill('shapes2'""",
"""  skill('fraction','grade2','Yarım ve çeyrek','Kesir','rose'),
  skill('shapes2'""",'remove legacy word2')

case_code=r'''
function oddEven1000Cases(){
  const nums=[112,127,234,249,356,373,482,497,614,629,746,759,862,875,938,953];
  return nums.map(n=>({n,ones:n%10,parity:n%2===0?'Çift':'Tek',leftover:n%2}));
}
function wordAddSub2Cases(){
  const raw=[
    [245,120,85,'+','−','Kütüphanede 245 kitap vardı. 120 yeni kitap geldi, sonra 85 kitap ödünç verildi.'],
    [630,145,90,'−','+','Depoda 630 kutu vardı. 145 kutu gönderildi, sonra 90 kutu geldi.'],
    [175,230,140,'+','+','Bir etkinliğe önce 175, sonra 230, ardından 140 kişi katıldı.'],
    [820,135,210,'−','−','Bir depoda 820 ürün vardı. Önce 135, sonra 210 ürün gönderildi.'],
    [318,126,74,'+','−','Okulda 318 kitap vardı. 126 kitap alındı, ardından 74 kitap başka sınıfa verildi.'],
    [704,208,95,'−','+','Bir mağazada 704 ürün vardı. 208 ürün satıldı, sonra 95 ürün geldi.'],
    [260,115,205,'+','+','Bir koleksiyonda 260 parça vardı. Önce 115, sonra 205 parça eklendi.'],
    [910,240,125,'−','−','Bir kütüphanede 910 kitap vardı. 240 ve ardından 125 kitap ödünç verildi.']
  ];
  return raw.map(([a,b,c,op1,op2,story])=>{
    const first=op1==='+'?a+b:a-b;
    const ans=op2==='+'?first+c:first-c;
    return {a,b,c,op1,op2,first,ans,story};
  });
}
'''
engine=rep(engine,'function number1000Cases(){',case_code+'\nfunction number1000Cases(){','P2 A2 cases')

engine=rep(engine,
"""  if(skillId==='numberPattern1000') return make('one-ten-hundred-patterns-to-1000',pattern1000Cases());
  if(skillId==='addSub1000'){""",
"""  if(skillId==='numberPattern1000') return make('one-ten-hundred-patterns-to-1000',pattern1000Cases());
  if(skillId==='oddEven1000') return make('odd-even-pairing-to-1000',oddEven1000Cases());
  if(skillId==='addSub1000'){""",'odd-even concept')
engine=rep(engine,
"""    return make('addition-subtraction-within-1000',cases);
  }
  if(skillId==='shapes2')""",
"""    return make('addition-subtraction-within-1000',cases);
  }
  if(skillId==='wordAddSub2') return make('one-two-step-add-sub-problems',wordAddSub2Cases());
  if(skillId==='shapes2')""",'word problem concept')

new_generators=r'''
function genOddEven1000(rep,d,rng,concept){
  const c=concept?.skillId==='oddEven1000'?concept:createConceptInstance('oddEven1000',d,rng);
  const x=c.anchor;
  if(rep==='build') return qTask('oddEven1000',rep,`${x.n} sayısının birliklerini ikişerli eşleştir. Kaç birlik eşsiz kalır?`,x.leftover,{kind:'manipulative',interaction:'parity-pair',expectedValue:String(x.leftover),checkLabel:'Eşleştirmeyi kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'Birlikleri ikişerli eşleştir',visual:{type:'parity-pair-builder',n:x.n,ones:x.ones},hint:'Her dokunuşta iki birliği bir çift yap.',explain:x.leftover?`${x.n} için 1 birlik eşsiz kalır; sayı tektir.`:`${x.n} için eşsiz birlik kalmaz; sayı çifttir.`
  });
  if(rep==='see'){
    const opts=shuffled([0,1,2].map((leftover,i)=>({value:leftover===x.leftover?'correct':`wrong-${i}`,visual:{type:'parity-card',n:x.n,ones:x.ones,leftover},ariaLabel:`${x.n} için ${leftover} eşsiz birlik modeli`})),rng);
    return qTask('oddEven1000',rep,`${x.n} sayısının ikişerli eşleşmesini doğru gösteren model hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Eşleşme modelini ayırt et',visual:{type:'numbercard',n:x.n},hint:'Birlikleri ikişerli grupla; 0 ya da 1 birlik artabilir.',explain:`${x.n} ${x.parity.toLowerCase()} sayıdır.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qBase('oddEven1000',rep,`${y.n} sayısını sınıflandır.`,y.parity,semanticChoices(y.parity,[y.parity==='Çift'?'Tek':'Çift','Asal','Belirlenemez'],rng),{
      taskKind:'symbol-entry',taskLabel:'Tek–çift sınıfını matematik diliyle yaz',visual:{type:'equation',text:String(y.n)},hint:'Birler basamağı 0,2,4,6,8 ise sayı çifttir.',explain:`${y.n} ${y.parity.toLowerCase()} sayıdır.`
    });
  }
  if(rep==='explain'){
    const answer='Yüzlük ve onluklar 10’un katıdır; tek–çift durumunu birlik basamağının ikişerli eşleşmesi belirler';
    return qBase('oddEven1000',rep,`${x.n} sayısının tek mi çift mi olduğunu neden yalnız birlik basamağından anlayabiliriz?`,answer,semanticChoices(answer,['Yüzlük basamağı her zaman çifttir diye','Sayıdaki rakamların toplamı her zaman yeterlidir','En büyük rakam tekse sayı da tektir'],rng),{
      taskKind:'reasoning-choice',taskLabel:'Tek–çift kuralını gerekçelendir',visual:{type:'parity-card',n:x.n,ones:x.ones,leftover:x.leftover},hint:'10’un kendisi ikişerli eşleşebilir.',explain:answer+'.'
    });
  }
  const y=c.transfer;
  const answer=y.parity==='Çift'?'Hayır':'Evet';
  return qBase('oddEven1000',rep,`${y.n} öğrenci ikişerli sıraya geçiyor. Bir öğrenci eşsiz kalır mı?`,answer,semanticChoices(answer,[answer==='Evet'?'Hayır':'Evet','İki öğrenci kalır','Sayıya bakmadan bilinemaz'],rng),{
    taskKind:'context-transfer',taskLabel:'Tek–çifti eşli sıra bağlamına taşı',visual:{type:'parity-card',n:y.n,ones:y.ones,leftover:y.leftover},hint:'İkişerli eşleşmede 1 kişi artıyorsa sayı tektir.',explain:y.leftover?'Bir öğrenci eşsiz kalır; sayı tektir.':'Kimse eşsiz kalmaz; sayı çifttir.'
  });
}

function genWordAddSub2(rep,d,rng,concept){
  const c=concept?.skillId==='wordAddSub2'?concept:createConceptInstance('wordAddSub2',d,rng);
  const x=c.anchor, plan=`${x.op1}|${x.op2}`;
  if(rep==='build') return qTask('wordAddSub2',rep,`${x.story} Çözüm için iki işlem kartını doğru sıraya yerleştir.`,plan,{kind:'manipulative',interaction:'two-step-plan',expectedValue:plan,checkLabel:'Planımı kontrol et'}, {
    taskKind:'manipulative-build',taskLabel:'İki adımlı çözüm planını kur',visual:{type:'two-step-plan-builder',a:x.a,b:x.b,c:x.c},hint:'Önce ilk değişimin miktarı artırıp azaltmasına, sonra ikinci değişime bak.',explain:`Plan: önce ${x.a} ${x.op1} ${x.b} = ${x.first}; sonra ${x.first} ${x.op2} ${x.c} = ${x.ans}.`
  });
  if(rep==='see'){
    const variants=[[x.op1,x.op2],[x.op1==='+'?'−':'+',x.op2],[x.op1,x.op2==='+'?'−':'+']];
    const opts=shuffled(variants.map(([op1,op2],i)=>({value:op1===x.op1&&op2===x.op2?'correct':`wrong-${i}`,visual:{type:'two-step-model',a:x.a,b:x.b,c:x.c,op1,op2},ariaLabel:`önce ${op1}, sonra ${op2}`})),rng);
    return qTask('wordAddSub2',rep,`${x.story} Hikâyeye uyan iki adımlı model hangisi?`,'correct',{kind:'visual-choice',options:opts},{
      taskKind:'visual-discrimination',taskLabel:'Hikâye ile iki adımlı modeli eşleştir',visual:{type:'two-step-model',a:x.a,b:x.b,c:x.c,op1:'?',op2:'?'},hint:'“Geldi/eklendi” artış; “gitti/verildi/satıldı” azalıştır.',explain:`Doğru model önce ${x.op1}, sonra ${x.op2} işlemini kullanır.`
    });
  }
  if(rep==='symbol'){
    const y=c.symbol;
    return qTask('wordAddSub2',rep,`${y.story} Sonuç kaçtır?`,y.ans,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Çözümümü kontrol et'}, {
      taskKind:'symbol-entry',taskLabel:'İki adımlı problemi sayısal çöz',visual:{type:'two-step-model',a:y.a,b:y.b,c:y.c,op1:y.op1,op2:y.op2},hint:'İlk işlemin sonucunu ikinci işlemde kullan.',explain:`${y.a} ${y.op1} ${y.b} = ${y.first}; ${y.first} ${y.op2} ${y.c} = ${y.ans}.`
    });
  }
  if(rep==='explain'){
    const answer='İkinci adım, birinci işlemin sonucunu başlangıç miktarı olarak kullanır';
    return qBase('wordAddSub2',rep,'İki adımlı bir problemde neden ilk işlemin sonucunu bulmadan ikinci adıma geçemeyiz?',answer,semanticChoices(answer,['İkinci işlem her zaman toplama olduğu için','Sorudaki en büyük sayıyı kullanmak gerektiği için','İşlem sırası matematikte hiç önemli olmadığı için'],rng),{
      taskKind:'reasoning-choice',taskLabel:'İki adımlı bağımlılığı açıkla',visual:{type:'two-step-model',a:x.a,b:x.b,c:x.c,op1:x.op1,op2:x.op2},hint:'İkinci işlem hangi miktardan başlıyor?',explain:`İlk sonuç ${x.first}; ikinci adım bu yeni miktarı kullanır.`
    });
  }
  const y=c.transfer;
  return qTask('wordAddSub2',rep,`${y.story} Son durumda kaç tane vardır?`,y.ans,{kind:'number-input',placeholder:'?',maxLength:4,checkLabel:'Problemi kontrol et'}, {
    taskKind:'context-transfer',taskLabel:'İki adımlı yapıyı yeni hikâyede kullan',visual:{type:'two-step-model',a:y.a,b:y.b,c:y.c,op1:y.op1,op2:y.op2},hint:'Hikâyeyi iki değişime ayır ve sırayla işle.',explain:`${y.a} ${y.op1} ${y.b} = ${y.first}; ${y.first} ${y.op2} ${y.c} = ${y.ans}.`
  });
}
'''
engine=rep(engine,'function genNumber1000(rep,d,rng,concept){',new_generators+'\nfunction genNumber1000(rep,d,rng,concept){','P2 A2 generators')
engine=rep(engine,
"""  number1000:genNumber1000,compareOrder1000:genCompareOrder1000,numberPattern1000:genNumberPattern1000,addSub1000:genAddSub1000,""",
"""  number1000:genNumber1000,compareOrder1000:genCompareOrder1000,numberPattern1000:genNumberPattern1000,oddEven1000:genOddEven1000,addSub1000:genAddSub1000,wordAddSub2:genWordAddSub2,""",'generator registry')
engine=rep(engine,
"""  number1000:'numbers-to-1000-place-value',compareOrder1000:'compare-order-to-1000',numberPattern1000:'one-ten-hundred-patterns-to-1000',addSub1000:'addition-subtraction-within-1000',""",
"""  number1000:'numbers-to-1000-place-value',compareOrder1000:'compare-order-to-1000',numberPattern1000:'one-ten-hundred-patterns-to-1000',oddEven1000:'odd-even-pairing-to-1000',addSub1000:'addition-subtraction-within-1000',wordAddSub2:'one-two-step-add-sub-problems',""",'concept keys')
engine=rep(engine,
"""  number1000:['number100'],
  addSub1000:['addSub100']""",
"""  number1000:['number100'],
  oddEven1000:['pairing-foundation'],
  addSub1000:['addSub100'],
  wordAddSub2:['word1']""",'readiness overrides')

parity_readiness=r'''
function generateParityReadinessQuestion(difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){
  const source=sourceSkillId||'pairing-foundation';
  const n=randInt(4,9,rng), leftover=n%2, answer=leftover?'Kalır':'Kalmaz';
  const q=qBase('oddEven1000','see',support?'Nesneleri ikişerli eşleşmiş halde incele. Eşsiz nesne kalır mı?':'Bu nesneleri ikişerli eşleştirirsen eşsiz nesne kalır mı?',answer,semanticChoices(answer,[answer==='Kalır'?'Kalmaz':'Kalır','İki tane kalır','Bilinemez'],rng),{
    taskKind:support?'readiness-support':'readiness-check',
    visual:support?{type:'pairing-small',n,leftover}:{type:'objects',n},
    hint:'Nesneleri iki iki düşün.',
    explain:leftover?'Bir nesne eşsiz kalır.':'Bütün nesneler ikişerli eşleşir.',
    countsTowardEvidence:false
  });
  return relabelReadinessQuestion(q,'oddEven1000',source,{support,rng});
}

'''
engine=rep(engine,'function generateTimeReadinessQuestion',parity_readiness+'function generateTimeReadinessQuestion','parity readiness function')
engine=rep(engine,
"""function generateReadinessQuestion(skillId,difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){
  if(skillId==='time1') return generateTimeReadinessQuestion(difficulty,rng,{support,sourceSkillId});""",
"""function generateReadinessQuestion(skillId,difficulty=1,rng=Math.random,{support=false,sourceSkillId=null}={}){
  if(skillId==='time1') return generateTimeReadinessQuestion(difficulty,rng,{support,sourceSkillId});
  if(skillId==='oddEven1000') return generateParityReadinessQuestion(difficulty,rng,{support,sourceSkillId});""",'parity readiness route')
write('engine.mjs',engine)

# app interactions/rendering
app=read('app.js')
app=rep(app,
".sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach",
".sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one,.sg-pair-action,.sg-plan-op').forEach",'disable A2 controls')
wire="""  if(interaction==='base1000-build'){
    const root=$('.sg-base1000-builder');
    root?.querySelectorAll('.sg-base1000-hundred,.sg-base1000-ten,.sg-base1000-one').forEach(btn=>btn.addEventListener('click',()=>{ if(answered)return; btn.classList.toggle('selected'); updateManipulatorStatus(q); }));
  }"""
wire_new=wire+"""
  if(interaction==='parity-pair'){
    const root=$('.sg-parity-builder');
    root?.querySelector('.sg-pair-action')?.addEventListener('click',()=>{
      if(answered)return;
      const free=[...root.querySelectorAll('.sg-pair-token:not(.paired)')];
      if(free.length>=2){ free[0].classList.add('paired'); free[1].classList.add('paired'); }
      updateManipulatorStatus(q);
    });
  }
  if(interaction==='two-step-plan'){
    const root=$('.sg-two-step-plan');
    root?.querySelectorAll('.sg-plan-op').forEach(btn=>btn.addEventListener('click',()=>{
      if(answered)return;
      const step=btn.dataset.step;
      root.querySelectorAll(`.sg-plan-op[data-step=\"${step}\"]`).forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected'); updateManipulatorStatus(q);
    }));
  }"""
app=rep(app,wire,wire_new,'A2 wire')
app=rep(app,
"""  if(interaction==='base1000-build') return `${$$('.sg-base1000-builder .sg-base1000-hundred.selected').length}|${$$('.sg-base1000-builder .sg-base1000-ten.selected').length}|${$$('.sg-base1000-builder .sg-base1000-one.selected').length}`;""",
"""  if(interaction==='base1000-build') return `${$$('.sg-base1000-builder .sg-base1000-hundred.selected').length}|${$$('.sg-base1000-builder .sg-base1000-ten.selected').length}|${$$('.sg-base1000-builder .sg-base1000-one.selected').length}`;
  if(interaction==='parity-pair') return $$('.sg-parity-builder .sg-pair-token:not(.paired)').length;
  if(interaction==='two-step-plan'){
    const a=$('.sg-two-step-plan .sg-plan-op.selected[data-step="1"]')?.dataset.value, b=$('.sg-two-step-plan .sg-plan-op.selected[data-step="2"]')?.dataset.value;
    return a&&b?`${a}|${b}`:null;
  }""",'A2 readers')
app=rep(app,
"""  else if(q.response?.interaction==='base1000-build') { const [h='0',t='0',o='0']=String(value).split('|'); node.textContent=`Modelin: ${h} yüzlük · ${t} onluk · ${o} birlik`; }""",
"""  else if(q.response?.interaction==='base1000-build') { const [h='0',t='0',o='0']=String(value).split('|'); node.textContent=`Modelin: ${h} yüzlük · ${t} onluk · ${o} birlik`; }
  else if(q.response?.interaction==='parity-pair') node.textContent=`Eşsiz kalan birlik: ${value}`;
  else if(q.response?.interaction==='two-step-plan') node.textContent=value?`Planın: ${String(value).replace('|',' → ')}`:'1. ve 2. işlem kartlarını seç';""",'A2 status')

app=rep(app,"    case 'base1000': return", """    case 'pairing-small': return pairingSmallVisual(v.n,v.leftover);
    case 'parity-pair-builder': return parityPairBuilder(v.n,v.ones);
    case 'parity-card': return parityCardVisual(v.n,v.ones,v.leftover);
    case 'two-step-plan-builder': return twoStepPlanBuilder(v.a,v.b,v.c);
    case 'two-step-model': return twoStepModelVisual(v.a,v.b,v.c,v.op1,v.op2);
    case 'base1000': return""",'A2 render cases')
helper_anchor='function base1000BuildControls(maxHundreds=10,maxTens=9,maxOnes=9){'
helper_code=r'''function pairingSmallVisual(n,leftover){
  const pairs=Math.floor(n/2);
  return `<div class="sg-pairing-small">${Array.from({length:pairs},()=>'<span><i></i><i></i></span>').join('')}${leftover?'<b></b>':''}</div>`;
}
function parityPairBuilder(n,ones){
  return `<div class="sg-parity-builder"><div class="sg-target-pill">SAYI <b>${n}</b></div><small>Birlikleri ikişerli eşleştir</small><div class="sg-pair-token-row">${Array.from({length:ones},()=>'<i class="sg-pair-token"></i>').join('')}</div><button type="button" class="sg-pair-action">Bir çift oluştur</button></div>`;
}
function parityCardVisual(n,ones,leftover){
  const paired=Math.max(0,ones-Number(leftover||0));
  return `<div class="sg-parity-card"><b>${n}</b><div>${Array.from({length:paired},(_,i)=>`<i class="${i%2?'pair-end':'pair-start'}"></i>`).join('')}${Array.from({length:Number(leftover)||0},()=>'<em></em>').join('')}</div></div>`;
}
function twoStepPlanBuilder(a,b,c){
  const row=step=>`<div><small>${step}. ADIM</small><button type="button" class="sg-plan-op" data-step="${step}" data-value="+">＋</button><button type="button" class="sg-plan-op" data-step="${step}" data-value="−">−</button></div>`;
  return `<div class="sg-two-step-plan"><div class="sg-plan-facts"><span>${a}</span><span>${b}</span><span>${c}</span></div>${row(1)}${row(2)}</div>`;
}
function twoStepModelVisual(a,b,c,op1,op2){
  return `<div class="sg-two-step-model"><div><span>${a}</span><strong>${esc(op1)}</strong><span>${b}</span><i>→</i><b>?</b></div><div><b>?</b><strong>${esc(op2)}</strong><span>${c}</span><i>→</i><b>?</b></div></div>`;
}
'''
app=rep(app,helper_anchor,helper_code+helper_anchor,'A2 helpers')
write('app.js',app)

css=read('styles.css')
css_add=r'''

/* v1.4.1 — P2 odd/even pairing + two-step problem planning */
.sg-pairing-small,.sg-pair-token-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;position:relative;z-index:1}.sg-pairing-small span{display:flex;gap:3px;padding:7px;border-radius:12px;background:var(--teal-soft)}.sg-pairing-small i,.sg-pairing-small b,.sg-pair-token{width:18px;height:18px;border-radius:50%;background:var(--teal);display:block}.sg-pairing-small b{background:var(--coral)}
.sg-parity-builder{display:grid;gap:14px;justify-items:center;width:min(520px,100%);position:relative;z-index:1}.sg-parity-builder>small{font-size:10px;font-weight:900;color:var(--muted)}.sg-pair-token{transition:transform .18s ease,opacity .18s ease}.sg-pair-token.paired{opacity:.38;transform:scale(.82);box-shadow:0 0 0 4px var(--teal-soft)}.sg-pair-action{min-height:48px;padding:0 18px;border-radius:16px;background:var(--navy);color:white;font-weight:900}.sg-parity-card{display:grid;gap:10px;justify-items:center;border:1px solid var(--line);border-radius:18px;background:var(--paper);padding:15px}.sg-parity-card>b{font-size:26px}.sg-parity-card>div{display:flex;gap:5px;flex-wrap:wrap;justify-content:center}.sg-parity-card i,.sg-parity-card em{width:15px;height:15px;border-radius:50%;display:block}.sg-parity-card i{background:var(--teal)}.sg-parity-card i.pair-start{margin-left:5px}.sg-parity-card em{background:var(--coral);box-shadow:0 0 0 3px var(--coral-soft)}
.sg-two-step-plan{display:grid;gap:12px;width:min(520px,100%);position:relative;z-index:1}.sg-plan-facts{display:flex;justify-content:center;gap:10px}.sg-plan-facts span{padding:9px 13px;border-radius:13px;background:var(--paper);border:1px solid var(--line);font-weight:900}.sg-two-step-plan>div:not(.sg-plan-facts){display:grid;grid-template-columns:1fr 62px 62px;gap:8px;align-items:center;background:var(--paper);border:1px solid var(--line);border-radius:17px;padding:10px}.sg-two-step-plan small{font-size:10px;font-weight:950;color:var(--muted)}.sg-plan-op{height:46px;border-radius:13px;background:var(--paper-2);border:1px solid var(--line);font-size:22px;font-weight:950}.sg-plan-op.selected{background:var(--navy);color:white;border-color:var(--navy)}.sg-two-step-model{display:grid;gap:10px;width:min(500px,100%);position:relative;z-index:1}.sg-two-step-model>div{display:flex;gap:9px;justify-content:center;align-items:center;border:1px solid var(--line);border-radius:17px;background:var(--paper);padding:13px}.sg-two-step-model span,.sg-two-step-model b{font-size:20px}.sg-two-step-model strong{font-size:22px}.sg-two-step-model i{font-style:normal;color:var(--muted)}
'''
if 'P2 odd/even pairing + two-step problem planning' not in css: css+=css_add
write('styles.css',css)

# tests
et=read('tests/engine.test.mjs')
et=rep(et,
"""const P2_A1_SKILLS=['number1000','compareOrder1000','numberPattern1000','addSub1000'];
assert.deepEqual(skillsFor('grade2').slice(0,4).map(s=>s.id),P2_A1_SKILLS,'Primary 2 A1 foundation graph changed unexpectedly');""",
"""const P2_A1_SKILLS=['number1000','compareOrder1000','numberPattern1000','addSub1000'];
const P2_A2_SKILLS=['oddEven1000','wordAddSub2'];
const P2_REFERENCE_SKILLS=[...P2_A1_SKILLS,...P2_A2_SKILLS];
assert.deepEqual(skillsFor('grade2').filter(s=>P2_REFERENCE_SKILLS.includes(s.id)).map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2'],'Primary 2 reference graph changed unexpectedly');""",'engine A2 ids')
et=rep(et,"for(const legacy of ['place100','add100','sub100','numberPattern2'])", "for(const legacy of ['place100','add100','sub100','numberPattern2','word2'])",'legacy word guard')
et=rep(et,'for(const skillId of P2_A1_SKILLS){','for(const skillId of P2_REFERENCE_SKILLS){','combined P2 quality')
cover="""const p2NumberBuild=generateQuestion('number1000','build',2,seeded,createConceptInstance('number1000',2,seeded));"""
extra="""const seenParity=new Set(), seenWordPlans=new Set();
for(let i=0;i<400;i++){
  const o=createConceptInstance('oddEven1000',2,seeded); seenParity.add(o.anchor.parity);
  const w=createConceptInstance('wordAddSub2',2,seeded); seenWordPlans.add(`${w.anchor.op1}|${w.anchor.op2}`);
}
assert.deepEqual([...seenParity].sort(),['Tek','Çift'].sort(),'P2 odd/even must cover both classes');
for(const plan of ['+|−','−|+','+|+','−|−']) assert.ok(seenWordPlans.has(plan),`P2 two-step problem plan missing ${plan}`);
const oddBuild=generateQuestion('oddEven1000','build',2,seeded,createConceptInstance('oddEven1000',2,seeded));
assert.equal(oddBuild.response.interaction,'parity-pair');
const wordBuild=generateQuestion('wordAddSub2','build',2,seeded,createConceptInstance('wordAddSub2',2,seeded));
assert.equal(wordBuild.response.interaction,'two-step-plan');

"""
et=rep(et,cover,extra+cover,'A2 coverage tests')
write('tests/engine.test.mjs',et)

lc=read('tests/learning-cycle.test.mjs')
lc=rep(lc,
"""const p2A1=skillsFor('grade2').filter(s=>supportsLearningCycle(s.id));
assert.deepEqual(p2A1.map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','addSub1000']);
for(const [i,skill] of p2A1.entries()){ """.replace('{ ','{'),
"""const p2Reference=skillsFor('grade2').filter(s=>supportsLearningCycle(s.id));
assert.deepEqual(p2Reference.map(s=>s.id),['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2']);
for(const [i,skill] of p2Reference.entries()){ """.replace('{ ','{'),'learning A2 list')
lc=rep(lc,"assert.deepEqual(readinessSourcesFor('addSub1000'),['addSub100']);",
"""assert.deepEqual(readinessSourcesFor('addSub1000'),['addSub100']);
assert.deepEqual(readinessSourcesFor('oddEven1000'),['pairing-foundation']);
assert.deepEqual(readinessSourcesFor('wordAddSub2'),['word1']);""",'A2 readiness asserts')
write('tests/learning-cycle.test.mjs',lc)

ui=read('tests/ui-static.test.mjs')
ui=rep(ui,"'sg-base1000-builder','sg-order-builder'","'sg-base1000-builder','sg-parity-builder','sg-two-step-plan','sg-order-builder'",'A2 CSS tests')
ui=rep(ui,"'base1000-build','order-pair'","'base1000-build','parity-pair','two-step-plan','order-pair'",'A2 interaction tests')
ui=rep(ui,"'base1000-operation-build','compare-base1000','column-operation'","'base1000-operation-build','compare-base1000','pairing-small','parity-pair-builder','parity-card','two-step-plan-builder','two-step-model','column-operation'",'A2 visual tests')
ui=rep(ui,"['number1000','compareOrder1000','numberPattern1000','addSub1000'].includes(s.id)","['number1000','compareOrder1000','numberPattern1000','oddEven1000','addSub1000','wordAddSub2'].includes(s.id)",'A2 render audit')
write('tests/ui-static.test.mjs',ui)

pkg=json.loads(read('package.json')); pkg['version']='1.4.1'; write('package.json',json.dumps(pkg,ensure_ascii=False,indent=2)+'\n')
sw=read('sw.js'); sw=re.sub(r"const CACHE='[^']+';","const CACHE='saymera-v1-4-1-p2-a2';",sw,count=1); write('sw.js',sw)

matrix=read('TASK_MIGRATION_MATRIX.md')
matrix=matrix.replace('# SAYMERA v1.4.0 — Görev Motoru Geçiş Matrisi','# SAYMERA v1.4.1 — Görev Motoru Geçiş Matrisi')
matrix=rep(matrix,
"""| 2. sınıf | `numberPattern1000` | 1/10/100 ile sayı örüntüleri | **P2-REFERENCE** |
| 2. sınıf | `addSub1000` | 1000 içinde toplama/çıkarma | **P2-REFERENCE** |
| 2. sınıf | `multiply5`""",
"""| 2. sınıf | `numberPattern1000` | 1/10/100 ile sayı örüntüleri | **P2-REFERENCE** |
| 2. sınıf | `oddEven1000` | 1000’e kadar tek/çift sayılar | **P2-REFERENCE** |
| 2. sınıf | `addSub1000` | 1000 içinde toplama/çıkarma | **P2-REFERENCE** |
| 2. sınıf | `wordAddSub2` | 1–2 adımlı toplama/çıkarma problemleri | **P2-REFERENCE** |
| 2. sınıf | `multiply5`""",'matrix A2 rows')
matrix=matrix.replace('| 2. sınıf | `word2` | İki ilişkili problem | LEGACY |\n','')
matrix=re.sub(r"Toplam: \*\*43 beceri\*\*\.[^\n]*","Toplam: **44 beceri**. Bunun **22'si P1-REFERENCE**, **6'sı P2-REFERENCE**, **1'i Grade 2 REFERENCE** ve **15'i LEGACY** durumundadır.",matrix)
write('TASK_MIGRATION_MATRIX.md',matrix)

p2=read('SINGAPORE_P2_COVERAGE.md')
progress=r'''

## Uygulama ilerlemesi — v1.4.1 / P2-A2

P2 sayı ve toplama/çıkarma temel katmanı genişletildi:

- `oddEven1000` — birliklerin ikişerli eşleşmesinden tek/çift genellemesine
- `wordAddSub2` — dört farklı iki-adımlı işlem planı (`+−`, `−+`, `++`, `−−`) ve bağımlı ara sonuç mantığı

Her iki beceri de gerçek ön-bilgi kontrolü, beş ayrı görev ailesi, adaptif pekiştirme ve gecikmeli geri çağırma sözleşmesine dahildir. Eski `word2` görünür içerik haritasından çıkarılmıştır.

Sıradaki katman: P2-B — 2/3/4/5/10 çarpım tabloları, bölme ve kesirler.
'''
if 'v1.4.1 / P2-A2' not in p2: p2+=progress
write('SINGAPORE_P2_COVERAGE.md',p2)
print('v1.4.1 Singapore P2-A2 migration staged')
