import { storyPrompt, sentencesPrompt } from '../prompts.js';

export class GroqAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY;
    this.baseURL = "https://api.groq.com/openai/v1/chat/completions";
    // Primary models verified on Groq API
    this.models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
  }

  async callGroqWithFallback(prompt, systemInstruction = "You are a helpful Japanese teacher that strictly outputs JSON.") {
    if (!this.apiKey) {
      throw new Error("Missing GROQ_API_KEY. Configura tu clave en las variables de entorno.");
    }

    let lastError = null;

    for (const model of this.models) {
      try {
        const response = await fetch(this.baseURL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Groq Model ${model} failed with status ${response.status}:`, errorText);
          lastError = new Error(`Groq API Error (${model}): ${response.status} ${errorText}`);
          continue; // Try next model
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("Respuesta vacía del servicio de IA");
        }

        // Clean any stray markdown fencing if present
        let cleanJsonStr = content.trim();
        if (cleanJsonStr.startsWith("```json")) {
          cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanJsonStr.startsWith("```")) {
          cleanJsonStr = cleanJsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        return JSON.parse(cleanJsonStr);
      } catch (err) {
        console.warn(`Attempt with ${model} failed:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error("No se pudo generar el contenido con los modelos de IA disponibles.");
  }

  async generateStory(arg1, arg2, arg3) {
    const prompt = storyPrompt(arg1, arg2, arg3);
    return await this.callGroqWithFallback(prompt);
  }

  async generateSentences(options = {}) {
    const prompt = sentencesPrompt(options);
    return await this.callGroqWithFallback(prompt);
  }

  // Legacy method for backwards compatibility
  async generate(vocabList, level, theme) {
    return await this.generateStory(vocabList, level, theme);
  }
}
