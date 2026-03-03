import type { Action, ValidPaths } from './types';

let _dispatch: ((action: Action) => void) | null = null;

/**
 * Registers the global dispatch function. Called by NavigationProvider on mount
 * so that `navigate`/`goBack`/`replace` can work outside React components.
 *
 * @param dispatch - The dispatch function from the navigation reducer.
 */
export function registerDispatch(dispatch: (action: Action) => void) {
  _dispatch = dispatch;
}

/** Unregisters the global dispatch function. Called by NavigationProvider on unmount. */
export function unregisterDispatch() {
  _dispatch = null;
}

/**
 * Navigates to the given path by dispatching a NAVIGATE action.
 * Works anywhere — no React context required.
 *
 * @param path - The path to navigate to (e.g. "/profile/123").
 * @throws If called before NavigationProvider is mounted.
 *
 * @example
 * ```ts
 * navigate('/profile/123');
 * ```
 */
export function navigate(path: ValidPaths) {
  if (!_dispatch) {
    throw new Error('navigate() called before NavigationProvider is mounted');
  }
  _dispatch({ type: 'NAVIGATE', path });
}

/**
 * Goes back by popping the deepest nested stack.
 * Works anywhere — no React context required.
 *
 * @throws If called before NavigationProvider is mounted.
 *
 * @example
 * ```ts
 * goBack();
 * ```
 */
export function goBack() {
  if (!_dispatch) {
    throw new Error('goBack() called before NavigationProvider is mounted');
  }
  _dispatch({ type: 'GO_BACK' });
}

/**
 * Replaces the current screen with the given path (go back + navigate).
 * Works anywhere — no React context required.
 *
 * @param path - The path to replace with (e.g. "/settings").
 * @throws If called before NavigationProvider is mounted.
 *
 * @example
 * ```ts
 * replace('/settings');
 * ```
 */
export function replace(path: ValidPaths) {
  if (!_dispatch) {
    throw new Error('replace() called before NavigationProvider is mounted');
  }
  _dispatch({ type: 'REPLACE', path });
}
