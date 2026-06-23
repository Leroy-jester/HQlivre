import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { MangaCompleto } from './Types/typos';

const IMAGEM_PADRAO = require('../assets/erro404.jpg');

interface CardProps {
  manga: MangaCompleto;
  onPress?: () => void;
}

export function Card({ manga, onPress }: CardProps) {
  // VALIDAÇÃO EXTREMA
  if (!manga) {
    console.warn('Card: manga é null/undefined');
    return (
      <View style={styles.errorCard}>
        <Text style={{ color: 'white' }}>Manga inválido</Text>
      </View>
    );
  }

  if (typeof manga !== 'object') {
    console.warn('Card: manga não é objeto:', typeof manga);
    return (
      <View style={styles.errorCard}>
        <Text style={{ color: 'white' }}>Tipo inválido</Text>
      </View>
    );
  }

  if (!manga.id || typeof manga.id !== 'number') {
    console.warn('Card: manga sem ID válido:', manga);
    return (
      <View style={styles.errorCard}>
        <Text style={{ color: 'white' }}>ID inválido</Text>
      </View>
    );
  }

  // Verifica se a capa é válida
  const isCapaValida = (uri: any): boolean => {
    if (!uri || typeof uri !== 'string') return false;
    const trimmed = uri.trim();
    return trimmed !== '' && trimmed !== 'asd' && trimmed !== 'null' && trimmed !== 'undefined';
  };

  const capaValida = isCapaValida(manga.image_uri);

  // Garante valores padrão para todos os campos
  const nome = String(manga.nome || 'Sem nome');
  const autor = String(manga.autor || 'Autor desconhecido');
  const chapters = typeof manga.chapters === 'number' ? manga.chapters : 0;
  const status = String(manga.status || 'Desconhecido');
  const note = typeof manga.note === 'number' ? manga.note : 0;
  const generos = Array.isArray(manga.generos) ? manga.generos : [];
  const favorite = !!manga.favorite;

  try {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <View style={styles.card}>
          <Image
            source={capaValida ? { uri: manga.image_uri } : IMAGEM_PADRAO}
            style={styles.capa}
          />

          <View style={styles.info}>
            <Text style={styles.titulo} numberOfLines={2}>
              {nome}
            </Text>

            <Text style={styles.autor}>{autor}</Text>

            <Text style={styles.texto}>
              <Text style={styles.negrito}>Gêneros:</Text>{' '}
              {generos.length > 0
                ? generos.map((g) => String(g.nome_genero || 'Desconhecido')).join(', ')
                : 'Sem gênero'}
            </Text>

            <Text style={styles.texto}>
              <Text style={styles.negrito}>Capítulos:</Text> {chapters}
            </Text>

            <Text style={styles.texto}>
              <Text style={styles.negrito}>Status:</Text> {status}
            </Text>

            <View style={styles.estrelas}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                  key={star}
                  name={star <= Math.round(note) ? 'star' : 'star-border'}
                  size={22}
                  color="#FFC107"
                />
              ))}
            </View>
          </View>

          {favorite && (
            <MaterialIcons
              name="star"
              size={30}
              color="#FFC107"
              style={styles.favorito}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  } catch (error) {
    console.error('❌ ERRO NO CARD:', error);
    return (
      <View style={styles.errorCard}>
        <Text style={{ color: 'white' }}>Erro no Card</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 10,
    position: 'relative',
  },
  errorCard: {
    backgroundColor: '#C62828',
    padding: 20,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  capa: {
    width: 120,
    height: 180,
  },
  info: {
    flex: 1,
    padding: 15,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  autor: {
    color: '#BBBBBB',
    marginTop: 4,
    marginBottom: 12,
  },
  texto: {
    color: '#FFFFFF',
    marginBottom: 6,
    fontSize: 14,
  },
  negrito: {
    fontWeight: 'bold',
  },
  estrelas: {
    flexDirection: 'row',
    marginTop: 10,
  },
  favorito: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});