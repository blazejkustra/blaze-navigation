import React from 'react';
import { Tabs } from 'react-native-screens';
import { ScreenProvider } from '../ScreenProvider';
import type { TabState, TabEntry } from '../types';

interface TabViewProps {
  state: TabState;
  components: Record<string, React.ComponentType<any>>;
  onTabFocus: (tabKey: string) => void;
  renderContent?: (tab: TabEntry) => React.ReactNode;
}

export function TabView({
  state,
  components,
  onTabFocus,
  renderContent,
}: TabViewProps) {
  return (
    <Tabs.Host
      experimentalControlNavigationStateInJS
      onNativeFocusChange={(e) => {
        onTabFocus(e.nativeEvent.tabKey);
      }}
    >
      {Object.entries(state.tabs).map(([key, tab]) => {
        const isFocused = key === state.activeKey;
        const Component = components[key];

        let content: React.ReactNode = null;
        if (tab.rendered) {
          if (renderContent && tab.nestedState) {
            content = renderContent(tab);
          } else if (Component) {
            content = <Component />;
          }
        }

        return (
          <Tabs.Screen
            key={key}
            tabKey={key}
            isFocused={isFocused}
          >
            <ScreenProvider
              route={{
                key: tab.key,
                path: tab.path,
                name: key,
                params: tab.params,
              }}
              isFocused={isFocused}
            >
              {content}
            </ScreenProvider>
          </Tabs.Screen>
        );
      })}
    </Tabs.Host>
  );
}
