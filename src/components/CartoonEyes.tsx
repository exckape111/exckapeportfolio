import React, { useEffect, useRef, useState } from 'react';
import { EyeGaze, GAZE_REACH_RATIO, GazePoint, LEFT_EYE, RIGHT_EYE } from '../eyes/EyeGaze';
import { useMediaQuery } from '../hooks/useMediaQuery';

const EASTER_PHRASES = [
  '«Кстати, я забирал номинацию «обложка месяца» у рзт»',
  '«Be careful»',
  '«Я делал этот сайт неделю. жестко, да?»',
  '«Закажи у меня дизайн пж»',
  '«Экскейп - это апатия»',
  '«Расскажи, как ты себя чувствуешь?»',
];

const BLINK_HOLD_MS = 150;

const applyTransform = (image: HTMLImageElement | null, gaze: EyeGaze) => {
  if (image) image.style.transform = gaze.transform();
};

export const CartoonEyes: React.FC = () => {
  const containerRef = useRef<HTMLButtonElement | null>(null);
  const pupilLeftRef = useRef<HTMLImageElement | null>(null);
  const pupilRightRef = useRef<HTMLImageElement | null>(null);
  const blinkTimerRef = useRef<number | null>(null);
  const autoBlinkTimerRef = useRef<number | null>(null);
  const scheduleAutoBlinkRef = useRef<((delay?: number) => void) | null>(null);

  const [blink, setBlink] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState<number | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const leftEye = new EyeGaze(LEFT_EYE.anchorX, LEFT_EYE.anchorY, LEFT_EYE.range);
    const rightEye = new EyeGaze(RIGHT_EYE.anchorX, RIGHT_EYE.anchorY, RIGHT_EYE.range);

    if (reducedMotion) {
      setBlink(false);
      applyTransform(pupilLeftRef.current, leftEye);
      applyTransform(pupilRightRef.current, rightEye);
      return;
    }

    let touchTimer = 0;
    let rafId = 0;
    let previousFrame: number | null = null;
    let inView = false;
    const pointer = { x: 0, y: 0, active: false };

    const clearBlinkTimers = () => {
      if (blinkTimerRef.current !== null) {
        window.clearTimeout(blinkTimerRef.current);
        blinkTimerRef.current = null;
      }
      if (autoBlinkTimerRef.current !== null) {
        window.clearTimeout(autoBlinkTimerRef.current);
        autoBlinkTimerRef.current = null;
      }
    };

    const scheduleAutoBlink = (customDelay?: number) => {
      if (autoBlinkTimerRef.current !== null) {
        window.clearTimeout(autoBlinkTimerRef.current);
        autoBlinkTimerRef.current = null;
      }
      if (!inView || document.hidden) return;
      const delay = customDelay ?? 2800 + Math.random() * 2600;
      autoBlinkTimerRef.current = window.setTimeout(() => {
        autoBlinkTimerRef.current = null;
        if (!inView || document.hidden) return;
        setBlink(true);
        if (blinkTimerRef.current !== null) window.clearTimeout(blinkTimerRef.current);
        blinkTimerRef.current = window.setTimeout(() => {
          blinkTimerRef.current = null;
          setBlink(false);
          const doubleBlink = Math.random() < 0.22;
          scheduleAutoBlink(doubleBlink ? 210 : undefined);
        }, BLINK_HOLD_MS);
      }, delay);
    };

    scheduleAutoBlinkRef.current = scheduleAutoBlink;

    const startAnimation = () => {
      if (rafId || !inView || document.hidden) return;
      rafId = window.requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
      previousFrame = null;
    };

    const animate = (now: number) => {
      rafId = 0;
      const elapsedSeconds = previousFrame === null ? 1 / 60 : Math.min((now - previousFrame) / 1000, 0.05);
      previousFrame = now;
      const rect = container.getBoundingClientRect();
      let leftTarget: GazePoint = { x: 0, y: 0 };
      let rightTarget: GazePoint = { x: 0, y: 0 };

      if (pointer.active) {
        const reach = rect.width * GAZE_REACH_RATIO;
        leftTarget = leftEye.aim(
          pointer.x,
          pointer.y,
          rect.left + rect.width * leftEye.anchorX,
          rect.top + rect.height * leftEye.anchorY,
          reach,
        );
        rightTarget = rightEye.aim(
          pointer.x,
          pointer.y,
          rect.left + rect.width * rightEye.anchorX,
          rect.top + rect.height * rightEye.anchorY,
          reach,
        );
      } else if (coarsePointer.matches) {
        const scrollNorm = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 0.7));
        leftTarget = leftEye.wander(now, scrollNorm);
        rightTarget = rightEye.wander(now, scrollNorm);
      }

      const leftMoving = leftEye.follow(leftTarget, elapsedSeconds);
      const rightMoving = rightEye.follow(rightTarget, elapsedSeconds);
      applyTransform(pupilLeftRef.current, leftEye);
      applyTransform(pupilRightRef.current, rightEye);

      if (leftMoving || rightMoving || coarsePointer.matches) startAnimation();
      else previousFrame = null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') window.clearTimeout(touchTimer);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      startAnimation();
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      startAnimation();
    };

    const handleRootLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') handlePointerLeave();
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      window.clearTimeout(touchTimer);
      touchTimer = window.setTimeout(handlePointerLeave, 1600);
    };

    const syncVisibility = () => {
      if (inView && !document.hidden) {
        startAnimation();
        if (autoBlinkTimerRef.current === null && blinkTimerRef.current === null) {
          scheduleAutoBlink(1800);
        }
      } else {
        stopAnimation();
        clearBlinkTimers();
        setBlink(false);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncVisibility();
    });
    observer.observe(container);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd, { passive: true });
    window.addEventListener('pointercancel', handlePointerEnd, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleRootLeave);
    window.addEventListener('blur', handlePointerLeave);
    window.addEventListener('scroll', startAnimation, { passive: true });
    window.addEventListener('resize', startAnimation, { passive: true });
    document.addEventListener('visibilitychange', syncVisibility);
    coarsePointer.addEventListener('change', startAnimation);

    return () => {
      scheduleAutoBlinkRef.current = null;
      observer.disconnect();
      stopAnimation();
      clearBlinkTimers();
      window.clearTimeout(touchTimer);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
      document.documentElement.removeEventListener('pointerleave', handleRootLeave);
      window.removeEventListener('blur', handlePointerLeave);
      window.removeEventListener('scroll', startAnimation);
      window.removeEventListener('resize', startAnimation);
      document.removeEventListener('visibilitychange', syncVisibility);
      coarsePointer.removeEventListener('change', startAnimation);
    };
  }, [reducedMotion]);

  const handleEyeClick = () => {
    setPhraseIdx((prev) => (prev === null ? 0 : (prev + 1) % EASTER_PHRASES.length));
    if (reducedMotion) return;

    setBlink(true);
    if (blinkTimerRef.current !== null) window.clearTimeout(blinkTimerRef.current);
    if (autoBlinkTimerRef.current !== null) {
      window.clearTimeout(autoBlinkTimerRef.current);
      autoBlinkTimerRef.current = null;
    }
    blinkTimerRef.current = window.setTimeout(() => {
      blinkTimerRef.current = null;
      setBlink(false);
      scheduleAutoBlinkRef.current?.(3600);
    }, BLINK_HOLD_MS);
  };

  return (
    <div className="hero-eyes-wrap">
      <button
        type="button"
        ref={containerRef}
        className={`cartoon-eyes ${blink ? 'cartoon-eyes--blink' : ''}`}
        onClick={handleEyeClick}
        aria-label="Интерактивный персонаж-демон «экскейп ?!» — следит за курсором, нажмите для моргания и пасхалки"
      >
        <span className="cartoon-eyes__socket cartoon-eyes__socket--left" aria-hidden="true">
          <img
            ref={pupilLeftRef}
            src="/media/demon/pupil-l.png"
            alt=""
            className="cartoon-eyes__pupil"
            draggable={false}
          />
          <img
            src="/media/demon/eyelid-l.png"
            alt=""
            className="cartoon-eyes__eyelid cartoon-eyes__eyelid--left"
            draggable={false}
          />
        </span>
        <span className="cartoon-eyes__socket cartoon-eyes__socket--right" aria-hidden="true">
          <img
            ref={pupilRightRef}
            src="/media/demon/pupil-r.png"
            alt=""
            className="cartoon-eyes__pupil"
            draggable={false}
          />
          <img
            src="/media/demon/eyelid-r.png"
            alt=""
            className="cartoon-eyes__eyelid cartoon-eyes__eyelid--right"
            draggable={false}
          />
        </span>
        <img
          src="/media/demon/frame.png"
          alt="Мультяшный демон «экскейп ?!»"
          className="cartoon-eyes__layer cartoon-eyes__layer--frame"
          draggable={false}
        />
      </button>

      {phraseIdx !== null && (
        <div className="cartoon-eyes__intertitle" role="status" aria-live="polite">
          <span>{EASTER_PHRASES[phraseIdx]}</span>
        </div>
      )}
    </div>
  );
};

export default CartoonEyes;
