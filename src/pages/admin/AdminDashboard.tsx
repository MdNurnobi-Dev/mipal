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
  Sparkles,
  CreditCard,
  ArrowRight,
  Check,
  X,
  Copy,
  Wallet
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { 
    users, 
    transactions, 
    tasks, 
    plans, 
    gateways, 
    siteSettings,
    approveTransaction, 
    rejectTransaction,
    refetchData 
  } = useApp();
  
  const { formatCurrency, currencySymbol } = useCurrency();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Real Computed Metrics ---
  const statsSummary = useMemo(() => {
    const totalUsersCount = users.length;
    const activeUsersCount = users.filter(u => u.status === 'Active' || !u.status).length;
    const bannedUsersCount = users.filter(u => u.status === 'Banned').length;

    // Total Wallet Balances held across all users
    const totalUserBalance = users.reduce((acc, u) => acc + (Number(u.balance) || 0), 0);

    // Deposit transactions
    const depositTxList = transactions.filter(t => t.type === 'deposit');
    const approvedDeposits = depositTxList.filter(t => t.status === 'approved');
    const pendingDeposits = depositTxList.filter(t => t.status === 'pending');
    const totalApprovedDepositAmount = approvedDeposits.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalPendingDepositAmount = pendingDeposits.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // Withdrawal transactions
    const withdrawTxList = transactions.filter(t => t.type === 'withdraw');
    const approvedWithdraws = withdrawTxList.filter(t => t.status === 'approved');
    const pendingWithdraws = withdrawTxList.filter(t => t.status === 'pending');
    const totalApprovedWithdrawAmount = approvedWithdraws.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalPendingWithdrawAmount = pendingWithdraws.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // Tasks & Plans
    const activeTasksCount = tasks.filter(t => t.status === 'Active').length;
    const usersWithPaidPlans = users.filter(u => !!u.activePlanId).length;

    // Task Earnings Paid
    const taskEarningsTx = transactions.filter(t => t.type === 'task_earning');
    const totalTaskEarnings = taskEarningsTx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    return {
      totalUsersCount,
      activeUsersCount,
      bannedUsersCount,
      totalUserBalance,
      totalApprovedDepositAmount,
      pendingDeposits,
      totalPendingDepositAmount,
      totalApprovedWithdrawAmount,
      pendingWithdraws,
      totalPendingWithdrawAmount,
      activeTasksCount,
      usersWithPaidPlans,
      totalTaskEarnings,
      totalPendingCount: pendingDeposits.length + pendingWithdraws.length
    };
  }, [users, transactions, tasks]);

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

      // Calculate deposits for this day
      const dayDeposits = transactions
        .filter(t => t.type === 'deposit' && t.status === 'approved' && (t.date || '').startsWith(dayStr))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      // Calculate withdrawals for this day
      const dayWithdrawals = transactions
        .filter(t => t.type === 'withdraw' && t.status === 'approved' && (t.date || '').startsWith(dayStr))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      // Calculate task payouts for this day
      const dayTaskEarnings = transactions
        .filter(t => t.type === 'task_earning' && (t.date || '').startsWith(dayStr))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      result.push({
        date: displayDate,
        rawDate: dayStr,
        deposits: Math.round(dayDeposits * 100) / 100,
        withdrawals: Math.round(dayWithdrawals * 100) / 100,
        taskEarnings: Math.round(dayTaskEarnings * 100) / 100
      });
    }

    return result;
  }, [transactions, timeRange]);

  // Combined Pending List for Action Box
  const pendingRequests = useMemo(() => {
    return [
      ...statsSummary.pendingDeposits.map(d => ({ ...d, requestCategory: 'Deposit' })),
      ...statsSummary.pendingWithdraws.map(w => ({ ...w, requestCategory: 'Withdrawal' }))
    ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [statsSummary.pendingDeposits, statsSummary.pendingWithdraws]);

  // Recent Users
  const recentUsers = useMemo(() => {
    return [...users].slice(-6).reverse();
  }, [users]);

  // Recent Transactions
  const recentTransactions = useMemo(() => {
    return [...transactions].slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Header Bar with Live Database Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin Executive Dashboard</h1>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live DB Synced
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time financial metrics, pending transaction review, user registry, and system controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Database'}</span>
          </button>
          <Link
            to="/admin/settings"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs transition-colors shadow-2xs"
          >
            <span>Site Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Main Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Users</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">
            {statsSummary.totalUsersCount}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-semibold">{statsSummary.activeUsersCount} Active</span>
            <span className="text-slate-400 font-medium">{statsSummary.usersWithPaidPlans} on Paid Plans</span>
          </div>
        </div>

        {/* Total Approved Deposits */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Deposits</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {formatCurrency(statsSummary.totalApprovedDepositAmount)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Pending Review:</span>
            <span className="font-bold text-amber-600">{formatCurrency(statsSummary.totalPendingDepositAmount)}</span>
          </div>
        </div>

        {/* Total Approved Withdrawals */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Withdrawals</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 tracking-tight">
            {formatCurrency(statsSummary.totalApprovedWithdrawAmount)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Pending Payout:</span>
            <span className="font-bold text-amber-600">{formatCurrency(statsSummary.totalPendingWithdrawAmount)}</span>
          </div>
        </div>

        {/* User Balance Liability / Wallet Holdings */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Wallet Balances</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">
            {formatCurrency(statsSummary.totalUserBalance)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="text-slate-400">Active Tasks:</span>
            <span className="font-bold text-indigo-600">{statsSummary.activeTasksCount} Live Tasks</span>
          </div>
        </div>
      </div>

      {/* Action Center: Pending Deposits & Withdrawals (Direct 1-Click Action from Dashboard) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800">Pending Approvals Action Center</h3>
                {pendingRequests.length > 0 ? (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {pendingRequests.length} Needs Review
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    All Clear (0 Pending)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Approve or reject deposits & payout requests with instant balance updates</p>
            </div>
          </div>
          <Link 
            to="/admin/transactions" 
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Transactions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
            <p className="font-bold text-slate-700 text-xs">No pending requests!</p>
            <p className="text-[11px] text-slate-400">All user deposits and withdrawals are processed and up to date.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-500 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">User</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Gateway / Method</th>
                  <th className="px-4 py-2.5">TrxID / Account</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        req.type === 'deposit' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <div>{req.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {req.userId}</div>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900 text-sm">
                      {formatCurrency(req.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PaymentGatewayLogo name={req.method || ''} size="sm" />
                        <span className="font-bold text-slate-800 text-xs">{req.method}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {req.txId ? (
                        <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded w-fit">
                          <span>{req.txId}</span>
                          <button
                            onClick={() => handleCopy(req.txId || '', req.id)}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Copy TrxID"
                          >
                            {copiedId === req.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-600 font-mono">{req.userDetails || 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400 whitespace-nowrap">
                      {req.date || 'Today'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => approveTransaction(req.id)}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectTransaction(req.id)}
                          className="px-2 py-1 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
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

      {/* Financial Flow & Activity Trends (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Financial Volume Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Financial Cashflow Breakdown</h3>
              <p className="text-[11px] text-slate-500">Daily approved deposits vs processed withdrawals</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['7d', '14d', '30d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    timeRange === range
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '14d' ? 'Last 14 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="depositGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="withdrawGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="deposits" 
                  name="Approved Deposits" 
                  stroke="#10B981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#depositGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="withdrawals" 
                  name="Approved Withdrawals" 
                  stroke="#8B5CF6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#withdrawGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick System Navigation Shortcuts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Quick Actions</h3>
            <p className="text-[11px] text-slate-500">Jump directly to administration modules</p>
          </div>

          <div className="space-y-2">
            <Link 
              to="/admin/payments/gateways" 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Payment Gateways</div>
                  <div className="text-[10px] text-slate-400">{gateways.length} Gateways Configured</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link 
              to="/admin/tasks" 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Manage Micro Tasks</div>
                  <div className="text-[10px] text-slate-400">{tasks.length} Total Tasks Created</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link 
              to="/admin/plans" 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Investment Plans</div>
                  <div className="text-[10px] text-slate-400">{plans.length} Tiered Plans Active</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link 
              to="/admin/users" 
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">User Management</div>
                  <div className="text-[10px] text-slate-400">Balance & Status Controls</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>
          </div>

          <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-1">
            <div className="font-bold flex items-center gap-1 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Currency</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Configured Symbol: <span className="font-bold text-yellow-400">{currencySymbol}</span> ({siteSettings.currency || 'USD'})
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column: Real Registered Users Table & Recent Live Transactions Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Real Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Latest Registered Users</h3>
              <p className="text-[10px] text-slate-400">Showing newest accounts from database</p>
            </div>
            <Link 
              to="/admin/users" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage All ({users.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">User</th>
                  <th className="px-4 py-2.5">Balance</th>
                  <th className="px-4 py-2.5">Current Plan</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {formatCurrency(u.balance || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {getPlanName(u.activePlanId)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        u.status === 'Banned' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      No registered users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Live Transactions Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Recent Live Activity</h3>
              <p className="text-[10px] text-slate-400">All transactions and wallet changes</p>
            </div>
            <Link 
              to="/admin/transactions" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All ({transactions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">User</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div className="font-bold">{tx.userName}</div>
                      <div className="text-[10px] text-slate-400">{tx.method || tx.type}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        tx.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : tx.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
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
