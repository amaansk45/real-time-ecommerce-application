import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            Pending
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            Confirmed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            Processing
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const overview = metrics?.overview || {
    total_revenue: 0,
    total_orders: 0,
    total_customers: 0,
    total_products: 0,
    low_stock_count: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold border border-primary-500/30">
            Store Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Namaste, {user?.first_name || 'Admin'}! 👋
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Live overview of orders, inventory alerts, and customer activity across Indian Bazar.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/admin/products">
            <Button size="sm" icon={Plus} className="shadow-md">
              Add Product
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button
              size="sm"
              variant="outline"
              className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
            >
              Process Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {formatCurrency(overview.total_revenue)}
            </p>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> From paid & confirmed orders
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {overview.total_orders}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {metrics?.status_distribution?.pending || 0} pending processing
            </p>
          </div>
        </div>

        {/* Live Catalog Products */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Products
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {overview.total_products}
            </p>
            <p className="text-xs font-semibold text-blue-600 mt-1">
              Active in storefront catalog
            </p>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Customers
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {overview.total_customers}
            </p>
            <p className="text-xs font-semibold text-amber-700 mt-1">
              Verified customer accounts
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner (if count > 0) */}
      {overview.low_stock_count > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Low Inventory Notice ({overview.low_stock_count} {overview.low_stock_count === 1 ? 'item' : 'items'})
              </h3>
              <p className="text-xs text-slate-600">
                Certain authentic products have 5 or fewer items remaining in stock. Consider replenishing inventory.
              </p>
            </div>
          </div>
          <Link to="/admin/products">
            <Button variant="outline" size="sm" className="bg-white text-xs">
              Review Inventory <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* 2-Column: 7-Day Revenue Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 7-Day Revenue Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-heading font-bold text-base text-slate-900">
                Daily Revenue Trend (Past 7 Days)
              </h2>
              <p className="text-xs text-slate-400">Order revenue generated each day</p>
            </div>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Live Analytics
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-56">
            {metrics?.daily_sales?.map((day, idx) => {
              const maxRev = Math.max(...metrics.daily_sales.map((d) => d.revenue), 1000);
              const heightPercent = Math.max(12, Math.round((day.revenue / maxRev) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(day.revenue)}
                  </div>
                  <div
                    className="w-full bg-slate-100 hover:bg-primary-500 rounded-xl transition-all duration-300 relative group-hover:shadow-md cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-600 to-amber-500 rounded-xl opacity-80 group-hover:opacity-100"></div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 text-center truncate w-full">
                    {day.day.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Status Distribution */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
          <h2 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-4">
            Fulfillment Breakdown
          </h2>

          <div className="space-y-3 text-xs">
            {[
              {
                label: 'Pending Approval',
                count: metrics?.status_distribution?.pending || 0,
                color: 'bg-amber-500',
              },
              {
                label: 'Confirmed Orders',
                count: metrics?.status_distribution?.confirmed || 0,
                color: 'bg-blue-500',
              },
              {
                label: 'Processing / Crafting',
                count: metrics?.status_distribution?.processing || 0,
                color: 'bg-indigo-500',
              },
              {
                label: 'Out for Delivery',
                count: metrics?.status_distribution?.shipped || 0,
                color: 'bg-purple-500',
              },
              {
                label: 'Successfully Delivered',
                count: metrics?.status_distribution?.delivered || 0,
                color: 'bg-emerald-500',
              },
              {
                label: 'Cancelled Orders',
                count: metrics?.status_distribution?.cancelled || 0,
                color: 'bg-red-500',
              },
            ].map((st, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${st.color}`}></div>
                  <span className="font-medium text-slate-700">{st.label}</span>
                </div>
                <span className="font-bold font-heading text-slate-900">{st.count}</span>
              </div>
            ))}
          </div>

          <Link to="/admin/orders" className="block pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs" icon={ExternalLink}>
              View All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Orders Master Preview */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-base text-slate-900">
              Recent Store Orders
            </h2>
            <p className="text-xs text-slate-400">Incoming shipments requiring attention</p>
          </div>
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm" icon={ArrowRight}>
              All Orders
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Loading recent orders...
          </div>
        ) : metrics?.recent_orders?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No orders placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-6">Order Reference</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Total</th>
                  <th className="py-3 px-6">Payment</th>
                  <th className="py-3 px-6">Fulfillment</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {metrics?.recent_orders?.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{ord.order_number}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{ord.customer_name}</p>
                      <p className="text-[10px] text-slate-400">{ord.customer_email}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {formatDate(ord.created_at)}
                    </td>
                    <td className="py-4 px-6 font-heading font-bold text-slate-900">
                      {formatCurrency(ord.total_amount)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800 block">
                        {ord.payment_method}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          ord.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(ord.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <Link to="/admin/orders">
                        <button className="text-primary-600 hover:text-primary-700 font-bold hover:underline">
                          Process →
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
