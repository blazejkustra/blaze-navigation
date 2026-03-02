import { View } from 'react-native';

// Experimental Stack API mock (Stack.Host + Stack.Screen)
export const Stack = {
  Host: ({ children, ...props }: any) => (
    <View testID="StackHost" {...props}>
      {children}
    </View>
  ),
  Screen: ({ children, screenKey, activityMode, ...props }: any) => (
    <View
      testID={`StackScreen-${screenKey}`}
      accessibilityState={{ selected: activityMode === 'attached' }}
      {...props}
    >
      {children}
    </View>
  ),
};

export const Split = {
  Host: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  Column: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  Inspector: ({ children, ...props }: any) => (
    <View {...props}>{children}</View>
  ),
};

export const SafeAreaView = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);
