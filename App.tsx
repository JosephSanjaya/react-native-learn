import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ServiceProvider } from './src/di/context/ServiceContext';
import { HomeScreen } from './src/presentation/screen/home/HomeScreen';
import { BluetoothScreen } from './src/presentation/screen/bluetooth/BluetoothScreen';
import { CameraScreen } from './src/presentation/screen/camera/CameraScreen';

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