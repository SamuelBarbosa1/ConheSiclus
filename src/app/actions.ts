'use server';

import pool from '../lib/mysql';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { Categoria, Submenu } from '../types';

const SESSION_COOKIE = 'siclus_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function signSession(data: any) {
  const str = JSON.stringify(data);
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(str).digest('hex');
  return `${Buffer.from(str).toString('base64')}.${hmac}`;
}

function verifySession(token: string) {
  try {
    const [payloadBase64, signature] = token.split('.');
    const payload = Buffer.from(payloadBase64, 'base64').toString();
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (signature === expectedHmac) {
      return JSON.parse(payload);
    }
  } catch (e) {}
  return null;
}

// Helper for consistent uploads path
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function processSubmenuMedia(
  conn: any,
  submenuId: number | string,
  formData: FormData
) {
  // 1. Process Images (Files and URLs)
  const imageUrls = formData.getAll('imageUrls') as string[];
  const imageFiles = formData.getAll('imageFiles');
  const finalImageUrls: string[] = [];
  
  // Note: We need to maintain the order from AdminClient (imageFiles array and imageUrls array)
  // For simplicity, we follow the logic: first all existing URLs, then all new Files.
  imageUrls.forEach(url => {
    if (url && url.trim()) finalImageUrls.push(url.trim());
  });

  for (const file of imageFiles) {
    if (file instanceof File && file.size > 0) {
      const savedPath = await salvarArquivoLocal(file);
      if (savedPath) finalImageUrls.push(savedPath);
    }
  }

  // 2. Process Video URLs
  const videoUrls = formData.getAll('videoUrls') as string[];
  const finalVideoUrls = videoUrls.filter(url => url && url.trim()).map(url => url.trim());

  // 3. Process Related Submenus
  const relatedSubmenuIds = formData.getAll('relatedSubmenuIds') as string[];

  // 4. Update Database (Clear and Re-insert)
  await conn.query('DELETE FROM submenu_images WHERE submenuId = ?', [submenuId]);
  for (const url of finalImageUrls) {
    await conn.query('INSERT INTO submenu_images (submenuId, url) VALUES (?, ?)', [submenuId, url]);
  }

  await conn.query('DELETE FROM submenu_videos WHERE submenuId = ?', [submenuId]);
  for (const url of finalVideoUrls) {
    await conn.query('INSERT INTO submenu_videos (submenuId, url) VALUES (?, ?)', [submenuId, url]);
  }

  await conn.query('DELETE FROM submenu_related WHERE submenuId = ?', [submenuId]);
  for (const relId of relatedSubmenuIds) {
    await conn.query('INSERT INTO submenu_related (submenuId, relatedSubmenuId) VALUES (?, ?)', [submenuId, relId]);
  }
}

async function salvarArquivoLocal(file: File | null): Promise<string | null> {
  if (!file) {
    console.log('[LocalUpdate] Nenhum arquivo recebido (null/undefined).');
    return null;
  }

  if (typeof file === 'string') {
    console.log('[LocalUpdate] Recebido uma string em vez de um arquivo. Ignorando.');
    return null;
  }

  if (file.size === 0) {
    console.log(`[LocalUpdate] Arquivo '${file.name}' está vazio (0 bytes).`);
    return null;
  }

  if (!file.name || file.name === 'undefined') {
    console.log('[LocalUpdate] Arquivo sem nome válido recebido.');
    return null;
  }
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const nomeLimpo = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const filename = `${Date.now()}-${nomeLimpo}`;
    
    // Ensure dir exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filePath, buffer);
    
    console.log('[LocalUpdate] Arquivo salvo com sucesso em:', filePath);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('[LocalUpdate] Erro fatal ao salvar arquivo localmente:', err);
    return null;
  }
}

/* ============================
   CATEGORIA - SERVER ACTIONS
   ============================ */

