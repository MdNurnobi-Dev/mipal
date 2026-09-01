# Architectural Forensic Audit & Engineering Report

## Executive Summary
This document provides a technical forensic audit of the **MicroJob Pro** platform, examining component topology, state synchronization protocols, data schema models, and edge runtime capabilities.

---

## 1. Architectural Topology

MicroJob Pro is structured as a **Single Page Application (SPA)** with mobile-first responsive scaling and edge-serverless extensions:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
│                                                                        │
│  ┌─────────────────────────┐             ┌──────────────────────────┐  │
│  │   User App Interface    │             │   Admin Control Portal   │  │
│  │   (Layout / Bottom Nav) │             │   (AdminLayout / Sidebar)│  │
│  └────────────┬────────────┘             └────────────┬─────────────┘  │
│               │                                       │                │
│               └───────────────────┬───────────────────┘                │
│                                   ▼                                    │
│                     ┌───────────────────────────┐                      │
│                     │  AppContext State Engine  │                      │
│                     │  - React 19 Context       │                      │
│                     │  - Action Reducers        │                      │
│                     │  - Notification Bus       │                      │
│                     └─────────────┬─────────────┘                      │
│                                   │                                    │
│                                   ▼                                    │
│                     ┌───────────────────────────┐                      │
│                     │ Browser Persistence Store │                      │
│                     │ (localStorage Auto-Sync)  │                      │
│                     └───────────────────────────┘                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ Edge Function Support
                     ┌─────────────────────────────┐
                     │  Cloudflare Pages Function  │
                     │  /functions/api/health.ts   │
                     └─────────────────────────────┘
```

---

## 2. Global State & Persistence Engine (`AppContext.tsx`)

The application's core state is governed by `AppContext.tsx`, which serves as a centralized state container and action dispatcher.

### 2.1 State Storage Keys
All critical entities are synchronized to `window.localStorage` with real-time JSON hydration and fallback safety:

| Key | Type | Description |
|---|---|---|
| `app_tasks` | `Task[]` | Microjobs, quiz questions, reward amounts, and time limits. |
| `app_users` | `User[]` | Registered users, account balances, avatar URLs, and plan metadata. |
| `app_current_user` | `User` | Active authenticated session state. |
| `app_plans` | `Plan[]` | Active investment tiers, daily earning caps, and duration parameters. |
| `app_transactions` | `Transaction[]` | Ledger entries for deposits, withdrawals, plan buys, and referral bonuses. |
| `app_posts` | `Post[]` | Community feed items, comment threads, and like counters. |
| `app_gateways` | `Gateway[]` | Active and inactive deposit/payout gateway configurations. |
| `app_notifications` | `Notification[]` | User-targeted and broadcast notification logs. |
| `app_daily_reward_settings` | `DailyRewardSettings` | Streak bonus multipliers and check-in reward ceilings. |
| `app_referral_settings` | `ReferralSettings` | Granular referrer reward ($) and referee bonus ($) settings. |
| `app_giveaway_banners` | `GiveawayBanner[]` | Promotional carousel items. |
| `app_site_settings` | `SiteSettings` | Site name, logo, favicon, and brand theme colors. |

---

## 3. Data Schema & Type Specifications (`src/types.ts`)

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  balance: number;
  avatar?: string;
  referralCode: string;
  referredBy?: string;
  activePlanId?: string;
  planExpiryDate?: string;
  dailyEarned: number;
  lastEarnedDate: string;
  currentStreak?: number;
  lastDailyRewardClaimDate?: string;
  isBanned?: boolean;
  twoFactorEnabled?: boolean;
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    promotions?: boolean;
  };
}

export interface Task {
  id: string;
  title: string;
  category: 'Quiz' | 'App Install' | 'Video' | 'Survey' | 'Social' | 'Link';
  reward: number;
  durationSeconds?: number;
  question?: string;
  options?: string[];
  correctAnswer?: number;
  url?: string;
  isCompleted?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdraw' | 'plan_purchase' | 'task_earning' | 'referral_bonus' | 'signup_bonus' | 'daily_reward';
  amount: number;
  method: string;
  txId?: string;
  proofImg?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  userDetails?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  dailyEarningLimit: number;
  durationDays: number;
  features?: string[];
}
```

---

## 4. Routing Topology & Security Boundary

### Public & User Routes (`/`)
Wrapped inside `<Layout>`, offering mobile navigation, drawer menu, dynamic brand colors, and status indicators:
- `/` - Community Home Feed & Quick Action Grid
- `/earnings` - Interactive Microtasks & Quiz Solver
- `/plan` - Investment Subscription Tiers
- `/wallet` - Balance Overview & Transaction Records
- `/deposit` - Deposit Slip Submission
- `/withdraw` - Withdrawal Payout Form
- `/refer` - Split Referral Program Dashboard
- `/profile` - Profile Personalization & Avatar Editor
- `/settings` - Security, 2FA, Language & Theme Control
- `/help` - Knowledge Base & Live Support Links
- `/notifications` - Alert Center
- `/auth` - Authentication & Registration

### Protected Admin Routes (`/admin/*`)
Wrapped inside `<AdminLayout>`, offering desktop/tablet sidebar navigation, notification bell, and quick stats:
- `/admin/login` - Admin Login Gate
- `/admin` - Analytics Dashboard
- `/admin/users` - User List & Balance Editor
- `/admin/referrals` - Referral Reward Engine Configurator
- `/admin/tasks` - Microtask Builder
- `/admin/plans` - Investment Tier CRUD
- `/admin/transactions` - Unified Transaction Log
- `/admin/payments/gateways` - Gateway Config
- `/admin/payments/deposits/*` - Deposit Slip Approvals
- `/admin/payments/withdraws/*` - Withdrawal Approvals
- `/admin/marketing/giveaway` - Banner Manager
- `/admin/marketing/daily-rewards` - Streak Rewards Config
- `/admin/posts` - Social Feed Moderation
- `/admin/branding` - Site Name, Logo & Color Theme Customizer
- `/admin/settings` - General Settings & Notifications

---

## 5. Security & Data Integrity Audit

1. **Client-Side Sanitization**: Image uploads in `AvatarEditModal` and deposit slips are validated for MIME type (`image/*`) and size prior to base64 encoding.
2. **Transaction Atomicity**: Balance deductions on plan purchases and balance credits on deposit approvals are handled in single immutable updates to prevent state race conditions.
3. **Daily Earning Caps**: When executing `completeTask(amount, title)`, the engine validates current `dailyEarned` against the user's active plan limit before crediting funds.
4. **Referral Integrity**: Self-referrals and circular codes are caught during user registration, crediting only valid referee/referrer pairs.
