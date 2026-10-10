import { formatNumber } from './formula-core.js';

function ensureYieldUI() {
  if (!document.querySelector('link[href*="product-yield.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/product-yield.css?v=1';
    document.head.append(link);
  }

  const nav = document.querySelector('.calc-tool-nav');
  if (nav && !nav.querySelector('a[href="#product-yield"]')) {
    const anchor = document.createElement('a');
    anchor.href = '#product-yield';
    anchor.textContent = 'Вихід продукту';
    nav.append(anchor);
  }

  const lead = document.querySelector('.calc-lead');
  if (lead) {
    lead.textContent = 'Молярна маса, кількість речовини, концентрація, масова частка, газові розрахунки, розведення, стехіометрія та вихід продукту - з перевіркою одиниць і покроковим розв’язанням.';
  }

  const orb = document.querySelector('.formula-orb span');
  if (orb) orb.textContent = 'M · n · c · ω · η';

  const nextTools = document.querySelector('.next-tools-section');
  if (nextTools && !document.querySelector('#product-yield')) {
    const section = document.createElement('section');
    section.className = 'yield-section';
    section.id = 'product-yield';
    section.innerHTML = `
      <div class="shell tool-section-heading">
        <p class="eyebrow">Інструмент 08</p>
        <h2>Вихід продукту реакції</h2>
        <p>Порівнюйте практично одержану кількість продукту з теоретично можливою або знаходьте одну з цих величин за заданим виходом.</p>
      </div>

      <div class="shell calc-layout">
        <article class="calc-card">
          <div class="calc-card-head">
            <div>
              <p class="calc-kicker">Оберіть тип розрахунку</p>
              <h2>Робота з η і масою продукту</h2>
            </div>
            <span class="calc-badge">Відсотковий вихід</span>
          </div>

          <div class="yield-mode-switcher" role="group" aria-label="Тип розрахунку виходу продукту">
            <button class="is-active" type="button" data-yield-mode="eta" aria-pressed="true">Знайти η</button>
            <button type="button" data-yield-mode="practical" aria-pressed="false">Практична маса</button>
            <button type="button" data-yield-mode="theoretical" aria-pressed="false">Теоретична маса</button>
          </div>

          <form id="yieldForm" novalidate>
            <div class="yield-fields">
              <div>
                <label class="formula-label" id="yieldFirstLabel" for="yieldFirstInput">Практична маса продукту</label>
                <div class="yield-value-row">
                  <input class="value-input" id="yieldFirstInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 8,5">
                  <select class="yield-unit-select" id="yieldFirstUnit" aria-label="Одиниця першої величини"></select>
                </div>
              </div>

              <div>
                <label class="formula-label" id="yieldSecondLabel" for="yieldSecondInput">Теоретична маса продукту</label>
                <div class="yield-value-row">
                  <input class="value-input" id="yieldSecondInput" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 10">
                  <select class="yield-unit-select" id="yieldSecondUnit" aria-label="Одиниця другої величини"></select>
                </div>
              </div>
            </div>

            <p class="formula-help" id="yieldHelper"></p>
            <div class="yield-note-box"><strong>Теоретичний вихід</strong> - це максимально можлива кількість продукту за стехіометричним розрахунком. <strong>Практичний вихід</strong> - кількість продукту, фактично одержана в досліді.</div>
            <p class="formula-error" id="yieldError" role="alert" hidden></p>
            <button class="calc-button yield-submit" type="submit">Розрахувати</button>
          </form>

          <div class="example-list" aria-label="Приклади розрахунку виходу продукту">
            <span>Спробуйте:</span>
            <button type="button" data-yield-example data-mode="eta" data-first="8,5" data-first-unit="g" data-second="10" data-second-unit="g">8,5 г із 10 г → η</button>
            <button type="button" data-yield-example data-mode="practical" data-first="12" data-first-unit="g" data-second="75" data-second-unit="percent">12 г теоретично, η = 75%</button>
            <button type="button" data-yield-example data-mode="theoretical" data-first="9" data-first-unit="g" data-second="60" data-second-unit="percent">9 г практично, η = 60%</button>
          </div>
        </article>

        <aside class="result-card yield-result-card" aria-live="polite">
          <div class="result-empty" id="yieldResultEmpty">
            <div class="result-icon">η</div>
            <h2>Розв'язання з'явиться тут</h2>
            <p>Введіть практичну і теоретичну маси або задайте масу та вихід у відсотках.</p>
          </div>

          <div class="result-content" id="yieldResultContent" hidden>
            <p class="calc-kicker">Відповідь</p>
            <div class="yield-result-title" id="yieldResultTitle"></div>
            <div class="amount-final-value">
              <strong id="yieldResultValue">0</strong>
              <span id="yieldResultUnit"></span>
            </div>
            <div class="solution-steps" id="yieldSteps"></div>
            <p class="result-note" id="yieldNote"></p>
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
        <article><strong>lim</strong><h3>Лімітуючий реагент</h3><p>Визначення реагенту, який витрачається першим, і теоретичної кількості продукту.</p></article>
        <article><strong>aq</strong><h3>Стехіометрія розчинів</h3><p>Розрахунки за рівнянням реакції з концентраціями та об’ємами розчинів.</p></article>
        <article><strong>%</strong><h3>Домішки та чистота</h3><p>Розрахунки з масовою часткою чистої речовини у зразку.</p></article>
      `;
    }
  }
}

