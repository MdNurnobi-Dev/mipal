import { Check, X, FileImage } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useCurrency } from '../../../hooks/useCurrency';

export default function AdminDeposits({ status }: { status: 'pending' | 'approved' | 'all' }) {
  const { transactions, approveTransaction, rejectTransaction } = useApp();
  const { formatCurrency } = useCurrency();
  
  const deposits = transactions.filter(tx => 
    tx.type === 'deposit' && (status === 'all' || tx.status === status)
  );

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800 capitalize">{status} Deposits</h1>
        <p className="text-slate-500 text-xs mt-0.5">Review and manage manual user deposits.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">TXN ID</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method & Proof</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deposits.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{tx.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{tx.userName}</td>
                <td className="px-4 py-3 font-bold text-indigo-600">{formatCurrency(tx.amount)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-slate-700">{tx.method}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {tx.txId}</span>
                    {tx.proofImg && (
                      <span className="text-[10px] text-indigo-500 flex items-center gap-1 cursor-pointer hover:underline">
                        <FileImage className="w-3 h-3" /> View Proof
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-[10px] text-slate-500">{tx.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    tx.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {tx.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => approveTransaction(tx.id)} className="p-1.5 text-green-600 hover:bg-green-50 border border-green-200 rounded transition-colors" title="Approve & Fund Wallet">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => rejectTransaction(tx.id)} className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded transition-colors" title="Reject Deposit">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Processed</span>
                  )}
                </td>
              </tr>
            ))}
            {deposits.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No deposits found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
