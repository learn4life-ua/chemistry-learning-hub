(()=>{
"use strict";
  const $ = id => document.getElementById(id);
  const clean = value => String(value || "").toLocaleUpperCase("uk-UA").replace(/[^А-ЯІЇЄҐ]/g, "");
  function notify(el, message, mood="") {
    el.textContent = message;
    el.className = "game-feedback" + (mood ? " is-"+mood : "");
  }
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
  
renderPicture();
})();
