import React from 'react';
import { GarudaWildIcon, RubyGemIcon, SapphireGemIcon, EmeraldGemIcon } from '../pages/games/FortuneGems';
import { Sparkles } from 'lucide-react';

export const FortuneGemsLobbyThumbnail: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  return (
    <div className={`relative overflow-hidden select-none bg-gradient-to-b from-[#0c2433] via-[#08151f] to-[#03090e] flex flex-col items-center justify-between p-2 border border-[#3b5d72]/60 rounded-xl group-hover:border-[#f5b800] transition-all duration-300 ${className}`}>
      {/* Radiant Aztec Solar Background Burst */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f59e0b]/20 via-[#0284c7]/10 to-transparent pointer-events-none" />
      
      {/* Aztec Corner Ornaments */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#f5b800]/80 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#f5b800]/80 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#f5b800]/80 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#f5b800]/80 rounded-br-sm pointer-events-none" />

      {/* Top Floating Mini Badges */}
      <div className="w-full flex items-center justify-between z-10">
        <span className="bg-gradient-to-r from-[#dc2626] to-[#991b1b] text-[#fef08a] text-[8px] font-black px-1.5 py-0.5 rounded shadow-md border border-[#fef08a]/40 tracking-wider">
          JILI
        </span>
        <span className="bg-gradient-to-r from-[#f59e0b] to-[#b45309] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-md border border-[#fef08a]/40 tracking-tighter flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5 text-[#fef08a]" /> 15X
        </span>
      </div>

      {/* Centerpiece: Garuda Wild Mask Flanked by Floating Gems */}
      <div className="relative flex-1 w-full flex items-center justify-center my-0.5">
        {/* Glowing Radial Halo */}
        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-[#f59e0b]/30 via-[#ffd54f]/20 to-transparent blur-md group-hover:scale-125 transition-transform duration-500" />
        
        {/* Left Floating Ruby */}
        <div className="absolute -left-1 top-2 transform -rotate-12 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
          <RubyGemIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_2px_6px_rgba(220,38,38,0.7)]" />
        </div>

        {/* Right Floating Sapphire */}
        <div className="absolute -right-1 top-2 transform rotate-12 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
          <SapphireGemIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_2px_6px_rgba(37,99,235,0.7)]" />
        </div>

        {/* Center King: Garuda Wild */}
        <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
          <GarudaWildIcon className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_0_12px_rgba(245,184,0,0.8)]" />
        </div>

        {/* Subtle Bottom Floating Emerald */}
        <div className="absolute bottom-0 right-2 transform rotate-6 opacity-80 group-hover:opacity-100 transition-opacity">
          <EmeraldGemIcon className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(22,163,74,0.6)]" />
        </div>
      </div>

      {/* Bottom Title Plaque: Authentic "FORTUNE GEMS" 3D Typography */}
      <div className="w-full z-10 flex flex-col items-center">
        <div className="w-full bg-gradient-to-r from-transparent via-[#142634] to-transparent py-0.5 flex flex-col items-center border-t border-b border-[#f5b800]/30">
          <span 
            className="text-[11px] sm:text-[13px] font-black uppercase tracking-wider leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#fffbeb] via-[#fde047] to-[#d97706] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
            style={{
              WebkitTextStroke: '0.4px #78350f',
              textShadow: '0 2px 4px rgba(0,0,0,0.9)'
            }}
          >
            FORTUNE
          </span>
          <span 
            className="text-[13px] sm:text-[15px] font-black uppercase tracking-widest leading-tight -mt-0.5 text-transparent bg-clip-text bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
            style={{
              WebkitTextStroke: '0.5px #451a03',
              textShadow: '0 2px 6px rgba(0,0,0,0.95)'
            }}
          >
            GEMS
          </span>
        </div>
        
        {/* Aztec Tagline */}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[7px] font-extrabold text-[#f5b800] tracking-widest uppercase bg-black/60 px-1.5 py-[1px] rounded-full border border-[#f5b800]/30">
            3X3 SLOTS
          </span>
        </div>
      </div>
    </div>
  );
};
