import React from 'react';
import { motion } from 'framer-motion';
import {
  BRANDING_PROJECTS,
  COVER_PROJECTS,
  POSTER_PROJECTS,
  TITLE_PROJECTS,
} from '../data/projects';
import { CartoonEyes } from './CartoonEyes';
import { HalftoneDisc } from './HalftoneDisc';

const HERO_CREDITS = [
  { role: `ЧАСТЬ I • ${TITLE_PROJECTS.length} РАБОТ`, title: 'ТИТРЫ', href: '#titles' },
  {
    role: `ЧАСТЬ II • ${COVER_PROJECTS.length} РАБОТ`,
    title: 'МУЗЫКАЛЬНЫЕ ОБЛОЖКИ',
    href: '#covers',
  },
  { role: `ЧАСТЬ III • ${POSTER_PROJECTS.length} РАБОТЫ`, title: 'АФИШИ', href: '#posters' },
  {
    role: `ЧАСТЬ IV • ${BRANDING_PROJECTS.length} ПРОЕКТА`,
    title: 'БРЕНДИНГ',
    href: '#branding',
  },
] as const;

export const HeroSection: React.FC = () => {
  return (
    <header className="hero-section" id="top">
      <div className="hero-intertitle">
        <svg className="hero-filters" aria-hidden="true" focusable="false">
          <filter id="hero-ink" x="-2%" y="-10%" width="104%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="5" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        <div className="hero-backdrop" aria-hidden="true">
          <div className="hero-backdrop__title-halo">
            <HalftoneDisc tone="dim" />
          </div>
          <div className="hero-backdrop__dome">
            <HalftoneDisc tone="cream" />
          </div>
        </div>

        <p className="hero-studio-presents">
          <span className="hero-studio-presents__studio">тайное общество искусства</span>
          <span className="hero-studio-presents__verb">представляет</span>
        </p>

        <motion.h1
          className="hero-logo"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="/media/exckape-logo.png"
            alt="EXCKAPE?!"
            className="hero-logo__img"
            width={1912}
            height={548}
            draggable={false}
          />
        </motion.h1>

        <motion.div
          className="hero-eyes-stage"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-iris" aria-hidden="true">
            <div className="hero-iris__spotlight">
              <HalftoneDisc tone="cream" />
            </div>
          </div>
          <CartoonEyes />
        </motion.div>

        <ul className="hero-credits-list" aria-label="Разделы портфолио">
          {HERO_CREDITS.map((credit) => (
            <li key={credit.href}>
              <a href={credit.href} className="hero-credit-item" data-cursor="hover">
                <span className="hero-credit-item__role">{credit.role}</span>
                <span className="hero-credit-item__name">{credit.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default HeroSection;
