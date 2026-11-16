import React, { useId } from 'react';

const VIEW_SIZE = 400;
const CENTER = VIEW_SIZE / 2;
const RADIUS = 194;
const GRID_STEP = 6.2;
const INNER_RATIO = 0.58;
const OUTER_RATIO = 0.94;

const buildHalftoneRingPath = (): string => {
  const cos = Math.SQRT1_2;
  const sin = Math.SQRT1_2;
  const maxExtent = RADIUS * 1.48;
  const span = OUTER_RATIO - INNER_RATIO;
  const maxDotRadius = GRID_STEP * 0.76;
  const minDotRadius = 0.42;
  const chunks: string[] = [];

  for (let u = -maxExtent; u <= maxExtent; u += GRID_STEP) {
    for (let v = -maxExtent; v <= maxExtent; v += GRID_STEP) {
      const x = CENTER + u * cos - v * sin;
      const y = CENTER + u * sin + v * cos;
      const dist = Math.hypot(x - CENTER, y - CENTER);
      if (dist > RADIUS + GRID_STEP) continue;
      const t = (dist / RADIUS - INNER_RATIO) / span;
      if (t <= 0) continue;

      const progress = Math.min(1, t);
      const r = minDotRadius + Math.pow(progress, 1.05) * (maxDotRadius - minDotRadius);
      const cx = x.toFixed(1);
      const cy = y.toFixed(1);
      const rr = r.toFixed(2);
      const d2 = (r * 2).toFixed(2);
      chunks.push(`M${cx} ${cy}m-${rr} 0a${rr} ${rr} 0 1 0 ${d2} 0a${rr} ${rr} 0 1 0 -${d2} 0`);
    }
  }

  return chunks.join('');
};

const HALFTONE_RING_PATH = buildHalftoneRingPath();

interface HalftoneDiscProps {
  tone?: 'cream' | 'dim';
  className?: string;
}

export const HalftoneDisc: React.FC<HalftoneDiscProps> = ({ tone = 'cream', className = '' }) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gradId = `halftone-bg-${uid}`;
  const maskId = `halftone-mask-${uid}`;
  const maskGradId = `halftone-mask-grad-${uid}`;
  const innerStop = tone === 'cream' ? '#e4e0d6' : '#32312e';
  const outerStop = tone === 'cream' ? '#ccc6bb' : '#232220';

  return (
    <svg
      className={`halftone-disc ${className}`}
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="48%">
          <stop offset="0%" stopColor={innerStop} />
          <stop offset="64%" stopColor={outerStop} />
          <stop offset="100%" stopColor={outerStop} />
        </radialGradient>
        <radialGradient id={maskGradId} cx="50%" cy="50%" r="49%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="68%" stopColor="#ffffff" />
          <stop offset="87%" stopColor="#828282" />
          <stop offset="98%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <mask id={maskId}>
          <rect width={VIEW_SIZE} height={VIEW_SIZE} fill="#000000" />
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={`url(#${maskGradId})`} />
          <path d={HALFTONE_RING_PATH} fill="#000000" />
        </mask>
      </defs>

      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill={`url(#${gradId})`}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
};

export default HalftoneDisc;
