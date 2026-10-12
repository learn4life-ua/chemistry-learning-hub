const experiments = {
  gas: {
    label: 'NaHCO₃ + HCl',
    sign: 'gas',
    signLabel: 'Виділення газу',
    observationTitle: 'Виділяються бульбашки газу',
    observation: 'Після додавання HCl до натрій гідрогенкарбонату спостерігаємо інтенсивне виділення бульбашок.',
    explanation: 'Йони H⁺ реагують з гідрогенкарбонат-іонами HCO₃⁻. Утворюється нестійка карбонатна кислота, яка розкладається на воду і карбон(IV) оксид CO₂. Саме CO₂ спричиняє появу бульбашок.',
    equation: 'NaHCO₃ + HCl → NaCl + H₂O + CO₂↑',
    detail: 'Головна спостережувана ознака - виділення газу CO₂.',
    note: 'У цій реакції новою газоподібною речовиною є карбон(IV) оксид.',
    liquid: 'rgba(148,163,184,.16)',
    sceneClass: 'is-gas'
  },
  precipitate: {
    label: 'CuSO₄ + NaOH',
    sign: 'precipitate',
    signLabel: 'Утворення осаду',
    observationTitle: 'Утворюється блакитний осад',
    observation: 'Після змішування розчинів з’являється нерозчинний блакитний осад купрум(II) гідроксиду.',
    explanation: 'Йони Cu²⁺ взаємодіють з йонами OH⁻ і утворюють малорозчинний Cu(OH)₂. Поява твердої фази в суміші двох розчинів є характерною ознакою перебігу реакції обміну.',
    equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
    detail: 'Головна ознака - поява нерозчинного осаду Cu(OH)₂.',
    note: 'Скорочене йонне рівняння: Cu²⁺ + 2OH⁻ → Cu(OH)₂↓.',
    liquid: 'rgba(56,189,248,.16)',
    sceneClass: 'is-precipitate'
  },
  color: {
    label: 'Fe + CuSO₄',
    sign: 'color',
    signLabel: 'Зміна кольору / поява нового забарвлення',
    observationTitle: 'Змінюється вигляд розчину і металу',
    observation: 'На поверхні заліза поступово з’являється мідь, а інтенсивність блакитного забарвлення розчину CuSO₄ зменшується.',
    explanation: 'Залізо витісняє мідь із розчину її солі: атоми Fe окиснюються до Fe²⁺, а йони Cu²⁺ відновлюються до Cu. Тому змінюється колір розчину і на металі утворюється нова речовина - мідь.',
    equation: 'Fe + CuSO₄ → FeSO₄ + Cu',
    detail: 'Спостерігаємо зміну кольору та появу шару міді на залізі.',
    note: 'Тут є не одна ознака: змінюється забарвлення розчину і утворюється нова тверда речовина.',
    liquid: 'rgba(59,130,246,.24)',
    sceneClass: 'is-color'
  },
  energy: {
    label: 'Mg + O₂',
    sign: 'energy',
    signLabel: 'Виділення світла і теплоти',
    observationTitle: 'Спостерігаємо яскраве світіння',
    observation: 'Під час горіння магнію виділяються світло і теплота, а після реакції утворюється біла тверда речовина.',
    explanation: 'Магній реагує з киснем з утворенням магній оксиду MgO. Реакція супроводжується значним виділенням енергії у вигляді світла і теплоти.',
    equation: '2Mg + O₂ → 2MgO',
    detail: 'Головна ознака - інтенсивний світловий і тепловий ефект.',
    note: 'Додаткова ознака - утворення нової білої твердої речовини MgO.',
    liquid: 'transparent',
    sceneClass: 'is-energy'
  }
};

let currentExperiment = 'gas';

const experimentButtons = [...document.querySelectorAll('.signs-experiment')];
const predictionSelect = document.getElementById('predictionSelect');
const runButton = document.getElementById('runExperiment');
const resetButton = document.getElementById('resetExperiment');
const feedback = document.getElementById('predictionFeedback');
const status = document.getElementById('experimentStatus');
const scene = document.getElementById('scene');
const liquid = document.getElementById('liquid');
const sceneLabel = document.getElementById('sceneLabel');
const observationTitle = document.getElementById('observationTitle');
const observationText = document.getElementById('observationText');
const chemistryExplanation = document.getElementById('chemistryExplanation');
const resultPanel = document.getElementById('resultPanel');
const predictionResult = document.getElementById('predictionResult');
const resultSign = document.getElementById('resultSign');
const resultDetail = document.getElementById('resultDetail');
const resultEquation = document.getElementById('resultEquation');
const resultNote = document.getElementById('resultNote');
const stepItems = [...document.querySelectorAll('.signs-steps span')];

