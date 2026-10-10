import { getFormulaData, formatNumber, formatFormula } from './formula-core.js';

function ensureSolutionStoichUI() {
  if (!document.querySelector('link[href*="solution-stoichiometry.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/solution-stoichiometry.css?v=1';
    document.head.append(link);
  }

  const nav = document.querySelector('.calc-tool-nav');
  if (nav && !nav.querySelector('a[href="#solution-stoichiometry"]')) {
    const anchor = document.createElement('a');
    anchor.href = '#solution-stoichiometry';
    anchor.textContent = 'Стехіометрія розчинів';
    nav.append(anchor);
  }

  const lead = document.querySelector('.calc-lead');
  if (lead) {
    lead.textContent = 'Молярна маса, кількість речовини, концентрація, розчини, газові розрахунки та стехіометрія - з перевіркою одиниць і покроковим розв’язанням.';
  }

  const orb = document.querySelector('.formula-orb span');
  if (orb) orb.textContent = 'M · n · c · η · lim · aq';

  const nextTools = document.querySelector('.next-tools-section');
  if (nextTools && !document.querySelector('#solution-stoichiometry')) {
    const section = document.createElement('section');
    section.className = 'solution-stoich-section';
    section.id = 'solution-stoichiometry';
    section.innerHTML = `
      <div class="shell tool-section-heading">
        <p class="eyebrow">Інструмент 10</p>
        <h2>Стехіометрія розчинів</h2>
        <p>Переходьте від молярної концентрації та об’єму розчину до кількості речовини, а далі використовуйте коефіцієнти зрівняного рівняння реакції.</p>
      </div>

      <div class="shell calc-layout">
        <article class="calc-card">
          <div class="calc-card-head">
            <div>
              <p class="calc-kicker">Реакції у розчинах</p>
              <h2>c · V → n → стехіометрія</h2>
            </div>
            <span class="calc-badge">aq</span>
          </div>

          <div class="solution-stoich-mode-switcher" role="group" aria-label="Тип розрахунку у розчинах">
            <button class="is-active" type="button" data-solution-mode="product" aria-pressed="true">Продукт за c і V</button>
            <button type="button" data-solution-mode="volume" aria-pressed="false">Об’єм другого розчину</button>
          </div>

          <form id="solutionStoichForm" novalidate>
            <div class="solution-stoich-equation-row">
              <label class="formula-label" for="solutionEquationInput">Зрівняне рівняння реакції</label>
              <input class="solution-stoich-equation-input" id="solutionEquationInput" type="text" autocomplete="off" spellcheck="false" placeholder="Наприклад, HCl + NaOH -> NaCl + H2O">
              <button class="calc-button" id="solutionParseButton" type="button">Перевірити</button>
            </div>
            <p class="formula-help">Підтримуються молекулярні рівняння без йонних зарядів. Коефіцієнти мають бути цілими додатними числами.</p>
            <div class="solution-stoich-status" id="solutionStatus" hidden></div>

            <div class="solution-stoich-fields" id="solutionFields" hidden>
              <div class="solution-stoich-field-block">
                <h3>Відомий розчин</h3>
                <label class="formula-label" for="solutionKnownSelect">Реагент</label>
                <select class="solution-stoich-select" id="solutionKnownSelect"></select>

                <div class="solution-stoich-value-row">
                  <input class="value-input" id="solutionKnownConcentration" type="text" inputmode="decimal" autocomplete="off" placeholder="c, наприклад 0,1">
                  <select class="solution-stoich-unit" id="solutionKnownConcentrationUnit">
                    <option value="mol-L">моль/л</option>
                    <option value="mmol-L">ммоль/л</option>
                  </select>
                </div>

                <div class="solution-stoich-value-row">
                  <input class="value-input" id="solutionKnownVolume" type="text" inputmode="decimal" autocomplete="off" placeholder="V, наприклад 25">
                  <select class="solution-stoich-unit" id="solutionKnownVolumeUnit">
                    <option value="mL">мл</option>
                    <option value="L">л</option>
                  </select>
                </div>
              </div>

              <div class="solution-stoich-field-block">
                <h3 id="solutionTargetHeading">Знайти продукт</h3>

                <div id="solutionProductFields">
                  <label class="formula-label" for="solutionProductSelect">Продукт</label>
                  <select class="solution-stoich-select" id="solutionProductSelect"></select>
                  <div class="solution-stoich-target-row">
                    <label class="formula-label" for="solutionProductUnit">Одиниця результату</label>
                    <select class="solution-stoich-unit" id="solutionProductUnit">
                      <option value="g">г</option>
                      <option value="mol">моль</option>
                      <option value="mmol">ммоль</option>
                    </select>
                  </div>
                </div>

                <div class="solution-stoich-secondary" id="solutionSecondFields" hidden>
                  <label class="formula-label" for="solutionSecondSelect">Другий реагент</label>
                  <select class="solution-stoich-select" id="solutionSecondSelect"></select>
                  <div class="solution-stoich-value-row">
                    <input class="value-input" id="solutionSecondConcentration" type="text" inputmode="decimal" autocomplete="off" placeholder="c₂, наприклад 0,2">
                    <select class="solution-stoich-unit" id="solutionSecondConcentrationUnit">
                      <option value="mol-L">моль/л</option>
                      <option value="mmol-L">ммоль/л</option>
                    </select>
                  </div>
                  <div class="solution-stoich-target-row">
                    <label class="formula-label" for="solutionSecondVolumeUnit">Одиниця шуканого V₂</label>
                    <select class="solution-stoich-unit" id="solutionSecondVolumeUnit">
                      <option value="mL">мл</option>
                      <option value="L">л</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <p class="formula-help" id="solutionHelper"></p>
            <div class="solution-stoich-note-box"><strong>Умова застосування:</strong> у режимі розрахунку продукту вважаємо, що вибраний реагент прореагував повністю, а інші реагенти взято в достатній кількості. Якщо кількості кількох реагентів задані одночасно, спочатку використовуйте інструмент «Лімітуючий реагент».</div>
            <p class="formula-error" id="solutionError" role="alert" hidden></p>
            <button class="calc-button solution-stoich-submit" id="solutionSubmit" type="submit" hidden>Розрахувати</button>
          </form>

          <div class="example-list" aria-label="Приклади стехіометрії розчинів">
            <span>Спробуйте:</span>
            <button type="button" data-solution-example data-mode="product" data-equation="AgNO3 + NaCl -> AgCl + NaNO3" data-known="AgNO3" data-c1="0,1" data-c1-unit="mol-L" data-v1="100" data-v1-unit="mL" data-product="AgCl" data-product-unit="g">0,1 моль/л AgNO₃, 100 мл → AgCl</button>
            <button type="button" data-solution-example data-mode="volume" data-equation="HCl + NaOH -> NaCl + H2O" data-known="HCl" data-c1="0,1" data-c1-unit="mol-L" data-v1="25" data-v1-unit="mL" data-second="NaOH" data-c2="0,2" data-c2-unit="mol-L" data-v2-unit="mL">25 мл HCl 0,1 М → V(NaOH 0,2 М)</button>
            <button type="button" data-solution-example data-mode="volume" data-equation="2NaOH + H2SO4 -> Na2SO4 + 2H2O" data-known="NaOH" data-c1="0,2" data-c1-unit="mol-L" data-v1="50" data-v1-unit="mL" data-second="H2SO4" data-c2="0,1" data-c2-unit="mol-L" data-v2-unit="mL">50 мл NaOH 0,2 М → V(H₂SO₄ 0,1 М)</button>
          </div>
        </article>

        <aside class="result-card solution-stoich-result-card" aria-live="polite">
          <div class="result-empty" id="solutionResultEmpty">
            <div class="result-icon">aq</div>
            <h2>Розв'язання з'явиться тут</h2>
            <p>Введіть зрівняне рівняння, концентрацію та об’єм відомого розчину.</p>
          </div>

          <div class="result-content" id="solutionResultContent" hidden>
            <p class="calc-kicker">Відповідь</p>
            <div class="solution-stoich-equation-view" id="solutionEquationView"></div>
            <div class="solution-stoich-result-title" id="solutionResultTitle"></div>
            <div class="amount-final-value">
              <strong id="solutionResultValue">0</strong>
              <span id="solutionResultUnit"></span>
            </div>
            <div class="solution-steps" id="solutionSteps"></div>
            <p class="result-note" id="solutionNote"></p>
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
        <article><strong>%</strong><h3>Домішки та чистота</h3><p>Розрахунки з масовою часткою чистої речовини у зразку.</p></article>
        <article><strong>ρ</strong><h3>Густина розчинів</h3><p>Зв’язок між масою, об’ємом, густиною і складом розчину.</p></article>
        <article><strong>β</strong><h3>Масова концентрація</h3><p>Маса розчиненої речовини в одиниці об’єму розчину.</p></article>
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

  return { reactants, products };
}

function speciesHTML(item) {
  const coefficient = item.coefficient === 1 ? '' : `<span class="solution-stoich-coeff">${item.coefficient}</span>`;
  return `${coefficient}${formatFormula(item.formula)}${item.state}`;
}

function equationHTML(equation) {
  const side = items => items.map(speciesHTML).join(' <span class="solution-stoich-sep">+</span> ');
  return `${side(equation.reactants)} <span class="solution-stoich-arrow">→</span> ${side(equation.products)}`;
}

function toMolPerLitre(value, unit) {
  return unit === 'mmol-L' ? value / 1000 : value;
}

function toLitres(value, unit) {
  return unit === 'mL' ? value / 1000 : value;
}

function fromLitres(value, unit) {
  return unit === 'mL' ? value * 1000 : value;
}

function molesToUnit(moles, unit, molarMass) {
  if (unit === 'mol') return { value: moles, label: 'моль' };
  if (unit === 'mmol') return { value: moles * 1000, label: 'ммоль' };
  if (unit === 'g') return { value: moles * molarMass, label: 'г' };
  throw new Error('Невідома одиниця результату.');
}

ensureSolutionStoichUI();

const form = document.querySelector('#solutionStoichForm');
const modeButtons = [...document.querySelectorAll('[data-solution-mode]')];
const equationInput = document.querySelector('#solutionEquationInput');
const parseButton = document.querySelector('#solutionParseButton');
const status = document.querySelector('#solutionStatus');
const fields = document.querySelector('#solutionFields');
const knownSelect = document.querySelector('#solutionKnownSelect');
const knownConcentration = document.querySelector('#solutionKnownConcentration');
const knownConcentrationUnit = document.querySelector('#solutionKnownConcentrationUnit');
const knownVolume = document.querySelector('#solutionKnownVolume');
const knownVolumeUnit = document.querySelector('#solutionKnownVolumeUnit');
const targetHeading = document.querySelector('#solutionTargetHeading');
const productFields = document.querySelector('#solutionProductFields');
const productSelect = document.querySelector('#solutionProductSelect');
const productUnit = document.querySelector('#solutionProductUnit');
const secondFields = document.querySelector('#solutionSecondFields');
const secondSelect = document.querySelector('#solutionSecondSelect');
const secondConcentration = document.querySelector('#solutionSecondConcentration');
const secondConcentrationUnit = document.querySelector('#solutionSecondConcentrationUnit');
const secondVolumeUnit = document.querySelector('#solutionSecondVolumeUnit');
const helper = document.querySelector('#solutionHelper');
const submit = document.querySelector('#solutionSubmit');
const errorBox = document.querySelector('#solutionError');
const resultEmpty = document.querySelector('#solutionResultEmpty');
const resultContent = document.querySelector('#solutionResultContent');
const equationView = document.querySelector('#solutionEquationView');
const resultTitle = document.querySelector('#solutionResultTitle');
const resultValue = document.querySelector('#solutionResultValue');
const resultUnit = document.querySelector('#solutionResultUnit');
const steps = document.querySelector('#solutionSteps');
const note = document.querySelector('#solutionNote');

let activeMode = 'product';
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

function optionLabel(item) {
  const coeff = item.coefficient === 1 ? '' : `${item.coefficient} `;
  return `${coeff}${item.formula}${item.state}`;
}

function updateSecondReactants() {
  if (!activeEquation) return;
  const knownId = knownSelect.value;
  const available = activeEquation.reactants.filter(item => item.id !== knownId);
  secondSelect.innerHTML = available.map(item => `<option value="${item.id}">${optionLabel(item)}</option>`).join('');
}

function buildSelectors(equation) {
  knownSelect.innerHTML = equation.reactants.map(item => `<option value="${item.id}">${optionLabel(item)}</option>`).join('');
  productSelect.innerHTML = equation.products.map(item => `<option value="${item.id}">${optionLabel(item)}</option>`).join('');
  updateSecondReactants();
}

function setMode(mode) {
  if (!['product', 'volume'].includes(mode)) return;
  activeMode = mode;
  modeButtons.forEach(button => {
    const active = button.dataset.solutionMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const productMode = mode === 'product';
  productFields.hidden = !productMode;
  secondFields.hidden = productMode;
  targetHeading.textContent = productMode ? 'Знайти продукт' : 'Знайти об’єм другого розчину';
  helper.textContent = productMode
    ? 'Спочатку n(реагенту) = cV, потім кількість продукту визначається за співвідношенням стехіометричних коефіцієнтів.'
    : 'Спочатку n₁ = c₁V₁. За коефіцієнтами рівняння знаходимо потрібну n₂, після чого V₂ = n₂ / c₂.';

  if (activeEquation) {
    if (!productMode && activeEquation.reactants.length < 2) {
      showError('Для розрахунку об’єму другого розчину в рівнянні має бути щонайменше два реагенти.');
    } else {
      clearError();
      updateSecondReactants();
    }
  }
}

function parseAndBuild() {
  clearError();
  try {
    activeEquation = parseEquation(equationInput.value);
    buildSelectors(activeEquation);
    status.innerHTML = `<strong>Рівняння зрівняне.</strong> Реагентів: ${activeEquation.reactants.length}; продуктів: ${activeEquation.products.length}.`;
    status.hidden = false;
    fields.hidden = false;
    submit.hidden = false;
    setMode(activeMode);
    return true;
  } catch (error) {
    activeEquation = null;
    status.hidden = true;
    fields.hidden = true;
    submit.hidden = true;
    showError(error instanceof Error ? error.message : 'Не вдалося перевірити рівняння.');
    return false;
  }
}

function calculateProduct(known, product, c1, v1) {
  const knownMoles = c1 * v1;
  const productMoles = knownMoles * product.coefficient / known.coefficient;
  const output = molesToUnit(productMoles, productUnit.value, product.data.totalMass);

  resultTitle.innerHTML = `Теоретична кількість ${formatFormula(product.formula)}`;
  resultValue.textContent = formatNumber(output.value, 6);
  resultUnit.textContent = output.label;
  steps.innerHTML = [
    `<strong>1.</strong> n(${formatFormula(known.formula)}) = cV = ${formatNumber(c1, 6)} моль/л × ${formatNumber(v1, 6)} л = ${formatNumber(knownMoles, 6)} моль`,
    `<strong>2.</strong> За рівнянням: ${known.coefficient} моль ${formatFormula(known.formula)} → ${product.coefficient} моль ${formatFormula(product.formula)}`,
    `<strong>3.</strong> n(${formatFormula(product.formula)}) = ${formatNumber(knownMoles, 6)} × ${product.coefficient} / ${known.coefficient} = ${formatNumber(productMoles, 6)} моль`,
    ...(productUnit.value === 'g'
      ? [`<strong>4.</strong> m = nM = ${formatNumber(productMoles, 6)} × ${formatNumber(product.data.totalMass, 5)} = ${formatNumber(output.value, 6)} г`]
      : [])
  ].map(step => `<div class="solution-step">${step}</div>`).join('');

  note.textContent = product.data.hasApproximateMass && productUnit.value === 'g'
    ? 'Для продукту використано наближене значення атомної маси одного з елементів, тому маса є наближеною.'
    : 'Результат є теоретичним і передбачає повне перетворення вибраного реагенту за наведеним зрівняним рівнянням.';
}

function calculateSecondVolume(known, second, c1, v1) {
  if (known.id === second.id) throw new Error('Оберіть інший реагент для другого розчину.');
  const c2 = toMolPerLitre(parsePositiveNumber(secondConcentration.value, 'Концентрація другого розчину'), secondConcentrationUnit.value);
  const knownMoles = c1 * v1;
  const requiredMoles = knownMoles * second.coefficient / known.coefficient;
  const requiredLitres = requiredMoles / c2;
  const outputValue = fromLitres(requiredLitres, secondVolumeUnit.value);
  const outputLabel = secondVolumeUnit.value === 'mL' ? 'мл' : 'л';

  resultTitle.innerHTML = `Потрібний об’єм розчину ${formatFormula(second.formula)}`;
  resultValue.textContent = formatNumber(outputValue, 6);
  resultUnit.textContent = outputLabel;
  steps.innerHTML = [
    `<strong>1.</strong> n(${formatFormula(known.formula)}) = c₁V₁ = ${formatNumber(c1, 6)} моль/л × ${formatNumber(v1, 6)} л = ${formatNumber(knownMoles, 6)} моль`,
    `<strong>2.</strong> За рівнянням: ${known.coefficient} моль ${formatFormula(known.formula)} ↔ ${second.coefficient} моль ${formatFormula(second.formula)}`,
    `<strong>3.</strong> n(${formatFormula(second.formula)}) = ${formatNumber(knownMoles, 6)} × ${second.coefficient} / ${known.coefficient} = ${formatNumber(requiredMoles, 6)} моль`,
    `<strong>4.</strong> V₂ = n₂ / c₂ = ${formatNumber(requiredMoles, 6)} моль / ${formatNumber(c2, 6)} моль/л = ${formatNumber(requiredLitres, 6)} л`
  ].map(step => `<div class="solution-step">${step}</div>`).join('');
  note.textContent = 'Це стехіометрично потрібний об’єм другого розчину для повної взаємодії з заданою кількістю першого реагенту.';
}

function calculate() {
  clearError();
  try {
    if (!activeEquation && !parseAndBuild()) return;

    const known = activeEquation.reactants.find(item => item.id === knownSelect.value);
    if (!known) throw new Error('Оберіть відомий реагент.');

    const c1 = toMolPerLitre(parsePositiveNumber(knownConcentration.value, 'Молярна концентрація відомого розчину'), knownConcentrationUnit.value);
    const v1 = toLitres(parsePositiveNumber(knownVolume.value, 'Об’єм відомого розчину'), knownVolumeUnit.value);

    equationView.innerHTML = equationHTML(activeEquation);

    if (activeMode === 'product') {
      const product = activeEquation.products.find(item => item.id === productSelect.value);
      if (!product) throw new Error('Оберіть продукт реакції.');
      calculateProduct(known, product, c1, v1);
    } else {
      if (activeEquation.reactants.length < 2) throw new Error('Для цього режиму потрібно щонайменше два реагенти.');
      const second = activeEquation.reactants.find(item => item.id === secondSelect.value);
      if (!second) throw new Error('Оберіть другий реагент.');
      calculateSecondVolume(known, second, c1, v1);
    }

    resultEmpty.hidden = true;
    resultContent.hidden = false;
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати розрахунок для розчинів.');
  }
}

modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.solutionMode)));
parseButton?.addEventListener('click', parseAndBuild);
form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});

knownSelect?.addEventListener('change', () => {
  updateSecondReactants();
  clearError();
});
[equationInput, knownConcentration, knownVolume, secondConcentration].forEach(input => input?.addEventListener('input', clearError));

document.querySelectorAll('[data-solution-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode || 'product');
    equationInput.value = button.dataset.equation || '';
    if (!parseAndBuild()) return;

    const known = activeEquation.reactants.find(item => item.formula === button.dataset.known);
    if (known) knownSelect.value = known.id;
    updateSecondReactants();

    knownConcentration.value = button.dataset.c1 || '';
    knownVolume.value = button.dataset.v1 || '';
    knownConcentrationUnit.value = button.dataset.c1Unit || 'mol-L';
    knownVolumeUnit.value = button.dataset.v1Unit || 'mL';

    if (activeMode === 'product') {
      const product = activeEquation.products.find(item => item.formula === button.dataset.product);
      if (product) productSelect.value = product.id;
      productUnit.value = button.dataset.productUnit || 'g';
    } else {
      const second = activeEquation.reactants.find(item => item.formula === button.dataset.second);
      if (second && [...secondSelect.options].some(option => option.value === second.id)) secondSelect.value = second.id;
      secondConcentration.value = button.dataset.c2 || '';
      secondConcentrationUnit.value = button.dataset.c2Unit || 'mol-L';
      secondVolumeUnit.value = button.dataset.v2Unit || 'mL';
    }
    calculate();
  });
});

setMode(activeMode);
equationInput.value = 'AgNO3 + NaCl -> AgCl + NaNO3';
parseAndBuild();
knownConcentration.value = '0,1';
knownVolume.value = '100';
knownConcentrationUnit.value = 'mol-L';
knownVolumeUnit.value = 'mL';
const initialKnown = activeEquation?.reactants.find(item => item.formula === 'AgNO3');
const initialProduct = activeEquation?.products.find(item => item.formula === 'AgCl');
if (initialKnown) knownSelect.value = initialKnown.id;
if (initialProduct) productSelect.value = initialProduct.id;
productUnit.value = 'g';
calculate();
