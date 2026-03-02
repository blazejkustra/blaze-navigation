import React from 'react';
import { StackView } from './stack/StackView';
import { TabView } from './tabs/TabView';
import type {
  NavigatorState,
  RouterInstance,
  Action,
  StackEntry,
  TabEntry,
} from './types';

interface NavigatorRendererProps {
  state: NavigatorState;
  router: RouterInstance;
  components: Record<string, React.ComponentType<any>>;
  dispatch: (action: Action) => void;
}

/**
 * Recursive component that renders either a StackView or TabView based on the
 * current state node type, and recurses into nested navigators via `renderContent`.
 */
export function NavigatorRenderer({
  state,
  router,
  components,
  dispatch,
}: NavigatorRendererProps) {
  if (state.type === 'stack') {
    return (
      <StackView
        state={state}
        components={components}
        onDismiss={(key) => dispatch({ type: 'DISMISS', key })}
        renderContent={(entry: StackEntry) => {
          if (entry.nestedState) {
            return (
              <NavigatorRenderer
                state={entry.nestedState}
                router={router}
                components={components}
                dispatch={dispatch}
              />
            );
          }
          return null;
        }}
      />
    );
  }

  if (state.type === 'tabs') {
    return (
      <TabView
        state={state}
        components={components}
        router={router}
        onTabFocus={(tabKey) => dispatch({ type: 'SWITCH_TAB', tabKey })}
        renderContent={(tab: TabEntry) => {
          if (tab.nestedState) {
            return (
              <NavigatorRenderer
                state={tab.nestedState}
                router={router}
                components={components}
                dispatch={dispatch}
              />
            );
          }
          return null;
        }}
      />
    );
  }

  return null;
}
