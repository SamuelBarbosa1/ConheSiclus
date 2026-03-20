import pool from './src/lib/mysql.js';

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('MySQL Connection Successful!', rows);
    process.exit(0);
  } catch (error) {
    console.error('MySQL Connection Failed:', error);
    process.exit(1);
  }
}

testConnection();
