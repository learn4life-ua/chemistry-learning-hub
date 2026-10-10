import './reaction-stoichiometry.js?v=1';
import './product-yield.js?v=1';
import './limiting-reagent.js?v=1';
import './solution-stoichiometry.js?v=1';
import './purity.js?v=1';
import { setupCalculationTabs } from './category-tabs.js?v=1';

const fraction = (top, bottom) => `<span class="math-frac"><span>${top}</span><span>${bottom}</span></span>`;

function activeMode(selector, attribute) {
  return document.querySelector(`${selector}.is-active`)?.getAttribute(attribute) || '';
}

function normalizeRenderedSteps() {
  const containers = ['#reactionSteps', '#yieldSteps', '#limitingSteps', '#solutionSteps', '#puritySteps'];
  const replacements = [
    ['m / M', fraction('m', 'M')],
    ['η = m(практична) / m(теоретична) × 100%', `η = ${fraction('m(практична)', 'm(теоретична)')} · 100%`],
    ['m(практична) = η · m(теоретична) / 100%', `m(практична) = ${fraction('η · m(теоретична)', '100%')}`],
    ['m(теоретична) = m(практична) · 100% / η', `m(теоретична) = ${fraction('m(практична) · 100%', 'η')}`],
    ['ω(чистої речовини) = m(чистої речовини) / m(зразка) × 100%', `ω(чистої речовини) = ${fraction('m(чистої речовини)', 'm(зразка)')} · 100%`],
    ['m(чистої речовини) = m(зразка) × ω / 100%', `m(чистої речовини) = ${fraction('m(зразка) · ω', '100%')}`],
    ['m(зразка) = m(чистої речовини) × 100% / ω', `m(зразка) = ${fraction('m(чистої речовини) · 100%', 'ω')}`],
    ['n/ν', fraction('n', 'ν')],
    ['V₂ = n₂ / c₂', `V₂ = ${fraction('n₂', 'c₂')}`]
  ];

  containers.forEach(selector => {
    const node = document.querySelector(selector);
    if (!node) return;
    let html = node.innerHTML;
    replacements.forEach(([from, to]) => { html = html.replaceAll(from, to); });
    node.innerHTML = html;
  });
}

function applyMathNotation() {
  const limitingNote = document.querySelector('.limiting-note-box');
  if (limitingNote) limitingNote.innerHTML = `<strong>Метод:</strong> для кожного реагенту порівнюємо ${fraction('n', 'ν')}. Найменше значення відповідає лімітуючому реагенту.`;

  const yieldHelper = document.querySelector('#yieldHelper');
  const yieldMode = activeMode('[data-yield-mode]', 'data-yield-mode');
  if (yieldHelper) {
    if (yieldMode === 'eta') yieldHelper.innerHTML = `η = ${fraction('m(практична)', 'm(теоретична)')} · 100%.`;
    if (yieldMode === 'practical') yieldHelper.innerHTML = `m(практична) = ${fraction('η · m(теоретична)', '100%')}.`;
    if (yieldMode === 'theoretical') yieldHelper.innerHTML = `m(теоретична) = ${fraction('m(практична) · 100%', 'η')}.`;
  }

  const purityHelper = document.querySelector('#purityHelper');
  const purityMode = activeMode('[data-purity-mode]', 'data-purity-mode');
  if (purityHelper) {
    if (purityMode === 'purity') purityHelper.innerHTML = `ω(чистої речовини) = ${fraction('m(чистої речовини)', 'm(зразка)')} · 100%.`;
    if (purityMode === 'pure-mass') purityHelper.innerHTML = `m(чистої речовини) = ${fraction('m(зразка) · ω', '100%')}.`;
    if (purityMode === 'sample-mass') purityHelper.innerHTML = `m(зразка) = ${fraction('m(чистої речовини) · 100%', 'ω')}.`;
  }

  const solutionHelper = document.querySelector('#solutionHelper');
  const solutionMode = activeMode('[data-solution-mode]', 'data-solution-mode');
  if (solutionHelper) {
    if (solutionMode === 'product') solutionHelper.innerHTML = 'Спочатку n = cV, далі використовуйте коефіцієнти зрівняного рівняння.';
    if (solutionMode === 'volume') solutionHelper.innerHTML = `Після стехіометричного переходу об'єм другого розчину: V₂ = ${fraction('n₂', 'c₂')}.`;
  }

  normalizeRenderedSteps();
}

setupCalculationTabs();
applyMathNotation();

document.addEventListener('click', event => {
  if (event.target.closest('[data-yield-mode], [data-purity-mode], [data-solution-mode], [data-reaction-example], [data-yield-example], [data-limiting-example], [data-solution-example], [data-purity-example], #reactionParseButton, #limitingParseButton, #solutionParseButton')) {
    queueMicrotask(applyMathNotation);
  }
});

document.querySelectorAll('#reactionForm, #yieldForm, #limitingForm, #solutionStoichForm, #purityForm').forEach(form => {
  form.addEventListener('submit', () => queueMicrotask(applyMathNotation));
});
