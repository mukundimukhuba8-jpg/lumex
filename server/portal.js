const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('./db');
const {
  normalizeEmail,
  normalizeLicenseKey,
  hashLicenseKey,
  licenseHint,
  newId,
  licensePayload,
  getActiveLicenseForUser,
  publicUser,
  sessionPayload,
  signToken: signClientToken,
} = require('./auth');
const { getEa, eaSnapshot } = require('./eas');

const JWT_SECRET =
  process.env.LUMEXAI_JWT_SECRET ||
  'lumexai-dev-secret-change-in-production-2026';
const BCRYPT_ROUNDS = 10;
const ADMIN_KEY =
  process.env.LUMEXAI_ADMIN_KEY || 'lumex-super-admin-mukundi';

const SUPER_EMAIL =
  process.env.LUMEXAI_SUPER_EMAIL || 'mukundimukhuba8@gmail.com';
const SUPER_PASSWORD =
  process.env.LUMEXAI_SUPER_PASSWORD || 'LumexSuper2026!';

function publicPortalAdmin(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    status: row.status,
    mentorId: row.mentor_id || null,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at || null,
  };
}

function signPortalToken(admin) {
  return jwt.sign(
    { sub: admin.id, kind: 'portal', role: admin.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

function verifyPortalToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload?.kind !== 'portal' || !payload?.sub) return null;
    return payload;
  } catch {
    return null;
  }
}

async function seedSuperAdmin() {
  const existing = db
    .prepare('SELECT * FROM portal_admins WHERE email = ?')
    .get(SUPER_EMAIL);
  if (existing) {
    if (existing.role !== 'super' || existing.status !== 'approved') {
      db.prepare(
        `UPDATE portal_admins SET role = 'super', status = 'approved', reviewed_at = ? WHERE id = ?`,
      ).run(new Date().toISOString(), existing.id);
    }
    return;
  }
  const hash = await bcrypt.hash(SUPER_PASSWORD, BCRYPT_ROUNDS);
  db.prepare(
    `INSERT INTO portal_admins
     (id, email, first_name, last_name, password_hash, role, status, mentor_id, created_at, reviewed_at)
     VALUES (?, ?, ?, ?, ?, 'super', 'approved', ?, ?, ?)`,
  ).run(
    newId('pad'),
    SUPER_EMAIL,
    'Mukundi',
    'Mukhuba',
    hash,
    'LM-004821',
    new Date().toISOString(),
    new Date().toISOString(),
  );
  console.log(`[LUMEXAI] Seeded Super Admin ${SUPER_EMAIL}`);
}

async function registerPortalAdmin({ email, firstName, lastName, password }) {
  const normalized = normalizeEmail(email);
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, status: 400, error: 'Enter a valid email address.' };
  }
  if (!String(firstName || '').trim() || !String(lastName || '').trim()) {
    return { ok: false, status: 400, error: 'First and last name are required.' };
  }
  if (!password || String(password).length < 6) {
    return { ok: false, status: 400, error: 'Password must be at least 6 characters.' };
  }

  const existing = db
    .prepare('SELECT * FROM portal_admins WHERE email = ?')
    .get(normalized);
  if (existing) {
    return {
      ok: false,
      status: 409,
      error: 'An admin account already exists for this email. Sign in instead.',
    };
  }

  const id = newId('pad');
  const hash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
  const createdAt = new Date().toISOString();
  const mentorId = `LM-${String(Math.floor(100000 + Math.random() * 900000))}`;

  db.prepare(
    `INSERT INTO portal_admins
     (id, email, first_name, last_name, password_hash, role, status, mentor_id, created_at, reviewed_at)
     VALUES (?, ?, ?, ?, ?, 'mentor', 'pending', ?, ?, NULL)`,
  ).run(
    id,
    normalized,
    String(firstName).trim(),
    String(lastName).trim(),
    hash,
    mentorId,
    createdAt,
  );

  const admin = db.prepare('SELECT * FROM portal_admins WHERE id = ?').get(id);
  return {
    ok: true,
    admin: publicPortalAdmin(admin),
    next: 'pending',
    message: 'Registration submitted. Wait for Super Admin approval.',
  };
}

