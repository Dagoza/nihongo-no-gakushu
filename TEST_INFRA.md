# Infraestructura de Pruebas Automatizadas (TEST_INFRA) — Nihongo Master

*Especificación Técnica de la Suite de Pruebas E2E de Caja Opaca en 4 Niveles (4-Tier Testing Methodology)*

---

## 1. Visión General y Objetivos

La infraestructura de pruebas automatizadas de **Nihongo Master** proporciona una validación exhaustiva, determinista y de alta fidelidad para garantizar la integridad visual, accesibilidad (WCAG 2.1 AA), rendimiento y solidez funcional de la plataforma.

Esta suite complementa las pruebas unitarias y de integridad de bases de datos existentes (`npm test`) implementando una **arquitectura de pruebas End-to-End (E2E) de caja opaca estructurada en 4 niveles (Tiers)**, diseñada para verificar todos los requerimientos y características catalogadas en `PROJECT.md § Feature Inventory` y las especificaciones estéticas de `docs/UI_UX_DESIGN_SYSTEM_TRENDS.md`.

---

## 2. Metodología en 4 Niveles (4-Tier Methodology)

La arquitectura de pruebas organiza las verificaciones en cuatro niveles progresivos de aislamiento y profundidad:

```
┌─────────────────────────────────────────────────────────────┐
│          TIER 4: ESCENARIOS REALES DE USUARIO               │
│  (Trayectorias de aprendizaje, Quizzes interactivos, SRS)   │
├─────────────────────────────────────────────────────────────┤
│        TIER 3: INTERACCIONES CRUZADAS ENTRE MÓDULOS         │
│     (Modo oscuro + AudioPlayerBar + Modales, z-index)       │
├─────────────────────────────────────────────────────────────┤
│          TIER 2: CASOS LÍMITE Y CONDICIONES ESQUINA         │
│  (Contraste WCAG AA, Colisiones furigana, Mobile 390px)     │
├─────────────────────────────────────────────────────────────┤
│              TIER 1: COBERTURA DE CARACTERÍSTICAS           │
│   (Bento cards, Paleta Japandi 8 roles, Safe areas, Modales)│
└─────────────────────────────────────────────────────────────┘
```

### Tier 1: Cobertura de Características (Feature Coverage)
Verifica la presencia y corrección estructural de las características individuales:
- **T1.1 Arquitectura Bento Card**: Valida que las clases base `.card`, `.bento-card` y `.module-hero-card` respeten el estándar modular: `border-radius: 20px` (o tokens equivalentes), borde sutil de `1px solid var(--border)` y sombras suaves difusas (`--shadow-sm`, `--shadow-md`).
- **T1.2 Paleta Japandi de 8 Roles**: Comprueba el mapeo de los pigmentos tradicionales japoneses (*Aizome*, *Shu-iro*, *Matcha*, *Kohaku*, *Torinoko*, *Sumi-iro*, *Sakura*, *Slate*) y sus fallbacks semánticos en `:root` y `[data-theme="dark"]`.
- **T1.3 Márgenes de Seguridad Móvil (Safe Areas)**: Valida la altura dinámica del reproductor `--audio-player-height` (72px desktop / 170px mobile), la aplicación obligatoria de `env(safe-area-inset-bottom)` en `.audio-player-bar`, y la holgura compensatoria en `body` y `.main-container`.
- **T1.4 Encabezados Modulares Universales (Hero Banners & Tour)**: Inspecciona las 11 pestañas de la aplicación verificando que implementen el encabezado estándar con Icon Badge temático, títulos H1/H2, descripción y el botón `.tour-info-shortcut-btn` enlazado al paso canónico del tour (`curriculum`, `story`, `vocab`, `particles`, `kanji`, `nhk`, `youtube`, `pdf`, `progress`).
- **T1.5 Cobertura de los 16 Modales e Interfaces**: Comprueba que los 16 modales interactivos inventariados existan en el árbol de componentes, se exporten limpiamente en `components/index.js` y definan controladores de cierre (`onClose`).

### Tier 2: Casos Límite y Condiciones Esquina (Boundary & Corner Cases)
Verifica límites cuantitativos, tolerancias matemáticas y resiliencia en condiciones extremas:
- **T2.1 Contraste en Modo Oscuro Zen (WCAG AA)**: Calcula la luminancia relativa ($L$) y el ratio de contraste estricto entre el texto principal (`#f1f5f9`), texto secundario (`#94a3b8`) y acento índigo (`#6366f1`) frente a los lienzos oscuros (`#090d16` y `#111827`). Exige ratio $\ge 4.5:1$ para texto regular y $\ge 3.0:1$ para elementos gráficos y componentes de acción según WCAG 2.1 SC 1.4.11.
- **T2.2 Márgenes de Furigana y Prevención de Colisiones**: Valida que en contenedores con anotaciones fonéticas ruby (`<ruby>`, `<rt>`) se mantenga un `line-height` expandido de seguridad ($\ge 1.85$ a $2.2$) para evitar colisiones verticales con líneas superiores de texto.
- **T2.3 Resiliencia Móvil Viewport 390px (Zero Overflow-X)**: Evalúa el viewport de 390 × 844 px (iPhone estándar). Comprueba la aplicación estricta de `overflow-x: hidden / clip`, `max-width: 100%` y `box-sizing: border-box` en las 12 rutas para erradicar cualquier desbordamiento horizontal.
- **T2.4 Insignias JLPT y Purga de Etiquetas Genéricas (Regla 6)**: Verifica la presencia de clases para insignias de nivel (`.level-n5` a `.level-n1`), cero menciones al marco CEFR (`A1`-`C2`), y erradicación total de calificativos obsoletos como `(Principiante)`, `(Básico)` o `(Intermedio)` en selectores y modales.

