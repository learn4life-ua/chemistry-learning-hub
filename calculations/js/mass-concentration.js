import { formatNumber } from './formula-core.js';

function ensureMassConcentrationUI() {
  if (!document.querySelector('link[href*="mass-concentration.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/mass-concentration.css?v=1';
    document.head.append(link);
  }

  const nav = document.querySelector('.calc-tool-nav');
  if (nav && !nav.querySelector('a[href="#mass-concentration"]')) {
    const anchor = document.createElement('a');
    anchor.href = '#mass-concentration';
    anchor.textContent = 'Масова концентрація';
    nav.append(anchor);
  }

  const lead = document.querySelector('.calc-lead');
  if (lead) {
    lead.textContent = 'Молярна маса, кількість речовини, концентрація, розчини, газові розрахунки, стехіометрія, вихід продукту, чистота, густина та масова концентрація - з перевіркою одиниць і покроковим розв’язанням.';
  }

  const orb = document.querySelector('.formula-orb span');
  if (orb) orb.textContent = 'M · n · c · ρ · β · η';

  const nextTools = document.querySelector('.next-tools-section');
  if (nextTools && !document.querySelector('#mass-concentration')) {
    const section = document.createElement('section');
    section.className = 'mass-concentration-section';
    section.id = 'mass-concentration';
    section.innerHTML = `
      <div class="shell tool-section-heading">
        <p class="eyebrow">Інструмент 13</p>
        <h2>Масова концентрація</h2>
        <p>Визначайте масу розчиненої речовини в одиниці об’єму розчину за співвідношенням β = m / V.</p>
      </div>

      <div class="shell calc-layout">
        <article class="calc-card">
          <div class="calc-card-head">
            <div>
              <p class="calc-kicker">Оберіть тип розрахунку</p>
              <h2>Робота з β, m і V</h2>
            </div>
            <span class="calc-badge">β = m / V</span>
          </div>

          <div class="mass-concentration-mode-switcher" role="group" aria-label="Тип розрахунку масової концентрації">
            <button class="is-active" type="button" data-mass-concentration-mode="beta" aria-pressed="true">Знайти β</button>
            <button type="button" data-mass-concentration-mode="mass" aria-pressed="false">Знайти m</button>
            <button type="button" data-mass-concentration-mode="volume" aria-pressed="false">Знайти V</button>
          </div>

          <form id="massConcentrationForm" novalidate>
            <div class="mass-concentration-fields">
              <div>
                <label class="formula-label" id="massConcentrationFirstLabel" for="massConcentrationFirstInput">Маса розчиненої речовини m</label>
                <div class="mass-concentration-value-row">
                  <input class="value-input" id="massConcentrationFirstInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 5">
                  <select class="mass-concentration-unit-select" id="massConcentrationFirstUnit" aria-label="Одиниця першої величини"></select>
                </div>
              </div>

              <div>
                <label class="formula-label" id="massConcentrationSecondLabel" for="massConcentrationSecondInput">Об’єм розчину V</label>
                <div class="mass-concentration-value-row">
                  <input class="value-input" id="massConcentrationSecondInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 250">
                  <select class="mass-concentration-unit-select" id="massConcentrationSecondUnit" aria-label="Одиниця другої величини"></select>
                </div>
              </div>
            </div>

            <div class="mass-concentration-output-row">
              <label class="formula-label" for="massConcentrationOutputUnit">Одиниця результату</label>
              <select class="mass-concentration-unit-select" id="massConcentrationOutputUnit"></select>
            </div>

            <p class="formula-help" id="massConcentrationHelper"></p>
            <div class="mass-concentration-note-box"><strong>Не плутайте:</strong> масова концентрація β показує масу розчиненої речовини в одиниці об’єму розчину. Це не молярна концентрація c і не густина всього розчину ρ.</div>
            <p class="formula-error" id="massConcentrationError" role="alert" hidden></p>
            <button class="calc-button mass-concentration-submit" type="submit">Розрахувати</button>
          </form>

          <div class="example-list" aria-label="Приклади розрахунків масової концентрації">
            <span>Спробуйте:</span>
            <button type="button" data-mass-concentration-example data-mode="beta" data-first="5" data-first-unit="g" data-second="250" data-second-unit="mL" data-output-unit="g-L">5 г у 250 мл → β</button>
            <button type="button" data-mass-concentration-example data-mode="mass" data-first="12" data-first-unit="g-L" data-second="500" data-second-unit="mL" data-output-unit="g">β = 12 г/л, 500 мл → m</button>
            <button type="button" data-mass-concentration-example data-mode="volume" data-first="3" data-first-unit="g" data-second="15" data-second-unit="g-L" data-output-unit="mL">3 г, β = 15 г/л → V</button>
          </div>
        </article>

        <aside class="result-card mass-concentration-result-card" aria-live="polite">
          <div class="result-empty" id="massConcentrationResultEmpty">
            <div class="result-icon">β</div>
            <h2>Розв'язання з'явиться тут</h2>
            <p>Введіть дві відомі величини та оберіть одиницю результату.</p>
          </div>

          <div class="result-content" id="massConcentrationResultContent" hidden>
            <p class="calc-kicker">Відповідь</p>
            <div class="mass-concentration-result-title" id="massConcentrationResultTitle"></div>
            <div class="amount-final-value">
              <strong id="massConcentrationResultValue">0</strong>
              <span id="massConcentrationResultUnit"></span>
            </div>
            <div class="solution-steps" id="massConcentrationSteps"></div>
            <p class="result-note" id="massConcentrationNote"></p>
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
        <article><strong>MF</strong><h3>Формула за складом</h3><p>Визначення найпростішої формули за масовими частками елементів.</p></article>
        <article><strong>b</strong><h3>Моляльність</h3><p>Кількість розчиненої речовини на кілограм розчинника.</p></article>
        <article><strong>↔</strong><h3>Перерахунок концентрацій</h3><p>Зв’язок між масовою, молярною концентраціями та густиною за наявності потрібних даних.</p></article>
      `;
    }
  }
}

