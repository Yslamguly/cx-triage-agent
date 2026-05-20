export interface Customer {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "suspended" | "churned";
  since: string;
}

const customers: Customer[] = [
  {
    id: "CUST-001",
    name: "Alice Johnson",
    email: "alice@example.com",
    plan: "pro",
    status: "active",
    since: "2024-03-15",
  },
  {
    id: "CUST-002",
    name: "Bob Smith",
    email: "bob@example.com",
    plan: "free",
    status: "active",
    since: "2025-01-10",
  },
  {
    id: "CUST-003",
    name: "Carol Davis",
    email: "carol@example.com",
    plan: "enterprise",
    status: "active",
    since: "2023-07-22",
  },
  {
    id: "CUST-004",
    name: "Dan Wilson",
    email: "dan@example.com",
    plan: "pro",
    status: "suspended",
    since: "2024-11-01",
  },
  {
    id: "CUST-005",
    name: "Eve Martinez",
    email: "eve@example.com",
    plan: "free",
    status: "churned",
    since: "2024-06-05",
  },
];

export function getCustomerByEmail(email: string): Customer | null {
  return customers.find((c) => c.email === email) ?? null;
}

export function getCustomerById(id: string): Customer | null {
  return customers.find((c) => c.id === id) ?? null;
}
