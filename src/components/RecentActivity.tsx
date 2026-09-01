import React from 'react';
import { Activity, CheckCircle, ArrowDownCircle, ArrowUpCircle, Gift, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';

interface RecentActivityProps {
  onClose?: () => void;
}

export default function RecentActivity({ onClose }: RecentActivityProps) {
  const { transactions } = useApp();
  const { formatCurrency } = useCurrency();
  
  // Filter for approved and relevant activities, sort descending
  const recentActivities = [...transactions]
    .filter(t => t.status === 'approved' && ['deposit', 'withdraw', 'task_earning', 'daily_reward', 'referral_bonus'].includes(t.type))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8); // show last 8 events

  if (recentActivities.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownCircle className="w-4 h-4 text-emerald-500" />;
      case 'withdraw': return <ArrowUpCircle className="w-4 h-4 text-rose-500" />;
      case 'task_earning': return <CheckCircle className="w-4 h-4 text-indigo-500" />;
      case 'daily_reward': return <Gift className="w-4 h-4 text-amber-500" />;
      case 'referral_bonus': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getMessage = (tx: any) => {
    const amountStr = formatCurrency(tx.amount);
    switch (tx.type) {
      case 'deposit': return <span>Deposited <strong className="text-emerald-600">{amountStr}</strong></span>;
      case 'withdraw': return <span>Withdrew <strong className="text-rose-600">{amountStr}</strong></span>;
      case 'task_earning': return <span>Completed a task for <strong className="text-indigo-600">{amountStr}</strong></span>;
      case 'daily_reward': return <span>Claimed daily reward of <strong className="text-amber-600">{amountStr}</strong></span>;
      case 'referral_bonus': return <span>Earned referral bonus of <strong className="text-blue-600">{amountStr}</strong></span>;
      default: return <span>Earned {amountStr}</span>;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    if (diff < 0) return 'Just now'; // sanity check
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4 relative">
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" /> Recent Platform Activity
          </h3>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            to="/platform-activity"
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors ml-1"
              aria-label="Close Recent Activity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto">
        {recentActivities.map(tx => (
          <div key={tx.id} className="p-2.5 sm:p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              {getIcon(tx.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-800 font-medium truncate">
                <span className="font-bold text-slate-900">{tx.userName}</span> {getMessage(tx)}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">{getTimeAgo(tx.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
