# 🏯 Nihongo Master: Análisis Integral de la Plataforma, Benchmarking de Mercado y Hoja de Ruta Estratégica

> **Documento:** Auditoría de Producto, Benchmarking Competitivo y Plan de Expansión  
> **Fecha:** 29 de Septiembre de 2026 (Versión 2.0 Revisada y Ampliada)  
> **Objetivo:** Analizar las capacidades técnicas y pedagógicas de Nihongo Master frente al mercado global, identificar fortalezas y debilidades, y definir las mejoras, funcionalidades, materiales y documentación requeridos para posicionarla como la plataforma de referencia para hispanohablantes.

---

## 1. Diagnóstico y Arquitectura de la Plataforma Actual

**Nihongo Master** es una Single Page Application / Progressive Web App (PWA) construida sobre **Next.js 16 (App Router + Turbopack)** y **React 19**, orientada al aprendizaje integral del idioma japonés desde el español. Integra en una experiencia cohesiva herramientas que en el ecosistema tradicional se encuentran fragmentadas.

```mermaid
graph TD
    UI[Frontend Next.js 16 / React 19 / PWA] --> AudioMgr[Audio Manager Híbrido: Neural TTS + Web Speech]
    UI --> Pitch[Módulo Visual Pitch Accent SVG]
    UI --> NLP[Tokenizador Intl.Segmenter / Wanakana]
    UI --> FSRS[Motor SRS ts-fsrs v5]
    UI --> Hanzi[Trazador HanziWriter Canvas]
    UI --> Facade[AIFacade Groq / LLM]
    UI --> Sync[Supabase Cloud Sync & RLS]
    
    subgraph Modulos["Módulos de Aprendizaje"]
        Curriculum["Ruta de Aprendizaje 9 Niveles"]
        Story["Historias con Furigana y Ruby"]
        NHK["Conversación NHK 48 Lecciones"]
        YT["Inmersión YouTube con Subtítulos Interactivos"]
        Vocab["Vocabulario FSRS con Pitch & Práctica IME"]
        Grammar["Partículas y Gramática Esencial"]
        Kanji["Biblioteca Kanji con 135+ Kanjis & Masivo"]
        PDFs["Biblioteca 15 Materiales Originales"]
        Saved["Palabras y Frases Guardadas"]
    end
    
    UI --> Modulos
```

### 1.1. Inventario de Módulos y Capacidades Técnicas

| Módulo | Base Técnica | Estado Actual | Fortalezas Observadas | Cuellos de Botella Detectados |
| :--- | :--- | :---: | :--- | :--- |
| **🗺️ Ruta de Aprendizaje** (`/curriculum`) | `dataStore.curriculum` (19 módulos consolidados con 87 Can-Dos y 82 ejercicios) | **Operativo** | Temario unificado sin redundancias, autoevaluación interactiva Can-Do con checkboxes, micro-evaluaciones por módulo (+5 XP), audio nativo y enlaces directos a temas relacionados. | Faltan lecciones avanzadas para cubrir N3-N1 (planificadas para Fase 4). |
| **📖 Historias Interactivas** (`/story`) | Generador JSON con etiquetas `<ruby>`, Web Speech API, Wanakana | **Operativo** | 3 modos de visualización (Natural con Furigana, Solo Kana, Solo Kanji), desglose oracional, notas gramaticales, práctica de mecanografía IME. | Catálogo precargado de historias reducido; audio sintético sin entonación contextual de Tokio. |
| **📻 Conversación NHK** (`/nhk`) | 48 lecciones completas del curso "Hablemos en Japón", 144 ejercicios | **Operativo** | Cobertura de las 48 lecciones de Anna y Sakura, audio línea por línea, 3 ejercicios interactivos por lección (preguntas de opción, kanji y respuesta). | Las voces son sintéticas (Web Speech API) en lugar de los clips de audio radiofónico originales de la NHK. |
| **📺 Inmersión YouTube** (`/youtube`) | YouTube IFrame API, API de transcripciones, `Intl.Segmenter` | **Operativo** | Subtítulos bilingües sincronizados con auto-scroll, clic en cualquier token japonés para ver significado y furigana, práctica de shadowing con speech-to-text. | Depende de la disponibilidad de subtítulos oficiales o generados en YouTube; videos con subtítulos quemados en video no son interactivos. |
| **📚 Vocabulario & SRS** (`/vocab`) | Algoritmo **ts-fsrs** (FSRS v5), Wanakana, Web Speech API | **Operativo** | FSRS supera drásticamente a SM-2 (Anki clásico); 4 modos (Tarjetas, Mecanografía IME, 35 ejercicios de contexto N4, Repaso SRS); notas de usuario y edición. | Volumen precargado en JSON (208 palabras sincronizadas); ausencia de indicación gráfica de *Pitch Accent* y audio neuronal. |
| **🎯 Partículas & Gramática** (`/grammar`) | `dataStore.particles` (25 partículas clave) | **Operativo** | Explicaciones en español muy claras, fórmulas de construcción, ejemplos con audio y modo Quiz con selección y entrada IME. | Cubre 25 funciones elementales; falta expandir a construcciones compuestas de nivel N4 y N3 (ej. 〜わけにはいかない, 〜はずだ). |
| **漢 Biblioteca de Kanjis** (`/kanji`) | `HanziWriter`, multi-CDN stroke loader, `wanakana`, SRS | **Operativo** | Animación trazo por trazo, guía de radicales, modo prueba de dibujo interactivo en pantalla, lecturas On/Kun, palabras compuestas sincronizadas. | Falta desglose de componentes fonéticos/semánticos y mnemotecnias visuales ilustradas. |
| **📑 Visor de Documentos** (`/pdf`) | Iframe modal vinculado a `public/material_de_estudio/` | **Operativo** | Acceso inmediato a los 15 materiales de referencia originales (PDFs, hojas de cálculo de partículas) sin salir de la plataforma. | Es un visor pasivo; no permite hacer clic en palabras dentro del PDF para agregarlas a vocabulario o reproducir audio. |
| **🔖 Guardados & IA Facade** (`/saved`, `/api/stories/generate`) | Patrón Facade agnóstico (Groq/Llama-3, OpenAI, Anthropic), exportación Anki/Markdown | **Operativo** | Permite seleccionar palabras guardadas y pedirle a la IA una historia nivelada que las use en contexto real; exportación Anki CSV con campos limpios. | Requiere autenticación de usuario y clave de API configurada en variables de entorno para la generación con IA. |
| **📊 Progreso y Respaldo** (`/progress`) | `localStorage` + Supabase PostgreSQL con RLS | **Operativo** | Sistema sin bloqueo: funciona 100% offline con guardado local y permite sincronización en la nube con cuentas de Google/correo; respaldo JSON. | Falta sistema de notificaciones push de recordatorio de estudio diario en dispositivos móviles. |

---

## 2. Benchmarking Exhaustivo de las Opciones del Mercado

Para comprender dónde se sitúa Nihongo Master y cómo puede liderar su categoría, hemos evaluado los 9 referentes internacionales del aprendizaje de japonés:

