import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';
import { useSettings } from './SettingsContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedMaterial?: string,
    selectedColor?: string,
    selectedSize?: string,
    selectedCombination?: string
  ) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isPaymentNoticeOpen: boolean;
  setIsPaymentNoticeOpen: (open: boolean) => void;
  openPaymentNotice: () => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  openCheckout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxeupho_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentNoticeOpen, setIsPaymentNoticeOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const openPaymentNotice = () => {
    setIsPaymentNoticeOpen(true);
  };

  const openCheckout = () => {
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
  };

  useEffect(() => {
    try {
      localStorage.setItem('luxeupho_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedMaterial?: string,
    selectedColor?: string,
    selectedSize?: string,
    selectedCombination?: string
  ) => {
    const maxStock = typeof product.stock === 'number' ? Math.max(1, product.stock) : 99;
    const finalCombination = selectedCombination || product.combination || '';

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedMaterial === selectedMaterial &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize &&
          (item.selectedCombination || '') === finalCombination
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(next[existingIndex].quantity + quantity, maxStock);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          selectedCombination: finalCombination
        };
        return next;
      }

      const initialQty = Math.min(quantity, maxStock);
      return [
        ...prev,
        {
          product,
          quantity: initialQty,
          selectedMaterial: selectedMaterial || product.materials?.[0] || 'Standard Atelier Finish',
          selectedColor: selectedColor || product.colors?.[0] || 'Standard Tone',
          selectedSize: selectedSize || product.sizes?.[0] || 'Standard Dimension',
          selectedCombination: finalCombination
        }
      ];
    });
    // Open Cart Drawer to show items and proceed to Razorpay Checkout
    setIsCartOpen(true);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setItems((prev) => {
      if (!prev[index]) return prev;
      const product = prev[index].product;
      const maxStock = typeof product.stock === 'number' ? Math.max(1, product.stock) : 99;
      const safeQty = Math.min(quantity, maxStock);

      const next = [...prev];
      next[index] = { ...next[index], quantity: safeQty };
      return next;
    });
  };

  const removeFromCart = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeThreshold = settings.freeShippingMin || 25000;
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= freeThreshold ? 0 : 1500;
  const total = subtotal + deliveryFee;
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        total,
        totalCount,
        isCartOpen,
        setIsCartOpen,
        isPaymentNoticeOpen,
        setIsPaymentNoticeOpen,
        openPaymentNotice,
        isCheckoutOpen,
        setIsCheckoutOpen,
        openCheckout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
