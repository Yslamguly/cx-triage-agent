export interface ChatResponse {
  sessionId: string;
  reply: string;
  handoff: HandoffSummary | null;
  usage: { inputTokens: number; outputTokens: number };
  toolsUsed: string[];
}

export interface HandoffSummary {
  reason: string;
  customerIntent: string;
  actionsTaken: string[];
  summary: string;
}

// In dev: Vite proxies /api → localhost:3001 (see vite.config.ts)
// In prod: VITE_API_BASE is set to the Lambda API Gateway URL
const API_BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api`
  : "/api";

export async function sendMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}
