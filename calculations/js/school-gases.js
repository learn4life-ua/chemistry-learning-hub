import { getFormulaData, formatFormula, formatNumber } from './formula-core.js';

const MOLAR_VOLUME_NORMAL = 22.4;
const AIR_MOLAR_MASS = 29;

const form = document.querySelector('#schoolGasForm');
const modeButtons = [...document.querySelectorAll('[data-school-gas-mode]')];
const formulaWrap = document.querySelector('#schoolGasFormulaWrap');
const formulaInput = document.querySelector('#schoolGasFormulaInput');
const primaryLabel = document.querySelector('#schoolGasPrimaryLabel');
const primaryInput = document.querySelector('#schoolGasPrimaryInput');
const primaryUnit = document.querySelector('#schoolGasPrimaryUnit');
const referenceWrap = document.querySelector('#schoolGasReferenceWrap');
const referenceSelect = document.querySelector('#schoolGasReference');
const helper = document.querySelector('#schoolGasHelper');
const errorBox = document.querySelector('#schoolGasError');
const resultEmpty = document.querySelector('#schoolGasResultEmpty');
const resultContent = document.querySelector('#schoolGasResultContent');
const resultFormula = document.querySelector('#schoolGasResultFormula');
const resultValue = document.querySelector('#schoolGasResultValue');
const resultUnit = document.querySelector('#schoolGasResultUnit');
const steps = document.querySelector('#schoolGasSteps');
const note = document.querySelector('#schoolGasNote');

let activeMode = 'n-from-v';

const modes = {
  'n-from-v': {
    label: 'Об\'єм газу V',
    units: '<option value="L">л</option><option value="mL">мл</option>',
    formula: false,
    reference: false
  },
  'v-from-n': {
    label: 'Кількість речовини n',
    units: '<option value="mol">моль</option><option value="mmol">ммоль</option>',
    formula: false,
    reference: false
  },
  'm-from-v': {
    label: 'Об\'єм газу V',
    units: '<option value="L">л</option><option value="mL">мл</option>',
    formula: true,
    reference: false
  },
  density: {
    label: 'Формула газу',
    units: '',
    formula: true,
    reference: true
  }
};

