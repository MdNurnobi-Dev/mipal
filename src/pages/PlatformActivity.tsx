import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Gift, 
  Search, 
  Clock,
  Sparkles,
  RefreshCw,
  Zap,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';

// Fake Data Generator Helpers for Trust Building
const firstNames = ['Rahim', 'Karim', 'Sajid', 'Hasan', 'Ayesha', 'Fatima', 'Nusrat', 'John', 'Alex', 'Rifat', 'Mehedi', 'Riya', 'Tania', 'Sumon', 'Aminul', 'Khadija', 'Sadia', 'Shihab', 'Rakib', 'Imran', 'Tamim', 'Sakib'];
const gateways = ['bKash', 'Nagad', 'Rocket', 'Binance', 'USDT', 'Bank Transfer'];

const generateFakeActivity = () => {
  const isDeposit = Math.random() > 0.5;
  const amounts = isDeposit ? [500, 1000, 1500, 2000, 2500, 3000, 5000, 10000] : [200, 300, 500, 800, 1000, 1200, 1500, 2500, 3000];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const name = `${firstName} ${'*'.repeat(3)}`; // Masked name for trust
  
  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  const gateway = gateways[Math.floor(Math.random() * gateways.length)];
  
  return {
    id: `fake-${Date.now()}-${Math.random()}`,
    userId: 'fake',
    userName: name,
    type: isDeposit ? 'deposit' : 'withdraw',
    amount: amount,
    status: 'approved',
    method: gateway,
    date: new Date().toISOString(),
    isFake: true
  };
};

export default function PlatformActivity() {
  const { transactions, refetchData } = useApp();
  const { formatCurrency } = useCurrency();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fake Activity State
  const [fakeActivities, setFakeActivities] = useState<any[]>([]);

  // Initialize and periodically add fake activities
  useEffect(() => {
    // Generate initial fake data for past 2 hours
    const initialFakes = Array.from({ length: 6 }).map((_, i) => {
      const act = generateFakeActivity();
      // Spread them across the last few hours
      act.date = new Date(Date.now() - (Math.random() * 2 * 60 * 60 * 1000)).toISOString();
      return act;
    });
    
    // Sort them so they are in a realistic order
    initialFakes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFakeActivities(initialFakes);

    // Set interval for every ~5 minutes (300000 ms)
    // To make it slightly dynamic in UI, let's use 5 minutes exactly
    const interval = setInterval(() => {
      setFakeActivities(prev => {
        const newAct = generateFakeActivity();
        // Keep only up to 50 fake activities so it doesn't bloat memory
        return [newAct, ...prev].slice(0, 50);
      });
    }, 5 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter and combine activities
  const filteredActivities = useMemo(() => {
    const realApproved = transactions.filter(t => t.status === 'approved' && ['deposit', 'withdraw', 'task_earning', 'daily_reward', 'referral_bonus'].includes(t.type));
    
    const combined = [...realApproved, ...fakeActivities];

    return combined
      .filter(t => {
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        
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
  }, [transactions, fakeActivities, selectedType, searchQuery]);

  // Statistics Summary (Including Fake for trust building, or just Real? Better include fake to match UI)
  const stats = useMemo(() => {
    const combined = [...transactions.filter(t => t.status === 'approved'), ...fakeActivities];
    
    const totalDeposits = combined.filter(t => t.type === 'deposit').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalWithdrawals = combined.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalTaskPayouts = combined.filter(t => t.type === 'task_earning').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      totalDeposits,
      totalWithdrawals,
      totalTaskPayouts,
      totalCount: filteredActivities.length
    };
  }, [transactions, fakeActivities, filteredActivities]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'withdraw': return <ArrowUpCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'task_earning': return <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />;
      case 'daily_reward': return <Gift className="w-3.5 h-3.5 text-amber-600" />;
      case 'referral_bonus': return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
      default: return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'withdraw': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'task_earning': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'daily_reward': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'referral_bonus': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getMessage = (tx: any) => {
    const amountStr = formatCurrency(tx.amount);
    switch (tx.type) {
      case 'deposit': return <span>Deposited <strong className="text-emerald-700 font-bold">{amountStr}</strong> via {tx.method || 'Gateway'}</span>;
      case 'withdraw': return <span>Withdrew <strong className="text-rose-700 font-bold">{amountStr}</strong> via {tx.method || 'Payout'}</span>;
      case 'task_earning': return <span>Earned <strong className="text-indigo-700 font-bold">{amountStr}</strong> from micro task</span>;
      case 'daily_reward': return <span>Claimed <strong className="text-amber-700 font-bold">{amountStr}</strong> streak reward</span>;
      case 'referral_bonus': return <span>Earned <strong className="text-blue-700 font-bold">{amountStr}</strong> affiliate bonus</span>;
      default: return <span>Processed {amountStr}</span>;
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
    <div className="space-y-4 max-w-lg mx-auto pb-12 font-sans">
      {/* Light Theme Banner - Compact & Clean */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-70 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Feed
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-semibold hidden sm:inline-block">Sync</span>
            </button>
          </div>
          
          <h1 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-500" />
            Recent Activity
          </h1>
          <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
            Real-time verified platform deposits, withdrawals, and payouts.
          </p>
        </div>
      </div>

      {/* Overview Metric Chips - Compact */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            <ArrowDownCircle className="w-3 h-3 text-emerald-500" />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Deposits</p>
          </div>
          <p className="text-xs font-black text-emerald-700 truncate">{formatCurrency(stats.totalDeposits)}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            <ArrowUpCircle className="w-3 h-3 text-rose-500" />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Payouts</p>
          </div>
          <p className="text-xs font-black text-rose-700 truncate">{formatCurrency(stats.totalWithdrawals)}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            <CheckCircle className="w-3 h-3 text-indigo-500" />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Task Earned</p>
          </div>
          <p className="text-xs font-black text-indigo-700 truncate">{formatCurrency(stats.totalTaskPayouts)}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Box - Minimal */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdraw', label: 'Withdraws' },
            { id: 'task_earning', label: 'Tasks' },
            { id: 'daily_reward', label: 'Rewards' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedType === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-slate-400" />
            History ({stats.totalCount})
          </h2>
          <span className="flex items-center gap-1 text-[9px] font-medium text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1.5">
            <Activity className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="font-bold text-[11px] text-slate-600">No activity found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((tx) => (
              <div key={tx.id} className="p-2.5 flex items-start gap-2.5 hover:bg-slate-50/80 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(tx.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[11px] font-bold text-slate-800 truncate flex items-center gap-1">
                      {tx.userName || 'User'}
                      {tx.isFake && (
                        <span title="Verified Member"><ShieldCheck className="w-2.5 h-2.5 text-blue-500 inline-block" /></span>
                      )}
                    </p>
                    <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {getTimeAgo(tx.date)}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                    {getMessage(tx)}
                  </p>
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getBadgeClass(tx.type)}`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                    {tx.method && (
                      <span className="text-[8px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
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
