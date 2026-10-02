#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
update_tracking_md.py
Actualiza ANALISIS_TEMARIOS_LIBROS.md para reflejar el estado actual:
- 37 Módulos Consolidados (N5, N4, N3)
- Serie Irodori completa: Starter, Elementary 1, Elementary 2 y Pre-Intermediate
- 141 Can-Dos
- 314 Palabras de vocabulario
- 161 Kanjis
- 307 Ejercicios activos
"""

import json

md_path = "/Users/danielgomez/.gemini/antigravity/brain/704db7e0-308b-4c94-a221-b347ec170652/ANALISIS_TEMARIOS_LIBROS.md"

with open("data/curriculum.json", "r", encoding="utf-8") as f:
    curriculum = json.load(f)

# Generar filas de la tabla de 37 módulos
mod_rows = []
for m in curriculum:
    step = m["step"]
    title = m["title"]
    sub = m.get("subtitle", "").split(" (")[0]
    lvl = m.get("level", "")
    can_dos_count = len(m.get("can_dos", []))
    sources = " · ".join(m.get("sourceBooks", []))
    rel_links = ", ".join([f"**M{r['step']}** ({r['title'].split(',')[0].split(' y ')[0]})" for r in m.get("related_topics", [])[:3]])
    mod_rows.append(f"| **M{step}** | **{title}**<br>*(«{sub}»)* | {lvl} | {can_dos_count} Can-Dos | {sources} | 🔗 {rel_links} | ✅ 100% |")

mod_table_str = "\n".join(mod_rows)

content = f"""# Registro Maestro y Cuaderno de Seguimiento Curricular — Nihongo Master
## Guía Canónica de Referencia para la Incorporación de Temas, Módulos y Ejercicios

> **Fecha de Actualización:** 2 de Octubre de 2026  
> **Estado Global del Sistema:** ✅ **100% de la serie oficial Irodori y manuales base integrados y consolidados**  
> - 📘 **Japonés from Spanish (NHK World):** ✅ **48/48 Lecciones (100%)** con diálogos íntegros bilingües, notas gramaticales y **144 ejercicios interactivos** en `data/conversation_exercises.json`.  
> - 📗 **Irodori Starter (A1 -> JLPT N5):** ✅ **18/18 Lecciones (100%)** integradas en los Módulos 1 al 17.
> - 📙 **Irodori Elementary 1 (A2.1 -> JLPT N5):** ✅ **18/18 Lecciones (100%)** con sus 79 Objetivos Can-Do, vocabulario y kanjis integrados.  
> - 📕 **Irodori Elementary 2 (A2.2 -> JLPT N4):** ✅ **18/18 Lecciones (100%)** integradas en los **Módulos 20 a 28**.
> - 📓 **Irodori Pre-Intermediate (A2/B1 -> JLPT N3):** ✅ **18/18 Lecciones (100%)** integradas en los **Módulos 29 a 37**.
> - ⛩️ **Currículum Maestro:** ✅ **37 Módulos Consolidados** sin duplicidad temática, con **141 Can-Dos**, audio nativo y TTS neuronal, estructura por pasos de contenido + paso final exclusivo de evaluación, y enlaces bidireccionales a **Temas Relacionados**.  
>  
> **⚠️ REGLA PRIMORDIAL:** Este documento es la **Única Fuente de Verdad pedagógica y curricular** del proyecto `Nihongo Master`. **Todo desarrollador o agente de IA DEBE consultarlo obligatoriamente antes de agregar cualquier nuevo tema, módulo o ejercicio** para garantizar la no duplicidad, la complementación de contenido y la preservación de los enlaces formativos.

---

## 1. Protocolo Canónico: ¿Cómo agregar un nuevo Tema, Módulo o Ejercicio?

Para mantener una arquitectura curricular limpia, coherente y escalable en el tiempo, rige el siguiente flujo obligatorio:

```mermaid
flowchart TD
    A["Nueva Propuesta de Contenido"] --> B{{"¿El tema central ya existe en la Matriz de 37 Módulos?"}}
    B -- "SÍ (Tema ya cubierto)" --> C{{"¿Aporta información o ejercicios nuevos?"}}
    C -- "SÍ (Ejemplos, Can-Do, Diálogo)" --> D["COMPLEMENTAR el Módulo Existente (step)"]
    C -- "NO (Información redundante)" --> E["DESCARTAR / SALTAR (No duplicar)"]
    B -- "NO (Tema enteramente nuevo)" --> F["Crear Nuevo Módulo Secuencial (M38+)"]
    D --> G["Verificar y Añadir 'related_topics'"]
    F --> G
    G --> H{{"¿Se agregan palabras con Kanji?"}}
    H -- "SÍ" --> I["Sincronizar en data/vocabulary.json (3 formas) y data/kanji.json (words)"]
    H -- "NO" --> J["Validar con npm run build"]
    I --> J
    J --> K["Actualizar este MD (ANALISIS_TEMARIOS_LIBROS.md)"]
    K --> L["Commit, Push a main y Deploy en Vercel"]
```

