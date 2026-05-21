export interface TestCase {
  id: string;
  category: string;
  description: string;
  userMessage: string;
  expectedIntent: string;
  expectedTools: string[];
  expectedHandoff: boolean;
}

export const testCases: TestCase[] = [
  // ── Order lookups ──
  {
    id: "order-01",
    category: "order-lookup",
    description: "Look up orders by customer email",
    userMessage:
      "Can you check on my orders? My email is alice@example.com",
    expectedIntent: "order_status",
    expectedTools: ["lookup_order"],
    expectedHandoff: false,
  },
  {
    id: "order-02",
    category: "order-lookup",
    description: "Look up a specific order by ID",
    userMessage: "What's the status of order ORD-1003?",
    expectedIntent: "order_status",
    expectedTools: ["lookup_order"],
    expectedHandoff: false,
  },
  {
    id: "order-03",
    category: "order-lookup",
    description: "Unknown email — no customer found",
    userMessage:
      "Where is my package? My email is unknown@nowhere.com",
    expectedIntent: "order_status",
    expectedTools: ["lookup_order"],
    expectedHandoff: false,
  },
  {
    id: "order-04",
    category: "order-lookup",
    description: "Unknown order ID",
    userMessage: "Can I get an update on order ORD-9999?",
    expectedIntent: "order_status",
    expectedTools: ["lookup_order"],
    expectedHandoff: false,
  },

  // ── Account queries ──
  {
    id: "account-01",
    category: "account-query",
    description: "Active account — check plan and status",
    userMessage:
      "What plan am I on? My email is carol@example.com",
    expectedIntent: "account_info",
    expectedTools: ["get_account_info"],
    expectedHandoff: false,
  },
  {
    id: "account-02",
    category: "account-query",
    description: "Suspended account — should surface status",
    userMessage:
      "Why can't I log in? My email is dan@example.com",
    expectedIntent: "account_info",
    expectedTools: ["get_account_info"],
    expectedHandoff: false,
  },
  {
    id: "account-03",
    category: "account-query",
    description: "Churned account",
    userMessage:
      "I want to check my account. Email is eve@example.com",
    expectedIntent: "account_info",
    expectedTools: ["get_account_info"],
    expectedHandoff: false,
  },

  // ── Escalation triggers ──
  {
    id: "escalate-01",
    category: "escalation",
    description: "Refund request — should handoff",
    userMessage:
      "I need a refund for order ORD-1002. The laptop stand arrived broken.",
    expectedIntent: "refund_request",
    expectedTools: ["handoff_to_human"],
    expectedHandoff: true,
  },
  {
    id: "escalate-02",
    category: "escalation",
    description: "Very angry customer — should handoff",
    userMessage:
      "This is UNACCEPTABLE! I've been waiting 3 weeks for my order and nobody will help me! I want to speak to a manager RIGHT NOW!",
    expectedIntent: "complaint",
    expectedTools: ["handoff_to_human"],
    expectedHandoff: true,
  },
  {
    id: "escalate-03",
    category: "escalation",
    description: "Password reset — out of scope, should handoff",
    userMessage:
      "I forgot my password and need to reset it. My email is bob@example.com",
    expectedIntent: "password_reset",
    expectedTools: ["handoff_to_human"],
    expectedHandoff: true,
  },

  // ── Multi-tool chains ──
  {
    id: "multi-01",
    category: "multi-tool",
    description: "Order + account info in one request",
    userMessage:
      "I'd like to know my account plan and also check my order status. Email: alice@example.com",
    expectedIntent: "order_status+account_info",
    expectedTools: ["lookup_order", "get_account_info"],
    expectedHandoff: false,
  },
  {
    id: "multi-02",
    category: "multi-tool",
    description: "Order lookup then escalation for cancelled order",
    userMessage:
      "I want to reactivate my cancelled order ORD-1006. My email is dan@example.com",
    expectedIntent: "order_reactivation",
    expectedTools: ["lookup_order", "handoff_to_human"],
    expectedHandoff: true,
  },
  {
    id: "multi-03",
    category: "multi-tool",
    description: "Account check + refund request for delivered order",
    userMessage:
      "My email is carol@example.com. I want a refund for order ORD-1004, the server license doesn't work.",
    expectedIntent: "refund_request",
    expectedTools: ["lookup_order", "handoff_to_human"],
    expectedHandoff: true,
  },

  // ── Edge cases ──
  {
    id: "edge-01",
    category: "edge-case",
    description: "Simple greeting — no tools needed",
    userMessage: "Hello!",
    expectedIntent: "greeting",
    expectedTools: [],
    expectedHandoff: false,
  },
  {
    id: "edge-02",
    category: "edge-case",
    description: "Vague message — should ask for clarification",
    userMessage: "I have a problem.",
    expectedIntent: "unclear",
    expectedTools: [],
    expectedHandoff: false,
  },
];
