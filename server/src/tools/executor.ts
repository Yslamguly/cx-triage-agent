import { ToolCall, ToolResult, HandoffSummary } from "../types";
import { getCustomerByEmail, getCustomerById } from "../data/customers";
import { getOrderById, getOrdersByCustomerId } from "../data/orders";

export interface ExecutionOutcome {
  results: ToolResult[];
  handoff: HandoffSummary | null;
}

export function executeTools(toolCalls: ToolCall[]): ExecutionOutcome {
  const results: ToolResult[] = [];
  let handoff: HandoffSummary | null = null;

  for (const call of toolCalls) {
    let output: string;

    switch (call.name) {
      case "lookup_order":
        output = executeLookupOrder(call.arguments);
        break;
      case "get_account_info":
        output = executeGetAccountInfo(call.arguments);
        break;
      case "handoff_to_human":
        output = "Escalation initiated. A human agent will take over shortly.";
        handoff = {
          reason: (call.arguments.reason as string) || "unspecified",
          customerIntent: (call.arguments.customer_intent as string) || "unknown",
          actionsTaken: call.arguments.actions_taken
            ? (call.arguments.actions_taken as string).split(",").map((s) => s.trim())
            : [],
          summary: (call.arguments.summary as string) || "",
        };
        break;
      default:
        output = `Unknown tool: ${call.name}`;
    }

    results.push({ toolCallId: call.id, name: call.name, result: output });
  }

  return { results, handoff };
}

function executeLookupOrder(args: Record<string, unknown>): string {
  const orderId = args.order_id as string | undefined;
  const email = args.customer_email as string | undefined;

  if (orderId) {
    const order = getOrderById(orderId);
    if (!order) return `No order found with ID ${orderId}.`;
    return JSON.stringify(order);
  }

  if (email) {
    const customer = getCustomerByEmail(email);
    if (!customer) return `No customer found with email ${email}.`;
    const orders = getOrdersByCustomerId(customer.id);
    if (orders.length === 0) return `Customer ${customer.name} has no orders.`;
    return JSON.stringify(orders);
  }

  return "Please provide either an order_id or customer_email.";
}

function executeGetAccountInfo(args: Record<string, unknown>): string {
  const email = args.email as string | undefined;
  const customerId = args.customer_id as string | undefined;

  const customer = email
    ? getCustomerByEmail(email)
    : customerId
      ? getCustomerById(customerId)
      : null;

  if (!customer) return "No customer found with the provided information.";
  return JSON.stringify(customer);
}
