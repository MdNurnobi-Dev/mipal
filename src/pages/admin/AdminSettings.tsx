import React, { useState, useEffect } from 'react';
import { 
  Save, Coins, DollarSign, Globe, Phone, Mail, MessageCircle, 
  Share2, Shield, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Layers, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function AdminSettings() {
  const { 
    referralSettings, 
    updateReferralSettings,
    refetchData,
    refreshSettings
  } = useApp();

  const { siteSettings, updateSiteSettings } = useSiteSettings();

  const [formData, setFormData] = useState({
    siteName: siteSettings.siteName || 'miPall',
    siteDescription: siteSettings.siteDescription || 'Join miPall, the ultimate mobile-first platform to complete simple micro jobs, refer friends, and earn real rewards seamlessly.',
    currency: siteSettings.currencySymbol || siteSettings.currency || '৳',
    minWithdraw: siteSettings.minWithdraw !== undefined ? siteSettings.minWithdraw : 10,
    minDeposit: siteSettings.minDeposit !== undefined ? siteSettings.minDeposit : 10,
    referrerBonus: referralSettings.referrerBonusAmount ?? 2.50,
    newUserBonus: referralSettings.newUserBonusAmount ?? 1.00,
    depositBonus: referralSettings.depositBonusPercent ?? 5,
    logoUrl: siteSettings.logoUrl || '',
    faviconUrl: siteSettings.faviconUrl || '',
    primaryColor: siteSettings.primaryColor || '#4f46e5',
    supportEmail: siteSettings.supportEmail || 'support@mipall.com',
    supportPhone: siteSettings.supportPhone || '',
    whatsappNumber: siteSettings.whatsappNumber || siteSettings.whatsappUrl || '',
    telegramUrl: siteSettings.telegramUrl || '',
    mobileAppUrl: siteSettings.mobileAppUrl || '',
    facebookUrl: siteSettings.facebookUrl || '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'syncing' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  // Sync state when database loads or external updates occur if form has not been modified
  useEffect(() => {
    if (!isDirty) {
      setFormData({
        siteName: siteSettings.siteName || 'miPall',
        siteDescription: siteSettings.siteDescription || 'Join miPall, the ultimate mobile-first platform to complete simple micro jobs, refer friends, and earn real rewards seamlessly.',
        currency: siteSettings.currencySymbol || siteSettings.currency || '৳',
        minWithdraw: siteSettings.minWithdraw !== undefined ? siteSettings.minWithdraw : 10,
        minDeposit: siteSettings.minDeposit !== undefined ? siteSettings.minDeposit : 10,
        referrerBonus: referralSettings.referrerBonusAmount ?? 2.50,
        newUserBonus: referralSettings.newUserBonusAmount ?? 1.00,
        depositBonus: referralSettings.depositBonusPercent ?? 5,
        logoUrl: siteSettings.logoUrl || '',
        faviconUrl: siteSettings.faviconUrl || '',
        primaryColor: siteSettings.primaryColor || '#4f46e5',
        supportEmail: siteSettings.supportEmail || 'support@mipall.com',
        supportPhone: siteSettings.supportPhone || '',
        whatsappNumber: siteSettings.whatsappNumber || siteSettings.whatsappUrl || '',
        telegramUrl: siteSettings.telegramUrl || '',
        mobileAppUrl: siteSettings.mobileAppUrl || '',
        facebookUrl: siteSettings.facebookUrl || '',
      });
    }
  }, [siteSettings, referralSettings, isDirty]);

  const handleRefreshFromDb = async () => {
    setStatus({ type: 'syncing', message: 'Re-fetching freshest settings from database...' });
    try {
      await refreshSettings();
      setIsDirty(false);
      setStatus({ type: 'success', message: 'Successfully synchronized settings from database!' });
      setTimeout(() => {
        setStatus(prev => prev.type === 'success' ? { type: 'idle' } : prev);
      }, 3000);
    } catch (err: any) {
      console.error('[AdminSettings] Failed to re-fetch settings from database:', err);
      setStatus({ type: 'error', message: 'Failed to re-fetch settings: ' + err.message });
    }
  };

  const currencyPresets = [
    { label: '৳ (Taka)', value: '৳' },
    { label: '$ (Dollar)', value: '$' },
    { label: 'Tk', value: 'Tk ' },
    { label: 'BDT', value: 'BDT ' },
    { label: '€ (Euro)', value: '€' },
    { label: '£ (Pound)', value: '£' },
    { label: '₹ (Rupee)', value: '₹' },
  ];

  const handlePresetCurrency = (sym: string) => {
    setIsDirty(true);
    setFormData(prev => ({ ...prev, currency: sym }));
    if (status.type !== 'idle') setStatus({ type: 'idle' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setIsDirty(true);
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
    if (status.type !== 'idle') setStatus({ type: 'idle' });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatus({ type: 'saving' });

    const startTime = Date.now();
    try {
      // 1. Prepare site settings payload
      const sitePayload = {
        siteName: formData.siteName.trim() || 'miPall',
        siteDescription: formData.siteDescription.trim(),
        currency: formData.currency.trim() || '৳',
        currencySymbol: formData.currency.trim() || '৳',
        minWithdraw: typeof formData.minWithdraw === 'number' ? formData.minWithdraw : parseFloat(formData.minWithdraw as any) || 0,
        minDeposit: typeof formData.minDeposit === 'number' ? formData.minDeposit : parseFloat(formData.minDeposit as any) || 0,
        logoUrl: formData.logoUrl.trim(),
        faviconUrl: formData.faviconUrl.trim(),
        primaryColor: formData.primaryColor.trim() || '#4f46e5',
        supportEmail: formData.supportEmail.trim(),
        supportPhone: formData.supportPhone.trim(),
        whatsappNumber: formData.whatsappNumber.trim(),
        whatsappUrl: formData.whatsappNumber.trim(),
        telegramUrl: formData.telegramUrl.trim(),
        mobileAppUrl: formData.mobileAppUrl?.trim() || '',
        facebookUrl: formData.facebookUrl.trim(),
      };

      // 2. Prepare referral settings payload
      const refPayload = {
        referrerBonusAmount: typeof formData.referrerBonus === 'number' ? formData.referrerBonus : parseFloat(formData.referrerBonus as any) || 0,
        newUserBonusAmount: typeof formData.newUserBonus === 'number' ? formData.newUserBonus : parseFloat(formData.newUserBonus as any) || 0,
        signupBonusAmount: typeof formData.referrerBonus === 'number' ? formData.referrerBonus : parseFloat(formData.referrerBonus as any) || 0,
        depositBonusPercent: typeof formData.depositBonus === 'number' ? formData.depositBonus : parseFloat(formData.depositBonus as any) || 0,
      };

      console.info('[AdminSettings] Dispatching update request to database & AppContext broadcast...', {
        timestamp: new Date().toISOString(),
        sitePayload,
        refPayload
      });

      await Promise.all([
        updateSiteSettings(sitePayload),
        updateReferralSettings(refPayload)
      ]);

      setIsDirty(false);
      const elapsed = Date.now() - startTime;
      console.info(`[AdminSettings] Settings updated and broadcasted globally across all components in ${elapsed}ms.`);

      setStatus({ 
        type: 'success', 
        message: `Settings updated successfully (${elapsed}ms)! Currency '${sitePayload.currencySymbol}' and configuration broadcasted globally.` 
      });

      setTimeout(() => {
        setStatus(prev => prev.type === 'success' ? { type: 'idle' } : prev);
      }, 5000);
    } catch (err: any) {
      console.error('[AdminSettings] Update failed with error:', {
        timestamp: new Date().toISOString(),
        errorMessage: err?.message,
        errorStack: err?.stack,
        formDataSnapshot: formData
      });
      setStatus({ 
        type: 'error', 
        message: err.message || 'Failed to save settings to the database. Please check connection and try again.' 
      });
    }
  };

  const previewCurrency = formData.currency || '৳';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-600" />
            General Settings (মূল সেটিংস ও কারেন্সি)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure currency symbol, withdrawal/deposit limits, referral rewards, and website branding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshFromDb}
            disabled={status.type === 'saving' || status.type === 'syncing'}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Re-fetch freshest settings from PostgreSQL database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status.type === 'syncing' ? 'animate-spin text-indigo-600' : ''}`} />
            Sync from DB
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={status.type === 'saving' || status.type === 'syncing'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {status.type === 'saving' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving to Database...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating / Top Notification Messages */}
      {status.type === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">Settings Saved Successfully!</h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">{status.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setStatus({ type: 'idle' })}
            className="text-emerald-500 hover:text-emerald-800 p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {status.type === 'error' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-3 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">Failed to Save Settings</h4>
            <p className="text-[11px] text-rose-700 mt-0.5">{status.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setStatus({ type: 'idle' })}
            className="text-rose-500 hover:text-rose-800 p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Financial & Currency Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Financial & Currency Configuration (কারেন্সি ও অর্থনৈতিক লিমিট)
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live Propagation Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Currency Symbol with Presets */}
            <div className="space-y-2 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Currency Symbol / সাইটের মুদ্রা সংকেত (e.g. ৳, $, Tk, BDT, €)
              </label>
              
              {/* Quick Preset Chips */}
              <div className="flex flex-wrap gap-2 pt-1 pb-2">
                <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Quick Select:</span>
                {currencyPresets.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetCurrency(preset.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      formData.currency === preset.value
                        ? 'bg-indigo-600 text-white shadow-xs scale-105'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  placeholder="e.g. ৳ or $ or Tk"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500">
                This symbol will instantly appear in all user wallets, earnings, plans, deposits, withdrawals, and transactions.
              </p>
            </div>

            {/* Min Withdrawal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Minimum Withdrawal ({previewCurrency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {previewCurrency}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="minWithdraw"
                  value={formData.minWithdraw}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Users cannot request withdrawal below this amount.</p>
            </div>

            {/* Min Deposit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Minimum Deposit ({previewCurrency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {previewCurrency}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="minDeposit"
                  value={formData.minDeposit}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Minimum amount allowed for deposit transactions.</p>
            </div>

            {/* Referrer Signup Bonus */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Referrer Reward ({previewCurrency} প্রতি রেফারে)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {previewCurrency}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="referrerBonus"
                  value={formData.referrerBonus}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Bonus given to the user who invites a friend.</p>
            </div>

            {/* New User Welcome Bonus */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New User Welcome Bonus ({previewCurrency} নতুন ইউজারের বোনাস)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {previewCurrency}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="newUserBonus"
                  value={formData.newUserBonus}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Bonus automatically credited to newly registered users.</p>
            </div>

            {/* Deposit Commission */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Referral Deposit Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  name="depositBonus"
                  value={formData.depositBonus}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Percentage commission referrer gets when their referral deposits.</p>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Live UI Rendering Preview (ইউজার প্যানেলে যেমন দেখাবে)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center mt-3">
              <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-xs">
                <span className="text-[10px] text-indigo-200 block">User Balance</span>
                <span className="text-sm font-black text-white">{previewCurrency}1,500.00</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-xs">
                <span className="text-[10px] text-indigo-200 block">Min Deposit</span>
                <span className="text-sm font-black text-emerald-300">{previewCurrency}{Number(formData.minDeposit || 0).toFixed(2)}</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-xs">
                <span className="text-[10px] text-indigo-200 block">Min Withdraw</span>
                <span className="text-sm font-black text-amber-300">{previewCurrency}{Number(formData.minWithdraw || 0).toFixed(2)}</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-xs">
                <span className="text-[10px] text-indigo-200 block">Referral Bonus</span>
                <span className="text-sm font-black text-cyan-300">{previewCurrency}{Number(formData.referrerBonus || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Site Identity & Branding */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Site Identity & Branding (সাইটের পরিচিতি ও ব্র্যান্ডিং)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Site Name (সাইটের নাম)</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="e.g. miPall"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Theme Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="h-8 w-10 rounded-lg border border-slate-200 p-0.5 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  placeholder="#4f46e5"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Site Tagline / Description</label>
              <textarea
                name="siteDescription"
                value={formData.siteDescription}
                onChange={handleChange}
                rows={2}
                placeholder="Short description displayed on headers and meta info..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Custom Logo URL (Optional)</label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Favicon URL (Optional)</label>
              <input
                type="url"
                name="faviconUrl"
                value={formData.faviconUrl}
                onChange={handleChange}
                placeholder="https://example.com/favicon.ico"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Customer Support & Social Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              Customer Support & Contact Channels (সাপোর্ট ও যোগাযোগ)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="supportEmail"
                  value={formData.supportEmail}
                  onChange={handleChange}
                  placeholder="support@mipall.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Number / Link</label>
              <div className="relative">
                <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="text"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+8801XXXXXXXXX or https://wa.me/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile App APK URL</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                <input
                  type="text"
                  name="mobileAppUrl"
                  value={formData.mobileAppUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/app.apk"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Telegram Support Channel / Link</label>
              <div className="relative">
                <Share2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                <input
                  type="text"
                  name="telegramUrl"
                  value={formData.telegramUrl}
                  onChange={handleChange}
                  placeholder="https://t.me/yourchannel"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Facebook Page URL</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                <input
                  type="text"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={status.type === 'saving'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {status.type === 'saving' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save All Settings (সব আপডেট সেভ করুন)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
