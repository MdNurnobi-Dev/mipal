/**
 * Global Event Emitter and Synchronization Engine
 * Handles decoupled, typed event broadcasting across components, frames, tabs, and windows.
 */

type EventHandler<T = any> = (data: T) => void;

class AppEventEmitter {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private channelName = 'earnify_global_sync_channel';

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type) {
            this.emitLocal(event.data.type, event.data.payload);
          }
        };
      } catch (e) {
        console.warn('[EventEmitter] BroadcastChannel initialization skipped/failed:', e);
      }
    }

    // Attach local DOM event listener for custom events
    if (typeof window !== 'undefined') {
      window.addEventListener('earnify:event', ((e: CustomEvent) => {
        if (e.detail?.type) {
          this.emitLocal(e.detail.type, e.detail.payload);
        }
      }) as EventListener);
    }
  }

  /**
   * Subscribe to a named event
   */
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return un-subscriber
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Remove a subscriber
   */
  off<T = any>(event: string, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event locally (only this window/context)
   */
  emitLocal<T = any>(event: string, payload?: T): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[EventEmitter] Error executing listener for event '${event}':`, err);
        }
      });
    }
  }

  /**
   * Emit an event globally (local listeners + DOM events + BroadcastChannel + localStorage)
   */
  emit<T = any>(event: string, payload?: T): void {
    // 1. Local execution
    this.emitLocal(event, payload);

    // 2. DOM CustomEvent
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('earnify:event', { detail: { type: event, payload } }));
      } catch (e) {
        // ignore
      }
    }

    // 3. BroadcastChannel (cross-tab / cross-window)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: event, payload, timestamp: Date.now() });
      } catch (e) {
        // ignore
      }
    }

    // 4. Storage fallback for sandboxed iframes
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('earnify_sync_event', JSON.stringify({ type: event, payload, timestamp: Date.now() }));
      } catch (e) {
        // ignore
      }
    }
  }
}

export const appEvents = new AppEventEmitter();

// Common Event Names
export const SYNC_EVENTS = {
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  CURRENCY_CHANGED: 'CURRENCY_CHANGED',
  TRANSACTION_PROCESSED: 'TRANSACTION_PROCESSED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  RELOAD_DATA_REQUESTED: 'RELOAD_DATA_REQUESTED',
};
