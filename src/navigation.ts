import type { Action } from './types';

let _dispatch: ((action: Action) => void) | null = null;

export function registerDispatch(dispatch: (action: Action) => void) {
  _dispatch = dispatch;
}

export function unregisterDispatch() {
  _dispatch = null;
}

export function navigate(path: string) {
  if (!_dispatch) {
    throw new Error('navigate() called before NavigationProvider is mounted');
  }
  _dispatch({ type: 'NAVIGATE', path });
}

export function goBack() {
  if (!_dispatch) {
    throw new Error('goBack() called before NavigationProvider is mounted');
  }
  _dispatch({ type: 'GO_BACK' });
}

export function replace(path: string) {
  if (!_dispatch) {
    throw new Error('replace() called before NavigationProvider is mounted');
  }
  _dispatch({ type: 'REPLACE', path });
}
