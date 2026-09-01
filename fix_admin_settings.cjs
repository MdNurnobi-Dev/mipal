const fs = require('fs');
const code = `
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';

export default function AdminSettings() {
  const { siteSettings, updateSiteSettings, referralSettings, updateReferralSettings } = useApp();
  
  const [currency, setCurrency] = useState(siteSettings?.currency || '$');
  const [minWithdraw, setMinWithdraw] = useState(siteSettings?.minWithdraw || 10);
  const [refBonus, setRefBonus] = useState(referralSettings?.referrerBonusAmount || 2.50);
  
  useEffect(() => {
    if (siteSettings) {
      setCurrency(siteSettings.currency || '$');
      setMinWithdraw(siteSettings.minWithdraw || 10);
    }
    if (referralSettings) {
      setRefBonus(referralSettings.referrerBonusAmount || 2.50);
    }
  }, [siteSettings, referralSettings]);

  const handleSave = () => {
    updateSiteSettings({ currency, minWithdraw });
    updateReferralSettings({ referrerBonusAmount: refBonus });
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Global Settings</h1>
        <p className="text-slate-500 text-xs mt-0.5">Configure core platform functionality and variables.</p>
      </div>

      <div className="bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm overflow-hidden p-4">
        <p className="text-xs text-indigo-800 font-medium">Looking for Site Name, Logo, and Contact Email? They have been moved to the new <Link to="/admin/branding" className="font-bold underline">Branding & Logo Settings</Link> page.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-sm text-slate-800">Financial Settings</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Currency Symbol</label>
              <input 
                type="text" 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Withdrawal</label>
              <input 
                type="number" 
                value={minWithdraw}
                onChange={(e) => setMinWithdraw(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Referral Bonus</label>
              <input 
                type="number" 
                step="0.1" 
                value={refBonus}
                onChange={(e) => setRefBonus(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-colors"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/AdminSettings.tsx', code);
