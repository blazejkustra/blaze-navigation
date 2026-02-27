import { createRouter } from '../createRouter';
import { matchPath } from '../matchPath';
import {
  createInitialState,
  pushStack,
  popStack,
  switchTab,
  navigateToMatch,
  goBackReducer,
  resetKeyCounter,
} from '../stateOps';
import type { StackState, TabState, StackEntry } from '../types';

beforeEach(() => {
  resetKeyCounter();
});

// Simple stack config
const stackRouter = createRouter({
  routes: {
    app: {
      navigator: 'stack',
      children: {
        home: { component: () => null },
        details: { component: () => null },
        $itemId: { component: () => null },
      },
    },
  },
});

// Simple tabs config
const tabRouter = createRouter({
  routes: {
    app: {
      navigator: 'tabs',
      children: {
        feed: { component: () => null },
        search: { component: () => null },
        profile: { component: () => null },
      },
    },
  },
});

// Nested config: tabs > stack
const nestedRouter = createRouter({
  routes: {
    app: {
      navigator: 'tabs',
      children: {
        feed: {
          navigator: 'stack',
          children: {
            list: { component: () => null },
            $itemId: { component: () => null },
          },
        },
        profile: { component: () => null },
      },
    },
  },
});

describe('createInitialState', () => {
  it('creates correct initial stack state', () => {
    const state = createInitialState(stackRouter);
    expect(state.type).toBe('stack');
    const s = state as StackState;
    expect(s.entries).toHaveLength(1);
    expect(s.entries[0]!.routeName).toBe('home');
    expect(s.entries[0]!.path).toBe('/app/home');
  });

  it('creates correct initial tab state', () => {
    const state = createInitialState(tabRouter);
    expect(state.type).toBe('tabs');
    const s = state as TabState;
    expect(s.activeKey).toBe('feed');
    expect(Object.keys(s.tabs)).toEqual(['feed', 'search', 'profile']);
    expect(s.tabs['feed']!.rendered).toBe(true);
    expect(s.tabs['search']!.rendered).toBe(false);
  });

  it('creates correct initial nested state (tabs > stack)', () => {
    const state = createInitialState(nestedRouter);
    expect(state.type).toBe('tabs');
    const s = state as TabState;
    expect(s.activeKey).toBe('feed');
    const feedTab = s.tabs['feed']!;
    expect(feedTab.nestedState).toBeDefined();
    expect(feedTab.nestedState!.type).toBe('stack');
    const nested = feedTab.nestedState as StackState;
    expect(nested.entries).toHaveLength(1);
    expect(nested.entries[0]!.routeName).toBe('list');
  });
});

describe('pushStack', () => {
  it('appends entry immutably', () => {
    const state: StackState = {
      type: 'stack',
      entries: [
        { key: 'home-0', routeName: 'home', path: '/app/home', params: {} },
      ],
    };
    const entry: StackEntry = {
      key: 'details-1',
      routeName: 'details',
      path: '/app/details',
      params: {},
    };
    const next = pushStack(state, entry);
    expect(next.entries).toHaveLength(2);
    expect(next.entries[1]).toBe(entry);
    // Immutability check
    expect(state.entries).toHaveLength(1);
  });

  it('allows pushing same routeName twice with different keys', () => {
    const state: StackState = {
      type: 'stack',
      entries: [
        { key: 'home-0', routeName: 'home', path: '/app/home', params: {} },
      ],
    };
    const entry1: StackEntry = {
      key: 'details-1',
      routeName: 'details',
      path: '/app/details',
      params: {},
    };
    const entry2: StackEntry = {
      key: 'details-2',
      routeName: 'details',
      path: '/app/details',
      params: {},
    };
    const next = pushStack(pushStack(state, entry1), entry2);
    expect(next.entries).toHaveLength(3);
    expect(next.entries[1]!.key).toBe('details-1');
    expect(next.entries[2]!.key).toBe('details-2');
  });
});

