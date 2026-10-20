import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { Button } from '../../components/common/Button';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [cancellingNumber, setCancellingNumber] = useState(null);
  const [payingNumber, setPayingNumber] = useState(null);
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
    });
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data.results || data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderNumber) => {
    if (!window.confirm(`Are you sure you wish to cancel order #${orderNumber}? Stock will be refunded.`)) {
      return;
    }

    setCancellingNumber(orderNumber);
    try {
      await orderService.cancelOrder(orderNumber);
      setFeedback({ type: 'success', text: `Order #${orderNumber} was cancelled successfully.` });
      await fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not cancel order.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setCancellingNumber(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handlePayOrder = async (orderNumber) => {
    setPayingNumber(orderNumber);
    try {
      await paymentService.verifyRazorpayPayment({
        order_number: orderNumber,
        razorpay_order_id: `order_mock_${Date.now()}`,
        razorpay_payment_id: `pay_instant_${Date.now()}`,
        razorpay_signature: 'mock_signature_valid',
      });
      setFeedback({ type: 'success', text: `Payment for Order #${orderNumber} completed successfully!` });
      await fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not complete payment.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setPayingNumber(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <Package className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  // Filter orders by active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status);
    }
    if (activeTab === 'DELIVERED') return order.status === 'DELIVERED';
    if (activeTab === 'CANCELLED') return order.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            My Orders & Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track past shipments, view invoices, and request returns
          </p>
        </div>
        <Link to="/shop">
          <Button variant="outline" size="sm" icon={ShoppingBag}>
            Explore More Products
          </Button>
        </Link>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {feedback.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { key: 'ALL', label: `All Orders (${orders.length})` },
          { key: 'ACTIVE', label: 'Active Shipments' },
          { key: 'DELIVERED', label: 'Delivered' },
          { key: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
          Loading your order history...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-card border border-slate-200/80 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-heading text-slate-800">
            No Orders Found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You don't have any orders matching this filter yet. Ready to experience authentic Indian handcrafted goods?
          </p>
          <Link to="/shop" className="inline-block">
            <Button size="sm">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden hover:shadow-premium transition-all duration-300"
              >
                {/* Order Header */}
                <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Order Placed</span>
                      <span className="font-bold text-slate-800">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="hidden sm:block border-l border-slate-200 h-6"></div>
                    <div>
                      <span className="text-slate-400 block font-medium">Total Billed</span>
                      <span className="font-bold font-heading text-slate-900 text-sm">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                    <div className="hidden sm:block border-l border-slate-200 h-6"></div>
                    <div>
                      <span className="text-slate-400 block font-medium">Ship To</span>
                      <span className="font-bold text-slate-800">{order.shipping_full_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="font-mono text-xs font-bold text-slate-500">
                      #{order.order_number}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-5 sm:p-6 divide-y divide-slate-100">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          <img
                            src={
                              item.product_image_url ||
                              'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={item.product_title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading font-bold text-sm text-slate-900 truncate">
                            {item.product_title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Quantity: <strong className="text-slate-700">{item.quantity}</strong> × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-heading font-bold text-sm text-slate-900">
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Payment Method:{' '}
                    <strong className="text-slate-800">
                      {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Razorpay Online'}
                    </strong>{' '}
                    ({order.payment_status})
                  </div>

                  <div className="flex items-center gap-3">
                    {order.payment_status === 'PENDING' && order.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        icon={CreditCard}
                        loading={payingNumber === order.order_number}
                        onClick={() => handlePayOrder(order.order_number)}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                      >
                        Pay Now
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={cancellingNumber === order.order_number}
                        onClick={() => handleCancelOrder(order.order_number)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Link to={`/orders/${order.order_number}`}>
                      <Button size="sm" icon={ChevronRight}>
                        Track Order Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
