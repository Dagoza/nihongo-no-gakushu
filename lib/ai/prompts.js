export const storyPrompt = (arg1, arg2, arg3) => {
  let items = [];
  let itemType = 'vocab';
  let level = 'N5';
  let theme = 'Vida diaria';
  let length = 'medium';

  if (Array.isArray(arg1)) {
    // Legacy signature: (vocabList, level, theme)
    items = arg1;
    level = arg2 || 'N5';
    theme = arg3 || 'Vida diaria';
  } else if (typeof arg1 === 'object' && arg1 !== null) {
    // Options object signature: { items, itemType, level, theme, length }
    items = arg1.items || arg1.vocabList || [];
    itemType = arg1.itemType || 'vocab';
    level = arg1.level || 'N5';
    theme = arg1.theme || 'Vida diaria';
    length = arg1.length || 'medium';
  }

  const itemsListStr = items.map(it => (typeof it === 'object' ? (it.kanji || it.text || JSON.stringify(it)) : it)).join(', ');
  const targetInstruction = itemType === 'kanji'
    ? `You MUST include the following Kanji characters naturally in the story, used within common words or compounds appropriate for JLPT ${level}: ${itemsListStr}.`
    : `You MUST include these specific vocabulary words naturally in the story: ${itemsListStr}.`;

  const sentencesCount = length === 'short' ? '4 to 5' : length === 'long' ? '8 to 12' : '6 to 8';

  return `
You are an expert Japanese teacher and story writer for JLPT students.
Write a short, engaging Japanese story strictly following the ${level} grammar and vocabulary level.
Theme / Context: ${theme}.
${targetInstruction}

Output your response STRICTLY as a JSON object matching this exact schema. Do not output anything outside of the JSON.

{
  "title": "Japanese title with Kanji/Kana",
  "title_en": "Spanish title",
  "difficulty": "${level}",
  "theme": "${theme}",
  "description": "Una breve descripción en español de 1 oración sobre la historia",
  "wordsUsed": ${JSON.stringify(items.map(it => (typeof it === 'object' ? (it.kanji || it.text) : it)))},
  "paragraphs": [
    {
      "id": "p1",
      "chapter": 1,
      "japanese": "Sentence 1. Sentence 2.",
      "english": "Traducción completa del párrafo al español.",
      "rubyDict": {
        "Kanji1": "kana1",
        "Kanji2": "kana2"
      }
    }
  ],
  "sentences": [
    {
      "id": "s1",
      "japanese": "Sentence 1.",
      "english": "Traducción al español de la oración 1.",
      "grammar_note": "Explicación breve y didáctica en español del punto gramatical o uso contextual en esta oración.",
      "clean_target": "oracion 1 solo en hiragana/katakana sin kanji, espacios ni signos de puntuacion"
    }
  ],
  "comprehension_questions": [
    {
      "id": "q1",
      "question": "Pregunta de comprensión lectora en español sobre los hechos o personajes de la historia",
      "options": [
        "Opción A",
        "Opción B",
        "Opción C",
        "Opción D"
      ],
      "correct_index": 0,
      "explanation": "Explicación breve en español justificando la respuesta correcta según el relato en japonés."
    },
    {
      "id": "q2",
      "question": "Segunda pregunta de comprensión en español",
      "options": [
        "Opción A",
        "Opción B",
        "Opción C",
        "Opción D"
      ],
      "correct_index": 1,
      "explanation": "Explicación breve en español."
    },
    {
      "id": "q3",
      "question": "Tercera pregunta de comprensión en español",
      "options": [
        "Opción A",
        "Opción B",
        "Opción C",
        "Opción D"
      ],
      "correct_index": 2,
      "explanation": "Explicación breve en español."
    }
  ]
}

Guidelines:
- "rubyDict" MUST contain ONLY the Kanjis present in the "japanese" paragraph text, mapping them to their hiragana reading.
- "sentences" array MUST contain an entry for EVERY single sentence of the story.
- "clean_target" MUST NOT have spaces, kanji, or punctuation (useful for Speech-to-Text and pronunciation practice).
- "comprehension_questions" MUST contain EXACTLY 3 multiple-choice reading comprehension questions in Spanish, each with 4 clear options, a 0-indexed "correct_index" (0, 1, 2, or 3), and an educational "explanation" in Spanish.
- The story should have about ${sentencesCount} sentences total.
- Ensure natural Japanese phrasing suited for a student studying for JLPT ${level}.
`;
};

