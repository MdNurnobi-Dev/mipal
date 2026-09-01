# MicroJob Pro - Administrator Operations Manual

Welcome to the **MicroJob Pro** Administrator Guide. This manual details the configuration, verification, and management workflows for the admin portal.

---

## 1. Accessing the Admin Portal

- **URL**: Navigate to `/admin/login` or click the **Admin Portal** link in the mobile drawer.
- **Default Credentials**: Provided during initial deployment or configurable in admin settings.
- **Root Admin URL**: `/admin`

---

## 2. Managing Financial Transactions

### 2.1 Deposit Verification Workflow
1. Navigate to **Payment > Pending Deposits** (`/admin/payments/deposits/pending`).
2. Review the user details, amount, payment method (e.g., bKash, Nagad, USDT, Bank), and the user-provided **Transaction ID (TrxID)**.
3. Click the receipt image icon to view the uploaded deposit screenshot proof.
4. **Approval**:
   - Click **Approve**.
   - The user's account balance is immediately credited by the deposit amount.
   - An automated system notification is dispatched to the user.
5. **Rejection**:
   - Click **Reject** if the transaction ID or screenshot is invalid.
   - The transaction status updates to `rejected` without altering user balances.

### 2.2 Withdrawal Payout Workflow
1. Navigate to **Payment > Pending Withdrawals** (`/admin/payments/withdraws/pending`).
2. Review the user's requested amount, selected withdrawal gateway, and destination account number.
3. Process the payout externally via your payment gateway provider.
4. Once completed, click **Approve** to mark the transaction as resolved.
5. If the request is invalid, click **Reject** to refund the requested amount back to the user's wallet.

### 2.3 Configuring Payment Gateways
1. Navigate to **Payment > Gateways** (`/admin/payments/gateways`).
2. Click **Add Gateway** to register a new payment method.
3. Set the Gateway Name, instructions (e.g., wallet numbers, USDT TRC20 address), and toggle **Active** status.

---

## 3. Referral Engine Configuration

MicroJob Pro features a separated **Split Referral Reward System**:

1. Navigate to **Referrals** (`/admin/referrals`).
2. Configure the following reward parameters:
   - **Referrer Reward Amount ($)**: Fixed bonus awarded to the inviting user when a referee registers.
   - **New User Welcome Bonus ($)**: Instant cash bonus credited to the newly registered referee.
   - **Deposit Commission (%)**: Percentage of referee deposits paid out to the referrer.
   - **Task Earning Bonus (%)**: Tiered commission based on the active plan of the referrer.
3. Review the **Live Reward Distribution Preview** widget at the bottom of the page to verify economics before saving.

---

## 4. MicroJob & Quiz Creation

1. Navigate to **Tasks** (`/admin/tasks`).
2. Click **Create New Task**.
3. Fill out task properties:
   - **Title**: Clear name of the task.
   - **Category**: `Quiz`, `App Install`, `Video`, `Survey`, `Social`, or `Link`.
   - **Reward ($)**: Amount credited to user upon successful completion.
   - **Timer (Seconds)**: Countdown duration required before completion.
4. For **Quiz** tasks:
   - Input the **Question Text**.
   - Add multiple-choice options (Options 1–4).
   - Select the **Correct Option Index**.
5. Save the task. It will immediately appear on all user devices in `/earnings`.

---

## 5. Investment Plan Management

1. Navigate to **Plans** (`/admin/plans`).
2. Click **Add Plan** or edit existing tiers:
   - **Plan Name** (e.g., Starter, Pro, VIP, Platinum).
   - **Price ($)**: Required upfront investment.
   - **Daily Earning Limit ($)**: Maximum task earnings allowed per 24 hours.
   - **Duration (Days)**: Plan validity period (e.g., 30 days, 60 days).
   - **Features**: Highlight bullets displayed on the subscription card.

---

## 6. Daily Rewards & Marketing Banners

### 6.1 Daily Check-In Streak Configuration
1. Navigate to **Marketing > Daily Rewards** (`/admin/marketing/daily-rewards`).
2. Set:
   - **Base Amount ($)**: Day 1 check-in reward.
   - **Streak Bonus ($)**: Additional daily increment for consecutive logins.
   - **Max Streak Cap (Days)**: Maximum streak limit (e.g., 7 days).

### 6.2 Promotional Giveaways
1. Navigate to **Marketing > Giveaways** (`/admin/marketing/giveaway`).
2. Upload banner image URLs or local files.
3. Toggle banner visibility on/off to control what appears on the user homepage carousel.

---

## 7. Site Branding & Customization

1. Navigate to **Branding** (`/admin/branding`).
2. Update:
   - **Site Name**: Changes browser titles, header labels, and notification headers.
   - **Logo & Favicon URLs**: Modifies header icon and browser tab favicon.
   - **Primary Brand Color**: Alters accent colors across the user interface.
   - **Support Handles**: WhatsApp number, Telegram handle, Facebook group URL, and official support email.
