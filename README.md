# CornerEats Food Delivery

Full-stack food delivery app with separate customer and admin Vite apps, an Express/MongoDB API, and Stripe Checkout.

## Local Development

Requirements: Node.js 20 or newer, npm, and a MongoDB database.

1. Install dependencies from the repository root, then in each app directory:

```sh
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

2. Copy `backend/.env.example` to `backend/.env` and set real local values. Copy `frontend/.env.example` to `frontend/.env.local` and `admin/.env.example` to `admin/.env.local`; set `VITE_API_URL=http://localhost:4000` in both.
3. Run the API with `npm run dev:backend`, the customer app with `npm run dev`, and the admin app with `npm run dev:admin` from the repository root.

## Release Checks

Run the complete local release gate from the repository root:

```sh
npm run check
```

This runs ESLint for both apps, all existing backend and frontend tests, and production builds for both Vite apps.

## Deployment

Deploy three services: the backend as a Node web service, and the customer/admin apps as static sites.

### Backend service

Use the `backend` directory as the service root, `npm install` as the install command, and `npm start` as the start command. Configure these environment variables in the hosting dashboard; never commit real secrets:

- `MONGODB_URI`: production MongoDB connection string. Restrict database network access to the backend host where possible.
- `JWT_SECRET`: long, random production secret.
- `STRIPE_SECRET_KEY`: production Stripe secret key. Use a test key only for test deployments.
- `FRONTEND_URL`: deployed customer app origin, with no trailing slash.
- `ADMIN_URL`: deployed admin app origin, with no trailing slash.
- `CORS_ORIGINS`: comma-separated deployed origins allowed to call the API.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`: dedicated admin login and bcrypt password hash.
- `PORT`: set by most platforms automatically; otherwise use `4000`.

Keep the backend on a persistent database. The current food image upload implementation writes to `backend/uploads`; free hosts with an ephemeral filesystem can lose uploaded images on restart or redeploy. Before accepting production uploads, attach persistent storage or migrate uploads to object storage and configure backups.

### Static apps

Build `frontend` and `admin` separately with `npm run build` from each directory. Set `VITE_API_URL` to the deployed API origin in each static site's build environment, then publish that app's `dist` directory. Configure the host's SPA fallback so unknown paths serve `/index.html` (for example, `/*` to `/index.html` with status `200`); this is required for direct loads and refreshes on routes such as `/cart`, `/order`, and `/accounts`.

After deploy, verify customer registration/login, admin login, account listing, food image delivery, promo validation, order creation, and a Stripe test checkout before switching to live payments.
