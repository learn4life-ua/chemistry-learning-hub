const root = document.documentElement;
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
let animationTime = 0;
let lastAnimationTimestamp = performance.now();

function syncPauseButton() {
  if (!atomPause) return;
  const label = paused ? 'Продовжити анімацію' : 'Призупинити анімацію';
  atomPause.setAttribute('aria-pressed', String(paused));
  atomPause.setAttribute('aria-label', label);
  atomPause.setAttribute('title', label);
  atomPause.textContent = paused ? '▶' : '⏸';
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
  const isDark = root.dataset.theme === 'dark';

  if (!paused) {
    animationTime += Math.max(0, now - lastAnimationTimestamp) / 1000;
  }
  lastAnimationTimestamp = now;
  const t = animationTime;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(cx, cy);

  const ambientGlow = ctx.createRadialGradient(0, 0, 14, 0, 0, 98);
  if (isDark) {
    ambientGlow.addColorStop(0, 'rgba(136, 118, 255, .15)');
    ambientGlow.addColorStop(.38, 'rgba(71, 190, 255, .085)');
    ambientGlow.addColorStop(1, 'rgba(71, 190, 255, 0)');
  } else {
    ambientGlow.addColorStop(0, 'rgba(116, 98, 255, .12)');
    ambientGlow.addColorStop(.38, 'rgba(58, 191, 229, .065)');
    ambientGlow.addColorStop(1, 'rgba(58, 191, 229, 0)');
  }
  ctx.beginPath();
  ctx.arc(0, 0, 96, 0, Math.PI * 2);
  ctx.fillStyle = ambientGlow;
  ctx.fill();

  atom.shells.forEach((electronCount, shellIndex) => {
    const radius = 60 + shellIndex * 43;
    const rx = radius * 1.18;
    const ry = radius * .58;
    const rotations = [0.06, .58, -.66];
    const rot = rotations[shellIndex] ?? shellIndex * .42;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, rot, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(163, 147, 255, .10)' : 'rgba(94, 79, 205, .08)';
    ctx.lineWidth = 3.4;
    ctx.shadowBlur = 9;
    ctx.shadowColor = isDark ? 'rgba(108, 193, 255, .13)' : 'rgba(107, 87, 238, .10)';
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, rot, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(183, 171, 255, .30)' : 'rgba(102, 85, 220, .21)';
    ctx.lineWidth = 1.05;
    ctx.stroke();

    for (let i = 0; i < electronCount; i += 1) {
      const angle = (Math.PI * 2 * i / electronCount) + t * (.55 + shellIndex * .13) + shellIndex * .45;
      const x0 = Math.cos(angle) * rx;
      const y0 = Math.sin(angle) * ry;
      const x = x0 * Math.cos(rot) - y0 * Math.sin(rot);
      const y = x0 * Math.sin(rot) + y0 * Math.cos(rot);

      const electronGradient = ctx.createRadialGradient(x - 1.2, y - 1.4, .5, x, y, 5.2);
      if (shellIndex % 2) {
        electronGradient.addColorStop(0, '#b7a9ff');
        electronGradient.addColorStop(.35, '#8e79ff');
        electronGradient.addColorStop(1, '#654df0');
      } else {
        electronGradient.addColorStop(0, '#c5f6ff');
        electronGradient.addColorStop(.35, '#67d8ef');
        electronGradient.addColorStop(1, '#2fa9d3');
      }

      ctx.beginPath();
      ctx.arc(x, y, 4.7, 0, Math.PI * 2);
      ctx.fillStyle = electronGradient;
      ctx.shadowBlur = 8;
      ctx.shadowColor = shellIndex % 2 ? 'rgba(124, 92, 255, .55)' : 'rgba(57, 191, 229, .55)';
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
  const now = performance.now();
  lastAnimationTimestamp = now;
  drawAtom(now);
  if (!paused && !document.hidden) animationId = requestAnimationFrame(animate);
}

document.querySelectorAll('[data-atom]').forEach(button => {
  button.addEventListener('click', () => setAtom(button.dataset.atom));
});

atomPause?.addEventListener('click', () => {
  const now = performance.now();

  if (!paused) {
    drawAtom(now);
    paused = true;
  } else {
    paused = false;
    lastAnimationTimestamp = now;
  }

  syncPauseButton();
  restartAnimation();
});

document.addEventListener('visibilitychange', () => {
  lastAnimationTimestamp = performance.now();
  restartAnimation();
});

reducedMotion.addEventListener?.('change', event => {
  if (event.matches && !paused) {
    drawAtom(performance.now());
    paused = true;
  }
  lastAnimationTimestamp = performance.now();
  syncPauseButton();
  restartAnimation();
});

syncPauseButton();
setAtom(currentAtom);
restartAnimation();
