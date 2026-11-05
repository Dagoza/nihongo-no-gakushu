# 🗺️ Plan de Integración: Guía Maestra Autodidacta, Cronograma Temporal y Ecosistema de Estudio (Revisión Auditada)

## Goal Description
El análisis exhaustivo de la **"Guía Maestra de Recursos y Metodologías para el Aprendizaje Autodidacta del Japonés"** ([share.gemini.google/nlwKEgerokfr](https://share.gemini.google/nlwKEgerokfr)) y la posterior auditoría técnica/pedagógica establecen el consenso definitivo de las comunidades modernas de estudio independiente (TheMoeWay, Donkuri, Guía Manabe, Shinobi Japanese, Kotu.io, Shoui Method, Yomine, JPDB). Este consenso se basa en:

1. **Prevención rigurosa del *Difficulty Hell* y de la Deuda de Repasos (*Review Debt*):**
   - En FSRS, el abuso de "Difícil" ante dudas o fallos estanca los intervalos al disparar la dificultad al 95%–98%. La regla áurea es: si no hubo recuerdo inmediato en 5 segundos, revelar y marcar **"Otra vez" (Again)**; reservar "Difícil" únicamente para aciertos trabajados con esfuerzo dentro del límite de tiempo.
   - En la proyección temporal, descontar la deuda de repasos mediante un **Factor de Sostenibilidad Real ($\approx 0.8$)** y activar una compuerta **Review-First Gate** cuando la cola de repasos pendientes supere el umbral crítico (>80 tarjetas), pausando la ingesta diaria de palabras nuevas (0 nuevas) para proteger el hábito diario.
2. **Kanjis contextuales con mnemotecnias diferenciales (See-Link-Go):**
   - Descarte total del aprendizaje aislado de los 2,200 kanjis sin vocabulario real (fallo documentado de RTK Heisig Vol. 1 puro).
   - Intervención guiada automatizada para tarjetas sanguijuela (*Leeches*): modal comparativo visual lado a lado (ej. 隠 vs 穏, 待 vs 持) en 3 pasos: 1. Ver (componente distinto resaltado en color) $\rightarrow$ 2. Vincular (mnemotecnia) $\rightarrow$ 3. Exagerar (*See-Link-Go*).
3. **Comprensión sin fricción e Inmersión Asistida (90%–98% Input Comprensible):**
   - Medidor de Cobertura Pre-Inmersión (% conocido) en historias y diálogos antes de abrir el material.
   - Modo de lectura rápida "The Gist" (estilo Yokubi) para asimilar la estructura esencial del punto gramatical en 2 minutos antes de leer historias o hacer ejercicios de recuperación activa (estilo Bunpro).
   - Minado inteligente de oraciones 1T ($i+1$) con validación automática vía `smartSegmentJapanese` y `masteredVocab`: destacando con insignia `🎯 Oración Ideal i+1` aquellas frases con exactamente 1 término desconocido.
   - Furigana dinámico multinivel vinculado a FSRS: ocultamiento automático en palabras con intervalo FSRS $\ge 21$ días.
   - Modo *Raw Listening* en dos fases: audio en crudo con texto difuminado (1ª pasada) $\rightarrow$ revelación de texto y desbloqueo de minado (2ª pasada).
4. **Discriminación Fonética y Acento Tonal (Pitch Accent) con Audio Amortiguado:**
   - Entrenador de pares mínimos (雨 vs 飴, 箸 vs 橋 vs 端) con filtro de audio amortiguado (*Muffle Audio* vía `BiquadFilterNode` paso bajo a ~350Hz en Web Audio API) para aislar el contorno de entonación $F_0$.
   - Conmutador de "Trampa en Aislamiento" vs partícula が como prueba de fuego.
   - Percepción auditiva pura (sin kanji/significado previo, respondiendo con esquemas H·L, L·H·H, L·H·L) y atajos rápidos 1-3.
5. **Presupuesto Balanceado y Hoja de Ruta Temporal Cuantitativa:**
   - División en Dashboard de la cuota diaria en **Cuota de Estudio** (SRS + Gramática) y **Cuota de Habilidad** (Inmersión en Diálogos / Historias / Shadowing).
   - Hitos cronológicos oficiales: **Fase 1 (Días 1 a 30)**, **Fase 2 (Meses 2 a 6)** y **Fase 3 (Meses 6 a 24+)**.

---

## 1. Matriz de Auditoría: Lo que Tenemos vs. Lo que nos Falta vs. Lo que NO Necesitamos

| Dimensión Pedagógica | ✅ Lo que YA TENEMOS en Nihongo Master | ⚡ Lo que NOS FALTA (Gaps de Alto Impacto) | ❌ Lo que NO NECESITAMOS (Descartar según Reporte) |
| :--- | :--- | :--- | :--- |
| **Motor de Memoria y SRS** | • **FSRS v5** nativo (`lib/srs.js` con `ts-fsrs`).<br>• Retención al 90%, métricas de estabilidad y dificultad.<br>• Detección y filtrado de *Leeches* (tarjetas sanguijuela). | • **Speed Focus Timer Anti-Difficulty Hell:** Temporizador visual (5s) que aconseja marcar 'Again' al expirar.<br>• **Review-First Gate:** Bloqueo de ingesta si hay >80 repasos vencidos.<br>• Calculadora de carga esperada en sem. 3-4. | ❌ Algoritmo SM-2 rígido con multiplicadores fijos.<br>❌ Recomendar 'Hard' en fallos o dudas.<br>❌ Duplicación de colas simultáneas. |
| **Vocabulario Troncal** | • **1,687 palabras** en `vocabulary.json` (equivalente óptimo a Kaishi 1.5k).<br>• Audio MP3 nativo y neuronal TTS.<br>• 116 oraciones Tatoeba y modo **Cloze SRS**. | • **Ingesta diaria protegida:** 10 palabras nuevas/día sostenibles con factor 0.8.<br>• Priorización de partículas en las primeras 150 tarjetas (は, が, か, を, に, で). | ❌ Mazos masivos ciegos tipo Core 6k/10k descontextualizados.<br>❌ Palabras arcaicas sin uso real en medios actuales. |
| **Dominio de Kanji** | • **2,213 kanjis oficiales** de N5 a N1.<br>• 164 kanjis ricos con mnemotecnias en español.<br>• **818 compuestos Jukugo** con modo Dual (Wanakana + Selección).<br>• Validador fonético canónico `normalizeKanjiReadingSet`. | • **Intervención Automática See-Link-Go:** Detección de *Leeches* de kanji y comparador modal lado a lado (ej. 隠 vs 穏) con componente diferencial en color. | ❌ Memorización y escritura a mano obligatoria de 2,200 kanjis aislados antes de tocar palabras.<br>❌ Radicales arbitrarios no oficiales. |
| **Gramática y Currículum** | • **37 Módulos** (N5 a N3) con 141 Can-Dos y 154 ejercicios.<br>• Indexación completa en FSRS v5.<br>• **Can-Do Sentence Scramble** (ensamblador sintáctico SOV con `smartSegmentJapanese`).<br>• 99 partículas con 130 retos interactivos. | • **Modo "The Gist" (Yokubi):** Resumen estructural rápido pre-inmersión en 2 minutos.<br>• **Simulación mental de output:** Reto de 1 frase variando elementos al final del diálogo. | ❌ Memorización mecánica de tablas de conjugación descontextualizadas.<br>❌ Ejercicios de traducción pasiva palabra por palabra. |
| **Acento Tonal (Pitch Accent)** | • **1,256 entradas** con curvas tonales SVG exactas en `pitch_accents.json`.<br>• Notación Heiban ⓪, Atamadaka ①, Nakadaka ② y Odaka.<br>• Downstep y moras marcadas. | • **Entrenador Auditivo de Pares Mínimos (`PitchAccentMinimalPairs.jsx`):** Modo *Muffle Audio* (filtro paso bajo 350Hz), switch de aislamiento vs partícula が, percepción pura (sin kanji previo) y teclas 1-3. | ❌ Memorizar patrones de todo el diccionario sin contexto sintáctico.<br>❌ Confundir entonación de frase con acento léxico. |
| **Inmersión y Minado Multimedia** | • **70 Diálogos completos** (NHK + Irodori) con audio nativo.<br>• **Teleprompter Shadowing Manos Libres** con umbral $\ge 75\%$.<br>• 10 historias extensas (210 oraciones analizadas con furigana).<br>• 18 libros PDF y reproductor YouTube con transcripción interactiva. | • **Medidor de Cobertura Pre-Inmersión:** % conocido y etiqueta de Zona Óptima (90%-98%).<br>• **Minado Inteligente 1T (i+1):** Detección automática e insignia `🎯 Oración Ideal i+1`.<br>• **Furigana FSRS Inteligente:** Ocultar furigana si intervalo $\ge 21$ días.<br>• **Modo Raw Listening (2 Pasos).** | ❌ Forzar al usuario a instalar y configurar herramientas externas complejas (Anki desktop, Python, Yomitan, Mokuro, ASBPlayer). Todo debe funcionar nativo en la web. |
| **Tiempo y Proyección** | • Métricas de progreso acumulado y techos por categoría. | • **Hoja de Ruta Temporal (`StudyRoadmapModule.jsx`):** Proyección con factor 0.8, compuerta Review-First Gate, simulador anti-burnout y cuota dual Estudio vs Habilidad. | ❌ Expectativas irreales de "fluidez en 30 días" sin base científica ni horas de inmersión real. |

---

## 2. Hoja de Ruta Temporal Oficial Auditada

```mermaid
timeline
    title Cronograma Oficial de Aprendizaje Autodidacta
    section Fase 1: Cimientos y Despegue (Días 1 a 30)
        Días 1 a 7 : Dominio de Hiragana y Katakana : Fonética y 5 vocales puras : Configuración FSRS retención 90%
        Días 8 a 30 : 250 a 300 palabras (10/día, factor 0.8) : Prioridad partículas esenciales (は, が, か, を, に, で) : Pre-reconocimiento kanjis visuales : Diálogos cortos NHK con Raw Listening
    section Fase 2: Consolidación e Inmersión (Meses 2 a 6)
        Meses 2 a 3 (Meta N5) : 600 a 800 palabras : 130 kanjis N5 + Jukugos : Forma Te y Masu : 80%+ en Simulador JLPT N5
        Meses 4 a 6 (Meta N4) : 1,500 palabras (Kaishi troncal) : 282 kanjis : Formas causales y condicionales : Minado de oraciones 1T (i+1) : Lectura de manga con furigana dinámico
    section Fase 3: Expansión y Fluidez (Meses 6 a 24+)
        Meses 7 a 12 (Meta N3) : 3,000 a 3,500 palabras : 650 kanjis : Comprensión al 90%-98% de anime/series : Gramática de matices finos : Práctica de pares mínimos de pitch accent
        Meses 12 a 24+ (Metas N2 y N1) : 6,000 a 10,000+ palabras : 1,000 a 2,213 kanjis : Transición a definiciones monolingües : Novelas ligeras y conversación fluida
```

### Detalle Cuantitativo de Hitos:
- **Etapa 1 (Días 1 a 7):** 2 a 3 horas acumuladas. 100% Hiragana y Katakana, fonética moráica, configuración de FSRS.
- **Etapa 2 (Días 8 a 30):** 10 a 15 horas acumuladas. Ingesta controlada de 10 palabras nuevas/día (reales ~8/día por factor 0.8 de sostenibilidad). Primeras 150 tarjetas priorizan partículas esenciales con oraciones ultra-cortas y palabras conocidas.
- **Etapa 3 (Meses 2 a 3 - JLPT N5):** 40 a 60 horas. 600 a 800 palabras, 130 kanjis N5. Puntaje $\ge 80\%$ en simulador N5.
- **Etapa 4 (Meses 4 a 6 - JLPT N4):** 120 a 180 horas. 1,500 palabras, 282 kanjis. Minado activo de oraciones 1T ($i+1$).
- **Etapa 5 (Meses 7 a 12 - JLPT N3):** 300 a 450 horas. 3,000 a 3,500 palabras, 650 kanjis. Inmersión comprensible (90%–98% de cobertura léxica).
- **Etapa 6 (Meses 12 a 24+ - JLPT N2/N1):** 800 a 1,500+ horas. 6,000 a 10,000+ palabras, 1,000 a 2,213 kanjis. Definiciones monolingües y expresión espontánea.

---

## 3. Especificaciones Arquitectónicas por Componente

### 1. `StudyRoadmapModule.jsx` y `HomePage.jsx` / `StudyStatusBento.jsx`
- **Factor de Sostenibilidad Real ($\approx 0.8$):** Las proyecciones de días restantes para N5 y N4 presentan un rango dual:
  - *Estimación Optimista:* `días = palabras_restantes / ritmo_nominal`
  - *Estimación Realista:* `días = palabras_restantes / (ritmo_nominal * 0.8)`
- **Compuerta Review-First Gate:** Si `dueReviewsCount > 80`, la ingesta diaria recomendada se fuerza a `0`, recomendando pausar tarjetas nuevas para evitar la quema del estudiante.
- **Simulador Visual de Carga de Repasos (Anti-Burnout):** Gráfico y alerta dinámica al cambiar el selector de ritmo (5, 10, 15-20/día), advirtiendo que 20 tarjetas nuevas dispara la carga acumulada en semanas 3 y 4 de ~20 min a >1.5 horas diarias.
- **Presupuesto Balanceado (Estudio vs. Habilidad):** En el Dashboard principal, se divide la actividad diaria en dos barras: **Cuota de Estudio (SRS + Gramática)** y **Cuota de Habilidad (Inmersión en Diálogos / Historias / Shadowing)** siguiendo el modelo de la Guía Manabe.

### 2. `VocabSrsReview.jsx` y `KanjiSrsReview.jsx` (Speed Focus Timer & Anti-Difficulty Hell)
- **Temporizador Visual de 5 Segundos:** Cuenta regresiva animada con barra de progreso.
- **Manejo al Expirar:** Si el temporizador de 5s expira sin respuesta, el aviso visual aconseja voltear la tarjeta y pulsar **"Otra vez" (Again)** si no hubo recuerdo inmediato. Se advierte expresamente no abusar de "Difícil" para evitar el Difficulty Hell en FSRS.
- **Restricción de "Difícil":** Reservado únicamente para respuestas acertadas con esfuerzo dentro del límite de tiempo.
- En `lib/srs.js`, FSRS aplica pasos de reaprendizaje (*relearning*) intra-día suaves y mantiene la función `canOptimizeFsrsParameters(totalReviews)` bloqueando optimizaciones prematuras con menos de 200 repasos.

### 3. Minado Inteligente 1T (i+1) en `StoryTab.jsx` y `ConversationTab.jsx`
- Función `evaluateSentenceMiningScore(sentence, masteredVocab, srsQuestions)`.
- Si la frase contiene exactamente 1 palabra no dominada, muestra la insignia **🎯 Oración Ideal i+1**.
- Botón **⚡ Minar Oración (FSRS)**: extrae la oración, el audio, la traducción y la palabra desconocida pre-rellenada, registrándola en `srsQuestions` como tarjeta FSRS lista para repaso.

### 4. Medidor de Cobertura Pre-Inmersión (% Conocido)
- Función `calculateImmersionCoverage(tokensOrText, masteredVocab, srsQuestions)`.
- Muestra una barra de progreso léxico en cada historia y diálogo:
  - $\ge 98\%$: *Lectura Fluida / Repaso*
  - $90\% - 98\%$: *Zona Óptima (Comprensible i+1)*
  - $< 90\%$: *Zona de Desafío (Ruido Potencial)*

### 5. Furigana Dinámico Vinculado a FSRS
- Selector en `StoryTab.jsx` y `ConversationTab.jsx`:
  - *Kanji + Furigana (Todos)*
  - *Solo Hiragana*
  - *Solo Kanji*
  - *Inteligente FSRS:* Oculta el furigana en aquellas palabras cuyo intervalo programado en `lib/srs.js` sea $\ge 21$ días o estén en `masteredVocab`.

### 6. Modo "Raw Listening" (Escucha en Crudo en 2 Pasos)
- En `ConversationTab.jsx`: Interruptor "🎧 1ª Pasada: Solo Oído (Difuminar Texto)".
- Durante la primera pasada, el texto japonés y la traducción se difuminan con desenfoque CSS (`filter: blur(6px)`).
- Al finalizar el audio o pulsar "2ª Pasada: Revelar Texto", el texto se desvela y se desbloquea el minado inteligente 1T.

### 7. `PitchAccentMinimalPairs.jsx` (Entrenador de Discriminación Fonética)
- **Audio Amortiguado (Muffle Audio):** Filtro paso bajo `BiquadFilterNode` (~350Hz) en Web Audio API para escuchar únicamente el contorno fundamental de tono ($F_0$).
- **Interruptor "Trampa en Aislamiento" vs Partícula が:** Permite contrastar palabras homófonas en aislamiento (donde ambas pueden sonar L·H) frente al uso de が como papel tornasol (雨が vs 飴が, 橋が vs 箸が vs 端が).
- **Percepción Pura:** Oculta kanji y significado antes de responder, mostrando solo esquemas tonales (H·L, L·H·H, L·H·L).
- **Atajos 1, 2, 3:** Teclado rápido para resolver sesiones en menos de 3 minutos.

### 8. Intervención See-Link-Go en Leeches de Kanji (`ConfusionComparator.jsx`)
- Al detectar `isLeech(card)` en `KanjiSrsReview.jsx`, se despliega un modal comparativo lado a lado con el kanji de grafía confundible (ej. 隠 vs 穏).
- Resalta en color el componente radical que los distingue y guía los 3 pasos:
  1. **Ver (See):** Aislar la diferencia gráfica visual.
  2. **Vincular (Link):** Asociar el significado con ese radical.
  3. **Exagerar (Go):** Fijar la mnemotecnia con una imagen mental dramática o exagerada.

### 9. Modo "The Gist" (Yokubi) en `CurriculumTab.jsx` y Simulación de Output
- Conmutador en los módulos de gramática: *Modo Práctica Activa (Ejercicios & Scramble)* vs *Modo Resumen Esencial (Estilo Yokubi / The Gist)* para lectura en 2 minutos sin fricción.
- Simulación mental de output al final de los diálogos en `ConversationTab.jsx`: "¿Cómo dirías esto cambiando un elemento con tus propias palabras?".

---

## 4. Verification Plan

### Automated Tests (`scripts/test_roadmap_logic.mjs` & `npm test`)
1. **Test Review-First Gate:** Validar que si `dueReviewsCount > 80`, `calculateRoadmapProjection()` devuelva `recommendedNewCards = 0` e `isReviewGated = true`.
2. **Test Detección de Oraciones 1T (i+1):** Dada una oración de 6 tokens con 5 conocidos y 1 desconocido, verificar que `evaluateSentenceMiningScore()` la clasifique como `OPTIMAL_1T` y extraiga la palabra desconocida como objetivo.
3. **Test Cobertura de Inmersión:** Verificar que un contenido con 94% de coincidencia léxica sea etiquetado como `OPTIMAL_INPUT` en el rango 90%–98%.
4. **Validación Integral de la Suite:**
   ```bash
   npm test
   npm run build
   ```
   Asegurar 100% de tests aprobados y compilación de producción exitosa sin errores en Next.js.
