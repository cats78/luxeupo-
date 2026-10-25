import { verifyRazorpayWebhookSignature } from './_razorpay';

// Optional config for Vercel Serverless Function to keep raw stream if needed
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed. Razorpay webhooks require POST.' });
  }

  const signature = req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature'];

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Razorpay signature header (x-razorpay-signature) missing.' });
  }

  try {
    // Determine raw string body for cryptographic HMAC verification
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

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.warn('Razorpay webhook signature verification failed.');
      return res.status(400).json({ status: 'error', message: 'Invalid webhook signature.' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventType = event?.event;
    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;

    console.log(`[Razorpay Webhook] Successfully Verified: ${eventType}`, {
      paymentId: paymentEntity?.id,
      orderId: paymentEntity?.order_id || orderEntity?.id,
      amount: paymentEntity?.amount ? `₹${paymentEntity.amount / 100}` : undefined,
      status: paymentEntity?.status,
    });

    // Handle payment events
    switch (eventType) {
      case 'payment.captured':
      case 'order.paid':
        console.log(`Payment confirmed for order: ${paymentEntity?.order_id || orderEntity?.id}`);
        break;
      case 'payment.failed':
        console.warn(`Payment failed for order: ${paymentEntity?.order_id}`);
        break;
      default:
        console.log(`Razorpay event acknowledged: ${eventType}`);
        break;
    }

    // Razorpay requires a 200 OK response within 5 seconds to prevent retries
    return res.status(200).json({ status: 'ok', received: true, event: eventType });
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error);
    return res.status(500).json({ status: 'error', message: error?.message || 'Webhook processing failed.' });
  }
}
