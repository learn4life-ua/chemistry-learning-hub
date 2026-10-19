import { elements as source, categoryLabels } from '../data/elements.js?v=8';
import { elementDetails } from '../data/details.js?v=8';

export { categoryLabels };
export const detailsByNumber = new Map(elementDetails.map(item => [item.n, item]));
const corrections = new Map([[28, { name: 'Нікол' }], [40, { mass: '91,222' }], [64, { mass: '157,249' }]]);
export function normalizeElement(element) {
  const merged = { ...element, ...corrections.get(element.number) };
  return { ...merged, mass: /^\(\d+\)$/.test(merged.mass) ? `[${merged.mass.slice(1, -1)}]` : merged.mass };
}
export const elements = source.map(normalizeElement);
export const byNumber = new Map(elements.map(element => [element.number, element]));
export const topics = {
  mixed: 'Змішане тренування', identity: 'Упізнай елемент', position: 'Знайди місце',
  families: 'Родини й блоки', atom: 'Будова атома', trends: 'Порівняй властивості'
};
export const trends = {
  radius: {
    title: 'Атомний радіус', direction: '← у періоді · ↓ у групі',
    text: 'Зазвичай радіус зростає вниз у групі та зменшується зліва направо в періоді. Нові енергетичні рівні збільшують розмір атома; у межах періоду посилюється притягання електронів до ядра.',
    example: [3, 11, 19], exampleText: 'Li → Na → K: радіус зростає вниз у групі.',
    note: 'Це якісна тенденція, а не числова шкала. Радіус залежить від способу визначення; для перехідних елементів зміни складніші.'
  },
  en: {
    title: 'Електронегативність', direction: '→ у періоді · ↑ у групі',
    text: 'Здатність атома притягувати спільні електрони в хімічному зв’язку загалом зростає вправо в періоді та вгору в групі. Флуор має найбільше значення за шкалою Полінга.',
    example: [11, 12, 13, 14, 15, 16, 17], exampleText: 'Na → Cl: електронегативність зростає в третьому періоді.',
    note: 'Загальна тенденція має винятки. Для частини елементів значення не визначене; відсутність даних не означає нуль.'
  },
  metallic: {
    title: 'Металічний характер', direction: '← у періоді · ↓ у групі',
    text: 'Для елементів головних груп металічний характер загалом посилюється вниз у групі та вліво в періоді. Метали схильні віддавати електрони й утворювати катіони.',
    example: [3, 11, 19], exampleText: 'Li → Na → K: металічний характер посилюється.',
    note: 'Це загальна закономірність, а не універсальна числова характеристика. Гідроген у першій групі є неметалом.'
  }
};

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Questions use unambiguous main-table positions; f-series classification is not tested.
export function questionBank(limit = 20) {
  const pool = elements.filter(e => e.number <= limit);
  const bank = [];
  function add(topic, id, prompt, answer, alternatives, explanation, hint) {
    const options = [...new Set([answer, ...alternatives])].slice(0, 4);
    if (options.length === 4) bank.push({ topic, id, prompt, answer, options, explanation, hint });
  }
  for (const e of pool) {
    const others = pool.filter(other => other.number !== e.number);
    const label = `${e.name} (${e.symbol})`;
    add('identity', `symbol-${e.number}`, `Який символ має ${e.name}?`, e.symbol,
      shuffle(others).map(o => o.symbol), `${label}: атомний номер ${e.number}.`, 'Символ починається з великої латинської літери; друга літера, якщо є, — мала.');
    add('identity', `name-${e.number}`, `Яку назву має елемент ${e.symbol}?`, e.name,
      shuffle(others).map(o => o.name), `${e.symbol} — ${e.name}, елемент № ${e.number}.`, `Його атомний номер — ${e.number}.`);
    add('identity', `number-${e.number}`, `Який елемент має атомний номер ${e.number}?`, label,
      shuffle(others).map(o => `${o.name} (${o.symbol})`), `Атомний номер ${e.number} відповідає елементу ${label}.`, `Шукайте його в ${e.period}-му періоді.`);
    add('position', `group-${e.number}`, `У якій групі розташований ${label}?`, String(e.group),
      shuffle(Array.from({length:18}, (_, i) => String(i + 1)).filter(n => n !== String(e.group))), `${label} розташований у ${e.group}-й групі, ${e.period}-му періоді. Групи — вертикальні стовпці.`, 'Групи пронумеровані від 1 до 18. Гелій належить до 18-ї групи.');
    add('position', `period-${e.number}`, `У якому періоді розташований ${label}?`, String(e.period),
      shuffle(['1','2','3','4','5','6','7'].filter(n => n !== String(e.period))), `${label} — ${e.period}-й період. Періоди — горизонтальні ряди.`, 'Період пов’язаний із найвищим зайнятим енергетичним рівнем атома.');
    add('families', `block-${e.number}`, `До якого електронного блоку належить ${label}?`, e.block,
      ['s','p','d','f'].filter(b => b !== e.block), `${label} належить до ${e.block}-блоку.${e.number === 2 ? ' Гелій: 1s², хоча стоїть у 18-й групі.' : ''}`, `Конфігурація: ${detailsByNumber.get(e.number)?.cfg || 'дивіться довідник'}.`);
    add('families', `family-${e.number}`, `До якої категорії належить ${label}?`, categoryLabels[e.category],
      shuffle(Object.entries(categoryLabels).filter(([key]) => key !== e.category && key !== 'unknown')).map(([, value]) => value), `${label}: ${categoryLabels[e.category].toLocaleLowerCase('uk')}.${e.number === 1 ? ' Гідроген не належить до лужних металів.' : ''}`, 'Орієнтуйтеся на положення елемента й кольори категорій у таблиці.');
    add('atom', `protons-${e.number}`, `Скільки протонів у ядрі атома ${label}?`, String(e.number),
      [String(e.number + 1), String(e.number + 2), String(e.number + 3)], `Кількість протонів дорівнює атомному номеру: ${e.number}.`, 'Атомний номер показує заряд ядра в одиницях елементарного заряду.');
    add('atom', `electrons-${e.number}`, `Скільки електронів у нейтральному атомі ${label}?`, String(e.number),
      [String(e.number + 1), String(e.number + 2), String(e.number + 3)], `Нейтральний атом має однакову кількість протонів та електронів: ${e.number}.`, 'У нейтрального атома сумарний заряд дорівнює нулю.');
    const shells = detailsByNumber.get(e.number)?.shells;
    if (shells?.length && shells.reduce((a, b) => a + b, 0) === e.number) {
      add('atom', `shells-${e.number}`, `Який розподіл електронів за рівнями має нейтральний атом ${label}?`, shells.join(' · '),
        shuffle(others).map(o => detailsByNumber.get(o.number)?.shells?.join(' · ')).filter(Boolean),
        `${label}: ${shells.join(' · ')}. Разом ${e.number} електронів.`, `Сума електронів за рівнями має дорівнювати ${e.number}.`);
    }
  }
  const pairs = [[3,11],[11,19],[4,12],[12,20],[9,17],[3,9],[11,17],[12,16],[13,17],[6,9],[14,17],[8,9]];
  if (limit > 20) pairs.push([19,37],[20,38],[17,35],[35,53],[11,35],[12,34]);
  for (const [a, b] of pairs) {
    const x = byNumber.get(a), y = byNumber.get(b);
    const ex = detailsByNumber.get(a).en, ey = detailsByNumber.get(b).en;
    // Equal rounded values are not suitable for a question about a larger value.
    if (ex !== ey) {
      const answer = ex > ey ? x : y;
      add('trends', `en-${a}-${b}`, `Який елемент має більшу електронегативність: ${x.symbol} чи ${y.symbol}?`, answer.symbol,
        [answer === x ? y.symbol : x.symbol, 'Однакову', 'Для обох не визначено'],
        `За шкалою Полінга: ${x.symbol} — ${ex}, ${y.symbol} — ${ey}. Більше значення має ${answer.name}.`, 'Електронегативність загалом зростає вправо та вгору; благородні гази тут не порівнюємо.');
    }
    // Radius examples are confined to the same main group or period.
    if (x.group !== y.group && x.period !== y.period) continue;
    const larger = x.group === y.group ? (x.period > y.period ? x : y) : (x.group < y.group ? x : y);
    add('trends', `radius-${a}-${b}`, `У якого атома за загальною тенденцією більший радіус: ${x.symbol} чи ${y.symbol}?`, larger.symbol,
      [larger === x ? y.symbol : x.symbol, 'Однаковий', 'Залежить лише від маси'],
      `${larger.symbol}: у групі радіус зазвичай зростає вниз, у періоді зменшується вправо. Порівнюємо якісну тенденцію для елементів головних груп.`, 'Униз — більше енергетичних рівнів; вправо в періоді — сильніше притягання до ядра.');
  }
  return bank;
}

export function makeRound(topic = 'mixed', limit = 20) {
  const bank = questionBank(limit);
  // Mixed rounds include each of the five topics twice.
  const chosen = topic === 'mixed'
    ? shuffle(Object.keys(topics).filter(key => key !== 'mixed').flatMap(key => shuffle(bank.filter(q => q.topic === key)).slice(0, 2)))
    : shuffle(bank.filter(q => q.topic === topic)).slice(0, 10);
  return chosen.map(q => ({ ...q, options: shuffle(q.options) }));
}
