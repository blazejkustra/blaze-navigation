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
  layouts: Record<string, React.ComponentType<{ children: React.ReactNode }>>;
  navigatorName?: string;
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
  layouts,
  navigatorName,
  dispatch,
}: NavigatorRendererProps) {
  const Layout = navigatorName ? layouts[navigatorName] : undefined;

  let content: React.ReactNode = null;

  if (state.type === 'stack') {
    content = (
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
                layouts={layouts}
                navigatorName={entry.routeName}
                dispatch={dispatch}
              />
            );
          }
          return null;
        }}
      />
    );
  } else if (state.type === 'tabs') {
    content = (
      <TabView
        state={state}
        components={components}
        onTabFocus={(tabKey) => dispatch({ type: 'SWITCH_TAB', tabKey })}
        renderContent={(tab: TabEntry, key: string) => {
          if (tab.nestedState) {
            return (
              <NavigatorRenderer
                state={tab.nestedState}
                router={router}
                components={components}
                layouts={layouts}
                navigatorName={key}
                dispatch={dispatch}
              />
            );
          }
          return null;
        }}
      />
    );
  }

  if (Layout && content) {
    return <Layout>{content}</Layout>;
  }

  return content;
}
