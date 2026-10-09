const root = document.documentElement;
const themeToggle = document.querySelector('#themeToggle');
const themeLabel = themeToggle?.querySelector('.theme-label');
const themeIcon = themeToggle?.querySelector('.theme-icon');
const previewDialog = document.querySelector('#previewDialog');
const previewContent = document.querySelector('#previewContent');

const previews = {
  lab: {
    title: 'Віртуальна лабораторія',
    text: 'Контрольовані навчальні симуляції з видимими ознаками реакцій і короткими поясненнями.',
    items: ['осадження', 'нейтралізація', 'pH та індикатори', 'спостереження за перебігом реакції', 'лабораторний звіт']
  },
  calc: {
    title: 'Хімічні розрахунки',
    text: 'Розрахунки з перевіркою формули, одиниць і логіки розв’язання.',
    items: ['молярна маса', 'кількість речовини', 'молярна концентрація', 'масова частка', 'газові розрахунки із заданими умовами']
  },
  ionic: {
    title: 'Розчинність і йонні реакції',
    text: 'Інтерактивна робота з розчинністю та різними формами запису реакцій.',
    items: ['катіони й аніони', 'осади', 'молекулярне рівняння', 'повне йонне рівняння', 'скорочене йонне рівняння']
  },
  trainer: {
    title: 'Тренажери',
    text: 'Самоперевірка без рейтингу та без збереження персональних результатів.',
    items: ['короткі завдання', 'миттєва перевірка', 'пояснення відповіді', 'повторення без оцінки']
  },
  guide: {
    title: 'Довідник',
    text: 'Короткі пояснення, правила, приклади та підказки з основних тем хімії.',
    items: ['Періодичний закон', 'електронна будова', 'ступені окиснення', 'класи сполук', 'розчини та pH']
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
    <p class="eyebrow">Скоро у хабі</p>
    <h2>${preview.title}</h2>
    <p>${preview.text}</p>
    <ul>${preview.items.map(item => `<li>${item}</li>`).join('')}</ul>
  `;
  previewDialog.showModal();
}

document.querySelectorAll('[data-preview]').forEach(button => {
  button.addEventListener('click', () => openPreview(button.dataset.preview));
});

document.querySelectorAll('[data-card-preview]').forEach(card => {
  const activate = () => openPreview(card.dataset.cardPreview);
  card.addEventListener('click', activate);
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });
});

document.querySelector('[data-dialog-close]')?.addEventListener('click', () => previewDialog?.close());
previewDialog?.addEventListener('click', event => {
  if (event.target === previewDialog) previewDialog.close();
});

const atomExamples = {
  H: { number: 1, name: 'Гідроген', shells: [1] },
  C: { number: 6, name: 'Карбон', shells: [2, 4] },
  O: { number: 8, name: 'Оксиген', shells: [2, 6] },
  Na: { number: 11, name: 'Натрій', shells: [2, 8, 1] },
  Cl: { number: 17, name: 'Хлор', shells: [2, 8, 7] }
};

const canvas = document.querySelector('#heroAtomCanvas');
const ctx = canvas?.getContext('2d');
const atomNumber = document.querySelector('#heroAtomNumber');
const atomSymbol = document.querySelector('#heroAtomSymbol');
const atomName = document.querySelector('#heroAtomName');
const atomPause = document.querySelector('#atomPause');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let currentAtom = 'O';
let paused = reducedMotion.matches;
let animationId = null;
let startTime = performance.now();

function syncPauseButton() {
  if (!atomPause) return;
  const label = paused ? 'Продовжити анімацію' : 'Призупинити анімацію';
  atomPause.setAttribute('aria-pressed', String(paused));
  atomPause.setAttribute('aria-label', label);
  atomPause.setAttribute('title', label);
  atomPause.textContent = paused ? '▶' : 'Ⅱ';
}

function setAtom(symbol) {
  const atom = atomExamples[symbol];
  if (!atom) return;
  currentAtom = symbol;
  if (atomNumber) atomNumber.textContent = atom.number;
  if (atomSymbol) atomSymbol.textContent = symbol;
  if (atomName) atomName.textContent = atom.name;
  document.querySelectorAll('[data-atom]').forEach(button => {
    button.classList.toggle('is-active', button.dataset.atom === symbol);
  });
  drawAtom(performance.now());
}

function drawAtom(now) {
  if (!ctx || !canvas) return;
  const atom = atomExamples[currentAtom];
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const t = (now - startTime) / 1000;
  const isDark = root.dataset.theme === 'dark';

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(cx, cy);

  atom.shells.forEach((electronCount, shellIndex) => {
    const radius = 58 + shellIndex * 41;
    const rx = radius * 1.18;
    const ry = radius * .58;
    const rotations = [0.06, .58, -.66];
    const rot = rotations[shellIndex] ?? shellIndex * .42;

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, rot, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(165,146,255,.28)' : 'rgba(104,78,238,.20)';
    ctx.lineWidth = 1.25;
    ctx.stroke();

    for (let i = 0; i < electronCount; i += 1) {
      const angle = (Math.PI * 2 * i / electronCount) + (paused ? 0 : t * (.55 + shellIndex * .13)) + shellIndex * .45;
      const x0 = Math.cos(angle) * rx;
      const y0 = Math.sin(angle) * ry;
      const x = x0 * Math.cos(rot) - y0 * Math.sin(rot);
      const y = x0 * Math.sin(rot) + y0 * Math.cos(rot);

      ctx.beginPath();
      ctx.arc(x, y, 4.9, 0, Math.PI * 2);
      ctx.fillStyle = shellIndex % 2 ? '#7c5cff' : '#39bfe5';
      ctx.shadowBlur = 7;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });

  ctx.restore();
}

function animate(now) {
  drawAtom(now);
  if (!paused && !document.hidden) animationId = requestAnimationFrame(animate);
}

function restartAnimation() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  drawAtom(performance.now());
  if (!paused && !document.hidden) animationId = requestAnimationFrame(animate);
}

document.querySelectorAll('[data-atom]').forEach(button => {
  button.addEventListener('click', () => setAtom(button.dataset.atom));
});

atomPause?.addEventListener('click', () => {
  paused = !paused;
  syncPauseButton();
  restartAnimation();
});

document.addEventListener('visibilitychange', restartAnimation);
reducedMotion.addEventListener?.('change', event => {
  if (event.matches) paused = true;
  syncPauseButton();
  restartAnimation();
});

syncPauseButton();
setAtom(currentAtom);
restartAnimation();
