const fs = require('fs');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Leer variables de entorno de .env.local
let env = {};
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
} catch (e) {
  console.error("Error leyendo .env.local");
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan credenciales de Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper para descargar texto
function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchText(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Parser CSV simple que respeta comillas
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === header.length) {
      const obj = {};
      header.forEach((h, idx) => obj[h.trim()] = values[idx]);
      rows.push(obj);
    }
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const BASE_URL = 'https://raw.githubusercontent.com/evanclan/OpenJLPT/main/data/csv/';

async function importVocabulary() {
  console.log("🚀 Importando Vocabulario JLPT (OpenJLPT + Tatoeba Sentences)...");
  let totalImported = 0;

  for (const lvl of LEVELS) {
    try {
      console.log(`- Descargando vocabulario ${lvl.toUpperCase()}...`);
      const csvData = await fetchText(`${BASE_URL}vocab-${lvl}.csv`);
      const rows = parseCSV(csvData);
      console.log(`  -> ${rows.length} palabras encontradas para ${lvl.toUpperCase()}`);

      const records = rows.map((r, idx) => {
        const word = r.word || r.reading || '';
        const reading = r.reading || r.word || '';
        return {
          id: `v_${lvl}_${idx}`,
          kanji: word,
          kana: reading,
          meaning_es: r.meanings || '',
          meaning_en: r.meanings || '',
          level: lvl.toUpperCase(),
          category: 'General JLPT'
        };
      }).filter(r => r.kanji.length > 0);

      // Subir en lotes de 100
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error } = await supabase.from('vocabulary').upsert(batch, { onConflict: 'kanji' });
        if (error) {
          console.error(`  ⚠️ Error en lote ${i}-${i + batch.length}:`, error.message);
        }
      }
      totalImported += records.length;
      console.log(`  ✅ ${lvl.toUpperCase()} completado.`);
    } catch (err) {
      console.error(`  ❌ Error procesando vocab-${lvl}:`, err.message);
    }
  }
  console.log(`🎉 Vocabulario importado: ${totalImported} palabras en Supabase.\n`);
}

async function importKanji() {
  console.log("🚀 Importando Kanjis JLPT...");
  let totalKanji = 0;

  for (const lvl of LEVELS) {
    try {
      console.log(`- Descargando kanji ${lvl.toUpperCase()}...`);
      const csvData = await fetchText(`${BASE_URL}kanji-${lvl}.csv`);
      const rows = parseCSV(csvData);
      console.log(`  -> ${rows.length} kanjis encontrados para ${lvl.toUpperCase()}`);

      const records = rows.map((r) => ({
        kanji: r.character,
        strokes: parseInt(r.strokes, 10) || 0,
        meaning_es: r.meanings || '',
        meaning_en: r.meanings || '',
        onyomi: r.onyomi ? r.onyomi.replace(/;/g, ', ') : '',
        kunyomi: r.kunyomi ? r.kunyomi.replace(/;/g, ', ') : '',
        level: lvl.toUpperCase(),
        category: 'JLPT'
      })).filter(k => k.kanji && k.kanji.length === 1);

      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error } = await supabase.from('kanji').upsert(batch, { onConflict: 'kanji' });
        if (error) {
          console.error(`  ⚠️ Error en kanji ${i}-${i + batch.length}:`, error.message);
        }
      }
      totalKanji += records.length;
      console.log(`  ✅ Kanji ${lvl.toUpperCase()} completado.`);
    } catch (err) {
      console.error(`  ❌ Error procesando kanji-${lvl}:`, err.message);
    }
  }
  console.log(`🎉 Kanjis importados: ${totalKanji} kanjis en Supabase.\n`);
}

async function main() {
  await importVocabulary();
  await importKanji();
  console.log("✨ BASE DE DATOS SUPABASE ACTUALIZADA CON ÉXITO.");
}

main();
