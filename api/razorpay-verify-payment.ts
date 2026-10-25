import crypto from 'crypto';

function cleanVal(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

function getKeySecret(): string {
  let secret = cleanVal(process.env.RAZORPAY_KEY_SECRET);
  if (!secret) {
    secret = '71j7PGiSVj1IEyw581gGVaRw';
  }
  return secret;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Use POST.',
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Invalid JSON request payload.',
        });
      }
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Missing required Razorpay payment verification parameters.',
      });
    }

    const keySecret = getKeySecret();
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(razorpay_signature, 'utf-8')
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      console.warn('Razorpay signature verification failed for order:', razorpay_order_id);
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
}
