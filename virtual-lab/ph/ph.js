const samples = {
  hcl:{name:'Розчин HCl',ph:1.5,medium:'acidic',mediumLabel:'Кисле середовище',note:'0,03 моль/л хлоридної кислоти.',liquid:'rgba(239,68,68,.12)',universal:['Червоний','#ef4444'],litmus:['Червоний','#dc2626'],methyl:['Червоний','#e11d48'],phenol:['Безбарвний','#f8fafc']},
  vinegar:{name:'Оцет',ph:3.0,medium:'acidic',mediumLabel:'Кисле середовище',note:'Водний розчин етанової (оцтової) кислоти; значення pH орієнтовне і залежить від складу.',liquid:'rgba(249,115,22,.12)',universal:['Оранжево-червоний','#f97316'],litmus:['Червоний','#ef4444'],methyl:['Червоний','#e11d48'],phenol:['Безбарвний','#f8fafc']},
  coffee:{name:'Чорна кава',ph:5.0,medium:'acidic',mediumLabel:'Кисле середовище',note:'Побутовий зразок; значення pH орієнтовне і залежить від сорту та способу приготування.',liquid:'rgba(234,179,8,.13)',universal:['Жовтий','#eab308'],litmus:['Червонувато-фіолетовий','#c026d3'],methyl:['Жовтий','#facc15'],phenol:['Безбарвний','#f8fafc']},
  water:{name:'Чиста вода',ph:7.0,medium:'neutral',mediumLabel:'Нейтральне середовище',note:'Модельне значення для чистої води за 25 °C.',liquid:'rgba(34,197,94,.14)',universal:['Зелений','#22c55e'],litmus:['Фіолетовий','#8b5cf6'],methyl:['Жовтий','#facc15'],phenol:['Безбарвний','#f8fafc']},
  soda:{name:'Розчин NaHCO₃',ph:8.3,medium:'basic',mediumLabel:'Лужне середовище',note:'0,1 моль/л розчин натрій гідрогенкарбонату; значення pH орієнтовне.',liquid:'rgba(6,182,212,.13)',universal:['Синьо-зелений','#06b6d4'],litmus:['Синій','#2563eb'],methyl:['Жовтий','#facc15'],phenol:['Безбарвний або дуже блідо-рожевий','#fce7f3']},
  naoh:{name:'Розчин NaOH',ph:13.0,medium:'basic',mediumLabel:'Лужне середовище',note:'0,1 моль/л натрій гідроксиду; модельне значення за 25 °C.',liquid:'rgba(124,58,237,.14)',universal:['Фіолетовий','#7c3aed'],litmus:['Синій','#1d4ed8'],methyl:['Жовтий','#facc15'],phenol:['Малиновий','#e11d48']}
};

let currentSample='hcl';
const sampleButtons=[...document.querySelectorAll('.ph-sample')];
const stepItems=[...document.querySelectorAll('.ph-steps span')];
const predictionSelect=document.getElementById('predictionSelect');
const predictionFeedback=document.getElementById('predictionFeedback');
const runButton=document.getElementById('runExperiment');
const resetButton=document.getElementById('resetExperiment');
const status=document.getElementById('experimentStatus');
const phDisplay=document.getElementById('phDisplay');
const beakerLiquid=document.getElementById('beakerLiquid');
const sampleBadge=document.getElementById('sampleBadge');
const resultPanel=document.getElementById('resultPanel');
const predictionResult=document.getElementById('predictionResult');
const resultPh=document.getElementById('resultPh');
const resultMedium=document.getElementById('resultMedium');
const resultSample=document.getElementById('resultSample');
const resultNote=document.getElementById('resultNote');
const resultExplanation=document.getElementById('resultExplanation');
const conclusion=document.getElementById('studentConclusion');
const indicatorEls={universal:[document.getElementById('universalText'),document.getElementById('universalPatch')],litmus:[document.getElementById('litmusText'),document.getElementById('litmusPatch')],methyl:[document.getElementById('methylText'),document.getElementById('methylPatch')],phenol:[document.getElementById('phenolText'),document.getElementById('phenolPatch')]};
const predictionLabels={acidic:'Кисле середовище',neutral:'Нейтральне середовище',basic:'Лужне середовище'};

