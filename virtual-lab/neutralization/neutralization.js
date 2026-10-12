const initialBaseVolume = 25.0;
const concentration = 0.1;
const maxAcidVolume = 50.0;
let acidVolume = 0;
let selectedDose = 0;
let lastPrediction = null;

const predictionSelect = document.getElementById('predictionSelect');
const doseOne = document.getElementById('doseOne');
const doseFive = document.getElementById('doseFive');
const addSelected = document.getElementById('addSelected');
const resetButton = document.getElementById('resetExperiment');
const acidVolumeEl = document.getElementById('acidVolume');
const remainingVolume = document.getElementById('remainingVolume');
const doseChoiceText = document.getElementById('doseChoiceText');
const phDisplay = document.getElementById('phDisplay');
const mediumDisplay = document.getElementById('mediumDisplay');
const scaleMarker = document.getElementById('scaleMarker');
const neutralLiquid = document.getElementById('neutralLiquid');
const indicatorText = document.getElementById('indicatorText');
const observationText = document.getElementById('observationText');
const chemistryExplanation = document.getElementById('chemistryExplanation');
const experimentStatus = document.getElementById('experimentStatus');
const predictionResult = document.getElementById('predictionResult');
const predictionFeedback = document.getElementById('predictionFeedback');
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
  if (ph >= 10) return { key: 'colored', text: 'Фенолфталеїн: малинове забарвлення', color: 'rgba(225,29,72,.35)' };
  if (ph >= 8.2) return { key: 'colored', text: 'Фенолфталеїн: рожеве забарвлення', color: 'rgba(244,114,182,.22)' };
  return { key: 'colorless', text: 'Фенолфталеїн: безбарвний', color: 'rgba(148,163,184,.10)' };
}

function getPredictionCode(ph) {
  const medium = getMedium(ph);
  const indicator = getIndicator(ph);
  if (medium.key === 'basic' && indicator.key === 'colored') return 'basic-colored';
  if (medium.key === 'basic' && indicator.key === 'colorless') return 'basic-colorless';
  if (medium.key === 'neutral') return 'neutral-colorless';
  return 'acidic-colorless';
}

function getRatioText() {
  if (acidVolume < initialBaseVolume - 1e-9) return 'NaOH у надлишку';
  if (Math.abs(acidVolume - initialBaseVolume) < 1e-9) return 'Кількості HCl і NaOH еквівалентні';
  return 'HCl у надлишку';
}

function getObservation(ph) {
  if (acidVolume === 0) return 'Початковий розчин лужний, фенолфталеїн забарвлений.';
  if (acidVolume < initialBaseVolume) return 'HCl нейтралізує частину OH⁻, тому pH зменшується, але NaOH ще залишається в надлишку.';
  if (Math.abs(acidVolume - initialBaseVolume) < 1e-9) return 'Додано 25,0 мл HCl: кількості H⁺ і OH⁻ еквівалентні, pH ≈ 7, фенолфталеїн безбарвний.';
  return 'HCl уже в надлишку, тому середовище кисле, а фенолфталеїн безбарвний.';
}

function getChemistryExplanation(ph) {
  if (acidVolume === 0) {
    return 'У вихідному розчині NaOH є надлишок йонів OH⁻. Вони зумовлюють лужне середовище та забарвлення фенолфталеїну.';
  }
  if (acidVolume < initialBaseVolume) {
    return 'Йони H⁺, що надходять із HCl, реагують з OH⁻ за рівнянням H⁺ + OH⁻ → H₂O. Через зменшення концентрації OH⁻ pH падає. Поки OH⁻ у надлишку, середовище залишається лужним.';
  }
  if (Math.abs(acidVolume - initialBaseVolume) < 1e-9) {
    return 'За однакової концентрації розчинів 25,0 мл HCl нейтралізують 25,0 мл NaOH. Для сильної кислоти та сильного лугу за 25 °C це відповідає нейтральному середовищу з pH ≈ 7.';
  }
  return 'Після нейтралізації весь надлишок OH⁻ уже витрачений. Додаткові йони H⁺ залишаються в розчині, тому pH стає меншим за 7.';
}

function animateDrop() {
  acidDrop.classList.remove('is-falling');
  void acidDrop.offsetWidth;
  acidDrop.classList.add('is-falling');
}

function selectDose(amount) {
  selectedDose = amount;
  doseOne.classList.toggle('is-selected', amount === 1);
  doseFive.classList.toggle('is-selected', amount === 5);
  predictionSelect.disabled = false;
  predictionSelect.value = '';
  doseChoiceText.textContent = `Обрано порцію: + ${amount.toFixed(1).replace('.0', '')} мл HCl.`;
  predictionFeedback.removeAttribute('data-state');
  predictionFeedback.innerHTML = '<strong>Тепер зробіть прогноз.</strong><span>Оцініть, яким буде середовище і що станеться з фенолфталеїном після додавання саме цієї порції.</span>';
  setActiveStep(1);
}

