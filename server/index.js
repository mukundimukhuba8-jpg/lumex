const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const {
  authMiddleware,
  requireActiveLicense,
  requireApproved,
  registerUser,
  loginUser,
  activateLicenseForUser,
  licensePayload,
  publicUser,
  sessionPayload,
  listSubscriptions,
  setAccessStatus,
  subscriptionStats,
  seedDemoLicenses,
} = require('./auth');
const {
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
  adminOrPortalMiddleware,
  requireSuperOrKey,
  publicPortalAdmin,
} = require('./portal');
const { listEas, createEa, deleteEa, uploadsRoot } = require('./eas');

seedDemoLicenses();
seedSuperAdmin().catch((err) => console.error('seed super admin failed', err));

const app = express();
const PORT = Number(process.env.LUMEXAI_API_PORT || process.env.PORT || 8787);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      (file.mimetype || '').startsWith('image/') ||
      (file.mimetype || '').startsWith('video/');
    cb(ok ? null : new Error('Only image or video uploads are allowed.'), ok);
  },
});

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use('/uploads/eas', express.static(uploadsRoot));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'LUMEXAI', time: new Date().toISOString() });
});

/** Client auth */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body || {};
    const result = await registerUser({ email, firstName, lastName });
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.resumed ? 200 : 201).json({
      token: result.token,
      user: result.user,
      license: result.license,
      accessStatus: result.accessStatus,
      next: result.next,
    });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ error: 'Unable to create account. Try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body || {};
    const result = await loginUser({ email });
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.json({
      token: result.token,
      user: result.user,
      license: result.license,
      accessStatus: result.accessStatus,
      next: result.next,
    });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Unable to sign in. Try again.' });
  }
});

/** App login with license key + email (one email locked until release) */
app.post('/api/auth/license-login', async (req, res) => {
  try {
    const { email, licenseKey, firstName, lastName } = req.body || {};
    const result = await loginWithLicense({
      email,
      licenseKey,
      firstName,
      lastName,
    });
    if (!result.ok) {
      return res
        .status(result.status)
        .json({ error: result.error, code: result.code });
    }
    return res.json({
      token: result.token,
      user: result.user,
      license: result.license,
      accessStatus: result.accessStatus,
      next: result.next,
      message: result.message,
    });
  } catch (err) {
    console.error('license-login error', err);
    return res.status(500).json({ error: 'Unable to sign in with license. Try again.' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(sessionPayload(req.user));
});

app.post('/api/license/activate', authMiddleware, requireApproved, (req, res) => {
  try {
    const { licenseKey } = req.body || {};
    const result = activateLicenseForUser(req.user.id, licenseKey);
    if (!result.ok) {
      return res
        .status(result.status)
        .json({ error: result.error, code: result.code });
    }
    return res.json({
      license: result.license,
      message: result.message,
      next: 'dashboard',
    });
  } catch (err) {
    console.error('activate error', err);
    return res.status(500).json({ error: 'Unable to activate license. Try again.' });
  }
});

app.get('/api/dashboard/summary', authMiddleware, requireActiveLicense, (req, res) => {
  res.json({
    ok: true,
    product: 'LUMEXAI',
    user: publicUser(req.user),
    license: licensePayload(req.license),
    message: 'Welcome to your LUMEXAI dashboard.',
  });
});

app.get('/api/protected/status', authMiddleware, requireActiveLicense, (req, res) => {
  res.json({
    ok: true,
    licensed: true,
    approved: true,
    userId: req.user.id,
  });
});

/** Portal admin signup / login */
app.post('/api/portal/register', async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body || {};
    const result = await registerPortalAdmin({
      email,
      firstName,
      lastName,
      password,
    });
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(201).json(result);
  } catch (err) {
    console.error('portal register error', err);
    return res.status(500).json({ error: 'Unable to register portal admin.' });
  }
});

app.post('/api/portal/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await loginPortalAdmin({ email, password });
    if (!result.ok) {
      return res.status(result.status).json({
        error: result.error,
        code: result.code,
        admin: result.admin,
      });
    }
    return res.json(result);
  } catch (err) {
    console.error('portal login error', err);
    return res.status(500).json({ error: 'Unable to sign in to portal.' });
  }
});

app.get('/api/portal/me', adminOrPortalMiddleware, (req, res) => {
  res.json({ admin: publicPortalAdmin(req.portalAdmin) });
});

/** Super Admin — subscriptions (app users) */
app.get('/api/admin/subscriptions', adminOrPortalMiddleware, (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  res.json({
    stats: subscriptionStats(),
    subscribers: listSubscriptions({ status }),
  });
});

