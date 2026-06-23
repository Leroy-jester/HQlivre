const API_URL = 'http://10.0.2.2:3000';

export const buscarMangasAPI = async () => {
  const res = await fetch(`${API_URL}/mangas`);
  if (!res.ok) throw new Error('Erro ao buscar mangas da API');
  return res.json();
};

export const criarMangaAPI = async (manga: any) => {
  const res = await fetch(`${API_URL}/mangas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(manga),
  });
  if (!res.ok) throw new Error('Erro ao criar manga na API');
  return res.json();
};

export const atualizarMangaAPI = async (id: string, dados: any) => {
  const res = await fetch(`${API_URL}/mangas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao atualizar manga na API');
  return res.json();
};

export const deletarMangaAPI = async (id: string) => {
  const res = await fetch(`${API_URL}/mangas/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao deletar manga na API');
};