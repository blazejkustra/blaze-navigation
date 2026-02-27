import { createContext } from 'react';
import type { RouterContextValue, ScreenContextValue } from './types';

export const RouterContext = createContext<RouterContextValue | null>(null);
export const ScreenContext = createContext<ScreenContextValue | null>(null);
