import { NextResponse } from 'next/server';

function extractVideoId(input) {
  if (!input) return null;
  const str = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

function decodeHtmlEntities(text = '') {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

function parseXmlCues(xml) {
  const cues = [];
  let cid = 1;

  // Formato srv3: <p t="ms" d="ms"><s>palabra</s>...</p>
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = pRegex.exec(xml)) !== null) {
    const startMs = parseInt(match[1], 10);
    const durMs = parseInt(match[2], 10);
    const inner = match[3];

    let text = '';
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch;
    while ((sMatch = sRegex.exec(inner)) !== null) {
      text += sMatch[1];
    }
    if (!text) {
      text = inner.replace(/<[^>]+>/g, '');
    }
    text = decodeHtmlEntities(text).trim();

    if (text && text !== '\n') {
      cues.push({
        id: cid++,
        start: parseFloat((startMs / 1000).toFixed(2)),
        duration: parseFloat((durMs / 1000).toFixed(2)),
        text,
        translation_es: ''
      });
    }
  }

  if (cues.length > 0) return cues;

  // Formato clásico: <text start="s" dur="s">contenido</text>
  const textRegex = /<text\s+start="([^"]*)"\s+dur="([^"]*)"[^>]*>([^<]*)<\/text>/g;
  while ((match = textRegex.exec(xml)) !== null) {
    const text = decodeHtmlEntities(match[3]).trim();
    if (text && text !== '\n') {
      cues.push({
        id: cid++,
        start: parseFloat(parseFloat(match[1]).toFixed(2)),
        duration: parseFloat(parseFloat(match[2] || 2).toFixed(2)),
        text,
        translation_es: ''
      });
    }
  }

  return cues;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const videoId = extractVideoId(body.url || body.videoId);
    const requestedLang = body.lang || null;

    if (!videoId) {
      return NextResponse.json(
        { error: 'ID o URL de video de YouTube inválido.' },
        { status: 400 }
      );
    }

    // 1. Verificar embeddability mediante oEmbed (pero no bloquear la transcripción si está restringido)
    let isEmbeddable = true;
    let oembedTitle = '';
    let oembedAuthor = '';

    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } }
      );
      if (oembedRes.status === 401 || oembedRes.status === 403) {
        isEmbeddable = false;
      } else if (oembedRes.ok) {
        const oeData = await oembedRes.json();
        oembedTitle = oeData.title || '';
        oembedAuthor = oeData.author_name || '';
      }
    } catch (e) {
      // Ignorar fallo de oEmbed
    }

    // 2. Obtener pistas de subtítulos usando InnerTube Android API (alta fiabilidad sin bloqueos de IP)
    let captionTracks = [];
    let videoTitle = oembedTitle;
    let videoAuthor = oembedAuthor;

    try {
      const innertubeRes = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)'
        },
        body: JSON.stringify({
          context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38' } },
          videoId: videoId
        }),
        next: { revalidate: 3600 }
      });

      if (innertubeRes.ok) {
        const itData = await innertubeRes.json();
        captionTracks = itData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
        if (!videoTitle) videoTitle = itData?.videoDetails?.title || '';
        if (!videoAuthor) videoAuthor = itData?.videoDetails?.author || '';
      }
    } catch (itErr) {
      console.warn('Innertube fetch error:', itErr);
    }

    // Fallback: Scrape HTML de la página de YouTube
    if (!captionTracks.length) {
      try {
        const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'es,en,ja'
          },
          next: { revalidate: 3600 }
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
          if (match) {
            const pData = JSON.parse(match[1]);
            captionTracks = pData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
            if (!videoTitle) videoTitle = pData?.videoDetails?.title || '';
            if (!videoAuthor) videoAuthor = pData?.videoDetails?.author || '';
          }
        }
      } catch (pageErr) {
        console.warn('HTML scrape error:', pageErr);
      }
    }

    if (!captionTracks.length) {
      return NextResponse.json({
        videoId,
        title: videoTitle || 'Video de YouTube',
        author: videoAuthor || 'Canal de YouTube',
        isEmbeddable,
        hasCaptions: false,
        cuesCount: 0,
        cues: [],
        message: 'Este video no tiene subtítulos ni transcripciones públicas en YouTube.'
      });
    }

    // 3. Detectar idioma hablado original y seleccionar pista correspondiente
    // Las pistas 'asr' (Automatic Speech Recognition) se generan en el idioma que se habla en el audio (en, es o ja)
    const asrTrack = captionTracks.find(t => t.kind === 'asr');
    const spokenLangCode = asrTrack?.languageCode || captionTracks[0]?.languageCode || 'ja';

    // Determinar la pista a descargar:
    // Si el usuario pidió un idioma específico, usarlo; sino usar el idioma hablado original
    let targetTrack = null;
    if (requestedLang) {
      targetTrack = captionTracks.find(t => t.languageCode === requestedLang);
    }
    if (!targetTrack && asrTrack) {
      targetTrack = asrTrack;
    }
    if (!targetTrack) {
      // Priorizar el primer idioma disponible (inglés, español o japonés según el video)
      targetTrack = captionTracks.find(t => ['ja', 'en', 'es'].includes(t.languageCode)) || captionTracks[0];
    }

    // Descargar XML de subtítulos
    const transcriptUrl = targetTrack.baseUrl;
    const subRes = await fetch(transcriptUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!subRes.ok) {
      return NextResponse.json(
        { error: 'No se pudo descargar el archivo de subtítulos de YouTube.' },
        { status: 502 }
      );
    }

    const xmlText = await subRes.text();
    const cues = parseXmlCues(xmlText);

    // Si el idioma principal no es español y hay una pista en español disponible, descargarla para traducir
    const esTrack = captionTracks.find(t => t.languageCode === 'es' && t !== targetTrack);
    if (esTrack && targetTrack.languageCode !== 'es') {
      try {
        const esRes = await fetch(esTrack.baseUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (esRes.ok) {
          const esXml = await esRes.text();
          const esCues = parseXmlCues(esXml);
          if (esCues.length) {
            for (const cue of cues) {
              const matchEs = esCues.find(ec => Math.abs(ec.start - cue.start) <= 3.0);
              if (matchEs) {
                cue.translation_es = matchEs.text;
              }
            }
          }
        }
      } catch (esErr) {
        console.warn('Error fetching secondary Spanish track:', esErr);
      }
    }

    // Lista de idiomas disponibles para permitir cambiar de pista en el reproductor
    const availableLanguages = captionTracks.map(t => ({
      code: t.languageCode,
      name: t.name?.simpleText || t.languageCode,
      isOriginal: t.kind === 'asr' || t.languageCode === spokenLangCode
    }));

    return NextResponse.json({
      videoId,
      title: videoTitle || 'Video de YouTube',
      author: videoAuthor || 'Canal de YouTube',
      isEmbeddable,
      spokenLanguage: targetTrack.languageCode,
      spokenLanguageName: targetTrack.name?.simpleText || targetTrack.languageCode,
      availableLanguages,
      cuesCount: cues.length,
      cues
    });

  } catch (err) {
    console.error('Error fetching YouTube transcript:', err);
    return NextResponse.json(
      { error: 'Error procesando la transcripción del video: ' + (err.message || '') },
      { status: 500 }
    );
  }
}
