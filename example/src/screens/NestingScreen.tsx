import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useParams, navigate, goBack } from 'blaze-navigation';

export function NestingScreen() {
  const { depth } = useParams<{ depth: string }>();
  const level = parseInt(depth, 10) || 1;
  const next = level + 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Level {level}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.depth}>{level}</Text>
        <Text style={styles.label}>Nesting depth</Text>
        <Text style={styles.description}>
          This screen was pushed {level} level{level > 1 ? 's' : ''} deep. Tap
          the button below to go one level deeper.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => navigate(`/home/settings/${next}`)}
        >
          <Text style={styles.buttonText}>Go to level {next}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  backText: { fontSize: 16, color: '#007AFF' },
  title: { fontSize: 24, fontWeight: '700' },
  content: { padding: 20, alignItems: 'center' },
  depth: { fontSize: 72, fontWeight: '800', color: '#007AFF', marginBottom: 8 },
  label: {
    fontSize: 14,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
