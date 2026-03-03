import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'react-native-screens';
import { ScreenProvider } from '../ScreenProvider';
import type { TabState, TabEntry, TabBarRenderProps } from '../types';

interface TabViewProps {
  state: TabState;
  components: Record<string, React.ComponentType<any>>;
  onTabFocus: (tabKey: string) => void;
  customTabBar?: (props: TabBarRenderProps) => React.ReactNode;
  renderContent?: (tab: TabEntry, key: string) => React.ReactNode;
}

/**
 * Renders a native tab navigator using `react-native-screens` Tabs API.
 * Handles lazy rendering, tab focus changes, and only mounts nested navigators
 * for the active tab to prevent native corruption.
 */
export function TabView({
  state,
  components,
  onTabFocus,
  customTabBar,
  renderContent,
}: TabViewProps) {
  const tabsHost = (
    <Tabs.Host
      experimentalControlNavigationStateInJS
      tabBarHidden={customTabBar != null}
      onNativeFocusChange={(e) => onTabFocus(e.nativeEvent.tabKey)}
    >
      {Object.entries(state.tabs).map(([key, tab]) => {
        const isFocused = key === state.activeKey;
        const Component = components[key];

        let content: React.ReactNode = null;
        if (tab.rendered) {
          if (renderContent && tab.nestedState && isFocused) {
            // Only mount nested navigators (Stack.Host) for the active tab.
            // The native Stack.Host gets corrupted when hidden inside an
            // unfocused Tabs.Screen. JS state preserves the stack entries,
            // so re-mounting when the tab regains focus is safe.
            content = renderContent(tab, key);
          } else if (Component) {
            content = <Component />;
          } else if (tab.nestedState && !isFocused) {
            // Unfocused tab with nested navigator — render nothing,
            // the tab content is hidden anyway.
            content = null;
          } else {
            console.warn(
              '[blaze-navigation] No component found for tabKey: ' + key
            );
          }
        }

        return (
          <Tabs.Screen
            key={key}
            tabKey={key}
            isFocused={isFocused}
            title={tab.tabOptions?.title}
            icon={tab.tabOptions?.icon}
            selectedIcon={tab.tabOptions?.selectedIcon}
            badgeValue={tab.tabOptions?.badgeValue}
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

  if (customTabBar) {
    return (
      <View style={styles.container}>
        {tabsHost}
        {customTabBar({ state, onTabPress: onTabFocus })}
      </View>
    );
  }

  return tabsHost;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
