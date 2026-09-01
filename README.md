# MicroJob Pro (Earnify) - Mobile-First Microtask & Investment Platform

[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **MicroJob Pro** is a modern, responsive, mobile-first microtask, daily rewards, and tiered investment platform. Built with a responsive design philosophy, it features a complete user earning suite and a feature-rich admin control portal with real-time financial moderation, task building, and dynamic branding.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
  - [User Application](#user-application)
  - [Admin Management Portal](#admin-management-portal)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [Core Workflows & Mechanics](#-core-workflows--mechanics)
  - [Task & Quiz Earning System](#1-task--quiz-earning-system)
  - [Split Referral Reward Engine](#2-split-referral-reward-engine)
  - [Deposit & Withdrawal Verification](#3-deposit--withdrawal-verification)
  - [Profile Photo & Personalization](#4-profile-photo--personalization)
- [Available Documentation](#-available-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Key Features

### User Application

1. **Dynamic Community Feed (`/`)**:
   - Public social posts, announcements, and payment proof showcases.
   - Like, comment, and share capabilities with live counts.
   - Daily Check-In streak widget with instant reward claiming.
   - Promotional giveaway carousel banners.

2. **MicroTask & Quiz Hub (`/earnings`)**:
   - Interactive multi-category tasks: Quizzes with countdown timer, App Installations, YouTube video tasks, Surveys, and Link clicks.
   - Automated answer verification and reward settlement into wallet balance.
   - Plan-based daily earning limit enforcement.

3. **Investment Plans (`/plan`)**:
   - Tiered membership plans (e.g., Starter, Pro, VIP).
   - Real-time plan purchasing with wallet balance validation.
   - Plan duration and higher daily earning caps.

4. **Digital Wallet & Payment Hub (`/wallet`, `/deposit`, `/withdraw`)**:
   - Real-time balance and withdrawal history tracking.
   - **Deposit**: Multi-gateway manual deposit submission with Transaction ID (TrxID), receipt upload, and gateway instructions.
   - **Withdraw**: Flexible payout method selection, minimum withdrawal thresholds, and pending transaction tracking.

5. **Split Referral Program (`/refer`)**:
   - Dedicated referral link generator (`?ref=CODE`) and single-click clipboard copy.
   - Native Web Share API integration for seamless mobile sharing.
   - Dual-reward mechanism: Distinct **Referrer Reward** ($) and **New User Welcome Bonus** ($).
   - Real-time referral earnings counter.

6. **Comprehensive Profile & Photo Customization (`/profile`)**:
   - Multi-option **Avatar Edit Modal**: Upload local files (PNG/JPG/WEBP/GIF), choose from 16+ curated avatars, generate random avatars, or paste direct image links.
   - Inline profile editor for Name, Email, Phone, and Bio.
   - Direct password updates with client-side validation.

7. **User Settings & Security (`/settings`)**:
   - **Language Selection**: English, Bengali (বাংলা), Hindi (हिन्दी), Arabic (العربية), and Spanish (Español).
   - **Theme Engine**: Seamless Light and Dark mode switching.
   - **Two-Factor Authentication (2FA)**: Authenticator setup secret key, QR mock preview, and 6-digit code activation.
   - **Notification Toggles**: Push, Email, and Promotional alerts.
   - **Help Center (`/help`)**: Interactive accordion FAQ, direct WhatsApp/Email support, and onboarding guide.

---

### Admin Management Portal

Access via `/admin` (Secure login at `/admin/login`):

- **Executive Analytics Dashboard (`/admin`)**: Total user count, active subscriptions, total deposits, total payouts, pending verification queue, and platform revenue.
- **User Moderation (`/admin/users`)**: Search, filter by active/banned status, manual balance adjustment, account suspension/reactivation.
- **Split Referral Engine Config (`/admin/referrals`)**: Configure custom dollar rewards for referrers vs. new signups, percentage commission on deposits, and tiered task earnings bonus. Includes live distribution preview.
- **Task & Job Creator (`/admin/tasks`)**: Dynamic task builder with validation parameters (Timer duration, multiple-choice quiz questions, correct answer selection, custom payout reward).
- **Plan Subscriptions Manager (`/admin/plans`)**: Create, edit, and delete investment tiers, adjust price, duration, and daily limits.
- **Financial Moderation Queue (`/admin/transactions`, `/admin/payments/*`)**:
  - Review pending deposit and withdrawal slips with transaction proof inspection.
  - Approve or reject transactions with one click, automatically updating user balances and dispatching system notifications.
  - Payment Gateways Manager: Enable/disable manual payment methods (bKash, Nagad, USDT, PayPal, Bank Transfer).
- **Giveaways & Daily Rewards (`/admin/marketing/*`)**: Upload promotional banners, configure daily check-in base amounts, streak multipliers, and max streak limits.
- **Community Post Moderation (`/admin/posts`)**: Approve, reject, or delete user-submitted posts.
- **Branding & Site Customization (`/admin/branding`, `/admin/settings`)**: Dynamic site name, logo URL, favicon URL, primary brand color, and official support contacts (Email, Phone, WhatsApp, Telegram, Facebook).

---

## 🏗 System Architecture

```
                               ┌─────────────────────────────┐
                               │   MicroJob Pro Client App   │
                               │  (React 19 + TypeScript)    │
                               └──────────────┬──────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
     ┌────────────────────────────┐                       ┌────────────────────────────┐
     │   User Application Routes  │                       │   Admin Management Portal  │
     │  - Home, Feed, Check-in    │                       │  - Dashboard & Analytics   │
     │  - Tasks, Quizzes, Earning │                       │  - User Moderation         │
     │  - Plans, Wallet, Pay      │                       │  - Task & Plan Builder     │
     │  - Refer, Profile, Settings│                       │  - Financial Transaction Tx│
     └──────────────┬─────────────┘                       │  - Referral & Branding Cfg │
                    │                                     └─────────────┬──────────────┘
                    └─────────────────────────┬─────────────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │  Reactive Central AppContext    │
                             │  - State Synchronization        │
                             │  - Business Rules Validation    │
                             │  - Notification Dispatcher      │
                             └────────────────┬────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │  Browser Persistence Layer      │
                             │  (Local Storage + Memory Hydr)  │
                             └─────────────────────────────────┘
```

---

## 💻 Technology Stack

| Domain | Technology | Version / Specification |
|---|---|---|
| **Core Framework** | React | `^19.0.1` |
| **Language** | TypeScript | `~5.8.2` |
| **Build Tooling** | Vite | `^6.2.3` |
| **Routing** | React Router DOM | `^7.18.3` |
| **Styling** | Tailwind CSS | `^4.1.14` |
| **Icons** | Lucide React | `^0.546.0` |
| **Animations** | Motion (Framer Motion) | `^12.23.24` |
| **Class Utilities** | `clsx`, `tailwind-merge` | Standard |
| **Cloud/Edge Ready** | Cloudflare Pages Functions | `/functions/api/health.ts` |

---

## 📁 Project Directory Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore specifications
├── ARCHITECTURE.md           # Deep-dive forensic architectural report
├── ADMIN_GUIDE.md            # Operational manual for administrator portal
├── CONTRIBUTING.md           # Contribution guidelines & code standards
├── SECURITY.md               # Security policy and data safety guidelines
├── LICENSE                   # MIT License
├── index.html                # HTML5 entry point with responsive viewport
├── package.json              # NPM dependencies and build scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite & Tailwind CSS configuration
├── wrangler.toml             # Cloudflare deployment manifest
│
├── functions/                # Edge serverless functions
│   └── api/
│       └── health.ts         # Cloudflare Pages health check endpoint
│
├── public/                   # Static assets, icons, manifest
│   ├── favicon.ico
│   ├── icon-192.png
│   └── manifest.json
│
└── src/
    ├── main.tsx              # Application DOM mounting
    ├── App.tsx               # Root router and global branding coordinator
    ├── index.css             # Tailwind CSS v4 entry point
    ├── types.ts              # Unified TypeScript definitions and interfaces
    ├── data.ts               # Initial seeded mock data for users and plans
    │
    ├── components/           # Shared modular UI components
    │   ├── Layout.tsx        # Mobile-first user layout with bottom navigation & drawer
    │   ├── AdminLayout.tsx   # Enterprise admin sidebar layout
    │   ├── AvatarEditModal.tsx # Multi-option avatar selector and image uploader
    │   ├── FaqSection.tsx    # Accordion FAQ component
    │   └── OnboardingTutorial.tsx # Interactive user walkthrough guide
    │
    ├── context/
    │   └── AppContext.tsx    # Global reactive state provider & storage synchronization
    │
    ├── lib/
    │   └── utils.ts          # Class merging utility (`cn`)
    │
    └── pages/                # Application Page Views
        ├── Home.tsx          # Community feed, daily check-in & quick actions
        ├── Earnings.tsx      # Interactive task list, quiz solver & rewards
        ├── Plan.tsx          # Subscription investment plans
        ├── Wallet.tsx        # Balance overview and transaction history
        ├── Deposit.tsx       # Manual deposit submission flow
        ├── Withdraw.tsx      # Withdrawal request flow
        ├── Refer.tsx         # Split referral reward dashboard
        ├── Profile.tsx       # Profile details, photo edit & stats
        ├── UserSettings.tsx  # Theme, language, 2FA & notification controls
        ├── HelpCenter.tsx    # Support hub and FAQ
        ├── Notifications.tsx # User notification center
        ├── Auth.tsx          # Login & Registration with auto-referral detection
        │
        └── admin/            # Administrator Views
            ├── AdminLogin.tsx             # Admin authentication screen
            ├── AdminDashboard.tsx         # Financial overview & KPIs
            ├── AdminUsers.tsx             # User list and balance editor
            ├── AdminReferrals.tsx         # Split referral reward manager
            ├── AdminTasks.tsx             # Task & quiz builder
            ├── AdminPlans.tsx             # Investment tier manager
            ├── AdminTransactions.tsx     # Unified transaction queue
            ├── AdminPosts.tsx            # Community post moderation
            ├── AdminGiveaway.tsx         # Promotional banner manager
            ├── AdminDailyReward.tsx      # Daily check-in streak config
            ├── AdminBranding.tsx         # Site name, logo & color themes
            ├── AdminSettings.tsx         # General site settings
            ├── AdminNotificationSettings.tsx # Notification broadcast system
            └── payment/
                ├── AdminGateways.tsx     # Payment methods manager
                ├── AdminDeposits.tsx     # Deposit slip verification
                └── AdminWithdraws.tsx    # Withdrawal approval queue
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version `18.0.0` or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/microjob-pro.git
   cd microjob-pro
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

### Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

```env
# Optional Gemini AI API Key for generative integrations
GEMINI_API_KEY=""

# Application Host URL
APP_URL="http://localhost:3000"
```

### Running the Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Building for Production

Compile the TypeScript files and generate production static assets:

```bash
npm run build
```

The production bundle will be output to the `dist/` directory.

---

## ⚙ Core Workflows & Mechanics

### 1. Task & Quiz Earning System
- Users access tasks with specified rewards, time limits, and categories.
- For quizzes, users answer within the timer; correct answers credit the user's balance and log a `task_earning` transaction.
- Daily earnings are bounded by the user's active subscription tier limit.

### 2. Split Referral Reward Engine
- Admins configure distinct reward values:
  - `referrerBonusAmount` ($): Awarded to the inviting user upon referee registration.
  - `newUserBonusAmount` ($): Awarded to the new user immediately upon sign-up with a valid referral link/code.
- When registering via `/auth?ref=CODE`, the platform validates the code, registers both transactions, and credits balances automatically.

### 3. Deposit & Withdrawal Verification
- Users submit deposits with transaction IDs and proof receipts.
- Requests appear in the Admin Moderation Queue (`/admin/payments/deposits/pending`).
- On approval, the deposit amount is automatically credited to the user's wallet with an instant confirmation notification.

### 4. Profile Photo & Personalization
- Users can update their avatar using the modal:
  1. Direct local file upload (with automatic client-side Base64 conversion).
  2. One of 16+ curated avatars.
  3. DiceBear SVG avatar generator with randomized seeds.
  4. External image URL.
- The avatar updates instantly across all views (navigation header, sidebar drawer, feed posts, and comments).

---

## 📚 Available Documentation

- **[CLOUDFLARE_D1_R2_GUIDE.md](./CLOUDFLARE_D1_R2_GUIDE.md)**: Complete guide for Cloudflare D1 Database, R2 Object Storage, and Pages Functions deployment.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Forensic breakdown of data flow, state management, and schema design.
- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**: Step-by-step administrator operations manual.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Guidelines for contributing code and reporting issues.
- **[SECURITY.md](./SECURITY.md)**: Security practices and vulnerability disclosure policy.

---

## 🤝 Contributing

Contributions are welcome! Please review [CONTRIBUTING.md](./CONTRIBUTING.md) for details on code formatting, branch naming, and pull request submissions.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
