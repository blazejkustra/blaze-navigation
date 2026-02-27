import React from 'react';
import { View } from 'react-native';

export const ScreenStack = ({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: any;
}) => (
  <View testID="ScreenStack" {...props}>
    {children}
  </View>
);

export const ScreenStackItem = ({
  children,
  screenId,
  activityState,
  onDismissed,
  ...props
}: {
  children?: React.ReactNode;
  screenId?: string;
  activityState?: number;
  onDismissed?: () => void;
  [key: string]: any;
}) => (
  <View
    testID={`ScreenStackItem-${screenId}`}
    accessibilityState={{ selected: activityState === 2 }}
    {...props}
  >
    {children}
  </View>
);

export const Tabs = {
  Host: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    [key: string]: any;
  }) => (
    <View testID="TabsHost" {...props}>
      {children}
    </View>
  ),
  Screen: ({
    children,
    tabKey,
    isFocused,
    ...props
  }: {
    children?: React.ReactNode;
    tabKey?: string;
    isFocused?: boolean;
    [key: string]: any;
  }) => (
    <View testID={`TabsScreen-${tabKey}`} {...props}>
      {isFocused ? children : null}
    </View>
  ),
};

export function enableFreeze() {}
export function enableScreens() {}
