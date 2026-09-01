import React from 'react';

interface RouteLoadingFallbackProps {
  isAdmin?: boolean;
}

export default function RouteLoadingFallback({ isAdmin = false }: RouteLoadingFallbackProps) {
  return (
    <div className={`min-h-[50vh] flex flex-col items-center justify-center p-6 transition-all animate-in fade-in duration-200 ${isAdmin ? 'bg-slate-950 text-slate-200' : 'bg-transparent text-slate-600'}`}>
      <div className="relative flex items-center justify-center">
        <div className={`w-10 h-10 rounded-full border-2 ${isAdmin ? 'border-indigo-900 border-t-indigo-400' : 'border-indigo-100 border-t-indigo-600'} animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-indigo-400' : 'bg-indigo-600'} animate-pulse`} />
        </div>
      </div>
      <p className={`mt-3 text-xs font-medium tracking-wide ${isAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
        Loading view...
      </p>
    </div>
  );
}
