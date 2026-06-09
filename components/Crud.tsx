import * as SQLite from 'expo-sqlite';

//crud para usar online, para quando cair a internet ir salvando no celular e daí enviar para o site quando voltar a conecção, usando o expo-sqlite

type Manga = {
    id?: string;
    image?: Uint8Array;
    nome?: string;
    autor?: string;
    chapters?: number;
    status?: string;
    note?: number;
    description?: string;
}
type Gender = {
    id?: string;
    nome_genero?: Array<string>;
}

/* O Crud precisa ser capaz de fazer 
PUSH; 
GET ALL; 
GET by id,name,autor,gender; 
PATCH, 
DELETE*/

const criaBD = async () => {
  const bd = await SQLite.openDatabaseAsync('NossoBanco');

  await bd.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE mangas (
        id TEXT PRIMARY KEY,
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

    CREATE TABLE genders (
        id TEXT PRIMARY KEY,
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
  bd.closeAsync();
}
//GET ALL, retorna todos os mangas postados e seus gêneros 
const pegarMangas = async () => {
    const bd = await SQLite.openDatabaseAsync('NossoBanco');

    await bd.runAsync('GET ')
}
//GET by NOME, retorna todos os mangas com o nome parecido com oque foi escrito

//GET by GENDER, retorna todos os mangas baseados no gênero

//GET by autor, retorna todas as obras que aquele escritor já fez obs: quando for postar um mangá dar opção baseado nos mangakás já colocado lá

