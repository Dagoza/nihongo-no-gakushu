---
name: nihongo-ui-design-system
description: Sistema de diseño UI/UX Japandi 2026, tipografía CJK, arquitectura Bento 2.0, revelación progresiva en 3 capas, adaptación cognitiva FSRS y accesibilidad para Nihongo Master. Usar siempre que se creen, modifiquen o auditen componentes de interfaz, vistas de estudio o estilos visuales en la aplicación.
---

# Skill: Sistema de Diseño UI/UX Japandi 2026 (Nihongo Master)

Esta guía define las reglas obligatorias de diseño, arquitectura visual y accesibilidad para todo componente o pantalla en **Nihongo Master**. Documentación canónica completa en [`docs/UI_UX_DESIGN_SYSTEM_TRENDS.md`](file:///Users/danielgomez/Documents/Nihongo/docs/UI_UX_DESIGN_SYSTEM_TRENDS.md).

---

## 1. Principios Fundamentales

1. **Filosofía "Ma" (間 - Espacio Negativo Significativo)**: El espacio en blanco es un respiro visual activo para la concentración. Cero saturación o muros de texto planos.
2. **Estética Japandi + Dentou-iro**: Fondos cálidos de papel Washi (`--bg-washi-warm: #FAF8F5`, `--surface-washi-card: #F0EDE8`), bordes sutiles de 1px (`#E5E0D8`) y preservación estricta de los 8 pigmentos tradicionales japoneses (*Aizome* índigo, *Shu-iro* bermellón, *Macha-iro* matcha, *Kohaku-iro* ámbar JLPT).
3. **Estándar Exclusivo JLPT (N5 a N1)**: Prohibido CEFR (A1, A2). Todo badge, filtro y estado de dominio usa exclusivamente N5 a N1.

---

## 2. Tipografía CJK y Kinsoku Shori

Al renderizar texto en japonés:
* **Quiebre de frase**: Aplicar `word-break: auto-phrase` (motor C++ BudouX) y `text-spacing-trim: normal` en `:lang(ja)`, `.jp-text` y `.jp-content`.
* **Ritmo vertical**:
  * Cuerpo de texto japonés: `line-height: 1.75` y `font-size: calc(1em + 0.5px)`.
  * Encabezados japoneses (`:lang(ja) h1–h3`, `.jp-heading`): `line-height: 1.3` y `font-weight: 500` (evitar 600/700 para no empastar los trazos kanji).
* **Furigana**:
  ```css
  ruby {
    ruby-position: over;
    ruby-align: center;
    ruby-merge: separate;
  }
  ```

---

## 3. Adaptación Cognitiva FSRS (Zero Layout Shift)

* **Regla estricta**: **NUNCA usar `display: none`** para ocultar el Furigana de kanjis dominados, ya que altera el ancho del contenedor y provoca saltos de diseño (CLS).
* **Solución**: Usar `opacity: 0` en `rt.rt-mastered-hidden` y revelarlo con `opacity: 1` en hover/tap con transición de 150ms:
  ```css
  rt.rt-mastered-hidden,
  .rt-mastered-hidden rt {
    opacity: 0;
    transition: opacity 150ms ease-out;
  }
  ruby:hover rt.rt-mastered-hidden,
  ruby:focus-within rt.rt-mastered-hidden {
    opacity: 1;
  }
  ```

---

## 4. Arquitectura de Revelación Progresiva en 3 Capas

Desacoplar la profundidad pedagógica de la visualización en pantalla:

1. **Capa 0 (Esencia Nuclear)**: Símbolo o patrón destacado, nivel JLPT oficial, rol en español en 1 línea y **1 único ejemplo canónico directo con audio**.
2. **Capa 1 (Acordeones Nativos Exclusivos)**: Fórmulas y ejemplos secundarios agrupados en `<details name="capa-id" class="japandi-accordion">`. Abrir uno cierra automáticamente el anterior. Soporta búsqueda nativa (`Ctrl+F`).
3. **Capa 2 (Micro-contexto)**: Tooltips o popovers anclados para pitch accent y glosas morfológicas.

### Salvaguardas Obligatorias:
* **No-Anidamiento**: Prohibido anidar `<details>` dentro de otro `<details>`.
* **Comparación Simultánea**: Cuando se contrasten dos elementos (partículas は vs が, pares de kanji o cadenas Keigo), mostrarlos **lado a lado (side-by-side)** en paneles paralelos, nunca obligando a alternar pestañas o acordeones.

---

## 5. Contrato de Movimiento Zen y Animaciones

* **Ejercicios**: Cero sacudidas (*shake*) al fallar. Acierto/error comunicado por color accesible y tachado `textDecoration: 'line-through'` en opciones incorrectas (**WCAG 2.2 / JIS X 8341-3**).
* **Táctil Móvil**: Micro-compresión `:active { transform: scale(0.97); opacity: 0.85; transition: 80ms }` en pantallas ≤768px.
* **Scroll Animations**: Barra de progreso y tarjetas `.bento-card-reveal` ejecutadas en el compositor con `@supports (animation-timeline: view())` en el tramo inicial (`animation-range: entry 0% entry 30%`), respetando siempre `prefers-reduced-motion`.
* **Confeti**: Reservado exclusivamente para **hitos de sesión mayores** (terminar módulo, aprobar simulacro JLPT). Prohibido en preguntas individuales.

---

## 6. Conmutador de Densidad (`[data-density]`)

Toda lista o cuadrícula Bento debe responder a:
* `[data-density="compact"]`: Espaciado reducido (`gap: 12px`, padding compacto) para escaneo rápido de muchas palabras.
* `[data-density="comfortable"]` (por defecto): Balance ideal para lectura y estudio general.
* `[data-density="spacious"]`: Máximo espacio *Ma* (`gap: 28px`) para reducir el estrés visual.
* Control global disponible en [`SettingsModal.jsx`](file:///Users/danielgomez/Documents/Nihongo/components/modals/SettingsModal.jsx).

---

## Checklist de Verificación para Todo Cambio de UI
- [ ] ¿Aplica la paleta *Dentou-iro* sobre fondo Washi cálido (`#FAF8F5`) sin sombras pesadas?
- [ ] ¿El texto japonés incluye `word-break: auto-phrase`, `ruby-merge: separate` y line-height adaptado?
- [ ] ¿El furigana adaptativo usa `opacity: 0` (cero CLS) en kanjis dominados?
- [ ] ¿La tarjeta muestra en superficie solo la Capa 0 y oculta detalles en acordeón exclusivo `<details name="...">`?
- [ ] ¿Se respetó la regla de no anidar `<details>` dentro de `<details>`?
- [ ] ¿Las comparaciones confusas se despliegan lado a lado (side-by-side)?
- [ ] ¿Los ejercicios usan tachado `line-through` en errores sin sacudidas ni confeti rutinario?
- [ ] ¿Se probaron los tests con `npm test` y la auditoría con `node scripts/audit_ui_playwright.mjs --dry-run`?
