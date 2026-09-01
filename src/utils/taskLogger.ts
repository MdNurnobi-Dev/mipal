import { Task } from '../types';
import { formatMediaUrl, extractTaskUrls, extractYouTubeId } from './urlHelper';

export interface TaskDiagnosticReport {
  taskId: string;
  title: string;
  type: string;
  status: string;
  rawActionUrls: any;
  rawActionUrl: any;
  extractedUrls: string[];
  parsedMedia: any[];
  issues: string[];
  isValid: boolean;
}

const STYLES = {
  db: 'background: #1e1b4b; color: #c7d2fe; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
  context: 'background: #064e3b; color: #a7f3d0; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
  admin: 'background: #701a75; color: #f5d0fe; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
  user: 'background: #0c4a6e; color: #bae6fd; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
  warn: 'background: #78350f; color: #fde68a; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
  error: 'background: #7f1d1d; color: #fecaca; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
  info: 'background: #334155; color: #e2e8f0; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
};

/**
 * Detailed Task Pipeline Logger for tracking task flow from DB -> Server -> Context -> Admin/User UI
 */
export const taskLogger = {
  /**
   * Log when tasks are fetched from DB / Server into App Context
   */
  logContextHydration(tasks: Task[]) {
    const timestamp = new Date().toLocaleTimeString();
    console.groupCollapsed(`%c[TASK-FLOW: SERVER->CONTEXT]%c Loaded ${tasks.length} tasks @ ${timestamp}`, STYLES.context, 'color: inherit');
    console.log(`Total Tasks Received:`, tasks.length);
    
    const breakdown = {
      video: tasks.filter(t => t.type === 'Video').length,
      website: tasks.filter(t => t.type === 'Website').length,
      quiz: tasks.filter(t => t.type === 'Quiz').length,
      other: tasks.filter(t => !['Video', 'Website', 'Quiz'].includes(t.type)).length,
      active: tasks.filter(t => t.status === 'Active').length,
      paused: tasks.filter(t => t.status === 'Paused').length,
    };
    console.table(breakdown);

    // Audit each task for URL integrity
    const reports: TaskDiagnosticReport[] = tasks.map(t => taskLogger.diagnoseTask(t));
    const faulty = reports.filter(r => !r.isValid || r.issues.length > 0);
    
    if (faulty.length > 0) {
      console.warn(`%c[TASK-FLOW WARNING]%c Detected ${faulty.length} task(s) with potential URL / data configuration issues:`, STYLES.warn, 'color: inherit', faulty);
    } else {
      console.log(`%c[TASK-FLOW OK]%c All ${tasks.length} tasks passed preliminary URL data integrity check.`, STYLES.info, 'color: inherit');
    }

    console.log('Full Tasks Snapshot:', tasks);
    console.groupEnd();
  },

  /**
   * Log task mutation initiated by Admin (Add, Update, Delete)
   */
  logAdminMutation(action: 'insert' | 'update' | 'delete', taskId: string, payload: any) {
    const timestamp = new Date().toLocaleTimeString();
    console.groupCollapsed(`%c[TASK-FLOW: ADMIN MUTATION]%c ${action.toUpperCase()} Task [${taskId}] @ ${timestamp}`, STYLES.admin, 'color: inherit');
    console.log('Mutation Action:', action);
    console.log('Task ID:', taskId);
    console.log('Payload Data:', payload);

    if (payload && (payload.type === 'Video' || payload.type === 'Website')) {
      const extracted = extractTaskUrls(payload as Task);
      console.log('Extracted URLs:', extracted);
      extracted.forEach((url, i) => {
        const media = formatMediaUrl(url);
        console.log(`URL [${i + 1}] Parsed Media:`, {
          originalUrl: url,
          mediaType: media.type,
          embedUrl: media.embedUrl,
          videoId: media.videoId,
          hostname: media.hostname
        });
      });
    }
    console.groupEnd();
  },

  /**
   * Log when user triggers a task in User UI (Earnings / Home)
   */
  logUserTaskSelected(task: Task, chosenUrl: string) {
    const timestamp = new Date().toLocaleTimeString();
    const media = formatMediaUrl(chosenUrl);
    console.group(`%c[TASK-FLOW: USER TASK START]%c "${task.title}" (${task.type}) @ ${timestamp}`, STYLES.user, 'color: inherit');
    console.log('Selected Task Details:', {
      id: task.id,
      title: task.title,
      type: task.type,
      reward: task.reward,
      duration: task.duration || 15,
      status: task.status
    });
    console.log('Extracted Task URLs:', extractTaskUrls(task));
    console.log('Chosen Target URL:', chosenUrl);
    console.log('Resolved Media Representation:', media);

    if (task.type === 'Video' && media.type === 'youtube') {
      console.log(`%c[YOUTUBE EMBED VERIFICATION]%c Video ID: ${media.videoId} | Embed URL: ${media.embedUrl}`, STYLES.info, 'color: inherit');
    } else if (task.type === 'Website') {
      console.log(`%c[WEBSITE VISIT TRACKING]%c Target Hostname: ${media.hostname} | External Link: ${media.originalUrl}`, STYLES.info, 'color: inherit');
    }
    console.groupEnd();
  },

  /**
   * Log when an external URL is opened or iframe state changes
   */
  logUserMediaAction(action: 'iframe_mounted' | 'external_tab_opened' | 'timer_tick' | 'reward_claimed', details: any) {
    console.log(`%c[TASK-FLOW: ACTION: ${action.toUpperCase()}]%c`, STYLES.info, 'color: inherit', details);
  },

  /**
   * Run a deep diagnostic audit on a single task object
   */
  diagnoseTask(task: Task): TaskDiagnosticReport {
    const issues: string[] = [];
    const extractedUrls = extractTaskUrls(task);
    const parsedMedia = extractedUrls.map(u => formatMediaUrl(u));

    if (!task.title || task.title.trim().length === 0) {
      issues.push('Missing or empty title.');
    }

    if (task.type === 'Video') {
      if (extractedUrls.length === 0) {
        issues.push('No video URLs configured for Video task.');
      } else {
        extractedUrls.forEach((u, i) => {
          if (!u.startsWith('http://') && !u.startsWith('https://')) {
            issues.push(`URL #${i + 1} (${u}) is missing http/https protocol.`);
          }
          if (u.includes('youtube.com') || u.includes('youtu.be')) {
            const ytId = extractYouTubeId(u);
            if (!ytId) {
              issues.push(`YouTube URL #${i + 1} (${u}) has invalid or unextractable Video ID.`);
            }
          }
        });
      }
    } else if (task.type === 'Website') {
      if (extractedUrls.length === 0) {
        issues.push('No target URLs configured for Website task.');
      } else {
        extractedUrls.forEach((u, i) => {
          if (!u.startsWith('http://') && !u.startsWith('https://')) {
            issues.push(`Website URL #${i + 1} (${u}) is missing http/https protocol.`);
          }
        });
      }
    } else if (task.type === 'Quiz') {
      if (task.quizData && Array.isArray(task.quizData)) {
        if (task.quizData.length === 0) {
          issues.push('QuizData array is empty.');
        } else {
          task.quizData.forEach((q, qIdx) => {
            if (!q.question) issues.push(`Quiz Q#${qIdx + 1} is missing a question prompt.`);
            if (!Array.isArray(q.options) || q.options.length < 2) issues.push(`Quiz Q#${qIdx + 1} has insufficient answer options.`);
          });
        }
      }
    }

    return {
      taskId: task.id,
      title: task.title,
      type: task.type,
      status: task.status,
      rawActionUrls: task.actionUrls,
      rawActionUrl: task.actionUrl,
      extractedUrls,
      parsedMedia,
      issues,
      isValid: issues.length === 0
    };
  }
};

