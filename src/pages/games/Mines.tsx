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

  // Synchronized Refs for secure closures
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const updateUserProfileRef = useRef(updateUserProfile);
  useEffect(() => {
    updateUserProfileRef.current = updateUserProfile;
  }, [updateUserProfile]);

  const isStartingRef = useRef(false);

  const [bet, setBet] = useState(10);
  const [minesCount, setMinesCount] = useState(3);
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Game Engine State
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'exploded' | 'cashed_out'>('idle');
  const gameStateRef = useRef<'idle' | 'playing' | 'exploded' | 'cashed_out'>('idle');
  const [grid, setGrid] = useState<CellState[]>(Array(25).fill({ isMine: false, revealed: false }));
  const gridRef = useRef<CellState[]>(Array(25).fill({ isMine: false, revealed: false }));
  
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [multipliersTable, setMultipliersTable] = useState<number[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const revealedCountRef = useRef(0);
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
    const user = currentUserRef.current;
    if (gameStateRef.current === 'playing' || !user || isStartingRef.current) return;
    if (user.balance < bet) {
      alert("Insufficient balance! Please deposit to continue.");
      return;
    }
    if (bet <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    isStartingRef.current = true;
    try {
      updateUserProfileRef.current(user.id, { balance: +(user.balance - bet).toFixed(2) });
      try { audioSystem.playMinesTile(); } catch(e) { console.warn(e); }

      const winControl = (siteSettings?.gameWinControls?.mines as WinControlLevel) || 'medium';
      const res = await gameApi.initMines(bet, minesCount, winControl);

      const initialGrid: CellState[] = res.grid.map(isGem => ({
        isMine: !isGem,
        revealed: false
      }));

      setGrid(initialGrid);
      gridRef.current = initialGrid;
      
      setMultipliersTable(res.multipliersTable);
      setCurrentMultiplier(1.00);
      
      setRevealedCount(0);
      revealedCountRef.current = 0;
      
      setForcedLossStep(res.forcedLossStep ?? null);
      setLastWinAmount(0);
      setLastExplosionIndex(null);
      
      setGameState('playing');
      gameStateRef.current = 'playing';
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Failed to start game. Please try again.");
    } finally {
      isStartingRef.current = false;
    }
  };

  // -------------------------------------------------------------------------
  // REVEAL TILE (STRICT SERVER-CONTROLLED WIN/LOSS)
  // -------------------------------------------------------------------------
  const handleReveal = (index: number) => {
    if (gameStateRef.current !== 'playing' || gridRef.current[index].revealed) return;
    
    // Immediately lock this tile in the ref to prevent rapid double-clicks
    gridRef.current[index].revealed = true;
    try { audioSystem.playMinesTile(); } catch(e) { console.warn(e); }

    const nextRevealedCount = revealedCountRef.current + 1;
    let cell = gridRef.current[index];
    const newGrid = [...gridRef.current];

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
      gridRef.current = fullyRevealedGrid;
      setLastExplosionIndex(index);
      
      setGameState('exploded');
      gameStateRef.current = 'exploded';
      
      setRoundHistory(prev => [{ mult: 0.00, won: false }, ...prev.slice(0, 14)]);
      try { audioSystem.playMinesBomb(); } catch(e) { console.warn(e); }
      return;
    }

    // SAFE GEM FOUND!
    cell = { ...cell, isMine: false, revealed: true };
    newGrid[index] = cell;
    
    setGrid(newGrid);
    gridRef.current = newGrid;
    
    const newMult = multipliersTable[nextRevealedCount - 1] || gameApi.getMinesMultiplier(minesCount, nextRevealedCount);
    setCurrentMultiplier(newMult);
    
    setRevealedCount(nextRevealedCount);
    revealedCountRef.current = nextRevealedCount;
    
    try { audioSystem.playMinesGem(nextRevealedCount); } catch(e) { console.warn(e); }

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
    if (gameStateRef.current !== 'playing') return;
    const unrevealedIndices: number[] = [];
    gridRef.current.forEach((cell, idx) => {
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
    const user = currentUserRef.current;
    if (gameStateRef.current !== 'playing' || (revealedCountRef.current === 0 && !overrideMult) || !user) return;
    
    // Immediately lock state to prevent double-clicks
    setGameState('cashed_out');
    gameStateRef.current = 'cashed_out';
    
    const finalMult = overrideMult || currentMultiplier;
    const win = parseFloat((bet * finalMult).toFixed(2));
    
    updateUserProfileRef.current(user.id, { balance: +(user.balance + win).toFixed(2) });
    setLastWinAmount(win);
    setRoundHistory(prev => [{ mult: finalMult, won: true }, ...prev.slice(0, 14)]);
    try { audioSystem.playMinesCashout(); } catch(e) { console.warn(e); }

    // Reveal rest of grid peacefully
    setGrid(prev => prev.map(c => ({ ...c, revealed: true })));
  };

  // Quick Bet Adjusters
  const handleHalfBet = () => setBet(prev => Math.max(1, Math.floor(prev / 2)));
  const handleDoubleBet = () => setBet(prev => Math.min(currentUserRef.current?.balance || 50000, prev * 2));
  const handleMaxBet = () => setBet(Math.min(50000, Math.floor(currentUserRef.current?.balance || 1000)));

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
            className="w-7 h-7 rounded-lg bg-[#1a2737] hover:bg-[#25364c] flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold tracking-wider leading-none text-white">MINES</span>
              <span className="text-[8px] font-bold tracking-widest text-emerald-400 uppercase leading-none">SPRIBE STYLE</span>
            </div>
          </div>
        </div>

        {/* User Balance & Audio/Info Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1a2737] px-2.5 py-1 rounded-md border border-[#213143] shadow-inner">
            <span className="text-[10px] text-slate-400 font-medium uppercase">Balance:</span>
            <span className="text-xs font-semibold text-emerald-400 tracking-tight">{formatCurrency(currentUser?.balance || 0)}</span>
          </div>

          <button 
            type="button"
            onClick={toggleSound}
            className="w-7 h-7 rounded-md bg-[#1a2737] hover:bg-[#25364c] flex items-center justify-center text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button 
            type="button"
            onClick={() => setShowRules(true)}
            className="w-7 h-7 rounded-md bg-[#1a2737] hover:bg-[#25364c] flex items-center justify-center text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      </div>

      {/* 2. TOP WIN HISTORY & ACTIVE PROGRESSION BAR (ZERO SCROLLBAR, ULTRA COMPACT) */}
      <div className="bg-[#121b27] border-b border-[#213143] px-2.5 py-1.5 shrink-0 flex items-center justify-between gap-2 z-10">
        
        {/* Left: Previous Rounds Win History Pills */}
        <div className="flex items-center gap-1 overflow-x-hidden select-none shrink-0">
          <span className="text-[9px] font-medium uppercase text-slate-400 tracking-wider hidden sm:inline mr-0.5">History:</span>
          {roundHistory.slice(0, 5).map((item, idx) => (
            <div 
              key={idx}
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-tight flex items-center transition-all ${
                item.won 
                  ? item.mult >= 3.0 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {item.won ? `${item.mult.toFixed(2)}x` : '0.00x'}
            </div>
          ))}
        </div>

        {/* Right: Active / Next Multiplier Capsule */}
        <div className="flex items-center gap-1.5 shrink-0">
          {gameState === 'playing' ? (
            <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md animate-pulse">
              <span className="text-[9px] text-emerald-400 font-medium uppercase">Next:</span>
              <span className="text-[10px] font-bold text-emerald-400">{nextStepMult.toFixed(2)}x</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#0c131c] border border-[#213143] px-2 py-0.5 rounded-md">
              <span className="text-[9px] text-slate-400 font-medium uppercase">Max:</span>
              <span className="text-[10px] font-bold text-amber-600">
                {multipliersTable[multipliersTable.length - 1]?.toFixed(2) || '99.00'}x
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN SCROLLABLE GAME AREA */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto flex flex-col items-center bg-[#0c131c] px-2 py-2">
        <div className="w-full max-w-[380px] flex flex-col items-center gap-1.5">
          
          {/* Live Multiplier & Status Capsule */}
          <div className="w-full flex items-center justify-between px-2.5 py-1 rounded-md bg-[#121b27] border border-[#213143] text-xs shadow-md">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 uppercase font-medium">Mines:</span>
              <span className="font-semibold text-rose-500 flex items-center gap-0.5 text-[10px]">
                <Flame className="w-2.5 h-2.5" /> {minesCount}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 uppercase font-medium">Gems:</span>
              <span className="font-semibold text-emerald-400 text-[10px]">{25 - minesCount - revealedCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 uppercase font-medium">Current:</span>
              <span className="font-semibold text-amber-500 text-[10px]">{currentMultiplier.toFixed(2)}x</span>
            </div>
          </div>

          {/* 5x5 MINES CASINO GRID */}
          <div className="w-full aspect-square grid grid-cols-5 gap-1 p-1 bg-[#121b27] rounded-xl border border-[#213143] shadow-md">
            {grid.map((cell, idx) => {
              const isClickable = gameState === 'playing' && !cell.revealed;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleReveal(idx)}
                  disabled={!isClickable}
                  className={`
                    relative rounded-lg flex items-center justify-center transition-all duration-200 select-none overflow-hidden
                    ${!cell.revealed 
                      ? 'bg-[#1a2737] border border-[#213143] shadow-[0_2px_0_#0f1722] hover:bg-[#25364c] active:translate-y-[1px] active:shadow-none cursor-pointer' 
                      : ''
                    }
                    ${cell.revealed && !cell.isMine 
                      ? 'bg-emerald-500/20 border border-emerald-500/30 animate-[scale_0.2s_ease-out]' 
                      : ''
                    }
                    ${cell.revealed && cell.isMine 
                      ? cell.isTriggeredMine 
                        ? 'bg-rose-950/90 border-2 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-[shake_0.3s_ease-in-out]' 
                        : 'bg-rose-950/50 border border-rose-500/30 opacity-70'
                      : ''
                    }
                  `}
                >
                  {/* Visual Unrevealed Accent Dot */}
                  {!cell.revealed && (
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-300 group-hover:bg-emerald-400 transition-colors" />
                  )}

                  {/* Revealed Gem / Bomb */}
                  {cell.revealed && (
                    cell.isMine ? (
                      <MinesBombVector 
                        className={`w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md ${cell.isTriggeredMine ? 'scale-110 animate-bounce' : 'opacity-80'}`} 
                      />
                    ) : (
                      <MinesGemVector className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md animate-[zoomIn_0.2s_ease-out]" />
                    )
                  )}
                </button>
              );
            })}
          </div>

          {/* Snug Game Message / Pick Random Pill */}
          <div className="h-6 flex items-center justify-center w-full">
            {gameState === 'exploded' && (
              <div className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-md animate-bounce">
                <Flame className="w-3 h-3 text-rose-500" />
                <span>Round Lost (-${formatCurrency(bet)})</span>
              </div>
            )}
            {gameState === 'cashed_out' && (
              <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-md animate-bounce">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Cashed Out! +${formatCurrency(lastWinAmount)}</span>
              </div>
            )}
            {gameState === 'playing' && (
              <button 
                onClick={handlePickRandom}
                className="flex items-center gap-1 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/40 text-indigo-400 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all active:scale-95"
              >
                <Dices className="w-3 h-3" />
                <span>Pick Random</span>
              </button>
            )}
          </div>

          {/* 4. ULTRA-COMPACT CASINO CONTROLS AREA */}
          <div className="w-full bg-[#121b27] px-2 py-1.5 flex flex-col gap-1.5 border border-[#213143] rounded-lg shadow-md">
            {/* Row 1: Bet Amount & Mine Selectors */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Bet Input with Quick Adjusters */}
              <div className="bg-[#090e15] p-1 rounded-md border border-[#213143] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-slate-400 font-medium uppercase px-0.5">Bet</span>
                  <div className="flex gap-0.5">
                    <button 
                      type="button"
                      onClick={handleHalfBet}
                      disabled={gameState === 'playing'}
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#121b27] border border-[#213143] hover:bg-[#1a2737] text-slate-300 disabled:opacity-40 active:scale-95"
                    >
                      ½
                    </button>
                    <button 
                      type="button"
                      onClick={handleDoubleBet}
                      disabled={gameState === 'playing'}
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#121b27] border border-[#213143] hover:bg-[#1a2737] text-slate-300 disabled:opacity-40 active:scale-95"
                    >
                      2X
                    </button>
                    <button 
                      type="button"
                      onClick={handleMaxBet}
                      disabled={gameState === 'playing'}
                      className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#121b27] border border-[#213143] hover:bg-[#1a2737] text-slate-300 disabled:opacity-40 active:scale-95"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 px-1">
                  <span className="text-xs font-semibold text-slate-400">৳</span>
                  <input 
                    type="number" 
                    value={bet}
                    onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
                    disabled={gameState === 'playing'}
                    className="w-full bg-transparent text-white font-semibold text-xs outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Mines Count Selector */}
              <div className="bg-[#090e15] p-1.5 rounded-md border border-[#213143] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-slate-400 font-medium uppercase">Mines</span>
                  <span className="text-[9px] text-rose-500 font-medium">{minesCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <select 
                    value={minesCount}
                    onChange={(e) => setMinesCount(Number(e.target.value))}
                    disabled={gameState === 'playing'}
                    className="w-full bg-[#121b27] text-white font-medium text-[11px] py-1 px-1 rounded border border-[#213143] outline-none cursor-pointer disabled:opacity-40"
                  >
                    {[1, 2, 3, 4, 5, 7, 10, 15, 20, 24].map(n => (
                      <option key={n} value={n} className="bg-[#121b27] text-white">
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
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-md py-1.5 font-semibold text-[11px] uppercase active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>BET {formatCurrency(bet)}</span>
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleCashOut()}
                  disabled={revealedCount === 0}
                  className={`w-full rounded-md py-1.5 font-semibold text-[11px] uppercase transition-all flex items-center justify-center gap-1.5 shadow-md ${
                    revealedCount === 0 
                      ? 'bg-[#1e293b] text-slate-400 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.98] animate-pulse cursor-pointer'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>
                    {revealedCount === 0 
                      ? 'PICK A TILE FIRST' 
                      : `CASHOUT ${formatCurrency(bet * currentMultiplier)}`
                    }
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. RULES & PAYTABLE MODAL */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-[#121b27] border border-[#213143] rounded-xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-3 border-b border-[#213143] flex items-center justify-between bg-[#0c131c]">
              <div className="flex items-center gap-2">
                <MinesGemVector className="w-5 h-5 drop-shadow-md" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Mines Game Rules</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowRules(false)}
                className="w-6 h-6 rounded bg-[#1a2737] text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 overflow-y-auto space-y-3 text-[11px] text-slate-300">
              <div className="bg-[#090e15] p-2.5 rounded-md border border-[#213143]">
                <h4 className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> How to Play
                </h4>
                <p className="leading-relaxed">
                  1. Set your <b>Bet Amount</b> and choose the number of <b>Mines</b> hidden in the 5x5 grid (from 1 to 24).<br />
                  2. Click <b>BET</b> to begin the round.<br />
                  3. Tap on any unrevealed tile. If you uncover a <b>Gem</b>, your multiplier increases! You can cash out anytime.<br />
                  4. If you uncover a <b>Mine</b>, the round ends and your bet is lost.
                </p>
              </div>

              <div className="bg-[#090e15] p-2.5 rounded-md border border-[#213143]">
                <h4 className="font-semibold text-amber-600 mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Multiplier Math (Spribe Model)
                </h4>
                <p className="leading-relaxed">
                  Multipliers are calculated using combinatorics based on the probability of finding consecutive safe gems with high RTP (96%).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 border-t border-[#213143] bg-[#0c131c]">
              <button 
                type="button"
                onClick={() => setShowRules(false)}
                className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded text-xs"
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
