const fs = require('fs');
let code = fs.readFileSync('src/pages/Withdraw.tsx', 'utf8');

code = code.replace(
  "const { currentUser, addTransaction, gateways } = useApp();",
  "const { currentUser, addTransaction, gateways, siteSettings } = useApp();"
);

const badBlockStart = code.indexOf('<div className="bg-slate-900 p-4 rounded-xl text-white shadow-sm relative overflow-hidden">');
const badBlockEnd = code.indexOf('        <div>\n          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payout Method</label>');

if (badBlockStart !== -1 && badBlockEnd !== -1) {
  const replacement = `<div className="bg-slate-900 p-4 rounded-xl text-white shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-500 rounded-full blur-2xl opacity-20"></div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 relative z-10">Available Balance</p>
        <div className="text-2xl font-bold text-green-400 relative z-10">{siteSettings?.currency || '$'}{balance.toFixed(2)}</div>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</label>
            <button type="button" onClick={handleMax} className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors">MAX</button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">{siteSettings?.currency || '$'}</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-7 pr-3 text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
              min="10"
              max={balance}
              step="0.01"
            />
          </div>
          <p className="text-[9px] text-slate-400 mt-1 ml-1">Minimum withdrawal: {siteSettings?.currency || '$'}10.00</p>
        </div>

`;
  code = code.substring(0, badBlockStart) + replacement + code.substring(badBlockEnd);
}

fs.writeFileSync('src/pages/Withdraw.tsx', code);
