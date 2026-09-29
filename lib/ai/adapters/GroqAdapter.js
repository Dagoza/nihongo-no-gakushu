import { storyPrompt } from '../prompts';

export class GroqAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY;
    this.baseURL = "https://api.groq.com/openai/v1/chat/completions";
  }

  async generate(vocabList, level, theme) {
    if (!this.apiKey) {
      throw new Error("Missing GROQ_API_KEY");
    }

    const prompt = storyPrompt(vocabList, level, theme);

    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Fast and free tier friendly
        messages: [
          { role: "system", content: "You are a helpful assistant that strictly outputs JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI output as JSON", content);
      throw new Error("AI did not return valid JSON");
    }
  }
}
