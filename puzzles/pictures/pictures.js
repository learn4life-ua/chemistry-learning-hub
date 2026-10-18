(()=>{
"use strict";
const $=id=>document.getElementById(id);
const PICTURES=[
  {
    "word": "КОЛБА",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Erlenmeyer_flask.jpg/960px-Erlenmeyer_flask.jpg",
    "alt": "Справжня конічна скляна лабораторна посудина з вузькою шийкою на лабораторному столі.",
    "source": "https://commons.wikimedia.org/wiki/File:Erlenmeyer_flask.jpg",
    "extras": "РІТ",
    "prompt": "Як називається лабораторний посуд на малюнку?",
    "hint": "Скляна посудина з вузькою шийкою і широкою нижньою частиною.",
    "fact": "Колба - лабораторна посудина для змішування, нагрівання та інших операцій із речовинами. На малюнку зображена конічна колба."
  },
  {
    "word": "КОРОЗІЯ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Rusty_Nail.jpg",
    "alt": "Крупний план металу з нерівними рудо-коричневими ділянками та слідами руйнування поверхні.",
    "source": "https://commons.wikimedia.org/wiki/File:Rusty_Nail.jpg",
    "extras": "МЛТ",
    "prompt": "Який процес відбувається з металом?",
    "hint": "Руйнування металу через взаємодію із середовищем.",
    "fact": "Корозія - руйнування матеріалів унаслідок хімічної або електрохімічної взаємодії із середовищем. Іржавіння заліза - поширений приклад."
  },
  {
    "word": "МІДЬ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Kupferlackdraht_rolle.jpg",
    "alt": "Реальна котушка намотаного тонкого червонувато-рожевого металевого дроту.",
    "source": "https://commons.wikimedia.org/wiki/File:Kupferlackdraht_rolle.jpg",
    "extras": "РОА",
    "prompt": "Який метал представлений на зображенні?",
    "hint": "Цей метал добре проводить електричний струм і має характерний червонуватий колір.",
    "fact": "Мідь - проста речовина елемента Купрум (Cu), пластичний метал із високою електро- й теплопровідністю."
  },
  {
    "word": "КРИСТАЛ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Amethyst_crystal.jpg",
    "alt": "Природні фіолетові мінеральні утворення з виразними плоскими гранями на темному тлі.",
    "source": "https://commons.wikimedia.org/wiki/File:Amethyst_crystal.jpg",
    "extras": "ЕНО",
    "prompt": "Як називається тверде тіло з упорядкованою внутрішньою будовою?",
    "hint": "Його частинки утворюють періодично впорядковану структуру.",
    "fact": "Кристал - тверде тіло з упорядкованою періодичною структурою. Впорядкованість внутрішньої будови часто виявляється у формі граней."
  },
  {
    "word": "ІНДИКАТОР",
    "image": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Universal_indicator_paper.jpg",
    "alt": "Рулон тестового паперу з круговою кольоровою шкалою кислотності від 1 до 14.",
    "source": "https://commons.wikimedia.org/wiki/File:Universal_indicator_paper.jpg",
    "extras": "ЬСЛ",
    "prompt": "Як називається засіб, що змінює забарвлення залежно від кислотності розчину?",
    "hint": "Його часто використовують для визначення реакції середовища.",
    "fact": "Кислотно-основні індикатори змінюють забарвлення залежно від pH середовища. Для вимірювань можуть використовувати універсальний індикаторний папір."
  },
  {
    "word": "ОСАД",
    "image": "https://upload.wikimedia.org/wikipedia/commons/8/80/Lead_%28II%29_iodide_precipitating_out_of_solution.JPG",
    "alt": "Реальний хімічний дослід: яскраво-жовта нерозчинна речовина утворює хмароподібні скупчення в пробірці з рідиною.",
    "source": "https://commons.wikimedia.org/wiki/File:Lead_(II)_iodide_precipitating_out_of_solution.JPG",
    "extras": "ТКЛ",
    "prompt": "Що утворилося на дні посудини?",
    "hint": "Тверда фаза, яка виділилася з рідкого розчину.",
    "fact": "Осад - тверда речовина, що відокремлюється від розчину. Він може утворюватися, коли продукт реакції малорозчинний у воді."
  },
  {
    "word": "ГОРІННЯ",
    "image": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Burning_Bunsen_burner.jpg",
    "alt": "Реальне жовто-помаранчеве полум’я з блакитною основою над лабораторним газовим пальником.",
    "source": "https://commons.wikimedia.org/wiki/File:Burning_Bunsen_burner.jpg",
    "extras": "КСА",
    "prompt": "Який хімічний процес ілюструє полум’я?",
    "hint": "Швидкий екзотермічний процес взаємодії з окисником.",
    "fact": "Горіння - екзотермічна реакція з окисником, що часто супроводжується виділенням світла і тепла."
  }
];
const STORAGE_KEY="clh-picture-quiz-20261018";
const normal=value=>String(value||"").toLocaleUpperCase("uk-UA").replace(/[^А-ЯІЇЄҐ]/g,"");
const answers=PICTURES.map(()=>"");
const hints=PICTURES.map(()=>0);
const solved=new Set();
let index=0;
let bank=[];
const input=$("pictureAnswer"), feedback=$("picFeedback"), art=$("pictureArt");
const notify=(message,mood="")=>{feedback.textContent=message;feedback.className="game-feedback"+(mood?" is-"+mood:"");};
const persist=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({answers,hints,solved:[...solved],index}));}catch(_){/* Browser storage may be restricted. */}};
function restore(){
 try{
  const state=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
  if(Array.isArray(state.answers))state.answers.slice(0,PICTURES.length).forEach((v,i)=>answers[i]=normal(v).slice(0,PICTURES[i].word.length));
  if(Array.isArray(state.hints))state.hints.slice(0,PICTURES.length).forEach((v,i)=>hints[i]=Math.min(2,Math.max(0,Number(v)||0)));
  if(Array.isArray(state.solved))state.solved.forEach(v=>{if(Number.isInteger(v)&&v>=0&&v<PICTURES.length)solved.add(v);});
  if(Number.isInteger(state.index)&&state.index>=0&&state.index<PICTURES.length)index=state.index;
 }catch(_){/* Ignore invalid browser state. */}
}
function shuffle(item,seed){
 const letters=[...item.word,...item.extras];
 for(let i=letters.length-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const j=seed%(i+1);[letters[i],letters[j]]=[letters[j],letters[i]];}
 return letters;
}
function renderNavigation(){
 const node=$("pictureSteps");node.replaceChildren();
 PICTURES.forEach((item,i)=>{
  const button=document.createElement("button");button.type="button";button.className="picture-step";
  button.textContent=String(i+1);button.setAttribute("aria-label",`Перейти до завдання ${i+1}${solved.has(i)?", виконано":""}`);
  button.classList.toggle("is-current",i===index);button.classList.toggle("is-complete",solved.has(i));
  if(i===index)button.setAttribute("aria-current","step");
  button.addEventListener("click",()=>{index=i;persist();render();});
  node.append(button);
 });
}
function renderAnswer(){
 const item=PICTURES[index],word=answers[index],done=solved.has(index);
 if(input.value!==word)input.value=word;
 const slots=$("pictureSlots");slots.replaceChildren();
 for(let i=0;i<item.word.length;i++){
  const span=document.createElement("span");span.textContent=word[i]||"";
  span.classList.toggle("is-filled",Boolean(word[i]));slots.append(span);
 }
 const counts=new Map();for(const letter of word)counts.set(letter,(counts.get(letter)||0)+1);
 for(const btn of $("pictureLetters").children){
  const c=btn.dataset.letter;
  if((counts.get(c)||0)>0){btn.disabled=true;counts.set(c,counts.get(c)-1);}
  else btn.disabled=done||word.length>=item.word.length;
 }
 input.disabled=done;$("picCheck").disabled=done;
 $("picErase").disabled=done||!word;
 $("picHint").disabled=done||hints[index]>=2;
}
function render(){
 const item=PICTURES[index];
 art.replaceChildren();const img=document.createElement("img");
 img.src=item.image;img.alt=item.alt;img.width=1000;img.height=734;
 img.loading="eager";img.decoding="async";img.className="picture-art-image";
 img.addEventListener("error",()=>{if(art.firstChild!==img)return;const link=document.createElement("a");link.href=item.source;link.target="_blank";link.rel="noopener noreferrer";link.className="picture-image-fallback";link.textContent="Не вдалося завантажити фото. Переглянути оригінал у Wikimedia Commons ↗";art.replaceChildren(link);});
 art.append(img);
 $("picturePrompt").textContent=item.prompt;
 $("picProgress").textContent=`Завдання ${index+1} із ${PICTURES.length}`;
 $("picScore").textContent=`Розгадано: ${solved.size} із ${PICTURES.length}`;
 input.maxLength=item.word.length;
 bank=shuffle(item,index+23);
 const area=$("pictureLetters");area.replaceChildren();
 for(const c of bank){
  const button=document.createElement("button");button.type="button";button.textContent=c;button.dataset.letter=c;
  button.setAttribute("aria-label","Додати літеру "+c);
  button.addEventListener("click",()=>{
   if(solved.has(index)||answers[index].length>=item.word.length)return;
   answers[index]+=c;persist();renderAnswer();notify("Складіть слово та натисніть «Перевірити».");
  });
  area.append(button);
 }
 $("picNext").hidden=false;
 $("picNext").textContent=index===PICTURES.length-1?"До першого завдання →":"Наступне завдання →";
 renderNavigation();renderAnswer();
 if(solved.has(index))notify(`Правильно: ${item.word}. ${item.fact}`,"success");
 else if(hints[index]===1)notify("Підказка: "+item.hint);
 else if(hints[index]===2)notify("Першу літеру відкрито. Продовжуйте розгадування.");
 else notify("Розгляньте зображення та відгадайте слово. Завдання можна виконувати в довільному порядку.");
}
input.addEventListener("input",()=>{
 if(solved.has(index))return;
 answers[index]=normal(input.value).slice(0,PICTURES[index].word.length);
 persist();renderAnswer();
});
input.addEventListener("keydown",event=>{if(event.key==="Enter"){$("picCheck").click();}});
$("picErase").addEventListener("click",()=>{
 if(solved.has(index))return;
 answers[index]=answers[index].slice(0,-1);persist();renderAnswer();
});
$("picHint").addEventListener("click",()=>{
 if(solved.has(index)||hints[index]>=2)return;
 const item=PICTURES[index];hints[index]++;
 if(hints[index]===1)notify("Підказка: "+item.hint);
 else {
  answers[index]=item.word[0]+answers[index].slice(1);
  notify("Першу літеру відкрито. Продовжуйте розгадування.");
 }
 persist();renderAnswer();
});
$("picCheck").addEventListener("click",()=>{
 if(solved.has(index))return;
 const item=PICTURES[index];
 if(answers[index]===item.word){
  solved.add(index);persist();render();
  if(solved.size===PICTURES.length)notify(`Усі ${PICTURES.length} завдань виконано! ${item.fact}`,"success");
 }else{
  notify(`У слові ще є пропуски або помилки. Перевірте ${item.word.length} літер або скористайтеся підказкою.`,"error");
 }
});
$("picNext").addEventListener("click",()=>{index=(index+1)%PICTURES.length;persist();render();});
restore();render();
})();