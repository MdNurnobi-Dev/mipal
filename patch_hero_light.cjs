const fs = require('fs');
const content = fs.readFileSync('src/pages/Earnings.tsx', 'utf-8');

const heroTarget = `      {/* Professional Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden mt-1 border border-indigo-800/50">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -ml-6 -mb-6"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-3">
          <div>
            <p className="text-indigo-200/80 text-[9px] font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-400" /> Available Balance</p>
            <div className="text-[22px] font-black tracking-tight">{formatCurrency(currentUser?.balance || 0)}</div>
          </div>
          <Link 
            to="/earnings-analytics" 
            className="bg-white/10 hover:bg-white/20 border border-white/10 p-1.5 rounded-lg transition-colors backdrop-blur-sm"
          >
            <BarChart3 className="w-4 h-4 text-indigo-100" />
          </Link>
        </div>

        {hasPlan ? (
          <div className="relative z-10 bg-indigo-950/60 p-3 rounded-xl border border-indigo-500/30">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[9px] text-indigo-300 font-semibold uppercase tracking-wider mb-0.5">Today's Limit</p>
                <p className="text-[11px] font-bold"><span className="text-white">{formatCurrency(currentDailyEarned)}</span> <span className="text-indigo-400">/ {formatCurrency(activePlan.dailyEarningLimit)}</span></p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-500/50 uppercase">
                  {activePlan.name}
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-indigo-950 rounded-full h-1.5 border border-indigo-800/50 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: \`\${Math.min(100, (currentDailyEarned / activePlan.dailyEarningLimit) * 100)}%\` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 bg-indigo-950/60 p-3 rounded-xl border border-indigo-500/30 flex justify-between items-center">
            <p className="text-[10px] text-indigo-200 font-medium">No active premium plan.</p>
            <button onClick={() => navigate('/plan')} className="text-[9px] bg-white text-indigo-900 font-bold px-2 py-1 rounded">Upgrade</button>
          </div>
        )}
      </div>`;

const heroReplacement = `      {/* Clean Light Hero Section */}
      <div className="bg-white rounded-2xl p-4 text-slate-800 border border-slate-200 shadow-sm relative overflow-hidden mt-1">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-8 -mt-8"></div>
        
        <div className="relative z-10 flex justify-between items-start mb-3">
          <div>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-500" /> Available Balance</p>
            <div className="text-[22px] font-black tracking-tight text-slate-800">{formatCurrency(currentUser?.balance || 0)}</div>
          </div>
          <Link 
            to="/earnings-analytics" 
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1.5 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </Link>
        </div>

        {hasPlan ? (
          <div className="relative z-10 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Today's Limit</p>
                <p className="text-[11px] font-bold"><span className="text-slate-800">{formatCurrency(currentDailyEarned)}</span> <span className="text-slate-400">/ {formatCurrency(activePlan.dailyEarningLimit)}</span></p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 uppercase">
                  {activePlan.name}
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: \`\${Math.min(100, (currentDailyEarned / activePlan.dailyEarningLimit) * 100)}%\` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
            <p className="text-[10px] text-slate-500 font-medium">No active premium plan.</p>
            <button onClick={() => navigate('/plan')} className="text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors">Upgrade Plan</button>
          </div>
        )}
      </div>`;

if(content.includes(heroTarget)) {
  fs.writeFileSync('src/pages/Earnings.tsx', content.replace(heroTarget, heroReplacement));
  console.log("Hero Replaced successfully!");
} else {
  console.log("Could not find hero target.");
}
