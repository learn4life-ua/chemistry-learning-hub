export function setupCalculationTabs({ lead, orb } = {}) {
  const nav = document.querySelector('.calc-tool-nav');
  if (!nav) return;

  if (lead) {
    const leadNode = document.querySelector('.calc-category-hero p');
    if (leadNode) leadNode.textContent = lead;
  }
  if (orb) {
    const orbNode = document.querySelector('.formula-orb span');
    if (orbNode) orbNode.textContent = orb;
  }

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const items = links
    .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(item => item.section);

  if (!items.length) return;

  const activate = id => {
    const target = items.some(item => item.section.id === id) ? id : items[0].section.id;

    items.forEach(({ link, section }) => {
      const active = section.id === target;
      section.hidden = !active;
      link.classList.toggle('is-active', active);
      link.setAttribute('aria-current', active ? 'true' : 'false');
    });

    if (location.hash !== `#${target}`) {
      history.replaceState(null, '', `#${target}`);
    }
  };

  nav.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!items.some(item => item.section.id === id)) return;
    event.preventDefault();
    activate(id);
    window.scrollTo({ top: document.querySelector('.calc-tool-tabs')?.offsetTop || 0, behavior: 'smooth' });
  });

  window.addEventListener('hashchange', () => activate(location.hash.slice(1)));
  activate(location.hash.slice(1));
}
