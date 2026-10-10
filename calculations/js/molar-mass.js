import './dilution.js?v=1';
import './reaction-stoichiometry.js?v=1';
import './product-yield.js?v=1';
import { getFormulaData, formatNumber, formatFormula } from './formula-core.js';

const form = document.querySelector('#molarForm');
const input = document.querySelector('#formulaInput');
const errorBox = document.querySelector('#formulaError');
const resultEmpty = document.querySelector('#resultEmpty');
const resultContent = document.querySelector('#resultContent');
const resultFormula = document.querySelector('#resultFormula');
const molarMass = document.querySelector('#molarMass');
const resultNote = document.querySelector('#resultNote');
const breakdownSection = document.querySelector('#breakdownSection');
const breakdownBody = document.querySelector('#breakdownBody');

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  input.removeAttribute('aria-invalid');
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  input.setAttribute('aria-invalid', 'true');
  resultContent.hidden = true;
  resultEmpty.hidden = false;
  breakdownSection.hidden = true;
}

function renderResult(data) {
  resultFormula.innerHTML = formatFormula(data.formula);
  molarMass.textContent = formatNumber(data.totalMass, 3);
  resultNote.textContent = data.hasApproximateMass
    ? 'Для елементів без стандартної відносної атомної маси використано масове число ізотопу, наведене в Періодичній системі хабу.'
    : 'Розрахунок виконано за відносними атомними масами з Періодичної системи Chemistry Learning Hub.';

  breakdownBody.innerHTML = data.rows.map(({ element, count, mass, subtotal }) => `
    <tr>
      <td><span class="element-pill">${element.symbol}</span> ${element.name}</td>
      <td>${mass.raw}</td>
      <td>${count}</td>
      <td>${formatNumber(subtotal, 3)}</td>
    </tr>
  `).join('');

  resultEmpty.hidden = true;
  resultContent.hidden = false;
  breakdownSection.hidden = false;
}

function calculate(value = input.value) {
  clearError();

  try {
    const data = getFormulaData(value);
    input.value = data.formula;
    renderResult(data);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося обчислити молярну масу.');
  }
}

form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});

input?.addEventListener('input', clearError);

document.querySelectorAll('[data-formula]').forEach(button => {
  button.addEventListener('click', () => {
    input.value = button.dataset.formula || '';
    calculate(input.value);
    input.focus();
  });
});

input.value = 'Ca(OH)2';
calculate(input.value);
