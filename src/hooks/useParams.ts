import { useContext } from 'react';
import { ScreenContext } from '../NavigationContext';

export function useParams<
  T extends Record<string, string> = Record<string, string>
>(): T {
  const ctx = useContext(ScreenContext);

  if (!ctx) {
    throw new Error('useParams must be used within a screen component');
  }

  return ctx.params as T;
}
