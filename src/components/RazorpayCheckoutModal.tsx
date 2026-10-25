import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Truck,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { createCustomerOrder } from '../firebase/firestore';
import { OrderItem } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ConfirmedOrderDetails {
  orderNumber: string;
  paymentId: string;
  total: number;
  customerName: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  items: OrderItem[];
}

export const RazorpayCheckoutModal: React.FC = () => {
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
  } = useCart();
  const { settings } = useSettings();

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Processing & State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderDetails | null>(null);

  if (!isCheckoutOpen) return null;

  // Ensures official Razorpay Checkout SDK is loaded and ready
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        let checks = 0;
        const interval = setInterval(() => {
          checks++;
          if (typeof window !== 'undefined' && window.Razorpay) {
            clearInterval(interval);
            resolve(true);
          } else if (checks > 30) {
            clearInterval(interval);
            resolve(false);
          }
        }, 100);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Form Validations
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!shippingAddress.trim() || shippingAddress.trim().length < 8) {
      setErrorMessage('Please enter your complete delivery street address.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Please enter your city.');
      return;
    }

    if (!/^\d{6}$/.test(postalCode.trim())) {
      setErrorMessage('Please enter a valid 6-digit PIN code.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your shopping bag is empty.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Ensure Razorpay SDK is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load the Razorpay checkout script. Check internet connectivity.');
      }

      // Step 2: Request server to create a Razorpay Order
      const response = await fetch('/api/razorpay-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            selectedMaterial: i.selectedMaterial,
            selectedColor: i.selectedColor,
            selectedSize: i.selectedSize,
          })),
          customer: {
            name: customerName.trim(),
            phone: cleanPhone,
            email: customerEmail.trim() || undefined,
            shippingAddress: shippingAddress.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            notes: notes.trim(),
          },
        }),
      });

      const orderData = await response.json();

      if (!response.ok || !orderData.success) {
        throw new Error(
          orderData.message ||
            'Could not initiate Razorpay order. If keys were recently added, make sure RAZORPAY_KEY_ID is active.'
        );
      }

      // Step 3: Configure Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'LUXEUPHO',
        description: `Order #${orderData.orderNumber} - Luxury Furniture`,
        image: settings.logoUrl || 'https://i.ibb.co/B2ynSdJp/Luxeupho-Gold-Home-Interiors-Emblem.png',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: customerName.trim(),
          contact: cleanPhone,
          email: customerEmail.trim() || undefined,
        },
        notes: {
          orderNumber: orderData.orderNumber,
          shippingAddress: `${shippingAddress.trim()}, ${city.trim()} - ${postalCode.trim()}`,
        },
        theme: {
          color: '#B88E52', // LUXEUPHO signature champagne gold
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Step 4: Verify payment cryptographically on server
            const verifyRes = await fetch('/api/razorpay-verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                orderNumber: orderData.orderNumber,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error(
                verifyData.message || 'Payment signature verification failed. Please contact concierge.'
              );
            }

            // Step 5: Save verified order into existing Firestore database
            const orderItemsPayload: OrderItem[] = items.map((i) => ({
              productId: i.product.id,
              name: i.product.name,
              price: i.product.price,
              quantity: i.quantity,
              image: i.product.images?.[0] || '',
              selectedMaterial: i.selectedMaterial,
              selectedColor: i.selectedColor,
              selectedSize: i.selectedSize,
            }));

            await createCustomerOrder({
              orderNumber: orderData.orderNumber,
              customerName: customerName.trim(),
              customerPhone: cleanPhone,
              customerEmail: customerEmail.trim() || undefined,
              shippingAddress: shippingAddress.trim(),
              city: city.trim(),
              postalCode: postalCode.trim(),
              notes: notes.trim() || undefined,
              items: orderItemsPayload,
              subtotal: orderData.subtotal,
              deliveryFee: orderData.deliveryFee || 0,
              total: orderData.total,
              status: 'Confirmed',
              paymentStatus: 'Paid & Verified',
              paymentMethod: 'Razorpay UPI & Cards',
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              paidAt: new Date().toISOString(),
            });

            // Step 6: Clear cart & show success screen
            clearCart();
            setConfirmedOrder({
              orderNumber: orderData.orderNumber,
              paymentId: paymentResponse.razorpay_payment_id,
              total: orderData.total,
              customerName: customerName.trim(),
              shippingAddress: shippingAddress.trim(),
              city: city.trim(),
              postalCode: postalCode.trim(),
              items: orderItemsPayload,
            });
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr);
            setErrorMessage(
              verifyErr.message ||
                `Payment received (Ref: ${paymentResponse.razorpay_payment_id}), but verification was pending. Our team will verify and confirm shortly.`
            );
          } finally {
            setIsProcessing(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on('payment.failed', (failResp: any) => {
        console.warn('Razorpay payment failed:', failResp);
        setErrorMessage(
          failResp?.error?.description ||
            'Payment was declined or cancelled. Please select another UPI or Card payment method.'
        );
        setIsProcessing(false);
      });

      rzpInstance.open();
      // Ensure the button state resets so it is not permanently stuck
      setTimeout(() => {
        setIsProcessing(false);
      }, 1200);
    } catch (err: any) {
      console.error('Razorpay Checkout initialization error:', err);
      setErrorMessage(err?.message || 'Could not initiate checkout. Please try again or reach our concierge.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#E5DBCB] shadow-2xl overflow-hidden my-6">
        
        {/* Top Champagne Gold Accent Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-[#B88E52] via-[#DFCDAA] to-[#B88E52]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFC9] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF0DD] border border-[#E8DFC9] flex items-center justify-center text-[#B88E52]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-normal text-[#1C1917] tracking-wide">
                {confirmedOrder ? 'Order Confirmed' : 'LUXEUPHO Secure Checkout'}
              </h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B88E52] block font-normal">
                Encrypted via Razorpay
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-[#F5F2ED] transition-colors"
            aria-label="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ---------------- CONFIRMED ORDER SUCCESS SCREEN ---------------- */}
        {confirmedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#B88E52] font-normal">
                Payment Verified &amp; Order Placed
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1C1917]">
                Thank you, {confirmedOrder.customerName}
              </h3>
              <p className="text-xs text-[#78716C] max-w-md mx-auto leading-relaxed">
                Your bespoke furniture order has been received. Our senior atelier concierge will contact you to coordinate scheduled white-glove delivery.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#FAF8F5] border border-[#E8DFC9] rounded-xl p-4 sm:p-5 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D9]">
                <span className="text-[#78716C]">Order Reference:</span>
                <span className="font-serif font-bold text-[#1C1917] tracking-wider text-sm">
                  #{confirmedOrder.orderNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#78716C]">Razorpay Payment ID:</span>
                <span className="font-mono text-[#57534E] text-[11px]">
                  {confirmedOrder.paymentId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#78716C]">Delivery Destination:</span>
                <span className="text-[#1C1917] font-medium text-right max-w-[220px] truncate">
                  {confirmedOrder.shippingAddress}, {confirmedOrder.city} - {confirmedOrder.postalCode}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E8E2D9] text-sm">
                <span className="font-normal text-[#1C1917]">Amount Paid:</span>
                <span className="font-serif font-bold text-[#B88E52]">
                  ₹ {confirmedOrder.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/91${settings.phone}?text=${encodeURIComponent(
                  `Hello LUXEUPHO, I have successfully placed order #${confirmedOrder.orderNumber} (Payment ID: ${confirmedOrder.paymentId}) for ₹${confirmedOrder.total.toLocaleString('en-IN')}. Please confirm dispatch timeline.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5B] text-white text-xs uppercase font-normal tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Concierge on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-6 bg-[#1C1917] hover:bg-[#B88E52] text-white text-xs uppercase font-normal tracking-wider rounded-lg transition-colors shadow-sm"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* ---------------- CHECKOUT INPUT FORM ---------------- */
          <form onSubmit={handlePayNow} className="p-6 sm:p-8 space-y-6">
            
            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Customer Details */}
            <div className="space-y-4">
              <h3 className="font-serif text-sm font-normal uppercase tracking-wider text-[#1C1917] pb-1 border-b border-[#F0EBE1]">
                1. Delivery &amp; Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#57534E] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#57534E] mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9704796170"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#57534E] mb-1">
                    Email Address (For Tax Receipt)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#57534E] mb-1">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 500034"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-[#57534E] mb-1">
                    Complete Shipping Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House/Villa No., Street, Area/Landmark"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#57534E] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#D6D3D1] text-[#1C1917] rounded-lg focus:border-[#B88E52] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Order Summary */}
            <div className="space-y-3 pt-2">
              <h3 className="font-serif text-sm font-normal uppercase tracking-wider text-[#1C1917] pb-1 border-b border-[#F0EBE1]">
                2. Order Summary
              </h3>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 divide-y divide-[#F5F2ED]">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80'}
                        alt={item.product.name}
                        className="w-10 h-10 rounded object-cover border border-[#E8DFC9] shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-normal text-[#1C1917] truncate block">
                          {item.product.name}
                        </span>
                        <span className="text-[10px] text-[#78716C] block">
                          Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="font-normal text-[#1C1917] shrink-0 ml-3">
                      ₹ {(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="p-3.5 bg-[#FAF8F5] border border-[#E8DFC9] rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-[#78716C]">
                  <span>Subtotal:</span>
                  <span>₹ {subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#78716C] items-center">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#3E7B54]" />
                    <span>White-Glove Pan-India Setup:</span>
                  </span>
                  <span className="text-[#3E7B54] font-medium">Complimentary</span>
                </div>
                <div className="flex justify-between items-center text-sm font-normal text-[#1C1917] pt-2 border-t border-[#E8E2D9]">
                  <span>Total Payable:</span>
                  <span className="font-serif text-base text-[#B88E52]">
                    ₹ {total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Trust Marks */}
            <div className="p-3 bg-[#FAF8F5] border border-[#E8DFC9] rounded-xl flex items-center justify-between text-[11px] text-[#78716C]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B88E52]" />
                <span>UPI, PhonePe, Google Pay, Credit/Debit Cards, EMI</span>
              </div>
              <span className="font-mono text-[10px] uppercase text-[#B88E52] font-semibold">
                Razorpay Secured
              </span>
            </div>

            {/* Error Notification (Bottom) */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-[#B88E52] hover:bg-[#A57D43] text-white text-xs font-normal uppercase tracking-[0.16em] rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Connecting to Razorpay...'
                  : `Pay ₹ ${total.toLocaleString('en-IN')} via Razorpay`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
