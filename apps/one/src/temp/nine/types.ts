export type NavigationDirection = 'back' | 'forward';

export interface UseNavigationBlockerOptions {
  /** Master switch. When false, the hook is fully inert and history is untouched. */
  enabled?: boolean;
  /** Block the browser's Back button. Default: true */
  blockBack?: boolean;
  /** Block the browser's Forward button. Default: true */
  blockForward?: boolean;
  /** Fired for every blocked attempt (e.g. show a toast). */
  onBlocked?: (direction: NavigationDirection) => void;
  /**
   * Fallback engine only (browsers without the Navigation API): quiet period
   * (ms) used to collapse rapid presses into one correction. Default: 40
   */
  settleDelayMs?: number;
}

/** What an engine needs from the hook. */
export interface EngineContext {
  isBlocked: (direction: NavigationDirection) => boolean;
  onBlocked: (direction: NavigationDirection) => void;
  getSettleDelayMs: () => number;
}

export interface EngineInstance {
  /** Called by the popstate gate for every popstate while this engine is active. */
  handlePopState: (event: PopStateEvent) => void;
  stop: () => void;
}

export type Engine = (ctx: EngineContext) => EngineInstance;
