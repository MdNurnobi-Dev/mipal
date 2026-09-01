import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { 
  Save, 
  Percent, 
  Gift, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  UserCheck, 
  Sparkles,
  Trophy,
  Search,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function AdminReferrals() {
  const { referralSettings, updateReferralSettings, plans, users, transactions } = useApp();
  const { currencySymbol, formatCurrency } = useCurrency();
  
  const [referrerBonus, setReferrerBonus] = useState(
    (referralSettings.referrerBonusAmount ?? referralSettings.signupBonusAmount ?? 2.50).toString()
  );
  const [newUserBonus, setNewUserBonus] = useState(
    (referralSettings.newUserBonusAmount ?? 1.00).toString()
  );
  const [depositBonus, setDepositBonus] = useState(
    (referralSettings.depositBonusPercent ?? 5).toString()
  );
  const [planBonuses, setPlanBonuses] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(referralSettings.taskEarningBonusPercentByPlan || {}).map(([k, v]) => [k, String(v)])
    )
  );
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [activeTab, setActiveTab] = useState<'settings' | 'leaderboard' | 'network'>('settings');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isDirty) {
      setReferrerBonus((referralSettings.referrerBonusAmount ?? referralSettings.signupBonusAmount ?? 2.50).toString());
      setNewUserBonus((referralSettings.newUserBonusAmount ?? 1.00).toString());
      setDepositBonus((referralSettings.depositBonusPercent ?? 5).toString());
      setPlanBonuses(
        Object.fromEntries(
          Object.entries(referralSettings.taskEarningBonusPercentByPlan || {}).map(([k, v]) => [k, String(v)])
        )
      );
    }
  }, [referralSettings, isDirty]);

  const handlePlanBonusChange = (planId: string, val: string) => {
    setIsDirty(true);
    setPlanBonuses(prev => ({ ...prev, [planId]: val }));
  };

  const handleSave = async () => {
    setStatus({ type: 'saving' });
    try {
      const numReferrerBonus = parseFloat(referrerBonus) || 0;
      const numNewUserBonus = parseFloat(newUserBonus) || 0;
      const numDepositBonus = parseFloat(depositBonus) || 0;

      const newSettings = {
        referrerBonusAmount: numReferrerBonus,
        newUserBonusAmount: numNewUserBonus,
        signupBonusAmount: numReferrerBonus,
        depositBonusPercent: numDepositBonus,
        taskEarningBonusPercentByPlan: Object.fromEntries(
          Object.entries(planBonuses).map(([k, v]) => [k, parseFloat(String(v)) || 0])
        )
      };

      await updateReferralSettings(newSettings);
      setIsDirty(false);
      setStatus({ type: 'success', message: 'Referral settings updated and synchronized with PostgreSQL database!' });
      setTimeout(() => setStatus(prev => prev.type === 'success' ? { type: 'idle' } : prev), 4000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to update referral settings.' });
    }
  };

  // Top Referrers Calculation
  const topReferrers = useMemo(() => {
    // Map of referralCode -> count of referred users
    const countMap: Record<string, number> = {};
    users.forEach(u => {
      if (u.referredBy) {
        countMap[u.referredBy] = (countMap[u.referredBy] || 0) + 1;
      }
    });

    return users
      .map(user => {
        const invitedCount = user.referralCode ? (countMap[user.referralCode] || 0) : 0;
        const earnings = user.referralEarnings || 0;
        return {
          user,
          invitedCount,
          earnings
        };
      })
      .filter(item => item.invitedCount > 0 || item.earnings > 0)
      .sort((a, b) => b.invitedCount !== a.invitedCount ? b.invitedCount - a.invitedCount : b.earnings - a.earnings);
  }, [users]);

  // All referred users network
  const referredNetwork = useMemo(() => {
    return users
      .filter(u => !!u.referredBy)
      .map(u => {
        const referrer = users.find(r => r.referralCode === u.referredBy);
        return {
          user: u,
          referrer
        };
      })
      .filter(({ user, referrer }) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(q) ||
          (user.email || '').toLowerCase().includes(q) ||
          (user.referredBy || '').toLowerCase().includes(q) ||
          (referrer?.name || '').toLowerCase().includes(q)
        );
      });
  }, [users, searchQuery]);

  // Total referral bonuses paid across system
  const totalReferralPayouts = useMemo(() => {
    return transactions
      .filter(t => t.type === 'referral_bonus' && t.status === 'approved')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const numRefVal = parseFloat(referrerBonus) || 0;
  const numNewVal = parseFloat(newUserBonus) || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Gift className="w-5 h-5 text-indigo-600" />
            Referral & Affiliate System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-tier bonuses, oversee the affiliate network, and track commissions.
          </p>
        </div>
        {activeTab === 'settings' && (
          <button 
            onClick={handleSave}
            disabled={status.type === 'saving'}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
          >
            {status.type === 'saving' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        )}
      </div>

      {status.type === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">Settings Synchronized!</h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">{status.message}</p>
          </div>
          <button onClick={() => setStatus({ type: 'idle' })} className="text-emerald-500 hover:text-emerald-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {status.type === 'error' && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">Save Failed</h4>
            <p className="text-[11px] text-rose-700 mt-0.5">{status.message}</p>
          </div>
          <button onClick={() => setStatus({ type: 'idle' })} className="text-rose-500 hover:text-rose-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Referred Signups</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{users.filter(u => !!u.referredBy).length}</p>
          <span className="text-[10px] text-slate-500">Users joined via referral link</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Referral Payouts</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalReferralPayouts)}</p>
          <span className="text-[10px] text-slate-500">Total commissions paid to date</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Affiliates</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{topReferrers.length}</p>
          <span className="text-[10px] text-slate-500">Users with 1+ successful referrals</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'settings' 
              ? 'bg-white text-indigo-600 shadow-2xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Reward Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'leaderboard' 
              ? 'bg-white text-indigo-600 shadow-2xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Top Referrers Leaderboard ({topReferrers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'network' 
              ? 'bg-white text-indigo-600 shadow-2xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Referral Network Ledger</span>
        </button>
      </div>

      {/* Tab 1: Settings Form */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Visual Live Demonstration Card */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 shadow-2xs border border-indigo-700/40">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">Live Reward Distribution Preview</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {/* Referrer Box */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/40 flex items-center justify-center text-indigo-200">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Referrer (যে রেফার করেছে)</h4>
                      <p className="text-[10px] text-indigo-200">Invited a new friend</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-300">{formatCurrency(numRefVal)}</span>
                    <p className="text-[9px] text-indigo-200 font-medium">Instant Bonus</p>
                  </div>
                </div>
              </div>

              {/* New User Box */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/40 flex items-center justify-center text-emerald-200">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">New User (নতুন সাইনআপ করা ইউজার)</h4>
                      <p className="text-[10px] text-indigo-200">Joined with referral code</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-300">{formatCurrency(numNewVal)}</span>
                    <p className="text-[9px] text-indigo-200 font-medium">Welcome Gift</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Signup Bonus Settings */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Gift className="w-4 h-4 text-indigo-600" /> Signup Referral Bonuses
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Define separate reward amounts for referrers and new signups.</p>
              </div>
              
              {/* Referrer Bonus Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">
                    Referrer Reward Amount ({currencySymbol})
                  </label>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                    রেফারকারী পাবে
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  The bonus credited to an existing user when their friend completes registration using their code.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={referrerBonus}
                    onChange={e => {
                      setIsDirty(true);
                      setReferrerBonus(e.target.value);
                    }}
                    placeholder="2.50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* New User Bonus Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">
                    New User Welcome Bonus ({currencySymbol})
                  </label>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                    নতুন ইউজার পাবে
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  The starting balance given to a newly registered user who signs up through a referral link.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newUserBonus}
                    onChange={e => {
                      setIsDirty(true);
                      setNewUserBonus(e.target.value);
                    }}
                    placeholder="1.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Deposit Commission */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Deposit Commission (%)
                </label>
                <p className="text-[10px] text-slate-500">
                  Percentage of deposit credited to the referrer each time their referred user adds funds.
                </p>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={depositBonus}
                    onChange={e => {
                      setIsDirty(true);
                      setDepositBonus(e.target.value);
                    }}
                    placeholder="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-7 pl-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                </div>
              </div>
            </div>

            {/* Plan Based Task Earnings Bonus */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Task Earning Bonuses (By Plan)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Commission on micro-task earnings awarded to referrers based on their active plan level.
                </p>
              </div>
              
              <div className="space-y-2.5">
                {plans.map(plan => (
                  <div key={plan.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">{plan.name}</h4>
                      <p className="text-[10px] text-slate-500">Daily Limit: {formatCurrency(plan.dailyEarningLimit)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="number" 
                        value={planBonuses[plan.id] || ''}
                        onChange={e => handlePlanBonusChange(plan.id, e.target.value)}
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-right outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>
                ))}
                {plans.length === 0 && (
                  <p className="text-xs text-slate-500 italic py-2 text-center">No plans created yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Top Referrers Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold text-slate-800">Top Performing Affiliates</h2>
            </div>
            <span className="text-[10px] text-slate-400">Ranked by total invited members</span>
          </div>

          {topReferrers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-xs text-slate-600">No active referrers yet</p>
              <p className="text-[10px] text-slate-400">Users who refer others will appear in this leaderboard.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Referral Code</th>
                    <th className="py-3 px-4 text-center">Referred Friends</th>
                    <th className="py-3 px-4 text-right">Referral Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topReferrers.map((item, idx) => (
                    <tr key={item.user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400">
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={item.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.user.name)}`} 
                            alt={item.user.name}
                            className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200" 
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.user.name}</p>
                            <p className="text-[10px] text-slate-400">{item.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {item.user.referralCode || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                          {item.invitedCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600">
                        {formatCurrency(item.earnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Referral Network Ledger */}
      {activeTab === 'network' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Referral Registration Audit Trail ({referredNetwork.length})
              </h2>
              <p className="text-[10px] text-slate-400">All registered users linked to a parent referrer</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user or referrer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {referredNetwork.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-xs text-slate-600">No matching referral records found</p>
              <p className="text-[10px] text-slate-400">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">New Member</th>
                    <th className="py-2.5 px-3">Invited By (Referrer)</th>
                    <th className="py-2.5 px-3">Referral Code Used</th>
                    <th className="py-2.5 px-3">Joined Date</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {referredNetwork.map(({ user, referrer }) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img 
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`} 
                            alt={user.name}
                            className="w-6 h-6 rounded-full bg-slate-100" 
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[10px] text-slate-400">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        {referrer ? (
                          <div>
                            <span className="font-bold text-slate-800 block">{referrer.name}</span>
                            <span className="text-[10px] text-slate-400">{referrer.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Code: {user.referredBy}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                        {user.referredBy}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {user.joined || 'Recently'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {user.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
