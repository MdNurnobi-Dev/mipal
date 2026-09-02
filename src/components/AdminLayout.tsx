import React, { useState, memo, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, Users, Briefcase, Settings, LogOut, CreditCard, ChevronDown, ChevronRight, Activity, Wallet, Download, Upload, Share2, Gift, Gamepad2 } from 'lucide-react';
import { cn } from '../lib/utils';

type NavItem = {
  id?: string;
  name: string;
  path: string;
  icon?: any;
};

type NavGroup = {
  id: string;
  name: string;
  icon: any;
  path?: string; // For single un-grouped items
  items?: NavItem[];
};

export const AdminLayout = memo(function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAdminAuthed, logout } = useApp();
  const { siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!isAdminAuthed) {
      navigate('/admin/login');
    }
  }, [isAdminAuthed, navigate]);
  if (!isAdminAuthed) return null;
  
  // By default, expand the group that matches the current path
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    users: location.pathname.includes('/users'),
    tasks: location.pathname.includes('/tasks'),
    financials: location.pathname.includes('/transactions'),
    payments: location.pathname.includes('/payments'),
    system: location.pathname.includes('/settings'),
    referrals: location.pathname.includes('/referrals'),
    marketing: location.pathname.includes('/marketing'),
    posts: location.pathname.includes('/posts'),
    games: location.pathname.includes('/games'),
  });

  const navGroups: NavGroup[] = useMemo(() => [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      items: [
        { name: 'All Users', path: '/admin/users' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing & Offers',
      icon: Gift,
      items: [
        { name: 'Giveaway Banner', path: '/admin/marketing/giveaway' },
    {
      id: 'posts',
      name: 'Community Posts',
      icon: MessageSquare,
      path: '/admin/posts'
    },
        { name: 'Daily Rewards', path: '/admin/marketing/daily-rewards' }
      ]
    },
    {
      id: 'referrals',
      name: 'Referral Control',
      icon: Share2,
      items: [
        { name: 'Referral Settings', path: '/admin/referrals' }
      ]
    },
    {
      id: 'tasks',
      name: 'Tasks & Plans',
      icon: Briefcase,
      items: [
        { name: 'Investment Plans', path: '/admin/plans' },
        { name: 'Micro Tasks', path: '/admin/tasks' }
      ]
    },
    {
      id: 'financials',
      name: 'Financials',
      icon: Activity,
      items: [
        { name: 'All Transactions', path: '/admin/transactions' }
      ]
    },
    {
      id: 'payments',
      name: 'Payment Center',
      icon: CreditCard,
      items: [
        { name: 'Gateways', path: '/admin/payments/gateways', icon: Wallet },
        { name: 'Pending Deposits', path: '/admin/payments/deposits/pending', icon: Download },
        { name: 'Approved Deposits', path: '/admin/payments/deposits/approved', icon: Download },
        { name: 'All Deposits', path: '/admin/payments/deposits/all', icon: Download },
        { name: 'Pending Withdraws', path: '/admin/payments/withdraws/pending', icon: Upload },
        { name: 'Approved Withdraws', path: '/admin/payments/withdraws/approved', icon: Upload },
      ]
    },
    {
      id: 'system',
      name: 'System',
      icon: Settings,
      items: [
        { name: 'General Settings', path: '/admin/settings' },
        { name: 'Branding & Logo', path: '/admin/branding' }
      ]
    },
    {
      id: 'games',
      name: 'Games & Casino',
      icon: Gamepad2,
      items: [
        { name: 'Game Banners', path: '/admin/games/banners' },
        { name: 'Manage Games', path: '/admin/games/manage' }
      ]
    }
  ], []);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] font-sans flex">
      {/* Sidebar - Compact Width */}
      <aside className="w-[220px] bg-white border-r border-slate-200/80 flex flex-col shrink-0 transition-all">
        <div className="h-12 flex items-center px-3.5 border-b border-slate-100 shrink-0">
          {siteSettings.logoUrl ? (
            <img src={siteSettings.logoUrl} alt={siteSettings.siteName} className="h-5 w-auto rounded object-contain mr-2" />
          ) : (
            <div className="w-5 h-5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded flex items-center justify-center font-semibold text-[10px] mr-2 shadow-2xs">{siteSettings.siteName.charAt(0).toUpperCase()}</div>
          )}
          <span className="font-semibold text-xs text-slate-800 tracking-tight">{siteSettings.siteName} <span className="text-indigo-600 font-medium">Admin</span></span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 no-scrollbar">
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-2 px-2">Navigation</p>
          
          {navGroups.map(group => {
            const Icon = group.icon;
            
            // Single Item
            if (group.path) {
              const isActive = location.pathname === group.path || (group.path === '/admin' && location.pathname === '/admin/');
              return (
                <Link 
                  key={group.id} 
                  to={group.path}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium text-[11px] transition-colors",
                    isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {group.name}
                </Link>
              );
            }
            
            // Group with Sub-items
            const isOpen = openGroups[group.id];
            const hasActiveChild = group.items?.some(item => location.pathname === item.path);
            
            return (
              <div key={group.id} className="space-y-0.5">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium text-[11px] transition-colors",
                    hasActiveChild && !isOpen ? "bg-indigo-50/50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-3.5 h-3.5", hasActiveChild ? "text-indigo-600" : "text-slate-400")} />
                    <span>{group.name}</span>
                  </div>
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-40" /> : <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
                </button>
                
                {isOpen && group.items && (
                  <div className="pl-4 pr-1 py-0.5 space-y-0.5">
                    {group.items.map(item => {
                      const SubIcon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1 rounded-md font-normal text-[10px] transition-colors",
                            isActive 
                              ? "bg-indigo-50 text-indigo-700 font-medium" 
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                          )}
                        >
                          {SubIcon && <SubIcon className="w-3 h-3 opacity-60" />}
                          {!SubIcon && <div className={cn("w-1 h-1 rounded-full", isActive ? "bg-indigo-600" : "bg-slate-300")} />}
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="p-2.5 border-t border-slate-100">
          <button 
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors text-[11px] font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-12 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 shrink-0">
          <h2 className="font-medium text-xs text-slate-700">Control Panel</h2>
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-medium text-slate-800 leading-tight">Super Admin</span>
              <span className="text-[9px] text-slate-400">System Owner</span>
            </div>
            <div className="w-6 h-6 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-medium text-[9px] shadow-2xs">
              SA
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50/70">
          {children}
        </main>
      </div>
    </div>
  );
});
