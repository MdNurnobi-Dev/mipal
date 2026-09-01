export type User = {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  password?: string;
  twoFactorEnabled?: boolean;
  language?: string;
  theme?: 'light' | 'dark';
  balance: number;
  referralCode?: string;
  activePlanId?: string;
  dailyEarned?: number;
  lastEarnedDate?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    promo?: boolean;
  };
  checkInStreak?: number;
  lastCheckInDate?: string;
  referredBy?: string;
  referralEarnings?: number;
  status?: string;
  joined?: string;
};

export type PostComment = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
};

export type Post = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  isLiked?: boolean;
  likedBy?: string[];
  commentsList?: PostComment[];
  status?: 'pending' | 'approved' | 'rejected';
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  dailyEarningLimit: number;
  durationDays: number;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type Task = {
  id: string;
  title: string;
  type: string;
  reward: number;
  limit: string;
  status: 'Active' | 'Paused';
  description?: string;
  actionUrl?: string;
  actionUrls?: string[];
  duration?: number;
  quizData?: QuizQuestion[];
};


export type Gateway = {
  id: string;
  name: string;
  type?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  charge?: number;
  instructions?: string;
  details: string;
  accountNumber?: string;
  accountType?: string;
  isActive: boolean;
};

export type ReferralSettings = {
  referrerBonusAmount: number;
  newUserBonusAmount: number;
  depositBonusPercent: number;
  taskEarningBonusPercentByPlan: Record<string, number>;
  signupBonusAmount?: number;
};

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  supportEmail: string;
  supportPhone: string;
  facebookUrl: string;
  telegramUrl: string;
  whatsappUrl: string;
  whatsappNumber?: string;
  primaryColor: string;
  currency?: string;
  currencySymbol?: string;
  minWithdraw?: number;
  minDeposit?: number;
  [key: string]: any;
};