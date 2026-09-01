import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  CheckCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Gift, 
  Search, 
  Filter, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';

export default function PlatformActivity() {
  const { transactions, refetchData } = useApp();
  const { formatCurrency } = useCurrency();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    return [...transactions]
      .filter(t => {
        // Status filter
        const isApproved = t.status === 'approved';
        const isRelevant = ['deposit', 'withdraw', 'task_earning', 'daily_reward', 'referral_bonus'].includes(t.type);
        if (!isApproved || !isRelevant) return false;

        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchUser = (t.userName || '').toLowerCase().includes(q);
          const matchType = (t.type || '').toLowerCase().includes(q);
          const matchMethod = (t.method || '').toLowerCase().includes(q);
          return matchUser || matchType || matchMethod;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedType, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => {
    const approved = transactions.filter(t => t.status === 'approved');
    const totalDeposits = approved.filter(t => t.type === 'deposit').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalWithdrawals = approved.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalTaskPayouts = approved.filter(t => t.type === 'task_earning').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalCount = filteredActivities.length;

    return {
      totalDeposits,
      totalWithdrawals,
      totalTaskPayouts,
      totalCount
    };
  }, [transactions, filteredActivities]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownCircle className="w-4 h-4 text-emerald-600" />;
      case 'withdraw': return <ArrowUpCircle className="w-4 h-4 text-rose-600" />;
      case 'task_earning': return <CheckCircle className="w-4 h-4 text-indigo-600" />;
      case 'daily_reward': return <Gift className="w-4 h-4 text-amber-600" />;
      case 'referral_bonus': return <Sparkles className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'withdraw': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'task_earning': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'daily_reward': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'referral_bonus': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getMessage = (tx: any) => {
    const amountStr = formatCurrency(tx.amount);
    switch (tx.type) {
      case 'deposit': return <span>deposited <strong className="text-emerald-600 font-bold">{amountStr}</strong> via {tx.method || 'Gateway'}</span>;
      case 'withdraw': return <span>withdrew <strong className="text-rose-600 font-bold">{amountStr}</strong> via {tx.method || 'Payout'}</span>;
      case 'task_earning': return <span>completed a micro task and earned <strong className="text-indigo-600 font-bold">{amountStr}</strong></span>;
      case 'daily_reward': return <span>claimed daily streak reward of <strong className="text-amber-600 font-bold">{amountStr}</strong></span>;
      case 'referral_bonus': return <span>received affiliate referral commission of <strong className="text-blue-600 font-bold">{amountStr}</strong></span>;
      default: return <span>processed transaction of {amountStr}</span>;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    if (diff < 0) return 'Just now';
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Activity Stream
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Refresh live stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-semibold">Refresh</span>
            </button>
          </div>
          <h1 className="text-lg font-black tracking-tight mt-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Platform Real-Time Activity
          </h1>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Transparent public ledger of all completed task payouts, verified deposits, processed withdrawals, and user reward achievements.
          </p>
        </div>
      </div>

      {/* 3 Overview Metric Chips */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-2xs">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Deposited</p>
          <p className="text-xs font-black text-emerald-600 mt-0.5 truncate">{formatCurrency(stats.totalDeposits)}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-2xs">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Withdrawn</p>
          <p className="text-xs font-black text-purple-600 mt-0.5 truncate">{formatCurrency(stats.totalWithdrawals)}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-2xs">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Task Payouts</p>
          <p className="text-xs font-black text-indigo-600 mt-0.5 truncate">{formatCurrency(stats.totalTaskPayouts)}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Box */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, gateway, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'task_earning', label: 'Tasks' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdraw', label: 'Withdrawals' },
            { id: 'daily_reward', label: 'Rewards' },
            { id: 'referral_bonus', label: 'Referrals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <h2 className="text-xs font-bold text-slate-800">
              Activity History ({filteredActivities.length})
            </h2>
          </div>
          <span className="text-[10px] text-slate-400">Auto-updates</span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Activity className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-xs text-slate-600">No matching activities</p>
            <p className="text-[10px] text-slate-400">Try adjusting your search query or filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((tx) => (
              <div key={tx.id} className="p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {tx.userName || 'Verified User'}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {getTimeAgo(tx.date)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {getMessage(tx)}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getBadgeClass(tx.type)}`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                    {tx.method && (
                      <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {tx.method}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
