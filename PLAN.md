# Simplified Navigation Library Design

A plan for a config-based, URL-path navigation library built on native primitives (`react-native-screens`). No JSX navigator/screen pattern, no per-screen navigation objects, no ParamList generics — just a single `createRouter` call, global navigation functions, and native stacks and tabs.

Package name: `blaze-navigation`.

`react-native-screens` provides native primitives and now is being refactored to v5 with some changes to the API, so use the new API for the implementation:

`import { Tabs } from 'react-native-screens'` example usage for tabs: https://github.com/software-mansion/react-native-screens/blob/2b5cfb09f4228d8a9e8603fbe0e51e9f5ff8bba9/apps/src/tests/issue-tests/TestBottomTabs/index.tsx
`import { Stack } from 'react-native-screens/experimental'` example usage for stack: https://github.com/software-mansion/react-native-screens/blob/2b5cfb09f4228d8a9e8603fbe0e51e9f5ff8bba9/apps/src/shared/gamma/containers/stack/StackContainer.tsx#L62

## 1. Design Philosophy

**Native-first.** All animations, transitions, and gestures are handled by `react-native-screens`. The library never reimplements what the platform already provides. No `Animated` values for card transitions, no JS gesture responders for swipe-back.

**Config-based routing.** A single `createRouter({ routes: {...} })` call defines the entire app's route tree. No JSX `<Navigator>` / `<Screen>` pattern — routes, components, and nesting are all declared in one config object.

**URL-path navigation on all platforms.** Navigation uses URL paths everywhere: `navigate('/posts/123')`, not `navigate('Details', { id })`. This gives web-native parity out of the box and makes the mental model consistent across platforms.

**Global navigation API.** Navigation functions (`navigate`, `goBack`, `replace`) are imported directly from `blaze-navigation` — not obtained from per-screen hooks or navigation objects. Any module in the app can navigate without prop drilling or context access.

**Single package.** Instead of 12 packages across 5 layers, the library ships as `blaze-navigation` with zero internal dependency management. The only peer dependencies are `react`, `react-native`, and `react-native-screens`.

**`$` dynamic segments.** Route parameters use `$param` syntax (e.g. `$postId`) instead of `:param`. This avoids conflicts with URL-encoded characters and aligns with modern routing conventions.

**Type inference via module augmentation.** TypeScript users register their router once via `declare module 'blaze-navigation'`, and all paths, params, and navigation functions are fully typed — no manual `ParamList` generics.

**Target: 70-80% code reduction** compared to React Navigation.

## Important API decisions

- We use `$` to denote dynamic segments in the path. For example, `$postId` will match any path like `/posts/123` and will make `postId` available as a parameter.
- The `component` property is used to specify the React component that should be rendered when the route is matched. This allows us to easily define our routes and their corresponding components in a clear and concise way.
- The `children` property allows us to define nested routes, which is useful for organizing our routes in a hierarchical manner. This means that we can have routes that are nested within other routes, which can help to keep our routing structure clean and easy to understand.
- The `useNavigate` hook provides a simple way to programmatically navigate to different routes in our application. This is useful for situations where we want to navigate in response to some user action, such as clicking a button or submitting a form.
- The `Link` component provides a declarative way to create links to different routes in our application. This is useful for situations where we want to create links that users can click on to navigate to different parts of our application.

## Things for the initial release:

- [x] Global NavigationProvider that provides the router context to the entire app
  - Each route's component is wrapped in its own ScreenProvider that provides the route context (e.g. params, query, etc.) to the component and its children
- [x] Basic routing with dynamic segments
- [x] Nested routes
- [x] `useNavigate` hook for programmatic navigation
- [x] `useParams` hook for accessing route parameters
- [x] `Link` component for declarative navigation
- [x] Support for query parameters
- [x] Support for route guards (e.g. authentication)
- [x] Support for route transitions (e.g. animations) with start and end callbacks
- [x] Support for route metadata (e.g. title, description) that can be used
- [x] Support for route-based code splitting (e.g. using React.lazy)
- [x] Support for nested navigators (stack & tab navigations)
- [x] Support for layout components that can be used to wrap routes (e.g. for consistent headers or footers)
- [x] listener system for subscribing to navigation events (e.g. onFocus, onBlur, onStartTransition, onEndTransition)
- [x] Custom reanimated transitions for route changes on web (e.g. fade, slide, etc.)

