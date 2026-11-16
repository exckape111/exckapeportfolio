import React from 'react';

export const IntertitleFlourish: React.FC<{ flip?: boolean; className?: string }> = ({
  flip = false,
  className = '',
}) => (
  <svg
    viewBox="0 0 360 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`intertitle-flourish ${flip ? 'intertitle-flourish--flip' : ''} ${className}`}
    aria-hidden="true"
  >
    <path
      d="M20 36 H145 C158 36 168 10 180 10 C192 10 202 36 215 36 H340"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M115 36 C125 22 142 18 152 28 C160 36 146 38 143 31 C140 24 156 12 180 6 C204 12 220 24 217 31 C214 38 200 36 208 28 C218 18 235 22 245 36"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
    />
    <circle cx="180" cy="6" r="2.6" fill="currentColor" />
    <circle cx="20" cy="36" r="2.2" fill="currentColor" />
    <circle cx="340" cy="36" r="2.2" fill="currentColor" />
    <circle cx="128" cy="27" r="1.8" fill="currentColor" />
    <circle cx="232" cy="27" r="1.8" fill="currentColor" />
  </svg>
);

export const CornerArrow: React.FC<{
  position: 'tl' | 'tr' | 'bl' | 'br';
}> = ({ position }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`corner-arrow corner-arrow--${position}`}
    aria-hidden="true"
  >
    <path
      d="M6 40 V6 H40"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    />
    
    <path
      d="M32 2 L41 6 L32 10"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 32 L6 41 L10 32"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="44" cy="6" r="1.6" fill="currentColor" />
    <circle cx="6" cy="44" r="1.6" fill="currentColor" />
  </svg>
);

export const SideOrnament: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <svg
    viewBox="0 0 28 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`side-ornament side-ornament--${side}`}
    aria-hidden="true"
  >
    <line x1="14" y1="4" x2="14" y2="116" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M14 38 C5 44 5 56 14 60 C23 56 23 44 14 38 Z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M14 82 C5 76 5 64 14 60 C23 64 23 76 14 82 Z"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle cx="14" cy="60" r="2.4" fill="currentColor" />
  </svg>
);

export const MusicalStaffBanner: React.FC<{ text: string }> = ({ text }) => (
  <div className="staff-banner">
    <svg
      viewBox="0 0 900 74"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="staff-banner__svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {[14, 24, 34, 44, 54].map((y, idx) => (
        <path
          key={idx}
          d={`M 8 ${y} Q 225 ${y - 8}, 450 ${y} T 892 ${y}`}
          stroke="currentColor"
          strokeWidth="1.15"
          strokeOpacity="0.42"
        />
      ))}
      <line x1="8" y1="12" x2="8" y2="56" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.65" />
      <line x1="892" y1="12" x2="892" y2="56" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.65" />
    </svg>
    <span className="staff-banner__text">{text}</span>
  </div>
);