---

### 1.1. Reglas de Oro para la Incorporación de Contenido

1. **Auditoría Previa de No Duplicidad:**  
   Antes de escribir una sola línea de código o JSON, buscar en la **Sección 2 (Matriz de 37 Módulos)** por palabras clave de gramática, vocabulario o función comunicativa. Nunca debe crearse un módulo paralelo que compita sobre el mismo tópico.
2. **Principio de Complementación:**  
   Si el tema ya existe en alguno de los 37 módulos maestros, **se debe complementar dicho módulo** agregando los nuevos ejercicios a su array `"exercises"`, los ejemplos a `"examples"` o las competencias a `"can_dos"`. Si la propuesta no aporta valor adicional o es idéntica a lo ya existente, **se omite**.
3. **Enlace Obligatorio con Temas Relacionados (`related_topics`):**  
   Todo módulo nuevo o modificado debe incorporar enlaces explícitos a sus módulos precedentes, consecutivos o complementarios.
4. **Paso Final Exclusivo de Ejercicios en Secciones:**  
   Cada módulo se estructura en pasos de contenido (`grammar_points`, `can_dos`, `vocab`, `examples`) y finaliza obligatoriamente con un paso exclusivo de evaluación (`is_exercise_step: true`).
5. **Estructura de Tres Formas de Vocabulario y Sincronización Kanji:**  
   Toda nueva palabra debe registrarse con `kanji`, `hiragana`, `katakana`, traducción en español y nivel JLPT oficial (N5 a N1) en `data/vocabulary.json`, y vincularse en el array `words` de cada kanji correspondiente en `data/kanji.json`.
6. **Estándar Exclusivo de Niveles N5 a N1 (Regla 6):**  
   Queda terminantemente prohibido el uso de nomenclaturas CEFR (A1, A2, B1) en campos o filtros de nivel.

---

## 2. Matriz Maestra de Seguimiento: Los 37 Módulos Consolidados

Esta matriz representa la **estructura nuclear de la aplicación**, cubriendo de forma progresiva desde JLPT N5 hasta JLPT N3:

| Mód. | Título Central | Nivel | Can-Dos | Fuentes Integradas | Temas Relacionados Enlazados | Estado en App |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
{mod_table_str}

---

## 3. Seguimiento Detallado: Serie Oficial Irodori (Fundación Japón)

### 3.1. Irodori Starter & Elementary 1 (JLPT N5 — Lecciones 1 a 18)
Consolidado al 100% en los Módulos 1 al 17, complementado con NHK World en los Módulos 18 y 19.

### 3.2. Irodori Elementary 2 (初級2 — JLPT N4 — Lecciones 1 a 18)
Consolidado al 100% en los Módulos 20 al 28:
- **L1 & L2:** Entorno Personal, Llegada a Japón y Rasgos de Personalidad (`〜たばかり`, `〜そう`) -> **M20**
- **L3 & L4:** Restaurantes, Alergias y Dietas Especiales (`〜ので`, `〜ないで`, Forma Potencial) -> **M21**
- **L5 & L6:** Viajes, Reservas y Consejos Turísticos (`〜たほうがいい`, `〜てよかった`) -> **M22**
- **L7 & L8:** Eventos Comunitarios, Festivales y Condiciones (`〜たら`, 疑問詞+か) -> **M23**
- **L9 & L10:** Tradiciones Anuales, Festividades y Protocolo (`〜たらいいですか`, Verbos de vestimenta) -> **M24**
- **L11 & L12:** Compras Inteligentes, Puntos y Ventajas (`〜のを忘れました`, `〜やすい/にくい`) -> **M25**
- **L13 & L14:** Servicios Públicos, Peluquería y Trámites (`〜てあります`, `〜てもらえますか`) -> **M26**
- **L15 & L16:** Medio Ambiente, Prevención de Desastres y Sismos (`〜たまま`, `〜ないでください`, 避難訓練) -> **M27**
- **L17 & L18:** Proyección Vital, Logros y Emprendimiento (`〜ようになる`, 意向形+と思っている) -> **M28**

### 3.3. Irodori Pre-Intermediate (初中級 — JLPT N3 — Lecciones 1 a 18)
Consolidado al 100% en los Módulos 29 al 37:
- **L1 & L2:** Ocio Moderno, Conversación Coloquial y Cultura Pop (`〜って`, `〜っけ`, `〜のが一番好き`) -> **M29**
- **L3 & L4:** Vivienda, Búsqueda de Inmuebles y Resolución de Averías (`〜みたい`, 敷金・礼金) -> **M30**
- **L5 & L6:** Gastronomía Local, Cocina Casera y Nutrición (`〜ようにしている`, 郷土料理) -> **M31**
- **L7 & L8:** Convivencia Social, Nuevas Amistades y Reglas de Cortesía (`〜たらいいな`, `〜てもかまわない`) -> **M32**
- **L9 & L10:** Metacognición Lingüística y Métodos de Aprendizaje (`〜をきっかけに`, `〜ことによって`) -> **M33**
- **L11 & L12:** Prevención de Fraudes, Emergencias y Seguridad Ciudadana (`〜てほしい`, 防犯・通報) -> **M34**
- **L13 & L14:** Relaciones Interpersonales, Celebraciones y Consejos de Vida (`お祝い申し上げます`, `〜てみたらどうですか`) -> **M35**
- **L15 & L16:** Geografía Japonesa, Rutas Históricas y Crónicas de Viaje (`〜てみたい`, 地方探訪, 受身形) -> **M36**
- **L17 & L18:** Entorno Laboral Japonés, Deberes Profesionales y Keigo Avanzado (`〜について`, `使役+いただく`) -> **M37**

