import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// In-memory cache for ultra-fast response on frequently requested Japanese terms
const memoryCache = new Map();
const MAX_CACHE_SIZE = 500;

function cleanJapaneseText(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/<rt>.*?<\/rt>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[「」『』]/g, '')
    .trim();
}

async function synthesizeText(text, voice = 'ja-JP-NanamiNeural', rateStr = '+0%') {
  const cacheKey = `${voice}_${rateStr}_${text}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate: rateStr });

  const buffer = await new Promise((resolve, reject) => {
    const chunks = [];
    audioStream.on('data', chunk => chunks.push(chunk));
    audioStream.on('end', () => resolve(Buffer.concat(chunks)));
    audioStream.on('error', err => reject(err));
  });

  // Keep cache bounded
  if (memoryCache.size >= MAX_CACHE_SIZE) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
  memoryCache.set(cacheKey, buffer);

  return buffer;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const textRaw = searchParams.get('text');
    const voice = searchParams.get('voice') || 'ja-JP-NanamiNeural';
    const rateParam = searchParams.get('rate') || '1.0';

    const cleaned = cleanJapaneseText(textRaw);
    if (!cleaned) {
      return new Response(JSON.stringify({ error: 'Parámetro "text" requerido y no vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (cleaned.length > 800) {
      return new Response(JSON.stringify({ error: 'El texto excede el límite de 800 caracteres' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Convert numeric rate (0.75, 0.9, 1.0, 1.25) to percentage string (+0%, -15%, etc.)
    const numRate = parseFloat(rateParam) || 1.0;
    const percentRate = Math.round((numRate - 1.0) * 100);
    const rateStr = `${percentRate >= 0 ? '+' : ''}${percentRate}%`;

    const audioBuffer = await synthesizeText(cleaned, voice, rateStr);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('API TTS Error:', error);
    return new Response(JSON.stringify({ error: 'Error al generar síntesis de voz neuronal', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, voice = 'ja-JP-NanamiNeural', rate = 1.0 } = body;

    const cleaned = cleanJapaneseText(text);
    if (!cleaned) {
      return new Response(JSON.stringify({ error: 'Campo "text" requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const numRate = parseFloat(rate) || 1.0;
    const percentRate = Math.round((numRate - 1.0) * 100);
    const rateStr = `${percentRate >= 0 ? '+' : ''}${percentRate}%`;

    const audioBuffer = await synthesizeText(cleaned, voice, rateStr);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('API TTS POST Error:', error);
    return new Response(JSON.stringify({ error: 'Error al generar síntesis de voz neuronal', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