function setActiveStep(index) {
  stepItems.forEach((item, i) => item.classList.toggle('is-active', i === index));
}

function clearSceneClasses() {
  scene.classList.remove('is-gas', 'is-precipitate', 'is-color', 'is-energy');
}

function resetExperiment(clearPrediction = true) {
  const experiment = experiments[currentExperiment];
  clearSceneClasses();
  liquid.style.background = experiment.liquid;
  sceneLabel.textContent = experiment.label;
  observationTitle.textContent = 'Що спостерігаємо?';
  observationText.textContent = 'Запустіть дослід, щоб побачити зміни.';
  chemistryExplanation.textContent = 'Спостережувана ознака допомагає припустити, що утворилися нові речовини, але її потрібно тлумачити разом з умовами досліду.';
  status.textContent = 'Готово до досліду';
  resultPanel.hidden = true;
  predictionResult.textContent = '';
  predictionResult.removeAttribute('data-state');
  feedback.removeAttribute('data-state');
  feedback.innerHTML = '<strong>Зробіть прогноз.</strong><span>Після запуску досліду ви зможете порівняти його зі спостереженням.</span>';
  if (clearPrediction) predictionSelect.value = '';
  setActiveStep(predictionSelect.value ? 1 : 0);
}

function selectExperiment(id) {
  currentExperiment = id;
  experimentButtons.forEach(button => {
    const selected = button.dataset.exp === id;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-checked', String(selected));
  });
  resetExperiment(true);
}

function runExperiment() {
  if (!predictionSelect.value) {
    feedback.innerHTML = '<strong>Спочатку зробіть прогноз.</strong><span>Оберіть головну ознаку, яку очікуєте побачити.</span>';
    predictionSelect.focus();
    setActiveStep(1);
    return;
  }

  const experiment = experiments[currentExperiment];
  const correct = predictionSelect.value === experiment.sign;

  status.textContent = 'Проводимо дослід...';
  setActiveStep(2);
  clearSceneClasses();
  resultPanel.hidden = true;

  window.setTimeout(() => {
    scene.classList.add(experiment.sceneClass);
    liquid.style.background = experiment.liquid;
    observationTitle.textContent = experiment.observationTitle;
    observationText.textContent = experiment.observation;
    chemistryExplanation.textContent = experiment.explanation;
    status.textContent = 'Спостереження завершено';

    predictionResult.textContent = correct ? '✓ Прогноз правильний' : '✕ Прогноз не підтвердився';
    predictionResult.dataset.state = correct ? 'correct' : 'review';
    feedback.dataset.state = correct ? 'correct' : 'review';
    feedback.innerHTML = correct
      ? `<strong>✓ Прогноз правильний.</strong><span>${experiment.detail}</span>`
      : `<strong>✕ Прогноз не підтвердився.</strong><span>Головна ознака в цьому досліді: ${experiment.signLabel.toLowerCase()}.</span>`;

    resultSign.textContent = experiment.signLabel;
    resultDetail.textContent = experiment.detail;
    resultEquation.textContent = experiment.equation;
    resultNote.textContent = experiment.note;
    resultPanel.hidden = false;
    setActiveStep(3);
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 650);
}

experimentButtons.forEach(button => button.addEventListener('click', () => selectExperiment(button.dataset.exp)));
predictionSelect.addEventListener('change', () => {
  if (predictionSelect.value) {
    feedback.removeAttribute('data-state');
    feedback.innerHTML = '<strong>Прогноз зафіксовано.</strong><span>Тепер проведіть дослід і перевірте його.</span>';
    setActiveStep(2);
  } else {
    setActiveStep(1);
  }
});
runButton.addEventListener('click', runExperiment);
resetButton.addEventListener('click', () => resetExperiment(true));

resetExperiment(false);
