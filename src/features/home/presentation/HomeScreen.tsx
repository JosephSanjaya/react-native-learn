import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import withObservables from '@nozbe/with-observables';
import { database } from '../../../core/data/db';
import Post from '../../../core/data/db/Post.ts';
import { useHomeViewModel } from './useHomeViewModel.ts';

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

interface HomeScreenProps {
  onNavigateToBluetooth?: () => void;
  onNavigateToCamera?: () => void;
}

export const HomeScreen = ({ onNavigateToBluetooth, onNavigateToCamera }: HomeScreenProps) => {
  const { state, actions } = useHomeViewModel();

  if (!state.isInitialized && !state.initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state.initializationError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Initialization failed: {state.initializationError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WorkManagerSample</Text>
        <View style={styles.headerButtons}>
          <Button 
            title={state.isPerformingSync ? "Syncing..." : "Manual Sync"} 
            onPress={actions.performManualSync}
            disabled={state.isPerformingSync}
          />
        </View>
      </View>

      <View style={styles.featuresSection}>
        {onNavigateToBluetooth && (
          <TouchableOpacity 
            style={styles.featureCard} 
            onPress={onNavigateToBluetooth}
          >
            <View style={styles.featureCardContent}>
              <Text style={styles.featureCardTitle}>🖨️ Bluetooth Printer</Text>
              <Text style={styles.featureCardSubtitle}>Connect and print to thermal printers</Text>
            </View>
            <Text style={styles.featureCardArrow}>→</Text>
          </TouchableOpacity>
        )}
        
        {onNavigateToCamera && (
          <TouchableOpacity 
            style={[styles.featureCard, styles.cameraCard]} 
            onPress={onNavigateToCamera}
          >
            <View style={styles.featureCardContent}>
              <Text style={styles.featureCardTitle}>📷 Barcode Scanner</Text>
              <Text style={styles.featureCardSubtitle}>Scan barcodes with camera</Text>
            </View>
            <Text style={styles.featureCardArrow}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.fcmSection}>
        <Text style={styles.sectionTitle}>FCM & Notifications</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Permission:</Text>
          <View style={[styles.statusBadge, { backgroundColor: state.permissionStatusColor }]}>
            <Text style={styles.statusText}>
              {state.permissionStatus ? state.permissionStatus.toUpperCase() : 'UNKNOWN'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.smallButton, state.isRequestingPermission && styles.disabledButton]} 
            onPress={actions.requestNotificationPermission}
            disabled={state.isRequestingPermission}
          >
            <Text style={styles.buttonText}>
              {state.isRequestingPermission ? 'Requesting...' : 'Request Permission'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.smallButton, state.isSendingTestNotification && styles.disabledButton]} 
            onPress={actions.sendTestNotification}
            disabled={state.isSendingTestNotification}
          >
            <Text style={styles.buttonText}>
              {state.isSendingTestNotification ? 'Sending...' : 'Test Notification'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={actions.showFCMToken}>
            <Text style={styles.buttonText}>Show Token</Text>
          </TouchableOpacity>
        </View>

        {state.receivedMessages.length > 0 && (
          <View style={styles.messagesContainer}>
            <Text style={styles.messagesTitle}>Recent FCM Messages:</Text>
            {state.receivedMessages.map((message, index) => (
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

        {state.error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{state.error}</Text>
            <TouchableOpacity onPress={actions.clearError} style={styles.errorCloseButton}>
              <Text style={styles.errorCloseText}>×</Text>
            </TouchableOpacity>
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
          data={state.logs}
          keyExtractor={(logItem, index) => index.toString()}
          renderItem={({ item: logItem }) => <Text style={styles.logItem}>{logItem}</Text>}
        />
      </View>
    </SafeAreaView>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuresSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraCard: {
    backgroundColor: '#4CAF50',
  },
  featureCardContent: {
    flex: 1,
  },
  featureCardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  featureCardArrow: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
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
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#F44336',
    fontSize: 14,
    flex: 1,
  },
  errorCloseButton: {
    marginLeft: 8,
    padding: 4,
  },
  errorCloseText: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: 'bold',
  },
});