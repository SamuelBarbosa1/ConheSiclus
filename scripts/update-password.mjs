import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function updatePassword() {
  const args = process.argv.slice(2);
  const email = args[0];
  const newPassword = args[1];

  if (!email || !newPassword) {
    console.error('Uso: node scripts/update-password.mjs <email> <nova_senha>');
    process.exit(1);
  }

  try {
    console.log(`Atualizando senha para: ${email}...`);
    
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length === 0) {
      console.error('Erro: Usuário não encontrado.');
      process.exit(1);
    }

    const hashed = hashPassword(newPassword);
    await pool.query('UPDATE usuarios SET senha = ? WHERE email = ?', [hashed, email]);
    
    console.log('\n✅ Senha atualizada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Falha ao atualizar senha:', error.message);
    process.exit(1);
  }
}

updatePassword();
