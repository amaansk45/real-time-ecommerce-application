import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  RotateCcw,
  ShoppingBag,
  Mail,
  Phone,
  Heart,
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 mt-20 border-t border-slate-800">
      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic</h4>
              <p className="text-xs text-slate-400">Direct from Indian artisans</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast Pan-India Delivery</h4>
              <p className="text-xs text-slate-400">Tracked Express Shipping</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Razorpay & COD</h4>
              <p className="text-xs text-slate-400">Encrypted Safe Payments</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy 7-Day Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free refund policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                Indian <span className="text-primary-500">Bazar</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your premier online bazaar celebrating authentic Indian heritage, ethnic wear, organic spices, handmade crafts, and daily essentials with guaranteed quality.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-primary-400" /> support@indianbazar.com
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary-400" /> +91 1800 123 4567
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider font-heading">Shop</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/shop" className="hover:text-primary-400 transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=ethnic-wear" className="hover:text-primary-400 transition-colors">Ethnic Wear</Link></li>
              <li><Link to="/shop?category=spices-grocery" className="hover:text-primary-400 transition-colors">Spices & Grocery</Link></li>
              <li><Link to="/shop?category=handicrafts" className="hover:text-primary-400 transition-colors">Handicrafts</Link></li>
              <li><Link to="/shop?category=dry-fruits" className="hover:text-primary-400 transition-colors">Premium Dry Fruits</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider font-heading">Support</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/orders" className="hover:text-primary-400 transition-colors">Track Order</Link></li>
              <li><Link to="/profile" className="hover:text-primary-400 transition-colors">My Profile</Link></li>
              <li><Link to="/addresses" className="hover:text-primary-400 transition-colors">Shipping Addresses</Link></li>
              <li><span className="cursor-pointer hover:text-primary-400 transition-colors">Return & Refund Policy</span></li>
              <li><span className="cursor-pointer hover:text-primary-400 transition-colors">Terms & Privacy</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider font-heading">Newsletter</h5>
            <p className="text-xs text-slate-400">
              Subscribe for exclusive festive discounts, coupon drops, and new arrival alerts.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1">
          © {new Date().getFullYear()} Indian Bazar. Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for authentic Indian commerce. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
