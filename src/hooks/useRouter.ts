import { useContext } from 'react';
import { RouterContext } from '../NavigationContext';
import type { RouterContextValue } from '../types';

/**
 * Returns the current router context, including state, path, and navigation functions.
 * Must be used within a NavigationProvider.
 *
 * @returns The router context value.
 * @throws If used outside a NavigationProvider.
 *
 * @example
 * ```ts
 * const { path, navigate, goBack } = useRouter();
 * ```
 */
export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);

  if (!ctx) {
    throw new Error('useRouter must be used within a NavigationProvider');
  }

  return ctx;
}
