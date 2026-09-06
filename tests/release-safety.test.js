const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('production builds require environment and catalog checks', () => {
  assert.match(packageJson.scripts.build, /check-env/);
  assert.match(packageJson.scripts.build, /check-games/);
  assert.match(packageJson.scripts.build, /npm test/);
});

test('Firestore rules protect subscription and account-control fields', () => {
  assert.match(rules, /affectedKeys\(\)\.hasOnly/);
  assert.doesNotMatch(rules, /affectedKeys\(\)[^\]]*'teacherPro'/);
  assert.match(rules, /allow delete: if request\.auth != null/);
});

test('payment access is not granted by the browser', () => {
  const payment = fs.readFileSync(path.join(root, 'app/payment/page.tsx'), 'utf8');
  const subscription = fs.readFileSync(path.join(root, 'app/subscription/page.tsx'), 'utf8');
  assert.doesNotMatch(payment, /setTeacherProAccess|teacherProAccess.*true/);
  assert.doesNotMatch(subscription, /setTeacherProAccess|teacherProAccess.*true/);
});
