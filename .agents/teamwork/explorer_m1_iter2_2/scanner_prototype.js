const INVISIBLE_CHARS_REGEX = /[\u200B-\u200D\uFEFF\u00AD\u200E\u200F\u2028\u2029\u2060-\u206F\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Internal compiled anti-claim rule specification: { canonicalPhrase: string, regex: RegExp }

const ANTI_CLAIM_RULES = Object.freeze([
  // 1. 100% VAC Safe
  {
    canonicalPhrase: '100% vac safe',
    regex: /\b1[\W_]*0[\W_]*0[\W_]*(?:%|percent)[\W_]*v[\W_]*[a@4][\W_]*c[\W_]*[s$5][\W_]*[a@4][\W_]*f[\W_]*[e3]\b/i,
  },
  // 2. Officially Valve Approved
  {
    canonicalPhrase: 'officially valve approved',
    regex: /\bo[\W_]*f[\W_]*f[\W_]*[i1!][\W_]*c[\W_]*[i1!][\W_]*[a@4][\W_]*[l1!][\W_]*[l1!][\W_]*y[\W_]*v[\W_]*[a@4][\W_]*[l1!][\W_]*v[\W_]*[e3][\W_]*[a@4][\W_]*p[\W_]*p[\W_]*r[\W_]*[o0][\W_]*v[\W_]*[e3][\W_]*d\b/i,
  },
  // 3. VAC-Proof
  {
    canonicalPhrase: 'vac-proof',
    regex: /\bv[\W_]*[a@4][\W_]*c[\W_]*p[\W_]*r[\W_]*[o0][\W_]*[o0][\W_]*f\b/i,
  },
  // 4. Valve Approved
  {
    canonicalPhrase: 'valve approved',
    regex: /\bv[\W_]*[a@4][\W_]*[l1!][\W_]*v[\W_]*[e3][\W_]*[a@4][\W_]*p[\W_]*p[\W_]*r[\W_]*[o0][\W_]*v[\W_]*[e3][\W_]*d\b/i,
  },
  // 5. Valve Certified
  {
    canonicalPhrase: 'valve certified',
    regex: /\b(?:v[\W_]*[a@4][\W_]*[l1!][\W_]*v[\W_]*[e3][\W_]*c[\W_]*[e3][\W_]*r[\W_]*t[\W_]*[i1!][\W_]*f[\W_]*[i1!][\W_]*[e3][\W_]*d|c[\W_]*[e3][\W_]*r[\W_]*t[\W_]*[i1!][\W_]*f[\W_]*[i1!][\W_]*[e3][\W_]*d[\W_]*b[\W_]*y[\W_]*v[\W_]*[a@4][\W_]*[l1!][\W_]*v[\W_]*[e3])\b/i,
  },
  // 6. Whitelisted by Valve
  {
    canonicalPhrase: 'whitelisted by valve',
    regex: /\bw[\W_]*h[\W_]*[i1!][\W_]*t[\W_]*[e3][\W_]*[l1!][\W_]*[i1!][\W_]*[s$5][\W_]*t[\W_]*[e3][\W_]*d[\W_]*b[\W_]*y[\W_]*v[\W_]*[a@4][\W_]*[l1!][\W_]*v[\W_]*[e3]\b/i,
  },
  // 7. Valve Whitelisted
  {
    canonicalPhrase: 'valve whitelisted',
    regex: /\bv[\W_]*[a@4][\W_]*[l1!][\W_]*v[\W_]*[e3][\W_]*w[\W_]*h[\W_]*[i1!][\W_]*t[\W_]*[e3][\W_]*[l1!][\W_]*[i1!][\W_]*[s$5][\W_]*t[\W_]*[e3][\W_]*d\b/i,
  },
  // 8. Anti-VAC
  {
    canonicalPhrase: 'anti-vac',
    regex: /\b[a@4][\W_]*n[\W_]*t[\W_]*[i1!][\W_]*v[\W_]*[a@4][\W_]*c\b/i,
  },
]);

function scanTextForAntiClaimViolations(text) {
  if (!text || typeof text !== 'string') {
    return { clean: true, violations: [] };
  }

  // Pass 1: Unicode NFKC normalization
  const normalized = text.normalize('NFKC');

  // Pass 2: Invisible character stripping
  const cleaned = normalized.replace(INVISIBLE_CHARS_REGEX, '');

  const violations = [];
  const coveredSpans = [];

  for (const { canonicalPhrase, regex } of ANTI_CLAIM_RULES) {
    // Check against normalized text
    let match = regex.exec(normalized);
    let matchedText = normalized;

    // Secondary check against stripped text if not found
    if (!match && cleaned !== normalized) {
      match = regex.exec(cleaned);
      matchedText = cleaned;
    }

    if (match) {
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;

      // Avoid duplicate sub-matches (e.g. 'valve approved' when 'officially valve approved' already spans it)
      const isSubsumed = coveredSpans.some(
        (span) => matchStart >= span.start && matchEnd <= span.end
      );

      if (!isSubsumed) {
        coveredSpans.push({ start: matchStart, end: matchEnd });

        // Calculate snippet from original text
        const start = Math.max(0, matchStart - 25);
        const end = Math.min(text.length, matchEnd + 25);
        violations.push({
          matchedPhrase: canonicalPhrase,
          snippet: text.substring(start, end).trim(),
        });
      }
    }
  }

  return {
    clean: violations.length === 0,
    violations,
  };
}

module.exports = { scanTextForAntiClaimViolations };
