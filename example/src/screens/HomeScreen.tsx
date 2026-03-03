import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';

type Example = {
  key: string;
  title: string;
  description: string;
};

type Props = {
  examples: Example[];
  onSelect: (key: string) => void;
};

export function HomeScreen({ examples, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Examples</Text>
        <Text style={styles.subtitle}>
          Browse navigation patterns built with blaze-navigation.
        </Text>
      </View>
      <FlatList
        data={examples}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 68,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#09090b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 4,
  },
  list: {
    padding: 16,
    gap: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 16,
  },
  cardPressed: {
    backgroundColor: '#fafafa',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#09090b',
  },
  cardDescription: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
});
