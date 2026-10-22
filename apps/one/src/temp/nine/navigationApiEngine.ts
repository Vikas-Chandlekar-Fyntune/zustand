import type { Engine, NavigationDirection } from './types';

/* Minimal typings: the Navigation API isn't in every TS lib version. */
interface NavEntry {
  readonly key: string;
  readonly index: number;
}
interface NavigateEventLike extends Event {
  readonly navigationType: 'push' | 'replace' | 'reload' | 'traverse';
  readonly destination: { readonly index: number };
}
interface CurrentEntryChangeEventLike extends Event {
  readonly navigationType: 'push' | 'replace' | 'reload' | 'traverse' | null;
}
interface NavigationLike extends EventTarget {
  readonly currentEntry: NavEntry | null;
  traverseTo(key: string): { committed: Promise<unknown>; finished: Promise<unknown> };
}

const getNavigation = (): NavigationLike | undefined =>
  typeof window === 'undefined'
    ? undefined
    : (window as unknown as { navigation?: NavigationLike }).navigation;

export const isNavigationApiSupported = (): boolean =>
  Boolean(getNavigation()?.currentEntry);

/**
 * Preferred engine (Chromium, Safari 26+).
 *
 * - If the browser lets us cancel the traversal, we cancel it in the `navigate`
 *   event: the URL never changes at all.
 * - Otherwise we revert with `traverseTo(anchorKey)`. It targets an ABSOLUTE
 *   entry, so firing it on every popstate during a rapid burst is idempotent
 *   and can never overshoot (unlike relative history.go()).
 */
export const navigationApiEngine: Engine = (ctx) => {
  const navigation = getNavigation();
  if (!navigation?.currentEntry) {
    return { handlePopState: () => undefined, stop: () => undefined };
  }

  let anchor: NavEntry = navigation.currentEntry;
  // True while a revert we issued hasn't produced its landing popstate yet.
  let revertPending = false;

  const directionOf = (index: number): NavigationDirection =>
    index < anchor.index ? 'back' : 'forward';

  // 1) Try to stop the traversal before it happens.
  const handleNavigate = (event: Event) => {
    const e = event as NavigateEventLike;
    if (e.navigationType !== 'traverse' || !e.cancelable) return;
    if (e.destination.index === anchor.index) return;

    const direction = directionOf(e.destination.index);
    if (!ctx.isBlocked(direction)) return;

    e.preventDefault();
    ctx.onBlocked(direction);
  };

  // 2) App-driven pushes (router.push) legitimately move the anchor.
  const handleEntryChange = (event: Event) => {
    const e = event as CurrentEntryChangeEventLike;
    if (e.navigationType === 'push' && navigation.currentEntry) {
      anchor = navigation.currentEntry;
      revertPending = false;
    }
  };

  // 3) Traversal couldn't be cancelled -> snap back to the anchor, absolutely.
  const handlePopState = (event: PopStateEvent) => {
    const current = navigation.currentEntry;
    if (!current) return;

    if (current.key === anchor.key) {
      // Landing of our own revert: the router is already on this entry, so
      // don't wake it up for nothing.
      if (revertPending) {
        revertPending = false;
        event.stopImmediatePropagation();
      }
      return;
    }

    const direction = directionOf(current.index);
    if (!ctx.isBlocked(direction)) {
      anchor = current; // allowed direction: accept and re-anchor
      return;
    }

    event.stopImmediatePropagation(); // hide it from routers listening on window
    ctx.onBlocked(direction);
    revertPending = true;

    const { committed, finished } = navigation.traverseTo(anchor.key);
    committed.catch(() => undefined); // superseded by a newer press: expected
    finished.catch(() => undefined);
  };

  navigation.addEventListener('navigate', handleNavigate);
  navigation.addEventListener('currententrychange', handleEntryChange);

  return {
    handlePopState,
    stop: () => {
      navigation.removeEventListener('navigate', handleNavigate);
      navigation.removeEventListener('currententrychange', handleEntryChange);
    },
  };
};
