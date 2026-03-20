import pool from '../src/lib/mysql';

async function check() {
  try {
    const [dbInfo]: any = await pool.query('SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = database();');
    console.log('Database Charset:', dbInfo[0]);

    const [tableInfo]: any = await pool.query("SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = database() AND TABLE_NAME IN ('submenus', 'categorias');");
    console.log('Tables Charset:', tableInfo);

    const [columnInfo]: any = await pool.query("SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = database() AND TABLE_NAME IN ('submenus', 'categorias');");
    console.log('Columns Charset:', columnInfo);

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

check();
