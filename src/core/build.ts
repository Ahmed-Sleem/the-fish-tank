/** Normalize the public version label without exposing environment variables. */
import { strings } from '../config/strings.en';

export function buildLabel(revision: string): string {
  return /^[a-f0-9]{7,40}$/i.test(revision)
    ? revision.slice(0, 7).toLowerCase()
    : strings.localRevision;
}
