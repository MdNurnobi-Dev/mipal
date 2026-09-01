import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plan, Post, PostComment, Task, SiteSettings, User } from '../types';
import { taskLogger } from '../utils/taskLogger';
import { mockPosts } from '../data';
import { appEvents, SYNC_EVENTS } from '../utils/eventEmitter';

export type { User };
export type Gateway = { 
  id: string; 
  name: string; 
  details: string; 
  instructions?: string;
  minAmount?: number;
  maxAmount?: number;
  charge?: number;
  type?: string;
  currency?: string;
  isActive: boolean; 
};
export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  date: string;
  type: 'deposit' | 'withdraw' | 'system' | 'general';
};

export type NotificationSettings = {
  depositAlerts: boolean;
  withdrawalAlerts: boolean;
  systemAlerts: boolean;
};

export type Transaction = { id: string; userId: string; userName: string; type: 'deposit' | 'withdraw' | 'plan_purchase' | 'task_earning' | 'referral_bonus' | 'signup_bonus' | 'daily_reward'; amount: number; method: string; txId?: string; proofImg?: string; date: string; status: 'pending' | 'approved' | 'rejected'; userDetails?: string; };

export type DailyRewardSettings = {
  isActive: boolean;
  baseAmount: number;
  streakBonus: number;
  maxStreak: number;
};

export type GiveawayBanner = {
  id: string;
  imageUrl?: string;
  isActive: boolean;
  title?: string;
  subtitle?: string;
  color?: string;
  actionUrl?: string;
};

export type ReferralSettings = {
  referrerBonusAmount: number;
  newUserBonusAmount: number;
  depositBonusPercent: number;
  taskEarningBonusPercentByPlan: Record<string, number>;
  signupBonusAmount?: number;
};

interface AppState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  giveawayBanners: GiveawayBanner[];
  addGiveawayBanner: (banner: Omit<GiveawayBanner, 'id'>) => void;
  deleteGiveawayBanner: (id: string) => void;
  toggleGiveawayBanner: (id: string) => void;
  dailyRewardSettings: DailyRewardSettings;
  updateDailyRewardSettings: (settings: Partial<DailyRewardSettings>) => Promise<{ success: boolean }>;
  claimDailyReward: () => { success: boolean; message: string; reward: number; streak: number };
  referralSettings: ReferralSettings;
  updateReferralSettings: (settings: Partial<ReferralSettings>) => Promise<{ success: boolean; settings?: ReferralSettings }>;
  registerUser: (userData: { name: string; email: string; password?: string; referralCode?: string }) => Promise<{ success: boolean; message: string; user?: User }>;
  updateUserProfile: (id: string, updates: Partial<User>) => void;
  users: User[];
  currentUser: User | null;
  gateways: Gateway[];
  notifications: Notification[];
  notificationSettings: NotificationSettings;
  addNotification: (notif: Omit<Notification, 'id' | 'date' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<{ success: boolean }>;
  transactions: Transaction[];
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'status'>) => void;
  approvePost: (id: string) => void;
  rejectPost: (id: string) => void;
  deletePost: (id: string) => void;
  togglePostLike: (postId: string, userId: string) => void;
  addPostComment: (postId: string, comment: Omit<PostComment, 'id' | 'createdAt'>) => void;
  sharePost: (postId: string) => void;
  plans: Plan[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string) => void;
  addGateway: (gw: Omit<Gateway, 'id'>) => void;
  updateGateway: (id: string, gw: Partial<Gateway>) => void;
  deleteGateway: (id: string) => void;
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  purchasePlan: (planId: string) => { success: boolean; message: string };
  completeTask: (amount: number, taskName: string) => { success: boolean; message: string };
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<{ success: boolean; settings?: SiteSettings }>;
  refetchData: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  loginUser: (email: string, pass: string, twoFactorCode?: string) => Promise<{success: boolean, message?: string, requires2FA?: boolean}>;
  adminLogin: (email: string, pass: string) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  isAdminAuthed: boolean;
}

const defaultSiteSettings: SiteSettings = {
  siteName: 'Earnify',
  siteDescription: 'The best platform to earn rewards.',
  logoUrl: '',
  faviconUrl: '',
  supportEmail: 'support@earnify.com',
  supportPhone: '',
  facebookUrl: '',
  telegramUrl: '',
  whatsappUrl: '',
  whatsappNumber: '',
  primaryColor: '#4f46e5', // indigo-600
  currency: '৳',
  currencySymbol: '৳',
  minWithdraw: 10,
  minDeposit: 10
};

const AppContext = createContext<AppState | undefined>(undefined);

