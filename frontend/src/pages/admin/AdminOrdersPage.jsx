import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  RotateCcw,
  MapPin,
  CreditCard,
  Banknote,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Inspection Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [feedback, setFeedback] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const showToast = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const data = await adminService.getAdminOrders(params);
      setOrders(data.results || data || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleOpenInspect = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.tracking_number || '');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (orderId, targetStatus, customTracking = '') => {
    setUpdatingStatus(true);
    try {
      const payload = { status: targetStatus };
      if (customTracking || trackingNumber) {
        payload.tracking_number = customTracking || trackingNumber;
      }

      await adminService.updateOrderStatus(orderId, payload);
      showToast(`Order status updated to ${targetStatus}!`);

      // Update in local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus, tracking_number: payload.tracking_number } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: targetStatus, tracking_number: payload.tracking_number }));
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update order status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePayment = async (orderId, targetPaymentStatus) => {
    try {
      await adminService.updateOrderPayment(orderId, { payment_status: targetPaymentStatus });
      showToast(`Payment marked as ${targetPaymentStatus}!`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, payment_status: targetPaymentStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, payment_status: targetPaymentStatus }));
      }
    } catch (err) {
      showToast('Failed to update payment status.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            <Package className="w-3 h-3" /> Processing
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Order Fulfillment & Shipments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer orders, advance fulfillment stages, and attach courier waybills
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] max-w-md relative">
          <input
            type="text"
            placeholder="Search by order #, customer email, tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:bg-white focus:border-primary-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: '', label: 'All Orders' },
            { key: 'PENDING', label: 'Pending' },
            { key: 'CONFIRMED', label: 'Confirmed' },
            { key: 'PROCESSING', label: 'Processing' },
            { key: 'SHIPPED', label: 'Shipped' },
            { key: 'DELIVERED', label: 'Delivered' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === tab.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Master Table */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
            Loading order fulfillment records...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No orders found</p>
            <p className="text-xs text-slate-400">There are no orders matching this filter query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-6">Order Ref</th>
                  <th className="py-3.5 px-6">Customer & Recipient</th>
                  <th className="py-3.5 px-6">Date Placed</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Payment</th>
                  <th className="py-3.5 px-6">Stage</th>
                  <th className="py-3.5 px-6">Quick Advance</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Order Number */}
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{ord.order_number}
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{ord.shipping_full_name}</p>
                      <p className="text-[10px] text-slate-400">{ord.shipping_phone}</p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {formatDate(ord.created_at)}
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-6 font-heading font-black text-slate-900">
                      {formatCurrency(ord.total_amount)}
                    </td>

                    {/* Payment Info */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800 block">
                        {ord.payment_method === 'COD' ? 'Cash on Delivery' : 'Razorpay Online'}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          ord.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">{getStatusBadge(ord.status)}</td>

                    {/* Quick Stage Progression Buttons */}
                    <td className="py-4 px-6">
                      {ord.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'CONFIRMED')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-100"
                        >
                          Confirm Order →
                        </button>
                      )}
                      {ord.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'PROCESSING')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100"
                        >
                          Start Crafting →
                        </button>
                      )}
                      {ord.status === 'PROCESSING' && (
                        <button
                          type="button"
                          onClick={() => handleOpenInspect(ord)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold hover:bg-purple-100"
                        >
                          Dispatch / Ship →
                        </button>
                      )}
                      {ord.status === 'SHIPPED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-100"
                        >
                          Mark Delivered ✓
                        </button>
                      )}
                      {ord.status === 'DELIVERED' && (
                        <span className="text-[10px] text-emerald-600 font-bold">Fulfilled</span>
                      )}
                      {ord.status === 'CANCELLED' && (
                        <span className="text-[10px] text-red-500 font-bold">Void</span>
                      )}
                    </td>

                    {/* Details Inspect */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenInspect(ord)}
                        className="inline-flex items-center gap-1 p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 font-semibold"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Inspection & Full Fulfillment Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-medium text-slate-400">Order Inspection</p>
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  #{selectedOrder.order_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage Progression Controller */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fulfillment Status Controller
                </span>
                {getStatusBadge(selectedOrder.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Change Stage
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary-500"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED (Refunds stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Courier Waybill / Tracking #
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLUEDART-882201"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  loading={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, newStatus, trackingNumber)}
                >
                  Save Stage Update
                </Button>
              </div>
            </div>

            {/* Customer & Shipping Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-primary-600" /> Destination Address
                </div>
                <p className="font-semibold text-slate-800">{selectedOrder.shipping_full_name}</p>
                <p className="text-slate-600 leading-relaxed">
                  {selectedOrder.shipping_street_address}
                  {selectedOrder.shipping_apartment_suite && `, ${selectedOrder.shipping_apartment_suite}`}
                  <br />
                  {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_postal_code}
                </p>
                <p className="text-slate-500">Phone: {selectedOrder.shipping_phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Payment & Settlement
                </div>
                <p className="text-slate-600">
                  Gateway:{' '}
                  <strong>{selectedOrder.payment_method === 'COD' ? 'Cash on Delivery' : 'Razorpay'}</strong>
                </p>
                <div className="flex items-center justify-between">
                  <span>Status: <strong>{selectedOrder.payment_status}</strong></span>
                  {selectedOrder.payment_status !== 'PAID' && (
                    <button
                      type="button"
                      onClick={() => handleUpdatePayment(selectedOrder.id, 'PAID')}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200"
                    >
                      Mark Paid ✓
                    </button>
                  )}
                </div>
                {selectedOrder.customer_notes && (
                  <p className="text-[11px] text-slate-400 italic">
                    Notes: {selectedOrder.customer_notes}
                  </p>
                )}
              </div>
            </div>

            {/* Package Items */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">
                Package Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        <img
                          src={
                            item.product_image_url ||
                            'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={item.product_title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.product_title}</p>
                        <p className="text-[10px] text-slate-400">
                          SKU: {item.product_sku || 'N/A'} • {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-heading font-bold text-xs text-slate-900">
                      {formatCurrency(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>{formatCurrency(selectedOrder.items_subtotal)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({selectedOrder.coupon_code})</span>
                  <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{selectedOrder.shipping_fee === 0 ? 'FREE' : formatCurrency(selectedOrder.shipping_fee)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="font-heading font-black text-base text-primary-700">
                  {formatCurrency(selectedOrder.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
