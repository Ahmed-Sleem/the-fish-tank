/** Smoke the actual production build at the GitHub Pages project subpath. */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  expect: { timeout: 10000 },
  /*
   * One spec file at a time, in one worker.
   *
   * Every spec here boots a real WebGL tank, and CI renders it in software. Running the desktop
   * and mobile projects in parallel put four tanks on a two-core runner at once, which starved
   * pages badly enough to blow 30s ceilings on tests whose assertions were fine. The suite takes
   * longer this way and tells the truth; the alternative was a flaky pipeline that had to be
   * re-run until the machine happened to keep up.
   */
  fullyParallel: false,
  ...(process.env.CI ? { workers: 1 } : {}),
  forbidOnly: Boolean(process.env.CI),
  // No retries: a test that needs a second attempt is telling us something. Serialising the
  // suite is the fix; masking a failure is not.
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
