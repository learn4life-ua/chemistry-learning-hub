(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('#themeToggle');
  const themeLabel = themeToggle?.querySelector('.theme-label');
  const themeIcon = themeToggle?.querySelector('.theme-icon');

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

  window.addEventListener('storage', event => {
    if (event.key === 'chemistry-hub-theme') applyTheme(resolveInitialTheme());
  });

  // In the “Від формули до життя” section, keep only one explanation open at a time.
  const lifeDetails = [...document.querySelectorAll('.life-page .life-details')];
  lifeDetails.forEach(details => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      lifeDetails.forEach(other => {
        if (other !== details && other.open) other.open = false;
      });
    });
  });
})();

// Shared navigation for every hub page.
(() => {
  const url = new URL("offcanvas-menu.js?v=2", document.currentScript.src);
  const script = document.createElement("script");
  script.src = url.href;
  document.head.append(script);
})();
