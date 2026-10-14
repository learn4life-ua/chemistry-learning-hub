const substances = [
  {name:'Натрій хлорид', formula:'NaCl', explanation:'Na⁺ і Cl⁻ мають заряди +1 і −1, тому співвідношення йонів у формулі 1:1.'},
  {name:'Калій нітрат', formula:'KNO₃', explanation:'K⁺ і NO₃⁻ урівноважують заряди у співвідношенні 1:1.'},
  {name:'Кальцій хлорид', formula:'CaCl₂', explanation:'Катіон Ca²⁺ потребує двох хлорид-іонів Cl⁻, тому формула CaCl₂.'},
  {name:'Кальцій карбонат', formula:'CaCO₃', explanation:'Ca²⁺ і CO₃²⁻ мають однакові за модулем заряди, тому співвідношення 1:1.'},
  {name:'Магній оксид', formula:'MgO', explanation:'Mg²⁺ і O²⁻ урівноважуються у співвідношенні 1:1.'},
  {name:'Алюміній оксид', formula:'Al₂O₃', explanation:'Найменше співвідношення, що урівноважує Al³⁺ та O²⁻, дорівнює 2:3.'},
  {name:'Натрій гідроксид', formula:'NaOH', explanation:'Na⁺ і OH⁻ утворюють сполуку у співвідношенні 1:1.'},
  {name:'Кальцій гідроксид', formula:'Ca(OH)₂', explanation:'Для Ca²⁺ потрібні два гідроксид-іони OH⁻; повторювану групу OH беруть у дужки.'},
  {name:'Барій сульфат', formula:'BaSO₄', explanation:'Ba²⁺ і SO₄²⁻ урівноважуються у співвідношенні 1:1.'},
  {name:'Натрій сульфат', formula:'Na₂SO₄', explanation:'Для сульфат-іона SO₄²⁻ потрібні два катіони Na⁺.'},
  {name:'Амоній хлорид', formula:'NH₄Cl', explanation:'Багатоатомний катіон NH₄⁺ і Cl⁻ мають заряди +1 та −1.'},
  {name:'Амоній сульфат', formula:'(NH₄)₂SO₄', explanation:'Для SO₄²⁻ потрібні два катіони NH₄⁺, тому амоній записують у дужках.'},
  {name:'Ферум(II) хлорид', formula:'FeCl₂', explanation:'Позначення (II) вказує на Fe²⁺; для нього потрібні два Cl⁻.'},
  {name:'Ферум(III) хлорид', formula:'FeCl₃', explanation:'Позначення (III) вказує на Fe³⁺; для нього потрібні три Cl⁻.'},
  {name:'Купрум(II) оксид', formula:'CuO', explanation:'Cu²⁺ і O²⁻ урівноважуються у співвідношенні 1:1.'},
  {name:'Купрум(II) сульфат', formula:'CuSO₄', explanation:'Cu²⁺ і SO₄²⁻ мають однакові за модулем заряди.'},
  {name:'Сульфатна кислота', formula:'H₂SO₄', explanation:'Кислотний залишок SO₄²⁻ поєднується з двома йонами Гідрогену.'},
  {name:'Нітратна кислота', formula:'HNO₃', explanation:'Нітрат-іон NO₃⁻ має заряд −1, тому у формулі кислоти один атом Гідрогену.'},
  {name:'Хлоридна кислота', formula:'HCl', explanation:'Хлорид-іон Cl⁻ має заряд −1, тому формула кислоти HCl.'},
  {name:'Карбонатна кислота', formula:'H₂CO₃', explanation:'Карбонат-іон CO₃²⁻ відповідає двом атомам Гідрогену у формулі H₂CO₃.'}
];

const modeButtons=[...document.querySelectorAll('.mode-button')];
const taskCounter=document.getElementById('taskCounter');
const scoreCounter=document.getElementById('scoreCounter');
const taskKicker=document.getElementById('taskKicker');
const taskPrompt=document.getElementById('taskPrompt');
const answerGrid=document.getElementById('answerGrid');
const feedback=document.getElementById('feedback');
const restartButton=document.getElementById('restartButton');
const nextButton=document.getElementById('nextButton');

