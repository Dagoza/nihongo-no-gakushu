const fs = require('fs');
const path = require('path');
const https = require('https');

const vocabPath = path.join(__dirname, '../data/vocabulary.json');
const kanjiPath = path.join(__dirname, '../data/kanji.json');
const outputPath = path.join(__dirname, '../data/pitch_accents.json');

const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
const kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));

// Target sets
const targetWords = new Set();
const targetReadings = new Set();

vocabData.forEach(v => {
  if (v.kanji) targetWords.add(v.kanji.trim());
  if (v.kana) targetReadings.add(v.kana.trim());
  if (v.hiragana) targetReadings.add(v.hiragana.trim());
});

kanjiData.forEach(k => {
  if (k.kanji) targetWords.add(k.kanji.trim());
  if (k.words) {
    k.words.forEach(w => {
      if (w.word) targetWords.add(w.word.trim());
      if (w.reading) targetReadings.add(w.reading.trim());
    });
  }
});

function countMoras(kana) {
  if (!kana) return 0;
  const matches = kana.match(/[\u3040-\u309F\u30A0-\u30FF][\u3041\u3043\u3045\u3047\u3049\u3083\u3085\u3087\u308E\u30A1\u30A3\u30A5\u30A7\u30A9\u30E3\u30E5\u30E7\u30EE]?/g);
  return matches ? matches.length : kana.length;
}

function classifyPitch(pattern, moraCount) {
  const p = parseInt(pattern, 10);
  if (isNaN(p) || p === 0) return 'heiban';
  if (p === 1) return 'atamadaka';
  if (p === moraCount) return 'odaka';
  if (p > 1 && p < moraCount) return 'nakadaka';
  return 'nakadaka';
}

