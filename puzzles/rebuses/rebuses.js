(()=>{
"use strict";
const terms=[{"word":"ОСАД","hint":"Тверда речовина, що виділяється з розчину.","fact":"ОСА + Д = ОСАД. Осад — тверда фаза, яка може утворитися під час хімічної реакції в розчині."},{"word":"СПЛАВ","hint":"Матеріал із металевими властивостями, що містить кілька хімічних елементів.","fact":"С + ПЛАВКИ без двох останніх літер КИ = СПЛАВ. Сплави — матеріали, що містять щонайменше один метал і мають металеві властивості."},{"word":"ЛАКМУС","hint":"Кислотно-основний індикатор.","fact":"ЛАК + М + ВУСА без першої літери В та останньої А = ЛАКМУС. Лакмус змінює забарвлення залежно від кислотності середовища."},{"word":"МОЛЕКУЛА","hint":"Частинка речовини, утворена атомами, сполученими хімічними зв’язками.","fact":"МОЛОТОК без чотирьох останніх літер — МОЛ; + Е; КУЛЯ із заміною Я на А — КУЛА. Разом: МОЛЕКУЛА."},{"word":"КИСЛОТА","hint":"За теорією Брьонстеда — речовина, здатна віддавати протон.","fact":"КИТ без останньої Т = КИ; + С; ЛОТО без останніх ТО = ЛО; + ТА = КИСЛОТА."},{"word":"РЕАКЦІЯ","hint":"Процес перетворення одних речовин на інші.","fact":"Музична нота РЕ + АКЦІЯ = РЕАКЦІЯ. Під час хімічної реакції з реагентів утворюються продукти реакції."}];
const root=document.getElementById("rebusTaskGrid");
const progress=document.getElementById("rebusesProgress");
const completion=document.getElementById("rebusesCompletion");
const storeKey="clh-rebuses-gallery-20261018";
const entries=[...root.querySelectorAll("[data-rebus-index]")];
const normalize=s=>String(s||"").toLocaleUpperCase("uk-UA").replace(/[^А-ЯІЇЄҐ]/g,"");
const state=terms.map(()=>({answer:"",solved:false,hint:false}));
function persist(){try{localStorage.setItem(storeKey,JSON.stringify(state));}catch(_){}}
function restore(){
 try{
  const saved=JSON.parse(localStorage.getItem(storeKey)||"null");
  if(!Array.isArray(saved))return;
  saved.slice(0,terms.length).forEach((item,i)=>{
   if(!item||typeof item!=="object")return;
   const answer=normalize(item.answer).slice(0,terms[i].word.length);
   state[i].answer=answer;
   state[i].solved=item.solved===true&&answer===terms[i].word;
   state[i].hint=item.hint===true;
  });
 }catch(_){}
}
function repaint(i){
 const card=entries[i],s=state[i],term=terms[i];
 const input=card.querySelector("[data-rebus-input]");
 const stateLabel=card.querySelector("[data-rebus-state]");
 const hint=card.querySelector("[data-rebus-hint]");
 const feedback=card.querySelector("[data-rebus-feedback]");
 if(input.value!==s.answer)input.value=s.answer;
 input.disabled=s.solved;
 card.querySelector('[data-action="check"]').disabled=s.solved;
 card.querySelector('[data-action="hint"]').disabled=s.solved||s.hint;
 card.classList.toggle("is-solved",s.solved);
 stateLabel.textContent=s.solved?"Правильно":"Не розгадано";
 hint.hidden=!s.hint||s.solved;
 if(s.hint)hint.textContent="Підказка: "+term.hint;
 if(s.solved){
  feedback.textContent="Правильно: "+term.word+". "+term.fact;
  feedback.className="rebus-task-feedback is-success";
 }
}
function updateProgress(){
 const count=state.filter(item=>item.solved).length;
 progress.textContent="Розгадано: "+count+" із "+terms.length;
 completion.hidden=count!==terms.length;
}
function check(i){
 const card=entries[i],s=state[i],term=terms[i];
 if(s.solved)return;
 s.answer=normalize(card.querySelector("[data-rebus-input]").value).slice(0,term.word.length);
 const feedback=card.querySelector("[data-rebus-feedback]");
 if(s.answer===term.word){
  s.solved=true;
  repaint(i);
  updateProgress();
 }else{
  feedback.textContent=s.answer?"Поки що неправильно. Перевірте написання або скористайтеся підказкою.":"Спочатку введіть слово.";
  feedback.className="rebus-task-feedback is-error";
 }
 persist();
}
root.addEventListener("input",e=>{
 const input=e.target.closest("[data-rebus-input]");if(!input)return;
 const card=input.closest("[data-rebus-index]");if(!card)return;
 const i=Number(card.dataset.rebusIndex);if(!Number.isInteger(i)||state[i].solved)return;
 state[i].answer=normalize(input.value).slice(0,terms[i].word.length);
 input.value=state[i].answer;
 const feedback=card.querySelector("[data-rebus-feedback]");
 feedback.textContent="Відгадайте слово за малюнком.";
 feedback.className="rebus-task-feedback";
 persist();
});
root.addEventListener("keydown",e=>{
 if(e.key!=="Enter"||!e.target.matches("[data-rebus-input]"))return;
 e.preventDefault();
 check(Number(e.target.closest("[data-rebus-index]").dataset.rebusIndex));
});
root.addEventListener("click",e=>{
 const button=e.target.closest("button[data-action]");if(!button)return;
 const card=button.closest("[data-rebus-index]");if(!card)return;
 const i=Number(card.dataset.rebusIndex);
 if(button.dataset.action==="check")check(i);
 if(button.dataset.action==="hint"&&!state[i].solved){
  state[i].hint=true;repaint(i);persist();
 }
});
document.getElementById("rebusesReset").addEventListener("click",()=>{
 if(!window.confirm("Скинути відповіді до всіх шести ребусів?"))return;
 state.forEach((s,i)=>{
  s.answer="";s.solved=false;s.hint=false;
  const feedback=entries[i].querySelector("[data-rebus-feedback]");
  feedback.textContent="Відгадайте слово за малюнком.";
  feedback.className="rebus-task-feedback";
  repaint(i);
 });
 persist();updateProgress();
});
restore();state.forEach((_,i)=>repaint(i));updateProgress();
})();