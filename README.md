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

- [x] **Step 1: Project Setup and Folder Structure** (Current)
  - Configured Git repository, `.gitignore`, `.gitattributes`, and `.env.example` templates.
  - Established modular backend and frontend folder hierarchy.
  - Committed foundational structure to GitHub.
- [ ] **Step 2: Django & Django REST Framework Backend Setup**
  - Python virtual environment setup.
  - Install dependencies: `django`, `djangorestframework`, `django-cors-headers`, `pillow`, `djangorestframework-simplejwt`, `razorpay`, `python-dotenv`.
  - Configure Django `settings.py`, SQLite database, CORS headers, media/static paths.
- [ ] **Step 3: Custom User Model & Role-Based Authentication**
  - Implement custom `User` model inheriting `AbstractBaseUser` / `PermissionsMixin`.
  - Separate roles: `ADMIN` vs `CUSTOMER`.
  - Customer Profile, shipping addresses model.
  - JWT Authentication endpoints (Register, Login, Token Refresh, Profile View/Edit).
- [ ] **Step 4: Frontend Setup (React, Vite, Tailwind CSS & Routing)**
  - Scaffold React with Vite and Tailwind CSS.
  - Configure React Router DOM for customer and protected admin paths.
  - Set up Axios instance with JWT interceptors.
- [ ] **Step 5: Products, Categories & Customer Catalog**
  - Category, Subcategory, Product, ProductImage, and Review models.
  - DRF ViewSets with search, filter (category, price range, stock), sorting, pagination.
  - Frontend customer catalog: Home page, banner, product listing, search, details page.
- [ ] **Step 6: Cart, Wishlist, Checkout, Orders & Payments**
  - Cart, CartItem, Wishlist, Coupon, Order, OrderItem models.
  - Razorpay order creation and HMAC-SHA256 signature verification.
  - COD payment workflow.
  - Order status tracking, order cancellation, and customer order history.
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
