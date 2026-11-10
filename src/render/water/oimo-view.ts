/** Oimo point-sprite shader port: see adjacent solver and upstream MIT license. */
import { waterConfig as cfg } from '../../config/water.config';
import { OimoFluid } from './oimo-fluid';
import type { WaterPointer } from './oimo-fluid';
const vertex = `#version 300 es
in vec4 particle;
out vec3 color;
uniform vec3 deep;
uniform vec3 foam;
void main() {
  gl_Position = vec4(particle.x * 2.0 - 1.0, 1.0 - particle.y * 2.0, 0.0, 1.0);
  gl_PointSize = particle.z;
  color = mix(deep, foam, particle.w);
}`;
const fragment = `#version 300 es
precision mediump float;
precision highp int;
in vec3 color;
uniform float grainAmount;
out vec4 outputColor;
void main() {
  float weight = 1.0 - length(2.0 * gl_PointCoord - 1.0);
  float alpha = clamp(10.0 * weight, 0.0, 1.0);
  if (alpha == 0.0) discard;
  float grain = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453);
  outputColor = vec4(color * alpha * (1.0 - grainAmount + 2.0 * grainAmount * grain), 1.0);
  gl_FragDepth = 0.5 - weight * 0.1;
}`;
function palette(host: HTMLElement, token: string): number[] {
  const hex = getComputedStyle(host).getPropertyValue(token).trim().replace('#', '');
  return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
}
/** A transient loader renderer, not a replacement for the main Pixi scene. */
export function mountOimoWater(host: HTMLElement, signal: AbortSignal) {
  const canvas = document.createElement('canvas');
  canvas.className = 'loading-water';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
  });
  if (!gl) {
    canvas.remove();
    return () => {};
  }
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  let observer: ResizeObserver | undefined;
  let frame = 0,
    disposed = false;
  const stop = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    cancelAnimationFrame(frame);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    for (const shader of shaders) gl.deleteShader(shader);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
  };
  signal.addEventListener('abort', stop, { once: true });
  try {
    // DOM WebGL declarations omit nullable allocation results, but drivers may fail at runtime.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!program || !buffer) throw new Error('Water resources unavailable');
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Water shader unavailable');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error('Water shader compilation failed');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error('Water shader linking failed');
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const location = gl.getAttribLocation(program, 'particle');
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 4, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(gl.getUniformLocation(program, 'deep'), palette(host, '--water-body'));
    gl.uniform3fv(gl.getUniformLocation(program, 'foam'), palette(host, '--water-foam'));
    gl.uniform1f(gl.getUniformLocation(program, 'grainAmount'), cfg.grain);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    let fluid = new OimoFluid(16, 16),
      vertices = new Float32Array(0),
      pixelScale = 1;
    const pointer: WaterPointer = { x: 0, y: 0, dx: 0, dy: 0, active: false };
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const draw = () => {
      fluid.writeVertices(vertices, pixelScale);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, fluid.count);
    };
    let previousWidth = 0,
      previousHeight = 0,
      previousRatio = 0;
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (disposed || width <= 0 || height <= 0) return;
      const ratio = Math.min(devicePixelRatio, cfg.maxResolution);
      if (width === previousWidth && height === previousHeight && ratio === previousRatio) return;
      previousWidth = width;
      previousHeight = height;
      previousRatio = ratio;
      const cell = Math.max(
        width / cfg.maxWidth,
        height / cfg.maxHeight,
        Math.sqrt((width * height) / cfg.cells),
      );
      fluid = new OimoFluid(width / cell, height / cell);
      vertices = new Float32Array(fluid.count * 4);
      gl.bufferData(gl.ARRAY_BUFFER, vertices.byteLength, gl.DYNAMIC_DRAW);
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      pixelScale = (width / fluid.width) * ratio;
      gl.viewport(0, 0, canvas.width, canvas.height);
      pointer.active = false;
      draw();
    };
    const resizeObserver = new ResizeObserver(resize);
    observer = resizeObserver;
    resizeObserver.observe(host);
    resize();
    signal.addEventListener(
      'abort',
      () => {
        resizeObserver.disconnect();
      },
      { once: true },
    );
    host.addEventListener(
      'pointermove',
      (event) => {
        if (motion.matches) return;
        const bounds = host.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * fluid.width;
        const y = ((event.clientY - bounds.top) / bounds.height) * fluid.height;
        pointer.dx = pointer.active ? x - pointer.x : 0;
        pointer.dy = pointer.active ? y - pointer.y : 0;
        pointer.x = x;
        pointer.y = y;
        pointer.active = true;
      },
      { signal, passive: true },
    );
    host.addEventListener(
      'pointerleave',
      () => {
        pointer.active = false;
      },
      { signal },
    );
    canvas.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault();
        resizeObserver.disconnect();
        stop();
      },
      { signal },
    );
    let last = 0;
    const animate = (time: number) => {
      if (disposed) return;
      if (!document.hidden && !motion.matches && time - last >= cfg.frameMs) {
        last = time;
        for (let i = 0; i < cfg.substeps; i++) fluid.step(pointer);
        pointer.dx = 0;
        pointer.dy = 0;
        draw();
      }
      frame = requestAnimationFrame(animate);
    };
    const updateMotion = () => {
      cancelAnimationFrame(frame);
      if (!motion.matches && !disposed) {
        last = 0;
        frame = requestAnimationFrame(animate);
      }
      pointer.active = false;
    };
    motion.addEventListener('change', updateMotion, { signal });
    updateMotion();
    if (signal.aborted) {
      resizeObserver.disconnect();
      stop();
    }
  } catch {
    stop();
  } // Cosmetic graphics failure must never block readable loading/startup.
  return stop;
}