```
                                    PROFUNDIDAD LINGÜÍSTICA
                                              ▲
                                              │   • Bunpro (Gramática pura)
                                              │   • WaniKani (Kanjis puros)
                                              │   • Satori Reader (Lectura y audio nativo)
            • Nihongo Master                  │
              (Ecosistema unificado en ES)   │
                                              │
    ◄─────────────────────────────────────────┼─────────────────────────────────────────►
    AUTONOMÍA / EXPERIENCIA FLUIDA            │                         GAMIFICACIÓN PURA
                                              │   • LingoDeer
                                              │   • Busuu
                                              │   • Duolingo (Muy superficial)
                                              │
                                              ▼
                                   SUPERFICIALIDAD / FRAGMENTACIÓN
```

### 2.1. Análisis Detallado por Competidor

#### 1. WaniKani (Tofugu)
- **Propuesta:** Plataforma web especializada exclusivamente en memorización de los 2,136 Jōyō Kanjis y 6,000+ palabras compuestas usando mnemotécnicas radicales y SRS (SM-2 modificado).
- **Puntos Fuertes:** Mnemotécnicas humorísticas memorables; separación rigurosa entre radicales, significado y lecturas Onyomi/Kunyomi; retención a largo plazo comprobada.
- **Puntos Débiles:** **Cero gramática**, **cero comprensión auditiva**, **cero conversación**, **cero Pitch Accent**. Sistema inflexible de niveles bloqueados. Precio elevado ($9 USD/mes o $299 de por vida). **Completamente en inglés**.

#### 2. Bunpro
- **Propuesta:** El referente indiscutible para gramática japonesa basada en SRS, desde JLPT N5 hasta N1.
- **Puntos Fuertes:** Miles de oraciones de prueba con audio humano nativo; rutas alternativas según el libro que uses (Genki, Minna no Nihongo, Tobira); explicaciones gramaticales exhaustivas con enlaces a recursos externos.
- **Puntos Débiles:** Interfaz sobrecargada y curva de aprendizaje técnica; es una herramienta de repaso, no enseña conceptos desde cero; requiere suscripción de pago; interfaz y explicaciones mayoritariamente en inglés.

#### 3. Satori Reader
- **Propuesta:** Plataforma de lectura graduada con anotaciones interactivas frase por frase preparadas manualmente por lingüistas nativos.
- **Puntos Fuertes:** Furigana personalizado (muestra solo el furigana de los kanjis que tú aún no dominas); explicaciones socioculturales profundas al tocar cualquier frase; grabaciones de audio humano de actores de voz profesionales a velocidad pausada o natural.
- **Puntos Débiles:** No tiene ruta para principiantes absolutos; catálogo cerrado de historias; modelo de suscripción mensual ($9 USD/mes); traducciones únicamente al inglés.

#### 4. Duolingo
- **Propuesta:** Aplicación hipergamificada de micro-lecciones.
- **Puntos Fuertes:** Excelente retención por recompensas psicológicas (rachas, ligas, vidas); interfaz pulida e intuitiva; gratuita con publicidad.
- **Puntos Débiles:** **Explicaciones gramaticales casi inexistentes**; voces sintéticas descontextualizadas; no enseña el porqué de las partículas; oraciones artificiales que ningún nativo usaría; pésima transición a textos largos y kanjis reales; ignora el Pitch Accent por completo.

#### 5. LingoDeer
- **Propuesta:** Diseñada específicamente para idiomas asiáticos (japonés, coreano, chino), superando los defectos pedagógicos de Duolingo.
- **Puntos Fuertes:** Explicaciones gramaticales claras antes de cada unidad; audio nativo real de alta calidad; soporte en español; buena progresión inicial para principiantes.
- **Puntos Débiles:** Cobertura limitada (se estanca en N4 avanzado); sistema de suscripción restrictivo; carece de inmersión en contenido real (sin lector de videos ni de textos libres).

#### 6. Ecosistema "Sentence Mining": Yomitan (ex-Yomichan) + Anki + Migaku
- **Propuesta:** El estándar de los estudiantes autodidactas avanzados (*método Refold / AJATT*). Consiste en consumir anime, YouTube, novelas web o manga con extensiones de navegador que con un clic crean tarjetas Anki con audio, captura de pantalla, oración y definición de diccionario.
- **Puntos Fuertes:** Inmersión en contenido 100% auténtico; vocabulario contextualizado en oraciones reales; soporte de diccionarios de Pitch Accent (Wadoku, Kanjium).
- **Puntos Débiles:** **Curva de instalación y configuración infernal**; fragmentación en múltiples herramientas; ausencia total de un currículum o guía estructurada para quien empieza desde cero.

#### 7. Busuu
- **Propuesta:** Curso estructurado por niveles MCER (A1 a B2) con interacción con hablantes nativos.
- **Puntos Fuertes:** Ejercicios de audio y escritura corregidos por miembros nativos de la comunidad; explicaciones en español; enfoque comunicativo.
- **Puntos Débiles:** El catálogo de kanjis es superficial; no profundiza en lecturas On/Kun ni trazos; algoritmo de repaso elemental (no utiliza FSRS); menor cantidad de ejercicios específicos de JLPT.

#### 8. Kanshudo / MaruMori / Nihongo Master (.com)
- **Propuesta:** Suites completas web todo-en-uno que intentan unificar lecciones, kanji y gramática.
- **Puntos Fuertes:** Centralización de recursos; abundante base de datos de kanjis y oraciones.
- **Puntos Débiles:** Tarifas elevadas ($10 a $20 USD/mes); interfaces a veces lentas o sobrecargadas de texto; contenido 100% en inglés.

---

### 2.2. Matriz Comparativa Multidimensional

