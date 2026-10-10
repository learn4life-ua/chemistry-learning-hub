import { formatNumber } from './formula-core.js';

function ensureDensityUI() {
  if (!document.querySelector('link[href*="density.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/density.css?v=1';
    document.head.append(link);
  }

  const nav = document.querySelector('.calc-tool-nav');
  if (nav && !nav.querySelector('a[href="#density-calculations"]')) {
    const anchor = document.createElement('a');
    anchor.href = '#density-calculations';
    anchor.textContent = 'Густина розчинів';
    nav.append(anchor);
  }

  const lead = document.querySelector('.calc-lead');
  if (lead) {
    lead.textContent = 'Молярна маса, кількість речовини, концентрація, розчини, газові розрахунки, стехіометрія, вихід продукту, чистота та густина - з перевіркою одиниць і покроковим розв’язанням.';
  }

  const orb = document.querySelector('.formula-orb span');
  if (orb) orb.textContent = 'M · n · c · η · lim · aq · ρ';

  const nextTools = document.querySelector('.next-tools-section');
  if (nextTools && !document.querySelector('#density-calculations')) {
    const section = document.createElement('section');
    section.className = 'density-section';
    section.id = 'density-calculations';
    section.innerHTML = `
      <div class="shell tool-section-heading">
        <p class="eyebrow">Інструмент 12</p>
        <h2>Густина розчинів</h2>
        <p>Працюйте зі співвідношенням ρ = m / V: знаходьте густину, масу або об’єм розчину з автоматичним переведенням одиниць.</p>
      </div>

      <div class="shell calc-layout">
        <article class="calc-card">
          <div class="calc-card-head">
            <div>
              <p class="calc-kicker">Оберіть тип розрахунку</p>
              <h2>Робота з ρ, m і V</h2>
            </div>
            <span class="calc-badge">ρ = m / V</span>
          </div>

          <div class="density-mode-switcher" role="group" aria-label="Тип розрахунку густини">
            <button class="is-active" type="button" data-density-mode="rho" aria-pressed="true">Знайти ρ</button>
            <button type="button" data-density-mode="mass" aria-pressed="false">Знайти m</button>
            <button type="button" data-density-mode="volume" aria-pressed="false">Знайти V</button>
          </div>

          <form id="densityForm" novalidate>
            <div class="density-fields">
              <div>
                <label class="formula-label" id="densityFirstLabel" for="densityFirstInput">Маса розчину m</label>
                <div class="density-value-row">
                  <input class="value-input" id="densityFirstInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 105">
                  <select class="density-unit-select" id="densityFirstUnit" aria-label="Одиниця першої величини"></select>
                </div>
              </div>

              <div>
                <label class="formula-label" id="densitySecondLabel" for="densitySecondInput">Об’єм розчину V</label>
                <div class="density-value-row">
                  <input class="value-input" id="densitySecondInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 100">
                  <select class="density-unit-select" id="densitySecondUnit" aria-label="Одиниця другої величини"></select>
                </div>
              </div>
            </div>

            <div class="density-output-row">
              <label class="formula-label" for="densityOutputUnit">Одиниця результату</label>
              <select class="density-unit-select" id="densityOutputUnit"></select>
            </div>

            <p class="formula-help" id="densityHelper"></p>
            <div class="density-note-box"><strong>Зверніть увагу:</strong> густина розчину залежить від складу і температури. Калькулятор не підставляє табличне значення густини автоматично - використовується значення, задане в умові.</div>
            <p class="formula-error" id="densityError" role="alert" hidden></p>
            <button class="calc-button density-submit" type="submit">Розрахувати</button>
          </form>

          <div class="example-list" aria-label="Приклади розрахунків густини">
            <span>Спробуйте:</span>
            <button type="button" data-density-example data-mode="rho" data-first="105" data-first-unit="g" data-second="100" data-second-unit="mL" data-output-unit="g-mL">105 г, 100 мл → ρ</button>
            <button type="button" data-density-example data-mode="mass" data-first="1,2" data-first-unit="g-mL" data-second="250" data-second-unit="mL" data-output-unit="g">ρ = 1,2 г/мл, 250 мл → m</button>
            <button type="button" data-density-example data-mode="volume" data-first="500" data-first-unit="g" data-second="1,25" data-second-unit="g-mL" data-output-unit="mL">500 г, ρ = 1,25 г/мл → V</button>
          </div>
        </article>

        <aside class="result-card density-result-card" aria-live="polite">
          <div class="result-empty" id="densityResultEmpty">
            <div class="result-icon">ρ</div>
            <h2>Розв'язання з'явиться тут</h2>
            <p>Введіть дві відомі величини та оберіть одиницю результату.</p>
          </div>

          <div class="result-content" id="densityResultContent" hidden>
            <p class="calc-kicker">Відповідь</p>
            <div class="density-result-title" id="densityResultTitle"></div>
            <div class="amount-final-value">
              <strong id="densityResultValue">0</strong>
              <span id="densityResultUnit"></span>
            </div>
            <div class="solution-steps" id="densitySteps"></div>
            <p class="result-note" id="densityNote"></p>
          </div>
        </aside>
      </div>
    `;
    nextTools.before(section);
  }

  if (nextTools) {
    const grid = nextTools.querySelector('.next-tools-grid');
    if (grid) {
      grid.innerHTML = `
        <article><strong>β</strong><h3>Масова концентрація</h3><p>Маса розчиненої речовини в одиниці об’єму розчину.</p></article>
        <article><strong>MF</strong><h3>Формула за складом</h3><p>Визначення найпростішої формули за масовими частками елементів.</p></article>
        <article><strong>b</strong><h3>Моляльність</h3><p>Кількість розчиненої речовини на кілограм розчинника.</p></article>
      `;
    }
  }
}

ensureDensityUI();

const form = document.querySelector('#densityForm');
const modeButtons = [...document.querySelectorAll('[data-density-mode]')];
const firstLabel = document.querySelector('#densityFirstLabel');
const secondLabel = document.querySelector('#densitySecondLabel');
const firstInput = document.querySelector('#densityFirstInput');
const secondInput = document.querySelector('#densitySecondInput');
const firstUnit = document.querySelector('#densityFirstUnit');
const secondUnit = document.querySelector('#densitySecondUnit');
const outputUnit = document.querySelector('#densityOutputUnit');
const helper = document.querySelector('#densityHelper');
const errorBox = document.querySelector('#densityError');
const resultEmpty = document.querySelector('#densityResultEmpty');
const resultContent = document.querySelector('#densityResultContent');
const resultTitle = document.querySelector('#densityResultTitle');
const resultValue = document.querySelector('#densityResultValue');
const resultUnit = document.querySelector('#densityResultUnit');
const steps = document.querySelector('#densitySteps');
const note = document.querySelector('#densityNote');

const massUnits = [
  { value: 'mg', label: 'мг' },
  { value: 'g', label: 'г' },
  { value: 'kg', label: 'кг' }
];

const volumeUnits = [
  { value: 'mL', label: 'мл' },
  { value: 'cm3', label: 'см³' },
  { value: 'L', label: 'л' },
  { value: 'm3', label: 'м³' }
];

const densityUnits = [
  { value: 'g-mL', label: 'г/мл' },
  { value: 'g-cm3', label: 'г/см³' },
  { value: 'g-L', label: 'г/л' },
  { value: 'kg-m3', label: 'кг/м³' }
];

const modes = {
  rho: {
    firstLabel: 'Маса розчину m',
    secondLabel: 'Об’єм розчину V',
    helper: 'Використовується ρ = m / V.',
    firstType: 'mass',
    secondType: 'volume',
    outputType: 'density'
  },
  mass: {
    firstLabel: 'Густина розчину ρ',
    secondLabel: 'Об’єм розчину V',
    helper: 'Використовується m = ρV.',
    firstType: 'density',
    secondType: 'volume',
    outputType: 'mass'
  },
  volume: {
    firstLabel: 'Маса розчину m',
    secondLabel: 'Густина розчину ρ',
    helper: 'Використовується V = m / ρ.',
    firstType: 'mass',
    secondType: 'density',
    outputType: 'volume'
  }
};

let activeMode = 'rho';

function parsePositiveNumber(value, label) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error(`${label}: введіть числове значення.`);
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} має бути додатним числом.`);
  return number;
}

function optionsFor(type, selected) {
  const units = type === 'mass' ? massUnits : type === 'volume' ? volumeUnits : densityUnits;
  return units.map(unit => `<option value="${unit.value}"${unit.value === selected ? ' selected' : ''}>${unit.label}</option>`).join('');
}

function toGrams(value, unit) {
  if (unit === 'mg') return value / 1000;
  if (unit === 'kg') return value * 1000;
  return value;
}

function fromGrams(value, unit) {
  if (unit === 'mg') return value * 1000;
  if (unit === 'kg') return value / 1000;
  return value;
}

function toMillilitres(value, unit) {
  if (unit === 'L') return value * 1000;
  if (unit === 'm3') return value * 1_000_000;
  return value;
}

function fromMillilitres(value, unit) {
  if (unit === 'L') return value / 1000;
  if (unit === 'm3') return value / 1_000_000;
  return value;
}

function toGramsPerMillilitre(value, unit) {
  if (unit === 'g-L') return value / 1000;
  if (unit === 'kg-m3') return value / 1000;
  return value;
}

function fromGramsPerMillilitre(value, unit) {
  if (unit === 'g-L') return value * 1000;
  if (unit === 'kg-m3') return value * 1000;
  return value;
}

function unitLabel(unit) {
  const all = [...massUnits, ...volumeUnits, ...densityUnits];
  return all.find(item => item.value === unit)?.label || unit;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  firstInput.removeAttribute('aria-invalid');
  secondInput.removeAttribute('aria-invalid');
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
    const active = button.dataset.densityMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  firstLabel.textContent = config.firstLabel;
  secondLabel.textContent = config.secondLabel;
  helper.textContent = config.helper;

  const firstDefault = config.firstType === 'mass' ? 'g' : config.firstType === 'volume' ? 'mL' : 'g-mL';
  const secondDefault = config.secondType === 'mass' ? 'g' : config.secondType === 'volume' ? 'mL' : 'g-mL';
  const outputDefault = config.outputType === 'mass' ? 'g' : config.outputType === 'volume' ? 'mL' : 'g-mL';

  firstUnit.innerHTML = optionsFor(config.firstType, firstDefault);
  secondUnit.innerHTML = optionsFor(config.secondType, secondDefault);
  outputUnit.innerHTML = optionsFor(config.outputType, outputDefault);
  clearError();
}

function renderResult(firstRaw, secondRaw) {
  let baseValue;
  let converted;
  let title;
  let solutionSteps;

  if (activeMode === 'rho') {
    const massG = toGrams(firstRaw, firstUnit.value);
    const volumeMl = toMillilitres(secondRaw, secondUnit.value);
    baseValue = massG / volumeMl;
    converted = fromGramsPerMillilitre(baseValue, outputUnit.value);
    title = 'Густина розчину ρ';
    solutionSteps = [
      '<strong>1.</strong> ρ = m / V',
      `<strong>2.</strong> m = ${formatNumber(massG, 6)} г; V = ${formatNumber(volumeMl, 6)} мл`,
      `<strong>3.</strong> ρ = ${formatNumber(massG, 6)} / ${formatNumber(volumeMl, 6)} = ${formatNumber(baseValue, 6)} г/мл`,
      outputUnit.value === 'g-mL' ? null : `<strong>4.</strong> У потрібних одиницях: ${formatNumber(converted, 6)} ${unitLabel(outputUnit.value)}`
    ].filter(Boolean);
  }

  if (activeMode === 'mass') {
    const density = toGramsPerMillilitre(firstRaw, firstUnit.value);
    const volumeMl = toMillilitres(secondRaw, secondUnit.value);
    baseValue = density * volumeMl;
    converted = fromGrams(baseValue, outputUnit.value);
    title = 'Маса розчину m';
    solutionSteps = [
      '<strong>1.</strong> m = ρV',
      `<strong>2.</strong> ρ = ${formatNumber(density, 6)} г/мл; V = ${formatNumber(volumeMl, 6)} мл`,
      `<strong>3.</strong> m = ${formatNumber(density, 6)} × ${formatNumber(volumeMl, 6)} = ${formatNumber(baseValue, 6)} г`,
      outputUnit.value === 'g' ? null : `<strong>4.</strong> У потрібних одиницях: ${formatNumber(converted, 6)} ${unitLabel(outputUnit.value)}`
    ].filter(Boolean);
  }

  if (activeMode === 'volume') {
    const massG = toGrams(firstRaw, firstUnit.value);
    const density = toGramsPerMillilitre(secondRaw, secondUnit.value);
    baseValue = massG / density;
    converted = fromMillilitres(baseValue, outputUnit.value);
    title = 'Об’єм розчину V';
    solutionSteps = [
      '<strong>1.</strong> V = m / ρ',
      `<strong>2.</strong> m = ${formatNumber(massG, 6)} г; ρ = ${formatNumber(density, 6)} г/мл`,
      `<strong>3.</strong> V = ${formatNumber(massG, 6)} / ${formatNumber(density, 6)} = ${formatNumber(baseValue, 6)} мл`,
      outputUnit.value === 'mL' || outputUnit.value === 'cm3' ? null : `<strong>4.</strong> У потрібних одиницях: ${formatNumber(converted, 6)} ${unitLabel(outputUnit.value)}`
    ].filter(Boolean);
  }

  resultTitle.textContent = title;
  resultValue.textContent = formatNumber(converted, 6);
  resultUnit.textContent = unitLabel(outputUnit.value);
  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');
  note.textContent = 'Одиниці автоматично узгоджено через базові г, мл і г/мл. 1 мл = 1 см³; 1 г/мл = 1000 кг/м³.';

  resultEmpty.hidden = true;
  resultContent.hidden = false;
}

function calculate() {
  clearError();
  try {
    const first = parsePositiveNumber(firstInput.value, modes[activeMode].firstLabel);
    const second = parsePositiveNumber(secondInput.value, modes[activeMode].secondLabel);
    renderResult(first, second);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати розрахунок густини.');
  }
}

modeButtons.forEach(button => button.addEventListener('click', () => {
  setMode(button.dataset.densityMode);
  resultContent.hidden = true;
  resultEmpty.hidden = false;
}));

form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});

[firstInput, secondInput].forEach(input => input.addEventListener('input', clearError));

outputUnit?.addEventListener('change', () => {
  if (!resultContent.hidden) calculate();
});

[firstUnit, secondUnit].forEach(select => select.addEventListener('change', clearError));

document.querySelectorAll('[data-density-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode || 'rho');
    firstInput.value = button.dataset.first || '';
    secondInput.value = button.dataset.second || '';

    if ([...firstUnit.options].some(option => option.value === button.dataset.firstUnit)) firstUnit.value = button.dataset.firstUnit;
    if ([...secondUnit.options].some(option => option.value === button.dataset.secondUnit)) secondUnit.value = button.dataset.secondUnit;
    if ([...outputUnit.options].some(option => option.value === button.dataset.outputUnit)) outputUnit.value = button.dataset.outputUnit;
    calculate();
  });
});

setMode(activeMode);
firstInput.value = '105';
secondInput.value = '100';
firstUnit.value = 'g';
secondUnit.value = 'mL';
outputUnit.value = 'g-mL';
calculate();
