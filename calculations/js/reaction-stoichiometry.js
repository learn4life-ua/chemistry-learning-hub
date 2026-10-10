import { getFormulaData, formatNumber, formatFormula } from './formula-core.js';

function ensureReactionUI() {
  if (!document.querySelector('link[href*="reaction-stoichiometry.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/reaction-stoichiometry.css?v=1';
    document.head.append(link);
  }

  const nav = document.querySelector('.calc-tool-nav');
  if (nav && !nav.querySelector('a[href="#reaction-stoichiometry"]')) {
    const anchor = document.createElement('a');
    anchor.href = '#reaction-stoichiometry';
    anchor.textContent = 'За рівнянням реакції';
    nav.append(anchor);
  }

  const lead = document.querySelector('.calc-lead');
  if (lead) {
    lead.textContent = 'Молярна маса, кількість речовини, концентрація, масова частка, газові розрахунки, розведення та стехіометрія - з перевіркою одиниць і покроковим розв’язанням.';
  }

  const orb = document.querySelector('.formula-orb span');
  if (orb) orb.textContent = 'M · n · c · ω · →';

  const nextTools = document.querySelector('.next-tools-section');
  if (nextTools && !document.querySelector('#reaction-stoichiometry')) {
    const section = document.createElement('section');
    section.className = 'reaction-section';
    section.id = 'reaction-stoichiometry';
    section.innerHTML = `
      <div class="shell tool-section-heading">
        <p class="eyebrow">Інструмент 07</p>
        <h2>Розрахунки за рівнянням реакції</h2>
        <p>Введіть уже зрівняне молекулярне рівняння. Калькулятор перевірить баланс елементів і використає стехіометричні коефіцієнти для переходу від відомої речовини до шуканої.</p>
      </div>

      <div class="shell calc-layout">
        <article class="calc-card">
          <div class="calc-card-head">
            <div>
              <p class="calc-kicker">Стехіометрія</p>
              <h2>Від однієї речовини до іншої</h2>
            </div>
            <span class="calc-badge">Перевірка балансу</span>
          </div>

          <form id="reactionForm" novalidate>
            <div class="reaction-equation-row">
              <label class="formula-label" for="reactionEquationInput">Зрівняне рівняння реакції</label>
              <input class="reaction-equation-input" id="reactionEquationInput" type="text" autocomplete="off" spellcheck="false" placeholder="Наприклад, 2H2 + O2 -> 2H2O">
              <button class="calc-button" id="reactionParseButton" type="button">Перевірити</button>
            </div>
            <p class="formula-help">Підтримуються молекулярні рівняння без йонних зарядів. Коефіцієнти мають бути цілими додатними числами.</p>
            <div class="reaction-status" id="reactionStatus" hidden></div>

            <div class="reaction-fields" id="reactionFields" hidden>
              <div class="reaction-field-block">
                <h3>Відомо</h3>
                <label class="formula-label" for="reactionKnownSelect">Речовина</label>
                <select class="reaction-select" id="reactionKnownSelect"></select>
                <div class="reaction-known-row">
                  <input class="value-input" id="reactionKnownValue" type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 4">
                  <select class="reaction-unit-select" id="reactionKnownUnit">
                    <option value="g">г</option>
                    <option value="mol">моль</option>
                    <option value="mmol">ммоль</option>
                  </select>
                </div>
              </div>

              <div class="reaction-field-block">
                <h3>Знайти</h3>
                <label class="formula-label" for="reactionTargetSelect">Речовина</label>
                <select class="reaction-select" id="reactionTargetSelect"></select>
                <div class="reaction-target-row">
                  <label class="formula-label" for="reactionTargetUnit">Одиниця результату</label>
                  <select class="reaction-unit-select" id="reactionTargetUnit">
                    <option value="g">г</option>
                    <option value="mol">моль</option>
                    <option value="mmol">ммоль</option>
                  </select>
                </div>
              </div>
            </div>

            <p class="formula-error" id="reactionError" role="alert" hidden></p>
            <button class="calc-button reaction-submit" id="reactionSubmit" type="submit" hidden>Розрахувати</button>
          </form>

          <div class="example-list" aria-label="Приклади стехіометричних розрахунків">
            <span>Спробуйте:</span>
            <button type="button" data-reaction-example data-equation="2H2 + O2 -> 2H2O" data-known="H2" data-target="H2O" data-value="4" data-known-unit="g" data-target-unit="g">4 г H₂ → H₂O</button>
            <button type="button" data-reaction-example data-equation="CaCO3 -> CaO + CO2" data-known="CaCO3" data-target="CO2" data-value="10" data-known-unit="g" data-target-unit="g">10 г CaCO₃ → CO₂</button>
            <button type="button" data-reaction-example data-equation="4Al + 3O2 -> 2Al2O3" data-known="Al" data-target="Al2O3" data-value="5,4" data-known-unit="g" data-target-unit="g">5,4 г Al → Al₂O₃</button>
          </div>

          <div class="reaction-balance-note"><strong>Важливо:</strong> цей інструмент не підбирає коефіцієнти автоматично. Він спочатку перевіряє, чи зберігається кількість атомів кожного елемента в уже записаному рівнянні.</div>
        </article>

        <aside class="result-card reaction-result-card" aria-live="polite">
          <div class="result-empty" id="reactionResultEmpty">
            <div class="result-icon">→</div>
            <h2>Розв'язання з'явиться тут</h2>
            <p>Введіть зрівняне рівняння, оберіть відому і шукану речовини та задайте кількість.</p>
          </div>

          <div class="result-content" id="reactionResultContent" hidden>
            <p class="calc-kicker">Відповідь</p>
            <div class="reaction-equation-view" id="reactionEquationView"></div>
            <div class="amount-final-value">
              <strong id="reactionResultValue">0</strong>
              <span id="reactionResultUnit"></span>
            </div>
            <div class="solution-steps" id="reactionSteps"></div>
            <p class="result-note" id="reactionNote"></p>
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
        <article><strong>η</strong><h3>Вихід продукту</h3><p>Теоретичний і практичний вихід продукту реакції у відсотках.</p></article>
        <article><strong>lim</strong><h3>Лімітуючий реагент</h3><p>Визначення реагенту, який витрачається першим, і кількості продукту.</p></article>
        <article><strong>aq</strong><h3>Стехіометрія розчинів</h3><p>Розрахунки за рівнянням реакції з концентраціями та об’ємами розчинів.</p></article>
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

function stripState(formula) {
  const match = formula.match(/^(.*?)(\((?:s|l|g|aq)\))$/i);
  return match ? { formula: match[1], state: match[2] } : { formula, state: '' };
}

function parseSpecies(raw, side, index) {
  const text = raw.trim();
  if (!text) throw new Error('У рівнянні є порожня позиція між знаками «+».');
  if (/[⁺⁻^]/.test(text)) throw new Error('Йонні заряди в цьому інструменті поки не підтримуються. Введіть молекулярне рівняння.');

  const coefficientMatch = text.match(/^(\d+)?\s*(.+)$/);
  const coefficient = coefficientMatch?.[1] ? Number(coefficientMatch[1]) : 1;
  if (!Number.isSafeInteger(coefficient) || coefficient < 1 || coefficient > 9999) {
    throw new Error('Стехіометричний коефіцієнт має бути цілим додатним числом від 1 до 9999.');
  }

  const body = (coefficientMatch?.[2] || '').trim();
  const { formula, state } = stripState(body.replace(/\s+/g, ''));
  if (!formula) throw new Error('Після коефіцієнта має бути формула речовини.');

  const data = getFormulaData(formula);
  return {
    id: `${side}-${index}`,
    side,
    coefficient,
    formula: data.formula,
    state,
    data
  };
}

function parseEquation(value) {
  const normalized = String(value ?? '').trim().replace(/⇌|↔/g, '->').replace(/→/g, '->');
  if (!normalized) throw new Error('Введіть рівняння реакції.');

  const parts = normalized.split(/\s*(?:->|=)\s*/);
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('Запишіть рівняння у форматі «реагенти -> продукти».');
  }

  const reactants = parts[0].split('+').map((item, index) => parseSpecies(item, 'left', index));
  const products = parts[1].split('+').map((item, index) => parseSpecies(item, 'right', index));
  if (!reactants.length || !products.length) throw new Error('У рівнянні мають бути реагенти і продукти.');

  const sumSide = species => {
    const totals = new Map();
    species.forEach(item => {
      item.data.counts.forEach((count, symbol) => {
        totals.set(symbol, (totals.get(symbol) || 0) + count * item.coefficient);
      });
    });
    return totals;
  };

  const leftTotals = sumSide(reactants);
  const rightTotals = sumSide(products);
  const symbols = new Set([...leftTotals.keys(), ...rightTotals.keys()]);
  const mismatches = [...symbols].filter(symbol => (leftTotals.get(symbol) || 0) !== (rightTotals.get(symbol) || 0));
  if (mismatches.length) {
    const details = mismatches.map(symbol => `${symbol}: ${leftTotals.get(symbol) || 0} ≠ ${rightTotals.get(symbol) || 0}`).join('; ');
    throw new Error(`Рівняння не зрівняне. Перевірте коефіцієнти (${details}).`);
  }

  return { reactants, products, all: [...reactants, ...products] };
}

function speciesLabel(item) {
  const coefficient = item.coefficient === 1 ? '' : `${item.coefficient} `;
  return `${coefficient}${item.formula}${item.state}`;
}

function speciesHTML(item) {
  const coefficient = item.coefficient === 1 ? '' : `<span class="reaction-coeff">${item.coefficient}</span>`;
  return `${coefficient}${formatFormula(item.formula)}${item.state}`;
}

function equationHTML(equation) {
  const side = items => items.map(speciesHTML).join(' <span class="reaction-side-sep">+</span> ');
  return `${side(equation.reactants)} <span class="reaction-arrow">→</span> ${side(equation.products)}`;
}

function unitToMoles(value, unit, molarMass) {
  if (unit === 'mol') return value;
  if (unit === 'mmol') return value / 1000;
  if (unit === 'g') return value / molarMass;
  throw new Error('Невідома одиниця відомої величини.');
}

function molesToUnit(moles, unit, molarMass) {
  if (unit === 'mol') return { value: moles, label: 'моль' };
  if (unit === 'mmol') return { value: moles * 1000, label: 'ммоль' };
  if (unit === 'g') return { value: moles * molarMass, label: 'г' };
  throw new Error('Невідома одиниця шуканої величини.');
}

ensureReactionUI();

const form = document.querySelector('#reactionForm');
const equationInput = document.querySelector('#reactionEquationInput');
const parseButton = document.querySelector('#reactionParseButton');
const status = document.querySelector('#reactionStatus');
const fields = document.querySelector('#reactionFields');
const knownSelect = document.querySelector('#reactionKnownSelect');
const targetSelect = document.querySelector('#reactionTargetSelect');
const knownValue = document.querySelector('#reactionKnownValue');
const knownUnit = document.querySelector('#reactionKnownUnit');
const targetUnit = document.querySelector('#reactionTargetUnit');
const submit = document.querySelector('#reactionSubmit');
const errorBox = document.querySelector('#reactionError');
const resultEmpty = document.querySelector('#reactionResultEmpty');
const resultContent = document.querySelector('#reactionResultContent');
const equationView = document.querySelector('#reactionEquationView');
const resultValue = document.querySelector('#reactionResultValue');
const resultUnit = document.querySelector('#reactionResultUnit');
const steps = document.querySelector('#reactionSteps');
const note = document.querySelector('#reactionNote');

let currentEquation = null;

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

function refreshSelectors(equation) {
  const options = equation.all.map(item => `<option value="${item.id}">${speciesLabel(item)}</option>`).join('');
  knownSelect.innerHTML = options;
  targetSelect.innerHTML = options;
  if (equation.all.length > 1) targetSelect.value = equation.all[equation.all.length - 1].id;
}

function parseAndPrepare() {
  clearError();
  try {
    currentEquation = parseEquation(equationInput.value);
    refreshSelectors(currentEquation);
    status.innerHTML = `<strong>Рівняння зрівняне.</strong> Баланс атомів перевірено для ${currentEquation.all.length} речовин.`;
    status.hidden = false;
    fields.hidden = false;
    submit.hidden = false;
    return true;
  } catch (error) {
    currentEquation = null;
    status.hidden = true;
    fields.hidden = true;
    submit.hidden = true;
    showError(error instanceof Error ? error.message : 'Не вдалося прочитати рівняння реакції.');
    return false;
  }
}

function calculate() {
  clearError();
  try {
    if (!currentEquation && !parseAndPrepare()) return;
    const known = currentEquation.all.find(item => item.id === knownSelect.value);
    const target = currentEquation.all.find(item => item.id === targetSelect.value);
    if (!known || !target) throw new Error('Оберіть відому і шукану речовини.');
    if (known.id === target.id) throw new Error('Відома і шукана речовини мають бути різними.');

    const raw = parsePositiveNumber(knownValue.value, 'Відоме значення');
    const knownMolarMass = known.data.totalMass;
    const targetMolarMass = target.data.totalMass;
    const knownMoles = unitToMoles(raw, knownUnit.value, knownMolarMass);
    const targetMoles = knownMoles * target.coefficient / known.coefficient;
    const output = molesToUnit(targetMoles, targetUnit.value, targetMolarMass);

    equationView.innerHTML = equationHTML(currentEquation);
    resultValue.textContent = formatNumber(output.value, 6);
    resultUnit.textContent = output.label;

    const knownFormula = formatFormula(known.formula);
    const targetFormula = formatFormula(target.formula);
    const solutionSteps = [];

    if (knownUnit.value === 'g') {
      solutionSteps.push(`<strong>1.</strong> M(${knownFormula}) = ${formatNumber(knownMolarMass, 5)} г/моль; n(${knownFormula}) = m / M = ${formatNumber(raw, 6)} / ${formatNumber(knownMolarMass, 5)} = ${formatNumber(knownMoles, 6)} моль`);
    } else {
      solutionSteps.push(`<strong>1.</strong> n(${knownFormula}) = ${formatNumber(knownMoles, 6)} моль`);
    }

    solutionSteps.push(`<strong>2.</strong> За коефіцієнтами: ${known.coefficient} моль ${knownFormula} ↔ ${target.coefficient} моль ${targetFormula}`);
    solutionSteps.push(`<strong>3.</strong> n(${targetFormula}) = ${formatNumber(knownMoles, 6)} × ${target.coefficient} / ${known.coefficient} = ${formatNumber(targetMoles, 6)} моль`);

    if (targetUnit.value === 'g') {
      solutionSteps.push(`<strong>4.</strong> M(${targetFormula}) = ${formatNumber(targetMolarMass, 5)} г/моль; m = nM = ${formatNumber(targetMoles, 6)} × ${formatNumber(targetMolarMass, 5)} = ${formatNumber(output.value, 6)} г`);
    } else if (targetUnit.value === 'mmol') {
      solutionSteps.push(`<strong>4.</strong> ${formatNumber(targetMoles, 6)} моль = ${formatNumber(output.value, 6)} ммоль`);
    }

    steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');

    if (known.data.hasApproximateMass || target.data.hasApproximateMass) {
      note.textContent = 'У розрахунку використано речовину з елементом без стандартної атомної маси, тому масовий результат є наближеним.';
    } else {
      note.textContent = 'Розрахунок базується на стехіометричних коефіцієнтах зрівняного рівняння. Надлишок реагентів і вихід продукту тут не враховуються.';
    }

    resultEmpty.hidden = true;
    resultContent.hidden = false;
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати стехіометричний розрахунок.');
  }
}

parseButton?.addEventListener('click', parseAndPrepare);
equationInput?.addEventListener('input', () => {
  currentEquation = null;
  status.hidden = true;
  fields.hidden = true;
  submit.hidden = true;
  clearError();
});
form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});

function selectByFormula(select, formula) {
  const item = currentEquation?.all.find(entry => entry.formula === formula);
  if (item) select.value = item.id;
}

document.querySelectorAll('[data-reaction-example]').forEach(button => {
  button.addEventListener('click', () => {
    equationInput.value = button.dataset.equation || '';
    if (!parseAndPrepare()) return;
    selectByFormula(knownSelect, button.dataset.known || '');
    selectByFormula(targetSelect, button.dataset.target || '');
    knownValue.value = button.dataset.value || '';
    knownUnit.value = button.dataset.knownUnit || 'g';
    targetUnit.value = button.dataset.targetUnit || 'g';
    calculate();
  });
});

equationInput.value = '2H2 + O2 -> 2H2O';
parseAndPrepare();
selectByFormula(knownSelect, 'H2');
selectByFormula(targetSelect, 'H2O');
knownValue.value = '4';
knownUnit.value = 'g';
targetUnit.value = 'g';
calculate();
