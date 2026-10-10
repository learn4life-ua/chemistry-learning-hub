import { elements } from '../../periodic-table/data/elements.js';
import { massInfo, formatNumber, formatFormula } from './formula-core.js';

const elementMap = new Map(elements.map(element => [element.symbol, element]));
const MIN_ROWS = 2;
const MAX_ROWS = 6;

function ensureEmpiricalFormulaUI() {
  if (!document.querySelector('link[href*="empirical-formula.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/empirical-formula.css?v=1';
    document.head.append(link);
  }

  const nav = document.querySelector('.calc-tool-nav');
  if (nav && !nav.querySelector('a[href="#empirical-formula"]')) {
    const anchor = document.createElement('a');
    anchor.href = '#empirical-formula';
    anchor.textContent = 'Формула за складом';
    nav.append(anchor);
  }

  const lead = document.querySelector('.calc-lead');
  if (lead) {
    lead.textContent = 'Молярна маса, кількість речовини, концентрація, розчини, газові розрахунки, стехіометрія та визначення формули за складом - з перевіркою одиниць і покроковим розв’язанням.';
  }

  const orb = document.querySelector('.formula-orb span');
  if (orb) orb.textContent = 'M · n · c · ρ · β · MF';

  const nextTools = document.querySelector('.next-tools-section');
  if (nextTools && !document.querySelector('#empirical-formula')) {
    const section = document.createElement('section');
    section.className = 'empirical-section';
    section.id = 'empirical-formula';
    section.innerHTML = `
      <div class="shell tool-section-heading">
        <p class="eyebrow">Інструмент 14</p>
        <h2>Формула речовини за складом</h2>
        <p>Перетворюйте масові частки елементів на молярні співвідношення та визначайте найпростішу, або емпіричну, формулу речовини.</p>
      </div>

      <div class="shell calc-layout">
        <article class="calc-card empirical-card">
          <div class="calc-card-head">
            <div>
              <p class="calc-kicker">Масові частки елементів</p>
              <h2>Від відсотків до формули</h2>
            </div>
            <span class="calc-badge">ω → n → індекси</span>
          </div>

          <form id="empiricalForm" novalidate>
            <div class="empirical-table-head" aria-hidden="true">
              <span>Елемент</span><span>Масова частка, %</span><span></span>
            </div>
            <div class="empirical-rows" id="empiricalRows"></div>

            <div class="empirical-actions">
              <button class="empirical-add-button" id="empiricalAddRow" type="button">+ Додати елемент</button>
              <span id="empiricalSum">Сума: 0%</span>
            </div>

            <p class="formula-help">Введіть від 2 до 6 елементів. Сума масових часток має бути близькою до 100% з урахуванням округлення в умові.</p>
            <div class="empirical-note-box"><strong>Метод:</strong> умовно беремо 100 г речовини, для кожного елемента обчислюємо n = m / A<sub>r</sub>, ділимо всі значення на найменше та, за потреби, множимо співвідношення на невелике ціле число.</div>
            <p class="formula-error" id="empiricalError" role="alert" hidden></p>
            <button class="calc-button empirical-submit" type="submit">Визначити формулу</button>
          </form>

          <div class="example-list" aria-label="Приклади визначення формули за складом">
            <span>Спробуйте:</span>
            <button type="button" data-empirical-example data-elements="C;H;O" data-percentages="40;6,7;53,3">40% C, 6,7% H, 53,3% O</button>
            <button type="button" data-empirical-example data-elements="Fe;O" data-percentages="69,94;30,06">69,94% Fe, 30,06% O</button>
            <button type="button" data-empirical-example data-elements="C;H;O" data-percentages="52,14;13,13;34,73">52,14% C, 13,13% H, 34,73% O</button>
          </div>
        </article>

        <aside class="result-card empirical-result-card" aria-live="polite">
          <div class="result-empty" id="empiricalResultEmpty">
            <div class="result-icon">MF</div>
            <h2>Формула з'явиться тут</h2>
            <p>Введіть елементи та їх масові частки або скористайтеся готовим прикладом.</p>
          </div>

          <div class="result-content" id="empiricalResultContent" hidden>
            <p class="calc-kicker">Найпростіша формула</p>
            <div class="empirical-formula-result" id="empiricalFormulaResult"></div>
            <div class="empirical-ratio" id="empiricalRatio"></div>
            <div class="solution-steps" id="empiricalSteps"></div>
            <p class="result-note" id="empiricalNote"></p>
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
        <article><strong>b</strong><h3>Моляльність</h3><p>Кількість розчиненої речовини на кілограм розчинника.</p></article>
        <article><strong>M</strong><h3>Молекулярна формула за M</h3><p>Перехід від найпростішої формули до молекулярної за молярною масою.</p></article>
        <article><strong>Σ</strong><h3>Комбіновані задачі</h3><p>Задачі, у яких потрібно послідовно використати кілька хімічних величин.</p></article>
      `;
    }
  }
}

