import { View, Text, Button, TextInput, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { Manga, Gender, MangaCompleto } from '../components/Types/typos';
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Footer } from '../components/Footer'
import { 
            criaBD,
            pegarMangas,
            pegarMangasPorAutor, 
            pegarMangasPorGenero, 
            pegarMangasPorNome,
            enviarManga
        } from '../components/Crud';

export function Catalog({ navigation }: any) {

    const [mangas, setMangas] = useState<MangaCompleto[]>([]);
    const [id, setId] = useState<string>('');
    const [image_uri, setImage_uri] = useState<string>('');
    const [nome, setNome] = useState<string>('');
    const [autor, setAutor] = useState<string>('');
    const [chapters, setChapters] = useState<number>(0);
    const [status, setStatus] = useState<string>('');
    const [note, setNote] = useState<number>(0);
    const [description, setDescription] = useState<string>('');
    const [generos, setGeneros] = useState<string[]>([]);

    useEffect(() => {
        init();
    }, [])

    const init = async () => {
        try {
            await criaBD();
            await carregarMangas()
        } catch(error) {
            console.log('ERRO INIT', error);
        }
    }

    const carregarMangas = async () =>{
        try {
            const respota = await pegarMangas();
            setMangas(respota || [])
        } catch (error) {
            console.error('fui errado', error);
        }
    }
    const cadastrarTeste = async () => {
      try {
          console.log('enviando mangás');
          
          await enviarManga({
            image_uri: '',
            nome: 'Naruto',
            autor: 'Masashi Kishimoto',
            chapters: 700,
            status: 'Finalizado',
            note: 5,
            description: 'Teste SQLite'
            },[1,2,5]);

          console.log('Manga cadastrado');

          const mangas = await pegarMangas();

          console.log('MANGAS:', mangas);

          setMangas(mangas);
      } catch (error) {
          console.error(
            'ERRO AO CADASTRAR:',
            JSON.stringify(error, null, 2)
          );
      }
  };
    
  return (
    <View>
            <Text>Catálôgo</Text>
              <TouchableOpacity onPress={cadastrarTeste}>
                  <Text>Cadastrar Teste</Text>
              </TouchableOpacity>
            
            <View>
            <FlashList
                data={mangas}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.nome}</Text>
                        <Text>{item.autor}</Text>
                        <Text>
                            {item.generos
                                ?.map(g => g.nome_genero)
                                .join(', ')
                            }
                        </Text>
                    </View>
                )}
            />
            </View>
            <Footer/>
    </View>
  );
}