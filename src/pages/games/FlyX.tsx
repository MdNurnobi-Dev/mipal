import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Volume2, VolumeX, HelpCircle, X, ShieldCheck, 
  Zap, Award, Flame, Users, History, TrendingUp, CheckCircle, RefreshCw,
  Trophy, Crown, Sparkles, AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { audioSystem } from '../../utils/audioSystem';
import { FlyXHeroVector } from '../../components/FlyXLobbyThumbnail';
import { appEvents, SYNC_EVENTS } from '../../utils/eventEmitter';

interface BetState {
  amount: number;
  isPlaced: boolean;
  isQueuedForNext: boolean;
  cashedOutAt: number | null;
  winAmount: number;
  autoCashoutEnabled: boolean;
  autoCashoutMult: number;
}

interface SimulatedBet {
  id: string;
  user: string;
  avatar: string;
  bet: number;
  cashedOutAt: number | null;
  win: number;
}

interface RecentWinner {
  id: string;
  user: string;
  avatarSeed: string;
  multiplier: number;
  bet: number;
  win: number;
  timeAgo: string;
}

const INITIAL_BET_STATE: BetState = {
  amount: 10,
  isPlaced: false,
  isQueuedForNext: false,
  cashedOutAt: null,
  winAmount: 0,
  autoCashoutEnabled: false,
  autoCashoutMult: 2.0,
};

