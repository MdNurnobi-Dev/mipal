import { useState, useEffect } from 'react';
import { User, Post, Plan } from './types';

// Mock Data
export const mockUser: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  bio: 'Just a tech enthusiast looking for microjobs to earn on the side.',
  balance: 15.50,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  referralCode: 'EARN2026',
  activePlanId: undefined,
  dailyEarned: 0,
  lastEarnedDate: new Date().toISOString().split('T')[0],
  notifications: { email: true, push: false }
};

export const mockPosts: Post[] = [
  {
    id: 'post-bd-1',
    userId: 'bd-user-1',
    userName: 'Tanvir Ahmed',
    content: 'আমি এই অ্যাপ এ কাজ করে অনেক ভালো লাগছে! আলহামদুলিল্লাহ প্রতিদিন কাজ করে bKash-এ ইনস্ট্যান্ট পেমেন্ট পাচ্ছি এবং বন্ধুদেরও রেফার করছি। আপনারা সবাই বেশি বেশি কাজ করুন ও নিয়মিত উইথড্র দিন, ১০০% বিশ্বস্ত সাইট! 💸🇧🇩🔥',
    likes: 89,
    comments: 16,
    shares: 9,
    createdAt: '১০ মিনিট আগে',
    isLiked: false,
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir',
    status: 'approved'
  },
  {
    id: 'post-bd-2',
    userId: 'bd-user-2',
    userName: 'Sumaiya Akter',
    content: 'ঘরে বসে মোবাইলে সহজ কুইজ আর ছোট ছোট ভিডিও দেখেই দৈনিক ভালো একটা প্রফিট হচ্ছে। আজ ১২০০ টাকার উইথড্র রিকোয়েস্ট দিয়ে মাত্র ১০ মিনিটে বিকাশ এ টাকা চলে এসেছে। কোনো ঝামেলা নেই, সবার জন্যই এটা সেরা আর্নিং প্ল্যাটফর্ম! 📱✨',
    likes: 134,
    comments: 24,
    shares: 14,
    createdAt: '৪৫ মিনিট আগে',
    isLiked: true,
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sumaiya',
    status: 'approved'
  },
  {
    id: 'post-bd-3',
    userId: 'bd-user-4',
    userName: 'Md. Faruk Hossain',
    content: 'বন্ধুরা, ডেইলি স্পিন ও রিওয়ার্ড অপশন কিন্তু কেউ মিস করবেন না! টানা ৭ দিন চেক-ইন করলে ভালো বোনাস পাওয়া যায়। আমি এখন পর্যন্ত প্রায় ১৮,৫০০ টাকা তুলে ফেলেছি। সৎ ও রিয়েল অনলাইন আর্নিং সাইট এটা। 🏆💎',
    likes: 198,
    comments: 31,
    shares: 22,
    createdAt: '২ ঘণ্টা আগে',
    isLiked: false,
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Faruk',
    status: 'approved'
  },
  {
    id: 'post-bd-4',
    userId: 'bd-user-6',
    userName: 'Shakil Mahmud',
    content: 'আজকের সব কয়টা কুইজ টাস্ক কমপ্লিট করলাম। একদম সহজ প্রশ্ন থাকে, সময়ও কম লাগে। পেমেন্ট গেটওয়েগুলো যেমন বিকাশ, নগদ, রকেট সবই খুব ফাস্ট কাজ করে। অ্যাডমিন ভাইকে অনেক ধন্যবাদ এমন একটি বিশ্বস্ত সাইট দেওয়ার জন্য! 🤝👍',
    likes: 76,
    comments: 11,
    shares: 6,
    createdAt: '৪ ঘণ্টা আগে',
    isLiked: false,
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shakil',
    status: 'approved'
  }
];

export const mockPlans: Plan[] = [
  { id: 'p1', name: 'Starter Plan', price: 10, dailyEarningLimit: 0.5, durationDays: 30 },
  { id: 'p2', name: 'Pro Plan', price: 50, dailyEarningLimit: 3.0, durationDays: 30 },
  { id: 'p3', name: 'VIP Plan', price: 200, dailyEarningLimit: 15.0, durationDays: 30 },
];
