const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('./db');

const JWT_SECRET =
  process.env.LUMEXAI_JWT_SECRET ||
  'lumexai-dev-secret-change-in-production-2026';
const TOKEN_TTL = '7d';
const BCRYPT_ROUNDS = 10;

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function normalizeLicenseKey(key) {
  return String(key || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function hashLicenseKey(key) {
  return crypto.createHash('sha256').update(normalizeLicenseKey(key)).digest('hex');
}

function licenseHint(key) {
  const n = normalizeLicenseKey(key);
  if (n.length < 8) return '****';
  return `${n.slice(0, 4)}····${n.slice(-4)}`;
}

function newId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    accessStatus: row.access_status || 'pending',
  };
}

function getAccessStatus(user) {
  return user?.access_status || 'pending';
}

function resolveNext(user, license) {
  const access = getAccessStatus(user);
  if (access === 'revoked') return 'revoked';
  if (access !== 'approved') return 'pending';
  if (license && license.status === 'active') return 'dashboard';
  return 'license';
}

function sessionPayload(user) {
  const license = licensePayload(getActiveLicenseForUser(user.id));
  return {
    user: publicUser(user),
    license,
    accessStatus: getAccessStatus(user),
    next: resolveNext(user, license),
  };
}

function getActiveLicenseForUser(userId) {
  return db
    .prepare(
      `SELECT * FROM licenses
       WHERE user_id = ? AND status = 'activated'
       ORDER BY activated_at DESC LIMIT 1`,
    )
    .get(userId);
}

function licensePayload(row) {
  if (!row) return { status: 'none', hint: null, activatedAt: null, ea: null };
  let symbols = [];
  try {
    symbols = JSON.parse(row.ea_symbols || '[]');
  } catch {
    symbols = [];
  }
  const ea =
    row.ea_id || row.ea_name
      ? {
          id: row.ea_id || null,
          name: row.ea_name || null,
          symbols,
          lot: row.ea_lot ?? 0.01,
          direction: row.ea_direction || 'both',
          description: row.ea_description || '',
          mediaUrl: row.ea_media_url || null,
          mediaKind: row.ea_media_kind || null,
        }
      : null;
  return {
    status: row.status === 'activated' ? 'active' : row.status,
    hint: row.key_hint,
    activatedAt: row.activated_at,
    ea,
  };
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const payload = verifyToken(token);
  if (!payload?.sub) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  req.user = user;
  next();
}

function requireActiveLicense(req, res, next) {
  const access = getAccessStatus(req.user);
  if (access === 'revoked') {
    return res.status(403).json({
      error: 'Access has been revoked by Super Admin.',
      code: 'ACCESS_REVOKED',
    });
  }
  if (access !== 'approved') {
    return res.status(403).json({
      error: 'Your account is awaiting Super Admin approval.',
      code: 'APPROVAL_REQUIRED',
    });
  }
  const license = getActiveLicenseForUser(req.user.id);
  if (!license) {
    return res.status(403).json({
      error: 'An active license is required.',
      code: 'LICENSE_REQUIRED',
    });
  }
  // Re-check expiry at request time
  if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) {
    db.prepare(`UPDATE licenses SET status = 'expired' WHERE id = ?`).run(license.id);
    return res.status(403).json({
      error: 'Your license has expired.',
      code: 'LICENSE_EXPIRED',
    });
  }
  req.license = license;
  next();
}

function requireApproved(req, res, next) {
  const access = getAccessStatus(req.user);
  if (access === 'revoked') {
    return res.status(403).json({
      error: 'Access has been revoked by Super Admin.',
      code: 'ACCESS_REVOKED',
    });
  }
  if (access !== 'approved') {
    return res.status(403).json({
      error: 'Your account is awaiting Super Admin approval.',
      code: 'APPROVAL_REQUIRED',
    });
  }
  next();
}