let mode='name-to-formula';
let queue=[];
let taskIndex=0;
let score=0;
let answered=false;
let current=null;
let currentDirection='name-to-formula';
const TASKS_PER_ROUND=10;

function shuffle(items){
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}

function chooseDirection(){
  if(mode==='mixed') return Math.random()<.5?'name-to-formula':'formula-to-name';
  return mode;
}

function makeOptions(item,direction){
  const correct=direction==='name-to-formula'?item.formula:item.name;
  const pool=substances
    .filter(s=>s!==item)
    .map(s=>direction==='name-to-formula'?s.formula:s.name)
    .filter(value=>value!==correct);
  return shuffle([correct,...shuffle(pool).slice(0,3)]);
}

function updateCounters(){
  taskCounter.textContent=`${Math.min(taskIndex+1,TASKS_PER_ROUND)} / ${TASKS_PER_ROUND}`;
  scoreCounter.textContent=`${score} правильних`;
}

function renderTask(){
  answered=false;
  nextButton.disabled=true;
  feedback.removeAttribute('data-state');
  feedback.innerHTML='<strong>Оберіть відповідь.</strong><span>Після вибору тут з’явиться пояснення.</span>';
  current=queue[taskIndex];
  currentDirection=chooseDirection();
  const formulaMode=currentDirection==='name-to-formula';
  taskKicker.textContent=formulaMode?'Знайдіть формулу':'Знайдіть назву';
  taskPrompt.textContent=formulaMode?current.name:current.formula;
  answerGrid.innerHTML='';
  makeOptions(current,currentDirection).forEach(value=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='answer-option';
    button.textContent=value;
    if(formulaMode) button.dataset.formula='true';
    button.addEventListener('click',()=>checkAnswer(button,value));
    answerGrid.appendChild(button);
  });
  updateCounters();
}

function checkAnswer(button,value){
  if(answered) return;
  answered=true;
  const correctValue=currentDirection==='name-to-formula'?current.formula:current.name;
  const correct=value===correctValue;
  [...answerGrid.children].forEach(option=>{
    option.disabled=true;
    if(option.textContent===correctValue) option.classList.add('is-correct');
  });
  if(!correct) button.classList.add('is-wrong');
  if(correct) score+=1;
  scoreCounter.textContent=`${score} правильних`;
  feedback.dataset.state=correct?'correct':'review';
  feedback.innerHTML=correct
    ? `<strong>✓ Правильно: ${correctValue}</strong><span>${current.explanation}</span>`
    : `<strong>Потрібна інша відповідь: ${correctValue}</strong><span>${current.explanation}</span>`;
  nextButton.disabled=false;
  nextButton.textContent=taskIndex===TASKS_PER_ROUND-1?'Завершити':'Наступне завдання';
}

function finishRound(){
  answerGrid.innerHTML='';
  taskKicker.textContent='Раунд завершено';
  taskPrompt.textContent=`${score} із ${TASKS_PER_ROUND}`;
  feedback.removeAttribute('data-state');
  const message=score===TASKS_PER_ROUND
    ? 'Усі відповіді правильні.'
    : score>=7
      ? 'Добрий результат. Повторіть завдання, щоб закріпити формули й назви.'
      : 'Варто ще раз пройти раунд і звертати увагу на заряди йонів, індекси та дужки.';
  feedback.innerHTML=`<strong>Результат тренування</strong><span>${message}</span>`;
  nextButton.disabled=true;
  nextButton.textContent='Наступне завдання';
  taskCounter.textContent=`${TASKS_PER_ROUND} / ${TASKS_PER_ROUND}`;
}

function startRound(){
  queue=shuffle(substances).slice(0,TASKS_PER_ROUND);
  taskIndex=0;
  score=0;
  nextButton.textContent='Наступне завдання';
  renderTask();
}

modeButtons.forEach(button=>button.addEventListener('click',()=>{
  mode=button.dataset.mode;
  modeButtons.forEach(item=>item.classList.toggle('is-active',item===button));
  startRound();
}));

nextButton.addEventListener('click',()=>{
  if(!answered) return;
  if(taskIndex>=TASKS_PER_ROUND-1){finishRound();return;}
  taskIndex+=1;
  renderTask();
});
restartButton.addEventListener('click',startRound);

startRound();