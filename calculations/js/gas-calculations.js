import { getFormulaData, formatNumber, formatFormula } from './formula-core.js';

const R = 8.31446261815324; // L·kPa·mol⁻¹·K⁻¹

const form = document.querySelector('#gasForm');
const modeButtons = [...document.querySelectorAll('[data-gas-mode]')];
const formulaWrap = document.querySelector('#gasFormulaWrap');
const formulaInput = document.querySelector('#gasFormulaInput');
const primaryLabel = document.querySelector('#gasPrimaryLabel');
const primaryInput = document.querySelector('#gasPrimaryInput');
const primaryUnit = document.querySelector('#gasPrimaryUnit');
const temperatureInput = document.querySelector('#gasTemperatureInput');
const temperatureUnit = document.querySelector('#gasTemperatureUnit');
const pressureInput = document.querySelector('#gasPressureInput');
const pressureUnit = document.querySelector('#gasPressureUnit');
const helper = document.querySelector('#gasHelper');
const errorBox = document.querySelector('#gasError');
const resultEmpty = document.querySelector('#gasResultEmpty');
const resultContent = document.querySelector('#gasResultContent');
const resultTitle = document.querySelector('#gasResultTitle');
const resultValue = document.querySelector('#gasResultValue');
const resultUnit = document.querySelector('#gasResultUnit');
const steps = document.querySelector('#gasSteps');
const note = document.querySelector('#gasNote');

const modes = {
  'n-from-v': {
    label: 'Об’єм газу V',
    helper: 'Використовується рівняння ідеального газу n = pV / RT. Температура і тиск задаються явно.',
    units: [
      { value: 'L', label: 'л' },
      { value: 'mL', label: 'мл' },
      { value: 'm3', label: 'м³' }
    ]
  },
  'v-from-n': {
    label: 'Кількість речовини n',
    helper: 'Використовується V = nRT / p. Результат подається в літрах.',
    units: [
      { value: 'mol', label: 'моль' },
      { value: 'mmol', label: 'ммоль' }
    ]
  },
  'm-from-v': {
    label: 'Об’єм газу V',
    helper: 'Спочатку знаходимо n = pV / RT, потім m = nM. Для цього потрібна формула газу.',
    units: [
      { value: 'L', label: 'л' },
      { value: 'mL', label: 'мл' },
      { value: 'm3', label: 'м³' }
    ]
  }
};

let activeMode = 'n-from-v';

function parseNumber(value, label) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  if (!normalized) throw new Error(`${label}: введіть числове значення.`);
  const number = Number(normalized);
  if (!Number.isFinite(number)) throw new Error(`${label}: введіть коректне число.`);
  return number;
}

function positiveNumber(value, label) {
  const number = parseNumber(value, label);
  if (number <= 0) throw new Error(`${label} має бути додатним числом.`);
  return number;
}

function toLitres(value, unit) {
  if (unit === 'mL') return value / 1000;
  if (unit === 'm3') return value * 1000;
  return value;
}

function toMoles(value, unit) {
  return unit === 'mmol' ? value / 1000 : value;
}

function toKelvin(value, unit) {
  const kelvin = unit === 'C' ? value + 273.15 : value;
  if (kelvin <= 0) throw new Error('Температура має бути вищою за абсолютний нуль.');
  return kelvin;
}

function toKPa(value, unit) {
  if (unit === 'atm') return value * 101.325;
  if (unit === 'mmHg') return value * 0.13332236842105263;
  return value;
}

function unitOptions(items) {
  return items.map(item => `<option value="${item.value}">${item.label}</option>`).join('');
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  [formulaInput, primaryInput, temperatureInput, pressureInput].forEach(input => input?.removeAttribute('aria-invalid'));
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
    const active = button.dataset.gasMode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  primaryLabel.textContent = config.label;
  helper.textContent = config.helper;
  primaryUnit.innerHTML = unitOptions(config.units);
  formulaWrap.hidden = mode !== 'm-from-v';
  clearError();
}

