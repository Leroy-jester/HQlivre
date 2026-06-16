import { View, Text, Button } from 'react-native';
import { Footer } from '../components/Footer';
import { TopBar } from '../components/TopBar';

export function Favorite({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
      <TopBar type="main"/>
      <Text>Favorite</Text>
    <Footer/>
    </View>
  );
}