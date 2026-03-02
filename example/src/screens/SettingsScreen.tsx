import { View, Text, StyleSheet, Switch } from 'react-native';
import { useState } from 'react';

export function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#e4e4e7', true: '#18181b' }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#e4e4e7', true: '#18181b' }}
            thumbColor="#fff"
          />
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Version</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>0.1.0</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#09090b',
    letterSpacing: -0.3,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginHorizontal: 16,
  },
  label: { fontSize: 14, fontWeight: '400', color: '#09090b' },
  versionBadge: {
    backgroundColor: '#f4f4f5',
    borderRadius: 100,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717a',
  },
});