function parsePositive(value, label) {
  const number = Number(String(value ?? '').trim().replace(',', '.'));
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} має бути додатним числом.`);
  return number;
}

function toLitres(value, unit) {
  return unit === 'mL' ? value / 1000 : value;
}

function toMoles(value, unit) {
  return unit === 'mmol' ? value / 1000 : value;
}

function frac(top, bottom) {
  return `<span class="math-frac"><span>${top}</span><span>${bottom}</span></span>`;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  resultContent.hidden = true;
  resultEmpty.hidden = false;
}

function setMode(mode) {
  if (!modes[mode]) return;
  activeMode = mode;
  const config = modes[mode];
  modeButtons.forEach(button => {
    const active = button.dataset.schoolGasMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  formulaWrap.hidden = !config.formula;
  referenceWrap.hidden = !config.reference;
  document.querySelector('#schoolGasPrimaryWrap').hidden = mode === 'density';
  primaryLabel.textContent = config.label;
  primaryUnit.innerHTML = config.units;

  if (mode === 'n-from-v') helper.innerHTML = `За нормальних умов V<sub>m</sub> = 22,4 л/моль, тому n = ${frac('V', 'V<sub>m</sub>')}.`;
  if (mode === 'v-from-n') helper.innerHTML = 'За нормальних умов V = nV<sub>m</sub>, де V<sub>m</sub> = 22,4 л/моль.';
  if (mode === 'm-from-v') helper.innerHTML = `Спочатку n = ${frac('V', 'V<sub>m</sub>')}, потім m = nM.`;
  if (mode === 'density') helper.innerHTML = `D = ${frac('M(газу)', 'M(еталона)')}.`;

  clearError();
  resultContent.hidden = true;
  resultEmpty.hidden = false;
}

function render(title, value, unit, formulaHtml, solutionSteps, resultNote) {
  resultFormula.innerHTML = formulaHtml || title;
  resultValue.textContent = formatNumber(value, 6);
  resultUnit.textContent = unit;
  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');
  note.textContent = resultNote;
  resultEmpty.hidden = true;
  resultContent.hidden = false;
}

function calculate() {
  clearError();
  try {
    if (activeMode === 'n-from-v') {
      const raw = parsePositive(primaryInput.value, 'Об\'єм');
      const volume = toLitres(raw, primaryUnit.value);
      const amount = volume / MOLAR_VOLUME_NORMAL;
      render('Кількість речовини', amount, 'моль', 'n', [
        `<strong>1.</strong> V<sub>m</sub> = 22,4 л/моль`,
        `<strong>2.</strong> n = ${frac('V', 'V<sub>m</sub>')}`,
        `<strong>3.</strong> n = ${frac(`${formatNumber(volume, 6)} л`, '22,4 л/моль')} = ${formatNumber(amount, 6)} моль`
      ], 'Нормальні умови: 0 °C і 101,325 кПа. Використано округлене значення молярного об\'єму 22,4 л/моль.');
    }

    if (activeMode === 'v-from-n') {
      const raw = parsePositive(primaryInput.value, 'Кількість речовини');
      const amount = toMoles(raw, primaryUnit.value);
      const volume = amount * MOLAR_VOLUME_NORMAL;
      render('Об\'єм газу', volume, 'л', 'V', [
        `<strong>1.</strong> V = nV<sub>m</sub>`,
        `<strong>2.</strong> V = ${formatNumber(amount, 6)} моль · 22,4 л/моль`,
        `<strong>3.</strong> V = ${formatNumber(volume, 6)} л`
      ], 'Розрахунок виконано для нормальних умов.');
    }

    if (activeMode === 'm-from-v') {
      const data = getFormulaData(formulaInput.value);
      const raw = parsePositive(primaryInput.value, 'Об\'єм');
      const volume = toLitres(raw, primaryUnit.value);
      const amount = volume / MOLAR_VOLUME_NORMAL;
      const mass = amount * data.totalMass;
      render('Маса газу', mass, 'г', formatFormula(data.formula), [
        `<strong>1.</strong> M(${formatFormula(data.formula)}) = ${formatNumber(data.totalMass, 3)} г/моль`,
        `<strong>2.</strong> n = ${frac(`${formatNumber(volume, 6)} л`, '22,4 л/моль')} = ${formatNumber(amount, 6)} моль`,
        `<strong>3.</strong> m = nM = ${formatNumber(amount, 6)} · ${formatNumber(data.totalMass, 3)} = ${formatNumber(mass, 6)} г`
      ], 'Розрахунок виконано для нормальних умов.');
    }

    if (activeMode === 'density') {
      const data = getFormulaData(formulaInput.value);
      const reference = referenceSelect.value;
      const referenceMass = reference === 'air' ? AIR_MOLAR_MASS : getFormulaData(reference).totalMass;
      const density = data.totalMass / referenceMass;
      const referenceLabel = reference === 'air' ? 'повітря' : formatFormula(reference);
      render('Відносна густина', density, '', formatFormula(data.formula), [
        `<strong>1.</strong> M(${formatFormula(data.formula)}) = ${formatNumber(data.totalMass, 3)} г/моль`,
        `<strong>2.</strong> M(${referenceLabel}) ${reference === 'air' ? '≈' : '='} ${formatNumber(referenceMass, 3)} г/моль`,
        `<strong>3.</strong> D = ${frac(formatNumber(data.totalMass, 3), formatNumber(referenceMass, 3))} = ${formatNumber(density, 5)}`
      ], reference === 'air' ? 'Для повітря використано наближене значення M(повітря) ≈ 29 г/моль.' : 'Відносна густина є безрозмірною величиною.');
    }
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати газовий розрахунок.');
  }
}

modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.schoolGasMode)));
form?.addEventListener('submit', event => { event.preventDefault(); calculate(); });
[formulaInput, primaryInput].forEach(input => input?.addEventListener('input', clearError));

document.querySelectorAll('[data-school-gas-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode);
    formulaInput.value = button.dataset.formula || '';
    primaryInput.value = button.dataset.value || '';
    if (button.dataset.unit && [...primaryUnit.options].some(option => option.value === button.dataset.unit)) primaryUnit.value = button.dataset.unit;
    if (button.dataset.reference) referenceSelect.value = button.dataset.reference;
    calculate();
  });
});

setMode(activeMode);
primaryInput.value = '22,4';
calculate();