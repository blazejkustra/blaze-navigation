import React, { useReducer, useEffect, useMemo, useCallback } from 'react';
import { RouterContext } from './NavigationContext';
import { NavigatorRenderer } from './NavigatorRenderer';
import { registerDispatch, unregisterDispatch } from './navigation';
import { matchPath } from './matchPath';
import {
  createInitialState,
  navigateToMatch,
  goBackReducer,
  resetKeyCounter,
} from './stateOps';
import type {
  RouterInstance,
  NavigatorState,
  Action,
} from './types';

function navigationReducer(
  state: NavigatorState,
  action: Action & { router?: RouterInstance }
): NavigatorState {
  switch (action.type) {
    case 'NAVIGATE': {
      const router = action.router;
      if (!router) return state;
      const match = matchPath(action.path, router.patterns);
      if (!match) return state;
      return navigateToMatch(state, match);
    }
    case 'REPLACE': {
      const router = action.router;
      if (!router) return state;
      const match = matchPath(action.path, router.patterns);
      if (!match) return state;
      // For replace: go back first, then navigate
      const backed = goBackReducer(state);
      return navigateToMatch(backed, match);
    }
    case 'GO_BACK':
      return goBackReducer(state);
    case 'DISMISS': {
      // Remove the entry with the given key from deepest stack
      return dismissEntry(state, action.key);
    }
    default:
      return state;
  }
}

function dismissEntry(
  state: NavigatorState,
  key: string
): NavigatorState {
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
    if (filtered.length === 0) return state;
    return { ...state, entries: filtered };
  }

  if (state.type === 'tabs') {
    return {
      ...state,
      tabs: Object.fromEntries(
        Object.entries(state.tabs).map(([k, tab]) => {
          if (tab.nestedState) {
            return [k, { ...tab, nestedState: dismissEntry(tab.nestedState, key) }];
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

export function NavigationProvider({ router, children }: NavigationProviderProps) {
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

  const goBackFn = useCallback(
    () => dispatch({ type: 'GO_BACK' }),
    [dispatch]
  );

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
