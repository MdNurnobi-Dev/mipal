import React, { useState } from 'react';
import { 
  User as UserIcon, Mail, Copy, Check, Bell, Key, Settings, 
  Share2, Shield, Zap, Edit2, Wallet, Target, X, CheckCircle2, 
  Camera, Phone, ExternalLink, ArrowRight, Eye, EyeOff, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import AvatarEditModal from '../components/AvatarEditModal';

export default function Profile() {
  const { currentUser, plans, transactions, updateUserProfile, referralSettings, addNotification } = useApp();
  const { formatCurrency } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form
  const [editForm, setEditForm] = useState({ 
    name: currentUser.name, 
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    bio: currentUser.bio || '' 
  });

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordState, setPasswordState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const activePlan = plans.find(p => p.id === currentUser.activePlanId);
  const referrerBonus = referralSettings?.referrerBonusAmount ?? 2.50;

  // Stats calculation
  const userTransactions = transactions.filter(tx => tx.userId === currentUser.id);
  const tasksCompleted = userTransactions.filter(tx => tx.type === 'task_earning').length;
  const totalWithdrawn = userTransactions.filter(tx => tx.type === 'withdraw' && tx.status === 'approved').reduce((sum, tx) => sum + tx.amount, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = () => {
    if (currentUser.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopied(true);
      showToast('Referral code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/auth?ref=${currentUser.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join MicroJob and Earn Daily!',
          text: `Use my referral code ${currentUser.referralCode} to get a welcome bonus!`,
          url: shareUrl,
        });
      } catch {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
        showToast('Referral link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('Referral link copied to clipboard!');
    }
  };

  const handleToggleNotification = (key: 'email' | 'push') => {
    const currentSettings = currentUser.notifications || { email: true, push: false };
    const updated = { ...currentSettings, [key]: !currentSettings[key] };
    updateUserProfile(currentUser.id, {
      notifications: updated
    });
    showToast(`${key === 'email' ? 'Email' : 'Push'} notifications ${updated[key] ? 'enabled' : 'disabled'}`);
  };

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      showToast('Name cannot be empty.');
      return;
    }
    updateUserProfile(currentUser.id, { 
      name: editForm.name.trim(), 
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      bio: editForm.bio.trim() 
    });
    setIsEditing(false);
    showToast('Profile updated successfully!');
  };

  const handleSaveAvatar = (newAvatarUrl: string) => {
    updateUserProfile(currentUser.id, { avatar: newAvatarUrl });
    showToast('Profile photo updated successfully!');
    addNotification({
      userId: currentUser.id,
      title: 'Profile Photo Changed',
      message: 'Your profile picture has been successfully updated.',
      type: 'general'
    });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordState('loading');
    setTimeout(() => {
      updateUserProfile(currentUser.id, { password: newPassword });
      setPasswordState('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!');
      setTimeout(() => setPasswordState('idle'), 3000);
    }, 800);
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

      {/* Profile Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
        {activePlan ? (
          <Link 
            to="/plan" 
            className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-indigo-700 text-white px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-opacity"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="text-[10px] font-bold tracking-wide uppercase">{activePlan.name}</span>
          </Link>
        ) : (
          <Link 
            to="/plan" 
            className="absolute top-0 right-0 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-bl-xl flex items-center gap-1 text-[10px] font-bold hover:bg-slate-200 transition-colors"
          >
            <span>Free Tier</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </Link>
        )}
        
        {/* Profile Avatar with Photo Edit Trigger */}
        <div className="relative mb-3 mt-3">
          <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden ring-2 ring-slate-100">
            <img 
              src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`;
              }}
            />
          </div>
          <button 
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-md transition-all hover:scale-105 active:scale-95 border-2 border-white cursor-pointer"
            title="Change Profile Photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {isEditing ? (
          <div className="w-full space-y-3 mt-2 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={editForm.name} 
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={editForm.email} 
                onChange={e => setEditForm({...editForm, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="Email Address"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={editForm.phone} 
                onChange={e => setEditForm({...editForm, phone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Bio / About</label>
              <textarea 
                value={editForm.bio} 
                onChange={e => setEditForm({...editForm, bio: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none h-16 font-normal"
                placeholder="Tell something about yourself..."
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button 
                type="button"
                onClick={() => setIsEditing(false)} 
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveProfile} 
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mt-1">
              <h2 className="text-lg font-bold text-slate-800">{currentUser.name}</h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> {currentUser.email || 'No email provided'}
            </p>
            {currentUser.phone && (
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> {currentUser.phone}
              </p>
            )}
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 w-full mt-1">
              {currentUser.bio || "No bio added yet. Click edit profile to add one."}
            </p>
            
            <div className="flex items-center gap-2 mt-3 w-full">
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button 
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" /> Change Photo
              </button>
            </div>
          </>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-black text-slate-800">{formatCurrency(currentUser.balance)}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Balance</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-black text-slate-800">{tasksCompleted}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tasks Done</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-center items-center text-center">
          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-black text-slate-800">{formatCurrency(totalWithdrawn)}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Withdrawn</span>
        </div>
      </div>

      {/* Referral Program Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 rounded-2xl shadow-xs relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div className="flex items-center justify-between mb-1 relative z-10">
          <h3 className="font-bold text-xs flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-indigo-200" /> Invite & Earn Rewards
          </h3>
          <Link to="/refer" className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full font-semibold transition-colors flex items-center gap-1">
            View Details <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
        <p className="text-indigo-100 text-[11px] mb-3 relative z-10 leading-relaxed">
          Share your referral code. Get <strong className="text-white font-bold">{formatCurrency(referrerBonus)}</strong> for each friend!
        </p>
        
        <div className="relative z-10 bg-white/10 p-1 rounded-xl flex items-center backdrop-blur-sm border border-white/20">
          <div className="flex-1 px-3 font-mono font-bold tracking-widest text-xs text-white">
            {currentUser.referralCode}
          </div>
          <button 
            type="button"
            onClick={handleCopy}
            className="p-1.5 bg-white text-indigo-600 rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <button 
          type="button"
          onClick={handleShare}
          className="w-full mt-2.5 py-1.5 bg-indigo-900/40 hover:bg-indigo-900/60 text-white rounded-xl text-xs font-semibold transition-colors border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-3 h-3" /> Share Referral Link
        </button>
      </div>

      {/* Account Settings & Preferences */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-indigo-600" /> Preferences & Security
          </h3>
          <Link to="/settings" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            All Settings <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Notification Switches */}
        <div>
          <h4 className="font-bold text-slate-700 flex items-center gap-1.5 mb-2.5 text-xs">
            <Bell className="w-3.5 h-3.5 text-indigo-500" /> Notification Alerts
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-700">Email Notifications</p>
                <p className="text-[9px] text-slate-400">Receive earnings & withdrawal updates</p>
              </div>
              <button 
                type="button"
                onClick={() => handleToggleNotification('email')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${currentUser.notifications?.email ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${currentUser.notifications?.email ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-700">Push Notifications</p>
                <p className="text-[9px] text-slate-400">Receive instant alerts on your screen</p>
              </div>
              <button 
                type="button"
                onClick={() => handleToggleNotification('push')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${currentUser.notifications?.push ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${currentUser.notifications?.push ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="pt-3 border-t border-slate-100">
          <h4 className="font-bold text-slate-700 flex items-center gap-1.5 mb-2.5 text-xs">
            <Shield className="w-3.5 h-3.5 text-indigo-500" /> Update Password
          </h4>
          
          {passwordError && (
            <div className="p-2 mb-2 bg-red-50 text-red-700 rounded-lg text-[10px] font-semibold border border-red-200">
              {passwordError}
            </div>
          )}

          <form className="space-y-2" onSubmit={handlePasswordUpdate}>
            <div className="relative">
              <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-9 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="relative">
              <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password (min 6 chars)" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-9 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
              />
            </div>
            <div className="relative">
              <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-9 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
              />
            </div>
            <button 
              type="submit" 
              disabled={passwordState === 'loading'}
              className={`w-full font-bold py-2 rounded-xl transition-all text-xs mt-2 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs
                ${passwordState === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'}
              `}
            >
              {passwordState === 'idle' && 'Save New Password'}
              {passwordState === 'loading' && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {passwordState === 'success' && <><CheckCircle2 className="w-3.5 h-3.5" /> Password Updated</>}
            </button>
          </form>
        </div>
      </div>

      {/* Avatar Edit Modal */}
      <AvatarEditModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentUser.avatar}
        userName={currentUser.name}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
}
