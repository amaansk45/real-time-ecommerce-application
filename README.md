# 🛒 Indian Bazar - Full-Stack E-Commerce Platform

Welcome to **Indian Bazar**, a modern, high-performance, full-stack e-commerce web application engineered from the ground up for single-store retail. Indian Bazar pairs a dynamic, responsive **React + Vite + Tailwind CSS** frontend with a robust, modular **Python + Django REST Framework** backend.

---

## 🌟 Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 / 19, Vite, Tailwind CSS | Lightning-fast, modern UI with responsive design |
| **Backend** | Python, Django, Django REST Framework | Clean RESTful APIs, modular Django apps architecture |
| **Database** | SQLite (Inspectable via DB Browser for SQLite) | Local, zero-config relational database |
| **Authentication** | JWT (SimpleJWT) | Access & Refresh tokens with role-based permissions |
| **Payments** | Razorpay SDK & Cash on Delivery (COD) | Server-side signature verification & order workflows |
| **Tooling** | Git, GitHub, Postman | Version control, documentation, and API testing |

---

## 👥 User Roles & Access Control

Indian Bazar implements strict role-based separation:

1. **Customer:**
   - Account registration, login/logout, profile & shipping address management.
   - Browse catalog, categories/subcategories, full-text search, multi-facet filtering, sorting, pagination.
   - Shopping cart & wishlist management.
   - Coupon application & price breakdown.
   - Seamless checkout with Razorpay online payment or Cash on Delivery (COD).
   - Order history, live status tracking, order cancellation, and return/refund requests.
   - Product reviews and star ratings.

2. **Admin:**
   - Single-store superadmin portal (strictly no multi-vendor/seller accounts).
   - Sales analytics, revenue trends, orders, and customer insights dashboard.
   - Complete CRUD operations for products, categories, subcategories, inventory, and images.
   - Order status progression (`Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered` / `Cancelled`).
   - Payment status verification & manual COD reconciliation.
   - Coupon and promotional discount management.
   - Customer account management & low-stock automated alerts.
   - Return and refund request processing.

---

## 🗂️ Project Directory Architecture

```text
real-time-ecommerce-application/
│
├── .gitattributes                  # Normalized Git line-endings (LF/CRLF)
├── .gitignore                      # Comprehensive Git exclusion rules
├── README.md                       # Master project documentation
│
├── backend/                        # Django REST Framework Backend
│   ├── .env.example                # Backend environment configuration template
│   ├── requirements.txt            # Python dependencies (Step 2)
│   ├── manage.py                   # Django CLI utility (Step 2)
│   ├── core/                       # Django project root settings and routing
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── apps/                       # Modular Django apps
│   │   ├── accounts/               # Custom User, Customer/Admin Profiles, JWT Auth
│   │   ├── products/               # Categories, Products, Images, Reviews
│   │   ├── orders/                 # Cart, CartItem, Order, OrderItem, Coupon
│   │   ├── payments/               # Razorpay orders, verifications, payment ledger
│   │   └── common/                 # Pagination, custom permissions, helpers
│   └── media/                      # Uploaded assets (images, banners)
│
└── frontend/                       # React + Vite + Tailwind CSS Frontend
    ├── .env.example                # Frontend environment configuration template
    ├── package.json                # Node dependencies & build scripts (Step 4)
    ├── vite.config.js              # Vite bundler configuration (Step 4)
    ├── tailwind.config.js          # Tailwind CSS styling design system (Step 4)
    ├── postcss.config.js           # PostCSS plugins (Step 4)
    ├── index.html                  # HTML5 entrypoint (Step 4)
    └── src/
        ├── assets/                 # Static images, icons, logos
        ├── components/
        │   ├── common/             # Navbar, Footer, Modal, Button, Alert, Loader
        │   ├── customer/           # ProductCard, CartDrawer, FilterSidebar, ReviewList
        │   └── admin/              # AdminSidebar, StatsCard, ProductTable, OrderStatusBadge
        ├── pages/
        │   ├── customer/           # Home, Shop, ProductDetail, Cart, Checkout, Profile, Orders
        │   └── admin/              # Dashboard, ProductsManage, OrdersManage, CouponsManage
        ├── context/                # AuthContext, CartContext, WishlistContext
        ├── services/               # Axios/Fetch API client wrappers
        ├── routes/                 # Protected routes, Customer routes, Admin routes
        └── utils/                  # Currency formatters (INR ₹), date helpers, validators
```

---

## 📋 Step-by-Step Implementation Roadmap

- [x] **Step 1: Project Setup and Folder Structure**
  - Configured Git repository, `.gitignore`, `.gitattributes`, and `.env.example` templates.
  - Established modular backend and frontend folder hierarchy.
  - Committed foundational structure to GitHub.
