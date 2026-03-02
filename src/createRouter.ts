import type {
  RouterConfig,
  RouterInstance,
  RoutePattern,
  RouteConfig,
  NavigatorSegment,
} from './types';

function flattenRoutes(
  routes: Record<string, RouteConfig>,
  prefix: string,
  navigatorPath: NavigatorSegment[],
  ancestorGuards: Array<() => boolean>
): RoutePattern[] {
  const patterns: RoutePattern[] = [];

  for (const [name, config] of Object.entries(routes)) {
    const path = `${prefix}/${name}`;
    const segments = path.split('/').filter(Boolean);
    const paramNames = segments
      .filter((s) => s.startsWith('$'))
      .map((s) => s.slice(1));

    const guards = config.guard
      ? [...ancestorGuards, config.guard]
      : [...ancestorGuards];

    if (config.children && config.navigator) {
      // If this navigator also has a component, create an "index" leaf pattern for it
      if (config.component) {
        patterns.push({
          path,
          segments,
          paramNames,
          routeName: name,
          routeConfig: config,
          navigatorPath,
          guards,
        });
      }

      // Recurse into children
      for (const [childName, childConfig] of Object.entries(config.children)) {
        const segment: NavigatorSegment = {
          name,
          type: config.navigator,
          childName,
        };
        const childPatterns = flattenRoutes(
          { [childName]: childConfig },
          path,
          [...navigatorPath, segment],
          guards
        );
        patterns.push(...childPatterns);
      }
    } else {
      // Leaf route
      patterns.push({
        path,
        segments,
        paramNames,
        routeName: name,
        routeConfig: config,
        navigatorPath,
        guards,
      });
    }
  }

  return patterns;
}

/**
 * Returns whether a route pattern is accessible based on all guards in its ancestor chain.
 */
export function isRouteAccessible(pattern: RoutePattern): boolean {
  return pattern.guards.every((g) => g());
}

/**
 * Creates a router instance from a route configuration, flattening the route tree
 * into matchable patterns with pre-computed navigator paths.
 *
 * @param config - The router configuration defining routes, components, and navigators.
 * @returns A router instance containing the config and flattened route patterns.
 *
 * @example
 * ```ts
 * const router = createRouter({
 *   routes: {
 *     home: { component: HomeScreen },
 *     profile: { component: ProfileScreen },
 *   },
 * });
 * ```
 */
export function createRouter<TConfig extends RouterConfig>(
  config: TConfig
): RouterInstance<TConfig> {
  const patterns = flattenRoutes(config.routes, '', [], []);

  return { config, patterns };
}
