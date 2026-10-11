const experiments = {
  agcl: {
    correct: 'white',
    formsPrecipitate: true,
    solution: 'rgba(241,245,249,.9)',
    drop: '#cbd5e1',
    cloud: 'rgba(255,255,255,.95)',
    sediment: '#ffffff',
    observation: 'Утворився білий осад аргентум(I) хлориду AgCl.',
    molecular: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
    ionic: 'Ag⁺ + Cl⁻ → AgCl↓'
  },
  cuoh2: {
    correct: 'blue',
    formsPrecipitate: true,
    solution: 'rgba(186,230,253,.55)',
    drop: '#dbeafe',
    cloud: 'rgba(14,165,233,.75)',
    sediment: '#0284c7',
    observation: 'Утворився блакитний осад купрум(II) гідроксиду Cu(OH)₂.',
    molecular: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
    ionic: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓'
  },
  feoh3: {
    correct: 'brown',
    formsPrecipitate: true,
    solution: 'rgba(254,240,138,.55)',
    drop: '#fde68a',
    cloud: 'rgba(180,83,9,.78)',
    sediment: '#9a3412',
    observation: 'Утворився бурий осад ферум(III) гідроксиду Fe(OH)₃.',
    molecular: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl',
    ionic: 'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓'
  },
  baso4: {
    correct: 'white',
    formsPrecipitate: true,
    solution: 'rgba(241,245,249,.88)',
    drop: '#e2e8f0',
    cloud: 'rgba(248,250,252,.98)',
    sediment: '#f1f5f9',
    observation: 'Утворився білий осад барій сульфату BaSO₄.',
    molecular: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl',
    ionic: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓'
  },
  'nacl-kno3': {
    correct: 'none',
    formsPrecipitate: false,
    solution: 'rgba(241,245,249,.9)',
    drop: '#e2e8f0',
    cloud: 'transparent',
    sediment: 'transparent',
    observation: 'Видимих змін немає: розчин залишається прозорим, осад не утворюється.',
    molecular: 'NaCl(aq) + KNO₃(aq): усі йони залишаються у розчині.',
    ionic: 'Скорочене йонне рівняння не складають, оскільки реакція з утворенням осаду не відбувається.'
  }
};

let currentExperiment = 'agcl';

const pairButtons = [...document.querySelectorAll('.precip-pair')];
const stepItems = [...document.querySelectorAll('.precip-steps span')];
const predictionSelect = document.getElementById('predictionSelect');
const runButton = document.getElementById('runExperiment');
const resetButton = document.getElementById('resetExperiment');
const status = document.getElementById('experimentStatus');
const observation = document.getElementById('observationText');
const solution = document.getElementById('tubeSolution');
const cloud = document.getElementById('precipCloud');
const sediment = document.getElementById('precipSediment');
const drop = document.getElementById('precipDrop');
const dropperLiquid = document.getElementById('dropperLiquid');
const resultPanel = document.getElementById('resultPanel');
const resultObservation = document.getElementById('resultObservation');
const molecularEquation = document.getElementById('molecularEquation');
const ionicEquation = document.getElementById('ionicEquation');
const molecularLabel = document.getElementById('molecularLabel');
const ionicLabel = document.getElementById('ionicLabel');
const predictionResult = document.getElementById('predictionResult');
const conclusion = document.getElementById('studentConclusion');

function setActiveStep(index) {
  stepItems.forEach((item, itemIndex) => {
    item.classList.toggle('is-active', itemIndex === index);
  });
}

function selectExperiment(id) {
  currentExperiment = id;
  pairButtons.forEach(button => {
    const selected = button.dataset.exp === id;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-checked', String(selected));
  });
  resetExperiment(false);
  setActiveStep(predictionSelect.value ? 1 : 0);
}

