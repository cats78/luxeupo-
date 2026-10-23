import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';
import { useSettings } from './SettingsContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedMaterial?: string, selectedColor?: string, selectedSize?: string) => void;
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

  const openPaymentNotice = () => {
    setIsPaymentNoticeOpen(true);
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
    selectedSize?: string
  ) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedMaterial === selectedMaterial &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          selectedMaterial: selectedMaterial || product.materials?.[0] || 'Standard Atelier Finish',
          selectedColor: selectedColor || product.colors?.[0] || 'Standard Tone',
          selectedSize: selectedSize || product.sizes?.[0] || 'Standard Dimension'
        }
      ];
    });
    // Requirement 8: After Add to Cart or payment interaction, display notice
    setIsPaymentNoticeOpen(true);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], quantity };
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
        openPaymentNotice
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