## DO NOT include for the initial release:

- Deep linking support (e.g. handling external links that should open in the app)
- server-side rendering (SSR)
- Focus management (e.g. automatically focusing on the first input in a new route)
- Accessibility features (e.g. ARIA attributes, keyboard navigation)
- Theme support (e.g. dark mode, custom themes)
- setParams API for updating route params without navigating
- State persistence (e.g. saving and restoring navigation state across app restarts)
- Devtools integration (e.g. logging navigation actions, visualizing navigation state)
- Custom navigator types (e.g. drawer, bottom sheet)
- Custom action types (e.g. reset, popToTop)
- Middleware support for intercepting navigation actions

## Nested Navigators in Config

Navigators are declared inline using the `navigator` property:

```typescript
const router = createRouter({
  routes: {
    main: {
      component: MainLayout,
      navigator: 'tabs', // this node is a tab navigator
      children: {
        home: {
          component: HomeLayout,
          navigator: 'stack', // nested stack inside a tab
          children: {
            feed: { component: FeedPage },
            $itemId: { component: ItemDetailPage },
          },
        },
        settings: { component: SettingsPage },
      },
    },
  },
});
```

The `navigator` property accepts `'stack'` or `'tabs'`. When omitted, the route is a leaf (renders a single component). When present, the route's `children` are managed by that navigator type.

## Type Inference and Navigation API

It's important that we augment the types so that we will be able to infer hrefs and params from the router. For that we need to create a file `types.d.ts` in the root of our project and add the following code:

```ts
declare module 'blaze-navigation' {
  interface Register {
    router: typeof router;
  }
}
```

For navigation we can use `navigate`, `goBack` and `replace` functions (they will infer the types from the router):

```ts
import { navigate, goBack, replace } from 'blaze-navigation';

navigate('/posts/123'); // will navigate to /posts/123
goBack(); // will go back to the previous page
replace('/posts/123'); // will replace the current page with /posts/123
```

or we can use `Link` component:

```ts
import { Link } from 'blaze-navigation';
<Link to="/posts/123">Go to post 123</Link>;
```

For accessing parameters in the component, we can use `useParams` hook:

```ts
import { useParams } from 'blaze-navigation';
const { postId } = useParams(); // will give us the value of postId from the URL
```

## Navigation state management

The navigation state is managed in a single source of truth, which is the `state` object. navigators can be nested and on native tabs and stacks add additional problems.

## History management

On web, uses the History API to manage navigation state. On native mimics this behavior however take into account that we have multiple navigators (e.g. stack and tabs) and we need to keep the state in sync.

### Package Structure

```
blaze-navigation/
├── src/
│   ├── index.ts                    # Public API exports
│   ├── types.ts                    # All TypeScript types
│   ├── createRouter.ts             # Route config → router instance
│   ├── NavigationProvider.tsx       # Root provider (provides RouterContext)
│   ├── ScreenProvider.tsx           # Per-route provider (provides ScreenContext)
│   ├── navigation.ts               # Global navigate, goBack, replace functions
│   ├── Link.tsx                     # <Link to="/path"> component
│   ├── hooks/
│   │   ├── useParams.ts            # Access current route's dynamic params
│   │   ├── useNavigate.ts          # Returns { navigate, goBack, replace }
│   │   └── useListeners.ts         # onFocus, onBlur, onStartTransition, onEndTransition
│   ├── stack/
│   │   ├── StackView.native.tsx    # ScreenStack / ScreenStackItem wrapper
│   │   └── StackView.tsx           # Web: reanimated transitions
│   ├── tabs/
│   │   ├── TabView.native.tsx      # Tabs.Host / Tabs.Screen wrapper
│   │   └── TabView.tsx             # Web: div + display toggle
│   └── state/
│       ├── stateFromConfig.ts      # Config tree → initial state
│       ├── stateFromPath.ts        # URL path → state (uses $ syntax)
│       └── pathFromState.ts        # State → URL path
```

