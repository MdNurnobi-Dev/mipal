import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Settings, RotateCcw, Zap, Wifi, Coins, Volume2, VolumeX, Sparkles, HelpCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { audioSystem } from '../../utils/audioSystem';
import { gameApi, WinControlLevel } from '../../api/gameApi';

// Authentic JILI Fortune Gems Symbols
export interface GemSymbol {
  id: 'WILD' | 'RUBY' | 'SAPPHIRE' | 'EMERALD' | 'A' | 'K' | 'Q' | 'J';
  name: string;
  payoutMultiplier: number;
  type: 'wild' | 'high' | 'low';
  color: string;
}

const SYMBOLS: GemSymbol[] = [
  { id: 'WILD', name: 'Garuda Wild', payoutMultiplier: 25, type: 'wild', color: '#ffb300' },
  { id: 'RUBY', name: 'Red Ruby', payoutMultiplier: 20, type: 'high', color: '#ef4444' },
  { id: 'SAPPHIRE', name: 'Blue Sapphire', payoutMultiplier: 15, type: 'high', color: '#3b82f6' },
  { id: 'EMERALD', name: 'Green Emerald', payoutMultiplier: 10, type: 'high', color: '#10b981' },
  { id: 'A', name: 'Golden Ace', payoutMultiplier: 5, type: 'low', color: '#f59e0b' },
  { id: 'K', name: 'Ruby King', payoutMultiplier: 4, type: 'low', color: '#ec4899' },
  { id: 'Q', name: 'Sapphire Queen', payoutMultiplier: 3, type: 'low', color: '#06b6d4' },
  { id: 'J', name: 'Emerald Jack', payoutMultiplier: 2, type: 'low', color: '#84cc16' },
];

// ==========================================
// AUTHENTIC JILI FORTUNE GEMS ICON RENDERERS
// ==========================================

export const GarudaWildIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <radialGradient id="garudaGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff8db" />
        <stop offset="60%" stopColor="#ffb300" />
        <stop offset="100%" stopColor="#b45309" />
      </radialGradient>
      <linearGradient id="goldFeather" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <linearGradient id="rubyEye" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <linearGradient id="emeraldCenter" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="wildBanner" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="46" r="42" fill="url(#garudaGlow)" opacity="0.35" />
    <circle cx="50" cy="46" r="38" fill="#1e1308" stroke="#ca8a04" strokeWidth="2" />
    
    <path d="M50 8 L56 26 L50 22 L44 26 Z" fill="url(#goldFeather)" stroke="#713f12" strokeWidth="1" />
    <path d="M36 12 L46 28 L40 26 L32 20 Z" fill="url(#goldFeather)" stroke="#713f12" strokeWidth="1" />
    <path d="M64 12 L68 20 L60 26 L54 28 Z" fill="url(#goldFeather)" stroke="#713f12" strokeWidth="1" />
    <path d="M24 20 L38 32 L32 32 L22 28 Z" fill="url(#goldFeather)" stroke="#713f12" strokeWidth="1" />
    <path d="M76 20 L78 28 L68 32 L62 32 Z" fill="url(#goldFeather)" stroke="#713f12" strokeWidth="1" />

    <path d="M30 36 Q50 28 70 36 Q74 54 66 68 Q50 78 34 68 Q26 54 30 36 Z" fill="url(#goldFeather)" stroke="#713f12" strokeWidth="1.5" />
    
    <polygon points="50,26 56,33 50,40 44,33" fill="url(#emeraldCenter)" stroke="#fef08a" strokeWidth="1" />
    
    <path d="M34 42 Q42 38 48 42 L46 47 Q40 44 34 46 Z" fill="#451a03" />
    <polygon points="38,44 44,43 45,46 39,47" fill="url(#rubyEye)" />
    <circle cx="41" cy="44.5" r="1" fill="#ffffff" />
    
    <path d="M66 42 Q58 38 52 42 L54 47 Q60 44 66 46 Z" fill="#451a03" />
    <polygon points="62,44 56,43 55,46 61,47" fill="url(#rubyEye)" />
    <circle cx="59" cy="44.5" r="1" fill="#ffffff" />

    <path d="M46 44 Q50 42 54 44 L52 58 Q50 64 48 58 Z" fill="#fef08a" stroke="#854d0e" strokeWidth="1.2" />
    <path d="M50 44 L50 62" stroke="#ca8a04" strokeWidth="1" />

    <circle cx="34" cy="54" r="3.5" fill="url(#emeraldCenter)" stroke="#fef08a" strokeWidth="0.8" />
    <circle cx="66" cy="54" r="3.5" fill="url(#emeraldCenter)" stroke="#fef08a" strokeWidth="0.8" />

    <rect x="18" y="70" width="64" height="18" rx="4" fill="url(#wildBanner)" stroke="#fde047" strokeWidth="1.5" />
    <text x="50" y="83.5" fill="#fef08a" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="2" fontFamily="sans-serif">
      WILD
    </text>
  </svg>
);

