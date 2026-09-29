const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/nhk_lessons.json');
const jsPath = path.join(__dirname, '../data/nhk_lessons.js');

const rawJson = fs.readFileSync(jsonPath, 'utf8');
const lessons = JSON.parse(rawJson);

const updatedLessons = lessons.map(lesson => {
  const pad = String(lesson.lesson).padStart(2, '0');
  const remoteUrl = `https://www3.nhk.or.jp/nhkworld/lesson/spanish/learn/mp3/${pad}-es-le_01.mp3`;
  const localUrl = `/audio/nhk/lesson_${pad}.mp3`;
  return {
    ...lesson,
    audio_url: remoteUrl,
    audio_local: localUrl
  };
});

fs.writeFileSync(jsonPath, JSON.stringify(updatedLessons, null, 2), 'utf8');
console.log(`Updated ${updatedLessons.length} lessons in nhk_lessons.json`);

const jsContent = `// Auto-generated dataset for Nihongo Master\nwindow.NHK_LESSONS_DATA = ${JSON.stringify(updatedLessons, null, 2)};\n`;
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log(`Updated nhk_lessons.js`);
