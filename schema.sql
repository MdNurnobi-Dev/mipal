-- Cloudflare D1 Database Schema for MicroJob Pro
-- Single consolidated schema file

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

-- 3. User Task Completions Log
CREATE TABLE IF NOT EXISTS task_completions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    reward REAL NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    tx_id TEXT,
    proof_img TEXT,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    user_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    daily_earning_limit REAL NOT NULL,
    duration_days INTEGER NOT NULL,
    features_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Posts Table
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

-- 8. Post Likes Table
CREATE TABLE IF NOT EXISTS post_likes (
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(post_id, user_id),
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Gateways Table
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

-- 11. Giveaway Banners Table
CREATE TABLE IF NOT EXISTS giveaway_banners (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. App Settings Key-Value Store
CREATE TABLE IF NOT EXISTS app_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_task ON task_completions(user_id, task_id);
