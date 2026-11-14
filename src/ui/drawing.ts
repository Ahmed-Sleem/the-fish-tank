/**
 * The drawing surface: where a player turns a blank sheet into a fish.
 *
 * Three things matter here and nothing else does. The stroke the player sees is the stroke that
 * gets priced, the price shown while drawing is the price charged when they stop, and a drawing
 * they cannot afford is refused *before* it is committed rather than quietly discarded.
 *
 * Everything is plain pointer events on a canvas, so mouse, touch and pen behave the same. The
 * board is deliberately white: the later cutout step keys off near-white, and guessing at a
 * photographic background is how halos get made.
 */
import { element } from './shared/dom';
import { pixelConfig } from '../config/pixel.config';
import { button } from './shared/controls';
import { strings } from '../config/strings.en';
import { penOptions } from '../config/ink.config';
import { inkCost, refusalFor, type InkRefusal, type Point, type Stroke } from '../draw/ink';
import type { Purse } from '../draw/purse';

/** A stroke plus the pen it was drawn with; width and colour are kept for replay, never for price. */
export interface DrawnStroke extends Stroke {
  readonly width: number;
  readonly colour: string;
}

export interface DrawingSurface {
  readonly node: HTMLElement;
  /** The dialog body content, so the shell can host it in the one dialog it owns. */
  readonly panel: HTMLElement;
  /** Strokes as committed so far, in draw order. */
  readonly strokes: () => readonly DrawnStroke[];
  /** Re-read the purse and surface size, e.g. after a resize or a refund. */
  readonly refresh: () => void;
  /** Wipe everything and release any held ink. */
  readonly clear: () => void;
  readonly undo: () => void;
  readonly dispose: () => void;
}

export interface DrawingOptions {
  readonly purse: Purse;
  /** Called with the committed strokes once the player is done and the ink is spent. */
  readonly onDone: (strokes: readonly DrawnStroke[], cost: number) => void;
  readonly signal: AbortSignal;
  /**
   * The tank, used to measure one art pixel on screen.
   *
   * The drawing is rendered on the same grain as the scenery: the sheet asks the tank how large
   * its pixels currently are instead of guessing. A hardcoded grain would silently drift out of
   * step with the art the moment the tank resizes.
   */
  readonly tank?: HTMLElement | null;
}

const refusalText: Record<InkRefusal, string> = {
  'too-small': strings.drawTooSmall,
  'cannot-afford': strings.drawTooBig,
  'no-surface': strings.drawNoSurface,
};

