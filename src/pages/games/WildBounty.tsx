import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Volume2, VolumeX, HelpCircle, X, ShieldCheck, 
  Zap, Award, Flame, Users, History, TrendingUp, CheckCircle, RefreshCw,
  Trophy, Crown, Sparkles, AlertTriangle, Coins, Target, Play, RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { gameApi } from '../../api/gameApi';
import { audioSystem } from '../../utils/audioSystem';
import { appEvents, SYNC_EVENTS } from '../../utils/eventEmitter';

// ==========================================
// AUTHENTIC PG SOFT WILD BOUNTY SYMBOL SVGS
// ==========================================

export const OutlawGirlIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="wbFace" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="100%" stopColor="#fba06b" />
      </linearGradient>
      <linearGradient id="wbBandana" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <linearGradient id="wbHat" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#290e03" />
      </linearGradient>
    </defs>
    {/* Outlaw Hat */}
    <ellipse cx="50" cy="32" rx="38" ry="11" fill="url(#wbHat)" stroke="#f59e0b" strokeWidth="1" />
    <path d="M28 32 C30 14, 40 8, 50 9 C60 8, 70 14, 72 32 Z" fill="url(#wbHat)" stroke="#451a03" strokeWidth="1.2" />
    <path d="M29 30 C38 28, 62 28, 71 30" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <circle cx="50" cy="29" r="2" fill="#fef08a" />
    
    {/* Face & Hair */}
    <path d="M34 32 C30 45, 30 65, 36 76 C42 82, 58 82, 64 76 C70 65, 70 45, 66 32 Z" fill="url(#wbFace)" />
    {/* Fierce Eyes */}
    <path d="M38 44 Q44 41 48 45" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M62 44 Q56 41 52 45" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
    <ellipse cx="43" cy="46" rx="2" ry="1.5" fill="#1e1b4b" />
    <ellipse cx="57" cy="46" rx="2" ry="1.5" fill="#1e1b4b" />
    {/* Red Outlaw Mask / Bandana */}
    <path d="M34 52 Q50 48 66 52 L62 76 Q50 85 38 76 Z" fill="url(#wbBandana)" stroke="#7f1d1d" strokeWidth="1" />
    <path d="M42 58 L58 58 M46 66 L54 66" stroke="#fca5a5" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />
  </svg>
);

export const GoldBarsIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="wbGoldBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <linearGradient id="wbGoldTop" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fde047" />
      </linearGradient>
    </defs>
    {/* Bottom Bar */}
    <polygon points="20,68 35,52 80,52 65,68" fill="url(#wbGoldTop)" />
    <polygon points="20,68 65,68 65,82 20,82" fill="url(#wbGoldBody)" stroke="#713f12" strokeWidth="1" />
    <polygon points="65,68 80,52 80,66 65,82" fill="#a16207" stroke="#713f12" strokeWidth="1" />
    
    {/* Top Bar */}
    <polygon points="12,48 27,32 72,32 57,48" fill="url(#wbGoldTop)" />
    <polygon points="12,48 57,48 57,62 12,62" fill="url(#wbGoldBody)" stroke="#713f12" strokeWidth="1" />
    <polygon points="57,48 72,32 72,46 57,62" fill="#a16207" stroke="#713f12" strokeWidth="1" />
    <text x="34" y="56" fill="#713f12" fontSize="7" fontWeight="900" fontFamily="sans-serif">999.9</text>
  </svg>
);

export const BourbonIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="wbBourbon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="60%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
      <linearGradient id="wbGlass" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* Cork & Neck */}
    <rect x="44" y="10" width="12" height="6" rx="1" fill="#78350f" />
    <path d="M42 16 L58 16 L58 32 L68 42 L68 85 L32 85 L32 42 L42 32 Z" fill="url(#wbBourbon)" stroke="#290e03" strokeWidth="1.5" />
    <path d="M34 44 L34 83 L46 83 L46 44 Z" fill="url(#wbGlass)" />
    {/* Label */}
    <rect x="36" y="50" width="28" height="24" rx="2" fill="#fef3c7" stroke="#92400e" strokeWidth="1" />
    <text x="50" y="60" fill="#78350f" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="serif">XXX</text>
    <text x="50" y="68" fill="#b45309" fontSize="5" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">WHISKEY</text>
  </svg>
);

export const HatIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="wbHatOnly" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="50%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>
    </defs>
    <ellipse cx="50" cy="62" rx="42" ry="14" fill="url(#wbHatOnly)" stroke="#290e03" strokeWidth="1.5" />
    <path d="M26 60 C28 32, 40 22, 50 24 C60 22, 72 32, 74 60 Z" fill="url(#wbHatOnly)" stroke="#290e03" strokeWidth="1.5" />
    <path d="M27 58 C38 54, 62 54, 73 58" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="56" r="3" fill="#fef08a" stroke="#78350f" strokeWidth="0.8" />
  </svg>
);

