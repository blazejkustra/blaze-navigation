declare module 'react-native-screens' {
  import type { ComponentType, ReactNode } from 'react';
  import type {
    NativeSyntheticEvent,
    ColorValue,
    ImageSourcePropType,
    StyleProp,
    ViewStyle,
  } from 'react-native';

  // ---------- Stack (stable API) ----------

  interface ScreenStackProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    onFinishTransitioning?: () => void;
  }

  interface ScreenStackItemProps {
    children?: ReactNode;
    screenId: string;
    activityState?: number;
    style?: StyleProp<ViewStyle>;
    stackPresentation?:
      | 'push'
      | 'modal'
      | 'transparentModal'
      | 'containedModal'
      | 'containedTransparentModal'
      | 'fullScreenModal'
      | 'formSheet';
    onDismissed?: () => void;
    onWillAppear?: () => void;
    onDidAppear?: () => void;
    onWillDisappear?: () => void;
    onDidDisappear?: () => void;
    headerConfig?: Record<string, unknown>;
  }

  export const ScreenStack: ComponentType<ScreenStackProps>;
  export const ScreenStackItem: ComponentType<ScreenStackItemProps>;

  // ---------- Tabs (stable API) ----------

  interface PlatformIconShared {
    type: 'imageSource';
    imageSource: ImageSourcePropType;
  }

  type PlatformIconIOS =
    | { type: 'sfSymbol'; name: string }
    | { type: 'xcasset'; name: string }
    | { type: 'templateSource'; templateSource: ImageSourcePropType }
    | PlatformIconShared;

  type PlatformIconAndroid =
    | { type: 'drawableResource'; name: string }
    | PlatformIconShared;

  interface PlatformIcon {
    ios?: PlatformIconIOS;
    android?: PlatformIconAndroid;
    shared?: PlatformIconShared;
  }

  interface TabsHostProps {
    children?: ReactNode;
    onNativeFocusChange?: (
      event: NativeSyntheticEvent<{ tabKey: string }>
    ) => void;
    experimentalControlNavigationStateInJS?: boolean;
    tabBarHidden?: boolean;
    tabBarBackgroundColor?: ColorValue;
    tabBarItemIconColor?: ColorValue;
    tabBarItemIconColorActive?: ColorValue;
    tabBarTintColor?: ColorValue;
    nativeContainerStyle?: { backgroundColor?: ColorValue };
  }

  interface TabsScreenProps {
    children?: ReactNode;
    tabKey: string;
    isFocused?: boolean;
    title?: string;
    icon?: PlatformIcon;
    selectedIcon?: PlatformIcon;
    badgeValue?: string;
    onWillAppear?: () => void;
    onDidAppear?: () => void;
    onWillDisappear?: () => void;
    onDidDisappear?: () => void;
  }

  export const Tabs: {
    Host: ComponentType<TabsHostProps>;
    Screen: ComponentType<TabsScreenProps>;
  };

  export function enableFreeze(enabled: boolean): void;
  export function enableScreens(enabled: boolean): void;
}
