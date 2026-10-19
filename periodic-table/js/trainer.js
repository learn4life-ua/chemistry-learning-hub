import { topics, makeRound, shuffle } from './learning-data.js?v=1';

export function initTrainer() {
  const root = document.querySelector('#trainerApp');
  if (!root) return;
  let topic = 'mixed', limit = 20, round = [], index = 0, results = [], answered = false, assisted = false;
  function setup(focus = false) {
    root.innerHTML = `<div class="trainer-intro"><p class="eyebrow">Крок за кроком</p><h2 tabindex="-1">Оберіть своє тренування</h2><p>10 завдань із поясненнями. Без таймера, оцінок і реєстрації — помилки допомагають навчатися.</p></div>
      <div class="trainer-settings"><label class="learning-field">Тема<select id="trainerTopic">${Object.entries(topics).map(([key, text]) => `<option value="${key}"${key === topic ? ' selected' : ''}>${text}</option>`).join('')}</select></label><label class="learning-field">Набір елементів<select id="trainerLevel"><option value="20"${limit === 20 ? ' selected' : ''}>Базовий · перші 20</option><option value="54"${limit === 54 ? ' selected' : ''}>Розширений · перші 54</option></select></label></div>
      <p class="learning-note">Змішана серія містить по два завдання з кожної теми. Закономірності вивчаємо на дібраних прикладах елементів головних груп.</p><button type="button" class="learning-button" data-trainer-action="start">Почати тренування →</button>`;
    if (focus) root.querySelector('h2').focus();
  }
  function start(questions) {
    round = questions; index = 0; results = []; showQuestion();
  }
  function showQuestion() {
    answered = false; assisted = false;
    const q = round[index];
    root.innerHTML = `<div class="trainer-progress"><span>Завдання ${index + 1} із ${round.length}</span><span>${topics[q.topic]}</span></div><progress value="${index}" max="${round.length}" aria-label="Виконано завдань"></progress>
      <h2 class="trainer-question" tabindex="-1">${q.prompt}</h2><div class="trainer-options" role="group" aria-label="Варіанти відповіді">${q.options.map((text, i) => `<button type="button" class="trainer-option" data-answer="${i}"><span aria-hidden="true">${i + 1}</span>${text}</button>`).join('')}</div>
      <div id="trainerFeedback" class="trainer-feedback" role="status" aria-live="polite"></div><div class="trainer-actions"><button type="button" class="learning-button secondary" data-trainer-action="hint">Підказка</button><button type="button" class="learning-button secondary" data-trainer-action="skip">Показати відповідь</button><button type="button" class="learning-button" data-trainer-action="next" hidden>${index + 1 === round.length ? 'Підсумок' : 'Далі →'}</button></div>`;
    root.querySelector('h2').focus();
  }
  function answer(choice) {
    if (answered) return;
    answered = true;
    const q = round[index];
    const correct = choice === q.answer;
    results.push({ question: q, choice, correct, assisted });
    root.querySelectorAll('[data-answer]').forEach(button => {
      const value = q.options[Number(button.dataset.answer)];
      button.disabled = true;
      if (value === q.answer) { button.classList.add('is-correct'); button.insertAdjacentHTML('beforeend', '<b aria-label="Правильна відповідь"> ✓</b>'); }
      else if (value === choice) { button.classList.add('is-incorrect'); button.insertAdjacentHTML('beforeend', '<b aria-label="Неправильна відповідь"> ✕</b>'); }
    });
    root.querySelector('#trainerFeedback').innerHTML = `<strong>${choice === null ? 'Розберімо відповідь' : correct ? 'Правильно!' : 'Спробуйте запам’ятати пояснення'}</strong><p>${q.explanation}</p>${assisted && correct ? '<small>Відповідь із підказкою — окремо від самостійних відповідей.</small>' : ''}`;
    root.querySelector('[data-trainer-action="hint"]').hidden = true;
    root.querySelector('[data-trainer-action="skip"]').hidden = true;
    const next = root.querySelector('[data-trainer-action="next"]');
    next.hidden = false; next.focus();
  }
  function finish() {
    const independent = results.filter(r => r.correct && !r.assisted).length;
    const helped = results.filter(r => r.correct && r.assisted).length;
    const mistakes = results.filter(r => !r.correct);
    root.innerHTML = `<p class="eyebrow">Серію завершено</p><h2 tabindex="-1">Кожна спроба — крок уперед</h2><div class="trainer-score"><strong>${independent} / ${round.length}</strong><span>правильно з першої спроби без підказки</span></div><p>Із підказкою: ${helped}. Для повторення: ${mistakes.length}.</p>
      ${mistakes.length ? `<h3>Розбір помилок і пропущених завдань</h3><div class="trainer-review">${mistakes.map(r => `<details><summary>${r.question.prompt}</summary><p>Ваша відповідь: <strong>${r.choice ?? 'Відповідь переглянуто'}</strong></p><p>${r.question.explanation}</p></details>`).join('')}</div>` : '<p class="learning-note">Усі відповіді правильні. Можна обрати іншу тему або розширений набір.</p>'}
      <div class="trainer-actions">${mistakes.length ? '<button type="button" class="learning-button" data-trainer-action="retry">Повторити помилки</button>' : ''}<button type="button" class="learning-button secondary" data-trainer-action="again">Ще 10 завдань</button><button type="button" class="learning-button secondary" data-trainer-action="setup">Змінити тему</button></div>`;
    root.querySelector('h2').focus();
  }
  root.addEventListener('change', event => {
    if (event.target.id === 'trainerTopic') topic = event.target.value;
    if (event.target.id === 'trainerLevel') limit = Number(event.target.value);
  });
  root.addEventListener('click', event => {
    const option = event.target.closest('[data-answer]');
    if (option) { answer(round[index].options[Number(option.dataset.answer)]); return; }
    const action = event.target.closest('[data-trainer-action]')?.dataset.trainerAction;
    if (action === 'start' || action === 'again') start(makeRound(topic, limit));
    if (action === 'hint' && !answered) {
      assisted = true;
      root.querySelector('#trainerFeedback').textContent = round[index].hint;
      root.querySelector('[data-trainer-action="hint"]').disabled = true;
    }
    if (action === 'skip') answer(null);
    if (action === 'next' && answered) { index++; index < round.length ? showQuestion() : finish(); }
    if (action === 'retry') start(shuffle(results.filter(r => !r.correct).map(r => ({ ...r.question, options: shuffle(r.question.options) }))));
    if (action === 'setup') setup(true);
  });
  setup();
}
