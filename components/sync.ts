import * as SQLite from 'expo-sqlite';
import { buscarMangasAPI, criarMangaAPI, atualizarMangaAPI, deletarMangaAPI } from './Api';
import { Manga } from './Types/typos';
import { buscarGenerosDoManga } from './Crud';
import { getDatabase } from './database';

const paraFormatoAPI = async (manga: Manga): Promise<any> => {
  const { id, server_id, sync_status, created_at, updated_at, ...rest } = manga;
  const generos = id ? await buscarGenerosDoManga(id) : [];
  return {
    ...rest,
    favorite: Boolean(manga.favorite),
    generos: generos.map(g => ({ id: g.id, nome_genero: g.nome_genero }))
  };
};

export const sincronizar = async (): Promise<void> => {
  const db = await getDatabase(); 

  try {
    const pendentes = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE sync_status = 'pending' OR sync_status = 'deleted'`
    );

    for (const manga of pendentes) {
      if (manga.id === undefined) {
        console.warn('Manga sem ID local, ignorando:', manga);
        continue;
      }

      try {
        if (manga.sync_status === 'deleted') {
          if (manga.server_id) {
            await deletarMangaAPI(manga.server_id);
          }
          await db.runAsync(`DELETE FROM mangas WHERE id = ?`, [manga.id]);
        } else {
          const payload = await paraFormatoAPI(manga);

          if (manga.server_id) {
            await atualizarMangaAPI(manga.server_id, payload);
            await db.runAsync(
              `UPDATE mangas SET sync_status = 'synced', updated_at = ? WHERE id = ?`,
              [new Date().toISOString(), manga.id]
            );
          } else {
            const criado = await criarMangaAPI(payload);
            if (!criado._id) {
              throw new Error('API não retornou _id para o manga criado');
            }
            await db.runAsync(
              `UPDATE mangas SET server_id = ?, sync_status = 'synced', updated_at = ? WHERE id = ?`,
              [criado._id, new Date().toISOString(), manga.id]
            );
          }
        }
      } catch (err) {
        console.error(`Erro ao sincronizar manga ${manga.id}:`, err);
      }
    }

    const mangasAPI = await buscarMangasAPI();

    for (const mangaAPI of mangasAPI) {
      const existe = await db.getFirstAsync<{ id: number }>(
        `SELECT id FROM mangas WHERE server_id = ?`,
        [mangaAPI._id]
      );

      if (existe) {
        const local = await db.getFirstAsync<Manga>(
          `SELECT * FROM mangas WHERE id = ?`,
          [existe.id]
        );

        if (local && local.sync_status === 'synced') {
          const { _id, __v, ...dados } = mangaAPI;
          await db.runAsync(
            `
            UPDATE mangas SET
              image_uri = ?,
              nome = ?,
              autor = ?,
              chapters = ?,
              status = ?,
              note = ?,
              description = ?,
              favorite = ?,
              updated_at = ?
            WHERE id = ?
            `,
            [
              dados.image_uri ?? '',
              dados.nome ?? '',
              dados.autor ?? '',
              dados.chapters ?? 0,
              dados.status ?? '',
              dados.note ?? 0,
              dados.description ?? '',
              dados.favorite ? 1 : 0,
              new Date().toISOString(),
              existe.id
            ]
          );

          await db.runAsync(`DELETE FROM mangas_genders WHERE manga_id = ?`, [existe.id]);
          if (mangaAPI.generos && Array.isArray(mangaAPI.generos)) {
            for (const gen of mangaAPI.generos) {
              await db.runAsync(
                `INSERT OR IGNORE INTO genders (id, nome_genero) VALUES (?, ?)`,
                [gen.id, gen.nome_genero]
              );
              await db.runAsync(
                `INSERT OR IGNORE INTO mangas_genders (manga_id, genero_id) VALUES (?, ?)`,
                [existe.id, gen.id]
              );
            }
          }
        }
      } else {
        const { _id, ...dados } = mangaAPI;
        const result = await db.runAsync(
          `INSERT INTO mangas 
           (server_id, image_uri, nome, autor, chapters, status, note, description, favorite, sync_status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            _id,
            dados.image_uri || '',
            dados.nome,
            dados.autor,
            dados.chapters || 0,
            dados.status || '',
            dados.note || 0,
            dados.description || '',
            dados.favorite ? 1 : 0,
            'synced',
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );
        const novoId = result.lastInsertRowId;

        if (mangaAPI.generos && Array.isArray(mangaAPI.generos)) {
          for (const gen of mangaAPI.generos) {
            await db.runAsync(
              `INSERT OR IGNORE INTO genders (id, nome_genero) VALUES (?, ?)`,
              [gen.id, gen.nome_genero]
            );
            await db.runAsync(
              `INSERT OR IGNORE INTO mangas_genders (manga_id, genero_id) VALUES (?, ?)`,
              [novoId, gen.id]
            );
          }
        }
      }
    }

    console.log('Sincronização concluída.');
  } catch (err) {
    console.error('Erro na sincronização:', err);
    throw err;
  }
};