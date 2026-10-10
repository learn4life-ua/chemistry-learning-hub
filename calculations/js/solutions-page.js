import './molar-concentration.js?v=1';
import './dilution.js?v=1';
import './density.js?v=1';
import './mass-concentration.js?v=1';
import { setupCalculationTabs } from './category-tabs.js?v=1';

const fraction = (top, bottom) => `<span class="math-frac"><span>${top}</span><span>${bottom}</span></span>`;

function activeMode(selector, attribute) {
  return document.querySelector(`${selector}.is-active`)?.getAttribute(attribute) || '';
}

function applyMathNotation() {
  const concentrationHelper = document.querySelector('#concentrationHelper');
  const concentrationMode = activeMode('[data-concentration-mode]', 'data-concentration-mode');
  if (concentrationHelper) {
    if (concentrationMode === 'c-from-n') concentrationHelper.innerHTML = `Використовується c = ${fraction('n', 'V')}.`;
    if (concentrationMode === 'c-from-m') concentrationHelper.innerHTML = `Спочатку n = ${fraction('m', 'M')}, потім c = ${fraction('n', 'V')}.`;
    if (concentrationMode === 'n-from-c') concentrationHelper.innerHTML = 'Використовується n = cV.';
  }

  const fractionHelper = document.querySelector('#fractionHelper');
  const fractionMode = activeMode('[data-fraction-mode]', 'data-fraction-mode');
  if (fractionHelper) {
    if (fractionMode === 'omega-solution') fractionHelper.innerHTML = `ω = ${fraction('m(розчиненої речовини)', 'm(розчину)')} · 100%.`;
    if (fractionMode === 'solute-from-omega') fractionHelper.innerHTML = `m(розчиненої речовини) = ${fraction('ω · m(розчину)', '100%')}.`;
    if (fractionMode === 'omega-element') fractionHelper.innerHTML = `ω(E) = ${fraction('A<sub>r</sub>(E) · k', 'M<sub>r</sub>(речовини)')} · 100%.`;
  }

  const dilutionHelper = document.querySelector('#dilutionHelper');
  if (dilutionHelper) dilutionHelper.innerHTML = 'Основне співвідношення: c₁V₁ = c₂V₂.';

  const densityHelper = document.querySelector('#densityHelper');
  const densityMode = activeMode('[data-density-mode]', 'data-density-mode');
  if (densityHelper) {
    if (densityMode === 'rho') densityHelper.innerHTML = `ρ = ${fraction('m', 'V')}.`;
    if (densityMode === 'mass') densityHelper.innerHTML = 'm = ρV.';
    if (densityMode === 'volume') densityHelper.innerHTML = `V = ${fraction('m', 'ρ')}.`;
  }

  const densityBadge = document.querySelector('#density-calculations .calc-badge');
  if (densityBadge) densityBadge.innerHTML = `ρ = ${fraction('m', 'V')}`;

  const massConcentrationHelper = document.querySelector('#massConcentrationHelper');
  const massConcentrationMode = activeMode('[data-mass-concentration-mode]', 'data-mass-concentration-mode');
  if (massConcentrationHelper) {
    if (massConcentrationMode === 'beta') massConcentrationHelper.innerHTML = `β = ${fraction('m', 'V')}.`;
    if (massConcentrationMode === 'mass') massConcentrationHelper.innerHTML = 'm = βV.';
    if (massConcentrationMode === 'volume') massConcentrationHelper.innerHTML = `V = ${fraction('m', 'β')}.`;
  }

  const massConcentrationBadge = document.querySelector('#mass-concentration .calc-badge');
  if (massConcentrationBadge) massConcentrationBadge.innerHTML = `β = ${fraction('m', 'V')}`;
}

setupCalculationTabs();
applyMathNotation();

document.addEventListener('click', event => {
  if (event.target.closest('[data-concentration-mode], [data-fraction-mode], [data-dilution-mode], [data-density-mode], [data-mass-concentration-mode]')) {
    queueMicrotask(applyMathNotation);
  }
});
