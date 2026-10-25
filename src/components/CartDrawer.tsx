import React from 'react';
import { X, Trash2, ShoppingBag, MessageCircle, Phone, Sparkles, AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

interface CartDrawerProps {
  onOpenNotice?: () => void;
  onOpenCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenNotice, onOpenCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    total,
    openCheckout
  } = useCart();
  const { settings } = useSettings();

  const handleCheckoutClick = () => {
    if (onOpenCheckout) {
      onOpenCheckout();
    } else {
      openCheckout();
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E5DBCB] shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header (Golden/Warm Theme) */}
          <div className="p-5 sm:p-6 bg-white border-b border-[#E7E5E4] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-normal text-[#1C1917] tracking-wide leading-none">
                  Your Shopping Bag
                </h2>
                <span className="text-xs text-[#78716C] mt-0.5 block font-light">
                  {items.length} {items.length === 1 ? 'selected piece' : 'selected pieces'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-[#FAF8F5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pending Payment Notice Announcement Strip */}
          <div className="bg-[#FAF0DD] border-b border-[#E8DFC9] px-5 py-3 text-xs text-[#8C7654] shrink-0">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#B88E52] shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-medium block text-[#1C1917]">
                  Storefront Launch Update:
                </span>
                <span className="font-light">
                  We’re creating a smooth shopping experience for you. Online ordering and payments will be available soon.
                </span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#E7E5E4]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#78716C]">
                <div className="w-16 h-16 rounded-full bg-[#FAF0DD] flex items-center justify-center text-[#B88E52] mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-serif text-lg font-normal text-[#1C1917] mb-1">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-[#78716C] max-w-xs mb-6 leading-relaxed font-light">
                  Explore our curated architectural furniture and select your signature pieces.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#B88E52] hover:bg-[#A57D43] text-white text-xs font-normal uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={idx} className="pt-4 first:pt-0 flex gap-4">
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-[#E7E5E4] shrink-0 bg-white"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-sm text-[#1C1917] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-[#A8A29E] hover:text-red-700 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#78716C] space-y-0.5 mt-0.5">
                        {item.selectedColor && (
                          <div>Color: <span className="font-medium text-[#1C1917]">{item.selectedColor}</span></div>
                        )}
                        {item.selectedMaterial && (
                          <div>Material: <span className="font-medium text-[#1C1917]">{item.selectedMaterial}</span></div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#D6D3D1] bg-white rounded-md text-xs">
                        <button
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          className="px-2.5 py-1 font-normal hover:bg-[#FAF8F5]"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-normal text-[#1C1917]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          className="px-2.5 py-1 font-normal hover:bg-[#FAF8F5]"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-normal text-[#1C1917]">
                        ₹ {(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Temporarily Disabled Payments Notice */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 bg-white border-t border-[#E7E5E4] space-y-4 shrink-0 shadow-lg">
              <div className="space-y-1.5 text-xs text-[#57534E]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-normal text-[#1C1917]">₹ {subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>White-Glove Pan-India Setup</span>
                  <span className="font-normal text-[#3E7B54]">Complimentary</span>
                </div>
                <div className="flex justify-between text-base font-normal text-[#1C1917] pt-2 border-t border-[#F5F5F4]">
                  <span>Estimated Total</span>
                  <span>₹ {total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Online Checkout Button (Razorpay) */}
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 bg-[#B88E52] hover:bg-[#A57D43] text-white text-xs font-normal uppercase tracking-[0.14em] rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹ {total.toLocaleString('en-IN')} with Razorpay</span>
              </button>

              {/* Informational Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#78716C]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B88E52]" />
                <span>UPI • PhonePe • Google Pay • Cards • NetBanking</span>
              </div>

              {/* Direct Concierge Contact Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={`https://wa.me/91${settings.phone}?text=${encodeURIComponent(`Hello LUXEUPHO, I would like to reserve pieces in my shopping bag: ${items.map(i => `${i.product.name} (Qty ${i.quantity})`).join(', ')}. Total: ₹${total.toLocaleString('en-IN')}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-[#25D366] hover:bg-[#1EBE5B] text-white text-xs font-normal uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Concierge</span>
                </a>

                <a
                  href={`tel:${settings.phone}`}
                  className="py-3 px-3 bg-[#B88E52] hover:bg-[#A57D43] text-white text-xs font-normal uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {settings.phone}</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
