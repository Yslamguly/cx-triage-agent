// ── LLM Settings ──
export const LLM_PROVIDER = process.env.LLM_PROVIDER || "groq";
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// ── Orchestrator ──
export const MAX_TOOL_ITERATIONS = 10;
export const MAX_RESPONSE_TOKENS = 1024;

// ── Rate Limiting ──
export const RATE_LIMIT_MAX_REQUESTS = 10;
export const RATE_LIMIT_WINDOW_MS = 60_000;       // 1 minute
export const RATE_LIMIT_CLEANUP_MS = 5 * 60_000;  // 5 minutes

// ── Server ──
export const PORT = process.env.PORT || 3001;

// ── System Prompt ──
export const SYSTEM_PROMPT = `You are a helpful customer support agent for an e-commerce company. Your job is to assist customers with their orders and account questions.

You have access to the following tools:
- lookup_order: Look up order details by order ID or customer email
- get_account_info: Look up customer account information by email or customer ID
- handoff_to_human: Escalate to a human agent when needed

Guidelines:
1. Always try to identify the customer first (ask for email if not provided).
2. Use tools to look up real data — never make up order statuses or account details.
3. Be concise, friendly, and professional.
4. If the customer asks for something you cannot do (refunds, cancellations, plan changes, password resets), use handoff_to_human.
5. If the customer is very frustrated or angry, use handoff_to_human.
6. When escalating, always provide a thorough summary of what you've learned and tried so the human agent doesn't have to re-ask.`;
