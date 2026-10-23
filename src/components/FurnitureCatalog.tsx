import React, { useState } from 'react';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '../types';

interface FurnitureCatalogProps {
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const FurnitureCatalog: React.FC<FurnitureCatalogProps> = ({
  products,
  wishlist,
  onToggleWishlist,
  selectedCategory,
  onSelectCategory,
}) => {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');

  const categoriesList = ['Sofas', 'Beds', 'Dining', 'Storage', 'Chairs'];

  const colorSwatches = [
    { name: 'Cream', hex: '#EBE5DA' },
    { name: 'Slate', hex: '#3B4856' },
    { name: 'Cognac', hex: '#8E5E3B' },
    { name: 'Olive', hex: '#4F5E4D' },
  ];

  const handleCategoryCheckbox = (catName: string) => {
    if (selectedCategory === catName) {
      onSelectCategory('All');
    } else {
      onSelectCategory(catName);
    }
  };

  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (p.price > maxPrice) {
        return false;
      }
      if (selectedColor && p.colors) {
        const matches = p.colors.some(c => c.toLowerCase().includes(selectedColor.toLowerCase()));
        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  return (
    <section id="furniture-section" className="w-full bg-[#FAF8F5] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Filter Panel (Exact match from bottom-left reference image) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-[#E7E5E4] p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-[#1C1917] pb-2 border-b border-[#F5F5F4]">
              Filter
            </h3>

            {/* Category Collapsible Checkboxes */}
            <div className="space-y-3">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="w-full flex items-center justify-between text-sm font-semibold text-[#1C1917]"
              >
                <span>Category</span>
                {categoryOpen ? <ChevronUp className="w-4 h-4 text-[#78716C]" /> : <ChevronDown className="w-4 h-4 text-[#78716C]" />}
              </button>

              {categoryOpen && (
                <div className="space-y-2.5 pt-1">
                  {categoriesList.map((cat) => {
                    const isChecked = selectedCategory === cat;
                    return (
                      <label
                        key={cat}
                        className="flex items-center gap-3 text-sm text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCategoryCheckbox(cat)}
                          className="w-4 h-4 rounded border-[#D6D3D1] text-[#B88E52] focus:ring-[#B88E52]"
                        />
                        <span>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3 pt-4 border-t border-[#F5F5F4]">
              <span className="block text-sm font-semibold text-[#1C1917]">
                Price Range
              </span>
              <input
                type="range"
                min={5000}
                max={50000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#B88E52] h-1.5 bg-[#E7E5E4] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-[#78716C] font-medium">
                <span>₹5,000</span>
                <span>₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-3 pt-4 border-t border-[#F5F5F4]">
              <div className="flex justify-between items-center">
                <span className="block text-sm font-semibold text-[#1C1917]">
                  Color
                </span>
                {selectedColor && (
                  <button
                    onClick={() => setSelectedColor(null)}
                    className="text-xs text-[#B88E52] hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {colorSwatches.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(isSelected ? null : color.name)}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-[#B88E52] scale-110'
                          : 'border-black/10 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Main Content: Header & 3-Column Product Grid */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Header: Title, Subtitle, and Sort dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  Our Furniture
                </h2>
                <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
                  Premium pieces. Designed for modern living.
                </p>
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-[#E7E5E4] rounded-md bg-white text-[#1C1917] font-medium focus:border-[#B88E52] focus:outline-none shadow-sm cursor-pointer"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Sort by: Price: Low to High</option>
                  <option value="price-high">Sort by: Price: High to Low</option>
                  <option value="newest">Sort by: Newest</option>
                </select>
              </div>
            </div>

            {/* 3-Column Product Grid (Exact match with reference image) */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E7E5E4] p-12 text-center text-[#78716C] text-sm">
                No pieces match your selected filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  const productUrl = `/product/${product.id}`;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-xl border border-[#E7E5E4] overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#B88E52]/50 flex flex-col justify-between"
                    >
                      {/* Product Image Container */}
                      <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block aspect-[4/3] bg-[#FAF8F5] overflow-hidden cursor-pointer"
                        title={`Open ${product.name} details in new tab`}
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Wishlist Heart Icon (Top Right) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleWishlist(product.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm transition-all shadow-sm ${
                            isWishlisted ? 'text-[#E07A5F]' : 'text-[#78716C] hover:text-[#1C1917]'
                          }`}
                          aria-label="Save to Wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 ${isWishlisted ? 'fill-[#E07A5F]' : ''}`}
                          />
                        </button>
                      </a>

                      {/* Product Info */}
                      <div className="p-4">
                        <a
                          href={productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm font-semibold text-[#1C1917] group-hover:text-[#B88E52] transition-colors mb-1 truncate"
                        >
                          {product.name}
                        </a>

                        <div className="text-sm font-semibold text-[#1C1917]">
                          ₹ {product.price.toLocaleString('en-IN')}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
