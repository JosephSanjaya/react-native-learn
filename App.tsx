import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ServiceProvider } from './src/core/di/context/ServiceContext';
import { HomeScreen } from './src/features/home/presentation/HomeScreen.tsx';
import { BluetoothScreen } from './src/features/bluetooth/presentation/BluetoothScreen.tsx';
import { CameraScreen } from './src/features/camera/presentation/CameraScreen.tsx';

type Screen = 'home' | 'bluetooth' | 'camera';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigateToBluetooth={() => setCurrentScreen('bluetooth')}
            onNavigateToCamera={() => setCurrentScreen('camera')}
          />
        );
      case 'bluetooth':
        return <BluetoothScreen onNavigateBack={() => setCurrentScreen('home')} />;
      case 'camera':
        return <CameraScreen onNavigateBack={() => setCurrentScreen('home')} />;
      default:
        return (
          <HomeScreen 
            onNavigateToBluetooth={() => setCurrentScreen('bluetooth')}
            onNavigateToCamera={() => setCurrentScreen('camera')}
          />
        );
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