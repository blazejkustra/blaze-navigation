import { createRouter } from '../createRouter';
import { matchPath } from '../matchPath';

const router = createRouter({
  navigator: 'tabs',
  children: {
    feed: { component: () => null },
    profile: { component: () => null },
    $userId: { component: () => null },
  },
});

// Separate router for nested dynamic segments
const nestedRouter = createRouter({
  navigator: 'stack',
  children: {
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
    const match = matchPath('/feed', router.patterns);
    expect(match).not.toBeNull();
    expect(match!.pattern.path).toBe('/feed');
    expect(match!.params).toEqual({});
  });

  it('matches dynamic segments and extracts params', () => {
    const match = matchPath('/42', router.patterns);
    expect(match).not.toBeNull();
    expect(match!.params).toEqual({ userId: '42' });
  });

  it('returns null for unknown paths', () => {
    const match = matchPath('/nonexistent/deep', router.patterns);
    expect(match).toBeNull();
  });

  it('prefers static over dynamic when both could match', () => {
    const match = matchPath('/feed', router.patterns);
    expect(match!.pattern.path).toBe('/feed');
    expect(match!.params).toEqual({});
  });

  it('extracts multiple params from nested dynamic segments', () => {
    const match = matchPath('/users/123/posts/456', nestedRouter.patterns);
    expect(match).not.toBeNull();
    expect(match!.params).toEqual({ userId: '123', postId: '456' });
  });

  it('handles trailing slashes', () => {
    const match = matchPath('/feed/', router.patterns);
    expect(match).not.toBeNull();
    expect(match!.pattern.path).toBe('/feed');
  });

  it('matches the profile route', () => {
    const match = matchPath('/profile', router.patterns);
    expect(match).not.toBeNull();
    expect(match!.pattern.path).toBe('/profile');
  });
});
