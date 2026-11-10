import { afterEach, expect, it, vi } from 'vitest';
import { appConfig } from '../../src/config/app.config';
import { waitForStartup } from '../../src/ui/shared/loading';

afterEach(() => vi.useRealTimers());
it('holds a fast startup for the full minimum', async () => {
  vi.useFakeTimers();
  let finished = false;
  const done = waitForStartup(Promise.resolve(), appConfig.loading.minimumMs).then(() => {
    finished = true;
  });
  await vi.advanceTimersByTimeAsync(2999);
  expect(finished).toBe(false);
  await vi.advanceTimersByTimeAsync(1);
  await done;
  expect(finished).toBe(true);
});
it('does not hide a slow startup when the minimum expires', async () => {
  vi.useFakeTimers();
  let ready = () => {};
  let finished = false;
  const startup = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const done = waitForStartup(startup, 3000).then(() => {
    finished = true;
  });
  await vi.advanceTimersByTimeAsync(6000);
  expect(finished).toBe(false);
  ready();
  await done;
  expect(finished).toBe(true);
});
