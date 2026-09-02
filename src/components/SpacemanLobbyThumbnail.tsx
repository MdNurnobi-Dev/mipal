import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

export const SpacemanHeroVector: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Helmet Glow & Metallic Shimmer */}
        <linearGradient id="sm-suit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <linearGradient id="sm-visor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="40%" stopColor="#d97706" />
          <stop offset="85%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="sm-jetpack-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="60%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="sm-balloon-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="60%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>

        <linearGradient id="sm-balloon-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        <linearGradient id="sm-flame" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>

        <filter id="sm-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Floating Jet Thrust Trails */}
      <path
        d="M44 76 Q42 88 38 96 Q46 90 48 78 Z"
        fill="url(#sm-flame)"
        filter="url(#sm-glow)"
      />
      <path
        d="M56 76 Q58 88 62 96 Q54 90 52 78 Z"
        fill="url(#sm-flame)"
        filter="url(#sm-glow)"
      />

      {/* Jetpack on back */}
      <rect x="36" y="44" width="28" height="24" rx="6" fill="url(#sm-jetpack-grad)" stroke="#475569" strokeWidth="1.5" />
      <circle cx="50" cy="56" r="4" fill="#38bdf8" filter="url(#sm-glow)" />

      {/* Space Suit Body */}
      <ellipse cx="50" cy="62" rx="15" ry="14" fill="url(#sm-suit-grad)" stroke="#64748b" strokeWidth="1.5" />

      {/* Cute Chest Badge (Heart/Star) */}
      <rect x="44" y="56" width="12" height="7" rx="2" fill="#0284c7" />
      <circle cx="47" cy="59.5" r="1.5" fill="#facc15" />
      <circle cx="53" cy="59.5" r="1.5" fill="#ef4444" />

      {/* Cute Little Legs with Thruster Boots */}
      <path d="M41 72 L38 82 L46 82 L47 72 Z" fill="url(#sm-suit-grad)" stroke="#64748b" strokeWidth="1" />
      <path d="M59 72 L62 82 L54 82 L53 72 Z" fill="url(#sm-suit-grad)" stroke="#64748b" strokeWidth="1" />
      <ellipse cx="42" cy="82" rx="4.5" ry="2" fill="#334155" />
      <ellipse cx="58" cy="82" rx="4.5" ry="2" fill="#334155" />

      {/* Little Floating Glove Arms */}
      <path d="M36 54 Q26 58 24 50 Q28 44 38 48 Z" fill="url(#sm-suit-grad)" stroke="#64748b" strokeWidth="1" />
      <ellipse cx="24" cy="49" rx="3.5" ry="3" fill="#f43f5e" />

      <path d="M64 54 Q74 58 76 50 Q72 44 62 48 Z" fill="url(#sm-suit-grad)" stroke="#64748b" strokeWidth="1" />
      <ellipse cx="76" cy="49" rx="3.5" ry="3" fill="#f43f5e" />

      {/* Iconic Big Round Spaceman Helmet */}
      <circle cx="50" cy="34" r="19" fill="url(#sm-suit-grad)" stroke="#64748b" strokeWidth="1.5" />
      
      {/* Helmet Visor */}
      <ellipse cx="50" cy="34" rx="14" ry="11" fill="url(#sm-visor-grad)" stroke="#0f172a" strokeWidth="1.5" />
      
      {/* Visor Specular Reflection */}
      <path d="M42 27 Q50 25 58 28 Q52 32 42 30 Z" fill="#ffffff" opacity="0.75" />
      <circle cx="41" cy="34" r="1.5" fill="#ffffff" opacity="0.8" />

      {/* Helmet Antenna with Glowing Star */}
      <path d="M50 15 L50 9" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="8" r="3" fill="#f59e0b" filter="url(#sm-glow)" />

      {/* Tiny Cosmic Sparkles */}
      <circle cx="15" cy="20" r="1.5" fill="#fef08a" />
      <circle cx="85" cy="25" r="1" fill="#67e8f9" />
      <circle cx="82" cy="75" r="1.5" fill="#f472b6" />
    </svg>
  );
};

export const SpacemanLobbyThumbnail: React.FC<{
  className?: string;
  isActive?: boolean;
}> = ({ className = "", isActive = true }) => {
  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-purple-100 group transition-all duration-300 hover:shadow-md ${
        !isActive ? 'grayscale opacity-75' : ''
      } ${className}`}
    >
      {/* Deep Cosmic Gradient Background with Stars */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1035] via-[#2d124d] to-[#120726]">
        {/* Saturn Ring Planet in background */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/10 blur-[1px] pointer-events-none" />
        <div className="absolute top-2 right-4 w-12 h-12 rounded-full border border-pink-400/20 pointer-events-none" />
        
        {/* Twinkling Star Dust */}
        <div className="absolute top-3 left-4 w-1 h-1 rounded-full bg-yellow-200 animate-pulse" />
        <div className="absolute top-10 left-12 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
        <div className="absolute bottom-10 left-6 w-1 h-1 rounded-full bg-pink-300" />
        <div className="absolute top-6 right-16 w-1 h-1 rounded-full bg-white animate-ping" style={{ animationDuration: '3s' }} />
      </div>

      {/* Provider & Max Multiplier Badges */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-purple-400/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[8px] font-medium tracking-wider text-amber-300 uppercase">PRAGMATIC</span>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
          <Zap className="w-2.5 h-2.5 fill-current" />
          <span>5,000X</span>
        </div>
      </div>

      {/* Central Spaceman Floating Vector */}
      <div className="absolute inset-0 flex items-center justify-center pt-2 z-10 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1">
        <SpacemanHeroVector className="w-24 h-24 drop-shadow-[0_8px_16px_rgba(236,72,153,0.35)]" />
      </div>

      {/* 50% Cashout Badge - Spaceman Signature Feature */}
      <div className="absolute bottom-8 left-2 z-10">
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/90 text-white text-[8px] font-semibold tracking-wide border border-emerald-300/40 backdrop-blur-sm shadow-sm">
          <Sparkles className="w-2 h-2" /> 50% CASHOUT
        </span>
      </div>

      {/* Bottom Name Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 z-10 flex items-center justify-between">
        <div>
          <h3 className="text-white text-xs font-bold tracking-wide flex items-center gap-1">
            SPACEMAN
          </h3>
          <p className="text-purple-200/80 text-[9px] font-normal">Real Multiplier Crash</p>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[9px] font-medium">
          CRASH
        </span>
      </div>
    </div>
  );
};
