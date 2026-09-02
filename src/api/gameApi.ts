// ============================================================================
// CASINO MATH & GAME SERVER SIMULATION (BACKEND API)
// ============================================================================

const GLOBAL_RTP = 0.94; // 94% Return to Player (6% House Edge)

export type GameResult = {
  success: boolean;
  payout: number;
  multiplier: number;
  isWin: boolean;
  state?: any; 
};

export type WinControlLevel = 'zero' | 'low' | 'medium' | 'high';

const FORTUNE_GEMS_PAYLINE_DEFS = [
  { id: 1, name: 'Top Row', coords: [0, 0, 0] },
  { id: 2, name: 'Center Row', coords: [1, 1, 1] },
  { id: 3, name: 'Bottom Row', coords: [2, 2, 2] },
  { id: 4, name: 'Diagonal ↘', coords: [0, 1, 2] },
  { id: 5, name: 'Diagonal ↗', coords: [2, 1, 0] },
];

const FORTUNE_GEMS_PAYOUT_MAP: Record<string, number> = {
  WILD: 25,
  RUBY: 20,
  SAPPHIRE: 15,
  EMERALD: 10,
  A: 5,
  K: 4,
  Q: 3,
  J: 2,
};

function evaluateFortuneGemsPaylines(grid: string[][], multiplier: number, lineBet: number) {
  let totalWin = 0;
  const winningLines: { lineId: number; symbolId: string; lineWin: number }[] = [];

  for (const line of FORTUNE_GEMS_PAYLINE_DEFS) {
    const s0 = grid[0][line.coords[0]];
    const s1 = grid[1][line.coords[1]];
    const s2 = grid[2][line.coords[2]];

    let matchSym: string | null = null;
    if (s0 !== 'WILD') matchSym = s0;
    else if (s1 !== 'WILD') matchSym = s1;
    else if (s2 !== 'WILD') matchSym = s2;
    else matchSym = 'WILD';

    const m0 = s0 === 'WILD' || s0 === matchSym;
    const m1 = s1 === 'WILD' || s1 === matchSym;
    const m2 = s2 === 'WILD' || s2 === matchSym;

    if (m0 && m1 && m2 && matchSym) {
      const basePay = (FORTUNE_GEMS_PAYOUT_MAP[matchSym] || 2) * lineBet;
      const finalLineWin = basePay * multiplier;
      totalWin += finalLineWin;
      winningLines.push({
        lineId: line.id,
        symbolId: matchSym,
        lineWin: finalLineWin
      });
    }
  }

  return { totalWin, winningLines };
}

function generateNonWinningFortuneGemsGrid(): string[][] {
  const LOW_SYMBOLS = ['A', 'K', 'Q', 'J', 'EMERALD'];

  for (let attempt = 0; attempt < 100; attempt++) {
    const grid: string[][] = [
      [LOW_SYMBOLS[Math.floor(Math.random() * LOW_SYMBOLS.length)], LOW_SYMBOLS[Math.floor(Math.random() * LOW_SYMBOLS.length)], LOW_SYMBOLS[Math.floor(Math.random() * LOW_SYMBOLS.length)]],
      [LOW_SYMBOLS[Math.floor(Math.random() * LOW_SYMBOLS.length)], LOW_SYMBOLS[Math.floor(Math.random() * LOW_SYMBOLS.length)], LOW_SYMBOLS[Math.floor(Math.random() * LOW_SYMBOLS.length)]],
      [LOW_SYMBOLS[Math.floor(Math.random() * LOW_SYMBOLS.length)], LOW_SYMBOLS[Math.floor(Math.random() * LOW_SYMBOLS.length)], LOW_SYMBOLS[Math.floor(Math.random() * LOW_SYMBOLS.length)]],
    ];

    // Near miss teasers on col 0 or 1
    if (Math.random() < 0.3) grid[0][Math.floor(Math.random() * 3)] = Math.random() < 0.5 ? 'WILD' : 'RUBY';
    if (Math.random() < 0.25) grid[1][Math.floor(Math.random() * 3)] = 'SAPPHIRE';

    const { totalWin } = evaluateFortuneGemsPaylines(grid, 1, 1);
    if (totalWin === 0) {
      return grid;
    }
  }

  // Absolute fail-safe non-winning grid
  return [
    ['J', 'Q', 'K'],
    ['K', 'J', 'Q'],
    ['Q', 'K', 'J']
  ];
}

