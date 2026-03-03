import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'blaze-navigation';
import { useExampleBack } from './ExampleContext';

export function ExampleLayout({ children }: { children: React.ReactNode }) {
  const onBack = useExampleBack();
  const { path } = useRouter();

  return (
    <>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={4}>
          <Text style={styles.backLink}>⬅️ Go back to examples</Text>
        </Pressable>
        <Text style={styles.pathname}>{path}</Text>
      </View>
      <View style={styles.container}>{children}</View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5a5aeb',
  },
  pathname: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888',
    marginTop: 8,
    fontFamily: 'monospace',
  },
});
