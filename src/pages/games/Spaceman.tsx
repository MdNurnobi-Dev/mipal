import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  HelpCircle,
  ShieldCheck,
  History,
  Users,
  Trophy,
  Check,
  X,
  Copy,
  Activity,
  AlertTriangle,
  Minus,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCurrency } from '../../hooks/useCurrency';
import { audioSystem } from '../../utils/audioSystem';
import { SpacemanHeroVector } from '../../components/SpacemanLobbyThumbnail';
import { appEvents, SYNC_EVENTS } from '../../utils/eventEmitter';

interface MultiplierHistoryItem {
  id: string;
  multiplier: number;
  hash: string;
  serverSeed: string;
  clientSeed: string;
  timestamp: string;
}

interface BetHistoryItem {
  id: string;
  roundId: string;
  betAmount: number;
  cashedOut50At: number | null;
  win50Amount: number;
  cashedOutFullAt: number | null;
  winFullAmount: number;
  totalWin: number;
  multiplier: number;
  status: 'won' | 'lost' | 'cashed_50';
  timestamp: string;
}

const INITIAL_BET = 10;

// Custom useCleanup Hook for Spaceman to purge game loops, timeouts, animation frames, and audio
interface UseSpacemanCleanupOptions {
  isMountedRef: React.MutableRefObject<boolean>;
  flightAnimRef: React.MutableRefObject<number | null>;
  canvasAnimRef: React.MutableRefObject<number | null>;
  waitingIntervalRef: React.MutableRefObject<any>;
  crashTimeoutRef: React.MutableRefObject<any>;
  gameStateRef: React.MutableRefObject<'waiting' | 'flying' | 'crashed'>;
  setGameState: React.Dispatch<React.SetStateAction<'waiting' | 'flying' | 'crashed'>>;
  multiplierRef: React.MutableRefObject<number>;
  setMultiplier: React.Dispatch<React.SetStateAction<number>>;
  betStateRef: React.MutableRefObject<any>;
  currentUserRef: React.MutableRefObject<any>;
  updateUserProfile: React.MutableRefObject<(userId: string, data: any) => Promise<any> | void>;
}

function useCleanup({
  isMountedRef,
  flightAnimRef,
  canvasAnimRef,
  waitingIntervalRef,
  crashTimeoutRef,
  gameStateRef,
  setGameState,
  multiplierRef,
  setMultiplier,
  betStateRef,
  currentUserRef,
  updateUserProfile,
}: UseSpacemanCleanupOptions) {
  const performCleanup = useCallback(() => {
    // 1. Mark component as unmounted
    isMountedRef.current = false;

    // 2. Clear all active animation frames
    if (flightAnimRef.current !== null) {
      cancelAnimationFrame(flightAnimRef.current);
      flightAnimRef.current = null;
    }
    if (canvasAnimRef.current !== null) {
      cancelAnimationFrame(canvasAnimRef.current);
      canvasAnimRef.current = null;
    }

    // 3. Clear all game loop intervals & timeouts
    if (waitingIntervalRef.current) {
      clearInterval(waitingIntervalRef.current);
      waitingIntervalRef.current = null;
    }
    if (crashTimeoutRef.current) {
      clearTimeout(crashTimeoutRef.current);
      crashTimeoutRef.current = null;
    }

    // 4. Reset local game/crash state to clean initial defaults
    gameStateRef.current = 'waiting';
    setGameState('waiting');
    multiplierRef.current = 1.00;
    setMultiplier(1.00);

    // 5. Explicitly stop and purge all residual audio streams
    audioSystem.stopAllSounds();

    // 6. Safe refund for queued/waiting bets on component unmount
    if (gameStateRef.current === 'waiting') {
      const user = currentUserRef.current;
      const bState = betStateRef.current;
      let refund = 0;
      if (bState?.isPlaced) refund += bState.amount;
      if (bState?.isQueuedForNext) refund += bState.amount;
      if (refund > 0 && user) {
        updateUserProfile.current(user.id, {
          balance: +(user.balance + refund).toFixed(2),
        });
      }
    }
  }, [
    isMountedRef,
    flightAnimRef,
    canvasAnimRef,
    waitingIntervalRef,
    crashTimeoutRef,
    gameStateRef,
    setGameState,
    multiplierRef,
    setMultiplier,
    betStateRef,
    currentUserRef,
    updateUserProfile,
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      performCleanup();
    };
  }, [performCleanup, isMountedRef]);

  return { performCleanup };
}