async function registerUser({ email, firstName, lastName }) {
  const normalized = normalizeEmail(email);
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, status: 400, error: 'Enter a valid email address.' };
  }
  if (!String(firstName || '').trim() || !String(lastName || '').trim()) {
    return { ok: false, status: 400, error: 'First and last name are required.' };
  }

  const existing = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(normalized);
  if (existing) {
    const first = String(firstName || '').trim() || existing.first_name;
    const last = String(lastName || '').trim() || existing.last_name;
    db.prepare(
      `UPDATE users SET first_name = ?, last_name = ? WHERE id = ?`,
    ).run(first, last, existing.id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(existing.id);
    const session = sessionPayload(user);
    return {
      ok: true,
      token: signToken(existing.id),
      ...session,
      resumed: true,
    };
  }

  const id = newId('usr');
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), BCRYPT_ROUNDS);
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO users
     (id, email, first_name, last_name, password_hash, created_at, access_status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
  ).run(
    id,
    normalized,
    String(firstName).trim(),
    String(lastName).trim(),
    passwordHash,
    createdAt,
  );

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const session = sessionPayload(user);
  return {
    ok: true,
    token: signToken(id),
    ...session,
  };
}

async function loginUser({ email }) {
  const normalized = normalizeEmail(email);
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, status: 400, error: 'Enter a valid email address.' };
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalized);
  if (!user) {
    return { ok: false, status: 401, error: 'No account found for this email.' };
  }
  const session = sessionPayload(user);
  return {
    ok: true,
    token: signToken(user.id),
    ...session,
  };
}

function activateLicenseForUser(userId, rawKey) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    return { ok: false, status: 401, error: 'Authentication required.' };
  }
  if (getAccessStatus(user) === 'revoked') {
    return {
      ok: false,
      status: 403,
      error: 'Access has been revoked by Super Admin.',
    };
  }
  if (getAccessStatus(user) !== 'approved') {
    return {
      ok: false,
      status: 403,
      error: 'Your account must be approved by Super Admin before activation.',
    };
  }

  const key = normalizeLicenseKey(rawKey);
  if (!key || key.length < 8) {
    return { ok: false, status: 400, error: 'Enter a valid license key.' };
  }

  const keyHash = hashLicenseKey(key);
  const license = db.prepare('SELECT * FROM licenses WHERE key_hash = ?').get(keyHash);

  if (!license) {
    return { ok: false, status: 400, error: 'Invalid license key.' };
  }

  if (license.status === 'expired') {
    return { ok: false, status: 400, error: 'This license has expired.' };
  }

  if (license.status === 'suspended') {
    return {
      ok: false,
      status: 400,
      error: 'This license is unavailable. Contact support.',
    };
  }

  if (license.status === 'activated') {
    if (license.user_id === userId) {
      if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) {
        db.prepare(`UPDATE licenses SET status = 'expired' WHERE id = ?`).run(license.id);
        return { ok: false, status: 400, error: 'This license has expired.' };
      }
      return {
        ok: true,
        license: licensePayload(license),
        message: 'License already active on this account.',
      };
    }
    return {
      ok: false,
      status: 403,
      error:
        'This license is locked to another email. Ask Super Admin to release the key.',
      code: 'LICENSE_EMAIL_LOCKED',
    };
  }

  const bound = normalizeEmail(license.bound_email);
  const userEmail = normalizeEmail(user.email);
  if (bound && bound !== userEmail) {
    return {
      ok: false,
      status: 403,
      error:
        'This license is locked to another email. Ask Super Admin to release the key.',
      code: 'LICENSE_EMAIL_LOCKED',
    };
  }

  if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) {
    db.prepare(`UPDATE licenses SET status = 'expired' WHERE id = ?`).run(license.id);
    return { ok: false, status: 400, error: 'This license has expired.' };
  }

  const existingActive = getActiveLicenseForUser(userId);
  const activatedAt = new Date().toISOString();

  const tx = db.transaction(() => {
    if (existingActive && existingActive.id !== license.id) {
      return { reuse: existingActive };
    }
    db.prepare(
      `UPDATE licenses
       SET status = 'activated', user_id = ?, activated_at = ?, bound_email = ?
       WHERE id = ? AND status = 'available'`,
    ).run(userId, activatedAt, userEmail, license.id);
    return { reuse: null };
  });

  const result = tx();
  if (result.reuse) {
    return {
      ok: true,
      license: licensePayload(result.reuse),
      message: 'Account already has an active license.',
    };
  }

  const updated = db.prepare('SELECT * FROM licenses WHERE id = ?').get(license.id);
  if (!updated || updated.status !== 'activated' || updated.user_id !== userId) {
    return {
      ok: false,
      status: 409,
      error: 'This license cannot be activated.',
    };
  }

  return {
    ok: true,
    license: licensePayload(updated),
    message: 'License activated successfully.',
  };
}