// Broadcast channel & Storage key for cross-tab, cross-window, and instant UI state synchronization
const SETTINGS_BROADCAST_CHANNEL = 'earnify_settings_broadcast';
const SETTINGS_SYNC_STORAGE_KEY = 'earnify_settings_sync_event';

let syncBroadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncBroadcastChannel = new BroadcastChannel(SETTINGS_BROADCAST_CHANNEL);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment, falling back to window events and storage:', e);
}

const broadcastSettingChange = (key: string, value: any) => {
  const syncPayload = {
    type: 'SETTINGS_UPDATE',
    key,
    value,
    timestamp: Date.now(),
  };

  // 1. Emit typed global event through AppEventEmitter
  appEvents.emit(SYNC_EVENTS.SETTINGS_UPDATED, syncPayload);
  if (key === 'siteSettings' && value) {
    const sym = value.currencySymbol || value.currency;
    if (sym) {
      appEvents.emit(SYNC_EVENTS.CURRENCY_CHANGED, { currencySymbol: sym, timestamp: Date.now() });
    }
  }

  // 2. Post to BroadcastChannel if available (cross-tab / cross-window)
  try {
    if (syncBroadcastChannel) {
      syncBroadcastChannel.postMessage(syncPayload);
    }
  } catch (e) {
    console.warn('BroadcastChannel postMessage failed:', e);
  }

  // 3. Dispatch custom event locally on window (same-window instant reactive broadcast)
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:settings-updated', { detail: syncPayload }));
    }
  } catch (e) {
    console.warn('CustomEvent dispatch failed:', e);
  }

  // 4. Fallback to localStorage event for detached iframes/tabs
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SETTINGS_SYNC_STORAGE_KEY, JSON.stringify(syncPayload));
    }
  } catch (e) {
    // ignore quota or sandboxed storage restrictions
  }
};

const bgMutate = async (table: string, action: string, payload?: any, id?: string) => {
  const start = Date.now();
  try {
    const res = await apiFetch('/api/mutate', { 
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, action, payload, id })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error(`[API Mutation Error] Database mutation failed [${table}:${action}]:`, {
        timestamp: new Date().toISOString(),
        endpoint: '/api/mutate',
        table,
        action,
        id,
        httpStatus: res.status,
        httpStatusText: res.statusText,
        durationMs: Date.now() - start,
        error: errData.error || res.statusText,
        payload
      });
    }
  } catch (error: any) {
    console.error(`[API Mutation Exception] Failed request [${table}:${action}]:`, {
      timestamp: new Date().toISOString(),
      table,
      action,
      id,
      error: error?.message,
      stack: error?.stack
    });
  }
};

