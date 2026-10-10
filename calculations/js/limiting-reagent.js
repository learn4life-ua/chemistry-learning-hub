import { getFormulaData, formatNumber, formatFormula } from './formula-core.js';

function ensureLimitingUI() {
  if (!document.querySelector('link[href*="limiting-reagent.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/limiting-reagent.css?v=1';
    document.head.append(link);
  }

  const nav = document.querySelector('.calc-tool-nav');
  if (nav && !nav.querySelector('a[href="#limiting-reagent"]')) {
    const anchor = document.createElement('a');
    anchor.href = '#limiting-reagent';
    anchor.textContent = 'Лімітуючий реагент';
    nav.append(anchor);
  }

  const lead = document.querySelector('.calc-lead');
  if (lead) {
    lead.textContent = 'Молярна маса, кількість речовини, концентрація, розчини, газові розрахунки та стехіометрія - з перевіркою одиниць і покроковим розв’язанням.';
  }

  const orb = document.querySelector('.formula-orb span');
  if (orb) orb.textContent = 'M · n · c · ω · η · lim';

  const nextTools = document.querySelector('.next-tools-section');
  if (nextTools && !document.querySelector('#limiting-reagent')) {
    const section = document.createElement('section');
    section.className = 'limiting-section';
    section.id = 'limiting-reagent';
    section.innerHTML = `
      <div class="shell tool-section-heading">
        <p class="eyebrow">Інструмент 09</p>
        <h2>Лімітуючий реагент</h2>
        <p>Порівнюйте наявні кількості реагентів зі стехіометричними коефіцієнтами, визначайте реагент, який витрачається першим, і теоретичну кількість вибраного продукту.</p>
      </div>

      <div class="shell calc-layout">
        <article class="calc-card">
          <div class="calc-card-head">
            <div>
              <p class="calc-kicker">Стехіометрія кількох реагентів</p>
              <h2>Що обмежує реакцію?</h2>
            </div>
            <span class="calc-badge">lim</span>
          </div>

          <form id="limitingForm" novalidate>
            <div class="limiting-equation-row">
              <label class="formula-label" for="limitingEquationInput">Зрівняне рівняння реакції</label>
              <input class="limiting-equation-input" id="limitingEquationInput" type="text" autocomplete="off" spellcheck="false" placeholder="Наприклад, N2 + 3H2 -> 2NH3">
              <button class="calc-button" id="limitingParseButton" type="button">Перевірити</button>
            </div>
            <p class="formula-help">Рівняння має бути зрівняним. Для визначення лімітуючого реагенту потрібно щонайменше два реагенти з відомими кількостями.</p>
            <div class="limiting-status" id="limitingStatus" hidden></div>

            <div id="limitingFields" hidden>
              <div class="limiting-reactants" id="limitingReactants"></div>

              <div class="limiting-target-block">
                <div>
                  <label class="formula-label" for="limitingTargetSelect">Продукт, кількість якого знайти</label>
                  <select class="limiting-select" id="limitingTargetSelect"></select>
                </div>
                <div>
                  <label class="formula-label" for="limitingTargetUnit">Одиниця результату</label>
                  <select class="limiting-select" id="limitingTargetUnit">
                    <option value="g">г</option>
                    <option value="mol">моль</option>
                    <option value="mmol">ммоль</option>
                  </select>
                </div>
              </div>
            </div>

            <p class="formula-error" id="limitingError" role="alert" hidden></p>
            <button class="calc-button limiting-submit" id="limitingSubmit" type="submit" hidden>Розрахувати</button>
          </form>

          <div class="example-list" aria-label="Приклади визначення лімітуючого реагенту">
            <span>Спробуйте:</span>
            <button type="button" data-limiting-example data-equation="N2 + 3H2 -> 2NH3" data-values="28;3" data-units="g;g" data-target="NH3" data-target-unit="g">28 г N₂ + 3 г H₂ → NH₃</button>
            <button type="button" data-limiting-example data-equation="4Al + 3O2 -> 2Al2O3" data-values="10,8;12" data-units="g;g" data-target="Al2O3" data-target-unit="g">10,8 г Al + 12 г O₂</button>
            <button type="button" data-limiting-example data-equation="2H2 + O2 -> 2H2O" data-values="2;1" data-units="mol;mol" data-target="H2O" data-target-unit="mol">2 моль H₂ + 1 моль O₂</button>
          </div>

          <div class="limiting-note-box"><strong>Метод:</strong> для кожного реагенту обчислюємо відношення n/ν. Найменше значення визначає максимальний ступінь перебігу реакції і, відповідно, лімітуючий реагент.</div>
        </article>

        <aside class="result-card limiting-result-card" aria-live="polite">
          <div class="result-empty" id="limitingResultEmpty">
            <div class="result-icon">lim</div>
            <h2>Розв'язання з'явиться тут</h2>
            <p>Введіть зрівняне рівняння і кількості всіх реагентів.</p>
          </div>

          <div class="result-content" id="limitingResultContent" hidden>
            <p class="calc-kicker">Результат</p>
            <div class="limiting-result-title" id="limitingResultTitle"></div>
            <div class="amount-final-value">
              <strong id="limitingResultValue">0</strong>
              <span id="limitingResultUnit"></span>
            </div>
            <div class="solution-steps" id="limitingSteps"></div>
            <p class="result-note" id="limitingNote"></p>
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
        <article><strong>aq</strong><h3>Стехіометрія розчинів</h3><p>Розрахунки за рівнянням реакції з молярними концентраціями та об’ємами розчинів.</p></article>
        <article><strong>%</strong><h3>Домішки та чистота</h3><p>Розрахунки з масовою часткою чистої речовини у зразку.</p></article>
        <article><strong>ρ</strong><h3>Густина розчинів</h3><p>Зв’язок між масою, об’ємом, густиною і складом розчину.</p></article>
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
  if (/[⁺⁻^]/.test(text)) throw new Error('Йонні заряди в цьому інструменті не підтримуються. Введіть молекулярне рівняння.');

  const match = text.match(/^(\d+)?\s*(.+)$/);
  const coefficient = match?.[1] ? Number(match[1]) : 1;
  if (!Number.isSafeInteger(coefficient) || coefficient < 1 || coefficient > 9999) {
    throw new Error('Стехіометричний коефіцієнт має бути цілим додатним числом від 1 до 9999.');
  }

  const body = (match?.[2] || '').trim().replace(/\s+/g, '');
  const { formula, state } = stripState(body);
  if (!formula) throw new Error('Після коефіцієнта має бути формула речовини.');
  const data = getFormulaData(formula);
  return { id: `${side}-${index}`, side, coefficient, formula: data.formula, state, data };
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
  if (reactants.length < 2) throw new Error('Для визначення лімітуючого реагенту в рівнянні має бути щонайменше два реагенти.');
  if (!products.length) throw new Error('У рівнянні має бути хоча б один продукт.');

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

  return { reactants, products };
}

function speciesHTML(item) {
  const coefficient = item.coefficient === 1 ? '' : `<span class="limiting-coeff">${item.coefficient}</span>`;
  return `${coefficient}${formatFormula(item.formula)}${item.state}`;
}

function unitToMoles(value, unit, molarMass) {
  if (unit === 'mol') return value;
  if (unit === 'mmol') return value / 1000;
  if (unit === 'g') return value / molarMass;
  throw new Error('Невідома одиниця кількості реагенту.');
}

function molesToUnit(moles, unit, molarMass) {
  if (unit === 'mol') return { value: moles, label: 'моль' };
  if (unit === 'mmol') return { value: moles * 1000, label: 'ммоль' };
  if (unit === 'g') return { value: moles * molarMass, label: 'г' };
  throw new Error('Невідома одиниця результату.');
}

ensureLimitingUI();

const form = document.querySelector('#limitingForm');
const equationInput = document.querySelector('#limitingEquationInput');
const parseButton = document.querySelector('#limitingParseButton');
const status = document.querySelector('#limitingStatus');
const fields = document.querySelector('#limitingFields');
const reactantsWrap = document.querySelector('#limitingReactants');
const targetSelect = document.querySelector('#limitingTargetSelect');
const targetUnit = document.querySelector('#limitingTargetUnit');
const submit = document.querySelector('#limitingSubmit');
const errorBox = document.querySelector('#limitingError');
const resultEmpty = document.querySelector('#limitingResultEmpty');
const resultContent = document.querySelector('#limitingResultContent');
const resultTitle = document.querySelector('#limitingResultTitle');
const resultValue = document.querySelector('#limitingResultValue');
const resultUnit = document.querySelector('#limitingResultUnit');
const steps = document.querySelector('#limitingSteps');
const note = document.querySelector('#limitingNote');

let activeEquation = null;

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

function buildFields(equation) {
  reactantsWrap.innerHTML = equation.reactants.map((item, index) => `
    <div class="limiting-reactant-card" data-reactant-id="${item.id}">
      <div class="limiting-reactant-name">${speciesHTML(item)}</div>
      <label class="formula-label" for="limitingValue${index}">Кількість реагенту</label>
      <div class="limiting-value-row">
        <input class="value-input" id="limitingValue${index}" data-limiting-value type="text" inputmode="decimal" autocomplete="off" placeholder="Наприклад, ${index === 0 ? '28' : '3'}">
        <select class="limiting-unit-select" data-limiting-unit>
          <option value="g">г</option>
          <option value="mol">моль</option>
          <option value="mmol">ммоль</option>
        </select>
      </div>
    </div>
  `).join('');

  targetSelect.innerHTML = equation.products.map(item => `<option value="${item.id}">${item.coefficient === 1 ? '' : `${item.coefficient} `}${item.formula}${item.state}</option>`).join('');
  reactantsWrap.querySelectorAll('input').forEach(input => input.addEventListener('input', clearError));
  fields.hidden = false;
  submit.hidden = false;
}

function parseAndPrepare() {
  clearError();
  try {
    activeEquation = parseEquation(equationInput.value);
    buildFields(activeEquation);
    status.hidden = false;
    status.className = 'limiting-status is-ok';
    status.textContent = `Рівняння зрівняне. Реагентів: ${activeEquation.reactants.length}. Введіть кількість кожного.`;
    resultContent.hidden = true;
    resultEmpty.hidden = false;
    return true;
  } catch (error) {
    activeEquation = null;
    fields.hidden = true;
    submit.hidden = true;
    status.hidden = true;
    showError(error instanceof Error ? error.message : 'Не вдалося прочитати рівняння.');
    return false;
  }
}

function calculate() {
  clearError();
  try {
    if (!activeEquation && !parseAndPrepare()) return;

    const cards = [...reactantsWrap.querySelectorAll('.limiting-reactant-card')];
    if (cards.length !== activeEquation.reactants.length) throw new Error('Оновіть рівняння та натисніть «Перевірити» ще раз.');

    const entries = activeEquation.reactants.map((item, index) => {
      const card = cards[index];
      const input = card.querySelector('[data-limiting-value]');
      const unit = card.querySelector('[data-limiting-unit]').value;
      const raw = parsePositiveNumber(input.value, `Кількість ${item.formula}`);
      const moles = unitToMoles(raw, unit, item.data.totalMass);
      return { item, raw, unit, moles, ratio: moles / item.coefficient };
    });

    const minRatio = Math.min(...entries.map(entry => entry.ratio));
    const tolerance = Math.max(1e-10, Math.abs(minRatio) * 1e-6);
    const limiting = entries.filter(entry => Math.abs(entry.ratio - minRatio) <= tolerance);

    const target = activeEquation.products.find(item => item.id === targetSelect.value) || activeEquation.products[0];
    const targetMoles = minRatio * target.coefficient;
    const converted = molesToUnit(targetMoles, targetUnit.value, target.data.totalMass);

    resultTitle.innerHTML = limiting.length === 1
      ? `Лімітуючий реагент: <strong>${formatFormula(limiting[0].item.formula)}</strong>`
      : '<strong>Стехіометрична суміш</strong>: кілька реагентів вичерпуються одночасно';
    resultValue.textContent = formatNumber(converted.value, 6);
    resultUnit.textContent = `${converted.label} ${target.formula}`;

    const ratioSteps = entries.map(entry => {
      const massPart = entry.unit === 'g'
        ? `n(${formatFormula(entry.item.formula)}) = ${formatNumber(entry.raw, 6)} г / ${formatNumber(entry.item.data.totalMass, 5)} г/моль = ${formatNumber(entry.moles, 6)} моль; `
        : entry.unit === 'mmol'
          ? `n(${formatFormula(entry.item.formula)}) = ${formatNumber(entry.moles, 6)} моль; `
          : '';
      return `${massPart}n/ν = ${formatNumber(entry.moles, 6)} / ${entry.item.coefficient} = ${formatNumber(entry.ratio, 6)}`;
    });

    const limitingText = limiting.length === 1
      ? `${formatFormula(limiting[0].item.formula)} має найменше n/ν = ${formatNumber(minRatio, 6)}, тому є лімітуючим реагентом.`
      : `Найменше n/ν = ${formatNumber(minRatio, 6)} однакове для ${limiting.map(entry => formatFormula(entry.item.formula)).join(', ')}.`;

    const excess = entries.filter(entry => !limiting.includes(entry)).map(entry => {
      const remainingMoles = Math.max(0, entry.moles - minRatio * entry.item.coefficient);
      return `${formatFormula(entry.item.formula)}: залишок ≈ ${formatNumber(remainingMoles, 6)} моль`;
    });

    const solutionSteps = [
      ...ratioSteps.map((text, index) => `<strong>${index + 1}.</strong> ${text}`),
      `<strong>${ratioSteps.length + 1}.</strong> ${limitingText}`,
      `<strong>${ratioSteps.length + 2}.</strong> n(${formatFormula(target.formula)}) = ${formatNumber(minRatio, 6)} × ${target.coefficient} = ${formatNumber(targetMoles, 6)} моль`,
      `<strong>${ratioSteps.length + 3}.</strong> Теоретично можна одержати ${formatNumber(converted.value, 6)} ${converted.label} ${formatFormula(target.formula)}.`
    ];

    steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');

    if (excess.length) {
      note.innerHTML = `Надлишкові реагенти після повного витрачання лімітуючого: ${excess.join('; ')}.`;
    } else {
      note.textContent = 'Реагенти задані у стехіометричному співвідношенні, тому за моделлю всі вони можуть витратитися одночасно.';
    }

    if ([...entries, { item: target }].some(entry => entry.item.data.hasApproximateMass)) {
      note.textContent += ' Для елемента без стандартної атомної маси використано наведене в Періодичній системі масове число, тому масові результати є наближеними.';
    }

    resultEmpty.hidden = true;
    resultContent.hidden = false;
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося визначити лімітуючий реагент.');
  }
}

parseButton?.addEventListener('click', parseAndPrepare);
form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});
equationInput?.addEventListener('input', () => {
  activeEquation = null;
  fields.hidden = true;
  submit.hidden = true;
  status.hidden = true;
  clearError();
});

document.querySelectorAll('[data-limiting-example]').forEach(button => {
  button.addEventListener('click', () => {
    equationInput.value = button.dataset.equation || '';
    if (!parseAndPrepare()) return;
    const values = (button.dataset.values || '').split(';');
    const units = (button.dataset.units || '').split(';');
    const cards = [...reactantsWrap.querySelectorAll('.limiting-reactant-card')];
    cards.forEach((card, index) => {
      const input = card.querySelector('[data-limiting-value]');
      const select = card.querySelector('[data-limiting-unit]');
      input.value = values[index] || '';
      if ([...select.options].some(option => option.value === units[index])) select.value = units[index];
    });
    const target = activeEquation.products.find(item => item.formula === button.dataset.target);
    if (target) targetSelect.value = target.id;
    targetUnit.value = button.dataset.targetUnit || 'g';
    calculate();
  });
});

equationInput.value = 'N2 + 3H2 -> 2NH3';
parseAndPrepare();
const initialCards = [...reactantsWrap.querySelectorAll('.limiting-reactant-card')];
if (initialCards[0]) initialCards[0].querySelector('[data-limiting-value]').value = '28';
if (initialCards[1]) initialCards[1].querySelector('[data-limiting-value]').value = '3';
targetUnit.value = 'g';
calculate();
