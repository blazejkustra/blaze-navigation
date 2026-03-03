import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { createRouter, NavigationProvider } from 'blaze-navigation';
import type { TabBarRenderProps } from 'blaze-navigation';
import { ExampleContext } from './ExampleContext';
import { ExampleLayout } from './ExampleLayout';

import { HomeScreen } from './screens/HomeScreen';
import { StackHomeScreen } from './screens/stack/StackHomeScreen';
import { StackDetailScreen } from './screens/stack/StackDetailScreen';
import { TabsScreenA } from './screens/tabs/TabsScreenA';
import { TabsScreenB } from './screens/tabs/TabsScreenB';
import { TabsScreenC } from './screens/tabs/TabsScreenC';
import { FeedScreen } from './screens/FeedScreen';
import { DetailScreen } from './screens/DetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { RecursiveScreen } from './screens/recursive/RecursiveScreen';

// --- Router configs ---

const simpleStackRouter = createRouter({
  navigator: 'stack',
  layout: ExampleLayout,
  children: {
    home: {
      component: StackHomeScreen,
      children: {
        $itemId: { component: StackDetailScreen },
      },
    },
  },
});

const simpleTabsRouter = createRouter({
  navigator: 'tabs',
  layout: ExampleLayout,
  children: {
    explore: {
      component: TabsScreenA,
      tabOptions: {
        title: 'Explore',
        icon: {
          ios: { type: 'sfSymbol', name: 'magnifyingglass' },
          android: { type: 'drawableResource', name: 'ic_search' },
        },
      },
    },
    favorites: {
      component: TabsScreenB,
      tabOptions: {
        title: 'Favorites',
        icon: {
          ios: { type: 'sfSymbol', name: 'star' },
          android: { type: 'drawableResource', name: 'ic_star' },
        },
      },
    },
    account: {
      component: TabsScreenC,
      tabOptions: {
        title: 'Account',
        icon: {
          ios: { type: 'sfSymbol', name: 'person' },
          android: { type: 'drawableResource', name: 'ic_person' },
        },
      },
    },
  },
});

const tabsWithStacksRouter = createRouter({
  navigator: 'tabs',
  layout: ExampleLayout,
  children: {
    feed: {
      component: FeedScreen,
      navigator: 'stack',
      tabOptions: {
        title: 'Feed',
        icon: {
          ios: { type: 'sfSymbol', name: 'list.bullet' },
          android: { type: 'drawableResource', name: 'ic_feed' },
        },
      },
      children: {
        $itemId: { component: DetailScreen },
      },
    },
    profile: {
      component: ProfileScreen,
      tabOptions: {
        title: 'Profile',
        icon: {
          ios: { type: 'sfSymbol', name: 'person' },
          android: { type: 'drawableResource', name: 'ic_person' },
        },
      },
    },
    settings: {
      component: SettingsScreen,
      navigator: 'stack',
      tabOptions: {
        title: 'Settings',
        icon: {
          ios: { type: 'sfSymbol', name: 'gearshape' },
          android: { type: 'drawableResource', name: 'ic_settings' },
        },
      },
      children: {
        $depth: { component: RecursiveScreen },
      },
    },
  },
});

const recursiveStackRouter = createRouter({
  navigator: 'stack',
  layout: ExampleLayout,
  children: {
    home: {
      component: RecursiveScreen,
      children: {
        $depth: { component: RecursiveScreen },
      },
    },
  },
});

function CustomTabBar({ state, onTabPress }: TabBarRenderProps) {
  const { bottom } = useSafeAreaInsets();
  const icons: Record<string, string> = {
    explore: '🔍',
    favorites: '⭐',
    account: '👤',
  };

  return (
    <View style={[styles.customTabBar, { paddingBottom: bottom }]}>
      {Object.entries(state.tabs).map(([key, tab]) => {
        const isActive = key === state.activeKey;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.customTab, isActive && styles.customTabActive]}
            onPress={() => onTabPress(key)}
          >
            <Text style={styles.customTabIcon}>{icons[key] ?? '📄'}</Text>
            <Text
              style={[
                styles.customTabLabel,
                isActive && styles.customTabLabelActive,
              ]}
            >
              {tab.tabOptions?.title ?? key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const customTabBarRouter = createRouter({
  navigator: 'tabs',
  layout: ExampleLayout,
  customTabBar: (props) => <CustomTabBar {...props} />,
  children: {
    explore: {
      component: TabsScreenA,
      tabOptions: { title: 'Explore' },
    },
    favorites: {
      component: TabsScreenB,
      tabOptions: { title: 'Favorites' },
    },
    account: {
      component: TabsScreenC,
      tabOptions: { title: 'Account' },
    },
  },
});

// --- Example definitions ---

const EXAMPLES = [
  {
    key: 'simple-stack',
    title: 'Simple Stack',
    description: 'List pushing to a detail screen',
    router: simpleStackRouter,
  },
  {
    key: 'simple-tabs',
    title: 'Simple Tabs',
    description: 'Three tabs with independent content',
    router: simpleTabsRouter,
  },
  {
    key: 'tabs-with-stacks',
    title: 'Tabs + Stacks',
    description: 'Tabs where each tab has its own stack',
    router: tabsWithStacksRouter,
  },
  {
    key: 'recursive-stack',
    title: 'Recursive Stack',
    description: 'A screen that pushes itself infinitely',
    router: recursiveStackRouter,
  },
  {
    key: 'custom-tab-bar',
    title: 'Custom Tab Bar',
    description: 'Tabs with a custom React component tab bar',
    router: customTabBarRouter,
  },
];

export default function App() {
  const [activeExample, setActiveExample] = useState<string | null>(null);

  if (activeExample === null) {
    return (
      <HomeScreen
        examples={EXAMPLES}
        onSelect={(key) => setActiveExample(key)}
      />
    );
  }

  const example = EXAMPLES.find((e) => e.key === activeExample);
  if (!example) return null;

  const contextValue = { onBack: () => setActiveExample(null) };

  return (
    <SafeAreaProvider>
      <ExampleContext.Provider value={contextValue}>
        <NavigationProvider router={example.router} />
      </ExampleContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    paddingTop: 8,
  },
  customTab: {
    flex: 1,
    alignItems: 'center',
    borderTopWidth: 2,
    paddingVertical: 4,
    borderTopColor: 'transparent',
  },
  customTabActive: {
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  customTabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  customTabLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  customTabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
