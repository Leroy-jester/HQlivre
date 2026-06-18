import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  // Image
} from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';
import {
  pegarDestaques,
  pegarLancamentos
} from '../components/Crud';
import { MangaCompleto } from '../components/Types/typos';
import erro404 from '../assets/erro404.jpg'


export function Main({ navigation }: any) {

  const [destaques, setDestaques] = useState<MangaCompleto[]>([]);
  const [lancamentos, setLancamentos] = useState<MangaCompleto[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {

      const dadosDestaques =
        await pegarDestaques();

      const dadosLancamentos =
        await pegarLancamentos();

      setDestaques(dadosDestaques);
      setLancamentos(dadosLancamentos);

    } catch (erro) {
      console.log(erro);
    }
  }

  return (
    <View style={styles.container}>

      <TopBar type="main" />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120
        }}
      >

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Nós da HQ-livre nos dedicamos a traduzir as HQ’s e Mangás, mas não é só tradução é também locolizamos quando traduzimos. E temos que indexarmos os mangá e HQ’s para que nosso site não caia :) obrigado por ler em HQ LIVRE
          </Text>
        </View>

        <Text style={styles.titulo}>
          Destaques
        </Text>

        <FlashList
          horizontal
          data={destaques}
          // estimatedItemSize={140}
          showsHorizontalScrollIndicator={false}
            style={{
              height: 180,
              alignItems: 'center',
            }}
          renderItem={({ item }) => {
            const capaValida =
              item.image_uri &&
              item.image_uri !== 'asd' &&
              item.image_uri !== 'null' &&
              item.image_uri !== 'undefined' &&
              item.image_uri.trim() !== '';
              // console.log(item.nome, item.image_uri);
            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(
                    'detalhes',
                    {
                      id: item.id
                    }
                  )
                }
              >
                
                <Image
                  source={
                    capaValida
                      ? { uri: item.image_uri }
                      : erro404
                  }
                  style={styles.destaque}
                  contentFit="cover"
                />
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.titulo}>
          Lançamentos
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {lancamentos.map(item => {
            const capaValida =
              item.image_uri &&
              item.image_uri !== 'asd' &&
              item.image_uri !== 'null' &&
              item.image_uri !== 'undefined' &&
              item.image_uri.trim() !== '';
            return(
              <TouchableOpacity

              onPress={() =>
                  navigation.navigate(
                    'detalhes',
                    {
                      id: item.id
                    }
                  )
                }

              key={item.id}
              style={{ margin: 5 }}
            >
              <Image
                source={
                  capaValida
                      ? { uri: item.image_uri }
                      : erro404
                }
                style={styles.lancamento}
              />
            </TouchableOpacity>
            )
          })}
        </View>

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

});