import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { Manga, Gender, MangaCompleto } from './Types/typos';
import gendersData from './data/gender.json';
import { buscarMangasAPI, criarMangaAPI, atualizarMangaAPI, deletarMangaAPI } from './Api';

// ──────────────────────────────
// 1. INICIALIZAÇÃO DO BANCO
// ──────────────────────────────
export const initDatabase = async () => {
  if (Platform.OS === 'web') {
    console.log('WEB: SQLite não suportado');
    return;
  }

  const db = await SQLite.openDatabaseAsync('mangadb');
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

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

    CREATE TABLE IF NOT EXISTS genders (
      id INTEGER PRIMARY KEY,
      nome_genero TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mangas_genders (
      manga_id INTEGER,
      genero_id INTEGER,
      PRIMARY KEY(manga_id, genero_id),
      FOREIGN KEY (manga_id) REFERENCES mangas(id) ON DELETE CASCADE,
      FOREIGN KEY (genero_id) REFERENCES genders(id) ON DELETE CASCADE
    );
  `);

  // Insere gêneros se ainda não existirem
  await inserirGeneros(db);
  await db.closeAsync();
};

// ──────────────────────────────
// 2. HELPERS
// ──────────────────────────────
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

// ──────────────────────────────
// 3. OPERAÇÕES LOCAIS (CRUD)
// ──────────────────────────────

// CREATE
export const criarMangaLocal = async (manga: Omit<Manga, 'id'>, generosIds: number[]): Promise<number> => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const now = new Date().toISOString();
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
        'pending',        // marca para sincronizar
        now,
        now
      ]
    );
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
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// READ – todos
export const listarMangas = async (): Promise<MangaCompleto[]> => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const mangas = await db.getAllAsync<Manga>('SELECT * FROM mangas WHERE sync_status != "deleted"');
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// READ – por ID
export const buscarMangaPorId = async (id: number): Promise<MangaCompleto | null> => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const manga = await db.getFirstAsync<Manga>('SELECT * FROM mangas WHERE id = ?', [id]);
    if (!manga) return null;
    return await montarMangaCompleto(db, manga);
   } catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  } finally {
    await db.closeAsync();
  }
};

// READ – por nome (busca parcial)
export const buscarMangasPorNome = async (nome: string): Promise<MangaCompleto[]> => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE nome LIKE ? AND sync_status != "deleted"`,
      [`%${nome}%`]
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  }catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// READ – por gênero
export const buscarMangasPorGenero = async (generoId: number): Promise<MangaCompleto[]> => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT m.* FROM mangas m
       INNER JOIN mangas_genders mg ON m.id = mg.manga_id
       WHERE mg.genero_id = ? AND m.sync_status != "deleted"`,
      [generoId]
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  }catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// READ – por autor
export const buscarMangasPorAutor = async (autor: string): Promise<MangaCompleto[]> => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE autor LIKE ? AND sync_status != "deleted"`,
      [`%${autor}%`]
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// UPDATE
export const atualizarMangaLocal = async (id: number, dados: Partial<Manga>, generosIds?: number[]) => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const campos: string[] = [];
    const valores: any[] = [];

    // Atualiza apenas os campos fornecidos
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

    // Se forneceu nova lista de gêneros, substitui
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
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// DELETE (lógico – marca como deleted)
export const deletarMangaLocal = async (id: number) => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    await db.runAsync(
      `UPDATE mangas SET sync_status = 'deleted', updated_at = ? WHERE id = ?`,
      [new Date().toISOString(), id]
    );
  } catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// FAVORITAR
export const favoritarMangaLocal = async (mangaId: number, favorito: boolean) => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    await db.runAsync(
      `UPDATE mangas SET favorite = ?, sync_status = 'pending', updated_at = ? WHERE id = ?`,
      [favorito ? 1 : 0, new Date().toISOString(), mangaId]
    );
  } catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// LISTAR FAVORITOS
export const listarFavoritos = async (): Promise<MangaCompleto[]> => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE favorite = 1 AND sync_status != "deleted"`
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// DESTAQUES (top 3 notas)
export const listarDestaques = async (): Promise<MangaCompleto[]> => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE sync_status != "deleted" ORDER BY note DESC LIMIT 3`
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};

// LANÇAMENTOS (últimos 12)
export const listarLancamentos = async (): Promise<MangaCompleto[]> => {
  const db = await SQLite.openDatabaseAsync('mangadb');
  try {
    const mangas = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE sync_status != "deleted" ORDER BY created_at DESC LIMIT 12`
    );
    return Promise.all(mangas.map(m => montarMangaCompleto(db, m)));
  } catch(err) {
    console.error(err);
    throw new Error('Algo deu muito errado ')
  }finally {
    await db.closeAsync();
  }
};