function renderResult({ formulaData, primaryBase, temperatureK, pressureKPa, sourceUnits }) {
  let finalValue;
  let finalUnit;
  let title;
  let solutionSteps = [];

  if (activeMode === 'n-from-v') {
    const amount = pressureKPa * primaryBase / (R * temperatureK);
    finalValue = amount;
    finalUnit = 'моль';
    title = 'Кількість речовини газу';
    solutionSteps = [
      `<strong>1.</strong> T = ${formatNumber(temperatureK, 2)} K; p = ${formatNumber(pressureKPa, 5)} кПа; V = ${formatNumber(primaryBase, 6)} л`,
      '<strong>2.</strong> n = pV / RT',
      `<strong>3.</strong> n = (${formatNumber(pressureKPa, 5)} × ${formatNumber(primaryBase, 6)}) / (${formatNumber(R, 6)} × ${formatNumber(temperatureK, 2)}) = ${formatNumber(amount, 6)} моль`
    ];
  }

  if (activeMode === 'v-from-n') {
    const volume = primaryBase * R * temperatureK / pressureKPa;
    finalValue = volume;
    finalUnit = 'л';
    title = 'Об’єм газу';
    solutionSteps = [
      `<strong>1.</strong> T = ${formatNumber(temperatureK, 2)} K; p = ${formatNumber(pressureKPa, 5)} кПа; n = ${formatNumber(primaryBase, 6)} моль`,
      '<strong>2.</strong> V = nRT / p',
      `<strong>3.</strong> V = (${formatNumber(primaryBase, 6)} × ${formatNumber(R, 6)} × ${formatNumber(temperatureK, 2)}) / ${formatNumber(pressureKPa, 5)} = ${formatNumber(volume, 5)} л`
    ];
  }

  if (activeMode === 'm-from-v') {
    const amount = pressureKPa * primaryBase / (R * temperatureK);
    const mass = amount * formulaData.totalMass;
    const formulaHTML = formatFormula(formulaData.formula);
    finalValue = mass;
    finalUnit = 'г';
    title = `Маса ${formulaHTML}`;
    solutionSteps = [
      `<strong>1.</strong> M(${formulaHTML}) = ${formatNumber(formulaData.totalMass, 5)} г/моль`,
      `<strong>2.</strong> n = pV / RT = (${formatNumber(pressureKPa, 5)} × ${formatNumber(primaryBase, 6)}) / (${formatNumber(R, 6)} × ${formatNumber(temperatureK, 2)}) = ${formatNumber(amount, 6)} моль`,
      `<strong>3.</strong> m = nM = ${formatNumber(amount, 6)} × ${formatNumber(formulaData.totalMass, 5)} = ${formatNumber(mass, 5)} г`
    ];
  }

  resultTitle.innerHTML = title;
  resultValue.textContent = formatNumber(finalValue, 6);
  resultUnit.textContent = finalUnit;
  steps.innerHTML = solutionSteps.map(step => `<div class="solution-step">${step}</div>`).join('');

  const conversions = sourceUnits.primary !== primaryUnit.value || sourceUnits.temperature !== 'K' || sourceUnits.pressure !== 'kPa';
  if (activeMode === 'm-from-v' && formulaData.hasApproximateMass) {
    note.textContent = 'У формулі є елемент без стандартної атомної маси, тому розрахована маса є наближеною.';
  } else if (conversions) {
    note.textContent = 'Перед підстановкою одиниці автоматично переведено в літри, кельвіни та кілопаскалі.';
  } else {
    note.textContent = 'Розрахунок виконано за моделлю ідеального газу з R = 8,314462618 л·кПа/(моль·K).';
  }

  resultEmpty.hidden = true;
  resultContent.hidden = false;
}

function calculate() {
  clearError();

  try {
    const primaryRaw = positiveNumber(primaryInput.value, activeMode === 'v-from-n' ? 'Кількість речовини' : 'Об’єм');
    const temperatureRaw = parseNumber(temperatureInput.value, 'Температура');
    const pressureRaw = positiveNumber(pressureInput.value, 'Тиск');

    const temperatureK = toKelvin(temperatureRaw, temperatureUnit.value);
    const pressureKPa = toKPa(pressureRaw, pressureUnit.value);
    if (pressureKPa <= 0) throw new Error('Тиск має бути додатним числом.');

    let primaryBase;
    if (activeMode === 'v-from-n') primaryBase = toMoles(primaryRaw, primaryUnit.value);
    else primaryBase = toLitres(primaryRaw, primaryUnit.value);

    let formulaData = null;
    if (activeMode === 'm-from-v') {
      formulaData = getFormulaData(formulaInput.value);
      formulaInput.value = formulaData.formula;
    }

    renderResult({
      formulaData,
      primaryBase,
      temperatureK,
      pressureKPa,
      sourceUnits: {
        primary: primaryUnit.value,
        temperature: temperatureUnit.value,
        pressure: pressureUnit.value
      }
    });
  } catch (error) {
    showError(error instanceof Error ? error.message : 'Не вдалося виконати газовий розрахунок.');
  }
}

function applyPreset(preset) {
  if (preset === 'normal') {
    temperatureInput.value = '0';
    temperatureUnit.value = 'C';
    pressureInput.value = '101,325';
    pressureUnit.value = 'kPa';
  }
  if (preset === 'room') {
    temperatureInput.value = '25';
    temperatureUnit.value = 'C';
    pressureInput.value = '101,325';
    pressureUnit.value = 'kPa';
  }
  clearError();
}

modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.gasMode)));
form?.addEventListener('submit', event => {
  event.preventDefault();
  calculate();
});

[formulaInput, primaryInput, temperatureInput, pressureInput].forEach(input => input?.addEventListener('input', clearError));

document.querySelectorAll('[data-gas-preset]').forEach(button => {
  button.addEventListener('click', () => {
    applyPreset(button.dataset.gasPreset);
    calculate();
  });
});

document.querySelectorAll('[data-gas-example]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.dataset.mode || 'n-from-v');
    primaryInput.value = button.dataset.value || '';
    if ([...primaryUnit.options].some(option => option.value === button.dataset.unit)) primaryUnit.value = button.dataset.unit;
    temperatureInput.value = button.dataset.temperature || '0';
    temperatureUnit.value = button.dataset.temperatureUnit || 'C';
    pressureInput.value = button.dataset.pressure || '101,325';
    pressureUnit.value = button.dataset.pressureUnit || 'kPa';
    if (button.dataset.formula) formulaInput.value = button.dataset.formula;
    calculate();
  });
});

setMode(activeMode);
primaryInput.value = '22,414';
primaryUnit.value = 'L';
applyPreset('normal');
calculate();
