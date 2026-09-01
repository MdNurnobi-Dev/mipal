import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SiteSettings } from '../types';
import { appEvents, SYNC_EVENTS } from '../utils/eventEmitter';

export interface UseSiteSettingsOptions {
  /**
   * Interval in milliseconds for polling the database in the background.
   * Set to 0 or null to disable polling and rely purely on event-driven updates.
   * Default: 10000ms (10 seconds)
   */
  pollInterval?: number | null;
  /**
   * Enable or disable automatic background polling.
   * Default: true
   */
  enablePolling?: boolean;
}

/**
 * Custom hook that provides real-time access to the current siteSettings.
 * Subscribes to:
 * 1. AppContext state updates
 * 2. Cross-tab/window event emitter broadcasts (BroadcastChannel / CustomEvent / storage)
 * 3. Configurable background polling fallback to detect direct database modifications
 */
export function useSiteSettings(options?: UseSiteSettingsOptions) {
  const { siteSettings, updateSiteSettings, refreshSettings } = useApp();
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const pollInterval = options?.pollInterval ?? 10000;
  const enablePolling = options?.enablePolling ?? true;

  // Keep local copy synchronized when AppContext siteSettings reference updates
  useEffect(() => {
    setLocalSettings(siteSettings);
    setLastUpdated(Date.now());
  }, [siteSettings]);

  // Subscribe to real-time sync event emitter
  useEffect(() => {
    const handleSettingsUpdated = (data?: { key?: string; value?: any }) => {
      if (!data || data.key === 'siteSettings') {
        const val = data?.value;
        if (val) {
          const sym = val.currencySymbol || val.currency || '৳';
          setLocalSettings(prev => ({ ...prev, ...val, currency: sym, currencySymbol: sym }));
        }
        setLastUpdated(Date.now());
      }
    };

    const handleCurrencyChanged = (data?: { currencySymbol?: string }) => {
      if (data?.currencySymbol) {
        setLocalSettings(prev => ({
          ...prev,
          currency: data.currencySymbol,
          currencySymbol: data.currencySymbol
        }));
        setLastUpdated(Date.now());
      }
    };

    const unsubSettings = appEvents.on(SYNC_EVENTS.SETTINGS_UPDATED, handleSettingsUpdated);
    const unsubCurrency = appEvents.on(SYNC_EVENTS.CURRENCY_CHANGED, handleCurrencyChanged);
    const unsubReload = appEvents.on(SYNC_EVENTS.RELOAD_DATA_REQUESTED, () => {
      refreshSettings?.().catch(() => {});
    });

    return () => {
      unsubSettings();
      unsubCurrency();
      unsubReload();
    };
  }, [refreshSettings]);

  // Optional background polling mechanism to catch direct database or server changes
  useEffect(() => {
    if (!enablePolling || !pollInterval || pollInterval <= 0) return;

    let isMounted = true;
    const intervalId = setInterval(async () => {
      // Avoid spamming requests if tab is hidden/idle unless needed
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      try {
        if (refreshSettings && isMounted) {
          await refreshSettings();
        }
      } catch (err) {
        console.warn('[useSiteSettings] Background polling error:', err);
      }
    }, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [enablePolling, pollInterval, refreshSettings]);

  // Manual explicit refresh function
  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (refreshSettings) {
        await refreshSettings();
      }
      setLastUpdated(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSettings]);

  const currencySymbol = localSettings?.currencySymbol || localSettings?.currency || '৳';
  const siteName = localSettings?.siteName || 'Earnify';

  return {
    siteSettings: localSettings,
    settings: localSettings,
    currencySymbol,
    siteName,
    isRefreshing,
    lastUpdated,
    updateSiteSettings,
    refetch,
    refresh: refetch,
  };
}

export default useSiteSettings;
