const equations = [
  { raw:'H₂ + O₂ → H₂O', species:['H₂','O₂','H₂O'], coeffs:[2,1,2], explain:'Для Гідрогену ставимо 2 перед H₂O, після цього перед H₂ також 2. Оксиген урівноважується коефіцієнтом 1 перед O₂.' },
  { raw:'N₂ + H₂ → NH₃', species:['N₂','H₂','NH₃'], coeffs:[1,3,2], explain:'Два атоми Нітрогену дають 2NH₃. У продуктах маємо 6 атомів Гідрогену, тому перед H₂ ставимо 3.' },
  { raw:'Fe + O₂ → Fe₂O₃', species:['Fe','O₂','Fe₂O₃'], coeffs:[4,3,2], explain:'НСК для кількості атомів Оксигену 2 і 3 дорівнює 6: ставимо 3O₂ і 2Fe₂O₃, після чого 4Fe.' },
  { raw:'Al + O₂ → Al₂O₃', species:['Al','O₂','Al₂O₃'], coeffs:[4,3,2], explain:'Щоб урівняти Оксиген, беремо 3O₂ і 2Al₂O₃. Тоді в продуктах 4 атоми Алюмінію, тому перед Al ставимо 4.' },
  { raw:'Na + Cl₂ → NaCl', species:['Na','Cl₂','NaCl'], coeffs:[2,1,2], explain:'У молекулі Cl₂ два атоми Хлору, тому ставимо 2 перед NaCl і 2 перед Na.' },
  { raw:'KClO₃ → KCl + O₂', species:['KClO₃','KCl','O₂'], coeffs:[2,2,3], explain:'НСК для 3 і 2 атомів Оксигену дорівнює 6: 2KClO₃ → 2KCl + 3O₂.' },
  { raw:'Mg + HCl → MgCl₂ + H₂', species:['Mg','HCl','MgCl₂','H₂'], coeffs:[1,2,1,1], explain:'У MgCl₂ два атоми Хлору, тому перед HCl ставимо 2. Два атоми Гідрогену утворюють H₂.' },
  { raw:'Al + HCl → AlCl₃ + H₂', species:['Al','HCl','AlCl₃','H₂'], coeffs:[2,6,2,3], explain:'Для Хлору та Гідрогену зручно взяти 6HCl: утворюються 2AlCl₃ і 3H₂, тому потрібно 2Al.' },
  { raw:'NaOH + H₂SO₄ → Na₂SO₄ + H₂O', species:['NaOH','H₂SO₄','Na₂SO₄','H₂O'], coeffs:[2,1,1,2], explain:'Для Na₂SO₄ потрібно два атоми Натрію, тому ставимо 2NaOH. Тоді утворюються 2H₂O.' },
  { raw:'BaCl₂ + Na₂SO₄ → BaSO₄ + NaCl', species:['BaCl₂','Na₂SO₄','BaSO₄','NaCl'], coeffs:[1,1,1,2], explain:'Барій і сульфатна група вже зрівняні. Два атоми Натрію та два атоми Хлору дають 2NaCl.' },
  { raw:'FeCl₃ + NaOH → Fe(OH)₃ + NaCl', species:['FeCl₃','NaOH','Fe(OH)₃','NaCl'], coeffs:[1,3,1,3], explain:'Три хлоридні групи потребують 3NaCl, а для Fe(OH)₃ потрібно 3NaOH.' },
  { raw:'P + O₂ → P₂O₅', species:['P','O₂','P₂O₅'], coeffs:[4,5,2], explain:'НСК для 2 і 5 атомів Оксигену дорівнює 10: 5O₂ і 2P₂O₅. Після цього ставимо 4P.' },
  { raw:'CH₄ + O₂ → CO₂ + H₂O', species:['CH₄','O₂','CO₂','H₂O'], coeffs:[1,2,1,2], explain:'Один атом Карбону дає CO₂, чотири атоми Гідрогену дають 2H₂O. У продуктах разом 4 атоми Оксигену, тому потрібно 2O₂.' },
  { raw:'C₂H₆ + O₂ → CO₂ + H₂O', species:['C₂H₆','O₂','CO₂','H₂O'], coeffs:[2,7,4,6], explain:'Беремо 2C₂H₆: це дає 4CO₂ і 6H₂O. У продуктах 14 атомів Оксигену, тому ставимо 7O₂.' }
];

const els = {
  prompt: document.getElementById('taskPrompt'),
  kicker: document.getElementById('taskKicker'),
  grid: document.getElementById('answerGrid'),
  feedback: document.getElementById('feedback'),
  taskCounter: document.getElementById('taskCounter'),
  scoreCounter: document.getElementById('scoreCounter'),
  next: document.getElementById('nextButton'),
  restart: document.getElementById('restartButton'),
  modes: [...document.querySelectorAll('.mode-button')]
};

let mode = 'full';
let queue = [];
let currentIndex = 0;
let score = 0;
let locked = false;

