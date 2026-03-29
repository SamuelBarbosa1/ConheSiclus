import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

async function deleteAdmin() {
  const args = process.argv.slice(2);
  const email = args[0];

  if (!email) {
    console.error('Uso: node scripts/delete-admin.mjs <email>');
    process.exit(1);
  }

  try {
    console.log(`Excluindo usuário administrador: ${email}...`);
    
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length === 0) {
      console.error('Erro: Usuário não encontrado.');
      process.exit(1);
    }

    await pool.query('DELETE FROM usuarios WHERE email = ?', [email]);
    
    console.log('\n✅ Usuário excluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Falha ao excluir usuário:', error.message);
    process.exit(1);
  }
}

deleteAdmin();
