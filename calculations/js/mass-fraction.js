import { getFormulaData, formatNumber, formatFormula } from './formula-core.js';

const form = document.querySelector('#massFractionForm');
const modeButtons = [...document.querySelectorAll('[data-fraction-mode]')];
const solutionFields = document.querySelector('#fractionSolutionFields');
const compoundFields = document.querySelector('#fractionCompoundFields');
const firstLabel = document.querySelector('#fractionFirstLabel');
const secondLabel = document.querySelector('#fractionSecondLabel');
const firstInput = document.querySelector('#fractionFirstInput');
const secondInput = document.querySelector('#fractionSecondInput');
const firstUnit = document.querySelector('#fractionFirstUnit');
const secondUnit = document.querySelector('#fractionSecondUnit');
const formulaInput = document.querySelector('#fractionFormulaInput');
const elementInput = document.querySelector('#fractionElementInput');
const helper = document.querySelector('#fractionHelper');
const errorBox = document.querySelector('#fractionError');
const resultEmpty = document.querySelector('#fractionResultEmpty');
const resultContent = document.querySelector('#fractionResultContent');
const resultTitle = document.querySelector('#fractionResultTitle');
const resultValue = document.querySelector('#fractionResultValue');
const resultUnit = document.querySelector('#fractionResultUnit');
const steps = document.querySelector('#fractionSteps');
const note = document.querySelector('#fractionNote');

const massUnits = [
  { value: 'g', label: 'г' },
  { value: 'mg', label: 'мг' },
  { value: 'kg', label: 'кг' }
];

const modes = {
  'omega-solution': {
    helper: 'Введіть масу розчиненої речовини та масу всього розчину. Використовуємо ω = m(речовини) / m(розчину) × 100%.',
    firstLabel: 'Маса розчиненої речовини',
    secondLabel: 'Маса розчину'
  },
  'solute-from-omega': {
    helper: 'Введіть масову частку у відсотках і масу розчину. Використовуємо m(речовини) = ω · m(розчину) / 100%.',
    firstLabel: 'Масова частка ω',
    secondLabel: 'Маса розчину'
  },
  'omega-element': {
    helper: 'Введіть формулу речовини та символ елемента. Калькулятор визначить, яку частку молярної маси речовини становить цей елемент.'
  }
};

let activeMode = 'omega-solution';

