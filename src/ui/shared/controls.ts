/** Shared native controls: labels/text only, no unsafe markup or custom focus trap. */
import { element } from './dom';
export function button(label: string, action: () => void, signal: AbortSignal) {
  const node = element('button', 'ui-button', label);
  node.type = 'button';
  node.addEventListener('click', action, { signal });
  return node;
}
/** A labelled group of native tab stops: do not claim ARIA toolbar without roving focus. */
export function toolbar(label: string, controls: HTMLElement[]) {
  const node = element('div', 'ui-toolbar');
  node.setAttribute('role', 'group');
  node.setAttribute('aria-label', label);
  node.append(...controls);
  return node;
}
export function stat(label: string, value: string) {
  const node = element('dl', 'ui-stat');
  const output = element('dd', '', value);
  node.append(element('dt', '', label), output);
  return {
    node,
    update(next: string) {
      output.textContent = next;
    },
  };
}
let dialogId = 0;
export function dialog(
  title: string,
  closeLabel: string,
  content: HTMLElement[],
  signal: AbortSignal,
) {
  const node = element('dialog', 'ui-dialog');
  const heading = element('h2', 'dialog-title', title);
  heading.id = `shared-dialog-${String(++dialogId)}`;
  node.setAttribute('aria-labelledby', heading.id);
  let returnFocus: HTMLElement | null = null;
  const close = button(
    closeLabel,
    () => {
      node.close();
    },
    signal,
  );
  node.append(heading, ...content, close);
  node.addEventListener(
    'close',
    () => {
      if (returnFocus?.isConnected) returnFocus.focus();
    },
    { signal },
  );
  const dispose = () => {
    if (node.open) node.close();
    node.remove();
  };
  signal.addEventListener('abort', dispose, { once: true });
  if (signal.aborted) dispose();
  return {
    node,
    open(trigger: HTMLElement) {
      if (signal.aborted || node.open) return;
      returnFocus = trigger;
      node.showModal();
      close.focus();
    },
  };
}
