import { View, Text, StyleSheet, Pressable } from 'react-native';
import { navigate } from 'blaze-navigation';

export function StackTabsHomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Stack + Tabs</Text>
        </View>
        <Text style={styles.title}>Nested Navigation</Text>
        <Text style={styles.description}>
          Push a screen that contains a tab navigator.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigate('/home/detail')}
        >
          <Text style={styles.buttonText}>Open Detail</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  badge: {
    backgroundColor: '#f4f4f5',
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 16,
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
  description: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#18181b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '500',
  },
});