async function loginPortalAdmin({ email, password }) {
  const normalized = normalizeEmail(email);
  if (!normalized || !password) {
    return { ok: false, status: 400, error: 'Email and password are required.' };
  }
  const admin = db
    .prepare('SELECT * FROM portal_admins WHERE email = ?')
    .get(normalized);
  if (!admin) {
    return { ok: false, status: 401, error: 'Invalid email or password.' };
  }
  const match = await bcrypt.compare(String(password), admin.password_hash);
  if (!match) {
    return { ok: false, status: 401, error: 'Invalid email or password.' };
  }
  if (admin.status === 'pending') {
    return {
      ok: false,
      status: 403,
      error: 'Your portal access is pending Super Admin approval.',
      code: 'PORTAL_PENDING',
      admin: publicPortalAdmin(admin),
    };
  }
  if (admin.status === 'revoked') {
    return {
      ok: false,
      status: 403,
      error: 'Your portal access was revoked by Super Admin.',
      code: 'PORTAL_REVOKED',
      admin: publicPortalAdmin(admin),
    };
  }
  return {
    ok: true,
    token: signPortalToken(admin),
    admin: publicPortalAdmin(admin),
    next: 'portal',
  };
}

function listPortalAdmins({ status } = {}) {
  let rows;
  if (status && ['pending', 'approved', 'revoked'].includes(status)) {
    rows = db
      .prepare(
        `SELECT * FROM portal_admins WHERE status = ? ORDER BY created_at DESC`,
      )
      .all(status);
  } else {
    rows = db
      .prepare(`SELECT * FROM portal_admins ORDER BY created_at DESC`)
      .all();
  }
  return rows.map(publicPortalAdmin);
}

function setPortalAdminStatus(adminId, status) {
  if (!['pending', 'approved', 'revoked'].includes(status)) {
    return { ok: false, status: 400, error: 'Invalid status.' };
  }
  const admin = db.prepare('SELECT * FROM portal_admins WHERE id = ?').get(adminId);
  if (!admin) return { ok: false, status: 404, error: 'Admin not found.' };
  if (admin.role === 'super' && status !== 'approved') {
    return { ok: false, status: 400, error: 'Cannot change Super Admin status.' };
  }
  const reviewedAt = new Date().toISOString();
  db.prepare(
    `UPDATE portal_admins SET status = ?, reviewed_at = ? WHERE id = ?`,
  ).run(status, reviewedAt, adminId);
  const updated = db.prepare('SELECT * FROM portal_admins WHERE id = ?').get(adminId);
  return { ok: true, admin: publicPortalAdmin(updated) };
}

function portalAdminStats() {
  const pending = db
    .prepare(`SELECT COUNT(*) AS c FROM portal_admins WHERE status = 'pending'`)
    .get().c;
  const approved = db
    .prepare(`SELECT COUNT(*) AS c FROM portal_admins WHERE status = 'approved'`)
    .get().c;
  const revoked = db
    .prepare(`SELECT COUNT(*) AS c FROM portal_admins WHERE status = 'revoked'`)
    .get().c;
  return { pending, approved, revoked, total: pending + approved + revoked };
}

function randomSegment(len = 4) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

