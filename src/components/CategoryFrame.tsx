import React from 'react';
import { motion } from 'framer-motion';
import { CornerArrow, IntertitleFlourish } from './VintageOrnaments';

interface CategoryFrameProps {
  id: string;
  reelLabel: string;
  title: string;
  countLabel?: string;
  children: React.ReactNode;
}

export const CategoryFrame: React.FC<CategoryFrameProps> = ({
  id,
  reelLabel,
  title,
  countLabel,
  children,
}) => {
  return (
    <motion.section
      id={id}
      className="category-section"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby={`${id}-heading`}
    >
      <div className="category-header">
        <div className="category-header__meta">
          <span className="category-header__reel">{reelLabel}</span>
          {countLabel && (
            <>
              <span className="category-header__sep" aria-hidden="true">•</span>
              <span className="category-header__count">{countLabel}</span>
            </>
          )}
        </div>

        <h2 id={`${id}-heading`} className="category-header__title">
          <span className="category-header__quote" aria-hidden="true">“</span>
          {title}
          <span className="category-header__quote" aria-hidden="true">”</span>
        </h2>

        <IntertitleFlourish className="category-header__flourish" />
      </div>

      <div className="category-box">
        <CornerArrow position="tl" />
        <CornerArrow position="tr" />
        <CornerArrow position="bl" />
        <CornerArrow position="br" />
        {children}
      </div>
    </motion.section>
  );
};

export default CategoryFrame;
