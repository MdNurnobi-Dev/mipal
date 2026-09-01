import React, { useState, useEffect } from 'react';
import { Save, Bell, ShieldAlert, ArrowDownToLine, ArrowUpFromLine, Send, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminNotificationSettings() {
  const { notificationSettings, updateNotificationSettings, addNotification, users } = useApp();
  
  const [depositAlerts, setDepositAlerts] = useState(notificationSettings.depositAlerts);
  const [withdrawalAlerts, setWithdrawalAlerts] = useState(notificationSettings.withdrawalAlerts);
  const [systemAlerts, setSystemAlerts] = useState(notificationSettings.systemAlerts);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  
  const [customUserId, setCustomUserId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customStatus, setCustomStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  useEffect(() => {
    if (!isDirty) {
      setDepositAlerts(notificationSettings.depositAlerts);
      setWithdrawalAlerts(notificationSettings.withdrawalAlerts);
      setSystemAlerts(notificationSettings.systemAlerts);
    }
  }, [notificationSettings, isDirty]);

  const handleSave = async () => {
    setStatus({ type: 'saving' });
    try {
      await updateNotificationSettings({
        depositAlerts,
        withdrawalAlerts,
        systemAlerts
      });
      setIsDirty(false);
      setStatus({ type: 'success', message: 'Notification settings updated and saved to database!' });
      setTimeout(() => setStatus(prev => prev.type === 'success' ? { type: 'idle' } : prev), 4000);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to update notification settings.' });
    }
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customMessage.trim()) return;
    
    try {
      const targetUsers = customUserId ? [customUserId] : users.map(u => u.id);
      targetUsers.forEach(id => {
        addNotification({
          userId: id,
          title: customTitle.trim(),
          message: customMessage.trim(),
          type: 'general'
        });
      });
      
      setCustomTitle('');
      setCustomMessage('');
      setCustomStatus({ type: 'success', message: `Notification successfully dispatched to ${targetUsers.length} user(s)!` });
      setTimeout(() => setCustomStatus({ type: 'idle' }), 4000);
    } catch (err: any) {
      setCustomStatus({ type: 'error', message: err?.message || 'Failed to dispatch notifications.' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" /> Notification Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage automated alerts and send custom notifications to users.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={status.type === 'saving'}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm disabled:opacity-70 transition-colors cursor-pointer"
        >
          {status.type === 'saving' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
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
            <h4 className="font-bold text-xs">Save Failed</h4>
            <p className="text-[11px] text-rose-700 mt-0.5">{status.message}</p>
          </div>
          <button onClick={() => setStatus({ type: 'idle' })} className="text-rose-500 hover:text-rose-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {customStatus.type === 'success' && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 flex items-start gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-xs">Notification Sent!</h4>
            <p className="text-[11px] text-sky-700 mt-0.5">{customStatus.message}</p>
          </div>
          <button onClick={() => setCustomStatus({ type: 'idle' })} className="text-sky-500 hover:text-sky-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Automated Triggers */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-100 pb-3">
            <ShieldAlert className="w-4 h-4 text-indigo-500" /> Automated Triggers
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Deposit Alerts</p>
                  <p className="text-[10px] text-slate-500">Notify users when their deposit is approved or rejected.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={depositAlerts} onChange={() => setDepositAlerts(!depositAlerts)} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm">
                  <ArrowUpFromLine className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Withdrawal Alerts</p>
                  <p className="text-[10px] text-slate-500">Notify users when their withdrawal is processed or rejected.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={withdrawalAlerts} onChange={() => setWithdrawalAlerts(!withdrawalAlerts)} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">System Alerts</p>
                  <p className="text-[10px] text-slate-500">Notify users about platform updates and maintenance.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={systemAlerts} onChange={() => setSystemAlerts(!systemAlerts)} />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Send Custom Notification */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-100 pb-3">
            <Send className="w-4 h-4 text-indigo-500" /> Send Custom Alert
          </h3>
          
          <form onSubmit={handleSendCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target User (Optional)</label>
              <select 
                value={customUserId}
                onChange={e => setCustomUserId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Users (Broadcast)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Notification Title</label>
              <input 
                type="text" 
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="e.g. Special Holiday Bonus!"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Message Content</label>
              <textarea 
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder="Write your message here..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              ></textarea>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Notification
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
