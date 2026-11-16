import React from 'react';
import { GalleryProject } from '../data/projects';
import { CategoryFrame } from './CategoryFrame';

interface CoversGalleryProps {
  projects: GalleryProject[];
  onSelect: (project: GalleryProject, imageIndex?: number) => void;
}

export const CoversGallery: React.FC<CoversGalleryProps> = ({
  projects,
  onSelect,
}) => {
  return (
    <CategoryFrame
      id="covers"
      reelLabel="ЧАСТЬ II"
      title="Музыкальные обложки"
      countLabel={`${projects.length} РАБОТ`}
    >
      <div className="covers-grid">
        {projects.map((project, idx) => {
          const img = project.images[0];
          return (
            <button
              key={project.id}
              type="button"
              className="cover-card"
              onClick={() => onSelect(project, 0)}
              data-cursor="zoom"
              aria-label={`Открыть обложку № ${String(idx + 1).padStart(2, '0')} в полном размере`}
            >
              <div className="cover-card__frame">
                <img
                  src={img.src}
                  alt={img.alt || `Музыкальная обложка № ${String(idx + 1).padStart(2, '0')}`}
                  width={img.width}
                  height={img.height}
                  loading={idx < 5 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="cover-card__img"
                  draggable={false}
                />
                <div className="cover-card__overlay" aria-hidden="true">
                  <span className="cover-card__num">
                    № {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="cover-card__zoom">УВЕЛИЧИТЬ +</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </CategoryFrame>
  );
};

export default CoversGallery;
