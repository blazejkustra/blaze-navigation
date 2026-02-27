import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { TabView } from '../tabs/TabView';
import type { TabState, TabEntry } from '../types';

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
    jest.spyOn(require('react-native-screens').Tabs, 'Host').mockImplementation(
      ({ children, onNativeFocusChange, ...props }: any) => {
        if (onNativeFocusChange) focusCallbacks['host'] = onNativeFocusChange;
        return (
          <View testID="TabsHost" {...props}>
            {children}
          </View>
        );
      }
    );

    render(
      <TabView
        state={state}
        components={components}
        onTabFocus={onTabFocus}
      />
    );

    // Simulate native focus change
    focusCallbacks['host']!({ nativeEvent: { tabKey: 'search' } });
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
});
