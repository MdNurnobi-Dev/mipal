import React from 'react';

export interface PaymentGatewayLogoProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PaymentGatewayLogo: React.FC<PaymentGatewayLogoProps> = ({
  name,
  className = '',
  size = 'md'
}) => {
  const normalized = (name || '').toLowerCase();

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base'
  };

  // bKash Logo / Emblem
  if (normalized.includes('bkash') || normalized.includes('বিকাশ')) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-[#E2136E] text-white font-black shadow-sm overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
        title="bKash"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5 fill-white" xmlns="http://www.w3.org/2000/svg">
          {/* Stylized bKash origami bird representation */}
          <path d="M12 48 L48 20 L35 78 Z" fill="#ffffff" opacity="0.95" />
          <path d="M48 20 L88 32 L48 55 Z" fill="#ffffff" />
          <path d="M48 55 L88 32 L68 85 Z" fill="#ffffff" opacity="0.85" />
          <path d="M35 78 L48 55 L58 82 Z" fill="#ffffff" opacity="0.75" />
        </svg>
      </div>
    );
  }

  // Nagad Logo / Emblem
  if (normalized.includes('nagad') || normalized.includes('নগদ')) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#F7931E] to-[#ED1C24] text-white font-black shadow-sm overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
        title="Nagad"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" xmlns="http://www.w3.org/2000/svg">
          {/* Stylized Nagad flame/knot emblem */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeWidth="6" strokeDasharray="180 50" />
          <path d="M50 22 C35 36 32 58 48 76 C65 58 65 36 50 22 Z" fill="#ffffff" />
          <circle cx="50" cy="50" r="7" fill="#ED1C24" />
        </svg>
      </div>
    );
  }

  // Rocket (Dutch-Bangla Bank)
  if (normalized.includes('rocket') || normalized.includes('রকেট') || normalized.includes('dbbl')) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-[#8C3494] text-white font-black shadow-sm overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
        title="Rocket"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 15 C42 30 35 55 35 75 L50 68 L65 75 C65 55 58 30 50 15 Z" fill="#ffffff" />
          <path d="M30 60 L18 78 L35 73 Z" fill="#F7931E" />
          <path d="M70 60 L82 78 L65 73 Z" fill="#F7931E" />
          <circle cx="50" cy="42" r="5" fill="#8C3494" />
        </svg>
      </div>
    );
  }

  // Upay
  if (normalized.includes('upay') || normalized.includes('উপায়')) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-[#004B87] text-white font-black shadow-sm overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
        title="Upay"
      >
        <div className="flex flex-col items-center justify-center font-black tracking-tight leading-none text-[#FFD100]">
          <span className="text-[11px] font-black uppercase">u</span>
          <span className="text-[7px] text-white font-bold">pay</span>
        </div>
      </div>
    );
  }

  // Binance / Crypto / USDT
  if (
    normalized.includes('binance') ||
    normalized.includes('usdt') ||
    normalized.includes('crypto') ||
    normalized.includes('trc20') ||
    normalized.includes('bep20') ||
    normalized.includes('bnb')
  ) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-[#181A20] border border-[#F0B90B]/30 text-[#F0B90B] font-black shadow-sm overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
        title="Binance (USDT/Crypto)"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5 fill-[#F0B90B]" xmlns="http://www.w3.org/2000/svg">
          {/* Binance diamond layout */}
          <polygon points="50,15 62,27 50,39 38,27" />
          <polygon points="26,39 38,51 26,63 14,51" />
          <polygon points="74,39 86,51 74,63 62,51" />
          <polygon points="50,63 62,75 50,87 38,75" />
          <polygon points="50,42 59,51 50,60 41,51" />
        </svg>
      </div>
    );
  }

  // Cellfin / Islami Bank
  if (normalized.includes('cellfin') || normalized.includes('ibbl') || normalized.includes('islami')) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-[#008444] text-white font-black shadow-sm overflow-hidden flex-shrink-0 ${sizeClasses[size]} ${className}`}
        title="Cellfin"
      >
        <span className="font-extrabold text-[10px] tracking-tighter text-white">cellfin</span>
      </div>
    );
  }

  // Bank Transfer / Card / Default
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-black shadow-sm flex-shrink-0 ${sizeClasses[size]} ${className}`}
      title={name}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    </div>
  );
};
