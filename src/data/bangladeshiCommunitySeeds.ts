export interface SeedBangladeshiUser {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  phone: string;
  balance: number;
  referralCode: string;
  activePlanId?: string;
  dailyEarned: number;
  referralEarnings: number;
  checkInStreak: number;
  role: string;
  status: string;
  joined: string;
}

export interface SeedBangladeshiPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  status: string;
  likedBy?: string[];
  commentsList?: {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: string;
  }[];
}

export interface SeedBangladeshiTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdraw' | 'task_earning' | 'daily_reward' | 'referral_bonus';
  amount: number;
  method: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  userDetails?: string;
}

export const bangladeshiSeedUsers: SeedBangladeshiUser[] = [
  {
    id: 'bd-user-1',
    name: 'Tanvir Ahmed',
    email: 'tanvir.ahmed99@gmail.com',
    bio: 'Student & Freelancer | প্রতিদিন টাস্ক কমপ্লিট করে হাতখরচ চালাচ্ছি 💻',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir',
    phone: '01712893451',
    balance: 850.50,
    referralCode: 'TANVIR99',
    activePlanId: 'p2',
    dailyEarned: 35.00,
    referralEarnings: 420.00,
    checkInStreak: 14,
    role: 'user',
    status: 'Active',
    joined: '2026-02-10'
  },
  {
    id: 'bd-user-2',
    name: 'Sumaiya Akter',
    email: 'sumaiya.akter.bd@gmail.com',
    bio: 'গৃহিনী | ঘরে বসেই মোবাইল দিয়ে কাজ করি এবং নিয়মিত bKash-এ পেমেন্ট পাই ❤️',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sumaiya',
    phone: '01823901244',
    balance: 1420.00,
    referralCode: 'SUMAIYA26',
    activePlanId: 'p3',
    dailyEarned: 60.00,
    referralEarnings: 680.00,
    checkInStreak: 21,
    role: 'user',
    status: 'Active',
    joined: '2026-02-05'
  },
  {
    id: 'bd-user-3',
    name: 'Rakibul Hasan',
    email: 'rakib.hasan.ctg@gmail.com',
    bio: 'ডিজিটাল মার্কেটার ও অনলাইন আর্নার 🚀',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rakib',
    phone: '01911456782',
    balance: 620.00,
    referralCode: 'RAKIB786',
    activePlanId: 'p2',
    dailyEarned: 25.00,
    referralEarnings: 310.00,
    checkInStreak: 9,
    role: 'user',
    status: 'Active',
    joined: '2026-02-15'
  },
  {
    id: 'bd-user-4',
    name: 'Md. Faruk Hossain',
    email: 'faruk.hossain.raj@gmail.com',
    bio: 'সবাইকে রেফার করুন আর আনলিমিটেড বোনাস পান 💰',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Faruk',
    phone: '01678129034',
    balance: 2350.00,
    referralCode: 'FARUKVIP',
    activePlanId: 'p3',
    dailyEarned: 85.00,
    referralEarnings: 1250.00,
    checkInStreak: 28,
    role: 'user',
    status: 'Active',
    joined: '2026-01-28'
  },
  {
    id: 'bd-user-5',
    name: 'Nusrat Jahan Rima',
    email: 'nusrat.rima.bd@gmail.com',
    bio: 'Honours 2nd year student | MicroJob Pro ইজ বেস্ট প্ল্যাটফর্ম!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat',
    phone: '01534789012',
    balance: 490.00,
    referralCode: 'RIMA2026',
    activePlanId: 'p1',
    dailyEarned: 15.00,
    referralEarnings: 180.00,
    checkInStreak: 7,
    role: 'user',
    status: 'Active',
    joined: '2026-02-18'
  },
  {
    id: 'bd-user-6',
    name: 'Shakil Mahmud',
    email: 'shakil.mahmud.sylhet@gmail.com',
    bio: 'প্রতিদিন ম্যাথ কুইজ আর ভিডিও দেখে ইনকাম করি 🔥',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shakil',
    phone: '01799341209',
    balance: 780.00,
    referralCode: 'SHAKIL99',
    activePlanId: 'p2',
    dailyEarned: 30.00,
    referralEarnings: 290.00,
    checkInStreak: 12,
    role: 'user',
    status: 'Active',
    joined: '2026-02-12'
  }
];

