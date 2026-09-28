import { NextResponse } from 'next/server';

// Memoria caché simple en servidor para búsquedas repetidas
const searchCache = new Map();

async function verifyVideoCandidate(vid) {
  // 1. Verificación OBLIGATORIA oEmbed:
  // Si la API oEmbed devuelve 401 o 403, el video tiene inserción externa deshabilitada por el creador -> SE DESCARTA
  let oembedData = null;
  try {
    const oeRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 3600 }
      }
    );

    if (!oeRes.ok || oeRes.status === 401 || oeRes.status === 403) {
      return null;
    }
    oembedData = await oeRes.json();
  } catch (e) {
    return null;
  }

  // 2. Verificación OBLIGATORIA InnerTube:
  // - Reproducibilidad (playabilityStatus)
  // - Presencia de pistas de subtítulos (captionTracks)
  try {
    const innertubeRes = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)'
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
        videoId: vid
      }),
      next: { revalidate: 3600 }
    });

    if (!innertubeRes.ok) return null;

    const itData = await innertubeRes.json();

    // Comprobar estado de reproducción
    const playStatus = itData?.playabilityStatus;
    if (playStatus && playStatus.status !== 'OK') {
      return null;
    }
    if (playStatus && playStatus.playableInEmbed === false) {
      return null;
    }

    // Comprobar presencia de pistas de transcripción
    const captionTracks = itData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    if (!captionTracks.length) {
      return null;
    }

    const spokenTrack = captionTracks.find(t => t.kind === 'asr') || captionTracks[0];
    const spokenLang = spokenTrack?.languageCode || 'ja';
    const spokenLangName = spokenTrack?.name?.simpleText || spokenLang.toUpperCase();

    const durationSec = parseInt(itData?.videoDetails?.lengthSeconds || 0, 10);
    const mins = Math.floor(durationSec / 60);
    const secs = (durationSec % 60).toString().padStart(2, '0');
    const durationFormatted = durationSec > 0 ? `${mins}:${secs}` : '--:--';

    return {
      id: `yt_search_${vid}`,
      youtubeId: vid,
      title: oembedData?.title || itData?.videoDetails?.title || 'Video educativo',
      originalTitle: itData?.videoDetails?.title || oembedData?.title || '',
      channelTitle: oembedData?.author_name || itData?.videoDetails?.author || 'YouTube',
      channelUrl: oembedData?.author_url || `https://www.youtube.com/watch?v=${vid}`,
      duration: durationFormatted,
      thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      description: `Video con transcripción completa e inserción verificada para aprender japonés.`,
      level: 'N5',
      category: 'search',
      tags: ['Búsqueda', spokenLang.toUpperCase(), 'Verificado 100%'],
      embeddableVerified: true,
      hasCompleteTranscript: true,
      spokenLanguage: spokenLang,
      spokenLanguageName: spokenLangName,
      availableLanguages: captionTracks.map(t => ({
        code: t.languageCode,
        name: t.name?.simpleText || t.languageCode,
        isOriginal: t.kind === 'asr'
      }))
    };
  } catch (err) {
    return null;
  }
}

async function handleSearch(rawQuery, maxResults = 8) {
  const cacheKey = rawQuery.toLowerCase();
  if (searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 1000 * 60 * 30) { // 30 min
      return {
        query: rawQuery,
        fromCache: true,
        resultsCount: cached.results.length,
        results: cached.results
      };
    }
  }

  // Construir query optimizada para contenido educativo en japonés con subtítulos
  const enhancedQuery = `${rawQuery} Japanese subtitles`;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(enhancedQuery)}`;

  const pageRes = await fetch(searchUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'es,en,ja'
    },
    next: { revalidate: 1800 }
  });

  if (!pageRes.ok) {
    throw new Error('No se pudo contactar con los servidores de búsqueda.');
  }

  const pageHtml = await pageRes.text();

  // Extraer IDs únicos de video usando ambas expresiones
  const matches1 = pageHtml.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/g) || [];
  const matches2 = pageHtml.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g) || [];
  
  const candidateIds = Array.from(
    new Set([
      ...matches1.map(m => m.replace('/watch?v=', '')),
      ...matches2.map(m => m.replace('"videoId":"', '').replace('"', ''))
    ])
  );

  const verifiedResults = [];

  // Verificar en lotes concurrentes de 4 para no saturar pero responder rápido
  const batchSize = 4;
  for (let i = 0; i < candidateIds.length && verifiedResults.length < maxResults; i += batchSize) {
    const batch = candidateIds.slice(i, i + batchSize);
    const checked = await Promise.all(batch.map(vid => verifyVideoCandidate(vid)));
    for (const item of checked) {
      if (item && verifiedResults.length < maxResults) {
        verifiedResults.push(item);
      }
    }
  }

  // Guardar en caché
  searchCache.set(cacheKey, {
    timestamp: Date.now(),
    results: verifiedResults
  });

  return {
    query: rawQuery,
    fromCache: false,
    resultsCount: verifiedResults.length,
    results: verifiedResults
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawQuery = (body.query || body.topic || '').trim();
    const maxResults = Math.min(body.maxResults || 8, 12);

    if (!rawQuery) {
      return NextResponse.json(
        { error: 'Término de búsqueda o tema requerido.' },
        { status: 400 }
      );
    }

    const data = await handleSearch(rawQuery, maxResults);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error en búsqueda de videos verificados:', err);
    return NextResponse.json(
      { error: 'Error procesando la búsqueda de videos: ' + (err.message || '') },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = (searchParams.get('q') || searchParams.get('topic') || searchParams.get('query') || '').trim();
    const maxResults = Math.min(parseInt(searchParams.get('maxResults') || '8', 10), 12);

    if (!rawQuery) {
      return NextResponse.json(
        { error: 'Término de búsqueda o tema requerido.' },
        { status: 400 }
      );
    }

    const data = await handleSearch(rawQuery, maxResults);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error en búsqueda GET de videos verificados:', err);
    return NextResponse.json(
      { error: 'Error procesando la búsqueda de videos: ' + (err.message || '') },
      { status: 500 }
    );
  }
}
