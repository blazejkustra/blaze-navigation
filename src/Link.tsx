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

/**
 * Pressable component that navigates to a typed path on press.
 * Supports `replace` prop for replacing the current screen instead of pushing.
 *
 * @param props.to - The path to navigate to.
 * @param props.replace - If true, replaces the current screen instead of pushing.
 */
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
