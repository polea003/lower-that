// Minimal helpers kept intentionally simple. Prefer plain async/await in modules.

// Simple pipe kept for occasional synchronous composition.
export const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

// Sleep helper for delays
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);

export const curry = (fn) => (...args) => 
  args.length >= fn.length ? fn(...args) : (...nextArgs) => curry(fn)(...args, ...nextArgs);

export const partial = (fn, ...partialArgs) => (...remainingArgs) => fn(...partialArgs, ...remainingArgs);

export const maybe = (fn) => (value) => value != null ? fn(value) : null;

export const either = (leftFn) => (rightFn) => (value) => 
  value instanceof Error ? leftFn(value) : rightFn(value);

export const asyncPipe = (...fns) => (value) => 
  fns.reduce((acc, fn) => acc.then(fn), Promise.resolve(value));

export const tryCatch = (fn) => async (...args) => {
  try {
    return { success: true, data: await fn(...args) };
  } catch (error) {
    return { success: false, error };
  }
};

export const delay = (ms) => () => new Promise(resolve => setTimeout(resolve, ms));

export const tap = (fn) => (value) => {
  fn(value);
  return value;
};
