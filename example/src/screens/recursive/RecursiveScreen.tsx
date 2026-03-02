import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useParams, navigate, goBack } from 'blaze-navigation';

export function RecursiveScreen() {
  const { depth } = useParams<{ depth: string }>();
  const level = depth ? parseInt(depth, 10) : 0;
  const next = level + 1;

  return (
    <View style={styles.container}>
      {level > 0 && (
        <View style={styles.nav}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            onPress={() => goBack()}
            hitSlop={4}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Current Depth</Text>
          <Text style={styles.value}>{level}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigate(`/home/${next}`)}
        >
          <Text style={styles.buttonText}>Push level {next}</Text>
        </Pressable>
        <Text style={styles.muted}>
          This screen pushes itself recursively. Use the back button to unwind
          the stack.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  nav: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#fff',
  },
  backButtonPressed: {
    backgroundColor: '#fafafa',
  },
  backButtonText: { fontSize: 13, fontWeight: '500', color: '#09090b' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717a',
    marginBottom: 4,
  },
  value: {
    fontSize: 48,
    fontWeight: '600',
    color: '#09090b',
    letterSpacing: -1,
  },
  button: {
    backgroundColor: '#18181b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 16,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '500',
  },
  muted: {
    fontSize: 13,
    lineHeight: 20,
    color: '#a1a1aa',
    textAlign: 'center',
  },
});
