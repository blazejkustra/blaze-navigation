import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { navigate } from 'blaze-navigation';

const ITEMS = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  title: `Item ${i + 1}`,
}));

export function StackHomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Items</Text>
        <Text style={styles.subtitle}>Select an item to view details.</Text>
      </View>
      <FlatList
        data={ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => navigate(`/home/${item.id}`)}
          >
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.chevron}>&rsaquo;</Text>
          </Pressable>
        )}
        // eslint-disable-next-line react/no-unstable-nested-components
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f9' },
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#09090b',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 2,
  },
  list: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowPressed: {
    backgroundColor: '#fafafa',
  },
  separator: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginHorizontal: 16,
  },
  rowTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#09090b',
  },
  chevron: {
    fontSize: 18,
    color: '#a1a1aa',
  },
});
