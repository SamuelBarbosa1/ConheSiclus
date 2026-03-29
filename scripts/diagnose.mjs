import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
  console.log('--- Environment Check ---');
  console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
  console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
  console.log('MYSQL_USER:', process.env.MYSQL_USER);
  console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
  console.log('MYSQL_PASSWORD length:', process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD.length : 0);

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: (process.env.MYSQL_DATABASE || 'conhe_siclus').trim(),
  });

  try {
    console.log('\n--- Connection Check ---');
    const [result] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ Connection successful!');

    console.log('\n--- Tables Check ---');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables found:', tables.map(t => Object.values(t)[0]));

    const [hasUsuarios] = await pool.query("SHOW TABLES LIKE 'usuarios'");
    if (hasUsuarios.length > 0) {
      console.log('✅ "usuarios" table exists.');
    } else {
      console.log('❌ "usuarios" table does not exist!');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Diagnosis failed:');
    console.error(error.message);
    if (error.code) console.error('Error Code:', error.code);
    process.exit(1);
  }
}

diagnose();
