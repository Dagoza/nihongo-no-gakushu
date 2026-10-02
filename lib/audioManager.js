/**
 * Advanced Japanese Hybrid Speech Synthesis & Native MP3 Audio Manager
 * 
 * Arquitectura de Audio en Cascada (Smart Audio Pipeline):
 * 1. Nivel 1: Clips de Audio MP3 Nativos (NHK World, Irodori, saludos fijos)
 * 2. Nivel 2: Síntesis Neuronal Serverless (/api/tts con Edge TTS ja-JP-NanamiNeural / ja-JP-KeitaNeural)
 * 3. Nivel 3: Caché estática HTTP/CDN y en memoria del servidor
 * 4. Nivel 4: Fallback resiliente offline con Web Speech API (window.speechSynthesis)
 */

class AudioManager {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.webSpeechVoice = null;
    this.voiceName = 'ja-JP-NanamiNeural'; // 'ja-JP-NanamiNeural' (fem) o 'ja-JP-KeitaNeural' (masc)
    this.rate = 1.0;
    this.playlist = [];
    this.currentIndex = 0;
    this.state = 'idle'; // 'playing', 'paused', 'idle'
    this.currentText = '';
    this.currentAudioUrl = null;
    this.currentTime = 0;
    this.duration = 0;
    this.listeners = new Set();
    this.selectedText = '';
    this.currentAudio = null; // Instancia activa de HTMLAudioElement
    this.engine = 'neural'; // 'neural' o 'webspeech'

