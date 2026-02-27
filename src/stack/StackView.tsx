import React from 'react';
import { ScreenStack, ScreenStackItem } from 'react-native-screens';
import { ScreenProvider } from '../ScreenProvider';
import type { StackState, StackEntry } from '../types';

interface StackViewProps {
  state: StackState;
  components: Record<string, React.ComponentType<any>>;
  onDismiss: (key: string) => void;
  renderContent?: (entry: StackEntry) => React.ReactNode;
}

export function StackView({
  state,
  components,
  onDismiss,
  renderContent,
}: StackViewProps) {
  return (
    <ScreenStack style={{ flex: 1 }}>
      {state.entries.map((entry, index) => {
        const isTop = index === state.entries.length - 1;
        const Component = components[entry.routeName];

        let content: React.ReactNode;
        if (renderContent && entry.nestedState) {
          content = renderContent(entry);
        } else if (Component) {
          content = <Component />;
        } else {
          content = null;
        }

        return (
          <ScreenStackItem
            key={entry.key}
            screenId={entry.key}
            activityState={isTop ? 2 : 0}
            onDismissed={() => onDismiss(entry.key)}
            style={{ flex: 1 }}
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
          </ScreenStackItem>
        );
      })}
    </ScreenStack>
  );
}
