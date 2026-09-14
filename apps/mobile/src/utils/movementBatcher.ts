type MovementFlusher = (batchDx: number, batchDy: number) => void;

export class MovementBatcher {
  private accumDx = 0;
  private accumDy = 0;
  private timer: any = null;
  private flusher: MovementFlusher;
  private intervalMs: number;

  constructor(flusher: MovementFlusher, intervalMs = 16) {
    this.flusher = flusher;
    this.intervalMs = intervalMs;
  }

  public pushDelta(dx: number, dy: number) {
    this.accumDx += dx;
    this.accumDy += dy;

    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.flush();
      }, this.intervalMs);
    }
  }

  public flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (Math.abs(this.accumDx) > 0 || Math.abs(this.accumDy) > 0) {
      this.flusher(Math.round(this.accumDx), Math.round(this.accumDy));
      this.accumDx = 0;
      this.accumDy = 0;
    }
  }
}
