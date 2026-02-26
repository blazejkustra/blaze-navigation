import React from 'react';
import { ScreenContext } from './NavigationContext';
import type { Route, ScreenContextValue } from './types';

interface ScreenProviderProps {
  route: Route;
  meta?: Record<string, unknown>;
  isFocused?: boolean;
  children: React.ReactNode;
}

export function ScreenProvider({
  route,
  meta,
  isFocused = true,
  children,
}: ScreenProviderProps) {
  const value: ScreenContextValue = React.useMemo(
    () => ({
      route,
      params: route.params ?? {},
      query: route.query ?? {},
      meta,
      isFocused,
    }),
    [route, meta, isFocused]
  );

  return (
    <ScreenContext.Provider value={value}>{children}</ScreenContext.Provider>
  );
}