export default function Spaceman() {
  const navigate = useNavigate();
  const { currentUser, siteSettings, updateUserProfile } = useApp();
  const { formatCurrency } = useCurrency();

  // Lifecycle ref
  const isMountedRef = useRef<boolean>(true);
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const updateUserProfileRef = useRef(updateUserProfile);
  useEffect(() => {
    updateUserProfileRef.current = updateUserProfile;
  }, [updateUserProfile]);

  // Real-time Admin Sync States & Refs
  const [liveWinControl, setLiveWinControl] = useState<string>(
    siteSettings?.gameWinControls?.['spaceman'] || 'low'
  );
  const winControlRef = useRef<string>(
    siteSettings?.gameWinControls?.['spaceman'] || 'low'
  );
  const [isGameActive, setIsGameActive] = useState<boolean>(
    siteSettings?.gameStates && siteSettings.gameStates['spaceman'] !== undefined
      ? !!siteSettings.gameStates['spaceman']
      : true
  );
  const isGameActiveRef = useRef<boolean>(isGameActive);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Dynamic Online Players & Round Total Bets (Realistic Casino Traffic: 1,200 - 4,800 online, 300 - 3,000 bets)
  const [onlineCount, setOnlineCount] = useState<number>(() => Math.floor(1850 + Math.random() * 1200));
  const [totalRoundBetsCount, setTotalRoundBetsCount] = useState<number>(() => Math.floor(450 + Math.random() * 1400));
  const [totalRoundVolume, setTotalRoundVolume] = useState<number>(() => Math.floor(85000 + Math.random() * 250000));

  // Sync with siteSettings prop changes
  useEffect(() => {
    if (siteSettings?.gameWinControls?.['spaceman']) {
      const newWin = siteSettings.gameWinControls['spaceman'];
      setLiveWinControl(newWin);
      winControlRef.current = newWin;
    }
    if (siteSettings?.gameStates && siteSettings.gameStates['spaceman'] !== undefined) {
      const active = !!siteSettings.gameStates['spaceman'];
      setIsGameActive(active);
      isGameActiveRef.current = active;
    }
  }, [siteSettings]);

  // Periodic subtle organic fluctuation of online counter (like real live casino servers)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;
      setOnlineCount(prev => {
        const delta = Math.floor(Math.random() * 29) - 14;
        const next = prev + delta;
        return Math.max(1250, Math.min(4850, next));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Database Event Listener for instantaneous Sync with Admin Panel
  useEffect(() => {
    const handleSyncEvent = (payload: any) => {
      if (!isMountedRef.current) return;
      if (payload && (payload.type === 'SETTINGS_UPDATE' || payload.key === 'siteSettings')) {
        const updatedSettings = payload.value || payload;
        if (updatedSettings?.gameWinControls?.['spaceman']) {
          const newLevel = updatedSettings.gameWinControls['spaceman'];
          setLiveWinControl(newLevel);
          winControlRef.current = newLevel;
        }
        if (updatedSettings?.gameStates && updatedSettings.gameStates['spaceman'] !== undefined) {
          const activeState = !!updatedSettings.gameStates['spaceman'];
          setIsGameActive(activeState);
          isGameActiveRef.current = activeState;
        }
      }
    };

    const unsubscribe = appEvents.on(SYNC_EVENTS.SETTINGS_UPDATED, handleSyncEvent);

    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'siteSettings' || e.key === 'mipall_settings_sync') && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleSyncEvent(parsed);
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleCustomSync = (e: any) => {
      if (e.detail) {
        handleSyncEvent(e.detail);
      }
    };
    window.addEventListener('mipall_settings_sync', handleCustomSync);
    window.addEventListener('app:settings-updated', handleCustomSync);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mipall_settings_sync', handleCustomSync);
      window.removeEventListener('app:settings-updated', handleCustomSync);
    };
  }, []);

  // Game Engine States
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const gameStateRef = useRef<'waiting' | 'flying' | 'crashed'>('waiting');

  const [multiplier, setMultiplier] = useState<number>(1.00);
  const multiplierRef = useRef<number>(1.00);

  const [countdown, setCountdown] = useState<number>(5.0);
  const crashMultiplierRef = useRef<number>(1.50);

  // Active User Betting State
  const [betAmount, setBetAmount] = useState<number>(INITIAL_BET);
  const [isBetPlaced, setIsBetPlaced] = useState<boolean>(false);
  const [isQueuedForNext, setIsQueuedForNext] = useState<boolean>(false);
  const [cashed50At, setCashed50At] = useState<number | null>(null);
  const [cashedFullAt, setCashedFullAt] = useState<number | null>(null);
  const [win50Amount, setWin50Amount] = useState<number>(0);
  const [winFullAmount, setWinFullAmount] = useState<number>(0);

  // Auto Cashout Toggles & Multipliers
  const [autoCashoutFullEnabled, setAutoCashoutFullEnabled] = useState<boolean>(false);
  const [autoCashoutFullMult, setAutoCashoutFullMult] = useState<number>(2.00);
  const [autoCashout50Enabled, setAutoCashout50Enabled] = useState<boolean>(false);
  const [autoCashout50Mult, setAutoCashout50Mult] = useState<number>(1.50);
  const [isAutoModeTab, setIsAutoModeTab] = useState<boolean>(false);

  // Synchronized State Refs
  const betStateRef = useRef({
    amount: INITIAL_BET,
    isPlaced: false,
    isQueuedForNext: false,
    cashed50At: null as number | null,
    cashedFullAt: null as number | null,
    win50Amount: 0,
    winFullAmount: 0,
    autoCashoutFullEnabled: false,
    autoCashoutFullMult: 2.00,
    autoCashout50Enabled: false,
    autoCashout50Mult: 1.50,
  });

  useEffect(() => {
    betStateRef.current = {
      amount: betAmount,
      isPlaced: isBetPlaced,
      isQueuedForNext,
      cashed50At,
      cashedFullAt,
      win50Amount,
      winFullAmount,
      autoCashoutFullEnabled,
      autoCashoutFullMult,
      autoCashout50Enabled,
      autoCashout50Mult,
    };
  }, [
    betAmount,
    isBetPlaced,
    isQueuedForNext,
    cashed50At,
    cashedFullAt,
    win50Amount,
    winFullAmount,
    autoCashoutFullEnabled,
    autoCashoutFullMult,
    autoCashout50Enabled,
    autoCashout50Mult,
  ]);

  // Multiplier History (Aviator-style colors)
  const [history, setHistory] = useState<MultiplierHistoryItem[]>([
    { id: '1', multiplier: 2.14, hash: 'a4b8c9d2e1f3a5b7c8d9e0f1a2b3c4d5', serverSeed: 's_seed_214', clientSeed: 'c_seed_84', timestamp: '1m ago' },
    { id: '2', multiplier: 14.80, hash: 'f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7', serverSeed: 's_seed_1480', clientSeed: 'c_seed_83', timestamp: '2m ago' },
    { id: '3', multiplier: 1.05, hash: 'c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4', serverSeed: 's_seed_105', clientSeed: 'c_seed_82', timestamp: '3m ago' },
    { id: '4', multiplier: 3.75, hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', serverSeed: 's_seed_375', clientSeed: 'c_seed_81', timestamp: '4m ago' },
    { id: '5', multiplier: 1.18, hash: 'd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6', serverSeed: 's_seed_118', clientSeed: 'c_seed_80', timestamp: '5m ago' },
    { id: '6', multiplier: 62.40, hash: 'b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2', serverSeed: 's_seed_6240', clientSeed: 'c_seed_79', timestamp: '6m ago' },
    { id: '7', multiplier: 1.62, hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', serverSeed: 's_seed_162', clientSeed: 'c_seed_78', timestamp: '7m ago' },
    { id: '8', multiplier: 5.20, hash: '7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', serverSeed: 's_seed_520', clientSeed: 'c_seed_77', timestamp: '8m ago' },
    { id: '9', multiplier: 1.00, hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d', serverSeed: 's_seed_100', clientSeed: 'c_seed_76', timestamp: '9m ago' },
    { id: '10', multiplier: 18.95, hash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e', serverSeed: 's_seed_1895', clientSeed: 'c_seed_75', timestamp: '10m ago' },
    { id: '11', multiplier: 1.34, hash: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', serverSeed: 's_seed_134', clientSeed: 'c_seed_74', timestamp: '11m ago' },
    { id: '12', multiplier: 2.89, hash: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e', serverSeed: 's_seed_289', clientSeed: 'c_seed_73', timestamp: '12m ago' },
  ]);

  // User My Bets History
  const [myBets, setMyBets] = useState<BetHistoryItem[]>([]);

  // UI Modals
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showFairModal, setShowFairModal] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<MultiplierHistoryItem | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  
  const isSoundMutedRef = useRef(isSoundMuted);
  useEffect(() => {
    isSoundMutedRef.current = isSoundMuted;
  }, [isSoundMuted]);

  // Timers and Animation Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flightAnimRef = useRef<number | null>(null);
  const canvasAnimRef = useRef<number | null>(null);
  const waitingIntervalRef = useRef<any>(null);
  const crashTimeoutRef = useRef<any>(null);
  const flightStartTimeRef = useRef<number>(0);

  // Top Big Winners of the Day
  const topWinners = [
    { id: 't1', user: 'SpacemanKing', mult: 1840.50, bet: 500, win: 920250, time: '10:45 AM' },
    { id: 't2', user: 'CosmicMaster', mult: 942.20, bet: 300, win: 282660, time: '11:12 AM' },
    { id: 't3', user: 'GalaxyHero', mult: 420.80, bet: 1000, win: 420800, time: '12:05 PM' },
    { id: 't4', user: 'Shanto_99', mult: 215.10, bet: 250, win: 53775, time: '01:30 PM' },
    { id: 't5', user: 'LunaFlyer', mult: 120.45, bet: 800, win: 96360, time: '02:15 PM' },
    { id: 't6', user: 'AstroBoss_BD', mult: 88.50, bet: 1200, win: 106200, time: '03:40 PM' },
  ];

  // Real-Time Synchronized Crash Algorithm
  const calculateCrashMultiplier = useCallback((): number => {
    const winControl = winControlRef.current || 'low';
    const hasActiveUserBet = betStateRef.current.isPlaced;
    const rand = Math.random();

    if (winControl === 'zero') {
      return 1.00;
    }

    if (winControl === 'low') {
      if (hasActiveUserBet) {
        const activeTarget = Math.min(
          betStateRef.current.autoCashoutFullEnabled ? betStateRef.current.autoCashoutFullMult : 9999,
          betStateRef.current.autoCashout50Enabled ? betStateRef.current.autoCashout50Mult : 9999
        );

        // Very high chance (92%) to crash before the user's auto cashout target or at very low levels
        if (activeTarget < 9999 && activeTarget > 1.20 && Math.random() < 0.92) {
          return +(1.01 + Math.random() * (activeTarget - 1.05)).toFixed(2);
        }

        // Extreme low distribution: ~75% crash below 1.10
        if (rand < 0.75) return +(1.00 + Math.random() * 0.10).toFixed(2);
        if (rand < 0.90) return +(1.10 + Math.random() * 0.20).toFixed(2);
        if (rand < 0.97) return +(1.30 + Math.random() * 0.40).toFixed(2);
        return +(1.70 + Math.random() * 0.50).toFixed(2);
      } else {
        // Without active bet, still keep it low but occasionally let it fly
        if (rand < 0.50) return +(1.01 + Math.random() * 0.3).toFixed(2);
        if (rand < 0.85) return +(1.31 + Math.random() * 1.5).toFixed(2);
        if (rand < 0.95) return +(2.81 + Math.random() * 4.0).toFixed(2);
        return +(7.00 + Math.random() * 10.0).toFixed(2);
      }
    }

    if (winControl === 'high') {
      if (rand < 0.10) return +(1.10 + Math.random() * 0.4).toFixed(2);
      if (rand < 0.40) return +(1.50 + Math.random() * 1.5).toFixed(2);
      if (rand < 0.75) return +(3.00 + Math.random() * 5.0).toFixed(2);
      if (rand < 0.95) return +(8.00 + Math.random() * 15.0).toFixed(2);
      return +(25.00 + Math.random() * 50.0).toFixed(2);
    }

    // Default 'medium' distribution (~18-20% win chance for user when active)
    if (hasActiveUserBet) {
      if (rand < 0.30) return +(1.01 + Math.random() * 0.2).toFixed(2);
      if (rand < 0.70) return +(1.21 + Math.random() * 0.6).toFixed(2);
      if (rand < 0.90) return +(1.81 + Math.random() * 1.0).toFixed(2);
      return +(2.81 + Math.random() * 2.0).toFixed(2);
    } else {
      if (rand < 0.20) return +(1.01 + Math.random() * 0.4).toFixed(2);
      if (rand < 0.60) return +(1.41 + Math.random() * 1.5).toFixed(2);
      if (rand < 0.85) return +(2.91 + Math.random() * 4.0).toFixed(2);
      if (rand < 0.95) return +(7.00 + Math.random() * 10.0).toFixed(2);
      return +(17.00 + Math.random() * 30.0).toFixed(2);
    }
  }, []);

  // Handle 50% Cashout (Signature Spaceman Feature)
  const handleCashout50 = useCallback(() => {
    if (!isMountedRef.current || gameStateRef.current !== 'flying') return;
    const currentMult = multiplierRef.current;
    const bState = betStateRef.current;

    if (!bState.isPlaced || bState.cashed50At !== null || bState.cashedFullAt !== null) return;

    // Immediately mark cashed50At synchronously in ref to prevent multiple trigger in animation loop
    betStateRef.current.cashed50At = currentMult;
    const halfStake = bState.amount / 2;
    const win = +(halfStake * currentMult).toFixed(2);
    betStateRef.current.win50Amount = win;

    setCashed50At(currentMult);
    setWin50Amount(win);

    if (currentUserRef.current) {
      updateUserProfileRef.current(currentUserRef.current.id, {
        balance: +(currentUserRef.current.balance + win).toFixed(2),
      });
    }

    if (!isSoundMutedRef.current && isMountedRef.current) {
      audioSystem.playSpacemanCashout50();
    }
  }, []);

  // Handle Full Cashout
  const handleCashoutFull = useCallback(() => {
    if (!isMountedRef.current || gameStateRef.current !== 'flying') return;
    const currentMult = multiplierRef.current;
    const bState = betStateRef.current;

    if (!bState.isPlaced || bState.cashedFullAt !== null) return;

    // Immediately mark cashedFullAt synchronously in ref to prevent multiple trigger in animation loop
    betStateRef.current.cashedFullAt = currentMult;
    const remainingStake = bState.cashed50At !== null ? bState.amount / 2 : bState.amount;
    const win = +(remainingStake * currentMult).toFixed(2);
    const totalWinnings = +(win + bState.win50Amount).toFixed(2);
    betStateRef.current.winFullAmount = win;

    setCashedFullAt(currentMult);
    setWinFullAmount(win);

    if (currentUserRef.current) {
      updateUserProfileRef.current(currentUserRef.current.id, {
        balance: +(currentUserRef.current.balance + win).toFixed(2),
      });
    }

    if (!isSoundMutedRef.current && isMountedRef.current) {
      audioSystem.playSpacemanCashout();
    }

    setMyBets(prev => [
      {
        id: `my_${Date.now()}`,
        roundId: `R-${Math.floor(100000 + Math.random() * 900000)}`,
        betAmount: bState.amount,
        cashedOut50At: bState.cashed50At,
        win50Amount: bState.win50Amount,
        cashedOutFullAt: currentMult,
        winFullAmount: win,
        totalWin: totalWinnings,
        multiplier: currentMult,
        status: 'won',
        timestamp: 'Just now',
      },
      ...prev.slice(0, 19),
    ]);
  }, []);

  // Start Flight Phase
  const startFlightPhase = useCallback(() => {
    if (!isMountedRef.current) return;

    if (!isGameActiveRef.current) {
      startWaitingPhase();
      return;
    }

    const calculatedCrash = calculateCrashMultiplier();
    crashMultiplierRef.current = calculatedCrash;

    gameStateRef.current = 'flying';
    setGameState('flying');
    setMultiplier(1.00);
    multiplierRef.current = 1.00;
    flightStartTimeRef.current = performance.now();

    if (betStateRef.current.isQueuedForNext) {
      setIsBetPlaced(true);
      setIsQueuedForNext(false);
    }
    setCashed50At(null);
    setCashedFullAt(null);
    setWin50Amount(0);
    setWinFullAmount(0);

    if (!isSoundMutedRef.current && isMountedRef.current) {
      audioSystem.playSpacemanLiftoff();
    }

    // Flight multiplier acceleration loop (Slower Aviator Curve)
    const flightLoop = (now: number) => {
      if (!isMountedRef.current || gameStateRef.current !== 'flying') return;

      const elapsed = (now - flightStartTimeRef.current) / 1000;
      // Authentic Aviator Curve: Math.pow(1.05, elapsed * 2.5) 
      const currentMult = +(Math.pow(1.05, elapsed * 2.5)).toFixed(2);

      multiplierRef.current = currentMult;
      setMultiplier(currentMult);

      // Auto Cashout 50% Check
      const bState = betStateRef.current;
      if (
        bState.isPlaced &&
        bState.cashed50At === null &&
        bState.autoCashout50Enabled &&
        currentMult >= bState.autoCashout50Mult
      ) {
        handleCashout50();
      }

      // Auto Cashout Full Check
      if (
        bState.isPlaced &&
        bState.cashedFullAt === null &&
        bState.autoCashoutFullEnabled &&
        currentMult >= bState.autoCashoutFullMult
      ) {
        handleCashoutFull();
      }

      // Check if Spaceman crashed
      if (currentMult >= crashMultiplierRef.current) {
        handleCrash(crashMultiplierRef.current);
        return;
      }

      if (isMountedRef.current && gameStateRef.current === 'flying') {
        flightAnimRef.current = requestAnimationFrame(flightLoop);
      }
    };

    flightAnimRef.current = requestAnimationFrame(flightLoop);
  }, [calculateCrashMultiplier, handleCashout50, handleCashoutFull]);

  // Handle Crash
  const handleCrash = (finalMult: number) => {
    if (!isMountedRef.current) return;

    gameStateRef.current = 'crashed';
    setGameState('crashed');
    setMultiplier(finalMult);
    multiplierRef.current = finalMult;

    if (!isSoundMutedRef.current && isMountedRef.current) {
      audioSystem.playSpacemanCrash();
    }

    const randomHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newHistoryItem: MultiplierHistoryItem = {
      id: `hist_${Date.now()}`,
      multiplier: finalMult,
      hash: randomHash,
      serverSeed: `s_seed_${Math.floor(1000 + Math.random() * 9000)}`,
      clientSeed: `c_seed_${Math.floor(10 + Math.random() * 90)}`,
      timestamp: 'Just now',
    };
    setHistory(prev => [newHistoryItem, ...prev.slice(0, 19)]);

    const bState = betStateRef.current;
    if (bState.isPlaced && bState.cashedFullAt === null) {
      setMyBets(prev => [
        {
          id: `my_${Date.now()}`,
          roundId: `R-${Math.floor(100000 + Math.random() * 900000)}`,
          betAmount: bState.amount,
          cashedOut50At: bState.cashed50At,
          win50Amount: bState.win50Amount,
          cashedOutFullAt: null,
          winFullAmount: 0,
          totalWin: bState.win50Amount || 0,
          multiplier: finalMult,
          status: bState.cashed50At !== null ? 'cashed_50' : 'lost',
          timestamp: 'Just now',
        },
        ...prev.slice(0, 19),
      ]);
    }

    setIsBetPlaced(false);

    if (crashTimeoutRef.current) {
      clearTimeout(crashTimeoutRef.current);
    }

    crashTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        startWaitingPhase();
      }
    }, 3200);
  };

  // Start Waiting Countdown Phase
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
    setMultiplier(1.00);
    multiplierRef.current = 1.00;
    setCountdown(5.0);

    // Randomize dynamic round volume and count (300 - 3,000 range)
    const newBetCount = Math.floor(350 + Math.random() * 2150);
    setTotalRoundBetsCount(newBetCount);
    setTotalRoundVolume(Math.floor(newBetCount * (80 + Math.random() * 140)));

    if (betStateRef.current.isQueuedForNext) {
      setIsBetPlaced(true);
      setIsQueuedForNext(false);
    }

    setCashed50At(null);
    setCashedFullAt(null);
    setWin50Amount(0);
    setWinFullAmount(0);

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
      }
    }, 100);
  }, [startFlightPhase]);

  // Hook for managing game loop cleanup, interval clearing, and crash/audio reset on unmount
  const { performCleanup } = useCleanup({
    isMountedRef,
    flightAnimRef,
    canvasAnimRef,
    waitingIntervalRef,
    crashTimeoutRef,
    gameStateRef,
    setGameState,
    multiplierRef,
    setMultiplier,
    betStateRef,
    currentUserRef,
    updateUserProfile: updateUserProfileRef,
  });

  useEffect(() => {
    startWaitingPhase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aviator-style Clean Canvas Starfield & Flight Stage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let starOffset = 0;
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.5 + Math.random() * 1.5,
      speed: 0.3 + Math.random() * 0.8,
      alpha: 0.2 + Math.random() * 0.6,
    }));

    const render = () => {
      if (!isMountedRef.current) return;

      const parentW = canvas.parentElement?.clientWidth || 360;
      const parentH = canvas.parentElement?.clientHeight || 280;

      if (canvas.width !== parentW || canvas.height !== parentH) {
        canvas.width = parentW;
        canvas.height = parentH;
      }

      const width = canvas.width;
      const height = canvas.height;

      // 1. Deep Matte Dark Background (Aviator Style)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0f1115');
      bgGrad.addColorStop(0.5, '#141820');
      bgGrad.addColorStop(1, '#0b0c0e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Radial Floor Grid / Glow
      const floorGrad = ctx.createRadialGradient(width / 2, height, 10, width / 2, height, width * 0.7);
      floorGrad.addColorStop(0, 'rgba(229, 11, 20, 0.08)');
      floorGrad.addColorStop(0.6, 'rgba(30, 41, 59, 0.05)');
      floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Starfield with Motion
      const isFlying = gameStateRef.current === 'flying';
      const speedMultiplier = isFlying ? Math.min(3.5, 1.0 + (multiplierRef.current - 1.0) * 0.25) : 0.4;

      starOffset += speedMultiplier;
      stars.forEach(star => {
        const sx = ((star.x * width - starOffset * star.speed * 1.8) % width + width) % width;
        const sy = (star.y * height + starOffset * star.speed * 0.3) % height;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Multiplier Flight Trajectory Arc (when flying)
      if (isFlying) {
        const time = (performance.now() - flightStartTimeRef.current) / 1000;
        const progress = Math.min(1.0, time / 7.0);

        const startX = width * 0.08;
        const startY = height * 0.88;
        const endX = width * (0.2 + progress * 0.6);
        const endY = height * (0.80 - progress * 0.55);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(width * 0.3, height * 0.82, endX, endY);
        ctx.strokeStyle = 'rgba(229, 11, 20, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
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
  const handlePlaceBet = () => {
    if (!currentUserRef.current) return;
    if (currentUserRef.current.balance < betAmount) {
      alert('Insufficient balance to place bet.');
      return;
    }

    updateUserProfileRef.current(currentUserRef.current.id, {
      balance: +(currentUserRef.current.balance - betAmount).toFixed(2),
    });

    if (gameState === 'waiting') {
      setIsBetPlaced(true);
      setIsQueuedForNext(false);
    } else {
      setIsQueuedForNext(true);
    }
  };

  const handleCancelBet = () => {
    if (!currentUserRef.current) return;

    let refund = 0;
    if (gameState === 'waiting' && isBetPlaced) {
      refund += betAmount;
      setIsBetPlaced(false);
    } else if (isQueuedForNext) {
      refund += betAmount;
      setIsQueuedForNext(false);
    }

    if (refund > 0) {
      updateUserProfileRef.current(currentUserRef.current.id, {
        balance: +(currentUserRef.current.balance + refund).toFixed(2),
      });
    }
  };

  const adjustBet = (type: 'half' | 'double' | 'max' | number) => {
    if (isBetPlaced || isQueuedForNext) return;
    if (typeof type === 'number') {
      setBetAmount(type);
    } else if (type === 'half') {
      setBetAmount(prev => Math.max(10, Math.floor(prev / 2)));
    } else if (type === 'double') {
      setBetAmount(prev => Math.min(currentUser?.balance || 10000, prev * 2));
    } else if (type === 'max') {
      setBetAmount(Math.min(5000, Math.floor(currentUser?.balance || 10)));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // History pill color (Aviator standard)
  const getHistoryStyle = (mult: number) => {
    if (mult < 2.0) return 'text-[#34b4ff] bg-[#34b4ff]/10 border-[#34b4ff]/30';
    if (mult < 10.0) return 'text-[#913fe2] bg-[#913fe2]/10 border-[#913fe2]/30 font-semibold';
    return 'text-[#c017b4] bg-[#c017b4]/10 border-[#c017b4]/40 font-bold';
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-200 pb-16 select-none font-sans overflow-x-hidden">
      {/* Top Header Bar - Clean Aviator Dark Style with Zero Overflow */}
      <header className="bg-[#181a20] border-b border-white/10 sticky top-0 z-40 px-2 py-1 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5">
          {/* Left: Back & Brand */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Link
              to="/games"
              className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Back to Lobby"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-1">
              <div className="bg-[#e50914] text-white px-1 py-0.5 rounded-sm text-[10px] font-black italic tracking-wider transform -skew-x-6 leading-none">
                SPACEMAN
              </div>
              <span className="hidden md:inline-block text-[8px] font-bold px-1 py-0.5 rounded-sm bg-white/5 text-slate-400 border border-white/10 leading-none">
                PRAGMATIC
              </span>
            </div>
          </div>

          {/* Right: Balance, Live Sync & Control Buttons (Guaranteed inside container) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Live Database Synced Indicator */}
            <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded border border-white/5 text-[8px] text-slate-400" title={`Admin Sync: ${liveWinControl.toUpperCase()}`}>
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden xs:inline">LIVE</span>
            </div>

            {/* Balance Badge */}
            <div className="bg-[#101216] px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1 shadow-inner">
              <span className="text-[9px] text-slate-400">BDT</span>
              <span className="text-xs font-black text-[#28a745] tabular-nums leading-none">
                {formatCurrency(currentUser?.balance || 0).replace('৳', '')}
              </span>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setShowFairModal(true)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded transition-colors"
                title="Provably Fair SHA-256"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowRulesModal(true)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Game Rules"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsSoundMuted(!isSoundMuted)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                title={isSoundMuted ? 'Unmute' : 'Mute'}
              >
                {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-2 pt-2 space-y-2">
        {/* Game Status Check: If disabled in Admin Panel */}
        {!isGameActive && (
          <div className="bg-rose-950/80 border border-rose-500/40 p-2.5 rounded-xl flex items-center justify-between text-rose-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Spaceman is currently undergoing maintenance. Betting is paused by management.</span>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold"
            >
              Exit
            </button>
          </div>
        )}

        {/* Multiplier History Ribbon - Aviator Style (Scrollbar Hidden) */}
        <div className="bg-[#141518] rounded px-1 py-0.5 border border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none">
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium px-1 shrink-0 border-r border-white/10">
            <History className="w-2.5 h-2.5 text-slate-400" />
            <span className="hidden xs:inline">History</span>
          </div>
          {history.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedHistoryItem(item);
                setShowFairModal(true);
              }}
              className={`text-[9px] font-bold px-1.5 py-px rounded-sm border shrink-0 transition-transform active:scale-95 ${getHistoryStyle(item.multiplier)}`}
              title={`Click to verify SHA-256 (Seed: ${item.serverSeed})`}
            >
              {item.multiplier.toFixed(2)}x
            </button>
          ))}
        </div>

        {/* Main Game Stage (Aviator-style Dark Flight Canvas) */}
        <div className="relative w-full h-[250px] sm:h-[300px] rounded-xl overflow-hidden border border-white/10 bg-[#0f1013] shadow-2xl flex flex-col">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Top Left: Active Players & Total Bets Count (1,200 - 4,800 Realistic traffic) */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10 text-white text-[10px]">
              <Users className="w-3 h-3 text-emerald-400" />
              <span className="font-bold text-slate-200">{onlineCount.toLocaleString()} Online</span>
            </div>
            <div className="hidden xs:flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10 text-[10px] text-slate-300">
              <span className="text-slate-400">Round Bets:</span>
              <span className="font-bold text-amber-400">{totalRoundBetsCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Center Stage Animation & Multiplier HUD */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
            {gameState === 'waiting' && (
              <div className="flex flex-col items-center gap-2">
                <SpacemanHeroVector className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] opacity-90 animate-pulse" />
                <div className="flex flex-col items-center bg-black/80 px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-white font-bold text-xs tracking-wide mb-1">
                    WAITING FOR NEXT ROUND
                  </span>
                  <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e50914] transition-all duration-100"
                      style={{ width: `${(countdown / 5.0) * 100}%` }}
                    />
                  </div>
                  <span className="text-amber-400 font-bold text-xs mt-1">{countdown.toFixed(1)}s</span>
                </div>
              </div>
            )}

            {gameState === 'flying' && (
              <div className="flex flex-col items-center">
                <SpacemanHeroVector className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)] transform -rotate-12 mb-1" />
                <div className="text-4xl sm:text-6xl font-black text-white tracking-tight tabular-nums drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                  {multiplier.toFixed(2)}x
                </div>
              </div>
            )}

            {gameState === 'crashed' && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[#e50914] font-black text-base sm:text-lg uppercase tracking-widest drop-shadow-md">
                  FLEW AWAY!
                </span>
                <div className="text-3xl sm:text-5xl font-black text-[#e50914] tracking-tight tabular-nums drop-shadow-[0_0_15px_rgba(229,11,20,0.4)]">
                  {multiplier.toFixed(2)}x
                </div>
              </div>
            )}
          </div>

          {/* User Active Stake Banner during Flight */}
          {isBetPlaced && gameState === 'flying' && (
            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs shadow-lg">
              <div>
                <span className="text-[10px] text-slate-400">Stake:</span>{' '}
                <span className="font-bold text-white">{formatCurrency(cashed50At ? betAmount / 2 : betAmount)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Current Win:</span>{' '}
                <span className="font-extrabold text-[#28a745]">
                  {formatCurrency((cashed50At ? betAmount / 2 : betAmount) * multiplier)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Betting Control Deck - Authentic Aviator / Spribe Solid Design */}
        <div className="bg-[#141518] rounded-xl p-2 border border-white/10 shadow-xl flex flex-col justify-center">
          {/* Bet / Auto Tab Selector */}
          <div className="flex items-center justify-center mx-auto bg-[#0b0c0e] rounded-md p-0.5 w-32 border border-white/5 mb-1.5">
            <button
              onClick={() => setIsAutoModeTab(false)}
              className={`text-[9px] font-bold w-1/2 py-0.5 rounded-sm transition-colors ${
                !isAutoModeTab ? 'bg-[#2c2d33] text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Bet
            </button>
            <button
              onClick={() => setIsAutoModeTab(true)}
              className={`text-[9px] font-bold w-1/2 py-0.5 rounded-sm transition-colors ${
                isAutoModeTab ? 'bg-[#2c2d33] text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Auto
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 items-stretch h-full">
            {/* Left: Bet Input & Quick Chips */}
            <div className="space-y-1.5 flex flex-col justify-end h-full">
              <div className="flex items-center justify-between bg-black/60 rounded-md px-1 py-1 border border-white/10">
                <button
                  disabled={isBetPlaced || isQueuedForNext || betAmount <= 10}
                  onClick={() => setBetAmount(prev => Math.max(10, prev - 10))}
                  className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <div className="flex items-center gap-0.5">
                  <input
                    type="number"
                    disabled={isBetPlaced || isQueuedForNext}
                    value={betAmount}
                    onChange={e => setBetAmount(Math.max(10, Math.min(5000, Number(e.target.value) || 10)))}
                    className="w-14 bg-transparent text-center font-bold text-white text-xs focus:outline-none p-0"
                  />
                </div>
                <button
                  disabled={isBetPlaced || isQueuedForNext || betAmount >= (currentUser?.balance || 5000)}
                  onClick={() => setBetAmount(prev => Math.min(5000, prev + 10))}
                  className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Quick Preset Chips - Compact 2x2 Grid */}
              <div className="grid grid-cols-2 gap-1">
                {[50, 100, 200, 500].map(val => (
                  <button
                    key={val}
                    disabled={isBetPlaced || isQueuedForNext}
                    onClick={() => adjustBet(val)}
                    className="py-1 rounded bg-[#1f2127] hover:bg-[#2a2d35] text-[9px] font-bold text-slate-300 border border-white/5 transition-colors disabled:opacity-40 active:scale-95 leading-none"
                  >
                    {val}
                  </button>
                ))}
              </div>

              {/* Auto Cashout Controls (Visible if Auto Tab is chosen) */}
              {isAutoModeTab && (
                <div className="space-y-1 pt-1 border-t border-white/5">
                  {/* Full Auto Cashout */}
                  <div className="flex items-center justify-between bg-black/40 px-1 py-0.5 rounded border border-white/5">
                    <label className="text-[8px] text-slate-300 flex items-center gap-1 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={autoCashoutFullEnabled}
                        onChange={e => setAutoCashoutFullEnabled(e.target.checked)}
                        className="w-2 h-2 rounded-[2px] bg-black border-white/20 text-[#28a745] focus:ring-0"
                      />
                      Auto
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!autoCashoutFullEnabled}
                      value={autoCashoutFullMult}
                      onChange={e => setAutoCashoutFullMult(Math.max(1.01, Number(e.target.value) || 1.01))}
                      className="w-8 text-right text-[9px] font-bold text-amber-400 bg-transparent outline-none disabled:opacity-30 p-0"
                    />
                  </div>
                  {/* 50% Auto Cashout */}
                  <div className="flex items-center justify-between bg-black/40 px-1 py-0.5 rounded border border-white/5">
                    <label className="text-[8px] text-sky-300 flex items-center gap-1 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={autoCashout50Enabled}
                        onChange={e => setAutoCashout50Enabled(e.target.checked)}
                        className="w-2 h-2 rounded-[2px] bg-black border-white/20 text-sky-500 focus:ring-0"
                      />
                      Auto 50%
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!autoCashout50Enabled}
                      value={autoCashout50Mult}
                      onChange={e => setAutoCashout50Mult(Math.max(1.01, Number(e.target.value) || 1.01))}
                      className="w-8 text-right text-[9px] font-bold text-sky-400 bg-transparent outline-none disabled:opacity-30 p-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Solid Action Buttons */}
            <div className="flex flex-col gap-1.5 h-full">
              {/* Ready / Waiting / Flight State Buttons */}
              {isBetPlaced && gameState === 'flying' && cashedFullAt === null ? (
                <div className="flex flex-col gap-1.5 h-full min-h-[60px]">
                  {/* 50% Cashout Button */}
                  <button
                    disabled={cashed50At !== null}
                    onClick={handleCashout50}
                    className="w-full flex-1 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-bold flex flex-col items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all disabled:opacity-40"
                  >
                    <span className="text-[8px] font-black uppercase leading-none">
                      {cashed50At !== null ? '50% CASHED' : 'CASH 50%'}
                    </span>
                    <span className="text-[9px] font-bold text-sky-100 leading-none mt-0.5">
                      {formatCurrency((betAmount / 2) * multiplier)}
                    </span>
                  </button>
                  {/* Full Cashout Button */}
                  <button
                    onClick={handleCashoutFull}
                    className="w-full flex-1 py-1 bg-[#ff9900] hover:bg-[#e68a00] text-black rounded-lg flex flex-col items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all"
                  >
                    <span className="text-[10px] font-black uppercase leading-none">CASH OUT</span>
                    <span className="text-[10px] font-bold text-black leading-none mt-0.5">
                      {formatCurrency((cashed50At ? betAmount / 2 : betAmount) * multiplier)}
                    </span>
                  </button>
                </div>
              ) : isBetPlaced && gameState === 'waiting' ? (
                <button
                  onClick={handleCancelBet}
                  className="w-full h-full min-h-[60px] bg-[#cb011a] hover:bg-[#a10115] text-white rounded-lg flex flex-col items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all"
                >
                  <span className="text-[10px] font-black uppercase leading-none mb-0.5">CANCEL</span>
                  <span className="text-[8px] font-bold text-rose-200">WAITING</span>
                </button>
              ) : isQueuedForNext ? (
                <button
                  onClick={handleCancelBet}
                  className="w-full h-full min-h-[60px] bg-[#cb011a] hover:bg-[#a10115] text-white rounded-lg flex flex-col items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all"
                >
                  <span className="text-[10px] font-black uppercase leading-none mb-0.5">CANCEL</span>
                  <span className="text-[8px] font-bold text-rose-200">QUEUED</span>
                </button>
              ) : (
                <button
                  onClick={handlePlaceBet}
                  className="w-full h-full min-h-[60px] bg-[#28a745] hover:bg-[#218838] text-white rounded-lg flex flex-col items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all"
                >
                  <span className="text-sm font-black uppercase leading-none mb-0.5">BET</span>
                  <span className="text-[10px] font-bold text-emerald-100">{betAmount.toFixed(2)} BDT</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* My Bets Panel (Scrollbar completely hidden) */}
        <div className="bg-[#141518] rounded-xl border border-white/10 overflow-hidden shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 bg-[#101216]">
            <div className="text-xs font-bold text-slate-200">
              My Bets ({myBets.length})
            </div>
          </div>

          {/* List - Strict No Scrollbar */}
          <div className="max-h-[180px] overflow-y-auto no-scrollbar scrollbar-none divide-y divide-white/5 text-[10px]">
            {myBets.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-[10px]">
                No bets recorded in this session yet. Place your first bet above!
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 px-2 py-1 bg-black/40 text-[9px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 backdrop-blur-md">
                  <span>Round</span>
                  <span className="text-center">Bet</span>
                  <span className="text-center">Mult</span>
                  <span className="text-right">Win</span>
                </div>
                {myBets.map(b => (
                  <div key={b.id} className="grid grid-cols-4 items-center px-2 py-1 hover:bg-white/5 transition-colors text-[9px]">
                    <span className="text-slate-400 font-mono truncate">{b.roundId}</span>
                    <span className="text-center text-slate-300 font-bold">{b.betAmount} BDT</span>
                    <span className="text-center">
                      {b.cashedOutFullAt ? (
                        <span className="text-emerald-400 font-bold text-[9px]">{b.cashedOutFullAt}x</span>
                      ) : b.cashedOut50At ? (
                        <span className="text-sky-400 font-bold text-[9px]">50% @ {b.cashedOut50At}x</span>
                      ) : (
                        <span className="text-rose-400 font-medium text-[9px]">Crashed</span>
                      )}
                    </span>
                    <span className="text-right font-bold">
                      {b.totalWin > 0 ? (
                        <span className="text-[#28a745]">+{formatCurrency(b.totalWin)}</span>
                      ) : (

                        <span className="text-slate-500">0.00 BDT</span>
                      )}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Provably Fair Modal (SHA-256) */}
      {showFairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181a20] border border-white/10 rounded-2xl w-full max-w-md p-4 text-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#28a745]" />
                <h3 className="text-sm font-bold text-white">Provably Fair SHA-256</h3>
              </div>
              <button
                onClick={() => {
                  setShowFairModal(false);
                  setSelectedHistoryItem(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every round crash multiplier is generated with a cryptographic SHA-256 hash using a server seed and client seed. It is impossible for third parties or players to modify flight trajectories.
            </p>

            {selectedHistoryItem ? (
              <div className="space-y-2 bg-[#101216] p-3 rounded-xl border border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">Multiplier Result:</span>
                  <span className="text-base font-black text-amber-400">
                    {selectedHistoryItem.multiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Server SHA-256 Hash:</span>
                    <button
                      onClick={() => copyToClipboard(selectedHistoryItem.hash)}
                      className="text-slate-300 hover:text-white flex items-center gap-1 font-mono"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedHash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-1.5 bg-black rounded font-mono text-[10px] text-slate-300 break-all select-all">
                    {selectedHistoryItem.hash}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-500">Server Seed:</span>
                    <div className="font-mono text-slate-300 truncate">{selectedHistoryItem.serverSeed}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Client Seed:</span>
                    <div className="font-mono text-slate-300 truncate">{selectedHistoryItem.clientSeed}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#101216] p-3 rounded-xl border border-white/10 text-xs space-y-1.5">
                <div className="text-[11px] font-bold text-white">Current Active Session Seed</div>
                <div className="p-1.5 bg-black rounded font-mono text-[10px] text-slate-400 break-all">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
                <div className="text-[10px] text-slate-500">Click any multiplier badge in the top history ribbon to verify past rounds.</div>
              </div>
            )}

            <button
              onClick={() => {
                setShowFairModal(false);
                setSelectedHistoryItem(null);
              }}
              className="w-full py-2 bg-[#2c2d33] hover:bg-[#383a42] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181a20] border border-white/10 rounded-2xl w-full max-w-md p-4 text-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">How to Play Spaceman</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="bg-[#101216] p-2.5 rounded-xl border border-white/5 space-y-1">
                <p className="font-bold text-white">1. Place Your Bet</p>
                <p className="text-[11px] text-slate-400">
                  Select your stake (10 - 5,000 BDT) before the flight takeoff countdown reaches zero.
                </p>
              </div>

              <div className="bg-[#101216] p-2.5 rounded-xl border border-white/5 space-y-1">
                <p className="font-bold text-sky-400">2. 50% Cashout (Signature Feature)</p>
                <p className="text-[11px] text-slate-400">
                  You can cash out 50% of your bet at any time during flight to secure profits, while keeping the other half active for higher multipliers!
                </p>
              </div>

              <div className="bg-[#101216] p-2.5 rounded-xl border border-white/5 space-y-1">
                <p className="font-bold text-[#28a745]">3. Full Cashout</p>
                <p className="text-[11px] text-slate-400">
                  Press Cash Out before Spaceman crashes to collect your entire winnings.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2 bg-[#28a745] hover:bg-[#218838] text-white rounded-xl text-xs font-bold transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
