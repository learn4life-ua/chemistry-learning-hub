import { elements, byNumber, detailsByNumber, categoryLabels, trends } from './learning-data.js?v=1';

const sections = { structure: 'Групи й періоди', families: 'Родини елементів', blocks: 'Електронні блоки', trends: 'Закономірності', compare: 'Порівняння' };
const familyNotes = {
  alkali: 'Лужні метали мають один електрон на зовнішньому рівні. Типовий ступінь окиснення +1. Гідроген до цієї родини не належить.',
  alkaline: 'Лужноземельні метали — елементи другої групи з двома електронами на зовнішньому рівні. Типовий ступінь окиснення +2.',
  transition: 'У центральній частині таблиці розташовані d-елементи. Для багатьох характерні кілька ступенів окиснення. Колір відтворює категорії цієї таблиці; d-блок і строгий термін «перехідний елемент» не цілком тотожні.',
  'post-transition': 'Метали, що в цій таблиці виділені в окрему категорію. Багато з них розташовані у p-блоці.',
  metalloid: 'Металоїди мають поєднання властивостей металів і неметалів. Межі цієї категорії в різних класифікаціях можуть відрізнятися.',
  nonmetal: 'До цієї категорії таблиці належать неметали, крім окремо позначених галогенів і благородних газів. Гідроген — неметал, хоча стоїть у першій групі.',
  halogen: 'Галогени — елементи 17-ї групи. Для відомих представників характерні сім електронів на зовнішньому рівні та ступінь окиснення −1 у багатьох сполуках.',
  noble: 'Благородні гази — 18-та група. Зовнішній рівень Гелію містить 2 електрони, а інших представників — 8. Деякі благородні гази утворюють сполуки.',
  lanthanide: 'Ряд La–Lu розташований у шостому періоді й винесений униз для компактності. У цій навчальній таблиці весь ряд умовно позначений як f-блок.',
  actinide: 'Ряд Ac–Lr розташований у сьомому періоді й винесений униз для компактності. У цій навчальній таблиці весь ряд умовно позначений як f-блок.',
  unknown: 'Для цих надважких елементів багато властивостей ще уточнюють. Категорія відображає позначення чинної таблиці.'
};
const blockNotes = {
  s: 's-блок: групи 1–2 та Гелій. Гелій має конфігурацію 1s², хоча розташований у 18-й групі.',
  p: 'p-блок: групи 13–18, крім Гелію. Для його елементів заповнюється p-підрівень зовнішнього рівня.',
  d: 'd-блок: центральна частина таблиці, переважно групи 3–12. Будова й заповнення підрівнів мають винятки.',
  f: 'У цій таблиці ряди La–Lu та Ac–Lr умовно об’єднані у f-блок. Для крайніх елементів рядів класифікація залежить від прийнятої схеми; їх не використовуємо в завданнях на визначення блоку.'
};

