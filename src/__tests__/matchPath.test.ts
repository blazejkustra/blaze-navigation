import { createRouter } from '../createRouter';
import { matchPath } from '../matchPath';

const router = createRouter({
  routes: {
    home: {
      navigator: 'tabs',
      children: {
        feed: { component: () => null },
        profile: { component: () => null },
        $userId: { component: () => null },
      },
    },
    about: { component: () => null },
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

describe('matchPath', () => {
  it('matches static paths exactly', () => {
    const match = matchPath('/home/feed', router.patterns);
    expect(match).not.toBeNull();
    expect(match!.pattern.path).toBe('/home/feed');
    expect(match!.params).toEqual({});
  });

  it('matches dynamic segments and extracts params', () => {
    const match = matchPath('/home/42', router.patterns);
    expect(match).not.toBeNull();
    expect(match!.params).toEqual({ userId: '42' });
  });

  it('returns null for unknown paths', () => {
    const match = matchPath('/nonexistent', router.patterns);
    expect(match).toBeNull();
  });

  it('prefers static over dynamic when both could match', () => {
    const match = matchPath('/home/feed', router.patterns);
    expect(match!.pattern.path).toBe('/home/feed');
    expect(match!.params).toEqual({});
  });

  it('extracts multiple params from nested dynamic segments', () => {
    const match = matchPath('/users/123/posts/456', router.patterns);
    expect(match).not.toBeNull();
    expect(match!.params).toEqual({ userId: '123', postId: '456' });
  });

  it('does not match partial paths', () => {
    const match = matchPath('/home', router.patterns);
    expect(match).toBeNull();
  });

  it('handles trailing slashes', () => {
    const match = matchPath('/home/feed/', router.patterns);
    expect(match).not.toBeNull();
    expect(match!.pattern.path).toBe('/home/feed');
  });

  it('matches the about route', () => {
    const match = matchPath('/about', router.patterns);
    expect(match).not.toBeNull();
    expect(match!.pattern.path).toBe('/about');
  });
});
