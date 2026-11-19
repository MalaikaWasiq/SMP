const assert = require('assert');

console.log('====================================================');
console.log('RUNNING STRICT GMAIL VALIDATION TESTS');
console.log('====================================================\n');

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

const validCases = [
  'username@gmail.com',
  'john.doe@gmail.com',
  'ali_traveler123@gmail.com',
  'MALAIKA.WASIQ@GMAIL.COM',
  'tourist+booking@gmail.com'
];

const invalidCases = [
  'user@yahoo.com',
  'user@outlook.com',
  'user@hotmail.com',
  'user@live.com',
  'user@company.pk',
  'user@nust.edu.pk',
  'user@gmail.com.pk',
  'user@fakegmail.com',
  'user@gmail.org',
  'user@notgmail.com'
];

let passed = 0;
let failed = 0;

for (const email of validCases) {
  try {
    assert.strictEqual(GMAIL_REGEX.test(email), true, `Expected ${email} to be valid`);
    console.log(`[PASS] Valid Gmail accepted: ${email}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${err.message}`);
    failed++;
  }
}

for (const email of invalidCases) {
  try {
    assert.strictEqual(GMAIL_REGEX.test(email), false, `Expected ${email} to be rejected`);
    console.log(`[PASS] Non-Gmail rejected: ${email}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${err.message}`);
    failed++;
  }
}

console.log('\n====================================================');
console.log(`GMAIL TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
