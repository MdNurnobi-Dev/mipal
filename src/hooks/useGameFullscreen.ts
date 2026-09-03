import { useEffect } from 'react';

export function useGameFullscreen() {
  useEffect(() => {
    // Save original styles
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    const originalOverscroll = window.getComputedStyle(document.body).overscrollBehavior;

    // Apply fullscreen locks
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    // Attempt to scroll to top to hide mobile browser address bar
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // iOS Safari specific fix for preventing background scrolling
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, []);
}
