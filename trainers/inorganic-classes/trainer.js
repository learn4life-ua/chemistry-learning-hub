const ITEMS = [
  {formula:'CaO', className:'Оксид', explanation:'CaO містить два елементи, один із яких Оксиген. Це оксид кальцію.'},
  {formula:'CO₂', className:'Оксид', explanation:'CO₂ - бінарна сполука Карбону з Оксигеном, тому це оксид.'},
  {formula:'SO₃', className:'Оксид', explanation:'SO₃ складається із Сульфуру й Оксигену, отже належить до оксидів.'},
  {formula:'MgO', className:'Оксид', explanation:'MgO - бінарна сполука Магнію з Оксигеном, тобто оксид.'},
  {formula:'HCl', className:'Кислота', explanation:'HCl у водному розчині розглядають як хлоридну кислоту. Формула містить Гідроген і кислотний залишок Cl⁻.'},
  {formula:'H₂SO₄', className:'Кислота', explanation:'H₂SO₄ - сульфатна кислота: містить атоми Гідрогену та кислотний залишок SO₄²⁻.'},
  {formula:'HNO₃', className:'Кислота', explanation:'HNO₃ - нітратна кислота. У формулі є Гідроген і нітратний кислотний залишок.'},
  {formula:'H₃PO₄', className:'Кислота', explanation:'H₃PO₄ - ортофосфатна кислота: Гідроген поєднаний з кислотним залишком PO₄³⁻.'},
  {formula:'NaOH', className:'Основа', explanation:'NaOH складається з катіона Na⁺ і гідроксид-іона OH⁻, тому це основа.'},
  {formula:'KOH', className:'Основа', explanation:'KOH містить катіон K⁺ і гідроксид-групу OH, отже це основа.'},
  {formula:'Ca(OH)₂', className:'Основа', explanation:'Ca(OH)₂ містить катіон Ca²⁺ і дві гідроксид-групи OH, тому це основа.'},
  {formula:'Cu(OH)₂', className:'Основа', explanation:'Cu(OH)₂ - нерозчинна основа: містить катіон Cu²⁺ і гідроксид-іони OH⁻.'},
  {formula:'NaCl', className:'Сіль', explanation:'NaCl складається з катіона Na⁺ та хлорид-іона Cl⁻, тому це сіль.'},
  {formula:'K₂SO₄', className:'Сіль', explanation:'K₂SO₄ складається з катіонів K⁺ і сульфат-іона SO₄²⁻, отже це сіль.'},
  {formula:'CaCO₃', className:'Сіль', explanation:'CaCO₃ містить катіон Ca²⁺ та карбонат-іон CO₃²⁻, тому це сіль.'},
  {formula:'CuSO₄', className:'Сіль', explanation:'CuSO₄ складається з катіона Cu²⁺ та сульфат-іона SO₄²⁻, отже це сіль.'},
  {formula:'NH₄Cl', className:'Сіль', explanation:'NH₄Cl складається з катіона амонію NH₄⁺ та хлорид-іона Cl⁻, тому це сіль.'},
  {formula:'(NH₄)₂CO₃', className:'Сіль', explanation:'(NH₄)₂CO₃ містить катіони NH₄⁺ та карбонат-іон CO₃²⁻, тому це сіль.'}
];

const CLASSES = ['Оксид','Кислота','Основа','Сіль'];
const ROUND_SIZE = 10;
let mode = 'formula-to-class';
let round = [];
let index = 0;
let score = 0;
let answered = false;

const els = {
  taskCounter: document.getElementById('taskCounter'),
  scoreCounter: document.getElementById('scoreCounter'),
  taskKicker: document.getElementById('taskKicker'),
  taskPrompt: document.getElementById('taskPrompt'),
  answerGrid: document.getElementById('answerGrid'),
  feedback: document.getElementById('feedback'),
  nextButton: document.getElementById('nextButton'),
  restartButton: document.getElementById('restartButton'),
  modeButtons: [...document.querySelectorAll('.mode-button')]
};

