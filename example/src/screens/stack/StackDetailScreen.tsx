import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useParams, goBack } from 'blaze-navigation';

export function StackDetailScreen() {
  const { itemId } = useParams<{ itemId: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => goBack()}
          hitSlop={4}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Item ID</Text>
          <Text style={styles.value}>{itemId}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Route</Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>/home/{itemId}</Text>
          </View>
        </View>
        <Text style={styles.muted}>
          The itemId parameter was extracted from the URL path using a dynamic
          route segment.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  nav: {
    paddingHorizontal: 24,
    paddingBottom: 16,
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
  backText: { fontSize: 13, fontWeight: '500', color: '#09090b' },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717a',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '600',
    color: '#09090b',
    letterSpacing: -0.5,
  },
  codeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f4f4f5',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  codeText: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: '#09090b',
  },
  muted: {
    fontSize: 13,
    lineHeight: 20,
    color: '#a1a1aa',
    marginTop: 8,
  },
});
