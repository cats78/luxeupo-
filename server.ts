import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Admin Credentials (Never exposed to frontend code)
const VALID_CREDENTIALS: Record<string, string[]> = {
  hunain: ['786', '007'],
  riyan: ['7878', '006'],
  owner: ['7777', '008'],
  admin: ['786', '7878', '7777', '007', '006', '008', 'admin123', 'luxeupho'],
  luxeupho: ['786', '7878', '7777', '007', '006', '008', 'luxe2026', 'admin'],
};

// Cryptographic token generator
function generateAdminToken(username: string): string {
  const secret = process.env.SESSION_SECRET || 'luxeupho-secret-key-2026';
  const timestamp = Date.now();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${username}:${timestamp}`)
    .digest('hex');
  return Buffer.from(JSON.stringify({ username, timestamp, signature })).toString('base64');
}

// Server-side Authentication API Route
app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.',
    });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  const allowedPasswords = VALID_CREDENTIALS[cleanUser];

  if (allowedPasswords && allowedPasswords.includes(cleanPass)) {
    const token = generateAdminToken(cleanUser);
    return res.json({
      success: true,
      token,
      user: {
        username: username.trim(),
        role: 'super_admin',
        loginTime: new Date().toISOString(),
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid administrator credentials. Access denied.',
  });
});

// Verify token endpoint
app.post('/api/admin-verify', (req, res) => {
  const { token } = req.body || {};
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const secret = process.env.SESSION_SECRET || 'luxeupho-secret-key-2026';
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${payload.username}:${payload.timestamp}`)
      .digest('hex');

    // Token expires after 7 days
    const isExpired = Date.now() - payload.timestamp > 7 * 24 * 60 * 60 * 1000;

    if (!isExpired && payload.signature === expectedSig) {
      return res.json({ valid: true, username: payload.username });
    }
  } catch (e) {
    // invalid token format
  }

  return res.status(401).json({ valid: false });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In dev mode, mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LUXEUPHO server running on port ${PORT}`);
  });
}

startServer();
