import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { ArrowLeft, Volume2, Gem, Bomb, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gameApi } from '../../api/gameApi';

export default function Mines() {
  const { currentUser, updateUserProfile, siteSettings } = useApp();
  const { formatCurrency } = useCurrency();
  
  const [bet, setBet] = useState(10);
  const [minesCount, setMinesCount] = useState(3);
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'exploded' | 'cashed_out'>('idle');
  const [grid, setGrid] = useState<{ isMine: boolean, revealed: boolean }[]>(Array(25).fill({ isMine: false, revealed: false }));
  
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [stepMult, setStepMult] = useState(1.10);
  const [revealedCount, setRevealedCount] = useState(0);
  const [forcedLossStep, setForcedLossStep] = useState<number | null>(null);

  const startGame = async () => {
    if (gameState === 'playing' || !currentUser) return;
    if (currentUser.balance < bet) return alert("Insufficient balance!");

    updateUserProfile(currentUser.id, { balance: currentUser.balance - bet });
    
    // Server logic
    const winControl = (siteSettings?.gameWinControls?.mines as any) || 'medium';
    const res = await gameApi.initMines(bet, minesCount, winControl);
    
    const newGrid = res.grid.map(isGem => ({ isMine: !isGem, revealed: false }));
    setGrid(newGrid);
    setStepMult(res.multiplierMultiplier);
    setCurrentMultiplier(1.00);
    setRevealedCount(0);
    setForcedLossStep(res.predeterminedLossStep ?? null);
    setGameState('playing');
  };

  const handleReveal = (index: number) => {
    if (gameState !== 'playing' || grid[index].revealed) return;
    
    let cell = grid[index];
    const newGrid = [...grid];
    const newRevealedCount = revealedCount + 1;

    // Check if we need to force a loss
    if (!cell.isMine && forcedLossStep && newRevealedCount >= forcedLossStep) {
      // Convert this safe cell into a mine to force the loss
      cell = { ...cell, isMine: true };
    }

    newGrid[index] = { ...cell, revealed: true };
    setGrid(newGrid);

    if (cell.isMine) {
      // Boom!
      setGameState('exploded');
      revealAll();
    } else {
      // Safe!
      setRevealedCount(newRevealedCount);
      setCurrentMultiplier(prev => parseFloat((prev * stepMult).toFixed(2)));
      
      // Auto-win if all non-mines found
      if (newRevealedCount === (25 - minesCount)) {
        handleCashOut(parseFloat((currentMultiplier * stepMult).toFixed(2)));
      }
    }
  };

  const revealAll = () => {
    setGrid(prev => prev.map(c => ({ ...c, revealed: true })));
  };

  const handleCashOut = (overrideMult?: number) => {
    if (gameState !== 'playing' || revealedCount === 0 || !currentUser) return;
    const finalMult = overrideMult || currentMultiplier;
    const win = bet * finalMult;
    
    updateUserProfile(currentUser.id, { balance: currentUser.balance + win });
    setGameState('cashed_out');
    revealAll();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0F1923] font-sans selection:bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-[#172431] border-b border-[#2A3947] shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/games" className="w-6 h-6 rounded bg-[#2A3947] flex items-center justify-center text-white hover:bg-[#344658]">
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <span className="text-white font-black text-[12px] tracking-widest uppercase">MINES</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0F1923] px-2 py-0.5 rounded-sm shadow-inner">
            <span className="text-[#00E701] font-black text-xs">{formatCurrency(currentUser?.balance || 0)}</span>
          </div>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="flex-1 flex flex-col items-center justify-center p-2">
        <div className="w-full max-w-[350px] aspect-square grid grid-cols-5 gap-1.5 sm:gap-2">
          {grid.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleReveal(idx)}
              disabled={gameState !== 'playing' || cell.revealed}
              className={`
                relative rounded-lg sm:rounded-xl shadow-sm transition-all duration-300 ease-out flex items-center justify-center
                ${!cell.revealed ? 'bg-[#2F4553] hover:bg-[#3B5466] cursor-pointer shadow-[0_4px_0_#21323D] active:translate-y-[4px] active:shadow-none' : ''}
                ${cell.revealed && !cell.isMine ? 'bg-[#00E701]/20 border-2 border-[#00E701]' : ''}
                ${cell.revealed && cell.isMine ? 'bg-[#FF003F]/20 border-2 border-[#FF003F]' : ''}
              `}
              style={{
                transform: cell.revealed ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              {cell.revealed && (
                cell.isMine ? (
                  <Bomb className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF003F] drop-shadow-md animate-[ping_0.3s_ease-out_forwards]" />
                ) : (
                  <Gem className="w-6 h-6 sm:w-8 sm:h-8 text-[#00E701] drop-shadow-md animate-[bounce_0.5s_ease-out]" />
                )
              )}
            </button>
          ))}
        </div>
        
        {/* Win/Loss Status */}
        <div className="h-[40px] mt-4 flex items-center justify-center">
          {gameState === 'exploded' && <span className="text-[#FF003F] font-black text-xl drop-shadow-md">BOOM! You lost {bet}</span>}
          {gameState === 'cashed_out' && <span className="text-[#00E701] font-black text-xl drop-shadow-md">Cashed Out {(bet * currentMultiplier).toFixed(2)}</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#172431] p-2 flex flex-col gap-2 shrink-0 border-t border-[#2A3947]">
        <div className="flex items-center justify-between gap-2">
           <div className="flex-1 bg-[#0F1923] p-1.5 rounded-lg border border-[#2A3947]">
             <span className="text-[9px] text-[#869BAE] font-bold uppercase mb-1 block">Bet Amount</span>
             <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} disabled={gameState === 'playing'} className="w-full bg-transparent text-white font-bold text-sm outline-none" />
           </div>
           <div className="flex-1 bg-[#0F1923] p-1.5 rounded-lg border border-[#2A3947]">
             <span className="text-[9px] text-[#869BAE] font-bold uppercase mb-1 block">Mines</span>
             <select value={minesCount} onChange={(e) => setMinesCount(Number(e.target.value))} disabled={gameState === 'playing'} className="w-full bg-transparent text-white font-bold text-sm outline-none appearance-none">
                {[1,3,5,10,24].map(n => <option key={n} value={n}>{n}</option>)}
             </select>
           </div>
        </div>

        {gameState !== 'playing' ? (
          <button onClick={startGame} className="w-full bg-[#00E701] hover:bg-[#00c901] text-[#0F1923] rounded-lg py-3 font-black text-sm uppercase shadow-[0_4px_0_#009101] active:translate-y-[4px] active:shadow-none transition-all">
            Bet
          </button>
        ) : (
          <button onClick={() => handleCashOut()} disabled={revealedCount === 0} className="w-full bg-[#ff9900] hover:bg-[#e68a00] text-[#0F1923] rounded-lg py-3 font-black text-sm uppercase shadow-[0_4px_0_#b36b00] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_#b36b00]">
            Cashout {(bet * currentMultiplier).toFixed(2)}
          </button>
        )}
      </div>
    </div>
  );
}
