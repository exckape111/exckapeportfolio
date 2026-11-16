import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AnyProject } from '../data/projects';

export interface LightboxState {
  project: AnyProject;
  imageIndex: number;
}

interface LightboxModalProps {
  state: LightboxState | null;
  onClose: () => void;
}

interface LightboxDialogProps {
  state: LightboxState;
  onClose: () => void;
}

const LightboxDialog: React.FC<LightboxDialogProps> = ({ state, onClose }) => {
  const { project } = state;
  const images = project.images;
  const [currentIdx, setCurrentIdx] = useState(() =>
    Math.max(0, Math.min(Math.trunc(state.imageIndex) || 0, images.length - 1)),
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();
  const activeImage = images[currentIdx];

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const trigger = document.activeElement;
    const { scrollX, scrollY } = window;
    const bodyStyle = document.body.style;
    const previousStyle = {
      overflow: bodyStyle.overflow,
      position: bodyStyle.position,
      top: bodyStyle.top,
      left: bodyStyle.left,
      width: bodyStyle.width,
    };
    Object.assign(bodyStyle, {
      overflow: 'hidden',
      position: 'fixed',
      top: `${-scrollY}px`,
      left: `${-scrollX}px`,
      width: '100%',
    });
    dialog.showModal();

    return () => {
      dialog.close();
      Object.assign(bodyStyle, previousStyle);
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, []);

  const changeImage = (direction: number) => {
    setCurrentIdx((previous) => (previous + direction + images.length) % images.length);
  };

  return (
    <dialog
      ref={dialogRef}
      className="lightbox-backdrop"
      aria-modal="true"
      aria-label={project.title ? `Просмотр работы: ${project.title}` : `Просмотр работы: ${project.category}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (images.length < 2) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          changeImage(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div className="lightbox-topbar">
        <div className="lightbox-topbar__info">
          <span className="lightbox-topbar__category">{project.category}</span>
          {project.title && (
            <>
              <span className="lightbox-topbar__sep" aria-hidden="true">•</span>
              <strong className="lightbox-topbar__title">{project.title}</strong>
            </>
          )}
          {images.length > 1 && (
            <span className="lightbox-topbar__counter" aria-live="polite">
              (Кадр {currentIdx + 1} из {images.length})
            </span>
          )}
        </div>
        <button
          type="button"
          className="lightbox-close"
          onClick={onClose}
          aria-label="Закрыть полноэкранный просмотр"
        >
          <span>ЗАКРЫТЬ [ESC]</span>
          <span className="lightbox-close__x" aria-hidden="true">×</span>
        </button>
      </div>

      <div
        className="lightbox-stage"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        {images.length > 1 && (
          <button
            type="button"
            className="lightbox-nav lightbox-nav--prev"
            onClick={() => changeImage(-1)}
            aria-label="Предыдущее изображение проекта"
          >
            ←
          </button>
        )}

        <motion.figure
          key={activeImage.full}
          className="lightbox-figure"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={activeImage.full}
            alt={activeImage.alt || project.title || project.category}
            width={activeImage.width}
            height={activeImage.height}
            className="lightbox-figure__img"
          />
        </motion.figure>

        {images.length > 1 && (
          <button
            type="button"
            className="lightbox-nav lightbox-nav--next"
            onClick={() => changeImage(1)}
            aria-label="Следующее изображение проекта"
          >
            →
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="lightbox-thumbs" role="group" aria-label="Кадры проекта">
          {images.map((item, index) => (
            <button
              key={item.full}
              type="button"
              aria-pressed={index === currentIdx}
              className={`lightbox-thumbs__btn ${index === currentIdx ? 'lightbox-thumbs__btn--active' : ''}`}
              onClick={() => setCurrentIdx(index)}
            >
              Кадр {index + 1}
            </button>
          ))}
        </div>
      )}
    </dialog>
  );
};

export const LightboxModal: React.FC<LightboxModalProps> = ({ state, onClose }) =>
  state ? createPortal(
    <LightboxDialog key={`${state.project.id}:${state.imageIndex}`} state={state} onClose={onClose} />,
    document.body,
  ) : null;

export default LightboxModal;
