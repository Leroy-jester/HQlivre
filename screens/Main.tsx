import { View, Text, Button } from 'react-native';

export function Main({ navigation }: any) {
  return (
    <View>
      <div>
      <Text>Home</Text>

      
      <Button
        title="Ir para Favoritos"
        onPress={() => navigation.navigate('Favoritos')}
      />
      <Button
        title="Ir para Catalogo"
        onPress={() => navigation.navigate('Catalogo')}
      />
              </div>

        <div>
            
        </div>
    </View>
  );
}