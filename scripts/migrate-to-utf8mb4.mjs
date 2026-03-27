import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root directory
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function migrate() {
  const dbName = process.env.MYSQL_DATABASE;
  if (!dbName) {
    throw new Error('MYSQL_DATABASE environment variable is not defined.');
  }

  console.log(`\n🚀 Starting migration for database: ${dbName}`);

  try {
    // 1. Update Database Character Set
    console.log(`Setting database ${dbName} to utf8mb4...`);
    await pool.query(`ALTER DATABASE \`${dbName}\` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci`);
    
    // 2. Update Tables
    const tables = ['categorias', 'submenus', 'submenu_images', 'submenu_videos', 'submenu_related'];
    
    for (const table of tables) {
      console.log(`Converting table \`${table}\` to utf8mb4...`);
      // CONVERT TO CHARACTER SET also converts all columns
      await pool.query(`ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    }

    console.log('\n✅ Migration completed successfully!');
    
    // 3. Final Verification check within the script
    const [dbInfo] = await pool.query('SELECT DEFAULT_CHARACTER_SET_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?', [dbName]);
    console.log('Final Database Charset:', dbInfo[0].DEFAULT_CHARACTER_SET_NAME);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
