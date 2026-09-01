/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import Home from './pages/Home';
import Earnings from './pages/Earnings';
import EarningsAnalytics from './pages/EarningsAnalytics';
import Plan from './pages/Plan';
import Wallet from './pages/Wallet';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Refer from './pages/Refer';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminGiveaway from './pages/admin/AdminGiveaway';
import AdminDailyReward from './pages/admin/AdminDailyReward';
import AdminTasks from './pages/admin/AdminTasks';
import AdminPlans from './pages/admin/AdminPlans';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminPosts from './pages/admin/AdminPosts';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotificationSettings from './pages/admin/AdminNotificationSettings';
import AdminBranding from './pages/admin/AdminBranding';
import AdminGateways from './pages/admin/payment/AdminGateways';
import AdminDeposits from './pages/admin/payment/AdminDeposits';
import AdminWithdraws from './pages/admin/payment/AdminWithdraws';

import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import UserSettings from './pages/UserSettings';
import HelpCenter from './pages/HelpCenter';
import Notifications from './pages/Notifications';
import PlatformActivity from './pages/PlatformActivity';

import { AppProvider, useApp } from './context/AppContext';
import { useEffect } from 'react';

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
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
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
            </AdminLayout>
          }
        />

        {/* User Auth & Referral Routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth defaultMode="login" />} />
        <Route path="/register" element={<Auth defaultMode="signup" />} />
        <Route path="/signup" element={<Auth defaultMode="signup" />} />
        <Route path="/join" element={<Auth defaultMode="signup" />} />
        <Route path="/ref/:refCode" element={<Auth defaultMode="signup" />} />
        <Route path="/referral/:refCode" element={<Auth defaultMode="signup" />} />
        <Route path="/join/:refCode" element={<Auth defaultMode="signup" />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/earnings" element={<Earnings />} />
                <Route path="/earnings-analytics" element={<EarningsAnalytics />} />
                <Route path="/earnings-report" element={<EarningsAnalytics />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/wallet" element={<Wallet />} />
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
            </Layout>
          }
        />
      </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
