import React from 'react';
import { Rocket, Sparkles, Zap } from 'lucide-react';

export const FlyXHeroVector: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Futuristic Jet Flame Gradient */}
        <linearGradient id="flyx-flame-grad" x1="0%" y1="50%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#06b6d4" />
          <stop offset="75%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>

        {/* Hero Suit Metallic Cyan Gradient */}
        <linearGradient id="flyx-suit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        {/* Cape Glowing Red/Gold Gradient */}
        <linearGradient id="flyx-cape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="60%" stopColor="#be123c" />
          <stop offset="100%" stopColor="#4c0519" />
        </linearGradient>

        {/* Helmet Visor Glow */}
        <linearGradient id="flyx-visor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        <filter id="flyx-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Jet Exhaust Thrust Stream */}
      <path
        d="M25 78 C15 88 5 95 -8 98 C8 85 18 76 28 68 Z"
        fill="url(#flyx-flame-grad)"
        filter="url(#flyx-glow)"
      />
      <path
        d="M28 82 C20 88 12 94 2 97 C12 88 20 81 30 73 Z"
        fill="#ffffff"
        opacity="0.9"
      />

      {/* Floating Cape behind */}
      <path
        d="M42 50 C28 58 14 66 6 82 C22 72 35 66 48 58 Z"
        fill="url(#flyx-cape-grad)"
        filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.6))"
      />

      {/* Soaring Hero Body (Streamlined Diagonal Flight Pose) */}
      <g transform="rotate(-38 52 48)">
        {/* Legs / Thruster Boots */}
        <path d="M46 72 L50 88 L55 88 L52 70 Z" fill="url(#flyx-suit-grad)" />
        <path d="M53 72 L57 86 L62 86 L58 70 Z" fill="url(#flyx-suit-grad)" />
        {/* Boot Thrusters */}
        <ellipse cx="52.5" cy="88" rx="2.5" ry="1.5" fill="#38bdf8" filter="url(#flyx-glow)" />
        <ellipse cx="59.5" cy="86" rx="2.5" ry="1.5" fill="#38bdf8" filter="url(#flyx-glow)" />

        {/* Torso & Belt */}
        <path d="M44 42 L58 42 L55 72 L47 72 Z" fill="url(#flyx-suit-grad)" stroke="#38bdf8" strokeWidth="0.8" />
        <rect x="46" y="58" width="10" height="3" rx="1.5" fill="#eab308" />

        {/* Chest Emblem 'X' */}
        <path d="M48 46 L54 54 M54 46 L48 54" stroke="#e0f2fe" strokeWidth="1.8" strokeLinecap="round" />

        {/* Left Arm extended forward in flight */}
        <path d="M57 44 L78 28 L82 32 L60 50 Z" fill="url(#flyx-suit-grad)" />
        <circle cx="80" cy="30" r="3" fill="#f8fafc" />

        {/* Head / Streamlined Cyber Helmet */}
        <ellipse cx="52" cy="34" rx="6.5" ry="8" fill="url(#flyx-suit-grad)" />
        {/* Glowing Visor */}
        <path d="M54 31 C57 32 58 35 55 37 C52 38 49 37 49 34 C49 32 51 31 54 31 Z" fill="url(#flyx-visor-grad)" filter="url(#flyx-glow)" />
      </g>
    </svg>
  );
};

export const FlyXLobbyThumbnail: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  return (
    <div className={`relative overflow-hidden select-none bg-gradient-to-b from-[#0a192f] via-[#051124] to-[#020617] flex flex-col items-center justify-between p-2 border border-[#1e3a5f] rounded-xl group-hover:border-[#38bdf8] transition-all duration-300 ${className}`}>
      {/* Cyan Cosmic Grid & Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--tw-gradient-stops))] from-[#0284c7]/25 via-[#38bdf8]/5 to-transparent pointer-events-none" />
      
      {/* Background Neon Flight Curve */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity" viewBox="0 0 120 160" fill="none">
        <path d="M-10 170 Q40 130 65 85 T130 15" stroke="url(#thumb-curve-grad)" strokeWidth="2.5" strokeDasharray="3 2" />
        <defs>
          <linearGradient id="thumb-curve-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Floating Badges */}
      <div className="w-full flex items-center justify-between z-10">
        <span className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-md border border-white/20 tracking-wider">
          MICROGAMING
        </span>
        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded shadow-md border border-amber-300 tracking-tighter flex items-center gap-0.5">
          <Zap className="w-2.5 h-2.5 fill-slate-950" /> 10,000X
        </span>
      </div>

      {/* Centerpiece: Flying Superhero Soaring Upward */}
      <div className="relative flex-1 w-full flex items-center justify-center my-0.5">
        <div className="absolute w-20 h-20 rounded-full bg-cyan-500/15 blur-lg group-hover:scale-125 transition-transform duration-500" />
        
        {/* Floating Sparks */}
        <div className="absolute top-2 right-2 text-cyan-300 opacity-75 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Flying Hero Graphic */}
        <div className="relative z-10 transform group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
          <FlyXHeroVector className="w-16 h-16 sm:w-18 sm:h-18 drop-shadow-[0_0_16px_rgba(56,189,248,0.85)]" />
        </div>
      </div>

      {/* Bottom Title Plaque */}
      <div className="w-full z-10 flex flex-col items-center">
        <div className="w-full bg-gradient-to-r from-transparent via-[#0f2744] to-transparent py-0.5 flex flex-col items-center border-t border-b border-[#38bdf8]/40">
          <span 
            className="text-[15px] sm:text-[17px] font-black uppercase tracking-wider leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#7dd3fc] to-[#0284c7] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{
              textShadow: '0 2px 8px rgba(2,132,199,0.8)'
            }}
          >
            FLY-X
          </span>
        </div>
        
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[7px] font-extrabold text-[#38bdf8] tracking-widest uppercase bg-black/60 px-1.5 py-[1px] rounded-full border border-[#0284c7]/40">
            CRASH GAME
          </span>
        </div>
      </div>
    </div>
  );
};
