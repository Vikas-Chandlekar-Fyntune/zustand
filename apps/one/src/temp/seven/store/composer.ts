// store/composer.ts
import { create, type StateCreator } from "zustand";

type MiddlewareEnhancer<T> = (
  creator: StateCreator<T, [], []>,
) => StateCreator<T, [], []>;

/**
 * Functional composer that applies middlewares top-to-bottom / outer-to-inner.
 */
export function composeMiddlewares<T extends object>(
  slice: StateCreator<T, [], []>,
  ...middlewares: MiddlewareEnhancer<T>[]
) {
  const enhancedSlice = middlewares.reduceRight(
    (acc, middleware) => middleware(acc),
    slice,
  );

  return create<T>()(enhancedSlice);
}
