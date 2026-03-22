# PopCom — Commission Tracking Platform

A full-stack affiliate marketing platform with brand/creator/admin dashboards, click tracking, commission calculation, wallet management, payout processing, and an immutable ledger system.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🌐 Live URLs

- **Frontend**: *Deployed on Vercel* — `https://your-app.vercel.app`
- **Backend**: *Deployed* — `https://your-api.onrender.com`

## 🔑 Test Credentials

| Role    | Email              | Password    |
|---------|-------------------|-------------|
| Admin   | admin@popcom.com   | admin123    |
| Brand   | brand@popcom.com   | brand123    |
| Creator | creator@popcom.com | creator123  |

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <repo-url>
cd brandAnalyticsManager

# Server
cd server
npm install
cp .env.example .env  # Edit MONGODB_URI and JWT_SECRET

# Client
cd ../client
npm install
```

### 2. Configure Environment

**Server `.env`**:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/popcom
JWT_SECRET=your_strong_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database

```bash
cd server
npm run seed
```

### 4. Run Development

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

Open `http://localhost:5173`

## 🚀 Deployment

### Backend (Render)
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Set **Root Directory** to `server`.
4. **Environment Variables**:
   - `PORT`: `5000` (Render detects this automatically, but good to set)
   - `MONGODB_URI`: Your Atlas connection string
   - `JWT_SECRET`: A long random string
   - `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://popcom.vercel.app`)
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`

### Frontend (Vercel)
1. Create a new project on Vercel.
2. Connect your GitHub repository.
3. Set **Root Directory** to `client`.
4. **Framework Preset**: Vite.
5. **Environment Variables**:
   - `VITE_API_URL`: Your Render service URL + `/api` (e.g., `https://popcom-api.onrender.com/api`)
6. Deploy!


| Layer     | Technology       | Why                                              |
|-----------|-----------------|--------------------------------------------------|
| Frontend  | React 18 + Vite | Fast HMR, modern tooling, component architecture |
| Styling   | Vanilla CSS      | Full design control, no dependency bloat         |
| Routing   | React Router v6  | Declarative routing with role-based guards       |
| Backend   | Express.js       | Lightweight, flexible, large ecosystem           |
| Database  | MongoDB/Mongoose | Schema flexibility, JSON-native, aggregation     |
| Auth      | JWT (Bearer)     | Stateless, horizontally scalable                 |
| Passwords | bcryptjs         | Industry-standard password hashing (10 rounds)   |

## 🏗️ Architecture

```
Client (React + Vite)
  ├── AuthContext (JWT persistence)
  ├── Protected Routes (role guards)
  ├── Brand Dashboard → Products, Applications, Analytics
  ├── Creator Dashboard → Products, Links, Wallet, Payouts
  ├── Admin Dashboard → Metrics, Payouts, Brands, Creators
  └── Public Product Page → Click tracking, Purchase simulation

Server (Express.js)
  ├── Auth Middleware (JWT verify + role authorization)
  ├── Routes: auth, products, applications, referrals, tracking, wallet, payouts, admin, brand
  ├── Models: User, Product, Application, ReferralLink, Click, Conversion, Wallet, PayoutRequest, LedgerEntry
  └── MongoDB (Mongoose ODM)
```

## 📊 Database Schema Overview

### Users — `name, email, password (hashed), role (brand/creator/admin)`
### Products — `name, price, commissionPercent, brand (ref User), isActive`
### Applications — `creator (ref), product (ref), status (pending/approved/rejected)` — Unique index on (creator, product)
### ReferralLinks — `creator (ref), product (ref), code (unique)` — Only created after approval
### Clicks — `referralLink (ref), ipHash, clickedAt` — IP hash for dedup, never stores raw IP
### Conversions — `referralLink (ref), product (ref), creator (ref), commissionAmount, productPrice`
### Wallets — `creator (ref, unique), totalEarnings, pendingEarnings, availableBalance`
### PayoutRequests — `creator (ref), amount, status (pending/approved/paid/rejected), idempotencyKey (unique)`
### LedgerEntries — `creator (ref), amount, type, status, referenceId, description` — Append-only

## 🔐 Role Logic

- **Brand**: Can create products, view applications, approve/reject creators, see analytics
- **Creator**: Can browse products, apply to promote, generate referral links (only after approval), view wallet/payouts
- **Admin**: Can view all platform metrics, manage all payout requests (approve/reject/mark paid), view all brands and creators

Routes are protected by two middleware layers:
1. `protect` — Verifies JWT token, attaches user to request
2. `authorize(...roles)` — Checks if user's role is in the allowed list

## 💰 How Double Payout is Prevented

Three server-side guards run **before** any payout is created:

1. **Pending check**: Query `PayoutRequest` for existing `status: 'pending'` by this creator → reject if found
2. **Balance check**: Compare `requestedAmount` against `wallet.availableBalance` → reject if insufficient
3. **Minimum threshold**: Enforce `₹500` minimum at both schema and route level

On payout creation:
- `wallet.availableBalance -= amount`
- `wallet.pendingEarnings += amount`
- A `LedgerEntry` with type `payout_request` is created

On admin approval → paid:
- `wallet.pendingEarnings -= amount`
- A `LedgerEntry` with type `payout_paid` is created

On admin rejection:
- `wallet.availableBalance += amount` (money returned)
- `wallet.pendingEarnings -= amount`
- A `LedgerEntry` with type `payout_rejected` is created

Each `PayoutRequest` has a unique `idempotencyKey` to prevent duplicate submissions even from network retries.

## 📈 Scaling Approach (1M clicks/day)

At 1M clicks/day (~11.6 clicks/sec), the current architecture needs optimization:

1. **Click dedup**: Replace in-memory Map with **Redis** (TTL keys, O(1) lookup)
2. **Async click writes**: Push click events to a **message queue** (Aws SQS). A background worker drains the queue and batch-inserts into MongoDB
3. **Read replicas**: Serve analytics/dashboard queries from MongoDB secondaries
4. **Connection pooling**: Mongoose connection pool tuned for concurrency
5. **CDN**: Serve static frontend from CDN (Vercel already does this)
6. **Rate limiting**: Per-IP rate limiting on click endpoint to prevent abuse
7. **Database indexing**: Compound indexes on high-query collections (already implemented on Click, Application)

## 🔮 Improvements if Given More Time

- **Redis** for click deduplication instead of in-memory Map
- **WebSocket** for real-time dashboard updates
- **Stripe/Razorpay** integration for real payment processing
- **Email notifications** on application status changes and payout updates
- **File uploads** for product images
- **Rate limiting** middleware (express-rate-limit)
- **CI/CD pipeline** with GitHub Actions
- **Swagger/OpenAPI** documentation
- **Activity log** for admin audit trail
- **Cron jobs** to expire stale pending orders (for production payment flow)
- **MongoDB transactions** for true atomicity on wallet updates
