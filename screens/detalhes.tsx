import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';

import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';

import { MangaCompleto, Gender } from '../components/Types/typos';
import {
  buscarMangaPorId,
  atualizarMangaLocal,
  deletarMangaLocal,
  listarGeneros,
  favoritarMangaLocal
} from '../components/Crud';
import erro404 from '../assets/erro404.jpg';

export function Detail({ route }: any) {
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const [manga, setManga] = useState<MangaCompleto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editAutor, setEditAutor] = useState('');
  const [editChapters, setEditChapters] = useState(0);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState(0);
  const [editDescription, setEditDescription] = useState('');
  const [editGeneros, setEditGeneros] = useState<number[]>([]);
  const [generosDisponiveis, setGenerosDisponiveis] = useState<Gender[]>([]);

  async function carregarManga() {
    try {
      const resposta = await buscarMangaPorId(id);
      setManga(resposta);
      if (resposta) {
        // Preenche os estados de edição
        setEditNome(resposta.nome);
        setEditAutor(resposta.autor);
        setEditChapters(resposta.chapters);
        setEditStatus(resposta.status);
        setEditNote(resposta.note);
        setEditDescription(resposta.description);
        setEditGeneros(resposta.generos.map(g => g.id));
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function carregarGeneros() {
    try {
      const lista = await listarGeneros();
      setGenerosDisponiveis(lista);
    } catch (error) {
      console.log('Erro ao carregar gêneros:', error);
    }
  }

  useEffect(() => {
    carregarManga();
    carregarGeneros();
  }, []);

  async function handleSaveEdit() {
    if (!manga) return;
    try {
      await atualizarMangaLocal(
        manga.id!,
        {
          nome: editNome,
          autor: editAutor,
          chapters: editChapters,
          status: editStatus,
          note: editNote,
          description: editDescription,
        },
        editGeneros
      );
      setModalVisible(false);
      // Recarrega os dados
      await carregarManga();
    } catch (error) {
      console.log('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o mangá.');
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Excluir Mangá',
      `Tem certeza que deseja excluir "${manga?.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarMangaLocal(id);
              navigation.goBack();
            } catch (error) {
              console.log('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir o mangá.');
            }
          }
        }
      ]
    );
  }

async function handleFavorite() {
  if (!manga) return;

  try {
    await favoritarMangaLocal(
      manga.id!,
      !manga.favorite
    );

    setManga({
      ...manga,
      favorite: !manga.favorite
    });
  } catch (error) {
    console.log('Erro ao favoritar:', error);
  }
}

  if (!manga) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#FFF' }}>Carregando...</Text>
      </View>
    );
  }

  const capaValida =
    manga.image_uri &&
    manga.image_uri !== 'asd' &&
    manga.image_uri !== 'null' &&
    manga.image_uri !== 'undefined' &&
    manga.image_uri.trim() !== '';

  function toggleGenero(idGenero: number) {
    if (editGeneros.includes(idGenero)) {
      setEditGeneros(editGeneros.filter(id => id !== idGenero));
    } else {
      setEditGeneros([...editGeneros, idGenero]);
    }
  }

  return (
    <View style={styles.container}>
      <TopBar
        type="details"
        mangaNome={manga.nome}
        favorito={Boolean(manga.favorite)}
        onBack={() => navigation.goBack()}
        onToggleFavorite={handleFavorite}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={capaValida ? { uri: manga.image_uri } : erro404}
          style={styles.capa}
          contentFit="cover"
        />

        <Text style={styles.titulo}>{manga.nome}</Text>

        <View style={styles.autorContainer}>
          <MaterialIcons name="person" size={16} color="#888" />
          <Text style={styles.autor}>{manga.autor}</Text>
        </View>

        <Text style={styles.info}>
          <Text style={styles.bold}>Gênero:</Text>{' '}
          {manga.generos.map(g => g.nome_genero).join(', ')}
        </Text>

        <Text style={styles.info}>
          <Text style={styles.bold}>Capítulos:</Text> {manga.chapters}
        </Text>

        <Text style={styles.info}>
          <Text style={styles.bold}>Status:</Text> {manga.status}
        </Text>

        <View style={styles.estrelas}>
          <Text style={styles.bold}>Sua nota:</Text>
          {[1, 2, 3, 4, 5].map(star => (
            <MaterialIcons
              key={star}
              name={star <= Math.round(manga.note) ? 'star' : 'star-border'}
              size={20}
              color="#FFC107"
            />
          ))}
        </View>

        <View style={styles.divisor} />

        <Text style={styles.sinopseTitulo}>Sinopse</Text>
        <Text style={styles.sinopse}>{manga.description}</Text>

        <View style={styles.botoes}>
          <TouchableOpacity style={styles.botaoEditar} onPress={() => setModalVisible(true)}>
            <Text style={styles.textoBotao}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoExcluir} onPress={handleDelete}>
            <Text style={styles.textoBotao}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de edição */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Editar Mangá</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={editNome} onChangeText={setEditNome} />

            <Text style={styles.label}>Autor</Text>
            <TextInput style={styles.input} value={editAutor} onChangeText={setEditAutor} />

            <Text style={styles.label}>Capítulos</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(editChapters)}
              onChangeText={(t) => setEditChapters(Number(t) || 0)}
            />

            <Text style={styles.label}>Status</Text>
            <TextInput style={styles.input} value={editStatus} onChangeText={setEditStatus} />

            <Text style={styles.label}>Nota (0-5)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(editNote)}
              onChangeText={(t) => {
                const val = Number(t);
                if (val >= 0 && val <= 5) setEditNote(val);
              }}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              value={editDescription}
              onChangeText={setEditDescription}
            />

            <Text style={styles.label}>Gêneros</Text>
            <ScrollView style={styles.generosScroll} nestedScrollEnabled>
              <View style={styles.generosContainer}>
                {generosDisponiveis.map((g) => {
                  const selecionado = editGeneros.includes(g.id);
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.chip, selecionado && styles.chipSelecionado]}
                      onPress={() => toggleGenero(g.id)}
                    >
                      <Text style={[styles.chipTexto, selecionado && styles.chipTextoSelecionado]}>
                        {g.nome_genero}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoSalvar} onPress={handleSaveEdit}>
                <Text style={{ color: '#FFF' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  generosScroll: {
    maxHeight: 150,
    marginBottom: 15,
  },
  generosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  chipSelecionado: {
    backgroundColor: '#FFC107',
  },
  chipTexto: {
    color: '#FFF',
    fontSize: 14,
  },
  chipTextoSelecionado: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  botaoCancelar: {
    padding: 12,
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
});