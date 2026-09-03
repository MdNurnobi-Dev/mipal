import { useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, Check, Clock, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';

export default function Plan() {
  const { plans, currentUser, purchasePlan, transactions } = useApp();
  const { formatCurrency } = useCurrency();

  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'my_plans'>('available');

  const handlePurchase = (planId: string) => {
    const res = purchasePlan(planId);
    setMessage({ text: res.message, type: res.success ? 'success' : 'error' });
    setConfirmId(null);
    setTimeout(() => setMessage(null), 3000);
    if (res.success) {
      setActiveTab('my_plans');
    }
  };

  const activePlan = plans.find(p => p.id === currentUser?.activePlanId);
  const today = new Date().toISOString().split('T')[0];
  const currentDailyEarned = currentUser?.lastEarnedDate === today ? (currentUser?.dailyEarned || 0) : 0;
  
  const myPlanHistory = transactions
    .filter(tx => tx.userId === currentUser?.id && tx.type === 'plan_purchase')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!currentUser) return null;

  return (
    <div className="space-y-3">
      {/* Advanced Premium Header Card */}
      <div className="relative bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Abstract Background Grid & Accents */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-tr-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200/50">
                <Zap className="w-3.5 h-3.5 text-white fill-white/20" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-slate-800 tracking-tight">VIP Membership</h2>
                <p className="text-[9px] text-slate-500 font-medium">Premium Account Status</p>
              </div>
            </div>
            <div className="text-right">
               {activePlan ? (
                 <div className="inline-flex items-center gap-1 pl-1 pr-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-[10px] font-medium shadow-sm shadow-emerald-200">
                   <div className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center">
                     <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                   </div>
                   <span className="truncate max-w-[70px]">{activePlan.name}</span>
                 </div>
               ) : (
                 <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200/80 rounded-full text-[10px] font-medium">
                   Free User
                 </div>
               )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100/80 flex items-center justify-between gap-4">
             <p className="text-[10px] text-slate-500 leading-relaxed max-w-[65%]">
               Unlock higher daily limits, exclusive rewards, and priority support by upgrading your tier.
             </p>
             {activePlan && (
                <div className="text-right shrink-0">
                  <div className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Daily Limit</div>
                  <div className="text-xs font-semibold text-indigo-600">{formatCurrency(activePlan.dailyEarningLimit)}</div>
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'available' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Available Plans
        </button>
        <button
          onClick={() => setActiveTab('my_plans')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'my_plans' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          My Plans
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-1">
          {plans.map((plan) => {
            const isActive = currentUser?.activePlanId === plan.id;
            const isConfirming = confirmId === plan.id;

            return (
              <div key={plan.id} className={`bg-white rounded-xl p-3 border ${isActive ? 'border-indigo-500 shadow-sm' : 'border-slate-200'} relative overflow-hidden flex flex-col h-full`}>
                {isActive && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-20 flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </div>
                )}
                
                <div className="relative z-10 mb-3">
                  <h3 className="text-sm font-bold text-slate-800">{plan.name}</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-base font-bold text-indigo-600">{formatCurrency(plan.price, 0)}</span>
                    <span className="text-[10px] font-medium text-slate-500">/ one-time</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 text-xs text-slate-600 relative z-10 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px]">Daily Limit: <strong className="text-slate-700">{formatCurrency(plan.dailyEarningLimit)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px]">Valid for <strong className="text-slate-700">{plan.durationDays} Days</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px]">Potential: <strong className="text-indigo-600">{formatCurrency(plan.dailyEarningLimit * plan.durationDays)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px]">Premium Support</span>
                  </div>
                </div>

                <div className="mt-auto relative z-10">
                  {isConfirming ? (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setConfirmId(null)}
                        className="flex-1 bg-slate-100 text-slate-600 font-semibold py-1.5 text-[11px] rounded hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handlePurchase(plan.id)}
                        className="flex-1 bg-indigo-600 text-white font-semibold py-1.5 text-[11px] rounded hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Confirm Buy
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmId(plan.id)}
                      disabled={isActive}
                      className={`w-full font-semibold py-1.5 text-[11px] rounded transition-all ${
                        isActive 
                          ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                      }`}
                    >
                      {isActive ? 'Current Plan' : 'Select Plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'my_plans' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Current Active Plan
          </h3>
          
          {activePlan ? (
            <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg">{activePlan.name}</h4>
                  <span className="bg-indigo-500/50 border border-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase">
                    Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-indigo-100">Daily Earning Limit</span>
                      <span className="font-bold">{formatCurrency(currentDailyEarned)} / {formatCurrency(activePlan.dailyEarningLimit)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-indigo-900/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-400 rounded-full" 
                        style={{ width: `${Math.min(100, (currentDailyEarned / activePlan.dailyEarningLimit) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] bg-indigo-700/50 p-2 rounded-lg border border-indigo-500/50">
                    <div className="flex items-center gap-1 text-indigo-100">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Plan Duration</span>
                    </div>
                    <span className="font-bold">{activePlan.durationDays} Days</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No Active Plan</p>
              <p className="text-xs text-slate-500 mt-1">Purchase a plan to start earning from tasks.</p>
              <button 
                onClick={() => setActiveTab('available')}
                className="mt-3 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                View Plans
              </button>
            </div>
          )}

          {myPlanHistory.length > 0 && (
            <div className="pt-2">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm mb-3">
                <History className="w-4 h-4 text-slate-500" /> Plan History
              </h3>
              <div className="space-y-2">
                {myPlanHistory.map(tx => (
                  <div key={tx.id} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{tx.userDetails}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{tx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-indigo-600">{formatCurrency(tx.amount)}</p>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {tx.date.startsWith(today) && currentUser?.activePlanId ? 'Current' : 'Expired'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