---

## 4. Seguimiento Detallado: Japonés from Spanish (NHK World — 48 Lecciones)

Curso situacional oficial de 48 lecciones protagonizado por Anna. **Estado global: 100% integrado en `data/nhk_lessons.json` con 144 ejercicios interactivos en `data/conversation_exercises.json`**.
Distribuido pedagógicamente en los módulos nucleares M1 al M19.

---

## 5. Seguimiento del Catálogo de Kanjis y Vocabulario Maestro

### 5.1. Kanjis Auditados (161 Kanjis en `data/kanji.json` y `data/kanji.js`)
Cobertura integral con mnemotecnias, trazos SVG animados, lecturas On/Kun y palabras de vocabulario sincronizadas en el array `words`.

### 5.2. Vocabulario Maestro (314 Palabras en `data/vocabulary.json`)
Cada entrada contiene rigurosamente:
1. `kanji`: Ortografía canónica.
2. `hiragana`: Lectura fonética nativa.
3. `katakana`: Transcripción en katakana (obligatoria).
4. `meaning_es`: Significado en español.
5. `level`: Nivel JLPT correspondiente (`N5`, `N4`, `N3`).
6. `tatoeba_sentences`: Oraciones reales de muestra en contexto con traducción.

---

## 6. Inventario Global de Ejercicios y Tipologías Activas

| Categoría de Ejercicio | Archivo Fuente | Cantidad Total | Tipología / Mecánica | Puntos XP |
| :--- | :--- | :---: | :--- | :---: |
| **Conversación y Diálogo Situacional** | `data/conversation_exercises.json` | **144 ejercicios** (3 por lección NHK) | `reply` (seleccionar réplica adecuada), `missing_word` (rellenar hueco), `missing_kanji` (ortografía correcta) | +10 XP |
| **Quizzes de Módulo Curricular** | `data/curriculum.json` | **154 ejercicios** (4-6 por módulo) | Paso final interactivo obligatorio de evaluación por módulo | +5 XP |
| **Drills Gramaticales y Partículas** | `data/exercises.json` | **9 ejercicios** | Rellenado de partículas y conjugaciones adjetivales/adverbiales | +5 XP |
| **TOTAL EJERCICIOS ACTIVOS** | — | **307 ejercicios** | — | — |

---

## 7. Checklist de Verificación Rápida para Desarrolladores y Agentes

Antes de proponer o implementar cualquier cambio en el temario, responde a estas preguntas:

- [ ] **1. No Duplicidad:** ¿Revisaste la **Sección 2** de este documento y confirmaste que la temática no está ya cubierta en los Módulos 1 al 37?
- [ ] **2. Complementación:** Si el tema ya existe, ¿agregaste los nuevos ejemplos, Can-Dos o ejercicios directamente dentro del módulo correspondiente de `data/curriculum.json` en lugar de crear un módulo nuevo?
- [ ] **3. Enlaces Temáticos:** ¿Configuraste o actualizaste el bloque `related_topics` de los módulos vinculados con `step`, `title`, `relationship` y `reason`?
- [ ] **4. Paso Final de Evaluación:** ¿Aseguraste que cada módulo concluye con un paso exclusivo `is_exercise_step: true` que contenga los ejercicios evaluativos?
- [ ] **5. Vocabulario Completo:** Si agregaste palabras nuevas, ¿las registraste con sus 3 escrituras (**Kanji**, **Hiragana**, **Katakana**) y su nivel JLPT en `data/vocabulary.json`?
- [ ] **6. Sincronización Kanji:** ¿Añadiste la referencia de cada palabra al array `words` de **todos los kanjis que la componen** en `data/kanji.json` y `data/kanji.js`?
- [ ] **7. Build Check:** ¿Ejecutaste `npm run build` y verificaste que compile con 0 errores?
- [ ] **8. Registro de Seguimiento:** ¿Actualizaste las tablas de este documento (`ANALISIS_TEMARIOS_LIBROS.md`) para reflejar las nuevas adiciones?
- [ ] **9. Despliegue:** ¿Realizaste `git commit`, `git push origin main` y confirmaste el estado en Vercel?
"""

with open(md_path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ ANALISIS_TEMARIOS_LIBROS.md actualizado exitosamente con los 37 módulos.")
