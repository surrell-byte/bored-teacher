const test = require('node:test');
const assert = require('node:assert/strict');

const {
  generateVerificationCode,
  isVerificationExpired,
  getWelcomeGiftChoices,
} = require('./email-verification.js');

test('generateVerificationCode creates a six-digit code', () => {
  const code = generateVerificationCode();
  assert.equal(code.length, 6);
  assert.match(code, /^\d{6}$/);
});

test('verification expires after 48 hours', () => {
  const sentAt = Date.now() - (48 * 60 * 60 * 1000 + 1000);
  assert.equal(isVerificationExpired(sentAt), true);
  assert.equal(isVerificationExpired(Date.now()), false);
});

test('welcome gift choices returns the three shop avatars', () => {
  assert.deepEqual(getWelcomeGiftChoices(), ['avatar-astronaut', 'avatar-dragon', 'avatar-unicorn']);
});
