import { Router, Request, Response } from "express";
import { LLMProvider } from "../types";
import { createProvider } from "../providers";
import { runOrchestrator } from "../orchestrator";
import { getOrCreateSession, getSession } from "../sessions";
import { Message } from "../types";

export const chatRouter = Router();

let provider: LLMProvider;
function getProvider(): LLMProvider {
  if (!provider) provider = createProvider();
  return provider;
}

chatRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body as {
      sessionId?: string;
      message: string;
    };

    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const session = getOrCreateSession(sessionId);

    if (session.handoff) {
      res.status(400).json({
        error: "This session has been escalated to a human agent.",
        handoff: session.handoff,
      });
      return;
    }

    const userMsg: Message = { role: "user", content: message };
    session.messages.push(userMsg);

    const { result, newMessages } = await runOrchestrator(
      getProvider(),
      session.messages
    );

    session.messages.push(...newMessages);
    if (result.handoff) {
      session.handoff = result.handoff;
    }

    res.json({
      sessionId: session.id,
      reply: result.reply,
      handoff: result.handoff,
      usage: {
        inputTokens: result.totalInputTokens,
        outputTokens: result.totalOutputTokens,
      },
      toolsUsed: result.toolsUsed,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

chatRouter.get("/session/:id", (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const session = getSession(id);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const visibleMessages = session.messages.filter(
    (m) => m.role === "user" || (m.role === "assistant" && m.content)
  );

  res.json({
    sessionId: session.id,
    messages: visibleMessages.map((m) => ({
      role: m.role,
      content: m.content,
      toolCalls: m.toolCalls?.map((tc) => tc.name),
    })),
    handoff: session.handoff,
    createdAt: session.createdAt,
  });
});
