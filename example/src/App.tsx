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
import { StackTabsHomeScreen } from './screens/stack-tabs/StackTabsHomeScreen';
import { TabContentScreen } from './screens/stack-tabs/TabContentScreen';
import { RecursiveScreen } from './screens/recursive/RecursiveScreen';

function OverviewTab() {
  return <TabContentScreen title="Overview" />;
}
function ReviewsTab() {
  return <TabContentScreen title="Reviews" />;
}
function RelatedTab() {
  return <TabContentScreen title="Related" />;
}

// --- Router configs ---

const simpleStackRouter = createRouter({
  routes: {
    home: {
      component: StackHomeScreen,
      layout: ExampleLayout,
      navigator: 'stack',
      children: {
        $itemId: { component: StackDetailScreen },
      },
    },
  },
});

const simpleTabsRouter = createRouter({
  routes: {
    home: {
      navigator: 'tabs',
      children: {
        explore: {
          component: TabsScreenA,
          layout: ExampleLayout,
          tabOptions: { title: 'Explore' },
        },
        favorites: {
          component: TabsScreenB,
          layout: ExampleLayout,
          tabOptions: { title: 'Favorites' },
        },
        account: {
          component: TabsScreenC,
          layout: ExampleLayout,
          tabOptions: { title: 'Account' },
        },
      },
    },
  },
});

const tabsWithStacksRouter = createRouter({
  routes: {
    home: {
      navigator: 'tabs',
      children: {
        feed: {
          component: FeedScreen,
          layout: ExampleLayout,
          navigator: 'stack',
          tabOptions: { title: 'Feed' },
          children: {
            $itemId: { component: DetailScreen },
          },
        },
        profile: {
          component: ProfileScreen,
          layout: ExampleLayout,
          tabOptions: { title: 'Profile' },
        },
        settings: {
          component: SettingsScreen,
          layout: ExampleLayout,
          tabOptions: { title: 'Settings' },
        },
      },
    },
  },
});

const stackWithTabsRouter = createRouter({
  routes: {
    home: {
      component: StackTabsHomeScreen,
      layout: ExampleLayout,
      navigator: 'stack',
      children: {
        detail: {
          navigator: 'tabs',
          children: {
            overview: {
              component: OverviewTab,
              tabOptions: { title: 'Overview' },
            },
            reviews: {
              component: ReviewsTab,
              tabOptions: { title: 'Reviews' },
            },
            related: {
              component: RelatedTab,
              tabOptions: { title: 'Related' },
            },
          },
        },
      },
    },
  },
});

const recursiveStackRouter = createRouter({
  routes: {
    home: {
      component: RecursiveScreen,
      layout: ExampleLayout,
      navigator: 'stack',
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
    key: 'stack-with-tabs',
    title: 'Stack + Tabs',
    description: 'Stack that pushes a tabbed screen',
    router: stackWithTabsRouter,
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
