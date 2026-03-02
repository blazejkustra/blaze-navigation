import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Link } from '../Link';
import { RouterContext } from '../NavigationContext';
import type { RouterContextValue } from '../types';

jest.mock('react-native-screens');

function renderWithRouter(
  ui: React.ReactElement,
  overrides: Partial<RouterContextValue> = {}
) {
  const mockContext: RouterContextValue = {
    router: { config: { navigator: 'stack', children: {} }, patterns: [] },
    state: { type: 'stack', entries: [] },
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
    ...overrides,
  };

  return {
    ...render(
      <RouterContext.Provider value={mockContext}>{ui}</RouterContext.Provider>
    ),
    mockContext,
  };
}

describe('Link', () => {
  it('calls navigate(to) on press', () => {
    const { getByText, mockContext } = renderWithRouter(
      <Link to="/feed">Go Home</Link>
    );

    fireEvent.press(getByText('Go Home'));

    expect(mockContext.navigate).toHaveBeenCalledWith('/feed');
    expect(mockContext.replace).not.toHaveBeenCalled();
  });

  it('calls replace(to) when replace prop is true', () => {
    const { getByText, mockContext } = renderWithRouter(
      <Link to="/feed" replace>
        Go Home
      </Link>
    );

    fireEvent.press(getByText('Go Home'));

    expect(mockContext.replace).toHaveBeenCalledWith('/feed');
    expect(mockContext.navigate).not.toHaveBeenCalled();
  });
});