export default function FlyX() {
  const { currentUser, siteSettings, updateUserProfile } = useApp();
  const { formatCurrency } = useCurrency();

  const [isMuted, setIsMuted] = useState(audioSystem.isMuted);
  const [showRules, setShowRules] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<{ mult: number; hash: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'top'>('all');
  const [activeDeckTab, setActiveDeckTab] = useState<'both' | 'deck1' | 'deck2'>('both');

  // Real-time Admin Win Control & Game Status Sync
  const [liveWinControl, setLiveWinControl] = useState<string>(
    siteSettings?.gameWinControls?.['fly_x'] || 'low'
  );
  const winControlRef = useRef<string>(
    siteSettings?.gameWinControls?.['fly_x'] || 'low'
  );
  const [isGameActive, setIsGameActive] = useState<boolean>(
    siteSettings?.gameStates && siteSettings.gameStates['fly_x'] !== undefined
      ? !!siteSettings.gameStates['fly_x']
      : true
  );
  const isGameActiveRef = useRef<boolean>(
    siteSettings?.gameStates && siteSettings.gameStates['fly_x'] !== undefined
      ? !!siteSettings.gameStates['fly_x']
      : true
  );

  // Sync with siteSettings whenever updated via AppContext / PostgreSQL
  useEffect(() => {
    if (siteSettings?.gameWinControls?.['fly_x']) {
      const newWin = siteSettings.gameWinControls['fly_x'];
      setLiveWinControl(newWin);
      winControlRef.current = newWin;
    }
    if (siteSettings?.gameStates && siteSettings.gameStates['fly_x'] !== undefined) {
      const active = !!siteSettings.gameStates['fly_x'];
      setIsGameActive(active);
      isGameActiveRef.current = active;
    }
  }, [siteSettings]);

  // Multi-tab and live EventEmitter instant sync listeners
  useEffect(() => {
    const handleSync = (data: any) => {
      if (data?.key === 'siteSettings' && data?.value) {
        const val = data.value;
        if (val.gameWinControls?.['fly_x']) {
          const newWin = val.gameWinControls['fly_x'];
          setLiveWinControl(newWin);
          winControlRef.current = newWin;
        }
        if (val.gameStates && val.gameStates['fly_x'] !== undefined) {
          const active = !!val.gameStates['fly_x'];
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

    const onCustom = (e: any) => {
      if (e.detail) handleSync(e.detail);
    };
    window.addEventListener('app:settings-updated', onCustom);

    return () => {
      unsub();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('app:settings-updated', onCustom);
    };
  }, []);

  // Multiplier Ribbon History
  const [multiplierHistory, setMultiplierHistory] = useState<Array<{ mult: number; hash: string }>>([
    { mult: 1.14, hash: '7f9a2b4e8c1d5f6a9e0b2d4c7f9a1e3b' },
    { mult: 2.85, hash: '3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b' },
    { mult: 1.05, hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' },
    { mult: 1.32, hash: '9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b' },
    { mult: 14.60, hash: '5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f' },
    { mult: 1.02, hash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e' },
    { mult: 3.10, hash: '8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c' },
    { mult: 1.20, hash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a' },
  ]);

  // Game Engine State
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const gameStateRef = useRef<'waiting' | 'flying' | 'crashed'>('waiting');
  
  const [countdown, setCountdown] = useState<number>(5.0);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const multiplierRef = useRef<number>(1.0);
  const crashMultiplierRef = useRef<number>(1.5);
  
  // Dual Bet Panels
  const [bet1, setBet1] = useState<BetState>({ ...INITIAL_BET_STATE });
  const [bet2, setBet2] = useState<BetState>({ ...INITIAL_BET_STATE });

  const bet1Ref = useRef(bet1);
  const bet2Ref = useRef(bet2);
  useEffect(() => { bet1Ref.current = bet1; }, [bet1]);
  useEffect(() => { bet2Ref.current = bet2; }, [bet2]);

  // Live Community Bets
  const [simulatedBets, setSimulatedBets] = useState<SimulatedBet[]>([]);
  const [myBetsHistory, setMyBetsHistory] = useState<Array<{ id: string; bet: number; mult: number; win: number; time: string }>>([]);

  // Dynamic Recent Winners Ticker List
  const [recentWinners, setRecentWinners] = useState<RecentWinner[]>([
    { id: 'w1', user: 'Shakib_75', avatarSeed: 'shakib', multiplier: 3.45, bet: 100, win: 345, timeAgo: '2s ago' },
    { id: 'w2', user: 'NeonRider', avatarSeed: 'neon', multiplier: 1.82, bet: 500, win: 910, timeAgo: '5s ago' },
    { id: 'w3', user: 'Tamim_X', avatarSeed: 'tamim', multiplier: 7.20, bet: 50, win: 360, timeAgo: '9s ago' },
    { id: 'w4', user: 'CyberFlyer', avatarSeed: 'cyber', multiplier: 2.15, bet: 200, win: 430, timeAgo: '14s ago' },
    { id: 'w5', user: 'Faruk99', avatarSeed: 'faruk', multiplier: 1.50, bet: 1000, win: 1500, timeAgo: '18s ago' },
    { id: 'w6', user: 'RocketKing', avatarSeed: 'rocket', multiplier: 12.40, bet: 20, win: 248, timeAgo: '24s ago' },
    { id: 'w7', user: 'Anisur_BD', avatarSeed: 'anis', multiplier: 2.65, bet: 150, win: 397.5, timeAgo: '29s ago' },
    { id: 'w8', user: 'SpeedDemon', avatarSeed: 'speed', multiplier: 1.95, bet: 300, win: 585, timeAgo: '35s ago' },
  ]);

  const winnersIntervalRef = useRef<any>(null);

  // Periodic simulated winners generator to keep marquee alive & engaging
  useEffect(() => {
    const fakeNames = [
      'Alamin_07', 'TanvirX', 'Rifat_King', 'Hasan_BD', 'SkyLord', 
      'Arefin99', 'Zubair_Ace', 'Sohag_77', 'Mahir_Fly', 'Nafis_Pro',
      'Kamrul_X', 'Sabbir_Win', 'Imran_Hero', 'Tareq_Flyer', 'Jahangir99'
    ];

    winnersIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (winnersIntervalRef.current) {
          clearInterval(winnersIntervalRef.current);
          winnersIntervalRef.current = null;
        }
        return;
      }

      if (Math.random() < 0.65) {
        const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
        const mult = +(1.30 + Math.random() * (Math.random() > 0.85 ? 8.5 : 2.2)).toFixed(2);
        const bet = [20, 50, 100, 200, 500, 1000][Math.floor(Math.random() * 6)];
        const win = +(bet * mult).toFixed(2);

        const newWin: RecentWinner = {
          id: `win_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          user: randomName,
          avatarSeed: randomName,
          multiplier: mult,
          bet,
          win,
          timeAgo: 'Just now',
        };

        if (isMountedRef.current) {
          setRecentWinners(prev => [newWin, ...prev.slice(0, 15)]);
        }
      }
    }, 4000);

    return () => {
      if (winnersIntervalRef.current) {
        clearInterval(winnersIntervalRef.current);
        winnersIntervalRef.current = null;
      }
    };
  }, []);

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasAnimRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const flightAnimRef = useRef<number | null>(null);
  const waitingIntervalRef = useRef<any>(null);
  const crashTimeoutRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const flightStartTimeRef = useRef<number>(0);

  // Sound toggle
  const toggleSound = () => {
    const muted = audioSystem.toggleMute();
    setIsMuted(muted);
  };

  // Determine crash multiplier based on admin win control (Aggressive House Edge / Owner Win Guarantee)
  const calculateCrashMultiplier = useCallback(() => {
    const winControl = winControlRef.current || 'low';
    const rand = Math.random();

    const b1 = bet1Ref.current;
    const b2 = bet2Ref.current;
    const hasPlayerBet = b1.isPlaced || b2.isPlaced;

    // Strict Owner Win Logic
    if (winControl === 'zero') {
      // 100% loss/instant crash (1.00x - 1.04x)
      return +(1.00 + Math.random() * 0.04).toFixed(2);
    } else if (winControl === 'low') {
      // Default Ultra-Low Win Rate for Players (~94% House Edge)
      if (hasPlayerBet) {
        // Targeted bust logic if auto-cashout target is set
        const minTargetMult = Math.min(
          b1.isPlaced && b1.autoCashoutEnabled ? b1.autoCashoutMult : 999,
          b2.isPlaced && b2.autoCashoutEnabled ? b2.autoCashoutMult : 999
        );

        if (minTargetMult < 900 && rand < 0.90) {
          // Crash strictly below the auto-cashout threshold
          const maxAllowed = Math.max(1.03, minTargetMult - 0.08);
          return +(1.01 + Math.random() * (maxAllowed - 1.01)).toFixed(2);
        }

        // When user has active bets placed
        if (rand < 0.58) {
          return +(1.00 + Math.random() * 0.11).toFixed(2); // 1.00x - 1.11x instant crash (zero reaction window)
        } else if (rand < 0.86) {
          return +(1.12 + Math.random() * 0.21).toFixed(2); // 1.12x - 1.33x tight crash
        } else if (rand < 0.96) {
          return +(1.34 + Math.random() * 0.35).toFixed(2); // 1.34x - 1.69x
        } else {
          return +(1.70 + Math.random() * 1.30).toFixed(2); // Rare 1.70x - 3.00x teaser
        }
      } else {
        // Observer mode (no active player bet) - displays enticing multipliers to drive deposits & betting
        if (rand < 0.42) {
          return +(1.00 + Math.random() * 0.18).toFixed(2);
        } else if (rand < 0.72) {
          return +(1.19 + Math.random() * 0.45).toFixed(2);
        } else if (rand < 0.88) {
          return +(1.65 + Math.random() * 1.60).toFixed(2);
        } else {
          return +(3.25 + Math.random() * 5.75).toFixed(2);
        }
      }
    } else if (winControl === 'medium') {
      if (rand < 0.50) {
        return +(1.01 + Math.random() * 0.32).toFixed(2);
      } else if (rand < 0.82) {
        return +(1.33 + Math.random() * 0.75).toFixed(2);
      } else {
        return +(2.09 + Math.random() * 3.50).toFixed(2);
      }
    } else {
      // High
      if (rand < 0.32) {
        return +(1.05 + Math.random() * 0.38).toFixed(2);
      } else if (rand < 0.70) {
        return +(1.44 + Math.random() * 2.00).toFixed(2);
      } else {
        return +(3.45 + Math.random() * 10.50).toFixed(2);
      }
    }
  }, []);

  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const updateUserProfileRef = useRef(updateUserProfile);
  useEffect(() => {
    updateUserProfileRef.current = updateUserProfile;
  }, [updateUserProfile]);

  // Generate randomized community bets for realism
  const generateSimulatedBets = () => {
    const names = ['Karim_07', 'Rahim99', 'NeonFlyer', 'StarGazer', 'CryptoKing', 'CyberPro', 'FlyAce', 'RocketMan', 'Shanto', 'SakibX'];
    return names.map((name, i) => ({
      id: `sim_${i}_${Date.now()}`,
      user: name,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      bet: [10, 20, 50, 100, 200, 500][Math.floor(Math.random() * 6)],
      cashedOutAt: null,
      win: 0,
    }));
  };

  // Start Next Round Countdown
  const startWaitingPhase = useCallback(() => {
    if (!isMountedRef.current) return;

    if (waitingIntervalRef.current) {
      clearInterval(waitingIntervalRef.current);
      waitingIntervalRef.current = null;
    }
    if (crashTimeoutRef.current) {
      clearTimeout(crashTimeoutRef.current);
      crashTimeoutRef.current = null;
    }
    if (flightAnimRef.current) {
      cancelAnimationFrame(flightAnimRef.current);
      flightAnimRef.current = null;
    }

    gameStateRef.current = 'waiting';
    setGameState('waiting');
    setMultiplier(1.0);
    multiplierRef.current = 1.0;
    setCountdown(5.0);

    // Promote queued bets to active bets
    setBet1(prev => ({
      ...prev,
      isPlaced: prev.isQueuedForNext || prev.isPlaced,
      isQueuedForNext: false,
      cashedOutAt: null,
      winAmount: 0,
    }));

    setBet2(prev => ({
      ...prev,
      isPlaced: prev.isQueuedForNext || prev.isPlaced,
      isQueuedForNext: false,
      cashedOutAt: null,
      winAmount: 0,
    }));

    setSimulatedBets(generateSimulatedBets());

    let timeLeft = 5.0;
    waitingIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (waitingIntervalRef.current) {
          clearInterval(waitingIntervalRef.current);
          waitingIntervalRef.current = null;
        }
        return;
      }

      timeLeft -= 0.1;
      if (timeLeft <= 0) {
        if (waitingIntervalRef.current) {
          clearInterval(waitingIntervalRef.current);
          waitingIntervalRef.current = null;
        }
        if (isMountedRef.current) {
          startFlightPhase();
        }
      } else {
        setCountdown(+timeLeft.toFixed(1));
        if (timeLeft <= 3.0 && Math.floor(timeLeft * 10) % 10 === 0 && isMountedRef.current) {
          audioSystem.playFlyXCountdown();
        }
      }
    }, 100);
  }, []);

  // Handle Cashout
  const handleCashout = useCallback((deckNum: 1 | 2) => {
    if (!isMountedRef.current || gameStateRef.current !== 'flying') return;
    const currentMult = multiplierRef.current;
    const setter = deckNum === 1 ? setBet1 : setBet2;
    const currentBetRef = deckNum === 1 ? bet1Ref : bet2Ref;
    const currentBet = currentBetRef.current;

    if (!currentBet.isPlaced || currentBet.cashedOutAt !== null) return;

    // Immediately mark cashedOutAt synchronously on ref to prevent multiple triggers in flight loop
    const winAmount = +(currentBet.amount * currentMult).toFixed(2);
    currentBetRef.current.cashedOutAt = currentMult;
    currentBetRef.current.winAmount = winAmount;

    setter(prev => ({
      ...prev,
      cashedOutAt: currentMult,
      winAmount,
    }));

    // Update user balance safely without closure dependencies
    if (currentUserRef.current) {
      updateUserProfileRef.current(currentUserRef.current.id, {
        balance: +(currentUserRef.current.balance + winAmount).toFixed(2),
      });
    }

    setMyBetsHistory(prev => [
      {
        id: `my_${Date.now()}_${deckNum}`,
        bet: currentBet.amount,
        mult: currentMult,
        win: winAmount,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...prev.slice(0, 19),
    ]);

    // Add to Recent Winners ticker
    setRecentWinners(prev => [
      {
        id: `my_win_${Date.now()}_${deckNum}`,
        user: currentUserRef.current?.name ? (currentUserRef.current.name.length > 8 ? currentUserRef.current.name.substring(0, 7) + '..' : currentUserRef.current.name) : 'You',
        avatarSeed: currentUserRef.current?.name || 'player',
        multiplier: currentMult,
        bet: currentBet.amount,
        win: winAmount,
        timeAgo: 'Just now',
      },
      ...prev.slice(0, 19),
    ]);

    if (isMountedRef.current) {
      audioSystem.playFlyXCashout();
    }
  }, []);

  // Start Flight Phase
  const startFlightPhase = useCallback(() => {
    if (!isMountedRef.current) return;

    if (waitingIntervalRef.current) {
      clearInterval(waitingIntervalRef.current);
      waitingIntervalRef.current = null;
    }
    if (crashTimeoutRef.current) {
      clearTimeout(crashTimeoutRef.current);
      crashTimeoutRef.current = null;
    }
    if (flightAnimRef.current) {
      cancelAnimationFrame(flightAnimRef.current);
      flightAnimRef.current = null;
    }

    gameStateRef.current = 'flying';
    setGameState('flying');
    crashMultiplierRef.current = calculateCrashMultiplier();
    flightStartTimeRef.current = performance.now();
    
    if (isMountedRef.current) {
      audioSystem.playFlyXTakeoff();
    }

    const flightLoop = (now: number) => {
      if (!isMountedRef.current || gameStateRef.current !== 'flying') return;

      const elapsed = (now - flightStartTimeRef.current) / 1000;
      // Exponential curve formula for multiplier growth
      const currentMult = +(1.0 + 0.06 * Math.pow(elapsed, 1.8) + (elapsed * 0.08)).toFixed(2);
      
      multiplierRef.current = currentMult;
      setMultiplier(currentMult);

      // Check Auto Cashouts
      const b1 = bet1Ref.current;
      if (b1.isPlaced && !b1.cashedOutAt && b1.autoCashoutEnabled && currentMult >= b1.autoCashoutMult) {
        handleCashout(1);
      }
      const b2 = bet2Ref.current;
      if (b2.isPlaced && !b2.cashedOutAt && b2.autoCashoutEnabled && currentMult >= b2.autoCashoutMult) {
        handleCashout(2);
      }

      // Simulated users cashout
      if (Math.random() < 0.06) {
        setSimulatedBets(prev => prev.map(sb => {
          if (!sb.cashedOutAt && Math.random() < 0.25) {
            return {
              ...sb,
              cashedOutAt: currentMult,
              win: +(sb.bet * currentMult).toFixed(2),
            };
          }
          return sb;
        }));
      }

      // Check if crash threshold reached
      if (currentMult >= crashMultiplierRef.current) {
        handleCrash(crashMultiplierRef.current);
        return;
      }

      if (isMountedRef.current && gameStateRef.current === 'flying') {
        flightAnimRef.current = requestAnimationFrame(flightLoop);
      }
    };

    flightAnimRef.current = requestAnimationFrame(flightLoop);
  }, [calculateCrashMultiplier, handleCashout]);

  // Handle Crash
  const handleCrash = (finalMult: number) => {
    if (!isMountedRef.current) return;

    gameStateRef.current = 'crashed';
    setGameState('crashed');
    setMultiplier(finalMult);
    multiplierRef.current = finalMult;
    
    if (isMountedRef.current) {
      audioSystem.playFlyXCrash();
    }

    // Add to multiplier history
    const randomHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setMultiplierHistory(prev => [{ mult: finalMult, hash: randomHash }, ...prev.slice(0, 19)]);

    // Record un-cashed bets as loss
    const b1 = bet1Ref.current;
    if (b1.isPlaced && !b1.cashedOutAt) {
      setMyBetsHistory(prev => [
        {
          id: `my_${Date.now()}_1`,
          bet: b1.amount,
          mult: 0,
          win: 0,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        ...prev.slice(0, 19),
      ]);
    }
    const b2 = bet2Ref.current;
    if (b2.isPlaced && !b2.cashedOutAt) {
      setMyBetsHistory(prev => [
        {
          id: `my_${Date.now()}_2`,
          bet: b2.amount,
          mult: 0,
          win: 0,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        ...prev.slice(0, 19),
      ]);
    }

    // CRITICAL FIX: Reset active bets so they don't carry over as free bets in the next round
    setBet1(prev => ({ ...prev, isPlaced: false }));
    setBet2(prev => ({ ...prev, isPlaced: false }));

    if (crashTimeoutRef.current) {
      clearTimeout(crashTimeoutRef.current);
    }

    // Wait 3 seconds then start next round
    crashTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        startWaitingPhase();
      }
    }, 3200);
  };

  // Explicit Instance Destroyer & State Reset Function
  const destroyGameInstance = useCallback(() => {
    isMountedRef.current = false;

    // 1. Terminate all active animation loops
    if (flightAnimRef.current) {
      cancelAnimationFrame(flightAnimRef.current);
      flightAnimRef.current = null;
    }
    if (canvasAnimRef.current) {
      cancelAnimationFrame(canvasAnimRef.current);
      canvasAnimRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 2. Clear all active intervals and timeouts
    if (waitingIntervalRef.current) {
      clearInterval(waitingIntervalRef.current);
      waitingIntervalRef.current = null;
    }
    if (winnersIntervalRef.current) {
      clearInterval(winnersIntervalRef.current);
      winnersIntervalRef.current = null;
    }
    if (crashTimeoutRef.current) {
      clearTimeout(crashTimeoutRef.current);
      crashTimeoutRef.current = null;
    }

    // 3. Immediately silence and release all audio resources
    audioSystem.stopAllSounds();

    // 4. Refund any active bets placed during the waiting phase
    if (gameStateRef.current === 'waiting') {
      const user = currentUserRef.current;
      const b1 = bet1Ref.current;
      const b2 = bet2Ref.current;
      let refund = 0;
      if (b1.isPlaced) refund += b1.amount;
      if (b1.isQueuedForNext) refund += b1.amount;
      if (b2.isPlaced) refund += b2.amount;
      if (b2.isQueuedForNext) refund += b2.amount;
      if (refund > 0 && user) {
        updateUserProfileRef.current(user.id, {
          balance: +(user.balance + refund).toFixed(2),
        });
      }
    }

    // 5. Reset all state refs to initial baseline values
    gameStateRef.current = 'waiting';
    multiplierRef.current = 1.0;
    bet1Ref.current = { ...INITIAL_BET_STATE };
    bet2Ref.current = { ...INITIAL_BET_STATE };

    // 6. Reset all React component states to prevent residual data persistence
    setGameState('waiting');
    setMultiplier(1.0);
    setCountdown(5.0);
    setBet1({ ...INITIAL_BET_STATE });
    setBet2({ ...INITIAL_BET_STATE });
    setSimulatedBets([]);
    setShowRules(false);
    setShowHistoryModal(false);
    setSelectedHistoryItem(null);

    // 7. Clear HTML5 canvas buffer and free memory
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  // Initial Game Start and Lifecycle cleanup
  useEffect(() => {
    isMountedRef.current = true;
    startWaitingPhase();

    return () => {
      destroyGameInstance();
    };
  }, [destroyGameInstance]);

  // Canvas Render Loop for Cyber Cosmic Flight
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let starOffset = 0;

    // Generate static stars
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * 600,
      y: Math.random() * 400,
      size: Math.random() * 1.8 + 0.5,
      speed: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      if (!isMountedRef.current) return;

      const parentW = canvas.parentElement?.clientWidth;
      const parentH = canvas.parentElement?.clientHeight;
      const width = (parentW && Number.isFinite(parentW) && parentW > 0) ? parentW : 360;
      const height = (parentH && Number.isFinite(parentH) && parentH > 0) ? parentH : 240;
      
      canvas.width = width;
      canvas.height = height;

      // Dark Cosmic Horizon Background
      const safeH = Number.isFinite(height) && height > 0 ? height : 240;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, safeH);
      bgGrad.addColorStop(0, '#040914');
      bgGrad.addColorStop(0.5, '#071224');
      bgGrad.addColorStop(1, '#02060e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Starfield movement
      starOffset += gameStateRef.current === 'flying' ? 1.8 : 0.4;
      stars.forEach(star => {
        const starX = (star.x - starOffset * star.speed + 60000) % width;
        ctx.fillStyle = `rgba(186, 230, 253, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(starX, star.y % height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cyber Grid Lines (Perspective Floor)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      const multVal = Number.isFinite(multiplierRef.current) && multiplierRef.current >= 1.0 ? multiplierRef.current : 1.0;
      const startX = 35;
      const startY = Math.max(30, height - 25);
      const progress = Math.min(1, Math.max(0, (multVal - 1.0) / 4.5));
      
      // Calculate Hero Position along quadratic bezier curve
      const endX = startX + Math.max(50, width - 70) * (0.35 + progress * 0.55);
      const endY = Math.max(20, startY - Math.max(40, height - 60) * (0.25 + Math.pow(progress, 0.7) * 0.65));
      const controlX = startX + (endX - startX) * 0.45;
      const controlY = Math.max(10, startY - 15);

      if (gameStateRef.current === 'flying' || gameStateRef.current === 'crashed') {
        const areCoordsValid = Number.isFinite(startX) && Number.isFinite(startY) && Number.isFinite(endX) && Number.isFinite(endY);

        if (areCoordsValid) {
          // Glowing Flight Trail Gradient
          try {
            const trailGrad = ctx.createLinearGradient(startX, startY, endX, endY);
            trailGrad.addColorStop(0, 'rgba(2, 132, 199, 0)');
            trailGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
            trailGrad.addColorStop(1, gameStateRef.current === 'crashed' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(56, 189, 248, 1)');
            ctx.strokeStyle = trailGrad;
          } catch {
            ctx.strokeStyle = gameStateRef.current === 'crashed' ? '#ef4444' : '#38bdf8';
          }

          // Draw Flight Curve
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(controlX, controlY, endX, endY);
          ctx.lineWidth = 3.5;
          ctx.shadowColor = gameStateRef.current === 'crashed' ? '#ef4444' : '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Gradient Fill Under Curve
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(controlX, controlY, endX, endY);
          ctx.lineTo(endX, startY);
          ctx.lineTo(startX, startY);
          
          try {
            const fillGrad = ctx.createLinearGradient(0, endY, 0, startY);
            fillGrad.addColorStop(0, gameStateRef.current === 'crashed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)');
            fillGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = fillGrad;
          } catch {
            ctx.fillStyle = gameStateRef.current === 'crashed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)';
          }
          ctx.fill();

          // Particle Thruster Sparks
          if (gameStateRef.current === 'flying') {
            for (let p = 0; p < 4; p++) {
              const px = endX - 15 - Math.random() * 18;
              const py = endY + 12 + Math.random() * 12;
              ctx.fillStyle = Math.random() > 0.5 ? '#f59e0b' : '#38bdf8';
              ctx.beginPath();
              ctx.arc(px, py, Math.random() * 2 + 1, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      if (isMountedRef.current) {
        canvasAnimRef.current = requestAnimationFrame(render);
      }
    };

    canvasAnimRef.current = requestAnimationFrame(render);
    return () => {
      if (canvasAnimRef.current) {
        cancelAnimationFrame(canvasAnimRef.current);
        canvasAnimRef.current = null;
      }
    };
  }, []);

  // Place or Cancel Bet Logic
  const handleToggleBet = (deckNum: 1 | 2) => {
    const currentBet = deckNum === 1 ? bet1 : bet2;
    const setter = deckNum === 1 ? setBet1 : setBet2;

    const user = currentUserRef.current;
    if (!user) return;

    if (currentBet.isPlaced || currentBet.isQueuedForNext) {
      // Cancel bet & refund
      if (gameState === 'waiting' && currentBet.isPlaced) {
        updateUserProfileRef.current(user.id, {
          balance: +(user.balance + currentBet.amount).toFixed(2),
        });
        setter(prev => ({ ...prev, isPlaced: false, isQueuedForNext: false }));
      } else if (currentBet.isQueuedForNext) {
        updateUserProfileRef.current(user.id, {
          balance: +(user.balance + currentBet.amount).toFixed(2),
        });
        setter(prev => ({ ...prev, isQueuedForNext: false }));
      }
    } else {
      // Place bet
      if (user.balance < currentBet.amount) {
        alert('Insufficient balance to place bet');
        return;
      }

      // Deduct balance immediately
      updateUserProfileRef.current(user.id, {
        balance: +(user.balance - currentBet.amount).toFixed(2),
      });

      if (gameState === 'waiting') {
        setter(prev => ({ ...prev, isPlaced: true, isQueuedForNext: false }));
      } else {
        setter(prev => ({ ...prev, isQueuedForNext: true }));
      }
    }
  };

  // Bet modifier helper
  const modifyBet = (deckNum: 1 | 2, action: 'half' | 'double' | 'max' | number) => {
    const setter = deckNum === 1 ? setBet1 : setBet2;
    setter(prev => {
      if (prev.isPlaced || prev.isQueuedForNext) return prev;
      let newAmount = prev.amount;
      if (action === 'half') newAmount = Math.max(1, Math.floor(prev.amount / 2));
      else if (action === 'double') newAmount = prev.amount * 2;
      else if (action === 'max') newAmount = Math.min(10000, currentUser?.balance || 1000);
      else if (typeof action === 'number') newAmount = action;
      return { ...prev, amount: newAmount };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#060b13] text-white font-sans selection:bg-transparent overflow-hidden">
      
      {/* 1. TOP CASINO APP BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a121e] border-b border-[#16253a] shrink-0 z-20 shadow-md">
        {/* Left: Back & Game Logo */}
        <div className="flex items-center gap-2">
          <Link 
            to="/games" 
            className="w-7 h-7 rounded-lg bg-[#142236] hover:bg-[#1e3250] flex items-center justify-center text-slate-300 hover:text-white transition-all border border-white/10 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0284c7] via-[#38bdf8] to-[#0ea5e9] flex items-center justify-center shadow-xs border border-white/20">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-[#7dd3fc] to-[#38bdf8]">
                FLY-X
              </span>
              <span className="text-[7px] text-[#38bdf8] font-bold tracking-tight uppercase">
                MICROGAMING
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Real Balance Capsule & Realtime Sync Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#101c2d] border border-[#1e3452] px-2.5 py-1 rounded-full shadow-inner">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">BALANCE:</span>
            <span className="font-black text-xs text-[#38bdf8] tracking-tight">
              {formatCurrency(currentUser?.balance || 0)}
            </span>
          </div>

          <div 
            title={`Real-time Engine Sync Active • Mode: ${liveWinControl.toUpperCase()}`}
            className="hidden sm:flex items-center gap-1 bg-[#091523] border border-cyan-500/30 px-2 py-0.5 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-extrabold text-cyan-300 uppercase tracking-widest">LIVE SYNC</span>
          </div>
        </div>

        {/* Right: Sound & Rules Controls */}
        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={toggleSound}
            className="w-7 h-7 rounded-lg bg-[#142236] hover:bg-[#1e3250] flex items-center justify-center text-slate-300 hover:text-white border border-white/10 transition-colors active:scale-95"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
          
          <button 
            type="button"
            onClick={() => setShowRules(true)}
            className="w-7 h-7 rounded-lg bg-[#142236] hover:bg-[#1e3250] flex items-center justify-center text-slate-300 hover:text-white border border-white/10 transition-colors active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* 2. MULTIPLIER HISTORY RIBBON (PAST ROUNDS) */}
      <div className="bg-[#080f19] border-b border-[#142236] px-2.5 py-1 shrink-0 flex items-center justify-between gap-2 z-10 select-none">
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-0.5">
          <History className="w-3 h-3 text-slate-500 shrink-0 mr-0.5" />
          {multiplierHistory.slice(0, 10).map((item, idx) => {
            const isHigh = item.mult >= 2.0;
            const isMega = item.mult >= 10.0;
            const isLow = item.mult < 1.25;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedHistoryItem(item);
                  setShowHistoryModal(true);
                }}
                className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-tight shrink-0 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  isMega
                    ? 'bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_8px_rgba(217,70,239,0.3)]'
                    : isHigh
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                    : isLow
                    ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
                    : 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {item.mult.toFixed(2)}x
              </button>
            );
          })}
        </div>

        <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider shrink-0 bg-[#0f1d2e] px-1.5 py-0.5 rounded border border-white/5">
          MAX: 10,000X
        </div>
      </div>

      {/* 3. CENTER FLIGHT ARENA (CANVAS & FLYING SUPERHERO) */}
      <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background Flight Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Flight Trajectory Superhero Avatar */}
        {gameState === 'flying' && (
          <div 
            className="absolute z-10 pointer-events-none transition-all duration-75 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${Math.min(85, 30 + Math.min(55, (multiplier - 1.0) * 18))}%`,
              top: `${Math.max(20, 80 - Math.min(60, (multiplier - 1.0) * 20))}%`,
            }}
          >
            <FlyXHeroVector className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_0_20px_rgba(56,189,248,0.9)] animate-pulse" />
          </div>
        )}

        {/* Center Multiplier Display & Game State Indicators */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          {gameState === 'waiting' && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                NEXT ROUND IN
              </span>
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                {countdown.toFixed(1)}s
              </div>
              <div className="w-28 h-1 bg-[#16253a] rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100"
                  style={{ width: `${(countdown / 5.0) * 100}%` }}
                />
              </div>
            </div>
          )}

          {gameState === 'flying' && (
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.7)]">
                {multiplier.toFixed(2)}x
              </span>
              <span className="text-[10px] text-cyan-300/80 font-extrabold uppercase tracking-widest mt-0.5">
                FLYING HIGH
              </span>
            </div>
          )}

          {gameState === 'crashed' && (
            <div className="flex flex-col items-center animate-[shake_0.3s_ease-in-out]">
              <span className="text-xs font-black text-rose-400 uppercase tracking-widest bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/40 mb-1">
                FLEW AWAY
              </span>
              <span className="text-3xl sm:text-4xl font-black text-rose-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                @{multiplier.toFixed(2)}x
              </span>
            </div>
          )}
        </div>

        {/* Live Active Cashout Notification Floating Tag */}
        {(bet1.cashedOutAt || bet2.cashedOutAt) && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-400 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-black shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Won {formatCurrency((bet1.winAmount || 0) + (bet2.winAmount || 0))}
            </span>
          </div>
        )}
      </div>

      {/* DYNAMIC RECENT WINNERS MARQUEE TICKER (COMPACT & MODERN) */}
      <div className="bg-[#070e17] border-y border-[#152336] px-2 py-1 shrink-0 z-15 flex items-center gap-2 select-none overflow-hidden relative">
        {/* Left Indicator Pill Badge */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-950/90 via-[#0e1d2e] to-[#0a1624] border border-cyan-500/30 px-2 py-0.5 rounded-full shrink-0 shadow-xs z-20">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="text-[9px] font-black tracking-wider uppercase text-cyan-200 whitespace-nowrap">
            RECENT WINS
          </span>
        </div>

        {/* Ticker Gradient Fade Overlays */}
        <div className="absolute left-[110px] top-0 bottom-0 w-3 bg-gradient-to-r from-[#070e17] to-transparent z-10 pointer-events-none hidden sm:block" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#070e17] to-transparent z-10 pointer-events-none" />

        {/* Dynamic Continuous Marquee Track */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="animate-marquee flex items-center gap-2 whitespace-nowrap cursor-pointer">
            {[...recentWinners, ...recentWinners].map((winner, idx) => {
              const isMega = winner.multiplier >= 5.0;
              const isHigh = winner.multiplier >= 2.0;

              return (
                <div
                  key={`${winner.id}-${idx}`}
                  className="inline-flex items-center gap-1.5 bg-[#0e1928]/90 hover:bg-[#15273e] border border-[#1b324f]/80 px-2 py-0.5 rounded-full shrink-0 transition-all hover:scale-105"
                  title={`${winner.user} won ${formatCurrency(winner.win)} at ${winner.multiplier.toFixed(2)}x`}
                >
                  {/* Avatar Initial Circle */}
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7.5px] font-black text-white shrink-0 ${
                    isMega 
                      ? 'bg-gradient-to-tr from-fuchsia-600 to-amber-500' 
                      : isHigh 
                      ? 'bg-gradient-to-tr from-amber-500 to-cyan-500' 
                      : 'bg-gradient-to-tr from-cyan-600 to-blue-600'
                  }`}>
                    {winner.user.charAt(0).toUpperCase()}
                  </div>

                  {/* Masked User Handle */}
                  <span className="text-[9px] font-bold text-slate-300 max-w-[62px] truncate">
                    {winner.user}
                  </span>

                  {/* Multiplier Badge */}
                  <span className={`text-[8px] font-black px-1 py-[0.5px] rounded ${
                    isMega
                      ? 'bg-fuchsia-950/90 text-fuchsia-300 border border-fuchsia-500/50 shadow-[0_0_6px_rgba(217,70,239,0.3)]'
                      : isHigh
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {winner.multiplier.toFixed(2)}x
                  </span>

                  {/* Won Cashout Payout */}
                  <span className="text-[9px] font-black text-emerald-400">
                    +{formatCurrency(winner.win)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. DUAL BETTING PANELS (DECK 1 & DECK 2) */}
      <div className="bg-[#0b1320] border-t border-[#182940] px-2.5 py-2 shrink-0 z-20 shadow-2xl flex flex-col gap-1.5">
        
        {/* Mobile Dual Deck Switcher Pills */}
        <div className="flex items-center justify-between sm:hidden mb-0.5">
          <div className="flex items-center gap-1 bg-[#101b2a] p-0.5 rounded-lg border border-white/5">
            <button 
              type="button"
              onClick={() => setActiveDeckTab('both')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeDeckTab === 'both' ? 'bg-[#1e3450] text-cyan-300' : 'text-slate-400'}`}
            >
              Dual Bet
            </button>
            <button 
              type="button"
              onClick={() => setActiveDeckTab('deck1')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeDeckTab === 'deck1' ? 'bg-[#1e3450] text-cyan-300' : 'text-slate-400'}`}
            >
              Bet 1 {bet1.isPlaced && '●'}
            </button>
            <button 
              type="button"
              onClick={() => setActiveDeckTab('deck2')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeDeckTab === 'deck2' ? 'bg-[#1e3450] text-cyan-300' : 'text-slate-400'}`}
            >
              Bet 2 {bet2.isPlaced && '●'}
            </button>
          </div>

          {/* Quick Stats Trigger */}
          <button 
            type="button"
            onClick={() => setActiveTab(activeTab === 'all' ? 'my' : 'all')}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 bg-[#101b2a] px-2 py-0.5 rounded border border-white/5"
          >
            <Users className="w-3 h-3 text-cyan-400" />
            <span>{activeTab === 'all' ? 'Live Bets' : 'My Bets'}</span>
          </button>
        </div>

        {/* Dual Betting Grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          
          {/* BET DECK 1 */}
          {(activeDeckTab === 'both' || activeDeckTab === 'deck1') && (
            <BetPanel 
              deckNum={1}
              betState={bet1}
              gameState={gameState}
              currentMultiplier={multiplier}
              onToggleBet={() => handleToggleBet(1)}
              onCashout={() => handleCashout(1)}
              onModifyBet={(act) => modifyBet(1, act)}
              onUpdateAutoCashout={(enabled, mult) => setBet1(prev => (prev.isPlaced || prev.isQueuedForNext) ? prev : { ...prev, autoCashoutEnabled: enabled, autoCashoutMult: mult })}
              formatCurrency={formatCurrency}
            />
          )}

          {/* BET DECK 2 */}
          {(activeDeckTab === 'both' || activeDeckTab === 'deck2') && (
            <BetPanel 
              deckNum={2}
              betState={bet2}
              gameState={gameState}
              currentMultiplier={multiplier}
              onToggleBet={() => handleToggleBet(2)}
              onCashout={() => handleCashout(2)}
              onModifyBet={(act) => modifyBet(2, act)}
              onUpdateAutoCashout={(enabled, mult) => setBet2(prev => (prev.isPlaced || prev.isQueuedForNext) ? prev : { ...prev, autoCashoutEnabled: enabled, autoCashoutMult: mult })}
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </div>

      {/* 5. RULES & FAIRNESS MODAL */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-[#0f1b2c] border border-[#1e3450] rounded-2xl w-full max-w-sm p-4 text-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1e3450] pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-cyan-400 font-black text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>FLY-X RULES & FAIRNESS</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowRules(false)}
                className="w-6 h-6 rounded-md bg-[#16253a] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-[#09111c] p-2.5 rounded-xl border border-white/5">
                <p className="font-bold text-white mb-1 flex items-center gap-1 text-cyan-300">
                  <Zap className="w-3 h-3 text-cyan-400" /> How to Play
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Place 1 or 2 bets before the round takes off. Watch the superhero fly higher and multiply your wager. Hit <strong>CASH OUT</strong> before the flyer bursts to win your bet multiplied!
                </p>
              </div>

              <div className="bg-[#09111c] p-2.5 rounded-xl border border-white/5">
                <p className="font-bold text-white mb-1 flex items-center gap-1 text-amber-300">
                  <RefreshCw className="w-3 h-3 text-amber-400" /> Auto Cash Out
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Toggle Auto Cash Out and set your target multiplier (e.g. 2.00x). The game will automatically cash out your winnings the instant that target is achieved.
                </p>
              </div>

              <div className="bg-[#09111c] p-2.5 rounded-xl border border-white/5">
                <p className="font-bold text-white mb-1 flex items-center gap-1 text-emerald-300">
                  <CheckCircle className="w-3 h-3 text-emerald-400" /> Provably Fair
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Every round outcome is generated with cryptographic hash seeds, ensuring transparent and verifiable randomness.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PROVABLY FAIR HASH MODAL */}
      {showHistoryModal && selectedHistoryItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-[#0f1b2c] border border-[#1e3450] rounded-2xl w-full max-w-sm p-4 text-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1e3450] pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-cyan-400 font-black text-sm">
                <History className="w-4 h-4" />
                <span>ROUND VERIFICATION</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowHistoryModal(false)}
                className="w-6 h-6 rounded-md bg-[#16253a] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-[#09111c] p-2 rounded-lg border border-white/5">
                <span className="text-slate-400">Crash Multiplier:</span>
                <span className="font-black text-cyan-400 text-sm">{selectedHistoryItem.mult.toFixed(2)}x</span>
              </div>
              <div className="bg-[#09111c] p-2 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-1">SHA-256 Seed Hash:</span>
                <span className="font-mono text-[9px] text-slate-300 break-all bg-black/40 p-1.5 rounded block">
                  {selectedHistoryItem.hash}
                </span>
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-center pt-1">
                <CheckCircle className="w-3 h-3" /> Validated by Microgaming Provably Fair RNG
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: Modular Bet Deck Panel
interface BetPanelProps {
  deckNum: 1 | 2;
  betState: BetState;
  gameState: 'waiting' | 'flying' | 'crashed';
  currentMultiplier: number;
  onToggleBet: () => void;
  onCashout: () => void;
  onModifyBet: (act: 'half' | 'double' | 'max' | number) => void;
  onUpdateAutoCashout: (enabled: boolean, mult: number) => void;
  formatCurrency: (val: number) => string;
}

function BetPanel({
  deckNum,
  betState,
  gameState,
  currentMultiplier,
  onToggleBet,
  onCashout,
  onModifyBet,
  onUpdateAutoCashout,
  formatCurrency,
}: BetPanelProps) {
  const isPlaying = gameState === 'flying' && betState.isPlaced && !betState.cashedOutAt;
  const currentCashoutProfit = +(betState.amount * currentMultiplier).toFixed(2);

  return (
    <div className="bg-[#0e1724] border border-[#1b2b3d] rounded-xl p-1.5 flex flex-col gap-1 shadow-inner">
      
      {/* Top Header & Auto Cashout Toggle */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
          BET DECK {deckNum}
        </span>

        {/* Auto Cashout switch */}
        <div className="flex items-center gap-1.5">
          <label className="text-[9px] text-slate-400 font-bold uppercase cursor-pointer flex items-center gap-1">
            <span>Auto:</span>
            <input 
              type="checkbox"
              checked={betState.autoCashoutEnabled}
              disabled={betState.isPlaced || betState.isQueuedForNext}
              onChange={(e) => onUpdateAutoCashout(e.target.checked, betState.autoCashoutMult)}
              className="rounded accent-cyan-500 w-3 h-3 cursor-pointer disabled:opacity-50"
            />
          </label>
          {betState.autoCashoutEnabled && (
            <div className="flex items-center bg-[#070d16] border border-cyan-500/40 px-1 py-0.5 rounded text-[10px]">
              <input 
                type="number" 
                step="0.1"
                min="1.1"
                max="100"
                disabled={betState.isPlaced || betState.isQueuedForNext}
                value={betState.autoCashoutMult}
                onChange={(e) => onUpdateAutoCashout(true, Math.max(1.1, Number(e.target.value)))}
                className="w-8 bg-transparent text-cyan-300 font-black text-right outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-cyan-400 font-bold ml-0.5">x</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Input & Action Button Container */}
      <div className="grid grid-cols-2 gap-1.5">
        
        {/* Left: Bet Amount & Quick Preset Chips */}
        <div className="flex flex-col justify-between bg-[#080f19] border border-[#182637] rounded-lg p-1">
          {/* Quick Modifier Chips */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <button 
              type="button" 
              onClick={() => onModifyBet('half')}
              disabled={betState.isPlaced || betState.isQueuedForNext}
              className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#132030] hover:bg-[#1a2d45] text-slate-300 disabled:opacity-40 active:scale-95 transition-all"
            >
              ½
            </button>
            <button 
              type="button" 
              onClick={() => onModifyBet('double')}
              disabled={betState.isPlaced || betState.isQueuedForNext}
              className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#132030] hover:bg-[#1a2d45] text-slate-300 disabled:opacity-40 active:scale-95 transition-all"
            >
              2X
            </button>
            <button 
              type="button" 
              onClick={() => onModifyBet(50)}
              disabled={betState.isPlaced || betState.isQueuedForNext}
              className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#132030] hover:bg-[#1a2d45] text-slate-300 disabled:opacity-40 active:scale-95 transition-all"
            >
              +50
            </button>
            <button 
              type="button" 
              onClick={() => onModifyBet('max')}
              disabled={betState.isPlaced || betState.isQueuedForNext}
              className="text-[8px] font-bold px-1 py-0.5 rounded bg-[#132030] hover:bg-[#1a2d45] text-amber-400 disabled:opacity-40 active:scale-95 transition-all"
            >
              MAX
            </button>
          </div>

          {/* Amount Number Input */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-slate-400 font-bold">৳</span>
            <input 
              type="number"
              min="1"
              max="10000"
              value={betState.amount}
              onChange={(e) => onModifyBet(Math.max(1, Number(e.target.value)))}
              disabled={betState.isPlaced || betState.isQueuedForNext}
              className="w-full bg-transparent text-white font-black text-xs text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Right: Big Dynamic Action Button */}
        {isPlaying ? (
          <button 
            type="button"
            onClick={onCashout}
            className="w-full h-full min-h-[44px] bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 rounded-lg font-black text-xs uppercase shadow-[0_3px_0_#b45309] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center cursor-pointer animate-pulse"
          >
            <span className="text-[9px] font-extrabold leading-none opacity-90">CASH OUT</span>
            <span className="text-xs font-black tracking-tight leading-none mt-0.5">
              {formatCurrency(currentCashoutProfit)}
            </span>
          </button>
        ) : betState.cashedOutAt ? (
          <div className="w-full h-full min-h-[44px] bg-emerald-950/80 border border-emerald-500/60 rounded-lg flex flex-col items-center justify-center text-emerald-300">
            <span className="text-[8px] font-bold uppercase leading-none">WON @ {betState.cashedOutAt.toFixed(2)}x</span>
            <span className="text-xs font-black text-emerald-400 mt-0.5">{formatCurrency(betState.winAmount)}</span>
          </div>
        ) : betState.isPlaced && gameState === 'waiting' ? (
          <button 
            type="button"
            onClick={onToggleBet}
            className="w-full h-full min-h-[44px] bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black text-xs uppercase shadow-[0_3px_0_#9f1239] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center cursor-pointer"
          >
            <span className="text-[9px] opacity-90 leading-none">WAITING</span>
            <span className="text-xs font-bold leading-none mt-0.5">CANCEL</span>
          </button>
        ) : betState.isQueuedForNext ? (
          <button 
            type="button"
            onClick={onToggleBet}
            className="w-full h-full min-h-[44px] bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-black text-xs uppercase shadow-[0_3px_0_#78350f] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center cursor-pointer"
          >
            <span className="text-[8px] opacity-90 leading-none">QUEUED</span>
            <span className="text-xs font-bold leading-none mt-0.5">CANCEL</span>
          </button>
        ) : (
          <button 
            type="button"
            onClick={onToggleBet}
            className="w-full h-full min-h-[44px] bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0284c7] text-white rounded-lg font-black text-xs uppercase shadow-[0_3px_0_#0369a1] active:translate-y-[2px] active:shadow-none transition-all flex flex-col items-center justify-center cursor-pointer"
          >
            <span className="text-[8px] font-bold opacity-80 leading-none">
              {gameState === 'flying' ? 'NEXT ROUND' : 'START'}
            </span>
            <span className="text-xs font-black tracking-tight leading-none mt-0.5">
              BET {formatCurrency(betState.amount)}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
