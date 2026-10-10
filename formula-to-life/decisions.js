(() => {
  const explanations = {"water": ["Піна сама по собі не визначає безпечність води. На неї впливають склад мила, його кількість і умови порівняння.", "Це дає змогу відокремити спостереження від припущення: однакові умови зменшують вплив сторонніх чинників, а тест дає вимірюваний результат.", "Розчинені йони можуть бути невидимими. Прозорість не показує вмісту кальцію й магнію."], "rust": ["Миття не відновлює захисного бар’єра. Вода й кисень можуть і далі контактувати із залізом.", "Захисний шар обмежує доступ води й кисню. Для конкретного способу обробки важливі матеріал поверхні та інструкція виробника покриття.", "Доступ кисню разом із вологою підтримує умови для іржавіння. Відкрита поверхня не має такого бар’єра, як неушкоджене покриття."], "sugar": ["Таке порівняння все ще змішує вплив температури й перемішування. Воно не дає змоги відокремити один чинник.", "Однакові порції цукру, об’єми води, посуд і перемішування роблять порівняння коректнішим. Записуй час і повторюй спостереження.", "Час розчинення та розчинність - різні характеристики. Навіть якщо порція розчинилася швидше, це не визначає максимальної кількості речовини."]};
  document.querySelectorAll('.life-decision').forEach(form => {
    const feedback = form.querySelector('.life-feedback');
    const clear = () => { feedback.hidden = true; feedback.textContent = ''; };
    form.addEventListener('change', clear);
    form.addEventListener('reset', clear);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const selected = form.querySelector('input:checked');
      if (!selected) { form.reportValidity(); return; }
      const explanation = explanations[form.dataset.scenario]?.[Number(selected.value)];
      if (!explanation) return;
      feedback.textContent = explanation;
      feedback.hidden = false;
    });
  });
})();
