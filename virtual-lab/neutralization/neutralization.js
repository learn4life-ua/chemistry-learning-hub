const initialBaseVolume = 25.0;
const concentration = 0.1;
const maxAcidVolume = 50.0;
let acidVolume = 0;

const predictionSelect = document.getElementById('predictionSelect');
const addOne = document.getElementById('addOne');
const addFive = document.getElementById('addFive');
const resetButton = document.getElementById('resetExperiment');
const acidVolumeEl = document.getElementById('acidVolume');
const phDisplay = document.getElementById('phDisplay');
const mediumDisplay = document.getElementById('mediumDisplay');
const scaleMarker = document.getElementById('scaleMarker');
const neutralLiquid = document.getElementById('neutralLiquid');
const indicatorText = document.getElementById('indicatorText');
const observationText = document.getElementById('observationText');
const experimentStatus = document.getElementById('experimentStatus');
const predictionResult = document.getElementById('predictionResult');
const summaryState = document.getElementById('summaryState');
const summaryPh = document.getElementById('summaryPh');
const summaryRatio = document.getElementById('summaryRatio');
const summaryVolume = document.getElementById('summaryVolume');
const acidDrop = document.getElementById('acidDrop');
const stepItems = [...document.querySelectorAll('.neutral-steps span')];

function setActiveStep(index) {
  stepItems.forEach((item, i) => item.classList.toggle('is-active', i === index));
}

function calculatePh(vAcidMl) {
  const nOH = concentration * (initialBaseVolume / 1000);
  const nH = concentration * (vAcidMl / 1000);
  const totalVolumeL = (initialBaseVolume + vAcidMl) / 1000;
  const diff = nOH - nH;

  if (Math.abs(diff) < 1e-12) return 7.0;

  if (diff > 0) {
    const oh = diff / totalVolumeL;
    const pOH = -Math.log10(oh);
    return 14 - pOH;
  }

  const h = Math.abs(diff) / totalVolumeL;
  return -Math.log10(h);
}

function getMedium(ph) {
  if (ph < 6.95) return { key: 'acidic', label: 'кисле середовище' };
  if (ph > 7.05) return { key: 'basic', label: 'лужне середовище' };
  return { key: 'neutral', label: 'нейтральне середовище' };
}

function getIndicator(ph) {
  if (ph >= 10) return { text: 'Фенолфталеїн: малинове забарвлення', color: 'rgba(225,29,72,.35)' };
  if (ph >= 8.2) return { text: 'Фенолфталеїн: блідо-рожеве забарвлення', color: 'rgba(244,114,182,.18)' };
  return { text: 'Фенолфталеїн: безбарвний', color: 'rgba(148,163,184,.10)' };
}

function getRatioText() {
  if (acidVolume < initialBaseVolume - 1e-9) return 'NaOH у надлишку';
  if (Math.abs(acidVolume - initialBaseVolume) < 1e-9) return 'Кількості HCl і NaOH еквівалентні';
  return 'HCl у надлишку';
}

function getObservation(ph) {
  if (acidVolume < initialBaseVolume) {
    if (ph >= 10) return 'У розчині ще є надлишок гідроксид-іонів OH⁻. pH зменшується в міру додавання кислоти.';
    return 'Наближаємося до нейтралізації: забарвлення фенолфталеїну слабшає, pH швидко зменшується.';
  }
  if (Math.abs(acidVolume - initialBaseVolume) < 1e-9) {
    return 'Кількості речовини H⁺ і OH⁻ рівні. У цій моделі сильна кислота і сильний луг нейтралізували один одного.';
  }
  return 'Після нейтралізації додана кислота вже перебуває в надлишку, тому середовище стало кислим.';
}

function animateDrop() {
  acidDrop.classList.remove('is-falling');
  void acidDrop.offsetWidth;
  acidDrop.classList.add('is-falling');
}

function updatePrediction() {
  if (!predictionSelect.value) {
    predictionResult.textContent = 'Зробіть прогноз';
    predictionResult.removeAttribute('data-state');
    return;
  }
  const correct = predictionSelect.value === 'decrease';
  predictionResult.textContent = correct ? 'Прогноз правильний' : 'Перевірте прогноз за спостереженням';
  predictionResult.dataset.state = correct ? 'correct' : 'review';
}

function render() {
  const ph = calculatePh(acidVolume);
  const medium = getMedium(ph);
  const indicator = getIndicator(ph);

  acidVolumeEl.textContent = `${acidVolume.toFixed(1).replace('.', ',')} мл`;
  phDisplay.textContent = ph.toFixed(2).replace('.', ',');
  mediumDisplay.textContent = medium.label;
  scaleMarker.style.left = `${Math.max(0, Math.min(100, (ph / 14) * 100))}%`;
  neutralLiquid.style.background = indicator.color;
  neutralLiquid.style.height = `${Math.min(155, 118 + acidVolume * 0.7)}px`;
  indicatorText.textContent = indicator.text;
  observationText.textContent = getObservation(ph);

  summaryState.textContent = medium.label.charAt(0).toUpperCase() + medium.label.slice(1);
  summaryPh.textContent = `pH = ${ph.toFixed(2).replace('.', ',')}`;
  summaryRatio.textContent = getRatioText();
  summaryVolume.textContent = `Додано HCl: ${acidVolume.toFixed(1).replace('.', ',')} мл`;

  if (acidVolume === 0) {
    experimentStatus.textContent = 'Початковий стан';
    setActiveStep(predictionSelect.value ? 1 : 0);
  } else if (Math.abs(acidVolume - initialBaseVolume) < 1e-9) {
    experimentStatus.textContent = 'Нейтралізація';
    setActiveStep(3);
  } else {
    experimentStatus.textContent = acidVolume < initialBaseVolume ? 'Додаємо кислоту' : 'Кислота в надлишку';
    setActiveStep(2);
  }

  updatePrediction();
}

function addAcid(amount) {
  if (!predictionSelect.value) {
    experimentStatus.textContent = 'Спочатку зробіть прогноз';
    setActiveStep(0);
    predictionSelect.focus();
    return;
  }
  acidVolume = Math.min(maxAcidVolume, acidVolume + amount);
  animateDrop();
  render();
}

addOne.addEventListener('click', () => addAcid(1));
addFive.addEventListener('click', () => addAcid(5));
resetButton.addEventListener('click', () => {
  acidVolume = 0;
  predictionSelect.value = '';
  render();
});
predictionSelect.addEventListener('change', () => {
  updatePrediction();
  setActiveStep(predictionSelect.value ? 1 : 0);
});

render();
