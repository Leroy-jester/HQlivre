import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Favorite } from './screens/Favorite';
import { Catalog } from './screens/Catalog';
import { Main } from './screens/Main';
import { Detail } from './screens/detalhes';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Main}
        />

        <Stack.Screen
          name="Favoritos"
          component={Favorite}
        />

        <Stack.Screen
          name='Catalogo'
          component={Catalog}
        />

        <Stack.Screen
          name='detalhes'
          component={Detail}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}