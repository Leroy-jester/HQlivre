import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';
import {
  listarDestaques,
  listarLancamentos
} from '../components/Crud';
import { sincronizar } from '../components/sync';
import { MangaCompleto } from '../components/Types/typos';
import erro404 from '../assets/erro404.jpg';

export function Main({ navigation }: any) {
  const [destaques, setDestaques] = useState<MangaCompleto[]>([]);
  const [lancamentos, setLancamentos] = useState<MangaCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    try {
      await sincronizar();
    } catch (err) {
      console.log('Erro na sincronização (continuando com dados locais):', err);
    }

    // Sempre carrega os dados locais (independente da sincronização)
    try {
      // const [destaquesData, lancamentosData] = await Promise.all([
      //   listarDestaques(),
      //   listarLancamentos(),
      // ]);
      
      // setDestaques(destaquesData);
      // setLancamentos(lancamentosData);

      const destaquesData = (await listarDestaques()) || [];
      const lancamentosData = (await listarLancamentos()) || [];
      setDestaques(destaquesData);
      setLancamentos(lancamentosData);
    } catch (err) {
      console.log('Erro ao carregar dados locais:', err);
    } finally {
      setCarregando(false);
    }
  }

  function isCapaValida(uri: string | undefined): boolean {
    return !!uri && uri !== 'asd' && uri !== 'null' && uri !== 'undefined' && uri.trim() !== '';
  }

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFF' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar type="main" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Nós da HQ-livre nos dedicamos a traduzir as HQ’s e Mangás, mas não é só tradução é também localizamos quando traduzimos. E temos que indexar os mangá e HQ’s para que nosso site não caia :) obrigado por ler em HQ LIVRE
          </Text>
        </View>

        <Text style={styles.titulo}>Destaques</Text>
        {destaques.length === 0 ? (
          <Text style={styles.semDados}>Nenhum destaque disponível</Text>
        ) : (
          <FlashList
            horizontal
            data={destaques}
            showsHorizontalScrollIndicator={false}
            style={{ height: 180, alignItems: 'center' }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('detalhes', { id: item.id })}
              >
                <Image
                  source={isCapaValida(item.image_uri) ? { uri: item.image_uri } : erro404}
                  style={styles.destaque}
                  contentFit="cover"
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => String(item.id)}
          />
        )}

        <Text style={styles.titulo}>Lançamentos</Text>
        {lancamentos.length === 0 ? (
          <Text style={styles.semDados}>Nenhum lançamento disponível</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {lancamentos.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('detalhes', { id: item.id })}
                style={{ margin: 5 }}
              >
                <Image
                  source={isCapaValida(item.image_uri) ? { uri: item.image_uri } : erro404}
                  style={styles.lancamento}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  banner: {
    backgroundColor: '#383838',
    margin: 10,
    padding: 15,
  },
  bannerText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  titulo: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  destaque: {
    width: 110,
    height: 160,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  lancamento: {
    width: 100,
    height: 145,
    borderRadius: 10,
    margin: 5,
  },
  semDados: {
    color: '#999',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
  },
});