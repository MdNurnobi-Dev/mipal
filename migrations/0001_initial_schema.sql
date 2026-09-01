-- Cloudflare D1 Database Schema for MicroJob Pro
-- Migration: 0001_initial_schema.sql

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    bio TEXT,
    avatar TEXT,
    password_hash TEXT,
    two_factor_enabled INTEGER DEFAULT 0,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'light',
    balance REAL DEFAULT 0.0,
    referral_code TEXT UNIQUE,
    active_plan_id TEXT,
    daily_earned REAL DEFAULT 0.0,
    last_earned_date TEXT,
    notifications_json TEXT,
    check_in_streak INTEGER DEFAULT 0,
    last_check_in_date TEXT,
    referred_by TEXT,
    referral_earnings REAL DEFAULT 0.0,
    status TEXT DEFAULT 'active',
    joined TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    reward REAL NOT NULL DEFAULT 0.0,
    task_limit TEXT DEFAULT 'Daily 1 time',
    status TEXT DEFAULT 'Active',
    description TEXT,
    action_url TEXT,
    action_urls_json TEXT,
    duration INTEGER DEFAULT 30,
    quiz_data_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Task Completions Log (Anti-Cheat & Limit Enforcer)
CREATE TABLE IF NOT EXISTS task_completions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    reward REAL NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 4. Transactions Table (Deposits, Withdrawals, Earnings, Referrals)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'deposit' | 'withdraw' | 'plan_purchase' | 'task_earning' | 'referral_bonus' | 'signup_bonus' | 'daily_reward'
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    tx_id TEXT,
    proof_img TEXT, -- R2 Object Key or URL
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    user_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Investment & Membership Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    daily_earning_limit REAL NOT NULL,
    duration_days INTEGER NOT NULL,
    features_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Social Feed Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    status TEXT DEFAULT 'approved',
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Post Comments Table
CREATE TABLE IF NOT EXISTS post_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Post Likes Table (Prevents multiple likes per user)
CREATE TABLE IF NOT EXISTS post_likes (
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(post_id, user_id),
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Payment Gateways Table
CREATE TABLE IF NOT EXISTS gateways (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    details TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    date TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Promotional Giveaway Banners Table
CREATE TABLE IF NOT EXISTS giveaway_banners (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL, -- R2 or Public URL
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. App Settings Key-Value Store (Branding, Referral, Daily Reward Settings)
CREATE TABLE IF NOT EXISTS app_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_task ON task_completions(user_id, task_id);

-- SEED INITIAL DATA

-- Default Investment Plans
INSERT OR IGNORE INTO plans (id, name, price, daily_earning_limit, duration_days, features_json) VALUES
('plan_starter', 'Starter Plan', 10.0, 1.5, 30, '["Daily 5 Tasks", "Standard Earning Speed", "Email Support", "24h Payout Processing"]'),
('plan_pro', 'Pro Earner', 25.0, 4.0, 45, '["Daily 15 Tasks", "2x Earning Speed", "Priority Payouts (6h)", "Split Referral Bonus +5%"]'),
('plan_vip', 'VIP Investor', 50.0, 9.0, 60, '["Unlimited Daily Tasks", "3x Earning Speed", "Instant 1h Payouts", "Dedicated Telegram Manager", "Free Giveaway Passes"]'),
('plan_diamond', 'Diamond Elite', 100.0, 20.0, 90, '["Maximum Daily Limits", "VIP Cashback 10%", "Instant Automated Payouts", "Dedicated Account Executive"]');

-- Default Payment Gateways
INSERT OR IGNORE INTO gateways (id, name, details, is_active) VALUES
('gw_bkash', 'bKash Personal', 'Send Money to: 01700000000 (Personal). Use your User ID as reference.', 1),
('gw_nagad', 'Nagad Personal', 'Send Money to: 01800000000 (Personal). Enter TrxID below.', 1),
('gw_usdt', 'USDT (TRC20)', 'Deposit address: TXYZ9999999999999999999999999999. Network: Tron (TRC20). Upload TXID and hash.', 1),
('gw_paypal', 'PayPal / International', 'Send payment to: payments@microjobpro.com. Send as Goods/Services or Friends & Family.', 1),
('gw_bank', 'Bank Transfer', 'Bank Name: City Bank Ltd | Account Name: MicroJob Pro Ltd | Account No: 1234567890 | Branch: Gulshan', 1);

-- Default Referral Settings
INSERT OR IGNORE INTO app_settings (setting_key, setting_value) VALUES
('referral_settings', '{"referrerBonusAmount":1.0,"newUserBonusAmount":0.5,"depositBonusPercent":5.0,"taskEarningBonusPercentByPlan":{"plan_starter":2,"plan_pro":5,"plan_vip":10,"plan_diamond":15},"signupBonusAmount":0.5}'),
('daily_reward_settings', '{"isActive":true,"baseAmount":0.05,"streakBonus":0.02,"maxStreak":7}'),
('site_settings', '{"siteName":"MicroJob Pro","siteDescription":"Earn real rewards and invest smartly through daily microtasks.","logoUrl":"","faviconUrl":"","supportEmail":"support@microjobpro.com","supportPhone":"+880 1800-000000","facebookUrl":"https://facebook.com","telegramUrl":"https://t.me/microjobpro","whatsappUrl":"https://wa.me/8801800000000","primaryColor":"#4f46e5"}');
