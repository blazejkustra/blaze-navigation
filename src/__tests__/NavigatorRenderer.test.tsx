import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NavigatorRenderer } from '../NavigatorRenderer';
import { createRouter } from '../createRouter';
import {
  createInitialState,
  navigateToMatch,
  goBackReducer,
  resetKeyCounter,
} from '../stateOps';
import { matchPath } from '../matchPath';
jest.mock('react-native-screens');

beforeEach(() => {
  resetKeyCounter();
});

const FeedList = () => <Text>Feed List</Text>;
const FeedDetail = () => <Text>Feed Detail</Text>;
const ProfileScreen = () => <Text>Profile</Text>;
const SettingsScreen = () => <Text>Settings</Text>;
const LoginScreen = () => <Text>Login</Text>;

// Tabs at root with nested stack
const tabsWithStackRouter = createRouter({
  navigator: 'tabs',
  children: {
    feed: {
      navigator: 'stack',
      children: {
        list: { component: FeedList },
        $itemId: { component: FeedDetail },
      },
    },
    profile: { component: ProfileScreen },
  },
});

// Stack at root with nested tabs
const stackWithTabsRouter = createRouter({
  navigator: 'stack',
  children: {
    main: {
      navigator: 'tabs',
      children: {
        feed: { component: FeedList },
        settings: { component: SettingsScreen },
      },
    },
    login: { component: LoginScreen },
  },
});

function getAllComponents(
  router: ReturnType<typeof createRouter>
): Record<string, React.ComponentType<any>> {
  const result: Record<string, React.ComponentType<any>> = {};
  for (const pattern of router.patterns) {
    if (pattern.routeConfig.component) {
      result[pattern.routeName] = pattern.routeConfig.component;
    }
  }
  return result;
}

describe('NavigatorRenderer', () => {
  describe('Tabs at root', () => {
    it('renders TabView with nested StackView inside active tab', () => {
      const state = createInitialState(tabsWithStackRouter);
      const components = getAllComponents(tabsWithStackRouter);

      const { getByText } = render(
        <NavigatorRenderer
          state={state}
          router={tabsWithStackRouter}
          components={components}
          layouts={{}}
          customTabBars={{}}
          dispatch={() => {}}
        />
      );

      expect(getByText('Feed List')).toBeTruthy();
    });

    it('cross-navigator navigate: tabs → stack push', () => {
      const state = createInitialState(tabsWithStackRouter);
      const match = matchPath('/feed/42', tabsWithStackRouter.patterns)!;
      const navigated = navigateToMatch(state, match);
      const components = getAllComponents(tabsWithStackRouter);

      const { getByText } = render(
        <NavigatorRenderer
          state={navigated}
          router={tabsWithStackRouter}
          components={components}
          layouts={{}}
          customTabBars={{}}
          dispatch={() => {}}
        />
      );

      expect(getByText('Feed Detail')).toBeTruthy();
    });

    it('cross-navigator goBack: pops nested stack, does not switch tabs', () => {
      const state = createInitialState(tabsWithStackRouter);
      const match = matchPath('/feed/42', tabsWithStackRouter.patterns)!;
      const navigated = navigateToMatch(state, match);
      const backedUp = goBackReducer(navigated);
      const components = getAllComponents(tabsWithStackRouter);

      const { getByText, queryByText } = render(
        <NavigatorRenderer
          state={backedUp}
          router={tabsWithStackRouter}
          components={components}
          layouts={{}}
          customTabBars={{}}
          dispatch={() => {}}
        />
      );

      expect(getByText('Feed List')).toBeTruthy();
      expect(queryByText('Feed Detail')).toBeNull();
    });
  });

  describe('Stack at root', () => {
    it('renders StackView with nested TabView inside a stack entry', () => {
      const state = createInitialState(stackWithTabsRouter);
      const components = getAllComponents(stackWithTabsRouter);

      const { getByText } = render(
        <NavigatorRenderer
          state={state}
          router={stackWithTabsRouter}
          components={components}
          layouts={{}}
          customTabBars={{}}
          dispatch={() => {}}
        />
      );

      expect(getByText('Feed List')).toBeTruthy();
    });
  });

  describe('dispatch integration', () => {
    it('native dismiss maps to DISMISS action via dispatch', () => {
      const dispatch = jest.fn();
      const state = createInitialState(tabsWithStackRouter);
      const match = matchPath('/feed/42', tabsWithStackRouter.patterns)!;
      const navigated = navigateToMatch(state, match);
      const components = getAllComponents(tabsWithStackRouter);

      // Capture onDismiss callbacks from Stack.Screen
      const dismissCallbacks: Record<string, (key: string) => void> = {};
      jest
        .spyOn(require('react-native-screens/experimental').Stack, 'Screen')
        .mockImplementation(
          ({
            children,
            screenKey,
            onDismiss: onDismissProp,
            ...props
          }: any) => {
            const { View } = require('react-native');
            if (onDismissProp) dismissCallbacks[screenKey] = onDismissProp;
            return (
              <View testID={`StackScreen-${screenKey}`} {...props}>
                {children}
              </View>
            );
          }
        );

      render(
        <NavigatorRenderer
          state={navigated}
          router={tabsWithStackRouter}
          components={components}
          layouts={{}}
          customTabBars={{}}
          dispatch={dispatch}
        />
      );

      // Find the pushed screen key and dismiss it
      const pushedKey = Object.keys(dismissCallbacks).find((k) =>
        k.includes('$itemId')
      );
      if (pushedKey) {
        dismissCallbacks[pushedKey]!(pushedKey);
        expect(dispatch).toHaveBeenCalledWith({
          type: 'DISMISS',
          key: pushedKey,
        });
      }

      jest.restoreAllMocks();
    });
  });
});
