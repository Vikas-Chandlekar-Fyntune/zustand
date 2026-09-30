import type { Codec } from "./codecs";

export type Schema<T> = { [K in keyof T]: Codec<T[K]> };

const keysOf = <T extends object>(schema: Schema<T>) =>
  Object.keys(schema) as Array<keyof T & string>;

export function getDefaults<T extends object>(schema: Schema<T>): T {
  const out = {} as T;
  for (const key of keysOf(schema)) out[key] = schema[key].defaultValue;
  return out;
}

export function parseState<T extends object>(
  schema: Schema<T>,
  search: string | URLSearchParams,
): T {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const out = {} as T;
  for (const key of keysOf(schema)) out[key] = schema[key].parse(params.get(key));
  return out;
}

/**
 * Writes schema-owned keys into a copy of `base`.
 * Params NOT in the schema (utm, tab, etc.) are preserved.
 */
export function writeState<T extends object>(
  schema: Schema<T>,
  state: T,
  base: URLSearchParams | string = "",
): URLSearchParams {
  const params = new URLSearchParams(base);
  for (const key of keysOf(schema)) {
    const serialized = schema[key].serialize(state[key]);
    if (serialized === null) params.delete(key);
    else params.set(key, serialized);
  }
  return params;
}

export function buildURL(pathname: string, params: URLSearchParams, hash = "") {
  const qs = params.toString();
  return `${pathname}${qs ? `?${qs}` : ""}${hash}`;
}
