import pool from '../src/lib/mysql';

async function migrate() {
  try {
    console.log('Starting migration to utf8mb4...');

    // Update database character set
    const databaseName = process.env.MYSQL_DATABASE || 'conhece_siclus';
    await pool.query(`ALTER DATABASE \`${databaseName}\` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;`);
    console.log(`Database ${databaseName} updated to utf8mb4.`);

    // Update all tables to utf8mb4
    const tables = ['submenus', 'categorias', 'submenu_images', 'submenu_videos', 'submenu_related'];
    
    for (const table of tables) {
      await pool.query(`ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      console.log(`Table ${table} updated to utf8mb4.`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
