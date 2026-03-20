import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function checkImages() {
  const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf-8');
  const env: Record<string, string> = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
  });

  const pool = mysql.createPool({
    host: env.MYSQL_HOST || 'localhost',
    port: parseInt(env.MYSQL_PORT || '3306'),
    user: env.MYSQL_USER || 'root',
    password: env.MYSQL_PASSWORD || '',
    database: env.MYSQL_DATABASE || 'conhece_siclus',
  });

  try {
    const [images]: any = await pool.query('SELECT * FROM submenu_images');
    console.log('--- submenu_images ---');
    console.log(JSON.stringify(images, null, 2));
    
    const [submenus]: any = await pool.query('SELECT id, nome FROM submenus');
    console.log('\n--- submenus ---');
    console.log(JSON.stringify(submenus, null, 2));
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Check images failed:', error);
    process.exit(1);
  }
}

checkImages();
