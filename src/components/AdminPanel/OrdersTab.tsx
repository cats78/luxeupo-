import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Phone,
  MessageCircle,
  Truck,
  CheckCircle,
  Clock,
  X,
  CreditCard,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { updateOrderStatus } from '../../firebase/firestore';

interface OrdersTabProps {
  orders: Order[];
  selectedOrder?: Order | null;
  onClearSelectedOrder?: () => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  selectedOrder: propSelectedOrder,
  onClearSelectedOrder
}) => {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(propSelectedOrder || null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    if (propSelectedOrder) {
      setActiveOrder(propSelectedOrder);
    }
  }, [propSelectedOrder]);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    newPayment?: PaymentStatus
  ) => {
    setStatusUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus, newPayment);
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder({
          ...activeOrder,
          status: newStatus,
          paymentStatus: newPayment || activeOrder.paymentStatus
        });
      }
    } catch (err) {
      console.error('Update order status error:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = activeStatusFilter === 'All' || o.status === activeStatusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm) ||
      o.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#121214]">
            Order Fulfillment & Logistics
          </h2>
          <p className="text-xs text-[#736D64] mt-0.5">
            Track white-glove dispatches, client verification, and delivery milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#8C867D]">Total Orders:</span>
          <span className="font-bold text-[#121214] bg-white px-2 py-1 rounded border border-[#E8E2D9]">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C867D] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, client name, phone number, or city..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#DCD5C9] rounded-sm bg-white focus:border-[#9A7B4F] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatusFilter(st)}
              className={`px-3 py-1.5 text-xs rounded-sm whitespace-nowrap transition-colors ${
                activeStatusFilter === st
                  ? 'bg-[#121214] text-[#E5D5BA] font-bold'
                  : 'bg-white text-[#5C564D] hover:bg-[#FAF9F6] border border-[#E8E2D9]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#736D64] uppercase tracking-wider border-b border-[#E8E2D9]">
              <tr>
                <th className="p-3.5 font-semibold">Order ID</th>
                <th className="p-3.5 font-semibold">Client Details</th>
                <th className="p-3.5 font-semibold">Destination</th>
                <th className="p-3.5 font-semibold">Items</th>
                <th className="p-3.5 font-semibold">Total Amount</th>
                <th className="p-3.5 font-semibold">Order Status</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#8C867D]">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#121214]">
                      #{order.orderNumber}
                      <span className="block text-[10px] text-[#8C867D] font-sans font-normal">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#121214]">{order.customerName}</div>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-[11px] text-[#9A7B4F] hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.customerPhone}</span>
                      </a>
                    </td>
                    <td className="p-3.5 text-[#5C564D]">
                      <div>{order.city}</div>
                      <div className="text-[10px] text-[#8C867D]">{order.postalCode}</div>
                    </td>
                    <td className="p-3.5 text-[#5C564D]">
                      <span className="font-semibold text-[#121214]">{order.items?.length || 0} pieces</span>
                      <div className="text-[10px] text-[#8C867D] line-clamp-1">
                        {order.items?.map(i => i.name).join(', ')}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#121214]">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                      <div className="text-[10px] text-[#8C867D]">{order.paymentStatus}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-sm uppercase ${
                        order.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : order.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setActiveOrder(order)}
                        className="px-3 py-1 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white rounded-sm text-[11px] font-semibold transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-2xl w-full p-6 sm:p-8 border border-[#E8E2D9] shadow-2xl space-y-6 text-xs max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#9A7B4F] font-bold">
                  Order Dossier
                </span>
                <h3 className="font-serif-luxury text-xl font-bold text-[#121214]">
                  Order #{activeOrder.orderNumber}
                </h3>
                <span className="text-[11px] text-[#736D64]">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveOrder(null);
                  if (onClearSelectedOrder) onClearSelectedOrder();
                }}
                className="p-1.5 text-[#8C867D] hover:text-[#121214] rounded-full hover:bg-[#FAF9F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Updater */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E8E2D9] rounded-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-[#121214] mb-1">
                  Update Order Lifecycle Status:
                </label>
                <select
                  disabled={statusUpdating}
                  value={activeOrder.status}
                  onChange={(e) => handleUpdateStatus(activeOrder.id, e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm bg-white font-semibold text-[#121214] focus:border-[#9A7B4F]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-[#121214] mb-1">
                  Payment Verification:
                </label>
                <select
                  disabled={statusUpdating}
                  value={activeOrder.paymentStatus}
                  onChange={(e) => handleUpdateStatus(activeOrder.id, activeOrder.status, e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 border border-[#DCD5C9] rounded-sm bg-white font-semibold text-[#121214] focus:border-[#9A7B4F]"
                >
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Paid & Verified">Paid &amp; Verified</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Client & Shipping Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-[#E8E2D9] rounded-sm space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#121214] uppercase tracking-wider text-[11px]">
                  <User className="w-3.5 h-3.5 text-[#9A7B4F]" />
                  <span>Client Contact</span>
                </div>
                <div className="font-semibold text-sm text-[#121214]">{activeOrder.customerName}</div>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={`tel:${activeOrder.customerPhone}`}
                    className="px-2.5 py-1 bg-[#121214] text-[#E5D5BA] rounded text-[11px] font-bold flex items-center gap-1 hover:bg-[#9A7B4F]"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call: {activeOrder.customerPhone}</span>
                  </a>
                  <a
                    href={`https://wa.me/91${activeOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${activeOrder.customerName}, this is LUXEUPHO regarding your order #${activeOrder.orderNumber}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-green-700 text-white rounded text-[11px] font-bold flex items-center gap-1 hover:bg-green-800"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                {activeOrder.customerEmail && (
                  <div className="text-[11px] text-[#736D64] pt-1">{activeOrder.customerEmail}</div>
                )}
              </div>

              <div className="p-4 border border-[#E8E2D9] rounded-sm space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#121214] uppercase tracking-wider text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#9A7B4F]" />
                  <span>White-Glove Delivery Address</span>
                </div>
                <p className="text-xs text-[#5C564D] leading-relaxed">
                  {activeOrder.shippingAddress}
                </p>
                <div className="font-semibold text-[#121214]">{activeOrder.city} &ndash; {activeOrder.postalCode}</div>
                {activeOrder.notes && (
                  <div className="p-2 bg-[#FAF9F6] border border-[#E8E2D9] text-[11px] text-[#736D64] mt-2 rounded">
                    <strong>Client Note:</strong> {activeOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Pieces Breakdown */}
            <div className="space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-[#121214]">
                Ordered Furniture Pieces
              </h4>
              <div className="divide-y divide-[#F0EBE1] border border-[#E8E2D9] rounded-sm">
                {activeOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded border" />
                      )}
                      <div>
                        <div className="font-semibold text-[#121214]">{item.name}</div>
                        <div className="text-[10px] text-[#736D64]">
                          {item.selectedMaterial && `Material: ${item.selectedMaterial} • `}
                          {item.selectedColor && `Color: ${item.selectedColor} • `}
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-bold text-[#121214]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 bg-[#FAF9F6] rounded-sm border border-[#E8E2D9] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#736D64]">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-[#121214]">₹{activeOrder.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#736D64]">
                <span>White-Glove Pan-India Setup:</span>
                <span className="font-semibold text-[#121214]">
                  {activeOrder.deliveryFee === 0 ? 'Complimentary' : `₹${activeOrder.deliveryFee?.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#121214] pt-2 border-t border-[#E8E2D9]">
                <span>Final Order Total:</span>
                <span>₹{activeOrder.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setActiveOrder(null);
                  if (onClearSelectedOrder) onClearSelectedOrder();
                }}
                className="px-6 py-2 bg-[#121214] text-[#E5D5BA] hover:bg-[#9A7B4F] hover:text-white rounded-sm font-bold uppercase tracking-wider transition-colors"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
