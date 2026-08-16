const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'lumexai.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    key_hash TEXT NOT NULL UNIQUE,
    key_hint TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('available','activated','expired','suspended')),
    user_id TEXT REFERENCES users(id),
    activated_at TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS portal_admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('super','mentor')),
    status TEXT NOT NULL CHECK(status IN ('pending','approved','revoked')),
    mentor_id TEXT,
    created_at TEXT NOT NULL,
    reviewed_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_licenses_user ON licenses(user_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_portal_admins_email ON portal_admins(email);
`);

function ensureColumn(table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

ensureColumn('users', 'access_status', `access_status TEXT NOT NULL DEFAULT 'pending'`);
ensureColumn('users', 'reviewed_at', `reviewed_at TEXT`);
ensureColumn('users', 'review_note', `review_note TEXT`);
ensureColumn('licenses', 'bound_email', `bound_email TEXT`);
ensureColumn('licenses', 'bound_first_name', `bound_first_name TEXT`);
ensureColumn('licenses', 'bound_last_name', `bound_last_name TEXT`);
ensureColumn('licenses', 'released_at', `released_at TEXT`);
ensureColumn('licenses', 'created_by', `created_by TEXT`);
ensureColumn('licenses', 'ea_id', `ea_id TEXT`);
ensureColumn('licenses', 'ea_name', `ea_name TEXT`);
ensureColumn('licenses', 'ea_symbols', `ea_symbols TEXT`);
ensureColumn('licenses', 'ea_media_url', `ea_media_url TEXT`);
ensureColumn('licenses', 'ea_media_kind', `ea_media_kind TEXT`);
ensureColumn('licenses', 'ea_description', `ea_description TEXT`);
ensureColumn('licenses', 'ea_lot', `ea_lot REAL`);
ensureColumn('licenses', 'ea_direction', `ea_direction TEXT`);

// Existing licensed users stay usable
db.exec(`
  UPDATE users
  SET access_status = 'approved'
  WHERE id IN (
    SELECT user_id FROM licenses WHERE status = 'activated' AND user_id IS NOT NULL
  )
  AND (access_status IS NULL OR access_status = 'pending');
`);

// Backfill bound_email from linked users
db.exec(`
  UPDATE licenses
  SET bound_email = (
    SELECT email FROM users WHERE users.id = licenses.user_id
  )
  WHERE status = 'activated'
    AND user_id IS NOT NULL
    AND (bound_email IS NULL OR bound_email = '');
`);

module.exports = { db, dbPath };
