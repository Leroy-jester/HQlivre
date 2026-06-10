import { View, Text, Button } from 'react-native';
import { pegarMangas, pegarMangasPorAutor, pegarMangasPorGenero, pegarMangasPorNome } from '../components/Crud';

export function Catalog({ navigation }: any) {
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