    if (typeof window !== 'undefined') {
      this.initWebSpeech();
      this.setupSelectionListener();
    }
  }

  initWebSpeech() {
    if (!this.synth) return;

    const pickVoice = () => {
      const voices = this.synth.getVoices();
      const jpVoices = voices.filter(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
      if (jpVoices.length > 0) {
        this.webSpeechVoice = jpVoices.find(v => 
          v.name.includes('Kyoko') || 
          v.name.includes('Otoya') || 
          v.name.includes('Google') || 
          v.name.includes('Natural')
        ) || jpVoices[0];
      }
    };

    pickVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = pickVoice;
    }
  }

  setupSelectionListener() {
    if (typeof document === 'undefined') return;

    const checkSelection = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';
      if (text && text.length > 0) {
        if (this.selectedText !== text) {
          this.selectedText = text;
          this.notify();
        }
      } else if (this.selectedText) {
        this.selectedText = '';
        this.notify();
      }
    };

    document.addEventListener('selectionchange', checkSelection);
    document.addEventListener('touchend', () => setTimeout(checkSelection, 150));
    document.addEventListener('mouseup', () => setTimeout(checkSelection, 50));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn({
      state: this.state,
      currentText: this.currentText,
      currentAudioUrl: this.currentAudioUrl,
      currentTime: this.currentTime || 0,
      duration: this.duration || 0,
      rate: this.rate,
      currentIndex: this.currentIndex,
      playlistLength: this.playlist.length,
      selectedText: this.selectedText,
      voiceName: this.voiceName,
      engine: this.engine
    }));
  }

  setRate(newRate) {
    this.rate = newRate;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = newRate;
    }
    this.notify();
  }

  setVoice(newVoice) {
    this.voiceName = newVoice;
    this.notify();
  }

  setEngine(engineMode) {
    this.engine = engineMode === 'webspeech' ? 'webspeech' : 'neural';
    this.notify();
  }

  cleanText(text) {
    if (!text) return '';
    return String(text)
      .replace(/<rt>.*?<\/rt>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[「」『』]/g, '')
      .trim();
  }

  setPlaylist(items, startIndex = 0) {
    this.playlist = (items || []).map(it => {
      if (typeof it === 'string') return { text: it };
      return {
        text: it.japanese || it.text || it.kana || it.kanji || it.jp || '',
        desc: it.desc || it.translation || it.es || '',
        audioUrl: it.audioUrl || it.audio_url || it.audio_local || null,
        voice: it.voice || null
      };
    });
    this.currentIndex = Math.max(0, Math.min(startIndex, Math.max(0, this.playlist.length - 1)));
  }

  /**
   * Detiene cualquier reproducción activa (tanto audio HTML como síntesis Web Speech)
   */
  stopActivePlayback() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.onloadedmetadata = null;
      this.currentAudio.ondurationchange = null;
      this.currentAudio.oncanplay = null;
      this.currentAudio.ontimeupdate = null;
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio.onplay = null;
      this.currentAudio.onpause = null;
      this.currentAudio.removeAttribute('src');
      this.currentAudio.load();
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentTime = 0;
    this.duration = 0;
  }

  /**
   * Reproduce un archivo MP3 nativo (local o remoto)
   */
  playAudioUrl(url, text = '', options = {}) {
    this.stopActivePlayback();

    this.currentText = text || 'Audio nativo';
    this.currentAudioUrl = url;
    this.currentTime = 0;
    this.duration = 0;
    this.state = 'playing';
    this.notify();

    const audio = new Audio(url);
    this.currentAudio = audio;
    audio.playbackRate = options.rate || this.rate;

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        if (this.duration !== audio.duration) {
          this.duration = audio.duration;
          this.notify();
        }
      }
    };

    audio.onloadedmetadata = syncDuration;
    audio.ondurationchange = syncDuration;
    audio.oncanplay = syncDuration;

    audio.ontimeupdate = () => {
      this.currentTime = audio.currentTime || 0;
      if ((!this.duration || !Number.isFinite(this.duration)) && Number.isFinite(audio.duration) && audio.duration > 0) {
        this.duration = audio.duration;
      }
      this.notify();
    };

    audio.onplay = () => {
      if (this.state !== 'playing') {
        this.state = 'playing';
        this.notify();
      }
    };

    audio.onpause = () => {
      if (this.state === 'playing') {
        this.state = 'paused';
        this.notify();
      }
    };

    audio.onended = () => {
      this.state = 'idle';
      this.currentTime = this.duration || audio.duration || 0;
      this.notify();

      if (options.autoAdvance && this.currentIndex < this.playlist.length - 1) {
        this.next();
      }
    };

    audio.onerror = (e) => {
      console.warn('Audio URL playback error, falling back:', e);
      this.currentAudio = null;
      this.currentAudioUrl = null;
      // Si falla la URL nativa, intentamos reproducir el texto con el motor neuronal
      if (text) {
        this.speakNeural(text, options);
      } else {
        this.state = 'idle';
        this.notify();
      }
    };

    audio.play().catch(err => {
      if (err.name !== 'AbortError') {
        console.warn('Error al iniciar reproducción de audio nativo:', err);
        if (text) {
          this.speakNeural(text, options);
        } else {
          this.state = 'idle';
          this.notify();
        }
      }
    });
  }

  /**
   * Síntesis Neuronal de alta fidelidad vía /api/tts (Edge TTS ja-JP-NanamiNeural / KeitaNeural)
   */
  speakNeural(cleaned, options = {}) {
    this.stopActivePlayback();

    this.currentText = cleaned;
    this.currentAudioUrl = null;
    this.state = 'playing';
    this.notify();

    const voice = options.voice || this.voiceName;
    const rate = options.rate || this.rate;
    const ttsUrl = `/api/tts?text=${encodeURIComponent(cleaned)}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(rate)}`;

    const audio = new Audio(ttsUrl);
    this.currentAudio = audio;
    audio.playbackRate = rate;

    audio.onended = () => {
      this.state = 'idle';
      this.currentAudio = null;
      this.notify();

      if (options.autoAdvance && this.currentIndex < this.playlist.length - 1) {
        this.next();
      }
    };

    audio.onerror = (e) => {
      console.warn('Neural TTS error en /api/tts, ejecutando fallback a Web Speech API:', e);
      this.currentAudio = null;
      this.speakWebSpeech(cleaned, options);
    };

    audio.play().catch(err => {
      if (err.name !== 'AbortError') {
        console.warn('Error al reproducir stream de audio neuronal, recurriendo a Web Speech API:', err);
        this.currentAudio = null;
        this.speakWebSpeech(cleaned, options);
      }
    });
  }

  /**
   * Fallback local offline con Web Speech API
   */
  speakWebSpeech(cleaned, options = {}) {
    if (!this.synth) {
      this.state = 'idle';
      this.notify();
      return;
    }

    this.stopActivePlayback();

    this.currentText = cleaned;
    this.currentAudioUrl = null;
    this.state = 'playing';
    this.notify();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'ja-JP';
    utterance.rate = options.rate || this.rate;
    utterance.pitch = 1.0;

    if (this.webSpeechVoice) {
      utterance.voice = this.webSpeechVoice;
    }

    utterance.onend = () => {
      this.state = 'idle';
      this.notify();

      if (options.autoAdvance && this.currentIndex < this.playlist.length - 1) {
        this.next();
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Web Speech API error:', e);
      }
      this.state = 'idle';
      this.notify();
    };

    this.synth.speak(utterance);
  }

  /**
   * Método principal: Reproduce audio según la arquitectura en cascada
   * 1. Si se proporciona audioUrl -> Reproduce clip MP3 nativo
   * 2. Si el motor es 'neural' y hay conectividad -> Síntesis neuronal de alta fidelidad vía /api/tts
   * 3. Fallback -> Web Speech API
   */
  speak(text, options = {}) {
    const opts = typeof options === 'string' ? { desc: options } : (options || {});
    const cleaned = this.cleanText(text);
    if (!cleaned && !opts.audioUrl) return;

    // 1. Verificar si hay un clip de audio MP3 explícito
    if (opts.audioUrl) {
      this.playAudioUrl(opts.audioUrl, cleaned, opts);
      return;
    }

    // 2. Comprobar si el navegador está online y el motor preferido es neuronal
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (this.engine === 'neural' && isOnline) {
      this.speakNeural(cleaned, opts);
    } else {
      this.speakWebSpeech(cleaned, opts);
    }
  }

  playSelection() {
    if (!this.selectedText) return;
    this.speak(this.selectedText);
  }

  playClicked(text) {
    this.speak(text);
  }

  pause() {
    if (this.currentAudio && this.state === 'playing') {
      this.currentAudio.pause();
      this.state = 'paused';
      this.notify();
    } else if (this.synth && this.state === 'playing') {
      this.synth.pause();
      this.state = 'paused';
      this.notify();
    }
  }

  resume() {
    if (this.currentAudio && this.state === 'paused') {
      this.currentAudio.play().catch(err => console.warn('Error resuming audio:', err));
      this.state = 'playing';
      this.notify();
    } else if (this.currentAudio && this.state === 'idle') {
      if (this.currentAudio.ended || (this.duration > 0 && this.currentTime >= this.duration - 0.5)) {
        this.currentAudio.currentTime = 0;
        this.currentTime = 0;
      }
      this.currentAudio.play().then(() => {
        this.state = 'playing';
        this.notify();
      }).catch(err => console.warn('Error resuming audio:', err));
    } else if (this.synth && this.state === 'paused') {
      this.synth.resume();
      this.state = 'playing';
      this.notify();
    } else if (this.state === 'idle' && this.currentAudioUrl) {
      this.playAudioUrl(this.currentAudioUrl, this.currentText);
    } else if (this.state === 'idle' && this.currentText) {
      this.speak(this.currentText);
    }
  }

  /**
   * Salta a una posición específica en segundos
   */
  seek(time) {
    if (this.currentAudio) {
      const maxDuration = Number.isFinite(this.currentAudio.duration) && this.currentAudio.duration > 0
        ? this.currentAudio.duration
        : (this.duration || 0);
      const clampedTime = Math.max(0, maxDuration > 0 ? Math.min(time, maxDuration) : Math.max(0, time));
      try {
        this.currentAudio.currentTime = clampedTime;
        this.currentTime = clampedTime;
        this.notify();
      } catch (err) {
        console.warn('Error seeking audio:', err);
      }
    }
  }

  /**
   * Salta un número relativo de segundos (+adelante / -atrás)
   */
  seekRelative(delta) {
    if (this.currentAudio) {
      const cur = Number.isFinite(this.currentAudio.currentTime) ? this.currentAudio.currentTime : (this.currentTime || 0);
      this.seek(cur + delta);
    }
  }

  stop() {
    this.stopActivePlayback();
    this.state = 'idle';
    this.currentAudioUrl = null;
    this.currentTime = 0;
    this.duration = 0;
    this.notify();
  }

  next() {
    if (this.playlist.length === 0) return;
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex += 1;
      const item = this.playlist[this.currentIndex];
      this.speak(item.text, { 
        audioUrl: item.audioUrl, 
        voice: item.voice || undefined, 
        autoAdvance: true 
      });
    }
  }

  prev() {
    if (this.playlist.length === 0) return;
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      const item = this.playlist[this.currentIndex];
      this.speak(item.text, { 
        audioUrl: item.audioUrl, 
        voice: item.voice || undefined, 
        autoAdvance: true 
      });
    }
  }
}

export const audioManager = new AudioManager();
export default audioManager;
