import { View, Text, Button } from 'react-native';
import { TopBar } from '../components/Topbar';
import { Footer } from '../components/Footer';

export function Main({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
    <TopBar type="main"/>
      

      <Text>Home</Text>
    <Footer/>
    </View>
  );
}