export const sentencesPrompt = (options = {}) => {
  const {
    items = [],
    itemType = 'vocab',
    level = 'N5',
    theme = 'Vida cotidiana',
    count = 5
  } = options;

  const itemsListStr = items.map(it => (typeof it === 'object' ? (it.kanji || it.text || JSON.stringify(it)) : it)).join(', ');
  const targetLabel = itemType === 'kanji' ? 'kanjis' : 'palabras de vocabulario';

  return `
You are an expert Japanese teacher and sentence writer for JLPT students.
Generate ${count} natural, engaging, and practical example sentences in Japanese strictly calibrated to JLPT ${level} level.
Theme / Context: ${theme}.
Target ${itemType === 'kanji' ? 'Kanji characters' : 'Vocabulary words'}: ${itemsListStr}.

Each sentence must focus on using one or more of these target ${itemType === 'kanji' ? 'kanjis (in common compounds or words)' : 'words'} naturally within the context of ${theme}.

Output your response STRICTLY as a JSON object matching this exact schema. Do not output anything outside of the JSON.

{
  "theme": "${theme}",
  "difficulty": "${level}",
  "targetItems": ${JSON.stringify(items.map(it => (typeof it === 'object' ? (it.kanji || it.text) : it)))},
  "sentences": [
    {
      "id": "sent_1",
      "target": "target word or kanji used in this sentence",
      "japanese": "Full sentence in natural Japanese with Kanji",
      "furigana": "Sentence written completely in hiragana/katakana (furigana)",
      "translation": "Traducción natural y precisa al español",
      "grammar_note": "Explicación breve y pedagógica en español de la gramática y el matiz de uso del elemento objetivo",
      "clean_target": "oracion en kana sin espacios ni signos de puntuacion"
    }
  ]
}

Guidelines:
- Generate exactly ${count} varied, distinct sentences.
- Ensure the grammar structures and vocabulary strictly match JLPT ${level}.
- The "clean_target" must be in pure kana without punctuation or spaces, designed for audio speech recognition.
- "grammar_note" must provide genuine educational value in Spanish for the student.
`;
};

