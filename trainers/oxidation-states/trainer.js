const QUESTIONS_FIND = [
  {prompt:'S у H₂SO₄',answer:'+6',options:['+6','+4','−2','0'],explain:'У нейтральній H₂SO₄ сума дорівнює 0: 2·(+1) + x + 4·(−2) = 0, тому x = +6.'},
  {prompt:'N у HNO₃',answer:'+5',options:['+5','+3','−3','+1'],explain:'(+1) + x + 3·(−2) = 0, звідси x = +5.'},
  {prompt:'C у CO₂',answer:'+4',options:['+4','+2','−4','0'],explain:'x + 2·(−2) = 0, тому ступінь окиснення C дорівнює +4.'},
  {prompt:'S у SO₂',answer:'+4',options:['+4','+6','−2','0'],explain:'x + 2·(−2) = 0, тому S має +4.'},
  {prompt:'Mn у KMnO₄',answer:'+7',options:['+7','+6','+4','+2'],explain:'(+1) + x + 4·(−2) = 0, тому Mn має +7.'},
  {prompt:'Cr у K₂Cr₂O₇',answer:'+6',options:['+6','+3','+7','+4'],explain:'2·(+1) + 2x + 7·(−2) = 0, звідси x = +6.'},
  {prompt:'Fe у Fe₂O₃',answer:'+3',options:['+3','+2','0','+6'],explain:'2x + 3·(−2) = 0, тому Fe має +3.'},
  {prompt:'Fe у FeO',answer:'+2',options:['+2','+3','−2','0'],explain:'x + (−2) = 0, тому Fe має +2.'},
  {prompt:'Cu у Cu₂O',answer:'+1',options:['+1','+2','0','−1'],explain:'2x + (−2) = 0, тому Cu має +1.'},
  {prompt:'Cu у CuO',answer:'+2',options:['+2','+1','0','−2'],explain:'x + (−2) = 0, тому Cu має +2.'},
  {prompt:'P у H₃PO₄',answer:'+5',options:['+5','+3','−3','+1'],explain:'3·(+1) + x + 4·(−2) = 0, тому P має +5.'},
  {prompt:'N у NH₃',answer:'−3',options:['−3','+3','−1','+5'],explain:'x + 3·(+1) = 0, тому N має −3.'},
  {prompt:'C у CH₄',answer:'−4',options:['−4','+4','−2','0'],explain:'x + 4·(+1) = 0, тому C має −4.'},
  {prompt:'S у H₂S',answer:'−2',options:['−2','+2','+6','0'],explain:'2·(+1) + x = 0, тому S має −2.'},
  {prompt:'Cl у NaCl',answer:'−1',options:['−1','+1','0','−2'],explain:'Na у сполуках зазвичай має +1, тому Cl у нейтральній NaCl має −1.'},
  {prompt:'O у MgO',answer:'−2',options:['−2','−1','+2','0'],explain:'У звичайному оксиді O має типовий ступінь окиснення −2.'},
  {prompt:'Na у Na₂SO₄',answer:'+1',options:['+1','+2','0','−1'],explain:'Натрій як лужний метал у сполуках має типовий ступінь окиснення +1.'},
  {prompt:'Ca у CaCO₃',answer:'+2',options:['+2','+1','0','+4'],explain:'Кальцій як лужноземельний метал у сполуках має типовий ступінь окиснення +2.'},
  {prompt:'C у CaCO₃',answer:'+4',options:['+4','+2','−4','0'],explain:'Ca має +2, O −2: (+2) + x + 3·(−2) = 0, тому C має +4.'},
  {prompt:'N у NO₂',answer:'+4',options:['+4','+2','+5','−3'],explain:'x + 2·(−2) = 0, тому N має +4.'}
];

const QUESTIONS_RULE = [
  {prompt:'Ступінь окиснення елемента у простій речовині...',answer:'дорівнює 0',options:['дорівнює 0','завжди +1','завжди −1','дорівнює номеру групи'],explain:'У простих речовинах, наприклад H₂, O₂, Fe, ступінь окиснення кожного атома дорівнює 0.'},
  {prompt:'Сума ступенів окиснення в нейтральній сполуці...',answer:'дорівнює 0',options:['дорівнює 0','дорівнює +1','дорівнює −1','завжди додатна'],explain:'Для нейтральної частинки алгебраїчна сума ступенів окиснення з урахуванням індексів дорівнює 0.'},
  {prompt:'Сума ступенів окиснення у багатоатомному йоні...',answer:'дорівнює заряду йона',options:['дорівнює заряду йона','завжди 0','завжди +1','завжди −1'],explain:'Наприклад, для SO₄²⁻ сума ступенів окиснення всіх атомів дорівнює −2.'},
  {prompt:'Оксиген у більшості звичайних сполук має...',answer:'−2',options:['−2','−1','+2','0'],explain:'Типове значення O у більшості сполук −2. У пероксидах та деяких інших сполуках є винятки.'},
  {prompt:'Гідроген у більшості сполук має...',answer:'+1',options:['+1','−1','0','+2'],explain:'Типове значення H у більшості сполук +1. У гідридах металів можливий виняток −1.'},
  {prompt:'Флуор у сполуках має...',answer:'−1',options:['−1','+1','−2','0'],explain:'Флуор у сполуках практично завжди має ступінь окиснення −1.'},
  {prompt:'Лужні метали у сполуках зазвичай мають...',answer:'+1',options:['+1','+2','−1','0'],explain:'Li, Na, K та інші лужні метали у сполуках зазвичай мають +1.'},
  {prompt:'Лужноземельні метали у сполуках зазвичай мають...',answer:'+2',options:['+2','+1','−2','0'],explain:'Mg, Ca, Ba та інші лужноземельні метали у сполуках зазвичай мають +2.'},
  {prompt:'Індекс у формулі під час перевірки суми...',answer:'множить відповідний ступінь окиснення',options:['множить відповідний ступінь окиснення','не враховується','змінює знак ступеня','завжди дорівнює 1'],explain:'Наприклад, у H₂O два атоми H дають 2·(+1).'},
  {prompt:'Щоб знайти невідомий ступінь окиснення, зручно...',answer:'скласти алгебраїчну суму',options:['скласти алгебраїчну суму','додати атомні маси','порахувати нейтрони','скористатися лише індексом'],explain:'Відомі значення підставляють у суму, яка для нейтральної сполуки дорівнює 0.'}
];

