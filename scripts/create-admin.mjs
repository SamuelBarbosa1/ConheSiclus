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

// Simple hashing function using Node.js built-in crypto
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createAdmin() {
  const args = process.argv.slice(2);
  const nome = args[0] || 'Admin';
  const email = args[1] || 'admin@siclus.com.br';
  const senha = args[2] || 'admin123';

  try {
    console.log(`Creating admin user: ${nome} (${email})...`);

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Error: User with this email already exists.');
      process.exit(1);
    }

    const hashed = hashPassword(senha);
    await pool.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hashed]);

    console.log('\n✅ Usuário administrador criado com sucesso!');
    console.log('-------------------------------');
    console.log(`Email: ${email}`);
    console.log(`Senha: ${senha}`);
    console.log('-------------------------------');
    console.log('IMPORTANTE: Guarde essas credenciais com segurança.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Falha ao criar usuário administrador:', error.message);
    process.exit(1);
  }
}

createAdmin();


