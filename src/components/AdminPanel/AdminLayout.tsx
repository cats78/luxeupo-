import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  ShoppingBag,
  MessageSquare,
  Settings,
  Bell,
  LogOut,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Product, Category, Banner, Order, Enquiry } from '../../types';

import { DashboardTab } from './DashboardTab';
import { ProductsTab } from './ProductsTab';
import { CategoriesTab } from './CategoriesTab';
import { BannersTab } from './BannersTab';
import { OrdersTab } from './OrdersTab';
import { EnquiriesTab } from './EnquiriesTab';
import { SettingsTab } from './SettingsTab';

interface AdminLayoutProps {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  orders: Order[];
  enquiries: Enquiry[];
  onBackToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  products,
  categories,
  banners,
  orders,
  enquiries,
  onBackToStore
}) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'categories' | 'banners' | 'orders' | 'enquiries' | 'settings'
  >('dashboard');

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean>(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length;
  const unreadEnquiriesCount = enquiries.filter(e => e.status === 'New').length;
  const totalNotifications = pendingOrdersCount + unreadEnquiriesCount;

  // Real-time enquiry arrival alert banner
  const [newEnquiryToast, setNewEnquiryToast] = useState<Enquiry | null>(null);
  const prevEnquiriesLength = React.useRef(enquiries.length);

  React.useEffect(() => {
    if (enquiries.length > prevEnquiriesLength.current && prevEnquiriesLength.current > 0) {
      const latest = enquiries[0];
      if (latest && latest.status === 'New') {
        setNewEnquiryToast(latest);
        // Play subtle luxury notification tone via Web Audio API if supported
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch {
          // Audio optional
        }
      }
    }
    prevEnquiriesLength.current = enquiries.length;
  }, [enquiries]);

  const requestBrowserNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsAllowed(permission === 'granted');
      if (permission === 'granted') {
        new Notification('LUXEUPHO Admin Notifications Active', {
          body: 'You will receive real-time alerts for incoming orders and client enquiries.',
          icon: settings.logoUrl
        });
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'categories', label: 'Categories', icon: Layers, count: categories.length },
    { id: 'banners', label: 'Banner Slider', icon: ImageIcon, count: banners.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, count: pendingOrdersCount, alert: pendingOrdersCount > 0 },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, count: unreadEnquiriesCount, alert: unreadEnquiriesCount > 0 },
    { id: 'settings', label: 'Storefront Settings', icon: Settings },
  ];

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#121214] flex flex-col md:flex-row overflow-x-hidden">
      
      {/* Mobile Top Header (Visible on screens < md) */}
      <div className="md:hidden bg-[#121214] text-[#E5D5BA] px-4 py-3 border-b border-[#C5A880]/20 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <img
            src={settings.logoUrl || 'https://i.ibb.co/B2ynSdJp/Luxeupho-Gold-Home-Interiors-Emblem.png'}
            alt="LUXEUPHO Logo"
            className="h-10 w-auto object-contain"
            style={{ imageRendering: '-webkit-optimize-contrast' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://i.ibb.co/B2ynSdJp/Luxeupho-Gold-Home-Interiors-Emblem.png';
            }}
          />
          <div>
            <span className="font-serif-luxury font-bold tracking-[0.12em] text-white text-xs block leading-tight">
              LUXEUPHO
            </span>
            <span className="text-[8px] uppercase tracking-[0.2em] text-[#C5A880] font-bold">
              Admin Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-[#E5D5BA] hover:text-white rounded border border-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Quick Tabs (Allows 1-tap navigation without opening menu) */}
      <div className="md:hidden bg-[#1A1917] border-b border-white/10 px-2 py-1.5 flex items-center gap-1 overflow-x-auto whitespace-nowrap sticky top-[57px] z-30">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSelectedOrder(null);
                setMobileSidebarOpen(false);
              }}
              className={`px-3 py-1.5 rounded text-[11px] font-semibold tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-[#C5A880] text-[#121214] font-bold'
                  : 'text-[#C5BEB3] hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${isActive ? 'bg-[#121214] text-[#E5D5BA]' : 'bg-[#E07A5F] text-white'}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar (Desktop permanent, Mobile overlay drawer) */}
      <aside
        className={`${
          mobileSidebarOpen ? 'fixed inset-0 z-50 flex flex-col' : 'hidden md:flex flex-col'
        } w-full md:w-64 bg-[#121214] text-[#E5D5BA] justify-between shrink-0 border-r border-[#C5A880]/20 min-h-screen md:min-h-0`}
      >
        <div>
          {/* Brand Emblem & Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={settings.logoUrl || 'https://i.ibb.co/B2ynSdJp/Luxeupho-Gold-Home-Interiors-Emblem.png'}
                alt="LUXEUPHO Logo"
                className="h-14 w-auto object-contain shrink-0"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/B2ynSdJp/Luxeupho-Gold-Home-Interiors-Emblem.png';
                }}
              />
              <div>
                <span className="font-serif-luxury font-bold tracking-[0.15em] text-white text-base block leading-tight">
                  LUXEUPHO
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">
                  Admin Suite
                </span>
              </div>
            </div>

            {/* Close button for mobile drawer */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSelectedOrder(null);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-sm text-xs font-semibold tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#C5A880] text-[#121214] font-bold shadow-md'
                      : 'text-[#C5BEB3] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-[#121214] text-[#E5D5BA]'
                          : item.alert
                          ? 'bg-[#E07A5F] text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-[11px] text-[#8C867D] truncate px-2">
            Logged in: <strong className="text-white">{user?.email || 'Authorized Administrator'}</strong>
          </div>

          <button
            onClick={onBackToStore}
            className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 text-[#C5A880] hover:text-white rounded-sm text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Public Storefront</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2 px-3 text-[#A89F91] hover:text-red-400 rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E8E2D9] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#736D64]">
            <span className="font-semibold text-[#121214] uppercase tracking-wider">
              LUXEUPHO Management
            </span>
            <span>/</span>
            <span className="capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Order & Enquiry Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-[#736D64] hover:text-[#121214] rounded-full hover:bg-[#F3F1EC] transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {totalNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E07A5F] rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-sm border border-[#E8E2D9] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9] mb-3">
                    <span className="text-xs font-bold text-[#121214] uppercase tracking-wider">
                      Live Notification Feed
                    </span>
                    <span className="text-[10px] text-[#736D64]">Real-time alerts</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-[#FAF9F6] border border-[#E8E2D9] rounded">
                      <div className="font-semibold text-[#121214] flex justify-between">
                        <span>Pending Orders</span>
                        <span className="font-bold text-[#E07A5F]">{pendingOrdersCount}</span>
                      </div>
                      <p className="text-[11px] text-[#736D64] mt-0.5">
                        Awaiting showroom confirmation and white-glove route assignment.
                      </p>
                    </div>

                    <div className="p-2.5 bg-[#FAF9F6] border border-[#E8E2D9] rounded">
                      <div className="font-semibold text-[#121214] flex justify-between">
                        <span>New Enquiries</span>
                        <span className="font-bold text-[#9A7B4F]">{unreadEnquiriesCount}</span>
                      </div>
                      <p className="text-[11px] text-[#736D64] mt-0.5">
                        Client design consultation and bespoke customization inquiries.
                      </p>
                    </div>

                    {!notificationsAllowed && (
                      <button
                        onClick={requestBrowserNotifications}
                        className="w-full mt-2 py-2 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] rounded text-[11px] font-bold uppercase tracking-wider"
                      >
                        Enable Push Alerts
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onBackToStore}
              className="text-xs text-[#9A7B4F] hover:text-[#7A5F39] font-bold uppercase tracking-wider flex items-center gap-1"
            >
              <span>Live Website &rarr;</span>
            </button>
          </div>
        </header>

        {/* Real-time New Enquiry Alert Banner */}
        {newEnquiryToast && (
          <div className="bg-[#B88E52] text-white px-6 py-3.5 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3 text-xs">
              <span className="p-1.5 bg-black/20 rounded-full font-bold">🔔 New Enquiry</span>
              <span>
                <strong>{newEnquiryToast.customerName}</strong> ({newEnquiryToast.customerPhone}) submitted: &ldquo;{newEnquiryToast.subject}&rdquo;
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('enquiries');
                  setNewEnquiryToast(null);
                }}
                className="px-3 py-1 bg-white text-[#121214] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#FAF9F6] transition-colors"
              >
                View Enquiries
              </button>
              <button
                onClick={() => setNewEnquiryToast(null)}
                className="text-white/80 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardTab
              products={products}
              orders={orders}
              enquiries={enquiries}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                setSelectedOrder(null);
              }}
              onOpenAddProduct={() => {
                setActiveTab('products');
                setIsAddProductOpen(true);
              }}
              onSelectOrder={(order) => {
                setActiveTab('orders');
                setSelectedOrder(order);
              }}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              categories={categories}
              isAddModalOpen={isAddProductOpen}
              onCloseAddModal={() => setIsAddProductOpen(false)}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab categories={categories} />
          )}

          {activeTab === 'banners' && (
            <BannersTab banners={banners} />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              selectedOrder={selectedOrder}
              onClearSelectedOrder={() => setSelectedOrder(null)}
            />
          )}

          {activeTab === 'enquiries' && (
            <EnquiriesTab enquiries={enquiries} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </div>

      </main>
    </div>
  );
};
