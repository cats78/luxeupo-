import { createRazorpayOrderOnServer } from './_razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Use POST.',
    });
  }

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

    const orderResult = await createRazorpayOrderOnServer(items, customer);

    return res.status(200).json({
      success: true,
      ...orderResult,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create Razorpay order.',
    });
  }
}
