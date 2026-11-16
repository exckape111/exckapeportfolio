import React from 'react';
import { GalleryProject } from '../data/projects';
import { CategoryFrame } from './CategoryFrame';

interface BrandingGalleryProps {
  projects: GalleryProject[];
  onSelect: (project: GalleryProject, imageIndex?: number) => void;
}

export const BrandingGallery: React.FC<BrandingGalleryProps> = ({
  projects,
  onSelect,
}) => {
  return (
    <CategoryFrame
      id="branding"
      reelLabel="ЧАСТЬ IV"
      title="Брендинг"
      countLabel={`${projects.length} ПРОЕКТА`}
    >
      <div className="branding-board">
        {projects.map((project) => {
          const count = project.images.length;
          return (
            <article
              key={project.id}
              className={`branding-project branding-project--count-${Math.min(
                count,
                3
              )} ${project.layout ? `branding-project--${project.layout}` : ''}`}
            >
              <div
                className={`branding-project__gallery branding-project__gallery--${Math.min(
                  count,
                  3
                )}`}
              >
                {project.images.map((img, iIdx) => (
                  <figure
                    key={img.full}
                    className={`branding-figure branding-figure--slot-${iIdx + 1}`}
                  >
                    <button
                      type="button"
                      className="branding-figure__button"
                      onClick={() => onSelect(project, iIdx)}
                      data-cursor="zoom"
                      aria-label={
                        project.title
                          ? `Открыть «${project.title}» (кадр ${iIdx + 1} из ${count}) в полном размере`
                          : `Открыть проект (кадр ${iIdx + 1} из ${count}) в полном размере`
                      }
                    >
                      <div
                        className="branding-figure__stage"
                        style={{ aspectRatio: `${img.width} / ${img.height}` }}
                      >
                        <img
                          src={img.src}
                          alt={img.alt || project.title || project.category}
                          width={img.width}
                          height={img.height}
                          loading="lazy"
                          decoding="async"
                          className="branding-figure__img"
                          draggable={false}
                        />
                        <div className="branding-figure__hint" aria-hidden="true">
                          <span>
                            КАДР {iIdx + 1} / {count} — УВЕЛИЧИТЬ
                          </span>
                        </div>
                      </div>
                    </button>
                  </figure>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </CategoryFrame>
  );
};

export default BrandingGallery;
