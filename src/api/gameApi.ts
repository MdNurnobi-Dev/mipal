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
    const rand = Math.random();
    
    // 10% chance of instant crash at 1.00 (Instant House sweep)
    if (rand < 0.10) return { crashPoint: 1.00 };
    
    // 25% chance of early crash between 1.01 and 1.30 (Prevents constant winning)
    if (rand < 0.35) {
      return { crashPoint: parseFloat((1.01 + Math.random() * 0.29).toFixed(2)) };
    }
    
    // 65% chance for Standard Crash Curve
    const r2 = Math.random();
    const e = 1 / (1 - r2);
    
    // Apply slight house edge to the curve
    const crashPoint = Math.max(1.00, e * 0.95); 
    
    // Cap max win at 1000x to prevent infinite loops, but allow large wins
    const finalCrash = Math.min(1000.00, crashPoint);
    
    return { crashPoint: parseFloat(finalCrash.toFixed(2)) };
  }

  public async spinSlot(bet: number, cols: number, rows: number, symbols: string[]): Promise<GameResult> {
    const r = Math.random();
    let multiplier = 0;
    let isWin = false;
    let isNearMiss = false;

    // Significantly reduced win rates and payouts for Super Ace (Slots)
    if (r < 0.02) { 
      // 2% chance for a moderate win (1.5x to 4.0x)
      multiplier = 1.5 + (Math.random() * 2.5);
      isWin = true;
    } else if (r < 0.17) { 
      // 15% chance for a "fake win" (0.1x to 0.5x) where they get back less than they bet
      multiplier = 0.1 + (Math.random() * 0.4);
      isWin = true;
    } else if (r < 0.40) { 
      // 23% chance of near miss (visual tease, no payout)
      isNearMiss = true;
    } else { 
      // 60% chance of total loss (0x)
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
