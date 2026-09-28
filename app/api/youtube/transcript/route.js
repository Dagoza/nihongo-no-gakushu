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

export async function POST(request) {
  try {
    const body = await request.json();
    const videoId = extractVideoId(body.url || body.videoId);

    if (!videoId) {
      return NextResponse.json(
        { error: 'ID o URL de video de YouTube inválido.' },
        { status: 400 }
      );
    }

    // 1. Verificar si el propietario permite la inserción externa mediante la API oEmbed
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } }
      );

      if (oembedRes.status === 401 || oembedRes.status === 403) {
        return NextResponse.json(
          {
            error:
              'El propietario de este video ha inhabilitado su reproducción en sitios web externos (Restricción de YouTube). Por favor intenta con otro video.',
            isEmbeddable: false,
            videoId
          },
          { status: 403 }
        );
      }
    } catch (oeErr) {
      console.warn('oEmbed check skipped:', oeErr);
    }

    // Intentar obtener la página de YouTube para extraer la pista de subtítulos
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,es;q=0.7',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'No se pudo contactar con YouTube para este video.' },
        { status: 502 }
      );
    }

    const html = await response.text();
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);

    if (!playerResponseMatch) {
      return NextResponse.json(
        { error: 'No se encontraron metadatos del reproductor de YouTube.' },
        { status: 404 }
      );
    }

    const playerResponse = JSON.parse(playerResponseMatch[1]);
    const captionTracks =
      playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

    if (!captionTracks.length) {
      return NextResponse.json(
        { 
          error: 'Este video no tiene subtítulos o transcripciones públicas disponibles en YouTube.',
          hasCaptions: false 
        },
        { status: 404 }
      );
    }

    // Priorizar pistas en japonés (ja, ja-JP) o automáticas, o en su defecto la primera disponible
    let targetTrack = captionTracks.find(t => t.languageCode === 'ja') ||
                      captionTracks.find(t => t.languageCode?.startsWith('ja')) ||
                      captionTracks.find(t => t.vssId?.includes('.ja')) ||
                      captionTracks[0];

    const transcriptUrl = targetTrack.baseUrl + '&fmt=json3';
    const transcriptRes = await fetch(transcriptUrl);
    
    if (!transcriptRes.ok) {
      return NextResponse.json(
        { error: 'No se pudo descargar el archivo de subtítulos de YouTube.' },
        { status: 502 }
      );
    }

    const transcriptJson = await transcriptRes.json();
    const events = transcriptJson.events || [];

    const cues = [];
    let cueId = 1;

    for (const evt of events) {
      if (!evt.segs || !evt.segs.length) continue;
      const text = evt.segs.map(s => s.utf8 || '').join('').trim();
      if (!text || text === '\n') continue;

      const startMs = evt.tStartMs || 0;
      const durationMs = evt.dDurationMs || 2000;

      cues.push({
        id: cueId++,
        start: parseFloat((startMs / 1000).toFixed(2)),
        duration: parseFloat((durationMs / 1000).toFixed(2)),
        text,
        translation_es: '' // Se traducirá opcionalmente o se analizará
      });
    }

    return NextResponse.json({
      videoId,
      title: playerResponse?.videoDetails?.title || 'Video de YouTube',
      author: playerResponse?.videoDetails?.author || 'Canal de YouTube',
      languageCode: targetTrack.languageCode,
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
