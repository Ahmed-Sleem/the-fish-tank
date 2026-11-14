/** Smoke the actual production build at the GitHub Pages project subpath. */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  expect: { timeout: 10000 },
  /*
   * Two projects, two workers, one test at a time each.
   *
   * Every spec boots a real WebGL tank and CI renders it in software, so *height* of concurrency
   * is what starved the pages: four tanks at once on a two-core runner blew ceilings on tests
   * whose assertions were fine. One worker per project keeps at most two tanks alive and still
   * uses both cores.
   *
   * `fullyParallel: false` matters more than the worker count: it runs each file's tests in
   * sequence inside its project, so the two heavy specs stop competing with their own siblings.
   * Serialising the entire suite — one worker for both projects — fixed the flakiness but pushed
   * the job past its 15-minute ceiling, which is a different way of being unusable.
   */
  fullyParallel: false,
  ...(process.env.CI ? { workers: 2 } : {}),
  forbidOnly: Boolean(process.env.CI),
  // No retries: a test that needs a second attempt is telling us something. Keeping concurrency
  // low is the fix; masking a failure is not.
  retries: 0,
  reporter: process.env.CI ? [['list'], ['./tests/e2e/support/ci-reporter.ts']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/the-fish-tank/',
    // `load` waits for every asset, and a fresh WebGL page on a shared CI core is a real second
    // or three slower than a laptop. The default 30s is a tight ceiling for an honest wait.
    navigationTimeout: 60000,
    launchOptions: {
      ...(process.env.CHROMIUM_EXECUTABLE_PATH
        ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH }
        : {}),
      args: [
        '--no-sandbox',
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
      ],
    },
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], reducedMotion: 'reduce' } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/the-fish-tank/',
    reuseExistingServer: !process.env.CI,
  },
});
