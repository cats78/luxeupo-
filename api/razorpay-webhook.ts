import crypto from 'crypto';

function cleanVal(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

function getWebhookSecret(): string {
  let secret = cleanVal(process.env.RAZORPAY_WEBHOOK_SECRET);
  if (!secret) {
    secret = 'luxeupho_live_webhook_secret_2026';
  }
  return secret;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed. Webhooks require POST.' });
  }

  const signature = req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature'];

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Signature header missing' });
  }

  try {
    let rawBody = '';
    if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf8');
    } else if (req.rawBody) {
      rawBody = req.rawBody;
    } else {
      rawBody = JSON.stringify(req.body);
    }

    const webhookSecret = getWebhookSecret();
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      console.warn('Razorpay webhook signature verification failed.');
      return res.status(400).json({ status: 'error', message: 'Invalid webhook signature.' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log(`Razorpay Webhook Verified: [${event?.event}]`);

    return res.status(200).json({ status: 'ok', received: true, event: event?.event });
  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({ status: 'error', message: error?.message || 'Webhook failed.' });
  }
}
