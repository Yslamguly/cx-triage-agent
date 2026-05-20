import { LLMProvider } from "../types";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";

export function createProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || "openai";

  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    case "anthropic":
      return new AnthropicProvider();
    default:
      throw new Error(
        `Unknown LLM_PROVIDER "${provider}". Supported: openai, anthropic`
      );
  }
}
