import { parseJsonObject } from "../utils/json.js";

export class OpenAICompatibleClient {
  constructor(config) {
    this.config = config;
  }

  async chatJson({ agentName, system, user, temperature }) {
    if (this.config.offline) {
      throw new Error("Offline mode is active; API calls are disabled.");
    }

    if (!this.config.apiKey) {
      throw new Error(
        "Missing LLM_API_KEY or OPENAI_API_KEY. Use --offline for a local demo, or configure .env values in your shell."
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    const body = {
      model: this.config.model,
      temperature: temperature ?? this.config.temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    };

    if (this.config.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          "X-Agent-Name": agentName || "InfinityVueAgent"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `LLM API request failed with ${response.status}: ${text.slice(0, 1000)}`
        );
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("LLM API returned no message content.");
      }

      return parseJsonObject(content);
    } finally {
      clearTimeout(timeout);
    }
  }
}
