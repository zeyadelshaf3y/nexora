/** Coalesces rapid `input` bursts into one mention session check per microtask. */
export class MentionSessionCheckScheduler<T = void> {
  private flushPending = false;
  private latestPayload: T | undefined = undefined;

  constructor(private readonly runSessionCheck: (payload: T | undefined) => void) {}

  private flush(): void {
    this.runSessionCheck(this.latestPayload);
    this.latestPayload = undefined;
  }

  schedule(coalesce: boolean, payload?: T): void {
    this.latestPayload = payload;

    if (!coalesce) {
      this.flush();

      return;
    }

    if (this.flushPending) return;

    this.flushPending = true;

    queueMicrotask(() => {
      this.flushPending = false;
      this.flush();
    });
  }

  reset(): void {
    this.flushPending = false;
    this.latestPayload = undefined;
  }
}
