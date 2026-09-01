import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart, 
  ComposedChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Briefcase, 
  DollarSign, 
  ArrowUpRight, 
  Sparkles, 
  Globe, 
  PlayCircle, 
  HelpCircle, 
  ArrowLeft,
  ChevronRight,
  Filter,
  BarChart3,
  Award,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { useSiteSettings } from '../hooks/useSiteSettings';

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
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/60 p-3 rounded-xl shadow-xl text-white text-xs space-y-1.5 min-w-[140px]">
        <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-normal">Daily Summary</span>
        </p>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <span className="flex items-center gap-1 text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Earnings:
          </span>
          <span className="font-bold font-mono text-emerald-400">{currencySymbol}{earnings.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Tasks Done:
          </span>
          <span className="font-bold font-mono text-white">{taskCount} tasks</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function EarningsAnalytics() {
  const navigate = useNavigate();
  const { currentUser, transactions, plans, tasks } = useApp();
  const { formatCurrency, currencySymbol } = useCurrency();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [chartType, setChartType] = useState<'composed' | 'area'>('composed');

  // Filter user's task earnings transactions
  const userTaskTransactions = useMemo(() => {
    if (!currentUser) return [];
    return transactions.filter(
      tx => tx.userId === currentUser?.id && tx.type === 'task_earning'
    );
  }, [transactions, currentUser]);

  // Generate date list based on selected time range
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

      // Match transactions on this date
      const matchedTxs = userTaskTransactions.filter(tx => {
        if (!tx.date) return false;
        const txDateStr = tx.date.includes(' ') ? tx.date.split(' ')[0] : tx.date.split('T')[0];
        return txDateStr === dateStr;
      });

      let earnings = matchedTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      let taskCount = matchedTxs.length;

      // Realistic baseline distribution for demo/new accounts when transactions are minimal
      if (userTaskTransactions.length < 3) {
        // Deterministic baseline distribution based on day of week
        const baseOffset = (targetDate.getDay() + 1) * 0.75;
        if (i === 0 && currentUser?.dailyEarned) {
          earnings = currentUser?.dailyEarned;
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

  // Aggregate stats
  const totalPeriodEarnings = useMemo(() => {
    return weeklyTrendData.reduce((acc, curr) => acc + curr.earnings, 0);
  }, [weeklyTrendData]);

  const totalPeriodTasks = useMemo(() => {
    return weeklyTrendData.reduce((acc, curr) => acc + curr.taskCount, 0);
  }, [weeklyTrendData]);

  const avgEarningPerTask = useMemo(() => {
    if (totalPeriodTasks === 0) return 0;
    return totalPeriodEarnings / totalPeriodTasks;
  }, [totalPeriodEarnings, totalPeriodTasks]);

  const activePlan = useMemo(() => {
    if (!currentUser?.activePlanId) return null;
    return plans.find(p => p.id === currentUser?.activePlanId);
  }, [currentUser, plans]);

  // Category breakdown
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

    // Default sample weights if no history yet
    if (videoCount + websiteCount + quizCount === 0) {
      videoCount = Math.max(1, Math.floor(totalPeriodTasks * 0.4));
      websiteCount = Math.max(1, Math.floor(totalPeriodTasks * 0.35));
      quizCount = Math.max(1, totalPeriodTasks - videoCount - websiteCount);
    }

    return [
      { name: 'Website Visits', value: websiteCount, color: '#3b82f6', icon: Globe },
      { name: 'Video Tasks', value: videoCount, color: '#8b5cf6', icon: PlayCircle },
      { name: 'Math Quizzes', value: quizCount, color: '#10b981', icon: HelpCircle },
    ];
  }, [userTaskTransactions, totalPeriodTasks]);


  if (!currentUser) return null;

  return (
    <div className="space-y-4 pb-8 max-w-lg mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                <span>Weekly Earnings & Tasks</span>
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Visual trend analysis of completed tasks and daily revenue
              </p>
            </div>
          </div>
          <Link
            to="/earnings"
            className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-indigo-200 transition-colors shrink-0 shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Tasks</span>
          </Link>
        </div>

        {/* Timeframe Filter Tabs */}
        <div className="flex items-center justify-between bg-slate-100/80 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setTimeRange('7d')}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              timeRange === '7d'
                ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            7 Days (Weekly)
          </button>
          <button
            onClick={() => setTimeRange('14d')}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              timeRange === '14d'
                ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              timeRange === '30d'
                ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Earned */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-3.5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div>
            <div className="flex items-center justify-between text-indigo-200 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Total Earned</span>
              <TrendingUp className="w-3.5 h-3.5 text-indigo-200" />
            </div>
            <p className="text-xl font-black">{formatCurrency(totalPeriodEarnings)}</p>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1 text-[10px] text-indigo-100">
            <span className="font-semibold">In {daysCount} Days</span>
          </div>
        </div>

        {/* Tasks Done */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-3.5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div>
            <div className="flex items-center justify-between text-emerald-200 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Tasks Done</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
            </div>
            <p className="text-xl font-black">{totalPeriodTasks} <span className="text-xs font-normal opacity-80">tasks</span></p>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1 text-[10px] text-emerald-100">
            <span className="font-semibold">~{(totalPeriodTasks / daysCount).toFixed(1)} / day</span>
          </div>
        </div>

        {/* Average / Task */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Avg / Task</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{formatCurrency(avgEarningPerTask)}</p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            Per completion
          </div>
        </div>

        {/* Today's Limit Status */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Daily Limit</span>
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <p className="text-lg font-black text-slate-800">
              {formatCurrency(currentUser?.dailyEarned || 0)}
              {activePlan && (
                <span className="text-[10px] text-slate-400 font-normal ml-1">/ {formatCurrency(activePlan.dailyEarningLimit)}</span>
              )}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
          </div>
        </div>
      </div>

      {/* Main Recharts Visualizations */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        {/* Chart Header & Mode Switcher */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Weekly Completion & Earning Trend</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Dual-axis comparison of daily completed tasks and total revenue
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setChartType('composed')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                chartType === 'composed' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Bars
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                chartType === 'area' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Area
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs font-bold pt-1 pb-1 border-y border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-indigo-600 shadow-2xs"></span>
            <span className="text-slate-700">Total Earnings ({currencySymbol})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs"></span>
            <span className="text-slate-700">Tasks Completed</span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'composed' ? (
              <ComposedChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                />
                <YAxis 
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#10b981', fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomChartTooltip currencySymbol={currencySymbol} />} />
                <Bar 
                  yAxisId="left"
                  dataKey="earnings" 
                  fill="url(#earningsBarGrad)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={32}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="taskCount" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            ) : (
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="tasksAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <Tooltip content={<CustomChartTooltip currencySymbol={currencySymbol} />} />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#earningsAreaGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="taskCount" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#tasksAreaGrad)" 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Categories & Performance Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category Share */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Task Types Distribution
            </h4>
            <span className="text-[10px] font-bold text-slate-400">Share %</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={24}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-1.5 text-xs">
              {categoryData.map(cat => {
                const percentage = totalPeriodTasks > 0 
                  ? Math.round((cat.value / totalPeriodTasks) * 100)
                  : 33;
                return (
                  <div key={cat.name} className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                      <span className="font-semibold text-[11px]">{cat.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{cat.value} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Breakdown Quick Matrix */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Recent 5 Days
            </h4>
            <span className="text-[10px] font-bold text-indigo-600">Earnings</span>
          </div>

          <div className="space-y-1.5">
            {weeklyTrendData.slice(-5).reverse().map((dayData, idx) => (
              <div 
                key={dayData.date}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 text-[10px] font-extrabold text-slate-400">
                    {dayData.day.slice(0, 3)}
                  </span>
                  <span className="text-slate-700 font-semibold text-[11px]">{dayData.fullLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-medium">
                    {dayData.taskCount} tasks
                  </span>
                  <span className="font-bold font-mono text-emerald-600 text-[11px]">
                    {formatCurrency(dayData.earnings)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between border border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>Ready to earn more today?</span>
          </div>
          <p className="text-xs text-slate-300">
            Complete active video, website, and quiz tasks to increase your weekly trends.
          </p>
        </div>
        <Link
          to="/earnings"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Earn Now</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
