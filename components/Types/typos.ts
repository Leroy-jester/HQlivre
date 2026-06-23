export type Manga = {
    id?: number;          // PK local (SQLite)
    server_id?: string;   // _id do MongoDB
    image_uri: string;
    nome: string;
    autor: string;
    chapters: number;
    status: string;
    note: number;
    description: string;
    favorite?: boolean;
    sync_status?: 'pending' | 'synced' | 'deleted'; // controle de sincronização
    created_at?: string;
    updated_at?: string;
};

export type Gender = {
    id: number;
    nome_genero: string;
};

export type MangaCompleto = Manga & {
    generos: Gender[];
};

export type MangaFavorito = {
    id: number;
    manga_id: number;
    nome: string;
};

export type RootStackParamList = {
    Home: undefined;
    Favoritos: undefined;
    Catalogo: undefined;
    detalhes: {
        mangaId: number;
    };
};