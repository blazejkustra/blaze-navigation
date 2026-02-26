import { useEffect, useContext } from 'react';
import { ScreenContext } from '../NavigationContext';
import type { NavigationEventType, NavigationListener } from '../types';

// Simple event emitter for navigation events
type Listener = NavigationListener;
const listeners = new Set<Listener>();

export function emitNavigationEvent(type: NavigationEventType, route?: any) {
  for (const listener of listeners) {
    listener({ type, route });
  }
}

export function useNavigationListener(
  type: NavigationEventType,
  callback: () => void
) {
  const ctx = useContext(ScreenContext);

  useEffect(() => {
    const listener: Listener = (event) => {
      if (event.type === type) {
        // For focus/blur, only fire if it's about this screen's route
        if ((type === 'focus' || type === 'blur') && event.route && ctx) {
          if (event.route.key === ctx.route.key) {
            callback();
          }
        } else {
          callback();
        }
      }
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [type, callback, ctx]);
}
