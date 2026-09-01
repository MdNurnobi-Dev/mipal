import React, { useState } from 'react';
import { 
  Timer, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  ExternalLink, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  Globe,
  PlayCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Task } from '../types';
import { useCurrency } from '../hooks/useCurrency';

interface TaskIframeHudProps {
  task: Task;
  url: string;
  initialDuration: number;
  remainingSeconds: number;
  onFinishTask: () => void;
  onClose: () => void;
  onOpenExternal?: () => void;
  isIframeLoading?: boolean;
}

export default function TaskIframeHud({
  task,
  url,
  initialDuration,
  remainingSeconds,
  onFinishTask,
  onClose,
  onOpenExternal,
  isIframeLoading = false
}: TaskIframeHudProps) {
  const { formatCurrency } = useCurrency();
  const [isMinimized, setIsMinimized] = useState(false);

  const isCompleted = remainingSeconds <= 0;
  const progressPercent = initialDuration > 0 
    ? Math.min(100, Math.max(0, Math.round(((initialDuration - remainingSeconds) / initialDuration) * 100)))
    : 100;

  // SVG Circular progress math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-3 pointer-events-none transition-all duration-300">
      {/* Minimized Bubble State */}
      {isMinimized ? (
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-white/20 shadow-2xl rounded-full p-2 px-3 flex items-center justify-between gap-3 text-white mx-auto max-w-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="text-slate-700 stroke-current"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className={`${isCompleted ? 'text-emerald-400' : 'text-indigo-400'} stroke-current transition-all duration-1000 ease-linear`}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-mono text-[10px] font-bold">
                {isCompleted ? '✓' : remainingSeconds}
              </span>
            </div>
            <div className="truncate text-left">
              <span className="text-[11px] font-bold block truncate">{task.title}</span>
              <span className="text-[9px] text-emerald-400 font-semibold">+{formatCurrency(task.reward)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isCompleted ? (
              <button
                onClick={onFinishTask}
                className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-emerald-500/40 animate-pulse transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Finish</span>
              </button>
            ) : (
              <button
                onClick={() => setIsMinimized(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{remainingSeconds}s</span>
                <ChevronUp className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              title="Expand HUD"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Expanded HUD Panel */
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden text-white transition-all duration-300">
          {/* Top Integrated Progress Bar */}
          <div className="w-full bg-slate-800/80 h-1.5 relative overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-3 sm:p-4 space-y-3">
            {/* Header: Title, Controls, Minimize, Close */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                  {task.type === 'Video' ? (
                    <PlayCircle className="w-4 h-4 text-orange-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                      {task.title}
                    </h3>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/90 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                      +{formatCurrency(task.reward)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-xs font-mono">
                    {url || 'Task Target View'}
                  </p>
                </div>
              </div>

              {/* HUD Window Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {onOpenExternal && url && (
                  <button
                    onClick={onOpenExternal}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Minimize HUD"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 rounded-lg transition-colors cursor-pointer"
                  title="Exit Task"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Live Timer & State Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 sm:px-3">
              {/* Circular Timer & Status text */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r={radius}
                      className="text-slate-800 stroke-current"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r={radius}
                      className={`${
                        isCompleted ? 'text-emerald-400' : 'text-indigo-400'
                      } stroke-current transition-all duration-1000 ease-linear`}
                      strokeWidth="3.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in zoom-in" />
                    ) : (
                      <span className="font-mono text-xs font-black text-slate-100">
                        {remainingSeconds}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left min-w-0">
                  {isCompleted ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                        <span>Requirement Completed!</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        You can now submit and claim your {formatCurrency(task.reward)}.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        <span>Viewing Required: {remainingSeconds}s remaining</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Stay on this page until the timer reaches zero to unlock reward.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Disabled when timer > 0, Enabled when timer === 0 */}
              <div className="w-full sm:w-auto shrink-0">
                {isCompleted ? (
                  <button
                    id="hud-finish-task-btn"
                    onClick={onFinishTask}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer animate-pulse"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish Task ({formatCurrency(task.reward)})</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  </button>
                ) : (
                  <button
                    id="hud-finish-task-btn-disabled"
                    disabled
                    className="w-full sm:w-auto bg-slate-800/90 text-slate-400 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-700/60 flex items-center justify-center gap-2 cursor-not-allowed opacity-80 select-none transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Finish Task ({remainingSeconds}s)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom mini status info */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Sandbox Verification Active</span>
              </div>
              <div className="font-mono">
                {isCompleted ? (
                  <span className="text-emerald-400 font-bold">Ready to claim</span>
                ) : (
                  <span>
                    Duration: {initialDuration - remainingSeconds}/{initialDuration}s ({progressPercent}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
