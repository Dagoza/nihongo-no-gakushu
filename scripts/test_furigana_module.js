const assert = require('assert');
const { createRequire } = require('module');

async function run() {
  console.log('Testing lib/furigana.js...');
  const furigana = await import('../lib/furigana.js', { with: { type: 'json' } }).catch(() => null) 
    || await import('../lib/furigana.js');

  const { toFurigana, containsKanji } = furigana;

  // 1. Detection of Kanji
  assert.strictEqual(containsKanji('こんにちは'), false, 'Hiragana only should not contain kanji');
  assert.strictEqual(containsKanji('私'), true, 'Kanji should be detected');
  assert.strictEqual(containsKanji('人々'), true, 'Iteration mark should be detected as kanji word');

  // 2. Conversion with Furigana
  const res1 = toFurigana('はじめまして。私はアンナです。(Encantada, soy Anna)');
  assert.ok(res1.includes('<ruby class="furigana-ruby">私<rt>わたし</rt></ruby>'), 'Should convert 私 to ruby with わたし');
  console.log('✓ Test 1: Subtitle furigana conversion passed');

  const res2 = toFurigana('地震のとき：机の下に入れ。');
  assert.ok(res2.includes('<ruby class="furigana-ruby">地震<rt>じしん</rt></ruby>'), 'Should convert 地震');
  assert.ok(res2.includes('<ruby class="furigana-ruby">机<rt>つくえ</rt></ruby>'), 'Should convert 机');
  assert.ok(res2.includes('<ruby class="furigana-ruby">下<rt>した</rt></ruby>'), 'Should convert 下');
  assert.ok(res2.includes('<ruby class="furigana-ruby">入<rt>はい</rt></ruby>'), 'Should convert 入');
  console.log('✓ Test 2: Imperative/sentence furigana passed');

  const res3 = toFurigana('私の家族は四人です。父と母と兄がいます。');
  assert.ok(res3.includes('<ruby class="furigana-ruby">家族<rt>かぞく</rt></ruby>'), 'Should convert 家族');
  assert.ok(res3.includes('<ruby class="furigana-ruby">四人<rt>よにん</rt></ruby>'), 'Should convert 四人');
  assert.ok(res3.includes('<ruby class="furigana-ruby">父<rt>ちち</rt></ruby>'), 'Should convert 父');
  assert.ok(res3.includes('<ruby class="furigana-ruby">母<rt>はは</rt></ruby>'), 'Should convert 母');
  assert.ok(res3.includes('<ruby class="furigana-ruby">兄<rt>あに</rt></ruby>'), 'Should convert 兄');
  console.log('✓ Test 3: Family and counter furigana passed');

  const res4 = toFurigana('支払いは別々にお願いします。');
  assert.ok(res4.includes('<ruby class="furigana-ruby">別々<rt>べつべつ</rt></ruby>'), 'Should convert iteration mark 別々');
  assert.ok(res4.includes('<ruby class="furigana-ruby">願<rt>ねが</rt></ruby>'), 'Should convert 願');
  console.log('✓ Test 4: Iteration mark and polite stem furigana passed');

  // 5. With Kana alignment
  const res5 = toFurigana('おはようございます、田中さん。', 'おはようございます、たなかさん。');
  assert.ok(res5.includes('<ruby class="furigana-ruby">田中<rt>たなか</rt></ruby>'), 'Should align 田中 with たなか');
  console.log('✓ Test 5: Kana sentence alignment passed');

  console.log('\nAll furigana unit tests passed successfully! 🎉');
}

// In lib/furigana.js, we can also use createRequire for furigana_dict.json so Node executes it directly without json attribute requirement
run().catch(err => {
  console.error(err);
  process.exit(1);
});
