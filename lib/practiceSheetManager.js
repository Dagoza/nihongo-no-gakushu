/**
 * Practice Sheet & Stroke Management for Nihongo Master
 * Gestor de almacenamiento, algoritmos de trazo (Shodo, plumilla, marcador, lápiz),
 * renderizado de cuadrículas (田字格, 米字格, 原稿用紙, etc.) y verificación de caligrafía.
 */

export const DRAFT_STORAGE_KEY = 'nihongo_practice_draft_v2';
export const SAVED_SHEETS_STORAGE_KEY = 'nihongo_saved_sheets_v2';

// Dimensiones estándar de página de libreta/cuaderno japonés (proporción vertical estándar)
export const PAGE_WIDTH = 800;
export const PAGE_HEIGHT = 1100;

// Estilos de trazo disponibles
export const STROKE_STYLES = [
  {
    id: 'shodo',
    name: 'Pincel Shodō (書道)',
    desc: 'Dinámica oriental con modulación de velocidad y cerda japonesa',
    icon: '🖌️',
    defaultWidth: 14
  },
  {
    id: 'marker',
    name: 'Rotulador Redondo (丸ペン)',
    desc: 'Punta suave y redondeada de grosor homogéneo y limpio',
    icon: '🖊️',
    defaultWidth: 8
  },
  {
    id: 'fountain',
    name: 'Pluma Estilográfica (万年筆)',
    desc: 'Biselado caligráfico clásico con trazos finos y gruesos según ángulo',
    icon: '✒️',
    defaultWidth: 6
  },
  {
    id: 'pencil',
    name: 'Lápiz Escolar (鉛筆 HB)',
    desc: 'Textura suave de grafito japonés para estudio de silabarios y kanji',
    icon: '✏️',
    defaultWidth: 6
  },
  {
    id: 'gel',
    name: 'Pluma de Gel 0.5 (ゲルペン)',
    desc: 'Trazo nítido, preciso y continuo con curvatura Catmull-Rom',
    icon: '🖋️',
    defaultWidth: 4
  }
];

// Opciones de cuadrícula de práctica
export const GRID_TYPES = [
  {
    id: 'tianzige',
    name: '田字格 (Tianzige / Cruz)',
    desc: '4 cuadrantes con líneas centrales discontinuas para balance',
    icon: '田'
  },
  {
    id: 'mizige',
    name: '米字格 (Mizige / Estrella 8)',
    desc: '8 sectores con cruz y diagonales, el estándar de caligrafía',
    icon: '米'
  },
  {
    id: 'genkouyoushi',
    name: '原稿用紙 (Genkouyoushi)',
    desc: 'Papel japonés de manuscrito tradicional con espaciado para furigana',
    icon: '📜'
  },
  {
    id: 'dot',
    name: 'Punteada (ドット方眼)',
    desc: 'Matriz limpia de puntos para notas estructuradas y kanji libre',
    icon: '⁝⁝'
  },
  {
    id: 'lined',
    name: 'Renglones Pautados (横罫)',
    desc: 'Líneas horizontales continuas para oraciones e historias completas',
    icon: '☰'
  },
  {
    id: 'blank',
    name: 'Lienzo Limpio (無地)',
    desc: 'Hoja libre sin líneas para evaluar soltura y memoria sin guías',
    icon: '▢'
  }
];

// Fondos de papel
export const PAPER_STYLES = [
  {
    id: 'washi',
    name: 'Washi Tradicional (和紙)',
    bg: '#faf6ee',
    gridColor: 'rgba(180, 83, 9, 0.22)',
    textColor: '#1c1917',
    desc: 'Pergamino japonés artesanal cálido'
  },
  {
    id: 'white',
    name: 'Papel Blanco Puro (白紙)',
    bg: '#ffffff',
    gridColor: 'rgba(148, 163, 184, 0.4)',
    textColor: '#0f172a',
    desc: 'Cuaderno moderno ultra nítido'
  },
  {
    id: 'chalkboard',
    name: 'Pizarra Oscura (黒板)',
    bg: '#0f172a',
    gridColor: 'rgba(148, 163, 184, 0.25)',
    textColor: '#f8fafc',
    desc: 'Pizarra de estudio para contraste de trazos'
  }
];

