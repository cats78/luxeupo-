import React, { useState, useMemo } from 'react';
import { Heart, SlidersHorizontal, Sparkles, Layers } from 'lucide-react';
import { Product, Category, SOFA_COMBINATIONS, DINING_COMBINATIONS } from '../types';

interface FurnitureCatalogProps {
  products: Product[];
  categories?: Category[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectProduct?: (productId: string, prodObj?: Product) => void;
}

export const FurnitureCatalog: React.FC<FurnitureCatalogProps> = ({
  products,
  categories = [],
  wishlist,
  onToggleWishlist,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
}) => {
  const [selectedCombination, setSelectedCombination] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');

  // Dynamically calculate highest product price to never hide products by default
  const ceilingPrice = useMemo(() => {
    return Math.max(
      300000,
      ...products.map((p) => Number(p.price) || 0)
    );
  }, [products]);

  const [maxPrice, setMaxPrice] = useState<number>(ceilingPrice);

  const colorSwatches = [
    { name: 'Cream', hex: '#EBE5DA' },
    { name: 'Slate', hex: '#3B4856' },
    { name: 'Cognac', hex: '#8E5E3B' },
    { name: 'Olive', hex: '#4F5E4D' },
  ];

  // Helper to match category flexibly (case-insensitive, singular/plural, contains)
  const matchesCategory = (prodCat: string, selCat: string) => {
    if (!selCat || selCat === 'All') return true;
    if (!prodCat) return false;
    const p = prodCat.trim().toLowerCase();
    const s = selCat.trim().toLowerCase();
    if (p === s) return true;
    if (p.includes(s) || s.includes(p)) return true;
    const pStem = p.replace(/s$/, '');
    const sStem = s.replace(/s$/, '');
    return pStem === sStem;
  };

  // Build comprehensive list of all categories dynamically available
  const allCategoriesList = useMemo(() => {
    const baseDefaults = ['Sofas', 'Dining Sets', 'Beds', 'Chairs', 'Storage', 'Tables'];
    const fromCategories = categories.map((c) => c.name);
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    const combined = Array.from(new Set([...baseDefaults, ...fromCategories, ...fromProducts]));
    return combined;
  }, [categories, products]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    allCategoriesList.forEach((cat) => {
      counts[cat] = products.filter((p) => matchesCategory(p.category, cat)).length;
    });
    return counts;
  }, [allCategoriesList, products]);

  // Contextual combinations available based on the selected category or active products
  const availableCombinations = useMemo(() => {
    const lower = (selectedCategory || '').toLowerCase();
    const isSofa = lower.includes('sofa');
    const isDining = lower.includes('dining');

    let baseList: string[] = [];
    if (isSofa) {
      baseList = [...SOFA_COMBINATIONS];
    } else if (isDining) {
      baseList = [...DINING_COMBINATIONS];
    }

    // Also include combinations present on products in the current category
    const inCurrentCategoryProducts = products
      .filter((p) => matchesCategory(p.category, selectedCategory) && p.combination)
      .map((p) => p.combination!.trim());

    const combined = Array.from(new Set([...baseList, ...inCurrentCategoryProducts]));
    return combined;
  }, [selectedCategory, products]);

  // Switch category handler (resets combination)
  const handleCategoryClick = (cat: string) => {
    onSelectCategory(cat);
    setSelectedCombination('All');
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter: if 'All', show all; otherwise check match
        if (!matchesCategory(p.category, selectedCategory)) {
          return false;
        }
        // Combination filter
        if (selectedCombination !== 'All') {
          const prodComb = (p.combination || '').toLowerCase().trim();
          const targetComb = selectedCombination.toLowerCase().trim();
          if (prodComb !== targetComb && !prodComb.includes(targetComb)) {
            return false;
          }
        }
        // Price filter
        if (maxPrice < ceilingPrice && p.price > maxPrice) {
          return false;
        }
        // Color filter
        if (selectedColor && p.colors) {
          const matches = p.colors.some((c) =>
            c.toLowerCase().includes(selectedColor.toLowerCase())
          );
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest')
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, selectedCombination, maxPrice, ceilingPrice, selectedColor, sortBy]);

  return (
    <section id="furniture-section" className="w-full bg-[#FAF8F5] py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#B88E52] font-semibold mb-2">
            Curated Showroom
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] tracking-wide">
            Our Furniture Collections
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] mt-2 font-light">
            Browse our full range of handcrafted luxury sofas, dining sets, chairs, beds, and storage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Filter Panel & Category Navigation */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-sm space-y-6">
            
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F4]">
              <div className="flex items-center gap-2 text-[#1C1917]">
                <SlidersHorizontal className="w-4 h-4 text-[#B88E52]" />
                <h3 className="text-base font-semibold tracking-wide">
                  Categories
                </h3>
              </div>
              {(selectedCategory !== 'All' || selectedCombination !== 'All' || selectedColor !== null || maxPrice < ceilingPrice) && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('All');
                    setSelectedCombination('All');
                    setSelectedColor(null);
                    setMaxPrice(ceilingPrice);
                  }}
                  className="text-xs text-[#B88E52] hover:underline font-medium cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Category Navigation - All Categories Included */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#78716C] block mb-2">
                Browse by Category
              </label>

              {/* "All Furniture" Primary Button */}
              <button
                type="button"
                onClick={() => handleCategoryClick('All')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#1C1917] text-[#D4AF37] border-[#1C1917] shadow-sm'
                    : 'bg-[#FAF8F5] text-[#57534E] border-[#E7E5E4] hover:bg-white hover:text-[#1C1917]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className={`w-4 h-4 ${selectedCategory === 'All' ? 'text-[#D4AF37]' : 'text-[#78716C]'}`} />
                  <span>All Collections</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  selectedCategory === 'All' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#E7E5E4] text-[#78716C]'
                }`}>
                  {products.length}
                </span>
              </button>

              {/* Dynamic Categories List */}
              <div className="space-y-1 pt-1 max-h-72 overflow-y-auto pr-1">
                {allCategoriesList.map((cat) => {
                  const isSelected = selectedCategory !== 'All' && matchesCategory(cat, selectedCategory);
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#D4AF37] border-[#1C1917] shadow-sm'
                          : 'bg-[#FAF8F5]/60 text-[#57534E] border-transparent hover:bg-[#FAF8F5] hover:border-[#E7E5E4] hover:text-[#1C1917]'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        isSelected ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-semibold' : 'text-[#A8A29E]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Combinations Selector (Context-Sensitive when combinations are available) */}
            {availableCombinations.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#F5F5F4]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                    Combinations
                  </label>
                  {selectedCombination !== 'All' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCombination('All')}
                      className="text-[11px] text-[#B88E52] hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCombination('All')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      selectedCombination === 'All'
                        ? 'bg-[#B88E52] text-white shadow-sm'
                        : 'bg-[#FAF8F5] text-[#57534E] hover:bg-[#F5F5F4] border border-[#E7E5E4]'
                    }`}
                  >
                    All Combinations
                  </button>
                  {availableCombinations.map((comb) => {
                    const isSelected = selectedCombination === comb;
                    return (
                      <button
                        key={comb}
                        type="button"
                        onClick={() => setSelectedCombination(comb)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C1917] text-[#D4AF37] border border-[#1C1917] shadow-sm'
                            : 'bg-[#FAF8F5] text-[#57534E] hover:bg-white hover:text-[#1C1917] border border-[#E7E5E4]'
                        }`}
                      >
                        {comb}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Range Slider */}
            <div className="space-y-3 pt-4 border-t border-[#F5F5F4]">
              <div className="flex justify-between items-center">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                  Price Filter
                </span>
                {maxPrice < ceilingPrice && (
                  <button
                    type="button"
                    onClick={() => setMaxPrice(ceilingPrice)}
                    className="text-xs text-[#B88E52] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <input
                type="range"
                min={5000}
                max={ceilingPrice}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#B88E52] h-1.5 bg-[#E7E5E4] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-[#78716C] font-normal">
                <span>₹5,000</span>
                <span>
                  {maxPrice >= ceilingPrice
                    ? 'All Prices'
                    : `Up to ₹${maxPrice.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-3 pt-4 border-t border-[#F5F5F4]">
              <div className="flex justify-between items-center">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                  Color Filter
                </span>
                {selectedColor && (
                  <button
                    type="button"
                    onClick={() => setSelectedColor(null)}
                    className="text-xs text-[#B88E52] hover:underline cursor-pointer"
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
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
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
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Header: Title, Active Filter Badge, and Sort dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E5E4]">
              <div>
                <h3 className="font-serif text-2xl font-normal text-[#1C1917] tracking-wide flex items-center gap-2">
                  <span>{selectedCategory === 'All' ? 'All Furniture Collections' : selectedCategory}</span>
                  {selectedCombination !== 'All' && (
                    <span className="text-xs font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#B88E52]/10 text-[#B88E52] border border-[#B88E52]/30">
                      {selectedCombination}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5 font-light">
                  Showing {filteredProducts.length} handcrafted {filteredProducts.length === 1 ? 'piece' : 'pieces'}
                </p>
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-[#E7E5E4] rounded-lg bg-white text-[#1C1917] font-medium focus:border-[#B88E52] focus:outline-none shadow-sm cursor-pointer"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Sort by: Price: Low to High</option>
                  <option value="price-high">Sort by: Price: High to Low</option>
                  <option value="newest">Sort by: Newest</option>
                </select>
              </div>
            </div>

            {/* 3-Column Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E7E5E4] p-12 text-center text-[#78716C] space-y-3 shadow-sm">
                <p className="text-base font-medium text-[#1C1917]">No products match this filter</p>
                <p className="text-xs text-[#78716C]">
                  Try selecting "All Collections" or resetting your price and combination filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('All');
                    setSelectedCombination('All');
                    setMaxPrice(ceilingPrice);
                    setSelectedColor(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#1C1917] text-[#D4AF37] rounded-lg hover:bg-black transition-colors cursor-pointer"
                >
                  View All Furniture
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  const productUrl = `/product/${product.id}`;
                  const isOnePiece = product.stock === 1;

                  const handleProductClick = (e: React.MouseEvent) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
                      return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    if (onSelectProduct) {
                      onSelectProduct(product.id, product);
                    }
                  };

                  return (
                    <div
                      key={product.id}
                      onClick={handleProductClick}
                      className="group bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#B88E52]/60 flex flex-col justify-between cursor-pointer"
                    >
                      {/* Product Image Container */}
                      <a
                        href={productUrl}
                        onClick={handleProductClick}
                        className="relative block aspect-[4/3] bg-[#FAF8F5] overflow-hidden cursor-pointer"
                        title={`View ${product.name} details`}
                      >
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-furniture.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Badges Overlay */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                          {isOnePiece && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#B88E52] text-white rounded-md shadow-sm">
                              Only 1 piece
                            </span>
                          )}
                          {product.combination && (
                            <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide bg-[#1C1917]/85 text-[#D4AF37] backdrop-blur-sm rounded-md shadow-sm">
                              {product.combination}
                            </span>
                          )}
                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-[#1C1917] text-[#D4AF37] rounded-md shadow-sm">
                              <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" /> Signature
                            </span>
                          )}
                        </div>

                        {/* Wishlist Heart Icon (Top Right) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleWishlist(product.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm transition-all shadow-sm cursor-pointer ${
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
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-[#B88E52]">
                              {product.category || 'Furniture'}
                            </span>
                            {product.combination && (
                              <span className="text-[11px] text-[#78716C] font-normal truncate max-w-[120px]" title={product.combination}>
                                {product.combination}
                              </span>
                            )}
                          </div>

                          <a
                            href={productUrl}
                            onClick={handleProductClick}
                            className="block text-sm font-semibold text-[#1C1917] group-hover:text-[#B88E52] transition-colors mb-2 line-clamp-1"
                          >
                            {product.name}
                          </a>
                        </div>

                        <div className="pt-2 border-t border-[#F5F5F4] flex items-center justify-between">
                          <div>
                            <span className="text-xs text-[#78716C]">Price:</span>{' '}
                            <span className="text-base font-semibold text-[#1C1917]">
                              ₹ {product.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleProductClick}
                            className="px-3 py-1.5 text-xs font-medium text-[#1C1917] bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg hover:bg-[#1C1917] hover:text-[#D4AF37] transition-colors cursor-pointer"
                          >
                            View
                          </button>
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
