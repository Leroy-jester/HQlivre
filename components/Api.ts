const API_URL = 'http://10.0.2.2:3000';

export async function buscarMangasAPI() {

    const response = await fetch(
        `${API_URL}/mangas`
    );

    if (!response.ok) {
        throw new Error('Erro ao buscar');
    }

    return response.json();
}

export async function criarMangaAPI(
    manga: any
) {

    const response = await fetch(
        `${API_URL}/mangas`,
        {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/json'
            },
            body:
                JSON.stringify(manga)
        }
    );

    if (!response.ok) {
        throw new Error('Erro ao criar');
    }

    return response.json();
}