function listSubscriptions({ status } = {}) {
  let rows;
  if (status && ['pending', 'approved', 'revoked'].includes(status)) {
    rows = db
      .prepare(
        `SELECT * FROM users WHERE access_status = ? ORDER BY created_at DESC`,
      )
      .all(status);
  } else {
    rows = db
      .prepare(`SELECT * FROM users ORDER BY created_at DESC`)
      .all();
  }

  return rows.map((row) => {
    const license = getActiveLicenseForUser(row.id);
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      status: getAccessStatus(row),
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at || null,
      license: licensePayload(license),
    };
  });
}

function setAccessStatus(userId, status) {
  if (!['pending', 'approved', 'revoked'].includes(status)) {
    return { ok: false, status: 400, error: 'Invalid access status.' };
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    return { ok: false, status: 404, error: 'Subscriber not found.' };
  }
  const reviewedAt = new Date().toISOString();
  db.prepare(
    `UPDATE users SET access_status = ?, reviewed_at = ? WHERE id = ?`,
  ).run(status, reviewedAt, userId);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return {
    ok: true,
    subscriber: {
      id: updated.id,
      email: updated.email,
      firstName: updated.first_name,
      lastName: updated.last_name,
      status: getAccessStatus(updated),
      createdAt: updated.created_at,
      reviewedAt: updated.reviewed_at,
      license: licensePayload(getActiveLicenseForUser(updated.id)),
    },
  };
}

function subscriptionStats() {
  const pending = db
    .prepare(`SELECT COUNT(*) AS c FROM users WHERE access_status = 'pending'`)
    .get().c;
  const approved = db
    .prepare(`SELECT COUNT(*) AS c FROM users WHERE access_status = 'approved'`)
    .get().c;
  const revoked = db
    .prepare(`SELECT COUNT(*) AS c FROM users WHERE access_status = 'revoked'`)
    .get().c;
  return { pending, approved, revoked, total: pending + approved + revoked };
}

function seedDemoLicenses() {
  const demos = [
    { key: 'LUMEX-A7K9-M2QP-4XWZ', status: 'available', expiresAt: null },
    { key: 'LUMEX-B3N8-H5TR-9YCV', status: 'available', expiresAt: null },
    { key: 'LUMEX-C1D4-P8WQ-6NJM', status: 'available', expiresAt: null },
    {
      key: 'LUMEX-EXPIRED-TEST-01',
      status: 'expired',
      expiresAt: '2024-01-01T00:00:00.000Z',
    },
    {
      key: 'LUMEX-SUSPEND-TEST-01',
      status: 'suspended',
      expiresAt: null,
    },
  ];

  const insert = db.prepare(
    `INSERT OR IGNORE INTO licenses
     (id, key_hash, key_hint, status, user_id, activated_at, expires_at, created_at)
     VALUES (?, ?, ?, ?, NULL, NULL, ?, ?)`,
  );

  const now = new Date().toISOString();
  for (const demo of demos) {
    insert.run(
      newId('lic'),
      hashLicenseKey(demo.key),
      licenseHint(demo.key),
      demo.status,
      demo.expiresAt,
      now,
    );
  }
}

module.exports = {
  authMiddleware,
  requireActiveLicense,
  requireApproved,
  registerUser,
  loginUser,
  activateLicenseForUser,
  getActiveLicenseForUser,
  licensePayload,
  publicUser,
  sessionPayload,
  listSubscriptions,
  setAccessStatus,
  subscriptionStats,
  seedDemoLicenses,
  normalizeEmail,
  normalizeLicenseKey,
  hashLicenseKey,
  licenseHint,
  newId,
  signToken,
  getAccessStatus,
  resolveNext,
};