describe('popStack', () => {
  it('removes top entry', () => {
    const state: StackState = {
      type: 'stack',
      entries: [
        { key: 'home-0', routeName: 'home', path: '/app/home', params: {} },
        {
          key: 'details-1',
          routeName: 'details',
          path: '/app/details',
          params: {},
        },
      ],
    };
    const next = popStack(state);
    expect(next.entries).toHaveLength(1);
    expect(next.entries[0]!.routeName).toBe('home');
  });

  it('does not pop below 1 entry', () => {
    const state: StackState = {
      type: 'stack',
      entries: [
        { key: 'home-0', routeName: 'home', path: '/app/home', params: {} },
      ],
    };
    const next = popStack(state);
    expect(next.entries).toHaveLength(1);
  });
});

describe('switchTab', () => {
  it('updates activeKey and marks tab as rendered', () => {
    const state: TabState = {
      type: 'tabs',
      activeKey: 'feed',
      tabs: {
        feed: { key: 'feed', path: '/app/feed', params: {}, rendered: true },
        search: {
          key: 'search',
          path: '/app/search',
          params: {},
          rendered: false,
        },
      },
    };
    const next = switchTab(state, 'search');
    expect(next.activeKey).toBe('search');
    expect(next.tabs['search']!.rendered).toBe(true);
    // Feed remains rendered
    expect(next.tabs['feed']!.rendered).toBe(true);
  });
});

describe('navigateToMatch', () => {
  it('pushes to stack for stack routes', () => {
    const state = createInitialState(stackRouter);
    const match = matchPath('/app/details', stackRouter.patterns)!;
    const next = navigateToMatch(state, match);
    const s = next as StackState;
    expect(s.entries).toHaveLength(2);
    expect(s.entries[1]!.routeName).toBe('details');
  });

  it('switches tab for tab routes', () => {
    const state = createInitialState(tabRouter);
    const match = matchPath('/app/search', tabRouter.patterns)!;
    const next = navigateToMatch(state, match);
    const s = next as TabState;
    expect(s.activeKey).toBe('search');
    expect(s.tabs['search']!.rendered).toBe(true);
  });

  it('handles nested: switch tab THEN push stack', () => {
    const state = createInitialState(nestedRouter);
    const match = matchPath('/app/feed/42', nestedRouter.patterns)!;
    const next = navigateToMatch(state, match);
    const s = next as TabState;
    expect(s.activeKey).toBe('feed');
    const feedNested = s.tabs['feed']!.nestedState as StackState;
    expect(feedNested.entries).toHaveLength(2);
    expect(feedNested.entries[1]!.routeName).toBe('$itemId');
    expect(feedNested.entries[1]!.params).toEqual({ itemId: '42' });
  });

  it('extracts params for dynamic segments', () => {
    const state = createInitialState(stackRouter);
    const match = matchPath('/app/99', stackRouter.patterns)!;
    const next = navigateToMatch(state, match);
    const s = next as StackState;
    expect(s.entries[1]!.params).toEqual({ itemId: '99' });
  });
});

describe('goBackReducer', () => {
  it('pops deepest stack', () => {
    const state = createInitialState(stackRouter);
    const match = matchPath('/app/details', stackRouter.patterns)!;
    const pushed = navigateToMatch(state, match);
    const popped = goBackReducer(pushed);
    const s = popped as StackState;
    expect(s.entries).toHaveLength(1);
  });

  it('does not go back if only one entry in stack', () => {
    const state = createInitialState(stackRouter);
    const result = goBackReducer(state);
    expect(result).toBe(state);
  });

  it('pops nested stack without switching tabs', () => {
    const state = createInitialState(nestedRouter);
    const match = matchPath('/app/feed/42', nestedRouter.patterns)!;
    const pushed = navigateToMatch(state, match);
    const popped = goBackReducer(pushed);
    const s = popped as TabState;
    expect(s.activeKey).toBe('feed');
    const feedNested = s.tabs['feed']!.nestedState as StackState;
    expect(feedNested.entries).toHaveLength(1);
    expect(feedNested.entries[0]!.routeName).toBe('list');
  });
});
