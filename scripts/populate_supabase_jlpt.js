const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// Configuración de Supabase
let env = {};
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
} catch (e) {
  console.error("No se pudo leer .env.local");
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ Faltan credenciales de Supabase en el .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const VOCAB_URL_BASE = 'https://raw.githubusercontent.com/Bluskyo/JLPT_Vocabulary/master/';
// Otro repo para Kanji:
const KANJI_URL_BASE = 'https://raw.githubusercontent.com/Renairisu/jlpt_kanji_json_msgpack/master/';

const fetchJson = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
  }).on('error', reject);
});

async function run() {
  console.log("🚀 Iniciando importación masiva de JLPT a Supabase...");
  
  // 1. IMPORTAR VOCABULARIO
  for (const level of LEVELS) {
    try {
      console.log(`\nDescargando Vocabulario ${level}...`);
      const data = await fetchJson(`${VOCAB_URL_BASE}${level}.json`);
      
      const records = data.map((item, index) => ({
        // Usamos uuid nativo en supabase o un ID propio
        id: `vocab_${level.toLowerCase()}_${index}`,
        kanji: item.word || item.furigana || '',
        kana: item.furigana || item.word || '',
        meaning_es: item.meaning || '', 
        meaning_en: item.meaning || '',
        level: level,
        category: 'General JLPT'
      }));

      console.log(`Subiendo ${records.length} palabras de ${level} a Supabase...`);
      // Upsert: Si ya existe, lo ignora/actualiza
      const { error } = await supabase.from('vocabulary').upsert(records, { onConflict: 'kanji' });
      if (error) throw error;
      console.log(`✅ Vocabulario ${level} guardado con éxito.`);
      
    } catch (err) {
      console.error(`❌ Error en vocabulario ${level}:`, err.message);
    }
  }

  // 2. IMPORTAR KANJIS
  for (const level of LEVELS) {
    try {
      console.log(`\nDescargando Kanji ${level}...`);
      const data = await fetchJson(`${KANJI_URL_BASE}kanji_${level.toLowerCase()}.json`);
      
      // La API de este repo puede ser un objeto key-value
      let kanjiArray = [];
      if (Array.isArray(data)) kanjiArray = data;
      else if (typeof data === 'object') {
        kanjiArray = Object.keys(data).map(k => ({ kanji: k, ...data[k] }));
      }

      const records = kanjiArray.map((item) => {
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

      console.log(`Subiendo ${records.length} kanjis de ${level} a Supabase...`);
      const { error } = await supabase.from('kanji').upsert(records, { onConflict: 'kanji' });
      if (error) throw error;
      console.log(`✅ Kanji ${level} guardado con éxito.`);
      
    } catch (err) {
      console.error(`❌ Error en kanji ${level}:`, err.message);
    }
  }

  console.log("\n🎉 IMPORTACIÓN MASIVA COMPLETADA");
}

run();
