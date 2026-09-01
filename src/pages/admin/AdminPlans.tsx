import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { Plan } from '../../types';

export default function AdminPlans() {
  const { plans, addPlan, updatePlan, deletePlan } = useApp();
  const { currencySymbol, formatCurrency } = useCurrency();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Plan>>({ name: '', price: 0, dailyEarningLimit: 0, durationDays: 30 });
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      addPlan(formData as Omit<Plan, 'id'>);
      setIsAdding(false);
    } else if (isEditing) {
      updatePlan(isEditing, formData);
      setIsEditing(null);
    }
    setFormData({ name: '', price: 0, dailyEarningLimit: 0, durationDays: 30 });
  };

  const handleEdit = (plan: Plan) => {
    setFormData(plan);
    setIsEditing(plan.id);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      deletePlan(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Manage Plans</h1>
          <p className="text-xs text-slate-500 mt-1">Control subscription plans and limits</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ name: '', price: 0, dailyEarningLimit: 0, durationDays: 30 }); }}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Plan
        </button>
      </div>

      {(isAdding || isEditing) && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-800">{isAdding ? 'Add New Plan' : 'Edit Plan'}</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Plan Name</label>
              <input 
                type="text" 
                required 
                value={formData.name || ''} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Price ({currencySymbol})</label>
              <input 
                type="number" 
                required 
                min="0"
                step="0.01"
                value={formData.price || ''} 
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Daily Earning Limit ({currencySymbol})</label>
              <input 
                type="number" 
                required 
                min="0"
                step="0.01"
                value={formData.dailyEarningLimit || ''} 
                onChange={e => setFormData({ ...formData, dailyEarningLimit: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Duration (Days)</label>
              <input 
                type="number" 
                required 
                min="1"
                value={formData.durationDays || ''} 
                onChange={e => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => { setIsAdding(false); setIsEditing(null); }}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Plan
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Name</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Daily Limit</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    No plans found. Create one to get started.
                  </td>
                </tr>
              ) : (
                plans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-slate-800">{plan.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-700">{formatCurrency(plan.price)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-green-600">{formatCurrency(plan.dailyEarningLimit)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                      {plan.durationDays} Days
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleEdit(plan)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(plan.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
