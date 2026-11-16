import React, { useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface FilmGrainProps {
  
  intense?: boolean;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({ intense = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const TILE_SIZE = 192;
    const TILE_COUNT = 4;
    const tiles: HTMLCanvasElement[] = [];

    for (let t = 0; t < TILE_COUNT; t++) {
      const tile = document.createElement('canvas');
      tile.width = TILE_SIZE;
      tile.height = TILE_SIZE;
      const tctx = tile.getContext('2d');
      if (tctx) {
        const img = tctx.createImageData(TILE_SIZE, TILE_SIZE);
        const data = img.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.random();
          if (r > 0.64) {
            data[i] = 232;
            data[i + 1] = 228;
            data[i + 2] = 219;
            data[i + 3] = Math.floor((r - 0.64) * 78);
          } else if (r < 0.14) {
            data[i] = 6;
            data[i + 1] = 6;
            data[i + 2] = 5;
            data[i + 3] = Math.floor((0.14 - r) * 140);
          }
        }
        tctx.putImageData(img, 0, 0);
      }
      tiles.push(tile);
    }

    let width = 0;
    let height = 0;
    const resize = () => {
      width = Math.max(320, Math.floor(window.innerWidth * 0.5));
      height = Math.max(240, Math.floor(window.innerHeight * 0.5));
      canvas.width = width;
      canvas.height = height;
    };
    resize();

    const staticScratches = [
      { xr: 0.14, y0: 0.04, y1: 0.92, alpha: 0.055, w: 0.7 },
      { xr: 0.41, y0: 0.12, y1: 0.78, alpha: 0.04, w: 0.55 },
      { xr: 0.72, y0: 0.0, y1: 0.96, alpha: 0.06, w: 0.7 },
      { xr: 0.89, y0: 0.18, y1: 0.86, alpha: 0.045, w: 0.6 },
    ];

    const staticDust = [
      { xr: 0.11, yr: 0.19, r: 0.9, a: 0.16 },
      { xr: 0.27, yr: 0.64, r: 1.1, a: 0.14 },
      { xr: 0.53, yr: 0.31, r: 0.8, a: 0.18 },
      { xr: 0.68, yr: 0.79, r: 1.2, a: 0.14 },
      { xr: 0.83, yr: 0.43, r: 0.9, a: 0.16 },
      { xr: 0.92, yr: 0.24, r: 1.0, a: 0.14 },
      { xr: 0.35, yr: 0.85, r: 0.85, a: 0.15 },
      { xr: 0.19, yr: 0.47, r: 0.8, a: 0.14 },
    ];

    const staticHairs = [
      { xr: 0.22, yr: 0.28, dx: 9, dy: -6, cx: 4, cy: -5, a: 0.14 },
      { xr: 0.61, yr: 0.56, dx: -8, dy: 7, cx: -5, cy: 2, a: 0.13 },
      { xr: 0.86, yr: 0.71, dx: 7, dy: 8, cx: 5, cy: 3, a: 0.14 },
    ];

    let frameIdx = 0;
    let rafId = 0;
    let lastTick = 0;
    const FPS_INTERVAL = 1000 / 12;

    const drawStaticOrFrame = () => {
      ctx.clearRect(0, 0, width, height);

      const tile = tiles[frameIdx % TILE_COUNT];
      const pattern = ctx.createPattern(tile, 'repeat');
      if (pattern) {
        const ox = reducedMotion ? 0 : Math.floor(Math.random() * TILE_SIZE);
        const oy = reducedMotion ? 0 : Math.floor(Math.random() * TILE_SIZE);
        if (typeof pattern.setTransform === 'function') {
          const m = new DOMMatrix();
          m.translateSelf(ox, oy);
          pattern.setTransform(m);
        }
        ctx.globalAlpha = intense ? 0.92 : 0.74;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
      }

      for (const s of staticScratches) {
        const jitter = reducedMotion ? 0 : (Math.random() - 0.5) * 1.4;
        ctx.globalAlpha = intense ? s.alpha * 1.3 : s.alpha;
        ctx.strokeStyle = '#edece7';
        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(s.xr * width + jitter, s.y0 * height);
        ctx.lineTo(s.xr * width + jitter + (reducedMotion ? 0.6 : (Math.random() - 0.5) * 2), s.y1 * height);
        ctx.stroke();
      }

      for (const d of staticDust) {
        const dx = reducedMotion ? 0 : (Math.random() - 0.5) * 2.5;
        const dy = reducedMotion ? 0 : (Math.random() - 0.5) * 2.5;
        ctx.globalAlpha = d.a;
        ctx.fillStyle = '#edece7';
        ctx.fillRect(d.xr * width + dx, d.yr * height + dy, d.r, d.r);
      }

      for (const h of staticHairs) {
        ctx.globalAlpha = h.a;
        ctx.strokeStyle = '#edece7';
        ctx.lineWidth = 0.6;
        const hx = h.xr * width;
        const hy = h.yr * height;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.quadraticCurveTo(hx + h.cx, hy + h.cy, hx + h.dx, hy + h.dy);
        ctx.stroke();
      }

      if (reducedMotion) return;

      const transientCount = intense ? 3 : 2;
      for (let k = 0; k < transientCount; k++) {
        if (Math.random() < (intense ? 0.8 : 0.52)) {
          const sx = Math.random() * width;
          const sy = Math.random() * height * 0.3;
          const sh = height * (0.28 + Math.random() * 0.68);
          ctx.globalAlpha = intense ? 0.12 : 0.075;
          ctx.strokeStyle = Math.random() < 0.25 ? '#050504' : '#edece7';
          ctx.lineWidth = Math.random() < 0.7 ? 0.6 : 1.05;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + (Math.random() - 0.5) * 3, sy + sh);
          ctx.stroke();
        }
      }
    };

    drawStaticOrFrame();
    const handleResize = () => {
      resize();
      drawStaticOrFrame();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    if (!reducedMotion) {
      const tick = (now: number) => {
        if (!document.hidden && now - lastTick >= FPS_INTERVAL) {
          lastTick = now;
          frameIdx++;
          drawStaticOrFrame();
        }
        rafId = window.requestAnimationFrame(tick);
      };
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [intense, reducedMotion]);

  return (
    <div
      className={`film-overlay ${intense ? 'film-overlay--intense' : ''} ${
        reducedMotion ? 'film-overlay--reduced' : ''
      }`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="film-overlay__canvas" />
      <div className="film-overlay__distress" />
      <div className="film-overlay__flicker" />
      <div className="film-overlay__vignette" />
    </div>
  );
};

export default FilmGrain;
