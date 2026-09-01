const fs = require('fs');
const content = fs.readFileSync('src/pages/Earnings.tsx', 'utf-8');

const targetStr = `      {/* Task Execution Modal (Sohoj Math Quiz) */}
      {activeTask && activeTask.type === 'Quiz' && quizQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white flex justify-between items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <CheckSquare className="w-4 h-4 text-blue-200" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Sohoj Math Quiz (সহজ গণিত কুইজ)</span>
                </div>
                <h3 className="font-bold text-lg">{activeTask.title}</h3>
              </div>
              <button 
                onClick={() => setActiveTask(null)} 
                className="relative z-10 text-blue-200 hover:text-white p-1 bg-black/10 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                    Question #{quizIndex + 1}
                  </span>
                  <button 
                    onClick={nextQuizQuestion}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer"
                    title="Load another math question"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>New Question</span>
                  </button>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                  Reward: {formatCurrency(activeTask.reward)}
                </span>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-4 text-center shadow-xs">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solve the Equation</p>
                <h4 className="text-3xl font-black text-slate-800 tracking-wider">
                  {quizQuestions[quizIndex]?.question}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {quizQuestions[quizIndex]?.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  
                  let btnClass = "border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700";
                  if (isSelected && quizSuccess) {
                    btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                  } else if (isSelected && quizError) {
                    btnClass = "border-red-400 bg-red-50 text-red-900";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={quizSuccess}
                      className={\`p-3.5 rounded-xl border-2 transition-all font-bold text-base flex items-center justify-between cursor-pointer \${btnClass}\`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && quizSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
              
              {quizSuccess && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>সঠিক উত্তর! (Correct Answer! Claiming reward...)</span>
                </div>
              )}
              {quizError && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{quizError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}`;

const newStr = `      {/* Task Execution Modal (Sohoj Math Quiz) */}
      {activeTask && activeTask.type === 'Quiz' && quizQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-200" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-blue-200">Sohoj Math Quiz (সহজ গণিত কুইজ)</span>
                </div>
                <h3 className="font-bold text-sm">{activeTask.title}</h3>
              </div>
              <button 
                onClick={() => setActiveTask(null)} 
                className="relative z-10 text-blue-200 hover:text-white p-1.5 bg-black/10 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    Q#{quizIndex + 1}
                  </span>
                  <button 
                    onClick={nextQuizQuestion}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors cursor-pointer border border-blue-100"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Skip</span>
                  </button>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  +{formatCurrency(activeTask.reward)}
                </span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-3 text-center shadow-inner">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solve this</p>
                <h4 className="text-2xl font-black text-slate-800 tracking-wider">
                  {quizQuestions[quizIndex]?.question}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {quizQuestions[quizIndex]?.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  
                  let btnClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700";
                  if (isSelected && quizSuccess) {
                    btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                  } else if (isSelected && quizError) {
                    btnClass = "border-rose-400 bg-rose-50 text-rose-900";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={quizSuccess}
                      className={\`p-2.5 rounded-xl border-2 transition-all font-bold text-sm flex items-center gap-2 cursor-pointer \${btnClass}\`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-100/50 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0">
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <span className="flex-1 text-left">{opt}</span>
                      {isSelected && quizSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              
              {quizSuccess && (
                <div className="mt-3 p-2 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-emerald-200 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>সঠিক উত্তর! (Claiming...)</span>
                </div>
              )}
              {quizError && (
                <div className="mt-3 p-2 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{quizError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}`;

if(content.includes(targetStr)) {
  fs.writeFileSync('src/pages/Earnings.tsx', content.replace(targetStr, newStr));
  console.log("Quiz Modal Replaced successfully!");
} else {
  console.log("Could not find target string for quiz modal.");
}
