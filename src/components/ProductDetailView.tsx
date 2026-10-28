import React, { useState, useRef, useCallback } from 'react';
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
  Maximize2,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { Product, getColorHex } from '../types';
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

  // Optical Magnifier state (Multi-level scale, strictly without mentioning the word "zoom")
  const [opticalScale, setOpticalScale] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 50, y: 50, px: 0, py: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Fullscreen scale controls
  const [fullscreenScale, setFullscreenScale] = useState(1);
  const [fullscreenPointerPos, setFullscreenPointerPos] = useState({ x: 50, y: 50 });
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Color Swatches based on product.colors configured in Admin
  const colorOptions = React.useMemo(() => {
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.map((c) => ({
        name: c,
        hex: getColorHex(c),
      }));
    }
    return [
      { name: 'Ivory Cream', hex: '#F5F2EB' },
      { name: 'Charcoal Grey', hex: '#374151' },
      { name: 'Cognac Brown', hex: '#8E5E3B' },
      { name: 'Forest Green', hex: '#4F5E4D' },
    ];
  }, [product.colors]);

  // Uploaded product images
  const rawImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const images = Array.from(new Set(rawImages));
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85');
  }

  const currentImage = images[activeImageIndex] || images[0];

  const maxStock = typeof product.stock === 'number' ? Math.max(1, product.stock) : 99;
  const isOnePiece = product.stock === 1;

  // Handle pointer tracking for optical magnifier
  const updatePointer = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const py = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const x = (px / rect.width) * 100;
    const y = (py / rect.height) * 100;
    setPointerPos({ x, y, px, py });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovering(true);
    updatePointer(e.clientX, e.clientY);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovering(true);
    updatePointer(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    setIsHovering(true);
    updatePointer(e.touches[0].clientX, e.touches[0].clientY);
  };

  // Dedicated + (Plus) button handler for desktop and mobile
  const handleScaleUp = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setOpticalScale((prev) => {
      if (prev < 1.6) return 1.8;
      if (prev < 2.4) return 2.6;
      if (prev < 3.2) return 3.4;
      return 3.4;
    });
  };

  // Dedicated - (Minus) button handler for desktop and mobile
  const handleScaleDown = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setOpticalScale((prev) => {
      if (prev > 2.8) return 2.6;
      if (prev > 2.0) return 1.8;
      return 1;
    });
  };

  // Reset scale
  const handleResetScale = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setOpticalScale(1);
  };

  // Click image to toggle magnification
  const handleToggleMagnification = () => {
    setOpticalScale((prev) => (prev > 1 ? 1 : 2.6));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, undefined, colorOptions[selectedColorIndex].name, undefined, product.combination);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, Math.min(quantity, maxStock), colorOptions[selectedColorIndex].name);
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
          
          {/* Left: Gallery with Thumbnails + High-Precision Optical Magnifier Viewer */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 items-start">
            
            {/* Thumbnails (only if multiple images exist) */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 order-2 sm:order-1 shrink-0 overflow-x-auto sm:overflow-visible w-full sm:w-auto pb-2 sm:pb-0">
                {images.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setOpticalScale(1);
                    }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#B88E52] ring-2 ring-[#B88E52]/20 shadow-md scale-102'
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

            {/* Interactive Image Container with Optical Magnifier */}
            <div
              ref={containerRef}
              onClick={handleToggleMagnification}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsHovering(false)}
              className={`order-1 sm:order-2 flex-1 w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#E7E5E4] shadow-sm relative select-none group transition-all touch-none ${
                opticalScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
              }`}
            >
              {/* Base / Magnified Image Rendering */}
              <div className="w-full h-full relative overflow-hidden">
                <img
                  src={currentImage}
                  alt={product.name}
                  style={{
                    transformOrigin: `${pointerPos.x}% ${pointerPos.y}%`,
                    transform:
                      opticalScale > 1
                        ? `scale(${opticalScale})`
                        : isHovering
                        ? 'scale(1.08)'
                        : 'scale(1)',
                    transition: opticalScale > 1 ? 'transform 0.12s ease-out' : 'transform 0.3s ease-out',
                  }}
                  className="w-full h-full object-cover object-center pointer-events-none will-change-transform"
                />

                {/* Optical Floating Loupe Lens (Active during hover when not in multi-scale mode on desktop) */}
                {isHovering && opticalScale <= 1 && (
                  <div
                    style={{
                      left: `${pointerPos.px}px`,
                      top: `${pointerPos.py}px`,
                      transform: 'translate(-50%, -50%)',
                      backgroundImage: `url(${currentImage})`,
                      backgroundPosition: `${pointerPos.x}% ${pointerPos.y}%`,
                      backgroundSize: '350%',
                    }}
                    className="absolute w-36 h-36 rounded-full border-2 border-[#D4AF37] shadow-2xl pointer-events-none hidden md:block bg-no-repeat ring-4 ring-black/15 z-20 backdrop-blur-sm"
                  />
                )}
              </div>

              {/* Multi-angle indicator */}
              {images.length > 1 && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium pointer-events-none z-10 shadow-sm">
                  {activeImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Dedicated Floating Magnifier Controls with JUST + and - (Visible on both Desktop and Mobile) */}
              <div
                className="absolute bottom-3 right-3 flex items-center bg-white/95 backdrop-blur-md border-2 border-[#D6C7B2] rounded-xl shadow-xl p-1 gap-1 z-30 select-none touch-manipulation"
                onClick={(e) => e.stopPropagation()}
              >
                {/* + Button */}
                <button
                  type="button"
                  onClick={handleScaleUp}
                  className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-[#FAF8F5] hover:bg-[#B88E52] text-[#1C1917] hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer font-bold border border-[#E8DFC9]"
                  aria-label="Increase magnification"
                  title="+"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* - Button */}
                <button
                  type="button"
                  onClick={handleScaleDown}
                  disabled={opticalScale <= 1}
                  className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-[#FAF8F5] hover:bg-[#B88E52] text-[#1C1917] hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed border border-[#E8DFC9]"
                  aria-label="Decrease magnification"
                  title="-"
                >
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Fullscreen Expand Action Button (Top-Right) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenScale(1);
                  setIsFullscreen(true);
                }}
                className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white text-[#1C1917] shadow-md transition-all opacity-85 group-hover:opacity-100 z-10 cursor-pointer border border-[#E7E5E4]"
                aria-label="Expand view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Fullscreen Modal View with Interactive + and - */}
          {isFullscreen && (
            <div
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 select-none"
              onClick={() => setIsFullscreen(false)}
            >
              <div
                ref={fullscreenContainerRef}
                onClick={(e) => e.stopPropagation()}
                onMouseMove={(e) => {
                  if (!fullscreenContainerRef.current) return;
                  const rect = fullscreenContainerRef.current.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setFullscreenPointerPos({ x, y });
                }}
                onTouchMove={(e) => {
                  if (!fullscreenContainerRef.current || e.touches.length === 0) return;
                  const rect = fullscreenContainerRef.current.getBoundingClientRect();
                  const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
                  const y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
                  setFullscreenPointerPos({ x, y });
                }}
                className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl flex items-center justify-center"
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  style={{
                    transformOrigin: `${fullscreenPointerPos.x}% ${fullscreenPointerPos.y}%`,
                    transform: `scale(${fullscreenScale})`,
                    transition: 'transform 0.12s ease-out',
                  }}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl pointer-events-none"
                />

                {/* Fullscreen + and - Controls */}
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center bg-black/75 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-1.5 gap-1.5 z-50 text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setFullscreenScale((prev) => Math.min(prev + 0.8, 3.4))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-[#B88E52] text-white transition-all shadow-sm active:scale-95 cursor-pointer font-bold"
                    aria-label="Increase magnification"
                    title="+"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setFullscreenScale((prev) => Math.max(prev - 0.8, 1))}
                    disabled={fullscreenScale <= 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-[#B88E52] text-white transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease magnification"
                    title="-"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="absolute top-6 right-6 p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-full cursor-pointer transition-colors z-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Right: Product Info & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & Combination Badge */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-[#FAF8F5] text-[#B88E52] border border-[#E8DFC9]">
                  {product.category}
                </span>
                {product.combination && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#1C1917] text-[#D4AF37]">
                    Combination: {product.combination}
                  </span>
                )}
                {isOnePiece && (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-[#B88E52] text-white">
                    Only 1 piece available
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] tracking-wide">
                {product.name}
              </h1>
            </div>

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

            {/* Ratings Row */}
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
              <div className="flex items-center justify-between">
                <span className="block text-xs font-normal text-[#1C1917] uppercase tracking-wider">
                  Color:{' '}
                  <strong className="text-[#B88E52] font-semibold">
                    {colorOptions[selectedColorIndex]?.name || 'Standard'}
                  </strong>
                </span>
                <span className="text-[11px] text-[#78716C]">
                  {colorOptions.length} available
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {colorOptions.map((color, idx) => (
                  <button
                    key={color.name + idx}
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      selectedColorIndex === idx
                        ? 'border-[#B88E52] bg-[#FAF0DD]/80 ring-2 ring-[#B88E52]/25 font-semibold text-[#1C1917] shadow-xs'
                        : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] text-[#57534E]'
                    }`}
                    title={color.name}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-inner shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper with Stock Cap */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-normal text-[#1C1917] uppercase tracking-wider">
                  Quantity
                </span>
                {isOnePiece && (
                  <span className="text-xs font-semibold text-[#B88E52]">
                    Only 1 piece available
                  </span>
                )}
              </div>
              <div className="inline-flex items-center border border-[#D6D3D1] rounded-md bg-white text-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 font-normal hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1.5 font-semibold text-[#1C1917] min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= maxStock}
                  onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                  className={`px-3 py-1.5 font-normal transition-colors ${
                    quantity >= maxStock
                      ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                      : 'hover:bg-[#FAF8F5] cursor-pointer'
                  }`}
                  title={quantity >= maxStock ? (isOnePiece ? 'Only 1 piece available' : `Max available: ${maxStock}`) : 'Add quantity'}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart (Caramel) & Buy Now (White) */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-md bg-[#B88E52] hover:bg-[#A57D43] text-white font-normal text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
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
                className="w-full py-3.5 px-6 rounded-md bg-white hover:bg-[#FAF8F5] text-[#1C1917] border border-[#1C1917] font-normal text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-[#1C1917]" />
                <span>Buy Now</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Value Propositions Bar */}
      <div className="bg-white border-t border-[#E7E5E4] py-6 shadow-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Premium Quality
                </h4>
                <p className="text-xs text-[#78716C] font-light">
                  Artisanal Hardwood Frames
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <Truck className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Pan-India Delivery
                </h4>
                <p className="text-xs text-[#78716C] font-light">
                  White-Glove Placement
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <CreditCard className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  Secure Razorpay
                </h4>
                <p className="text-xs text-[#78716C] font-light">
                  UPI &amp; Cards Accepted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EC] flex items-center justify-center text-[#B88E52] shrink-0">
                <RotateCcw className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#1C1917] leading-snug">
                  10-Year Warranty
                </h4>
                <p className="text-xs text-[#78716C] font-light">
                  On Structural Integrity
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
