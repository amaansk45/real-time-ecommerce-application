import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Banknote,
  RotateCcw,
  Sparkles,
  Printer,
  Calendar,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';

export const AdminReportsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalRevenue = metrics?.overview?.total_revenue || 0;
  const totalOrders = metrics?.overview?.total_orders || 0;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const cancelledOrders = metrics?.status_distribution?.cancelled || 0;
  const returnRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            Sales & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Financial performance reports, average basket size, and fulfillment efficiency
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-fit"
        >
          <Printer className="w-4 h-4" /> Print Report Summary
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
          <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">100% Verified settlements</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Volume</span>
          <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
            {totalOrders} Orders
          </p>
          <p className="text-[11px] text-slate-400">All-time lifetime orders</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value (AOV)</span>
          <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
            {formatCurrency(aov)}
          </p>
          <p className="text-[11px] text-primary-600 font-semibold">Per completed transaction</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancellation Rate</span>
          <p className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
            {returnRate}%
          </p>
          <p className="text-[11px] text-slate-400">{cancelledOrders} orders cancelled</p>
        </div>
      </div>

      {/* Daily Sales Chart & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-heading font-bold text-base text-slate-900">
                Recent 7-Day Revenue Velocity
              </h2>
              <p className="text-xs text-slate-400">Daily gross revenue distribution</p>
            </div>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              INR (₹)
            </span>
          </div>

          <div className="pt-4 flex items-end justify-between gap-3 h-52">
            {metrics?.daily_sales?.map((day, idx) => {
              const maxRev = Math.max(...metrics.daily_sales.map((d) => d.revenue), 1000);
              const heightPercent = Math.max(10, Math.round((day.revenue / maxRev) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(day.revenue)}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-primary-600 to-amber-500 rounded-xl transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className="text-[10px] font-semibold text-slate-500 text-center truncate w-full">
                    {day.day.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-5">
          <h2 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            Fulfillment Performance
          </h2>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px]">Delivered Shipments</span>
              <p className="font-heading font-black text-xl text-emerald-700">
                {metrics?.status_distribution?.delivered || 0}
              </p>
              <p className="text-[10px] text-slate-500">Safely fulfilled and delivered to customers</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px]">In Transit / Courier</span>
              <p className="font-heading font-black text-xl text-purple-700">
                {metrics?.status_distribution?.shipped || 0}
              </p>
              <p className="text-[10px] text-slate-500">Active shipments with tracking numbers</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px]">Pending Approval</span>
              <p className="font-heading font-black text-xl text-amber-700">
                {metrics?.status_distribution?.pending || 0}
              </p>
              <p className="text-[10px] text-slate-500">Awaiting store review and packaging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
