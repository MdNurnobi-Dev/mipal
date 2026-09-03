import os
import re

games_dir = 'src/pages/games'
for file_name in os.listdir(games_dir):
    if not file_name.endswith('.tsx'): continue
    file_path = os.path.join(games_dir, file_name)
    with open(file_path, 'r') as f:
        content = f.read()

    # Find the main component return
    # Usually: `  return (\n    <div className="bg-...`
    # Let's find the first `return (\n    <div className="` after `export default function` or `export function`
    
    # Simple replace for the roots:
    if file_name == 'Crash.tsx':
        content = content.replace('<div className="bg-[#000000] text-white">', '<div className="fixed inset-0 z-[100] flex flex-col w-full h-full overflow-hidden bg-[#000000] text-white">', 1)
        # Fix bets area max-w
        content = content.replace('<div className="grid grid-cols-2 gap-1.5 w-full max-w-lg mx-auto">', '<div className="grid grid-cols-2 gap-1.5 w-full h-full">')
    
    elif file_name == 'FlyX.tsx':
        content = content.replace('<div className="bg-[#060b13] text-white font-sans selection:bg-transparent overflow-hidden">', '<div className="fixed inset-0 z-[100] flex flex-col w-full h-full overflow-hidden bg-[#060b13] text-white font-sans selection:bg-transparent">', 1)
        # Fix layout
        content = content.replace('<main className="flex-1 w-full max-w-4xl mx-auto flex flex-col overflow-y-auto no-scrollbar pb-[80px] relative z-10">', '<main className="flex-1 w-full flex flex-col overflow-y-auto no-scrollbar pb-[80px] relative z-10">')
        content = content.replace('<div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5">', '<div className="w-full flex items-center justify-between gap-1.5">')
        
    elif file_name == 'FortuneGems.tsx':
        content = content.replace('<div className="bg-[#03151f] font-sans overflow-hidden text-white">', '<div className="fixed inset-0 z-[100] flex flex-col w-full h-full overflow-hidden bg-[#03151f] font-sans text-white">', 1)
        content = content.replace('<div className="w-full h-full max-w-md mx-auto bg-[#1b2b36]', '<div className="w-full h-full flex-1 bg-[#1b2b36]')
        content = content.replace('<div className="w-full max-w-[280px] mx-auto mt-1.5', '<div className="w-full mt-1.5')
        
    elif file_name == 'Mines.tsx':
        content = content.replace('<div className="bg-[#0c131c] text-white font-sans selection:bg-transparent overflow-hidden">', '<div className="fixed inset-0 z-[100] flex flex-col w-full h-full overflow-hidden bg-[#0c131c] text-white font-sans selection:bg-transparent">', 1)
        content = content.replace('<div className="w-full max-w-[380px] flex flex-col items-center gap-1.5">', '<div className="w-full flex-1 flex flex-col items-center gap-1.5">')
        content = content.replace('<div className="flex items-center justify-between w-full max-w-[380px] mb-2 px-1">', '<div className="flex items-center justify-between w-full mb-2 px-1">')

    elif file_name == 'Spaceman.tsx':
        content = content.replace('<div className="bg-[#000000] text-slate-200 select-none font-sans overflow-hidden">', '<div className="fixed inset-0 z-[100] flex flex-col w-full h-full overflow-hidden bg-[#000000] text-slate-200 select-none font-sans">', 1)
        content = content.replace('<main className="flex-1 w-full max-w-4xl mx-auto flex flex-col overflow-y-auto no-scrollbar pb-2 relative z-10">', '<main className="flex-1 w-full flex flex-col overflow-y-auto no-scrollbar pb-2 relative z-10">')
        content = content.replace('<div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5">', '<div className="w-full flex items-center justify-between gap-1.5">')
        
    elif file_name == 'SuperAce.tsx':
        content = content.replace('<div className="bg-[#03151f] font-sans overflow-hidden text-white">', '<div className="fixed inset-0 z-[100] flex flex-col w-full h-full overflow-hidden bg-[#03151f] font-sans text-white">', 1)
        content = content.replace('<div className="w-full h-full max-w-md mx-auto bg-[#1b2b36]', '<div className="w-full h-full flex-1 bg-[#1b2b36]')
        content = content.replace('<div className="w-full max-w-[260px] mx-auto mt-1.5', '<div className="w-full mt-1.5')

    elif file_name == 'WildBounty.tsx':
        content = content.replace('<div className="bg-[#140a05] font-sans text-slate-100 select-none overflow-hidden">', '<div className="fixed inset-0 z-[100] flex flex-col w-full h-full overflow-hidden bg-[#140a05] font-sans text-slate-100 select-none">', 1)
        content = content.replace('<div className="max-w-xl mx-auto w-full px-2 pt-2 flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar pb-6 relative">', '<div className="w-full px-2 pt-2 flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar pb-6 relative">')
        content = content.replace('max-w-lg mx-auto w-full', 'w-full')
        
    with open(file_path, 'w') as f:
        f.write(content)
        
    print(f"Updated {file_name}")

