import { formatNumber } from './formula-core.js';

const form = document.querySelector('#dilutionForm');
const modeButtons = [...document.querySelectorAll('[data-dilution-mode]')];
const firstLabel = document.querySelector('#dilutionFirstLabel');
const secondLabel = document.querySelector('#dilutionSecondLabel');
const thirdLabel = document.querySelector('#dilutionThirdLabel');
const firstInput = document.querySelector('#dilutionFirstInput');
const secondInput = document.querySelector('#dilutionSecondInput');
const thirdInput = document.querySelector('#dilutionThirdInput');
const firstUnit = document.querySelector('#dilutionFirstUnit');
const secondUnit = document.querySelector('#dilutionSecondUnit');
const thirdUnit = document.querySelector('#dilutionThirdUnit');
const helper = document.querySelector('#dilutionHelper');
const errorBox = document.querySelector('#dilutionError');
const resultEmpty = document.querySelector('#dilutionResultEmpty');
const resultContent = document.querySelector('#dilutionResultContent');
const resultTitle = document.querySelector('#dilutionResultTitle');
const resultValue = document.querySelector('#dilutionResultValue');
const resultUnit = document.querySelector('#dilutionResultUnit');
const steps = document.querySelector('#dilutionSteps');
const note = document.querySelector('#dilutionNote');

const concentrationUnits = [
  { value: 'mol-L', label: 'моль/л' },
  { value: 'mmol-L', label: 'ммоль/л' }
];

const volumeUnits = [
  { value: 'mL', label: 'мл' },
  { value: 'L', label: 'л' }
];

const modes = {
  'c2': {
    labels: ['Початкова концентрація c₁', 'Початковий об’єм V₁', 'Кінцевий об’єм V₂'],
    types: ['concentration', 'volume', 'volume'],
    helper: 'Для тієї самої розчиненої речовини без хімічної реакції кількість речовини під час розведення не змінюється: c₁V₁ = c₂V₂.'
  },
  'v1': {
    labels: ['Початкова концентрація c₁', 'Кінцева концентрація c₂', 'Потрібний кінцевий об’єм V₂'],
    types: ['concentration', 'concentration', 'volume'],
    helper: 'Режим допомагає визначити, який об’єм вихідного розчину потрібно відібрати, а потім довести розчинником до заданого V₂.'
  },
  'v2': {
    labels: ['Початкова концентрація c₁', 'Початковий об’єм V₁', 'Потрібна концентрація c₂'],
    types: ['concentration', 'volume', 'concentration'],
    helper: 'Калькулятор знаходить кінцевий об’єм V₂. У лабораторній практиці розчин доводять розчинником саме до цього об’єму.'
  }
};

let activeMode = 'c2';

