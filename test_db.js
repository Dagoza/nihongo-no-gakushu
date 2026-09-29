const jlpt = require('jlpt');
const kanjiData = require('kanji-data');

console.log("JLPT Vocab:", typeof jlpt, Object.keys(jlpt || {}));
console.log("Kanji Data:", typeof kanjiData, Object.keys(kanjiData || {}));
