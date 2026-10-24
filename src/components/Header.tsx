import React, { useState } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface HeaderProps {
  currentTab: 'home' | 'furniture' | 'categories' | 'about';
  onNavigateTab: (tab: 'home' | 'furniture' | 'categories' | 'about') => void;
  products: Product[];
  wishlistCount: number;
  onOpenWishlist: () => void;
}

const LOGO_URL =
  'https://i.ibb.co/fYfHj2J8/Polished-Gold-House-Monogram-Logo.png';

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateTab,
  products,
  wishlistCount,
  onOpenWishlist,
}) => {
  const { settings } = useSettings();
  const { totalCount, setIsCartOpen } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults =
    searchQuery.trim().length > 1
      ? products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (p.description || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          )
          .slice(0, 5)
      : [];

  const navClass = (tab: HeaderProps['currentTab']) =>
    `text-sm tracking-wide transition-colors py-1 ${
      currentTab === tab
        ? 'text-[#1C1917] font-semibold'
        : 'text-[#57534E] font-medium hover:text-[#1C1917]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E5E4]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-20 sm:min-h-24 gap-2 sm:gap-3">

          {/* Brand Logo */}
          <div className="flex items-center min-w-0">
            <button
              type="button"
              onClick={() => onNavigateTab('home')}
              className="flex items-center gap-2 sm:gap-3 group focus:outline-none text-left py-0"
              aria-label="LUXEUPHO Home"
            >
              <img
                src={LOGO_URL}
                alt="LUXEUPHO Gold House Monogram Logo"
                width={240}
                height={240}
                loading="eager"
                decoding="async"
                draggable={false}
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 shrink-0 object-contain"
                style={{
                  filter: 'none',
                  opacity: 1,
                  imageRendering: 'auto',
                }}
              />

              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-[0.08em] sm:tracking-[0.14em] text-[#B88E52] group-hover:text-[#B88E52] transition-colors leading-tight whitespace-nowrap">
                  LUXEUPHO
                </span>

                <span className="text-[8px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] uppercase text-[#B88E52] font-bold mt-1 hidden sm:block whitespace-nowrap">
                  Furniture &amp; Home Interiors
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-8 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('home')}
              className={navClass('home')}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('furniture')}
              className={navClass('furniture')}
            >
              Furniture
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('categories')}
              className={navClass('categories')}
            >
              Categories
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('about')}
              className={navClass('about')}
            >
              About
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 text-[#1C1917] hover:text-[#B88E52] transition-colors"
              aria-label="Search Catalog"
              aria-expanded={searchOpen}
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              className="relative p-1 text-[#1C1917] hover:text-[#B88E52] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#B88E52] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 text-[#1C1917] hover:text-[#B88E52] transition-colors"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute -top-1.5 -right-2 bg-[#1C1917] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-[#1C1917]"
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Search Drawer */}
      {searchOpen && (
        <div className="border-t border-[#E7E5E4] bg-white px-4 py-4 shadow-md animate-in slide-in-from-top duration-200">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-[#78716C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sofas, beds, dining sets, storage cabinets, chairs..."
                className="w-full pl-11 pr-10 py-2.5 rounded-full border border-[#D6D3D1] bg-[#FAF8F5] text-sm text-[#1C1917] focus:border-[#B88E52] focus:outline-none"
                autoFocus
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-[#78716C] hover:text-[#1C1917]"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-3 divide-y divide-[#F5F5F4] bg-white rounded-lg border border-[#E7E5E4] overflow-hidden shadow-sm">
                {searchResults.map((product) => (
                  <a
                    key={product.id}
                    href={`/product/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 hover:bg-[#FAF8F5] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md border border-[#E7E5E4]"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[#1C1917] group-hover:text-[#B88E52] transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-[#78716C]">
                          {product.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-[#1C1917]">
                        ₹ {product.price.toLocaleString('en-IN')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#A8A29E]" />
                    </div>
                  </a>
                ))}
              </div>
            )}

            {searchQuery.trim().length > 1 &&
              searchResults.length === 0 && (
                <p className="mt-4 text-center text-sm text-[#78716C]">
                  No matching products found.
                </p>
              )}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E5E4] bg-[#FAF8F5] px-6 py-4 space-y-3">
          {(
            [
              ['home', 'Home'],
              ['furniture', 'Furniture'],
              ['categories', 'Categories'],
              ['about', 'About'],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                onNavigateTab(tab);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-base font-medium text-[#44403C]"
            >
              {label}
            </button>
          ))}

          <div className="pt-3 border-t border-[#E7E5E4] flex flex-col gap-3">
            <a
              href={settings.phone ? `tel:${settings.phone}` : undefined}
              className="py-3 bg-[#B88E52] text-white rounded-md text-center text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              Customer Care: {settings.phone || 'Contact us'}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};