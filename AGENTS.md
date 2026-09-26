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