function shuffle(array){
  const copy=[...array];
  for(let i=copy.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}

function buildQuestion(item, currentMode){
  if(currentMode==='formula-to-class'){
    return {
      type:'formula-to-class',
      kicker:'Визначте клас речовини',
      prompt:item.formula,
      correct:item.className,
      options:shuffle(CLASSES),
      formulaAnswers:false,
      explanation:item.explanation
    };
  }

  if(currentMode==='class-to-formula'){
    const distractors=shuffle(ITEMS.filter(x=>x.className!==item.className)).slice(0,3).map(x=>x.formula);
    return {
      type:'class-to-formula',
      kicker:`Оберіть формулу: ${item.className.toLowerCase()}`,
      prompt:`Яка формула належить до класу «${item.className.toLowerCase()}»?`,
      correct:item.formula,
      options:shuffle([item.formula,...distractors]),
      formulaAnswers:true,
      explanation:`Правильна відповідь - ${item.formula}. ${item.explanation}`
    };
  }

  return buildQuestion(item, Math.random()<0.5?'formula-to-class':'class-to-formula');
}

function newRound(){
  const chosen=shuffle(ITEMS).slice(0,ROUND_SIZE);
  round=chosen.map(item=>buildQuestion(item,mode));
  index=0;
  score=0;
  answered=false;
  renderQuestion();
}

function renderQuestion(){
  const q=round[index];
  answered=false;
  els.taskCounter.textContent=`${index+1} / ${ROUND_SIZE}`;
  els.scoreCounter.textContent=`${score} правильних`;
  els.taskKicker.textContent=q.kicker;
  els.taskPrompt.textContent=q.prompt;
  els.answerGrid.innerHTML='';

  q.options.forEach(option=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='answer-option';
    button.textContent=option;
    if(q.formulaAnswers) button.dataset.formula='true';
    button.addEventListener('click',()=>checkAnswer(button,option));
    els.answerGrid.appendChild(button);
  });

  els.feedback.removeAttribute('data-state');
  els.feedback.innerHTML='<strong>Оберіть відповідь.</strong><span>Після вибору тут з’явиться пояснення.</span>';
  els.nextButton.disabled=true;
  els.nextButton.textContent=index===ROUND_SIZE-1?'Показати результат':'Наступне завдання';
}

function checkAnswer(button,option){
  if(answered) return;
  answered=true;
  const q=round[index];
  const buttons=[...els.answerGrid.querySelectorAll('.answer-option')];
  buttons.forEach(btn=>{
    btn.disabled=true;
    if(btn.textContent===q.correct) btn.classList.add('is-correct');
  });

  if(option===q.correct){
    score++;
    els.scoreCounter.textContent=`${score} правильних`;
    els.feedback.dataset.state='correct';
    els.feedback.innerHTML=`<strong>Правильно.</strong><span>${q.explanation}</span>`;
  }else{
    button.classList.add('is-wrong');
    els.feedback.dataset.state='review';
    els.feedback.innerHTML=`<strong>Потрібно повторити.</strong><span>Правильна відповідь: ${q.correct}. ${q.explanation}</span>`;
  }
  els.nextButton.disabled=false;
}

function showResult(){
  const percent=Math.round(score/ROUND_SIZE*100);
  let message='Варто ще раз пройти тренажер і звернути увагу на ознаки кожного класу.';
  if(score>=9) message='Ви впевнено розпізнаєте базові класи неорганічних сполук.';
  else if(score>=7) message='Результат добрий. Перегляньте пояснення до завдань, де були помилки.';
  else if(score>=5) message='Основна логіка вже є, але варто повторити характерні ознаки формул.';

  els.taskKicker.textContent='Результат раунду';
  els.taskPrompt.textContent=`${score} із ${ROUND_SIZE}`;
  els.answerGrid.innerHTML='';
  els.feedback.dataset.state=score>=7?'correct':'review';
  els.feedback.innerHTML=`<strong>${percent}% правильних відповідей.</strong><span>${message}</span>`;
  els.taskCounter.textContent=`${ROUND_SIZE} / ${ROUND_SIZE}`;
  els.nextButton.disabled=false;
  els.nextButton.textContent='Новий раунд';
  answered=true;
}

els.nextButton.addEventListener('click',()=>{
  if(index===ROUND_SIZE-1){
    if(els.nextButton.textContent==='Новий раунд') newRound();
    else showResult();
    return;
  }
  index++;
  renderQuestion();
});

els.restartButton.addEventListener('click',newRound);

els.modeButtons.forEach(button=>{
  button.addEventListener('click',()=>{
    mode=button.dataset.mode;
    els.modeButtons.forEach(btn=>btn.classList.toggle('is-active',btn===button));
    newRound();
  });
});

newRound();