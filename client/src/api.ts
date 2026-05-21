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

const API_BASE = "/api";

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
