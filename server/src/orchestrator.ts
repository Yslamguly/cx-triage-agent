import { LLMProvider, Message, HandoffSummary } from "./types";
import { toolDefinitions } from "./tools/definitions";
import { executeTools } from "./tools/executor";
import { SYSTEM_PROMPT, MAX_TOOL_ITERATIONS } from "./config";

export interface OrchestratorResult {
  reply: string;
  handoff: HandoffSummary | null;
  totalInputTokens: number;
  totalOutputTokens: number;
  toolsUsed: string[];
}

export async function runOrchestrator(
  provider: LLMProvider,
  conversationHistory: Message[]
): Promise<{ result: OrchestratorResult; newMessages: Message[] }> {
  const messages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
  ];

  const newMessages: Message[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const toolsUsed: string[] = [];
  let handoff: HandoffSummary | null = null;

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await provider.chat(messages, toolDefinitions);
    totalInputTokens += response.usage.inputTokens;
    totalOutputTokens += response.usage.outputTokens;

    if (response.toolCalls.length === 0) {
      const reply = response.content || "I'm sorry, I couldn't generate a response.";
      const assistantMsg: Message = { role: "assistant", content: reply };
      newMessages.push(assistantMsg);

      return {
        result: { reply, handoff, totalInputTokens, totalOutputTokens, toolsUsed },
        newMessages,
      };
    }

    const assistantMsg: Message = {
      role: "assistant",
      content: response.content || "",
      toolCalls: response.toolCalls,
    };
    messages.push(assistantMsg);
    newMessages.push(assistantMsg);

    const { results, handoff: newHandoff } = executeTools(response.toolCalls);
    for (const tc of response.toolCalls) {
      toolsUsed.push(tc.name);
    }

    if (newHandoff) {
      handoff = newHandoff;
    }

    const toolMsg: Message = {
      role: "tool",
      content: results.map((r) => `[${r.name}]: ${r.result}`).join("\n"),
      toolResults: results,
    };
    messages.push(toolMsg);
    newMessages.push(toolMsg);
  }

  const fallback = "I apologize, but I'm having trouble processing your request. Let me connect you with a human agent.";
  newMessages.push({ role: "assistant", content: fallback });

  return {
    result: {
      reply: fallback,
      handoff: handoff || {
        reason: "Max tool iterations reached",
        customerIntent: "unknown",
        actionsTaken: toolsUsed,
        summary: "Agent exceeded maximum processing steps.",
      },
      totalInputTokens,
      totalOutputTokens,
      toolsUsed,
    },
    newMessages,
  };
}
