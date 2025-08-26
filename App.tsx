import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import withObservables from '@nozbe/with-observables';
import { database } from './src/db';
import Post from './src/db/Post';
import { ServiceProvider, useServices } from './src/context/ServiceContext';
import { useBackgroundSync } from './src/hooks/useBackgroundSync';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { useConsoleLogger } from './src/hooks/useConsoleLogger';
import { PermissionStatus } from './src/services/interfaces/IPermissionService';

const PostsList = ({ posts }: { posts: Post[] }) => (
  <FlatList
    data={posts}
    keyExtractor={(post) => post.id}
    renderItem={({ item }) => (
      <View style={styles.post}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDate}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    )}
  />
);

const enhance = withObservables([], () => ({
  posts: database.collections.get<Post>('posts').query().observe(),
}));

const EnhancedPostsList = enhance(PostsList);

const AppContent = () => {
  const services = useServices();
  const backgroundSyncService = useBackgroundSync();
  const { logs } = useConsoleLogger();
  
  const {
    isInitialized,
    initializationError,
    fcmToken,
    permissionStatus,
    receivedMessages,
    setPermissionStatus
  } = useAppInitialization();

  const manualTrigger = () => {
    console.log('Manual trigger pressed');
    backgroundSyncService.performSyncTask("manual");
  };

  const requestNotificationPermission = async () => {
    try {
      const status = await services.notificationManager.requestPermissionWithFeedback();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      await services.notificationManager.sendTestNotification();
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  };

  const showFCMToken = () => {
    if (fcmToken) {
      Alert.alert('FCM Token', fcmToken);
    } else {
      Alert.alert('No Token', 'FCM token not available');
    }
  };

  if (!isInitialized && !initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Initialization failed: {initializationError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WorkManagerSample</Text>
        <Button title="Manual Sync" onPress={manualTrigger} />
      </View>

      <View style={styles.fcmSection}>
        <Text style={styles.sectionTitle}>FCM & Notifications</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Permission:</Text>
          <View style={[styles.statusBadge, { backgroundColor: services.notificationManager.getPermissionStatusColor(permissionStatus) }]}>
            <Text style={styles.statusText}>
              {permissionStatus ? permissionStatus.toUpperCase() : 'UNKNOWN'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.smallButton} onPress={requestNotificationPermission}>
            <Text style={styles.buttonText}>Request Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={sendTestNotification}>
            <Text style={styles.buttonText}>Test Notification</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={showFCMToken}>
            <Text style={styles.buttonText}>Show Token</Text>
          </TouchableOpacity>
        </View>

        {receivedMessages.length > 0 && (
          <View style={styles.messagesContainer}>
            <Text style={styles.messagesTitle}>Recent FCM Messages:</Text>
            {receivedMessages.map((message, index) => (
              <View key={index} style={styles.messageItem}>
                <Text style={styles.messageTitle}>
                  {message.notification?.title || 'No Title'}
                </Text>
                <Text style={styles.messageBody}>
                  {message.notification?.body || 'No Body'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.postsContainer}>
        <Text style={styles.sectionTitle}>Posts</Text>
        <EnhancedPostsList />
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Logs</Text>
        <FlatList
          data={logs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.logItem}>{item}</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <ServiceProvider>
      <AppContent />
    </ServiceProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  fcmSection: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  smallButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff3e0',
    borderRadius: 6,
  },
  messagesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  messageItem: {
    padding: 6,
    marginBottom: 4,
    backgroundColor: 'white',
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#ff9800',
  },
  messageTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageBody: {
    fontSize: 10,
    color: '#666',
  },
  postsContainer: {
    flex: 2,
    paddingHorizontal: 16,
  },
  post: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postTitle: {
    fontSize: 18,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  logsContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  logsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
  },
  logItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
});

export default App;