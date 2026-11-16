import React from 'react';
import { GalleryProject } from '../data/projects';
import { CategoryFrame } from './CategoryFrame';

interface PostersGalleryProps {
  projects: GalleryProject[];
  onSelect: (project: GalleryProject, imageIndex?: number) => void;
}

export const PostersGallery: React.FC<PostersGalleryProps> = ({
  projects,
  onSelect,
}) => {
  return (
    <CategoryFrame
      id="posters"
      reelLabel="ЧАСТЬ III"
      title="Афиши"
      countLabel={`${projects.length} РАБОТЫ`}
    >
      <div className="posters-showcase">
        {projects.map((project, idx) => {
          const img = project.images[0];
          const isFeatured = project.layout === 'featured' || idx === 1;
          return (
            <article
              key={project.id}
              className={`poster-item ${
                isFeatured ? 'poster-item--featured' : 'poster-item--side'
              }`}
            >
              <button
                type="button"
                className="poster-item__button"
                onClick={() => onSelect(project, 0)}
                data-cursor="zoom"
                aria-label={
                  project.title
                    ? `Открыть афишу «${project.title}» в полном размере`
                    : `Открыть афишу № ${String(idx + 1).padStart(2, '0')} в полном размере`
                }
              >
                <div
                  className="poster-item__media"
                  style={{ aspectRatio: `${img.width} / ${img.height}` }}
                >
                  <img
                    src={img.src}
                    alt={img.alt || project.title || project.category}
                    width={img.width}
                    height={img.height}
                    loading="lazy"
                    decoding="async"
                    className="poster-item__img"
                    draggable={false}
                  />
                  <div className="poster-item__hover" aria-hidden="true">
                    <span>СМОТРЕТЬ ПОСТЕР ЦЕЛИКОМ</span>
                  </div>
                </div>
              </button>
            </article>
          );
        })}
      </div>
    </CategoryFrame>
  );
};

export default PostersGallery;
