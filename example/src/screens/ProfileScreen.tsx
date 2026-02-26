import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'blaze-navigation';

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john@example.com</Text>
      </View>
      <Link to="/home/settings" style={styles.link}>
        <Text style={styles.linkText}>Go to Settings</Text>
      </Link>
      <Link to="/home/feed/42" style={styles.link}>
        <Text style={styles.linkText}>View Item 42</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    padding: 20,
  },
  header: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  name: { fontSize: 22, fontWeight: '600', marginBottom: 4 },
  email: { fontSize: 16, color: '#666' },
  link: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