export function createDrawing(options: DrawingOptions): DrawingSurface {
  const { purse, onDone, signal, tank } = options;

  const node = element('div', 'draw-surface');
  const board = element('canvas', 'draw-board');
  board.setAttribute('aria-label', strings.drawHint);
  board.setAttribute('role', 'img');

  const hint = element('p', 'draw-hint', strings.drawHint);
  const costOut = element('strong', 'draw-figure-value');
  costOut.textContent = '0';

  const inkValue = element('strong', 'draw-figure-value');
  inkValue.textContent = String(purse.available());

  const notice = element('p', 'draw-notice');
  notice.setAttribute('role', 'status');
  notice.setAttribute('aria-live', 'polite');

  // Widths are free, so they are presented as expression rather than as a price tier.
  const widths = penOptions.widths.map((width, index) => {
    const label = `${strings.drawToolPen} ${String(index + 1)}`;
    // The visible swatch is a dot, so the name lives on the button rather than in its content;
    // rendering it as text is what printed the label across the toolbar.
    const swatch = button(
      '',
      () => {
        activeWidth = width;
        syncWidths();
      },
      signal,
    );
    swatch.classList.add('draw-width');
    swatch.setAttribute('aria-label', label);
    swatch.title = label;
    swatch.style.setProperty('--draw-pen-size', `${String(width * 2.2 + 3)}px`);
    swatch.append(element('span', 'draw-width-dot'));
    swatch.setAttribute('aria-pressed', 'false');
    return { width, swatch };
  });

  const colours = penOptions.colours.map((colour) => {
    const label = `${strings.drawToolColour} ${colour}`;
    const swatch = button(
      '',
      () => {
        activeColour = colour;
        syncColours();
      },
      signal,
    );
    swatch.setAttribute('aria-label', label);
    swatch.title = label;
    swatch.classList.add('draw-swatch');
    swatch.style.setProperty('--draw-swatch', colour);
    swatch.setAttribute('aria-pressed', 'false');
    return { colour, swatch };
  });

  let activeWidth: number = penOptions.defaultWidth;
  let activeColour: string = penOptions.defaultColour;

  function syncWidths() {
    for (const { width, swatch } of widths) {
      swatch.setAttribute('aria-pressed', width === activeWidth ? 'true' : 'false');
    }
  }
  function syncColours() {
    for (const { colour, swatch } of colours) {
      swatch.setAttribute('aria-pressed', colour === activeColour ? 'true' : 'false');
    }
  }

  const undoButton = button(
    strings.drawUndo,
    () => {
      undo();
    },
    signal,
  );
  const clearButton = button(
    strings.drawClear,
    () => {
      clear();
    },
    signal,
  );
  const doneButton = button(
    strings.drawDone,
    () => {
      commit();
    },
    signal,
  );
  doneButton.classList.add('draw-done');
  doneButton.disabled = true;

  /** A captioned cluster. A caption is cheaper to read than a legend of unlabelled dots. */
  const cluster = (caption: string, label: string, items: HTMLElement[]) => {
    const wrap = element('div', 'draw-cluster');
    const title = element('span', 'draw-cluster-title', caption);
    const group = element('div', 'draw-group');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', label);
    group.append(...items);
    wrap.append(title, group);
    return wrap;
  };

  const controls = element('div', 'draw-controls');
  controls.append(
    cluster(
      strings.drawToolPen,
      strings.drawToolPen,
      widths.map(({ swatch }) => swatch),
    ),
    cluster(
      strings.drawToolColour,
      strings.drawToolColour,
      colours.map(({ swatch }) => swatch),
    ),
  );

  // Undo and clear act on the drawing, so they sit with the sheet rather than with the pens.
  const actionGroup = element('div', 'draw-actions');
  actionGroup.append(undoButton, clearButton);

  // Numbers the player acts on are paired and given room, instead of being a sentence in a corner.
  const figure = (label: string, value: HTMLElement, tone: string) => {
    const wrap = element('div', `draw-figure draw-figure--${tone}`);
    wrap.append(element('span', 'draw-figure-label', label), value);
    return wrap;
  };
  const figures = element('div', 'draw-figures');
  figures.append(
    figure(strings.drawCostLabel, costOut, 'cost'),
    figure(strings.drawInkLabel, inkValue, 'ink'),
  );

  // Two deliberate rows: what it costs, then what you can do about it. Mixing them in one flow
  // made Done wrap alone onto its own line as the dialog narrowed.
  actionGroup.append(doneButton);
  const footer = element('div', 'draw-footer');
  footer.append(notice, figures, actionGroup);

  const body = element('div', 'draw-body');
  body.append(board);

  node.append(body, controls, footer);

  // The dialog owns the title, so the panel must not repeat it. Only the guidance line is new.
  const panel = element('div', 'draw-panel');
  panel.append(hint, node);

  const context = board.getContext('2d');

  // Committed strokes, plus the one under the pointer. Both are drawn from the same list, so what
  // the player sees mid-stroke is exactly what is measured.
  let committed: DrawnStroke[] = [];
  let live: Point[] = [];
  let drawing = false;
  let held = 0;
  let cssWidth = 0;
  /** One art pixel in CSS pixels; kept from `measure()` so `trace` does not re-measure per frame. */
  let grainCss = 1;
  /** One art pixel in device pixels, snapped to whole pixels so blocks stay square on screen. */
  let block = 1;
  let cssHeight = 0;
  let queued = 0;

  /** Board coordinates, scaled from the pointer's CSS position. */
  function toPoint(event: PointerEvent): Point {
    const rect = board.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  /**
   * Size of one art pixel on screen, in CSS pixels.
   *
   * Measured from the tank rather than configured, because the scenery and the drawing have to
   * agree at every window size: the tank is the reference grid scaled to fit, so one of its pixels
   * is however wide the tank currently is divided by `pixelConfig.width`. If the tank cannot be
   * measured yet (it is display:none while the dialog measures), fall back to a sensible grain
   * rather than to a smooth line.
   */
  function grainSize(): number {
    const tankRect = tank?.getBoundingClientRect();
    if (tankRect && tankRect.width > 0) return tankRect.width / pixelConfig.width;
    // No measurable tank: pick a grain that still reads as pixel art on any screen.
    return Math.max(2, 640 / pixelConfig.width);
  }

  function measure() {
    const rect = board.getBoundingClientRect();
    cssWidth = rect.width;
    cssHeight = rect.height;
    const grain = grainSize();
    /*
     * Two canvases' worth of work in one: the device scale keeps the paper crisp, and the art
     * grain divides it into visible blocks. Drawing at `grain × ratio` device pixels per art
     * pixel means a stroke is made of the same square blocks as the scenery — a 2px pen is two
     * blocks wide here just as it is two blocks wide in the tank.
     */
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(1, Math.round(cssWidth * ratio));
    const nextHeight = Math.max(1, Math.round(cssHeight * ratio));
    if (board.width !== nextWidth || board.height !== nextHeight) {
      board.width = nextWidth;
      board.height = nextHeight;
    }
    grainCss = Math.max(grain, 0.5);
    // Snap so art-pixel edges land on whole device pixels; otherwise blocks shimmer.
    block = Math.max(1, Math.round(grainCss * ratio));
    // Blocks are stamped as exact rectangles; smoothing would blur their edges back into vectors.
    if (context) context.imageSmoothingEnabled = false;
  }

  /**
   * One place draws a stroke, so the live preview and the committed ink cannot diverge.
   *
   * Strokes arrive as a smooth path in CSS pixels and leave as blocks. The walk happens in
   * art-pixel space and each step paints a whole block-aligned square, which is what makes the
   * line read as pixel art: stepping one art pixel at a time is also what keeps a fast diagonal
   * solid, since no two neighbouring stamps can be more than a block apart. Pen width is rounded
   * up to whole blocks — a pen narrower than the grain would be invisible — so the three pens stay
   * distinguishable at every window size instead of collapsing into one.
   */
  function trace(ctx: CanvasRenderingContext2D, stroke: DrawnStroke, scale: number) {
    const [first, ...rest] = stroke.points;
    if (!first) return;
    const size = Math.max(1, block);
    const penBlocks = Math.max(1, Math.ceil(stroke.width / grainCss));
    // Centre the pen on the path: an odd pen has a middle block, an even one sits half a block out.
    const inset = Math.floor((penBlocks - 1) / 2) * size;
    const toArt = (value: number) => (value * scale) / size;
    ctx.fillStyle = stroke.colour;
    const stamp = (artX: number, artY: number) => {
      ctx.fillRect(
        Math.round(artX) * size - inset,
        Math.round(artY) * size - inset,
        size * penBlocks,
        size * penBlocks,
      );
    };
    let fromX = toArt(first.x);
    let fromY = toArt(first.y);
    stamp(fromX, fromY);
    for (const point of rest) {
      const toX = toArt(point.x);
      const toY = toArt(point.y);
      // A dot is a valid mark: a single tap must leave ink rather than nothing.
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY))));
      for (let i = 1; i <= steps; i += 1) {
        stamp(fromX + ((toX - fromX) * i) / steps, fromY + ((toY - fromY) * i) / steps);
      }
      fromX = toX;
      fromY = toY;
    }
  }

  function render() {
    if (!context) return;
    const scale = board.width / Math.max(1, cssWidth);
    context.clearRect(0, 0, board.width, board.height);
    for (const stroke of committed) trace(context, stroke, scale);
    if (live.length > 0) {
      trace(context, { points: live, width: activeWidth, colour: activeColour }, scale);
    }
  }

  function currentStrokes(): DrawnStroke[] {
    if (live.length === 0) return committed;
    return [...committed, { points: [...live], width: activeWidth, colour: activeColour }];
  }

  function priceOf(strokes: readonly DrawnStroke[]): number {
    return inkCost(strokes, cssWidth, cssHeight);
  }

  /**
   * Re-price from scratch and re-hold the purse.
   *
   * The hold is released and taken again rather than adjusted, because a partially applied hold is
   * how a wallet drifts. If the new price cannot be held, the stroke is refused outright.
   */
  function refresh(): boolean {
    const strokes = currentStrokes();
    const cost = priceOf(strokes);
    const affordable = cost <= purse.available() + held;
    if (!affordable) {
      notice.textContent = strings.drawTooBig;
      doneButton.disabled = true;
      return false;
    }
    purse.release(held);
    held = 0;
    if (cost > 0 && purse.reserve(cost)) held = cost;
    costOut.textContent = String(cost);
    inkValue.textContent = String(purse.available());
    const refusal = refusalFor(strokes, cssWidth, cssHeight, purse.available() + held);
    notice.textContent = refusal ? refusalText[refusal] : '';
    doneButton.disabled = refusal !== null;
    undoButton.disabled = committed.length === 0;
    clearButton.disabled = committed.length === 0 && live.length === 0;
    return affordable;
  }

  function begin(event: PointerEvent) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    measure();
    board.setPointerCapture(event.pointerId);
    drawing = true;
    live = [toPoint(event)];
    render();
    refresh();
  }

  function extend(event: PointerEvent) {
    if (!drawing) return;
    const point = toPoint(event);
    const previous = live[live.length - 1];
    // Skip duplicate points: they add no length, but they do add memory and redraw cost.
    if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 0.5) return;
    live.push(point);
    if (!refresh()) {
      // The pen stops here: the player keeps the ink they already paid for, and cannot add more.
      live.pop();
      finishStroke();
      drawing = false;
      return;
    }
    requestRender();
  }

  /**
   * Repaint at most once per frame.
   *
   * Pointer events arrive far faster than frames (a coarser device can deliver dozens between two
   * paints), and each repaint walks every committed stroke. Coalescing keeps a long drawing as
   * responsive as a short one instead of getting slower the more the player draws.
   */
  function requestRender() {
    if (queued !== 0) return;
    queued = requestAnimationFrame(() => {
      queued = 0;
      render();
    });
  }

  function finishStroke() {
    if (live.length > 0) {
      committed = [...committed, { points: live, width: activeWidth, colour: activeColour }];
    }
    live = [];
    render();
    refresh();
  }

  function end() {
    if (!drawing) return;
    drawing = false;
    finishStroke();
  }

  function undo() {
    if (committed.length === 0) return;
    committed = committed.slice(0, -1);
    render();
    refresh();
  }

  function clear() {
    committed = [];
    live = [];
    purse.release(held);
    held = 0;
    render();
    refresh();
  }

  function commit() {
    const strokes = committed;
    const cost = priceOf(strokes);
    if (refusalFor(strokes, cssWidth, cssHeight, purse.available() + held) !== null) {
      refresh();
      return;
    }
    // The hold taken while drawing becomes the charge, so the player pays what they were shown.
    if (held > 0) {
      purse.release(held);
      if (!purse.reserve(cost) || !purse.commit(cost)) {
        held = 0;
        refresh();
        return;
      }
      held = 0;
    } else if (cost > 0 && (!purse.reserve(cost) || !purse.commit(cost))) {
      refresh();
      return;
    }
    committed = [];
    live = [];
    render();
    refresh();
    onDone(strokes, cost);
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!drawing) return;
    extend(event);
  };

  board.addEventListener('pointerdown', begin, { signal });
  board.addEventListener('pointermove', onPointerMove, { signal });
  board.addEventListener('pointerup', end, { signal });
  board.addEventListener('pointercancel', end, { signal });
  board.addEventListener('pointerleave', end, { signal });

  // Drawing must not scroll or zoom the page under a finger.
  board.style.touchAction = 'none';

  const observer =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
          measure();
          render();
          refresh();
        });

  function dispose() {
    cancelAnimationFrame(queued);
    queued = 0;
    observer?.disconnect();
    purse.release(held);
    held = 0;
    node.remove();
    panel.remove();
  }
  signal.addEventListener('abort', dispose, { once: true });

  queueMicrotask(() => {
    observer?.observe(board);
    measure();
    syncWidths();
    syncColours();
    render();
    refresh();
  });

  return {
    node,
    panel,
    strokes: () => committed,
    refresh,
    clear,
    undo,
    dispose,
  };
}