export const RubyGemIcon = ({ className = "w-14 h-14" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="rubyBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="40%" stopColor="#dc2626" />
        <stop offset="80%" stopColor="#991b1b" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>
      <linearGradient id="rubyGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#713f12" />
      </linearGradient>
      <linearGradient id="rubyFacetTop" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fecaca" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
    <path d="M50 6 L58 18 L74 12 L76 28 L92 34 L84 48 L94 62 L80 70 L82 86 L66 84 L58 96 L50 86 L42 96 L34 84 L18 86 L20 70 L6 62 L16 48 L8 34 L24 28 L26 12 L42 18 Z" fill="url(#rubyGold)" stroke="#451a03" strokeWidth="1.5" />
    <polygon points="50,16 78,34 78,66 50,84 22,66 22,34" fill="#2d0606" stroke="#ca8a04" strokeWidth="1.5" />
    <polygon points="50,18 76,35 76,65 50,82 24,65 24,35" fill="url(#rubyBody)" />
    <polygon points="50,18 76,35 64,42 50,30" fill="url(#rubyFacetTop)" opacity="0.8" />
    <polygon points="50,18 24,35 36,42 50,30" fill="#fca5a5" opacity="0.9" />
    <polygon points="50,30 64,42 64,58 50,70 36,58 36,42" fill="#ef4444" stroke="#fecaca" strokeWidth="0.8" />
    <polygon points="24,35 36,42 36,58 24,65" fill="#b91c1c" />
    <polygon points="76,35 64,42 64,58 76,65" fill="#7f1d1d" />
    <polygon points="36,58 50,70 50,82 24,65" fill="#991b1b" />
    <polygon points="64,58 50,70 50,82 76,65" fill="#450a0a" />
    <circle cx="43" cy="38" r="2.5" fill="#ffffff" />
    <path d="M43 32 L43 44 M37 38 L49 38" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export const SapphireGemIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="sapphireBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="40%" stopColor="#2563eb" />
        <stop offset="80%" stopColor="#1e40af" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="sapphireGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#713f12" />
      </linearGradient>
      <linearGradient id="sapphireGleam" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#dbeafe" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="80" height="80" rx="16" fill="url(#sapphireGold)" stroke="#451a03" strokeWidth="1.5" />
    <circle cx="18" cy="18" r="3" fill="#ffffff" stroke="#713f12" strokeWidth="0.8" />
    <circle cx="82" cy="18" r="3" fill="#ffffff" stroke="#713f12" strokeWidth="0.8" />
    <circle cx="18" cy="82" r="3" fill="#ffffff" stroke="#713f12" strokeWidth="0.8" />
    <circle cx="82" cy="82" r="3" fill="#ffffff" stroke="#713f12" strokeWidth="0.8" />
    <rect x="18" y="18" width="64" height="64" rx="10" fill="#051024" stroke="#ca8a04" strokeWidth="1.2" />
    <rect x="22" y="22" width="56" height="56" rx="8" fill="url(#sapphireBody)" />
    <polygon points="22,22 78,22 66,34 34,34" fill="url(#sapphireGleam)" opacity="0.9" />
    <polygon points="22,22 34,34 34,66 22,78" fill="#93c5fd" opacity="0.6" />
    <polygon points="78,22 66,34 66,66 78,78" fill="#1e3a8a" />
    <polygon points="22,78 34,66 66,66 78,78" fill="#0f172a" />
    <rect x="34" y="34" width="32" height="32" rx="4" fill="#2563eb" stroke="#bfdbfe" strokeWidth="0.8" />
    <circle cx="42" cy="42" r="2.5" fill="#ffffff" />
    <path d="M42 36 L42 48 M36 42 L48 42" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export const EmeraldGemIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="emeraldBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="40%" stopColor="#16a34a" />
        <stop offset="80%" stopColor="#15803d" />
        <stop offset="100%" stopColor="#052e16" />
      </linearGradient>
      <linearGradient id="emeraldGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#713f12" />
      </linearGradient>
      <linearGradient id="emeraldGleam" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#dcfce7" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="42" fill="url(#emeraldGold)" stroke="#451a03" strokeWidth="1.5" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
      <circle key={deg} cx={50 + 36 * Math.cos(deg * Math.PI / 180)} cy={50 + 36 * Math.sin(deg * Math.PI / 180)} r="2" fill="#713f12" />
    ))}
    <circle cx="50" cy="50" r="32" fill="#02210f" stroke="#ca8a04" strokeWidth="1.2" />
    <polygon points="50,22 74,36 74,64 50,78 26,64 26,36" fill="url(#emeraldBody)" />
    <polygon points="50,22 74,36 62,43 50,34" fill="url(#emeraldGleam)" opacity="0.9" />
    <polygon points="50,22 26,36 38,43 50,34" fill="#86efac" opacity="0.8" />
    <polygon points="50,34 62,43 62,57 50,66 38,57 38,43" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.8" />
    <polygon points="26,36 38,43 38,57 26,64" fill="#15803d" />
    <polygon points="74,36 62,43 62,57 74,64" fill="#047857" />
    <polygon points="38,57 50,66 50,78 26,64" fill="#065f46" />
    <polygon points="62,57 50,66 50,78 74,64" fill="#022c22" />
    <circle cx="44" cy="42" r="2.5" fill="#ffffff" />
    <path d="M44 36 L44 48 M38 42 L50 42" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export const AceGemIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="aceGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="30%" stopColor="#fbbf24" />
        <stop offset="70%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="aceRubyCore" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
    </defs>
    <polygon points="50,8 86,22 86,78 50,92 14,78 14,22" fill="#1f1308" stroke="#d97706" strokeWidth="1.5" />
    <polygon points="50,13 81,25 81,75 50,87 19,75 19,25" fill="#2d1a08" />
    <path d="M50 20 L76 76 L62 76 L57 64 L43 64 L38 76 L24 76 Z M50 36 L46 54 L54 54 Z" fill="#451a03" transform="translate(2, 3)" />
    <path d="M50 20 L76 76 L62 76 L57 64 L43 64 L38 76 L24 76 Z M50 36 L46 54 L54 54 Z" fill="url(#aceGoldGrad)" stroke="#451a03" strokeWidth="1" />
    <polygon points="50,23 54,34 46,34" fill="#ffffff" opacity="0.8" />
    <polygon points="46,54 54,54 50,36" fill="url(#aceRubyCore)" stroke="#fef08a" strokeWidth="0.8" />
    <circle cx="50" cy="12" r="2.5" fill="#ef4444" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="82" cy="74" r="2.5" fill="#ef4444" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="18" cy="74" r="2.5" fill="#ef4444" stroke="#fef08a" strokeWidth="0.5" />
  </svg>
);

