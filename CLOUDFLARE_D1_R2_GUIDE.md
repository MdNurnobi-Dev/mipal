# Cloudflare D1 & R2 Backend & Database Architecture Guide

This comprehensive guide details the **Cloudflare D1 (Serverless SQLite SQL)**, **Cloudflare R2 (High-Performance S3-Compatible Storage)**, and **Cloudflare Workers / Pages Functions** integration built for **MicroJob Pro**.

---

## 🏛 1. Architecture Overview

```
                                  ┌───────────────────────────┐
                                  │   MicroJob Pro Frontend   │
                                  │  (React 19 + TypeScript)  │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │ Cloudflare Edge Functions │
                                  │     (/functions/api/*)    │
                                  └──────┬─────────────┬──────┘
                                         │             │
                    ┌────────────────────┴───┐     ┌───┴────────────────────┐
                    ▼                        ▼     ▼                        ▼
       ┌─────────────────────────┐                   ┌─────────────────────────┐
       │   Cloudflare D1 (SQL)   │                   │   Cloudflare R2 Bucket  │
       │     (Binding: DB)       │                   │    (Binding: BUCKET)    │
       │                         │                   │                         │
       │ - users & balances      │                   │ - User Avatar Photos    │
       │ - tasks & quizzes       │                   │ - Deposit Slips / TrxID │
       │ - financial ledger (tx) │                   │ - Giveaway Banners      │
       │ - plans & subscriptions │                   │ - Public Media CDN      │
       │ - settings & branding   │                   │                         │
       └─────────────────────────┘                   └─────────────────────────┘
```

---

## 💾 2. Cloudflare D1 Database Specification

### 2.1 Database Schema (`schema.sql` / `migrations/0001_initial_schema.sql`)

| Table Name | Primary Key | Description |
|---|---|---|
| `users` | `id` (TEXT) | Profiles, password hashes, balances, 2FA status, referral codes, active plan IDs, check-in streaks. |
| `tasks` | `id` (TEXT) | Microjob tasks, quiz questions (JSON), duration timers, reward values, and limits. |
| `task_completions` | `id` (TEXT) | Anti-abuse and daily earning verification ledger. |
| `transactions` | `id` (TEXT) | Financial ledger: deposits, withdrawals, plan buys, referral bonuses, and daily rewards. |
| `plans` | `id` (TEXT) | Investment tiers (price, duration days, daily limit, feature bullets). |
| `posts` | `id` (TEXT) | Community feed posts, like counters, and comment counts. |
| `post_comments` | `id` (TEXT) | Comment threads linked to community posts. |
| `post_likes` | `(post_id, user_id)` | Unique user like constraints. |
| `gateways` | `id` (TEXT) | Payment methods (bKash, Nagad, USDT, PayPal, Bank Transfer). |
| `notifications` | `id` (TEXT) | User alerts and broadcast notifications. |
| `giveaway_banners`| `id` (TEXT) | Marketing image banners and active statuses. |
| `app_settings` | `setting_key` | Key-value store for site branding, referral bonus tiers, and daily reward streaks. |

---

## 📦 3. Cloudflare R2 Object Storage Specification

### 3.1 Bucket Layout & Directory Structure

```
microjob-storage/
├── avatars/         # User profile pictures (uploaded via AvatarEditModal)
├── receipts/        # Proof of payment screenshots submitted during deposit
├── banners/         # Promotional giveaway and marketing banners
└── general/         # Miscellaneous site media and logos
```

### 3.2 Upload & Streaming Endpoints

- **Upload (`POST /api/upload`)**:
  - Supports `multipart/form-data` with `file` and `folder` parameters.
  - Supports JSON payload with `{ data: "base64...", folder: "avatars" }`.
  - Automatically calculates MIME type, hashes filename, and puts object into `env.BUCKET`.
  - Returns `{ success: true, url: "/api/media/avatars/17250000_abc.png", key: "avatars/..." }`.

- **Media Streaming (`GET /api/media/*`)**:
  - Located at `/functions/api/media/[[path]].ts`.
  - Fetches objects from Cloudflare R2 bucket with `ETag`, `Content-Type`, and `Cache-Control: public, max-age=31536000, immutable`.

---

## ⚡ 4. Cloudflare Pages Functions API Reference

| Endpoint | HTTP Methods | Description |
|---|---|---|
| `/api/health` | `GET` | Verifies connection to Cloudflare D1 (`DB`) and Cloudflare R2 (`BUCKET`). |
| `/api/users` | `GET, POST, PUT` | User registration with referral bonus logic, profile updates, and balance adjustments. |
| `/api/tasks` | `GET, POST, PUT, DELETE` | CRUD operations for microtasks and multiple-choice quizzes. |
| `/api/tasks/complete` | `POST` | Validates task completion, calculates active plan daily limits, and credits earnings. |
| `/api/transactions` | `GET, POST, PUT` | Submits deposit/withdrawal requests; admin approval/rejection with automated balance sync. |
| `/api/plans` | `GET, POST, PUT, DELETE` | CRUD operations for subscription & investment tiers. |
| `/api/plans/buy` | `POST` | Purchases plan tier with atomic balance validation and deduction. |
| `/api/posts` | `GET, POST` | Community posts, comment threads, and like toggles. |
| `/api/settings` | `GET, POST` | Site branding, referral bonus percentages, daily reward streaks, and gateways. |
| `/api/upload` | `POST` | R2 Object Storage uploader (multipart or base64). |
| `/api/media/*` | `GET` | R2 media streaming handler with caching headers. |
| `/api/sync` | `GET, POST` | 1-click database export or bulk initial state seeder. |

---

## 🚀 5. Deployment Step-by-Step Instructions

### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
# Login to your Cloudflare account
npx wrangler login
```

### Step 2: Create Cloudflare D1 Database
```bash
# 1. Create the database
npx wrangler d1 create microjob-db

# 2. Note the database_id output from the terminal and update wrangler.toml:
# [[d1_databases]]
# binding = "DB"
# database_name = "microjob-db"
# database_id = "<YOUR_D1_DATABASE_ID>"
```

### Step 3: Run Database Migrations
```bash
# Execute initial schema on remote D1 database:
npx wrangler d1 execute microjob-db --remote --file=./migrations/0001_initial_schema.sql
```

### Step 4: Create Cloudflare R2 Storage Bucket
```bash
# 1. Create the production bucket
npx wrangler r2 bucket create microjob-storage

# 2. Create the preview bucket (optional, for local development)
npx wrangler r2 bucket create microjob-storage-preview
```

### Step 5: Build and Deploy to Cloudflare Pages
```bash
# 1. Build the Vite frontend application
npm run build

# 2. Deploy directly via Cloudflare Pages
npx wrangler pages deploy dist --project-name=microjob-pro
```

### Step 6: Verify Deployment & Bindings
1. In your browser or terminal, navigate to:
   ```
   https://<your-project>.pages.dev/api/health
   ```
2. You will receive:
   ```json
   {
     "status": "ok",
     "platform": "Cloudflare Pages & Workers",
     "d1Database": { "binding": "DB", "status": "connected", "tablesCount": 12 },
     "r2Storage": { "binding": "BUCKET", "status": "connected" }
   }
   ```
