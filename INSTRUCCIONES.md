# Guía de Contribución y Reglas de Desarrollo — Nihongo Master

Este documento establece las normas obligatorias para agregar nuevo vocabulario, mantener la sincronización con el catálogo de kanjis y gestionar el ciclo de despliegue en Vercel.

---

## 1. Reglas para Agregar Nuevas Palabras (Vocabulario)

Cada vez que se añada una palabra al sistema (en `data/vocabulary.json` o mediante cualquier interfaz de carga), **es obligatorio registrarla en sus tres formas fundamentales japonesas**:

1. **Kanji**: La representación ortográfica estándar con sus ideogramas (o en kana si la palabra usualmente no lleva kanji).
2. **Hiragana**: La lectura fonética nativa / furigana (en minúsculas japonesas).
3. **Katakana**: La transcripción en katakana (obligatoria para palabras de origen extranjero / *gairaigo*, préstamos y onomatopeyas, o como referencia fonética).
4. **Significado**: Traducción clara en español (`meaning_es`) y opcionalmente en inglés (`meaning_en`).
5. **Nivel**: Especificar el nivel JLPT correspondiente (`N5`, `N4`, `N3`, etc.).
6. **Categoría**: Categoría temática adecuada (e.g., `Saludos y Cortesía`, `Comida y Bebida`, `Vida Diaria`, etc.).

### Estructura en `data/vocabulary.json`:

```json
{
  "id": "v_105",
  "kanji": "先生",
  "hiragana": "せんせい",
  "katakana": "センセイ",
  "kana": "せんせい",
  "meaning_es": "Profesor / Maestro",
  "meaning_en": "Teacher / Master",
  "category": "Personas y Profesiones",
  "level": "N5"
}
```

> **Nota:** Mantener el campo `"kana"` sincronizado con la lectura principal (`hiragana`) para retrocompatibilidad con los componentes de audio y ejercicios de escritura existentes.

---

## 2. Sincronización Obligatoria con la Sección de Kanjis

**Regla de Oro:** Siempre que se agregue una nueva palabra que contenga uno o más kanjis, **dicha palabra DEBE agregarse al listado de palabras (`words`) de CADA UNO de los kanjis que la componen en `data/kanji.json`**.

El objetivo es que al consultar cualquier kanji en la aplicación, aparezcan **todas las palabras del sistema que utilicen ese kanji**.

### Paso a Paso para la Sincronización:

1. **Identificar los Kanjis de la palabra:**
   - Ejemplo: La palabra `自動車` (じどうしゃ - automóvil) contiene tres kanjis: `自`, `動`, `車`.
2. **Localizar o Crear cada Kanji en `data/kanji.json`:**
   - Para cada uno de los caracteres (`自`, `動`, `車`):
     - Si el kanji ya existe: añadir la palabra a su array `"words"`.
     - Si el kanji NO existe: crear la ficha del nuevo kanji con su información básica (nivel, trazos, lecturas On/Kun, significado) y agregar la palabra en `"words"`.
3. **Estructura del elemento dentro de `"words"` en `data/kanji.json`:**
   ```json
   {
     "word": "自動車",
     "reading": "じどうしゃ",
     "meaning": "automóvil"
   }
   ```
4. **Ejemplo Bidireccional:**
   - En la entrada del kanji `自`:
     ```json
     {
       "kanji": "自",
       "meaning_es": "uno mismo",
       "pronunciation": "じ, し",
       "words": [
         {
           "word": "自動車",
           "reading": "じどうしゃ",
           "meaning": "automóvil"
         }
       ]
     }
     ```
   - En la entrada del kanji `動`:
     ```json
     {
       "kanji": "動",
       "meaning_es": "mover",
       "pronunciation": "どう, うご",
       "words": [
         {
           "word": "自動車",
           "reading": "じどうしゃ",
           "meaning": "automóvil"
         }
       ]
     }
     ```
   - En la entrada del kanji `車`:
     ```json
     {
       "kanji": "車",
       "meaning_es": "coche / vehículo",
       "pronunciation": "しゃ, くるま",
       "words": [
         {
           "word": "自動車",
           "reading": "じどうしゃ",
           "meaning": "automóvil"
         }
       ]
     }
     ```

