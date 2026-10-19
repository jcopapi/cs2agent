const patterns = [
  // 100% vac safe (longest match first)
  { phrase: '100% vac safe', regex: /1[\W_]*0[\W_]*0[\W_]*(?:%|percent)[\W_]*v[\W_]*[a@4][\W_]*c[\W_]*[s$5][\W_]*[a@4][\W_]*f[\W_]*[e3]/i },
  // officially valve approved
  { phrase: 'officially valve approved', regex: /\bofficially[\W_]*valve[\W_]*approved\b/i },
  // vac-proof
  { phrase: 'vac-proof', regex: /\bv[\W_]*[a@4][\W_]*c[\W_]*p[\W_]*r[\W_]*[o0][\W_]*[o0][\W_]*f\b/i },
  // valve approved
  { phrase: 'valve approved', regex: /\bvalve[\W_]*approved\b/i },
  // valve certified
  { phrase: 'valve certified', regex: /\bvalve[\W_]*certified\b/i },
  // whitelisted by valve
  { phrase: 'whitelisted by valve', regex: /\bwhitelisted[\W_]*by[\W_]*valve\b/i },
  // valve whitelisted
  { phrase: 'valve whitelisted', regex: /\bvalve[\W_]*whitelisted\b/i },
  // anti-vac
  { phrase: 'anti-vac', regex: /\b[a@4][\W_]*n[\W_]*t[\W_]*[i1!][\W_]*v[\W_]*[a@4][\W_]*c\b/i },
];

function scan(text) {
  if (!text || typeof text !== 'string') {
    return { clean: true, violations: [] };
  }
  // Normalize unicode compatibility characters (fullwidth, ligatures)
  const normalized = text.normalize('NFKC');
  const violations = [];
  const detectedPhrases = new Set();

  for (const { phrase, regex } of patterns) {
    // If 'officially valve approved' was already detected, skip subset 'valve approved'
    if (phrase === 'valve approved' && detectedPhrases.has('officially valve approved')) {
      continue;
    }
    const match = regex.exec(normalized);
    if (match) {
      detectedPhrases.add(phrase);
      const start = Math.max(0, match.index - 25);
      const end = Math.min(text.length, match.index + match[0].length + 25);
      violations.push({
        matchedPhrase: phrase,
        snippet: text.substring(start, end).trim(),
      });
    }
  }
  return { clean: violations.length === 0, violations };
}

const evasions = [
  'Our companion is v a c - p r o o f and safe.',
  'Guaranteed vac_proof architecture.',
  'Completely 100%_vac_safe for competitive.',
  'We are officially\nvalve\napproved by organizers.',
  'Zero risk vac\u200Bproof design.',
  'This overlay is 100% VAC SAFE guaranteed!',
  'Features include VAC-PROOF memory isolation.',
  'Now OFFICIALLY VALVE APPROVED for tournament play.',
  'Our VAC PROOF architecture ensures peace of mind.',
  'Claiming to be VALVE WHITELISTED is prohibited.',
  'Download the ultimate VAC-proof companion.',
  'This tool is officially Valve approved for Premier.',
  'We are officially-valve-approved by partners.',
  '100% vac-safe guarantees.',
  'v@c-pr00f companion.',
  '100%_vac_safe',
  'valve-approved overlay',
  'anti-vac bypass',
  'a n t i - v a c engine',
];

for (const t of evasions) {
  const r = scan(t);
  console.log(r.clean ? 'FAIL (missed):' : 'PASS (detected):', JSON.stringify(t), '->', r.violations.map(v => v.matchedPhrase));
}

const safeText = 'CS2 Assistant is a non-invasive tactical companion consuming official GSI telemetry.';
const cleanDoc = `
  CS2 Assistant is a Windows companion operating in strict compliance with Valve policies.
  It uses official Game State Integration (GSI) via local HTTP server.
  It performs zero memory reading, zero DLL injection, zero input macros.
  It adheres to the Steam Subscriber Agreement and Trusted Mode requirements.
`;

const legitimateDisclaimers = [
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
];

console.log('\n--- Safe Texts ---');
console.log('Safe text clean:', scan(safeText).clean);
console.log('Clean doc clean:', scan(cleanDoc).clean);
for (const disc of legitimateDisclaimers) {
  const r = scan(disc);
  console.log(r.clean ? 'PASS (clean):' : 'FAIL (false positive):', JSON.stringify(disc), r.violations);
}
