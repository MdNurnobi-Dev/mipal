/**
 * Cloudflare D1 & R2 Backend API Adapter
 * Connects the frontend to Cloudflare Pages Functions / Workers.
 * Features automated fallback to local state if backend endpoints are unavailable.
 */

export interface ApiHealthResponse {
  status: string;
  platform: string;
  d1Database?: { binding: string; status: string; tablesCount: number };
  r2Storage?: { binding: string; status: string };
}

// 1. Health & Infrastructure Check
export async function checkBackendHealth(): Promise<ApiHealthResponse | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

// 2. Cloudflare R2 Media Upload Adapter
export async function uploadToR2(
  fileOrBase64: File | string,
  folder: 'avatars' | 'receipts' | 'banners' | 'general' = 'general'
): Promise<{ success: boolean; url: string; key?: string }> {
  try {
    if (typeof fileOrBase64 === 'string') {
      // JSON Base64 Payload
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: fileOrBase64, folder }),
      });
      if (!res.ok) throw new Error('R2 upload failed');
      const data = await res.json();
      return { success: true, url: data.url, key: data.key };
    } else {
      // Multipart Form Data Payload
      const formData = new FormData();
      formData.append('file', fileOrBase64);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('R2 upload failed');
      const data = await res.json();
      return { success: true, url: data.url, key: data.key };
    }
  } catch (err) {
    // Graceful fallback for local development: return base64 string if available
    if (typeof fileOrBase64 === 'string') {
      return { success: false, url: fileOrBase64 };
    }
    return { success: false, url: URL.createObjectURL(fileOrBase64) };
  }
}

// 3. User Operations (Cloudflare D1)
export async function d1FetchUsers() {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) return null;
    const data = await res.json();
    return data.users;
  } catch (_) {
    return null;
  }
}

export async function d1RegisterUser(payload: { name: string; email: string; referralCode?: string; phone?: string }) {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function d1UpdateUser(id: string, updates: Record<string, any>) {
  try {
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. Task Operations (Cloudflare D1)
export async function d1FetchTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) return null;
    const data = await res.json();
    return data.tasks;
  } catch (_) {
    return null;
  }
}

export async function d1CompleteTask(userId: string, taskId?: string, taskTitle?: string, amount?: number) {
  try {
    const res = await fetch('/api/tasks/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, taskId, taskTitle, amount }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 5. Transaction Operations (Cloudflare D1)
export async function d1FetchTransactions(userId?: string) {
  try {
    const url = userId ? `/api/transactions?userId=${encodeURIComponent(userId)}` : '/api/transactions';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.transactions;
  } catch (_) {
    return null;
  }
}

export async function d1SubmitTransaction(payload: {
  userId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  method: string;
  txId?: string;
  proofImg?: string;
  userDetails?: string;
}) {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function d1ModerateTransaction(id: string, action: 'approve' | 'reject') {
  try {
    const res = await fetch('/api/transactions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 6. Plan Subscription Operations (Cloudflare D1)
export async function d1FetchPlans() {
  try {
    const res = await fetch('/api/plans');
    if (!res.ok) return null;
    const data = await res.json();
    return data.plans;
  } catch (_) {
    return null;
  }
}

export async function d1BuyPlan(userId: string, planId: string) {
  try {
    const res = await fetch('/api/plans/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, planId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 7. Community Feed Operations (Cloudflare D1)
export async function d1FetchPosts(userId?: string) {
  try {
    const url = userId ? `/api/posts?userId=${encodeURIComponent(userId)}` : '/api/posts';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.posts;
  } catch (_) {
    return null;
  }
}

export async function d1CreatePost(payload: { userId: string; userName: string; userAvatar?: string; content: string }) {
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_post', ...payload }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function d1TogglePostLike(postId: string, userId: string) {
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_like', postId, userId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function d1AddPostComment(payload: { postId: string; userId: string; userName: string; userAvatar?: string; content: string }) {
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_comment', ...payload }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 8. Settings Operations (Cloudflare D1)
export async function d1FetchSettings() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

export async function d1UpdateSettings(type: 'site_settings' | 'referral_settings' | 'daily_reward_settings' | 'save_gateway' | 'save_banner' | 'delete_banner', payload: any) {
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
