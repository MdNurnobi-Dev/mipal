import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Settings, RotateCcw, Zap, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gameApi } from '../../api/gameApi';

const CARDS = [
  { id: 'A', suit: '♠', val: 'A', color: 'text-black', isFace: false, name: 'ACE' },
  { id: 'K', suit: '♥', val: 'K', color: 'text-[#d92626]', isFace: true, faceChar: '♚' },
  { id: 'Q', suit: '♣', val: 'Q', color: 'text-black', isFace: true, faceChar: '♛' },
  { id: 'J', suit: '♦', val: 'J', color: 'text-[#d92626]', isFace: true, faceChar: '♞' }
];

const COLS = 5;
const ROWS = 4;

export default function SuperAce() {
  const { currentUser, updateUserProfile } = useApp();
  
  const [bet, setBet] = useState(0.5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][]>([]);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [showWin, setShowWin] = useState(false);
  const [activeMult, setActiveMult] = useState(1);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false, false]);
  
  useEffect(() => {
    const initialGrid = Array(COLS).fill(0).map(() => 
      Array(ROWS).fill(0).map(() => CARDS[Math.floor(Math.random() * CARDS.length)].id)
    );
    setGrid(initialGrid);
  }, []);

  const handleSpin = async () => {
    if (isSpinning || !currentUser) return;
    if (currentUser.balance < bet) return alert("Insufficient balance!");

    updateUserProfile(currentUser.id, { balance: currentUser.balance - bet });
    setIsSpinning(true);
    setWinAmount(0);
    setShowWin(false);
    setActiveMult(1);
    setSpinningCols([true, true, true, true, true]);

    const symbols = CARDS.map(c => c.id);
    const result = await gameApi.spinSlot(bet, COLS, ROWS, symbols);

    const spinDuration = 300;
    const staggerTime = 100;

    for (let c = 0; c < COLS; c++) {
      setTimeout(() => {
        setGrid(prev => {
          const newGrid = [...prev];
          newGrid[c] = result.state.grid[c];
          return newGrid;
        });
        setSpinningCols(prev => {
          const newSpins = [...prev];
          newSpins[c] = false;
          return newSpins;
        });

        if (c === COLS - 1) {
          setIsSpinning(false);
          if (result.isWin) {
             setWinAmount(result.payout);
             setShowWin(true);
             const mults = [1, 2, 3, 5];
             setActiveMult(mults[Math.floor(Math.random() * mults.length)]);
             if (currentUser) updateUserProfile(currentUser.id, { balance: currentUser.balance + result.payout });
             setTimeout(() => setShowWin(false), 2000);
          }
        }
      }, spinDuration + (c * staggerTime));
    }
  };

  const getCardDetails = (id: string) => CARDS.find(c => c.id === id) || CARDS[0];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#03151f] font-sans overflow-hidden text-white">
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#1c0808] to-transparent pointer-events-none"></div>

      <Link to="/games" className="absolute top-1 left-1 z-50 w-6 h-6 flex items-center justify-center bg-black/40 rounded-full border border-white/20 active:scale-95 text-[#f0ba4e]">
         <ArrowLeft className="w-3 h-3" />
      </Link>

      {/* Header */}
      <div className="shrink-0 relative z-10 flex flex-col items-center pt-1 pb-1">
        <div className="flex items-center justify-between w-full px-2">
           <div className="bg-[#a88232] text-black font-black px-1 py-1 rounded-[1px] text-[6px] leading-none [writing-mode:vertical-lr] rotate-180 border border-[#f5b800]">
             JILI
           </div>
           
           <span className="text-lg font-black italic tracking-tighter" style={{
             background: 'linear-gradient(to bottom, #fff8d6, #d79c31)',
             WebkitBackgroundClip: 'text',
             WebkitTextFillColor: 'transparent',
             WebkitTextStroke: '1px #4a2d00'
           }}>SuperAce</span>
           
           <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-900 rounded-full border border-[#f5b800] flex flex-col items-center justify-center shadow-lg active:scale-95 cursor-pointer">
             <span className="text-white font-black text-[6px] leading-none">BUY</span>
             <span className="text-[#f5b800] font-black text-[6px] leading-none">BONUS</span>
           </div>
        </div>

        <div className="bg-gradient-to-b from-[#b88c42] to-[#704f1e] rounded-full p-[1px] mt-1 shadow-lg border border-[#3e290f]">
           <div className="flex items-center gap-0.5 bg-[#261709] rounded-full px-2 py-0.5">
             {[1, 2, 3, 5].map(m => (
               <div key={m} className={`px-1.5 rounded-full font-black text-[12px] leading-tight ${activeMult === m ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#fff2a8] to-[#ffb800]' : 'text-[#8a6b32]'}`}>
                 <span className="text-[8px]">x</span>{m}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Grid Area - Fills space compactly */}
      <div className="flex-1 min-h-0 relative z-10 flex flex-col justify-center px-1 pb-1">
        {showWin && (
           <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
             <div className="bg-gradient-to-b from-[#ffdb58] to-[#c78b00] px-3 py-1 rounded-full border border-white shadow-[0_0_10px_rgba(255,215,0,0.8)] animate-[bounce_0.5s_infinite]">
               <span className="text-sm font-black text-[#4a2d00] tracking-wider">WIN {winAmount.toFixed(2)}</span>
             </div>
           </div>
        )}

        <div className="w-full h-full max-w-sm mx-auto bg-[#1b2b36] rounded p-1 border-t border-[#3e5361] shadow-xl overflow-hidden flex flex-col">
           <div className="flex-1 min-h-0 flex gap-[1px] bg-[#101b22] p-[1px] rounded-sm">
             {grid.map((col, cIdx) => (
               <div key={cIdx} className="flex-1 flex flex-col gap-[1px] relative overflow-hidden bg-[#c3c8cf] rounded-sm">
                 {col.map((cardId, rIdx) => {
                   const card = getCardDetails(cardId);
                   const isGold = Math.random() > 0.8 && !isSpinning; 
                   
                   return (
                     <div key={rIdx} className={`flex-1 relative flex flex-col items-center justify-center overflow-hidden border border-black/10
                       ${isGold ? 'bg-gradient-to-b from-[#ffe066] to-[#e69900] border-[#b37700]' : 'bg-gradient-to-b from-white to-[#eaedf2]'}
                       ${spinningCols[cIdx] ? 'opacity-50 blur-[1px] translate-y-full' : 'opacity-100 translate-y-0 transition-transform duration-200'}
                     `}>
                       <div className="absolute top-[1px] left-[1px] flex flex-col items-center leading-none">
                          <span className={`text-[8px] font-black ${isGold ? 'text-[#4a2d00]' : card.color}`}>{card.val}</span>
                          <span className={`text-[6px] ${isGold ? 'text-[#4a2d00]' : card.color}`}>{card.suit}</span>
                       </div>
                       
                       <div className="mt-[2px] flex flex-col items-center justify-center">
                          {card.isFace ? (
                             <div className={`text-[10px] border ${isGold ? 'border-[#4a2d00] text-[#4a2d00]' : `${card.color} border-current`} bg-white/50 rounded-[1px] w-4 h-5 flex items-center justify-center overflow-hidden`}>
                               {card.faceChar}
                             </div>
                          ) : (
                             <div className="flex flex-col items-center">
                               <span className={`text-[12px] ${isGold ? 'text-[#4a2d00]' : card.color}`}>{card.suit}</span>
                               <div className="bg-black text-[#f5b800] text-[4px] font-black px-[2px] py-[1px] rounded uppercase mt-[1px] border border-[#f5b800] leading-none">
                                 {card.name}
                               </div>
                             </div>
                          )}
                       </div>
                     </div>
                   );
                 })}
                 {spinningCols[cIdx] && (
                   <div className="absolute inset-0 bg-white/40 flex flex-col gap-[1px] overflow-hidden pointer-events-none">
                     {[1,2,3,4,5].map(i => <div key={i} className="flex-1 bg-gradient-to-b from-transparent via-black/10 to-transparent"></div>)}
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Controls Area */}
      <div className="shrink-0 relative z-20 bg-[#051117] border-t border-[#1a2f3a] pb-1">
        <div className="flex justify-center -mt-2.5 mb-1.5">
           <span className="text-[#f5b800] font-black text-[9px] tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
             WIN Tk {(showWin ? winAmount : 0).toFixed(2)}
           </span>
        </div>

        <div className="flex items-center justify-between px-2 sm:px-6 mb-1 relative h-10">
           <div className="flex items-center gap-1.5">
             <button className="w-6 h-6 rounded-full bg-gradient-to-b from-[#5c373a] to-[#3a2022] border border-[#8c5a5d] shadow-[0_2px_3px_rgba(0,0,0,0.5)] flex items-center justify-center text-white/70 active:scale-95">
               <Settings className="w-3 h-3" />
             </button>
             <div className="flex flex-col items-center">
               <button onClick={() => setBet(b => b === 0.5 ? 10 : 0.5)} className="w-6 h-6 rounded-full bg-gradient-to-b from-[#5c373a] to-[#3a2022] border border-[#8c5a5d] shadow flex items-center justify-center text-[#4ade80] active:scale-95">
                 <div className="flex flex-col gap-[1px]">
                   <div className="w-2 h-[1.5px] bg-current rounded-full"></div>
                   <div className="w-2 h-[1.5px] bg-current rounded-full"></div>
                   <div className="w-2 h-[1.5px] bg-current rounded-full"></div>
                 </div>
               </button>
               <span className="text-[7px] text-white/70 mt-0.5 font-bold">Bet Tk {bet}</span>
             </div>
           </div>

           {/* Central Spin Button */}
           <div className="absolute left-1/2 -translate-x-1/2 -top-3">
             <button 
               onClick={handleSpin}
               disabled={isSpinning}
               className={`w-12 h-12 rounded-full p-[2px] bg-[#ffb800] shadow-[0_3px_6px_rgba(0,0,0,0.8)] active:scale-95 transition-transform ${isSpinning ? 'brightness-75' : ''}`}
               style={{ background: 'linear-gradient(to bottom, #ffe680, #cc7a00)' }}
             >
                <div className="w-full h-full rounded-full border border-[#ffe680] bg-gradient-to-b from-[#ffcc00] to-[#e68a00] flex flex-col items-center justify-center relative shadow-inner">
                   <RotateCcw className="w-5 h-5 text-white/90 drop-shadow-sm stroke-2" />
                   <span className="absolute text-[#4a2d00] font-black text-[7px] tracking-widest drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">JILI</span>
                </div>
             </button>
           </div>

           <div className="flex items-center gap-1.5">
             <button className="w-6 h-6 rounded-full bg-gradient-to-b from-[#5c373a] to-[#3a2022] border border-[#8c5a5d] shadow flex items-center justify-center text-[#ffcc00] active:scale-95">
               <RotateCcw className="w-3 h-3" />
             </button>
             <button className="w-6 h-6 rounded-full bg-gradient-to-b from-[#5c373a] to-[#3a2022] border border-[#8c5a5d] shadow flex items-center justify-center text-[#ffcc00] active:scale-95">
               <Zap className="w-3 h-3 fill-current" />
             </button>
           </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 border-t border-white/5">
           <div className="flex items-center gap-1.5">
             <span className="bg-[#4d5b63] text-white text-[7px] font-black px-1 py-0.5 rounded-[1px]">LV 0</span>
             <span className="text-[#f5b800] text-[8px] font-bold">Balance <span className="text-white">Tk {parseFloat((currentUser?.balance || 0).toString()).toFixed(2)}</span></span>
           </div>
           <Wifi className="w-2.5 h-2.5 text-[#4ade80]" />
        </div>
      </div>
    </div>
  );
}