export const bangladeshiSeedPosts: SeedBangladeshiPost[] = [
  {
    id: 'post-bd-1',
    userId: 'bd-user-1',
    userName: 'Tanvir Ahmed',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir',
    content: 'আমি এই অ্যাপ এ কাজ করে অনেক ভালো লাগছে! আলহামদুলিল্লাহ প্রতিদিন কাজ করে bKash-এ ইনস্ট্যান্ট পেমেন্ট পাচ্ছি এবং বন্ধুদেরও রেফার করছি। আপনারা সবাই বেশি বেশি কাজ করুন ও নিয়মিত উইথড্র দিন, ১০০% বিশ্বস্ত সাইট! 💸🇧🇩🔥',
    likes: 89,
    comments: 16,
    shares: 9,
    createdAt: '১০ মিনিট আগে',
    status: 'approved',
    likedBy: ['bd-user-2', 'bd-user-3', 'bd-user-5'],
    commentsList: [
      {
        id: 'c-bd-1-1',
        postId: 'post-bd-1',
        userId: 'bd-user-3',
        userName: 'Rakibul Hasan',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rakib',
        content: 'একদম সত্যি ভাই! আমি আজ সকালেই ৭৫০ টাকা উইথড্র পেয়েছি নগদ একাউন্টে। ধন্যবাদ অ্যাডমিন!',
        createdAt: '৮ মিনিট আগে'
      },
      {
        id: 'c-bd-1-2',
        postId: 'post-bd-1',
        userId: 'bd-user-5',
        userName: 'Nusrat Jahan Rima',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nusrat',
        content: 'রেফার বোনাসটা আসলেই অসাধারণ, ফ্রেন্ডদের জয়েন করিয়েই এক্সট্রা ইনকাম হচ্ছে! ❤️',
        createdAt: '৫ মিনিট আগে'
      }
    ]
  },
  {
    id: 'post-bd-2',
    userId: 'bd-user-2',
    userName: 'Sumaiya Akter',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sumaiya',
    content: 'ঘরে বসে মোবাইলে সহজ কুইজ আর ছোট ছোট ভিডিও দেখেই দৈনিক ভালো একটা প্রফিট হচ্ছে। আজ ১২০০ টাকার উইথড্র রিকোয়েস্ট দিয়ে মাত্র ১০ মিনিটে বিকাশ এ টাকা চলে এসেছে। কোনো ঝামেলা নেই, সবার জন্যই এটা সেরা আর্নিং প্ল্যাটফর্ম! 📱✨',
    likes: 134,
    comments: 24,
    shares: 14,
    createdAt: '৪৫ মিনিট আগে',
    status: 'approved',
    likedBy: ['bd-user-1', 'bd-user-4', 'bd-user-6'],
    commentsList: [
      {
        id: 'c-bd-2-1',
        postId: 'post-bd-2',
        userId: 'bd-user-4',
        userName: 'Md. Faruk Hossain',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Faruk',
        content: 'মাশাআল্লাহ আপু! VIP প্ল্যান এক্টিভ রাখলে আর্নিং আরও অনেক ফাস্ট হয়। এগিয়ে যান!',
        createdAt: '৩০ মিনিট আগে'
      }
    ]
  },
  {
    id: 'post-bd-3',
    userId: 'bd-user-4',
    userName: 'Md. Faruk Hossain',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Faruk',
    content: 'বন্ধুরা, ডেইলি স্পিন ও রিওয়ার্ড অপশন কিন্তু কেউ মিস করবেন না! টানা ৭ দিন চেক-ইন করলে ভালো বোনাস পাওয়া যায়। আমি এখন পর্যন্ত প্রায় ১৮,৫০০ টাকা তুলে ফেলেছি। সৎ ও রিয়েল অনলাইন আর্নিং সাইট এটা। 🏆💎',
    likes: 198,
    comments: 31,
    shares: 22,
    createdAt: '২ ঘণ্টা আগে',
    status: 'approved',
    likedBy: ['bd-user-1', 'bd-user-2', 'bd-user-3', 'bd-user-6'],
    commentsList: [
      {
        id: 'c-bd-3-1',
        postId: 'post-bd-3',
        userId: 'bd-user-6',
        userName: 'Shakil Mahmud',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shakil',
        content: 'ভাই আপনার রেফারেল টিপসটা কাজে দিয়েছে! আমার টিমে এখন ২৫ জন কাজ করছে।',
        createdAt: '১ ঘণ্টা আগে'
      }
    ]
  },
  {
    id: 'post-bd-4',
    userId: 'bd-user-6',
    userName: 'Shakil Mahmud',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shakil',
    content: 'আজকের সব কয়টা কুইজ টাস্ক কমপ্লিট করলাম। একদম সহজ প্রশ্ন থাকে, সময়ও কম লাগে। পেমেন্ট গেটওয়েগুলো যেমন বিকাশ, নগদ, রকেট সবই খুব ফাস্ট কাজ করে। অ্যাডমিন ভাইকে অনেক ধন্যবাদ এমন একটি বিশ্বস্ত সাইট দেওয়ার জন্য! 🤝👍',
    likes: 76,
    comments: 11,
    shares: 6,
    createdAt: '৪ ঘণ্টা আগে',
    status: 'approved',
    likedBy: ['bd-user-2', 'bd-user-5'],
    commentsList: [
      {
        id: 'c-bd-4-1',
        postId: 'post-bd-4',
        userId: 'bd-user-1',
        userName: 'Tanvir Ahmed',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir',
        content: 'সবার সাথে শেয়ার করুন শাকিল ভাই, যত বেশি কাজ তত বেশি ইনকাম!',
        createdAt: '৩ ঘণ্টা আগে'
      }
    ]
  }
];

