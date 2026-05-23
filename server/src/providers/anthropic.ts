import Anthropic from "@anthropic-ai/sdk";
import {
  LLMProvider,
  LLMResponse,
  Message,
  ToolDefinition,
  ToolCall,
} from "../types";
import { ANTHROPIC_MODEL, MAX_RESPONSE_TOKENS } from "../config";

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.model = ANTHROPIC_MODEL;
  }

  async chat(messages: Message[], tools: ToolDefinition[]): Promise<LLMResponse> {
    const { system, anthropicMessages } = this.convertMessages(messages);
    const anthropicTools = this.convertTools(tools);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: MAX_RESPONSE_TOKENS,
      system: system || undefined,
      messages: anthropicMessages,
      tools: anthropicTools.length > 0 ? anthropicTools : undefined,
    });

    let content: string | null = null;
    const toolCalls: ToolCall[] = [];

    for (const block of response.content) {
      if (block.type === "text") {
        content = (content || "") + block.text;
      } else if (block.type === "tool_use") {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        });
      }
    }

    return {
      content,
      toolCalls,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  private convertMessages(messages: Message[]): {
    system: string | null;
    anthropicMessages: Anthropic.MessageParam[];
  } {
    let system: string | null = null;
    const anthropicMessages: Anthropic.MessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        system = msg.content;
      } else if (msg.role === "user") {
        anthropicMessages.push({ role: "user", content: msg.content });
      } else if (msg.role === "assistant") {
        const contentBlocks: Anthropic.ContentBlockParam[] = [];
        if (msg.content) {
          contentBlocks.push({ type: "text", text: msg.content });
        }
        if (msg.toolCalls) {
          for (const tc of msg.toolCalls) {
            contentBlocks.push({
              type: "tool_use",
              id: tc.id,
              name: tc.name,
              input: tc.arguments,
            });
          }
        }
        if (contentBlocks.length > 0) {
          anthropicMessages.push({ role: "assistant", content: contentBlocks });
        }
      } else if (msg.role === "tool" && msg.toolResults) {
        const resultBlocks: Anthropic.ToolResultBlockParam[] = msg.toolResults.map((tr) => ({
          type: "tool_result" as const,
          tool_use_id: tr.toolCallId,
          content: tr.result,
        }));
        anthropicMessages.push({ role: "user", content: resultBlocks });
      }
    }

    return { system, anthropicMessages };
  }

  private convertTools(tools: ToolDefinition[]): Anthropic.Tool[] {
    return tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: {
        type: "object" as const,
        properties: t.parameters.properties,
        required: t.parameters.required,
      },
    }));
  }
}