// Colores de tinta japonesa
export const INK_PALETTES = [
  { id: 'sumi', name: '墨 Sumi (Negro Tinta)', color: '#18181b', lightColor: '#ffffff' },
  { id: 'shuiro', name: '朱 Shuiro (Bermellón)', color: '#dc2626', lightColor: '#f87171' },
  { id: 'aiiro', name: '藍 Aiiro (Índigo)', color: '#1e40af', lightColor: '#60a5fa' },
  { id: 'matcha', name: '抹茶 Matcha (Verde Bambú)', color: '#15803d', lightColor: '#4ade80' },
  { id: 'sakura', name: '桜 Sakura (Rosa)', color: '#db2777', lightColor: '#f472b6' },
  { id: 'chalk', name: '白 Tiza / Blanco', color: '#f8fafc', lightColor: '#ffffff' }
];

/* =========================================================================
   PERSISTENCIA: BORRADORES Y HOJAS GUARDADAS
   ========================================================================= */

/**
 * Guarda el borrador en vivo en LocalStorage
 */
export function savePracticeDraft(draftData) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      ...draftData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Error guardando borrador de práctica:', err);
  }
}

/**
 * Recupera el borrador en vivo de LocalStorage
 */
export function loadPracticeDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error cargando borrador de práctica:', err);
    return null;
  }
}

/**
 * Limpia el borrador en vivo
 */
export function clearPracticeDraft() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (err) {}
}

/**
 * Obtiene todas las hojas guardadas
 */
export function getSavedPracticeSheets() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_SHEETS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error al leer hojas de práctica guardadas:', err);
    return [];
  }
}

/**
 * Guarda una nueva hoja en la biblioteca o actualiza una existente
 */
