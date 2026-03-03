import React, { useReducer, useEffect, useMemo, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { RouterContext } from './NavigationContext';
import { NavigatorRenderer } from './NavigatorRenderer';
import { registerDispatch, unregisterDispatch } from './navigation';
import { matchPath } from './matchPath';
import {
  createInitialState,
  navigateToMatch,
  goBackReducer,
  canGoBack,
  switchTab,
  resetKeyCounter,
  getActivePath,
} from './stateOps';
import type {
  RouterInstance,
  NavigatorState,
  Action,
  RouteConfig,
  TabBarRenderProps,
} from './types';

/**
 * Recursively searches the state tree to find and switch to a tab by key.
 * Traverses nested navigators (tabs and stacks) depth-first.
 *
 * @param state - The current navigator state node to search.
 * @param tabKey - The key of the tab to switch to.
 * @returns A new state with the matching tab activated, or the same state if not found.
 */
function switchTabDeep(state: NavigatorState, tabKey: string): NavigatorState {
  if (state.type === 'tabs' && state.tabs[tabKey]) {
    return switchTab(state, tabKey);
  }

  // Search deeper — check nested states
  if (state.type === 'tabs') {
    const activeTab = state.tabs[state.activeKey];
    if (activeTab?.nestedState) {
      const updated = switchTabDeep(activeTab.nestedState, tabKey);
      if (updated !== activeTab.nestedState) {
        return {
          ...state,
          tabs: {
            ...state.tabs,
            [state.activeKey]: { ...activeTab, nestedState: updated },
          },
        };
      }
    }
  }

  if (state.type === 'stack') {
    const topEntry = state.entries[state.entries.length - 1];
    if (topEntry?.nestedState) {
      const updated = switchTabDeep(topEntry.nestedState, tabKey);
      if (updated !== topEntry.nestedState) {
        return {
          ...state,
          entries: [
            ...state.entries.slice(0, -1),
            { ...topEntry, nestedState: updated },
          ],
        };
      }
    }
  }

  return state;
}

/**
 * Main navigation reducer handling NAVIGATE, REPLACE, GO_BACK, DISMISS, and SWITCH_TAB actions.
 * Delegates to the appropriate state operation for each action type.
 *
 * @param state - The current navigator state tree.
 * @param action - The dispatched action, optionally augmented with the router instance.
 * @returns The updated navigator state.
 */
function navigationReducer(
  state: NavigatorState,
  action: Action & { router?: RouterInstance }
): NavigatorState {
  let result: NavigatorState;
  switch (action.type) {
    case 'NAVIGATE': {
      const router = action.router;
      if (!router) {
        console.warn('[blaze-navigation] NAVIGATE action missing router');
        return state;
      }

      const match = matchPath(action.path, router.patterns);
      if (!match) {
        console.warn(
          '[blaze-navigation] NAVIGATE no match for path:',
          action.path
        );
        return state;
      }

      result = navigateToMatch(state, match);

      break;
    }
    case 'REPLACE': {
      const router = action.router;
      if (!router) {
        console.warn('[blaze-navigation] REPLACE action missing router');
        return state;
      }

      const match = matchPath(action.path, router.patterns);
      if (!match) {
        console.warn(
          '[blaze-navigation] REPLACE no match for path:',
          action.path
        );
        return state;
      }

      const backed = goBackReducer(state);
      result = navigateToMatch(backed, match);
      break;
    }
    case 'GO_BACK':
      result = goBackReducer(state);
      break;
    case 'DISMISS': {
      result = dismissEntry(state, action.key);
      break;
    }
    case 'SWITCH_TAB': {
      result = switchTabDeep(state, action.tabKey);
      break;
    }
    default:
      result = state;
  }

  return result;
}

/**
 * Removes a stack entry by key from anywhere in the state tree.
 * Searches recursively through nested navigators if the key is not found at the current level.
 *
 * @param state - The current navigator state node to search.
 * @param key - The unique key of the stack entry to dismiss.
 * @returns A new state with the entry removed, or the same state if not found.
 */
function dismissEntry(state: NavigatorState, key: string): NavigatorState {
  if (state.type === 'stack') {
    const filtered = state.entries.filter((e) => e.key !== key);
    if (filtered.length === state.entries.length) {
      // Key not found at this level, check nested
      return {
        ...state,
        entries: state.entries.map((e) => {
          if (e.nestedState) {
            return { ...e, nestedState: dismissEntry(e.nestedState, key) };
          }
          return e;
        }),
      };
    }

    if (filtered.length === 0) {
      return state;
    }

    return { ...state, entries: filtered };
  }

  if (state.type === 'tabs') {
    return {
      ...state,
      tabs: Object.fromEntries(
        Object.entries(state.tabs).map(([k, tab]) => {
          if (tab.nestedState) {
            return [
              k,
              { ...tab, nestedState: dismissEntry(tab.nestedState, key) },
            ];
          }
          return [k, tab];
        })
      ),
    };
  }

  return state;
}

interface NavigationProviderProps {
  router: RouterInstance;
  children?: React.ReactNode;
}

/**
 * Root provider component that manages navigation state via `useReducer`,
 * renders the navigator tree, handles Android back button, and provides
 * router context to the app.
 *
 * @param props.router - The router instance created by `createRouter`.
 * @param props.children - Optional children rendered alongside the navigator tree.
 */
export function NavigationProvider({
  router,
  children,
}: NavigationProviderProps) {
  const initialState = useMemo(() => {
    resetKeyCounter();
    return createInitialState(router);
  }, [router]);

  const [state, rawDispatch] = useReducer(
    (s: NavigatorState, a: Action) => navigationReducer(s, { ...a, router }),
    initialState
  );

  const dispatch = useCallback((action: Action) => {
    rawDispatch(action);
  }, []);

  useEffect(() => {
    registerDispatch(dispatch);
    return () => unregisterDispatch();
  }, [dispatch]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack(state)) {
        dispatch({ type: 'GO_BACK' });
        return true; // handled
      }
      return false; // let default behavior (exit app)
    });
    return () => sub.remove();
  }, [state, dispatch]);

  const components = useMemo(() => {
    const result: Record<string, React.ComponentType<any>> = {};

    for (const pattern of router.patterns) {
      if (pattern.routeConfig.component) {
        result[pattern.routeName] = pattern.routeConfig.component;
      }
    }

    return result;
  }, [router]);

  const customTabBars = useMemo(() => {
    const result: Record<
      string,
      (props: TabBarRenderProps) => React.ReactNode
    > = {};

    function collectRenderers(routes: Record<string, RouteConfig>) {
      for (const [name, config] of Object.entries(routes)) {
        if (config.customTabBar) {
          result[name] = config.customTabBar;
        }
        if (config.children) {
          collectRenderers(config.children);
        }
      }
    }

    if (router.config.customTabBar) {
      result['/'] = router.config.customTabBar;
    }
    if (router.config.children) {
      collectRenderers(router.config.children);
    }
    return result;
  }, [router]);

  const layouts = useMemo(() => {
    const result: Record<
      string,
      React.ComponentType<{ children: React.ReactNode }>
    > = {};

    function collectLayouts(routes: Record<string, RouteConfig>) {
      for (const [name, config] of Object.entries(routes)) {
        if (config.layout) {
          result[name] = config.layout;
        }
        if (config.children) {
          collectLayouts(config.children);
        }
      }
    }

    // Include layout from root config itself
    if (router.config.layout) {
      result['/'] = router.config.layout;
    }
    if (router.config.children) {
      collectLayouts(router.config.children);
    }
    return result;
  }, [router]);

  const navigateFn = useCallback(
    (path: string) => dispatch({ type: 'NAVIGATE', path }),
    [dispatch]
  );

  const goBackFn = useCallback(() => dispatch({ type: 'GO_BACK' }), [dispatch]);

  const replaceFn = useCallback(
    (path: string) => dispatch({ type: 'REPLACE', path }),
    [dispatch]
  );

  const path = useMemo(() => getActivePath(state), [state]);

  const contextValue = useMemo(
    () => ({
      router,
      state,
      path,
      navigate: navigateFn,
      goBack: goBackFn,
      replace: replaceFn,
    }),
    [router, state, path, navigateFn, goBackFn, replaceFn]
  );

  return (
    <RouterContext.Provider value={contextValue}>
      <NavigatorRenderer
        state={state}
        router={router}
        components={components}
        layouts={layouts}
        customTabBars={customTabBars}
        navigatorName="/"
        dispatch={dispatch}
      />
      {children}
    </RouterContext.Provider>
  );
}
