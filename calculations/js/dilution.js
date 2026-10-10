import { formatNumber } from './formula-core.js';

function ensureDilutionUI() {
  if (!document.querySelector('link[href*="dilution.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/dilution.css?v=1';
    document.head.append(link);
  }

  const nav = document.querySelector('.calc-tool-nav');
  if (nav && !nav.querySelector('a[href="#solution-dilution"]')) {
    const anchor = document.createElement('a');
    anchor.href = '#solution-dilution';
    anchor.textContent = 'Розведення розчинів';
    nav.append(anchor);
  }

  const lead = document.querySelector('.calc-lead');
  if (lead) {
    lead.textContent = 'Молярна маса, кількість речовини, концентрація, масова частка, газові розрахунки та розведення розчинів - з перевіркою одиниць і покроковим розв’язанням.';
  }

  const nextTools = document.querySelector('.next-tools-section');
  if (nextTools && !document.querySelector('#solution-dilution')) {
    const section = document.createElement('section');
    section.className = 'dilution-section';
    section.id = 'solution-dilution';
    section.innerHTML = `
      <div class="shell tool-section-heading">
        <p class="eyebrow">Інструмент 06</p>
        <h2>Розведення розчинів</h2>
        <p>Використовуйте співвідношення c₁V₁ = c₂V₂ для тієї самої розчиненої речовини, коли під час розведення її кількість не змінюється.</p>
      </div>

      <div class="shell calc-layout">
        <article class="calc-card">
          <div class="calc-card-head">
            <div>
              <p class="calc-kicker">Оберіть тип розрахунку</p>
              <h2>Робота з c₁, V₁, c₂ і V₂</h2>
            </div>
            <span class="calc-badge">Розведення</span>
          </div>

          <div class="dilution-mode-switcher" role="group" aria-label="Тип розрахунку розведення">
            <button class="is-active" type="button" data-dilution-mode="c2" aria-pressed="true">Знайти c₂</button>
            <button type="button" data-dilution-mode="v1" aria-pressed="false">Знайти V₁</button>
            <button type="button" data-dilution-mode="v2" aria-pressed="false">Знайти V₂</button>
          </div>

          <form id="dilutionForm" novalidate>
            <div class="dilution-fields">
              <div>
                <label class="formula-label" id="dilutionFirstLabel" for="dilutionFirstInput"></label>
                <div class="dilution-value-row">
                  <input class="value-input" id="dilutionFirstInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 1">
                  <select id="dilutionFirstUnit" aria-label="Одиниця першого значення"></select>
                </div>
              </div>
              <div>
                <label class="formula-label" id="dilutionSecondLabel" for="dilutionSecondInput"></label>
                <div class="dilution-value-row">
                  <input class="value-input" id="dilutionSecondInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 25">
                  <select id="dilutionSecondUnit" aria-label="Одиниця другого значення"></select>
                </div>
              </div>
              <div>
                <label class="formula-label" id="dilutionThirdLabel" for="dilutionThirdInput"></label>
                <div class="dilution-value-row">
                  <input class="value-input" id="dilutionThirdInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 100">
                  <select id="dilutionThirdUnit" aria-label="Одиниця третього значення"></select>
                </div>
              </div>
            </div>

            <p class="formula-help" id="dilutionHelper"></p>
            <div class="dilution-note-box"><strong>Практичний нюанс:</strong> під час приготування розчину його доводять розчинником до потрібного кінцевого об’єму. Не слід автоматично вважати, що об’єм доданого розчинника дорівнює V₂ − V₁.</div>
            <p class="formula-error" id="dilutionError" role="alert" hidden></p>
            <button class="calc-button dilution-submit" type="submit">Розрахувати</button>
          </form>

          <div class="example-list" aria-label="Приклади розведення розчинів">
            <span>Спробуйте:</span>
            <button type="button" data-dilution-example data-mode="c2" data-first="1" data-first-unit="mol-L" data-second="25" data-second-unit="mL" data-third="100" data-third-unit="mL">1 моль/л, 25 мл → 100 мл</button>
            <button type="button" data-dilution-example data-mode="v1" data-first="1" data-first-unit="mol-L" data-second="0,1" data-second-unit="mol-L" data-third="250" data-third-unit="mL">1 → 0,1 моль/л, 250 мл</button>
            <button type="button" data-dilution-example data-mode="v2" data-first="2" data-first-unit="mol-L" data-second="100" data-second-unit="mL" data-third="0,5" data-third-unit="mol-L">2 → 0,5 моль/л зі 100 мл</button>
          </div>
        </article>

        <aside class="result-card dilution-result-card" aria-live="polite">
          <div class="result-empty" id="dilutionResultEmpty">
            <div class="result-icon">cV</div>
            <h2>Розв’язання з’явиться тут</h2>
            <p>Введіть три відомі величини або скористайтеся готовим прикладом.</p>
          </div>

          <div class="result-content" id="dilutionResultContent" hidden>
            <p class="calc-kicker">Відповідь</p>
            <div class="dilution-result-title" id="dilutionResultTitle"></div>
            <div class="amount-final-value">
              <strong id="dilutionResultValue">0</strong>
              <span id="dilutionResultUnit"></span>
            </div>
            <div class="solution-steps" id="dilutionSteps"></div>
            <p class="result-note" id="dilutionNote"></p>
          </div>
        </aside>
      </div>
    `;
    nextTools.before(section);
  }

  const upcoming = document.querySelectorAll('.next-tools-grid article');
  if (upcoming.length >= 3) {
    upcoming[0].innerHTML = '<strong>→</strong><h3>Розрахунки за рівняннями реакцій</h3><p>Стехіометричні співвідношення між реагентами та продуктами.</p>';
    upcoming[1].innerHTML = '<strong>η</strong><h3>Вихід продукту</h3><p>Теоретичний і практичний вихід продукту реакції у відсотках.</p>';
    upcoming[2].innerHTML = '<strong>lim</strong><h3>Лімітуючий реагент</h3><p>Визначення реагенту, який витрачається першим, і надлишку іншої речовини.</p>';
  }
}

ensureDilutionUI();

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
  c2: {
    labels: ['Початкова концентрація c₁', 'Початковий об’єм V₁', 'Кінцевий об’єм V₂'],
    types: ['concentration', 'volume', 'volume'],
    helper: 'Для тієї самої розчиненої речовини без хімічної реакції кількість речовини під час розведення не змінюється: c₁V₁ = c₂V₂.'
  },
  v1: {
    labels: ['Початкова концентрація c₁', 'Кінцева концентрація c₂', 'Потрібний кінцевий об’єм V₂'],
    types: ['concentration', 'concentration', 'volume'],
    helper: 'Визначаємо об’єм вихідного розчину, який потрібно відібрати, а потім довести розчинником до заданого V₂.'
  },
  v2: {
    labels: ['Початкова концентрація c₁', 'Початковий об’єм V₁', 'Потрібна концентрація c₂'],
    types: ['concentration', 'volume', 'concentration'],
    helper: 'Знаходимо кінцевий об’єм V₂, до якого потрібно довести вихідний розчин.'
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
  if (unit === 'mmol-L' || unit === 'mL') return value / 1000;
  return value;
}

function fromBase(value, unit) {
  if (unit === 'mmol-L' || unit === 'mL') return value * 1000;
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
    selects[index].innerHTML = unitOptions(type, type === 'concentration' ? 'mol-L' : 'mL');
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
    resultTitle.textContent = 'Кінцева концентрація c₂';
    resultValue.textContent = formatNumber(fromBase(answerBase, outputUnit), 6);
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
    resultTitle.textContent = 'Об’єм вихідного розчину V₁';
    resultValue.textContent = formatNumber(fromBase(answerBase, outputUnit), 6);
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
    resultTitle.textContent = 'Кінцевий об’єм V₂';
    resultValue.textContent = formatNumber(fromBase(answerBase, outputUnit), 6);
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
      ? 'Практично: розчин доводять розчинником до обчисленого V₂. Об’єм розчинника не слід визначати простим відніманням V₂ − V₁.'
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
    renderResult(values, [firstUnit.value, secondUnit.value, thirdUnit.value]);
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
    [[firstUnit, button.dataset.firstUnit], [secondUnit, button.dataset.secondUnit], [thirdUnit, button.dataset.thirdUnit]].forEach(([select, value]) => {
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
