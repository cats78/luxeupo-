import React, { useState } from 'react';
import {
  ShoppingBag,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailViewProps {
  product: Product;
  onNavigateHome: () => void;
  onBuyNow: (product: Product, quantity: number, selectedColor: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onNavigateHome,
  onBuyNow,
}) => {
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // 4 Color Swatches matching reference image
  const colorOptions = [
    { name: 'Cream', hex: '#EBE5DA' },
    { name: 'Charcoal', hex: '#3B4856' },
    { name: 'Cognac', hex: '#8E5E3B' },
    { name: 'Forest', hex: '#4F5E4D' },
  ];

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85'];

  // Pad or slice to have 4 thumbnails as in reference image
  const displayThumbnails = [
    images[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=85',
    images[1] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=85',
    images[2] || 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=85',
    images[3] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=85',
  ];

  const currentImage = displayThumbnails[activeImageIndex] || displayThumbnails[0];

  const handleAddToCart = () => {
    addToCart(product, quantity, undefined, colorOptions[selectedColorIndex].name, undefined);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, quantity, colorOptions[selectedColorIndex].name);
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen text-[#1C1917] flex flex-col justify-between">
      
      {/* Product Detail Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        {/* Back Link */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#1C1917] mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </button>

        {/* 2-Column Product Layout (Exact match with bottom-right reference image) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Gallery with 4 Vertical Thumbnails + 1 Large Main Image */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 items-start">
            
            {/* 4 Small Vertical Thumbnails */}
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 shrink-0 overflow-x-auto sm:overflow-visible w-full sm:w-auto">
              {displayThumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-white ${
                    activeImageIndex === idx
                      ? 'border-[#B88E52] shadow-sm'
                      : 'border-[#E7E5E4] hover:border-[#D6D3D1] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Large Main Image */}
            <div className="order-1 sm:order-2 flex-1 w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#E7E5E4] shadow-sm">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
            </div>

          </div>

          {/* Right: Product Info & Actions (Exact match from reference image) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
              {product.name}
            </h1>

            {/* Pricing Row: Price, Strikethrough, and Gold Discount Badge */}
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-[#1C1917]">
                ₹ {product.price.toLocaleString('en-IN')}
              </span>

              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-[#A8A29E] line-through font-normal">
                  ₹ {product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}

              {product.discountPercent && product.discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded bg-[#FAF5EC] text-[#B88E52] border border-[#E8DFC9] text-xs font-bold uppercase tracking-wide">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Ratings Row: ★★★★★ (4.8) 120 Reviews */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex text-[#B88E52]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#B88E52]" />
                ))}
              </div>
              <span className="font-semibold text-[#1C1917]">(4.8)</span>
              <span className="text-[#78716C]">120 Reviews</span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Color Swatches */}
            <div className="space-y-2 pt-1">
              <span className="block text-xs font-semibold text-[#1C1917]">
                Color
              </span>
              <div className="flex items-center gap-3">
                {colorOptions.map((color, idx) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      selectedColorIndex === idx
                        ? 'ring-2 ring-offset-2 ring-[#B88E52] scale-110'
                        : 'border-black/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-2 pt-1">
              <span className="block text-xs font-semibold text-[#1C1917]">
                Quantity
              </span>
              <div className="inline-flex items-center border border-[#D6D3D1] rounded-md bg-white text-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 font-bold hover:bg-[#FAF8F5] transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1.5 font-semibold text-[#1C1917] min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 font-bold hover:bg-[#FAF8F5] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart (Caramel) & Buy Now (White) */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-md bg-[#B88E52] hover:bg-[#A57D43] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNowClick}
                className="w-full py-3.5 px-6 rounded-md bg-white hover:bg-[#FAF8F5] text-[#1C1917] border border-[#1C1917] font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Zap className="w-4 h-4 fill-[#1C1917]" />
                <span>Buy Now</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Value Propositions Bar (Exact match from bottom-right reference image) */}
      <div className="bg-white border-t border-[#E7E5E4] py-6 shadow-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* 1. Premium Quality */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1C1917] leading-snug">
                  Premium Quality
                </h4>
                <p className="text-xs text-[#78716C]">
                  Built to last
                </p>
              </div>
            </div>

            {/* 2. Free Delivery */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <Truck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1C1917] leading-snug">
                  Free Delivery
                </h4>
                <p className="text-xs text-[#78716C]">
                  Across India
                </p>
              </div>
            </div>

            {/* 3. Secure Payment */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <CreditCard className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1C1917] leading-snug">
                  Secure Payment
                </h4>
                <p className="text-xs text-[#78716C]">
                  PhonePe &amp; UPI Only
                </p>
              </div>
            </div>

            {/* 4. Easy Returns */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <RotateCcw className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1C1917] leading-snug">
                  Easy Returns
                </h4>
                <p className="text-xs text-[#78716C]">
                  7 Days Policy
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
