function normalizeUsername(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

function isValidUsername(value) {
  const raw = String(value ?? '');
  if (!raw.trim() || raw !== raw.trim()) return false;
  if (/\s/.test(raw)) return false;

  const cleaned = normalizeUsername(raw);
  return cleaned.length >= 3 && /^[a-z0-9._-]+$/.test(cleaned) && raw === cleaned;
}

module.exports = { normalizeUsername, isValidUsername };
