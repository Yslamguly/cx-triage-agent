export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
  timestamp: Date;
}

export interface HandoffInfo {
  reason: string;
  customerIntent: string;
  actionsTaken: string[];
  summary: string;
}
