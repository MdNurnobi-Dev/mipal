import { useState } from 'react';
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, Flame, History, CreditCard, Activity, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Clock, Gift, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Wallet() {
  const navigate = useNavigate();
  const { currentUser, transactions, dailyRewardSettings, claimDailyReward } = useApp();
  const { siteSettings } = useSiteSettings();
  const { formatCurrency, formatSignedCurrency } = useCurrency();

  if (!currentUser) return null;
  
  const today = new Date().toISOString().split('T')[0];
  const checkedIn = currentUser.lastCheckInDate === today;
  
  let currentStreak = currentUser.checkInStreak || 0;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  if (currentUser.lastCheckInDate !== yesterdayStr && currentUser.lastCheckInDate !== today && currentUser.lastCheckInDate) {
    currentStreak = 0;
  }
  
  const reward = dailyRewardSettings.baseAmount + (Math.min(currentStreak, dailyRewardSettings.maxStreak) * dailyRewardSettings.streakBonus);

  const handleCheckIn = () => {
    const result = claimDailyReward();
    alert(result.message);
  };

  const userTransactions = transactions.filter(tx => tx.userId === currentUser.id);
  
  const getTxIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
      case 'withdraw': return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case 'task_earning': return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case 'daily_reward': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'referral_bonus': return <Gift className="w-4 h-4 text-amber-500" />;
      case 'plan_purchase': return <CreditCard className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };
  
  const getTxColor = (type: string) => {
    const isPositive = ['deposit', 'task_earning', 'referral_bonus', 'daily_reward'].includes(type);
    return isPositive ? 'text-emerald-600' : 'text-slate-800';
  };
  
  const getTxSign = (type: string) => {
    return ['deposit', 'task_earning', 'referral_bonus', 'daily_reward'].includes(type) ? '+' : '-';
  };

  return (
    <div className="space-y-4 pb-6 max-w-lg mx-auto">
      {/* Premium FinTech Credit Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-lg relative overflow-hidden flex flex-col justify-between border border-white/10 mb-2 gap-4">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 opacity-80 mb-0.5">
              <WalletIcon className="w-3.5 h-3.5" />
              <span className="text-[9px] font-medium text-slate-300 uppercase tracking-widest">Available Balance</span>
            </div>
            <span className="text-2xl font-black tracking-tight">{formatCurrency(currentUser.balance)}</span>
          </div>
          {/* Card Chip */}
          <div className="flex flex-col items-end gap-3 mt-1">
             <div className="w-8 h-5.5 rounded bg-gradient-to-br from-amber-200 to-amber-500 opacity-90 flex items-center justify-center relative overflow-hidden shadow-sm">
               <div className="absolute inset-y-0 w-px bg-black/10 left-1/2"></div>
               <div className="absolute inset-x-0 h-px bg-black/10 top-1/2"></div>
               <div className="absolute inset-0.5 border border-black/10 rounded-[1px]"></div>
             </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-1">
          <div className="font-mono tracking-[0.15em] text-white/90 text-xs mb-2.5 drop-shadow-md flex justify-between">
             <span>****</span>
             <span>****</span>
             <span>****</span>
             <span>{String(currentUser.id).replace(/\D/g, '').padEnd(4, '8').substring(0, 4)}</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
               <div className="text-[7px] text-slate-400 uppercase tracking-widest mb-0.5">Cardholder</div>
               <div className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[110px]">{currentUser.name}</div>
            </div>
            <div>
               <div className="text-[7px] text-slate-400 uppercase tracking-widest mb-0.5 text-right">Expires</div>
               <div className="text-[11px] font-bold tracking-wider text-right">12/28</div>
            </div>
            <div className="text-base italic font-black text-white/40 tracking-tighter pr-1">VISA</div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <button 
          onClick={() => navigate('/deposit')}
          className="bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors text-xs shadow-md shadow-indigo-600/20"
        >
          <ArrowDownToLine className="w-4 h-4" /> Deposit
        </button>
        <button 
          onClick={() => navigate('/withdraw')}
          className="bg-white text-slate-800 font-bold py-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-xs shadow-sm"
        >
          <ArrowUpFromLine className="w-4 h-4" /> Withdraw
        </button>
      </div>

      {/* Compact Daily Check-in */}
      {dailyRewardSettings.isActive && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                Daily Reward 
                {currentStreak > 0 && (
                  <span className="text-orange-500 flex items-center text-[10px] bg-orange-100 px-1.5 py-0.5 rounded-full font-bold">
                    {currentStreak} Day Streak
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {checkedIn ? 'Come back tomorrow for more!' : `Claim today's ${formatCurrency(reward)} bonus`}
              </p>
            </div>
          </div>
          <button 
            onClick={handleCheckIn}
            disabled={checkedIn}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              checkedIn 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200'
            }`}
          >
            {checkedIn ? 'Claimed' : 'Claim'}
          </button>
        </div>
      )}

      {/* Professional Transaction List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-400" /> Recent Activity
          </h3>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors">
            View All
          </span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {userTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 opacity-50">
              <History className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-center text-slate-500 text-xs font-medium">No recent transactions</p>
            </div>
          ) : (
            userTransactions.map((tx) => (
              <div key={tx.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-white transition-colors">
                    {getTxIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 capitalize leading-tight mb-0.5">
                      {tx.type.replace('_', ' ')}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <span>{tx.date.split(' ')[0]}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="uppercase">{tx.method}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={`font-bold text-sm leading-tight mb-0.5 ${getTxColor(tx.type)}`}>
                    {formatSignedCurrency(tx.amount, tx.type)}
                  </span>
                  {tx.status === 'approved' && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                    </span>
                  )}
                  {tx.status === 'pending' && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                      <Clock className="w-2.5 h-2.5" /> Pending
                    </span>
                  )}
                  {tx.status === 'rejected' && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-500">
                      <XCircle className="w-2.5 h-2.5" /> Failed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
