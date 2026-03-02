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
} from './stateOps';
import type { RouterInstance, NavigatorState, Action } from './types';

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

  const navigateFn = useCallback(
    (path: string) => dispatch({ type: 'NAVIGATE', path }),
    [dispatch]
  );

  const goBackFn = useCallback(() => dispatch({ type: 'GO_BACK' }), [dispatch]);

  const replaceFn = useCallback(
    (path: string) => dispatch({ type: 'REPLACE', path }),
    [dispatch]
  );

  const contextValue = useMemo(
    () => ({
      router,
      state,
      navigate: navigateFn,
      goBack: goBackFn,
      replace: replaceFn,
    }),
    [router, state, navigateFn, goBackFn, replaceFn]
  );

  return (
    <RouterContext.Provider value={contextValue}>
      <NavigatorRenderer
        state={state}
        router={router}
        components={components}
        dispatch={dispatch}
      />
      {children}
    </RouterContext.Provider>
  );
}
