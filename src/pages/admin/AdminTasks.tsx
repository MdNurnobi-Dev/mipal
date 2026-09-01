import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Pause, Play, Trash, ExternalLink, HelpCircle, AlertCircle, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { Task, QuizQuestion } from '../../types';
import { easyMathQuizQuestions } from '../../data/mathQuizzes';
import { sanitizeQuizQuestions } from '../../utils/quizHelper';
import { formatMediaUrl, extractTaskUrls, extractYouTubeId } from '../../utils/urlHelper';
import { taskLogger } from '../../utils/taskLogger';

export default function AdminTasks() {
  const { tasks, addTask, updateTask, deleteTask } = useApp();
  const { currencySymbol, formatCurrency } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [diagnosticFeedback, setDiagnosticFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Video',
    reward: '0.15',
    limit: '30/day',
    description: '',
    status: 'Active' as 'Active' | 'Paused',
    actionUrls: [''],
    actionUrl: '',
    duration: '15',
    quizData: [] as QuizQuestion[]
  });

  // Run audit log on mount or tasks change
  useEffect(() => {
    console.log('%c[AdminTasks: Mounted / Tasks Updated]%c Total tasks in state: ' + tasks.length, 'background: #581c87; color: #f3e8ff; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: inherit', tasks);
  }, [tasks]);

  const handleOpenModal = (task?: Task) => {
    if (task) {
      console.log('%c[AdminTasks: Edit Modal Open]%c Task being edited:', 'background: #701a75; color: #fdf4ff; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: inherit', task);
      setEditingTask(task);
      const urls = extractTaskUrls(task);
      
      let quiz: QuizQuestion[] = [];
      if (task.quizData) {
        if (Array.isArray(task.quizData)) quiz = task.quizData;
        else if (typeof task.quizData === 'string') {
          try { quiz = JSON.parse(task.quizData); } catch(e) {}
        }
      }
      if (task.type === 'Quiz' && quiz.length === 0) {
        quiz = easyMathQuizQuestions;
      }

      const report = taskLogger.diagnoseTask(task);
      console.log('[AdminTasks: Task Diagnostic Report]:', report);

      setFormData({
        title: task.title,
        type: task.type,
        reward: task.reward.toString(),
        limit: task.limit,
        description: task.description || '',
        status: task.status,
        actionUrls: urls.length > 0 ? urls : [''],
        actionUrl: urls[0] || '',
        duration: task.duration ? task.duration.toString() : '15',
        quizData: quiz
      });
    } else {
      console.log('%c[AdminTasks: New Task Modal Open]%c Setting default template', 'background: #701a75; color: #fdf4ff; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: inherit');
      setEditingTask(null);
      setFormData({
        title: '',
        type: 'Video',
        reward: '0.15',
        limit: '30/day',
        description: '',
        status: 'Active',
        actionUrls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        actionUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: '15',
        quizData: easyMathQuizQuestions
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData: Omit<Task, 'id'> = {
      title: formData.title.trim(),
      type: formData.type,
      reward: parseFloat(formData.reward) || 0.1,
      limit: formData.limit.trim() || '30/day',
      description: formData.description.trim(),
      status: formData.status
    };

    if (formData.type === 'Video' || formData.type === 'Website') {
      const cleanUrls = formData.actionUrls
        .map(u => u.trim())
        .filter(u => u.length > 0);
      
      const finalUrls = cleanUrls.length > 0 
        ? cleanUrls 
        : (formData.type === 'Video' ? ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'] : ['https://wikipedia.org']);
      
      taskData.actionUrls = finalUrls;
      taskData.actionUrl = finalUrls[0];
      taskData.duration = parseInt(formData.duration) || 15;
    } else if (formData.type === 'Quiz') {
      const rawPool = formData.quizData.length > 0 ? formData.quizData : easyMathQuizQuestions;
      taskData.quizData = sanitizeQuizQuestions(rawPool);
    }

    console.log('%c[AdminTasks: Submitting Task Data]%c', 'background: #1e3a8a; color: #dbeafe; font-weight: bold; padding: 2px 6px; border-radius: 4px;', 'color: inherit', taskData);

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (task: Task) => {
    console.log(`[AdminTasks: Toggle Status] Task [${task.id}] from ${task.status} -> ${task.status === 'Active' ? 'Paused' : 'Active'}`);
    updateTask(task.id, { status: task.status === 'Active' ? 'Paused' : 'Active' });
  };

  const runLiveAudit = () => {
    if (typeof window !== 'undefined' && (window as any).__TASK_DIAGNOSTICS__) {
      const reports = (window as any).__TASK_DIAGNOSTICS__.audit(tasks);
      const invalidCount = reports.filter((r: any) => !r.isValid).length;
      setDiagnosticFeedback(`Audit Complete: ${reports.length} tasks analyzed (${invalidCount} issues detected). Check browser DevTools Console!`);
      setTimeout(() => setDiagnosticFeedback(null), 4000);
    }
  };

  const addQuizQuestion = () => {
    setFormData({
      ...formData,
      quizData: [
        { question: '10 + 5 = ?', options: ['12', '15', '18', '20'], correctIndex: 1 },
        ...formData.quizData
      ]
    });
  };

  const updateQuizQuestion = (index: number, field: string, value: any, optionIndex?: number) => {
    const newData = [...formData.quizData];
    if (field === 'question') {
      newData[index].question = value;
    } else if (field === 'correctIndex') {
      newData[index].correctIndex = parseInt(value);
    } else if (field === 'option' && optionIndex !== undefined) {
      newData[index].options[optionIndex] = value;
    }
    setFormData({ ...formData, quizData: newData });
  };

  const removeQuizQuestion = (index: number) => {
    const newData = [...formData.quizData];
    newData.splice(index, 1);
    setFormData({ ...formData, quizData: newData });
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-8">
      {diagnosticFeedback && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>{diagnosticFeedback}</span>
          </div>
          <span className="text-[10px] text-indigo-600 uppercase tracking-wider font-mono">DevTools Active</span>
        </div>
      )}

      <div className="flex justify-between items-end flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Micro Tasks (টাস্ক ম্যানেজমেন্ট)</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage Video Ads, Sohoj Math Quizzes, and Website Visits for users.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runLiveAudit}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors"
            title="Inspect task data flow and URL health in DevTools Console"
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Console Audit (লগ ও ডায়াগনস্টিক)</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Task
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Task Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Reward</th>
              <th className="px-4 py-3">Limit / Req</th>
              <th className="px-4 py-3">Target URLs / Data</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No tasks found. Click "Add New Task" to create one.
                </td>
              </tr>
            )}
            {tasks.map(task => {
              const urls = extractTaskUrls(task);
              const isVideoOrWeb = task.type === 'Video' || task.type === 'Website';
              const hasUrlIssue = isVideoOrWeb && urls.length === 0;

              return (
                <tr key={task.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{task.title}</p>
                    <p className="text-[10px] text-slate-400">{task.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {task.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">
                    +{formatCurrency(task.reward)}
                  </td>
                  <td className="px-4 py-3">
                    {task.limit}
                    {task.duration && (
                      <span className="block text-[10px] text-slate-400">{task.duration}s view</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {task.type === 'Quiz' ? (
                      <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                        {Array.isArray(task.quizData) ? `${task.quizData.length} Questions` : '50 Math Questions'}
                      </span>
                    ) : hasUrlIssue ? (
                      <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> No URLs Set
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 max-w-[200px]">
                        <span className="text-[10px] text-slate-600 truncate" title={urls[0] || 'No URL'}>
                          {urls.length > 1 ? `${urls.length} URLs configured` : (urls[0] || 'No URL')}
                        </span>
                        {urls[0] && (
                          <a href={urls[0]} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-700 shrink-0">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      task.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(task)}
                        className={`p-1.5 rounded transition-colors ${task.status === 'Active' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`} 
                        title={task.status === 'Active' ? 'Pause Task' : 'Activate Task'}
                      >
                        {task.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        onClick={() => handleOpenModal(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" 
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm('Are you sure you want to delete this task?')) {
                            deleteTask(task.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-800">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <form id="task-form" onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Task Title</label>
                  <input 
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    placeholder="e.g. Watch Video Ad / Sohoj Math Quiz"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reward Amount ({currencySymbol})</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.reward}
                      onChange={(e) => setFormData({...formData, reward: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="Video">Video Ad (ভিডিও বিজ্ঞাপন)</option>
                      <option value="Quiz">Sohoj Math Quiz (সহজ গণিত কুইজ)</option>
                      <option value="Website">Website Visit (ওয়েবসাইট ভিজিট)</option>
                      <option value="Action">Action</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Daily Limit</label>
                    <input 
                      type="text"
                      required
                      value={formData.limit}
                      onChange={(e) => setFormData({...formData, limit: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                      placeholder="e.g. 20/day"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Paused'})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Task Description / Requirement</label>
                  <input 
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    placeholder="e.g. 15 seconds required"
                  />
                </div>

                {(formData.type === 'Video' || formData.type === 'Website') && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      {formData.type === 'Video' ? 'Video Ads URLs & Timer' : 'Website URLs & Timer'}
                    </h4>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Target URLs (Randomly Selected for User)
                        </label>
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, actionUrls: [...formData.actionUrls, '']})}
                          className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100"
                        >
                          + Add URL
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.actionUrls.map((url, idx) => {
                          const parsed = url.trim() ? formatMediaUrl(url) : null;
                          const ytId = url.trim() ? extractYouTubeId(url) : null;
                          const isInvalidYt = formData.type === 'Video' && (url.includes('youtube.com') || url.includes('youtu.be')) && !ytId;

                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex gap-2 items-center">
                                <input 
                                  type="url"
                                  required
                                  value={url}
                                  onChange={(e) => {
                                    const newUrls = [...formData.actionUrls];
                                    newUrls[idx] = e.target.value;
                                    setFormData({...formData, actionUrls: newUrls});
                                  }}
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                                  placeholder={formData.type === 'Video' ? 'https://www.youtube.com/watch?v=... or https://youtu.be/...' : 'https://example.com'}
                                />
                                {url && (
                                  <button
                                    type="button"
                                    onClick={() => window.open(url, '_blank')}
                                    className="p-2 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg shrink-0"
                                    title="Test Link in New Tab"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                )}
                                {formData.actionUrls.length > 1 && (
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const newUrls = [...formData.actionUrls];
                                      newUrls.splice(idx, 1);
                                      setFormData({...formData, actionUrls: newUrls});
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-lg shrink-0"
                                    title="Remove URL"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              {/* Real-time URL Diagnostic Preview Tag */}
                              {parsed && (
                                <div className="text-[10px] text-slate-500 flex items-center gap-2 pl-1">
                                  <span className="font-mono font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                    Format: {parsed.type.toUpperCase()}
                                  </span>
                                  {ytId && (
                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                                      Video ID: {ytId}
                                    </span>
                                  )}
                                  {isInvalidYt && (
                                    <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" /> Could not extract YouTube video ID
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        {formData.type === 'Video'
                          ? 'Paste any YouTube video link, Shorts, Vimeo, or MP4 URL. System converts it automatically to an embedded video player.'
                          : 'Paste any website or landing page URL. The timer will run on user visit.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Required View Duration (Seconds)</label>
                      <input 
                        type="number"
                        required
                        min="5"
                        max="300"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white"
                        placeholder="15"
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'Quiz' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">Math Quiz Questions ({formData.quizData.length})</h4>
                        <p className="text-[10px] text-slate-500">Easily manage the question bank for users.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => setFormData({ ...formData, quizData: easyMathQuizQuestions })} 
                          className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          + Load 50 Easy Math Questions
                        </button>
                        <button 
                          type="button" 
                          onClick={addQuizQuestion} 
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        >
                          + Add Single Question
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {formData.quizData.map((q, qIndex) => (
                        <div key={qIndex} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400">Q#{qIndex + 1}</span>
                            <button 
                              type="button" 
                              onClick={() => removeQuizQuestion(qIndex)}
                              className="text-slate-400 hover:text-red-500 text-xs p-1"
                              title="Delete Question"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <input 
                            type="text" 
                            value={q.question} 
                            onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                            placeholder="Question (e.g. 5 + 7 = ?)"
                            className="w-full text-xs font-bold border border-slate-200 rounded px-2 py-1.5 outline-none focus:border-indigo-500"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-1.5">
                                <input 
                                  type="radio" 
                                  name={`correct-${qIndex}`} 
                                  checked={Number(q.correctIndex) === optIndex} 
                                  onChange={() => updateQuizQuestion(qIndex, 'correctIndex', optIndex)}
                                  className="text-indigo-600 cursor-pointer"
                                  title="Mark as correct answer"
                                />
                                <input 
                                  type="text" 
                                  value={opt} 
                                  onChange={(e) => updateQuizQuestion(qIndex, 'option', e.target.value, optIndex)}
                                  placeholder={`Option ${['A', 'B', 'C', 'D'][optIndex]}`}
                                  className={`w-full text-xs border rounded px-2 py-1 outline-none ${q.correctIndex === optIndex ? 'border-emerald-500 bg-emerald-50/50 font-bold' : 'border-slate-200'}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="task-form"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm"
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
