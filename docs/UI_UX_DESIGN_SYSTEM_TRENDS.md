# Sistema de Diseño UI/UX: Tendencias, Estilo Japandi y Guía Global (2025/2026)
*Nihongo Master — Estándar Visual, Arquitectura de Información y Filosofía Estética*

---

## 1. Filosofía Central: "Ma" (間) y Minimalismo Japandi

La experiencia visual de **Nihongo Master** se rige por la unión entre el diseño funcional nórdico y la estética tradicional japonesa (*Japandi*):

1. **El Concepto de "Ma" (間 - Espacio Negativo Significativo)**:
   - El espacio vacío no es ausencia de contenido, sino un respiro intencional para la concentración mental.
   - Evitar saturar la pantalla con bloques masivos de texto, bordes pesados o exceso de botones en el primer plano visual.
   - Dejar respirar a los caracteres japoneses (`Kanji` y `Kana`), dándoles el protagonismo espacial que merecen.

2. **Estilo "Kawaii-Elegante" (Cute pero Maduro)**:
   - Inspirado en el diseño contemporáneo japonés (marcas como Muji, Studio Ghibli, Sanrio moderno y mascotas de prefecturas japonesas).
   - Figuras redondeadas, expresiones amigables y empáticas, proporciones suaves y acabados mate/arcilla (*clay*).
   - **No infantil**: No usamos colores chillones o caricaturas caóticas. La paleta es armoniosa, limpia y transmite serenidad y motivación al estudiante.

---

## 2. Paleta de Color Armónica e Identidad

La paleta se inspira en los pigmentos naturales tradicionales de Japón (*Dentou-iro*):

| Rol | Nombre Tradicional | Código HEX | Uso en la Aplicación |
| :--- | :--- | :--- | :--- |
| **Índigo Primario** | *Aizome* (藍染) | `#4338ca` / `#6366f1` | Botones de acción principal, acentos clave, navegación activa. |
| **Bermellón Zen** | *Shu-iro* (朱色) | `#e11d48` / `#f43f5e` | Torii, Daruma, sellos *Hanko*, alertas de práctica y rachas. |
| **Matcha Suave** | *Macha-iro* (抹茶色) | `#059669` / `#10b981` | Progreso completado, respuestas correctas, estado de sincronización. |
| **Bambú / Ámbar** | *Kohaku-iro* (琥珀色) | `#d97706` / `#f59e0b` | Nivel actual, insignias JLPT, consejos y notas gramaticales. |
| **Papel Washi (Luz)** | *Torinoko-iro* (鳥の子色)| `#f8fafc` / `#ffffff` | Fondo principal claro, tarjetas elevadas, lienzos de estudio. |
| **Tinta Sumi (Oscuro)**| *Sumi-iro* (墨色) | `#090d16` / `#111827` | Fondo en Modo Oscuro Zen, contraste de alta legibilidad. |
| **Pétalo Sakura** | *Sakura-iro* (桜色) | `#fce7f3` / `#f472b6` | Partículas de celebración, insignias de acierto y detalles tiernos. |

---

## 3. Tipografía y Jerarquía

1. **Español / Lengua de Interfaz**: `Inter`, `-apple-system`, `sans-serif`.
   - Pesos: `400` (texto regular), `500` (subtítulos), `600` (botones y etiquetas), `700` (títulos y métricas).
2. **Japonés (Caracteres y Furigana)**: `Noto Sans JP`, `Hiragino Sans`, `sans-serif`.
   - Caracteres Kanji renderizados con suficiente escala (`min-font-size: 1.15rem`) para apreciar trazos con claridad.
   - Furigana (`<ruby>` / `<rt>`) legible y proporcionado, sin colisionar con líneas adyacentes.

---

## 4. Arquitectura Bento Grid (Modularidad y Orden)

Todas las pantallas principales (Home, Dashboard, Currículum, Vocabulario) deben estructurarse bajo el concepto de **Bento Grid**:
- **Tarjetas Modulares**: Módulos con `border-radius: 20px`, bordes sutiles de `1px solid var(--border)` y micro-sombras difusas (`--shadow-sm` a `--shadow-md`).
- **Jerarquía Visual Clara**: Un bloque héroe principal (ej. mascota 3D o progreso activo), acompañado de bloques medianos (terminología o accesos) y widgets complementarios (racha, estadísticas).
- **Consistencia en Espaciado**: Márgenes estándar de `16px` en móvil y `24px` a `32px` en escritorio.

---

## 5. Revelación Progresiva (Progressive Disclosure)

Para mantener la aplicación limpia y libre de sobrecarga cognitiva:
1. **Nivel 1 (Superficie)**: Vista previa atractiva, título conciso, insignia de nivel JLPT oficial (N5 a N1) y botón o tarjeta táctil.
2. **Nivel 2 (Interacción bajo demanda)**: Al tocar la tarjeta, se despliega un panel lateral o modal interactivo con la terminología completa, patrones gramaticales, ejemplos en audio y ejercicios.
3. **Cero Muros de Texto Planos**: Todo contenido extenso debe estructurarse con pestañas, listas interactivas o tarjetas desplegables.

---

## 6. Modelos 3D y 2D Kawaii-Elegantes

1. **Tecnología**: Three.js procedural nativo montado en lienzo `<canvas>`.
2. **Estilo de Renderizado**:
   - Materiales mate/arcilla (`MeshLambertMaterial` o `MeshStandardMaterial` con `roughness: 0.7` a `0.9`).
   - Iluminación suave de tres puntos: luz ambiente difusa, luz direccional cenital suave y luz de relleno cálida.
   - Sin brillos plásticos reflectantes ni texturas pesadas.
3. **Física e Interactividad**:
   - Inercia elástica al mover el cursor o deslizar el dedo.
   - Reacciones visuales inmediatas: guiño, saludo, salto suave (*bounce*) y lluvia de partículas de cerezo (*sakura petals*) ante logros.
4. **Optimización Extrema**:
   - Cero archivos `.gltf` de 30MB. Modelos generados por código mediante primitivas matemáticas puras.
   - Cero fugas de memoria: cancelación estricta de `requestAnimationFrame` y llamada a `.dispose()` al desmontar componentes.

---

## 7. Gamificación Táctil y Micro-interacciones

1. **Juegos Rápidos (Micro-learning)**:
   - Sesiones cortas de 1 a 3 minutos para afianzar conocimientos (Memory Flash, Desafío de Partículas).
   - Puntuación instantánea vinculada a la experiencia acumulada del usuario (`appState.xp`).
2. **Retroalimentación Sonora y Háptica**:
   - Integración nativa con `audioManager` y TTS neuronal para pronunciación perfecta en japonés.
   - Efectos sonoros amables y discretos, con opción de silenciar en cualquier momento.

---

## 8. Dashboard de Estudio Unificado

Toda vista de métricas o resumen de estudio (sea en el Home o en `/progress`) debe compartir:
- **Resumen en 3 Métricas Clave**: Racha actual de días (🔥), Puntos de Experiencia (✨), y Nivel actual (🌸).
- **Desglose por Habilidades JLPT**: Kanjis dominados, Vocabulario activo, y Partículas aprendidas sobre el total oficial.
- **Acceso Directo**: Botón directo para reanudar el estudio exactamente en el módulo o lección pendiente.

---

*Este estándar es de aplicación obligatoria para todas las nuevas características y rediseños en Nihongo Master.*
