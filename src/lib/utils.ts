import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useCooldownHidden(key: string, cooldownHours = 12) {
  const [isHidden, setIsHidden] = useState(() => {
    const closedAt = localStorage.getItem(key);
    if (!closedAt) return false;
    const closedTime = new Date(closedAt).getTime();
    const now = new Date().getTime();
    const diffHours = (now - closedTime) / (1000 * 60 * 60);
    if (diffHours < cooldownHours) {
      return true;
    }
    localStorage.removeItem(key);
    return false;
  });

  const hide = () => {
    localStorage.setItem(key, new Date().toISOString());
    setIsHidden(true);
  };

  return [isHidden, hide] as const;
}
