export type Manga = {
    id?: string;
    image_uri: string;
    nome: string;
    autor: string;
    chapters: number;
    status: string;
    note: number;
    description: string;
}
export type Gender = {
    id: string;
    nome_genero: string;
}
export type MangaCompleto = Manga & {
    generos: Gender[];
}

export type MangaFavorito = {
    id: string;
    manga_id: number;
    nome: string
}