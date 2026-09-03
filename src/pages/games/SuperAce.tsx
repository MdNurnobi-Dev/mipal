import { useGameFullscreen } from '../../hooks/useGameFullscreen';
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Settings, RotateCcw, Zap, Wifi, Coins, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gameApi } from '../../api/gameApi';
import { audioSystem } from '../../utils/audioSystem';

const CARDS = [
  { id: 'A', suit: '♠', val: 'A', color: 'text-black', isFace: false, name: 'ACE' },
  { id: 'K', suit: '♥', val: 'K', color: 'text-[#d92626]', isFace: true, faceChar: '♚' },
  { id: 'Q', suit: '♣', val: 'Q', color: 'text-black', isFace: true, faceChar: '♛' },
  { id: 'J', suit: '♦', val: 'J', color: 'text-[#d92626]', isFace: true, faceChar: '♞' }
];

const COLS = 5;
const ROWS = 4;

export default function SuperAce() {
  useGameFullscreen();
  const { currentUser, updateUserProfile, siteSettings } = useApp();
  
  const [bet, setBet] = useState(0.5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][]>([]);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [showWin, setShowWin] = useState(false);
  const [activeMult, setActiveMult] = useState(1);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false, false]);
  
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [showBetMenu, setShowBetMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(audioSystem.isMuted);
  const BET_OPTIONS = [0.5, 1, 5, 10, 20, 50, 100, 200, 500, 1000];
  const handleSpinRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    const initialGrid = Array(COLS).fill(0).map(() => 
      Array(ROWS).fill(0).map(() => CARDS[Math.floor(Math.random() * CARDS.length)].id)
    );
    setGrid(initialGrid);
    
    const attemptPlay = () => {
      if (!audioSystem.isMuted) audioSystem.playBGM();
    };
    
    attemptPlay();
    const handleFirstInteraction = () => {
      attemptPlay();
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);

    return () => {
      audioSystem.stopBGM();
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(audioSystem.toggleMute());
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoSpinning && !isSpinning && !showWin) {
      timer = setTimeout(() => {
        if (handleSpinRef.current) handleSpinRef.current();
      }, isTurbo ? 200 : 800);
    }
    return () => clearTimeout(timer);
  }, [isAutoSpinning, isSpinning, showWin, isTurbo]);

  useEffect(() => {
    handleSpinRef.current = handleSpin;
  });

  const handleSpin = async () => {
    if (isSpinning || !currentUser) return;
    if (currentUser.balance < bet) return alert("Insufficient balance!");

    // Start background music and spin sound
    if (!isMuted) audioSystem.playBGM();
    audioSystem.playSpin(isTurbo);

    updateUserProfile(currentUser.id, { balance: currentUser.balance - bet });
    setIsSpinning(true);
    setWinAmount(0);
    setShowWin(false);
    setActiveMult(1);
    setSpinningCols([true, true, true, true, true]);

    const symbols = CARDS.map(c => c.id);
    const winControl = (siteSettings?.gameWinControls?.super_ace as any) || 'medium';
    const result = await gameApi.spinSlot(bet, COLS, ROWS, symbols, winControl);
    
    const spinDuration = isTurbo ? 100 : 300;
    const staggerTime = isTurbo ? 30 : 100;

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
             if (!isMuted) audioSystem.playWin(result.payout);
             setTimeout(() => setShowWin(false), 3500);
          }
        }
      }, spinDuration + (c * staggerTime));
    }
  };

  const getCardDetails = (id: string) => CARDS.find(c => c.id === id) || CARDS[0];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col w-full h-full overflow-hidden bg-[#03151f] font-sans text-white">
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

        <div className="w-full mt-1.5 bg-gradient-to-b from-[#2a1705] to-[#120902] rounded-full p-1 border-2 border-[#5c3a12] shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex justify-between gap-1 relative overflow-hidden">
           {[1, 2, 3, 5].map(m => {
             const isActive = activeMult === m;
             return (
               <div key={m} className={`flex-1 flex items-center justify-center py-1 rounded-full border-[1.5px] relative transition-all duration-300 ${isActive ? 'bg-gradient-to-b from-[#ffef99] via-[#ffcc00] to-[#d98200] border-[#ffffff] shadow-[0_0_12px_rgba(255,204,0,0.8)] scale-105 z-10' : 'bg-gradient-to-b from-[#4a2d00] to-[#261709] border-[#704f1e] opacity-80'}`}>
                 {isActive && (
                   <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none"></div>
                 )}
                 <span className={`font-black tracking-tighter ${isActive ? 'text-[#4a2d00] text-[18px] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]' : 'text-[#a88232] text-[15px]'}`}>
                   <span className={`${isActive ? 'text-[12px]' : 'text-[10px] mr-[1px]'}`}>x</span>{m}
                 </span>
               </div>
             )
           })}
        </div>
      </div>

      {/* Grid Area - Fills space compactly */}
      <div className="flex-1 min-h-0 relative z-10 flex flex-col items-center justify-center px-1 pb-1">
        {showWin && (
           <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/70 backdrop-blur-sm overflow-hidden animate-[fadeIn_0.3s_ease-out]">
             {/* Coin Shower */}
             <div className="absolute inset-0">
               {Array.from({ length: 50 }).map((_, i) => {
                 const randomX = (Math.random() - 0.5) * 600;
                 const randomDelay = Math.random() * 0.5;
                 const randomDuration = Math.random() * 1.5 + 1.2;
                 const randomScale = Math.random() * 0.6 + 0.4;
                 const randomRotate = Math.random() * 720 + 360;
                 return (
                   <div
                     key={i}
                     style={{
                       animation: `coinFall ${randomDuration}s ease-in ${randomDelay}s forwards`,
                       '--tw-translate-x': `${randomX}px`,
                       '--coin-scale': randomScale,
                       '--coin-rotate': `${randomRotate}deg`,
                       opacity: 0,
                       transform: `translateY(-100px) translateX(${randomX}px) scale(${randomScale}) rotate(0deg)`
                     } as any}
                     className="absolute top-0 left-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-[#ffe680] via-[#ffcc00] to-[#cc7a00] border-2 border-[#ff9900] shadow-[0_0_15px_rgba(255,204,0,0.8)] flex items-center justify-center"
                   >
                     <span className="text-[#995c00] text-[14px] font-black opacity-60">৳</span>
                   </div>
                 )
               })}
             </div>
             
             {/* Epic Win Banner */}
             <div className="relative flex flex-col items-center justify-center animate-[popIn_0.8s_spring_forwards]">
               {/* Glow Behind */}
               <div 
                 className="absolute w-[400%] h-[400%] bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.3)_0%,transparent_50%)] -z-10 animate-[spin_4s_linear_infinite]"
               />
               
               {/* Text Group */}
               <div className="relative animate-[float_2s_ease-in-out_infinite]">
                 <div className="text-center flex flex-col items-center">
                   <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff6cc] via-[#ffcc00] to-[#cc7a00] filter drop-shadow-[0_0_20px_rgba(255,204,0,1)] uppercase italic tracking-tighter" style={{ WebkitTextStroke: '2px #4a2d00' }}>
                     {winAmount >= bet * 50 ? 'MEGA WIN!' : winAmount >= bet * 10 ? 'SUPER WIN!' : 'BIG WIN!'}
                   </h2>
                   
                   <div className="mt-4 bg-gradient-to-b from-black to-[#1a1a1a] px-10 py-3 rounded-full border-[3px] border-[#ffcc00] shadow-[0_0_40px_rgba(255,204,0,0.8)] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-45deg] animate-[sweep_1.5s_linear_infinite]" />
                      <span className="text-4xl md:text-6xl font-black text-[#ffcc00] tracking-widest drop-shadow-[0_3px_3px_rgba(0,0,0,1)] relative z-10 animate-[scaleUp_0.5s_ease-out_0.6s_both]">
                        Tk {winAmount.toFixed(2)}
                      </span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        )}

        <div className="w-full h-full flex-1 bg-[#1b2b36] rounded p-1.5 border-t border-[#3e5361] shadow-xl overflow-hidden flex flex-col">
           <div className="flex-1 min-h-0 flex gap-[3px] bg-[#101b22] p-[3px] rounded-sm">
             {grid.map((col, cIdx) => (
               <div key={cIdx} className="flex-1 flex flex-col gap-[3px] relative overflow-hidden bg-[#c3c8cf] rounded-sm">
                 {col.map((cardId, rIdx) => {
                   const card = getCardDetails(cardId);
                   const isGold = Math.random() > 0.8 && !isSpinning; 
                   
                   return (
                     <div key={rIdx} className={`flex-1 relative flex flex-col items-center justify-center overflow-hidden border border-black/10
                       ${isGold ? 'bg-gradient-to-br from-[#ffef99] via-[#ffcc00] to-[#d98200] border-[#b37700] shadow-inner' : 'bg-gradient-to-b from-white to-[#eaedf2]'}
                       ${spinningCols[cIdx] ? 'opacity-50 blur-[1px] translate-y-full' : 'opacity-100 translate-y-0 transition-transform duration-200'}
                     `}>
                       <div className="flex w-full h-full items-center justify-center pb-1">
                          {card.isFace ? (
                             <span className={`text-[36px] font-black leading-none drop-shadow-md ${isGold ? 'text-[#5a3a00]' : card.color} ${isGold ? 'opacity-95' : 'opacity-100'}`} style={{ WebkitTextStroke: isGold ? '1px rgba(255,255,255,0.3)' : '1px rgba(255,255,255,0.8)' }}>{card.val}</span>
                          ) : (
                             <div className="relative flex items-center justify-center">
                               <span className={`text-[46px] leading-none drop-shadow-md ${isGold ? 'text-[#5a3a00]' : card.color} ${isGold ? 'opacity-95' : 'opacity-100'}`}>{card.suit}</span>
                               <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{card.val}</span>
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
      <div className="shrink-0 relative z-20 bg-gradient-to-t from-[#051117] to-[#0a1b24] border-t-2 border-[#1a2f3a] pb-4 pt-1 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        
        {/* Bet Menu Popup */}
        {showBetMenu && (
          <div className="absolute bottom-24 left-4 z-50 bg-[#0a1820] border border-[#3e5361] rounded-lg p-2 shadow-2xl flex flex-wrap gap-2 w-[180px]">
            {BET_OPTIONS.map(opt => (
              <button 
                key={opt}
                onClick={() => { setBet(opt); setShowBetMenu(false); }}
                className={`flex-1 min-w-[40%] py-1.5 rounded-sm text-xs font-bold ${bet === opt ? 'bg-[#4ade80] text-black' : 'bg-[#1b2b36] text-white/80'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-center -mt-4 mb-4">
           <div className="bg-black/80 border border-[#f5b800]/50 rounded-full px-6 py-0.5 shadow-[0_0_10px_rgba(245,184,0,0.2)]">
             <span className="text-[#f5b800] font-black text-[12px] tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
               WIN Tk {(showWin ? winAmount : 0).toFixed(2)}
             </span>
           </div>
        </div>

        <div className="flex items-center justify-center gap-[96px] sm:gap-[120px] px-3 sm:px-6 mb-2 relative h-12">
           {/* Left Controls */}
           <div className="flex items-center gap-2.5">
             <button className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#1b2b36] to-[#0a1820] border border-[#3e5361] shadow-lg active:scale-95 transition-all text-white/70">
               <Settings className="w-3.5 h-3.5 mb-[1px]" />
               <span className="text-[6px] font-bold leading-none">SET</span>
             </button>
             <button onClick={() => setShowBetMenu(!showBetMenu)} className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#1b2b36] to-[#0a1820] border border-[#3e5361] shadow-lg active:scale-95 transition-all">
               <Coins className="w-3.5 h-3.5 text-[#4ade80] mb-[1px]" />
               <span className="text-[6px] text-white/90 font-bold leading-none">Tk {bet}</span>
             </button>
           </div>

           {/* Central Spin Button */}
           <div className="absolute left-1/2 -translate-x-1/2 -top-2">
             <button 
               onClick={handleSpin}
               disabled={isSpinning && !isAutoSpinning}
               className={`w-16 h-16 rounded-full p-[3px] shadow-[0_5px_15px_rgba(0,0,0,0.8)] active:scale-95 transition-transform ${isSpinning && !isAutoSpinning ? 'brightness-75' : ''}`}
               style={{ background: 'linear-gradient(to bottom, #ffe680, #cc7a00)' }}
             >
                <div className="w-full h-full rounded-full border-[2px] border-[#ffe680] bg-gradient-to-b from-[#ffcc00] to-[#e68a00] flex flex-col items-center justify-center relative shadow-inner">
                   <RotateCcw className={`w-7 h-7 text-white/90 drop-shadow-md stroke-[2.5px] ${isSpinning ? (isTurbo ? 'animate-[spin_0.2s_linear_infinite]' : 'animate-[spin_0.5s_linear_infinite]') : ''}`} />
                   <span className="absolute bottom-2 text-[#4a2d00] font-black text-[8px] tracking-widest drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">SPIN</span>
                </div>
             </button>
           </div>

           {/* Right Controls */}
           <div className="flex items-center gap-2.5">
             <button 
               onClick={() => setIsAutoSpinning(!isAutoSpinning)} 
               className={`flex flex-col items-center justify-center w-8 h-8 rounded-full border shadow-lg active:scale-95 transition-all ${isAutoSpinning ? 'bg-gradient-to-b from-[#3a200a] to-[#2a1205] border-[#f5b800] text-[#f5b800]' : 'bg-gradient-to-b from-[#1b2b36] to-[#0a1820] border-[#3e5361] text-[#ffcc00]'}`}
             >
               <RotateCcw className={`w-3.5 h-3.5 mb-[1px] ${isAutoSpinning ? 'animate-[spin_3s_linear_infinite]' : ''}`} />
               <span className="text-[6px] font-bold leading-none text-white/90">AUTO</span>
             </button>
             <button 
               onClick={() => setIsTurbo(!isTurbo)}
               className={`flex flex-col items-center justify-center w-8 h-8 rounded-full border shadow-lg active:scale-95 transition-all ${isTurbo ? 'bg-gradient-to-b from-[#3a200a] to-[#2a1205] border-[#f5b800] text-[#f5b800]' : 'bg-gradient-to-b from-[#1b2b36] to-[#0a1820] border-[#3e5361] text-[#ffcc00]'}`}
             >
               <Zap className={`w-3.5 h-3.5 fill-current mb-[1px] ${isTurbo ? 'drop-shadow-[0_0_2px_#f5b800]' : ''}`} />
               <span className="text-[6px] font-bold leading-none text-white/90">TURBO</span>
             </button>
           </div>
        </div>

        <div className="flex items-center justify-between px-4 pt-3 border-t border-white/5 mt-2">
           <div className="flex items-center gap-1.5">
             <span className="bg-[#4d5b63] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[2px] shadow-sm">LV 0</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-[#f5b800] text-[11px] font-bold tracking-wide">BAL <span className="text-white">Tk {parseFloat((currentUser?.balance || 0).toString()).toFixed(2)}</span></span>
             <button onClick={toggleMute} className="active:scale-95 transition-transform">
               {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/50" /> : <Volume2 className="w-3.5 h-3.5 text-[#f5b800]" />}
             </button>
             <Wifi className="w-3.5 h-3.5 text-[#4ade80]" />
           </div>
        </div>
      </div>
    </div>
  );
}
