const printButton = document.getElementById('printJournal');
const clearButton = document.getElementById('clearJournal');
const fields = [...document.querySelectorAll('.journal-sheet input, .journal-sheet textarea')];

printButton.addEventListener('click', () => window.print());

clearButton.addEventListener('click', () => {
  fields.forEach(field => {
    field.value = '';
  });
});