export const conversationPrompt = (options = {}) => {
  const {
    items = [],
    level = 'N5',
    theme = 'Vida cotidiana',
    category = 'General',
    count = 8,
    characters = ['Persona A', 'Persona B']
  } = options;

  const itemsListStr = items.map(it => (typeof it === 'object' ? (it.kanji || it.text || JSON.stringify(it)) : it)).join(', ');
  const targetRequirement = items.length > 0 
    ? `You MUST naturally incorporate these target words/vocabulary into the dialogue: ${itemsListStr}.`
    : `Include natural vocabulary appropriate for JLPT ${level}.`;

  return `
You are an expert Japanese teacher and dialogue writer for students of Japanese as a second language (similar to NHK World Japanese Lessons).
Write a natural, engaging conversation strictly calibrated for JLPT ${level} level.
Theme / Situation: ${theme} (Category: ${category}).
${targetRequirement}
The dialogue should feature a dynamic exchange between two interlocutors (${characters.join(' y ')}), with about ${count || 8} dialogue lines total.

Output your response STRICTLY as a JSON object matching this exact schema:

{
  "title_jp": "Título de la conversación en japonés con kanji y kana",
  "title_es": "Título en español",
  "level": "${level}",
  "topic": "${theme}",
  "characters": ${JSON.stringify(characters)},
  "dialogue": [
    {
      "speaker": "${characters[0]}",
      "jp": "Línea en japonés natural con kanji",
      "kana": "Línea completa en hiragana/katakana",
      "es": "Traducción natural al español"
    },
    {
      "speaker": "${characters[1]}",
      "jp": "Respuesta en japonés natural con kanji",
      "kana": "Respuesta completa en hiragana/katakana",
      "es": "Traducción natural al español"
    }
  ],
  "grammar_notes": [
    "Punto clave 1: Explicación didáctica en español sobre la estructura o patrón gramatical usado.",
    "Punto clave 2: Matiz cultural o de cortesía cotidiana en Japón."
  ],
  "vocabulary_used": ${JSON.stringify(items.map(it => (typeof it === 'object' ? (it.kanji || it.text) : it)))},
  "comprehension_questions": [
    {
      "id": "q1",
      "question": "Pregunta de comprensión lectora en español sobre lo que hablaron o acordaron los personajes",
      "options": [
        "Opción A",
        "Opción B",
        "Opción C",
        "Opción D"
      ],
      "correct_index": 0,
      "explanation": "Explicación breve en español que justifica la respuesta correcta según el diálogo."
    },
    {
      "id": "q2",
      "question": "Segunda pregunta de comprensión en español sobre el diálogo",
      "options": [
        "Opción A",
        "Opción B",
        "Opción C",
        "Opción D"
      ],
      "correct_index": 1,
      "explanation": "Explicación breve en español."
    },
    {
      "id": "q3",
      "question": "Tercera pregunta de comprensión en español sobre el diálogo",
      "options": [
        "Opción A",
        "Opción B",
        "Opción C",
        "Opción D"
      ],
      "correct_index": 2,
      "explanation": "Explicación breve en español."
    }
  ]
}

Guidelines:
- Maintain authentic Japanese speech etiquette and realistic natural rhythm.
- Strictly adhere to JLPT ${level} vocabulary and grammatical constructs.
- "kana" field must have 100% accurate kana reading for every line.
- "comprehension_questions" MUST contain EXACTLY 3 multiple-choice reading comprehension questions in Spanish based on the dialogue, each with 4 clear options, a 0-indexed "correct_index" (0, 1, 2, or 3), and an educational "explanation" in Spanish.
`;
};

export const roleplayTurnPrompt = (options = {}) => {
  const {
    scenario = 'Cafetería en Tokio',
    level = 'N5',
    characterName = '店員',
    userRole = 'Cliente',
    history = [],
    userMessage = ''
  } = options;

  const historyStr = (history || []).map(h => `${h.speaker}: ${h.jp || h.text} (${h.es || ''})`).join('\n');

  return `
You are an expert conversational Japanese teacher acting as an interactive roleplay partner.
Scenario / Context: ${scenario}.
Student Level: JLPT ${level}.
Your Character: ${characterName}.
Student Character: ${userRole}.

Prior Conversation History:
${historyStr || '(Inicio de conversación)'}

The student has just reviewed and submitted their Japanese line:
"${userMessage}"

Respond in-character as ${characterName} in natural Japanese suited strictly for JLPT ${level}.
Provide helpful educational feedback in Spanish on their Japanese phrase, highlighting good grammar usage or suggesting natural improvements.
Also provide 2 or 3 suggested Japanese replies that the student could use in their next turn.

Output your response STRICTLY as a JSON object matching this exact schema:

{
  "reply_jp": "Your response in natural Japanese with Kanji",
  "reply_kana": "Your response in pure kana (hiragana/katakana)",
  "reply_es": "Spanish translation of your response",
  "feedback": "Friendly, constructive feedback in Spanish on the student's message (e.g. praising their particle usage or explaining a nuance)",
  "suggested_replies": [
    "Opción sugerida 1 en japonés",
    "Opción sugerida 2 en japonés"
  ]
}
`;
};
