# 日本語マスター · Nihongo Master

**Plataforma interactiva, moderna y completa para aprender y dominar el idioma japonés a tu propio ritmo.**

Desarrollada con **Next.js 16**, **React 19** y un ecosistema de herramientas propias que integran TTS neuronal, repetición espaciada FSRS, reconocimiento de voz, acento tonal (pitch accent), trazos de kanji con `hanzi-writer`, generación de contenido con IA (Groq), sincronización cloud con Supabase y soporte PWA instalable.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo
npm run dev
# → http://localhost:3000

# 3. Build de producción
npm run build
npm start
```

### Variables de entorno (opcionales)

| Variable | Propósito |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (ya tiene valor por defecto) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `GROQ_API_KEY` | API key de Groq para generación de historias y roleplay con IA |

---

## 📊 La Plataforma en Números

| Recurso | Cantidad |
|---|---|
| Módulos del currículo | **37** (N5: 19, N4: 9, N3: 9) |
| Palabras de vocabulario | **321** (N5: 167, N4: 101, N3: 53) |
| Kanjis con trazos y lecturas | **161** |
| Partículas y estructuras gramaticales | **99** (N5: 46, N4: 19, N3: 22, N2: 8, N1: 4) |
| Preguntas JLPT simulacro | **702** (N5: 253, N4: 212, N3: 123, N2: 59, N1: 55) |
| Lecciones NHK | **48** |
| Diálogos Irodori | **22** |
| Ejercicios de conversación | **210** |
| Historias interactivas | **4** (98 oraciones totales) |
| Entradas de acento tonal (pitch accent) | **1 251** |
| Entradas de diccionario integrado | **1 528** |
| Escenarios de roleplay IA | **6** (cafetería, estación, izakaya, hotel, amigo, libre) |
| Categorías temáticas de vocabulario | **36** |

---

## 🌟 Módulos de la Plataforma (11 secciones)

### 1. 🗺️ Ruta de Aprendizaje Incremental (`/curriculum`)
Currículo estructurado de **37 módulos progresivos** organizados pedagógicamente en niveles N5, N4 y N3. Cada módulo contiene:
- Vocabulario clave con audio TTS
- Puntos gramaticales desglosados con furigana
- Ejercicios interactivos de comprensión (quiz, rellenar espacios, IME)
- Checklist de objetivos Can-Do (autoevaluación Irodori)
- Barra de progreso por sub-pasos con persistencia
- Enlaces a temas relacionados entre módulos

### 2. 📖 Historia Interactiva (`/story`)
**4 capítulos** con **98 oraciones** desglosadas del relato «私の日本での生活» (Mi vida en Japón):
- **3 modos de visualización**: Kanji + Furigana (`<ruby>`), Solo Hiragana y Solo Kanji
- Traducción paralela al español e inglés y notas gramaticales
- Práctica interactiva de digitación con teclado japonés IME
- Audio TTS línea por línea y lectura completa

### 3. 📻 Conversación NHK + Irodori + Roleplay (`/nhk`)
Módulo de conversación integral que combina **3 fuentes de diálogo**:
- **48 lecciones NHK** «Hablemos en Japonés» con audio línea por línea
- **22 diálogos Irodori** con transcripciones y ejercicios
- **210 ejercicios de conversación** con retroalimentación
- **Roleplay IA** con 6 escenarios (cafetería, estación de tren, izakaya, hotel, amigo, escenario libre) — chat conversacional con IA en japonés con sugerencias de respuesta, dictado por voz y correcciones
- **Generador de conversaciones IA** — crea diálogos personalizados por tema y nivel
- **Práctica de pronunciación** con reconocimiento de voz (Web Speech API)
- **Quiz de comprensión** integrado

### 4. 📺 Inmersión YouTube (`/youtube`)
Reproductor de videos de YouTube con subtítulos sincronizados para inmersión auténtica:
- Catálogo curado por categorías (Anime, Comida, Viajes, Vida diaria, JLPT, Música, Cuentos, Entrevistas)
- Búsqueda de videos en vivo por temas
- Subtítulos japoneses sincronizados con traducción y tokenización
- Click en cualquier palabra para ver significado y guardarla
- Filtrado por nivel JLPT (N5 a N3)

### 5. 📚 Vocabulario (`/vocab`)
Banco léxico de **321 palabras** en Kanji, Hiragana y Katakana:
- **Modo Tarjetas** con audio, pitch accent visual y seguimiento de dominadas
- **Modo Práctica IME** — escribe la palabra en japonés a partir del español
- **Modo Ejercicios N4** — rellena espacios y selección múltiple
- **Modo Repaso FSRS (SRS)** — repetición espaciada tipo Anki con 4 calificaciones (Again, Hard, Good, Easy)
- **Generador de historias con IA** — crea historias usando palabras seleccionadas
- **Práctica de pronunciación** con speech recognition
- Filtros por nivel (N5/N4/N3), categoría y búsqueda libre
- Edición/personalización de palabras y notas propias
- Expansión masiva vía API Supabase (modo configurable)

### 6. 🎯 Partículas & Gramática (`/grammar`)
**99 funciones** de partículas japonesas (は, が, を, に, で, と, も, から, まで, より, など, だけ, ね, よ, etc.) con cobertura de N5 a N1:
- Oraciones ejemplo bilingües con audio
- Checklist interactivo de progreso por partícula
- **Modo Quiz** con selección múltiple y entrada IME
- Filtros por nivel y estado (pendiente / dominada)
- Práctica de pronunciación por oración
- Integración SRS FSRS

### 7. 🏆 Simulacros JLPT (`/jlpt`)
**702 preguntas** estilo examen oficial JLPT de N5 a N1:
- **4 secciones**: 文字・語彙 (Vocabulario), 文法 (Gramática), 読解 (Lectura), 聴解 (Audio)
- **Modo práctica** y **modo cronometrado** con temporizador real
- Marcaje de preguntas para revisión
- Resultados detallados con puntuación y estado aprobado/reprobado
- Integración FSRS para preguntas que necesitan refuerzo

### 8. 漢 Biblioteca Kanji (`/kanji`)
**161 kanjis** con información completa:
- Trazos interactivos animados con `hanzi-writer`
- Lecturas On'yomi y Kun'yomi con pronunciación TTS
- Palabras compuestas asociadas con audio
- Mnemotecnias para memorización
- **Modo Repaso FSRS (SRS)** con tarjetas de lecturas
- **Práctica de escritura** de lecturas en Hiragana
- **Generador de historias con IA** usando kanjis seleccionados
- Expansión masiva vía API Supabase

### 9. 📑 Biblioteca de PDFs (`/pdf`)
Catálogo interactivo de materiales de estudio en PDF:
- Visor modal integrado para leer sin salir de la plataforma
- Apertura en pestaña externa opcional
- Materiales organizados: vocabulario, gramática, kanji, historias, cursos (Irodori, NHK)

### 10. 🔖 Palabras & Historias Guardadas (`/saved`)
Repositorio personal de contenido guardado:
- **Palabras personalizadas** agregadas manualmente o desde YouTube/diccionario
- **Frases guardadas** de videos con timestamp
- **Historias generadas por IA** guardadas
- **Conversaciones generadas** guardadas
- Exportación en **JSON**, **Anki CSV** y **Markdown**
- Filtrado por nivel, categoría y búsqueda

### 11. 📊 Mi Progreso (`/progress`)
Dashboard completo de seguimiento:
- **Racha de estudio** diaria con calendario
- **Puntos de experiencia (XP)** acumulados por actividad
- **Meta diaria** configurable (cantidad y categoría)
- **Estadísticas FSRS** — distribución de tarjetas por estado (New, Learning, Review, Relearning)
- **Exportar / Importar** backups en formato JSON
- **Sincronización en la nube** con cuenta Supabase (Email/Contraseña)
- **Guía de configuración de teclado japonés IME** para macOS, Windows, iOS, Android y Linux

---

## 🎧 Reproductor de Audio Avanzado

Barra flotante de reproducción en la parte inferior con control total de pronunciación japonesa:

| Función | Descripción |
|---|---|
| ▶️ **Pausa / Reanudar** | Pausa la lectura y continúa desde el mismo punto |
| ⏭️ **Avanzar / Retroceder** | Salta a la oración o frase siguiente/anterior |
| 🔊 **Click-to-Speak** | Clic en cualquier palabra, oración o tarjeta para escucharla |
| ✂️ **Reproducir Selección** | Selecciona texto japonés con el cursor y se activa el botón «Reproducir Selección» |
| 🎚️ **Control de Velocidad** | `0.75×` · `0.9×` · `1.0×` · `1.25×` |
| 🗣️ **Voces neuronales** | `ja-JP-NanamiNeural` (femenina) y `ja-JP-KeitaNeural` (masculina) |

---

## 🧠 Sistemas Inteligentes

### Repetición Espaciada FSRS (ts-fsrs)
Implementación completa del algoritmo **Free Spaced Repetition Scheduler** (FSRS v5) en vocabulario, kanjis, partículas y preguntas JLPT:
- 4 calificaciones: Again · Hard · Good · Easy
- Estados: New → Learning → Review → Relearning
- Vista previa de intervalos futuros antes de calificar
- Atajos de teclado tipo Anki (1-4, Espacio para revelar)
- Estadísticas y distribución de tarjetas

### TTS Neuronal (Microsoft Edge TTS)
API route `/api/tts` con síntesis de voz japonesa de alta calidad:
- Cache en memoria (500 entradas) para respuesta ultrarrápida
- 2 voces: `ja-JP-NanamiNeural` (F) y `ja-JP-KeitaNeural` (M)
- Control de velocidad dinámico
- Limpieza automática de tags HTML y caracteres Ruby

### Acento Tonal (Pitch Accent)
Visualización del acento tonal estándar de Tokio (標準語) con:
- Curva SVG con nodos High/Low estilo OJAD y mora fantasma para partícula
- Badge de color por patrón: ⓪ 平板 (heiban), ① 頭高 (atamadaka), ② 中高 (nakadaka), ㊵ 尾高 (odaka)
- Notación overline + downstep tipográfica
- Base de datos de **1 251 patrones**

### Diccionario Integrado
Modal de búsqueda bidireccional (japonés ↔ español):
- **1 528 entradas** con definiciones, lecturas y audio
- Tokenización de oraciones japonesas con análisis por palabra
- Guardado rápido de palabras al vocabulario personal
- Búsqueda por Kanji, Hiragana, Katakana o español

### Generación con IA (Groq / LLM)
Facade extensible (`AIFacade`) con adaptadores para distintos proveedores:
- **Historias** — genera historias en japonés con vocabulario específico y nivel
- **Oraciones** — genera oraciones de ejemplo contextuales
- **Conversaciones** — genera diálogos temáticos con personajes
- **Roleplay** — chat interactivo con correcciones y sugerencias
- 9 temas predefinidos + tema libre personalizado

### Reconocimiento de Voz (Web Speech API)
Componente `SpeechPractice` para práctica de pronunciación:
- Dictado en japonés con comparación contra el texto objetivo
- Soporte de contadores, números japoneses y lecturas alternativas
- Indicador visual de resultado (correcto / incorrecto)
- Integrado en vocabulario, gramática, conversación y roleplay

---

## 📱 PWA (Progressive Web App)

La aplicación es **instalable** como app nativa en cualquier dispositivo:

- `manifest.json` con iconos en 8 resoluciones + maskable icons
- Service Worker (`sw.js`) con cache offline
- Banner de instalación nativo (`PWAInstaller`)
- Shortcuts: Ruta de Estudio, Vocabulario, Kanjis, Partículas, Historias
- `display: standalone` con soporte `window-controls-overlay`
- Orientación portrait, tema adaptable light/dark

---

## ☁️ Sincronización y Autenticación (Supabase)

- **Autenticación** con email/contraseña y Google Sign-In
- **Sincronización bidireccional** de progreso entre dispositivos
- **Row Level Security (RLS)** — cada usuario ve solo sus datos
- Push automático debounced tras cada cambio de estado
- Indicador de estado: `local` · `synced` · `syncing` · `error`
- Esquemas SQL en `database/supabase_schema.sql` y `database/supabase_setup.sql`
- Expansión masiva opcional de vocabulario y kanjis via API Supabase

---

## 🗂️ API Routes

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/tts` | GET | Síntesis TTS neuronal japonesa (MS Edge) |
| `/api/data/vocabulary` | GET | Vocabulario expandido desde Supabase |
| `/api/data/kanji` | GET | Kanjis expandidos desde Supabase |
| `/api/kanji/reading` | GET | Lecturas de kanjis |
| `/api/stories/generate` | POST | Generación de historias con IA (Groq) |
| `/api/conversations/generate` | POST | Generación de conversaciones con IA |
| `/api/youtube/search` | GET | Búsqueda de videos de YouTube |
| `/api/youtube/transcript` | GET | Transcripción/subtítulos de videos |

