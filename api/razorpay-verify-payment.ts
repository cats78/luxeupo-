import { verifyRazorpayPaymentSignature } from '../src/server/razorpayService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Use POST.',
    });
  }

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

    const isValid = verifyRazorpayPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

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
