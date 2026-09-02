import React from 'react';
import { MinesGemVector, MinesBombVector } from '../pages/games/Mines';
import { Sparkles } from 'lucide-react';

export const MinesLobbyThumbnail: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  return (
    <div className={`relative overflow-hidden select-none bg-gradient-to-b from-[#121c2a] via-[#0b131d] to-[#060a10] flex flex-col items-center justify-between p-2 border border-[#26374a] rounded-xl group-hover:border-[#10b981] transition-all duration-300 ${className}`}>
      {/* Radiant Emerald Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#10b981]/20 via-[#0284c7]/5 to-transparent pointer-events-none" />

      {/* Top Floating Badges */}
      <div className="w-full flex items-center justify-between z-10">
        <span className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-md border border-white/20 tracking-wider">
          SPRIBE
        </span>
        <span className="bg-gradient-to-r from-[#10b981] to-[#047857] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-md border border-[#a7f3d0]/40 tracking-tighter flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5 text-[#a7f3d0]" /> 99X
        </span>
      </div>

      {/* Centerpiece: Glowing 3D Emerald Gem & Bomb */}
      <div className="relative flex-1 w-full flex items-center justify-center my-1">
        <div className="absolute w-16 h-16 rounded-full bg-emerald-500/20 blur-md group-hover:scale-125 transition-transform duration-500" />
        
        {/* Left Tilted Bomb */}
        <div className="absolute -left-1 top-2 transform -rotate-12 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
          <MinesBombVector className="w-8 h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" />
        </div>

        {/* Center Main Emerald Gem */}
        <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
          <MinesGemVector className="w-14 h-14 drop-shadow-[0_0_16px_rgba(16,185,129,0.9)]" />
        </div>
      </div>

      {/* Bottom Title Plaque */}
      <div className="w-full z-10 flex flex-col items-center">
        <div className="w-full bg-gradient-to-r from-transparent via-[#142333] to-transparent py-0.5 flex flex-col items-center border-t border-b border-[#10b981]/30">
          <span 
            className="text-[14px] sm:text-[16px] font-black uppercase tracking-widest leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#a7f3d0] via-[#34d399] to-[#059669] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{
              textShadow: '0 2px 6px rgba(0,0,0,0.9)'
            }}
          >
            MINES
          </span>
        </div>
        
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[7px] font-extrabold text-[#34d399] tracking-widest uppercase bg-black/60 px-1.5 py-[1px] rounded-full border border-[#10b981]/30">
            5X5 CASINO
          </span>
        </div>
      </div>
    </div>
  );
};
