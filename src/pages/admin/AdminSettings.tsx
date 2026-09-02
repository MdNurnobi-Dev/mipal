import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  Coins, 
  DollarSign, 
  Globe, 
  Phone, 
  Mail, 
  MessageCircle, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Search, 
  X, 
  Sliders, 
  Gift, 
  HelpCircle,
  Smartphone,
  ExternalLink,
  Layers,
  Palette,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

type SettingsGroup = 'all' | 'financial' | 'referral' | 'branding' | 'support';

export default function AdminSettings() {
  const { 
    referralSettings, 
    updateReferralSettings, 
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<SettingsGroup>('all');
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
      setStatus({ type: 'success', message: 'Settings synchronized from PostgreSQL database.' });
      setTimeout(() => {
        setStatus(prev => prev.type === 'success' ? { type: 'idle' } : prev);
      }, 3000);
    } catch (err: any) {
      console.error('[AdminSettings] Failed to sync from database:', err);
      setStatus({ type: 'error', message: 'Failed to re-fetch settings: ' + err.message });
    }
  };

  const currencyPresets = [
    { label: '৳ Taka', value: '৳' },
    { label: '$ Dollar', value: '$' },
    { label: 'Tk', value: 'Tk ' },
    { label: 'BDT', value: 'BDT ' },
    { label: '€ Euro', value: '€' },
    { label: '£ Pound', value: '£' },
    { label: '₹ Rupee', value: '₹' },
    { label: '₱ Peso', value: '₱' },
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

      const refPayload = {
        referrerBonusAmount: typeof formData.referrerBonus === 'number' ? formData.referrerBonus : parseFloat(formData.referrerBonus as any) || 0,
        newUserBonusAmount: typeof formData.newUserBonus === 'number' ? formData.newUserBonus : parseFloat(formData.newUserBonus as any) || 0,
        signupBonusAmount: typeof formData.referrerBonus === 'number' ? formData.referrerBonus : parseFloat(formData.referrerBonus as any) || 0,
        depositBonusPercent: typeof formData.depositBonus === 'number' ? formData.depositBonus : parseFloat(formData.depositBonus as any) || 0,
      };

      await Promise.all([
        updateSiteSettings(sitePayload),
        updateReferralSettings(refPayload)
      ]);

      setIsDirty(false);
      const elapsed = Date.now() - startTime;

      setStatus({ 
        type: 'success', 
        message: `Settings saved successfully in ${elapsed}ms! Currency '${sitePayload.currencySymbol}' broadcasted.` 
      });

      setTimeout(() => {
        setStatus(prev => prev.type === 'success' ? { type: 'idle' } : prev);
      }, 4000);
    } catch (err: any) {
      console.error('[AdminSettings] Update failed:', err);
      setStatus({ 
        type: 'error', 
        message: err.message || 'Failed to save settings to database.' 
      });
    }
  };

  const previewCurrency = formData.currency || '৳';

  // Group definitions for filtering & search
  const groups = [
    { id: 'all' as const, label: 'All Settings', icon: Sliders, count: 12 },
    { id: 'financial' as const, label: 'Financial & Limits', icon: DollarSign, count: 3 },
    { id: 'referral' as const, label: 'Rewards & Referrals', icon: Gift, count: 3 },
    { id: 'branding' as const, label: 'Identity & Theme', icon: Palette, count: 4 },
    { id: 'support' as const, label: 'Support & Channels', icon: Phone, count: 5 },
  ];

  // Search filter helper
  const searchLower = searchQuery.toLowerCase().trim();

  const isFinancialVisible = useMemo(() => {
    if (activeGroup !== 'all' && activeGroup !== 'financial') return false;
    if (!searchLower) return true;
    const keywords = ['currency', 'symbol', 'taka', 'dollar', 'withdraw', 'deposit', 'limit', 'financial', 'bdt', 'tk', 'money', 'balance', 'কারেন্সি'];
    return keywords.some(k => k.includes(searchLower) || searchLower.includes(k));
  }, [activeGroup, searchLower]);

  const isReferralVisible = useMemo(() => {
    if (activeGroup !== 'all' && activeGroup !== 'referral') return false;
    if (!searchLower) return true;
    const keywords = ['referral', 'reward', 'bonus', 'commission', 'invite', 'friend', 'welcome', 'signup', 'বোনাস', 'রেফার'];
    return keywords.some(k => k.includes(searchLower) || searchLower.includes(k));
  }, [activeGroup, searchLower]);

  const isBrandingVisible = useMemo(() => {
    if (activeGroup !== 'all' && activeGroup !== 'branding') return false;
    if (!searchLower) return true;
    const keywords = ['brand', 'name', 'site', 'logo', 'favicon', 'color', 'theme', 'tagline', 'description', 'লোগো', 'নাম'];
    return keywords.some(k => k.includes(searchLower) || searchLower.includes(k));
  }, [activeGroup, searchLower]);

  const isSupportVisible = useMemo(() => {
    if (activeGroup !== 'all' && activeGroup !== 'support') return false;
    if (!searchLower) return true;
    const keywords = ['support', 'email', 'phone', 'whatsapp', 'telegram', 'apk', 'mobile', 'facebook', 'contact', 'চ্যানেল', 'সাপোর্ট', 'হেল্প'];
    return keywords.some(k => k.includes(searchLower) || searchLower.includes(k));
  }, [activeGroup, searchLower]);

  const noResultsFound = !isFinancialVisible && !isReferralVisible && !isBrandingVisible && !isSupportVisible;

  return (
    <div className="space-y-2.5 max-w-6xl mx-auto pb-10 font-sans text-slate-800">
      {/* 1. Header Toolbar (Ultra-Compact Light) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs font-semibold text-slate-800 tracking-tight leading-none">General System Settings</h1>
              <span className="inline-flex items-center gap-1 text-[9px] font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
              {isDirty && (
                <span className="text-[9px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200/60">
                  Unsaved Changes
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Configure currency, financial limits, referral bonuses, identity & support channels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={handleRefreshFromDb}
            disabled={status.type === 'saving' || status.type === 'syncing'}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
            title="Re-fetch freshest settings from database"
          >
            <RefreshCw className={`w-3 h-3 ${status.type === 'syncing' ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            <span>{status.type === 'syncing' ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={status.type === 'saving' || status.type === 'syncing'}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {status.type === 'saving' ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Status Alert Bar */}
      {status.type === 'success' && (
        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <p className="text-[11px] font-medium text-emerald-800 truncate">{status.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setStatus({ type: 'idle' })}
            className="text-emerald-500 hover:text-emerald-800 p-0.5 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {status.type === 'error' && (
        <div className="px-3 py-2 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <p className="text-[11px] font-medium text-rose-800 truncate">{status.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setStatus({ type: 'idle' })}
            className="text-rose-500 hover:text-rose-800 p-0.5 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. Search Bar & Group Filter Strip */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings by keyword (e.g. currency, deposit, bonus, logo, telegram)..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50/70 border border-slate-200/70 rounded-lg text-[11px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Group Tabs Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {groups.map((g) => {
            const Icon = g.icon;
            const isSelected = activeGroup === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setActiveGroup(g.id);
                  if (searchQuery) setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3 h-3 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Settings Form Sections */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* No Results Found */}
        {noResultsFound && (
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 text-center space-y-1.5 shadow-2xs">
            <HelpCircle className="w-6 h-6 text-slate-400 mx-auto" />
            <h3 className="text-xs font-semibold text-slate-700">No settings found matching "{searchQuery}"</h3>
            <p className="text-[10px] text-slate-400">Try searching for currency, limits, bonuses, branding, or support.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveGroup('all');
              }}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Clear search & view all
            </button>
          </div>
        )}

        {/* Group 1: Financial & Currency Limits */}
        {isFinancialVisible && (
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <DollarSign className="w-3 h-3" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-800">Financial & Currency Limits</h2>
                  <p className="text-[9px] text-slate-400">Global currency symbol, minimum deposit & withdrawal thresholds</p>
                </div>
              </div>
              <span className="text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                Live Sync
              </span>
            </div>

            {/* Currency Symbol Box with Presets */}
            <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-[11px] font-medium text-slate-700">
                  Platform Currency Symbol / সাইটের মুদ্রা প্রতীক
                </label>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[9px] text-slate-400 font-medium">Presets:</span>
                  {currencyPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handlePresetCurrency(preset.value)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                        formData.currency === preset.value
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    placeholder="e.g. ৳ or $"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 shadow-2xs"
                    required
                  />
                </div>
                <div className="sm:col-span-2 text-[10px] text-slate-500 leading-tight">
                  This symbol immediately propagates across all wallets, deposits, plans, games, and withdrawal requests.
                </div>
              </div>
            </div>

            {/* Thresholds Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Min Withdrawal */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Minimum Withdrawal Limit ({previewCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[11px]">
                    {previewCurrency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="minWithdraw"
                    value={formData.minWithdraw}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                    required
                  />
                </div>
                <p className="text-[9px] text-slate-400">Users cannot place withdrawals below this threshold.</p>
              </div>

              {/* Min Deposit */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Minimum Deposit Limit ({previewCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[11px]">
                    {previewCurrency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="minDeposit"
                    value={formData.minDeposit}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                    required
                  />
                </div>
                <p className="text-[9px] text-slate-400">Minimum amount required when creating deposit tickets.</p>
              </div>
            </div>

            {/* Light Live Preview Strip */}
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-lg p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-medium text-slate-700">Live User Portal Preview:</span>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-center">
                <div className="bg-white px-2 py-1 rounded border border-slate-200/60 shadow-2xs">
                  <span className="text-[8px] text-slate-400 block uppercase">Min Deposit</span>
                  <span className="text-[11px] font-semibold text-emerald-600">{previewCurrency}{Number(formData.minDeposit || 0).toFixed(2)}</span>
                </div>
                <div className="bg-white px-2 py-1 rounded border border-slate-200/60 shadow-2xs">
                  <span className="text-[8px] text-slate-400 block uppercase">Min Withdraw</span>
                  <span className="text-[11px] font-semibold text-purple-600">{previewCurrency}{Number(formData.minWithdraw || 0).toFixed(2)}</span>
                </div>
                <div className="bg-white px-2 py-1 rounded border border-slate-200/60 shadow-2xs">
                  <span className="text-[8px] text-slate-400 block uppercase">Sample Balance</span>
                  <span className="text-[11px] font-semibold text-indigo-600">{previewCurrency}500.00</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Group 2: Referral & Reward Bonuses */}
        {isReferralVisible && (
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Gift className="w-3 h-3" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-800">Referral & Bonus Rewards</h2>
                  <p className="text-[9px] text-slate-400">Manage inviter bonuses, welcome rewards, and deposit commissions</p>
                </div>
              </div>
              <span className="text-[9px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60 px-1.5 py-0.2 rounded">
                Auto-Credit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Referrer Bonus */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  Referrer Reward ({previewCurrency} প্রতি রেফারে)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[11px]">
                    {previewCurrency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="referrerBonus"
                    value={formData.referrerBonus}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                  />
                </div>
                <p className="text-[9px] text-slate-400">Bonus credited to referrer upon successful invite.</p>
              </div>

              {/* Welcome Bonus */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
                  New User Welcome Bonus ({previewCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[11px]">
                    {previewCurrency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="newUserBonus"
                    value={formData.newUserBonus}
                    onChange={handleChange}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                  />
                </div>
                <p className="text-[9px] text-slate-400">Instant registration bonus added to user balance.</p>
              </div>

              {/* Deposit Bonus % */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">
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
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pr-7 pl-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[11px]">
                    %
                  </span>
                </div>
                <p className="text-[9px] text-slate-400">Percent commission paid to upline on deposits.</p>
              </div>
            </div>
          </div>
        )}

        {/* Group 3: Site Identity & Theme Branding */}
        {isBrandingVisible && (
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Palette className="w-3 h-3" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-800">Site Identity & Branding</h2>
                  <p className="text-[9px] text-slate-400">Platform name, visual theme color, logo and favicon assets</p>
                </div>
              </div>
              <span className="text-[9px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-1.5 py-0.2 rounded">
                Visual Branding
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Site Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Platform Name (সাইটের নাম)</label>
                <input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  placeholder="e.g. miPall"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                  required
                />
              </div>

              {/* Primary Color */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Primary Theme Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="h-7 w-8 rounded border border-slate-200 p-0.5 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="flex-1 bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                    placeholder="#4f46e5"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Site Tagline / Description</label>
                <textarea
                  name="siteDescription"
                  value={formData.siteDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Short tagline displayed in headers and shared links..."
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all resize-none"
                />
              </div>

              {/* Custom Logo URL */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Custom Logo URL (Optional)</label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                />
              </div>

              {/* Favicon URL */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Favicon URL (Optional)</label>
                <input
                  type="url"
                  name="faviconUrl"
                  value={formData.faviconUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Group 4: Customer Support & Contact Channels */}
        {isSupportVisible && (
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Phone className="w-3 h-3" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-800">Customer Support & Social Channels</h2>
                  <p className="text-[9px] text-slate-400">Direct contacts shown in user help center, footer, and telegram banners</p>
                </div>
              </div>
              <span className="text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.2 rounded">
                Help Center
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Support Email */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Support Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="supportEmail"
                    value={formData.supportEmail}
                    onChange={handleChange}
                    placeholder="support@mipall.com"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">WhatsApp Support / Number</label>
                <div className="relative">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="+8801XXXXXXXXX or https://wa.me/..."
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              {/* Telegram */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Telegram Channel / Support Link</label>
                <div className="relative">
                  <Send className="w-3.5 h-3.5 text-sky-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="telegramUrl"
                    value={formData.telegramUrl}
                    onChange={handleChange}
                    placeholder="https://t.me/yourchannel"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              {/* Mobile App APK */}
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Mobile App APK Download URL</label>
                <div className="relative">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="mobileAppUrl"
                    value={formData.mobileAppUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/app.apk"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              {/* Facebook Page */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Facebook Page / Community URL</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Sticky / Bottom Save Action Strip */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Changes will immediately update database and sync with all active client sessions.</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRefreshFromDb}
              disabled={status.type === 'saving'}
              className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={status.type === 'saving'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {status.type === 'saving' ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
