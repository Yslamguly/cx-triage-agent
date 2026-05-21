import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api";
import { ChatMessage, HandoffInfo } from "../types";
import { MessageBubble } from "./MessageBubble";
import { ToolActivity } from "./ToolActivity";
import { HandoffBanner } from "./HandoffBanner";
import { ChatInput } from "./ChatInput";

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [handoff, setHandoff] = useState<HandoffInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    setActiveTools(["lookup_order", "get_account_info"]);

    try {
      const res = await sendMessage(text, sessionId);
      setSessionId(res.sessionId);
      setActiveTools([]);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.reply,
        toolsUsed: res.toolsUsed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (res.handoff) {
        setHandoff(res.handoff);
      }
    } catch (err) {
      setActiveTools([]);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setHandoff(null);
    setError(null);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-left">
          <h1>CX Triage Agent</h1>
          <span className="chat-subtitle">AI-powered customer support</span>
        </div>
        <button className="new-chat-btn" onClick={handleNewChat}>
          New Chat
        </button>
      </div>

      <div className="message-list">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>👋 Hi! I'm your customer support agent.</p>
            <p>I can help you with order status, account information, and more.</p>
            <p>Try: <em>"What's the status of my order? My email is alice@example.com"</em></p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && <ToolActivity activeTools={activeTools} />}

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        {handoff && <HandoffBanner handoff={handoff} />}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={loading || !!handoff} />
    </div>
  );
}