function setActiveStep(index){stepItems.forEach((item,i)=>item.classList.toggle('is-active',i===index));}
function formatPh(value,digits=1){return value.toFixed(digits).replace('.',',');}
function getExplanation(sample){if(sample.medium==='acidic')return `pH ≈ ${formatPh(sample.ph)} менший за 7, тому середовище кисле. Індикатори змінюють забарвлення відповідно до своїх інтервалів переходу.`;if(sample.medium==='neutral')return 'За 25 °C модельне значення pH чистої води дорівнює 7, тому середовище нейтральне. Різні індикатори при цьому мають характерне для нейтрального середовища забарвлення.';return `pH ≈ ${formatPh(sample.ph)} більший за 7, тому середовище лужне. Забарвлення індикаторів відповідає їхній реакції на лужне середовище.`;}
function selectSample(id){currentSample=id;sampleButtons.forEach(button=>{const selected=button.dataset.sample===id;button.classList.toggle('is-selected',selected);button.setAttribute('aria-checked',String(selected));});resetExperiment(true);setActiveStep(1);}
function resetExperiment(clearPrediction=true){const sample=samples[currentSample];phDisplay.textContent='--.--';beakerLiquid.style.background=sample.liquid;sampleBadge.textContent=`Обрано: ${sample.name}`;status.textContent='Готово до досліду';resultPanel.hidden=true;predictionResult.textContent='';predictionResult.removeAttribute('data-state');runButton.disabled=false;conclusion.value='';if(clearPrediction)predictionSelect.value='';predictionFeedback.removeAttribute('data-state');predictionFeedback.innerHTML=predictionSelect.value?`<strong>Прогноз зафіксовано.</strong><span>${predictionLabels[predictionSelect.value]}</span>`:'<strong>Прогноз ще не обрано.</strong><span>Оберіть середовище, яке очікуєте для цього зразка.</span>';setActiveStep(predictionSelect.value?2:1);}
function applyIndicator(key,data){const [textEl,patchEl]=indicatorEls[key];textEl.textContent=data[0];patchEl.style.background=data[1];}
function runExperiment(){const sample=samples[currentSample];const prediction=predictionSelect.value;if(!prediction){status.textContent='Спочатку зробіть прогноз';predictionFeedback.innerHTML='<strong>Оберіть прогноз.</strong><span>Перед вимірюванням зафіксуйте очікуване середовище.</span>';setActiveStep(1);predictionSelect.focus();return;}runButton.disabled=true;resultPanel.hidden=true;setActiveStep(2);status.textContent='Вимірюємо pH...';phDisplay.textContent='...';sampleBadge.textContent=`Вимірюємо: ${sample.name}`;window.setTimeout(()=>{phDisplay.textContent=sample.ph.toFixed(2).replace('.',',');sampleBadge.textContent=`${sample.name} • pH ≈ ${formatPh(sample.ph)} • ${sample.mediumLabel.toLowerCase()}`;status.textContent='Вимірювання завершено';resultPh.textContent=`pH ≈ ${formatPh(sample.ph)}`;resultMedium.textContent=sample.mediumLabel;resultSample.textContent=sample.name;resultNote.textContent=sample.note;resultExplanation.textContent=getExplanation(sample);applyIndicator('universal',sample.universal);applyIndicator('litmus',sample.litmus);applyIndicator('methyl',sample.methyl);applyIndicator('phenol',sample.phenol);const correct=prediction===sample.medium;predictionResult.textContent=correct?'✓ Прогноз правильний':'✕ Прогноз не підтвердився';predictionResult.dataset.state=correct?'correct':'review';predictionFeedback.dataset.state=correct?'correct':'review';predictionFeedback.innerHTML=correct?`<strong>✓ Прогноз правильний.</strong><span>Ваш вибір: ${predictionLabels[prediction]}.</span>`:`<strong>✕ Прогноз не підтвердився.</strong><span>Ваш вибір: ${predictionLabels[prediction]}. Фактично: ${sample.mediumLabel.toLowerCase()}.</span>`;resultPanel.hidden=false;setActiveStep(3);resultPanel.scrollIntoView({behavior:'smooth',block:'nearest'});runButton.disabled=false;},850);}
sampleButtons.forEach(button=>button.addEventListener('click',()=>selectSample(button.dataset.sample)));
predictionSelect.addEventListener('change',()=>{if(!resultPanel.hidden)resetExperiment(false);predictionFeedback.removeAttribute('data-state');predictionFeedback.innerHTML=predictionSelect.value?`<strong>Прогноз зафіксовано.</strong><span>${predictionLabels[predictionSelect.value]}</span>`:'<strong>Прогноз ще не обрано.</strong><span>Оберіть середовище, яке очікуєте для цього зразка.</span>';setActiveStep(predictionSelect.value?2:1);});
runButton.addEventListener('click',runExperiment);resetButton.addEventListener('click',()=>resetExperiment(true));resetExperiment(false);