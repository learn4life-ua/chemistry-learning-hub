(()=>{
"use strict";
  const $ = id => document.getElementById(id);
  const clean = value => String(value || "").toLocaleUpperCase("uk-UA").replace(/[^А-ЯІЇЄҐ]/g, "");
const CROSSWORDS = {
    basics: [
      { w: "МОЛЕКУЛА", r: 0, c: 1, d: "a", q: "Частинка, що складається з двох або більше атомів, сполучених хімічними зв’язками.", e: "Молекули можуть складатися з атомів одного або різних хімічних елементів." },
      { w: "ОСАД", r: 0, c: 2, d: "d", q: "Тверда речовина, яка виділяється з розчину під час деяких хімічних реакцій.", e: "Утворення осаду є однією з можливих ознак хімічної реакції." },
      { w: "ВОДЕНЬ", r: 3, c: 0, d: "a", q: "Хімічний елемент із порядковим номером 1.", e: "Водень - елемент з атомним номером 1, символ H. Проста речовина - H₂." },
      { w: "АТОМ", r: 0, c: 8, d: "d", q: "Найменша електронейтральна частинка хімічного елемента.", e: "Атом складається з ядра та електронної оболонки." },
      { w: "ІНДИКАТОР", r: 2, c: 4, d: "d", q: "Речовина, за зміною забарвлення якої можна оцінити кислотність середовища.", e: "Кислотно-основні індикатори змінюють колір залежно від pH." },
      { w: "КОРОЗІЯ", r: 9, c: 1, d: "a", q: "Поступове руйнування матеріалу внаслідок взаємодії із середовищем.", e: "Іржавіння заліза - один із прикладів корозії." },
      { w: "КИСЕНЬ", r: 5, c: 3, d: "a", q: "Хімічний елемент із порядковим номером 8; його проста речовина необхідна для дихання людини.", e: "Кисень позначають O, а формула найпоширенішої простої речовини - O₂." },
      { w: "РЕАКЦІЯ", r: 7, c: 2, d: "a", q: "Хімічна ... - процес перетворення одних речовин на інші.", e: "Під час хімічної реакції відбувається перегрупування атомів і зміна хімічних зв’язків." }
    ],
    lab: [
      { w: "ПРОБІРКА", r: 2, c: 0, d: "a", q: "Невелика циліндрична скляна посудина для проведення дослідів.", e: "Пробірки призначені для роботи з невеликими кількостями речовин." },
      { w: "ТЕРЕЗИ", r: 0, c: 5, d: "d", q: "Прилад, яким у лабораторії вимірюють масу.", e: "Терези використовують для визначення маси речовин і предметів." },
      { w: "ШТАТИВ", r: 0, c: 2, d: "a", q: "Пристрій для закріплення лабораторного посуду та приладів.", e: "Лабораторний штатив дозволяє надійно закріплювати обладнання." },
      { w: "МЕНЗУРКА", r: 4, c: 2, d: "a", q: "Градуйована посудина для вимірювання об’єму рідини.", e: "Мензурка має шкалу; для високоточних вимірювань застосовують спеціальний мірний посуд." },
      { w: "ЛІЙКА", r: 0, c: 9, d: "d", q: "Пристосування для переливання рідин або фільтрування з паперовим фільтром.", e: "Лійка полегшує переливання, а з фільтром - відокремлення твердої фази від рідини." },
      { w: "КОЛБА", r: 4, c: 8, d: "d", q: "Лабораторна посудина з широкою нижньою частиною та звуженою шийкою.", e: "Колби бувають різних форм, зокрема круглодонні та конічні." },
      { w: "ПІПЕТКА", r: 2, c: 0, d: "d", q: "Прилад для відбирання й перенесення невеликих об’ємів рідини.", e: "Для точного дозування застосовують мірні або автоматичні піпетки." },
      { w: "БЮРЕТКА", r: 8, c: 2, d: "a", q: "Градуйована трубка з краном для дозованого додавання рідини під час титрування.", e: "Бюретка дає змогу контролювати об’єм доданого розчину." }
    ]
  };
  Object.assign(CROSSWORDS, window.CHEMISTRY_CROSSWORD_SETS || {});
  const cwGrid = $("crosswordGrid");
  const cwSelect = $("crosswordSelect");
  const cwFeedback = $("cwFeedback");
  const saved = new Map();
  const STORAGE_KEY = "clh-crosswords-v2";
  function persistProgress(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(saved))); }
    catch (_) { /* Розгадування працює навіть без доступу до сховища. */ }
  }
  function loadProgress(){
    try {
      const snapshot=JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      for(const key of Object.keys(CROSSWORDS)){
        const value=snapshot?.[key];
        if(value && typeof value==="object" && value.letters && typeof value.letters==="object"){
          saved.set(key,{letters:value.letters,hints:Math.max(0,Number(value.hints)||0)});
        }
      }
    } catch (_) { /* Пошкоджені або заборонені локальні дані ігноруються. */ }
  }
  let cwKey = "basics";
  let cwWords, cwMap, cwInputs = new Map(), cwActive = 0, cwHints = 0, cwStart = new Map();

  function buildModel(key) {
    const words = CROSSWORDS[key].map(w => ({ ...w }));
    const map = new Map();
    const starts = new Set();
    for (const w of words) {
      starts.add(`${w.r},${w.c}`);
      for (let i = 0; i < w.w.length; i++) {
        const row = w.r + (w.d === "d" ? i : 0);
        const col = w.c + (w.d === "a" ? i : 0);
        const k = `${row},${col}`;
        if (!map.has(k)) map.set(k, { row, col, char: w.w[i], wordIndices: [] });
        if (map.get(k).char !== w.w[i]) throw Error("Неправильний перетин: " + k);
        map.get(k).wordIndices.push(words.indexOf(w));
      }
    }
    const sortedStarts = [...starts].map(key => key.split(",").map(Number)).sort((a,b) => a[0]-b[0] || a[1]-b[1]);
    const numbers = new Map(sortedStarts.map(([r,c],i) => [`${r},${c}`, i+1]));
    words.forEach(w => w.number = numbers.get(`${w.r},${w.c}`));
    return { words, map, numbers };
  }
  function wordKeys(w) {
    return [...w.w].map((_, i) => `${w.r + (w.d==="d" ? i : 0)},${w.c + (w.d==="a" ? i : 0)}`);
  }
  function letter(k) { return clean(cwInputs.get(k)?.value).slice(0,1); }
  function isSolved(w) { return wordKeys(w).every((k,i) => letter(k) === w.w[i]); }
  function notify(el, message, mood="") {
    el.textContent = message;
    el.className = "game-feedback" + (mood ? " is-"+mood : "");
  }
  function saveCrossword() {
    if (!cwWords) return;
    saved.set(cwKey, { letters: Object.fromEntries([...cwInputs].map(([k,v]) => [k,v.value])), hints: cwHints });
    persistProgress();
  }
  function showClues() {
    for (const [direction,target] of [["a",$("cluesAcross")],["d",$("cluesDown")]]) {
      target.replaceChildren();
      cwWords.forEach((word,i) => {
        if (word.d !== direction) return;
        const btn = document.createElement("button");
        btn.type="button";
        btn.className="clue-button";
        btn.dataset.word=String(i);
        const n=document.createElement("span");
        n.textContent=String(word.number);
        const label=document.createElement("div");
        label.textContent=word.q;
        btn.append(n,label);
        btn.addEventListener("click", () => pickWord(i,true));
        target.append(btn);
      });
    }
  }
  function repaint() {
    const word=cwWords[cwActive];
    const activeCells = new Set(wordKeys(word));
    const solved = cwWords.map(isSolved);
    for (const [k,input] of cwInputs) {
      const parent=input.parentElement;
      parent.classList.toggle("is-word",activeCells.has(k));
      parent.classList.toggle("is-correct",cwMap.get(k).wordIndices.some(i=>solved[i]) && letter(k)===cwMap.get(k).char);
    }
    document.querySelectorAll(".clue-button").forEach(btn => {
      const i=Number(btn.dataset.word);
      btn.classList.toggle("is-active",i===cwActive);
      btn.setAttribute("aria-pressed",String(i===cwActive));
      btn.classList.toggle("is-solved",solved[i]);
    });
    $("cwSelected").textContent=`${word.number} ${word.d==="a" ? "по горизонталі" : "по вертикалі"}: ${word.q}`;
    const count=solved.filter(Boolean).length;
    $("cwProgress").textContent=`${count} із ${cwWords.length} слів`;
    $("cwHints").textContent=`Підказок: ${cwHints}`;
    if (count===cwWords.length) notify(cwFeedback,`Кросворд розгадано! Усі ${count} слів правильні. Використано підказок: ${cwHints}.`,"success");
  }
  function pickWord(index,shouldFocus=false) {
    cwActive=index;
    repaint();
    if (shouldFocus) {
      const keys=wordKeys(cwWords[cwActive]);
      const target=keys.find(k=>!letter(k)) || keys[0];
      cwInputs.get(target)?.focus();
    }
  }
  function clearErrors() {
    cwGrid.querySelectorAll(".is-error").forEach(el=>el.classList.remove("is-error"));
  }
  function renderCrossword() {
    const model=buildModel(cwKey);
    cwWords=model.words; cwMap=model.map; cwStart=model.numbers; cwInputs=new Map();
    const state=saved.get(cwKey) || {letters:{},hints:0};
    cwHints=state.hints;
    const cells=[...cwMap.values()];
    const rows=Math.max(...cells.map(v=>v.row))+1;
    const cols=Math.max(...cells.map(v=>v.col))+1;
    cwGrid.style.setProperty("--rows",rows);
    cwGrid.style.setProperty("--cols",cols);
    cwGrid.replaceChildren();
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
      const k=`${r},${c}`;
      const wrapper=document.createElement("div");
      wrapper.className="crossword-cell";
      if(!cwMap.has(k)){wrapper.classList.add("is-empty");wrapper.setAttribute("aria-hidden","true");}
      else {
        const cell=cwMap.get(k);
        const input=document.createElement("input");
        input.type="text";input.maxLength=1;input.autocomplete="off";
        input.setAttribute("autocapitalize","characters");
        input.setAttribute("spellcheck","false");
        input.setAttribute("aria-label",`Літера, рядок ${r+1}, стовпець ${c+1}`);
        input.dataset.key=k;
        input.value=clean(state.letters[k]).slice(0,1);
        if(cwStart.has(k)){
          const s=document.createElement("span");
          s.className="cell-number";s.textContent=String(cwStart.get(k));
          wrapper.append(s);
        }
        wrapper.append(input);cwInputs.set(k,input);
      }
      cwGrid.append(wrapper);
    }
    cwActive=0;
    showClues();
    repaint();
    notify(cwFeedback,"Оберіть запитання і почніть розгадування.");
  }
  function focusedWordPosition(key) {
    return wordKeys(cwWords[cwActive]).indexOf(key);
  }
  function navigateWithinWord(key,step) {
    const keys=wordKeys(cwWords[cwActive]);
    const index=keys.indexOf(key);
    if(index>=0 && index+step>=0 && index+step<keys.length) cwInputs.get(keys[index+step])?.focus();
  }
  cwGrid.addEventListener("click",event=>{
    const input=event.target.closest("input[data-key]");
    if(!input)return;
    const associated=cwMap.get(input.dataset.key).wordIndices;
    const next=associated.includes(cwActive) && associated.length>1 ? associated.find(i=>i!==cwActive) : associated[0];
    pickWord(next,false);
  });
  cwGrid.addEventListener("input",event=>{
    const input=event.target;
    if(!input.matches("input[data-key]"))return;
    const normalized=clean(input.value).slice(0,1);
    input.value=normalized;
    clearErrors();
    repaint();
    saveCrossword();
    if(normalized) navigateWithinWord(input.dataset.key,1);
  });
  cwGrid.addEventListener("keydown",event=>{
    const input=event.target;
    if(!input.matches("input[data-key]"))return;
    if(event.key==="Enter"){event.preventDefault();checkWord();return;}
    if(event.key==="Backspace"){
      event.preventDefault();
      if(input.value){input.value="";clearErrors();repaint();}
      else {
        navigateWithinWord(input.dataset.key,-1);
        const focused=document.activeElement;
        if(focused instanceof HTMLInputElement && focused!==input){focused.value="";clearErrors();repaint();}
      }
      saveCrossword();
      return;
    }
    const dir={"ArrowUp":[-1,0,"d"],"ArrowDown":[1,0,"d"],"ArrowLeft":[0,-1,"a"],"ArrowRight":[0,1,"a"]}[event.key];
    if(!dir)return;
    event.preventDefault();
    const [r,c]=input.dataset.key.split(",").map(Number);
    const k=`${r+dir[0]},${c+dir[1]}`;
    if(!cwInputs.has(k))return;
    const match=cwMap.get(k).wordIndices.find(i=>cwWords[i].d===dir[2]);
    if(match!==undefined) pickWord(match,false);
    cwInputs.get(k).focus();
  });
  function checkWord() {
    clearErrors();
    const w=cwWords[cwActive],keys=wordKeys(w);
    if(isSolved(w)){notify(cwFeedback,`Правильно: ${w.w}. ${w.e}`,"success");}
    else {
      keys.forEach((k,i)=>{if(letter(k) && letter(k)!==w.w[i])cwInputs.get(k).parentElement.classList.add("is-error");});
      notify(cwFeedback,"У цьому слові ще є пропуски або помилки. Перевірте клітинки й спробуйте знову.","error");
    }
    repaint();
  }
  $("cwCheckWord").addEventListener("click",checkWord);
  $("cwCheckAll").addEventListener("click",()=>{
    clearErrors();
    let good=0;
    cwWords.forEach(w=>{
      if(isSolved(w))good++;
      else wordKeys(w).forEach((k,i)=>{
        if(letter(k) && letter(k)!==w.w[i])cwInputs.get(k).parentElement.classList.add("is-error");
      });
    });
    repaint();
    if(good!==cwWords.length)notify(cwFeedback,`Правильно заповнено ${good} із ${cwWords.length} слів. Неправильні літери позначено; пропуски залишаються порожніми.`,"error");
  });
  $("cwHint").addEventListener("click",()=>{
    const w=cwWords[cwActive],keys=wordKeys(w);
    const i=keys.findIndex((k,j)=>letter(k)!==w.w[j]);
    if(i<0){notify(cwFeedback,"Це слово вже розгадано правильно.","success");return;}
    const input=cwInputs.get(keys[i]);input.value=w.w[i];
    cwHints++;clearErrors();repaint();saveCrossword();
    notify(cwFeedback,`Відкрито одну літеру у слові №${w.number}. Спробуйте продовжити самостійно.`);
    input.focus();
  });
  $("cwReset").addEventListener("click",()=>{
    saved.delete(cwKey);persistProgress();renderCrossword();
  });
  cwSelect.addEventListener("change",()=>{
    saveCrossword();cwKey=cwSelect.value;renderCrossword();
  });

  
loadProgress();
renderCrossword();
})();
