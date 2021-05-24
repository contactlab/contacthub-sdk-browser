export interface WithWindow<T = unknown> {
  window: Window & typeof globalThis & T;
}
