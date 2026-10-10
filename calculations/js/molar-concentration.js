import './mass-fraction.js';
import { getFormulaData, formatNumber, formatFormula } from './formula-core.js';

const form = document.querySelector('#concentrationForm');
const modeButtons = [...document.querySelectorAll('[data-concentration-mode]')];
const formulaInput = document.querySelector('#concentrationFormulaInput');
const firstLabel = document.querySelector('#concentrationFirstLabel');
const firstInput = document.querySelector('#concentrationFirstInput');
const firstUnit = document.querySelector('#concentrationFirstUnit');
const volumeInput = document.querySelector('#concentrationVolumeInput');
const volumeUnit = document.querySelector('#concentrationVolumeUnit');
const helper = document.querySelector('#concentrationHelper');
const errorBox = document.querySelector('#concentrationError');
const resultEmpty = document.querySelector('#concentrationResultEmpty');
const resultContent = document.querySelector('#concentrationResultContent');
const resultFormula = document.querySelector('#concentrationResultFormula');
const resultValue = document.querySelector('#concentrationResultValue');
const resultUnit = document.querySelector('#concentrationResultUnit');
const steps = document.querySelector('#concentrationSteps');
const note = document.querySelector('#concentrationNote');

const modes = {
  'c-from-n': {
    label: 'Кількість речовини n',
    helper: 'Введіть кількість розчиненої речовини та об’єм розчину. Використовується c = n / V.',
    units: [
      { value: 'mol', label: 'моль' },
      { value: 'mmol', label: 'ммоль' }
    ]
  },
  'c-from-m': {
    label: 'Маса розчиненої речовини m',
    helper: 'Калькулятор визначить молярну масу за формулою, обчислить n = m / M, а потім c = n / V.',
    units: [
      { value: 'g', label: 'г' },
      { value: 'mg', label: 'мг' },
      { value: 'kg', label: 'кг' }
    ]
  },
  'n-from-c': {
    label: 'Молярна концентрація c',
    helper: 'Введіть молярну концентрацію та об’єм розчину. Використовується n = cV.',
    units: [
      { value: 'mol-L', label: 'моль/л' },
      { value: 'mmol-L', label: 'ммоль/л' }
    ]
  }
};

let activeMode = 'c-from-n';

function parsePositiveNumber(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error('Введіть числове значення.');
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error('Значення має бути додатним числом.');
  }
  return number;
}

function toMoles(value, unit) {
  return unit === 'mmol' ? value / 1000 : value;
}

function toGrams(value, unit) {
  if (unit === 'mg') return value / 1000;
  if (unit === 'kg') return value * 1000;
  return value;
}

function toLitres(value, unit) {
  return unit === 'mL' ? value / 1000 : value;
}

function toMolPerLitre(value, unit) {
  return unit === 'mmol-L' ? value / 1000 : value;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  formulaInput.removeAttribute('aria-invalid');
  firstInput.removeAttribute('aria-invalid');
  volumeInput.removeAttribute('aria-invalid');
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
    const active = button.dataset.concentrationMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  firstLabel.textContent = config.label;
  helper.textContent = config.helper;
  firstUnit.innerHTML = config.units.map(unit => `<option value="${unit.value}">${unit.label}</option>`).join('');
  clearError();
}