### Context Architecture

The library uses exactly 2 React contexts:

```typescript
// 1. RouterContext — global, provided by NavigationProvider
//    Contains: router config, current state tree, dispatch, navigation functions
//    One instance for the entire app

// 2. ScreenContext — per-route, provided by ScreenProvider
//    Contains: current route's params, path, query, metadata
//    Each route's component is wrapped in its own ScreenProvider
```

`NavigationProvider` wraps the entire app and provides `RouterContext`. Each route component is wrapped in a `ScreenProvider` that reads from `RouterContext` and provides `ScreenContext` with that route's specific params and metadata.

## State Model

### Single Source of Truth

The entire navigation state is a single object tree managed by `NavigationProvider`. There is no distributed state across multiple `useReducer` instances — one state tree represents the full navigation hierarchy.

```typescript
interface Route {
  key: string;
  path: string;
  params?: Record<string, string>;
}

interface NavigatorState {
  type: 'stack' | 'tabs';
  routes: Route[];
  index: number;
  children?: Record<string, NavigatorState>; // nested navigator states
}
```

### Config + URL → State

The state is derived from two inputs:

1. **Route config** — defines what routes exist and how they nest
2. **Current URL path** — determines which routes are active

When `navigate('/posts/123')` is called:

1. The path `/posts/123` is matched against the route config tree
2. The matching branch is identified: `posts` → `$postId` with `postId = '123'`
3. The state tree is updated: the `posts` stack pushes a new route for `$postId`

### Stack State

A stack navigator's state is an ordered array of routes. The last route is the visible screen.

```typescript
// After navigating: /posts → /posts/123 → /posts/123/comments
{
  type: 'stack',
  routes: [
    { key: 'posts-1', path: '/posts' },
    { key: 'postId-1', path: '/posts/123', params: { postId: '123' } },
    { key: 'comments-1', path: '/posts/123/comments', params: { postId: '123' } },
  ],
  index: 2,
}
```

Push = append to `routes`. Pop = remove from end. `index` always equals `routes.length - 1`.

### Tab State

A tab navigator's state contains all routes from initialization. Only `index` changes.

```typescript
// Tabs: feed, profile — profile is active
{
  type: 'tabs',
  routes: [
    { key: 'feed-1', path: '/home/feed' },
    { key: 'profile-1', path: '/home/profile' },
  ],
  index: 1,
}
```

All tab routes exist in state from mount. Switch = update `index`. Each tab may contain a nested navigator with its own state in `children`.

### State Sync Between Nested Navigators

When navigating to a deeply nested path like `/home/profile/user42`:

1. The root state identifies `home` (tabs navigator)
2. The `home` tabs state switches to `profile` (index update)
3. The `profile` route's nested state (if it has a stack) pushes `$userId` with `userId = 'user42'`

All of this happens in a single state update — no cascading dispatches.

### Key Behaviors

- **All tabs in state from start**: All tab routes are initialized at mount. `state.index` determines which is focused.
- **Switch**: `navigate('/home/settings')` updates `state.index`. The native `Tabs.Host` handles the visual transition.
- **Lazy loading**: Tabs are not rendered until first focused. A `Set` tracks which tabs have been rendered. Once rendered, a tab stays mounted (hidden via `display: 'none'` for custom tab bar, or managed natively by `Tabs.Host`).
- **Custom tab bar**: When a `tabBar` render prop is provided, the native `Tabs.Host` is replaced with manual layout. Screens are wrapped in `View` with display toggling.
- **Native tab bar**: When no `tabBar` is provided, `Tabs.Host` and `Tabs.Screen` render a fully native tab bar with platform-appropriate styling.

## Web Support & History

### URL as Source of Truth on Web

On web, the browser URL is the primary source of truth. Navigation state is derived from `window.location`:

