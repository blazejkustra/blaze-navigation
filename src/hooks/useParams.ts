import { useContext } from 'react';
import { ScreenContext } from '../NavigationContext';

/**
 * Returns the current screen's route params, typed via the generic parameter.
 * Must be used within a ScreenProvider.
 *
 * @returns The route params object.
 * @throws If used outside a screen component.
 *
 * @example
 * ```ts
 * const { id } = useParams<{ id: string }>();
 * ```
 */
export function useParams<
  T extends Record<string, string> = Record<string, string>
>(): T {
  const ctx = useContext(ScreenContext);

  if (!ctx) {
    throw new Error('useParams must be used within a screen component');
  }

  return ctx.params as T;
}
