import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  MapPin,
  CreditCard,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Button } from '../../components/common/Button';

export const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await orderService.getOrderByNumber(orderNumber);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Celebration Banner */}
      <div className="text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Order Placed Successfully
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Dhanyawad for shopping with Indian Bazar!
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            We've received your order. Our master artisans and dispatch team are packing your authentic treasures with care.
          </p>
        </div>
      </div>

      {/* Order Info Card */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
          Loading order receipt...
        </div>
      ) : order ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-medium text-slate-400">Order Reference</p>
              <p className="font-mono font-bold text-xl text-primary-700 mt-0.5">
                #{order.order_number}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                {order.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Razorpay Paid'}
              </span>
            </div>
          </div>

          {/* Delivery & Payment Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-primary-600" /> Shipping Destination
              </div>
              <p className="font-semibold text-slate-800">{order.shipping_full_name}</p>
              <p className="text-slate-600 leading-relaxed">
                {order.shipping_street_address}
                {order.shipping_apartment_suite && `, ${order.shipping_apartment_suite}`}
                <br />
                {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}
              </p>
              <p className="text-slate-500 font-medium">Contact: {order.shipping_phone}</p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                {order.payment_method === 'COD' ? (
                  <Banknote className="w-4 h-4 text-amber-600" />
                ) : (
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                )}
                Payment & Billing
              </div>
              <p className="font-semibold text-slate-800">
                Method: {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Razorpay Online Gateway'}
              </p>
              <p className="text-slate-600">
                Status:{' '}
                <strong
                  className={order.payment_status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}
                >
                  {order.payment_status}
                </strong>
              </p>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-slate-500 font-bold uppercase">Total Billed:</span>
                <span className="font-heading font-black text-base text-primary-700">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="space-y-3 pt-2">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Items in this Package ({order.items?.length || 0})
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {order.items?.map((item) => (
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
                        Qty: {item.quantity} × {formatCurrency(item.unit_price)}
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
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link to={`/orders/${orderNumber}`} className="w-full sm:w-auto">
          <Button size="lg" icon={Package} className="w-full">
            Track Order Status
          </Button>
        </Link>
        <Link to="/orders" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full">
            View All Orders
          </Button>
        </Link>
        <Link to="/shop" className="w-full sm:w-auto">
          <Button variant="ghost" size="lg" icon={ArrowRight} className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
