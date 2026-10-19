const { scanTextForAntiClaimViolations } = require('./scanner_prototype');

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failures++;
  } else {
    console.log('PASS:', msg);
  }
}

console.log('=== 1. Domain 9 Standard Tests ===');
const safeText = 'CS2 Assistant is a non-invasive tactical companion consuming official GSI telemetry.';
const unsafeText1 = 'Our overlay is 100% VAC safe and undetectable.';
const unsafeText2 = 'This tool is officially Valve approved for Premier.';
const unsafeText3 = 'Download the ultimate VAC-proof companion.';

assert(scanTextForAntiClaimViolations(safeText).clean === true, 'safeText is clean');

const check1 = scanTextForAntiClaimViolations(unsafeText1);
assert(check1.clean === false, 'unsafeText1 is not clean');
assert(check1.violations[0].matchedPhrase === '100% vac safe', 'unsafeText1 matched "100% vac safe"');

const check2 = scanTextForAntiClaimViolations(unsafeText2);
assert(check2.clean === false, 'unsafeText2 is not clean');
assert(check2.violations[0].matchedPhrase === 'officially valve approved', 'unsafeText2 matched "officially valve approved"');

const check3 = scanTextForAntiClaimViolations(unsafeText3);
assert(check3.clean === false, 'unsafeText3 is not clean');
assert(check3.violations[0].matchedPhrase === 'vac-proof', 'unsafeText3 matched "vac-proof"');

console.log('\n=== 2. Adversarial Challenge Evasions ===');
const adversarialEvasions = [
  { text: 'Our companion is v a c - p r o o f and safe.', expected: 'vac-proof' },
  { text: 'Guaranteed vac_proof architecture.', expected: 'vac-proof' },
  { text: 'Completely 100%_vac_safe for competitive.', expected: '100% vac safe' },
  { text: 'We are officially\nvalve\napproved by organizers.', expected: 'officially valve approved' },
  { text: 'Zero risk vac\u200Bproof design.', expected: 'vac-proof' },
  { text: 'This overlay is 100% VAC SAFE guaranteed!', expected: '100% vac safe' },
  { text: 'Features include VAC-PROOF memory isolation.', expected: 'vac-proof' },
  { text: 'Now OFFICIALLY VALVE APPROVED for tournament play.', expected: 'officially valve approved' },
  { text: 'Our VAC PROOF architecture ensures peace of mind.', expected: 'vac-proof' },
  { text: 'Claiming to be VALVE WHITELISTED is prohibited.', expected: 'valve whitelisted' },
  { text: 'Download the ultimate VAC-proof companion.', expected: 'vac-proof' },
  { text: 'This tool is officially Valve approved for Premier.', expected: 'officially valve approved' },
];

for (const { text, expected } of adversarialEvasions) {
  const res = scanTextForAntiClaimViolations(text);
  assert(res.clean === false, `Evasion detected: ${text.replace(/\n/g, '\\n')}`);
  assert(res.violations.some(v => v.matchedPhrase === expected), `Matched expected phrase: ${expected}`);
}

console.log('\n=== 3. Additional Obfuscation Vectors ===');
const advancedEvasions = [
  { text: 'Fullwidth: ｖａｃ－ｐｒｏｏｆ', expected: 'vac-proof' },
  { text: 'Soft hyphen: v\u00ADa\u00ADc-\u00ADp\u00ADr\u00ADo\u00ADo\u00ADf', expected: 'vac-proof' },
  { text: 'Word joiner: v\u2060a\u2060c\u2060p\u2060r\u2060o\u2060o\u2060f', expected: 'vac-proof' },
  { text: 'Circled letters: ⓥⓐⓒ proof', expected: 'vac-proof' },
  { text: 'Leetspeak: v@c-pr00f', expected: 'vac-proof' },
  { text: 'Leetspeak 2: 100% v4c $afe', expected: '100% vac safe' },
  { text: 'Spaced letters newline: v\na\nc\n-\np\nr\no\no\nf', expected: 'vac-proof' },
  { text: 'Tilde and dots: v.a.c.~p.r.o.o.f', expected: 'vac-proof' },
  { text: 'Underscore spaced: v_a_c_p_r_o_o_f', expected: 'vac-proof' },
  { text: '100 percent vac safe', expected: '100% vac safe' },
  { text: '1 0 0 %  v a c  s a f e', expected: '100% vac safe' },
  { text: 'w h i t e l i s t e d   b y   v a l v e', expected: 'whitelisted by valve' },
  { text: 'v a l v e - c e r t i f i e d', expected: 'valve certified' },
  { text: 'certified by valve', expected: 'valve certified' },
  { text: 'anti-vac engine', expected: 'anti-vac' },
  { text: 'a n t i - v a c', expected: 'anti-vac' },
  { text: 'antivac system', expected: 'anti-vac' },
];

for (const { text, expected } of advancedEvasions) {
  const res = scanTextForAntiClaimViolations(text);
  assert(res.clean === false, `Advanced evasion detected: ${text.replace(/\n/g, '\\n')}`);
  assert(res.violations.some(v => v.matchedPhrase === expected), `Matched expected phrase: ${expected}`);
}

console.log('\n=== 4. Safe Compliance Documentation & Disclaimers ===');
const safeTexts = [
  `
    CS2 Assistant is a Windows companion operating in strict compliance with Valve policies.
    It uses official Game State Integration (GSI) via local HTTP server.
    It performs zero memory reading, zero DLL injection, zero input macros.
    It adheres to the Steam Subscriber Agreement and Trusted Mode requirements.
  `,
  'Valve does not maintain a whitelist of safe software to inject.',
  'Valve does not endorse or whitelist third-party programs.',
  'CS2 Assistant operates exclusively as an out-of-process, non-invasive desktop companion that consumes Valve\'s officially documented Game State Integration HTTP protocol.',
  'Valve Anti-Cheat (VAC) System Guide.',
  'Valve Major Championship Rulebook.',
  'Adheres to Steam Subscriber Agreement and Trusted Mode requirements.',
  '100% of spatial data is wiped on round end.',
  'Headless testing across 100% of capability domains.',
  'This is a vacuum proof test.',
  'Emergency evac proof-of-concept.',
  'Privacy proof protocols for local data.',
  'We anticipate new updates for CS2.',
];

for (const safe of safeTexts) {
  const res = scanTextForAntiClaimViolations(safe);
  assert(res.clean === true, `Safe text clean: ${safe.trim().substring(0, 40)}...`);
  assert(res.violations.length === 0, 'No violations reported');
}

console.log('\n=======================================');
if (failures === 0) {
  console.log('ALL TESTS PASSED WITH ZERO FAILURES!');
} else {
  console.error(`COMPLETED WITH ${failures} FAILURES!`);
  process.exit(1);
}