export const bangladeshiSeedTransactions: SeedBangladeshiTransaction[] = [
  {
    id: 'TXN-BD-901',
    userId: 'bd-user-1',
    userName: 'Tanvir Ahmed',
    type: 'withdraw',
    amount: 500.00,
    method: 'bKash Personal',
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'approved',
    userDetails: 'Withdrawal to bKash: 01712893451'
  },
  {
    id: 'TXN-BD-902',
    userId: 'bd-user-2',
    userName: 'Sumaiya Akter',
    type: 'withdraw',
    amount: 1200.00,
    method: 'bKash Personal',
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'approved',
    userDetails: 'Withdrawal to bKash: 01823901244'
  },
  {
    id: 'TXN-BD-903',
    userId: 'bd-user-3',
    userName: 'Rakibul Hasan',
    type: 'withdraw',
    amount: 750.00,
    method: 'Nagad Personal',
    date: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    status: 'approved',
    userDetails: 'Withdrawal to Nagad: 01911456782'
  },
  {
    id: 'TXN-BD-904',
    userId: 'bd-user-4',
    userName: 'Md. Faruk Hossain',
    type: 'referral_bonus',
    amount: 50.00,
    method: 'System Bonus',
    date: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    status: 'approved',
    userDetails: 'Direct team referral commission reward'
  },
  {
    id: 'TXN-BD-905',
    userId: 'bd-user-5',
    userName: 'Nusrat Jahan Rima',
    type: 'task_earning',
    amount: 15.00,
    method: 'Quiz Task',
    date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'approved',
    userDetails: 'Completed math quiz bundle reward'
  },
  {
    id: 'TXN-BD-906',
    userId: 'bd-user-6',
    userName: 'Shakil Mahmud',
    type: 'deposit',
    amount: 500.00,
    method: 'bKash Personal',
    date: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    status: 'approved',
    userDetails: 'Deposit approved for Pro Plan activation'
  }
];
