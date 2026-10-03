// shared/url-state/url-params.ts

export function getUrlSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function getUrlParam(queryKey: string): string | null {
  return getUrlSearchParams().get(queryKey);
}

export function updateUrlParam(
  queryKey: string,
  value: string | null,
): URLSearchParams {
  const params = getUrlSearchParams();

  if (value === null) {
    params.delete(queryKey);
    return params;
  }

  params.set(queryKey, value);

  return params;
}

export function buildUrl(params: URLSearchParams): string {
  const query = params.toString();

  return query
    ? `${window.location.pathname}?${query}${window.location.hash}`
    : `${window.location.pathname}${window.location.hash}`;
}
