import { View, Text, StyleSheet } from 'react-native';

export function TabsScreenA() {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Explore</Text>
      </View>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Browse and find new content.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  badge: {
    backgroundColor: '#f4f4f5',
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717a',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#09090b',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 4,
  },
});
