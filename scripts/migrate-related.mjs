import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'conhe_siclus',
  });

  try {
    console.log('Criando tabela submenu_related...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submenu_related (
        submenuId INT NOT NULL,
        relatedSubmenuId INT NOT NULL,
        PRIMARY KEY (submenuId, relatedSubmenuId),
        FOREIGN KEY (submenuId) REFERENCES submenus(id) ON DELETE CASCADE,
        FOREIGN KEY (relatedSubmenuId) REFERENCES submenus(id) ON DELETE CASCADE
      );
    `);
    console.log('Tabela criada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    process.exit(1);
  }
}

migrate();
