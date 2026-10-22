/**
 * Tiny position-tracking layer on top of the History API.
 *
 * `popstate` doesn't tell us whether the user went back or forward, so every
 * entry we know about is stamped with a numeric index inside `history.state`.
 * Stamping uses replaceState only -> it NEVER adds or removes history entries.
 */

const INDEX_KEY = '__navIdx';

type PushListener = (newIndex: number) => void;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Index stored on a history state object, or null if the entry is unstamped. */
export function readIndex(state: unknown): number | null {
  if (isRecord(state)) {
    const value = state[INDEX_KEY];
    if (typeof value === 'number') return value;
  }
  return null;
}

function withIndex(state: unknown, index: number): unknown {
  if (state === null || state === undefined) return { [INDEX_KEY]: index };
  if (isRecord(state)) return { ...state, [INDEX_KEY]: index };
  return state; // primitive state can't be stamped; entry stays "unknown"
}

/**
 * Returns the current entry's index, stamping it first if needed.
 * `history.length - 1` is a correct guess when the user is at the top of the stack.
 */
export function ensureCurrentIndex(): number {
  const existing = readIndex(window.history.state);
  if (existing !== null) return existing;

  const index = window.history.length - 1;
  // Prototype method is always the native one (we only patch the instance).
  History.prototype.replaceState.call(
    window.history,
    withIndex(window.history.state, index),
    '',
  );
  return index;
}

/* ------------------------------------------------------------------ */
/* Ref-counted pushState/replaceState patch                            */
/* ------------------------------------------------------------------ */

const listeners = new Set<PushListener>();
let restorePatch: (() => void) | null = null;

function installPatch(): () => void {
  const history = window.history;
  const originalPush = history.pushState;
  const originalReplace = history.replaceState;

  history.pushState = function (state, unused, url) {
    const next = ensureCurrentIndex() + 1;
    originalPush.call(history, withIndex(state, next), unused, url);
    listeners.forEach((listener) => listener(next));
  };

  history.replaceState = function (state, unused, url) {
    const current = ensureCurrentIndex();
    originalReplace.call(history, withIndex(state, current), unused, url);
  };

  return () => {
    history.pushState = originalPush;
    history.replaceState = originalReplace;
  };
}

/**
 * Subscribe to app-driven navigations (router.push / history.pushState).
 * The patch is installed for the first subscriber and removed with the last,
 * so multiple hook instances and React StrictMode double-mounts are safe.
 */
export function subscribeToPushes(listener: PushListener): () => void {
  if (listeners.size === 0) restorePatch = installPatch();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      restorePatch?.();
      restorePatch = null;
    }
  };
}
