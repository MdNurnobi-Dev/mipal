const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("UPDATE users SET role = 'admin' WHERE email = 'victorsteele428@gmail.com'");
    console.log(`Updated ${res.rowCount} users to admin.`);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
