import { ChatMessage } from "../types";

const TOOL_LABELS: Record<string, string> = {
  lookup_order: "Order Lookup",
  get_account_info: "Account Info",
  handoff_to_human: "Human Handoff",
};

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      <div className="message-header">
        <span className="message-role">{isUser ? "You" : "Agent"}</span>
      </div>
      <div className="message-content">{message.content}</div>
      {message.toolsUsed && message.toolsUsed.length > 0 && (
        <div className="message-tools">
          {message.toolsUsed.map((tool, i) => (
            <span key={i} className="tool-badge">
              {TOOL_LABELS[tool] || tool}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
