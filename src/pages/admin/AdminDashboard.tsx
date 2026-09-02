import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Briefcase, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  ChevronRight,
  CreditCard,
  ArrowRight,
  Check,
  X,
  Copy,
  Wallet,
  Gamepad2,
  Gift,
  DollarSign,
  ShieldCheck,
  Layers,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { PaymentGatewayLogo } from '../../components/PaymentGatewayLogo';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';

export default function AdminDashboard() {
  const { 
    users, 
    transactions, 
    tasks, 
    plans, 
    gateways, 
    siteSettings,
    giveawayBanners,
    approveTransaction, 
    rejectTransaction,
    refetchData 
  } = useApp();
  
  const { formatCurrency, currencySymbol } = useCurrency();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [chartMode, setChartMode] = useState<'cashflow' | 'earnings'>('cashflow');
  const [pendingFilter, setPendingFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // --- Real Computed Metrics ---
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active' || !u.status).length;
    const bannedUsers = users.filter(u => u.status === 'Banned').length;

    // Total Wallet Balances held across all users
    const totalUserBalance = users.reduce((acc, u) => acc + (Number(u.balance) || 0), 0);
    const avgUserBalance = totalUsers > 0 ? totalUserBalance / totalUsers : 0;

    // Deposit transactions
    const depositTxList = transactions.filter(t => t.type === 'deposit');
    const approvedDeposits = depositTxList.filter(t => t.status === 'approved');
    const pendingDeposits = depositTxList.filter(t => t.status === 'pending');
    const totalApprovedDeposit = approvedDeposits.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalPendingDeposit = pendingDeposits.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // Withdrawal transactions
    const withdrawTxList = transactions.filter(t => t.type === 'withdraw');
    const approvedWithdraws = withdrawTxList.filter(t => t.status === 'approved');
    const pendingWithdraws = withdrawTxList.filter(t => t.status === 'pending');
    const totalApprovedWithdraw = approvedWithdraws.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalPendingWithdraw = pendingWithdraws.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // Net platform profit (Gross Inflow - Gross Outflow)
    const netCashflow = totalApprovedDeposit - totalApprovedWithdraw;
    const profitMargin = totalApprovedDeposit > 0 ? (netCashflow / totalApprovedDeposit) * 100 : 0;

    // Task Earnings & Referral / Bonus Payouts
    const taskEarningsTx = transactions.filter(t => t.type === 'task_earning');
    const totalTaskEarnings = taskEarningsTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const bonusTx = transactions.filter(t => t.type === 'referral_bonus' || t.type === 'signup_bonus' || t.type === 'daily_reward');
    const totalBonusesPaid = bonusTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // Plan purchases
    const planPurchasesTx = transactions.filter(t => t.type === 'plan_purchase');
    const totalPlanRevenue = planPurchasesTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // User plan subscription rate
    const usersWithPaidPlans = users.filter(u => !!u.activePlanId).length;
    const planSubRate = totalUsers > 0 ? (usersWithPaidPlans / totalUsers) * 100 : 0;

    // Active Gateways
    const activeGateways = gateways.filter(g => g.isActive).length;

    // Active Marketing
    const activeGiveaways = (giveawayBanners || []).filter(b => b.isActive).length;

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      totalUserBalance,
      avgUserBalance,
      totalApprovedDeposit,
      pendingDeposits,
      totalPendingDeposit,
      totalApprovedWithdraw,
      pendingWithdraws,
      totalPendingWithdraw,
      netCashflow,
      profitMargin,
      totalTaskEarnings,
      totalBonusesPaid,
      totalPlanRevenue,
      usersWithPaidPlans,
      planSubRate,
      activeGateways,
      activeGiveaways,
      totalPendingCount: pendingDeposits.length + pendingWithdraws.length,
    };
  }, [users, transactions, gateways, giveawayBanners]);

  // Plan name helper
  const getPlanName = (planId?: string) => {
    if (!planId) return 'Free Plan';
    const found = plans.find(p => p.id === planId);
    return found ? found.name : 'Active Plan';
  };

  // --- Real Chart Data (Daily breakdown) ---
  const chartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Deposits
      const dayDeposits = transactions
        .filter(t => t.type === 'deposit' && t.status === 'approved' && (t.date || '').startsWith(dayStr))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      // Withdrawals
      const dayWithdrawals = transactions
        .filter(t => t.type === 'withdraw' && t.status === 'approved' && (t.date || '').startsWith(dayStr))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      // Task & Bonus Payouts
      const dayEarnings = transactions
        .filter(t => (t.type === 'task_earning' || t.type === 'daily_reward' || t.type === 'referral_bonus') && (t.date || '').startsWith(dayStr))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const netProfit = dayDeposits - dayWithdrawals;

      result.push({
        date: displayDate,
        rawDate: dayStr,
        deposits: Math.round(dayDeposits * 100) / 100,
        withdrawals: Math.round(dayWithdrawals * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        earnings: Math.round(dayEarnings * 100) / 100
      });
    }

    return result;
  }, [transactions, timeRange]);

  // Combined Pending List for Action Box with quick filter
  const filteredPendingRequests = useMemo(() => {
    const deps = stats.pendingDeposits.map(d => ({ ...d, requestCategory: 'Deposit' }));
    const withs = stats.pendingWithdraws.map(w => ({ ...w, requestCategory: 'Withdrawal' }));
    
    let combined = [];
    if (pendingFilter === 'deposit') combined = deps;
    else if (pendingFilter === 'withdraw') combined = withs;
    else combined = [...deps, ...withs];

    return combined.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [stats.pendingDeposits, stats.pendingWithdraws, pendingFilter]);

  // Recent Users
  const recentUsers = useMemo(() => {
    return [...users].slice(-6).reverse();
  }, [users]);

  // Recent Transactions
  const recentTransactions = useMemo(() => {
    return [...transactions].slice(0, 6);
  }, [transactions]);

  // Game Win Control info
  const gameWinControls = siteSettings?.gameWinControls || {};
  const gameStatuses = siteSettings?.gamesEnabled || {};

  const gamesList = [
    { key: 'aviator', name: 'Aviator', icon: '🚀', defaultCtrl: 'medium' },
    { key: 'super_ace', name: 'Super Ace', icon: '🃏', defaultCtrl: 'medium' },
    { key: 'fortune_gems', name: 'Fortune Gems', icon: '💎', defaultCtrl: 'medium' },
    { key: 'mines', name: 'Mines', icon: '💣', defaultCtrl: 'medium' }
  ];

  const getWinBadgeColor = (level: string) => {
    switch (level) {
      case 'zero': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'low': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'high': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="space-y-2.5 max-w-7xl mx-auto pb-8 font-sans text-slate-800">
      {/* 1. Ultra-Compact Pure Light Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs font-semibold text-slate-800 tracking-tight leading-none">Executive Dashboard</h1>
              <span className="inline-flex items-center gap-1 text-[9px] font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DB Synced
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Currency: <span className="text-slate-700 font-medium">{currencySymbol} ({siteSettings.currency || 'BDT'})</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Live executive financial metrics, casino game controls & pending review center.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end md:self-center">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs cursor-pointer active:scale-95"
            title="Sync latest records from PostgreSQL"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
          </button>
          
          <Link
            to="/admin/games/manage"
            className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80 font-medium px-2.5 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs"
          >
            <Gamepad2 className="w-3 h-3 text-amber-600" />
            <span>Win Controls</span>
          </Link>

          <Link
            to="/admin/settings"
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs"
          >
            <span>Settings</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. Compact 6-Card Light Financial & Platform KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Total Deposits */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Deposits</span>
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <ArrowDownRight className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm font-semibold text-emerald-600 tracking-tight">
            {formatCurrency(stats.totalApprovedDeposit)}
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
            <span>Pending:</span>
            <span className={`font-medium ${stats.pendingDeposits.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {stats.pendingDeposits.length} ({formatCurrency(stats.totalPendingDeposit)})
            </span>
          </div>
        </div>

        {/* Total Withdrawals */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs group hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Withdrawals</span>
            <div className="p-1 rounded-md bg-purple-50 text-purple-600 border border-purple-100/60">
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm font-semibold text-purple-600 tracking-tight">
            {formatCurrency(stats.totalApprovedWithdraw)}
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
            <span>Pending:</span>
            <span className={`font-medium ${stats.pendingWithdraws.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {stats.pendingWithdraws.length} ({formatCurrency(stats.totalPendingWithdraw)})
            </span>
          </div>
        </div>

        {/* Net Platform Cashflow */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs group hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Net Cashflow</span>
            <div className={`p-1 rounded-md border ${stats.netCashflow >= 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100/60' : 'bg-rose-50 text-rose-600 border-rose-100/60'}`}>
              <DollarSign className="w-3 h-3" />
            </div>
          </div>
          <div className={`text-sm font-semibold tracking-tight ${stats.netCashflow >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {formatCurrency(stats.netCashflow)}
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
            <span>Margin:</span>
            <span className={`font-medium ${stats.profitMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stats.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Total User Wallet Balances */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs group hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">User Balances</span>
            <div className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100/60">
              <Wallet className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-800 tracking-tight">
            {formatCurrency(stats.totalUserBalance)}
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
            <span>Avg / User:</span>
            <span className="font-medium text-slate-600">{formatCurrency(stats.avgUserBalance)}</span>
          </div>
        </div>

        {/* Registered Users */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs group hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Users</span>
            <div className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100/60">
              <Users className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-800 tracking-tight">
            {stats.totalUsers}
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
            <span className="text-emerald-600 font-medium">{stats.activeUsers} Active</span>
            <span className="text-indigo-600 font-medium">{stats.usersWithPaidPlans} VIP</span>
          </div>
        </div>

        {/* Task & Bonus Outflow */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs group hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Rewards Paid</span>
            <div className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-100/60">
              <Gift className="w-3 h-3" />
            </div>
          </div>
          <div className="text-sm font-semibold text-rose-600 tracking-tight">
            {formatCurrency(stats.totalTaskEarnings + stats.totalBonusesPaid)}
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
            <span>Tasks / Bonuses:</span>
            <span className="font-medium text-slate-600">{tasks.length} Tasks</span>
          </div>
        </div>
      </div>

      {/* 3. Pure Light Casino Games & Win Controls Status Strip */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800">Live Casino Win Controls</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-1.5 py-0.2 rounded font-mono font-medium">
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Game Badges - Light Styling */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full md:w-auto">
          {gamesList.map((g) => {
            const ctrl = gameWinControls[g.key] || g.defaultCtrl;
            const isEnabled = gameStatuses[g.key] !== false;
            return (
              <div 
                key={g.key}
                className="bg-slate-50/80 border border-slate-200/70 rounded-lg px-2 py-1 flex items-center justify-between gap-1.5 text-[10px]"
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span>{g.icon}</span>
                  <span className="font-medium text-slate-700 truncate">{g.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`px-1 py-0.2 rounded text-[8px] font-medium uppercase tracking-wide border ${getWinBadgeColor(ctrl)}`}>
                    {ctrl}
                  </span>
                  {!isEnabled && (
                    <span className="text-[8px] text-rose-600 font-medium bg-rose-50 border border-rose-200/60 px-1 rounded">OFF</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Link
          to="/admin/games/manage"
          className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0 self-end md:self-center hover:underline"
        >
          <span>Configure Modes</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 4. Action Queue: Pending Deposits & Withdrawals (Ultra-Compact Light) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-xs text-slate-800">Pending Approvals Action Center</h3>
                {stats.totalPendingCount > 0 ? (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200/70 text-[9px] font-medium px-1.5 py-0.2 rounded-full animate-pulse">
                    {stats.totalPendingCount} Action Required
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[9px] font-medium px-1.5 py-0.2 rounded-full">
                    Queue Clear (0)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filter Pills & View All */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg text-[10px]">
              <button
                onClick={() => setPendingFilter('all')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  pendingFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({stats.totalPendingCount})
              </button>
              <button
                onClick={() => setPendingFilter('deposit')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  pendingFilter === 'deposit' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Deposits ({stats.pendingDeposits.length})
              </button>
              <button
                onClick={() => setPendingFilter('withdraw')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  pendingFilter === 'withdraw' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Withdraws ({stats.pendingWithdraws.length})
              </button>
            </div>

            <Link 
              to="/admin/transactions" 
              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 ml-1"
            >
              <span>Transactions</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {filteredPendingRequests.length === 0 ? (
          <div className="py-5 px-3 text-center text-slate-400 flex flex-col items-center justify-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-80" />
            <p className="font-medium text-slate-700 text-xs">No pending requests in this filter</p>
            <p className="text-[10px] text-slate-400 font-normal">All user transactions have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-500 font-medium uppercase tracking-wider text-[9px] border-b border-slate-100">
                <tr>
                  <th className="px-3 py-1.5 font-medium">Type</th>
                  <th className="px-3 py-1.5 font-medium">User</th>
                  <th className="px-3 py-1.5 font-medium">Amount</th>
                  <th className="px-3 py-1.5 font-medium">Gateway / Method</th>
                  <th className="px-3 py-1.5 font-medium">TrxID / Account</th>
                  <th className="px-3 py-1.5 font-medium">Time</th>
                  <th className="px-3 py-1.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredPendingRequests.slice(0, 6).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium uppercase tracking-wide border ${
                        req.type === 'deposit' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70' 
                          : 'bg-purple-50 text-purple-700 border-purple-200/70'
                      }`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-800">
                      <div className="font-medium leading-tight">{req.userName}</div>
                      <div className="text-[9px] text-slate-400 font-mono">ID: {req.userId}</div>
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900 text-xs">
                      {formatCurrency(req.amount)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <PaymentGatewayLogo name={req.method || ''} size="sm" />
                        <span className="font-medium text-slate-700 text-[11px]">{req.method}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {req.txId ? (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                          <span>{req.txId}</span>
                          <button
                            onClick={() => handleCopy(req.txId || '', req.id)}
                            className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                            title="Copy TrxID"
                          >
                            {copiedId === req.id ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono">{req.userDetails || 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[9px] text-slate-400 whitespace-nowrap">
                      {req.date || 'Today'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => approveTransaction(req.id)}
                          className="px-2 py-0.8 text-[10px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors flex items-center gap-0.5 shadow-2xs cursor-pointer active:scale-95"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectTransaction(req.id)}
                          className="px-1.5 py-0.8 text-[10px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-colors flex items-center gap-0.5 cursor-pointer active:scale-95"
                        >
                          <X className="w-2.5 h-2.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Financial Flow & Analytics Chart (Light theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <h3 className="font-semibold text-xs text-slate-800">Financial Flow & Platform Velocity</h3>
              </div>
              <p className="text-[9px] text-slate-400">Daily gross deposits, withdrawals, and task payout volumes</p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Chart Mode Toggle */}
              <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg text-[9px] font-medium">
                <button
                  onClick={() => setChartMode('cashflow')}
                  className={`px-2 py-0.5 rounded ${chartMode === 'cashflow' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  Deposits vs Withdrawals
                </button>
                <button
                  onClick={() => setChartMode('earnings')}
                  className={`px-2 py-0.5 rounded ${chartMode === 'earnings' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                >
                  Net Profit / Payouts
                </button>
              </div>

              {/* Timeframe filter */}
              <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg text-[9px] font-medium">
                {(['7d', '14d', '30d'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-1.5 py-0.5 rounded ${
                      timeRange === range
                        ? 'bg-white text-indigo-600 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {range === '7d' ? '7D' : range === '14d' ? '14D' : '30D'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="depositGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="withdrawGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="netProfitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '8px', 
                    color: '#1E293B', 
                    fontSize: '10px', 
                    padding: '6px 10px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)'
                  }}
                  itemStyle={{ color: '#334155', fontWeight: 500 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '4px' }} />
                
                {chartMode === 'cashflow' ? (
                  <>
                    <Area 
                      type="monotone" 
                      dataKey="deposits" 
                      name="Approved Deposits" 
                      stroke="#10B981" 
                      strokeWidth={1.8} 
                      fillOpacity={1} 
                      fill="url(#depositGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="withdrawals" 
                      name="Approved Withdrawals" 
                      stroke="#8B5CF6" 
                      strokeWidth={1.5} 
                      fillOpacity={1} 
                      fill="url(#withdrawGradient)" 
                    />
                  </>
                ) : (
                  <>
                    <Area 
                      type="monotone" 
                      dataKey="netProfit" 
                      name="Net Profit" 
                      stroke="#4F46E5" 
                      strokeWidth={1.8} 
                      fillOpacity={1} 
                      fill="url(#netProfitGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      name="Rewards & Payouts" 
                      stroke="#F43F5E" 
                      strokeWidth={1.5} 
                      fillOpacity={0.15} 
                      fill="#F43F5E" 
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Management Shortcuts & System Box (Light Theme) */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <h3 className="font-semibold text-xs text-slate-800">System Modules</h3>
            </div>
            <p className="text-[9px] text-slate-400">Direct shortcuts to critical admin tools</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <Link 
              to="/admin/payments/gateways" 
              className="p-2 rounded-lg bg-slate-50/80 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200/80 transition-all group flex items-center gap-2"
            >
              <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/60 shrink-0">
                <CreditCard className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-slate-800 group-hover:text-indigo-700 truncate">Gateways</div>
                <div className="text-[9px] text-slate-400">{stats.activeGateways} Active</div>
              </div>
            </Link>

            <Link 
              to="/admin/games/manage" 
              className="p-2 rounded-lg bg-slate-50/80 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200/80 transition-all group flex items-center gap-2"
            >
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100/60 shrink-0">
                <Gamepad2 className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-slate-800 group-hover:text-amber-700 truncate">Win Controls</div>
                <div className="text-[9px] text-slate-400">4 Games Live</div>
              </div>
            </Link>

            <Link 
              to="/admin/tasks" 
              className="p-2 rounded-lg bg-slate-50/80 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200/80 transition-all group flex items-center gap-2"
            >
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100/60 shrink-0">
                <Briefcase className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-slate-800 group-hover:text-blue-700 truncate">Micro Tasks</div>
                <div className="text-[9px] text-slate-400">{tasks.length} Created</div>
              </div>
            </Link>

            <Link 
              to="/admin/plans" 
              className="p-2 rounded-lg bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200/80 transition-all group flex items-center gap-2"
            >
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/60 shrink-0">
                <TrendingUp className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-slate-800 group-hover:text-emerald-700 truncate">Plans & VIP</div>
                <div className="text-[9px] text-slate-400">{plans.length} Tiers</div>
              </div>
            </Link>

            <Link 
              to="/admin/marketing/giveaway" 
              className="p-2 rounded-lg bg-slate-50/80 hover:bg-purple-50/60 border border-slate-100 hover:border-purple-200/80 transition-all group flex items-center gap-2"
            >
              <div className="p-1.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100/60 shrink-0">
                <Gift className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-slate-800 group-hover:text-purple-700 truncate">Marketing</div>
                <div className="text-[9px] text-slate-400">{stats.activeGiveaways} Banners</div>
              </div>
            </Link>

            <Link 
              to="/admin/users" 
              className="p-2 rounded-lg bg-slate-50/80 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200/80 transition-all group flex items-center gap-2"
            >
              <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/60 shrink-0">
                <Users className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-slate-800 group-hover:text-indigo-700 truncate">User Hub</div>
                <div className="text-[9px] text-slate-400">{stats.totalUsers} Accounts</div>
              </div>
            </Link>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 p-2 rounded-lg text-[10px] space-y-0.5">
            <div className="font-medium flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Security & Role</span>
              </span>
              <span className="text-indigo-600 font-mono text-[9px] font-medium">SUPER ADMIN</span>
            </div>
            <p className="text-[9px] text-slate-500 font-normal">
              Platform currency is set to <span className="text-slate-800 font-medium">{currencySymbol}</span>. Min withdrawal: {formatCurrency(siteSettings.minWithdraw || 0)}.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Dual-Column: Registered Users & Live Transactions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* Latest Registered Users */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-xs text-slate-800">Latest Registered Users</h3>
              <p className="text-[9px] text-slate-400">Showing newest accounts from database</p>
            </div>
            <Link 
              to="/admin/users" 
              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
            >
              <span>Manage ({users.length})</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-500 font-medium uppercase tracking-wider text-[9px] border-b border-slate-100">
                <tr>
                  <th className="px-3 py-1.5 font-medium">User</th>
                  <th className="px-3 py-1.5 font-medium">Balance</th>
                  <th className="px-3 py-1.5 font-medium">Plan</th>
                  <th className="px-3 py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-[10px] flex items-center justify-center shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 truncate text-[11px] leading-tight">{u.name}</div>
                          <div className="text-[9px] text-slate-400 truncate font-normal">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 font-medium text-slate-800 text-[11px]">
                      {formatCurrency(u.balance || 0)}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100/80 text-slate-600 border border-slate-200/50">
                        {getPlanName(u.activePlanId)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-medium uppercase tracking-wide border ${
                        u.status === 'Banned' ? 'bg-rose-50 text-rose-700 border-rose-200/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-400 text-[10px]">
                      No registered users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Live Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-xs text-slate-800">Recent Live Activity</h3>
              <p className="text-[9px] text-slate-400">All transactions and wallet changes</p>
            </div>
            <Link 
              to="/admin/transactions" 
              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
            >
              <span>View All ({transactions.length})</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-500 font-medium uppercase tracking-wider text-[9px] border-b border-slate-100">
                <tr>
                  <th className="px-3 py-1.5 font-medium">User</th>
                  <th className="px-3 py-1.5 font-medium">Category</th>
                  <th className="px-3 py-1.5 font-medium">Amount</th>
                  <th className="px-3 py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-1.5 text-slate-800">
                      <div className="font-medium text-[11px] leading-tight">{tx.userName}</div>
                      <div className="text-[9px] text-slate-400 font-normal">{tx.method || tx.type}</div>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="text-[9px] font-medium uppercase tracking-wide text-slate-600 bg-slate-100/80 px-1.5 py-0.2 rounded border border-slate-200/50">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 font-medium text-slate-800 text-[11px]">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-medium uppercase tracking-wide border ${
                        tx.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : tx.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                          : 'bg-amber-50 text-amber-700 border-amber-200/60'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-400 text-[10px]">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
