import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Heart,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Package,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      {/* Top micro-announcement banner */}
      <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-amber-700 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        🇮🇳 Authentic Indian Handcrafted & Lifestyle Store • Free Delivery on Orders Over ₹999
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-md shadow-primary-500/25 group-hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
                Indian <span className="text-primary-600">Bazar</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 -mt-1">
                Pure • Desi • Quality
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg mx-6 relative"
          >
            <input
              type="text"
              placeholder="Search spices, kurtas, handicrafts, dry fruits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-sm text-slate-800 placeholder-slate-400 pl-11 pr-24 py-2.5 rounded-full border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-4 py-1.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Search
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-xl text-slate-600 hover:text-primary-600 hover:bg-slate-100 transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              <span className="sr-only">Wishlist</span>
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="p-2.5 rounded-xl text-slate-600 hover:text-primary-600 hover:bg-slate-100 transition-colors relative"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                0
              </span>
              <span className="sr-only">Shopping Cart</span>
            </Link>

            {/* User Account Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                    {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.first_name || 'My Account'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 capitalize">
                      {user?.role?.toLowerCase() || 'Customer'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3" /> Store Administrator
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-primary-600" />
                          Admin Portal
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        My Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>

                      <Link
                        to="/addresses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        Saved Addresses
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          <nav className="flex flex-col gap-1 pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              All Products
            </Link>
            {!isAuthenticated && (
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold text-white bg-primary-600 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
