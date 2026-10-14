const tasks = {
  net: [
    {prompt:'AgNO₃ + NaCl → AgCl↓ + NaNO₃', answer:'Ag⁺ + Cl⁻ → AgCl↓', options:['Ag⁺ + Cl⁻ → AgCl↓','Na⁺ + NO₃⁻ → NaNO₃','AgNO₃ + Cl⁻ → AgCl↓ + NO₃⁻','Ag⁺ + NO₃⁻ → AgNO₃'], explanation:'Ag⁺ і Cl⁻ утворюють малорозчинний AgCl. Na⁺ і NO₃⁻ є йонами-спостерігачами.'},
    {prompt:'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl', answer:'Ba²⁺ + SO₄²⁻ → BaSO₄↓', options:['Ba²⁺ + SO₄²⁻ → BaSO₄↓','2Na⁺ + 2Cl⁻ → 2NaCl','Ba²⁺ + 2Cl⁻ → BaCl₂','2Na⁺ + SO₄²⁻ → Na₂SO₄'], explanation:'Ba²⁺ і SO₄²⁻ утворюють осад BaSO₄; Na⁺ і Cl⁻ не змінюються.'},
    {prompt:'HCl + NaOH → NaCl + H₂O', answer:'H⁺ + OH⁻ → H₂O', options:['H⁺ + OH⁻ → H₂O','Na⁺ + Cl⁻ → NaCl','H⁺ + Cl⁻ → HCl','Na⁺ + OH⁻ → NaOH'], explanation:'Під час нейтралізації безпосередньо взаємодіють H⁺ і OH⁻, утворюючи воду.'},
    {prompt:'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑', answer:'CO₃²⁻ + 2H⁺ → H₂O + CO₂↑', options:['CO₃²⁻ + 2H⁺ → H₂O + CO₂↑','2Na⁺ + 2Cl⁻ → 2NaCl','Na₂CO₃ + 2H⁺ → 2Na⁺ + H₂O + CO₂↑','2H⁺ + 2Cl⁻ → 2HCl'], explanation:'Карбонат-іон у кислому середовищі в підсумку дає CO₂ і H₂O; Na⁺ та Cl⁻ є спостерігачами.'},
    {prompt:'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', answer:'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓', options:['Cu²⁺ + 2OH⁻ → Cu(OH)₂↓','2Na⁺ + SO₄²⁻ → Na₂SO₄','Cu²⁺ + SO₄²⁻ → CuSO₄','2Na⁺ + 2OH⁻ → 2NaOH'], explanation:'Cu²⁺ і OH⁻ утворюють малорозчинний Cu(OH)₂.'},
    {prompt:'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl', answer:'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓', options:['Fe³⁺ + 3OH⁻ → Fe(OH)₃↓','3Na⁺ + 3Cl⁻ → 3NaCl','Fe³⁺ + 3Cl⁻ → FeCl₃','3Na⁺ + 3OH⁻ → 3NaOH'], explanation:'Fe³⁺ і OH⁻ утворюють осад Fe(OH)₃; Na⁺ і Cl⁻ скорочуються.'},
    {prompt:'CaCl₂ + Na₂CO₃ → CaCO₃↓ + 2NaCl', answer:'Ca²⁺ + CO₃²⁻ → CaCO₃↓', options:['Ca²⁺ + CO₃²⁻ → CaCO₃↓','2Na⁺ + 2Cl⁻ → 2NaCl','Ca²⁺ + 2Cl⁻ → CaCl₂','2Na⁺ + CO₃²⁻ → Na₂CO₃'], explanation:'Ca²⁺ і CO₃²⁻ утворюють малорозчинний CaCO₃.'}
  ],
  spectator: [
    {prompt:'AgNO₃ + NaCl → AgCl↓ + NaNO₃', answer:'Na⁺ і NO₃⁻', options:['Na⁺ і NO₃⁻','Ag⁺ і Cl⁻','Ag⁺ і NO₃⁻','Na⁺ і Cl⁻'], explanation:'Na⁺ і NO₃⁻ є зліва і справа в однаковій формі, тому вони не беруть безпосередньої участі в утворенні AgCl.'},
    {prompt:'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl', answer:'Na⁺ і Cl⁻', options:['Na⁺ і Cl⁻','Ba²⁺ і SO₄²⁻','Ba²⁺ і Cl⁻','Na⁺ і SO₄²⁻'], explanation:'Na⁺ і Cl⁻ залишаються у розчині без зміни.'},
    {prompt:'HCl + NaOH → NaCl + H₂O', answer:'Na⁺ і Cl⁻', options:['Na⁺ і Cl⁻','H⁺ і OH⁻','H⁺ і Cl⁻','Na⁺ і OH⁻'], explanation:'H⁺ і OH⁻ утворюють H₂O, а Na⁺ і Cl⁻ не змінюються.'},
    {prompt:'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑', answer:'Na⁺ і Cl⁻', options:['Na⁺ і Cl⁻','H⁺ і CO₃²⁻','Na⁺ і CO₃²⁻','H⁺ і Cl⁻'], explanation:'У скороченому рівнянні залишаються CO₃²⁻ і H⁺; Na⁺ та Cl⁻ скорочуються.'},
    {prompt:'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', answer:'Na⁺ і SO₄²⁻', options:['Na⁺ і SO₄²⁻','Cu²⁺ і OH⁻','Cu²⁺ і SO₄²⁻','Na⁺ і OH⁻'], explanation:'Cu²⁺ і OH⁻ утворюють осад, а Na⁺ і SO₄²⁻ є йонами-спостерігачами.'},
    {prompt:'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl', answer:'Na⁺ і Cl⁻', options:['Na⁺ і Cl⁻','Fe³⁺ і OH⁻','Fe³⁺ і Cl⁻','Na⁺ і OH⁻'], explanation:'Fe³⁺ та OH⁻ утворюють осад Fe(OH)₃; Na⁺ і Cl⁻ не змінюються.'}
  ],
  dissociation: [
    {prompt:'Що у повному йонному рівнянні залишають формулою?', answer:'AgCl↓', options:['AgCl↓','NaCl(aq)','AgNO₃(aq)','NaNO₃(aq)'], explanation:'AgCl є малорозчинним осадом, тому його не розписують на окремі йони.'},
    {prompt:'Що у повному йонному рівнянні записують як йони?', answer:'NaCl(aq)', options:['NaCl(aq)','H₂O','CO₂↑','AgCl↓'], explanation:'Розчинний сильний електроліт NaCl у водному розчині записують як Na⁺ + Cl⁻.'},
    {prompt:'Який запис правильний для Na₂SO₄(aq) у повному йонному рівнянні?', answer:'2Na⁺ + SO₄²⁻', options:['2Na⁺ + SO₄²⁻','Na₂⁺ + SO₄²⁻','Na⁺ + SO₄⁻','Na₂SO₄'], explanation:'Одна формульна одиниця Na₂SO₄ відповідає двом Na⁺ і одному SO₄²⁻.'},
    {prompt:'Який запис правильний для CaCl₂(aq) у повному йонному рівнянні?', answer:'Ca²⁺ + 2Cl⁻', options:['Ca²⁺ + 2Cl⁻','2Ca⁺ + Cl₂⁻','Ca⁺ + 2Cl⁻','CaCl₂'], explanation:'CaCl₂ у розчині дає один Ca²⁺ і два Cl⁻.'},
    {prompt:'Що не розписують на йони під час нейтралізації?', answer:'H₂O', options:['H₂O','HCl(aq)','NaOH(aq)','NaCl(aq)'], explanation:'Воду в шкільному повному йонному рівнянні залишають молекулою.'},
    {prompt:'Що залишають молекулою в реакції карбонату з кислотою?', answer:'CO₂↑', options:['CO₂↑','NaCl(aq)','HCl(aq)','Na₂CO₃(aq)'], explanation:'Газ CO₂ не розписують на йони.'},
    {prompt:'Який запис правильний для FeCl₃(aq)?', answer:'Fe³⁺ + 3Cl⁻', options:['Fe³⁺ + 3Cl⁻','3Fe⁺ + Cl₃⁻','Fe²⁺ + 3Cl⁻','FeCl₃'], explanation:'FeCl₃ у водному розчині записують як Fe³⁺ + 3Cl⁻.'}
  ]
};

