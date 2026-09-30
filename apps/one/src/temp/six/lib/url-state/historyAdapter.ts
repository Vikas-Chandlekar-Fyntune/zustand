export interface HistoryAdapter {
  getLocation(): { pathname: string; search: string; hash: string };
  push(url: string, state?: unknown): void;
  replace(url: string, state?: unknown): void;
  /** Called on back/forward. Returns unsubscribe. */
  subscribe(listener: () => void): () => void;
}

export const browserHistoryAdapter: HistoryAdapter = {
  getLocation: () =>
    typeof window === "undefined"
      ? { pathname: "/", search: "", hash: "" }
      : {
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
        },
  push: (url, state) => window.history.pushState(state ?? null, "", url),
  replace: (url, state) => window.history.replaceState(state ?? null, "", url),
  subscribe: (listener) => {
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  },
};
