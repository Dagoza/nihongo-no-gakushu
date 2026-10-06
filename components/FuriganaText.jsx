'use client';

import React, { useMemo } from 'react';
import { toFurigana, containsKanji } from '../lib/furigana';

/**
 * Componente FuriganaText
 * Renderiza texto japonés con anotaciones <ruby> sobre los kanjis para facilitar la lectura.
 *
 * @param {string} text - Texto japonés con kanjis
 * @param {string|null} kana - Lectura completa opcional en kana para alineación exacta
 * @param {boolean} showFurigana - Controla si se visualiza el furigana (por defecto true)
 * @param {string} className - Clases CSS adicionales
 * @param {object} style - Estilos inline
 * @param {string|React.Component} as - Elemento HTML contenedor ('span', 'div', etc.)
 */
export default function FuriganaText({
  text = '',
  kana = null,
  showFurigana = true,
  className = '',
  style = {},
  as: Component = 'span',
  ...props
}) {
  if (!text) return null;

  // Si no contiene caracteres kanji, renderizamos texto plano directamente
  if (!containsKanji(text)) {
    return (
      <Component className={className} style={style} {...props}>
        {text}
      </Component>
    );
  }

  // Generamos el HTML con etiquetas <ruby>
  const html = useMemo(() => {
    return toFurigana(text, kana);
  }, [text, kana]);

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
