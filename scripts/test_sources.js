const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk.slice(0, 100));
      res.on('end', () => resolve({ url, status: res.statusCode, sample: data.slice(0, 150) }));
    }).on('error', (err) => resolve({ url, error: err.message }));
  });
}

async function run() {
  const sources = [
    'https://raw.githubusercontent.com/elzup/jlpt-word-list/master/json/n5.json',
    'https://raw.githubusercontent.com/elzup/jlpt-word-list/master/json/n4.json',
    'https://raw.githubusercontent.com/elzup/jlpt-word-list/master/json/n3.json',
    'https://raw.githubusercontent.com/chhoumann/jlpt-vocab/master/index.json',
    'https://raw.githubusercontent.com/johannfaller/jlpt-data/master/json/n5.json',
    'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json'
  ];

  for (const s of sources) {
    const res = await testUrl(s);
    console.log(res.status, res.url);
    if (res.status === 200) {
      console.log("   sample:", res.sample.replace(/\n/g, ' '));
    }
  }
}

run();
