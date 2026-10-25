import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

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

// ---------------- RAZORPAY PAYMENT ROUTES ---------------- //

// 1. Create Order
app.post('/api/razorpay-create-order', async (req, res) => {
  try {
    const { items, customer } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided for checkout.',
      });
    }

    if (!customer?.name || !customer?.phone || !customer?.shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, mobile number, and delivery address.',
      });
    }

    const { createRazorpayOrderOnServer } = await import('./src/server/razorpayService');
    const orderResult = await createRazorpayOrderOnServer(items, customer);

    return res.status(200).json({
      success: true,
      ...orderResult,
    });
  } catch (error: any) {
    console.error('Razorpay create order error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create Razorpay order.',
    });
  }
});

// 2. Verify Payment
app.post('/api/razorpay-verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Missing required Razorpay payment verification parameters.',
      });
    }

    const { verifyRazorpayPaymentSignature } = await import('./src/server/razorpayService');
    const isValid = verifyRazorpayPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      orderNumber: orderNumber || null,
      verifiedAt: new Date().toISOString(),
      message: 'Payment verified successfully.',
    });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      message: error?.message || 'Payment verification processing error.',
    });
  }
});

// 3. Webhook Receiver
app.post('/api/razorpay-webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) {
    return res.status(400).json({ status: 'error', message: 'Signature missing' });
  }

  try {
    const { verifyRazorpayWebhookSignature } = await import('./src/server/razorpayService');
    const rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);

    if (!isValid) {
      return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('Received Razorpay Webhook:', event?.event);
    return res.status(200).json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({ status: 'error', message: error?.message });
  }
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
