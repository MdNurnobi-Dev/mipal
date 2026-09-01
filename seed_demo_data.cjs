const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    // Check if tasks exist
    const taskRes = await pool.query("SELECT COUNT(*) FROM tasks");
    if (parseInt(taskRes.rows[0].count) === 0) {
      const demoTasks = [
        { id: 't1', title: 'Watch Tutorial Video', type: 'Video', reward: 0.25, limit_text: 'Watch for 30s', status: 'Active', duration: 30, action_url: 'https://youtube.com' },
        { id: 't2', title: 'Visit Sponsor Website', type: 'Website', reward: 0.15, limit_text: 'Stay for 15s', status: 'Active', duration: 15, action_url: 'https://google.com' },
        { id: 't3', title: 'Daily Tech Quiz', type: 'Quiz', reward: 0.50, limit_text: '3 Questions', status: 'Active', duration: 60, action_url: '', quizData: JSON.stringify([{question: "What is 2+2?", options: ["3", "4", "5"], answer: "4"}]) },
      ];
      for (const t of demoTasks) {
        await pool.query(
          "INSERT INTO tasks (id, title, type, reward, limit_text, status, duration, action_url, quiz_data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [t.id, t.title, t.type, t.reward, t.limit_text, t.status, t.duration, t.action_url, t.quizData || null]
        );
      }
      console.log("Seeded demo tasks");
    }

    // Check gateways
    const gwRes = await pool.query("SELECT COUNT(*) FROM gateways");
    if (parseInt(gwRes.rows[0].count) === 0) {
      const gws = [
        { id: 'g1', name: 'Bkash', details: 'Personal: 01700000000', is_active: true },
        { id: 'g2', name: 'Nagad', details: 'Personal: 01800000000', is_active: true },
        { id: 'g3', name: 'Binance (USDT)', details: 'TRC20: Txxxxxxxxxxxxxxxxxxxxxxxx', is_active: true }
      ];
      for (const g of gws) {
        await pool.query(
          "INSERT INTO gateways (id, name, details, is_active) VALUES ($1, $2, $3, $4)",
          [g.id, g.name, g.details, g.is_active]
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
        "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
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
