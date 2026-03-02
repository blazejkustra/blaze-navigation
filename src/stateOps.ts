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

/**
 * Resets the internal key counter used for generating unique screen keys.
 * Called during provider initialization and in tests.
 */
export function resetKeyCounter() {
  keyCounter = 0;
}

/**
 * Generates a unique key for a screen entry by combining the route name with an incrementing counter.
 *
 * @param name - The route name to use as a prefix.
 * @returns A unique key string (e.g. "home-0", "profile-1").
 */
function nextKey(name: string): string {
  return `${name}-${keyCounter++}`;
}

/**
 * Builds the initial navigator state tree from the router config.
 * Creates nested StackState/TabState structures matching the route hierarchy.
 *
 * @param router - The router instance created by `createRouter`.
 * @returns The root navigator state tree.
 */
export function createInitialState(router: RouterInstance): NavigatorState {
  // Find the root navigator from config
  const rootEntries = Object.entries(router.config.routes);
  if (rootEntries.length === 0) {
    throw new Error('Router config must have at least one route');
  }

  const [rootName, rootConfig] = rootEntries[0]!;
  return createNavigatorState(rootName, rootConfig);
}

/**
 * Recursively builds a navigator state node (StackState or TabState) from a route config.
 * For tab navigators, creates tab entries with lazy rendering. For stack navigators,
 * initializes with either the navigator's own component or the first child as the root entry.
 *
 * @param name - The route name for this navigator.
 * @param config - The route config containing children, navigator type, and component.
 * @returns The constructed navigator state tree for this node.
 */
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

/**
 * Immutably appends a new entry to a stack's entries array.
 *
 * @param state - The current stack state.
 * @param entry - The new stack entry to push.
 * @returns A new stack state with the entry appended.
 */
export function pushStack(state: StackState, entry: StackEntry): StackState {
  return {
    ...state,
    entries: [...state.entries, entry],
  };
}

/**
 * Immutably removes the top entry from a stack.
 * No-op if only one entry remains (prevents popping the root screen).
 *
 * @param state - The current stack state.
 * @returns A new stack state with the top entry removed, or the same state if at root.
 */
export function popStack(state: StackState): StackState {
  if (state.entries.length <= 1) {
    return state;
  }

  return {
    ...state,
    entries: state.entries.slice(0, -1),
  };
}

/**
 * Switches the active tab and marks it as rendered for lazy mounting.
 *
 * @param state - The current tab state.
 * @param key - The key of the tab to switch to.
 * @returns A new tab state with the active tab updated.
 */
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

/**
 * Core navigation reducer. Walks the matched pattern's navigator path top-down,
 * switching tabs and pushing stack entries as needed to reach the target route.
 *
 * @param state - The current navigator state tree.
 * @param match - The matched route pattern with extracted params.
 * @returns A new navigator state reflecting the navigation.
 */
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

/**
 * Recursively applies a navigator path segment at the given depth, switching tabs
 * or pushing stack entries to traverse the state tree toward the target route.
 *
 * @param state - The current navigator state at this depth.
 * @param match - The matched route pattern with extracted params.
 * @param depth - The current index into the navigator path segments.
 * @returns A new navigator state with the segment applied.
 */
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

/**
 * Returns whether there is a poppable stack anywhere in the state tree.
 * Used by Android BackHandler to decide whether to handle or let the app exit.
 *
 * @param state - The current navigator state tree.
 * @returns `true` if going back would pop a stack entry.
 */
export function canGoBack(state: NavigatorState): boolean {
  return goBackDeep(state) !== null;
}

/**
 * Pops the deepest nested stack that has more than one entry.
 * Traverses the state tree depth-first to find the innermost poppable stack.
 *
 * @param state - The current navigator state tree.
 * @returns A new navigator state with the deepest stack popped, or the same state if nothing to pop.
 */
export function goBackReducer(state: NavigatorState): NavigatorState {
  return goBackDeep(state) ?? state;
}

/**
 * Depth-first traversal to find and pop the innermost stack with more than one entry.
 * Returns null if no stack can be popped.
 *
 * @param state - The current navigator state node to search.
 * @returns A new state with the deepest stack popped, or null if nothing to pop.
 */
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