function generateLicenseKeyPlain() {
  return `LUMEX-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
}

function generateLicenses({
  email,
  firstName,
  lastName,
  eaId,
  createdBy = null,
} = {}) {
  const normalized = normalizeEmail(email);
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, status: 400, error: 'Enter a valid email for this license.' };
  }
  const first = String(firstName || '').trim();
  const last = String(lastName || '').trim();
  if (!first || !last) {
    return {
      ok: false,
      status: 400,
      error: 'First and last name are required to generate a license key.',
    };
  }
  if (!eaId) {
    return {
      ok: false,
      status: 400,
      error: 'Select an EA to sync with this license key.',
    };
  }
  const ea = getEa(eaId);
  if (!ea) {
    return { ok: false, status: 404, error: 'Selected EA was not found.' };
  }

  // One available (unused) key per email at a time
  const existingOpen = db
    .prepare(
      `SELECT id FROM licenses
       WHERE bound_email = ? AND status = 'available'
       LIMIT 1`,
    )
    .get(normalized);
  if (existingOpen) {
    return {
      ok: false,
      status: 409,
      error:
        'This email already has an unused license key. Release it first or wait until it is activated.',
    };
  }

  let plain = generateLicenseKeyPlain();
  let hash = hashLicenseKey(plain);
  let tries = 0;
  while (db.prepare('SELECT id FROM licenses WHERE key_hash = ?').get(hash) && tries < 5) {
    plain = generateLicenseKeyPlain();
    hash = hashLicenseKey(plain);
    tries += 1;
  }

  const id = newId('lic');
  const now = new Date().toISOString();
  const snap = eaSnapshot(ea);
  db.prepare(
    `INSERT INTO licenses
     (id, key_hash, key_hint, status, user_id, activated_at, expires_at, created_at,
      bound_email, bound_first_name, bound_last_name, released_at, created_by,
      ea_id, ea_name, ea_symbols, ea_media_url, ea_media_kind, ea_description, ea_lot, ea_direction)
     VALUES (?, ?, ?, 'available', NULL, NULL, NULL, ?, ?, ?, ?, NULL, ?,
      ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    hash,
    licenseHint(plain),
    now,
    normalized,
    first,
    last,
    createdBy,
    snap.id,
    snap.name,
    JSON.stringify(snap.symbols || []),
    snap.mediaUrl,
    snap.mediaKind,
    snap.description || '',
    snap.lot,
    snap.direction,
  );

  return {
    ok: true,
    licenses: [
      {
        id,
        key: plain,
        hint: licenseHint(plain),
        status: 'available',
        boundEmail: normalized,
        boundFirstName: first,
        boundLastName: last,
        createdAt: now,
        ea: snap,
      },
    ],
  };
}

function licenseEa(row) {
  if (!row?.ea_id && !row?.ea_name) return null;
  let symbols = [];
  try {
    symbols = JSON.parse(row.ea_symbols || '[]');
  } catch {
    symbols = [];
  }
  return {
    id: row.ea_id || null,
    name: row.ea_name || null,
    symbols,
    lot: row.ea_lot ?? 0.01,
    direction: row.ea_direction || 'both',
    description: row.ea_description || '',
    mediaUrl: row.ea_media_url || null,
    mediaKind: row.ea_media_kind || null,
  };
}

function listLicenses() {
  const rows = db
    .prepare(`SELECT * FROM licenses ORDER BY created_at DESC`)
    .all();
  return rows.map((row) => {
    let user = null;
    if (row.user_id) {
      const u = db.prepare('SELECT * FROM users WHERE id = ?').get(row.user_id);
      user = publicUser(u);
    }
    return {
      id: row.id,
      hint: row.key_hint,
      status: row.status === 'activated' ? 'active' : row.status,
      boundEmail: row.bound_email || null,
      boundFirstName: row.bound_first_name || null,
      boundLastName: row.bound_last_name || null,
      activatedAt: row.activated_at || null,
      releasedAt: row.released_at || null,
      createdAt: row.created_at,
      user,
      ea: licenseEa(row),
    };
  });
}

function releaseLicense(licenseId, { email, firstName, lastName } = {}) {
  const license = db.prepare('SELECT * FROM licenses WHERE id = ?').get(licenseId);
  if (!license) return { ok: false, status: 404, error: 'License not found.' };
  if (license.status === 'suspended') {
    return { ok: false, status: 400, error: 'Suspended licenses cannot be released.' };
  }

  const normalized = normalizeEmail(email);
  const first = String(firstName || '').trim();
  const last = String(lastName || '').trim();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return {
      ok: false,
      status: 400,
      error: 'Enter the new email this license should be assigned to.',
    };
  }
  if (!first || !last) {
    return {
      ok: false,
      status: 400,
      error: 'First and last name are required to reassign this license.',
    };
  }

  const releasedAt = new Date().toISOString();
  db.prepare(
    `UPDATE licenses
     SET status = 'available',
         user_id = NULL,
         activated_at = NULL,
         bound_email = ?,
         bound_first_name = ?,
         bound_last_name = ?,
         released_at = ?
     WHERE id = ?`,
  ).run(normalized, first, last, releasedAt, licenseId);
  const updated = db.prepare('SELECT * FROM licenses WHERE id = ?').get(licenseId);
  return {
    ok: true,
    license: {
      id: updated.id,
      hint: updated.key_hint,
      status: 'available',
      boundEmail: updated.bound_email,
      boundFirstName: updated.bound_first_name,
      boundLastName: updated.bound_last_name,
      activatedAt: null,
      releasedAt: updated.released_at,
      createdAt: updated.created_at,
      user: null,
    },
    message: `License released and assigned to ${normalized}.`,
  };
}