ensureMassConcentrationUI();

const form = document.querySelector('#massConcentrationForm');
const modeButtons = [...document.querySelectorAll('[data-mass-concentration-mode]')];
const firstLabel = document.querySelector('#massConcentrationFirstLabel');
const secondLabel = document.querySelector('#massConcentrationSecondLabel');
const firstInput = document.querySelector('#massConcentrationFirstInput');
const secondInput = document.querySelector('#massConcentrationSecondInput');
const firstUnit = document.querySelector('#massConcentrationFirstUnit');
const secondUnit = document.querySelector('#massConcentrationSecondUnit');
const outputUnit = document.querySelector('#massConcentrationOutputUnit');
const helper = document.querySelector('#massConcentrationHelper');
const errorBox = document.querySelector('#massConcentrationError');
const resultEmpty = document.querySelector('#massConcentrationResultEmpty');
const resultContent = document.querySelector('#massConcentrationResultContent');
const resultTitle = document.querySelector('#massConcentrationResultTitle');
const resultValue = document.querySelector('#massConcentrationResultValue');
const resultUnit = document.querySelector('#massConcentrationResultUnit');
const steps = document.querySelector('#massConcentrationSteps');
const note = document.querySelector('#massConcentrationNote');

const massUnits = [
  { value: 'mg', label: 'мг' },
  { value: 'g', label: 'г' },
  { value: 'kg', label: 'кг' }
];

const volumeUnits = [
  { value: 'mL', label: 'мл' },
  { value: 'L', label: 'л' },
  { value: 'm3', label: 'м³' }
];

const betaUnits = [
  { value: 'mg-L', label: 'мг/л' },
  { value: 'g-L', label: 'г/л' },
  { value: 'mg-mL', label: 'мг/мл' },
  { value: 'g-mL', label: 'г/мл' },
  { value: 'kg-m3', label: 'кг/м³' }
];

const modes = {
  beta: {
    firstLabel: 'Маса розчиненої речовини m',
    secondLabel: 'Об’єм розчину V',
    helper: 'Використовується β = m / V.',
    firstType: 'mass', secondType: 'volume', outputType: 'beta'
  },
  mass: {
    firstLabel: 'Масова концентрація β',
    secondLabel: 'Об’єм розчину V',
    helper: 'Використовується m = βV.',
    firstType: 'beta', secondType: 'volume', outputType: 'mass'
  },
  volume: {
    firstLabel: 'Маса розчиненої речовини m',
    secondLabel: 'Масова концентрація β',
    helper: 'Використовується V = m / β.',
    firstType: 'mass', secondType: 'beta', outputType: 'volume'
  }
};

let activeMode = 'beta';

