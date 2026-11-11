/**
 * The ink purse: one number the player can always trust.
 *
 * While a drawing is in progress its price is *reserved*, so the wallet can never be spent twice
 * by two in-flight drawings, and cancelling returns every coin. Nothing here rounds or estimates
 * differently from `ink.ts`; the purse only tracks how much is left and how much is held.
 */

export interface PurseState {
  /** Coins actually owned. */
  readonly balance: number;
  /** Coins held by drawings that are underway but not yet committed. */
  readonly reserved: number;
}

export interface Purse {
  /** Spendable right now: what is owned minus what is held. */
  readonly available: () => number;
  readonly state: () => PurseState;
  /** Hold coins for an in-flight drawing. Refuses rather than overdrawing. */
  readonly reserve: (amount: number) => boolean;
  /** Turn a held amount into a real charge. */
  readonly commit: (amount: number) => boolean;
  /** Return held coins that were never spent. */
  readonly release: (amount: number) => void;
  /** Give coins back, e.g. when undoing a committed stroke. */
  readonly refund: (amount: number) => void;
  /** Add earnings. */
  readonly earn: (amount: number) => void;
}

function clean(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.floor(amount);
}

export function createPurse(initial: number): Purse {
  let balance = clean(initial);
  let reserved = 0;

  const available = (): number => Math.max(0, balance - reserved);

  return {
    available,
    state: () => ({ balance, reserved }),
    reserve: (amount) => {
      const want = clean(amount);
      if (want === 0) return true;
      if (want > available()) return false;
      reserved += want;
      return true;
    },
    commit: (amount) => {
      const spent = clean(amount);
      if (spent > reserved) return false;
      reserved -= spent;
      balance -= spent;
      return true;
    },
    release: (amount) => {
      reserved = Math.max(0, reserved - clean(amount));
    },
    refund: (amount) => {
      balance += clean(amount);
    },
    earn: (amount) => {
      balance += clean(amount);
    },
  };
}
