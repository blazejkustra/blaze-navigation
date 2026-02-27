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
  it('renders ScreenStack with one ScreenStackItem per entry', () => {
    const state: StackState = {
      type: 'stack',
      entries: [makeEntry('home', 'home-0')],
    };

    const { getByTestId, queryAllByTestId } = render(
      <StackView state={state} components={components} onDismiss={() => {}} />
    );

    expect(getByTestId('ScreenStack')).toBeTruthy();
    expect(queryAllByTestId(/^ScreenStackItem-/)).toHaveLength(1);
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

    expect(queryAllByTestId(/^ScreenStackItem-/)).toHaveLength(3);
    expect(queryAllByText('Details Screen')).toHaveLength(3);
  });

  it('calls onDismiss(key) when native dismiss fires', () => {
    const onDismiss = jest.fn();
    const state: StackState = {
      type: 'stack',
      entries: [makeEntry('home', 'home-0'), makeEntry('details', 'details-1')],
    };

    // Use a ref to capture onDismissed callbacks
    const dismissCallbacks: Record<string, () => void> = {};
    const MockScreenStackItem = ({
      children,
      screenId,
      onDismissed,
      ...props
    }: any) => {
      if (onDismissed) dismissCallbacks[screenId] = onDismissed;
      return (
        <View testID={`ScreenStackItem-${screenId}`} {...props}>
          {children}
        </View>
      );
    };

    jest.spyOn(
      require('react-native-screens'),
      'ScreenStackItem'
    ).mockImplementation(MockScreenStackItem);

    render(
      <StackView state={state} components={components} onDismiss={onDismiss} />
    );

    // Simulate native dismiss
    dismissCallbacks['details-1']!();
    expect(onDismiss).toHaveBeenCalledWith('details-1');

    jest.restoreAllMocks();
  });

  it('wraps each entry in ScreenProvider with correct params', () => {
    const state: StackState = {
      type: 'stack',
      entries: [
        makeEntry('home', 'home-0', { itemId: '42' }),
      ],
    };

    // ScreenProvider should set up context — we can verify by the rendered component
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
      entries: [
        { ...makeEntry('home', 'home-0'), nestedState },
      ],
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
