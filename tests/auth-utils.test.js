const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { normalizeUsername, isValidUsername } = require('../lib/auth-utils.js');
const { estimateTeacherProRevenue, buildCreatorMonetisationSnapshot, buildCreatorRevenueTrend, buildCreatorConversionFunnel, buildCreatorCohortSummary } = require('../lib/monetisation-utils.js');

const read = relativePath => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('normalizeUsername strips spaces and lowercases', () => {
  assert.equal(normalizeUsername(' Tanya Chiraya '), 'tanyachiraya');
});

test('valid usernames accept dots, underscores and hyphens', () => {
  assert.equal(isValidUsername('tanya_chiraya'), true);
  assert.equal(isValidUsername('tanya.chiraya'), true);
  assert.equal(isValidUsername('tanya-chiraya'), true);
});

test('invalid usernames reject short or unsafe input', () => {
  assert.equal(isValidUsername('ta'), false);
  assert.equal(isValidUsername('bad name'), false);
  assert.equal(isValidUsername('bad@name'), false);
});

test('username email mappings are private and username login uses a custom token', () => {
  const rules = read('firestore.rules');
  const firebase = read('lib/firebase.ts');
  const authRoute = read('app/api/auth/route.ts');
  const usernameRules = rules.split('match /usernames/{username}')[1].split('match /feedback')[0];

  assert.match(usernameRules, /allow read: if false/);
  assert.doesNotMatch(firebase, /findUserByUsername|resolveUsernameToEmail/);
  assert.match(firebase, /signInWithCustomToken\(auth, result\.customToken\)/);
  assert.match(authRoute, /createCustomToken\(authResponse\.result\.localId\)/);
  assert.match(authRoute, /profileUsername === username/);
  assert.match(authRoute, /hasSameOrigin\(request\)/);
  assert.match(authRoute, /jsonResponse\(\{ message: RESET_MESSAGE \}\)/);
  assert.doesNotMatch(authRoute, /jsonResponse\(\{\s*email\s*[,}]/);
});

test('class leaderboard access requires trusted class ownership', () => {
  const rules = read('firestore.rules');
  const userRules = rules.split('match /users/{userId}')[1].split('match /classCodes')[0];
  const classRules = rules.split('match /classCodes/{classCode}')[1].split('match /leaderboards')[0];
  const scoreRules = rules.split('match /studentScores/{studentId}')[1].split('match /leagues')[0];

  assert.match(rules, /function classIdCanBeSet\(classId\)[\s\S]*teacherOwnsClass\(classId\)/);
  assert.match(rules, /usernameEntryMatchesProfile\(username, request\.auth\.uid\)/);
  assert.match(rules, /getAfter\(usernamePath\)\.data\.email == getAfter\(userPath\)\.data\.email/);
  assert.match(userRules, /classIdCanBeSet\(request\.resource\.data\.classId\)/);
  assert.match(userRules, /usernameIndexMatchesAfter\(userId, request\.resource\.data\.usernameLower\)/);
  assert.match(classRules, /allow get: if teacherOwnsClass\(classCode\)/);
  assert.match(scoreRules, /allow list: if signedIn\(\)\s*&& teacherOwnsClass\(resource\.data\.classId\)/);
  assert.doesNotMatch(scoreRules, /userIsInClass/);
});

test('estimateTeacherProRevenue calculates monthly and annualized growth', () => {
  const summary = {
    totalUsers: 120,
    teacherProUsers: 18,
    monthlyPrice: 10,
    annualPrice: 110,
  };

  const result = estimateTeacherProRevenue(summary);
  assert.equal(result.monthlyRevenue, 180);
  assert.equal(result.annualizedRevenue, 1980);
  assert.equal(result.monthlyConversionRate, 15);
});

test('buildCreatorMonetisationSnapshot summarizes recent conversions and retention', () => {
  const now = new Date('2026-08-31T00:00:00Z');
  const users = [
    { uid: 'a', teacherPro: true, isActive: true, createdAt: new Date('2026-08-15T00:00:00Z') },
    { uid: 'b', teacherPro: true, isActive: true, createdAt: new Date('2026-08-20T00:00:00Z') },
    { uid: 'c', teacherPro: false, isActive: true, createdAt: new Date('2026-08-05T00:00:00Z') },
    { uid: 'd', teacherPro: true, isActive: false, createdAt: new Date('2026-07-01T00:00:00Z') },
  ];

  const result = buildCreatorMonetisationSnapshot(users, now);
  assert.equal(result.recentProUsers, 2);
  assert.equal(result.recentSignups, 3);
  assert.equal(result.activePremiumRetention, 67);
  assert.equal(result.monthlyRevenue, 20);
});

test('buildCreatorRevenueTrend summarizes premium revenue across the last six months', () => {
  const now = new Date('2026-08-31T00:00:00Z');
  const users = [
    { uid: 'a', teacherPro: true, isActive: true, createdAt: new Date('2026-08-03T00:00:00Z') },
    { uid: 'b', teacherPro: true, isActive: true, createdAt: new Date('2026-08-18T00:00:00Z') },
    { uid: 'c', teacherPro: true, isActive: true, createdAt: new Date('2026-07-12T00:00:00Z') },
    { uid: 'd', teacherPro: false, isActive: true, createdAt: new Date('2026-06-20T00:00:00Z') },
    { uid: 'e', teacherPro: true, isActive: false, createdAt: new Date('2026-04-14T00:00:00Z') },
  ];

  const result = buildCreatorRevenueTrend(users, now);
  assert.equal(result.totalRevenue, 40);
  assert.equal(result.months.length, 6);
  assert.equal(result.months[0].label, 'Mar');
  assert.equal(result.months[4].label, 'Jul');
  assert.equal(result.months[5].label, 'Aug');
  assert.equal(result.months[5].revenue, 20);
});

test('buildCreatorConversionFunnel shows role-based premium conversion', () => {
  const users = [
    { uid: '1', role: 'teacher', teacherPro: true },
    { uid: '2', role: 'teacher', teacherPro: false },
    { uid: '3', role: 'teacher', teacherPro: false },
    { uid: '4', role: 'student', teacherPro: true },
    { uid: '5', role: 'student', teacherPro: false },
    { uid: '6', role: 'student', teacherPro: false },
    { uid: '7', role: 'student', teacherPro: false },
  ];

  const result = buildCreatorConversionFunnel(users);
  assert.equal(result.totalUsers, 7);
  assert.equal(result.teacherProUsers, 2);
  assert.equal(result.teacherConversionRate, 33);
  assert.equal(result.studentConversionRate, 25);
  assert.equal(result.bestRole, 'teacher');
});

test('buildCreatorCohortSummary compares new signups with returning users', () => {
  const now = new Date('2026-08-31T00:00:00Z');
  const users = [
    { uid: '1', role: 'teacher', teacherPro: true, createdAt: new Date('2026-08-01T00:00:00Z'), lastLogin: new Date('2026-08-28T00:00:00Z') },
    { uid: '2', role: 'teacher', teacherPro: false, createdAt: new Date('2026-07-10T00:00:00Z'), lastLogin: new Date('2026-08-28T00:00:00Z') },
    { uid: '3', role: 'student', teacherPro: true, createdAt: new Date('2026-08-20T00:00:00Z'), lastLogin: new Date('2026-08-29T00:00:00Z') },
    { uid: '4', role: 'student', teacherPro: false, createdAt: new Date('2026-04-01T00:00:00Z'), lastLogin: new Date('2026-08-26T00:00:00Z') },
    { uid: '5', role: 'student', teacherPro: false, createdAt: new Date('2026-06-05T00:00:00Z'), lastLogin: new Date('2026-05-20T00:00:00Z') },
  ];

  const result = buildCreatorCohortSummary(users, now);
  assert.equal(result.newUsers, 2);
  assert.equal(result.returningUsers, 2);
  assert.equal(result.newUserConversionRate, 100);
  assert.equal(result.returningUserConversionRate, 0);
  assert.equal(result.bestCohort, 'new');
});
