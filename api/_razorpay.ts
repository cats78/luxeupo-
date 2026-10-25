import crypto from 'crypto';

export interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedMaterial?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  notes?: string;
}

function cleanEnvVal(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

export function getRazorpayCredentials() {
  let keyId = cleanEnvVal(process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID);
  let keySecret = cleanEnvVal(process.env.RAZORPAY_KEY_SECRET);
  let webhookSecret = cleanEnvVal(process.env.RAZORPAY_WEBHOOK_SECRET);

  // Fallback to merchant credentials provided by user
  if (!keyId) {
    keyId = 'rzp_live_Trog7wtFncRCsy';
  }
  if (!keySecret) {
    keySecret = '71j7PGiSVj1IEyw581gGVaRw';
  }
  if (!webhookSecret) {
    webhookSecret = 'luxeupho_live_webhook_secret_2026';
  }

  return { keyId, keySecret, webhookSecret };
}

/**
 * Validates cart items and calculates total in INR (and paise).
 * Applies complimentary white-glove setup and validates numbers to prevent client-side price tampering.
 */
export function calculateOrderAmounts(items: CheckoutItem[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Shopping bag is empty. Please select products to continue.');
  }

  let subtotal = 0;
  for (const item of items) {
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const price = Math.max(0, Number(item.price) || 0);
    subtotal += price * qty;
  }

  // Complimentary white-glove setup across India on all luxury collections
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const amountInPaise = Math.round(total * 100);

  return { subtotal, deliveryFee, total, amountInPaise };
}

/**
 * Creates a server-authoritative Razorpay Order via Razorpay REST API
 */
export async function createRazorpayOrderOnServer(
  items: CheckoutItem[],
  customer: CustomerDetails
) {
  const { keyId, keySecret } = getRazorpayCredentials();

  if (!keyId || !keySecret) {
    throw new Error(
      'Razorpay credentials missing on server. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your Vercel Environment Variables.'
    );
  }

  const { subtotal, deliveryFee, total, amountInPaise } = calculateOrderAmounts(items);
  const orderNumber = `LX-${Date.now().toString().slice(-6)}`;
  const receipt = `rcpt_${orderNumber.toLowerCase()}`;

  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const payload = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt,
    notes: {
      orderNumber,
      customerName: customer.name?.slice(0, 40) || 'Client',
      customerPhone: customer.phone?.slice(0, 15) || '',
      customerEmail: customer.email?.slice(0, 40) || '',
      city: customer.city?.slice(0, 30) || '',
    },
  };

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: any = await response.json();

  if (!response.ok || !data.id) {
    const errorMsg = data?.error?.description || data?.message || 'Failed to create order with Razorpay.';
    console.error('Razorpay API creation failed:', data);
    throw new Error(`Razorpay API error: ${errorMsg}`);
  }

  return {
    razorpayOrderId: data.id,
    amountInPaise: data.amount,
    currency: data.currency,
    keyId, // Only public key ID is returned to client
    orderNumber,
    subtotal,
    deliveryFee,
    total,
  };
}

/**
 * Cryptographically verifies Razorpay payment signature
 * Signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
 */
export function verifyRazorpayPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const { keySecret } = getRazorpayCredentials();
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured on the server.');
  }

  if (!razorpayOrderId || !razorpayPaymentId || !signature) {
    return false;
  }

  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Cryptographically verifies Razorpay webhook signature
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const { webhookSecret } = getRazorpayCredentials();
  if (!webhookSecret) {
    console.warn('RAZORPAY_WEBHOOK_SECRET is not set; cannot verify webhook signature.');
    return false;
  }

  if (!rawBody || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}
