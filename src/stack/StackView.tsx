import React from 'react';
import { Stack } from 'react-native-screens/experimental';
import { ScreenProvider } from '../ScreenProvider';
import type { StackState, StackEntry } from '../types';

interface StackViewProps {
  state: StackState;
  components: Record<string, React.ComponentType<any>>;
  onDismiss: (key: string) => void;
  renderContent?: (entry: StackEntry) => React.ReactNode;
}

/**
 * Renders a native stack navigator using `react-native-screens` experimental Stack API.
 * Maps stack entries to `Stack.Screen` components with proper dismiss handling
 * and nested content support.
 */
export function StackView({
  state,
  components,
  onDismiss,
  renderContent,
}: StackViewProps) {
  return (
    <Stack.Host>
      {state.entries.map((entry, index) => {
        const isTop = index === state.entries.length - 1;
        const Component = components[entry.routeName];

        let content: React.ReactNode;
        if (renderContent && entry.nestedState) {
          content = renderContent(entry);
        } else if (Component) {
          content = <Component />;
        } else {
          console.warn(
            `[blaze-navigation] No component found for routeName: ${entry.routeName}`
          );
          content = null;
        }

        const isRoot = index === 0;

        return (
          <Stack.Screen
            key={entry.key}
            screenKey={entry.key}
            activityMode="attached"
            preventNativeDismiss={isRoot}
            onDismiss={
              isRoot ? undefined : (screenKey: string) => onDismiss(screenKey)
            }
            onNativeDismiss={
              isRoot ? undefined : (screenKey: string) => onDismiss(screenKey)
            }
          >
            <ScreenProvider
              route={{
                key: entry.key,
                path: entry.path,
                name: entry.routeName,
                params: entry.params,
              }}
              isFocused={isTop}
            >
              {content}
            </ScreenProvider>
          </Stack.Screen>
        );
      })}
    </Stack.Host>
  );
}
