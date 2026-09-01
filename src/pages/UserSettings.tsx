import React, { useState } from 'react';
import { 
  Bell, Lock, Globe, Shield, Moon, Sun, ChevronRight, LogOut, 
  Info, Camera, Check, Copy, CheckCircle2, AlertCircle, X, 
  Key, ShieldCheck, Smartphone, Eye, EyeOff, HelpCircle, ExternalLink,
  MessageCircle, Mail, Phone, RefreshCw, UserCheck
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AvatarEditModal from '../components/AvatarEditModal';

const LANGUAGES = [
  { code: 'en', name: 'English (US)', native: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
];

export default function UserSettings() {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, siteSettings, addNotification } = useApp();

  if (!currentUser) return null;

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Password Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // 2FA State
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret] = useState('JBSWY3DPEHPK3PXP');
  const [secretCopied, setSecretCopied] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');

  // Notifications State (Local / App sync)
  const notifications = {
    push: currentUser.notifications?.push ?? false,
    email: currentUser.notifications?.email ?? true,
    promo: currentUser.notifications?.promo ?? true,
  };

  // Dark mode & language from user profile
  const isDarkMode = currentUser.theme === 'dark';
  const currentLangCode = currentUser.language || 'en';
  const currentLanguage = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Avatar update
  const handleSaveAvatar = (newAvatarUrl: string) => {
    updateUserProfile(currentUser.id, { avatar: newAvatarUrl });
    showToast('Profile photo updated successfully!');
    addNotification({
      userId: currentUser.id,
      title: 'Profile Photo Updated',
      message: 'Your profile avatar has been successfully changed.',
      type: 'general'
    });
  };

  // Toggle notification preferences
  const toggleNotif = (key: 'push' | 'email' | 'promo') => {
    const updated = { ...notifications, [key]: !notifications[key] };
    updateUserProfile(currentUser.id, {
      notifications: updated
    });
    showToast(`${key === 'push' ? 'Push' : key === 'email' ? 'Email' : 'Marketing'} alerts ${updated[key] ? 'enabled' : 'disabled'}`);

    if (key === 'push' && updated.push && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  };

  // Toggle Theme / Dark mode
  const toggleDarkMode = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    updateUserProfile(currentUser.id, { theme: nextTheme });
    showToast(`Switched to ${nextTheme} theme`);
    
    // Toggle class on document body or root
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Change Language
  const selectLanguage = (code: string) => {
    updateUserProfile(currentUser.id, { language: code });
    setIsLanguageModalOpen(false);
    const langObj = LANGUAGES.find(l => l.code === code);
    showToast(`Language changed to ${langObj?.name || code}`);
  };

  // Password Submit
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    setTimeout(() => {
      updateUserProfile(currentUser.id, { password: newPass });
      setPassLoading(false);
      setIsPasswordModalOpen(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      showToast('Password changed successfully!');
      addNotification({
        userId: currentUser.id,
        title: 'Security Alert: Password Changed',
        message: 'Your account password was updated successfully.',
        type: 'system'
      });
    }, 600);
  };

  // 2FA Toggle/Verify
  const handleToggle2FA = (enable: boolean) => {
    if (!enable) {
      updateUserProfile(currentUser.id, { twoFactorEnabled: false });
      setIs2FAModalOpen(false);
      showToast('Two-Factor Authentication disabled');
      return;
    }

    if (twoFactorCode.trim().length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit authentication code.');
      return;
    }

    updateUserProfile(currentUser.id, { twoFactorEnabled: true });
    setIs2FAModalOpen(false);
    setTwoFactorCode('');
    setTwoFactorError('');
    showToast('Two-Factor Authentication enabled successfully!');
    addNotification({
      userId: currentUser.id,
      title: '2FA Enabled',
      message: 'Two-Factor Authentication is now protecting your account.',
      type: 'system'
    });
  };

  const copy2FASecret = () => {
    navigator.clipboard.writeText(twoFactorSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  // Sign out
  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
    showToast('Signed out successfully');
    setTimeout(() => {
      navigate('/auth');
    }, 400);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Profile Summary with Avatar Edit */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm ring-2 ring-indigo-500/20">
              <img 
                src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`;
                }}
              />
            </div>
            <button 
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md transition-all active:scale-95 border-2 border-white cursor-pointer"
              title="Update profile photo"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-800">{currentUser.name}</h2>
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{currentUser.email || 'No email set'}</p>
            <p className="text-[10px] text-indigo-600 font-mono font-semibold mt-0.5">
              Ref: {currentUser.referralCode}
            </p>
          </div>
        </div>

        <Link
          to="/profile"
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
        >
          Profile <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      <div className="space-y-3">
        {/* Account Security Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" /> Security & Login
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {/* Change Password Button */}
            <button 
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Change Password</p>
                  <p className="text-[10px] text-slate-500">Update and secure your account credentials</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* 2FA Button */}
            <button 
              type="button"
              onClick={() => setIs2FAModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Two-Factor Authentication (2FA)</p>
                  <p className="text-[10px] text-slate-500">Add an authenticator security layer</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentUser.twoFactorEnabled 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {currentUser.twoFactorEnabled ? 'Enabled' : 'Off'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-600" /> Notification Preferences
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Push Notifications</p>
                  <p className="text-[10px] text-slate-500">Receive instant earnings & job alerts</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => toggleNotif('push')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${notifications.push ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifications.push ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Email Notifications</p>
                  <p className="text-[10px] text-slate-500">Receive transaction statements via email</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => toggleNotif('email')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${notifications.email ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifications.email ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Promotional Alerts */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Promotions & Giveaways</p>
                  <p className="text-[10px] text-slate-500">Alerts about new high-earning tasks</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => toggleNotif('promo')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${notifications.promo ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifications.promo ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Display & App Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" /> App & Display Settings
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {/* Language Selector */}
            <button 
              type="button"
              onClick={() => setIsLanguageModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Language (ভাষা)</p>
                  <p className="text-[10px] text-slate-500">{currentLanguage.flag} {currentLanguage.name} ({currentLanguage.native})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                  {currentLanguage.name}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  {isDarkMode ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Dark Mode</p>
                  <p className="text-[10px] text-slate-500">{isDarkMode ? 'Dark theme active' : 'Light theme active'}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={toggleDarkMode}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Support & About */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            <Link 
              to="/help"
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Help & Support Center</p>
                  <p className="text-[10px] text-slate-500">FAQ, user guides & direct assistance</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <button 
              type="button"
              onClick={() => setIsAboutModalOpen(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">About {siteSettings.siteName}</p>
                  <p className="text-[10px] text-slate-500">Version 1.0.0 & Legal Terms</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Sign Out Action */}
        <div className="pt-2">
          <button 
            type="button"
            onClick={() => setIsSignOutModalOpen(true)}
            className="w-full bg-white border border-red-200 text-red-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors text-xs shadow-xs active:scale-98 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out from Account
          </button>
        </div>
      </div>

      {/* 1. Avatar Edit Modal */}
      <AvatarEditModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentUser.avatar}
        userName={currentUser.name}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* 2. Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Change Password</h3>
                  <p className="text-[11px] text-slate-500">Enter a secure new password</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-3.5">
              {passError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type={showPass ? 'text' : 'password'}
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-9 outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-9 outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type={showPass ? 'text' : 'password'}
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-9 outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {passLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Save Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Two-Factor Authentication Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Two-Factor Authentication (2FA)</h3>
                  <p className="text-[11px] text-slate-500">Google Authenticator or Authy</p>
                </div>
              </div>
              <button 
                onClick={() => setIs2FAModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {currentUser.twoFactorEnabled ? (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">2FA is Currently Active</h4>
                    <p className="text-xs text-slate-500 mt-1">Your account is secured with 2FA verification codes during sign-in.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle2FA(false)}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-colors border border-red-200"
                  >
                    Disable Two-Factor Authentication
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Scan this QR code with Google Authenticator, or manually enter the secret key below:
                  </p>

                  {/* Mock QR display */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 bg-white p-2 border border-slate-300 rounded-lg flex items-center justify-center shadow-xs">
                      {/* Stylized QR representation */}
                      <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 bg-slate-900 rounded">
                        <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs col-span-3"></div>
                        <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                        <div className="bg-white rounded-xs"></div>
                        <div className="bg-white rounded-xs col-span-2 row-span-2"></div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 font-mono">Scan in Authenticator App</span>
                  </div>

                  {/* Secret Key with copy */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Manual Setup Key</label>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                      <span className="font-mono text-xs font-bold text-slate-800 flex-1 tracking-wider">{twoFactorSecret}</span>
                      <button
                        type="button"
                        onClick={copy2FASecret}
                        className="px-2 py-1 bg-white border border-slate-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center gap-1"
                      >
                        {secretCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {secretCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* 6 digit code input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit Code to Activate</label>
                    <input 
                      type="text"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-center text-base font-mono tracking-widest font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {twoFactorError && (
                      <p className="text-[10px] text-red-500 mt-1 font-medium">{twoFactorError}</p>
                    )}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIs2FAModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle2FA(true)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Verify & Enable
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Language Selection Modal */}
      {isLanguageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Select Language (ভাষা নির্বাচন)</h3>
                  <p className="text-[11px] text-slate-500">Choose your preferred app language</p>
                </div>
              </div>
              <button 
                onClick={() => setIsLanguageModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {LANGUAGES.map((lang) => {
                const isSelected = currentLangCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => selectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-indigo-50/80 text-indigo-900 font-bold' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <p className="text-xs font-bold">{lang.name}</p>
                        <p className="text-[10px] text-slate-500">{lang.native}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLanguageModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. About App Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">About {siteSettings.siteName}</h3>
                  <p className="text-[11px] text-slate-500">Platform information & legal</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAboutModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed no-scrollbar">
              <div className="text-center py-2">
                {siteSettings.logoUrl ? (
                  <img src={siteSettings.logoUrl} alt={siteSettings.siteName} className="h-10 mx-auto mb-2 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 font-black text-lg shadow-sm">
                    {siteSettings.siteName.charAt(0)}
                  </div>
                )}
                <h4 className="font-bold text-sm text-slate-800">{siteSettings.siteName}</h4>
                <p className="text-[11px] text-slate-500">{siteSettings.siteDescription}</p>
                <span className="inline-block mt-1 text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                  Version 1.0.0 (Production Release)
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                <h5 className="font-bold text-slate-800 text-xs">Official Support Contacts</h5>
                {siteSettings.supportEmail && (
                  <p className="text-[11px] flex items-center gap-1.5 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email: <strong>{siteSettings.supportEmail}</strong></span>
                  </p>
                )}
                {siteSettings.supportPhone && (
                  <p className="text-[11px] flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone: <strong>{siteSettings.supportPhone}</strong></span>
                  </p>
                )}
                {siteSettings.whatsappNumber && (
                  <p className="text-[11px] flex items-center gap-1.5 text-emerald-700">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>WhatsApp: <strong>{siteSettings.whatsappNumber}</strong></span>
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <h5 className="font-bold text-slate-800 text-xs">Terms & Privacy Summary</h5>
                <p className="text-[11px] text-slate-500 leading-normal">
                  All task earnings, referral rewards, deposits, and withdrawal requests are processed in accordance with our fair-use policy. User accounts with suspicious spam activity may be subject to review.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Sign Out Confirmation Modal */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Sign Out from Account?</h3>
              <p className="text-xs text-slate-500 mt-1">You will need to sign in again with your credentials.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
