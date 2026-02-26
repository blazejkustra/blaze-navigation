// Core
export { createRouter } from './createRouter';
export { NavigationProvider } from './NavigationProvider';

// Global navigation functions
export { navigate, goBack, replace } from './navigation';

// Components
export { Link } from './Link';
export { ScreenProvider } from './ScreenProvider';
export { NavigatorRenderer } from './NavigatorRenderer';

// Hooks
export { useParams } from './hooks/useParams';
export { useNavigate } from './hooks/useNavigate';
export { useNavigationListener } from './hooks/useListeners';

// Contexts (for advanced use)
export { RouterContext, ScreenContext } from './NavigationContext';

// Types
export type {
  RouteConfig,
  RouterConfig,
  Route,
  NavigatorState,
  RouterInstance,
  RoutePattern,
  NavigatorSegment,
  NavigationAction,
  RouterContextValue,
  ScreenContextValue,
  NavigationEventType,
  NavigationListener,
  Register,
  RegisteredRouter,
  ValidPaths,
  NavigateFn,
  ReplaceFn,
  GoBackFn,
  ExtractParams,
} from './types';
