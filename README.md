# 🍔 CornerEats - Full-Stack Food Delivery & Restaurant Management Platform

[![Customer App](https://img.shields.io/badge/Vercel-Customer_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://corner-eats.vercel.app)
[![Admin Portal](https://img.shields.io/badge/Vercel-Admin_Portal-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://corner-eats-admin.vercel.app)
[![Backend API](https://img.shields.io/badge/Render-Backend_API-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://cornereats-backend.onrender.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe_Payments-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A modern, production-grade commercial food delivery ecosystem. Engineered as a three-tier architecture comprising a customer web storefront, a dedicated kitchen & operations administration dashboard, a secure REST API backend, and automated asynchronous Stripe payments.

> 🚀 **Live Production Storefront:** [https://corner-eats.vercel.app](https://corner-eats.vercel.app)  
> 🛡️ **Live Kitchen & Admin Portal:** [https://corner-eats-admin.vercel.app](https://corner-eats-admin.vercel.app)  
> 👤 **Author & Copyright:** [Irmak Kartalkayası](https://github.com/irmakKartal)  
> 📄 **License:** MIT License  

---

## 🌐 Official Deployments

| Component | Platform | Role | Live URL |
| :--- | :--- | :--- | :--- |
| **Customer Web Application** | Vercel Edge | Customer ordering, tracking, cart & checkout | [corner-eats.vercel.app](https://corner-eats.vercel.app) |
| **Operations & Admin Portal** | Vercel Edge | Food catalog, discount codes, live order status & trash/archive | [corner-eats-admin.vercel.app](https://corner-eats-admin.vercel.app) |
| **Backend REST Services** | Render | Node.js / Express API, MongoDB connection, Stripe Webhooks | [cornereats-backend.onrender.com](https://cornereats-backend.onrender.com) |

---

## 🏗️ System Architecture & Engineering Highlights

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     Customer Web Application    │       │     Admin Operations Portal     │
│       (React 18 + Vite)         │       │        (React 18 + Vite)        │
│    https://corner-eats.vercel   │       │  https://corner-eats-admin.ver  │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 │              HTTPS / REST API           │
                 └───────────────────┬─────────────────────┘
                                     │
                                     ▼
                  ┌──────────────────────────────────────┐
                  │          Backend REST API            │
                  │      (Node.js / Express Server)      │
                  │  https://cornereats-backend.onrender │
                  └──────────────┬────────────────┬──────┘
                                 │                │
                    Mongoose ORM │                │ Webhook Verification
                                 ▼                ▼
                  ┌──────────────────────┐  ┌───────────────────────────┐
                  │    MongoDB Atlas     │  │   Stripe Checkout Engine  │
                  │  (Managed Database)  │  │ (Cards, Apple Pay, Link)  │
                  └──────────────────────┘  └───────────────────────────┘
```

---

## ✨ Key Features & Capabilities

### 👤 Customer Application (`frontend`)
* **Dynamic Menu & Real-time Search:** Interactive category filtering, fuzzy search, and dietary preference discovery.
* **Smart Shopping Cart Engine:** Real-time subtotal computation, dynamic delivery fee logic, and persistent storage across browser sessions.
* **Server-Enforced Discount System:** Promo codes validated server-side to prevent tampering, supporting percentage and flat rate deductions.
* **Multi-Currency Adaptation:** Automatic locale and time zone detection with dynamic conversion between **US Dollar (USD $)** and **Turkish Lira (TRY ₺)**.
* **Frictionless Payment Flow:** Integrated with Stripe Checkout supporting Credit/Debit Cards, Apple Pay, Google Pay, and Stripe Link with instant verification.
* **Live Order Tracking (`My Orders`):**
  * Asynchronous status synchronization (auto-refreshes every 5 seconds).
  * Pulse indicator (`● Live Updates`) giving real-time feedback on kitchen preparation and delivery progress.
  * Comprehensive order detail modals with complete receipt breakdown and one-click reordering.

### 🛡️ Admin & Kitchen Operations Portal (`admin`)
* **Menu & Inventory Control:** Real-time food item addition, image asset uploads, categorization, and stock management.
* **Promotional Campaign Manager:** Create, activate, deactivate, and track coupon usage.
* **Order Lifecycle Workflow:**
  * Live status transitions (`Pending` ➔ `Food Processing` ➔ `Out for Delivery` ➔ `Delivered`).
  * Instant segregation of paid versus unpaid checkouts.
  * **Archive System:** Archive delivered orders to declutter active kitchen queues with instant restoration.
  * **Soft-Delete Trash Safety:** Safe trash bin with one-click restore and permanent purge capabilities.

### ⚙️ Backend API & Security Standards (`backend`)
* **Role-Based Access Control:** Secure JWT authentication and protected admin routes.
* **Stripe Webhook Listener:** Cryptographically verified webhook handling (`checkout.session.completed`) with replay attack prevention.
* **Input Sanitization & Data Integrity:** MongoDB query sanitization, XSS mitigation, strict schema validation, and enforced order state transitions.

---

## 📁 Repository Structure

```text
CornerEats/
├── frontend/             # Customer-facing React 18 SPA (Vite, Context API)
│   ├── src/
│   │   ├── components/   # Modular UI components (Navbar, Cart, FoodDisplay, etc.)
│   │   ├── pages/        # Routes (Home, Cart, PlaceOrder, MyOrders, Verify)
│   │   └── context/      # StoreContext state management
├── admin/                # Restaurant management & kitchen portal (React 18 SPA)
│   ├── src/
│   │   ├── pages/        # AddItem, ListItems, Orders, PromoCodes
│   │   └── components/   # Sidebar, Navbar, LiveOrderStatus
├── backend/              # Node.js & Express REST API
│   ├── controllers/      # Business logic (user, food, cart, order, promo)
│   ├── models/           # Mongoose schemas (userModel, foodModel, orderModel, promoModel)
│   ├── routes/           # Express endpoints
│   ├── middleware/       # Auth, AdminAuth, and upload handlers
│   └── tests/            # Automated test suites
├── LICENSE               # Open-source MIT License
├── package.json          # Monorepo orchestration scripts
└── README.md             # Project documentation & architecture guide
```

---

## 🛠️ Local Development & Testing

### Prerequisites
* **Node.js** (v18 or v20+ recommended)
* **npm** (v9+)
* **MongoDB** (Local instance or MongoDB Atlas URI)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/irmakKartal/CornerEats.git
   cd CornerEats
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ../admin && npm install
   cd ..
   ```

3. **Configure Environment Variables:**
   * In `backend/.env`:
     ```env
     PORT=4000
     MONGODB_URI="your_mongodb_connection_string"
     JWT_SECRET="your_jwt_secret"
     STRIPE_SECRET_KEY="your_stripe_secret_key"
     FRONTEND_URL="http://localhost:5173"
     ADMIN_URL="http://localhost:5174"
     ```
   * In `frontend/.env.local`:
     ```env
     VITE_API_URL="http://localhost:4000"
     ```
   * In `admin/.env.local`:
     ```env
     VITE_API_URL="http://localhost:4000"
     ```

4. **Launch Development Servers:**
   ```bash
   # Run all services concurrently (or individually):
   npm run dev:backend   # Express API on http://localhost:4000
   npm run dev           # Customer frontend on http://localhost:5173
   npm run dev:admin     # Admin dashboard on http://localhost:5174
   ```

---

## 🧪 Automated Testing & Code Quality

Run the automated verification suite from the root directory:
```bash
npm run check
```
This executes:
* **ESLint:** Code style and syntax validation across both frontend and admin codebases.
* **Unit & Integration Tests:** 21 automated tests verifying pricing algorithms, input sanitization, promo validations, and Stripe webhook payloads.
* **Production Build Checks:** Production asset compilation and bundling.

---

## 📄 License & Copyright

This project is licensed under the **MIT License**.  
Copyright © 2024 **[Irmak Kartalkayası](https://github.com/irmakKartal)**. All rights reserved.