function fetchKanjiumAccents() {
  return new Promise((resolve, reject) => {
    const url = 'https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/source_files/raw/accents.txt';
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching accents.txt`));
      }
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => resolve(rawData));
    }).on('error', reject);
  });
}

// Curated entries for 100% precision on app vocabulary & kanji compounds
const curatedEntries = {
  // Saludos y Expresiones
  "こんにちは": { reading: "こんにちは", pattern: 0, type: "heiban", moraCount: 5 },
  "おはよう": { reading: "おはよう", pattern: 0, type: "heiban", moraCount: 4 },
  "おはようございます": { reading: "おはようございます", pattern: 0, type: "heiban", moraCount: 9 },
  "こんばんは": { reading: "こんばんは", pattern: 0, type: "heiban", moraCount: 5 },
  "ありがとう": { reading: "ありがとう", pattern: 2, type: "nakadaka", moraCount: 5 },
  "ありがとうございます": { reading: "ありがとうございます", pattern: 2, type: "nakadaka", moraCount: 9 },
  "さようなら": { reading: "さようなら", pattern: 4, type: "nakadaka", moraCount: 5 },
  "はじめまして": { reading: "はじめまして", pattern: 4, type: "nakadaka", moraCount: 6 },
  "よろしく": { reading: "よろしく", pattern: 0, type: "heiban", moraCount: 4 },
  "よろしくおねがいします": { reading: "よろしくおねがいします", pattern: 0, type: "heiban", moraCount: 10 },
  "おねがいします": { reading: "おねがいします", pattern: 0, type: "heiban", moraCount: 7 },
  "お願い": { reading: "おねがい", pattern: 0, type: "heiban", moraCount: 4 },
  "おねがい": { reading: "おねがい", pattern: 0, type: "heiban", moraCount: 4 },
  "すみません": { reading: "すみません", pattern: 4, type: "nakadaka", moraCount: 5 },
  "ごめんなさい": { reading: "ごめんなさい", pattern: 5, type: "nakadaka", moraCount: 6 },
  "はい": { reading: "はい", pattern: 1, type: "atamadaka", moraCount: 2 },
  "いいえ": { reading: "いいえ", pattern: 3, type: "odaka", moraCount: 3 },
  "わかりません": { reading: "わかりません", pattern: 5, type: "nakadaka", moraCount: 6 },
  "分かります": { reading: "わかります", pattern: 4, type: "nakadaka", moraCount: 5 },
  "勉強する": { reading: "べんきょうする", pattern: 0, type: "heiban", moraCount: 6 },
  "べんきょうする": { reading: "べんきょうする", pattern: 0, type: "heiban", moraCount: 6 },
  "始めに": { reading: "はじめに", pattern: 0, type: "heiban", moraCount: 4 },
  "はじめに": { reading: "はじめに", pattern: 0, type: "heiban", moraCount: 4 },
  "できるだけ": { reading: "できるだけ", pattern: 0, type: "heiban", moraCount: 5 },
  "十分に": { reading: "じゅうぶんに", pattern: 3, type: "nakadaka", moraCount: 5 },
  "じゅうぶんに": { reading: "じゅうぶんに", pattern: 3, type: "nakadaka", moraCount: 5 },
  "絶対に": { reading: "ぜったいに", pattern: 0, type: "heiban", moraCount: 5 },
  "ぜったいに": { reading: "ぜったいに", pattern: 0, type: "heiban", moraCount: 5 },
  "普通は": { reading: "ふつうは", pattern: 0, type: "heiban", moraCount: 4 },
  "ふつうは": { reading: "ふつうは", pattern: 0, type: "heiban", moraCount: 4 },
  // Horas y Números
  "七時": { reading: "しちじ", pattern: 2, type: "nakadaka", moraCount: 3 },
  "しちじ": { reading: "しちじ", pattern: 2, type: "nakadaka", moraCount: 3 },
  "百円": { reading: "ひゃくえん", pattern: 0, type: "heiban", moraCount: 4 },
  "ひゃくえん": { reading: "ひゃくえん", pattern: 0, type: "heiban", moraCount: 4 },
  "一万円": { reading: "いちまんえん", pattern: 3, type: "nakadaka", moraCount: 5 },
  "いちまんえん": { reading: "いちまんえん", pattern: 3, type: "nakadaka", moraCount: 5 },
  "二時半": { reading: "にじはん", pattern: 3, type: "nakadaka", moraCount: 4 },
  "にじはん": { reading: "にじはん", pattern: 3, type: "nakadaka", moraCount: 4 },
  "一時": { reading: "いちじ", pattern: 2, type: "nakadaka", moraCount: 3 },
  "二時": { reading: "にじ", pattern: 1, type: "atamadaka", moraCount: 2 },
  "三時": { reading: "さんじ", pattern: 1, type: "atamadaka", moraCount: 3 },
  "四時": { reading: "よじ", pattern: 1, type: "atamadaka", moraCount: 2 },
  "五時": { reading: "ごじ", pattern: 1, type: "atamadaka", moraCount: 2 },
  "六時": { reading: "ろくじ", pattern: 2, type: "nakadaka", moraCount: 3 },
  "八時": { reading: "はちじ", pattern: 2, type: "nakadaka", moraCount: 3 },
  "九時": { reading: "くじ", pattern: 1, type: "atamadaka", moraCount: 2 },
  "十時": { reading: "じゅうじ", pattern: 1, type: "atamadaka", moraCount: 3 },
  "十一時": { reading: "じゅういちじ", pattern: 5, type: "nakadaka", moraCount: 6 },
  "十二時": { reading: "じゅうにじ", pattern: 4, type: "nakadaka", moraCount: 5 },
  // Pares mínimos representativos
  "雨": { reading: "あめ", pattern: 1, type: "atamadaka", moraCount: 2 },
  "飴": { reading: "あめ", pattern: 0, type: "heiban", moraCount: 2 },
  "箸": { reading: "はし", pattern: 1, type: "atamadaka", moraCount: 2 },
  "橋": { reading: "はし", pattern: 2, type: "odaka", moraCount: 2 },
  "端": { reading: "はし", pattern: 0, type: "heiban", moraCount: 2 },
  "花": { reading: "はな", pattern: 2, type: "odaka", moraCount: 2 },
  "鼻": { reading: "はな", pattern: 0, type: "heiban", moraCount: 2 },
  "神": { reading: "かみ", pattern: 1, type: "atamadaka", moraCount: 2 },
  "紙": { reading: "かみ", pattern: 2, type: "odaka", moraCount: 2 },
  "髪": { reading: "かみ", pattern: 2, type: "odaka", moraCount: 2 }
};

async function run() {
  console.log('Downloading Kanjium accents.txt...');
  let rawText = '';
  try {
    rawText = await fetchKanjiumAccents();
    console.log(`Downloaded ${rawText.length} bytes.`);
  } catch (err) {
    console.warn('Using local curated fallback:', err.message);
  }

  const fullMap = {};

  if (rawText) {
    const lines = rawText.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split('\t');
      if (parts.length < 3) continue;

      const word = parts[0].trim();
      const reading = parts[1].trim();
      const rawPattern = parts[2].trim().split(',')[0];
      const pattern = parseInt(rawPattern, 10);
      if (isNaN(pattern)) continue;

      const moras = countMoras(reading);
      const type = classifyPitch(pattern, moras);

      const entry = { reading, pattern, type, moraCount: moras };
      if (!fullMap[word]) fullMap[word] = entry;
      if (!fullMap[reading]) fullMap[reading] = entry;
    }
  }

  // Filter to keep only the terms used by the app, plus curated and top relevant vocabulary
  const finalMap = { ...curatedEntries };

  // Include all app target words and readings
  for (const w of targetWords) {
    if (curatedEntries[w]) continue;
    if (fullMap[w]) finalMap[w] = fullMap[w];
  }
  for (const r of targetReadings) {
    if (curatedEntries[r]) continue;
    if (fullMap[r]) finalMap[r] = fullMap[r];
  }

  // Also include any word from fullMap whose reading is in targetReadings or matches kanji
  for (const [k, v] of Object.entries(fullMap)) {
    if (targetWords.has(k) || targetReadings.has(k) || targetReadings.has(v.reading)) {
      if (!finalMap[k]) finalMap[k] = v;
    }
  }

  // Verify coverage for vocab
  let coveredVocab = 0;
  vocabData.forEach(v => {
    if (finalMap[v.kanji] || finalMap[v.kana] || finalMap[v.hiragana]) {
      coveredVocab++;
    } else {
      console.log('Still missing vocab:', v.kanji, v.kana);
    }
  });

  // Verify coverage for kanji compounds
  let totalCompounds = 0;
  let coveredCompounds = 0;
  kanjiData.forEach(k => {
    if (k.words) {
      k.words.forEach(w => {
        totalCompounds++;
        if (finalMap[w.word] || finalMap[w.reading]) {
          coveredCompounds++;
        } else {
          console.log('Still missing compound:', w.word, w.reading);
        }
      });
    }
  });

  console.log(`Vocab coverage: ${coveredVocab}/${vocabData.length} (${Math.round((coveredVocab/vocabData.length)*100)}%)`);
  console.log(`Kanji compound coverage: ${coveredCompounds}/${totalCompounds} (${Math.round((coveredCompounds/totalCompounds)*100)}%)`);

  fs.writeFileSync(outputPath, JSON.stringify(finalMap, null, 2), 'utf8');
  const stats = fs.statSync(outputPath);
  console.log(`Saved ${Object.keys(finalMap).length} entries in ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

run();
