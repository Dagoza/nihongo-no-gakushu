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
