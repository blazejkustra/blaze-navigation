import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { StackView } from '../stack/StackView';
import type { StackState, StackEntry } from '../types';

jest.mock('react-native-screens');

const HomeScreen = () => <Text>Home Screen</Text>;
const DetailsScreen = () => <Text>Details Screen</Text>;

const components: Record<string, React.ComponentType<any>> = {
  home: HomeScreen,
  details: DetailsScreen,
};

function makeEntry(
  routeName: string,
  key: string,
  params: Record<string, string> = {}
): StackEntry {
  return { key, routeName, path: `/${routeName}`, params };
}

describe('StackView', () => {
  it('renders Stack.Host with one Stack.Screen per entry', () => {
    const state: StackState = {
      type: 'stack',
      entries: [makeEntry('home', 'home-0')],
    };

    const { getByTestId, queryAllByTestId } = render(
      <StackView state={state} components={components} onDismiss={() => {}} />
    );

    expect(getByTestId('StackHost')).toBeTruthy();
    expect(queryAllByTestId(/^StackScreen-/)).toHaveLength(1);
  });

  it('renders correct component for each entry', () => {
    const state: StackState = {
      type: 'stack',
      entries: [makeEntry('home', 'home-0'), makeEntry('details', 'details-1')],
    };

    const { getByText } = render(
      <StackView state={state} components={components} onDismiss={() => {}} />
    );

    expect(getByText('Home Screen')).toBeTruthy();
    expect(getByText('Details Screen')).toBeTruthy();
  });

  it('renders multiple entries with same routeName', () => {
    const state: StackState = {
      type: 'stack',
      entries: [
        makeEntry('details', 'details-0'),
        makeEntry('details', 'details-1'),
        makeEntry('details', 'details-2'),
      ],
    };

    const { queryAllByText, queryAllByTestId } = render(
      <StackView state={state} components={components} onDismiss={() => {}} />
    );

    expect(queryAllByTestId(/^StackScreen-/)).toHaveLength(3);
    expect(queryAllByText('Details Screen')).toHaveLength(3);
  });

  it('calls onDismiss(key) when native dismiss fires', () => {
    const onDismiss = jest.fn();
    const state: StackState = {
      type: 'stack',
      entries: [makeEntry('home', 'home-0'), makeEntry('details', 'details-1')],
    };

    // Capture onDismiss callbacks from Stack.Screen
    const dismissCallbacks: Record<string, (key: string) => void> = {};
    const MockStackScreen = ({
      children,
      screenKey,
      onDismiss: onDismissProp,
      ...props
    }: any) => {
      if (onDismissProp) dismissCallbacks[screenKey] = onDismissProp;
      return (
        <View testID={`StackScreen-${screenKey}`} {...props}>
          {children}
        </View>
      );
    };

    jest
      .spyOn(require('react-native-screens/experimental').Stack, 'Screen')
      .mockImplementation(MockStackScreen);

    render(
      <StackView state={state} components={components} onDismiss={onDismiss} />
    );

    // Simulate native dismiss — experimental API passes screenKey
    dismissCallbacks['details-1']!('details-1');
    expect(onDismiss).toHaveBeenCalledWith('details-1');

    jest.restoreAllMocks();
  });

  it('wraps each entry in ScreenProvider with correct params', () => {
    const state: StackState = {
      type: 'stack',
      entries: [makeEntry('home', 'home-0', { itemId: '42' })],
    };

    const { getByText } = render(
      <StackView state={state} components={components} onDismiss={() => {}} />
    );

    expect(getByText('Home Screen')).toBeTruthy();
  });

  it('renders nested navigator content via renderContent prop', () => {
    const nestedState: StackState = {
      type: 'stack',
      entries: [makeEntry('details', 'details-0')],
    };

    const state: StackState = {
      type: 'stack',
      entries: [{ ...makeEntry('home', 'home-0'), nestedState }],
    };

    const renderContent = jest.fn((entry: StackEntry) => {
      if (entry.nestedState) {
        return <Text>Nested Content</Text>;
      }
      return null;
    });

    const { getByText } = render(
      <StackView
        state={state}
        components={components}
        onDismiss={() => {}}
        renderContent={renderContent}
      />
    );

    expect(renderContent).toHaveBeenCalled();
    expect(getByText('Nested Content')).toBeTruthy();
  });
});
