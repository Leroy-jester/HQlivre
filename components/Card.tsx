import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { MangaCompleto } from './Types/typos';
import erro404 from '../assets/erro404.jpg'

interface CardProps {
  manga: MangaCompleto;
  onPress?: () => void;
}

export function Card({
  manga,
  onPress
}: CardProps) {
    const capaValida =
  manga.image_uri &&
  manga.image_uri !== 'asd' &&
  manga.image_uri !== 'null' &&
  manga.image_uri !== 'undefined' &&
  manga.image_uri.trim() !== '';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.card}>

        <Image
          source={capaValida ? { uri: manga.image_uri } : erro404}
          style={styles.capa}
        />

        <View style={styles.info}>

          <Text
            style={styles.titulo}
            numberOfLines={2}
          >
            {manga.nome}
          </Text>

          <Text style={styles.autor}>
            {manga.autor}
          </Text>

          <Text style={styles.texto}>
            <Text style={styles.negrito}>
              Gêneros:
            </Text>{' '}
            {manga.generos.length > 0
              ? manga.generos
                  .map(g => g.nome_genero)
                  .join(', ')
              : 'Sem gênero'}
          </Text>

          <Text style={styles.texto}>
            <Text style={styles.negrito}>
              Capítulos:
            </Text>{' '}
            {manga.chapters}
          </Text>

          <Text style={styles.texto}>
            <Text style={styles.negrito}>
              Status:
            </Text>{' '}
            {manga.status}
          </Text>

          <View style={styles.estrelas}>
            {[1, 2, 3, 4, 5].map((star) => (
              <MaterialIcons
                key={star}
                name={
                  star <= Math.round(manga.note)
                    ? 'star'
                    : 'star-border'
                }
                size={22}
                color="#FFC107"
              />
            ))}
          </View>

        </View>

        {manga.favorite && (
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