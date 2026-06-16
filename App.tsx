import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Favorite } from './screens/Favorite';
import { Catalog } from './screens/Catalog';
import { Main } from './screens/Main';
import { Detail } from './screens/Detalhes';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          
          <Stack.Screen
            name="Home"
            component={Main}
          />

          <Stack.Screen
            name="Favoritos"
            component={Favorite}
          />

          <Stack.Screen
            name="Catalogo"
            component={Catalog}
          />

          <Stack.Screen
            name="detalhes"
            component={Detail}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}