import { createRouter, NavigationProvider } from 'blaze-navigation';
import { FeedScreen } from './screens/FeedScreen';
import { DetailScreen } from './screens/DetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const router = createRouter({
  routes: {
    home: {
      navigator: 'tabs',
      children: {
        feed: {
          component: FeedScreen,
          navigator: 'stack',
          tabOptions: {
            title: 'Feed',
          },
          children: {
            $itemId: {
              component: DetailScreen,
            },
          },
        },
        profile: {
          component: ProfileScreen,
          tabOptions: {
            title: 'Profile',
          },
        },
        settings: {
          component: SettingsScreen,
          tabOptions: {
            title: 'Settings',
          },
        },
      },
    },
  },
});

// Type augmentation for full type inference
declare module 'blaze-navigation' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <NavigationProvider router={router} />;
}
