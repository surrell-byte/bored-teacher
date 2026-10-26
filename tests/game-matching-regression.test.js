const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Weather Wizard includes a complete, playable month-picture matching level', () => {
  const component = read('games/weather-wizard/WeatherWizard.jsx');
  const monthData = component.match(/const MONTHS = \[([\s\S]*?)\n\];/);
  assert.ok(monthData, 'month data is declared');

  const months = [...monthData[1].matchAll(/\{ month: '([^']+)', icon: '([^']+)' \}/g)]
    .map(([, month, icon]) => ({ month, icon }));
  assert.deepEqual(months.map(({ month }) => month), [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]);
  assert.equal(months.length, 12);
  assert.ok(months.every(({ icon }) => icon.length > 0));
  assert.match(component, /title: 'Month Matcher', icon: '🗓️', type: 'matching', questions: MONTHS/);
  assert.match(component, /const createMonthCards = \(\) => shuffle\(MONTHS\.flatMap/);
  assert.match(component, /firstCard\?\.pair === card\.pair && firstCard\.type !== card\.type/);
  assert.match(component, /nextMatched\.length === current\.questions\.length/);
  assert.match(component, /className="ww-month-cards"/);
  assert.match(component, /aria-label=\{visible \? `\$\{card\.type === 'month' \? 'Month' : 'Picture'\}: \$\{card\.label\}` : 'Reveal a month or picture card'\}/);
});

test('Flagmaster adds a country-to-native-animal matching mission', () => {
  const component = read('games/flagmaster/Flagmaster.jsx');
  const matchesData = component.match(/const ANIMAL_MATCHES = \[([\s\S]*?)\n\];/);
  assert.ok(matchesData, 'animal match data is declared');

  const matches = [...matchesData[1].matchAll(/\{ code: "([A-Z]{2})", animal: "([^"]+)", animalEmoji: "([^"]+)" \}/g)]
    .map(([, code, animal]) => ({ code, animal }));
  assert.equal(matches.length, 8);
  assert.equal(new Set(matches.map(({ code }) => code)).size, matches.length);
  assert.deepEqual(matches, [
    { code: 'AU', animal: 'Koala' },
    { code: 'CN', animal: 'Giant panda' },
    { code: 'IN', animal: 'Bengal tiger' },
    { code: 'KE', animal: 'Giraffe' },
    { code: 'MG', animal: 'Ring-tailed lemur' },
    { code: 'CA', animal: 'Beaver' },
    { code: 'JP', animal: 'Japanese macaque' },
    { code: 'ZA', animal: 'Springbok' },
  ]);
  assert.match(component, /name: "Wildlife Match", icon:"🐾"[\s\S]*?mode:"animal-match"/);
  assert.match(component, /ANIMAL_MATCHES\.map\(match => \(\{ \.\.\.allCountries\.find/);
  const nodePositions = component.match(/const NODE_POSITIONS = \[([^\]]+)\];/);
  assert.ok(nodePositions, 'all mission nodes have map positions');
  assert.equal((nodePositions[1].match(/\{x:/g) || []).length, 9);
  assert.match(component, /pair\.code === animalCode/);
  assert.ok(component.includes('nextMatched.length === animalCountries.length'));
  assert.match(component, /className="fm-animal-match-columns"/);
  assert.match(component, /Select a country and the animal that lives there/);
});

test('Da Rules shows cover artwork in its full 4:3 frame without an overlay', () => {
  const rulesPage = read('app/games/da-rules/page.tsx');
  assert.match(rulesPage, /aspectRatio: '4 \/ 3',[\s\S]*?backgroundSize: 'contain'[\s\S]*?backgroundRepeat: 'no-repeat'/);
  assert.doesNotMatch(rulesPage, /background: 'linear-gradient\(180deg, rgba\(7,10,19,0\.15\), rgba\(7,10,19,0\.65\)\)'/);
  assert.match(rulesPage, /flagmaster: 'Match flags with countries, then match countries to animals that live there\.'/);
  assert.match(rulesPage, /weatherwizard: 'Learn weather words, seasons, and sentences, then match all 12 months to their pictures\.'/);
});
