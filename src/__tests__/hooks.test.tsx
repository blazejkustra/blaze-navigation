import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useParams } from '../hooks/useParams';
import { useNavigationListener } from '../hooks/useListeners';
import { ScreenProvider } from '../ScreenProvider';
import type { Route } from '../types';

jest.mock('react-native-screens');

describe('useParams', () => {
  it('throws outside ScreenProvider', () => {
    const TestComp = () => {
      const params = useParams();
      return <Text>{JSON.stringify(params)}</Text>;
    };

    expect(() => render(<TestComp />)).toThrow(
      'useParams must be used within a screen component'
    );
  });

  it('returns params inside ScreenProvider', () => {
    const TestComp = () => {
      const params = useParams<{ itemId: string }>();
      return <Text>{params.itemId}</Text>;
    };

    const route: Route = {
      key: 'test-0',
      path: '/test/42',
      name: 'test',
      params: { itemId: '42' },
    };

    const { getByText } = render(
      <ScreenProvider route={route}>
        <TestComp />
      </ScreenProvider>
    );

    expect(getByText('42')).toBeTruthy();
  });
});

describe('useNavigationListener', () => {
  it('fires for matching route key', () => {
    const callback = jest.fn();
    const route: Route = {
      key: 'screen-1',
      path: '/test',
      name: 'test',
    };

    const TestComp = () => {
      useNavigationListener('focus', callback);
      return <Text>Test</Text>;
    };

    render(
      <ScreenProvider route={route}>
        <TestComp />
      </ScreenProvider>
    );

    // Emit a focus event for matching route
    const { emitNavigationEvent } = require('../hooks/useListeners');
    emitNavigationEvent('focus', {
      key: 'screen-1',
      path: '/test',
      name: 'test',
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('ignores events for other routes', () => {
    const callback = jest.fn();
    const route: Route = {
      key: 'screen-1',
      path: '/test',
      name: 'test',
    };

    const TestComp = () => {
      useNavigationListener('focus', callback);
      return <Text>Test</Text>;
    };

    render(
      <ScreenProvider route={route}>
        <TestComp />
      </ScreenProvider>
    );

    const { emitNavigationEvent } = require('../hooks/useListeners');
    emitNavigationEvent('focus', {
      key: 'different-screen',
      path: '/other',
      name: 'other',
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const callback = jest.fn();
    const route: Route = {
      key: 'screen-1',
      path: '/test',
      name: 'test',
    };

    const TestComp = () => {
      useNavigationListener('focus', callback);
      return <Text>Test</Text>;
    };

    const { unmount } = render(
      <ScreenProvider route={route}>
        <TestComp />
      </ScreenProvider>
    );

    unmount();

    const { emitNavigationEvent } = require('../hooks/useListeners');
    emitNavigationEvent('focus', {
      key: 'screen-1',
      path: '/test',
      name: 'test',
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