ensureYieldUI();

const form = document.querySelector('#yieldForm');
const modeButtons = [...document.querySelectorAll('[data-yield-mode]')];
const firstLabel = document.querySelector('#yieldFirstLabel');
const secondLabel = document.querySelector('#yieldSecondLabel');
const firstInput = document.querySelector('#yieldFirstInput');
const secondInput = document.querySelector('#yieldSecondInput');
const firstUnit = document.querySelector('#yieldFirstUnit');
const secondUnit = document.querySelector('#yieldSecondUnit');
const helper = document.querySelector('#yieldHelper');
const errorBox = document.querySelector('#yieldError');
const resultEmpty = document.querySelector('#yieldResultEmpty');
const resultContent = document.querySelector('#yieldResultContent');
const resultTitle = document.querySelector('#yieldResultTitle');
const resultValue = document.querySelector('#yieldResultValue');
const resultUnit = document.querySelector('#yieldResultUnit');
const steps = document.querySelector('#yieldSteps');
const note = document.querySelector('#yieldNote');

const massUnits = [
  { value: 'mg', label: 'мг' },
  { value: 'g', label: 'г' },
  { value: 'kg', label: 'кг' }
];

const modes = {
  eta: {
    firstLabel: 'Практична маса продукту',
    secondLabel: 'Теоретична маса продукту',
    helper: 'Використовується η = m(практична) / m(теоретична) × 100%.'
  },
  practical: {
    firstLabel: 'Теоретична маса продукту',
    secondLabel: 'Вихід η',
    helper: 'Використовується m(практична) = η · m(теоретична) / 100%.'
  },
  theoretical: {
    firstLabel: 'Практична маса продукту',
    secondLabel: 'Вихід η',
    helper: 'Використовується m(теоретична) = m(практична) · 100% / η.'
  }
};

let activeMode = 'eta';

