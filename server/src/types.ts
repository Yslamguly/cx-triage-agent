// ── Provider-agnostic types ──
// The orchestrator and tools code against these types only.
// Provider adapters translate to/from vendor-specific formats.

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, ToolParameter>;
    required: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  result: string;
}

export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface Message {
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface LLMResponse {
  content: string | null;
  toolCalls: ToolCall[];
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProvider {
  chat(messages: Message[], tools: ToolDefinition[]): Promise<LLMResponse>;
}

// ── Session types ──

export interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  handoff: HandoffSummary | null;
}

export interface HandoffSummary {
  reason: string;
  customerIntent: string;
  actionsTaken: string[];
  summary: string;
}
