/** Shared native controls: labels/text only, no unsafe markup or custom focus trap.
 * Every control the product shows is built here once and reused; a screen may never
 * hand-roll a button, dialog or field of its own.
 */
import { element } from './dom';
import { iconPaths } from './icons';
import type { IconName } from './icons';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function button(label: string, action: () => void, signal: AbortSignal) {
  const node = element('button', 'ui-button', label);
  node.type = 'button';
  node.addEventListener('click', action, { signal });
  return node;
}

/** Icon-only control. `aria-label` is mandatory: an unlabelled icon is unusable by screen readers. */
export function iconButton(name: IconName, label: string, action: () => void, signal: AbortSignal) {
  const node = element('button', 'ui-icon-button');
  node.type = 'button';
  node.setAttribute('aria-label', label);
  node.title = label;
  node.append(icon(name));
  node.addEventListener('click', action, { signal });
  return node;
}

/** One SVG builder for every icon, so stroke width/cap and sizing live in one place. */
export function icon(name: IconName) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'ui-icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  for (const d of iconPaths(name)) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
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

/** Section heading used by every dialog, so no dialog invents its own title size. */
export function sectionTitle(text: string) {
  return element('h3', 'ui-section-title', text);
}

let dialogId = 0;
export function dialog(
  title: string,
  closeLabel: string,
  content: HTMLElement[],
  signal: AbortSignal,
) {
  const node = element('dialog', 'ui-dialog');
  const heading = element('h2', 'ui-dialog-title', title);
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
  close.classList.add('ui-dialog-close');
  const body = element('div', 'ui-dialog-body');
  body.append(...content);
  node.append(heading, body, close);
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

export function selectField<T extends string>(
  label: string,
  options: readonly { value: T; label: string }[],
  value: T,
  change: (value: T) => void,
  signal: AbortSignal,
) {
  const wrapper = element('label', 'ui-field');
  const text = element('span', 'ui-field-label', label);
  const select = element('select', 'ui-select');
  select.setAttribute('aria-label', label);
  for (const option of options) {
    const node = element('option', '', option.label);
    node.value = option.value;
    select.append(node);
  }
  select.value = value;
  select.addEventListener(
    'change',
    () => {
      const selected = options.find((option) => option.value === select.value);
      if (selected) change(selected.value);
    },
    { signal },
  );
  wrapper.append(text, select);
  return { node: wrapper, input: select };
}

export function checkboxField(
  label: string,
  change: (value: boolean) => void,
  signal: AbortSignal,
) {
  const wrapper = element('label', 'ui-field ui-field-check');
  const input = element('input', 'ui-checkbox');
  input.type = 'checkbox';
  const text = element('span', 'ui-field-label', label);
  input.addEventListener(
    'change',
    () => {
      change(input.checked);
    },
    { signal },
  );
  wrapper.append(text, input);
  return { node: wrapper, input };
}

/** Row that performs an action or opens a destination, used for fullscreen and links. */
export function actionRow(label: string, control: HTMLElement) {
  const row = element('div', 'ui-row');
  row.append(element('span', 'ui-row-label', label), control);
  return row;
}