function generateWinningFortuneGemsGrid(targetSymbol: string, targetLineId?: number): string[][] {
  const chosenLine = targetLineId 
    ? FORTUNE_GEMS_PAYLINE_DEFS.find(l => l.id === targetLineId) || FORTUNE_GEMS_PAYLINE_DEFS[1] 
    : FORTUNE_GEMS_PAYLINE_DEFS[Math.floor(Math.random() * FORTUNE_GEMS_PAYLINE_DEFS.length)];

  const grid = generateNonWinningFortuneGemsGrid();

  for (let c = 0; c < 3; c++) {
    const r = chosenLine.coords[c];
    grid[c][r] = (Math.random() < 0.08 && targetSymbol !== 'WILD') ? 'WILD' : targetSymbol;
  }

  return grid;
}

class GameServerSimulator {
  public async initCrashRound(winControl: WinControlLevel = 'medium'): Promise<{ crashPoint: number }> {
    const rand = Math.random();
    
    if (winControl === 'zero') {
      return { crashPoint: 1.00 }; // Always crash immediately
    }

    if (winControl === 'low') {
      if (rand < 0.40) return { crashPoint: 1.00 };
      if (rand < 0.85) return { crashPoint: parseFloat((1.01 + Math.random() * 0.20).toFixed(2)) };
      const e = 1 / (1 - Math.random());
      return { crashPoint: parseFloat(Math.min(2.00, Math.max(1.00, e * 0.90)).toFixed(2)) };
    }

    if (winControl === 'high') {
      if (rand < 0.05) return { crashPoint: 1.00 };
      if (rand < 0.20) return { crashPoint: parseFloat((1.01 + Math.random() * 0.50).toFixed(2)) };
      const r2 = Math.random();
      const e = 1 / (1 - r2);
      const crashPoint = Math.max(1.00, e * 1.5); 
      return { crashPoint: parseFloat(Math.min(1000.00, crashPoint).toFixed(2)) };
    }

    // Default 'medium'
    if (rand < 0.10) return { crashPoint: 1.00 };
    
    if (rand < 0.35) {
      return { crashPoint: parseFloat((1.01 + Math.random() * 0.29).toFixed(2)) };
    }
    
    const r2 = Math.random();
    const e = 1 / (1 - r2);
    
    const crashPoint = Math.max(1.00, e * 0.95); 
    
    const finalCrash = Math.min(1000.00, crashPoint);
    
    return { crashPoint: parseFloat(finalCrash.toFixed(2)) };
  }

