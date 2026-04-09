const DEFAULT_LABEL_LRU_MAX = 512;

/**
 * Bounded LRU of rendered labels keyed by `trackKey(item)`.
 * Invalidates when the `items` reference or `labelFn` identity changes—callers should pass stable `labelFor` references.
 */
export class LabelLruCache<T> {
  private readonly map = new Map<unknown, string>();
  private itemsRef: readonly T[] | null = null;
  private labelFn: ((item: T) => string) | null = null;

  constructor(private readonly maxSize = DEFAULT_LABEL_LRU_MAX) {}

  resolve(
    items: readonly T[],
    labelFn: (item: T) => string,
    trackKey: (item: T) => unknown,
    item: T,
  ): string {
    if (this.itemsRef !== items || this.labelFn !== labelFn) {
      this.map.clear();
      this.itemsRef = items;
      this.labelFn = labelFn;
    }
    const k = trackKey(item);
    const hit = this.map.get(k);
    if (hit !== undefined) {
      this.map.delete(k);
      this.map.set(k, hit);
      return hit;
    }
    const s = labelFn(item);
    this.map.set(k, s);
    while (this.map.size > this.maxSize) {
      const next = this.map.keys().next();
      if (next.done) break;
      this.map.delete(next.value);
    }
    return s;
  }

  clear(): void {
    this.map.clear();
    this.itemsRef = null;
    this.labelFn = null;
  }
}
