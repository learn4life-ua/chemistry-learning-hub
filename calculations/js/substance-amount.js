import { getFormulaData, formatNumber, formatFormula } from './formula-core.js';

const AVOGADRO = 6.02214076e23;

const form = document.querySelector('#amountForm');
const modeButtons = [...document.querySelectorAll('[data-amount-mode]')];
const formulaInput = document.querySelector('#amountFormulaInput');
const valueInput = document.querySelector('#amountValueInput');
const unitSelect = document.querySelector('#amountUnit');
const valueLabel = document.querySelector('#amountValueLabel');
const helper = document.querySelector('#amountHelper');
const errorBox = document.querySelector('#amountError');
const resultEmpty = document.querySelector('#amountResultEmpty');
const resultContent = document.querySelector('#amountResultContent');
const resultFormula = document.querySelector('#amountResultFormula');
const resultValue = document.querySelector('#amountResultValue');
const resultUnit = document.querySelector('#amountResultUnit');
const steps = document.querySelector('#amountSteps');
const note = document.querySelector('#amountNote');

const modes = {
  'n-from-m': {
    label: 'Маса речовини m',
    helper: 'Введіть масу речовини. Калькулятор визначить M за формулою і використає n = m / M.',
    units: [
      { value: 'g', label: 'г' },
      { value: 'mg', label: 'мг' },
      { value: 'kg', label: 'кг' }
    ]
  },
  'm-from-n': {
    label: 'Кількість речовини n',
    helper: 'Введіть кількість речовини. Калькулятор використає m = nM.',
    units: [
      { value: 'mol', label: 'моль' },
      { value: 'mmol', label: 'ммоль' }
    ]
  },
  'N-from-n': {
    label: 'Кількість речовини n',
    helper: 'Введіть кількість речовини. Калькулятор використає N = nNₐ.',
    units: [
      { value: 'mol', label: 'моль' },
      { value: 'mmol', label: 'ммоль' }
    ]
  }
};

let activeMode = 'n-from-m';

function parsePositiveNumber(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error('Введіть числове значення.');
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error('Значення має бути додатним числом.');
  }
  return number;
}

function toBaseValue(value, unit) {
  if (unit === 'mg') return value / 1000;
  if (unit === 'kg') return value * 1000;
  if (unit === 'mmol') return value / 1000;
  return value;
}

function formatScientificHTML(value, fractionDigits = 4) {
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  if (exponent >= 6 || exponent <= -4) {
    const mantissa = value / (10 ** exponent);
    return `${formatNumber(mantissa, fractionDigits)} × 10<sup>${exponent}</sup>`;
  }
  return formatNumber(value, fractionDigits);
}

function setMode(mode) {
  if (!modes[mode]) return;
  activeMode = mode;
  const config = modes[mode];

  modeButtons.forEach(button => {
    const active = button.dataset.amountMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  valueLabel.textContent = config.label;
  helper.textContent = config.helper;
  unitSelect.innerHTML = config.units.map(unit => `<option value="${unit.value}">${unit.label}</option>`).join('');
  clearError();
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  formulaInput.removeAttribute('aria-invalid');
  valueInput.removeAttribute('aria-invalid');
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  resultContent.hidden = true;
  resultEmpty.hidden = false;
}

function renderResult(data, rawValue, baseValue, unit) {
  const formulaHTML = formatFormula(data.formula);
  resultFormula.innerHTML = formulaHTML;

  let finalHTML = '';
  let finalUnit = '';
  let solutionSteps = [];

  if (activeMode === 'n-from-m') {
    const amount = baseValue / data.totalMass;
    finalHTML = formatNumber(amount, 4);
    finalUnit = 'моль';
    solutionSteps = [
      `<strong>1.</strong> M(${formulaHTML}) = ${formatNumber(data.totalMass, 3)} г/моль`,
      '<strong>2.</strong> n = m / M',
      `<strong>3.</strong> n = ${formatNumber(baseValue, 6)} г / ${formatNumber(data.totalMass, 3)} г/моль = ${formatNumber(amount, 4)} моль`
    ];
  }

  if (activeMode === 'm-from-n') {
    const mass = baseValue * data.totalMass;
    finalHTML = formatNumber(mass, 4);
    finalUnit = 'г';
    solutionSteps = [
      `<strong>1.</strong> M(${formulaHTML}) = ${formatNumber(data.totalMass, 3)} г/моль`,
      '<strong>2.</strong> m = nM',
      `<strong>3.</strong> m = ${formatNumber(baseValue, 6)} моль × ${formatNumber(data.totalMass, 3)} г/моль = ${formatNumber(mass, 4)} г`
    ];
  }

  if (activeMode === 'N-from-n') {
    const particles = baseValue * AVOGADRO;
    finalHTML = formatScientificHTML(particles, 5);
    finalUnit = 'структурних частинок';
    solutionSteps = [
      '<strong>1.</strong> Nₐ = 6,02214076 × 10<sup>23</sup> моль<sup>−1</sup>',
      '<strong>2.</strong> N = nNₐ',
      `<strong>3.</strong> N = ${formatNumber(baseValue, 6)} моль × 6,02214076 × 10<sup>23</sup> моль<sup>−1</sup> = ${formatScientificHTML(particles, 5)}`
    ];
  }

  resultValue.innerHTML = finalHTML;
  resultUnit.textContent = finalUnit;
  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');

  if (data.hasApproximateMass && activeMode !== 'N-from-n') {
    note.textContent = 'У формулі є елемент без стандартної атомної маси, тому результат за молярною масою є наближеним.';
  } else if (unit === 'mg' || unit === 'kg' || unit === 'mmol') {
    note.textContent = 'Перед підстановкою значення автоматично переведено в базові одиниці: грами або молі.';
  } else {
    note.textContent = 'Результат подано з навчальним округленням; у проміжних обчисленнях використано повні числові значення.';
  }

  resultEmpty.hidden = true;
  resultContent.hidden = false;
}

function calculate() {
  clearError();

  try {
    const data = getFormulaData(formulaInput.value);
    formulaInput.value = data.formula;
    const rawValue = parsePositiveNumber(valueInput.value);
    const unit = unitSelect.value;
    const baseValue = toBaseValue(rawValue, unit);
    renderResult(data, rawValue, baseValue, unit);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати розрахунок.');
  }
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => setMode(button.dataset.amountMode));
});

form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});

formulaInput?.addEventListener('input', clearError);
valueInput?.addEventListener('input', clearError);

document.querySelectorAll('[data-amount-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode || 'n-from-m');
    formulaInput.value = button.dataset.formula || '';
    valueInput.value = button.dataset.value || '';
    if ([...unitSelect.options].some(option => option.value === button.dataset.unit)) {
      unitSelect.value = button.dataset.unit;
    }
    calculate();
  });
});

setMode(activeMode);
formulaInput.value = 'NaCl';
valueInput.value = '11,7';
unitSelect.value = 'g';
calculate();
