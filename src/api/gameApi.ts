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
  // MINES MATH
  // --------------------------------------------------------------------------
  public async initMines(bet: number, numMines: number, winControl: WinControlLevel = 'medium'): Promise<{ success: boolean, grid: boolean[], multiplierMultiplier: number, predeterminedLossStep?: number }> { 
     // grid is 25 squares. true = gem, false = mine
     const grid = Array(25).fill(true);
     let placed = 0;
     while(placed < numMines) {
       const idx = Math.floor(Math.random() * 25);
       if (grid[idx]) {
         grid[idx] = false;
         placed++;
       }
     }
     
     let predeterminedLossStep = undefined;

     if (winControl === 'zero') {
       predeterminedLossStep = Math.floor(Math.random() * 2) + 1; // Explode on 1st or 2nd click
     } else if (winControl === 'low') {
       predeterminedLossStep = Math.floor(Math.random() * 3) + 1; // Explode between 1st and 3rd click
     } else if (winControl === 'high') {
       // Only 10% chance to force a loss early
       if (Math.random() < 0.1) {
         predeterminedLossStep = Math.floor(Math.random() * 5) + 5;
       }
     } else {
       // Medium (default)
       // Let the grid handle it mostly, but slightly force loss around step 4-6 if unlucky
       if (Math.random() < 0.25) {
         predeterminedLossStep = Math.floor(Math.random() * 3) + 4;
       }
     }
     
     const multiplierMultiplier = 1.0 + (numMines * 0.1);
     
     return { success: true, grid, multiplierMultiplier, predeterminedLossStep };
  }
}

export const gameApi = new GameServerSimulator();
