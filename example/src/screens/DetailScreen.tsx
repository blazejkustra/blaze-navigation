import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useParams, goBack } from 'blaze-navigation';

export function DetailScreen() {
  const { itemId } = useParams<{ itemId: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Item {itemId}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Item ID</Text>
        <Text style={styles.value}>{itemId}</Text>
        <Text style={styles.description}>
          This is the detail view for item {itemId}. The itemId parameter was
          extracted from the URL path /home/feed/{itemId}.
        </Text>
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
  content: { padding: 20 },
  label: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: { fontSize: 32, fontWeight: '700', marginBottom: 20 },
  description: { fontSize: 16, lineHeight: 24, color: '#444' },
});
