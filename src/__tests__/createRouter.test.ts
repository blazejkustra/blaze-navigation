import { createRouter } from '../createRouter';

describe('createRouter', () => {
  it('returns router with original config', () => {
    const config = {
      routes: {
        home: { component: () => null },
      },
    };
    const router = createRouter(config);
    expect(router.config).toBe(config);
  });

  it('flattens flat routes into patterns', () => {
    const router = createRouter({
      routes: {
        home: { component: () => null },
        about: { component: () => null },
      },
    });
    expect(router.patterns).toHaveLength(2);
    expect(router.patterns.map((p) => p.path)).toEqual(['/home', '/about']);
  });

  it('flattens nested children', () => {
    const router = createRouter({
      routes: {
        home: {
          navigator: 'tabs',
          children: {
            feed: { component: () => null },
            settings: { component: () => null },
          },
        },
      },
    });
    const paths = router.patterns.map((p) => p.path);
    expect(paths).toContain('/home/feed');
    expect(paths).toContain('/home/settings');
  });

  it('extracts paramNames from $ segments', () => {
    const router = createRouter({
      routes: {
        home: {
          navigator: 'stack',
          children: {
            feed: {
              navigator: 'stack',
              children: {
                $itemId: { component: () => null },
              },
            },
          },
        },
      },
    });
    const pattern = router.patterns.find((p) => p.path.includes('$itemId'));
    expect(pattern).toBeDefined();
    expect(pattern!.paramNames).toEqual(['itemId']);
  });

  it('builds navigatorPath array for nested routes', () => {
    const router = createRouter({
      routes: {
        home: {
          navigator: 'tabs',
          children: {
            feed: {
              navigator: 'stack',
              children: {
                $itemId: { component: () => null },
              },
            },
            settings: { component: () => null },
          },
        },
      },
    });
    const pattern = router.patterns.find((p) => p.path.includes('$itemId'));
    expect(pattern).toBeDefined();
    expect(pattern!.navigatorPath).toEqual([
      { name: 'home', type: 'tabs', childName: 'feed' },
      { name: 'feed', type: 'stack', childName: '$itemId' },
    ]);
  });

  it('handles root-level stack navigator', () => {
    const router = createRouter({
      routes: {
        app: {
          navigator: 'stack',
          children: {
            login: { component: () => null },
            main: { component: () => null },
          },
        },
      },
    });
    const loginPattern = router.patterns.find((p) => p.path === '/app/login');
    expect(loginPattern).toBeDefined();
    expect(loginPattern!.navigatorPath).toEqual([
      { name: 'app', type: 'stack', childName: 'login' },
    ]);
  });

  it('sets routeName on each pattern', () => {
    const router = createRouter({
      routes: {
        home: {
          navigator: 'tabs',
          children: {
            feed: { component: () => null },
          },
        },
      },
    });
    const pattern = router.patterns.find((p) => p.path === '/home/feed');
    expect(pattern!.routeName).toBe('feed');
  });

  it('creates pattern for route with both component and navigator/children', () => {
    const FeedScreen = () => null;
    const DetailScreen = () => null;
    const router = createRouter({
      routes: {
        home: {
          navigator: 'tabs',
          children: {
            feed: {
              component: FeedScreen,
              navigator: 'stack',
              children: {
                $itemId: { component: DetailScreen },
              },
            },
          },
        },
      },
    });
    const paths = router.patterns.map((p) => p.path);
    // Should have both /home/feed (index) AND /home/feed/$itemId (child)
    expect(paths).toContain('/home/feed');
    expect(paths).toContain('/home/feed/$itemId');
    // The /home/feed pattern should reference FeedScreen
    const feedPattern = router.patterns.find((p) => p.path === '/home/feed');
    expect(feedPattern!.routeConfig.component).toBe(FeedScreen);
    expect(feedPattern!.routeName).toBe('feed');
    // navigatorPath for the index route: just the tabs segment
    expect(feedPattern!.navigatorPath).toEqual([
      { name: 'home', type: 'tabs', childName: 'feed' },
    ]);
  });

  it('extracts multiple params from nested dynamic segments', () => {
    const router = createRouter({
      routes: {
        users: {
          navigator: 'stack',
          children: {
            $userId: {
              navigator: 'stack',
              children: {
                posts: {
                  navigator: 'stack',
                  children: {
                    $postId: { component: () => null },
                  },
                },
              },
            },
          },
        },
      },
    });
    const pattern = router.patterns.find((p) => p.path.includes('$postId'));
    expect(pattern).toBeDefined();
    expect(pattern!.paramNames).toEqual(['userId', 'postId']);
  });
});
