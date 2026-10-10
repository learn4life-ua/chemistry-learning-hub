import { formatNumber } from './formula-core.js';

function ensurePurityUI() {
  if (!document.querySelector('link[href*="purity.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/purity.css?v=1';
    document.head.append(link);
  }

  const nav = document.querySelector('.calc-tool-nav');
  if (nav && !nav.querySelector('a[href="#purity-calculations"]')) {
    const anchor = document.createElement('a');
    anchor.href = '#purity-calculations';
    anchor.textContent = 'Домішки та чистота';
    nav.append(anchor);
  }

  const lead = document.querySelector('.calc-lead');
  if (lead) {
    lead.textContent = 'Молярна маса, кількість речовини, концентрація, розчини, газові розрахунки, стехіометрія, вихід продукту та чистота речовини - з перевіркою одиниць і покроковим розв’язанням.';
  }

  const orb = document.querySelector('.formula-orb span');
  if (orb) orb.textContent = 'M · n · c · η · lim · aq · %';

  const nextTools = document.querySelector('.next-tools-section');
  if (nextTools && !document.querySelector('#purity-calculations')) {
    const section = document.createElement('section');
    section.className = 'purity-section';
    section.id = 'purity-calculations';
    section.innerHTML = `
      <div class="shell tool-section-heading">
        <p class="eyebrow">Інструмент 11</p>
        <h2>Домішки та чистота речовини</h2>
        <p>Обчислюйте масову частку чистої речовини у зразку, масу чистої речовини або масу зразка за заданою чистотою.</p>
      </div>

      <div class="shell calc-layout">
        <article class="calc-card">
          <div class="calc-card-head">
            <div>
              <p class="calc-kicker">Оберіть тип розрахунку</p>
              <h2>Робота з чистою речовиною і домішками</h2>
            </div>
            <span class="calc-badge">% чистоти</span>
          </div>

          <div class="purity-mode-switcher" role="group" aria-label="Тип розрахунку чистоти речовини">
            <button class="is-active" type="button" data-purity-mode="purity" aria-pressed="true">Знайти чистоту</button>
            <button type="button" data-purity-mode="pure-mass" aria-pressed="false">Маса чистої речовини</button>
            <button type="button" data-purity-mode="sample-mass" aria-pressed="false">Маса зразка</button>
          </div>

          <form id="purityForm" novalidate>
            <div class="purity-fields">
              <div>
                <label class="formula-label" id="purityFirstLabel" for="purityFirstInput">Маса чистої речовини</label>
                <div class="purity-value-row">
                  <input class="value-input" id="purityFirstInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 18">
                  <select class="purity-unit-select" id="purityFirstUnit" aria-label="Одиниця першої величини"></select>
                </div>
              </div>

              <div>
                <label class="formula-label" id="puritySecondLabel" for="puritySecondInput">Маса зразка</label>
                <div class="purity-value-row">
                  <input class="value-input" id="puritySecondInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 20">
                  <select class="purity-unit-select" id="puritySecondUnit" aria-label="Одиниця другої величини"></select>
                </div>
              </div>
            </div>

            <p class="formula-help" id="purityHelper"></p>
            <div class="purity-note-box"><strong>Модель:</strong> зразок розглядаємо як чисту цільову речовину та домішки. Масова частка домішок дорівнює 100% мінус масова частка чистої речовини.</div>
            <p class="formula-error" id="purityError" role="alert" hidden></p>
            <button class="calc-button purity-submit" type="submit">Розрахувати</button>
          </form>

          <div class="example-list" aria-label="Приклади розрахунків чистоти">
            <span>Спробуйте:</span>
            <button type="button" data-purity-example data-mode="purity" data-first="18" data-first-unit="g" data-second="20" data-second-unit="g">18 г чистої речовини у 20 г зразка</button>
            <button type="button" data-purity-example data-mode="pure-mass" data-first="250" data-first-unit="g" data-second="80" data-second-unit="percent">250 г зразка, чистота 80%</button>
            <button type="button" data-purity-example data-mode="sample-mass" data-first="45" data-first-unit="g" data-second="75" data-second-unit="percent">45 г чистої речовини, чистота 75%</button>
          </div>
        </article>

        <aside class="result-card purity-result-card" aria-live="polite">
          <div class="result-empty" id="purityResultEmpty">
            <div class="result-icon">%</div>
            <h2>Розв'язання з'явиться тут</h2>
            <p>Введіть маси або задайте масу та відсоток чистоти.</p>
          </div>

          <div class="result-content" id="purityResultContent" hidden>
            <p class="calc-kicker">Відповідь</p>
            <div class="purity-result-title" id="purityResultTitle"></div>
            <div class="amount-final-value">
              <strong id="purityResultValue">0</strong>
              <span id="purityResultUnit"></span>
            </div>
            <div class="solution-steps" id="puritySteps"></div>
            <p class="result-note" id="purityNote"></p>
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
        <article><strong>ρ</strong><h3>Густина розчинів</h3><p>Зв’язок між масою, об’ємом, густиною і складом розчину.</p></article>
        <article><strong>β</strong><h3>Масова концентрація</h3><p>Маса розчиненої речовини в одиниці об’єму розчину.</p></article>
        <article><strong>MF</strong><h3>Формула за складом</h3><p>Визначення найпростішої формули за масовими частками елементів.</p></article>
      `;
    }
  }
}