| Característica / Dimensión | WaniKani | Bunpro | Duolingo | LingoDeer | Satori Reader | Migaku + Anki | **Nihongo Master (Plan Maestro)** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Idioma de instrucción nativo** | 🇬🇧 Inglés | 🇬🇧 Inglés | 🇪🇸 Español | 🇪🇸 Español | 🇬🇧 Inglés | Depende de config | 🇪🇸 **Español Nativo** |
| **Algoritmo de Repaso (SRS)** | SM-2 Mod. | SM-2 Mod. | Algoritmo propio | Propio | No | SM-2 / FSRS (Anki) | **FSRS v5 (ts-fsrs)** |
| **Visualización Pitch Accent** | 🔴 Nulo | 🟡 Texto parcial | 🔴 Nulo | 🔴 Nulo | 🟡 En notas | 🟢 Sí (Add-on) | 🟢 **Sí (SVG + Badges + Downstep)** |
| **Calidad de Audio** | 🟢 Humano nativo | 🟢 Humano nativo | 🔴 TTS robótico | 🟢 Humano nativo | 🟢 Actores de voz | 🟢 Clips reales | 🟢 **Híbrido: MP3 Nativo + Edge Neural TTS** |
| **Estudio y Trazo de Kanji** | 🟢 Alto (Mnemotecnias) | 🔴 Nulo | 🟡 Bajo | 🟡 Medio | 🔴 Nulo | 🟡 Variable | 🟢 **Alto (HanziWriter + Trazos)** |
| **Gramática y Partículas** | 🔴 Nulo | 🟢 Sobresaliente | 🔴 Pésimo | 🟢 Bueno | 🟢 Bueno | 🔴 Nulo (Autodidacta) | 🟢 **Sobresaliente (25+ Partículas + Irodori)** |
| **Inmersión Multimedia (YouTube)** | 🔴 No | 🔴 No | 🔴 No | 🔴 No | 🔴 No | 🟢 Sí (Extensión) | 🟢 **Sí (Integrado nativo con Shadowing)** |
| **Lectura Graduada con Furigana** | 🔴 No | 🔴 No | 🔴 No | 🟡 Básico | 🟢 Sobresaliente | 🟡 Con Yomitan | 🟢 **Sí (Historias + Ruby + Lector Libre)** |
| **Generación de Contenido por IA** | 🔴 No | 🔴 No | 🟡 Básico (Max) | 🔴 No | 🔴 No | 🟡 Experimental | 🟢 **Sí (AIFacade Groq/LLMs)** |
| **Mecanografía con Teclado IME** | 🟢 Sí | 🟢 Sí | 🟡 Limitado | 🟡 Limitado | 🔴 No | 🟢 Sí | 🟢 **Sí (Wanakana + IME)** |
| **PWA / Funcionamiento Offline** | 🔴 Web pura | 🟡 App móvil | 🟡 Requiere Plus | 🟡 Requiere Plus | 🟡 App | 🟢 Anki Offline | 🟢 **PWA + LocalStorage + Cloud Sync** |
| **Modelo de Costo** | $9/mes o $299 | $5/mes o $150 | Freemium / $13/mes | $14/mes | $9/mes | Freemium complejo | **Código Propio / $0 Suscripción** |

---

## 3. Análisis DAFO / FODA de Nihongo Master

```mermaid
flowchart TD
    subgraph DAFO["Matriz DAFO / FODA - Nihongo Master"]
        direction TB
        subgraph F["🟢 FORTALEZAS (Internas)"]
            direction TB
            F1["Ecosistema unificado 100% en español"]
            F2["Motor FSRS v5 de vanguardia científica"]
            F3["Tokenizador e inmersión YouTube nativa"]
            F4["HanziWriter: trazo interactivo de kanji en Canvas"]
            F5["IA Facade para historias dinámicas personalizadas"]
        end
        subgraph D["🔴 DEBILIDADES (Internas)"]
            D1["Dependencia de Web Speech API (calidad variable en móviles)"]
            D2["Ausencia de notación visual de Pitch Accent"]
            D3["Curso Irodori A1 pasivo en PDF sin interactividad"]
            D4["Catálogo inicial de vocabulario acotado (~190 palabras)"]
        end
        subgraph O["🚀 OPORTUNIDADES (Externas)"]
            O1["Gran vacío en el mercado hispanohablante de alta gama"]
            O2["Auge del método de inmersión y sentence mining"]
            O3["TTS Neuronal Gratuito de alta fidelidad (Edge TTS / Neural2)"]
            O4["Datasets abiertos de Pitch Accent (Kanjium / Wadoku)"]
        end
        subgraph A["⚠️ AMENAZAS (Externas)"]
            A1["Posibles límites o cambios de CORS en APIs externas"]
            A2["Costos imprevistos si se escalan LLMs sin caché estática"]
            A3["Saturación por aplicaciones masivas hipergamificadas"]
        end
    end
```

### 3.1. Fortalezas (Strengths)
1. **100% en español con rigor lingüístico:** Llena el mayor vacío del mercado global, donde las mejores herramientas (WaniKani, Bunpro, Satori Reader) ignoran por completo a los más de 500 millones de hispanohablantes.
2. **Unificación holística de herramientas:** Resuelve el problema de la fragmentación (evita tener que abrir Anki para vocabulario, WaniKani para kanji, Bunpro para gramática y YouTube por separado).
3. **Algoritmo FSRS (Free Spaced Repetition Scheduler):** Emplea `ts-fsrs`, la tecnología de repetición espaciada más avanzada de la ciencia cognitiva contemporánea, superando el algoritmo SM-2 de hace 30 años.
4. **Tokenización japonesa nativa (`Intl.Segmenter` + Wanakana):** Permite desglosar textos de historias o subtítulos de YouTube en palabras individuales con furigana, significado inmediato y guardado a la libreta personal con un solo clic.
5. **Generador de historias con IA (Patrón Facade):** Capacidad única de tomar las palabras que al alumno le cuesta memorizar y generar lecturas graduadas con formato `<ruby>` y explicaciones gramaticales contextuales.
6. **Arquitectura Zero-Vendor-Lockin y Respaldo Dual:** Funciona sin cuenta en local y se sincroniza con Supabase en la nube; exporta a Anki CSV y Markdown estándar.

### 3.2. Debilidades (Weaknesses)
1. **Voz Sintética del Navegador (Web Speech API):**
   - En ordenadores con macOS o Windows modernos las voces (Kyoko, Otoya, Microsoft Ayumi) suenan aceptables, pero en dispositivos móviles Android económicos o navegadores sin paquetes de voz instalados, el audio suena metálico, robótico o falla silenciosamente.
   - No tiene la prosodia ni el timbre cálido de un hablante nativo real.
2. **Ausencia de Acento Tonal (*Pitch Accent*):**
   - En japonés, el acento no es de intensidad o volumen sino de altura tonal (*pitch*). Hablar con acento plano o equivocado produce un acento extranjero marcado e impide distinguir homófonos vitales como *ame* (lluvia vs caramelo) o *hashi* (palillos vs puente vs borde).
3. **El curso "Irodori Elementary 1" (Digitalización e Interactividad Completadas):**
   - Los 79 objetivos Can-do oficiales de Irodori y sus 8 objetivos complementarios (87 Can-dos en total) se han digitalizado e integrado en los 19 Módulos Maestros con checklist interactivo de autoevaluación (checkboxes persistentes), audio nativo y ejercicios de aplicación.
4. **Sin notificaciones push:**
   - Si el estudiante no abre la app por voluntad propia, no recibe recordatorios cuando tiene tarjetas acumuladas en el sistema SRS.

### 3.3. Oportunidades (Opportunities)
1. **Liderar el mercado hispanohablante de alta calidad:** Convertir a Nihongo Master en la primera plataforma en español con Pitch Accent visual y motor FSRS v5.
2. **Adopción de TTS Neuronal de Costo Cero ($0):** Utilizar Microsoft Edge TTS (`msedge-tts`) o Google Cloud Neural2 (1M caracteres/mes gratis) junto con caché en Supabase Storage para proporcionar audios nativos indistinguibles de una persona real a costo cero.
3. **Modo Lector Libre de Textos (Reader & Importer):** Permitir al usuario pegar cualquier artículo de prensa (NHK Easy), letra de canción o fragmento literario para que la app le añada furigana automático y tokenización instantánea.

---

## 4. Plan de Mejoras y Funcionalidades Adicionales (Roadmap)