export async function getCategorias() {
  try {
    const [rows]: any = await pool.query('SELECT * FROM categorias ORDER BY nome ASC');
    return rows.map((row: any) => ({
      ...row,
      id: row.id.toString()
    }));
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error.message || error);
    throw new Error('Falha ao buscar categorias. Verifique a conexão com o banco de dados.');
  }
}

export async function getMenuCompleto() {
  try {
    const [categorias]: any = await pool.query('SELECT * FROM categorias ORDER BY nome ASC');
    const [submenus]: any = await pool.query('SELECT * FROM submenus ORDER BY nome ASC');
    const [images]: any = await pool.query('SELECT * FROM submenu_images');
    const [videos]: any = await pool.query('SELECT * FROM submenu_videos');
    const [related]: any = await pool.query('SELECT * FROM submenu_related');
    
    return categorias.map((cat: any) => {
      const catSubmenus = submenus
        .filter((s: any) => s.categoriaId === cat.id)
        .map((s: any) => ({
          ...s,
          id: s.id.toString(),
          categoriaId: s.categoriaId.toString(),
          images: images
            .filter((img: any) => img.submenuId === s.id)
            .map((img: any) => ({ url: img.url, id: img.id.toString() })),
          videos: videos
            .filter((vid: any) => vid.submenuId === s.id)
            .map((vid: any) => ({ url: vid.url, id: vid.id.toString() })),
          relatedSubmenus: related
            .filter((rel: any) => rel.submenuId === s.id)
            .map((rel: any) => {
              const rSub = submenus.find((sub: any) => sub.id === rel.relatedSubmenuId);
              return { id: rel.relatedSubmenuId.toString(), nome: rSub?.nome || 'Desconhecido' };
            })
        }));
        
      return {
        ...cat,
        id: cat.id.toString(),
        submenus: catSubmenus
      };
    });
  } catch (error: any) {
    console.error('Erro ao buscar o menu completo:', error.message || error);
    throw new Error('Falha ao buscar o menu completo.');
  }
}

export async function criarCategoria(formData: FormData) {
  const nome = formData.get('nome') as string;
  const icone = formData.get('icone') as string | null;

  if (!nome) throw new Error('O nome da categoria é obrigatório.');

  try {
    await pool.query('INSERT INTO categorias (nome, icone) VALUES (?, ?)', [nome, icone || null]);
    revalidatePath('/admin');
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw new Error('Falha ao criar categoria.');
  }
}

export async function excluirCategoria(id: string) {
  try {
    await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
    revalidatePath('/admin');
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    throw new Error('Falha ao excluir categoria.');
  }
}

export async function atualizarCategoria(id: string, formData: FormData) {
  const nome = formData.get('nome') as string;
  const icone = formData.get('icone') as string | null;

  if (!nome) throw new Error('O nome da categoria é obrigatório.');

  try {
    await pool.query('UPDATE categorias SET nome = ?, icone = ? WHERE id = ?', [nome, icone || null, id]);
    revalidatePath('/admin');
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw new Error('Falha ao atualizar categoria.');
  }
}

/* ============================
   SUBMENU - SERVER ACTIONS
   ============================ */

export async function getSubmenus(categoriaId?: string) {
  try {
    let query = 'SELECT * FROM submenus';
    const params = [];
    if (categoriaId) {
      query += ' WHERE categoriaId = ?';
      params.push(categoriaId);
    }
    query += ' ORDER BY grupo ASC, nome ASC';
    
    const [rows]: any = await pool.query(query, params);
    const [images]: any = await pool.query('SELECT * FROM submenu_images');
    const [videos]: any = await pool.query('SELECT * FROM submenu_videos');

    return rows.map((row: any) => ({
      ...row,
      id: row.id.toString(),
      categoriaId: row.categoriaId.toString(),
      images: images
        .filter((img: any) => img.submenuId === row.id)
        .map((img: any) => ({ url: img.url, id: img.id.toString() })),
      videos: videos
        .filter((vid: any) => vid.submenuId === row.id)
        .map((vid: any) => ({ url: vid.url, id: vid.id.toString() }))
    }));
  } catch (error) {
    console.error('Erro ao buscar submenus:', error);
    throw new Error('Falha ao buscar submenus.');
  }
}

