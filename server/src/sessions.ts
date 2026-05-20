import { v4 as uuid } from "uuid";
import { Session } from "./types";

const sessions = new Map<string, Session>();

export function getOrCreateSession(sessionId?: string): Session {
  if (sessionId && sessions.has(sessionId)) {
    return sessions.get(sessionId)!;
  }

  const session: Session = {
    id: sessionId || uuid(),
    messages: [],
    createdAt: new Date(),
    handoff: null,
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): Session | null {
  return sessions.get(sessionId) ?? null;
}