export const WildBadgeIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <radialGradient id="wbWildGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="60%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="44" fill="url(#wbWildGlow)" stroke="#451a03" strokeWidth="2" />
    {/* Crossed Guns */}
    <g transform="translate(18, 30) rotate(-25) scale(0.6)">
      <rect x="0" y="4" width="36" height="8" rx="2" fill="#334155" />
      <rect x="2" y="10" width="10" height="18" rx="2" fill="#78350f" />
    </g>
    <g transform="translate(82, 30) rotate(25) scale(-0.6, 0.6)">
      <rect x="0" y="4" width="36" height="8" rx="2" fill="#334155" />
      <rect x="2" y="10" width="10" height="18" rx="2" fill="#78350f" />
    </g>
    <rect x="10" y="38" width="80" height="24" rx="4" fill="#dc2626" stroke="#fef08a" strokeWidth="1.5" />
    <text x="50" y="55" fill="#fef08a" fontSize="15" fontWeight="900" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">
      WILD
    </text>
  </svg>
);

export const ScatterBadgeIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <radialGradient id="wbScatterGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff8db" />
        <stop offset="60%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#854d0e" />
      </radialGradient>
    </defs>
    {/* 6-Point Sheriff Star */}
    <polygon 
      points="50,6 59,26 80,18 73,38 94,48 76,60 84,80 62,74 50,94 38,74 16,80 24,60 6,48 27,38 20,18 41,26" 
      fill="url(#wbScatterGrad)" 
      stroke="#713f12" 
      strokeWidth="2" 
    />
    <circle cx="50" cy="50" r="18" fill="#78350f" stroke="#fef08a" strokeWidth="1.5" />
    <text x="50" y="47" fill="#fef08a" fontSize="6" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">FREE</text>
    <text x="50" y="56" fill="#fde047" fontSize="7" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SPINS</text>
  </svg>
);

export const PokerCardLetter = ({ char, color }: { char: string; color: string }) => (
  <div className="flex items-center justify-center w-full h-full font-black text-lg sm:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ color }}>
    {char}
  </div>
);

// Map symbol ID to Renderer
const renderSymbolGraphic = (symId: string) => {
  switch (symId) {
    case 'OUTLAW':  return <OutlawGirlIcon className="w-8 h-8 sm:w-10 sm:h-10" />;
    case 'GOLD':    return <GoldBarsIcon className="w-8 h-8 sm:w-10 sm:h-10" />;
    case 'WHISKEY': return <BourbonIcon className="w-8 h-8 sm:w-10 sm:h-10" />;
    case 'HAT':     return <HatIcon className="w-8 h-8 sm:w-10 sm:h-10" />;
    case 'WILD':    return <WildBadgeIcon className="w-8 h-8 sm:w-10 sm:h-10" />;
    case 'SCATTER': return <ScatterBadgeIcon className="w-8 h-8 sm:w-10 sm:h-10" />;
    case 'A':       return <PokerCardLetter char="A" color="#f59e0b" />;
    case 'K':       return <PokerCardLetter char="K" color="#ef4444" />;
    case 'Q':       return <PokerCardLetter char="Q" color="#38bdf8" />;
    case 'J':       return <PokerCardLetter char="J" color="#a855f7" />;
    default:        return <span className="text-white text-xs font-bold">{symId}</span>;
  }
};

const ROW_COUNTS = [3, 4, 5, 5, 4, 3];
const MULTIPLIER_TRACK = [1, 2, 4, 8, 16, 32, 64, 1024];
const BET_TIERS = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];

// Custom Hook to manage memory cleanup, clear active intervals, and reset audio on unmount
interface UseWildBountyCleanupOptions {
  isMountedRef: React.MutableRefObject<boolean>;
  spinTimeoutsRef: React.MutableRefObject<any[]>;
  autoSpinIntervalRef: React.MutableRefObject<any>;
  isSpinningRef: React.MutableRefObject<boolean>;
  setIsSpinning: React.Dispatch<React.SetStateAction<boolean>>;
}