const bgSetting = async (key: string, value: any): Promise<{ success: boolean; error?: string }> => {
  const requestStart = Date.now();
  try {
    const res = await apiFetch('/api/settings', { 
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errorMsg = errData.error || res.statusText || 'Settings update failed';
      console.error('[API Update Error] Failed to update setting in database:', {
        timestamp: new Date().toISOString(),
        endpoint: '/api/settings',
        method: 'POST',
        settingKey: key,
        httpStatus: res.status,
        httpStatusText: res.statusText,
        durationMs: Date.now() - requestStart,
        serverError: errData,
        submittedPayload: value,
      });
      return { success: false, error: errorMsg };
    }
    console.info(`[API Update Success] Setting '${key}' synchronized to database in ${Date.now() - requestStart}ms.`);
    return { success: true };
  } catch (error: any) {
    console.error('[API Network Error] Exception while calling /api/settings:', {
      timestamp: new Date().toISOString(),
      endpoint: '/api/settings',
      settingKey: key,
      durationMs: Date.now() - requestStart,
      exceptionMessage: error?.message,
      errorStack: error?.stack,
      submittedPayload: value,
    });
    return { success: false, error: error?.message || 'Network error updating settings' };
  }
};


const apiFetch = (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('x-requested-with')) {
    headers.set('x-requested-with', 'XMLHttpRequest');
  }
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const loadInitialData = async () => {
    setIsInitializing(true);
    setInitError(null);
    try {
      const [meRes, dataRes] = await Promise.all([
        apiFetch('/api/me', { credentials: 'include' }),
        apiFetch('/api/data', { credentials: 'include' })
      ]);
      
      const meData = await meRes.json().catch(() => ({}));
      if (meData.currentUser) setCurrentUser(meData.currentUser);
      if (meData.isAdmin) setIsAdminAuthed(true);

      if (!dataRes.ok) {
        throw new Error(`Server returned ${dataRes.status}: ${dataRes.statusText}`);
      }
      const data = await dataRes.json();

      if(data.users) {
        setUsers(data.users);
        if (meData.currentUser) {
          const freshUser = data.users.find((u: User) => u.id === meData.currentUser.id);
          if (freshUser) {
            setCurrentUser(freshUser);
          }
        }
      }
      if(data.posts) setPosts(data.posts);
      if(data.plans) setPlans(data.plans);
      if(data.tasks) {
        setTasks(data.tasks);
        if (typeof window !== 'undefined') {
          (window as any).__CURRENT_TASKS__ = data.tasks;
        }
        taskLogger.logContextHydration(data.tasks);
      }
      if(data.gateways) setGateways(data.gateways);
      if(data.transactions) setTransactions(data.transactions);
      if(data.notifications) setNotifications(data.notifications);
      if(data.settings) {
        if(data.settings.siteSettings) {
          const s = data.settings.siteSettings;
          const sym = s.currencySymbol || s.currency || '৳';
          setSiteSettings({ ...s, currency: sym, currencySymbol: sym });
        }
        if(data.settings.referralSettings) setReferralSettings(data.settings.referralSettings);
        if(data.settings.dailyRewardSettings) setDailyRewardSettings(data.settings.dailyRewardSettings);
        if(data.settings.notificationSettings) setNotificationSettings(data.settings.notificationSettings);
        if(data.settings.giveawayBanners) setGiveawayBanners(data.settings.giveawayBanners);
      }
    } catch (err: any) {
      console.error('Failed to initialize application:', err);
      setInitError(err?.message || 'Database connection error. Please retry.');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Multi-tab / multi-component instant setting broadcast listener
  useEffect(() => {
    const handleSyncMessage = (data: { type: string; key: string; value: any }) => {
      if (data?.type === 'SETTINGS_UPDATE') {
        const { key, value } = data;
        if (key === 'siteSettings' && value) {
          const sym = value.currencySymbol || value.currency || '৳';
          setSiteSettings(prev => ({ ...prev, ...value, currency: sym, currencySymbol: sym }));
        } else if (key === 'referralSettings' && value) {
          setReferralSettings(prev => ({ ...prev, ...value }));
        } else if (key === 'dailyRewardSettings' && value) {
          setDailyRewardSettings(prev => ({ ...prev, ...value }));
        } else if (key === 'notificationSettings' && value) {
          setNotificationSettings(prev => ({ ...prev, ...value }));
        } else if (key === 'giveawayBanners' && value) {
          setGiveawayBanners(value);
        }
      }
    };

    if (syncBroadcastChannel) {
      syncBroadcastChannel.onmessage = (event) => {
        handleSyncMessage(event.data);
      };
    }

    const unsubEmitter = appEvents.on(SYNC_EVENTS.SETTINGS_UPDATED, (data) => {
      handleSyncMessage(data);
    });

    const onCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        handleSyncMessage(customEvent.detail);
      }
    };
    window.addEventListener('app:settings-updated', onCustomEvent);

    const onStorageEvent = (e: StorageEvent) => {
      if (e.key === SETTINGS_SYNC_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleSyncMessage(parsed);
        } catch (err) {
          // ignore parse error
        }
      }
    };
    window.addEventListener('storage', onStorageEvent);

    return () => {
      unsubEmitter();
      window.removeEventListener('app:settings-updated', onCustomEvent);
      window.removeEventListener('storage', onStorageEvent);
    };
  }, []);

  // Synchronize document title and favicon dynamically when siteSettings change
  useEffect(() => {
    if (siteSettings?.siteName && typeof document !== 'undefined') {
      document.title = siteSettings.siteName;
    }
    if (siteSettings?.faviconUrl && typeof document !== 'undefined') {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteSettings.faviconUrl;
    }
  }, [siteSettings?.siteName, siteSettings?.faviconUrl]);

  const refetchData = async () => {
    try {
      const dataRes = await apiFetch('/api/data', { credentials: 'include' });
      if (!dataRes.ok) return;
      const data = await dataRes.json();
      if(data.users) {
        setUsers(data.users);
        setCurrentUser(prev => {
          if (!prev) return null;
          const fresh = data.users.find((u: User) => u.id === prev.id);
          return fresh ? { ...prev, ...fresh } : prev;
        });
      }
      if(data.posts) setPosts(data.posts);
      if(data.plans) setPlans(data.plans);
      if(data.tasks) setTasks(data.tasks);
      if(data.gateways) setGateways(data.gateways);
      if(data.transactions) setTransactions(data.transactions);
      if(data.notifications) setNotifications(data.notifications);
      if(data.settings) {
        if(data.settings.siteSettings) {
          const s = data.settings.siteSettings;
          const sym = s.currencySymbol || s.currency || '৳';
          setSiteSettings({ ...s, currency: sym, currencySymbol: sym });
        }
        if(data.settings.referralSettings) setReferralSettings(data.settings.referralSettings);
        if(data.settings.dailyRewardSettings) setDailyRewardSettings(data.settings.dailyRewardSettings);
        if(data.settings.notificationSettings) setNotificationSettings(data.settings.notificationSettings);
        if(data.settings.giveawayBanners) setGiveawayBanners(data.settings.giveawayBanners);
      }
    } catch (e) {
      console.warn('Failed to re-fetch data from server:', e);
    }
  };

  const refreshSettings = async () => {
    try {
      const dataRes = await apiFetch('/api/data', { credentials: 'include' });
      if (!dataRes.ok) return;
      const data = await dataRes.json();
      if(data.settings) {
        if(data.settings.siteSettings) {
          const s = data.settings.siteSettings;
          const sym = s.currencySymbol || s.currency || '৳';
          setSiteSettings({ ...s, currency: sym, currencySymbol: sym });
        }
        if(data.settings.referralSettings) setReferralSettings(data.settings.referralSettings);
        if(data.settings.dailyRewardSettings) setDailyRewardSettings(data.settings.dailyRewardSettings);
        if(data.settings.notificationSettings) setNotificationSettings(data.settings.notificationSettings);
      }
    } catch (e) {
      console.warn('Failed to refresh settings:', e);
    }
  };

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    const sym = updates.currencySymbol || updates.currency || siteSettings.currencySymbol || siteSettings.currency || '৳';
    const newSettings = { ...siteSettings, ...updates, currency: sym, currencySymbol: sym };
    
    // 1. Immediately update React state for instant local responsiveness
    setSiteSettings(newSettings);
    
    // 2. Persist to PostgreSQL database
    const res = await bgSetting('siteSettings', newSettings);
    if (!res.success) {
      throw new Error(res.error || 'Failed to save site settings to database.');
    }
    
    // 3. Broadcast to all other components, tabs, and windows
    broadcastSettingChange('siteSettings', newSettings);
    
    return { success: true, settings: newSettings };
  };


  const [users, setUsers] = useState<User[]>([]);
  const [giveawayBanners, setGiveawayBanners] = useState<GiveawayBanner[]>([]);
  const addGiveawayBanner = (banner: Omit<GiveawayBanner, 'id'>) => {
    const newBanners = [...giveawayBanners, { ...banner, id: `gb-${Date.now()}` }];
    setGiveawayBanners(newBanners);
    bgSetting('giveawayBanners', newBanners);
  };
  const deleteGiveawayBanner = (id: string) => {
    const newBanners = giveawayBanners.filter(b => b.id !== id);
    setGiveawayBanners(newBanners);
    bgSetting('giveawayBanners', newBanners);
  };
  const toggleGiveawayBanner = (id: string) => {
    const newBanners = giveawayBanners.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    setGiveawayBanners(newBanners);
    bgSetting('giveawayBanners', newBanners);
  };

  const [dailyRewardSettings, setDailyRewardSettings] = useState<DailyRewardSettings>({ isActive: true, baseAmount: 0.10, streakBonus: 0.05, maxStreak: 7 });
  const updateDailyRewardSettings = async (s: Partial<DailyRewardSettings>) => {
    const newSettings = { ...dailyRewardSettings, ...s };
    setDailyRewardSettings(newSettings);
    const res = await bgSetting('dailyRewardSettings', newSettings);
    if (!res.success) {
      throw new Error(res.error || 'Failed to save daily reward settings.');
    }
    broadcastSettingChange('dailyRewardSettings', newSettings);
    return { success: true };
  };

