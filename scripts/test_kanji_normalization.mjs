import assert from 'node:assert';
import { normalizeKanjiReadingSet, katakanaToHiragana } from '../lib/japaneseUtils.js';
import kanjiData from '../data/kanji.json' with { type: 'json' };

console.log('Testing normalizeKanjiReadingSet...');

// 1. Test kanji 生
const kanjiSei = kanjiData.find(k => k.kanji === '生');
assert(kanjiSei, 'Kanji 生 must exist');

const seiReadings = normalizeKanjiReadingSet(kanjiSei);
console.log('Readings for 生:', Array.from(seiReadings));

// Must accept いきる, い, セイ, せい
assert(seiReadings.has('いきる'), 'Debe aceptar いきる (con okurigana resuelto)');
assert(seiReadings.has('い'), 'Debe aceptar い (raíz sin okurigana)');
assert(seiReadings.has('せい'), 'Debe aceptar せい (onyomi en hiragana)');
assert(seiReadings.has('セイ'), 'Debe aceptar セイ (onyomi en katakana)');
assert(seiReadings.has('うまれる'), 'Debe aceptar うまれる (con okurigana resuelto)');
assert(seiReadings.has('う'), 'Debe aceptar う (raíz)');
assert(seiReadings.has('なま'), 'Debe aceptar なま');

// 2. Test kanji 一
const kanjiIchi = kanjiData.find(k => k.kanji === '一');
assert(kanjiIchi, 'Kanji 一 must exist');
const ichiReadings = normalizeKanjiReadingSet(kanjiIchi);
console.log('Readings for 一:', Array.from(ichiReadings));

// Must reject い for 一 (false positive protection)
assert(!ichiReadings.has('い'), 'Debe rechazar "い" para 一 (previene falso positivo de 1 sola mora)');
assert(!ichiReadings.has('イ'), 'Debe rechazar "イ" para 一');
assert(ichiReadings.has('いち'), 'Debe aceptar いち');
assert(ichiReadings.has('イチ'), 'Debe aceptar イチ');
assert(ichiReadings.has('ひと'), 'Debe aceptar ひと');
assert(ichiReadings.has('ひとつ'), 'Debe aceptar ひとつ');

// 3. Test kanji 木
const kanjiKi = kanjiData.find(k => k.kanji === '木');
const kiReadings = normalizeKanjiReadingSet(kanjiKi);
assert(!kiReadings.has('い'), 'Debe rechazar "い" para 木');
assert(kiReadings.has('き'), 'Debe aceptar き para 木');

console.log('✓ All normalizeKanjiReadingSet tests passed successfully!');
