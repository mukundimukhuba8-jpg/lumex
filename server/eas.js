const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { db } = require('./db');
const { newId } = require('./auth');

const uploadsRoot = path.join(__dirname, '..', 'data', 'uploads', 'eas');
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

db.exec(`
  CREATE TABLE IF NOT EXISTS eas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    symbols TEXT NOT NULL,
    lot REAL NOT NULL DEFAULT 0.01,
    direction TEXT NOT NULL DEFAULT 'both',
    description TEXT,
    media_path TEXT,
    media_kind TEXT,
    media_mime TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL
  );
`);

function publicEa(row) {
  if (!row) return null;
  let symbols = [];
  try {
    symbols = JSON.parse(row.symbols || '[]');
  } catch {
    symbols = [];
  }
  return {
    id: row.id,
    name: row.name,
    symbols,
    lot: row.lot,
    direction: row.direction,
    description: row.description || '',
    mediaUrl: row.media_path ? `/uploads/eas/${path.basename(row.media_path)}` : null,
    mediaKind: row.media_kind || null,
    mediaMime: row.media_mime || null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
  };
}

function listEas() {
  return db
    .prepare(`SELECT * FROM eas ORDER BY created_at DESC`)
    .all()
    .map(publicEa);
}

function getEa(id) {
  const row = db.prepare(`SELECT * FROM eas WHERE id = ?`).get(id);
  return publicEa(row);
}

function createEa({
  name,
  symbols,
  lot = 0.01,
  direction = 'both',
  description = '',
  createdBy = null,
  mediaFile = null,
}) {
  const cleaned = String(name || '').trim();
  if (!cleaned) {
    return { ok: false, status: 400, error: 'EA name is required.' };
  }
  const symbolList = Array.isArray(symbols)
    ? symbols.map((s) => String(s).trim().toUpperCase()).filter(Boolean)
    : [];
  if (!symbolList.length) {
    return { ok: false, status: 400, error: 'Add at least one symbol / pair.' };
  }

  let mediaPath = null;
  let mediaKind = null;
  let mediaMime = null;
  if (mediaFile) {
    const ext = path.extname(mediaFile.originalname || '').toLowerCase() || guessExt(mediaFile.mimetype);
    const filename = `${newId('media')}${ext}`;
    const dest = path.join(uploadsRoot, filename);
    fs.writeFileSync(dest, mediaFile.buffer);
    mediaPath = dest;
    mediaMime = mediaFile.mimetype || null;
    mediaKind = (mediaMime || '').startsWith('video/') ? 'video' : 'image';
  }

  const id = newId('ea');
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO eas
     (id, name, symbols, lot, direction, description, media_path, media_kind, media_mime, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    cleaned,
    JSON.stringify(symbolList),
    Number(lot) || 0.01,
    String(direction || 'both'),
    String(description || '').trim(),
    mediaPath,
    mediaKind,
    mediaMime,
    createdBy,
    createdAt,
  );

  return { ok: true, ea: getEa(id) };
}

function deleteEa(id) {
  const row = db.prepare(`SELECT * FROM eas WHERE id = ?`).get(id);
  if (!row) return { ok: false, status: 404, error: 'EA not found.' };
  if (row.media_path && fs.existsSync(row.media_path)) {
    try {
      fs.unlinkSync(row.media_path);
    } catch {
      // ignore
    }
  }
  db.prepare(`DELETE FROM eas WHERE id = ?`).run(id);
  return { ok: true };
}

function guessExt(mime) {
  if (!mime) return '.bin';
  if (mime.includes('png')) return '.png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('gif')) return '.gif';
  if (mime.includes('mp4')) return '.mp4';
  if (mime.includes('webm')) return '.webm';
  if (mime.includes('quicktime')) return '.mov';
  return '.bin';
}

function eaSnapshot(ea) {
  if (!ea) return null;
  return {
    id: ea.id,
    name: ea.name,
    symbols: ea.symbols,
    lot: ea.lot,
    direction: ea.direction,
    description: ea.description || '',
    mediaUrl: ea.mediaUrl,
    mediaKind: ea.mediaKind,
    mediaMime: ea.mediaMime,
  };
}

module.exports = {
  listEas,
  getEa,
  createEa,
  deleteEa,
  eaSnapshot,
  uploadsRoot,
};