export async function getSubmenuById(id: string) {
  try {
    const [rows]: any = await pool.query('SELECT * FROM submenus WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    
    const submenu = rows[0];
    const [images]: any = await pool.query('SELECT * FROM submenu_images WHERE submenuId = ?', [id]);
    const [videos]: any = await pool.query('SELECT * FROM submenu_videos WHERE submenuId = ?', [id]);

    // Fetch related submenus
    const [relatedRows]: any = await pool.query(`
      SELECT s.id, s.nome 
      FROM submenus s
      JOIN submenu_related sr ON s.id = sr.relatedSubmenuId
      WHERE sr.submenuId = ?
    `, [id]);

    return {
      ...submenu,
      id: submenu.id.toString(),
      categoriaId: submenu.categoriaId.toString(),
      images: images.map((img: any) => ({ url: img.url, id: img.id.toString() })),
      videos: videos.map((vid: any) => ({ url: vid.url, id: vid.id.toString() })),
      relatedSubmenus: relatedRows.map((r: any) => ({ id: r.id.toString(), nome: r.nome }))
    };
  } catch (error) {
    console.error('Erro ao buscar submenu:', error);
    throw new Error('Falha ao buscar submenu.');
  }
}

export async function criarSubmenu(formData: FormData) {
  const nome = formData.get('nome') as string;
  const conteudo = formData.get('conteudo') as string;
  const grupo = typeof formData.get('grupo') === 'string' ? formData.get('grupo') as string : null;
  const categoriaId = formData.get('categoriaId') as string;

  if (!nome || !conteudo || !categoriaId) {
    throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [result]: any = await conn.query(
      'INSERT INTO submenus (nome, conteudo, grupo, categoriaId) VALUES (?, ?, ?, ?)',
      [nome, conteudo, grupo, categoriaId]
    );
    const submenuId = result.insertId;

    await processSubmenuMedia(conn, submenuId, formData);

    await conn.commit();
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Erro ao criar submenu:', error);
    throw new Error('Falha ao criar submenu.');
  } finally {
    if (conn) conn.release();
  }
}

export async function atualizarSubmenu(id: string, formData: FormData) {
  const nome = formData.get('nome') as string;
  const conteudo = formData.get('conteudo') as string;
  const grupo = typeof formData.get('grupo') === 'string' ? formData.get('grupo') as string : null;
  const categoriaId = formData.get('categoriaId') as string;

  if (!conteudo) throw new Error('O conteúdo é obrigatório.');

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query(
      'UPDATE submenus SET nome = COALESCE(?, nome), conteudo = ?, grupo = ?, categoriaId = COALESCE(?, categoriaId) WHERE id = ?',
      [nome, conteudo, grupo, categoriaId, id]
    );

    await processSubmenuMedia(conn, id, formData);

    await conn.commit();
    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Erro ao atualizar submenu:', error);
    throw new Error('Falha ao atualizar submenu.');
  } finally {
    if (conn) conn.release();
  }
}

export async function excluirSubmenu(id: string) {
  try {
    await pool.query('DELETE FROM submenus WHERE id = ?', [id]);
    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error) {
    console.error('Erro ao excluir submenu:', error);
    throw new Error('Falha ao excluir submenu.');
  }
}

/* ============================
   AUTH - SERVER ACTIONS
   ============================ */

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;

  if (!email || !senha) throw new Error('Email e senha são obrigatórios.');

  const [rows]: any = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  if (rows.length === 0) throw new Error('Usuário não encontrado.');

  const user = rows[0];
  const hashed = hashPassword(senha);

  if (user.senha !== hashed) {
    throw new Error('Senha incorreta.');
  }

  const sessionData = {
    userId: user.id,
    email: user.email,
    nome: user.nome,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  };

  const token = signSession(sessionData);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath('/admin');
}

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = verifySession(token);
  if (!session || session.expires < Date.now()) {
    return null;
  }
  return session;
}