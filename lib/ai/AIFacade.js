import { GroqAdapter } from './adapters/GroqAdapter.js';

export class AIFacade {
  constructor(provider = 'groq') {
    this.provider = provider;
    
    // Aquí podemos expandir con OpenAIAdapter, AnthropicAdapter, etc.
    if (provider === 'groq') {
      this.adapter = new GroqAdapter();
    } else {
      // Fallback a Groq
      this.adapter = new GroqAdapter();
    }
  }

  async generateStory(arg1, arg2, arg3) {
    if (this.adapter.generateStory) {
      return await this.adapter.generateStory(arg1, arg2, arg3);
    }
    return await this.adapter.generate(arg1, arg2, arg3);
  }

  async generateSentences(options = {}) {
    if (this.adapter.generateSentences) {
      return await this.adapter.generateSentences(options);
    }
    throw new Error(`El proveedor ${this.provider} no soporta generación de oraciones.`);
  }

  // Legacy method for backwards compatibility
  async generate(vocabList, level, theme) {
    return await this.generateStory(vocabList, level, theme);
  }
}
