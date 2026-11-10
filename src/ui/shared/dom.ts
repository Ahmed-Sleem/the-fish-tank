/** One safe primitive for text-bearing DOM nodes; never interpolate untrusted HTML. */
export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function link(label: string, href: string, className = 'text-link'): HTMLAnchorElement {
  const node = element('a', className, label);
  node.href = href;
  return node;
}
