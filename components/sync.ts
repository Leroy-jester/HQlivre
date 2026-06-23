import * as SQLite from 'expo-sqlite';
import { buscarMangasAPI, criarMangaAPI, atualizarMangaAPI, deletarMangaAPI } from './Api';
import { Manga } from './Types/typos';

// Converte um manga local para o formato esperado pela API (sem campos de controle)
const paraFormatoAPI = (manga: Manga) => {
  const { id, server_id, sync_status, created_at, updated_at, ...rest } = manga;
  return {
    ...rest,
    favorite: Boolean(manga.favorite),
  };
};

export const sincronizar = async () => {
  const db = await SQLite.openDatabaseAsync('mangadb');

  try {
    // ── 1. Enviar pendências para a API ──
    const pendentes = await db.getAllAsync<Manga>(
      `SELECT * FROM mangas WHERE sync_status = 'pending' OR sync_status = 'deleted'`
    );

    for (const manga of pendentes) {
      try {
        if (manga.sync_status === 'deleted') {
          // Deletar na API (se tiver server_id)
          if (manga.server_id) {
            await deletarMangaAPI(manga.server_id);
          }
          // Remove do banco local
          await db.runAsync(`DELETE FROM mangas WHERE id = ?`, [manga.id]);
        } else {
          // Create ou Update
          const dadosAPI = paraFormatoAPI(manga);
          if (manga.server_id) {
            // Atualiza
            await atualizarMangaAPI(manga.server_id, dadosAPI);
          } else {
            // Cria novo
            const criado = await criarMangaAPI(dadosAPI);
            // Atualiza o server_id local
            await db.runAsync(
              `UPDATE mangas SET server_id = ?, sync_status = 'synced', updated_at = ? WHERE id = ?`,
              [criado._id, new Date().toISOString(), manga.id]
            );
          }
          // Marca como sincronizado (se não foi deletado)
          if (manga.sync_status !== 'deleted') {
            await db.runAsync(
              `UPDATE mangas SET sync_status = 'synced', updated_at = ? WHERE id = ?`,
              [new Date().toISOString(), manga.id]
            );
          }
        }
      } catch (err) {
        console.error(`Erro ao sincronizar manga ${manga.id}:`, err);
        // Mantém o status para tentar novamente depois
      }
    }

    // ── 2. Baixar dados da API e fazer merge ──
    const mangasAPI = await buscarMangasAPI();
    for (const mangaAPI of mangasAPI) {
      const existe = await db.getFirstAsync<{ id: number }>(
        `SELECT id FROM mangas WHERE server_id = ?`,
        [mangaAPI._id]
      );

      if (existe) {
        // Atualiza apenas se o registro local estiver 'synced' (evita sobrescrever mudanças pendentes)
        const local = await db.getFirstAsync<Manga>(
          `SELECT * FROM mangas WHERE id = ?`,
          [existe.id]
        );
        if (local && local.sync_status === 'synced') {
          // Atualiza campos (exceto os de controle)
          const { _id, __v, ...dados } = mangaAPI;
          const campos = Object.keys(dados).map(k => `${k} = ?`).join(', ');
          const valores = Object.values(dados);
          await db.runAsync(
            `UPDATE mangas SET ${campos}, updated_at = ? WHERE id = ?`,
            [...valores, new Date().toISOString(), existe.id]
          );
        }
      } else {
        // Insere novo manga vindo da API
        const { _id, ...dados } = mangaAPI;
        await db.runAsync(
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
        // Aqui também deveríamos inserir os gêneros, se a API os retornar (não implementado no server.js, mas pode ser adicionado)
      }
    }

    console.log('Sincronização concluída.');
  } catch (err) {
    console.error('Erro na sincronização:', err);
  } finally {
    await db.closeAsync();
  }
};