function parsePositiveNumber(value, label) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error(`${label}: введіть числове значення.`);
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} має бути додатним числом.`);
  return number;
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
  return unit === 'mg' ? 'мг' : unit === 'kg' ? 'кг' : 'г';
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
    const active = button.dataset.yieldMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  firstLabel.textContent = config.firstLabel;
  secondLabel.textContent = config.secondLabel;
  helper.textContent = config.helper;

  firstUnit.innerHTML = massOptions('g');
  secondUnit.innerHTML = mode === 'eta'
    ? massOptions('g')
    : '<option value="percent">%</option>';

  clearError();
}

function renderResult(firstRaw, secondRaw) {
  let finalValue;
  let finalUnit;
  let title;
  let solutionSteps;
  let warning = '';

  if (activeMode === 'eta') {
    const practicalMass = toGrams(firstRaw, firstUnit.value);
    const theoreticalMass = toGrams(secondRaw, secondUnit.value);
    const eta = practicalMass / theoreticalMass * 100;

    finalValue = eta;
    finalUnit = '%';
    title = 'Вихід продукту η';
    solutionSteps = [
      '<strong>1.</strong> η = m(практична) / m(теоретична) × 100%',
      `<strong>2.</strong> η = ${formatNumber(practicalMass, 6)} г / ${formatNumber(theoreticalMass, 6)} г × 100%`,
      `<strong>3.</strong> η = ${formatNumber(eta, 4)}%`
    ];

    if (eta > 100) {
      warning = 'Отримано вихід понад 100%. У реальному досліді це зазвичай сигналізує про вологий або неочищений продукт, домішки чи похибку вимірювання.';
    }
  }

  if (activeMode === 'practical') {
    const theoreticalMass = toGrams(firstRaw, firstUnit.value);
    const eta = secondRaw;
    const practicalMass = theoreticalMass * eta / 100;
    const outputValue = fromGrams(practicalMass, firstUnit.value);

    finalValue = outputValue;
    finalUnit = massUnitLabel(firstUnit.value);
    title = 'Практична маса продукту';
    solutionSteps = [
      '<strong>1.</strong> m(практична) = η · m(теоретична) / 100%',
      `<strong>2.</strong> m(практична) = ${formatNumber(eta, 4)}% × ${formatNumber(theoreticalMass, 6)} г / 100%`,
      `<strong>3.</strong> m(практична) = ${formatNumber(practicalMass, 6)} г`
    ];

    if (eta > 100) warning = 'Заданий вихід перевищує 100%. Перевірте умову задачі або експериментальні дані.';
  }

  if (activeMode === 'theoretical') {
    const practicalMass = toGrams(firstRaw, firstUnit.value);
    const eta = secondRaw;
    const theoreticalMass = practicalMass * 100 / eta;
    const outputValue = fromGrams(theoreticalMass, firstUnit.value);

    finalValue = outputValue;
    finalUnit = massUnitLabel(firstUnit.value);
    title = 'Теоретична маса продукту';
    solutionSteps = [
      '<strong>1.</strong> m(теоретична) = m(практична) · 100% / η',
      `<strong>2.</strong> m(теоретична) = ${formatNumber(practicalMass, 6)} г × 100% / ${formatNumber(eta, 4)}%`,
      `<strong>3.</strong> m(теоретична) = ${formatNumber(theoreticalMass, 6)} г`
    ];

    if (eta > 100) warning = 'Заданий вихід перевищує 100%. Перевірте умову задачі або експериментальні дані.';
  }

  resultTitle.textContent = title;
  resultValue.textContent = formatNumber(finalValue, 6);
  resultUnit.textContent = finalUnit;
  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');

  if (warning) {
    note.textContent = warning;
  } else if (activeMode === 'eta' && (firstUnit.value !== 'g' || secondUnit.value !== 'g')) {
    note.textContent = 'Перед обчисленням обидві маси автоматично переведено в грами.';
  } else if (activeMode !== 'eta' && firstUnit.value !== 'g') {
    note.textContent = `Проміжний розрахунок виконано в грамах, а відповідь повернуто в ${massUnitLabel(firstUnit.value)}.`;
  } else {
    note.textContent = 'Теоретичну масу продукту зазвичай знаходять зі стехіометричного співвідношення за зрівняним рівнянням реакції.';
  }

  resultEmpty.hidden = true;
  resultContent.hidden = false;
}

function calculate() {
  clearError();

  try {
    const firstRaw = parsePositiveNumber(firstInput.value, firstLabel.textContent);
    const secondRaw = parsePositiveNumber(secondInput.value, secondLabel.textContent);
    renderResult(firstRaw, secondRaw);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати розрахунок виходу продукту.');
  }
}

modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.yieldMode)));
form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});
[firstInput, secondInput].forEach(input => input.addEventListener('input', clearError));

document.querySelectorAll('[data-yield-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode || 'eta');
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
firstInput.value = '8,5';
secondInput.value = '10';
firstUnit.value = 'g';
secondUnit.value = 'g';
calculate();