function useCleanup({
  isMountedRef,
  spinTimeoutsRef,
  autoSpinIntervalRef,
  isSpinningRef,
  setIsSpinning,
}: UseWildBountyCleanupOptions) {
  const performCleanup = useCallback(() => {
    isMountedRef.current = false;
    isSpinningRef.current = false;
    setIsSpinning(false);

    // Clear all pending timeouts
    if (spinTimeoutsRef.current) {
      spinTimeoutsRef.current.forEach(t => clearTimeout(t));
      spinTimeoutsRef.current = [];
    }

    if (autoSpinIntervalRef.current) {
      clearInterval(autoSpinIntervalRef.current);
      autoSpinIntervalRef.current = null;
    }

    // Stop all Web Audio synthesis & oscillators
    audioSystem.stopAllSounds();
  }, [isMountedRef, isSpinningRef, setIsSpinning, spinTimeoutsRef, autoSpinIntervalRef]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      performCleanup();
    };
  }, [performCleanup, isMountedRef]);

  return { performCleanup };
}

export default function WildBounty() {
  const navigate = useNavigate();
  const { currentUser, siteSettings, updateUserProfile } = useApp();
  const { formatCurrency } = useCurrency();

  const [bet, setBet] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const isSpinningRef = useRef(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState(0);
  const [isMuted, setIsMuted] = useState(audioSystem.isMuted);

  // Multiplier State
  const [activeMultiplier, setActiveMultiplier] = useState(1);
  const [highlightMultiplier, setHighlightMultiplier] = useState(1);

  // Free Spins State
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [isFreeSpinsActive, setIsFreeSpinsActive] = useState(false);
  const [showFreeSpinsModal, setShowFreeSpinsModal] = useState(false);
  const [freeSpinsTotalWin, setFreeSpinsTotalWin] = useState(0);

  // Reel Grid Matrix (3-4-5-5-4-3)
  const [grid, setGrid] = useState<{ symbol: string; isGold: boolean; isWild: boolean }[][]>(() => {
    const REGULAR = ['OUTLAW', 'GOLD', 'WHISKEY', 'HAT', 'A', 'K', 'Q', 'J'];
    return ROW_COUNTS.map((rowCount, c) => 
      Array(rowCount).fill(null).map(() => ({
        symbol: REGULAR[Math.floor(Math.random() * REGULAR.length)],
        isGold: c >= 1 && c <= 4 && Math.random() < 0.15,
        isWild: false
      }))
    );
  });

  const [winningTiles, setWinningTiles] = useState<Set<string>>(new Set());
  const [explodingTiles, setExplodingTiles] = useState<Set<string>>(new Set());
  const [roundWin, setRoundWin] = useState<number>(0);
  const [showWinBanner, setShowWinBanner] = useState(false);
  const [bigWinType, setBigWinType] = useState<string>('');

  // Modals & Drawers
  const [showPaytable, setShowPaytable] = useState(false);
  const [showFairness, setShowFairness] = useState(false);
  const [showBetDrawer, setShowBetDrawer] = useState(false);

  // Live Sync & Admin Win Controls
  const [liveWinControl, setLiveWinControl] = useState<string>(
    siteSettings?.gameWinControls?.['wild_bounty'] || 'medium'
  );
  const winControlRef = useRef<string>(
    siteSettings?.gameWinControls?.['wild_bounty'] || 'medium'
  );
  const [isGameActive, setIsGameActive] = useState<boolean>(
    siteSettings?.gameStates && siteSettings.gameStates['wild_bounty'] !== undefined
      ? !!siteSettings.gameStates['wild_bounty']
      : true
  );
  const isGameActiveRef = useRef<boolean>(
    siteSettings?.gameStates && siteSettings.gameStates['wild_bounty'] !== undefined
      ? !!siteSettings.gameStates['wild_bounty']
      : true
  );

  // Lifecycle Refs
  const isMountedRef = useRef(true);
  const spinTimeoutsRef = useRef<any[]>([]);
  const autoSpinIntervalRef = useRef<any>(null);
  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // Sync with AppContext / PostgreSQL
  useEffect(() => {
    if (siteSettings?.gameWinControls?.['wild_bounty']) {
      const newWin = siteSettings.gameWinControls['wild_bounty'];
      setLiveWinControl(newWin);
      winControlRef.current = newWin;
    }
    if (siteSettings?.gameStates && siteSettings.gameStates['wild_bounty'] !== undefined) {
      const active = !!siteSettings.gameStates['wild_bounty'];
      setIsGameActive(active);
      isGameActiveRef.current = active;
    }
  }, [siteSettings]);

  // Real-time multi-tab and live sync listeners
  useEffect(() => {
    const handleSync = (data: any) => {
      if (data?.key === 'siteSettings' && data?.value) {
        const val = data.value;
        if (val.gameWinControls?.['wild_bounty']) {
          const newWin = val.gameWinControls['wild_bounty'];
          setLiveWinControl(newWin);
          winControlRef.current = newWin;
        }
        if (val.gameStates && val.gameStates['wild_bounty'] !== undefined) {
          const active = !!val.gameStates['wild_bounty'];
          setIsGameActive(active);
          isGameActiveRef.current = active;
        }
      }
    };

    const unsub = appEvents.on(SYNC_EVENTS.SETTINGS_UPDATED, handleSync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mipall_settings_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleSync(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('app:settings-updated', (e: any) => {
      if (e.detail) handleSync(e.detail);
    });

    return () => {
      unsub();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Cleanup Hook for Game loops, intervals, and audio
  useCleanup({
    isMountedRef,
    spinTimeoutsRef,
    autoSpinIntervalRef,
    isSpinningRef,
    setIsSpinning,
  });

  const toggleMute = () => {
    setIsMuted(audioSystem.toggleMute());
  };

  // Provably Fair Seeds
  const [fairnessData, setFairnessData] = useState({
    serverSeed: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    clientSeed: 'mipall_bounty_live_seed_2026',
    nonce: 104,
    hash: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3'
  });

  // Simulated Community Activity
  const [recentWins, setRecentWins] = useState<Array<{ user: string; amount: number; mult: number; time: string }>>([
    { user: 'BountyHunter99', amount: 1240.50, mult: 64, time: '12s ago' },
    { user: 'CowboyAce', amount: 480.00, mult: 16, time: '28s ago' },
    { user: 'Sheriff_BD', amount: 3200.00, mult: 128, time: '1m ago' },
    { user: 'SaloonQueen', amount: 156.00, mult: 8, time: '2m ago' },
  ]);

  // Main Spin & Cascade Handler
  const handleSpin = async () => {
    if (isSpinningRef.current || !currentUserRef.current || !isGameActiveRef.current) return;
    const user = currentUserRef.current;

    // Check Balance (Free spins do not deduct balance)
    if (!isFreeSpinsActive) {
      if (user.balance < bet) {
        alert("Insufficient balance to place bet!");
        setIsAutoSpin(false);
        return;
      }
      // Instant Balance Deduction
      updateUserProfile(user.id, {
        balance: +(user.balance - bet).toFixed(2),
      });
    }

    isSpinningRef.current = true;
    setIsSpinning(true);
    setWinningTiles(new Set());
    setExplodingTiles(new Set());
    setShowWinBanner(false);
    setRoundWin(0);

    const initialMultiplier = isFreeSpinsActive ? 8 : 1;
    setActiveMultiplier(initialMultiplier);
    setHighlightMultiplier(initialMultiplier);

    audioSystem.playWildBountyRevolverSpin();

    // Call Slot Server Simulation
    const winControl = (winControlRef.current as any) || 'medium';
    const result = await gameApi.spinWildBounty(bet, winControl, isFreeSpinsActive);

    // Update Provably Fair nonce
    setFairnessData(prev => ({
      ...prev,
      nonce: prev.nonce + 1,
      hash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
    }));

    // Step 1: Reveal Initial Reel Grid
    setGrid(result.initialGrid);

    // Play Scatter Chime if any
    if (result.scatterCount > 0) {
      setTimeout(() => {
        audioSystem.playWildBountyScatter();
      }, 300);
    }

    // Step 2: Handle Cascades sequentially
    let cumulativeWin = 0;
    const cascadeDelays = isTurbo ? 350 : 700;

    if (result.cascades.length > 0) {
      result.cascades.forEach((cascadeStep, idx) => {
        const timeoutId = setTimeout(() => {
          if (!isMountedRef.current) return;

          // Highlight winning positions
          const winSet = new Set<string>();
          cascadeStep.winningPositions.forEach(p => winSet.add(`${p.col},${p.row}`));
          setWinningTiles(winSet);
          setActiveMultiplier(cascadeStep.multiplier);
          setHighlightMultiplier(cascadeStep.multiplier);

          audioSystem.playWildBountyGunshot();
          audioSystem.playWildBountyMultiplierLevelUp(cascadeStep.multiplier);

          cumulativeWin += cascadeStep.stepWin;
          setRoundWin(+(cumulativeWin).toFixed(2));

          // Trigger Explosion & Next Grid Cascade
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setExplodingTiles(new Set(winSet));
            audioSystem.playWildBountyCascade();

            setTimeout(() => {
              if (!isMountedRef.current) return;
              setExplodingTiles(new Set());
              setWinningTiles(new Set());
              setGrid(cascadeStep.grid);
            }, isTurbo ? 150 : 250);
          }, isTurbo ? 180 : 350);

        }, (idx + 1) * cascadeDelays);

        spinTimeoutsRef.current.push(timeoutId);
      });
    }

    // Step 3: Finalize Round
    const totalSpinDuration = Math.max(600, (result.cascades.length + 1) * cascadeDelays + 300);
    const finishTimeout = setTimeout(() => {
      if (!isMountedRef.current) return;

      isSpinningRef.current = false;
      setIsSpinning(false);

      if (result.isWin && result.totalWin > 0) {
        // Credit Win to User
        const freshUser = currentUserRef.current;
        if (freshUser) {
          updateUserProfile(freshUser.id, {
            balance: +(freshUser.balance + result.totalWin).toFixed(2),
          });
        }

        setShowWinBanner(true);
        const winRatio = result.totalWin / bet;
        if (winRatio >= 50) setBigWinType('MEGA BOUNTY');
        else if (winRatio >= 20) setBigWinType('SUPER BOUNTY');
        else if (winRatio >= 5) setBigWinType('BIG WIN');
        else setBigWinType('WIN');

        // Add to recent feed
        setRecentWins(prev => [
          { user: currentUserRef.current?.name || 'You', amount: result.totalWin, mult: result.finalMultiplier, time: 'Just now' },
          ...prev.slice(0, 4)
        ]);

        if (isFreeSpinsActive) {
          setFreeSpinsTotalWin(prev => +(prev + result.totalWin).toFixed(2));
        }
      }

      // Check Free Spins Trigger
      if (result.isFreeSpinsTriggered && !isFreeSpinsActive) {
        setShowFreeSpinsModal(true);
        audioSystem.playWildBountyScatter();
        setFreeSpinsLeft(10);
      } else if (isFreeSpinsActive) {
        if (freeSpinsLeft > 1) {
          setFreeSpinsLeft(prev => prev - 1);
        } else {
          // Free Spins Complete
          setIsFreeSpinsActive(false);
          setFreeSpinsLeft(0);
        }
      }

      // Handle Auto Spin decrement
      if (isAutoSpin && autoSpinsLeft > 1) {
        setAutoSpinsLeft(prev => prev - 1);
      } else if (isAutoSpin && autoSpinsLeft <= 1) {
        setIsAutoSpin(false);
        setAutoSpinsLeft(0);
      }

    }, totalSpinDuration);

    spinTimeoutsRef.current.push(finishTimeout);
  };

  // Auto-Spin Trigger
  useEffect(() => {
    if (isAutoSpin && autoSpinsLeft > 0 && !isSpinning && isGameActive) {
      const timer = setTimeout(() => {
        handleSpin();
      }, isTurbo ? 250 : 800);
      return () => clearTimeout(timer);
    }
  }, [isAutoSpin, autoSpinsLeft, isSpinning, isTurbo, isGameActive]);

  const startFreeSpins = () => {
    setShowFreeSpinsModal(false);
    setIsFreeSpinsActive(true);
    setFreeSpinsTotalWin(0);
    setActiveMultiplier(8);
    setHighlightMultiplier(8);
    setTimeout(() => {
      handleSpin();
    }, 400);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#140a05] font-sans text-slate-100 select-none pb-8">
      {/* Top Header Navigation (Ultra-Compact) */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#1a0c05] border-b border-amber-900/30 sticky top-0 z-30 shadow-sm h-10">
        <div className="flex items-center gap-1.5">
          <Link 
            to="/games" 
            className="p-1 rounded bg-[#241107] hover:bg-[#3d1c0a] text-amber-400 transition-colors border border-amber-900/40 flex items-center justify-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1 leading-none">
              <span className="font-black text-[10px] text-amber-300 uppercase tracking-wider">
                WILD BOUNTY
              </span>
              <span className="text-[7px] bg-amber-500/20 text-amber-400 font-black px-1 py-0.5 rounded border border-amber-500/20 leading-none">
                PG
              </span>
            </div>
            <span className="text-[7px] text-amber-500/60 font-bold uppercase tracking-widest mt-0.5">
              3,600 WAYS
            </span>
          </div>
        </div>

        {/* Center: Live Real Balance */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-[#120703] border border-amber-900/50 px-2 py-0.5 rounded shadow-inner">
            <Coins className="w-3 h-3 text-amber-500" />
            <span className="font-black text-[11px] text-white tracking-tight">
              {formatCurrency(currentUser?.balance || 0).replace('৳', '৳ ')}
            </span>
          </div>

          <div 
            title={`Real-time Engine Sync Active • Mode: ${liveWinControl.toUpperCase()}`}
            className="hidden sm:flex items-center justify-center w-5 h-5 bg-[#120703] border border-amber-900/30 rounded"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_#10b981]" />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFairness(true)}
            className="w-6 h-6 flex items-center justify-center rounded bg-[#241107] text-amber-500 hover:text-amber-300 border border-amber-900/40"
            title="Provably Fair"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowPaytable(true)}
            className="w-6 h-6 flex items-center justify-center rounded bg-[#241107] text-amber-500 hover:text-amber-300 border border-amber-900/40"
            title="Paytable Rules"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleMute}
            className="w-6 h-6 flex items-center justify-center rounded bg-[#241107] text-amber-500 hover:text-amber-300 border border-amber-900/40"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Game Stage Container */}
      <div className="max-w-xl mx-auto w-full px-2 pt-2 flex-1 flex flex-col gap-2">
        
        {/* BOUNTY BULLET MULTIPLIER TRACK (1x -> 1024x) */}
        <div className="bg-[#1a0c05] border border-amber-900/30 rounded-xl p-1.5 flex items-center gap-2 shadow-sm max-w-lg mx-auto w-full">
          <div className="flex flex-col items-center justify-center bg-[#120703] border border-amber-900/40 rounded-lg px-2 py-1 shrink-0 min-w-[50px]">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500 mb-0.5" />
            <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest leading-none">
              {isFreeSpinsActive ? `SPINS: ${freeSpinsLeft}` : 'MULT'}
            </span>
          </div>

          <div className="flex-1 flex items-center gap-0.5">
            {MULTIPLIER_TRACK.map((mult) => {
              const isActive = activeMultiplier >= mult;
              const isCurrent = activeMultiplier === mult;
              return (
                <div
                  key={mult}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.5)] border border-yellow-200 text-black font-black z-10 scale-105'
                      : isActive
                      ? 'bg-[#2a1308] border border-amber-800/60 text-amber-200 font-bold'
                      : 'bg-[#120703] border border-transparent text-stone-600 font-medium'
                  }`}
                >
                  <span className="text-[9px] leading-none">
                    {mult}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6-REEL CASCADE GRID CONTAINER (3,600 WAYS) */}
        <div className="relative bg-[#1d0e06] border-2 border-amber-700/60 rounded-2xl p-2 shadow-[0_8px_24px_rgba(0,0,0,0.8)] flex-1 flex flex-col justify-center min-h-[340px]">
          
          {/* Desert Sunburst Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.08)_0%,transparent_75%)] pointer-events-none rounded-2xl" />

          {/* Reel Grid Columns */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 relative z-10 items-center justify-center">
            {grid.map((column, colIdx) => (
              <div 
                key={colIdx} 
                className="flex flex-col gap-1.5 bg-[#120703]/80 rounded-xl p-1 border border-amber-950/80 shadow-inner"
              >
                {column.map((cell, rowIdx) => {
                  const tileKey = `${colIdx},${rowIdx}`;
                  const isWinning = winningTiles.has(tileKey);
                  const isExploding = explodingTiles.has(tileKey);

                  return (
                    <div
                      key={rowIdx}
                      className={`relative aspect-square rounded-lg flex items-center justify-center p-1 transition-all duration-200 select-none ${
                        cell.isGold
                          ? 'bg-gradient-to-br from-amber-400/20 to-yellow-600/30 border-2 border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                          : 'bg-[#291307] border border-amber-900/40'
                      } ${
                        isWinning
                          ? 'ring-2 ring-yellow-300 ring-offset-1 ring-offset-black scale-105 z-20 animate-pulse'
                          : ''
                      } ${
                        isExploding
                          ? 'opacity-0 scale-50 rotate-12 transition-all duration-200'
                          : 'opacity-100'
                      }`}
                    >
                      {/* Gold Frame Badge Indicator */}
                      {cell.isGold && (
                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_4px_#fde047]" />
                      )}

                      {/* Render SVG Graphic */}
                      {renderSymbolGraphic(cell.symbol)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Live Win Banner Overlay */}
          {showWinBanner && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center z-30 rounded-2xl animate-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-b from-amber-500 to-yellow-700 p-0.5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                <div className="bg-[#1c0c04] px-6 py-4 rounded-[14px] flex flex-col items-center text-center">
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest animate-pulse">
                    {bigWinType}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)] my-1">
                    +{formatCurrency(roundWin)}
                  </span>
                  <span className="text-[9px] text-amber-200/80 font-bold">
                    Multiplier: {activeMultiplier}x
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM BET & SPIN CONTROLS (ULTRA-COMPACT) */}
        <div className="bg-[#1a0c05] border border-amber-900/30 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] mt-auto max-w-lg mx-auto w-full">
          
          {/* Turbo & Auto Column */}
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setIsTurbo(!isTurbo)}
              className={`w-10 h-10 flex flex-col items-center justify-center rounded-xl border transition-all ${
                isTurbo 
                  ? 'bg-amber-500 text-black border-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                  : 'bg-[#120703] text-stone-400 border-amber-900/40 hover:bg-[#1f0e06]'
              }`}
            >
              <Zap className={`w-4 h-4 ${isTurbo ? 'fill-black' : ''}`} />
              <span className="text-[7px] font-black tracking-widest mt-0.5">TURBO</span>
            </button>

            <button
              onClick={() => {
                if (isAutoSpin) {
                  setIsAutoSpin(false);
                  setAutoSpinsLeft(0);
                } else {
                  setIsAutoSpin(true);
                  setAutoSpinsLeft(20);
                }
              }}
              className={`w-10 h-10 flex flex-col items-center justify-center rounded-xl border transition-all ${
                isAutoSpin 
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                  : 'bg-[#120703] text-stone-400 border-amber-900/40 hover:bg-[#1f0e06]'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${isAutoSpin ? 'animate-spin-slow' : ''}`} />
              <span className="text-[7px] font-black tracking-widest mt-0.5">{isAutoSpin ? autoSpinsLeft : 'AUTO'}</span>
            </button>
          </div>

          {/* Primary Spin Button (Center & Oversized) */}
          <div className="flex-shrink-0 relative mx-auto">
            <div className={`absolute inset-0 rounded-full blur-md ${isSpinning ? 'bg-transparent' : 'bg-amber-500/40 animate-pulse'}`} />
            <button
              onClick={handleSpin}
              disabled={isSpinning || !isGameActive}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all select-none border-[3px] ${
                isSpinning
                  ? 'bg-[#1a1a1a] border-[#333] text-stone-500 cursor-not-allowed'
                  : !isGameActive
                  ? 'bg-red-950 border-red-800 text-red-500 cursor-not-allowed'
                  : 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 border-yellow-200 text-black hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
              }`}
            >
              {isSpinning ? (
                <RotateCcw className="w-6 h-6 animate-spin opacity-50" />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-white/10 rounded-full">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
              )}
            </button>
          </div>

          {/* Bet Controls (- / Amount / +) */}
          <div className="flex bg-[#120703] border border-amber-900/40 rounded-xl p-1 shadow-inner h-10 items-center shrink-0">
            <button 
              onClick={() => {
                const idx = BET_TIERS.indexOf(bet);
                if (idx > 0) setBet(BET_TIERS[idx - 1]);
              }}
              disabled={isSpinning || BET_TIERS.indexOf(bet) === 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#241107] hover:bg-[#3d1c0a] text-amber-400 disabled:opacity-30 transition-colors"
            >
              <span className="text-lg font-black leading-none mb-0.5">-</span>
            </button>
            
            <div 
              onClick={() => !isSpinning && setShowBetDrawer(true)}
              className="px-2 flex flex-col items-center justify-center cursor-pointer min-w-[48px]"
            >
              <span className="text-[8px] text-amber-500/80 font-black uppercase tracking-widest leading-none mb-0.5">BET</span>
              <span className="text-xs font-black text-white leading-none tracking-tight">{formatCurrency(bet).replace('৳', '')}</span>
            </div>

            <button 
              onClick={() => {
                const idx = BET_TIERS.indexOf(bet);
                if (idx < BET_TIERS.length - 1) setBet(BET_TIERS[idx + 1]);
              }}
              disabled={isSpinning || BET_TIERS.indexOf(bet) === BET_TIERS.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#241107] hover:bg-[#3d1c0a] text-amber-400 disabled:opacity-30 transition-colors"
            >
              <span className="text-lg font-black leading-none mb-0.5">+</span>
            </button>
          </div>
        </div>

        {/* RECENT COMMUNITY BOUNTY WINS FEED */}
        <div className="bg-[#1a0c05] border border-amber-900/30 rounded-xl p-2 flex flex-col gap-1.5 shadow-sm max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between px-1 border-b border-amber-900/20 pb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-amber-500/10 rounded flex items-center justify-center">
                <Trophy className="w-2.5 h-2.5 text-amber-500" />
              </div>
              <span className="text-[8px] font-black text-amber-500/90 uppercase tracking-widest mt-0.5">
                LIVE BOUNTY HUNTERS
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_#10b981]" />
              <span className="text-[7px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">REAL-TIME</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {recentWins.map((win, i) => (
              <div key={i} className="bg-[#120703] border border-amber-900/20 rounded-lg p-1.5 flex flex-col gap-1 hover:border-amber-700/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-stone-300 truncate pr-1">{win.user}</span>
                  <span className="text-[7px] font-black text-black bg-gradient-to-br from-amber-400 to-amber-600 px-1 py-0.5 rounded leading-none">{win.mult}x</span>
                </div>
                <span className="text-[9px] font-black text-emerald-400 leading-none">
                  +{formatCurrency(win.amount).replace('৳', '৳ ')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BET DRAWER MODAL */}
      {showBetDrawer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-3">
          <div className="bg-[#200f07] border border-amber-700/60 rounded-2xl w-full max-w-sm p-4 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-amber-200 uppercase">SELECT BET AMOUNT</span>
              <button onClick={() => setShowBetDrawer(false)} className="p-1 text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
              {BET_TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    setBet(tier);
                    setShowBetDrawer(false);
                  }}
                  className={`py-2 rounded-lg font-black text-xs border transition-all ${
                    bet === tier
                      ? 'bg-amber-500 text-black border-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                      : 'bg-[#140a05] text-amber-200 border-amber-900/40 hover:bg-[#2b1409]'
                  }`}
                >
                  {formatCurrency(tier)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FREE SPINS INTRO MODAL */}
      {showFreeSpinsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#3a1808] to-[#1a0903] border-2 border-yellow-400 rounded-2xl max-w-sm w-full p-5 flex flex-col items-center text-center shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-in zoom-in-95">
            <ScatterBadgeIcon className="w-16 h-16 animate-bounce mb-2" />
            <span className="text-xl font-black text-yellow-300 tracking-wide uppercase drop-shadow-md">
              10 FREE SPINS WON!
            </span>
            <span className="text-xs text-amber-200 font-bold my-2">
              Free Spins Feature Activated! Starting Multiplier is boosted to <strong className="text-yellow-400">8x</strong> and doubles on every cascade up to <strong className="text-yellow-400">1024x</strong>!
            </span>
            <button
              onClick={startFreeSpins}
              className="mt-3 w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 active:scale-95 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-lg"
            >
              START FREE SHOWDOWN
            </button>
          </div>
        </div>
      )}

      {/* PAYTABLE MODAL */}
      {showPaytable && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-3">
          <div className="bg-[#1f0e06] border border-amber-700/60 rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
              <span className="text-sm font-black text-amber-200 uppercase">WILD BOUNTY PAYTABLE</span>
              <button onClick={() => setShowPaytable(false)} className="p-1 text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs text-stone-300 leading-relaxed">
              <p>
                <strong className="text-amber-300">3,600 Ways to Win:</strong> Wins pay from leftmost reel to adjacent right reels. Winning symbols explode and cascade down.
              </p>
              <p>
                <strong className="text-amber-300">Gold Framed Symbols:</strong> Symbols with golden borders transform into <strong className="text-yellow-400">WILD</strong> on subsequent cascade steps!
              </p>
              <p>
                <strong className="text-amber-300">Bounty Multiplier:</strong> Consecutive cascades double the round multiplier: 1x, 2x, 4x, 8x, 16x, 32x, 64x, up to <strong>1024x</strong>!
              </p>
              <p>
                <strong className="text-amber-300">Free Spins:</strong> 3 or more Sheriff Star Scatters trigger 10 Free Spins with a starting multiplier of <strong>8x</strong>!
              </p>
            </div>

            <button
              onClick={() => setShowPaytable(false)}
              className="mt-2 py-2 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs rounded-xl"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* PROVABLY FAIR MODAL */}
      {showFairness && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-3">
          <div className="bg-[#1f0e06] border border-amber-700/60 rounded-2xl max-w-md w-full p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-black text-amber-200 uppercase">PROVABLY FAIR VERIFICATION</span>
              </div>
              <button onClick={() => setShowFairness(false)} className="p-1 text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-[11px] text-stone-300 font-mono">
              <div>
                <span className="text-stone-400 font-bold block">SERVER SEED (SHA-256):</span>
                <span className="text-amber-300 break-all bg-black/40 p-1.5 rounded block text-[10px]">
                  {fairnessData.serverSeed}
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-bold block">CLIENT SEED:</span>
                <span className="text-amber-300 break-all bg-black/40 p-1.5 rounded block text-[10px]">
                  {fairnessData.clientSeed}
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-bold block">ROUND NONCE:</span>
                <span className="text-emerald-400 font-bold">{fairnessData.nonce}</span>
              </div>
            </div>

            <button
              onClick={() => setShowFairness(false)}
              className="mt-2 py-2 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs rounded-xl"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
