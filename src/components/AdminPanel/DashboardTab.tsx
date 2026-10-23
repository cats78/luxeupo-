import React from 'react';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  HelpCircle,
  IndianRupee,
  Plus,
  ArrowUpRight,
  Phone,
  MessageCircle
} from 'lucide-react';
import { Product, Order, Enquiry } from '../../types';

interface DashboardTabProps {
  products: Product[];
  orders: Order[];
  enquiries: Enquiry[];
  onNavigateTab: (tab: 'products' | 'categories' | 'banners' | 'orders' | 'enquiries' | 'settings') => void;
  onOpenAddProduct: () => void;
  onSelectOrder: (order: Order) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  products,
  orders,
  enquiries,
  onNavigateTab,
  onOpenAddProduct,
  onSelectOrder
}) => {
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed');
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const unreadEnquiries = enquiries.filter(e => e.status === 'New');

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const recentOrders = orders.slice(0, 5);
  const recentEnquiries = enquiries.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#121214]">
            Showroom Performance Overview
          </h2>
          <p className="text-xs text-[#736D64] mt-0.5">
            Real-time analytics, order fulfillment, and client consultation pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddProduct}
            className="px-4 py-2.5 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white transition-all text-xs uppercase tracking-wider font-bold rounded-sm flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        
        {/* Total Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white p-4 rounded-sm border border-[#E8E2D9] hover:border-[#9A7B4F] cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-[#8C867D] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Products</span>
            <Package className="w-4 h-4 text-[#9A7B4F]" />
          </div>
          <div className="text-2xl font-bold text-[#121214] font-serif-luxury group-hover:text-[#9A7B4F] transition-colors">
            {products.length}
          </div>
          <span className="text-[10px] text-[#736D64] mt-1 block">Active Catalog Items</span>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-4 rounded-sm border border-[#E8E2D9] hover:border-[#9A7B4F] cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-[#8C867D] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#9A7B4F]" />
          </div>
          <div className="text-2xl font-bold text-[#121214] font-serif-luxury group-hover:text-[#9A7B4F] transition-colors">
            {orders.length}
          </div>
          <span className="text-[10px] text-[#736D64] mt-1 block">Lifetime Submissions</span>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-4 rounded-sm border border-[#E8E2D9] hover:border-[#E07A5F] cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-[#8C867D] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Pending</span>
            <Clock className="w-4 h-4 text-[#E07A5F]" />
          </div>
          <div className="text-2xl font-bold text-[#E07A5F] font-serif-luxury">
            {pendingOrders.length}
          </div>
          <span className="text-[10px] text-[#736D64] mt-1 block">Awaiting Dispatch</span>
        </div>

        {/* Completed Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-4 rounded-sm border border-[#E8E2D9] hover:border-[#3E7B54] cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-[#8C867D] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Delivered</span>
            <CheckCircle className="w-4 h-4 text-[#3E7B54]" />
          </div>
          <div className="text-2xl font-bold text-[#3E7B54] font-serif-luxury">
            {completedOrders.length}
          </div>
          <span className="text-[10px] text-[#736D64] mt-1 block">Successfully Installed</span>
        </div>

        {/* Client Enquiries */}
        <div
          onClick={() => onNavigateTab('enquiries')}
          className="bg-white p-4 rounded-sm border border-[#E8E2D9] hover:border-[#9A7B4F] cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-[#8C867D] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Enquiries</span>
            <HelpCircle className="w-4 h-4 text-[#9A7B4F]" />
          </div>
          <div className="text-2xl font-bold text-[#121214] font-serif-luxury group-hover:text-[#9A7B4F] transition-colors">
            {enquiries.length}
          </div>
          <span className="text-[10px] text-[#E07A5F] font-semibold mt-1 block">
            {unreadEnquiries.length} Unread / New
          </span>
        </div>

        {/* Revenue Pipeline */}
        <div className="bg-[#121214] text-[#E5D5BA] p-4 rounded-sm border border-[#C5A880]/30 shadow-md">
          <div className="flex items-center justify-between text-[#C5A880] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Order Volume</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-luxury truncate text-white">
            ₹{totalRevenue >= 100000 ? `${(totalRevenue / 100000).toFixed(1)}L` : totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#C5A880] mt-1 block">Active Pipeline</span>
        </div>

      </div>

      {/* Two Column Layout: Recent Orders & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-sm border border-[#E8E2D9] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EBE1]">
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-[#121214]">
                Recent Orders
              </h3>
              <span className="text-[11px] text-[#736D64]">Latest customer purchases</span>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-[#9A7B4F] hover:text-[#7A5F39] flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-[#8C867D] text-xs">
              No orders placed yet. Orders will appear here in real-time.
            </div>
          ) : (
            <div className="divide-y divide-[#F0EBE1]">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="py-3 flex items-center justify-between hover:bg-[#FAF9F6] px-2 rounded cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#121214]">
                        #{order.orderNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                        order.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#5C564D] mt-0.5">
                      {order.customerName} &bull; {order.customerPhone}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xs text-[#121214]">
                      ₹{order.total.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-[#8C867D]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Client Enquiries (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-sm border border-[#E8E2D9] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EBE1]">
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-[#121214]">
                Customer Enquiries
              </h3>
              <span className="text-[11px] text-[#736D64]">Bespoke &amp; Support Requests</span>
            </div>
            <button
              onClick={() => onNavigateTab('enquiries')}
              className="text-xs font-semibold text-[#9A7B4F] hover:text-[#7A5F39] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="py-12 text-center text-[#8C867D] text-xs">
              No enquiries submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-[#F0EBE1] space-y-3">
              {recentEnquiries.map((enq) => (
                <div key={enq.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#121214]">{enq.customerName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                      enq.status === 'Resolved'
                        ? 'bg-green-100 text-green-800'
                        : enq.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {enq.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#9A7B4F] font-medium mt-0.5">{enq.subject}</div>

                  <p className="text-xs text-[#5C564D] line-clamp-2 mt-1 font-light">
                    "{enq.message}"
                  </p>

                  <div className="flex items-center justify-between pt-2 mt-1">
                    <a
                      href={`tel:${enq.customerPhone}`}
                      className="text-[11px] text-[#121214] font-semibold flex items-center gap-1 hover:text-[#9A7B4F]"
                    >
                      <Phone className="w-3 h-3 text-[#9A7B4F]" />
                      <span>{enq.customerPhone}</span>
                    </a>
                    <a
                      href={`https://wa.me/91${enq.customerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-green-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