export const KingGemIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="kingPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f5d0fe" />
        <stop offset="30%" stopColor="#c084fc" />
        <stop offset="70%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#4c1d95" />
      </linearGradient>
      <linearGradient id="kingGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <polygon points="50,8 86,22 86,78 50,92 14,78 14,22" fill="#190e24" stroke="#a855f7" strokeWidth="1.5" />
    <polygon points="50,13 81,25 81,75 50,87 19,75 19,25" fill="#29143d" />
    <path d="M26 22 L40 22 L40 44 L58 22 L75 22 L52 48 L76 78 L59 78 L40 54 L40 78 L26 78 Z" fill="#1e102e" transform="translate(2, 3)" />
    <path d="M26 22 L40 22 L40 44 L58 22 L75 22 L52 48 L76 78 L59 78 L40 54 L40 78 L26 78 Z" fill="url(#kingPurpleGrad)" stroke="url(#kingGoldTrim)" strokeWidth="1.2" />
    <polygon points="28,24 38,24 38,40" fill="#ffffff" opacity="0.6" />
    <polygon points="58,24 71,24 53,44" fill="#ffffff" opacity="0.5" />
    <circle cx="50" cy="12" r="2.5" fill="#c084fc" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="82" cy="74" r="2.5" fill="#c084fc" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="18" cy="74" r="2.5" fill="#c084fc" stroke="#fef08a" strokeWidth="0.5" />
  </svg>
);

export const QueenGemIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="queenCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cffafe" />
        <stop offset="30%" stopColor="#22d3ee" />
        <stop offset="70%" stopColor="#0891b2" />
        <stop offset="100%" stopColor="#164e63" />
      </linearGradient>
      <linearGradient id="queenGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <polygon points="50,8 86,22 86,78 50,92 14,78 14,22" fill="#081e26" stroke="#06b6d4" strokeWidth="1.5" />
    <polygon points="50,13 81,25 81,75 50,87 19,75 19,25" fill="#0e323e" />
    <path d="M50 20 Q74 20 74 48 Q74 64 64 71 L75 79 L64 83 L55 75 Q50 76 46 76 Q22 76 22 48 Q22 20 50 20 Z M48 34 Q36 34 36 48 Q36 62 48 62 Q60 62 60 48 Q60 34 48 34 Z" fill="#04151b" transform="translate(2, 3)" />
    <path d="M50 20 Q74 20 74 48 Q74 64 64 71 L75 79 L64 83 L55 75 Q50 76 46 76 Q22 76 22 48 Q22 20 50 20 Z M48 34 Q36 34 36 48 Q36 62 48 62 Q60 62 60 48 Q60 34 48 34 Z" fill="url(#queenCyanGrad)" stroke="url(#queenGoldTrim)" strokeWidth="1.2" />
    <path d="M42 24 Q56 24 62 34" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
    <circle cx="50" cy="12" r="2.5" fill="#22d3ee" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="82" cy="74" r="2.5" fill="#22d3ee" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="18" cy="74" r="2.5" fill="#22d3ee" stroke="#fef08a" strokeWidth="0.5" />
  </svg>
);

