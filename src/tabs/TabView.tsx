import React from 'react';
import { Tabs } from 'react-native-screens';
import { ScreenProvider } from '../ScreenProvider';
import { isRouteAccessible } from '../createRouter';
import type { TabState, TabEntry, RouterInstance } from '../types';

interface TabViewProps {
  state: TabState;
  components: Record<string, React.ComponentType<any>>;
  onTabFocus: (tabKey: string) => void;
  renderContent?: (tab: TabEntry) => React.ReactNode;
  router?: RouterInstance;
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
  renderContent,
  router,
}: TabViewProps) {
  // Filter out tabs whose guard returns false
  const visibleTabs = Object.entries(state.tabs).filter(([key]) => {
    if (!router) return true;
    const pattern = router.patterns.find((p) => p.routeName === key);
    return !pattern || isRouteAccessible(pattern);
  });

  return (
    <Tabs.Host
      experimentalControlNavigationStateInJS
      onNativeFocusChange={(e) => onTabFocus(e.nativeEvent.tabKey)}
    >
      {visibleTabs.map(([key, tab]) => {
        const isFocused = key === state.activeKey;
        const Component = components[key];

        let content: React.ReactNode = null;
        if (tab.rendered) {
          if (renderContent && tab.nestedState && isFocused) {
            // Only mount nested navigators (Stack.Host) for the active tab.
            // The native Stack.Host gets corrupted when hidden inside an
            // unfocused Tabs.Screen. JS state preserves the stack entries,
            // so re-mounting when the tab regains focus is safe.
            content = renderContent(tab);
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
}
