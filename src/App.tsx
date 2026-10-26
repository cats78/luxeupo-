import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { CartProvider, useCart } from './context/CartContext';

import { Product, Category, Banner, Order, Enquiry } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BANNERS } from './data/initialData';
import {
  subscribeProducts,
  subscribeCategories,
  subscribeBanners,
  subscribeOrders,
  subscribeEnquiries,
  seedInitialDatabaseIfEmpty
} from './firebase/firestore';

import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { FurnitureCatalog } from './components/FurnitureCatalog';
import { ProductDetailView } from './components/ProductDetailView';
import { CartDrawer } from './components/CartDrawer';
import { RazorpayCheckoutModal } from './components/RazorpayCheckoutModal';
import { SupportForm } from './components/SupportForm';
import { Footer } from './components/Footer';

import { AdminLayout } from './components/AdminPanel/AdminLayout';
import { AdminLogin } from './components/AdminPanel/AdminLogin';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { NeroChatbot } from './components/NeroChatbot';

function MainApp() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const { addToCart, openCheckout } = useCart();

  // Firestore real-time state with instant baseline initialization
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  // Routing and Tab state
  const [currentRoute, setCurrentRoute] = useState<'home' | 'product' | 'admin'>('home');
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'furniture' | 'categories' | 'about'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Wishlist state (persisted in localStorage)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('luxeupho_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem('luxeupho_wishlist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // URL Parsing - Admin strictly accessible only via direct URL (/admin or #admin)
  const parseCurrentUrl = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    const isAdminRoute =
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash === '#/admin' ||
      searchParams.get('route') === 'admin' ||
      searchParams.get('admin') === 'true';

    if (isAdminRoute) {
      setCurrentRoute('admin');
      setActiveProductId(null);
      return;
    }

    const productMatch = path.match(/\/product\/([a-zA-Z0-9_-]+)/);
    const hashProductMatch = hash.match(/#\/?product\/([a-zA-Z0-9_-]+)/);
    const productParam = searchParams.get('product') || searchParams.get('id');

    const matchedId = productMatch?.[1] || hashProductMatch?.[1] || productParam;
    if (matchedId) {
      setCurrentRoute('product');
      setActiveProductId(matchedId);
      return;
    }

    setCurrentRoute('home');
    setActiveProductId(null);
  };

  useEffect(() => {
    parseCurrentUrl();
    window.addEventListener('popstate', parseCurrentUrl);
    window.addEventListener('hashchange', parseCurrentUrl);
    return () => {
      window.removeEventListener('popstate', parseCurrentUrl);
      window.removeEventListener('hashchange', parseCurrentUrl);
    };
  }, []);

  // Listen to Firestore Realtime Data
  useEffect(() => {
    seedInitialDatabaseIfEmpty();

    const unsubProducts = subscribeProducts(setProducts);
    const unsubCategories = subscribeCategories(setCategories);
    const unsubBanners = subscribeBanners(setBanners);

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBanners();
    };
  }, []);

  // Subscribe to Orders & Enquiries if Admin is authenticated
  useEffect(() => {
    if (isAdmin) {
      const unsubOrders = subscribeOrders(setOrders);
      const unsubEnquiries = subscribeEnquiries(setEnquiries);
      return () => {
        unsubOrders();
        unsubEnquiries();
      };
    }
  }, [isAdmin]);

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentRoute('home');
    setCurrentTab('home');
    setActiveProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentRoute('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: 'home' | 'furniture' | 'categories' | 'about') => {
    if (currentRoute !== 'home') {
      window.history.pushState({}, '', '/');
      setCurrentRoute('home');
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryFromHome = (catName: string) => {
    const normalized = typeof catName === 'object' && catName ? (catName as any).name : String(catName);
    setSelectedCategory(normalized);
    // Smooth scroll directly to the furniture catalog
    const el = document.getElementById('furniture-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setCurrentTab('furniture');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCategoryFromOther = (catName: string) => {
    const normalized = typeof catName === 'object' && catName ? (catName as any).name : String(catName);
    setSelectedCategory(normalized);
    if (currentRoute !== 'home') {
      window.history.pushState({}, '', '/');
      setCurrentRoute('home');
    }
    setCurrentTab('furniture');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyNowFromProduct = (product: Product, quantity: number, color: string) => {
    addToCart(product, quantity, undefined, color, undefined);
    openCheckout();
  };

  const activeProduct = activeProductId
    ? products.find((p) => p.id === activeProductId)
    : null;

  // ---------------- RENDER ADMIN ROUTE ---------------- //
  if (currentRoute === 'admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#121214] flex items-center justify-center text-[#C5A880]">
          <span className="font-serif tracking-widest text-sm uppercase animate-pulse">
            Verifying Administrator Credentials...
          </span>
        </div>
      );
    }

    if (!isAdmin) {
      return <AdminLogin onBackToStore={navigateToHome} />;
    }

    return (
      <AdminLayout
        products={products}
        categories={categories}
        banners={banners}
        orders={orders}
        enquiries={enquiries}
        onBackToStore={navigateToHome}
      />
    );
  }

  // ---------------- RENDER DEDICATED PRODUCT DETAILS ROUTE (Screen 4) ---------------- //
  if (currentRoute === 'product') {
    if (!activeProduct) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
          <Header
            currentTab={currentTab}
            onNavigateTab={handleTabChange}
            products={products}
            wishlistCount={wishlist.length}
            onOpenWishlist={() => handleTabChange('furniture')}
          />
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <h2 className="font-serif text-2xl font-bold text-[#1C1917] mb-2">
              Piece Not Found
            </h2>
            <p className="text-xs text-[#78716C] mb-6">
              The item "{activeProductId}" may have been moved or updated.
            </p>
            <button
              onClick={navigateToHome}
              className="px-6 py-3 bg-[#B88E52] text-white text-xs font-bold uppercase tracking-wider rounded-md"
            >
              Return to Catalog
            </button>
          </div>
          <Footer
            categories={categories}
            onSelectCategory={(cat: any) => {
              const categoryName = typeof cat === 'object' && cat ? cat.name : String(cat);
              setSelectedCategory(categoryName);
              handleTabChange('furniture');
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
        <Header
          currentTab={currentTab}
          onNavigateTab={handleTabChange}
          products={products}
          wishlistCount={wishlist.length}
          onOpenWishlist={() => handleTabChange('furniture')}
        />
        
        <main className="flex-1">
          {/* Exact Screen 4 (Bottom-Right) */}
          <ProductDetailView
            product={activeProduct}
            onNavigateHome={navigateToHome}
            onBuyNow={handleBuyNowFromProduct}
          />
        </main>

        <CartDrawer onOpenCheckout={openCheckout} />
        <RazorpayCheckoutModal />

        <Footer
          categories={categories}
          onSelectCategory={handleSelectCategoryFromOther}
        />
        <NeroChatbot products={products} />
        <FloatingWhatsApp />
      </div>
    );
  }

  // ---------------- RENDER MAIN STOREFRONT (Screens 1, 2, 3) ---------------- //
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header (Matching all 4 screens) */}
      <Header
        currentTab={currentTab}
        onNavigateTab={handleTabChange}
        products={products}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => handleTabChange('furniture')}
      />

      <main className="flex-1">
        
        {/* TAB: HOME */}
        {currentTab === 'home' && (
          <>
            {/* Screen 1: Hero Section with "Luxury Living Starts Here" and 4 Value Badges */}
            <HeroSection
              banners={banners}
              onShopNow={() => {
                const el = document.getElementById('furniture-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else setCurrentTab('furniture');
              }}
            />

            {/* Screen 2: "Shop by Category" & "Furniture for Every Space" Banner */}
            <CategoryShowcase
              categories={categories}
              onSelectCategory={handleSelectCategoryFromHome}
            />

            {/* Screen 3: "Our Furniture" Catalog with Filter Sidebar */}
            <FurnitureCatalog
              products={products}
              categories={categories}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Customer Care & Consultation Section */}
            <SupportForm />
          </>
        )}

        {/* TAB: FURNITURE */}
        {currentTab === 'furniture' && (
          <div className="py-6">
            <FurnitureCatalog
              products={products}
              categories={categories}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        )}

        {/* TAB: CATEGORIES */}
        {currentTab === 'categories' && (
          <div className="py-6">
            <CategoryShowcase
              categories={categories}
              onSelectCategory={handleSelectCategoryFromOther}
            />
          </div>
        )}

        {/* TAB: ABOUT & CONTACT */}
        {currentTab === 'about' && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-8 sm:p-12 shadow-sm">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B88E52] font-normal block mb-2 font-sans">
                About LEXUPHO
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] mb-4 tracking-wide">
                Curating Timeless Modern Sanctuaries
              </h1>
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-2xl font-light">
                LEXUPHO was founded on a singular premise: furniture should be as enduring as the memories made around it. Every sofa, bed, dining set, and cabinet in our collection is precision-crafted with seasoned hardwoods, bookmatched veneers, and premium woven textiles.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 mt-8 border-t border-[#F5F5F4]">
                <div>
                  <h4 className="font-medium text-sm text-[#1C1917] mb-1">Customer Care</h4>
                  <a href={`tel:${settings.phone}`} className="text-sm text-[#B88E52] font-normal hover:underline">
                    {settings.phone}
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-[#1C1917] mb-1">Email Concierge</h4>
                  <a href={`mailto:${settings.email}`} className="text-sm text-[#B88E52] font-normal hover:underline break-all">
                    {settings.email}
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-[#1C1917] mb-1">Business Timings</h4>
                  <span className="text-sm text-[#57534E] font-light">10:00 AM – 7:00 PM IST (Daily)</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-[#1C1917] mb-1">Delivery Region</h4>
                  <span className="text-sm text-[#57534E] font-light">Across India (White-Glove Setup)</span>
                </div>
              </div>
            </div>

            <SupportForm />
          </div>
        )}

      </main>

      {/* Cart Drawer */}
      <CartDrawer onOpenCheckout={openCheckout} />

      {/* Razorpay Online Checkout Modal */}
      <RazorpayCheckoutModal />

      {/* Footer */}
      <Footer
        categories={categories}
        onSelectCategory={handleSelectCategoryFromOther}
      />

      {/* Floating NERO Shopping Assistant (Above WhatsApp) */}
      <NeroChatbot products={products} />

      {/* Floating WhatsApp Contact Button (Customer Care: 9704796170) */}
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