ensurePurityUI();

const form = document.querySelector('#purityForm');
const modeButtons = [...document.querySelectorAll('[data-purity-mode]')];
const firstLabel = document.querySelector('#purityFirstLabel');
const secondLabel = document.querySelector('#puritySecondLabel');
const firstInput = document.querySelector('#purityFirstInput');
const secondInput = document.querySelector('#puritySecondInput');
const firstUnit = document.querySelector('#purityFirstUnit');
const secondUnit = document.querySelector('#puritySecondUnit');
const helper = document.querySelector('#purityHelper');
const errorBox = document.querySelector('#purityError');
const resultEmpty = document.querySelector('#purityResultEmpty');
const resultContent = document.querySelector('#purityResultContent');
const resultTitle = document.querySelector('#purityResultTitle');
const resultValue = document.querySelector('#purityResultValue');
const resultUnit = document.querySelector('#purityResultUnit');
const steps = document.querySelector('#puritySteps');
const note = document.querySelector('#purityNote');

const massUnits = [
  { value: 'mg', label: 'мг' },
  { value: 'g', label: 'г' },
  { value: 'kg', label: 'кг' }
];

const modes = {
  purity: {
    firstLabel: 'Маса чистої речовини',
    secondLabel: 'Маса зразка',
    helper: 'Використовується ω(чистої речовини) = m(чистої речовини) / m(зразка) × 100%.'
  },
  'pure-mass': {
    firstLabel: 'Маса зразка',
    secondLabel: 'Чистота зразка',
    helper: 'Використовується m(чистої речовини) = m(зразка) × ω / 100%.'
  },
  'sample-mass': {
    firstLabel: 'Маса чистої речовини',
    secondLabel: 'Чистота зразка',
    helper: 'Використовується m(зразка) = m(чистої речовини) × 100% / ω.'
  }
};

let activeMode = 'purity';

