# blaze-navigation — API Reference

## Table of Contents

- [Getting Started](#getting-started)
- [createRouter](#createrouter)
- [NavigationProvider](#navigationprovider)
- [Navigation Functions](#navigation-functions)
- [Link](#link)
- [Hooks](#hooks)
- [Type Safety](#type-safety)
- [RouteConfig Reference](#routeconfig-reference)
- [Navigation Patterns](#navigation-patterns)
- [Advanced](#advanced)

---

## Getting Started

### Installation

```sh
npm install blaze-navigation react-native-screens
```

### Peer Dependencies

| Package                | Version   |
| ---------------------- | --------- |
| `react`                | `*`       |
| `react-native`         | `*`       |
| `react-native-screens` | `>=4.0.0` |

### Basic Setup

```tsx
import { createRouter, NavigationProvider } from 'blaze-navigation';
import { HomeScreen } from './screens/HomeScreen';

const router = createRouter({
  navigator: 'stack',
  children: {
    home: { component: HomeScreen },
  },
});

export default function App() {
  return <NavigationProvider router={router} />;
}
```

---

## createRouter

Creates a router instance from a declarative route configuration. The root config must specify a `navigator` type and `children`.

### Signature

```ts
function createRouter<TConfig extends RouteConfig>(
  config: TConfig
): RouterInstance<TConfig>;
```

### Parameters

| Parameter | Type          | Description                                                |
| --------- | ------------- | ---------------------------------------------------------- |
| `config`  | `RouteConfig` | Root route config with `navigator` and `children` required |

### Returns

A `RouterInstance` containing:

- `config` — the original config
- `patterns` — flattened route patterns used for path matching

### Examples

**Stack navigator:**

```ts
const router = createRouter({
  navigator: 'stack',
  children: {
    home: { component: HomeScreen },
    profile: { component: ProfileScreen },
  },
});
```

**Tab navigator:**

```ts
const router = createRouter({
  navigator: 'tabs',
  children: {
    feed: {
      component: FeedScreen,
      tabOptions: { title: 'Feed' },
    },
    profile: {
      component: ProfileScreen,
      tabOptions: { title: 'Profile' },
    },
  },
});
```

**Nested navigators (tabs with stacks):**

```ts
const router = createRouter({
  navigator: 'tabs',
  children: {
    feed: {
      component: FeedScreen,
      navigator: 'stack',
      tabOptions: { title: 'Feed' },
      children: {
        $itemId: { component: DetailScreen },
      },
    },
    settings: {
      component: SettingsScreen,
      tabOptions: { title: 'Settings' },
    },
  },
});
```

**With layout and guard:**

```ts
const router = createRouter({
  navigator: 'stack',
  layout: AppLayout,
  children: {
    dashboard: {
      component: DashboardScreen,
      guard: () => isAuthenticated(),
      guardRedirect: '/login',
    },
    login: { component: LoginScreen },
  },
});
```

---

## NavigationProvider

Root provider component that manages navigation state, renders the navigator tree, handles the Android back button, and exposes router context to the app.

### Props

| Prop       | Type              | Required | Description                                        |
| ---------- | ----------------- | -------- | -------------------------------------------------- |
| `router`   | `RouterInstance`  | Yes      | Router instance created by `createRouter`          |
| `children` | `React.ReactNode` | No       | Optional children rendered alongside the navigator |

### Usage

```tsx
import { NavigationProvider } from 'blaze-navigation';

function App() {
  return (
    <NavigationProvider router={router}>
      {/* Optional: additional UI rendered alongside the navigator */}
    </NavigationProvider>
  );
}
```

The provider automatically:

- Creates the initial navigation state from the router config
- Registers global `navigate`/`goBack`/`replace` functions
- Handles Android hardware back button

---

## Navigation Functions

Global functions that work anywhere — inside or outside React components. They require `NavigationProvider` to be mounted.

### navigate

Navigate to a path by pushing onto the deepest stack or switching tabs.

```ts
function navigate(path: ValidPaths): void;
```

```ts
import { navigate } from 'blaze-navigation';

navigate('/feed/42');
navigate('/profile');
```

### goBack

Pop the top screen from the deepest nested stack.

```ts
function goBack(): void;
```

```ts
import { goBack } from 'blaze-navigation';

goBack();
```

### replace

Replace the current screen — equivalent to going back then navigating.

```ts
function replace(path: ValidPaths): void;
```

```ts
import { replace } from 'blaze-navigation';

replace('/settings');
```

> All three functions throw if called before `NavigationProvider` is mounted.

---

## Link

A `Pressable` component that navigates to a typed path on press.

### Props

| Prop        | Type                        | Required | Description                               |
| ----------- | --------------------------- | -------- | ----------------------------------------- |
| `to`        | `ValidPaths`                | Yes      | Path to navigate to                       |
| `replace`   | `boolean`                   | No       | Replace instead of push (default `false`) |
| `style`     | `StyleProp<ViewStyle>`      | No       | Style for the `Pressable` wrapper         |
| `textStyle` | `StyleProp<TextStyle>`      | No       | Style applied when children is a string   |
| `children`  | `React.ReactNode`           | Yes      | Content to render inside the pressable    |
| `onPress`   | `PressableProps['onPress']` | No       | Additional press handler                  |

### Usage

```tsx
import { Link } from 'blaze-navigation';

// Simple text link
<Link to="/profile">Go to Profile</Link>

// With replace
<Link to="/settings" replace>
  Replace with Settings
</Link>

// Custom content
<Link to="/feed/42" style={{ padding: 12 }}>
  <View>
    <Text>View Item #42</Text>
  </View>
</Link>
```

---

## Hooks

### useParams

Returns the current screen's route parameters. Must be used within a screen rendered by the navigator.

```ts
function useParams<T extends Record<string, string>>(): T;
```

```tsx
import { useParams } from 'blaze-navigation';

function DetailScreen() {
  const { itemId } = useParams<{ itemId: string }>();

  return <Text>Item: {itemId}</Text>;
}
```

> Throws if used outside a screen component (i.e. without a `ScreenProvider` ancestor).

### useNavigationListener

Registers a navigation event listener. Cleans up automatically on unmount.

```ts
function useNavigationListener(
  type: NavigationEventType,
  callback: () => void
): void;
```

#### Event types

| Event            | Description                                      |
| ---------------- | ------------------------------------------------ |
| `focus`          | Fired when this screen becomes the active screen |
| `blur`           | Fired when this screen loses focus               |
| `beforeNavigate` | Fired before any navigation action is processed  |
| `afterNavigate`  | Fired after a navigation action completes        |

For `focus` and `blur`, the callback only fires for the screen that owns the hook. For `beforeNavigate` and `afterNavigate`, the callback fires globally.

```tsx
import { useNavigationListener } from 'blaze-navigation';

function FeedScreen() {
  useNavigationListener('focus', () => {
    console.log('FeedScreen focused');
  });

  useNavigationListener('blur', () => {
    console.log('FeedScreen blurred');
  });

  return <Text>Feed</Text>;
}
```

---

## Type Safety

blaze-navigation provides full path type inference via module augmentation.

### Register your router

```ts
const router = createRouter({
  navigator: 'stack',
  children: {
    home: {
      component: HomeScreen,
      children: {
        $itemId: { component: DetailScreen },
      },
    },
  },
});

declare module 'blaze-navigation' {
  interface Register {
    router: typeof router;
  }
}
```

Once registered:

- **`ValidPaths`** — a union of all valid navigation paths (e.g. `"/home"` | `"/home/${string}"`). Used by `navigate()`, `replace()`, and `<Link to="...">`.
- **`ExtractParams<Path>`** — extracts parameter types from a path pattern (e.g. `ExtractParams<"/home/$itemId">` → `{ itemId: string }`).

### Example

```ts
// Type-safe — only valid paths are accepted
navigate('/home/42'); // OK
navigate('/unknown'); // Type error

// Type-safe params
const { itemId } = useParams<ExtractParams<'/home/$itemId'>>();
// itemId: string
```

---

## RouteConfig Reference

The full shape of a route configuration node:

```ts
interface RouteConfig {
  /** Screen component to render */
  component?: React.ComponentType<any>;

  /** Layout wrapper for the navigator at this level */
  layout?: React.ComponentType<{ children: React.ReactNode }>;

  /** Navigator type — creates a nested navigator when set */
  navigator?: 'stack' | 'tabs';

  /** Child routes */
  children?: Record<string, RouteConfig>;

  /** Arbitrary route metadata accessible via ScreenContext */
  meta?: Record<string, unknown>;

  /** Route guard — return false to prevent navigation */
  guard?: () => boolean | Promise<boolean>;

  /** Path to redirect to when guard fails */
  guardRedirect?: string;

  /** Tab-specific configuration (only relevant for children of a tabs navigator) */
  tabOptions?: {
    title?: string;
    icon?: any;
    selectedIcon?: any;
    badgeValue?: string;
  };
}
```

### Dynamic parameters

Prefix a route segment with `$` to make it a dynamic parameter:

```ts
children: {
  // Matches /users/123, /users/abc, etc.
  $userId: { component: UserScreen },
}
```

Parameters are extracted and available via `useParams()`.

---

## Navigation Patterns

The [`example/`](example/) directory demonstrates four patterns. All router configs are in [`example/src/App.tsx`](example/src/App.tsx).

### Simple Stack

A stack navigator with a list screen pushing to a detail screen.

```ts
const simpleStackRouter = createRouter({
  navigator: 'stack',
  children: {
    home: {
      component: StackHomeScreen,
      children: {
        $itemId: { component: StackDetailScreen },
      },
    },
  },
});
```

### Simple Tabs

A tab navigator with three independent screens.

```ts
const simpleTabsRouter = createRouter({
  navigator: 'tabs',
  children: {
    explore: { component: TabsScreenA, tabOptions: { title: 'Explore' } },
    favorites: { component: TabsScreenB, tabOptions: { title: 'Favorites' } },
    account: { component: TabsScreenC, tabOptions: { title: 'Account' } },
  },
});
```

### Tabs + Stacks

A tab navigator where individual tabs contain their own stack navigators.

```ts
const tabsWithStacksRouter = createRouter({
  navigator: 'tabs',
  children: {
    feed: {
      component: FeedScreen,
      navigator: 'stack',
      tabOptions: { title: 'Feed' },
      children: {
        $itemId: { component: DetailScreen },
      },
    },
    profile: {
      component: ProfileScreen,
      tabOptions: { title: 'Profile' },
    },
    settings: {
      component: SettingsScreen,
      navigator: 'stack',
      tabOptions: { title: 'Settings' },
      children: {
        $depth: { component: RecursiveScreen },
      },
    },
  },
});
```

### Recursive Stack

A stack navigator where a screen pushes new instances of itself.

```ts
const recursiveStackRouter = createRouter({
  navigator: 'stack',
  children: {
    home: {
      component: RecursiveScreen,
      children: {
        $depth: { component: RecursiveScreen },
      },
    },
  },
});
```

---

## Advanced

These exports are primarily for building custom navigators or extending the library.

### RouterContext

React context providing the router instance, navigation state, and navigation functions.

```ts
interface RouterContextValue {
  router: RouterInstance;
  state: NavigatorState;
  path: string;
  navigate: NavigateFn;
  goBack: GoBackFn;
  replace: ReplaceFn;
}
```

```tsx
import { useContext } from 'react';
import { RouterContext } from 'blaze-navigation';

function CustomComponent() {
  const ctx = useContext(RouterContext);
  // ctx.state, ctx.path, ctx.navigate, etc.
}
```

### ScreenContext

React context providing the current screen's route info, params, query, metadata, and focus state.

```ts
interface ScreenContextValue {
  route: Route;
  params: Record<string, string>;
  query: Record<string, string>;
  meta?: Record<string, unknown>;
  isFocused: boolean;
}
```

### NavigatorRenderer

Recursive component that renders the navigator tree (stack or tab views). Used internally by `NavigationProvider` but exported for advanced custom rendering.

### ScreenProvider

Wraps each screen with `ScreenContext`. Used internally to provide route info to hooks like `useParams()` and `useNavigationListener()`.

```ts
interface ScreenProviderProps {
  route: Route;
  meta?: Record<string, unknown>;
  isFocused?: boolean; // default: true
  children: React.ReactNode;
}
```
