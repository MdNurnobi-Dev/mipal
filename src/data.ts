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
    id: '101',
    userId: '2',
    userName: 'Admin',
    content: 'Welcome to MicroJob Pro! Start completing tasks to earn money today. Check out our new investment plans for higher returns!',
    likes: 124,
    comments: 12,
    shares: 5,
    createdAt: '2 hours ago',
    isLiked: false,
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    status: 'approved'
  },
  {
    id: '102',
    userId: '3',
    userName: 'Sarah Parker',
    content: 'Just received my first withdrawal of $50! This platform is legit. Thanks admin! 🚀🤑',
    likes: 45,
    comments: 8,
    shares: 1,
    createdAt: '5 hours ago',
    isLiked: true,
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    status: 'approved'
  }
];

export const mockPlans: Plan[] = [
  { id: 'p1', name: 'Starter Plan', price: 10, dailyEarningLimit: 0.5, durationDays: 30 },
  { id: 'p2', name: 'Pro Plan', price: 50, dailyEarningLimit: 3.0, durationDays: 30 },
  { id: 'p3', name: 'VIP Plan', price: 200, dailyEarningLimit: 15.0, durationDays: 30 },
];
