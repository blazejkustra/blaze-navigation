import { createContext } from 'react';
import type { RouterContextValue, ScreenContextValue } from './types';

/** React context providing the router instance, navigation state, and navigation functions to the component tree. */
export const RouterContext = createContext<RouterContextValue | null>(null);

/** React context providing the current screen's route info, params, query, meta, and focus state. */
export const ScreenContext = createContext<ScreenContextValue | null>(null);
