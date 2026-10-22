import { useEffect, useRef } from 'react';
import { historyApiEngine } from './historyApiEngine';
import { isNavigationApiSupported, navigationApiEngine } from './navigationApiEngine';
import { subscribeToPushes } from './historyIndex';
import { setActivePopStateHandler } from './popstateGate';
import type { EngineContext, UseNavigationBlockerOptions } from './types';

const DEFAULT_SETTLE_DELAY_MS = 40;

/**
 * Blocks the browser Back / Forward buttons while `enabled` is true.
 *
 * - No sentinel entries are pushed, so history is never modified or truncated:
 *   toggling enabled false -> true -> false keeps back/forward history intact.
 * - Uses the Navigation API when available (absolute, overshoot-free reverts),
 *   and falls back to a stamped-index History API engine otherwise.
 */
export function useNavigationBlocker({
  enabled = true,
  blockBack = true,
  blockForward = true,
  onBlocked,
  settleDelayMs = DEFAULT_SETTLE_DELAY_MS,
}: UseNavigationBlockerOptions = {}): void {
  // Latest-value ref: option changes never tear down an active lock.
  const optionsRef = useRef({ blockBack, blockForward, onBlocked, settleDelayMs });
  optionsRef.current = { blockBack, blockForward, onBlocked, settleDelayMs };

  // Fallback engine only: keep entries stamped even while disabled.
  useEffect(() => {
    if (typeof window === 'undefined' || isNavigationApiSupported()) return;
    return subscribeToPushes(() => undefined);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const ctx: EngineContext = {
      isBlocked: (direction) =>
        direction === 'back'
          ? optionsRef.current.blockBack
          : optionsRef.current.blockForward,
      onBlocked: (direction) => optionsRef.current.onBlocked?.(direction),
      getSettleDelayMs: () => optionsRef.current.settleDelayMs,
    };

    const engine = isNavigationApiSupported() ? navigationApiEngine : historyApiEngine;
    const instance = engine(ctx);
    const release = setActivePopStateHandler(instance.handlePopState);

    return () => {
      release();
      instance.stop();
    };
  }, [enabled]);
}