---

## 3. Flujo de Trabajo para Despliegues en Vercel (Commit, Push y Deploy)

La aplicación está diseñada para desplegarse de manera continua en **Vercel**. Cada vez que se realicen cambios en el código o se agregue nuevo contenido, debe ejecutarse el ciclo completo: **Prueba local -> Commit -> Push -> Deploy**.

### 3.1. Verificación previa al commit (Build Check)
Antes de confirmar los cambios, verifica que la aplicación compile correctamente y no contenga errores de sintaxis o empaquetado:

```bash
npm run build
```

Si la compilación es exitosa (`Compiled successfully`), procede con el flujo de Git.

### 3.2. Ciclo de Git (Commit y Push)

1. **Añadir los archivos modificados:**
   ```bash
   git add .
   ```

2. **Crear el commit con mensaje semántico y claro:**
   ```bash
   git commit -m "feat(vocab): agregar nuevas palabras y sincronizar kanjis correspondientes"
   ```

3. **Subir los cambios a la rama principal (main):**
   ```bash
   git push origin main
   ```

### 3.3. Despliegue en Vercel

* **Opción Automática (Recomendada):**  
  Si el repositorio de GitHub/GitLab está conectado al proyecto en el panel de Vercel, cada `git push origin main` dispara automáticamente un nuevo despliegue en producción.
* **Opción Manual mediante Vercel CLI:**  
  Si deseas forzar el despliegue desde la terminal:
  ```bash
  npx vercel --prod
  ```

### 3.4. Checklist Rápido de Verificación

- [ ] ¿La palabra tiene **Kanji**, **Hiragana** y **Katakana**?
- [ ] ¿Se añadieron las referencias de la palabra a **todos los kanjis que la componen** en `data/kanji.json`?
- [ ] ¿Se ejecutó `npm run build` sin errores?
- [ ] ¿Se realizó `git add`, `git commit` y `git push origin main`?
- [ ] ¿Se verificó en Vercel que el estado sea **Ready / Deployed**?

---

## 4. Reglas para la Incorporación y Mantenimiento de Módulos del Currículum

Para garantizar un itinerario pedagógico cohesivo, limpio y sin fragmentación entre cursos o libros, rige la **Regla de Oro de Consolidación, No Redundancia y Enlace Temático**:

### 4.1. Verificación Previa de No Duplicidad
Antes de agregar cualquier módulo o temática al currículum (`data/curriculum.json`), **se debe auditar minuciosamente que el tema central no exista ya en el catálogo**:
- **Si ya existe el tema**:
  - **Complementar:** Si la nueva fuente o lección aporta ejemplos reales, objetivos Can-Do, diálogos contextuales o vocabulario enriquecedor, **se integran directamente dentro del módulo existente**.
  - **Saltar / Omitir:** Si la información es redundante o repite explicaciones ya cubiertas, **se omite y nunca se crea un módulo paralelo**.
- **Si es un tema enteramente nuevo**:
  - Se da de alta asignando el número de módulo correspondiente, nivel oficial (A1/N5/N4), Can-Dos pedagógicos y fuentes bibliográficas.

### 4.2. Enlace Obligatorio con Temas Relacionados (`related_topics`)
Todo módulo en `data/curriculum.json` **debe incorporar obligatoriamente el array `"related_topics"`** con enlaces directos hacia módulos precedentes, consecutivos o complementarios:
- **Estructura requerida de cada tema relacionado:**
  ```json
  {
    "step": 2,
    "title": "Estrategias de Comunicación y Gestión de Idiomas",
    "icon": "💬",
    "relationship": "Consecutivo Natural",
    "reason": "Permite resolver dudas y pedir aclaraciones cuando no entiendes al interlocutor tras presentarte."
  }
  ```
- **Navegación interactiva:** La interfaz de usuario (`components/CurriculumTab.jsx`) debe presentar estos enlaces mediante tarjetas interactivas con botones de salto directo al módulo enlazado.

