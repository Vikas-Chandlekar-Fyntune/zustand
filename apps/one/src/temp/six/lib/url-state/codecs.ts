export interface Codec<T> {
  defaultValue: T;
  /** Raw query string value (or null if missing) -> valid value. Must never throw; fall back to default. */
  parse(raw: string | null): T;
  /** Value -> query string value. Return null to remove the param (e.g. when it equals the default). */
  serialize(value: T): string | null;
}

export function createCodec<T>(
  defaultValue: T,
  parse: (raw: string) => T | undefined,
  toString: (value: T) => string,
  isEqual: (a: T, b: T) => boolean = Object.is,
): Codec<T> {
  return {
    defaultValue,
    parse: (raw) => {
      if (raw === null || raw === "") return defaultValue;
      const parsed = parse(raw);
      return parsed === undefined ? defaultValue : parsed;
    },
    serialize: (value) =>
      isEqual(value, defaultValue) || value === undefined ? null : toString(value),
  };
}

export const stringField = (defaultValue = "") =>
  createCodec<string>(defaultValue, (raw) => raw, (v) => v);

export const numberField = (
  defaultValue: number,
  opts: { min?: number; max?: number; integer?: boolean } = {},
) =>
  createCodec<number>(
    defaultValue,
    (raw) => {
      const n = opts.integer ? parseInt(raw, 10) : Number(raw);
      if (!Number.isFinite(n)) return undefined;
      if (opts.min !== undefined && n < opts.min) return undefined;
      if (opts.max !== undefined && n > opts.max) return undefined;
      return n;
    },
    String,
  );

export const booleanField = (defaultValue = false) =>
  createCodec<boolean>(
    defaultValue,
    (raw) =>
      raw === "1" || raw === "true" ? true : raw === "0" || raw === "false" ? false : undefined,
    (v) => (v ? "1" : "0"),
  );

export function enumField<const V extends readonly string[]>(
  values: V,
  defaultValue: V[number],
) {
  return createCodec<V[number]>(
    defaultValue,
    (raw) => (values.includes(raw) ? (raw as V[number]) : undefined),
    (v) => v,
  );
}

export const stringArrayField = (defaultValue: string[] = [], separator = ",") =>
  createCodec<string[]>(
    defaultValue,
    (raw) => raw.split(separator).filter(Boolean),
    (v) => v.join(separator),
    (a, b) => a.length === b.length && a.every((x, i) => x === b[i]),
  );
