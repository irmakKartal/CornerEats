# 🍔 CornerEats - Food Delivery Platform

A full-stack, production-ready food delivery platform featuring a customer-facing web application, a comprehensive restaurant admin management dashboard, an Express/MongoDB REST API, and integrated Stripe Checkout.

---

## 🌐 Live Deployments & Demo Links

| Service | Hosting Provider | Live URL |
| :--- | :--- | :--- |
| **Customer Web App** | Vercel | [https://corner-eats.vercel.app](https://corner-eats.vercel.app) |
| **Admin Management Dashboard** | Vercel | [https://corner-eats-admin.vercel.app](https://corner-eats-admin.vercel.app) |
| **Backend REST API** | Render | [https://cornereats-backend.onrender.com](https://cornereats-backend.onrender.com) |
| **Source Code Repository** | GitHub | [https://github.com/irmakKartal/CornerEats](https://github.com/irmakKartal/CornerEats) |

---

## 🛠️ Third-Party Services & Technologies Used

* **Hosting & Cloud Infrastructure:**
  * **[Vercel](https://vercel.com/):** High-performance static web hosting and global edge CDN for both the Customer frontend and the Admin portal.
  * **[Render](https://render.com/):** Cloud application hosting running the Node.js / Express backend service.
* **Database & Storage:**
  * **[MongoDB Atlas](https://www.mongodb.com/atlas):** Fully-managed cloud database for storing users, food items, orders, and promo coupons.
* **Payments & Financial Transactions:**
  * **[Stripe Payments](https://stripe.com/):** End-to-end payment processing supporting:
    * Credit / Debit Cards (Visa, Mastercard, AMEX)
    * **Apple Pay** & **Google Pay**
    * **Stripe Link** (one-click checkout)
  * **Stripe Webhooks:** Asynchronous server-to-server payment confirmation with signature verification.
* **Currency Exchange:**
  * Dynamic multi-currency detection and conversion between **US Dollar (USD $)** and **Turkish Lira (TRY ₺)**.

---

## ✨ Key Features

### 👤 Customer Application (`frontend`)
* **Menu Browsing & Search:** Interactive category filtering and instant food search.
* **Smart Shopping Cart:** Real-time subtotal computation, custom delivery fee calculation, and persistent local storage.
* **Promotions & Coupons:** Server-validated promo code system with dynamic percentage discounts.
* **Multi-Currency Support:** Auto-detection of device locale/time zone with automatic price formatting (USD and TRY).
* **Smooth Checkout:** Seamless redirect to hosted Stripe Checkout supporting Cards, Apple Pay, Google Pay, and Link.
* **Real-Time Order Tracking (`My Orders`):**
  * Auto-syncing status updates every 5 seconds without manual page reload.
  * Order status live indicator (`● Live Updates`).
  * Detailed modal view with full item breakdown, delivery address, and price details.
  * One-click **Reorder** capability.

### 🛡️ Admin Management Portal (`admin`)
* **Food Catalog:** Add, list, and delete food items with image uploads and category tags.
* **Promo Code Management:** Create, toggle, and manage discount promo codes.
* **Advanced Orders Management:**
  * **Active Orders:** Track live kitchen orders (`Pending`, `Food Processing`, `Out for delivery`, `Delivered`).
  * **Paid vs. Unpaid Filters:** Distinct views for confirmed orders versus abandoned checkouts.
  * **📦 Archived Orders:** Archive delivered orders to keep the kitchen queue clean, with instant **Unarchive** restore.
  * **🗑️ Trash (Soft Delete):** Safely move orders to trash with **Restore** or permanent deletion (**Delete Forever**).
  * **Real-Time Sync:** Automatic live updates every 5 seconds and on window focus.

### ⚙️ Backend REST API (`backend`)
* **Authentication & Authorization:** JWT-based user authentication and dedicated Admin role middleware.
* **Order Lifecycle & State Machine:** Enforced state transitions protecting active kitchen orders from accidental removal.
* **Stripe Webhook Listener:** Raw body parser mounted for `checkout.session.completed` events.
* **Robust Security:** Mongo sanitize, input trimming, and strict ID validations.

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js** (v20 or newer recommended)
* **npm** (v10 or newer)
* **MongoDB** instance (local or MongoDB Atlas connection string)

### 1. Clone & Install Dependencies
From the repository root, install dependencies for all packages:
```sh
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
cd ..
```

### 2. Environment Variables Configuration

* **Backend (`backend/.env`):**
  ```env
  PORT=4000
  MONGODB_URI="your_mongodb_atlas_connection_string"
  JWT_SECRET="your_jwt_secret_key"
  STRIPE_SECRET_KEY="sk_test_..."
  FRONTEND_URL="http://localhost:5173"
  ADMIN_URL="http://localhost:5174"
  CORS_ORIGINS="http://localhost:5173,http://localhost:5174"
  ADMIN_EMAIL="admin@cornereats.com"
  ADMIN_PASSWORD_HASH="your_bcrypt_hash"
  ```

* **Frontend (`frontend/.env.local`):**
  ```env
  VITE_API_URL="http://localhost:4000"
  ```

* **Admin (`admin/.env.local`):**
  ```env
  VITE_API_URL="http://localhost:4000"
  ```

### 3. Run Development Servers
From the repository root:
```sh
# Start Backend API (Port 4000)
npm run dev:backend

# Start Customer Frontend (Port 5173)
npm run dev

# Start Admin Dashboard (Port 5174)
npm run dev:admin
```

---

## 🧪 Quality Assurance & Test Suite

Run the full local release gate from the repository root:
```sh
npm run check
```

This automated script executes:
1. **ESLint:** Code quality and linting checks across `frontend` and `admin`.
2. **Unit & Integration Tests:** 21 automated test suites covering image security, pricing math, Stripe session validation, promo codes, currency rates, and input sanitation.
3. **Production Builds:** Vite compilation and asset optimization for both client applications.

---

## 🚀 Production Deployment Notes

### Backend (Render)
* **Build Command:** `npm install`
* **Start Command:** `npm start`
* Configure all environment variables in the Render dashboard under **Environment**.
* Keep `backend/uploads` on persistent storage or attach S3-compatible cloud storage for production food images.

### Frontend & Admin (Vercel)
* **Framework Preset:** Vite
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* Set `VITE_API_URL` to `https://cornereats-backend.onrender.com`.
* Ensure SPA rewrite rule (`/*` -> `/index.html`) is active in `vercel.json` for client-side routing.
