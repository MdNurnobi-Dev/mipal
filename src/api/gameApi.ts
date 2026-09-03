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

  // --------------------------------------------------------------------------
  // WILD BOUNTY SHOWDOWN MATH & CASCADE ENGINE (3,600 WAYS)
  // --------------------------------------------------------------------------
  public async spinWildBounty(
    bet: number,
    winControl: WinControlLevel = 'medium',
    isFreeSpins: boolean = false
  ): Promise<{
    success: boolean;
    initialGrid: { symbol: string; isGold: boolean; isWild: boolean }[][];
    isWin: boolean;
    isFreeSpinsTriggered: boolean;
    scatterCount: number;
    cascades: {
      grid: { symbol: string; isGold: boolean; isWild: boolean }[][];
      winningPositions: { col: number; row: number }[];
      waysCount: number;
      matchedSymbol: string;
      stepWin: number;
      multiplier: number;
    }[];
    totalWin: number;
    finalMultiplier: number;
  }> {
    const ROW_COUNTS = [3, 4, 5, 5, 4, 3];
    const REGULAR_SYMBOLS = ['OUTLAW', 'GOLD', 'WHISKEY', 'HAT', 'A', 'K', 'Q', 'J'];
    const PAYOUT_TABLE: Record<string, number[]> = {
      OUTLAW:  [0, 0, 10, 20, 30, 50],
      GOLD:    [0, 0, 8,  15, 20, 30],
      WHISKEY: [0, 0, 6,  10, 15, 20],
      HAT:     [0, 0, 5,  8,  12, 15],
      A:       [0, 0, 3,  5,  8,  10],
      K:       [0, 0, 2,  4,  6,  8],
      Q:       [0, 0, 1.5, 3, 5,  6],
      J:       [0, 0, 1,   2, 3,  4],
    };

    const rand = Math.random();
    let targetWin = false;
    let targetScatters = false;

    if (winControl === 'zero') {
      targetWin = false;
      targetScatters = false;
    } else if (winControl === 'low') {
      // Very strict 8% win rate
      targetWin = rand < 0.08;
      targetScatters = rand < 0.005;
    } else if (winControl === 'high') {
      // 30% win rate
      targetWin = rand < 0.30;
      targetScatters = rand < 0.05;
    } else {
      // medium: ~18% win rate
      targetWin = rand < 0.18;
      targetScatters = rand < 0.015;
    }

    if (isFreeSpins) {
      targetWin = Math.random() < 0.45; // Free spins are exciting, but toned down from 65%
    }

    // Generate Initial Grid
    const grid: { symbol: string; isGold: boolean; isWild: boolean }[][] = [];
    for (let c = 0; c < 6; c++) {
      const colRows = ROW_COUNTS[c];
      const col: { symbol: string; isGold: boolean; isWild: boolean }[] = [];
      for (let r = 0; r < colRows; r++) {
        const sym = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
        const isGold = (c >= 1 && c <= 4) && Math.random() < 0.12;
        col.push({ symbol: sym, isGold, isWild: false });
      }
      grid.push(col);
    }

    // Place Scatters if triggered
    let scatterCount = 0;
    if (targetScatters && !isFreeSpins) {
      scatterCount = 3 + (Math.random() < 0.2 ? 1 : 0);
      const chosenCols = [0, 1, 2, 3, 4, 5].sort(() => 0.5 - Math.random()).slice(0, scatterCount);
      chosenCols.forEach(colIdx => {
        const rowIdx = Math.floor(Math.random() * ROW_COUNTS[colIdx]);
        grid[colIdx][rowIdx] = { symbol: 'SCATTER', isGold: false, isWild: false };
      });
    } else if (Math.random() < 0.20) {
      // Teaser 1 or 2 scatters
      const teasers = Math.random() < 0.7 ? 1 : 2;
      scatterCount = teasers;
      const chosenCols = [0, 1, 2, 3, 4, 5].sort(() => 0.5 - Math.random()).slice(0, teasers);
      chosenCols.forEach(colIdx => {
        const rowIdx = Math.floor(Math.random() * ROW_COUNTS[colIdx]);
        grid[colIdx][rowIdx] = { symbol: 'SCATTER', isGold: false, isWild: false };
      });
    }

    // Helper to evaluate ways to win
    const evaluateWays = (currentGrid: typeof grid) => {
      const wins: {
        symbol: string;
        consecutiveReels: number;
        positions: { col: number; row: number }[];
        ways: number;
        payoutMult: number;
      }[] = [];

      for (const sym of REGULAR_SYMBOLS) {
        let reelMatches: { col: number; rows: number[] }[] = [];

        for (let c = 0; c < 6; c++) {
          const matchedRows: number[] = [];
          for (let r = 0; r < ROW_COUNTS[c]; r++) {
            const cell = currentGrid[c][r];
            if (cell.symbol === sym || cell.symbol === 'WILD' || cell.isWild) {
              matchedRows.push(r);
            }
          }
          if (matchedRows.length > 0) {
            reelMatches.push({ col: c, rows: matchedRows });
          } else {
            break; // must be consecutive from reel 0
          }
        }

        if (reelMatches.length >= 3) {
          const consecutiveReels = reelMatches.length;
          let ways = 1;
          const positions: { col: number; row: number }[] = [];
          reelMatches.forEach(rm => {
            ways *= rm.rows.length;
            rm.rows.forEach(r => positions.push({ col: rm.col, row: r }));
          });

          // Payout table scaled down slightly to manage huge multi-way bursts
          const table = PAYOUT_TABLE[sym] || [0, 0, 1, 2, 3, 4];
          const payoutMult = table[consecutiveReels - 1] || 1;

          wins.push({
            symbol: sym,
            consecutiveReels,
            positions,
            ways,
            payoutMult
          });
        }
      }

      return wins;
    };

    // If targetWin is desired, force match on reels 0, 1, 2, 3
    if (targetWin) {
      const matchSym = REGULAR_SYMBOLS[Math.floor(Math.random() * (REGULAR_SYMBOLS.length - 2))]; // Prefer medium-high
      const matchLength = Math.random() < 0.25 ? 5 : Math.random() < 0.5 ? 4 : 3;
      for (let c = 0; c < matchLength; c++) {
        const r = Math.floor(Math.random() * ROW_COUNTS[c]);
        grid[c][r] = {
          symbol: matchSym,
          isGold: c >= 1 && c <= 4 && Math.random() < 0.3,
          isWild: false
        };
      }
    } else {
      // Actively prevent accidental natural wins when targetWin is false
      // by breaking any potential chains in the first 3 reels.
      const offsets = [0, 3, 6];
      for (let c = 0; c < 3; c++) {
        for (let r = 0; r < ROW_COUNTS[c]; r++) {
          grid[c][r].symbol = REGULAR_SYMBOLS[(offsets[c] + r) % REGULAR_SYMBOLS.length];
          grid[c][r].isWild = false;
        }
      }
    }

    // Execute Cascades Simulation
    const cascades: {
      grid: typeof grid;
      winningPositions: { col: number; row: number }[];
      waysCount: number;
      matchedSymbol: string;
      stepWin: number;
      multiplier: number;
    }[] = [];

    let activeMultiplier = isFreeSpins ? 8 : 1;
    let totalWin = 0;
    let workingGrid = JSON.parse(JSON.stringify(grid));

    const maxCascades = targetWin ? (winControl === 'high' ? 5 : winControl === 'medium' ? 3 : 2) : 1;

    for (let cascadeStep = 0; cascadeStep < maxCascades; cascadeStep++) {
      const wins = evaluateWays(workingGrid);
      if (wins.length === 0) break;

      // Aggregate winning positions & payouts
      const winningPositionsSet = new Set<string>();
      const winningPositions: { col: number; row: number }[] = [];
      let stepWin = 0;
      let totalWays = 0;
      let primarySym = wins[0].symbol;

      wins.forEach(w => {
        totalWays += w.ways;
        // Payout scaled down heavily (bet / 150) to prevent massive runway inflation on 3600 ways
        const lineWin = (w.payoutMult * (bet / 150)) * w.ways * activeMultiplier;
        stepWin += lineWin;
        w.positions.forEach(p => {
          const key = `${p.col},${p.row}`;
          if (!winningPositionsSet.has(key)) {
            winningPositionsSet.add(key);
            winningPositions.push(p);
          }
        });
      });

      totalWin += stepWin;

      cascades.push({
        grid: JSON.parse(JSON.stringify(workingGrid)),
        winningPositions,
        waysCount: totalWays,
        matchedSymbol: primarySym,
        stepWin: parseFloat(stepWin.toFixed(2)),
        multiplier: activeMultiplier
      });

      // Prepare Next Cascade: Turn winning Gold into WILD, clear other wins, drop new symbols
      const nextGrid: typeof grid = [];
      for (let c = 0; c < 6; c++) {
        const remainingCells: { symbol: string; isGold: boolean; isWild: boolean }[] = [];
        for (let r = 0; r < ROW_COUNTS[c]; r++) {
          const isWinning = winningPositionsSet.has(`${c},${r}`);
          const cell = workingGrid[c][r];
          if (isWinning) {
            if (cell.isGold) {
              // Transforms into Wild!
              remainingCells.push({ symbol: 'WILD', isGold: false, isWild: true });
            }
            // Non-gold winning symbols explode and are removed
          } else {
            remainingCells.push(cell);
          }
        }

        // Fill top with new symbols
        while (remainingCells.length < ROW_COUNTS[c]) {
          let newSym = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
          
          // Artificial choking to prevent infinite cascades
          if (cascadeStep >= maxCascades - 2) {
             const safeOffsets = [0, 3, 6, 1, 4, 7];
             newSym = REGULAR_SYMBOLS[(safeOffsets[c] + remainingCells.length) % REGULAR_SYMBOLS.length];
          }

          const newGold = (c >= 1 && c <= 4) && Math.random() < 0.10;
          remainingCells.unshift({ symbol: newSym, isGold: newGold, isWild: false });
        }
        nextGrid.push(remainingCells);
      }

      workingGrid = nextGrid;
      // Double multiplier on each consecutive cascade up to 1024x
      activeMultiplier = Math.min(1024, activeMultiplier * 2);
    }

    return {
      success: true,
      initialGrid: grid,
      isWin: totalWin > 0,
      isFreeSpinsTriggered: scatterCount >= 3,
      scatterCount,
      cascades,
      totalWin: parseFloat(totalWin.toFixed(2)),
      finalMultiplier: cascades.length > 0 ? cascades[cascades.length - 1].multiplier : activeMultiplier
    };
  }
}

export const gameApi = new GameServerSimulator();
