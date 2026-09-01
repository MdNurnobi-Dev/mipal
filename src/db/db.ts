import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

import * as schema from './schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

/**
 * Ensures high-performance database indexes exist on high-frequency tables:
 * - users (balance, email, referral_code, referred_by, status, role, last_check_in_date)
 * - tasks (status, type, reward)
 * - transactions (user_id, status, type, date)
 * - posts, post_comments, notifications
 */
export async function ensureDatabaseIndexes() {
  const schemaUpdates = [
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS action_url text;`,
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS action_urls json;`,
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS duration integer;`,
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS quiz_data json;`,
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS limit_text text;`,
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description text;`,
  ];

  try {
    for (const stmt of schemaUpdates) {
      await pool.query(stmt).catch(() => {});
    }
  } catch (err: any) {
    console.warn("[DB Schema] Schema update notice:", err?.message);
  }

  const queries = [
    // Users Table (User Balances, Auth, Referrals)
    `CREATE INDEX IF NOT EXISTS users_balance_idx ON users(balance);`,
    `CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);`,
    `CREATE INDEX IF NOT EXISTS users_referral_code_idx ON users(referral_code);`,
    `CREATE INDEX IF NOT EXISTS users_referred_by_idx ON users(referred_by);`,
    `CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);`,
    `CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);`,
    `CREATE INDEX IF NOT EXISTS users_last_check_in_idx ON users(last_check_in_date);`,

    // Tasks Table (Task Feeds, Active Tasks, Rewards)
    `CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);`,
    `CREATE INDEX IF NOT EXISTS tasks_type_idx ON tasks(type);`,
    `CREATE INDEX IF NOT EXISTS tasks_reward_idx ON tasks(reward);`,

    // Transactions Table (Financial Ledgers, User Balances & Histories)
    `CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);`,
    `CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);`,
    `CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);`,
    `CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);`,

    // Feed, Comments & Notification Tables
    `CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);`,
    `CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);`,
    `CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at);`,
    `CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON post_comments(post_id);`,
    `CREATE INDEX IF NOT EXISTS post_comments_user_id_idx ON post_comments(user_id);`,
    `CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);`,
    `CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);`,
  ];

  try {
    for (const q of queries) {
      await pool.query(q).catch((e: any) => {
        console.warn(`[DB Indexing] Notice for query "${q}":`, e.message);
      });
    }
    console.info(`[DB Indexing] Successfully verified / created indexes for high-frequency tables (users, tasks, transactions).`);
  } catch (err: any) {
    console.error(`[DB Indexing] Index initialization error:`, err);
  }
}
