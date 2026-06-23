import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initDatabase } from './components/Crud';
import { Favorite } from './screens/Favorite';
import { Catalog } from './screens/Catalog';
import { Main } from './screens/Main';
import { Detail } from './screens/Detalhes';
import { Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (error) {
        console.log('Erro ao inicializar banco:', error);
      }
    }
    setup();
  }, []);

  if (!dbReady) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Carregando banco...</Text></View>;
  }

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