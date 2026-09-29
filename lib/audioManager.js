/**
 * Advanced Japanese Speech Synthesis Audio Manager
 * Supports:
 * - Play / Pause / Resume / Stop
 * - Next / Prev in playlist
 * - Click-to-speak on words / sentences
 * - Speak user-highlighted selection
 * - Speed rate adjustment (0.75x, 0.9x, 1x, 1.25x)
 */

class AudioManager {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voice = null;
    this.rate = 0.9;
    this.playlist = [];
    this.currentIndex = 0;
    this.state = 'idle'; // 'playing', 'paused', 'idle'
    this.currentText = '';
    this.listeners = new Set();
    this.selectedText = '';

    if (typeof window !== 'undefined') {
      this.initVoice();
      this.setupSelectionListener();
    }
  }

  initVoice() {
    if (!this.synth) return;

    const pickVoice = () => {
      const voices = this.synth.getVoices();
      const jpVoices = voices.filter(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
      if (jpVoices.length > 0) {
        this.voice = jpVoices.find(v => v.name.includes('Kyoko') || v.name.includes('Otoya') || v.name.includes('Google') || v.name.includes('Natural')) || jpVoices[0];
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
    
    // Fallback for mobile devices (iOS/Android) where selectionchange might be unreliable
    document.addEventListener('touchend', () => {
      setTimeout(checkSelection, 150);
    });
    
    document.addEventListener('mouseup', () => {
      setTimeout(checkSelection, 50);
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn({
      state: this.state,
      currentText: this.currentText,
      rate: this.rate,
      currentIndex: this.currentIndex,
      playlistLength: this.playlist.length,
      selectedText: this.selectedText
    }));
  }

  setRate(newRate) {
    this.rate = newRate;
    if (this.state === 'playing') {
      // Re-trigger with new rate from current text
      this.speak(this.currentText);
    } else {
      this.notify();
    }
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/<rt>.*?<\/rt>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[「」『』]/g, '')
      .trim();
  }

  setPlaylist(items, startIndex = 0) {
    this.playlist = items.map(it => typeof it === 'string' ? it : (it.japanese || it.text || it.kana || it.kanji));
    this.currentIndex = Math.max(0, Math.min(startIndex, this.playlist.length - 1));
  }

  speak(text, options = {}) {
    if (!this.synth) return;

    const cleaned = this.cleanText(text);
    if (!cleaned) return;

    this.synth.cancel();

    this.currentText = cleaned;
    this.state = 'playing';
    this.notify();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'ja-JP';
    utterance.rate = options.rate || this.rate;
    utterance.pitch = 1.0;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.onend = () => {
      this.state = 'idle';
      this.notify();

      // If playing a playlist, advance automatically if requested
      if (options.autoAdvance && this.currentIndex < this.playlist.length - 1) {
        this.next();
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis error:', e);
      }
      this.state = 'idle';
      this.notify();
    };

    this.synth.speak(utterance);
  }

  playSelection() {
    if (!this.selectedText) return;
    this.speak(this.selectedText);
  }

  playClicked(text) {
    this.speak(text);
  }

  pause() {
    if (!this.synth) return;
    if (this.state === 'playing') {
      this.synth.pause();
      this.state = 'paused';
      this.notify();
    }
  }

  resume() {
    if (!this.synth) return;
    if (this.state === 'paused') {
      this.synth.resume();
      this.state = 'playing';
      this.notify();
    } else if (this.state === 'idle' && this.currentText) {
      this.speak(this.currentText);
    }
  }

  stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.state = 'idle';
    this.notify();
  }

  next() {
    if (this.playlist.length === 0) return;
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex += 1;
      this.speak(this.playlist[this.currentIndex]);
    }
  }

  prev() {
    if (this.playlist.length === 0) return;
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.speak(this.playlist[this.currentIndex]);
    }
  }
}

export const audioManager = new AudioManager();
export default audioManager;
