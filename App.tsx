import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
} from 'react-native';
import withObservables from '@nozbe/with-observables';
import { database } from './src/db';
import Post from './src/db/Post';
import { configureBackgroundFetch } from './src/services/BackgroundSync';
import BackgroundFetch from 'react-native-background-fetch';

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

const App = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    configureBackgroundFetch();

    const logListener = (message: string) => {
      setLogs((prevLogs) => [...prevLogs, message]);
    };

    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      logListener(args.join(' '));
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const manualTrigger = () => {
    BackgroundFetch.scheduleTask({
      taskId: 'react-native-background-fetch',
      delay: 5000, // 5 seconds
      forceAlarmManager: true,
      periodic: false,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WorkManagerSample</Text>
        <Button title="Manual Sync" onPress={manualTrigger} />
      </View>
      <View style={styles.postsContainer}>
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
  postsContainer: {
    flex: 1,
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
});

export default App;