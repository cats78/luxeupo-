import crypto from 'crypto';

// Server-side credentials (never exposed to frontend code)
const VALID_CREDENTIALS: Record<string, string[]> = {
  hunain: ['786', '007'],
  riyan: ['7878', '006'],
  owner: ['7777', '008'],
  admin: ['786', '7878', '7777', '007', '006', '008', 'admin123', 'luxeupho'],
  luxeupho: ['786', '7878', '7777', '007', '006', '008', 'luxe2026', 'admin'],
};

function generateAdminToken(username: string): string {
  const secret = process.env.SESSION_SECRET || 'luxeupho-secret-key-2026';
  const timestamp = Date.now();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${username}:${timestamp}`)
    .digest('hex');
  return Buffer.from(JSON.stringify({ username, timestamp, signature })).toString('base64');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

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
    return res.status(200).json({
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
}
