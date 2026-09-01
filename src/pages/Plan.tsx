import { useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, Check, Clock, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';

export default function Plan() {
  const { plans, currentUser, purchasePlan, transactions } = useApp();
  const { formatCurrency } = useCurrency();

  if (!currentUser) return null;
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

  const activePlan = plans.find(p => p.id === currentUser.activePlanId);
  const today = new Date().toISOString().split('T')[0];
  const currentDailyEarned = currentUser.lastEarnedDate === today ? (currentUser.dailyEarned || 0) : 0;
  
  const myPlanHistory = transactions
    .filter(tx => tx.userId === currentUser.id && tx.type === 'plan_purchase')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Investment Plans</h2>
        <p className="text-slate-500 text-xs mt-1">Grow your earnings passively.</p>
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
        <div className="grid gap-3">
          {plans.map((plan) => {
            const isActive = currentUser.activePlanId === plan.id;
            const isConfirming = confirmId === plan.id;

            return (
              <div key={plan.id} className={`bg-white rounded-xl p-4 border ${isActive ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200'} shadow-sm relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Zap className="w-24 h-24 text-indigo-600" />
                </div>
                
                <div className="flex justify-between items-start mb-1 relative z-10">
                  <h3 className="text-base font-bold text-slate-800">{plan.name}</h3>
                  {isActive && (
                    <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <div className="flex items-end gap-1 mb-3 relative z-10">
                  <span className="text-2xl font-black text-indigo-600">{formatCurrency(plan.price, 0)}</span>
                </div>

                <div className="space-y-2 mb-4 text-[11px] text-slate-600 relative z-10">
                  <div className="flex justify-between p-1.5 bg-slate-50 rounded">
                    <span className="font-medium text-slate-500">Daily Earning Limit</span>
                    <span className="font-bold text-green-600">{formatCurrency(plan.dailyEarningLimit)}</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-slate-50 rounded">
                    <span className="font-medium text-slate-500">Duration</span>
                    <span className="font-bold text-slate-800">{plan.durationDays} Days</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-indigo-50 text-indigo-900 rounded font-medium">
                    <span>Total Potential Return</span>
                    <span className="font-bold">{formatCurrency(plan.dailyEarningLimit * plan.durationDays)}</span>
                  </div>
                </div>

                {isConfirming ? (
                  <div className="relative z-10 flex gap-2">
                    <button 
                      onClick={() => setConfirmId(null)}
                      className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 text-sm rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handlePurchase(plan.id)}
                      className="flex-1 bg-indigo-600 text-white font-bold py-2 text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                    >
                      Confirm Buy
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmId(plan.id)}
                    disabled={isActive}
                    className={`relative z-10 w-full font-bold py-2 text-sm rounded-lg transition-colors shadow-sm ${
                      isActive 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                  >
                    {isActive ? 'Current Plan' : 'Buy Now'}
                  </button>
                )}
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
                        {tx.date.startsWith(today) && currentUser.activePlanId ? 'Current' : 'Expired'}
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
