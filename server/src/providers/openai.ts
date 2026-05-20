import OpenAI from "openai";
import {
  LLMProvider,
  LLMResponse,
  Message,
  ToolDefinition,
  ToolCall,
} from "../types";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private readonly model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = process.env.OPENAI_MODEL || "gpt-4o";
  }

  async chat(messages: Message[], tools: ToolDefinition[]): Promise<LLMResponse> {
    const openaiMessages = this.convertMessages(messages);
    const openaiTools = this.convertTools(tools);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages,
      tools: openaiTools.length > 0 ? openaiTools : undefined,
    });

    const choice = response.choices[0];
    const toolCalls: ToolCall[] = (choice.message.tool_calls || []).map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }));

    return {
      content: choice.message.content,
      toolCalls,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  private convertMessages(messages: Message[]): OpenAI.ChatCompletionMessageParam[] {
    const result: OpenAI.ChatCompletionMessageParam[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        result.push({ role: "system", content: msg.content });
      } else if (msg.role === "user") {
        result.push({ role: "user", content: msg.content });
      } else if (msg.role === "assistant") {
        const assistantMsg: OpenAI.ChatCompletionAssistantMessageParam = {
          role: "assistant",
          content: msg.content || null,
        };
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          assistantMsg.tool_calls = msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: "function" as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          }));
        }
        result.push(assistantMsg);
      } else if (msg.role === "tool" && msg.toolResults) {
        for (const tr of msg.toolResults) {
          result.push({
            role: "tool",
            tool_call_id: tr.toolCallId,
            content: tr.result,
          });
        }
      }
    }

    return result;
  }

  private convertTools(tools: ToolDefinition[]): OpenAI.ChatCompletionTool[] {
    return tools.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters as unknown as Record<string, unknown>,
      },
    }));
  }
}
