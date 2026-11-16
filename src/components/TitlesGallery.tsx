import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { TitleProject } from '../data/projects';
import { CategoryFrame } from './CategoryFrame';
import { useMediaQuery } from '../hooks/useMediaQuery';

const subscribeToVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
};

interface TitlesGalleryProps {
  projects: TitleProject[];
  onInspect?: (project: TitleProject) => void;
  playbackPaused?: boolean;
}

interface TitleCardProps {
  project: TitleProject;
  index: number;
  eagerLoad: boolean;
  onInspect?: (project: TitleProject) => void;
  playbackAllowed: boolean;
  reducedMotion: boolean;
  touchMode: boolean;
}

const TitleCard: React.FC<TitleCardProps> = ({
  project,
  index,
  eagerLoad,
  onInspect,
  playbackAllowed,
  reducedMotion,
  touchMode,
}) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(eagerLoad);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [playbackRequested, setPlaybackRequested] = useState(false);
  const [hasRequestedPlayback, setHasRequestedPlayback] = useState(false);
  const showStatic = playbackFailed || (touchMode ? !playbackRequested : isHovered || reducedMotion);
  const loadVideo = shouldLoad && (touchMode ? hasRequestedPlayback : !reducedMotion);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const loadObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        loadObserver.disconnect();
      }
    }, { rootMargin: '320px 0px' });

    const playObserver = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.12);
    }, { threshold: [0, 0.12, 0.35] });

    loadObserver.observe(element);
    playObserver.observe(element);
    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
    };
  }, []);

  const playInline = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', '');
    if (video.getAttribute('src') !== project.video) video.src = project.video;
    setPlaybackFailed(false);
    video.play().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setPlaybackFailed(true);
      }
    });
  }, [project.video]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (loadVideo && isInView && playbackAllowed && !showStatic) playInline();
    else video.pause();
  }, [loadVideo, isInView, playbackAllowed, showStatic, playInline]);

  const handlePreview = () => {
    if (!touchMode) {
      onInspect?.(project);
      return;
    }
    if (playbackRequested && !playbackFailed) {
      setPlaybackRequested(false);
      videoRef.current?.pause();
    } else {
      setShouldLoad(true);
      setHasRequestedPlayback(true);
      setPlaybackRequested(true);
      playInline();
    }
  };

  const previewLabel = playbackFailed ? 'Повторить видео' : playbackRequested ? 'Пауза' : 'Смотреть видео';

  return (
    <article
      ref={cardRef}
      className={`title-card ${isHovered && !touchMode ? 'title-card--hovered' : ''} ${showStatic ? 'title-card--static' : ''}`}
      onPointerEnter={(event) => {
        if (!touchMode && event.pointerType === 'mouse') setIsHovered(true);
      }}
      onPointerLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className="title-card__preview"
        onFocus={(event) => {
          if (!touchMode && event.currentTarget.matches(':focus-visible')) setIsHovered(true);
        }}
        onBlur={() => setIsHovered(false)}
        onClick={handlePreview}
        data-cursor={touchMode ? 'hover' : 'title'}
        aria-pressed={touchMode ? playbackRequested && !playbackFailed : undefined}
        aria-label={touchMode ? `${previewLabel}: ${project.title}` : `${project.title} — нажмите для увеличения титра`}
      >
        <span className="title-card__stage">
          <video
            ref={videoRef}
            className="title-card__video"
            src={loadVideo ? project.video : undefined}
            poster={project.poster}
            muted
            loop
            playsInline
            controls={false}
            controlsList="nofullscreen nodownload noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            preload={!touchMode && eagerLoad ? 'metadata' : 'none'}
            onError={() => setPlaybackFailed(true)}
            aria-hidden="true"
            tabIndex={-1}
          />
          <img
            src={project.still}
            alt={project.images[0].alt || project.title}
            width={project.stillWidth}
            height={project.stillHeight}
            loading={eagerLoad ? 'eager' : 'lazy'}
            decoding="async"
            className="title-card__still"
            draggable={false}
          />
          <span className="title-card__badge" aria-hidden="true">
            <span className="title-card__index">№ {String(index + 1).padStart(2, '0')}</span>
            <span className="title-card__state">{showStatic ? 'СТАТИКА' : 'ВИДЕО'}</span>
          </span>
          {touchMode && <span className="title-card__play" aria-hidden="true">{previewLabel}</span>}
        </span>
        <span className="title-card__caption">
          <span className="title-card__title">{project.title}</span>
        </span>
      </button>
      {touchMode && onInspect && (
        <div className="title-card__actions">
          <button
            type="button"
            className="title-card__enlarge"
            onClick={() => onInspect(project)}
            aria-label={`Увеличить титр: ${project.title}`}
          >
            Увеличить титр +
          </button>
        </div>
      )}
    </article>
  );
};

export const TitlesGallery: React.FC<TitlesGalleryProps> = ({ projects, onInspect, playbackPaused = false }) => {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const touchMode = useMediaQuery('(hover: none), (pointer: coarse)');
  const pageVisible = useSyncExternalStore(subscribeToVisibility, () => !document.hidden, () => true);

  return (
    <CategoryFrame id="titles" reelLabel="ЧАСТЬ I" title="Титры" countLabel={`${projects.length} РАБОТ`}>
      <div className="titles-grid">
        {projects.map((project, index) => (
          <TitleCard
            key={project.id}
            project={project}
            index={index}
            eagerLoad={index < 3}
            onInspect={onInspect}
            playbackAllowed={pageVisible && !playbackPaused}
            reducedMotion={reducedMotion}
            touchMode={touchMode}
          />
        ))}
      </div>
    </CategoryFrame>
  );
};

export default TitlesGallery;
