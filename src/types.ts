import type React from 'react';

// ---------------------------------------------------------------------------
// Route config types
// ---------------------------------------------------------------------------

export interface RouteConfig {
  component?: React.ComponentType<any>;
  navigator?: 'stack' | 'tabs';
  children?: Record<string, RouteConfig>;
  /** Route metadata */
  meta?: Record<string, unknown>;
  /** Route guard — synchronous function that returns whether the route is accessible */
  guard?: () => boolean;
  /** Redirect path when guard fails */
  guardRedirect?: string;
  /** Tab-specific options */
  tabOptions?: {
    title?: string;
    icon?: any;
    selectedIcon?: any;
    badgeValue?: string;
  };
}

export interface RouterConfig {
  routes: Record<string, RouteConfig>;
}

// ---------------------------------------------------------------------------
// Navigation state types
// ---------------------------------------------------------------------------

export interface StackEntry {
  key: string;
  routeName: string;
  path: string;
  params: Record<string, string>;
  nestedState?: NavigatorState;
}

export interface StackState {
  type: 'stack';
  entries: StackEntry[];
}

export interface TabEntry {
  key: string;
  path: string;
  params: Record<string, string>;
  rendered: boolean;
  nestedState?: NavigatorState;
  tabOptions?: RouteConfig['tabOptions'];
}

export interface TabState {
  type: 'tabs';
  activeKey: string;
  tabs: Record<string, TabEntry>;
}

export type NavigatorState = StackState | TabState;

// ---------------------------------------------------------------------------
// Router instance
// ---------------------------------------------------------------------------

export interface RouterInstance<TConfig extends RouterConfig = RouterConfig> {
  config: TConfig;
  /** Flattened route patterns for matching */
  patterns: RoutePattern[];
}

export interface RoutePattern {
  /** e.g. '/home/feed/$itemId' */
  path: string;
  segments: string[];
  paramNames: string[];
  routeName: string;
  routeConfig: RouteConfig;
  /** Path through navigators to reach this route */
  navigatorPath: NavigatorSegment[];
  /** Collected guard functions from ancestor chain + own guard */
  guards: Array<() => boolean>;
}

export interface NavigatorSegment {
  name: string;
  type: 'stack' | 'tabs';
  childName: string;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type Action =
  | { type: 'NAVIGATE'; path: string }
  | { type: 'REPLACE'; path: string }
  | { type: 'GO_BACK' }
  | { type: 'DISMISS'; key: string }
  | { type: 'SWITCH_TAB'; tabKey: string }
  | { type: 'SET_STATE'; state: NavigatorState };

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

export interface Route {
  key: string;
  path: string;
  name: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface RouterContextValue {
  router: RouterInstance;
  state: NavigatorState;
  navigate: NavigateFn;
  goBack: GoBackFn;
  replace: ReplaceFn;
}

export interface ScreenContextValue {
  route: Route;
  params: Record<string, string>;
  query: Record<string, string>;
  meta?: Record<string, unknown>;
  isFocused: boolean;
}

// ---------------------------------------------------------------------------
// Listener types
// ---------------------------------------------------------------------------

export type NavigationEventType =
  | 'focus'
  | 'blur'
  | 'beforeNavigate'
  | 'afterNavigate';

export type NavigationListener = (event: {
  type: NavigationEventType;
  route?: Route;
}) => void;

// ---------------------------------------------------------------------------
// Type inference via module augmentation
// ---------------------------------------------------------------------------

/**
 * Users augment this interface to register their router for type inference:
 *
 * ```ts
 * declare module 'blaze-navigation' {
 *   interface Register {
 *     router: typeof router;
 *   }
 * }
 * ```
 */
export interface Register {
  // Users augment this: router: typeof router
}

/** Extract router type from Register */
export type RegisteredRouter = Register extends { router: infer R }
  ? R
  : RouterInstance;

// ---------------------------------------------------------------------------
// Path inference types
// ---------------------------------------------------------------------------

/** Helper: join path segments */
type JoinPath<A extends string, B extends string> = A extends '/'
  ? `/${B}`
  : `${A}/${B}`;

/** Extract all paths from a route config tree */
type ExtractPaths<
  T extends Record<string, RouteConfig>,
  Prefix extends string = ''
> = {
  [K in keyof T & string]:
    | JoinPath<Prefix, K>
    | (T[K] extends {
        children: infer C extends Record<string, RouteConfig>;
      }
        ? ExtractPaths<C, JoinPath<Prefix, K>>
        : never);
}[keyof T & string];

/** Replace $param segments with string values */
type ReplaceParams<T extends string> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends `${infer Before}/$${infer _Param}/${infer After}`
    ? `${Before}/${string}/${ReplaceParams<After>}`
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T extends `${infer Before}/$${infer _Param}`
    ? `${Before}/${string}`
    : T;

/** Get all valid href paths from registered router */
export type ValidPaths = Register extends {
  router: {
    config: {
      routes: infer R extends Record<string, RouteConfig>;
    };
  };
}
  ? ReplaceParams<ExtractPaths<R>>
  : string;

// ---------------------------------------------------------------------------
// Navigation function types using inferred paths
// ---------------------------------------------------------------------------

export type NavigateFn = (path: ValidPaths) => void;
export type ReplaceFn = (path: ValidPaths) => void;
export type GoBackFn = () => void;

/** Extract params from a path pattern */
export type ExtractParams<T extends string> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends `${infer _}/$${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T extends `${infer _}/$${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;
