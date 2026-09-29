const fs = require('fs');
const path = require('path');
const https = require('https');

const outputDir = path.join(__dirname, '../public/audio/nhk');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000000) {
      console.log(`[SKIP] Ya existe: ${path.basename(dest)}`);
      return resolve();
    }

    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${response.statusCode} al descargar ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`[OK] Descargado: ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function run() {
  console.log('Iniciando descarga de audios MP3 oficiales de NHK World...');
  for (let i = 1; i <= 48; i++) {
    const pad = String(i).padStart(2, '0');
    const url = `https://www3.nhk.or.jp/nhkworld/lesson/spanish/learn/mp3/${pad}-es-le_01.mp3`;
    const dest = path.join(outputDir, `lesson_${pad}.mp3`);
    try {
      await downloadFile(url, dest);
    } catch (err) {
      console.error(`Error en lección ${i}:`, err.message);
    }
  }
  console.log('Proceso de descarga completado.');
}

run();