export function savePracticeSheet(sheet) {
  if (typeof window === 'undefined') return null;
  try {
    const sheets = getSavedPracticeSheets();
    const id = sheet.id || `sheet_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date().toISOString();

    const newSheet = {
      ...sheet,
      id,
      updatedAt: now,
      createdAt: sheet.createdAt || now
    };

    const existingIndex = sheets.findIndex(s => s.id === id);
    if (existingIndex >= 0) {
      sheets[existingIndex] = newSheet;
    } else {
      sheets.unshift(newSheet);
    }

    localStorage.setItem(SAVED_SHEETS_STORAGE_KEY, JSON.stringify(sheets));
    return newSheet;
  } catch (err) {
    console.error('Error guardando hoja en biblioteca:', err);
    return null;
  }
}

/**
 * Elimina una hoja guardada por su ID
 */
export function deletePracticeSheet(id) {
  if (typeof window === 'undefined') return false;
  try {
    const sheets = getSavedPracticeSheets();
    const filtered = sheets.filter(s => s.id !== id);
    localStorage.setItem(SAVED_SHEETS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Error eliminando hoja de práctica:', err);
    return false;
  }
}

/**
 * Sincroniza y fusiona hojas guardadas con una lista externa (ej: proveniente de Supabase).
 * Actualiza el localStorage y retorna la lista combinada deduplicada.
 */
export function syncSavedPracticeSheetsWithCloud(cloudSheets = []) {
  if (typeof window === 'undefined') return [];
  try {
    const localSheets = getSavedPracticeSheets();
    const map = new Map();

    [...(Array.isArray(cloudSheets) ? cloudSheets : []), ...(Array.isArray(localSheets) ? localSheets : [])].forEach((item) => {
      if (!item || !item.id) return;
      const key = item.id;
      if (!map.has(key)) {
        map.set(key, item);
      } else {
        const existing = map.get(key);
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const itemTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
        if (itemTime > existingTime) {
          map.set(key, item);
        }
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => {
      const tA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return tB - tA;
    });

    localStorage.setItem(SAVED_SHEETS_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.warn('Error sincronizando hojas con la nube:', err);
    return getSavedPracticeSheets();
  }
}

/* =========================================================================
   RENDERIZADO DE CUADRÍCULAS (GRIDS)
   ========================================================================= */

/**
 * Calcula la distribución geométrica exacta de celdas, renglones y márgenes
 * según el tipo de cuadrícula, dimensiones del lienzo y texto a practicar.
 */
export function getGridLayout(width, height, gridType, text = '', padding = 24) {
  const trimmed = (text || '').trim();
  const rawChars = Array.from(trimmed).filter(c => c && c.trim().length > 0);
  const chars = rawChars.length > 0 ? rawChars : (trimmed ? Array.from(trimmed) : []);
  const charCount = chars.length;

  const usableWidth = Math.max(10, width - padding * 2);
  const usableHeight = Math.max(10, height - padding * 2);

  if (gridType === 'tianzige' || gridType === 'mizige') {
    // Hoja llena de cuadrículas de práctica caligráfica (estilo libreta escolar japonesa/oriental)
    const targetCellSize = 90;
    const cols = Math.max(4, Math.floor(usableWidth / targetCellSize));
    const cellSize = Math.floor(usableWidth / cols);
    const rows = Math.max(4, Math.floor(usableHeight / cellSize));
    const totalGridW = cols * cellSize;
    const totalGridH = rows * cellSize;
    const startX = Math.max(padding, Math.floor((width - totalGridW) / 2));
    const startY = Math.max(padding, Math.floor((height - totalGridH) / 2));

    const totalCells = cols * rows;
    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      const char = i < charCount ? chars[i] : '';
      cells.push({
        index: i,
        row,
        col,
        x,
        y,
        width: cellSize,
        height: cellSize,
        char,
        fontSize: cellSize * 0.72
      });
    }

    return {
      type: gridType,
      width,
      height,
      padding,
      cells,
      lines: [],
      meta: { cols, rows, cellSize, totalCells, gridW: totalGridW, gridH: totalGridH }
    };
  }

  if (gridType === 'genkouyoushi') {
    // Papel tradicional japonés de manuscrito: celdas cuadradas/rectangulares en hoja completa
    const cols = Math.max(8, Math.min(14, Math.floor(usableWidth / 68)));
    const rows = Math.max(10, Math.floor(usableHeight / 64));
    const cellWidth = usableWidth / cols;
    const cellHeight = usableHeight / rows;
    const minSide = Math.min(cellWidth, cellHeight);
    const fontSize = minSide * 0.68;

    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const charIdx = r * cols + c;
        const char = charIdx < charCount ? chars[charIdx] : '';
        cells.push({
          index: charIdx,
          row: r,
          col: c,
          x: padding + c * cellWidth,
          y: padding + r * cellHeight,
          width: cellWidth,
          height: cellHeight,
          char,
          fontSize
        });
      }
    }

    return {
      type: gridType,
      width,
      height,
      padding,
      cells,
      lines: [],
      meta: { cols, rows, cellWidth, cellHeight, totalCells: cols * rows }
    };
  }

  if (gridType === 'lined') {
    // Renglones pautados horizontales continuos (hoja completa de cuaderno)
    const lineSpacing = 36;
    const marginX = padding + 40;
    const contentWidth = width - marginX - padding - 20;

    // Calcular cuántos caracteres caben por renglón
    const charWidthEst = lineSpacing * 0.75;
    const charsPerLine = Math.max(4, Math.floor(contentWidth / charWidthEst));

    const lines = [];
    const totalLines = Math.floor((usableHeight - 30) / lineSpacing);
    const startY = padding + 25;

    for (let l = 0; l < totalLines; l++) {
      const lineChars = trimmed.slice(l * charsPerLine, (l + 1) * charsPerLine);
      lines.push({
        lineIndex: l,
        y: startY + l * lineSpacing,
        text: lineChars,
        fontSize: lineSpacing * 0.65,
        baselineY: startY + (l + 1) * lineSpacing - (lineSpacing * 0.2)
      });
    }

    return {
      type: gridType,
      width,
      height,
      padding,
      cells: [],
      lines,
      meta: { lineSpacing, marginX, startY, totalLines }
    };
  }

  // Dot y Blank: texto centrado proporcionado
  const fontSize = charCount <= 1 
    ? Math.min(usableWidth, usableHeight * 0.72)
    : charCount <= 4
    ? Math.min(usableWidth / (charCount * 1.15), usableHeight * 0.35)
    : charCount <= 8
    ? Math.min(usableWidth / (charCount * 1.1), usableHeight * 0.22)
    : Math.min(usableWidth / (charCount * 1.05), usableHeight * 0.14);

  return {
    type: gridType,
    width,
    height,
    padding,
    cells: [
      {
        index: 0,
        x: padding,
        y: padding,
        width: usableWidth,
        height: usableHeight,
        char: trimmed,
        fontSize
      }
    ],
    lines: [],
    meta: {}
  };
}

/**
 * Dibuja la cuadrícula seleccionada sobre un contexto 2D adaptada al texto si existe
 */
export function renderGridOnCanvas(ctx, width, height, gridType, paperStyleId = 'washi', padding = 20, options = {}) {
  if (!ctx || width <= 0 || height <= 0) return;

  const paper = PAPER_STYLES.find(p => p.id === paperStyleId) || PAPER_STYLES[0];
  ctx.save();

  // Limpiar fondo con el color del papel
  ctx.fillStyle = paper.bg;
  ctx.fillRect(0, 0, width, height);

  if (gridType === 'blank') {
    ctx.restore();
    return;
  }

  const gridColor = paper.gridColor;
  const isDark = paperStyleId === 'chalkboard';
  const text = options.text || '';
  const layout = getGridLayout(width, height, gridType, text, padding);

  if (gridType === 'tianzige' || gridType === 'mizige') {
    const borderColor = isDark
      ? 'rgba(255, 255, 255, 0.4)'
      : (paperStyleId === 'washi' ? 'rgba(217, 119, 6, 0.45)' : 'rgba(99, 102, 241, 0.35)');

    layout.cells.forEach(cell => {
      const { x, y, width: size, height: cellH } = cell;
      const midX = x + size / 2;
      const midY = y + cellH / 2;

      // Borde de la casilla
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, size, cellH);

      // Líneas centrales (Cruz)
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(midX, y);
      ctx.lineTo(midX, y + cellH);
      ctx.moveTo(x, midY);
      ctx.lineTo(x + size, midY);
      ctx.stroke();

      // Diagonales si es Mizige
      if (gridType === 'mizige') {
        ctx.save();
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.18)' : (paperStyleId === 'washi' ? 'rgba(180, 83, 9, 0.2)' : 'rgba(99, 102, 241, 0.2)');
        ctx.lineWidth = 0.9;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y + cellH);
        ctx.moveTo(x + size, y);
        ctx.lineTo(x, y + cellH);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Marco exterior principal de la cuadrícula completa
    if (layout.cells.length > 0 && layout.meta?.gridW && layout.meta?.gridH) {
      const first = layout.cells[0];
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : (paperStyleId === 'washi' ? 'rgba(217, 119, 6, 0.65)' : 'rgba(99, 102, 241, 0.55)');
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(first.x, first.y, layout.meta.gridW, layout.meta.gridH);
    }
  } else if (gridType === 'genkouyoushi') {
    const { cols, rows, cellWidth, cellHeight } = layout.meta;
    ctx.strokeStyle = isDark
      ? 'rgba(52, 211, 153, 0.35)'
      : (paperStyleId === 'washi' ? 'rgba(180, 83, 9, 0.35)' : 'rgba(5, 150, 105, 0.4)');
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padding + c * cellWidth;
        const y = padding + r * cellHeight;
        ctx.strokeRect(x, y, cellWidth, cellHeight);

        // Guía interior tenue de cada celda
        ctx.save();
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(x + cellWidth / 2, y);
        ctx.lineTo(x + cellWidth / 2, y + cellHeight);
        ctx.moveTo(x, y + cellHeight / 2);
        ctx.lineTo(x + cellWidth, y + cellHeight / 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  } else if (gridType === 'dot') {
    const step = 28;
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(71, 85, 105, 0.35)';
    for (let x = padding; x < width - padding; x += step) {
      for (let y = padding; y < height - padding; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (gridType === 'lined') {
    const { lineSpacing, marginX, startY } = layout.meta;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);

    // Margen izquierdo tradicional
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(244, 63, 94, 0.45)' : 'rgba(225, 29, 72, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginX, padding);
    ctx.lineTo(marginX, height - padding);
    ctx.stroke();
    ctx.restore();

    for (let y = startY + lineSpacing; y < height - padding; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/* =========================================================================
   MOTOR DE RENDERIZADO DE TRAZOS (STROKE RENDERING ENGINE)
   ========================================================================= */

/**
 * Renderiza un trazo específico según su estilo (Shodo, Marker, Fountain, Pencil, Gel)
 */
export function renderStroke(ctx, stroke, options = {}) {
  if (!ctx || !stroke || typeof stroke !== 'object') return;
  const { points = [], style = 'shodo', color = '#18181b', width = 8, isEraser = false } = stroke;
  if (!Array.isArray(points) || points.length === 0) return;

  ctx.save();

  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = width * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (points.length === 1) {
      ctx.arc(points[0].x, points[0].y, width, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  if (points.length === 1) {
    // Solo un punto / clic único
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  switch (style) {
    case 'shodo': {
      // Pincel Shodō Oriental Tradicional:
      // Trazos modulados por velocidad y presión con terminaciones afiladas (Hane/Harai) y charcos de tinta (Tome)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];

        // Calculamos velocidad estimada
        const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const timeDiff = Math.max(1, (p1.time || 0) - (p0.time || 0));
        const speed = dist / timeDiff; // px por ms

        // Presión del stylus si está disponible o simulada con la velocidad
        const pressure = (p1.pressure !== undefined && p1.pressure > 0)
          ? p1.pressure
          : Math.max(0.2, 1.2 - Math.min(speed * 0.45, 0.95));

        const segmentWidth = Math.max(2, width * pressure * 1.35);

        ctx.lineWidth = segmentWidth;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        // Pequeño círculo de unión suave para evitar cortes duros
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, segmentWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'fountain': {
      // Pluma Estilográfica / Manga G-Pen:
      // Simula plumilla biselada a 45 grados (trazos descendentes anchos, trazos horizontales finos)
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';

      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];

        const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        // Ángulo de inclinación relativo a 45°
        const angleFactor = Math.abs(Math.sin(angle - Math.PI / 4));
        const penWidth = Math.max(2, width * (0.35 + angleFactor * 0.9));

        ctx.lineWidth = penWidth;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
      break;
    }

    case 'pencil': {
      // Lápiz Escolar Japonés:
      // Grafito semi-transparente (82% opacidad) con bordes suaves
      ctx.globalAlpha = 0.82;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2, width * 0.85);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
      break;
    }

    case 'gel': {
      // Pluma de Gel Fluida 0.5:
      // Trazo ultra definido y nítido con interpolación de curvas
      ctx.globalAlpha = 0.98;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(1.8, width * 0.7);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
      break;
    }

    case 'marker':
    default: {
      // Rotulador Redondo Suave (Sign Pen):
      // Trazo continuo y homogéneo
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = width;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Renderiza de forma progresiva un único segmento entre dos puntos (p0 y p1)
 * para un rendimiento suave e instantáneo a 60-120fps durante el arrastre.
 */
export function renderStrokeSegment(ctx, p0, p1, stroke) {
  if (!ctx || !p0 || !p1 || !stroke) return;
  const { style = 'shodo', color = '#18181b', width = 8, isEraser = false } = stroke;

  ctx.save();
  if (isEraser) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = width * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  if (style === 'shodo') {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const timeDiff = Math.max(1, (p1.time || 0) - (p0.time || 0));
    const speed = dist / timeDiff;
    const pressure = (p1.pressure !== undefined && p1.pressure > 0)
      ? p1.pressure
      : Math.max(0.2, 1.2 - Math.min(speed * 0.45, 0.95));
    const segmentWidth = Math.max(2, width * pressure * 1.35);

    ctx.lineWidth = segmentWidth;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(p1.x, p1.y, segmentWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 'fountain') {
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const angleFactor = Math.abs(Math.sin(angle - Math.PI / 4));
    const penWidth = Math.max(2, width * (0.35 + angleFactor * 0.9));

    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  } else if (style === 'pencil') {
    ctx.globalAlpha = 0.82;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, width * 0.85);

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  } else if (style === 'gel') {
    ctx.globalAlpha = 0.98;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1.8, width * 0.7);

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  } else {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Renderiza todos los trazos guardados sobre el contexto
 */
export function renderAllStrokes(ctx, strokes, options = {}) {
  if (!ctx || !strokes || !Array.isArray(strokes) || strokes.length === 0) return;
  strokes.forEach(stroke => {
    if (stroke && typeof stroke === 'object' && Array.isArray(stroke.points) && stroke.points.length > 0) {
      renderStroke(ctx, stroke, options);
    }
  });
}

/* =========================================================================
   MOTOR DE VERIFICACIÓN DE TRAZOS Y CALIGRAFÍA
   ========================================================================= */

/**
 * Compara los píxeles dibujados en el canvas contra el carácter de referencia.
 * Devuelve porcentaje de coincidencia, evaluación y detalles de diagnóstico.
 */
export function analyzeDrawingAccuracy(userCanvas, targetChar, width, height, gridType = 'mizige', padding = 24) {
  if (!userCanvas || !targetChar || width <= 0 || height <= 0) {
    return null;
  }

  try {
    // 1. Crear canvas fuera de pantalla para el glifo de referencia según el layout de la cuadrícula
    const refCanvas = document.createElement('canvas');
    refCanvas.width = width;
    refCanvas.height = height;
    const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
    if (!refCtx) return null;

    const layout = getGridLayout(width, height, gridType, targetChar, padding);
    refCtx.clearRect(0, 0, width, height);
    refCtx.fillStyle = '#000000';

    if (gridType === 'lined') {
      layout.lines.forEach(line => {
        if (!line.text) return;
        refCtx.font = `700 ${line.fontSize}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif`;
        refCtx.textAlign = 'left';
        refCtx.textBaseline = 'bottom';
        refCtx.fillText(line.text, (layout.meta?.marginX || 64) + 16, line.baselineY);
      });
    } else {
      layout.cells.forEach(cell => {
        if (!cell.char) return;
        refCtx.font = `700 ${cell.fontSize}px "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif`;
        refCtx.textAlign = 'center';
        refCtx.textBaseline = 'middle';
        refCtx.fillText(cell.char, cell.x + cell.width / 2, cell.y + cell.height / 2);
      });
    }

    // 2. Extraer datos de píxeles
    const userCtx = userCanvas.getContext('2d', { willReadFrequently: true });
    if (!userCtx) return null;

    const userImgData = userCtx.getImageData(0, 0, width, height).data;
    const refImgData = refCtx.getImageData(0, 0, width, height).data;

    let refPixels = 0;
    let userPixels = 0;
    let intersectionPixels = 0;
    let userXSum = 0;
    let userYSum = 0;
    let refXSum = 0;
    let refYSum = 0;

    // Pasamos con paso de 2 píxeles para excelente rendimiento a 60fps
    const step = 2;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        const userAlpha = userImgData[idx + 3];
        const refAlpha = refImgData[idx + 3];

        const hasUserInk = userAlpha > 30;
        const hasRefInk = refAlpha > 40;

        if (hasRefInk) {
          refPixels++;
          refXSum += x;
          refYSum += y;
        }

        if (hasUserInk) {
          userPixels++;
          userXSum += x;
          userYSum += y;
        }

        if (hasUserInk && hasRefInk) {
          intersectionPixels++;
        }
      }
    }

    if (userPixels < 20) {
      return {
        score: 0,
        coverage: 0,
        precision: 0,
        feedback: 'El lienzo está casi vacío. Traza el carácter dentro de la cuadrícula.',
        badge: 'Sin trazo ✍️',
        level: 'empty'
      };
    }

    if (refPixels === 0) {
      return {
        score: 80,
        coverage: 100,
        precision: 80,
        feedback: 'Trazo libre completado.',
        badge: 'Libre ✨',
        level: 'good'
      };
    }

    // Cobertura: qué tanto del kanji cubrió el usuario
    const coverage = Math.min(100, Math.round((intersectionPixels / refPixels) * 100));
    // Precisión: qué tanta de la tinta del usuario cayó en el kanji
    const precision = Math.min(100, Math.round((intersectionPixels / userPixels) * 100));

    // Puntuación combinada ponderada (F1-score / Dice similarity)
    const diceScore = Math.round((2 * intersectionPixels) / (refPixels + userPixels) * 100);

    // Análisis de equilibrio de centro de masa
    const userCenterX = userPixels > 0 ? userXSum / userPixels : width / 2;
    const userCenterY = userPixels > 0 ? userYSum / userPixels : height / 2;
    const refCenterX = refPixels > 0 ? refXSum / refPixels : width / 2;
    const refCenterY = refPixels > 0 ? refYSum / refPixels : height / 2;

    const centerDist = Math.hypot(userCenterX - refCenterX, userCenterY - refCenterY);
    const balancePenalty = Math.min(15, Math.round((centerDist / (width / 4)) * 15));

    const finalScore = Math.max(10, Math.min(100, Math.round(diceScore * 1.15) - balancePenalty));

    let feedback = '';
    let badge = '';
    let level = '';

    if (finalScore >= 82) {
      feedback = '¡Excelente balance y proporción! 💮 Tus trazos son muy fieles a la caligrafía estándar.';
      badge = '¡見事 (Excelente)! 🏆';
      level = 'perfect';
    } else if (finalScore >= 68) {
      feedback = '¡Muy bien logrado! 👍 El kanji es claramente reconocible y mantiene buen equilibrio.';
      badge = '¡よくできました (Muy Bien)! ✨';
      level = 'good';
    } else if (finalScore >= 45) {
      feedback = 'Buen intento. 💪 Presta atención a centrar bien los trazos y mantener el grosor de las líneas.';
      badge = 'Buen intento 🌱';
      level = 'medium';
    } else {
      feedback = 'Sigue practicando. Intenta activar la guía translúcida (fantasma) para seguir el orden de trazos.';
      badge = 'Necesita práctica ✍️';
      level = 'low';
    }

    return {
      score: finalScore,
      coverage,
      precision,
      feedback,
      badge,
      level,
      centerOffset: Math.round(centerDist)
    };
  } catch (err) {
    console.error('Error analizando precisión del trazo:', err);
    return null;
  }
}

