const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    // Check users
    const usrRes = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(usrRes.rows[0].count) <= 1) { // maybe only the admin exists
      await pool.query(
         "INSERT INTO users (id, name, email, password, balance, status, role, joined) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING",
         ['u2', 'Demo User', 'demo@example.com', 'password123', 15.5, 'Active', 'user', new Date().toISOString()]
      );
    }
    
    // Check posts
    const postRes = await pool.query("SELECT COUNT(*) FROM posts");
    if (parseInt(postRes.rows[0].count) === 0) {
      await pool.query(
        "INSERT INTO posts (id, user_id, user_name, content, likes, comments, shares, created_at, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        ['post1', 'u2', 'Demo User', 'Just joined this amazing platform! Earning every day.', 5, 0, 1, new Date().toISOString(), 'approved']
      );
    }

    // Check notifications
    const notifRes = await pool.query("SELECT COUNT(*) FROM notifications");
    if (parseInt(notifRes.rows[0].count) === 0) {
      await pool.query(
        "INSERT INTO notifications (id, user_id, title, message, is_read, date, type) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        ['n1', 'u2', 'Welcome!', 'Thanks for joining our platform.', false, new Date().toISOString(), 'system']
      );
    }

    console.log("Seeded more demo data");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