function resetExperiment(clearPrediction = true) {
  const exp = experiments[currentExperiment];
  cloud.classList.remove('is-visible');
  cloud.style.background = 'transparent';
  sediment.style.height = '0';
  sediment.style.background = 'transparent';
  solution.style.background = exp.solution;
  drop.style.background = exp.drop;
  dropperLiquid.style.background = exp.drop;
  drop.classList.remove('is-falling');
  status.textContent = 'Готово до досліду';
  observation.textContent = 'У пробірці міститься вихідний розчин. Оберіть прогноз і запустіть дослід.';
  resultPanel.hidden = true;
  molecularLabel.textContent = 'Молекулярне рівняння';
  ionicLabel.textContent = 'Скорочене йонне рівняння';
  conclusion.value = '';
  conclusion.placeholder = 'Наприклад: реакція відбулася, оскільки спостерігалося утворення осаду...';
  runButton.disabled = false;
  if (clearPrediction) predictionSelect.value = '';
  setActiveStep(predictionSelect.value ? 1 : 0);
}

function runExperiment() {
  const exp = experiments[currentExperiment];
  const prediction = predictionSelect.value;

  if (!prediction) {
    status.textContent = 'Спочатку зробіть прогноз';
    setActiveStep(1);
    predictionSelect.focus();
    return;
  }

  runButton.disabled = true;
  resultPanel.hidden = true;
  cloud.classList.remove('is-visible');
  sediment.style.height = '0';
  sediment.style.background = 'transparent';
  setActiveStep(2);
  status.textContent = 'Додаємо реактив...';
  observation.textContent = 'Реактив надходить у пробірку. Спостерігайте за змінами.';

  drop.classList.remove('is-falling');
  void drop.offsetWidth;
  drop.classList.add('is-falling');

  window.setTimeout(() => {
    if (exp.formsPrecipitate) {
      cloud.style.background = exp.cloud;
      cloud.classList.add('is-visible');
      status.textContent = 'Відбувається реакція';
      observation.textContent = 'Розчин мутніє, з’являється тверда фаза.';
    } else {
      status.textContent = 'Спостерігаємо';
      observation.textContent = 'Розчин залишається прозорим. Видимих змін не спостерігається.';
    }
  }, 650);

  window.setTimeout(() => {
    if (exp.formsPrecipitate) {
      sediment.style.background = exp.sediment;
      sediment.style.height = '40px';
      status.textContent = 'Осад утворився';
      molecularLabel.textContent = 'Молекулярне рівняння';
      ionicLabel.textContent = 'Скорочене йонне рівняння';
      conclusion.placeholder = 'Наприклад: реакція відбулася, оскільки спостерігалося утворення осаду...';
    } else {
      sediment.style.height = '0';
      status.textContent = 'Осад не утворився';
      molecularLabel.textContent = 'Результат змішування';
      ionicLabel.textContent = 'Скорочене йонне рівняння';
      conclusion.placeholder = 'Наприклад: осад не утворився, оскільки всі йони залишилися у розчині...';
    }

    observation.textContent = exp.observation;
    resultObservation.textContent = exp.observation;
    molecularEquation.textContent = exp.molecular;
    ionicEquation.textContent = exp.ionic;

    const correct = prediction === exp.correct;
    predictionResult.textContent = correct ? 'Прогноз правильний' : 'Порівняйте з результатом';
    predictionResult.dataset.state = correct ? 'correct' : 'review';

    resultPanel.hidden = false;
    setActiveStep(3);
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    runButton.disabled = false;
  }, 1450);
}

pairButtons.forEach(button => {
  button.addEventListener('click', () => selectExperiment(button.dataset.exp));
});

predictionSelect.addEventListener('change', () => {
  if (!resultPanel.hidden) {
    resetExperiment(false);
  }
  setActiveStep(predictionSelect.value ? 1 : 0);
});

runButton.addEventListener('click', runExperiment);
resetButton.addEventListener('click', () => resetExperiment(true));

resetExperiment(false);
