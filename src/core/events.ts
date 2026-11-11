/** Adapted from mitt's snapshot-dispatch pattern; unsubscribe is owned by the caller. */
export function createEvents<Events extends object>() {
  const target = new Map<keyof Events, Set<(event: never) => void>>();
  return {
    on<K extends keyof Events>(type: K, handler: (event: Events[K]) => void) {
      const handlers = target.get(type) ?? new Set<(event: never) => void>();
      const callback = handler as (event: never) => void;
      handlers.add(callback);
      target.set(type, handlers);
      let subscribed = true;
      return () => {
        if (!subscribed) return;
        subscribed = false;
        handlers.delete(callback);
        if (!handlers.size && target.get(type) === handlers) target.delete(type);
      };
    },
    emit<K extends keyof Events>(type: K, event: Events[K]) {
      for (const handler of [...(target.get(type) ?? [])]) handler(event as never);
    },
    clear() {
      target.clear();
    },
  };
}
export interface AppEvents {
  rendererStatus: { state: 'ready' | 'degraded' | 'failed' | 'lost' };
  selectionChanged: { id: string | null };
  balanceChanged: { money: number };
}
