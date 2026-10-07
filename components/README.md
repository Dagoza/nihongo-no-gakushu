# 🧩 Arquitectura de Componentes — Nihongo Master

La capa de componentes de Nihongo Master está estructurada en módulos según su responsabilidad funcional:

```
components/
├── tabs/       # Vistas principales de navegación y aprendizaje (Curriculum, Kanji, Vocab, etc.)
├── modals/     # Modales emergentes y cuadros de diálogo interactivos
├── layout/     # Estructura visual principal, cabecera, navegación y utilidades de carga
├── features/   # Módulos de estudio avanzados (Pitch Accent, FSRS, trazo kanji, quizzes)
└── index.js    # Barrel export centralizado de todos los componentes
```

## 📂 Organización por Categoría

### 1. `tabs/` (Vistas de Contenido)
- `ConversationTab.jsx`: Lecciones de diálogo situacional (NHK World, Irodori).
- `CurriculumTab.jsx`: Ruta de aprendizaje secuencial de 37 módulos Can-Do.
- `GrammarTab.jsx`: Lecciones y reglas gramaticales paso a paso.
- `JlptExamTab.jsx`: Simulador de exámenes oficiales JLPT (N5 a N1).
- `KanjiTab.jsx`: Fichas interactivas de kanjis con animaciones de trazos y palabras compuestas.
- `MaterialLibraryTab.jsx`: Visor interactivo y biblioteca de PDFs de estudio.
- `ProgressTab.jsx`: Métricas de dominio, rachas, XP y estadísticas del algoritmo FSRS.
- `SavedTab.jsx`: Cuaderno personal de palabras guardadas por el estudiante.
- `StoryTab.jsx`: Historias interactivas bilingües con furigana y audio.
- `VocabTab.jsx`: Diccionario y tarjetas de vocabulario con acento tonal.
- `YouTubeImmersionTab.jsx`: Inmersión audiovisual con subtítulos japoneses sincronizados.

### 2. `modals/` (Diálogos y Acciones)
- `AIGeneratorModal.jsx`: Generador asistido de contenidos y diálogos.
- `AuthModal.jsx`: Autenticación con Supabase Auth (Email / Contraseña y Google).
- `ConversationGeneratorModal.jsx`: Creación interactiva de conversaciones de práctica.
- `DailyGoalModal.jsx`: Configuración de metas diarias de estudio y recordatorios.
- `DictionaryModal.jsx`: Búsqueda instantánea de términos japoneses.
- `EditWordModal.jsx`: Edición y actualización de palabras personales.
- `NotificationSettingsModal.jsx`: Gestión de permisos de notificaciones push PWA.
- `PracticePadModal.jsx`: Pizarra de dibujo y caligrafía de ideogramas.
- `SaveVocabModal.jsx`: Diálogo para guardar términos con previsualización de pitch accent.
- `SettingsModal.jsx`: Ajustes de audio, velocidad TTS y preferencias de interfaz.
- `UIModal.jsx`: Envoltorio modal accesible y responsive genérico.

### 3. `layout/` (Estructura y Shell)
- `AppShell.jsx`: Contenedor principal de la aplicación que administra el contexto y la vista activa.
- `Header.jsx`: Barra superior con selector de nivel, racha y perfil de usuario.
- `NavigationTabs.jsx`: Barra de pestañas responsive para navegación entre módulos.
- `PageLoader.jsx`: Componente de carga para transiciones de página.
- `ProductTour.jsx`: Guía interactiva de bienvenida y tour de funcionalidades.
- `PWAInstaller.jsx`: Banner de instalación como Progressive Web App.

### 4. `features/` (Herramientas Interactivas de Estudio)
- `AudioPlayerBar.jsx`: Barra flotante de reproducción de audio con control de velocidad y voz neuronal.
- `ComprehensionQuiz.jsx`: Sistema de evaluación con preguntas de comprensión auditiva y lectura.
- `FsrsStatsModule.jsx`: Visualizador de curvas de olvido y estabilidad del algoritmo FSRS v5.
- `FuriganaText.jsx`: Renderizador de texto japonés con etiquetas `<ruby>` para furigana.
- `KanjiDraw.jsx`: Lienzo interactivo de caligrafía con HanziWriter.
- `PitchAccent.jsx`: Gráficos SVG interactivos para curvas de acento tonal japonés.
- `RoleplayChat.jsx`: Chat interactivo de práctica conversacional.
- `SpeechPractice.jsx`: Práctica de pronunciación y sombras fonéticas.
- `SrsReview.jsx`: Sistema de repetición espaciada para repasos diarios.
- `YouTubePlayer.jsx`: Reproductor embebido con controles de sincronización.

---
> 💡 **Compatibilidad**: Cada componente mantiene además un archivo proxy en la raíz de `components/` para garantizar retrocompatibilidad total con cualquier importación previa.