---

## 📁 Estructura del Proyecto

```
nihongo-master/
├── app/                     # Next.js App Router (páginas y API routes)
│   ├── api/                 # 8 endpoints API (TTS, datos, IA, YouTube)
│   ├── curriculum/          # Ruta de aprendizaje
│   ├── story/               # Historias interactivas
│   ├── nhk/                 # Conversación NHK + Irodori + Roleplay
│   ├── youtube/             # Inmersión YouTube
│   ├── vocab/               # Vocabulario
│   ├── grammar/             # Partículas & Gramática
│   ├── jlpt/                # Simulacros JLPT
│   ├── kanji/               # Biblioteca Kanji
│   ├── pdf/                 # Biblioteca PDFs
│   ├── saved/               # Palabras & Historias guardadas
│   ├── progress/            # Mi Progreso
│   └── offline/             # Página offline (PWA)
├── components/
│   ├── tabs/                # 11 vistas principales de navegación
│   ├── modals/              # Modales (IA, diccionario, auth, settings, etc.)
│   ├── features/            # Módulos avanzados (audio, FSRS, kanji draw, pitch, roleplay, speech, SRS, YouTube)
│   ├── layout/              # Shell (AppShell, Header, NavigationTabs, PWAInstaller, ProductTour, PageLoader)
│   └── index.js             # Barrel export centralizado
├── data/                    # 17 archivos JSON de contenido
│   ├── curriculum.json      # 37 módulos del currículo
│   ├── vocabulary.json      # 321 palabras (N5/N4/N3)
│   ├── kanji.json           # 161 kanjis con trazos y lecturas
│   ├── particles.json       # 99 partículas y estructuras (N5→N1)
│   ├── jlpt_exams.json      # 702 preguntas estilo examen JLPT
│   ├── nhk_lessons.json     # 48 lecciones NHK
│   ├── irodori_dialogues.json # 22 diálogos Irodori
│   ├── conversation_exercises.json # 210 ejercicios conversacionales
│   ├── stories.json         # 4 historias interactivas
│   ├── pitch_accents.json   # 1 251 patrones de acento tonal
│   ├── dictionary.json      # 1 528 entradas de diccionario
│   ├── youtube_catalog.json # Catálogo de videos
│   ├── pdf_catalog.json     # Catálogo de materiales PDF
│   ├── exercises.json       # Ejercicios de contexto
│   ├── furigana_dict.json   # Diccionario de furigana
│   └── raw/                 # Datos fuente sin procesar
├── lib/                     # Utilidades y estado global
│   ├── AppContext.jsx       # Contexto global (React Context) con auth, sync, tour, estado
│   ├── ai/                  # AIFacade + GroqAdapter + prompts
│   ├── audioManager.js      # Gestión de reproducción TTS
│   ├── srs.js               # Algoritmo FSRS (ts-fsrs)
│   ├── pitchAccent.js       # Motor de acento tonal
│   ├── furigana.js          # Anotación de furigana automática
│   ├── japaneseUtils.js     # Tokenización, conversión kana/kanji, exportación Anki
│   ├── storage.js           # LocalStorage + persistencia de progreso
│   ├── supabaseClient.js    # Cliente Supabase
│   ├── supabaseSync.js      # Sincronización cloud bidireccional + Auth
│   ├── supabaseData.js      # Queries para datos expandidos
│   ├── notificationManager.js # Notificaciones y recordatorios
│   ├── kanjiStrokeUtils.js  # Utilidades de trazos de kanji
│   └── practiceSheetManager.js # Generación de hojas de práctica
├── database/                # Esquemas SQL para Supabase
├── public/
│   ├── audio/nhk/           # Audios MP3 de lecciones NHK
│   ├── icons/               # Iconos PWA (72px a 512px + maskable + SVG)
│   ├── material_de_estudio/ # PDFs organizados por categoría
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service Worker
├── scripts/                 # Automatización y tests
│   ├── run_all_tests.js     # Suite de pruebas
│   ├── build_dictionary.js  # Construir diccionario
│   ├── build_furigana_dict.js
│   ├── build_pitch_accents.js
│   ├── seed_database.js     # Seed de Supabase
│   └── ...
├── docs/                    # Documentación técnica
└── material_de_estudio/     # Libros y PDFs de estudio
    ├── vocabulario/
    ├── gramatica_y_particulas/
    ├── kanji/
    ├── historias_y_lecturas/
    └── cursos/              # Irodori, NHK
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Lucide React (iconos) |
| **Fuentes** | Inter + Noto Sans JP (Google Fonts) |
| **TTS** | Microsoft Edge TTS (`msedge-tts`) |
| **SRS** | ts-fsrs v5 (Free Spaced Repetition Scheduler) |
| **Kanji Trazos** | hanzi-writer v3 |
| **Kana/Romaji** | wanakana v5 |
| **IA** | Groq API (LLaMA) via AIFacade |
| **Cloud** | Supabase (Auth + PostgreSQL + RLS) |
| **PWA** | Service Worker + Web App Manifest |
| **Voz** | Web Speech API (reconocimiento) |
| **Testing** | Playwright (audit UI) + scripts propios |
| **Deploy** | Vercel + Git LFS |

---

## ⌨️ Guía para Escribir con Teclado Japonés

La aplicación incluye una **guía interactiva integrada** (en Mi Progreso) con instrucciones para **5 sistemas operativos**:

| SO | Resumen |
|---|---|
| 🍏 **macOS** | Ajustes → Teclado → Fuentes de entrada → Japonés (Romaji). Alternar con `Control + Espacio`. |
| 🪟 **Windows** | Configuración → Idioma → Agregar Japonés. Alternar con `Win + Espacio`. |
| 📱 **iOS** | Ajustes → General → Teclado → Añadir → Japonés Romaji. Alternar con el icono 🌐. |
| 🤖 **Android** | Instalar Gboard → Idiomas → Japonés. Alternar con el icono 🌐. |
| 🐧 **Linux** | Instalar `ibus-anthy` o `fcitx-mozc`. Alternar con `Super + Espacio`. |

---

## 🎓 Product Tour Interactivo

Al primer uso, se lanza un **tour guiado** paso a paso que recorre las 11 secciones de la plataforma con:
- Descripción visual de cada módulo
- Ejemplos interactivos en japonés con audio
- Práctica de escritura IME dentro del tour
- Se puede relanzar en cualquier momento desde el menú

---

## ☁️ Despliegue en Vercel

El repositorio cuenta con soporte **Git LFS** para libros y materiales grandes.

### Opción A: Despliegue mediante GitHub (Recomendado)

1. Crear repositorio en GitHub.
2. Vincular y subir:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/nihongo-master.git
   git branch -M main
   git push -u origin main
   ```
3. Conectar a [Vercel](https://vercel.com) → importar el repositorio → activar Git LFS → Deploy.

### Opción B: Vercel CLI

```bash
npx vercel          # Preview
npx vercel --prod   # Producción
```

---

## 🧪 Testing

```bash
# Suite de pruebas automatizada
npm test

# Auditoría de UI con Playwright
npm run audit:ui
```

---

## 📄 Licencia

Proyecto de uso personal y educativo.
