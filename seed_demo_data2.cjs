const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    // Check gateways
    const gwRes = await pool.query("SELECT COUNT(*) FROM gateways");
    if (parseInt(gwRes.rows[0].count) === 0) {
      const gws = [
        { id: 'g1', name: 'Bkash', type: 'fiat', currency: 'BDT', minAmount: 100, maxAmount: 10000, charge: 2, instructions: 'Send money to our number', details: 'Personal: 01700000000' },
        { id: 'g2', name: 'Nagad', type: 'fiat', currency: 'BDT', minAmount: 100, maxAmount: 10000, charge: 2, instructions: 'Send money to our number', details: 'Personal: 01800000000' },
        { id: 'g3', name: 'Binance', type: 'crypto', currency: 'USDT', minAmount: 1, maxAmount: 10000, charge: 0.5, instructions: 'Send USDT to TRC20 address', details: 'TRC20: Txxxxxxxxxxxxxxxxxxxxxxxx' }
      ];
      for (const g of gws) {
        await pool.query(
          "INSERT INTO gateways (id, name, type, currency, min_amount, max_amount, charge, instructions, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [g.id, g.name, g.type, g.currency, g.minAmount, g.maxAmount, g.charge, g.instructions, g.details]
        );
      }
      console.log("Seeded demo gateways");
    }

    // Default settings
    const keys = [
      { key: 'siteSettings', value: { siteName: "My Earning App", currency: "BDT", minWithdraw: 10, withdrawalFee: 2 } },
      { key: 'giveawayBanners', value: [{ id: "b1", title: "Weekend Double Reward!", subtitle: "Earn 2x on all tasks this weekend.", color: "bg-indigo-600", isActive: true }] },
      { key: 'referralSettings', value: { newUserBonusAmount: 1.0, referrerBonusAmount: 2.5, depositBonusPercent: 5 } }
    ];
    for (const k of keys) {
      await pool.query(
        "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [k.key, JSON.stringify(k.value)]
      );
    }
    console.log("Seeded demo settings");
    
    // Transactions
    const txRes = await pool.query("SELECT COUNT(*) FROM transactions");
    if (parseInt(txRes.rows[0].count) === 0) {
       await pool.query(
         "INSERT INTO transactions (id, user_id, user_name, type, amount, method, date, status, user_details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
         ['tx1', 'u1', 'Demo User', 'deposit', 50, 'Bkash', new Date().toISOString(), 'approved', 'TrxID: 8XK9Q2M']
       );
       console.log("Seeded demo transactions");
    }

  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();
