import { View, Text, StyleSheet, Pressable } from 'react-native';
import { goBack } from 'blaze-navigation';

export function StackTabsDetailScreen() {
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  nav: {
    paddingTop: 60,
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
});
