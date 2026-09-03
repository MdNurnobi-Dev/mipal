import React, { useEffect } from 'react';

interface GameContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function GameContainer({ children, className = '' }: GameContainerProps) {
  useEffect(() => {
    // Lock body scroll and prevent overscroll/pull-to-refresh on mobile
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalOverscroll = window.getComputedStyle(document.body).overscrollBehavior;
    
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none'; // Prevent pull-to-refresh on mobile
    
    // Attempt to scroll to top to hide address bar on mobile (if possible)
    window.scrollTo(0, 1);

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col font-sans select-none overflow-hidden overscroll-none ${className}`}
    >
      {children}
    </div>
  );
}