const claimDailyReward = () => {
    if (!currentUser) return { success: false, message: "Not logged in", reward: 0, streak: 0 };
    if (!dailyRewardSettings.isActive) {
      return { success: false, message: 'Daily rewards are currently disabled.', reward: 0, streak: 0 };
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.lastCheckInDate === today) {
      return { success: false, message: 'Already claimed today.', reward: 0, streak: currentUser.checkInStreak || 0 };
    }
    
    let currentStreak = currentUser.checkInStreak || 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (currentUser.lastCheckInDate !== yesterdayStr && currentUser.lastCheckInDate) {
      currentStreak = 0; 
    }
    const reward = dailyRewardSettings.baseAmount + (Math.min(currentStreak, dailyRewardSettings.maxStreak) * dailyRewardSettings.streakBonus);
    const newStreak = currentStreak + 1;
    
    // 1. Optimistic UI Update
    const prevUser = { ...currentUser };
    const updates = { balance: currentUser.balance + reward, lastCheckInDate: today, checkInStreak: newStreak };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updates } : u));
    setCurrentUser(prev => prev ? { ...prev, ...updates } : null);

    // 2. Immediate Server-side Validation & DB persistence
    apiFetch('/api/rewards/claim', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
           setTransactions(prev => [data.transaction, ...prev]);
           setCurrentUser(prev => prev ? { ...prev, balance: data.balance, checkInStreak: data.streak, lastCheckInDate: data.lastCheckInDate } : null);
        } else {
           setUsers(prev => prev.map(u => u.id === prevUser.id ? { ...u, ...prevUser } : u));
           setCurrentUser(prevUser);
           alert("Reward claim failed: " + data.error);
        }
      })
      .catch(err => {
         setUsers(prev => prev.map(u => u.id === prevUser.id ? { ...u, ...prevUser } : u));
         setCurrentUser(prevUser);
      });
      
    return { success: true, message: `Claimed ${siteSettings.currency || '$'}${reward.toFixed(2)} for Day ${newStreak} streak!`, reward, streak: newStreak };
  };

  const [referralSettings, setReferralSettings] = useState<ReferralSettings>({
    newUserBonusAmount: 1.00,
    referrerBonusAmount: 2.50,
    depositBonusPercent: 5,
    taskEarningBonusPercentByPlan: {}
  });

  const updateReferralSettings = async (s: Partial<ReferralSettings>) => {
    const newSettings = { ...referralSettings, ...s };
    setReferralSettings(newSettings);
    const res = await bgSetting('referralSettings', newSettings);
    if (!res.success) {
      throw new Error(res.error || 'Failed to save referral settings to database.');
    }
    broadcastSettingChange('referralSettings', newSettings);
    return { success: true, settings: newSettings };
  };

  
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: `t-${Date.now()}` };
    taskLogger.logAdminMutation('insert', newTask.id, newTask);
    setTasks(prev => {
      const next = [newTask, ...prev];
      if (typeof window !== 'undefined') (window as any).__CURRENT_TASKS__ = next;
      return next;
    });
    bgMutate('tasks', 'insert', newTask);
  };
  const updateTask = (id: string, updates: Partial<Task>) => {
    taskLogger.logAdminMutation('update', id, updates);
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      if (typeof window !== 'undefined') (window as any).__CURRENT_TASKS__ = next;
      return next;
    });
    bgMutate('tasks', 'update', updates, id);
  };
  const deleteTask = (id: string) => {
    taskLogger.logAdminMutation('delete', id, null);
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      if (typeof window !== 'undefined') (window as any).__CURRENT_TASKS__ = next;
      return next;
    });
    bgMutate('tasks', 'delete', null, id);
  };

  
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ depositAlerts: true, withdrawalAlerts: true, systemAlerts: true });

  const updateNotificationSettings = async (s: Partial<NotificationSettings>) => {
    const newSettings = { ...notificationSettings, ...s };
    setNotificationSettings(newSettings);
    const res = await bgSetting('notificationSettings', newSettings);
    if (!res.success) {
      throw new Error(res.error || 'Failed to save notification settings.');
    }
    broadcastSettingChange('notificationSettings', newSettings);
    return { success: true };
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    bgMutate('notifications', 'insert', newNotif);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    bgMutate('notifications', 'update', { isRead: true }, id);
  };

  const markAllNotificationsRead = (userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
    // It's a bit hard to bgMutate all. Let's just do an API call to update all.
    // For now, let's skip a single API call for all and just loop (not ideal but works for small amounts)
    const unread = notifications.filter(n => n.userId === userId && !n.isRead);
    unread.forEach(n => bgMutate('notifications', 'update', { isRead: true }, n.id));
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [posts, setPosts] = useState<Post[]>([]);
  
  

  const addPost = (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'status'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      status: 'pending',
      likedBy: [],
      commentsList: []
    };
    setPosts(prev => [newPost, ...prev]);
    bgMutate('posts', 'insert', newPost);
  };

  const approvePost = (id: string) => { setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p)); bgMutate('posts', 'update', { status: 'approved' }, id); };
  const rejectPost = (id: string) => { setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p)); bgMutate('posts', 'update', { status: 'rejected' }, id); };
  const deletePost = (id: string) => { setPosts(prev => prev.filter(p => p.id !== id)); bgMutate('posts', 'delete', null, id); };
  
  const togglePostLike = (postId: string, userId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likedBy?.includes(userId);
        const newLikedBy = hasLiked 
          ? p.likedBy?.filter(id => id !== userId) || []
          : [...(p.likedBy || []), userId];
        const newLikes = hasLiked ? p.likes - 1 : p.likes + 1;
        bgMutate('posts', 'update', { likes: newLikes, likedBy: newLikedBy }, postId);
        return { ...p, likes: newLikes, likedBy: newLikedBy };
      }
      return p;
    }));
  };

  const addPostComment = (postId: string, comment: Omit<PostComment, 'id' | 'createdAt'>) => {
    const newComment: PostComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newCommentsList = [...(p.commentsList || []), newComment];
        const newCommentsCount = p.comments + 1;
        // In schema we didn't add commentsList column! Oh, wait, the schema has post_comments table!
        // We should insert into post_comments... but it's okay, let's just do an update to posts.comments for now
        bgMutate('posts', 'update', { comments: newCommentsCount }, postId);
        // And actually we need to insert the comment into the DB... let's just let it be memory for now or do a fetch
        apiFetch('/api/mutate', { credentials: 'include', method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ table: 'postComments', action: 'insert', payload: { ...newComment, postId } }) });
        return { ...p, comments: newCommentsCount, commentsList: newCommentsList };
      }
      return p;
    }));
  };

  const sharePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if(p.id === postId) {
        bgMutate('posts', 'update', { shares: p.shares + 1 }, postId);
        return { ...p, shares: p.shares + 1 };
      }
      return p;
    }));
  };



  
  
  
  
  
  
  

  


  const addTransaction = (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      ...tx,
      id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: tx.type === 'plan_purchase' || tx.type === 'task_earning' ? 'approved' : 'pending'
    };
    setTransactions(prev => [newTx, ...prev]);
    bgMutate('transactions', 'insert', newTx);

    if (tx.type === 'withdraw') {
      const user = users.find(u => u.id === tx.userId);
      if(user) {
        setUsers(prev => prev.map(u => u.id === tx.userId ? { ...u, balance: u.balance - tx.amount } : u));
        bgMutate('users', 'update', { balance: user.balance - tx.amount }, tx.userId);
        if (currentUser?.id === tx.userId) {
          setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - tx.amount } : null);
        }
      }
    }
  };

  const approveTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    bgMutate('transactions', 'update', { status: 'approved' }, id);

    if (tx.type === 'deposit') {
      const user = users.find(u => u.id === tx.userId);
      let referrerFound = false;
      if (user?.referredBy) {
        const referrer = users.find(u => u.referralCode === user.referredBy);
        if (referrer && referralSettings.depositBonusPercent > 0) {
          referrerFound = true;
          const bonusPercent = referralSettings.depositBonusPercent;
          const bonus = (tx.amount * bonusPercent) / 100;
          setUsers(usrs => usrs.map(u => {
            if (u.id === tx.userId) {
              const newBalance = u.balance + tx.amount;
              bgMutate('users', 'update', { balance: newBalance }, tx.userId);
              if (currentUser?.id === tx.userId) {
                setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
              }
              return { ...u, balance: newBalance };
            }
            if (u.id === referrer.id) {
              const newBal = u.balance + bonus;
              const newRef = (u.referralEarnings || 0) + bonus;
              bgMutate('users', 'update', { balance: newBal, referralEarnings: newRef }, referrer.id);
              if (currentUser?.id === referrer.id) {
                setCurrentUser(prev => prev ? { ...prev, balance: newBal, referralEarnings: newRef } : null);
              }
              return { ...u, balance: newBal, referralEarnings: newRef };
            }
            return u;
          }));
          const bonusTx: Transaction = {
            id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
            userId: referrer.id,
            userName: referrer.name,
            type: 'referral_bonus',
            amount: bonus,
            method: 'System',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'approved',
            userDetails: `Deposit Bonus (${bonusPercent}%) from ${user.name}`
          };
          setTransactions(prev => [bonusTx, ...prev]);
          bgMutate('transactions', 'insert', bonusTx);

          addNotification({
            userId: referrer.id,
            title: 'Referral Deposit Commission! 💰',
            message: `You received ${siteSettings.currency || '$'}${bonus.toFixed(2)} (${bonusPercent}%) referral commission from ${user.name}'s deposit!`,
            type: 'system'
          });
        }
      }
      
      if (!referrerFound) {
        setUsers(usrs => usrs.map(u => {
          if (u.id === tx.userId) {
            const newBal = u.balance + tx.amount;
            bgMutate('users', 'update', { balance: newBal }, tx.userId);
            if (currentUser?.id === tx.userId) {
              setCurrentUser(prev => prev ? { ...prev, balance: newBal } : null);
            }
            return { ...u, balance: newBal };
          }
          return u;
        }));
      }

      if (notificationSettings.depositAlerts) {
        addNotification({
          userId: tx.userId,
          title: 'Deposit Approved! 🎉',
          message: `Your deposit of ${siteSettings.currency || '$'}${tx.amount.toFixed(2)} via ${tx.method} has been approved and added to your balance.`,
          type: 'deposit'
        });
      }
    } else if (tx.type === 'withdraw') {
      if (notificationSettings.withdrawalAlerts) {
        addNotification({
          userId: tx.userId,
          title: 'Withdrawal Sent! 💸',
          message: `Your withdrawal of ${siteSettings.currency || '$'}${tx.amount.toFixed(2)} via ${tx.method} has been processed and sent to your account (${tx.userDetails || ''}).`,
          type: 'withdraw'
        });
      }
    }
  };

  const rejectTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
    bgMutate('transactions', 'update', { status: 'rejected' }, id);

    if (tx.type === 'deposit' && notificationSettings.depositAlerts) {
      addNotification({
        userId: tx.userId,
        title: 'Deposit Rejected',
        message: `Your deposit request of ${siteSettings.currency || '$'}${tx.amount.toFixed(2)} was rejected. Please contact support if you have questions.`,
        type: 'deposit'
      });
    } else if (tx.type === 'withdraw' && notificationSettings.withdrawalAlerts) {
      addNotification({
        userId: tx.userId,
        title: 'Withdrawal Rejected',
        message: `Your withdrawal request of ${siteSettings.currency || '$'}${tx.amount.toFixed(2)} was rejected. The funds have been returned to your balance.`,
        type: 'withdraw'
      });
      const user = users.find(u => u.id === tx.userId);
      if(user) {
        const newBalance = user.balance + tx.amount;
        setUsers(prev => prev.map(u => u.id === tx.userId ? { ...u, balance: newBalance } : u));
        bgMutate('users', 'update', { balance: newBalance }, tx.userId);
        if (currentUser?.id === tx.userId) {
          setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
        }
      }
    }
  };

  const addGateway = (gw: Omit<Gateway, 'id'>) => {
    const newGw = { ...gw, id: `gw-${Date.now()}` };
    setGateways(prev => [...prev, newGw]);
    bgMutate('gateways', 'insert', newGw);
  };
  const updateGateway = (id: string, gw: Partial<Gateway>) => {
    setGateways(prev => prev.map(g => g.id === id ? { ...g, ...gw } : g));
    bgMutate('gateways', 'update', gw, id);
  };
  const deleteGateway = (id: string) => {
    setGateways(prev => prev.filter(g => g.id !== id));
    bgMutate('gateways', 'delete', null, id);
  };

  const addPlan = (plan: Omit<Plan, 'id'>) => {
    const newPlan = { ...plan, id: `p${Date.now()}` };
    setPlans(prev => [...prev, newPlan]);
    bgMutate('plans', 'insert', newPlan);
  };
  const updatePlan = (id: string, plan: Partial<Plan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...plan } : p));
    bgMutate('plans', 'update', plan, id);
  };
  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    bgMutate('plans', 'delete', null, id);
  };

  const purchasePlan = (planId: string) => {
    if (!currentUser) return { success: false, message: "Not logged in" };
    const plan = plans.find(p => p.id === planId);
    if (!plan) return { success: false, message: 'Plan not found.' };
    if (currentUser.balance < plan.price) return { success: false, message: 'Insufficient balance to purchase this plan.' };
    
    const today = new Date().toISOString().split('T')[0];
    const userUpdates = {
       balance: currentUser.balance - plan.price,
       activePlanId: plan.id,
       dailyEarned: 0,
       lastEarnedDate: today
    };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...userUpdates } : u));
    bgMutate('users', 'update', userUpdates, currentUser.id);
    setCurrentUser(prev => prev ? { ...prev, ...userUpdates } : null);
    
    const tx: Transaction = {
      id: `TXN-${Math.floor(Math.random() * 90000) + 10000}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'plan_purchase',
      amount: plan.price,
      method: 'Account Balance',
      userDetails: `Purchased ${plan.name}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'approved'
    };
    setTransactions(prev => [tx, ...prev]);
    bgMutate('transactions', 'insert', tx);
    
    return { success: true, message: `Successfully purchased ${plan.name}!` };
  };

  const updateUserProfile = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    bgMutate('users', 'update', updates, id);
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

