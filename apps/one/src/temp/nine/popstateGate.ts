/**
 * Single, early-registered popstate listener.
 *
 * Why this exists: listeners on `window` run in REGISTRATION order (the capture
 * flag does not help on the target itself). A router that registered first
 * would see a blocked popstate before our hook could stop it and would render
 * the blocked page. This module registers ONE listener as a side effect of
 * being imported (i.e. before any component mounts) and forwards events to
 * whichever blocker is currently active. Enabling/disabling never re-registers
 * the listener, so it keeps its place at the front of the line.
 */
type Handler = (event: PopStateEvent) => void;

const handlers: Handler[] = [];
let registered = false;

function register(): void {
  if (registered || typeof window === 'undefined') return;
  registered = true;
  window.addEventListener(
    'popstate',
    (event) => handlers[handlers.length - 1]?.(event),
    true,
  );
}

register(); // side effect on import

export function setActivePopStateHandler(handler: Handler): () => void {
  register(); // late fallback if the module was somehow evaluated on the server
  handlers.push(handler);
  return () => {
    const i = handlers.lastIndexOf(handler);
    if (i !== -1) handlers.splice(i, 1);
  };
}