function licenseStats() {
  const available = db
    .prepare(`SELECT COUNT(*) AS c FROM licenses WHERE status = 'available'`)
    .get().c;
  const active = db
    .prepare(`SELECT COUNT(*) AS c FROM licenses WHERE status = 'activated'`)
    .get().c;
  const expired = db
    .prepare(`SELECT COUNT(*) AS c FROM licenses WHERE status = 'expired'`)
    .get().c;
  const suspended = db
    .prepare(`SELECT COUNT(*) AS c FROM licenses WHERE status = 'suspended'`)
    .get().c;
  return { available, active, expired, suspended, total: available + active + expired + suspended };
}

/**
 * App login with license key + email.
 * One email per key until Super Admin releases it.
 */
async function loginWithLicense({ email, licenseKey, firstName, lastName }) {
  const normalized = normalizeEmail(email);
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, status: 400, error: 'Enter a valid email address.' };
  }
  const key = normalizeLicenseKey(licenseKey);
  if (!key || key.length < 8) {
    return { ok: false, status: 400, error: 'Enter a valid license key.' };
  }

  const license = db
    .prepare('SELECT * FROM licenses WHERE key_hash = ?')
    .get(hashLicenseKey(key));
  if (!license) {
    return { ok: false, status: 400, error: 'Invalid license key.' };
  }
  if (license.status === 'expired') {
    return { ok: false, status: 400, error: 'This license has expired.' };
  }
  if (license.status === 'suspended') {
    return { ok: false, status: 400, error: 'This license is unavailable.' };
  }
  if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) {
    db.prepare(`UPDATE licenses SET status = 'expired' WHERE id = ?`).run(license.id);
    return { ok: false, status: 400, error: 'This license has expired.' };
  }

  const bound = normalizeEmail(license.bound_email);
  if (!bound) {
    return {
      ok: false,
      status: 400,
      error:
        'This license is not assigned to an email yet. Ask Super Admin to generate or reassign it.',
      code: 'LICENSE_UNASSIGNED',
    };
  }
  if (bound !== normalized) {
    return {
      ok: false,
      status: 403,
      error:
        'This license is locked to another email. Ask Super Admin to release the key before a new email can use it.',
      code: 'LICENSE_EMAIL_LOCKED',
    };
  }

  if (license.status === 'activated' && license.user_id) {
    const owner = db.prepare('SELECT * FROM users WHERE id = ?').get(license.user_id);
    if (!owner) {
      return { ok: false, status: 400, error: 'License owner account missing. Ask Super Admin to release the key.' };
    }
    if (normalizeEmail(owner.email) !== normalized) {
      return {
        ok: false,
        status: 403,
        error:
          'This license is locked to another email. Ask Super Admin to release the key before a new email can use it.',
        code: 'LICENSE_EMAIL_LOCKED',
      };
    }
    if (getAccessStatusSafe(owner) === 'revoked') {
      return {
        ok: false,
        status: 403,
        error: 'Access has been revoked by Super Admin.',
        code: 'ACCESS_REVOKED',
      };
    }
    const session = sessionPayload(owner);
    return {
      ok: true,
      token: signClientToken(owner.id),
      ...session,
      message: 'Signed in with license key.',
    };
  }

  // First bind: create or reuse user, lock email to this key
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalized);
  const first =
    String(firstName || '').trim() ||
    license.bound_first_name ||
    user?.first_name ||
    'User';
  const last =
    String(lastName || '').trim() ||
    license.bound_last_name ||
    user?.last_name ||
    'Member';

  const activatedAt = new Date().toISOString();
  const tx = db.transaction(() => {
    if (!user) {
      const id = newId('usr');
      const passwordHash = bcrypt.hashSync(
        crypto.randomBytes(32).toString('hex'),
        BCRYPT_ROUNDS,
      );
      db.prepare(
        `INSERT INTO users
         (id, email, first_name, last_name, password_hash, created_at, access_status, reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, 'approved', ?)`,
      ).run(id, normalized, first, last, passwordHash, activatedAt, activatedAt);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    } else {
      db.prepare(
        `UPDATE users
         SET first_name = ?, last_name = ?, access_status = 'approved', reviewed_at = ?
         WHERE id = ?`,
      ).run(first, last, activatedAt, user.id);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    }

    // Drop other active licenses for this user (one active seat)
    db.prepare(
      `UPDATE licenses
       SET status = 'available', user_id = NULL, activated_at = NULL, bound_email = NULL, released_at = ?
       WHERE user_id = ? AND id != ? AND status = 'activated'`,
    ).run(activatedAt, user.id, license.id);

    const updated = db
      .prepare(
        `UPDATE licenses
         SET status = 'activated', user_id = ?, activated_at = ?, bound_email = ?
         WHERE id = ? AND status = 'available'`,
      )
      .run(user.id, activatedAt, normalized, license.id);

    if (updated.changes !== 1) {
      throw new Error('LICENSE_RACE');
    }
    return user;
  });

  try {
    user = tx();
  } catch (err) {
    if (String(err?.message) === 'LICENSE_RACE') {
      return {
        ok: false,
        status: 409,
        error: 'This license was just claimed. Try again or ask Super Admin to release it.',
      };
    }
    throw err;
  }

  const session = sessionPayload(user);
  return {
    ok: true,
    token: signClientToken(user.id),
    ...session,
    message: 'License activated and locked to this email.',
  };
}

