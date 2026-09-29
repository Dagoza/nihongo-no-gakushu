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
    'https://raw.githubusercontent.com/subidit/jlpt-word-list/master/N5.json',
    'https://raw.githubusercontent.com/jtanasi/jlpt-vocabulary/master/data/n5.json',
    'https://raw.githubusercontent.com/open-language-data/jlpt-data/main/n5.json',
    'https://raw.githubusercontent.com/tanast1997/jlpt-vocab-data/master/n5.json',
    'https://raw.githubusercontent.com/jisho-api/jisho-api/master/data/words.json',
    'https://raw.githubusercontent.com/stephenash/jlpt-kanji/master/jlpt-n5.json',
    'https://raw.githubusercontent.com/krmanik/JLPT-Word-List/master/N5.json',
    'https://raw.githubusercontent.com/ghosh/japanese-words/master/words.json'
  ];

  for (const s of sources) {
    const res = await testUrl(s);
    if (res.status === 200) {
      console.log("SUCCESS:", res.status, res.url);
      console.log("   sample:", res.sample.replace(/\n/g, ' '));
    }
  }
}

run();
