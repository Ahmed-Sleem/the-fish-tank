/** Every icon is defined exactly once, here, as a 24×24 stroke path set.
 * Icons inherit `currentColor` and never carry their own fill or size, so they cannot
 * drift from the theme. A duplicate or a hand-written inline SVG fails the architecture check.
 */

const paths = {
  settings: [
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  ],
  expand: [
    'M8 3H5a2 2 0 0 0-2 2v3',
    'M16 3h3a2 2 0 0 1 2 2v3',
    'M16 21h3a2 2 0 0 0 2-2v-3',
    'M8 21H5a2 2 0 0 1-2-2v-3',
  ],
  // A brush: the one action the tank offers besides settings.
  brush: [
    'M4 20c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4h-1.5',
    'M9.5 15.5 19 6a2.1 2.1 0 0 0-3-3L6.5 12.5',
  ],
  collapse: [
    'M3 8h3a2 2 0 0 0 2-2V3',
    'M21 8h-3a2 2 0 0 1-2-2V3',
    'M21 16h-3a2 2 0 0 0-2 2v3',
    'M3 16h3a2 2 0 0 1 2 2v3',
  ],
} as const;

export type IconName = keyof typeof paths;
export const iconNames = Object.keys(paths) as IconName[];

/** Single source for icon lookup: returns the path list, never markup. */
export function iconPaths(name: IconName): readonly string[] {
  return paths[name];
}
