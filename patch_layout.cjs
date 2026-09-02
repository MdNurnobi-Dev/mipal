const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf-8');

// Add Gamepad2 icon import
if (!content.includes('Gamepad2')) {
  content = content.replace('import { Home, Briefcase', 'import { Home, Briefcase, Gamepad2');
}

// Modify navItems
const oldNavItems = `  const navItems = useMemo(() => [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Tasks', path: '/earnings', icon: Briefcase },
    { name: 'Plans', path: '/plan', icon: TrendingUp },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
  ], []);`;

const newNavItems = `  const navItems = useMemo(() => [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Tasks', path: '/earnings', icon: Briefcase },
    { name: 'Games', path: '/games', icon: Gamepad2, isGame: true },
    { name: 'Plans', path: '/plan', icon: TrendingUp },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
  ], []);`;

content = content.replace(oldNavItems, newNavItems);

// Modify return block for BottomNav
const oldReturn = `        {navItems.map((item) => {
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
        })}`;

const newReturn = `        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = path === item.path || (item.isGame && path.startsWith('/games'));

          if (item.isGame) {
            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative -top-5 flex flex-col items-center justify-center w-full h-full z-40"
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 active:scale-95 border-4 border-white",
                  isActive ? "bg-indigo-600 shadow-indigo-600/30" : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30"
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold mt-1",
                  isActive ? "text-indigo-600" : "text-slate-600"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          }

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
        })}`;

content = content.replace(oldReturn, newReturn);
fs.writeFileSync('src/components/Layout.tsx', content);
