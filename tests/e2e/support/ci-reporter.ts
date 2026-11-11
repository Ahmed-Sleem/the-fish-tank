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
    // Emit as TAP-ish node:test failures so the runner annotates each one. A reporter's whole
    // job is writing to stdout, which is why the console rule is waived for this file only.
    this.failures.forEach((failure, index) => {
      // eslint-disable-next-line no-console -- a CI reporter exists to write to stdout
      console.log(`not ok ${String(index + 1)} - ${failure}`);
    });
  }
}

export default CiReporter;
