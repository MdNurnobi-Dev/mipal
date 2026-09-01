import { Task } from '../types';

export interface FormattedMedia {
  type: 'youtube' | 'vimeo' | 'dailymotion' | 'video' | 'website';
  embedUrl: string;
  originalUrl: string;
  videoId?: string;
  thumbnailUrl?: string;
  hostname?: string;
}

/**
 * Extract YouTube Video ID from any URL format
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // Regex covering standard watch, youtu.be, shorts, embed, live, mobile, v, etc.
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/|e\/))([a-zA-Z0-9_-]{11})/i,
    /youtube\.com\/.*?[\?&]v=([a-zA-Z0-9_-]{11})/i,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/i
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Helper to process video and website URLs so they can be rendered safely in players, previews, or direct links.
 */
export function formatMediaUrl(rawUrl: string): FormattedMedia {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { 
      type: 'website', 
      embedUrl: 'https://google.com', 
      originalUrl: 'https://google.com',
      hostname: 'google.com'
    };
  }

  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  let hostname = '';
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    hostname = url;
  }

  // 1. Check YouTube
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      type: 'youtube',
      videoId: ytId,
      // Standard YouTube embed compatible with all browsers & mobile devices
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=1&rel=0&playsinline=1&enablejsapi=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      originalUrl: url.startsWith('http') ? url : `https://www.youtube.com/watch?v=${ytId}`,
      hostname: 'youtube.com'
    };
  }

  // 2. Check Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=0&responsive=1`,
      originalUrl: url,
      hostname: 'vimeo.com'
    };
  }

  // 3. Check Dailymotion
  const dmMatch = url.match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/i);
  if (dmMatch && dmMatch[1]) {
    return {
      type: 'dailymotion',
      videoId: dmMatch[1],
      embedUrl: `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=1&mute=0`,
      originalUrl: url,
      hostname: 'dailymotion.com'
    };
  }

  // 4. Check direct video file
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return {
      type: 'video',
      embedUrl: url,
      originalUrl: url,
      hostname
    };
  }

  // 5. Standard Website / Web link
  return {
    type: 'website',
    embedUrl: url,
    originalUrl: url,
    hostname
  };
}

/**
 * Safely extracts an array of valid URLs from a Task object,
 * parsing JSON strings if needed.
 */
export function extractTaskUrls(task: Task): string[] {
  const result: string[] = [];

  // Check actionUrls
  if (task.actionUrls) {
    if (Array.isArray(task.actionUrls)) {
      task.actionUrls.forEach(u => {
        if (u && typeof u === 'string' && u.trim().length > 0) {
          result.push(u.trim());
        }
      });
    } else if (typeof task.actionUrls === 'string') {
      try {
        const parsed = JSON.parse(task.actionUrls);
        if (Array.isArray(parsed)) {
          parsed.forEach(u => {
            if (u && typeof u === 'string' && u.trim().length > 0) {
              result.push(u.trim());
            }
          });
        }
      } catch (e) {
        if ((task.actionUrls as string).trim().length > 0) {
          result.push((task.actionUrls as string).trim());
        }
      }
    }
  }

  // Check actionUrl
  if (task.actionUrl && typeof task.actionUrl === 'string' && task.actionUrl.trim().length > 0) {
    const trimmed = task.actionUrl.trim();
    if (!result.includes(trimmed)) {
      result.push(trimmed);
    }
  }

  // Fallbacks if nothing found
  if (result.length === 0) {
    if (task.type === 'Video') {
      result.push('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    } else if (task.type === 'Website') {
      result.push('https://google.com');
    }
  }

  return result;
}