```mermaid
flowchart LR
    subgraph F1["Fase 1: Calidad Inmediata (Q4 2026)"]
        direction TB
        P1["Notación Pitch Accent Visual (SVG + Badges)"]
        P2["Audio Híbrido: MP3 Nativo + Edge Neural TTS ($0)"]
        P3["Irodori A1: 79 Can-dos Interactivos"]
    end

    subgraph F2["Fase 2: Inmersión y Lectura (Q4 2026 - Q1 2027)"]
        direction TB
        P4["Lector Libre de Artículos y Textos"]
        P5["Importador Subtítulos .srt / .vtt"]
        P6["Web Push Notifications FSRS"]
    end

    subgraph F3["Fase 3: Inteligencia Adaptativa (Q1 2027)"]
        direction TB
        P7["Mnemotécnicas Gráficas de Kanjis"]
        P8["Tutor de Voz IA para Roleplays"]
    end

    subgraph F4["Fase 4: Certificación JLPT (Q1-Q2 2027)"]
        direction TB
        P9["Simulador Exámenes JLPT N5-N3"]
        P10["Ligas y Desafíos Comunitarios"]
    end

    F1 --> F2 --> F3 --> F4
```

---

### 4.1. Fase 1: Perfeccionamiento Lingüístico y Contenido Estructurado

#### 1. Notación Visual de Pitch Accent (Acento Tonal Japonés)

##### A. Fundamento Fonológico
A diferencia del español (acento léxico de intensidad: *"canto"* vs *"cantó"*), el japonés estándar de Tokio (*Hyoujungo* / 東京式アクセント) es un idioma de **acento tonal de altura** (*pitch accent* / 高低アクセント).

- **La unidad fonética:** La **mora** (拍 *haku*), no la sílaba tradicional.
  - きっぷ (*ki-p-pu*) tiene 2 sílabas pero 3 moras (la pausa sorda っ cuenta como una mora completa).
  - とうきょう (*to-u-kyo-u*) tiene 2 sílabas pero 4 moras (las vocales alargadas う cuentan como moras independientes).
  - にほん (*ni-ho-n*) tiene 3 moras (la ん final es una mora independiente).

- **Las Dos Reglas de Oro del Dialecto de Tokio:**
  1. **Regla de Oposición Inicial:** La 1ª mora y la 2ª mora siempre tienen alturas tonales opuestas (si la 1ª es Baja, la 2ª es Alta; si la 1ª es Alta, la 2ª es Baja).
  2. **Regla de No Retorno:** Una vez que el tono cae (*downstep* / 下がり目), **nunca vuelve a subir** dentro de la misma palabra o grupo de acento.

##### B. Los 4 Patrones Tonales Canónicos
El siguiente cuadro resume el comportamiento exacto de los 4 patrones tonales, incluyendo su interacción crucial con las partículas enclíticas (が, を, に, は):

| Patrón | Nombre en Japonés | Símbolo | Estructura Tonal (Vocablo + Partícula が) | Ejemplos Representativos con Significado |
| :--- | :--- | :---: | :--- | :--- |
| **⓪ Heiban** (Plano) | 平板型 (*Heiban-gata*) | ⓪ | Comienza bajo en la 1ª mora, sube en la 2ª y **la partícula siguiente se mantiene ALTA** (L-H-H-H...) | • にほん (L-H-H) → にほん**が** (L-H-H-**H**) 🇯🇵 Japón<br>• ともだち (L-H-H-H) → ともだち**が** (L-H-H-H-**H**) 🤝 Amigo<br>• さくら (L-H-H) → さくら**が** (L-H-H-**H**) 🌸 Cerezo |
| **① Atamadaka** (Pico Inicial) | 頭高型 (*Atamadaka-gata*) | ① | Comienza **ALTO en la 1ª mora**, cae en la 2ª y **la partícula siguiente es BAJA** (H-L-L-L...) | • あめ (H-L) → あめ**が** (H-L-**L**) 🌧️ Lluvia<br>• いのち (H-L-L) → いのち**が** (H-L-L-**L**) 🕊️ Vida<br>• ねこ (H-L) → ねこ**が** (H-L-**L**) 🐱 Gato |
| **②/③ Nakadaka** (Pico Intermedio) | 中高型 (*Nakadaka-gata*) | ②, ③, ... | Comienza bajo, sube hasta la mora marcada por el número donde cae, y **la partícula es BAJA** (L-H...-L) | • こころ (L-H-L) [②] → こころ**が** (L-H-L-**L**) 💖 Corazón<br>• たまご (L-H-L) [②] → たまご**が** (L-H-L-**L**) 🥚 Huevo<br>• ひこうき (L-H-H-L) [③] → ひこうき**が** (L-H-H-L-**L**) ✈️ Avión |
| **㊵ Odaka** (Pico Final) | 尾高型 (*Odaka-gata*) | ㊵ (n) | Comienza bajo, sube y se mantiene alto hasta la última mora del vocablo. **La caída (downstep) ocurre en la PARTÍCULA** (L-H-H...-L) | • はな (L-H) [②] → はな**が** (L-H-**L**) 🌺 Flor (*vs はな ⓪ Nariz*)<br>• おとこ (L-H-H) [③] → おとこ**が** (L-H-H-**L**) 👨 Hombre<br>• いもうと (L-H-H-H) [④] → いもうと**が** (L-H-H-H-**L**) 👧 Hermana menor |

##### C. Pares Mínimos Esenciales (Homófonos que cambian por tono)
Demostración de por qué el estudiante hispanohablante debe aprender el acento tonal desde el día 1:

| Romaji | Vocablo 1 (Significado y Patrón) | Vocablo 2 (Significado y Patrón) | Vocablo 3 (Significado y Patrón) |
| :--- | :--- | :--- | :--- |
| **ame** | **雨** (① Atamadaka, H-L): Lluvia 🌧️ | **飴** (⓪ Heiban, L-H): Caramelo 🍬 | — |
| **hashi** | **箸** (① Atamadaka, H-L): Palillos 🥢 | **橋** (② Odaka, L-H[L]): Puente 🌉 | **端** (⓪ Heiban, L-H[H]): Borde/Esquina 📐 |
| **kami** | **神** (① Atamadaka, H-L): Dios / Deidad ⛩️ | **紙** (② Odaka, L-H[L]): Papel 📄 | **髪** (② Odaka, L-H[L]): Cabello 💇 |
| **kaki** | **牡蠣** (① Atamadaka, H-L): Ostra 🦪 | **柿** (⓪ Heiban, L-H): Caqui 🍅 | **垣** (② Odaka, L-H[L]): Valla / Cerca 🧱 |
| **hana** | **花** (② Odaka, L-H[L]): Flor 🌺 | **鼻** (⓪ Heiban, L-H[H]): Nariz 👃 | — |
| **isha** | **慰謝** (① Atamadaka, H-L): Consuelo / Reparación | **医者** (⓪ Heiban, L-H): Médico / Doctor 👨‍⚕️ | — |

##### D. Diseño del Sistema Visual en Nihongo Master (3 Vistas Integradas)
Para ofrecer máxima claridad sin saturar la interfaz de estudio, se implementará un componente React versátil con 3 modos de representación:

