import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowLeft,
  Trash2,
  ShoppingBag,
  MessageCircle,
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
    removeFromCart,
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

    if (items.length === 0) {
      setErrorMessage('Your shopping bag is empty. Please select a piece to order.');
      return;
    }

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

    if (!postalCode.trim() || postalCode.replace(/\D/g, '').length < 6) {
      setErrorMessage('Please enter a valid 6-digit postal pincode.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Ensure Razorpay Script is ready
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK could not be loaded. Please check your internet connection or use WhatsApp concierge.');
      }

      // Step 2: Create server-authenticated Razorpay Order
      const createOrderRes = await fetch('/api/razorpay-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim(),
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            combination: i.selectedCombination || i.product.combination || '',
          })),
        }),
      });

      const responseText = await createOrderRes.text();
      let orderData: any;
      try {
        orderData = JSON.parse(responseText);
      } catch (pErr) {
        console.error('Non-JSON response from /api/razorpay-create-order:', responseText);
        throw new Error(`Server returned error (${createOrderRes.status}): ${responseText.slice(0, 150)}`);
      }

      if (!createOrderRes.ok || !orderData.orderId) {
        throw new Error(orderData.message || 'Failed to initialize payment gateway.');
      }

      // Step 3: Launch standard Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'LUXEUPHO HOME INTERIORS',
        description: `Order ${orderData.orderNumber} • ${items.length} Signature Piece(s)`,
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=200&q=80',
        order_id: orderData.orderId,
        prefill: {
          name: customerName.trim(),
          contact: cleanPhone,
          email: customerEmail.trim() || undefined,
        },
        theme: {
          color: '#B88E52',
          backdrop_color: '#121214',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (paymentResponse: any) => {
          try {
            // Step 4: Verify payment cryptographically on backend
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

            const verifyText = await verifyRes.text();
            let verifyData: any;
            try {
              verifyData = JSON.parse(verifyText);
            } catch (pErr) {
              console.error('Non-JSON response from /api/razorpay-verify-payment:', verifyText);
              throw new Error(`Verification server error (${verifyRes.status}): ${verifyText.slice(0, 150)}`);
            }

            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error(
                verifyData.message || 'Payment signature verification failed. Please contact concierge.'
              );
            }

            // Step 5: Save verified order into Firestore database with inventory check
            const orderItemsPayload: OrderItem[] = items.map((i) => ({
              productId: i.product.id,
              name: i.product.name,
              price: i.product.price,
              quantity: i.quantity,
              combination: i.selectedCombination || i.product.combination || undefined,
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
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border-2 border-[#D6C7B2] shadow-2xl overflow-hidden my-6">
        
        {/* Top Champagne Gold Accent Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-[#B88E52] via-[#DFCDAA] to-[#B88E52]" />

        {/* Header with Clear Back Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#E8DFC9] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="mr-1 p-1.5 rounded-lg border border-[#D6C7B2] bg-white text-[#78716C] hover:text-[#1C1917] hover:border-[#B88E52] transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer shadow-sm"
              title="Return to browsing"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-[#FAF0DD] border-2 border-[#E8DFC9] flex items-center justify-center text-[#B88E52]">
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
            onClick={handleClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-white transition-colors cursor-pointer"
            aria-label="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmed Order Success View */}
        {confirmedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-[#F3F8F4] border-2 border-[#3E7B54] rounded-full flex items-center justify-center mx-auto text-[#3E7B54]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 bg-[#FAF0DD] text-[#B88E52] text-xs font-semibold rounded-full uppercase tracking-wider">
                Order #{confirmedOrder.orderNumber} Confirmed
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#1C1917] mt-3">
                Thank you, {confirmedOrder.customerName}
              </h3>
              <p className="text-xs text-[#78716C] mt-1 max-w-md mx-auto leading-relaxed">
                Your payment of <strong className="text-[#1C1917]">₹ {confirmedOrder.total.toLocaleString('en-IN')}</strong> was verified (Ref: {confirmedOrder.paymentId}).
                Our atelier has received your architectural furniture specifications.
              </p>
            </div>

            {/* Confirmed Pieces */}
            <div className="bg-[#FAF8F5] rounded-xl border-2 border-[#E8DFC9] p-4 text-left max-h-48 overflow-y-auto space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C] block">
                Items in this order:
              </span>
              {confirmedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-[#E8DFC9] last:border-0">
                  <div className="truncate pr-2">
                    <span className="font-medium text-[#1C1917]">{it.name}</span>
                    {it.combination && (
                      <span className="ml-1 text-[10px] text-[#B88E52] font-semibold">
                        ({it.combination})
                      </span>
                    )}
                    <span className="text-[#78716C] ml-1">× {it.quantity}</span>
                  </div>
                  <span className="font-semibold text-[#1C1917] shrink-0">
                    ₹ {(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/91${settings.phone}?text=${encodeURIComponent(
                  `Hello LUXEUPHO, I have paid for Order #${confirmedOrder.orderNumber} (₹${confirmedOrder.total.toLocaleString('en-IN')}). Please provide production and dispatch schedule.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 bg-[#25D366] hover:bg-[#1EBE5B] text-white text-xs font-medium uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Track on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-6 bg-[#1C1917] hover:bg-black text-[#D4AF37] text-xs font-medium uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Close &amp; Return to Showroom
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form & Order Summary */
          <form onSubmit={handlePayNow} className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Complete Order Summary with Combination, Price, and Remove Button */}
            <div className="bg-[#FAF8F5] rounded-xl border-2 border-[#D6C7B2] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
                <h3 className="font-serif text-sm font-semibold text-[#1C1917] tracking-wide flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#B88E52]" />
                  <span>Order Summary ({items.length} {items.length === 1 ? 'piece' : 'pieces'})</span>
                </h3>
                <span className="text-xs text-[#78716C]">
                  Bill Total: <strong className="text-[#1C1917]">₹ {total.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              {items.length === 0 ? (
                <div className="py-6 text-center text-[#78716C] text-xs space-y-3">
                  <p className="text-sm font-medium text-[#1C1917]">Your shopping bag is empty.</p>
                  <p className="text-xs text-[#78716C]">All pieces were removed from your cart.</p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-[#B88E52] text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Return to Catalog
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E7E5E4] max-h-56 overflow-y-auto pr-1 space-y-2">
                  {items.map((item, idx) => {
                    const itemComb = item.selectedCombination || item.product.combination;
                    const lineTotal = item.product.price * item.quantity;
                    return (
                      <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-[#E7E5E4] shrink-0 bg-white"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1C1917] truncate">{item.product.name}</p>
                            {itemComb && (
                              <span className="inline-block text-[10px] text-[#B88E52] font-semibold bg-[#B88E52]/10 px-2 py-0.5 rounded border border-[#B88E52]/30 truncate max-w-[170px] mt-0.5">
                                Combination: {itemComb}
                              </span>
                            )}
                            <div className="text-[11px] text-[#78716C] mt-0.5">
                              ₹ {item.product.price.toLocaleString('en-IN')} × {item.quantity}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-[#1C1917]">
                            ₹ {lineTotal.toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(idx)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer border border-transparent hover:border-red-200"
                            title="Remove piece from Cart"
                            aria-label={`Remove ${item.product.name} from Cart`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Totals Breakdown */}
              {items.length > 0 && (
                <div className="pt-3 border-t border-[#E7E5E4] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#57534E]">
                    <span>Pieces Subtotal</span>
                    <span>₹ {subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#57534E]">
                    <span>White-Glove Pan-India Setup &amp; Delivery</span>
                    <span className="text-[#3E7B54] font-semibold">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#1C1917] pt-2 border-t border-[#E7E5E4]">
                    <span>Grand Total</span>
                    <span className="text-[#B88E52]">₹ {total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Details Form */}
            {items.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#121214] border-b-2 border-[#E8DFC9] pb-1">
                  1. Contact &amp; Client Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Aryan Malhotra"
                      className="w-full px-3.5 py-2.5 text-xs border-2 border-[#D6C7B2] rounded-lg focus:border-[#B88E52] focus:outline-none bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Phone Number (for Delivery &amp; UPI) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 text-xs border-2 border-[#D6C7B2] rounded-lg focus:border-[#B88E52] focus:outline-none bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Email Address (Optional, for digital tax invoice)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="aryan@example.com"
                    className="w-full px-3.5 py-2.5 text-xs border-2 border-[#D6C7B2] rounded-lg focus:border-[#B88E52] focus:outline-none bg-white"
                  />
                </div>

                <h4 className="text-xs uppercase tracking-wider font-bold text-[#121214] border-b-2 border-[#E8DFC9] pb-1 pt-2">
                  2. Destination &amp; White-Glove Setup
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Street Address / Villa / Apartment *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Complete address including building, apartment/villa number, street"
                    className="w-full px-3.5 py-2.5 text-xs border-2 border-[#D6C7B2] rounded-lg focus:border-[#B88E52] focus:outline-none bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bangalore"
                      className="w-full px-3.5 py-2.5 text-xs border-2 border-[#D6C7B2] rounded-lg focus:border-[#B88E52] focus:outline-none bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 400001"
                      className="w-full px-3.5 py-2.5 text-xs border-2 border-[#D6C7B2] rounded-lg focus:border-[#B88E52] focus:outline-none bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Special Instructions / Custom Requests
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Service lift available, call prior to dispatch"
                    className="w-full px-3.5 py-2.5 text-xs border-2 border-[#D6C7B2] rounded-lg focus:border-[#B88E52] focus:outline-none bg-white"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {items.length > 0 && (
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isProcessing || items.length === 0}
                  className="w-full py-3.5 px-4 bg-[#B88E52] hover:bg-[#A57D43] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Connecting to Razorpay...' : `Pay ₹ ${total.toLocaleString('en-IN')} with Razorpay`}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#78716C]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B88E52]" />
                  <span>Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards &amp; NetBanking</span>
                </div>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
};