const state={mode:'find',round:[],index:0,score:0,answered:false};
const $=s=>document.querySelector(s);
const taskCounter=$('#taskCounter'),scoreCounter=$('#scoreCounter'),taskKicker=$('#taskKicker'),taskPrompt=$('#taskPrompt'),answerGrid=$('#answerGrid'),feedback=$('#feedback'),nextButton=$('#nextButton'),restartButton=$('#restartButton');

function shuffle(arr){return [...arr].sort(()=>Math.random()-0.5)}
function pool(){
  if(state.mode==='find') return QUESTIONS_FIND;
  if(state.mode==='rule') return QUESTIONS_RULE;
  return [...QUESTIONS_FIND,...QUESTIONS_RULE];
}
function startRound(){
  state.round=shuffle(pool()).slice(0,10);state.index=0;state.score=0;state.answered=false;render();
}
function render(){
  if(state.index>=state.round.length){return renderResult()}
  const q=state.round[state.index];state.answered=false;nextButton.disabled=true;
  taskCounter.textContent=`${state.index+1} / ${state.round.length}`;scoreCounter.textContent=`${state.score} правильних`;
  taskKicker.textContent=QUESTIONS_RULE.includes(q)?'Перевірте правило':'Знайдіть ступінь окиснення';
  taskPrompt.textContent=q.prompt;answerGrid.innerHTML='';
  shuffle(q.options).forEach(opt=>{
    const b=document.createElement('button');b.type='button';b.className='answer-option';b.textContent=opt;b.addEventListener('click',()=>answer(b,opt,q));answerGrid.appendChild(b);
  });
  feedback.removeAttribute('data-state');feedback.innerHTML='<strong>Оберіть відповідь.</strong><span>Після вибору тут з’явиться пояснення.</span>';
  nextButton.textContent=state.index===state.round.length-1?'Показати результат':'Наступне завдання';
}
function answer(button,opt,q){
  if(state.answered)return;state.answered=true;
  const correct=opt===q.answer;if(correct)state.score++;
  [...answerGrid.children].forEach(b=>{b.disabled=true;if(b.textContent===q.answer)b.classList.add('is-correct')});
  if(!correct)button.classList.add('is-wrong');
  feedback.dataset.state=correct?'correct':'review';
  feedback.innerHTML=`<strong>${correct?'Правильно.':'Перевірте ще раз.'}</strong><span>${q.explain}</span>`;
  scoreCounter.textContent=`${state.score} правильних`;nextButton.disabled=false;
}
function renderResult(){
  taskCounter.textContent='Раунд завершено';scoreCounter.textContent=`${state.score} / ${state.round.length}`;
  taskKicker.textContent='Результат';taskPrompt.textContent=`${state.score} із ${state.round.length} правильних`;
  answerGrid.innerHTML='';
  const msg=state.score>=9?'Відмінно. Базові правила засвоєні дуже впевнено.':state.score>=7?'Добрий результат. Перегляньте пояснення до помилок і повторіть раунд.':state.score>=5?'Основу вже видно, але варто ще раз пройти правила і кілька обчислень.':'Почніть із підказок праворуч і повторіть тренування в режимі «Правила».';
  feedback.dataset.state=state.score>=7?'correct':'review';feedback.innerHTML=`<strong>${msg}</strong><span>Тренажер не виставляє оцінку - його мета допомогти знайти місця, які варто повторити.</span>`;
  nextButton.disabled=false;nextButton.textContent='Пройти ще раз';
}
nextButton.addEventListener('click',()=>{if(state.index>=state.round.length){startRound();return}state.index++;render()});
restartButton.addEventListener('click',startRound);
document.querySelectorAll('.mode-button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.mode-button').forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');state.mode=btn.dataset.mode;startRound()}));
startRound();