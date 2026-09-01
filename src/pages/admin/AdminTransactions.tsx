import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Search, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { PaymentGatewayLogo } from '../../components/PaymentGatewayLogo';

export default function AdminTransactions() {
  const { transactions, approveTransaction, rejectTransaction, refetchData } = useApp();
  const { formatCurrency } = useCurrency();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      (tx.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.method || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.userDetails || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.txId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 inline-flex items-center gap-1"><Check className="w-3 h-3" /> Approved</span>;
      case 'pending':
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 inline-flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Pending</span>;
      case 'rejected':
      case 'Failed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 inline-flex items-center gap-1"><X className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">Deposit</span>;
      case 'withdraw':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/60">Withdraw</span>;
      case 'plan_purchase':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">Plan</span>;
      case 'task_earning':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">Task</span>;
      case 'referral_bonus':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200/60">Bonus</span>;
      case 'daily_reward':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">Reward</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Transactions & Requests</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Live DB Synchronized
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">Manage deposits, approve payouts, and view live wallet activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user, TrxID, method..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs w-48 sm:w-56"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdraw">Withdrawals</option>
            <option value="plan_purchase">Plan Purchases</option>
            <option value="task_earning">Task Earnings</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">TXN ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Gateway & Info</th>
                <th className="px-4 py-3">TrxID / Details</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isPending = (tx.status as string) === 'pending' || (tx.status as string) === 'Pending';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500 font-bold">
                      <div className="flex items-center gap-1">
                        <span>{tx.id}</span>
                        <button
                          onClick={() => handleCopy(tx.id, tx.id)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Copy Transaction ID"
                        >
                          {copiedId === tx.id ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="font-semibold">{tx.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {tx.userId}</div>
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(tx.type)}</td>
                    <td className="px-4 py-3 font-black text-slate-900 text-sm">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PaymentGatewayLogo name={tx.method || ''} size="sm" />
                        <div>
                          <div className="font-bold text-slate-800 text-xs">{tx.method}</div>
                          {tx.type === 'deposit' && (
                            <span className="text-[9px] text-indigo-600 font-semibold">Deposit Request</span>
                          )}
                          {tx.type === 'withdraw' && (
                            <span className="text-[9px] text-purple-600 font-semibold">Payout Request</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {tx.txId ? (
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/80 w-fit">
                          <span className="font-mono text-[11px] font-bold text-slate-800">{tx.txId}</span>
                          <button
                            onClick={() => handleCopy(tx.txId || '', `tx_${tx.id}`)}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Copy TrxID"
                          >
                            {copiedId === `tx_${tx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : null}
                      {tx.userDetails && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 max-w-xs truncate">
                          {tx.userDetails}
                        </div>
                      )}
                      {tx.proofImg && (
                        <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                          📎 Proof: {tx.proofImg}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-3">{getStatusBadge(tx.status)}</td>
                    <td className="px-4 py-3 text-right">
                      {isPending ? (
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => approveTransaction(tx.id)}
                            className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors font-bold text-[11px] flex items-center gap-1 cursor-pointer" 
                            title="Approve & Credit Balance"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button 
                            onClick={() => rejectTransaction(tx.id)}
                            className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors font-bold text-[11px] flex items-center gap-1 cursor-pointer" 
                            title="Reject Request"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Processed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 italic">
                    No transactions found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
