import { elements } from '../../periodic-table/data/elements.js';

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

const elementMap = new Map(elements.map(element => [element.symbol, element]));
const subscriptMap = new Map([
  ['₀', '0'], ['₁', '1'], ['₂', '2'], ['₃', '3'], ['₄', '4'],
  ['₅', '5'], ['₆', '6'], ['₇', '7'], ['₈', '8'], ['₉', '9']
]);

function normalizeFormula(value) {
  return value
    .trim()
    .replace(/\s+/g, '')
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, char => subscriptMap.get(char))
    .replace(/[•∙]/g, '·');
}

function addCount(map, symbol, amount) {
  map.set(symbol, (map.get(symbol) || 0) + amount);
}

function mergeCounts(target, source, multiplier = 1) {
  source.forEach((count, symbol) => addCount(target, symbol, count * multiplier));
}

function readNumber(text, index) {
  let end = index;
  while (end < text.length && /\d/.test(text[end])) end += 1;
  if (end === index) return { value: 1, next: index };

  const raw = text.slice(index, end);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > 9999) {
    throw new Error('Індекс або коефіцієнт у формулі має бути цілим числом від 1 до 9999.');
  }
  return { value, next: end };
}

function parseGroup(text, startIndex = 0, expectedClosing = null) {
  const counts = new Map();
  let index = startIndex;
  const closingFor = { '(': ')', '[': ']', '{': '}' };

  while (index < text.length) {
    const char = text[index];

    if (char === ')' || char === ']' || char === '}') {
      if (!expectedClosing || char !== expectedClosing) {
        throw new Error('Перевірте відповідність дужок у формулі.');
      }
      return { counts, next: index + 1 };
    }

    if (char === '(' || char === '[' || char === '{') {
      const closing = closingFor[char];
      const nested = parseGroup(text, index + 1, closing);
      const multiplier = readNumber(text, nested.next);
      mergeCounts(counts, nested.counts, multiplier.value);
      index = multiplier.next;
      continue;
    }

    if (/[A-Z]/.test(char)) {
      let symbol = char;
      if (index + 1 < text.length && /[a-z]/.test(text[index + 1])) {
        symbol += text[index + 1];
        index += 1;
      }

      if (!elementMap.has(symbol)) {
        throw new Error(`Елемент «${symbol}» не знайдено в Періодичній системі.`);
      }

      const multiplier = readNumber(text, index + 1);
      addCount(counts, symbol, multiplier.value);
      index = multiplier.next;
      continue;
    }

    if (/[a-z]/.test(char)) {
      throw new Error('Символ елемента потрібно починати з великої латинської літери.');
    }

    if (/\d/.test(char)) {
      throw new Error('Число у формулі має стояти після символу елемента або групи в дужках.');
    }

    throw new Error(`Символ «${char}» не підтримується у хімічній формулі.`);
  }

  if (expectedClosing) throw new Error('У формулі не закрито дужку.');
  return { counts, next: index };
}

function parseSegment(segment) {
  if (!segment) throw new Error('Після крапки у формулі має бути ще одна частина речовини.');

  const leading = readNumber(segment, 0);
  const hasLeadingCoefficient = leading.next > 0;
  const bodyStart = hasLeadingCoefficient ? leading.next : 0;
  const coefficient = hasLeadingCoefficient ? leading.value : 1;

  if (bodyStart >= segment.length) throw new Error('Після коефіцієнта має бути хімічна формула.');

  const parsed = parseGroup(segment, bodyStart, null);
  if (parsed.next !== segment.length) throw new Error('Не вдалося повністю прочитати формулу.');
  if (!parsed.counts.size) throw new Error('Введіть хоча б один хімічний елемент.');

  const counts = new Map();
  mergeCounts(counts, parsed.counts, coefficient);
  return counts;
}

function parseFormula(formula) {
  if (!formula) throw new Error('Введіть хімічну формулу.');
  if (formula.length > 120) throw new Error('Формула надто довга для цього навчального калькулятора.');
  if (/[+=−–—^]/.test(formula)) {
    throw new Error('Вводьте формулу речовини без заряду, коефіцієнтів реакції та знаків рівняння.');
  }

  const segments = formula.split(/[·.]/);
  const total = new Map();
  segments.forEach(segment => mergeCounts(total, parseSegment(segment)));
  return total;
}

function massInfo(element) {
  const raw = String(element.mass).trim();
  const approximate = /[()[\]]/.test(raw);
  const numeric = Number(raw.replace(',', '.').replace(/[()[\]]/g, ''));
  if (!Number.isFinite(numeric)) {
    throw new Error(`Для ${element.symbol} немає числового значення атомної маси.`);
  }
  return { raw, numeric, approximate };
}

function formatNumber(value, maxFractionDigits = 3) {
  return new Intl.NumberFormat('uk-UA', {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0
  }).format(value);
}

function formatFormula(formula) {
  let html = '';
  let index = 0;

  while (index < formula.length) {
    const char = formula[index];
    if (/\d/.test(char)) {
      let end = index;
      while (end < formula.length && /\d/.test(formula[end])) end += 1;
      const digits = formula.slice(index, end);
      const previous = index > 0 ? formula[index - 1] : '';
      const shouldBeSubscript = /[A-Za-z)\]}]/.test(previous);
      html += shouldBeSubscript ? `<sub>${digits}</sub>` : digits;
      index = end;
      continue;
    }

    html += char;
    index += 1;
  }

  return html;
}

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

function renderResult(formula, counts) {
  let totalMass = 0;
  let hasApproximateMass = false;
  const rows = [];

  counts.forEach((count, symbol) => {
    const element = elementMap.get(symbol);
    const mass = massInfo(element);
    const subtotal = mass.numeric * count;
    totalMass += subtotal;
    hasApproximateMass ||= mass.approximate;
    rows.push({ element, count, mass, subtotal });
  });

  resultFormula.innerHTML = formatFormula(formula);
  molarMass.textContent = formatNumber(totalMass, 3);
  resultNote.textContent = hasApproximateMass
    ? 'Для елементів без стандартної відносної атомної маси використано числове значення, наведене в Періодичній системі хабу.'
    : 'Розрахунок виконано за відносними атомними масами з Періодичної системи Chemistry Learning Hub.';

  breakdownBody.innerHTML = rows.map(({ element, count, mass, subtotal }) => `
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
  const formula = normalizeFormula(value);
  input.value = formula;

  try {
    const counts = parseFormula(formula);
    renderResult(formula, counts);
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
