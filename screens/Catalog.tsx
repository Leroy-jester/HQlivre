import { View, Text, Button } from 'react-native';
import { useEffect, useState } from 'react';

import { 
            criaBD,
            pegarMangas,
            pegarMangasPorAutor, 
            pegarMangasPorGenero, 
            pegarMangasPorNome,
            enviarManga
        } from '../components/Crud';


export function Catalog({ navigation }: any) {

    const 
    const [ id, setId ] = useState()
    const [ image_uri, setImage_uri ] = useState()
    const [ nome, setNome ] = useState()
    const [ autor, setAutor] = useState()
    const [ chapters, setChapters ] = useState()
    const [ status, setStatus ] = useState()
    const [ note, setNote ] = useState()
    const [ description, setDescription ] = useState()
    const [ generos, setGeneros ] = useState()

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
            const daodos = await pegarMangas;
            set
        } catch (error) {
            
        }
    }
  return (
    <View>
        <div>
            <Text>Catálôgo</Text>

            <Button
                title="Ir para Home"
                onPress={() => navigation.navigate('Home')}
            />
            <Button
                title="Ir para Favoritos"
                onPress={() => navigation.navigate('Favoritos')}
            />
        </div>

        <div>
            {}
        </div>
      
    </View>
  );
}