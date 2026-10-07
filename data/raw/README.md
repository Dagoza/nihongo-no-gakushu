# 📦 Datos Fuente y Archivos Crudos (Raw Data)

Esta carpeta contiene los volcados y archivos sin procesar utilizados como fuentes originales para la construcción y extracción inicial de las bases de datos maestras de Nihongo Master.

## 📄 Archivos

- `4._Hiragana_Vocabulary_Flashcard_raw.json`: Datos crudos del set inicial de flashcards de hiragana.
- `N4_vocabulary_adjectives_raw.json`: Extracción cruda de adjetivos nivel N4.
- `N4_vocabulary_adverbs_raw.json`: Extracción cruda de adverbios nivel N4.
- `japones_from_spanish_raw.json`: Volcado inicial de lecciones NHK en español.
- `kanji_book_raw.json`: Volcado OCR y extracción del libro de kanjis.
- `kanji_print_raw.json`: Volcado de fichas imprimibles de ideogramas.
- `raw_story_decompressed.txt`: Texto descomprimido de la historia base en japonés.

> ⚠️ **Nota**: La aplicación en producción no consume estos archivos directamente; utiliza las bases de datos normalizadas en `data/` (`vocabulary.json`, `kanji.json`, `curriculum.json`, etc.).