export const JackGemIcon = ({ className = "w-11 h-11" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="jackLimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ecfccb" />
        <stop offset="30%" stopColor="#a3e635" />
        <stop offset="70%" stopColor="#65a30d" />
        <stop offset="100%" stopColor="#365314" />
      </linearGradient>
      <linearGradient id="jackGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <polygon points="50,8 86,22 86,78 50,92 14,78 14,22" fill="#132008" stroke="#84cc16" strokeWidth="1.5" />
    <polygon points="50,13 81,25 81,75 50,87 19,75 19,25" fill="#1e340d" />
    <path d="M42 22 L72 22 L72 36 L58 36 L58 60 Q58 76 42 76 Q26 76 26 62 L40 62 Q40 66 44 66 Q48 66 48 58 L48 22 Z" fill="#0d1805" transform="translate(2, 3)" />
    <path d="M42 22 L72 22 L72 36 L58 36 L58 60 Q58 76 42 76 Q26 76 26 62 L40 62 Q40 66 44 66 Q48 66 48 58 L48 22 Z" fill="url(#jackLimeGrad)" stroke="url(#jackGoldTrim)" strokeWidth="1.2" />
    <polygon points="44,24 68,24 58,34" fill="#ffffff" opacity="0.6" />
    <circle cx="50" cy="12" r="2.5" fill="#a3e635" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="82" cy="74" r="2.5" fill="#a3e635" stroke="#fef08a" strokeWidth="0.5" />
    <circle cx="18" cy="74" r="2.5" fill="#a3e635" stroke="#fef08a" strokeWidth="0.5" />
  </svg>
);

export const FortuneGemIcon = ({ symbol, className = "w-14 h-14" }: { symbol: GemSymbol; className?: string }) => {
  switch (symbol.id) {
    case 'WILD':
      return <GarudaWildIcon className={className} />;
    case 'RUBY':
      return <RubyGemIcon className={className} />;
    case 'SAPPHIRE':
      return <SapphireGemIcon className={className} />;
    case 'EMERALD':
      return <EmeraldGemIcon className={className} />;
    case 'A':
      return <AceGemIcon className={className} />;
    case 'K':
      return <KingGemIcon className={className} />;
    case 'Q':
      return <QueenGemIcon className={className} />;
    case 'J':
      return <JackGemIcon className={className} />;
    default:
      return <GarudaWildIcon className={className} />;
  }
};

const MULTIPLIERS = [1, 2, 3, 5, 10, 15];
const COLS = 3;
const ROWS = 3;
const TOTAL_PAYLINES = 5;

// Payline coordinates across 3 reels: [row_col0, row_col1, row_col2]
const PAYLINE_DEFINITIONS = [
  { id: 1, name: 'Top Row', coords: [0, 0, 0] },
  { id: 2, name: 'Center Row', coords: [1, 1, 1] },
  { id: 3, name: 'Bottom Row', coords: [2, 2, 2] },
  { id: 4, name: 'Diagonal ↘', coords: [0, 1, 2] },
  { id: 5, name: 'Diagonal ↗', coords: [2, 1, 0] },
];

export default function FortuneGems() {
  const { currentUser, updateUserProfile, siteSettings } = useApp();

  const [bet, setBet] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [grid, setGrid] = useState<GemSymbol[][]>([]);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [showWin, setShowWin] = useState(false);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false]); // 3 reels + 1 mult reel
  const [winningLines, setWinningLines] = useState<{ lineId: number; symbol: GemSymbol; lineWin: number }[]>([]);

  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [showBetMenu, setShowBetMenu] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [isMuted, setIsMuted] = useState(audioSystem.isMuted);

  const BET_OPTIONS = [0.5, 1, 5, 10, 20, 50, 100, 200, 500, 1000];
  const handleSpinRef = useRef<(() => void) | null>(null);

  const getRandomSymbol = (): GemSymbol => {
    const rand = Math.random() * 100;
    if (rand < 6) return SYMBOLS[0]; // WILD (6%)
    if (rand < 16) return SYMBOLS[1]; // Ruby (10%)
    if (rand < 28) return SYMBOLS[2]; // Sapphire (12%)
    if (rand < 42) return SYMBOLS[3]; // Emerald (14%)
    if (rand < 56) return SYMBOLS[4]; // A (14%)
    if (rand < 70) return SYMBOLS[5]; // K (14%)
    if (rand < 85) return SYMBOLS[6]; // Q (15%)
    return SYMBOLS[7]; // J (15%)
  };

  const getRandomMultiplier = (): number => {
    const rand = Math.random() * 100;
    if (rand < 40) return 1;
    if (rand < 65) return 2;
    if (rand < 80) return 3;
    if (rand < 92) return 5;
    if (rand < 98) return 10;
    return 15;
  };

  useEffect(() => {
    const initialGrid: GemSymbol[][] = [];
    for (let c = 0; c < COLS; c++) {
      const col: GemSymbol[] = [];
      for (let r = 0; r < ROWS; r++) {
        col.push(getRandomSymbol());
      }
      initialGrid.push(col);
    }
    setGrid(initialGrid);
    setMultiplier(1);

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
    let timer: any;
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
    if (currentUser.balance < bet) {
      setIsAutoSpinning(false);
      return alert("Insufficient balance!");
    }

    if (!isMuted) audioSystem.playBGM();
    audioSystem.playSpin(isTurbo);

    // Deduct bet immediately
    updateUserProfile(currentUser.id, { balance: currentUser.balance - bet });
    setIsSpinning(true);
    setWinAmount(0);
    setShowWin(false);
    setWinningLines([]);
    setSpinningCols([true, true, true, true]);

    // Determine outcomes based on admin control via server simulation
    const winControl = (siteSettings?.gameWinControls?.fortune_gems as WinControlLevel) || 'medium';
    const result = await gameApi.spinFortuneGems(bet, winControl);

    // Map string[][] grid back to GemSymbol[][]
    const finalGrid: GemSymbol[][] = result.grid.map(col =>
      col.map(symId => SYMBOLS.find(s => s.id === symId) || SYMBOLS[0])
    );
    const finalMult = result.multiplier;

    const spinDuration = isTurbo ? 100 : 250;
    const staggerTime = isTurbo ? 40 : 120;

    for (let c = 0; c < 4; c++) {
      setTimeout(() => {
        if (c < 3) {
          setGrid(prev => {
            const next = [...prev];
            next[c] = finalGrid[c];
            return next;
          });
        } else {
          setMultiplier(finalMult);
        }

        setSpinningCols(prev => {
          const next = [...prev];
          next[c] = false;
          return next;
        });

        if (c === 3) {
          setIsSpinning(false);
          if (result.isWin && result.payout > 0) {
            setWinAmount(result.payout);
            const hits = result.winningLines.map(wl => ({
              lineId: wl.lineId,
              symbol: SYMBOLS.find(s => s.id === wl.symbolId) || SYMBOLS[0],
              lineWin: wl.lineWin
            }));
            setWinningLines(hits);
            setShowWin(true);

            if (currentUser) {
              updateUserProfile(currentUser.id, { balance: currentUser.balance + result.payout });
            }

            if (!isMuted) audioSystem.playWin(result.payout);
            setTimeout(() => setShowWin(false), 3500);
          } else {
            setWinAmount(0);
            setShowWin(false);
            setWinningLines([]);
          }
        }
      }, spinDuration + (c * staggerTime));
    }
  };

  const isCellInWin = (cIdx: number, rIdx: number) => {
    if (!showWin || winningLines.length === 0) return false;
    return winningLines.some(hit => {
      const lineDef = PAYLINE_DEFINITIONS.find(l => l.id === hit.lineId);
      if (!lineDef) return false;
      return lineDef.coords[cIdx] === rIdx;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#03151f] font-sans overflow-hidden text-white">
      {/* Top Background Shadow */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#1c0808] to-transparent pointer-events-none"></div>

      {/* Back button */}
      <Link 
        to="/games" 
        className="absolute top-1 left-1 z-50 w-6 h-6 flex items-center justify-center bg-black/40 rounded-full border border-white/20 active:scale-95 text-[#f0ba4e]"
      >
        <ArrowLeft className="w-3 h-3" />
      </Link>

      {/* Header */}
      <div className="shrink-0 relative z-10 flex flex-col items-center pt-1 pb-1">
        <div className="flex items-center justify-between w-full px-2">
          {/* JILI Badge */}
          <div className="bg-[#a88232] text-black font-black px-1 py-1 rounded-[1px] text-[6px] leading-none [writing-mode:vertical-lr] rotate-180 border border-[#f5b800]">
            JILI
          </div>

          {/* Golden Game Title */}
          <span 
            className="text-lg font-black italic tracking-tighter" 
            style={{
              background: 'linear-gradient(to bottom, #fff8d6, #d79c31)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: '1px #4a2d00'
            }}
          >
            FortuneGems
          </span>

          {/* Game Rules / Paytable Badge */}
          <div 
            onClick={() => setShowPaytable(true)}
            className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-900 rounded-full border border-[#f5b800] flex flex-col items-center justify-center shadow-lg active:scale-95 cursor-pointer"
          >
            <span className="text-white font-black text-[6px] leading-none">GAME</span>
            <span className="text-[#f5b800] font-black text-[6px] leading-none">RULES</span>
          </div>
        </div>

        {/* Top 4th Multiplier Tracker Capsule (Following Super Ace design) */}
        <div className="w-full max-w-[280px] mx-auto mt-1.5 bg-gradient-to-b from-[#2a1705] to-[#120902] rounded-full p-1 border-2 border-[#5c3a12] shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex justify-between gap-1 relative overflow-hidden">
          {MULTIPLIERS.map(m => {
            const isActive = multiplier === m;
            return (
              <div 
                key={m} 
                className={`flex-1 flex items-center justify-center py-1 rounded-full border-[1.5px] relative transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-b from-[#ffef99] via-[#ffcc00] to-[#d98200] border-[#ffffff] shadow-[0_0_12px_rgba(255,204,0,0.8)] scale-105 z-10' 
                    : 'bg-gradient-to-b from-[#4a2d00] to-[#261709] border-[#704f1e] opacity-80'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none"></div>
                )}
                <span className={`font-black tracking-tighter ${
                  isActive 
                    ? 'text-[#4a2d00] text-[15px] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]' 
                    : 'text-[#a88232] text-[12px]'
                }`}>
                  <span className={`${isActive ? 'text-[10px]' : 'text-[8px] mr-[1px]'}`}>x</span>{m}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Reels Grid Area */}
      <div className="flex-1 min-h-0 relative z-10 flex flex-col items-center justify-center px-1 pb-1">
        {/* Full-Screen Win Celebration Overlay with Coin Shower */}
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
                );
              })}
            </div>

            {/* Epic Win Banner */}
            <div className="relative flex flex-col items-center justify-center animate-[popIn_0.8s_spring_forwards]">
              {/* Radial Sunburst Glow */}
              <div 
                className="absolute w-[400%] h-[400%] bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.3)_0%,transparent_50%)] -z-10 animate-[spin_4s_linear_infinite]"
              />

              {/* Text Group */}
              <div className="relative animate-[float_2s_ease-in-out_infinite]">
                <div className="text-center flex flex-col items-center">
                  <h2 
                    className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff6cc] via-[#ffcc00] to-[#cc7a00] filter drop-shadow-[0_0_20px_rgba(255,204,0,1)] uppercase italic tracking-tighter" 
                    style={{ WebkitTextStroke: '2px #4a2d00' }}
                  >
                    {winAmount >= bet * 25 ? 'MEGA WIN!' : winAmount >= bet * 8 ? 'SUPER WIN!' : 'BIG WIN!'}
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

        {/* Casino Machine Outer Frame */}
        <div className="w-full h-full max-w-md mx-auto bg-[#1b2b36] rounded p-1.5 border-t border-[#3e5361] shadow-xl overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 flex gap-[3px] bg-[#101b22] p-[3px] rounded-sm">
            
            {/* 3x3 Main Symbol Reels */}
            {grid.map((col, cIdx) => (
              <div key={cIdx} className="flex-1 flex flex-col gap-[3px] relative overflow-hidden bg-[#09151d] p-[2px] rounded-sm border border-[#1b303d]">
                {col.map((symbol, rIdx) => {
                  const isWinning = isCellInWin(cIdx, rIdx);

                  return (
                    <div 
                      key={rIdx} 
                      className={`flex-1 relative flex items-center justify-center overflow-hidden rounded-md transition-all p-0.5 ${
                        isWinning
                          ? 'bg-gradient-to-br from-[#ffe066] via-[#f59e0b] to-[#b45309] border-2 border-white shadow-[0_0_15px_rgba(255,204,0,1)] z-10 scale-[1.02] animate-pulse'
                          : 'bg-gradient-to-b from-[#14232e] via-[#0e1b24] to-[#09131a] border border-[#233a4a] hover:border-[#385b73] shadow-inner'
                      } ${spinningCols[cIdx] ? 'opacity-50 blur-[1px] translate-y-full' : 'opacity-100 translate-y-0 transition-transform duration-200'}`}
                    >
                      {/* Fortune Gems Custom Gem Artwork - Large & Vivid */}
                      <div className="w-full h-full flex items-center justify-center p-0.5">
                        <FortuneGemIcon 
                          symbol={symbol} 
                          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 max-w-[94%] max-h-[94%] drop-shadow-[0_2px_5px_rgba(0,0,0,0.85)] filter hover:scale-105 transition-transform" 
                        />
                      </div>

                      {/* Floating Payout Multiplier Badge */}
                      <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 z-10 pointer-events-none">
                        <span className={`text-[7px] sm:text-[8px] font-black leading-none px-1 py-[1px] rounded-full border shadow-sm ${
                          isWinning 
                            ? 'bg-black text-[#ffcc00] border-[#ffcc00]' 
                            : 'bg-black/80 text-[#f5b800] border-[#f5b800]/40 backdrop-blur-[1px]'
                        }`}>
                          {symbol.payoutMultiplier}x
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Spinning motion strip blur overlay */}
                {spinningCols[cIdx] && (
                  <div className="absolute inset-0 bg-[#09151d]/60 backdrop-blur-[1px] flex flex-col gap-[1px] overflow-hidden pointer-events-none z-20">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex-1 bg-gradient-to-b from-transparent via-[#f5b800]/10 to-transparent"></div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 4th Reel: Special Multiplier Reel (Aztec Gold Framing) */}
            <div className="w-[68px] sm:w-[74px] flex flex-col relative overflow-hidden bg-gradient-to-b from-[#2a1705] via-[#1a0f03] to-[#2a1705] rounded-sm border-2 border-[#f5b800]/80 shadow-md">
              <div className="bg-gradient-to-r from-[#8d6e1d] via-[#f5b800] to-[#8d6e1d] text-black font-black text-[7px] text-center py-0.5 tracking-wider border-b border-[#ffe082]">
                4TH MULT
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-1 relative">
                {/* Active Multiplier Display Box */}
                <div 
                  className={`w-full aspect-square rounded-lg bg-gradient-to-b from-[#ffef99] via-[#ffcc00] to-[#d98200] border-2 border-white shadow-[0_0_12px_rgba(255,204,0,0.8)] flex flex-col items-center justify-center relative ${
                    spinningCols[3] ? 'opacity-50 blur-[1px] translate-y-full' : 'opacity-100 translate-y-0 transition-transform duration-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#4a2d00] fill-[#4a2d00] mb-0.5" />
                  <span className="text-[20px] font-black text-[#4a2d00] tracking-tighter leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
                    {multiplier}x
                  </span>
                  <span className="text-[6px] font-black uppercase text-[#4a2d00]/80 tracking-widest mt-0.5">
                    PAYOUT
                  </span>
                </div>
              </div>

              {spinningCols[3] && (
                <div className="absolute inset-0 bg-white/30 flex flex-col gap-[1px] overflow-hidden pointer-events-none">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex-1 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent"></div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Controls Area (Exact Match with Super Ace Style) */}
      <div className="shrink-0 relative z-20 bg-gradient-to-t from-[#051117] to-[#0a1b24] border-t-2 border-[#1a2f3a] pb-4 pt-1 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        
        {/* Bet Menu Popup */}
        {showBetMenu && (
          <div className="absolute bottom-24 left-4 z-50 bg-[#0a1820] border border-[#3e5361] rounded-lg p-2 shadow-2xl flex flex-wrap gap-2 w-[180px]">
            {BET_OPTIONS.map(opt => (
              <button 
                key={opt}
                onClick={() => { setBet(opt); setShowBetMenu(false); }}
                className={`flex-1 min-w-[40%] py-1.5 rounded-sm text-xs font-bold transition-colors cursor-pointer ${
                  bet === opt ? 'bg-[#4ade80] text-black' : 'bg-[#1b2b36] text-white/80 hover:bg-[#253947]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Floating Win Ticker */}
        <div className="flex justify-center -mt-4 mb-4">
          <div className="bg-black/80 border border-[#f5b800]/50 rounded-full px-6 py-0.5 shadow-[0_0_10px_rgba(245,184,0,0.2)]">
            <span className="text-[#f5b800] font-black text-[12px] tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
              WIN Tk {(showWin ? winAmount : 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-center gap-[96px] sm:gap-[120px] px-3 sm:px-6 mb-2 relative h-12">
          
          {/* Left Controls */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setShowPaytable(true)}
              className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#1b2b36] to-[#0a1820] border border-[#3e5361] shadow-lg active:scale-95 transition-all text-white/70 cursor-pointer hover:text-white"
            >
              <Settings className="w-3.5 h-3.5 mb-[1px]" />
              <span className="text-[6px] font-bold leading-none">SET</span>
            </button>
            <button 
              onClick={() => setShowBetMenu(!showBetMenu)} 
              className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#1b2b36] to-[#0a1820] border border-[#3e5361] shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-[#4ade80] mb-[1px]" />
              <span className="text-[6px] text-white/90 font-bold leading-none">Tk {bet}</span>
            </button>
          </div>

          {/* Central 3D Metallic Golden Spin Button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2">
            <button 
              onClick={handleSpin}
              disabled={isSpinning && !isAutoSpinning}
              className={`w-16 h-16 rounded-full p-[3px] shadow-[0_5px_15px_rgba(0,0,0,0.8)] active:scale-95 transition-transform cursor-pointer ${
                isSpinning && !isAutoSpinning ? 'brightness-75' : ''
              }`}
              style={{ background: 'linear-gradient(to bottom, #ffe680, #cc7a00)' }}
            >
              <div className="w-full h-full rounded-full border-[2px] border-[#ffe680] bg-gradient-to-b from-[#ffcc00] to-[#e68a00] flex flex-col items-center justify-center relative shadow-inner">
                <RotateCcw className={`w-7 h-7 text-white/90 drop-shadow-md stroke-[2.5px] ${
                  isSpinning ? (isTurbo ? 'animate-[spin_0.2s_linear_infinite]' : 'animate-[spin_0.5s_linear_infinite]') : ''
                }`} />
                <span className="absolute bottom-2 text-[#4a2d00] font-black text-[8px] tracking-widest drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
                  SPIN
                </span>
              </div>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsAutoSpinning(!isAutoSpinning)} 
              className={`flex flex-col items-center justify-center w-8 h-8 rounded-full border shadow-lg active:scale-95 transition-all cursor-pointer ${
                isAutoSpinning 
                  ? 'bg-gradient-to-b from-[#3a200a] to-[#2a1205] border-[#f5b800] text-[#f5b800]' 
                  : 'bg-gradient-to-b from-[#1b2b36] to-[#0a1820] border-[#3e5361] text-[#ffcc00]'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 mb-[1px] ${isAutoSpinning ? 'animate-[spin_3s_linear_infinite]' : ''}`} />
              <span className="text-[6px] font-bold leading-none text-white/90">AUTO</span>
            </button>
            <button 
              onClick={() => setIsTurbo(!isTurbo)} 
              className={`flex flex-col items-center justify-center w-8 h-8 rounded-full border shadow-lg active:scale-95 transition-all cursor-pointer ${
                isTurbo 
                  ? 'bg-gradient-to-b from-[#3a200a] to-[#2a1205] border-[#f5b800] text-[#f5b800]' 
                  : 'bg-gradient-to-b from-[#1b2b36] to-[#0a1820] border-[#3e5361] text-[#ffcc00]'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 fill-current mb-[1px] ${isTurbo ? 'drop-shadow-[0_0_2px_#f5b800]' : ''}`} />
              <span className="text-[6px] font-bold leading-none text-white/90">TURBO</span>
            </button>
          </div>
        </div>

        {/* Bottom Level & Balance Status Strip */}
        <div className="flex items-center justify-between px-4 pt-3 border-t border-white/5 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#4d5b63] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[2px] shadow-sm">
              LV 0
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#f5b800] text-[11px] font-bold tracking-wide">
              BAL <span className="text-white">Tk {parseFloat((currentUser?.balance || 0).toString()).toFixed(2)}</span>
            </span>
            <button onClick={toggleMute} className="active:scale-95 transition-transform cursor-pointer">
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/50" /> : <Volume2 className="w-3.5 h-3.5 text-[#f5b800]" />}
            </button>
            <Wifi className="w-3.5 h-3.5 text-[#4ade80]" />
          </div>
        </div>
      </div>

      {/* Paytable & Game Rules Modal (Dark Luxury Casino Theme) */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="bg-[#0f1d26] border border-[#3e5361] rounded-2xl max-w-sm w-full p-4 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#f5b800]" />
                <h3 className="text-xs font-black text-[#f5b800] uppercase tracking-wider">
                  Fortune Gems Paytable
                </h3>
              </div>
              <button 
                onClick={() => setShowPaytable(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4th Reel Rules */}
            <div className="bg-[#1b2b36] border border-[#f5b800]/40 p-2.5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-[#f5b800] block">
                ✨ 4th Multiplier Reel Feature
              </span>
              <p className="text-[9px] text-white/80 leading-relaxed">
                The 4th reel spins simultaneously on each spin. All line wins are multiplied by the outcome shown on the center multiplier window: <strong>1x, 2x, 3x, 5x, 10x, or 15x</strong>.
              </p>
            </div>

            {/* Symbol Payouts List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-white/70 block">
                3 of a Kind Payout Multipliers:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {SYMBOLS.map(sym => (
                  <div key={sym.id} className="flex items-center justify-between p-1.5 rounded-lg border border-white/10 bg-[#14232d] gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FortuneGemIcon symbol={sym} className="w-8 h-8 shrink-0 drop-shadow-sm" />
                      <span className="text-[10px] font-semibold text-white/90 truncate">{sym.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-[#f5b800] shrink-0">{sym.payoutMultiplier}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Fixed Paylines */}
            <div className="space-y-1 border-t border-white/10 pt-2">
              <span className="text-[10px] font-bold text-white/70 block">5 Fixed Paylines:</span>
              <div className="grid grid-cols-5 gap-1 text-center text-[8px] text-white/60">
                <div className="bg-[#1b2b36] border border-white/10 p-1 rounded">Top Row</div>
                <div className="bg-[#1b2b36] border border-white/10 p-1 rounded">Mid Row</div>
                <div className="bg-[#1b2b36] border border-white/10 p-1 rounded">Bot Row</div>
                <div className="bg-[#1b2b36] border border-white/10 p-1 rounded">Diag ↘</div>
                <div className="bg-[#1b2b36] border border-white/10 p-1 rounded">Diag ↗</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPaytable(false)}
              className="w-full bg-[#f5b800] hover:bg-[#e0a800] text-black font-black py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              OK, GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
