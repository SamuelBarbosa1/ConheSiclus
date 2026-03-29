import pool from '../src/lib/mysql';

async function listTables() {
  try {
    const [tables]: any = await pool.query('SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = database();');
    console.log('All Tables:', tables);

    for (const table of tables) {
      const [columns]: any = await pool.query(`SELECT COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = database() AND TABLE_NAME = ?;`, [table.TABLE_NAME]);
      console.log(`Columns for ${table.TABLE_NAME}:`, columns);
    }

    process.exit(0);
  } catch (error) {
    console.error('List tables failed:', error);
    process.exit(1);
  }
}

listTables();
