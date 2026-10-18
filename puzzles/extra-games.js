(()=>{
"use strict";
const $=id=>document.getElementById(id);
const mode=location.pathname.includes("four-pictures")?"four":"rebus";
const icons={
drop:'<path d="M60 16C48 35 32 53 32 71a28 28 0 0 0 56 0C88 53 73 34 60 16Z"/><path d="M45 70a14 14 0 0 0 14 14" opacity=".45"/>',
snow:'<path d="M60 15v90M15 60h90M28 28l64 64M92 28 28 92"/><path d="m51 25 9 9 9-9M51 95l9-9 9 9M25 51l9 9-9 9M95 51l-9 9 9 9"/>',
ice:'<path d="m25 40 35-22 35 22v43L60 104 25 83Z"/><path d="M25 40 60 62l35-22M60 62v42"/>',
steam:'<path d="M26 76h68M36 94h48M38 63c-20-22 14-23 0-45M60 63c-20-22 14-23 0-45M82 63c-20-22 14-23 0-45"/>',
diamond:'<path d="M18 45 41 22h38l23 23-42 57Z"/><path d="M18 45h84M41 22l19 23 19-23M60 45l-9 36 9 21 9-21-9-36"/>',
pencil:'<path d="m23 88 10-28 47-47 27 27-47 47-28 10Z"/><path d="m33 60 27 27M80 13 107 40M23 88l9 9"/>',
coal:'<path d="m20 81 11-38 34-23 26 21 10 38-25 20H43Z"/><path d="M31 43 60 61l31-20M60 61l16 38M60 61 43 99"/>',
carbon:'<rect x="28" y="18" width="64" height="84" rx="7"/><text x="38" y="41" font-size="16" stroke="none" fill="currentColor">6</text><text x="44" y="78" font-size="44" stroke="none" fill="currentColor" font-weight="700">C</text>',
nail:'<path d="m30 28 63 63m-69-69 15 15m-20-5 13-13M93 91l10 12-15-4" stroke-width="7"/>',
horseshoe:'<path d="M25 23v50a35 35 0 0 0 70 0V23H77v50a17 17 0 0 1-34 0V23Z"/><path d="M25 42h18M77 42h18"/>',
rust:'<path d="M25 86 40 31l44-13 13 60-31 25Z"/><path d="m40 31 31 28 13-41M71 59l-5 44M25 86l46-27"/><circle cx="43" cy="68" r="7" fill="currentColor" stroke="none" opacity=".23"/><circle cx="82" cy="76" r="5" fill="currentColor" stroke="none" opacity=".3"/>',
iron:'<rect x="28" y="18" width="64" height="84" rx="7"/><text x="38" y="42" font-size="16" stroke="none" fill="currentColor">26</text><text x="38" y="78" font-size="35" stroke="none" fill="currentColor" font-weight="700">Fe</text>',
window:'<rect x="21" y="21" width="78" height="78" rx="3"/><path d="M60 21v78M21 60h78"/>',
flask:'<path d="M47 18h26M52 18v36L28 94q-4 9 7 9h50q11 0 7-9L68 54V18M37 81h46"/><path d="m52 54 16 0"/>',
bottle:'<path d="M49 18h22v20l12 17v43q0 6-7 6H44q-7 0-7-6V55l12-17Z"/><path d="M49 38h22M37 70h46"/>',
beaker:'<path d="M28 24h64M36 24v72q0 7 8 7h32q8 0 8-7V24M39 75h42M45 40h15M45 51h12M45 62h15"/>'
};
const four=[
{w:"ВОДА",pics:["drop","snow","ice","steam"],hint:"Одна речовина у трьох агрегатних станах.",fact:"Вода (H₂O) може існувати у твердому, рідкому та газоподібному станах. Сніг і лід - тверда вода, водяна пара - газоподібна."},
{w:"ВУГЛЕЦЬ",pics:["diamond","pencil","coal","carbon"],hint:"Елемент із символом C.",fact:"Вуглець (C) міститься в алмазі, графіті та вугіллі. Графіт - матеріал серцевини звичайного олівця."},
{w:"ЗАЛІЗО",pics:["nail","horseshoe","rust","iron"],hint:"Метал з атомним номером 26.",fact:"Залізо (Fe) використовують у виробах зі сталі та чавуну. Іржа утворюється внаслідок корозії заліза."},
{w:"СКЛО",pics:["window","flask","bottle","beaker"],hint:"Неорганічний аморфний матеріал.",fact:"Скло - переважно неорганічний аморфний матеріал. Із нього виготовляють вікна, тару й багато видів лабораторного посуду."}
];
const rebuses=[
{"w":"ОСАД","image":"./images/01_OSAD.png","alt":"Реалістична оса, знак плюс і літера Д.","hint":"Тверда фаза, яка виділяється з розчину.","fact":"ОСА + Д = ОСАД. Осад є малорозчинною твердою речовиною, що утворюється під час певних хімічних реакцій."},
{"w":"СПЛАВ","image":"./images/02_SPLAV.png","alt":"Літера С, знак плюс, плавки та дві коми після них.","hint":"Матеріал, що містить два або більше хімічних елементів, з яких хоча б один - метал.","fact":"С + ПЛАВКИ без двох останніх літер КИ = СПЛАВ. Сплав - матеріал із металевими властивостями, що містить щонайменше два елементи."},
{"w":"ЛАКМУС","image":"./images/03_LAKMUS.png","alt":"Лак для нігтів, плюс, літера М, плюс, вуса з комами перед і після них.","hint":"Кислотно-основний індикатор.","fact":"ЛАК + М + ВУСА без першої В та останньої А = ЛАКМУС. Лакмус - індикатор, колір якого залежить від кислотності середовища."},
{"w":"МОЛЕКУЛА","image":"./images/04_MOLEKULA.png","alt":"Молоток, чотири коми, літера Е, знак плюс, синя куля із заміною Я на А.","hint":"Найменша частинка речовини, що може зберігати її хімічні властивості.","fact":"МОЛОТОК без чотирьох останніх літер = МОЛ; додайте Е та слово КУЛЯ із заміною Я на А: МОЛЕКУЛА. Молекула - електронейтральна частинка, утворена атомами, зв'язаними хімічними зв'язками."},
{"w":"КИСЛОТА","image":"./images/05_KYSLOTA.png","alt":"Кит, кома після нього, літера С, лото із двома комами після нього, літери ТА.","hint":"Речовина, яка в розчині може віддавати протони.","fact":"КИТ без Т = КИ; + С; ЛОТО без ТО = ЛО; + ТА = КИСЛОТА. Кислоти можуть віддавати протони іншим частинкам."},
{"w":"РЕАКЦІЯ","image":"./images/06_REAKTSIIA.png","alt":"Музична нота РЕ, знак плюс, червона бірка зі словом АКЦІЯ та позначкою знижки.","hint":"Перетворення одних речовин на інші.","fact":"Музична нота РЕ + АКЦІЯ = РЕАКЦІЯ. Під час хімічної реакції вихідні речовини перетворюються на продукти реакції."}
];
const tasks=mode==="four"?four:rebuses;
let index=0,usedHint=false,completed=new Set(),solved=false;
const input=$("extraInput"),visual=$("extraVisual"),feedback=$("extraFeedback");
const normal=s=>String(s||"").toLocaleUpperCase("uk-UA").replace(/[^А-ЯІЇЄҐ]/g,"");
function message(s,mood=""){feedback.textContent=s;feedback.className="game-feedback"+(mood?" is-"+mood:"");}
function iconMarkup(name){
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" role="img" aria-label="Зображення-підказка"><path d="M0 0" opacity="0"/>'+icons[name]+'</svg>';
}
function render(){
 const t=tasks[index];solved=false;usedHint=false;input.disabled=false;input.value="";
 $("extraCheck").disabled=false;$("extraHint").disabled=false;
 $("extraNext").hidden=true;
 $("extraNext").textContent=index===tasks.length-1?"Пройти знову →":mode==="four"?"Наступне завдання →":"Наступний ребус →";
 $("extraCounter").textContent=(index+1)+" із "+tasks.length;
 $("extraScore").textContent=completed.size+" правильних";
 visual.replaceChildren();
 if(mode==="four"){
  for(const icon of t.pics){const figure=document.createElement("figure");figure.innerHTML=iconMarkup(icon);visual.append(figure);}
 }else{
  const img=document.createElement("img");
  img.src=t.image;img.alt=t.alt;img.width=1200;img.height=420;
  img.decoding="async";img.loading="eager";
  visual.append(img);
 }
 message(mode==="four"?"Що спільного між цими чотирма малюнками?":"Знайдіть слово, заховане в ребусі.");
}
$("extraCheck").addEventListener("click",()=>{
 if(solved)return;
 const t=tasks[index];
 if(normal(input.value)===t.w){
  solved=true;completed.add(index);
  input.disabled=true;$("extraCheck").disabled=true;$("extraHint").disabled=true;
  $("extraScore").textContent=completed.size+" правильних";
  $("extraNext").hidden=false;
  message("Правильно: "+t.w+". "+t.fact,"success");
 }else message("Відповідь поки неправильна. Перевірте написання або скористайтеся підказкою.","error");
});
$("extraHint").addEventListener("click",()=>{
 if(usedHint||solved)return;
 usedHint=true;$("extraHint").disabled=true;
 message("Підказка: "+tasks[index].hint);
});
$("extraNext").addEventListener("click",()=>{
 if(index===tasks.length-1){index=0;completed.clear();}
 else index++;
 render();
});
input.addEventListener("keydown",e=>{if(e.key==="Enter"){$("extraCheck").click();}});
render();
})();
