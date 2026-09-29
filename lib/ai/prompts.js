export const storyPrompt = (vocabList, level, theme) => `
You are an expert Japanese teacher and story writer for JLPT students.
Write a short, engaging Japanese story strictly following the ${level} grammar and vocabulary level.
Theme: ${theme}.
You MUST include these specific vocabulary words naturally in the story: ${vocabList.join(', ')}.

Output your response STRICTLY as a JSON object matching this exact schema. Do not output anything outside of the JSON.

{
  "title": "Japanese title",
  "title_en": "Spanish title",
  "difficulty": "${level}",
  "description": "A short 1 sentence description in Spanish",
  "wordsUsed": ${JSON.stringify(vocabList)},
  "paragraphs": [
    {
      "id": "p1",
      "chapter": 1,
      "japanese": "Sentence 1. Sentence 2.",
      "english": "Spanish translation of the paragraph.",
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
      "english": "Spanish translation of sentence 1.",
      "grammar_note": "A brief explanation of a grammar point used in this sentence (in Spanish).",
      "clean_target": "sentence 1 in kana only (no kanji, no punctuation)"
    }
  ]
}

Guidelines:
- "rubyDict" MUST contain ONLY the Kanjis present in the "japanese" paragraph text, mapping them to their hiragana reading.
- "sentences" array MUST contain an entry for EVERY single sentence of the story.
- "clean_target" MUST NOT have spaces, kanji, or punctuation (useful for Speech-to-Text).
- The story should have at least 1 paragraph and about 4 to 8 sentences total.
`;