function explainPrediction(actualCode, targetPh) {
  const medium = getMedium(targetPh);
  const indicator = getIndicator(targetPh);
  return `Після цього кроку pH ≈ ${targetPh.toFixed(2).replace('.', ',')}, ${medium.label}; ${indicator.text.toLowerCase()}.`;
}

function checkPrediction(prediction, actualCode, targetPh) {
  const correct = prediction === actualCode;
  const explanation = explainPrediction(actualCode, targetPh);
  lastPrediction = { correct, explanation };

  predictionResult.textContent = correct ? '✓ Прогноз правильний' : '✕ Прогноз не підтвердився';
  predictionResult.dataset.state = correct ? 'correct' : 'review';
  predictionFeedback.dataset.state = correct ? 'correct' : 'review';
  predictionFeedback.innerHTML = correct
    ? `<strong>✓ Прогноз правильний.</strong><span>${explanation}</span>`
    : `<strong>✕ Прогноз не підтвердився.</strong><span>${explanation}</span>`;
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
  neutralLiquid.style.height = `${Math.min(142, 96 + acidVolume * 0.65)}px`;
  indicatorText.textContent = indicator.text;
  observationText.textContent = getObservation(ph);
  chemistryExplanation.textContent = getChemistryExplanation(ph);

  summaryState.textContent = medium.label.charAt(0).toUpperCase() + medium.label.slice(1);
  summaryPh.textContent = `pH = ${ph.toFixed(2).replace('.', ',')}`;
  summaryRatio.textContent = getRatioText();
  summaryVolume.textContent = `Додано HCl: ${acidVolume.toFixed(1).replace('.', ',')} мл`;

  const remaining = initialBaseVolume - acidVolume;
  if (remaining > 0) remainingVolume.textContent = `До нейтралізації: ${remaining.toFixed(1).replace('.', ',')} мл HCl`;
  else if (Math.abs(remaining) < 1e-9) remainingVolume.textContent = 'Досягнуто нейтралізації для цієї моделі';
  else remainingVolume.textContent = `Надлишок HCl: ${Math.abs(remaining).toFixed(1).replace('.', ',')} мл`;

  if (acidVolume === 0) {
    experimentStatus.textContent = 'Початковий стан';
  } else if (Math.abs(acidVolume - initialBaseVolume) < 1e-9) {
    experimentStatus.textContent = 'Нейтралізація';
  } else {
    experimentStatus.textContent = acidVolume < initialBaseVolume ? 'NaOH у надлишку' : 'HCl у надлишку';
  }
}

function addDose() {
  if (!selectedDose) {
    predictionFeedback.removeAttribute('data-state');
    predictionFeedback.innerHTML = '<strong>Оберіть порцію HCl.</strong><span>Спочатку натисніть +1 мл або +5 мл.</span>';
    setActiveStep(0);
    return;
  }
  if (!predictionSelect.value) {
    predictionFeedback.removeAttribute('data-state');
    predictionFeedback.innerHTML = '<strong>Оберіть прогноз.</strong><span>Перед додаванням кислоти спрогнозуйте середовище і забарвлення фенолфталеїну.</span>';
    predictionSelect.focus();
    setActiveStep(1);
    return;
  }

  const targetVolume = Math.min(maxAcidVolume, acidVolume + selectedDose);
  const targetPh = calculatePh(targetVolume);
  const actualCode = getPredictionCode(targetPh);
  const prediction = predictionSelect.value;

  acidVolume = targetVolume;
  animateDrop();
  render();
  checkPrediction(prediction, actualCode, targetPh);
  setActiveStep(2);

  selectedDose = 0;
  doseOne.classList.remove('is-selected');
  doseFive.classList.remove('is-selected');
  predictionSelect.value = '';
  predictionSelect.disabled = true;
  doseChoiceText.textContent = 'Оберіть порцію для наступного кроку.';

  window.setTimeout(() => setActiveStep(3), 500);
}

doseOne.addEventListener('click', () => selectDose(1));
doseFive.addEventListener('click', () => selectDose(5));
addSelected.addEventListener('click', addDose);
resetButton.addEventListener('click', () => {
  acidVolume = 0;
  selectedDose = 0;
  lastPrediction = null;
  doseOne.classList.remove('is-selected');
  doseFive.classList.remove('is-selected');
  predictionSelect.value = '';
  predictionSelect.disabled = true;
  predictionResult.textContent = 'Прогноз ще не перевірено';
  predictionResult.removeAttribute('data-state');
  predictionFeedback.removeAttribute('data-state');
  predictionFeedback.innerHTML = '<strong>Спочатку оберіть порцію HCl.</strong><span>Після цього спрогнозуйте середовище та забарвлення фенолфталеїну.</span>';
  doseChoiceText.textContent = 'Порцію ще не обрано.';
  render();
  setActiveStep(0);
});
predictionSelect.addEventListener('change', () => {
  if (predictionSelect.value) {
    predictionFeedback.removeAttribute('data-state');
    predictionFeedback.innerHTML = '<strong>Прогноз зафіксовано.</strong><span>Тепер натисніть «Додати обрану порцію» і перевірте результат.</span>';
    setActiveStep(2);
  }
});

render();
