import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider } from './src/context/AudioContext';
import HomeScreen from './src/screens/HomeScreen';
import MixScreen from './src/screens/MixScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Mix" component={MixScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AudioProvider>
    </SafeAreaProvider>
  );
}
