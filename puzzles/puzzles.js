(function puzzlesApp() {
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
  const cwGrid = $("crosswordGrid");
  const cwSelect = $("crosswordSelect");
  const cwFeedback = $("cwFeedback");
  const saved = new Map();
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
    cwHints++;clearErrors();repaint();
    notify(cwFeedback,`Відкрито одну літеру у слові №${w.number}. Спробуйте продовжити самостійно.`);
    input.focus();
  });
  $("cwReset").addEventListener("click",()=>{
    saved.delete(cwKey);renderCrossword();
  });
  cwSelect.addEventListener("change",()=>{
    saveCrossword();cwKey=cwSelect.value;renderCrossword();
  });

  const PICTURES=[
    {word:"КОЛБА",kind:"flask",extras:"РІТ",prompt:"Як називається лабораторний посуд на малюнку?",hint:"Посудина має вузьку шийку й широку нижню частину.",fact:"Колба - лабораторний посуд для проведення дослідів, нагрівання чи зберігання речовин."},
    {word:"КОРОЗІЯ",kind:"rust",extras:"МЛТ",prompt:"Який процес відбувається з металом?",hint:"Поступове руйнування металу через взаємодію із середовищем.",fact:"Корозія - руйнування матеріалів унаслідок хімічної або електрохімічної взаємодії із середовищем. Іржавіння заліза - її приклад."},
    {word:"МІДЬ",kind:"copper",extras:"РОА",prompt:"Який метал зображено?",hint:"Цей метал часто використовують в електричних проводах.",fact:"Мідь (Cu) - метал із високою електропровідністю."},
    {word:"КРИСТАЛ",kind:"crystal",extras:"ЕНО",prompt:"Як називається тверде тіло з упорядкованою внутрішньою будовою?",hint:"Частинки розташовані в певному порядку - кристалічній ґратці.",fact:"Кристал - тверде тіло, для якого характерна впорядкована, періодична будова."},
    {word:"ІНДИКАТОР",kind:"indicator",extras:"ЬСЛ",prompt:"Що допомагає визначати середовище розчину?",hint:"Його забарвлення залежить від кислотності розчину.",fact:"Кислотно-основний індикатор змінює колір залежно від pH середовища."},
    {word:"ОСАД",kind:"precipitate",extras:"ТКЛ",prompt:"Що утворилося на дні посудини?",hint:"Це тверда фаза, що відокремилася від розчину.",fact:"Осад може утворюватися під час хімічної реакції, якщо продукт малорозчинний у воді."},
    {word:"ГОРІННЯ",kind:"flame",extras:"КСА",prompt:"Який хімічний процес ілюструє полум’я?",hint:"Реакція з окисником, що супроводжується виділенням теплоти.",fact:"Горіння - екзотермічна реакція з окисником, часто зі світінням полум’я."}
  ];
  function illustration(kind) {
    const images={
      flask: `<ellipse cx="244" cy="258" rx="110" ry="13" fill="#9caed2" opacity=".18"/><path d="M224 46h40v86l76 109q9 18-12 18H160q-20 0-10-18l74-109Z" fill="#edf5ff" stroke="#6f88ac" stroke-width="8" stroke-linejoin="round"/><path d="M189 213h113l27 37H159Z" fill="#84d5d7" opacity=".88"/><path d="M222 46h44" stroke="#6f88ac" stroke-width="11" stroke-linecap="round"/><path d="M217 110h58" stroke="#fff" stroke-width="9" opacity=".65"/><circle cx="226" cy="228" r="8" fill="#fff" opacity=".5"/><circle cx="261" cy="240" r="5" fill="#fff" opacity=".6"/>`,
      rust: `<ellipse cx="243" cy="253" rx="155" ry="15" fill="#928a88" opacity=".17"/><g transform="rotate(-25 240 155)"><rect x="108" y="137" width="259" height="35" rx="5" fill="#a3aab2" stroke="#657078" stroke-width="6"/><path d="M359 137l37 17-37 18Z" fill="#84919c"/><rect x="99" y="125" width="27" height="60" rx="6" fill="#75818b" stroke="#59636e" stroke-width="5"/><path d="M164 137q15 25 40 20t26 15h44q12-25 40-26" stroke="#a74f2d" stroke-width="26" opacity=".86"/><path d="M170 149l21 7m63-7 17 7m49-1 16-5" stroke="#dc8c4c" stroke-width="9" stroke-linecap="round"/></g><circle cx="171" cy="219" r="5" fill="#b7663e"/><circle cx="205" cy="241" r="7" fill="#a95630"/><circle cx="300" cy="221" r="4" fill="#b7663e"/>`,
      copper: `<ellipse cx="240" cy="251" rx="147" ry="14" fill="#8c6f59" opacity=".14"/><path d="M109 238c-30-33-22-81 5-106" stroke="#b87542" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M349 236c32-35 37-67 16-100" stroke="#b87542" stroke-width="16" fill="none" stroke-linecap="round"/><g fill="none" stroke-linecap="round"><path d="M130 188c0-77 46-107 80-107s58 39 58 86-23 70-58 70-59-36-59-77 27-68 57-68 45 34 45 68" stroke="#b7612f" stroke-width="18"/><path d="M192 176c0-75 49-98 81-92 33 6 52 46 50 87-3 44-32 69-64 68s-49-27-48-68" stroke="#dd9554" stroke-width="16"/><path d="M245 169c0-45 35-66 66-57 28 8 46 34 44 61" stroke="#e5aa6f" stroke-width="12"/></g><circle cx="108" cy="239" r="10" fill="#c37a42"/><circle cx="350" cy="235" r="10" fill="#d69560"/>`,
      crystal: `<ellipse cx="243" cy="267" rx="133" ry="12" fill="#a3aec8" opacity=".15"/><polygon points="141,228 183,93 261,68 321,137 298,240 214,258" fill="#a6d6f2" stroke="#5184ba" stroke-width="6"/><polygon points="183,93 214,258 261,68" fill="#deeffa" opacity=".8"/><polygon points="261,68 321,137 214,258" fill="#75b9e4" opacity=".65"/><polygon points="141,228 183,93 214,258" fill="#8cc4e4" opacity=".65"/><polygon points="291,236 324,140 364,153 387,233 346,266" fill="#a9d6ed" stroke="#6c9bbb" stroke-width="5"/><path d="M324 140l22 126-55-30 96-3" fill="none" stroke="#5f9ac0" stroke-width="4" opacity=".7"/><polygon points="103,244 133,178 167,201 168,249 134,267" fill="#c8e2f4" stroke="#7ba5cb" stroke-width="4"/>`,
      indicator: `<ellipse cx="241" cy="254" rx="150" ry="14" fill="#93a5c3" opacity=".18"/><path d="M133 96v138q1 29 31 29h145q31 0 31-29V96" fill="#f5faff" stroke="#758fae" stroke-width="7"/><path d="M143 186h187v48q0 20-23 20H165q-22 0-22-20Z" fill="#a6dbe9" opacity=".73"/><path d="M123 95h226" stroke="#758fae" stroke-width="8" stroke-linecap="round"/><g transform="rotate(-16 260 142)"><rect x="268" y="28" width="32" height="194" rx="4" fill="#e9e8d8" stroke="#acafae" stroke-width="3"/><rect x="271" y="139" width="26" height="21" fill="#c94f75"/><rect x="271" y="160" width="26" height="21" fill="#e6ac56"/><rect x="271" y="181" width="26" height="21" fill="#75ba78"/><rect x="271" y="202" width="26" height="17" fill="#6b97d0"/></g>`,
      precipitate: `<ellipse cx="245" cy="263" rx="128" ry="10" fill="#95a5be" opacity=".2"/><path d="M151 77v152q0 34 35 34h112q35 0 35-34V77" fill="#e9f7ff" stroke="#778fa7" stroke-width="7"/><path d="M155 118h174v112q0 29-31 29H186q-31 0-31-29Z" fill="#a9d7e8" opacity=".66"/><path d="M146 76h192" stroke="#778fa7" stroke-width="8" stroke-linecap="round"/><path d="M160 220q45-14 79 0t90 0v12q0 27-31 27H186q-26 0-26-27Z" fill="#c7a786"/><circle cx="207" cy="206" r="6" fill="#c8a98d"/><circle cx="268" cy="189" r="4" fill="#d7b69d"/><circle cx="229" cy="165" r="5" fill="#ccab90"/><circle cx="281" cy="216" r="5" fill="#e1c2a7"/><circle cx="187" cy="229" r="5" fill="#f2dbc7"/>`,
      flame: `<ellipse cx="241" cy="263" rx="116" ry="13" fill="#9ca5b8" opacity=".17"/><path d="M238 50q-20 67-58 100-34 31-18 75 15 40 77 44 61 2 80-45 14-36-9-66-8 40-29 39 18-71-43-147Z" fill="#f2a442" stroke="#dc7c35" stroke-width="5"/><path d="M244 122q-11 41-34 65-20 23-9 49 11 26 38 26 40 0 48-28 6-24-11-45-5 20-13 21 7-53-19-88Z" fill="#ffe6a0"/><path d="M234 213q-15 20-9 35 8 19 27 7 17-12 0-42Z" fill="#fff2bb"/><rect x="203" y="268" width="76" height="13" rx="5" fill="#647e9c"/>`
    };
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" role="img" aria-label="Ілюстрація-підказка до завдання" focusable="false"><defs><radialGradient id="bg"><stop stop-color="#fff" stop-opacity=".84"/><stop offset="1" stop-color="#bbc7e8" stop-opacity=".1"/></radialGradient></defs><rect width="480" height="300" fill="url(#bg)"/>${images[kind] || ""}</svg>`;
  }
  let picIndex=0, picTyped="", picDone=false, picHintCount=0;
  const picSolved=new Set();
  const picInput=$("pictureAnswer"), picFeedback=$("picFeedback");
  let bank=[];
  function shuffledBank(item) {
    const letters=[...item.word,...item.extras];
    let seed=PICTURES.indexOf(item)+23;
    for(let i=letters.length-1;i>0;i--){
      seed=(seed*1664525+1013904223)>>>0;
      const j=seed%(i+1);
      [letters[i],letters[j]]=[letters[j],letters[i]];
    }
    return letters;
  }
  function renderAnswer() {
    picInput.value=picTyped;
    const slots=$("pictureSlots");slots.replaceChildren();
    for(let i=0;i<PICTURES[picIndex].word.length;i++){
      const span=document.createElement("span");
      span.textContent=picTyped[i] || "";
      slots.append(span);
    }
    const used=new Map();
    [...picTyped].forEach(ch=>used.set(ch,(used.get(ch)||0)+1));
    for(const btn of $("pictureLetters").children){
      const l=btn.dataset.letter;
      if((used.get(l)||0)>0){btn.disabled=true;used.set(l,used.get(l)-1);}
      else btn.disabled=picDone;
    }
    $("picCheck").disabled=picDone;
    $("picErase").disabled=picDone || !picTyped;
    picInput.disabled=picDone;
  }
  function renderPicture() {
    const pic=PICTURES[picIndex];
    picTyped="";picDone=false;picHintCount=0;
    $("pictureArt").innerHTML=illustration(pic.kind);
    $("picturePrompt").textContent=pic.prompt;
    $("picProgress").textContent=`Завдання ${picIndex+1} із ${PICTURES.length}`;
    $("picScore").textContent=`Розгадано: ${picSolved.size}`;
    picInput.maxLength=pic.word.length;
    picInput.disabled=false;
    bank=shuffledBank(pic);
    const bankNode=$("pictureLetters");bankNode.replaceChildren();
    bank.forEach((ch,i)=>{
      const b=document.createElement("button");
      b.type="button";b.textContent=ch;
      b.dataset.letter=ch;
      b.setAttribute("aria-label",`Додати літеру ${ch}`);
      b.addEventListener("click",()=>{
        if(picTyped.length>=pic.word.length || picDone)return;
        picTyped+=ch;renderAnswer();notify(picFeedback,"Введіть усі літери та перевірте відповідь.");
      });
      bankNode.append(b);
    });
    $("picHint").disabled=false;
    $("picNext").hidden=true;
    $("picNext").textContent=picIndex===PICTURES.length-1?"Почати добірку заново →":"Наступне →";
    renderAnswer();
    notify(picFeedback,"Визначте поняття за ілюстрацією.");
  }
  picInput.addEventListener("input",()=>{
    if(picDone)return;
    picTyped=clean(picInput.value).slice(0,PICTURES[picIndex].word.length);
    renderAnswer();
  });
  picInput.addEventListener("keydown",event=>{
    if(event.key==="Enter"){$("picCheck").click();}
  });
  $("picErase").addEventListener("click",()=>{
    if(picDone)return;
    picTyped=picTyped.slice(0,-1);renderAnswer();
  });
  $("picHint").addEventListener("click",()=>{
    if(picDone || picHintCount>=2)return;
    const pic=PICTURES[picIndex];
    picHintCount++;
    if(picHintCount===1) notify(picFeedback,`Підказка: ${pic.hint}`);
    else {
      picTyped=pic.word[0]+picTyped.slice(1);
      renderAnswer();
      notify(picFeedback,`Перша літера відповіді - «${pic.word[0]}».`);
      $("picHint").disabled=true;
    }
  });
  $("picCheck").addEventListener("click",()=>{
    const pic=PICTURES[picIndex];
    if(picTyped===pic.word){
      picDone=true;picSolved.add(picIndex);
      renderAnswer();
      $("picScore").textContent=`Розгадано: ${picSolved.size}`;
      notify(picFeedback,`Правильно: ${pic.word}. ${pic.fact}`,"success");
      $("picNext").hidden=false;
    }else{
      notify(picFeedback,`Відповідь поки неправильна. Перевірте слово з ${pic.word.length} літер або скористайтеся підказкою.`,"error");
    }
  });
  $("picNext").addEventListener("click",()=>{
    if(picIndex===PICTURES.length-1){picIndex=0;picSolved.clear();}
    else picIndex++;
    renderPicture();
  });
  document.querySelectorAll("button.puzzle-mode[data-mode]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll("button.puzzle-mode[data-mode]").forEach(b=>{
        const selected=b===btn;
        b.classList.toggle("is-active",selected);
        b.setAttribute("aria-pressed",String(selected));
      });
      $("crosswordPanel").hidden=btn.dataset.mode!=="crossword";
      $("picturePanel").hidden=btn.dataset.mode!=="picture";
      document.getElementById("crosswordPanel").hidden
        ? $("pictureTitle").scrollIntoView({block:"nearest",behavior:"smooth"})
        : $("crosswordTitle").scrollIntoView({block:"nearest",behavior:"smooth"});
    });
  });
  renderCrossword();
  renderPicture();
  // Preserve direct links to each game from the home-page card.
  const requestedMode = new URLSearchParams(window.location.search).get("mode");
  if (requestedMode === "picture") {
    const tab = document.querySelector('button.puzzle-mode[data-mode="picture"]');
    if (tab) {
      tab.click();
    }
  }
})();