function getAccessStatusSafe(user) {
  return user?.access_status || 'pending';
}

function portalAuthMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Portal sign-in required.' });
  }
  const payload = verifyPortalToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Portal session expired. Sign in again.' });
  }
  const admin = db.prepare('SELECT * FROM portal_admins WHERE id = ?').get(payload.sub);
  if (!admin) {
    return res.status(401).json({ error: 'Portal sign-in required.' });
  }
  if (admin.status !== 'approved') {
    return res.status(403).json({
      error: 'Portal access is not approved.',
      code: admin.status === 'revoked' ? 'PORTAL_REVOKED' : 'PORTAL_PENDING',
    });
  }
  req.portalAdmin = admin;
  next();
}

function requireSuperPortal(req, res, next) {
  if (req.portalAdmin?.role !== 'super') {
    return res.status(403).json({ error: 'Super Admin only.' });
  }
  next();
}

/** Accept shared ADMIN_KEY (bootstrap) OR approved portal JWT */
function adminOrPortalMiddleware(req, res, next) {
  const key =
    req.headers['x-admin-key'] ||
    (req.headers.authorization?.startsWith('Admin ')
      ? req.headers.authorization.slice(6)
      : null);
  if (key && key === ADMIN_KEY) {
    req.portalAdmin = {
      id: 'bootstrap',
      email: SUPER_EMAIL,
      first_name: 'Mukundi',
      last_name: 'Mukhuba',
      role: 'super',
      status: 'approved',
      mentor_id: 'LM-004821',
    };
    req.authMode = 'admin-key';
    return next();
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    const payload = verifyPortalToken(token);
    if (payload) {
      const admin = db.prepare('SELECT * FROM portal_admins WHERE id = ?').get(payload.sub);
      if (admin && admin.status === 'approved') {
        req.portalAdmin = admin;
        req.authMode = 'portal-jwt';
        return next();
      }
    }
  }

  return res.status(401).json({ error: 'Super Admin authorization required.' });
}

function requireSuperOrKey(req, res, next) {
  if (req.portalAdmin?.role === 'super' || req.authMode === 'admin-key') {
    return next();
  }
  return res.status(403).json({ error: 'Super Admin only.' });
}

module.exports = {
  seedSuperAdmin,
  registerPortalAdmin,
  loginPortalAdmin,
  listPortalAdmins,
  setPortalAdminStatus,
  portalAdminStats,
  generateLicenses,
  listLicenses,
  releaseLicense,
  licenseStats,
  loginWithLicense,
  publicPortalAdmin,
  portalAuthMiddleware,
  requireSuperPortal,
  adminOrPortalMiddleware,
  requireSuperOrKey,
  ADMIN_KEY,
  SUPER_EMAIL,
};
