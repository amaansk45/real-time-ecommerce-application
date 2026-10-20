import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CustomerLayout } from './components/common/CustomerLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './routes/RouteGuards';

// Pages
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { AddressesPage } from './pages/customer/AddressesPage';
import { CartPage } from './pages/customer/CartPage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { DashboardPage as AdminDashboardPage } from './pages/admin/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
          {/* Customer / Storefront Layout */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="product/:slug" element={<ProductDetailPage />} />


            {/* Public Only Auth Routes */}
            <Route
              path="login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            {/* Protected Customer Routes */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="addresses"
              element={
                <ProtectedRoute>
                  <AddressesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <div className="max-w-5xl mx-auto py-16 px-4 text-center">
                    <h2 className="text-2xl font-bold font-heading">My Orders</h2>
                    <p className="text-sm text-slate-500 mt-2">Order tracking will be activated in Step 6.</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Protected Store Administrator Layout */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route
              path="products"
              element={
                <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-200/80">
                  <h2 className="text-xl font-bold font-heading">Product Inventory Management</h2>
                  <p className="text-sm text-slate-500 mt-1">Product CRUD management will be activated in Step 5.</p>
                </div>
              }
            />
            <Route
              path="categories"
              element={
                <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-200/80">
                  <h2 className="text-xl font-bold font-heading">Category & Subcategory Hierarchy</h2>
                  <p className="text-sm text-slate-500 mt-1">Category management will be activated in Step 5.</p>
                </div>
              }
            />
            <Route
              path="orders"
              element={
                <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-200/80">
                  <h2 className="text-xl font-bold font-heading">Order Processing & Shipping Status</h2>
                  <p className="text-sm text-slate-500 mt-1">Order management will be activated in Step 6 & 7.</p>
                </div>
              }
            />
            <Route
              path="customers"
              element={
                <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-200/80">
                  <h2 className="text-xl font-bold font-heading">Customer Accounts & Insights</h2>
                  <p className="text-sm text-slate-500 mt-1">Connected to /api/auth/admin/customers/ endpoint.</p>
                </div>
              }
            />
            <Route
              path="coupons"
              element={
                <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-200/80">
                  <h2 className="text-xl font-bold font-heading">Promotional Coupons & Festive Discounts</h2>
                  <p className="text-sm text-slate-500 mt-1">Coupon management will be activated in Step 6 & 7.</p>
                </div>
              }
            />
            <Route
              path="reports"
              element={
                <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-200/80">
                  <h2 className="text-xl font-bold font-heading">Revenue & Sales Analytics</h2>
                  <p className="text-sm text-slate-500 mt-1">Analytical reports will be activated in Step 7.</p>
                </div>
              }
            />
          </Route>

          {/* 404 Not Found Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