function parsePositiveNumber(value, label) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error(`${label}: введіть числове значення.`);
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} має бути додатним числом.`);
  return number;
}

function validatePercent(value) {
  if (value > 100) throw new Error('Чистота зразка не може перевищувати 100%.');
  return value;
}

function massOptions(selected = 'g') {
  return massUnits.map(unit => `<option value="${unit.value}"${unit.value === selected ? ' selected' : ''}>${unit.label}</option>`).join('');
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

function massUnitLabel(unit) {
  if (unit === 'mg') return 'мг';
  if (unit === 'kg') return 'кг';
  return 'г';
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
    const active = button.dataset.purityMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  firstLabel.textContent = config.firstLabel;
  secondLabel.textContent = config.secondLabel;
  helper.textContent = config.helper;

  firstUnit.innerHTML = massOptions('g');
  secondUnit.innerHTML = mode === 'purity'
    ? massOptions('g')
    : '<option value="percent">%</option>';

  clearError();
}

function renderResult(firstRaw, secondRaw) {
  let finalValue;
  let finalUnit;
  let title;
  let solutionSteps;
  let impurityMassG;
  let impurityPercent;
  let outputMassUnit = firstUnit.value;

  if (activeMode === 'purity') {
    const pureMassG = toGrams(firstRaw, firstUnit.value);
    const sampleMassG = toGrams(secondRaw, secondUnit.value);
    if (pureMassG > sampleMassG) {
      throw new Error('Маса чистої речовини не може перевищувати масу зразка.');
    }

    const purity = pureMassG / sampleMassG * 100;
    impurityMassG = sampleMassG - pureMassG;
    impurityPercent = 100 - purity;

    finalValue = purity;
    finalUnit = '%';
    title = 'Масова частка чистої речовини';
    solutionSteps = [
      '<strong>1.</strong> ω(чистої речовини) = m(чистої речовини) / m(зразка) × 100%',
      `<strong>2.</strong> ω = ${formatNumber(pureMassG, 6)} г / ${formatNumber(sampleMassG, 6)} г × 100%`,
      `<strong>3.</strong> ω = ${formatNumber(purity, 4)}%`,
      `<strong>4.</strong> ω(домішок) = 100% − ${formatNumber(purity, 4)}% = ${formatNumber(impurityPercent, 4)}%`
    ];
    outputMassUnit = secondUnit.value;
  }

  if (activeMode === 'pure-mass') {
    const sampleMassG = toGrams(firstRaw, firstUnit.value);
    const purity = validatePercent(secondRaw);
    const pureMassG = sampleMassG * purity / 100;
    impurityMassG = sampleMassG - pureMassG;
    impurityPercent = 100 - purity;

    finalValue = fromGrams(pureMassG, firstUnit.value);
    finalUnit = massUnitLabel(firstUnit.value);
    title = 'Маса чистої речовини';
    solutionSteps = [
      '<strong>1.</strong> m(чистої речовини) = m(зразка) × ω / 100%',
      `<strong>2.</strong> m = ${formatNumber(sampleMassG, 6)} г × ${formatNumber(purity, 4)}% / 100%`,
      `<strong>3.</strong> m(чистої речовини) = ${formatNumber(pureMassG, 6)} г`,
      `<strong>4.</strong> m(домішок) = ${formatNumber(sampleMassG, 6)} г − ${formatNumber(pureMassG, 6)} г = ${formatNumber(impurityMassG, 6)} г`
    ];
  }

  if (activeMode === 'sample-mass') {
    const pureMassG = toGrams(firstRaw, firstUnit.value);
    const purity = validatePercent(secondRaw);
    const sampleMassG = pureMassG * 100 / purity;
    impurityMassG = sampleMassG - pureMassG;
    impurityPercent = 100 - purity;

    finalValue = fromGrams(sampleMassG, firstUnit.value);
    finalUnit = massUnitLabel(firstUnit.value);
    title = 'Маса зразка';
    solutionSteps = [
      '<strong>1.</strong> m(зразка) = m(чистої речовини) × 100% / ω',
      `<strong>2.</strong> m(зразка) = ${formatNumber(pureMassG, 6)} г × 100% / ${formatNumber(purity, 4)}%`,
      `<strong>3.</strong> m(зразка) = ${formatNumber(sampleMassG, 6)} г`,
      `<strong>4.</strong> m(домішок) = ${formatNumber(sampleMassG, 6)} г − ${formatNumber(pureMassG, 6)} г = ${formatNumber(impurityMassG, 6)} г`
    ];
  }

  resultTitle.textContent = title;
  resultValue.textContent = formatNumber(finalValue, 6);
  resultUnit.textContent = finalUnit;
  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');

  const impurityMassOutput = fromGrams(impurityMassG, outputMassUnit);
  note.textContent = impurityPercent <= 1e-10
    ? 'Зразок відповідає 100% чистоті: у межах заданої моделі маса домішок дорівнює нулю.'
    : `Домішки становлять ${formatNumber(impurityPercent, 4)}% зразка. Їх маса: ${formatNumber(impurityMassOutput, 6)} ${massUnitLabel(outputMassUnit)}.`;

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
    showError(error instanceof Error ? error.message : 'Не вдалося виконати розрахунок чистоти речовини.');
  }
}

modeButtons.forEach(button => button.addEventListener('click', () => {
  setMode(button.dataset.purityMode);
  resultContent.hidden = true;
  resultEmpty.hidden = false;
}));

form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});

[firstInput, secondInput].forEach(input => input.addEventListener('input', clearError));

document.querySelectorAll('[data-purity-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode || 'purity');
    firstInput.value = button.dataset.first || '';
    secondInput.value = button.dataset.second || '';

    if ([...firstUnit.options].some(option => option.value === button.dataset.firstUnit)) {
      firstUnit.value = button.dataset.firstUnit;
    }
    if ([...secondUnit.options].some(option => option.value === button.dataset.secondUnit)) {
      secondUnit.value = button.dataset.secondUnit;
    }
    calculate();
  });
});

setMode(activeMode);
firstInput.value = '18';
secondInput.value = '20';
firstUnit.value = 'g';
secondUnit.value = 'g';
calculate();