  public async spinSlot(bet: number, cols: number, rows: number, symbols: string[], winControl: WinControlLevel = 'medium'): Promise<GameResult> {
    const r = Math.random();
    let multiplier = 0;
    let isWin = false;
    let isNearMiss = false;

    if (winControl === 'zero') {
       multiplier = 0;
       isNearMiss = r < 0.3; // 30% near miss
    } else if (winControl === 'low') {
       if (r < 0.01) { multiplier = 1.1 + (Math.random() * 1.0); isWin = true; }
       else if (r < 0.10) { multiplier = 0.1 + (Math.random() * 0.3); isWin = true; }
       else if (r < 0.40) { isNearMiss = true; }
       else { multiplier = 0; }
    } else if (winControl === 'high') {
       if (r < 0.20) { multiplier = 2.0 + (Math.random() * 10.0); isWin = true; }
       else if (r < 0.50) { multiplier = 0.5 + (Math.random() * 1.5); isWin = true; }
       else if (r < 0.70) { isNearMiss = true; }
       else { multiplier = 0; }
    } else {
       // Medium (default)
       if (r < 0.02) { 
         multiplier = 1.5 + (Math.random() * 2.5); 
         isWin = true; 
       } else if (r < 0.17) { 
         multiplier = 0.1 + (Math.random() * 0.4); 
         isWin = true; 
       } else if (r < 0.40) { 
         isNearMiss = true; 
       } else { 
         multiplier = 0; 
       }
    }

    const grid: string[][] = [];
    for (let c = 0; c < cols; c++) {
      const col = [];
      for (let r = 0; r < rows; r++) {
        col.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      grid.push(col);
    }
    
    if (isNearMiss) {
      const teaseSymbol = symbols[0];
      grid[0][0] = teaseSymbol;
      grid[1][0] = teaseSymbol;
      grid[2][0] = symbols[1]; 
    }
    
    return {
      success: true,
      payout: parseFloat((bet * multiplier).toFixed(2)),
      multiplier: parseFloat(multiplier.toFixed(2)),
      isWin,
      state: { grid, isNearMiss }
    };
  }

  // --------------------------------------------------------------------------
  // FORTUNE GEMS (AUTHENTIC JILI MATH & STRICT WIN CONTROL)
  // --------------------------------------------------------------------------
  public async spinFortuneGems(bet: number, winControl: WinControlLevel = 'medium'): Promise<{
    success: boolean;
    grid: string[][];
    multiplier: number;
    payout: number;
    isWin: boolean;
    winningLines: { lineId: number; symbolId: string; lineWin: number }[];
  }> {
    const lineBet = bet / 5;
    const rand = Math.random();

    let targetWin = false;
    let targetMultiplier = 1;
    let targetSymbol = 'J';

    if (winControl === 'zero') {
      targetWin = false;
      targetMultiplier = Math.random() < 0.85 ? 1 : 2;
    } else if (winControl === 'low') {
      // 8% win rate (92% loss rate)
      if (rand < 0.08) {
        targetWin = true;
        const rSym = Math.random();
        if (rSym < 0.50) targetSymbol = 'J'; // 0.4x bet
        else if (rSym < 0.80) targetSymbol = 'Q'; // 0.6x bet
        else if (rSym < 0.95) targetSymbol = 'K'; // 0.8x bet
        else targetSymbol = 'A'; // 1.0x bet

        targetMultiplier = Math.random() < 0.92 ? 1 : 2;
      } else {
        targetWin = false;
        targetMultiplier = Math.random() < 0.85 ? 1 : (Math.random() < 0.96 ? 2 : 3);
      }
    } else if (winControl === 'high') {
      // 45% win rate
      if (rand < 0.45) {
        targetWin = true;
        const rSym = Math.random();
        if (rSym < 0.25) targetSymbol = 'A';
        else if (rSym < 0.45) targetSymbol = 'EMERALD';
        else if (rSym < 0.65) targetSymbol = 'SAPPHIRE';
        else if (rSym < 0.85) targetSymbol = 'RUBY';
        else targetSymbol = 'WILD';

        const rMult = Math.random();
        if (rMult < 0.35) targetMultiplier = 1;
        else if (rMult < 0.60) targetMultiplier = 2;
        else if (rMult < 0.80) targetMultiplier = 3;
        else if (rMult < 0.92) targetMultiplier = 5;
        else if (rMult < 0.98) targetMultiplier = 10;
        else targetMultiplier = 15;
      } else {
        targetWin = false;
        targetMultiplier = Math.random() < 0.60 ? 1 : 2;
      }
    } else {
      // 'medium' (Default casino RTP ~92%, hit rate ~18%)
      if (rand < 0.18) {
        targetWin = true;
        const rSym = Math.random();
        if (rSym < 0.40) targetSymbol = 'J'; // 0.4x bet on 1x
        else if (rSym < 0.65) targetSymbol = 'Q'; // 0.6x bet on 1x
        else if (rSym < 0.82) targetSymbol = 'K'; // 0.8x bet on 1x
        else if (rSym < 0.92) targetSymbol = 'A'; // 1.0x bet on 1x
        else if (rSym < 0.97) targetSymbol = 'EMERALD'; // 2.0x bet on 1x
        else if (rSym < 0.99) targetSymbol = 'SAPPHIRE'; // 3.0x bet on 1x
        else targetSymbol = Math.random() < 0.7 ? 'RUBY' : 'WILD';

        const rMult = Math.random();
        if (rMult < 0.78) targetMultiplier = 1;
        else if (rMult < 0.93) targetMultiplier = 2;
        else if (rMult < 0.98) targetMultiplier = 3;
        else if (rMult < 0.997) targetMultiplier = 5;
        else targetMultiplier = 10;
      } else {
        targetWin = false;
        const rMult = Math.random();
        if (rMult < 0.75) targetMultiplier = 1;
        else if (rMult < 0.92) targetMultiplier = 2;
        else if (rMult < 0.98) targetMultiplier = 3;
        else targetMultiplier = 5;
      }
    }

    let finalGrid: string[][];
    if (targetWin) {
      finalGrid = generateWinningFortuneGemsGrid(targetSymbol);
    } else {
      finalGrid = generateNonWinningFortuneGemsGrid();
    }

    const { totalWin, winningLines } = evaluateFortuneGemsPaylines(finalGrid, targetMultiplier, lineBet);

    // If target was a loss, ensure zero payout strictly
    if (!targetWin && totalWin > 0) {
      finalGrid = generateNonWinningFortuneGemsGrid();
      return {
        success: true,
        grid: finalGrid,
        multiplier: targetMultiplier,
        payout: 0,
        isWin: false,
        winningLines: []
      };
    }

    return {
      success: true,
      grid: finalGrid,
      multiplier: targetMultiplier,
      payout: parseFloat(totalWin.toFixed(2)),
      isWin: totalWin > 0,
      winningLines
    };
  }

  // --------------------------------------------------------------------------
  // MINES MATH & STRICT CASINO WIN CONTROL
  // --------------------------------------------------------------------------
  public getMinesMultiplier(mines: number, revealedGems: number): number {
    if (revealedGems <= 0) return 1.0;
    const totalTiles = 25;
    const safeTiles = totalTiles - mines;
    if (revealedGems > safeTiles) revealedGems = safeTiles;

    // Calculate combinatorics probability P(k) = ( (25-m)! / (25-m-k)! ) / ( 25! / (25-k)! )
    let prob = 1.0;
    for (let i = 0; i < revealedGems; i++) {
      prob *= (safeTiles - i) / (totalTiles - i);
    }

    // 96% Base RTP (4% House Edge)
    const rawMult = 0.96 / prob;
    return parseFloat(rawMult.toFixed(2));
  }

  public async initMines(bet: number, numMines: number, winControl: WinControlLevel = 'medium'): Promise<{
    success: boolean;
    grid: boolean[]; // true = gem, false = mine
    forcedLossStep?: number;
    multipliersTable: number[];
  }> {
    // Generate base random grid with numMines placed
    const grid = Array(25).fill(true);
    let placed = 0;
    while (placed < numMines) {
      const idx = Math.floor(Math.random() * 25);
      if (grid[idx]) {
        grid[idx] = false;
        placed++;
      }
    }

    let forcedLossStep: number | undefined = undefined;
    const rand = Math.random();

    if (winControl === 'zero') {
      // 100% loss - Explode on the very 1st click
      forcedLossStep = 1;
    } else if (winControl === 'low') {
      // 92% loss rate (High House Edge)
      // 80% explode on 1st click, 16% explode on 2nd click, 4% explode on 3rd click
      if (rand < 0.80) {
        forcedLossStep = 1;
      } else if (rand < 0.96) {
        forcedLossStep = 2;
      } else {
        forcedLossStep = 3;
      }
    } else if (winControl === 'high') {
      // 50% win rate
      if (rand < 0.35) {
        forcedLossStep = Math.floor(Math.random() * 5) + 4; // allow 4-8 steps
      }
    } else {
      // 'medium' (Standard casino RTP ~92%)
      if (rand < 0.55) {
        // Natural explosion or cap at step 2-4
        forcedLossStep = Math.floor(Math.random() * 3) + 2;
      }
    }

    // Precalculate multiplier sequence for this mine count up to 25-mines
    const maxSteps = 25 - numMines;
    const multipliersTable: number[] = [];
    for (let s = 1; s <= maxSteps; s++) {
      multipliersTable.push(this.getMinesMultiplier(numMines, s));
    }

    return {
      success: true,
      grid,
      forcedLossStep,
      multipliersTable
    };
  }
}

export const gameApi = new GameServerSimulator();
