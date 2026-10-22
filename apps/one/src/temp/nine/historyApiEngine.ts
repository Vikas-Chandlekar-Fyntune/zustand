import { ensureCurrentIndex, readIndex, subscribeToPushes } from './historyIndex';
import type { Engine, NavigationDirection } from './types';

/**
 * Fallback engine (e.g. Firefox): relative history.go() on a stamped index.
 * The first press is reverted instantly; presses during an in-flight revert
 * are collapsed by a debounced re-check that reads the *actual* position.
 */
export const historyApiEngine: Engine = (ctx) => {
  let anchor = ensureCurrentIndex();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let isReverting = false;

  const cancelTimer = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  const revert = () => {
    timer = undefined;
    const current = readIndex(window.history.state) ?? anchor - 1;
    const delta = current - anchor;
    if (delta === 0) {
      isReverting = false;
      return;
    }
    isReverting = true;
    window.history.go(-delta);
  };

  const handlePopState = (event: PopStateEvent) => {
    const landed = readIndex(event.state) ?? anchor - 1;

    if (landed === anchor) {
      // Landing of our own revert: router is already here, keep it asleep.
      if (isReverting) event.stopImmediatePropagation();
      isReverting = false;
      cancelTimer();
      return;
    }

    const direction: NavigationDirection = landed < anchor ? 'back' : 'forward';
    if (!ctx.isBlocked(direction)) {
      anchor = landed;
      cancelTimer();
      return;
    }

    event.stopImmediatePropagation();
    ctx.onBlocked(direction);
    cancelTimer();

    if (!isReverting) revert();
    else timer = setTimeout(revert, ctx.getSettleDelayMs());
  };

  const unsubscribePushes = subscribeToPushes((newIndex) => {
    anchor = newIndex;
    isReverting = false;
    cancelTimer();
  });

  return {
    handlePopState,
    stop: () => {
      unsubscribePushes();
      cancelTimer();
    },
  };
};
