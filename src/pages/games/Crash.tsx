import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Menu, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gameApi } from '../../api/gameApi';

type BetState = {
  amount: string;
  isPlaced: boolean;
  cashedOutAt: number | null;
  winAmount: number | null;
  isAuto: boolean;
};

export default function CrashGame() {
  const { currentUser, updateUserProfile, siteSettings } = useApp();
  
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const gameStateRef = useRef<'waiting' | 'flying' | 'crashed'>('waiting');
  
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const multiplierRef = useRef<number>(1.00);
  
  const [history, setHistory] = useState<number[]>([1.21, 2.31, 3.10, 1.50, 10.28, 1.98, 2.65, 1.96, 1.72, 1.02, 10.97, 1.19, 2.03, 1.27, 1.13, 15.60]);
  const [waitingTimer, setWaitingTimer] = useState<number>(5.0);
  
  const [bet1, setBet1] = useState<BetState>({ amount: '10.00', isPlaced: false, cashedOutAt: null, winAmount: null, isAuto: false });
  const [bet2, setBet2] = useState<BetState>({ amount: '10.00', isPlaced: false, cashedOutAt: null, winAmount: null, isAuto: false });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const multiplierTextRef = useRef<HTMLSpanElement>(null);
  const bet1WinRef = useRef<HTMLSpanElement>(null);
  const bet2WinRef = useRef<HTMLSpanElement>(null);
  const betsRef = useRef({ bet1, bet2 });
  const animationRef = useRef<number>();
  const crashPointRef = useRef<number>(1.00);
  const startTimeRef = useRef<number>(0);
  const prevPosRef = useRef({ x: 10, y: 0 });
  const lastStateUpdateRef = useRef<number>(0);

  useEffect(() => {
    betsRef.current = { bet1, bet2 };
  }, [bet1, bet2]);

  const updateGameState = (newState: 'waiting' | 'flying' | 'crashed') => {
    setGameState(newState);
    gameStateRef.current = newState;
  };

  const setMult = (val: number, isFlightPhase = false) => {
    multiplierRef.current = val;
    if (multiplierTextRef.current) {
      multiplierTextRef.current.innerText = val.toFixed(2) + 'x';
    }
    
    if (isFlightPhase) {
      const b1 = betsRef.current.bet1;
      const b2 = betsRef.current.bet2;
      if (b1.isPlaced && !b1.cashedOutAt && bet1WinRef.current) {
        bet1WinRef.current.innerText = (parseFloat(b1.amount) * val).toFixed(2) + " BDT";
      }
      if (b2.isPlaced && !b2.cashedOutAt && bet2WinRef.current) {
        bet2WinRef.current.innerText = (parseFloat(b2.amount) * val).toFixed(2) + " BDT";
      }
    }
    
    const now = performance.now();
    // Only force full react render every 250ms during flight, or immediately if not flying
    if (!isFlightPhase || now - lastStateUpdateRef.current > 250) {
      setMultiplier(val);
      lastStateUpdateRef.current = now;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
          if (gameStateRef.current === 'waiting') drawCanvas(1.00, false, true);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    startWaitingPhase();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // If user placed a bet during waiting phase and navigates away, refund it
      if (gameStateRef.current === 'waiting') {
        const user = currentUserRef.current;
        const b1 = betsRef.current.bet1;
        const b2 = betsRef.current.bet2;
        let refund = 0;
        if (b1.isPlaced) refund += parseFloat(b1.amount || '0');
        if (b2.isPlaced) refund += parseFloat(b2.amount || '0');
        if (refund > 0 && user) {
          updateUserProfile(user.id, { balance: user.balance + refund });
        }
      }
    };
  }, []);

  const startWaitingPhase = async () => {
    updateGameState('waiting');
    setMult(1.00, false);
    setBet1(prev => ({ ...prev, isPlaced: false, cashedOutAt: null, winAmount: null }));
    setBet2(prev => ({ ...prev, isPlaced: false, cashedOutAt: null, winAmount: null }));
    
    if (planeRef.current && canvasRef.current) {
       const startY = canvasRef.current.height - 10;
       planeRef.current.style.transform = `translate3d(10px, ${startY}px, 0) rotate(0deg)`;
       planeRef.current.style.opacity = '1';
    }
    
    // Ensure canvas dimensions are initialized before drawing
    if (canvasRef.current && canvasRef.current.width === 0) {
      if (canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      }
    }
    drawCanvas(1.00, false, true);

    const winControl = (siteSettings?.gameWinControls?.aviator as any) || 'medium';
    const { crashPoint } = await gameApi.initCrashRound(winControl);
    crashPointRef.current = crashPoint;
    
    let timer = 5.0;
    const interval = setInterval(() => {
      timer -= 0.1;
      setWaitingTimer(Math.max(0, timer));
      if (timer <= 0) {
        clearInterval(interval);
        startFlyingPhase();
      }
    }, 100);
  };

  const startFlyingPhase = () => {
    updateGameState('flying');
    startTimeRef.current = performance.now();
    
    if (canvasRef.current) {
       prevPosRef.current = { x: 10, y: canvasRef.current.height - 10 };
    }
    
    animateFlight();
  };

  const animateFlight = () => {
    const timeNow = performance.now();
    const elapsed = timeNow - startTimeRef.current;
    
    // Slightly speed up multiplier increment (was 15000, now 11000)
    const currentMult = Math.max(1.00, Math.pow(Math.E, elapsed / 11000));
    
    if (currentMult >= crashPointRef.current) {
      setMult(crashPointRef.current, false);
      updateGameState('crashed');
      setHistory(prev => [parseFloat(crashPointRef.current.toFixed(2)), ...prev].slice(0, 20));
      
      setBet1(prev => prev.cashedOutAt ? prev : { ...prev, isPlaced: false });
      setBet2(prev => prev.cashedOutAt ? prev : { ...prev, isPlaced: false });
      
      drawCanvas(crashPointRef.current, true, false);
      
      if (planeRef.current) {
         planeRef.current.style.transition = 'transform 0.5s ease-in, opacity 0.3s ease-in';
         planeRef.current.style.transform = `translate3d(${prevPosRef.current.x + 100}px, ${prevPosRef.current.y - 100}px, 0) rotate(45deg)`;
         planeRef.current.style.opacity = '0';
      }
      
      setTimeout(() => {
         if (planeRef.current) planeRef.current.style.transition = 'none';
         startWaitingPhase();
      }, 3000);
      return;
    }
    
    setMult(currentMult, true);
    drawCanvas(currentMult, false, false);
    animationRef.current = requestAnimationFrame(animateFlight);
  };

  const drawCanvas = (currentMult: number, isCrashed: boolean, isWaiting: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (isWaiting) return;

    const startX = 10;
    const startY = height - 10;
    
    // Slightly faster visual movement across the X axis (was 25000, now 18000)
    const progressX = Math.min(1, (performance.now() - startTimeRef.current) / 18000); 
    const targetX = startX + (width - startX - 20) * progressX; 
    
    const targetY = startY - (startY - 20) * Math.min(1, (currentMult - 1) / 5); 

    const currentX = targetX;
    const currentY = Math.max(20, targetY);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(currentX * 0.5, startY, currentX, currentY);
    ctx.lineTo(currentX, startY);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, currentY, 0, startY);
    gradient.addColorStop(0, 'rgba(229, 11, 20, 0.6)');
    gradient.addColorStop(1, 'rgba(229, 11, 20, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(currentX * 0.5, startY, currentX, currentY);
    ctx.strokeStyle = '#e50b14';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (!isCrashed && planeRef.current) {
        // Calculate a stable angle by looking slightly ahead in time (50ms) to avoid frame-to-frame noise jitter
        const elapsed = performance.now() - startTimeRef.current;
        const lookAheadElapsed = elapsed + 50;
        const lookAheadMult = Math.max(1.00, Math.pow(Math.E, lookAheadElapsed / 11000));
        const lookAheadProgressX = Math.min(1, lookAheadElapsed / 18000);
        
        const nextX = startX + (width - startX - 20) * lookAheadProgressX;
        const nextY = Math.max(20, startY - (startY - 20) * Math.min(1, (lookAheadMult - 1) / 5));
        
        const dx = nextX - currentX;
        const dy = nextY - currentY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (isNaN(angle)) angle = 0;
        
        // Use translate3d to force hardware acceleration and eliminate rendering stutter/vibration
        planeRef.current.style.transform = `translate3d(${currentX - 38}px, ${currentY - 18}px, 0) rotate(${angle}deg)`;
        prevPosRef.current = { x: currentX, y: currentY };
    }
  };

  const handleBetAction = (betNum: 1 | 2) => {
    const betState = betNum === 1 ? bet1 : bet2;
    const setBetState = betNum === 1 ? setBet1 : setBet2;
    const user = currentUserRef.current;
    
    if (gameStateRef.current === 'waiting') {
      if (!betState.isPlaced) {
        const amt = parseFloat(betState.amount);
        if (isNaN(amt) || amt <= 0) return alert('Invalid amount');
        if (!user) return alert('Please log in to place a bet');
        if (user.balance < amt) return alert('Insufficient balance!');
        
        // Deduct bet amount immediately from balance
        updateUserProfile(user.id, { balance: user.balance - amt });
        setBetState(prev => ({ ...prev, isPlaced: true }));
      } else {
        // Cancel bet during waiting phase -> refund balance
        const amt = parseFloat(betState.amount);
        if (user && !isNaN(amt) && amt > 0) {
          updateUserProfile(user.id, { balance: user.balance + amt });
        }
        setBetState(prev => ({ ...prev, isPlaced: false }));
      }
    } else if (gameStateRef.current === 'flying') {
      if (betState.isPlaced && !betState.cashedOutAt) {
        const currentM = multiplierRef.current;
        const amt = parseFloat(betState.amount);
        const win = parseFloat((amt * currentM).toFixed(2));
        setBetState(prev => ({ ...prev, cashedOutAt: currentM, winAmount: win, isPlaced: false }));
        if (user) {
          updateUserProfile(user.id, { balance: user.balance + win });
        }
      }
    }
  };

  const getHistoryColor = (mult: number) => {
    if (mult < 2) return 'text-[#34b4ff]';
    if (mult < 10) return 'text-[#913fe2]';
    return 'text-[#c017b4]';
  };

  const renderBetPanel = (betNum: 1 | 2) => {
    const betState = betNum === 1 ? bet1 : bet2;
    const setBetState = betNum === 1 ? setBet1 : setBet2;
    
    const isPlaying = gameState === 'flying' && betState.isPlaced && !betState.cashedOutAt;
    const isWaiting = gameState === 'waiting' && betState.isPlaced;
    const isCashedOut = betState.cashedOutAt !== null;
    
    let btnColor = "bg-[#28a745] hover:bg-[#218838]";
    let btnText = "BET";
    let btnSubText = betState.amount + " BDT";
    
    if (isWaiting) {
      btnColor = "bg-[#cb011a] hover:bg-[#a10115]";
      btnText = "CANCEL";
      btnSubText = "WAITING";
    } else if (isPlaying) {
      btnColor = "bg-[#ff9900] hover:bg-[#e68a00]";
      btnText = "CASH OUT";
      btnSubText = (parseFloat(betState.amount) * multiplier).toFixed(2) + " BDT";
    }

    return (
      <div className={`bg-[#141516] rounded-xl p-1.5 flex flex-col relative border ${isCashedOut ? 'border-[#28a745]' : isPlaying ? 'border-[#ff9900]' : 'border-white/10'} shadow-inner`}>
        {/* Top Tabs */}
        <div className="flex items-center justify-center mb-1.5 mx-auto bg-[#000000] rounded-full p-[2px] w-full max-w-[120px]">
           <button 
             onClick={() => setBetState(p => ({...p, isAuto: false}))}
             className={`text-[9px] font-bold w-1/2 py-0.5 rounded-full transition-colors ${!betState.isAuto ? 'bg-[#2c2d30] text-white' : 'text-slate-500'}`}>Bet</button>
           <button 
             onClick={() => setBetState(p => ({...p, isAuto: true}))}
             className={`text-[9px] font-bold w-1/2 py-0.5 rounded-full transition-colors ${betState.isAuto ? 'bg-[#2c2d30] text-white' : 'text-slate-500'}`}>Auto</button>
        </div>
        
        {/* Input Section */}
        <div className="flex items-center justify-between bg-black/60 rounded-lg px-1 py-1 mb-1.5 border border-white/5">
           <button onClick={() => setBetState(p => ({...p, amount: Math.max(10, parseFloat(p.amount)-10).toFixed(2)}))} disabled={betState.isPlaced || isCashedOut} className="w-5 h-5 flex items-center justify-center bg-white/5 rounded-full text-white/50 hover:text-white active:scale-95 disabled:opacity-50"><Minus className="w-3 h-3"/></button>
           <input type="number" value={betState.amount} onChange={(e) => setBetState(prev => ({ ...prev, amount: e.target.value }))} disabled={betState.isPlaced || isCashedOut} className="w-full bg-transparent text-white font-bold text-[11px] text-center outline-none px-1" />
           <button onClick={() => setBetState(p => ({...p, amount: (parseFloat(p.amount)+10).toFixed(2)}))} disabled={betState.isPlaced || isCashedOut} className="w-5 h-5 flex items-center justify-center bg-white/5 rounded-full text-white/50 hover:text-white active:scale-95 disabled:opacity-50"><Plus className="w-3 h-3"/></button>
        </div>
        
        {/* Quick Bets */}
        <div className="grid grid-cols-2 gap-1 mb-1.5 h-[36px]">
           {[100, 200, 500, 1000].map(amt => (
               <button key={amt} onClick={() => setBetState(p => ({...p, amount: amt.toFixed(2)}))} disabled={betState.isPlaced || isCashedOut} className="bg-black/30 hover:bg-black/50 rounded-lg text-[10px] font-bold text-slate-400 disabled:opacity-50 border border-white/5 flex items-center justify-center active:scale-95 transition-all">{amt}</button>
           ))}
        </div>
        
        {/* Action Button */}
        <button onClick={() => handleBetAction(betNum)} className={`w-full h-10 ${btnColor} rounded-xl flex flex-col items-center justify-center text-white shadow-[0_3px_0_rgba(0,0,0,0.3)] active:translate-y-[2px] active:shadow-none transition-all`}>
           <span className="text-[13px] font-black uppercase leading-none drop-shadow-sm mb-0.5">{btnText}</span>
           {btnText !== "CANCEL" && <span ref={betNum === 1 ? bet1WinRef : bet2WinRef} className="text-[10px] font-bold drop-shadow-sm leading-none">{btnSubText}</span>}
        </button>
        
        {isCashedOut && (
           <div className="absolute inset-0 bg-[#28a745]/20 rounded-xl pointer-events-none flex items-center justify-center z-10 backdrop-blur-[1px]">
              <div className="bg-[#28a745] text-white font-black px-3 py-1 text-sm rounded-full shadow-[0_4px_10px_rgba(40,167,69,0.5)] border-2 border-white/20 animate-[bounce_0.5s_ease-out]">
                {betState.cashedOutAt?.toFixed(2)}x
              </div>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#000000] font-sans overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 flex items-center justify-between px-2 py-1.5 bg-[#1b1c1d] border-b border-white/5">
        <div className="flex items-center gap-2">
          <Link to="/games" className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white active:scale-95 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1.5 font-sans italic tracking-wider font-black">
            <div className="w-5 h-5 flex items-center justify-center bg-[#e50b14] rounded-sm transform -skew-x-12">
              <svg viewBox="0 0 50 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white drop-shadow-md">
                <path d="M47.5 10.5C49 10.5 50 11.5 50 13C50 14.5 49 15.5 47.5 15.5L30 15.5L15 23.5L10 23.5L18 15.5L5 15.5L0 12L5 10.5L18 10.5L10 2.5L15 2.5L30 10.5L47.5 10.5Z" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-[16px] text-white drop-shadow-[0_2px_0_#e50b14]">AVIATOR</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#28a745] font-black text-xs tracking-wide">{parseFloat((currentUser?.balance || 0).toString()).toFixed(2)} BDT</span>
          <Menu className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* History Bar */}
      <div className="shrink-0 bg-[#1b1c1d] flex items-center gap-2 px-2 py-1.5 overflow-x-auto hide-scrollbar border-b border-white/5">
        {history.map((h, i) => (
          <span key={i} className={`text-[10px] font-bold shrink-0 ${getHistoryColor(h)}`}>
            {h.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Main Game Screen */}
      <div className="flex-1 min-h-0 relative bg-[#101112] border-x border-[#1b1c1d] mx-0.5 mt-0.5 rounded-t shadow-inner overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 100%, #1a2430 0%, #080a0c 100%)' }}>
            <div className="absolute inset-0 opacity-20" style={{
                background: 'repeating-conic-gradient(from 0deg, transparent 0deg 5deg, rgba(255,255,255,0.1) 5deg 10deg)',
                maskImage: 'radial-gradient(circle at 50% 100%, black 10%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle at 50% 100%, black 10%, transparent 80%)'
            }}></div>
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full block" />
        
        <div ref={planeRef} className="absolute top-0 left-0 z-20 pointer-events-none will-change-transform">
           <svg width="75" height="36" viewBox="0 0 50 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_6px_8px_rgba(229,11,20,0.8)]">
             <path d="M47.5 10.5C49 10.5 50 11.5 50 13C50 14.5 49 15.5 47.5 15.5L30 15.5L15 23.5L10 23.5L18 15.5L5 15.5L0 12L5 10.5L18 10.5L10 2.5L15 2.5L30 10.5L47.5 10.5Z" fill="#e50b14"/>
           </svg>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none pb-4">
           {gameState === 'waiting' && (
             <div className="flex flex-col items-center">
                <span className="text-white font-black text-[12px] mb-2 drop-shadow-md tracking-wide">WAITING FOR NEXT ROUND</span>
                <div className="w-32 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
                   <div className="h-full bg-[#e50b14]" style={{ width: `${(waitingTimer/5)*100}%`, transition: 'width 0.1s linear' }}></div>
                </div>
             </div>
           )}
           {gameState === 'crashed' && (
             <span className="text-[#e50b14] font-black text-lg uppercase tracking-widest drop-shadow-lg mb-1">Flew Away!</span>
           )}
           {gameState !== 'waiting' && (
             <span ref={multiplierTextRef} className={`text-[65px] font-black tabular-nums tracking-tighter leading-none ${gameState === 'crashed' ? 'text-[#e50b14] drop-shadow-[0_0_10px_rgba(229,11,20,0.3)]' : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}>
               {multiplier.toFixed(2)}x
             </span>
           )}
        </div>
      </div>

      {/* Bets Area (Side-by-Side Grid) */}
      <div className="shrink-0 bg-[#000000] p-1.5 border-t border-[#1b1c1d] pb-[85px] sm:pb-3">
        <div className="grid grid-cols-2 gap-1.5 w-full max-w-lg mx-auto">
          {renderBetPanel(1)}
          {renderBetPanel(2)}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
