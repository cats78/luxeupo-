import React, { useState } from 'react';
import { ShoppingBag, Eye, Sparkles, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80';
  const secondaryImage = product.images?.[1] || mainImage;

  const productUrl = `/product/${product.id}`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-sm border border-[#E8E2D9] overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#C5A880]/50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image Container with Link that opens in a NEW TAB */}
      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[4/3] overflow-hidden bg-[#F3F1EC] cursor-pointer"
        title={`Open ${product.name} details in new tab`}
      >
        <img
          src={hovered ? secondaryImage : mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#121214] text-[#E5D5BA] text-[10px] font-bold tracking-widest uppercase rounded-sm shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-[#C5A880]" />
              Signature
            </span>
          )}
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="inline-block px-2 py-0.5 bg-[#9A7B4F] text-white text-[10px] font-bold tracking-wider uppercase rounded-sm shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* "Opens in new tab" indicator badge on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
          <ExternalLink className="w-3 h-3 text-[#C5A880]" />
          <span>New Tab</span>
        </div>

        {/* Quick Add Overlay on bottom of image */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className={`w-full py-2 px-3 rounded-sm text-xs uppercase tracking-wider font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
              isAdding
                ? 'bg-[#4B6B56] text-white'
                : 'bg-[#121214] text-[#E5D5BA] hover:bg-[#C5A880] hover:text-[#121214]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Added to Bag!' : product.inStock ? 'Quick Add to Bag' : 'Out of Stock'}</span>
          </button>
        </div>
      </a>

      {/* Product Details Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#8C867D] uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            <span className={product.inStock ? 'text-[#3E7B54] font-medium' : 'text-[#A04040]'}>
              {product.inStock ? 'In Stock' : 'Bespoke Order'}
            </span>
          </div>

          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-serif-luxury text-base sm:text-lg font-bold text-[#121214] group-hover:text-[#9A7B4F] transition-colors line-clamp-1 mb-2"
          >
            {product.name}
          </a>

          <p className="text-xs text-[#736D64] line-clamp-2 font-light leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Color & Material previews */}
          {product.materials && product.materials.length > 0 && (
            <div className="text-[11px] text-[#8C867D] mb-3 flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-[#121214]">Material:</span>
              <span className="truncate">{product.materials[0]}</span>
            </div>
          )}
        </div>

        {/* Pricing & Link */}
        <div className="pt-3 border-t border-[#F0EBE1] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-[#121214]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#9E988F] line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold uppercase tracking-widest text-[#9A7B4F] hover:text-[#7A5F39] flex items-center gap-1"
          >
            <span>View Details</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
