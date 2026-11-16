export interface GazeRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class SpringValue {
  value = 0;
  velocity = 0;

  constructor(
    readonly min = -Infinity,
    readonly max = Infinity,
  ) {}

  follow(target: number, elapsedSeconds = 1 / 60): boolean {
    const destination = Math.max(this.min, Math.min(this.max, target));
    const duration = Math.max(0, elapsedSeconds);
    const frequency = 18;
    const offset = this.value - destination;
    const displacement = (this.velocity + frequency * offset) * duration;
    const decay = Math.exp(-frequency * duration);
    const value = destination + (offset + displacement) * decay;

    this.velocity = (this.velocity - frequency * displacement) * decay;
    this.value = Math.max(this.min, Math.min(this.max, value));
    if (this.value !== value) this.velocity = 0;

    if (Math.abs(this.value - destination) < 0.001 && Math.abs(this.velocity) < 0.01) {
      this.value = destination;
      this.velocity = 0;
      return false;
    }

    return true;
  }

  rest() {
    this.value = 0;
    this.velocity = 0;
  }
}

export interface GazePoint {
  x: number;
  y: number;
}

export class EyeGaze {
  readonly horizontal: SpringValue;
  readonly vertical: SpringValue;

  constructor(
    readonly anchorX: number,
    readonly anchorY: number,
    readonly range: GazeRange,
  ) {
    this.horizontal = new SpringValue(range.minX, range.maxX);
    this.vertical = new SpringValue(range.minY, range.maxY);
  }

  aim(
    pointerX: number,
    pointerY: number,
    originX: number,
    originY: number,
    reach: number,
  ): GazePoint {
    const dx = pointerX - originX;
    const dy = pointerY - originY;
    const dist = Math.hypot(dx, dy);
    const amount = Math.min(1, dist / Math.max(1, reach));
    const eased = amount * amount * (3 - 2 * amount);
    const nx = dist > 0 ? dx / dist : 0;
    const ny = dist > 0 ? dy / dist : 0;

    return {
      x: (this.range.minX + this.range.maxX) / 2 + ((this.range.maxX - this.range.minX) / 2) * nx * eased,
      y: (this.range.minY + this.range.maxY) / 2 + ((this.range.maxY - this.range.minY) / 2) * ny * eased,
    };
  }

  wander(now: number, scrollNorm: number): GazePoint {
    const t = now * 0.001;
    const glance = Math.sin(t * 0.75);
    const lift = Math.cos(t * 0.52);
    const midX = (this.range.minX + this.range.maxX) / 2;
    const halfX = (this.range.maxX - this.range.minX) / 2;
    const midY = (this.range.minY + this.range.maxY) / 2;
    const halfY = (this.range.maxY - this.range.minY) / 2;
    return {
      x: midX + halfX * glance * 0.65,
      y: midY + halfY * lift * 0.55 * (1 - scrollNorm * 0.8),
    };
  }

  follow(point: GazePoint, elapsedSeconds = 1 / 60): boolean {
    const horizontalMoving = this.horizontal.follow(point.x, elapsedSeconds);
    const verticalMoving = this.vertical.follow(point.y, elapsedSeconds);
    return horizontalMoving || verticalMoving;
  }

  rest() {
    this.horizontal.rest();
    this.vertical.rest();
  }

  transform() {
    return `translate3d(${this.horizontal.value.toFixed(3)}%, ${this.vertical.value.toFixed(3)}%, 0)`;
  }
}

export const GAZE_REACH_RATIO = 0.45;

export interface EyeSpec {
  anchorX: number;
  anchorY: number;
  blinkShiftY: number;
  range: GazeRange;
}

export const LEFT_EYE: EyeSpec = {
  anchorX: 0.3563,
  anchorY: 0.5105,
  blinkShiftY: 9.544,
  range: { minX: -1.85, maxX: 1.85, minY: -1.45, maxY: 1.45 },
};

export const RIGHT_EYE: EyeSpec = {
  anchorX: 0.5136,
  anchorY: 0.5234,
  blinkShiftY: 10.732,
  range: { minX: -2.45, maxX: 2.45, minY: -1.65, maxY: 1.65 },
};
