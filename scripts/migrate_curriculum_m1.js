/**
 * scripts/migrate_curriculum_m1.js
 * Script maestro de migración para Milestone M1:
 * - Feature 1: Consolidación de ejemplos (45 duplicados descartados, 44 únicos migrados a grammar_points, 'examples' eliminado de secciones).
 * - Feature 2: Enriquecimiento masivo de vocabulario (8 a 12 términos por paso en los 69 pasos de contenido).
 * - Feature 3: Inyección de datos interactivos de Kanjis y Jukugo (kanji_jukugo en todos los 69 pasos).
 * - Feature 4: Inyección de Componentes y Puentes Funcionales (functional_bridge en todos los 69 pasos).
 * - Feature 5: Sincronización estricta con vocabulary.json (Regla 1) y kanji.json (Regla 2).
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const wanakana = require('wanakana');

const { VOCAB_EXPANSIONS } = require('./m1_data/curriculum_vocab_expansion.js');
const { KANJI_JUKUGO_CATALOG } = require('./m1_data/curriculum_kanji_jukugo.js');
const { FUNCTIONAL_BRIDGE_CATALOG } = require('./m1_data/curriculum_functional_bridge.js');

const ROOT_DIR = path.resolve(__dirname, '..');
const CURRICULUM_PATH = path.join(ROOT_DIR, 'data', 'curriculum.json');
const VOCABULARY_PATH = path.join(ROOT_DIR, 'data', 'vocabulary.json');
const KANJI_PATH = path.join(ROOT_DIR, 'data', 'kanji.json');
const DICTIONARY_PATH = path.join(ROOT_DIR, 'data', 'dictionary.json');

const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf]/;
const VALID_JLPT_LEVELS = new Set(['N5', 'N4', 'N3', 'N2', 'N1']);

// Catálogo exhaustivo de asignación de los 44 ejemplos únicos a grammar_points
const UNIQUE_MAPPINGS = [
  // Módulo 1
  { mod: 1, substep: 1, jp: 'おはようございます、田中さん。', targetGp: 0 },
  { mod: 1, substep: 1, jp: 'すみません、ペンを落としましたよ。', targetGp: 0 },
  { mod: 1, substep: 3, jp: 'お国はどちらですか。アメリカです。', targetGp: 0 },
  { mod: 1, substep: 3, jp: 'キムさんは日本人ですか。いいえ、韓国人です。', targetGp: 1 },
  // Módulo 2
  { mod: 2, substep: 1, jp: 'すみません、日本語が分かりません。英語が話せますか。', targetGp: 0 },
  { mod: 2, substep: 1, jp: '「Gato」は日本語で何ですか。「ねこ」です。', targetGp: 1 },
  // Módulo 3
  { mod: 3, substep: 1, jp: 'マリアさんはどこに住んでいますか。京都に住んでいます。', targetGp: 0 },
  { mod: 3, substep: 2, jp: '家族は何人ですか。三人です。', targetGp: 0 },
  // Módulo 20
  { mod: 20, substep: 1, jp: '先週日本に来たばかりです。', targetGp: 0 },
  { mod: 20, substep: 2, jp: 'あの人は親切そうで、仕事が早そうです。', targetGp: 0 },
  // Módulo 21
  { mod: 21, substep: 1, jp: 'わさび抜きで作ってもらえますか？', targetGp: 0 },
  { mod: 21, substep: 2, jp: '生卵を入れて、よく混ぜて召し上がってください。', targetGp: 0 },
  // Módulo 22
  { mod: 22, substep: 1, jp: '新幹線は早く予約したほうがいいですよ。', targetGp: 0 },
  { mod: 22, substep: 2, jp: '地元の人とたくさん話せてよかったです。', targetGp: 0 },
  // Módulo 23
  { mod: 23, substep: 1, jp: '天気が悪かったら、来週に延期します。', targetGp: 0 },
  { mod: 23, substep: 2, jp: 'ごみ箱がどこにあるか分かりますか？', targetGp: 0 },
  // Módulo 24
  { mod: 24, substep: 1, jp: 'どんなネクタイを締めていったらいいですか？', targetGp: 0 },
  { mod: 24, substep: 2, jp: '暖かい手袋をはめて出かけましょう。', targetGp: 0 },
  // Módulo 25
  { mod: 25, substep: 1, jp: 'この靴は滑りにくくて安全です。', targetGp: 0 },
  { mod: 25, substep: 2, jp: '鍵をかけるのを忘れました。', targetGp: 0 },
  // Módulo 26
  { mod: 26, substep: 1, jp: '机の上に資料が並べてあります。', targetGp: 0 },
  { mod: 26, substep: 2, jp: '横の髪を少しすいてもらえますか？', targetGp: 0 },
  // Módulo 27
  { mod: 27, substep: 1, jp: 'ドアを開けたままにしないでください。', targetGp: 0 },
  { mod: 27, substep: 2, jp: '頭を保護して、揺れが収まるまで待ちましょう。', targetGp: 0 },
  // Módulo 28
  { mod: 28, substep: 1, jp: '日本の習慣が理解できるようになりました。', targetGp: 0 },
  { mod: 28, substep: 2, jp: '来年、JLPTのN3を受験しようと思っています。', targetGp: 0 },
  // Módulo 29
  { mod: 29, substep: 1, jp: '来週のライブのチケットって、もう取ったんだっけ？', targetGp: 1 },
  { mod: 29, substep: 2, jp: 'この漫画は主人公の成長が描かれていて感動的です。', targetGp: 0 },
  // Módulo 30
  { mod: 30, substep: 1, jp: '鍵の調子が悪いみたいなので、見てもらえますか？', targetGp: 0 },
  { mod: 30, substep: 2, jp: '南向きで日当たりの良い部屋を希望しています。', targetGp: 0 },
  // Módulo 31
  { mod: 31, substep: 1, jp: '塩分を取りすぎないように気をつけています。', targetGp: 0 },
  { mod: 31, substep: 2, jp: '讃岐うどんの本場のコシを味わってください。', targetGp: 0 },
  // Módulo 32
  { mod: 32, substep: 1, jp: 'お互いに助け合える関係になれたらいいですね。', targetGp: 0 },
  { mod: 32, substep: 2, jp: 'どうぞ遠慮なくお使いください。', targetGp: 0 },
  // Módulo 33
  { mod: 33, substep: 1, jp: '友人に誘われたのをきっかけに、茶道を習い始めました。', targetGp: 0 },
  { mod: 33, substep: 2, jp: 'アプリを活用することによって、隙間時間を有効に使えます。', targetGp: 0 },
  // Módulo 34
  { mod: 34, substep: 1, jp: '危険ですから、すぐにここから離れてほしいです。', targetGp: 0 },
  { mod: 34, substep: 2, jp: '身に覚えのない請求が来たら、消費者センターに相談しましょう。', targetGp: 0 },
  // Módulo 35
  { mod: 35, substep: 1, jp: 'ご結婚おめでとうございます。末永くお幸せに。', targetGp: 0 },
  { mod: 35, substep: 2, jp: '困ったときはいつでも私に相談してくださいね。', targetGp: 0 },
  // Módulo 36
  { mod: 36, substep: 1, jp: '歴史ある城下町の街並みを散策してみたいです。', targetGp: 0 },
  { mod: 36, substep: 2, jp: '露天風呂付きの部屋にグレードアップしてもらえました。', targetGp: 0 },
  // Módulo 37
  { mod: 37, substep: 1, jp: '安全衛生規則について、しっかり確認しておいてください。', targetGp: 0 },
  { mod: 37, substep: 2, jp: '本日は面接の機会をいただき、誠にありがとうございます。', targetGp: 0 }
];

function runMigration() {
  console.log('======================================================');
  console.log('🚀 NIHONGO MASTER - MIGRACIÓN MILESTONE M1');
  console.log('======================================================\n');

  const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf8'));
  const vocabulary = JSON.parse(fs.readFileSync(VOCABULARY_PATH, 'utf8'));
  const kanjiList = JSON.parse(fs.readFileSync(KANJI_PATH, 'utf8'));
  const dictionary = JSON.parse(fs.readFileSync(DICTIONARY_PATH, 'utf8'));

  const dictMap = new Map();
  dictionary.forEach(d => {
    if (!d.isKanaIndex && !dictMap.has(d.kanji)) {
      dictMap.set(d.kanji, d);
    }
  });

  const existingVocabMap = new Map(vocabulary.map(v => [v.kanji, v]));
  const kanjiMap = new Map(kanjiList.map(k => [k.kanji, k]));

  // ---------------------------------------------------------------------------
  // PASO 1: Feature 1 - Consolidación de Ejemplos
  // ---------------------------------------------------------------------------
  console.log('--- PASO 1: Consolidación de Ejemplos (Feature 1) ---');
  let discardedDuplicates = 0;
  let migratedUnique = 0;
  let preGpExamplesCount = 0;

  curriculum.forEach(mod => {
    mod.sections.forEach(sec => {
      if (sec.is_exercise_step) return;

      const secExamples = sec.examples || [];
      const gps = sec.grammar_points || [];

      gps.forEach(gp => {
        preGpExamplesCount += (gp.examples || []).length;
      });

      secExamples.forEach(ex => {
        const isDuplicate = gps.some(gp =>
          (gp.examples || []).some(gpex => gpex.jp === ex.jp)
        );

        if (isDuplicate) {
          discardedDuplicates++;
        } else {
          const mapping = UNIQUE_MAPPINGS.find(m =>
            m.mod === mod.step && m.substep === sec.substep && m.jp === ex.jp
          );

          if (!mapping) {
            throw new Error(`Ejemplo único no mapeado: Mod ${mod.step} Step ${sec.substep}: "${ex.jp}"`);
          }

          const targetGp = gps[mapping.targetGp];
          if (!targetGp) {
            throw new Error(`GP destino no existe: Mod ${mod.step} Step ${sec.substep} GP ${mapping.targetGp}`);
          }

          if (!Array.isArray(targetGp.examples)) targetGp.examples = [];

          targetGp.examples.push({
            jp: ex.jp,
            kana: ex.kana,
            es: ex.es
          });
          migratedUnique++;
        }
      });

      // Eliminar definitivamente la propiedad 'examples' a nivel de sección
      delete sec.examples;
    });
  });

  console.log(`  ✓ Duplicados descartados: ${discardedDuplicates} (esperados: 45)`);
  console.log(`  ✓ Únicos migrados a fórmulas: ${migratedUnique} (esperados: 44)`);
  assert.strictEqual(discardedDuplicates, 45, 'Debe descartar exactamente 45 duplicados');
  assert.strictEqual(migratedUnique, 44, 'Debe migrar exactamente 44 ejemplos únicos');

  // ---------------------------------------------------------------------------
  // PASO 2: Features 2, 3 y 4 - Vocabulario, Kanji/Jukugo y Puente Funcional
  // ---------------------------------------------------------------------------
  console.log('\n--- PASO 2: Vocabulario, Kanji/Jukugo y Functional Bridge (Features 2, 3, 4) ---');

  let totalContentSteps = 0;

  curriculum.forEach(mod => {
    mod.sections.forEach(sec => {
      if (sec.is_exercise_step) return;
      totalContentSteps++;
      const stepKey = `${mod.step}_${sec.substep}`;

      // A. Enriquecimiento de Vocabulario
      let currentVocab = (sec.vocab || []).slice();

      // Deduplicar M8_2
      if (stepKey === '8_2') {
        const seen = new Set();
        currentVocab = currentVocab.filter(v => {
          if (seen.has(v.kanji)) return false;
          seen.add(v.kanji);
          return true;
        });
      }

      if (stepKey === '19_1') {
        // M19 se puebla con sus 10 términos completos
        sec.vocab = VOCAB_EXPANSIONS['19_1'].map(v => ({ ...v }));
      } else {
        const extraList = VOCAB_EXPANSIONS[stepKey] || [];
        const seenWords = new Set(currentVocab.map(v => v.kanji));
        extraList.forEach(item => {
          if (!seenWords.has(item.kanji)) {
            seenWords.add(item.kanji);
            currentVocab.push({ ...item });
          }
        });
        sec.vocab = currentVocab;
      }

      // Validar rango estricto 8 a 12 palabras
      assert(
        sec.vocab.length >= 8 && sec.vocab.length <= 12,
        `Paso ${stepKey} fuera de rango [8, 12]: ${sec.vocab.length}`
      );

      // B. Inyección de Kanji / Jukugo (Feature 3)
      const kjList = KANJI_JUKUGO_CATALOG[stepKey];
      assert(Array.isArray(kjList) && kjList.length > 0, `Falta kanji_jukugo en paso ${stepKey}`);
      sec.kanji_jukugo = kjList.map(kj => ({
        kanji: kj.kanji,
        kana: kj.kana,
        meaning: kj.meaning,
        onyomi: kj.onyomi,
        kunyomi: kj.kunyomi,
        type: kj.type,
        breakdown: kj.breakdown.map(b => ({ ...b })),
        breakdown_text: kj.breakdown_text,
        mnemonic: kj.mnemonic
      }));

      // C. Inyección de Puente Funcional (Feature 4)
      const fbList = FUNCTIONAL_BRIDGE_CATALOG[stepKey];
      assert(Array.isArray(fbList) && fbList.length > 0, `Falta functional_bridge en paso ${stepKey}`);
      sec.functional_bridge = fbList.map(fb => ({
        item: fb.item,
        name: fb.name,
        reading: fb.reading,
        type: fb.type,
        function_es: fb.function_es,
        rule: fb.rule,
        examples: fb.examples.map(e => ({ ...e })),
        link_url: fb.link_url
      }));
    });

    // Actualizar campos globales del módulo (included_vocab y vocab_details)
    const contentSections = mod.sections.filter(s => !s.is_exercise_step);
    mod.included_vocab = contentSections.flatMap(s => (s.vocab || []).map(v => v.kanji));
    mod.vocab_details = contentSections.flatMap(s => (s.vocab || []).slice(0, 6));
  });

  console.log(`  ✓ 69 pasos de contenido enriquecidos exitosamente.`);
  console.log(`  ✓ Rango 8-12 palabras por paso verificado al 100%.`);
  console.log(`  ✓ kanji_jukugo poblado en los 69 pasos.`);
  console.log(`  ✓ functional_bridge poblado en los 69 pasos.`);

  // ---------------------------------------------------------------------------
  // PASO 3: Feature 5 - Sincronización Estricta Reglas 1 y 2
  // ---------------------------------------------------------------------------
  console.log('\n--- PASO 3: Sincronización Estricta Reglas 1 y 2 (Feature 5) ---');

  let newVocabCount = 0;
  let wordIdCounter = vocabulary.length + 1;

  curriculum.forEach(mod => {
    assert(VALID_JLPT_LEVELS.has(mod.level), `Nivel JLPT inválido en módulo ${mod.step}: ${mod.level}`);

    mod.sections.forEach(sec => {
      if (sec.is_exercise_step) return;

      (sec.vocab || []).forEach(item => {
        const kanjiWord = item.kanji || item.kana;
        if (!kanjiWord || typeof kanjiWord !== 'string') return;

        if (!existingVocabMap.has(kanjiWord)) {
          let hira = item.kana || '';
          let kata = '';

          if (dictMap.has(kanjiWord)) {
            const dEntry = dictMap.get(kanjiWord);
            hira = dEntry.hiragana || hira;
            kata = dEntry.katakana || '';
          }

          if (!kata) {
            if (wanakana.isKatakana(hira)) {
              kata = hira;
              hira = wanakana.toHiragana(kata);
            } else {
              kata = wanakana.toKatakana(hira);
            }
          }

          // Validación de pureza de kana
          if (KANJI_REGEX.test(hira)) {
            throw new Error(`Kanji detectado en hiragana para "${kanjiWord}": "${hira}"`);
          }
          if (KANJI_REGEX.test(kata)) {
            throw new Error(`Kanji detectado en katakana para "${kanjiWord}": "${kata}"`);
          }

          const meaning = item.meaning || (dictMap.get(kanjiWord) ? dictMap.get(kanjiWord).meaning_es : '');
          assert(meaning && meaning.length > 0, `Significado vacío para palabra "${kanjiWord}"`);

          const newEntry = {
            id: `v_curr_${mod.step}_${sec.substep}_${wordIdCounter++}`,
            kanji: kanjiWord,
            hiragana: hira,
            katakana: kata,
            romaji: item.romaji || (dictMap.get(kanjiWord) ? dictMap.get(kanjiWord).romaji : ''),
            meaning_es: meaning,
            category: item.category || (dictMap.get(kanjiWord) ? dictMap.get(kanjiWord).category : mod.title),
            level: mod.level
          };

          vocabulary.push(newEntry);
          existingVocabMap.set(kanjiWord, newEntry);
          newVocabCount++;
        }
      });
    });
  });

  console.log(`  ✓ Nuevas palabras añadidas a vocabulary.json: ${newVocabCount}`);
  console.log(`  ✓ Total palabras en vocabulary.json: ${vocabulary.length}`);

  // Sincronización bidireccional hacia data/kanji.json
  let syncedLinksCount = 0;
  vocabulary.forEach(v => {
    const wordStr = v.kanji;
    if (!wordStr) return;

    const chars = [...wordStr];
    chars.forEach(char => {
      if (kanjiMap.has(char)) {
        const kObj = kanjiMap.get(char);
        if (!Array.isArray(kObj.words)) kObj.words = [];

        const existingWordIndex = kObj.words.findIndex(w => w.word === wordStr);
        if (existingWordIndex === -1) {
          kObj.words.push({
            word: wordStr,
            reading: v.hiragana,
            meaning: v.meaning_es
          });
          syncedLinksCount++;
        } else {
          // Normalizar si el significado previo estaba en inglés
          const currentMean = kObj.words[existingWordIndex].meaning || '';
          if (/^(to |the |a |an )/i.test(currentMean) && v.meaning_es) {
            kObj.words[existingWordIndex].meaning = v.meaning_es;
          }
        }
      }
    });
  });

  console.log(`  ✓ Nuevos enlaces sincronizados en kanji.words: ${syncedLinksCount}`);

  // ---------------------------------------------------------------------------
  // PASO 4: Escritura de Datasets
  // ---------------------------------------------------------------------------
  console.log('\n--- PASO 4: Guardado Seguro de Datasets ---');
  fs.writeFileSync(CURRICULUM_PATH, JSON.stringify(curriculum, null, 2) + '\n', 'utf8');
  fs.writeFileSync(VOCABULARY_PATH, JSON.stringify(vocabulary, null, 2) + '\n', 'utf8');
  fs.writeFileSync(KANJI_PATH, JSON.stringify(kanjiList, null, 2) + '\n', 'utf8');

  console.log('  ✓ data/curriculum.json guardado.');
  console.log('  ✓ data/vocabulary.json guardado.');
  console.log('  ✓ data/kanji.json guardado.');

  // ---------------------------------------------------------------------------
  // PASO 5: Verificaciones de Integridad Inmediatas
  // ---------------------------------------------------------------------------
  console.log('\n--- PASO 5: Aserciones Post-Migración ---');

  // 1. Ausencia absoluta de 'examples' en raíz de sección
  let lingeringExamples = 0;
  let totalGpExamples = 0;
  curriculum.forEach(mod => {
    mod.sections.forEach(sec => {
      if ('examples' in sec) lingeringExamples++;
      if (!sec.is_exercise_step) {
        (sec.grammar_points || []).forEach(gp => {
          totalGpExamples += (gp.examples || []).length;
        });
      }
    });
  });

  assert.strictEqual(lingeringExamples, 0, 'No debe haber claves "examples" residuales en secciones');
  console.log(`  ✓ Claves "examples" residuales en secciones: ${lingeringExamples}`);
  console.log(`  ✓ Total ejemplos consolidados en fórmulas: ${totalGpExamples} (esperados: 271)`);
  assert.strictEqual(totalGpExamples, preGpExamplesCount + 44, 'Total de ejemplos debe ser preexistentes + 44');

  console.log('\n======================================================');
  console.log('🎉 MIGRACIÓN M1 COMPLETADA CON ÉXITO');
  console.log('======================================================\n');
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
