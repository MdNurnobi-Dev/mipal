import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { Search, Edit2, Ban, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminUsers() {
  const { users, updateUserProfile } = useApp();
  const { currencySymbol, formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.referralCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBan = (userId: string, currentStatus: string) => {
    updateUserProfile(userId, { status: currentStatus === 'Active' ? 'Banned' : 'Active' });
  };

  const startEdit = (userId: string, currentBalance: number) => {
    setEditingUserId(userId);
    setEditBalance(currentBalance.toString());
  };

  const saveEdit = (userId: string) => {
    const num = parseFloat(editBalance);
    if (!isNaN(num)) {
      updateUserProfile(userId, { balance: num });
    }
    setEditingUserId(null);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-slate-500 text-xs mt-0.5">Control all registered accounts, referral codes, and balances.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name, email, ref code..." 
            className="bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">User & Ref Code</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Referred By</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">#{user.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <div>{user.name}</div>
                    {user.referralCode && (
                      <div className="text-[10px] font-mono text-indigo-600 font-bold mt-0.5">
                        Ref: {user.referralCode}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{user.email || 'N/A'}</td>
                  <td className="px-4 py-3">
                    {user.referredBy ? (
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {user.referredBy}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-green-600">
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{currencySymbol}</span>
                        <input 
                          type="number"
                          step="0.01"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="w-20 bg-white border border-indigo-400 rounded px-1.5 py-0.5 text-xs outline-none"
                          autoFocus
                        />
                        <button 
                          onClick={() => saveEdit(user.id)}
                          className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                          title="Save balance"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      formatCurrency(user.balance)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{user.joined}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => startEdit(user.id, user.balance)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" 
                        title="Edit Balance"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => toggleBan(user.id, user.status)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" 
                        title={user.status === 'Active' ? 'Ban User' : 'Unban User'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-400 italic">
                    No users found matching your search.
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