const modeButtons=[...document.querySelectorAll('.mode-button')];
const taskCounter=document.getElementById('taskCounter');
const scoreCounter=document.getElementById('scoreCounter');
const taskKicker=document.getElementById('taskKicker');
const taskPrompt=document.getElementById('taskPrompt');
const answerGrid=document.getElementById('answerGrid');
const feedback=document.getElementById('feedback');
const restartButton=document.getElementById('restartButton');
const nextButton=document.getElementById('nextButton');
let mode='net', round=[], index=0, score=0, locked=false;

function shuffle(arr){return [...arr].sort(()=>Math.random()-.5)}
function sourceForMode(){
  if(mode==='mixed') return [
    ...tasks.net.map(t=>({...t,source:'net'})),
    ...tasks.spectator.map(t=>({...t,source:'spectator'})),
    ...tasks.dissociation.map(t=>({...t,source:'dissociation'}))
  ];
  return tasks[mode].map(t=>({...t,source:mode}));
}
function startRound(){
  const source=sourceForMode();
  round=shuffle(source).slice(0,Math.min(10,source.length));
  index=0; score=0; locked=false; renderTask();
}
function kickerFor(t){
  const type=mode==='mixed'?(t.source||'net'):mode;
  if(type==='spectator') return 'Знайдіть йони-спостерігачі';
  if(type==='dissociation') return 'Проаналізуйте повний йонний запис';
  return 'Оберіть скорочене йонне рівняння';
}
function renderTask(){
  locked=false; nextButton.disabled=true;
  const t=round[index];
  taskCounter.textContent=`${index+1} / ${round.length}`;
  scoreCounter.textContent=`${score} правильних`;
  taskKicker.textContent=kickerFor(t);
  taskPrompt.textContent=t.prompt;
  feedback.removeAttribute('data-state');
  feedback.innerHTML='<strong>Оберіть відповідь.</strong><span>Після вибору тут з’явиться пояснення.</span>';
  answerGrid.innerHTML='';
  shuffle(t.options).forEach(option=>{
    const btn=document.createElement('button');
    btn.type='button'; btn.className='answer-option formula-option'; btn.textContent=option;
    btn.addEventListener('click',()=>choose(btn,option)); answerGrid.appendChild(btn);
  });
}
function choose(btn,option){
  if(locked)return; locked=true;
  const t=round[index]; const correct=option===t.answer;
  if(correct){score++;btn.classList.add('is-correct');feedback.dataset.state='correct';feedback.innerHTML=`<strong>Правильно.</strong><span>${t.explanation}</span>`;}
  else{btn.classList.add('is-wrong');[...answerGrid.children].forEach(b=>{if(b.textContent===t.answer)b.classList.add('is-correct')});feedback.dataset.state='review';feedback.innerHTML=`<strong>Правильна відповідь: ${t.answer}</strong><span>${t.explanation}</span>`;}
  [...answerGrid.children].forEach(b=>b.disabled=true);scoreCounter.textContent=`${score} правильних`;nextButton.disabled=false;nextButton.textContent=index===round.length-1?'Показати результат':'Наступне завдання';
}
function finish(){
  taskCounter.textContent=`${round.length} / ${round.length}`; taskKicker.textContent='Раунд завершено'; taskPrompt.textContent=`${score} із ${round.length}`; answerGrid.innerHTML='';
  const percent=Math.round(score/round.length*100); let text='Повторіть алгоритм і пройдіть раунд ще раз.'; if(percent>=90)text='Дуже впевнене розуміння йонного запису.'; else if(percent>=70)text='Добрий результат. Перегляньте пояснення до помилок.';
  feedback.dataset.state=percent>=70?'correct':'review';feedback.innerHTML=`<strong>${percent}% правильних відповідей</strong><span>${text}</span>`;nextButton.disabled=false;nextButton.textContent='Новий раунд';
}
nextButton.addEventListener('click',()=>{if(index===round.length-1){finish();index=round.length;}else if(index>=round.length){startRound()}else{index++;renderTask()}});
restartButton.addEventListener('click',startRound);
modeButtons.forEach(btn=>btn.addEventListener('click',()=>{modeButtons.forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');mode=btn.dataset.mode;startRound()}));
startRound();