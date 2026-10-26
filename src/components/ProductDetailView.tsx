import React, { useState, useRef } from 'react';
import {
  ShoppingBag,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  ArrowLeft,
  Check,
  Box,
  Maximize2
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 3D Perspective Tilt state
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, lightX: 50, lightY: 50, isHovered: false });

  // 4 Color Swatches matching reference image
  const colorOptions = [
    { name: 'Cream', hex: '#EBE5DA' },
    { name: 'Charcoal', hex: '#3B4856' },
    { name: 'Cognac', hex: '#8E5E3B' },
    { name: 'Forest', hex: '#4F5E4D' },
  ];

  // Exactly the uploaded images, deduplicated, without artificial 4-image padding
  const rawImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const images = Array.from(new Set(rawImages));
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85');
  }

  const currentImage = images[activeImageIndex] || images[0];

  // Interactive 3D Perspective Physics
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateY: x * 16, // max 8 deg left/right
      rotateX: -y * 16, // max 8 deg up/down
      lightX: (x + 0.5) * 100,
      lightY: (y + 0.5) * 100,
      isHovered: true,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateY: x * 12,
      rotateX: -y * 12,
      lightX: (x + 0.5) * 100,
      lightY: (y + 0.5) * 100,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, lightX: 50, lightY: 50, isHovered: false });
  };

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
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#1C1917] mb-6 font-medium transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Catalogue</span>
        </button>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Gallery with Thumbnails (only if multiple exist) + 3D Interactive Depth Main Viewer */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 items-start">
            
            {/* Thumbnails only shown if more than 1 image was actually uploaded */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 order-2 sm:order-1 shrink-0 overflow-x-auto sm:overflow-visible w-full sm:w-auto pb-2 sm:pb-0">
                {images.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-white cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#B88E52] ring-2 ring-[#B88E52]/20 shadow-sm scale-102'
                        : 'border-[#E7E5E4] hover:border-[#D6D3D1] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Large Main Interactive Depth Viewer */}
            <div
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseLeave}
              style={{ perspective: '1100px' }}
              className="order-1 sm:order-2 flex-1 w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#E7E5E4] shadow-sm relative select-none cursor-crosshair group"
            >
              {/* 3D Tilted Image Container */}
              <div
                style={{
                  transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${tilt.isHovered ? 1.03 : 1}, ${tilt.isHovered ? 1.03 : 1}, 1)`,
                  transition: tilt.isHovered ? 'transform 0.08s ease-out' : 'transform 0.5s ease-out',
                }}
                className="w-full h-full relative"
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-opacity duration-300 pointer-events-none"
                />

                {/* Dynamic Realistic Specular Sheen Overlay */}
                <div
                  style={{
                    background: tilt.isHovered
                      ? `radial-gradient(circle at ${tilt.lightX}% ${tilt.lightY}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 45%, rgba(0,0,0,0.08) 100%)`
                      : 'transparent',
                    transition: 'background 0.1s ease-out',
                  }}
                  className="absolute inset-0 pointer-events-none"
                />
              </div>

              {/* Interactive Depth Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-normal pointer-events-none border border-white/10">
                <Box className="w-3 h-3 text-[#B88E52]" />
                <span>3D Depth Perspective</span>
              </div>

              {/* Multi-angle indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/50 backdrop-blur-md text-white text-[11px] font-medium pointer-events-none">
                  {activeImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Fullscreen Zoom preview trigger */}
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="absolute top-3 right-3 p-2 rounded-md bg-white/90 hover:bg-white text-[#1C1917] shadow-sm transition-all opacity-0 group-hover:opacity-100"
                title="Expand Fullscreen View"
                aria-label="Expand Fullscreen View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Fullscreen Modal View */}
          {isFullscreen && (
            <div
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              onClick={() => setIsFullscreen(false)}
            >
              <img
                src={currentImage}
                alt={product.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="absolute top-6 right-6 px-4 py-2 bg-white/20 hover:bg-white/40 text-white rounded-md text-xs uppercase tracking-wider"
              >
                Close (ESC)
              </button>
            </div>
          )}

          {/* Right: Product Info & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] tracking-wide">
              {product.name}
            </h1>

            {/* Pricing Row: Price, Strikethrough, and Gold Discount Badge */}
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-normal text-[#1C1917]">
                ₹ {product.price.toLocaleString('en-IN')}
              </span>

              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-[#A8A29E] line-through font-light">
                  ₹ {product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}

              {product.discountPercent && product.discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded bg-[#FAF5EC] text-[#B88E52] border border-[#E8DFC9] text-xs font-normal uppercase tracking-wide">
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
              <span className="font-normal text-[#1C1917]">(4.8)</span>
              <span className="text-[#78716C] font-light">120 Reviews</span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Color Swatches */}
            <div className="space-y-2 pt-1">
              <span className="block text-xs font-normal text-[#1C1917] uppercase tracking-wider">
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
              <span className="block text-xs font-normal text-[#1C1917] uppercase tracking-wider">
                Quantity
              </span>
              <div className="inline-flex items-center border border-[#D6D3D1] rounded-md bg-white text-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 font-normal hover:bg-[#FAF8F5] transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1.5 font-normal text-[#1C1917] min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 font-normal hover:bg-[#FAF8F5] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart (Caramel) & Buy Now (White) */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-md bg-[#B88E52] hover:bg-[#A57D43] text-white font-normal text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
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
                className="w-full py-3.5 px-6 rounded-md bg-white hover:bg-[#FAF8F5] text-[#1C1917] border border-[#1C1917] font-normal text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm"
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
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Premium Quality
                </h4>
                <p className="text-xs text-[#78716C] font-light">
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
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Free Delivery
                </h4>
                <p className="text-xs text-[#78716C] font-light">
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
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Secure Payment
                </h4>
                <p className="text-xs text-[#78716C] font-light">
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
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Easy Returns
                </h4>
                <p className="text-xs text-[#78716C] font-light">
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
