import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';

import { MangaCompleto } from '../components/Types/typos';
import { pegarMangaPorId } from '../components/Crud';
import erro404 from '../assets/erro404.jpg'


export function Detail({ route }: any) {

  const navigation = useNavigation<any>();

  const { id } = route.params;
  console.log('ID RECEBIDO:', id);

  const [manga, setManga] =
    useState<MangaCompleto | null>(null);

  async function carregarManga() {
    try {
      const resposta = await pegarMangaPorId(id);

      console.log('MANGA:', resposta);

      setManga(resposta);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    carregarManga();
  }, []);

  if (!manga) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#FFF' }}>
          Carregando...
        </Text>
      </View>
    );
  }

  const capaValida =
  manga.image_uri &&
  manga.image_uri !== 'asd' &&
  manga.image_uri !== 'null' &&
  manga.image_uri !== 'undefined' &&
  manga.image_uri.trim() !== '';

  console.log(JSON.stringify(manga, null, 2));

  return (
    <View style={styles.container}>

      <TopBar
        type="details"
        mangaNome={manga.nome}
        favorito={Boolean(manga.favorite)}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
      >

      <Image
        source={
          capaValida
            ? { uri: manga.image_uri }
            : erro404
        }
        style={styles.capa}
        contentFit="cover"
      />

        <Text style={styles.titulo}>
          {manga.nome}
        </Text>

        <View style={styles.autorContainer}>
          <MaterialIcons
            name="person"
            size={16}
            color="#888"
          />

          <Text style={styles.autor}>
            {manga.autor}
          </Text>
        </View>

        <Text style={styles.info}>
          <Text style={styles.bold}>
            Gênero:
          </Text>{' '}
          {manga.generos
            .map(g => g.nome_genero)
            .join(', ')}
        </Text>

        <Text style={styles.info}>
          <Text style={styles.bold}>
            Capítulos:
          </Text>{' '}
          {manga.chapters}
        </Text>

        <Text style={styles.info}>
          <Text style={styles.bold}>
            Status:
          </Text>{' '}
          {manga.status}
        </Text>

        <View style={styles.estrelas}>
          <Text style={styles.bold}>
            Sua nota:
          </Text>

          {[1, 2, 3, 4, 5].map(star => (
            <MaterialIcons
              key={star}
              name={
                star <= Math.round(manga.note)
                  ? 'star'
                  : 'star-border'
              }
              size={20}
              color="#FFC107"
            />
          ))}
        </View>

        <View style={styles.divisor} />

        <Text style={styles.sinopseTitulo}>
          Sinopse
        </Text>

        <Text style={styles.sinopse}>
          {manga.description}
        </Text>

        <View style={styles.botoes}>

          <TouchableOpacity
            style={styles.botaoEditar}
          >
            <Text style={styles.textoBotao}>
              Editar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoExcluir}
          >
            <Text style={styles.textoBotao}>
              Excluir
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      <Footer />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
  },

  content: {
    padding: 25,
    paddingBottom: 100,
  },

  capa: {
    width: 180,
    height: 260,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: 20,
  },

  titulo: {
    color: '#FFF',
    fontSize: 34,
    fontWeight: 'bold',
  },

  autorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 15,
  },

  autor: {
    color: '#888',
    marginLeft: 5,
  },

  info: {
    color: '#FFF',
    marginBottom: 8,
  },

  bold: {
    fontWeight: 'bold',
  },

  estrelas: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 2,
  },

  divisor: {
    height: 1,
    backgroundColor: '#555',
    marginVertical: 20,
  },

  sinopseTitulo: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
  },

  sinopse: {
    color: '#DDD',
    lineHeight: 22,
    marginTop: 10,
  },

  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },

  botaoEditar: {
    width: '40%',
    backgroundColor: '#FFC107',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  botaoExcluir: {
    width: '40%',
    backgroundColor: '#C62828',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  textoBotao: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});