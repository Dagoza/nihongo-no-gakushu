<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas del Proyecto Nihongo Master

Consulta detallada en [INSTRUCCIONES.md](file:///Users/danielgomez/Documents/Nihongo/INSTRUCCIONES.md).

1. **Vocabulario completo**: Cada nueva palabra debe registrarse en **Kanji**, **Hiragana** y **Katakana**, junto con su traducción en español y nivel.
2. **Sincronización con Kanjis**: Siempre que se agregue una palabra con kanjis, debe añadirse al listado `words` de CADA kanji que la contiene en `data/kanji.json`.
3. **Flujo de Calidad y Despliegues Controlados**: Cada vez que se realicen cambios o adiciones, se debe compilar y probar localmente (`npm run build`), hacer commit y push a `main`. Los despliegues automáticos por commit individual están desactivados (`git.deploymentEnabled: false` en `vercel.json`) para proteger la cuota del Free Plan. El despliegue a producción se realiza consolidado cada 6 horas vía GitHub Actions (solo si hay cambios) o bajo demanda ejecutando `npm run deploy:prod` / botón en GitHub Actions.
4. **No Duplicidad y Enlace de Temas en Currículum**: Antes de agregar un nuevo módulo, verificar minuciosamente que el tema central no esté ya repetido. Si ya existe, complementarlo si aporta información o ejemplos útiles, o descartar si ya se encuentra cubierto. Todo módulo debe incorporar obligatoriamente enlaces a sus 'Temas Relacionados'.
5. **Audios MP3 en Nuevos Temarios y Libros**: Cada vez que se integren nuevos temarios de libros o cursos (ej. Irodori, Genki, Minna no Nihongo, NHK, etc.), es estrictamente obligatorio revisar si el material cuenta con audios MP3 oficiales o abiertos, traerlos/mapearlos al sistema (`public/audio/...` o URLs directas con CORS), conectarlos al pipeline de audio (`audioManager`) y registrar sus campos `audio_url`/`audio_local` en los JSONs. Para frases o palabras dinámicas sin MP3 nativo, asegurar su soporte mediante el TTS neuronal `/api/tts`.
6. **Estándar Exclusivo de Niveles N5 a N1**: En toda la aplicación y bases de datos (currículum, vocabulario, kanjis, catálogo de materiales/PDFs, roleplays, tours), se utiliza única y exclusivamente el estándar oficial de niveles JLPT (N5 a N1). Queda terminantemente prohibido el uso de sistemas ajenos como el marco CEFR (A1, A2, B1, etc.) o etiquetas genéricas en campos o filtros de nivel. Contenidos tipo Irodori Starter (A1) encajan estrictamente como N5 (e Irodori Elementary como N4).
7. **Estándar de Diseño UI/UX Japandi 2026 y Revelación Progresiva**: En cualquier cambio o creación de componentes de interfaz, vistas de estudio o estilos CSS, es estrictamente obligatorio seguir las directrices consolidadas en `docs/UI_UX_DESIGN_SYSTEM_TRENDS.md` y el skill `.agents/skills/nihongo-ui-design-system/`: arquitectura Bento 2.0 (1–2 bloques focales dominantes), revelación progresiva en 3 capas (Capa 0 nuclear, Capa 1 acordeones `<details name="...">` exclusivos sin anidamiento, Capa 2 tooltips), salvaguarda de comparación simultánea lado a lado (*side-by-side*), calibración tipográfica CJK (`word-break: auto-phrase`, `ruby-merge: separate`, line-height 1.75 en cuerpo y 1.3 en encabezados con font-weight 500), adaptación cognitiva FSRS con `opacity: 0` (cero CLS) y contrato Zen sin sacudidas (*shake*) ni confeti en ejercicios cotidianos.

