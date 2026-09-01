import React, { useState, memo, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Wallet, TrendingUp, User, Menu, X, Settings, LogOut, Info, HelpCircle, Gift, Bell, BarChart3, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import OnboardingTutorial from './OnboardingTutorial';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { useSiteSettings } from '../hooks/useSiteSettings';

export const BottomNav = memo(function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = useMemo(() => [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Tasks', path: '/earnings', icon: Briefcase },
    { name: 'Plans', path: '/plan', icon: TrendingUp },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
  ], []);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-30">
      <div className="flex justify-around items-center h-14 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = path === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-800"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
});

export const Layout = memo(function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { notifications, currentUser, logout } = useApp();
  const { siteSettings } = useSiteSettings();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!currentUser) {
      // Preserve search query like ?ref=XYZ when redirecting to auth
      navigate(`/auth${location.search ? location.search : ''}`, { replace: true });
    }
  }, [currentUser, navigate, location.search]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.isRead).length;

  return (
    <div className="h-[100dvh] bg-[#F1F5F9] font-sans max-w-md mx-auto shadow-xl ring-1 ring-slate-900/5 sm:rounded-3xl sm:h-[calc(100vh-4rem)] sm:my-8 overflow-hidden relative text-[#1E293B] flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="flex justify-between items-center w-full px-3 py-2 h-12">
          <div className="flex items-center gap-2">
            <button 
              id="menu-toggle-btn"
              onClick={() => setIsMenuOpen(true)}
              className="p-1 -ml-1 text-slate-500 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-50"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {siteSettings.logoUrl ? (
                <img src={siteSettings.logoUrl} alt={siteSettings.siteName} className="h-6 w-auto rounded object-contain" />
              ) : (
                <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px] shadow-sm" style={{backgroundColor: siteSettings.primaryColor}}>
                  {siteSettings.siteName.charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="text-base font-bold tracking-tight text-slate-800">{siteSettings.siteName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/notifications" id="header-notifications-link" className="relative p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </Link>
            <Link to="/profile" id="header-profile-link" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-indigo-500 transition-all shadow-xs">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`;
                  }}
                />
              ) : (
                <User className="w-4 h-4 text-indigo-600" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Onboarding Overlay */}
      <OnboardingTutorial />

      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/40 z-40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Side Navigation Menu */}
      <div 
        className={`absolute inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        <div className="p-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {siteSettings.logoUrl ? (
                <img src={siteSettings.logoUrl} alt={siteSettings.siteName} className="h-7 w-auto rounded object-contain" />
              ) : (
                <div className="w-7 h-7 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm" style={{backgroundColor: siteSettings.primaryColor}}>
                  {siteSettings.siteName.charAt(0).toUpperCase()}
                </div>
              )}
            <span className="font-bold text-sm text-slate-800">{siteSettings.siteName}</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 bg-white shadow-sm border border-slate-200 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 flex-1 overflow-y-auto space-y-4 no-scrollbar">
          {/* User Profile Mini-Card */}
          <Link 
            to="/profile" 
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2.5 p-2.5 bg-slate-50 hover:bg-indigo-50/70 rounded-xl border border-slate-100 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-200 shrink-0">
              <img 
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'User'}`} 
                alt={currentUser?.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'User'}`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser?.email || 'Active Account'}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 shrink-0">
              {formatCurrency(currentUser?.balance)}
            </span>
          </Link>

          {/* Main Navigation */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2">Main Menu</p>
            <div className="space-y-0.5">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <Home className="w-4 h-4" />
                <span className="font-semibold text-xs">Home</span>
              </Link>
              <Link to="/earnings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <Briefcase className="w-4 h-4" />
                <span className="font-semibold text-xs">Available Tasks</span>
              </Link>
              <Link to="/earnings-analytics" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-xs">Earnings & Trends</span>
                </div>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 group-hover:bg-indigo-100">
                  Analytics
                </span>
              </Link>
              <Link to="/platform-activity" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs">Platform Activity</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 group-hover:bg-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </Link>
              <Link to="/plan" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold text-xs">Investment Plans</span>
              </Link>
            </div>
          </div>

          {/* Finance & Account */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2">Finance & Account</p>
            <div className="space-y-0.5">
              <Link to="/wallet" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4" />
                  <span className="font-semibold text-xs">My Wallet</span>
                </div>
              </Link>
              <Link to="/deposit" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold">+</span>
                </div>
                <span className="font-semibold text-xs">Add Funds</span>
              </Link>
              <Link to="/withdraw" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold">-</span>
                </div>
                <span className="font-semibold text-xs">Withdraw Funds</span>
              </Link>
            </div>
          </div>

          {/* Personal */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2">Personal</p>
            <div className="space-y-0.5">
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <User className="w-4 h-4" />
                <span className="font-semibold text-xs">My Profile</span>
              </Link>
              <Link to="/refer" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <Gift className="w-4 h-4" />
                <span className="font-semibold text-xs">Invite & Earn</span>
              </Link>
            </div>
          </div>
          
          {/* Support & More */}
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-2">Support & Settings</p>
            <div className="space-y-0.5">
              <Link to="/help" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <HelpCircle className="w-4 h-4" />
                <span className="font-semibold text-xs">Help Center</span>
              </Link>
              <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                <Settings className="w-4 h-4" />
                <span className="font-semibold text-xs">Settings</span>
              </Link>
              <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-2">
                <LogOut className="w-4 h-4" />
                <span className="font-semibold text-xs">Sign Out</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50">
          <p className="text-[10px] font-medium text-slate-400">{siteSettings.siteName} v1.0.0</p>
        </div>

      </div>

      <main className="p-3 overflow-y-auto h-full pt-[60px] pb-[70px] no-scrollbar">
        {children}
      </main>
      <BottomNav />
    </div>
  );
});