function parsePositiveNumber(value, label = 'Значення') {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error(`${label}: введіть числове значення.`);
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} має бути додатним числом.`);
  return number;
}

function toGrams(value, unit) {
  if (unit === 'mg') return value / 1000;
  if (unit === 'kg') return value * 1000;
  return value;
}

function massUnitOptions(selected = 'g') {
  return massUnits.map(unit => `<option value="${unit.value}"${unit.value === selected ? ' selected' : ''}>${unit.label}</option>`).join('');
}

function normalizeElementSymbol(value) {
  const raw = String(value ?? '').trim();
  if (!/^[A-Za-z]{1,2}$/.test(raw)) {
    throw new Error('Введіть символ елемента однією або двома латинськими літерами, наприклад O або Na.');
  }
  return raw[0].toUpperCase() + raw.slice(1).toLowerCase();
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  [firstInput, secondInput, formulaInput, elementInput].forEach(input => input?.removeAttribute('aria-invalid'));
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

  modeButtons.forEach(button => {
    const active = button.dataset.fractionMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const isCompound = mode === 'omega-element';
  solutionFields.hidden = isCompound;
  compoundFields.hidden = !isCompound;
  helper.textContent = modes[mode].helper;

  if (!isCompound) {
    firstLabel.textContent = modes[mode].firstLabel;
    secondLabel.textContent = modes[mode].secondLabel;
    if (mode === 'omega-solution') {
      firstUnit.innerHTML = massUnitOptions('g');
    } else {
      firstUnit.innerHTML = '<option value="percent">%</option>';
    }
    secondUnit.innerHTML = massUnitOptions('g');
  }

  clearError();
}

function renderSolutionOmega() {
  const firstRaw = parsePositiveNumber(firstInput.value, 'Маса речовини');
  const secondRaw = parsePositiveNumber(secondInput.value, 'Маса розчину');
  const soluteMass = toGrams(firstRaw, firstUnit.value);
  const solutionMass = toGrams(secondRaw, secondUnit.value);

  if (soluteMass > solutionMass) {
    throw new Error('Маса розчиненої речовини не може перевищувати масу всього розчину.');
  }

  const omega = soluteMass / solutionMass * 100;
  resultTitle.textContent = 'Масова частка у розчині';
  resultValue.textContent = formatNumber(omega, 4);
  resultUnit.textContent = '%';
  steps.innerHTML = [
    '<strong>1.</strong> ω = m(речовини) / m(розчину) × 100%',
    `<strong>2.</strong> ω = ${formatNumber(soluteMass, 6)} г / ${formatNumber(solutionMass, 6)} г × 100%`,
    `<strong>3.</strong> ω = ${formatNumber(omega, 4)}%`
  ].map(step => `<div class="solution-step">${step}</div>`).join('');
  note.textContent = (firstUnit.value !== 'g' || secondUnit.value !== 'g')
    ? 'Перед обчисленням маси автоматично переведено у грами.'
    : 'Масова частка показує, яка частина маси розчину припадає на розчинену речовину.';
}

function renderSoluteMass() {
  const omega = parsePositiveNumber(firstInput.value, 'Масова частка');
  if (omega > 100) throw new Error('Масова частка у відсотках не може перевищувати 100%.');

  const solutionRaw = parsePositiveNumber(secondInput.value, 'Маса розчину');
  const solutionMass = toGrams(solutionRaw, secondUnit.value);
  const soluteMass = omega / 100 * solutionMass;

  resultTitle.textContent = 'Маса розчиненої речовини';
  resultValue.textContent = formatNumber(soluteMass, 4);
  resultUnit.textContent = 'г';
  steps.innerHTML = [
    '<strong>1.</strong> m(речовини) = ω · m(розчину) / 100%',
    `<strong>2.</strong> m(речовини) = ${formatNumber(omega, 4)}% × ${formatNumber(solutionMass, 6)} г / 100%`,
    `<strong>3.</strong> m(речовини) = ${formatNumber(soluteMass, 4)} г`
  ].map(step => `<div class="solution-step">${step}</div>`).join('');
  note.textContent = secondUnit.value !== 'g'
    ? 'Масу розчину автоматично переведено у грами перед підстановкою.'
    : 'Результат показує масу компонента, що відповідає заданій масовій частці.';
}

function renderElementOmega() {
  const data = getFormulaData(formulaInput.value);
  formulaInput.value = data.formula;
  const symbol = normalizeElementSymbol(elementInput.value);
  elementInput.value = symbol;
  const row = data.rows.find(item => item.element.symbol === symbol);

  if (!row) throw new Error(`Елемент ${symbol} не входить до формули ${data.formula}.`);

  const omega = row.subtotal / data.totalMass * 100;
  const formulaHTML = formatFormula(data.formula);
  resultTitle.innerHTML = `ω(${symbol}) у ${formulaHTML}`;
  resultValue.textContent = formatNumber(omega, 4);
  resultUnit.textContent = '%';
  steps.innerHTML = [
    `<strong>1.</strong> M(${formulaHTML}) = ${formatNumber(data.totalMass, 5)} г/моль`,
    `<strong>2.</strong> Внесок ${symbol}: ${formatNumber(row.mass.numeric, 5)} × ${row.count} = ${formatNumber(row.subtotal, 5)}`,
    `<strong>3.</strong> ω(${symbol}) = ${formatNumber(row.subtotal, 5)} / ${formatNumber(data.totalMass, 5)} × 100% = ${formatNumber(omega, 4)}%`
  ].map(step => `<div class="solution-step">${step}</div>`).join('');
  note.textContent = data.hasApproximateMass
    ? 'У формулі є елемент без стандартної атомної маси, тому відсотковий склад є наближеним.'
    : 'Розрахунок виконано за відносними атомними масами з Періодичної системи Chemistry Learning Hub.';
}

function calculate() {
  clearError();
  try {
    if (activeMode === 'omega-solution') renderSolutionOmega();
    if (activeMode === 'solute-from-omega') renderSoluteMass();
    if (activeMode === 'omega-element') renderElementOmega();
    resultEmpty.hidden = true;
    resultContent.hidden = false;
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати розрахунок масової частки.');
  }
}

modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.fractionMode)));
form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});
[firstInput, secondInput, formulaInput, elementInput].forEach(input => input?.addEventListener('input', clearError));

document.querySelectorAll('[data-fraction-example]').forEach(button => {
  button.addEventListener('click', () => {
    const mode = button.dataset.mode || 'omega-solution';
    setMode(mode);

    if (mode === 'omega-element') {
      formulaInput.value = button.dataset.formula || '';
      elementInput.value = button.dataset.element || '';
    } else {
      firstInput.value = button.dataset.first || '';
      secondInput.value = button.dataset.second || '';
      if ([...firstUnit.options].some(option => option.value === button.dataset.firstUnit)) firstUnit.value = button.dataset.firstUnit;
      if ([...secondUnit.options].some(option => option.value === button.dataset.secondUnit)) secondUnit.value = button.dataset.secondUnit;
    }
    calculate();
  });
});

setMode(activeMode);
firstInput.value = '20';
secondInput.value = '200';
firstUnit.value = 'g';
secondUnit.value = 'g';
calculate();
