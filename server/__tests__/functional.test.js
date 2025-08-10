import { describe, it, expect } from 'vitest';
import { pipe, compose, curry, partial, maybe, either, asyncPipe, tryCatch, delay, tap, sleep } from '../src/utils/functional.js';

describe('utils/functional', () => {
  it('pipe and compose work', () => {
    const inc = (x) => x + 1;
    const double = (x) => x * 2;
    expect(pipe(inc, double)(2)).toBe(6);
    expect(compose(double, inc)(2)).toBe(6);
  });

  it('curry and partial work', () => {
    const add = (a, b, c) => a + b + c;
    const curried = curry(add);
    expect(curried(1)(2)(3)).toBe(6);
    const add1 = partial(add, 1);
    expect(add1(2, 3)).toBe(6);
  });

  it('maybe, either, tap work', () => {
    const v = maybe((x) => x * 2)(3);
    expect(v).toBe(6);
    const nv = maybe((x) => x * 2)(null);
    expect(nv).toBeNull();
    const left = (e) => 'err';
    const right = (x) => x + 1;
    expect(either(left)(right)(2)).toBe(3);
    expect(either(left)(right)(new Error('x'))).toBe('err');
    let tapped = 0; tap(() => { tapped++; })(42);
    expect(tapped).toBe(1);
  });

  it('asyncPipe, tryCatch, delay, sleep work', async () => {
    const f = asyncPipe(
      async (x) => x + 1,
      async (x) => x * 2,
    );
    expect(await f(2)).toBe(6);

    const good = tryCatch(async (x) => x + 1);
    const bad = tryCatch(async () => { throw new Error('boom'); });
    expect(await good(1)).toEqual({ success: true, data: 2 });
    const res = await bad();
    expect(res.success).toBe(false);

    const t0 = Date.now();
    await delay(1)();
    await sleep(1);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(1);
  });
});
