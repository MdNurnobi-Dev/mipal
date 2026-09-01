import { useState, useEffect } from 'react';
import { Save, Flame, Edit3, Settings, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';

export default function AdminDailyReward() {
  const { dailyRewardSettings, updateDailyRewardSettings } = useApp();
  const { currencySymbol, formatCurrency } = useCurrency();
  
  const [isActive, setIsActive] = useState(dailyRewardSettings.isActive);
  const [baseAmount, setBaseAmount] = useState(dailyRewardSettings.baseAmount.toString());
  const [streakBonus, setStreakBonus] = useState(dailyRewardSettings.streakBonus.toString());
  const [maxStreak, setMaxStreak] = useState(dailyRewardSettings.maxStreak.toString());
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  useEffect(() => {
    if (!isDirty) {
      setIsActive(dailyRewardSettings.isActive);
      setBaseAmount(dailyRewardSettings.baseAmount.toString());
      setStreakBonus(dailyRewardSettings.streakBonus.toString());
      setMaxStreak(dailyRewardSettings.maxStreak.toString());
    }
  }, [dailyRewardSettings, isDirty]);

  const handleSave = async () => {
    setStatus({ type: 'saving' });
    try {
      await updateDailyRewardSettings({
        isActive,
        baseAmount: parseFloat(baseAmount) || 0,
        streakBonus: parseFloat(streakBonus) || 0,
        maxStreak: parseInt(maxStreak) || 7
      });
      setIsDirty(false);
      setStatus({ type: 'success', message: 'Daily Reward settings saved successfully and live for users!' });
      setTimeout(() => setStatus(prev => prev.type === 'success' ? { type: 'idle' } : prev), 4000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to update Daily Reward settings.' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Daily Reward Control
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure user daily check-in bonuses and streak multipliers.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={status.type === 'saving'}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm disabled:opacity-70 transition-colors cursor-pointer"
        >
          {status.type === 'saving' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </div>

      {status.type === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">Settings Saved!</h4>
            <p className="text-[11px] text-emerald-700 mt-0.5">{status.message}</p>
          </div>
          <button onClick={() => setStatus({ type: 'idle' })} className="text-emerald-500 hover:text-emerald-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {status.type === 'error' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-3 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">Save Error</h4>
            <p className="text-[11px] text-rose-700 mt-0.5">{status.message}</p>
          </div>
          <button onClick={() => setStatus({ type: 'idle' })} className="text-rose-500 hover:text-rose-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-indigo-500" /> Configuration
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-600">Feature Status</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </div>
            </label>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Base Bonus Amount ({currencySymbol})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={baseAmount}
                    onChange={e => setBaseAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Reward for Day 1.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Streak Bonus Increase ({currencySymbol})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={streakBonus}
                    onChange={e => setStreakBonus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Added per consecutive day.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Maximum Streak Cap (Days)</label>
              <input 
                type="number" 
                min="1"
                value={maxStreak}
                onChange={e => setMaxStreak(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-1">After this many days, the reward stops increasing.</p>
            </div>
          </div>
        </div>

        {/* Projection preview */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-200 pb-3">
            <Edit3 className="w-4 h-4 text-indigo-500" /> Reward Projection
          </h3>
          <p className="text-[11px] text-slate-500">Based on your current settings:</p>
          
          <div className="space-y-2">
            {[1, 2, 3, 7, parseInt(maxStreak) || 7, (parseInt(maxStreak) || 7) + 1].map((day, idx, arr) => {
              if (idx > 0 && day === arr[idx-1]) return null;
              
              const base = parseFloat(baseAmount) || 0;
              const bonus = parseFloat(streakBonus) || 0;
              const max = parseInt(maxStreak) || 7;
              
              // Note: streak starts at 0 for day 1. 
              // Day 1: streak = 0. Day 2: streak = 1.
              const streakMultiplier = Math.min(day - 1, max);
              const reward = base + (streakMultiplier * bonus);
              
              const isMax = day - 1 >= max;

              return (
                <div key={day} className={`flex justify-between items-center p-2.5 rounded-lg text-xs font-bold ${isMax ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-white border border-slate-100 text-slate-700'}`}>
                  <span>Day {day} {isMax && '(Max)'}</span>
                  <span>{formatCurrency(reward)}</span>
                </div>
              );
            })}
          </div>
          
          {!isActive && (
            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-500">Feature is currently DISABLED.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
