import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
};

export function TabContentScreen({ title }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#f4f4f5',
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#71717a',
  },
});
