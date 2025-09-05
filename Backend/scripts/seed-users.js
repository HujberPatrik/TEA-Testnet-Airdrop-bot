const bcrypt = require('bcrypt');
const pool = require('../config/db'); // a projekted db config-ja

async function seed() {
  const users = [
    { email: 'admin@example.com', neptun: 'AAA111', full_name: 'Admin User', role: 'Admin', password: 'Admin@123' },
    { email: 'foadmin@example.com', neptun: 'BBB222', full_name: 'Főadmin User', role: 'Főadmin', password: 'FoAdmin@123' },
    { email: 'famulus@example.com', neptun: 'CCC333', full_name: 'Uni Famulus', role: 'Uni-Famulus', password: 'Famulus@123' },
  ];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      // állítsd be a mezőneveket a users tábla szerintihez (pl. password_hash vagy password)
      await client.query(
        `INSERT INTO users (email, full_name, neptun_code, role, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, now(), now())
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, updated_at = now()`,
        [u.email.toLowerCase(), u.full_name, u.neptun.toUpperCase(), u.role, hash]
      );
      console.log('seeded', u.email);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
}

seed();