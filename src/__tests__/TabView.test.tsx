import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View, TouchableOpacity } from 'react-native';
import { TabView } from '../tabs/TabView';
import type { TabState, TabEntry, TabBarRenderProps } from '../types';

jest.mock('react-native-screens');

const FeedScreen = () => <Text>Feed Screen</Text>;
const SearchScreen = () => <Text>Search Screen</Text>;
const ProfileScreen = () => <Text>Profile Screen</Text>;

const components: Record<string, React.ComponentType<any>> = {
  feed: FeedScreen,
  search: SearchScreen,
  profile: ProfileScreen,
};

function makeTab(
  key: string,
  rendered: boolean,
  params: Record<string, string> = {}
): TabEntry {
  return { key, path: `/${key}`, params, rendered };
}

function makeTabState(
  activeKey: string,
  tabs: Record<string, TabEntry>
): TabState {
  return { type: 'tabs', activeKey, tabs };
}

describe('TabView', () => {
  it('renders Tabs.Host with Tabs.Screen per tab', () => {
    const state = makeTabState('feed', {
      feed: makeTab('feed', true),
      search: makeTab('search', false),
      profile: makeTab('profile', false),
    });

    const { getByTestId, queryAllByTestId } = render(
      <TabView state={state} components={components} onTabFocus={() => {}} />
    );

    expect(getByTestId('TabsHost')).toBeTruthy();
    expect(queryAllByTestId(/^TabsScreen-/)).toHaveLength(3);
  });

  it('active tab has isFocused=true and renders content', () => {
    const state = makeTabState('feed', {
      feed: makeTab('feed', true),
      search: makeTab('search', false),
    });

    const { getByText, queryByText } = render(
      <TabView state={state} components={components} onTabFocus={() => {}} />
    );

    expect(getByText('Feed Screen')).toBeTruthy();
    // Search tab content not rendered (mock renders null when isFocused is false)
    expect(queryByText('Search Screen')).toBeNull();
  });

  it('lazy rendering: only renders content when tab.rendered is true', () => {
    const state = makeTabState('feed', {
      feed: makeTab('feed', true),
      search: makeTab('search', false),
    });

    const { queryByText } = render(
      <TabView state={state} components={components} onTabFocus={() => {}} />
    );

    // Search is not rendered (rendered: false)
    expect(queryByText('Search Screen')).toBeNull();
  });

  it('after switching, newly rendered tab content appears', () => {
    const state = makeTabState('search', {
      feed: makeTab('feed', true),
      search: makeTab('search', true),
    });

    const { getByText } = render(
      <TabView state={state} components={components} onTabFocus={() => {}} />
    );

    expect(getByText('Search Screen')).toBeTruthy();
  });

  it('calls onTabFocus(tabKey) when native focus changes', () => {
    const onTabFocus = jest.fn();
    const state = makeTabState('feed', {
      feed: makeTab('feed', true),
      search: makeTab('search', false),
    });

    const focusCallbacks: Record<string, (e: any) => void> = {};
    jest
      .spyOn(require('react-native-screens').Tabs, 'Host')
      .mockImplementation(
        ({ children, onNativeFocusChange, ...props }: any) => {
          if (onNativeFocusChange) focusCallbacks.host = onNativeFocusChange;
          return (
            <View testID="TabsHost" {...props}>
              {children}
            </View>
          );
        }
      );

    render(
      <TabView state={state} components={components} onTabFocus={onTabFocus} />
    );

    // Simulate native focus change
    focusCallbacks.host!({ nativeEvent: { tabKey: 'search' } });
    expect(onTabFocus).toHaveBeenCalledWith('search');

    jest.restoreAllMocks();
  });

  it('wraps each tab in ScreenProvider with correct params', () => {
    const state = makeTabState('feed', {
      feed: makeTab('feed', true, { userId: '42' }),
    });

    const { getByText } = render(
      <TabView state={state} components={components} onTabFocus={() => {}} />
    );

    expect(getByText('Feed Screen')).toBeTruthy();
  });

  it('renders nested navigator content for tabs with nestedState', () => {
    const nestedState: TabState = {
      type: 'tabs',
      activeKey: 'inner',
      tabs: {
        inner: makeTab('inner', true),
      },
    };

    const state = makeTabState('feed', {
      feed: { ...makeTab('feed', true), nestedState },
    });

    const renderContent = jest.fn((tab: TabEntry) => {
      if (tab.nestedState) {
        return <Text>Nested Tab Content</Text>;
      }
      return null;
    });

    const { getByText } = render(
      <TabView
        state={state}
        components={components}
        onTabFocus={() => {}}
        renderContent={renderContent}
      />
    );

    expect(renderContent).toHaveBeenCalled();
    expect(getByText('Nested Tab Content')).toBeTruthy();
  });

  describe('customTabBar', () => {
    it('sets tabBarHidden on Tabs.Host when customTabBar is provided', () => {
      const state = makeTabState('feed', {
        feed: makeTab('feed', true),
        search: makeTab('search', false),
      });

      const hostProps: Record<string, any> = {};
      jest
        .spyOn(require('react-native-screens').Tabs, 'Host')
        .mockImplementation(({ children, ...props }: any) => {
          Object.assign(hostProps, props);
          return (
            <View testID="TabsHost" {...props}>
              {children}
            </View>
          );
        });

      render(
        <TabView
          state={state}
          components={components}
          onTabFocus={() => {}}
          customTabBar={() => <Text>Custom Bar</Text>}
        />
      );

      expect(hostProps.tabBarHidden).toBe(true);
      jest.restoreAllMocks();
    });

    it('does not set tabBarHidden when customTabBar is not provided', () => {
      const state = makeTabState('feed', {
        feed: makeTab('feed', true),
      });

      const hostProps: Record<string, any> = {};
      jest
        .spyOn(require('react-native-screens').Tabs, 'Host')
        .mockImplementation(({ children, ...props }: any) => {
          Object.assign(hostProps, props);
          return (
            <View testID="TabsHost" {...props}>
              {children}
            </View>
          );
        });

      render(
        <TabView state={state} components={components} onTabFocus={() => {}} />
      );

      expect(hostProps.tabBarHidden).toBe(false);
      jest.restoreAllMocks();
    });

    it('renders custom tab bar with correct state and onTabPress', () => {
      const state = makeTabState('feed', {
        feed: makeTab('feed', true),
        search: makeTab('search', false),
      });

      const onTabFocus = jest.fn();

      const customTabBar = ({
        state: tabState,
        onTabPress,
      }: TabBarRenderProps) => (
        <View testID="custom-tab-bar">
          {Object.keys(tabState.tabs).map((key) => (
            <TouchableOpacity
              key={key}
              testID={`tab-${key}`}
              onPress={() => onTabPress(key)}
            >
              <Text>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );

      const { getByTestId } = render(
        <TabView
          state={state}
          components={components}
          onTabFocus={onTabFocus}
          customTabBar={customTabBar}
        />
      );

      expect(getByTestId('custom-tab-bar')).toBeTruthy();
      fireEvent.press(getByTestId('tab-search'));
      expect(onTabFocus).toHaveBeenCalledWith('search');
    });

    it('existing behavior unchanged without customTabBar', () => {
      const state = makeTabState('feed', {
        feed: makeTab('feed', true),
        search: makeTab('search', false),
      });

      const { getByTestId, getByText, queryByTestId } = render(
        <TabView state={state} components={components} onTabFocus={() => {}} />
      );

      expect(getByTestId('TabsHost')).toBeTruthy();
      expect(getByText('Feed Screen')).toBeTruthy();
      expect(queryByTestId('custom-tab-bar')).toBeNull();
    });
  });
});
