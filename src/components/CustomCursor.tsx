import React, { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

type CursorMode = 'default' | 'hover' | 'zoom' | 'title';

const CURSOR_MODES: readonly CursorMode[] = ['default', 'hover', 'zoom', 'title'];

const readCursorMode = (value: string | null): CursorMode | null => {
  if (value && (CURSOR_MODES as readonly string[]).includes(value)) {
    return value as CursorMode;
  }
  return null;
};

const modeFromTarget = (target: EventTarget | null): CursorMode => {
  const element = target as HTMLElement | null;
  const marked = element?.closest?.('[data-cursor]') as HTMLElement | null;
  const explicit = readCursorMode(marked?.getAttribute('data-cursor') ?? null);
  if (explicit) return explicit;
  if (element?.closest?.('a, button, [role="button"]')) return 'hover';
  return 'default';
};

export const CustomCursor: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const enabled = finePointer && !reducedMotion && !disabled;
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setVisible(false);
    setMode('default');
    setPressed(false);

    let rafId = 0;
    let clickTimer = 0;
    let tx = -100;
    let ty = -100;
    let cx = -100;
    let cy = -100;
    let shown = false;
    let currentMode: CursorMode = 'default';

    const applyMode = (next: CursorMode) => {
      if (next === currentMode) return;
      currentMode = next;
      setMode(next);
    };

    const onMove = (event: MouseEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      if (!shown) {
        shown = true;
        cx = tx;
        cy = ty;
        setVisible(true);
        document.documentElement.classList.add('has-custom-cursor');
      }
      applyMode(modeFromTarget(event.target));
    };

    const onLeave = () => {
      shown = false;
      setVisible(false);
      setPressed(false);
      document.documentElement.classList.remove('has-custom-cursor');
    };

    const onMouseDown = () => {
      setPressed(true);
    };

    const onMouseUp = () => {
      setPressed(false);
    };

    const onClick = () => {
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(() => {
        applyMode(modeFromTarget(document.elementFromPoint(tx, ty)));
      }, 60);
    };

    const tick = () => {
      cx += (tx - cx) * 0.34;
      cy += (ty - cy) * 0.34;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('click', onClick);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.clearTimeout(clickTimer);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  if (!enabled) return null;

  const label = mode === 'zoom' ? 'ОТКРЫТЬ' : mode === 'title' ? 'СТАТИКА' : '';

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor custom-cursor--${mode} ${visible ? 'custom-cursor--visible' : ''} ${pressed ? 'custom-cursor--down' : ''}`}
      aria-hidden="true"
    >
      <svg
        className="custom-cursor__glove"
        viewBox="6 31 178 188"
        width="34"
        height="36"
        aria-hidden="true"
        focusable="false"
      >
        <g stroke="#0a0907" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M 57 109 C 44 105, 25 104, 18 110 C 12 116, 13 130, 22 138 C 33 149, 55 177, 68 196 L 73 208 L 111 208 C 115 201, 118 194, 121 191 C 124 194, 128 201, 132 208 L 150 208 L 154 191 C 163 175, 173 144, 173 111 C 173 95, 156 90, 149 99 C 146 84, 123 80, 117 91 C 113 77, 89 76, 83 88 C 80 73, 76 56, 70 45 C 65 37, 49 38, 49 52 C 49 69, 53 93, 57 109 Z"
            fill="#f1f0ea"
            strokeWidth="9"
          />
          <path d="M 57 109 L 59 116" fill="none" strokeWidth="8.5" />
          <line x1="95" y1="138" x2="95" y2="176" strokeWidth="8.5" />
          <line x1="117" y1="136" x2="117" y2="177" strokeWidth="8.5" />
          <line x1="138" y1="136" x2="138" y2="177" strokeWidth="8.5" />
        </g>
      </svg>
      {label && <span className="custom-cursor__label">{label}</span>}
    </div>
  );
};

export default CustomCursor;
