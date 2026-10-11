const printButton = document.getElementById('printJournal');
const clearButton = document.getElementById('clearJournal');
const copyButton = document.getElementById('copyJournal');
const addRowButton = document.getElementById('addJournalRow');
const tableBody = document.getElementById('journalTableBody');
const emptyNote = document.getElementById('journalEmptyNote');
const copyNote = document.getElementById('copyNote');
const studentName = document.getElementById('studentName');
const studentGroup = document.getElementById('studentGroup');
const journalDate = document.getElementById('journalDate');
const conclusion = document.getElementById('conclusionJournal');

function updateRowNumbers() {
  [...tableBody.rows].forEach((row, index) => {
    row.querySelector('.journal-row-number').textContent = String(index + 1);
  });
  emptyNote.hidden = tableBody.rows.length > 0;
}

function createJournalRow() {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="journal-row-number"></td>
    <td><textarea class="journal-cell-input journal-topic" rows="3" aria-label="Тема досліду" placeholder="Назва або тема"></textarea></td>
    <td><textarea class="journal-cell-input equation-input journal-equation" rows="3" aria-label="Хімізм або рівняння" placeholder="Рівняння реакції"></textarea></td>
    <td><textarea class="journal-cell-input journal-observation" rows="3" aria-label="Спостереження" placeholder="Колір, осад, газ, зміна температури тощо"></textarea></td>
    <td class="no-print"><button class="journal-remove-row" type="button" aria-label="Видалити рядок" title="Видалити рядок">×</button></td>
  `;
  row.querySelector('.journal-remove-row').addEventListener('click', () => {
    row.remove();
    updateRowNumbers();
  });
  tableBody.appendChild(row);
  updateRowNumbers();
  return row;
}

function clearJournal() {
  studentName.value = '';
  studentGroup.value = '';
  journalDate.value = '';
  conclusion.value = '';
  tableBody.innerHTML = '';
  copyNote.textContent = '';
  createJournalRow();
}

function buildJournalText() {
  const name = studentName.value.trim() || 'Не вказано';
  const group = studentGroup.value.trim() || 'Не вказано';
  const date = journalDate.value || 'Не вказано';
  const lines = [
    'ЛАБОРАТОРНИЙ ЖУРНАЛ — CHEMISTRY LEARNING HUB',
    `Здобувач освіти: ${name}`,
    `Група / клас: ${group}`,
    `Дата: ${date}`,
    '',
    'ДОСЛІДИ:'
  ];

  const rows = [...tableBody.rows];
  if (!rows.length) {
    lines.push('Записів немає.');
  } else {
    rows.forEach((row, index) => {
      const topic = row.querySelector('.journal-topic').value.trim() || 'Без назви';
      const equation = row.querySelector('.journal-equation').value.trim() || '—';
      const observation = row.querySelector('.journal-observation').value.trim() || '—';
      lines.push(`${index + 1}. ${topic}`);
      lines.push(`   Хімізм / рівняння: ${equation}`);
      lines.push(`   Спостереження: ${observation}`);
    });
  }

  lines.push('', 'ПІДСУМКОВИЙ ВИСНОВОК:', conclusion.value.trim() || '—');
  return lines.join('\n');
}

async function copyJournal() {
  const text = buildJournalText();
  try {
    await navigator.clipboard.writeText(text);
    copyNote.textContent = 'Текст журналу скопійовано.';
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
    copyNote.textContent = 'Текст журналу скопійовано.';
  }
}

function expandTextareasForPrint() {
  document.querySelectorAll('.journal-sheet textarea').forEach(area => {
    area.dataset.originalHeight = area.style.height;
    area.style.height = 'auto';
    area.style.height = `${area.scrollHeight}px`;
  });
}

function restoreTextareasAfterPrint() {
  document.querySelectorAll('.journal-sheet textarea').forEach(area => {
    area.style.height = area.dataset.originalHeight || '';
    delete area.dataset.originalHeight;
  });
}

addRowButton.addEventListener('click', () => {
  const row = createJournalRow();
  row.querySelector('.journal-topic').focus();
});

clearButton.addEventListener('click', clearJournal);
copyButton.addEventListener('click', copyJournal);
printButton.addEventListener('click', () => {
  expandTextareasForPrint();
  window.print();
  window.setTimeout(restoreTextareasAfterPrint, 300);
});

window.addEventListener('afterprint', restoreTextareasAfterPrint);

createJournalRow();
