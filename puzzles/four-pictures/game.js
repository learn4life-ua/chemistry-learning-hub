(() => {
  'use strict';
  const tasks = [
    { word: 'ВОДА', files: ['water_drop', 'water_snow', 'water_ice', 'water_lake'],
      alts: ['Прозора крапля на світлій поверхні', 'Свіжий білий сніг', 'Прозорі кубики льоду', 'Спокійне чисте озеро'],
      hint: 'Речовина з формулою H₂O.', fact: 'Крапля й озеро - рідка вода, а сніг і лід - вода у твердому стані.' },
    { word: 'ВУГЛЕЦЬ', files: ['carbon_diamond', 'carbon_graphite', 'carbon_coal', 'carbon_charcoal'],
      alts: ['Прозорий огранований алмаз', 'Темно-сірий графітовий стрижень', 'Шматки кам’яного вугілля', 'Пористі шматки деревного вугілля'],
      hint: 'Хімічний елемент із символом C.', fact: 'Алмаз і графіт - алотропні форми вуглецю. Кам’яне та деревне вугілля містять багато вуглецю, але не є чистими речовинами.' },
    { word: 'ЗАЛІЗО', files: ['iron_nail', 'iron_horseshoe', 'iron_chain', 'iron_rust'],
      alts: ['Металевий цвях', 'Металева підкова', 'Короткий металевий ланцюг', 'Болт з оранжево-бурою іржею'],
      hint: 'Метал із символом Fe.', fact: 'Цвяхи, підкови й ланцюги часто виготовляють зі сталі - сплаву на основі заліза. Іржа утворюється під час корозії заліза за участю води та кисню.' },
    { word: 'СКЛО', files: ['glass_window', 'glass_flask', 'glass_bottle', 'glass_beaker'],
      alts: ['Віконна шибка з відблисками', 'Прозора лабораторна колба', 'Порожня прозора пляшка', 'Порожня прозора склянка'],
      hint: 'Прозорий крихкий матеріал, із якого виготовляють ці предмети.', fact: 'Віконні шибки, колби, пляшки й склянки виготовляють зі скла. Звичайне скло - неорганічний аморфний матеріал.' },
    { word: 'СІЛЬ', files: ['salt_crystals', 'salt_shaker', 'salt_sea_salt', 'salt_rock_salt'],
      alts: ['Купка білих кристалів', 'Сільничка з білими кристалами', 'Великі білі кристали в мисочці', 'Світлі шматки мінералу галіту'],
      hint: 'У побуті так називають хлорид натрію, NaCl.', fact: 'Кухонна, морська й кам’яна сіль складаються переважно із хлориду натрію. Природний мінерал NaCl називають галітом.' },
    { word: 'РОЗЧИН', files: ['solution_sugar_water', 'solution_salt_water', 'solution_blue_lab', 'solution_effervescent'],
      alts: ['Цукор розчиняють у воді, перемішуючи ложкою', 'Безбарвна рідина в лабораторній склянці', 'Однорідна синя рідина в лабораторній склянці', 'Шипуча таблетка у воді з бульбашками газу'],
      hint: 'Однорідна суміш розчинника й розчинених речовин.', fact: 'Цукор і сіль утворюють у воді розчини. Однорідна синя рідина - теж розчин. Шипуча таблетка розчиняється й реагує у воді з виділенням газу; після завершення процесу залишається розчин.' }
  ];
  const $ = id => document.getElementById(id);
  const input = $('extraInput'), visual = $('extraVisual'), feedback = $('extraFeedback');
  const states = tasks.map(() => ({ answer: '', solved: false, hinted: false }));
  let index = 0;
  const normalize = text => text.normalize('NFC').trim().toLocaleUpperCase('uk-UA');
  const score = () => states.filter(state => state.solved).length;
  function message(text, mood = '') {
    feedback.textContent = text;
    feedback.className = 'game-feedback' + (mood ? ' is-' + mood : '');
  }
  function render(focus = false) {
    const task = tasks[index], state = states[index];
    $('extraCounter').textContent = `Завдання ${index + 1} із ${tasks.length}`;
    $('extraScore').textContent = `Розгадано ${score()} із ${tasks.length}`;
    $('fourProgress').value = score();
    $('fourProgress').textContent = `${score()} із ${tasks.length}`;
    $('extraInput').value = state.solved ? task.word : state.answer;
    input.disabled = state.solved;
    input.removeAttribute('aria-invalid');
    $('extraCheck').disabled = state.solved;
    $('extraHint').disabled = state.solved || state.hinted;
    $('extraPrev').disabled = index === 0;
    $('extraNext').disabled = index === tasks.length - 1;
    $('fourWordLength').textContent = `${task.word.length} ${task.word.length === 4 ? 'літери' : 'літер'}`;
    visual.replaceChildren();
    task.files.forEach((file, pictureIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'four-photo';
      button.setAttribute('aria-label', `Збільшити фото ${pictureIndex + 1}: ${task.alts[pictureIndex]}`);
      const img = document.createElement('img');
      img.src = `./images/${file}.webp`;
      img.alt = task.alts[pictureIndex];
      img.width = 800; img.height = 800; img.decoding = 'async';
      button.append(img);
      const zoom = document.createElement('span');
      zoom.className = 'four-zoom'; zoom.textContent = '⤢'; zoom.setAttribute('aria-hidden', 'true');
      button.append(zoom);
      button.addEventListener('click', () => {
        $('fourLargeImage').src = img.src;
        $('fourLargeImage').alt = img.alt;
        $('fourImageCaption').textContent = img.alt;
        $('fourImageDialog').showModal();
      });
      visual.append(button);
    });
    [...$('fourSteps').children].forEach((button, i) => {
      button.classList.toggle('is-current', i === index);
      button.classList.toggle('is-complete', states[i].solved);
      button.setAttribute('aria-label', `Завдання ${i + 1}${states[i].solved ? ', розгадано' : ''}`);
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    if (state.solved) message(`Правильно: ${task.word}. ${task.fact}`, 'success');
    else if (state.hinted) message(`Підказка: ${task.hint}`);
    else message('Що спільного між цими чотирма фотографіями?');
    $('fourCompletion').hidden = score() !== tasks.length;
    if (focus) {
      if (!state.solved) input.focus({ preventScroll: true });
      else $('fourSteps').children[index].focus({ preventScroll: true });
    }
  }
  function goTo(nextIndex) {
    states[index].answer = input.value;
    index = nextIndex;
    render();
  }
  tasks.forEach((task, i) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'picture-step'; button.textContent = i + 1;
    button.addEventListener('click', () => goTo(i));
    $('fourSteps').append(button);
  });
  $('fourAnswerForm').addEventListener('submit', event => {
    event.preventDefault();
    if (states[index].solved) return;
    states[index].answer = input.value;
    if (!normalize(input.value)) {
      message('Спочатку введіть спільне слово.', 'error');
      input.setAttribute('aria-invalid', 'true'); input.focus(); return;
    }
    if (normalize(input.value) === tasks[index].word) {
      states[index].solved = true;
      render();
      if (score() === tasks.length) $('fourRestart').focus({ preventScroll: true });
      else $('extraNext').disabled ? $('fourSteps').children[states.findIndex(state => !state.solved)].focus({ preventScroll: true }) : $('extraNext').focus({ preventScroll: true });
    } else {
      message('Спробуйте ще раз. Подумайте про речовину, матеріал або тип суміші, що об’єднує фото.', 'error');
      input.setAttribute('aria-invalid', 'true'); input.focus();
    }
  });
  input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
  $('extraHint').addEventListener('click', () => {
    states[index].hinted = true; $('extraHint').disabled = true;
    message(`Підказка: ${tasks[index].hint}`);
  });
  $('extraPrev').addEventListener('click', () => { if (index > 0) goTo(index - 1); });
  $('extraNext').addEventListener('click', () => { if (index < tasks.length - 1) goTo(index + 1); });
  $('fourRestart').addEventListener('click', () => {
    states.forEach(state => { state.answer = ''; state.solved = false; state.hinted = false; });
    index = 0; render(true);
  });
  $('fourCloseImage').addEventListener('click', () => $('fourImageDialog').close());
  $('fourImageDialog').addEventListener('click', event => {
    if (event.target === $('fourImageDialog')) {
      const box = event.target.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) event.target.close();
    }
  });
  render();
})();

