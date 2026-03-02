import type { RoutePattern } from './types';

export interface PathMatch {
  pattern: RoutePattern;
  params: Record<string, string>;
}

/**
 * Matches a URL path string against registered route patterns, extracting dynamic params.
 * Returns the best match (static segments preferred over dynamic) or null.
 *
 * @param path - The URL path to match (e.g. "/profile/123").
 * @param patterns - The flattened route patterns from the router instance.
 * @returns The best matching pattern with extracted params, or null if no match.
 */
export function matchPath(
  path: string,
  patterns: RoutePattern[]
): PathMatch | null {
  // Normalize: remove trailing slash, ensure leading slash
  const normalized = '/' + path.split('/').filter(Boolean).join('/');
  const inputSegments = normalized.split('/').filter(Boolean);

  let bestMatch: PathMatch | null = null;
  let bestScore = -1;

  for (const pattern of patterns) {
    if (pattern.segments.length !== inputSegments.length) {
      continue;
    }

    let score = 0;
    let matched = true;
    const params: Record<string, string> = {};

    for (let i = 0; i < pattern.segments.length; i++) {
      const seg = pattern.segments[i]!;
      const input = inputSegments[i]!;

      if (seg.startsWith('$')) {
        // Dynamic segment
        params[seg.slice(1)] = input;
        score += 1;
      } else if (seg === input) {
        // Static exact match
        score += 2;
      } else {
        matched = false;
        break;
      }
    }

    if (matched && score > bestScore) {
      bestScore = score;
      bestMatch = { pattern, params };
    }
  }

  return bestMatch;
}
