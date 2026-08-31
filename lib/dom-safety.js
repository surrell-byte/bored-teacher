function sanitizeText(value) {
  return String(value ?? '').replace(/[<>&]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;'
  }[char] || char));
}

function setText(node, value) {
  if (!node) return;
  node.textContent = String(value ?? '');
}

module.exports = { sanitizeText, setText };