### 4.3. Checklist para Nuevos Módulos del Currículum
- [ ] ¿Se auditó que el tema no esté ya presente en los 19 módulos consolidados?
- [ ] Si ya existía, ¿se complementó el módulo existente en vez de duplicarlo?
- [ ] ¿Se definieron los objetivos Can-Do prácticos de comunicación?
- [ ] ¿Se añadieron ejemplos con transcripción completa (Kanji, Kana, Romaji, Español) y audio?
- [ ] ¿Se configuró el bloque `"related_topics"` con enlaces y justificaciones pedagógicas claras?

---

## 5. Reglas para la Integración de Libros, Temarios y Recursos de Audio MP3

Para garantizar que Nihongo Master ofrezca la máxima fidelidad sonora y que ningún material quede huérfano de audio, **es estrictamente obligatorio seguir este protocolo cada vez que se integren nuevos libros, cursos o temarios** (ej. *Irodori*, *Genki*, *Minna no Nihongo*, *Tobira*, *Marugoto*, *NHK World*, etc.):

### 5.1. Búsqueda y Verificación de Audios Oficiales
Antes de estructurar los datos del temario en JSON:
1. **Revisar fuentes oficiales:** Identificar si la editorial o institución ofrece descargas abiertas de audio MP3 (ej. *Japan Foundation* para Irodori/Marugoto, *The Japan Times* para Genki, *NHK World* para lecciones de radio).
2. **Determinar el método de acceso:**
   - **Streaming directo con CORS abierto:** Si el CDN oficial soporta CORS (`access-control-allow-origin: *`) como en NHK World, mapear directamente la URL en `audio_url`.
   - **Archivos locales descargados:** Si el material requiere descarga o empaquetado, alojar los archivos en `public/audio/{curso}/` y mapear la ruta relativa en `audio_local` (ej. `/audio/nhk/lesson_01.mp3`).
   - **Scripts de automatización:** Crear un script en `scripts/` (ej. `download_all_{curso}_audio.js`) para permitir la descarga masiva controlada.

### 5.2. Esquema de Datos Requerido en JSON
Todo diálogo, lección o frase de un curso estructurado debe contener los campos de audio:
```json
{
  "lesson": 1,
  "title_jp": "...",
  "audio_url": "https://url-remota-oficial.mp3",
  "audio_local": "/audio/curso/lesson_01.mp3",
  "dialogue": [
    {
      "speaker": "...",
      "jp": "...",
      "es": "...",
      "audio_url": "https://url-remota-clip.mp3"
    }
  ]
}
```

### 5.3. Cascada de Audio con AudioManager
1. **Prioridad 1 (Audio Humano Nativo):** Si `audio_local` o `audio_url` está presente, `audioManager.playAudioUrl(...)` reproduce la grabación nativa.
2. **Prioridad 2 (TTS Neuronal Serverless):** Para vocabulario individual, kanjis, desgloses o frases sin clip MP3 específico, `audioManager.speak(...)` invoca `/api/tts` (voces `ja-JP-NanamiNeural` y `ja-JP-KeitaNeural`) con entonación estándar de Tokio.
3. **Prioridad 3 (Fallback Offline):** Si el usuario pierde conexión, conmuta automáticamente a `window.speechSynthesis`.

### 5.4. Checklist para Nuevos Libros y Temarios con Audio
- [ ] ¿Se verificó si el curso cuenta con audios MP3 oficiales o de libre acceso?
- [ ] ¿Se mapearon los enlaces `audio_url` y/o se colocaron los archivos en `public/audio/...`?
- [ ] ¿Se registraron los campos de audio en los esquemas JSON (`nhk_lessons.json`, `curriculum.json`, etc.)?
- [ ] ¿Se conectaron los botones de la interfaz a `audioManager` para permitir la reproducción individual y del diálogo completo?
- [ ] ¿Se probó que las palabras y frases complementarias se sinteticen con la voz neuronal de `/api/tts`?

