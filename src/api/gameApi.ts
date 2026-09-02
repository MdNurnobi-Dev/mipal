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

class GameServerSimulator {
  public async initCrashRound(): Promise<{ crashPoint: number }> {
    // Make users lose more often by increasing instant crashes and low crashes
    const rand = Math.random();
    
    // 15% chance to crash immediately at 1.00 (Instant Loss)
    if (rand < 0.15) return { crashPoint: 1.00 };
    
    // 40% chance to crash between 1.01 and 1.30 (Very Quick Loss)
    if (rand < 0.55) {
      return { crashPoint: parseFloat((1.01 + Math.random() * 0.29).toFixed(2)) };
    }

    // Remaining 45% chance - heavily dampened crash curve
    const r = Math.random();
    const e = 1 / (1 - r); // Standard crash curve
    // Dampen the multiplier heavily to reduce big wins (e.g., multiply by 0.75 instead of GLOBAL_RTP)
    const crashPoint = Math.max(1.00, e * 0.75); 
    
    // Cap max win at 100x just to be safe
    const finalCrash = Math.min(100.00, crashPoint);
    
    return { crashPoint: parseFloat(finalCrash.toFixed(2)) };
  }

  public async spinSlot(bet: number, cols: number, rows: number, symbols: string[]): Promise<GameResult> {
    const r = Math.random();
    let multiplier = 0;
    let isWin = false;
    let isNearMiss = false;

    if (r < 0.05) {
      multiplier = 2 + (Math.random() * 8);
      isWin = true;
    } else if (r < 0.35) {
      multiplier = 0.2 + (Math.random() * 1.0);
      isWin = true;
    } else if (r < 0.50) {
      isNearMiss = true;
    } else {
      multiplier = 0;
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
  public async initMines(bet: number, numMines: number): Promise<{ success: boolean, grid: boolean[], multiplierMultiplier: number }> {
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
     
     // The base multiplier logic for each step (simplified)
     const multiplierMultiplier = 1.0 + (numMines * 0.1); 
     
     return { success: true, grid, multiplierMultiplier };
  }
}

export const gameApi = new GameServerSimulator();
