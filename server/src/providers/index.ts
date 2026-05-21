import { LLMProvider } from "../types";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";

export function createProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || "openai";

  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    case "anthropic":
      return new AnthropicProvider();
    case "gemini":
      return new GeminiProvider();
    case "groq":
      return new GroqProvider();
    default:
      throw new Error(
        `Unknown LLM_PROVIDER "${provider}". Supported: openai, anthropic, gemini, groq`
      );
  }
}