/* =========================================================================
   EXPORTACIÓN DE HOJA EN IMAGEN CON SELLO JAPONÉS (HANKO)
   ========================================================================= */

/**
 * Exporta la hoja de práctica a PNG de alta resolución incluyendo cuadrícula,
 * trazos del usuario, título, fecha y sello tradicional Hanko (落款印).
 */
export function exportPracticeSheetToImage({
  strokes,
  gridType = 'tianzige',
  paperStyle = 'washi',
  title = 'Práctica de Japonés',
  character = '',
  width = PAGE_WIDTH,
  height = PAGE_HEIGHT
}) {
  return new Promise((resolve) => {
    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = width;
      exportCanvas.height = height;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return resolve(null);

      // 1. Renderizar cuadrícula y fondo de papel
      renderGridOnCanvas(ctx, width, height, gridType, paperStyle, 40);

      // 2. Renderizar trazos del usuario
      renderAllStrokes(ctx, strokes);

      // 3. Encabezado elegante tradicional
      const paper = PAPER_STYLES.find(p => p.id === paperStyle) || PAPER_STYLES[0];
      ctx.fillStyle = paper.textColor;
      ctx.font = '600 16px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, 40, 30);

      const dateStr = new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      ctx.font = '400 13px "Inter", sans-serif';
      ctx.fillStyle = paperStyle === 'chalkboard' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
      ctx.fillText(`Nihongo Master · ${dateStr}`, 40, height - 15);

      // 4. Sello tradicional japonés Hanko (落款印) en bermellón en la esquina inferior derecha
      const sealSize = 48;
      const sealX = width - 40 - sealSize;
      const sealY = height - 20 - sealSize;

      ctx.save();
      ctx.strokeStyle = '#dc2626'; // Vermilion Red
      ctx.lineWidth = 2.5;
      ctx.strokeRect(sealX, sealY, sealSize, sealSize);

      ctx.fillStyle = 'rgba(220, 38, 38, 0.08)';
      ctx.fillRect(sealX, sealY, sealSize, sealSize);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 22px "Hiragino Sans", "Yu Gothic", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('秀', sealX + sealSize / 2, sealY + sealSize / 2);
      ctx.restore();

      const dataUrl = exportCanvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (err) {
      console.error('Error exportando hoja a imagen:', err);
      resolve(null);
    }
  });
}
