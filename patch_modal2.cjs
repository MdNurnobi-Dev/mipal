const fs = require('fs');
const content = fs.readFileSync('src/pages/Earnings.tsx', 'utf-8');

const targetStr = `      {/* Task Execution Modal (Video Ad & Direct Website Visit with Countdown) */}
      {activeTask && (activeTask.type === 'Video' || activeTask.type === 'Website') && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col">
          {/* Top Countdown & Status Bar */}
          <div className="bg-white text-slate-800 p-3 px-4 flex justify-between items-center border-b border-slate-200 shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              {activeTask.type === 'Video' ? (
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2 truncate">
                  <span className="truncate text-slate-800">{activeTask.title}</span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    +{formatCurrency(activeTask.reward)}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                  {timer > 0 ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span>কাউন্টডাউন চলছে: <b>{timer} সেকেন্ড</b> অপেক্ষা করুন</span>
                    </>
                  ) : (
                    <span className="text-emerald-600 font-bold">🎉 সময় সম্পন্ন হয়েছে! রিওয়ার্ড ক্লেম করুন।</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {timer > 0 ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  00:{timer.toString().padStart(2, '0')}
                </div>
              ) : (
                <button 
                  onClick={claimTaskReward}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 animate-bounce cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Claim {formatCurrency(activeTask.reward)}
                </button>
              )}

              <button 
                onClick={() => setActiveTask(null)} 
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer border border-slate-200"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>`;

const newStr = `      {/* Task Execution Modal (Video Ad & Direct Website Visit with Countdown) */}
      {activeTask && (activeTask.type === 'Video' || activeTask.type === 'Website') && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
          {/* Top Countdown & Status Bar */}
          <div className="bg-slate-900 text-white p-2.5 px-3 flex justify-between items-center shrink-0 border-b border-slate-800 shadow-sm relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              {activeTask.type === 'Video' ? (
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-[12px] flex items-center gap-1.5 truncate">
                  <span className="truncate text-slate-100">{activeTask.title}</span>
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded shrink-0">
                    +{formatCurrency(activeTask.reward)}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                  {timer > 0 ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>কাউন্টডাউন: <b>{timer}s</b></span>
                    </>
                  ) : (
                    <span className="text-emerald-400 font-bold">🎉 সময় সম্পন্ন! রিওয়ার্ড ক্লেম করুন।</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {timer > 0 ? (
                <div className="bg-white/10 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  00:{timer.toString().padStart(2, '0')}
                </div>
              ) : (
                <button 
                  onClick={claimTaskReward}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-bounce cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Claim
                </button>
              )}

              <button 
                onClick={() => {
                  if (timer > 0 && !confirm('টাস্ক এখনো শেষ হয়নি। আপনি কি টাস্কটি বাতিল করতে চান?')) return;
                  setActiveTask(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>`;

if(content.includes(targetStr)) {
  fs.writeFileSync('src/pages/Earnings.tsx', content.replace(targetStr, newStr));
  console.log("Modal Replaced successfully!");
} else {
  console.log("Could not find target string for modal.");
}