### Tier 3: Interacciones Cruzadas entre Módulos (Cross-Feature Interactions)
Verifica el comportamiento coordinado de subsistemas simultáneos:
- **T3.1 Jerarquía de Apilamiento (z-index) y Modo Oscuro**: Valida que la escala de capas respete estrictamente: `Header` ($z: 50$) $<$ `AudioPlayerBar` ($z: 40-100$) $<$ `Modales y Overlays` ($z \ge 1000$ hasta $9999$). Garantiza que ningún modal quede solapado bajo la barra de audio flotante o el encabezado, y que el reproductor adopte automáticamente las variables de color de `[data-theme="dark"]`.
- **T3.2 Persistencia de Audio en Navegación y Transición**: Comprueba que `AudioPlayerBar` se monte de forma persistente a nivel de layout raíz (`AppShell.jsx`), asegurando que las reproducciones activadas por `audioManager` continúen sin interrupciones al navegar entre rutas o al interactuar con modales.
- **T3.3 Descarte Accesible de Modales y Aislamiento de Capas**: Verifica la escucha del evento de teclado `Escape` en modales, la disponibilidad de backdrop click dismiss y la ausencia de bloqueos de scroll huérfanos al cerrar ventanas.

### Tier 4: Escenarios Reales de Usuario (Real-World Scenarios)
Verifica flujos pedagógicos completos de extremo a extremo:
- **T4.1 Trayectoria Completa de Aprendizaje (37 Módulos)**: Recorre la estructura pedagógica de `curriculum.json`, verificando que los 37 módulos posean Can-Dos, secciones y enlaces navegables en `related_topics` que conecten módulos sin callejones sin salida.
- **T4.2 Sesión Interactiva de Cuestionario (ComprehensionQuiz)**: Evalúa la máquina de estados de evaluación: renderizado de preguntas, selección de opciones, cálculo de aciertos, retroalimentación inmediata, otorgamiento de XP (`+10`) y reinicio de sesión.
- **T4.3 Sesión de Repaso Espaciado SRS (Algoritmo FSRS)**: Comprueba la lógica matemática de repetición espaciada en `lib/srs.js` mediante `ts-fsrs`. Verifica que una calificación *Easy* produzca mayor estabilidad e intervalos de repaso superiores a *Hard* o *Again*, y que la función `isDue()` programe fechas futuras correctas.

---

## 3. Fuentes Autoritativas de Salida Esperada (Oracle Mapping)

Cada caso de prueba deriva sus valores esperados de fuentes oficiales e invariantes arquitectónicas:

| Caso | Característica Evaluada | Fuente Autoritativa Primaria | Valor / Comportamiento Esperado |
|---|---|---|---|
| **T1.1** | Bento Cards | `docs/UI_UX_DESIGN_SYSTEM_TRENDS.md § 4` | `border-radius: 20px`, `1px solid var(--border)`, `--shadow-sm` |
| **T1.2** | 8 Roles Japandi | `docs/UI_UX_DESIGN_SYSTEM_TRENDS.md § 2` | Índigo `#4338ca`/`#6366f1`, Bermellón `#e11d48`, Matcha `#059669`, Washi `#f8fafc`, Sumi `#090d16` |
| **T1.3** | Safe Areas | `ORIGINAL_REQUEST.md § R1` | `--audio-player-height: 72px` (desktop) / `170px` (mobile), `env(safe-area-inset-bottom)` |
| **T1.4** | Hero Banners & Tour | `ORIGINAL_REQUEST.md § R1`, `PROJECT.md § M2` | `.module-hero-card` con Icon Badge, títulos y `.tour-info-shortcut-btn` en 9+ vistas |
| **T1.5** | 16 Modales | `ORIGINAL_REQUEST.md § R2` | 16 modales presentes, exportados en `components/index.js` y con controles accesibles |
| **T2.1** | Contraste Zen Dark | W3C WCAG 2.1 SC 1.4.3 / 1.4.11 | Ratio $\ge 4.5:1$ (texto) y $\ge 3.0:1$ (componentes UI e índigo) |
| **T2.2** | Furigana Line-Height | `PROJECT.md § Feature 7`, `UI_UX_DESIGN_SYSTEM_TRENDS.md § 3` | `line-height: 1.85-2.2` en bloques ruby para evitar colisión vertical |
| **T2.3** | Viewport 390px | `ORIGINAL_REQUEST.md § R3` | `overflow-x: clip/hidden`, `max-width: 100%`, 0 scroll horizontal |
| **T2.4** | Estándar JLPT | `AGENTS.md Regla 6` | Únicamente N5 a N1; 0 CEFR (`A1`-`C2`); 0 etiquetas genéricas en opciones |
| **T3.1** | Jerarquía z-index | CSS Stacking Context Specification | Header (50) < Audio (40-100) < Overlays (>=1000) |
| **T3.2** | Persistencia Audio | `INSTRUCCIONES.md § 5.3` | `AudioPlayerBar` persistente en `AppShell`; `audioManager` continuo |
| **T3.3** | Descarte Modales | WAI-ARIA Dialog (Modal) Pattern | Cierre por tecla `Escape`, botón visible de cierre y backdrop |
| **T4.1** | Trayectoria Currículum| `INSTRUCCIONES.md § 4` | 37 módulos secuenciales, Can-Dos y enlaces a `related_topics` válidos |
| **T4.2** | Cuestionarios Quiz | `data/stories.json` + `ComprehensionQuiz.jsx` | 3 preguntas, `correct_index` válido, +10 XP por acierto |
| **T4.3** | Repaso FSRS | `lib/srs.js` + `ts-fsrs` | Intervalos y estabilidad: `Easy > Good > Hard > Again` |