function parsePositiveNumber(value, label) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error(`${label}: введіть числове значення.`);
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} має бути додатним числом.`);
  return number;
}

function unitOptions(type, selected) {
  const units = type === 'concentration' ? concentrationUnits : volumeUnits;
  return units.map(unit => `<option value="${unit.value}"${unit.value === selected ? ' selected' : ''}>${unit.label}</option>`).join('');
}

function toBase(value, unit) {
  if (unit === 'mmol-L') return value / 1000;
  if (unit === 'mL') return value / 1000;
  return value;
}

function fromBase(value, unit) {
  if (unit === 'mmol-L') return value * 1000;
  if (unit === 'mL') return value * 1000;
  return value;
}

function unitLabel(unit) {
  return unit === 'mol-L' ? 'моль/л' : unit === 'mmol-L' ? 'ммоль/л' : unit === 'mL' ? 'мл' : 'л';
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  [firstInput, secondInput, thirdInput].forEach(input => input.removeAttribute('aria-invalid'));
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
    const active = button.dataset.dilutionMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  [firstLabel, secondLabel, thirdLabel].forEach((label, index) => {
    label.textContent = config.labels[index];
  });

  const selects = [firstUnit, secondUnit, thirdUnit];
  config.types.forEach((type, index) => {
    const preferred = type === 'concentration' ? 'mol-L' : 'mL';
    selects[index].innerHTML = unitOptions(type, preferred);
  });

  helper.textContent = config.helper;
  clearError();
}

function renderResult(values, units) {
  const [first, second, third] = values;
  const [firstUnitValue, secondUnitValue, thirdUnitValue] = units;
  const a = toBase(first, firstUnitValue);
  const b = toBase(second, secondUnitValue);
  const c = toBase(third, thirdUnitValue);

  let answerBase;
  let outputUnit;
  let solutionSteps;

  if (activeMode === 'c2') {
    const c1 = a;
    const v1 = b;
    const v2 = c;
    if (v2 < v1) throw new Error('Для розведення кінцевий об’єм V₂ має бути не меншим за початковий V₁.');
    answerBase = c1 * v1 / v2;
    outputUnit = firstUnitValue;
    const answer = fromBase(answerBase, outputUnit);
    resultTitle.textContent = 'Кінцева концентрація c₂';
    resultValue.textContent = formatNumber(answer, 6);
    resultUnit.textContent = unitLabel(outputUnit);
    solutionSteps = [
      '<strong>1.</strong> c₁V₁ = c₂V₂',
      '<strong>2.</strong> c₂ = c₁V₁ / V₂',
      `<strong>3.</strong> c₂ = ${formatNumber(c1, 6)} моль/л × ${formatNumber(v1, 6)} л / ${formatNumber(v2, 6)} л = ${formatNumber(answerBase, 6)} моль/л`
    ];
  }

  if (activeMode === 'v1') {
    const c1 = a;
    const c2 = b;
    const v2 = c;
    if (c2 > c1) throw new Error('Під час розведення кінцева концентрація c₂ не може перевищувати початкову c₁.');
    answerBase = c2 * v2 / c1;
    outputUnit = thirdUnitValue;
    const answer = fromBase(answerBase, outputUnit);
    resultTitle.textContent = 'Об’єм вихідного розчину V₁';
    resultValue.textContent = formatNumber(answer, 6);
    resultUnit.textContent = unitLabel(outputUnit);
    solutionSteps = [
      '<strong>1.</strong> c₁V₁ = c₂V₂',
      '<strong>2.</strong> V₁ = c₂V₂ / c₁',
      `<strong>3.</strong> V₁ = ${formatNumber(c2, 6)} моль/л × ${formatNumber(v2, 6)} л / ${formatNumber(c1, 6)} моль/л = ${formatNumber(answerBase, 6)} л`
    ];
  }

  if (activeMode === 'v2') {
    const c1 = a;
    const v1 = b;
    const c2 = c;
    if (c2 > c1) throw new Error('Під час розведення кінцева концентрація c₂ не може перевищувати початкову c₁.');
    answerBase = c1 * v1 / c2;
    outputUnit = secondUnitValue;
    const answer = fromBase(answerBase, outputUnit);
    resultTitle.textContent = 'Кінцевий об’єм V₂';
    resultValue.textContent = formatNumber(answer, 6);
    resultUnit.textContent = unitLabel(outputUnit);
    solutionSteps = [
      '<strong>1.</strong> c₁V₁ = c₂V₂',
      '<strong>2.</strong> V₂ = c₁V₁ / c₂',
      `<strong>3.</strong> V₂ = ${formatNumber(c1, 6)} моль/л × ${formatNumber(v1, 6)} л / ${formatNumber(c2, 6)} моль/л = ${formatNumber(answerBase, 6)} л`
    ];
  }

  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');
  note.textContent = activeMode === 'v1'
    ? 'Практично: відібрати обчислений V₁ вихідного розчину і довести розчинником до заданого кінцевого об’єму V₂.'
    : activeMode === 'v2'
      ? 'Практично: розчин доводять розчинником до обчисленого кінцевого об’єму V₂, а не визначають об’єм розчинника простим відніманням.'
      : 'Співвідношення c₁V₁ = c₂V₂ застосовують для тієї самої розчиненої речовини, якщо під час розведення її кількість не змінюється.';

  resultEmpty.hidden = true;
  resultContent.hidden = false;
}

function calculate() {
  clearError();
  try {
    const config = modes[activeMode];
    const values = [
      parsePositiveNumber(firstInput.value, config.labels[0]),
      parsePositiveNumber(secondInput.value, config.labels[1]),
      parsePositiveNumber(thirdInput.value, config.labels[2])
    ];
    const units = [firstUnit.value, secondUnit.value, thirdUnit.value];
    renderResult(values, units);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати розрахунок розведення.');
  }
}

modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.dilutionMode)));
form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});
[firstInput, secondInput, thirdInput].forEach(input => input.addEventListener('input', clearError));

document.querySelectorAll('[data-dilution-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode || 'c2');
    firstInput.value = button.dataset.first || '';
    secondInput.value = button.dataset.second || '';
    thirdInput.value = button.dataset.third || '';

    const pairs = [
      [firstUnit, button.dataset.firstUnit],
      [secondUnit, button.dataset.secondUnit],
      [thirdUnit, button.dataset.thirdUnit]
    ];
    pairs.forEach(([select, value]) => {
      if ([...select.options].some(option => option.value === value)) select.value = value;
    });
    calculate();
  });
});

setMode(activeMode);
firstInput.value = '1';
secondInput.value = '25';
thirdInput.value = '100';
firstUnit.value = 'mol-L';
secondUnit.value = 'mL';
thirdUnit.value = 'mL';
calculate();