function shuffle(arr){
  const copy = [...arr];
  for(let i=copy.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}

function coeffText(c){ return c === 1 ? '' : String(c); }
function balancedText(eq, coeffs = eq.coeffs){
  const leftCount = eq.raw.split('→')[0].split('+').length;
  return eq.species.map((s,i)=>`${coeffText(coeffs[i])}${s}`).slice(0,leftCount).join(' + ') + ' → ' + eq.species.map((s,i)=>`${coeffText(coeffs[i])}${s}`).slice(leftCount).join(' + ');
}
function gcd(a,b){ while(b){[a,b]=[b,a%b]} return Math.abs(a); }
function gcdArray(arr){ return arr.reduce((a,b)=>gcd(a,b)); }

function makeFullQuestion(eq){
  const correct = balancedText(eq);
  const variants = new Set([correct]);
  let tries = 0;
  while(variants.size < 4 && tries < 80){
    tries++;
    const candidate = [...eq.coeffs];
    const idx = Math.floor(Math.random()*candidate.length);
    const delta = Math.random() < .5 ? -1 : 1;
    candidate[idx] = Math.max(1, candidate[idx] + delta);
    if(gcdArray(candidate) > 1) continue;
    variants.add(balancedText(eq,candidate));
  }
  return {
    type:'full',
    prompt:eq.raw,
    kicker:'Оберіть правильний запис',
    correct,
    options:shuffle([...variants]),
    explain:`Правильне рівняння: ${correct}. ${eq.explain}`
  };
}

function makeMissingQuestion(eq){
  const eligible = eq.coeffs.map((c,i)=>({c,i})).filter(x=>x.c>1);
  const pick = eligible.length ? eligible[Math.floor(Math.random()*eligible.length)] : {c:1,i:0};
  const leftCount = eq.raw.split('→')[0].split('+').length;
  const parts = eq.species.map((s,i)=> i===pick.i ? `□${s}` : `${coeffText(eq.coeffs[i])}${s}`);
  const prompt = parts.slice(0,leftCount).join(' + ') + ' → ' + parts.slice(leftCount).join(' + ');
  const pool = new Set([pick.c]);
  [pick.c-2,pick.c-1,pick.c+1,pick.c+2,pick.c+3].filter(v=>v>0).forEach(v=>pool.add(v));
  const options = shuffle([...pool]).slice(0,4).map(String);
  if(!options.includes(String(pick.c))) options[Math.floor(Math.random()*options.length)] = String(pick.c);
  return {
    type:'missing',
    prompt,
    kicker:'Який коефіцієнт пропущено?',
    correct:String(pick.c),
    options:shuffle(options),
    explain:`Потрібний коефіцієнт: ${pick.c}. Повний запис: ${balancedText(eq)}. ${eq.explain}`
  };
}

function makeQuestion(eq){
  if(mode==='full') return makeFullQuestion(eq);
  if(mode==='missing') return makeMissingQuestion(eq);
  return Math.random()<.5 ? makeFullQuestion(eq) : makeMissingQuestion(eq);
}

function startRound(){
  queue = shuffle(equations).slice(0,10).map(makeQuestion);
  currentIndex=0; score=0; locked=false;
  renderQuestion();
}

function renderQuestion(){
  const q = queue[currentIndex];
  els.taskCounter.textContent = `${currentIndex+1} / ${queue.length}`;
  els.scoreCounter.textContent = `${score} правильних`;
  els.kicker.textContent = q.kicker;
  els.prompt.textContent = q.prompt;
  els.feedback.removeAttribute('data-state');
  els.feedback.innerHTML = '<strong>Оберіть відповідь.</strong><span>Після вибору тут з’явиться пояснення.</span>';
  els.grid.innerHTML='';
  q.options.forEach(option=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='answer-option';
    btn.textContent=option;
    btn.addEventListener('click',()=>checkAnswer(btn,option));
    els.grid.appendChild(btn);
  });
  els.next.disabled=true;
  els.next.textContent=currentIndex===queue.length-1?'Завершити':'Наступне завдання';
  locked=false;
}

function checkAnswer(button, value){
  if(locked) return;
  locked=true;
  const q=queue[currentIndex];
  const correct=value===q.correct;
  if(correct) score++;
  [...els.grid.children].forEach(btn=>{
    btn.disabled=true;
    if(btn.textContent===q.correct) btn.classList.add('is-correct');
  });
  if(!correct) button.classList.add('is-wrong');
  els.scoreCounter.textContent=`${score} правильних`;
  els.feedback.dataset.state=correct?'correct':'review';
  els.feedback.innerHTML=`<strong>${correct?'Правильно.':'Потрібно ще перевірити.'}</strong><span>${q.explain}</span>`;
  els.next.disabled=false;
}

function finishRound(){
  const pct=Math.round(score/queue.length*100);
  els.kicker.textContent='Раунд завершено';
  els.prompt.textContent=`${score} з ${queue.length}`;
  els.grid.innerHTML='';
  els.feedback.dataset.state=score>=8?'correct':'review';
  const note=score===10?'Усі рівняння зрівняно правильно.':score>=8?'Результат упевнений. Можна повторити для закріплення.':score>=6?'Базова логіка вже є. Варто ще потренувати підрахунок атомів.':'Повторіть правило: індекси не змінюємо, добираємо лише коефіцієнти.';
  els.feedback.innerHTML=`<strong>${pct}% правильних відповідей.</strong><span>${note}</span>`;
  els.next.disabled=false;
  els.next.textContent='Новий раунд';
}

els.next.addEventListener('click',()=>{
  if(currentIndex===queue.length-1 && locked){ finishRound(); currentIndex=queue.length; return; }
  if(currentIndex>=queue.length){ startRound(); return; }
  currentIndex++; renderQuestion();
});
els.restart.addEventListener('click',startRound);
els.modes.forEach(btn=>btn.addEventListener('click',()=>{
  mode=btn.dataset.mode;
  els.modes.forEach(b=>b.classList.toggle('is-active',b===btn));
  startRound();
}));

startRound();