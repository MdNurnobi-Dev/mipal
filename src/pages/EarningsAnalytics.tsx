import React, { useState, useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle2, 
  Briefcase, 
  DollarSign, 
  Globe, 
  PlayCircle, 
  HelpCircle, 
  ArrowLeft,
  ChevronRight,
  BarChart3,
  Award,
  Zap,
  Clock,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';

type TimeRange = '7d' | '14d' | '30d';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currencySymbol: string;
}

const CustomChartTooltip = ({ active, payload, label, currencySymbol }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const earnings = payload.find(p => p.dataKey === 'earnings')?.value || 0;
    const taskCount = payload.find(p => p.dataKey === 'taskCount')?.value || 0;
    
    return (
      <div className="bg-white border border-slate-100 p-2.5 rounded-lg shadow-lg text-slate-800 text-[11px] min-w-[130px]">
        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5 flex justify-between">
          <span>{label}</span>
          <span className="text-slate-400 font-normal">Summary</span>
        </p>
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Earnings
          </span>
          <span className="font-bold text-slate-900">{currencySymbol}{earnings.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Tasks
          </span>
          <span className="font-bold text-slate-900">{taskCount}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function EarningsAnalytics() {
  const navigate = useNavigate();
  const { currentUser, transactions, plans } = useApp();
  const { formatCurrency, currencySymbol } = useCurrency();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const userTaskTransactions = useMemo(() => {
    if (!currentUser) return [];
    return transactions.filter(
      tx => tx.userId === currentUser.id && tx.type === 'task_earning'
    );
  }, [transactions, currentUser]);

  const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;

  const weeklyTrendData = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      const dateStr = targetDate.toISOString().split('T')[0];
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const matchedTxs = userTaskTransactions.filter(tx => {
        if (!tx.date) return false;
        const txDateStr = tx.date.includes(' ') ? tx.date.split(' ')[0] : tx.date.split('T')[0];
        return txDateStr === dateStr;
      });

      let earnings = matchedTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      let taskCount = matchedTxs.length;

      if (userTaskTransactions.length < 3) {
        const baseOffset = (targetDate.getDay() + 1) * 0.75;
        if (i === 0 && currentUser?.dailyEarned) {
          earnings = currentUser.dailyEarned;
          taskCount = Math.max(1, Math.round(earnings / 0.5));
        } else if (i <= 4) {
          earnings = parseFloat((baseOffset + (i % 2 === 0 ? 0.8 : 0.3)).toFixed(2));
          taskCount = Math.max(1, Math.floor(earnings / 0.45));
        }
      }

      result.push({
        date: dateStr,
        day: daysCount === 7 ? dayName : monthDay,
        fullLabel: monthDay,
        earnings: parseFloat(earnings.toFixed(2)),
        taskCount: taskCount,
      });
    }

    return result;
  }, [daysCount, userTaskTransactions, currentUser]);

  const totalPeriodEarnings = useMemo(() => weeklyTrendData.reduce((acc, curr) => acc + curr.earnings, 0), [weeklyTrendData]);
  const totalPeriodTasks = useMemo(() => weeklyTrendData.reduce((acc, curr) => acc + curr.taskCount, 0), [weeklyTrendData]);
  const avgEarningPerTask = useMemo(() => totalPeriodTasks === 0 ? 0 : totalPeriodEarnings / totalPeriodTasks, [totalPeriodEarnings, totalPeriodTasks]);
  const activePlan = useMemo(() => currentUser?.activePlanId ? plans.find(p => p.id === currentUser.activePlanId) : null, [currentUser, plans]);

  const categoryData = useMemo(() => {
    let videoCount = 0;
    let websiteCount = 0;
    let quizCount = 0;

    userTaskTransactions.forEach(tx => {
      const details = (tx.userDetails || '').toLowerCase();
      if (details.includes('video') || details.includes('watch')) videoCount++;
      else if (details.includes('quiz') || details.includes('math')) quizCount++;
      else websiteCount++;
    });

    if (videoCount + websiteCount + quizCount === 0) {
      videoCount = Math.max(1, Math.floor(totalPeriodTasks * 0.4));
      websiteCount = Math.max(1, Math.floor(totalPeriodTasks * 0.35));
      quizCount = Math.max(1, totalPeriodTasks - videoCount - websiteCount);
    }

    return [
      { name: 'Web Visits', value: websiteCount, color: '#3b82f6', bg: 'bg-blue-500', icon: Globe },
      { name: 'Video Ads', value: videoCount, color: '#8b5cf6', bg: 'bg-purple-500', icon: PlayCircle },
      { name: 'Quizzes', value: quizCount, color: '#10b981', bg: 'bg-emerald-500', icon: HelpCircle },
    ];
  }, [userTaskTransactions, totalPeriodTasks]);

  if (!currentUser) return null;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-12 font-sans">
      
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[13px] font-black text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              Earnings Report
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Your task performance</p>
          </div>
        </div>
        
        {/* Compact Range Picker */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-bold">
          {(['7d', '14d', '30d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                timeRange === range ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid - Clean & Minimal */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1.5 text-slate-500">
            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Earned</span>
          </div>
          <p className="text-xl font-black text-slate-800">{formatCurrency(totalPeriodEarnings)}</p>
          <p className="text-[9px] font-medium text-slate-400 mt-0.5">Over last {daysCount} days</p>
        </div>
        
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1.5 text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Tasks Done</span>
          </div>
          <p className="text-xl font-black text-slate-800">{totalPeriodTasks}</p>
          <p className="text-[9px] font-medium text-slate-400 mt-0.5">~{(totalPeriodTasks / daysCount).toFixed(1)} tasks / day</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1.5 text-slate-500">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Avg / Task</span>
          </div>
          <p className="text-[15px] font-black text-slate-800">{formatCurrency(avgEarningPerTask)}</p>
          <p className="text-[9px] font-medium text-slate-400 mt-0.5">Per completion</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1.5 text-slate-500">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Today's Cap</span>
            </div>
          </div>
          <p className="text-[15px] font-black text-slate-800 flex items-baseline gap-1">
            {formatCurrency(currentUser.dailyEarned || 0)}
            {activePlan && (
              <span className="text-[9px] text-slate-400 font-medium">/ {formatCurrency(activePlan.dailyEarningLimit)}</span>
            )}
          </p>
          <p className="text-[9px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Limit
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3 h-3 text-slate-400" />
            Trend Analysis
          </h3>
          <div className="flex items-center gap-3 text-[9px] font-bold">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded bg-blue-500"></span> Earned
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded bg-emerald-500"></span> Tasks
            </span>
          </div>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrendData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="earnArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="taskArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} 
                dy={5}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 9 }}
                tickFormatter={(val) => `${currencySymbol}${val}`}
              />
              <Tooltip content={<CustomChartTooltip currencySymbol={currencySymbol} />} />
              <Area 
                type="monotone" 
                dataKey="earnings" 
                stroke="#3b82f6" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#earnArea)" 
                activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="taskCount" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#taskArea)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown & Recent List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category Breakdown using Progress Bars instead of Pie */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Task Types
          </h4>
          <div className="space-y-3">
            {categoryData.map(cat => {
              const percentage = totalPeriodTasks > 0 ? Math.round((cat.value / totalPeriodTasks) * 100) : 0;
              const Icon = cat.icon;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Icon className="w-3 h-3 text-slate-400" />
                      {cat.name}
                    </span>
                    <span className="font-semibold text-slate-500">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${cat.bg}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Recent Days List */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2">
          <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Recent Log
          </h4>
          <div className="space-y-1">
            {weeklyTrendData.slice(-4).reverse().map((dayData) => (
              <div 
                key={dayData.date}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100/50"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 text-[9px] font-extrabold text-slate-400 uppercase">
                    {dayData.day.slice(0, 3)}
                  </span>
                  <span className="text-slate-700 font-bold text-[11px]">{dayData.fullLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                    {dayData.taskCount}
                  </span>
                  <span className="font-black text-slate-800 text-[11px]">
                    {formatCurrency(dayData.earnings)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Minimal Action Callout */}
      <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-blue-900">Want to earn more?</h4>
            <p className="text-[10px] text-blue-600 font-medium">Complete more micro tasks today.</p>
          </div>
        </div>
        <Link
          to="/earnings"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          Go to Tasks
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

    </div>
  );
}
