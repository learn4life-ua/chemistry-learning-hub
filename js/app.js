const root = document.documentElement;
const themeToggle = document.querySelector('#themeToggle');
const themeLabel = themeToggle?.querySelector('.theme-label');
const themeIcon = themeToggle?.querySelector('.theme-icon');
const previewDialog = document.querySelector('#previewDialog');
const previewContent = document.querySelector('#previewContent');

const previews = {
  lab: {
    title: 'Віртуальна лабораторія',
    text: 'Починаємо з контрольованих симуляцій, де кожний сценарій перевіряється окремо.',
    items: [
      'утворення осаду та видимі ознаки реакції',
      'нейтралізація кислоти і лугу',
      'pH та поведінка індикаторів',
      'покроковий хід досліду з поясненнями',
      'перехід від досліду до лабораторного звіту'
    ]
  },
  calc: {
    title: 'Хімічні розрахунки',
    text: 'Не просто калькулятори, а інструменти з перевіркою формули, одиниць і логіки розв’язання.',
    items: [
      'молярна маса за хімічною формулою',
      'кількість речовини, маса та число частинок',
      'молярна концентрація',
      'масова частка',
      'газові розрахунки лише з явно заданими умовами'
    ]
  },
  ionic: {
    title: 'Розчинність і йонні реакції',
    text: 'Інтерактивна довідка має показувати не тільки позначення розчинності, а й зміст реакції.',
    items: [
      'катіон + аніон з поясненням результату',
      'формула можливої речовини',
      'ознака реакції та колір осаду там, де це коректно',
      'молекулярне рівняння',
      'повне і скорочене йонне рівняння'
    ]
  },
  trainer: {
    title: 'Тренажери',
    text: 'Самоперевірка без рейтингу та без збереження персональних результатів.',
    items: [
      'випадкові навчальні завдання',
      'миттєве позначення правильної відповіді',
      'коротке пояснення після кожної відповіді',
      'повторення без оцінки і реєстрації'
    ]
  },
  guide: {
    title: 'Довідник',
    text: 'Короткі пояснення замість перевантажених конспектів.',
    items: [
      'Періодичний закон і структура таблиці',
      'електронна будова',
      'типові ступені окиснення',
      'класи неорганічних сполук',
      'розчини, pH, індикатори та інші теми'
    ]
  }
};

function resolveInitialTheme() {
  const saved = localStorage.getItem('chemistry-hub-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === 'dark';
  themeToggle?.setAttribute('aria-pressed', String(isDark));
  if (themeLabel) themeLabel.textContent = isDark ? 'Світла тема' : 'Темна тема';
  if (themeIcon) themeIcon.textContent = isDark ? '☀' : '◐';
}

applyTheme(resolveInitialTheme());

themeToggle?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('chemistry-hub-theme', next);
  applyTheme(next);
});

function openPreview(key) {
  const preview = previews[key];
  if (!preview || !previewDialog || !previewContent) return;

  previewContent.innerHTML = `
    <p class="eyebrow">Модуль у розробці</p>
    <h2>${preview.title}</h2>
    <p>${preview.text}</p>
    <ul>${preview.items.map(item => `<li>${item}</li>`).join('')}</ul>
  `;
  previewDialog.showModal();
}

document.querySelectorAll('[data-preview]').forEach(button => {
  button.addEventListener('click', () => openPreview(button.dataset.preview));
});

document.querySelector('[data-dialog-close]')?.addEventListener('click', () => previewDialog?.close());

previewDialog?.addEventListener('click', event => {
  if (event.target === previewDialog) previewDialog.close();
});

const sectionLinks = [...document.querySelectorAll('.main-nav a')];
const observedSections = sectionLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && observedSections.length) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sectionLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: [0.05, 0.2, 0.5] });

  observedSections.forEach(section => observer.observe(section));
}
