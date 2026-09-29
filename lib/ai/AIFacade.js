import { GroqAdapter } from './adapters/GroqAdapter';

export class AIFacade {
  constructor(provider = 'groq') {
    this.provider = provider;
    
    // Aquí podemos expandir con OpenAIAdapter, etc.
    if (provider === 'groq') {
      this.adapter = new GroqAdapter();
    } else {
      // Fallback
      this.adapter = new GroqAdapter();
    }
  }

  async generateStory(vocabList, level, theme) {
    return await this.adapter.generate(vocabList, level, theme);
  }
}
