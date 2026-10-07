# 日本語マスター (Nihongo Master) · Plataforma de Japonés General

Plataforma interactiva, moderna y completa para aprender y dominar el idioma japonés a tu propio ritmo. Desarrollada con **Next.js**, React y Web Speech API, integrando todo el material de apoyo organizado, historias con furigana, ejercicios interactivos con teclado IME, partículas, kanji y reproductor de audio avanzado con pausa, salto y reproducción por selección.

---

## 🚀 Cómo Iniciar la Aplicación Next.js

1. **Instalar dependencias** (si no lo has hecho ya):
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en tu navegador**:
   👉 **[http://localhost:3000](http://localhost:3000)**

Para compilar para producción:
```bash
npm run build
npm start
```

---

## 📁 Estructura del Proyecto y Organización de Archivos

El proyecto sigue una arquitectura modular y limpia organizada por dominios y responsabilidades:

```
nihongo-master/
├── app/                  # Next.js App Router (páginas / rutas y endpoints API)
├── components/           # Componentes UI organizados por categoría
│   ├── tabs/             # Vistas principales de navegación (Curriculum, Kanji, Vocab, etc.)
│   ├── modals/           # Modales emergentes y diálogos interactivos
│   ├── layout/           # Estructura shell (AppShell, Header, NavigationTabs, Loader)
│   ├── features/         # Módulos de estudio (Pitch Accent, FSRS, caligrafía, audio)
│   └── index.js          # Barrel export centralizado de componentes
├── database/             # Esquemas SQL maestros y scripts DDL para Supabase
├── data/                 # Bases de datos normalizadas consumidas por la app
│   └── raw/              # Archivos fuente y volcados originales sin procesar
├── docs/                 # Documentación técnica, análisis de mercado y temarios
├── lib/                  # Estado global (AppContext), clientes y utilidades
├── public/               # Activos estáticos, audios MP3 y materiales de estudio
├── scripts/              # Suite de pruebas automáticas y scripts de automatización
└── material_de_estudio/  # Acceso directo al repositorio de libros y PDFs
```

Todos los materiales de apoyo originales están organizados en `material_de_estudio/`:

- `material_de_estudio/vocabulario/`: Flashcards y listas de vocabulario N5/N4.
- `material_de_estudio/gramatica_y_particulas/`: Checklists de partículas y notas gramaticales.
- `material_de_estudio/kanji/`: Libros de ideogramas, fichas de trazos e imprimibles.
- `material_de_estudio/historias_y_lecturas/`: Historias bilingües.
- `material_de_estudio/cursos/`: Libros de cursos oficiales (Irodori, NHK).

> 💡 **Nota**: La carpeta `public/material_de_estudio` está enlazada directamente con `material_de_estudio/`, permitiendo que el visor de PDFs de la aplicación acceda a cualquier archivo de forma instantánea sin duplicar almacenamiento.

---

## 🎧 Reproductor de Audio Avanzado

La aplicación incluye una barra flotante de reproducción en la parte inferior con control total de pronunciación nativa japonesa:
- **Pausa y Reanudar**: Pausa la lectura en cualquier momento y continúa desde el mismo punto.
- **Avanzar y Retroceder**: Salta a la oración o frase siguiente/anterior de cualquier lista o historia.
- **Click-to-Speak**: Haz clic en cualquier palabra, oración, línea de diálogo o tarjeta para escucharla inmediatamente.
- **Reproducir Texto Seleccionado**: Selecciona cualquier fragmento de texto japonés en la pantalla con el cursor y la barra activará automáticamente el botón **«Reproducir Selección»**.
- **Control de Velocidad**: Alterna entre `0.75x`, `0.9x`, `1.0x` y `1.25x` para ajustar el ritmo a tu nivel de comprensión auditiva.

---

## 🌟 Módulos de la Plataforma (Japonés General)

La aplicación está concebida para el **aprendizaje general del japonés**, utilizando actualmente las categorías N5 y N4 como filtros internos, preparada para incorporar niveles superiores (N3, N2, N1):

### 1. 🗺️ Ruta de Aprendizaje Incremental
- 9 niveles progresivos organizados pedagógicamente:
  1. *Saludos y Primer Contacto*
  2. *Presentación y Partículas Base* (は, も, の)
  3. *Acciones Diarias y Objetos* (を, で, に)
  4. *Espacio, Tiempo y Desplazamiento* (へ, から, まで)
  5. *Descripciones y Adjetivos*
  6. *Kanjis Fundamentales y Lecturas*
  7. *Formas Verbales Avanzadas* (〜て, 〜ます)
  8. *Transición a N4: Expresiones y Gramática*
  9. *Comprensión de Historias Completas*

### 2. 📖 Historia Interactiva («私の日本での生活»)
- 4 capítulos completos con 58 oraciones desglosadas.
- **3 Modos de Visualización**: Kanji + Furigana (`<ruby>`), Solo Hiragana y Solo Kanji.
- Traducción paralela al español e inglés y notas gramaticales profundas.
- Práctica interactiva de digitación con teclado japonés IME.

### 3. 📚 Entrenador de Vocabulario
- Más de 160 términos clasificados por categorías temáticas (personas, familia, comida, verbos, etc.).
- **Filtros de Nivel**: `Todos`, `N5`, `N4`.
- **Modos**:
  - *Tarjetas*: Visualización con audio y seguimiento de palabras dominadas.
  - *Práctica con Teclado IME*: Escribe la palabra en japonés a partir del significado en español.
  - *Ejercicios de Contexto*: Preguntas de rellenar espacios extraídas de los materiales de N4 con retroalimentación inmediata.

### 4. 🎯 Partículas & Gramática
- 25 funciones esenciales de partículas japonesas (は, が, を, に, で, と, も, から, まで, より, など, だけ, ね, よ).
- Checklist interactivo de progreso y modo Quiz con opciones y entrada de teclado.

### 5. 漢 Biblioteca de Kanji
- 101 kanjis con número de trazos, lecturas On/Kun, mnemotecnias mnemónicas y palabras compuestas con audio.
- Práctica de escritura de lecturas en Hiragana.

### 6. 📻 Conversación NHK (Hablemos en Japonés)
- Lecciones de diálogo cotidiano con transcripción japonesa, traducción en español, audio línea por línea o diálogo completo y notas gramaticales en español.

### 7. 📑 Biblioteca y Visor de PDFs
- Catálogo interactivo de los 15 materiales de apoyo.
- Visor modal integrado para leer PDFs sin salir de la plataforma o abrir en pestaña externa.

### 8. 📊 Mi Progreso y Respaldo
- Registro de racha de estudio diaria, puntos de experiencia (XP) y checklist.
- Herramienta para exportar e importar copias de seguridad en formato JSON.
- Guía rápida de configuración del teclado japonés IME para macOS.

---

## ⌨️ Guía para Escribir con Teclado Japonés en macOS

1. **Activar**: *Ajustes del Sistema → Teclado → Fuentes de entrada → Añadir Japonés (Romaji)*.
2. **Alternar**: Presiona `Control + Espacio` o `Bloq Mayús`.
3. **Hiragana**: Escribe fonéticamente (ej. `arigatou` → `ありがとう`).
4. **Kanji**: Presiona la `Barra Espaciadora` sobre la palabra en Hiragana para seleccionar el kanji deseado y pulsa `Enter`.
5. **Katakana**: Escribe la palabra y pulsa `F7` o la barra espaciadora.

---

## ☁️ Despliegue en Vercel y Git

El repositorio Git ya ha sido inicializado con soporte para **Git LFS** (para gestionar libros grandes sin límites de GitHub) y cuenta con `vercel.json` y `next.config.mjs` optimizados.

### Opción A: Despliegue mediante GitHub (Recomendado)

1. **Crear un repositorio vacío en GitHub** (ej. `nihongo-master`).
2. **Vincular y subir tu código**:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/nihongo-master.git
   git branch -M main
   git push -u origin main
   ```
3. **Conectar a Vercel**:
   - Entra en [vercel.com](https://vercel.com) e inicia sesión.
   - Haz clic en **«Add New...» → «Project»**.
   - Selecciona el repositorio `nihongo-master` e impórtalo.
   - En **Settings → Git**, asegúrate de que **Git Large File Storage (LFS)** esté activado (*Enabled*).
   - Haz clic en **«Deploy»**.

### Opción B: Despliegue directo mediante Vercel CLI

Si tienes cuenta de Vercel y prefieres desplegar desde la terminal:
```bash
npx vercel
```
Sigue las instrucciones en pantalla para iniciar sesión y vincular el proyecto. Para el despliegue final en producción ejecuta:
```bash
npx vercel --prod
```

