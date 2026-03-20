'use server';

import pool from '../lib/mysql';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

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
    const root = process.cwd();
    console.log('[LocalUpdate] ROOT do processo:', root);
    const uploadsDir = path.join(root, 'public', 'uploads');
    
    console.log('[LocalUpdate] Verificando diretório:', uploadsDir);
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, filename);
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

  const imageUrls = formData.getAll('imageUrls') as string[];
  const imageFiles = formData.getAll('imageFiles');
  
  console.log('[CriarSubmenu] Recebendo:', { imageUrls, imageFilesCount: imageFiles.length });

  const finalImageUrls: string[] = [];
  imageUrls.forEach(url => {
    if (url && url.trim()) finalImageUrls.push(url.trim());
  });
  
  for (const file of imageFiles) {
    if (file instanceof File && file.size > 0) {
      console.log('[CriarSubmenu] Processando arquivo:', file.name);
      const path = await salvarArquivoLocal(file);
      if (path) finalImageUrls.push(path);
    }
  }

    const videoUrls = formData.getAll('videoUrls') as string[];
    const finalVideoUrls = videoUrls.filter(url => url && url.trim()).map(url => url.trim());

    const relatedSubmenuIds = formData.getAll('relatedSubmenuIds') as string[];

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      const [result]: any = await conn.query(
        'INSERT INTO submenus (nome, conteudo, grupo, categoriaId) VALUES (?, ?, ?, ?)',
        [nome, conteudo, grupo, categoriaId]
      );
      const submenuId = result.insertId;

      for (const url of finalImageUrls) {
        await conn.query('INSERT INTO submenu_images (submenuId, url) VALUES (?, ?)', [submenuId, url]);
      }

      for (const url of finalVideoUrls) {
        await conn.query('INSERT INTO submenu_videos (submenuId, url) VALUES (?, ?)', [submenuId, url]);
      }

      for (const relId of relatedSubmenuIds) {
        await conn.query('INSERT INTO submenu_related (submenuId, relatedSubmenuId) VALUES (?, ?)', [submenuId, relId]);
      }

      await conn.commit();
      console.log('[CriarSubmenu] Sucesso para ID:', submenuId);
    revalidatePath('/admin');
    revalidatePath('/');
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

  const imageUrls = formData.getAll('imageUrls') as string[];
  const imageFiles = formData.getAll('imageFiles');
  
  console.log('[AtualizarSubmenu] Recebendo para ID:', id, { imageUrls, imageFilesCount: imageFiles.length });

  const finalImageUrls: string[] = [];
  imageUrls.forEach(url => {
    if (url && url.trim()) finalImageUrls.push(url.trim());
  });
  
  for (const file of imageFiles) {
    if (file instanceof File && file.size > 0) {
      console.log('[AtualizarSubmenu] Processando arquivo:', file.name);
      const path = await salvarArquivoLocal(file);
      if (path) finalImageUrls.push(path);
    }
  }

    const videoUrls = formData.getAll('videoUrls') as string[];
    const finalVideoUrls = videoUrls.filter(url => url && url.trim()).map(url => url.trim());

    const relatedSubmenuIds = formData.getAll('relatedSubmenuIds') as string[];

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      await conn.query(
        'UPDATE submenus SET nome = COALESCE(?, nome), conteudo = ?, grupo = ?, categoriaId = COALESCE(?, categoriaId) WHERE id = ?',
        [nome, conteudo, grupo, categoriaId, id]
      );

      await conn.query('DELETE FROM submenu_images WHERE submenuId = ?', [id]);
      for (const url of finalImageUrls) {
        await conn.query('INSERT INTO submenu_images (submenuId, url) VALUES (?, ?)', [id, url]);
      }

      await conn.query('DELETE FROM submenu_videos WHERE submenuId = ?', [id]);
      for (const url of finalVideoUrls) {
        await conn.query('INSERT INTO submenu_videos (submenuId, url) VALUES (?, ?)', [id, url]);
      }

      await conn.query('DELETE FROM submenu_related WHERE submenuId = ?', [id]);
      for (const relId of relatedSubmenuIds) {
        await conn.query('INSERT INTO submenu_related (submenuId, relatedSubmenuId) VALUES (?, ?)', [id, relId]);
      }

      await conn.commit();
      console.log('[AtualizarSubmenu] Sucesso para ID:', id);
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