1. **Notación Overline + Downstep (Estándar Wadoku / Yomitan):**
   - Una línea horizontal continua por encima de las moras de tono alto, con un escalón vertical descendente (ꜜ) en la mora donde se produce el corte de tono.
   - Código CSS semántico:
     ```css
     .pitch-display { display: inline-flex; align-items: flex-end; font-size: 1.25rem; }
     .pitch-mora { position: relative; padding: 2px 3px; }
     .pitch-high { border-top: 2.5px solid currentColor; }
     .pitch-drop { border-top: 2.5px solid currentColor; border-right: 2.5px solid currentColor; border-top-right-radius: 2px; }
     .pitch-low { border-top: 2.5px solid transparent; }
     .pitch-particle { opacity: 0.6; font-size: 0.9em; margin-left: 2px; }
     ```

2. **Micro-curva SVG de Tono (Mora-Pitch Curve / Estilo OJAD):**
   - Componente interactivo `<PitchCurve reading="にほん" pattern={0} particle="が" />`
   - Renderiza un SVG ultraligero de 18px de altura con círculos en los niveles Low (y=14) y High (y=4), conectados por un trazo SVG suave (`stroke-width="2"`).
   - Incluye opcionalmente la mora fantasma de la partícula con trazo punteado, para que el usuario entienda al instante la diferencia entre **Heiban** (la partícula sigue alta) y **Odaka** (la partícula cae a nivel bajo).

3. **Pills de Clasificación con Código de Color Accesible:**
   - `[⓪ 平板]` (Celeste Cian `#38bdf8` / `bg-sky-500/20 text-sky-400`): Estabilidad, tono plano continuo.
   - `[① 頭高]` (Rojo Coral `#f87171` / `bg-rose-500/20 text-rose-400`): Pico inicial, caída inmediata.
   - `[② 中高]` (Ámbar Dorado `#fbbf24` / `bg-amber-500/20 text-amber-400`): Subida intermedia y descenso.
   - `[㊵ 尾高]` (Violeta Púrpura `#c084fc` / `bg-purple-500/20 text-purple-400`): Pico final, caída en la partícula.

##### E. Base de Datos e Integración Técnica (Completado en Producción)
- **Dataset Abierto Kanjium + Curación Exclusiva (`data/pitch_accents.json`):**
  - Base de datos indexada y optimizada en JSON (~132 KB) con **100% de cobertura** sobre todas las palabras del catálogo de vocabulario (`data/vocabulary.json`) y el 100% de las palabras compuestas de kanji (`data/kanji.json`).
  - Mapeo unificado de patrones: `pattern` numérico, `type` canónico (*heiban*, *atamadaka*, *nakadaka*, *odaka*) y conteo moraico.
- **Módulo Fonológico (`lib/pitchAccent.js`):**
  - Tokenizador moraico `getMoras(kana)` que procesa correctamente combinaciones diacríticas (拗音: *kya*, *shu*, *cho*), pausas sordas (*sokuon* っ) y sonidos nasales (*hatsuon* ん).
  - Cálculo de trayectorias tonales `calculatePitchLevels` con altura de partículas (ej. が) y ubicación del downstep (下がり目).
- **Componente React SVG (`components/PitchAccent.jsx`):**
  - Renderizado vectorial SVG puro estilo OJAD / Diccionario NHK con líneas de tono continuo, nodos circulares moraicos, indicador de caída acentuada y mora fantasma para la partícula.
  - Modos de presentación: `'full'` (badge + curva SVG completa con etiquetas moraicas), `'compact'` (badge + mini curva) y `'badge'` (pill con código de color accesible).
- **Despliegue Transversal en la Interfaz:**
  1. *Fichas de Vocabulario (`components/VocabTab.jsx`):* Cada tarjeta incluye la curva SVG y badge debajo de la lectura kana.
  2. *Repaso SRS de Vocabulario:* La cara posterior de las tarjetas SRS despliega la curva SVG a tamaño medio con botón para escuchar con entonación de Tokio.
  3. *Mecanografía IME de Vocabulario:* El cuadro de feedback muestra la curva tonal instantánea tras responder.
  4. *Fichas de Kanjis (`components/KanjiTab.jsx`):* Cada palabra compuesta del ideograma incorpora su mini curva SVG de acento tonal.
  5. *Repaso SRS de Kanjis:* Muestra la curva tonal de la lectura principal al voltear la tarjeta.
  6. *Guardado de Palabras (`components/SaveVocabModal.jsx`):* Previsualización interactiva en tiempo real del acento tonal mientras el usuario escribe o edita un término.

---

#### 2. Arquitectura de Audio Híbrida y TTS Neuronal de Alta Fidelidad Sin Costo ($0)

Actualmente la plataforma depende de `window.speechSynthesis` (Web Speech API). Si bien es una API nativa del navegador, presenta graves deficiencias:
- En dispositivos móviles Android la voz japonesa a menudo no viene preinstalada o suena excesivamente robótica.
- En navegadores de escritorio la calidad varía radicalmente entre Windows, macOS y Linux.
- No garantiza la correcta pronunciación del acento tonal (*pitch accent*) de Tokio ni las sutilezas de partículas enclíticas (ej. leer は como *wa* en función de partícula y como *ha* en sustantivos).

Para resolver esto con **costo cero absoluto ($0.00)** y calidad de estudio profesional, se ha realizado una evaluación técnica rigurosa de las alternativas disponibles:

##### A. Matriz Comparativa de Opciones de TTS Neuronal

| Opción de TTS | Calidad de Voz y Entonación | Costo Real / Nivel Gratuito | Voces Recomendadas en Japonés | Infraestructura Requerida | Viabilidad para Nihongo Master |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **Microsoft Edge TTS (`msedge-tts`)** | 🟢 **Excepcional (Nivel Azure Neural)** | **$0.00 (Totalmente Libre sin límites prácticos ni tarjeta)** | `ja-JP-NanamiNeural` (Femenina cálida de Tokio)<br>`ja-JP-KeitaNeural` (Masculina neutra) | API Route serverless en Next.js (`/api/tts`) conectada al WebSocket seguro de Edge. | ⭐️⭐️⭐️⭐️⭐️ **Opción #1 Recomendada** |
| **Azure Speech Cognitive Services (Free Tier F0)** | 🟢 **Excepcional (Mismo motor que Edge TTS)** | **$0.00 (500,000 caracteres/mes gratis permanentes con API Key oficial)** | `ja-JP-NanamiNeural`<br>`ja-JP-KeitaNeural`<br>`ja-JP-AoiNeural` | API Key oficial de Azure en `.env.local`, SDK oficial `@azure/cognitiveservices-speech`. | ⭐️⭐️⭐️⭐️⭐️ **Opción de Respaldo Oficial** |
| **Google Cloud TTS (Neural2 / WaveNet)** | 🟢 **Excelente (Modelos DeepMind)** | **$0.00 (1,000,000 caracteres/mes gratis para Neural2; 4M estándar)** | `ja-JP-Neural2-B` (Femenina)<br>`ja-JP-Neural2-C` (Masculina) | Cuenta de Google Cloud con tarjeta (no cobra dentro del cupo del millón mensual). | ⭐️⭐️⭐️⭐️ **Muy Buena Alternativa** |
| **VOICEVOX (Motor Open Source Japonés)** | 🟢 **Sobresaliente (Especializado 100% en fonética nipona)** | **$0.00 (Código abierto bajo licencia MIT y licencias libres de personajes)** | *Zundamon* (ずんだもん)<br>*Shikoku Metan* (四国めたん)<br>*Kasukabe Tsumugi* | Requiere servidor Docker propio (CPU/GPU) o desplegar una instancia en **Hugging Face Spaces (Free Tier CPU)**. | ⭐️⭐️⭐️⭐️ **Ideal para Expresividad / Anime** |
| **Kokoro-82M / Kokoro-JS (TTS en el Navegador con WebGPU)** | 🟢 **Muy Buena (Modelo de 82M parámetros)** | **$0.00 (Inferencia en el cliente del usuario, cero costo de servidor)** | Voces Kokoro JA | Descarga única del modelo ONNX (~80 MB) en caché del cliente; requiere WebGPU/WASM. | ⭐️⭐️⭐️ **Excelente para Modo Offline PWA** |
| **ElevenLabs** | 🟢 **Cinematográfica** | 🔴 **Inviable como opción sin costo** (Solo 10,000 caracteres/mes gratis; se agota en 2 días de estudio) | Multilingual v2 / Flash | API Key con cuota severamente limitada. | 🔴 **Descartada por cuotas mínimas** |

