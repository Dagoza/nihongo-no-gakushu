# Plan de Implementación de IA (Patrón Facade) para Historias

Este plan describe la arquitectura para el generador de historias inteligentes, asegurando que sea independiente del proveedor (OpenAI, Groq, Anthropic) y que la estructura de salida coincida exactamente con el estilo de la aplicación.

## 1. Patrón Facade: Arquitectura

Implementaremos un servicio central (`AIFacade`) que expondrá un único método a la aplicación cliente o backend. Internamente, este delegará el trabajo al adaptador configurado (Ej. `OpenAIAdapter`, `GroqAdapter`).

### Estructura de Archivos Propuesta (Backend / Next.js API Routes)
```text
lib/ai/
  ├── AIFacade.js         # Interfaz principal (El "Facade")
  ├── adapters/
  │    ├── OpenAIAdapter.js
  │    ├── GroqAdapter.js
  │    └── AnthropicAdapter.js
  └── prompts/
       └── storyPrompt.js # El System Prompt estricto para JSON output
```

### Código Base del Facade (`AIFacade.js`)
```javascript
export class AIFacade {
  constructor(provider = 'groq') {
    switch(provider) {
      case 'openai': this.adapter = new OpenAIAdapter(); break;
      case 'anthropic': this.adapter = new AnthropicAdapter(); break;
      case 'groq': default: this.adapter = new GroqAdapter(); break;
    }
  }

  /**
   * Genera una historia usando la IA
   * @param {Array} vocabList - Array de palabras clave a incluir (ej. ['水', '山'])
   * @param {String} level - Nivel JLPT (ej. 'N4')
   * @param {String} theme - Tema (ej. 'Misterio')
   * @returns {Object} Historia en formato JSON compatible con StoryTab
   */
  async generateStory(vocabList, level, theme) {
    return await this.adapter.generate(vocabList, level, theme);
  }
}
```

## 2. Salida de Datos (El Formato Estricto)

Para que las historias generadas luzcan exactamente igual que la historia local de N4 actual (con explicaciones gramaticales, traducciones e integración de audio), la IA debe devolver un **JSON estructurado** (`response_format: { type: "json_object" }`).

El **Prompt del Sistema (`storyPrompt.js`)** forzará a la IA a retornar este exacto esquema:

```json
{
  "id": "story_uuid",
  "title": "Título en japonés",
  "title_en": "Título en inglés/español",
  "difficulty": "N4",
  "description": "Breve descripción...",
  "wordsUsed": ["水", "山"],
  "paragraphs": [
    {
      "id": "p1",
      "chapter": 1,
      "japanese": "...",
      "english": "...",
      "rubyDict": { "kanji": "kana" }
    }
  ],
  "sentences": [
    {
      "id": "s1",
      "japanese": "...",
      "english": "...",
      "grammar_note": "Explicación de una partícula o regla...",
      "clean_target": "solo kana"
    }
  ]
}
```

## 3. Persistencia de Datos (Supabase)

### Guardar Historia
Al recibir el JSON de la IA, lo guardaremos en la tabla `generated_stories` de Supabase (creada en el schema SQL).
```javascript
const { data, error } = await supabase.from('generated_stories').insert({
  user_id: currentUser.id,
  title: generatedStory.title,
  level: generatedStory.difficulty,
  content: generatedStory, // Todo el objeto JSON
  words_used: generatedStory.wordsUsed,
  is_public: false // Privado por defecto
});
```

### Visualizar, Reutilizar y Eliminar
1. **Listado:** La UI consultará `supabase.from('generated_stories').select('*')` y agregará estas historias a la lista de "Biblioteca de Historias" con el tag `[Creada]`.
2. **Eliminar:** `supabase.from('generated_stories').delete().eq('id', storyId)`.
3. **Caché Pública:** Antes de llamar a la IA, la app buscará: `SELECT * FROM generated_stories WHERE is_public = true AND level = 'N4' AND words_used @> ARRAY['水']`. Si existe, se salta la llamada a la IA (ahorrando costos de API).
