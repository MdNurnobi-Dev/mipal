import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { ArrowLeft, Settings, Play, RotateCcw, Zap, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const GEMS = [
  { icon: '🔴', glow: 'shadow-[0_0_10px_rgba(220,38,38,0.8)]' },
  { icon: '🔵', glow: 'shadow-[0_0_10px_rgba(37,99,235,0.8)]' },
  { icon: '🟢', glow: 'shadow-[0_0_10px_rgba(22,163,74,0.8)]' },
  { icon: '💎', glow: 'shadow-[0_0_10px_rgba(56,189,248,0.8)]' },
  { icon: 'WILD', glow: 'shadow-[0_0_15px_rgba(250,204,21,1)]' }
];

const MULTIPLIERS = ['1x', '2x', '3x', '5x', '10x', '15x'];

const COLS = 3;
const ROWS = 3;

export default function FortuneGems() {
  const { currentUser, updateUserProfile } = useApp();
  const { formatCurrency } = useCurrency();
  
  const [bet, setBet] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [grid, setGrid] = useState<typeof GEMS[0][][]>([]);
  const [multReel, setMultReel] = useState<string>('1x');
  const [winAmount, setWinAmount] = useState<number>(0);
  const [showWin, setShowWin] = useState(false);
  
  useEffect(() => {
    generateGrid();
  }, []);

  const generateGrid = () => {
    const newGrid = [];
    for (let c = 0; c < COLS; c++) {
      const col = [];
      for (let r = 0; r < ROWS; r++) {
        col.push(GEMS[Math.floor(Math.random() * GEMS.length)]);
      }
      newGrid.push(col);
    }
    setGrid(newGrid);
    setMultReel(MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)]);
  };

  const handleSpin = () => {
    if (isSpinning || !currentUser) return;
    if (currentUser.balance < bet) {
      alert("Insufficient balance!");
      return;
    }

    updateUserProfile(currentUser.id, { balance: currentUser.balance - bet });
    setIsSpinning(true);
    setWinAmount(0);
    setShowWin(false);

    let spins = 0;
    const interval = setInterval(() => {
      generateGrid();
      spins++;
      if (spins > 10) {
        clearInterval(interval);
        generateGrid();
        checkWin();
        setIsSpinning(false);
      }
    }, 120);
  };

  const checkWin = () => {
    const isWin = Math.random() > 0.5;
    if (isWin) {
      const baseMult = Math.floor(Math.random() * 3) + 1;
      const finalMult = parseInt(multReel.replace('x', ''));
      const won = bet * baseMult * finalMult;
      
      setWinAmount(won);
      setShowWin(true);
      if (currentUser) {
        updateUserProfile(currentUser.id, { balance: currentUser.balance + won });
      }
      setTimeout(() => setShowWin(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#020b06] font-sans overflow-hidden selection:bg-transparent">
      {/* Ultra-Compact Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#011409] border-b border-[#00ff41]/20 shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/games" className="w-6 h-6 rounded bg-black/40 flex items-center justify-center text-white border border-white/10 active:scale-95">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div className="flex flex-col leading-none">
            <span className="text-[#00ff41] font-black text-[11px] tracking-wider drop-shadow-[0_0_2px_rgba(0,255,65,0.5)]">FORTUNE GEMS</span>
            <span className="text-[7px] text-[#00ff41]/70 font-bold uppercase">JILI Slots</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-sm border border-[#00ff41]/30">
            <span className="text-[8px] text-[#00ff41]/70 font-bold uppercase">BAL</span>
            <span className="text-[#00ff41] font-black text-xs">{formatCurrency(currentUser?.balance || 0)}</span>
          </div>
          <button className="text-[#00ff41]/50 hover:text-[#00ff41]"><Settings className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Main Game */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-1">
        {showWin && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
            <div className="animate-[ping_0.3s_ease-out_forwards] flex flex-col items-center">
              <span className="text-4xl font-black text-[#00ff41] drop-shadow-[0_0_15px_#00ff41]">
                SUPER WIN!
              </span>
              <span className="text-2xl font-black text-white mt-1 drop-shadow-md">
                +{winAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Outer Casing - Hyper Compact */}
        <div className="relative w-full max-w-[400px] bg-gradient-to-b from-[#0a2e16] to-[#020d06] rounded-xl p-1 sm:p-1.5 border-[3px] border-[#00ff41]/40 shadow-[0_0_20px_rgba(0,255,65,0.1)] flex gap-1 sm:gap-1.5">
          
          {/* Main 3x3 Reels */}
          <div className="flex-[3] bg-black rounded-lg flex border border-[#00ff41]/30 shadow-inner overflow-hidden p-[1px] gap-[1px]">
            {grid.map((col, cIdx) => (
              <div key={cIdx} className="flex-1 flex flex-col gap-[1px]">
                {col.map((gem, rIdx) => (
                  <div key={rIdx} className="aspect-square bg-gradient-to-br from-[#0c1a11] to-[#030905] flex items-center justify-center border border-[#00ff41]/10 rounded-[3px]">
                    <span 
                      className={`text-2xl sm:text-4xl ${gem.icon === 'WILD' ? 'text-[10px] sm:text-xs font-black text-yellow-400 italic' : ''} ${gem.glow} ${isSpinning ? 'animate-pulse blur-[1px]' : ''}`}
                      style={{ transform: isSpinning ? 'translateY(10px)' : 'translateY(0)', transition: 'transform 0.05s linear' }}
                    >
                      {gem.icon}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 4th Reel: Multiplier */}
          <div className="flex-1 bg-gradient-to-b from-[#2e0505] to-[#120000] rounded-lg border border-red-500/40 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-1/3 bottom-1/3 bg-red-500/20 border-y-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] z-10 pointer-events-none"></div>
            <span 
              className={`text-xl sm:text-2xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] z-20 ${isSpinning ? 'animate-pulse blur-[1px]' : ''}`}
              style={{ transform: isSpinning ? 'translateY(10px)' : 'translateY(0)', transition: 'transform 0.05s linear', WebkitTextStroke: '1px #450a0a' }}
            >
              {multReel}
            </span>
          </div>

        </div>
      </div>

      {/* Ultra-Compact Controls */}
      <div className="bg-[#011409] px-2 py-2 border-t border-[#00ff41]/20 flex items-center justify-between pb-4 shrink-0">
        
        <div className="flex gap-1.5">
           <button className="w-9 h-9 rounded-full bg-[#032e15] text-[#00ff41] flex items-center justify-center border border-[#00ff41]/20 active:bg-[#054a22]">
             <RotateCcw className="w-3.5 h-3.5"/>
           </button>
           <button className="w-9 h-9 rounded-full bg-[#032e15] text-[#00ff41] flex items-center justify-center border border-[#00ff41]/20 active:bg-[#054a22]">
             <Zap className="w-3.5 h-3.5"/>
           </button>
        </div>

        <div className="flex items-center -mt-6 relative z-20">
          <button 
            onClick={handleSpin} disabled={isSpinning}
            className={`w-[70px] h-[70px] rounded-full border-[3px] border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.4)] flex items-center justify-center bg-gradient-to-t from-[#00aa2b] to-[#00ff41] active:scale-95 transition-transform ${isSpinning ? 'opacity-70 grayscale' : ''}`}
          >
            <Play className="w-7 h-7 text-white fill-white ml-1 drop-shadow-md" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full border border-[#00ff41]/20">
          <button onClick={() => setBet(Math.max(10, bet - 10))} disabled={isSpinning || bet <= 10} className="w-7 h-7 rounded-full bg-[#032e15] text-[#00ff41] disabled:opacity-50 flex items-center justify-center active:bg-[#054a22]">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="flex flex-col items-center min-w-[45px] leading-none">
            <span className="text-[7px] text-[#00ff41]/70 font-bold uppercase tracking-wider mb-[1px]">Bet</span>
            <span className="text-white font-black text-xs">{bet}</span>
          </div>
          <button onClick={() => setBet(bet + 10)} disabled={isSpinning} className="w-7 h-7 rounded-full bg-[#032e15] text-[#00ff41] flex items-center justify-center active:bg-[#054a22]">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
