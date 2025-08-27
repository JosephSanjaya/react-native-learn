import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ServiceProvider } from './src/di/context/ServiceContext';
import { HomeScreen } from './src/presentation/screen/home/HomeScreen';

const App = () => {
  return (
    <SafeAreaProvider>
      <ServiceProvider>
        <HomeScreen />
      </ServiceProvider>
    </SafeAreaProvider>
  );
};

export default App;