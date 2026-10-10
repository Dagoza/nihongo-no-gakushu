# Original User Request

## 2026-10-07T02:01:21Z

Estandarizar y resolver las inconsistencias estructurales de UI en todas las páginas de Nihongo Master (unificando Hero Banners, botones de Tour y filtros JLPT N5-N1), asegurar la cobertura y correcto funcionamiento de los 16 modales de la plataforma, y configurar y ejecutar una suite automatizada de pruebas y auditoría con Playwright en Desktop y Mobile recolectando evidencias fotográficas completas.

Working directory: /Users/danielgomez/Documents/Nihongo
Integrity mode: development

## Requirements

### R1. Resolución Previa de Inconsistencias de Estructura y Estándar UI
- Unificar la estructura de encabezados (Hero Banner) en todas las 11 páginas (`/curriculum`, `/story`, `/nhk`, `/youtube`, `/vocab`, `/grammar`, `/jlpt`, `/kanji`, `/pdf`, `/saved`, `/progress`):
  - Componente de cabecera consistente con Icon Badge coloreado según la categoría, título jerárquico H1/H2, descripción clara de la función del módulo y botón directo de Guía del Tour (`tour-info-shortcut-btn`).
  - Añadir en `StoryTab` el botón de acceso directo a la Guía del Tour interactiva (conectado al paso `'story'`).
  - Estandarizar los encabezados de `VocabTab`, `GrammarTab` y `KanjiTab` para alinearlos con el diseño moderno de `SavedTab` y `JlptExamTab`.
  - Asegurar consistencia cromática y estricto estándar JLPT (N5 a N1, cero CEFR) en todos los selectores y tarjetas de nivel (Regla 6 de AGENTS.md).
  - Garantizar espaciado inferior seguro (`safe-area-inset-bottom` + margen del reproductor) en móvil para evitar que `AudioPlayerBar` oculte elementos interactivos o paginación.

### R2. Cobertura Exhaustiva de Todos los Modales (16 Modales)
Verificar la funcionalidad, apertura, cierre, renderizado accesible y diseño responsivo en Desktop y Mobile para todos los modales de la plataforma:
1. `PracticePadModal` (Lienzo caligráfico kanji con Shodō, pluma, lápiz y gel)
2. `DictionaryModal` (Buscador léxico rápido)
3. `SettingsModal` (Ajustes de audio, furigana, tema y sincronización)
4. `DailyGoalModal` (Meta diaria de racha y XP)
5. `NotificationSettingsModal` (Recordatorios y notificaciones push)
6. `AuthModal` (Inicio de sesión Google/Email y gestión de cuenta)
7. `ProductTour` (Tour interactivo guiado por pasos para todas las secciones)
8. `UIModal` (Diálogos de confirmación y alertas)
9. `SaveVocabModal` (Guardar vocabulario nuevo desde reproductor e historias)
10. `EditWordModal` (Edición de vocabulario personalizado)
11. `AIGeneratorModal` (Generador de historias con IA)
12. `ConversationGeneratorModal` (Generador de diálogos situacionales con IA)
13. `SrsReview` (Sesión de tarjetas con algoritmo de repetición espaciada FSRS)
14. `SpeechPractice` (Práctica de habla y reconocimiento de voz)
15. `ComprehensionQuiz` (Cuestionario de comprensión auditiva y lectura)
16. `KanjiDraw` (Práctica de trazos kanji paso a paso)

