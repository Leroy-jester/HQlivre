import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { Manga, Gender, MangaCompleto } from '../components/Types/typos';
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Footer } from '../components/Footer';
import {
  initDatabase,
  listarMangas,
  criarMangaLocal,
  listarGeneros,
} from '../components/Crud';
import { TopBar } from '../components/TopBar';
import { Card } from '../components/Card';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

export function Catalog({ navigation }: any) {
  const [mangas, setMangas] = useState<MangaCompleto[]>([]);
  const [image_uri, setImage_uri] = useState<string>('');
  const [nome, setNome] = useState<string>('');
  const [autor, setAutor] = useState<string>('');
  const [chapters, setChapters] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [note, setNote] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [generos, setGeneros] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [pesquisa, setPesquisa] = useState('');
  const [generoSelecionado, setGeneroSelecionado] = useState('');
  const [generosDisponiveis, setGenerosDisponiveis] = useState<Gender[]>([]);
  const [buscaGenero, setBuscaGenero] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      await initDatabase();
      await carregarMangas();
      const listaGeneros = await listarGeneros();
      setGenerosDisponiveis(listaGeneros || []);
    } catch (error) {
      console.log('ERRO INIT', error);
    } finally {
      setCarregando(false);
    }
  };

  const carregarMangas = async () => {
    try {
      const resposta = await listarMangas();
      // Garante que seja um array e filtra itens inválidos
      const mangasValidos = Array.isArray(resposta) 
        ? resposta.filter(item => item && item.id && item.nome)
        : [];
      setMangas(mangasValidos);
    } catch (error) {
      console.error('Erro ao carregar mangás', error);
      setMangas([]);
    }
  };

  const mangasFiltrados = mangas.filter((manga) => {
    if (!manga || !manga.nome) return false;
    const nomeOk = manga.nome.toLowerCase().includes(pesquisa.toLowerCase());
    const generoOk =
      generoSelecionado === ''
        ? true
        : manga.generos?.some((g) => g.nome_genero === generoSelecionado) || false;
    return nomeOk && generoOk;
  });

  async function selecionarImagem() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) {
        alert('Permissão negada');
        return;
      }
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (!resultado.canceled) {
        setImage_uri(resultado.assets[0].uri);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function toggleGenero(idGenero: number) {
    if (generos.includes(idGenero)) {
      setGeneros(generos.filter((id) => id !== idGenero));
    } else {
      setGeneros([...generos, idGenero]);
    }
  }

  const generosFiltrados = generosDisponiveis.filter((g) =>
    g.nome_genero.toLowerCase().includes(buscaGenero.toLowerCase())
  );

  if (carregando) {
    return (
      <View style={styles.container}>
        <TopBar type="main" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#FFF' }}>Carregando...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar type="main" />

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#999" />
        <TextInput
          placeholder="Pesquisar..."
          placeholderTextColor="#999"
          value={pesquisa}
          onChangeText={setPesquisa}
          style={styles.searchInput}
        />
      </View>

      <FlashList
        horizontal
        data={[{ id: 0, nome_genero: '' }, ...generosDisponiveis]}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.generoBotao,
              generoSelecionado === item.nome_genero && styles.generoSelecionado,
            ]}
            onPress={() => setGeneroSelecionado(item.nome_genero)}
          >
            <Text style={styles.generoTexto}>{item.nome_genero || 'Todos'}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => String(item.id)}
      />

      <Text style={styles.titulo}>Obras</Text>

      {mangasFiltrados.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#999', fontSize: 16 }}>Nenhum mangá encontrado</Text>
        </View>
      ) : (
        <FlashList
          data={mangasFiltrados}
          renderItem={({ item }) => {
            // Verificação extra de segurança
            if (!item || !item.id) {
              return null;
            }
            return (
              <Card
                manga={item}
                onPress={() =>
                  navigation.navigate('detalhes', { id: item.id })
                }
              />
            );
          }}
          keyExtractor={(item) => {
            // Garante que a key seja única e válida
            return item && item.id ? String(item.id) : Math.random().toString();
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={35} color="#000" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Novo Mangá</Text>

            <TouchableOpacity style={styles.imagemBotao} onPress={selecionarImagem}>
              {image_uri ? (
                <Image source={{ uri: image_uri }} style={styles.preview} contentFit="cover" />
              ) : (
                <Text>Selecionar capa</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Gêneros</Text>
            <TextInput
              placeholder="Pesquisar gênero..."
              value={buscaGenero}
              onChangeText={setBuscaGenero}
              style={styles.input}
            />

            <ScrollView style={styles.generosScroll} nestedScrollEnabled>
              <View style={styles.generosContainer}>
                {generosFiltrados.map((genero) => {
                  const selecionado = generos.includes(genero.id);
                  return (
                    <TouchableOpacity
                      key={genero.id}
                      style={[styles.chip, selecionado && styles.chipSelecionado]}
                      onPress={() => toggleGenero(genero.id)}
                    >
                      <Text style={[styles.chipTexto, selecionado && styles.chipTextoSelecionado]}>
                        {genero.nome_genero}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TextInput
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
            <TextInput
              placeholder="Autor"
              value={autor}
              onChangeText={setAutor}
              style={styles.input}
            />
            <TextInput
              placeholder="Capítulos"
              keyboardType="numeric"
              value={chapters.toString()}
              onChangeText={(texto) => setChapters(Number(texto))}
              style={styles.input}
            />
            <TextInput
              placeholder="Status"
              value={status}
              onChangeText={setStatus}
              style={styles.input}
            />
            <TextInput
              placeholder="Nota (0-5)"
              keyboardType="numeric"
              value={note.toString()}
              onChangeText={(texto) => {
                const valor = Number(texto);
                if (valor >= 0 && valor <= 5) {
                  setNote(valor);
                }
              }}
              style={styles.input}
            />
            <TextInput
              placeholder="Descrição"
              value={description}
              onChangeText={setDescription}
              multiline
              style={[styles.input, { height: 100 }]}
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSalvar}
                onPress={async () => {
                  if (!nome.trim()) {
                    alert('Informe o nome do mangá');
                    return;
                  }
                  if (!autor.trim()) {
                    alert('Informe o autor');
                    return;
                  }
                  try {
                    await criarMangaLocal(
                      {
                        image_uri,
                        nome,
                        autor,
                        chapters,
                        status,
                        note,
                        description,
                      },
                      generos
                    );
                    await carregarMangas();
                    setImage_uri('');
                    setNome('');
                    setAutor('');
                    setChapters(0);
                    setStatus('');
                    setDescription('');
                    setNote(0);
                    setGeneros([]);
                    setModalVisible(false);
                  } catch (error) {
                    console.log(error);
                    alert('Erro ao salvar mangá');
                  }
                }}
              >
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
  // ... mantém os mesmos styles que você já tinha
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  titulo: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 15,
    marginVertical: 10,
  },
  generoBotao: {
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  generoSelecionado: {
    backgroundColor: '#FFC107',
  },
  generoTexto: {
    color: '#FFF',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
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
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
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
  imagemBotao: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
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
});