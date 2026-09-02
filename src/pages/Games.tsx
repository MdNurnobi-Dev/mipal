import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, Search, Flame, Coins, Trophy, Gamepad2, Rocket, Target, Star, ChevronLeft, X, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { FortuneGemsLobbyThumbnail } from '../components/FortuneGemsLobbyThumbnail';

export default function Games() {
  const { currentUser, siteSettings } = useApp();
  const { formatCurrency } = useCurrency();
  
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const banners = siteSettings?.gameBanners || [];

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const categories = [
    { id: 'All', name: 'All Games', icon: LayoutGrid, color: 'text-blue-400' },
    { id: 'Crash', name: 'Crash', icon: Rocket, color: 'text-red-500' },
    { id: 'Slots', name: 'Slots', icon: Coins, color: 'text-amber-500' },
    { id: 'Live', name: 'Live Casino', icon: Crown, color: 'text-purple-500' },
    { id: 'Table', name: 'Table Games', icon: Target, color: 'text-emerald-500' },
    { id: 'Arcade', name: 'Arcade', icon: Gamepad2, color: 'text-pink-500' },
    { id: 'Sports', name: 'Sports', icon: Trophy, color: 'text-orange-400' },
  ];

  const games = [
    {
      id: 'aviator',
      name: 'AVIATOR',
      provider: 'SPRIBE',
      image: 'bg-gradient-to-br from-red-600 to-red-900',
      imageUrl: '/aviator-logo.png', // Uploaded image should be placed in /public
      icon: Rocket,
      path: '/games/crash',
      tag: 'HOT',
      category: 'Crash',
      active: siteSettings?.gameStates ? !!siteSettings.gameStates['aviator'] : true
    },
    {
      id: 'super_ace',
      name: 'Super Ace',
      provider: 'JILI',
      image: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      imageUrl: '/super-ace-logo.png',
      icon: Star,
      path: '/games/slots/super-ace',
      category: 'Slots',
      active: siteSettings?.gameStates ? !!siteSettings.gameStates['super_ace'] : true
    },
    {
      id: 'fortune_gems',
      name: 'Fortune Gems',
      provider: 'JILI',
      image: 'bg-gradient-to-br from-orange-400 to-orange-600',
      icon: Coins,
      path: '/games/slots/fortune-gems',
      category: 'Slots',
      active: siteSettings?.gameStates ? !!siteSettings.gameStates['fortune_gems'] : true
    },
    {
      id: 'mines',
      name: 'MINES',
      provider: 'STAKE',
      image: 'bg-gradient-to-br from-blue-700 to-slate-900',
      icon: Target,
      path: '/games/mines',
      category: 'Table',
      active: siteSettings?.gameStates ? !!siteSettings.gameStates['mines'] : true
    },
    {
      id: 'fly_x',
      name: 'FLY X',
      provider: 'MICROGAMING',
      image: 'bg-gradient-to-br from-slate-800 to-black',
      icon: Rocket,
      path: '#',
      category: 'Crash',
      active: siteSettings?.gameStates ? !!siteSettings.gameStates['fly_x'] : false
    },
    {
      id: 'spaceman',
      name: 'SPACEMAN',
      provider: 'PRAGMATIC PLAY',
      image: 'bg-gradient-to-br from-indigo-600 to-purple-800',
      icon: Rocket,
      path: '#',
      category: 'Crash',
      active: siteSettings?.gameStates ? !!siteSettings.gameStates['spaceman'] : false
    },
    {
      id: 'wild_bounty',
      name: 'Wild Bounty',
      provider: 'PG SOFT',
      image: 'bg-gradient-to-br from-amber-700 to-amber-900',
      icon: Target,
      path: '#',
      category: 'Slots',
      active: siteSettings?.gameStates ? !!siteSettings.gameStates['wild_bounty'] : false
    }
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] font-sans pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1A1A1A] border-b border-white/5 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-[10px]">mP</span>
          </div>
          {!isSearchOpen && <span className="text-white font-black tracking-wider text-sm">CASINO</span>}
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          {isSearchOpen ? (
            <div className="flex items-center bg-[#2A2A2A] rounded-full px-3 py-1 flex-1 ml-2 border border-white/10 animate-in fade-in zoom-in-95 duration-200">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search games..." 
                className="bg-transparent border-none outline-none text-white text-xs w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-slate-400 hover:text-white ml-2 p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="bg-[#2A2A2A] px-3 py-1 rounded-full flex items-center gap-2 border border-white/5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-emerald-400 font-bold text-xs">{formatCurrency(currentUser?.balance || 0)}</span>
              </div>
              <button onClick={() => setIsSearchOpen(true)} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                <Search className="w-4 h-4 text-slate-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="relative w-full h-32 sm:h-40 bg-gradient-to-r from-red-900 to-black overflow-hidden flex items-center justify-center shrink-0">
        {banners.length > 0 ? (
          <>
            {banners.map((banner: any, idx: number) => (
              <img
                key={banner.id}
                src={banner.url}
                alt="Casino Banner"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  idx === currentBanner ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
              {banners.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentBanner ? 'bg-amber-400 w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h2 className="text-amber-400 font-black text-xl italic tracking-widest drop-shadow-lg">UP TO 8%</h2>
              <p className="text-white font-bold text-[10px] tracking-widest">DEPOSIT BONUS</p>
            </div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          </>
        )}
      </div>

      {/* Marquee */}
      <div className="bg-[#1A1A1A] px-3 py-1.5 flex items-center gap-2 border-b border-white/5 shrink-0">
        <Volume2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <div className="overflow-hidden flex-1 relative h-4">
          <div className="absolute whitespace-nowrap text-[10px] text-slate-300 animate-[marquee_15s_linear_infinite]">
            Dear customers, welcome to miPall Casino! Play Aviator and win big! New live casino games coming soon.
          </div>
        </div>
      </div>

      {/* Categories (Horizontal Scroll) */}
      <div className="flex overflow-x-auto hide-scrollbar px-2 py-3 gap-2 bg-[#121212] shrink-0 border-b border-white/5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <div 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] p-2 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/50 shadow-inner' : 'border border-transparent hover:bg-white/5'}`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-amber-400 drop-shadow-md' : cat.color}`} />
              <span className={`text-[9px] font-bold ${isActive ? 'text-amber-400' : 'text-slate-400'}`}>{cat.name}</span>
            </div>
          );
        })}
      </div>

      {/* Game Grid - Fixed to 3 Columns */}
      <div className="px-3 py-3">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {filteredGames.map((game) => (
              <Link 
                key={game.id} 
                to={game.active ? game.path : '#'}
                onClick={(e) => !game.active && e.preventDefault()}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden group border border-white/10 ${game.image} shadow-lg shadow-black/50 ${!game.active ? 'opacity-80' : ''}`}
              >
                {game.id === 'fortune_gems' ? (
                  <FortuneGemsLobbyThumbnail className="w-full h-full" />
                ) : (
                  <>
                    {game.imageUrl && (
                      <img 
                        src={game.imageUrl} 
                        alt={game.name} 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent && game.id === 'aviator') {
                            parent.classList.add('bg-gradient-to-br', 'from-[#4a0a0a]', 'to-[#110101]');
                            
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'absolute inset-0 flex flex-col items-center justify-center z-0 opacity-80';
                            fallbackDiv.innerHTML = `
                              <svg viewBox="0 0 50 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-[#e50b14] drop-shadow-md mb-2 transform -skew-x-12">
                                <path d="M47.5 10.5C49 10.5 50 11.5 50 13C50 14.5 49 15.5 47.5 15.5L30 15.5L15 23.5L10 23.5L18 15.5L5 15.5L0 12L5 10.5L18 10.5L10 2.5L15 2.5L30 10.5L47.5 10.5Z" fill="currentColor"/>
                              </svg>
                              <span class="text-white font-black text-xl tracking-tight leading-none drop-shadow-[0_2px_0_#e50b14]">AVIATOR</span>
                            `;
                            parent.appendChild(fallbackDiv);
                          }
                        }}
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 pointer-events-none"></div>
                    
                    {game.tag && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg z-20 shadow-md">
                        {game.tag}
                      </div>
                    )}
                    
                    {!game.imageUrl && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-0 opacity-50 group-hover:scale-110 transition-transform duration-500">
                        <game.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2 z-20 flex flex-col items-center text-center">
                      <h3 className="text-white font-black text-[11px] sm:text-sm tracking-tight leading-none mb-1 drop-shadow-md">{game.name}</h3>
                      <span className="text-[7px] text-amber-400 font-bold uppercase tracking-widest bg-black/50 px-1.5 py-0.5 rounded">{game.provider}</span>
                      
                      {!game.active && (
                        <div className="mt-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[7px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          Coming Soon
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <Search className="w-8 h-8 text-white/20 mb-2" />
            <span className="text-white/50 text-sm font-bold">No games found</span>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

function Crown(props: any) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M2 19h20v2H2v-2zm18-7.5l-3-6-4.5 4.5L12 3l-0.5 7L7 5.5l-3 6L2 17h20l-2-5.5z"/></svg>;}
