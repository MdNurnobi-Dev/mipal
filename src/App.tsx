/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import RouteLoadingFallback from './components/RouteLoadingFallback';
import { AppProvider, useApp } from './context/AppContext';

// User Facing Pages - Lazy Loaded for minimal initial bundle
const Home = lazy(() => import('./pages/Home'));
const Earnings = lazy(() => import('./pages/Earnings'));
const EarningsAnalytics = lazy(() => import('./pages/EarningsAnalytics'));
const Plan = lazy(() => import('./pages/Plan'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const Refer = lazy(() => import('./pages/Refer'));
const Deposit = lazy(() => import('./pages/Deposit'));
const Withdraw = lazy(() => import('./pages/Withdraw'));
const UserSettings = lazy(() => import('./pages/UserSettings'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Games = lazy(() => import('./pages/Games'));
const CrashGame = lazy(() => import('./pages/games/Crash'));
const SuperAce = lazy(() => import('./pages/games/SuperAce'));
const FortuneGems = lazy(() => import('./pages/games/FortuneGems'));
const Mines = lazy(() => import('./pages/games/Mines'));
const FlyX = lazy(() => import('./pages/games/FlyX'));
const PlatformActivity = lazy(() => import('./pages/PlatformActivity'));

// Admin Dashboard & Management Pages - Lazy Loaded in isolated chunk
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReferrals = lazy(() => import('./pages/admin/AdminReferrals'));
const AdminGiveaway = lazy(() => import('./pages/admin/AdminGiveaway'));
const AdminDailyReward = lazy(() => import('./pages/admin/AdminDailyReward'));
const AdminTasks = lazy(() => import('./pages/admin/AdminTasks'));
const AdminPlans = lazy(() => import('./pages/admin/AdminPlans'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminNotificationSettings = lazy(() => import('./pages/admin/AdminNotificationSettings'));
const AdminBranding = lazy(() => import('./pages/admin/AdminBranding'));
const AdminGateways = lazy(() => import('./pages/admin/payment/AdminGateways'));
const AdminDeposits = lazy(() => import('./pages/admin/payment/AdminDeposits'));
const AdminWithdraws = lazy(() => import('./pages/admin/payment/AdminWithdraws'));
const AdminGameBanners = lazy(() => import('./pages/admin/AdminGameBanners'));
const AdminManageGames = lazy(() => import('./pages/admin/AdminManageGames'));

function BrandingHandler() {
  const { siteSettings } = useApp();
  
  useEffect(() => {
    if (siteSettings) {
      document.title = siteSettings.siteName;
      if (siteSettings.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link') as HTMLLinkElement;
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = siteSettings.faviconUrl;
      }
      // Set theme color if possible
      let metaTheme = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
      if (!metaTheme) {
        metaTheme = document.createElement('meta') as HTMLMetaElement;
        metaTheme.name = 'theme-color';
        document.getElementsByTagName('head')[0].appendChild(metaTheme);
      }
      metaTheme.content = siteSettings.primaryColor;
    }
  }, [siteSettings]);

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <BrandingHandler />
        <Routes>
          {/* Admin Routes with Dark Fallback */}
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<RouteLoadingFallback isAdmin />}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminLayout>
                <Suspense fallback={<RouteLoadingFallback isAdmin />}>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/referrals" element={<AdminReferrals />} />
                    <Route path="/marketing/giveaway" element={<AdminGiveaway />} />
                    <Route path="/posts" element={<AdminPosts />} />
                    <Route path="/marketing/daily-rewards" element={<AdminDailyReward />} />
                    <Route path="/tasks" element={<AdminTasks />} />
                    <Route path="/plans" element={<AdminPlans />} />
                    <Route path="/transactions" element={<AdminTransactions />} />
                    <Route path="/settings" element={<AdminSettings />} />
                    <Route path="/branding" element={<AdminBranding />} />
                    <Route path="/games/banners" element={<AdminGameBanners />} />
                    <Route path="/games/manage" element={<AdminManageGames />} />
                    <Route path="/settings/notifications" element={<AdminNotificationSettings />} />
                    
                    {/* Payment Sub Menu */}
                    <Route path="/payments/gateways" element={<AdminGateways />} />
                    <Route path="/payments/deposits/pending" element={<AdminDeposits status="pending" />} />
                    <Route path="/payments/deposits/approved" element={<AdminDeposits status="approved" />} />
                    <Route path="/payments/deposits/all" element={<AdminDeposits status="all" />} />
                    <Route path="/payments/withdraws/pending" element={<AdminWithdraws status="pending" />} />
                    <Route path="/payments/withdraws/approved" element={<AdminWithdraws status="approved" />} />
                    
                    <Route path="*" element={<AdminDashboard />} />
                  </Routes>
                </Suspense>
              </AdminLayout>
            }
          />

          {/* User Auth & Referral Routes */}
          <Route
            path="/auth"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Auth />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Auth defaultMode="login" />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Auth defaultMode="signup" />
              </Suspense>
            }
          />
          <Route
            path="/signup"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Auth defaultMode="signup" />
              </Suspense>
            }
          />
          <Route
            path="/join"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Auth defaultMode="signup" />
              </Suspense>
            }
          />
          <Route
            path="/ref/:refCode"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Auth defaultMode="signup" />
              </Suspense>
            }
          />
          <Route
            path="/referral/:refCode"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Auth defaultMode="signup" />
              </Suspense>
            }
          />
          <Route
            path="/join/:refCode"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Auth defaultMode="signup" />
              </Suspense>
            }
          />

          {/* User App Layout & Protected Routes */}
          <Route
            path="/*"
            element={
              <Layout>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/earnings" element={<Earnings />} />
                    <Route path="/earnings-analytics" element={<EarningsAnalytics />} />
                    <Route path="/earnings-report" element={<EarningsAnalytics />} />
                    <Route path="/plan" element={<Plan />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/games/crash" element={<CrashGame />} />
                    <Route path="/games/slots/super-ace" element={<SuperAce />} />
                    <Route path="/games/slots/fortune-gems" element={<FortuneGems />} />
                    <Route path="/games/mines" element={<Mines />} />
                    <Route path="/games/fly-x" element={<FlyX />} />
                    <Route path="/games/fly_x" element={<FlyX />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/refer" element={<Refer />} />
                    <Route path="/deposit" element={<Deposit />} />
                    <Route path="/withdraw" element={<Withdraw />} />
                    <Route path="/settings" element={<UserSettings />} />
                    <Route path="/help" element={<HelpCenter />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/platform-activity" element={<PlatformActivity />} />
                    <Route path="/recent-activity" element={<PlatformActivity />} />
                  </Routes>
                </Suspense>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