---

##### B. Análisis Técnico Detallado de las Opciones Seleccionadas

###### 1. Microsoft Edge TTS (`msedge-tts`): La Solución Estrella $0
- **¿Cómo funciona?** Microsoft Edge incluye una funcionalidad de lectura en voz alta (*Read Aloud*) de primer nivel impulsada por los mismos modelos de red neuronal profunda de **Azure Speech Cognitive Services**.
- **Voces japonesas nativas:**
  - `ja-JP-NanamiNeural`: Considerada una de las voces de IA en japonés más naturales del mundo. Su prosodia respeta con extrema precisión el estándar de Tokio, la entonación de oraciones interrogativas (か), los silencios naturales y las pausas moraicas.
  - `ja-JP-KeitaNeural`: Voz masculina sobria, clara y con excelente articulación para explicaciones formales y diálogos cotidianos.
- **Ventaja de costo y escalabilidad:** No requiere registro de tarjeta de crédito ni facturación recurrente. Permite generar audio en streaming (formato MP3 de alta fidelidad, 48kHz / 24kHz) mediante una función serverless en Next.js.
- **Implementación técnica directa en Next.js (`app/api/tts/route.js`):**
  ```javascript
  // app/api/tts/route.js
  import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

  export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const voice = searchParams.get('voice') || 'ja-JP-NanamiNeural';

    if (!text || text.length > 500) {
      return new Response(JSON.stringify({ error: 'Texto inválido o demasiado largo' }), { status: 400 });
    }

    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const readable = tts.toStream(text);

      return new Response(readable, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable', // Caché de 1 año en Vercel CDN y cliente
        },
      });
    } catch (err) {
      console.error('Edge TTS Error:', err);
      return new Response(JSON.stringify({ error: 'Error al sintetizar voz' }), { status: 500 });
    }
  }
  ```

###### 2. Google Cloud Text-to-Speech (Neural2): Respaldo Oficial Gratuito
- **Cuota gratuita mensual:** Google Cloud otorga **1 millón de caracteres gratuitos todos los meses** de voces **Neural2** (`ja-JP-Neural2-B`, `ja-JP-Neural2-C`) y WaveNet sin costo alguno.
- **Cálculo de consumo:** Una palabra japonesa promedio tiene 3-4 caracteres. Un millón de caracteres permite sintetizar entre **250,000 y 300,000 palabras o más de 20,000 oraciones de ejemplo al mes**. Dado que el vocabulario y las lecciones se cachean permanentemente tras la primera reproducción, el consumo real mensual de Nihongo Master apenas rozará el 5% de la cuota gratuita.
- **Ventaja:** SDK oficial de Node.js (`@google-cloud/text-to-speech`), integración mediante cuenta de servicio en Google Cloud Console.

###### 3. VOICEVOX: El Motor de la Comunidad Japonesa
- **Origen:** Creado por Hiroshiba Kazuyuki y la comunidad japonesa de desarrollo fonético de código abierto.
- **Por qué destaca:** Es el único motor entrenado con actores de voz nativos bajo una arquitectura de redes neuronales específicas para la fonética moraica del japonés. Pronuncia correctamente nombres propios, kanjis difíciles y modismos coloquiales.
- **Despliegue sin costo:**
  - Se puede desplegar una imagen Docker oficial de VOICEVOX Engine (`voicevox/voicevox_engine:cpu-ubuntu20.04-latest`) en una instancia gratuita de **Hugging Face Spaces** (Plan Free CPU de 2 vCPUs y 16GB RAM).
  - La instancia expone una API REST gratuita con los endpoints `/audio_query?text=...&speaker=1` y `/synthesis`, permitiendo que el servidor de Next.js actúe como proxy hacia esa instancia sin costo alguno.

###### 4. Kokoro-JS (TTS en el Navegador con WebGPU)
- Para usuarios en modo **PWA Offline** que no tienen conexión a Internet y viajan en metro o avión:
- Utiliza **ONNX Runtime Web** y modelos TTS ultracompactos (82M de parámetros) compilados para WebAssembly / WebGPU.
- Sintetiza audio neuronal localmente en el dispositivo del usuario sin emitir ninguna petición de red, garantizando privacidad total y costo $0 de infraestructura.

---

##### C. La Solución Definitiva: Pipeline de Audio Inteligente en 4 Niveles (Smart Audio Pipeline)

Para garantizar la máxima velocidad, fidelidad auditiva inmejorable y costo cero garantizado, la arquitectura de audio de Nihongo Master (`lib/audioManager.js`) se organizará en una estrategia de **cascada inteligente**:

```mermaid
flowchart TD
    Req["Petición de Audio (Palabra / Frase)"] --> L1{"¿Existe Clip MP3 Nativo en /public/audio/?"}
    
    L1 -- "SÍ (NHK / Irodori)" --> PlayL1["▶️ Reproducir Audio Nativo MP3 (0ms Latencia)"]
    L1 -- "NO" --> L2{"¿Existe en Supabase Storage / Vercel Edge Cache?"}
    
    PlayL2["▶️ Reproducir desde CDN Cache (Costo $0)"] <-- "SÍ" -- L2
    L2 -- "NO" --> L3{"¿Hay Conexión a Internet?"}
    
    L3 -- "SÍ" --> GenTTS["🎙️ Sintetizar vía Serverless /api/tts (Edge TTS / Azure F0)"]
    GenTTS --> SaveCache["💾 Guardar en Cache CDN / Supabase Storage"]
    SaveCache --> PlayTTS["▶️ Reproducir Voz Neuronal de Alta Fidelidad"]
    
    L3 -- "NO (Offline)" --> Fallback["🔉 Fallback Local: Web Speech API (Kyoko / Otoya)"]
    Fallback --> PlayLocal["▶️ Reproducir Voz Sintética Local"]
```

1. **Nivel 1 — Clips Nativos Humanos (0ms de latencia):**
   - Para las 48 lecciones de conversación de NHK World y los diálogos esenciales de Irodori A1, la app reproduce los archivos MP3 nativos descargados de sus repositorios educativos oficiales. Calidad de estudio 100% humana con cero costo de cómputo.
