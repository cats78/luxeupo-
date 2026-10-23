import React, { useState } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Lock,
  ChevronRight
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
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateTab,
  products,
  wishlistCount,
  onOpenWishlist,
  onOpenAdmin,
}) => {
  const { settings } = useSettings();
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery.trim().length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E5E4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Left: Brand Logo (Official Emblem Link + LUXEUPHO) */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigateTab('home')}
              className="flex items-center gap-3 sm:gap-4 group focus:outline-none text-left py-1"
            >
              <img
                src={settings.logoUrl || 'https://i.ibb.co/7tnk68Df/Luxeupho-Gold-Home-Interiors-Emblem.png'}
                alt="Luxeupho-Gold-Home-Interiors-Emblem"
                className="h-12 sm:h-16 md:h-20 max-w-[180px] sm:max-w-[240px] w-auto object-contain transition-transform duration-300 group-hover:scale-105 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/7tnk68Df/Luxeupho-Gold-Home-Interiors-Emblem.png';
                }}
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.16em] text-[#1C1917] group-hover:text-[#B88E52] transition-colors leading-none">
                  LUXEUPHO
                </span>
                <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#B88E52] font-bold mt-1 hidden sm:block">
                  Furniture & Home Interiors
                </span>
              </div>
            </button>
          </div>

          {/* Center: Navigation Links matching reference image (Home, Furniture, Categories, About) */}
          <nav className="hidden md:flex items-center space-x-10">
            <button
              onClick={() => onNavigateTab('home')}
              className={`text-sm font-medium tracking-wide transition-colors py-1 ${
                currentTab === 'home'
                  ? 'text-[#1C1917] font-semibold'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigateTab('furniture')}
              className={`text-sm font-medium tracking-wide transition-colors py-1 ${
                currentTab === 'furniture'
                  ? 'text-[#1C1917] font-semibold'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Furniture
            </button>

            <button
              onClick={() => onNavigateTab('categories')}
              className={`text-sm font-medium tracking-wide transition-colors py-1 ${
                currentTab === 'categories'
                  ? 'text-[#1C1917] font-semibold'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Categories
            </button>

            <button
              onClick={() => onNavigateTab('about')}
              className={`text-sm font-medium tracking-wide transition-colors py-1 ${
                currentTab === 'about'
                  ? 'text-[#1C1917] font-semibold'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              About
            </button>
          </nav>

          {/* Right Action Icons matching reference image: Search, Heart, Bag */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 text-[#1C1917] hover:text-[#B88E52] transition-colors"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Wishlist Heart Icon */}
            <button
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

            {/* Shopping Bag Icon with round badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 text-[#1C1917] hover:text-[#B88E52] transition-colors"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute -top-1.5 -right-2 bg-[#1C1917] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-[#1C1917]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-[#78716C] hover:text-[#1C1917]"
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
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md border border-[#E7E5E4]"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[#1C1917] group-hover:text-[#B88E52] transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-[#78716C]">{product.category}</div>
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
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E5E4] bg-[#FAF8F5] px-6 py-6 space-y-4">
          <button
            onClick={() => {
              onNavigateTab('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-semibold text-[#1C1917]"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigateTab('furniture');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#44403C]"
          >
            Furniture
          </button>
          <button
            onClick={() => {
              onNavigateTab('categories');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#44403C]"
          >
            Categories
          </button>
          <button
            onClick={() => {
              onNavigateTab('about');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-base font-medium text-[#44403C]"
          >
            About
          </button>

          <div className="pt-4 border-t border-[#E7E5E4] flex flex-col gap-3">
            <a
              href={`tel:${settings.phone}`}
              className="py-3 bg-[#B88E52] text-white rounded-md text-center text-xs font-bold uppercase tracking-wider"
            >
              Customer Care: {settings.phone}
            </a>
            <button
              onClick={() => {
                if (onOpenAdmin) onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="py-2.5 border border-[#1C1917] text-[#1C1917] rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
