/**
 * Surfaces Playwright failures through `node:test` results.
 *
 * GitHub shows a failed job as "Process completed with exit code 1" when the raw log cannot be
 * downloaded, but check-run **annotations** are always readable through the API. `node --test`
 * writes its results to stdout in a format the runner turns into annotations, so each failing
 * test arrives as its own named failure with its assertion message attached.
 *
 * Diagnostics only: this never changes what passes or fails.
 */
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class CiReporter implements Reporter {
  private readonly failures: string[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status !== 'failed' && result.status !== 'timedOut') return;
    const errors = result.errors.map((error) => error.message ?? error.value ?? '').join(' | ');
    // Keep each line short: annotations are truncated, and the assertion text is the useful part.
    const text = errors.replaceAll('\n', ' ').replaceAll(/\s+/g, ' ').slice(0, 600);
    this.failures.push(`${test.title.slice(0, 90)} :: ${text}`);
  }

  onEnd(): void {
    if (!this.failures.length) return;
    // Workflow commands are the only stdout the runner reliably turns into annotations.
    for (const failure of this.failures) {
      // eslint-disable-next-line no-console -- a CI reporter exists to write to stdout
      console.log(`::error title=Playwright failure::${failure}`);
    }
  }
}

export default CiReporter;