2. **Nivel 2 — Caché Estática en CDN y Supabase Storage ($0 costo de almacenamiento):**
   - Cuando una palabra de vocabulario, kanji o frase de una historia generada por IA se sintetiza por primera vez, el archivo MP3 se almacena en el bucket público gratuito de Supabase (`audio-cache`, plan free de hasta 1 GB / ~50,000 audios) o en el caché perimetral de Vercel con cabeceras `immutable`.
   - Todas las reproducciones subsiguientes de esa palabra por parte de cualquier usuario se sirven instantáneamente desde la red CDN sin consumir procesamiento ni APIs.
3. **Nivel 3 — Síntesis Neuronal Serverless con Edge TTS / Azure F0 ($0 costo de inferencia):**
   - Cuando se solicita una palabra o frase nueva no cacheada, la API interna `/api/tts` sintetiza el audio con la voz `ja-JP-NanamiNeural` a 24kHz mono MP3. La entonación de Tokio es perfecta, cálida e indistinguible de un locutor nativo.
4. **Nivel 4 — Fallback Offline PWA (Web Speech API):**
   - Si el alumno está desconectado en un vuelo o sin cobertura móvil, el reproductor conmuta de forma transparente al motor nativo del dispositivo (`window.speechSynthesis`) para que el estudio de tarjetas nunca se interrumpa.

##### D. Estado de Implementación Técnica de Audio (Completado en Producción)
1. **Endpoint Serverless Neuronal (`app/api/tts/route.js`):**
   - Implementado con `msedge-tts` usando la voz de referencia `ja-JP-NanamiNeural` (femenina de Tokio) y `ja-JP-KeitaNeural` (masculina).
   - Generación de streaming MP3 a 24kHz / 48kbps mono con control de velocidad (`rate`), sanitización de etiquetas `<rt>` y encabezados de caché inmutables (`Cache-Control: public, max-age=31536000, immutable`).
   - Caché en memoria LRU (`memoryCache`) en el servidor para entrega instantánea (0 ms) de vocabulario frecuente.
2. **Conexión de Audios MP3 Nativos de NHK World:**
   - Mapeo completo de las 48 lecciones en `data/nhk_lessons.json` y `data/nhk_lessons.js` con sus URLs oficiales de streaming con CORS abierto (`audio_url: https://www3.nhk.or.jp/nhkworld/lesson/spanish/learn/mp3/...`).
   - Soporte para archivos locales en `public/audio/nhk/lesson_XX.mp3` y script de descarga masiva automatizada `scripts/download_all_nhk_audio.js`.
3. **Gestor de Audio en Cascada (`lib/audioManager.js`):**
   - Soporte integrado de audio nativo MP3 mediante `HTMLAudioElement`, reproducción neuronal vía `/api/tts` y fallback suave a `window.speechSynthesis`.
   - Modos de avance automático en listas de reproducción (`autoAdvance`), control de volumen, velocidad variable (0.75x a 1.25x) y gestión de estados reactivos.
4. **Interfaz de Usuario Enriquecida:**
   - En `components/ConversationTab.jsx`: Botón destacado «Radio NHK Oficial (MP3 Humano)» para escuchar la transmisión completa de radio y botón «Diálogo Línea a Línea» para reproducción secuencial con voz neuronal.
   - En `components/AudioPlayerBar.jsx`: Indicador visual en tiempo real de la fuente activa (*MP3 Humano Nativo* vs *TTS Neuronal*) y selector rápido de voz (*Nanami ♀* / *Keita ♂*).

##### E. Protocolo Obligatorio para la Integración de Nuevos Libros y Temarios
**Regla de Producto y Desarrollo:** Cada vez que se incorpore un nuevo temario, libro de texto o curso a la plataforma (ej. *Irodori*, *Genki*, *Minna no Nihongo*, *Tobira*, *Marugoto*, etc.), **es un requisito obligatorio e ineludible ejecutar los siguientes 4 pasos**:
1. **Auditoría y Búsqueda de Audios Oficiales:**
   - Comprobar exhaustivamente si el curso cuenta con pistas de audio MP3 oficiales proporcionadas por las instituciones editoras (ej. Japan Foundation para Irodori/Marugoto, The Japan Times para Genki, 3A Corporation para Minna no Nihongo).
2. **Ingesta y Mapeo en el Modelo de Datos:**
   - Si los audios están disponibles con CORS en CDNs institucionales, mapear sus URLs en el campo `audio_url`.
   - Descargar los clips correspondientes a la estructura de la aplicación (`public/audio/{nombre_curso}/...`) y registrar la ruta local en `audio_local`.
   - Si no se cuenta con MP3 humano nativo, el sistema debe registrar las cadenas fonéticas limpias en hiragana/kanji para su síntesis automática mediante `/api/tts`.
3. **Integración con `audioManager` en la UI:**
   - Conectar los componentes de lectura, tarjetas o diálogos para invocar `audioManager.playAudioUrl(...)` o `audioManager.speak(texto, { audioUrl })`.
4. **Validación Auditiva y de Compilación:**
   - Verificar que al pulsar los botones de audio se escuche el clip nativo o la voz neuronal de Tokio sin retrasos perceptibles y ejecutar `npm run build` sin errores.

---

#### 3. Digitalización Interactiva del Curso Irodori A1 (18 Lecciones / 79 Can-dos) — [✅ Implementado]
- **Qué es:** Llevar a la práctica interactiva las 515 páginas del PDF `irodori elementary.pdf`.
- **Implementación Realizada:**
  - Integrado de forma canónica dentro de `/curriculum` en los **19 Módulos Consolidados**.
  - Cada lección incluye:
    1. *Objetivo Can-do*: Meta comunicativa clara en español (ej. "Pedir comida en un restaurante de comida rápida").
    2. *Diálogo situacional con audio*: Voces auténticas de situaciones cotidianas de la Fundación Japón.
    3. *Kanjis de la lección*: 24 kanjis clave de Irodori vinculados a `kanji.json`.
    4. *Consejos de vida en Japón*: Cápsulas culturales sobre trámites, conveniencias y etiqueta social.
    5. *Autoevaluación Can-do*: Checklist interactivo con checkboxes persistentes en `completedCanDos` (+10 XP por logro) y barra de progreso dinámica por módulo y en la vista general.

---

### 4.2. Fase 2: Inmersión y Herramientas de Minería de Contenido (Mediano Plazo)

#### 4. "Lector Libre de Textos" (Universal Japanese Reader)
- **Qué es:** Una pantalla interactiva donde el estudiante puede pegar cualquier texto en japonés (una noticia de NHK News Web Easy, un hilo de redes sociales, una letra de canción o un fragmento literario).
- **Funcionalidades:**
  - El motor `Intl.Segmenter` tokeniza todo el texto al instante.
  - Se genera furigana dinámico para todos los kanjis y se muestran los badges de *Pitch Accent* al posar el cursor o pulsar sobre la palabra.
  - Al hacer clic en cualquier palabra: modal flotante con lectura, desglose de kanjis, audio neuronal con botón de escucha inmediata y botón **«+ Guardar a mi Vocabulario»**.
  - Botón para que la IA genere una explicación gramatical del párrafo seleccionado.

