'use client';

import React, { useMemo, useContext } from 'react';
import { toFurigana, containsKanji } from '../../lib/furigana';
import { AppContext } from '../../lib/AppContext';

/**
 * Componente FuriganaText
 * Renderiza texto japonés con anotaciones <ruby> sobre los kanjis para facilitar la lectura.
 *
 * @param {string} text - Texto japonés con kanjis
 * @param {string|null} kana - Lectura completa opcional en kana para alineación exacta
 * @param {boolean} showFurigana - Controla si se visualiza el furigana (por defecto true)
 * @param {boolean} cognitiveAdaptive - Si es true, oculta el furigana en kanjis dominados (FSRS/Mastered)
 * @param {object|Set|Array|null} masteredKanjis - Diccionario de kanjis dominados opcional
 * @param {string} className - Clases CSS adicionales
 * @param {object} style - Estilos inline
 * @param {string|React.Component} as - Elemento HTML contenedor ('span', 'div', etc.)
 */
export default function FuriganaText({
  text = '',
  kana = null,
  showFurigana = true,
  cognitiveAdaptive = false,
  masteredKanjis = null,
  className = '',
  style = {},
  as: Component = 'span',
  ...props
}) {
  const context = useContext(AppContext);

  // Determinar conjunto de kanjis dominados para adaptación cognitiva
  const activeMastered = useMemo(() => {
    if (masteredKanjis) return masteredKanjis;
    if (cognitiveAdaptive && context?.appState?.masteredKanji) {
      return context.appState.masteredKanji;
    }
    return null;
  }, [masteredKanjis, cognitiveAdaptive, context?.appState?.masteredKanji]);

  // Si no contiene caracteres kanji, renderizamos texto plano directamente
  if (!text) return null;
  if (!containsKanji(text)) {
    return (
      <Component className={className} style={style} {...props}>
        {text}
      </Component>
    );
  }

  // Generamos el HTML con etiquetas <ruby>
  const html = useMemo(() => {
    return toFurigana(text, kana, { masteredKanjis: activeMastered });
  }, [text, kana, activeMastered]);

  const containerClass = `${className} ${!showFurigana ? 'hide-furigana' : ''}`.trim();

  return (
    <Component
      className={containerClass}
      style={{
        display: 'inline',
        lineHeight: 'inherit',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}
