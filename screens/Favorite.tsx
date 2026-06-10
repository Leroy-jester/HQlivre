import { View, Text, Button } from 'react-native';

export function Favorite({ navigation }: any) {
  return (
    <View>
        <div>
      <Text>Home</Text>

      <Button
        title="Ir para Home"
        onPress={() => navigation.navigate('Home')}
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