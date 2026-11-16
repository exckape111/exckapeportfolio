import React, { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import {
  BRANDING_PROJECTS,
  COVER_PROJECTS,
  POSTER_PROJECTS,
  TITLE_PROJECTS,
  AnyProject,
} from './data/projects';
import { FilmGrain } from './components/FilmGrain';
import { CustomCursor } from './components/CustomCursor';
import { HeroSection } from './components/HeroSection';
import { TitlesGallery } from './components/TitlesGallery';
import { CoversGallery } from './components/CoversGallery';
import { PostersGallery } from './components/PostersGallery';
import { BrandingGallery } from './components/BrandingGallery';
import { ContactsSection } from './components/ContactsSection';
import { LightboxModal, LightboxState } from './components/LightboxModal';

export const App: React.FC = () => {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const openLightbox = (project: AnyProject, imageIndex = 0) => {
    setLightbox({ project, imageIndex });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="page-shell page-shell--film">
        <FilmGrain />
        <CustomCursor disabled={lightbox !== null} />
        <div className="page-container">
          <HeroSection />
          <main className="portfolio-main">
            <TitlesGallery
              projects={TITLE_PROJECTS}
              playbackPaused={lightbox !== null}
              onInspect={(project) => openLightbox(project, 0)}
            />
            <CoversGallery
              projects={COVER_PROJECTS}
              onSelect={(project, idx) => openLightbox(project, idx)}
            />
            <PostersGallery
              projects={POSTER_PROJECTS}
              onSelect={(project, idx) => openLightbox(project, idx)}
            />
            <BrandingGallery
              projects={BRANDING_PROJECTS}
              onSelect={(project, idx) => openLightbox(project, idx)}
            />
          </main>
          <ContactsSection />
        </div>
        <LightboxModal state={lightbox} onClose={() => setLightbox(null)} />
      </div>
    </MotionConfig>
  );
};

export default App;