const completeTask = (amount: number, taskName: string) => {
    if (!currentUser) return { success: false, message: "Not logged in" };
    if (!currentUser.activePlanId) return { success: false, message: 'You need an active plan to earn from tasks.' };
    const plan = plans.find(p => p.id === currentUser.activePlanId);
    if (!plan) return { success: false, message: 'Active plan not found.' };
    
    const today = new Date().toISOString().split('T')[0];
    let currentDailyEarned = currentUser.dailyEarned || 0;
    if (currentUser.lastEarnedDate !== today) currentDailyEarned = 0;
    
    if (currentDailyEarned + amount > plan.dailyEarningLimit) {
      return { success: false, message: `Daily earning limit of ${siteSettings.currency || '$'}${plan.dailyEarningLimit.toFixed(2)} reached.` };
    }
    
    // 1. Optimistic UI Update
    const prevUser = { ...currentUser };
    const userUpdates = { balance: currentUser.balance + amount, dailyEarned: currentDailyEarned + amount, lastEarnedDate: today };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...userUpdates } : u));
    setCurrentUser(prev => prev ? { ...prev, ...userUpdates } : null);

    // 2. Immediate Server-side Validation & DB persistence
    apiFetch('/api/tasks/complete', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, taskName })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
         setTransactions(prev => [data.transaction, ...prev]);
         setCurrentUser(prev => prev ? { ...prev, balance: data.balance, dailyEarned: data.dailyEarned, lastEarnedDate: data.lastEarnedDate } : null);
      } else {
         setUsers(prev => prev.map(u => u.id === prevUser.id ? { ...u, ...prevUser } : u));
         setCurrentUser(prevUser);
         alert("Task completion failed: " + data.error);
      }
    })
    .catch(err => {
       setUsers(prev => prev.map(u => u.id === prevUser.id ? { ...u, ...prevUser } : u));
       setCurrentUser(prevUser);
    });
    
    return { success: true, message: `Completed ${taskName}! Earned ${siteSettings.currency || '$'}${amount.toFixed(2)}` };
  };

