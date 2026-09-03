const fs = require('fs');
const content = fs.readFileSync('src/pages/games/Mines.tsx', 'utf8');
const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('<div className="fixed inset-0'));

const newBlock = `    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-transparent overflow-hidden">
      
      {/* 1. TOP CASINO APP BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-slate-200 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <Link 
            to="/games" 
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold tracking-wider leading-none text-slate-800">MINES</span>
              <span className="text-[8px] font-bold tracking-widest text-emerald-600 uppercase leading-none">SPRIBE STYLE</span>
            </div>
          </div>
        </div>

        {/* User Balance & Audio/Info Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-inner">
            <span className="text-[10px] text-slate-500 font-medium uppercase">Balance:</span>
            <span className="text-xs font-semibold text-emerald-600 tracking-tight">{formatCurrency(currentUser?.balance || 0)}</span>
          </div>

          <button 
            type="button"
            onClick={toggleSound}
            className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
          </button>

          <button 
            type="button"
            onClick={() => setShowRules(true)}
            className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      </div>

      {/* 2. TOP WIN HISTORY & ACTIVE PROGRESSION BAR (ZERO SCROLLBAR, ULTRA COMPACT) */}
      <div className="bg-white border-b border-slate-200 px-2.5 py-1.5 shrink-0 flex items-center justify-between gap-2 z-10">
        
        {/* Left: Previous Rounds Win History Pills */}
        <div className="flex items-center gap-1 overflow-x-hidden select-none shrink-0">
          <span className="text-[9px] font-medium uppercase text-slate-400 tracking-wider hidden sm:inline mr-0.5">History:</span>
          {roundHistory.slice(0, 5).map((item, idx) => (
            <div 
              key={idx}
              className={\`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-tight flex items-center transition-all \${
                item.won 
                  ? item.mult >= 3.0 
                    ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-rose-50 text-rose-500 border border-rose-200'
              }\`}
            >
              {item.won ? \`\${item.mult.toFixed(2)}x\` : '0.00x'}
            </div>
          ))}
        </div>

        {/* Right: Active / Next Multiplier Capsule */}
        <div className="flex items-center gap-1.5 shrink-0">
          {gameState === 'playing' ? (
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md animate-pulse">
              <span className="text-[9px] text-emerald-600 font-medium uppercase">Next:</span>
              <span className="text-[10px] font-bold text-emerald-700">{nextStepMult.toFixed(2)}x</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
              <span className="text-[9px] text-slate-500 font-medium uppercase">Max:</span>
              <span className="text-[10px] font-bold text-amber-600">
                {multipliersTable[multipliersTable.length - 1]?.toFixed(2) || '99.00'}x
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. CENTER GAME ARENA (5x5 GRID & LIVE STATUS) */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-1.5 relative overflow-hidden bg-slate-50">
        
        {/* Live Multiplier & Status Capsule */}
        <div className="w-full max-w-[360px] sm:max-w-[380px] flex items-center justify-between mb-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs shadow-sm">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-500 uppercase font-medium">Mines:</span>
            <span className="font-semibold text-rose-500 flex items-center gap-0.5 text-[10px]">
              <Flame className="w-2.5 h-2.5" /> {minesCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-500 uppercase font-medium">Gems:</span>
            <span className="font-semibold text-emerald-600 text-[10px]">{25 - minesCount - revealedCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-500 uppercase font-medium">Current:</span>
            <span className="font-semibold text-amber-500 text-[10px]">{currentMultiplier.toFixed(2)}x</span>
          </div>
        </div>

        {/* 5x5 MINES CASINO GRID */}
        <div className="w-full max-w-[360px] sm:max-w-[380px] aspect-square grid grid-cols-5 gap-1 sm:gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
          {grid.map((cell, idx) => {
            const isClickable = gameState === 'playing' && !cell.revealed;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleReveal(idx)}
                disabled={!isClickable}
                className={\`
                  relative rounded-lg flex items-center justify-center transition-all duration-200 select-none overflow-hidden
                  \${!cell.revealed 
                    ? 'bg-slate-100 border border-slate-200 shadow-sm hover:bg-slate-200 active:translate-y-[1px] active:shadow-none cursor-pointer' 
                    : ''
                  }
                  \${cell.revealed && !cell.isMine 
                    ? 'bg-emerald-50 border border-emerald-200 animate-[scale_0.2s_ease-out]' 
                    : ''
                  }
                  \${cell.revealed && cell.isMine 
                    ? cell.isTriggeredMine 
                      ? 'bg-rose-50 border border-rose-300 animate-[shake_0.3s_ease-in-out]' 
                      : 'bg-rose-50/50 border border-rose-200/50 opacity-70'
                    : ''
                  }
                \`}
              >
                {/* Visual Unrevealed Accent Dot */}
                {!cell.revealed && (
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-300 group-hover:bg-emerald-400 transition-colors" />
                )}

                {/* Revealed Gem / Bomb */}
                {cell.revealed && (
                  cell.isMine ? (
                    <MinesBombVector 
                      className={\`w-6 h-6 sm:w-7 sm:h-7 drop-shadow-sm \${cell.isTriggeredMine ? 'scale-110 animate-bounce' : 'opacity-80'}\`} 
                    />
                  ) : (
                    <MinesGemVector className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-sm animate-[zoomIn_0.2s_ease-out]" />
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* Snug Game Message / Pick Random Pill */}
        <div className="h-6 mt-1 flex items-center justify-center w-full max-w-[360px] sm:max-w-[380px]">
          {gameState === 'exploded' && (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-sm animate-bounce">
              <Flame className="w-3 h-3 text-rose-500" />
              <span>Round Lost (-\${formatCurrency(bet)})</span>
            </div>
          )}
          {gameState === 'cashed_out' && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-sm animate-bounce">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Cashed Out! +\${formatCurrency(lastWinAmount)}</span>
            </div>
          )}
          {gameState === 'playing' && (
            <button 
              onClick={handlePickRandom}
              className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all active:scale-95"
            >
              <Dices className="w-3 h-3" />
              <span>Pick Random</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. ULTRA-COMPACT CASINO CONTROLS AREA */}
      <div className="bg-white px-2.5 py-1.5 flex flex-col gap-1.5 shrink-0 border-t border-slate-200 z-20 shadow-sm">
        
        {/* Row 1: Bet Amount & Mine Selectors */}
        <div className="grid grid-cols-2 gap-1.5">
          
          {/* Bet Input with Quick Adjusters */}
          <div className="bg-slate-50 p-1.5 rounded-md border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 font-medium uppercase">Bet Amount</span>
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={handleHalfBet}
                  disabled={gameState === 'playing'}
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 active:scale-95"
                >
                  ½
                </button>
                <button 
                  type="button"
                  onClick={handleDoubleBet}
                  disabled={gameState === 'playing'}
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 active:scale-95"
                >
                  2X
                </button>
                <button 
                  type="button"
                  onClick={handleMaxBet}
                  disabled={gameState === 'playing'}
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 active:scale-95"
                >
                  MAX
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-500">৳</span>
              <input 
                type="number" 
                value={bet}
                onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
                disabled={gameState === 'playing'}
                className="w-full bg-transparent text-slate-800 font-semibold text-xs outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Mines Count Selector */}
          <div className="bg-slate-50 p-1.5 rounded-md border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 font-medium uppercase">Mines Count</span>
              <span className="text-[9px] text-rose-500 font-medium">{minesCount} Mines</span>
            </div>
            <div className="flex items-center gap-1">
              <select 
                value={minesCount}
                onChange={(e) => setMinesCount(Number(e.target.value))}
                disabled={gameState === 'playing'}
                className="w-full bg-white text-slate-800 font-medium text-xs py-1 px-1.5 rounded border border-slate-200 outline-none cursor-pointer disabled:opacity-40"
              >
                {[1, 2, 3, 4, 5, 7, 10, 15, 20, 24].map(n => (
                  <option key={n} value={n} className="bg-white text-slate-800">
                    {n} Mines ({(25 - n)} Gems)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Prominent BET / CASHOUT Action Button */}
        <div>
          {gameState !== 'playing' ? (
            <button 
              type="button"
              onClick={startGame}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-md py-2 font-semibold text-xs uppercase active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>BET {formatCurrency(bet)}</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => handleCashOut()}
              disabled={revealedCount === 0}
              className={\`w-full rounded-md py-2 font-semibold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-sm \${
                revealedCount === 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.98] animate-pulse cursor-pointer'
              }\`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>
                {revealedCount === 0 
                  ? 'PICK A TILE FIRST' 
                  : \`CASHOUT \${formatCurrency(bet * currentMultiplier)} (+\${formatCurrency(currentProfit)})\`
                }
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 5. RULES & PAYTABLE MODAL */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
            {/* Modal Header */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <MinesGemVector className="w-5 h-5 drop-shadow-sm" />
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Mines Game Rules</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowRules(false)}
                className="w-6 h-6 rounded bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 overflow-y-auto space-y-3 text-[11px] text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <h4 className="font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> How to Play
                </h4>
                <p className="leading-relaxed">
                  1. Set your <b>Bet Amount</b> and choose the number of <b>Mines</b> hidden in the 5x5 grid (from 1 to 24).<br />
                  2. Click <b>BET</b> to begin the round.<br />
                  3. Tap on any unrevealed tile. If you uncover a <b>Gem</b>, your multiplier increases! You can cash out anytime.<br />
                  4. If you uncover a <b>Mine</b>, the round ends and your bet is lost.
                </p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <h4 className="font-semibold text-amber-600 mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Multiplier Math (Spribe Model)
                </h4>
                <p className="leading-relaxed">
                  Multipliers are calculated using combinatorics based on the probability of finding consecutive safe gems with high RTP (96%).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 border-t border-slate-200 bg-slate-50">
              <button 
                type="button"
                onClick={() => setShowRules(false)}
                className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

const updatedLines = [...lines.slice(0, startIdx), newBlock];
fs.writeFileSync('src/pages/games/Mines.tsx', updatedLines.join('\n'));
