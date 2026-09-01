const fs = require('fs');
let content = fs.readFileSync('src/pages/Earnings.tsx', 'utf-8');

const vidTarget = `      {/* Task Execution Modal (Video Ad & Direct Website Visit with Countdown) */}
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

const vidReplacement = `      {/* Task Execution Modal (Video Ad & Direct Website Visit with Countdown) */}
      {activeTask && (activeTask.type === 'Video' || activeTask.type === 'Website') && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Top Countdown & Status Bar */}
          <div className="bg-white text-slate-800 p-2.5 px-3 flex justify-between items-center shrink-0 border-b border-slate-200 shadow-sm relative z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              {activeTask.type === 'Video' ? (
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-[12px] flex items-center gap-1.5 truncate">
                  <span className="truncate text-slate-800">{activeTask.title}</span>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                    +{formatCurrency(activeTask.reward)}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                  {timer > 0 ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      <span>কাউন্টডাউন: <b>{timer}s</b></span>
                    </>
                  ) : (
                    <span className="text-emerald-600 font-bold">🎉 সময় সম্পন্ন! রিওয়ার্ড ক্লেম করুন।</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {timer > 0 ? (
                <div className="bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  00:{timer.toString().padStart(2, '0')}
                </div>
              ) : (
                <button 
                  onClick={claimTaskReward}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-bounce cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Claim
                </button>
              )}

              <button 
                onClick={() => {
                  if (timer > 0 && !confirm('টাস্ক এখনো শেষ হয়নি। আপনি কি টাস্কটি বাতিল করতে চান?')) return;
                  setActiveTask(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>`;

const quizTarget = `      {/* Task Execution Modal (Sohoj Math Quiz) */}
      {activeTask && activeTask.type === 'Quiz' && quizQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-full">
            {/* Header */}
            <div className="bg-slate-900 p-4 text-white flex justify-between items-start relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300">Sohoj Math Quiz</span>
                </div>
                <h3 className="font-bold text-[13px]">{activeTask.title}</h3>
              </div>
              <button 
                onClick={() => setActiveTask(null)} 
                className="relative z-10 text-slate-400 hover:text-white p-1.5 bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>`;

const quizReplacement = `      {/* Task Execution Modal (Sohoj Math Quiz) */}
      {activeTask && activeTask.type === 'Quiz' && quizQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-full">
            {/* Header */}
            <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-start relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="bg-indigo-50 text-indigo-600 p-1 rounded">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Sohoj Math Quiz</span>
                </div>
                <h3 className="font-bold text-[14px] text-slate-800">{activeTask.title}</h3>
              </div>
              <button 
                onClick={() => setActiveTask(null)} 
                className="relative z-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>`;

let modified = false;
if(content.includes(vidTarget)) {
  content = content.replace(vidTarget, vidReplacement);
  console.log("Video Modal Replaced successfully!");
  modified = true;
} else {
  console.log("Could not find Video modal target.");
}

if(content.includes(quizTarget)) {
  content = content.replace(quizTarget, quizReplacement);
  console.log("Quiz Modal Replaced successfully!");
  modified = true;
} else {
  console.log("Could not find Quiz modal target.");
}

if(modified) {
  fs.writeFileSync('src/pages/Earnings.tsx', content);
}
