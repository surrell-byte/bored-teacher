const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('optional email preferences default to opt-out and persist through profiles', () => {
  const firebase = read('lib/firebase.ts');
  const provider = read('providers/GameProvider.tsx');
  const profile = read('app/profile/page.tsx');
  const rules = read('firestore.rules');

  assert.match(firebase, /emailPreferences: \{ productUpdates: false, learningTips: false \}/);
  assert.match(firebase, /'emailPreferences'/);
  assert.match(provider, /emailPreferences: \{ productUpdates: false, learningTips: false \}/);
  assert.match(provider, /typeof value\.emailPreferences\?\.productUpdates === 'boolean'/);
  assert.match(provider, /typeof value\.emailPreferences\?\.learningTips === 'boolean'/);
  assert.match(provider, /remote\.emailPreferences\?\.productUpdates \?\? local\.emailPreferences\.productUpdates/);
  assert.match(provider, /remote\.emailPreferences\?\.learningTips \?\? local\.emailPreferences\.learningTips/);
  assert.match(profile, /checked=\{emailPreferences\.productUpdates\}/);
  assert.match(profile, /checked=\{emailPreferences\.learningTips\}/);
  assert.match(profile, /Optional email campaigns are not currently being sent/);
  assert.match(profile, /verification, password reset, and other necessary service emails are unaffected/);
  assert.match(profile, /setState\(\{ name: name\.trim\(\), username: cleanUsername, avatar, emailPreferences \}\)/);
  assert.match(rules, /'emailPreferences', 'isActive', 'updatedAt'/);
  assert.match(rules, /request\.resource\.data\.emailPreferences\.productUpdates is bool/);
  assert.match(rules, /request\.resource\.data\.emailPreferences\.learningTips is bool/);
});
