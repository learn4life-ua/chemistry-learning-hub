const samples = {
  hcl: {
    name: 'Розчин HCl',
    ph: 1.5,
    medium: 'acidic',
    mediumLabel: 'Кисле середовище',
    note: '0,03 моль/л хлоридної кислоти.',
    liquid: 'rgba(239,68,68,.12)',
    universal: ['Червоний', '#ef4444'],
    litmus: ['Червоний', '#dc2626'],
    methyl: ['Червоний', '#e11d48'],
    phenol: ['Безбарвний', '#f8fafc']
  },
  vinegar: {
    name: 'Оцет',
    ph: 3.0,
    medium: 'acidic',
    mediumLabel: 'Кисле середовище',
    note: 'Побутовий зразок; фактичне значення залежить від складу.',
    liquid: 'rgba(249,115,22,.12)',
    universal: ['Оранжево-червоний', '#f97316'],
    litmus: ['Червоний', '#ef4444'],
    methyl: ['Червоний', '#e11d48'],
    phenol: ['Безбарвний', '#f8fafc']
  },
  coffee: {
    name: 'Чорна кава',
    ph: 5.5,
    medium: 'acidic',
    mediumLabel: 'Слабкокисле середовище',
    note: 'Орієнтовне значення; pH залежить від сорту та способу приготування.',
    liquid: 'rgba(234,179,8,.13)',
    universal: ['Жовтий', '#eab308'],
    litmus: ['Перехідне фіолетово-червоне забарвлення', '#a855f7'],
    methyl: ['Жовтий', '#facc15'],
    phenol: ['Безбарвний', '#f8fafc']
  },
  water: {
    name: 'Дистильована вода',
    ph: 7.0,
    medium: 'neutral',
    mediumLabel: 'Нейтральне середовище',
    note: 'Модельне значення за 25 °C.',
    liquid: 'rgba(34,197,94,.14)',
    universal: ['Зелений', '#22c55e'],
    litmus: ['Фіолетовий', '#8b5cf6'],
    methyl: ['Жовтий', '#facc15'],
    phenol: ['Безбарвний', '#f8fafc']
  },
  soda: {
    name: 'Розчин NaHCO₃',
    ph: 8.3,
    medium: 'basic',
    mediumLabel: 'Слабколужне середовище',
    note: 'Орієнтовне значення для водного розчину гідрогенкарбонату натрію.',
    liquid: 'rgba(6,182,212,.13)',
    universal: ['Синьо-зелений', '#06b6d4'],
    litmus: ['Синій', '#2563eb'],
    methyl: ['Жовтий', '#facc15'],
    phenol: ['Ледь рожевий', '#f9a8d4']
  },
  naoh: {
    name: 'Розчин NaOH',
    ph: 13.0,
    medium: 'basic',
    mediumLabel: 'Сильнолужне середовище',
    note: '0,1 моль/л натрій гідроксиду; модельне значення за 25 °C.',
    liquid: 'rgba(124,58,237,.14)',
    universal: ['Фіолетовий', '#7c3aed'],
    litmus: ['Синій', '#1d4ed8'],
    methyl: ['Жовтий', '#facc15'],
    phenol: ['Малиновий', '#e11d48']
  }
};

let currentSample = 'hcl';

const sampleButtons = [...document.querySelectorAll('.ph-sample')];
const stepItems = [...document.querySelectorAll('.ph-steps span')];
const predictionSelect = document.getElementById('predictionSelect');
const runButton = document.getElementById('runExperiment');
const resetButton = document.getElementById('resetExperiment');
const status = document.getElementById('experimentStatus');
const phDisplay = document.getElementById('phDisplay');
const beakerLiquid = document.getElementById('beakerLiquid');
const sampleBadge = document.getElementById('sampleBadge');
const resultPanel = document.getElementById('resultPanel');
const predictionResult = document.getElementById('predictionResult');
const resultPh = document.getElementById('resultPh');
const resultMedium = document.getElementById('resultMedium');
const resultSample = document.getElementById('resultSample');
const resultNote = document.getElementById('resultNote');

const indicatorEls = {
  universal: [document.getElementById('universalText'), document.getElementById('universalPatch')],
  litmus: [document.getElementById('litmusText'), document.getElementById('litmusPatch')],
  methyl: [document.getElementById('methylText'), document.getElementById('methylPatch')],
  phenol: [document.getElementById('phenolText'), document.getElementById('phenolPatch')]
};

function setActiveStep(index) {
  stepItems.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === index));
}

function selectSample(id) {
  currentSample = id;
  sampleButtons.forEach(button => {
    const selected = button.dataset.sample === id;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-checked', String(selected));
  });
  resetExperiment(false);
  setActiveStep(predictionSelect.value ? 1 : 0);
}

function resetExperiment(clearPrediction = true) {
  const sample = samples[currentSample];
  phDisplay.textContent = '--.--';
  beakerLiquid.style.background = sample.liquid;
  sampleBadge.textContent = 'Оберіть прогноз і запустіть вимірювання';
  status.textContent = 'Готово до досліду';
  resultPanel.hidden = true;
  predictionResult.textContent = '';
  predictionResult.removeAttribute('data-state');
  runButton.disabled = false;
  if (clearPrediction) predictionSelect.value = '';
  setActiveStep(predictionSelect.value ? 1 : 0);
}

function applyIndicator(key, data) {
  const [textEl, patchEl] = indicatorEls[key];
  textEl.textContent = data[0];
  patchEl.style.background = data[1];
}

function runExperiment() {
  const sample = samples[currentSample];
  const prediction = predictionSelect.value;

  if (!prediction) {
    status.textContent = 'Спочатку зробіть прогноз';
    setActiveStep(1);
    predictionSelect.focus();
    return;
  }

  runButton.disabled = true;
  resultPanel.hidden = true;
  setActiveStep(2);
  status.textContent = 'Вимірюємо pH...';
  phDisplay.textContent = '...';
  sampleBadge.textContent = 'Електрод занурено у зразок';

  window.setTimeout(() => {
    phDisplay.textContent = sample.ph.toFixed(2);
    sampleBadge.textContent = `${sample.name}: pH ≈ ${sample.ph.toFixed(1)}`;
    status.textContent = 'Вимірювання завершено';

    resultPh.textContent = `pH ≈ ${sample.ph.toFixed(1)}`;
    resultMedium.textContent = sample.mediumLabel;
    resultSample.textContent = sample.name;
    resultNote.textContent = sample.note;

    applyIndicator('universal', sample.universal);
    applyIndicator('litmus', sample.litmus);
    applyIndicator('methyl', sample.methyl);
    applyIndicator('phenol', sample.phenol);

    const correct = prediction === sample.medium;
    predictionResult.textContent = correct ? 'Прогноз правильний' : 'Порівняйте з результатом';
    predictionResult.dataset.state = correct ? 'correct' : 'review';

    resultPanel.hidden = false;
    setActiveStep(3);
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    runButton.disabled = false;
  }, 850);
}

sampleButtons.forEach(button => button.addEventListener('click', () => selectSample(button.dataset.sample)));
predictionSelect.addEventListener('change', () => {
  if (!resultPanel.hidden) resetExperiment(false);
  setActiveStep(predictionSelect.value ? 1 : 0);
});
runButton.addEventListener('click', runExperiment);
resetButton.addEventListener('click', () => resetExperiment(true));

resetExperiment(false);
