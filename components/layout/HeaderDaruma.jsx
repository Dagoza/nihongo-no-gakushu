'use client';

import React, { useState, useCallback } from 'react';

/**
 * HeaderDaruma: Mascota Zen Kawaii animada e interactiva para la cabecera.
 * - Balanceo rítmico tradicional (Okiagari-koboshi) en reposo.
 * - Parpadeo orgánico de ojos anime con destellos de luz.
 * - Sonrojo y brillo pulsante en mejillas.
 * - Destello áureo en el medallón de la fortuna 「福」.
 * - Reacción alegre al pasar el cursor (hover) y al pulsar (wobble + guiño).
 */
export default function HeaderDaruma({ size = 42, className = '' }) {
  const [isWobbling, setIsWobbling] = useState(false);

  const handleClick = useCallback((e) => {
    setIsWobbling(true);
    setTimeout(() => {
      setIsWobbling(false);
    }, 1200);
  }, []);

  return (
    <div 
      className={`header-daruma-wrap ${isWobbling ? 'is-tapped' : ''} ${className}`}
      onClick={handleClick}
      title="Daruma de Nihongo Master · ¡Haz clic para ver su saludo de la fortuna!"
      style={{
        width: '100%',
        height: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        userSelect: 'none'
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 512 512" 
        width="100%" 
        height="100%"
        className="header-daruma-svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Background Gradient (Dark Indigo / Deep Slate) */}
          <linearGradient id="hdrBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Daruma Body Red Gradient */}
          <radialGradient id="hdrDarumaBody" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="45%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </radialGradient>

          {/* Face Cream Gradient */}
          <radialGradient id="hdrDarumaFace" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#fef9f3" />
            <stop offset="100%" stopColor="#faeee2" />
          </radialGradient>

          {/* Gold Crest Gradient */}
          <linearGradient id="hdrGoldCrest" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Soft Drop Shadows */}
          <filter id="hdrShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000000" floodOpacity="0.45"/>
          </filter>
          <filter id="hdrGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#e11d48" floodOpacity="0.38"/>
          </filter>
        </defs>

        {/* Base Squircle Container */}
        <rect width="512" height="512" rx="118" fill="url(#hdrBgGrad)" />
        <rect x="8" y="8" width="496" height="496" rx="110" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />

        {/* Sakura Petals Accents */}
        <g className="hdr-daruma-petals" opacity="0.35">
          <ellipse cx="90" cy="110" rx="14" ry="9" transform="rotate(-25 90 110)" fill="#fbcfe8" />
          <ellipse cx="430" cy="130" rx="16" ry="10" transform="rotate(35 430 130)" fill="#fbcfe8" />
          <ellipse cx="420" cy="390" rx="12" ry="8" transform="rotate(-15 420 390)" fill="#fbcfe8" />
          <ellipse cx="80" cy="380" rx="13" ry="8" transform="rotate(40 80 380)" fill="#fbcfe8" />
        </g>

        {/* DARUMA MASCOT */}
        <g className="hdr-daruma-character" filter="url(#hdrShadow)">
          {/* Base Shadow */}
          <ellipse cx="256" cy="425" rx="150" ry="28" fill="rgba(0, 0, 0, 0.45)" className="hdr-daruma-base-shadow" />

          {/* Red Body */}
          <g filter="url(#hdrGlow)">
            <ellipse cx="256" cy="272" rx="162" ry="172" fill="url(#hdrDarumaBody)" />
          </g>

          {/* Dark Red Rim */}
          <ellipse cx="256" cy="412" rx="90" ry="18" fill="#881337" opacity="0.9" />

          {/* Cream Face */}
          <ellipse cx="256" cy="235" rx="112" ry="95" fill="url(#hdrDarumaFace)" stroke="#fde0c2" strokeWidth="2" />

          {/* Rosy Cheeks */}
          <ellipse cx="190" cy="275" rx="20" ry="13" fill="#fb7185" className="hdr-daruma-blush" />
          <ellipse cx="322" cy="275" rx="20" ry="13" fill="#fb7185" className="hdr-daruma-blush" />

          {/* Eyebrows */}
          <path d="M 185 198 Q 212 188 226 202" fill="none" stroke="#1e1b4b" strokeWidth="7" strokeLinecap="round" />
          <path d="M 327 198 Q 300 188 286 202" fill="none" stroke="#1e1b4b" strokeWidth="7" strokeLinecap="round" />

          {/* Left Eye */}
          <g className="hdr-daruma-eye-left">
            <ellipse cx="214" cy="238" rx="21" ry="25" fill="#0f172a" />
            <circle cx="208" cy="230" r="8.5" fill="#ffffff" />
            <circle cx="221" cy="245" r="4.2" fill="#ffffff" />
          </g>

          {/* Right Eye */}
          <g className="hdr-daruma-eye-right">
            <ellipse cx="298" cy="238" rx="21" ry="25" fill="#0f172a" />
            <circle cx="292" cy="230" r="8.5" fill="#ffffff" />
            <circle cx="305" cy="245" r="4.2" fill="#ffffff" />
          </g>

          {/* Smiling Mouth */}
          <path d="M 243 270 Q 256 280 269 270" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" className="hdr-daruma-mouth" />

          {/* Gold Medallion 福 */}
          <g className="hdr-daruma-medallion">
            <ellipse cx="256" cy="360" rx="46" ry="35" fill="url(#hdrGoldCrest)" stroke="#b45309" strokeWidth="3" />
            <ellipse cx="256" cy="360" rx="42" ry="31" fill="none" stroke="#fef08a" strokeWidth="2" opacity="0.7" />
            <text x="256" y="371" fontFamily="'Noto Sans JP', 'Hiragino Sans', sans-serif" fontWeight="900" fontSize="28" fill="#78350f" textAnchor="middle">
              福
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
