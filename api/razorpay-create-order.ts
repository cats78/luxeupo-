import crypto from 'crypto';

interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedMaterial?: string;
  selectedColor?: string;
  selectedSize?: string;
}

interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  notes?: string;
}

function cleanVal(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

function getCredentials() {
  let keyId = cleanVal(process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID);
  let keySecret = cleanVal(process.env.RAZORPAY_KEY_SECRET);

  if (!keyId) {
    keyId = 'rzp_live_Trog7wtFncRCsy';
  }
  if (!keySecret) {
    keySecret = '71j7PGiSVj1IEyw581gGVaRw';
  }

  return { keyId, keySecret };
}

export default async function handler(req: any, res: any) {
  // CORS Headers
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
          message: 'Invalid JSON request payload.',
        });
      }
    }

    const { items, customer } = body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided for checkout.',
      });
    }

    if (!customer?.name || !customer?.phone || !customer?.shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, mobile number, and complete delivery address.',
      });
    }

    const { keyId, keySecret } = getCredentials();

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay API credentials missing on server. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      });
    }

    // Calculate amounts safely in paise
    let subtotal = 0;
    for (const item of items) {
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const price = Math.max(0, Number(item.price) || 0);
      subtotal += price * qty;
    }

    const deliveryFee = 0; // Complimentary white-glove setup across India
    const total = subtotal + deliveryFee;
    const amountInPaise = Math.round(total * 100);

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

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await razorpayResponse.text();
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Razorpay non-JSON response:', responseText);
      return res.status(502).json({
        success: false,
        message: `Razorpay upstream error (${razorpayResponse.status}): ${responseText.slice(0, 100)}`,
      });
    }

    if (!razorpayResponse.ok || !data.id) {
      const errorMsg = data?.error?.description || data?.message || 'Failed to create Razorpay order.';
      console.error('Razorpay order creation rejected:', data);
      return res.status(400).json({
        success: false,
        message: `Razorpay Error: ${errorMsg}`,
      });
    }

    return res.status(200).json({
      success: true,
      razorpayOrderId: data.id,
      amountInPaise: data.amount,
      currency: data.currency,
      keyId,
      orderNumber,
      subtotal,
      deliveryFee,
      total,
    });
  } catch (error: any) {
    console.error('Server error in razorpay-create-order handler:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error while processing order.',
    });
  }
}