export function initExplore() {
  const root = document.querySelector('#exploreApp');
  if (!root) return;
  let mode = 'structure';
  const state = { axis: 'group', group: '1', period: '3', family: 'alkali', block: 's', trend: 'radius', first: '11', second: '17' };
  root.innerHTML = `
    <div class="learning-tabs" role="group" aria-label="Напрями дослідження">${Object.entries(sections).map(([key, label]) => `<button type="button" data-explore-mode="${key}" aria-pressed="${key === mode}">${label}</button>`).join('')}</div>
    <div class="learning-card explore-controls" id="exploreControls"></div>
    <div class="explore-layout">
      <div class="learning-card explore-map"><p class="learning-caption">Кольори позначають категорії. Виділені елементи відповідають вашому вибору.</p><div class="periodic-scroll" tabindex="0" role="region" aria-label="Таблиця дослідження з горизонтальним прокручуванням"><div class="explore-table" id="exploreTable"></div></div><p class="learning-caption">На малому екрані прокручуйте таблицю вбік. Натисніть елемент, щоб переглянути його дані.</p></div>
      <aside class="learning-card explore-insight" id="exploreInsight" aria-live="polite"></aside>
    </div>
    <div id="exploreComparison"></div>`;
  const controls = root.querySelector('#exploreControls');
  const table = root.querySelector('#exploreTable');
  const insight = root.querySelector('#exploreInsight');
  const comparison = root.querySelector('#exploreComparison');
  const option = (value, label, selected) => `<option value="${value}"${String(value) === String(selected) ? ' selected' : ''}>${label}</option>`;
  function select(key, label, values) {
    return `<label class="learning-field">${label}<select data-explore-control="${key}">${values.map(([value, text]) => option(value, text, state[key])).join('')}</select></label>`;
  }
  function drawTable() {
    table.innerHTML = Array.from({length:18}, (_, i) => `<span class="explore-axis" style="grid-column:${i + 2};grid-row:1">${i + 1}</span>`).join('')
      + Array.from({length:7}, (_, i) => `<span class="explore-axis" style="grid-column:1;grid-row:${i + 2}">${i + 1}</span>`).join('')
      + '<span class="explore-series" style="grid-column:1 / span 4;grid-row:10">Лантаноїди</span><span class="explore-series" style="grid-column:1 / span 4;grid-row:11">Актиноїди</span>'
      + elements.map(e => {
        const f = e.category === 'lanthanide' || e.category === 'actinide';
        const row = f ? (e.period === 6 ? 10 : 11) : e.period + 1;
        const col = f ? 5 + e.number - (e.period === 6 ? 57 : 89) : e.group + 1;
        return `<button type="button" class="explore-element cat-${e.category}" data-explore-element="${e.number}" style="grid-column:${col};grid-row:${row}" aria-label="${e.name}, ${e.symbol}, номер ${e.number}"><small>${e.number}</small><strong>${e.symbol}</strong></button>`;
      }).join('');
  }
  function matches(e) {
    if (mode === 'structure') return state.axis === 'period' ? e.period === Number(state.period) : e.group === Number(state.group) && e.block !== 'f';
    if (mode === 'families') return e.category === state.family;
    if (mode === 'blocks') return e.block === state.block;
    if (mode === 'trends') return trends[state.trend].example.includes(e.number);
    return [state.first, state.second].includes(String(e.number));
  }
  function describe() {
    const count = elements.filter(matches).length;
    if (mode === 'structure') {
      const period = state.axis === 'period';
      return `<p class="eyebrow">${count} елементів виділено</p><h2>${period ? `${state.period}-й період` : `${state.group}-а група`}</h2><p>${period ? 'Період — горизонтальний ряд. У межах періоду атомний номер зростає зліва направо.' : 'Група — вертикальний стовпець. Елементи головних груп часто мають подібну будову зовнішнього рівня та хімічні властивості.'}</p><p class="learning-note">${period ? 'Лантаноїди належать до 6-го періоду, актиноїди — до 7-го, хоча показані нижче.' : 'Винесені f-ряди не виділяємо як третю групу. Гідроген у першій групі — неметал.'}</p>`;
    }
    if (mode === 'families') return `<p class="eyebrow">${count} елементів виділено</p><h2>${categoryLabels[state.family]}</h2><p>${familyNotes[state.family]}</p>`;
    if (mode === 'blocks') return `<p class="eyebrow">${count} елементів виділено</p><h2>${state.block}-блок</h2><p>${blockNotes[state.block]}</p>`;
    if (mode === 'trends') {
      const t = trends[state.trend];
      return `<p class="eyebrow">Загальна тенденція</p><h2>${t.title}</h2><div class="trend-direction" aria-label="Напрямок зростання">${t.direction}</div><p>${t.text}</p><p><strong>${t.exampleText}</strong></p><p class="learning-note">${t.note}</p><a class="learning-source" href="https://openstax.org/books/chemistry-2e/pages/6-5-periodic-variations-in-element-properties" target="_blank" rel="noopener">Докладніше: OpenStax Chemistry 2e ↗</a>`;
    }
    return '<p class="eyebrow">Порівняйте дані</p><h2>Два елементи поруч</h2><p>Оберіть елементи у списках або натискайте клітинки: спочатку змінюється перший елемент, потім другий.</p><p class="learning-note">Число на зовнішньому рівні не завжди дорівнює числу валентних електронів у перехідних елементів. Відсутні значення позначено словами.</p>';
  }
  function elementSummary(e) {
    const d = detailsByNumber.get(e.number) || {};
    return `<h2>${e.name} <span class="learning-symbol cat-${e.category}">${e.symbol}</span></h2><dl class="learning-details"><div><dt>Атомний номер</dt><dd>${e.number}</dd></div><div><dt>Група / період</dt><dd>${e.block === 'f' ? 'винесений ряд' : e.group} / ${e.period}</dd></div><div><dt>Категорія</dt><dd>${categoryLabels[e.category]}</dd></div><div><dt>Блок</dt><dd>${e.block}${e.block === 'f' ? ' (умовно для ряду)' : ''}</dd></div><div><dt>Електронна конфігурація</dt><dd>${d.cfg || 'Дані уточнюються'}</dd></div><div><dt>Електрони за рівнями</dt><dd>${d.shells?.join(' · ') || 'Дані уточнюються'}</dd></div><div><dt>Типові ступені окиснення</dt><dd>${d.ox || 'Дані уточнюються'}</dd></div><div><dt>Електронегативність, шкала Полінга</dt><dd>${Number.isFinite(d.en) ? String(d.en).replace('.', ',') : 'Немає визначеного значення'}</dd></div></dl>`;
  }
  function renderComparison() {
    comparison.innerHTML = mode === 'compare' ? `<div class="comparison-grid">${[state.first, state.second].map(n => `<article class="learning-card">${elementSummary(byNumber.get(Number(n)))}</article>`).join('')}</div>` : '';
  }
  function update() {
    table.querySelectorAll('[data-explore-element]').forEach(button => {
      const match = matches(byNumber.get(Number(button.dataset.exploreElement)));
      button.classList.toggle('is-muted', !match);
      button.classList.toggle('is-highlighted', match);
      button.setAttribute('aria-pressed', String(match));
    });
    insight.innerHTML = describe();
    renderComparison();
  }
  let compareNext = 'first';
  function renderControls() {
    let html = '';
    if (mode === 'structure') {
      html = select('axis', 'Дослідити', [['group','Групу'],['period','Період']]);
      html += select(state.axis, state.axis === 'group' ? 'Номер групи' : 'Номер періоду', Array.from({length:state.axis === 'group' ? 18 : 7}, (_, i) => [i + 1, String(i + 1)]));
    }
    if (mode === 'families') html = select('family', 'Родина або категорія', Object.entries(categoryLabels));
    if (mode === 'blocks') html = select('block', 'Електронний блок', ['s','p','d','f'].map(b => [b, `${b}-блок`]));
    if (mode === 'trends') html = select('trend', 'Властивість', Object.entries(trends).map(([key, t]) => [key, t.title]));
    if (mode === 'compare') {
      const choices = elements.map(e => [e.number, `${e.symbol} — ${e.name}`]);
      html = select('first', 'Перший елемент', choices) + select('second', 'Другий елемент', choices);
    }
    controls.innerHTML = html + '<button class="learning-button secondary" type="button" data-explore-reset>Скинути вибір</button>';
  }
  root.addEventListener('click', event => {
    const tab = event.target.closest('[data-explore-mode]');
    if (tab) {
      mode = tab.dataset.exploreMode;
      root.querySelectorAll('[data-explore-mode]').forEach(button => button.setAttribute('aria-pressed', String(button === tab)));
      renderControls(); update(); return;
    }
    if (event.target.closest('[data-explore-reset]')) {
      Object.assign(state, { axis: 'group', group: '1', period: '3', family: 'alkali', block: 's', trend: 'radius', first: '11', second: '17' });
      compareNext = 'first'; renderControls(); update(); return;
    }
    const cell = event.target.closest('[data-explore-element]');
    if (cell) {
      const e = byNumber.get(Number(cell.dataset.exploreElement));
      if (mode === 'compare') {
        state[compareNext] = String(e.number); compareNext = compareNext === 'first' ? 'second' : 'first';
        // Keep the clicked cell in place and focused; only update selectors and comparison.
        renderControls(); update();
      } else insight.innerHTML = elementSummary(e) + '<p class="learning-note">Змініть параметр угорі, щоб повернути пояснення дослідження.</p>';
    }
  });
  root.addEventListener('change', event => {
    const key = event.target.dataset.exploreControl;
    if (!key) return;
    state[key] = event.target.value;
    if (key === 'axis') { renderControls(); controls.querySelector('[data-explore-control="axis"]').focus(); }
    update();
  });
  drawTable(); renderControls(); update();
}
