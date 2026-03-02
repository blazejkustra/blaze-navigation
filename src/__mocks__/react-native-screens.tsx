import { View } from 'react-native';

// Legacy stack API
export const ScreenStack = ({ children, ...props }: any) => (
  <View testID="ScreenStack" {...props}>
    {children}
  </View>
);

export const ScreenStackItem = ({
  children,
  screenId,
  activityState,
  ...props
}: any) => (
  <View
    testID={`ScreenStackItem-${screenId}`}
    accessibilityState={{ selected: activityState === 2 }}
    {...props}
  >
    {children}
  </View>
);

// Tabs API
export const Tabs = {
  Host: ({ children, ...props }: any) => (
    <View testID="TabsHost" {...props}>
      {children}
    </View>
  ),
  Screen: ({ children, tabKey, isFocused, ...props }: any) => (
    <View testID={`TabsScreen-${tabKey}`} {...props}>
      {isFocused ? children : null}
    </View>
  ),
};

export function enableFreeze() {}
export function enableScreens() {}