app.post(
  '/api/admin/subscriptions/:id/approve',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const result = setAccessStatus(req.params.id, 'approved');
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ ok: true, subscriber: result.subscriber, message: 'Subscriber approved.' });
  },
);

app.post(
  '/api/admin/subscriptions/:id/revoke',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const result = setAccessStatus(req.params.id, 'revoked');
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ ok: true, subscriber: result.subscriber, message: 'Access revoked.' });
  },
);

app.post(
  '/api/admin/subscriptions/:id/pending',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const result = setAccessStatus(req.params.id, 'pending');
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ ok: true, subscriber: result.subscriber, message: 'Moved back to pending.' });
  },
);

app.get('/api/admin/stats', adminOrPortalMiddleware, (_req, res) => {
  res.json({
    subscriptions: subscriptionStats(),
    portalAdmins: portalAdminStats(),
    licenses: licenseStats(),
  });
});

/** Super Admin — portal mentor approval */
app.get(
  '/api/admin/portal-admins',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const status = req.query.status ? String(req.query.status) : undefined;
    res.json({
      stats: portalAdminStats(),
      admins: listPortalAdmins({ status }),
    });
  },
);

app.post(
  '/api/admin/portal-admins/:id/approve',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const result = setPortalAdminStatus(req.params.id, 'approved');
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ ok: true, admin: result.admin, message: 'Portal admin approved.' });
  },
);

app.post(
  '/api/admin/portal-admins/:id/revoke',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const result = setPortalAdminStatus(req.params.id, 'revoked');
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ ok: true, admin: result.admin, message: 'Portal admin revoked.' });
  },
);

app.post(
  '/api/admin/portal-admins/:id/pending',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const result = setPortalAdminStatus(req.params.id, 'pending');
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ ok: true, admin: result.admin, message: 'Moved back to pending.' });
  },
);

/** Super Admin — license keys */
app.get('/api/admin/licenses', adminOrPortalMiddleware, (_req, res) => {
  res.json({ stats: licenseStats(), licenses: listLicenses() });
});

app.post(
  '/api/admin/licenses/generate',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const { email, firstName, lastName, eaId } = req.body || {};
    const result = generateLicenses({
      email,
      firstName,
      lastName,
      eaId,
      createdBy: req.portalAdmin?.id || null,
    });
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    res.status(201).json(result);
  },
);

app.post(
  '/api/admin/licenses/:id/release',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const { email, firstName, lastName } = req.body || {};
    const result = releaseLicense(req.params.id, { email, firstName, lastName });
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json(result);
  },
);

/** Super Admin — EAs with media */
app.get('/api/admin/eas', adminOrPortalMiddleware, (_req, res) => {
  res.json({ eas: listEas() });
});

app.post(
  '/api/admin/eas',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res, next) => {
    upload.single('media')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed.' });
      }
      next();
    });
  },
  (req, res) => {
    let symbols = req.body?.symbols;
    if (typeof symbols === 'string') {
      try {
        symbols = JSON.parse(symbols);
      } catch {
        symbols = String(symbols)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    const result = createEa({
      name: req.body?.name,
      symbols,
      lot: req.body?.lot,
      direction: req.body?.direction,
      description: req.body?.description,
      createdBy: req.portalAdmin?.id || null,
      mediaFile: req.file || null,
    });
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    res.status(201).json(result);
  },
);

app.delete(
  '/api/admin/eas/:id',
  adminOrPortalMiddleware,
  requireSuperOrKey,
  (req, res) => {
    const result = deleteEa(req.params.id);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ ok: true });
  },
);

const staticCandidates = [
  process.env.LUMEXAI_STATIC_DIR,
  path.join(__dirname, '..', 'dist-web'),
  '/tmp/edgeflow-web',
].filter(Boolean);

let staticRoot = null;
for (const candidate of staticCandidates) {
  try {
    const fs = require('fs');
    if (fs.existsSync(path.join(candidate, 'index.html'))) {
      staticRoot = candidate;
      break;
    }
  } catch {
    // ignore
  }
}

if (staticRoot) {
  app.use(express.static(staticRoot));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticRoot, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
  console.log(`[LUMEXAI] Serving static UI from ${staticRoot}`);
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[LUMEXAI] API listening on http://0.0.0.0:${PORT}`);
  console.log(`[LUMEXAI] Subscriptions:`, subscriptionStats());
  console.log(`[LUMEXAI] Licenses:`, licenseStats());
});
