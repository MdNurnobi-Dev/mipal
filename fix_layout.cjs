const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// The wrapper container needs to be a scroll container itself so sticky header works on it instead of body
code = code.replace(
  'className="min-h-screen bg-[#F1F5F9] pb-20 font-sans max-w-md mx-auto shadow-xl ring-1 ring-slate-900/5 sm:rounded-3xl sm:my-8 overflow-hidden relative text-[#1E293B] no-scrollbar overflow-x-hidden"',
  'className="h-[100dvh] bg-[#F1F5F9] pb-20 font-sans max-w-md mx-auto shadow-xl ring-1 ring-slate-900/5 sm:rounded-3xl sm:h-[calc(100vh-4rem)] sm:my-8 overflow-y-auto relative text-[#1E293B] no-scrollbar overflow-x-hidden"'
);

fs.writeFileSync('src/components/Layout.tsx', code);
