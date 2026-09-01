import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, CheckSquare, Gift, AlertCircle, Globe, Zap, Share2, X, Check, ExternalLink, Sparkles, CheckCircle2, ShieldCheck, Timer, Play, ArrowUpRight, RefreshCw, Loader2, BarChart3, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { useNavigate, Link } from 'react-router-dom';
import { Task, QuizQuestion } from '../types';
import { formatMediaUrl, extractTaskUrls, extractYouTubeId } from '../utils/urlHelper';
import { easyMathQuizQuestions } from '../data/mathQuizzes';
import { isQuizAnswerCorrect, sanitizeQuizQuestions, evaluateMathQuestion } from '../utils/quizHelper';
import { taskLogger } from '../utils/taskLogger';
import TaskIframeHud from '../components/TaskIframeHud';

export default function Earnings() {
  const { currentUser, completeTask, plans, tasks } = useApp();
  const { formatCurrency, formatSignedCurrency } = useCurrency();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const activePlan = plans.find(p => p.id === currentUser.activePlanId);
  const today = new Date().toISOString().split('T')[0];
  const currentDailyEarned = currentUser.lastEarnedDate === today ? (currentUser.dailyEarned || 0) : 0;
  
  const hasPlan = !!activePlan;
  const isLimitReached = hasPlan ? (currentDailyEarned >= activePlan!.dailyEarningLimit) : false;
  
  const canEarn = (amount: number) => {
    if (!hasPlan) return false;
    return currentDailyEarned + amount <= activePlan!.dailyEarningLimit;
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'Video': return <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center"><PlayCircle className="w-4 h-4" /></div>;
      case 'Quiz': return <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center"><CheckSquare className="w-4 h-4" /></div>;
      case 'Website': return <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded flex items-center justify-center"><Globe className="w-4 h-4" /></div>;
      case 'Action': return <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center"><Zap className="w-4 h-4" /></div>;
      case 'Social': return <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded flex items-center justify-center"><Share2 className="w-4 h-4" /></div>;
      default: return <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded flex items-center justify-center"><Gift className="w-4 h-4" /></div>;
    }
  };

  const activeTasks = tasks.filter(t => t.status === 'Active');

  // Task Execution State
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeUrl, setActiveUrl] = useState('');
  const [initialDuration, setInitialDuration] = useState(15);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizError, setQuizError] = useState('');
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [earnedFeedback, setEarnedFeedback] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  const startTask = (task: Task) => {
    if (!canEarn(task.reward)) return;
    
    // Extract valid URL
    const validUrls = extractTaskUrls(task);
    const chosenUrl = validUrls[Math.floor(Math.random() * validUrls.length)] || '';

    taskLogger.logUserTaskSelected(task, chosenUrl);

    // Direct complete for simple action/social tasks
    if (task.type !== 'Video' && task.type !== 'Website' && task.type !== 'Quiz') {
      const res = completeTask(task.reward, task.title);
      if (!res.success) {
        alert(res.message);
      } else {
        setEarnedFeedback(`+${formatCurrency(task.reward)} Earned!`);
        setTimeout(() => setEarnedFeedback(null), 3000);
      }
      return;
    }

    const duration = task.duration || 15;
    setActiveTask(task);
    setInitialDuration(duration);
    setTimer(duration);
    setIsTimerRunning(true);
    setQuizIndex(0);
    setQuizError('');
    setQuizSuccess(false);
    setSelectedOption(null);
    setActiveUrl(chosenUrl);
    setIsIframeLoading(true);

    // Setup Quiz questions
    if (task.type === 'Quiz') {
      let pool = easyMathQuizQuestions;
      if (task.quizData && Array.isArray(task.quizData) && task.quizData.length > 0) {
        pool = task.quizData;
      }
      const sanitized = sanitizeQuizQuestions(pool);
      const shuffled = [...sanitized].sort(() => 0.5 - Math.random());
      setQuizQuestions(shuffled);
      setQuizIndex(0);
    }
  };

  const nextQuizQuestion = () => {
    if (quizQuestions.length <= 1) {
      const refreshed = [...easyMathQuizQuestions].sort(() => 0.5 - Math.random());
      setQuizQuestions(refreshed);
      setQuizIndex(0);
    } else {
      setQuizIndex(prev => (prev + 1) % quizQuestions.length);
    }
    setQuizError('');
    setQuizSuccess(false);
    setSelectedOption(null);
  };

  useEffect(() => {
    if (activeTask && (activeTask.type === 'Website' || activeTask.type === 'Video')) {
      setIsIframeLoading(true);
      const timerFallback = setTimeout(() => {
        setIsIframeLoading(false);
      }, 4000);
      return () => clearTimeout(timerFallback);
    }
  }, [activeTask?.id, activeUrl]);

  useEffect(() => {
    let int: NodeJS.Timeout;
    if (activeTask && (activeTask.type === 'Video' || activeTask.type === 'Website') && isTimerRunning && timer > 0) {
      int = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            taskLogger.logUserMediaAction('timer_tick', { status: 'Timer completed', taskId: activeTask.id });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(int);
  }, [activeTask, isTimerRunning, timer]);

  const handleOpenLinkInNewTab = (url: string) => {
    taskLogger.logUserMediaAction('external_tab_opened', { url, taskId: activeTask?.id });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const claimTaskReward = () => {
    if (!activeTask) return;
    taskLogger.logUserMediaAction('reward_claimed', {
      taskId: activeTask.id,
      title: activeTask.title,
      reward: activeTask.reward
    });
    const res = completeTask(activeTask.reward, activeTask.title);
    if (res.success) {
      setEarnedFeedback(`🎉 Successfully claimed ${formatCurrency(activeTask.reward)}!`);
      setTimeout(() => setEarnedFeedback(null), 3500);
    } else {
      alert(res.message);
    }
    setActiveTask(null);
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (!activeTask || quizQuestions.length === 0) return;
    const currentQ = quizQuestions[quizIndex];
    setSelectedOption(optionIndex);
    
    // Evaluate correctness using math calculation, type coercion and index tolerance
    const isCorrect = isQuizAnswerCorrect(currentQ, optionIndex);
    
    if (isCorrect) {
      setQuizError('');
      setQuizSuccess(true);
      setTimeout(() => {
        claimTaskReward();
      }, 900);
    } else {
      setQuizError('ভুল উত্তর! আবার চেষ্টা করুন অথবা নতুন প্রশ্ন নিন। (Incorrect answer, try again)');
    }
  };

  const formattedMedia = activeUrl ? formatMediaUrl(activeUrl) : null;
  const progressPercent = initialDuration > 0 ? Math.round(((initialDuration - timer) / initialDuration) * 100) : 100;

  return (
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
        <div className="text-2xl font-bold text-white">{formatCurrency(currentUser.balance)}</div>
        
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
            <div key={task.id} className={`p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between transition-all ${!canEarn(task.reward) ? 'opacity-50 pointer-events-none' : 'hover:border-indigo-200 hover:bg-slate-50/80'}`}>
              <div className="flex items-center gap-2.5">
                {getTaskIcon(task.type)}
                <div>
                  <p className="text-xs font-bold text-slate-700">{task.title}</p>
                  <p className="text-[9px] text-slate-400">{task.description || `${task.limit}`}</p>
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
      </div>

      {/* Task Execution Modal (Video Ad & Direct Website Visit with Countdown) */}
      {activeTask && (activeTask.type === 'Video' || activeTask.type === 'Website') && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
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
          </div>

          {/* Real-time Linear Countdown Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 shrink-0">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          {/* Main Direct Content Area */}
          <div className="flex-1 w-full bg-slate-50 relative overflow-hidden flex flex-col">
            {activeTask.type === 'Video' ? (
              /* Video Task Container */
              <div className="flex-1 w-full flex flex-col items-center justify-center p-3 overflow-y-auto pb-32">
                <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center shadow-lg space-y-4">
                  {/* Embed Video or Direct Video */}
                  {formattedMedia && formattedMedia.embedUrl ? (
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-inner border border-slate-200 relative">
                      {/* Video Loading Skeleton Overlay */}
                      {isIframeLoading && (
                        <div className="absolute inset-0 z-20 bg-slate-50 flex flex-col items-center justify-center gap-3 transition-opacity duration-300">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin flex items-center justify-center"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-4 h-4 text-orange-500 fill-orange-500" />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-slate-700">Loading Video Stream...</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5 max-w-xs truncate px-2">{formattedMedia.originalUrl}</p>
                          </div>
                        </div>
                      )}

                      {formattedMedia.type === 'video' ? (
                        <video 
                          src={formattedMedia.embedUrl} 
                          autoPlay 
                          controls={false}
                          playsInline 
                          onLoadedData={() => setIsIframeLoading(false)}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      ) : (
                        <iframe 
                          src={formattedMedia.embedUrl} 
                          className="w-full h-full border-none pointer-events-none" 
                          title={activeTask.title}
                          onLoad={() => setIsIframeLoading(false)}
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen={false}
                        ></iframe>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl bg-slate-100 flex flex-col items-center justify-center text-center p-4">
                      <PlayCircle className="w-12 h-12 text-orange-400 mb-2 animate-pulse" />
                      <p className="text-slate-600 font-bold text-sm">Video Ad Ready</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Direct Live Website Frame with Seamless Countdown */
              <div className="flex-1 w-full h-full relative flex flex-col bg-white pb-24">
                {/* Secondary Website URL Bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs text-slate-600 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Website:</span>
                    <span className="font-mono text-[11px] text-slate-700 truncate max-w-xs sm:max-w-md">
                      {activeUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                    {isIframeLoading ? (
                      <span className="flex items-center gap-1 text-indigo-600 font-bold">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Website Iframe Container */}
                <div className="flex-1 w-full h-full relative bg-slate-50 overflow-hidden">
                  {/* Visual Loading Skeleton & Spinner */}
                  {isIframeLoading && (
                    <div className="absolute inset-0 z-20 bg-slate-50 flex flex-col justify-between p-4 sm:p-8 animate-pulse transition-opacity duration-300">
                      {/* Top Mock Header Skeleton */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                            <div className="w-28 h-4 rounded bg-slate-200"></div>
                          </div>
                          <div className="hidden sm:flex items-center gap-3">
                            <div className="w-16 h-3 rounded bg-slate-200"></div>
                            <div className="w-16 h-3 rounded bg-slate-200"></div>
                            <div className="w-20 h-7 rounded-lg bg-indigo-200"></div>
                          </div>
                        </div>

                        {/* Centered Loading Spinner Badge */}
                        <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center">
                          <div className="relative mb-3">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                            </div>
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600"></span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 mb-1">Loading Target Website...</h4>
                          <p className="text-xs text-slate-500 max-w-sm mb-3">
                            Please wait while the page loads. The task countdown is running at the bottom HUD.
                          </p>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-xs text-[11px] font-mono text-slate-600">
                            <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[240px] sm:max-w-xs">{activeUrl}</span>
                          </div>
                        </div>

                        {/* Mock Content Blocks Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                            <div className="w-full h-24 rounded-lg bg-slate-200"></div>
                            <div className="w-3/4 h-3.5 rounded bg-slate-200"></div>
                            <div className="w-full h-2.5 rounded bg-slate-100"></div>
                            <div className="w-2/3 h-2.5 rounded bg-slate-100"></div>
                          </div>
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs hidden sm:block">
                            <div className="w-full h-24 rounded-lg bg-slate-200"></div>
                            <div className="w-3/4 h-3.5 rounded bg-slate-200"></div>
                            <div className="w-full h-2.5 rounded bg-slate-100"></div>
                            <div className="w-2/3 h-2.5 rounded bg-slate-100"></div>
                          </div>
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs hidden sm:block">
                            <div className="w-full h-24 rounded-lg bg-slate-200"></div>
                            <div className="w-3/4 h-3.5 rounded bg-slate-200"></div>
                            <div className="w-full h-2.5 rounded bg-slate-100"></div>
                            <div className="w-2/3 h-2.5 rounded bg-slate-100"></div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-[10px] text-slate-400 pt-4">
                        Secure in-app sandbox active • Fast rendering mode
                      </div>
                    </div>
                  )}

                  {/* Direct Iframe Element */}
                  <iframe 
                    src={activeUrl}
                    className={`w-full h-full border-none transition-opacity duration-300 ${isIframeLoading ? 'opacity-0' : 'opacity-100'}`}
                    title={activeTask.title}
                    onLoad={() => setIsIframeLoading(false)}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </div>
              </div>
            )}

            {/* Overlay HUD Component for Task-Viewing Iframe */}
            <TaskIframeHud
              task={activeTask}
              url={activeUrl}
              initialDuration={initialDuration}
              remainingSeconds={timer}
              onFinishTask={claimTaskReward}
              onClose={() => setActiveTask(null)}
              onOpenExternal={() => handleOpenLinkInNewTab(formattedMedia?.originalUrl || activeUrl)}
              isIframeLoading={isIframeLoading}
            />
          </div>
        </div>
      )}

      {/* Task Execution Modal (Sohoj Math Quiz) */}
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
                      className={`p-3.5 rounded-xl border-2 transition-all font-bold text-base flex items-center justify-between cursor-pointer ${btnClass}`}
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
      )}
    </div>
  );
}
