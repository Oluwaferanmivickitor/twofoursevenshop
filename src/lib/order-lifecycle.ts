export const ORDER_STAGES = ["order_placed", "payment_confirmed", "processing", "packed", "shipped", "delivered"] as const;
export type OrderStage = typeof ORDER_STAGES[number] | "cancelled" | "refunded" | "payment_failed" | "awaiting_payment";
export type PaymentStatus = "awaiting_payment" | "paid" | "failed" | "refunded";
export const STAGE_LABELS: Record<OrderStage, string> = {
  order_placed: "New", payment_confirmed: "Payment confirmed", processing: "Processing", packed: "Ready for dispatch", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded", payment_failed: "Payment failed", awaiting_payment: "Awaiting payment",
};
export const PAYMENT_LABELS: Record<PaymentStatus, string> = { awaiting_payment: "Awaiting payment", paid: "Paid", failed: "Failed", refunded: "Refunded" };
export function nextOrderStage(stage: OrderStage): OrderStage | null {
  if (["order_placed", "awaiting_payment", "payment_failed"].includes(stage)) return "payment_confirmed";
  const index = ORDER_STAGES.findIndex(s => s === stage);
  return index >= 0 ? ORDER_STAGES[index + 1] ?? null : null;
}
export function validateOrderTransition(current: OrderStage, next: OrderStage, payment: PaymentStatus, courier = "", tracking = "") {
  if (current === "refunded" || current === "cancelled") throw new Error("This order is closed");
  if (next === "refunded" && payment !== "paid") throw new Error("Only paid orders can be refunded");
  if (next !== "cancelled" && next !== "refunded" && next !== "payment_failed" && next !== "awaiting_payment" && next !== nextOrderStage(current)) throw new Error("Advance one stage at a time");
  if (["processing", "packed", "shipped", "delivered"].includes(next) && payment !== "paid") throw new Error("Payment must be paid before processing or dispatch");
  if (next === "shipped" && (!courier.trim() || !tracking.trim())) throw new Error("Courier name and tracking number are required");
}
export const isLowStock = (quantity: number) => quantity > 0 && quantity < 5;
export const deliveryFee = (subtotal: number, fee: number, threshold: number) => threshold > 0 && subtotal >= threshold ? 0 : fee;
export type OrderItem = { slug: string; name: string; image?: string; size?: string; color?: string; priceNgn: number; quantity: number };
export type Order = {
  id: string; reference: string; full_name: string; email: string; phone: string; address: string; city: string; state: string; country: string; postal: string;
  items: OrderItem[]; subtotal_ngn: number; shipping_ngn: number; total_ngn: number; payment_method: string; receipt_path: string | null; created_at: string;
  delivery_location: string; lifecycle_status: OrderStage; payment_status: PaymentStatus; courier_name: string; tracking_number: string; internal_notes: string; stage_timestamps: Record<string, string>;
};