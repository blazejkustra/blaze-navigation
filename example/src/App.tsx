import { useState } from 'react';
import { createRouter, NavigationProvider } from 'blaze-navigation';
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

const tabsWithStacksRouter = createRouter({
  navigator: 'tabs',
  layout: ExampleLayout,
  children: {
    feed: {
      component: FeedScreen,
      navigator: 'stack',
      tabOptions: { title: 'Feed' },
      children: {
        $itemId: { component: DetailScreen },
      },
    },
    profile: {
      component: ProfileScreen,
      tabOptions: { title: 'Profile' },
    },
    settings: {
      component: SettingsScreen,
      navigator: 'stack',
      tabOptions: { title: 'Settings' },
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
    <ExampleContext.Provider value={contextValue}>
      <NavigationProvider router={example.router} />
    </ExampleContext.Provider>
  );
}
