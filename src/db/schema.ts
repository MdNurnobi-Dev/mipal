import { pgTable, text, timestamp, boolean, integer, real, json, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  bio: text("bio"),
  avatar: text("avatar"),
  phone: text("phone"),
  password: text("password"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  language: text("language").default("en"),
  theme: text("theme").default("light"),
  balance: real("balance").default(0).notNull(),
  referralCode: text("referral_code"),
  activePlanId: text("active_plan_id"),
  dailyEarned: real("daily_earned").default(0),
  lastEarnedDate: text("last_earned_date"),
  notifications: json("notifications"),
  checkInStreak: integer("check_in_streak").default(0),
  lastCheckInDate: text("last_check_in_date"),
  referredBy: text("referred_by"),
  referralEarnings: real("referral_earnings").default(0),
  status: text("status").default("Active"),
  role: text("role").default("user"),
  joined: text("joined"),
}, (table) => ({
  balanceIdx: index("users_balance_idx").on(table.balance),
  emailIdx: index("users_email_idx").on(table.email),
  referralCodeIdx: index("users_referral_code_idx").on(table.referralCode),
  referredByIdx: index("users_referred_by_idx").on(table.referredBy),
  statusIdx: index("users_status_idx").on(table.status),
  roleIdx: index("users_role_idx").on(table.role),
  lastCheckInIdx: index("users_last_check_in_idx").on(table.lastCheckInDate),
}));

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar"),
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  createdAt: text("created_at").notNull(),
  likedBy: json("liked_by"),
  status: text("status").default("approved"),
}, (table) => ({
  userIdIdx: index("posts_user_id_idx").on(table.userId),
  statusIdx: index("posts_status_idx").on(table.status),
  createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
}));

export const postComments = pgTable("post_comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userAvatar: text("user_avatar"),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => ({
  postIdIdx: index("post_comments_post_id_idx").on(table.postId),
  userIdIdx: index("post_comments_user_id_idx").on(table.userId),
}));

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  dailyEarningLimit: real("daily_earning_limit").notNull(),
  durationDays: integer("duration_days").notNull(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  reward: real("reward").notNull(),
  limit: text("limit_text").notNull(),
  status: text("status").default("Active").notNull(),
  description: text("description"),
  actionUrl: text("action_url"),
  actionUrls: json("action_urls"),
  duration: integer("duration"),
  quizData: json("quiz_data"),
}, (table) => ({
  statusIdx: index("tasks_status_idx").on(table.status),
  typeIdx: index("tasks_type_idx").on(table.type),
  rewardIdx: index("tasks_reward_idx").on(table.reward),
}));

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: json("value").notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  type: text("type").notNull(),
  amount: real("amount").notNull(),
  method: text("method").notNull(),
  date: text("date").notNull(),
  status: text("status").default("pending"),
  userDetails: text("user_details"),
  txId: text("tx_id"),
  proofImg: text("proof_img"),
}, (table) => ({
  userIdIdx: index("transactions_user_id_idx").on(table.userId),
  statusIdx: index("transactions_status_idx").on(table.status),
  typeIdx: index("transactions_type_idx").on(table.type),
  dateIdx: index("transactions_date_idx").on(table.date),
}));

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  date: text("date").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
}));

export const gateways = pgTable("gateways", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").default("manual"),
  currency: text("currency").default("BDT"),
  minAmount: real("min_amount").default(10),
  maxAmount: real("max_amount").default(50000),
  charge: real("charge").default(0),
  instructions: text("instructions"),
  details: text("details"),
  isActive: boolean("is_active").default(true),
});
