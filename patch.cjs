const fs = require('fs');
const content = fs.readFileSync('src/pages/Earnings.tsx', 'utf-8');

const targetStr = `  return (
    <div className="space-y-4">
      {earnedFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-bold text-sm animate-bounce">
          <Sparkles className="w-5 h-5 text-emerald-200" />
          {earnedFeedback}
        </div>
      )}

      <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <h2 className="text-indigo-100 text-[10px] font-semibold uppercase tracking-wider mb-1">Available Balance</h2>
        <div className="text-2xl font-bold text-white">{formatCurrency(currentUser?.balance)}</div>
        
        {hasPlan ? (
          <div className="mt-3 bg-indigo-700/50 p-2.5 rounded-lg border border-indigo-500/50 flex justify-between items-center relative z-10">
            <div>
              <p className="text-[9px] text-indigo-200 uppercase tracking-widest font-bold">Today's Earnings</p>
              <p className="text-sm font-bold">{formatCurrency(currentDailyEarned)} / {formatCurrency(activePlan.dailyEarningLimit)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-indigo-200 uppercase tracking-widest font-bold">Plan</p>
              <p className="text-xs font-bold text-indigo-100">{activePlan.name}</p>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-indigo-100 mt-2 bg-indigo-700/50 p-2 rounded-lg border border-indigo-500/50 inline-block relative z-10">No active plan.</p>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-800 text-sm">Earn Zone (মাইক্রো টাস্ক)</h3>
          <div className="flex items-center gap-2">
            <Link 
              to="/earnings-analytics" 
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors shadow-2xs"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Weekly Trends</span>
            </Link>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
              {activeTasks.length} Tasks
            </span>
          </div>
        </div>
        
        {!hasPlan && (
          <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg flex gap-2 items-start text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-orange-600 mt-0.5" />
            <p>You need an active plan to start earning. <button onClick={() => navigate('/plan')} className="font-bold underline text-orange-900">View Plans</button></p>
          </div>
        )}

        {hasPlan && isLimitReached && (
          <div className="mb-4 bg-slate-50 border border-slate-200 text-slate-600 p-3 rounded-lg flex gap-2 items-start text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <p>You have reached your daily earning limit. Come back tomorrow!</p>
          </div>
        )}

        <div className="space-y-2">
          {activeTasks.length === 0 && (
            <div className="text-center p-6 text-slate-500 text-xs bg-slate-50 rounded-lg border border-slate-100">
              No active tasks available right now. Please check back later.
            </div>
          )}
          {activeTasks.map(task => (
            <div key={task.id} className={\`p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between transition-all \${!canEarn(task.reward) ? 'opacity-50 pointer-events-none' : 'hover:border-indigo-200 hover:bg-slate-50/80'}\`}>
              <div className="flex items-center gap-2.5">
                {getTaskIcon(task.type)}
                <div>
                  <p className="text-xs font-bold text-slate-700">{task.title}</p>
                  <p className="text-[9px] text-slate-400">{task.description || \`\${task.limit}\`}</p>
                </div>
              </div>
              <button 
                onClick={() => startTask(task)}
                disabled={!canEarn(task.reward)}
                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Earn</span>
                <span>{formatSignedCurrency(task.reward, 'task_earning')}</span>
              </button>
            </div>
          ))}
        </div>
        
        {!hasPlan && (
          <button onClick={() => navigate('/plan')} className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm">
            Upgrade to Premium Plan
          </button>
        )}
      </div>`;

const newStr = `  return (
    <div className="space-y-3 pb-8 max-w-lg mx-auto font-sans">
      {earnedFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 font-bold text-[11px] animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          {earnedFeedback}
        </div>
      )}

      {/* Professional Hero Section */}
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
      </div>

      {/* Task List Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-3">
        <div className="border-b border-slate-100 bg-slate-50/50 px-3.5 py-2.5 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> Active Tasks
          </h3>
          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            {activeTasks.length} Available
          </span>
        </div>
        
        {!hasPlan && (
          <div className="p-3 bg-amber-50 border-b border-amber-100 text-amber-800 flex gap-2 items-start text-[10px] font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <p>You need an active plan to start earning. <button onClick={() => navigate('/plan')} className="font-bold underline text-amber-900 ml-1">View Plans</button></p>
          </div>
        )}

        {hasPlan && isLimitReached && (
          <div className="p-3 bg-slate-50 border-b border-slate-100 text-slate-600 flex gap-2 items-start text-[10px] font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <p>You have reached your daily earning limit. Great job! Come back tomorrow.</p>
          </div>
        )}

        <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto no-scrollbar">
          {activeTasks.length === 0 && (
            <div className="text-center p-8 text-slate-500 text-[10px] font-bold opacity-80 flex flex-col items-center">
              <CheckSquare className="w-6 h-6 text-slate-300 mb-2" />
              No active tasks available right now. Please check back later.
            </div>
          )}
          {activeTasks.map(task => (
            <div 
              key={task.id} 
              className={\`p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group \${!canEarn(task.reward) ? 'opacity-50 grayscale pointer-events-none' : 'cursor-pointer'}\`} 
              onClick={() => { if(canEarn(task.reward)) startTask(task); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shrink-0">
                  {getTaskIcon(task.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight mb-0.5 truncate">{task.title}</p>
                  <p className="text-[9px] text-slate-500 font-semibold truncate">{task.description || task.type}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); startTask(task); }}
                disabled={!canEarn(task.reward)}
                className="shrink-0 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 hover:border-indigo-200 transition-all disabled:opacity-50 shadow-sm flex items-center gap-1"
              >
                Earn {formatCurrency(task.reward)}
              </button>
            </div>
          ))}
        </div>
        
        {!hasPlan && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button onClick={() => navigate('/plan')} className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-[11px] hover:bg-indigo-700 transition-colors shadow-sm">
              Upgrade Plan
            </button>
          </div>
        )}
      </div>`;

if(content.includes(targetStr)) {
  fs.writeFileSync('src/pages/Earnings.tsx', content.replace(targetStr, newStr));
  console.log("Replaced successfully!");
} else {
  console.log("Could not find target string.");
}
