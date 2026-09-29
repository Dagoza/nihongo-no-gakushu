<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas del Proyecto Nihongo Master

Consulta detallada en [INSTRUCCIONES.md](file:///Users/danielgomez/Documents/Nihongo/INSTRUCCIONES.md).

1. **Vocabulario completo**: Cada nueva palabra debe registrarse en **Kanji**, **Hiragana** y **Katakana**, junto con su traducción en español y nivel.
2. **Sincronización con Kanjis**: Siempre que se agregue una palabra con kanjis, debe añadirse al listado `words` de CADA kanji que la contiene en `data/kanji.json`.
3. **Flujo de Despliegue en Vercel**: Cada vez que se realicen cambios o adiciones, se debe compilar (`npm run build`), hacer commit, push a `main` y verificar el deploy en Vercel.
4. **No Duplicidad y Enlace de Temas en Currículum**: Antes de agregar un nuevo módulo, verificar minuciosamente que el tema central no esté ya repetido. Si ya existe, complementarlo si aporta información o ejemplos útiles, o descartar si ya se encuentra cubierto. Todo módulo debe incorporar obligatoriamente enlaces a sus 'Temas Relacionados'.
5. **Audios MP3 en Nuevos Temarios y Libros**: Cada vez que se integren nuevos temarios de libros o cursos (ej. Irodori, Genki, Minna no Nihongo, NHK, etc.), es estrictamente obligatorio revisar si el material cuenta con audios MP3 oficiales o abiertos, traerlos/mapearlos al sistema (`public/audio/...` o URLs directas con CORS), conectarlos al pipeline de audio (`audioManager`) y registrar sus campos `audio_url`/`audio_local` en los JSONs. Para frases o palabras dinámicas sin MP3 nativo, asegurar su soporte mediante el TTS neuronal `/api/tts`.

