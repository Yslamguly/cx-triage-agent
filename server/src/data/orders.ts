export interface Order {
  id: string;
  customerId: string;
  items: string[];
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  trackingNumber: string | null;
  orderDate: string;
  deliveryDate: string | null;
}

const orders: Order[] = [
  {
    id: "ORD-1001",
    customerId: "CUST-001",
    items: ["Wireless Headphones", "USB-C Cable"],
    total: 89.99,
    status: "shipped",
    trackingNumber: "TRK-998877",
    orderDate: "2025-05-01",
    deliveryDate: null,
  },
  {
    id: "ORD-1002",
    customerId: "CUST-001",
    items: ["Laptop Stand"],
    total: 45.0,
    status: "delivered",
    trackingNumber: "TRK-665544",
    orderDate: "2025-04-15",
    deliveryDate: "2025-04-20",
  },
  {
    id: "ORD-1003",
    customerId: "CUST-002",
    items: ["Mechanical Keyboard", "Mouse Pad"],
    total: 134.5,
    status: "processing",
    trackingNumber: null,
    orderDate: "2025-05-18",
    deliveryDate: null,
  },
  {
    id: "ORD-1004",
    customerId: "CUST-003",
    items: ["Enterprise Server License"],
    total: 2499.0,
    status: "delivered",
    trackingNumber: "TRK-112233",
    orderDate: "2025-03-01",
    deliveryDate: "2025-03-05",
  },
  {
    id: "ORD-1005",
    customerId: "CUST-003",
    items: ["Monitor Arm", "Webcam HD"],
    total: 199.99,
    status: "shipped",
    trackingNumber: "TRK-445566",
    orderDate: "2025-05-10",
    deliveryDate: null,
  },
  {
    id: "ORD-1006",
    customerId: "CUST-004",
    items: ["Phone Case"],
    total: 19.99,
    status: "cancelled",
    trackingNumber: null,
    orderDate: "2025-05-12",
    deliveryDate: null,
  },
  {
    id: "ORD-1007",
    customerId: "CUST-005",
    items: ["Desk Lamp", "Notebook Set"],
    total: 62.0,
    status: "refunded",
    trackingNumber: "TRK-778899",
    orderDate: "2025-04-01",
    deliveryDate: "2025-04-06",
  },
];

export function getOrdersByCustomerId(customerId: string): Order[] {
  return orders.filter((o) => o.customerId === customerId);
}

export function getOrderById(orderId: string): Order | null {
  return orders.find((o) => o.id === orderId) ?? null;
}
