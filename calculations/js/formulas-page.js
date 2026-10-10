import './empirical-formula.js?v=1';
import { setupCalculationTabs } from './category-tabs.js?v=1';
import { cleanCategoryCopy } from './category-copy.js?v=1';

const fraction = (top, bottom) => `<span class="math-frac"><span>${top}</span><span>${bottom}</span></span>`;

function applyFormulaNotation() {
  const note = document.querySelector('.empirical-note-box');
  if (note) {
    note.innerHTML = `Умовно беремо 100 г речовини, для кожного елемента обчислюємо n = ${fraction('m', 'A<sub>r</sub>')}, ділимо всі значення на найменше та, за потреби, множимо співвідношення на невелике ціле число.`;
  }

  const stepItems = [...document.querySelectorAll('#empiricalSteps .solution-step')];
  const secondStep = stepItems[1];
  if (secondStep) {
    secondStep.innerHTML = secondStep.innerHTML
      .replace('n = m / Aᵣ', `n = ${fraction('m', 'A<sub>r</sub>')}`)
      .replace(/([A-Z][a-z]?): ([\d\s,.]+) \/ ([\[\]\d\s,.]+) =/g, (_, symbol, top, bottom) => `${symbol}: ${fraction(top.trim(), bottom.trim())} =`);
  }
}

cleanCategoryCopy('Формула речовини');
setupCalculationTabs();
applyFormulaNotation();

document.addEventListener('click', event => {
  if (event.target.closest('[data-empirical-example], #empiricalAddRow, .empirical-remove-button')) {
    queueMicrotask(applyFormulaNotation);
  }
});

document.querySelector('#empiricalForm')?.addEventListener('submit', () => queueMicrotask(applyFormulaNotation));
