import type {
  RouterInstance,
  RoutePattern,
  RouteConfig,
  NavigatorSegment,
} from './types';

function flattenRoutes(
  routes: Record<string, RouteConfig>,
  prefix: string,
  navigatorPath: NavigatorSegment[]
): RoutePattern[] {
  const patterns: RoutePattern[] = [];

  for (const [name, config] of Object.entries(routes)) {
    const path = `${prefix}/${name}`;
    const segments = path.split('/').filter(Boolean);
    const paramNames = segments
      .filter((s) => s.startsWith('$'))
      .map((s) => s.slice(1));

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
        });
      }

      // Recurse into children with a new navigator segment
      for (const [childName, childConfig] of Object.entries(config.children)) {
        const segment: NavigatorSegment = {
          name,
          type: config.navigator,
          childName,
        };
        const childPatterns = flattenRoutes(
          { [childName]: childConfig },
          path,
          [...navigatorPath, segment]
        );
        patterns.push(...childPatterns);
      }
    } else if (config.children && !config.navigator) {
      // Route with child path segments but no nested navigator —
      // children belong to the parent navigator, just with deeper paths
      if (config.component) {
        patterns.push({
          path,
          segments,
          paramNames,
          routeName: name,
          routeConfig: config,
          navigatorPath,
        });
      }

      // Recurse into children, updating the parent navigator segment's childName
      // so navigation pushes/switches to the child route correctly
      for (const [childName, childConfig] of Object.entries(config.children)) {
        const updatedPath = navigatorPath.map((seg, i) =>
          i === navigatorPath.length - 1 ? { ...seg, childName } : seg
        );
        const childPatterns = flattenRoutes(
          { [childName]: childConfig },
          path,
          updatedPath
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
      });
    }
  }

  return patterns;
}

/**
 * Creates a router instance from a route configuration, flattening the route tree
 * into matchable patterns with pre-computed navigator paths.
 *
 * The root config is a navigator (with `navigator` and `children`). It contributes
 * no path segment — child paths start from `/`.
 *
 * @param config - The root route config defining the navigator, children, and components.
 * @returns A router instance containing the config and flattened route patterns.
 *
 * @example
 * ```ts
 * const router = createRouter({
 *   navigator: 'tabs',
 *   children: {
 *     feed: { component: FeedScreen },
 *     profile: { component: ProfileScreen },
 *   },
 * });
 * ```
 */
export function createRouter<TConfig extends RouteConfig>(
  config: TConfig
): RouterInstance<TConfig> {
  if (!config.children || !config.navigator) {
    throw new Error(
      'Root config must have both "navigator" and "children" properties'
    );
  }

  // Root navigator contributes no path segment — flatten from children with empty prefix
  const rootNavigatorPath: NavigatorSegment[] = [];
  const patterns: RoutePattern[] = [];

  for (const [childName, childConfig] of Object.entries(config.children)) {
    const segment: NavigatorSegment = {
      name: '/',
      type: config.navigator,
      childName,
    };
    const childPatterns = flattenRoutes({ [childName]: childConfig }, '', [
      ...rootNavigatorPath,
      segment,
    ]);
    patterns.push(...childPatterns);
  }

  return { config, patterns };
}