function parsePositiveNumber(value, label) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error(`${label}: введіть числове значення.`);
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} має бути додатним числом.`);
  return number;
}

function optionsFor(type, selected) {
  const units = type === 'mass' ? massUnits : type === 'volume' ? volumeUnits : betaUnits;
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

function toLitres(value, unit) {
  if (unit === 'mL') return value / 1000;
  if (unit === 'm3') return value * 1000;
  return value;
}

function fromLitres(value, unit) {
  if (unit === 'mL') return value * 1000;
  if (unit === 'm3') return value / 1000;
  return value;
}

function toGramsPerLitre(value, unit) {
  if (unit === 'mg-L') return value / 1000;
  if (unit === 'mg-mL') return value;
  if (unit === 'g-mL') return value * 1000;
  if (unit === 'kg-m3') return value;
  return value;
}

function fromGramsPerLitre(value, unit) {
  if (unit === 'mg-L') return value * 1000;
  if (unit === 'mg-mL') return value;
  if (unit === 'g-mL') return value / 1000;
  if (unit === 'kg-m3') return value;
  return value;
}

function unitLabel(unit) {
  return [...massUnits, ...volumeUnits, ...betaUnits].find(item => item.value === unit)?.label || unit;
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
    const active = button.dataset.massConcentrationMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  firstLabel.textContent = config.firstLabel;
  secondLabel.textContent = config.secondLabel;
  helper.textContent = config.helper;

  const firstDefault = config.firstType === 'mass' ? 'g' : config.firstType === 'volume' ? 'mL' : 'g-L';
  const secondDefault = config.secondType === 'mass' ? 'g' : config.secondType === 'volume' ? 'mL' : 'g-L';
  const outputDefault = config.outputType === 'mass' ? 'g' : config.outputType === 'volume' ? 'mL' : 'g-L';

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

  if (activeMode === 'beta') {
    const massG = toGrams(firstRaw, firstUnit.value);
    const volumeL = toLitres(secondRaw, secondUnit.value);
    baseValue = massG / volumeL;
    converted = fromGramsPerLitre(baseValue, outputUnit.value);
    title = 'Масова концентрація β';
    solutionSteps = [
      '<strong>1.</strong> β = m / V',
      `<strong>2.</strong> m = ${formatNumber(massG, 6)} г; V = ${formatNumber(volumeL, 6)} л`,
      `<strong>3.</strong> β = ${formatNumber(massG, 6)} / ${formatNumber(volumeL, 6)} = ${formatNumber(baseValue, 6)} г/л`
    ];
  }

  if (activeMode === 'mass') {
    const beta = toGramsPerLitre(firstRaw, firstUnit.value);
    const volumeL = toLitres(secondRaw, secondUnit.value);
    baseValue = beta * volumeL;
    converted = fromGrams(baseValue, outputUnit.value);
    title = 'Маса розчиненої речовини';
    solutionSteps = [
      '<strong>1.</strong> m = βV',
      `<strong>2.</strong> β = ${formatNumber(beta, 6)} г/л; V = ${formatNumber(volumeL, 6)} л`,
      `<strong>3.</strong> m = ${formatNumber(beta, 6)} × ${formatNumber(volumeL, 6)} = ${formatNumber(baseValue, 6)} г`
    ];
  }

  if (activeMode === 'volume') {
    const massG = toGrams(firstRaw, firstUnit.value);
    const beta = toGramsPerLitre(secondRaw, secondUnit.value);
    baseValue = massG / beta;
    converted = fromLitres(baseValue, outputUnit.value);
    title = 'Об’єм розчину';
    solutionSteps = [
      '<strong>1.</strong> V = m / β',
      `<strong>2.</strong> m = ${formatNumber(massG, 6)} г; β = ${formatNumber(beta, 6)} г/л`,
      `<strong>3.</strong> V = ${formatNumber(massG, 6)} / ${formatNumber(beta, 6)} = ${formatNumber(baseValue, 6)} л`
    ];
  }

  resultTitle.textContent = title;
  resultValue.textContent = formatNumber(converted, 6);
  resultUnit.textContent = unitLabel(outputUnit.value);
  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');
  note.textContent = 'У розрахунку V - це об’єм усього розчину, а m - маса саме розчиненої речовини.';
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
    showError(error instanceof Error ? error.message : 'Не вдалося виконати розрахунок масової концентрації.');
  }
}

modeButtons.forEach(button => button.addEventListener('click', () => {
  setMode(button.dataset.massConcentrationMode);
  resultContent.hidden = true;
  resultEmpty.hidden = false;
}));

form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});
[firstInput, secondInput].forEach(input => input.addEventListener('input', clearError));

document.querySelectorAll('[data-mass-concentration-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode || 'beta');
    firstInput.value = button.dataset.first || '';
    secondInput.value = button.dataset.second || '';
    if ([...firstUnit.options].some(option => option.value === button.dataset.firstUnit)) firstUnit.value = button.dataset.firstUnit;
    if ([...secondUnit.options].some(option => option.value === button.dataset.secondUnit)) secondUnit.value = button.dataset.secondUnit;
    if ([...outputUnit.options].some(option => option.value === button.dataset.outputUnit)) outputUnit.value = button.dataset.outputUnit;
    calculate();
  });
});

setMode(activeMode);
firstInput.value = '5';
secondInput.value = '250';
firstUnit.value = 'g';
secondUnit.value = 'mL';
outputUnit.value = 'g-L';
calculate();
