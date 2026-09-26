/**
 * Nihongo Master - Audio Speech Synthesis Manager
 * Uses browser Web Speech API with native Japanese ('ja-JP') voices.
 */

class AudioManager {
  constructor() {
    this.synth = window.speechSynthesis;
    this.japaneseVoice = null;
    this.initVoice();
  }

  initVoice() {
    if (!this.synth) return;

    const findVoice = () => {
      const voices = this.synth.getVoices();
      // Look for Japanese voices
      const jpVoices = voices.filter(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
      if (jpVoices.length > 0) {
        // Prefer natural voices like Kyoko or Siri or Google
        this.japaneseVoice = jpVoices.find(v => v.name.includes('Kyoko') || v.name.includes('Otoya') || v.name.includes('Google') || v.name.includes('Natural')) || jpVoices[0];
      }
    };

    findVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = findVoice;
    }
  }

  speak(text, rate = 0.9) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel ongoing speech
    this.synth.cancel();

    // Clean ruby text if passed as HTML or raw text
    const cleanText = text.replace(/<rt>.*?<\/rt>/g, '').replace(/<[^>]+>/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = rate; // slightly slower for language learners
    utterance.pitch = 1.0;

    if (this.japaneseVoice) {
      utterance.voice = this.japaneseVoice;
    }

    this.synth.speak(utterance);
  }
}

window.appAudio = new AudioManager();
