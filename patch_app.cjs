const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Imports
if (!content.includes('Games = lazy')) {
  content = content.replace('const PlatformActivity = lazy', 'const Games = lazy(() => import(\'./pages/Games\'));\nconst CrashGame = lazy(() => import(\'./pages/games/Crash\'));\nconst PlatformActivity = lazy');
}

// Routes
const routeInsertStr = `<Route path="/wallet" element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Wallet />
              </Suspense>
            } />`;
            
const newRouteStr = routeInsertStr + `
            <Route path="/games" element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <Games />
              </Suspense>
            } />
            <Route path="/games/crash" element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <CrashGame />
              </Suspense>
            } />`;

content = content.replace(routeInsertStr, newRouteStr);
fs.writeFileSync('src/App.tsx', content);
