import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  MapPin,
  CreditCard,
  Banknote,
  ArrowLeft,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Button } from '../../components/common/Button';

export const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrderByNumber(orderNumber);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be refunded.')) {
      return;
    }
    setCancelling(true);
    try {
      await orderService.cancelOrder(orderNumber);
      setFeedback({ type: 'success', text: 'Order cancelled successfully. Stock restored to inventory.' });
      await fetchOrder();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to cancel order.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setCancelling(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleRequestReturn = async () => {
    if (!window.confirm('Request return for this delivered order?')) {
      return;
    }
    setReturning(true);
    try {
      await orderService.requestReturn(orderNumber);
      setFeedback({ type: 'success', text: 'Return request submitted. Our team will contact you shortly.' });
      await fetchOrder();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to request return.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setReturning(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Determine active step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return -1;
    }
  };

  const trackingSteps = [
    { title: 'Order Placed', desc: 'Received & logged' },
    { title: 'Confirmed', desc: 'Payment verified' },
    { title: 'Processing', desc: 'Crafting & packing' },
    { title: 'Shipped', desc: 'Out with courier' },
    { title: 'Delivered', desc: 'Safely received' },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-slate-900">Order Not Found</h2>
        <p className="text-sm text-slate-500">The order reference #{orderNumber} could not be found.</p>
        <Link to="/orders">
          <Button size="sm">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isReturnRequested = order.status === 'RETURN_REQUESTED';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const canReturn = order.status === 'DELIVERED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          to="/orders"
          className="text-xs font-bold text-slate-500 hover:text-primary-600 flex items-center gap-1 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-xs font-medium text-slate-400">Order Details</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              #{order.order_number}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Placed on {formatDate(order.created_at)}</p>
          </div>

          <div className="flex items-center gap-3">
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                loading={cancelling}
                onClick={handleCancelOrder}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel Order
              </Button>
            )}
            {canReturn && (
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                loading={returning}
                onClick={handleRequestReturn}
              >
                Request Return
              </Button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        </div>
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

      {/* Tracking Progression Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
        <h2 className="font-heading font-bold text-base text-slate-900">
          Delivery Status Progression
        </h2>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
            <XCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-sm">Order Cancelled</p>
              <p className="text-xs text-red-600">
                This shipment was cancelled. Inventory reservations have been reversed.
              </p>
            </div>
          </div>
        ) : isReturnRequested ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3">
            <RotateCcw className="w-6 h-6 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-bold text-sm">Return Requested</p>
              <p className="text-xs text-amber-700">
                Our support team is reviewing your return request. We will arrange pickup shortly.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative py-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {trackingSteps.map((step, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;
                return (
                  <div key={idx} className="flex flex-col items-center text-center relative space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-md'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Info: Shipping & Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address Snapshot */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-primary-600" />
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Shipping Address Snapshot
            </h3>
          </div>
          <p className="font-bold text-sm text-slate-800">{order.shipping_full_name}</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {order.shipping_street_address}
            {order.shipping_apartment_suite && `, ${order.shipping_apartment_suite}`}
            <br />
            {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}
            <br />
            {order.shipping_country}
          </p>
          <p className="text-xs font-semibold text-slate-700 pt-1">
            Phone: {order.shipping_phone}
          </p>
        </div>

        {/* Payment & Invoice Overview */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            {order.payment_method === 'COD' ? (
              <Banknote className="w-4 h-4 text-amber-600" />
            ) : (
              <CreditCard className="w-4 h-4 text-emerald-600" />
            )}
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Payment & Settlement
            </h3>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Payment Gateway:</span>
              <strong className="text-slate-800">
                {order.payment_method === 'COD' ? 'Cash on Delivery (COD)' : 'Razorpay Secure'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <strong
                className={order.payment_status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}
              >
                {order.payment_status}
              </strong>
            </div>
            {order.customer_notes && (
              <div className="pt-2 border-t border-slate-100 text-slate-500">
                <span>Notes: </span>
                <em>{order.customer_notes}</em>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table & Financial Invoice Breakdown */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Purchased Handcrafted Items ({order.items?.length || 0})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items?.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
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
                <div>
                  <p className="font-heading font-bold text-sm text-slate-900">
                    {item.product_title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    SKU: {item.product_sku || 'N/A'} • Unit: {formatCurrency(item.unit_price)} × {item.quantity}
                  </p>
                </div>
              </div>

              <span className="font-heading font-black text-sm text-slate-900">
                {formatCurrency(item.total_price)}
              </span>
            </div>
          ))}
        </div>

        {/* Financial Breakdown Footnote */}
        <div className="bg-slate-50 p-6 border-t border-slate-200/80">
          <div className="max-w-xs ml-auto space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(order.items_subtotal)}
              </span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Coupon ({order.coupon_code})
                </span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Pan-India Shipping</span>
              <span>
                {order.shipping_fee === 0 ? (
                  <strong className="text-emerald-700">FREE</strong>
                ) : (
                  formatCurrency(order.shipping_fee)
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
              <span className="font-heading font-bold text-slate-900">Total Billed</span>
              <span className="font-heading font-black text-xl text-primary-700">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