```typescript
// On web, navigate() calls history.pushState then derives state from the new URL
function navigate(path: string) {
  history.pushState(null, '', path);
  const nextState = stateFromPath(path, routerConfig);
  setState(nextState);
}
```

The `popstate` event listener keeps state in sync when the user clicks browser back/forward buttons.

### State as Source of Truth on Native

On native, navigation state is the primary source of truth. There is no browser URL — the state tree represents the full navigation hierarchy. The URL path is computed from state when needed (e.g. for sharing or analytics).

### History API Integration

```typescript
interface HistoryAdapter {
  push(path: string): void; // history.pushState
  replace(path: string): void; // history.replaceState
  back(): void; // history.back()
  listen(cb: (path: string) => void): () => void; // popstate listener
  getPath(): string; // window.location.pathname
}
```

On native, the history adapter is a no-op — state changes don't need to sync with any URL bar.

### Native History Mimicry

On native, the library maintains an internal history stack to support `goBack()` across navigators. When a user navigates `/home/feed` → `/posts/123` → `/posts/123/comments`, the history stack tracks this sequence so `goBack()` can unwind correctly even across tab and stack boundaries.

## 11. Side-by-Side API Comparison

### App: Two tabs (Home, Settings), Home tab has a stack with details

**React Navigation (current):**

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// 3 separate packages needed

type HomeStackParamList = {
  HomeScreen: undefined;
  Details: { id: string };
};

type TabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// In a screen component:
function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  return (
    <Button
      title="Open Details"
      onPress={() => navigation.navigate('Details', { id: '42' })}
    />
  );
}
```

**blaze-navigation:**

```typescript
import {
  createRouter,
  NavigationProvider,
  navigate,
  useParams,
  Link,
} from 'blaze-navigation';
// 1 package

const router = createRouter({
  routes: {
    home: {
      component: HomeLayout,
      navigator: 'tabs',
      children: {
        feed: {
          component: FeedLayout,
          navigator: 'stack',
          children: {
            $itemId: { component: DetailsScreen },
          },
        },
        settings: { component: SettingsScreen },
      },
    },
  },
});

// types.d.ts
declare module 'blaze-navigation' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <NavigationProvider router={router}>
      {/* Routes are rendered automatically from config */}
    </NavigationProvider>
  );
}

// In a screen component:
function FeedPage() {
  return (
    <Link to="/home/feed/42">
      <Text>Open Details</Text>
    </Link>
  );
}

// Or programmatically:
function SomeButton() {
  return (
    <Button title="Open Details" onPress={() => navigate('/home/feed/42')} />
  );
}

// Accessing params:
function DetailsScreen() {
  const { itemId } = useParams();
  return <Text>Item: {itemId}</Text>;
}
```

### Key Differences

| Aspect            | React Navigation                               | blaze-navigation                            |
| ----------------- | ---------------------------------------------- | ------------------------------------------- |
| Packages          | 3+ (`native`, `native-stack`, `bottom-tabs`)   | 1 (`blaze-navigation`)                      |
| Route definition  | JSX `<Navigator>` / `<Screen>` tree            | Config object in `createRouter()`           |
| Type setup        | `ParamList` generics on every factory + hook   | Module augmentation — one `declare module`  |
| Navigation call   | `navigation.navigate('Details', { id })`       | `navigate('/home/feed/42')`                 |
| Navigation access | `useNavigation()` hook per screen              | Global import `from 'blaze-navigation'`     |
| Route params      | `useRoute().params`                            | `useParams()`                               |
| Links             | Third-party or manual `Pressable` + `navigate` | `<Link to="/path">` built-in                |
| Dynamic segments  | `:id` in linking config                        | `$id` in route config key                   |
| Contexts          | 8+                                             | 2 (`RouterContext`, `ScreenContext`)        |
| State management  | Router protocol + action dispatch + bubbling   | Single state tree derived from config + URL |
| Internals         | ~25k LOC across 12 packages                    | Target: ~3-5k LOC in 1 package              |
