(() => {
  const filters = document.querySelector('#lifeFilters');
  const cards = [...document.querySelectorAll('[data-direction]')];
  const count = document.querySelector('#lifeCount');
  if (!filters || !count || !cards.length) return;

  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !filters.contains(button)) return;
    const direction = button.dataset.filter;
    filters.querySelectorAll('button').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    let visible = 0;
    cards.forEach(card => {
      card.hidden = direction !== 'all' && card.dataset.direction !== direction;
      if (!card.hidden) visible += 1;
    });
    count.textContent = `Матеріалів: ${visible}`;
  });
})();
