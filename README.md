# blaze-navigation

Blazingly fast & simple React Native navigation

> **Experimental** — This library is under active development. APIs may change between releases.

## Features

- Declarative route configuration
- Type-safe navigation with full path inference
- Stack and tab navigators (powered by `react-native-screens`)
- Nested navigators (stacks inside tabs, tabs inside stacks)
- Dynamic route parameters (`$paramName`)
- Global navigation functions (usable outside React components)
- Navigation event listeners
- Layouts and route guards

## Installation

```sh
npm install blaze-navigation react-native-screens react-native-safe-area-context
```

`react-native-screens` (>=4.0.0) and `react-native-safe-area-context` (>=5.0.0) are a required peer dependencies.

## Quick Start

### 1. Define your router

```ts
import { createRouter } from 'blaze-navigation';
import { FeedScreen } from './screens/FeedScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { DetailScreen } from './screens/DetailScreen';

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
    profile: {
      component: ProfileScreen,
      tabOptions: { title: 'Profile' },
    },
  },
});
```

### 2. Register types (optional but recommended)

```ts
declare module 'blaze-navigation' {
  interface Register {
    router: typeof router;
  }
}
```

This enables full type inference for `navigate()`, `<Link to="..." />`, and `useParams()`.

### 3. Render the provider

```ts
import { NavigationProvider } from 'blaze-navigation';

export default function App() {
  return <NavigationProvider router={router} />;
}
```

### 4. Navigate

```ts
import { navigate, goBack, Link } from 'blaze-navigation';

// From anywhere (including outside React components)
navigate('/feed/42');
goBack();

// Or use the Link component
<Link to="/feed/42">View Item</Link>;
```

## Examples

The [`example/`](example/) directory contains a demo app with four navigation patterns.

## Docs

See [DOCS.md](DOCS.md) for the full API reference.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT
