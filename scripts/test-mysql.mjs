import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'conhece_siclus',
});

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