- [x] **Step 2: Django & Django REST Framework Backend Setup**
  - Python virtual environment setup (`backend/venv`).
  - Installed dependencies: `Django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, `pillow`, `python-dotenv`, `razorpay`, `django-filter`.
  - Configured Django `settings.py`, SQLite database (DB Browser compatible), CORS headers, JWT settings, and media/static paths.
  - Initialized modular apps: `accounts`, `products`, `orders`, `payments`, `common`.
  - Added centralized health check endpoint (`/api/health/`) and automated test suite.
- [x] **Step 3: Custom User Model & Role-Based Authentication**
  - Implemented custom `User` model inheriting `AbstractBaseUser` / `PermissionsMixin` with email as unique identifier.
  - Role-based separation: `CUSTOMER` and `ADMIN` (strict single-store model).
  - Implemented `Address` model for multi-address delivery with automatic default address switching.
  - JWT Authentication with custom claims (`role`, `is_admin`, `email`, `full_name`) and structured login/registration payloads.
  - Endpoints: Register, Login, Token Refresh/Verify, Profile, Change Password, Address CRUD, and Admin Customer List.
  - Added idempotent `python manage.py create_admin` management command.
  - 23 automated tests covering auth, token generation, address management, and permission barriers.
- [x] **Step 4: Frontend Setup (React, Vite, Tailwind CSS & Routing)**
  - Initialized React 18 with Vite bundler, Tailwind CSS v3.4, and PostCSS.
  - Tailored rich Indian Bazar color palette (royal saffron `#E8590C`, forest emerald, and festive gold), typography (`Plus Jakarta Sans` & `Outfit`), and glassmorphism.
  - Configured Axios client with automatic silent JWT token refresh and authorization header injection.
  - Global `AuthContext` with login, register, profile sync, and role checks (`isAdmin`, `isCustomer`).
  - Route guards: `ProtectedRoute`, `AdminRoute`, and `PublicOnlyRoute`.
  - Responsive `Navbar`, `Footer`, `Button`, and `Input` reusable UI components.
  - Implemented `HomePage`, `LoginPage` (with one-click admin test autofill), `RegisterPage`, `ProfilePage`, `AddressesPage`, and `AdminDashboardPage`.
  - Built cleanly with zero bundling or lint errors (`npm run build`).
- [x] **Step 5: Products, Categories & Customer Catalog**
  - Implemented `Category`, `Subcategory`, `Product`, `ProductImage`, and `Review` models in SQLite.
  - Calculated dynamic fields: `effective_price`, `discount_percentage`, `is_in_stock`, `average_rating`, `reviews_count`.
  - Multi-facet filters (`ProductFilter`): category, subcategory, price range (`min_price`, `max_price`), stock availability, and Indian origin region.
  - Endpoints: Category list, Product catalog listing, Search, Product detail, Related products, and Review submission.
  - Store Admin Product CRUD ViewSet (`/api/products/admin/items/`).
  - Idempotent `python manage.py seed_products` seeder with authentic Indian products (Banarasi Sarees, Kashmiri Saffron, Tellicherry Pepper, Jaipur Pottery, Mamra Almonds).
  - 37 automated tests passing cleanly across the backend test suite.
  - Frontend `ProductCard`, live `ShopPage` catalog with sidebar filters, and `ProductDetailPage` with gallery and review form.
- [x] **Step 6: Cart, Wishlist, Checkout, Orders & Payments**
  - Implemented `Cart`, `CartItem`, `Wishlist`, `Coupon`, `Order`, `OrderItem`, and `PaymentTransaction` models in SQLite.
  - Cart features: quantity steppers, item removal, cart clearing, automatic delivery fee computation (Free over ₹999), and coupon discount calculations (Percentage and Flat rate).
  - Razorpay Online Payments: server-side order generation (amount in paise), HMAC-SHA256 signature verification, and dev test sandbox simulation.
  - Cash on Delivery (COD) order placement workflow.
  - Atomic stock management (`@transaction.atomic`): decrements inventory on checkout and restores stock on order cancellation.
  - Seeder command `python manage.py seed_coupons` with festive promo codes (`FESTIVE20`, `WELCOME100`, `BAZAR50`).
  - 47 automated tests passing across the backend test suite.
  - Frontend services (`orderService`, `paymentService`), global contexts (`CartContext`, `WishlistContext`).
  - Frontend storefront pages: `CartPage`, `WishlistPage`, `CheckoutPage` (with address picker & modal), `OrderSuccessPage`, `OrdersPage`, and `OrderDetailPage` with 5-step visual tracking timeline.
- [ ] **Step 7: Admin Dashboard & Management System**
  - Single-store admin dashboard with metrics (Total Sales, Revenue, Orders, Low Stock).
  - Admin CRUD tables for Products, Categories, Orders, and Coupons.
- [ ] **Step 8: Testing, Security, Polish & Deployment Preparation**
  - Automated tests for Auth, Products, Orders, and Payments.
  - Production security checklist, logging, error handling, and documentation.

---

## 🚀 Quick Start (Step 1 Verification)

### Verify Repository Layout
```powershell
git status
git log --oneline
```

---

## 📄 License & Attribution
Designed and built for **Indian Bazar** by Shaikh Amaan.