### R3. Configuración de Scripts y Runner de Playwright
- Configurar y validar todos los scripts en `package.json` (`npm run test`, `npm run build`, y `npm run audit:ui`).
- Implementar el runner automatizado de Playwright (`scripts/audit_ui_playwright.mjs`) utilizando el Google Chrome existente en el sistema macOS (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` o canal Chrome) para una ejecución ligera y sin descargas redundantes.
- Configurar perfiles de visualización:
  - **Desktop**: 1440 × 900 px
  - **Mobile**: 390 × 844 px (con capacidades táctiles y viewport móvil)
- Organizar el almacenamiento de capturas fotográficas de evidencia en `reports/evidence/desktop/`, `reports/evidence/mobile/` y `reports/evidence/modals/`.

### R4. Ejecución de Auditoría, Detección de Errores y Reporte de Evidencias
- Ejecutar la suite automatizada sobre el servidor Next.js optimizado:
  - Verificar que las 11 páginas carguen con HTTP 200 y cero errores no controlados en la consola del navegador.
  - Comprobar que no exista desbordamiento horizontal en mobile (`scrollWidth > clientWidth`).
  - Abrir e inspeccionar interactivamente cada uno de los 16 modales capturando su evidencia.
- Compilar un reporte consolidado en Markdown (`reports/UI_AUDIT_REPORT.md`) y JSON con la matriz completa de resultados, galería de capturas y catálogo de oportunidades de mejora de UI/UX.

## Acceptance Criteria

### Estructura y Consistencia UI
- [ ] Todas las 11 páginas presentan encabezado con Icon Badge, título, descripción y botón funcional de Guía del Tour.
- [ ] `StoryTab` incluye el botón de Guía del Tour funcional hacia el paso `'story'`.
- [ ] Ninguna página presenta desbordamiento horizontal (`overflow-x`) en viewport de 390px (Mobile).
- [ ] `AudioPlayerBar` no oculta controles inferiores o botones de acción en resoluciones móviles.
- [ ] Todos los selectores de nivel cumplen estrictamente el estándar JLPT (N5 a N1) sin menciones de CEFR (Regla 6).

### Cobertura de Modales
- [ ] Los 16 modales están inventariados e incluidos en la suite de pruebas.
- [ ] Todos los modales abren y cierran limpiamente sin bloquear la interfaz ni provocar errores en consola.
- [ ] Se capturan evidencias visuales de cada modal en resoluciones desktop y mobile.

### Scripts y Auditoría Playwright
- [ ] `npm run audit:ui` se ejecuta de forma autónoma con Playwright usando el Chrome del sistema.
- [ ] Se generan capturas de pantalla de todas las páginas y modales en `reports/evidence/`.
- [ ] Se genera el informe técnico `reports/UI_AUDIT_REPORT.md` documentando métricas, estado de cada pantalla y propuestas de pulido.
- [ ] `npm test` finaliza con 14/14 pruebas superadas (100% cumplimiento de AGENTS.md).
- [ ] `npm run build` compila con éxito en Next.js Turbopack sin errores.


## 2026-10-08T19:45:01Z

Audit the entire Nihongo Master web application and refactor all pages and components to strictly align with the unified Japandi and Kawaii-Elegante design system specification documented in `docs/UI_UX_DESIGN_SYSTEM_TRENDS.md`.

Working directory: /Users/danielgomez/Documents/Nihongo
Integrity mode: development

Reference: `docs/UI_UX_DESIGN_SYSTEM_TRENDS.md`

## Requirements

### R1. Application-Wide Design System Audit & Gap Identification
Audit all application routes (`/`, `/curriculum`, `/grammar`, `/jlpt`, `/kanji`, `/particles`, `/progress`, `/saved`, `/story`, `/vocab`, `/youtube`, `/pdf`, `/nhk`) and shared components against the standards in `docs/UI_UX_DESIGN_SYSTEM_TRENDS.md`. Identify all deviations in layout, spacing ("Ma"), color palette, typography, bento grid structures, and progressive disclosure.

### R2. Component & Layout Refactoring for Visual Consistency
Align identified components and views with the design system:
- Bento Grid architecture: modular cards with standard rounded corners (`border-radius: 20px`), subtle borders (`1px solid var(--border)`), and soft shadows.
- Japandi 8-role color palette tokens (Aizome Indigo, Zen Vermilion, Soft Matcha, Bamboo/Amber, Washi Paper light, Sumi Ink dark, Sakura Petal pink), ensuring proper contrast in both light and dark mode.
- Progressive disclosure patterns: avoid walls of text by employing expandable cards, modal dialogs, and segmented tabs.
- Typography hierarchy: ensure clean distinction between interface typography (`Inter`) and Japanese character rendering (`Noto Sans JP` / `Hiragino Sans` with proper ruby/furigana scaling).

### R3. Functional & JLPT Standard Preservation
Preserve all existing business logic, client-side state handling, audio system integrations (`audioManager`), and strict JLPT standard levels (N5 to N1 exclusively). Do not introduce any breaking changes to existing educational interactions, SRS workflows, or multimedia tools.

### R4. Automated Build & Verification
Verify that the codebase builds cleanly without any compilation or TypeScript/Turbopack errors via `npm run build`. Provide an auditable summary detailing all modified components, resolved inconsistencies, and before/after alignment.

## Acceptance Criteria

### Visual & Layout Compliance
- [ ] All primary tabs and views implement Bento Grid modular card structures (`border-radius: 20px`, consistent padding, subtle borders).
- [ ] All views adhere to the Japandi 8-role color palette and CSS variables, eliminating inconsistent hardcoded hex codes.
- [ ] Both light mode and Zen dark mode render seamlessly across all pages without contrast regressions.
- [ ] Information-dense views employ progressive disclosure rather than monolithic text walls.

### Typography & Language Hierarchy
- [ ] Japanese text rendering consistently employs `--font-jp` with adequate kanji scaling and non-overlapping furigana.
- [ ] All level indicators and filters strictly conform to the JLPT N5–N1 standard.

### Build & Integrity
- [ ] `npm run build` completes with exit code 0 and zero Turbopack/Next.js errors.
- [ ] All interactive features (audio playback, quizzes, SRS review, search, and filters) remain fully operational.
- [ ] A final audit log is documented summarizing the audit findings and remediations made across the codebase.


## 2026-10-10T19:51:12Z

Reestructuración pedagógica integral del currículum (37 módulos) de Nihongo Master: reordenar vocabulario antes de gramática, enriquecer y segmentar vocabulario por paso, incorporar secciones de Kanjis/Jukugo interactivos y Partículas/Prefijos funcionales (como お-), consolidar ejemplos reales dentro de las fórmulas eliminando redundancias, e implementar un sistema transversal de terminología lingüística con Tooltips interactivos y nuevo pilar en el modal de terminología.

Working directory: /Users/danielgomez/Documents/Nihongo
Integrity mode: development

## Requirements

### R1. Reordenación Didáctica y Segmentación de Vocabulario
En cada paso de contenido de los 37 módulos, el vocabulario debe presentarse antes de los puntos de gramática. Cada paso debe contener su bloque de vocabulario segmentado (8-12 términos contextuales) con audio individual, pronunciación continua de la lista y búsqueda en diccionario. En la cabecera del módulo debe haber una opción para ver y reproducir el vocabulario global del módulo. En la vista de lista de tarjetas, el acordeón de Vocabulario debe aparecer antes del de Gramática.

### R2. Enriquecimiento Masivo y Sincronización Estricta (Reglas 1 y 2 de AGENTS.md)
Ampliar el vocabulario en todos los 37 módulos (especialmente módulos 19 a 37 que cuentan con léxico escaso) cubriendo los términos reales utilizados en las fórmulas, ejercicios y diálogos. Toda palabra nueva con kanjis debe registrarse en `data/vocabulary.json` con su estructura completa (`kanji`, `hiragana`, `katakana`, `meaning_es`, `level`, `category`) y sincronizarse dentro de `words` en cada kanji correspondiente en `data/kanji.json`.

### R3. Kanjis y Combinaciones Jukugo Interactivos
Implementar para cada paso y módulo una sección interactiva de Kanjis y Combinaciones (Jukugo) que presente ideogramas ampliados, lecturas On'yomi / Kun'yomi, significados en español, desglose morfológico/etimológico (ej. 先 + 生), pronunciación con audio nativo/TTS y botón de acceso al diccionario o buscador.

### R4. Partículas, Prefijos y Conexión Funcional
Integrar tras el vocabulario y kanjis un bloque puente de "Partículas, Prefijos y Componentes Funcionales" que explique con claridad prefijos de cortesía (como お- y ご-), sufijos honoríficos (`〜さん`, `〜様`, `〜語`) y partículas activas (`は`, `が`, `を`, `に`, `de`, etc.), con ejemplos contextuales en audio, badges morfológicos interactivos y enlace directo a la Guía de Partículas (`/grammar`) para profundizar.

### R5. Consolidación de Ejemplos y Eliminación de Secciones Redundantes
Fusionar cualquier oración de ejemplo con valor didáctico desde `sections[].examples` directamente en los arreglos `examples` de las fórmulas de gramática en `sections[].grammar_points` (mostrando 2-3 ejemplos con audio por fórmula y botón "Ver más ejemplos" si hay más). Eliminar la sección redundante e independiente de "Ejemplos Reales en Contexto" tanto del JSON como de la interfaz de usuario, y actualizar `lib/curriculumValidator.js` en consecuencia.

### R6. Sistema Transversal de Terminología Lingüística y Tooltips
Crear un glosario centralizado en `data/terminology.json` (cubriendo Keigo, Bikougo, Sonkeigo, Kenjougo, Teineigo, Wago, Kango, Gairaigo, Jukugo, Ichidan, Godan, Okurigana, Cópula, etc.), implementar el componente `TerminologyTooltip.jsx` con soporte hover/tap para desktop y móvil aplicable en el currículum y a lo largo de la aplicación, y agregar el 5.º Pilar de "Glosario Lingüístico" en `components/modals/TerminologyDetailModal.jsx`.

## Acceptance Criteria

### Integridad de Datos y Reglas de Proyecto
- [ ] `node scripts/run_all_tests.js` pasa al 100% (14/14 o más pruebas) sin fallos en Reglas 1, 2, 4, 5 y 6.
- [ ] 0 niveles CEFR en todos los datasets; uso estricto y exclusivo de niveles JLPT (N5 a N1).
- [ ] Todas las nuevas palabras con kanjis están sincronizadas en `kanji.words` en `data/kanji.json`.
- [ ] Todos los 37 módulos contienen `sections` válidas con paso final exclusivo de ejercicios (`lib/curriculumValidator.js` pasa limpio).

### Interfaz de Usuario y Experiencia Pedagógica
- [ ] En `/curriculum`, dentro de cada paso temático, el orden visible es: Objetivo → Vocabulario → Kanjis/Jukugo → Partículas/Prefijos → Puntos de Gramática → Can-Dos.
- [ ] La sección redundante "Ejemplos Reales en Contexto" está removida de la interfaz, y sus ejemplos están consolidados en las tarjetas de gramática con audio.
- [ ] Los términos lingüísticos (ej. Bikougo, Wago, Jukugo, Keigo) disponen de Tooltip interactivo funcional al pasar el cursor o pulsar sobre ellos.
- [ ] El modal `TerminologyDetailModal` cuenta con su pilar de Glosario Lingüístico navegable.
- [ ] En la lista general de módulos, el acordeón de Vocabulario aparece antes que el de Gramática.

### Build de Producción Next.js
- [ ] `npm run build` compila con éxito (código de salida 0) sin errores de sintaxis, imports, SSR o React.

## Verification Resources
- Script de validación técnica del proyecto: `node scripts/run_all_tests.js`
- Validador de estructura de currículum: `lib/curriculumValidator.js`
- Compilación de producción: `npm run build`
