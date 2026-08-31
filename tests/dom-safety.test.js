const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeText, setText } = require('../lib/dom-safety.js');

test('sanitizeText escapes HTML-sensitive characters', () => {
  assert.equal(sanitizeText('<script>alert(1)</script>&'), '&lt;script&gt;alert(1)&lt;/script&gt;&amp;');
});

test('setText writes plain text without HTML injection', () => {
  const node = { textContent: '' };
  setText(node, '<img src=x onerror=alert(1)>');
  assert.equal(node.textContent, '<img src=x onerror=alert(1)>');
});
