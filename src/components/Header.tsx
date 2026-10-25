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
  'https://i.ibb.co/RpyPhr4d/Polished-Gold-House-E-Emblem.png';

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
          .filter((p) => {
            const query = searchQuery.trim().toLowerCase();

            return (
              p.name.toLowerCase().includes(query) ||
              p.category.toLowerCase().includes(query) ||
              (p.description || '').toLowerCase().includes(query)
            );
          })
          .slice(0, 5)
      : [];

  const navItems = [
    { tab: 'home', label: 'Home' },
    { tab: 'furniture', label: 'Furniture' },
    { tab: 'categories', label: 'Categories' },
    { tab: 'about', label: 'About Us' },
  ] as const;

  const navClass = (tab: HeaderProps['currentTab']) =>
    `relative whitespace-nowrap py-3 text-[11px] lg:text-xs uppercase tracking-[0.16em] transition-colors duration-200 ${
      currentTab === tab
        ? 'text-[#B88E52] font-medium'
        : 'text-[#44403C] font-normal hover:text-[#B88E52]'
    }`;

  const iconButtonClass =
    'relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-[#292524] transition-all duration-200 hover:bg-[#F8F3EB] hover:text-[#B88E52] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E52]';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E0D4] bg-white/95 backdrop-blur-xl">
      {/* Main Header */}
      <div className="mx-auto max-w-[1500px] px-3 sm:px-6 lg:px-10">
        <div className="grid min-h-[72px] sm:min-h-[88px] lg:min-h-[96px] grid-cols-[1fr_auto] items-center gap-2 sm:gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-5">

          {/* Brand Logo and Name */}
          <div className="flex min-w-0 items-center justify-self-start">
            <button
              type="button"
              onClick={() => {
                onNavigateTab('home');
                setMobileMenuOpen(false);
              }}
              className="group flex min-w-0 items-center gap-2.5 sm:gap-3.5 lg:gap-4 text-left focus:outline-none"
              aria-label="LUXEUPHO Home"
            >
              <img
                src={LOGO_URL}
                alt="LUXEUPHO Gold House Emblem"
                width={240}
                height={240}
                loading="eager"
                decoding="async"
                draggable={false}
                className="h-12 w-12 min-[380px]:h-14 min-[380px]:w-14 sm:h-[68px] sm:w-[68px] lg:h-[78px] lg:w-[78px] shrink-0 object-contain my-auto"
                style={{
                  filter: 'none',
                  opacity: 1,
                  imageRendering: 'auto',
                }}
                onError={() => {
                  console.error('Unable to load the LUXEUPHO logo.');
                }}
              />

              <div className="flex min-w-0 flex-col justify-center leading-none my-auto">
                <span className="font-brand whitespace-nowrap text-[18px] min-[380px]:text-[21px] sm:text-[25px] lg:text-[28px] font-normal leading-tight tracking-[0.12em] sm:tracking-[0.16em] lg:tracking-[0.18em] text-[#B88E52] transition-colors duration-200 group-hover:text-[#9D753C]">
                  LUXEUPHO
                </span>

                <span className="whitespace-nowrap text-[8px] min-[380px]:text-[8.5px] sm:text-[9.5px] lg:text-[10px] font-normal uppercase tracking-[0.14em] sm:tracking-[0.2em] text-[#78716C] leading-normal mt-0.5 sm:mt-1 block">
                  Furniture &amp; Home Interiors
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center justify-center gap-5 md:flex lg:gap-8 xl:gap-10"
            aria-label="Main navigation"
          >
            {navItems.map(({ tab, label }) => (
              <button
                key={tab}
                type="button"
                onClick={() => onNavigateTab(tab)}
                className={navClass(tab)}
                aria-current={currentTab === tab ? 'page' : undefined}
              >
                {label}

                {currentTab === tab && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#B88E52]" />
                )}
              </button>
            ))}
          </nav>

          {/* Header Action Icons */}
          <div className="flex items-center justify-self-end gap-0.5 sm:gap-1 lg:gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((open) => !open);
                setMobileMenuOpen(false);
              }}
              className={iconButtonClass}
              aria-label="Search catalog"
              aria-expanded={searchOpen}
            >
              {searchOpen ? (
                <X className="h-[21px] w-[21px] stroke-[1.6]" />
              ) : (
                <Search className="h-[21px] w-[21px] stroke-[1.6]" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              className={iconButtonClass}
              aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
            >
              <Heart className="h-[21px] w-[21px] stroke-[1.6]" />

              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#B88E52] px-1 text-[9px] font-medium text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={iconButtonClass}
              aria-label={`Shopping bag, ${totalCount} items`}
            >
              <ShoppingBag className="h-[21px] w-[21px] stroke-[1.6]" />

              <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#292524] px-1 text-[9px] font-medium text-white">
                {totalCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((open) => !open);
                setSearchOpen(false);
              }}
              className={`${iconButtonClass} md:hidden`}
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 stroke-[1.6]" />
              ) : (
                <Menu className="h-6 w-6 stroke-[1.6]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Product Search */}
      {searchOpen && (
        <div className="animate-in slide-in-from-top border-t border-[#E8E0D4] bg-white px-3 py-5 shadow-lg duration-200 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-[#A8A29E]" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sofas, beds, dining tables, chairs..."
                className="w-full rounded-full border border-[#E7E0D5] bg-[#FAF8F5] py-3 pl-11 pr-11 text-sm font-normal text-[#292524] outline-none transition-colors placeholder:text-[#A8A29E] focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52]/20"
                autoFocus
                aria-label="Search furniture products"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-[#78716C] transition-colors hover:text-[#B88E52]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-xl border border-[#E8E0D4] bg-white shadow-sm">
                <div className="border-b border-[#F0EBE4] px-4 py-2.5 text-[10px] uppercase tracking-[0.18em] text-[#A08050]">
                  Matching Products
                </div>

                {searchResults.map((product) => (
                  <a
                    key={product.id}
                    href={`/product/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 border-b border-[#F5F2ED] p-3 last:border-b-0 hover:bg-[#FCFAF7] sm:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        loading="lazy"
                        className="h-14 w-14 shrink-0 rounded-lg border border-[#E8E0D4] bg-[#FAF8F5] object-cover sm:h-16 sm:w-16"
                      />

                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-normal text-[#292524] transition-colors group-hover:text-[#A57D43]">
                          {product.name}
                        </div>

                        <div className="mt-1 text-xs font-normal text-[#78716C]">
                          {product.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                      <span className="whitespace-nowrap text-sm font-medium text-[#292524]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>

                      <ChevronRight className="h-4 w-4 text-[#A8A29E] transition-transform group-hover:translate-x-0.5 group-hover:text-[#B88E52]" />
                    </div>
                  </a>
                ))}
              </div>
            )}

            {searchQuery.trim().length > 1 &&
              searchResults.length === 0 && (
                <div className="py-8 text-center">
                  <Search className="mx-auto mb-3 h-7 w-7 text-[#D6C5AA]" />

                  <p className="text-sm text-[#57534E]">
                    No matching products found.
                  </p>

                  <p className="mt-1 text-xs text-[#A8A29E]">
                    Try searching for sofas, beds, tables or chairs.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="animate-in slide-in-from-top border-t border-[#E8E0D4] bg-[#FCFAF7] px-5 py-5 duration-200 md:hidden sm:px-8">
          <nav className="mx-auto max-w-lg" aria-label="Mobile navigation">
            <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#B88E52]">
              Explore LUXEUPHO
            </div>

            <div className="divide-y divide-[#E8E0D4]">
              {navItems.map(({ tab, label }) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    onNavigateTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-[0.14em] transition-colors ${
                    currentTab === tab
                      ? 'font-medium text-[#B88E52]'
                      : 'font-normal text-[#44403C] hover:text-[#B88E52]'
                  }`}
                  aria-current={currentTab === tab ? 'page' : undefined}
                >
                  {label}

                  <ChevronRight
                    className={`h-4 w-4 ${
                      currentTab === tab
                        ? 'text-[#B88E52]'
                        : 'text-[#A8A29E]'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="mt-5 border-t border-[#E8E0D4] pt-5">
              <a
                href={settings.phone ? `tel:${settings.phone}` : undefined}
                aria-label="Contact customer care"
                className="flex min-h-12 items-center justify-center rounded-lg bg-[#B88E52] px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#A57D43]"
              >
                Customer Care: {settings.phone || 'Contact Us'}
              </a>

              <p className="mt-3 text-center text-[10px] tracking-[0.12em] text-[#A8A29E]">
                FURNITURE &amp; HOME INTERIORS
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};