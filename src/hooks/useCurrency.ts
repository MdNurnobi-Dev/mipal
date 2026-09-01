import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { appEvents, SYNC_EVENTS } from '../utils/eventEmitter';

/**
 * Custom hook that provides the active currency symbol and a formatter function
 * backed by siteSettings.currencySymbol / siteSettings.currency from AppContext.
 * Automatically synchronizes and re-renders upon real-time broadcast events.
 */
export function useCurrency() {
  const { siteSettings } = useApp();
  const [, setTick] = useState(0);

  // Subscribe to real-time broadcast events for immediate re-render across any component hierarchy
  useEffect(() => {
    const unsubSettings = appEvents.on(SYNC_EVENTS.SETTINGS_UPDATED, () => {
      setTick(t => t + 1);
    });
    const unsubCurrency = appEvents.on(SYNC_EVENTS.CURRENCY_CHANGED, () => {
      setTick(t => t + 1);
    });
    return () => {
      unsubSettings();
      unsubCurrency();
    };
  }, []);

  // Prefer currencySymbol, fallback to currency, fallback to '৳'
  const currencySymbol = siteSettings?.currencySymbol || siteSettings?.currency || '৳';
  const symbol = currencySymbol;

  /**
   * Formats any numeric value or numeric string into a currency string (e.g., "$12.50" or "৳12.50")
   * @param amount The numeric amount to format
   * @param decimals The number of decimal places (default 2)
   */
  const formatCurrency = (amount?: number | string | null, decimals: number = 2): string => {
    if (amount === undefined || amount === null || amount === '') {
      return `${currencySymbol}${(0).toFixed(decimals)}`;
    }
    const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, ''));
    const safeNum = isNaN(num) ? 0 : num;
    return `${currencySymbol}${safeNum.toFixed(decimals)}`;
  };

  /**
   * Formats an amount with an explicit plus or minus sign (e.g. "+$10.00" or "-৳5.00")
   */
  const formatSignedCurrency = (amount?: number | string | null, type?: string, decimals: number = 2): string => {
    const isPositive = type ? ['deposit', 'task_earning', 'referral_bonus', 'daily_reward'].includes(type) : (Number(amount) >= 0);
    const sign = isPositive ? '+' : '-';
    const num = typeof amount === 'number' ? Math.abs(amount) : Math.abs(parseFloat(String(amount || 0)) || 0);
    return `${sign}${currencySymbol}${num.toFixed(decimals)}`;
  };

  return {
    currencySymbol,
    symbol,
    formatCurrency,
    format: formatCurrency,
    formatSignedCurrency,
  };
}

export default useCurrency;
