/* eslint-disable @typescript-eslint/no-unused-vars */
import { createRouter } from '../createRouter';
import type { ExtractPaths, ReplaceParams } from '../types';

// --- Router fixture: tabs with nested stacks and dynamic params ---
const tabsWithStacksRouter = createRouter({
  navigator: 'tabs',
  children: {
    feed: {
      navigator: 'stack',
      children: {
        list: { component: () => null },
        $itemId: { component: () => null },
      },
    },
    profile: { component: () => null },
  },
});

type ValidPaths = ReplaceParams<
  ExtractPaths<(typeof tabsWithStacksRouter)['config']['children']>
>;

// --- Type test helpers ---
type IsExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

// --- Tests ---

// 1. Valid static paths should be accepted
const _feedPath: ValidPaths = '/feed';
const _feedListPath: ValidPaths = '/feed/list';
const _profilePath: ValidPaths = '/profile';

// 2. Dynamic param paths accept any string value
const someId = 'abc-123';
const _dynamicPath: ValidPaths = `/feed/${someId}`;

// 3. Invalid paths should fail at compile time
// @ts-expect-error — '/nonexistent' is not a valid route
const _bad1: ValidPaths = '/nonexistent';
// @ts-expect-error — '/profile/list' is wrong nesting (profile has no children)
const _bad2: ValidPaths = '/profile/list';
// @ts-expect-error — bare '/' is not a valid path
const _bad3: ValidPaths = '/';
// @ts-expect-error — missing leading slash
const _bad4: ValidPaths = 'feed';

// 4. Type equality check — ValidPaths is exactly the expected union
type Expected = '/feed' | '/feed/list' | `/feed/${string}` | '/profile';
type _CheckExact = IsExact<ValidPaths, Expected> extends true ? true : never;
const _check: _CheckExact = true;

// 5. Trivial runtime test so Jest reports the file
test('ValidPaths type tests compile successfully', () => {
  expect(_check).toBe(true);
  expect(_feedPath).toBe('/feed');
  expect(_feedListPath).toBe('/feed/list');
  expect(_profilePath).toBe('/profile');
  expect(_dynamicPath).toBe(`/feed/${someId}`);
});
