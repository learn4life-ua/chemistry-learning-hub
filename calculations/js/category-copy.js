export function cleanCategoryCopy(label) {
  document.querySelectorAll('.tool-section-heading .eyebrow').forEach(node => {
    if (/^Інструмент\s+\d+$/i.test(node.textContent.trim())) {
      node.textContent = label;
    }
  });
}
