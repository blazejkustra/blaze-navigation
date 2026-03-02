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
          [...navigatorPath, segment]
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

export function createRouter<TConfig extends RouterConfig>(
  config: TConfig
): RouterInstance<TConfig> {
  const patterns = flattenRoutes(config.routes, '', []);

  return { config, patterns };
}
