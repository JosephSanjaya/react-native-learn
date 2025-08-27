import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ServiceProvider } from './src/di/context/ServiceContext';
import { HomeScreen } from './src/presentation/screen/home/HomeScreen';
import { BluetoothScreen } from './src/presentation/screen/bluetooth/BluetoothScreen';

type Screen = 'home' | 'bluetooth';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigateToBluetooth={() => setCurrentScreen('bluetooth')} />;
      case 'bluetooth':
        return <BluetoothScreen onNavigateBack={() => setCurrentScreen('home')} />;
      default:
        return <HomeScreen onNavigateToBluetooth={() => setCurrentScreen('bluetooth')} />;
    }
  };

  return (
    <SafeAreaProvider>
      <ServiceProvider>
        {renderScreen()}
      </ServiceProvider>
    </SafeAreaProvider>
  );
};

export default App;