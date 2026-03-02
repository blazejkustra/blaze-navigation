import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'blaze-navigation';

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john@example.com</Text>
        </View>
      </View>
      <View style={styles.linksCard}>
        <Link to="/home/settings" style={styles.link}>
          <Text style={styles.linkText}>Go to Settings</Text>
          <Text style={styles.chevron}>&rsaquo;</Text>
        </Link>
        <View style={styles.linkSeparator} />
        <Link to="/home/feed/42" style={styles.link}>
          <Text style={styles.linkText}>View Item 42</Text>
          <Text style={styles.chevron}>&rsaquo;</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#09090b',
    letterSpacing: -0.3,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#71717a',
  },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#09090b',
  },
  email: {
    fontSize: 13,
    color: '#a1a1aa',
    marginTop: 1,
  },
  linksCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    overflow: 'hidden',
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  linkSeparator: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginHorizontal: 16,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#09090b',
  },
  chevron: {
    fontSize: 18,
    color: '#a1a1aa',
  },
});
