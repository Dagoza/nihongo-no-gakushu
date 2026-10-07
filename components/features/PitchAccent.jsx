'use client';

import React, { useMemo } from 'react';
import { getMoras, getPitchInfo, calculatePitchLevels, PITCH_TYPES } from '../../lib/pitchAccent';
import { Volume2, Info } from 'lucide-react';
import audioManager from '../../lib/audioManager';

/**
 * Componente PitchAccent
 * 
 * Permite visualizar el acento tonal estándar de Tokio (Hyoujungo) mediante:
 * 1. Curva visual SVG con nodos High/Low estilo OJAD y mora fantasma para la partícula
 * 2. Badge/Pill con código de color accesible según el patrón (⓪ 平板, ① 頭高, ② 中高, ㊵ 尾高)
 * 3. Notación Overline + Downstep tipográfica
 */
export default function PitchAccent({
  word,
  reading,
  pattern: explicitPattern,
  particle = 'が',
  mode = 'full', // 'full', 'curve', 'badge', 'compact'
  size = 'md',   // 'sm', 'md', 'lg'
  showAudio = false,
  className = ''
}) {
  const pitchInfo = useMemo(() => {
    const info = getPitchInfo(word, reading);
    if (explicitPattern !== undefined && explicitPattern !== null) {
      const p = parseInt(explicitPattern, 10);
      const moras = getMoras(info.reading);
      let type = 'nakadaka';
      if (p === 0) type = 'heiban';
      else if (p === 1) type = 'atamadaka';
      else if (p === moras.length) type = 'odaka';
      return { ...info, pattern: p, type };
    }
    return info;
  }, [word, reading, explicitPattern]);

  const moras = useMemo(() => getMoras(pitchInfo.reading), [pitchInfo.reading]);
  const levelsData = useMemo(() => calculatePitchLevels(moras, pitchInfo.pattern, particle), [moras, pitchInfo.pattern, particle]);

  const meta = PITCH_TYPES[pitchInfo.type] || PITCH_TYPES.heiban;

  // Dimensiones para la gráfica vectorial SVG
  const dim = useMemo(() => {
    switch (size) {
      case 'sm':
        return { colW: 24, highY: 7, lowY: 21, r: 3.5, fontSz: 10, h: 36, padX: 14 };
      case 'lg':
        return { colW: 36, highY: 10, lowY: 28, r: 5.5, fontSz: 14, h: 52, padX: 20 };
      case 'md':
      default:
        return { colW: 28, highY: 8, lowY: 24, r: 4.5, fontSz: 12, h: 44, padX: 16 };
    }
  }, [size]);

  // Si no hay moras válidas, no renderizar
  if (!moras || moras.length === 0) return null;

  const totalCols = moras.length + (particle ? 1 : 0);
  const svgWidth = dim.padX * 2 + (totalCols - 1) * dim.colW;

  // Coordenadas calculadas de cada mora
  const points = levelsData.moraLevels.map((item, idx) => {
    const x = dim.padX + idx * dim.colW;
    const y = item.level === 'H' ? dim.highY : dim.lowY;
    return { ...item, x, y, index: idx };
  });

  // Coordenadas de la partícula adjunta (ej. が)
  const particlePoint = particle ? {
    mora: particle,
    level: levelsData.particleLevel,
    x: dim.padX + moras.length * dim.colW,
    y: levelsData.particleLevel === 'H' ? dim.highY : dim.lowY,
    isParticle: true
  } : null;

  const allPoints = particlePoint ? [...points, particlePoint] : points;

  // Generar trazo SVG escalonado (Step line estilo diccionario NHK / OJAD)
  const pathD = allPoints.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = allPoints[idx - 1];
    
    // Si cambia de altura (subida o caída downstep), dibujar línea continua con caída suave
    if (prev.y !== curr.y) {
      const midX = (prev.x + curr.x) / 2;
      return `${acc} C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // 1. MODO BADGE PURO
  if (mode === 'badge') {
    return (
      <span
        className={`pitch-badge-pill ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: size === 'sm' ? '1px 6px' : '2px 8px',
          borderRadius: 999,
          fontSize: size === 'sm' ? '0.7rem' : '0.78rem',
          fontWeight: 700,
          background: meta.bg,
          color: meta.color,
          border: `1px solid ${meta.border}`,
          whiteSpace: 'nowrap'
        }}
        title={`${meta.description} (Patrón ${pitchInfo.pattern})`}
      >
        <span style={{ fontSize: '0.9em' }}>{pitchInfo.pattern === 0 ? '⓪' : (pitchInfo.pattern === 1 ? '①' : (pitchInfo.pattern === moras.length ? '㊵' : `[${pitchInfo.pattern}]`))}</span>
        <span>{meta.jp}</span>
      </span>
    );
  }

  // 2. MODO COMPACT (Badge + Mini Curva)
  if (mode === 'compact') {
    return (
      <div 
        className={`pitch-accent-compact ${className}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, verticalAlign: 'middle' }}
        title={`${meta.description}`}
      >
        <span
          style={{
            fontSize: '0.72rem',
            padding: '1px 6px',
            borderRadius: 6,
            background: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.border}`,
            fontWeight: 700
          }}
        >
          {pitchInfo.pattern === 0 ? '⓪ 平板' : (pitchInfo.pattern === 1 ? '① 頭高' : (pitchInfo.pattern === moras.length ? '㊵ 尾高' : `[${pitchInfo.pattern}] 中高`))}
        </span>

        {/* Mini SVG curve sin etiquetas de texto para ahorrar espacio */}
        <svg 
          width={svgWidth * 0.7} 
          height={20} 
          viewBox={`0 0 ${svgWidth} ${dim.h * 0.6}`} 
          style={{ overflow: 'visible', verticalAlign: 'middle' }}
        >
          <path
            d={pathD}
            fill="none"
            stroke={meta.color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {allPoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={dim.r * 0.8}
              fill={pt.level === 'H' ? meta.color : 'var(--bg-card, #ffffff)'}
              stroke={meta.color}
              strokeWidth={1.8}
              strokeDasharray={pt.isParticle ? '2 2' : undefined}
            />
          ))}
        </svg>
      </div>
    );
  }

  // 3. MODO CURVE / FULL
  return (
    <div 
      className={`pitch-accent-card-box ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        background: 'var(--bg-main)',
        padding: size === 'sm' ? '6px 10px' : '8px 12px',
        borderRadius: 'var(--radius-md, 8px)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        maxWidth: '100%',
        overflowX: 'auto'
      }}
    >
      {/* Header con Badge y Botón de Audio */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 10, marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: size === 'sm' ? '0.7rem' : '0.76rem',
              padding: '2px 8px',
              borderRadius: 999,
              background: meta.bg,
              color: meta.color,
              border: `1px solid ${meta.border}`,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>{pitchInfo.pattern === 0 ? '⓪' : (pitchInfo.pattern === 1 ? '①' : (pitchInfo.pattern === moras.length ? '㊵' : `[${pitchInfo.pattern}]`))}</span>
            <span>{meta.jp} ({meta.name})</span>
          </span>

          <span 
            style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}
            title={meta.description}
          >
            <Info size={12} />
            <span className="hidden-xs">{pitchInfo.pattern === 0 ? 'Sin caída' : (pitchInfo.pattern === 1 ? 'Caída tras 1ª mora' : (pitchInfo.pattern === moras.length ? 'Caída en partícula' : `Caída en mora ${pitchInfo.pattern}`))}</span>
          </span>
        </div>

        {showAudio && (
          <button
            className="audio-btn"
            style={{ width: 26, height: 26, flexShrink: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              audioManager.speak(pitchInfo.reading || word);
            }}
            title="Escuchar pronunciación con entonación de Tokio"
            type="button"
          >
            <Volume2 size={13} />
          </button>
        )}
      </div>

      {/* Gráfica SVG de la Curva de Tono con Nodos y Kana */}
      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'flex-start', paddingTop: 2 }}>
        <svg
          width={svgWidth}
          height={dim.h}
          viewBox={`0 0 ${svgWidth} ${dim.h}`}
          style={{ overflow: 'visible', margin: '0 auto' }}
        >
          {/* Líneas guía horizontales de referencia (Alto y Bajo) */}
          <line
            x1={dim.padX - 8}
            y1={dim.highY}
            x2={svgWidth - dim.padX + 8}
            y2={dim.highY}
            stroke="var(--border)"
            strokeDasharray="2 3"
            strokeWidth={1}
            opacity={0.4}
          />
          <line
            x1={dim.padX - 8}
            y1={dim.lowY}
            x2={svgWidth - dim.padX + 8}
            y2={dim.lowY}
            stroke="var(--border)"
            strokeDasharray="2 3"
            strokeWidth={1}
            opacity={0.4}
          />

          {/* Etiqueta de referencia H y L en el margen izquierdo */}
          <text x={dim.padX - 10} y={dim.highY + 3} textAnchor="end" fontSize="8" fill="var(--text-muted)" opacity={0.6}>
            H
          </text>
          <text x={dim.padX - 10} y={dim.lowY + 3} textAnchor="end" fontSize="8" fill="var(--text-muted)" opacity={0.6}>
            L
          </text>

          {/* Trayectoria continua de la curva de tono */}
          <path
            d={pathD}
            fill="none"
            stroke={meta.color}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Indicador de bajada (Downstep mark) en la mora acentuada */}
          {allPoints.map((pt, i) => {
            if (!pt.isDownstep) return null;
            return (
              <g key={`downstep-${i}`}>
                <line
                  x1={pt.x + 6}
                  y1={pt.y - 4}
                  x2={pt.x + 6}
                  y2={dim.lowY + 2}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <polygon
                  points={`${pt.x + 3},${dim.lowY} ${pt.x + 9},${dim.lowY} ${pt.x + 6},${dim.lowY + 4}`}
                  fill="#ef4444"
                />
              </g>
            );
          })}

          {/* Nodos circulares de cada mora */}
          {allPoints.map((pt, i) => (
            <g key={`node-${i}`}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={dim.r}
                fill={pt.level === 'H' ? meta.color : 'var(--bg-card, #ffffff)'}
                stroke={meta.color}
                strokeWidth={2.2}
                strokeDasharray={pt.isParticle ? '2 2' : undefined}
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Texto de la mora debajo del nodo */}
              <text
                x={pt.x}
                y={dim.h - 2}
                textAnchor="middle"
                fontSize={pt.isParticle ? dim.fontSz * 0.85 : dim.fontSz}
                fill={pt.isParticle ? 'var(--text-muted)' : 'var(--text-main)'}
                fontWeight={pt.level === 'H' && !pt.isParticle ? 700 : 500}
                className="jp-text"
                style={{ userSelect: 'none' }}
              >
                {pt.isParticle ? `[${pt.mora}]` : pt.mora}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
