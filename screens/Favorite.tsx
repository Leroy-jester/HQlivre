import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Footer } from '../components/Footer';
import { TopBar } from '../components/TopBar';
import { Card } from '../components/Card';
import { listarFavoritos } from '../components/Crud';
import { MangaCompleto } from '../components/Types/typos';

export function Favorite({ navigation }: any) {
  const [favoritos, setFavoritos] = useState<MangaCompleto[]>([]);

  useEffect(() => {
    carregarFavoritos();
  }, []);

  async function carregarFavoritos() {
    try {
      const lista = await listarFavoritos();
      setFavoritos(lista);
    } catch (error) {
      console.log('Erro ao carregar favoritos:', error);
    }
  }

  return (
    <View style={styles.container}>
      <TopBar type="main" />
      <Text style={styles.titulo}>Meus Favoritos</Text>
      {favoritos.length === 0 ? (
        <Text style={styles.semDados}>Nenhum mangá favoritado ainda.</Text>
      ) : (
        <FlatList
          data={favoritos}
          renderItem={({ item }) => (
            <Card
              manga={item}
              onPress={() => navigation.navigate('detalhes', { id: item.id })}
            />
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  titulo: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  semDados: {
    color: '#999',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
});