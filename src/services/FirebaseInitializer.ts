import firebase from '@react-native-firebase/app';

export class FirebaseInitializer {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Checking Firebase initialization...');
      
      const app = firebase.app();
      console.log('Firebase app found:', app.name);
      console.log('Firebase options:', app.options);
      
      this.isInitialized = true;
      console.log('Firebase is ready for use');
    } catch (error) {
      console.error('Firebase check failed:', error);
      throw new Error(`Firebase not properly configured: ${error}. Make sure google-services.json (Android) and GoogleService-Info.plist (iOS) are properly set up.`);
    }
  }

  static isFirebaseInitialized(): boolean {
    try {
      return this.isInitialized && firebase.apps.length > 0;
    } catch {
      return false;
    }
  }
}