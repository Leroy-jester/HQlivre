import * as SQLite from 'expo-sqlite';
import { Manga, Gender, MangaCompleto } from './Types/typos';
import gendersData from './data/gender.json';
import { getDatabase } from './database';

export const initDatabase = async () => {
  try {
    console.log("PASSO 1");
    const db = await getDatabase();

    console.log("PASSO 2");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS mangas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id TEXT UNIQUE,
        image_uri TEXT,
        nome TEXT NOT NULL,
        autor TEXT NOT NULL,
        chapters INTEGER,
        status TEXT,
        note REAL,
        description TEXT,
        favorite INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT,
        updated_at TEXT
      );
    `);

    console.log("PASSO 3");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS genders (
        id INTEGER PRIMARY KEY,
        nome_genero TEXT NOT NULL
      );
    `);

    console.log("PASSO 4");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS mangas_genders (
        manga_id INTEGER,
        genero_id INTEGER,
        PRIMARY KEY(manga_id, genero_id)
      );
    `);

    console.log("PASSO 5");
    await inserirGeneros(db);

    console.log("PASSO 6 - FINALIZADO");
  } catch (e) {
    console.log("ERRO INIT:", e);
    throw e;
  }
};

const montarMangaCompleto = async (db: SQLite.SQLiteDatabase, manga: Manga): Promise<MangaCompleto> => {
  if (!manga.id) throw new Error('Manga sem ID');
  const generos = await db.getAllAsync<Gender>(
    `SELECT g.* FROM genders g
     INNER JOIN mangas_genders mg ON g.id = mg.genero_id
     WHERE mg.manga_id = ?`,
    [manga.id]
  );
  return { ...manga, generos };
};

const inserirGeneros = async (db: SQLite.SQLiteDatabase) => {
  for (const g of gendersData) {
    await db.runAsync(
      `INSERT OR IGNORE INTO genders (id, nome_genero) VALUES (?, ?)`,
      [Number(g.id), g.nome_genero]
    );
  }
};

export const criarMangaLocal = async (manga: Omit<Manga, 'id'>, generosIds: number[]): Promise<number> => {
  const db = await getDatabase(); // Usa a instância única
  
  try {
    const now = new Date().toISOString();
    console.log("ANTES DO INSERT");

    const result = await db.runAsync(
      `INSERT INTO mangas 
       (image_uri, nome, autor, chapters, status, note, description, favorite, sync_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        manga.image_uri || '',
        manga.nome,
        manga.autor,
        manga.chapters || 0,
        manga.status || '',
        manga.note || 0,
        manga.description || '',
        manga.favorite ? 1 : 0,
        'pending',
        now,
        now
      ]
    );

    console.log("DEPOIS DO INSERT");
    const mangaId = result.lastInsertRowId;
    
    for (const gId of generosIds) {
      await db.runAsync(
        `INSERT INTO mangas_genders (manga_id, genero_id) VALUES (?, ?)`,
        [mangaId, gId]
      );
    }
    return mangaId;
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const listarGeneros = async (): Promise<Gender[]> => {
  const db = await getDatabase();
  try {
    const generos = await db.getAllAsync<Gender>('SELECT * FROM genders');
    return generos;
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const listarMangas = async (): Promise<MangaCompleto[]> => {
  const db = await getDatabase();
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE sync_status != 'deleted'`
    );

    const completos: MangaCompleto[] = [];
    for (const manga of mangas) {
      completos.push(await montarMangaCompleto(db, manga));
    }
    return completos;
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const buscarMangaPorId = async (id: number): Promise<MangaCompleto | null> => {
  const db = await getDatabase();
  try {
    const manga = await db.getFirstAsync<Manga>('SELECT * FROM mangas WHERE id = ?', [id]);
    if (!manga) return null;
    return await montarMangaCompleto(db, manga);
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const buscarMangasPorNome = async (nome: string): Promise<MangaCompleto[]> => {
  const db = await getDatabase();
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE nome LIKE ? AND sync_status != "deleted"`,
      [`%${nome}%`]
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const buscarMangasPorGenero = async (generoId: number): Promise<MangaCompleto[]> => {
  const db = await getDatabase();
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT m.* FROM mangas m
       INNER JOIN mangas_genders mg ON m.id = mg.manga_id
       WHERE mg.genero_id = ? AND m.sync_status != "deleted"`,
      [generoId]
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const buscarMangasPorAutor = async (autor: string): Promise<MangaCompleto[]> => {
  const db = await getDatabase();
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE autor LIKE ? AND sync_status != "deleted"`,
      [`%${autor}%`]
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const buscarGenerosDoManga = async (mangaId: number): Promise<Gender[]> => {
  const db = await getDatabase();
  try {
    const generos = await db.getAllAsync<Gender>(
      `SELECT g.* FROM genders g
       INNER JOIN mangas_genders mg ON g.id = mg.genero_id
       WHERE mg.manga_id = ?`,
      [mangaId]
    );
    return generos;
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const atualizarMangaLocal = async (id: number, dados: Partial<Manga>, generosIds?: number[]) => {
  const db = await getDatabase();
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    Object.entries(dados).forEach(([chave, valor]) => {
      if (chave === 'id' || chave === 'server_id') return;
      if (chave === 'favorite') {
        campos.push(`${chave} = ?`);
        valores.push(valor ? 1 : 0);
      } else {
        campos.push(`${chave} = ?`);
        valores.push(valor);
      }
    });

    campos.push('sync_status = ?', 'updated_at = ?');
    valores.push('pending', new Date().toISOString(), id);

    await db.runAsync(
      `UPDATE mangas SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );

    if (generosIds) {
      await db.runAsync(`DELETE FROM mangas_genders WHERE manga_id = ?`, [id]);
      for (const gId of generosIds) {
        await db.runAsync(
          `INSERT INTO mangas_genders (manga_id, genero_id) VALUES (?, ?)`,
          [id, gId]
        );
      }
    }
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const deletarMangaLocal = async (id: number) => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `UPDATE mangas SET sync_status = 'deleted', updated_at = ? WHERE id = ?`,
      [new Date().toISOString(), id]
    );
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const favoritarMangaLocal = async (mangaId: number, favorito: boolean) => {
  const db = await getDatabase();
  try {
    await db.runAsync(
      `UPDATE mangas SET favorite = ?, sync_status = 'pending', updated_at = ? WHERE id = ?`,
      [favorito ? 1 : 0, new Date().toISOString(), mangaId]
    );
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const listarFavoritos = async (): Promise<MangaCompleto[]> => {
  const db = await getDatabase();
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE favorite = 1 AND sync_status != "deleted"`
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const listarDestaques = async (): Promise<MangaCompleto[]> => {
  const db = await getDatabase();
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE sync_status != "deleted" ORDER BY note DESC LIMIT 3`
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw err;
  }
};

export const listarLancamentos = async (): Promise<MangaCompleto[]> => {
  const db = await getDatabase();
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE sync_status != "deleted" ORDER BY created_at DESC LIMIT 12`
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw err;
  }
};