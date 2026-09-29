const fs = require('fs');
const https = require('https');

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const GITHUB_BASE = 'https://raw.githubusercontent.com/Bluskyo/JLPT_Vocabulary/master/';

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Descargando vocabulario JLPT N5-N1...');
  let fullVocabulary = [];
  
  for (const level of LEVELS) {
    try {
      const data = await fetchJson(`${GITHUB_BASE}${level}.json`);
      // Bluskyo/JLPT_Vocabulary structure: { "word": "Kanji", "meaning": "English", "furigana": "kana", "romaji": "..." }
      console.log(`- ${level}: ${data.length} palabras`);
      
      const parsed = data.map((item, idx) => ({
        id: `v_${level.toLowerCase()}_${idx}`,
        kanji: item.word || item.furigana,
        kana: item.furigana || item.word,
        meaning_es: item.meaning, // Usando la def original como placeholder, idealmente a traducir
        meaning_en: item.meaning,
        level: level,
        category: 'General'
      }));
      
      fullVocabulary = fullVocabulary.concat(parsed);
    } catch (e) {
      console.error(`Error bajando ${level}:`, e.message);
    }
  }

  // Leer vocabulario actual
  let currentVocab = [];
  try {
    currentVocab = JSON.parse(fs.readFileSync('./data/vocabulary.json', 'utf8'));
  } catch (e) {
    console.log('No se pudo leer vocabulary.json original. Se creará uno nuevo.');
  }

  // Merge sin duplicados de Kanji
  const existingKanjis = new Set(currentVocab.map(v => v.kanji));
  let addedCount = 0;
  for (const v of fullVocabulary) {
    if (!existingKanjis.has(v.kanji)) {
      currentVocab.push(v);
      existingKanjis.add(v.kanji);
      addedCount++;
    }
  }

  fs.writeFileSync('./data/vocabulary.json', JSON.stringify(currentVocab, null, 2));
  console.log(`✅ ¡Éxito! Se añadieron ${addedCount} palabras al vocabulary.json. Total: ${currentVocab.length}`);

  // Haremos lo mismo para Kanjis si lo pide, usando otro repo (e.g. jlpt-kanji)
  console.log('\nDescargando Kanjis JLPT N5-N1...');
  let fullKanji = [];
  for (const level of LEVELS) {
    try {
      // Usaremos un gist o repo conocido para Kanjis.
      const data = await fetchJson(`https://raw.githubusercontent.com/Renairisu/jlpt_kanji_json_msgpack/master/kanji_${level.toLowerCase()}.json`);
      // Structure: { "kanji": { "strokes": 1, "meaning": "...", "onyomi": "...", "kunyomi": "..." } }
      // Renairisu structure might be an array or object. Let's inspect the first one.
      
      let kanjiArray = [];
      if (Array.isArray(data)) kanjiArray = data;
      else if (typeof data === 'object') {
        kanjiArray = Object.keys(data).map(k => ({ kanji: k, ...data[k] }));
      }

      console.log(`- Kanji ${level}: ${kanjiArray.length} kanjis`);
      
      const parsedKanji = kanjiArray.map(item => {
        // Handle Renairisu format where meanings/readings might be strings or arrays
        const getStr = (val) => Array.isArray(val) ? val.join(', ') : (val || '');
        return {
          kanji: item.kanji,
          strokes: item.strokes || 0,
          meaning_es: getStr(item.meaning || item.meanings),
          meaning_en: getStr(item.meaning || item.meanings),
          onyomi: getStr(item.onyomi),
          kunyomi: getStr(item.kunyomi),
          level: level,
          category: 'JLPT'
        };
      });

      fullKanji = fullKanji.concat(parsedKanji);
    } catch (e) {
      console.error(`Error bajando Kanji ${level}:`, e.message);
    }
  }

  let currentKanjiList = [];
  try {
    currentKanjiList = JSON.parse(fs.readFileSync('./data/kanji.json', 'utf8'));
  } catch (e) {
    console.log('No se pudo leer kanji.json original. Se creará uno nuevo.');
  }

  const existingKanjiChars = new Set(currentKanjiList.map(k => k.kanji));
  let addedKanjiCount = 0;
  for (const k of fullKanji) {
    if (!existingKanjiChars.has(k.kanji) && k.kanji && k.kanji.length === 1) {
      currentKanjiList.push(k);
      existingKanjiChars.add(k.kanji);
      addedKanjiCount++;
    }
  }

  fs.writeFileSync('./data/kanji.json', JSON.stringify(currentKanjiList, null, 2));
  console.log(`✅ ¡Éxito! Se añadieron ${addedKanjiCount} kanjis al kanji.json. Total: ${currentKanjiList.length}`);
}

run();
