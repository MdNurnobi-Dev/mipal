import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { PaymentGatewayLogo } from '../../../components/PaymentGatewayLogo';

export default function AdminGateways() {
  const { gateways, addGateway, updateGateway, deleteGateway } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    details: '', 
    instructions: '',
    minAmount: 100,
    maxAmount: 25000,
    isActive: true 
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateGateway(editingId, formData);
      setEditingId(null);
    } else {
      addGateway(formData);
      setIsAdding(false);
    }
    setFormData({ 
      name: '', 
      details: '', 
      instructions: '',
      minAmount: 100,
      maxAmount: 25000,
      isActive: true 
    });
  };

  const startEdit = (gw: any) => {
    setFormData({ 
      name: gw.name || '', 
      details: gw.details || '', 
      instructions: gw.instructions || '',
      minAmount: gw.minAmount || 100,
      maxAmount: gw.maxAmount || 25000,
      isActive: gw.isActive ?? true 
    });
    setEditingId(gw.id);
    setIsAdding(true);
  };

  const quickTemplates = [
    {
      name: 'bKash Personal',
      details: 'Account Number: 01712345678\nAccount Type: Personal (Send Money)\nPayment Gateway: bKash Bangladesh',
      instructions: 'Send Money to the bKash Personal number:\n1. Open bKash App or dial *247#\n2. Select "Send Money"\n3. Number: 01712345678\n4. Enter exact Amount and your Username as Reference\n5. Copy TrxID and submit below',
      minAmount: 100,
      maxAmount: 25000
    },
    {
      name: 'Nagad Personal',
      details: 'Account Number: 01812345678\nAccount Type: Personal (Send Money)\nPayment Gateway: Nagad Digital Banking',
      instructions: 'Send Money to the Nagad Personal number:\n1. Open Nagad App or dial *167#\n2. Select "Send Money"\n3. Number: 01812345678\n4. Enter exact Amount and your Username as Reference\n5. Copy TxnID and submit below',
      minAmount: 100,
      maxAmount: 25000
    },
    {
      name: 'Binance USDT (TRC20 / BEP20)',
      details: 'USDT TRC20 Address: TXYZ99887766554433221100AABBCCDDEEFF\nBinance Pay ID: 58921478\nNetwork: Tron TRC20 / BSC BEP20',
      instructions: 'Send USDT to the address or Binance Pay ID:\n1. Open Binance app\n2. Choose Tron (TRC20) or Binance Pay\n3. Address: TXYZ99887766554433221100AABBCCDDEEFF\n4. Copy the TxID / Transfer ID and paste below',
      minAmount: 10,
      maxAmount: 2000
    },
    {
      name: 'Rocket Personal (DBBL)',
      details: 'Account Number: 019123456789\nAccount Type: Personal (Send Money)\nPayment Gateway: Dutch-Bangla Bank Rocket',
      instructions: 'Send Money to Rocket Personal number:\n1. Open Rocket App or dial *322#\n2. Select Send Money\n3. Account Number: 019123456789 (with 12 digits)\n4. Copy TrxID and submit',
      minAmount: 100,
      maxAmount: 25000
    }
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Payment Gateways
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
              Live DB Synced
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage manual deposit & payout methods with live brand logos and copy buttons.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Payment Gateway
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800">
              {editingId ? 'Edit Payment Gateway' : 'Add New Payment Gateway'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Quick Templates:</span>
              <div className="flex flex-wrap gap-1">
                {quickTemplates.map(tmpl => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => setFormData({
                      name: tmpl.name,
                      details: tmpl.details,
                      instructions: tmpl.instructions,
                      minAmount: tmpl.minAmount,
                      maxAmount: tmpl.maxAmount,
                      isActive: true
                    })}
                    className="text-[10px] font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 px-2 py-1 rounded-md transition-colors"
                  >
                    {tmpl.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Gateway Name (e.g. bKash, Nagad, Binance)
              </label>
              <div className="flex items-center gap-2">
                <PaymentGatewayLogo name={formData.name || 'Default'} size="sm" />
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="e.g. bKash Personal" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Min Deposit Limit
              </label>
              <input 
                type="number" 
                value={formData.minAmount} 
                onChange={e => setFormData({...formData, minAmount: parseFloat(e.target.value) || 0})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="100" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Status
              </label>
              <select 
                value={formData.isActive.toString()} 
                onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="true">Active (Visible to users)</option>
                <option value="false">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Account Number & Details (Shown in Copy Box)
            </label>
            <textarea 
              required 
              value={formData.details} 
              onChange={e => setFormData({...formData, details: e.target.value})} 
              rows={2} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Account Number: 017XXXXXXXX&#10;Account Type: Personal (Send Money)"
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Payment Instructions (Step-by-Step for User)
            </label>
            <textarea 
              value={formData.instructions} 
              onChange={e => setFormData({...formData, instructions: e.target.value})} 
              rows={3} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="1. Open App and select Send Money&#10;2. Enter Account Number&#10;3. Copy TrxID and submit"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => { 
                setIsAdding(false); 
                setEditingId(null); 
                setFormData({name: '', details: '', instructions: '', minAmount: 100, maxAmount: 25000, isActive: true}); 
              }} 
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Save Gateway
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Gateway Brand</th>
              <th className="px-4 py-3">Account Details</th>
              <th className="px-4 py-3">Instructions</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gateways.map((gw) => (
              <tr key={gw.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-800">
                  <div className="flex items-center gap-2.5">
                    <PaymentGatewayLogo name={gw.name} size="sm" />
                    <div>
                      <div className="font-bold text-slate-900">{gw.name}</div>
                      <div className="text-[10px] text-slate-400">Min: {gw.minAmount || 10}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-pre-wrap font-mono text-[10px] text-slate-600 max-w-xs">
                  {gw.details}
                </td>
                <td className="px-4 py-3 whitespace-pre-wrap text-[10px] text-slate-500 max-w-xs">
                  {gw.instructions || gw.details}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    gw.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {gw.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button 
                      onClick={() => updateGateway(gw.id, { isActive: !gw.isActive })} 
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        gw.isActive ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      }`} 
                      title="Toggle Active Status"
                    >
                      {gw.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => startEdit(gw)} 
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors cursor-pointer" 
                      title="Edit Gateway"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete gateway "${gw.name}"?`)) {
                          deleteGateway(gw.id);
                        }
                      }} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer" 
                      title="Delete Gateway"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {gateways.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No payment gateways configured. Click "Add Payment Gateway" or choose a template above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