function parsePositiveNumber(value, label) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error(`${label}: введіть числове значення.`);
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} має бути додатним числом.`);
  return number;
}

function normalizeSymbol(value) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error('Введіть символ елемента.');
  if (!/^[A-Za-z]{1,2}$/.test(text)) throw new Error(`«${text}» не є коректним символом елемента.`);
  const symbol = text[0].toUpperCase() + text.slice(1).toLowerCase();
  if (!elementMap.has(symbol)) throw new Error(`Елемент «${symbol}» не знайдено в Періодичній системі.`);
  return symbol;
}

function greatestCommonDivisor(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

function simplifyIntegers(values) {
  const divisor = values.reduce((current, value) => greatestCommonDivisor(current, value));
  return values.map(value => value / divisor);
}

function findIntegerRatio(ratios) {
  for (let multiplier = 1; multiplier <= 12; multiplier += 1) {
    const scaled = ratios.map(value => value * multiplier);
    const rounded = scaled.map(value => Math.round(value));
    if (rounded.some(value => value < 1 || value > 24)) continue;

    const maxError = Math.max(...scaled.map((value, index) => Math.abs(value - rounded[index])));
    if (maxError <= 0.055) {
      return { multiplier, integers: simplifyIntegers(rounded), maxError };
    }
  }
  return null;
}

function formulaFromRows(rows) {
  return rows.map(row => `${row.symbol}${row.index === 1 ? '' : row.index}`).join('');
}

ensureEmpiricalFormulaUI();

const form = document.querySelector('#empiricalForm');
const rowsWrap = document.querySelector('#empiricalRows');
const addButton = document.querySelector('#empiricalAddRow');
const sumBox = document.querySelector('#empiricalSum');
const errorBox = document.querySelector('#empiricalError');
const resultEmpty = document.querySelector('#empiricalResultEmpty');
const resultContent = document.querySelector('#empiricalResultContent');
const formulaResult = document.querySelector('#empiricalFormulaResult');
const ratioBox = document.querySelector('#empiricalRatio');
const steps = document.querySelector('#empiricalSteps');
const note = document.querySelector('#empiricalNote');

function rowTemplate(symbol = '', percentage = '') {
  return `
    <div class="empirical-row">
      <input class="empirical-symbol-input" type="text" maxlength="2" autocomplete="off" spellcheck="false" placeholder="C" aria-label="Символ елемента" value="${symbol}">
      <div class="empirical-percent-wrap">
        <input class="value-input empirical-percent-input" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 40" aria-label="Масова частка елемента" value="${percentage}">
        <span>%</span>
      </div>
      <button class="empirical-remove-button" type="button" aria-label="Видалити елемент">×</button>
    </div>
  `;
}

function updateRowControls() {
  const rows = [...rowsWrap.querySelectorAll('.empirical-row')];
  rows.forEach(row => {
    const remove = row.querySelector('.empirical-remove-button');
    remove.disabled = rows.length <= MIN_ROWS;
  });
  addButton.disabled = rows.length >= MAX_ROWS;
  updateSum();
}

function updateSum() {
  const values = [...rowsWrap.querySelectorAll('.empirical-percent-input')]
    .map(input => Number(String(input.value).trim().replace(',', '.')))
    .filter(Number.isFinite);
  const sum = values.reduce((total, value) => total + value, 0);
  sumBox.textContent = `Сума: ${formatNumber(sum, 3)}%`;
  sumBox.classList.toggle('is-near-100', sum >= 99 && sum <= 101);
}

function addRow(symbol = '', percentage = '') {
  rowsWrap.insertAdjacentHTML('beforeend', rowTemplate(symbol, percentage));
  updateRowControls();
}

function setRows(symbols, percentages) {
  rowsWrap.innerHTML = '';
  symbols.forEach((symbol, index) => addRow(symbol, percentages[index] ?? ''));
  while (rowsWrap.children.length < MIN_ROWS) addRow();
  updateRowControls();
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  resultContent.hidden = true;
  resultEmpty.hidden = false;
}

function collectRows() {
  const seen = new Set();
  const entries = [...rowsWrap.querySelectorAll('.empirical-row')].map((row, index) => {
    const symbolInput = row.querySelector('.empirical-symbol-input');
    const percentInput = row.querySelector('.empirical-percent-input');
    const symbol = normalizeSymbol(symbolInput.value);
    if (seen.has(symbol)) throw new Error(`Елемент ${symbol} введено більше одного разу.`);
    seen.add(symbol);

    const percentage = parsePositiveNumber(percentInput.value, `Масова частка ${symbol}`);
    if (percentage > 100) throw new Error(`Масова частка ${symbol} не може перевищувати 100%.`);

    symbolInput.value = symbol;
    const element = elementMap.get(symbol);
    const mass = massInfo(element);
    return { index, symbol, percentage, element, mass };
  });

  const sum = entries.reduce((total, entry) => total + entry.percentage, 0);
  if (sum < 99 || sum > 101) {
    throw new Error(`Сума масових часток дорівнює ${formatNumber(sum, 3)}%. Для повного складу вона має бути близькою до 100%.`);
  }

  return { entries, sum };
}

function calculate() {
  clearError();

  try {
    const { entries, sum } = collectRows();
    const withMoles = entries.map(entry => ({
      ...entry,
      amount: entry.percentage / entry.mass.numeric
    }));

    const minimum = Math.min(...withMoles.map(entry => entry.amount));
    const ratios = withMoles.map(entry => entry.amount / minimum);
    const integerRatio = findIntegerRatio(ratios);
    if (!integerRatio) {
      throw new Error('Не вдалося надійно звести молярні співвідношення до малих цілих індексів. Перевірте відсотковий склад або точність вихідних даних.');
    }

    const finalRows = withMoles.map((entry, index) => ({
      ...entry,
      ratio: ratios[index],
      index: integerRatio.integers[index]
    }));
    const formula = formulaFromRows(finalRows);
    const empiricalMass = finalRows.reduce((total, row) => total + row.mass.numeric * row.index, 0);
    const hasApproximateMass = finalRows.some(row => row.mass.approximate);

    formulaResult.innerHTML = formatFormula(formula);
    ratioBox.textContent = finalRows.map(row => `${row.symbol} : ${row.index}`).join('   ');

    const stepItems = [
      `<strong>1.</strong> Умовно беремо 100 г речовини, тому маси елементів чисельно дорівнюють їх відсоткам: ${entries.map(entry => `${entry.symbol} - ${formatNumber(entry.percentage, 4)} г`).join('; ')}.`,
      `<strong>2.</strong> Обчислюємо n = m / Aᵣ: ${withMoles.map(entry => `${entry.symbol}: ${formatNumber(entry.percentage, 4)} / ${entry.mass.raw} = ${formatNumber(entry.amount, 6)} моль`).join('; ')}.`,
      `<strong>3.</strong> Ділимо на найменше значення ${formatNumber(minimum, 6)}: ${finalRows.map(row => `${row.symbol}: ${formatNumber(row.ratio, 4)}`).join('; ')}.`,
      integerRatio.multiplier === 1
        ? `<strong>4.</strong> Співвідношення вже близьке до цілих чисел: ${integerRatio.integers.join(' : ')}.`
        : `<strong>4.</strong> Для отримання цілих індексів множимо співвідношення на ${integerRatio.multiplier}: ${integerRatio.integers.join(' : ')}.`,
      `<strong>5.</strong> Найпростіша формула: ${formatFormula(formula)}.`
    ];
    steps.innerHTML = stepItems.map(step => `<div class="solution-step">${step}</div>`).join('');

    const sumNote = Math.abs(sum - 100) > 0.01
      ? ` Сума введених часток ${formatNumber(sum, 3)}%, що допустимо як округлення вихідних даних.`
      : '';
    note.textContent = `Молярна маса найпростішої формульної одиниці ≈ ${formatNumber(empiricalMass, 4)} г/моль.${sumNote}${hasApproximateMass ? ' Для одного або кількох елементів використано наведене в таблиці масове число ізотопу.' : ''}`;

    resultEmpty.hidden = true;
    resultContent.hidden = false;
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося визначити найпростішу формулу.');
  }
}

addButton?.addEventListener('click', () => {
  if (rowsWrap.children.length < MAX_ROWS) addRow();
});

rowsWrap?.addEventListener('click', event => {
  const button = event.target.closest('.empirical-remove-button');
  if (!button || rowsWrap.children.length <= MIN_ROWS) return;
  button.closest('.empirical-row')?.remove();
  updateRowControls();
});

rowsWrap?.addEventListener('input', () => {
  clearError();
  updateSum();
});

form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});

document.querySelectorAll('[data-empirical-example]').forEach(button => {
  button.addEventListener('click', () => {
    const symbols = (button.dataset.elements || '').split(';').filter(Boolean);
    const percentages = (button.dataset.percentages || '').split(';');
    setRows(symbols, percentages);
    calculate();
    document.querySelector('#empirical-formula')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

setRows(['C', 'H', 'O'], ['40', '6,7', '53,3']);
calculate();