---

## 4. Arquitectura de Ejecución y Archivos

### Estructura de Directorios:
```
Nihongo/
├── tests/
│   └── e2e/
│       ├── test_utils.mjs                  # Utilidades matemáticas, cálculo de contraste y parsers
│       ├── tier1_feature_coverage.test.mjs # Suite Tier 1 (5 pruebas)
│       ├── tier2_boundary_corner.test.mjs  # Suite Tier 2 (4 pruebas)
│       ├── tier3_cross_feature.test.mjs    # Suite Tier 3 (3 pruebas)
│       ├── tier4_real_world.test.mjs       # Suite Tier 4 (3 pruebas)
│       └── e2e_runner.mjs                  # Orquestador maestro E2E y exportador de métricas
├── scripts/
│   ├── run_e2e_tests.mjs                   # Punto de entrada CLI para la suite E2E
│   ├── run_all_tests.js                    # Suite de validación técnica de bases de datos (14/14)
│   └── audit_ui_playwright.mjs             # Runner de auditoría visual y modales con Playwright
├── reports/
│   ├── e2e_summary.json                    # Resumen estructurado de la ejecución E2E
│   ├── UI_AUDIT_REPORT.md                  # Reporte técnico de auditoría Playwright
│   └── evidence/                           # Evidencias fotográficas (desktop, mobile, modales)
└── package.json                            # Scripts npm test, npm run test:e2e y npm run audit:ui
```

---

## 5. Guía de Ejecución y Comandos CLI

### 5.1 Ejecución Completa de la Suite E2E (4 Tiers)
Ejecuta los 15 casos de prueba de los 4 niveles con resumen visual y generación de `reports/e2e_summary.json`:
```bash
npm run test:e2e
# o directamente:
node scripts/run_e2e_tests.mjs
```

### 5.2 Ejecución Filtrada por Tier
Para ejecutar de forma aislada un nivel específico durante ciclos de desarrollo:
```bash
# Solo Tier 1 (Cobertura de características)
node scripts/run_e2e_tests.mjs --tier=1

# Solo Tier 2 (Casos límite y contraste WCAG)
node scripts/run_e2e_tests.mjs --tier=2

# Solo Tier 3 (Interacciones cruzadas y z-index)
node scripts/run_e2e_tests.mjs --tier=3

# Solo Tier 4 (Escenarios reales de usuario)
node scripts/run_e2e_tests.mjs --tier=4
```

### 5.3 Exportación en Formato JSON
Para integración con herramientas de CI/CD:
```bash
node scripts/run_e2e_tests.mjs --json
```

### 5.4 Pruebas de Integridad de Datos Existentes
Ejecuta las 14 pruebas de validación de reglas de negocio y bases de datos (`AGENTS.md` Reglas 1 a 6):
```bash
npm test
```

### 5.5 Auditoría Visual con Playwright
Ejecuta la auditoría fotográfica interactiva sobre las 12 rutas y 16 modales con recolección de evidencias en `reports/evidence/`:
```bash
npm run audit:ui
```

---

## 6. Criterios de Aprobación y Semántica Pass/Fail

- **Código de salida `0`**: Todas las pruebas ejecutadas superaron sus aserciones al 100%.
- **Código de salida `1`**: Al menos una aserción falló. Se emite detalle con archivo, línea y causa de error.
- **Progression Gate**: Los cambios introducidos no pueden provocar regresiones en `npm test` (14/14) ni en `npm run build` (Next.js Turbopack).
