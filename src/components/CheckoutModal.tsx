import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  Truck,
  CreditCard,
  Building,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { createCustomerOrder } from '../firebase/firestore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { settings } = useSettings();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Field validations
    if (!customerName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile contact number.');
      return;
    }

    if (!shippingAddress.trim() || shippingAddress.trim().length < 8) {
      setErrorMessage('Please provide a complete delivery street address.');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Please enter your destination city.');
      return;
    }

    if (!postalCode.trim() || postalCode.replace(/\D/g, '').length < 6) {
      setErrorMessage('Please enter a valid 6-digit postal pincode.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your shopping bag is empty.');
      return;
    }

    setLoading(true);

    try {
      const orderNumber = `LX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderPayload = {
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        notes: notes.trim() || undefined,
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0] || '',
          selectedMaterial: item.selectedMaterial,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize
        })),
        subtotal,
        deliveryFee,
        total,
        status: 'Pending' as const,
        paymentStatus: 'Pending Verification' as const,
        paymentMethod: paymentMethod === 'cod'
          ? 'White-Glove Pay on Inspection (Cash / Card on Delivery)'
          : 'Direct Bank Transfer / Showroom UPI Verification',
      };

      const docId = await createCustomerOrder(orderPayload);
      clearCart();
      setCompletedOrder({
        orderId: docId,
        orderNumber
      });
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage('Unable to record order. Please try again or contact concierge at 9704796170.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCompletedOrder(null);
    onClose();
  };

  const confirmationWhatsapp = completedOrder
    ? encodeURIComponent(
        `Hello LUXEUPHO Concierge! I have placed order #${completedOrder.orderNumber} for ₹${total.toLocaleString('en-IN')}.\nCustomer: ${customerName} (${customerPhone}).\nPlease confirm delivery schedule.`
      )
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-sm border border-[#E8E2D9] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#121214] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880] font-bold block mb-1">
              LUXEUPHO Concierge Checkout
            </span>
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
              {completedOrder ? 'Order Confirmed' : 'Delivery & Verification'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[#3E7B54]/10 rounded-full flex items-center justify-center mx-auto text-[#3E7B54]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#9A7B4F] font-bold">
                Order Received Successfully
              </span>
              <h3 className="font-serif-luxury text-2xl font-bold text-[#121214] mt-1 mb-2">
                Order Reference: #{completedOrder.orderNumber}
              </h3>
              <p className="text-sm text-[#736D64] max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-[#121214]">{customerName}</strong>. Your order has been placed into our architectural dispatch queue. Our white-glove concierge team will reach out to verify access and scheduling.
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F6] border border-[#E8E2D9] rounded-sm text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-[#736D64]">Total Amount:</span>
                <span className="font-bold text-[#121214]">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736D64]">Payment Term:</span>
                <span className="font-medium text-[#121214]">
                  {paymentMethod === 'cod' ? 'Pay on Delivery / Inspection' : 'Bank Transfer / UPI'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736D64]">Contact Phone:</span>
                <span className="font-medium text-[#121214]">{customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736D64]">Delivery Destination:</span>
                <span className="font-medium text-[#121214]">{city} ({postalCode})</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href={`https://wa.me/91${settings.phone}?text=${confirmationWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 bg-[#25D366] text-white hover:bg-[#1EBE5B] text-xs font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify via WhatsApp</span>
              </a>
              <button
                onClick={handleClose}
                className="py-3 px-6 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
              >
                Return to Showroom
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#121214] border-b border-[#E8E2D9] pb-1">
                1. Customer &amp; Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5C564D] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Arjun Kapoor"
                    className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5C564D] mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9704796170"
                    className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#5C564D] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. arjun@luxuryresidence.com"
                    className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#121214] border-b border-[#E8E2D9] pb-1">
                2. Shipping &amp; White-Glove Destination
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C564D] mb-1">
                    Detailed Residence Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Apartment/Villa name, floor, street, landmark"
                    className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5C564D] mb-1">
                      City / State *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru, Delhi"
                      className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5C564D] mb-1">
                      Postal Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 500034"
                      className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5C564D] mb-1">
                    Special Customization / Delivery Instructions
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Service elevator available, dispatch after 15th"
                    className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-sm focus:border-[#9A7B4F] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Verification Method */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#121214] border-b border-[#E8E2D9] pb-1">
                3. Payment Term &amp; Verification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#9A7B4F] bg-[#FAF9F6]'
                      : 'border-[#E8E2D9] hover:border-[#C5A880]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 text-[#9A7B4F] focus:ring-[#9A7B4F]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#121214] block">
                      Pay on Delivery / Inspection
                    </span>
                    <span className="text-[11px] text-[#736D64] leading-relaxed block mt-0.5">
                      Inspect your furniture upon arrival; pay via Card or Cash to our technicians.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#9A7B4F] bg-[#FAF9F6]'
                      : 'border-[#E8E2D9] hover:border-[#C5A880]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mt-0.5 text-[#9A7B4F] focus:ring-[#9A7B4F]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#121214] block">
                      Bank Transfer / Showroom UPI
                    </span>
                    <span className="text-[11px] text-[#736D64] leading-relaxed block mt-0.5">
                      Direct invoice provided upon order verification with corporate bank details.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary & Submit */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E8E2D9] rounded-sm space-y-2 text-xs">
              <div className="flex justify-between text-[#736D64]">
                <span>Items ({items.reduce((a, b) => a + b.quantity, 0)})</span>
                <span className="font-semibold text-[#121214]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#736D64]">
                <span>White-Glove Pan-India Delivery &amp; Setup</span>
                <span className="font-semibold text-[#121214]">
                  {deliveryFee === 0 ? 'Complimentary' : `₹${deliveryFee.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#121214] pt-2 border-t border-[#E8E2D9]">
                <span>Grand Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white transition-all text-xs uppercase tracking-widest font-bold rounded-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                  <span>Place Order • ₹{total.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