// Expose diagnostic audit tool globally on browser window for easy DevTools debugging
if (typeof window !== 'undefined') {
  (window as any).__TASK_DIAGNOSTICS__ = {
    audit: (tasksArray?: Task[]) => {
      console.log('%c=== TASK DATA FLOW DIAGNOSTIC AUDIT ===', 'background: #312e81; color: #e0e7ff; font-weight: bold; font-size: 14px; padding: 4px 8px;');
      const currentTasks = tasksArray || (window as any).__CURRENT_TASKS__ || [];
      if (!currentTasks || currentTasks.length === 0) {
        console.warn('No active tasks currently registered in memory.');
        return [];
      }
      const reports = currentTasks.map((t: Task) => taskLogger.diagnoseTask(t));
      console.table(reports.map(r => ({
        ID: r.taskId,
        Title: r.title,
        Type: r.type,
        Status: r.status,
        URLs: r.extractedUrls.join(', '),
        Issues: r.issues.length > 0 ? r.issues.join('; ') : 'None (Healthy)',
        Valid: r.isValid ? 'YES' : 'NO'
      })));
      return reports;
    },
    parseUrl: (url: string) => {
      console.log('Testing URL:', url);
      const res = formatMediaUrl(url);
      console.log('Result:', res);
      return res;
    }
  };
}
