import { useEffect, useContext } from 'react';
import { ScreenContext } from '../NavigationContext';
import type { NavigationEventType, NavigationListener } from '../types';

// Simple event emitter for navigation events
type Listener = NavigationListener;
const listeners = new Set<Listener>();

/**
 * Emits a navigation event (focus, blur, beforeNavigate, afterNavigate) to all registered listeners.
 *
 * @param type - The navigation event type to emit.
 * @param route - Optional route info associated with the event.
 */
export function emitNavigationEvent(type: NavigationEventType, route?: any) {
  for (const listener of listeners) {
    listener({ type, route });
  }
}

/**
 * Registers a navigation event listener that fires on the specified event type.
 * Cleans up automatically on unmount.
 *
 * @param type - The event type to listen for (e.g. "focus", "blur").
 * @param callback - The callback to invoke when the event fires.
 */
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
