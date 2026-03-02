import type {
  NavigatorState,
  StackState,
  StackEntry,
  TabState,
  RouterInstance,
  RouteConfig,
} from './types';
import type { PathMatch } from './matchPath';

let keyCounter = 0;

export function resetKeyCounter() {
  keyCounter = 0;
}

function nextKey(name: string): string {
  return `${name}-${keyCounter++}`;
}

export function createInitialState(router: RouterInstance): NavigatorState {
  // Find the root navigator from config
  const rootEntries = Object.entries(router.config.routes);
  if (rootEntries.length === 0) {
    throw new Error('Router config must have at least one route');
  }

  const [rootName, rootConfig] = rootEntries[0]!;
  return createNavigatorState(rootName, rootConfig);
}

function createNavigatorState(
  name: string,
  config: RouteConfig
): NavigatorState {
  if (!config.children || !config.navigator) {
    // Leaf — shouldn't be called as a navigator, but handle gracefully
    throw new Error(`Route "${name}" has no navigator or children`);
  }

  const childEntries = Object.entries(config.children);

  if (config.navigator === 'tabs') {
    const tabs: TabState['tabs'] = {};
    let firstKey: string | undefined;

    for (const [childName, childConfig] of childEntries) {
      if (!firstKey) firstKey = childName;
      const nestedState =
        childConfig.children && childConfig.navigator
          ? createNavigatorState(childName, childConfig)
          : undefined;

      tabs[childName] = {
        key: childName,
        path: `/${name}/${childName}`,
        params: {},
        rendered: childName === firstKey,
        nestedState,
        tabOptions: childConfig.tabOptions,
      };
    }

    return {
      type: 'tabs',
      activeKey: firstKey!,
      tabs,
    };
  }

  // Stack navigator:
  // If the navigator itself has a component, use it as the initial (index) entry
  if (config.component) {
    return {
      type: 'stack',
      entries: [
        {
          key: nextKey(name),
          routeName: name,
          path: `/${name}`,
          params: {},
        },
      ],
    };
  }

  // Otherwise start with first child
  const [firstName, firstConfig] = childEntries[0]!;
  const nestedState =
    firstConfig.children && firstConfig.navigator
      ? createNavigatorState(firstName, firstConfig)
      : undefined;

  return {
    type: 'stack',
    entries: [
      {
        key: nextKey(firstName),
        routeName: firstName,
        path: `/${name}/${firstName}`,
        params: {},
        nestedState,
      },
    ],
  };
}

export function pushStack(state: StackState, entry: StackEntry): StackState {
  return {
    ...state,
    entries: [...state.entries, entry],
  };
}

export function popStack(state: StackState): StackState {
  if (state.entries.length <= 1) {
    return state;
  }

  return {
    ...state,
    entries: state.entries.slice(0, -1),
  };
}

export function switchTab(state: TabState, key: string): TabState {
  return {
    ...state,
    activeKey: key,
    tabs: {
      ...state.tabs,
      [key]: {
        ...state.tabs[key]!,
        rendered: true,
      },
    },
  };
}

export function navigateToMatch(
  state: NavigatorState,
  match: PathMatch
): NavigatorState {
  const { navigatorPath } = match.pattern;

  if (navigatorPath.length === 0) {
    return state;
  }

  return applyNavigatorPath(state, match, 0);
}

function applyNavigatorPath(
  state: NavigatorState,
  match: PathMatch,
  depth: number
): NavigatorState {
  const segment = match.pattern.navigatorPath[depth];
  if (!segment) return state;

  const isLast = depth === match.pattern.navigatorPath.length - 1;

  if (segment.type === 'tabs' && state.type === 'tabs') {
    if (isLast) {
      // Final destination is a tab — just switch to it
      return switchTab(state, segment.childName);
    }
    // Need to go deeper into tab's nested state
    const tab = state.tabs[segment.childName]!;
    const nestedState = tab.nestedState;
    if (!nestedState) return switchTab(state, segment.childName);

    const updatedNested = applyNavigatorPath(nestedState, match, depth + 1);
    return {
      ...switchTab(state, segment.childName),
      tabs: {
        ...switchTab(state, segment.childName).tabs,
        [segment.childName]: {
          ...switchTab(state, segment.childName).tabs[segment.childName]!,
          nestedState: updatedNested,
        },
      },
    };
  }

  if (segment.type === 'stack' && state.type === 'stack') {
    if (isLast) {
      // Push new entry onto stack
      const entry: StackEntry = {
        key: nextKey(segment.childName),
        routeName: segment.childName,
        path: match.pattern.path.replace(
          /\$([a-zA-Z_]+)/g,
          (_, paramName) => match.params[paramName] ?? ''
        ),
        params: match.params,
      };
      return pushStack(state, entry);
    }
    // Need to go deeper — this shouldn't typically happen for stacks
    // but handle nested navigators inside stack entries
    return state;
  }

  return state;
}

export function canGoBack(state: NavigatorState): boolean {
  return goBackDeep(state) !== null;
}

export function goBackReducer(state: NavigatorState): NavigatorState {
  return goBackDeep(state) ?? state;
}

function goBackDeep(state: NavigatorState): NavigatorState | null {
  if (state.type === 'stack') {
    // Try to pop nested state first (deepest first)
    const topEntry = state.entries[state.entries.length - 1];
    if (topEntry?.nestedState) {
      const nestedResult = goBackDeep(topEntry.nestedState);
      if (nestedResult) {
        return {
          ...state,
          entries: [
            ...state.entries.slice(0, -1),
            { ...topEntry, nestedState: nestedResult },
          ],
        };
      }
    }

    // Pop this stack if possible
    if (state.entries.length > 1) {
      return popStack(state);
    }

    return null;
  }

  if (state.type === 'tabs') {
    // Try to go back in the active tab's nested state
    const activeTab = state.tabs[state.activeKey];
    if (activeTab?.nestedState) {
      const nestedResult = goBackDeep(activeTab.nestedState);
      if (nestedResult) {
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [state.activeKey]: {
              ...activeTab,
              nestedState: nestedResult,
            },
          },
        };
      }
    }
    return null;
  }

  return null;
}
