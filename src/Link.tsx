import React, { useCallback, useContext } from 'react';
import { Pressable, Text } from 'react-native';
import type {
  PressableProps,
  TextStyle,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { RouterContext } from './NavigationContext';
import type { ValidPaths } from './types';

interface LinkProps {
  to: ValidPaths;
  replace?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
  onPress?: PressableProps['onPress'];
}

export function Link({
  to,
  replace: shouldReplace,
  style,
  textStyle,
  children,
  onPress,
}: LinkProps) {
  const routerCtx = useContext(RouterContext);

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (event) => {
      onPress?.(event);
      if (routerCtx) {
        if (shouldReplace) {
          routerCtx.replace(to);
        } else {
          routerCtx.navigate(to);
        }
      }
    },
    [to, shouldReplace, routerCtx, onPress]
  );

  return (
    <Pressable onPress={handlePress} style={style}>
      {typeof children === 'string' ? (
        <Text style={textStyle}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
