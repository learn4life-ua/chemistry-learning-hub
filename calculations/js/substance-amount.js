import { getFormulaData, formatNumber, formatFormula } from './formula-core.js';

const AVOGADRO = 6.02214076e23;

const form = document.querySelector('#amountForm');
const modeButtons = [...document.querySelectorAll('[data-amount-mode]')];
const fields = document.querySelector('#amountFields');
const formulaWrap = document.querySelector('#amountFormulaWrap');
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

function frac(top, bottom) {
  return `<span class="math-frac"><span>${top}</span><span>${bottom}</span></span>`;
}

const modes = {
  'n-from-m': {
    label: 'Маса речовини m',
    helper: `n = ${frac('m', 'M')}.`,
    requiresFormula: true,
    units: [
      { value: 'g', label: 'г' },
      { value: 'mg', label: 'мг' },
      { value: 'kg', label: 'кг' }
    ]
  },
  'm-from-n': {
    label: 'Кількість речовини n',
    helper: 'm = nM.',
    requiresFormula: true,
    units: [
      { value: 'mol', label: 'моль' },
      { value: 'mmol', label: 'ммоль' }
    ]
  },
  'N-from-n': {
    label: 'Кількість речовини n',
    helper: 'N = nNₐ. Формула речовини для цього розрахунку не потрібна.',
    requiresFormula: false,
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

  formulaWrap.hidden = !config.requiresFormula;
  fields.style.gridTemplateColumns = config.requiresFormula ? '' : 'minmax(0,1fr)';
  valueLabel.textContent = config.label;
  helper.innerHTML = config.helper;
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

function renderResult(data, baseValue, unit) {
  const formulaHTML = data ? formatFormula(data.formula) : 'N';
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
      `<strong>2.</strong> n = ${frac('m', 'M')}`,
      `<strong>3.</strong> n = ${frac(`${formatNumber(baseValue, 6)} г`, `${formatNumber(data.totalMass, 3)} г/моль`)} = ${formatNumber(amount, 4)} моль`
    ];
  }

  if (activeMode === 'm-from-n') {
    const mass = baseValue * data.totalMass;
    finalHTML = formatNumber(mass, 4);
    finalUnit = 'г';
    solutionSteps = [
      `<strong>1.</strong> M(${formulaHTML}) = ${formatNumber(data.totalMass, 3)} г/моль`,
      '<strong>2.</strong> m = nM',
      `<strong>3.</strong> m = ${formatNumber(baseValue, 6)} моль · ${formatNumber(data.totalMass, 3)} г/моль = ${formatNumber(mass, 4)} г`
    ];
  }

  if (activeMode === 'N-from-n') {
    const particles = baseValue * AVOGADRO;
    finalHTML = formatScientificHTML(particles, 5);
    finalUnit = 'структурних частинок';
    solutionSteps = [
      '<strong>1.</strong> Nₐ = 6,02214076 × 10<sup>23</sup> моль<sup>−1</sup>',
      '<strong>2.</strong> N = nNₐ',
      `<strong>3.</strong> N = ${formatNumber(baseValue, 6)} моль · 6,02214076 × 10<sup>23</sup> моль<sup>−1</sup> = ${formatScientificHTML(particles, 5)}`
    ];
  }

  resultValue.innerHTML = finalHTML;
  resultUnit.textContent = finalUnit;
  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');

  if (data?.hasApproximateMass) {
    note.textContent = 'Для елемента без стандартної атомної маси використано масове число, тому результат є наближеним.';
  } else if (unit === 'mg' || unit === 'kg' || unit === 'mmol') {
    note.textContent = 'Перед розрахунком значення переведено у грами або молі.';
  } else {
    note.textContent = 'Результат округлено до зручної кількості знаків.';
  }

  resultEmpty.hidden = true;
  resultContent.hidden = false;
}

function calculate() {
  clearError();

  try {
    const config = modes[activeMode];
    const data = config.requiresFormula ? getFormulaData(formulaInput.value) : null;
    if (data) formulaInput.value = data.formula;

    const rawValue = parsePositiveNumber(valueInput.value);
    const unit = unitSelect.value;
    const baseValue = toBaseValue(rawValue, unit);
    renderResult(data, baseValue, unit);
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