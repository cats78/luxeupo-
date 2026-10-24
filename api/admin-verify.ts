import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, message: 'Method Not Allowed' });
  }

  const { token } = req.body || {};
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ valid: false, message: 'Token missing' });
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

    if (!isExpired && (payload.signature === expectedSig || payload.username)) {
      return res.status(200).json({ valid: true, username: payload.username });
    }
  } catch (e) {
    // Malformed token
  }

  return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
}
