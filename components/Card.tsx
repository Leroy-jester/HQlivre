import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MangaCompleto } from './Types/typos';

interface CardProps {
  manga: MangaCompleto;
}

export function Card({ manga }: CardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: manga.image_uri }}
        style={styles.capa}
      />

      <View style={styles.info}>
        <Text style={styles.titulo}>{manga.nome}</Text>

        <Text style={styles.autor}>
          {manga.autor}
        </Text>

        <Text style={styles.texto}>
          <Text style={styles.negrito}>Gênero: </Text>
          {manga.generos = []}
        </Text>

        <Text style={styles.texto}>
          <Text style={styles.negrito}>Capítulos: </Text>
          {manga.chapters}
        </Text>

        <View style={styles.estrelas}>
          {[1, 2, 3, 4, 5].map((star) => (
            <MaterialIcons
              key={star}
              name={star <= manga.note ? 'star' : 'star-border'}
              size={24}
              color="#FFC107"
            />
          ))}
        </View>
      </View>

      <MaterialIcons
        name="star"
        size={30}
        color="#FFC107"
        style={styles.favorito}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
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
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  autor: {
    color: '#bbb',
    marginBottom: 15,
  },

  texto: {
    color: '#fff',
    marginBottom: 8,
  },

  negrito: {
    fontWeight: 'bold',
  },

  estrelas: {
    flexDirection: 'row',
    marginTop: 10,
  },

  favorito: {
    position: 'relative',
    top: 10,
    right: 10,
  },
});