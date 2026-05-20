import { ToolDefinition } from "../types";

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "lookup_order",
    description:
      "Look up order information. Search by order ID for a specific order, or by customer email to get all orders for that customer.",
    parameters: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "The order ID (e.g. ORD-1001). Use this if the customer provides an order number.",
        },
        customer_email: {
          type: "string",
          description: "The customer's email address. Use this to find all orders for a customer.",
        },
      },
      required: [],
    },
  },
  {
    name: "get_account_info",
    description:
      "Retrieve customer account details including plan tier, account status, and membership date. Search by email or customer ID.",
    parameters: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "The customer's email address.",
        },
        customer_id: {
          type: "string",
          description: "The customer ID (e.g. CUST-001).",
        },
      },
      required: [],
    },
  },
  {
    name: "handoff_to_human",
    description:
      "Escalate the conversation to a human agent. Use this when: the customer is very frustrated, the issue requires actions you cannot perform (refunds, account changes), or you cannot resolve the issue with available tools.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Why escalation is needed (e.g. 'refund request', 'account suspension dispute', 'technical issue beyond scope').",
        },
        customer_intent: {
          type: "string",
          description: "What the customer is trying to accomplish.",
        },
        actions_taken: {
          type: "string",
          description: "Comma-separated list of actions the AI agent already took before escalating.",
        },
        summary: {
          type: "string",
          description: "Brief summary of the conversation for the human agent.",
        },
      },
      required: ["reason", "customer_intent", "summary"],
    },
  },
];
