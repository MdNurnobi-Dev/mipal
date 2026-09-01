import React, { useState, useMemo } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Flame, 
  History, 
  CreditCard, 
  Activity, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Gift, 
  Briefcase 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';

export default function Wallet() {
  const navigate = useNavigate();
  const { currentUser, transactions, dailyRewardSettings, claimDailyReward } = useApp();
  const { formatCurrency, formatSignedCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<'all' | 'deposit' | 'withdraw'>('all');

  const today = new Date().toISOString().split('T')[0];
  const checkedIn = currentUser?.lastCheckInDate === today;
  
  let currentStreak = currentUser?.checkInStreak || 0;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  if (currentUser?.lastCheckInDate !== yesterdayStr && currentUser?.lastCheckInDate !== today && currentUser?.lastCheckInDate) {
    currentStreak = 0;
  }
  
  const reward = dailyRewardSettings?.baseAmount + (Math.min(currentStreak, dailyRewardSettings?.maxStreak) * dailyRewardSettings?.streakBonus);

  const handleCheckIn = () => {
    const result = claimDailyReward();
    alert(result.message);
  };

  const filteredTransactions = useMemo(() => {
    if (!currentUser) return [];
    
    // Sort descending (latest first)
    const sorted = [...transactions]
      .filter(tx => tx.userId === currentUser.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    if (activeTab === 'deposit') {
      return sorted.filter(t => t.type === 'deposit');
    }
    if (activeTab === 'withdraw') {
      return sorted.filter(t => t.type === 'withdraw');
    }
    
    return sorted;
  }, [transactions, currentUser, activeTab]);

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />;
      case 'withdraw': return <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />;
      case 'task_earning': return <Briefcase className="w-3.5 h-3.5 text-indigo-500" />;
      case 'daily_reward': return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'referral_bonus': return <Gift className="w-3.5 h-3.5 text-amber-500" />;
      case 'plan_purchase': return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getTxColor = (type: string) => {
    const isPositive = ['deposit', 'task_earning', 'referral_bonus', 'daily_reward'].includes(type);
    return isPositive ? 'text-emerald-600' : 'text-slate-800';
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-3 pb-8 max-w-lg mx-auto font-sans">
      {/* Premium FinTech Credit Card - Compact */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex flex-col justify-between border border-white/10 mt-1">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl -ml-6 -mb-6"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 opacity-80 mb-0.5">
              <WalletIcon className="w-3 h-3" />
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Available Balance</span>
            </div>
            <span className="text-[22px] font-black tracking-tight">{formatCurrency(currentUser?.balance || 0)}</span>
          </div>
          {/* Card Chip */}
          <div className="w-7 h-5 rounded bg-gradient-to-br from-amber-200 to-amber-500 opacity-90 flex items-center justify-center relative overflow-hidden shadow-sm mt-0.5">
            <div className="absolute inset-y-0 w-px bg-black/10 left-1/2"></div>
            <div className="absolute inset-x-0 h-px bg-black/10 top-1/2"></div>
            <div className="absolute inset-0.5 border border-black/10 rounded-[1px]"></div>
          </div>
        </div>
        
        <div className="relative z-10 mt-auto">
          <div className="font-mono tracking-[0.15em] text-white/90 text-[11px] mb-2 drop-shadow-sm flex justify-between">
             <span>****</span>
             <span>****</span>
             <span>****</span>
             <span>{String(currentUser?.id || '0000').replace(/\D/g, '').padEnd(4, '8').substring(0, 4)}</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
               <div className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5">Cardholder</div>
               <div className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[100px]">{currentUser?.name || 'User'}</div>
            </div>
            <div className="text-right">
               <div className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5">Valid Thru</div>
               <div className="text-[10px] font-bold tracking-wider">12/28</div>
            </div>
            <div className="text-sm italic font-black text-white/40 tracking-tighter pr-1">VISA</div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row - Compact */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => navigate('/deposit')}
          className="bg-slate-900 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors text-[11px] shadow-sm"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" /> Add Money
        </button>
        <button 
          onClick={() => navigate('/withdraw')}
          className="bg-white text-slate-800 font-bold py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors text-[11px] shadow-sm"
        >
          <ArrowUpFromLine className="w-3.5 h-3.5" /> Withdraw
        </button>
      </div>

      {/* Compact Daily Check-in */}
      {dailyRewardSettings?.isActive && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                Daily Check-in
                {currentStreak > 0 && (
                  <span className="text-orange-600 text-[9px] bg-orange-100 px-1.5 py-0.5 rounded-md font-bold">
                    {currentStreak} Day Streak
                  </span>
                )}
              </h3>
              <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                {checkedIn ? 'Come back tomorrow!' : `Claim ${formatCurrency(reward)} bonus`}
              </p>
            </div>
          </div>
          <button 
            onClick={handleCheckIn}
            disabled={checkedIn}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              checkedIn 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-200'
            }`}
          >
            {checkedIn ? 'Claimed' : 'Claim'}
          </button>
        </div>
      )}

      {/* Professional Transaction List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header & Tabs */}
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="px-3 pt-3 pb-2 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" /> Recent Activity
            </h3>
            <span className="text-[9px] font-semibold text-slate-400">Latest first</span>
          </div>
          
          {/* Tab Filter */}
          <div className="px-3 pb-2 flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'deposit', label: 'Deposits' },
              { id: 'withdraw', label: 'Withdrawals' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'deposit' | 'withdraw')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto no-scrollbar">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 opacity-60">
              <History className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-center text-slate-500 text-[10px] font-bold">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors shrink-0">
                    {getTxIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 capitalize leading-tight mb-0.5">
                      {tx.type.replace('_', ' ')}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold">
                      <span>
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}
                      </span>
                      {tx.method && (
                        <>
                          <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                          <span className="uppercase">{tx.method}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={`font-black text-[12px] leading-tight mb-0.5 ${getTxColor(tx.type)}`}>
                    {formatSignedCurrency(tx.amount, tx.type)}
                  </span>
                  {tx.status === 'approved' && (
                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-sm">
                      <CheckCircle2 className="w-2 h-2" /> DONE
                    </span>
                  )}
                  {tx.status === 'pending' && (
                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-amber-500 bg-amber-50 px-1 rounded-sm">
                      <Clock className="w-2 h-2" /> PENDING
                    </span>
                  )}
                  {tx.status === 'rejected' && (
                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-rose-500 bg-rose-50 px-1 rounded-sm">
                      <XCircle className="w-2 h-2" /> FAILED
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Safety Message for Trust */}
      <div className="text-center px-4">
        <p className="text-[9px] text-slate-400 font-semibold flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Secured and encrypted wallet transactions
        </p>
      </div>
    </div>
  );
}
