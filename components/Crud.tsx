import * as SQLite from 'expo-sqlite';
import { Manga, Gender, MangaCompleto } from './Types/typos';

    let db: SQLite.SQLiteDatabase;

    export async function getDB() {
        if (!db) {
            db = await SQLite.openDatabaseAsync('NossoBanco');
        }

        return db;
    }

    //crud para usar online, para quando cair a internet ir salvando no celular e daí enviar para o site quando voltar a conecção, usando o expo-sqlite

    /* O Crud precisa ser capaz de fazer 
    PUSH; 
    GET ALL; 
    GET by id,name,autor,gender; 
    PATCH, 
    DELETE*/

    export const criaBD = async () => {
    const bd = await getDB();

    await bd.execAsync(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS mangas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_uri TEXT,
            nome TEXT NOT NULL,
            autor TEXT NOT NULL,
            chapters INTEGER,
            status TEXT,
            note REAL,
            description TEXT,
            sync_status TEXT DEFAULT 'pending',
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
    
    }
    // função para não ficar repetindo código

    const montarManga = async (manga: Manga): Promise<MangaCompleto> => {
        const bd = await getDB();
        if (manga.id == null) {
            throw new Error('Manga sem ID');
        }
        const generos = await bd.getAllAsync<Gender>(
            `
            SELECT g.*
            FROM genders g
            INNER JOIN mangas_genders mg
                ON g.id = mg.genero_id
            WHERE mg.manga_id = ?
            `,
            
            [manga.id]
        );

        return {
            ...manga,
            generos
        };
    };

    //GET ALL, retorna todos os mangas postados e seus gêneros 
    export const pegarMangas = async () => {
        const bd = await getDB();

        const mangas = await bd.getAllAsync<Manga>(
            'SELECT * FROM mangas'
        );

        return Promise.all(
            mangas.map(montarManga)
        );
    };
    //GET by NOME, retorna todos os mangas com o nome parecido com oque foi escrito
    export const pegarMangasPorNome = async (nome: string) => {
        const bd = await getDB();

        const mangas = await bd.getAllAsync<Manga>(
            `
            SELECT *
            FROM mangas
            WHERE nome LIKE ?
            `,
            [`%${nome}%`]
        );

        return Promise.all(
            mangas.map(montarManga)
        );
    };
    //GET by GENDER, retorna todos os mangas baseados no gênero
    export const pegarMangasPorGenero = async (generoId: number) => {
        const bd = await getDB();

        const mangas = await bd.getAllAsync<Manga>(
            `
            SELECT m.*
            FROM mangas m
            INNER JOIN mangas_genders mg
                ON m.id = mg.manga_id
            WHERE mg.genero_id = ?
            `,
            [generoId]
        );

        return Promise.all(
            mangas.map(montarManga)
        );
    };
    //GET by autor, retorna todas as obras que aquele escritor já fez obs: quando for postar um mangá dar opção baseado nos mangakás já colocado lá
    export const pegarMangasPorAutor = async (autor: string) => {
        const bd = await getDB();

        const mangas = await bd.getAllAsync<Manga>(
            `
            SELECT *
            FROM mangas
            WHERE autor LIKE ?
            `,
            [`%${autor}%`]
        );

        return Promise.all(
            mangas.map(montarManga)
        );
    };

    /* Vai retornar algo parecido com isso

    {
    "id": "123",
    "nome": "Re:Zero",
    "autor": "Tappei Nagatsuki",
    "chapters": 60,
    "note": 4,
    "image_uri": "...",
    "generos": [
        {
        "id": "16",
        "nome_genero": "Fantasia"
        },
        {
        "id": "24",
        "nome_genero": "Isekai"
        }
    ]
    }
    */

    //Post

    export const enviarManga = async (
        manga: Manga,
        generosIds: number[]
    ) => {
        const bd = await getDB();

        await bd.withTransactionAsync(async () => {

            const resultado = await bd.runAsync(
                `
                INSERT INTO mangas ( 
                    image_uri, 
                    nome, 
                    autor, 
                    chapters, 
                    status, 
                    note, 
                    description, 
                    created_at, 
                    updated_at
                )
                VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    manga.image_uri,
                    manga.nome,
                    manga.autor,
                    manga.chapters,
                    manga.status,
                    manga.note,
                    manga.description,
                    new Date().toISOString(),
                    new Date().toISOString()
                    
                ]
                
            );

            const mangaId = resultado.lastInsertRowId;

            for (const generoId of generosIds) {
                await bd.runAsync(
                    `
                    INSERT INTO mangas_genders
                    (manga_id, genero_id)
                    VALUES (?, ?)
                    `,
                    [mangaId, generoId]
                );
            }
        });
    };

    //PACTH para atualizar os mangas e seus gêneros

    export const atualizarManga = async (
            id: number,
            dados: Partial<Manga>
        ) => {
            const bd = await getDB();

            const campos: string[] = [];
            const valores: any[] = [];

            Object.entries(dados).forEach(([chave, valor]) => {
                campos.push(`${chave} = ?`);
                valores.push(valor);
            });

            campos.push('updated_at = ?');
            valores.push(new Date().toISOString());

            valores.push(id);

            await bd.runAsync(
                `UPDATE mangas
                SET ${campos.join(', ')}
                WHERE id = ?`,
            valores
        );
    };

    //DELETE para apagar os outros dados do banco

    export const deletarManga = async (
        id: number
    ) => {
        const bd = await getDB();

        await bd.runAsync(
            `
            DELETE
            FROM mangas 
            WHERE id = ?
            `, 
            [id]);
    };