function renderResult(data, firstRaw, firstBase, volumeLitres, firstUnitValue, volumeUnitValue) {
  const formulaHTML = formatFormula(data.formula);
  resultFormula.innerHTML = formulaHTML;

  let finalValue;
  let finalUnit;
  let solutionSteps;

  if (activeMode === 'c-from-n') {
    finalValue = firstBase / volumeLitres;
    finalUnit = 'моль/л';
    solutionSteps = [
      `<strong>1.</strong> V = ${formatNumber(volumeLitres, 6)} л`,
      '<strong>2.</strong> c = n / V',
      `<strong>3.</strong> c = ${formatNumber(firstBase, 6)} моль / ${formatNumber(volumeLitres, 6)} л = ${formatNumber(finalValue, 5)} моль/л`
    ];
  }

  if (activeMode === 'c-from-m') {
    const amount = firstBase / data.totalMass;
    finalValue = amount / volumeLitres;
    finalUnit = 'моль/л';
    solutionSteps = [
      `<strong>1.</strong> M(${formulaHTML}) = ${formatNumber(data.totalMass, 3)} г/моль`,
      `<strong>2.</strong> n = m / M = ${formatNumber(firstBase, 6)} г / ${formatNumber(data.totalMass, 3)} г/моль = ${formatNumber(amount, 6)} моль`,
      `<strong>3.</strong> c = n / V = ${formatNumber(amount, 6)} моль / ${formatNumber(volumeLitres, 6)} л = ${formatNumber(finalValue, 5)} моль/л`
    ];
  }

  if (activeMode === 'n-from-c') {
    finalValue = firstBase * volumeLitres;
    finalUnit = 'моль';
    solutionSteps = [
      `<strong>1.</strong> V = ${formatNumber(volumeLitres, 6)} л`,
      '<strong>2.</strong> n = cV',
      `<strong>3.</strong> n = ${formatNumber(firstBase, 6)} моль/л × ${formatNumber(volumeLitres, 6)} л = ${formatNumber(finalValue, 6)} моль`
    ];
  }

  resultValue.textContent = formatNumber(finalValue, activeMode === 'n-from-c' ? 6 : 5);
  resultUnit.textContent = finalUnit;
  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');

  if (activeMode === 'c-from-m' && data.hasApproximateMass) {
    note.textContent = 'У формулі є елемент без стандартної атомної маси, тому результат є наближеним.';
  } else if (firstUnitValue.includes('mmol') || firstUnitValue === 'mg' || firstUnitValue === 'kg' || volumeUnitValue === 'mL') {
    note.textContent = 'Перед підстановкою значення автоматично переведено в молі, грами та літри.';
  } else {
    note.textContent = 'Молярну концентрацію подано в моль/л. У проміжних обчисленнях використано повні числові значення.';
  }

  resultEmpty.hidden = true;
  resultContent.hidden = false;
}

function calculate() {
  clearError();

  try {
    const data = getFormulaData(formulaInput.value);
    formulaInput.value = data.formula;

    const firstRaw = parsePositiveNumber(firstInput.value);
    const volumeRaw = parsePositiveNumber(volumeInput.value);
    const firstUnitValue = firstUnit.value;
    const volumeUnitValue = volumeUnit.value;
    const volumeLitres = toLitres(volumeRaw, volumeUnitValue);

    let firstBase;
    if (activeMode === 'c-from-n') firstBase = toMoles(firstRaw, firstUnitValue);
    if (activeMode === 'c-from-m') firstBase = toGrams(firstRaw, firstUnitValue);
    if (activeMode === 'n-from-c') firstBase = toMolPerLitre(firstRaw, firstUnitValue);

    renderResult(data, firstRaw, firstBase, volumeLitres, firstUnitValue, volumeUnitValue);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати розрахунок концентрації.');
  }
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => setMode(button.dataset.concentrationMode));
});

form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});

formulaInput?.addEventListener('input', clearError);
firstInput?.addEventListener('input', clearError);
volumeInput?.addEventListener('input', clearError);

document.querySelectorAll('[data-concentration-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode || 'c-from-n');
    formulaInput.value = button.dataset.formula || '';
    firstInput.value = button.dataset.value || '';
    volumeInput.value = button.dataset.volume || '';

    if ([...firstUnit.options].some(option => option.value === button.dataset.unit)) {
      firstUnit.value = button.dataset.unit;
    }
    if ([...volumeUnit.options].some(option => option.value === button.dataset.volumeUnit)) {
      volumeUnit.value = button.dataset.volumeUnit;
    }
    calculate();
  });
});

setMode(activeMode);
formulaInput.value = 'NaCl';
firstInput.value = '0,5';
volumeInput.value = '2';
firstUnit.value = 'mol';
volumeUnit.value = 'L';
calculate();
