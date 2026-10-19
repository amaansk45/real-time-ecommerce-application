import React from 'react';
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
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Revenue',
      value: '₹1,48,920',
      change: '+14.2% this week',
      icon: TrendingUp,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    },
    {
      title: 'Total Orders',
      value: '248',
      change: '+8 new orders today',
      icon: ShoppingBag,
      color: 'bg-primary-500/10 text-primary-600 border-primary-500/20',
    },
    {
      title: 'Live Products',
      value: '64',
      change: 'Across 6 categories',
      icon: Package,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
    {
      title: 'Active Customers',
      value: '182',
      change: '+18 joined this week',
      icon: Users,
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold border border-primary-500/30">
            Admin Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Namaste, {user?.first_name || 'Admin'}! 👋
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Here is your Indian Bazar store summary for today. Orders are progressing and stock is actively monitored.
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/admin/products">
            <Button size="sm" icon={Plus} className="shadow-md">
              Add New Product
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button size="sm" variant="outline" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Manage Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">{stat.value}</p>
                <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Status / Stock Warning Box */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Low Stock Alert System Operational</h3>
            <p className="text-xs text-slate-600">
              All inventory counts below threshold will be highlighted here in Step 5 & 7.
            </p>
          </div>
        </div>
        <Link to="/admin/products">
          <Button variant="outline" size="sm" className="bg-white">
            Inspect Inventory <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
