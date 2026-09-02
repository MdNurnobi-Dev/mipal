import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { 
  ArrowLeft, Volume2, VolumeX, Sparkles, HelpCircle, 
  Dices, RotateCcw, Flame, ShieldAlert, CheckCircle2,
  ChevronRight, Info, Award, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { gameApi } from '../../api/gameApi';
import { audioSystem } from '../../utils/audioSystem';
import type { WinControlLevel } from '../../api/gameApi';

// ---------------------------------------------------------------------------
// 3D VECTOR ASSETS FOR AUTHENTIC SPRIBE / STAKE MINES
// ---------------------------------------------------------------------------

export const MinesGemVector: React.FC<{ className?: string }> = ({ className = "w-9 h-9" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="gemGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#059669" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#047857" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="gemTopFacet" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <linearGradient id="gemLeftFacet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="gemRightFacet" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="gemBottomFacet" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
    </defs>
    {/* Glow */}
    <circle cx="50" cy="50" r="46" fill="url(#gemGlow)" />
    {/* Base Diamond Hexagon */}
    <polygon points="50,8 88,32 88,68 50,92 12,68 12,32" fill="#047857" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
    {/* Top Table */}
    <polygon points="50,18 76,34 50,48 24,34" fill="url(#gemTopFacet)" />
    {/* Side Facets */}
    <polygon points="50,18 76,34 88,32 50,8" fill="#6ee7b7" />
    <polygon points="50,18 24,34 12,32 50,8" fill="#a7f3d0" />
    <polygon points="24,34 50,48 50,82 12,68 12,32" fill="url(#gemLeftFacet)" />
    <polygon points="76,34 50,48 50,82 88,68 88,32" fill="url(#gemRightFacet)" />
    <polygon points="50,48 50,82 50,92" fill="url(#gemBottomFacet)" />
    {/* Inner Sparkle Flare */}
    <circle cx="50" cy="30" r="4" fill="#ffffff" filter="drop-shadow(0 0 3px #ffffff)" />
    <path d="M48 20 L50 14 L52 20 L58 22 L52 24 L50 30 L48 24 L42 22 Z" fill="#ffffff" opacity="0.9" />
  </svg>
);

export const MinesBombVector: React.FC<{ className?: string, isExploded?: boolean }> = ({ className = "w-9 h-9", isExploded = false }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bombBody" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="40%" stopColor="#1e293b" />
        <stop offset="90%" stopColor="#090d16" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
      <radialGradient id="fuseFire" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#dc2626" />
      </radialGradient>
    </defs>
    {/* Bomb Body */}
    <circle cx="50" cy="56" r="34" fill="url(#bombBody)" stroke="#334155" strokeWidth="2" />
    {/* Highlight sheen */}
    <ellipse cx="38" cy="42" rx="10" ry="6" fill="#94a3b8" opacity="0.4" transform="rotate(-30 38 42)" />
    {/* Bomb Cap */}
    <rect x="44" y="20" width="12" height="6" rx="2" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
    {/* Burning Fuse */}
    <path d="M50 20 C 50 12, 64 16, 68 8" stroke="#d97706" strokeWidth="3" strokeLinecap="round" fill="none" />
    {/* Sparking Flame */}
    <g transform="translate(68, 8)">
      <circle cx="0" cy="0" r="7" fill="url(#fuseFire)" className="animate-pulse" />
      <path d="M-3 -3 L0 -8 L3 -3 L8 0 L3 3 L0 8 L-3 3 L-8 0 Z" fill="#fde047" opacity="0.9" />
      <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
    </g>
    {/* Skull / Warning Icon on Bomb */}
    <path d="M44 52 C44 48 56 48 56 52 C56 56 54 58 54 62 L46 62 C46 58 44 56 44 52 Z" fill="#ef4444" opacity="0.8" />
    <circle cx="47" cy="53" r="1.5" fill="#0f172a" />
    <circle cx="53" cy="53" r="1.5" fill="#0f172a" />
    <rect x="48" y="63" width="1.5" height="3" fill="#ef4444" />
    <rect x="51" y="63" width="1.5" height="3" fill="#ef4444" />
  </svg>
);

// ---------------------------------------------------------------------------
// MAIN MINES COMPONENT
// ---------------------------------------------------------------------------

interface CellState {
  isMine: boolean;
  revealed: boolean;
  isTriggeredMine?: boolean;
}

export default function Mines() {
  const { currentUser, updateUserProfile, siteSettings } = useApp();
  const { formatCurrency } = useCurrency();

  const [bet, setBet] = useState(10);
  const [minesCount, setMinesCount] = useState(3);
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Game Engine State
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'exploded' | 'cashed_out'>('idle');
  const [grid, setGrid] = useState<CellState[]>(Array(25).fill({ isMine: false, revealed: false }));
  
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [multipliersTable, setMultipliersTable] = useState<number[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [forcedLossStep, setForcedLossStep] = useState<number | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState(0);
  const [lastExplosionIndex, setLastExplosionIndex] = useState<number | null>(null);
  
  // Past rounds win/loss history pills (e.g., 2.14x, 1.45x, 0.00x)
  const [roundHistory, setRoundHistory] = useState<Array<{ mult: number; won: boolean }>>([
    { mult: 1.96, won: true },
    { mult: 0.00, won: false },
    { mult: 3.42, won: true },
    { mult: 1.25, won: true },
    { mult: 0.00, won: false },
    { mult: 5.80, won: true },
    { mult: 2.10, won: true },
  ]);

  // Pre-generate multiplier table on mine change when idle
  useEffect(() => {
    if (gameState === 'idle') {
      const maxSteps = 25 - minesCount;
      const table: number[] = [];
      for (let s = 1; s <= maxSteps; s++) {
        table.push(gameApi.getMinesMultiplier(minesCount, s));
      }
      setMultipliersTable(table);
    }
  }, [minesCount, gameState]);

  const toggleSound = () => {
    const muted = audioSystem.toggleMute();
    setIsMuted(muted);
  };

  // -------------------------------------------------------------------------
  // START GAME & DEDUCT BALANCE
  // -------------------------------------------------------------------------
  const startGame = async () => {
    if (gameState === 'playing' || !currentUser) return;
    if (currentUser.balance < bet) {
      alert("Insufficient balance! Please deposit to continue.");
      return;
    }
    if (bet <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    // Instant balance deduction
    updateUserProfile(currentUser.id, { balance: currentUser.balance - bet });
    audioSystem.playMinesTile();

    const winControl = (siteSettings?.gameWinControls?.mines as WinControlLevel) || 'medium';
    const res = await gameApi.initMines(bet, minesCount, winControl);

    const initialGrid: CellState[] = res.grid.map(isGem => ({
      isMine: !isGem,
      revealed: false
    }));

    setGrid(initialGrid);
    setMultipliersTable(res.multipliersTable);
    setCurrentMultiplier(1.00);
    setRevealedCount(0);
    setForcedLossStep(res.forcedLossStep ?? null);
    setLastWinAmount(0);
    setLastExplosionIndex(null);
    setGameState('playing');
  };

  // -------------------------------------------------------------------------
  // REVEAL TILE (STRICT SERVER-CONTROLLED WIN/LOSS)
  // -------------------------------------------------------------------------
  const handleReveal = (index: number) => {
    if (gameState !== 'playing' || grid[index].revealed) return;

    audioSystem.playMinesTile();
    const nextRevealedCount = revealedCount + 1;
    let cell = grid[index];
    const newGrid = [...grid];

    // Check if server-mandated forced loss kicks in at this step
    const shouldForceExplosion = forcedLossStep !== null && nextRevealedCount >= forcedLossStep;

    if (cell.isMine || shouldForceExplosion) {
      // BOMB EXPLOSION!
      cell = { ...cell, isMine: true, revealed: true, isTriggeredMine: true };
      newGrid[index] = cell;

      // Reveal all remaining tiles
      const fullyRevealedGrid = newGrid.map(c => ({
        ...c,
        revealed: true
      }));

      setGrid(fullyRevealedGrid);
      setLastExplosionIndex(index);
      setGameState('exploded');
      setRoundHistory(prev => [{ mult: 0.00, won: false }, ...prev.slice(0, 14)]);
      audioSystem.playMinesBomb();
      return;
    }

    // SAFE GEM FOUND!
    cell = { ...cell, isMine: false, revealed: true };
    newGrid[index] = cell;
    setGrid(newGrid);

    const newMult = multipliersTable[nextRevealedCount - 1] || gameApi.getMinesMultiplier(minesCount, nextRevealedCount);
    setCurrentMultiplier(newMult);
    setRevealedCount(nextRevealedCount);
    audioSystem.playMinesGem(nextRevealedCount);

    // Auto-win if all safe gems are found
    const maxSafeGems = 25 - minesCount;
    if (nextRevealedCount === maxSafeGems) {
      handleCashOut(newMult);
    }
  };

  // -------------------------------------------------------------------------
  // PICK RANDOM TILE (CASINO CONVENIENCE)
  // -------------------------------------------------------------------------
  const handlePickRandom = () => {
    if (gameState !== 'playing') return;
    const unrevealedIndices: number[] = [];
    grid.forEach((cell, idx) => {
      if (!cell.revealed) unrevealedIndices.push(idx);
    });
    if (unrevealedIndices.length === 0) return;
    const randIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    handleReveal(randIdx);
  };

  // -------------------------------------------------------------------------
  // CASHOUT & PAYOUT
  // -------------------------------------------------------------------------
  const handleCashOut = (overrideMult?: number) => {
    if (gameState !== 'playing' || revealedCount === 0 || !currentUser) return;
    
    const finalMult = overrideMult || currentMultiplier;
    const win = parseFloat((bet * finalMult).toFixed(2));
    
    updateUserProfile(currentUser.id, { balance: currentUser.balance + win });
    setLastWinAmount(win);
    setGameState('cashed_out');
    setRoundHistory(prev => [{ mult: finalMult, won: true }, ...prev.slice(0, 14)]);
    audioSystem.playMinesCashout();

    // Reveal rest of grid peacefully
    setGrid(prev => prev.map(c => ({ ...c, revealed: true })));
  };

  // Quick Bet Adjusters
  const handleHalfBet = () => setBet(prev => Math.max(1, Math.floor(prev / 2)));
  const handleDoubleBet = () => setBet(prev => Math.min(currentUser?.balance || 50000, prev * 2));
  const handleMaxBet = () => setBet(Math.min(50000, Math.floor(currentUser?.balance || 1000)));

  const nextStepMult = multipliersTable[revealedCount] || (currentMultiplier * 1.15);
  const currentProfit = bet * currentMultiplier - bet;
  const nextStepProfit = bet * nextStepMult - bet;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0c131c] text-white font-sans selection:bg-transparent overflow-hidden">
      
      {/* 1. TOP CASINO APP BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121b27] border-b border-[#213143] shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <Link 
            to="/games" 
            className="w-7 h-7 rounded-lg bg-[#1a2737] hover:bg-[#25364c] flex items-center justify-center text-slate-300 hover:text-white transition-all border border-white/10 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#10b981] to-[#047857] flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black tracking-wider leading-none text-white">MINES</span>
              <span className="text-[8px] font-bold tracking-widest text-[#10b981] uppercase leading-none">SPRIBE STYLE</span>
            </div>
          </div>
        </div>

        {/* User Balance & Audio/Info Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#090e15] px-2.5 py-1 rounded-lg border border-[#213143] shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Balance:</span>
            <span className="text-xs font-black text-[#10b981] tracking-tight">{formatCurrency(currentUser?.balance || 0)}</span>
          </div>

          <button 
            type="button"
            onClick={toggleSound}
            className="w-7 h-7 rounded-lg bg-[#1a2737] hover:bg-[#25364c] flex items-center justify-center text-slate-300 hover:text-white border border-white/10 transition-colors active:scale-95"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button 
            type="button"
            onClick={() => setShowRules(true)}
            className="w-7 h-7 rounded-lg bg-[#1a2737] hover:bg-[#25364c] flex items-center justify-center text-slate-300 hover:text-white border border-white/10 transition-colors active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* 2. TOP WIN HISTORY & ACTIVE PROGRESSION BAR (ZERO SCROLLBAR, ULTRA COMPACT) */}
      <div className="bg-[#0b121c] border-b border-[#1c2938] px-2.5 py-1.5 shrink-0 flex items-center justify-between gap-2 z-10">
        
        {/* Left: Previous Rounds Win History Pills */}
        <div className="flex items-center gap-1 overflow-x-hidden select-none shrink-0">
          <span className="text-[8px] font-bold uppercase text-slate-400 tracking-wider hidden sm:inline mr-0.5">History:</span>
          {roundHistory.slice(0, 5).map((item, idx) => (
            <div 
              key={idx}
              className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-tight flex items-center transition-all ${
                item.won 
                  ? item.mult >= 3.0 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_6px_rgba(245,158,11,0.2)]' 
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
              }`}
            >
              {item.won ? `${item.mult.toFixed(2)}x` : '0.00x'}
            </div>
          ))}
        </div>

        {/* Right: Active / Next Multiplier Capsule */}
        <div className="flex items-center gap-1.5 shrink-0">
          {gameState === 'playing' ? (
            <div className="flex items-center gap-1 bg-[#142232] border border-[#10b981]/50 px-2 py-0.5 rounded-md shadow-xs animate-pulse">
              <span className="text-[9px] text-slate-300 font-bold uppercase">Next:</span>
              <span className="text-[10px] font-black text-[#10b981]">{nextStepMult.toFixed(2)}x</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#141f2c] border border-white/5 px-2 py-0.5 rounded-md">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Max:</span>
              <span className="text-[10px] font-black text-amber-300">
                {multipliersTable[multipliersTable.length - 1]?.toFixed(2) || '99.00'}x
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. CENTER GAME ARENA (5x5 GRID & LIVE STATUS) */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-3 py-1 relative overflow-hidden">
        {/* Subtle Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#10b981]/5 via-transparent to-transparent pointer-events-none" />

        {/* Live Multiplier & Status Capsule */}
        <div className="w-full max-w-[320px] flex items-center justify-between mb-1.5 px-2.5 py-1 rounded-lg bg-[#121b27] border border-[#213143] text-xs shadow-xs">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Mines:</span>
            <span className="font-black text-rose-400 flex items-center gap-0.5 text-[11px]">
              <Flame className="w-3 h-3" /> {minesCount}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Gems:</span>
            <span className="font-black text-[#10b981] text-[11px]">{25 - minesCount - revealedCount}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Current:</span>
            <span className="font-black text-amber-400 text-[11px]">{currentMultiplier.toFixed(2)}x</span>
          </div>
        </div>

        {/* 5x5 MINES CASINO GRID */}
        <div className="w-full max-w-[320px] aspect-square grid grid-cols-5 gap-1.5 p-1.5 bg-[#090e15] rounded-2xl border-2 border-[#1c2a3a] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {grid.map((cell, idx) => {
            const isClickable = gameState === 'playing' && !cell.revealed;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleReveal(idx)}
                disabled={!isClickable}
                className={`
                  relative rounded-xl flex items-center justify-center transition-all duration-200 select-none overflow-hidden
                  ${!cell.revealed 
                    ? 'bg-gradient-to-b from-[#243447] via-[#1a2736] to-[#121b27] border border-[#344b64]/60 shadow-[0_2px_0_#0f1722] hover:from-[#2e425a] hover:to-[#182332] active:translate-y-[1px] active:shadow-none cursor-pointer' 
                    : ''
                  }
                  ${cell.revealed && !cell.isMine 
                    ? 'bg-gradient-to-b from-[#064e3b]/40 to-[#022c22]/80 border-2 border-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-[scale_0.2s_ease-out]' 
                    : ''
                  }
                  ${cell.revealed && cell.isMine 
                    ? cell.isTriggeredMine
                      ? 'bg-gradient-to-b from-[#7f1d1d] to-[#450a0a] border-2 border-[#ef4444] shadow-[0_0_14px_rgba(239,68,68,0.6)] animate-[shake_0.3s_ease-in-out]'
                      : 'bg-gradient-to-b from-[#450a0a]/60 to-[#1c0404] border border-[#ef4444]/40 opacity-70'
                    : ''
                  }
                `}
              >
                {/* Visual Unrevealed Accent Dot */}
                {!cell.revealed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3b516b]/40 group-hover:bg-[#10b981]/50 transition-colors" />
                )}

                {/* Revealed Gem / Bomb */}
                {cell.revealed && (
                  cell.isMine ? (
                    <MinesBombVector 
                      className={`w-7 h-7 sm:w-7.5 sm:h-7.5 drop-shadow-md ${cell.isTriggeredMine ? 'scale-110 animate-bounce' : 'opacity-80'}`} 
                    />
                  ) : (
                    <MinesGemVector className="w-7 h-7 sm:w-7.5 sm:h-7.5 drop-shadow-[0_2px_8px_rgba(16,185,129,0.8)] animate-[zoomIn_0.2s_ease-out]" />
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* Snug Game Message / Pick Random Pill */}
        <div className="h-6 mt-1 flex items-center justify-center w-full max-w-[320px]">
          {gameState === 'exploded' && (
            <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/50 text-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-md animate-bounce">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Round Lost (-{formatCurrency(bet)})</span>
            </div>
          )}

          {gameState === 'cashed_out' && (
            <div className="flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-400 text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Won: {formatCurrency(lastWinAmount)} (+{formatCurrency(lastWinAmount - bet)})</span>
            </div>
          )}

          {gameState === 'playing' && (
            <button
              type="button"
              onClick={handlePickRandom}
              className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#182535] hover:bg-[#22344a] text-slate-200 hover:text-white border border-white/10 text-[10px] font-bold shadow-xs active:scale-95 transition-all"
            >
              <Dices className="w-3 h-3 text-amber-400" />
              <span>Auto Pick Tile</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. ULTRA-COMPACT CASINO CONTROLS AREA */}
      <div className="bg-[#121b27] px-2.5 py-2 flex flex-col gap-1.5 shrink-0 border-t border-[#213143] z-20 shadow-2xl">
        
        {/* Row 1: Bet Amount & Mine Selectors */}
        <div className="grid grid-cols-2 gap-2">
          
          {/* Bet Input with Quick Adjusters */}
          <div className="bg-[#090e15] p-1.5 rounded-xl border border-[#213143] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Bet Amount</span>
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={handleHalfBet}
                  disabled={gameState === 'playing'}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1a2737] hover:bg-[#25364c] text-slate-300 disabled:opacity-40 active:scale-95"
                >
                  ½
                </button>
                <button 
                  type="button"
                  onClick={handleDoubleBet}
                  disabled={gameState === 'playing'}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1a2737] hover:bg-[#25364c] text-slate-300 disabled:opacity-40 active:scale-95"
                >
                  2X
                </button>
                <button 
                  type="button"
                  onClick={handleMaxBet}
                  disabled={gameState === 'playing'}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1a2737] hover:bg-[#25364c] text-slate-300 disabled:opacity-40 active:scale-95"
                >
                  MAX
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-400">৳</span>
              <input 
                type="number" 
                value={bet} 
                onChange={(e) => setBet(Math.max(1, Number(e.target.value)))} 
                disabled={gameState === 'playing'} 
                className="w-full bg-transparent text-white font-black text-sm outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              />
            </div>
          </div>

          {/* Mines Count Selector */}
          <div className="bg-[#090e15] p-1.5 rounded-xl border border-[#213143] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Mines Count</span>
              <span className="text-[9px] text-rose-400 font-bold">{minesCount} Mines</span>
            </div>

            <div className="flex items-center gap-1">
              <select 
                value={minesCount} 
                onChange={(e) => setMinesCount(Number(e.target.value))} 
                disabled={gameState === 'playing'} 
                className="w-full bg-[#121b27] text-white font-bold text-xs py-1 px-1.5 rounded-lg border border-[#213143] outline-none cursor-pointer disabled:opacity-40"
              >
                {[1, 2, 3, 4, 5, 7, 10, 15, 20, 24].map(n => (
                  <option key={n} value={n} className="bg-[#090e15] text-white">
                    {n} Mines ({(25 - n)} Gems)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Prominent BET / CASHOUT Action Button */}
        <div>
          {gameState !== 'playing' ? (
            <button 
              type="button"
              onClick={startGame} 
              className="w-full bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857] hover:from-[#34d399] hover:to-[#059669] text-white rounded-xl py-2.5 font-black text-sm uppercase shadow-[0_3px_0_#065f46] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
              <span>BET {formatCurrency(bet)}</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => handleCashOut()} 
              disabled={revealedCount === 0} 
              className={`w-full rounded-xl py-2.5 font-black text-sm uppercase transition-all flex items-center justify-center gap-2 ${
                revealedCount === 0
                  ? 'bg-[#1e293b] text-slate-500 border border-white/5 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#f59e0b] via-[#d97706] to-[#b45309] hover:from-[#fbbf24] hover:to-[#d97706] text-white shadow-[0_3px_0_#78350f] active:translate-y-[2px] active:shadow-none animate-pulse cursor-pointer'
              }`}
            >
              <Award className="w-4 h-4 text-amber-200" />
              <span>
                {revealedCount === 0 
                  ? 'PICK A TILE FIRST' 
                  : `CASHOUT ${formatCurrency(bet * currentMultiplier)} (+${formatCurrency(currentProfit)})`
                }
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 5. RULES & PAYTABLE MODAL */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-[#121b27] border border-[#213143] rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-3 border-b border-[#213143] flex items-center justify-between bg-[#090e15]">
              <div className="flex items-center gap-2">
                <MinesGemVector className="w-5 h-5" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mines Game Rules</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowRules(false)}
                className="w-6 h-6 rounded-md bg-[#1a2737] text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 overflow-y-auto space-y-3 text-[11px] text-slate-300">
              <div className="bg-[#090e15] p-2.5 rounded-xl border border-[#213143]">
                <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> How to Play
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  1. Set your <b>Bet Amount</b> and choose the number of <b>Mines</b> hidden in the 5x5 grid (from 1 to 24).<br />
                  2. Click <b>BET</b> to begin the round.<br />
                  3. Tap on any unrevealed tile. If you uncover a <b>Gem</b>, your multiplier increases! You can cash out anytime.<br />
                  4. If you uncover a <b>Mine</b>, the round ends and your bet is lost.
                </p>
              </div>

              <div className="bg-[#090e15] p-2.5 rounded-xl border border-[#213143]">
                <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Multiplier Math (Spribe Model)
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Multipliers are calculated using combinatorics based on the probability of finding consecutive safe gems with high RTP (96%).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 border-t border-[#213143] bg-[#090e15]">
              <button 
                type="button"
                onClick={() => setShowRules(false)}
                className="w-full py-2 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-lg text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
