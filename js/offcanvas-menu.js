(() => {
  const script = document.currentScript;
  const root = new URL('../', script.src);
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('css/offcanvas-menu.css?v=2', root).href;
  document.head.append(stylesheet);
  const header = document.querySelector('.header-inner, .section-header-inner, .site-header .shell');
  if (!header || document.getElementById('hubMenu')) return;
  const items = [
    ['Періодична система', 'periodic-table/', '▦', '#7653ff'],
    ['Віртуальна лабораторія', 'virtual-lab/', '⚗', '#159d90'],
    ['Хімічні розрахунки', 'calculations/', 'Σ', '#367df0'],
    ['Розчинність і йонні реакції', 'ionic-reactions/', '⇄', '#6eaa20'],
    ['Тренажери', 'trainers/', '◆', '#ca4bb3'],
    ['Корисні ресурси', 'resources/', '▤', '#ba7a22'],
    ['Від формули до життя', 'formula-to-life/', '⚛', '#7653ff']
  ];
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'hub-menu-trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'hubMenu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = '<span aria-hidden="true">☰</span><span>Меню</span>';
  const actions = header.querySelector('[class$="header-actions"], .header-actions');
  if (actions) actions.prepend(trigger);
  else header.insertBefore(trigger, header.querySelector('.theme-toggle'));
  const dialog = document.createElement('dialog');
  dialog.id = 'hubMenu';
  dialog.className = 'hub-menu-dialog';
  dialog.setAttribute('aria-labelledby', 'hubMenuTitle');
  dialog.innerHTML = '<div class="hub-menu-heading"><h2 id="hubMenuTitle">Меню</h2><button type="button" class="hub-menu-close" aria-label="Закрити меню" autofocus>×</button></div><nav class="hub-menu-links" aria-label="Розділи Chemistry Learning Hub"></nav>';
  const nav = dialog.querySelector('nav');
  for (const [title, path, icon, color] of items) {
    const link = document.createElement('a');
    const url = new URL(path, root);
    link.href = url.href;
    link.className = 'hub-menu-link';
    link.style.setProperty('--menu-accent', color);
    const mark = document.createElement('span');
    mark.className = 'hub-menu-icon';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = icon;
    const label = document.createElement('span');
    label.textContent = title;
    link.append(mark, label);
    if (location.pathname.startsWith(url.pathname)) link.setAttribute('aria-current', 'page');
    nav.append(link);
  }
  document.body.append(dialog);
  const close = () => dialog.close();
  trigger.addEventListener('click', () => {
    dialog.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('hub-menu-open');
  });
  dialog.querySelector('button').addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
    if (event.target.closest('a')) close();
  });
  dialog.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('hub-menu-open');
    trigger.focus();
  });
})();
