const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getWelcomeGiftChoices,
} = require('./email-verification.js');

test('welcome gift choices returns the three shop avatars', () => {
  assert.deepEqual(getWelcomeGiftChoices(), ['avatar-astronaut', 'avatar-dragon', 'avatar-unicorn']);
});