const registerUser = async (userData: { name: string; email: string; password?: string; referralCode?: string }) => {
    try {
      const res = await apiFetch('/api/register', { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        // Refresh data to get the new user and updated referrer
        apiFetch('/api/data', { credentials: 'include' }).then(r => r.json()).then(newData => {
          if (newData.users) setUsers(newData.users);
          if (newData.transactions) setTransactions(newData.transactions);
        });
        return { success: true, message: 'Account created successfully.' };
      }
      return { success: false, message: data.error || 'Registration failed.' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };


  
  const loginUser = async (email: string, pass: string, twoFactorCode?: string) => {
    try {
      const res = await apiFetch('/api/login', { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, twoFactorCode })
      });
      const data = await res.json();
      if (data.requires2FA) {
        return { success: false, requires2FA: true };
      }
      if (data.success) {
        setCurrentUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.error };
    } catch(e: any) {
      return { success: false, message: e.message };
    }
  };

  const adminLogin = async (email: string, pass: string) => {
    try {
      const res = await apiFetch('/api/admin-login', { credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminAuthed(true);
        return { success: true };
      }
      return { success: false, message: data.error };
    } catch(e: any) {
      return { success: false, message: e.message };
    }
  };

  const logout = async () => {
    await apiFetch('/api/logout', { credentials: 'include', method: 'POST' });
    setCurrentUser(null);
    setIsAdminAuthed(false);
  };
  if (initError && isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          !
        </div>
        <h2 className="text-lg font-bold text-slate-800">Connection Error</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">{initError}</p>
        <button
          onClick={loadInitialData}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-slate-800">
          {siteSettings?.siteName || 'Loading...'}
        </h2>
        <p className="mt-2 text-slate-500 animate-pulse">
          Connecting to database...
        </p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ 
      users, currentUser, gateways, transactions, plans, notifications, notificationSettings, addNotification, markNotificationRead, markAllNotificationsRead, updateNotificationSettings, dailyRewardSettings, referralSettings, giveawayBanners,
      addTransaction, approveTransaction, rejectTransaction,
      posts, addPost, approvePost, rejectPost, deletePost, togglePostLike, addPostComment, sharePost, 
      addGateway, updateGateway, deleteGateway,
      addPlan, updatePlan, deletePlan, purchasePlan, tasks, addTask, updateTask, deleteTask, completeTask, updateUserProfile, updateDailyRewardSettings, claimDailyReward, updateReferralSettings, registerUser, addGiveawayBanner, deleteGiveawayBanner, toggleGiveawayBanner, siteSettings, updateSiteSettings, refetchData, refreshSettings, loginUser, adminLogin, logout, isAdminAuthed
    }}>
      {children}
    </AppContext.Provider>
  );
}


export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
