import React from 'react';
import { Target, Flame, Sparkles } from 'lucide-react';

interface WildBountyThumbnailProps {
  className?: string;
  isActive?: boolean;
}

export const WildBountyHeroVector = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <radialGradient id="wbGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#b45309" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="wbHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="50%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
      <linearGradient id="wbStarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <linearGradient id="wbGunMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>

    {/* Ambient Glow */}
    <circle cx="50" cy="48" r="44" fill="url(#wbGlow)" />

    {/* Crossed Revolvers */}
    <g transform="translate(18, 38) rotate(-28)">
      <rect x="0" y="4" width="28" height="6" rx="2" fill="url(#wbGunMetal)" stroke="#1e293b" strokeWidth="1" />
      <rect x="2" y="9" width="8" height="14" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
      <circle cx="10" cy="7" r="4" fill="#64748b" />
    </g>
    <g transform="translate(82, 38) rotate(28) scale(-1, 1)">
      <rect x="0" y="4" width="28" height="6" rx="2" fill="url(#wbGunMetal)" stroke="#1e293b" strokeWidth="1" />
      <rect x="2" y="9" width="8" height="14" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
      <circle cx="10" cy="7" r="4" fill="#64748b" />
    </g>

    {/* Outlaw Cowgirl Hat */}
    <ellipse cx="50" cy="38" rx="34" ry="10" fill="url(#wbHatGrad)" stroke="#451a03" strokeWidth="1.5" />
    <path d="M30 36 C32 18, 42 12, 50 14 C58 12, 68 18, 70 36 Z" fill="url(#wbHatGrad)" stroke="#451a03" strokeWidth="1.5" />
    <path d="M31 34 C40 32, 60 32, 69 34" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="50" cy="33" r="2.5" fill="#fef08a" />

    {/* Sheriff 6-Pointed Star Badge */}
    <g transform="translate(50, 68) scale(0.75)">
      <polygon 
        points="0,-22 6,-8 20,-8 10,2 14,16 0,8 -14,16 -10,2 -20,-8 -6,-8" 
        fill="url(#wbStarGrad)" 
        stroke="#451a03" 
        strokeWidth="1.5" 
      />
      <circle cx="0" cy="0" r="6" fill="#78350f" stroke="#fef08a" strokeWidth="1" />
      <circle cx="0" cy="0" r="2" fill="#fef08a" />
    </g>
  </svg>
);

export function WildBountyLobbyThumbnail({ className = "", isActive = true }: WildBountyThumbnailProps) {
  return (
    <div className={`relative w-full h-full bg-gradient-to-b from-[#2b1406] via-[#1c0c04] to-[#0d0502] overflow-hidden flex flex-col justify-between p-2 select-none border border-amber-600/30 ${className}`}>
      {/* Background Desert Sunburst & Bullet Holes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.25)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Hot Tag Badge */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg z-20 shadow-md flex items-center gap-0.5">
        <Flame className="w-2.5 h-2.5 fill-white" />
        <span>1024x</span>
      </div>

      {/* Western Wood Grain Texture Border */}
      <div className="absolute inset-1 rounded-lg border border-amber-500/20 pointer-events-none" />

      {/* Top Banner Multiplier Tag */}
      <div className="flex items-center justify-between z-10">
        <span className="text-[7px] font-extrabold tracking-widest text-amber-400 bg-black/60 px-1.5 py-0.5 rounded uppercase border border-amber-500/20">
          PG SOFT
        </span>
        <div className="flex items-center gap-0.5 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
          <Sparkles className="w-2 h-2 text-amber-300 animate-pulse" />
          <span className="text-[7.5px] font-black text-amber-200">3,600 WAYS</span>
        </div>
      </div>

      {/* Central Visual Outlaw Vector */}
      <div className="flex-1 flex items-center justify-center my-0.5 z-10">
        <WildBountyHeroVector className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]" />
      </div>

      {/* Bottom Title & Provider Info */}
      <div className="text-center z-10 flex flex-col items-center">
        <h3 className="text-white font-black text-[10px] sm:text-xs tracking-tight leading-tight uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-amber-100">
          WILD BOUNTY
        </h3>
        <span className="text-[7px] font-bold text-amber-400/90 uppercase tracking-widest">
          SHOWDOWN
        </span>

        {!isActive && (
          <div className="mt-1 bg-black/70 backdrop-blur-md border border-white/20 text-white text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Maintenance
          </div>
        )}
      </div>
    </div>
  );
}