#### 5. Importador de Videos y Subtítulos Locales (.srt / .vtt)
- **Qué es:** Permitir que los usuarios que estudian viendo anime, películas o dramas japoneses en su ordenador carguen el archivo de subtítulos `.srt` o `.vtt` en la plataforma, convirtiendo cualquier contenido multimedia en un entorno de aprendizaje interactivo idéntico al de YouTube.

#### 6. Notificaciones Push para Revisiones Pendientes de FSRS
- **Qué es:** Implementar el API de Web Push Notifications en la PWA.
- **Impacto:** Enviar 1 recordatorio amable al día cuando el algoritmo FSRS determine que el usuario tiene más de 10 tarjetas en estado de olvido inminente: *"Tienes 12 palabras listas para repasar hoy en Nihongo Master. ¡Mantén tu racha de 7 días! 🔥"*.

---

### 4.3. Fase 3: Inteligencia Artificial Adaptativa y Mnemotécnicas (Largo Plazo)

#### 7. Tutor Conversacional por Voz para Juegos de Rol (Roleplay Agent)
- **Qué es:** Módulo interactivo con Web Audio API y Groq/OpenAI donde el alumno practica diálogos orales con retroalimentación inmediata.
- **Escenarios de práctica:**
  1. *El Konbini*: El dependiente pregunta si quieres calentar el bento o si tienes tarjeta de puntos.
  2. *Buscando piso*: El casero explica las condiciones y tú preguntas sobre electrodomésticos.
  3. *En la estación*: Preguntar qué tren va hacia Shinjuku y comprar el billete.
- **Evaluación:** El agente no solo responde en japonés natural con voz de Edge TTS, sino que entrega una tarjeta con:
  - Nivel de cortesía adecuado (¿usaste *Desu/Masu* o caíste en lenguaje informal?).
  - Corrección de partículas y sugerencias de cómo un nativo expresaría la misma idea.

#### 8. Mnemotécnicas Visuales y Descomposición Radical de Kanjis
- **Qué es:** Enriquecer las fichas de kanji actuales con el árbol genealógico del ideograma:
  - Radical principal y su significado original.
  - Componente semántico (aporta el significado) y componente fonético (aporta la lectura Onyomi).
  - Ilustración mnemotécnica o historia nemotécnica en español para facilitar la retención.

---

## 5. Inventario de Información, Documentación y Material Adicional Requerido

Para ejecutar la hoja de ruta sin vacíos pedagógicos ni problemas de derechos de autor, se deben incorporar y gestionar los siguientes paquetes de recursos y documentación:

### 5.1. Recursos Lingüísticos de Datos Abiertos (Open Data)

1. **Base de Datos de Pitch Accent (Kanjium / ACCENT-DICT / Wadoku):**
   - Diccionario abierto en JSON/TSV con el número de mora de caída tonal y estructura para más de 45,000 vocablos japoneses.
   - *Utilidad:* Permite alimentar el componente de Pitch Accent visual en tarjetas, lecturas y subtítulos.
2. **Diccionario JMdict en Español (EDICT / Hispanic JMdict):**
   - Base de datos léxica mantenida por el Electronic Dictionary Research and Development Group (EDRDG).
   - *Utilidad:* Permite pasar de los 190 términos locales a más de 30,000 entradas japonesas con equivalencia directa en español verificada.
3. **Kanjidic2 & KanjiVG:**
   - Kanjidic2 contiene las especificaciones oficiales de los 2,136 kanjis Jōyō (lecturas, significados, grado escolar, frecuencia).
   - KanjiVG proporciona las coordenadas vectoriales SVG de cada trazo de kanji con el orden canónico (*stroke order*).

### 5.2. Materiales Educativos de Dominio Público o Licencias Educativas

1. **Audios Oficiales de NHK World "Hablemos en Japonés":**
   - Licencia educativa gratuita para fines de estudio. Paquete de los 48 audios originales en formato MP3 para enriquecer `/nhk`.
2. **Materiales Didácticos de Japan Foundation (Irodori):**
   - Licencia Creative Commons (CC BY-NC-ND 4.0). Audios nativos de las 18 lecciones de A1, hojas de trabajo de kanji y fichas de consejos interculturales.
3. **Modelos de Síntesis de Voz Open Source (Edge TTS / VOICEVOX):**
   - Voces libres `ja-JP-NanamiNeural` y `ja-JP-KeitaNeural` vía Edge TTS WebSocket.
   - Contenedor Docker de VOICEVOX Engine para Hugging Face Spaces.

### 5.3. Documentación Técnica del Proyecto Requerida

1. **Especificación del Sistema de Audio y Pitch Accent (`docs/AUDIO_AND_PITCH_ACCENT.md`):**
   - Arquitectura del proxy de streaming `/api/tts`, manejo de caché en Vercel/Supabase y tipología del esquema `pitch_accents.json`.
2. **Guía de Arquitectura de Datos (`docs/DATA_MODELS.md`):**
   - Especificación formal de los esquemas JSON de `vocabulary.json`, `kanji.json`, `particles.json`, `nhk_lessons.json` y `stories.json`.
   - Reglas de validación relacional (kanji, hiragana, katakana y sincronización bidireccional del array `words` de cada kanji).
3. **Manual de Infraestructura y Despliegue (`docs/DEPLOYMENT_GUIDE.md`):**
   - Configuración de variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`).
   - Políticas de seguridad Row Level Security (RLS) en Supabase para proteger los datos de usuario.
4. **Catálogo de Componentes de Interfaz (`docs/DESIGN_SYSTEM.md`):**
   - Reglas de accesibilidad y contraste para caracteres kanji, renderizado de furigana con etiquetas `<ruby>` y `<rt>`, y microcurvas SVG de *Pitch Accent*.

---

## 6. Conclusión y Posicionamiento Estratégico

Nihongo Master cuenta con la base técnica más sólida y moderna del panorama hispanohablante: **Next.js 16 con Turbopack, motor FSRS v5, trazador de kanjis con HanziWriter, inmersión en YouTube con tokenización léxica y generación de historias con IA**.

Con la incorporación de los dos pilares evaluados en este informe:
1. **La Notación Visual de Pitch Accent:** Supera la mayor carencia de las apps tradicionales (Duolingo, LingoDeer, WaniKani), dotando al estudiante de conciencia fonológica rigurosa desde la primera lección para distinguir homófonos y hablar con entonación natural de Tokio.
2. **El Pipeline de Audio Neuronal Sin Costo ($0):** Al combinar clips nativos MP3 para las conversaciones, Microsoft Edge TTS (`ja-JP-NanamiNeural`) para el vocabulario dinámico e historias, y caché persistente en CDN/Supabase Storage, la plataforma alcanza calidad de audio humana profesional sin incurrir en costos operativos recurrentes de APIs de voz de pago.

Con estas ventajas competitivas unificadas en español nativo, Nihongo Master se posiciona a la vanguardia del aprendizaje de idiomas asiáticos en el mundo hispanohablante.
